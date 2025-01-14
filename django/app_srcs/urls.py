from django.urls import path
from . import views

urlpatterns = [
	path("api/login/", views.LoginView, name="login"),
	path("api/logout/", views.LogoutView, name="logout"),
	path("api/checkUserAuthenticated/", views.checkUserAuthenticated, name="checkUserAuthenticated"),
]