from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


#Creates the PlayerProfile instance upon User (auth model) creation using signal
@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance, nickname=instance.username[:5].upper())

#data instance for each played game, whatever the game, whatever the number of players
class Game(models.Model):
    timestamp = models.DateTimeField(
        auto_now_add=True #auto timestamp upon model instance creation
    )
    players = models.ManyToManyField(
        'userManagementApp.PlayerProfile', #no need to import PlayerProfile at the top of model.py
        related_name='game_history' #no need to add game_history in PlayerProfile, it's automatic
    )
    scores = models.JSONField() #{uid_player1: score, uid_player2: score, etc .... "status":""}
    game_id = models.UUIDField(
        unique=True,
        editable=False, #Unique as fuck
    )
    game_type = models.CharField( #pong1v1, pong2v2, rock_paper_scisors, etc
        max_length=30,
    )
    desertor = models.IntegerField(null=True, default=None) #uid du joueur qui a abandonne

    def __str__(self):
        player_names = ", ".join([player.username for player in self.players.all()])
        return f"Game of {self.game_type} on {self.timestamp.strftime('%Y-%m-%d %H:%M')} - Players: {player_names}"

    def getWinner(self):
        legal_max_score = max( #it's illegal to give up mid-game
            (score for uid, score in self.score.items() if uid != self.desertor),
            default=None
        )
        winners = [ #safe with ex aequos
            player for player in self.players.all() 
            if self.scores.get(str(player.id)) == legal_max_score
        ]
        return winners[0] if len(winners) == 1 else None

class PlayerProfile(models.Model):
    user = models.OneToOneField(
        User,  #copy user data from auth app
        on_delete=models.CASCADE
    )
    nickname = models.CharField(
        max_length = 5, #could be higher. Small is nice
        default='' #Look here Claude
    )
    teeth_length = models.IntegerField( #was experimental, can be deleted once model is bigger
        default = 2
    )
    # profile_picture = models.ImageField(
    #     upload_to='profile_pictures/', 
    #     null=True, 
    #     blank=True
    # )

    def __str__(self):  # ~ofstream overload equivalent
        return f"User {self.user.username} - Email: {self.user.email}"