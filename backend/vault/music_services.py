import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.conf import settings
import numpy as np
from collections import Counter

# ==========================================
# SPOTIFY ENGINE
# ==========================================

class SpotifyEngine:
    def __init__(self):
        self.sp = None
        if hasattr(settings, 'SPOTIFY'):
            try:
                auth_manager = SpotifyClientCredentials(
                    client_id=settings.SPOTIFY["CLIENT_ID"],
                    client_secret=settings.SPOTIFY["CLIENT_SECRET"]
                )
                self.sp = spotipy.Spotify(auth_manager=auth_manager)
            except Exception as e:
                print(f"Spotify Init Error: {e}")

    def get_audio_features(self, track_ids):
        """
        Fetches audio features for a list of track IDs.
        """
        if not self.sp or not track_ids:
            return []
        
        # Spotify allows up to 100 ids per call
        results = []
        for i in range(0, len(track_ids), 100):
            chunk = track_ids[i:i + 100]
            try:
                features = self.sp.audio_features(chunk)
                results.extend([f for f in features if f])
            except Exception as e:
                print(f"Spotify API Error: {e}")
        
        return results

    def search_track(self, query):
        if not self.sp:
            return None
        try:
            results = self.sp.search(q=query, limit=1, type='track')
            items = results['tracks']['items']
            if items:
                return items[0]
        except:
            return None
        return None

# ==========================================
# EMOTIONAL INTELLIGENCE
# ==========================================

class EmotionalIntelligence:
    
    @staticmethod
    def determine_vibe(valence, energy, danceability):
        """
        Maps audio features to emotional labels.
        Valence: Positivity (0.0 sad -> 1.0 happy)
        Energy: Intensity (0.0 calm -> 1.0 fast/loud)
        """
        
        # High Energy Logic
        if energy > 0.7:
            if valence > 0.7:
                return "party"         # High Energy + Happy
            elif valence < 0.3:
                return "chaotic"       # High Energy + Angry/Sad
            else:
                return "exam_survival" # High Energy + Neutral (Focus/Stress)

        # Low Energy Logic
        elif energy < 0.4:
            if valence > 0.6:
                return "wholesome"     # Low Energy + Happy
            elif valence < 0.3:
                return "heartbreak"    # Low Energy + Sad
            else:
                return "late_night"    # Low Energy + Neutral

        # Mid Energy / Default
        if danceability > 0.7:
            return "dramatic"
            
        return "chill"

    @staticmethod
    def analyze_group_synergy(users_music_data):
        """
        Calculates compatibility based on overlapping genres/artists.
        Input: List of dicts {user_id: 1, top_genres: [], top_artists: []}
        """
        # Mock implementation for now
        heatmap = {}
        for user_data in users_music_data:
            user_id = user_data.get("user_id")
            # Random score for demo
            heatmap[user_id] = round(np.random.uniform(0.6, 0.99), 2)
            
        return heatmap

    @staticmethod
    def generate_soundtrack_name(vibe, capsule_name):
        return f"{capsule_name} [{vibe.upper()} MIX]"
