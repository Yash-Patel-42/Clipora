from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .captions import generate_captions
from .apply import apply_caption

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
    ass_path = os.path.join(output_dir, "captions.ass")
    output_video_path = os.path.join(output_dir, "output_with_captions.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        # Generate captions (.ass)
        result = generate_captions(input_path, ass_path)
        if result == 0 or result is None or not os.path.exists(ass_path):
            raise Exception("Caption generation failed.")
        # Burn captions into video
        apply_result = apply_caption(input_path, ass_path, output_video_path)
        if apply_result == 0 or not os.path.exists(output_video_path):
            raise Exception("Failed to apply captions to video.")
        return FileResponse(output_video_path, media_type="video/mp4", filename="output_with_captions.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}")