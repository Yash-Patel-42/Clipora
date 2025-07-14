#!/usr/bin/env python3
"""
Legal Music Downloader for Sniply AI Music Library
Downloads royalty-free music from legal, free sources
"""

import os
import requests
import json
import time
from pathlib import Path
from urllib.parse import urljoin, quote
import argparse
from typing import List, Dict, Optional

# Load environment variables from .env file
def load_env_file(env_path: str = ".env"):
    """Load environment variables from .env file"""
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# Load .env file at module import
load_env_file()

class LegalMusicDownloader:
    """Downloads music from legal, free sources"""
    
    def __init__(self, output_dir: str = "music"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Create mood directories
        self.moods = ['happy', 'sad', 'calm', 'energetic', 'thrilling', 'neutral']
        for mood in self.moods:
            (self.output_dir / mood).mkdir(exist_ok=True)
    
    def download_from_freemusicarchive(self, genre: str = "Electronic", limit: int = 10) -> List[str]:
        """Download from Free Music Archive (no API key needed)"""
        print(f"🎵 Downloading {limit} {genre} tracks from Free Music Archive...")
        
        # FMA provides a public dataset, but direct downloads are limited
        # This is a demonstration of how to structure the downloader
        downloaded_files = []
        
        # Example structure for FMA downloads
        base_url = "https://files.freemusicarchive.org/storage-freemusicarchive-org"
        
        # Note: FMA doesn't provide a public API for direct downloads
        # This would require manual selection from their website
        print("⚠️  Free Music Archive requires manual download from their website")
        print("🌐 Visit: https://freemusicarchive.org/")
        print("📥 Download tracks manually and place them in the music folder")
        
        return downloaded_files
    
    def download_from_pixabay(self, api_key: str, query: str, limit: int = 10) -> List[str]:
        """Download from Pixabay (requires free API key)"""
        if not api_key:
            print("⚠️  Pixabay API key required. Get one at: https://pixabay.com/api/docs/")
            return []
        
        print(f"🎵 Downloading {limit} '{query}' tracks from Pixabay...")
        
        # Pixabay API for images (audio is part of images API)
        url = "https://pixabay.com/api/"
        params = {
            'key': api_key,
            'q': query,
            'per_page': min(limit, 3),  # Start with small limit
            'safesearch': 'true',
            'image_type': 'all'  # Include all types including audio
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Debug: Print API response structure
            print(f"🔍 API Response: Found {len(data.get('hits', []))} results")
            if data.get('hits'):
                first_hit = data['hits'][0]
                print(f"🔍 First result keys: {list(first_hit.keys())}")
                print(f"🔍 Sample result: {first_hit}")
            
            downloaded_files = []
            
            downloaded_count = 0
            for i, hit in enumerate(data.get('hits', [])):
                if downloaded_count >= limit:
                    break
                    
                # Check for audio URL - Pixabay audio files are in the 'audio' field
                audio_url = hit.get('audio')
                
                if not audio_url:
                    print(f"⚠️  Skipping '{hit.get('user', 'Unknown')}' - no audio URL")
                    print(f"   Available keys: {list(hit.keys())}")
                    continue
                
                # Determine mood based on tags
                tags = hit.get('tags', '').lower()
                mood = self._determine_mood_from_tags(tags)
                
                # Download file
                filename = f"{mood}_{i+1}.mp3"
                filepath = self.output_dir / mood / filename
                
                print(f"📥 Downloading: {hit.get('user', 'Unknown')} -> {mood}/")
                
                try:
                    audio_response = requests.get(audio_url, stream=True)
                    audio_response.raise_for_status()
                    
                    with open(filepath, 'wb') as f:
                        for chunk in audio_response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    downloaded_files.append(str(filepath))
                    downloaded_count += 1
                    time.sleep(1)  # Be respectful to the API
                    
                except Exception as e:
                    print(f"❌ Failed to download {filename}: {e}")
            
            print(f"✅ Downloaded {len(downloaded_files)} tracks from Pixabay")
            if len(downloaded_files) == 0:
                print("💡 Try different search terms like: 'music', 'instrumental', 'background', 'electronic'")
            return downloaded_files
            
        except Exception as e:
            print(f"❌ Pixabay API error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    print(f"🔍 API Error details: {error_data}")
                except:
                    print(f"🔍 API Response text: {e.response.text}")
            return []
    
    def download_from_jamendo(self, api_key: str, query: str, limit: int = 10) -> List[str]:
        """Download from Jamendo (requires free API key)"""
        if not api_key:
            print("⚠️  Jamendo API key required. Get one at: https://developer.jamendo.com/")
            return []
        
        print(f"🎵 Downloading {limit} '{query}' tracks from Jamendo...")
        
        url = "https://api.jamendo.com/v3/tracks/"
        params = {
            'client_id': api_key,
            'search': query,
            'limit': min(limit, 20),  # Jamendo limit
            'format': 'json'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            downloaded_files = []
            
            for i, track in enumerate(data.get('results', [])):
                if i >= limit:
                    break
                
                audio_url = track.get('audio')
                if not audio_url:
                    continue
                
                # Determine mood based on tags
                tags = ' '.join(track.get('tags', [])).lower()
                mood = self._determine_mood_from_tags(tags)
                
                # Download file
                filename = f"{mood}_{i+1}.mp3"
                filepath = self.output_dir / mood / filename
                
                print(f"📥 Downloading: {track.get('name', 'Unknown')} -> {mood}/")
                
                try:
                    audio_response = requests.get(audio_url, stream=True)
                    audio_response.raise_for_status()
                    
                    with open(filepath, 'wb') as f:
                        for chunk in audio_response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    downloaded_files.append(str(filepath))
                    time.sleep(1)  # Be respectful to the API
                    
                except Exception as e:
                    print(f"❌ Failed to download {filename}: {e}")
            
            print(f"✅ Downloaded {len(downloaded_files)} tracks from Jamendo")
            return downloaded_files
            
        except Exception as e:
            print(f"❌ Jamendo API error: {e}")
            return []
    
    def _determine_mood_from_tags(self, tags: str) -> str:
        """Determine mood from music tags"""
        tags_lower = tags.lower()
        
        mood_keywords = {
            'happy': ['happy', 'upbeat', 'cheerful', 'joyful', 'positive', 'bright'],
            'sad': ['sad', 'melancholy', 'sorrowful', 'depressing', 'dark'],
            'calm': ['calm', 'peaceful', 'relaxing', 'ambient', 'chill', 'soft'],
            'energetic': ['energetic', 'upbeat', 'fast', 'dance', 'electronic', 'rock'],
            'thrilling': ['thrilling', 'intense', 'dramatic', 'epic', 'action', 'suspense'],
            'neutral': ['neutral', 'background', 'instrumental', 'classical']
        }
        
        for mood, keywords in mood_keywords.items():
            if any(keyword in tags_lower for keyword in keywords):
                return mood
        
        return 'neutral'  # Default mood
    
    def create_sample_music(self) -> List[str]:
        """Create sample music files for testing"""
        print("🎵 Creating sample music files for testing...")
        
        sample_files = []
        
        for mood in self.moods:
            for i in range(3):  # Create 3 sample files per mood
                filename = f"{mood}_{i+1}.mp3"
                filepath = self.output_dir / mood / filename
                
                # Create a simple text file as placeholder
                with open(filepath, 'w') as f:
                    f.write(f"Sample {mood} music file {i+1}\n")
                    f.write("This is a placeholder file for testing.\n")
                    f.write("Replace with actual music files.\n")
                
                sample_files.append(str(filepath))
                print(f"📝 Created: {mood}/{filename}")
        
        print(f"✅ Created {len(sample_files)} sample music files")
        return sample_files
    
    def show_download_sources(self):
        """Show available download sources and instructions"""
        print("🎵 Available Music Download Sources:")
        print()
        print("1. 🌐 Free Music Archive")
        print("   - URL: https://freemusicarchive.org/")
        print("   - No API key needed")
        print("   - Manual download required")
        print()
        print("2. 🎨 Pixabay Music")
        print("   - URL: https://pixabay.com/music/")
        print("   - API: https://pixabay.com/api/docs/")
        print("   - Free tier: 1000 requests/day")
        print()
        print("3. 🎼 Jamendo")
        print("   - URL: https://www.jamendo.com/")
        print("   - API: https://developer.jamendo.com/")
        print("   - Free tier: 200 requests/day")
        print()
        print("4. 📺 YouTube Audio Library")
        print("   - URL: https://www.youtube.com/audiolibrary/music")
        print("   - No API key needed")
        print("   - Manual download required")
        print()
        print("5. 🎵 Bensound")
        print("   - URL: https://www.bensound.com/")
        print("   - No API key needed")
        print("   - Manual download required")
        print()

def main():
    parser = argparse.ArgumentParser(description="Download music from legal, free sources")
    parser.add_argument("--output", default="music", help="Output directory for music files")
    parser.add_argument("--sources", action="store_true", help="Show available download sources")
    parser.add_argument("--create-samples", action="store_true", help="Create sample music files")
    parser.add_argument("--pixabay-key", help="Pixabay API key (or use PIXABAY_API_KEY env var)")
    parser.add_argument("--jamendo-key", help="Jamendo API key")
    parser.add_argument("--query", default="upbeat", help="Search query for music")
    parser.add_argument("--limit", type=int, default=10, help="Number of tracks to download")
    parser.add_argument("--auto-download", action="store_true", help="Auto-download using environment API keys")
    
    args = parser.parse_args()
    
    downloader = LegalMusicDownloader(args.output)
    
    if args.sources:
        downloader.show_download_sources()
        return
    
    if args.create_samples:
        downloader.create_sample_music()
        return
    
    downloaded_files = []
    
    # Get API keys from environment or arguments
    pixabay_key = args.pixabay_key or os.getenv('PIXABAY_API_KEY')
    jamendo_key = args.jamendo_key or os.getenv('JAMENDO_API_KEY')
    
    # Auto-download mode
    if args.auto_download:
        print("🚀 Auto-download mode: Using environment API keys...")
        
        if pixabay_key:
            print("📥 Downloading from Pixabay...")
            files = downloader.download_from_pixabay(pixabay_key, args.query, args.limit)
            downloaded_files.extend(files)
        else:
            print("⚠️  No Pixabay API key found in environment")
        
        if jamendo_key:
            print("📥 Downloading from Jamendo...")
            files = downloader.download_from_jamendo(jamendo_key, args.query, args.limit)
            downloaded_files.extend(files)
        else:
            print("⚠️  No Jamendo API key found in environment")
    
    # Manual mode
    else:
        # Try Pixabay if API key provided
        if pixabay_key:
            files = downloader.download_from_pixabay(pixabay_key, args.query, args.limit)
            downloaded_files.extend(files)
        
        # Try Jamendo if API key provided
        if jamendo_key:
            files = downloader.download_from_jamendo(jamendo_key, args.query, args.limit)
            downloaded_files.extend(files)
    
    if not downloaded_files:
        print("ℹ️  No API keys provided or no files downloaded. Creating sample files instead...")
        downloader.create_sample_music()
        print()
        print("💡 To download real music:")
        print("   python legal_music_downloader.py --auto-download")
        print("   python legal_music_downloader.py --pixabay-key YOUR_KEY --query 'upbeat'")
    
    print(f"\n🎉 Music download complete! Files saved to: {args.output}/")

if __name__ == "__main__":
    main() 