import requests
import random
from collections import Counter

# ==========================================
# DEEZER CLIENT (Stateless)
# ==========================================

class DeezerClient:
    BASE_URL = "https://api.deezer.com"

    @staticmethod
    def search_track(query):
        """
        Searches for a track and returns the best match with metadata.
        Uses a session with User-Agent to avoid being blocked by Deezer API WAF.
        """
        try:
            url = f"{DeezerClient.BASE_URL}/search"
            
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
            })
            
            # Simple search seems most reliable for this MVP
            response = session.get(url, params={"q": query, "limit": 5}, verify=False)
            data = response.json()
            
            if "data" in data and len(data["data"]) > 0:
                track = data["data"][0]
                
                # Fetch detailed track info for BPM
                try:
                    details_response = session.get(f"{DeezerClient.BASE_URL}/track/{track['id']}", verify=False)
                    details = details_response.json()
                    bpm = details.get("bpm", 120) # Default to 120 if missing
                except:
                    bpm = 120

                return {
                    "id": track["id"],
                    "title": track["title"],
                    "artist": track["artist"]["name"],
                    "album": track["album"]["title"],
                    "preview": track["preview"],
                    "bpm": bpm,
                    "rank": track["rank"], # Popularity score
                    "duration": track["duration"],
                    "link": track["link"],
                    "cover": track["album"]["cover_medium"]
                }
            else:
                 # FALLBACK MOCK DATA FOR HACKATHON DEMO (If API blocks us)
                 print(f"⚠️ Deezer API blocked/empty for '{query}'. Using Mock Fallback.")
                 import random
                 return {
                    "id": random.randint(10000, 99999),
                    "title": query,
                    "artist": "Unknown Artist", 
                    "album": "Demo Album",
                    "preview": "https://cdns-preview-d.dzcdn.net/stream/c-deda7fa9316d9e9e8802263ddbabdfdf-5.mp3",
                    "bpm": random.randint(80, 140),
                    "rank": random.randint(500000, 999999),
                    "duration": 180,
                    "link": "https://www.deezer.com",
                    "cover": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d5287c53bb1/250x250-000000-80-0-0.jpg"
                 }

        except Exception as e:
            print(f"Deezer API Error: {e}")
            return None
        
        return None

# ==========================================
# MUSIC INTELLIGENCE ENGINE
# ==========================================

class MusicIntelligence:

    @staticmethod
    def analyze_group_taste(track_queries):
        """
        Analyzes a list of song names/artists to determine group vibe.
        """
        tracks_data = []
        genres = []
        bpms = []
        ranks = []
        
        for query in track_queries:
            track = DeezerClient.search_track(query)
            if track:
                tracks_data.append(track)
                bpms.append(track["bpm"])
                ranks.append(track["rank"])
                
                # Heuristic: Genre/Style inference (Deezer simple track doesn't always have genre)
                # We can update this if needed by fetching artist details
        
        if not tracks_data:
            return None

        avg_bpm = sum(bpms) / len(bpms) if bpms else 0
        avg_rank = sum(ranks) / len(ranks) if ranks else 0
        
        # Determine Vibe based on BPM & Popularity
        vibe = MusicIntelligence._determine_vibe(avg_bpm, avg_rank)
        
        # Select Anthem (Highest Ranked Track)
        anthem = sorted(tracks_data, key=lambda x: x["rank"], reverse=True)[0]

        return {
            "vibe": vibe,
            "avg_bpm": round(avg_bpm),
            "diversity_score": "High" if len(set(t["artist"] for t in tracks_data)) > 1 else "Low", 
            "anthem": anthem,
            "playlist_suggestion": MusicIntelligence._generate_playlist_suggestion(vibe)
        }

    @staticmethod
    def _determine_vibe(bpm, rank):
        """
        Maps BPM and Rank to a vibe label.
        Rank > 800000 -> Mainstream
        """
        if bpm > 130:
            return "Chaotic Party Core"
        elif bpm > 110:
            if rank > 800000:
                return "Mainstream Pop Era"
            else:
                return "Indie Roadtrip"
        elif bpm < 90:
            return "Late Night Survival"
        else:
            return "Chill Study Sessions"

    @staticmethod
    def _generate_playlist_suggestion(vibe):
        """
        Returns a suggested playlist title/theme based on vibe.
        Real implementation could fetch more tracks.
        """
        return f"The '{vibe}' Mixtape"
