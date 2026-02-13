from rest_framework import generics, permissions
from .models import Post, Reaction, Comment, SavedPost
from .serializers import (
    PostSerializer,
    ReactionSerializer,
    CommentSerializer,
    SavedPostSerializer
)


class CreatePostView(generics.CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]


class FeedView(generics.ListAPIView):

    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        return Post.objects.filter(
            is_deleted=False
        ).order_by("-created_at")



class ReactView(generics.CreateAPIView):
    serializer_class = ReactionSerializer
    permission_classes = [permissions.IsAuthenticated]


class CommentView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]


class SavePostView(generics.CreateAPIView):
    serializer_class = SavedPostSerializer
    permission_classes = [permissions.IsAuthenticated]
