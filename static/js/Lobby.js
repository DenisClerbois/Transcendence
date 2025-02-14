const socket = new WebSocket("wss://" + window.location.host + "/ws/lobby/");
let ready = false;

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

document.getElementById("start-button").addEventListener("click", function () {
    if (!ready) {
        ready = true;
        socket.send(JSON.stringify({action: "ready"}));
    }
});