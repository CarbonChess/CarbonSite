function FenFurnace(){"use strict";var e={d:(o,r)=>{for(var t in r)e.o(r,t)&&!e.o(o,t)&&Object.defineProperty(o,t,{enumerable:!0,get:r[t]})},o:(e,o)=>Object.prototype.hasOwnProperty.call(e,o),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},o={};function r(e){return String.fromCharCode(e+64)}function t(e){return"b"===e?"w":"b"}function a(e){if(l(e))return b(n(e))?"w":"b";console.warn("Cell",e,"is empty")}function n(e){const o=parseInt(e[0],36)-9,r=8-e[1];return global.boardArray[r][o-1]}function l(e){return"-"!==n(e)}function s(e,o){if(!l(e))return console.log("No Piece Found"),!1;console.log("Moving",e,"->",o),c(n(e),o),u(e)}function c(e,o){console.log("Adding piece",e,"to",o);const r=parseInt(o[0],36)-9,t=8-o[1];let a=global.boardArray[t];global.boardArray[t]=a.substr(0,r-1)+e+a.substr(r)}function u(e){console.log("Deleting piece from",e);const o=parseInt(e[0],36)-9,r=8-e[1];let t=global.boardArray[r];global.boardArray[r]=t.substr(0,o-1)+"-"+t.substr(o)}function b(e){return e===e.toUpperCase()}function i(e,o){return e!==o&&g(e,o)&&!f(e,o)}function g(e,o){let r=n(e),s=r===r.toUpperCase()?"w":"b",c=parseInt(e[1]),u=parseInt(o[1]),b=Math.abs(u-c),i=(e[0],o[0],Math.abs(o.charCodeAt(0)-e.charCodeAt(0)));switch(r.toLowerCase()){case"r":return 0===i||0===b;case"n":return b+i===3&&0!==i&&0!==b;case"k":return i<=1&&b<=1;case"b":return i===b;case"q":return 0===i||0===b||i===b;case"p":const e=1===i&&1===b&&l(o)&&a(o)===t(s),r=1===b||2===b&&[2,7].includes(c),n="w"===s?u>c:u<c,g=o===global.enpassantSquare&&1===i&&1===b;return(e||0===i||g)&&r&&n;default:return!0}}function f(e,o){let r=!1;const s={};let c=n(e),u=a(e),b=parseInt(e[1]),i=parseInt(o[1]),g=Math.abs(i-b),f=e[0],d=o[0],p=Math.abs(o.charCodeAt(0)-e.charCodeAt(0));switch(s.l=d>f?1:d<f?-1:0,s.n=i>b?1:i<b?-1:0,c.toLowerCase()){case"p":return 0===p&&("w"===u?(r=l(e[0]+(b+1)),2!==g||r||(r=l(e[0]+(b+2)))):(r=l(e[0]+(b-1)),2!==g||r||(r=l(e[0]+(b-2))))),r;case"r":case"b":case"q":{let e=!1;for(let o=1;o<=Math.max(p,g);o++){const n=a(String.fromCharCode(parseInt(f.charCodeAt(0))+s.l*o)+(b+s.n*o));(n===u||e)&&(r=!0),n!==t(u)||e||(e=!0)}return r}default:return a(o)===u}}function d(e,o,{isTest:g}={}){const f=n(e);let d=l(o),p=a(e),C=global.boardArray;if(p!=global.currentTurn&&!g)return console.log("Failed to move",e,"->",o),!1;if("k"===f.toLowerCase()&&2===Math.abs(o.charCodeAt(0)-e.charCodeAt(0))){const r=o.charCodeAt(0)-e.charCodeAt(0)>0,t=r?"k":"q";if(!global.castling[p][t])return!1;{const t=r?"H":"A",a="w"===p?"1":"8",c=r?["F","G"]:["B","C","D"];for(let e in c)if(l(c[e]+a))return!1;console.debug("v.134",l(e),l(o),n(e),n(o)),s(e,o),s(t+a,(r?"F":"D")+a),castling[p]={k:!1,q:!1}}}if(!i(e,o))return!1;s(e,o);let h=endcell[1]===("w"===t(p)?"8":"1");if("p"===f&&h){if(!global.promotionPiece)return console.log("NO PROMOTION PIECE FOUND"),global.boardArray=C,!1;u(o),c(global.promotionPiece,o),global.promotionPiece=null}"p"===f&&o===global.enpassantSquare&&(u(global.enpassantSquare),global.halfMoveCount=0);const w=Math.abs(+o[1]-+e[1]);if("p"===f.toLowerCase()&&2===w){const e="w"===p?+o[1]-1:+o[1]+1;global.enpassantSquare=o[0]+e}else global.enpassantSquare;if(function(e){let o={w:"",b:""};for(let e=1;e<=8;e++)for(let t=1;t<=8;t++){const l=r(t)+e;"k"===n(l).toLowerCase()&&(o[a(l)]=l)}for(let n=1;n<=8;n++)for(let s=1;s<=8;s++){const c=r(s)+n;if(!l(c))continue;const u=a(c);if((b(u)&&"b"===e||(t=u)===t.toLowerCase()&&"w"===e)&&i(c,o[e]))return!0}var t;return!1}(global.currentTurn))return global.boardArray=C,!1;if("k"===f)castling[p]={k:!1,q:!1};else if("r"===f){const o="H"===e?"k":"q";castling[p][o]=!1}return"b"===p&&global.moveNumber++,"p"===f.toLowerCase()||d?global.halfMoveCount=0:global.halfMoveCount++,global.currentTurn="w"===global.currentTurn?"b":"w",global.movelist.push(function(){let e="",o=0;for(let r in global.boardArray){let t=global.boardArray[r];for(let r=0;r<t.length;r++)"-"!==t[r]?(o>0&&(e+=o,o=0),e+=t[r]):o++;o>0&&(e+=o),o=0,7!=r&&(e+="/")}e+=" "+global.currentTurn;let r="";return global.castling.w.k&&(r+="K"),global.castling.w.q&&(r+="Q"),global.castling.b.k&&(r+="k"),global.castling.b.q&&(r+="q"),e+=" "+r,e+=" "+global.enpassantsquare,e+=" "+global.halfMoveCount,e+=" "+global.moveNumber,e}()),global.movelist.slice(-1)[0]}e.r(o),e.d(o,{isValid:()=>g,makeMove:()=>d,pieceInWay:()=>f,validateMove:()=>i}),"undefined"==typeof global&&(global={}),Object.assign(global,{castling:{w:{k:!0,q:!0},b:{k:!0,q:!0}},boardArray:[],enpassantSquare:null,moveslist:[],currentTurn:null,halfMoveCount:0,moveNumber:0,promotionPiece:null})};