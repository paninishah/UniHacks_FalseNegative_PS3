
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection
from music.services import DeezerClient
from converse.ai_services import generate_dramatic_headline
from engagement.services import auto_trigger_engagement
from games.services import start_game
import logging

logger = logging.getLogger(__name__)

class SystemHealthView(APIView):
    """
    Integrity Check Endpoint.
    Verifies that all subsystems are responsive.
    """
    def get(self, request):
        status = {
            "database": "Unknown",
            "deezer_api": "Unknown",
            "ai_headline": "Unknown",
            "engagement_logic": "Unknown",
            "games_logic": "Unknown",
            "overall": "Degraded"
        }

        # 1. Database Check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            status["database"] = "Healthy"
        except Exception as e:
            status["database"] = f"Failed: {str(e)}"

        # 2. Deezer API Check (Stateless)
        try:
            track = DeezerClient.search_track("Test Track")
            if track:
                status["deezer_api"] = "Operational (Live Data)"
            else:
                status["deezer_api"] = "Operational (Mock Fallback)"
        except Exception as e:
            status["deezer_api"] = f"Error: {str(e)}"

        # 3. AI Headline Check
        try:
            headline = generate_dramatic_headline("System check initiated")
            if "Error" in headline:
                status["ai_headline"] = f"Degraded: {headline}"
            else:
                status["ai_headline"] = "Operational"
        except Exception as e:
            status["ai_headline"] = f"Critical: {str(e)}"

        # 4. Engagement Logic
        try:
            # Just check if function is callable, don't trigger side effects
            if callable(auto_trigger_engagement):
                status["engagement_logic"] = "Loaded"
        except Exception as e:
            status["engagement_logic"] = f"Error: {str(e)}"

        # 5. Games Logic
        try:
             if callable(start_game):
                status["games_logic"] = "Loaded"
        except Exception as e:
             status["games_logic"] = f"Error: {str(e)}"

        # Overall Status
        if all(v in ["Healthy", "Operational", "Operational (Live Data)", "Loaded"] for v in status.values()):
            status["overall"] = "Healthy"
        
        return Response(status)
