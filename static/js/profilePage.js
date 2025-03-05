//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "teeth_length", "nickname"];
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
        headers:  { 'Content-Type': 'application/json' },
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
fetchProfile();