function botMove(botColour) {
	const { botIntelligence } = window.gameOptions;

	let validSquares = [];
	let goodSquares = [];

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

	// Generate list of good squares for later use
	validSquares.forEach(obj => obj.moves.forEach(cell => {
		const start = obj.cell, end = cell;
		const march = botIntelligence === 1 && (currentTurn === 'white' ? start[1] < end[1] : start[1] > end[1]);
		const charge = botIntelligence === 2 && pieceInCell(cell);
		const attack = botIntelligence === 3 && pieceInCell(cell) && getPointsEquivalent(getPieceClasses(start)[1]) <= getPointsEquivalent(getPieceClasses(end)[1]);
		if (march || charge || attack) goodSquares.push({ start, end });
	}));

	// Move piece using various intelligence levels
	let startCell, endCell, failed;
	debug('b30', { validSquares, botIntelligence, failedMoveCount, goodSquares })

	if (botIntelligence === 0 || failedMoveCount >= 3 || goodSquares.length === 0) {
		// Intelligence level 0: move randomly
		const selected = validSquares[random(0, validSquares.length - 1)];
		startCell = selected.cell;
		endCell = selected.moves[random(0, selected.moves.length - 1)];
	}

	else if (botIntelligence === 1) {
		// Intelligence level 1: prioritise moving forward
		const selected = goodSquares[random(0, goodSquares.length - 1)];
		startCell = selected.start;
		endCell = selected.end;
	}

	else if (botIntelligence === 2 || botIntelligence === 3) {
		// Intelligence level 2: prioritise taking pieces
		// Intelligence level 3: prioritise taking only better pieces
		goodSquares = goodSquares.map(obj => {
			const startScore = getPointsEquivalent(getPieceClasses(obj.start)[1]);
			const endScore = getPointsEquivalent(getPieceClasses(obj.end)[1]);
			return { start: obj.start, end: obj.end, score: endScore - startScore };
		}).sort((a, b) => a.score > b.score ? -1 : +1);
		if (botIntelligence === 3) {
			debug('b55', goodSquares)
			let bestSquares = goodSquares.filter(obj => obj.score >= 0);
			debug('b57', bestSquares)
			if (bestSquares.length > 0) goodSquares = bestSquares;
		}
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

function updateAutobot() {// deprecated
	window.autobot = !autobot;
	$('#auto-bot').setAttribute('class', autobot ? 'enabled' : 'disabled');
}

setInterval(function () {
	if (window.gameOptions.bot && window.ingame && window.currentTurn === window.gameOptions.botColour) {
		forceBotMove();
	}
}, 650);
