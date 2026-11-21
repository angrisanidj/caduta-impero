/* Rilievo ombreggiato per la carta, primo passo: per ogni punto dell'immagine di sfondo calcola longitudine e latitudine con la stessa proiezione di genera.mjs.
   Uso, da questa cartella:
     1. scaricare SR_50M.zip (Natural Earth, «Shaded Relief Basic» 1:50m, dominio pubblico) da https://naturalearth.s3.amazonaws.com/50m_raster/SR_50M.zip
        ed estrarre SR_50M.tif in grezzi/rilievo/ (la cartella non sta nel repository: pesa 70 MB);
     2. node rilievo.mjs            (scrive grezzi/rilievo/griglia.bin)
     3. python rilievo.py grezzi/rilievo/SR_50M.tif grezzi/rilievo/griglia.bin ../../img/rilievo.jpg */
import fs from 'fs';
import * as d3 from 'd3-geo';

const W = 1000, H = 640, LIMITI = [-10.5, 28.5, 38.5, 56], SCALA = 1.5;      // gli stessi numeri di genera.mjs; l'immagine è una volta e mezza la carta
const [o, s, e, n] = LIMITI;
const cornice = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[o, s], [e, s], [o, n], [e, n], [(o + e) / 2, n], [(o + e) / 2, s]] } };
const proj = d3.geoConicConformal().parallels([34, 50]).rotate([-13, 0]).fitExtent([[0, 0], [W, H]], cornice);
const w = Math.round(W * SCALA), h = Math.round(H * SCALA), g = new Float32Array(w * h * 2);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = proj.invert([(x + .5) / SCALA, (y + .5) / SCALA]); g[(y * w + x) * 2] = p[0]; g[(y * w + x) * 2 + 1] = p[1]; }
const dest = new URL('./grezzi/rilievo/griglia.bin', import.meta.url);
fs.writeFileSync(dest, Buffer.concat([Buffer.from(new Int32Array([w, h]).buffer), Buffer.from(g.buffer)]));
console.log('griglia', w, 'x', h);
