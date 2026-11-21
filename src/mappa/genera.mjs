/* Base geografica della mappa: coste da Natural Earth (world-atlas); regioni come unioni di province reali (Digital Atlas of the Roman Empire,
   di Johan Åhlfeldt, tramite il progetto klokantech/roman-empire: grezzi/provinces.geojson, licenza Creative Commons con attribuzione). Uso: npm install && npm run build */
import fs from 'fs';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as simp from 'topojson-simplify';
import pc from 'polygon-clipping';

const W = 1000, H = 640, LIMITI = [-10.5, 28.5, 38.5, 56];        // ovest, sud, est, nord
const topo = JSON.parse(fs.readFileSync(new URL('./node_modules/world-atlas/land-50m.json', import.meta.url)));
const semplice = simp.simplify(simp.presimplify(topo), 0.0009);
const terra = topojson.feature(semplice, semplice.objects.land);

const [o, s, e, n] = LIMITI;
const cornice = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[o, s], [e, s], [o, n], [e, n], [(o + e) / 2, n], [(o + e) / 2, s]] } };
const proj = d3.geoConicConformal().parallels([34, 50]).rotate([-13, 0]).fitExtent([[0, 0], [W, H]], cornice);
const f1 = v => Math.round(v * 10) / 10;

/* terraferma come poligoni piani: il ritaglio sul riquadro lo fa d3 (gestisce antimeridiano e poli),
   poi gli anelli si ricompongono con la regola pari-dispari, così i laghi restano buchi */
proj.clipExtent([[0, 0], [W, H]]);
const anelli = []; let corrente = null;
d3.geoStream(terra, proj.stream({
  polygonStart() {}, polygonEnd() {}, sphere() {},
  lineStart() { corrente = []; },
  point(x, y) { corrente.push([f1(x), f1(y)]); },
  lineEnd() { if (corrente.length > 3) { corrente.push(corrente[0]); anelli.push(corrente); } corrente = null; }
}));
let TERRA = [];
for (const a of anelli) { try { TERRA = pc.xor(TERRA, [[a]]); } catch (err) { /* anello degenere: si salta */ } }

