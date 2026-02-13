import random
from django.db.models import Count
from django.utils import timezone
from .models import GameSession, GameParticipant, GameResponse
from engagement.services import log_activity
from analytics.models import FriendshipDNA


# ---------------------------------------------------
# MOST LIKELY TO PROMPT GENERATION
# ---------------------------------------------------

def generate_most_likely_question(group):

    dna_records = FriendshipDNA.objects.filter(group=group)

    if not dna_records.exists():
        fallback_questions = [
            "Most likely to ghost everyone?",
            "Most likely to cry during exams?",
            "Most likely to become famous?",
            "Most likely to forget birthdays?",
            "Most likely to start drama?",
        ]
        return random.choice(fallback_questions)

    dynamic_templates = []

    top_roaster = dna_records.filter(label="Top Roaster").first()
    ghost = dna_records.filter(label="Ghost").first()
    chat_engine = dna_records.filter(label="Chat Engine").first()

    if top_roaster:
        dynamic_templates.append(
            f"Most likely to roast {top_roaster.user.username} back?"
        )

    if ghost:
        dynamic_templates.append(
            f"Most likely to disappear like {ghost.user.username}?"
        )

    if chat_engine:
        dynamic_templates.append(
            f"Most likely to text more than {chat_engine.user.username}?"
        )

    generic = [
        "Most likely to get rich first?",
        "Most likely to get arrested for chaos?",
        "Most likely to marry for money?",
        "Most likely to drop everything and travel?",
    ]

    all_questions = dynamic_templates + generic

    return random.choice(all_questions)


# ---------------------------------------------------
# START GAME
# ---------------------------------------------------

def start_game(group, game_type, secret_word=None):

    prompt_text = None

    if game_type == "most_likely_to":
        prompt_text = generate_most_likely_question(group)

    game = GameSession.objects.create(
        group=group,
        game_type=game_type,
        prompt_text=prompt_text,
        secret_word=secret_word
    )

    # Auto-create participants
    members = group.groupmember_set.all()

    for member in members:
        GameParticipant.objects.create(
            game=game,
            user=member.user
        )

    return game


# ---------------------------------------------------
# MOST LIKELY TO LOGIC
# ---------------------------------------------------

def submit_vote(game, user, voted_username):

    if game.status != "active":
        return {"error": "Game not active"}

    # Prevent duplicate vote overwrite
    GameResponse.objects.update_or_create(
        game=game,
        user=user,
        defaults={"response_text": voted_username}
    )

    log_activity(user, game.group, "GAME")

    return {"message": "Vote submitted"}


def finish_most_likely(game):

    if game.status != "active":
        return {"error": "Game already completed"}

    votes = GameResponse.objects.filter(game=game)

    counts = votes.values("response_text").annotate(
        count=Count("response_text")
    ).order_by("-count")

    if not counts:
        return {"error": "No votes submitted"}

    winner_username = counts.first()["response_text"]

    try:
        winner_participant = GameParticipant.objects.get(
            game=game,
            user__username=winner_username
        )

        winner_participant.score += 10
        winner_participant.save()

    except GameParticipant.DoesNotExist:
        return {"error": "Winner not found in participants"}

    game.status = "completed"
    game.ended_at = timezone.now()
    game.save()

    return {"winner": winner_username}


# ---------------------------------------------------
# SKRIBBL LOGIC
# ---------------------------------------------------

def submit_guess(game, user, guess):

    if game.status != "active":
        return {"error": "Game not active"}

    GameResponse.objects.update_or_create(
        game=game,
        user=user,
        defaults={"response_text": guess}
    )

    log_activity(user, game.group, "GAME")

    if not game.secret_word:
        return {"error": "No secret word set"}

    if guess.strip().lower() == game.secret_word.strip().lower():

        participant = GameParticipant.objects.get(
            game=game,
            user=user
        )

        participant.score += 15
        participant.save()

        game.status = "completed"
        game.ended_at = timezone.now()
        game.save()

        return {"correct": True, "winner": user.username}

    return {"correct": False}


# ---------------------------------------------------
# LEADERBOARD
# ---------------------------------------------------

def get_leaderboard(game):

    participants = GameParticipant.objects.filter(
        game=game
    ).order_by("-score")

    return [
        {
            "username": p.user.username,
            "score": p.score
        }
        for p in participants
    ]
