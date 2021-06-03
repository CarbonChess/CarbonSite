function botMove() {

	var id = 0;
	var stockfishes = [];
	stockfishes[id] = STOCKFISH();

	stockfishes[id].onmessage = function (message) {
		console.log("received: " + message);
		let [, start, end] = message.match(/bestmove (..)(..) /) || [];
		if (start && end) {
			hasClicked(start.toUpperCase());
			hasClicked(end.toUpperCase());
		}
	}
	//options
	stockfishes[id].postMessage('setoption name Contempt 20');
	stockfishes[id].postMessage('setoption name Minimum Thinking Time 500');
	stockfishes[id].postMessage('ucinewgame');
	stockfishes[id].postMessage('isready');
	stockfishes[id].postMessage('position fen ' + global.moveList.slice(-1)[0]);
	stockfishes[id].postMessage('go');
}

setInterval(function () {
	if (window.gameOptions && window.gameOptions.bot && window.ingame && global.currentTurn === window.gameOptions.botColour[0]) {
		botMove();
	}
}, 100);
