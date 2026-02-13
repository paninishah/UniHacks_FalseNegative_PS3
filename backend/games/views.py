from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import (
    start_game,
    submit_vote,
    calculate_most_likely_winner,
    submit_guess,
    get_leaderboard
)
from .models import GameSession
from groups.models import Group


class StartGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        group = Group.objects.get(id=group_id)

        game_type = request.data["game_type"]
        prompt_text = request.data.get("prompt_text")
        secret_word = request.data.get("secret_word")

        game = start_game(group, game_type, prompt_text, secret_word)

        return Response({"game_id": game.id})


class SubmitVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        game = GameSession.objects.get(id=game_id)

        voted_username = request.data["voted_username"]

        result = submit_vote(game, request.user, voted_username)

        return Response(result)


class FinishMostLikelyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        game = GameSession.objects.get(id=game_id)

        winner = calculate_most_likely_winner(game)

        return Response({"winner": winner})


class SubmitGuessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        game = GameSession.objects.get(id=game_id)

        guess = request.data["guess"]

        result = submit_guess(game, request.user, guess)

        return Response(result)


class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id):
        game = GameSession.objects.get(id=game_id)
        leaderboard = get_leaderboard(game)

        return Response(leaderboard)
