import os
import cv2
import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf
from moviepy import VideoFileClip, AudioFileClip

def main(input_path):
    DIR = os.path.dirname(os.path.abspath(input_path))
    # ---------------- STEP 1: Extract and Reduce Audio ----------------
    print("Extracting audio...")
    video = VideoFileClip(input_path)
    audio = video.audio
    if audio is not None:
        audio.write_audiofile(os.path.join(DIR, "input_audio.wav"))

        print("Reducing audio noise...")
        y, sr = librosa.load(os.path.join(DIR, "input_audio.wav"), sr=None)
        reduced_audio = nr.reduce_noise(y=y, sr=sr)
        sf.write(os.path.join(DIR, "reduced_audio.wav"), reduced_audio, sr)
        audio_available = True
    else:
        print("Warning: Input video has no audio track. Skipping audio extraction and noise reduction.")
        audio_available = False

    # ---------------- STEP 2: Read and Denoise Video Frames ----------------
    print("Reading video frames...")
    cap = cv2.VideoCapture(input_path)
    frames = []
    # Get original width and height
    orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # Resize to original size (in case frames are not already the same size)
        frame = cv2.resize(frame, (orig_width, orig_height))
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()

    if len(frames) == 0:
        raise ValueError("No frames found in video.")

    print("Denoising video frames...")
    def denoise_video_opencv(frames, h=10, hColor=10, templateWindowSize=7, searchWindowSize=21):
        denoised = []
        for i, frame in enumerate(frames):
            denoised_frame = cv2.fastNlMeansDenoisingColored(frame, None, h, hColor, templateWindowSize, searchWindowSize)
            denoised.append(denoised_frame)
        return denoised

    denoised_frames = denoise_video_opencv(frames)

    # ---------------- STEP 3: Save Denoised Video ----------------
    print("Saving denoised video...")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(os.path.join(DIR, "denoised_video.mp4"), fourcc, 30, (orig_width, orig_height))
    for frame in denoised_frames:
        out.write(cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
    out.release()

    # ---------------- STEP 4: Combine Denoised Video + Reduced Audio ----------------
    print("Merging reduced audio with video...")
    video = VideoFileClip(os.path.join(DIR, "denoised_video.mp4"))
    if audio_available:
        audio = AudioFileClip(os.path.join(DIR, "reduced_audio.wav"))
        final_video = video.with_audio(audio)
    else:
        final_video = video
    final_video.write_videofile(os.path.join(DIR, "output_final.mp4"), codec="libx264", audio_codec="aac")
    print("✅ Denoising complete. Final output: output_final.mp4")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python denoise_video.py <input_video_path>")
    else:
        main(sys.argv[1]) 