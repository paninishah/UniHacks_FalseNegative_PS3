import random
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from .models import (
    ActivityLog,
    Prompt,
    GroupPromptHistory,
    Notification,
    PromptCategory
)


# -----------------------------------
# ACTIVITY LOGGING + ANALYTICS TRIGGER
# -----------------------------------

def log_activity(user, group, activity_type):
    """
    Creates activity log and auto-updates analytics layer.
    """

    # Create activity entry
    ActivityLog.objects.create(
        user=user,
        group=group,
        activity_type=activity_type
    )

    # Import inside function to avoid circular imports
    from analytics.services import (
        update_group_snapshot,
        update_friendship_dna,
        update_memory_heatmap
    )

    # Update analytics immediately
    update_group_snapshot(group)
    update_friendship_dna(group)
    update_memory_heatmap(group)


# -----------------------------------
# INACTIVITY CHECK (48H RULE)
# -----------------------------------

def check_48h_inactivity(group):
    """
    Returns True if group has been inactive for 48+ hours.
    """
    last_activity = ActivityLog.objects.filter(
        group=group
    ).order_by("-created_at").first()

    if not last_activity:
        return True

    return timezone.now() - last_activity.created_at > timedelta(hours=48)


# -----------------------------------
# MOVING AVERAGE CALCULATION
# -----------------------------------

def get_moving_average(group, days=7):
    """
    Returns average daily interaction count over given days.
    """
    since = timezone.now() - timedelta(days=days)

    count = ActivityLog.objects.filter(
        group=group,
        created_at__gte=since
    ).count()

    return count / max(days, 1)


def detect_engagement_drop(group):
    """
    Detects if engagement dropped significantly.
    (7-day average < 60% of 30-day average)
    """
    avg_7 = get_moving_average(group, 7)
    avg_30 = get_moving_average(group, 30)

    if avg_30 == 0:
        return False

    return avg_7 < (0.6 * avg_30)


# -----------------------------------
# PROMPT ROTATION SYSTEM
# -----------------------------------

def get_available_prompt(group):
    """
    Returns a random eligible prompt based on category cooldown.
    """

    eligible_prompts = []

    categories = PromptCategory.objects.all()

    for category in categories:

        last_prompt = GroupPromptHistory.objects.filter(
            group=group,
            prompt__category=category
        ).order_by("-delivered_at").first()

        if not last_prompt:
            eligible_prompts.extend(
                Prompt.objects.filter(category=category)
            )
        else:
            cooldown = timedelta(hours=category.cooldown_hours)

            if timezone.now() - last_prompt.delivered_at > cooldown:
                eligible_prompts.extend(
                    Prompt.objects.filter(category=category)
                )

    if not eligible_prompts:
        return None

    return random.choice(eligible_prompts)


def deliver_prompt(group):
    """
    Delivers prompt to group and notifies all members.
    """

    prompt = get_available_prompt(group)

    if not prompt:
        return None

    # Save history
    GroupPromptHistory.objects.create(
        group=group,
        prompt=prompt
    )

    # Fetch members safely
    members = group.groupmember_set.select_related("user").all()

    for member in members:
        Notification.objects.create(
            user=member.user,
            group=group,
            message=f"New prompt: {prompt.text}"
        )

    return prompt


# -----------------------------------
# SMART AUTO-TRIGGER ENGINE
# -----------------------------------

def auto_trigger_engagement(group):
    """
    Automatically triggers a prompt if:
    - 48h inactivity
    - Engagement drop detected
    """

    if check_48h_inactivity(group):
        return deliver_prompt(group)

    if detect_engagement_drop(group):
        return deliver_prompt(group)

    return None
