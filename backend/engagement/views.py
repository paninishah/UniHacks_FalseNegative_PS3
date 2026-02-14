from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import (
    check_48h_inactivity,
    deliver_prompt,
    detect_engagement_drop
)
from .models import Notification
from .serializers import NotificationSerializer
from groups.models import Group


class InactivityCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        inactive = check_48h_inactivity(group)
        return Response({"inactive": inactive})


class DeliverPromptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)
        prompt = deliver_prompt(group)

        if not prompt:
            return Response({"message": "No prompt available"})

        return Response({"prompt": prompt.text})


class EngagementDropView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = Group.objects.get(id=group_id)
        drop = detect_engagement_drop(group)
        return Response({"engagement_drop": drop})


class UserNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class EngagementIndexView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "status": "online",
            "module": "Engagement Engine",
            "endpoints": [
                "/api/engagement/inactivity/<group_id>/",
                "/api/engagement/deliver-prompt/<group_id>/",
                "/api/engagement/engagement-drop/<group_id>/",
                "/api/engagement/notifications/"
            ]
        })
