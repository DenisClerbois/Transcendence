const appDiv = document.getElementById("app");

const Game = {
	canvas: null,
	ctx: null,
	paddleSize: null,
	ballRadius: null
}

function CreateCanvas() {
	Game.canvas = document.getElementById("pongCanvas");
	if (!Game.canvas) {
		Game.canvas = document.createElement("canvas");
		Game.canvas.id = "pongCanvas";
		Game.canvas.width = 1000;
		Game.canvas.height = 500;
		appDiv.innerHTML = ""; // Clear existing content
		appDiv.appendChild(Game.canvas);
	}
	
	if (!Game.canvas) {
		console.error("Canvas not found or failed to initialize.");
		return;
	}

	console.log(Game.canvas);
	Game.ctx = Game.canvas.getContext("2d");
}

function drawPaddle(x, y) {
	Game.ctx.fillStyle = "white";
	Game.ctx.fillRect(x, y, Game.paddleSize.width, Game.paddleSize.height);
	Game.ctx.strokeStyle = "black";
    Game.ctx.lineWidth = 1;
    Game.ctx.strokeRect(x, y, Game.paddleSize.width, Game.paddleSize.height); // Draw the border
}

// Draw Ball
function drawBall(x, y) {
	Game.ctx.beginPath();
	Game.ctx.arc(x, y, Game.ballRadius, 0, Math.PI * 2);
	Game.ctx.fillStyle = "white";
	Game.ctx.fill();
	Game.ctx.closePath();
}

// Draw Scores
function drawScores(player1, player2) {
	Game.ctx.font = "24px Arial";
	Game.ctx.fillStyle = "white";
	Game.ctx.fillText(player1, Game.canvas.width / 4, 30);
	Game.ctx.fillText(player2, (Game.canvas.width * 3) / 4, 30);
}

export {Game, CreateCanvas, drawBall, drawPaddle, drawScores}