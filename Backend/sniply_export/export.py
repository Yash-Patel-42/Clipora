from moviepy.editor import VideoFileClip
from PIL import Image
import numpy as np
import os

def export_video(input_path, output_path, resolution='1080p'):
    print(f"Loading video: {input_path}")
    # Load the video clip
    clip = VideoFileClip(input_path)
    # Resize based on the resolution
    if resolution == '1080p':
        new_size = (1920, 1080)
    elif resolution == '720p':
        new_size = (1280, 720)
    elif resolution == '480p':
        new_size = (854, 480)
    else:
        print("Resolution not recognized. Using original size.")
        new_size = clip.size
    # Manually apply resizing using LANCZOS method (corrected)
    clip_resized = clip.fl_image(lambda image: np.array(Image.fromarray(image).resize(new_size, Image.Resampling.LANCZOS)))
    # Write the output video file
    clip_resized.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    clip_resized.close()
    if not os.path.exists(output_path):
        raise Exception("Exported video was not created.")
    return output_path

if __name__ == "__main__":
    export_video("video.mp4", "output_video_1080p.mp4", resolution='1080p')
