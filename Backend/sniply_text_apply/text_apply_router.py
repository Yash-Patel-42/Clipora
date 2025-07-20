from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .text_apply import apply_text
from pysubs2 import Alignment, Color

text_apply_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@text_apply_router.post("/")
async def text_apply_endpoint(
    file: UploadFile = File(...),
    text: str = Form(...),
    start_time: float = Form(...),
    end_time: float = Form(...),
    fontname: str = Form("Arial"),
    fontsize: int = Form(28),
    color_r: int = Form(255),
    color_g: int = Form(255),
    color_b: int = Form(255),
    color_a: int = Form(0),
    alignment: int = Form(2)
):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "text_applied.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    primarycolor = Color(color_r, color_g, color_b, color_a)
    align_map = {1: Alignment.BOTTOM_LEFT, 2: Alignment.BOTTOM_CENTER, 3: Alignment.BOTTOM_RIGHT,
                 4: Alignment.MIDDLE_LEFT, 5: Alignment.MIDDLE_CENTER, 6: Alignment.MIDDLE_RIGHT,
                 7: Alignment.TOP_LEFT, 8: Alignment.TOP_CENTER, 9: Alignment.TOP_RIGHT}
    align_val = align_map.get(alignment, Alignment.BOTTOM_CENTER)
    result = apply_text(
        vid_input=input_path,
        text=text,
        startTime=start_time,
        endTime=end_time,
        outpath=output_path,
        fontname=fontname,
        fontsize=fontsize,
        primarycolor=primarycolor,
        alignment=align_val
    )
    if not result or not os.path.exists(output_path):
        raise HTTPException(status_code=400, detail="Text overlay failed.")
    return FileResponse(output_path, media_type="video/mp4", filename="text_applied.mp4") 