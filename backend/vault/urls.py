from django.urls import path
from .views import *

urlpatterns = [

    path("capsule/create/", CreateCapsuleView.as_view()),
    path("capsule/mine/", MyCapsulesView.as_view()),

    path("items/create/", CreateVaultItemView.as_view()),
    path("generate-token/", GenerateTokenView.as_view()),
    path("grant/", GrantPermissionView.as_view()),
    path("capsule/<int:capsule_id>/analyze-music/", AnalyzeCapsuleMusicView.as_view()),
    
    # Vault Folders
    path("folders/", VaultFolderListCreate.as_view()),
    path("folders/<int:pk>/", VaultFolderDetail.as_view()),
    path("folders/<int:folder_id>/unlock/", VaultFolderUnlock.as_view()),
    path("folders/user/<int:user_id>/", UserVaultFolders.as_view()),
    path("add-item/", AddToVaultView.as_view()),
]
