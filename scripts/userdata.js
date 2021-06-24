const DEFAULT_ELO = 1000;

function initialiseUserData() {
	const user = netlifyIdentity.gotrue.currentUser();
	if (!user) return;
	const { elo, full_name } = user.user_metadata;
	window.userElo = elo || DEFAULT_ELO;
	window.accountName = full_name;
}

async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userElo || DEFAULT_ELO,
		}
	}
	const user = await netlifyIdentity.gotrue.currentUser().update(user_metadata);
}

document.addEventListener('DOMContentLoaded', initialiseUserData);
netlifyIdentity.on('login', initialiseUserData);
