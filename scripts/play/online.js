const apiUrl = '/.netlify/functions/database';

(function getGameId() {
    return window.gameId = document.cookie.split('; ').find(row => row.startsWith('gameId=')).split('=')[1];
})();

async function readDB() {
    const resp = await fetch(`${apiUrl}?type=read&gameId=${gameId}`);
    const json = await resp.json();
    const data = json.output.data;
    console.debug(`Retrieved FEN data for game ID ${gameId}.`)
    createBoardFromFen(data.fen);
}

async function sendDB() {
    await fetch(`${apiUrl}?type=send&gameId=${gameId}&fen=${encodeURIComponent(createFen())}`);
    console.debug(`Sent FEN data for game ID ${gameId}.`)
}
