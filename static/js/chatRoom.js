var chatLog = document.querySelector('#chat-log');


var receiver_idRaw = sessionStorage.getItem("chatName");
console.log("Raw chatName:", receiver_idRaw);

var receiver_id = JSON.parse(receiver_idRaw);
console.log("Parsed chatName:", receiver_id);

if (window.chatSocket) {
    window.chatSocket.close();
}
var chatSocket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/chat/'
    + receiver_id
    + '/'
);


chatSocket.onopen = function(event) {
    console.log("WebSocket connection established");
}

chatSocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    console.log(data);
    var messageElement = document.createElement('div');
    messageElement.innerText = data.message;
    messageElement.classList.add('message');
    console.log(data.sender_id);
    console.log(receiver_id);
    if (data.sender_id != receiver_id) {
        messageElement.classList.add('user');
    } else {
        messageElement.classList.add('receiver');
    }
    chatLog.appendChild(messageElement);
    console.log(`Message reçu de ${data.sender}: ${data.message}`);
};

function sendMessage(message) {
    chatSocket.send(JSON.stringify({ message: message }));
}

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

chatSocket.onerror = function(error) {
    console.error("WebSocket error:", error);
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    var messageInputDom = document.querySelector('#chat-message-input');
    var message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
};