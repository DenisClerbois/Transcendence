from django.urls import re_path
from .consumers import MultiplayerConsumer
from .consumers import WaitingRoomQueue

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<room_name>\w+)/$', MultiplayerConsumer.as_asgi()),
	re_path(r'ws/waiting_room/(?P<waiting_room>\w+)/$', WaitingRoomQueue.as_asgi()),

]