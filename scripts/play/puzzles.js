const puzzleCache = 10;
let savedPuzzles;
let movesToMake;
let puzzleColour;
let puzzlePosition = 0;
let hasLoadedCustom = false;

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

async function getPuzzles(start) {

	// fetch puzzle data
	let fileData = await fetch('/data/puzzles.csv').then(data => data.text());
	let puzzleList = processData(fileData);
	puzzleList = puzzleList.map(array => Object.fromEntries(array.map(item => item.split(':')))); // convert to array of objects
	let selection = [];

	// set first puzzle if explicitly specified
	if (start && !hasLoadedCustom) {
		hasLoadedCustom = true;
		const customPuzzle = puzzleList.find(obj => obj.ID === start);
		if (customPuzzle) selection.push(customPuzzle);
	}

	// attempt to filter to current difficulty
	let sortedPuzzles = puzzleList;
	for (let i = 200; i < 800; i += 200) {
		sortedPuzzles = puzzleList.filter(obj => Math.abs(obj.ELO - gameOptions.difficulty) < i);
		if (sortedPuzzles.length >= 10) break;
	}
	puzzleList = sortedPuzzles;

	// cache selected list of puzzles
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

function setBoard(item) {
	$.id('current-puzzle-name').innerText = savedPuzzles[item].ID;
	createBoardFromFen(savedPuzzles[item].FEN);
	movesToMake = savedPuzzles[item].Moves.split(' ');
	alignBoard();
	flipBoard();
	puzzleColour = global.currentTurn;
	setTimeout(puzzleMove, 1000);
}

function nextPuzzle() {
	window.ingame = true;
	window.points = { w: 0, b: 0 };
	window.failedPuzzleAttempts = 0;
	$.id('puzzle-attempts-value').innerText = window.failedPuzzleAttempts;
	$$('td').forEach(elem => elem.setAttribute('class', ''));
	if (puzzlePosition >= puzzleCache - 1) {
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
	window.puzzleHintUsed = true;
	$.id(movesToMake[0].slice(0, 2).toUpperCase())?.classList.add('valid');
}
