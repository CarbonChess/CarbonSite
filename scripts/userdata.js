const DEFAULT_ELO = 1000;

function initialiseUserData() {
	const user = netlifyIdentity.gotrue.currentUser();
	if (!user) return;
	const { elo, puzzles_elo, full_name } = user.user_metadata;
	window.userElo = elo || DEFAULT_ELO;
	window.userPuzzlesElo = puzzles_elo || DEFAULT_ELO;
	window.accountName = full_name;
	displayAccountInfo();
}

async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userElo || DEFAULT_ELO,
			puzzles_elo: window.userPuzzlesElo || DEFAULT_ELO,
		}
	}
	const user = await netlifyIdentity.gotrue.currentUser().update(user_metadata);
	displayAccountInfo();
}

function displayAccountInfo() {
	$.id('account-elo').innerText = window.userElo + '/' + window.userPuzzlesElo;
	$.id('account-username').innerText = window.accountName;
}

document.addEventListener('DOMContentLoaded', initialiseUserData);
netlifyIdentity.on('login', initialiseUserData);
