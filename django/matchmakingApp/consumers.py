import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

# from django.contrib.auth.models import User
from django.db import transaction
from channels.db import database_sync_to_async

from matchmakingApp.models import Lobby, Player


class WaitingRoomQueue(AsyncWebsocketConsumer):
    async def connect(self):
        """When a player connects, add them to the lobby and send updates."""
        self.lobby_name = "lobby_room"
        self.room_group_name = f"lobby_{self.lobby_name}"
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            print(f"User not found in lobby.") 
            return

        print(f"User {user.username} connected to lobby.") 
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.add_player_to_lobby(user)
        if await self.check_for_launch():
            await self.send_players_to_game()
        await self.send_lobby_update()

    async def disconnect(self, close_code):
        """When a player disconnects, remove them from the lobby and update others."""
        user = self.scope["user"]
        await self.remove_player_from_lobby(user)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.send_lobby_update()

    async def send_lobby_update(self):
        """Send updated lobby player list to all clients."""
        lobby = await self.get_lobby()
        if not lobby:
            print("Lobby does not exist. Skipping lobby update.")
            return
        players = await self.get_players_in_lobby()
        formatted_players = [{"username": player.user.username} for player in players]

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "lobby_update",
                "players": formatted_players,
            },
        )
   
    async def lobby_update(self, event):
        await self.send(text_data=json.dumps({"players": event["players"]}))

    @database_sync_to_async
    def add_player_to_lobby(self, user):
        lobby, _ = Lobby.objects.get_or_create(name=self.lobby_name, defaults={"max_players": 2})
        if not Player.objects.filter(user=user, lobby=lobby).exists():
            Player.objects.create(user=user, lobby=lobby)

    @database_sync_to_async
    def remove_player_from_lobby(self, user):
        Player.objects.filter(user=user).delete()
        print(f"Player {user.username} removed from lobby.")
        if not Player.objects.filter(lobby__name=self.lobby_name).exists():
            Lobby.objects.filter(name=self.lobby_name).delete()


    @database_sync_to_async 
    def get_lobby(self):
        try:
            return Lobby.objects.get(name=self.lobby_name)
        except Lobby.DoesNotExist:
            return None

    @database_sync_to_async
    def get_players_in_lobby(self):
        return list(Player.objects.select_related('user').filter(lobby__name=self.lobby_name))

    @database_sync_to_async
    def get_player_list(self):
        return Lobby.objects.get(name=self.lobby_name).get_player_list()

    @database_sync_to_async
    def check_for_launch(self):
        if Lobby.objects.get(name=self.lobby_name).is_full():
            return 1
        return 0
         
    async def send_players_to_game(self):
        playerList = await self.get_player_list()
        room_id = room_id = "_".join(playerList)
        if (room_id.find("_")):
            room_id = room_id.replace("_", "")
        print(room_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "send_to_game",
                "sendPlayers": playerList,
                "room_id": room_id,
            },
        )
    async def send_to_game(self, event):
        send_players = [{"username": player} for player in event["sendPlayers"]]

        await self.send(text_data=json.dumps({
            "sendPlayers": send_players,
            "room_id": event["room_id"],
        }))
