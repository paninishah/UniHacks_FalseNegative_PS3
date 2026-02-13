from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


# =========================
# COMMUNITY
# =========================

class Community(models.Model):

    name = models.CharField(max_length=255, unique=True)

    description = models.TextField(blank=True)

    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_communities"
    )

    banner = models.ImageField(upload_to="community_banners/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



# =========================
# MEMBERS
# =========================

class CommunityMember(models.Model):

    ROLES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role = models.CharField(
        max_length=10,
        choices=ROLES,
        default="member"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("community", "user")



# =========================
# POSTS
# =========================

class CommunityPost(models.Model):

    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name="posts"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=255)

    content = models.TextField(blank=True)

    image = models.ImageField(upload_to="community_posts/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["community", "created_at"])
        ]



# =========================
# COMMENTS
# =========================

class CommunityComment(models.Model):

    post = models.ForeignKey(
        CommunityPost,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
