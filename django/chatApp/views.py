# from django.shortcuts import render, HttpResponse
# from django.http import JsonResponse
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User
# from userManagementApp.models import PlayerProfile
# from django.core.exceptions import ObjectDoesNotExist

# @login_required
# def get_room(request, targetUserId):
#     try:
#         to_user = User.objects.get(id=targetUserId)
#         from_user = request.user.id
#         # Ici tu peux call les fonctions de chatroom avec les id des deux users,
#         # juste a partie de l'appel de fonction 'getChatRoom()'

#         return JsonResponse({'user_1': from_user, 'user_2': to_user}, status=200) #pour le debug
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'Target user not found'}, status=404)

#LORENZO