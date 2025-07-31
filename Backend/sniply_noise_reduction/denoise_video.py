import os
import cv2
import numpy as np
import subprocess
import soundfile as sf
from pydub import AudioSegment
import noisereduce as nr
import sys

cv2.setNumThreads(4)


def print_progress(step, total_steps, description="Progress"):
    if total_steps == 0:
        return
    percent = int((step / total_steps) * 100)
    print(f"{description}: {percent}% ({step}/{total_steps})", end='\r')


def reduce_audio_noise(input_audio_path, output_audio_path):
    audio = AudioSegment.from_file(input_audio_path)
    samples = np.array(audio.get_array_of_samples()).astype(np.float32)
    sample_rate = audio.frame_rate
    samples = samples / (2 ** 15)
    reduced = nr.reduce_noise(y=samples, sr=sample_rate, prop_decrease=1.0)
    reduced = (reduced * (2 ** 15)).astype(np.int16)
    sf.write(output_audio_path, reduced, sample_rate)


def extract_audio(input_video_path, output_audio_path):
    command = [
        "ffmpeg", "-y",
        "-i", input_video_path,
        "-vn",
        "-ac", "1",
        "-ar", "16000",
        output_audio_path
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def merge_audio_video(video_path, audio_path, output_path):
    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        output_path
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def denoise_video_opencv(input_path, output_path):
    cap = cv2.VideoCapture(input_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        denoised = cv2.fastNlMeansDenoisingColored(
            rgb, None, h=10, hColor=10, templateWindowSize=7, searchWindowSize=21)
        out.write(cv2.cvtColor(denoised, cv2.COLOR_RGB2BGR))
        frame_num += 1
        if frame_num % 10 == 0:
            print(f"Denoised frame {frame_num}")

    cap.release()
    out.release()


def main(input_path, output_path=None):
    DIR = os.path.dirname(os.path.abspath(input_path))
    if output_path is None:
        output_path = os.path.join(DIR, "output_final.mp4")

    total_steps = 3
    current_step = 1

    # Step 1: Audio Processing
    print(f"Step {current_step}/{total_steps}: Processing audio...")
    audio_path = os.path.join(DIR, "input_audio.wav")
    reduced_audio_path = os.path.join(DIR, "reduced_audio.wav")
    audio_available = False
    try:
        extract_audio(input_path, audio_path)
        reduce_audio_noise(audio_path, reduced_audio_path)
        audio_available = True
    except Exception as e:
        print(f"Warning: Audio processing failed: {e}")
    print(f"Step {current_step}/{total_steps} complete.\n")
    current_step += 1

    # Step 2: Video Denoising
    print(f"Step {current_step}/{total_steps}: Denoising video frames...")
    denoised_video_path = os.path.join(DIR, "denoised_video.mp4")
    denoise_video_opencv(input_path, denoised_video_path)
    print(f"Step {current_step}/{total_steps} complete.\n")
    current_step += 1

    # Step 3: Merge Audio + Video
    print(f"Step {current_step}/{total_steps}: Merging audio and video...")
    if audio_available:
        merge_audio_video(denoised_video_path, reduced_audio_path, output_path)
    else:
        os.rename(denoised_video_path, output_path)
    print(f"\n✅ Denoising complete. Final output: {output_path}\n")


if __name__ == "__main__":
    if len(sys.argv) == 2:
        main(sys.argv[1])
    elif len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python denoise_video.py <input_path> [output_path]")
