from django.urls import path
from . import views

urlpatterns = [
	path("login/", views.log, name="log"),
	path("log_out/", views.log_out, name="log_out"),
	path("register/", views.register, name="register"),
	path("profile/", views.getProfile, name="profile"),
	path("profileUpdate/", views.profileUpdate, name="profileUpdate"),
	# path("getProfilePicPath/", views.getProfilePicPath, name="getProfilePicPath"),
	path("auth/", views.auth, name="auth"),
]