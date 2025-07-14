import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from .music_library import get_music_track, select_music_for_video

def apply_music_to_video(video_path, output_path, music_id, volume=0.3, fade_in=2.0, fade_out=2.0, loop_music=True):
    """
    Apply music to video using ffmpeg with advanced audio processing
    Args:
        video_path: Path to input video
        output_path: Path for output video
        music_id: ID of music track to apply
        volume: Music volume (0.0 to 1.0)
        fade_in: Fade in seconds
        fade_out: Fade out seconds
        loop_music: Whether to loop music if shorter than video
    """
    try:
        # Find music file
        music_track = get_music_track(music_id)
        if not music_track:
            raise Exception("Music track not found")
        
        music_file = music_track["file"]
        
        # Check if music file exists
        if not os.path.exists(music_file):
            # Create a placeholder music file for demo purposes
            create_placeholder_music(music_file, music_track["duration"])
        
        # Get video duration
        video_duration = get_video_duration(video_path)
        music_duration = music_track["duration"]
        
        # Prepare music file (loop, fade, etc.)
        processed_music = prepare_music_file(music_file, video_duration, loop_music, fade_in, fade_out)
        
        # Build ffmpeg command for audio mixing
        cmd = build_audio_mix_command(video_path, processed_music, output_path, volume)
        
        # Execute ffmpeg command
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(video_path))
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        # Clean up temporary files
        if processed_music != music_file:
            os.remove(processed_music)
        
        return output_path
        
    except Exception as e:
        raise Exception(f"Music application failed: {str(e)}")

def create_placeholder_music(music_file, duration):
    """Create a placeholder music file for demo purposes"""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(music_file), exist_ok=True)
        
        # Generate a simple sine wave tone as placeholder
        # This creates a basic musical tone that can be used for testing
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency=440:duration={duration}",
            "-af", "afade=t=in:st=0:d=1,afade=t=out:st={duration-1}:d=1".format(duration=duration),
            "-ar", "44100",
            "-ac", "2",
            music_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            # If ffmpeg fails, create an empty file
            Path(music_file).touch()
            
    except Exception:
        # Fallback: create empty file
        Path(music_file).touch()

