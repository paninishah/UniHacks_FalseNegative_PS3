from django.db.models.signals import post_save
from django.dispatch import receiver
from social.models import Post
from groups.models import Message
from .services import log_activity


@receiver(post_save, sender=Post)
def log_post_activity(sender, instance, created, **kwargs):
    if created and instance.group:
        log_activity(instance.user, instance.group, "POST")


@receiver(post_save, sender=Message)
def log_message_activity(sender, instance, created, **kwargs):
    if created:
        log_activity(instance.user, instance.group, "MESSAGE")
