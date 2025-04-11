from django.db import models
# from django.contrib.auth.models import User
from userManagementApp.models import PlayerProfile
import uuid


#data instance for each played game, whatever the number of players
class Game(models.Model):
    creation = models.DateTimeField(
        # auto_now_add=True #auto timestamp upon model instance creation
    )
    players = models.ManyToManyField(
        'userManagementApp.PlayerProfile', #no need to import PlayerProfile at the top of model.py
        related_name='game_history' #no need to add game_history in PlayerProfile, it's automatic
    )
    scores = models.JSONField(default=None) #{uid_player1: score, uid_player2: score}
    game_id = models.UUIDField(
        unique=True,
        editable=False,
        default = uuid.uuid4
    )
    game_type = models.CharField(max_length=15)

    def getWinner(self):
        max_score = max(self.scores.values())
        for player in self.scores.keys():
            if self.scores[player] == max_score:
                return player
        return max_score
    def getScore(self, userId):
        if userId in self.scores.keys():
            return self.scores[userId]
        return 0