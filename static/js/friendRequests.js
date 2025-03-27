
async function insertFriendRequests() {
    const response = await fetch("api/social/inFriendRequests/", {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error fetching incoming friend requests');
        return ;
    }
    const data = await response.json();
    let html = "<div class='row header'><p>Friend requests</p></div>"
    for (const requestId of Object.keys(data)) {
        let row = `<div class="row request">
            <div class="col-8">${data[requestId]} sent you a friend request</div>
            <input type="button" class="col-2 accept-btn" value="Accept" data-request-id="${requestId}">
            <input type="button" class="col-2 reject-btn" value="Reject" data-request-id="${requestId}">
        </div>`
        html += row;
    }
    document.querySelector("div#friendRequests").innerHTML = html;

    // Add event listeners after the HTML is inserted
    const acceptButtons = document.querySelectorAll('.accept-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');

    acceptButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const requestId = event.target.getAttribute('data-request-id');
            let status = await acceptFriendRequest(requestId);
            // console.log(`acceptation status=${status}`)
            if (status == 200) {
                event.target.closest('.row.request').remove();
            }
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const requestId = event.target.getAttribute('data-request-id');
            let status = await rejectFriendRequest(requestId);
            // console.log(`rejection status=${status}`)
            if (status == 200) {
                event.target.closest('.row.request').remove();
            }
        });
    });
}

async function sendFriendRequest(to_user) {
    const response = await fetch(`/api/social/invite/${to_user}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error sending friend request');
    }
    return response.status;
}

async function acceptFriendRequest(requestId) {
    const response = await fetch(`/api/social/accept/${requestId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error accepting friend request');
    }
    return response.status;
}

async function rejectFriendRequest(requestId) {
    const response = await fetch(`/api/social/reject/${requestId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error rejecting friend request');
    }
    return response.status;
}

async function removeFriend(to_user) {
    const response = await fetch(`/api/social/remove/${to_user}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error removing friend');
    }
    return response.status;
}