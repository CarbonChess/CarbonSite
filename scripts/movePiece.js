function selectPiece(cell) {
	selectedCell = cell;
	const $cell = document.getElementById(selectedCell);
	$cell ?.classList.add('selected');
	console.log('S', selectedCell);
}

function hasClicked(cell) {

	const $cell = $.id('piece' + cell);
	const cellClasses = $cell ? Array.from($cell.classList) : [];

	// Cancel a move //
	if (cell == selectedCell) {
		// double click: cancel
		$$('td').forEach(elem => elem.classList.remove('valid'));
		$.id(selectedCell).classList.remove('selected');
		selectedCell = null;
		console.log('X', cell);
	}

	// Move piece //
	else if (cell && selectedCell) {
		// a cell has already been selected
		// move the piece

		let startCell = selectedCell;
		let endCell = cell;

		let $startCell = $.id(selectedCell);
		let $endCell = $.id(endCell);
		let $startPiece = $.id('piece' + selectedCell);
		let $endPiece = $.id('piece' + endCell);

		let startClasses = getClasses($startPiece);
		let endClasses = getClasses($endPiece);

		$$('td').forEach(elem => elem.classList.remove('valid'));
		$startCell.classList.remove('selected');

		if (startClasses) {
			// is a piece: move it
			// only move if the cell has metadata

			const isSameColour = (
				(startClasses.includes('white') && endClasses.includes('white'))
				||
				(startClasses.includes('black') && endClasses.includes('black'))
			);

			if (isSameColour) {
				// replace selected piece
				selectPiece(cell);
				findAllMoves(cell).forEach(cell => getCell(cell).classList.add('valid'));
				console.log('T', ...startClasses);
			}
			else {
				// prepare to move piece

				let [colour, piece] = startClasses;
				const originalPiece = piece;
				let startsInCheck = isCheck(colour);
				window.last = {castling, enpassantCell, points};

				// Special moves //

				// castling
				let hasCastled = false;
				if (piece === 'king') {
					const { castlingValid, cells: newCells } = checkCastling(new Validation(colour, 'king', startCell, endCell));
					if (castlingValid) {
						hasCastled = true;
						const queenside = endCell[0] < startCell[0];
						const row = colour === 'white' ? 1 : 8;
						clearCells('E' + row, queenside ? 'A' + row : 'H' + row);
						addPiece('king', colour, newCells.king);
						addPiece('rook', colour, newCells.rook);
					}
					castling[currentTurn[0]] = { k: false, q: false };
				}
				else if (piece === 'rook') {
					if (startCell.includes('A')) castling[currentTurn[0]].q = false;
					else if (startCell.includes('H')) castling[currentTurn[0]].k = false;
				}

				// promotion
				const canPromote = piece === 'pawn' && ['1', '8'].includes(endCell[1]);
				if (canPromote) piece = promotionPiece; //todo fix

				// Move piece //

				// validate move
				const validMove = validateMove(colour, piece, startCell, endCell);
				if (!validMove && hasRules && !hasCastled) {
					$startCell.classList.add('selected');
					findAllMoves(startCell).forEach(cell => getCell(cell).classList.add('valid'));
					console.log('I', startCell, '->', endCell);
					return;
				}

				// check en passant
				if (enpassantTaken && enpassantCell) clearCells(enpassantCell);
				enpassantCell = piece === 'pawn' && Math.abs(endCell[1] - startCell[1]) === 2 ? endCell : null;

				// log taken piece
				if (endClasses.length && (validMove || !hasRules)) {
					let [colour, piece] = getPieceClasses(endCell);
					let takenPiece = createPiece(piece, colour);
					$.id(colour + '-pieces').appendChild(takenPiece);
				}

				// move the piece
				if (startsInCheck) { }
				$startCell.innerHTML = startCell;
				$endCell.innerHTML = '';
				$endCell.appendChild(createPiece(piece, colour, endCell));
				if (startsInCheck && isCheck(colour)) { }
				$$('td').forEach(elem => elem.classList.remove('last-move'));
				$startCell.classList.add('last-move');
				$endCell.classList.add('last-move');
				selectedCell = null;

				// highlight if in check
				const opposingColour = invertColour(colour);
				kingCell[colour[0]] = $(`.${colour}.king`).parentNode.id;
				$$(`td`).forEach(elem => elem.classList.remove('check'));
				if (isCheck(colour)) getCell(kingCell[colour[0]]).classList.add('check');
				if (isCheck(opposingColour)) getCell(kingCell[opposingColour[0]]).classList.add('check');

				// log the move
				console.log('M', startCell, '->', endCell);
				log(
					colour, originalPiece, startCell, endCell, totalMoves++,
					{ taken: endClasses[1], promoted: canPromote, castled: hasCastled }
				);
				movesList.push(createFen());

				// hide promotion box
				$('#promotion').classList.add('hide');
				$$('#promotion img').forEach(elem => elem.classList.remove('selected'));

				// switch turn
				if (hasRules) {
					currentTurn = invertColour(currentTurn);
					if (autoflip) flipBoard();
				}
			}

		}
	}

	// Select piece //
	else if ($cell && (cellClasses.includes(currentTurn) || !hasRules)) {
		// the piece is selectable
		// mark this piece as being in process of moving

		const isPawn = cellClasses.includes('pawn');
		const isInSecondRow = (cellClasses.includes('white') && +cell[1] === 7) || (cellClasses.includes('black') && +cell[1] === 2);
		if (isPawn && (!hasRules || isInSecondRow)) {
			document.getElementById('promotion').classList.remove('hide');
		}

		selectPiece(cell);
		console.log(cell);
		if (hasRules) {
			findAllMoves(cell).forEach(cell => getCell(cell).classList.add('valid'));
		}
		console.log('\n' + (totalMoves + 1)); // spacer
		console.log('T', ...cellClasses);

		$$('#promotion img').forEach(elem => {
			elem.classList.remove('white');
			elem.classList.remove('black');
			elem.classList.add($cell.classList[0]);
		});
	}

	// Invalid //
	else {
		// empty square selected
		console.log('I', cell);
	}
}

