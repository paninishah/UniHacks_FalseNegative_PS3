
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'converse.settings')
django.setup()

from music.services import DeezerClient, MusicIntelligence

def verify_deezer_feature():
    print("🎵 Verifying Deezer Music Intelligence Feature...")

    # 1. Test Search
    print("\n1. Testing Deezer Search:")
    query = "Blinding Lights The Weeknd"
    track = DeezerClient.search_track(query)
    
    if track:
        print(f"   ✅ Found Track: {track['title']} by {track['artist']}")
        print(f"      BPM: {track['bpm']}, Rank: {track['rank']}")
        if track['bpm'] == 0:
            print("      ⚠️ Warning: BPM is 0 (Deezer might not have data for this specific track ID)")
    else:
        print("   ❌ Track not found (Check internet connection or API availability)")

    # 2. Test Group Taste Analysis
    print("\n2. Testing Group Taste Analysis:")
    songs = [
        "Mr. Brightside The Killers",
        "Bohemian Rhapsody Queen",
        "Hotline Bling Drake"
    ]
    
    print(f"   Input Songs: {songs}")
    profile = MusicIntelligence.analyze_group_taste(songs)
    
    if profile:
        print(f"   ✅ Analysis Successful!")
        print(f"      Vibe: {profile['vibe']}")
        print(f"      Avg BPM: {profile['avg_bpm']}")
        print(f"      Anthem: {profile['anthem']['title']} by {profile['anthem']['artist']}")
        print(f"      Playlist Suggestion: {profile['playlist_suggestion']}")
    else:
        print("   ❌ Analysis Failed")

if __name__ == "__main__":
    verify_deezer_feature()
