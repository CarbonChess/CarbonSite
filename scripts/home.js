function showSection(section) {
	$('#back').classList.remove('hide');
	$('#select-opponent').classList.add('hide');
	$('#' + section + '-settings').classList.remove('hide');
}

function back() {
	$('#back').classList.add('hide');
	$('#select-opponent').classList.remove('hide');
	$$('[id*="settings"]').forEach(elem => elem.classList.add('hide'));
}

function updateBotPlay(type, elem) {
	const $botPlay = $('#bot-play a');
	if (type === 'intelligence') {
		$botPlay.href = $botPlay.href.replace(/(botIntelligence=)\d+/, '$1' + elem.value);
	}
	else if (type === 'colour') {
		$$('#bot-colour .card').forEach(a => a.classList.remove('selected'));
		$botPlay.href = $botPlay.href.replace(/(botColour=)\w+/, '$1' + elem.innerText.toLowerCase());
		elem.classList.add('selected');
	}
}

function updateBotIntelligence() {
	const level = $('#bot-intelligence-level').value;
	$$(`[data-level]`).forEach(elem => elem.classList.add('hide'));
	$(`[data-level="${level}"]`).classList.remove('hide');
}

function updateRules(elem) {
	elem.dataset.rules = elem.dataset.rules === 'false';
	$('#offline-play').href = $('#offline-play').href.replace(/(?<=free=)\d/, elem.dataset.rules === 'false' ? 1 : 0);
}

function createGameCode() {
	$('#game-code').value = Math.random().toString().substr(2, 5);
}

function updateOnlinePlay(elem) {
	$('#online-play').href = $('#online-play').href.replace(/(?<=gamecode=)\d+/, $('#game-code').value);
}
