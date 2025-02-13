const socket = new WebSocket("wss://"+ window.location.host +"/ws/lobby/");
let PlayersReady = 0;
let ready = false;

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const playerList = document.getElementById("players");
    const newPlayer = data["player"];
    const action = data["action"];
    playerList.innerHTML = "";
    data.players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player;
        playerList.appendChild(li);
    });

    if (newPlayer && action == "ready"){
        PlayersReady += 1;
    }
    if (data.players.length >= 2) {
        document.getElementById("start-button").disabled = false;
        document.getElementById("start-button").textContent = "Ready to Play";
    } else if (PlayersReady == 0){
        document.getElementById("start-button").disabled = true;
        document.getElementById("start-button").textContent = "Waiting For Players...";
    }
};

document.getElementById("start-button").addEventListener("click", function() {
    if (PlayersReady < 2){
        PlayersReady += 1;
        ready = true;
        socket.send(JSON.stringify({player: socket.scope["user"].username, action: "ready"}))
    }
});
if (PlayersReady == 2){
    PlayersReady -= 1;
    window.location.href = "/pong/";
}
