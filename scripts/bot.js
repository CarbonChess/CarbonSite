function botMove(botColour) {
	let validSquares = [];
	let goodSquares = [];
	//let pieceSquares = Array.from($$('.' + invertColour(botColour))).map(piece => piece.parentNode.id);

	// Generate valid moves list
	$$('table .' + botColour).forEach(function (piece) {
		const cell = piece.parentNode.id;
		validSquares.push({ cell: cell, moves: findAllMoves(cell) });
	});

	// Cleanup moves list
	validSquares = validSquares.map(obj => {
		const moves = obj.moves.filter(cell => cell !== obj.cell) // remove same-square moves
		return { cell: obj.cell, moves: moves };
	});
	validSquares = validSquares.filter(obj => obj.moves.length > 0); // remove empty moves
	for (let i in validSquares) {
		for (let cell of validSquares[i].moves) {
			if (pieceInCell(cell)) {
				goodSquares.push({ start: validSquares[i].cell, end: cell });
			}
		}
	}
	goodSquares = goodSquares.map(obj => {
		const score = getPointsEquivalent(getPieceClasses(obj.end)[1]);
		return { start: obj.start, end: obj.end, score: score };
	});
	goodSquares = goodSquares.sort((a, b) => a.score < b.score ? +1 : -1);

	// Select cell
	let startCell, endCell;
	if (goodSquares[0] && botIntelligence > 0) {
		// select the most-prized cell
		startCell = goodSquares[0].start;
		endCell = goodSquares[0].end;
	} else {
		// select random cell if no best cell exists
		const selected = validSquares[random(0, validSquares.length - 1)];
		startCell = selected.cell;
		endCell = selected.moves[random(0, validSquares.length - 1)];
	}

	// Move the piece
	hasClicked(startCell);
	hasClicked(endCell);
}

function forceBotMove() {
	let curFen = createFen();
	do { botMove(currentTurn); }
	while (createFen() == curFen && ingame);
}

function updateAutobot() {
	autobot = !autobot;
	$('#autobot').setAttribute('class', autobot ? 'enabled' : 'disabled');
}

setInterval(function () {
	if (autobot && ingame && currentTurn === 'black') forceBotMove();
}, 1000);