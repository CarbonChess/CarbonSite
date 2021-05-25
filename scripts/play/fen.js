const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';

function createFen() {
	return global.moveList.slice(-1)[0];
}

function getTakenPiecesFromFen() {
	const fenString = global.moveList.slice(-1)[0];
	let pieces = { b: 'pppppppprnbqkbnr', w: 'PPPPPPPPRNBQKBNR' };
	for (let i in fenString.split(' ')[0]) {
		const c = fenString[i];
		const col = c.toLowerCase() === c ? 'b' : 'w';
		pieces[col] = pieces[col].replace(c, '');
	}
	return pieces;
}

function getFenFromURL() {
	const url = new URL(location.href);
	return url.searchParams.get('fen')?.replace(/_/g, ' ');
}
