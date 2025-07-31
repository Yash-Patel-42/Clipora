from ffmpeg import FFmpeg
import os
def apply_caption(input_vid, subs, outpath):
    """
    Burn .ass subtitles into a video using FFmpeg.
    Args:
        input_vid (str): Path to input video.
        subs (str): Path to .ass subtitle file.
        outpath (str): Path to output video.
    Returns:
        int: 1 on success, 0 on failure.
    """
    try:
        input_vid = os.path.abspath(input_vid).replace("\\", "/")
        subs = os.path.abspath(subs).replace("\\", "/")
        outpath = os.path.abspath(outpath).replace("\\", "/")
        # Ensure output directory exists
        output_dir = os.path.dirname(outpath)
        os.makedirs(output_dir, exist_ok=True)
        ffmpeg = FFmpeg().input(input_vid) \
            .output(outpath, vf=f"subtitles='{subs}'", vcodec="libx264", acodec="copy")
        ffmpeg.execute()
        return 1
    except Exception as e:
        print(f"Error applying captions: {e}")
        return 0