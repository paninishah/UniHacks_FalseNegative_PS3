from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post
from .utils import generate_headline

# Later connect to ActivityLog when engagement app exists

@receiver(post_save, sender=Post)
def create_headline(sender, instance, created, **kwargs):
    if created and not instance.headline_generated:
        # Generate generic headline using utility
        headline = generate_headline(instance.text_content or instance.caption, instance.category)
        instance.headline_generated = headline
        instance.save()
