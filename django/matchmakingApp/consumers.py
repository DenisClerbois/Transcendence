from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from dataclasses import dataclass
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

class GameLoopConsumer:
	def __init__(self, game_id, channel_layer, p1, p2):
		self.game_id = game_id
		self.channel_layer = channel_layer
		self.frameTime = 0.1
		self.game_const = GameData(
			board=Board(x=1000, y=500),
			paddle=Paddle(width=12, height=100, speed=0),
			ballRadius=10,
			initSpeed=0,
		)
		self.game_state = {
			'ball': [self.game_const.board.x / 2, self.game_const.board.y / 2],
			'vector': [sqrt(0.5), sqrt(0.5)],
			'score': [0, 0],
			'speed': 5 * self.frameTime,
			'paddle1': [self.game_const.board.y / 2 - self.game_const.paddle.height],
			'paddle2': [self.game_const.board.y - self.game_const.paddle.width, self.game_const.board.y / 2 - self.game_const.paddle.height / 2],
			p1: {'ArrowDown': False, 'ArrowUp': False},
			p2: {'ArrowDown': False, 'ArrowUp': False},
		}
		
		self.players = [p1, p2]
		self.game_const.initSpeed = self.game_state['speed']
		self.game_const.paddle.speed = sqrt(self.game_state['vector'][0] ** 2 + self.game_state['vector'][1] ** 2) * self.game_const.initSpeed * 1.4
		self.is_running = True
	
	def start_game_loop(self):
		self.game_loop_task = asyncio.create_task(self.game_loop())

	async def game_loop(self):
		while self.is_running:
			await self.channel_layer.group_send(
				self.game_id,
				{
					'type': 'message',
					'message': self.game_state,
				}
			)
			await asyncio.sleep(self.frameTime)
	
	def stop_game_loop(self):
		self.is_running = False
	def move_paddles(self):
		if self.game_state[self.player[0]]['ArrowUp']:
			self.check_paddle_movement(self.game_state["paddle1"][1], -1 * self.game_const.paddle.speed, "paddle1")
		elif self.game_state[self.player[0]]['ArrowDown']:
			self.check_paddle_movement(self.game_state["paddle1"][1], self.game_const.paddle.speed, "paddle1")
		if self.game_state[self.player[1]]['ArrowUp']:
			self.check_paddle_movement(self.game_state["paddle2"][1], -1 * self.game_const.paddle.speed, "paddle2")
		elif self.game_state[self.player[1]]['ArrowDown']:
			self.check_paddle_movement(self.game_state["paddle2"][1], self.game_const.paddle.speed, "paddle2")

	def check_paddle_movement(self, pos, move, player):
		#check if paddle reach the border of the board
		if (pos + move) >= 0 and pos + move - self.game_const.paddle.height <= self.game_const.board.y:
			self.game_state[player][1] += move
	
	def move_ball(self):
		self.game_state["ball"][0] += (self.game_state["vector"][0] * self.game_state["speed"])
		self.game_state["ball"][1] += (self.game_state["vector"][1] * self.game_state["speed"])
		self.check_collision()

	def check_collision(self):
		# check for wall colision up/down
		if self.game_state["ball"][1] + self.game_const.ballRadius > self.game_const.board.y \
			or self.game_state["ball"][1] - self.game_const.ballRadius < 0:
			self.colideWall()
		#check for paddle colision left/right, i.e. also for score
		elif self.game_state["ball"][0] + self.game_const.ballRadius > self.game_const.board.x - self.game_const.paddle.width\
			or self.game_state["ball"][0] - self.game_const.ballRadius < self.game_const.paddle.width:
			if not self.colidePaddle() and self.OutOfBound():
				self.scoreAndResetBall()

	def colideWall(self, limit, dir, pos):
		# change position of ball based on collision point and distance
		# tmp = pos + dir
		# dif = limit - tmp
		# pos = limit + dif
		# self.game_state["ball"][1] = pos
		self.game_state['vector'][1] *= -1

	def colidePaddle(self, paddle):
		paddleCenter = self.game_state[paddle][1] + self.game_const.paddle.height / 2
		hitPosition = self.game_state["ball"][1] - paddleCenter
		if abs(hitPosition) > self.game_const.paddle.height / 2:
			return False
		maxBounceAngle = pi / 4 # 45 degrees
		bounceAngle = (hitPosition / (self.game_const.paddle.height / 2)) * maxBounceAngle
		
		speed = sqrt(self.game_state["vector"][0] ** 2 + self.game_state["vector"][1] ** 2)
		self.game_state["vector"][0] = speed * cos(bounceAngle)
		self.game_state["vector"][1] = speed * sin(bounceAngle)
		self.increaseSpeed()
		return True

	def OutOfBound(self):
		if self.game_state["ball"][0] <= 0 or self.game_state["ball"][0] >= self.game_const.board.x:
			return True
		return False
		
	def increaseSpeed(self, paddle):
		#When player moves the paddle at the same time the ball touch it, speed is increased
		# Only decreased back to init when scored but can be changed into decreased when paddle does not moves at same time
		if (paddle == "paddle1" and (self.game_state[self.players[0]]["ArrowDown"] or self.game_state[self.players[0]]["ArrowUp"])) \
			or (paddle == "paddle2" and (self.game_state[self.players[1]]["ArrowDown"] or self.game_state[self.players[1]]["ArrowUp"])):
			if self.game_state["speed"] < 20: 
				self.game_state["speed"] *= 1.1

	def scoreAndResetBall(self):
		if self.game_state["ball"][0] <= 0: #score to p2
			self.game_state["score"][1] += 1
		else: # score to p1
			self.game_state["score"][0] += 1
		
		self.game_state["ball"] = [self.game_const.board.x / 2, self.game_const.board.y / 2]
		"""need to think about the pause/delay state in between the score and the service"""
		self.game_state["speed"] = self.game_const.initSpeed
		self.game_state["vector"][0] *= -1  #send the service to the opposite way with the same impulse as before score (maybe rand val or fix val)

