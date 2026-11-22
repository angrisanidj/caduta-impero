/* Aree geodetiche (sulla sfera, in migliaia di km²) delle province del Digital Atlas of the Roman Empire, per confrontare
   la superficie della carta con le stime pubblicate (Taagepera 1979). Uso: node aree.mjs */
import fs from 'fs';
import * as d3 from 'd3-geo';

const g = JSON.parse(fs.readFileSync(new URL('./grezzi/provinces.geojson', import.meta.url), 'utf8'));
const R = 6371.0088;
const righe = g.features.map(f => {
  let a = d3.geoArea(f); if (a > 2 * Math.PI) a = 4 * Math.PI - a;          // anelli col verso al contrario
  const b = d3.geoBounds(f);
  return [f.properties.name || f.properties.Name || f.properties.NAME || JSON.stringify(f.properties).slice(0, 50), Math.round(a * R * R / 1000), b[0][1].toFixed(1)];
});
righe.sort((a, b) => b[1] - a[1]);
console.log('campi:', Object.keys(g.features[0].properties).join(', '));
for (const r of righe) console.log(String(r[1]).padStart(6), ' sud ' + r[2].padStart(5), ' ', r[0]);
console.log('totale', righe.reduce((s, x) => s + x[1], 0));

/* Somme per il confronto con Taagepera 1979 (tabella 2): Occidente e Oriente come nel 395 */
const A = Object.fromEntries(righe.map(r => [r[0], r[1]]));
const somma = l => l.reduce((s, n) => { if (!(n in A)) throw new Error('manca ' + n); return s + A[n]; }, 0);
const GRUPPI = {
  'Britannia': ['Britannia'],
  'Gallie e Germanie': ['Aquitania', 'Lugdunensis', 'Belgica', 'Narbonensis', 'Germania Superior', 'Germania Inferior', 'Alpes Graiae et Poeninae', 'Alpes Maritimae', 'Alpes Cottiae'],
  'Spagne': ['Tarraconensis', 'Lusitania', 'Baetica'],
  'Italia e isole': ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'Sicilia', 'Sardinia et Corsica'],
  'Rezia, Norico, Pannonie, Dalmazia': ['Raetia', 'Noricum', 'Pannonia Superior', 'Pannonia Inferior', 'Dalmatia'],
  'Africa (Proconsolare, Numidia, Mauretanie)': ['Africa Proconsularis', 'Numidia', 'Mauretania Caesariensis', 'Mauretania Tingitana'],
};
const EST = ['Aegyptus', 'Galatia et Cappadocia', 'Creta et Cyrene', 'Asia', 'Arabia', 'Thracia', 'Syria', 'Achaia', 'Macedonia', 'Moesia Superior', 'Bithynia et Pontus', 'Moesia Inferior', 'Cilicia', 'Lycia et Pamphylia', 'Iudaea', 'Cyprus'];
let ovest = 0; for (const [n, l] of Object.entries(GRUPPI)) { const v = somma(l); ovest += v; console.log(String(v).padStart(6), ' ', n); }
console.log(String(ovest).padStart(6), '  OCCIDENTE (con gli Agri Decumates, persi verso il 260: circa 44 sulla carta)');
console.log(String(somma(EST)).padStart(6), '  ORIENTE (senza Dacia e senza Armenia e Mesopotamia)');
console.log(String(A['Dacia']).padStart(6), '  Dacia;', A['Armenia Mesopotamia'], ' Armenia e Mesopotamia');
