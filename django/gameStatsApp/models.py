from django.db import models
# from django.contrib.auth.models import User
from userManagementApp.models import PlayerProfile
import uuid


#data instance for each played game, whatever the number of players
class Game(models.Model):
    creation = models.DateTimeField(
        auto_now_add=True #auto timestamp upon model instance creation
    )
    # last_edit = models.DateTimeField(
    #     auto_now = True #auto timestamp upon game.save() call. Why it can be useful: auto save game end time
    # )
    players = models.ManyToManyField(
        'userManagementApp.PlayerProfile', #no need to import PlayerProfile at the top of model.py
        related_name='game_history' #no need to add game_history in PlayerProfile, it's automatic
    )
    scores = models.JSONField(default=None) #{uid_player1: score, uid_player2: score}
    game_id = models.UUIDField(
        unique=True,
        editable=False, #Unique as fuck
        default = uuid.uuid4
    )
    game_type = models.CharField(max_length=15)
    def __str__(self):  # ~ofstream overload equivalent
        player_names = ", ".join([player.username for player in self.players.all()])
        return f"Game on {self.creation.strftime('%Y-%m-%d %H:%M')} - Players: {player_names}"

    def getWinner(self):
        max_score = max(self.scores.values())
        for player in self.scores.keys():
            if self.scores[player] == max_score:
                return player
        return max_score
    def getScore(self, userId):
        return self.scores[userId] if self.scores[userId] else 0