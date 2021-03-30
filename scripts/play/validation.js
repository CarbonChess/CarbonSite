class Validation {
	constructor(colour, piece, startCell, endCell) {
		this.colour = colour;
		this.piece = piece;
		this.startCell = startCell;
		this.endCell = endCell;

		this.startNumber = parseInt(startCell[1]);
		this.endNumber = parseInt(endCell[1]);
		this.deltaNumber = Math.abs(this.endNumber - this.startNumber);

		this.startLetter = startCell[0];
		this.endLetter = endCell[0];
		this.deltaLetter = Math.abs(this.endCell.charCodeAt(0) - this.startCell.charCodeAt(0));
		this.sameLetter = this.deltaLetter === 0;
	}
}

function validateMove(...args) {
	const validator = new Validation(...args);
	return isValid(validator) && !pieceInWay(validator);
}

function isValid(v) {
	switch (v.piece) {
		case 'rook':
			return v.deltaLetter === 0 || v.deltaNumber === 0;
		case 'knight':
			return v.deltaNumber + v.deltaLetter == 3 && v.deltaLetter !== 0 && v.deltaNumber !== 0;
		case 'king':
			const singleMove = v.deltaLetter <= 1 && v.deltaNumber <= 1;
			const castleMove = (
				v.deltaLetter <= 2 && v.deltaNumber === 0
				&& (
					castling[v.colour[0]].k && v.endCell[0] === 'G'
					||
					castling[v.colour[0]].q && v.endCell[0] === 'B'
				)
			);
			return (singleMove || castleMove);
		case 'bishop':
			return v.deltaLetter === v.deltaNumber;
		case 'queen':
			return v.deltaLetter === 0 || v.deltaNumber === 0 || v.deltaLetter === v.deltaNumber;
		case 'pawn':
			const takingPiece = v.deltaLetter === 1 && v.deltaNumber === 1 && pieceInCell(v.endCell) && getPieceColour(v.endCell) === invertColour(v.colour);
			const pawnMove = v.deltaNumber === 1 || (v.deltaNumber === 2 && [2, 7].includes(v.startNumber));
			const forward = v.colour === 'white' ? v.endNumber > v.startNumber : v.endNumber < v.startNumber;
			const validSideways = n => {
				let sidewaysCell = String.fromCharCode(v.startCell.charCodeAt(0) + n) + v.startNumber;
				let aboveEnpassantCell = v.endLetter + (v.endNumber + (v.colour === 'black' ? +1 : -1)) === enpassantCell;
				return pieceInCell(sidewaysCell) && aboveEnpassantCell;
			};
			enpassantTaken = enpassantCell && v.endLetter === enpassantCell[0] ? (validSideways(+1) || validSideways(-1)) : null;
			return (v.sameLetter || takingPiece || enpassantTaken) && pawnMove && forward;
		default:
			return true;
	}
}

function pieceInWay(v) {
	let invalidMove = false;
	const direction = {};

	// determine direction
	if (v.endCell.charCodeAt(0) > v.startCell.charCodeAt(0)) direction.l = 1;
	else if (v.endCell.charCodeAt(0) < v.startCell.charCodeAt(0)) direction.l = -1;
	else direction.l = 0;
	if (v.endNumber > v.startNumber) direction.n = 1;
	else if (v.endNumber < v.startNumber) direction.n = -1;
	else direction.n = 0;

	// check cells
	switch (v.piece) {
		case 'pawn':
			if (v.deltaLetter === 0) {
				if (v.colour === 'white') {
					invalidMove = pieceInCell(v.startCell[0] + (v.startNumber + 1));
					if (v.deltaNumber === 2 && !invalidMove) {
						invalidMove = pieceInCell(v.startCell[0] + (v.startNumber + 2));
					}
				}
				else {
					invalidMove = pieceInCell(v.startCell[0] + (v.startNumber - 1));
					if (v.deltaNumber === 2 && !invalidMove) {
						invalidMove = pieceInCell(v.startCell[0] + (v.startNumber - 2));
					}
				}
			}
			return invalidMove;
		case 'rook':
		case 'bishop':
		case 'queen':
		case 'castle':
			let hasCollided = false;
			for (let i = 1; i <= Math.max(v.deltaLetter, v.deltaNumber); i++) {
				let letter = String.fromCharCode(parseInt(v.startLetter.charCodeAt(0)) + direction.l * i);
				let number = v.startNumber + direction.n * i;

				if (getPieceColour(letter + number) === v.colour || hasCollided)
					invalidMove = true;
				if ((getPieceColour(letter + number) == invertColour(v.colour) && !hasCollided))
					hasCollided = true;
			}
			return invalidMove;
		default:
			if (getPieceColour(v.endCell) === v.colour)
				return true;
			else
				return false;
	}
}

