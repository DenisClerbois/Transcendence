from django.urls import path
from . import views

urlpatterns = [
	path("login/", views.log, name="log"),
	path("log_out/", views.log_out, name="log_out"),
	path("register/", views.register, name="register"),
	path("profile/<int:userId>/", views.getProfile, name="profile"),
	path("profile/", views.getProfile, name="profile"),
	path("getProfilePic/<int:userId>/", views.get_profile_pic, name='get_profile_pic'),
	path("setProfilePic/", views.set_profile_pic, name='set_profile_pic'),
	path("profileUpdate/", views.profileUpdate, name="profileUpdate"),
	path("auth/", views.auth, name="auth"),
	#####GAMER MODE#####...#####...#####...#####ACTIVATED#####
	# path("saveGame/", views.save_game, name='save_game'),
]