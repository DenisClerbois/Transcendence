const socket = new WebSocket("wss://" + window.location.host + "/ws/lobby/");
let PlayersReady = 0;
let ready = false;

socket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    let playerList = document.getElementById("players");
    let newPlayer = data["player"];
    let action = data["action"];
    playerList.innerHTML = "";
    if (!action) {
        data.players.forEach(player => {
            const li = document.createElement("li");
            li.textContent = player;
            playerList.appendChild(li);
        });
    }
    console.log(data);
    if (newPlayer && action == "ready") {
        console.log("action = ", action);
        PlayersReady += 1;
    }
    else {
        if (data.players.length >= 2) {
            document.getElementById("start-button").disabled = false;
            document.getElementById("start-button").textContent = "Ready to Play";
        } else if (PlayersReady == 0) {
            document.getElementById("start-button").disabled = true;
            document.getElementById("start-button").textContent = "Waiting For Players...";
        }
    }
    console.log("receive", newPlayer, PlayersReady);

};

document.getElementById("start-button").addEventListener("click", function () {
    console.log("click");
    if (PlayersReady < 2 && !ready) {
        PlayersReady += 1;
        console.log("click", PlayersReady);
        ready = true;
        socket.send(JSON.stringify({ action: "ready" }))
    }
});
if (PlayersReady >= 2) {
    PlayersReady -= 1;
    console.log("coucoucocuocucoucou");
    window.location.href = "/pong/";
}
