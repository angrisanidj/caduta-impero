/* Prepara la pagina per la pubblicazione: scrive una versione nuova su tutti i file caricati da index.html
   (così browser e telefoni non riusano le copie vecchie) e la mostra in fondo alla pagina.
   Uso: node src/pubblica.mjs   poi commit e push. */
import fs from 'node:fs';
const f=new URL('../index.html',import.meta.url), ora=new Date();
const due=n=>String(n).padStart(2,'0');
const v=`${ora.getFullYear()}${due(ora.getMonth()+1)}${due(ora.getDate())}-${due(ora.getHours())}${due(ora.getMinutes())}`;
const leggibile=`${ora.getDate()}/${ora.getMonth()+1}/${ora.getFullYear()}, ore ${due(ora.getHours())}:${due(ora.getMinutes())}`;
let s=fs.readFileSync(f,'utf8');
s=s.replace(/((?:src|href)="(?:js|css)\/[^"?]+)(?:\?v=[^"]*)?"/g,`$1?v=${v}"`);
s=s.replace(/<p class="versione"[^>]*>.*?<\/p>\s*/s,'');
s=s.replace('</footer>',`  <p class="versione">Versione del ${leggibile}</p>\n</footer>`);
fs.writeFileSync(f,s);
console.log('versione',v);
