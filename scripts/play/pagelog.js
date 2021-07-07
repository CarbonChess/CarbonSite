function updateMoveLog() {
	let moveHtml = '';
	for (let [n, move] of Object.entries(gameData.logList)) {
		moveHtml += ' <span class="move">';
		let isWhite = n % 2 === 0;
		if (isWhite) moveHtml += `<br class="desktoponly">` + (n / 2 + 1) + '. ';
		let pieceCode = move.length === 2 ? 9811 : 9812 + ['K', 'Q', 'R', 'B', 'N'].indexOf(move[0]);
		if (pieceCode === 9811) pieceCode = 9817;
		else move = move.slice(1);
		if (!isWhite) pieceCode += 6;
		moveHtml += `&#${pieceCode};` + move.toLowerCase();
		moveHtml += '</span>';
	}
	$.id('log').innerHTML = moveHtml;
}

function logPoints() {
	const { w, b } = window.points();
	const wDiff = b - w, bDiff = w - b;
	$.id('white-points').innerText = wDiff > 0 ? '+' + wDiff : '';
	$.id('black-points').innerText = bDiff > 0 ? '+' + bDiff : '';
}

function logTakenPiece(colour, piece) {
	const takenPiece = createPiece(piece, colour);
	takenPiece.setAttribute('data-move', window.totalMoves);
	$.id(colour + '-pieces').appendChild(takenPiece);
	logPoints();
}
