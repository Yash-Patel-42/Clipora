from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import os
import shutil
import uuid
import zipfile
from .split import split_video_in_two_segments

split_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@split_router.post("/")
async def split_endpoint(file: UploadFile = File(...), split_time: float = Form(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    part1_path = os.path.join(output_dir, "part1.mp4")
    part2_path = os.path.join(output_dir, "part2.mp4")
    zip_path = os.path.join(output_dir, "split_videos.zip")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Convert split_time (seconds) to HH:MM:SS
    import math
    h = int(split_time // 3600)
    m = int((split_time % 3600) // 60)
    s = int(split_time % 60)
    split_time_str = f"{h:02d}:{m:02d}:{s:02d}"
    result = split_video_in_two_segments(input_path, part1_path, part2_path, split_time_str)
    if result != 1:
        raise HTTPException(status_code=400, detail="Split failed.")
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        zipf.write(part1_path, arcname="part1.mp4")
        zipf.write(part2_path, arcname="part2.mp4")
    def iterfile():
        with open(zip_path, mode="rb") as file_like:
            yield from file_like
    return StreamingResponse(iterfile(), media_type="application/zip", headers={"Content-Disposition": "attachment; filename=split_videos.zip"}) 