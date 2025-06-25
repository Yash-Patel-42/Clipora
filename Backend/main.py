from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import sys
import traceback

# Import background remover and noise reduction logic
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_bg_remover'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_noise_reduction'))

import sniply_bg_remover.bg_removal as bg_removal

# For noise reduction, we'll refactor denoise_video.py into a function
import importlib.util
denoise_video_path = os.path.join(os.path.dirname(__file__), 'sniply_noise_reduction', 'denoise_video.py')
spec = importlib.util.spec_from_file_location('denoise_video', denoise_video_path)
denoise_video = importlib.util.module_from_spec(spec)
spec.loader.exec_module(denoise_video)

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# Processor registry
PROCESSORS = {}

def register_processor(name):
    def decorator(func):
        PROCESSORS[name] = func
        return func
    return decorator

@register_processor('bg_remover')
def process_bg_remover(input_path, output_path):
    # Set up paths for bg_removal
    bg_removal.INPUT_VIDEO = input_path
    bg_removal.FRAME_DIR = os.path.join(os.path.dirname(input_path), 'frames')
    bg_removal.OUTPUT_FRAME_DIR = os.path.join(os.path.dirname(input_path), 'no_bg_frames')
    bg_removal.OUTPUT_VIDEO = output_path
    # Run the pipeline
    bg_removal.extract_frames()
    bg_removal.remove_backgrounds()
    bg_removal.create_video()
    return output_path

@register_processor('noise_reduction')
def process_noise_reduction(input_path, output_path):
    # denoise_video.py expects input.mp4 and outputs output_final.mp4 in the same directory
    input_dir = os.path.dirname(input_path)
    input_file = os.path.join(input_dir, 'input.mp4')
    shutil.copy(input_path, input_file)
    # Remove any previous outputs
    for f in ['output_final.mp4', 'denoised_video.mp4', 'reduced_audio.wav', 'input_audio.wav']:
        try:
            os.remove(os.path.join(input_dir, f))
        except FileNotFoundError:
            pass
    # Run the script (refactored as a function)
    try:
        denoise_video.main(input_file)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Noise reduction failed.")
    # Move output_final.mp4 to output_path
    shutil.move(os.path.join(input_dir, 'output_final.mp4'), output_path)
    return output_path

@app.post("/process/{processor_name}")
async def process_video(processor_name: str, file: UploadFile = File(...)):
    if processor_name not in PROCESSORS:
        raise HTTPException(status_code=404, detail="Processor not found.")
    # Save uploaded file
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, file.filename)
    output_path = os.path.join(output_dir, "output.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Process
    try:
        PROCESSORS[processor_name](input_path, output_path)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    # Return processed video
    return FileResponse(output_path, media_type="video/mp4", filename="output.mp4")

@app.get("/processors")
def list_processors():
    return {"processors": list(PROCESSORS.keys())} 