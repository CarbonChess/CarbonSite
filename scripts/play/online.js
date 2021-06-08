'use strict';
const apiUrl = '/.netlify/functions/database';
const sec = 1000;
const TIMEOUT_AGE = 3 * 60 * sec;
const READ_INTERVAL = 4 * sec;
const SEP = { MSG: '\u001e', INFO: '\u001d' };

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
    $('#chat').innerHTML += chat.split(SEP.MSG).join('<br>').split(SEP.INFO).join('>').replace(/(<br>)\d+>\d+>/g, '$1');
    window.playerCount = +players;
    if (!+ingame) {
        $('#winner').innerText = 'Timed out';
        window.ingame = false;
    }
    if (moves) global.logList = moves.split(',');
    updateMoves();
}

async function sendDB(soft) {
    console.debug(`Attempting to send data to game ID ${window.gameId}...`);
    const fen = createFen();
    idleTime = 0;
    let queryParams = [
        'type=send',
        !soft && `gameId=${encodeURIComponent(window.gameId)}`,
        !soft && `fen=${encodeURIComponent(fen)}`,
        !soft && `moves=${global.logList.join(',')}`,
        `players=${window.playerCount}`,
        `chat=${encodeURIComponent(window.chat.join(SEP.MSG))}`,
        `ingame=${+!window.sessionLost}`,
    ];
    window.chat = [];
    await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
    console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

function sendChatMessage() {
    let message = $('#chat-message').value;
    if (!message) return;
    $('#chat-message').value = '';
    window.chat.push([+new Date(), window.session, window.username, message].join(SEP.INFO));
}

async function init() {
    if (!gameOptions.multiplayer) return;
    const data = await getGameData();
    window.playerCount = (+data.players || 0) + 1;
    window.playerTurn = playerCount === 1 ? 'white' : 'black';
    if (playerCount > 2) {
        gameOptions.spectating = true;
        window.ingame = false;
        addGameData('Spectating', 'Yes');
    }
    if (window.playerTurn === 'black') flipBoard();
    sendDB('soft');
}

document.addEventListener('DOMContentLoaded', init);

setInterval(function () {
    if (!window.autoPing || !window.ingame) return;
    if (idleTime > TIMEOUT_AGE) {
        window.sessionLost = true;
        sendDB('soft');
        alert('Session timed out');
        location.pathname = '/';
        return;
    }
    idleTime += READ_INTERVAL;
    readDB();
}, READ_INTERVAL);
