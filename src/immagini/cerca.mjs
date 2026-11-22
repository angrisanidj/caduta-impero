// Ricerca delle immagini dei protagonisti su Wikimedia Commons (nessun file immagine viene scaricato:
// solo il JSON delle API). Uso, dalla cartella src/immagini:
//   node cerca.mjs entita      → grezzi/entita.json   (voce di en.wikipedia → Wikidata: P18, P569, P570, P373)
//   node cerca.mjs categorie   → grezzi/categorie.json (sottocategorie e file della categoria Commons)
//   node cerca.mjs cerca "testo" [n]  → ricerca libera fra i file di Commons (stampa i titoli)
//   node cerca.mjs info        → legge scelte.mjs, chiede licenza e autore dei file scelti,
//                                scrive protagonisti.json e protagonisti.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const GREZZI = path.join(QUI, 'grezzi');
fs.mkdirSync(GREZZI, { recursive: true });
const UA = { 'User-Agent': 'ricerca-immagini/1.0' };
const pausa = ms => new Promise(r => setTimeout(r, ms));

async function api(base, par) {
  const u = new URL(base);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...par })) u.searchParams.set(k, v);
  for (let prova = 0; prova < 6; prova++) {
    const r = await fetch(u, { headers: UA });
    if (r.ok) { await pausa(1500); return r.json(); }
    const dopo = Number(r.headers.get('retry-after')) || 10 * (prova + 1);   // il limite dei server Wikimedia: si aspetta quanto chiedono
    console.error(`  ${r.status}, attendo ${dopo + 2} s`);
    await pausa((dopo + 2) * 1000);
  }
  throw new Error('richiesta fallita: ' + u);
}
const WP = 'https://en.wikipedia.org/w/api.php';
const WD = 'https://www.wikidata.org/w/api.php';
const CO = 'https://commons.wikimedia.org/w/api.php';

// I protagonisti della tabella di js/dati.js
export function protagonisti() {
  const src = fs.readFileSync(path.join(QUI, '../../js/dati.js'), 'utf8');
  const i = src.indexOf('var PROTAGONISTI=');
  const j = src.indexOf('\n};', i);
  const P = Function('return ' + src.slice(i + 'var PROTAGONISTI='.length, j + 3))();
  const out = [];
  for (const anno of Object.keys(P).map(Number).sort((a, b) => a - b))
    for (const [nome, date, riga] of P[anno]) out.push({ anno, nome, date, riga });
  return out;
}

