
async function fetchOnlinePlayers() {
    const response = await fetch('api/social/getOnlinePlayers', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error fetching online players');
        return ;
    }
    const data = await response.json();
    return data;
}

async function fetchOnlineStrangers() {
    const response = await fetch('api/social/getOnlineStrangers', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error fetching online players');
        return ;
    }
    const data = await response.json();
    return data;
}

async function fetchOnlineFriends() {
    const response = await fetch('api/social/getOnlineFriends', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error fetching online friends');
        return ;
    }
    const data = await response.json();
    return data;
} 


async function fetchFriends() {
    const response = await fetch('api/social/getFriends', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error fetching friends');
        return ;
    }
    const data = await response.json();
    return data;
} 


async function insertPlayerRows() {
    const data = await fetchOnlineStrangers();
    let html = "<div class='row header'><p>Online Players</p></div>"
    for (const userId of Object.keys(data)) {
        let row = `<div class="row player">
            <div class="col-8">Player ${userId}#${data[userId]}</div>
            <input type="button" class="col-2 game-btn" value="Play" data-player-id="${userId}">
            <input type="button" class="col-2 invite-btn" value="Send friend invite" data-player-id="${userId}">
        </div>`
        html += row;
    }
    document.querySelector("div#onlineUsersList").innerHTML = html;

    // Add event listeners after the HTML is inserted
    const friendInviteButton = document.querySelectorAll('.invite-btn');
    const gameInviteButton = document.querySelectorAll('.game-btn');

    friendInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-player-id');
            sendFriendRequest(userId);
        });
    });

    gameInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-player-id');
            console.log(`trying to start game with player ${userId}`);
        });
    });
}

async function insertFriendRows() {
    const data = await fetchOnlineFriends();
    let html = "<div class='row header'><p>Online Friends</p></div>"
    for (const userId of Object.keys(data)) {
        let row = `<div class="row player friend">
            <div class="col-8">Player ${userId}#${data[userId]}</div>
            <input type="button" class="col-2 game-btn" value="Play" data-player-id="${userId}">
            <input type="button" class="col-2 chat-btn" value="Chat" data-player-id="${userId}">
        </div>`
        html += row;
    }
    document.querySelector("div#friendsList").innerHTML = html;

    // Add event listeners after the HTML is inserted
    const chatInviteButton = document.querySelectorAll('.chat-btn');
    const gameInviteButton = document.querySelectorAll('.game-btn');

    chatInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-player-id');
            sendFriendRequest(userId);
        });
    });

    gameInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-player-id');
            console.log(`trying to start game with player ${userId}`);
        });
    });
}

insertFriendRows();
insertPlayerRows();