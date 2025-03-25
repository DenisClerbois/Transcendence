document.querySelector('#chat-name-input').focus();
document.querySelector('#chat-name-input').onkeyup = function(e) {
    if (e.key === 'Enter') {
        document.querySelector('#chat-name-submit').click();
    }
};

document.querySelector('#chat-name-submit').onclick = function(e) {
    e.preventDefault();

    var chatName = document.querySelector('#chat-name-input').value;
    if (chatName) {
        window.history.pushState({}, "", '/chat/' + chatName + '/');
        fetchChatRoom(chatName);
    } else {
        alert("Please enter a room name.");
    }
};