from django.urls import re_path

from .consumers import ChatConsumer

# websocket_urlpatterns = [
# 	re_path(r'ws/chat/(?P<chat_name>\w+)/$', ChatConsumer.as_asgi()),
# ]

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<receiver_id>\d+)/$', ChatConsumer.as_asgi()),
]

