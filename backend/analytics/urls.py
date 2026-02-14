from django.urls import path
from .views import (
    GroupAnalyticsView,
    FriendshipDNAView,
    MemoryHeatmapView,
    AnalyticsIndexView
)

urlpatterns = [
    path("group/<int:group_id>/", GroupAnalyticsView.as_view()),
    path("group/<int:group_id>/dna/", FriendshipDNAView.as_view()),
    path("group/<int:group_id>/heatmap/", MemoryHeatmapView.as_view()),
    path("", AnalyticsIndexView.as_view()),
]
