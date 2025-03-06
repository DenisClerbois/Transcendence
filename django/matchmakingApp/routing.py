# matchmakgingApp/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/matchmaking/(?P<gameType>[a-zA-Z0-9]+)/$", consumers.Consumer.as_asgi()),

    # re_path(r"ws/tournament/", consumers.Consumer.as_asgi()),
]