// Chiave della persona per nome in tabella (eccezioni per anno|nome); due chiavi per le righe doppie
const OMONIMI = { '468|Leone I': 'leone1imp' };
export const PERSONE = {
  'Severo Alessandro': ['Severus Alexander'], 'Giulia Mamea': ['Julia Avita Mamaea'], 'Massimino il Trace': ['Maximinus Thrax'],
  'Decio': ['Decius'], 'Cniva': ['Cniva'], 'Cipriano': ['Cyprian'],
  'Valeriano': ['Valerian (emperor)'], 'Shapur I': ['Shapur I'], 'Postumo': ['Postumus'],
  'Aureliano': ['Aurelian'], 'Zenobia': ['Zenobia'], 'Tetrico': ['Tetricus I'],
  'Diocleziano': ['Diocletian'], 'Massimiano': ['Maximian'], 'Costanzo Cloro e Galerio': ['Constantius Chlorus', 'Galerius'],
  'Lattanzio': ['Lactantius'], 'Costantino': ['Constantine the Great'], 'Silvestro I': ['Pope Sylvester I'],
  'Costanzo II': ['Constantius II'], 'Ammiano Marcellino': ['Ammianus Marcellinus'], 'Ormisda': ['Hormizd (son of Hormizd II)'],
  'Valente': ['Valens'], 'Fritigerno': ['Fritigern'], 'Graziano': ['Gratian'],
  'Teodosio I': ['Theodosius I'], 'Arcadio e Onorio': ['Arcadius', 'Honorius (emperor)'], 'Stilicone': ['Stilicho'],
  'Alarico': ['Alaric I'], 'Onorio': ['Honorius (emperor)'], 'Costantino III': ['Constantine III (Western Roman emperor)'],
  'Galla Placidia': ['Galla Placidia'], 'Vallia': ['Wallia'], 'Teodorico I': ['Theodoric I'], 'Flavio Costanzo': ['Constantius III'],
  'Genserico': ['Genseric'], 'Bonifacio': ['Bonifacius'], 'Agostino': ['Augustine of Hippo'],
  'Valentiniano III': ['Valentinian III'], 'Ezio': ['Flavius Aetius'], 'Attila': ['Attila'], 'Leone I': ['Pope Leo I'],
  'leone1imp': ['Leo I (emperor)'], 'Maggioriano': ['Majorian'], 'Ricimero': ['Ricimer'], 'Antemio': ['Anthemius'],
  'Basilisco': ['Basiliscus'], 'Olibrio': ['Olybrius'], 'Odoacre': ['Odoacer'], 'Romolo Augustolo': ['Romulus Augustulus'],
  'Giulio Nepote': ['Julius Nepos'], 'Teodorico': ['Theodoric the Great'], 'Cassiodoro': ['Cassiodorus'],
  'Boezio': ['Boethius'], 'Amalasunta': ['Amalasuntha'], 'Giustiniano': ['Justinian I'], 'Belisario': ['Belisarius'],
  'Vitige': ['Witiges'], 'Procopio': ['Procopius'], 'Totila': ['Totila'], 'Narsete': ['Narses'], 'Alboino': ['Alboin'],
  'Giustino II': ['Justin II'], 'Pelagio II': ['Pope Pelagius II'], 'Gregorio Magno': ['Pope Gregory I'], 'Agilulfo': ['Agilulf'],
  'Foca': ['Phocas'], 'Bonifacio IV': ['Pope Boniface IV'], 'Smaragdo': ['Smaragdus (exarch)'], 'Costante II': ['Constans II'],
  'Vitaliano': ['Pope Vitalian'], 'Tariq ibn Ziyad': ['Tariq ibn Ziyad'], 'Musa ibn Nusayr': ['Musa ibn Nusayr'],
  'Rodrigo': ['Roderic'], 'Ine': ['Ine of Wessex'], 'Gregorio II': ['Pope Gregory II'],
  'Liutprando': ['Liutprand, King of the Lombards'], 'Astolfo': ['Aistulf'], 'Stefano II': ['Pope Stephen II'],
  'Pipino il Breve': ['Pepin the Short'], 'Adriano I': ['Pope Adrian I'], 'Carlo Magno': ['Charlemagne'],
  'Desiderio': ['Desiderius'], 'Leone III': ['Pope Leo III'], 'Irene': ['Irene of Athens'], 'Sergio II': ['Pope Sergius II'],
  'Lotario I': ['Lothair I'], 'Leone IV': ['Pope Leo IV'],
};
export const chiave = p => OMONIMI[p.anno + '|' + p.nome] || p.nome;

const val = (cl, p) => (cl[p] || []).map(c => c.mainsnak.datavalue?.value).filter(Boolean);

async function entita() {
  const titoli = [...new Set(Object.values(PERSONE).flat())];
  const qid = {};
  for (let i = 0; i < titoli.length; i += 40) {
    const r = await api(WP, { action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: '1', titles: titoli.slice(i, i + 40).join('|') });
    const mappa = {};
    for (const n of r.query.normalized || []) mappa[n.to] = n.from;
    for (const n of r.query.redirects || []) mappa[n.to] = mappa[n.from] || n.from;
    for (const pg of r.query.pages) qid[mappa[pg.title] || pg.title] = pg.pageprops?.wikibase_item || null;
  }
  Object.assign(qid, { 'Smaragdus (exarch)': 'Q1340553' });   // senza voce su en.wikipedia: da wbsearchentities («exarch of Ravenna»)
  const ids = [...new Set(Object.values(qid).filter(Boolean))];
  const dati = {};
  for (let i = 0; i < ids.length; i += 40) {
    const r = await api(WD, { action: 'wbgetentities', ids: ids.slice(i, i + 40).join('|'), props: 'claims|labels|descriptions', languages: 'it|en' });
    for (const [id, e] of Object.entries(r.entities)) {
      const cl = e.claims || {};
      dati[id] = {
        it: e.labels?.it?.value, en: e.labels?.en?.value, desc: e.descriptions?.it?.value || e.descriptions?.en?.value,
        p18: val(cl, 'P18'), nato: val(cl, 'P569').map(v => v.time), morto: val(cl, 'P570').map(v => v.time), cat: val(cl, 'P373'),
      };
    }
  }
  const out = {};
  for (const t of titoli) out[t] = { qid: qid[t], ...(dati[qid[t]] || {}) };
  fs.writeFileSync(path.join(GREZZI, 'entita.json'), JSON.stringify(out, null, 1));
  for (const [t, e] of Object.entries(out))
    console.log([t, e.qid, e.it, (e.nato || [])[0]?.slice(0, 5), (e.morto || [])[0]?.slice(0, 5), e.p18?.[0] || '-', e.cat?.[0] || '-'].join(' | '));
}

