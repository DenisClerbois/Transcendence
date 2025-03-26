import asyncio, uuid
from matchmakingApp.pong import Pong, FPS
from channels.layers import get_channel_layer # type: ignore

class Game:
	
	channel_layer = get_channel_layer()

	def __init__(self, game_users: dict):
		self.users = game_users
		self.nb_player = len(game_users)
		self.game_id = uuid.uuid4().hex
		self.is_running = True
		self.pong = None

	async def countdown(self):
		await asyncio.sleep(1)
		for i in range(3, 0, -1):
			await Game.channel_layer.group_send(self.game_id, {'type': 'msg', 'event': 'countdown', 'time': i})
			await asyncio.sleep(1)
		await Game.channel_layer.group_send(self.game_id, {'type': 'msg', 'event': 'start'})


	async def set_pong(self):
		nicknames = []
		pong_inputs = []
		users_ids = []
		for user_id, user in self.users.items():
			nicknames.append(user.nickname)
			pong_inputs.append(user.inputs)
			users_ids.append(user_id)
			await Game.channel_layer.group_add(self.game_id, user.channel_name)
		self.pong = Pong(pong_inputs, self.stop, 2, users_ids)

	def set_users(self):
		constant = self.pong.get_game_constant()
		for user in self.users.values():
			user.game_constant = constant
			user.in_game = True
			user.channel_group_name.append(self.game_id)
			user.game_stop_function = self.give_up

	async def start(self):
		await self.set_pong()
		self.set_users()
		await Game.channel_layer.group_send(self.game_id,
			{
				'type': 'msg',
				'event': 'game',
				'constant': self.pong.get_game_constant()
			})
		await self.countdown()
		await self._run()
		# await self.channel_layer.group_send(self.game_id, {"type": "end_message", "event": "end", "result": self.pong.get_result()})

	async def _run(self):
		while self.is_running and self.nb_player > 1:
			self.pong.update()
			await Game.channel_layer.group_send(self.game_id, {'type': 'msg', 'event':'data', 'pong': self.pong.get_game_data()})
			await asyncio.sleep(FPS)
	
	async def give_up(self, looser_id):
		if self.pong:
			self.pong.set_looser(looser_id)
		self.nb_player -= 1

	def stop(self):
		self.is_running = False
		# for user in self.users.values():
		# 	await Game.channel_layer.group_discard(self.game_id, user.channel_name)
		# return (looser_id)

	




# import asyncio, uuid
# from matchmakingApp.pong import Pong, FPS
# from .users import Connections
# from channels.layers import get_channel_layer # type: ignore

# class Game:

# 	def __init__(self, ids: list[str], users_infos: list[dict]):
# 		self.users_ids = ids
# 		self.users_info = users_infos
# 		self._id = uuid.uuid4().hex
# 		self.is_running = True
# 		self.channel_layer = get_channel_layer()
# 		self.pong = None
# 		self.winner = None
# 		self.looser = None

# 	async def countdown(self):
# 		await asyncio.sleep(1)
# 		for i in range(3, 0, -1):
# 			await self.channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Countdown'})
# 			await asyncio.sleep(1)
# 		await self.channel_layer.group_send(self._id, {'type': 'msg', 'event': 'Go'})

# 	async def start(self):
# 		players_keys = [info.keys for info in self.users_info]
# 		self.pong = Pong(self.stop, players_keys, 2, self.users_ids)
# 		print(self.pong)
# 		print('PONG IS THERE')
# 		for user_id in self.users_ids:
# 			Connections.add_to_game(user_id, self)
# 		nicknames = []
# 		for user in self.users_info:
# 			nicknames.append(user.nickname)
# 			await self.channel_layer.group_add(user.channel_name)
# 		await self.channel_layer.group_send(self._id,
# 			{
# 				'type': 'msg',
# 				'event': 'Game',
# 				'nicknames': nicknames,
# 				'constant': self.pong.get_game_constant()
# 			})
# 		await self.countdown()
# 		self._run()

# 	async def _run(self):
# 		while self.is_running:
# 			self.pong.update()
# 			await self.channel_layer.group_send(self.id, {'type': 'msg', 'event':'Data', 'pong': self.pong.get_game_data()})
# 			await asyncio.sleep(FPS)

# 	async def stop(self, looser_id):
# 		self.is_running = False
# 		for user_id in self.users_ids:
# 			Connections.rmv_from_game(user_id)
# 		for user in self.users_info:
# 			await self.rmv_user_from_group(user.channel_name)
# 		self.looser = looser_id
# 		self.users_ids.remove(looser_id)
# 		self.winner = self.users_ids.pop()
	
# 	async def add_user_from_group(self, channel_name):
# 		await self.channel_layer.group_add(self._id, channel_name)
# 	async def rmv_user_from_group(self, channel_name):
# 		await self.channel_layer.group_discard(self._id, channel_name)