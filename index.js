const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);

function run() {
	$('table').innerHTML = '';
	$('#log').innerHTML = '';
	$('#taken-white-pieces').innerHTML = '';
	$('#taken-black-pieces').innerHTML = '';

	window.selectedCell = null;
	window.totalMoves = 0;
	window.currentTurn = 'white';
	window.promotionPiece = 'queen';
	window.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
	window.enpassantCell = null;
	window.enpassantTaken = false;

	window.hasRules ||= true;
	//$('#toggle-rules').setAttribute('class', 'enabled');

	window.autoflip ||= false;
	//$('#flip-board-automatic').setAttribute('class', 'disabled');

	flipBoard();
	createBoard(8, 8);
}