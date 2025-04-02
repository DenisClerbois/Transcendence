from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction
from .models import FriendRequest
from userManagementApp.models import PlayerProfile
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ObjectDoesNotExist

@login_required
def invite(request, targetUserId):
	try:
		to_user = User.objects.get(id=targetUserId)
		friend_request_dupplicate = FriendRequest.objects.filter(
			from_user=request.user, to_user=to_user
		).exists()
		if friend_request_dupplicate:
			return JsonResponse({"error": 'Friend request has already been created and sent'}, status=401)
		if to_user.profile.blocked.filter(id=request.user.id).exists():
			return JsonResponse({"error": 'The target user has blocked you'}, status=301)
		with transaction.atomic():
			friend_request = FriendRequest.objects.create(
				from_user=request.user, to_user=to_user
			)
		return JsonResponse({
			"success": 'Created and sent friend request',
			"request_id": friend_request.id
		}, status=200)
	except User.DoesNotExist:
		return JsonResponse({"error": 'Target user doesn\'t exist'}, status=404)

@login_required
def remove(request, targetUserId):
	try:
		to_user = User.objects.get(id=targetUserId)
		with transaction.atomic():
			request.user.profile.friends.remove(to_user.profile)
		return JsonResponse({
			"success":f'Removed user {targetUserId} from {request.user.id}\'s friends list'
		}, status=200)
	except User.DoesNotExist:
		return JsonResponse({"error": 'Target user doesn\'t exist'}, status=404)

@login_required
def block(request, targetUserId):
	try:
		targetUser = User.objects.get(id=targetUserId)
		with transaction.atomic():
			request.user.profile.friends.remove(targetUser.profile)
			request.user.profile.blocked.add(targetUser.profile)
		return JsonResponse({
			"success":f'Blocked user {targetUserId} from {request.user.id}\'s profile'
		}, status=200)
	except User.DoesNotExist:
		return JsonResponse({"error": 'Target user doesn\'t exist'}, status=404) 

@login_required
def unblock(request, targetUserId):
	try:
		targetUser = User.objects.get(id=targetUserId)
		with transaction.atomic():
			request.user.profile.blocked.remove(targetUser.profile)
		return JsonResponse({
			"success":f'Removed user {targetUserId} from {request.user.id}\'s blocked list'
		}, status=200)
	except User.DoesNotExist:
		return JsonResponse({"error": 'Target user doesn\'t exist'}, status=404)

@login_required
def accept(request, requestId): #id of FriendRequest instance
	try:
		with transaction.atomic():
			friend_request = FriendRequest.objects.select_for_update().get(id=requestId)
			
			if friend_request.to_user != request.user:
				return JsonResponse({"error": 'Unauthorized friend request'}, status=403)
			
			friend_request.to_user.profile.friends.add(friend_request.from_user.profile)
			friend_request.from_user.profile.friends.add(friend_request.to_user.profile)
			friend_request.delete()
		return JsonResponse({"success": 'Friend request accepted'}, status=200)

	except FriendRequest.DoesNotExist:
		return JsonResponse({"error": "FriendRequest not found"}, status=404)


@login_required
def reject(request, requestId):
	try:
		with transaction.atomic():
			friend_request = FriendRequest.objects.select_for_update().get(id=requestId)

			if friend_request.to_user != request.user:
				return JsonResponse({"error": 'Unauthorized friend request'}, status=403)
			friend_request.delete()
			return JsonResponse({"success": 'Friend request rejected'}, status=200)
	except FriendRequest.DoesNotExist:
		return JsonResponse({"error": "FriendRequest not found"}, status=404)

@login_required
def getOnlinePlayers(request):
	updateOnlineStatus()
	connected_users = User.objects.filter(
		profile__is_online=True,
	).exclude(id=request.user.id)
	return JsonResponse({
		str(user.id): user.username
		for user in connected_users
	})

@login_required
def getOnlineFriends(request):
	updateOnlineStatus()
	connected_profiles = request.user.profile.friends.filter(
		user__profile__is_online=True
	).exclude(user=request.user)
	return JsonResponse({
		str(profile.user.id): profile.user.username
		for profile in connected_profiles
	})

@login_required
def getFriends(request):
	friends = request.user.profile.friends.all()
	return JsonResponse({
		str(friend.user.id): friend.user.username
		for friend in friends
	})

@login_required
def getBlockedUsers(request):
	blockedUsers = request.user.profile.blocked.all()
	return JsonResponse({
		str(blockedUser.user.id): blockedUser.user.username
		for blockedUser in blockedUsers
	})

@login_required
def getOnlineStrangers(request):
	updateOnlineStatus()
	friend_ids = request.user.profile.friends.values_list('user_id', flat=True)
	connected_strangers = User.objects.filter(
		profile__is_online=True,
	).exclude(id__in = [request.user.id] + list(friend_ids))
	
	return JsonResponse({
		str(user.id): user.username
		for user in connected_strangers
	})


@login_required
def inFriendRequests(request):
	Requests = FriendRequest.objects.filter(to_user=request.user)
	return JsonResponse({
		str(req.id): req.from_user.username
		for req in Requests
	})

def updateOnlineStatus():
	threshold = timezone.now() - timedelta(minutes=1)
	# Update all profiles that are marked online but haven't been active recently
	count = PlayerProfile.objects.filter(
		is_online=True, 
		last_activity__lt=threshold
	).update(is_online=False)
