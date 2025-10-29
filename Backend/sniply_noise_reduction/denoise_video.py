import os
import subprocess
import sys
import time

# Path to FFmpeg
FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"


def fast_denoise(input_video):
    start_time = time.time()
    base_dir = os.path.dirname(os.path.abspath(input_video))
    temp_audio = os.path.join(base_dir, "temp_clean_audio.wav")
    temp_video = os.path.join(base_dir, "temp_clean_video.mp4")
    output_final = os.path.join(base_dir, "output_final.mp4")

    # ---------------- Step 1: Denoise Audio using FFmpeg (afftdn or arnndn) ----------------
    print("🔊 Reducing audio noise (fast FFmpeg)...")
    subprocess.run(
        [
            FFMPEG_PATH,
            "-i",
            input_video,
            "-af",
            "afftdn=nf=-25",  # Simple fast FFT-based noise reduction
            "-vn",
            "-y",
            temp_audio,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Optional: For higher quality (slower), use RNNoise model
    # "-af", "arnndn=m=rnnoise-models/generalized_audio.model"

    # ---------------- Step 2: Denoise Video using FFmpeg (GPU or CPU) ----------------
    print("🎥 Reducing video noise (fast FFmpeg)...")

    # Choose your filter:
    # hqdn3d → best balance between speed and quality
    # nlmeans → very clean but slower
    # atadenoise → preserves details

    video_filter = "hqdn3d=4.0:3.0:6.0:4.5"

    # Use CUDA if available (super fast)
    try:
        subprocess.run(
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
            ],
            check=True,
        )
        print("✅ GPU acceleration enabled.")
    except subprocess.CalledProcessError:
        print("⚠️ GPU encoding not available, using CPU instead...")
        subprocess.run(
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
            ],
            check=True,
        )

    # ---------------- Step 3: Combine Denoised Audio + Video ----------------
    print("🎬 Merging cleaned video + audio...")
    subprocess.run(
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

    # ---------------- Step 4: Cleanup ----------------
    os.remove(temp_audio)
    os.remove(temp_video)

    print(f"✅ Done! Output: {output_final}")
    print(f"⚡ Total time: {time.time() - start_time:.2f} seconds")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fast_denoise.py <input_video_path>")
    else:
        fast_denoise(sys.argv[1])
