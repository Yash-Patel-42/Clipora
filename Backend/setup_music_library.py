#!/usr/bin/env python3
"""
Sniply Music Library Setup Script
This script helps you set up a complete music library for your video editing app
"""

import os
import sys
import json
from pathlib import Path

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

# Add the sniply_ai_music module to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'sniply_ai_music'))

from music_importer import MusicImporter
from download_free_music import FreeMusicDownloader

def setup_music_library():
    """Main setup function for the music library"""
    print("🎵 Sniply Music Library Setup")
    print("=" * 50)
    
    # Step 1: Create sample music files
    print("\n1. Creating sample music files...")
    downloader = FreeMusicDownloader("temp_downloads")
    sample_files = downloader.create_sample_music_files()
    print(f"✅ Created {len(sample_files)} sample music files")
    
    # Step 2: Import and organize the music
    print("\n2. Importing and organizing music...")
    importer = MusicImporter("music")
    
    # Import from the temp downloads
    organized_tracks = importer.import_from_directory(
        "temp_downloads", 
        organize_by='mood', 
        max_workers=4
    )
    
    print(f"✅ Organized {sum(len(tracks) for tracks in organized_tracks.values())} tracks")
    
    # Step 3: Generate the music library JSON
    print("\n3. Generating music library structure...")
    library_json = importer.generate_music_library_json(organized_tracks)
    
    # Save to the main music library file
    library_file = Path("music/music_library.json")
    with open(library_file, 'w', encoding='utf-8') as f:
        f.write(library_json)
    
    print(f"✅ Music library saved to {library_file}")
    
    # Step 4: Show summary
    print("\n4. Library Summary:")
    for mood, tracks in organized_tracks.items():
        print(f"   {mood.capitalize()}: {len(tracks)} tracks")
    
    # Step 5: Clean up temp files
    print("\n5. Cleaning up temporary files...")
    import shutil
    if os.path.exists("temp_downloads"):
        shutil.rmtree("temp_downloads")
    print("✅ Cleanup complete")
    
    print("\n🎉 Music library setup complete!")
    print("\nNext steps:")
    print("1. Add real music files to the music/ directories")
    print("2. Update the music_library.py file with your tracks")
    print("3. Test the AI music features in your app")

def import_existing_music(source_dir: str):
    """Import existing music files from a directory"""
    print(f"🎵 Importing music from: {source_dir}")
    
    if not os.path.exists(source_dir):
        print(f"❌ Source directory does not exist: {source_dir}")
        return
    
    # Initialize importer
    importer = MusicImporter("music")
    
    # Import and organize
    organized_tracks = importer.import_from_directory(
        source_dir, 
        organize_by='mood', 
        max_workers=4
    )
    
    # Generate library JSON
    library_json = importer.generate_music_library_json(organized_tracks)
    
    # Save to file
    library_file = Path("music/music_library.json")
    with open(library_file, 'w', encoding='utf-8') as f:
        f.write(library_json)
    
    print(f"✅ Imported {sum(len(tracks) for tracks in organized_tracks.values())} tracks")
    print(f"✅ Library saved to {library_file}")

