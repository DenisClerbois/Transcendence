
let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];

document.body.addEventListener('click', function(event) {
	if (event.target){
		if (event.target.matches('button.matchmaking'))
			socketConnexion('matchmaking/classique');
		if (event.target.matches('button.tournament'))
			socketConnexion('matchmaking/tournament');
	}
});

async function socketConnexion(path) {
	socket = new WebSocket(`wss://localhost:8443/ws/${path}/`);
	socket.onopen = () => {
		console.log('ws open')
		document.addEventListener("click", handleQuit);
		updateUI();
	};
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data)['event'];
		switch (data_json['event']) {
			case 'Game':
				break;
			case 'Countdown':
				break;
			case 'Go':
				document.addEventListener("keydown", handleKeyDown);
				document.addEventListener("keyup", handleKeyUp);
				break;
			case 'End':
				document.removeEventListener("keydown", handleKeyDown);
				document.removeEventListener("keyup", handleKeyUp);
				break;
		}
		console.log(data_json);
	};
	socket.onclose = () => {
		console.log('ws close')
		document.removeEventListener("click", handleQuit);
		updateUI();
	};
}

function updateUI() {
	const ui1 = document.querySelector('div.UI1');
	const ui2 = document.querySelector('div.UI2');
	const ui3 = document.querySelector('div.card-header');
	ui1.hidden = !ui1.hidden;
	ui2.hidden = !ui2.hidden;
	ui3.hidden = !ui3.hidden;
}
function handleQuit(event){
	if (event.target && event.target.matches('button.close')){
		socket.send(JSON.stringify({type: 'quit'}));
	}
}
function handleKeyDown(event) {
	if (!isKeyDown && keys.includes(event.key)){
		socket.send(JSON.stringify({type: 'input', bool:'event.type', key: event.key}));
		isKeyDown = true;
	}
}
function handleKeyUp(event) {
	if (keys.includes(event.key)) {
		socket.send(JSON.stringify({type: 'input', bool:'event.type', key: event.key}));
		isKeyDown = false;
	}
}