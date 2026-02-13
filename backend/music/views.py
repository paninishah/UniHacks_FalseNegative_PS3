from rest_framework.views import APIView
from rest_framework.response import Response
from .services import DeezerClient, MusicIntelligence

class AnalyzeGroupTasteView(APIView):
    """
    Accepts a list of song names (e.g., ["Blinding Lights", "One Dance"])
    Returns a structured music profile + vibe + anthem.
    """
    def post(self, request):
        songs = request.data.get("songs")
        
        if not songs or not isinstance(songs, list):
            return Response({"error": "Please provide a list of song names in 'songs' field."}, status=400)

        # 1. Analyze Taste Profile
        # This calls Deezer API for each song -> aggregates BPM/Rank -> determines Vibe
        profile = MusicIntelligence.analyze_group_taste(songs)
        
        if not profile:
            return Response({"error": "Could not analyze the provided songs."}, status=400)

        return Response(profile)

class SearchTrackView(APIView):
    """
    Helper to search for a track and see raw Deezer data (to debug).
    """
    def get(self, request):
        query = request.query_params.get("q")
        if not query:
            return Response({"error": "Missing query param 'q'"}, status=400)
            
        track = DeezerClient.search_track(query)
        if not track:
            return Response({"error": "Track not found"}, status=404)
            
        return Response(track)
