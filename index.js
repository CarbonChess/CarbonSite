function run() {
	document.querySelector('table').innerHTML = '';
	document.getElementById('log').innerHTML = '';

	window.hasRules = true;
	window.autoflip = false;
	window.selectedCell = null;
	window.currentTurn = 'white';
	window.promotionPiece = 'queen';
	window.totalMoves = 0;
	window.castling = { w: { k: true, q: true }, b: { k: true, q: true } };

	document.getElementById('toggle-rules').setAttribute('class', 'enabled');
	document.getElementById('flip-board-automatic').setAttribute('class', 'disabled');

	flipBoard();
	createBoard(8, 8);
}