const FILTRO = /coin|aureus|solidus|denar|antonin|follis|tremiss|siliqua|semissis|nummus|medall|bust|head|statue|portrait|mosaic|diptych|seal|bulla|relief|cameo|fresco|miniat|manuscript|cod\.|codex|ritratto|moneta|busto|testa|mosaico|sarcoph|tomb|inscription|monogram|ring|missorium|carved|gem|plate/i;
async function categorie() {
  const ent = JSON.parse(fs.readFileSync(path.join(GREZZI, 'entita.json'), 'utf8'));
  const dove = path.join(GREZZI, 'categorie.json');
  const out = fs.existsSync(dove) ? JSON.parse(fs.readFileSync(dove, 'utf8')) : {};   // si riprende da dove ci si era fermati
  for (const [t, e] of Object.entries(ent)) {
    const cat = e.cat?.[0];
    if (t in out) continue;
    if (!cat) { out[t] = null; continue; }
    fs.writeFileSync(dove, JSON.stringify(out, null, 1));
    const r = await api(CO, { action: 'query', list: 'categorymembers', cmtitle: 'Category:' + cat, cmtype: 'subcat|file', cmlimit: '500' });
    const m = (r.query?.categorymembers || []).map(x => x.title);
    out[t] = { cat, sotto: m.filter(x => x.startsWith('Category:')).map(x => x.slice(9)), file: m.filter(x => x.startsWith('File:')).map(x => x.slice(5)) };
  }
  fs.writeFileSync(path.join(GREZZI, 'categorie.json'), JSON.stringify(out, null, 1));
  for (const [t, c] of Object.entries(out)) {
    if (!c) { console.log('## ' + t + ': nessuna categoria'); continue; }
    const f = c.file.filter(x => FILTRO.test(x));
    console.log(`## ${t} [${c.cat}] file ${c.file.length}\n  S: ${c.sotto.join(' ; ')}\n  F: ${f.slice(0, 25).join(' ; ')}`);
  }
}

async function sottocat(nome, filtro) {
  const r = await api(CO, { action: 'query', list: 'categorymembers', cmtitle: 'Category:' + nome, cmtype: 'subcat|file', cmlimit: '500' });
  const re = filtro ? new RegExp(filtro, 'i') : null;
  for (const x of r.query?.categorymembers || []) if (!re || re.test(x.title)) console.log(x.title);
}

async function cerca(testo, n = 15) {
  const r = await api(CO, { action: 'query', list: 'search', srsearch: testo, srnamespace: '6', srlimit: String(n) });
  for (const x of r.query.search) console.log(x.title.slice(5));
}

