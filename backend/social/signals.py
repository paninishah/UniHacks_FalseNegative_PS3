from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post

# Later connect to ActivityLog when engagement app exists

@receiver(post_save, sender=Post)
def post_created(sender, instance, created, **kwargs):
    if created:
        pass  # hook for analytics
