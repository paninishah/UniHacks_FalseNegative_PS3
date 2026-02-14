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

class VaultFolder(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vault_folders")
    name = models.CharField(max_length=50)
    access_code = models.CharField(max_length=50, help_text="Password/Key to unlock")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"


class PrivateVaultItem(models.Model):

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="private_vault_items"
    )

    folder = models.ForeignKey(
        VaultFolder,
        on_delete=models.CASCADE,
        related_name="items",
        null=True,
        blank=True
    )

    # Link to a social post (if saved from feed)
    post = models.ForeignKey(
        'social.Post',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vaulted_copies"
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

# =========================
# MUSIC & EMOTIONAL ANALYSIS
# =========================

class CapsuleMusicAnalysis(models.Model):

    VIBES = [
        ("chaotic", "Chaotic"),
        ("wholesome", "Wholesome"),
        ("dramatic", "Dramatic"),
        ("late_night", "Late Night Core"),
        ("exam_survival", "Exam Survival"),
        ("heartbreak", "Heartbreak Era"),
        ("party", "Party Anthem"),
        ("chill", "Chill Vibes"),
    ]

    capsule = models.OneToOneField(
        TimeCapsule,
        on_delete=models.CASCADE,
        related_name="music_analysis"
    )

    dominant_vibe = models.CharField(max_length=50, choices=VIBES, default="chill")
    
    # Audio Feature Averages (0.0 - 1.0)
    avg_valence = models.FloatField(default=0.5)
    avg_energy = models.FloatField(default=0.5)
    avg_danceability = models.FloatField(default=0.5)
    
    # Spotify Data
    shared_anthem_track_id = models.CharField(max_length=100, null=True, blank=True)
    generated_playlist_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Stored as JSON: {"user_id": score, ...}
    compatibility_heatmap = models.JSONField(default=dict)

    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.capsule} ({self.dominant_vibe})"
