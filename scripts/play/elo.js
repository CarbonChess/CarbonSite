function calculateElo(currentElo, opponentElo, outcome) {
	const ratingDelta = opponentElo - currentElo;
	const expected = 1 / (1 + 10 ** (ratingDelta / 400));
	const multiplier = 30;
	return currentElo + multiplier * (outcome - expected);
}
