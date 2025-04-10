const routes_game_required = {
	"/pong":"/static/html/pong.html",
	"/waiting_room":"/static/html/waiting_room.html",
}
const routes_auth_required = {
	"/profile":"/static/html/profileEdit.html",
	"/profile/:userId": "static/html/profilePage.html",
	"/home":"/static/html/home.html",
	"/pong":"/static/html/pong.html",
	"/waiting_room":"/static/html/waiting_room.html",
	"/chatRoom": "/static/html/chatRoom.html",
	"/chat/:userId": "/static/html/chatRoom.html",
	"/tournament": "/static/html/tournament.html",

}
const routes_free_access = {
	"/":"/static/html/login.html",
	"/login":"/static/html/login.html",
	"/register":"/static/html/register.html",
}
const routes = {...routes_auth_required,
				...routes_free_access}



/**
 * LINK NAVBAR WITH UPDATING FUNCTION
 */
document.body.querySelectorAll('a').forEach( function(link) {
	link.addEventListener("click", route);
});
function route(event) {
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	fetchBody();
}

document.body.addEventListener('click', function(event) {
	if (event.target){
		if (event.target.matches('button#local-tournament')){
			window.history.pushState({}, "", '/tournament');
			fetchBody();
		}
	}
});

async function fetchChatRoom(userId) {
	const res = await fetch(`/api/chat/getRoom/${userId}/`);
    if (!res.ok) {
        console.error('Error fetching chat room');
        return;
    }
    const data = await res.json();
	console.log(data);
	const userName = data.username;
	window.history.pushState({}, "", '/chat/' + userId);
	sessionStorage.setItem("userId", JSON.stringify(userId));
	const response = await fetch("/static/html/chatRoom.html");
	const html = await response.text();
	document.querySelector("div#app").innerHTML = html;
	runScriptsInHTML(html);
	injectUserId();
	document.getElementById("chat-name").innerText = userName;
}

function injectUserId() {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
        const userIdElement = document.getElementById("chat-name");
        if (userIdElement) {
            userIdElement.textContent = userId;
        }
    }
}

/**
 * LOAD AND EXECUTE ANY SCRIPT FIND IN HTML
 */
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

/**
 * UPDATENAV CHANGE NAVBAR BY HIDDING PART OF IT
 */
function updateNav() {
	const pathInfo = getRouteMatch(window.location.pathname);
	
	if (pathInfo.route) {
		const isAuthRequired = Object.keys(routes_auth_required)
			.some(route => pathMatchesPattern(window.location.pathname, route));

		const pubElem = document.querySelector('div.public');
		const priElem = document.querySelector('div.private');

		if (pubElem && priElem) {
			pubElem.hidden = isAuthRequired;
			priElem.hidden = !isAuthRequired;
		} else {
			console.log('BUG: no public or private div.');
		}
	}
}


/**
 * USE ALERTNONMODAL TO ADD A NON MODAL (= NON BLOCKING) POPUP WITH SPECIFIC ALERT MESSAGE.
 */
const closeButton = document.querySelector("dialog button");
const popup = document.querySelector('dialog');
if (!closeButton || !popup)
	console.log('BUG: dialog button not found..');
closeButton.addEventListener("click", () => {
	popup.close();
 });
function alertNonModal(alert){
	popup.querySelector('p').textContent = alert;
	popup.show();
}

function getRouteMatch(path) {
	// First check for exact matches
	if (routes[path]) {
		return { route: path, template: routes[path], params: {} };
	}
	
	// Then check for parameterized routes
	for (const route in routes) {
		if (pathMatchesPattern(path, route)) {
			const params = extractParams(path, route);
			return { route, template: routes[route], params };
		}
	}
	
	return { route: null, template: null, params: {} };
}


/**
 * Check if a path matches a route pattern
 */
function pathMatchesPattern(path, pattern) {
	// Handle routes with parameters (e.g., /profile_view/3)
	if (pattern.includes(':')) {
		const patternParts = pattern.split('/');
		const pathParts = path.split('/');
		
		// Quick length check
		if (patternParts.length !== pathParts.length) {
			return false;
		}
		
		// Check each part
		for (let i = 0; i < patternParts.length; i++) {
			// If it's a parameter (starts with :), it matches anything
			if (patternParts[i].startsWith(':')) {
				continue;
			}
			// Otherwise, it should match exactly
			if (patternParts[i] !== pathParts[i]) {
				return false;
			}
		}
		
		return true;
	}
	
	// For regular routes, just check for exact match
	return path === pattern;
}

/**
 * Extract parameters from a path based on a pattern
 */
function extractParams(path, pattern) {
	const params = {};
	
	const patternParts = pattern.split('/');
	const pathParts = path.split('/');
	
	for (let i = 0; i < patternParts.length; i++) {
		if (patternParts[i].startsWith(':')) {
			// Extract the parameter name without the :
			const paramName = patternParts[i].substring(1);
			params[paramName] = pathParts[i];
		}
	}
	
	return params;
}

