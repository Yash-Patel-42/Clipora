from moviepy.editor import VideoFileClip, concatenate_videoclips
import numpy as np
import os

def smart_trim_video(input_path, output_path, sample_rate=0.1, threshold=0.01, silence_min_duration=1.5):
    """
    Trims silent parts from the video at input_path and saves the result to output_path.
    Raises Exception on error.
    """
    clip = VideoFileClip(input_path)
    if clip.audio is None:
        clip.close()
        raise Exception("No audio track found in this video.")
    original_fps = clip.fps
    original_size = (clip.w, clip.h)
    is_silent = []
    for t in np.arange(0, clip.duration, sample_rate):
        frame = clip.audio.get_frame(t)
        rms = np.sqrt(np.mean(np.square(frame))) if isinstance(frame, (list, tuple, np.ndarray)) else 0
        is_silent.append(rms < threshold)
    silent_blocks = []
    current_silence_start = None
    times = np.arange(0, clip.duration, sample_rate)
    for idx, silent in enumerate(is_silent):
        t = times[idx]
        if silent:
            if current_silence_start is None:
                current_silence_start = t
        else:
            if current_silence_start is not None:
                if t - current_silence_start >= silence_min_duration:
                    silent_blocks.append((current_silence_start, t))
                current_silence_start = None
    if current_silence_start is not None:
        if clip.duration - current_silence_start >= silence_min_duration:
            silent_blocks.append((current_silence_start, clip.duration))
    keep_ranges = []
    last_end = 0
    for start, end in silent_blocks:
        if start > last_end:
            keep_ranges.append((last_end, start))
        last_end = end
    if last_end < clip.duration:
        keep_ranges.append((last_end, clip.duration))
    chunks = [clip.subclip(start, end) for start, end in keep_ranges if end > start]
    if not chunks:
        clip.close()
        raise Exception("No non-silent segments found.")
    final = concatenate_videoclips(chunks)
    final = final.resize(newsize=original_size)
    final.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        threads=4,
        preset="veryslow",
        bitrate="20M",
        fps=original_fps,
        ffmpeg_params=["-crf", "18"]
    )
    clip.close()
    final.close()
    if not os.path.exists(output_path):
        raise Exception("Smart trimmed video was not created.")
    return output_path 