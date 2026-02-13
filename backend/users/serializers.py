from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile


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

    class Meta:
        model = Profile
        fields = ["bio", "profile_picture", "onboarding_completed"]
