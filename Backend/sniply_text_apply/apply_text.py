import ffmpeg
import os


def apply_text_to_video_ffmpeg(
    input_path: str,
    text: str,
    output_path: str,
    font_size: int = 64,
    font_color: str = "white",
    box_color: str = "black@0.5",
    box_border: int = 20,
    position: str = "bottom",
):
    DEFAULTS = {
        "font_size": 64,
        "font_color": "white",
        "box_color": "black@0.5",
        "box_border": 20,
        "position": "bottom",
        "text": "Sample Text",
    }
    SAFE_COLORS = {
        "aliceblue",
        "antiquewhite",
        "aqua",
        "aquamarine",
        "azure",
        "beige",
        "bisque",
        "black",
        "blanchedalmond",
        "blue",
        "blueviolet",
        "brown",
        "burlywood",
        "cadetblue",
        "chartreuse",
        "chocolate",
        "coral",
        "cornflowerblue",
        "cornsilk",
        "crimson",
        "cyan",
        "darkblue",
        "darkcyan",
        "darkgoldenrod",
        "darkgray",
        "darkgreen",
        "darkgrey",
        "darkkhaki",
        "darkmagenta",
        "darkolivegreen",
        "darkorange",
        "darkorchid",
        "darkred",
        "darksalmon",
        "darkseagreen",
        "darkslateblue",
        "darkslategray",
        "darkslategrey",
        "darkturquoise",
        "darkviolet",
        "deeppink",
        "deepskyblue",
        "dimgray",
        "dimgrey",
        "dodgerblue",
        "firebrick",
        "floralwhite",
        "forestgreen",
        "fuchsia",
        "gainsboro",
        "ghostwhite",
        "gold",
        "goldenrod",
        "gray",
        "grey",
        "green",
        "greenyellow",
        "honeydew",
        "hotpink",
        "indianred",
        "indigo",
        "ivory",
        "khaki",
        "lavender",
        "lavenderblush",
        "lawngreen",
        "lemonchiffon",
        "lightblue",
        "lightcoral",
        "lightcyan",
        "lightgoldenrodyellow",
        "lightgray",
        "lightgreen",
        "lightgrey",
        "lightpink",
        "lightsalmon",
        "lightseagreen",
        "lightskyblue",
        "lightslategray",
        "lightslategrey",
        "lightsteelblue",
        "lightyellow",
        "lime",
        "limegreen",
        "linen",
        "magenta",
        "maroon",
        "mediumaquamarine",
        "mediumblue",
        "mediumorchid",
        "mediumpurple",
        "mediumseagreen",
        "mediumslateblue",
        "mediumspringgreen",
        "mediumturquoise",
        "mediumvioletred",
        "midnightblue",
        "mintcream",
        "mistyrose",
        "moccasin",
        "navajowhite",
        "navy",
        "oldlace",
        "olive",
        "olivedrab",
        "orange",
        "orangered",
        "orchid",
        "palegoldenrod",
        "palegreen",
        "paleturquoise",
        "palevioletred",
        "papayawhip",
        "peachpuff",
        "peru",
        "pink",
        "plum",
        "powderblue",
        "purple",
        "rebeccapurple",
        "red",
        "rosybrown",
        "royalblue",
        "saddlebrown",
        "salmon",
        "sandybrown",
        "seagreen",
        "seashell",
        "sienna",
        "silver",
        "skyblue",
        "slateblue",
        "slategray",
        "slategrey",
        "snow",
        "springgreen",
        "steelblue",
        "tan",
        "teal",
        "thistle",
        "tomato",
        "turquoise",
        "violet",
        "wheat",
        "white",
        "whitesmoke",
        "yellow",
        "yellowgreen",
    }

    def validate_color(c, default):
        """Validate color; fallback if invalid"""
        try:
            if not isinstance(c, str) or not c.strip():
                raise ValueError
            base = c.split("@")[0].lower()
            if base.startswith("#"):  # allow hex like #00FF00
                return c
            if base not in SAFE_COLORS:
                raise ValueError
            return c
        except Exception:
            print(f"Invalid color '{c}' — falling back to '{default}'")
            return default

    def validate_int(n, default, min_val=1, max_val=500):
        """Ensure integer within reasonable range"""
        try:
            n = int(n)
            if n < min_val or n > max_val:
                raise ValueError
            return n
        except Exception:
            print(f"Invalid numeric value '{n}' — falling back to {default}")
            return default

    def validate_position(p, default):
        """Ensure position is one of 'top', 'center', 'bottom'"""
        p = str(p).lower()
        if p not in {"top", "center", "bottom"}:
            print(f"Invalid position '{p}' — falling back to '{default}'")
            return default
        return p

    def validate_text(t, default):
        """Ensure text is a valid non-empty string"""
        if not isinstance(t, str) or not t.strip():
            print(f"Invalid or empty text — falling back to default text.")
            return default
        return t

    text = validate_text(text, DEFAULTS["text"])
    font_color = validate_color(font_color, DEFAULTS["font_color"])
    box_color = validate_color(box_color, DEFAULTS["box_color"])
    font_size = validate_int(font_size, DEFAULTS["font_size"])
    box_border = validate_int(box_border, DEFAULTS["box_border"])
    position = validate_position(position, DEFAULTS["position"])
    safe_text = text.replace(":", "\\:").replace("'", "\\'")
    y_expr = {"top": "80", "center": "(h-text_h)/2", "bottom": "h-text_h-80"}[position]
    drawtext_filter = (
        f"drawtext=text='{safe_text}':"
        f"fontsize={font_size}:"
        f"fontcolor={font_color}:"
        f"x=(w-text_w)/2:"
        f"y={y_expr}:"
        f"box=1:boxcolor={box_color}:boxborderw={box_border}"
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
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

    print(f"Text applied successfully to {output_path}")
