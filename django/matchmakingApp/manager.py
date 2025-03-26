from .game import Game
from .users import Users
import asyncio

from channels.layers import get_channel_layer # type: ignore

class Match():

	_queue = []
	_nb_players = 2
	_channel_layer = get_channel_layer()

	@classmethod
	async def append(cls, user_id: str):
		if user_id not in cls._queue:
			cls._queue.append(user_id)
			await cls._check_start()

	@classmethod
	def rmv_from_queue(cls, user_id: str):
		if user_id in cls._queue:
			cls._queue.remove(user_id)

	@classmethod
	async def _check_start(cls):
		if len(cls._queue) >= cls._nb_players:
			players = cls._queue[:cls._nb_players]
			cls._queue = cls._queue[cls._nb_players:]
			asyncio.create_task(cls._start(players))

	@staticmethod
	def set_users(users_id):
		match_users = {}
		for id in users_id:
			user = Users.get(id)
			if user:
				match_users[id] = user
		return match_users

	@classmethod
	async def _start(cls, users_id: list):
		game = Game(cls.set_users(users_id))
		await game.start()
		await cls._channel_layer.group_send(game.game_id, {"type": "end_message", "event": "end", "result": game.pong.get_result()})
		for user_id in users_id:
			user = Users.get(user_id)
			if user:
				await cls._channel_layer.group_discard(user.channel_group_name[0], user.channel_name)
				Users.remove(user_id)


class Tournament(Match):

	_queue = []
	_nb_players = 4
	@classmethod
	async def _round_manager(cls, round_ids: list):
		results = []
		async with asyncio.TaskGroup() as asyncGameGroup:
			for i in range(0, len(round_ids), 2):
				asyncGameGroup.create_task(cls._play_match(round_ids[i:i+2], results))
		return results


	@classmethod
	async def _play_match(cls, players: list, results: list):
		game = Game(cls.set_users(players))
		await game.start()
		winners = game.pong.get_winners()
		results.extend(winners)
		user = Users.get(winners[0])
		if user:
			await cls._channel_layer.send(user.channel_name, {
				"type": "msg",
				"event": "temporary_end",
				"result": "You passed the round.",
			})
		loosers = game.pong.get_loosers()[0]
		user = Users.get(loosers)
		if user:
			await cls._channel_layer.send(user.channel_name, {
				"type": "end_message",
				"event": "end",
				"result": game.pong.get_result(),
			})
			await cls._channel_layer.group_discard(user.channel_group_name[0], user.channel_name)
			Users.remove(loosers)

	@classmethod
	async def _start(cls, tournament_ids: list):
		while len(tournament_ids) > 1:
			tournament_ids = await cls._round_manager(tournament_ids)
		print('TOURNAMENT END')
		winner = tournament_ids.pop()
		user = Users.get(winner)
		if user:
			await cls._channel_layer.send(user.channel_name, {
				"type": "end_message",
				"event": "end",
				"result": "YOU WON THE TOURNAMENT !",
			})
			Users.remove(winner)



class Multiplayer(Match):

	_queue = []
	_nb_players = 4

class MatchVsIA(Match):

	_queue = []
	_nb_players = 1