def download_from_apis():
    """Download music from legal, free sources"""
    print("🌐 Downloading music from legal, free sources...")
    
    try:
        from sniply_ai_music.legal_music_downloader import LegalMusicDownloader
        downloader = LegalMusicDownloader("music")
        
        # Show available sources
        downloader.show_download_sources()
        
        # Get API keys from environment or user
        pixabay_key = os.getenv('PIXABAY_API_KEY')
        jamendo_key = os.getenv('JAMENDO_API_KEY')
        
        if not pixabay_key and not jamendo_key:
            print("\nTo download from APIs, you'll need API keys:")
            print("- Pixabay: https://pixabay.com/api/docs/")
            print("- Jamendo: https://developer.jamendo.com/")
            print("\nOr set environment variables: PIXABAY_API_KEY, JAMENDO_API_KEY")
            
            pixabay_key = input("Enter Pixabay API key (or press Enter to skip): ").strip()
            jamendo_key = input("Enter Jamendo API key (or press Enter to skip): ").strip()
        else:
            if pixabay_key:
                print(f"✅ Found Pixabay API key in environment")
            if jamendo_key:
                print(f"✅ Found Jamendo API key in environment")
        
        downloaded_files = []
        
        # Download from Pixabay
        if pixabay_key:
            print("Downloading from Pixabay...")
            files = downloader.download_from_pixabay(pixabay_key, "upbeat", 10)
            downloaded_files.extend(files)
        
        # Download from Jamendo
        if jamendo_key:
            print("Downloading from Jamendo...")
            files = downloader.download_from_jamendo(jamendo_key, "electronic", 10)
            downloaded_files.extend(files)
        
        if downloaded_files:
            print(f"✅ Downloaded {len(downloaded_files)} files")
            
            # Generate library JSON
            from sniply_ai_music.music_importer import MusicImporter
            importer = MusicImporter("music")
            organized_tracks = importer.scan_existing_music()
            library_json = importer.generate_music_library_json(organized_tracks)
            
            # Save to file
            library_file = Path("music/music_library.json")
            with open(library_file, 'w', encoding='utf-8') as f:
                f.write(library_json)
            
            print(f"✅ Library saved to {library_file}")
        else:
            print("ℹ️  No API keys provided. Creating sample files instead...")
            downloader.create_sample_music()
            print("✅ Sample music files created successfully!")
            
    except Exception as e:
        print(f"❌ Error downloading music: {e}")
        print("Creating sample files instead...")
        try:
            from sniply_ai_music.legal_music_downloader import LegalMusicDownloader
            downloader = LegalMusicDownloader("music")
            downloader.create_sample_music()
            print("✅ Sample music files created successfully!")
        except Exception as e2:
            print(f"❌ Error creating sample files: {e2}")

def show_usage_instructions():
    """Show usage instructions"""
    print("\n📖 Usage Instructions:")
    print("=" * 50)
    
    print("\n1. Setup with sample music:")
    print("   python setup_music_library.py --setup")
    
    print("\n2. Import existing music:")
    print("   python setup_music_library.py --import /path/to/music/folder")
    
    print("\n3. Download from APIs:")
    print("   python setup_music_library.py --download")
    
    print("\n4. Manual import using music_importer.py:")
    print("   python sniply_ai_music/music_importer.py /path/to/music/folder")
    
    print("\n5. Create sample music files:")
    print("   python sniply_ai_music/legal_music_downloader.py --create-samples")
    
    print("\n6. Download from legal sources:")
    print("   python sniply_ai_music/legal_music_downloader.py --sources")
    print("   python sniply_ai_music/legal_music_downloader.py --pixabay-key YOUR_KEY --query 'upbeat'")
    
    print("\n📚 Free Music Sources:")
    print("- YouTube Audio Library: https://www.youtube.com/audiolibrary/music")
    print("- Free Music Archive: https://freemusicarchive.org/")
    print("- Pixabay Music: https://pixabay.com/music/")
    print("- Bensound: https://www.bensound.com/")
    print("- Incompetech: https://incompetech.com/music/")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Setup Sniply Music Library')
    parser.add_argument('--setup', action='store_true', 
                       help='Setup with sample music files')
    parser.add_argument('--import', dest='import_dir', 
                       help='Import music from directory')
    parser.add_argument('--download', action='store_true',
                       help='Download music from free APIs')
    parser.add_argument('--help-usage', action='store_true',
                       help='Show usage instructions')
    
    args = parser.parse_args()
    
    if args.help_usage:
        show_usage_instructions()
        return 0
    
    if args.setup:
        setup_music_library()
    elif args.import_dir:
        import_existing_music(args.import_dir)
    elif args.download:
        download_from_apis()
    else:
        # Interactive mode
        print("🎵 Sniply Music Library Setup")
        print("Choose an option:")
        print("1. Setup with sample music")
        print("2. Import existing music")
        print("3. Download from APIs")
        print("4. Show usage instructions")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            setup_music_library()
        elif choice == '2':
            source_dir = input("Enter path to music folder: ").strip()
            import_existing_music(source_dir)
        elif choice == '3':
            download_from_apis()
        elif choice == '4':
            show_usage_instructions()
        else:
            print("Invalid choice")
            return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 