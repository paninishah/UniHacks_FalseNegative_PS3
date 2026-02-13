from django.urls import path
from .views import AnalyzeGroupTasteView, SearchTrackView

urlpatterns = [
    path("analyze/", AnalyzeGroupTasteView.as_view(), name="analyze-music"),
    path("search/", SearchTrackView.as_view(), name="search-track"),
]
