function createGrid(l, k) {
	let table = document.createElement('table');
	for (i = 1; i <= l; i++) {
		let tr = document.createElement("tr");
		tr.setAttribute('id', 'r' + i);
		table.appendChild(tr);


		for (j = 1; j <= k; j++) {

			let column = String.fromCharCode(j + 64);
			let cellName = column + (9 - i);
			let td = document.createElement("td");

			td.setAttribute('id', cellName);
			td.setAttribute('onclick', `hasClicked("${cellName}")`);

			// Add pieces
			let pieceName, pieceColour;
			pieceColour = (i < l / 2) ? 'black' : 'white';

			if (i === 2 || i === l - 1) {
				pieceName = 'pawn';
			}
			else if (i === 1 || i === l) {
				const cell = n => j === n || j === k - n + 1;
				if (cell(1)) pieceName = 'rook';
				else if (cell(2)) pieceName = 'knight';
				else if (cell(3)) pieceName = 'bishop';
				else if (j === 4) pieceName = 'queen';
				else if (j === k - 3) pieceName = 'king';
			}
			else td.innerHTML = cellName;

			// Add piece to board
			tr.appendChild(td);
			if (pieceName) td.appendChild(createPiece(pieceName, pieceColour, cellName));
		}
	}
	document.body.appendChild(table);
}

function createPiece(name, colour, cell) {
	if (!name) return;
	let piece = document.createElement('img');
	piece.src = 'chesspieces.png';
	piece.setAttribute('height', '32px');
	piece.setAttribute('class', colour + ' ' + name);
	piece.setAttribute('id', "piece" + cell);
	return piece;
}

function createLogBox() {
	let box = document.createElement('div');
	box.setAttribute('id', 'log');
	document.body.appendChild(box);
}

function run() {
	createGrid(8, 8);
	createLogBox();
}