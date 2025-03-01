const routes_auth_required = {
	"/profile":"/static/html/profile.html",
	"/home":"/static/html/home.html",
	// "/pong":"/static/html/pong.html",
	// "/tictactoe":"/static/html/tictactoe.html",
	// "/leaderbord":"/static/html/leaderbord.html",
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
	const path = window.location.pathname;

	if (path in routes){
		const bool = path in routes_auth_required;

		const pubElem = document.querySelector('div.public');
		const priElem = document.querySelector('div.private');

		if (pubElem && priElem){
			pubElem.hidden = bool;
			priElem.hidden = !bool;
		}
		else
			console.log('BUG: no public or private div.');
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



async function fetchBody() {
	const path = window.location.pathname;

	updateNav();

	const route = routes[path];
	const response = await fetch(route);
	const html = await response.text();
	document.querySelector("div#app").innerHTML = html;
	runScriptsInHTML(html);
}


async function auth() {
	const response = await fetch('https://localhost:8443/api/user/auth/');
	return response.ok ? true : false;
}




async function updateContent(){
	const connect = await auth();
	const path = window.location.pathname;

	if (!(path in routes)){
		window.history.pushState({}, "", connect ? '/home' : '/');
		alertNonModal('This page doesn\'t exist.');
	}
	else {
		if (path in routes_auth_required && !connect){
			alertNonModal('You have to be login to access this ressource.');
			window.history.pushState({}, "", '/');
		}
		if (path in routes_free_access && connect){
			alertNonModal('You are already login.');
			window.history.pushState({}, "", '/home');
		}
	}
	fetchBody();
}



/**
 * BACK && FORWARD BUTTON
 * HAS TO BE PROTECTED FOR COMING BACK AFTER CONNEXION !!!! ERROR
 */
window.onpopstate = fetchBody;
/**
 * EACH TIME THE SCRIPT IS LOADED (WHEN PRESSING TAB IN THE URL), EXECUTE UPDATECONTENT FUNCTION
 */
updateContent()

