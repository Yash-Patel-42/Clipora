from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import sys
import traceback

os.environ["CUDA_VISIBLE_DEVICES"] = ""
sys.path.append(os.path.join(os.path.dirname(__file__), "sniply_bg_remover"))
sys.path.append(os.path.join(os.path.dirname(__file__), "sniply_noise_reduction"))
sys.path.append(os.path.join(os.path.dirname(__file__), "sniply_text_apply"))
sys.path.append(os.path.join(os.path.dirname(__file__), "sniply_bg_removal_icon"))

from sniply_bg_remover.bg_removal import run_bg_removal_pipeline
from sniply_text_apply.apply_text import (
    apply_text_to_video_ffmpeg as apply_text_to_video,
)
from sniply_bg_removal_icon.remove_icon_bg import remove_background_from_media

from sniply_noise_reduction.denoise_video import fast_denoise

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# Processor registry
PROCESSORS = {}


def register_processor(name):
    def decorator(func):
        PROCESSORS[name] = func
        return func

    return decorator


@register_processor("bg_remover")
def process_bg_remover(input_path, output_path):
    run_bg_removal_pipeline(input_video=input_path, output_video=output_path)
    return output_path


@register_processor("noise_reduction")
def process_noise_reduction(input_path, output_path):
    try:
        fast_denoise(input_path)
        denoised_file_path = os.path.join(
            os.path.dirname(input_path), "output_final.mp4"
        )
        shutil.move(denoised_file_path, output_path)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Noise reduction failed: {str(e)}")

    return output_path


@register_processor("text_apply")
def process_text_apply(
    input_path,
    output_path,
    text,
    font_size,
    font_color,
    box_color,
    box_border,
    position,
):
    apply_text_to_video(
        input_path=input_path,
        text=text,
        output_path=output_path,
        font_size=font_size,
        font_color=font_color,
        box_color=box_color,
        box_border=box_border,
        position=position,
    )
    return output_path


@register_processor("bg_remover_icon")
def process_bg_remover_icon(input_path, output_path):
    remove_background_from_media(input_path, output_path)
    return output_path


@app.post("/process/{processor_name}")
async def process_video(
    processor_name: str,
    file: UploadFile = File(...),
    text: str = Form(None),
    font_size: int = Form(64),
    font_color: str = Form("white"),
    box_color: str = Form("black@0.5"),
    box_border: int = Form(20),
    position: str = Form("bottom"),
):
    if processor_name not in PROCESSORS:
        raise HTTPException(status_code=404, detail="Processor not found.")
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, file.filename)

    if processor_name == "bg_remover_icon":
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"output{file_ext}"
        media_type = f"image/{file_ext.lstrip('.')}"
        if file_ext == ".gif":
            media_type = "image/gif"
    else:
        output_filename = "output.mp4"
        media_type = "video/mp4"

    output_path = os.path.join(output_dir, output_filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        if processor_name == "text_apply":
            if not text:
                raise HTTPException(
                    status_code=400, detail="Text is required for text_apply processor."
                )
            PROCESSORS[processor_name](
                input_path,
                output_path,
                text=text,
                font_size=font_size,
                font_color=font_color,
                box_color=box_color,
                box_border=box_border,
                position=position,
            )
        else:
            PROCESSORS[processor_name](input_path, output_path)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    return FileResponse(output_path, media_type=media_type, filename=output_filename)


@app.get("/processors")
def list_processors():
    return {"processors": list(PROCESSORS.keys())}


@app.get("/")
def root():
    return {"status": "ok", "message": "Backend is running successfully"}
