from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio

class GameLoopConsumer:
	def __init__(self, game_id, channel_layer, p1, p2):
		self.game_id = game_id
		self.channel_layer = channel_layer
		self.game_state = {
			'ball': [0, 0],
			'vector': [0, 0],
			'score': [0, 0],
			'paddle1': 0,
			'paddle2': 0,
			p1: {'ArrowDown': False, 'ArrowUp': False},
			p2: {'ArrowDown': False, 'ArrowUp': False},
		}
		self.is_running = True
	
	def start_game_loop(self):
		self.game_loop_task = asyncio.create_task(self.game_loop())

	async def game_loop(self):
		while self.is_running:
			await self.channel_layer.group_send(
				self.game_id,
				{
					'type': 'message',
					'message': self.game_state,
				}
			)
			await asyncio.sleep(3)
	
	def stop_game_loop(self):
		self.is_running = False


active_game_loops = {}	


class matchmakingConsumer(AsyncWebsocketConsumer):

	queue = []

	async def connect(self):
		await self.accept()
		if self in self.queue:
			return self.close()
		self.username = self.scope['user'].username
		if len(self.queue):
			await self.match()
		else:
			self.queue.append(self)

	async def message(self, event):
		await self.send(text_data=json.dumps({'event': event}))

	async def giveup(self, event):
		await self.send(text_data=json.dumps({'giveup': event['username']}))
		await self.close()

	async def roomID(self, event):
		self.room_name = event['room']
		await self.send(text_data=json.dumps({'gameFound': True}))

	async def match(self):
		user = self.queue.pop(0)
		room_name = f"match_{user.username}_{self.username}"

		await user.channel_layer.group_add(room_name, user.channel_name)
		await self.channel_layer.group_add(room_name, self.channel_name)
		
		await self.channel_layer.group_send( 
			room_name,
			{
				"type": "roomID",
				"room": room_name, 
			}
		)
		game_loop_consumer = GameLoopConsumer(
			game_id=room_name,
			channel_layer=self.channel_layer,
			p1=user.username,
			p2=self.username,
		)
		active_game_loops[room_name] = game_loop_consumer
		game_loop_consumer.start_game_loop()
	
	async def receive(self, text_data):
		dic = {'keydown': True, 'keyup': False}
		data = json.loads(text_data)
		gameState = active_game_loops[self.room_name].game_state
		gameState[self.username][data['key']] = dic[data['type']]

	async def disconnect(self, close_code):
		if self in self.queue:
			self.queue.remove(self)
		else:
			await self.channel_layer.group_send(
				self.room_name,
				{
					"type": "giveup",
					'username': self.username, 
				}
			)
			await self.channel_layer.group_discard(self.room_name, self.channel_name)
			
			if self.room_name in active_game_loops:
				active_game_loops[self.room_name].stop_game_loop()
				del active_game_loops[self.room_name]
