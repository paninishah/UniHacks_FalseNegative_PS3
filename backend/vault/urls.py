from django.urls import path
from .views import *

urlpatterns = [

    path("capsule/create/", CreateCapsuleView.as_view()),
    path("capsule/mine/", MyCapsulesView.as_view()),

    path("vault/create/", CreateVaultItemView.as_view()),
    path("vault/generate-token/", GenerateTokenView.as_view()),
    path("vault/grant/", GrantPermissionView.as_view()),
]
