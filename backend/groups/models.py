from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


# =========================
# GROUP
# =========================

class Group(models.Model):

    name = models.CharField(max_length=255)

    admin = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="admin_groups"
    )

    is_public = models.BooleanField(default=False)

    allow_cupid = models.BooleanField(default=False)
    allow_relationship_graph = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



# =========================
# MEMBERS
# =========================

class GroupMember(models.Model):

    ROLES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=10,
        choices=ROLES,
        default="member"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "user")



# =========================
# MESSAGES (MVP SIMPLE)
# =========================

class Message(models.Model):

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    text = models.TextField(blank=True)
    image = models.ImageField(upload_to="group_chat/", null=True, blank=True)

    is_ephemeral = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["group", "created_at"])
        ]



# =========================
# RELATIONSHIP GRAPH
# =========================

class RelationshipEdge(models.Model):

    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    source_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="relationships_from"
    )

    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="relationships_to"
    )

    relationship_label = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "source_user", "target_user")



class WallRole(models.Model):

    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role_name = models.CharField(max_length=100)

    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "user")



# =========================
# CUPID
# =========================

class CupidNomination(models.Model):

    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    user_a = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cupid_user_a"
    )

    user_b = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cupid_user_b"
    )

    nominated_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cupid_nominator"
    )

    created_at = models.DateTimeField(auto_now_add=True)



class CupidConsent(models.Model):

    nomination = models.ForeignKey(
        CupidNomination,
        on_delete=models.CASCADE,
        related_name="consents"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    accepted = models.BooleanField()

    responded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("nomination", "user")



class CupidMatch(models.Model):

    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    user_a = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="match_a"
    )

    user_b = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="match_b"
    )

    matched_at = models.DateTimeField(auto_now_add=True)
