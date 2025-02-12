const socket = new WebSocket("wss://"+ window.location.host +"/ws/lobby/");

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const playerList = document.getElementById("players");
    playerList.innerHTML = "";
    data.players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player;
        playerList.appendChild(li);
    });

    if (data.players.length >= 2) {
        document.getElementById("start-button").disabled = false;
    } else {
        document.getElementById("start-button").disabled = true;
    }
};

document.getElementById("start-button").addEventListener("click", function() {
    window.location.href = "/pong/";
});
