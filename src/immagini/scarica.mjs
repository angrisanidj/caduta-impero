// Scarica da Wikimedia Commons le immagini approvate dall'utente il 22 novembre 2026 e scrive js/ritratti.js.
// Uso (dalla radice del progetto o da qui): node src/immagini/scarica.mjs
// Che cosa entra (decisioni dell'utente sull'elenco di protagonisti.md):
//  - i ritratti del tempo e quelli antichi ma posteriori; i casi dubbi entrano con la riserva scritta (RISERVE qui sotto);
//  - gli oggetti del tempo che non mostrano il volto (monete col nome, sigilli, la colonna), dicendo che cosa sono;
//  - le immagini moderne di fantasia NO.
// Le immagini sono miniature larghe 330 punti (una delle misure che Commons serve senza ricalcolo), salvate in img/protagonisti/.
// Chi è già stato scaricato non si riscarica: per rifarne una, cancellare il file. Con --senza-rete non scarica nulla e riscrive solo l'indice
// (Commons limita le richieste: dopo qualche decina risponde 429 per minuti).
// Le didascalie (campo «oggetto») e le riserve vengono dalle descrizioni dei file su Commons, non dalle schede dei musei: la pagina lo dichiara.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url)), RADICE = path.join(QUI, '..', '..');
const CARTELLA = path.join(RADICE, 'img', 'protagonisti'), LARGA = 330;
const UA = { 'User-Agent': 'ricerca-immagini/1.0' };      // nome generico: nessun dato personale nelle richieste

