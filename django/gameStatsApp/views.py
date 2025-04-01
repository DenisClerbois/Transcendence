from django.shortcuts import render, HttpResponse
from .models import Game
from .models import PlayerProfile
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse

def gamePlayerErrFind(userId):
	if not User.objects.filter(id=userId).exists():
		return "user id not found"
#might be useful for development
def gameDataErrorFinder(data):
	responseObj = {}
	error = ""
	for userId in data.keys():
		error = gamePlayerErrFind(userId)
		if error:
			responseObj[userId] = error
	return responseObj

@transaction.atomic
def save_game(data): #{uid_player1: score, uid_player2: score}
	dataErrors = gameDataErrorFinder(data) #utile pour le developpement
	if bool(dataErrors):
		return JsonResponse(dataErrors, status=401)
	game = Game.objects.create(scores=data)
	winner = game.getWinner()
	for key, value in data.items():
		game.players.add(PlayerProfile.objects.get(id=key))
		profile = PlayerProfile.objects.get(id=key)
		if key == winner:
			profile.wins += 1
		else:
			profile.losses += 1
		profile.save(update_fields=['wins', 'losses'])
	return JsonResponse({'success': 'faked it perfecty'}, status=200)




@login_required
def get_games(request):
	try:
		games = request.user.profile.game_history.all()
		gamesJSON = {}
		for game in games:
			game_data = {
				'datetime': game.creation.isoformat(),
				'players': [
					{
						'id': str(player.id),
						'username': str(player.user.username),
						'nickname': str(player.nickname),
						'score': str(game.getScore(str(player.id)))
					}
					for player in game.players.all()
				],
				'winner': str(game.getWinner().id) if game.getWinner() else None
			}
			gamesJSON[str(game.id)] = game_data
		return JsonResponse(gamesJSON)
	except Exception as e:
		return JsonResponse({'error': tag}, status=500)


def save_fake_game(request):
	data = {
		'3': 12,
		'5': 7
	}
	return save_game(data)
