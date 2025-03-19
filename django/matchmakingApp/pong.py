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
	players: int

# GLOBALE
FPS = 1 / 60

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
		self.AI = None
		self.p_nbr = 0
		self.game_const = GameData(
			board=Board(x=1000, y=1000),
			paddle=Paddle(width=12, height=100, speed=0),
			ballRadius=10,
			initSpeed=5,
			players=players_nb,
		)
		if players_nb < 4:
			self.game_const.board.y = 500
		self._vector = [1, 0.49]
		self._speed = 400 * FPS
		self._score = [0, 0, 0, 0]
		self._ball = [self.game_const.board.x / 2, self.game_const.board.y / 2]
		self._prevBall = self._ball
		self.p_keys = players_keys
		if players_nb == 1:
			self.p_nbr = 2
			self.game_const.players = 2
			self.p_keys.append({'ArrowUp': False, 'ArrowDown': False})
			self.AI = PongAI(self, self.p_keys[1])
		else:
			self.p_nbr = players_nb
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
		self._players = plrs
 
	def update(self):
		self.move_ball()
		if self.AI:
			self.AI.updateAI()
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
 
		for i in range(self.p_nbr):
			if i == 1 and self.AI and self.AI.AIPos >= self._paddle["p2"][1] + 10 and self.AI.AIPos <= self._paddle["p2"][1] + self.game_const.paddle.height - 10 and self._vector[0] > 0:
				continue
				# self.p_keys[1] = {'ArrowUp': False, 'ArrowDown': False}
			elif self.p_keys[i]['ArrowUp']:
				self.check_paddle_movement(self._paddle["p" + str(i + 1)][i < 2], -1 * paddleSpeed, "p" + str(i + 1))
			elif self.p_keys[i]['ArrowDown']:
				self.check_paddle_movement(self._paddle["p" + str(i + 1)][i < 2], paddleSpeed, "p" + str(i + 1))		

	def check_paddle_movement(self, pos, move, player):
		#check if paddle reach the border of the board
		if player == "p1" or player == "p2":
			if (pos + move) >= 0 and pos + move + self.game_const.paddle.height <= self.game_const.board.y:
				self._paddle[player][1] += move
			elif (pos + move) < 0:
				self._paddle[player][1] = 0
			else:
				self._paddle[player][1] = self.game_const.board.y - self.game_const.paddle.height
		else:
			if (pos + move) >= 0 and pos + move + self.game_const.paddle.height <= self.game_const.board.x:
				self._paddle[player][0] += move
			elif (pos + move) < 0:
				self._paddle[player][0] = 0
			else:
				self._paddle[player][0] = self.game_const.board.x - self.game_const.paddle.height
   
	def move_ball(self):
		self._prevBall = self._ball
		self._ball[0] += (self._vector[0] * self._speed)
		self._ball[1] += (self._vector[1] * self._speed)
		self.check_collision()
  
	def check_collision(self):
		# check for wall colision up/down
		Const = self.game_const
		if self.p_nbr < 4 and (self._ball[1] + Const.ballRadius > Const.board.y \
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
		if self._ball[1] < 0 or self._ball[1] > self.game_const.board.y:
			lim = 0
			if self._ball[1] > self.game_const.board.y:
				lim = self.game_const.board.y
			dif = lim - self._ball[1]
			self._ball[1] = lim + dif
		self._vector[1] *= -1
    
	def colidePaddle(self, pp):
		paddleHeight = self.game_const.paddle.height
		gConst = self.game_const
		if pp == "p1" or pp == "p2":
			paddleCenter = self._paddle[pp][1] + paddleHeight / 2
			hitPosition = self._ball[1] - paddleCenter
		else:
			paddleCenter = self._paddle[pp][0] + paddleHeight / 2
			hitPosition = self._ball[0] - paddleCenter
		if abs(hitPosition) > paddleHeight / 2:
			return False
		# if (pp == "p1" or "p2") and (self._ball[0] < gConst.paddle.width - 1 and self._prevBall[0] < gConst.paddle.width 
		# 	or self._ball[0] < gConst.board.x - gConst.paddle.width - 1 and self._prevBall[0] > gConst.board.x + gConst.paddle.width):
		# 	print("DID NOT COLIDE", pp, self._paddle[pp])
		# 	return False
		# elif (pp == "p3" or "p4") and (self._ball[1] < gConst.paddle.width - 1 and self._prevBall[1] < gConst.paddle.width 
		# 	or self._ball[1] < gConst.board.y - gConst.paddle.width - 1 and self._prevBall[1] > gConst.board.x + gConst.paddle.width):
		# 	print("DID NOT COLIDE")
		# 	return False
		# print("COLIDE")
		if (pp == "p1" or "p2") and (self._ball[0] < gConst.paddle.width or self._ball[0] > gConst.board.x - gConst.paddle.width):
			if self._ball[0] < gConst.paddle.width:
				self._ball[0] = gConst.paddle.width
			else:
				self._ball[0] = gConst.board.x - gConst.paddle.width
		elif (pp == "p3" or "p4") and (self._ball[1] < gConst.paddle.width or self._ball[1] > gConst.board.y - gConst.paddle.width):
			if self._ball[1] < gConst.paddle.width:
				self._ball[1] = gConst.paddle.width
			else:
				self._ball[1] = gConst.board.y - gConst.paddle.width
		maxBounceAngle = pi / 4 # 45 degrees
		bounceAngle = (hitPosition / (paddleHeight / 2)) * maxBounceAngle
 
		speed = sqrt(self._vector[0] ** 2 + self._vector[1] ** 2)
		self._vector[(pp == "p3" or pp == "p4")] = speed * cos(bounceAngle)
		self._vector[(pp == "p1" or pp == "p2")] = speed * sin(bounceAngle)
		self.increaseSpeed(pp)
		if pp == "p1":
			self._vector[0] = abs(self._vector[0])
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
		paddle = self.game_const.paddle
		if self._ball[0] <= 0 or self._ball[0] >= board.x - 0:
			return True
		if self._ball[1] <= 0 or self._ball[1] >= board.y - 0:
			return True
		return False
		
	def increaseSpeed(self, pp):
		#When player moves the paddle at the same time the ball touch it, speed is increased
		# Only decreased back to init when scored but can be changed into decreased when paddle does not moves at same time
		for i in range(self.p_nbr):
			if pp == "p" + str(i+1):
				if self.p_keys[i]['ArrowUp'] or self.p_keys[i]['ArrowDown'] or 1:
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
import time

class PongAI:
	def __init__(self, pong, AIKey):
		self._pong = pong
		self._key = AIKey
		self.lastUpdate = int(time.time() * 1000)
		self.gameConst = pong.game_const
		self.AIPos = 0
	
	def updateAI(self):
		now = int(time.time() * 1000)
		if now - self.lastUpdate < 1000:
			return
		self.lastUpdate = now
		self.calculateNextPos()
 
	def calculateNextPos(self):
		ball = self._pong._ball.copy()
		vector = self._pong._vector.copy()
		vector[0] *= self._pong._speed
		vector[1] *= self._pong._speed
		paddle = self._pong._paddle["p2"].copy()
		if self.malusCondition(ball, vector):
			ball = self.simplePath(ball)
		else:
			ball = self.calculatedPath(ball, vector)
			self.AIPos = ball[1]
			if ball[1] < paddle[1] + 10:
				self._key['ArrowUp'] = True
				self._key['ArrowDown'] = False 
			elif ball[1] > paddle[1] + self.gameConst.paddle.height - 10:
				self._key['ArrowUp'] = False
				self._key['ArrowDown'] = True
			else:
				self._key['ArrowUp'] = False
				self._key['ArrowDown'] = False
  
	def simplePath(self, ball):
		ball[1] = self._pong._ball[1]
		return ball
	def calculatedPath(self, ball, vector):
		const = self.gameConst
		while vector[0] > 0 and ball[0] > const.paddle.width and ball[0] < const.board.x - const.paddle.width:
			if ball[0] + vector[0] > const.paddle.width:
				ball[0] += vector[0]
			else:
				ball[0] = self.adjustPos(ball[0], vector[0], const.paddle.width)
				vector[0] *= -1
			if ball[1] + vector[1] < 0 and ball[1] + vector[1] < const.board.y:
				# if ball[1] + vector[1] < 0:
				# 	ball[1] = self.adjustPos(ball[1], vector[1], 0)
				# else:
				# 	ball[1] = self.adjustPos(ball[1], vector[1], const.board.y)
				vector[1] *= -1
			else:
				ball[1] += vector[1]
		return ball
 
	def adjustPos(self, ball, speed, lim):
		tmp = 0
		dif = 0

		tmp = ball + speed
		dif = lim - tmp
		ball = lim + dif
		return ball
	 
	def malusCondition(self, ball, vector):
		speedDiff = self._pong._speed // self.gameConst.initSpeed
		if (speedDiff < 2 and vector[0] > 0 and ball[0] >= self.gameConst.board.x / 2):
			return False
		elif (speedDiff < 3 and vector[0] > 0 and ball[0] >= self.gameConst.board.x / 3):
			return False
		elif (speedDiff and vector[0] > 0):
			return False
		return True
	
