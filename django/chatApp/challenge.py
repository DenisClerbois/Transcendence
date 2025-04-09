from gameStatsApp.views import save_game

from matchmakingApp.game import Game
from matchmakingApp.users import Users

import asyncio
from asgiref.sync import sync_to_async

from channels.layers import get_channel_layer # type: ignore
from dataclasses import dataclass, field

@dataclass
class Data:
	room_group_name: str
	challenger_id: str
	opponent_id: str


class Challenge():

	_queue = {}
	_channel_layer = get_channel_layer()

	@classmethod
	async def send_message(cls, data: Data, consumer_function: str):
		await cls._channel_layer.group_send(
			data.room_group_name,
			{
				"type": consumer_function,
				"challenger_id": data.challenger_id,
				"opponent_id": data.opponent_id,
			})

	@classmethod
	def get(cls, challenger_id: str):
		return cls._queue.get(challenger_id, None)

	@classmethod
	async def append(cls, data: Data):
		if data.challenger_id not in cls._queue:
			cls._queue[data.challenger_id] = data.opponent_id
			await cls.send_message(data, "joinFight")

	@classmethod
	async def cancel(cls, data: Data):
		if data.challenger_id in cls._queue:
			del cls._queue[data.challenger_id]
			await cls.send_message(data, "quitFight")

	
	@classmethod
	async def decline(cls, data: Data):
		if data.challenger_id in cls._queue:
			del cls._queue[data.challenger_id]
			await cls.send_message(data, "declineFight")
	
	@classmethod
	async def accept(cls, data: Data):
		if data.challenger_id in cls._queue:
			del cls._queue[data.challenger_id]
			# asyncio.create_task(cls._start([key, opponent_id]))
	
	# @classmethod
	# async def _start(cls, users_id: list):
	# 	game = Game(users_id)
	# 	await game.start()
	# 	await sync_to_async(save_game, thread_sensitive=True)(game.pong.get_result())
	# 	await cls._channel_layer.group_send(game.game_id, {"type": "end_message", "event": "end", "result": game.pong.get_result()})
	# 	for user_id in users_id:
	# 		user = Users.get(user_id)
	# 		if user:
	# 			await cls._channel_layer.group_discard(user.channel_group_name[0], user.channel_name)
	# 			Users.remove(user_id)