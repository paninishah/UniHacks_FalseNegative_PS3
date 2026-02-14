from rest_framework import serializers
from .models import Group, GroupMembership, Message, Intervention, InterventionMessage
from users.serializers import UserSummarySerializer

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'role', 'joined_at']

class GroupSerializer(serializers.ModelSerializer):
    is_member = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'admin', 'is_public', 
            'allow_cupid', 'allow_relationship_graph', 'created_at',
            'is_member', 'member_count'
        ]
        read_only_fields = ['admin', 'created_at']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return GroupMembership.objects.filter(group=obj, user=request.user).exists()
        return False

    def get_member_count(self, obj):
        return obj.memberships.count()

class InterventionMessageSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    
    class Meta:
        model = InterventionMessage
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']

class InterventionSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)
    messages = InterventionMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Intervention
        fields = ['id', 'group', 'title', 'target', 'status', 'created_at', 'created_by', 'messages']
        read_only_fields = ['created_by', 'created_at', 'messages']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']
