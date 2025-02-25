
let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];

document.body.addEventListener('click', function(event) {
	if (event.target && event.target.matches('button.matchmaking')){
		matchmaking();
	}
	else if (event.target && event.target.matches('button.close')){
		if (socket) {
			socket.close();
		}
	}
});

async function matchmaking() {
	socket = new WebSocket('wss://localhost:8443/ws/matchmaking/');
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data);
		if (data_json['gameFound'])
			document.addEventListener("keydown", handleKeyDown);
			document.addEventListener("keyup", handleKeyUp);
		console.log(data_json);
	};
	socket.onopen = () => {
		updateUI();
	};
	socket.onclose = () => {
		document.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("keyup", handleKeyUp);
		updateUI();
	};
}

function updateUI() {
	const ui1 = document.querySelector('div.UI1');
	const ui2 = document.querySelector('div.UI2');
	ui1.hidden = !ui1.hidden;
	ui2.hidden = !ui2.hidden;
}
function handleKeyDown(event) {
	if (!isKeyDown && keys.includes(event.key)){
		socket.send(JSON.stringify({'type': event.type, 'key': event.key}));
		isKeyDown = true;
	}
}
function handleKeyUp(event) {
	if (keys.includes(event.key)) {
		socket.send(JSON.stringify({'type': event.type, 'key': event.key}));
		isKeyDown = false;
	}
}