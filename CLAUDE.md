# Come finisce un impero

Infografica interattiva in italiano: l'Occidente romano dal 235 all'852. Due scene fisse (mappa dell'Impero in SVG, Roma in 3D) guidate da una linea del tempo di 44 tappe in sei atti. Pagina statica, nessun bundler. Si risponde all'utente in italiano.

Pubblicata su https://angrisanidj.github.io/caduta-impero/ (repository `angrisanidj/caduta-impero`, ramo `main`, Pages dalla radice).

## Criteri dell'utente

- Il più realistico possibile: fra effetto e verosimiglianza storica vince la verosimiglianza. Ciò che è ipotesi va dichiarato (schede, riquadri «Cosa dicono gli storici», piè di pagina).
- Date, testi e posizioni vanno verificati sulle fonti; dove le fonti divergono lo si scrive.
- Deve girare fluida su PC e telefono.
- Passi piccoli, scritti subito su disco, aggiornamenti brevi.

## Struttura

- `index.html`, `css/stile.css`
- `js/dati.js`: tutti i contenuti. `TAPPE` (con `cambia` per gli stati delle regioni), `CURVE` (popolazione con `banda` delle stime), `MONUMENTI` (storie `[anno, stato]`; stati: uso, chiuso, spogliato, cava, bruciato, crollato, assente), `SCHEDE`, `EVENTI` (sacchi, assedi, incendi), `CHIESE`, `ITINERARIO`.
- `js/roma-topo.js`: generato da `src/roma/genera.mjs` (Tevere, mura, porte da OpenStreetMap; quote SRTM). Non modificare a mano.
- `js/base.js`: renderer three.js r128 (script classici, niente moduli), terreno, colli (`COLLI`, rilievo accentuato 1,8 volte), strade, fiume, luce, effetti a tutto schermo, regolatore della qualità (`RM.livello`), `RM.h`, `RM.hRapida`, `RM.ll(lat,lon)`, `RM.vola`.
- `js/costruttore.js`: `RM.Costruttore` (solidi fusi in una maglia) e `RM.matRovina` (shader del degrado: crepe, crolli, spoglio, lato sud).
- `js/monumenti.js`: elenco `M` dei monumenti con posizione reale, terrazze, `RM.statoMonumento`, `RM.rovina`.
- `js/nuclei.js` (chiese minori), `js/mura.js` (mura, acquedotti, ponti), `js/citta.js` (isolati: abitati, rovine, orti; istanze compattate), `js/vita.js` (gente, fumo, barche, calcare), `js/eventi.js`, `js/mappa.js`, `js/pagina.js` (regia, cruscotto, schede), `js/itinerario.js`.

Convenzioni: 1 unità = 10 m; origine al Foro Romano (41.8925 N, 12.4853 E); x verso est, z verso sud. Ogni modulo registra `function(anno)` in `RM.moduli` e, se serve, `function(dt)` in `RM.frame`. Nomi e commenti in italiano.

## Lavorare

- Anteprima: `python -m http.server 8766` (configurazione `caduta` in `.claude/launch.json`). Il server non invalida la cache: prima di ricaricare, `fetch(file,{cache:'reload'})`.
- Controllo sintassi: `node --check js/<file>.js`.
- Se il pannello di anteprima è nascosto le animazioni non girano: per vedere un fotogramma chiamare a mano `RM.frame.forEach(f=>f(.1))`.
- Pubblicare: `node src/pubblica.mjs` (aggiorna la versione sui file e in fondo alla pagina), poi commit e push su `main`.
- Le ricerche con subagenti sono la voce più costosa: controllare il consumo prima di avviarle. L'utente non vuole spendere in uso extra.
