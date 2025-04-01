//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "nickname"];
    window.user_constants = ["id", "wins", "losses", "ratio"];
    window.user_variables = [...window.user_modifiables, ...window.user_constants];
}

var img_delete_request = false;
var img_upload_request = false;
var selectedImageFile = null;

document.querySelector("button.switchDisplay").addEventListener("click", switchDisplay);
document.querySelector("button.switchEdit").addEventListener("click", switchToEdit);
document.querySelector("button.save").addEventListener("click", saveProfile)

document.querySelector("input.uploadProfilePic").addEventListener("change", preUpload);
document.querySelector("button.deleteProfilePic").addEventListener("click", preDelete);

function switchToEdit() {
    setFormFields();
    switchDisplay();
}

function switchDisplay() {
    document.getElementById('profile-display').hidden = !document.getElementById('profile-display').closest(".row.g-2").hidden;
    document.getElementById('profile-edit').hidden = !document.getElementById('profile-edit').hidden;
    document.getElementById('profilePicInput').value='';
    selectedImageFile = null;
    //setProfilePic();
    img_delete_request = false;
    img_upload_request = false;
}

function setFormFields() {
    let displayElems = document.getElementsByClassName('display');
    let formFields =  document.getElementsByClassName('form-control');
    for (const key of user_modifiables) {
        let dispElem = displayElems.namedItem(key);
        let formField = formFields.namedItem(key);
        if (dispElem && formField) {
            formField.value = dispElem.textContent
            removeFormErrorStyle(formField);
        }
    }
}

async function saveProfile() {
    if (img_upload_request) {
        await uploadProfilePic();
    }
    else if (img_delete_request) {
        await deleteProfilePic();
    }
    //dynamic json of modified data
    let updatedData = {};
    let formFields = document.getElementsByClassName('form-control');
    let displayElems = document.getElementsByClassName('display');
    for (const key of user_modifiables) {
        let formField = formFields.namedItem(key);
        let dispElem = displayElems.namedItem(key);
        if (formField && dispElem && formField.value != dispElem.textContent) {
            updatedData[key] = formField.value;
        }
    }
    const response = await fetch('/api/user/profileUpdate/', {
        method: 'POST',
        headers:  {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(updatedData),
    });
    const data = await response.json();
    if (response.ok) {
        updateHtml(data);
        switchDisplay();
    } else {
        formErrorStyle(data);
    }
}

async function deleteProfilePic() {
    img_delete_request = false;
    const response = await fetch('/api/user/setProfilePic/', {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        },
    });
    if (!response.ok) {
        console.error('Error deleting profile picture');
        return;
    }
    // setDefaultPic();
}

async function uploadProfilePic() {
    img_upload_request = false;

    if (!selectedImageFile) return;

    const formData = new FormData();
    formData.append('image', selectedImageFile);
    
    const response = await fetch('/api/user/setProfilePic/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
        },
        body: formData
    });
    if (!response.ok) {
        console.error('Error uploading profile picture');
        return;
    }
    const data = await response.json();
    document.getElementById('profilePic').src = data.profile_picture_url;
    selectedImageFile = null;
}

function preUpload() {
    var preview = document.getElementById('profilePic');
    var file    = document.getElementById('profilePicInput').files[0];
    if (file) {
        selectedImageFile = file;
        var reader  = new FileReader();
        reader.onloadend = function () {
          preview.src = reader.result;
        }
        reader.readAsDataURL(file);
        img_upload_request = true;
        img_delete_request = false;
    } else {
        // If dialog was canceled, keep any previously selected file
        if (selectedImageFile) {
            // Re-create the FileList with the previously selected file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(selectedImageFile);
            fileInput.files = dataTransfer.files;
        }
    }
}

function setDefaultPic() {
    document.getElementById('profilePic').src = "/media/profile_pictures/default_cute.png";
}

function preDelete() {
    img_delete_request = true;
    img_upload_request = false;
    setDefaultPic();
}

async function insertFriendRows() {
    const friends = await fetchFriends();
    const onlineFriends = await fetchOnlineFriends();
    let html = "<div class='row header'><p>Friends</p></div>"
    for (const userId of Object.keys(await friends)) {
        let statusBadge = await onlineFriends[userId]
            ? '<span class="badge bg-success ms-2">Online</span>'
            : '<span class="badge bg-secondary ms-2">Offline</span>';
        let row = `
        <div class="row friend-row g-1" data-user-id="${userId}" data-user-name="${friends[userId]}">
            <div class="col-4 d-flex align-items-center">
                <a href="/profile/${userId}">
                    Player ${userId}#${friends[userId]}
                </a>
                ${statusBadge}
            </div>
            <div class="col-4 d-flex align-items-center">
                <button class="btn btn-outline-primary me-2 game-btn">Play</button>
                <button class="btn btn-outline-secondary chat-btn">Chat</button>
            </div>
             <div class="col d-flex align-items-center">
                <button class="btn btn-outline-primary btn-outline-danger remove-friend">Remove friend</button>
                <button class="btn btn-outline-secondary btn-outline-danger block-friend">💀</button>
            </div>
        </div>`
        html += row;
    }
    document.querySelector(`div#profileFriendsList`).innerHTML = html;

    document.querySelector('div#profileFriendsList').addEventListener('click', async (event) => {
        const row = event.target.closest('.friend-row');
        const userId = row.getAttribute('data-user-id');
        const userName = row.getAttribute('data-user-name');

        if (event.target.matches('.game-btn')) {
            console.log(`Start game with ${userId}`);
        }
        
        if (event.target.matches('.chat-btn')) {
            console.log(`Chat with ${userId}`);
        }
        
        if (event.target.matches('.remove-friend')) {
            const confirmRemove = confirm(`Remove friend ${userId}?`);
            if (confirmRemove) {
                let response = await removeFriend(userId);
                if (await response.ok) {
                    console.log(`Removed friend ${userId}`);
                    row.remove();
                }
            }
        }
        if (event.target.matches('.block-friend')) {
            const confirmRemove = confirm(`Block friend ${userId}?`);
            if (confirmRemove) {
                let response = await blockUser(userId);
                if (await response.ok) {
                    row.remove();
                    console.log(`Removed friend ${userId}`);
                }
            }
        }
    });
}

//TEMPORARY?
async function insertBlockedUserRows() {
    const foes = await fetchBlockedUsers();
    let html = "<div class='row header'><p>Blocked Users</p></div>"
    for (const userId of Object.keys(await foes)) {
        let row = `
        <div class="row blocked-user-row g-1" data-user-id="${userId}" data-user-name="${foes[userId]}">
            <div class="col-6 d-flex align-items-center">
                <a href="/profile/${userId}">
                    Player ${userId}#${foes[userId]}
                </a>
            </div>
             <div class="col d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-outline-danger unblock-user">Unblock 🐦‍🔥</button>
            </div>
        </div>`
        html += row;
    }
    document.querySelector(`div#blockedUsersList`).innerHTML = html;

    document.querySelector('div#blockedUsersList').addEventListener('click', async (event) => {
        const row = event.target.closest('.blocked-user-row');
        const userId = row.dataset.userId;
        const userName = row.dataset.userName;

        if (event.target.matches('.unblock-user')) {
            const confirmRemove = confirm(`Unblock user ${userId}?`);
            if (confirmRemove) {
                let response = await unblockUser(userId);
                if (response.ok) {
                    console.log(`Unblock user ${userId}`);
                    row.remove();
                }
                else
                    console.log(`Failed to unblock user ${userId}`);
            }
        }
    });
}


insertFriendRequests();
insertFriendRows();
insertBlockedUserRows();