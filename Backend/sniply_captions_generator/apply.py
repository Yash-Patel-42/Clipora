from ffmpeg import FFmpeg

def apply_caption(input_vid,subs,outpath):
    try:
        ffmpeg = FFmpeg().input(input_vid) \
            .output(f"{outpath}", 
                    vf=f"subtitles={subs}", 
                    vcodec="libx264", 
                    acodec="copy")
        ffmpeg.execute()
    except:
        return 0