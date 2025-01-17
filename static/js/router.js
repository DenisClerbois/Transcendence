const routes = {
	"/home":"/static/templates/home.html",
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html",
	"/pong":"/static/templates/pong.html",
	"/shifumi":"/static/templates/shifumi.html",
	"/":"/static/templates/login.html",
	"/logout":"/static/templates/logout.html",
}

function route(event) {
	event.preventDefault();
	var url = event.target.href;
	window.history.pushState({}, "", url);
	fetchBody();
}
// Looks nicer
// async function fetchRoute(route){
// 	switch (route) {
// 		case '/pong':
// 			return loadPong();
// 		default:
// 			return fetchBody(); 
// 	}
// }

async function fetchBody() {
	const route = routes[window.location.pathname];

	// Handle `/pong` route separately
	if (window.location.pathname === "/pong") {
		const appDiv = document.querySelector("div#app");
		if (!document.getElementById("pongCanvas")) {
			// Create canvas if not already present
			const canvas = document.createElement("canvas");
			canvas.id = "pongCanvas";
			canvas.width = 1000;
			canvas.height = 500;
			appDiv.innerHTML = ""; // Clear content before appending canvas
			appDiv.appendChild(canvas);
		}

		// Initialize the game using the function from pong.js
		if (typeof window.initializePong === "function") {
			window.initializePong();
		}
		return;
	}
	else if (window.location.pathname === "/shifumi") {
		const appDiv = document.querySelector("div#app");
		appDiv.innerHTML = "";

		if (typeof window.initializeShifumi === "function") {
			window.initializeShifumi();
		}
		return;
	}
	

	// Default behavior for other routes
	try {
		const response = await fetch(route);
		if (!response.ok) throw new Error(`${response.status}`);
		const html = await response.text();
		document.querySelector("div#app").innerHTML = html;
	} catch (error) {
		console.error(`${error}`);
	}
}


document.querySelectorAll('a.nav-link').forEach( function(link) {
	link.addEventListener("click", route);
});
window.onpopstate = fetchBody;

fetchBody();

function AddAlert(message){
	const app = document.querySelector('div#app');
	let alert = app.querySelector('.alert');
	if (alert) {
		alert.remove();
	}
	alert = document.createElement('div');
	alert.classList.add('alert', 'alert-light'); // Bootstrap class
	alert.textContent = message;
	app.appendChild(alert);
}

async function fetchLogin(event) {
	event.preventDefault();
	var formData = new FormData(document.querySelector('form'));
	const username = formData.get("username");
	const password = formData.get("password");

	// const cookies = 
	// console.log(document.cookie);

	try {
		const response = await fetch('https://localhost:8443/api/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// 'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({username: username,password: password}),
		});
		if (!response.ok){
			AddAlert('Error on login. Try again.')
			document.querySelector("Form").reset();
		}
		else {
			window.history.pushState({}, "", '/home');
			fetchBody();
			updateNavbar();
		}
	}
	catch (error) {
		console.error(`${error}`); // Useless ?
	}
}


async function checkIfAuthenticated() {
	try {
		const response = await fetch('/api/checkUserAuthenticated/', {
			method: 'GET',
			credentials: 'same-origin'
		});
		if (response.ok)
			return true;
		else
			return false;
	} 
	catch (error) {
		console.error("Error checking authentication:", error);
		return false;
	}
}


async function fetchLogout(event){
	event.preventDefault();
	try {
		const response = await fetch('https://localhost:8443/api/logout/', {
			method: 'GET',
			credentials: 'same-origin',
		});
		if (!response.ok){
			AddAlert('ALERT, this should never happen !');
		}
		window.history.pushState({}, "", '/login');
		fetchBody();
		updateNavbar();
		console.log('logout success.');
	}
	catch (error) {
		console.error(`${error}`); // Useless ?
	}
}

document.addEventListener('click', function(event) {
	if (event.target && event.target.classList.contains('login'))
		fetchLogin(event);
	if (event.target && event.target.classList.contains('logout'))
		fetchLogout(event);
	if (event.target && event.target.classList.contains('Register'))
		fetchRegister(event);
})


window.onload = function() {
	updateNavbar();
};


async function updateNavbar() {
	const isAuthenticated = await checkIfAuthenticated();
	const publicLinks = document.querySelectorAll('li.nav-item.public');

	publicLinks.forEach(link => {
		if (isAuthenticated)
			link.style.display = 'none';
		else
			link.style.display = 'inline';
	});

	const privateLinks = document.querySelectorAll('li.nav-item.private');
	privateLinks.forEach(link => {
		if (isAuthenticated)
			link.style.display = 'inline';
		else
			link.style.display = 'none';
	});
}


function AlertAndClean(message) {
	AddAlert(message);
}


// Client-side validation of form (Server side should also be done)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
async function fetchRegister(event) {
	event.preventDefault();
	
	const regex_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	const regex_password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

	var formData = new FormData(document.querySelector('form'));
	
	const email = formData.get("email");
	const email_confirmed = formData.get("email confirmation");
	const username = formData.get("username");
	const password = formData.get("password");
	const password_confirmed = formData.get("password confirmation");
	
	if (!regex_email.exec(email))
		return AddAlert('Error : Email syntax not respected.');
	if (email != email_confirmed)
		return AddAlert('Error : Emails different.');
	if (!username)
		return AddAlert('Error : Username empty.');
	if (!regex_password.exec(password))
		return AddAlert('Error : Password syntax not respected.');
	if (password != password_confirmed)
		return AddAlert('Error : Passwords different.');

	try {
		const response = await fetch('https://localhost:8443/api/register/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// 'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({email:email, username: username,password: password}),
		});
		if (!response.ok){
			AddAlert('Error on Register. Try again.')
			document.querySelector("Form").reset();
		}
		else {
			window.history.pushState({}, "", '/home');
			fetchBody();
			updateNavbar();
		}
	}
	catch (error) {
		console.error(`${error}`); // Useless ?
	}
}
