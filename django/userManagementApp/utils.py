import re
from django.contrib.auth.models import User

def goodEmailFormat(email):
	regex_email = r"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
	return re.match(regex_email, email)

def goodPasswordFormat(pwd):
	regex_password = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"
	return re.match(regex_password, pwd)

def usernameInDB(username):
	return User.objects.filter(username=username).exists()

def emailInDB(email):
	return User.objects.filter(email=email).exists()

def emailErrorFinder(email):
	if not email or not goodEmailFormat(email):
		return 'invalid format'
	elif emailInDB(email):
		return 'already in use'
	return None

def usernameErrorFinder(username):
	if not username:
		return 'invalid format'
	elif usernameInDB(username):
		return 'already in use'
	return None

def passwordErrorFinder(password):
	if not password or not goodPasswordFormat(password):
		return 'invalid format'
	return None 

#argv allows targetting specific json elements when data contains garbage
def userDataErrorFinder(data, *argv):
	responseObj = {}
	error = ""
	if len(argv) == 0:
		argv = data.keys()
	for arg in argv:
		match arg:
			case "email":
				error = emailErrorFinder(data.get('email'))
			case "username":
				error = usernameErrorFinder(data.get('username'))
			case "password":
				error = passwordErrorFinder(data.get('password'))
			case _:
				print("userDataErrorFinder() data anomaly: arg={}".format(arg))
		if error:
			responseObj[arg] = error
	return responseObj