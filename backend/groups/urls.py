from django.urls import path
from .views import (
    GroupListCreateView,
    MyGroupsView,
    GroupDetailView,
    JoinGroupView,
    LeaveGroupView,
    GroupMembersView,
    GroupMessageView,
)

urlpatterns = [
    path('', GroupListCreateView.as_view()), # List public, create new
    path('my/', MyGroupsView.as_view()), # List my groups
    path('<int:id>/', GroupDetailView.as_view()), # Retrieve/Update/Delete
    path('<int:group_id>/join/', JoinGroupView.as_view()),
    path('<int:group_id>/leave/', LeaveGroupView.as_view()),
    path('<int:group_id>/members/', GroupMembersView.as_view()),
    path('<int:group_id>/messages/', GroupMessageView.as_view()),
]
