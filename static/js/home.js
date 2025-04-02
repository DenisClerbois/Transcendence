async function insertPlayerRows() {
    const data = await fetchOnlineStrangers();
    let html = "<div class='row header'><p>Online Players</p></div>"
    for (const userId of Object.keys(data)) {
        let row = `<div class="row player">
            <div class="col-8 d-flex align-items-center">
                <a href="/profile/${userId}">
                    Player ${userId}#${data[userId]}
                    <span class='badge bg-success ms-2'>Online</span>
                </a>
            </div>
            <div class="col-4" d-flex align-items-center">
                <button class="col btn btn-outline-primary invite-btn" data-player-id="${userId}">Send friend invite</button>
            </div>
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
            else if (status == 301) {
                event.target.classList.add("btn-outline-danger"); //pas sur du comportement
                event.target.innerHTML = 'This user has blocked you 🦧';
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
                <a href="/profile/${userId}">
                    Player ${userId}#${friends[userId]}
                </a>
                ${statusBadge}
            </div>
            <div class="col-4 d-flex align-items-center">
                <button class="btn btn-outline-primary game-btn" data-player-id="${userId}">Play</button>
                <button class="btn btn-outline-secondary chat-btn" data-player-id="${userId}">Chat</button>
            </div>
        </div>`
        html += row;
    }
    document.querySelector(`div#friendsList`).innerHTML = html;

    // Add event listeners after the HTML is inserted
    const chatInviteButton = document.querySelectorAll('.chat-btn');
    const gameInviteButton = document.querySelectorAll('.game-btn');

    chatInviteButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('data-player-id');
            if (userId) {
                fetchChatRoom(userId);
                } else {
                    console.error("User ID not found");
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

insertFriendRows();
insertPlayerRows();