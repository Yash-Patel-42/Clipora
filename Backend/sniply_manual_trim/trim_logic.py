from moviepy.editor import VideoFileClip
import os

def manual_trim_video(input_path, output_path, start, end):
    """
    Trims the video at input_path from start to end seconds and saves to output_path.
    Raises Exception on error.
    """
    clip = VideoFileClip(input_path)
    duration = clip.duration
    # Clamp start and end
    start = max(0, min(float(start), duration))
    end = max(start, min(float(end), duration))
    if start >= end:
        clip.close()
        raise Exception("End time must be greater than start time.")
    trimmed = clip.subclip(start, end)
    trimmed.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    trimmed.close()
    if not os.path.exists(output_path):
        raise Exception("Trimmed video was not created.")
    return output_path 