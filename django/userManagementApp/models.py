from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_out
from django.conf import settings
from django.utils import timezone
import os


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
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked = models.ManyToManyField('self', symmetrical=False, blank=True)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(default=timezone.now)
    
    def is_friend(self, targetUID):
        return self.friends.filter(id=targetUID).exists()
    def is_blocked(self, targetUID):
        return self.blocked.filter(id=targetUID).exists()


