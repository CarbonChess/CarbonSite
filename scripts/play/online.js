const api = 'https://api.jsonbin.io/v3/b/60629d5518592d461f0308d4';

const dbCheckInterval = 5 * 1000;
//let lastDBEntry = '';
let timeSinceLastDBChange = 0;
let lastDB = {};

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
	const gameData = db.games[gameID];
	if (!gameData) return;
	//lastDBEntry = gameData.fen;
	if (gameData.fen) createBoardFromFen(gameData.fen);
}

async function sendCurrentTurn(fen) {
	timeSinceLastDBChange=0;
	
	let db = await readDB();
	if (!db.games) db.games = {};

	db.name = 'CarbonChess API';
	db.version = 'beta';
	for (let id in db.games) {
		const oneDay = 86.4e6;
		if (+new Date() - db.games[id].time > oneDay / 2) {
			delete db.games[id];
		}
	}

	db.games[gameID] = {
		fen: fen || createFen(),
		time: +new Date(),
	};

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
	if (timeSinceLastDBChange > 60 * 1000) {
		alert('Timed out');
		location.reload();
	}
	if (!autoPing || selectedCell) return;
	console.log('Pinging');
	readLastTurn();
}
setInterval(ping, 5000);
