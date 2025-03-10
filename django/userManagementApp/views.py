from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import PlayerProfile
import magic
import json
import os
from django.conf import settings
from .utils import userDataErrorFinder
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProfilePictureSerializer


# Create your views here.
@csrf_exempt
def log(request):
	if (request.method == 'POST'):
		data = json.loads(request.body)
		username = data.get('username')
		password = data.get('password')
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User logged in.'}, status=200)
		elif User.objects.filter(username=username).exists():
			return JsonResponse({'password': 'invalid'}, status=401)
		else:
			return JsonResponse({'username': 'invalid'}, status=401)

@login_required
def log_out(request):
	logout(request)
	return JsonResponse({'message': 'User logged out.'}, status=200)


def auth(request):
	if request.user.is_authenticated:
		return JsonResponse({'authenticated': True}, status=200)
	else:
		return JsonResponse({'authenticated': False}, status=401) # change this to 200 and adapt the js response

@csrf_exempt
def register(request):
	data = json.loads(request.body)
	# Check format and duplicates
	dataErrors = userDataErrorFinder(data)
	if bool(dataErrors):
		return JsonResponse(dataErrors, status=401)

	# Create the user
	user = User.objects.create_user(
		username=data.get('username'),
		email=data.get('email'),
		password=data.get('password')
	)
	if user is None:
		return JsonResponse({'message': 'Error on user creation.'}, status=401)
	login(request, user)
	return JsonResponse({'message': 'User account created.'}, status=200)


@login_required
def getProfile(request):
	user = request.user #the same user as "User" imported from django.contrib.auth.models in models.py
	try:
		profile = user.profile  # Directly access OneToOneField (always lowercase)
	except PlayerProfile.DoesNotExist:
		return JsonResponse({"error": "Profile not found"}, status=404)
	
	#static/html/profile.html
	#static/js/profilePage.js
	profile_data = {
		"username": user.username,
		"email": user.email,
		"nickname": profile.nickname,
		"id": user.id,
		# other user data fields
	}

	return JsonResponse(profile_data, status=200)

@login_required
def profileUpdate(request):
	if request.method == "POST":# and request.user.is_authenticated:
		data = json.loads(request.body)
		dataErrors = userDataErrorFinder(data) #no argv since json contains strictly only modified user data fields
		if bool(dataErrors):
			return JsonResponse(dataErrors, status=401)

		# Update user details
		user = request.user
		playerprofile = user.profile
		# static/js/profilePage.js
		for key, arg in data.items():
			print(key)
			match key:
				case "username":
					user.username = arg
				case "email":
					user.email = arg
				case "nickname":
					playerprofile.nickname = arg
				case _:
					print("profileUpdate() data anomaly: key={}, arg={}".format(key, arg))
		user.save()
		playerprofile.save()
		return JsonResponse(data, status=200)
	return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def set_profile_pic(request):
	if 'image' not in request.FILES:
		return JsonResponse({'error': 'No image file provided'}, status=400)
	
	image_file = request.FILES['image']
	
	if image_file.size > settings.MAX_UPLOAD_SIZE:
		return JsonResponse({'error': f"File size exceeds maximum allowed ({settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB)"},
							status=400)
	
	mime = magic.Magic(mime=True) #file type detector
	file_type = mime.from_buffer(image_file.read(1024)) #detect file type from head
	image_file.seek(0) #reset reading pointer
	if file_type not in settings.ALLOWED_IMAGE_TYPES:
		return JsonResponse({'error': f'Invalid file type. Allowed types: {settings.ALLOWED_IMAGE_TYPES.join(", ")}'},
							status=400)

	profile = request.user.profile
	if profile.profile_picture and os.path.isfile(profile.profile_picture.path): #if user already has profile pic
		os.remove(profile.profile_picture.path)
	profile.profile_picture.save(image_file.name, image_file) # will call model's set_profile_image_path and store image
	profile.save()

	serializer = ProfilePictureSerializer(profile)
	return JsonResponse(serializer.data, status=200)

@login_required
def get_profile_pic(request):
	profile = request.user.profile
	serializer = ProfilePictureSerializer(profile)
	return JsonResponse(serializer.data, status=200)

#####GAMER MODE#####...#####...#####...#####ACTIVATED#####
from .models import Game
from .models import PlayerProfile
from .utils import gameDataErrorFinder

@login_required
def save_game(data, desertor=None): #{uid_player1: score, uid_player2: score}
	dataErrors = gameDataErrorFinder(data) #utile pour le developpement
	if bool(dataErrors):
		return JsonResponse(dataErrors, status=401)
	game = Game.objects.create(scores=data)
	for key, value in data.items():
		game.players.add(PlayerProfile.objects.get(id=key))
	
	if desertor:
		game.desertor = desertor
		game.save()