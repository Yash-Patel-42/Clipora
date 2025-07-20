from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .denoise_video import main as denoise_main

noise_reduction_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@noise_reduction_router.post("/")
async def noise_reduction_endpoint(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "denoised.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        denoise_main(input_path)
        # denoise_main writes output_final.mp4 in the same dir as input
        final_path = os.path.join(input_dir, "output_final.mp4")
        shutil.move(final_path, output_path)
        return FileResponse(output_path, media_type="video/mp4", filename="denoised.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Noise reduction failed: {str(e)}") 