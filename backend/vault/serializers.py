from rest_framework import serializers
from .models import (
    TimeCapsule,
    CapsuleAccess,
    PrivateVaultItem,
    VaultAccessToken,
    VaultPermission
)


class TimeCapsuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeCapsule
        fields = "__all__"
        read_only_fields = ["owner", "is_locked", "is_unlocked"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)



class CapsuleAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapsuleAccess
        fields = "__all__"



class PrivateVaultItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateVaultItem
        fields = "__all__"
        read_only_fields = ["owner"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)



class VaultAccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultAccessToken
        fields = "__all__"



class VaultPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultPermission
        fields = "__all__"
