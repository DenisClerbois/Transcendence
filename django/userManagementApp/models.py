from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

#Creates the PlayerProfile instance upon User (auth model) creation using signal
@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance)

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
    teeth_length = models.IntegerField(default = 2)
    # profile_pic_path = models.CharField(max_length=20, null=True),
#     pong_game_stats = models.OneToOneField(PongGameStats, on_delete=models.CASCADE, null=True, blank=True)
#     other_game_stats = models.OneToOneField(OtherGameStats, on_delete=models.CASCADE, null=True, blank=True)
    # friends_list = ArrayField(models.IntegerField(null=True, blank=True), null=True, blank=True) #unique id array

    def str(self):  # ~ofstream overload equivalent
        return self.user.username