const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

function run() {
	$('#log').innerHTML = '';
	$('#white-pieces').innerHTML = '';
	$('#black-pieces').innerHTML = '';

	window.selectedCell = null;
	window.totalMoves = 0;
	window.currentTurn = 'white';
	window.promotionPiece = 'queen';
	window.kingCell = { w: 'E1', b: 'E8' };
	window.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
	window.enpassantCell = null;
	window.enpassantTaken = false;
	window.points = { w: 0, b: 0 };
	window.movesList = [];
	window.last = {castling, enpassantCell, points};

	if (window.hasRules === undefined) {
		window.hasRules = true;
		$('#toggle-rules').setAttribute('class', 'enabled');
	}

	if (window.autoflip === undefined) {
		window.autoflip = false;
		$('#flip-board-automatic').setAttribute('class', 'disabled');
	}

	flipBoard();
	createBoard();
}
