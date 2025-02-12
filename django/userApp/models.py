from django.db import models

# Create your models(database) here.
class User(models.Model):
	username = models.CharField(max_length=16)
	password = models.CharField(max_length=16)






# from django.contrib.auth.models import User
# from django.db import models #django's layer over postgres database

# class PongGameStats(models.Model):
#     highest_score = model.IntegerField(default=0)
#     games_played = model.IntegerField(default=0)
#     victories = models.IntegerField(null=True) #number of victories
#     level = models.FloatField(default=1.0) #level setting the AI difficulty, evolving depending on past games
#     #etc

# class OtherGameStats(models.Model):
#     highest_score = model.IntegerField(default=0)
#     games_played = model.IntegerField(default=0)
#     victories = models.IntegerField(null=True) #number of victories
#     level = models.FloatField(default=1.0) #level setting the AI difficulty, evolving depending on past games
#     #etc

class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) #copy user data from auth app
    has_profile_pic = models.BooleanField(default=False) #if set to True, profile pic named after user unique id
#     pong_game_stats = models.OneToOneField(PongGameStats, on_delete=models.CASCADE, null=True, blank=True)
#     other_game_stats = models.OneToOneField(OtherGameStats, on_delete=models.CASCADE, null=True, blank=True)
#     friends_list = ArrayField(models.IntegerField(null=True, blank=True), null=True, blank=True) #unique id array

    def str(self):  # ~ofstream overload equivalent
        return self.user.username
