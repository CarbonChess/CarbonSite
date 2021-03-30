const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
$.id = s => document.getElementById(s);
$$.className = s => document.getElementsByClassName(s);

const debug = (...args) => console.log('DEBUG', ...args);
const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem ?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
