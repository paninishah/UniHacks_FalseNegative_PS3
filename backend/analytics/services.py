from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from engagement.models import ActivityLog
from .models import GroupAnalyticsSnapshot, FriendshipDNA, MemoryHeatmap
from collections import Counter


def calculate_health_score(group):
    last_7_days = timezone.now() - timedelta(days=7)

    recent_count = ActivityLog.objects.filter(
        group=group,
        created_at__gte=last_7_days
    ).count()

    if recent_count > 100:
        return 90, "High Energy"
    elif recent_count > 40:
        return 70, "Stable"
    elif recent_count > 10:
        return 40, "Low"
    return 15, "Fading"


def update_group_snapshot(group):
    logs = ActivityLog.objects.filter(group=group)

    total_messages = logs.filter(activity_type="MESSAGE").count()
    total_posts = logs.filter(activity_type="POST").count()
    total_games = logs.filter(activity_type="GAME").count()

    most_active = logs.values("user").annotate(
        count=Count("user")
    ).order_by("-count").first()

    score, state = calculate_health_score(group)

    snapshot, _ = GroupAnalyticsSnapshot.objects.get_or_create(group=group)

    snapshot.total_messages = total_messages
    snapshot.total_posts = total_posts
    snapshot.total_games = total_games
    snapshot.health_score = score
    snapshot.health_state = state

    if most_active:
        snapshot.most_active_user_id = most_active["user"]

    snapshot.save()


def update_friendship_dna(group):
    logs = ActivityLog.objects.filter(group=group)

    users = logs.values_list("user", flat=True).distinct()

    for user_id in users:
        user_logs = logs.filter(user_id=user_id)

        roast_freq = user_logs.filter(activity_type="POST").count()

        message_count = user_logs.filter(activity_type="MESSAGE").count()

        words = []
        for log in user_logs:
            if hasattr(log, "content"):
                words.extend(log.content.split())

        most_common_word = ""
        if words:
            most_common_word = Counter(words).most_common(1)[0][0]

        label = "Observer"
        if roast_freq > 10:
            label = "Top Roaster"
        elif message_count > 50:
            label = "Chat Engine"
        elif message_count < 5:
            label = "Ghost"

        dna, _ = FriendshipDNA.objects.get_or_create(
            group=group,
            user_id=user_id
        )

        dna.roast_frequency = roast_freq
        dna.message_count = message_count
        dna.most_used_word = most_common_word
        dna.label = label
        dna.save()


def update_memory_heatmap(group):
    today = timezone.now().date()

    count = ActivityLog.objects.filter(
        group=group,
        created_at__date=today
    ).count()

    heatmap, _ = MemoryHeatmap.objects.get_or_create(
        group=group,
        date=today
    )

    heatmap.interaction_count = count
    heatmap.save()
