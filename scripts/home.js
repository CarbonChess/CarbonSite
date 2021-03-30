function showSection(section) {
	$('#select-opponent').setAttribute('class', 'hide');
	if (section === 'player') {
		$('#player-settings').setAttribute('class', '');
	}
	else if (section === 'bot') {
		$('#bot-settings').setAttribute('class', '');
	}
}

function updatePlayerPlay(type, elem) {
	if (type === 'device') {
		$('#player-online').classList.remove('selected');
		$('#player-device').classList.add('selected');
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(multiplayer)=1/, '$1=0'))
	}
	else if (type === 'online') {
		$('#player-device').classList.remove('selected');
		$('#player-online').classList.add('selected');
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(multiplayer)=0/, '$1=1'))
	}
}

function updateBotPlay(type, elem) {
	if (type === 'intelligence') {
		$$('#bot-intelligence .card').forEach(a => a.classList.remove('selected'));
		$$('#bot-play a').forEach(a => {
			a.href = a.href.replace(/(botIntelligence=)\d+/, '$1' + elem.dataset.value);
		});
	}
	else if (type === 'colour') {
		$$('#bot-colour .card').forEach(a => a.classList.remove('selected'));
		$$('#bot-play a').forEach(a => {
			a.href = a.href.replace(/(botColour=)\w+/, '$1' + elem.dataset.value)
		});
	}
	elem.classList.add('selected');
}
