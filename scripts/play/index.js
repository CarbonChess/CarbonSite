window.global = {};
window.firstLoad = true;

function run() {
	$$('.resettable').forEach(elem => elem.innerHTML = '');

	const params = (new URL(location.href)).searchParams;
	const booleanParam = opt => params.get(opt) === 'on';
	if (window.firstLoad) window.gameOptions = {
		bot: booleanParam('bot'),
		botColour: params.get('botColour'),
		botIntelligence: +params.get('botIntelligence'),
		multiplayer: booleanParam('multiplayer'),
		username: params.get('username')?.trim(),
		rules: !booleanParam('free'),
		autoFlip: booleanParam('autoflip'),
		gamecode: params.get('gamecode'),
		static: booleanParam('static'),
		spectating: booleanParam('spectating'),
		puzzles: booleanParam('puzzles'),
		startingPuzzle: params.get('puzzlename'),
		difficulty: +params.get('difficulty'),
	}
	window.firstLoad = false;

	window.ingame = true;
	window.sessionLost = false;
	window.totalMoves = 0;
	window.lastMove = { start: '', end: '' };
	window.selectedCell = null;
	window.playerTurn = 'white';
	window.promotionPiece = 'queen';
	window.currentBoard = [];
	window.enpassantCell = null
	window.enpassantTaken = false;
	window.lastEnpassantCell = enpassantCell;
	window.fmrMoves = 0;
	window.failedMoveCount = 0;
	window.failedPuzzleAttempts = 0;
	window.autoFlip = gameOptions.autoFlip;
	window.autoPing = gameOptions.multiplayer;
	window.hasRules = gameOptions.rules;
	window.gameId = gameOptions.gamecode;
	window.username = gameOptions.username || window.accountName || '[Anon]';
	window.chat = [];

	$('#game-data_content').innerHTML = '';
	$('body').dataset.mode = gameOptions.multiplayer ? 'multiplayer' : 'singleplayer';
	addGameData('Opponent', (gameOptions.bot || gameOptions.puzzles) ? 'Bot' : (gameOptions.multiplayer && !gameOptions.static) ? 'Online' : 'Local');
	if (gameOptions.multiplayer) {
		addGameData('Game ID', window.gameId);
		$('#winner').innerText = 'Loading...';
	}
	if (gameOptions.bot) {
		addGameData('Bot type', `Level ${gameOptions.botIntelligence}; ${gameOptions.botColour}`);
	}
	if (gameOptions.static) {
		readDB();
		window.autoPing = false;
		addGameData('Replay', 'Yes');
	}
	if (gameOptions.spectating) {
		addGameData('Spectating', 'Yes');
	}
	if (gameOptions.puzzles) {
		addGameData('Puzzles Mode', 'Yes');
		addGameData('Difficulty', gameOptions.difficulty);
		addGameData('Puzzle ID', '', 'current-puzzle-name');
		$.id('winner').innerText = 'Find the best move';
		['puzzles-hint', 'puzzle-attempts'].forEach(id => $.id(id).classList.remove('hide'));
	}
	if (!gameOptions.autoFlip) {
		$('body').dataset.noflip = true;
	}

	Object.assign(window, fenFuncs);

	setupBoard();
	if (gameOptions.puzzles) {
		getPuzzles(gameOptions.startingPuzzle).then(() => setBoard(0));
	}
	else {
		newBoard(8, true);
		alignBoard();
	}

}

function reset() {
	run();
	if (gameOptions.multiplayer) sendDB(window.gameId, defaultFen);
}

document.addEventListener('DOMContentLoaded', run);
