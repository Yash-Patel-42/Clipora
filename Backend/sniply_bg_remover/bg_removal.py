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
    model_name: str = "u2netp",
    frame_rate: int = 30,
    workers: int = min(cpu_count(), 6),
):
    """Runs the complete background removal pipeline."""
    print(f"Starting background removal for {input_video}...")
    t0 = time.time()

    base_dir = os.path.dirname(input_video)
    frame_dir = os.path.join(base_dir, "frames")
    output_frame_dir = os.path.join(base_dir, "no_bg_frames")

    # 1. Extract frames
    extract_frames(input_video, frame_dir, frame_rate)

    # 2. Remove backgrounds
    remove_backgrounds(frame_dir, output_frame_dir, model_name, workers)

    # 3. Create video
    create_video(output_frame_dir, output_video, frame_rate)

    # 4. Clean up
    shutil.rmtree(frame_dir, ignore_errors=True)
    shutil.rmtree(output_frame_dir, ignore_errors=True)

    print(f"Background removal done in {time.time() - t0:.1f}s")


def extract_frames(input_video: str, frame_dir: str, frame_rate: int):
    print(f"Extracting frames to {frame_dir}...")
    shutil.rmtree(frame_dir, ignore_errors=True)
    os.makedirs(frame_dir)
    subprocess.run(
        [
            "ffmpeg",
            "-i",
            input_video,
            "-r",
            str(frame_rate),
            os.path.join(frame_dir, "frame_%04d.png"),
            "-hide_banner",
            "-loglevel",
            "error",
        ],
        check=True,
    )


def remove_backgrounds(
    frame_dir: str, output_frame_dir: str, model_name: str, workers: int
):
    print(f"Removing backgrounds from frames in {frame_dir}...")
    shutil.rmtree(output_frame_dir, ignore_errors=True)
    os.makedirs(output_frame_dir)
    frames = sorted(os.listdir(frame_dir))

    process_func = partial(
        process_frame_wrapper,
        frame_dir=frame_dir,
        output_frame_dir=output_frame_dir,
        model_name=model_name,
    )

    with Pool(workers) as p:
        list(tqdm(p.imap(process_func, frames), total=len(frames)))


def process_frame_wrapper(
    frame_file: str, frame_dir: str, output_frame_dir: str, model_name: str
):
    session = new_session(model_name=model_name)
    in_path = os.path.join(frame_dir, frame_file)
    out_path = os.path.join(output_frame_dir, frame_file)
    try:
        with Image.open(in_path) as img:
            no_bg = remove(img, session=session)
            no_bg.save(out_path)
        return True
    except Exception as e:
        print(f"{frame_file}: {e}")
        return False


def create_video(output_frame_dir: str, output_video: str, frame_rate: int):
    print(f"Creating video {output_video}...")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(frame_rate),
            "-i",
            os.path.join(output_frame_dir, "frame_%04d.png"),
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-pix_fmt",
            "yuv420p",
            output_video,
        ],
        check=True,
    )


if __name__ == "__main__":
    run_bg_removal_pipeline(
        input_video="input.mp4",
        output_video="output.mp4",
    )
