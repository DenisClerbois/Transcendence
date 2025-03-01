import { CreateCanvas, Game, drawBall, drawPaddle, drawScores } from './pongFunctions.js'

let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];
let lastGameState = null;
let currentGameState = null;
let lastUpdateTime = performance.now();
const updateInterval = 1000 / 60; // Simulate 60 FPS rendering

document.body.addEventListener('click', function (event) {
	if (event.target && event.target.matches('button.matchmaking')) {
		matchmaking();
	}
	else if (event.target && event.target.matches('button.close')) {
		if (socket) {
			socket.close();
		}
	}
});

let start = false;
async function matchmaking() {
	socket = new WebSocket('wss://localhost:8443/ws/matchmaking/');
	socket.onmessage = (e) => {
		const data_json = JSON.parse(e.data);
		// console.log(data_json);
		if (data_json['gameFound']) {
			document.addEventListener("keydown", handleKeyDown);
			document.addEventListener("keyup", handleKeyUp);
			updateUI();
			CreateCanvas();
		}
		if (data_json['gameConst']) {
			// console.log("Game Const = ", data_json['gameConst']);
			Game.paddleSize = { width: data_json.gameConst.gameConst.paddle.width, height: data_json.gameConst.gameConst.paddle.height };
			Game.ballRadius = data_json.gameConst.gameConst.ballRadius;
			// console.log("Game struct = ", Game);
		}
		if (data_json['gameState']) {
			lastGameState = currentGameState;
			currentGameState = data_json['gameState'].message;
			lastUpdateTime = performance.now();
			if (!start){
				start = true;
				requestAnimationFrame(renderPong);
			}
		}

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
	if (!isKeyDown && keys.includes(event.key)) {
		socket.send(JSON.stringify({ 'type': event.type, 'key': event.key }));
		isKeyDown = true;
	}
}
function handleKeyUp(event) {
	if (keys.includes(event.key)) {
		socket.send(JSON.stringify({ 'type': event.type, 'key': event.key }));
		isKeyDown = false;
	}
}

function renderPong() {
	Game.ctx.fillStyle = "blue";
	Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
	// console.log("GameState = ", GameState, "Game =", Game);

	drawPaddle(currentGameState.paddle1[0], currentGameState.paddle1[1]);
	drawPaddle(currentGameState.paddle2[0], currentGameState.paddle2[1]);
	drawBall(currentGameState.ball[0], currentGameState.ball[1]);
	drawScores(currentGameState.score[0], currentGameState.score[1]);
	
	requestAnimationFrame(renderPong);
}
