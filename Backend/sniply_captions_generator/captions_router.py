from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .captions import generate_captions

captions_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@captions_router.post("/")
async def generate_video_captions(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "captions.ass")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = generate_captions(input_path, output_path)
        if result == 0 or result is None or not os.path.exists(output_path):
            raise Exception("Caption generation failed.")
        return FileResponse(output_path, media_type="text/x-ssa", filename="captions.ass")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}") 