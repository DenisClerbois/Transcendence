async function insertPlayerRows() {
    const data = await fetchOnlineStrangers();
    let html = "<div class='row header'><p>Onine Players</p></div>"
    for (const userId of Object.keys(data)) {
        let row = `<div class="row player">
            <div class="col-8 d-flex align-items-center">Player ${userId}#${data[userId]}<span class='badge bg-success ms-2'>Online</span></div>
            <button class="col-4 btn btn-outline-primary invite-btn" data-player-id="${userId}">Send friend invite</button>
        </div>`
        html += row;
    }
    document.querySelector("div#onlineUsersList").innerHTML = html;

    // Add event listeners after the HTML is inserted
    const friendInviteButton = document.querySelectorAll('.invite-btn');
    const gameInviteButton = document.querySelectorAll('.game-btn');

    friendInviteButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            const userId = event.target.getAttribute('data-player-id');
            let status = await sendFriendRequest(userId);
            if (status == 200) {
                event.target.closest('.invite-btn').hidden = true;
            }
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
    const friends = await fetchFriends();
    const onlineFriends = await fetchOnlineFriends();
    let html = "<div class='row header'><p>Friends</p></div>"
    for (const userId of Object.keys(friends)) {
        let statusBadge = await onlineFriends[userId]
            ? '<span class="badge bg-success ms-2">Online</span>'
            : '<span class="badge bg-secondary ms-2">Offline</span>';
        let row = `
        <div class="row player friend">
            <div class="col-8 d-flex align-items-center">
                Player ${userId}#${friends[userId]}
                ${statusBadge}
            </div>
            <button class="col-2 btn btn-outline-primary game-btn" data-player-id="${userId}">Play</button>
            <button class="col-2 btn btn-outline-secondary chat-btn" data-player-id="${userId}">Chat</button>
        </div>`
        html += row;
    }
    document.querySelector(`div#friendsList`).innerHTML = html;

    // Add event listeners after the HTML is inserted
    const chatInviteButton = document.querySelectorAll('.chat-btn');
    const gameInviteButton = document.querySelectorAll('.game-btn');

    chatInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            //LORENZO
            //lance ton chat depuis ici
            const userId = event.target.getAttribute('data-player-id');
            //fetchProfile() pour choper user id
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