'use strict';
const apiUrl = '/.netlify/functions/database';
const TIMEOUT_AGE = 3 * 60 * 1000;
const READ_INTERVAL = 2 * 1000;
const SEP = { MSG: '\u001e', INFO: '\u001d' };

let lastReceivedFen;
let idleTime = 0;

async function getGameData(chat) {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${chat ? 'c:' : ''}${window.gameId}`);
    const json = await resp.json();
    console.debug(`Retrieved data for game ID ${window.gameId}.`);
    return json.output.data;
}

async function readDB() {
    const { fen = createFen(), moves, ingame, players } = await getGameData();
    if (fen === lastReceivedFen) return;
    lastReceivedFen = fen;
    createBoardFromFen(fen);
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
    let queryParams = [
        'type=send',
        `gameId=${encodeURIComponent(window.gameId)}`,
        `fen=${encodeURIComponent(fen)}`,
        `moves=${global.logList.join(',')}`,
        `players=${window.playerCount}`,
        `ingame=${+!window.sessionLost}`,
    ];
    window.chat = [];
    await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
    console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

async function readChat() {
    const { chat } = await getGameData({ chat: true });
    let messages = chat.split(SEP.MSG);
    let messageParts = messages.map(msg => msg.split(SEP.INFO));
    let displayedMessages = messageParts.map(([ts, session, user, msg]) => `<span data-ts='${ts}'>${user}&gt; ${msg}</span>`);
    $('#chat').innerHTML += displayedMessages.join('<br>');
    updateChat();
}

async function sendChatMessage() {
    readChat();
    console.debug(`Attempting to send chat message data to game ID ${window.gameId}...`);
    let message = $('#chat-message').value;
    if (!message) return;
    $('#chat-message').value = '';
    window.chat.push([+new Date(), window.session, window.username, message].join(SEP.INFO));
    let queryParams = [
        'type=send',
        `gameId=c:${encodeURIComponent(window.gameId)}`,
        `chat=${encodeURIComponent(window.chat.join(SEP.MSG))}`,
    ];
    await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
    updateChat();
}

function updateChat() {
    allMessages = allMessages.split('<br>').sort((a, b) => +a.match(/ts=.(\d+)./g)[1] - +b.match(/ts=.(\d+)./g)[1]).join('<br>');
    $('#chat').innerHTML = allMessages;
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
