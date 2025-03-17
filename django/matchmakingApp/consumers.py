from channels.generic.websocket import AsyncWebsocketConsumer # type: ignore
import json

from matchmakingApp.manager import Manager, TournamentManager


class Consumer(AsyncWebsocketConsumer):

	manager = Manager()
	tournamentManager = TournamentManager()

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.username = None
		self.game = None
		self.keys = {'ArrowDown': False, 'ArrowUp': False}
		self.manager = None
		self.left = False

	async def connect(self):
		await self.accept()
		self.username = self.scope['user'].username
		gameType = self.scope['url_route']['kwargs']['gameType']
		match gameType:
			case 'classique':
				self.manager = Consumer.manager
			case 'tournament':
				self.manager = Consumer.tournamentManager
		await self.manager.add(self)
	
	async def msg(self, event):
		event_data = event.copy()
		event_data.pop('type', None)
		await self.send(text_data=json.dumps({'event': event_data}))

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')
		match message_type:
			case 'input':
				dic = {'keydown': True, 'keyup': False}
				self.keys[data['key']] = dic[data['bool']]
			case 'quit':
				if self.game:
					await self.game.end(self)
					self.left = True
				else:
					self.manager.rmv(self)
				await self.close()
			case _:
				pass

	async def disconnect(self, close_code=None):
		pass

