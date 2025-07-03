import os
import cv2
import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf
from moviepy import VideoFileClip, AudioFileClip
# FastDVDnet imports
import torch
from fastdvdnet.models import FastDVDnet
from fastdvdnet.fastdvdnet import denoise_seq_fastdvdnet

def print_progress(step, total_steps, description="Progress"):
    if total_steps == 0:
        return
    percent = int((step / total_steps) * 100)
    print(f"{description}: {percent}% ({step}/{total_steps})", end='\\r')

def main(input_path):
    DIR = os.path.dirname(os.path.abspath(input_path))
    total_steps = 3
    current_step = 1

    # ---------------- STEP 1: Extract and Reduce Audio ----------------
    print(f"Step {current_step}/{total_steps}: Processing audio...")
    video = VideoFileClip(input_path)
    audio = video.audio
    audio_available = False
    if audio is not None:
        try:
            audio_path = os.path.join(DIR, "input_audio.wav")
            reduced_audio_path = os.path.join(DIR, "reduced_audio.wav")
            audio.write_audiofile(audio_path)
            y, sr = librosa.load(audio_path, sr=None)
            reduced_noise = nr.reduce_noise(y=y, sr=sr)
            sf.write(reduced_audio_path, reduced_noise, sr)
            audio_available = True
        except Exception as e:
            print(f"Warning: Could not process audio: {e}")
            audio_available = False
    else:
        print("Warning: Input video has no audio track.")
    print(f"Step {current_step}/{total_steps} complete.\n")
    current_step += 1

    # ---------------- STEP 2: Denoise Video Frames ----------------
    print(f"Step {current_step}/{total_steps}: Denoising video frames...")

    # Choose denoising method
    USE_OPENCV_DENOISING = True  # Set to False to use FastDVDnet

    # Read all frames into memory
    cap = cv2.VideoCapture(input_path)
    orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()

    denoised_video_path = os.path.join(DIR, "denoised_video.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(denoised_video_path, fourcc, fps, (orig_width, orig_height))

    if USE_OPENCV_DENOISING:
        print("Using OpenCV fastNlMeansDenoisingColored...")
        def denoise_video_opencv(frames, h=10, hColor=10, templateWindowSize=7, searchWindowSize=21):
            denoised = []
            for i, frame in enumerate(frames):
                denoised_frame = cv2.fastNlMeansDenoisingColored(frame, None, h, hColor, templateWindowSize, searchWindowSize)
                denoised.append(denoised_frame)
                if (i+1) % 10 == 0 or i == len(frames)-1:
                    print(f'OpenCV: Denoised {i+1}/{len(frames)} frames')
            return denoised
        denoised_frames = denoise_video_opencv(frames)
        for i, frame in enumerate(denoised_frames):
            print(f'Frame {i+1}/{len(denoised_frames)}: shape={frame.shape}, dtype={frame.dtype}')
            out.write(cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
    else:
        print("Using FastDVDnet deep learning denoising...")
        # Init model
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {device}")
        model = FastDVDnet(num_input_frames=5)
        model_path = os.path.join(os.path.dirname(__file__), 'fastdvdnet', 'model.pth')
        state_dict = torch.load(model_path, map_location=device)
        from collections import OrderedDict
        new_state_dict = OrderedDict()
        for k, v in state_dict.items():
            name = k[7:] if k.startswith('module.') else k # remove `module.`
            new_state_dict[name] = v
        model.load_state_dict(new_state_dict)
        model = model.to(device)
        model.eval()
        temp_psz = 5
        ctrlfr_idx = temp_psz // 2
        noise_std = torch.FloatTensor([25/255.]).to(device)
        total = len(frames)
        with torch.no_grad():
            for i in range(total):
                # Build window with reflection at borders
                window = []
                for j in range(i - ctrlfr_idx, i + ctrlfr_idx + 1):
                    idx = min(max(j, 0), total - 1)  # reflect at borders
                    window.append(frames[idx])
                window_np = np.stack([f.transpose(2, 0, 1) for f in window], axis=0)  # [5, 3, H, W]
                window_np = window_np.astype(np.float32) / 255.0
                seq = torch.from_numpy(window_np).to(device)
                seq = seq.unsqueeze(0)  # [1, 5, 3, H, W]
                seq = seq.squeeze(0)    # [5, 3, H, W] for denoise_seq_fastdvdnet
                # FastDVDnet expects [numframes, C, H, W]
                denoised = denoise_seq_fastdvdnet(seq, noise_std, temp_psz, model)  # [5, 3, H, W]
                # Write only the center frame
                center_frame = denoised[ctrlfr_idx].cpu().numpy()
                center_frame = (center_frame * 255).astype(np.uint8).transpose(1, 2, 0)
                print(f'Frame {i+1}/{total}: shape={center_frame.shape}, dtype={center_frame.dtype}')
                out.write(cv2.cvtColor(center_frame, cv2.COLOR_RGB2BGR))
                if (i+1) % 10 == 0 or i == total-1:
                    print(f'FastDVDnet: Denoised {i+1}/{total} frames')
        torch.cuda.empty_cache()
    out.release()
    print(f"\nStep {current_step}/{total_steps} complete.\n")
    current_step += 1

    # ---------------- STEP 3: Combine Denoised Video + Reduced Audio ----------------
    print(f"Step {current_step}/{total_steps}: Merging audio and video...")
    final_video = VideoFileClip(denoised_video_path)
    if audio_available:
        audio = AudioFileClip(os.path.join(DIR, "reduced_audio.wav"))
        final_video = final_video.set_audio(audio)
    else:
        pass # No audio to merge

    final_output_path = os.path.join(DIR, "output_final.mp4")
    final_video.write_videofile(final_output_path, codec="libx264", audio_codec="aac")
    print(f"\n✅ Denoising complete. Final output: {final_output_path}\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python denoise_video.py <input_video_path>")
    else:
        main(sys.argv[1]) 