async function fetchBody() {
	
	const pathInfo = getRouteMatch(window.location.pathname);
	updateNav();
	
	if (pathInfo.route) {
		// Make sure we use an absolute path for the template URL
		let templateUrl = pathInfo.template;
		if (!templateUrl.startsWith('/')) {
			templateUrl = '/' + templateUrl;
		}
		
		try {
			const response = await fetch(templateUrl);
			if (response.ok) {
				let html = await response.text();
				
				// Store the route parameters in the window object for use in the loaded page
				window.routeParams = pathInfo.params;
				
				document.querySelector("div#app").innerHTML = html;
				runScriptsInHTML(html);
			} else {
				alertNonModal('Error loading page content.');
			}
		} catch (error) {
			console.error('Error fetching template:', error);
			alertNonModal('Failed to load page content.');
		}
	} else {
		alertNonModal('Page not found.');
	}
}



async function auth() {
	const response = await fetch('https://' + window.location.host + '/api/user/auth/');
	const data = await response.json();
	return data['authenticated'] ? true : false;
}
async function isUserInGame() {
	const response = await fetch("/api/matchmaking/inGame");
	const data = await response.json();
	return data.in_game;
}
async function isUserInTournament() {
	const response = await fetch("/api/matchmaking/inTournament");
	const data = await response.json();
	return data.in_tournament;
}



async function updateContent() {
	const connect = await auth();
	const pathInfo = getRouteMatch(window.location.pathname);
	
	if (!pathInfo.route) {
		window.history.pushState({}, "", connect ? '/home' : '/');
		alertNonModal('This page doesn\'t exist.');
	} else {
		const isAuthRequired = Object.keys(routes_auth_required)
			.some(route => pathMatchesPattern(pathInfo.route, route));
		if (connect){
			const game = await isUserInGame();
			const tournament = await isUserInTournament();		
			if (game) {
				window.history.pushState({}, "", '/pong');
				socketConnexion('matchmaking/classique');
				return;
			}
			else if (tournament) {
				window.history.pushState({}, "", '/waiting_room');
				socketConnexion('matchmaking/classique');
				return;
			}
			else if (Object.keys(routes_game_required).includes(pathInfo.route)) {
				alertNonModal('search a game first');
				window.history.pushState({}, "", '/home');
			}
			else if (Object.keys(routes_free_access).includes(pathInfo.route)){
				alertNonModal('You are already logged in.');
				window.history.pushState({}, "", '/home');
			}
		}
		else if (isAuthRequired){
			alertNonModal('You have to be logged in to access this resource.');
			window.history.pushState({}, "", '/');
		}
	}
	await fetchBody();
}



// async function updateContent(){
// 	const connect = await auth();
// 	const game = await isUserInGame();
// 	const path = window.location.pathname;

// 	if (!(path in routes)){
// 		window.history.pushState({}, "", connect ? '/home' : '/');
// 		alertNonModal('This page doesn\'t exist.');
// 	}
// 	else {
// 		if (connect){
// 			console.log(game);
// 			if (game){
// 				window.history.pushState({}, "", '/pong');
// 				socketConnexion('matchmaking/classique');
// 				return;
// 			}
// 			else {
// 				window.history.pushState({}, "", '/home');
// 				if (path in routes_game_required)
// 					alertNonModal('Search a game first.');
// 				else if (path in routes_free_access)
// 					alertNonModal('You are already login.');
// 			}
// 		}
// 		else {
// 			if (path in routes_auth_required){
// 				alertNonModal('You have to be logged in to access this ressource.');
// 				window.history.pushState({}, "", '/');
// 			}
// 		}
// 	}
// 	fetchBody();
// }

/**
 * BACK && FORWARD BUTTON
 * HAS TO BE PROTECTED FOR COMING BACK AFTER CONNEXION !!!! ERROR
 */
async function onpopstate_handler(){
	const game = await isUserInGame();
	const tournament = await isUserInTournament();

	const pathInfo = getRouteMatch(window.location.pathname);
	if (game || tournament){
		if (socket)
			socket.send(JSON.stringify({type: 'give_up'}));
	}
	if (Object.keys(routes_game_required).includes(pathInfo.route)) {
		// alertNonModal('search a game first');
		window.history.pushState({}, "", '/home');
	}

	fetchBody();
}


window.onpopstate = onpopstate_handler;
/**
 * EACH TIME THE SCRIPT IS LOADED (WHEN PRESSING TAB IN THE URL), EXECUTE UPDATECONTENT FUNCTION
 */
updateContent()































// async function updateContent() {
//     const connect = await auth();
//     const pathInfo = getRouteMatch(window.location.pathname);
	
//     if (!pathInfo.route) {
//         window.history.pushState({}, "", connect ? '/home' : '/');
//         alertNonModal('This page doesn\'t exist.');
//     } else {
//         const isAuthRequired = Object.keys(routes_auth_required)
//             .some(route => pathMatchesPattern(pathInfo.route, route));
		
		



			
//         if (isAuthRequired && !connect) {
//             alertNonModal('You have to be logged in to access this resource.');
//             window.history.pushState({}, "", '/');
//         } else if (Object.keys(routes_free_access).includes(pathInfo.route) && connect) {
//             alertNonModal('You are already logged in.');
//             window.history.pushState({}, "", '/home');
//         }
//     }
//     fetchBody();
// }

