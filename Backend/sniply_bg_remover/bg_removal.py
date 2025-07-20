import os
import shutil
import subprocess
from rembg import remove, new_session
from PIL import Image
from tqdm import tqdm
import multiprocessing
import time

# Default settings
INPUT_VIDEO = "input.mp4"
FRAME_DIR = "frames"
OUTPUT_FRAME_DIR = "no_bg_frames"
OUTPUT_VIDEO = "output.mp4"
FPS = 30  # Adjust as needed
NUM_WORKERS = multiprocessing.cpu_count()

# Options for GPU acceleration
MODEL_NAME = "u2net" # u2net is the default high-quality model
GPU_ENABLED = True # Enable GPU acceleration if available
# Remove global session variable
# session = None

def extract_frames():
    if os.path.exists(FRAME_DIR):
        shutil.rmtree(FRAME_DIR)
    os.makedirs(FRAME_DIR)
    print("Extracting frames...")
    
    # Use os.path.join for consistent path handling
    frame_pattern = os.path.join(FRAME_DIR, "frame_%04d.png")
    
    subprocess.run([
        r"C:\ffmpeg\bin\ffmpeg.exe",
        "-i", INPUT_VIDEO,
        frame_pattern
    ])

def process_frame(args):
    """Process a single frame with background removal"""
    frame, input_dir, output_dir, session_model = args
    
    input_path = os.path.join(input_dir, frame)
    output_path = os.path.join(output_dir, frame)
    
    try:
        if not os.path.exists(input_path):
            print(f"Frame not found: {input_path}")
            return False
            
        with Image.open(input_path) as img:
            # Create a local session for this process (lazy-load)
            local_session = new_session(model_name=session_model)
            # Use the session
            no_bg = remove(img, session=local_session)
            no_bg.save(output_path)
        return True
    except Exception as e:
        print(f"Error processing {frame}: {e}")
        return False

def remove_backgrounds():
    if os.path.exists(OUTPUT_FRAME_DIR):
        shutil.rmtree(OUTPUT_FRAME_DIR)
    os.makedirs(OUTPUT_FRAME_DIR)
    
    print("Initializing background removal model...")
    
    frames = sorted(os.listdir(FRAME_DIR))
    if not frames:
        raise Exception("No frames were extracted from the video")
    
    # Get absolute paths to avoid issues with multiprocessing
    frame_dir_abs = os.path.abspath(FRAME_DIR)
    output_dir_abs = os.path.abspath(OUTPUT_FRAME_DIR)
        
    print(f"Removing backgrounds using {NUM_WORKERS} workers...")
    print(f"Input directory: {frame_dir_abs}")
    print(f"Output directory: {output_dir_abs}")
    
    # Prepare arguments - pass absolute paths and model name
    args_list = [(frame, frame_dir_abs, output_dir_abs, MODEL_NAME) for frame in frames]
    
    # Process frames with fewer workers to avoid memory issues
    actual_workers = min(NUM_WORKERS, 4)  # Limit to 4 workers max
    print(f"Using {actual_workers} workers for processing")
    
    # Process frames in parallel using multiprocessing
    with multiprocessing.Pool(processes=actual_workers) as pool:
        results = list(tqdm(
            pool.imap(process_frame, args_list),
            total=len(frames),
            desc="Processing frames"
        ))
    
    # Verify frames were processed
    if not os.path.exists(OUTPUT_FRAME_DIR):
        raise Exception("Output directory does not exist")
        
    processed_frames = os.listdir(OUTPUT_FRAME_DIR)
    if not processed_frames:
        raise Exception("No frames were processed successfully")
    print(f"Successfully processed {len(processed_frames)} frames")

def detect_fps():
    """Detect FPS from the input video"""
    result = subprocess.run([
        r"C:\ffmpeg\bin\ffprobe.exe", "-v", "error", 
        "-select_streams", "v:0", 
        "-show_entries", "stream=r_frame_rate", 
        "-of", "default=noprint_wrappers=1:nokey=1", 
        INPUT_VIDEO
    ], capture_output=True, text=True)
    
    fps_str = result.stdout.strip()
    if "/" in fps_str:
        numerator, denominator = map(int, fps_str.split('/'))
        return numerator / denominator
    else:
        return float(fps_str)

def create_video():
    print("Creating final video...")
    # Preserve original video FPS
    fps = detect_fps()
    print(f"Using original FPS: {fps}")
    
    # Use properly formatted path for output frames
    frame_pattern = os.path.join(OUTPUT_FRAME_DIR, "frame_%04d.png")
    
    # Check if output frames exist
    if not os.path.exists(OUTPUT_FRAME_DIR) or len(os.listdir(OUTPUT_FRAME_DIR)) == 0:
        raise Exception("No output frames available to create video")
        
    print(f"Found {len(os.listdir(OUTPUT_FRAME_DIR))} frames for video creation")
    
    # Use higher quality settings for the output
    subprocess.run([
        r"C:\ffmpeg\bin\ffmpeg.exe", 
        "-framerate", str(fps),
        "-i", frame_pattern,
        "-c:v", "libx264", "-preset", "medium", 
        "-crf", "18", # Higher quality (lower is better, 18-23 is good)
        "-pix_fmt", "yuv420p",
        OUTPUT_VIDEO
    ])

if __name__ == "__main__":
    start_time = time.time()
    
    print("Starting background removal process...")
    extract_frames()
    remove_backgrounds()
    create_video()
    
    duration = time.time() - start_time
    print(f"✅ Done! Processing took {duration:.2f} seconds")
    print(f"Output saved to: {OUTPUT_VIDEO}") 