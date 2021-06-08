const stockfish = require('stockfish');

function botMove(fen) {

    let id = 0;
    let stockfishes = [];
    stockfishes[id] = stockfish();

    stockfishes[id].onmessage = (message) => {
        console.log("received: " + message);
        let [, start, end] = message.match(/bestmove (..)(..) /) || [];
        return { start, end };
    }
    //options
    stockfishes[id].postMessage('setoption name Contempt 20');
    stockfishes[id].postMessage('setoption name Minimum Thinking Time 500');
    stockfishes[id].postMessage('ucinewgame');
    stockfishes[id].postMessage('isready');
    stockfishes[id].postMessage('position fen ' + fen);
    stockfishes[id].postMessage('go');
}

setInterval(function () {
    if (window.gameOptions && window.gameOptions.bot && window.ingame && global.currentTurn === window.gameOptions.botColour[0]) {
        botMove();
    }
}, 100);


exports.handler = async function (event, context, callback) {
    const { fen } = event.queryStringParameters;
    let { start, end } = botMove(fen);
    return {
        statusCode: 200,
        body: JSON.stringify({ start, end })
    };
};
