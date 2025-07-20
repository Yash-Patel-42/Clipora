import os
from .text import create_ass_file_with_multiple_styles_from_text
import subprocess
# from ffmpeg import ffmpeg
from pysubs2 import Color, Alignment
# from ffmpeg import FFmpeg
import platform

def ffmpeg_text(input_vid, ass_path, outpath):
    try:
        # Use the directory of the input video/ass file
        workdir = os.path.dirname(input_vid)
        input_vid_name = os.path.basename(input_vid)
        ass_name = os.path.basename(ass_path)
        # Output path can be absolute
        cmd = [
            "ffmpeg", "-y", "-i", input_vid_name,
            "-vf", f"ass={ass_name}",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-b:a", "128k",
            outpath
        ]
        print(f"Running (cwd={workdir}):", " ".join(cmd))
        subprocess.run(" ".join(cmd), check=True, shell=True, cwd=workdir)
        return 1
    except Exception as e:
        print("ffmpeg_text error:", e)
        return 0

def apply_text(vid_input, text , startTime, endTime, outpath, fontname: str = "Arial", fontsize: int = 28, primarycolor=None, outlinecolor=None, backcolor=None, alignment=None, outline: int = 2, shadow: int = 2):
    if primarycolor is None:
        primarycolor = Color(255, 255, 255, 0)
    if outlinecolor is None:
        outlinecolor = Color(0, 0, 0, 0)
    if backcolor is None:
        backcolor = Color(0, 0, 0, 128)
    if alignment is None:
        alignment = Alignment.BOTTOM_CENTER
    base_name, _ = os.path.splitext(vid_input)
    textoutpath = base_name + ".ass"

    textass = create_ass_file_with_multiple_styles_from_text(text, startTime , endTime, textoutpath, fontname, fontsize, primarycolor, outlinecolor, backcolor, alignment, outline, shadow)
    if textass == 0:
        print ("text generation failed")
        return 0
    output = ffmpeg_text(vid_input, textoutpath, outpath)
    if output == 0:
        print("video generation failed")
        return 0
    return outpath
