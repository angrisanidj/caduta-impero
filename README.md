# Come finisce un impero

Infografica interattiva sull'Occidente romano dal 235 all'852: una mappa dell'Impero e un modello tridimensionale di Roma che cambia nel tempo.

Pubblicata su https://angrisanidj.github.io/caduta-impero/

## Come si apre

È una pagina statica. In locale:

    python -m http.server 8766

poi `http://localhost:8766`.

## Dati e crediti

- Tevere, mura e porte di Roma: © OpenStreetMap contributors, licenza ODbL.
- Quote del terreno: SRTM 30 m (NASA), via opentopodata.org.
- Coste per la mappa dell'Impero: Natural Earth, via world-atlas.
- I dati topografici si rigenerano con `src/roma/genera.mjs`, la mappa con `src/mappa/genera.mjs`.

## Licenze

Codice: MIT. Confini della carta e tabelle dei dati: CC BY-SA 4.0 (i confini derivano dal Digital Atlas of the Roman Empire di Johan Åhlfeldt). Topografia di Roma: © OpenStreetMap contributors, ODbL. Testi e immagini: tutti i diritti riservati. I dettagli in [LICENZA.md](LICENZA.md).
