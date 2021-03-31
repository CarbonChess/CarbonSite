let rules = true;

function showSection(section) {
	$('#select-opponent').setAttribute('class', 'hide');
	if (section === 'player') {
		$('#player-settings').setAttribute('class', '');
		$('#player-play').classList.remove('hide');
	}
	else if (section === 'bot') {
		$('#bot-settings').setAttribute('class', '');
	}
	else if (section === 'online') {
		$('#play-online').setAttribute('class', '');
		$('#player-play').classList.remove('hide');
	}
}

function updatePlayerPlay(type, elem) {
	if (type === 'device') {
		$('#player-online').classList.remove('selected');
		$('#player-device').classList.add('selected');
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(multiplayer)=1/, '$1=0'));
	}
	else if (type === 'online') {
		$('#player-device').classList.remove('selected');
		$('#player-online').classList.add('selected');
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(multiplayer)=0/, '$1=1'));
	}
	else if (type === 'gamecode') {
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(gamecode)=\d*/, '$1=' + $('#game-code').value));
	}
	else if (type === 'no rules') {
		rules = !rules;
		$('#no-rules').setAttribute('data-rules', rules ? 'yes' : 'no');
		$('#no-rules').classList[!rules ? 'remove' : 'add']('selected');
		$$('#player-play a').forEach(a => a.href = a.href.replace(/(rules)=\d*/, '$1=' + (rules ? '1' : '0')));
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

function randomGameCode() {
	$('#game-code').value = Math.random().toString().substr(2, 5);
}
