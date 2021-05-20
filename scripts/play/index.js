function run() {
	$$('.resettable').forEach(elem => elem.innerHTML = '');

	const params = (new URL(location.href)).searchParams;
	const booleanParam = opt => params.get(opt) === 'on';
	window.gameOptions = {
		bot: booleanParam('bot'),
		botColour: params.get('botColour'),
		botIntelligence: +params.get('botIntelligence'),
		multiplayer: booleanParam('multiplayer'),
		rules: !booleanParam('free'),
		autoFlip: booleanParam('autoflip'),
		gamecode: params.get('gamecode'),
		static: booleanParam('static'),
		spectating: booleanParam('spectating'),
	}
	history.pushState({}, 'Play', location.href.replace(location.search, ''));

	window.ingame = true;
	window.sessionLost = false;
	window.totalMoves = 0;
	window.lastMove = { start: null, end: null };
	window.selectedCell = null;
	window.currentTurn = 'white';
	window.playerTurn = 'white';
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
	window.failedMoveCount = 0;
	window.autoFlip = gameOptions.autoFlip;
	window.autoPing = gameOptions.multiplayer;
	window.hasRules = gameOptions.rules;
	window.gameId = gameOptions.gamecode;

	alignBoard();

	if (window.gameId) {
		$('#gameid').innerText = 'Game ID: ' + window.gameId;
	}
	if (gameOptions.static) {
		autoPing = false;
		$('#gameid').innerText = 'Loaded move from game ID ' + window.gameId;
	}
	if (gameOptions.spectating) {
		ingame = false;
		$('#gameid').innerText = 'Spectating game ID ' + window.gameId;
	}

	window.global = {};
	FenFurnace();
	Object.assign(window, { ...fenFuncs, ...global });
	setupBoard();
	newBoard(8, true);
}

function reset() {
	run();
	if (gameOptions.multiplayer) sendDB(gameId, defaultFen);
}
