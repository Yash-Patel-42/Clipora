import os
from PIL import Image
from rembg import remove


def remove_bg_image(input_path, output_path):
    with Image.open(input_path) as img:
        no_bg = remove(img)
        if output_path.lower().endswith((".jpg", ".jpeg")):
            no_bg = no_bg.convert("RGB")
        no_bg.save(output_path)


def remove_bg_gif(input_path, output_path):
    with Image.open(input_path) as img:
        frames = []
        for frame in range(img.n_frames):
            img.seek(frame)
            no_bg_frame = remove(img)
            frames.append(no_bg_frame)

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            loop=0,
            duration=img.info.get("duration", 100),
        )


def remove_background_from_media(input_path, output_path):
    file_ext = os.path.splitext(input_path)[1].lower()
    if file_ext == ".gif":
        remove_bg_gif(input_path, output_path)
    else:
        remove_bg_image(input_path, output_path)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 3:
        print("Usage: python remove_icon_bg.py <input_path> <output_path>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    remove_background_from_media(input_file, output_file)
