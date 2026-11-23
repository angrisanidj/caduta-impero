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
   I VERTICI SONO INDICATIVI: seguono fiumi, crinali e città nominati dalle fonti, ma le coordinate sono messe a mano, non prese da un atlante.
   Controllo del 21 novembre 2026, sera: ogni ritaglio è stato provato come elenco di città (coordinate di Wikidata, prova punto-in-poligono): le città che ne facevano parte
   cadono dentro, le vicine che non ne facevano parte fuori. Corretti così Settimania (Arles e la Camargue restano fuori), Napoli (dentro Amalfi e Capri), corridoio (dentro Narni,
   Otricoli, Città di Castello), Tuscia (dentro Bomarzo), Galles (la linea del vallo di Offa dal Dee al Wye) e le linee di Verdun. Restano discussi, e lasciati com'erano:
   Gaeta (del ducato di Napoli ma staccata), Nola, Orvieto, Cordova, Granada e Cadice nella Spania, Dol in Bretagna, l'estensione del dominio di Siagrio, i confini di Sassonia,
   Frisia e Turingia, la frontiera della marca di Spagna. */
const TAGLI = {
  decumati:  [[7.62, 47.56], [7.55, 48], [7.75, 48.58], [8.1, 48.9], [8.4, 49.3], [8.27, 50], [7.9, 50], [7.6, 50.36], [9, 51], [11.5, 50.6], [12.6, 49.3], [12.1, 49.02], [11.77, 48.85], [10.9, 48.7], [10, 48.4], [10.1, 47.9], [9.6, 47.55], [9, 47.67], [8.2, 47.6]],
  burgundia: [[3.1, 47.05], [5.3, 48], [7.62, 47.56], [8.3, 47.5], [8.35, 46.55], [6.9, 45.1], [5.95, 44.2], [4.8, 43.95], [4.1, 45.4], [3.8, 46.3]],      // da Nevers e Langres a Basilea, e a sud fino alla Durance (confine dal 508-509)
  sapaudia:  [[5.75, 46.25], [6.4, 46.95], [7.1, 46.95], [7.4, 46.45], [6.8, 45.85], [6.1, 45.6], [5.7, 45.75]],                                             // attorno a Ginevra: la sede data ai Burgundi nel 443 (estensione discussa)
  gallaecia: [[-10.5, 44.6], [-5.9, 44.6], [-5.9, 41.9], [-6.6, 41.2], [-10.5, 41]],
  asturie:   [[-9.3, 43.9], [-3.1, 43.7], [-3.2, 43], [-4.6, 42.85], [-5.9, 42.75], [-7, 42.1], [-8.2, 41.85], [-8.9, 41.85]],                               // Asturie e Cantabria: il nucleo del regno (Cangas de Onís, Covadonga)
  marca:     [[0.5, 42.9], [0.5, 42.4], [0.75, 42.15], [1.3, 41.95], [1.65, 41.85], [1.85, 41.55], [2.1, 41.3], [3.4, 41.6], [3.4, 42.9]],                    // la marca di Spagna fino al Llobregat (Barcellona 801)
  spania:    [[-6.3, 36.75], [-5.85, 36.85], [-4.6, 37.15], [-3.15, 37.4], [-2.6, 37.65], [-1.6, 38.05], [-0.6, 38.35], [0.3, 38.5], [0.3, 35.9], [-6.3, 35.9]],  // la costa bizantina da Cadice a Cartagena, 552-624 circa
  settimania:[[4.42, 43.2], [4.42, 43.45], [4.58, 43.68], [4.6, 43.8], [4.68, 44.3], [4, 44.3], [3.3, 43.95], [2.6, 43.55], [2, 43.3], [1.85, 42.6], [1.85, 42.3], [3.3, 42.3]],          // la Narbonese a ovest del Rodano, senza Tolosa
  tolosano:  [[0.5, 44.3], [1.1, 44.1], [1.7, 43.9], [2.6, 43.55], [2, 43.3], [1.85, 42.6], [0.6, 42.6], [0.5, 43.4]],                                        // Tolosa: nel 200 sta nella Narbonese, ma dal 418 è la capitale dei Visigoti d'Aquitania
  alvernia:  [[0.95, 47.45], [0.95, 46.6], [0.85, 45.5], [1.15, 44.95], [1.05, 44.1], [2.6, 43.55], [3.9, 44.4], [4.1, 46.05], [3.1, 47], [2.8, 47.6]],       // l'Aquitania prima (Bourges, Clermont, Limoges): romana fino al 475
  soissons:  [[1.4, 50.2], [3, 49.95], [3.7, 49.8], [4.5, 49.65], [5, 49.2], [5, 48], [1.4, 48]],                                                             // la parte di Belgica che resta a Siagrio fino al 486 (quanto fosse grande è discusso)
  bretagna:  [[-1.95, 48.75], [-2, 48.1], [-2.1, 47.6], [-2.5, 47.3], [-5.5, 47.3], [-5.5, 48.9], [-3.5, 49.1]],                                              // a ovest della Rance e della Vilaine
  galles:    [[-3.25, 53.45], [-3.12, 53.25], [-3.05, 52.9], [-3.15, 52.5], [-3, 52], [-2.68, 51.85], [-2.62, 51.62], [-2.65, 51.5], [-5.6, 51.4], [-5.2, 53.6]],                                              // a ovest del vallo di Offa
  cornovaglia:[[-4.2, 50.3], [-4.25, 50.7], [-4.55, 50.95], [-6.5, 50.9], [-6.5, 49.8], [-4.2, 49.8]],                                                        // a ovest del Tamar
  mauri:     [[5, 35.3], [6, 35.55], [7.2, 35.35], [8.3, 35.15], [9.3, 34.9], [10.3, 34], [11.3, 33.1], [13.2, 32.7], [15.5, 31.8], [15.5, 28.5], [5, 28.5]],  // l'interno (Aurès, predeserto, Tripolitania interna): dai regni mauri degli anni 480
  liguria:   [[7.5, 43.78], [7.75, 44.1], [8.3, 44.3], [8.95, 44.55], [9.5, 44.45], [10, 44.2], [10.1, 44], [10, 43.5], [7.5, 43.5]],                         // la costa ligure, bizantina fino a Rotari (643)
  venezia:   [[12.2, 45.1], [12.15, 45.45], [12.55, 45.62], [12.95, 45.72], [13.45, 45.75], [13.6, 45.6], [12.5, 45]],                                        // le lagune
  istria:    [[13.5, 45.6], [13.95, 45.6], [14.25, 45.35], [14.1, 44.8], [13.5, 44.8]],
  romagna:   [[10.85, 43.6], [10.85, 44], [11, 44.6], [11.4, 44.95], [11.4, 45.3], [13, 45.3], [13, 43.6]],                                                   // la Regio VIII a est del Panaro: l'Esarcato (Bologna, Ravenna, Rimini)
  bolognese: [[10.85, 43.6], [10.85, 44], [11, 44.6], [11.4, 44.95], [11.4, 45.3], [11.95, 45.3], [11.95, 44.75], [12, 44.4], [12, 43.6]],                 // Bologna, Imola, Faenza, Ferrara: fuori dalla donazione del 756 (Faenza e Ferrara al papa nel 757, il resto nel 774)
  pentapoli: [[12.4, 44.05], [12.25, 43.75], [12.45, 43.35], [12.75, 43.25], [13.15, 43.35], [13.5, 43.4], [13.65, 43.55], [13.3, 44.05]],                    // da Pesaro ad Ancona
  corridoio: [[12.15, 43.5], [12.35, 43.5], [12.55, 43.3], [12.5, 43.2], [12.5, 42.75], [12.58, 42.5], [12.5, 42.38], [12.3, 42.42], [12.3, 42.75], [12.2, 43.1]],                                        // Perugia, Todi, Amelia: la striscia che tiene uniti Ravenna e Roma
  tuscia:    [[11.6, 41.6], [11.6, 42.2], [11.8, 42.2], [12.05, 42.3], [12.2, 42.33], [12.2, 42.52], [12.32, 42.52], [12.4, 42.45], [12.9, 42.45], [12.9, 41.6]],                           // l'Etruria a sud di Blera, Sutri e Orte: con Roma dal VI secolo
  campania:  [[13.76, 41], [13.78, 41.25], [13.95, 41.42], [14.1, 41.55], [15.3, 41.6], [15.3, 40.3], [13.76, 40.3]],                                         // la Regio I a est del Garigliano
  napoli:    [[13.95, 41], [14.3, 40.98], [14.55, 40.85], [14.72, 40.62], [14.35, 40.5], [14.15, 40.5], [13.8, 40.68]],                                                     // il ducato di Napoli, con Sorrento e Amalfi
  bruzio:    [[15.6, 39.2], [16.1, 39.15], [16.35, 39.2], [16.5, 39.5], [16.75, 39.7], [17.3, 39.6], [17.3, 37.8], [15.5, 37.8]],                              // la Calabria di oggi a sud di Cosenza
  salento:   [[17.15, 40.55], [17.6, 40.6], [17.95, 40.7], [18.2, 40.7], [18.6, 40.1], [18.4, 39.7], [17.2, 40.2]],                                           // bizantino fino al 687 circa
  otranto:   [[17.95, 40.3], [18.5, 40.3], [18.6, 39.75], [17.95, 39.95]],                                                                                    // Otranto e Gallipoli, che restano all'impero
  carantania:[[14.48, 48.25], [14.45, 47.75], [13.7, 47.4], [13.3, 47.05], [12.3, 46.75], [12.9, 46.55], [14, 46.45], [16.1, 46.8], [16.5, 47.7], [16.9, 48.15]],  // a est dell'Enns: Avari e Slavi dal 568
  creta:     [[23, 34.6], [26.6, 34.6], [26.6, 35.9], [23, 35.9]],
  corsica:   [[8.2, 41.32], [9.9, 41.32], [9.9, 43.2], [8.2, 43.2]],
  nisibi:    [[40.95, 38.4], [46, 38.4], [46, 33.5], [41.0, 33.5], [41.0, 36.6], [40.92, 37.1]],      // a est di Dara: Nisibi e Singara, cedute da Gioviano nel 363 (Ammiano XXV 7, 9); Dara e il Khabur restano romani. Confine indicativo
  baleari:   [[1.0, 38.5], [4.6, 38.5], [4.6, 40.3], [1.0, 40.3]]                                                                                                         // a nord delle Bocche di Bonifacio
};
const BURG = ['Lugdunensis', 'Germania Superior', 'Belgica', 'Narbonensis', 'Alpes Graiae et Poeninae', 'Alpes Cottiae', 'Alpes Maritimae'];      // anche la punta sud della Belgica (Langres): altrimenti resta un buco
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
  hispania:   { nome: 'Hispania', prov: ['Tarraconensis', 'Baetica', 'Lusitania'], fuori: ['gallaecia', 'asturie', 'marca', 'spania', 'baleari'] },
  baleari:    { nome: 'Baleari', prov: ['Tarraconensis'], dentro: 'baleari' },      // seguono la Sardegna fino al VII secolo, poi restano a sé
  gallaecia:  { nome: 'Gallaecia', prov: ['Tarraconensis', 'Lusitania'], dentro: 'gallaecia' },
  asturie:    { nome: 'Asturie e Cantabria', prov: ['Tarraconensis'], dentro: 'asturie', fuori: ['gallaecia'] },
  marca:      { nome: 'Marca di Spagna', prov: ['Tarraconensis'], dentro: 'marca' },
  spania:     { nome: 'Spania', prov: ['Tarraconensis', 'Baetica'], dentro: 'spania' },
  italia_nord:{ nome: 'Italia del nord', prov: ['IX', 'X', 'XI', 'VII'], fuori: ['tuscia', 'liguria', 'venezia', 'istria', 'corridoio'], piu: [{ prov: ['VIII'], fuori: ['romagna'] }] },
  liguria:    { nome: 'Liguria marittima', prov: ['IX', 'VII'], dentro: 'liguria' },
  venezia:    { nome: 'Lagune venete e Istria', prov: ['X'], dentro: 'venezia', piu: [{ prov: ['X'], dentro: 'istria' }] },
  ravenna:    { nome: 'Romagna e Ravenna', prov: ['VIII'], dentro: 'romagna', fuori: ['bolognese'] },
  bolognese:  { nome: 'Bologna, Imola e Ferrara', prov: ['VIII'], dentro: ['romagna', 'bolognese'] },
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
  sardegna:   { nome: 'Sardegna', prov: ['Sardinia et Corsica'], fuori: ['corsica'] },
  corsica:    { nome: 'Corsica', prov: ['Sardinia et Corsica'], dentro: 'corsica' },      // dall'VIII secolo le due isole hanno storie diverse
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
  levante:    { nome: 'Siria e Palestina', prov: ['Syria', 'Iudaea', 'Arabia', 'Armenia Mesopotamia'], fuori: ['nisibi'], est: true },
  nisibi:     { nome: 'Nisibi e Singara', prov: ['Armenia Mesopotamia', 'Syria'], dentro: 'nisibi', est: true },
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
  linee: [[[3.55, 51.45], [3.7, 51.05], [3.4, 50.6], [2.95, 50.45], [2.7, 50.3], [2.95, 50.1], [3.9, 49.9], [4.4, 49.7], [4.9, 49.3], [5.1, 48.1], [5, 47.1], [4.83, 45.75], [4.75, 44.3], [4.65, 43.81], [4.58, 43.68], [4.42, 43.44]],      // a Lotario Arras, Cambrai, Verdun, Lione, Vienne, Arles; a Carlo Reims, Laon, Amiens, Mâcon
          [[6.1, 51.85], [6.47, 51.66], [6.73, 51.42], [6.75, 51.22], [6.96, 50.94], [7.12, 50.73], [7.62, 50.36], [7.9, 49.97], [7.6, 49.6], [8.2, 48.97], [7.6, 47.56], [8.2, 47.55], [7.9, 46.6], [8.4, 46.5]]],     // a Lotario Colonia, Bonn, Coblenza, Strasburgo; a Ludovico Magonza, Worms, Spira (Langres, Digione e Basilea: non nominate dalla fonte)
  nomi: [[0.3, 46.6, 'Carlo il Calvo'], [6.1, 46.9, 'Lotario'], [10.6, 50.3, 'Ludovico']]
};
/* La tetrarchia (293-305): le aree di comando dei quattro, disegnate come Verdun ma senza linee a mano: i tratti sono i bordi comuni dei gruppi di regioni qui sotto,
   calcolati più giù (confiniFra). Non erano Stati né confini fissi: l'impero restava uno e le leggi uscivano a nome di tutti (l'editto dei prezzi del 301 porta i quattro nomi).
   Fonti lette il 22 novembre 2026:
   - Aurelio Vittore, Caesares 39, 30 (thelatinlibrary.com/victor.caes.html): «quadripartito imperio cuncta, quae trans Alpes Galliae sunt, Constantio commissa, Africa Italiaque Herculio,
     Illyrici ora adusque Ponti fretum Galerio; cetera Valerius retentavit». Nel testo letto si legge «quadripartito», non «quasi partito».
   - Lattanzio, De mortibus persecutorum 7, 2 («in quattuor partes orbe diviso») e 8, 3 (thelatinlibrary.com/lactantius/demort.shtml): Massimiano tiene l'Italia
     «subiacerentque opulentissimae provinciae, vel Africa vel Hispania». È l'unico contemporaneo che nomina la Hispania.
   - Eutropio IX 22 (thelatinlibrary.com/eutropius/eutropius9.shtml): Carausio, poi Alletto, tengono le Britannie; «Britanniae decimo anno receptae» (296). La Britannia quindi non entra
     nell'area di Costanzo: nel 293 la carta la colora come usurpata (CAMBI in js/dati.js), e fra Gallia e Britannia c'è il mare.
   Dove gli studiosi divergono (e la carta lo dice con un tratto a trattini, `discussa`):
   - la Hispania: con Massimiano per Lattanzio; con Costanzo in altri quadri moderni (Encyclopaedia Britannica, voce Diocletian: Costanzo con Gallia, Spagna e Britannia). Qui sta con Massimiano
     e il tratto dei Pirenei è a trattini.
   - la Tracia: a Galerio se «fino allo stretto del Ponto» vale alla lettera (Vittore); a Diocleziano per la Britannica. Qui sta con Galerio e il tratto fra Tracia, Mesia e Macedonia è a trattini.
   - lo schema di Vittore vale più per gli anni dopo il 299: fra il 293 e il 299 Diocleziano sta spesso a Sirmio e sul Danubio e Galerio combatte in Egitto e contro la Persia
     (Barnes, Constantine and Eusebius, 1981, p. 17, come lo riassume la voce Diocletian di Wikipedia in inglese). Lo dice la riga sotto la carta (LUOGHI_TAPPA del 293).
   Approssimazioni: la regione `rezia` unisce Rezia e Norico occidentale, che nei quadri successivi stanno in diocesi diverse (la Rezia con l'Italia, il Norico con la Pannonia):
   sta tutta con Massimiano. La Mauretania Tingitana (nella regione `mauretania`) sta con l'Africa: in ogni ipotesi è di Massimiano. Dacia e Agri Decumates nel 293 sono perduti e non entrano. */
