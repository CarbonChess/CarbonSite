// Board functions //

function newBoard(size) {
	$('table').innerHTML = '';
	let emptyCells = [];
	for (let i = 1; i <= size; i++) {

		const tr = document.createElement('tr');
		tr.id = 'r' + i;
		$('table').appendChild(tr);

		for (let j = 1; j <= size; j++) {

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
	emptyCells.forEach(cell => resetCell(cell));
}

function createBoardFromFen(fenString) {
	createBoard(fenString);

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

	// Update taken pieces
	$$('#white-pieces, #black-pieces').forEach(elem => elem.innerHTML = '');
	const takenPieces = getTakenPiecesFromFen();
	window.points = { w: 0, b: 0 };
	for (const i in takenPieces.w.split('')) {
		const c = takenPieces.w[i].toLowerCase();
		points.w += getPointsEquivalent(pieces[c]);
		logTakenPiece('white', pieces[c]);
	}
	for (let i = 0; i < takenPieces.b.length; i++) {
		const c = takenPieces.b[i];
		points.b += getPointsEquivalent(pieces[c]);
		logTakenPiece('black', pieces[c]);
	}

	// Update highlighting
	checkHighlight();
	checkGameEnding();

}

const getCell = cell => $.id(cell);
const clearCell = cell => getCell(cell).innerHTML = '';
const resetCell = cell => getCell(cell).innerHTML = `<img src="/images/transparent.gif" alt="${cell}" data-piece="blank">`;

// Options functions //

function flipBoard() {
	['rotate', 'norotate'].forEach(c => document.body.classList.toggle(c));
}

function alignBoard() {
	const classes = document.body.classList;
	if (gameData.currentTurn === 'b') {
		classes.add('rotate');
		classes.remove('norotate');
	} else {
		classes.remove('rotate');
		classes.add('norotate');
	}
}

function shareGame() {
	if (!window.multiplayer) window.gameId = randomID();
	const newUrl = location.href.replace(location.search || /$/, `?multiplayer=on&static=on&gamecode=${window.gameId}`);
	sendDB();
	copy(newUrl);
	alert('A link to this board has been copied to your clipboard');
}
