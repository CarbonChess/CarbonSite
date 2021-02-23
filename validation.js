class Validation {
	constructor(colour, piece, startCell, endCell) {
		for (i in arguments) this[arguments[i]] = arguments[i];
		this.startNumber = parseInt(startCell[1]);
		this.endNumber = parseInt(endCell[1]);
		this.startLetter = startCell.charCodeAt(0);
		this.endLetter = endCell.charCodeAt(0);
		this.deltaLetter = Math.abs(this.endLetter - this.startLetter);
		this.deltaNum = Math.abs(this.endNumber - this.startNumber);
	}
}


function validateMove(colour, piece, startCell, endCell) {
	const startNumber = parseInt(startCell[1]);
	const endNumber = parseInt(endCell[1]);
	const startLetter = startCell.charCodeAt(0);
	const endLetter = endCell.charCodeAt(0);
	const deltaLetter = Math.abs(endLetter - startLetter);
	const deltaNum = Math.abs(endNumber - startNumber);

	// validate movement pattern
	const isValid = (function () {
		switch (piece) {
			case 'rook':
				return deltaLetter === 0 || deltaNum === 0;
			case 'knight':
				return deltaNum + deltaLetter == 3 && deltaLetter !== 0 && deltaNum !== 0;
			case 'king':
				return deltaLetter <= 1 && deltaNum <= 1;
			case 'bishop':
				return deltaLetter === deltaNum;
			case 'queen':
				return deltaLetter === 0 || deltaNum === 0 || deltaLetter === deltaNum;
			case 'pawn':
				const sameLetter = deltaLetter === 0;
				const takingPiece = deltaLetter === 1 && deltaNum === 1 && pieceInCell(endCell);
				const pawnMove = deltaNum === 1 || (deltaNum === 2 && ['2', '7'].includes(startCell[1]));
				const forward = colour === 'white' ? endNumber > startNumber : endNumber < startNumber;
				return (sameLetter || takingPiece) && pawnMove && forward;
		}
	})();

	// only move if path is free
	const pieceInWay = (function () {
		let invalidMove;
		let direction = {};

		// determine direction
		if (endLetter > startLetter) direction.l = 1;
		else if (endLetter < startLetter) direction.l = -1;
		else direction.l = 0;
		if (endNumber > startNumber) direction.n = 1;
		else if (endNumber < startNumber) direction.n = -1;
		else direction.n = 0;

		switch (piece) {
			case 'pawn':
				if (deltaLetter === 0) {
					if (colour === 'white') {
						invalidMove = pieceInCell(startCell[0] + (startNumber + 1));
						if (deltaNum === 2 && !invalidMove) {
							invalidMove = pieceInCell(startCell[0] + (startNumber + 2));
						}
					}
					else {
						invalidMove = pieceInCell(startCell[0] + (startNumber - 1));
						if (deltaNum === 2 && !invalidMove) {
							invalidMove = pieceInCell(startCell[0] + (startNumber - 2));
						}
					}
				}
				return invalidMove;
			case 'rook':
			case 'bishop':
			case 'queen':
				for (let i = 1; i <= Math.max(deltaLetter, deltaNum) - 1; i++) {
					let letter = String.fromCharCode(parseInt(startLetter) + direction.l * i);
					let number = startNumber + direction.n * i;
					console.log(letter, number, pieceInCell(letter + number))
					if (pieceInCell(letter + number)) invalidMove = true;
				}
				return invalidMove;
			default:
				return false;
		}
	})();
	return isValid && !pieceInWay;
}

function pieceInCell(cell) {
	return document.getElementById('piece' + cell) ?.classList.length > 0;
}
