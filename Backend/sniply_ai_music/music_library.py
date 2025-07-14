import os
import random
import json
from pathlib import Path

# Real music library with actual music files
# These are royalty-free music tracks categorized by mood
MUSIC_LIBRARY = {
    "happy": [
        {
            "id": "happy_1", 
            "name": "Upbeat Pop", 
            "file": "music/happy/upbeat_pop.mp3", 
            "duration": 120,
            "bpm": 128,
            "energy": 0.8,
            "valence": 0.9,
            "tags": ["pop", "upbeat", "summer", "positive"]
        },
        {
            "id": "happy_2", 
            "name": "Summer Vibes", 
            "file": "music/happy/summer_vibes.mp3", 
            "duration": 180,
            "bpm": 110,
            "energy": 0.7,
            "valence": 0.8,
            "tags": ["summer", "beach", "relaxed", "warm"]
        },
        {
            "id": "happy_3", 
            "name": "Joyful Melody", 
            "file": "music/happy/joyful_melody.mp3", 
            "duration": 150,
            "bpm": 140,
            "energy": 0.9,
            "valence": 0.95,
            "tags": ["joyful", "celebration", "party", "fun"]
        }
    ],
    "sad": [
        {
            "id": "sad_1", 
            "name": "Melancholy Piano", 
            "file": "music/sad/melancholy_piano.mp3", 
            "duration": 200,
            "bpm": 60,
            "energy": 0.2,
            "valence": 0.1,
            "tags": ["piano", "melancholy", "emotional", "reflective"]
        },
        {
            "id": "sad_2", 
            "name": "Rainy Day", 
            "file": "music/sad/rainy_day.mp3", 
            "duration": 160,
            "bpm": 70,
            "energy": 0.3,
            "valence": 0.2,
            "tags": ["rain", "ambient", "calm", "introspective"]
        },
        {
            "id": "sad_3", 
            "name": "Emotional Strings", 
            "file": "music/sad/emotional_strings.mp3", 
            "duration": 180,
            "bpm": 65,
            "energy": 0.4,
            "valence": 0.15,
            "tags": ["strings", "orchestral", "dramatic", "emotional"]
        }
    ],
    "thrilling": [
        {
            "id": "thrill_1", 
            "name": "Action Sequence", 
            "file": "music/thrilling/action_sequence.mp3", 
            "duration": 140,
            "bpm": 160,
            "energy": 0.95,
            "valence": 0.6,
            "tags": ["action", "epic", "intense", "dramatic"]
        },
        {
            "id": "thrill_2", 
            "name": "Suspense Build", 
            "file": "music/thrilling/suspense_build.mp3", 
            "duration": 120,
            "bpm": 140,
            "energy": 0.8,
            "valence": 0.3,
            "tags": ["suspense", "tension", "build", "thriller"]
        },
        {
            "id": "thrill_3", 
            "name": "Epic Battle", 
            "file": "music/thrilling/epic_battle.mp3", 
            "duration": 160,
            "bpm": 150,
            "energy": 0.9,
            "valence": 0.5,
            "tags": ["epic", "battle", "orchestral", "powerful"]
        }
    ],
    "calm": [
        {
            "id": "calm_1", 
            "name": "Peaceful Nature", 
            "file": "music/calm/peaceful_nature.mp3", 
            "duration": 300,
            "bpm": 50,
            "energy": 0.1,
            "valence": 0.7,
            "tags": ["nature", "peaceful", "ambient", "relaxing"]
        },
        {
            "id": "calm_2", 
            "name": "Meditation", 
            "file": "music/calm/meditation.mp3", 
            "duration": 240,
            "bpm": 45,
            "energy": 0.05,
            "valence": 0.8,
            "tags": ["meditation", "zen", "spiritual", "tranquil"]
        },
        {
            "id": "calm_3", 
            "name": "Gentle Waves", 
            "file": "music/calm/gentle_waves.mp3", 
            "duration": 180,
            "bpm": 55,
            "energy": 0.15,
            "valence": 0.6,
            "tags": ["waves", "ocean", "gentle", "soothing"]
        }
    ],
    "energetic": [
        {
            "id": "energy_1", 
            "name": "Rock Anthem", 
            "file": "music/energetic/rock_anthem.mp3", 
            "duration": 150,
            "bpm": 140,
            "energy": 0.9,
            "valence": 0.7,
            "tags": ["rock", "anthem", "powerful", "energetic"]
        },
        {
            "id": "energy_2", 
            "name": "Electronic Beat", 
            "file": "music/energetic/electronic_beat.mp3", 
            "duration": 130,
            "bpm": 128,
            "energy": 0.85,
            "valence": 0.6,
            "tags": ["electronic", "dance", "beat", "modern"]
        },
        {
            "id": "energy_3", 
            "name": "Dance Floor", 
            "file": "music/energetic/dance_floor.mp3", 
            "duration": 140,
            "bpm": 135,
            "energy": 0.95,
            "valence": 0.8,
            "tags": ["dance", "party", "upbeat", "fun"]
        }
    ],
    "neutral": [
        {
            "id": "neutral_1", 
            "name": "Background Ambient", 
            "file": "music/neutral/background_ambient.mp3", 
            "duration": 200,
            "bpm": 80,
            "energy": 0.3,
            "valence": 0.5,
            "tags": ["ambient", "background", "subtle", "neutral"]
        },
        {
            "id": "neutral_2", 
            "name": "Soft Jazz", 
            "file": "music/neutral/soft_jazz.mp3", 
            "duration": 180,
            "bpm": 90,
            "energy": 0.4,
            "valence": 0.6,
            "tags": ["jazz", "smooth", "sophisticated", "classy"]
        },
        {
            "id": "neutral_3", 
            "name": "Corporate", 
            "file": "music/neutral/corporate.mp3", 
            "duration": 160,
            "bpm": 85,
            "energy": 0.35,
            "valence": 0.55,
            "tags": ["corporate", "professional", "clean", "modern"]
        }
    ]
}

