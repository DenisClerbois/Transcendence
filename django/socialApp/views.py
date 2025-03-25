from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import FriendRequest
from userManagementApp.models import PlayerProfile
from django.utils import timezone
from datetime import timedelta

@login_required
def invite(request, targetUserId):
    to_user, created = User.objects.get_or_create(id=targetUserId)
    if created:
        to_user.delete()
        return JsonResponse({"error": 'Target user doesn\'t exist'}, status=401)
    friend_request, created = FriendRequest.objects.get_or_create(
        from_user=request.user, to_user=to_user)
    if created:
        return JsonResponse({"success": 'Created and sent friend request'}, status=200)
    return JsonResponse({"error": 'Friend request has already been created and sent'}, status=401)

@login_required
def remove(request, targetUserId):
    to_user, created = User.objects.get_or_create(id=targetUserId)
    if created:
        to_user.delete()
        return JsonResponse({"error": 'Target user doesn\'t exist'}, status=400)
    request.user.profile.friends.remove(to_user)
    return JsonResponse({"success":f'Removed user {targetId} from {request.user.id}\'s friends list'}, status=200)

@login_required
def accept(request, requestId): #id of FriendRequest instance
    friend_request, created = FriendRequest.objects.get_or_create(id=requestId)
    if created:
        friend_request.delete()
        return JsonResponse({"error": "FriendRequest doesn't exist"}, status=400)
    if friend_request.to_user == request.user:
        friend_request.to_user.profile.friends.add(friend_request.from_user.profile) #symmetrical
        friend_request.delete()
        return JsonResponse({"success": 'Friend request accepted'}, status=200)
    return JsonResponse({"error": 'Bad friend request recipient. Rejected'}, status=400)

@login_required
def reject(request, requestId):
    friend_request, created = FriendRequest.objects.get_or_create(id=requestId)
    if created:
        friend_request.delete()
        return JsonResponse({"error": "FriendRequest doesn't exist"}, status=400)
    if friend_request.to_user == request.user:
        friend_request.delete()
        return JsonResponse({"success": 'Friend request deleted'}, status=200)
    return JsonResponse({"error": 'Bad friend request recipient. Deletion cancelled'}, status=400)

@login_required
def getOnlinePlayers(request):
    threshold = timezone.now() - timedelta(minutes=1)
        
    # Update all profiles that are marked online but haven't been active recently
    count = PlayerProfile.objects.filter(
        is_online=True, 
        last_activity__lt=threshold
    ).update(is_online=False)
    connected_users = User.objects.filter(
        profile__is_online=True,
    )
    users_dict = {str(user.id): user.username for user in connected_users if user.id != request.user.id}
    return JsonResponse(users_dict)

@login_required
def getFriends(request):
    profile = request.user.profile
    friends = profile.friends.all()
    friends_dict = {str(friend.user.id): friend.user.username for friend in friends}
    return JsonResponse(friends_dict)

@login_required
def inFriendRequests(request):
    Requests = FriendRequest.objects.filter(to_user=request.user)
    inRequests_dict = {str(req.id): req.from_user.username for req in Requests}
    return JsonResponse(inRequests_dict)
