#!/bin/sh

python manage.py makemigrations
python manage.py migrate
python manage.py migrate channels_postgres --database=channels_postgres

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

username = "$DJANGO_SUPERUSER_USERNAME"
email = "$DJANGO_SUPERUSER_EMAIL"
password = "$DJANGO_SUPERUSER_PASSWORD"

if not User.objects.filter(username=username).exists():
	User.objects.create_superuser(username=username, email=email, password=password)
EOF

# python manage.py runserver 0.0.0.0:8000
daphne -b 0.0.0.0 -p 8000 app.asgi:application