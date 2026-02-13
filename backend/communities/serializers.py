from rest_framework import serializers
from .models import (
    Community,
    CommunityMember,
    CommunityPost,
    CommunityComment
)


class CommunitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Community
        fields = "__all__"
        read_only_fields = ["creator"]

    def create(self, validated_data):

        validated_data["creator"] = self.context["request"].user
        community = super().create(validated_data)

        # auto add creator as admin
        CommunityMember.objects.create(
            community=community,
            user=community.creator,
            role="admin"
        )

        return community



class CommunityMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityMember
        fields = "__all__"



class CommunityPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)



class CommunityCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityComment
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
