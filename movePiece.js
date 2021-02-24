function selectPiece(cell) {
	selectedCell = cell;
	const $cell = document.getElementById(selectedCell);
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

				// check if trying to castle
				const deltaLetter = Math.abs(endCell.charCodeAt(0) - startCell[0].charCodeAt(0));
				let hasCastled;
				if (piece === 'king' && deltaLetter === 2 && endCell[1] === startCell[1]) {
					const queenside = endCell[0] < startCell[0];
					const validCastling = validateMove(colour, 'castle', startCell, (queenside ? 'B' : 'G') + startCell[1]) && window.castling[currentTurn[0]][queenside ? 'q' : 'k'];
					if (validCastling) {
						hasCastled = true;
						if (queenside) {
							[kingCell, rookCell] = colour === 'white' ? ['C1', 'D1'] : ['C8', 'D8'];
						} else {
							[kingCell, rookCell] = colour === 'white' ? ['G1', 'F1'] : ['G8', 'F8'];
						}
						if (colour === 'white') clearCells('E1', queenside ? 'A1' : 'H1');
						else clearCells('E8', queenside ? 'A8' : 'H8');

						addPiece('king', colour, kingCell);
						addPiece('rook', colour, rookCell);
					}
				}

				// only move if able
				const validMove = validateMove(colour, piece, startCell, endCell);
				if (!validMove && hasRules && !hasCastled) {
					$startCell.classList.add('selected');
					console.log('I', startCell, '->', endCell);
					return;
				}

				// special moves
				const canPromote = piece === 'pawn' && ['1', '8'].includes(endCell[1]);
				if (canPromote) piece = promotionPiece;

				// move the piece
				$startCell.innerHTML = startCell;
				$endCell.innerHTML = '';
				$endCell.appendChild(createPiece(piece, colour, endCell));
				selectedCell = null;

				// check castling rights 
				if (piece === 'king') {
					castling[currentTurn[0]] = { k: false, q: false };
				}
				else if (piece === 'rook') {
					if (startCell.includes('A')) castling[currentTurn[0]].q = false;
					else if (startCell.includes('H')) castling[currentTurn[0]].k = false;
				}

				// check en passant
				if (enpassantTaken) clearCells(enpassantCell);
				enpassantCell = piece === 'pawn' && Math.abs(endCell[1] - startCell[1]) === 2 && endCell;

				// log the move
				console.log('M', startCell, '->', endCell);
				log(colour, originalPiece, startCell, endCell, totalMoves++, { taken: endClasses[0], promoted: canPromote });

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

	// Select piece
	else if ($cell && ($cell.getAttribute('class').includes(currentTurn) || !hasRules)) {
		const classes = $cell.getAttribute('class');
		// the piece is selectable
		// mark this piece as being in process of moving
		if (
			!hasRules && classes.includes('pawn')
			||
			(classes.includes('white') && +cell[1] === 7)
			||
			(classes.includes('black') && +cell[1] === 2)
		) document.getElementById('promotion').classList.remove('hide');
		selectPiece(cell);
		console.log('T', classes);
	}

	// Invalid
	else {
		// empty square clicked without piece being selected first
		console.log('I', cell);
	}
}

function setPromotion(elem) {
	let piece = elem.getAttribute('class').replace(/white|black| /g, '');
	document.querySelectorAll('#promotion img').forEach(elem => elem.classList.remove('selected'));
	elem.classList.add('selected');
	promotionPiece = piece;
}

function log(colour, piece, startCell, endCell, count, { taken, promoted, castled }) {
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
	if (!(count % 2)) code += count / 2 + 1 + '. ';
	if (castled) code += endCell.charCodeAt(0) < 'D'.charCodeAt(0) ? '000' : '00';
	else {
		code += pieceID;
		if (taken && piece === 'pawn') code += startCell[0].toLowerCase();
		if (taken || enpassantTaken) code += 'x';
		code += endCell.toLowerCase();
		if (promoted) code += '=' + checkID(promotionPiece);
	}
	box.innerHTML += `<span>` + code + '</span>';
}

/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
 * X = victory
*/
