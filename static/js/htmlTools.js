
// loginButton triggered on "Enter" keypress
document.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        const loginButton = document.querySelector("button.connexion");
        if (loginButton && document.body.contains(loginButton)) {
            event.preventDefault();
            loginButton.click();
        }
    }
});

document.addEventListener("input", function (event) {
    let formField = event.target.closest(".form-control"); if (!formField) return;
    event.target.classList.remove('input-error');
    let errMsgObj = formField.closest('label').querySelector('.form-error-msg'); if (!errMsgObj) return;
    errMsgObj.style.display = "none"
});

// // getProfilePic
// async function fetchProfilePic() {
//     try {
//         const response = await fetch('/api/user/getProfilePicPath/');
//         if (!response.ok) throw new Error("Not authenticated");

//         const data = await response.json();
//         if (data.path != null) {
//             document.querySelector("#profile-pic").src = data.path;
//         }
//     } catch (error) {
//         console.log("User not logged in. Using default avatar.");
//     }
// }

// Ensure profile image is updated on page load
// fetchProfilePic();

