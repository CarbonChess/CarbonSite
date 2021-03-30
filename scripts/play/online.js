const api = 'https://api.jsonbin.io/v3/b/60629d5518592d461f0308d4';

const dbCheckInterval = 5 * 1000;
let lastDBEntry = '';
let timeSinceLastDBChange = 0;
let lastDB = {};
let gameID = 1;

async function readDB() {
	const db = (await fetch(api + '/latest').then(data => data.json())).record;
	console.log('Database read');
	if (JSON.stringify(lastDB) === JSON.stringify(db)) {
		timeSinceLastDBChange += dbCheckInterval;
	}
	lastDB = db;
	return db;
}

async function readLastTurn() {
	let db = await readDB();
	const fen = db.games[gameID];
	lastDBEntry = fen;
	if (fen) createBoardFromFen(fen);
}

async function sendCurrentTurn(fen) {
	let db = await readDB();
	if (!db.games) db.games = {};
	db.games[gameID] = fen || createFen();

	let req = new XMLHttpRequest();
	req.open('PUT', api, false);
	req.setRequestHeader('Content-Type', 'application/json');
	req.setRequestHeader('X-Bin-Versioning', 'false')
	req.send(JSON.stringify(db));
	console.log('Database updated');
}

function changeAutoPing() {
	autoPing = !autoPing;
	$('#automatic-ping').setAttribute('class', autoPing ? 'enabled' : 'disabled');
}

function ping() {
	if (timeSinceLastDBChange > 60*1000) {
		alert('Timed out');
		location.reload();
	}
	if (!autoPing || selectedCell) return;
	console.log('Pinging');
	readLastTurn();
}
setInterval(ping, 5000);
