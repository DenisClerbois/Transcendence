from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from userManagementApp.models import PlayerProfile
from django.core.exceptions import ObjectDoesNotExist

@login_required
def get_room(request, targetUserId):
    try:
        to_user = User.objects.get(id=targetUserId)
        from_user = request.user
        to_user_data = {
            'id': to_user.id,
            'username': to_user.username,
            'email': to_user.email,
        }
        from_user_data = {
            'id': from_user.id,
            'username': from_user.username,
            'email': from_user.email,
        }
        # Ici tu peux call les fonctions de chatroom avec les id des deux users,
        # juste a partir de l'appel de fonction 'getChatRoom()'
        return JsonResponse({'user_1': from_user_data, 'user_2': to_user_data}, status=200) #pour le debug
    except User.DoesNotExist:
        return JsonResponse({'error': 'Target user not found'}, status=404)