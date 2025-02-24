from django.urls import re_path
from .consumers import MultiplayerConsumer

websocket_urlpatterns = [
    re_path(r'ws/pong/room_name/(?P<room_name>\w+)/$', MultiplayerConsumer.as_asgi()),
]
