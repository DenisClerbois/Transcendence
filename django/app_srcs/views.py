from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
import json
import re

# Create your views here.
@csrf_exempt
def LoginView(request):
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
		else:
			return JsonResponse({'message': 'Error on logged in.'}, status=401)

@login_required
def LogoutView(request):
	logout(request);
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



@login_required
def userProfile(request):
	user = request.user
	return JsonResponse({
		'username': user.username,
		'email': user.email},
		status=200)



# # EXEMPLE POUR OLIVIER
# @login_required
# def getProfile()
# 	return (JsonResponse(username))