from django.urls import path
from .views import (
    CreatePostView,
    FeedView,
    ReactView,
    CommentView,

    PostCommentsView,
    SavePostView,
    UserPostsView,
    GroupPostsView,
)

urlpatterns = [
    path("create/", CreatePostView.as_view()),
    path("feed/", FeedView.as_view()),
    path("react/", ReactView.as_view()),
    path("comment/", CommentView.as_view()),
    path("comments/<int:post_id>/", PostCommentsView.as_view()),
    path("save/", SavePostView.as_view()),
    path("user-posts/<int:user_id>/", UserPostsView.as_view()),
    path("group-posts/<int:group_id>/", GroupPostsView.as_view()),
]
