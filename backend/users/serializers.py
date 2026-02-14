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
        fields = ["id", "username", "name", "bio", "profile_picture", "profile_picture_url", "onboarding_completed", "points", "followers_count", "following_count", "posts_count"]

    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()

    def get_posts_count(self, obj):
        return obj.user.posts.filter(is_deleted=False).count()

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def update(self, instance, validated_data):
        # Update Profile fields
        instance.bio = validated_data.get('bio', instance.bio)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.profile_picture_url = validated_data.get('profile_picture_url', instance.profile_picture_url)
        instance.onboarding_completed = validated_data.get('onboarding_completed', instance.onboarding_completed)
        instance.save()

        # Update User fields (name)
        # We expect 'name' in initial_data because it's not a writable field in Meta
        # But since it's a SerializerMethodField, it's read-only in validated_data usually.
        # We can check the context or request, but 'initial_data' is cleaner or passed args.
        # However, DRF's validated_data won't contain 'name' if it's read-only.
        # So we should look at self.initial_data.
        
        name_input = self.initial_data.get('name')
        if name_input:
            # Simple split logic: First Name = everything, Last Name = empty to keep it simple
            # Or split by space
            parts = name_input.strip().split(' ', 1)
            instance.user.first_name = parts[0]
            if len(parts) > 1:
                instance.user.last_name = parts[1]
            else:
                instance.user.last_name = ""
            instance.user.save()

        return instance


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = "__all__"
        read_only_fields = ["follower"]

class UserSummarySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "name", "email", "profile_picture", "profile_picture_url"] # email as pfp fallback seed?

    profile_picture = serializers.ImageField(source='profile.profile_picture', read_only=True)
    profile_picture_url = serializers.CharField(source='profile.profile_picture_url', read_only=True)

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
