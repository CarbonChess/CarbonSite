const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 3 * 60 * sec;
const READ_INTERVAL = 4 * sec;

let lastReceivedFen;
let idleTime = 0;

async function getGameData() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${window.gameId}`);
    const json = await resp.json();
    console.debug(`Retrieved data for game ID ${window.gameId}.`);
    return json.output.data;
}

async function readDB() {
    const { fen = createFen(), moves, ingame } = await getGameData();
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    createBoardFromFen(fen);
    if (!+ingame) {
        $('#winner').innerText = 'Timed out';
        window.ingame = false;
    }
    if (moves) global.logList = moves.split(',');
    updateMoves();
}

async function sendDB() {
    console.debug(`Attempting to send data to game ID ${window.gameId}...`);
    const fen = createFen();
    idleTime = 0;
    let queryParams = [
        'type=send',
        `gameId=${encodeURIComponent(window.gameId)}`,
        `fen=${encodeURIComponent(fen)}`,
        `moves=${global.logList.join(',')}`,
        `ingame=${+!window.sessionLost}`,
    ];
    await fetch(`${apiUrl}?${queryParams.join('&')}`);
    console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

async function init() {
    if (!gameOptions.multiplayer) return;
    const data = await getGameData();
    // Assign colour to player: white if P1, black if P2
    const gameExists = Object.keys(data).length > 0;
    window.playerTurn = gameExists ? 'black' : 'white';
    if (window.playerTurn === 'black') flipBoard();
    if (!gameExists) sendDB();
}

document.addEventListener('DOMContentLoaded', init);

setInterval(function () {
    if (!window.autoPing || !window.ingame) return;
    if (idleTime > TIMEOUT_AGE) {
        window.sessionLost = true;
        sendDB();
        alert('Session timed out');
        location.pathname = '/';
        return;
    }
    idleTime += READ_INTERVAL;
    readDB();
}, READ_INTERVAL);
