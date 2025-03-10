// import { CreateCanvas, Game, drawBall, drawPaddle, drawScores } from './PongFunctions.js'

let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];
let lastGameState = null;
let currentGameState = null;
let lastUpdateTime = performance.now();
let start = false;

document.body.addEventListener('click', function(event) {
	if (event.target){
		if (event.target.matches('button.matchmaking')) 
			socketConnexion('matchmaking/classique');
		if (event.target.matches('button.tournament'))
			socketConnexion('matchmaking/tournament');
	}
});

async function setPong(gameConstant) {
	window.history.pushState({}, '', '/pong');
	const response = await fetch('/static/html/pong.html');
	const html = await response.text();
	document.querySelector("div.all").innerHTML = html;
	console.log(html);
	// runScriptsInHTML(html);
	Game.paddleSize = { width: gameConstant.paddle.width, height: gameConstant.paddle.height };
	Game.ballRadius = gameConstant.ballRadius;
	// updateUI(); //specific a la page pong
	CreateCanvas();
}

async function socketConnexion(path) {
	socket = new WebSocket(`wss://localhost:8443/ws/${path}/`);
	socket.onopen = () => {
		console.log('ws open')
		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("click", handleQuit);
		updateUI();
	};
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data)['event'];
		// console.log(data_json);
		switch (data_json['event']) {
			case 'Game':
				// data_json['gameConst']
				setPong(data_json['gameConst']);
				break;
			case 'Data':
				currentGameState = data_json['pong'];
				lastGameState = currentGameState;
				lastUpdateTime = performance.now();
				// if (!start){
				// 	start = true;
					requestAnimationFrame(renderPong);
				// }
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
			case 'Error':
				alert(data_json['log']); // Meilleure alerte necessaire
				break;
		}
	};
	socket.onclose = () => {
		console.log('ws close')
		document.removeEventListener("click", handleQuit);
		window.removeEventListener("beforeunload", handleUnload);
	};
}

function updateUI() {
	const ui1 = document.querySelector('div.UI1');
	const ui2 = document.querySelector('div.UI2');
	ui1.hidden = !ui1.hidden;
	ui2.hidden = !ui2.hidden;
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

function renderPong() {
	if (!lastGameState || ! currentGameState){
		start = false;
		return;}
		
		// fill gaps between gameState updates
		// if (performance.now() - lastUpdateTime > 10 && performance.now() - lastUpdateTime < 29 && lastGameState.ball[0] > Game.paddleSize.width
		// 	&& lastGameState.ball[0] < Game.canvas.width - Game.paddleSize.width){
			// 	lastGameState.ball[0] += (lastGameState.vector[0] * lastGameState.speed * 1 / 4)
			// 	lastGameState.ball[1] += (lastGameState.vector[1] * lastGameState.speed * 1 / 4)
			// }
	// if (performance.now() - lastUpdateTime >= 1000 / 60) {
		Game.ctx.fillStyle = "black";
		Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
		drawPaddle(lastGameState.paddle1[0], lastGameState.paddle1[1]);;
		drawPaddle(lastGameState.paddle2[0], lastGameState.paddle2[1]);
		drawBall(lastGameState.ball[0], lastGameState.ball[1]);
		drawScores(lastGameState.score[0], lastGameState.score[1]);
		lastUpdateTime = performance.now();
	// }
	// requestAnimationFrame(renderPong);
}

// function showPauseMenu() {
//     Game.pauseMenu.style.display = "flex"; // Show menu
//     cancelAnimationFrame(renderPong); // Stop the game loop
// }

// // Hide the pause menu
// function hidePauseMenu() {
//     Game.pauseMenu.style.display = "none"; // Hide menu
// }
