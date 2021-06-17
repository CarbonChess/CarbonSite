function updateSelection(elem) {
	$$('#bot-colour .card').forEach(a => a.classList.remove('selected'));
	elem.classList.add('selected');
}

function updateBotIntelligence() {
	const level = $('#bot-intelligence-level').value;
	$$(`[data-level]`).forEach(elem => elem.classList.add('hide'));
	$(`[data-level="${level}"]`).classList.remove('hide');
	$('#bot-intelligence-dots').innerHTML = ' • '.repeat(level) + ` <span id="dot-highlighted">•</span> ` + ' • '.repeat(3 - level);
}
