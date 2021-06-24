async function saveUserData() {
	const user_metadata = {
		data: {
			elo: window.userELO || 1000,
		}
	}
	const user = await netlifyIdentity.gotrue.currentUser().update(user_metadata);
}

netlifyIdentity.on('login', user => {
	window.userELO = user.user_metadata.elo;
});
