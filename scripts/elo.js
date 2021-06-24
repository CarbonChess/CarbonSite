const DEFAULT_ELO = 1000;

async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userELO || DEFAULT_ELO,
		}
	}
	const user = await netlifyIdentity.gotrue.currentUser().update(user_metadata);
}

document.addEventListener('DOMContentLoaded', () => {
	window.userELO = netlifyIdentity.gotrue.currentUser()?.user_metadata.elo || DEFAULT_ELO;
})

netlifyIdentity.on('login', user => {
	window.userELO = user.user_metadata.elo;
});
