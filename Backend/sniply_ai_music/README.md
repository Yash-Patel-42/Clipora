# 🎵 Sniply AI Music Library

A comprehensive music library system for the Sniply video editing application that provides intelligent music selection, mood-based recommendations, and dynamic music application.

## 🚀 Quick Start

### 1. Setup with Sample Music
```bash
# Create sample music files and organize them
python setup_music_library.py --setup
```

### 2. Import Your Own Music
```bash
# Import music from a directory
python setup_music_library.py --import /path/to/your/music/folder
```

### 3. Download Free Music
```bash
# Download from free APIs (requires API keys)
python setup_music_library.py --download
```

## ✨ Features

- 🎵 **Intelligent Music Selection**: Automatically analyzes video content and recommends matching music
- 🎭 **Mood Detection**: Uses computer vision to detect video mood (happy, sad, thrilling, calm, energetic, neutral)
- 🎼 **Music Library Management**: Organize music by mood, genre, artist, or year
- 🔄 **Dynamic Music Application**: Apply music with looping, fading, and volume control
- 🤖 **AI Music Generation**: Generate custom music based on mood and style
- 📥 **Bulk Import**: Import and tag large music collections automatically
- 🌐 **Free Music APIs**: Download royalty-free music from various sources

## 📁 File Organization

```
Backend/
├── sniply_ai_music/                    # 🎵 Core Music System
│   ├── __init__.py                     # Module exports
│   ├── music_library.py                # 🎼 Library management & selection
│   ├── music_processor.py              # 🔄 Audio processing & application
│   ├── music_importer.py               # 📥 Bulk import & tagging
│   ├── download_free_music.py          # 🌐 Free music downloader
│   ├── video_analysis.py               # 🎭 Video mood detection
│   ├── requirements.txt                # 📦 Dependencies
│   └── README.md                       # 📖 This documentation
├── setup_music_library.py              # 🚀 Main setup script (easy access)
├── music/                              # 🎵 Music library storage
│   ├── happy/                          # Happy mood tracks
│   ├── sad/                            # Sad mood tracks
│   ├── calm/                           # Calm mood tracks
│   ├── energetic/                      # Energetic mood tracks
│   ├── thrilling/                      # Thrilling mood tracks
│   ├── neutral/                        # Neutral mood tracks
│   └── music_library.json              # Library metadata
└── main.py                             # 🔌 Backend API endpoints
```

## 🎯 How It Works

### 1. Video Analysis
- Analyzes brightness, motion, color saturation
- Determines mood (happy, sad, thrilling, calm, energetic, neutral)
- Provides confidence scores and analysis data

### 2. Music Selection
- Matches video mood with music library
- Considers duration, energy, and style compatibility
- Provides alternative suggestions for low-confidence matches

### 3. Music Application
- Loops music if shorter than video
- Applies fade-in/fade-out effects
- Mixes with original audio at specified volume
- Supports various audio formats

## 🔌 API Endpoints

### Video Analysis
- `POST /analyze_video_mood` - Analyze video for mood detection
- `POST /music_recommendations` - Get intelligent music recommendations

### Music Library
- `GET /music_library` - Get all available music moods
- `GET /music_library/{mood}` - Get music for specific mood
- `GET /music_stats` - Get music library statistics

### Music Application
- `POST /apply_music` - Apply music to video with advanced features
- `POST /generate_ai_music` - Generate AI music based on parameters

## 🛠️ Tools and Scripts

### Music Importer (`music_importer.py`)
Bulk import and tag music files with automatic metadata extraction.

```bash
# Import music from directory
python music_importer.py /path/to/music/folder --organize-by mood --workers 4

# With Last.fm API for enhanced metadata
python music_importer.py /path/to/music/folder --lastfm-key YOUR_API_KEY
```

**Features:**
- Automatic metadata extraction from audio files
- Integration with Last.fm and MusicBrainz APIs
- Mood detection based on tags and metadata
- Parallel processing for large collections
- Metadata caching to avoid repeated API calls

### Free Music Downloader (`download_free_music.py`)
Download royalty-free music from various sources.

```bash
# Create sample music files
python download_free_music.py --create-samples

# Download from Pixabay
python download_free_music.py --pixabay-key YOUR_API_KEY --query "upbeat" --limit 20

# Download from Jamendo
python download_free_music.py --jamendo-key YOUR_API_KEY --query "electronic" --limit 15
```

**Supported Sources:**
- **Pixabay Music**: 1000 requests/day free
- **Jamendo Music**: 200 requests/day free
- **Free Music Archive**: Unlimited (no API key needed)

### Setup Script (`setup_music_library.py`)
Complete setup and management tool.

