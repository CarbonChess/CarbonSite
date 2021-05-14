const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 5 * 60 * sec;
const READ_INTERVAL = 2.5 * sec;

let lastReceivedFen, lastSentFen;
let idleTime = 0;

async function getGameData() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${window.gameId}`);
    const json = await resp.json();
    return json.output.data;
}

async function readDB() {
    const { fen = createFen(), lastMove } = await getGameData();
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    console.debug(`Retrieved FEN data for game ID ${window.gameId}: ${fen}.`);
    createBoardFromFen(fen);
    if (lastMove) {
        lastMove.split('-').forEach(cell => $.id(cell).classList.add('last-move'));
        $('#log').innerHTML += lastMove.split('-')[1];
    }
}

async function sendDB() {
    console.debug(`Attempting to send data to game ID ${window.gameId}...`);
    const fen = createFen();
    if (fen === lastSentFen) {
        console.debug(`No new FEN data to send for game ID ${window.gameId}.`);
        return;
    }
    lastSentFen = fen;
    idleTime = 0;
    let queryParams = [
        'type=send',
        `gameId=${encodeURIComponent(window.gameId)}`,
        `fen=${encodeURIComponent(fen)}`,
        `lastMove=${window.lastMove.start}-${window.lastMove.end}`,
    ];
    await fetch(`${apiUrl}?${queryParams.join('&')}`);
    console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

async function init() {
    if (!window.multiplayer) return;
    const data = await getGameData();
    // Assign colour to player: white if P1, black if P2
    window.playerTurn = Object.is(data, {}) ? 'white' : 'black';
    if (window.playerTurn === 'black') flipBoard();
}

document.addEventListener('DOMContentLoaded', init);

setInterval(function () {
    if (!gameOptions.multiplayer) return;
    if (idleTime > TIMEOUT_AGE) {
        alert('Session timed out');
        location.pathname = '/';
        return;
    }
    idleTime += READ_INTERVAL;
    readDB();
}, READ_INTERVAL);