function undoLastMove() {
	if (totalMoves === 0) return;
	movesList.pop();
	createBoardFromFen(movesList.pop());
	totalMoves--;
	currentTurn = invertColour(currentTurn);
	window.castling = window.last.castling;
	window.enpassantCell = window.last.enpassantCell;
	window.points = window.last.points;
	$('#log').removeChild($('#log').lastChild);
}

function setPromotion(elem) {
	// used in index.html
	const [colour, piece] = elem.classList;
	$$('#promotion img').forEach(elem => elem.classList.remove('selected'));
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

	if (taken) {
		const col = colour[0];
		switch (taken) {
			case 'pawn': points[col] += 1; break;
			case 'knight': points[col] += 3; break;
			case 'bishop': points[col] += 3; break;
			case 'rook': points[col] += 5; break;
			case 'queen': points[col] += 9; break;
			case 'king': points[col] += Infinity; break; // rmv when check
		}
		const pointsDiff = { w: points.b - points.w, b: points.w - points.b }
		$.id('white-points').innerText = pointsDiff.w > 0 ? '+' + pointsDiff.w : '';
		$.id('black-points').innerText = pointsDiff.b > 0 ? '+' + pointsDiff.b : '';
	}

	let code = '';
	if (count % 2 === 0 && hasRules) code += '<br>' + (count / 2 + 1) + '. ';
	if (castled) {
		code += endCell.charCodeAt(0) < 'D'.charCodeAt(0) ? '0-0-0' : '0-0';
	}
	else {
		code += checkID(piece);
		if (taken && piece === 'pawn') code += startCell[0].toLowerCase();
		if (taken || enpassantTaken) code += 'x';
		code += endCell.toLowerCase();
		if (promoted) code += '=' + checkID(promotionPiece);
	}
	if (check) code += '+';
	$('#log').innerHTML += `<span class="move">` + code + '</span>';
}

/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
*/