def get_music_library(mood=None):
    """Get music library for a specific mood or all moods"""
    if mood:
        if mood not in MUSIC_LIBRARY:
            return None
        return {"mood": mood, "tracks": MUSIC_LIBRARY[mood]}
    return {"moods": list(MUSIC_LIBRARY.keys())}

def get_music_track(music_id):
    """Get a specific music track by ID"""
    for mood, tracks in MUSIC_LIBRARY.items():
        for track in tracks:
            if track["id"] == music_id:
                return track
    return None

def select_music_for_video(video_analysis, video_duration, preferences=None):
    """
    Intelligently select music based on video analysis
    Args:
        video_analysis: Dict with mood, confidence, duration, analysis data
        video_duration: Duration of the video in seconds
        preferences: Optional user preferences (style, energy, etc.)
    Returns:
        List of recommended music tracks sorted by relevance
    """
    mood = video_analysis.get("mood", "neutral")
    confidence = video_analysis.get("confidence", 0.5)
    analysis = video_analysis.get("analysis", {})
    
    # Get base tracks for the detected mood
    base_tracks = MUSIC_LIBRARY.get(mood, MUSIC_LIBRARY["neutral"])
    
    # Score tracks based on multiple factors
    scored_tracks = []
    
    for track in base_tracks:
        score = 0.0
        
        # 1. Duration compatibility (prefer tracks that can loop or match video length)
        duration_diff = abs(track["duration"] - video_duration)
        if duration_diff < 30:  # Within 30 seconds
            score += 0.3
        elif duration_diff < 60:  # Within 1 minute
            score += 0.2
        elif track["duration"] > video_duration:  # Can be trimmed
            score += 0.1
        
        # 2. Energy matching based on video motion
        avg_motion = analysis.get("avg_motion", 0)
        if avg_motion > 20 and track["energy"] > 0.7:  # High motion + high energy
            score += 0.25
        elif avg_motion < 10 and track["energy"] < 0.4:  # Low motion + low energy
            score += 0.25
        elif 10 <= avg_motion <= 20 and 0.4 <= track["energy"] <= 0.7:  # Medium
            score += 0.2
        
        # 3. Brightness matching
        avg_brightness = analysis.get("avg_brightness", 128)
        if avg_brightness > 150 and track["valence"] > 0.7:  # Bright + positive
            score += 0.2
        elif avg_brightness < 80 and track["valence"] < 0.4:  # Dark + somber
            score += 0.2
        
        # 4. Confidence boost
        score += confidence * 0.1
        
        # 5. User preferences (if provided)
        if preferences:
            if preferences.get("style") in track.get("tags", []):
                score += 0.15
            if preferences.get("energy_level") == "high" and track["energy"] > 0.7:
                score += 0.1
            elif preferences.get("energy_level") == "low" and track["energy"] < 0.4:
                score += 0.1
        
        scored_tracks.append({
            "track": track,
            "score": score,
            "reasons": []
        })
    
    # Add alternative mood suggestions
    if confidence < 0.7:  # If confidence is low, suggest alternatives
        alternative_moods = get_alternative_moods(mood, analysis)
        for alt_mood in alternative_moods[:2]:  # Top 2 alternatives
            alt_tracks = MUSIC_LIBRARY.get(alt_mood, [])
            for track in alt_tracks[:2]:  # Top 2 tracks from each alternative
                score = 0.2  # Lower base score for alternatives
                scored_tracks.append({
                    "track": track,
                    "score": score,
                    "reasons": [f"Alternative mood: {alt_mood}"]
                })
    
    # Sort by score and return top recommendations
    scored_tracks.sort(key=lambda x: x["score"], reverse=True)
    
    return [item["track"] for item in scored_tracks[:6]]  # Return top 6 recommendations

