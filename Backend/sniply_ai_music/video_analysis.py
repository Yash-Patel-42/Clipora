import cv2
import numpy as np
import os

def analyze_video_mood(video_path):
    """
    Analyze video content for mood detection using computer vision
    Returns: dict with mood, confidence, duration, and analysis data
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Could not open video file")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps
        
        # Sample frames for analysis (every 30th frame for efficiency)
        sample_interval = max(1, total_frames // 30)
        frame_count = 0
        brightness_scores = []
        color_dominance = []
        motion_scores = []
        prev_frame = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % sample_interval == 0:
                # Brightness analysis
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray)
                brightness_scores.append(brightness)
                
                # Color analysis
                hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
                # Analyze dominant colors
                h, s, v = cv2.split(hsv)
                avg_hue = np.mean(h)
                avg_sat = np.mean(s)
                avg_val = np.mean(v)
                color_dominance.append((avg_hue, avg_sat, avg_val))
                
                # Motion analysis
                if prev_frame is not None:
                    diff = cv2.absdiff(gray, cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY))
                    motion = np.mean(diff)
                    motion_scores.append(motion)
                
                prev_frame = frame.copy()
            
            frame_count += 1
        
        cap.release()
        
        # Analyze results
        avg_brightness = np.mean(brightness_scores)
        avg_motion = np.mean(motion_scores) if motion_scores else 0
        
        # Determine mood based on analysis
        mood = "neutral"
        confidence = 0.5
        
        # Brightness-based mood
        if avg_brightness < 80:
            mood = "sad"
            confidence += 0.2
        elif avg_brightness > 150:
            mood = "happy"
            confidence += 0.2
        
        # Motion-based mood
        if avg_motion > 20:
            mood = "thrilling"
            confidence += 0.3
        elif avg_motion < 5:
            mood = "calm"
            confidence += 0.2
        
        # Color analysis
        avg_hues = [h for h, s, v in color_dominance]
        avg_sats = [s for h, s, v in color_dominance]
        
        if np.mean(avg_sats) > 100:  # High saturation
            if mood == "happy":
                confidence += 0.1
            elif mood == "neutral":
                mood = "energetic"
                confidence += 0.2
        
        # Ensure confidence doesn't exceed 1.0
        confidence = min(confidence, 1.0)
        
        return {
            "mood": mood,
            "confidence": round(confidence, 2),
            "duration": round(duration, 2),
            "analysis": {
                "avg_brightness": round(avg_brightness, 2),
                "avg_motion": round(avg_motion, 2),
                "avg_saturation": round(np.mean(avg_sats), 2)
            }
        }
        
    except Exception as e:
        raise Exception(f"Video analysis failed: {str(e)}") 