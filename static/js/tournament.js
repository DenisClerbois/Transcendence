


document.body.addEventListener('click', function(event) {
	if (event.target){
		if (event.target.matches('button#local-tournament')){
			tournament_manager();
		}
	}
});

function tournament_manager() {
	let users = getPlayerNames();
}

function getPlayerNames() {
	let players = [];
	while (players.length < 4) {
		let name = prompt(`Entrez le nom du joueur ${players.length + 1} (non vide) :`);
		if (name && name.trim() !== "")
			players.push(name.trim());
		else
			alert("Le nom ne peut pas être vide. Veuillez réessayer.");
	}
	return players;
}


// document.addEventListener("DOMContentLoaded", () => {
// 	const getPlayerNames = () => {
// 		let players = [];
// 		while (players.length < 4) {
// 			let name = prompt(`Entrez le nom du joueur ${players.length + 1} (non vide) :`);
// 			if (name && name.trim() !== "") {
// 				players.push(name.trim());
// 			} else {
// 				alert("Le nom ne peut pas être vide. Veuillez réessayer.");
// 			}
// 		}
// 		return players;
// 	};

// 	const organizeMatches = (players) => {
// 		let matches = [];
// 		for (let i = 0; i < players.length; i += 2) {
// 			matches.push([players[i], players[i + 1]]);
// 		}
// 		return matches;
// 	};

// 	const displayMatches = (matches) => {
// 		const container = document.createElement("div");
// 		container.style.fontFamily = "Arial, sans-serif";
// 		container.style.margin = "20px";

// 		matches.forEach((match, index) => {
// 			const matchDiv = document.createElement("div");
// 			matchDiv.textContent = `Match ${index + 1} : ${match[0]} vs ${match[1]}`;
// 			matchDiv.style.marginBottom = "10px";
// 			container.appendChild(matchDiv);
// 		});

// 		document.body.appendChild(container);
// 	};

// 	const players = getPlayerNames();
// 	const matches = organizeMatches(players);
// 	displayMatches(matches);
// });