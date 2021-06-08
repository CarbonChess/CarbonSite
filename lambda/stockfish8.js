const stockfish = require('stockfish');

function botMove(fen) {

    let engine = stockfish();

    engine.onmessage = (message) => {
        console.log("received: " + message);
        let [, start, end] = message.match(/bestmove (..)(..) /) || [];
        return { start, end };
    }
    console.log('configure stockfish');
    //options
    engine.postMessage('setoption name Contempt 20');
    engine.postMessage('setoption name Minimum Thinking Time 500');
    engine.postMessage('ucinewgame');
    engine.postMessage('isready');
    engine.postMessage('position fen ' + fen);
    engine.postMessage('go');
}

exports.handler = async function (event, context, callback) {
    const params = event.queryStringParameters;
    const fen = decodeURIComponent(params.fen);
    let output = botMove(fen);
    return {
        statusCode: output ? 200 : 500,
        body: JSON.stringify(output || {}),
    };
};
