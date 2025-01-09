from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
import json

# Create your views here.
# @crsf machin
def login_view(request):
	if (request.method == 'POST'):
		try:
			data = json.loads(request.body)
			username = data.get('username')
			password = data.get('password')
			return JsonResponse({'message': 'message received', '!password!': password}, status=200)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	return JsonResponse({'message': 'Error'}, status=500)