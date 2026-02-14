import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Group, Message

class ChatConsumer(AsyncWebsocketConsumer):
    # In-memory tracking of connected users (Not production scalable, but good for MVP)
    # Structure: { group_id: { user_id: { username, avatar } } }
    connected_users = {}

    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'chat_{self.group_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Add to local presence list
        if self.group_id not in self.connected_users:
            self.connected_users[self.group_id] = {}
        
        self.connected_users[self.group_id][self.user.id] = {
            'id': self.user.id,
            'username': self.user.username,
            # 'avatar': self.user.profile_picture.url if self.user.profile_picture else None 
            # Simplified for now
        }

        # Broadcast "User Joined"
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username
                },
                'online_count': len(self.connected_users[self.group_id])
            }
        )

        # Send current online list to self
        await self.send(text_data=json.dumps({
            'type': 'presence_list',
            'users': list(self.connected_users[self.group_id].values())
        }))


    async def disconnect(self, close_code):
        # Remove from presence
        if hasattr(self, 'group_id') and self.group_id in self.connected_users:
            if self.user.id in self.connected_users[self.group_id]:
                del self.connected_users[self.group_id][self.user.id]

                # Broadcast "User Left"
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_left',
                        'user_id': self.user.id,
                        'online_count': len(self.connected_users[self.group_id])
                    }
                )
            
            # Cleanup empty groups
            if not self.connected_users[self.group_id]:
                del self.connected_users[self.group_id]

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = self.scope['user']

        if not user.is_authenticated:
            return

        # Save message to database
        saved_message = await self.save_message(user, self.group_id, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': user.username,
                'user_id': user.id,
                'timestamp': str(saved_message.created_at)
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        user_id = event['user_id']
        timestamp = event['timestamp']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message', # Explicit type for frontend switch
            'message': message,
            'user': user,
            'user_id': user_id,
            'timestamp': timestamp
        }))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'online_count': event['online_count']
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'online_count': event['online_count']
        }))

    @database_sync_to_async
    def save_message(self, user, group_id, content):
        group = Group.objects.get(id=group_id)
        return Message.objects.create(user=user, group=group, content=content)