/* (Il 22 novembre 2026 l'utente ha deciso di mettere come «immagine più tarda» anche i papi di cui esistono solo volti di fantasia molto tardi: Raffaello per Leone I e Leone IV, le incisioni del Cavalieri del 1580 per Bonifacio IV, Gregorio II e Sergio II. La riserva lo dice.) */
/* La riga che la pagina scrive sotto l'immagine quando l'identificazione, la data o l'oggetto chiedono una riserva. Chiave: il nome in PROTAGONISTI. */
const RISERVE = {
  'Eraclio': 'Eraclio è il barbuto a sinistra; accanto a lui il figlio Eraclio Costantino.',
  'Ludovico il Germanico': 'Il sigillo è del suo tempo, ma la testa al centro è all’antica: probabilmente una gemma romana riusata, non il suo volto.',
  'Decio': 'L’identificazione si fonda sul confronto con le monete.',
  'Massenzio': 'Senza iscrizione: l’identificazione viene dal confronto con le monete.',
  'Valentiniano II': 'La scritta è uguale per Valentiniano I e II: l’attribuzione è del catalogo.',
  'Ambrogio': 'Qualche decennio dopo la morte: il più antico ritratto noto.',
  'Simmaco': 'Un avorio fatto per la sua famiglia verso il 400: non è un ritratto.',
  'Virio Nicomaco Flaviano': 'Un avorio fatto per la sua famiglia verso il 400: non è un ritratto.',
  'Shapur I': 'Quale imperatore sia quello in ginocchio è discusso.',
  'Diocleziano': 'Senza iscrizione: la testa gli è attribuita.',
  'Massimiano': 'Identificazione proposta dal museo, non certa.',
  'Costantino': 'Senza iscrizione: l’identificazione con Costantino è la più diffusa.',
  'Lattanzio': 'Un manoscritto della sua opera, di undici secoli dopo.',
  'Silvestro I': 'Circa otto secoli dopo: non è un ritratto dal vero.',
  'Costanzo II': 'L’imperatore del piatto è di solito identificato con lui; il nome non c’è.',
  'Arcadio e Onorio': 'La testa è attribuita ad Arcadio, senza iscrizione.',
  'Stilicone': 'Il dittico non ha iscrizione: l’identificazione è accettata dai più, non certa.',
  'Genserico': 'I Vandali coniavano col busto dell’imperatore, non del loro re.',
  'Bonifacio': 'Il busto è dell’imperatore; l’attribuzione della moneta a Bonifacio è di un catalogo d’asta.',
  'Agostino': 'La più antica immagine nota, circa un secolo dopo la morte: un ritratto ideale.',
  'Ezio': 'Che sia Ezio è la proposta di uno storico moderno, senza conferme: il sarcofago è detto «di Stilicone».',
  'Ricimero': 'Il busto è dell’imperatore Libio Severo; di Ricimero c’è il monogramma sul rovescio.',
  'Basilisco': 'Coniata quando si fece imperatore, sette anni dopo la spedizione.',
  'Cassiodoro': 'Quasi sette secoli dopo: non è un ritratto dal vero.',
  'Boezio': 'Quasi mille anni dopo: non è un ritratto dal vero.',
  'Amalasunta': 'I due medaglioni sono letti come Atalarico e Amalasunta; i nomi non sono scritti.',
  'Belisario': 'L’identificazione con Belisario è tradizionale: nel mosaico il nome non c’è.',
  'Ammiano Marcellino': 'Nessun ritratto: una pagina del più antico manoscritto della sua opera, di quasi cinque secoli dopo.',
  'Narsete': 'Che sia Narsete è una proposta senza conferme: nel mosaico il nome non c’è.',
  'Vitige': 'Il volto è dell’imperatore Giustiniano; l’attribuzione al regno di Vitige è del catalogo d’asta.',
  'Totila': 'Il busto è stilizzato.',
  'Gregorio Magno': 'Circa quattro secoli dopo: non è un ritratto dal vero.',
  'Agilulfo': 'Porta il nome del re; la foto è di una copia (l’originale è al Bargello).',
  'Smaragdo': 'La sua dedica sta sulla base della colonna, che nella foto non si vede.',
  'Vitaliano': 'Il sigillo è del tempo; l’immagine è un’incisione del 1760.',
  'Liutprando': 'Il busto sulla moneta è stilizzato.',
  'Astolfo': 'Il busto sulla moneta è stilizzato.',
  'Desiderio': 'Senza volto: il nome del re attorno a una croce o a una stella.',
  'Stefano II': 'Circa tre secoli e mezzo dopo: non è un ritratto dal vero.',
  'Pipino il Breve': 'Tre secoli e mezzo dopo; i suoi denari, del tempo, non hanno volto.',
  '455|Leone I': 'Dipinto da Raffaello nel 1514, più di mille anni dopo: non è un ritratto dal vero.',
  'Rodrigo': 'Disegno ottocentesco di una moneta col suo nome; il busto è schematico, non un ritratto.',
  'Leone IV': 'Dipinto da Raffaello e dalla sua bottega nel 1514, quasi sette secoli dopo: non è un ritratto dal vero.',
  'Clodoveo': 'Il volto è dell’imperatore Anastasio; l’attribuzione al regno di Clodoveo è del catalogo d’asta.',
  'Alarico II': 'È un sigillo con il suo nome: un’immagine ufficiale, non per forza somigliante.',
  'Remigio': 'Circa tre secoli e mezzo dopo, ed è la scena del battesimo: non è un ritratto dal vero.',
  'Teia': 'Il volto è di un imperatore; del re c’è il nome sul rovescio.',
  'Agostino di Canterbury': 'Più di sette secoli dopo: non è un ritratto dal vero.',
  'Etelberto': 'Più di otto secoli dopo, e molto restaurata: non è un ritratto dal vero.',
  'Bonifacio IV': 'Incisione del 1580, quasi mille anni dopo: il volto è di fantasia.',
  'Gregorio II': 'Incisione del 1580, otto secoli e mezzo dopo: il volto è di fantasia.',
  'Sergio II': 'Incisione del 1580, più di sette secoli dopo: il volto è di fantasia.',
  'Leone III': 'Il mosaico che si vede è il rifacimento del 1743 dell’originale perduto.'
};

