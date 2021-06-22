function hasClicked(cell) {
	if (
		!window.ingame
		|| gameOptions.spectating
		|| gameOptions.multiplayer && global.currentTurn !== window.playerTurn[0]
	) return;

	cell = cell.toUpperCase();
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
		const $startPiece = $.id('piece' + startCell);
		const $endPiece = $.id('piece' + endCell);
		const startClasses = getClasses($startPiece);
		const endClasses = getClasses($endPiece);
		const [colour, piece] = startClasses;

		$$('td').forEach(elem => elem.classList.remove('valid'));
		$.id(startCell).classList.remove('selected');
		window.selectedCell = null;

		if (!startClasses) return; // exit if the cell does not has metadata

		// promotion
		const canPromote = piece === 'pawn' && ['1', '8'].includes(endCell[1]);
		if (canPromote) {
			global.promotionPiece = getPieceID(window.promotionPiece).toLowerCase();
		}

		// move the piece
		const moveOutput = validation.makeMove(startCell, endCell);
		if (window.hasRules) {
			if (!moveOutput) {
				console.log('I', startCell, '->', endCell);
				if (getPieceClasses(endCell)[0] === colour) selectPiece(endCell);
				else selectPiece(startCell);
				return;
			}
			createBoardFromFen(moveOutput);
		}
		else {
			movePiece(startCell, endCell);
		}
		window.lastMove = { start: startCell, end: endCell };
		checkHighlight();

		// log the move
		const taken = endClasses.length && (moveOutput || !window.hasRules);
		window.totalMoves++;
		console.log('M', startCell, '->', endCell);
		log({ startCell, endCell, startClasses, endClasses, taken, promoted: canPromote });

		// hide promotion box
		window.promotionPiece = 'queen';
		$('#promotion').classList.add('hide');
		$$('#promotion img').forEach(elem => elem.classList.remove('selected'));

		// align board
		if (window.hasRules && window.autoFlip) alignBoard();

		// check game ending status
		checkGameEnding();

		// check if correct puzzle move has been made
		if (window.gameOptions.puzzles && puzzleColour === global.currentTurn && movesToMake) {
			if (startCell === movesToMake[0].slice(0, 2).toUpperCase() && endCell === movesToMake[0].slice(2, 4).toUpperCase()) {
				movesToMake.shift();
				if (movesToMake.length > 0) {
					$.id('winner').innerHTML = 'Correct, now find the next one'
					setTimeout(puzzleMove, 500);
				}
				else {
					$.id('winner').innerHTML = 'Congrats, you are a puzzle god';
					$.id('next-puzzle').classList.remove('hide');
				}
			}
			else {
				undoLastMove();
				$.id('winner').innerHTML = 'Wrong, try again';
				window.failedPuzzleAttempts++;
			}
			$.id('puzzle-attempts-value').innerText = window.failedPuzzleAttempts;
		}

		// send to server
		if (window.autoPing) sendDB();

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
		console.log('\n' + (window.totalMoves + 1));
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

function checkHighlight() {
	if (isCheck('w')) $('.white.king').parentElement.classList.add('check');
	if (isCheck('b')) $('.black.king').parentElement.classList.add('check');

	const { start, end } = window.lastMove;
	$$('td').forEach(elem => elem.classList.remove('last-move'));
	[start, end].forEach(cell => $.id(cell)?.classList.add('last-move'));
}

function checkGameEnding() {
	const endingStatus = gameEndingStatus(global.currentTurn);
	if (!endingStatus) return;
	let winText = (global.currentTurn !== 'w' ? 'White' : 'Black') + ' Wins';
	let statusMsg = endingStatus === 'stalemate' ? 'Stalemate' : winText;
	$('#winner').innerText = statusMsg;
	window.ingame = false;
}

function undoLastMove() {
	if (window.totalMoves === 0 || global.moveList.length === 0) return;
	createBoardFromFen(undoMove());
	window.ingame = true;
	window.totalMoves--;
	logPoints();
	checkHighlight();
	if (window.autoFlip) alignBoard();
	$$(`[data-move="${totalMoves}"]`).forEach(elem => elem.parentNode.innerHTML = '');
	$('#log').removeChild($('#log').lastChild);
	$('#winner').innerText = '';
	if (window.autoPing) sendDB();
	if (gameOptions.bot && global.currentTurn === gameOptions.botColour[0]) undoLastMove();
}

function threefoldRepetition() {
	const lastFen = movesList[movesList.length - 1].replace(/ . .$/, '');
	let repetitions = 0;
	movesList.forEach(move => (move.replace(/ . .$/, '') === lastFen) && repetitions++);
	return repetitions >= 3;
}
