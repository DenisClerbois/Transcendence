from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
@csrf_exempt
def LoginView(request):
	if (request.method == 'POST'):
		data = json.loads(request.body)
		username = data.get('username')
		password = data.get('password')
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User logged in.'}, status=200)
		else:
			return JsonResponse({'message': 'Error on logged in.'}, status=401)