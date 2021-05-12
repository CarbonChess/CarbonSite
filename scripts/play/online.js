const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 3 * 60 * sec;
const READ_INTERVAL = 5 * sec;

let lastReceivedFen, lastSentFen;
let idleTime = 0;

async function readDB() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${gameId}`);
    const json = await resp.json();
    const data = json.output.data;
    const fen = data.fen || createFen();
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    console.debug(`Retrieved FEN data for game ID ${gameId}: ${fen}.`);
    createBoardFromFen(fen);
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
    await fetch(`${apiUrl}?type=send&gameId=${gameId}&fen=${encodeURIComponent(fen)}`);
    console.debug(`Sent FEN data for game ID ${gameId}: ${fen}.`);
}

setInterval(() => {
    if (idleTime > TIMEOUT_AGE) {
        alert('Session timed out');
        location.pathname = '/home.html';
        return;
    }
    idleTime += READ_INTERVAL;
    readDB();
}, READ_INTERVAL);
