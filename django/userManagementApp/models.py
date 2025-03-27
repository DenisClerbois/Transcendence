from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_out
from django.conf import settings
from django.utils import timezone
import os
import uuid


#Creates the PlayerProfile instance upon User (auth model) creation using signal
@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance, nickname=instance.username[:5].upper())

@receiver(user_logged_out)
def set_user_offline(sender, user, request, **kwargs):
    if user:  # Just to be safe
        profile = user.profile
        profile.is_online = False
        profile.save(update_fields=['is_online'])


def set_profile_image_path(instance, filename):
        ext = filename.split('.')[-1] #find file type
        filename = f"{uuid.uuid4()}.{ext}" # pseudo random filename seeded on time
        return os.path.join('profile_pictures', filename)

class PlayerProfile(models.Model):
    user = models.OneToOneField(
        User,  #copy user data from auth app
        on_delete=models.CASCADE, #if user deleted, PlayerProfile deleted. (Not the other way around)
        related_name='profile'
    )
    nickname = models.CharField(
        max_length = 5, #could be higher. Small is nice
        default='', # empty string necessary for create_player_profile()
    )
    profile_picture = models.ImageField(
        upload_to=set_profile_image_path,   # example: on upload of 'my_pic.jpg', get_profile_image orders storing as
        blank=True,                         # cont /usr/src/app/static/media/profile_pictures/123e4567-e89b-12d3-a456-426614174000.jpg
        null=True,                          # host ./django/static/media/profile_pictures/123e4567-e89b-12d3-a456-426614174000.jpg
    )                                       # accessible to nginx container at /static/app/media/profile_pictures/123e4567-e89b-12d3-a456-426614174000.jpg
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(default=timezone.now)
    def __str__(self):  # ~ofstream overload equivalent
        return f"User {self.user.username} - Email: {self.user.email}"





#####GAMER MODE#####...#####...#####...#####ACTIVATED#####

#data instance for each played game, whatever the number of players
class Game(models.Model):
    creation = models.DateTimeField(
        auto_now_add=True #auto timestamp upon model instance creation
    )
    last_edit = models.DateTimeField(
        auto_now = True #auto timestamp upon game.save() call. Why it can be useful: auto save game end time
    )
    players = models.ManyToManyField(
        'userManagementApp.PlayerProfile', #no need to import PlayerProfile at the top of model.py
        related_name='game_history' #no need to add game_history in PlayerProfile, it's automatic
    )
    scores = models.JSONField() #{uid_player1: score, uid_player2: score}
    game_id = models.UUIDField(
        unique=True,
        editable=False, #Unique as fuck
        default = uuid.uuid4
    )
    desertor = models.IntegerField(null=True, default=None) #uid du joueur qui a abandonne

    def __str__(self):  # ~ofstream overload equivalent
        player_names = ", ".join([player.username for player in self.players.all()])
        return f"Game on {self.creation.strftime('%Y-%m-%d %H:%M')} - Players: {player_names}"

    def getWinner(self):
        legal_max_score = max( #it's illegal to give up mid-game. You're excluded from winning
            (score for uid, score in self.score.items() if uid != self.desertor),
            default=None
        )
        winners = [ #safe with ex aequos
            player for player in self.players.all() 
            if self.scores.get(str(player.id)) == legal_max_score
        ]
        return winners[0] if len(winners) == 1 else None #can be edited if ex aequo accepted (not applicable with Pong rules)
    def getScore(self, userId):
        return self.scores[userId]