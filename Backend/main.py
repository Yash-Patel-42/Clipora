print("=== Starting FastAPI app import ===")
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import sys
import traceback
import zipfile

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

# Import caption generator
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_captions_generator'))
from sniply_captions_generator import generate_captions

# Import export and transition modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_export'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_transition'))

# Import these modules inside the functions to avoid import issues
# import sniply_export.export as export_module
# import sniply_transition.auto_transition as transition_module

from moviepy.editor import VideoFileClip
from tempfile import NamedTemporaryFile
import cv2
import numpy as np
from collections import Counter

# Import split logic
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_split'))
from split import split_video_in_two_segments

# Import text apply logic
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_text_apply'))
from text_apply import apply_text
from pysubs2 import Alignment, Color

# Import AI music logic
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_ai_music'))
from sniply_ai_music import video_analysis, music_library, music_processor

# Import manual trim logic
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_manual_trim'))
from sniply_manual_trim.trim_logic import manual_trim_video

# Import smart trim logic
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_smart_trim_silence_part'))
from sniply_smart_trim_silence_part.smart_trim_logic import smart_trim_video

from sniply_export.export import export_video
from sniply_transition.auto_transition import apply_transition_effect

app = FastAPI()
print("=== FastAPI app object created ===")

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
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)  # Always log the traceback
        # Return the error message in the HTTP response for debugging
        raise HTTPException(status_code=500, detail=f"Noise reduction failed: {str(e)}\n\n{tb}")
    # Move output_final.mp4 to output_path
    shutil.move(os.path.join(input_dir, 'output_final.mp4'), output_path)
    return output_path

@register_processor('caption_generator')
def process_caption_generator(input_path, output_path):
    result = generate_captions(input_path, output_path)
    if result == 0 or result is None:
        raise HTTPException(status_code=500, detail="Caption generation failed.")
    return output_path

@register_processor('export')
def process_export(input_path, output_path, resolution='1080p'):
    try:
        export_video(input_path, output_path, resolution)
        return output_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@register_processor('transition')
def process_transition(input_path, output_path, transition_type='fade', transition_duration=1.0):
    try:
        apply_transition_effect(input_path, output_path, transition_type, transition_duration)
        return output_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transition failed: {str(e)}")

# @register_processor('trim')
# def process_trim(input_path, output_path, start=0, end=0):
#     try:
#         clip = VideoFileClip(input_path)
#         duration = clip.duration
#         # Clamp start and end
#         start = max(0, min(float(start), duration))
#         end = max(start, min(float(end), duration))
#         if start >= end:
#             clip.close()
#             raise Exception("End time must be greater than start time.")
#         trimmed = clip.subclip(start, end)
#         trimmed.write_videofile(output_path, codec="libx264", audio_codec="aac")
#         clip.close()
#         trimmed.close()
#         return output_path
#     except Exception as e:
#         raise Exception(f"Trim failed: {str(e)}")

@register_processor('color_grading')
def process_color_grading(input_path, output_path):
    from moviepy.editor import VideoFileClip
    def apply_clahe_to_frame(frame):
        lab = cv2.cvtColor(frame, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        return enhanced
    clip = VideoFileClip(input_path)
    fps = clip.fps
    temp_frames = []
    for i, frame in enumerate(clip.iter_frames()):
        temp_frames.append(apply_clahe_to_frame(frame))
    from moviepy.video.io.ImageSequenceClip import ImageSequenceClip
    graded_clip = ImageSequenceClip(temp_frames, fps=fps)
    if clip.audio is not None:
        graded_clip = graded_clip.set_audio(clip.audio)
    graded_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    graded_clip.close()
    return output_path

@register_processor('smart_trim')
def process_smart_trim(input_path, output_path):
    try:
        smart_trim_video(input_path, output_path)
    except Exception as e:
        raise Exception(f"Smart trim failed: {str(e)}")
    return output_path


# Remove the old AI music code and replace with modular endpoints
@app.post("/analyze_video_mood")
async def analyze_video_mood(file: UploadFile = File(...)):
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, "input.mp4")
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = video_analysis.analyze_video_mood(input_path)
        
        # Clean up
        try:
            os.remove(input_path)
            os.rmdir(input_dir)
        except:
            pass
        
        return result
        
    except Exception as e:
        # Clean up on error
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(input_dir):
                os.rmdir(input_dir)
        except:
            pass
        raise HTTPException(status_code=400, detail=f"Video analysis failed: {str(e)}")

