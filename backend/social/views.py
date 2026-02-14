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

    def perform_create(self, serializer):
        post = serializer.save()
        try:
            from notifications.utils import notify_group_members, notify_all_users
            preview = (post.text_content or post.caption or '')[:60]
            
            if post.group:
                # Group post (newsbite) — notify group members
                notify_group_members(
                    post.group,
                    'post_group',
                    f'📰 New post in {post.group.name}',
                    f'{post.user.username} posted in {post.group.name}: "{preview}..."',
                    exclude_user=post.user,
                    group_id=post.group.id,
                    post_id=post.id,
                )
            else:
                # Newsroom post — notify all users
                notify_all_users(
                    'post_newsroom',
                    '📢 New post in Newsroom',
                    f'{post.user.username} posted: "{preview}..."',
                    exclude_user=post.user,
                    post_id=post.id,
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Notification error: {e}")

class FeedView(generics.ListAPIView):

    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        return Post.objects.filter(
            is_deleted=False,
            group__isnull=True, # Exclude group posts from main feed
            visibility='public'  # Only public posts
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
        # Enforce membership check
        user = self.request.user
        from groups.models import GroupMembership
        if not GroupMembership.objects.filter(group_id=group_id, user=user).exists():
            return Post.objects.none() # Or raise PermissionDenied
        
        return Post.objects.filter(group__id=group_id, is_deleted=False).order_by("-created_at")
