#!/bin/sh

until pg_isready -h postgres -U postgres; do
echo "Waiting for PostgreSQL to be ready..."
  sleep 3
done

python manage.py makemigrations
python manage.py migrate


python manage.py shell <<EOF
import channels.layers
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

User = get_user_model()

username = "$DJANGO_SUPERUSER_USERNAME"
email = "$DJANGO_SUPERUSER_EMAIL"
password = "$DJANGO_SUPERUSER_PASSWORD"
user2 = User.objects.create_user(username='newuser', password='securepassword')
user2.email = 'newuser@example.com'
user2.save()
channel_layer = channels.layers.get_channel_layer()
async_to_sync(channel_layer.send)('test_channel', {'type': 'hello'})
async_to_sync(channel_layer.receive)('test_channel')
user2

if not User.objects.filter(username=username).exists():
	User.objects.create_superuser(username=username, email=email, password=password)
EOF


exec watchfiles --filter python 'daphne -b 0.0.0.0 -p 8000 mainApp.asgi:application'
