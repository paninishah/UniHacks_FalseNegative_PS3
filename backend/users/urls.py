from django.urls import path
from .views import RegisterView, LoginView, ProfileView, FollowUserView, UnfollowUserView, PublicProfileView

urlpatterns = [
    path("signup/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("profile/<int:user_id>/", PublicProfileView.as_view()),
    path("follow/<int:user_id>/", FollowUserView.as_view()),
    path("unfollow/<int:user_id>/", UnfollowUserView.as_view()),
]
