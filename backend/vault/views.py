from rest_framework import generics, permissions
from .models import *
from .serializers import *


class CreateCapsuleView(generics.CreateAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyCapsulesView(generics.ListAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TimeCapsule.objects.filter(owner=self.request.user)



class CreateVaultItemView(generics.CreateAPIView):
    serializer_class = PrivateVaultItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class GenerateTokenView(generics.CreateAPIView):
    serializer_class = VaultAccessTokenSerializer
    permission_classes = [permissions.IsAuthenticated]


class GrantPermissionView(generics.CreateAPIView):
    serializer_class = VaultPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
