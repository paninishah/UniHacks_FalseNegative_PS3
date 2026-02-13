from django.urls import path
from .views import (
    StartGameView,
    SubmitVoteView,
    FinishMostLikelyView,
    SubmitGuessView,
    LeaderboardView
)

urlpatterns = [
    path("start/<int:group_id>/", StartGameView.as_view()),
    path("vote/<int:game_id>/", SubmitVoteView.as_view()),
    path("finish-most-likely/<int:game_id>/", FinishMostLikelyView.as_view()),
    path("guess/<int:game_id>/", SubmitGuessView.as_view()),
    path("leaderboard/<int:game_id>/", LeaderboardView.as_view()),
]
