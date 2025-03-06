from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import uuid
import json

# GLOBALE
FPS60 = (1/120)
NB_PLAYER = 4

class Pong:
	def __init__(self, p1_keys, p2_keys):
		self._vector = [0, 0]
		self._score = [0, 0]
		self._ball = [0, 0]
		self.p1_keys = p1_keys
		self.p2_keys = p2_keys
		self._paddle1 = 0
		self._paddle2 = 0

	def update(self):
		pass

	def get_gameData(self):
		return {'p1_keys': self.p1_keys, 'p2_keys': self.p2_keys}


class Game:

	def __init__(self, players):
		self._players = players
		self._channel_layer = players[0].channel_layer
		self._id = None
		self._isRunning = True
		self.winner = None
		self.looser = None
		self.pong = None

	async def countdown(self):
		await asyncio.sleep(1)
		for i in range(3, 0, -1):
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Countdown'})
			await asyncio.sleep(1)
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Go'})

	async def beg(self):
		self.pong = Pong(self._players[0].keys, self._players[1].keys)
		self._id = uuid.uuid4().hex
		for p in self._players:
			await self._channel_layer.group_add(self._id, p.channel_name)
			p.game = self
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Game', 'players': [p.username for p in self._players]})
		await self.countdown()
		await self._run()

	async def _run(self):
		while self._isRunning:
			self.pong.update()
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_gameData()})
			await asyncio.sleep(FPS60)

	async def end(self, looser):
		self._isRunning = False
		self.looser = looser
		self._players.remove(looser)
		self.winner = self._players.pop()
		await self.looser.msg({'event': 'You loosed.'})
		await self.winner.msg({'event': 'You won.'})
		self.looser.game = None
		self.winner.game = None
		looser.game = None
		for p in self._players:
			await self._channel_layer.group_discard(self._id, p.channel_name)


class Round:
	def __init__(self, players):
		self._players = players
		self.winners = []

	async def _manageGame(self, players):
		if players[0].left or players[1].left:
			self.winners.append(players[0] if players[1].left else players[1])
		else:
			game = Game(players)
			await game.beg()
			self.winners.append(game.winner)
	
	async def runGames(self):
		async with asyncio.TaskGroup() as asyncGameGroup:
			while self._players:
				asyncGameGroup.create_task(self._manageGame(self._players[:2]))
				self._players = self._players[2:]


class BaseManager:
	userWaiting = []

	def __init__(self):
		self.queue = []

	async def add(self, user):
		if user.username not in self.userWaiting:
			self.queue.append(user)
			self.userWaiting.append(user.username)
			user.inqueue = True
			await self.check_start()
		else:
			await user.msg({'event': 'Error', 'log': 'Already in queue with this account.'})
			await user.close()

	def rmv(self, user):
		if user.inqueue and user.username in self.userWaiting:
			self.queue.remove(user)
			self.userWaiting.remove(user.username)
			user.inqueue = False


class Manager(BaseManager):
	async def check_start(self):
		if len(self.queue) >= 2:
			players = [self.queue.pop(), self.queue.pop()]
			asyncio.create_task(self.match(players))

	async def match(self, players):
		game = Game(players)
		await game.beg()
		await game.winner.msg({'event': 'End', 'result':'You won the game'})
		await game.winner.close()


class TournamentManager(BaseManager):
	async def check_start(self):
		if len(self.queue) >= 4:
			players = self.queue[:4]
			self.queue = self.queue[4:]
			asyncio.create_task(self.begRound(players))

	async def begRound(self, players):
		while len(players) > 1:
			round = Round(players)
			await round.runGames()
			players = round.winners
		winner = players.pop()
		await winner.msg({'event': 'End', 'result':'You won the game'})
		await winner.close()


# class MultiplayerManager(BaseManager):
# 	async def check_start(self):
# 		if len(self.queue) >= 4:
# 			players = self.queue[:4]
# 			self.queue = self.queue[4:]
# 			asyncio.create_task(self.match(players))

# 	async def match(self, players):
# 		game = Game(players)
# 		await game.beg()
# 		await game.winner.msg({'event': 'End', 'result':'You won the game'})
# 		await game.winner.close()


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
		self.inqueue = False

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
				self.keys[data['key']] = dic[data['type']]
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
