function botMove() {
	var id = 0;

	var stockfishes = [];

	stockfishes[id] = STOCKFISH();

	stockfishes[id].onmessage = function (message) {
		console.log("received: " + message);
	}

	stockfishes[id].postMessage('setoption name Contempt value 30');
	stockfishes[id].postMessage('setoption name Skill Level value 20');
	stockfishes[id].postMessage('ucinewgame');
	stockfishes[id].postMessage('isready');
	stockfishes[id].postMessage('position fen' + global.moveList.slice(-1)[0]);
	stockfishes[id].postMessage('go');
	hasClicked(startCell);
	hasClicked(endCell);
}

