from django.urls import path
from . import views

urlpatterns = [
	path("inGame/", views.check_game_status, name="inGame"),
]