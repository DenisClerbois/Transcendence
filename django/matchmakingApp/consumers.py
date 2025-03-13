from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import uuid
import json

from matchmakingApp.pong import Pong

# GLOBALE
FPS30 = 1 / 30
NB_PLAYER = 4
 
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
		pass
  
	async def beg(self):
		p_keys = [self._players[0].keys, self._players[1].keys, self._players[0].keys, self._players[1].keys]
		self.pong = Pong(p_keys, self.end, 4, self._players)
		self._id = uuid.uuid4().hex
		for p in self._players:
			await self._channel_layer.group_add(self._id, p.channel_name)
			p.game = self
		await asyncio.sleep(0.05)
		await self._channel_layer.group_send(self._id,
			{
				'type': 'msg',
				'event': 'Game',
				'players': [p.username for p in self._players],
				'gameConst': self.pong.get_gameConst()
			})
		await asyncio.sleep(1)
		for i in range(3, 0, -1):
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Countdown'})
			await asyncio.sleep(1)
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Go'})
		await self._run()

	async def _run(self):
		while self._isRunning:
			self.pong.update()
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_gameData()})
			await asyncio.sleep(FPS30)

	async def end(self, looser):
		print("LOOOOOOSER >>>>>>", looser)
		self._isRunning = False
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_gameData()})
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
		await looser.close()

class Manager:
	
	def __init__(self):
		self.queue = []
	
	async def add(self, user):
		if user.username not in [u.username for u in self.queue]:
			self.queue.append(user)
			user.inqueue = True
			if len(self.queue) >= 2:
				players = [self.queue.pop(), self.queue.pop()]
				asyncio.create_task(self.match(players))
		else:
			await user.msg({'Error': 'Already in queue.'})
			await user.close()
	
	def rmv(self, user):
		if user.inqueue and user.username in [u.username for u in self.queue]:
			self.queue.remove(user)
			user.inqueue = False

	async def match(self, players):
		game = Game(players)
		await game.beg()
		await game.winner.close()
		# add match to history

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


class Tournament:
	def __init__(self, players):
		self.players = players
	
	async def start(self):
		while len(self.players) != 1:
			round = Round(self.players)
			await round.runGames()
			self.players = round.winners
		winner = self.players.pop()
		await winner.msg({'event': 'You won the tournament'})
		await winner.close()


class TournamentManager:
	
	def __init__(self):
		self.queue = []
	
	async def add(self, user):
		if user.username not in [u.username for u in self.queue]:
			self.queue.append(user)
			user.inqueue = True
			if len(self.queue) >= 4:
				asyncio.create_task(self.startTournament(self.queue[:4]))
				self.queue = self.queue[4:]
		else:
			await user.msg({'Error': 'Already in queue.'})
			await user.close()
	
	def rmv(self, user):
		if user.inqueue and user.username in [u.username for u in self.queue]:
			self.queue.remove(user)
			user.inqueue = False

	async def startTournament(self, players):
		tournament = Tournament(players)
		await tournament.start()


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
				await self.game.end(self) if self.game else self.manager.rmv(self)
				self.left = True
			case _:
				pass

	async def disconnect(self, close_code=None):
		pass