const TETRARCHIA = {
  gruppi: {
    costanzo:    ['gallia', 'bretagna', 'belgica', 'soissons', 'aquitania', 'alvernia', 'provenza', 'settimania', 'burgundia', 'sapaudia'],
    massimiano:  ['italia_nord', 'liguria', 'venezia', 'ravenna', 'bolognese', 'spoleto', 'pentapoli', 'roma', 'campania', 'napoli', 'benevento', 'salento', 'otranto', 'calabria', 'bruzio',
                  'sicilia', 'sardegna', 'corsica', 'rezia', 'africa', 'numidia', 'mauri', 'mauretania'],
    hispania:    ['hispania', 'baleari', 'gallaecia', 'asturie', 'marca', 'spania'],                    // con Massimiano, ma discussa
    galerio:     ['carantania', 'pannonia', 'dalmazia', 'mesia_sup', 'mesia_inf', 'balcani'],
    tracia:      ['tracia'],                                                                          // con Galerio, ma discussa
    diocleziano: ['anatolia', 'levante', 'egitto', 'creta']
  },
  /* le coppie di aree di cui si traccia il bordo comune via terra (gli stretti non contano) */
  linee: [['costanzo', 'massimiano'], ['massimiano', 'galerio'], ['massimiano', 'diocleziano'], ['costanzo', 'hispania', 'discussa'], ['galerio', 'tracia', 'discussa']],
  nomi: [[2.2, 47.3, 'Costanzo', 'cesare', 'costanzo'], [7.6, 35.25, 'Massimiano', 'augusto', 'massimiano', 'hispania'], [22.2, 42.6, 'Galerio', 'cesare', 'galerio', 'tracia'], [33.6, 37.75, 'Diocleziano', 'augusto', 'diocleziano']]      // Massimiano sta in Numidia: l'Italia è già piena di nomi
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

/* I luoghi degli eventi delle tappe (js/dati.js, LUOGHI_TAPPA): [longitudine, latitudine, nome]. Dove l'identificazione è discussa lo dice il testo della tappa, non la carta.
   Abritto è Razgrad; i Campi Catalaunici e il Guadalete sono segnati dove li mette la tradizione; Edessa e Palmira cadono oltre il bordo orientale della carta e si disegnano sul bordo. */
const LUOGHI = { magonza: [8.27, 50.0, 'Magonza'], abritto: [26.52, 43.53, 'Abritto'], edessa: [38.79, 37.15, 'Edessa'], colonia: [6.96, 50.94, 'Colonia'], palmira: [38.27, 34.55, 'Palmira'],
  chalons: [4.37, 48.96, 'Châlons'], catalaunici: [4.2, 48.6, 'Campi Catalaunici'], nicomedia: [29.92, 40.77, 'Nicomedia'], pollenzo: [7.9, 44.68, 'Pollenzo'], gibilterra: [-5.6, 35.95, 'Stretto di Gibilterra'],
  capobon: [11.0, 37.08, 'Capo Bon'],
  /* punti di passaggio delle marce e delle rotte disegnate dalle scene (SCENE_CARTA in js/dati.js): non hanno un cartellino */
  nisibi: [41.22, 37.07, 'Nisibi'], emesa: [36.72, 34.73, 'Emesa'], metz: [6.18, 49.12, 'Metz'], orleans: [1.91, 47.9, 'Orléans'], piacenza: [9.7, 45.05, 'Piacenza'], verona: [10.99, 45.44, 'Verona'],
  napoli: [14.25, 40.85, 'Napoli'], siracusa: [15.29, 37.07, 'Siracusa'], tangeri: [-5.75, 35.9, 'Tangeri'], toledo: [-4.02, 39.86, 'Toledo'], susa: [7.05, 45.14, 'Susa'], lione: [4.83, 45.76, 'Lione'],
  ippona: [7.75, 36.88, 'Ippona'], rimini: [12.57, 44.06, 'Rimini'], tibisco: [20.2, 46.6, 'pianura del Tibisco'], egeo: [25.6, 38.4, 'Egeo'], ionio: [18.6, 37.2, 'Ionio'], tirreno: [11.6, 39.6, 'Tirreno'], oltrereno: [9.6, 50.3, 'oltre il Reno'],
  /* punti che tengono le marce sulla terra e le rotte sul mare (controllati con la linea di costa, 22 novembre 2026) */
  tarifa: [-5.6, 36.0, 'Tarifa'], taza: [-4.0, 34.25, 'Taza'], tlemcen: [-1.32, 34.88, 'Tlemcen'], cesarea: [2.19, 36.4, 'Cesarea'], sitifi: [5.41, 36.19, 'Sitifi'], cirta: [6.61, 36.36, 'Cirta'],
  ostia: [12.2, 41.72, 'Ostia'], marmara: [27.9, 40.75, 'Marmara'], dardanelli: [26.05, 39.95, 'Dardanelli'], matapan: [22.6, 35.6, 'capo Matapan'], messina: [15.52, 38.2, 'Messina'], reggio: [15.68, 38.12, 'Reggio'],
  cosenza: [16.25, 39.3, 'Cosenza'], salerno: [14.8, 40.7, 'Salerno'], catania: [14.9, 37.5, 'Catania'], aspromonte: [16.05, 38.35, 'Aspromonte'], catanzaro: [16.5, 38.88, 'Catanzaro'],
  lagonegro: [15.78, 40.13, 'Lagonegro'], eboli: [15.08, 40.63, 'Eboli'], canale: [14.0, 36.2, 'canale di Sicilia'], cassino: [13.83, 41.49, 'Cassino'], lucca: [10.5, 43.84, 'Lucca'], mediterraneo: [8.5, 39.9, 'Mediterraneo'],
  poitiers: [0.34, 46.58, 'Poitiers'], pamplona: [-1.64, 42.82, 'Pamplona'], bordeaux: [-0.58, 44.84, 'Bordeaux'], pelusio: [32.55, 31.04, 'Pelusio'], cividale: [13.43, 46.09, 'Cividale'], guadalete: [-6.0, 36.6, 'Guadalete'], pavia: [9.16, 45.19, 'Pavia'], aquisgrana: [6.08, 50.78, 'Aquisgrana'],
  /* punti aggiunti con la verifica delle scene sulle fonti (22 novembre 2026; perché ci sono lo dice il commento accanto a ogni scena in SCENE_CARTA). Il Tigri presso Ninive sta al bordo
     orientale della carta, fuori dalle regioni romane: di lì entra la marcia persiana del 260. Ellesponto, Calpe e gli altri sono stati provati contro la linea di costa. */
  tigri: [43.15, 36.35, 'Tigri'], carre: [39.03, 36.87, 'Carre'], ancira: [32.86, 39.93, 'Ancira'], tiana: [34.61, 37.83, 'Tiana'], cabile: [26.48, 42.65, 'Cabile'],
  emona: [14.5, 46.05, 'Emona'], aquileia: [13.37, 45.8, 'Aquileia'], asti: [8.2, 44.9, 'Asti'], reims: [4.03, 49.26, 'Reims'], amiens: [2.3, 49.89, 'Amiens'],
  novae: [25.39, 43.62, 'Novae'], isonzo: [13.5, 45.88, 'Isonzo'], savaria: [16.62, 47.23, 'Savaria'], spoleto: [12.74, 42.73, 'Spoleto'], narni: [12.52, 42.52, 'Narni'],
  ginevra: [6.14, 46.2, 'Ginevra'], martigny: [7.07, 46.1, 'Martigny'], aosta: [7.32, 45.74, 'Aosta'], ivrea: [7.88, 45.47, 'Ivrea'], calpe: [-5.36, 36.16, 'Gibilterra'],
  propontide: [26.92, 40.46, 'Propontide'], gallipoli: [26.76, 40.4, 'Gallipoli'], lampsaco: [26.66, 40.36, 'Lampsaco'], ellesponto: [26.55, 40.29, 'Ellesponto'], abido: [26.46, 40.2, 'Abido'],
  cicladi: [25.8, 37.92, 'Cicladi'], cicladisud: [25.6, 36.58, 'Cicladi'], malea: [23.31, 36.12, 'capo Malea'], mopsuestia: [35.62, 36.96, 'Mopsuestia'], isso: [36.25, 36.95, 'Isso'], portesirie: [36.22, 36.49, 'Porte Sirie'], lentini: [15.0, 37.29, 'Lentini'],
  /* tappe della storia religiosa del IV secolo (src/testi/tappe-cristianesimo.md): il Frigido è il Vipacco presso Aidussina (identificazione corrente; il punto esatto della battaglia non si conosce); Mursa è Osijek */
  frigido: [13.9, 45.88, 'Frigido'], mursa: [18.69, 45.55, 'Mursa'], torino: [7.68, 45.07, 'Torino'], brescia: [10.22, 45.54, 'Brescia'], modena: [10.93, 44.65, 'Modena'],
  /* la marcia di Giuliano nel 363 (Ammiano XXIII 2-5): Batne è Suruç, Callinico è Raqqa, Circesio è alla foce del Khabur; a Dura la carta finisce, Ctesifonte sta oltre il bordo */
  ierapoli: [37.95, 36.53, 'Ierapoli'], batne: [38.42, 36.98, 'Batne'], callinico: [39.02, 35.95, 'Callinico'], circesio: [40.45, 35.17, 'Circesio'], dura: [40.73, 34.75, 'Dura'],
  /* le scene «a passi» (PASSI_CARTA in js/dati.js, 23 novembre 2026; fonti accanto a ogni passo). Il Don cade oltre il bordo e si disegna sul bordo; il passaggio del Danubio a Durostoro
     è uno schema (Ammiano non dice dove); il Mincio è l'«ager Ambuleius» di Giordane (Getica 223), di posizione incerta; il Piceno, l'Arabia e la Sirte sono punti di una regione, non città */
  don: [39.6, 47.25, 'Don'], dnestr: [29.6, 46.85, 'Dnestr'], durostoro: [27.27, 44.12, 'Durostoro'], marcianopoli: [27.58, 43.22, 'Marcianopoli'],
  concordia: [12.84, 45.76, 'Concordia'], altino: [12.42, 45.54, 'Altino'], cremona: [10.03, 45.13, 'Cremona'], bologna: [11.34, 44.49, 'Bologna'], piceno: [13.3, 43.35, 'Piceno'], mincio: [10.75, 45.2, 'Mincio'],
  gerusalemme: [35.23, 31.78, 'Gerusalemme'], damasco: [36.3, 33.51, 'Damasco'], yarmuk: [35.95, 32.75, 'Yarmuk'], arabia: [37.4, 30.4, 'Arabia'], gaza: [34.47, 31.45, 'Gaza'],
  babilonia: [31.23, 30.0, 'Babilonia d\'Egitto'], barca: [20.9, 32.45, 'Barca'], sinai: [33.4, 30.85, 'Sinai'], delta: [31.85, 30.75, 'Delta'], mareotide: [29.95, 30.75, 'Mareotide'], sirte2: [16.0, 30.75, 'Sirte'], marmarica1: [28.6, 30.6, 'Marmarica'], marmarica2: [25.6, 31.25, 'Marmarica'], cirenaica: [23.4, 31.85, 'Cirenaica'],
  misurata: [14.9, 32.0, 'Misurata'], leptis: [14.0, 32.45, 'Leptis'], giado: [11.6, 32.55, 'Tripolitania'], medenine: [10.45, 33.3, 'Medenine'], gafsa: [9.45, 34.35, 'Bizacena'], dnepr: [34.5, 47.5, 'Dnepr'], agedabia: [20.22, 30.6, 'Agedabia'], agheila: [19.1, 30.0, 'El Agheila'], sirte: [16.6, 31.1, 'Sirte'], tripoli: [13.18, 32.85, 'Tripoli'], qayrawan: [10.1, 35.68, 'Qayrawan'], tours: [0.69, 47.39, 'Tours'],
  /* lo schieramento ai Campi Catalaunici (Giordane, Getica 197-198): da dove vengono le tre ali e gli Unni è uno schema (l'orientamento del campo non è detto) */
  /* tappe nuove del 23 novembre 2026: Clodoveo (Gregorio di Tours II 27, 37-38: Soissons, «in campo Vogladense decimo ab urbe Pictava miliario», Bordeaux, Tolosa, Tours), la fine dei Goti
     (Procopio VIII 29-35: Tagina, oggi presso Gualdo Tadino, e il monte Lattaro, ai piedi del Vesuvio: il punto esatto delle due battaglie è discusso) e Agostino (Beda I 23-25: Arles, Thanet, Canterbury;
     la strada per la Gallia è uno schema). Vouillé è il luogo della tradizione; c'è chi propone Voulon. */
  soissonsc: [3.32, 49.38, 'Soissons'], vouille: [0.17, 46.64, 'Vouillé'], parigi: [2.35, 48.86, 'Parigi'], tagina: [12.77, 43.23, 'Tagina'], lattaro: [14.6, 40.73, 'Monte Lattaro'],
  thanet: [1.35, 51.36, 'Thanet'], canterbury: [1.08, 51.28, 'Canterbury'], genova: [8.93, 44.41, 'Genova'], autun: [4.3, 46.95, 'Autun'], capovada: [11.15, 35.23, 'Caputvada'], decimo: [10.22, 36.77, 'Decimum'], malta: [14.45, 35.88, 'Malta'],      /* 534: Caputvada (Ras Kaboudia) e Decimum, «seventy stades» da Cartagine (Procopio III 14 e 18); Malta solo come passaggio della flotta */ verdun: [5.38, 49.16, 'Verdun'], mazara: [12.59, 37.65, 'Mazara'],      /* 843 */ lerins: [7.05, 43.51, 'Lérins'], aix: [5.45, 43.53, 'Aix'], vienne: [4.87, 45.53, 'Vienne'], marligure: [8.4, 43.55, 'Mar Ligure'], tirrenonord: [10.6, 42.45, 'Tirreno'],      /* 597: le lettere di Gregorio Magno per i monaci di Agostino (Registrum VI 50a-57, luglio 596) vanno all'abate di Lérins e ai vescovi di Aix, Arles, Vienne, Lione e Autun */ boulogne: [1.61, 50.73, 'Boulogne'], manica: [1.45, 51.0, 'Manica'],
  /* la Britannia a passi (Zosimo VI 2-5 e 10; Cronaca gallica del 452; Gildas 23-26): Dover e York servono a inquadrare e a passare il mare; l'Anglia orientale e la Frisia
     sono i due capi, schematici, delle incursioni e dell'arrivo dei Sassoni; la Cornovaglia segna l'ovest rimasto ai Britanni */
  dover: [1.25, 51.15, 'Dover'], york: [-1.08, 53.96, 'York'], cornovaglia: [-4.9, 50.45, 'Cornovaglia'], frisiac: [6.9, 53.3, 'Frisia'], rivafrisia: [6.1, 53.42, 'Frisia'], rivaanglia: [1.72, 52.62, 'Anglia orientale'], marenord: [3.2, 53.1, 'Mare del Nord'], anglia: [1.0, 52.55, 'Anglia orientale'],
  fano: [13.0, 43.84, 'Fano'], cesena: [12.24, 44.14, 'Cesena'], urbino: [12.64, 43.73, 'Urbino'], salona: [16.48, 43.54, 'Salona'], tournai: [3.39, 50.61, 'Tournai'], angouleme: [0.16, 45.65, 'Angoulême'], pescara: [13.8, 42.3, 'Abruzzo'], benevento: [14.78, 41.13, 'Benevento'],
  catal_v: [3.05, 48.2, 'Visigoti'], catal_a: [2.85, 48.6, 'Alani'], catal_r: [3.05, 49.0, 'Romani'], catal_s: [3.7, 47.95, 'Unni'], catal_e: [5.3, 48.7, 'Unni'] };

/* Cammini e marce sono stati controllati contro la linea di costa il 22 novembre 2026 (prova nel browser: si campiona ogni tracciato e si chiede a `isPointInFill` della terra):
   per mare restano solo lo stretto di Gibilterra dei Vandali, lo stretto di Messina e il viaggio di Angli e Sassoni, che sono veri. Chi aggiunge un punto rifaccia la prova.
   Rifatta il 22 novembre 2026 dopo la verifica delle scene sulle fonti: la flotta del 468 ora passa per l'Ellesponto vero (Gallipoli, Lampsaco, Abido: la carta semplificata lo lascia aperto
   per un filo) e gira a est delle Cicladi; Aureliano nel 272 gira attorno al golfo di Isso. Restano sulla riva, e vanno bene, i punti di partenza e d'arrivo sulla costa (Costantinopoli,
   Cartagine, Siracusa, Capo Bon, lo sbarco a Gibilterra del 711) e lo stretto di Messina. */
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
    [395, 22.4, 39.6, 'armi', [[26.5, 42.1], [28.3, 41.2], [26.4, 40.95], [25.4, 41.12], [23.85, 40.82], [22.94, 40.64], [22.55, 40.6], [22.4, 40.2], [22.55, 39.9]]],   // sotto Costantinopoli, poi la via Egnazia e Tempe
    [397, 20.1, 41.1, 'federati', [[21.8, 39.6], [20.9, 39.7]]],                                                                    // Epiro (Bury, cap. V)
    [402, 7.9, 44.7, 'armi', [[19.5, 42.1], [18.4, 43.85], [16.37, 45.48], [14.5, 46.05], [13.37, 45.77], [9.19, 45.46], [8.2, 44.9]]],     // Aquileia, Milano, Asti, Pollenzo: Bury; il tratto dall'Epiro a Siscia non è attestato
    [403, 16.37, 45.48, 'federati', [[10.99, 45.44], [13.37, 45.77], [14.5, 46.05]]],                                               // dopo Verona, «fra Dalmazia e Pannonia»
    [406, 20.7, 39.4, 'federati', [[18.4, 43.85], [19.5, 42.1], [20.1, 41.1]]],
    [408, 14.37, 46.7, 'armi', [[20.1, 41.1], [19.5, 42.1], [18.4, 43.85], [16.37, 45.48], [14.5, 46.05]]],                         // Emona e il Norico (Zosimo V 29)
    [409, 12.5, 42.3, 'armi', [[14.5, 46.05], [13.37, 45.77], [12.84, 45.76], [12.42, 45.54], [10.03, 45.13], [11.34, 44.49], [12.57, 44.06], [13.15, 43.5], [13, 42.4], [12.52, 42.52]]],   // autunno 408: Aquileia, Concordia, Altino, Cremona, Bologna, Rimini, il Piceno, Roma (Zosimo V 37, letto)
    [410, 12.5, 41.9, 'armi'],
    [412, 4.9, 44.93, 'armi', [[14.3, 40.95], [14.8, 40.78], [15.1, 40.62], [15.6, 40.1], [16.25, 39.3], [16.5, 38.88], [16.05, 38.35], [15.68, 38.12], [16.05, 38.35], [16.5, 38.88], [16.25, 39.3], [15.6, 40.1], [15.1, 40.62], [14.9, 40.95], [12.48, 41.9], [11.25, 43.77], [10.3, 44.8], [8.6, 44.9], [7.7, 45.07], [6.75, 44.9]]],   // fino a Reggio e ritorno, poi le Alpi (il valico è un'ipotesi)
    [415, 2.17, 41.38, 'armi', [[4.8, 43.95], [3, 43.18], [2.86, 42.46]]],
    [418, 0.4, 44.6, 'federati', [[2.86, 42.46], [3, 43.18], [1.44, 43.6]]],
    [472, 1.4, 43.6, 'regno'], [508, 3, 43.18, 'regno'], [537, -3.6, 40.2, 'regno']], fine: 711 },      // dopo Vouillé la corte lascia Tolosa: Narbona, poi la Hispania
  ostrogoti: { nome: 'Ostrogoti', peso: 8, t: [[235, 33, 47.2, 'fuori'], [378, 30, 46.5, 'fuori'], [455, 18, 46.5, 'federati', [[26, 46.5], [22, 47]]], [476, 25.4, 43.6, 'federati', [[20.46, 44.82], [22.88, 43.99]]],
    [493, 12.2, 44.42, 'regno', [[22.88, 43.99], [21.2, 44.73], [20.46, 44.82], [19.61, 44.97], [19, 45.3], [14.5, 46.05], [13.6, 45.85], [10.99, 45.44], [9.19, 45.46], [9.5, 45.4]]]], fine: 554 },   // 488-493: da Novae per Sirmio all'Isonzo, Verona, Milano, l'Adda (11 agosto 490), Ravenna: Giordane, Getica 292-293, e Anonimo Valesiano 49-54. Singidunum e Ulca vengono da Ennodio (a memoria); fra Sirmio ed Emona il tracciato è un'ipotesi
  vandali:   { nome: 'Vandali e Alani', peso: 7, t: [[235, 20, 49.6, 'fuori'], [402, 15.5, 48.9, 'fuori'],
    [406, 8.27, 50, 'armi', [[12.1, 49.02], [9.93, 49.79]]],                                                                        // lungo Danubio e Meno (ipotesi); Magonza è il passaggio più citato
    [409, -1.65, 42.8, 'armi', [[4.03, 49.25], [2.3, 49.9], [1.9, 47.9], [0.6, 44.2], [-1.32, 43.01]]],                             // Reims e Amiens (Girolamo, lettera 123), poi l'Aquitania e i Pirenei, autunno 409 (Idazio)
    [418, -6.5, 42.5, 'armi', [[-3.7, 42.35], [-5.57, 42.6]]], [420, -5.5, 37.5, 'armi', [[-6.3, 40], [-6.34, 38.92]]],
    [429, 5.4, 36.19, 'armi', [[-5.6, 36.02], [-5.75, 35.9], [-5.6, 35.2], [-4.0, 34.25], [-1.32, 34.88], [0.6, 35.5], [2.23, 36.3]]],               // lo stretto è l'unico tratto per mare
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
  longobardi:{ nome: 'Longobardi', peso: 7, t: [[235, 10.6, 53.3, 'fuori'], [493, 16.2, 48.4, 'fuori'], [546, 18, 46.9, 'federati'], [568, 13.4, 46.1, 'armi', [[15.87, 46.42], [14.5, 46.05], [14.07, 45.9]]], [572, 9.2, 45.2, 'regno']], fine: 774 },
  avari:     { nome: 'Avari', peso: 5, t: [[562, 28.5, 45.3, 'fuori'], [568, 19.5, 46.8, 'regno', [[26, 45.7], [23.6, 46.77], [21.3, 46.2]]]], fine: 796 },
  bulgari:   { nome: 'Bulgari', peso: 5, t: [[663, 38.4, 47.7, 'fuori'], [680, 29.3, 45.4, 'fuori', [[36.5, 47.5], [34, 47.3], [31.5, 47.1], [30.1, 46.4]]], [681, 27.12, 43.38, 'regno', [[28.2, 45.2], [27.9, 44.2]]]], fine: 852 }
};
const out = { w: W, h: H, terra: tracciato(TERRA), regioni: {}, citta: {}, popoli: {} };
for (const [id, q] of Object.entries(POPOLI)) out.popoli[id] = { nome: q.nome, poi: q.poi || [], peso: q.peso, fine: q.fine, t: q.t.map(v => { const p = proj([v[1], v[2]]), o = [v[0], f1(p[0]), f1(p[1]), v[3]]; if (v[4]) o.push(v[4].map(c => { const w = proj(c); return [f1(w[0]), f1(w[1])]; })); return o; }) };
const FORME = {};
for (const [id, r] of Object.entries(REGIONI)) {
  const m = forma(r); FORME[id] = m;
  let area = 0, tot = 0, cx = 0, cy = 0;                // baricentro del pezzo più grande, per l'etichetta; la superficie pesa la quota di territorio
  for (const pol of m) {
    const a = pol[0]; let A = 0, x = 0, y = 0;
    for (let i = 0; i < a.length - 1; i++) { const k = a[i][0] * a[i + 1][1] - a[i + 1][0] * a[i][1]; A += k; x += (a[i][0] + a[i + 1][0]) * k; y += (a[i][1] + a[i + 1][1]) * k; }
    tot += Math.abs(A) / 2;
    if (Math.abs(A) > area) { area = Math.abs(A); cx = x / (3 * A); cy = y / (3 * A); }
  }
  out.regioni[id] = { nome: r.nome, peso: Math.round(tot), est: !!r.est, oltre: !!r.terra, d: tracciato(m), c: [f1(cx), f1(cy)] };
}
out.luoghi = {};
for (const [id, c] of Object.entries(LUOGHI)) { const p = proj([c[0], c[1]]); out.luoghi[id] = { nome: c[2], x: f1(p[0]), y: f1(p[1]) }; }
for (const [id, c] of Object.entries(CITTA)) { const p = proj([c[0], c[1]]); out.citta[id] = { nome: c[2], x: f1(p[0]), y: f1(p[1]) }; }

out.verdun = { linee: VERDUN.linee.map(l => 'M' + l.map(c => { const p = proj(c); return f1(p[0]) + ' ' + f1(p[1]); }).join('L')), nomi: VERDUN.nomi.map(n => { const p = proj([n[0], n[1]]); return [f1(p[0]), f1(p[1]), n[2]]; }) };
/* Il bordo comune di due aree della tetrarchia: si percorre il contorno dell'area A, lato per lato; un lato è «comune» se, a 2 o 3,5 unità dal suo punto medio,
   da una parte si esce da A e si entra in B (le province dell'atlante, sfoltite una per una, non combaciano al decimo di unità). I lati comuni consecutivi fanno una linea;
   le linee sotto le 8 unità (scogli, sbavature) si scartano. Gli stretti larghi più di 3,5 unità restano fuori da soli. */
function dentroMulti(m, x, y) { let d = false; for (const pol of m) for (const a of pol) for (let i = 0, j = a.length - 1; i < a.length; j = i++) { const [xi, yi] = a[i], [xj, yj] = a[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; }
function confiniFra(A, B) {
  const linee = [];
  for (const pol of A) for (const a of pol) {
    const n = a.length - 1, comune = [];
    for (let i = 0; i < n; i++) {
      const p = a[i], q = a[i + 1], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, nx = -(q[1] - p[1]) / l, ny = (q[0] - p[0]) / l;
      let si = false;
      for (const d of [2, 3.5]) for (const s of [1, -1]) { const x = mx + s * nx * d, y = my + s * ny * d; if (!dentroMulti(A, x, y) && dentroMulti(B, x, y)) si = true; }
      comune.push(si);
    }
    let i0 = comune.indexOf(false); if (i0 < 0) { linee.push(a); continue; }      // tutto il contorno è comune (un'enclave)
    let corsa = null;
    for (let k = 1; k <= n; k++) {
      const i = (i0 + k) % n;
      if (comune[i]) { if (!corsa) corsa = [a[i]]; corsa.push(a[i + 1]); }
      else if (corsa) { linee.push(corsa); corsa = null; }
    }
    if (corsa) linee.push(corsa);
  }
  return linee.filter(l => { let s = 0; for (let i = 1; i < l.length; i++) s += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]); return s >= 8; });
}
{
  const unione = ids => ids.reduce((m, id) => { if (!FORME[id]) throw new Error('regione sconosciuta nella tetrarchia: ' + id); return m.length ? pc.union(m, FORME[id]) : FORME[id]; }, []);
  const G = {}; for (const [k, ids] of Object.entries(TETRARCHIA.gruppi)) G[k] = unione(ids);
  out.tetrarchia = {
    linee: TETRARCHIA.linee.map(([a, b, discussa]) => ({ d: confiniFra(G[a], G[b]).map(l => 'M' + l.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')).join(''), discussa: !!discussa })),
    nomi: TETRARCHIA.nomi.map(n => { const p = proj([n[0], n[1]]); return [f1(p[0]), f1(p[1]), n[2], n[3], n[4], n[5] || '']; }),      // quinto e sesto: l'area del nome e quella discussa, per accenderle al tocco (js/mappa.js)
    gruppi: TETRARCHIA.gruppi
  };
  for (const l of out.tetrarchia.linee) console.log('tetrarchia', l.discussa ? 'discussa' : 'linea', l.d.split('M').length - 1, 'tratti,', l.d.length, 'car.');
}
/* Fiumi: i corsi veri di Natural Earth 1:10m, scelti e sfoltiti da fiumi.mjs (grezzi/fiumi-scelti.json). Reno e Danubio sono il confine dell'impero e hanno il tratto più forte.
   Qui si proiettano e si sfoltiscono ancora: un punto ogni 0,6 unità della carta basta. */
const FIUMI = JSON.parse(fs.readFileSync(new URL('./grezzi/fiumi-scelti.json', import.meta.url), 'utf8'));
const corso = L => L.map(l => { let d = '', u = null; for (const c of l) { const p = proj(c); if (!p || p[0] < -20 || p[0] > W + 20 || p[1] < -20 || p[1] > H + 20) { u = null; continue; } if (u && Math.hypot(p[0] - u[0], p[1] - u[1]) < .6) continue; d += (u ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); u = p; } return d; }).filter(d => d.includes('L')).join('');
const MARI = [[5.6, 39.2, 'Mare Nostrum'], [-8.3, 46.6, 'Oceano'], [18.6, 35.2, 'Mare Interno'], [32.5, 43.4, 'Ponto Eusino']];
const linea = l => 'M' + l.map(c => { const p = proj(c); return f1(p[0]) + ' ' + f1(p[1]); }).join('L');
out.fiumi = [{ d: corso(FIUMI.altri), forte: false }, { d: corso(FIUMI.forti), forte: true }];
out.mari = MARI.map(m => { const p = proj([m[0], m[1]]); return [f1(p[0]), f1(p[1]), m[2]]; });
const dest = new URL('../../js/mappa-dati.js', import.meta.url);
fs.writeFileSync(dest, '/* Generato da src/mappa/genera.mjs: non modificare a mano. */\nwindow.RM_MAPPA=' + JSON.stringify(out) + ';\n');
console.log('mappa-dati.js', Math.round(fs.statSync(dest).size / 1024) + ' kB,', Object.keys(out.regioni).length, 'regioni');
for (const [id, r] of Object.entries(out.regioni)) console.log(' ', id.padEnd(11), String(r.d.length).padStart(6), 'car.', r.c.join(','));
