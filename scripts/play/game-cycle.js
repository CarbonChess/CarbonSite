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
		window.selectedCell = null;
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
		// const colour = global.currentTurn === 'w' ? 'white' : 'black';

		$$('td').forEach(elem => elem.classList.remove('valid'));
		$startCell.classList.remove('selected');

		if (!startClasses) return; // exit if the cell does not has metadata

		// move the piece
		const moveOutput = validation.makeMove(startCell, endCell);
		if (!moveOutput) {
			console.log('I', startCell, '->', endCell);
			if (getPieceClasses(endCell).length > 0) selectPiece(endCell);
			return;
		}
		createBoardFromFen(moveOutput);
		$$('td').forEach(elem => elem.classList.remove('last-move'));
		$startCell.classList.add('last-move');
		$endCell.classList.add('last-move');
		window.selectedCell = null;

		// check if in check
		if (isCheck('w')) $('.white.king').parentElement.classList.add('check');
		if (isCheck('b')) $('.black.king').parentElement.classList.add('check');

		// display taken piece on side
		let taken = false;
		if (endClasses.length && (moveOutput || !window.hasRules)) {
			taken = true;
			logTakenPiece(...getPieceClasses(enpassantCell || endCell));
		}

		// log the move
		window.totalMoves++;
		console.log('M', startCell, '->', endCell);
		log({ startCell, endCell, classes:endClasses, count: totalMoves, taken, /*promoted, castled,*/ check: isCheck(global.currentTurn) });

		// hide promotion box
		$('#promotion').classList.add('hide');
		$$('#promotion img').forEach(elem => elem.classList.remove('selected'));

		// align board
		if (window.hasRules && window.autoFlip) alignBoard();

		// send to server
		if (autoPing) sendDB(gameId, createFen());

	}

	// Select piece //
	else if ($cell && (!window.hasRules || cellClasses.includes(global.currentTurn === 'w' ? 'white' : 'black'))) {
		// the piece is selectable
		// mark this piece as being in process of moving

		const isPawn = cellClasses.includes('pawn');
		const whiteRow2 = cellClasses.includes('white') && +cell[1] === 7;
		const blackRow2 = cellClasses.includes('black') && +cell[1] === 2;
		if (isPawn && (!window.hasRules || whiteRow2 || blackRow2)) {
			$.id('promotion').classList.remove('hide');
		}

		selectPiece(cell);
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
	createBoardFromFen(undoMove());
	ingame = true;
	window.totalMoves--;
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