function isCheck(colour) {
	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			const cell = indexToLetter(j) + i;
			if (getPieceClasses(cell).includes(invertColour(colour))) {
				// if opposite colour, check its moves
				const checkPiece = getPieceInCell(cell);
				const [colour, piece] = getClasses(checkPiece);
				const opposingKingCell = kingCell[invertColour(colour)[0]];
				if (!opposingKingCell || validateMove(colour, piece, cell, opposingKingCell))
					return true;
			}
		}
	}
	return false;
}

function gameEndingStatus(colour) {

	if (fmrMoves >= 50) return 'stalemate'; // 50 move rule
	if (createFen().split(' ')[0].replace(/\/|\d+/g, '').toLowerCase() === 'kk') return 'stalemate'; // only 2 kings left

	let currentlyCheck = isCheck(colour);
	let noValidMoves = true;

	outer:
	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			const startCell = indexToLetter(j) + i;
			if (getPieceClasses(startCell).includes(colour)) {
				const possibleSquares = findAllMoves(startCell);
				for (let k in possibleSquares) {
					let pieceStore;
					if (pieceInCell(possibleSquares[k])) {
						pieceStore = getPieceClasses(possibleSquares[k]);
					}
					movePiece(startCell, possibleSquares[k]);
					if (!isCheck(colour)) noValidMoves = false;
					movePiece(possibleSquares[k], startCell);
					if (pieceStore) addPiece(pieceStore[1], pieceStore[0], possibleSquares[k]);

					if (!noValidMoves) break outer;
				}
			}
		}
	}

	if (noValidMoves) return currentlyCheck ? 'checkmate' : 'stalemate';
	else return false;
}

function checkCastling(v) {
	let castlingValid = false;
	let cells = {};
	if (v.deltaLetter === 2 && v.endCell[1] === v.startCell[1]) {
		const queenside = v.endCell[0] < v.startCell[0];
		const row = v.colour === 'white' ? 1 : 8;
		castlingValid = castling[v.colour[0]][queenside ? 'q' : 'k'] && validateMove(v.colour, 'castle', v.startCell, (queenside ? 'B' : 'G') + v.startCell[1]);

		if (castlingValid) {
			cells = queenside ? { king: 'C' + row, rook: 'D' + row } : { king: 'G' + row, rook: 'F' + row }
		}
	}
	return { castlingValid, cells }
}

function findAllMoves(targetCell) {
	let possibleSquares = [];
	const [colour, piece] = getClasses(getPieceInCell(targetCell));
	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			const cell = indexToLetter(j) + i;
			if (validateMove(colour, piece, targetCell, cell)) {
				possibleSquares.push(cell);
			}
		}
	}
	return possibleSquares;
}

function threefoldRepetition() {
	const lastFen = movesList[movesList.length - 1].replace(/ . .$/, '');
	let repetitions = 0;
	for (let i in movesList) {
		if (movesList[i].replace(/ . .$/, '') === lastFen)
			repetitions++;
	}
	return repetitions >= 3;
}
