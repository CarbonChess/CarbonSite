const debug = (...args) => console.log('DEBUG', ...args);

const indexToLetter = n => String.fromCharCode(n + 64);
const getClasses = elem => Array.from(elem ?.classList || []);
const invertColour = colour => colour === 'white' ? 'black' : 'white';
