function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (let j = 0; j < headers.length; j++) {
                tarr.push(headers[j] + ":" + data[j]);
            }
            lines.push(tarr);
        }
    }
    console.log(lines);
}

async function getPuzzles() {
    const PUZZLENO = 10;
    let fileData = await fetch('/images/puzzles.csv').then(data => data.text());
    let puzzleList = processData(fileData);

    let selection = [];
    for (let i = 1; 1 <= PUZZLENO; i++) {
        selection.push[puzzleList[Math.floor[Math.random() * puzzleList.length] + 1]];
    }
    return selection;
}
