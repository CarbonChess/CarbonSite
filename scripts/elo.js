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
	const user = netlifyIdentity.gotrue.currentUser();
	if (!user) return;
	const { elo, full_name } = user.user_metadata;
	window.userELO = elo || DEFAULT_ELO;
	window.accountName = full_name;
})

netlifyIdentity.on('login', user => {
	window.userELO = user.user_metadata.elo;
});
