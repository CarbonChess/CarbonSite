'use strict';
const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 3 * 60 * sec;
const READ_INTERVAL = 4 * sec;
const SEP = { MSG: '\u001e', INFO: '\u001d' }; // sync with database.js

let lastReceivedFen;
let idleTime = 0;

async function getGameData() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${window.gameId}`);
    const json = await resp.json();
    console.debug(`Retrieved data for game ID ${window.gameId}.`);
    return json.output.data;
}

async function readDB() {
    const { fen = createFen(), moves, ingame, players, chat } = await getGameData();
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    createBoardFromFen(fen);
    window.chat = chat;
    window.playerCount = +players;
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
    let isPlaying = !gameOptions.spectating;
    let queryParams = [
        'type=send',
        isPlaying && `gameId=${encodeURIComponent(window.gameId)}`,
        isPlaying && `fen=${encodeURIComponent(fen)}`,
        isPlaying && `moves=${global.logList.join(',')}`,
        `players=${window.playerCount}`,
        `chat=${encodeURIComponent(window.chat.join(SEP.MSG))}`,
        isPlaying && `ingame=${+!window.sessionLost}`,
    ];
    await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
    console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

function sendChatMessage() {
    let message = $('#chat-message').value;
    if (!message) break;
    window.chat.push(+new Date() + SEP.INFO + window.session + SEP.INFO + window.username + SEP.INFO + message);
}

async function init() {
    if (!gameOptions.multiplayer) return;
    const data = await getGameData();
    window.playerCount = +data.players;
    window.playerTurn = [, 'white', 'black'][playerCount];
    if (playerCount > 2) {
        gameOptions.spectating = true;
        window.ingame = false;
        addGameData('Spectating', 'Yes');
    }
    if (window.playerTurn === 'black') flipBoard();
    sendDB();
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
