import asyncio, uuid
from matchmakingApp.pong import Pong, FPS
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
		await asyncio.sleep(1)
		for i in range(3, 0, -1):
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Countdown'})
			await asyncio.sleep(1)
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Go'})

	async def beg(self):
		p_keys = [self._players[0].keys, self._players[1].keys, self._players[0].keys, self._players[1].keys]
		self.pong = Pong(p_keys, self.end, 2, self._players)
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
		await self.countdown()
		await self._run()

	async def _run(self):
		while self._isRunning:
			self.pong.update()
			await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'Data', 'pong': self.pong.get_gameData()})
			await asyncio.sleep(FPS)

	async def end(self, looser):
		self._isRunning = False
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_gameData()})
		self.looser = looser
		self._players.remove(looser)
		self.winner = self._players.pop()
		await self.looser.msg({'event': 'You loosed.'})
		await self.winner.msg({'event': 'You won.'})
		self.looser.game = None
		self.winner.game = None
		for p in self._players:
			await self._channel_layer.group_discard(self._id, p.channel_name)