from django.urls import path
from . import views

urlpatterns = [
	path("api/login/", views.LoginView, name="login"),
	path("api/logout/", views.LogoutView, name="logout"),
	path("api/register/", views.RegisterView, name="register"),
	path("api/profile/", views.getProfile, name="profile"),
	path("api/profileUpdate/", views.updateProfile, name="profileUpdate"),
	path("api/checkUserAuthenticated/", views.checkUserAuthenticated, name="checkUserAuthenticated"),
]