```bash
# Interactive setup
python setup_music_library.py

# Quick setup with samples
python setup_music_library.py --setup

# Import existing music
python setup_music_library.py --import /path/to/music

# Download from APIs
python setup_music_library.py --download

# Show usage instructions
python setup_music_library.py --help-usage
```

## 🌐 Free Music Sources

### No API Key Required
- **YouTube Audio Library**: https://www.youtube.com/audiolibrary/music
- **Free Music Archive**: https://freemusicarchive.org/
- **Bensound**: https://www.bensound.com/
- **Incompetech**: https://incompetech.com/music/
- **Pixabay Music**: https://pixabay.com/music/

### API Key Required (Free Tiers)
- **Pixabay**: https://pixabay.com/api/docs/ (1000 requests/day)
- **Jamendo**: https://developer.jamendo.com/ (200 requests/day)

## 📦 Installation

### Dependencies
```bash
# Install required packages
pip install -r sniply_ai_music/requirements.txt
```

### Required System Tools
- **FFmpeg**: For audio processing and music generation
- **Python 3.7+**: For running the scripts

## 💻 Usage Examples

### 1. Basic Music Import
```python
from sniply_ai_music.music_importer import MusicImporter

# Initialize importer
importer = MusicImporter("music")

# Import and organize music
organized = importer.import_from_directory(
    "/path/to/music/folder",
    organize_by='mood',
    max_workers=4
)

# Generate library JSON
library_json = importer.generate_music_library_json(organized)
```

### 2. Video Analysis and Recommendations
```python
from sniply_ai_music.video_analysis import analyze_video_mood
from sniply_ai_music.music_processor import get_music_recommendations

# Analyze video
analysis = analyze_video_mood("video.mp4")

# Get recommendations
recommendations = get_music_recommendations(analysis, video_duration=60)
```

### 3. Apply Music to Video
```python
from sniply_ai_music.music_processor import apply_music_to_video

# Apply music with advanced features
result = apply_music_to_video(
    video_path="input.mp4",
    output_path="output.mp4",
    music_id="happy_1",
    volume=0.3,
    fade_in=2.0,
    fade_out=2.0,
    loop_music=True
)
```

## 🎨 Frontend Integration

The backend is ready for frontend integration. Key endpoints:

```javascript
// Analyze video mood
const analysis = await fetch('/analyze_video_mood', {
  method: 'POST',
  body: formData
});

// Get music recommendations
const recommendations = await fetch('/music_recommendations', {
  method: 'POST',
  body: formData
});

// Apply music to video
const result = await fetch('/apply_music', {
  method: 'POST',
  body: formData
});
```

## ⚙️ Configuration

### API Keys (Optional)
Get free API keys for enhanced features:
1. **Last.fm**: https://www.last.fm/api/account/create
2. **Pixabay**: https://pixabay.com/api/docs/
3. **Jamendo**: https://developer.jamendo.com/

### Music Library Settings
Edit `music_library.py` to customize:
- Mood mapping keywords
- Music categorization
- Default music properties

## 🔧 Troubleshooting

### Common Issues
1. **FFmpeg not found**: Install FFmpeg and ensure it's in your PATH
2. **API rate limits**: Respect API limits and implement caching
3. **Large file imports**: Use parallel processing with `--workers` parameter
4. **Metadata extraction fails**: Check file format support and file integrity

### Performance Tips
- Use parallel processing for large music collections
- Enable metadata caching to avoid repeated API calls
- Organize music by mood for faster recommendations
- Use compressed audio formats (MP3) for storage efficiency

## 🚀 Next Steps

### Immediate Actions
1. **Add Real Music**: Replace sample files with actual music tracks
2. **Test Features**: Upload videos and test mood analysis
3. **Customize**: Adjust mood detection and selection algorithms
4. **Scale**: Add more music sources and genres

### Future Enhancements
- **User Uploads**: Allow users to upload their own music
- **Playlist Support**: Create and manage music playlists
- **Advanced AI**: Integrate with AI music generation services
- **Music Analysis**: Add BPM detection and advanced audio analysis
- **Collaborative Filtering**: Learn from user preferences

## 🤝 Contributing

To add new music sources or improve the system:

1. Add new API integrations to `download_free_music.py`
2. Extend mood detection in `video_analysis.py`
3. Improve music selection algorithms in `music_library.py`
4. Add new audio processing features to `music_processor.py`

## 📄 License

This music library system is part of the Sniply video editing application. Ensure you have proper licenses for any music you use in your projects.

---

## 🎉 You're All Set!

Your Sniply video editing app now has a **professional-grade music library system** that:
- ✅ Automatically matches music to video content
- ✅ Provides intelligent recommendations
- ✅ Supports bulk music management
- ✅ Integrates with free music sources
- ✅ Scales from small to large music collections

**Start adding your music and enjoy the dynamic, intelligent music features!** 🎵 