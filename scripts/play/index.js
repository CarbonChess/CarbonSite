function run() {
	$$('.resettable').forEach(elem => elem.innerHTML = '');

	const params = (new URL(location.href)).searchParams;
	const booleanParam = opt => params.get(opt) === 'on';
	window.gameOptions = {
		bot: booleanParam('bot'),
		botColour: params.get('botColour'),
		botIntelligence: +params.get('botIntelligence'),
		multiplayer: booleanParam('multiplayer'),
		rules: booleanParam('rules') || !location.search,
		autoFlip: booleanParam('autoflip'),
		gamecode: params.get('gamecode'),
	}
	console.log(location.href)
	history.pushState({}, 'Play', location.href.replace(location.search, ''));

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
	window.failedMoveCount = 0;
	window.autoFlip = gameOptions.autoFlip;
	window.autoPing = gameOptions.multiplayer;
	window.hasRules = gameOptions.rules;
	window.gameID = gameOptions.gamecode;

	flipBoard(gameOptions.botColour === 'white');

	let urlFen = getFenFromURL();
	if (urlFen) createBoardFromFen(urlFen);
	else createBoard(8, true);
}
