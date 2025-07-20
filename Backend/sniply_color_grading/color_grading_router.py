from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from .color_grading import apply_clahe_to_frame
from moviepy.editor import VideoFileClip
from moviepy.video.io.ImageSequenceClip import ImageSequenceClip

color_grading_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@color_grading_router.post("/")
async def color_grade_video(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    output_path = os.path.join(output_dir, "color_graded.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        clip = VideoFileClip(input_path)
        fps = clip.fps
        temp_frames = [apply_clahe_to_frame(frame) for frame in clip.iter_frames()]
        graded_clip = ImageSequenceClip(temp_frames, fps=fps)
        if clip.audio is not None:
            graded_clip = graded_clip.set_audio(clip.audio)
        graded_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
        clip.close()
        graded_clip.close()
        return FileResponse(output_path, media_type="video/mp4", filename="color_graded.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Color grading failed: {str(e)}") 