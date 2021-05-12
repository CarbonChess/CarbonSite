/*
	Database typing: {'id': string, 'fen': string}
*/
const faunadb = require('faunadb');

const Q = faunadb.query;
const { FAUNA_CLIENT_KEY } = process.env;
const client = new faunadb.Client({ secret: FAUNA_CLIENT_KEY });
const COLLECTION = 'Games';
const MAX_AGE = 7 * 86.4e6;

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

async function deleteDoc(doc) {
	await client.query(Q.Delete(doc.ref)).then(resolve).catch(rejection);
}

async function pruneDocs() {
	const docs = await getDocs();
	for (const doc of docs) {
		// Delete doc if it has an invalid ID or is older than MAX_AGE
		if (!+doc.data.id || new Date() - doc.ts > MAX_AGE) deleteDoc(doc);
	}
}

async function readData(gameId) {
	console.debug('Reading game data of ID', gameId);
	const docs = await getGameData(gameId);
	const success = docs.length >= 1;
	return { success, data: success ? docs[0].data : {} };
}

async function sendData(gameId, fen) {
    if (!+gameId) gameId = Math.random().toString().substr(2,5);
	console.debug('Sending game data', fen, 'to ID', gameId);
	let success, type;
	let docs = await getGameData(gameId);
	// Remove duplicates if applicable
	if (docs.length > 1) {
		docs.slice(1).forEach(deleteDoc);
		docs = [docs[0]];
	}
	// Make new document if no game is in session
	if (docs.length === 0) {
		type = 'create';
		await client.query(
			Q.Create(
				Q.Collection(COLLECTION),
				{ data: { id: gameId, fen } }
			)
		).then(() => success = true).catch(() => success = false);
	}
	// Otherwise update existing doc
	else {
		type = 'update';
		await client.query(
			Q.Update(
				docs[0].ref,
				{ data: { id: gameId, fen } }
			)
		).then(() => success = true).catch(() => success = false);
	}
	return { type, success, data: { gameId, fen } };
}

exports.handler = async function (event, context, callback) {
	console.debug('Function activated', event, context, callback);
	const input = event.queryStringParameters;
	const { type, gameId, fen } = input;
	const funcs = {
		help: async () => ['help', 'list', 'prune', 'read', 'send'],
		list: async () => await getDocs(),
		prune: async () => await pruneDocs(),
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
