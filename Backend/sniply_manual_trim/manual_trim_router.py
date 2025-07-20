from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .trim_logic import manual_trim_video

manual_trim_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@manual_trim_router.post("/")
async def manual_trim_endpoint(file: UploadFile = File(...), start: float = Form(...), end: float = Form(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "trimmed.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        manual_trim_video(input_path, output_path, start, end)
        return FileResponse(output_path, media_type="video/mp4", filename="trimmed.mp4")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Trim failed: {str(e)}") 