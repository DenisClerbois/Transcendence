document.body.addEventListener('click', function(event) {
	if (event.target && event.target.matches('button.matchmaking')) {
		console.log(">>> " + event.target.dataset.path);
		// redirect(event.target.dataset.path);
		window.location.pathname = '/lobby';
	}
});

// async function redirect(path) {
// 	// var formData = new FormData(document.querySelector('form'));
// 	// let obj = {};
// 	// formData.forEach((value, key) => {
// 	// 	obj[key] = value;
// 	// })
// 	const response = await fetch(`https://localhost:8443/lobby`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			// 'X-CSRFToken': csrfToken,
// 		},
// 		// body: JSON.stringify(obj),
// 	});
// 	const handler = statusHandlers[response.status];
// 	if (handler)
//     	handler();
// 	else
// 		console.log(`Unhandled status: ${response.status}`);
// }


// // I TOUGHT :  If our script was directly added to index.html like router.js, it woudn't apply to this html.
// // BUT : if you linked it to an existing element (like the body part) it will !!