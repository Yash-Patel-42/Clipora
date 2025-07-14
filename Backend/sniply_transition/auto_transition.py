from moviepy.editor import VideoFileClip, vfx

def apply_transition_effect(input_path, output_path, transition_type='fade', transition_duration=1.0):
    """
    Applies a transition effect to a single video and saves the result.
    Supported types: fade, zoom, blur
    """
    clip = VideoFileClip(input_path)
    if transition_type == 'fade':
        clip = clip.fadein(transition_duration).fadeout(transition_duration)
    elif transition_type == 'zoom':
        clip = clip.fx(vfx.resize, lambda t: 1 + 0.02 * t)
    elif transition_type == 'blur':
        clip = clip.fx(vfx.gaussian_blur, radius=3)
    # Add more transitions as needed
    clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    return output_path
