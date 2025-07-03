from faster_whisper import WhisperModel
models = {
    # "tiny" :  WhisperModel("tiny", device="auto", compute_type="int8"),
    # "tiny.en" : WhisperModel("tiny.en", device="auto", compute_type="int8"),
    # "base" : WhisperModel("base", device="auto", compute_type="int8"),
    # "base.en" : WhisperModel("base.en", device="auto", compute_type="int8"),
    # "small" : WhisperModel("small", device="auto", compute_type="int8"),
    # "small.en" : WhisperModel("small.en", device="auto", compute_type="int8"),
    # "distil-small.en" : WhisperModel("distil-small.en", device="auto", compute_type="int8"),
    # "medium" : WhisperModel("medium", device="auto", compute_type="int8"),
    # "medium.en" : WhisperModel("medium.en", device="auto", compute_type="int8"),
    # "distil-medium.en" : WhisperModel("distil-medium.en", device="auto", compute_type="int8"),
    # "large-v1" : WhisperModel("large-v1", device="auto", compute_type="int8"),
    # "large-v2" : WhisperModel("large-v2", device="auto", compute_type="int8"),
    # "large-v3" : WhisperModel("large-v3", device="auto", compute_type="int8"),
    "large" : WhisperModel("large", device="auto", compute_type="int8")
    # "distil-large-v2" : WhisperModel("distil-large-v2", device="auto", compute_type="int8"),
    # "distil-large-v3" : WhisperModel("distil-large-v3", device="auto", compute_type="int8"),
    # "large-v3-turbo" : WhisperModel("large-v3-turbo", device="auto", compute_type="int8"),
    # "turbo" : WhisperModel("turbo", device="auto", compute_type="int8")
}
def get_model(modelSize):
    print("selecting model")
    return models.get(modelSize,0)