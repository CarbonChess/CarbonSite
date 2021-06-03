const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

const debug = (...args) => console.log('DEBUG', ...args);
const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
const random = (min = 0, max = 99, len) => Math.floor(Math.random() * (max - min + 1) + min).toString().padStart(len||0, '0');
const randomID = (len = 5) => random(0, +'9'.repeat(len)).toString().padStart(len, '0');
const copy = text => navigator.clipboard.writeText(text);
