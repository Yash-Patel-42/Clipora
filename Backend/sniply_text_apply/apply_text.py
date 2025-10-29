import ffmpeg
import os


def apply_text_to_video_ffmpeg(
    input_path: str,
    text: str,
    output_path: str,
    font_size: int = 64,
    font_color: str = "white",
    box_color: str = "black@0.5",  # semi-transparent background box
    box_border: int = 20,
    position: str = "bottom",  # "top", "center", or "bottom"
):
    """
    Overlay text on video using FFmpeg with flexible styling.
    Works with FFmpeg 6+ and ffmpeg-python 0.2+.
    """

    # Escape special characters in text (FFmpeg syntax requirement)
    safe_text = text.replace(":", "\\:").replace("'", "\\'")

    # Set Y-position based on user choice
    y_expr = {"top": "80", "center": "(h-text_h)/2", "bottom": "h-text_h-80"}.get(
        position, "h-text_h-80"
    )

    # Build FFmpeg filter
    drawtext_filter = (
        f"drawtext=text='{safe_text}':"
        f"fontsize={font_size}:"
        f"fontcolor={font_color}:"
        f"x=(w-text_w)/2:"
        f"y={y_expr}:"
        f"box=1:boxcolor={box_color}:boxborderw={box_border}"
    )

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Process video
    (
        ffmpeg.input(input_path)
        .output(
            output_path,
            vf=drawtext_filter,
            vcodec="libx264",
            acodec="aac",
            movflags="+faststart",
        )
        .overwrite_output()
        .run(quiet=False)
    )

    print(f"✅ Text applied successfully to {output_path}")
