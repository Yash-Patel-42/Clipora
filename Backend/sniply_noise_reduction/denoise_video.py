import os
import subprocess
import sys
import time
import urllib.request
import zipfile

FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"


def ensure_rnnoise_model():
    model_dir = os.path.join(os.getcwd(), "rnnoise_models")
    os.makedirs(model_dir, exist_ok=True)

    relative_model_file = "rnnoise-models-master/cleanvoice/cleanvoice.rnnn"
    model_path = os.path.join(model_dir, relative_model_file)

    if os.path.exists(model_path):
        return model_path

    print("⬇Downloading RNNoise models...")
    repo_zip_url = (
        "https://github.com/GregorR/rnnoise-models/archive/refs/heads/master.zip"
    )
    zip_path = os.path.join(model_dir, "rnnoise_models_master.zip")
    urllib.request.urlretrieve(repo_zip_url, zip_path)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(model_dir)
    os.remove(zip_path)

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    print("Model ready:", model_path)
    return model_path


def run_ffmpeg(cmd):
    print(" ".join(cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print("FFmpeg error:")
        print(proc.stderr)
        raise subprocess.CalledProcessError(
            proc.returncode, cmd, proc.stdout, proc.stderr
        )
    return proc


def has_audio_stream(input_path):
    cmd = [
        FFMPEG_PATH,
        "-v",
        "error",
        "-select_streams",
        "a",
        "-show_entries",
        "stream=index",
        "-of",
        "csv=p=0",
        "-i",
        input_path,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return bool(proc.stdout.strip())


def fast_denoise(input_video):
    start = time.time()
    base_dir = os.path.dirname(os.path.abspath(input_video))
    temp_audio = os.path.join(base_dir, "temp_clean_audio.wav")
    temp_video = os.path.join(base_dir, "temp_clean_video.mp4")
    output_final = os.path.join(base_dir, "output_final.mp4")

    # ---------------- Step 1: Check audio presence ----------------
    if not has_audio_stream(input_video):
        print("Input file has no audio stream. Skipping audio denoise.")
        audio_present = False
    else:
        audio_present = True

    # ---------------- Step 2: Audio Denoising ----------------
    if audio_present:
        model_path = ensure_rnnoise_model()
        model_rel = os.path.relpath(model_path, os.getcwd()).replace("\\", "/")
        print("Using model:", model_rel)
        arnndn_filter = f"arnndn=m='{model_rel}'"

        try:
            run_ffmpeg(
                [
                    FFMPEG_PATH,
                    "-i",
                    input_video,
                    "-af",
                    arnndn_filter,
                    "-vn",
                    "-y",
                    temp_audio,
                ]
            )
            print("RNNoise denoising applied.")
        except Exception:
            print("RNNoise unavailable, using afftdn fallback.")
            run_ffmpeg(
                [
                    FFMPEG_PATH,
                    "-i",
                    input_video,
                    "-af",
                    "afftdn=nf=-25",
                    "-vn",
                    "-y",
                    temp_audio,
                ]
            )
            print("afftdn denoising completed.")
    else:
        temp_audio = None

    # ---------------- Step 3: Video Denoising ----------------
    print("🎥 Reducing video noise (HQDN3D)...")
    video_filter = "hqdn3d=4.0:3.0:6.0:4.5"

    try:
        run_ffmpeg(
            [
                FFMPEG_PATH,
                "-hwaccel",
                "cuda",
                "-i",
                input_video,
                "-vf",
                video_filter,
                "-c:v",
                "h264_nvenc",
                "-preset",
                "p4",
                "-b:v",
                "4M",
                "-y",
                temp_video,
            ]
        )
        print("GPU video denoise successful.")
    except Exception:
        print("GPU path failed; falling back to CPU...")
        run_ffmpeg(
            [
                FFMPEG_PATH,
                "-i",
                input_video,
                "-vf",
                video_filter,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-crf",
                "20",
                "-y",
                temp_video,
            ]
        )
        print("CPU video denoise done.")

    # ---------------- Step 4: Combine ----------------
    print("Merging video + audio...")
    if temp_audio and os.path.exists(temp_audio):
        run_ffmpeg(
            [
                FFMPEG_PATH,
                "-i",
                temp_video,
                "-i",
                temp_audio,
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-shortest",
                "-y",
                output_final,
            ]
        )
    else:
        run_ffmpeg(
            [FFMPEG_PATH, "-i", temp_video, "-c:v", "copy", "-an", "-y", output_final]
        )

    # ---------------- Cleanup ----------------
    for temp in [temp_audio, temp_video]:
        if temp and os.path.exists(temp):
            os.remove(temp)

    print(f"All done! Output: {output_final}")
    print(f"Total time: {time.time() - start:.2f}s")
    return output_final


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python smart_denoise.py <input_video_path>")
        sys.exit(1)
    fast_denoise(sys.argv[1])
