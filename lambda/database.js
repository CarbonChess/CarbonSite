/*
	Database typing: {'id': string, 'fen': string, 'time': Date}
*/
const faunadb = require('faunadb');

const Q = faunadb.query;
const { FAUNA_CLIENT_KEY } = process.env;

const client = new faunadb.Client({ secret: FAUNA_CLIENT_KEY });
const COLLECTION = 'Games';

const resolve = ret => console.log('Success:', ret);
const rejection = err => console.error('Error:', err.message);

async function getDocs() {
	console.debug('Retrieving documents');
	const docs = await client.query(
		Q.Map(
			Q.Paginate(Q.Documents(Q.Collection(COLLECTION))),
			Q.Lambda(x => Q.Get(x))
		)
	);
	console.log('Documents:', docs.data);
	return docs.data;
}

async function getGameData(gameId) {
	console.debug('Retrieving game data of ID', gameId);
	let docs = await getDocs();
	return docs.filter(doc => doc.data.id === gameId);
}

async function readData(gameId) {
	console.debug('Reading game data of ID', gameId);
	const docs = await getGameData(gameId);
	const success = docs.length >= 1;
	return { success, data: success ? docs[0].data : {} };
}

async function sendData(gameId, fen) {
	console.debug('Sending game data', fen, 'to ID', gameId);
	let success, type;
	let docs = await getGameData(gameId);
	// Remove duplicates if applicable
	if (docs.length > 1) {
		await docs.slice(1).forEach(async (doc) => {
			await client.query(
				Q.Delete(doc.ref)
			).then(resolve).catch(rejection);
		});
		docs = [docs[0]];
	}
	// Make new document if no game is in session
	if (docs.length === 0) {
		type = 'create';
		await client.query(
			Q.Create(
				Q.Collection(COLLECTION),
				{ data: { id: gameId, fen, time: +new Date() } }
			)
		).then(r => success = true).catch(e => success = false);
	}
	// Otherwise update existing doc
	else {
		type = 'update';
		await client.query(
			Q.Update(
				docs[0].ref,
				{ data: { id: gameId, fen, time: +new Date() } }
			)
		).then(r => success = true).catch(e => success = false);
	}
	return { type, success, data: { gameId, fen } };
}

exports.handler = async function (event, context, callback) {
	console.debug('Function activated', event, context, callback);
	const input = event.queryStringParameters;
	const { type, gameId, fen } = input;
	const funcs = {
		help: async () => ['help', 'list', 'read', 'send'],
		list: async () => await getDocs().map(obj => obj.data),
		read: async () => await readData(gameId),
		send: async () => await sendData(gameId, fen),
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
