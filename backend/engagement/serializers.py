import random
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from .models import ActivityLog, Prompt, GroupPromptHistory, Notification, PromptCategory


def log_activity(user, group, activity_type):
    ActivityLog.objects.create(
        user=user,
        group=group,
        activity_type=activity_type
    )


def check_48h_inactivity(group):
    last_activity = ActivityLog.objects.filter(group=group).order_by("-created_at").first()

    if not last_activity:
        return True

    if timezone.now() - last_activity.created_at > timedelta(hours=48):
        return True

    return False


def get_moving_average(group, days=7):
    since = timezone.now() - timedelta(days=days)
    count = ActivityLog.objects.filter(group=group, created_at__gte=since).count()
    return count / days


def detect_engagement_drop(group):
    avg_7 = get_moving_average(group, 7)
    avg_30 = get_moving_average(group, 30)

    if avg_30 == 0:
        return False

    return avg_7 < (0.6 * avg_30)


def get_available_prompt(group):
    categories = PromptCategory.objects.all()

    for category in categories:
        last_prompt = GroupPromptHistory.objects.filter(
            group=group,
            prompt__category=category
        ).order_by("-delivered_at").first()

        if not last_prompt:
            prompts = Prompt.objects.filter(category=category)
            return random.choice(list(prompts)) if prompts.exists() else None

        cooldown = timedelta(hours=category.cooldown_hours)
        if timezone.now() - last_prompt.delivered_at > cooldown:
            prompts = Prompt.objects.filter(category=category)
            return random.choice(list(prompts)) if prompts.exists() else None

    return None


def deliver_prompt(group):
    prompt = get_available_prompt(group)
    if not prompt:
        return None

    GroupPromptHistory.objects.create(
        group=group,
        prompt=prompt
    )

    members = group.groupmember
