const routes = {
	"/home":"/static/templates/home.html",
	"/login":"/static/templates/login.html",
	"/register":"/static/templates/register.html",
	"/pong":"/static/templates/pong.html"
}

function route(event) {
	event.preventDefault();
	var url = event.target.href;
	window.history.pushState({}, "", url);
	fetchBody();
}

async function fetchBody() {
	const route = routes[window.location.pathname];
	try {
		const response = await fetch(route);
		if (!response.ok)
			throw new Error(`${response.status}`);
		const html = await response.text();
		document.querySelector("div#app").innerHTML = html;
	}
	catch (error) {
		console.error(`${error}`);
	}
}

document.querySelectorAll('a.nav-link').forEach( function(link) {
	link.addEventListener("click", route);
});
window.onpopstate = fetchBody;

fetchBody();


// function getcookies()

async function fetchLogin(event) {
	event.preventDefault();
	var formData = new FormData(document.querySelector('form'));
	const username = formData.get("username");
	const password = formData.get("password");

	// const cookies = 
	console.log(document.cookie);

	try {
		const response = await fetch('https://localhost:8443/api/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({username: username,password: password}),
		});
		if (!response.ok)
			throw new Error(`${response.status}`);
		console.log('response=true');
	}
	catch (error) {
		console.error(`${error}`);
	}
}

document.addEventListener('click', function(event) {
	if (event.target && event.target.classList.contains('login'))
		fetchLogin(event);
})

// btn = document.querySelector('button.login');
// btn.addEventListener('click', fetchLogin);



// window.route = route;
// 	const script = document.createElement("script");

//     script.src = src;
//     script.type = "text/javascript";
//     script.onload = () => console.log("Script loaded:", src);
//     document.body.appendChild(script);
// }
// async function handlelocation() {
// 	const path = window.location.pathname;
// 	const route = routes[path]; // if not found : 404 missing
// 	const html = await fetch(route).then((data) => data.text()); // protection on fetch missing
// 	document.getElementById("app").innerHTML = html;
// 	if (path === "/pong") {
//         loadScript("/static/js/pong.js"); // Adjust the path if necessary
//     }
// }
