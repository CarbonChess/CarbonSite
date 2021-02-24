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
			return (v.deltaLetter <= 1 && v.deltaNumber <= 1);
		case 'bishop':
			return v.deltaLetter === v.deltaNumber;
		case 'queen':
			return v.deltaLetter === 0 || v.deltaNumber === 0 || v.deltaLetter === deltaNumber;
		case 'pawn':
			const takingPiece = v.deltaLetter === 1 && v.deltaNumber === 1 && pieceInCell(v.endCell);
			const pawnMove = v.deltaNumber === 1 || (v.deltaNumber === 2 && [2, 7].includes(v.startNumber));
			const forward = v.colour === 'white' ? v.endNumber > v.startNumber : v.endNumber < v.startNumber;
			const validSideways = n => (
				pieceInCell(String.fromCharCode(v.startCell.charCodeAt(0) + n) + v.startNumber)
				&& v.endLetter + (v.endNumber + (v.colour === 'black' ? +1 : -1) === enpassantCell ?.[1])
			);
			const enpassant = v.endLetter == enpassantCell ?.[0] && (validSideways(+1) || validSideways(-1));
			if (enpassant) enpassantTaken = true;
			console.log('debug', v.sameLetter,takingPiece,enpassant,pawnMove,forward)
			return (v.sameLetter || takingPiece || enpassant) && pawnMove && forward;
		default:
			return true;
	}
}

function pieceInWay(v) {
	let invalidMove = false;
	let direction = {};

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
			for (let i = 1; i <= Math.max(v.deltaLetter, v.deltaNumber) - 1; i++) {
				let letter = String.fromCharCode(parseInt(v.startLetter.charCodeAt(0)) + direction.l * i);
				let number = v.startNumber + direction.n * i;
				if (pieceInCell(letter + number)) invalidMove = true;
			}
			return invalidMove;
		default:
			return false;
	}
}
