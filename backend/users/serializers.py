from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile, Follow


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password", "dob"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):

    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get("username_or_email")
        password = data.get("password")

        user = User.objects.filter(email=username_or_email).first()

        if not user:
            user = User.objects.filter(username=username_or_email).first()

        if user and user.check_password(password):
            return user

        raise serializers.ValidationError("Invalid credentials")


class ProfileSerializer(serializers.ModelSerializer):

    points = serializers.IntegerField(read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)
    name = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "username", "name", "bio", "profile_picture", "onboarding_completed", "points", "followers_count", "following_count", "posts_count"]

    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()

    def get_posts_count(self, obj):
        return obj.user.posts.filter(is_deleted=False).count()

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = "__all__"
        read_only_fields = ["follower"]

class UserSummarySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "name", "email"] # email as pfp fallback seed?

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
