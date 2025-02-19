let ready;
let socket;

function InitWebsocketLobby() {
	socket = new WebSocket("wss://" + window.location.host + "/ws/home/");
	socket.onopen = function(e) {
		console.log("Connected to the game server");
	};

	socket.onclose = function(e) {
		console.log("Disconnected from the server");
		socket = null;
	};
	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);

		if (data.action === "redirect") {
			window.location.href = "/pong/";
			return; // Exit function early to avoid errors
		}

		const playerList = document.getElementById("players");
		const startButton = document.getElementById("start-button");

		playerList.innerHTML = "";
		data.players.forEach(player => {
			const li = document.createElement("li");
			li.textContent = player;
			playerList.appendChild(li);
		});

		document.getElementById("Connected").innerHTML = `Players Connected: ${data.players.length}`;
		document.getElementById("ReadyCount").innerHTML = `Players Ready: ${data.ready_count}`;

		if (data.players.length >= 2) {
			startButton.disabled = false;
			startButton.textContent = "Ready to Play";
		} else {
			startButton.disabled = true;
			startButton.textContent = "Waiting for players...";
		}

		if (data.action === "redirect") {
			window.location.href = "/pong";
		}
	};
}

document.getElementById("start-button").addEventListener("click", function () {
	if (!ready) {
		ready = true;
		socket.send(JSON.stringify({ action: "ready" }));
	}
});

async function InitMatchmaking() {
	ready = false;
	if (!socket)
		InitWebsocketLobby();

	
}

if (window.location.pathname == "/home")
	InitMatchmaking()

//NEW DESIGN IDEA

/*  Home page > matchmaking button
	if matchmaking button click
		player put on the list
	if playerList >= 2
		redirect two player to /pong or /lobby
	|
	->  from there send to pongLobby data of the players or create Lobby and link players to it?
		Pong/Lobby.js take info from json or other to get player info and create websocket to link the 2 players
	So Matchmaking Websoket only take a list of ReadyPlayer (or PlayerList) and pop in or out the names/info

*/

//END IDEA




/*const socket = new WebSocket("wss://" + window.location.host + "/ws/lobby/");
let ready = false;

// Fetch lobby data from backend API every 5 seconds
async function fetchLobbyData() {
	try {
		const response = await fetch("/api/lobby/");
		const data = await response.json();
		updateLobbyUI(data.players, data.ready_count);
	} catch (error) {
		console.error("Failed to fetch lobby data", error);
	}
}

// Update the UI with player list and button state
function updateLobbyUI(players, readyCount) {
	const playerList = document.getElementById("players");
	const startButton = document.getElementById("start-button");

	playerList.innerHTML = "";
	players.forEach(player => {
		const li = document.createElement("li");
		li.textContent = player.username + (player.ready ? " ✅" : " ❌"); // Show ready status
		playerList.appendChild(li);
	});

	document.getElementById("Connected").innerHTML = `Players Connected: ${players.length}`;
	document.getElementById("ReadyCount").innerHTML = `Players Ready: ${readyCount}`;

	if (players.length >= 2) {
		startButton.disabled = false;
		startButton.textContent = "Ready to Play";
	} else {
		startButton.disabled = true;
		startButton.textContent = "Waiting for players...";
	}
}

// Handle WebSocket messages for real-time updates
socket.onmessage = function (event) {
	const data = JSON.parse(event.data);

	if (data.action === "redirect") {
		window.location.href = "/pong/";
		return; // Exit function early to avoid errors
	}

	if (data.players.length === 0) {
		console.warn("No players received from WebSocket!");
	}
    
	updateLobbyUI(data.players, data.ready_count);
};

// Handle clicking the "Ready" button
document.getElementById("start-button").addEventListener("click", function () {
	if (!ready) {
		ready = true;
		socket.send(JSON.stringify({ action: "ready" }));
	}
});

// Fetch lobby data periodically for stability
setInterval(fetchLobbyData, 5000);*/