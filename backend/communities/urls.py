from django.urls import path
from .views import *

urlpatterns = [

    path("create/", CreateCommunityView.as_view()),
    path("join/", JoinCommunityView.as_view()),

    path("list/", CommunityListView.as_view()),

    path("post/", CreatePostView.as_view()),
    path("feed/<int:community_id>/", CommunityFeedView.as_view()),

    path("comment/", CommentView.as_view()),
]
