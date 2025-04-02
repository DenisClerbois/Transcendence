var chatLog = document.querySelector('#chat-log');


var userId_raw = sessionStorage.getItem("userId");

var userId = JSON.parse(userId_raw);

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

chatSocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var messageElement = document.createElement('div');
    messageElement.innerText = data.message;
    messageElement.classList.add('message');
    if (data.sender_id != userId) {
        messageElement.classList.add('user');
    } else {
        messageElement.classList.add('receiver');
    }
    chatLog.appendChild(messageElement);
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