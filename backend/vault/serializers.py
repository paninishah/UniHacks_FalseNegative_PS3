from rest_framework import serializers
from social.serializers import PostSerializer
from .models import (
    TimeCapsule,
    CapsuleAccess,
    PrivateVaultItem,
    VaultAccessToken,
    VaultPermission,
    VaultFolder
)


class TimeCapsuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeCapsule
        fields = "__all__"
        read_only_fields = ["owner", "created_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class VaultFolderSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = VaultFolder
        fields = ["id", "name", "created_at", "item_count"] # key is hidden by default
        read_only_fields = ["owner", "created_at"]

    def get_item_count(self, obj):
        return obj.items.count()


class PrivateVaultItemSerializer(serializers.ModelSerializer):
    post_details = PostSerializer(source='post', read_only=True)

    class Meta:
        model = PrivateVaultItem
        fields = ["id", "image", "text_content", "created_at", "folder", "post", "post_details"]
        read_only_fields = ["owner", "created_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class CapsuleAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapsuleAccess
        fields = "__all__"



class VaultAccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultAccessToken
        fields = "__all__"



class VaultPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultPermission
        fields = "__all__"
