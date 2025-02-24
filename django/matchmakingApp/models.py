# Create your models here.

from django.db import models
from django.contrib.auth.models import User

class Lobby(models.Model):
    """Represents a game lobby with a list of players."""
    name = models.CharField(max_length=100, unique=True)
    max_players = models.IntegerField(default=2)

    def get_player_list(self):
        """Return a list of player usernames for WebSockets."""
        return [player.user.username for player in self.players.all()]

    def add_player(self, user):
        """Add a player to the lobby if there is space."""
        if self.players.count() < self.max_players and not self.players.filter(user=user).exists():
            Player.objects.create(user=user, lobby=self)

    def remove_player(self, user):
        """Remove a player from the lobby."""
        self.players.filter(user=user).delete()

    def is_full(self):
        """Check if the lobby is full."""
        return self.players.count() >= self.max_players

class Player(models.Model):
    """Represents a player in a lobby, can be extended later."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lobby = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="players")
    joined_at = models.DateTimeField(auto_now_add=True)  # Timestamp when player joined
