from dataclasses import dataclass, asdict
from math import sqrt, cos, sin, pi

import asyncio


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
FPS30 = 1 / 60
NB_PLAYER = 4

class Pong:
	def __init__(self, p1_keys, p2_keys, end_Function, players):
		self.game_const = GameData(
			board=Board(x=1000, y=500),
			paddle=Paddle(width=12, height=100, speed=0),
			ballRadius=10,
			initSpeed=5,
		)
		self._vector = [1 / sqrt(2), 1 / sqrt(2)]
		self._speed = 300 * FPS30
		self._score = [0, 0]
		self._ball = [self.game_const.board.x / 2, self.game_const.board.y / 2]
		self.p1_keys = p1_keys #what are those???
		self.p2_keys = p2_keys
		self._paddle1 = [1, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]
		self._paddle2 = [self.game_const.board.x - self.game_const.paddle.width, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]
		self._players = players

		self.game_const.initSpeed = self._speed
		self.game_const.paddle.speed = sqrt(self._vector[0] ** 2 + self._vector[1] ** 2) * self._speed * 1.4
		self.endF = end_Function 

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
		self.checkEndGame()

	async def checkEndGame(self):
		if abs(self._score[0] - self._score[1]) > 1:
			if self._score[0] >= 3:
				asyncio.create_task(self.endF(self._players[1]))
			elif self._score[1] >= 3:
				asyncio.create_task(self.endF(self._players[0]))