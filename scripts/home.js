function showSection(section) {
	$$('#back, #play').forEach(elem => elem.classList.remove('hide'));
	$('#select-opponent').classList.add('hide');
	$('#' + section + '-settings').classList.remove('hide');
	if (section === 'bot') $(`[name="bot"]`).checked = true;
	if (section === 'online') $(`[name="multiplayer"]`).checked = true;
}

function back() {
	$$('#back, #play').forEach(elem => elem.classList.add('hide'));
	$('#select-opponent').classList.remove('hide');
	$$('[id*="settings"]').forEach(elem => elem.classList.add('hide'));
}

function updateSelection(elem) {
	$$('#bot-colour .card').forEach(a => a.classList.remove('selected'));
	elem.classList.add('selected');
}

function updateBotIntelligence() {
	const level = $('#bot-intelligence-level').value;
	$$(`[data-level]`).forEach(elem => elem.classList.add('hide'));
	$(`[data-level="${level}"]`).classList.remove('hide');
	$('#bot-intelligence-dots').innerHTML = ' • '.repeat(level - 1) + ` <span id="dot-highlighted">•</span> ` + ' • '.repeat(4 - level);
}

function cleanGameCode() {
	$('#game-code').value = $('#game-code').value.replace(/[^\d]/g, '').padStart(5, '0').substr(0, 5);
}

function createGameCode() {
	$('[name="gamecode"]').value = Math.random().toString().substr(2, 5);
}
