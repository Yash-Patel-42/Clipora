print("=== Starting FastAPI app import ===")
from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

from sniply_bg_remover.bg_remover_router import bg_remover_router
from sniply_captions_generator.captions_router import captions_router
# from sniply_ai_music.ai_music_router import ai_music_router
# from sniply_color_grading.color_grading_router import color_grading_router
# from sniply_export.export_router import export_router
# from sniply_manual_trim.manual_trim_router import manual_trim_router
# from sniply_noise_reduction.noise_reduction_router import noise_reduction_router
# from sniply_smart_trim_silence_part.smart_trim_router import smart_trim_router
# from sniply_split.split_router import split_router
# from sniply_text_apply.text_apply_router import text_apply_router
# from sniply_transition.transition_router import transition_router

app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.include_router(bg_remover_router, prefix="/process/bg_remover")
app.include_router(captions_router, prefix="/process/captions")
# app.include_router(ai_music_router, prefix="/process/ai_music")
# app.include_router(color_grading_router, prefix="/process/color_grading")
# app.include_router(export_router, prefix="/process/export")
# app.include_router(manual_trim_router, prefix="/process/manual_trim")
# app.include_router(noise_reduction_router, prefix="/process/noise_reduction")
# app.include_router(smart_trim_router, prefix="/process/smart_trim")
# app.include_router(split_router, prefix="/process/split")
# app.include_router(text_apply_router, prefix="/process/text_apply")
# app.include_router(transition_router, prefix="/process/transition")

@app.get("/")
def read_root():
    return {"message": "Sniply backend is running!"} 

