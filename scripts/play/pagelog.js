function log({ startCell, endCell, startClasses, endClasses, count, taken, promoted, castled, check }) {

	window.lastMove = { start: startCell, end: endCell };
	const [colour, piece] = startClasses;

	if (taken) points[colour[0]] += getPointsEquivalent(endClasses[1]);
	if (promoted) points[colour[0]] += getPointsEquivalent(getPieceClasses(endCell)[1]);
	logPoints();

	let code = ' ';
	if (count % 2 === 1 && hasRules) code += '<br class="desktoponly">' + ((count + 1) / 2) + '. ';
	if (castled) {
		code += endCell.charCodeAt(0) < 'D'.charCodeAt(0) ? '0-0-0' : '0-0';
	}
	else {
		code += getPieceID(piece);
		if (taken && piece === 'pawn') code += startCell[0].toLowerCase();
		if (taken || enpassantTaken) code += 'x';
		code += endCell.toLowerCase();
		if (promoted) code += '=' + getPieceID(promotionPiece);
	}
	if (check) code += '+';
	$('#log').innerHTML += `<span class="move">` + code + '</span>';
}

function logPoints() {
	const pointsDiff = { w: points.b - points.w, b: points.w - points.b }
	$.id('white-points').innerText = pointsDiff.w > 0 ? '+' + pointsDiff.w : '';
	$.id('black-points').innerText = pointsDiff.b > 0 ? '+' + pointsDiff.b : '';
}

function logTakenPiece(colour, piece) {
	const takenPiece = createPiece(piece, colour);
	takenPiece.setAttribute('data-move', totalMoves);
	$.id(colour + '-pieces').appendChild(takenPiece);
	logPoints();
}

/* Console IDs
 * S = selected
 * T = type
 * M = move
 * I = invalid
*/
