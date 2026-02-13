from rest_framework import serializers
from .models import Post, Reaction, Comment, SavedPost
from converse.ai_services import generate_dramatic_headline

class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["user", "headline_generated"]

    def create(self, validated_data):

        text = validated_data.get("text_content")

        # Dramatically Generate Headline via Gemini
        if text:
            try:
                headline = generate_dramatic_headline(text)
                validated_data["headline_generated"] = headline
            except Exception as e:
                # Fallback purely for safety
                validated_data["headline_generated"] = f"Breaking: {text[:20]}..."

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
