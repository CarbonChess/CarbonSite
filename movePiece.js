/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
 * X = victory
*/

let selectedCell;
let totalMoves = 0;
let currentTurn = 'white';

function selectPiece(cell) {
	selectedCell = cell;
	let $cell = document.getElementById(selectedCell);
	$cell ?.classList.add('selected');
	console.log('S ' + selectedCell);
}

function hasClicked(cell) {

	let startingCell = selectedCell;
	let endingCell = cell;

	let $startingCell = document.getElementById(selectedCell);
	let $endingCell = document.getElementById(endingCell);
	let $startingPiece = document.getElementById('piece' + selectedCell);
	let $endingPiece = document.getElementById('piece' + endingCell);

	let startingClasses = Array.from($startingPiece ?.classList || []);
	let endingClasses = Array.from($endingPiece ?.classList || []);

	// Cancel a move
	if (cell == selectedCell) {
		// double click: cancel
		document.getElementById(selectedCell).classList.remove('selected');
		selectedCell = null;
		console.log('X ' + cell);
	}

	// Move piece
	else if (selectedCell) {
		// a cell has already been selected
		// move the piece

		$startingCell.classList.remove('selected');

		if (startingClasses) { // only go if the cell has metadata
			// is a piece: move it

			let isSameColour = (
				(startingClasses.includes('white') && endingClasses.includes('white'))
				||
				(startingClasses.includes('black') && endingClasses.includes('black'))
			);

			if (isSameColour) {
				// replace selected piece
				selectPiece(cell);
				console.log('T ' + startingClasses.join(' '));
			} else if (endingClasses.includes('king') && hasRules) {
				// end game
				document.getElementById(selectedCell).classList.remove('selected');
				selectedCell = null;
				console.log('X ' + cell);
			}
			else {
				// move piece

				let [colour, piece] = startingClasses;
				const originalPiece = piece;

				const valid = validateMove(piece, startingCell, endingCell);
				if (!valid && hasRules) {
					$startingCell.classList.add('selected');
					console.log('I ' + startingCell + ' -> ' + endingCell);
					return;
				}

				const canPromote = (
					piece === 'pawn'
					&& ['1', '8'].includes(endingCell[1])
				);
				if (canPromote) piece = 'queen';

				$startingCell.innerHTML = startingCell;
				$endingCell.innerHTML = '';
				$endingCell.appendChild(createPiece(piece, colour, endingCell));

				console.log('M ' + startingCell + ' -> ' + endingCell);
				log(colour, originalPiece, [startingCell, endingCell], totalMoves++, { taken: endingClasses[0], promoted: canPromote });
				selectedCell = null;

				if (currentTurn === 'white') {
					currentTurn = 'black';
				} else {
					currentTurn = 'white'
				}
			}

		}
	}

	// Select piece
	else if (endingClasses.includes(currentTurn) || !hasRules) {
		// the selected piece is one of the current player's
		// mark this piece as being in process of moving
		selectPiece(cell);
		console.log('T ' + document.getElementById('piece' + cell).getAttribute('class'));
	}

	// Invalid
	else {
		// empty square clicked without piece being selected first
		console.log('I ' + cell);
	}
}

function validateMove(piece, startCell, endCell) {
	const deltaLetter = Math.abs(endCell.charCodeAt(0) - startCell.charCodeAt(0));
	const deltaNumber = Math.abs(parseInt(endCell[1]) - parseInt(startCell[1]));

	if (piece === 'rook') {
		return deltaLetter === 0 || deltaNumber === 0;
	}
	else if (piece === 'knight') {
		return (
			deltaNumber + deltaLetter == 3
			&& (deltaLetter !== 0 || deltaNumber !== 0)
		);
	}
	else if (piece === 'king') {
		return deltaLetter <= 1 && deltaNumber <= 1;
	}
	else if (piece === 'bishop') {
		return deltaLetter === deltaNumber;
	}
	else if (piece === 'queen') {
		return (
			(deltaLetter === 0 || deltaNumber === 0)
			|| deltaLetter === deltaNumber
		);
	}
	else if (piece === 'pawn') {
		return (
			deltaLetter === 0
			&& (
				deltaNumber === 1
				|| (deltaNumber === 2 && ['2', '7'].includes(startCell[1]))
			)
		);
	}
}

function log(colour, piece, [startCell, endCell], count, { taken, promoted }) {
	let pieceID;
	switch (piece) {
		case 'pawn': pieceID = ''; break;
		case 'knight': pieceID = 'n'; break;
		default: pieceID = piece[0];
	}
	let box = document.getElementById('log');
	box.innerHTML += (
		`<span>`
		+ (count % 2 ? '' : count / 2 + 1 + '. ')
		+ pieceID.toUpperCase()
		+ (taken && piece === 'pawn' ? startCell[0].toLowerCase() : '')
		+ (taken ? 'x' : '')
		+ endCell.toLowerCase()
		+ (promoted ? '=Q' : '')
		+ '</span>'
	);
}