const pausa = ms => new Promise(r => setTimeout(r, ms));
const sigla = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* misure di un JPEG o di un PNG, lette dall'intestazione */
function misure(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [0, 0];
}
async function prendi(file) {
  const u = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file.replace(/ /g, '_')) + '?width=' + LARGA;
  for (let giro = 0; giro < 3; giro++) {
    const r = await fetch(u, { headers: UA, redirect: 'follow' });
    if (r.status === 429 || r.status >= 500) { const s = Math.min(90, +(r.headers.get('retry-after') || 0) || 10 * (giro + 1)); console.log('   ', r.status, 'aspetto', s, 's'); await pausa(s * 1000); continue; }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const tipo = r.headers.get('content-type') || '', est = /png/.test(tipo) ? 'png' : /jpe?g/.test(tipo) ? 'jpg' : null;
    if (!est) throw new Error('tipo inatteso: ' + tipo);
    return { est, dati: Buffer.from(await r.arrayBuffer()) };
  }
  throw new Error('troppi tentativi');
}

const elenco = JSON.parse(fs.readFileSync(path.join(QUI, 'protagonisti.json'), 'utf8'));
fs.mkdirSync(CARTELLA, { recursive: true });
const perFile = {}, indice = {}, falliti = [];
/* due persone con lo stesso nome e immagini diverse (Leone I papa nel 455 e Leone I imperatore nel 468): il file prende anche l'anno, o il secondo userebbe l'immagine del primo */
const fileDelNome = {}; for (const x of elenco) if (x.file && x.coevo !== 'fantasia') (fileDelNome[x.nome] ??= new Set()).add(x.file);
for (const x of elenco) {
  if (!x.file || x.coevo === 'fantasia') continue;
  if (x.licenzaAccettabile === false) { falliti.push(x.nome + ': licenza non accettabile'); continue; }
  let q = perFile[x.file];
  if (!q) {
    const base = sigla(x.nome) + (fileDelNome[x.nome].size > 1 ? '-' + x.anno : ''), gia = ['jpg', 'png'].map(e => path.join(CARTELLA, base + '.' + e)).find(p => fs.existsSync(p));
    try {
      let dati, nome;
      if (gia) { dati = fs.readFileSync(gia); nome = path.basename(gia); }
      else if (process.argv.includes('--senza-rete')) throw new Error('non scaricato (--senza-rete)');
      else { const r = await prendi(x.file); dati = r.dati; nome = base + '.' + r.est; fs.writeFileSync(path.join(CARTELLA, nome), dati); console.log('scaricato', nome, Math.round(dati.length / 1024) + ' kB'); await pausa(1500); }
      const [w, h] = misure(dati);
      q = perFile[x.file] = { f: 'img/protagonisti/' + nome, w, h };
    } catch (e) { falliti.push(x.nome + ': ' + e.message); console.log('NON scaricato', x.nome, e.message); continue; }
  }
  const v = { f: q.f, w: q.w, h: q.h, cosa: x.oggetto, tipo: x.ritratto === false ? 'oggetto' : x.coevo === 'si' ? 'coevo' : 'posteriore', credito: x.credito, pagina: x.pagina, licenza: x.licenza };
  if (x.licenzaUrl) v.licenzaUrl = x.licenzaUrl;
  const ris = RISERVE[x.anno + '|' + x.nome] ?? RISERVE[x.nome]; if (ris) v.riserva = ris;      // «anno|nome» quando due persone hanno lo stesso nome (Leone I papa e Leone I imperatore)
  indice[x.anno + '|' + x.nome] = v;
}
/* Ritratti ricostruiti (chiesti dall'utente il 23 novembre 2026 per chi non ha nessuna immagine): generati con un modello di immagini dalle schede delle fonti
   di src/immagini/ricostruzioni.md, guardati uno per uno e messi a mano in img/protagonisti/ric-<nome>.jpg. In pagina: tipo «ricostruzione», il volto è dichiarato immaginario. */
