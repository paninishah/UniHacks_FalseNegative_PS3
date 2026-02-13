from rest_framework import generics, permissions
from .models import Community, CommunityMember, CommunityPost, CommunityComment
from .serializers import *


class CreateCommunityView(generics.CreateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]


class JoinCommunityView(generics.CreateAPIView):
    serializer_class = CommunityMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class CommunityListView(generics.ListAPIView):

    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    queryset = Community.objects.all().order_by("-created_at")



class CreatePostView(generics.CreateAPIView):
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]


class CommunityFeedView(generics.ListAPIView):

    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        community_id = self.kwargs["community_id"]

        return CommunityPost.objects.filter(
            community_id=community_id
        ).order_by("-created_at")



class CommentView(generics.CreateAPIView):
    serializer_class = CommunityCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
