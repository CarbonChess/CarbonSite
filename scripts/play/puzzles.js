let savedPuzzles;
let movesToMake;
let puzzleColour;
let puzzlePosition = 0;

function processData(allText) {
	const allTextLines = allText.split(/\r\n|\n/);
	const headers = allTextLines[0].split(',');
	let lines = [];

	for (let i = 1; i < allTextLines.length; i++) {
		const data = allTextLines[i].split(',');
		if (data.length === headers.length) {
			let textArray = [];
			for (let j = 0; j < headers.length; j++) {
				textArray.push(headers[j] + ":" + data[j]);
			}
			lines.push(textArray);
		}
	}
	return lines;
}

async function getPuzzles() {
	const puzzleCache = 10;
	let fileData = await fetch('/data/puzzles.csv').then(data => data.text());
	let puzzleList = processData(fileData);
	puzzleList = puzzleList.map(array => Object.fromEntries(array.map(item => item.split(':')))); // convert to array of objects

	// attempt to filter to current difficulty
	let sortedPuzzles = puzzleList;
	for (let i = 200; i < 800; i += 200) {
		sortedPuzzles = puzzleList.filter(obj => Math.abs(obj.ELO - gameOptions.difficulty) < i);
		if (sortedPuzzles.length >= 10) break;
	}
	puzzleList = sortedPuzzles;

	let selection = [];
	for (let i = 1; i <= puzzleCache; i++) {
		selection.push(puzzleList[random(0, puzzleList.length - 1)]);
	}
	savedPuzzles = selection;
}

function puzzleMove() {
	const [, start, end, promotion] = movesToMake[0].toUpperCase().match(/^(..)(..)(.?)/);
	if (promotion) global.promotionPiece = promotion;
	hasClicked(start);
	hasClicked(end);
	movesToMake.shift();
}

function setBoard(itemNo) {
	createBoardFromFen(savedPuzzles[itemNo].FEN);
	movesToMake = savedPuzzles[itemNo].Moves.split(' ');
	alignBoard();
	flipBoard();
	puzzleColour = global.currentTurn;
	setTimeout(puzzleMove, 1000);
}

function nextPuzzle() {
	window.failedPuzzleAttempts = 0;
	$.id('puzzle-attempts-value').innerText = window.failedPuzzleAttempts;
	window.ingame = true;
	if (puzzlePosition === 9) {
		puzzlePosition = 0;
		getPuzzles().then(setBoard(puzzlePosition));
	} else {
		puzzlePosition++;
		setupBoard();
		setBoard(puzzlePosition);
	}
	$.id('next-puzzle').classList.add('hide');
	$.id('winner').innerHTML = 'Find the best move';
}

function showPuzzleHint() {
	$.id(movesToMake[0].slice(0, 2).toUpperCase())?.classList.add('valid');
}
