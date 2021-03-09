// Board functions //

function createBoard(l, k) {
	let table = $('table');
	for (i = 1; i <= l; i++) {

		let tr = document.createElement('tr');
		tr.id = 'r' + i;
		table.appendChild(tr);

		for (j = 1; j <= k; j++) {

			let column = indexToLetter(j);
			let cellName = column + (9 - i);
			let td = document.createElement('td');

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

const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem ?.classList || []);
const getPieceClasses = cell => getClasses(getPieceInCell(cell));
const getPieceInCell = cell => $.id('piece' + cell);
const pieceInCell = cell => getClasses(getPieceInCell(cell)).length > 0;
const invertColour = colour => colour === 'white' ? 'black' : 'white';

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
