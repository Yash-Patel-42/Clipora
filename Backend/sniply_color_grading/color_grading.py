import os
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from tempfile import NamedTemporaryFile
from moviepy.editor import VideoFileClip
import shutil
import sys

# app = FastAPI()

def apply_clahe_to_frame(frame):
    # Convert to LAB color space
    lab = cv2.cvtColor(frame, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    # Stronger CLAHE (increase contrast)
    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(4,4))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
    # Convert to HSV to adjust saturation and brightness
    hsv = cv2.cvtColor(enhanced, cv2.COLOR_RGB2HSV).astype(np.float32)
    # Boost saturation (scale it up to 1.4x)
    hsv[:, :, 1] *= 1.4
    # Slight brightness increase (value channel)
    hsv[:, :, 2] *= 1.1
    # Clip the values to valid range [0,255]
    hsv = np.clip(hsv, 0, 255).astype(np.uint8)
    enhanced = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    return enhanced


def color_grade_video(input_path, output_path):
    clip = VideoFileClip(input_path)
    fps = clip.fps
    width, height = clip.size
    temp_frames = []
    for i, frame in enumerate(clip.iter_frames()):
        enhanced = apply_clahe_to_frame(frame)
        temp_frames.append(enhanced)
        if (i+1) % 30 == 0:
            print(f"Processed {i+1} frames...")
    # Write video
    from moviepy.video.io.ImageSequenceClip import ImageSequenceClip
    graded_clip = ImageSequenceClip(temp_frames, fps=fps)
    # Set audio if present
    if clip.audio is not None:
        graded_clip = graded_clip.set_audio(clip.audio)
    graded_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    graded_clip.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python color_grading.py <input_video> <output_video>")
        sys.exit(1)
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    print(f"Color grading {input_path} -> {output_path}")
    color_grade_video(input_path, output_path)
    print(f"Done. Output saved to {output_path}") 