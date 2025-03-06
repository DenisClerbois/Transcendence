console.log("pong script loaded");
const appDiv = document.getElementById("app");

const Game = {
	canvas: null,
	ctx: null,
	// menuOverlay: null,
	paddleSize: null,
	ballRadius: null,
};

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

function CreateButton(innerText, padding, margin, fontSize, borderRadius, backgroundColor, color, border, cursor, boxShadow, transition) {
	const button = document.createElement("button");
	button.innerText = innerText;
	button.style.padding = padding;
	button.style.margin = margin;
	button.style.fontSize = fontSize;
	button.style.borderRadius = borderRadius;
	button.style.backgroundColor = backgroundColor;
	button.style.color = color;
	button.style.border = border;
	button.style.cursor = cursor;
	button.style.boxShadow = boxShadow;
	button.style.transition = transition;

	return button;
}

/*function CreateMenu() {
	// Menu
	Game.menuOverlay = document.createElement("div");
	Game.menuOverlay.id = "menuOverlay";
	Game.menuOverlay.style.position = "absolute";
	Game.menuOverlay.style.background = "linear-gradient(169deg, rgba(59,189,29,1) 15%, rgba(58,48,150,1) 85%)";
	Game.menuOverlay.style.display = "flex";
	Game.menuOverlay.style.flexDirection = "column";
	Game.menuOverlay.style.justifyContent = "center";
	Game.menuOverlay.style.alignItems = "center";
	Game.menuOverlay.style.zIndex = "1000";
	Game.menuOverlay.style.borderRadius = "20px";
	Game.menuOverlay.style.boxShadow = "0px 10px 30px rgba(0, 0, 0, 0.2)";
	Game.menuOverlay.style.padding = "30px";
	Game.menuOverlay.style.transition = "all 0.5s ease-in-out";

	// Add title
	const menuTitle = document.createElement("h1");
	menuTitle.innerText = "Select Game Mode";
	menuTitle.style.color = "white";
	menuTitle.style.fontFamily = "'Arial', sans-serif";
	menuTitle.style.fontSize = "48px";
	menuTitle.style.textShadow = "2px 2px 5px rgba(0, 0, 0, 0.7)";
	Game.menuOverlay.appendChild(menuTitle);

	// Add buttons
	const startButton = CreateButton("Start Game", "15px 30px", "10px", "22px", "10px", "#30967f", "white", "none", "pointer",
		"0px 4px 10px rgba(0, 0, 0, 0.2)", "transform 0.3s ease, background-color 0.3s ease");
	Game.menuOverlay.appendChild(startButton);

	appDiv.appendChild(Game.menuOverlay);
	
	const canvasRect = canvas.getBoundingClientRect();
	Game.menuOverlay.style.top = `${canvasRect.top}px`;
	Game.menuOverlay.style.left = `${canvasRect.left}px`;
	Game.menuOverlay.style.width = `${canvasRect.width}px`;
	Game.menuOverlay.style.height = `${canvasRect.height}px`;
}

//event listeners to buttons
Game.menuOverlay.startButton.addEventListener("click", () => {
	startGame();
});

// Start the game after selecting a mode
function startGame() {
	// Remove menu
	Game.menuOverlay.remove();

	// Start the game loop
	gameLoop();
}

// Game Variables
const paddleWidth = 12;
const paddleHeight = 100;
const ballRadius = 10;

// Paddle Positions
// const player1 = { ID: "player1", x: 0, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "white" };
// const player2 = { ID: "player2", x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "white" };

const backgroundColor = "#332890";

let time = Date.now();
*/
// Draw Paddle
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

let paused = false;
let gameStarted = false;

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && gameStarted) {
		paused = !paused;
		if (paused) {
			showPauseMenu();
		} else {
			hidePauseMenu();
			gameLoop();
		}
	}
});

// pause menu overlay
/*
const pauseMenu = document.createElement("div");
pauseMenu.id = "pauseMenu";
pauseMenu.style.position = "absolute";
pauseMenu.style.top = "0";
pauseMenu.style.left = "0";
pauseMenu.style.height = `${canvas.height}px`;
pauseMenu.style.width = `${canvas.width}px`;
pauseMenu.style.top = `${canvasRect.top}px`;
pauseMenu.style.left = `${canvasRect.left}px`;
pauseMenu.style.background = "rgba(0, 0, 0, 0.5)";
pauseMenu.style.display = "none"; // Initially hidden
pauseMenu.style.justifyContent = "center";
pauseMenu.style.alignItems = "center";
pauseMenu.style.flexDirection = "column";
pauseMenu.style.zIndex = "2000";

// Resume button
const resumeButton = document.createElement("button");
resumeButton.innerText = "Resume Game";
resumeButton.style.padding = "15px 30px";
resumeButton.style.margin = "10px";
resumeButton.style.fontSize = "22px";
resumeButton.style.borderRadius = "10px";
resumeButton.style.backgroundColor = "#4CAF50";
resumeButton.style.color = "white";
resumeButton.style.border = "none";
resumeButton.style.cursor = "pointer";
resumeButton.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
resumeButton.addEventListener("click", () => {
	paused = false;
	hidePauseMenu();
	gameLoop(); // Resume game loop
});

// New game button
// const newGameButton = document.createElement("button");
// newGameButton.innerText = "New Game";
// newGameButton.style.padding = "15px 30px";
// newGameButton.style.margin = "10px";
// newGameButton.style.fontSize = "22px";
// newGameButton.style.borderRadius = "10px";
// newGameButton.style.backgroundColor = "#f44336";
// newGameButton.style.color = "white";
// newGameButton.style.border = "none";
// newGameButton.style.cursor = "pointer";
// newGameButton.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
// newGameButton.addEventListener("click", () => {
// 	paused = false;
// 	hidePauseMenu();
// 	player1.score = 0;
// 	player2.score = 0;
// 	resetBall();
// 	gameLoop();
// });

// Append buttons to the pause menu
pauseMenu.appendChild(resumeButton);
// pauseMenu.appendChild(newGameButton);

// Append the pause menu to the body
document.body.appendChild(pauseMenu);

// Show the pause menu
function showPauseMenu() {
	pauseMenu.style.display = "flex"; // Show menu
	cancelAnimationFrame(gameLoop); // Stop the game loop
}

// Hide the pause menu
function hidePauseMenu() {
	pauseMenu.style.display = "none"; // Hide menu
}
*/
/*
// Start the game
function gameLoop() {

	if (paused) return;
	gameStarted = true;
	Game.ctx.fillStyle = backgroundColor;
	Game.ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawPaddle(player1.x, player1.y, player1.color);
	drawPaddle(player2.x, player2.y, player2.color);
	drawBall();
	drawScores();
	// if (AI)
	// 	moveIA();
	// movePaddles();
	// moveBall();

	if ((player1.score >= 11 || player2.score >= 11) && Math.abs(player1.score - player2.score) > 1) {
		ball.dx = 0; ball.dy = 0;
		Game.ctx.font = "24px Arial";
		Game.ctx.fillStyle = "darkred";
		if (player1.score >= 11)
			Game.ctx.fillText("Player 1 Won!", canvas.width / 2, canvas.height / 2);
		else
			Game.ctx.fillText("Player 2 Won!", canvas.width / 2 - 80, canvas.height / 2);
		cancelAnimationFrame(gameLoop);
	}
	requestAnimationFrame(gameLoop);
}
*/
export {CreateCanvas, Game, drawBall, drawPaddle, drawScores};