const RICOSTRUZIONI = {
  'Cniva': 'capo goto della metà del III secolo: veste e mantello di lana secondo i Goti del sarcofago Grande Ludovisi',
  'Cipriano': 'vescovo di Cartagine verso il 250: dalmatica, tunica di lino e mantello secondo la Vita di Ponzio e gli Atti del suo martirio',
  'Ormisda': 'principe persiano in esilio: veste e berretto secondo le monete e i rilievi sasanidi del IV secolo; l\'abito persiano è una scelta, dopo anni a corte poteva vestire alla romana',
  'Fritigerno': 'capo goto nel 378: capelli, mantello e fibula secondo le fonti sui Goti e i corredi del IV secolo',
  'Arbogaste': 'generale franco dell\'esercito romano: tunica, cintura militare e mantello con fibula a balestra come nel missorio di Teodosio e nel dittico di Stilicone',
  'Alarico': 're dei Goti e generale romano: abito da ufficiale romano del suo tempo, capelli alla gotica secondo Sinesio e Sidonio',
  'Vallia': 're visigoto nel 418: abito sobrio secondo le fonti sui Goti del V secolo',
  'Teodorico I': 're visigoto, anziano nel 451 (Giordane: «maturae senectutis»): abito e acconciatura secondo Sidonio, che descrive suo figlio',
  'Procopio': 'storico e consigliere a Costantinopoli: abiti di corte come nei mosaici di San Vitale',
  'Alboino': 're longobardo: acconciatura e vesti come le descrive Paolo Diacono (IV 22); «statura procerus» (II 28)',
  'Tariq ibn Ziyad': 'comandante berbero nel 711: abiti dei Berberi del tempo; le fonti non lo descrivono',
  'Musa ibn Nusayr': 'governatore arabo dell\'Africa, anziano nel 711: abiti arabi omayyadi; le fonti non lo descrivono',
  'Ine': 're del Wessex in partenza per Roma: abito da viaggio secondo i corredi anglosassoni intorno al 700',
  'Siagrio': 'generale romano in Gallia nel 486, figlio di un magister militum: abito da ufficiale tardoromano; viso rasato all’uso degli aristocratici romani del tempo (ipotesi)',
  'Attila': 're degli Unni nel 451: i tratti sono quelli della descrizione di Giordane (Getica 182), scritta un secolo dopo; l’abito semplice, senza oro, viene da Prisco, che lo vide nel 449; l’età, circa 45 anni, è una scelta',
};
for (const x of elenco) {
  const cosa = RICOSTRUZIONI[x.nome], chiave = x.anno + '|' + x.nome; if (!cosa || indice[chiave]) continue;
  const nome = 'ric-' + sigla(x.nome) + '.jpg', p = path.join(CARTELLA, nome); if (!fs.existsSync(p)) { console.log('ricostruzione non ancora fatta:', x.nome); continue; }
  const [w, h] = misure(fs.readFileSync(p));
  indice[chiave] = { f: 'img/protagonisti/' + nome, w, h, cosa: 'ricostruzione: ' + cosa, tipo: 'ricostruzione', credito: 'Generata per questa pagina con il modello Seedream 5 Pro (ElevenLabs), ' + (x.nome === 'Attila' ? '24' : '23') + ' novembre 2026', pagina: 'https://github.com/angrisanidj/caduta-impero/blob/main/src/immagini/ricostruzioni.md', licenza: 'CC BY-SA 4.0' };
}
for (const n of Object.keys(RISERVE)) if (!elenco.some(x => x.nome === n && x.file)) console.log('riserva senza immagine:', n);
fs.writeFileSync(path.join(RADICE, 'js', 'ritratti.js'),
  '/* Generato da src/immagini/scarica.mjs: non modificare a mano. Chiave: «anno della tappa|nome» come in PROTAGONISTI (js/dati.js).\n' +
  '   tipo: coevo (ritratto del tempo), posteriore (immagine antica ma più tarda), oggetto (del tempo, ma non mostra il volto). */\n' +
  'window.RM_RITRATTI=' + JSON.stringify(indice) + ';\n');
const pesi = fs.readdirSync(CARTELLA).reduce((s, f) => s + fs.statSync(path.join(CARTELLA, f)).size, 0);
console.log(Object.keys(indice).length, 'voci,', Object.keys(perFile).length, 'file,', Math.round(pesi / 1024), 'kB in img/protagonisti');
if (falliti.length) console.log('DA RIVEDERE:\n ' + falliti.join('\n '));
