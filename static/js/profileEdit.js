//Avoid redeclaration by checking if already defined in global scope
if (!window.user_modifiables) {
    //django/userManagementApp/views.py
    //static/html/profile.html
    window.user_modifiables = ["username", "email", "nickname"];
    window.user_constants = ["id"];
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
    document.getElementById('profile-display').hidden = !document.getElementById('profile-display').hidden;
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
    document.getElementById('profilePic').src = "media/profile_pictures/default_cute.png";
}

function preDelete() {
    img_delete_request = true;
    img_upload_request = false;
    setDefaultPic();
}