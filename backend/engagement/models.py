from django.db import models
from django.conf import settings
from django.utils import timezone


class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ("POST", "Post"),
        ("COMMENT", "Comment"),
        ("MESSAGE", "Message"),
        ("GAME", "Game"),
        ("PROMPT_RESPONSE", "Prompt Response"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["group", "created_at"]),
        ]


class PromptCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    cooldown_hours = models.IntegerField(default=24)

    def __str__(self):
        return self.name


class Prompt(models.Model):
    PROMPT_TYPES = [
        ("random_question", "Random Question"),
        ("roast_prompt", "Roast Prompt"),
        ("initiate_conversation", "Initiate Conversation"),
    ]

    category = models.ForeignKey(PromptCategory, on_delete=models.CASCADE)
    prompt_type = models.CharField(max_length=50, choices=PROMPT_TYPES)
    text = models.TextField()

    def __str__(self):
        return self.text[:40]


class GroupPromptHistory(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE)
    delivered_at = models.DateTimeField(auto_now_add=True)


class PromptResponse(models.Model):
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE)
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
