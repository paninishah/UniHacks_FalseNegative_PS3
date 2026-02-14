
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from social.models import Post, EphemeralEventLog
from vault.models import TimeCapsule
from engagement.models import Notification
from groups.models import Group, GroupMembership
from engagement.services import auto_trigger_engagement
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Runs all scheduled triggers: Vanish cleanup, Engagement checks, Capsule unlocks."

    def handle(self, *args, **options):
        self.stdout.write("🔄 Running Backend Triggers...")

        # 1. VANISH MODE CLEANUP
        # Delete posts marked as vanish_mode created > 24h ago
        cutoff = timezone.now() - timedelta(hours=24)
        vanish_posts = Post.objects.filter(vanish_mode=True, created_at__lt=cutoff, is_deleted=False)
        
        count = vanish_posts.count()
        if count > 0:
            for post in vanish_posts:
                # Create a tombstone log? 
                if post.group:
                    EphemeralEventLog.objects.create(
                        post=None, # Post is gone
                        group=post.group,
                        message="A memory vanished into the void..."
                    )
                post.delete() # Actually delete or soft delete
            self.stdout.write(self.style.SUCCESS(f"✅ Vanished {count} expired posts."))
        else:
            self.stdout.write("✨ No vanish posts to clean.")

        # 2. CAPSULE UNLOCKS
        # Find scheduled capsules that are locked and ready
        ready_capsules = TimeCapsule.objects.filter(
            unlock_date__lte=timezone.now(),
            is_locked=True
        )
        
        unlock_count = ready_capsules.count()
        if unlock_count > 0:
            for capsule in ready_capsules:
                capsule.is_locked = False
                capsule.is_unlocked = True
                capsule.save()
                
                # Notify Owner
                from users.models import User # Deferred import
                
                # Notify Group Members if group capsule
                if capsule.group:
                    members = GroupMembership.objects.filter(group=capsule.group)
                    for member in members:
                         Notification.objects.create(
                            user=member.user,
                            group=capsule.group,
                            message=f"🕰️ Time Capsule '{capsule}' has unlocked!"
                        )
            self.stdout.write(self.style.SUCCESS(f"🔓 Unlocked {unlock_count} time capsules."))
        else:
            self.stdout.write("🔒 No capsules ready to unlock.")

        # 3. ENGAGEMENT AUTO-TRIGGER
        # Check all groups for inactivity or drops
        groups = Group.objects.all()
        triggered_count = 0
        
        for group in groups:
            # logic in services.py checks 48h rule or drop detection
            # auto_trigger_engagement returns the prompt if triggered, None otherwise
            prompt = auto_trigger_engagement(group)
            if prompt:
                triggered_count += 1
                self.stdout.write(f"⚡ Triggered engagement for '{group.name}': {prompt.text[:30]}...")

        if triggered_count > 0:
            self.stdout.write(self.style.SUCCESS(f"🚀 Auto-triggered {triggered_count} engagement prompts."))
        else:
            self.stdout.write("zzz No engagement triggers needed.")

        self.stdout.write(self.style.SUCCESS("✅ All triggers executed successfully."))
