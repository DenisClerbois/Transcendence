import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# from django.contrib.auth.models import User
from django.db import transaction

from matchmakingApp.models import Lobby, Player
from asgiref.sync import sync_to_async


# class WaitingRoomQueue(AsyncWebsocketConsumer):
#     async def connect(self):
#         """When a player connects, add them to the lobby and send updates."""
#         self.lobby_name = "lobby_room"
#         self.room_group_name = f"lobby_{self.lobby_name}"
#         user = self.scope["user"]

#         if not user.is_authenticated:
#             await self.close()
#             print(f"User not found in lobby.") 
#             return

#         print(f"User {user.username} connected to lobby.") 
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         await self.add_player_to_lobby(user)
#         await self.send_lobby_update()

#     async def disconnect(self, close_code):
#         """When a player disconnects, remove them from the lobby and update others."""
#         user = self.scope["user"]
#         await self.remove_player_from_lobby(user)

#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#         await self.send_lobby_update()

#     async def send_lobby_update(self):
#         """Send updated lobby player list to all clients."""
#         lobby = await self.get_lobby()
#         players = lobby.get_player_list()  # Fetch usernames from DB

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "lobby_update",
#                 "players": players,
#             }, 
#         )

#     async def lobby_update(self, event):
#         """Receive updated player list and send to the frontend."""
#         await self.send(text_data=json.dumps({"players": event["players"]}))

#     async def add_player_to_lobby(self, user):
#         """Adds a player to the database asynchronously."""
#         await sync_to_async(self._add_player_to_lobby)(user)

#     async def remove_player_from_lobby(self, user):
#         """Removes a player from the database asynchronously."""
#         await sync_to_async(self._remove_player_from_lobby)(user)

#     @staticmethod
#     def _add_player_to_lobby(user):
#         """Helper function to interact with the database in a synchronous context."""
#         lobby, _ = Lobby.objects.get_or_create(name="lobby_room", defaults={"max_players": 2})
#         if not Player.objects.filter(user=user, lobby=lobby).exists():
#             Player.objects.create(user=user, lobby=lobby)

#     @staticmethod
#     def _remove_player_from_lobby(user):
#         """Helper function to interact with the database in a synchronous context."""
#         Player.objects.filter(user=user).delete()
#         if not Player.objects.filter(lobby__name="lobby_room").exists():
#             Lobby.objects.filter(name="lobby_room").delete()
#     @transaction.atomic
#     async def add_player_to_lobby(self, user):
#         """Adds a player to the database if they are not already in the lobby."""
#         lobby, _ = Lobby.objects.get_or_create(name=self.lobby_name, defaults={"max_players": 2})
#         if not Player.objects.filter(user=user, lobby=lobby).exists():
#             Player.objects.create(user=user, lobby=lobby)

#     @transaction.atomic
#     async def remove_player_from_lobby(self, user):
#         """Removes a player from the database and deletes the lobby if empty."""
#         Player.objects.filter(user=user).delete()
#         if not Player.objects.filter(lobby__name=self.lobby_name).exists():
#             Lobby.objects.filter(name=self.lobby_name).delete()  # Delete empty lobby

#     async def get_lobby(self):
#         """Fetch the current lobby instance."""
#         return Lobby.objects.get(name=self.lobby_name)

class WaitingRoomQueue(AsyncWebsocketConsumer):
    active_players = {}  # Tracks all connected players
    ready_players = []  # Tracks players who are ready

    async def connect(self):
        self.room_name = "pong_lobby"
        self.room_group_name = f"lobby_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.active_players[self.channel_name] = self.scope["user"].username
        await self.send_lobby_update()

    async def disconnect(self, close_code):
        if self.channel_name in self.active_players:
            del self.active_players[self.channel_name]
        if self.channel_name in self.ready_players:
            self.ready_players.remove(self.channel_name)

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.send_lobby_update()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")
            # player = self.scope["user"].username
           
            if action == "ready":
                if self.channel_name not in self.ready_players:
                    self.ready_players.append(self.channel_name)

                await self.pair_players()

            await self.send_lobby_update()

        except Exception as e:
            print(f"[ERROR] Receive failed: {e}")

    async def send_lobby_update(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "lobby_update",
                "players": list(self.active_players.values()),
                "ready_count": len(self.ready_players),
            },
        )

    async def lobby_update(self, event):
        await self.send(text_data=json.dumps({
            "players": event["players"],
            "ready_count": event["ready_count"]
        }))

    async def pair_players(self):
        while len(self.ready_players) >= 2:
            player1 = self.ready_players.pop(0)
            player2 = self.ready_players.pop(0)

            await self.send_to_player(player1, {"action": "redirect"})
            await self.send_to_player(player2, {"action": "redirect"})

    async def send_to_player(self, player_channel, message):
        await self.channel_layer.send(
            player_channel,
            {
                "type": "redirect_player",
                "message": message,
            },
        )

    async def redirect_player(self, event):
        await self.send(text_data=json.dumps(event["message"]))

# peut etre envoyer les informations necessaire a pong sur un pong server side, genre les players la room pour creer la websocket etc. >>> peut etre important de faire pong server side pour ca?
