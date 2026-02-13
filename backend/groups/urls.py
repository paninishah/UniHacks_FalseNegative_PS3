from django.urls import path
from .views import *

urlpatterns = [

    path("create/", CreateGroupView.as_view()),
    path("add-member/", AddMemberView.as_view()),

    path("send-message/", SendMessageView.as_view()),
    path("messages/<int:group_id>/", GroupMessagesView.as_view()),
]
