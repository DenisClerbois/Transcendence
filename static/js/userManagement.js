/* HTML EVENT MANAGEMENT */
document.body.addEventListener('click', function(event) {
	if (event.target && event.target.matches('button.connexion'))
		connexion(event.target.dataset.path);
	if (event.target && event.target.matches('button.logout'))
		logout();
});

// create dic obj to match status code to function.
const connexionStatusHandlers = {
    200: () => { /* Handle success */ 
		window.history.pushState({}, "", '/home');
		fetchBody();
	},
    401: () => { /* Handle unauthorized */
		alertNonModal('Connexion failed.');
	},
    500: () => { /* Handle server error */
		alertNonModal('Server error.');
	},
};

async function connexion(path) {
	console.log(path);
	var formData = new FormData(document.querySelector('form'));
	let obj = {};
	formData.forEach((value, key) => {
		obj[key] = value;
	})
	const response = await fetch(`https://localhost:8443${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCsrfToken(),
		},
		body: JSON.stringify(obj),
	});
	console.log(response);
	const handler = connexionStatusHandlers[response.status];
	if (handler)
    	handler();
	else
		console.log(`BUUG: Unhandled status: ${response.status}`);
}

async function logout(){
	const response = await fetch('https://localhost:8443/api/user/logout/');
	window.history.pushState({}, "", '/');
	fetchBody();
}

function getCsrfToken() {
    let csrfToken = document.cookie.match(/csrftoken=([\w-]+)/);
    return csrfToken ? csrfToken[1] : null;
}
