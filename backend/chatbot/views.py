from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import generate_response
from .models import ChatbotLog
from groups.models import Group


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message")
        group_id = request.data.get("group_id")

        group = None
        if group_id:
            group = Group.objects.get(id=group_id)

        response = generate_response(
            user=request.user,
            message=message,
            group=group
        )

        ChatbotLog.objects.create(
            user=request.user,
            group=group,
            message=message,
            response=response
        )

        return Response({
            "response": response
        })
