from django.urls import path
from .views import GenerateRecapView, GetRecapView

urlpatterns = [
    path("generate/<int:group_id>/", GenerateRecapView.as_view()),
    path("latest/<int:group_id>/", GetRecapView.as_view()),
]
