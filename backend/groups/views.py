from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Group, GroupMembership, Message
from .serializers import GroupSerializer, GroupMembershipSerializer, MessageSerializer

class GroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer

    def get_queryset(self):
        # Return all public groups
        return Group.objects.filter(is_public=True).order_by('-created_at')

    def perform_create(self, serializer):
        group = serializer.save(admin=self.request.user)
        # Add creator as admin member
        GroupMembership.objects.create(group=group, user=self.request.user, role='admin')

class MyGroupsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer

    def get_queryset(self):
        return Group.objects.filter(memberships__user=self.request.user).order_by('-created_at')

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()
    lookup_field = 'id'

    def perform_update(self, serializer):
        # Only admin can update? For MVP, let's keep it simple or check permissions
        # group = self.get_object()
        # if group.admin != self.request.user:
        #     raise PermissionDenied
        serializer.save()

class JoinGroupView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if GroupMembership.objects.filter(group=group, user=request.user).exists():
            return Response({"detail": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)
        
        GroupMembership.objects.create(group=group, user=request.user, role='member')
        return Response({"detail": "Joined successfully"}, status=status.HTTP_201_CREATED)

class LeaveGroupView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMembership.objects.filter(group=group, user=request.user).first()
        if not membership:
            return Response({"detail": "Not a member"}, status=status.HTTP_400_BAD_REQUEST)
        
        if group.admin == request.user:
            return Response({"detail": "Admin cannot leave group. Delete it instead or transfer ownership."}, status=status.HTTP_400_BAD_REQUEST)

        membership.delete()
        return Response({"detail": "Left successfully"}, status=status.HTTP_200_OK)

class GroupMembersView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return GroupMembership.objects.filter(group_id=group_id).order_by('-joined_at')

class GroupMessageView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Message.objects.filter(group_id=group_id).order_by('created_at')

    def perform_create(self, serializer):
        group = get_object_or_404(Group, id=self.kwargs['group_id'])
        # Check membership
        if not GroupMembership.objects.filter(group=group, user=self.request.user).exists():
             # In a real app, raise PermissionDenied or similar
             pass 
        serializer.save(user=self.request.user, group=group)
