// Board functions //

function createBoard(l = 8, k = 8) {
	$('table').innerHTML = '';
	for (i = 1; i <= l; i++) {

		const tr = document.createElement('tr');
		tr.id = 'r' + i;
		$('table').appendChild(tr);

		for (j = 1; j <= k; j++) {

			const cellName = indexToLetter(j) + (9 - i);
			const td = document.createElement('td');

			td.id = cellName;
			td.setAttribute('onclick', `hasClicked('${cellName}')`);
			td.setAttribute('ondragstart', `hasClicked('${cellName}')`);
			td.setAttribute('ondrop', `event.preventDefault();hasClicked('${cellName}')`);
			td.setAttribute('ondragover', 'event.preventDefault()');

			// add pieces
			let pieceName, pieceColour;
			pieceColour = (i < l / 2) ? 'black' : 'white';

			if (i === 1 || i === l) {
				// first rows
				const cell = n => j === n || j === k - n + 1;
				if (cell(1)) pieceName = 'rook';
				else if (cell(2)) pieceName = 'knight';
				else if (cell(3)) pieceName = 'bishop';
				else if (j === 4) pieceName = 'queen';
				else if (j === k - 3) pieceName = 'king';
			}
			else if (i === 2 || i === l - 1) {
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
	movesList.push(createFen())
}

function createBoardFromFen(fenString) {
	createBoard();
	$$('td').forEach(elem => elem.innerHTML = elem.id);
	const pieces = { 'p': 'pawn', 'b': 'bishop', 'n': 'knight', 'r': 'rook', 'q': 'queen', 'k': 'king' };
	let currentRow = 8;
	let currentColumn = 1;

	if (fenString.match(/\//g).length !== 7) {
		console.error('Incorrect FEN');
		return;
	}

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
		else {
			let colour = char === char.toUpperCase() ? 'white' : 'black';
			let piece = pieces[char.toLowerCase()];
			const cell = indexToLetter(currentColumn) + currentRow;
			getCell(cell).innerHTML = '';
			getCell(cell).appendChild(createPiece(piece, colour, cell));
			currentColumn++;
		}

	}

}

// Piece functions //

function createPiece(name, colour, cell) {
	if (!name) return;
	let piece = document.createElement('img');
	piece.src = 'assets/chesspieces.png';
	piece.classList.add(colour);
	piece.classList.add(name);
	if (cell) {
		piece.id = 'piece' + cell;
		piece.setAttribute('draggable', true);
	}
	return piece;
}

function addPiece(name, colour, cell) {
	removePiece(cell);
	$.id(cell).appendChild(createPiece(name, colour, cell));
}

function removePiece(cell) {
	$.id(cell).innerHTML = '';
}

// Cell functions //

function clearCells(...cells) {
	for (cell of cells) {
		$.id(cell).innerHTML = cell;
	}
}

const getPieceClasses = cell => getClasses(getPieceInCell(cell));
const getCell = cell => $.id(cell);
const getPieceInCell = cell => $.id('piece' + cell);
const pieceInCell = cell => getClasses(getPieceInCell(cell)).length > 0;
const getPieceColour = cell => getPieceClasses(cell)[0];

// Options functions //

function toggleRules(button) {
	hasRules = !hasRules;
	button.classList.toggle("enabled");
	button.classList.toggle("disabled");
	currentTurn = invertColour(currentTurn);
}

function flipBoard(force) {
	const $table = $('table');
	if (force) {
		$table.classList.toggle('rotate');
	}
	else {
		$table.classList.remove('rotate')
		if (currentTurn === 'black') $table.classList.add('rotate');
	}
}

function changeAutoflip(button) {
	autoflip = !autoflip;
	button.classList.toggle('enabled');
	button.classList.toggle('disabled');
}
