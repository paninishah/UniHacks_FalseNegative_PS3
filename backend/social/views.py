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


class PostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        return Comment.objects.filter(post_id=post_id).order_by("-created_at")



class SavePostView(generics.CreateAPIView):
    serializer_class = SavedPostSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Post.objects.filter(user__id=user_id, is_deleted=False).order_by("-created_at")

class GroupPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs["group_id"]
        return Post.objects.filter(group__id=group_id, is_deleted=False).order_by("-created_at")