// Licenza, autore e descrizione dei file scelti
const pulisci = s => (s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const LIBERE = /^(public domain|pd|cc0|cc by(-sa)?( \d\.\d)?|cc-by(-sa)?-\d\.\d|attribution|cc by-sa \d\.\d [a-z]+)/i;
async function info() {
  const { SCELTE } = await import('./scelte.mjs?' + Date.now());
  const titoli = [...new Set(Object.values(SCELTE).flatMap(s => [s.file, ...(s.alt || []).map(a => a.file)]).filter(Boolean))];
  const ii = fs.existsSync(path.join(GREZZI, 'info.json')) ? JSON.parse(fs.readFileSync(path.join(GREZZI, 'info.json'), 'utf8')) : {};
  const mancano = titoli.filter(t => !ii[t]);
  for (let i = 0; i < mancano.length; i += 25) {
    const r = await api(CO, { action: 'query', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiextmetadatalanguage: 'it', titles: mancano.slice(i, i + 25).map(t => 'File:' + t).join('|') });
    const norm = {};
    for (const n of r.query.normalized || []) norm[n.to] = n.from;
    for (const pg of r.query.pages) {
      const nome = (norm[pg.title] || pg.title).slice(5);
      const x = pg.imageinfo?.[0];
      if (!x) { ii[nome] = { manca: true }; continue; }
      const m = x.extmetadata || {};
      ii[nome] = {
        pagina: x.descriptionurl, url: x.url, larghezza: x.width, altezza: x.height,
        licenza: pulisci(m.LicenseShortName?.value), licenzaUrl: m.LicenseUrl?.value || null,
        autore: pulisci(m.Artist?.value), credito: pulisci(m.Credit?.value), descrizione: pulisci(m.ImageDescription?.value).slice(0, 400),
        data: pulisci(m.DateTimeOriginal?.value), restrizioni: pulisci(m.Restrictions?.value),
      };
    }
  }
  fs.writeFileSync(path.join(GREZZI, 'info.json'), JSON.stringify(ii, null, 1));
  const ent = JSON.parse(fs.readFileSync(path.join(GREZZI, 'entita.json'), 'utf8'));
  const accorcia = (s, n) => s && s.length > n ? s.slice(0, n - 1) + '…' : s;
  const pulisciAutore = a => !a ? null : /^(sconosciuto|anonimo)?(unknown|anonymous)/i.test(a) || /^(sconosciuto|anonimo)unknown/i.test(a) ? 'autore sconosciuto' : a.replace(/^(Sconosciuto|Anonimo)(Unknown)/, '$2');
  const creditoDi = (x, autore) => {
    const a = accorcia(pulisciAutore(autore) || 'autore non indicato', 80);
    const lic = x.licenza === 'Attribution' ? 'licenza libera con attribuzione' : x.licenza === 'Public domain' ? 'pubblico dominio' : x.licenza || 'licenza da verificare';
    return `${x.licenza === 'Public domain' ? 'Immagine' : 'Foto'}: ${a}, ${lic}, da Wikimedia Commons`;
  };
  const righe = [];
  for (const p of protagonisti()) {
    const k = chiave(p);
    const s = SCELTE[k] || {};
    const q = (PERSONE[k] || []).map(t => ent[t]?.qid).filter(Boolean);
    const x = s.file ? ii[s.file] || {} : {};
    const libera = s.file ? LIBERE.test(x.licenza || '') : null;
    const alt = (s.alt || []).map(a => ({ ...a, ...(({ pagina, url, licenza, autore, credito }) => ({ pagina, url, licenza, autore: a.autore || pulisciAutore(autore) || credito || null }))(ii[a.file] || {}) }));
    righe.push({
      anno: p.anno, nome: p.nome, wikidata: q.join(' + ') || null,
      file: s.file || null, pagina: x.pagina || null, url: x.url || null, larghezza: x.larghezza || null, altezza: x.altezza || null,
      oggetto: s.oggetto || null, coevo: s.coevo || 'nessuno', ritratto: s.file ? s.ritratto !== false : null,
      licenza: x.licenza || null, licenzaUrl: x.licenzaUrl || null, autore: s.autore || pulisciAutore(x.autore) || null,
      credito: s.file ? (s.credito || creditoDi(x, s.autore || x.autore)) : null,
      licenzaAccettabile: libera, verificato: s.verificato !== false,
      nota: [s.nota, s.file && x.manca ? 'FILE NON TROVATO su Commons' : null, s.file && !libera ? 'LICENZA DA CONTROLLARE: ' + (x.licenza || 'assente') : null].filter(Boolean).join(' ') || null,
      alternative: alt.length ? alt : undefined,
    });
  }
  fs.writeFileSync(path.join(QUI, 'protagonisti.json'), JSON.stringify(righe, null, 1));
  scriviMd(righe);
  const c = {}; for (const r of righe) c[r.coevo] = (c[r.coevo] || 0) + 1;
  for (const p of protagonisti()) if (!SCELTE[chiave(p)]) console.log('SENZA SCELTA:', p.anno, p.nome);
  if (process.argv.includes('--rivedi')) for (const [t, x] of Object.entries(ii)) if (titoli.includes(t)) console.log(`# ${t}
  ${x.manca ? 'MANCA' : x.licenza + ' | ' + (x.autore || '').slice(0, 60) + ' | ' + (x.data || '').slice(0, 30) + ' | ' + (x.descrizione || '').slice(0, 160)}`);
  console.log(righe.length, c, 'licenze da controllare:', righe.filter(r => r.file && !r.licenzaAccettabile).map(r => r.nome + ' ' + r.licenza));
}

function scriviMd(righe) {
  const { INTESTAZIONE = '' } = globalThis.__md || {};
  const ETI = { si: 'ritratto coevo', posteriore: 'ritratto posteriore', fantasia: 'di fantasia', oggetto: 'oggetto del tempo, senza volto', nessuno: 'nessuna immagine' };
  const cat = r => r.file && r.ritratto === false ? 'oggetto' : r.coevo;
  const c = {}; for (const r of righe) c[cat(r)] = (c[cat(r)] || 0) + 1;
  const persone = new Map(); for (const r of righe) if (!persone.has(r.nome + r.wikidata)) persone.set(r.nome + r.wikidata, r);
  const cp = {}; for (const r of persone.values()) cp[cat(r)] = (cp[cat(r)] || 0) + 1;
  let md = `# Immagini dei protagonisti (Wikimedia Commons)\n\nGenerato da \`node cerca.mjs info\` (scelte a mano in \`scelte.mjs\`; licenze e autori letti dai metadati dei file). Nessuna immagine è stata scaricata.\n\n`;
  md += `## Conteggi\n\nRighe della tabella: ${righe.length} (persone distinte: ${persone.size}).\n\n| | righe | persone |\n|---|---|---|\n`;
  for (const k of ['si', 'posteriore', 'fantasia', 'oggetto', 'nessuno']) md += `| ${ETI[k]} | ${c[k] || 0} | ${cp[k] || 0} |\n`;
  md += '\n' + (globalThis.__dubbi || '') + '\n## Per tappa\n';
  let anno = null;
  for (const r of righe) {
    if (r.anno !== anno) { anno = r.anno; md += `\n### ${anno}\n\n`; }
    const wd = r.wikidata ? r.wikidata.split(' + ').map(q => `[${q}](https://www.wikidata.org/wiki/${q})`).join(' + ') : '-';
    if (!r.file) { md += `- **${r.nome}** (${wd}) — *${ETI[cat(r)]}*. ${r.nota || ''}\n`; continue; }
    md += `- **${r.nome}** (${wd}) — *${ETI[cat(r)]}*: ${r.oggetto}. [${r.file}](${r.pagina}) — ${r.larghezza}×${r.altezza}, ${r.licenza}; «${r.credito}».${r.nota ? ' ' + r.nota : ''}\n`;
    for (const a of r.alternative || []) md += `  - in alternativa: ${a.oggetto || ''} [${a.file}](${a.pagina}) — ${a.licenza}, ${(a.autore || '').slice(0, 80)}${a.nota ? '. ' + a.nota : ''}\n`;
  }
  fs.writeFileSync(path.join(QUI, 'protagonisti.md'), md);
}

// Un elenco di richieste, una per riga: «sotto|Categoria|filtro» oppure «cerca|testo»; risultati in coda a un file
async function esplora(elenco, uscita) {
  for (const riga of fs.readFileSync(elenco, 'utf8').split('\n').map(s => s.trim()).filter(Boolean)) {
    const [tipo, a, ...resto] = riga.split('|');
    const b = resto.join('|');
    let titoli = [];
    if (tipo === 'sotto') {
      const r = await api(CO, { action: 'query', list: 'categorymembers', cmtitle: 'Category:' + a, cmtype: 'subcat|file', cmlimit: '500' });
      const re = b ? new RegExp(b, 'i') : null;
      titoli = (r.query?.categorymembers || []).map(x => x.title).filter(t => !re || re.test(t));
    } else {
      const r = await api(CO, { action: 'query', list: 'search', srsearch: a, srnamespace: '6|14', srlimit: '12' });
      titoli = r.query.search.map(x => x.title);
    }
    const n = titoli.length;
    fs.appendFileSync(uscita, `## ${riga} (${n})\n  ${titoli.slice(0, 30).map(t => t.replace(/^File:/, '')).join(' ; ')}\n`);
  }
}

const [cmd, ...arg] = process.argv.slice(2);
if (cmd === 'esplora') await esplora(arg[0], arg[1]);
if (cmd === 'entita') await entita();
else if (cmd === 'categorie') await categorie();
else if (cmd === 'sotto') await sottocat(arg[0], arg[1]);
else if (cmd === 'cerca') await cerca(arg[0], arg[1]);
else if (cmd === 'info') { try { globalThis.__dubbi = fs.readFileSync(path.join(QUI, 'dubbi.md'), 'utf8'); } catch {} await info(); }
