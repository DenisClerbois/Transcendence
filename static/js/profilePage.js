fetchProfile(); 

/**
 * FETCH USER PROFILE DATA FROM BACKEND
 */
async function fetchProfile() {
    try {
        console.log("E");
        const response = await fetch('/api/profile');
        console.log("F");
        if (!response.ok) {
            throw new Error('Failed to fetch profile data.');
        }
        console.log(response);
        const data = await response.json();
        console.log(data);

        // Update profile display
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = data.email;

        // Populate edit fields (only editable ones)
        document.getElementById('usernameInput').value = data.username;
        document.getElementById('emailInput').value = data.email;

    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

/**
 * SWITCH TO EDIT MODE
 */
function editProfile() {
    document.getElementById('profile-display').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
}

/**
 * SWITCH BACK TO DISPLAY MODE WITHOUT SAVING
 */
function cancelEdit() {
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-display').style.display = 'block';
}

/**
 * SEND UPDATED PROFILE DATA TO BACKEND
 */
async function saveProfile() {
    const usernameInput = document.getElementById('usernameInput').value;
    const emailInput = document.getElementById('emailInput').value;

    try {
        const response = await fetch('/api/profileUpdate/', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: new URLSearchParams({
                'username': usernameInput,
                'email': emailInput
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Update displayed profile
            document.getElementById('username').textContent = data.username;
            document.getElementById('email').textContent = data.email;
            // Return to display mode
            cancelEdit();
        } else {
            alertNonModal(data.error || "An error occurred.");
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}
