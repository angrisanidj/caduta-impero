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
   verso il 200 d.C. e, per l'Italia, le undici regioni augustee). Sette regioni che non coincidono con una provincia sono ritagliate con un poligono a mano:
   gli Agri Decumates (oltre Reno e Danubio), la Burgundia (attorno a Lione e Ginevra), la Gallaecia (il nord-ovest della penisola iberica), Creta, la Campania, la Romagna (l'Esarcato di Ravenna, staccato dall'Emilia longobarda), il Lazio (che prende anche l'Etruria a sud di Sutri).
   est: true = regioni che dal 395 dipendono da Costantinopoli; non entrano nella quota dell'Occidente. */
const PROV = {}; for (const f of JSON.parse(fs.readFileSync(new URL('./grezzi/provinces.geojson', import.meta.url))).features) PROV[f.properties.name] = f.geometry;
/* Ritagli a mano, in [lon, lat]. I primi tre sono quelli di partenza; gli altri vengono dalla revisione del 21 novembre 2026 sui confini dei regni
   (voci di Wikipedia su Settimania, regno dei Burgundi, Spania, Esarcato d'Italia, primo impero bulgaro, Avari, Marca di Spagna, trattato di Verdun; Bury).
   I VERTICI SONO INDICATIVI: seguono fiumi, crinali e città nominati dalle fonti, ma le coordinate sono messe a mano, non prese da un atlante. */
const TAGLI = {
  decumati:  [[7.62, 47.56], [7.55, 48], [7.75, 48.58], [8.1, 48.9], [8.4, 49.3], [8.27, 50], [7.9, 50], [7.6, 50.36], [9, 51], [11.5, 50.6], [12.6, 49.3], [12.1, 49.02], [11.77, 48.85], [10.9, 48.7], [10, 48.4], [10.1, 47.9], [9.6, 47.55], [9, 47.67], [8.2, 47.6]],
  burgundia: [[3.1, 47.05], [5.3, 48], [7.62, 47.56], [8.3, 47.5], [8.35, 46.55], [6.9, 45.1], [5.95, 44.2], [4.8, 43.95], [4.1, 45.4], [3.8, 46.3]],      // da Nevers e Langres a Basilea, e a sud fino alla Durance (confine dal 508-509)
  sapaudia:  [[5.75, 46.25], [6.4, 46.95], [7.1, 46.95], [7.4, 46.45], [6.8, 45.85], [6.1, 45.6], [5.7, 45.75]],                                             // attorno a Ginevra: la sede data ai Burgundi nel 443 (estensione discussa)
  gallaecia: [[-10.5, 44.6], [-5.9, 44.6], [-5.9, 41.9], [-6.6, 41.2], [-10.5, 41]],
  asturie:   [[-9.3, 43.9], [-3.1, 43.7], [-3.2, 43], [-4.6, 42.85], [-5.9, 42.75], [-7, 42.1], [-8.2, 41.85], [-8.9, 41.85]],                               // Asturie e Cantabria: il nucleo del regno (Cangas de Onís, Covadonga)
  marca:     [[0.5, 42.9], [0.5, 42.4], [0.75, 42.15], [1.3, 41.95], [1.65, 41.85], [1.85, 41.55], [2.1, 41.3], [3.4, 41.6], [3.4, 42.9]],                    // la marca di Spagna fino al Llobregat (Barcellona 801)
  spania:    [[-6.3, 36.75], [-5.85, 36.85], [-4.6, 37.15], [-3.15, 37.4], [-2.6, 37.65], [-1.6, 38.05], [-0.6, 38.35], [0.3, 38.5], [0.3, 35.9], [-6.3, 35.9]],  // la costa bizantina da Cadice a Cartagena, 552-624 circa
  settimania:[[4.75, 43.2], [4.62, 43.85], [4.68, 44.3], [4, 44.3], [3.3, 43.95], [2.6, 43.55], [2, 43.3], [1.85, 42.6], [1.85, 42.3], [3.3, 42.3]],          // la Narbonese a ovest del Rodano, senza Tolosa
  tolosano:  [[0.5, 44.3], [1.1, 44.1], [1.7, 43.9], [2.6, 43.55], [2, 43.3], [1.85, 42.6], [0.6, 42.6], [0.5, 43.4]],                                        // Tolosa: nel 200 sta nella Narbonese, ma dal 418 è la capitale dei Visigoti d'Aquitania
  alvernia:  [[0.95, 47.45], [0.95, 46.6], [0.85, 45.5], [1.15, 44.95], [1.05, 44.1], [2.6, 43.55], [3.9, 44.4], [4.1, 46.05], [3.1, 47], [2.8, 47.6]],       // l'Aquitania prima (Bourges, Clermont, Limoges): romana fino al 475
  soissons:  [[1.4, 50.2], [3, 49.95], [3.7, 49.8], [4.5, 49.65], [5, 49.2], [5, 48], [1.4, 48]],                                                             // la parte di Belgica che resta a Siagrio fino al 486 (quanto fosse grande è discusso)
  bretagna:  [[-1.95, 48.75], [-2, 48.1], [-2.1, 47.6], [-2.5, 47.3], [-5.5, 47.3], [-5.5, 48.9], [-3.5, 49.1]],                                              // a ovest della Rance e della Vilaine
  galles:    [[-3.05, 53.5], [-3.05, 52.9], [-3.15, 52.5], [-3, 52], [-2.65, 51.5], [-5.6, 51.4], [-5.2, 53.6]],                                              // a ovest del vallo di Offa
  cornovaglia:[[-4.2, 50.3], [-4.25, 50.7], [-4.55, 50.95], [-6.5, 50.9], [-6.5, 49.8], [-4.2, 49.8]],                                                        // a ovest del Tamar
  mauri:     [[5, 35.3], [6, 35.55], [7.2, 35.35], [8.3, 35.15], [9.3, 34.9], [10.3, 34], [11.3, 33.1], [13.2, 32.7], [15.5, 31.8], [15.5, 28.5], [5, 28.5]],  // l'interno (Aurès, predeserto, Tripolitania interna): dai regni mauri degli anni 480
  liguria:   [[7.5, 43.78], [7.75, 44.1], [8.3, 44.3], [8.95, 44.55], [9.5, 44.45], [10, 44.2], [10.1, 44], [10, 43.5], [7.5, 43.5]],                         // la costa ligure, bizantina fino a Rotari (643)
  venezia:   [[12.2, 45.1], [12.15, 45.45], [12.55, 45.62], [12.95, 45.72], [13.45, 45.75], [13.6, 45.6], [12.5, 45]],                                        // le lagune
  istria:    [[13.5, 45.6], [13.95, 45.6], [14.25, 45.35], [14.1, 44.8], [13.5, 44.8]],
  romagna:   [[10.85, 43.6], [10.85, 44], [11, 44.6], [11.4, 44.95], [11.4, 45.3], [13, 45.3], [13, 43.6]],                                                   // la Regio VIII a est del Panaro: l'Esarcato (Bologna, Ravenna, Rimini)
  pentapoli: [[12.4, 44.05], [12.25, 43.75], [12.45, 43.35], [12.75, 43.25], [13.15, 43.35], [13.5, 43.4], [13.65, 43.55], [13.3, 44.05]],                    // da Pesaro ad Ancona
  corridoio: [[12.3, 43.25], [12.5, 43.2], [12.5, 42.75], [12.48, 42.46], [12.3, 42.46], [12.3, 42.75], [12.2, 43.1]],                                        // Perugia, Todi, Amelia: la striscia che tiene uniti Ravenna e Roma
  tuscia:    [[11.6, 41.6], [11.6, 42.2], [11.8, 42.2], [12.05, 42.3], [12.25, 42.33], [12.4, 42.45], [12.9, 42.45], [12.9, 41.6]],                           // l'Etruria a sud di Blera, Sutri e Orte: con Roma dal VI secolo
  campania:  [[13.76, 41], [13.78, 41.25], [13.95, 41.42], [14.1, 41.55], [15.3, 41.6], [15.3, 40.3], [13.76, 40.3]],                                         // la Regio I a est del Garigliano
  napoli:    [[13.95, 41], [14.3, 40.98], [14.55, 40.85], [14.65, 40.65], [14.35, 40.55], [13.85, 40.7]],                                                     // il ducato di Napoli, con Sorrento e Amalfi
  bruzio:    [[15.6, 39.2], [16.1, 39.15], [16.35, 39.2], [16.5, 39.5], [16.75, 39.7], [17.3, 39.6], [17.3, 37.8], [15.5, 37.8]],                              // la Calabria di oggi a sud di Cosenza
  salento:   [[17.15, 40.55], [17.6, 40.6], [17.95, 40.7], [18.2, 40.7], [18.6, 40.1], [18.4, 39.7], [17.2, 40.2]],                                           // bizantino fino al 687 circa
  otranto:   [[17.95, 40.3], [18.5, 40.3], [18.6, 39.75], [17.95, 39.95]],                                                                                    // Otranto e Gallipoli, che restano all'impero
  carantania:[[14.48, 48.25], [14.45, 47.75], [13.7, 47.4], [13.3, 47.05], [12.3, 46.75], [12.9, 46.55], [14, 46.45], [16.1, 46.8], [16.5, 47.7], [16.9, 48.15]],  // a est dell'Enns: Avari e Slavi dal 568
  creta:     [[23, 34.6], [26.6, 34.6], [26.6, 35.9], [23, 35.9]]
};
const BURG = ['Lugdunensis', 'Germania Superior', 'Narbonensis', 'Alpes Graiae et Poeninae', 'Alpes Cottiae', 'Alpes Maritimae'];
const REGIONI = {
  britannia:  { nome: 'Britannia', prov: ['Britannia'], fuori: ['galles', 'cornovaglia'] },
  galles:     { nome: 'Galles e Cornovaglia', prov: ['Britannia'], dentro: 'galles', piu: [{ prov: ['Britannia'], dentro: 'cornovaglia' }] },
  gallia:     { nome: 'Gallia del nord', prov: ['Lugdunensis'], fuori: ['burgundia', 'bretagna'] },
  bretagna:   { nome: 'Bretagna', prov: ['Lugdunensis'], dentro: 'bretagna' },
  belgica:    { nome: 'Belgica e Germanie', prov: ['Belgica', 'Germania Inferior', 'Germania Superior'], fuori: ['decumati', 'burgundia', 'soissons'] },
  soissons:   { nome: 'Soissons e Reims', prov: ['Belgica'], dentro: 'soissons' },
  aquitania:  { nome: 'Aquitania', prov: ['Aquitania'], fuori: ['alvernia'], piu: [{ prov: ['Narbonensis'], dentro: 'tolosano' }] },
  alvernia:   { nome: 'Alvernia e Berry', prov: ['Aquitania'], dentro: 'alvernia' },
  provenza:   { nome: 'Provenza', prov: ['Narbonensis', 'Alpes Maritimae', 'Alpes Cottiae', 'Alpes Graiae et Poeninae'], fuori: ['burgundia', 'settimania', 'tolosano'] },
  settimania: { nome: 'Settimania', prov: ['Narbonensis'], dentro: 'settimania', fuori: ['burgundia'] },
  burgundia:  { nome: 'Burgundia', prov: BURG, dentro: 'burgundia', fuori: ['sapaudia', 'settimania'] },
  sapaudia:   { nome: 'Sapaudia', prov: BURG, dentro: ['burgundia', 'sapaudia'] },
  hispania:   { nome: 'Hispania', prov: ['Tarraconensis', 'Baetica', 'Lusitania'], fuori: ['gallaecia', 'asturie', 'marca', 'spania'] },
  gallaecia:  { nome: 'Gallaecia', prov: ['Tarraconensis', 'Lusitania'], dentro: 'gallaecia' },
  asturie:    { nome: 'Asturie e Cantabria', prov: ['Tarraconensis'], dentro: 'asturie', fuori: ['gallaecia'] },
  marca:      { nome: 'Marca di Spagna', prov: ['Tarraconensis'], dentro: 'marca' },
  spania:     { nome: 'Spania', prov: ['Tarraconensis', 'Baetica'], dentro: 'spania' },
  italia_nord:{ nome: 'Italia del nord', prov: ['IX', 'X', 'XI', 'VII'], fuori: ['tuscia', 'liguria', 'venezia', 'istria', 'corridoio'], piu: [{ prov: ['VIII'], fuori: ['romagna'] }] },
  liguria:    { nome: 'Liguria marittima', prov: ['IX', 'VII'], dentro: 'liguria' },
  venezia:    { nome: 'Lagune venete e Istria', prov: ['X'], dentro: 'venezia', piu: [{ prov: ['X'], dentro: 'istria' }] },
  ravenna:    { nome: 'Romagna e Ravenna', prov: ['VIII'], dentro: 'romagna' },
  spoleto:    { nome: 'Umbria e Piceno', prov: ['VI', 'V'], fuori: ['pentapoli', 'corridoio'] },
  pentapoli:  { nome: 'Pentapoli e corridoio di Perugia', prov: ['VI', 'V'], dentro: 'pentapoli', piu: [{ prov: ['VI', 'VII'], dentro: 'corridoio' }] },
  roma:       { nome: 'Lazio', prov: ['I'], fuori: ['campania'], piu: [{ prov: ['VII'], dentro: 'tuscia', fuori: ['corridoio'] }] },
  campania:   { nome: 'Campania', prov: ['I'], dentro: 'campania', fuori: ['napoli'] },
  napoli:     { nome: 'Ducato di Napoli', prov: ['I'], dentro: 'napoli' },
  benevento:  { nome: 'Sannio e Puglia', prov: ['IV', 'II'], fuori: ['salento'] },
  salento:    { nome: 'Salento', prov: ['II'], dentro: 'salento', fuori: ['otranto'] },
  otranto:    { nome: 'Terra d\'Otranto', prov: ['II'], dentro: 'otranto' },
  calabria:   { nome: 'Lucania', prov: ['III'], fuori: ['bruzio'] },
  bruzio:     { nome: 'Bruzio', prov: ['III'], dentro: 'bruzio' },
  sicilia:    { nome: 'Sicilia', prov: ['Sicilia'] },
  isole:      { nome: 'Sardegna e Corsica', prov: ['Sardinia et Corsica'] },
  rezia:      { nome: 'Rezia e Norico', prov: ['Raetia', 'Noricum'], fuori: ['decumati', 'carantania'] },
  carantania: { nome: 'Norico orientale', prov: ['Noricum', 'Pannonia Superior'], dentro: 'carantania' },
  pannonia:   { nome: 'Pannonia', prov: ['Pannonia Superior', 'Pannonia Inferior'], fuori: ['carantania'] },
  dalmazia:   { nome: 'Dalmazia', prov: ['Dalmatia'] },
  africa:     { nome: 'Africa', prov: ['Africa Proconsularis'], fuori: ['mauri'] },
  numidia:    { nome: 'Numidia', prov: ['Numidia'], fuori: ['mauri'] },
  mauri:      { nome: 'Interno dell\'Africa', prov: ['Africa Proconsularis', 'Numidia'], dentro: 'mauri' },
  mauretania: { nome: 'Mauretanie', prov: ['Mauretania Caesariensis', 'Mauretania Tingitana'] },
  decumati:   { nome: 'Agri Decumates', prov: ['Germania Superior', 'Raetia'], dentro: 'decumati' },
  dacia:      { nome: 'Dacia', prov: ['Dacia'], est: true },
  balcani:    { nome: 'Macedonia e Grecia', prov: ['Macedonia', 'Achaia'], est: true },
  tracia:     { nome: 'Tracia', prov: ['Thracia'], est: true },
  mesia_inf:  { nome: 'Mesia inferiore', prov: ['Moesia Inferior'], est: true },
  mesia_sup:  { nome: 'Mesia superiore', prov: ['Moesia Superior'], est: true },
  anatolia:   { nome: 'Asia Minore', prov: ['Asia', 'Bithynia et Pontus', 'Galatia et Cappadocia', 'Lycia et Pamphylia', 'Cilicia', 'Cyprus'], est: true },
  levante:    { nome: 'Siria e Palestina', prov: ['Syria', 'Iudaea', 'Arabia', 'Armenia Mesopotamia'], est: true },
  egitto:     { nome: 'Egitto e Cirenaica', prov: ['Aegyptus', 'Creta et Cyrene'], fuori: ['creta'], est: true },
  creta:      { nome: 'Creta', prov: ['Creta et Cyrene'], dentro: 'creta', est: true },
  /* terre che non sono mai state dell'impero: servono per gli Unni, gli Avari, i Bulgari e perché l'impero di Carlo Magno non finisca al Reno */
  frisia:     { nome: 'Frisia', terra: [[4.2, 51.8], [5.1, 51.7], [6.1, 51.7], [6.6, 52.4], [7, 53], [7.2, 53.3], [8.55, 53.55], [8.55, 53.9], [4.5, 53.6]] },
  sassonia:   { nome: 'Sassonia', terra: [[6.4, 52.3], [7.2, 53.3], [8.55, 53.55], [9, 53.9], [8.9, 54.35], [10.13, 54.35], [10.6, 53.4], [11.63, 52.13], [11, 51.6], [9.65, 51.4], [8.6, 51.15], [6.8, 51.55], [6.2, 51.7]] },
  turingia:   { nome: 'Assia, Turingia e Franconia', terra: [[7, 50.1], [6.3, 50.9], [6.1, 51.75], [6.8, 51.55], [8.6, 51.15], [9.65, 51.4], [11, 51.6], [11.95, 51.45], [12.3, 50.6], [12.75, 49.5], [13.45, 48.57], [12.1, 49.02], [9.7, 48.8], [8.98, 50.08], [8.2, 49.9]] },
  moravia:    { nome: 'Moravia', terra: [[15.2, 49.6], [16.2, 50.15], [17.7, 50.15], [18.6, 49.6], [19.3, 49.3], [19.1, 48.2], [18.8, 47.8], [17.1, 48], [16.9, 48.6], [15.9, 48.8]] },
  alfold:     { nome: 'Pianura pannonica', terra: [[18.85, 47.8], [19.3, 48.1], [21.5, 48.4], [22.4, 48.2], [22.6, 47.6], [22, 47], [21.6, 46.2], [20.4, 44.8], [19, 45.4], [18.95, 47.4]] },
  valacchia:  { nome: 'Oltre il basso Danubio', terra: [[24.4, 43.7], [24.4, 45.5], [25.4, 45.6], [26.2, 45.6], [26.5, 46.4], [26.2, 47.5], [26.6, 48.3], [28, 48.5], [29.5, 47.9], [30.3, 46.3], [29.7, 45.2], [27.3, 44.1]] },
  steppa:     { nome: 'Steppa del mar Nero', terra: [[30, 46.9], [29.4, 48], [30.5, 49.5], [33, 49.8], [38.5, 50], [38.5, 47.1], [37.5, 47], [35.3, 46.4], [33.7, 46.15], [31.5, 46.6]] }
};
/* la divisione di Verdun (843), disegnata come due linee sopra l'impero dei Franchi: dagli Annali di Saint-Bertin, nel riassunto della voce tedesca di Wikipedia */
const VERDUN = {
  linee: [[[3.55, 51.45], [3.7, 51.05], [3.4, 50.6], [3.1, 50.15], [3.9, 49.9], [4.4, 49.7], [4.9, 49.3], [5.1, 48.1], [5, 47.1], [4.83, 45.75], [4.75, 44.3], [4.65, 43.35]],
          [[6.1, 51.85], [6.96, 50.94], [7.9, 49.97], [7.6, 49.6], [8.2, 48.97], [7.6, 47.56], [8.2, 47.55], [7.9, 46.6], [8.4, 46.5]]],
  nomi: [[0.3, 46.6, 'Carlo il Calvo'], [6.1, 46.9, 'Lotario'], [10.6, 50.3, 'Ludovico']]
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
/* terre che non sono mai state dell'impero (la Germania oltre il Reno, la pianura degli Unni e degli Avari…): un poligono a mano in lon/lat,
   ritagliato sulla terraferma e privato di tutto ciò che è provincia romana. Servono perché l'impero di Carlo Magno non finisca al Reno. */
let impero = null, giaOltre = [];
function oltreImpero(poli) {
  if (!impero) { impero = []; for (const n of Object.keys(PROV)) { const g = piano(PROV[n]); impero = impero.length ? pc.union(impero, g) : g; } }
  let m = pc.difference(pc.intersection(TERRA, [[poli.concat([poli[0]]).map(c => proj(c))]]), impero);
  if (giaOltre.length) m = pc.difference(m, giaOltre);                 // due regioni esterne non si sovrappongono: vince la prima
  giaOltre = giaOltre.length ? pc.union(giaOltre, m) : m;
  return m;
}
function forma(r) {
  if (r.terra) return oltreImpero(r.terra);
  let m = [];
  for (const n of r.prov) { if (!PROV[n]) throw new Error('provincia sconosciuta: ' + n); const g = piano(PROV[n]); m = m.length ? pc.union(m, g) : g; }
  for (const t of [].concat(r.dentro || [])) m = pc.intersection(m, taglio(t));
  for (const t of r.fuori || []) m = pc.difference(m, taglio(t));
  for (const e of r.piu || []) m = pc.union(m, forma(e));                // pezzi di altre province, con i loro ritagli
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
   Una tappa può avere un quinto elemento: i punti di passaggio [lon, lat] del cammino fatto per arrivarci, perché la rotta disegnata segua la terra e non tagli il mare
   (Alarico fra l'Epiro e l'Italia passa per l'Illirico, Emona e Aquileia: Zosimo V 26-37).
   Un «popolo» qui è il nucleo armato e la sua gente, non un'etnia compatta: i punti dicono dove stava il centro di gravità, non un confine. */
const POPOLI = {
  goti:      { nome: 'Goti', poi: [[418, 'Visigoti']], peso: 9, t: [[235, 28, 47, 'fuori'], [251, 26.5, 43.5, 'armi'], [271, 26, 46.3, 'fuori'], [376, 27.27, 44.12, 'accolti'],
    [378, 26.56, 41.68, 'armi', [[27.6, 43.3]]],                                                                                    // per Marcianopoli ad Adrianopoli
    [382, 25, 43.3, 'federati'],
    [395, 22.4, 39.6, 'armi', [[26.5, 42.1], [28.3, 41.2], [26.4, 40.95], [25.4, 41.12], [23.85, 40.82], [22.94, 40.64], [22.6, 39.9]]],   // sotto Costantinopoli, poi la via Egnazia e Tempe
    [397, 20.1, 41.1, 'federati', [[21.8, 39.6], [20.9, 39.7]]],                                                                    // Epiro (Bury, cap. V)
    [402, 7.9, 44.7, 'armi', [[19.5, 42.1], [18.4, 43.85], [16.37, 45.48], [14.5, 46.05], [13.37, 45.77], [9.19, 45.46], [8.2, 44.9]]],     // Aquileia, Milano, Asti, Pollenzo: Bury; il tratto dall'Epiro a Siscia non è attestato
    [403, 16.37, 45.48, 'federati', [[10.99, 45.44], [13.37, 45.77], [14.5, 46.05]]],                                               // dopo Verona, «fra Dalmazia e Pannonia»
    [406, 20.7, 39.4, 'federati', [[18.4, 43.85], [19.5, 42.1], [20.1, 41.1]]],
    [408, 14.37, 46.7, 'armi', [[20.1, 41.1], [19.5, 42.1], [18.4, 43.85], [16.37, 45.48], [14.5, 46.05]]],                         // Emona e il Norico (Zosimo V 29)
    [409, 12.5, 42.3, 'armi', [[14.5, 46.05], [13.37, 45.77], [12.42, 45.54], [10.03, 45.13], [11.34, 44.49], [12.57, 44.06], [12.7, 42.95], [12.52, 42.52]]],   // Aquileia, Altino, Cremona, Bologna, Rimini (Zosimo V 37)
    [410, 12.5, 41.9, 'armi'],
    [412, 4.9, 44.93, 'armi', [[14.25, 40.85], [15.6, 40.1], [16.25, 39.3], [15.65, 38.11], [16.25, 39.3], [15.6, 40.1], [14.9, 40.9], [12.48, 41.9], [11.25, 43.77], [10.3, 44.8], [8.6, 44.9], [7.7, 45.07], [6.75, 44.9]]],   // fino a Reggio e ritorno, poi le Alpi (il valico è un'ipotesi)
    [415, 2.17, 41.38, 'armi', [[4.8, 43.95], [3, 43.18], [2.86, 42.46]]],
    [418, 0.4, 44.6, 'federati', [[2.86, 42.46], [3, 43.18], [1.44, 43.6]]],
    [472, 1.4, 43.6, 'regno'], [537, -3.6, 40.2, 'regno']], fine: 711 },
  ostrogoti: { nome: 'Ostrogoti', peso: 8, t: [[235, 33, 47.2, 'fuori'], [378, 30, 46.5, 'fuori'], [455, 18, 46.5, 'federati', [[26, 46.5], [22, 47]]], [476, 25.4, 43.6, 'federati', [[20.46, 44.82], [22.88, 43.99]]],
    [493, 11.8, 44.6, 'regno', [[22.88, 43.99], [21.2, 44.73], [20.46, 44.82], [19, 45.3], [16.37, 45.48], [14.5, 46.05], [13.6, 45.85], [10.99, 45.44], [9.19, 45.46], [9.5, 45.4]]]], fine: 554 },   // 488-493: Singidunum, Siscia, Isonzo, Verona, Adda, Ravenna
  vandali:   { nome: 'Vandali e Alani', peso: 7, t: [[235, 20, 49.6, 'fuori'], [402, 15.5, 48.9, 'fuori'],
    [406, 8.27, 50, 'armi', [[12.1, 49.02], [9.93, 49.79]]],                                                                        // lungo Danubio e Meno (ipotesi); Magonza è il passaggio più citato
    [409, -1.65, 42.8, 'armi', [[4.03, 49.25], [2.3, 49.9], [1.9, 47.9], [0.6, 44.2], [-1.32, 43.01]]],                             // Reims e Amiens (Girolamo, lettera 123), poi l'Aquitania e i Pirenei, autunno 409 (Idazio)
    [418, -6.5, 42.5, 'armi', [[-3.7, 42.35], [-5.57, 42.6]]], [420, -5.5, 37.5, 'armi', [[-6.3, 40], [-6.34, 38.92]]],
    [429, 5.4, 36.19, 'armi', [[-5.6, 36.02], [-5.8, 35.78], [-3.9, 35], [-1.32, 34.88], [0.6, 35.5], [2.23, 36.3]]],               // lo stretto è l'unico tratto per mare
    [439, 10.2, 36.5, 'regno', [[7.75, 36.88], [9, 36.5]]]], fine: 534 },
  svevi:     { nome: 'Svevi', peso: 4, t: [[235, 11.5, 50.3, 'fuori'], [406, 8, 49.6, 'armi'], [409, -3.6, 42.3, 'armi', [[4.03, 49.25], [1.9, 47.9], [0.6, 44.2], [-1.32, 43.01]]], [411, -8, 42.4, 'armi', [[-5.57, 42.6]]], [418, -8, 42.4, 'regno']], fine: 585 },
  burgundi:  { nome: 'Burgundi', peso: 4, t: [[235, 14.5, 51.5, 'fuori'], [357, 10, 50, 'fuori'], [418, 8.4, 49.6, 'federati'], [451, 6.1, 46.2, 'federati'], [472, 4.9, 45.8, 'regno']], fine: 534 },
  franchi:   { nome: 'Franchi', peso: 7, t: [[235, 7.4, 52.2, 'fuori'], [358, 5.2, 51.4, 'federati'], [476, 3.6, 50.2, 'regno'], [493, 3.2, 49.3, 'regno'], [537, 2.4, 48.8, 'regno']], fine: 852 },
  alamanni:  { nome: 'Alamanni', peso: 4, t: [[235, 10.5, 49.6, 'fuori'], [260, 9.2, 48.5, 'fuori'], [406, 8.2, 47.9, 'fuori']], fine: 506 },
  /* gli Unni: l'avanzata verso ovest è ciò che mette in moto i Goti nel 376 (Ammiano XXXI 2-3); per il 405-406 è la tesi di Heather, discussa. Date: Don verso il 370, Dnestr nel 376,
     basso Danubio verso il 400 (Uldino), pianura ungherese negli anni 420 (ma c'è chi la anticipa) */
  unni:      { nome: 'Unni', peso: 8, t: [[370, 38.4, 47.2, 'fuori'], [375, 33.5, 47, 'fuori'], [376, 29.5, 47, 'fuori'], [400, 26, 44.6, 'fuori'], [425, 20.2, 47, 'fuori', [[23.6, 45.8]]],
    [451, 4.4, 48.9, 'armi', [[16.6, 47.6], [14.3, 48.3], [11.5, 48.9], [8.27, 50], [6.18, 49.12], [1.9, 47.9]]],                   // Metz, Orléans, poi i Campi Catalaunici
    [451.9, 19.5, 47.3, 'fuori', [[6.18, 49.12], [8.27, 50], [14.3, 48.3]]],
    [452, 10.75, 45.25, 'armi', [[17.9, 46.5], [14.5, 46.05], [13.37, 45.77], [9.19, 45.46], [9.16, 45.19]]],                       // Aquileia, Milano, Pavia, il Mincio
    [453, 20.2, 47, 'fuori', [[13.37, 45.77], [14.5, 46.05], [17.9, 46.5]]]], fine: 454 },
  sassoni:   { nome: 'Angli e Sassoni', peso: 4, t: [[235, 9.2, 54, 'fuori'], [409, 8.5, 53.8, 'fuori'], [451, 0.6, 52.4, 'armi'], [568, 0.6, 52.4, 'regno']], fine: 852 },      // il tratto verso la Britannia è davvero per mare
  longobardi:{ nome: 'Longobardi', peso: 7, t: [[235, 10.6, 53.3, 'fuori'], [493, 16.2, 48.4, 'fuori'], [546, 18, 46.9, 'federati'], [568, 13.4, 46.1, 'armi', [[16.37, 45.9], [14.5, 46.05], [14.07, 45.9]]], [572, 9.2, 45.2, 'regno']], fine: 774 },
  avari:     { nome: 'Avari', peso: 5, t: [[562, 28.5, 45.3, 'fuori'], [568, 19.5, 46.8, 'regno', [[26, 45.7], [23.6, 46.77], [21.3, 46.2]]]], fine: 796 },
  bulgari:   { nome: 'Bulgari', peso: 5, t: [[663, 38.4, 46.8, 'fuori'], [680, 29.3, 45.4, 'fuori', [[34, 46.8], [31, 46.7]]], [681, 27.12, 43.38, 'regno', [[28.2, 45.2], [27.9, 44.2]]]], fine: 852 }
};
const out = { w: W, h: H, terra: tracciato(TERRA), regioni: {}, citta: {}, popoli: {} };
for (const [id, q] of Object.entries(POPOLI)) out.popoli[id] = { nome: q.nome, poi: q.poi || [], peso: q.peso, fine: q.fine, t: q.t.map(v => { const p = proj([v[1], v[2]]), o = [v[0], f1(p[0]), f1(p[1]), v[3]]; if (v[4]) o.push(v[4].map(c => { const w = proj(c); return [f1(w[0]), f1(w[1])]; })); return o; }) };
for (const [id, r] of Object.entries(REGIONI)) {
  const m = forma(r);
  let area = 0, tot = 0, cx = 0, cy = 0;                // baricentro del pezzo più grande, per l'etichetta; la superficie pesa la quota di territorio
  for (const pol of m) {
    const a = pol[0]; let A = 0, x = 0, y = 0;
    for (let i = 0; i < a.length - 1; i++) { const k = a[i][0] * a[i + 1][1] - a[i + 1][0] * a[i][1]; A += k; x += (a[i][0] + a[i + 1][0]) * k; y += (a[i][1] + a[i + 1][1]) * k; }
    tot += Math.abs(A) / 2;
    if (Math.abs(A) > area) { area = Math.abs(A); cx = x / (3 * A); cy = y / (3 * A); }
  }
  out.regioni[id] = { nome: r.nome, peso: Math.round(tot), est: !!r.est, oltre: !!r.terra, d: tracciato(m), c: [f1(cx), f1(cy)] };
}
for (const [id, c] of Object.entries(CITTA)) { const p = proj([c[0], c[1]]); out.citta[id] = { nome: c[2], x: f1(p[0]), y: f1(p[1]) }; }

out.verdun = { linee: VERDUN.linee.map(l => 'M' + l.map(c => { const p = proj(c); return f1(p[0]) + ' ' + f1(p[1]); }).join('L')), nomi: VERDUN.nomi.map(n => { const p = proj([n[0], n[1]]); return [f1(p[0]), f1(p[1]), n[2]]; }) };
const dest = new URL('../../js/mappa-dati.js', import.meta.url);
fs.writeFileSync(dest, '/* Generato da src/mappa/genera.mjs: non modificare a mano. */\nwindow.RM_MAPPA=' + JSON.stringify(out) + ';\n');
console.log('mappa-dati.js', Math.round(fs.statSync(dest).size / 1024) + ' kB,', Object.keys(out.regioni).length, 'regioni');
for (const [id, r] of Object.entries(out.regioni)) console.log(' ', id.padEnd(11), String(r.d.length).padStart(6), 'car.', r.c.join(','));
