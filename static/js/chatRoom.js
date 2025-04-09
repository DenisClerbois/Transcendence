var chatLog = document.querySelector('#chat-log');


var userId_raw = sessionStorage.getItem("userId");

var userId = JSON.parse(userId_raw);

if (window.chatSocket) {
	window.chatSocket.close();
}
var chatSocket = new WebSocket(
	'wss://'
	+ window.location.host
	+ '/ws/chat/'
	+ userId
	+ '/'
);

chatSocket.onmessage = function(event) {
	var data = JSON.parse(event.data);
	if ('type' in data){
		if (data.type == 'challenge_received'){
			updateUI_chat("state3");
		}
		else if (data.type == 'challenge_cancelled'){
			updateUI_chat("state1");
		}
		else if (data.type == 'challenge_declined'){
			updateUI_chat("state1");
		}
		return;
	}

	var messageElement = document.createElement('div');
	messageElement.innerText = data.message;
	messageElement.classList.add('message');
	if (data.sender_id != userId) {
		messageElement.classList.add('user');
	} else {
		messageElement.classList.add('receiver');
	}
	chatLog.appendChild(messageElement);
	messageElement.scrollIntoView({ behavior: 'smooth' });

};

function sendMessage(message) {
	chatSocket.send(JSON.stringify({ message: message }));
}

// chatSocket.onclose = function(e) {
// 	console.error('Chat socket closed unexpectedly');
// };

// chatSocket.onerror = function(error) {
// 	console.error("WebSocket error:", error);
// };

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
	if (e.key === 'Enter') {
		document.querySelector('#chat-message-submit').click();
	}
};

document.querySelector('#chat-message-submit').onclick = function(e) {
	var messageInputDom = document.querySelector('#chat-message-input');
	var message = messageInputDom.value;
	chatSocket.send(JSON.stringify({
		'message': message
	}));
	messageInputDom.value = '';
};

function updateUI_chat(state){
	// const navbar = document.querySelector('div.card-header');
	// navbar.hidden = !navbar.hidden;
	document.querySelectorAll('div.ui').forEach(element => {
		if (element.id == state)
			element.hidden = false
		else
			element.hidden = true

	});
}

// class="card-header">

document.querySelector('#chat-play-button').onclick = function(e) {
	updateUI_chat('state2');
	window.addEventListener('beforeunload', quit);
	json = JSON.stringify({type: 'challenge', action: 'join'});
	chatSocket.send(json);
	// socketConnexion('clash')
};

function quit(){
	updateUI_chat('state1');
	json = JSON.stringify({type: 'challenge', action: 'cancel'});
	chatSocket.send(json);
	window.removeEventListener("beforeunload", quit);
}
document.querySelector('#chat-cancel-button').onclick = function(e) {
	quit()
};

// document.querySelector('#chat-accept-button').onclick = function(e) {
// 	json = JSON.stringify({type: 'challenge', action: 'accept'});
// 	chatSocket.send(json);
// };

document.querySelector('#chat-decline-button').onclick = function(e) {
	updateUI_chat('state1');
	json = JSON.stringify({type: 'challenge', action: 'decline'});
	chatSocket.send(json);
};