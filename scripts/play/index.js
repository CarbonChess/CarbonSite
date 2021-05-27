window.global = {};

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
	window.points = { w: 0, b: 0 };
	window.movesList = [];
	window.currentBoard = [];
	window.enpassantCell = null
	window.enpassantTaken = false;
	window.lastEnpassantCell = enpassantCell;
	window.fmrMoves = 0;
	window.failedMoveCount = 0;
	window.autoFlip = gameOptions.autoFlip;
	window.autoPing = gameOptions.multiplayer;
	window.hasRules = gameOptions.rules;
	window.gameId = gameOptions.gamecode;

	const gameData = $('#game-data dl');
	gameData.innerHTML += `<dt>Opponent</dt><dd>${gameOptions.bot ? 'Bot' : gameOptions.multiplayer ? 'Online' : 'Local'}</dd>`;
	if (window.gameId) gameData.innerHTML += `<dt>Game ID</dt><dd>${window.gameId}</dd>`;
	if (gameOptions.multiplayer) gameData.innerHTML += `<dt>Multiplayer</dt><dd>Yes</dd>`;
	if (gameOptions.static) {
		autoPing = false;
		gameData.innerHTML += `<dt>Replay</dt><dd>Yes</dd>`;
	}
	if (gameOptions.spectating) {
		ingame = false;
		gameData.innerHTML += `<dt>Spectating</dt><dd>Yes</dd>`;
	}

	Object.assign(window, { ...fenFuncs, ...global });
	setupBoard();
	newBoard(8, true);
	alignBoard();

}

function reset() {
	run();
	if (gameOptions.multiplayer) sendDB(gameId, defaultFen);
}
