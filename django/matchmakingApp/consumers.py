from channels.generic.websocket import AsyncWebsocketConsumer # type: ignore
import json

from .manager import Match, Tournament, Multiplayer, MatchVsIA
from .users import Users
from channels.db import database_sync_to_async # type: ignore

class Consumer(AsyncWebsocketConsumer):

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.nickanme = None
		self.inputs = {'ArrowDown': False, 'ArrowUp': False}
		self.manager = None
		self.id = None
		self._actions = {
			"input": self._input,
			# "deconnected": self._disconnect,
			"give_up": self._giveUp,
			# "quit": self._quitQueue,
			"quit": self._quit,
		}

	@database_sync_to_async
	def get_user_nickname(self, user):
		return user.profile.nickname

	async def connect(self):
		await self.accept()
		user = self.scope['user']
		self.id = user.id
		if Users.get(self.id):
			await Users.reconnect(self.id, self)
		else:
			self.nickname = await self.get_user_nickname(user)
			Users.append(self.id, self)
			action = self.scope['url_route']['kwargs']['action']
			match action:
				case 'classique':
					await Match.append(self.id)
				case 'tournament':
					await Tournament.append(self.id)
				case 'multiplayer':
					await Multiplayer.append(self.id)
				case 'ia':
					await MatchVsIA.append(self.id)
	
	async def msg(self, event):
		event_data = event.copy()
		event_data.pop('type', None)
		await self.send(text_data=json.dumps({'event': event_data}))
	
	async def end_message(self, event):
		event_data = event.copy()
		event_data.pop('type', None)
		await self.send(text_data=json.dumps({'event': event_data}))
		await self.close()
	
	async def _input(self, messsage):
		dic = {'keydown': True, 'keyup': False}
		arrow = messsage.get('key')
		move = messsage.get('bool')
		if arrow and move:
			self.inputs[arrow] = dic[move]

	async def _giveUp(self, messsage):
		user = Users.get(self.id)
		if user and user.in_game:
			await user.game_stop_function(self.id)

	# async def _disconnect(self, messsage):
	# 	await Users.disconnect(self.id)
	# 	await self.close()
	
	# async def _quitQueue(self, message):
	# 	Users.remove(self.id)
	# 	await self.close()

	async def _quit(self, message):
		user = Users.get(self.id)
		if user and user.in_game:
			await Users.disconnect(self.id)
		else:
			Users.remove(self.id)
		await self.close()

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')
		action = self._actions.get(message_type)
		if action:
			await action(data)
