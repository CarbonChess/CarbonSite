const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

const debug = (...args) => console.log('DEBUG', ...args);
const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem ?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function run() {
	$$('.resettable').forEach(elem => elem.innerHTML = '');

	window.ingame = true;
	window.totalMoves = 0;
	window.selectedCell = null;
	window.currentTurn = 'white';
	window.promotionPiece = 'queen';
	window.kingCell = { w: 'E1', b: 'E8' };
	window.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
	window.enpassantCell = null;
	window.enpassantTaken = false;
	window.points = { w: 0, b: 0 };
	window.movesList = [];
	window.currentBoard = [];
	window.lastEnpassantCell = enpassantCell;
	window.fmrMoves = 0;

	if (window.hasRules === undefined) {
		window.hasRules = true;
		$('#toggle-rules').setAttribute('class', 'enabled');
	}

	if (window.autoflip === undefined) {
		window.autoflip = false;
		$('#flip-board-automatic').setAttribute('class', 'disabled');
	}

	if (window.autobot === undefined) {
		window.autobot = false;
		$('#auto-bot').setAttribute('class', 'disabled');
	}

	if (window.botIntelligence === undefined) {
		$('#bot-colour').value = botIntelligence = 0;
	}

	if (window.botColour === undefined) {
		$('#bot-colour').value = botColour = 'black';
	}

	flipBoard();

	if (location.search) createBoardFromFen(getFenFromURL());
	else createBoard(8, true);
}
