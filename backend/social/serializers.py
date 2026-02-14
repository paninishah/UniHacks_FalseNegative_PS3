from rest_framework import serializers
from .models import Post, Reaction, Comment, SavedPost, User


from users.serializers import UserSummarySerializer


from groups.models import Group

class PostSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    reactions = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    headline_generated = serializers.CharField(read_only=True)
    
    # Explicitly include group as a primary key field for writing
    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), 
        required=False, 
        allow_null=True
    )

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
        # Assign user from context
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
