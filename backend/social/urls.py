from django.urls import path
from .views import (
    CreatePostView,
    FeedView,
    ReactView,
    CommentView,
    SavePostView,
)

urlpatterns = [
    path("create/", CreatePostView.as_view()),
    path("feed/", FeedView.as_view()),
    path("react/", ReactView.as_view()),
    path("comment/", CommentView.as_view()),
    path("save/", SavePostView.as_view()),
]
