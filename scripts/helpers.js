function indexToLetter(n) {
	return String.fromCharCode(n + 64);
}

function getClasses(elem) {
	return Array.from(elem ?.classList || []);
}

function invertColour(colour) {
	return colour === 'white' ? 'black' : 'white';
}
