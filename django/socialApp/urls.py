from django.urls import path
from . import views

urlpatterns = [
    path("invite/<int:targetUserId>/", views.invite, name='invite'),
    path("accept/<int:requestId>/", views.accept, name='accept'),
    # path("reject/", views.reject, name='reject'),
    # path("remove/", views.remove, name='remove'),
]