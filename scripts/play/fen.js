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

function getFenFromURL() {
	const url = new URL(location.href);
	return url.searchParams.get('fen')?.replace(/_/g, ' ');
}
