from django.urls import path
from .views import (
    CommunityListCreateView,
    CommunityDetailView,
    CommunityJoinView,
    CommunityLeaveView,
    CommunityPostListCreateView,
    CommunityPostDetailView
)

urlpatterns = [
    path('', CommunityListCreateView.as_view()),
    path('<int:id>/', CommunityDetailView.as_view()),
    path('<int:community_id>/join/', CommunityJoinView.as_view()),
    path('<int:community_id>/leave/', CommunityLeaveView.as_view()),
    path('<int:community_id>/posts/', CommunityPostListCreateView.as_view()),
    path('posts/<int:id>/', CommunityPostDetailView.as_view()),
]
