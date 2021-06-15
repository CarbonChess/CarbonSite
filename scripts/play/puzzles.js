let savedPuzzles;
let movesToMake;
function processData(allText) {
    let allTextLines = allText.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    for (let i = 1; i < allTextLines.length; i++) {
        let data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            let tarr = [];
            for (let j = 0; j < headers.length; j++) {
                tarr.push(headers[j] + ":" + data[j]);
            }
            lines.push(tarr);
        }
    }
    return lines;
}

async function getPuzzles() {
    const PUZZLENO = 10;
    let fileData = await fetch('/images/puzzles.csv').then(data => data.text());
    let puzzleList = processData(fileData);

    let selection = [];
    for (let i = 1; i <= PUZZLENO; i++) {
        selection.push(puzzleList[Math.floor(Math.random() * puzzleList.length) + 1]);
    }
    selection = selection.map(array => Object.fromEntries(array.map(item => item.split(':')))); // convert to array of objects
    savedPuzzles = selection;
}

function puzzleMove() {
    let move = movesToMake.shift(0);
    hasClicked(move.slice(0, 2));
    hasClicked(move.slice(2, 4));
}
function setBoard(itemNo) {
    createBoardFromFen(savedPuzzles[itemNo].FEN);
    movesToMake = savedPuzzles[itemNo].Moves.split(' ');
    alignBoard();
    setTimeout(puzzleMove, 1000);
}
