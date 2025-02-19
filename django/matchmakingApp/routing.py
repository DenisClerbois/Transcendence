from django.urls import re_path
from .consumers import WaitingRoomQueue

websocket_urlpatterns = [
	re_path(r'ws/home/$', WaitingRoomQueue.as_asgi()),
	# re_path(r'ws/lobby/(?P<room_name>\w+)/$', WaitingRoomQueue.as_asgi()),

]