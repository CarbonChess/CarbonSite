function selectPiece(cell) {
	selectedCell = cell;
	const $cell = document.getElementById(selectedCell);
	$cell ?.classList.add('selected');
	console.log('S', selectedCell);
}

function hasClicked(cell) {

	const $cell = document.getElementById('piece' + cell);
	const cellClasses = $cell ? Array.from($cell.classList) : [];

	// Cancel a move //
	if (cell == selectedCell) {
		// double click: cancel
		document.getElementById(selectedCell).classList.remove('selected');
		selectedCell = null;
		console.log('X', cell);
	}

	// Move piece //
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
			// is a piece: move it
			// only move if the cell has metadata

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
			else {
				// prepare to move piece

				let [colour, piece] = startClasses;
				const originalPiece = piece;

				// Special moves //

				// castling
				const deltaLetter = Math.abs(endCell.charCodeAt(0) - startCell[0].charCodeAt(0));
				let hasCastled = false;
				if (piece === 'king' && deltaLetter === 2 && endCell[1] === startCell[1]) {
					const queenside = endCell[0] < startCell[0];
					const validCastling = validateMove(colour, 'castle', startCell, (queenside ? 'B' : 'G') + startCell[1]) && window.castling[currentTurn[0]][queenside ? 'q' : 'k'];
					if (validCastling) {
						hasCastled = true;
						let row = colour === 'white' ? 1 : 8;
						[kingCell, rookCell] = queenside ? ['C' + row, 'D' + row] : ['G' + row, 'F' + row];
						clearCells('E' + row, queenside ? 'A' + row : 'H' + row);
						addPiece('king', colour, kingCell);
						addPiece('rook', colour, rookCell);
					}
				}

				// refresh castling rights 
				if (piece === 'king') {
					castling[currentTurn[0]] = { k: false, q: false };
				}
				else if (piece === 'rook') {
					if (startCell.includes('A')) castling[currentTurn[0]].q = false;
					else if (startCell.includes('H')) castling[currentTurn[0]].k = false;
				}

				// promotion
				const canPromote = piece === 'pawn' && ['1', '8'].includes(endCell[1]);
				if (canPromote) piece = promotionPiece;

				// Move piece //

				// validate move
				const validMove = validateMove(colour, piece, startCell, endCell);
				if (!validMove && hasRules && !hasCastled) {
					$startCell.classList.add('selected');
					console.log('I', startCell, '->', endCell);
					return;
				}

				// check en passant
				// must be after validation
				if (enpassantTaken && enpassantCell) clearCells(enpassantCell);
				enpassantCell = piece === 'pawn' && Math.abs(endCell[1] - startCell[1]) === 2 ? endCell : null;

				// move the piece
				$startCell.innerHTML = startCell;
				$endCell.innerHTML = '';
				$endCell.appendChild(createPiece(piece, colour, endCell));
				selectedCell = null;

				// log the move
				console.log('M', startCell, '->', endCell);
				log(
					colour, originalPiece, startCell, endCell, totalMoves++,
					{ taken: endClasses[0], promoted: canPromote, castled: hasCastled }
				);

				// hide promotion box
				document.querySelector('#promotion').classList.add('hide');
				document.querySelectorAll('#promotion img').forEach(elem => elem.classList.remove('selected'));

				// switch turn
				if (hasRules) {
					currentTurn = currentTurn === 'white' ? 'black' : 'white';
					if (autoflip) flipBoard();
				}
			}

		}
	}

	// Select piece //
	else if ($cell && (cellClasses.includes(currentTurn) || !hasRules)) {
		// the piece is selectable
		// mark this piece as being in process of moving

		console.log('\n' + (totalMoves + 1)); // spacer
		if (
			!hasRules && cellClasses.includes('pawn')
			||
			(cellClasses.includes('white') && +cell[1] === 7)
			||
			(cellClasses.includes('black') && +cell[1] === 2)
		) document.getElementById('promotion').classList.remove('hide');
		selectPiece(cell);
		console.log('T', ...cellClasses);
	}

	// Invalid //
	else {
		// empty square selected
		console.log('I', cell);
	}
}

function setPromotion(elem) {
	let piece = elem.classList[1];
	document.querySelectorAll('#promotion img').forEach(elem => elem.classList.remove('selected'));
	elem.classList.add('selected');
	promotionPiece = piece;
}

function log(colour, piece, startCell, endCell, count, { taken, promoted, castled, check }) {
	const checkID = function (piecetype) {
		switch (piecetype) {
			case 'pawn': return '';
			case 'knight': return 'N';
			default: return piecetype[0].toUpperCase();
		}
	}
	let pieceID = checkID(piece);
	let box = document.getElementById('log');

	let code = '';
	if (count % 2 === 0 && hasRules) code += count / 2 + 1 + '. ';
	if (castled) code += endCell.charCodeAt(0) < 'D'.charCodeAt(0) ? '0-0-0' : '0-0';
	else {
		code += pieceID;
		if (taken && piece === 'pawn') code += startCell[0].toLowerCase();
		if (taken || enpassantTaken) code += 'x';
		code += endCell.toLowerCase();
		if (promoted) code += '=' + checkID(promotionPiece);
	}
	if (check) code += '+'
	box.innerHTML += `<span>` + code + '</span>';
}

/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
*/
