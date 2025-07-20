from .vid_to_audio import *
from .captions import *
from .apply import *
from faster_whisper import WhisperModel
import pysubs2
from pysubs2 import Alignment, Color, SSAStyle, SSAEvent
import logging
logging.basicConfig(level=logging.DEBUG)
# Remove model instantiation here; use lazy loading in captions.py

def asspath(input):
    base_name, _ = os.path.splitext(input)
    outpath = base_name + ".ass"
    return outpath

def generate_captions(input, outpath,fontname = "Arial", fontsize = 28, primarycolor = Color(255, 255, 255, 0), outlinecolor = Color(0, 0, 0, 0), backcolor = Color(0, 0, 0, 128), alignment = Alignment.BOTTOM_CENTER, outline = 2, shadow = 2):
    audiopath = vid_to_audio.v2a(input)
    if audiopath == 0:
        return "segments generation failed"
    segments = captions.transcribe(audiopath)
    if segments == 0:
        return "segments generation failed"
    srt = captions.create_ass_file_with_multiple_styles(segments, asspath(input), fontname, fontsize, primarycolor, outlinecolor, backcolor, alignment, outline, shadow)
    if srt == 0:
        return "caption generation failed"
    videoout = apply.apply_caption(input, asspath(input), outpath)
    if videoout == 0:
        return 0
    else:
        return videoout

    
