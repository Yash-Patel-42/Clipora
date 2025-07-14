import pysubs2
from pysubs2 import Alignment, Color, SSAStyle, SSAEvent

def create_ass_file_with_multiple_styles_from_text(text , startTime, endTime, output_filename: str = "text_style_example.ass", fontname: str = "Arial", fontsize: int = 28, primarycolor: Color = Color(255, 255, 255, 0), outlinecolor: Color = Color(0, 0, 0, 0), backcolor: Color = Color(0, 0, 0, 128), alignment: Alignment = Alignment.BOTTOM_CENTER, outline: int = 2, shadow: int = 2):
    """
    CReate an ass of text to be applied
    """
    subs = pysubs2.SSAFile()
     # --- 1. Define and add your first style: "Default" ---
    default_style = SSAStyle(
        fontname=fontname,
        fontsize=fontsize,
        primarycolor=primarycolor,  # White
        outlinecolor=outlinecolor,      # Black outline
        backcolor=backcolor,      # Semi-transparent black background
        alignment=alignment,
        outline=outline,
        shadow=shadow,
        marginl=20, 
        marginr=20, 
        marginv=20
    )
    subs.styles["Default"] = default_style # Name this style "Default"

    subs.append(pysubs2.SSAEvent(
        start=int(startTime * 1000),
        end=int(endTime * 1000),
        text=text,
        ))
    try:
        subs.save(output_filename)
        print(f"Successfully created '{output_filename}' with styled captions.")
        return 1
    except Exception as e:
        print(f"Error saving file: {e}")
        return 0
