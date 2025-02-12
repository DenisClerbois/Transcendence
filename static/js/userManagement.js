



// create dic to match status code to function.
const statusHandlers = {
    200: () => { /* Handle success */ 
		window.history.pushState({}, "", '/home');
		document.querySelector('div.public').style.display= 'none';
		document.querySelector('div.private').style.display= 'block';
		fetchBody();
	},
    401: () => { /* Handle unauthorized */
		alert('Connexion failed.');
	},
    500: () => { /* Handle server error */
		alert('Server error.');
	},
};


/**
 * handle both login & register
 * POSSIBLE PATH : /api/login/, /api/register/
 * 
 * Client-side validation of form ? Js can be pass...
 * Server side has to be done
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
 */
async function connexion(path) {
	var formData = new FormData(document.querySelector('form'));
	let obj = {};
	formData.forEach((value, key) => {
		obj[key] = value;
	})
	const response = await fetch(`https://localhost:8443${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// 'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify(obj),
	});
	const handler = statusHandlers[response.status];
	if (handler)
    	handler();
	else
		console.log(`Unhandled status: ${response.status}`);
}


// I TOUGHT :  If our script was directly added to index.html like router.js, it woudn't apply to this html.
// BUT : if you linked it to an existing element (like the body part) it will !!
document.body.addEventListener('click', function(event) {
    if (event.target && event.target.matches('button.connexion')) {
        connexion(event.target.dataset.path);
    }
});


// async function apiUser(){
// 	try {
// 		const response = await fetch('/api/getProfile', {
// 			method: 'GET',
// 			credentials: 'same-origin',
// 		});
// 		const data = await response.json();
// 		console.log(data);
// 		document.querySelector('p.username').textContent = `Username : ${data.username}`
// 		document.querySelector('p.email').textContent = `Email : ${data.email}`
// 	} catch (error) {
// 		console.log(error);
// 	}
// }


async function logout(){
	const response = await fetch('https://localhost:8443/api/logout/');
	window.history.pushState({}, "", '/login');
	fetchBody();
	document.querySelector('div.public').style.display= 'block';
	document.querySelector('div.private').style.display= 'none';
}

document.body.addEventListener('click', function(event) {
if (event.target && event.target.matches('button.logout'))
	logout();
});