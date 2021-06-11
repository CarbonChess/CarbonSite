'use strict';
const apiUrl = '/.netlify/functions/database';
const TIMEOUT_AGE = 3 * 60 * 1000;
const READ_INTERVAL = 2 * 1000;
const SEP = { MSG: '\x1e', INFO: '\x1f' };

let lastReceivedFen;
let idleTime = 0;

async function getGameData(chat) {
	const resp = await fetch(`${apiUrl}?type=read&gameId=${chat ? 'c:' : ''}${window.gameId}`);
	const json = await resp.json();
	console.debug(`Retrieved data for game ID ${window.gameId}.`);
	return json.output.data;
}

// Database //

async function readDB() {
	const { fen = createFen(), moves, ingame = 1, players } = await getGameData();
	if (fen === lastReceivedFen) return;
	lastReceivedFen = fen;
	createBoardFromFen(fen);
	window.playerCount = +players || 0;
	if (!+ingame) {
		$('#winner').innerText = 'Timed out';
		window.ingame = false;
	}
	if (moves) global.logList = moves.split(',');
	updateMoves();
	readChat();
}

async function sendDB(soft) {
	console.debug(`Attempting to send data to game ID ${window.gameId}...`);
	const fen = createFen();
	idleTime = 0;
	let queryParams = [
		'type=send',
		`gameId=${encodeURIComponent(window.gameId)}`,
		!soft && `fen=${encodeURIComponent(fen)}`,
		!soft && `moves=${global.logList.join(',')}`,
		`players=${window.playerCount}`,
		`ingame=${+!window.sessionLost}`,
	];
	await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
	console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

// Chat //

async function readChat() {
	const { chat } = await getGameData({ chat: true });
	if (!chat) return;
	let messages = chat.split(SEP.MSG);
	let messagesRaw = messages.map(msg => msg.split(SEP.INFO));
	window.chat = messages;
	$('#chat').innerHTML = messagesRaw.map(formatChatMessage).join('');
}

async function sendChatMessage(force) {
	let message = $('#chat-message').value;
	$('#chat-message').value = '';
	if (!message && !force) return;

	if (message) {
		let messageParts = [+new Date(), window.username, message];
		$('#chat').innerHTML += formatChatMessage(messageParts);
		window.chat.push(messageParts.join(SEP.INFO));
	}
	if (!window.autoPing || !window.ingame) return;
	let queryParams = [
		'type=send',
		`gameId=c:${encodeURIComponent(window.gameId)}`,
		`chat=${encodeURIComponent(window.chat.join(SEP.MSG))}`,
	];
	console.debug(`Attempting to send chat message data to game ID ${window.gameId}...`);
	await readChat();
	await fetch(`${apiUrl}?${queryParams.join('&')}`);
}
// Sort function // .sort((a, b) => +a.match(/ts=.(\d+)./g)[1] - +b.match(/ts=.(\d+)./g)[1]).join('</div>');

function formatChatMessage([ts, user, msg]) {
	return `
        <div data-ts="${ts}" class="chat-message">
            <div class="chat-message_user">${user}</div>
            <div class="chat-message_text">${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
    `;
}

// Game functions //

async function init() {
	if (!gameOptions?.multiplayer) return;
	const data = await getGameData();
	window.playerCount = (+data.players || 0) + 1;
	window.playerTurn = playerCount === 1 ? 'white' : 'black';
	if (playerCount > 2) {
		gameOptions.spectating = true;
		window.ingame = false;
		addGameData('Spectating', 'Yes');
	}
	if (window.playerTurn === 'black') flipBoard();
	$('#chat').innerHTML = formatChatMessage(window.chat);
	sendDB({ soft: true });
	sendChatMessage({ force: true });
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