@app.get("/music_library/{mood}")
async def get_music_library(mood: str):
    """Get music library for a specific mood"""
    result = music_library.get_music_library(mood)
    if not result:
        raise HTTPException(status_code=404, detail="Mood not found")
    return result

@app.get("/music_library")
async def get_all_music():
    """Get all available music moods"""
    return music_library.get_music_library()

@app.post("/apply_music")
async def apply_music(
    file: UploadFile = File(...),
    music_id: str = Form(...),
    volume: float = Form(0.3),
    fade_in: float = Form(2.0),
    fade_out: float = Form(2.0),
    loop_music: bool = Form(True)
):
    """Apply music to video using ffmpeg with enhanced features"""
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

@app.post("/generate_ai_music")
async def generate_ai_music(
    mood: str = Form(...),
    duration: float = Form(...),
    style: str = Form("modern"),
    energy_level: str = Form("medium")
):
    """Generate AI music with enhanced parameters"""
    try:
        return music_processor.generate_ai_music(mood, duration, style, energy_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AI music generation failed: {str(e)}")

@app.post("/music_recommendations")
async def get_music_recommendations(
    file: UploadFile = File(...),
    preferences: str = Form("{}")  # JSON string of user preferences
):
    """Get intelligent music recommendations based on video analysis"""
    try:
        import json
        
        # Save uploaded file
        process_id = str(uuid.uuid4())
        input_dir = os.path.join(UPLOAD_DIR, process_id)
        os.makedirs(input_dir, exist_ok=True)
        input_path = os.path.join(input_dir, "input.mp4")
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze video
        analysis_result = video_analysis.analyze_video_mood(input_path)
        video_duration = analysis_result.get("duration", 0)
        
        # Parse user preferences
        user_preferences = json.loads(preferences) if preferences else {}
        
        # Get recommendations
        recommendations = music_processor.get_music_recommendations(
            analysis_result, video_duration, user_preferences
        )
        
        # Clean up
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
        # Clean up on error
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(input_dir):
                os.rmdir(input_dir)
        except:
            pass
        raise HTTPException(status_code=400, detail=f"Music recommendation failed: {str(e)}")

@app.get("/music_stats")
async def get_music_stats():
    """Get statistics about the music library"""
    try:
        return music_library.get_music_stats()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get music stats: {str(e)}")

# @app.post("/process/trim")
# async def process_trim_api(
#     file: UploadFile = File(...),
#     start: float = 0,
#     end: float = 0
# ):
#     print(f"[TRIM DEBUG] Received start: {start} (type: {type(start)}), end: {end} (type: {type(end)})")
#     # Ensure start and end are floats
#     try:
#         start_f = float(start)
#         end_f = float(end)
#     except Exception as e:
#         print(f"[TRIM DEBUG] Failed to parse start/end as float: {e}")
#         raise HTTPException(status_code=400, detail="Invalid start or end value.")
#     process_id = str(uuid.uuid4())
#     input_dir = os.path.join(UPLOAD_DIR, process_id)
#     output_dir = os.path.join(RESULTS_DIR, process_id)
#     os.makedirs(input_dir, exist_ok=True)
#     os.makedirs(output_dir, exist_ok=True)
#     input_path = os.path.join(input_dir, "original.mp4")
#     output_path = os.path.join(output_dir, "output.mp4")
#     with open(input_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
#     try:
#         process_trim(input_path, output_path, start_f, end_f)
#     except Exception as e:
#         tb = traceback.format_exc()
#         print(tb)
#         raise HTTPException(status_code=500, detail=f"Trim failed: {str(e)}\n\n{tb}")
#     return FileResponse(output_path, media_type="video/mp4", filename="trimmed.mp4")

@app.post("/manual_trim")
async def manual_trim(
    file: UploadFile = File(...),
    start: float = Form(...),
    end: float = Form(...)
):
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Trim failed: {str(e)}")
    return FileResponse(output_path, media_type="video/mp4", filename="trimmed.mp4")

@app.post("/manual_split")
async def manual_split(
    file: UploadFile = File(...),
    split_time: float = Form(...)
):
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
    # Split the video
    result = split_video_in_two_segments(input_path, part1_path, part2_path, split_time_str)
    if result != 1:
        raise HTTPException(status_code=400, detail="Split failed.")
    # Zip the two parts
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        zipf.write(part1_path, arcname="part1.mp4")
        zipf.write(part2_path, arcname="part2.mp4")
    def iterfile():
        with open(zip_path, mode="rb") as file_like:
            yield from file_like
    return StreamingResponse(iterfile(), media_type="application/zip", headers={"Content-Disposition": "attachment; filename=split_videos.zip"})

@app.post("/manual_text_apply")
async def manual_text_apply(
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
    alignment: int = Form(2),  # 2 = bottom center
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
    # Convert color and alignment
    primarycolor = Color(color_r, color_g, color_b, color_a)
    align_map = {1: Alignment.BOTTOM_LEFT, 2: Alignment.BOTTOM_CENTER, 3: Alignment.BOTTOM_RIGHT,
                 4: Alignment.MIDDLE_LEFT, 5: Alignment.MIDDLE_CENTER, 6: Alignment.MIDDLE_RIGHT,
                 7: Alignment.TOP_LEFT, 8: Alignment.TOP_CENTER, 9: Alignment.TOP_RIGHT}
    align_val = align_map.get(alignment, Alignment.BOTTOM_CENTER)
    # Call apply_text
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

@app.post("/process/{processor_name}")
async def process_video(
    processor_name: str, 
    file: UploadFile = File(...),
    resolution: str = None,
    transition_type: str = None,
    transition_duration: float = None,
    start: float = None,
    end: float = None
):
    if processor_name not in PROCESSORS:
        raise HTTPException(status_code=404, detail="Processor not found.")
    # Save uploaded file
    process_id = str(uuid.uuid4())
    input_dir = os.path.join(UPLOAD_DIR, process_id)
    output_dir = os.path.join(RESULTS_DIR, process_id)
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    # Use a consistent name to avoid conflicts with processor-specific names
    input_path = os.path.join(input_dir, "original.mp4")
    output_path = os.path.join(output_dir, "output.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Process with additional parameters
    try:
        if processor_name == 'export' and resolution:
            PROCESSORS[processor_name](input_path, output_path, resolution=resolution)
        elif processor_name == 'transition':
            transition_type = transition_type or 'fade'
            transition_duration = transition_duration or 1.0
            PROCESSORS[processor_name](input_path, output_path, transition_type=transition_type, transition_duration=transition_duration)
        elif processor_name == 'trim':
            # Debug log for trim
            print(f"[TRIM DEBUG] (generic) Received start: {start} (type: {type(start)}), end: {end} (type: {type(end)})")
            try:
                start_f = float(start) if start is not None else 0.0
                end_f = float(end) if end is not None else 0.0
            except Exception as e:
                print(f"[TRIM DEBUG] (generic) Failed to parse start/end as float: {e}")
                raise HTTPException(status_code=400, detail="Invalid start or end value.")
            PROCESSORS[processor_name](input_path, output_path, start_f, end_f)
        else:
            PROCESSORS[processor_name](input_path, output_path)
    except Exception as e:
        # Improved error logging for all processors
        tb = traceback.format_exc()
        print(tb)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}\n\n{tb}")
    # Return processed video
    return FileResponse(output_path, media_type="video/mp4", filename="output.mp4")

@app.get("/processors")
def list_processors():
    return {"processors": list(PROCESSORS.keys())} 

@app.get("/")
def read_root():
    return {"message": "Sniply backend is running!"} 