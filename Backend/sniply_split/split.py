from ffmpeg import ffmpeg, FFmpeg
# ffmpeg -i o.mp4 -ss 00:00:00 -to 00:00:10 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k output_part1_reencoded.mp4

def split_video_in_time_range(input_vid, outpath, startfrom, cutto):
    try:
        ffmpeg = (
            FFmpeg()
            .input(input_vid)
            .output(
                outpath,
                ss=startfrom,
                to=cutto,
                **{
                    "c:v": "libx264",
                    "preset": "medium",
                    "crf": 23,
                    "c:a": "aac",
                    "b:a": "128k",
                }
            )
        )
        ffmpeg.execute()        
        return 1
    except:
        return 0


def split_video_in_two_segments(input_vid, outpathpart1, outpathpart2, segemnttime):
    try:
        split_video_in_time_range(input_vid, outpathpart1, "00:00:00", segemnttime)
        ffmpegp2 = FFmpeg().input(input_vid) \
                .output(
                    outpathpart2,
                    ss=segemnttime,
                    **{
                        "c:v": "libx264",
                        "preset": "medium",
                        "crf": 23,
                        "c:a": "aac",
                        "b:a": "128k",
                    }
                )
        ffmpegp2.execute()
        return 1
    except:
        return 0

# test
# print(split_video_in_time_range("o.mp4", "s.mp4", "00:00:05", "00:00:08"))
# print(split_video_in_two_segments("o.mp4", "p1.mp4", "p2.mp4", "00:00:01"))