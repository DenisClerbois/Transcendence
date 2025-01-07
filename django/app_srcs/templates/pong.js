const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game Variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

// Paddle Positions
const player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "black" };
const player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0, color: "black" };

// Ball Position and Speed
const ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 2.5, dy: 2.5 };

// Background Color
const backgroundColor = "#9b826c";

// Player Movement
const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

document.addEventListener("keydown", (e) => {
  if (e.key in keys) keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// Draw Paddle
function drawPaddle(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
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
    adjustBallAngle(player1);
    ball.dx = Math.abs(ball.dx); // Ensure ball moves right
  } else if (
    ball.x + ballRadius > player2.x &&
    ball.y > player2.y &&
    ball.y < player2.y + paddleHeight
  ) {
    adjustBallAngle(player2);
    ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
  }

  // Ball out of bounds
  if (ball.x - ballRadius < 0) {
    player2.score++;
    resetBall();
  } else if (ball.x + ballRadius > canvas.width) {
    player1.score++;
    resetBall();
  }
}

// Adjust Ball Angle Based on Paddle Hit Position
function adjustBallAngle(paddle) {
  const paddleCenter = paddle.y + paddleHeight / 2;
  const hitPosition = ball.y - paddleCenter;
  const maxBounceAngle = Math.PI / 4; // 45 degrees
  const bounceAngle = (hitPosition / (paddleHeight / 2)) * maxBounceAngle;

  const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  ball.dx = speed * Math.cos(bounceAngle);
  ball.dy = speed * Math.sin(bounceAngle);
}

// Reset Ball to Center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
}

// Move Paddles
function movePaddles() {
  if (keys.w && player1.y > 0) player1.y -= 6;
  if (keys.s && player1.y < canvas.height - paddleHeight) player1.y += 6;
  if (keys.ArrowUp && player2.y > 0) player2.y -= 6;
  if (keys.ArrowDown && player2.y < canvas.height - paddleHeight) player2.y += 6;
}

// Game Loop
function gameLoop() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPaddle(player1.x, player1.y, player1.color);
  drawPaddle(player2.x, player2.y, player2.color);
  drawBall();
  drawScores();

  movePaddles();
  moveBall();

  requestAnimationFrame(gameLoop);
}

// Start the Game
gameLoop();
