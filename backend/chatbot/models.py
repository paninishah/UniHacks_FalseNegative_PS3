from django.db import models
from django.conf import settings


class ChatbotLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE, null=True, blank=True)

    message = models.TextField()
    response = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
