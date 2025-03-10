//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "nickname"];
    window.user_constants = ["id"];
    window.user_variables = [...window.user_modifiables, ...window.user_constants];
}

document.querySelector("button.switchDisplay").addEventListener("click", switchDisplay);
document.querySelector("button.switchEdit").addEventListener("click", switchToEdit);
document.querySelector("button.save").addEventListener("click", saveProfile)

document.querySelector("button.uploadProfilePic").addEventListener("click", uploadProfilePic);

function switchToEdit() {
    setFormFields();
    switchDisplay();
}

function switchDisplay() {
    document.getElementById('profile-display').hidden = !document.getElementById('profile-display').hidden;
    document.getElementById('profile-edit').hidden = !document.getElementById('profile-edit').hidden;
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

function updateHtml(data) {
    let displayElems = document.getElementsByClassName('display');
    for (const key of user_variables) {
        let dispElem = displayElems.namedItem(key);
        if (dispElem) {dispElem.textContent = data[key] ? data[key] : dispElem.textContent;}
    }
}

/**
 * FETCH USER PROFILE DATA FROM BACKEND
 */
async function fetchProfile() {
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
        console.error('Error fetching profile:', error);
        return;
    }
    const data = await response.json();
    updateHtml(data);
}

async function saveProfile() {
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
    console.log(updatedData);
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

async function fetchProfilePic() {
    const response = await fetch('/api/user/getProfilePic/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        }
    });
    if (!response.ok)
        return;
    const data = await response.json();
    return data;
}

async function uploadProfilePic() {
    const fileInput = document.getElementById('profilePicInput');
    if (!fileInput.isDefaultNamespace.length) return;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

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
    return data.profile_picture_url;
}


async function setProfilePic() {
    const data = await fetchProfilePic();
    document.getElementById('profilePic').src = data.profile_picture_url;
}



fetchProfile();
setProfilePic();