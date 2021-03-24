function botMove(botColour) {
	let validSquares = {};

	$$('table .' + botColour).forEach(function (piece) {
		const cell = piece.parentNode.id;
		validSquares[cell] = findAllMoves(cell);
	});

	for (let cell in validSquares) {
		if (validSquares[cell].length === 0) {
			delete validSquares[cell];
		}
	}

	const startCells = Object.keys(validSquares);
	const startCell = startCells[random(0, startCells.length - 1)];
	const endCells = validSquares[startCell];
	const endCell = endCells[random(0, endCells.length - 1)];

	if (startCell === endCell) return botMove(botColour);

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