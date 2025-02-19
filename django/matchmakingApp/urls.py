from django.urls import path
from matchmakingApp.views import get_lobby_data

urlpatterns = [
    path("api/lobby/", get_lobby_data, name="lobby_data"),
]