from django.urls import path
from .views import (
    InactivityCheckView,
    DeliverPromptView,
    EngagementDropView,
    UserNotificationsView
)

urlpatterns = [
    path("inactivity/<int:group_id>/", InactivityCheckView.as_view()),
    path("deliver-prompt/<int:group_id>/", DeliverPromptView.as_view()),
    path("engagement-drop/<int:group_id>/", EngagementDropView.as_view()),
    path("notifications/", UserNotificationsView.as_view()),
]
