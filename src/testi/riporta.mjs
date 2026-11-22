/* Riporta nei file d'origine le correzioni fatte dall'utente sul file delle scritte (src/testi/scritte.md, generato da src/testi.mjs).
   Uso: node src/testi/riporta.mjs <prima.md> <dopo.md> <ora.md> [--scrivi]
     prima.md = il file com'era quando l'utente l'ha ricevuto; dopo.md = il file corretto da lui; ora.md = il file rigenerato adesso dalla pagina.
   Il testo finale di ogni sigla cambiata è: quello di src/testi/verifica/finali-*.json se c'è (righe rilette una per una: stile dell'utente, contenuto verificato),
   altrimenti quello dell'utente. Le scritte corte (titoli, bottoni, legende, nomi degli atti, note dei grafici) restano com'erano se la correzione le allunga
   di oltre il 30% e di più di 8 caratteri. Le etichette della carta (carta.*) non si toccano: vengono da src/mappa/genera.mjs.
   Forma: apostrofo diritto e trattino corto negli intervalli, come nel resto del codice.
   Ogni scritta si cerca nel suo file come testo intero fra virgolette; se compare più volte si guarda dentro il suo blocco (tappa, scheda, tesi…).
   Senza --scrivi non tocca nulla e dice solo che cosa farebbe. Ciò che non trova lo elenca in src/testi/verifica/da-fare-a-mano.json. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const RADICE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [fPrima, fDopo, fOra] = process.argv.slice(2), SCRIVI = process.argv.includes('--scrivi');
const leggiMd = p => { const m = new Map(); for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) { const q = /^\[([^\]]+)\] ?(.*)$/.exec(l); if (q) m.set(q[1], q[2]); } return m; };
const prima = leggiMd(fPrima), dopo = leggiMd(fDopo), ora = leggiMd(fOra);
const forma = s => s.replace(/[’‘]/g, "'").replace(/(\d)\s?[–—]\s?(\d)/g, '$1-$2').replace(/\s+/g, ' ').trim();
const finali = {};
for (const f of fs.readdirSync(path.join(RADICE, 'src/testi/verifica')).filter(f => /^finali-\d+\.json$/.test(f))) Object.assign(finali, JSON.parse(fs.readFileSync(path.join(RADICE, 'src/testi/verifica', f), 'utf8')));
const CORTA = /^(ui\.|atto\.[IVX]+\.nome$|tesi\.[^.]+\.(titolo|elenco\d+)$|T\d+-\d+\.titolo$|pagina\.07$|curva\.)/;

/* ---- che cosa va scritto ---- */
const lavori = [], saltate = [];
for (const [k, a] of prima) {
  const b = dopo.get(k); if (b == null || b === a) continue;
  if (/^carta\./.test(k)) { saltate.push(k + ' (etichetta della carta)'); continue; }
  let nuovo;
  if (finali[k] != null) nuovo = forma(finali[k]);
  else { nuovo = forma(b); if (CORTA.test(k) && nuovo.length > a.length * 1.3 && nuovo.length > a.length + 8) { saltate.push(k + ' (troppo lunga: resta com\'era)'); continue; } }
  const eDato = /^(T\d|atto|curva|evento|itinerario|scheda|tesi)/.test(k);
  const vecchio = eDato ? (ora.has(k) ? ora.get(k) : a) : a;      // per i dati vale la sigla; per pagina e interfaccia le sigle contano le righe e sono slittate: si cerca il testo di prima
  if (forma(nuovo) === forma(vecchio)) continue;
  lavori.push({ k, vecchio, nuovo });
}
for (const k of Object.keys(finali)) if (!prima.has(k)) console.log('sigla sconosciuta nei finali:', k);

