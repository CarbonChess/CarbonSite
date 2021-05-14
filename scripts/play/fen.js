const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';

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
		enpassantCell?.toLowerCase() || '-',
		fmrMoves,
		Math.ceil(totalMoves / 2),
	].join(' ');
	return currentFen;
}

function getCurrentTurnFromFen(fenString) {
	return fenString.split(' ')[1] === 'w' ? 'white' : 'black';
}

function getPointsFromFen(fenString) {
	let points = { w: 39, b: 39 };
	for (let i in fenString.split(' ')[0]) {
		const c = fenString[i];
		const col = c.toLowerCase() !== c ? 'b' : 'w';
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

function getTakenPiecesFromFen(fenString) {
	let pieces = { b: 'pppppppprnbqkbnr', w: 'PPPPPPPPRNBQKBNR' };
	for (let i in decodeURIComponent(fenString).split(' ')[0]) {
		const c = fenString[i];
		const col = c.toLowerCase() === c ? 'b' : 'w';
		pieces[col] = pieces[col].replace(c, '');
	}
	return pieces;
}

function getCastlingFromFen(fenString) {
	const str = fenString.split(' ')[2];
	const castling = {
		w: { k: str.includes('K'), q: str.includes('Q') },
		b: { k: str.includes('k'), q: str.includes('q') },
	};
	return castling;
}

function getEnpassantFromFen(fenString) {
	return fenString.split(' ')[3].replace('-', '').toUpperCase() || null;
}

function getFmrFromFen(fenString) {
	return fenString.split(' ')[4];
}

function getFenFromURL() {
	const url = new URL(location.href);
	return url.searchParams.get('fen')?.replace(/_/g, ' ');
}
