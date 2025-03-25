

from dataclasses import dataclass
import asyncio

@dataclass
class User:
		id: str
		name: str
		channel_name: str
		score: list = None
		timeout_task: asyncio.Task = None
		game_id: str = None
		opponent: str = None
		event: asyncio.Event = None

class Connections:
	def __init__(self):
		self._active_connections = {}
	
	def get_user(self, id):
		return self._active_connections.get(id, None)

	def set_user(self, id, name, channel_name):
		if id and id not in self._active_connections and name and channel_name:
			self._active_connections[id] = User(
				id=id,
				name=name,
				channel_name=channel_name
			)
	
	def remove_user(self, id):
		if id in self._active_connections:
			user = self._active_connections[id]
			timeout_task = user.timeout_task
			if timeout_task and not timeout_task.cancelled():
				user.event.set()
			del self._active_connections[id]

	async def _time_out(self, id):
		user = self._active_connections[id]
		time = 10
		while time:
			if user.event and user.event.is_set():
				return user.event.clear()
			time -= 1
			await asyncio.sleep(1)
		self.remove_user(id)

	def deconnected(self, id):
		if id in self._active_connections:
			user = self._active_connections[id]
			user.event = asyncio.Event()
			user.timeout_task = asyncio.create_task(self._time_out(id))

	def reconnected(self, id, name, channel_name):
		if id in self._active_connections:
			user = self._active_connections[id]
			if user.timeout_task and not user.timeout_task.cancelled():
				user.event.set()
				user.id = id
				user.name = name
				user.channel_name = channel_name