// Board functions //

function newBoard(size, initial) {
	$('table').innerHTML = '';
	let emptyCells = [];
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
				emptyCells.push(cellName);
			}

			// add piece to board
			if (pieceName) {
				let piece = createPiece(pieceName, pieceColour, cellName);
				td.appendChild(piece);
			}
			tr.appendChild(td);
		}

	}
	if (initial) movesList.push(createFen());
	emptyCells.forEach(cell => resetCell(cell));
}

function createBoardFromFen(fenString) {
	createBoard(fenString);
	// fenString = decodeURIComponent(fenString);
	// history.pushState({}, '', location.href.replace(/\?.*$/, ''));

	const pieces = { 'p': 'pawn', 'b': 'bishop', 'n': 'knight', 'r': 'rook', 'q': 'queen', 'k': 'king' };
	let currentRow = 8;
	let currentColumn = 1;

	newBoard(8, false);
	$$('td').forEach(elem => resetCell(elem.id));

	if (fenString.match(/\//g).length !== 7) {
		console.error('Incorrect FEN');
		return;
	}

	// Create pieces
	const rows = fenString.split(' ')[0];
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
			clearCell(cell);
			getCell(cell).appendChild(createPiece(piece, colour, cell));
			currentColumn++;
		}
	}

	// Update current turn
	window.currentTurn = global.currentTurn === 'w' ? 'white' : 'black';

	// Update taken pieces
	$$('#white-pieces, #black-pieces').forEach(elem => elem.innerHTML = '');
	const takenPieces = getTakenPiecesFromFen();
	for (let i = 0; i < takenPieces.w.length; i++) {
		const c = takenPieces.w[i];
		logTakenPiece('white', pieces[c.toLowerCase()]);
	}
	for (let i = 0; i < takenPieces.b.length; i++) {
		const c = takenPieces.b[i];
		logTakenPiece('black', pieces[c]);
	}

}

const getCell = cell => $.id(cell);
const clearCell = cell => getCell(cell).innerHTML = '';
const resetCell = cell => getCell(cell).innerHTML = '<img src="/images/transparent.gif" data-piece="blank">';

// Options functions //

function toggleRules(button) {
	hasRules = !hasRules;
	['enabled', 'disabled'].forEach(c => button.classList.toggle(c));
	currentTurn = invertColour(currentTurn);
}

function flipBoard() {
	['rotate', 'norotate'].forEach(c => document.body.classList.toggle(c));
}

function alignBoard() {
	const classes = document.body.classList;
	if (currentTurn === 'black') {
		classes.add('rotate');
		classes.remove('norotate');
	} else {
		classes.remove('rotate');
		classes.add('norotate');
	}
}

function changeAutoflip(button) {
	autoflip = !autoflip;
	button.classList.toggle('enabled');
	button.classList.toggle('disabled');
}

function shareGame() {
	if (!window.multiplayer) window.gameId = randomID();
	const newUrl = location.href.replace(location.search || /$/, `?multiplayer=on&static=on&gamecode=${window.gameId}`);
	sendDB();
	copy(newUrl);
	alert('A link to this board has been copied to your clipboard');
}
