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

	const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
	const startCells = Object.keys(validSquares);
	const startCell = startCells[random(0, startCells.length - 1)];
	const endCells = validSquares[startCell];
	const endCell = endCells[random(0, endCells.length - 1)];

	if (startCell === endCell) return botMove(botColour);

	selectedCell = startCell;
	hasClicked(endCell);
}
