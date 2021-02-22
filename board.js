let hasRules = true;

function createGrid(l, k) {
	let table = document.querySelector('table');
	for (i = 1; i <= l; i++) {

		let tr = document.createElement('tr');
		tr.id = 'r' + i;
		table.appendChild(tr);

		for (j = 1; j <= k; j++) {

			let column = String.fromCharCode(j + 64);
			let cellName = column + (9 - i);
			let td = document.createElement('td');

			td.id = cellName;
			td.setAttribute('onclick', `hasClicked('${cellName}')`);

			// Add pieces
			let pieceName, pieceColour;
			pieceColour = (i < l / 2) ? 'black' : 'white';

			if (i === 1 || i === l) { // first rows
				const cell = n => j === n || j === k - n + 1;
				if (cell(1)) pieceName = 'rook';
				else if (cell(2)) pieceName = 'knight';
				else if (cell(3)) pieceName = 'bishop';
				else if (j === 4) pieceName = 'queen';
				else if (j === k - 3) pieceName = 'king';
			}
			else if (i === 2 || i === l - 1) { // second rows
				pieceName = 'pawn';
			}
			else { // no pieces
				td.innerHTML = cellName;
			}

			// Add piece to board
			if (pieceName) {
				let piece = createPiece(pieceName, pieceColour, cellName);
				td.appendChild(piece);
			}
			tr.appendChild(td);
		}

	}
}

function createPiece(name, colour, cell) {
	if (!name) return;
	let piece = document.createElement('img');
	piece.src = 'chesspieces.png';
	piece.classList.add(colour);
	piece.classList.add(name);
	piece.id = 'piece' + cell;
	return piece;
}

function toggleRules(button) {
	hasRules = !hasRules;
	button.classList.toggle("enabled");
	button.classList.toggle("disabled");
	currentTurn = currentTurn === 'white' ? 'black' : 'white';
}

function run() {
	createGrid(8, 8);
}
