function initializeTictactoe() {
	console.log("init Tic tac toe");

	const appDiv = document.getElementById("app");
	let canvas = document.getElementById("tictactoeCanvas");
	if (!canvas && window.location.pathname === "/tictactoe") {
		canvas = document.createElement("canvas");
		canvas.id = "tictactoeCanvas";
		canvas.width = 700;
		canvas.height = 700;
		appDiv.appendChild(canvas);
	}
	if (!canvas) {
		console.error("Canvas not found or failed to initialize.");
		return;
	}
	console.log(canvas);
	const ctx = canvas.getContext("2d");
	const boardSize = 3;
	let turns = 0;
	const cellSize = canvas.width / boardSize;
	let board = Array.from(Array(boardSize), () => Array(boardSize).fill(null));
	let currentPlayer = 'X';
	
	function drawBoard() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		
		// Draw grid lines
		for (let i = 1; i < boardSize; i++) {
			// Vertical lines
			ctx.moveTo(i * cellSize, 0);
			ctx.lineTo(i * cellSize, canvas.height);
			
			// Horizontal lines
			ctx.moveTo(0, i * cellSize);
			ctx.lineTo(canvas.width, i * cellSize);
		}
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.stroke();
		
		// Draw marks
		for (let row = 0; row < boardSize; row++) {
			for (let col = 0; col < boardSize; col++) {
				if (board[row][col]) {
					ctx.font = "48px sans-serif";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText(board[row][col], col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
				}
			}
		}
	}
	
	canvas.addEventListener("click", (event) => {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const col = Math.floor(x / cellSize);
		const row = Math.floor(y / cellSize);
		
		if (board[row][col]) return; // Cell already filled
		
		// Mark
		board[row][col] = currentPlayer;

		turns++;
		if (checkWinner()) {
			alert(currentPlayer + " wins!");
			resetBoard();
		}
		else if (turns >= 9) {
			alert("Draw !");
			resetBoard();
		}
		else {
			// Switch players
			currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
		}
		
		drawBoard();
	});
	
	function checkWinner() {
		// Check rows, columns, and diagonals
		for (let i = 0; i < boardSize; i++) {
			if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return true;
			if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return true;
		}
		if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return true;
		if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return true;
		return false;
	}
	
	// Function to reset the board
	function resetBoard() {
		board = Array.from(Array(boardSize), () => Array(boardSize).fill(null));
		currentPlayer = 'X';
		turns = 0;
		drawBoard();
	}

	// Draw the initial empty board
	drawBoard();
}

if (window.location.pathname === "/tictactoe") { // Not neccessary, you can just call initialize directly
	initializeTictactoe();
}

// I think useless
// Optional: expose initializePong for router.js to call directly
window.initializeTictactoe = initializeTictactoe;




