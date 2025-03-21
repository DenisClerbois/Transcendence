document.querySelector('#chat-name-input').focus();
document.querySelector('#chat-name-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // Appuyer sur Entrée
        document.querySelector('#chat-name-submit').click();
    }
};

document.querySelector('#chat-name-submit').onclick = function(e) {
    e.preventDefault();  // Empêche le comportement par défaut du bouton

    var chatName = document.querySelector('#chat-name-input').value;
    if (chatName) {  // Vérifie que le nom de la room n'est pas vide
        // Utilise ta fonction de routage
        window.history.pushState({}, "", '/chat/' + chatName + '/');
        fetchChatRoom(chatName); // Appelle ta fonction pour charger la room
    } else {
        alert("Please enter a room name."); // Alerte si le champ est vide
    }
};