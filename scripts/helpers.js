const debug = (...args) => console.log('DEBUG', ...args);

function indexToLetter(n) {
	return String.fromCharCode(n + 64);
}

function invertColour(colour) {
	return colour === 'white' ? 'black' : 'white';
}

function createFen() {
	let currentFen = '';

	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			let cell = indexToLetter(j) + (9 - i);
			let [colour, piece] = getPieceClasses(cell);
			let cellID = colour ? (piece === 'knight' ? 'n' : piece[0]) : '1';
			if (colour === 'white') cellID = cellID.toUpperCase();
			currentFen += cellID;
		}
		currentFen += '/';
	}

	currentFen = [
		currentFen.replace(/\/$/, '').replace(/\d+/g, m => m.length),
		currentTurn[0],
		(castling.w.k ? 'K' : '') + (castling.w.q ? 'Q' : '') + (castling.b.k ? 'k' : '') + (castling.b.q ? 'q' : ''),
		enpassantCell ?.toLowerCase() || '-',
		0,
		Math.ceil(totalMoves / 2),
	].join(' ');
	return currentFen;
}

function getPointsFromFen(fenString) {
	let points = { w: 39, b: 39 };
	for (let i in fenString.split(' ')[0]) {
		const c = fenString[i];
		let col = c.toLowerCase() === c ? 'w' : 'b';
		switch (c.toLowerCase()) {
			case 'p': points[col] -= 1; break;
			case 'n': points[col] -= 3; break;
			case 'b': points[col] -= 3; break;
			case 'r': points[col] -= 5; break;
			case 'q': points[col] -= 9; break;
		}
	}
	return points;
}
