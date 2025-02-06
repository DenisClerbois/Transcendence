const routes = {
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html",
	"/pong":"/static/templates/pong.html",
	"/shifumi":"/static/templates/shifumi.html",
	"/":"/static/templates/login.html",
	"/profile":"/static/templates/profile.html",
}

function route(event) {
	console.log(event);
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
	try {
		const route = routes[window.location.pathname] || '/login'; // change login with 404
		const response = await fetch(route);

		if (!response.ok)
			throw new Error(`${response.status}`);
		const html = await response.text();
		document.querySelector("div#app").innerHTML = html;
		runScriptsInHTML(html);
	} catch (error) {
		console.error(`${error}`);
	}
}

//  document.querySelectorAll('a.nav-link').forEach( function(link) {
//   	link.addEventListener("click", route);
//   });
window.onpopstate = fetchBody;
updateNavbar();
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
