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
import re

# Create your views here.
@csrf_exempt
# def LoginView(request):
# 	if (request.method == 'POST'):
# 		# if request.User.is_authenticated:
# 		# 	return JsonResponse({'message': 'You are already logged in.'}, status=401)
# 		data = json.loads(request.body)
# 		print("[DEBUG LOGIN] json =", data)
# 		username = data.get('username')
# 		password = data.get('password')
# 		user = authenticate(request, username=username, password=password)
# 		print("[DEBUG LOGIN] user =", user)
# 		if user is not None:
# 			login(request, user)
# 			return JsonResponse({'message': 'User logged in.'}, status=200)
# 		else:
# 			return JsonResponse({'message': 'Error on logged in.'}, status=401)
def LoginView(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print("[DEBUG LOGIN] json =", data)

        username = data.get('username')
        password = data.get('password')

        print("[DEBUG LOGIN] Trying to authenticate user with username:", username)

        # Check if the user exists in the database directly for debugging purposes
        try:
            user = User.objects.get(username=username)
            print("[DEBUG LOGIN] User found in the database:", user)
        except User.DoesNotExist:
            print("[DEBUG LOGIN] No user found with username:", username)
            return JsonResponse({'message': 'User not found.'}, status=404)

        # Now attempt authentication
        user = authenticate(request, username=username, password=password)

        if user is not None:
            print("[DEBUG LOGIN] Authentication successful, logging in user.")
            login(request, user)
            return JsonResponse({'message': 'User logged in.'}, status=200)
        else:
            print("[DEBUG LOGIN] Authentication failed.")
            return JsonResponse({'message': 'Invalid username or password.'}, status=401)


@login_required
def LogoutView(request):
	logout(request)
	return JsonResponse({'message': 'User logged out.'}, status=200)


def checkUserAuthenticated(request):
	if request.user.is_authenticated:
		return JsonResponse({'authenticated': True}, status=200)
	else:
		return JsonResponse({'authenticated': False}, status=401) # change this to 200 and adapt the js response

@csrf_exempt
def RegisterView(request):
	# Use raw string for regex patterns in Python
	regex_email = r"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
	regex_password = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"

	if request.method == 'POST':
		data = json.loads(request.body)
		email = data.get('email')
		username = data.get('username')
		password = data.get('password')

		# Server-side validation (email, username, and password must be correct)
		if not re.match(regex_email, email) or not username or not re.match(regex_password, password):
			return JsonResponse({'message': 'Error on register.'}, status=401)

		# Create the user
		user = User.objects.create_user(username=username, email=email, password=password)
		if user is None:
			return JsonResponse({'message': 'Error on logged in.'}, status=401)
		login(request, user)
		return JsonResponse({'message': 'User account created.'}, status=200)



# @login_required
# def userProfile(request):
# 	user = request.user
# 	return JsonResponse({
# 		'username': user.username,
# 		'email': user.email},
# 		status=200)



@login_required
def getProfile(request):
	user = request.user #the same user as "User" imported from django.contrib.auth.models in models.py
	# try:
	# 	profile = user.playerprofile  # Directly access OneToOneField (always lowercase)
	# except PlayerProfile.DoesNotExist:
	# 	return JsonResponse({"error": "Profile not found"}, status=404)
	
	profile_data = {
		"username": user.username,
		"email": user.email,
		# "has_profile_pic": profile.has_profile_pic,
		# other user data fields
	}
	# if profile.has_profile_pic:
	# 	profile_data["profile_pic_url"] = f"/ProfilePicPath/{user.id}"

	return JsonResponse(profile_data)

@csrf_exempt
@login_required
def updateProfile(request):
    """Handles updating username and email if no duplicate."""
    if request.method == "POST" and request.user.is_authenticated:
        username = request.POST.get("username")
        email = request.POST.get("email")

        # Check for duplicate username and email
        if User.objects.filter(username=username).exclude(id=request.user.id).exists():
            return JsonResponse({'status': 'error', 'error': 'Username already taken'}, status=400)
        if email != request.user.email and User.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'error': 'Email already in use'}, status=400)

        # Update user details
        user = request.user
        user.username = username
        user.email = email
        user.save()

        return JsonResponse({
            'status': 'success',
            'username': user.username,
            'email': user.email,
        })

    return JsonResponse({'status': 'error', 'error': 'Invalid request'}, status=400)

