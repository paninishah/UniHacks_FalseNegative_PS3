from django.urls import path
from .views import GenerateRecapView, GetRecapView, RecapIndexView

urlpatterns = [
    path("generate/<int:group_id>/", GenerateRecapView.as_view()),
    path("latest/<int:group_id>/", GetRecapView.as_view()),
    path("", RecapIndexView.as_view()),
]
