const faunadb = require('faunadb');
const { FAUNA_CLIENT_KEY } = process.env;
const Q = faunadb.query;
const client = new faunadb.Client({ secret: FAUNA_CLIENT_KEY });
const COLLECTION = 'Games';

async function getGameData(gameId) {
	console.debug('Retrieving game data of ID', gameId);
	let docs = await client.query(
		Q.Map(
			Q.Paginate(Q.Match(Q.Index('GameIDs'), gameId.toString())),
			Q.Lambda(x => Q.Get(x))
		)
	);
	console.log('Documents:', docs.data);
	return docs.data;
}

async function readData({ gameId }) {
	console.debug('Reading game data of ID', gameId);
	const docs = await getGameData(gameId);
	const success = docs.length >= 1;
	return { success, data: success ? docs[0].data : {} };
}

async function sendData({ gameId, fen, moves, lastMove, points, ingame, players, white, black, chat }) {
	const data = { id: gameId, fen, moves, lastMove, points, ingame, players, white, black, chat };
	console.debug('Sending game data', fen, 'to ID', gameId);
	let success, type;
	let docs = await getGameData(gameId);
	// Remove duplicates if applicable
	if (docs.length > 1) {
		docs.slice(1).forEach(client.query(Q.Delete(doc.ref)));
		docs = [docs[0]];
	}
	// Make new document if no game is in session
	if (docs.length === 0) {
		type = 'create';
		await client.query(
			Q.Create(Q.Collection(COLLECTION), { data })
		).then(() => success = true).catch(() => success = false);
	}
	// Otherwise update existing doc
	else {
		type = 'update';
		await client.query(
			Q.Update(docs[0].ref, { ...docs[0].data, data })
		).then(() => success = true).catch(() => success = false);
	}
	return { type, success, data };
}

exports.handler = async function (event, context, callback) {
	console.debug('Function activated', event, context, callback);
	const input = event.queryStringParameters;
	const { type } = input;
	const funcs = {
		read: async () => await readData(input),
		send: async () => await sendData(input),
		help: async () => ['read', 'send'],
	};
	if (!funcs[type]) {
		return { statusCode: 405, body: JSON.stringify(`Error: Invalid function '${type}'.`) };
	}

	let response;
	try {
		const output = await funcs[type]();
		response = { input, output };
		return { statusCode: 200, body: JSON.stringify(response) };
	} catch (err) {
		return { statusCode: err.statusCode || 500, body: JSON.stringify(err) };
	}
}
