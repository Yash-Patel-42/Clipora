import os
import json
import shutil
import requests
import mutagen
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MusicImporter:
    def __init__(self, music_dir: str = "music"):
        """
        Initialize the music importer
        Args:
            music_dir: Directory to store organized music files
        """
        self.music_dir = Path(music_dir)
        self.music_dir.mkdir(exist_ok=True)
        
        # API keys (you can get these for free)
        self.lastfm_api_key = None  # Get from https://www.last.fm/api/account/create
        self.musicbrainz_user_agent = "SniplyMusicImporter/1.0"  # Free, no key needed
        
        # Music metadata cache
        self.metadata_cache_file = "music_metadata_cache.json"
        self.metadata_cache = self.load_metadata_cache()
        
        # Supported audio formats
        self.supported_formats = {'.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac'}
        
        # Mood mapping based on tags/genres
        self.mood_mapping = {
            'happy': ['happy', 'upbeat', 'cheerful', 'joyful', 'positive', 'summer', 'pop', 'dance'],
            'sad': ['sad', 'melancholy', 'emotional', 'sorrow', 'depressing', 'piano', 'strings'],
            'thrilling': ['thrilling', 'action', 'epic', 'dramatic', 'intense', 'suspense', 'battle'],
            'calm': ['calm', 'peaceful', 'relaxing', 'ambient', 'meditation', 'nature', 'zen'],
            'energetic': ['energetic', 'rock', 'electronic', 'dance', 'powerful', 'anthem', 'beat'],
            'neutral': ['neutral', 'background', 'ambient', 'jazz', 'corporate', 'smooth', 'sophisticated']
        }
    
    def load_metadata_cache(self) -> Dict:
        """Load cached metadata to avoid repeated API calls"""
        try:
            if os.path.exists(self.metadata_cache_file):
                with open(self.metadata_cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load metadata cache: {e}")
        return {}
    
    def save_metadata_cache(self):
        """Save metadata cache to file"""
        try:
            with open(self.metadata_cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.metadata_cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Could not save metadata cache: {e}")
    
    def get_file_hash(self, file_path: str) -> str:
        """Generate hash for file to use as cache key"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def extract_audio_metadata(self, file_path: str) -> Dict:
        """Extract basic metadata from audio file"""
        try:
            audio = mutagen.File(file_path)
            if audio is None:
                return {}
            
            metadata = {}
            
            # Common metadata fields
            if hasattr(audio, 'tags'):
                tags = audio.tags
                
                # MP3 tags
                if hasattr(tags, 'get'):
                    metadata['title'] = tags.get('title', [''])[0] if tags.get('title') else ''
                    metadata['artist'] = tags.get('artist', [''])[0] if tags.get('artist') else ''
                    metadata['album'] = tags.get('album', [''])[0] if tags.get('album') else ''
                    metadata['genre'] = tags.get('genre', [''])[0] if tags.get('genre') else ''
                    metadata['year'] = tags.get('year', [''])[0] if tags.get('year') else ''
                
                # ID3 tags
                elif hasattr(tags, 'getall'):
                    metadata['title'] = str(tags.getall('TIT2')[0]) if tags.getall('TIT2') else ''
                    metadata['artist'] = str(tags.getall('TPE1')[0]) if tags.getall('TPE1') else ''
                    metadata['album'] = str(tags.getall('TALB')[0]) if tags.getall('TALB') else ''
                    metadata['genre'] = str(tags.getall('TCON')[0]) if tags.getall('TCON') else ''
                    metadata['year'] = str(tags.getall('TYER')[0]) if tags.getall('TYER') else ''
            
            # Audio properties
            if hasattr(audio.info, 'length'):
                metadata['duration'] = int(audio.info.length)
            
            if hasattr(audio.info, 'bitrate'):
                metadata['bitrate'] = audio.info.bitrate
            
            return metadata
            
        except Exception as e:
            logger.warning(f"Could not extract metadata from {file_path}: {e}")
            return {}
    
    def get_lastfm_metadata(self, artist: str, title: str) -> Dict:
        """Get additional metadata from Last.fm API (free tier available)"""
        if not self.lastfm_api_key:
            return {}
        
        try:
            url = "http://ws.audioscrobbler.com/2.0/"
            params = {
                'method': 'track.getInfo',
                'artist': artist,
                'track': title,
                'api_key': self.lastfm_api_key,
                'format': 'json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'track' in data:
                    track = data['track']
                    return {
                        'tags': [tag['name'] for tag in track.get('toptags', {}).get('tag', [])],
                        'mood': track.get('wiki', {}).get('summary', ''),
                        'listeners': track.get('listeners', 0),
                        'playcount': track.get('playcount', 0)
                    }
        except Exception as e:
            logger.warning(f"Last.fm API error: {e}")
        
        return {}
    
    def get_musicbrainz_metadata(self, artist: str, title: str) -> Dict:
        """Get metadata from MusicBrainz API (completely free)"""
        try:
            # Search for the track
            url = "https://musicbrainz.org/ws/2/recording/"
            headers = {
                'User-Agent': self.musicbrainz_user_agent
            }
            params = {
                'query': f'artist:"{artist}" AND recording:"{title}"',
                'fmt': 'json'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'recordings' in data and data['recordings']:
                    recording = data['recordings'][0]
                    return {
                        'mbid': recording.get('id'),
                        'tags': [tag['name'] for tag in recording.get('tags', [])],
                        'rating': recording.get('rating', {}).get('value', 0),
                        'disambiguation': recording.get('disambiguation', '')
                    }
        except Exception as e:
            logger.warning(f"MusicBrainz API error: {e}")
        
        return {}
    
    def determine_mood(self, metadata: Dict) -> str:
        """Determine mood based on metadata and tags"""
        # Combine all text for analysis
        text_to_analyze = ' '.join([
            metadata.get('title', ''),
            metadata.get('artist', ''),
            metadata.get('album', ''),
            metadata.get('genre', ''),
            ' '.join(metadata.get('tags', [])),
            metadata.get('mood', '')
        ]).lower()
        
        # Score each mood
        mood_scores = {}
        for mood, keywords in self.mood_mapping.items():
            score = sum(1 for keyword in keywords if keyword in text_to_analyze)
            mood_scores[mood] = score
        
        # Return mood with highest score, default to neutral
        if mood_scores:
            best_mood = max(mood_scores, key=mood_scores.get)
            if mood_scores[best_mood] > 0:
                return best_mood
        
        return 'neutral'
    
    def generate_track_id(self, title: str, artist: str) -> str:
        """Generate a unique track ID"""
        # Clean the title and artist for ID generation
        clean_title = ''.join(c for c in title.lower() if c.isalnum() or c.isspace()).strip()
        clean_artist = ''.join(c for c in artist.lower() if c.isalnum() or c.isspace()).strip()
        
        # Create a simple hash-based ID
        combined = f"{clean_artist}_{clean_title}"
        return hashlib.md5(combined.encode()).hexdigest()[:8]
    
    def process_single_file(self, file_path: str) -> Optional[Dict]:
        """Process a single music file and return metadata"""
        try:
            file_path = Path(file_path)
            if file_path.suffix.lower() not in self.supported_formats:
                logger.warning(f"Unsupported format: {file_path}")
                return None
            
            # Check cache first
            file_hash = self.get_file_hash(str(file_path))
            if file_hash in self.metadata_cache:
                logger.info(f"Using cached metadata for {file_path.name}")
                return self.metadata_cache[file_hash]
            
            logger.info(f"Processing {file_path.name}")
            
            # Extract basic metadata
            metadata = self.extract_audio_metadata(str(file_path))
            
            if not metadata.get('title') or not metadata.get('artist'):
                # Try to extract from filename
                filename = file_path.stem
                if ' - ' in filename:
                    artist, title = filename.split(' - ', 1)
                    metadata['artist'] = artist.strip()
                    metadata['title'] = title.strip()
                else:
                    metadata['title'] = filename
                    metadata['artist'] = 'Unknown Artist'
            
            # Get additional metadata from APIs
            if metadata.get('artist') and metadata.get('title'):
                lastfm_data = self.get_lastfm_metadata(metadata['artist'], metadata['title'])
                musicbrainz_data = self.get_musicbrainz_metadata(metadata['artist'], metadata['title'])
                
                metadata.update(lastfm_data)
                metadata.update(musicbrainz_data)
            
            # Determine mood
            mood = self.determine_mood(metadata)
            
            # Generate track ID
            track_id = self.generate_track_id(metadata.get('title', ''), metadata.get('artist', ''))
            
            # Create final track metadata
            track_metadata = {
                'id': track_id,
                'name': metadata.get('title', file_path.stem),
                'artist': metadata.get('artist', 'Unknown Artist'),
                'album': metadata.get('album', ''),
                'duration': metadata.get('duration', 0),
                'genre': metadata.get('genre', ''),
                'year': metadata.get('year', ''),
                'mood': mood,
                'tags': metadata.get('tags', []),
                'file': str(file_path),
                'bitrate': metadata.get('bitrate', 0),
                'listeners': metadata.get('listeners', 0),
                'playcount': metadata.get('playcount', 0),
                'rating': metadata.get('rating', 0)
            }
            
            # Cache the metadata
            self.metadata_cache[file_hash] = track_metadata
            
            return track_metadata
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return None
    
    def bulk_import(self, source_dir: str, max_workers: int = 4) -> List[Dict]:
        """
        Bulk import music files from a directory
        Args:
            source_dir: Directory containing music files
            max_workers: Number of parallel workers
        Returns:
            List of processed track metadata
        """
        source_path = Path(source_dir)
        if not source_path.exists():
            raise ValueError(f"Source directory does not exist: {source_dir}")
        
        # Find all music files
        music_files = []
        for format_ext in self.supported_formats:
            music_files.extend(source_path.rglob(f"*{format_ext}"))
            music_files.extend(source_path.rglob(f"*{format_ext.upper()}"))
        
        logger.info(f"Found {len(music_files)} music files to process")
        
        # Process files in parallel
        processed_tracks = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(self.process_single_file, str(f)) for f in music_files]
            
            for future in futures:
                try:
                    result = future.result()
                    if result:
                        processed_tracks.append(result)
                except Exception as e:
                    logger.error(f"Error in parallel processing: {e}")
        
        # Save cache
        self.save_metadata_cache()
        
        logger.info(f"Successfully processed {len(processed_tracks)} tracks")
        return processed_tracks
    
    def organize_tracks(self, tracks: List[Dict], organize_by: str = 'mood') -> Dict:
        """
        Organize tracks into the music library structure
        Args:
            tracks: List of track metadata
            organize_by: How to organize ('mood', 'genre', 'artist', 'year')
        Returns:
            Organized tracks dictionary
        """
        organized = {}
        
        for track in tracks:
            if organize_by == 'mood':
                key = track.get('mood', 'neutral')
            elif organize_by == 'genre':
                key = track.get('genre', 'Unknown').lower()
            elif organize_by == 'artist':
                key = track.get('artist', 'Unknown').lower()
            elif organize_by == 'year':
                year = track.get('year', 'Unknown')
                if year.isdigit():
                    decade = f"{year[:3]}0s"
                    key = decade
                else:
                    key = 'Unknown'
            else:
                key = 'other'
            
            if key not in organized:
                organized[key] = []
            
            organized[key].append(track)
        
        return organized
    
    def copy_files_to_library(self, tracks: List[Dict], organize_by: str = 'mood') -> Dict:
        """
        Copy music files to the organized library structure
        Args:
            tracks: List of track metadata
            organize_by: How to organize the files
        Returns:
            Updated tracks with new file paths
        """
        organized = self.organize_tracks(tracks, organize_by)
        
        for category, category_tracks in organized.items():
            # Create category directory
            category_dir = self.music_dir / category
            category_dir.mkdir(exist_ok=True)
            
            for track in category_tracks:
                source_file = Path(track['file'])
                if source_file.exists():
                    # Create new filename
                    new_filename = f"{track['id']}.mp3"
                    dest_file = category_dir / new_filename
                    
                    # Copy file
                    try:
                        shutil.copy2(source_file, dest_file)
                        track['file'] = str(dest_file)
                        logger.info(f"Copied {source_file.name} to {dest_file}")
                    except Exception as e:
                        logger.error(f"Failed to copy {source_file}: {e}")
        
        return organized
    
    def generate_music_library_json(self, organized_tracks: Dict) -> str:
        """
        Generate the music library JSON structure for the backend
        Args:
            organized_tracks: Organized tracks dictionary
        Returns:
            JSON string for the music library
        """
        library_structure = {}
        
        for mood, tracks in organized_tracks.items():
            library_structure[mood] = []
            
            for track in tracks:
                # Convert to the format expected by the music library
                library_track = {
                    "id": track['id'],
                    "name": track['name'],
                    "file": track['file'],
                    "duration": track['duration'],
                    "artist": track['artist'],
                    "album": track['album'],
                    "genre": track['genre'],
                    "year": track['year'],
                    "tags": track['tags'],
                    "bpm": 0,  # Could be extracted with additional analysis
                    "energy": 0.5,  # Default, could be calculated
                    "valence": 0.5   # Default, could be calculated
                }
                
                library_structure[mood].append(library_track)
        
        return json.dumps(library_structure, indent=2, ensure_ascii=False)
    
    def import_from_directory(self, source_dir: str, organize_by: str = 'mood', 
                            max_workers: int = 4) -> Dict:
        """
        Complete import process from directory
        Args:
            source_dir: Source directory with music files
            organize_by: How to organize ('mood', 'genre', 'artist', 'year')
            max_workers: Number of parallel workers
        Returns:
            Organized tracks dictionary
        """
        logger.info(f"Starting bulk import from {source_dir}")
        
        # Process all files
        tracks = self.bulk_import(source_dir, max_workers)
        
        # Organize and copy files
        organized = self.copy_files_to_library(tracks, organize_by)
        
        # Generate library JSON
        library_json = self.generate_music_library_json(organized)
        
        # Save library JSON
        library_file = self.music_dir / "music_library.json"
        with open(library_file, 'w', encoding='utf-8') as f:
            f.write(library_json)
        
        logger.info(f"Import complete! Library saved to {library_file}")
        return organized

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Bulk import and tag music files')
    parser.add_argument('source_dir', help='Directory containing music files to import')
    parser.add_argument('--organize-by', choices=['mood', 'genre', 'artist', 'year'], 
                       default='mood', help='How to organize the music library')
    parser.add_argument('--workers', type=int, default=4, 
                       help='Number of parallel workers')
    parser.add_argument('--lastfm-key', help='Last.fm API key (optional)')
    parser.add_argument('--music-dir', default='music', 
                       help='Directory to store organized music')
    
    args = parser.parse_args()
    
    # Initialize importer
    importer = MusicImporter(args.music_dir)
    if args.lastfm_key:
        importer.lastfm_api_key = args.lastfm_key
    
    # Run import
    try:
        organized = importer.import_from_directory(
            args.source_dir, 
            args.organize_by, 
            args.workers
        )
        
        # Print summary
        print(f"\nImport Summary:")
        print(f"Total tracks imported: {sum(len(tracks) for tracks in organized.values())}")
        for category, tracks in organized.items():
            print(f"  {category}: {len(tracks)} tracks")
        
    except Exception as e:
        logger.error(f"Import failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 