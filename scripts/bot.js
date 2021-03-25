let failedMoveCount = 0;

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
				// Add to good squares list for later use
				goodSquares.push({ start: validSquares[i].cell, end: cell });
			}
		}
	}

	let startCell, endCell, failed;

	// Various intelligence levels
	if (botIntelligence === 0 || failedMoveCount >= 3 || goodSquares.length === 0) {
		// Intelligence level 0: move randomly
		const selected = validSquares[random(0, validSquares.length - 1)];
		startCell = selected.cell;
		endCell = selected.moves[random(0, selected.moves.length - 1)];
	}

	else if (botIntelligence === 1) {
		// Intelligence level 1: prioritise moving forward
		goodSquares = goodSquares.map(obj => {
			const forward = currentTurn === 'white' ? obj.start[1] < obj.end[1] : obj.start[1] > obj.end[1];
			return { start: obj.start, end: obj.end, forward };
		});
		startCell = goodSquares[0].start;
		endCell = goodSquares[0].end;
	}

	else if (botIntelligence === 2) {
		// Intelligence level 2: prioritise taking pieces
		goodSquares = goodSquares.map(obj => {
			const score = getPointsEquivalent(getPieceClasses(obj.end)[1]);
			return { start: obj.start, end: obj.end, score: score };
		}).sort((a, b) => a.score < b.score ? +1 : -1);
		startCell = goodSquares[0].start;
		endCell = goodSquares[0].end;
	}

	// Move the piece
	hasClicked(startCell);
	hasClicked(endCell);
}

function forceBotMove() {
	let curFen = createFen();
	failedMoveCount = 0;
	do {
		botMove(currentTurn);
		if (createFen() === curFen) failedMoveCount++;
	}
	while (createFen() === curFen && ingame);
}

function updateAutobot() {
	window.autobot = !autobot;
	$('#auto-bot').setAttribute('class', autobot ? 'enabled' : 'disabled');
}

setInterval(function () {
	if (window.autobot && window.ingame && (window.currentTurn === window.botColour || window.botColour === 'both'))
		forceBotMove();
}, 500);
