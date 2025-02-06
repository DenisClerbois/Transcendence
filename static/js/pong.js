console.log("pong script loaded");

function initializePong() {
	
	const appDiv = document.getElementById("app");

	let canvas = document.getElementById("pongCanvas");
	if (!canvas && window.location.pathname === "/pong") {
		canvas = document.createElement("canvas");
		canvas.id = "pongCanvas";
		canvas.width = 1000;
		canvas.height = 500;
		console.log("test");
		appDiv.appendChild(canvas);
	}

	if (!canvas) {
		console.error("Canvas not found or failed to initialize.");
		return;
	}
	console.log(canvas);
	const ctx = canvas.getContext("2d");

	// Menu
	const menuOverlay = document.createElement("div");
	menuOverlay.id = "menuOverlay";
	appDiv.appendChild(menuOverlay);

	// Add title
	const menuTitle = document.createElement("h1");
	menuTitle.innerText = "Select Game Mode";
	menuTitle.style.color = "white";
	menuOverlay.appendChild(menuTitle);

	// Add buttons
	const playVsAIButton = document.createElement("button");
	playVsAIButton.innerText = "Play Against AI";
	menuOverlay.appendChild(playVsAIButton);

	const playLocalButton = document.createElement("button");
	playLocalButton.innerText = "Two Players Local";
	menuOverlay.appendChild(playLocalButton);


	const canvasRect = canvas.getBoundingClientRect();
	menuOverlay.style.top = `${canvasRect.top}px`;
	menuOverlay.style.left = `${canvasRect.left}px`;
	menuOverlay.style.width = `${canvasRect.width}px`;
	menuOverlay.style.height = `${canvasRect.height}px`;

	// pause menu overlay
	const pauseMenu = document.createElement("div");
	pauseMenu.id = "pauseMenu";
	pauseMenu.style.height = `${canvas.height}px`;
	pauseMenu.style.width = `${canvas.width}px`;
	pauseMenu.style.top = `${canvasRect.top}px`;
	pauseMenu.style.left = `${canvasRect.left}px`;

	// Resume button
	const resumeButton = document.createElement("button");
	resumeButton.innerText = "Resume Game";
	resumeButton.addEventListener("click", () => {
		paused = false;
		hidePauseMenu();
		gameLoop(); // Resume game loop
	});

	// New game button
	const newGameButton = document.createElement("button");
	newGameButton.innerText = "New Game";
	newGameButton.addEventListener("click", () => {
		paused = false;
		hidePauseMenu();
		player1.score = 0;
		player2.score = 0;
		resetBall();
		gameLoop();
	});
	pauseMenu.appendChild(resumeButton);
	pauseMenu.appendChild(newGameButton);
	document.body.appendChild(pauseMenu);

	//event listeners to buttons
	playVsAIButton.addEventListener("click", () => {
		AI = true;
		startGame();
	});

	playLocalButton.addEventListener("click", () => {
		AI = false;
		startGame();
	});

	// Start the game after selecting a mode
	function startGame() {
		menuOverlay.remove();
		gameLoop();
	}

	// Game Variables
	const paddleWidth = 12;
	const paddleHeight = 100;
	const ballRadius = 10;

	// Paddle Positions
	const player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "white" };
	const player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "white" };
	let AI = true;

	// Ball Position and Speed
	let SpeedIncrease = 0;
	const InitSpeed = {dx: 7, dy: 0};
	const ball = { x: canvas.width / 2, y: canvas.height / 2, dx: InitSpeed.dx, dy: InitSpeed.dy };
	const paddleSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2) * 1.4;
	const backgroundColor = "#332890";
	const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };
	let time = Date.now();
	let prevPos = { x: canvas.width / 2, y: canvas.height / 2, dx: InitSpeed.dx, dy: InitSpeed.dy };

	document.addEventListener("keydown", (e) => {
		// if (AI && e.keys == ArrowDown)
		if (e.key in keys) keys[e.key] = true;
	});

	document.addEventListener("keyup", (e) => {
		if (e.key in keys) keys[e.key] = false;
	});

	// Draw Paddle
	function drawPaddle(x, y, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, paddleWidth, paddleHeight);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, paddleWidth, paddleHeight);
	}

	// Draw Ball
	function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

	// Draw Scores
	function drawScores() {
		ctx.font = "24px Arial";
		ctx.fillStyle = "white";
		ctx.fillText(player1.score, canvas.width / 4, 30);
		ctx.fillText(player2.score, (canvas.width * 3) / 4, 30);
	}

	// Update Ball Position
	function moveBall() {
		ball.x += ball.dx;
		ball.y += ball.dy;

		// Ball collision with top and bottom walls
		if (ball.y - ballRadius < 0 || ball.y + ballRadius > canvas.height) {
			ball.dy *= -1;
		}

		// Ball collision with paddles
		if (
			ball.x - ballRadius < player1.x + paddleWidth &&
			ball.y > player1.y &&
			ball.y < player1.y + paddleHeight
		) {
			if (keys.s || keys.w){ //increase speed by 10% if player move the paddle at the same time as it is hit
				if (Math.sqrt(ball.dx **2 + ball.dy **2) < 40){
				ball.dx *= 1.1;
				ball.dy *= 1.1;
				SpeedIncrease += 1;}
			}
			adjustBallAngle(player1);
			ball.dx = Math.abs(ball.dx); // Ensure ball moves right
		} else if (
			ball.x + ballRadius > player2.x &&
			ball.y > player2.y &&
			ball.y < player2.y + paddleHeight
		) {
			if (keys.ArrowUp || keys.ArrowDown){ //increase speed by 10% if player move the paddle at the same time as it is hit
				if (Math.sqrt(ball.dx **2 + ball.dy **2) < 40){
				ball.dx *= 1.1;
				ball.dy *= 1.1;
				SpeedIncrease += 1;}
			}
			adjustBallAngle(player2);
			ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
		}

		// Ball out of bounds
		if (ball.x - ballRadius < 0 && !(player1.y <= ball.y && player1.y + 100 >= ball.y)) { // condition added to check if paddle present or not
			player2.score++;
			//paused = true;
			resetBall();
		} else if (ball.x + ballRadius > canvas.width && !(player2.y <= ball.y && player2.y + 100 >= ball.y)) {
			player1.score++;
			//paused = true;
			resetBall();
		}
	}

	// Paddle Hit
	function adjustBallAngle(paddle) {
		const paddleCenter = paddle.y + paddleHeight / 2;
		const hitPosition = ball.y - paddleCenter;
		const maxBounceAngle = Math.PI / 4; // 45 degrees
		const bounceAngle = (hitPosition / (paddleHeight / 2)) * maxBounceAngle;

		const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
		ball.dx = speed * Math.cos(bounceAngle);
		ball.dy = speed * Math.sin(bounceAngle);
	}

	function resetBall() {

		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.dx = 0;
		ball.dy = 0;
		
		setTimeout(() => {
			ball.dx = (Math.random() > 0.5 ? 1 : -1) * InitSpeed.dx;
			ball.dy = (Math.random() > 0.5 ? 1 : -1) * InitSpeed.dy;
			SpeedIncrease = 0; 
		}, 500);
		
	}

	function movePaddles() {
		if (keys.w && player1.y > 0) player1.y -= paddleSpeed;
		if (keys.s && player1.y < canvas.height - paddleHeight) player1.y += paddleSpeed;
		if (AI && (keys.ArrowDown || keys.ArrowUp) && prevPos.y > player2.y && prevPos.y < player2.y + 100){
			keys.ArrowDown = false;
			keys.ArrowUp = false;}
		if (keys.ArrowUp && player2.y > 0) player2.y -= paddleSpeed;
		if (keys.ArrowDown && player2.y < canvas.height - paddleHeight) player2.y += paddleSpeed;
	}

	function adjustPos(newVal, speed, lim) {
		let tmp = 0;
		let dif = 0;

		tmp = newVal + speed;
		dif = lim - tmp;
		newVal = lim + (dif * 0.8);
		return newVal;
	}

	function checkMalusCondition(newBall) {
		if (!SpeedIncrease && newBall.dx > 0 && ball.x >= canvas.width / 2)
			return true;
		else if (SpeedIncrease < 3 && newBall.dx > 0 && ball.x >= canvas.width / 3)
			return true;
		else if (SpeedIncrease && newBall.dx > 0)
			return true;
		return false;
	}

	function calculateNextPos() {
		let malus;
		const newBall = {x : ball.x, y : ball.y, dx : ball.dx, dy : ball.dy};
		let tmp = 0;
		if (!checkMalusCondition(newBall))
			newBall.y = ball.y;
		else if (newBall.x <= canvas.width - (10 + newBall.dx + 1)  && checkMalusCondition(newBall)){
			while (newBall.x <= canvas.width - (10 + newBall.dx + 1)  && newBall.x >= 0) {
				if (newBall.x + newBall.dx > 10)
					newBall.x += newBall.dx;
				else {
					tmp = adjustPos(newBall.x, newBall.dx, 10);
					newBall.x = tmp;
					newBall.dx *= -1;
				}
				if (newBall.y + newBall.dy >= 0 && newBall.y + newBall.dy <= canvas.height)
					newBall.y += newBall.dy;
				else {
					if (newBall.y + newBall.dy < 0)
						tmp = adjustPos(newBall.y, newBall.dy, 0);
					else
						tmp = adjustPos(newBall.y, newBall.dy, canvas.height);
					newBall.y = tmp;
					newBall.dy *= -1;
				}
			}
		}
			if (newBall.y < player2.y + 1){
				keys.ArrowDown = false;
				keys.ArrowUp = true;}
			else if (newBall.y > player2.y + 9){
				keys.ArrowDown = true;
				keys.ArrowUp = false;}
			else{
				keys.ArrowDown = false;
				keys.ArrowUp = false;}
			prevPos = newBall;
	}

	function moveIA() {
		let now = Date.now();

		if (now - time <= 1000)
			return;
		time = now;
		calculateNextPos();
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

	// Show the pause menu
	function showPauseMenu() {
		pauseMenu.style.display = "flex";
		cancelAnimationFrame(gameLoop); // Stop the game loop
	}

	function hidePauseMenu() {
		pauseMenu.style.display = "none";
	}

		function gameLoop() {

			if (paused) return;
			gameStarted = true;
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		
			drawPaddle(player1.x, player1.y, player1.color);
			drawPaddle(player2.x, player2.y, player2.color);
			drawBall();
			drawScores();
			if (AI)
				moveIA();
			movePaddles();
			moveBall();
			
			if ((player1.score >= 11 || player2.score >= 11) && Math.abs(player1.score - player2.score) > 1){
				ball.dx = 0; ball.dy = 0;
				ctx.font = "24px Arial";
				ctx.fillStyle = "darkred";
				if (player1.score >= 11)
					ctx.fillText("Player 1 Won!", canvas.width / 2, canvas.height / 2);
				else
					ctx.fillText("Player 2 Won!", canvas.width / 2 - 80, canvas.height / 2);
				cancelAnimationFrame(gameLoop);
			}
			requestAnimationFrame(gameLoop);
		}
}

// Check if route is `/pong` and initialize the game
if (window.location.pathname === "/pong") {
	initializePong();
}

// Optional: expose initializePong for router.js to call directly
window.initializePong = initializePong;
