import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class MultiplayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"[CONNECT] Channel Name: {self.channel_name}")
        self.room_name = "game_room"
        try:
            await self.channel_layer.group_add(
                self.room_name,
                self.channel_name,
            )
            print(f"[CONNECT] Added {self.channel_name} to {self.room_name}")
            await self.accept()
            print(f"[CONNECT] Connection accepted: {self.channel_name}")
        except Exception as e:
            print(f"[ERROR] Connect failed: {e}")
            await self.close()

    async def disconnect(self, close_code):
        print(f"[DISCONNECT] Channel: {self.channel_name}, Code: {close_code}")
        try:
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name,
            )
            print(f"[DISCONNECT] Removed {self.channel_name} from {self.room_name}")
        except Exception as e:
            print(f"[ERROR] Disconnect failed: {e}")

    async def receive(self, text_data):
        print(f"[RECEIVE] Data: {text_data}")
        try:
            data = json.loads(text_data)
            action = data.get('action')
            player_id = data.get('player_id')
            score = data.get('score')
            key = data.get('key')

            # Broadcast the action to all players in the room
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "game_update",
                    "message": f"Player: {player_id} Action: {action} Key: {key}",
                    "score": f"Player {player_id} scored {score} points",
                },
            )
            print(f"[RECEIVE] Action broadcasted: Player {player_id} performed {action}")
        except Exception as e:
            print(f"[ERROR] Receive failed: {e}")

    async def game_update(self, event):
        message = event["message"]
        print(f"[GAME_UPDATE] Message: {message}")
        try:
            await self.send(text_data=json.dumps({"message": message}))
            print(f"[GAME_UPDATE] Message sent: {message}")
        except Exception as e:
            print(f"[ERROR] Game update failed: {e}")

class WaitingRoomQueue(AsyncWebsocketConsumer):
    active_players = {}

    async def connect(self):
        self.room_name = "pong_lobby"
        self.room_group_name = f"lobby_{self.room_name}"
        print("[ROOM NAME] :", self.room_group_name)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.active_players[self.channel_name] = self.scope["user"].username

        await self.send_lobby_update()

    async def disconnect(self, close_code):
        if self.channel_name in self.active_players:
            del self.active_players[self.channel_name]

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.send_lobby_update()

    async def send_lobby_update(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "lobby_update",
                "players": list(self.active_players.values()),
            },
        )

    async def lobby_update(self, event):
        await self.send(text_data=json.dumps({"players": event["players"]}))

    async def receive(self, text_data):
        print(f"[RECEIVE] Data: {text_data}")
        try:
            data = json.loads(text_data)
            player = data.get('player')
            action = data.get('action')

            # Broadcast the action to all players in the room
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "join_game",
                    "player": player,
                    "action": action,
                    
                },
            )
            print(f"[RECEIVE] Action broadcasted: {player} {action}")
        except Exception as e:
            print(f"[ERROR] Receive failed: {e}")
    async def join_game(self):
        print("GAME JOINED")
