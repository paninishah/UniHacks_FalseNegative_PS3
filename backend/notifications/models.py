from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPES = [
        ('post_newsroom', 'New Post in Newsroom'),
        ('post_group', 'New Post in Group'),
        ('post_community', 'New Post in Community'),
        ('group_created', 'New Group Created'),
        ('community_created', 'New Community Created'),
        ('capsule_unlocked', 'Time Capsule Unlocked'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional references for navigation
    group_id = models.IntegerField(null=True, blank=True)
    community_id = models.IntegerField(null=True, blank=True)
    post_id = models.IntegerField(null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.title} → {self.user.username}"
