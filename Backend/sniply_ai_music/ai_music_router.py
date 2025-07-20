from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from . import video_analysis, music_library, music_processor

ai_music_router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@ai_music_router.post("/analyze_video_mood")
async def analyze_video_mood(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = video_analysis.analyze_video_mood(input_path)
        try:
            os.remove(input_path)
            os.rmdir(input_dir)
        except:
            pass
        return result
    except Exception as e:
        try:
            if os.path.exists(input_path): os.remove(input_path)
            if os.path.exists(input_dir): os.rmdir(input_dir)
        except:
            pass
        raise HTTPException(status_code=400, detail=f"Video analysis failed: {str(e)}")

@ai_music_router.get("/music_library/{mood}")
async def get_music_library(mood: str):
    result = music_library.get_music_library(mood)
    if not result:
        raise HTTPException(status_code=404, detail="Mood not found")
    return result

@ai_music_router.get("/music_library")
async def get_all_music():
    return music_library.get_music_library()

@ai_music_router.post("/apply_music")
async def apply_music(
    file: UploadFile = File(...),
    music_id: str = Form(...),
    volume: float = Form(0.3),
    fade_in: float = Form(2.0),
    fade_out: float = Form(2.0),
    loop_music: bool = Form(True)
):
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
        music_processor.apply_music_to_video(input_path, output_path, music_id, volume, fade_in, fade_out, loop_music)
        return FileResponse(output_path, media_type="video/mp4", filename="music_added.mp4")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Music application failed: {str(e)}")

@ai_music_router.post("/generate_ai_music")
async def generate_ai_music(
    mood: str = Form(...),
    duration: float = Form(...),
    style: str = Form("modern"),
    energy_level: str = Form("medium")
):
    try:
        return music_processor.generate_ai_music(mood, duration, style, energy_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AI music generation failed: {str(e)}")

@ai_music_router.post("/music_recommendations")
async def get_music_recommendations(
    file: UploadFile = File(...),
    preferences: str = Form("{}")
):
    try:
        import json
        process_id = str(uuid.uuid4())
        input_dir = os.path.join(UPLOAD_DIR, process_id)
        os.makedirs(input_dir, exist_ok=True)
        input_path = os.path.join(input_dir, "input.mp4")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        analysis_result = video_analysis.analyze_video_mood(input_path)
        video_duration = analysis_result.get("duration", 0)
        user_preferences = json.loads(preferences) if preferences else {}
        recommendations = music_processor.get_music_recommendations(
            analysis_result, video_duration, user_preferences
        )
        try:
            os.remove(input_path)
            os.rmdir(input_dir)
        except:
            pass
        return {
            "video_analysis": analysis_result,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations)
        }
    except Exception as e:
        try:
            if os.path.exists(input_path): os.remove(input_path)
            if os.path.exists(input_dir): os.rmdir(input_dir)
        except:
            pass
        raise HTTPException(status_code=400, detail=f"Music recommendation failed: {str(e)}")

@ai_music_router.get("/music_stats")
async def get_music_stats():
    try:
        return music_library.get_music_stats()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get music stats: {str(e)}") 