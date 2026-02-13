from rest_framework import generics, permissions
from .models import Group, GroupMember, Message
from .serializers import (
    GroupSerializer,
    GroupMemberSerializer,
    MessageSerializer
)


class CreateGroupView(generics.CreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class AddMemberView(generics.CreateAPIView):
    serializer_class = GroupMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupMessagesView(generics.ListAPIView):

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs["group_id"]

        return Message.objects.filter(
            group_id=group_id
        ).order_by("-created_at")
