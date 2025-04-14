var chatData = null;

// ========== INIT ==========
async function initChat() {
	try {
		const data = await getChatRoom();
		chatData = data;

		document.getElementById("chat-name").innerText = data.user_2.nickname;
		document.getElementById("chat-name-2").innerText = data.user_1.nickname;

		setupWebSocket(data.user_2.id);
		initEventListeners();
	} catch (error) {
		// console.error('Chat init error:', error);
		alertNonModal('Chat not found');
		window.history.pushState({}, "", '/home');
		await updateContent();
		// fetchBody();
	}
}
initChat();

function extractUserIdFromURL() {
	const match = window.location.pathname.match(/\/chat\/(\d+)(\/)?$/);
	return match ? match[1] : null;
}

// ========== FETCH ROOM ==========
async function getChatRoom() {
	const userId = extractUserIdFromURL();
	if (!userId) {
		return;
	}
	const response = await fetch(`/api/chat/getRoom/${userId}/`, {
		method: 'POST',
		headers: { 'X-CSRFToken': getCsrfToken() },
		credentials: 'include'
	});
	if (!response.ok) throw new Error("Room fetch failed");
	return await response.json();
}

// ========== WEBSOCKET ==========
function setupWebSocket(userId) {
	if (window.chatSocket) {
		window.chatSocket.close();
	}
	var chatSocket = new WebSocket(`wss://${window.location.host}/ws/chat/${userId}/`);
	window.chatSocket = chatSocket;

	chatSocket.onmessage = handleSocketMessage;
	chatSocket.onerror = async () => {
		alertNonModal('Chat not found');
		window.history.pushState({}, "", '/home');
		await updateContent();
		// fetchBody();
	};
}

function handleSocketMessage(event) {
	const data = JSON.parse(event.data);

	if (data.type) {
		handleChallengeEvents(data);
		return;
	}

	displayMessage(data.message, data.sender_id !== chatData.user_1.id);
}

function displayMessage(message, isReceived) {
	const chatLog = document.getElementById('chat-log');
	const messageElement = document.createElement('div');
	messageElement.innerText = message;
	messageElement.classList.add('message', isReceived ? 'receiver' : 'user');
	chatLog.appendChild(messageElement);
	messageElement.scrollIntoView({ behavior: 'smooth' });
}

function handleChallengeEvents(data) {
	switch (data.type) {
		case 'challenge_received': updateUI_chat("state3"); break;
		case 'challenge_cancelled': 
		case 'challenge_declined': updateUI_chat("state1"); break;
		case 'challenge_accepted': socketConnexion(`matchmaking/clash/${data.game_id}`); break;
	}
}

// ========== UI + EVENTS ==========
function updateUI_chat(state) {
	document.querySelectorAll('div.ui').forEach(element => {
		element.hidden = element.id !== state;
	});
}

function initEventListeners() {
	document.querySelector('#chat-message-input').focus();
	document.querySelector('#chat-message-input').onkeyup = e => {
		if (e.key === 'Enter') document.querySelector('#chat-message-submit').click();
	};

	document.querySelector('#chat-message-submit').onclick = () => {
		const messageInputDom = document.querySelector('#chat-message-input');
		const message = messageInputDom.value;
		if (message.length) {
			chatSocket.send(JSON.stringify({ message }));
			messageInputDom.value = '';
		}
	};

	document.querySelector('#chat-play-button').onclick = () => {
		updateUI_chat('state2');
		window.addEventListener('beforeunload', quit);
		chatSocket.send(JSON.stringify({ type: 'challenge', action: 'join' }));
	};

	document.querySelector('#chat-cancel-button').onclick = quit;
	document.querySelector('#chat-accept-button').onclick = () => {
		chatSocket.send(JSON.stringify({ type: 'challenge', action: 'accept' }));
	};
	document.querySelector('#chat-decline-button').onclick = () => {
		updateUI_chat('state1');
		chatSocket.send(JSON.stringify({ type: 'challenge', action: 'decline' }));
	};
}

// ========== CLEANUP ==========
function quit() {
	updateUI_chat('state1');
	chatSocket.send(JSON.stringify({ type: 'challenge', action: 'cancel' }));
	window.removeEventListener("beforeunload", quit);
}