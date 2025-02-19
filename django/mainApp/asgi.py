"""
ASGI config for mainApp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Ensure Django setup is complete
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mainApp.settings')
django.setup()

from pongApp.routing import websocket_urlpatterns as pong_urlpatterns
from matchmakingApp.routing import websocket_urlpatterns as matchmaking_urlpatterns

# Combine the two URL pattern lists into one
websocket_urlpatterns = pong_urlpatterns + matchmaking_urlpatterns


application = ProtocolTypeRouter({
    # "https": get_asgi_application(),
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
