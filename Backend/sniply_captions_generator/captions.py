# from model_selector import get_model
from faster_whisper import WhisperModel
import pysubs2
from pysubs2 import Alignment, Color, SSAStyle, SSAEvent
import logging
logging.basicConfig(level=logging.DEBUG)
modelSize="large"
model = WhisperModel(modelSize, device="auto", compute_type="int8")

def transcribe(audio_filename):
    try:
        segments, info = model.transcribe(audio_filename, word_timestamps = True)
        return segments
    except:
        return 0


def create_ass_file_with_multiple_styles(segments ,output_filename: str = "multi_style_example.ass", fontname: str = "Arial", fontsize: int = 28, primarycolor: Color = Color(255, 255, 255, 0), outlinecolor: Color = Color(0, 0, 0, 0), backcolor: Color = Color(0, 0, 0, 128), alignment: Alignment = Alignment.BOTTOM_CENTER, outline: int = 2, shadow: int = 2):
    """
    Creates an .ass file demonstrating the use of multiple distinct styles.
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

    for segment in segments:
        print("it is ",segment.text)
        subs.append(pysubs2.SSAEvent(
            start=int(segment.start * 1000),
            end=int(segment.end * 1000) ,
            text=segment.text.strip(),
            ))
    try:
        subs.save(output_filename)
        print(f"Successfully created '{output_filename}' with styled captions.")
        return 1
    except Exception as e:
        print(f"Error saving file: {e}")
        return 0


# segments  = transcribe("/home/user/subs/audio3.mp3")
# create_ass_file_with_multiple_styles(segments, output_filename="multi_style_example2.ass")

if __name__ == "__main__":
    segments  = transcribe("/home/user/subs/audio3.mp3")
    create_ass_file_with_multiple_styles(segments, output_filename="multi_style_example2.ass")

# for segment in segments:
#     print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

# transcribe("/home/user/subs/audio2.mp3")