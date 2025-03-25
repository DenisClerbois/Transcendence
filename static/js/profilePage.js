//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "nickname"];
    window.user_constants = ["id"];
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
        : 'api/user/profile/';
    console.log(url);
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
    console.log(`/api/user/getProfilePic/${userId}/`);
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
    console.log(userId);
    const response = await fetchProfilePicUrl(userId);
    if (response.ok) {
        const data = await response.json();
        console.log(await data);
        img = document.getElementById('profilePic')
        if (data.profile_picture_url != null)
            img.src = data.profile_picture_url;
        else
            img.src = 'media/profile_pictures/default_cute.png'
    }
    else {
        console.log(response);
    }
}

fetchProfile();
insertFriendRequests();