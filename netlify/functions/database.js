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
			Q.Lambda("X", Q.Get(Q.Var("X")))
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
	if (!docs.length) throw 'No game is in session';
	createBoardFromFen(docs[0].fen);
}

async function sendData(gameId, fen) {
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
		await client.query(
			Q.Create(
				Q.Collection(COLLECTION),
				{ data: { id: gameId, fen, time: +new Date() } }
			)
		).then(resolve).catch(rejection);
	}
	// Otherwise update existing doc
	else {
		await client.query(
			Q.Update(
				docs[0].ref,
				{ data: { id: gameId, fen, time: +new Date() } }
			)
		).then(resolve).catch(rejection);
	}
}

exports.handler = async function (event, context, callback) {
	const { type, data } = event.queryStringParameters;
	const funcs = {
		fetch: data => getGameData(data.gameId),
		read: data => readData(data.gameId),
		send: data => sendData(data.gameId, data.fen),
	};
	if (!funcs[type]) return { statusCode: 405, body: `Error: Invalid function name "${type}".` };

	let resp;
	try {
		resp = await funcs[type](data);
	}
	catch (err) {
		return { statusCode: err.statusCode || 500, body: JSON.stringify(err) };
	}
	return { statusCode: 200, body: JSON.stringify(resp) };
}