/* ---- dove sta ogni scritta ---- */
const fileDi = k => /^tesi\./.test(k) ? 'js/cause.js' : /^pagina\./.test(k) ? 'index.html' : /^ui\.([a-z]+)\./.test(k) ? 'js/' + /^ui\.([a-z]+)\./.exec(k)[1] + '.js' : /^scheda\.[^.]+\.nome$/.test(k) ? 'js/monumenti.js' : 'js/dati.js';
const testi = {}, apri = f => testi[f] ?? (testi[f] = fs.readFileSync(path.join(RADICE, f), 'utf8'));
const tutte = (s, ago) => { const r = []; if (!ago) return r; for (let i = s.indexOf(ago); i >= 0; i = s.indexOf(ago, i + 1)) r.push(i); return r; };
function blocco(k, s) {      // [da, a) dentro cui cercare, quando la scritta compare più volte
  let m, da, a;
  const fra = (inizio, reFine, daDove) => { const i = s.indexOf(inizio, daDove || 0); if (i < 0) return null; reFine.lastIndex = i + inizio.length; const f = reFine.exec(s); return [i, f ? f.index : s.length]; };
  if ((m = /^T(\d+)-\d+\.(titolo|testo|voce|leggenda|storici)/.exec(k))) { const re = /\n \{(?:intermezzo:true, ?)?anno:/g; re.lastIndex = s.indexOf('var TAPPE=['); let q, n = 0, pos = []; while ((q = re.exec(s))) { pos.push(q.index); if (++n > 60) break; } const i = +m[1] - 1; return pos[i] != null ? [pos[i], pos[i + 1] ?? s.indexOf('\n];', pos[i])] : null; }
  if ((m = /^T\d+-(\d+)\.chi/.exec(k))) return fra('\n ' + m[1] + ':[[', /\n \d+:\[\[|\n\};/g, s.indexOf('var PROTAGONISTI={'));
  if ((m = /^T\d+-(\d+)\.luogo/.exec(k))) return fra('\n ' + m[1] + ':[[', /\n \d+:\[\[|\n\};/g, s.indexOf('var LUOGHI_TAPPA={'));
  if ((m = /^scheda\.([^.]+)\.certezza/.exec(k))) return fra('\n  ' + m[1] + ':[', /\n  \w+:\[|\n\};/g, s.indexOf('var CERTEZZA={'));
  if ((m = /^scheda\.([^.]+)\.(cosa|data)/.exec(k))) return fra('\n  ' + m[1] + ':{', /\n  \w+:\{|\n\};/g, s.indexOf('var SCHEDE={'));
  if ((m = /^tesi\.([^.]+)\./.exec(k))) return fra("id:'" + m[1] + "'", /\{id:'/g);
  return null;
}
const aMano = []; let fatti = 0;
for (const l of lavori) {
  const f = fileDi(l.k); let s; try { s = apri(f); } catch { aMano.push({ ...l, motivo: 'file non trovato: ' + f }); continue; }
  const varianti = f === 'index.html' ? [[l.vecchio.replace(/&/g, '&amp;'), x => x.replace(/&/g, '&amp;')]]
    : [[l.vecchio, x => x], [l.vecchio.replace(/'/g, "\\'"), x => x.replace(/'/g, "\\'")], [l.vecchio.replace(/"/g, '\\"'), x => x.replace(/"/g, '\\"')]];
  let trovate = [];
  for (const [ago, codifica] of varianti) for (const i of tutte(s, ago)) {
    if (f !== 'index.html') { const p = s[i - 1], d = s[i + ago.length]; if (!((p === '"' || p === "'") && d === p)) continue; if (ago === l.vecchio && ago.includes(p)) continue; }      // dev'essere la stringa intera, fra le sue virgolette
    if (!trovate.some(t => t.i === i)) trovate.push({ i, ago, codifica });
  }
  if (trovate.length > 1 && !/^ui\./.test(l.k)) { const b = blocco(l.k, s); if (b) trovate = trovate.filter(t => t.i >= b[0] && t.i < b[1]); }
  if (!trovate.length) { aMano.push({ ...l, file: f, motivo: 'non trovata' }); continue; }
  if (trovate.length > 1 && !/^ui\./.test(l.k)) { aMano.push({ ...l, file: f, motivo: 'compare ' + trovate.length + ' volte nel suo blocco' }); continue; }
  for (const t of trovate.sort((x, y) => y.i - x.i)) {      // dall'ultima, così le posizioni restano buone
    const delim = f === 'index.html' ? '' : s[t.i - 1];
    const dentro = f === 'index.html' ? t.codifica(l.nuovo) : l.nuovo.replace(/\\/g, '\\\\').replace(new RegExp(delim, 'g'), '\\' + delim);
    s = s.slice(0, t.i) + dentro + s.slice(t.i + t.ago.length);
  }
  testi[f] = s; fatti++;
}
console.log('sigle cambiate dall\'utente:', [...prima.keys()].filter(k => dopo.get(k) !== prima.get(k)).length, '| con testo finale riletto:', Object.keys(finali).length);
console.log('da scrivere:', lavori.length, '| riportate:', fatti, '| da fare a mano:', aMano.length, '| lasciate com\'erano:', saltate.length);
const perFile = {}; aMano.forEach(x => perFile[x.file || '?'] = (perFile[x.file || '?'] || 0) + 1); console.log('a mano, per file:', perFile);
fs.writeFileSync(path.join(RADICE, 'src/testi/verifica/da-fare-a-mano.json'), JSON.stringify({ aMano, saltate }, null, 1));
fs.writeFileSync(path.join(RADICE, 'src/testi/verifica/attese.json'), JSON.stringify(Object.fromEntries(lavori.map(l => [l.k, l.nuovo])), null, 1));
if (SCRIVI) { for (const f of Object.keys(testi)) fs.writeFileSync(path.join(RADICE, f), testi[f]); console.log('scritti:', Object.keys(testi).join(', ')); }
