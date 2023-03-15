const apiUrl = '/.netlify/functions/database';
const TIMEOUT_AGE = 3 * 60 * 1000;
const READ_INTERVAL = 3 * 1000;
let cipher;
let idleTime = 0;
let lastReceivedFen;
let lastMessageUser;

async function getGameData(chat) {
	if (!window.gameId) throw Error('No game ID has been specified');
	const resp = await fetch(`${apiUrl}?type=read&gameId=${(chat ? 'c:' : '') + window.gameId}`).then(data => data.json());
	console.debug(`Retrieved data for game ID ${window.gameId}.`);
	return resp.output.data;
}

// Database //

async function readDB() {
	if (!gameOptions?.multiplayer) return;
	readChat();
	const { fen = createFen(), moves, lastMove, points, ingame = 1, players, white, black } = await getGameData();
	if (fen === lastReceivedFen) return;
	lastReceivedFen = fen;
	createBoardFromFen(fen);
	if (lastMove) {
		let [start, end] = lastMove.split(',');
		window.lastMove = { start, end };
		checkHighlight();
	}
	if (moves) {
		gameData.logList = moves.split(',');
		updateMoves();
	}
	if (points) {
		let [w, b] = points.split(',');
		window.points = { w: +w, b: +b };
		logPoints();
	}
	if (!+ingame) {
		$('#winner').innerText = 'Timed out';
		window.ingame = false;
	}
	if (white && black) {
		const whiteElo = +white.split('[]')[1];
		const blackElo = +black.split('[]')[1];
		window.opponentElo = window.playerTurn === 'white' ? blackElo : whiteElo;
	}
	window.playerCount = ~~players;
}

async function sendDB(soft) {
	console.debug(`Attempting to send data to game ID ${window.gameId}...`);
	const fen = createFen();
	idleTime = 0;
	let queryParams = [
		'type=send',
		`gameId=${encodeURIComponent(window.gameId)}`,
		!soft && `fen=${encodeURIComponent(fen)}`,
		!soft && `moves=${gameData.logList.join(',')}`,
		!soft && `lastMove=${window.lastMove.start},${window.lastMove.end}`,
		!soft && `points=${window.points.w},${window.points.b}`,
		window.playerTurn && `${window.playerTurn}=${window.username}[]${window.userElo}`,
		`players=${window.playerCount}`,
		`ingame=${+!window.sessionLost}`,
	];
	await fetch(`${apiUrl}?${queryParams.filter(p => !!p).join('&')}`);
	console.debug(`Sent FEN data for game ID ${window.gameId}: ${fen}.`);
}

// Chat //

async function readChat() {
	if (!gameOptions?.multiplayer) return;
	const { chat } = await getGameData('chat:true');
	if (!chat) return;
	let messages = cipher.decode(chat).split(SEP.MSG);
	let messagesRaw = messages.map(msg => msg.split(SEP.INFO));
	const sorter = (a, b) => a.split(SEP.INFO)[0] - b.split(SEP.INFO)[0];
	window.chat = [...new Set([...messages, ...window.chat])].sort(sorter);
	lastMessageUser = null;
	$('#chat').innerHTML = messagesRaw.map(formatChatMessage).join('');
	if (document.body.clientWidth > 1100) $('#chat').lastElementChild.scrollIntoView();
}

async function sendChatMessage(force) {
	let message = $('#chat-message').value;
	$('#chat-message').value = '';
	if (!message && !force) return;

	await readChat();
	if (message) {
		let messageParts = [+new Date(), window.username, message];
		$('#chat').innerHTML += formatChatMessage(messageParts);
		window.chat.push(messageParts.join(SEP.INFO));
	}
	if (!window.autoPing) return;
	let queryParams = [
		'type=send',
		`gameId=c:${encodeURIComponent(window.gameId)}`,
		`chat=${encodeURIComponent(cipher.encode(window.chat.join(SEP.MSG)))}`,
	];
	fetch(`${apiUrl}?${queryParams.join('&')}`);
	console.debug(`Sent chat message to game ID ${window.gameId}.`);
}

function formatChatMessage([ts, user, msg]) {
	let messageType = user === window.username ? 'chat-message-self' : user === '[System]' ? 'chat-message-system' : '';
	const content = `
		<div data-ts="${ts}" class="chat-message ${messageType} ${user === lastMessageUser ? 'chat-message-same' : ''}">
			<div class="chat-message_user">${user}</div>
			<div class="chat-message_text">${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
		</div>
	`;
	lastMessageUser = user;
	return content;
}

// Game functions //

async function init() {
	if (!gameOptions?.multiplayer) return;
	cipher = new Cipher(window.gameId);
	const data = await getGameData();
	if ([data.white, data.black].includes(window.username)) {
		window.playerCount = +data.players;
		const whiteName = data.white.split('[]')[0];
		const blackName = data.black.split('[]')[0];
		window.playerTurn = { [whiteName]: 'white', [blackName]: 'black' }[window.username];
		const [opponentName, opponentElo] = data[invertColour(window.playerTurn)].split('[]');
		window.opponentName = opponentName;
		window.opponentElo = +opponentElo;
	}
	else {
		window.playerCount = ~~data.players + 1;
		window.playerTurn = [, 'white', 'black'][playerCount] || '';
		if (playerCount > 2 && !gameOptions.spectating) {
			gameOptions.spectating = true;
			addGameData('Spectating', 'Yes');
		}
	}
	if (window.playerTurn === 'black') flipBoard();
	if (window.username === '[Anon]') {
		let newName = window.playerCount < 3 ? 'Player' + window.playerCount : 'Spectator' + (window.playerCount - 2);
		window.username = newName;
	}
	window.chat = [[+new Date(), '[System]', `${username} joined`].join(SEP.INFO)];
	$('#chat').innerHTML = window.chat.map(msg => formatChatMessage(msg.split(SEP.INFO)));
	$('#winner').innerText = '';
	//debug
	console.log(whiteName);
	console.log(blackName);
	$(`#${playerTurn}-username`).innerText = window.opponentName;
	$(`#${playerTurn}-elo`).innerText = window.opponentElo;
	$(`#${invertColour(playerTurn)}-username`).innerText = window.username;
	$(`#${invertColour(playerTurn)}-elo`).innerText = window.userElo;
	sendDB('soft:true');
	sendChatMessage('force:true');
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
