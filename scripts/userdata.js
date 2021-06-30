const DEFAULT_ELO = 1000;
const DEFAULT_PUZZLE_ELO = 1500;

function resetUserData() {
	window.userElo = DEFAULT_ELO;
	window.userPuzzlesElo = DEFAULT_PUZZLE_ELO;
	window.accountName = 'Not Signed In';
	updateDisplayedInfo();
}

function initialiseUserData() {
	resetUserData();
	const user = netlifyIdentity.gotrue.currentUser();
	if (!user) return;
	const { elo, puzzles_elo, full_name } = user.user_metadata;
	window.userElo = elo;
	window.userPuzzlesElo = puzzles_elo;
	window.accountName = full_name;
	updateDisplayedInfo();
}

async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userElo,
			puzzles_elo: window.userPuzzlesElo,
		}
	}
	await netlifyIdentity.gotrue.currentUser()?.update(user_metadata);
	updateDisplayedInfo();
}

function updateDisplayedInfo() {
	$.id('account-elo').innerText = window.userElo + '/' + window.userPuzzlesElo;
	$.id('account-username').innerText = window.accountName.replace(/</g, '&lt;');
}

document.addEventListener('DOMContentLoaded', initialiseUserData);
netlifyIdentity.on('login', initialiseUserData);
netlifyIdentity.on('logout', resetUserData);