const tracciato = multi => multi.map(pol => pol.map(a => 'M' + a.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z').join('')).join('');

/* Regioni del racconto: ciascuna è l'unione di province reali, dai poligoni del Digital Atlas of the Roman Empire (grezzi/provinces.geojson: le province
   verso il 200 d.C. e, per l'Italia, le undici regioni augustee). Tre regioni che non coincidono con una provincia sono ritagliate con un poligono a mano:
   gli Agri Decumates (oltre Reno e Danubio), la Burgundia (attorno a Lione e Ginevra), la Gallaecia (il nord-ovest della penisola iberica).
   est: true = regioni che dal 395 dipendono da Costantinopoli; non entrano nella quota dell'Occidente. */
const PROV = {}; for (const f of JSON.parse(fs.readFileSync(new URL('./grezzi/provinces.geojson', import.meta.url))).features) PROV[f.properties.name] = f.geometry;
const TAGLI = {
  decumati:  [[7.62, 47.56], [7.55, 48], [7.75, 48.58], [8.1, 48.9], [8.4, 49.3], [8.27, 50], [7.9, 50], [7.6, 50.36], [9, 51], [11.5, 50.6], [12.6, 49.3], [12.1, 49.02], [11.77, 48.85], [10.9, 48.7], [10, 48.4], [10.1, 47.9], [9.6, 47.55], [9, 47.67], [8.2, 47.6]],
  burgundia: [[3.9, 46.9], [5.6, 47.9], [7.62, 47.56], [7.9, 46.6], [7, 45.9], [6.9, 45.1], [6, 44.5], [4.6, 44.5], [4.2, 45.4], [3.8, 46.1]],
  gallaecia: [[-10.5, 44.6], [-5.9, 44.6], [-5.9, 41.9], [-6.6, 41.2], [-10.5, 41]]
};
const REGIONI = {
  britannia:  { nome: 'Britannia', prov: ['Britannia'] },
  gallia:     { nome: 'Gallia del nord', prov: ['Lugdunensis'], fuori: ['burgundia'] },
  belgica:    { nome: 'Belgica e Germanie', prov: ['Belgica', 'Germania Inferior', 'Germania Superior'], fuori: ['decumati', 'burgundia'] },
  aquitania:  { nome: 'Aquitania', prov: ['Aquitania'] },
  provenza:   { nome: 'Gallia meridionale', prov: ['Narbonensis', 'Alpes Maritimae', 'Alpes Cottiae', 'Alpes Graiae et Poeninae'], fuori: ['burgundia'] },
  burgundia:  { nome: 'Burgundia', prov: ['Lugdunensis', 'Germania Superior', 'Narbonensis', 'Alpes Graiae et Poeninae', 'Alpes Cottiae'], dentro: 'burgundia' },
  hispania:   { nome: 'Hispania', prov: ['Tarraconensis', 'Baetica', 'Lusitania'], fuori: ['gallaecia'] },
  gallaecia:  { nome: 'Gallaecia', prov: ['Tarraconensis', 'Lusitania'], dentro: 'gallaecia' },
  italia_nord:{ nome: 'Italia del nord', prov: ['IX', 'X', 'XI', 'VII'] },
  ravenna:    { nome: 'Emilia e Ravenna', prov: ['VIII'] },
  spoleto:    { nome: 'Umbria e Piceno', prov: ['VI', 'V'] },
  roma:       { nome: 'Lazio e Campania', prov: ['I'] },
  benevento:  { nome: 'Sannio e Puglia', prov: ['IV', 'II'] },
  calabria:   { nome: 'Lucania e Bruzio', prov: ['III'] },
  sicilia:    { nome: 'Sicilia', prov: ['Sicilia'] },
  isole:      { nome: 'Sardegna e Corsica', prov: ['Sardinia et Corsica'] },
  rezia:      { nome: 'Rezia e Norico', prov: ['Raetia', 'Noricum'], fuori: ['decumati'] },
  pannonia:   { nome: 'Pannonia', prov: ['Pannonia Superior', 'Pannonia Inferior'] },
  dalmazia:   { nome: 'Dalmazia', prov: ['Dalmatia'] },
  africa:     { nome: 'Africa', prov: ['Africa Proconsularis', 'Numidia'] },
  mauretania: { nome: 'Mauretanie', prov: ['Mauretania Caesariensis', 'Mauretania Tingitana'] },
  decumati:   { nome: 'Agri Decumates', prov: ['Germania Superior', 'Raetia'], dentro: 'decumati' },
  dacia:      { nome: 'Dacia', prov: ['Dacia'], est: true },
  balcani:    { nome: 'Balcani', prov: ['Moesia Superior', 'Moesia Inferior', 'Thracia', 'Macedonia', 'Achaia'], est: true },
  anatolia:   { nome: 'Asia Minore', prov: ['Asia', 'Bithynia et Pontus', 'Galatia et Cappadocia', 'Lycia et Pamphylia', 'Cilicia', 'Cyprus'], est: true },
  levante:    { nome: 'Siria e Palestina', prov: ['Syria', 'Iudaea', 'Arabia', 'Armenia Mesopotamia'], est: true },
  egitto:     { nome: 'Egitto e Cirenaica', prov: ['Aegyptus', 'Creta et Cyrene'], est: true }
};
/* una geometria GeoJSON diventa un multipoligono piano, sfoltito: punti a meno di 0,4 unità dal precedente si saltano */
function piano(geo) {
  const pol = geo.type === 'Polygon' ? [geo.coordinates] : geo.coordinates, out = [];
  for (const p of pol) {
    const anelliP = [];
    for (const a of p) {
      const r = []; let u = null;
      for (const c of a) { const q = proj(c); if (!q) continue; if (u && Math.hypot(q[0] - u[0], q[1] - u[1]) < .9) continue; u = q; r.push([f1(q[0]), f1(q[1])]); }
      let ar = 0; for (let i = 0; i < r.length; i++) { const j = (i + 1) % r.length; ar += r[i][0] * r[j][1] - r[j][0] * r[i][1]; }
      if (r.length > 3 && Math.abs(ar) / 2 > 2.5) { r.push(r[0]); anelliP.push(r); }      // isolette e scogli sotto i due pixel e mezzo quadrati si saltano
    }
    if (anelliP.length) out.push(anelliP);
  }
  return out;
}
const taglio = id => [[TAGLI[id].concat([TAGLI[id][0]]).map(c => proj(c))]];
function forma(r) {
  let m = [];
  for (const n of r.prov) { if (!PROV[n]) throw new Error('provincia sconosciuta: ' + n); const g = piano(PROV[n]); m = m.length ? pc.union(m, g) : g; }
  if (r.dentro) m = pc.intersection(m, taglio(r.dentro));
  for (const t of r.fuori || []) m = pc.difference(m, taglio(t));
  return m;
}

const CITTA = { roma: [12.48, 41.89, 'Roma'], ravenna: [12.2, 44.42, 'Ravenna'], milano: [9.19, 45.46, 'Milano'], treviri: [6.64, 49.75, 'Treviri'], arles: [4.63, 43.68, 'Arles'],
  cartagine: [10.32, 36.85, 'Cartagine'], costantinopoli: [28.98, 41.01, 'Costantinopoli'], londra: [-0.1, 51.51, 'Londinium'], sirmio: [19.61, 44.97, 'Sirmio'],
  antiochia: [36.16, 36.2, 'Antiochia'], alessandria: [29.92, 31.2, 'Alessandria'], tolosa: [1.44, 43.6, 'Tolosa'], adrianopoli: [26.56, 41.68, 'Adrianopoli'] };

/* I popoli in movimento: dove sta il grosso di ciascun gruppo, anno per anno, e in che rapporto è con Roma. [anno, lon, lat, rapporto].
   Rapporti: fuori (oltre il confine, senza patto) | accolti (ammessi dentro l'impero) | federati (patto: terre o paghe in cambio di soldati) |
   armi (in guerra dentro l'impero) | regno (un regno proprio su terre che erano di Roma).
   Riveduti il 21 novembre 2026 (elenco delle fonti in testa a js/dati.js). Letti: Bury V e VI (Alarico in Epiro per conto di Stilicone nel 405-407; i Pirenei passati nell'autunno 409),
   Bury VIII (lo stretto nel maggio 429, Ippona nel 430: dove fossero i Vandali a fine 429 non si sa, il punto è a mezza strada), Beda I 15 (i Sassoni accolti e poi in armi).
   A memoria: la spartizione della Hispania nel 411 e i Vandali in Gallaecia fino al 420 (Idazio), i Franchi in Toxandria nel 358 (Ammiano XVII 8),
   i Longobardi a Cividale nel 568 e a Pavia nel 572 (Paolo Diacono II). Le date in cui un popolo esce dalla mappa (`fine`) sono state ricontrollate.
   Un «popolo» qui è il nucleo armato e la sua gente, non un'etnia compatta: i punti dicono dove stava il centro di gravità, non un confine. */
const POPOLI = {
  goti:      { nome: 'Goti', poi: [[418, 'Visigoti']], peso: 9, t: [[235, 28, 47, 'fuori'], [251, 26.5, 43.5, 'armi'], [271, 26, 46.3, 'fuori'], [376, 27, 43.8, 'accolti'], [378, 26.6, 41.7, 'armi'], [382, 25, 43.3, 'federati'], [395, 22.5, 39.8, 'armi'], [402, 8.2, 44.8, 'armi'], [406, 20.7, 39.7, 'federati'], [409, 12.5, 42.3, 'armi'], [410, 12.5, 41.9, 'armi'], [418, 0.4, 44.6, 'federati'], [472, 1.4, 43.6, 'regno'], [537, -3.6, 40.2, 'regno']], fine: 711 },
  ostrogoti: { nome: 'Ostrogoti', peso: 8, t: [[235, 33, 47.2, 'fuori'], [378, 30, 46.5, 'fuori'], [455, 18, 46.5, 'federati'], [476, 24.5, 43.4, 'federati'], [493, 11.8, 44.6, 'regno']], fine: 554 },
  vandali:   { nome: 'Vandali e Alani', peso: 7, t: [[235, 20, 49.6, 'fuori'], [402, 15.5, 48.9, 'fuori'], [406, 8.3, 50, 'armi'], [409, -1.6, 42.8, 'armi'], [418, -6.5, 42.5, 'armi'], [420, -5.5, 37.5, 'armi'], [429, 5.5, 36.4, 'armi'], [439, 10.2, 36.5, 'regno']], fine: 534 },
  svevi:     { nome: 'Svevi', peso: 4, t: [[235, 11.5, 50.3, 'fuori'], [406, 8, 49.6, 'armi'], [409, -3.6, 42.3, 'armi'], [411, -8, 42.4, 'armi'], [418, -8, 42.4, 'regno']], fine: 585 },
  burgundi:  { nome: 'Burgundi', peso: 4, t: [[235, 14.5, 51.5, 'fuori'], [357, 10, 50, 'fuori'], [418, 8.4, 49.6, 'federati'], [451, 6.1, 46.2, 'federati'], [472, 4.9, 45.8, 'regno']], fine: 534 },
  franchi:   { nome: 'Franchi', peso: 7, t: [[235, 7.4, 52.2, 'fuori'], [358, 5.2, 51.4, 'federati'], [476, 3.6, 50.2, 'regno'], [493, 3.2, 49.3, 'regno'], [537, 2.4, 48.8, 'regno']], fine: 852 },
  alamanni:  { nome: 'Alamanni', peso: 4, t: [[235, 10.5, 49.6, 'fuori'], [260, 9.2, 48.5, 'fuori'], [406, 8.2, 47.9, 'fuori']], fine: 506 },
  unni:      { nome: 'Unni', peso: 8, t: [[357, 44, 47.5, 'fuori'], [378, 33, 47, 'fuori'], [406, 23.5, 46.5, 'fuori'], [429, 20.2, 47, 'fuori'], [451, 4.4, 48.9, 'armi'], [452, 12.5, 45.4, 'armi'], [453, 20.2, 47, 'fuori']], fine: 455 },
  sassoni:   { nome: 'Angli e Sassoni', peso: 4, t: [[235, 9.2, 54, 'fuori'], [409, 8.5, 53.8, 'fuori'], [451, 0.6, 52.4, 'armi'], [568, 0.6, 52.4, 'regno']], fine: 852 },
  longobardi:{ nome: 'Longobardi', peso: 7, t: [[235, 10.6, 53.3, 'fuori'], [493, 16.2, 48.4, 'fuori'], [546, 18, 46.9, 'federati'], [568, 13.4, 46.1, 'armi'], [572, 9.2, 45.2, 'regno']], fine: 774 },
  avari:     { nome: 'Avari', peso: 5, t: [[568, 19.5, 46.8, 'fuori']], fine: 796 }
};
const out = { w: W, h: H, terra: tracciato(TERRA), regioni: {}, citta: {}, popoli: {} };
for (const [id, q] of Object.entries(POPOLI)) out.popoli[id] = { nome: q.nome, poi: q.poi || [], peso: q.peso, fine: q.fine, t: q.t.map(v => { const p = proj([v[1], v[2]]); return [v[0], f1(p[0]), f1(p[1]), v[3]]; }) };
for (const [id, r] of Object.entries(REGIONI)) {
  const m = forma(r);
  let area = 0, tot = 0, cx = 0, cy = 0;                // baricentro del pezzo più grande, per l'etichetta; la superficie pesa la quota di territorio
  for (const pol of m) {
    const a = pol[0]; let A = 0, x = 0, y = 0;
    for (let i = 0; i < a.length - 1; i++) { const k = a[i][0] * a[i + 1][1] - a[i + 1][0] * a[i][1]; A += k; x += (a[i][0] + a[i + 1][0]) * k; y += (a[i][1] + a[i + 1][1]) * k; }
    tot += Math.abs(A) / 2;
    if (Math.abs(A) > area) { area = Math.abs(A); cx = x / (3 * A); cy = y / (3 * A); }
  }
  out.regioni[id] = { nome: r.nome, peso: Math.round(tot), est: !!r.est, d: tracciato(m), c: [f1(cx), f1(cy)] };
}
for (const [id, c] of Object.entries(CITTA)) { const p = proj([c[0], c[1]]); out.citta[id] = { nome: c[2], x: f1(p[0]), y: f1(p[1]) }; }

const dest = new URL('../../js/mappa-dati.js', import.meta.url);
fs.writeFileSync(dest, '/* Generato da src/mappa/genera.mjs: non modificare a mano. */\nwindow.RM_MAPPA=' + JSON.stringify(out) + ';\n');
console.log('mappa-dati.js', Math.round(fs.statSync(dest).size / 1024) + ' kB,', Object.keys(out.regioni).length, 'regioni');
for (const [id, r] of Object.entries(out.regioni)) console.log(' ', id.padEnd(11), String(r.d.length).padStart(6), 'car.', r.c.join(','));
