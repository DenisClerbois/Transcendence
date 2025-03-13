import asyncio
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
	# players: int

# GLOBALE
FPS30 = 1 / 60
NB_PLAYER = 4

# __________________
#|        P3        |
#|                  |
#|                  |
#|P1              P2|
#|                  |
#|                  |
#|________P4________|
  
class Pong:
	def __init__(self, players_keys, end_Function, players_nb, plrs):
		self.game_const = GameData(
			board=Board(x=1000, y=1000),
			paddle=Paddle(width=12, height=100, speed=0),
			ballRadius=10,
			initSpeed=5,
			# players=plrs,
		) 
		self._vector = [1 / sqrt(2), 1 / sqrt(2)]
		self._speed = 300 * FPS30
		self._score = [0, 0, 0, 0]
		self._ball = [self.game_const.board.x / 2, self.game_const.board.y / 2]
		self.p_keys = players_keys
		self._paddle = {
			"p1" : [-1, -1],
			"p2" : [-1, -1],
			"p3" : [-1, -1],
			"p4" : [-1, -1],
			}
		self.launcher = 0
		self._paddle["p1"] = [1, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]
		self._paddle["p2"] = [self.game_const.board.x - self.game_const.paddle.width, self.game_const.board.y / 2 - self.game_const.paddle.height / 2]
		if players_nb > 2:
			self._paddle["p3"] = [self.game_const.board.x / 2 - self.game_const.paddle.height / 2, 1]
			self._paddle["p4"] = [self.game_const.board.x / 2 - self.game_const.paddle.height / 2, self.game_const.board.y - self.game_const.paddle.width]

		self.game_const.initSpeed = self._speed
		self.game_const.paddle.speed = sqrt(self._vector[0] ** 2 + self._vector[1] ** 2) * self._speed * 1.6
		self.endF = end_Function 
		self.p_nbr = players_nb
		self._players = plrs
 
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
			'paddle': self._paddle,
			}

	def move_paddles(self):
		paddleSpeed = self.game_const.paddle.speed

		#need to check if for horizontal paddle is ArrowUp/Down or ArrowLeft/Right
		for i in range(self.p_nbr):
			if self.p_keys[i]['ArrowUp']:
				self.check_paddle_movement(self._paddle["p" + str(i + 1)][i < 2], -1 * paddleSpeed, "p" + str(i + 1))
			elif self.p_keys[i]['ArrowDown']:
				self.check_paddle_movement(self._paddle["p" + str(i + 1)][i < 2], paddleSpeed, "p" + str(i + 1))		
 
	def check_paddle_movement(self, pos, move, player):
		#check if paddle reach the border of the board
		if player == "p1" or player == "p2":
			if (pos + move) >= 0 and pos + move + self.game_const.paddle.height <= self.game_const.board.y:
				self._paddle[player][1] += move
		else:
			if (pos + move) >= 0 and pos + move + self.game_const.paddle.height <= self.game_const.board.x:
				self._paddle[player][0] += move

	def move_ball(self):
		self._ball[0] += (self._vector[0] * self._speed)
		self._ball[1] += (self._vector[1] * self._speed)
		self.check_collision()
 
	def check_collision(self):
		# check for wall colision up/down
		Const = self.game_const
		if self.p_nbr == 2 and (self._ball[1] + Const.ballRadius > Const.board.y \
			or self._ball[1] - Const.ballRadius < 0):
			self.colideWall()
		#check for paddle colision up/down
		elif self.p_nbr == 4 and (self._ball[1] + Const.ballRadius > Const.board.y - Const.paddle.width\
			or self._ball[1] - Const.ballRadius < Const.paddle.width):
			if not self.colidePaddle("p3" if self._vector[1] <= 0 else "p4"):
				if self.OutOfBound():
					self.scoreAndResetBall()
		#check for paddle colision left/right, and also for score
		if self._ball[0] + Const.ballRadius > Const.board.x - Const.paddle.width\
			or self._ball[0] - Const.ballRadius < Const.paddle.width:
			if not self.colidePaddle("p1" if self._vector[0] <= 0 else "p2"):
				if self.OutOfBound():
					self.scoreAndResetBall()
		 			
	def colideWall(self):
		# change position of ball based on collision point and distance
		self._vector[1] *= -1
   
	def colidePaddle(self, pp):
		paddleHeight = self.game_const.paddle.height
		if pp == "p1" or pp == "p2":
			paddleCenter = self._paddle[pp][1] + paddleHeight / 2
			hitPosition = self._ball[1] - paddleCenter
		else:
			paddleCenter = self._paddle[pp][0] + paddleHeight / 2
			hitPosition = self._ball[0] - paddleCenter
		if abs(hitPosition) > paddleHeight / 2:
			return False
		maxBounceAngle = pi / 4 # 45 degrees
		bounceAngle = (hitPosition / (paddleHeight / 2)) * maxBounceAngle
	  
		speed = sqrt(self._vector[0] ** 2 + self._vector[1] ** 2)
		self._vector[(pp == "p3" or pp == "p4")] = speed * cos(bounceAngle)
		self._vector[(pp == "p1" or pp == "p2")] = speed * sin(bounceAngle)
		self.increaseSpeed(pp)
		if pp == "p1":
			self._vector[0] = abs(self._vector[0])
			print("Launch modified")
			self.launcher = 0
		elif pp == "p2":
			self._vector[0] = -abs(self._vector[0])
			self.launcher = 1
		elif pp == "p3":
			self._vector[1] = abs(self._vector[1])
			self.launcher = 2
		elif pp == "p4":
			self._vector[1] = -abs(self._vector[1])
			self.launcher = 3
		return True 
 
	def OutOfBound(self):
		board = self.game_const.board
		board = self.game_const.board
		if self._ball[0] <= 0 or self._ball[0] >= board.x:
			return True
		if self._ball[1] <= 0 or self._ball[1] >= board.y:
			return True
		return False
		
	def increaseSpeed(self, pp):
		#When player moves the paddle at the same time the ball touch it, speed is increased
		# Only decreased back to init when scored but can be changed into decreased when paddle does not moves at same time
		for i in range(self.p_nbr):
			if pp == "p" + str(i+1):
				if self.p_keys[i]['ArrowUp'] or self.p_keys[i]['ArrowDown']:
					if self._speed < self.game_const.initSpeed * 3: 
						self._speed *= 1.1
  
	# with the implementation of a 4 player game instead of watching where the ball ended to score, it watches who send it and set the looser as the new sender
	def scoreAndResetBall(self):
		const = self.game_const
		self._score[self.launcher] += 1
		"""need to think about the pause/delay state in between the score and the service"""
		self._speed = const.initSpeed
		if (self._ball[0] <= 0 or self._ball[0] >= const.board.x):
			self._vector[0] *= -1  #send the service to the opposite way with the same impulse as before score (maybe rand val or fix val)
			if self._ball[0] <= 0:
				self.launcher = 0
			else:
				self.launcher = 1
		elif (self._ball[1] <= 0 or self._ball[1] >= const.board.y):
			self._vector[1] *= -1  #send the service to the opposite way with the same impulse as before score (maybe rand val or fix val)
			if self._ball[1] <= 0:
				self.launcher = 2
			else:
				self.launcher = 3
		self._ball = [const.board.x / 2, const.board.y / 2]
		self.checkEndGame()
 
	def checkEndGame(self):
		scoreDiff = 0
		for i in range(self.p_nbr):
			if self._score[i] >= 11:
				for j in range(self.p_nbr):
					if i != j and abs(self._score[i] - self._score[j]) < 2:
						scoreDiff += 1
				if not scoreDiff:
					asyncio.create_task(self.endF(self._players[i]))
			scoreDiff = 0

		# if abs(self._score[0] - self._score[1]) > 0:
		# 	if self._score[0] >= 2:
		# 		asyncio.create_task(self.endF(self._players[1]))
		# 	elif self._score[1] >= 2:
		# 		asyncio.create_task(self.endF(self._players[0]))
 