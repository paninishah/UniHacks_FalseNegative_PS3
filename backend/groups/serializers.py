from rest_framework import serializers
from .models import (
    Group,
    GroupMember,
    Message,
    RelationshipEdge,
    CupidNomination,
    CupidConsent
)


class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = "__all__"
        read_only_fields = ["admin"]

    def create(self, validated_data):
        validated_data["admin"] = self.context["request"].user
        group = super().create(validated_data)

        # auto add admin as member
        GroupMember.objects.create(
            group=group,
            user=group.admin,
            role="admin"
        )

        return group



class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = "__all__"



class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["sender"]

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)



class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipEdge
        fields = "__all__"



class CupidNominationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CupidNomination
        fields = "__all__"
        read_only_fields = ["nominated_by"]

    def create(self, validated_data):
        validated_data["nominated_by"] = self.context["request"].user
        return super().create(validated_data)



class CupidConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CupidConsent
        fields = "__all__"
