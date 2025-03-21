# FROM python:3.10

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1
# ENV PYTHONUNBUFFERED=1
# ENV PYTHONPATH="/app/django"


# # Set the working directory
# WORKDIR /app/django

# # Install dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the project files
# COPY . .
# RUN chmod 777 /app
# # Command to run the app with Daphne
# CMD ["daphne", "-u", "/app/django/sockets/daphne.sock", "mainApp.asgi:application"]