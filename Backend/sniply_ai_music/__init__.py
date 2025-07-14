"""
Sniply AI Music Library Module

A comprehensive music library system for intelligent music selection,
mood-based recommendations, and dynamic music application.
"""

# Import main components for easy access
from .music_library import (
    get_music_library,
    get_music_track,
    select_music_for_video,
    get_music_stats
)

from .music_processor import (
    apply_music_to_video,
    generate_ai_music,
    get_music_recommendations
)

from .video_analysis import analyze_video_mood

from .music_importer import MusicImporter

from .download_free_music import FreeMusicDownloader

__version__ = "1.0.0"
__author__ = "Sniply Team"

__all__ = [
    # Music library functions
    'get_music_library',
    'get_music_track', 
    'select_music_for_video',
    'get_music_stats',
    
    # Music processing functions
    'apply_music_to_video',
    'generate_ai_music',
    'get_music_recommendations',
    
    # Video analysis
    'analyze_video_mood',
    
    # Import and download tools
    'MusicImporter',
    'FreeMusicDownloader'
] 