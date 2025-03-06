//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "teeth_length"];
    window.user_constants = ["id"];
    window.user_variables = [...window.user_modifiables, ...window.user_constants];
}

document.querySelector("button.switchDisplay").addEventListener("click", switchDisplay);
document.querySelector("button.switchEdit").addEventListener("click", switchToEdit);
document.querySelector("button.save").addEventListener("click", saveProfile)

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
    let inputElems =  document.getElementsByClassName('input');
    for (const key of user_modifiables) {
        let dispElem = displayElems.namedItem(key);
        let inputElem = inputElems.namedItem(key);
        if (dispElem && inputElem) {inputElem.value = dispElem.textContent}
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
    try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile data.');
        }
        const data = await response.json();
        updateHtml(data);

    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

async function saveProfile() {
    //dynamic json of modified data
    let updatedData = {};
    let inputElems = document.getElementsByClassName('input');
    let displayElems = document.getElementsByClassName('display');
    for (const key of user_modifiables) {
        let inElem = inputElems.namedItem(key);
        let dispElem = displayElems.namedItem(key);
        if (inElem && dispElem && inElem.value != dispElem.textContent) {
            updatedData[key] = inElem.value;
        }
    }
    const response = await fetch('/api/user/profileUpdate/', {
        method: 'POST',
        headers:  { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
    });
    const data = await response.json();

    if (response.ok) {
        updateHtml(data);
        switchDisplay();
    } else {
        errMsg = "Error:\n";
        for (const error in data) {
            errMsg += `${error}: ` + `${data[error]}`;
            errMsg += "\n";
        }
        alert(errMsg);
    }
}
fetchProfile();