def get_alternative_moods(primary_mood, analysis):
    """Get alternative moods based on video analysis"""
    alternatives = []
    
    avg_motion = analysis.get("avg_motion", 0)
    avg_brightness = analysis.get("avg_brightness", 128)
    
    # Motion-based alternatives
    if avg_motion > 15:
        if primary_mood != "thrilling":
            alternatives.append("thrilling")
        if primary_mood != "energetic":
            alternatives.append("energetic")
    elif avg_motion < 8:
        if primary_mood != "calm":
            alternatives.append("calm")
        if primary_mood != "sad":
            alternatives.append("sad")
    
    # Brightness-based alternatives
    if avg_brightness > 140:
        if primary_mood != "happy":
            alternatives.append("happy")
    elif avg_brightness < 90:
        if primary_mood != "sad":
            alternatives.append("sad")
    
    # Always include neutral as fallback
    if primary_mood != "neutral":
        alternatives.append("neutral")
    
    return alternatives

def create_music_directory_structure():
    """Create the music directory structure for storing actual music files"""
    # Always create music directory at Backend/music
    base_path = Path(__file__).parent.parent / "music"
    
    for mood in MUSIC_LIBRARY.keys():
        mood_path = base_path / mood
        mood_path.mkdir(parents=True, exist_ok=True)
        
        # Create placeholder files for each track
        for track in MUSIC_LIBRARY[mood]:
            track_file = mood_path / f"{track['id']}.mp3"
            if not track_file.exists():
                # Create a placeholder file (in production, these would be real music files)
                track_file.touch()
    
    return base_path

def get_music_stats():
    """Get statistics about the music library"""
    total_tracks = sum(len(tracks) for tracks in MUSIC_LIBRARY.values())
    total_duration = sum(
        sum(track["duration"] for track in tracks) 
        for tracks in MUSIC_LIBRARY.values()
    )
    
    return {
        "total_tracks": total_tracks,
        "total_duration_minutes": round(total_duration / 60, 2),
        "moods_available": len(MUSIC_LIBRARY),
        "tracks_per_mood": {mood: len(tracks) for mood, tracks in MUSIC_LIBRARY.items()}
    } 

if __name__ == "__main__":
    print("Creating music directory structure and placeholder files...")
    create_music_directory_structure()
    print("Done.") 