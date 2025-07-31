import os
import uuid
from pydub import AudioSegment, silence
from moviepy.editor import VideoFileClip, concatenate_videoclips
import tempfile
import subprocess

def extract_audio(input_video_path, output_audio_path):
    command = [
        "ffmpeg", "-y",
        "-i", input_video_path,
        "-vn",  # no video
        "-ac", "1",  # mono
        "-ar", "16000",
        "-f", "wav",
        output_audio_path
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def smart_trim_video(input_path, output_path, silence_thresh_db=-35, min_silence_len=1500):
    temp_audio_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4().hex}_audio.wav")
    extract_audio(input_path, temp_audio_path)

    audio = AudioSegment.from_wav(temp_audio_path)
    
    # Detect non-silent chunks
    nonsilent_ranges = silence.detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=silence_thresh_db
    )

    if not nonsilent_ranges:
        raise Exception("No non-silent segments found.")

    # Merge small silent gaps by padding start and end
    padded_ranges = []
    padding = 200  # milliseconds
    for start, end in nonsilent_ranges:
        padded_start = max(0, start - padding)
        padded_end = min(len(audio), end + padding)
        padded_ranges.append((padded_start / 1000.0, padded_end / 1000.0))  # convert to seconds

    clip = VideoFileClip(input_path)
    subclips = [clip.subclip(start, end) for start, end in padded_ranges if end > start]

    if not subclips:
        raise Exception("No valid video segments after trimming.")

    final = concatenate_videoclips(subclips)
    final.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        threads=4,
        preset="veryslow",
        bitrate="20M",
        ffmpeg_params=["-crf", "18"]
    )

    clip.close()
    final.close()
    os.remove(temp_audio_path)

    if not os.path.exists(output_path):
        raise Exception("Smart trimmed video was not created.")

    return output_path
