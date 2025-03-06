from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import uuid
import json
from dataclasses import dataclass, asdict
from math import sqrt, cos, sin, pi

@dataclass
class Paddle:
	width: int
	height: int
	speed: float

@dataclass
class Board:
	x: int
	y: int

@dataclass
class GameData:
	board: Board
	paddle: Paddle
	ballRadius: float
	initSpeed: int

# GLOBALE
FPS30 = 1 / 30
NB_PLAYER = 4

class Pong:
	def __init__(self, p1_keys, p2_keys):
		self.game_const = GameData(
			board=Board(x=1000, y=500),
			paddle=Paddle(width=12, height=100, speed=0),
			ballRadius=10,
			initSpeed=5,
		)
		self._vector = [1 / sqrt(2), 1 / sqrt(2)]
		self._speed = 200 * (1 / 30) 
		self._score = [0, 0]
		self._ball = [self.game_const.board.x / 2, self.game_const.board.y / 2]
		self.p1_keys = p1_keys #what are those???
		self.p2_keys = p2_keys
		self._paddle1 = [1, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]
		self._paddle2 = [self.game_const.board.x - self.game_const.paddle.width, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]

	def update(self):
		self.move_ball()
		self.move_paddles()
	def get_gameConst(self):
		return asdict(self.game_const)
	def get_gameData(self):
		return {
			'ball': self._ball,
			'vector': self._vector,
			'speed': self._speed,
			'score': self._score,
			'paddle1': self._paddle1,
			'paddle2': self._paddle2,
			'p1_keys': self.p1_keys,
			'p2_keys': self.p2_keys,
			}
	
	def move_paddles(self):
		paddleSpeed = self.game_const.paddle.speed
		if self.p1_keys["ArrowUp"]:
			self.check_paddle_movement(self._paddle1[1], -1 * paddleSpeed, "paddle1")
		elif self.p1_keys['ArrowDown']:
			self.check_paddle_movement(self._paddle1[1], paddleSpeed, "paddle1")
		if self.p2_keys['ArrowUp']:
			self.check_paddle_movement(self._paddle2[1], -1 * paddleSpeed, "paddle2")
		elif self.p2_keys['ArrowDown']:
			self.check_paddle_movement(self._paddle2[1], paddleSpeed, "paddle2")

	def check_paddle_movement(self, pos, move, player):
		#check if paddle reach the border of the board
		if (pos + move) >= 0 and pos + move + self.game_const.paddle.height <= self.game_const.board.y:
			if player == "paddle1":
				self._paddle1[1] += move
			else:
				self._paddle2[1] += move
	
	def move_ball(self):
		self._ball[0] += (self._vector[0] * self._speed)
		self._ball[1] += (self._vector[1] * self._speed)
		self.check_collision()

	def check_collision(self):
		# check for wall colision up/down
		Const = self.game_const
		if self._ball[1] + Const.ballRadius > Const.board.y \
			or self._ball[1] - Const.ballRadius < 0:
			self.colideWall()
		#check for paddle colision left/right, i.e. also for score
		elif self._ball[0] + Const.ballRadius > Const.board.x - Const.paddle.width\
			or self._ball[0] - Const.ballRadius < Const.paddle.width:
			if not self.colidePaddle(self._paddle1 if self._vector[0] <= 0 else self._paddle2):
				if self.OutOfBound():
					self.scoreAndResetBall()
 
	def colideWall(self):
		# change position of ball based on collision point and distance
		self._vector[1] *= -1
 
	def colidePaddle(self, paddle):
		paddleHeight = self.game_const.paddle.height
		paddleCenter = paddle[1] + paddleHeight / 2
		hitPosition = self._ball[1] - paddleCenter
		if abs(hitPosition) > paddleHeight / 2:
			return False
		maxBounceAngle = pi / 4 # 45 degrees
		bounceAngle = (hitPosition / (paddleHeight / 2)) * maxBounceAngle
		
		speed = sqrt(self._vector[0] ** 2 + self._vector[1] ** 2)
		self._vector[0] = speed * cos(bounceAngle)
		self._vector[1] = speed * sin(bounceAngle)
		self.increaseSpeed(paddle)
		if paddle[0] == self._paddle1[0]:
			self._vector[0] = abs(self._vector[0])
		else:
			self._vector[0] = -abs(self._vector[0])
		return True

	def OutOfBound(self):
		boardWidth = self.game_const.board.x
		if self._ball[0] <= 0 or self._ball[0] >= boardWidth :
			return True
		return False
		
	def increaseSpeed(self, paddle):
		#When player moves the paddle at the same time the ball touch it, speed is increased
		# Only decreased back to init when scored but can be changed into decreased when paddle does not moves at same time
		if (paddle[0] == self._paddle1[0] and (self.p1_keys["ArrowDown"] or self.p1_keys["ArrowUp"])) \
			or (paddle[0] == self._paddle2[0] and (self.p2_keys["ArrowDown"] or self.p2_keys["ArrowUp"])):
			if self._speed < self.game_const.initSpeed * 3: 
				self._speed *= 1.1

	def scoreAndResetBall(self):
		const = self.game_const
		if self._ball[0] <= 0: #score to p2
			self._score[1] += 1
		else: # score to p1
			self._score[0] += 1
		
		self._ball = [const.board.x / 2, const.board.y / 2]
		"""need to think about the pause/delay state in between the score and the service"""
		self._speed = const.initSpeed
		self._vector[0] *= -1  #send the service to the opposite way with the same impulse as before score (maybe rand val or fix val)

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
		self.pong = Pong(self._players[0].keys, self._players[1].keys, self.end())
		self._id = uuid.uuid4().hex
		for p in self._players:
			await self._channel_layer.group_add(self._id, p.channel_name)
			p.game = self
		await self._channel_layer.group_send(self._id,
			{
				'type': 'msg',
				'event': 'Game',
				'players': [p.username for p in self._players],
				'gameConst': self.pong.get_gameConst()
			})
		await self._channel_layer.group_send(self._id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_gameConst()})
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
				self.keys[data['key']] = dic[data['type']]
			case 'quit':
				await self.game.end(self) if self.game else self.manager.rmv(self)
				self.left = True
			case _:
				pass

	async def disconnect(self, close_code=None):
		pass