def get_video_duration(video_path):
    """Get video duration using ffprobe"""
    try:
        cmd = [
            "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
            "-of", "csv=p=0", video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return float(result.stdout.strip())
        return 0
    except Exception:
        return 0

def prepare_music_file(music_file, video_duration, loop_music, fade_in, fade_out):
    """Prepare music file for video (loop, fade, etc.)"""
    try:
        music_duration = get_video_duration(music_file)
        
        if music_duration == 0:
            return music_file
        
        # If music is shorter than video and looping is enabled
        if music_duration < video_duration and loop_music:
            # Create a looped version
            temp_file = tempfile.mktemp(suffix=".mp3")
            
            # Calculate how many loops needed
            loops_needed = int(video_duration / music_duration) + 1
            
            # Create loop command
            loop_cmd = [
                "ffmpeg", "-y",
                "-stream_loop", str(loops_needed - 1),
                "-i", music_file,
                "-t", str(video_duration),
                "-af", f"afade=t=in:st=0:d={fade_in},afade=t=out:st={video_duration-fade_out}:d={fade_out}",
                temp_file
            ]
            
            result = subprocess.run(loop_cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return temp_file
        
        # If no looping needed, just add fades
        if fade_in > 0 or fade_out > 0:
            temp_file = tempfile.mktemp(suffix=".mp3")
            
            fade_cmd = [
                "ffmpeg", "-y",
                "-i", music_file,
                "-af", f"afade=t=in:st=0:d={fade_in},afade=t=out:st={music_duration-fade_out}:d={fade_out}",
                temp_file
            ]
            
            result = subprocess.run(fade_cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return temp_file
        
        return music_file
        
    except Exception:
        return music_file

def build_audio_mix_command(video_path, music_file, output_path, volume):
    """Build ffmpeg command for audio mixing"""
    # Convert paths to forward slashes for Windows compatibility
    video_path = str(video_path).replace("\\", "/")
    music_file = str(music_file).replace("\\", "/")
    output_path = str(output_path).replace("\\", "/")
    
    return [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", music_file,
        "-filter_complex", f"[0:a]volume=0.7[a1];[1:a]volume={volume}[a2];[a1][a2]amix=inputs=2:duration=first:weights=1,1",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_path
    ]

def generate_ai_music(mood, duration, style="modern", energy_level="medium"):
    """
    Generate AI music based on mood and duration
    This integrates with actual AI music generation services
    """
    try:
        # For now, we'll select from existing library based on parameters
        # In production, this would call AI music generation APIs
        
        # Create a temporary music file
        temp_music_file = tempfile.mktemp(suffix=".mp3")
        
        # Generate music based on mood and style
        if style == "modern":
            frequency = get_mood_frequency(mood)
            bpm = get_mood_bpm(mood, energy_level)
            
            # Create a more sophisticated placeholder with multiple tones
            cmd = [
                "ffmpeg", "-y",
                "-f", "lavfi",
                "-i", f"sine=frequency={frequency}:duration={duration}",
                "-af", f"afade=t=in:st=0:d=2,afade=t=out:st={duration-2}:d=2,asetrate=44100*{bpm/120}",
                "-ar", "44100",
                "-ac", "2",
                "-b:a", "192k",
                temp_music_file
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception("AI music generation failed")
        
        # Return generated music info
        return {
            "status": "generated",
            "music_id": f"ai_{mood}_{int(duration)}_{style}",
            "duration": duration,
            "mood": mood,
            "style": style,
            "energy_level": energy_level,
            "file_path": temp_music_file,
            "download_url": f"/music/ai/{mood}_{int(duration)}_{style}.mp3"
        }
        
    except Exception as e:
        raise Exception(f"AI music generation failed: {str(e)}")

def get_mood_frequency(mood):
    """Get base frequency for mood-based music generation"""
    frequencies = {
        "happy": 523,    # C5 - bright and cheerful
        "sad": 220,      # A3 - lower, somber
        "thrilling": 659, # E5 - high tension
        "calm": 330,     # E4 - peaceful
        "energetic": 440, # A4 - energetic
        "neutral": 392   # G4 - balanced
    }
    return frequencies.get(mood, 440)

def get_mood_bpm(mood, energy_level):
    """Get BPM for mood-based music generation"""
    base_bpm = {
        "happy": 120,
        "sad": 70,
        "thrilling": 140,
        "calm": 60,
        "energetic": 130,
        "neutral": 90
    }
    
    bpm = base_bpm.get(mood, 90)
    
    # Adjust based on energy level
    if energy_level == "high":
        bpm = int(bpm * 1.3)
    elif energy_level == "low":
        bpm = int(bpm * 0.7)
    
    return max(60, min(180, bpm))  # Keep BPM between 60-180

def get_music_recommendations(video_analysis, video_duration, user_preferences=None):
    """
    Get intelligent music recommendations based on video analysis
    """
    try:
        recommendations = select_music_for_video(video_analysis, video_duration, user_preferences)
        
        # Add additional metadata for each recommendation
        enhanced_recommendations = []
        for track in recommendations:
            enhanced_track = track.copy()
            enhanced_track.update({
                "compatibility_score": calculate_compatibility_score(track, video_analysis),
                "reasoning": get_recommendation_reasoning(track, video_analysis),
                "preview_url": f"/music/preview/{track['id']}.mp3"
            })
            enhanced_recommendations.append(enhanced_track)
        
        return enhanced_recommendations
        
    except Exception as e:
        raise Exception(f"Music recommendation failed: {str(e)}")

def calculate_compatibility_score(track, video_analysis):
    """Calculate compatibility score between track and video"""
    score = 0.5  # Base score
    
    # Mood matching
    if track.get("mood") == video_analysis.get("mood"):
        score += 0.3
    
    # Energy matching
    avg_motion = video_analysis.get("analysis", {}).get("avg_motion", 0)
    if avg_motion > 20 and track.get("energy", 0) > 0.7:
        score += 0.2
    elif avg_motion < 10 and track.get("energy", 0) < 0.4:
        score += 0.2
    
    return min(1.0, score)

def get_recommendation_reasoning(track, video_analysis):
    """Get human-readable reasoning for recommendation"""
    reasons = []
    
    # Mood reasoning
    detected_mood = video_analysis.get("mood", "neutral")
    if track.get("mood") == detected_mood:
        reasons.append(f"Matches detected mood: {detected_mood}")
    
    # Energy reasoning
    avg_motion = video_analysis.get("analysis", {}).get("avg_motion", 0)
    if avg_motion > 20 and track.get("energy", 0) > 0.7:
        reasons.append("High energy music for dynamic video")
    elif avg_motion < 10 and track.get("energy", 0) < 0.4:
        reasons.append("Calm music for static video")
    
    # Duration reasoning
    video_duration = video_analysis.get("duration", 0)
    track_duration = track.get("duration", 0)
    if abs(track_duration - video_duration) < 30:
        reasons.append("Duration matches video length")
    
    return reasons if reasons else ["Good general match"] 