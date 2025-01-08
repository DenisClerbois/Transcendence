
// debug console.log("Script loaded");

const routes = {
	"/home":"/static/templates/home.html",
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html",
	"/pong":"/static/templates/pong.html"
}

// Function to handle navigation
function route(event) {
	event = event || window.event;
	event.preventDefault();

	var url = event.target.href; // get the url from the clicked event
	window.history.pushState({}, "", url); // update the window url
	handlelocation();
}

function loadScript(src) {
	const script = document.createElement("script");

    script.src = src;
    script.type = "text/javascript";
    script.onload = () => console.log("Script loaded:", src);
    document.body.appendChild(script);
}

async function handlelocation() {
	const path = window.location.pathname;
	const route = routes[path]; // if not found : 404 missing
	const html = await fetch(route).then((data) => data.text()); // protection on fetch missing
	document.getElementById("app").innerHTML = html;
	if (path === "/pong") {
        loadScript("/static/js/pong.js"); // Adjust the path if necessary
    }
}

window.onpopstate = handlelocation;
window.route = route;

handlelocation();