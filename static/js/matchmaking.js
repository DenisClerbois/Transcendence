import { CreateCanvas, Game, drawBall, drawPaddle, drawScores } from './PongFunctions.js'

let socket = null;
let isKeyDown = false;
let keys = ['ArrowUp', 'ArrowDown'];
let lastGameState = null;
let currentGameState = null;
let lastUpdateTime = performance.now();

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
			currentGameState = data_json['gameState'].message;
			lastGameState = currentGameState;
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

function showPauseMenu() {
    Game.pauseMenu.style.display = "flex"; // Show menu
    cancelAnimationFrame(renderPong); // Stop the game loop
}

// Hide the pause menu
function hidePauseMenu() {
    Game.pauseMenu.style.display = "none"; // Hide menu
}
