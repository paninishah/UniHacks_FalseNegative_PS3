import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameSession, GameResponse, GameParticipant


class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.room_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "draw":
            # Broadcast drawing coordinates
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_draw",
                    "draw_data": data["draw_data"]
                }
            )

        elif action == "guess":
            guess = data["guess"]
            user = self.scope["user"]

            await self.save_guess(user.id, guess)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_guess",
                    "user": user.username,
                    "guess": guess
                }
            )

        elif action == "vote":
            # Handle Most Likely To Vote
            vote_for = data["vote_for"]
            user = self.scope["user"]
            
            await self.save_vote(user.id, vote_for)
            
            # Helper: Check if all voted? (Logic simplified for now)
            # Just broadcast that someone voted
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_vote",
                    "user": user.username,
                    "vote_for": vote_for
                }
            )

    async def broadcast_draw(self, event):
        await self.send(text_data=json.dumps({
            "action": "draw",
            "draw_data": event["draw_data"]
        }))

    async def broadcast_guess(self, event):
        await self.send(text_data=json.dumps({
            "action": "guess",
            "user": event["user"],
            "guess": event["guess"]
        }))

    @database_sync_to_async
    def save_guess(self, user_id, guess):
        GameResponse.objects.create(
            game_id=self.game_id,
            user_id=user_id,
            response_text=guess
        )

    async def broadcast_vote(self, event):
        await self.send(text_data=json.dumps({
            "action": "vote",
            "user": event["user"],
        }))

    @database_sync_to_async
    def save_vote(self, user_id, vote_for):
        GameResponse.objects.update_or_create(
            game_id=self.game_id,
            user_id=user_id,
            defaults={"response_text": vote_for}
        )
