function updateSelection(elem) {
	$$('#bot-colour .card').forEach(a => a.classList.remove('selected'));
	elem.classList.add('selected');
}

function updateSlider(id) {
	const level = $(`#${id}-level`).value;
	$$(`[data-level]`).forEach(elem => elem.classList.add('hide'));
	$(`[data-level="${level}"]`).classList.remove('hide');
	$(`#${id}-dots`).innerHTML = ' • '.repeat(level - 1) + ` <span id="dot-highlighted">•</span> ` + ' • '.repeat(4 - level);
}
