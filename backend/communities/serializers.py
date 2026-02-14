from rest_framework import serializers
from .models import Community, CommunityMember, CommunityPost, CommunityComment
from users.serializers import UserSummarySerializer

class CommunitySerializer(serializers.ModelSerializer):
    creator = UserSummarySerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = "__all__"
        read_only_fields = ["creator", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user).exists()
        return False

class CommunityPostSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = "__all__"
        read_only_fields = ["user", "created_at", "community"]

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CommunityCommentSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = CommunityComment
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
