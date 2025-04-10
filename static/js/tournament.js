

function match(p1, p2){
	setLocalPong(p1, p2);
	if (localData.score[0] < localData.score[1])
		p1 = p2;
	return (p1);
}

function tournament_manager(users){
	while (users.length > 1){
		winners = [];
		while (users.length)
			winners.push(match(users.pop(), users.pop()));
		users = winners;
	}
	console.log(users);
}

document.querySelector('button#Playername-Submit').onclick = function(e) {
	e.preventDefault();

	const form = document.querySelector('form#playerForm');
	const formDataArray = Array.from(new FormData(form));
	const valuesArray = formDataArray.map(([key, value]) => value);
	const playerValues = valuesArray.map(value => value.trim());

	const uniqueValues = new Set(playerValues);

    if (playerValues.includes(""))
		alertNonModal('Tous les champs doivent être remplis !');
    else if (uniqueValues.size !== playerValues.length)
        alertNonModal("Les noms doivent être uniques !");
    else
        tournament_manager(playerValues);
};
