function indexToLetter(n) {
	return String.fromCharCode(n + 64);
}

function getClasses(elem) {
	return Array.from(elem ?.classList || []);
}

function invertColour(colour) {
	return colour === 'white' ? 'black' : 'white';
}

function createFen() {
	let currentFen = '';
	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			let cell = indexToLetter(j) + (9-i);
			let [colour, piece] = getPieceClasses(cell);
			let cellID = colour ? (piece === 'knight' ? 'n' : piece[0]) : '1';
			if (colour === 'white') cellID = cellID.toUpperCase();
			currentFen += cellID;
		}
		currentFen += '/';
	}
	currentFen = currentFen.replace(/\/$/, '').replace(/\d+/g, m => m.length);
	currentFen += ['',
		currentTurn[0],
		(castling.w.k ? 'K' : '') + (castling.w.q ? 'Q' : '') + (castling.b.k ? 'k' : '') + (castling.b.q ? 'q' : ''),
		enpassantCell ?.toLowerCase() || '-',
		0,
		totalMoves,
	].join(' ');
	return currentFen;
}
