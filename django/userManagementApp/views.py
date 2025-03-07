from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import PlayerProfile
import json
import os
from . import utils
from .utils import userDataErrorFinder


# Create your views here.
@csrf_exempt
def log(request):
	if (request.method == 'POST'):
		# if request.User.is_authenticated:
		# 	return JsonResponse({'message': 'You are already logged in.'}, status=401)
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
	user = User.objects.create_user(username=data.get('username'),
									email=data.get('email'),
									password=data.get('password'))
	if user is None:
		return JsonResponse({'message': 'Error on user creation.'}, status=401)
	login(request, user)
	return JsonResponse({'message': 'User account created.'}, status=200)


@login_required
def getProfile(request):
	user = request.user #the same user as "User" imported from django.contrib.auth.models in models.py
	try:
		profile = user.playerprofile  # Directly access OneToOneField (always lowercase)
	except PlayerProfile.DoesNotExist:
		return JsonResponse({"error": "Profile not found"}, status=404)
	
	#static/html/profile.html
	#static/js/profilePage.js
	profile_data = {
		"username": user.username,
		"email": user.email,
		"teeth_length": profile.teeth_length,
		"nickname": profile.nickname,
		"id": user.id,
		# other user data fields
	}

	return JsonResponse(profile_data, status=200)

@csrf_exempt
@login_required
def profileUpdate(request):
	if request.method == "POST" and request.user.is_authenticated:
		data = json.loads(request.body)
		dataErrors = userDataErrorFinder(data) #no argv since json contains strictly only modified user data fields
		if bool(dataErrors):
			return JsonResponse(dataErrors, status=401)

		# Update user details
		user = request.user
		playerprofile = user.playerprofile
		# static/js/profilePage.js
		for key, arg in data.items():
			print(key)
			match key:
				case "username":
					user.username = arg
				case "email":
					user.email = arg
				case "teeth_length":
					playerprofile.teeth_length = arg
				case "nickname":
					playerprofile.nickname = arg
				case _:
					print("profileUpdate() data anomaly: key={}, arg={}".format(key, arg))
		user.save()
		playerprofile.save()
		return JsonResponse(data, status=200)
	return JsonResponse({'error': 'Invalid request'}, status=400)

# def getProfilePicPath(request):
# 	if request.user.is_authenticated:
# 		profile = getattr(request.user, "playerprofile", None)
# 		if profile == None:
# 			return JsonResponse({'error': "Couldn't fetch PlayerProfile"})
# 		path = str(profile_pic_path)
# 		return JsonResponse({'path': path}, status=200)
# 	return JsonResponse({'error': 'Not authenticated'}, status=401)
