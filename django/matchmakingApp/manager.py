from matchmakingApp.game import Game
import asyncio


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