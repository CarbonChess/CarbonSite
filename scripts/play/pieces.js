const getPieceClasses = cell => getClasses(getPieceInCell(cell));
const getPieceInCell = cell => getCell('piece' + cell);
const pieceInCell = cell => getClasses(getPieceInCell(cell)).length > 0;
const getPieceColour = cell => getPieceClasses(cell)[0];

function selectPiece(cell) {
	selectedCell = cell;
	const $cell = document.getElementById(selectedCell);
	$cell ?.classList.add('selected');
	console.log('S', selectedCell);
}

function createPiece(name, colour, cell) {
	if (!name) return;
	let piece = document.createElement('img');
	piece.src = 'assets/transparent.gif';
	piece.setAttribute('data-piece', true);
	piece.classList.add(colour);
	piece.classList.add(name);
	if (cell) {
		piece.id = 'piece' + cell;
		piece.setAttribute('draggable', true);
	}
	return piece;
}

function addPiece(name, colour, cell) {
	removePiece(cell);
	getCell(cell).appendChild(createPiece(name, colour, cell));
}

function removePiece(cell, reset) {
	if (reset) clearCells(cell);
	else getCell(cell).innerHTML = '';
}

function swapPiece(startCell, endCell) {
	const startClasses = getPieceClasses(startCell);
	const endClasses = getPieceClasses(endCell);
	if (startClasses.length) {
		addPiece(startClasses[1], startClasses[0], endCell);
		if (!endClasses.length) removePiece(startCell, true);
	}
	if (endClasses.length) {
		addPiece(endClasses[1], endClasses[0], startCell);
		if (!startClasses.length) removePiece(endCell, true);
	}
	updateKingCells();
}

function movePiece(startCell, endCell) {
	if (startCell === endCell) return;
	const startClasses = getPieceClasses(startCell);
	addPiece(startClasses[1], startClasses[0], endCell);
	removePiece(startCell);
	clearCells(startCell);
	updateKingCells();
}

function setPromotion(elem) {
	// used in play.html
	const [colour, piece] = elem.classList;
	$$('#promotion img').forEach(elem => elem.classList.remove('selected'));
	elem.classList.add('selected');
	window.promotionPiece = piece;
}

function updateKingCells() {
	kingCell.b = $('.black.king') ?.parentNode.id;
	kingCell.w = $('.white.king') ?.parentNode.id;
}

function getPieceID(piece) {
	switch (piece) {
		case 'pawn': return '';
		case 'knight': return 'N';
		default: return piece[0].toUpperCase();
	}
}

function getPointsEquivalent(piece) {
	const points = {
		pawn: 1,
		knight: 3,
		bishop: 3,
		rook: 5,
		queen: 9,
		king: Infinity,
	};
	return points[piece];
}
