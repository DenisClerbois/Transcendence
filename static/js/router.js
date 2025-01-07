
// debug console.log("Script loaded");

const routes = {
	"/home":"/static/templates/home.html",
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html"
}

// Function to handle navigation
function route(event) {
	event = event || window.event;
	event.preventDefault();

	var url = event.target.href; // get the url from the clicked event
	window.history.pushState({}, "", url); // update the window url
	handlelocation();
}

async function handlelocation() {
	const path = window.location.pathname;
	const route = routes[path]; // if not found : 404 missing
	const html = await fetch(route).then((data) => data.text()); // protection on fetch missing
	document.getElementById("app").innerHTML = html;
}

window.onpopstate = handlelocation;
window.route = route;

handlelocation();