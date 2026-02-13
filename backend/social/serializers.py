from rest_framework import serializers
from .models import Post, Reaction, Comment, SavedPost
import random


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["user", "headline_generated"]

    def create(self, validated_data):

        text = validated_data.get("text_content")

        # Dramatic headline generator (template based)
        if text:
            templates = [
                f"🚨 BREAKING: {text[:60]}...",
                f"🔥 CHAOS ALERT: {text[:60]}",
                f"👀 SPOTTED: {text[:60]}",
                f"💥 DRAMA DROP: {text[:60]}"
            ]
            validated_data["headline_generated"] = random.choice(templates)

        validated_data["user"] = self.context["request"].user

        return super().create(validated_data)



class ReactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reaction
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)



class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)



class SavedPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavedPost
        fields = "__all__"
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
