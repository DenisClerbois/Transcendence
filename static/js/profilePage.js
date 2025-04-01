//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "nickname"];
    window.user_constants = ["id", "wins", "losses", "ratio"];
    window.user_variables = [...window.user_modifiables, ...window.user_constants];
}

function updateHtml(data) {
    let displayElems = document.getElementsByClassName('display');
    for (const key of user_variables) {
        let dispElem = displayElems.namedItem(key);
        if (dispElem) {dispElem.textContent = data[key] ? data[key] : dispElem.textContent;}
    }
}

async function fetchProfile() {
    var url = Object.keys(window.routeParams).length ?
        `/api/user/profile/${window.routeParams.userId.toString()}/`
        : '/api/user/profile/';
    const response = await fetch(url);
    if (!response.ok) {
        console.error('Error fetching profile:', error);
        return;
    }
    const data = await response.json();
    updateHtml(data);
    if (data && data.id)
        setProfilePic(data.id);
}

async function fetchProfilePicUrl(userId) {
    const response = await fetch(`/api/user/getProfilePic/${userId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            'Cache-Control': 'no-store'
        }
    });
    return response;
}

async function setProfilePic(userId) {
    const response = await fetchProfilePicUrl(userId);
    if (response.ok) {
        const data = await response.json();
        img = document.getElementById('profilePic')
        if (data.profile_picture_url != null) {
            img.src = data.profile_picture_url;
        }
        else {
            img.src = '/media/profile_pictures/default_cute.png'
        }
    }
    // else {
    //     console.log(response);
    // }
}

async function fetchGames() {
    const response = await fetch('api/gameStats/getGames/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error(response);
        console.error('Error fetching game stats');
        return;
    }
    const data = await response.json();
    return data;
}

async function saveFakeGame() {
    const response = await fetch('api/gameStats/saveFakeGame/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        }
    })
    if (!response.ok) {
        console.error('Error faking it');
        return;
    }
    const data = await response.json();
    console.log(await data);
    return data;
}

// async function insertGameHistoryRows() {
//     const data = await fetchGames();
//     let html = ""
//     for (const gameId of Object.keys(data)) {
//         let row = `
//         <div class="col">
//             <div class="card stats-card win">
//                 <div class="card-body">
//                     <div class="d-flex justify-content-between align-items-center">
//                         <h5 class="card-title">vs. PlayerXYZ</h5>
//                         <span class="badge bg-success">WIN</span>
//                     </div>
//                     <p class="card-text">March 30, 2025 • Ranked Match</p>
//                     <div class="d-flex justify-content-between">
//                         <small class="text-muted">Score: 5-3</small>
//                         <small class="text-muted">Duration: 24 min</small>
//                     </div>
//                 </div>
//             </div>
//         </div>`
//         html += row;
//     }
//     document.querySelector("div#gameHistoryList").innerHTML = html;
// }

fetchProfile();
// insertGameHistoryRows();
