/* Il file da rileggere, in forma comoda: node src/testi/rivedere.mjs  ->  src/testi/da-rivedere.md
   Parte da src/testi/scritte.md (rigenerarlo prima con `node src/testi.mjs`) e lo ridispone per la lettura: tappe sotto il loro atto, un'etichetta chiara davanti a ogni parte
   (Testo, Una voce di allora, Fra storia e leggenda, Passo sulla carta…) e il segno 🆕 sulle scritte che non compaiono nei file già corretti dall'utente
   (src/testi/verifica/scritte-corrette-dall-utente.md, src/testi/da-rileggere-corretto.md, src/testi/tappe-cristianesimo.md): sono quelle nuove o cambiate dopo la sua revisione.
   Le righe restano nella forma «[sigla] testo», così il file corretto si riporta in pagina con src/testi/riporta.mjs, come scritte.md. Chiesto dall'utente il 23 novembre 2026. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const leggi = f => { try { return fs.readFileSync(path.join(QUI, f), 'utf8'); } catch (e) { return ''; } };
const norma = s => String(s).replace(/<<nota:[^>]*>>/g, '').replace(/[’‘`]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const giaLetti = norma([leggi('verifica/scritte-corrette-dall-utente.md'), leggi('da-rileggere-corretto.md'), leggi('tappe-cristianesimo.md'), leggi('verifica/da-rivedere-corretto-dall-utente-23-novembre.md')].join('\n').replace(/^\[[^\]]+\] ?/gm, ''));
const nuova = t => t.length > 3 && !giaLetti.includes(norma(t));

/* l'etichetta di una sigla, dalla sua coda */
function etichetta(k) {
  const c = k.replace(/^T\d+-\d+\./, '');
  let m;
  if (c === 'titolo') return 'Titolo';
  if (c === 'testo') return 'Testo';
  if (c === 'leggenda') return 'Fra storia e leggenda';
  if (c === 'storici') return 'Le interpretazioni degli storici';
  if ((m = /^voce(\d+)\.testo$/.exec(c))) return 'Una voce di allora (' + m[1] + ')';
  if ((m = /^voce(\d+)\.chi$/.exec(c))) return 'Chi la scrive (' + m[1] + ')';
  if ((m = /^chi(\d+)\.nome$/.exec(c))) return 'Protagonista ' + m[1] + ': nome';
  if ((m = /^chi(\d+)\.date$/.exec(c))) return 'Protagonista ' + m[1] + ': date';
  if ((m = /^chi(\d+)\.riga$/.exec(c))) return 'Protagonista ' + m[1] + ': riga';
  if ((m = /^luogo\d+\.(.+)$/.exec(c))) return 'Sulla carta, accanto al rombo di «' + m[1] + '»';
  if ((m = /^passo(\d+)\.anno$/.exec(c))) return 'Passo ' + m[1] + ' sulla carta: anno';
  if ((m = /^passo(\d+)\.testo$/.exec(c))) return 'Passo ' + m[1] + ' sulla carta: didascalia';
  if ((m = /^passo(\d+)\.freccia\d+$/.exec(c))) return 'Passo ' + m[1] + ': nome sulla freccia';
  if (/^atto\.[IVX]+\.nome$/.test(k)) return 'Nome dell\'atto';
  if (/^atto\.[IVX]+\.sommario$/.test(k)) return 'L\'atto in breve';
  if (/^evento\./.test(k)) return 'Didascalia nella città di Roma';
  if (/^scheda\./.test(k)) return 'Scheda del monumento: ' + k.split('.').slice(2).join(' ');
  if (/^tesi\./.test(k)) return 'Perché cadde: ' + k.split('.').slice(2).join(' ');
  return '';
}

