from django.shortcuts import render, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import FriendRequest

@login_required
def invite(request, targetUserId):
    to_user = User.objects.get(id=targetUserId)
    friend_request, created = FriendRequest.objects.get_or_create(
        from_user=request.user, to_user=to_user)
    if created:
        ##### Je sais pas comment ca marche, voila une suggestion de Claude
        Notification.objects.create(
            user=to_user,
            message=f'{request.user.username} sent you a friend request',
            link=f'/accept/{friend_request.id}/'
        )
        #####
        return HttpResponse('Created and sent friend request')
    return HttpResponse('Friend request has already been created and sent')

@login_required
def accept(request, requestId): #id of FriendRequest instance
    friend_request = FriendRequest.objects.get(id=requestId)
    if friend_request.to_user == request.user:
        friend_request.to_user.friends.add(friend_request.from_user) #symmetrical
        friend_request.delete()
        return HttpResponse('Friend request accepted')
    return HttpResponse('Bad friend request. Rejected')

# @login_required
# def remove(request, targetId):
# @login_required
# def reject(request, originId):

