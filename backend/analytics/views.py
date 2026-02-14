from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import GroupAnalyticsSnapshot, FriendshipDNA, MemoryHeatmap
from .services import update_group_snapshot, update_friendship_dna
from groups.models import Group


class GroupAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)

        update_group_snapshot(group)
        update_friendship_dna(group)

        snapshot = GroupAnalyticsSnapshot.objects.get(group=group)

        return Response({
            "health_score": snapshot.health_score,
            "health_state": snapshot.health_state,
            "total_messages": snapshot.total_messages,
            "total_posts": snapshot.total_posts,
            "total_games": snapshot.total_games,
        })


class FriendshipDNAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        dna = FriendshipDNA.objects.filter(group_id=group_id)

        return Response([
            {
                "user": item.user.username,
                "label": item.label,
                "roast_frequency": item.roast_frequency,
                "message_count": item.message_count,
            }
            for item in dna
        ])


class MemoryHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        data = MemoryHeatmap.objects.filter(group_id=group_id)

        return Response([
            {
                "date": item.date,
                "interaction_count": item.interaction_count,
            }
            for item in data
        ])


class AnalyticsIndexView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "status": "online",
            "module": "Analytics Engine",
            "endpoints": [
                "/api/analytics/group/<id>/",
                "/api/analytics/group/<id>/dna/",
                "/api/analytics/group/<id>/heatmap/"
            ]
        })
