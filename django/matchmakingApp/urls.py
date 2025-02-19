from django.urls import path
from . import views
urlpatterns = [
    path("api/home/", views.get_lobby_data, name="lobby_data"),
]