const righe = leggi('scritte.md').split(/\r?\n/);
if (!righe.length || !righe[0]) { console.error('manca src/testi/scritte.md: prima `node src/testi.mjs`'); process.exit(1); }
const out = [], indice = [];
let sezione = null, blocco = null, tot = 0, nuove = 0, saltaIntro = true;
const blocchi = [];
for (const r of righe) {
  if (saltaIntro && !/^## /.test(r)) continue;
  saltaIntro = false;
  if (/^## /.test(r)) { sezione = { titolo: r.slice(3), blocchi: [] }; blocchi.push(sezione); blocco = { titolo: null, righe: [] }; sezione.blocchi.push(blocco); continue; }
  if (/^### /.test(r)) { blocco = { titolo: r.slice(4), righe: [] }; sezione.blocchi.push(blocco); continue; }
  const q = /^\[([^\]]+)\] ?(.*)$/.exec(r);
  if (q && blocco) { const n = nuova(q[2]); blocco.righe.push({ k: q[1], t: q[2], n }); tot++; if (n) nuove++; }
}

out.push('# Come finisce un impero · tutti i testi da rivedere', '',
  'Generato da `src/testi/rivedere.mjs` il ' + new Date().toLocaleString('it-IT') + ', dalla pagina pubblicata.', '',
  '**Come si legge.** Le tappe stanno nell\'ordine della linea del tempo. Davanti a ogni testo c\'è un\'etichetta in corsivo che dice che cos\'è (il testo della tappa, una voce di allora, la leggenda, un passo della carta…).',
  'Il segno 🆕 indica un testo **nuovo o cambiato dopo le tue revisioni** del 22 e 23 novembre: sono quelli da leggere per primi. Gli altri li hai già corretti tu.', '',
  '**Come si corregge.** Ogni testo sta su una riga che comincia con la sua sigla fra parentesi quadre: cambia il testo dopo la sigla, ma non toccare la sigla e non unire due righe.',
  'Se una riga va tolta, lascia la sigla e scrivi `TOGLIERE`. Per un dubbio aggiungi in fondo alla riga `<<nota: …>>`. Le citazioni sono traduzioni da fonti lette: lì conviene ritoccare solo l\'italiano.', '',
  '**In tutto:** ' + tot + ' testi, di cui **' + nuove + ' nuovi o cambiati** (🆕).', '');

/* indice: le sezioni, e per le tappe quante cose nuove hanno */
out.push('## Indice', '');
const ancora = s => s.trim().toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');      // come GitHub e VS Code: lettere accentate tenute, ogni spazio un trattino
for (const s of blocchi) {
  const n = s.blocchi.reduce((a, b) => a + b.righe.filter(x => x.n).length, 0);
  out.push('- [' + s.titolo + '](#' + ancora(s.titolo) + ')' + (n ? ' · 🆕 ' + n : ''));
  if (/Le tappe/.test(s.titolo)) for (const b of s.blocchi) { if (!b.titolo) continue; const m = b.righe.filter(x => x.n).length; if (m) out.push('  - [' + b.titolo + '](#' + ancora(b.titolo) + ') · 🆕 ' + m); }
}
out.push('');

for (const s of blocchi) {
  out.push('---', '', '## ' + s.titolo, '');
  for (const b of s.blocchi) {
    if (b.titolo) { const m = b.righe.filter(x => x.n).length; out.push('### ' + b.titolo, ''); if (m) out.push('**🆕 ' + m + (m === 1 ? ' testo nuovo o cambiato**' : ' testi nuovi o cambiati**'), ''); }      // il conteggio fuori dal titolo, perché il collegamento dell'indice resti giusto
    for (const x of b.righe) {
      const e = etichetta(x.k);
      if (e || x.n) out.push('*' + (e || 'Testo') + '*' + (x.n ? ' · 🆕' : ''));
      out.push('[' + x.k + '] ' + x.t, '');
    }
  }
}
fs.writeFileSync(path.join(QUI, 'da-rivedere.md'), out.join('\n'));
console.log(tot + ' testi, ' + nuove + ' nuovi o cambiati -> src/testi/da-rivedere.md');
