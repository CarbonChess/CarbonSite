const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

const debug = (...args) => console.log('DEBUG', ...args);
const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
const random = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min);
const randomID = (len = 5) => random(0, +'9'.repeat(len)).toString().padStart(len, '0');
const copy = text => navigator.clipboard.writeText(text);
const addGameData = (title, content, id) => $('#game-data_content').innerHTML += `<dt>${title}</dt><dd id="${id}">${content}</dd>`;

const SEP = { MSG: '\x1e', INFO: '\x1f' };

class Cipher {
	textToChars = text => text.split('').map(c => c.charCodeAt(0));
	applySalt = code => this.textToChars(this.salt).reduce((t, cur) => t ^ cur, code);
	constructor(salt) {
		this.salt = salt;
	}
	encode(text = '') {
		const encodeByte = n => String.fromCharCode(n);
		return text.split('').map(this.textToChars).map(this.applySalt).map(encodeByte).join('');
	}
	decode(text = '') {
		const decodeByte = char => char.charCodeAt(0);
		const decodeChars = code => String.fromCharCode(code);
		return text.split('').map(decodeByte).map(this.applySalt).map(decodeChars).join('');
	}
};
