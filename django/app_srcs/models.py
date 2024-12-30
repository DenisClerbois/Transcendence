from django.db import models

# Create your models(database) here.
class User(models.Model):
	username = models.CharField(max_length=16)
	password = models.CharField(max_length=16)
