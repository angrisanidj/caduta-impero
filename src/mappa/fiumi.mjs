/* I corsi veri dei fiumi, da Natural Earth 1:10m (dominio pubblico). Uso, da questa cartella:
     1. scaricare in grezzi/fiumi/ (la cartella non sta nel repository) i due file
        https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson
        https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_europe.geojson
     2. node fiumi.mjs      (sceglie i fiumi per nome, li ritaglia sul riquadro della carta, li sfoltisce e scrive grezzi/fiumi-scelti.json, che sta nel repository)
     3. node genera.mjs     (li proietta e li mette in js/mappa-dati.js)
   Reno e Danubio, con i loro rami, sono «forti»: erano il confine dell'impero. */
import fs from 'fs';

const RIQUADRO = [-11.5, 27.5, 39.5, 57];                // ovest, sud, est, nord: un grado oltre la carta
const FORTI = /^(Danube|Donau|Borcea|Bratul|Rhein|Rhin|Rhine|Waal|Lek|Nederrijn)/;
const GRANDI = /^(Nile|Damietta|Rosetta|Al Furat|Firat|Dnepre|Dnipro|IJssel|Oder|Seine|Ebro|Elbe|Loire|Tajo|Tejo|Vistula|Dniester|Don|Duero|Garonne|Jordan|Po|Rh.?ne|Thames|Tisa|Drau|Evros|Guadiana|Kiz.*|Morava|Mosel|Prut|Sava|Tevere|Weser|Adige|Dordogne|Drina|Ems|Guadalquivir|Haliacmon|Inn|Maas|Main|Mures|Olt|Sakarya|Sa.?ne|Schelde|Severn|Southern Bug|Ticino|Trent|Marne|Durance|Minho|Mi.?o|Vltava|B.*Menderes|Ceyhan|Strym.*|Oued Sebou|Moulouya|Oum Er Rbia|Ofanto|Mur|Mincio)$/;
const MINORI = /^(Arno|Aare|Adda|Isar|Enns|Neckar|Lippe|Saale|Maritsa|Volturno|Piave|Allier|Neretva|Siret|Segura|Júcar|Lot|Charente|Somme|Adour|Salzach|Reno|Tanaro|Oglio)$/;

const leggi = f => JSON.parse(fs.readFileSync(new URL('./grezzi/fiumi/' + f, import.meta.url), 'utf8')).features;
const linee = g => !g ? [] : g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
const dentro = p => p[0] > RIQUADRO[0] && p[0] < RIQUADRO[2] && p[1] > RIQUADRO[1] && p[1] < RIQUADRO[3];

/* sfoltimento di Douglas-Peucker, in gradi */
function sfoltisci(P, tol) {
  if (P.length < 3) return P;
  const tieni = new Uint8Array(P.length); tieni[0] = tieni[P.length - 1] = 1; const pila = [[0, P.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop(); let max = 0, k = -1; const ax = P[a][0], ay = P[a][1], dx = P[b][0] - ax, dy = P[b][1] - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((P[i][0] - ax) * dy - (P[i][1] - ay) * dx) / L; if (d > max) { max = d; k = i; } }
    if (max > tol) { tieni[k] = 1; pila.push([a, k], [k, b]); }
  }
  return P.filter((_, i) => tieni[i]);
}

const scelti = { forti: [], altri: [] }, nomi = new Set();
function prendi(features, regola, forti) {
  for (const f of features) {
    const n = (f.properties.name || f.properties.name_en || '').trim(); if (!n) continue;
    const forte = forti && FORTI.test(n); if (!forte && !regola.test(n)) continue;
    for (const l of linee(f.geometry)) {
      let pezzo = [];                                    // la linea si spezza dove esce dal riquadro
      const chiudi = () => { if (pezzo.length > 1) { const s = sfoltisci(pezzo, 0.012).map(p => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]); (forte ? scelti.forti : scelti.altri).push(s); nomi.add(n); } pezzo = []; };
      for (const p of l) { if (dentro(p)) pezzo.push(p); else chiudi(); }
      chiudi();
    }
  }
}
prendi(leggi('ne_10m_rivers_lake_centerlines.geojson'), GRANDI, true);
prendi(leggi('ne_10m_rivers_europe.geojson'), MINORI, false);
const dest = new URL('./grezzi/fiumi-scelti.json', import.meta.url);
fs.writeFileSync(dest, JSON.stringify({ fonte: 'Natural Earth 1:10m rivers + lake centerlines e rivers_europe, dominio pubblico', nomi: [...nomi].sort(), forti: scelti.forti, altri: scelti.altri }));
const punti = a => a.reduce((s, l) => s + l.length, 0);
console.log(nomi.size, 'fiumi:', scelti.forti.length, 'tratti forti (' + punti(scelti.forti) + ' punti),', scelti.altri.length, 'altri (' + punti(scelti.altri) + ' punti),', Math.round(fs.statSync(dest).size / 1024) + ' kB');
console.log([...nomi].sort().join(', '));
