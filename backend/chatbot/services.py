import random
from analytics.models import GroupAnalyticsSnapshot, FriendshipDNA


def generate_group_context(group):

    snapshot = GroupAnalyticsSnapshot.objects.filter(group=group).first()
    dna_records = FriendshipDNA.objects.filter(group=group)

    context = {}

    if snapshot:
        context["health_state"] = snapshot.health_state
        context["total_messages"] = snapshot.total_messages
    else:
        context["health_state"] = "Unknown"
        context["total_messages"] = 0

    labels = [dna.label for dna in dna_records]
    context["labels"] = labels

    return context


def generate_response(user, message, group=None):

    message_lower = message.lower()

    if group:
        context = generate_group_context(group)

        if "health" in message_lower:
            return f"Your group energy is currently '{context['health_state']}'."

        if "most active" in message_lower:
            snapshot = GroupAnalyticsSnapshot.objects.filter(group=group).first()
            if snapshot and snapshot.most_active_user:
                return f"The most active member is {snapshot.most_active_user.username}."
            return "No activity data yet."

        if "dna" in message_lower:
            if context["labels"]:
                return f"Your group personalities include: {', '.join(context['labels'])}."
            return "Not enough data to build friendship DNA yet."

    # General fallback responses
    generic_responses = [
        "That’s interesting. Tell me more.",
        "Are you sure about that?",
        "Sounds chaotic.",
        "I sense drama in this group.",
        "This group needs a game night.",
        "You should start a Most Likely To game.",
    ]

    return random.choice(generic_responses)
