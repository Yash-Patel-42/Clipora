import os
import shutil
import subprocess
import time
from functools import partial
from multiprocessing import Pool, cpu_count

from PIL import Image
from rembg import new_session, remove
from tqdm import tqdm


def run_bg_removal_pipeline(
    input_video: str,
    output_video: str,
    model_name: str = "u2netp",  # Reverted to lightweight model for CPU
    frame_rate: int = 30,
    workers: int = min(cpu_count(), 4),  # Conservative workers for cloud CPUs
    batch_size: int = 5,  # Smaller batches for lower memory
):
    """Runs the complete background removal pipeline on CPU."""
    print(f"Starting background removal for {input_video}...")
    t0 = time.time()

    base_dir = os.path.dirname(input_video)
    # Create unique subdirectories for concurrent runs
    run_id = os.path.splitext(os.path.basename(input_video))[0]
    frame_dir = os.path.join(base_dir, f"frames_{run_id}")
    output_frame_dir = os.path.join(base_dir, f"no_bg_frames_{run_id}")

    try:
        # 1. Extract frames
        extract_frames(input_video, frame_dir, frame_rate)

        # 2. Remove backgrounds
        remove_backgrounds(frame_dir, output_frame_dir, model_name, workers, batch_size)

        # 3. Create video
        create_video(output_frame_dir, output_video, frame_rate)

    finally:
        # 4. Clean up
        shutil.rmtree(frame_dir, ignore_errors=True)
        shutil.rmtree(output_frame_dir, ignore_errors=True)
        print(f"Cleaned up temporary directories.")

    print(f"Background removal done in {time.time() - t0:.1f}s")


def extract_frames(input_video: str, frame_dir: str, frame_rate: int):
    print(f"Extracting frames to {frame_dir}...")
    os.makedirs(frame_dir, exist_ok=True)

    subprocess.run(
        [
            "ffmpeg",
            "-i",
            input_video,
            "-r",
            str(frame_rate),
            os.path.join(frame_dir, "frame_%06d.png"),
            "-hide_banner",
            "-loglevel",
            "error",
        ],
        check=True,
    )


def remove_backgrounds(
    frame_dir: str,
    output_frame_dir: str,
    model_name: str,
    workers: int,
    batch_size: int,
):
    print(f"Removing backgrounds from frames in {frame_dir}...")
    os.makedirs(output_frame_dir, exist_ok=True)

    frame_files = sorted([f for f in os.listdir(frame_dir) if f.endswith(".png")])

    # Create batches of frame filenames
    batches = [
        frame_files[i : i + batch_size] for i in range(0, len(frame_files), batch_size)
    ]

    process_func = partial(
        process_batch,
        frame_dir=frame_dir,
        output_frame_dir=output_frame_dir,
        model_name=model_name,
    )

    print(
        f"Processing {len(frame_files)} frames in {len(batches)} batches across {workers} workers..."
    )
    with Pool(workers) as p:
        list(tqdm(p.imap(process_func, batches), total=len(batches)))


def process_batch(
    batch_files: list[str], frame_dir: str, output_frame_dir: str, model_name: str
):
    """Processes a batch of frames in a single CPU-bound process."""
    # Create one session per worker process. This is the key optimization.
    session = new_session(model_name)

    for frame_file in batch_files:
        in_path = os.path.join(frame_dir, frame_file)
        out_path = os.path.join(output_frame_dir, frame_file)

        try:
            with Image.open(in_path) as img:
                no_bg = remove(img, session=session)
                no_bg.save(out_path)
        except Exception as e:
            print(f"Error processing {frame_file}: {e}")


def create_video(output_frame_dir: str, output_video: str, frame_rate: int):
    print(f"Creating video {output_video}...")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(frame_rate),
            "-i",
            os.path.join(output_frame_dir, "frame_%06d.png"),
            "-c:v",
            "libx264",  # Standard CPU-based encoder
            "-preset",
            "fast",
            "-pix_fmt",
            "yuv420p",
            output_video,
            "-hide_banner",
            "-loglevel",
            "error",
        ],
        check=True,
    )


if __name__ == "__main__":
    # Create a dummy video file for testing if it doesn'''t exist
    if not os.path.exists("input.mp4"):
        print("Creating a dummy input.mp4 for testing...")
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "lavfi",
                "-i",
                "testsrc=duration=5:size=1280x720:rate=30",
                "-t",
                "5",
                "input.mp4",
            ]
        )

    run_bg_removal_pipeline(
        input_video="input.mp4",
        output_video="output.mp4",
    )
