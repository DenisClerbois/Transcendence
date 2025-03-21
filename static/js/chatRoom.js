// const chatName = JSON.parse(sessionStorage.getItem("chatName"));
const chatLog = document.querySelector('#chat-log')
const receiver_idRaw = sessionStorage.getItem("chatName");
console.log("Raw chatName:", receiver_idRaw);

const receiver_id = JSON.parse(receiver_idRaw);
console.log("Parsed chatName:", receiver_id);

if (!chatLog.hasChildNodes())
{
    const emptyText = document.createElement('h3')
    emptyText.id = 'emptyText'
    emptyText.innerText = 'No messages'
    emptyText.className = 'emptyText'
    chatLog.appendChild(emptyText)
}

// const chatSocket = new WebSocket(
//     'wss://'
//     + window.location.host
//     + '/ws/chat/'
//     + chatName
//     + '/'
// );

// chatSocket.onmessage = function(e) {
//     const data = JSON.parse(e.data);
//     const messageElement = document.createElement('div')
//     messageElement.innerText = data.message
//     messageElement.className = 'message'
//     chatLog.appendChild(messageElement)

//     if (document.querySelector('#emptyText'))
//     {
//         document.querySelector('#emptyText').remove()
//     }

// };


const chatSocket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/chat/'
    + receiver_id
    + '/'
);

chatSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const messageElement = document.createElement('div');
    messageElement.innerText = data.message;
    messageElement.className = 'message';
    chatLog.appendChild(messageElement);
    console.log(`Message reçu de ${data.sender}: ${data.message}`);
    // Affiche le message dans l'UI
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
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
};