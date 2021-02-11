/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
*/

let selectedCell;

function hasClicked(cell) {

	const selectPiece = function (cell) {
		selectedCell = cell;
		let $cell = document.getElementById(selectedCell);
		$cell ?.classList.add('selected');
		console.log('S ' + selectedCell);
	}

	if (cell == selectedCell) { // double click
		// cancel
		document.getElementById(selectedCell).classList.remove('selected');
		selectedCell = null;
		console.log('X ' + cell);
	}

	else if (selectedCell) { // a cell has already been selected
		// move the piece
		let startingCell = selectedCell;
		let endingCell = cell;

		let $startingCell = document.getElementById(selectedCell);
		let $endingCell = document.getElementById(endingCell);
		let $startingPiece = document.getElementById('piece' + selectedCell);
		let $endingPiece = document.getElementById('piece' + endingCell);

		let startingClasses = $startingPiece ?.getAttribute('class') ?.split(' ') || [];
		let endingClasses = $endingPiece ?.getAttribute('class') ?.split(' ') || [];

		$startingCell ?.classList ?.remove('selected');

		if (startingClasses) { // only go if the cell has metadata
			// is a piece: move it
			let isSameColour = (
				(startingClasses.includes('white') && endingClasses.includes('white'))
				||
				(startingClasses.includes('black') && endingClasses.includes('black'))
			);

			if (isSameColour) {
				// replace selected piece

				selectPiece(cell);
				console.log('T ' + startingClasses.join(' '));

			} else {
				// move piece

				let [colour, piece] = startingClasses;
				let originalPiece = piece;

				let canPromote = (
					piece === 'pawn'
					&&
					(endingCell.includes('1') || endingCell.includes('8'))
				);
				if (canPromote) piece = 'queen';

				$startingCell.innerHTML = startingCell;
				$endingCell.innerHTML = '';
				$endingCell.appendChild(createPiece(piece, colour, endingCell));

				console.log('M ' + startingCell + ' -> ' + endingCell);
				log(colour, originalPiece, endingCell, { taken: !!endingClasses[0], promoted: canPromote });
				selectedCell = null;

			}

		}
	}

	else if (document.getElementById('piece' + cell) !== null) { // there is a piece in this cell
		// no cell has been selected
		// mark this piece as being in process of moving
		selectPiece(cell);
		console.log('T ' + document.getElementById('piece' + cell).getAttribute('class'));

	}
	else { // empty
		// empty square clicked without piece being selected first
		console.log('I ' + cell);
	}
}

function log(colour, piece, endCell, { taken, promoted }) {
	let box = document.getElementById('log');
	let pieceID
	switch (piece) {
		case 'pawn': pieceID = ''; break;
		case 'knight': pieceID = 'n'; break;
		default: pieceID = piece[0];
	}
	box.innerHTML += `<span class="${colour}">` + pieceID.toUpperCase() + (taken ? 'x' : '') + endCell.toLowerCase() + (promoted ? '=Q' : '') + '</span>';
}