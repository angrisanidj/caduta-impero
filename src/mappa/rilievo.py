"""Rilievo ombreggiato per la carta, secondo passo (si veda rilievo.mjs).
Legge il rilievo di Natural Earth (SR_50M.tif: 10800 x 5400, un punto ogni due primi d'arco, grigio 206 = terreno piano e mare),
lo campiona sulla griglia della proiezione e scrive un'immagine in cui il grigio medio (128) vuol dire «piano»:
la pagina la sovrappone ai colori con la fusione «overlay», che schiarisce i versanti in luce e scurisce quelli in ombra.

Uso: python rilievo.py SR_50M.tif griglia.bin rilievo.jpg
"""
import sys

import numpy as np
from PIL import Image

PIANO, PASSO, LON0, LAT0 = 206.0, 1 / 30, -179.98333333, 89.98333333
tif, griglia, dest = sys.argv[1:4]

r = np.asarray(Image.open(tif)).astype(np.float32)
w, h = np.fromfile(griglia, dtype=np.int32, count=2)
g = np.fromfile(griglia, dtype=np.float32, offset=8).reshape(h, w, 2)
col = (g[..., 0] - LON0) / PASSO
rig = (LAT0 - g[..., 1]) / PASSO
c0 = np.clip(np.floor(col).astype(np.int32), 0, r.shape[1] - 2)
r0 = np.clip(np.floor(rig).astype(np.int32), 0, r.shape[0] - 2)
fc, fr = np.clip(col - c0, 0, 1), np.clip(rig - r0, 0, 1)
v = (r[r0, c0] * (1 - fc) + r[r0, c0 + 1] * fc) * (1 - fr) + (r[r0 + 1, c0] * (1 - fc) + r[r0 + 1, c0 + 1] * fc) * fr

# il piano diventa grigio medio. La risposta non è lineare (esponente 0,7): i monti bassi (Pennini, Galles, Massiccio Centrale) si vedono di più
# senza che le Alpi diventino nere; le luci sono amplificate più delle ombre, perché l'originale è quasi tutto in ombra
d = v - PIANO
out = 128 + np.sign(d) * np.abs(d) ** 0.7 * np.where(d < 0, 3.2, 6.0)
Image.fromarray(np.clip(out, 18, 238).astype(np.uint8), mode='L').save(dest, quality=72, optimize=True, progressive=True)
print(dest, w, 'x', h)
