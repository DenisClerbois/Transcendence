from django.urls import re_path
from .consumers import WaitingRoomQueue

websocket_urlpatterns = [
	re_path(r'ws/home/$', WaitingRoomQueue.as_asgi()),

]