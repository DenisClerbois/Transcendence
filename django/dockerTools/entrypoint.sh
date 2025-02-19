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

exec watchfiles --filter python 'uvicorn mainApp.asgi:application --host 0.0.0.0 --port 8000'
# exec watchfiles --filter python 'gunicorn --workers 3 --bind 0.0.0.0:8000 mainApp.wsgi:application'
#gunicorn --workers 3 --bind 0.0.0.0:8000 mainApp.wsgi:application
# COMMENT : only design to support dev server. Gunicorn should be better
# python manage.py runserver 0.0.0.0:8000