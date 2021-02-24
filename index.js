function run() {
	document.querySelector('table').innerHTML = '';
	document.getElementById('log').innerHTML = '';

	window.hasRules = true;
	window.autoflip = false;
	window.selectedCell = null;
	window.totalMoves = 0;
	window.currentTurn = 'white';
	window.promotionPiece = 'queen';
	window.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
	window.enpassantCell = null;
	window.enpassantTaken = false;

	document.getElementById('toggle-rules').setAttribute('class', 'enabled');
	document.getElementById('flip-board-automatic').setAttribute('class', 'disabled');

	flipBoard();
	createBoard(8, 8);
}
