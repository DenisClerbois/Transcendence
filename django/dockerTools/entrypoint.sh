#!/bin/sh

until pg_isready -h postgres -U postgres; do
echo "Waiting for PostgreSQL to be ready..."
  sleep 3
done

python manage.py makemigrations
python manage.py migrate


python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

username = "$DJANGO_SUPERUSER_USERNAME"
email = "$DJANGO_SUPERUSER_EMAIL"
password = "$DJANGO_SUPERUSER_PASSWORD"

if not User.objects.filter(username=username).exists():
	User.objects.create_superuser(username=username, email=email, password=password)
EOF


exec watchfiles --filter python 'daphne -b 0.0.0.0 -p 8000 mainApp.asgi:application'
