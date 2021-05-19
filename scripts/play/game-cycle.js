function hasClicked(cell) {
	if (
		!window.ingame
		|| gameOptions.spectating
		|| gameOptions.multiplayer && window.currentTurn !== window.playerTurn
	) return;

	const $cell = $.id('piece' + cell);
	const cellClasses = $cell ? Array.from($cell.classList) : [];

	// Cancel a move //
	if (cell === selectedCell) {
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

		const startCell = selectedCell;
		const endCell = cell;
		const $startCell = $.id(selectedCell);
		const $endCell = $.id(endCell);
		const $startPiece = $.id('piece' + selectedCell);
		const $endPiece = $.id('piece' + endCell);
		const startClasses = getClasses($startPiece);
		const endClasses = getClasses($endPiece);

		$$('td').forEach(elem => elem.classList.remove('valid'));
		$startCell.classList.remove('selected');

		if (!startClasses) return; // exit if the cell does not has metadata

		// display taken piece on side
		if (endClasses.length && (validMove || !hasRules)) {
			taken = true;
			logTakenPiece(...getPieceClasses(enpassantCell || endCell));
		}

		// move the piece
		const valid = validation.movePiece(startCell, endCell);
		if (!valid) {
			console.log('I', startCell, '->', endCell);
			return;
		}
		$$('td').forEach(elem => elem.classList.remove('last-move'));
		$startCell.classList.add('last-move');
		$endCell.classList.add('last-move');
		selectedCell = null;

		// log the move
		console.log('M', startCell, '->', endCell);
		log(
			colour, originalPiece, startCell, endCell, endClasses, totalMoves++,
			{ taken: taken, promoted: canPromote, castled: hasCastled, check: isCheck(colour) }
		);

		// hide promotion box
		$('#promotion').classList.add('hide');
		$$('#promotion img').forEach(elem => elem.classList.remove('selected'));

		// switch turn
		if (hasRules) {
			currentTurn = invertColour(currentTurn);
			if (autoFlip) alignBoard();
		}

		// send to server
		if (autoPing) sendDB(gameId, createFen());

	}

	// Select piece //
	else if ($cell && (!hasRules || (cellClasses.includes(currentTurn)))) {
		// the piece is selectable
		// mark this piece as being in process of moving

		const isPawn = cellClasses.includes('pawn');
		const isInSecondRow = (
			(cellClasses.includes('white') && +cell[1] === 7)
			||
			(cellClasses.includes('black') && +cell[1] === 2)
		);
		if (isPawn && (!hasRules || isInSecondRow)) {
			document.getElementById('promotion').classList.remove('hide');
		}

		selectPiece(cell);
		if (hasRules) {
			findAllMoves(cell).forEach(cell => getCell(cell).classList.add('valid'));
		}
		console.log('\n' + (totalMoves + 1));
		console.log('T', ...cellClasses);

		$$('#promotion img').forEach(elem => {
			elem.setAttribute('class', elem.getAttribute('class').replace(/white|black/, $cell.classList[0]));
		});
	}

	// Invalid //
	else if (cell) {
		// empty square selected
		console.log('I', cell);
	}
}

function undoLastMove() {
	if (totalMoves === 0 || movesList.length === 0) return;
	ingame = true;
	movesList.pop();
	const movesListLast = movesList[movesList.length - 1];
	createBoardFromFen(movesListLast);
	currentTurn = invertColour(currentTurn);
	kingCell[currentTurn[0]] = $(`.${currentTurn}.king`).parentNode.id;
	totalMoves--;
	currentTurn = invertColour(currentTurn);
	logPoints();
	if (autoFlip) alignBoard();
	$$(`[data-move="${totalMoves}"]`).forEach(elem => {
		if (elem.parentNode) elem.parentNode.innerHTML = '';
	});
	$('#log').removeChild($('#log').lastChild);
	$('#winner').innerText = '';
	if (autoPing) sendDB(gameId, createFen());
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
