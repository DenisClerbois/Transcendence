



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

/**
 * handle both login & register
 * POSSIBLE PATH : /api/login/, /api/register/
 * 
 * Client-side validation of form ? Js can be pass...
 * Server side has to be done
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
 */
// I TOUGHT :  If our script was directly added to index.html like router.js, it woudn't apply to this html.
// BUT : if you linked it to an existing element (like the body part) it will !!
document.body.addEventListener('click', function(event) {
    if (event.target && event.target.matches('button.connexion')) {
        connexion(event.target.dataset.path);
    }
});

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
	const handler = connexionStatusHandlers[response.status];
	if (handler)
    	handler();
	else
		console.log(`BUUG: Unhandled status: ${response.status}`);
}

// const profileStatusHandlers = {
//     200: () => { /* Handle success */ 
// 	},
//     401: () => { /* Handle unauthorized */
// 		alertNonModal('You should connect first.');
// 		window.history.pushState({}, "", '/login');
// 		fetchBody();
// 	},
//     500: () => { /* Handle server error */
// 		alertNonModal('Server error.');
// 	},
// };

document.body.addEventListener('click', function(event) {
	if (event.target && event.target.matches('button.logout'))
		logout();
	});
async function logout(){
	const response = await fetch('https://localhost:8443/api/user/log_out/');
	window.history.pushState({}, "", '/');
	fetchBody();
}
