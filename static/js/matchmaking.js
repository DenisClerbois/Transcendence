import { CreateCanvas, Game, drawBall, drawPaddle, drawScores } from './PongFunctions.js'

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

async function socketConnexion(path) {
	socket = new WebSocket(`wss://localhost:8443/ws/${path}/`);
	socket.onopen = () => {
		console.log('ws open')
		document.addEventListener("click", handleQuit);
		updateUI();
	};
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data)['event'];
		// console.log(data_json);
		switch (data_json['event']) {
			case 'Game':
				// data_json['gameconst']
				Game.paddleSize = { width: data_json['gameconst'].paddle.width, height: data_json['gameconst'].paddle.height };
				Game.ballRadius = data_json['gameconst'].ballRadius;
				updateUI(); //specific a la page pong
				CreateCanvas();
				break;
			case 'data':
				currentGameState = data_json['pong'];
				console.log(currentGameState);
				lastGameState = currentGameState;
				lastUpdateTime = performance.now();
				if (!start){
					start = true;
					requestAnimationFrame(renderPong);
				}
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
	if (event.target && event.target.matches('button.close'))
		socket.send(JSON.stringify({type: 'quit'}));
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

function renderPong() {
	Game.ctx.fillStyle = "blue";
	Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);

	// fill gaps between gameState updates
	if (performance.now() - lastUpdateTime > 10 && performance.now() - lastUpdateTime < 29 && lastGameState.ball[0] > Game.paddleSize.width
		&& lastGameState.ball[0] < Game.canvas.width - Game.paddleSize.width){
		lastGameState.ball[0] += (lastGameState.vector[0] * lastGameState.speed * 1 / 4)
		lastGameState.ball[1] += (lastGameState.vector[1] * lastGameState.speed * 1 / 4)
	}
	drawPaddle(lastGameState.paddle1[0], lastGameState.paddle1[1]);;
	drawPaddle(lastGameState.paddle2[0], lastGameState.paddle2[1]);
	drawBall(lastGameState.ball[0], lastGameState.ball[1]);
	drawScores(lastGameState.score[0], lastGameState.score[1]);
	
	requestAnimationFrame(renderPong);
}

// function showPauseMenu() {
//     Game.pauseMenu.style.display = "flex"; // Show menu
//     cancelAnimationFrame(renderPong); // Stop the game loop
// }

// // Hide the pause menu
// function hidePauseMenu() {
//     Game.pauseMenu.style.display = "none"; // Hide menu
// }
