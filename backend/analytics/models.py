from django.db import models
from django.conf import settings


class GroupAnalyticsSnapshot(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)

    health_score = models.FloatField(default=0)
    health_state = models.CharField(max_length=50, default="Stable")

    total_messages = models.IntegerField(default=0)
    total_posts = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)

    most_active_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="most_active_groups"
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.group.name} Analytics"


class FriendshipDNA(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    roast_frequency = models.IntegerField(default=0)
    message_count = models.IntegerField(default=0)
    most_used_word = models.CharField(max_length=100, blank=True)
    label = models.CharField(max_length=100, blank=True)

    updated_at = models.DateTimeField(auto_now=True)


class MemoryHeatmap(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    date = models.DateField()
    interaction_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ("group", "date")
