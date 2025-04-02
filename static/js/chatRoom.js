var chatLog = document.querySelector('#chat-log');


var userId_raw = sessionStorage.getItem("userId");
console.log("Raw userId:", userId_raw);

var userId = JSON.parse(userId_raw);
console.log("Parsed userId:", userId);

if (window.chatSocket) {
    window.chatSocket.close();
}
var chatSocket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/chat/'
    + userId
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
    console.log(userId);
    if (data.sender_id != userId) {
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