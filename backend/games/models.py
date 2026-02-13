from django.db import models
from django.conf import settings


class GameSession(models.Model):
    GAME_TYPES = [
        ("most_likely_to", "Most Likely To"),
        ("skribbl", "Skribbl"),
    ]

    STATUS = [
        ("active", "Active"),
        ("completed", "Completed"),
    ]

    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    game_type = models.CharField(max_length=50, choices=GAME_TYPES)
    status = models.CharField(max_length=20, choices=STATUS, default="active")

    prompt_text = models.TextField(blank=True, null=True)
    secret_word = models.CharField(max_length=100, blank=True, null=True)

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)


class GameParticipant(models.Model):
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)


class GameResponse(models.Model):
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("game", "user")
