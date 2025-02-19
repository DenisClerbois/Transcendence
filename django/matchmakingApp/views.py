from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from matchmakingApp.models import Lobby, Player

@api_view(["GET"])
def get_lobby_data(request):
    """Returns current players in the lobby, creating one if necessary."""
    lobby, _ = Lobby.objects.get_or_create(name="lobby_room", defaults={"max_players": 2})
    players = [{"username": p.user.username, "ready": p.ready} for p in lobby.players.all()]
    return Response({"players": players, "ready_count": sum(p["ready"] for p in players)})
 