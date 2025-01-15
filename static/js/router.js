const routes = {
	"/home":"/static/templates/home.html",
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html",
	"/pong":"/static/templates/pong.html",
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
