const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

const debug = (...args) => console.log('DEBUG', ...args);
const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomID = () => random(0, 99999).toString().padStart(5, '0');
const copy = text => navigator.clipboard.writeText(text);

function startTimer(label) {
	window._timer = +new Date();
	window._timerLabel = label;
}

function endTimer() {
	window._timer -= +new Date();
	debug(`Timer "${window._timerLabel}":`, Math.abs(window._timer) + 'ms');
}
