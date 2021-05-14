const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 5 * 60 * sec;
const READ_INTERVAL = 2.5 * sec;

let lastReceivedFen, lastSentFen;
let idleTime = 0;

async function readDB() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${gameId}`);
    const json = await resp.json();
    const { fen = createFen(), lastMove } = json.output.data;
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    console.debug(`Retrieved FEN data for game ID ${gameId}: ${fen}.`);
    createBoardFromFen(fen);
    if (lastMove) {
        lastMove.split('-').forEach(cell => $('#' + cell).classList.add('last-move'));
        $('#log').innerHTML += lastMove.split('-')[1];
    }
}

async function sendDB() {
    console.debug(`Attempting to send data to game ID ${gameId}...`);
    const fen = createFen();
    if (fen === lastSentFen) {
        console.debug(`No new FEN data to send for game ID ${gameId}.`);
        return;
    }
    lastSentFen = fen;
    idleTime = 0;
    let queryParams = [
        'type=send',
        `gameId=${encodeURIComponent(gameId)}`,
        `fen=${encodeURIComponent(fen)}`,
        `lastMove=${window.lastMove.start}-${window.lastMove.end}`,
    ];
    await fetch(`${apiUrl}?${queryParams.join('&')}`);
    console.debug(`Sent FEN data for game ID ${gameId}: ${fen}.`);
}

setInterval(() => {
    if (!gameOptions.multiplayer) return;
    if (idleTime > TIMEOUT_AGE) {
        alert('Session timed out');
        location.pathname = '/';
        return;
    }
    idleTime += READ_INTERVAL;
    readDB();
}, READ_INTERVAL);
