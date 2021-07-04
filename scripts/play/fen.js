const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';

function createFen() {
	return gameData.moveList[gameData.moveList.length - 1];
}

function getTakenPiecesFromFen() {
	const fenString = createFen();
	let pieces = { b: 'pppppppprnbqkbnr', w: 'PPPPPPPPRNBQKBNR' };
	for (const c of fenString.split(' ')[0]) {
		const col = c.toLowerCase() === c ? 'b' : 'w';
		pieces[col] = pieces[col].replace(c, '');
	}
	return pieces;
}

function getFenFromURL() {
	const url = new URL(location.href);
	return url.searchParams.get('fen')?.replace(/_/g, ' ');
}
