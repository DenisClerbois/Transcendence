const routes_auth_required = {
	"/profile":"/static/html/profile.html",
	"/home":"/static/html/home.html",
	"/lobby":"/static/html/lobby.html"
	// "/tictactoe":"/static/html/tictactoe.html",
	// "/leaderbord":"/static/html/leaderbord.html",
}

const routes_free_access = {
	"/pong":"/static/notUse/pong.html",
	"/login":"/static/html/login.html",
	"/":"/static/html/login.html",
	"/register":"/static/html/register.html",
}

const routes = {...routes_auth_required,
				...routes_free_access}

function route(event) {
	event.preventDefault();
	var url = event.target.href;
	window.history.pushState({}, "", url);
	fetchBody();
}

/* Load and execute any script find in the html template */
function runScriptsInHTML(html) {
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;

	const scripts = tempDiv.querySelectorAll('script');
	scripts.forEach(script => {
		const newScript = document.createElement('script');
		if (script.src)
			newScript.src = script.src; // External script
		else
			newScript.innerHTML = script.innerHTML; // Inline script

		document.body.appendChild(newScript);
	});
}

async function fetchBody() {
	const route = routes[window.location.pathname] || '/static/html/404.html';
	const response = await fetch(route);
	if (window.location.pathname == '/profile')
		apiUser();
	const html = await response.text();
	document.querySelector("div#app").innerHTML = html;
	runScriptsInHTML(html);
}

document.body.querySelectorAll('a').forEach( function(link) {
	link.addEventListener("click", route);
});
window.onpopstate = fetchBody; // Back/forward button
fetchBody();



// function AddAlert(message){
// 	const app = document.querySelector('div#app');
// 	let alert = app.querySelector('.alert');
// 	if (alert) {
// 		alert.remove();
// 	}
// 	alert = document.createElement('div');
// 	alert.classList.add('alert', 'alert-light'); // Bootstrap class
// 	alert.textContent = message;
// 	app.appendChild(alert);
// }


async function auth() {
	const response = await fetch('/api/checkUserAuthenticated/');
	return response.ok ? true : false;
}

// async function updateNavbar() {
// 	const isAuthenticated = await checkIfAuthenticated();
// 	const publicLinks = document.querySelectorAll('li.nav-item.public');

// 	publicLinks.forEach(link => {
// 		if (isAuthenticated)
// 			link.style.display = 'none';
// 		else
// 			link.style.display = 'inline';
// 	});

// 	const privateLinks = document.querySelectorAll('li.nav-item.private');
// 	privateLinks.forEach(link => {
// 		if (isAuthenticated)
// 			link.style.display = 'inline';
// 		else
// 			link.style.display = 'none';
// 	});
// }
