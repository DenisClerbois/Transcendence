from django.urls import path
from . import views

urlpatterns = [
    path("invite/<int:targetUserId>/", views.invite, name='invite'),
    path("accept/<int:requestId>/", views.accept, name='accept'),
    path("reject/<int:requestId>/", views.reject, name='reject'),
    path("remove/<int:targetUserId>/", views.remove, name='remove'),
    path("getOnlinePlayers/", views.getOnlinePlayers, name='getOnlinePlayers'),
    path("getFriends/", views.getFriends, name='getFriends'),
    path("inFriendRequests/", views.inFriendRequests, name='inFriendRequests'),
]