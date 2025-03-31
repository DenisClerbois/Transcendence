// import { CreateCanvas, Game, drawBall, drawPaddle, drawScores } from './PongFunctions.js'

let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];
let lastGameState = null;
let currentGameState = null;
let lastUpdateTime = performance.now();

document.body.addEventListener('click', function(event) {
	if (event.target){
		if (event.target.matches('button.matchmaking')){
			updateUI();
			socketConnexion('matchmaking/classique');
		}
		if (event.target.matches('button.tournament')){
			updateUI();
			socketConnexion('matchmaking/tournament');
		}
		if (event.target.matches('button.multiplayer')){
			updateUI();
			socketConnexion('matchmaking/multiplayer');
		}
		if (event.target.matches('button.ia')){
			updateUI();
			socketConnexion('matchmaking/ia');
		}
	}
});

function game(data_json) {
	document.querySelector("div.card-header").hidden = true
	document.addEventListener("click", give_up);
	document.removeEventListener("click", handleQuit);
	setPong(data_json['constant']);
	requestAnimationFrame(renderPong); //to show game behind the countdown
}
function start(data_json) {
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);
}
function end(data_json) {
	document.querySelector("div.card-header").hidden = false
	document.removeEventListener("click", give_up);
	document.removeEventListener("keydown", handleKeyDown);
	document.removeEventListener("keyup", handleKeyUp);
	alertNonModal(`Partie finie. Resultat : ${data_json['result']}`);
	window.history.pushState({}, "", '/home');
	fetchBody();
}
function countdown(data_json) {
	if (!data_json.time)
		return;
	Game.ctx.fillStyle = "black";
	Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
	for (let i = 0; i < Game.players; i++){
		switch(i){
			case 0:
				drawPaddle(1, Game.canvas.height / 2 - 50, 1);
				break;
			case 1:
				drawPaddle(Game.canvas.width - 10, Game.canvas.height / 2 - 50, 1);
				break;
			case 2:
				drawPaddle(Game.canvas.width / 2 - 50, 1, 0);
				break;
			case 3:	
				drawPaddle(Game.canvas.width / 2 - 50, Game.canvas.height - 10, 0);
				break;
		}
	}
	drawBall(Game.canvas.width / 2 - 10, Game.canvas.height / 2 - 10);
	drawCount(data_json.time, Game.canvas.width / 2, Game.canvas.height / 2, 48);
	console.log(data_json, "\n\n", data_json.time)
	if (data_json.time && data_json.time > 0)
		requestAnimationFrame(countdown);
	else
		return;
}
function drawCount(time, x, y, size){
	console.log(time, x, y, size);
	Game.ctx.font = `${size}px Arial`;
	Game.ctx.fillStyle = "red";
	Game.ctx.textAlign = "center";
	Game.ctx.textBaseline = "middle"; 
	Game.ctx.fillStyle = "red";
	Game.ctx.fillText(time, x, y);
}

function data(data_json) {
	currentGameState = data_json['pong'];
	lastGameState = currentGameState;
	lastUpdateTime = performance.now();
	requestAnimationFrame(renderPong);
}
function temporary_end(data_json) {
	document.removeEventListener("click", give_up);
	document.removeEventListener("keydown", handleKeyDown);
	document.removeEventListener("keyup", handleKeyUp);
	alertNonModal(`Partie finie. Resultat : ${data_json['result']}`);
	window.history.pushState({}, "", '/waiting_room');
	fetchBody();
}

const actions = {
	'game':game,
	'start':start,
	'end':end,
	'countdown':countdown,
	'data':data,
	'temporary_end': temporary_end,
}

async function socketConnexion(path) {
	socket = new WebSocket(`wss://` + window.location.host + `/ws/${path}/`);
	socket.onopen = () => {
		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("click", handleQuit);
	};
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data)['event'];
		const key = data_json['event']
		if (key && actions[key])
			actions[key](data_json)
	};
	socket.onclose = () => {
		document.removeEventListener("click", handleQuit);
		window.removeEventListener("beforeunload", handleUnload);
	};
}
 
function updateUI() {
	const ui1 = document.querySelector('div.UI1');
	const ui2 = document.querySelector('div.UI2');
	if (ui1)
		ui1.hidden = !ui1.hidden;
	if (ui2)
		ui2.hidden = !ui2.hidden;
}
function give_up(event){
	if (event.target && event.target.matches('button.give_up')){
		socket.send(JSON.stringify({type: 'give_up'}));
	}
}
function handleQuit(event){
	if (event.target && event.target.matches('button.close')){
		socket.send(JSON.stringify({type: 'quit'}));
		updateUI();
	}
}
function handleUnload(event) {
	socket.send(JSON.stringify({type: 'quit'}));
}
function handleKeyDown(event) {
	if (!isKeyDown && keys.includes(event.key)){
		socket.send(JSON.stringify({type: 'input', bool: event.type, key: event.key}));
		isKeyDown = true;
	}
}
function handleKeyUp(event) {
	if (keys.includes(event.key)) {
		socket.send(JSON.stringify({type: 'input', bool: event.type, key: event.key}));
		isKeyDown = false;
	}
}



// async function socketConnexion(path) {
// 	console.log(window.location.host);
// 	socket = new WebSocket(`wss://` + window.location.host + `/ws/${path}/`);
// 	socket.onopen = () => {
// 		console.log('ws open')
// 		window.addEventListener('beforeunload', handleUnload)
// 		document.addEventListener("click", handleQuit);
// 	};
// 	socket.onmessage = (e) => {
// 		const data_json = JSON.parse(e.data)['event'];
// 		// console.log(data_json);
// 		switch (data_json['event']) {
// 			case 'Game':
// 				document.addEventListener("click", give_up);
// 				console.log(data_json['constant'])
// 				document.removeEventListener("click", handleQuit);
// 				// window.removeEventListener("beforeunload", handleUnload);
// 				// data_json['gameConst']
// 				setPong(data_json['constant']);
// 				requestAnimationFrame(renderPong);
// 				break;
// 			case 'Data':
// 				currentGameState = data_json['pong'];
// 				lastGameState = currentGameState;
// 				lastUpdateTime = performance.now();
// 				requestAnimationFrame(renderPong);
// 				break;
// 			case 'Countdown':

// 				break;
// 			case 'Go':
// 				document.addEventListener("keydown", handleKeyDown);
// 				document.addEventListener("keyup", handleKeyUp);
// 				break;
// 			case 'End':
// 				document.removeEventListener("click", give_up);
// 				document.removeEventListener("keydown", handleKeyDown);
// 				document.removeEventListener("keyup", handleKeyUp);
// 				alertNonModal(`Partie finie. Resultat : ${data_json['result']}`);
// 				window.history.pushState({}, "", '/home');
// 				fetchBody();
// 				break;
// 			case 'Error':
// 				alert(data_json['log']); // Meilleure alerte necessaire
// 				break;
// 		}
// 	};
// 	socket.onclose = () => {
// 		console.log('ws close')
// 		document.removeEventListener("click", handleQuit);
// 		window.removeEventListener("beforeunload", handleUnload);
// 	};
// }
