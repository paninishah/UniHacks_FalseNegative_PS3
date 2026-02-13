from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from engagement.models import ActivityLog
from .models import SeasonRecap


def calculate_longest_streak(group, start_date, end_date):
    logs = ActivityLog.objects.filter(
        group=group,
        created_at__date__range=[start_date, end_date]
    ).order_by("created_at")

    active_days = set(log.created_at.date() for log in logs)

    if not active_days:
        return 0

    sorted_days = sorted(active_days)

    longest = 1
    current = 1

    for i in range(1, len(sorted_days)):
        if sorted_days[i] == sorted_days[i - 1] + timedelta(days=1):
            current += 1
            longest = max(longest, current)
        else:
            current = 1

    return longest


def generate_recap(group, start_date, end_date):

    logs = ActivityLog.objects.filter(
        group=group,
        created_at__date__range=[start_date, end_date]
    )

    total_activities = logs.count()
    total_posts = logs.filter(activity_type="POST").count()
    total_messages = logs.filter(activity_type="MESSAGE").count()

    most_active = logs.values("user").annotate(
        count=Count("user")
    ).order_by("-count").first()

    # Most chaotic day = highest activity count
    daily_counts = logs.values("created_at__date").annotate(
        count=Count("id")
    ).order_by("-count").first()

    most_chaotic_day = None
    if daily_counts:
        most_chaotic_day = daily_counts["created_at__date"]

    longest_streak = calculate_longest_streak(group, start_date, end_date)

    recap, created = SeasonRecap.objects.update_or_create(
        group=group,
        start_date=start_date,
        end_date=end_date,
        defaults={
            "total_activities": total_activities,
            "total_posts": total_posts,
            "total_messages": total_messages,
            "most_active_user_id": most_active["user"] if most_active else None,
            "most_chaotic_day": most_chaotic_day,
            "longest_streak": longest_streak,
        }
    )

    return recap
