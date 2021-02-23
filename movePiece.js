let selectedCell;
let promotionPiece;
let totalMoves = 0;
let currentTurn = 'white';

function selectPiece(cell) {
	selectedCell = cell;
	let $cell = document.getElementById(selectedCell);
	$cell ?.classList.add('selected');
	console.log('S', selectedCell);
}

function hasClicked(cell) {

	const $cell = document.getElementById('piece' + cell);

	// Cancel a move
	if (cell == selectedCell) {
		// double click: cancel
		document.getElementById(selectedCell).classList.remove('selected');
		selectedCell = null;
		console.log('X', cell);
	}

	// Move piece
	else if (cell && selectedCell) {
		// a cell has already been selected
		// move the piece

		let startCell = selectedCell;
		let endCell = cell;

		let $startCell = document.getElementById(selectedCell);
		let $endCell = document.getElementById(endCell);
		let $startPiece = document.getElementById('piece' + selectedCell);
		let $endPiece = document.getElementById('piece' + endCell);

		let startClasses = Array.from($startPiece ?.classList || []);
		let endClasses = Array.from($endPiece ?.classList || []);

		$startCell.classList.remove('selected');

		if (startClasses) {
			// only go if the cell has metadata
			// is a piece: move it

			let isSameColour = (
				(startClasses.includes('white') && endClasses.includes('white'))
				||
				(startClasses.includes('black') && endClasses.includes('black'))
			);

			if (isSameColour) {
				// replace selected piece
				selectPiece(cell);
				console.log('T', ...startClasses);
			}
			/*
			else if (endClasses.includes('king') && hasRules) {
				// end game
				document.getElementById(selectedCell).classList.remove('selected');
				selectedCell = null;
				console.log('X', cell);
			}
			*/
			else {
				// move piece

				let [colour, piece] = startClasses;
				const originalPiece = piece;

				// only move if able
				const valid = validateMove(colour, piece, startCell, endCell);
				if (!valid && hasRules) {
					$startCell.classList.add('selected');
					console.log('I', startCell, '->', endCell);
					return;
				}

				// special moves
				const canPromote = piece === 'pawn' && ['1', '8'].includes(endCell[1]);
				if (canPromote) {
					let promote = prompt('Select piece'); // TODO better
					promotionPiece = promote;
					if (!['pawn', 'bishop', 'knight', 'rook'].includes(promote)) piece = 'queen';
					else piece = promotionPiece;
				}

				// move the piece
				$startCell.innerHTML = startCell;
				$endCell.innerHTML = '';
				$endCell.appendChild(createPiece(piece, colour, endCell));

				// log the move
				console.log('M', startCell, '->', endCell);
				log(colour, originalPiece, startCell, endCell, totalMoves++, { taken: endClasses[0], promoted: canPromote });
				selectedCell = null;

				// switch turn
				currentTurn = currentTurn === 'white' ? 'black' : 'white';
				if (autoflip && hasRules) flipBoard();
			}

		}
	}

	// Select piece
	else if ($cell && ($cell.getAttribute('class').includes(currentTurn) || !hasRules)) {
		// the piece is selectable
		// mark this piece as being in process of moving
		selectPiece(cell);
		console.log('T', $cell.getAttribute('class'));
	}

	// Invalid
	else {
		// empty square clicked without piece being selected first
		console.log('I', cell);
	}
}

function log(colour, piece, startCell, endCell, count, { taken, promoted }) {
	const checkID = function (piecetype) {
		switch (piecetype) {
			case 'pawn': return '';
			case 'knight': return 'N';
			default: return piecetype[0].toUpperCase();
		}
	}
	let pieceID = checkID(piece);
	let box = document.getElementById('log');
	box.innerHTML += (
		`<span class>`
		+ (count % 2 ? '' : count / 2 + 1 + '. ')
		+ pieceID
		+ (taken && piece === 'pawn' ? startCell[0].toLowerCase() : '')
		+ (taken ? 'x' : '')
		+ endCell.toLowerCase()
		+ (promoted ? '=' + checkID(promotionPiece) : '')
		+ '</span>'
	);
}

/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
 * X = victory
*/
