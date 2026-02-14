from rest_framework import serializers
from .models import Post, Reaction, Comment, SavedPost, User
from converse.ai_services import generate_dramatic_headline

from users.serializers import UserSummarySerializer


class PostSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    reactions = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    headline_generated = serializers.CharField(read_only=True)

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["user", "headline_generated", "sentiment_score", "is_deleted"]

    def get_reactions(self, obj):
        return {
            "goat": obj.reactions.filter(reaction_type="GOAT").count(),
            "clown": obj.reactions.filter(reaction_type="clown").count(),
            "redflag": obj.reactions.filter(reaction_type="red_flag").count(),
            "iconic": obj.reactions.filter(reaction_type="iconic").count(),
        }

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        # Extract group from context if available or request data
        group_id = self.context['request'].data.get('group')
        if group_id:
            from groups.models import Group
            validated_data['group'] = Group.objects.get(id=group_id)

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
    user = UserSummarySerializer(read_only=True)

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
