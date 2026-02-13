from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from .services import generate_recap
from .models import SeasonRecap
from groups.models import Group


class GenerateRecapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)

        start_date = datetime.strptime(request.data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(request.data["end_date"], "%Y-%m-%d").date()

        recap = generate_recap(group, start_date, end_date)

        return Response({
            "total_activities": recap.total_activities,
            "total_posts": recap.total_posts,
            "total_messages": recap.total_messages,
            "most_active_user_id": recap.most_active_user_id,
            "most_chaotic_day": recap.most_chaotic_day,
            "longest_streak": recap.longest_streak,
        })


class GetRecapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        recap = SeasonRecap.objects.filter(group_id=group_id).order_by("-generated_at").first()

        if not recap:
            return Response({"error": "No recap generated yet."})

        return Response({
            "total_activities": recap.total_activities,
            "total_posts": recap.total_posts,
            "total_messages": recap.total_messages,
            "most_active_user_id": recap.most_active_user_id,
            "most_chaotic_day": recap.most_chaotic_day,
            "longest_streak": recap.longest_streak,
        })