active_game_loops = {}


class matchmakingConsumer(AsyncWebsocketConsumer):

	queue = []

	async def connect(self):
		await self.accept()
		if self in self.queue:
			return self.close()
		self.username = self.scope['user'].username
		if len(self.queue):
			await self.match()
		else:
			self.queue.append(self)

	async def message(self, event):
		await self.send(text_data=json.dumps({'event': event}))

	async def giveup(self, event):
		await self.send(text_data=json.dumps({'giveup': event['username']}))
		await self.close()

	async def roomID(self, event):
		self.room_name = event['room']
		await self.send(text_data=json.dumps({'gameFound': True}))

	async def match(self):
		user = self.queue.pop(0)
		room_name = f"match_{user.username}_{self.username}"

		await user.channel_layer.group_add(room_name, user.channel_name)
		await self.channel_layer.group_add(room_name, self.channel_name)
		
		await self.channel_layer.group_send( 
			room_name,
			{
				"type": "roomID",
				"room": room_name, 
			}
		)
		game_loop_consumer = GameLoopConsumer(
			game_id=room_name,
			channel_layer=self.channel_layer,
			p1=user.username,
			p2=self.username,
		)
		active_game_loops[room_name] = game_loop_consumer
		game_loop_consumer.start_game_loop()
	
	async def receive(self, text_data):
		dic = {'keydown': True, 'keyup': False}
		data = json.loads(text_data)
		gameState = active_game_loops[self.room_name].game_state
		gameState[self.username][data['key']] = dic[data['type']]

	async def disconnect(self, close_code):
		if self in self.queue:
			self.queue.remove(self)
		else:
			await self.channel_layer.group_send(
				self.room_name,
				{
					"type": "giveup",
					'username': self.username, 
				}
			)
			await self.channel_layer.group_discard(self.room_name, self.channel_name)
			
			if self.room_name in active_game_loops:
				active_game_loops[self.room_name].stop_game_loop()
				del active_game_loops[self.room_name]
