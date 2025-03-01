from django.urls import path
from . import views

urlpatterns = [
	path("login/", views.log, name="log"),
	path("logout/", views.logout, name="logout"),
	path("register/", views.register, name="register"),
	path("profile/", views.getProfile, name="profile"),
	path("profileUpdate/", views.updateProfile, name="profileUpdate"),
	# path("getProfilePicPath/", views.getProfilePicPath, name="getProfilePicPath"),
	path("auth/", views.auth, name="auth"),
]