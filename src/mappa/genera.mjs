/* Base geografica della mappa: coste da Natural Earth (world-atlas), regioni tracciate a mano
   in longitudine/latitudine e ritagliate sulla terraferma. Uso: npm install && npm run build
   I confini delle regioni sono schematici: servono a leggere chi controlla cosa, non sono confini provinciali. */
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

/* regioni: [lon, lat], generose sul mare (il ritaglio le porta sulla costa) */
const ADRIATICO = [[13.2, 45.2], [14.6, 43.9], [16.5, 42.6], [18.6, 41.2], [19, 40]];
const REGIONI = {
  britannia:  { nome: 'Britannia', peso: 6,  p: [[-5.9, 49.8], [1.9, 50.8], [1.9, 53.2], [-1, 55.1], [-3.6, 55.1], [-5.2, 54.4], [-5.4, 51.5], [-5.9, 50.5]] },
  gallia:     { nome: 'Gallie',    peso: 14, p: [[-5.2, 48.9], [-1.5, 50], [1.6, 51.2], [4.2, 52.2], [6.2, 51.8], [6.9, 50.5], [8.2, 49], [7.6, 47.6], [6, 46.5], [2.5, 46.6], [-2.3, 46.8], [-5.2, 47.5]] },
  aquitania:  { nome: 'Aquitania', peso: 6,  p: [[-2.6, 46.8], [2.5, 46.6], [2.5, 43.9], [1.5, 42.6], [-1.9, 43.3], [-1.7, 45]] },
  provenza:   { nome: 'Gallia meridionale', peso: 5, p: [[2.5, 46.6], [6, 46.5], [7.2, 45.2], [7.7, 43.6], [5, 42.8], [3.2, 42.3], [1.5, 42.6], [2.5, 43.9]] },
  hispania:   { nome: 'Hispania',  peso: 20, p: [[-10, 44.2], [-1.9, 43.3], [1.5, 42.6], [3.4, 42.4], [4.6, 39], [0, 36.2], [-5.4, 35.97], [-10, 36]] },
  italia:     { nome: 'Italia',    peso: 13, p: [[6.8, 46], [7.2, 45.2], [7.7, 43.6], [9.9, 43.3], [10, 41.5], [12, 37.2], [15.5, 36.4], [19, 40], ...ADRIATICO.slice().reverse(), [13.8, 46.6], [10.5, 47], [8.5, 46.5]] },
  isole:      { nome: 'Sardegna e Corsica', peso: 2, p: [[8, 43.1], [9.75, 43.1], [9.95, 38.8], [8, 38.8]] },
  rezia:      { nome: 'Rezia e Norico', peso: 5, p: [[7.6, 47.6], [8.5, 46.5], [10.5, 47], [13.8, 46.6], [16.2, 46.7], [16.9, 48.2], [13.4, 48.6], [11, 48.8], [9, 48.2]] },
  illirico:   { nome: 'Pannonia e Dalmazia', peso: 9, p: [[13.8, 46.6], [16.2, 46.7], [16.9, 48.2], [18.9, 47.8], [19, 45.6], [20, 44.9], [19.4, 43.5], [19.6, 41.8], ...ADRIATICO.slice(0, 4).reverse()] },
  africa:     { nome: 'Africa',    peso: 12, p: [[5, 37.7], [11.6, 37.7], [11.6, 34.2], [15.4, 32.8], [19, 31], [19, 29.8], [14, 30.6], [10, 32], [8, 33.6], [5, 34.4]] },
  mauretania: { nome: 'Mauretanie', peso: 8, p: [[-6.4, 35.9], [-5.3, 35.93], [-2.5, 35.9], [0, 37.2], [5, 37.7], [5, 34.4], [-1, 33.8], [-5, 33.3], [-7.2, 33.6]] },
  oriente:    { nome: 'Oriente',   peso: 0,  p: [[20, 44.9], [22.7, 44.6], [23, 43.8], [28, 44.2], [29.7, 45.3], [30, 42.3], [41.5, 42.3], [42, 39], [42, 37.2], [40.5, 36.3], [39, 34.3], [36.6, 32], [35.2, 29.5], [33.5, 28], [35, 24], [32, 24], [30, 26.5], [29, 29.5], [25, 30], [20, 29.8], [19, 31], [19.5, 32.5], [19.2, 39], [19.6, 41.8], [19.4, 43.5]] }
};
const CITTA = { roma: [12.48, 41.89, 'Roma'], ravenna: [12.2, 44.42, 'Ravenna'], milano: [9.19, 45.46, 'Milano'], treviri: [6.64, 49.75, 'Treviri'], arles: [4.63, 43.68, 'Arles'],
  cartagine: [10.32, 36.85, 'Cartagine'], costantinopoli: [28.98, 41.01, 'Costantinopoli'], londra: [-0.1, 51.51, 'Londinium'], sirmio: [19.61, 44.97, 'Sirmio'],
  antiochia: [36.16, 36.2, 'Antiochia'], alessandria: [29.92, 31.2, 'Alessandria'], tolosa: [1.44, 43.6, 'Tolosa'], adrianopoli: [26.56, 41.68, 'Adrianopoli'] };

const out = { w: W, h: H, terra: tracciato(TERRA), regioni: {}, citta: {} };
for (const [id, r] of Object.entries(REGIONI)) {
  const anello = r.p.concat([r.p[0]]).map(p => proj(p));
  const ritaglio = pc.intersection([[anello]], TERRA);
  let area = 0, cx = 0, cy = 0;                         // baricentro del pezzo più grande, per l'etichetta
  for (const pol of ritaglio) {
    const a = pol[0]; let A = 0, x = 0, y = 0;
    for (let i = 0; i < a.length - 1; i++) { const k = a[i][0] * a[i + 1][1] - a[i + 1][0] * a[i][1]; A += k; x += (a[i][0] + a[i + 1][0]) * k; y += (a[i][1] + a[i + 1][1]) * k; }
    if (Math.abs(A) > area) { area = Math.abs(A); cx = x / (3 * A); cy = y / (3 * A); }
  }
  out.regioni[id] = { nome: r.nome, peso: r.peso, d: tracciato(ritaglio), c: [f1(cx), f1(cy)] };
}
for (const [id, c] of Object.entries(CITTA)) { const p = proj([c[0], c[1]]); out.citta[id] = { nome: c[2], x: f1(p[0]), y: f1(p[1]) }; }

const dest = new URL('../../js/mappa-dati.js', import.meta.url);
fs.writeFileSync(dest, '/* Generato da src/mappa/genera.mjs: non modificare a mano. */\nwindow.RM_MAPPA=' + JSON.stringify(out) + ';\n');
console.log('mappa-dati.js', Math.round(fs.statSync(dest).size / 1024) + ' kB,', Object.keys(out.regioni).length, 'regioni');
for (const [id, r] of Object.entries(out.regioni)) console.log(' ', id.padEnd(11), String(r.d.length).padStart(6), 'car.', r.c.join(','));
