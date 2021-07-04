function botMove(botColour) {
	const { botIntelligence } = window.gameOptions;

	let validSquares = [];
	let validMoves = [];
	let goodMoves = [];

	// Generate valid moves list
	$$('table .' + botColour).forEach(piece => {
		const cell = piece.parentNode.id;
		const moves = findAllMoves(cell)
		if (moves.length) validSquares.push({ cell, moves });
	});

	// Generate list of good moves for later use
	validSquares.forEach(obj => obj.moves.forEach(cell => {
		const start = obj.cell, end = cell;
		const march = botIntelligence === 1 && (gameData.currentTurn === 'w' ? start[1] < end[1] : start[1] > end[1]);
		const charge = botIntelligence === 2 && pieceInCell(cell);
		const attack = botIntelligence === 3 && pieceInCell(cell) && getPointsEquivalent(getPieceClasses(start)[1]) <= getPointsEquivalent(getPieceClasses(end)[1]);
		validMoves.push({ start, end });
		if (march || charge || attack) goodMoves.push({ start, end });
	}));

	// If there are no good moves load all valid squares
	if (goodMoves.length === 0) goodMoves = validMoves;

	// Move piece using various intelligence levels
	let startCell, endCell;
	if ([0, 1].includes(botIntelligence) || failedMoveCount >= 3) {
		// Intelligence level 0: move randomly
		// Intelligence level 1: prioritise moving forward
		const selected = goodMoves[random(0, goodMoves.length - 1)];
		startCell = selected.start;
		endCell = selected.end;
	}
	else if ([2, 3].includes(botIntelligence)) {
		// Intelligence level 2: prioritise taking pieces
		// Intelligence level 3: prioritise taking only better pieces
		goodMoves = goodMoves.map(obj => {
			const startScore = getPointsEquivalent(getPieceClasses(obj.start)[1]);
			const endScore = getPointsEquivalent(getPieceClasses(obj.end)[1]) || 0;
			return { start: obj.start, end: obj.end, score: endScore - startScore };
		}).sort((a, b) => a.score > b.score ? -1 : +1);
		if (botIntelligence === 3) {
			let bestSquares = goodMoves.filter(obj => obj.score >= 0);
			if (bestSquares.length > 0) goodMoves = bestSquares;
		}
		startCell = goodMoves[0].start;
		endCell = goodMoves[0].end;
	}

	// Move the piece
	hasClicked(startCell);
	hasClicked(endCell);
}

function forceBotMove() {
	let curFen = createFen();
	failedMoveCount = 0;
	do {
		botMove(gameData.currentTurn === 'w' ? 'white' : 'black');
		if (createFen() === curFen) failedMoveCount++;
	}
	while (createFen() === curFen && ingame);
}

setInterval(function () {
	if (window.gameOptions && window.gameOptions.bot && window.ingame && gameData.currentTurn === window.gameOptions.botColour[0]) {
		forceBotMove();
	}
}, 650);
