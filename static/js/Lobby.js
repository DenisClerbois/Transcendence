let socket;
let UserName;

// Fetch lobby data from backend API every 5 seconds
async function fetchLobbyData() {
	try {
		const response = await fetch("/api/home/");
		const data = await response.json();
		updateLobbyUI(data.players);
	} catch (error) {
		console.error("Failed to fetch lobby data", error);
	}
}

// Update the UI with player list and button state
function updateLobbyUI(players) {
	const playerList = document.getElementById("players");
	const startButton = document.getElementById("start-button");

	playerList.innerHTML = "";
	console.log(players);
	if (players){
		players.forEach(player => {
			const li = document.createElement("li");
			li.textContent = player.username + " ✅"; // Show ready status
			console.log(li.textContent);
			playerList.appendChild(li);
		});
	}

	document.getElementById("Connected").innerHTML = `Players Ready: ${players ? players.length : 0}`;

	if (socket) {
		startButton.textContent = "Cancel Matchmaking";
	}
	else {
		startButton.textContent = "Matchmaking";
	}
}

async function getUserName() {
    try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile data.');
        }
        const data = await response.json();

        // Update profile display
        return data.username;
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

// Handle WebSocket messages for real-time updates
function InitWebsocketLobby() {
	socket = new WebSocket("wss://" + window.location.host + "/ws/home/");
	socket.onopen = function(e) {
		console.log("Connected to the Matchmaking server");
	};

	socket.onclose = function(e) {
		console.log("Disconnected from the server");
		socket = null;
		updateLobbyUI([]);
	};
	socket.onmessage = async function (event) {
		const data = JSON.parse(event.data);
		console.log(data);
		if (data.players){
			if (data.players.length === 0) {
				console.warn("No players received from WebSocket!");
			}}

		if (data.sendPlayers) {
			console.log("IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIN");
			for (let i = 0; i < data.sendPlayers.length; i++){
				console.log("OUT >> self =", UserName, "sendP = ", data.sendPlayers[i].username)
				if (data.sendPlayers[i].username == UserName){
					console.log("IN >> ", data.room_id);
					sessionStorage.setItem("room_id", data.room_id);
					window.location.href = "/pong";
				}
			}
		
		}
		updateLobbyUI(data.players);
	};
}
// Handle clicking the "Ready" button
document.getElementById("start-button").addEventListener("click", function () {
	if (!socket) {
		InitWebsocketLobby();
	}
	else
		socket.close();
});

window.addEventListener("popstate", () => {
    socket.close();
});


async function InitMatchmaking() {
	UserName = await getUserName();
	console.log("Username = ", UserName);
	if (socket)
		setInterval(fetchLobbyData, 5000);
}

InitMatchmaking()