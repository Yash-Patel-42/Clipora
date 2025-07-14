#!/usr/bin/env python3
"""
Free Music Downloader for Sniply
Downloads royalty-free music from various sources and prepares them for import
"""

import os
import requests
import json
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FreeMusicDownloader:
    def __init__(self, download_dir: str = "downloads"):
        """
        Initialize the free music downloader
        Args:
            download_dir: Directory to store downloaded music
        """
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)
        
        # Free music sources
        self.sources = {
            'pixabay': {
                'name': 'Pixabay Music',
                'url': 'https://pixabay.com/music/',
                'api_url': 'https://pixabay.com/api/',
                'api_key_required': True,
                'free_tier': '1000 requests/day'
            },
            'freemusicarchive': {
                'name': 'Free Music Archive',
                'url': 'https://freemusicarchive.org/',
                'api_url': 'https://freemusicarchive.org/api/',
                'api_key_required': False,
                'free_tier': 'Unlimited'
            },
            'jamendo': {
                'name': 'Jamendo Music',
                'url': 'https://www.jamendo.com/',
                'api_url': 'https://api.jamendo.com/v3/',
                'api_key_required': True,
                'free_tier': '200 requests/day'
            }
        }
        
        # Sample free music URLs (these are examples - you'd need to find actual free music)
        self.sample_music_urls = {
            'happy': [
                'https://example.com/happy1.mp3',
                'https://example.com/happy2.mp3'
            ],
            'sad': [
                'https://example.com/sad1.mp3',
                'https://example.com/sad2.mp3'
            ],
            'calm': [
                'https://example.com/calm1.mp3',
                'https://example.com/calm2.mp3'
            ]
        }
    
    def download_from_url(self, url: str, filename: str = None) -> str:
        """
        Download a music file from URL
        Args:
            url: URL to download from
            filename: Optional filename to save as
        Returns:
            Path to downloaded file
        """
        try:
            if not filename:
                filename = os.path.basename(urlparse(url).path)
                if not filename.endswith('.mp3'):
                    filename += '.mp3'
            
            file_path = self.download_dir / filename
            
            logger.info(f"Downloading {url} to {file_path}")
            
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Successfully downloaded {filename}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return None
    
    def download_sample_music(self) -> list:
        """
        Download sample music files (placeholder URLs)
        Returns:
            List of downloaded file paths
        """
        downloaded_files = []
        
        for mood, urls in self.sample_music_urls.items():
            mood_dir = self.download_dir / mood
            mood_dir.mkdir(exist_ok=True)
            
            for i, url in enumerate(urls):
                filename = f"{mood}_{i+1}.mp3"
                file_path = self.download_from_url(url, filename)
                if file_path:
                    downloaded_files.append(file_path)
                
                # Be respectful with downloads
                time.sleep(1)
        
        return downloaded_files
    
    def get_pixabay_music(self, api_key: str, query: str = "music", limit: int = 20) -> list:
        """
        Get music from Pixabay API
        Args:
            api_key: Pixabay API key
            query: Search query
            limit: Number of results
        Returns:
            List of music URLs
        """
        try:
            url = self.sources['pixabay']['api_url']
            params = {
                'key': api_key,
                'q': query,
                'audio_type': 'music',
                'per_page': limit,
                'safesearch': 'true'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            music_urls = []
            
            for hit in data.get('hits', []):
                if 'audio' in hit:
                    music_urls.append({
                        'url': hit['audio'],
                        'title': hit.get('title', 'Unknown'),
                        'artist': hit.get('user', 'Unknown'),
                        'duration': hit.get('duration', 0)
                    })
            
            return music_urls
            
        except Exception as e:
            logger.error(f"Pixabay API error: {e}")
            return []
    
    def get_jamendo_music(self, api_key: str, query: str = "music", limit: int = 20) -> list:
        """
        Get music from Jamendo API
        Args:
            api_key: Jamendo API key
            query: Search query
            limit: Number of results
        Returns:
            List of music URLs
        """
        try:
            url = self.sources['jamendo']['api_url'] + "tracks/"
            params = {
                'client_id': api_key,
                'format': 'json',
                'search': query,
                'limit': limit,
                'include': 'musicinfo'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            music_urls = []
            
            for track in data.get('results', []):
                music_urls.append({
                    'url': track.get('audio', ''),
                    'title': track.get('name', 'Unknown'),
                    'artist': track.get('artist_name', 'Unknown'),
                    'duration': track.get('duration', 0)
                })
            
            return music_urls
            
        except Exception as e:
            logger.error(f"Jamendo API error: {e}")
            return []
    
    def create_sample_music_files(self) -> list:
        """
        Create sample music files for testing (since we can't download from placeholder URLs)
        Returns:
            List of created file paths
        """
        created_files = []
        
        # Create sample music files using ffmpeg
        for mood in ['happy', 'sad', 'calm', 'energetic', 'thrilling', 'neutral']:
            mood_dir = self.download_dir / mood
            mood_dir.mkdir(exist_ok=True)
            
            # Create 3 sample files for each mood
            for i in range(1, 4):
                filename = f"{mood}_{i}.mp3"
                file_path = mood_dir / filename
                
                # Generate different tones for different moods
                frequency = self.get_mood_frequency(mood)
                duration = 30 + (i * 10)  # 30, 40, 50 seconds
                
                try:
                    import subprocess
                    
                    cmd = [
                        'ffmpeg', '-y',
                        '-f', 'lavfi',
                        '-i', f'sine=frequency={frequency}:duration={duration}',
                        '-af', f'afade=t=in:st=0:d=2,afade=t=out:st={duration-2}:d=2',
                        '-ar', '44100',
                        '-ac', '2',
                        '-b:a', '192k',
                        str(file_path)
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        created_files.append(str(file_path))
                        logger.info(f"Created sample music: {filename}")
                    else:
                        logger.warning(f"Failed to create {filename}: {result.stderr}")
                        
                except Exception as e:
                    logger.warning(f"Could not create {filename}: {e}")
                    # Create empty file as fallback
                    file_path.touch()
                    created_files.append(str(file_path))
        
        return created_files
    
    def get_mood_frequency(self, mood: str) -> int:
        """Get frequency for mood-based music generation"""
        frequencies = {
            'happy': 523,    # C5 - bright
            'sad': 220,      # A3 - lower
            'thrilling': 659, # E5 - high
            'calm': 330,     # E4 - peaceful
            'energetic': 440, # A4 - energetic
            'neutral': 392   # G4 - balanced
        }
        return frequencies.get(mood, 440)
    
    def download_from_playlist(self, playlist_file: str) -> list:
        """
        Download music from a playlist file
        Args:
            playlist_file: Path to playlist file (JSON format)
        Returns:
            List of downloaded file paths
        """
        try:
            with open(playlist_file, 'r', encoding='utf-8') as f:
                playlist = json.load(f)
            
            downloaded_files = []
            
            for track in playlist:
                url = track.get('url')
                filename = track.get('filename', f"{track.get('artist', 'Unknown')}_{track.get('title', 'Unknown')}.mp3")
                
                if url:
                    file_path = self.download_from_url(url, filename)
                    if file_path:
                        downloaded_files.append(file_path)
                
                # Be respectful with downloads
                time.sleep(1)
            
            return downloaded_files
            
        except Exception as e:
            logger.error(f"Failed to download from playlist: {e}")
            return []
    
    def create_sample_playlist(self) -> str:
        """
        Create a sample playlist file for testing
        Returns:
            Path to created playlist file
        """
        playlist = [
            {
                "title": "Happy Pop",
                "artist": "Sample Artist",
                "url": "https://example.com/happy_pop.mp3",
                "filename": "happy_pop.mp3",
                "mood": "happy",
                "genre": "pop"
            },
            {
                "title": "Sad Piano",
                "artist": "Sample Artist",
                "url": "https://example.com/sad_piano.mp3",
                "filename": "sad_piano.mp3",
                "mood": "sad",
                "genre": "piano"
            },
            {
                "title": "Calm Ambient",
                "artist": "Sample Artist",
                "url": "https://example.com/calm_ambient.mp3",
                "filename": "calm_ambient.mp3",
                "mood": "calm",
                "genre": "ambient"
            }
        ]
        
        playlist_file = self.download_dir / "sample_playlist.json"
        with open(playlist_file, 'w', encoding='utf-8') as f:
            json.dump(playlist, f, indent=2, ensure_ascii=False)
        
        return str(playlist_file)

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Download free music for Sniply')
    parser.add_argument('--download-dir', default='downloads', 
                       help='Directory to store downloaded music')
    parser.add_argument('--create-samples', action='store_true',
                       help='Create sample music files for testing')
    parser.add_argument('--pixabay-key', help='Pixabay API key')
    parser.add_argument('--jamendo-key', help='Jamendo API key')
    parser.add_argument('--query', default='music', help='Search query for APIs')
    parser.add_argument('--limit', type=int, default=10, help='Number of results to download')
    
    args = parser.parse_args()
    
    # Initialize downloader
    downloader = FreeMusicDownloader(args.download_dir)
    
    downloaded_files = []
    
    # Create sample files if requested
    if args.create_samples:
        logger.info("Creating sample music files...")
        sample_files = downloader.create_sample_music_files()
        downloaded_files.extend(sample_files)
        logger.info(f"Created {len(sample_files)} sample files")
    
    # Download from Pixabay if API key provided
    if args.pixabay_key:
        logger.info("Downloading from Pixabay...")
        pixabay_music = downloader.get_pixabay_music(args.pixabay_key, args.query, args.limit)
        for music in pixabay_music:
            file_path = downloader.download_from_url(music['url'], f"{music['artist']}_{music['title']}.mp3")
            if file_path:
                downloaded_files.append(file_path)
    
    # Download from Jamendo if API key provided
    if args.jamendo_key:
        logger.info("Downloading from Jamendo...")
        jamendo_music = downloader.get_jamendo_music(args.jamendo_key, args.query, args.limit)
        for music in jamendo_music:
            file_path = downloader.download_from_url(music['url'], f"{music['artist']}_{music['title']}.mp3")
            if file_path:
                downloaded_files.append(file_path)
    
    # Create sample playlist
    playlist_file = downloader.create_sample_playlist()
    logger.info(f"Created sample playlist: {playlist_file}")
    
    logger.info(f"Download complete! Total files: {len(downloaded_files)}")
    return 0

if __name__ == "__main__":
    exit(main()) 