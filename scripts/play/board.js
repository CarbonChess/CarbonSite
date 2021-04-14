// Board functions //

function createBoard(size, initial) {
	$('table').innerHTML = '';
	for (i = 1; i <= size; i++) {

		const tr = document.createElement('tr');
		tr.id = 'r' + i;
		$('table').appendChild(tr);

		for (j = 1; j <= size; j++) {

			const cellName = indexToLetter(j) + (9 - i);
			const td = document.createElement('td');

			td.id = cellName;
			td.setAttribute('onclick', `hasClicked('${cellName}')`);
			td.setAttribute('ondragstart', `hasClicked('${cellName}')`);
			td.setAttribute('ondrop', `event.preventDefault();hasClicked('${cellName}')`);
			td.setAttribute('ondragover', 'event.preventDefault()');

			// add pieces
			let pieceName, pieceColour;
			pieceColour = (i < size / 2) ? 'black' : 'white';

			if (i === 1 || i === size) {
				// first rows
				const cell = n => j === n || j === size - n + 1;
				if (cell(1)) pieceName = 'rook';
				else if (cell(2)) pieceName = 'knight';
				else if (cell(3)) pieceName = 'bishop';
				else if (j === 4) pieceName = 'queen';
				else if (j === size - 3) pieceName = 'king';
			}
			else if (i === 2 || i === size - 1) {
				// second rows
				pieceName = 'pawn';
			}
			else {
				// no pieces
				td.innerHTML = cellName;
			}

			// add piece to board
			if (pieceName) {
				let piece = createPiece(pieceName, pieceColour, cellName);
				td.appendChild(piece);
			}
			tr.appendChild(td);
		}

	}
	if (initial) movesList.push(createFen())
}

function createBoardFromFen(fenString) {
	fenString = decodeURIComponent(fenString);
	history.pushState({}, '', location.href.replace(/\?.*$/, ''));

	const pieces = { 'p': 'pawn', 'b': 'bishop', 'n': 'knight', 'r': 'rook', 'q': 'queen', 'k': 'king' };
	let currentRow = 8;
	let currentColumn = 1;

	createBoard(8, false);
	$$('td').forEach(elem => elem.innerHTML = elem.id);

	if (fenString.match(/\//g).length !== 7) {
		console.error('Incorrect FEN');
		return;
	}

	// Create pieces
	let [rows, ...data] = fenString.split(' ');
	for (let i = 0; i < rows.length; i++) {
		const char = rows[i];
		if (char === '\/') {
			currentColumn = 1;
			currentRow--;
		}
		else if (/[0-9]/.test(char)) {
			currentColumn += +char;
		}
		else if (currentColumn <= 8) {
			let colour = char === char.toUpperCase() ? 'white' : 'black';
			let piece = pieces[char.toLowerCase()];
			const cell = indexToLetter(currentColumn) + currentRow;
			getCell(cell).innerHTML = '';
			getCell(cell).appendChild(createPiece(piece, colour, cell));
			currentColumn++;
		}
	}

	// Update metadata
	window.enpassantCell = getEnpassantFromFen(fenString);
	window.castling = getCastlingFromFen(fenString);
	window.points = getPointsFromFen(fenString);
	window.fmrMoves = getFmrFromFen(fenString);
	if (!movesList.length) movesList = [fenString];
	updateKingCells();
	currentTurn = getCurrentTurnFromFen(fenString);
	checkKingStatus(currentTurn);

	// Update taken pieces
	$$('#white-pieces, #black-pieces').forEach(elem => elem.innerHTML = '');
	const takenPieces = getTakenPiecesFromFen(fenString);
	for (let i = 0; i < takenPieces.w.length; i++) {
		const c = takenPieces.w[i];
		logTakenPiece('white', pieces[c.toLowerCase()]);
	}
	for (let i = 0; i < takenPieces.b.length; i++) {
		const c = takenPieces.b[i];
		logTakenPiece('black', pieces[c]);
	}

}

function clearCells(...cells) {
	for (let cell of cells) {
		getCell(cell).innerHTML = cell;
	}
}

const getCell = cell => $.id(cell);

// Options functions //

function toggleRules(button) {
	hasRules = !hasRules;
	button.classList.toggle("enabled");
	button.classList.toggle("disabled");
	currentTurn = invertColour(currentTurn);
}

function flipBoard(force) {
	const elem = $('body');
	if (force) {
		elem.classList.toggle('rotate');
	}
	else {
		elem.classList.remove('rotate')
		if (currentTurn === 'black') elem.classList.add('rotate');
	}
}

function changeAutoflip(button) {
	autoflip = !autoflip;
	button.classList.toggle('enabled');
	button.classList.toggle('disabled');
}
