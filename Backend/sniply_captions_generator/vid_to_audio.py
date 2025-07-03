import os
from ffmpeg import FFmpeg

def v2a(input):
    try:
        base_name, _ = os.path.splitext(input)
        outpath = base_name + ".mp3"

        outpath = "/home/user/subs/audio3.mp3"
        ffmpeg = FFmpeg().input(f"{input}") \
            .output(f"{outpath}", vn=None, acodec="copy")

        ffmpeg.execute()
        return outpath
    except:
        return 0
