const DEFAULT_ELO = 1000;
const DEFAULT_PUZZLE_ELO = 1500;

function initialiseUserData() {
	const user = netlifyIdentity.gotrue.currentUser();
	if (!user) {
		window.userElo = DEFAULT_ELO;
		window.userPuzzlesElo = DEFAULT_PUZZLE_ELO;
		return;
	}
	const { elo, puzzles_elo, full_name } = user.user_metadata;
	window.userElo = elo || DEFAULT_ELO;
	window.userPuzzlesElo = puzzles_elo || DEFAULT_PUZZLE_ELO;
	window.accountName = full_name;
	updateDisplayedInfo();
}

async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userElo || DEFAULT_ELO,
			puzzles_elo: window.userPuzzlesElo || DEFAULT_PUZZLE_ELO,
		}
	}
	const user = await netlifyIdentity.gotrue.currentUser().update(user_metadata);
	updateDisplayedInfo();
}

function updateDisplayedInfo() {
	$.id('account-elo').innerText = window.userElo + '/' + window.userPuzzlesElo;
	$.id('account-username').innerText = window.accountName || 'Not Signed In';
}

document.addEventListener('DOMContentLoaded', initialiseUserData);
netlifyIdentity.on('login', initialiseUserData);
