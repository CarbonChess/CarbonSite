/*
	Database typing: {'id': string, 'fen': string, 'lastMove': string}
*/
const faunadb = require('faunadb');
const { FAUNA_CLIENT_KEY } = process.env;
const Q = faunadb.query;
const client = new faunadb.Client({ secret: FAUNA_CLIENT_KEY });
const COLLECTION = 'Games';
const MAX_AGE = 3 * 86.4e6; // 3 days
const SEP = { MSG: '\u001e', INFO: '\u001d' }; // sync with online.js

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
	let deletedDocs = [];
	for (const doc of docs) {
		const invalidID = !/^\d{5}$/.test(doc.data.id);
		const oldSession = +new Date() - doc.ts / 1e3 > MAX_AGE;
		if (invalidID || oldSession) {
			deleteDoc(doc);
			deletedDocs.push(doc.data);
		}
	}
	return { success: docs.length > 1, data: { deleted: deletedDocs } };
}

async function readData({ gameId }) {
	console.debug('Reading game data of ID', gameId);
	const docs = await getGameData(gameId);
	const success = docs.length >= 1;
	return { success, data: success ? docs[0].data : {} };
}

async function sendData({ gameId, fen, moves, ingame, players, chat }) {
	const data = { id: gameId, fen, moves, ingame, players, chat };
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
			Q.Create(Q.Collection(COLLECTION), { data })
		).then(() => success = true).catch(() => success = false);
	}
	// Otherwise update existing doc
	else {
		type = 'update';
		// Merge chat messages
		{
			const uniqueMsgs = [...new Set([...docs[0].data.chat, chat])];
			const getDate = str => +str.split(SEP.INFO)[0];
			const sorter = (a, b) => getDate(a) > getDate(b) ? +1 : -1;
			docs[0].data.chat = uniqueMsgs.sort(sorter);
		}
		// Update doc
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
		list: async () => await getDocs(),
		prune: async () => await pruneDocs(),
		read: async () => await readData(input),
		send: async () => await sendData(input),
		version: async () => await 1.01,
	};
	funcs.help = async () => ({ commands: Object.keys(funcs), version: await funcs.version() });
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
