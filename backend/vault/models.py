from django.db import models
from django.conf import settings
from groups.models import Group
import uuid

User = settings.AUTH_USER_MODEL


# =========================
# TIME CAPSULE
# =========================

class TimeCapsule(models.Model):

    VISIBILITY = [
        ("private", "Private"),
        ("group", "Group"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="time_capsules"
    )

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    text_content = models.TextField(blank=True)
    image = models.ImageField(upload_to="capsules/", null=True, blank=True)

    unlock_date = models.DateTimeField()

    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY
    )

    is_locked = models.BooleanField(default=True)
    is_unlocked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Capsule by {self.owner}"


# =========================
# CAPSULE ACCESS (Group Case)
# =========================

class CapsuleAccess(models.Model):

    capsule = models.ForeignKey(
        TimeCapsule,
        on_delete=models.CASCADE,
        related_name="access_list"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("capsule", "user")



# =========================
# PRIVATE MEDIA VAULT
# =========================

class PrivateVaultItem(models.Model):

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="private_vault_items"
    )

    image = models.ImageField(upload_to="private_vault/", null=True, blank=True)
    text_content = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)



# =========================
# VAULT ACCESS TOKEN
# =========================

class VaultAccessToken(models.Model):

    vault_item = models.ForeignKey(
        PrivateVaultItem,
        on_delete=models.CASCADE,
        related_name="tokens"
    )

    token = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)



# =========================
# VAULT PERMISSIONS
# =========================

class VaultPermission(models.Model):

    vault_item = models.ForeignKey(
        PrivateVaultItem,
        on_delete=models.CASCADE,
        related_name="permissions"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("vault_item", "user")
