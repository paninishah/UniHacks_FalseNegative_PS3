from rest_framework import generics, permissions
from .models import *
from .serializers import *


class CreateCapsuleView(generics.CreateAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyCapsulesView(generics.ListAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TimeCapsule.objects.filter(owner=self.request.user)



class CreateVaultItemView(generics.CreateAPIView):
    serializer_class = PrivateVaultItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class GenerateTokenView(generics.CreateAPIView):
    serializer_class = VaultAccessTokenSerializer
    permission_classes = [permissions.IsAuthenticated]


class GrantPermissionView(generics.CreateAPIView):
    serializer_class = VaultPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


# =========================
# MUSIC ANALYSIS VIEWS
# =========================

from music.services import MusicIntelligence
from .models import CapsuleMusicAnalysis
from rest_framework.views import APIView
from rest_framework.response import Response

class AnalyzeCapsuleMusicView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, capsule_id):
        try:
            capsule = TimeCapsule.objects.get(id=capsule_id)
        except TimeCapsule.DoesNotExist:
            return Response({"error": "Capsule not found"}, status=404)

        # 1. Fetch group members or use a predefined list of tracks for MVP
        # Ideally, we'd fetch tracks from Capsule text content or Group history
        # For now, let's look at the capsule text to find song names or fallback
        
        # Simple extraction heuristic: Assume text might contain "song: [name]" or usage of predefined list
        track_queries = [
            "Bohemian Rhapsody", 
            "Mr. Brightside", 
            "Blinding Lights",
            "Dreams Fleetwood Mac"
        ] # Default MVP list if no text analysis
        
        if capsule.text_content:
            # Very basic extraction - in production we'd use NLP
            # Here we just check if any known hits are mentioned or just use default
            pass

        # 2. Call Deezer Intelligence
        analysis_result = MusicIntelligence.analyze_group_taste(track_queries)
        
        if not analysis_result:
             return Response({"error": "Could not analyze music taste"}, status=400)

        vibe = analysis_result["vibe"]
        avg_bpm = analysis_result["avg_bpm"]
        anthem = analysis_result["anthem"]

        # 3. Save Analysis
        # Note: avg_valence/energy are Spotify specific, so we map them roughly from Vibe/BPM for compatibility or leave defaults
        
        # Heuristic mapping for compatibility fields
        derived_energy = avg_bpm / 180.0
        derived_valence = 0.8 if "Party" in vibe or "Mainstream" in vibe else 0.4
        
        analysis, created = CapsuleMusicAnalysis.objects.update_or_create(
            capsule=capsule,
            defaults={
                "dominant_vibe": vibe,
                "avg_valence": derived_valence,
                "avg_energy": derived_energy,
                "avg_danceability": 0.5, # Placeholder
                "shared_anthem_track_id": str(anthem["id"]),
                # Store the full anthem data in a scalable way (e.g. JSONField if model updated, or just ID)
            }
        )

        return Response({
            "vibe": vibe,
            "avg_bpm": avg_bpm,
            "anthem": anthem,
            "analysis_id": analysis.id
        })
