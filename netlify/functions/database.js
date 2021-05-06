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
	const docs = await client.query(
		Q.Map(
			Q.Paginate(Q.Documents(Q.Collection("Games"))),
			Q.Lambda("X", Q.Get(Q.Var("X"))) //?
		)
	);
	console.log('Documents:', docs.data);
	return docs.data;
}

async function getGameData(gameID) {
	let docs = await getDocs();
	return docs.filter(doc => doc.data.id === gameId);
}

async function readData(gameId) {
	const docs = await getGameData(gameId);
	let success = docs.length > 1;
	if (success) createBoardFromFen(docs[0].data.fen);
	return { success, data: docs[0].data };
}

async function sendData(gameId, fen) {
	let success, type;
	let docs = await getGameData(gameID);
	// Remove duplicates if applicable
	if (docs.length > 1) {
		await docs.slice(1).forEach(doc => {
			client.query(
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
	const { type, gameId, fen } = event.queryStringParameters;
	const funcs = {
		list: () => ({ 'in': { type, gameId, fen }, 'out': getDocs() }),
		game: () => ({ 'in': { type, gameId, fen }, 'out': getGameData(gameId) }),
		read: () => ({ 'in': { type, gameId, fen }, 'out': readData(gameId) }),
		send: () => ({ 'in': { type, gameId, fen }, 'out': sendData(gameId, fen) }),
	};
	if (!funcs[type]) return { statusCode: 405, body: `Error: Invalid function name "${type}".` };

	let resp;
	try {
		resp = await funcs[type](data);
		return { statusCode: 200, body: JSON.stringify(resp) };
	}
	catch (err) {
		return { statusCode: err.statusCode || 500, body: JSON.stringify(err) };
	}
}
