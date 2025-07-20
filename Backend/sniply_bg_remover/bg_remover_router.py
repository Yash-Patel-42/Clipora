from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .bg_removal import extract_frames, remove_backgrounds, create_video

bg_remover_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@bg_remover_router.post("")
async def remove_bg(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "output.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        # Set up paths for bg_removal
        from . import bg_removal
        bg_removal.INPUT_VIDEO = input_path
        bg_removal.FRAME_DIR = os.path.join(input_dir, 'frames')
        bg_removal.OUTPUT_FRAME_DIR = os.path.join(input_dir, 'no_bg_frames')
        bg_removal.OUTPUT_VIDEO = output_path
        # Run the pipeline
        extract_frames()
        remove_backgrounds()
        create_video()
        return FileResponse(output_path, media_type="video/mp4", filename="bg_removed.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}") 