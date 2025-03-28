const Game = {
	canvas: null,
	ctx: null,
	paddleSize: null,
	ballRadius: null,
	players: null,
	// menuOverlay: null,
	// pauseMenu: null,
	// paused: false,
}

// GAME LOGIC //
function drawPaddle(x, y, vert) {
	let width;
	let height;
	if (vert){
		width = Game.paddleSize.width
		height = Game.paddleSize.height
	}
	else{
		width = Game.paddleSize.height
		height = Game.paddleSize.width
	}
	Game.ctx.fillStyle = "white";
	Game.ctx.fillRect(x, y, width, height);
	Game.ctx.strokeStyle = "black";
	Game.ctx.lineWidth = 1;
	Game.ctx.strokeRect(x, y, width, height); // Draw the border
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
function drawScores(scores, playerNbr) {
	Game.ctx.font = "24px Arial";
	Game.ctx.fillStyle = "red";
	// console.log("score = ", scores );
	if (playerNbr == 2){
		Game.ctx.fillText(scores[0], Game.canvas.width / 4, 30);
		Game.ctx.fillText(scores[1], (Game.canvas.width * 3) / 4, 30);
	}
	else{
		Game.ctx.fillText(scores[0], 30, (Game.canvas.height / 2) - 30);
		Game.ctx.fillText(scores[1], Game.canvas.width - 30, (Game.canvas.height / 2) - 30);
		Game.ctx.fillText(scores[2], (Game.canvas.width / 2) - 30, 30);
		Game.ctx.fillText(scores[3], (Game.canvas.width / 2) - 30, Game.canvas.height - 30);

	}
}

// GAME FRONT DESIGN //
function CreateCanvas(width, height) {
	Game.canvas = document.querySelector("canvas#pong");
	Game.canvas.width = width;
	Game.canvas.height = height;
	Game.ctx = Game.canvas.getContext("2d");
}

function renderPong() {
	
	if (Game.ctx){
		Game.ctx.fillStyle = "black";
		Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
		for (let i = 0; i < Game.players; i++){
			drawPaddle(lastGameState.paddle["p" + (i + 1)][0], lastGameState.paddle["p" + (i + 1)][1], i < 2)
		}
		drawBall(lastGameState.ball[0], lastGameState.ball[1]);
		drawScores(lastGameState.score, Game.players);
		lastUpdateTime = performance.now();
	}
}

async function setPong(gameConstant) {
	window.history.pushState({}, '', '/pong');
	const response = await fetch('/static/html/pong.html');
	const html = await response.text();
	document.querySelector("div#app").innerHTML = html;
	// console.log(html);
	// runScriptsInHTML(html);
	Game.paddleSize = { width: gameConstant.paddle.width, height: gameConstant.paddle.height };
	Game.ballRadius = gameConstant.ballRadius;
	Game.players = gameConstant.players;
	// updateUI(); //specific a la page pong
	CreateCanvas(gameConstant.board.x, gameConstant.board.y);
}

// function CreateButton(innerText, padding, margin, fontSize, borderRadius, backgroundColor, color, border, cursor, boxShadow, transition) {
// 	const button = document.createElement("button");
// 	button.innerText = innerText;
// 	button.style.padding = padding;
// 	button.style.margin = margin;
// 	button.style.fontSize = fontSize;
// 	button.style.borderRadius = borderRadius;
// 	button.style.backgroundColor = backgroundColor;
// 	button.style.color = color;
// 	button.style.border = border;
// 	button.style.cursor = cursor;
// 	button.style.boxShadow = boxShadow;
// 	button.style.transition = transition;
	
// 	return button;
// }

// .button {}

// function CreateStartMenu() {
// 	// Menu
// 	Game.menuOverlay = document.createElement("div");
// 	Game.menuOverlay.id = "menuOverlay";
// 	Game.menuOverlay.style.position = "absolute";
// 	Game.menuOverlay.style.background = "linear-gradient(169deg, rgba(59,189,29,1) 15%, rgba(58,48,150,1) 85%)";
// 	Game.menuOverlay.style.display = "flex";
// 	Game.menuOverlay.style.flexDirection = "column";
// 	Game.menuOverlay.style.justifyContent = "center";
// 	Game.menuOverlay.style.alignItems = "center";
// 	Game.menuOverlay.style.zIndex = "1000";
// 	Game.menuOverlay.style.borderRadius = "20px";
// 	Game.menuOverlay.style.boxShadow = "0px 10px 30px rgba(0, 0, 0, 0.2)";
// 	Game.menuOverlay.style.padding = "30px";
// 	Game.menuOverlay.style.transition = "all 0.5s ease-in-out";

// 	// Add title
// 	const menuTitle = document.createElement("h1");
// 	menuTitle.innerText = "Select Game Mode";
// 	menuTitle.style.color = "white";
// 	menuTitle.style.fontFamily = "'Arial', sans-serif";
// 	menuTitle.style.fontSize = "48px";
// 	menuTitle.style.textShadow = "2px 2px 5px rgba(0, 0, 0, 0.7)";
// 	Game.menuOverlay.appendChild(menuTitle);

// 	// Add buttons
// 	const startButton = CreateButton("Start Game", "15px 30px", "10px", "22px", "10px", "#30967f", "white", "none", "pointer",
// 		"0px 4px 10px rgba(0, 0, 0, 0.2)", "transform 0.3s ease, background-color 0.3s ease");
// 	Game.menuOverlay.appendChild(startButton);

// 	appDiv.appendChild(Game.menuOverlay);

// 	const canvasRect = Game.canvas.getBoundingClientRect();
// 	Game.menuOverlay.style.top = `${canvasRect.top}px`;
// 	Game.menuOverlay.style.left = `${canvasRect.left}px`;
// 	Game.menuOverlay.style.width = `${canvasRect.width}px`;
// 	Game.menuOverlay.style.height = `${canvasRect.height}px`;
// }

// function CreatePauseMenu() {
// 	Game.pauseMenu = document.createElement("div");
// 	Game.pauseMenu.id = "pauseMenu";
// 	Game.pauseMenu.style.position = "absolute";
// 	Game.pauseMenu.style.top = "0";
// 	Game.pauseMenu.style.left = "0";
// 	Game.pauseMenu.style.height = `${canvas.height}px`;
// 	Game.pauseMenu.style.width = `${canvas.width}px`;
// 	Game.pauseMenu.style.top = `${canvasRect.top}px`;
// 	Game.pauseMenu.style.left = `${canvasRect.left}px`;
// 	Game.pauseMenu.style.background = "rgba(0, 0, 0, 0.5)";
// 	Game.pauseMenu.style.display = "none"; // Initially hidden
// 	Game.pauseMenu.style.justifyContent = "center";
// 	Game.pauseMenu.style.alignItems = "center";
// 	Game.pauseMenu.style.flexDirection = "column";
// 	Game.pauseMenu.style.zIndex = "2000";

// 	// Resume button
// 	const resumeButton = CreateButton("Resume Game", "15px 30px", "10px", "22px", "10px", "#4CAF50", "white", "none", "pointer", "0px 4px 10px rgba(0, 0, 0, 0.2)", "");
// 	resumeButton.addEventListener("click", () => {
// 		Game.paused = false;
// 		hidePauseMenu();
// 		//send data resume game
// 	});
// 	Game.pauseMenu.appendChild(resumeButton);

// 	const exitGameButton = CreateButton("Quit Game", "15px 30px", "10px", "22px", "10px", "#4CAF50", "white", "none", "pointer", "0px 4px 10px rgba(0, 0, 0, 0.2)", "");
// 	exitGameButton.addEventListener("click", () => {
// 		Game.paused = false;
// 		hidePauseMenu();
// 		//send data quit game 
// 	});
// 	Game.pauseMenu.appendChild(exitGameButton);
// }



// export { Game, CreateCanvas, drawBall, drawPaddle, drawScores }