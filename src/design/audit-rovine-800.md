# Le rovine dell'800: rassegna, correzioni, controllo (27 novembre 2026)

Obiettivo dell'utente: «La Roma dell'800 deve sembrare al visitatore una città magnifica in rovine»; «anche le macerie, tipo con le edere ed altre piante sopra»; «basati sulle fonti storiche, anche quando sono stati abbattuti ed in che condizioni stavano»; «mi aspetto rovine "diverse" nella Suburra e nelle zone ricche». Un amico: «troppo con lo stampino».

Catture (Edge senza finestra, 1280 x 800, gradino «media»): `scratchpad/RM/foto/prima-*.jpg` e `dopo-*.jpg`; fogli di confronto in `scratchpad/RM/foglio-rovine-800*.png`.

## Parte 1. Rassegna (prima delle correzioni)

### Veduta larga, 300 e 800

Nell'800 la città dall'alto è un tappeto bruno-verde di muretti bassi, uniforme da un capo all'altro delle mura. I grandi monumenti si leggono per la pianta (Caracalla, Diocleziano, Circo, stadio di Domiziano) ma non spiccano per l'altezza; i due che spiccano di più sono intatti e chiari (tempio di Venere e Roma, Pantheon). Nessun monumento, salvo quelli già «abbandonati», ha verde sopra: il Colosseo, i Fori, il Circo, lo stadio sono puliti come pietra appena smontata.

### Stato nell'800 secondo `MONUMENTI` e che cosa mostrava il modello

Valori di `RM.rovina(id,800)`: r = crolli (il taglio dall'alto è al più circa 2,1 x r dell'altezza), v = verde, s = spoglio.

| monumento | stato nell'800 | il modello mostrava | che cosa dovrebbe mostrare (scheda, fonti lette) |
|---|---|---|---|
| Colosseo | cava dal 523 | r 0,33 ridotto a 0,13 nel modulo: cima tagliata fino al 28% dell'altezza tutto attorno, oltre al fronte sud smontato (uSud); nessun verde | **errore sicuro**: oggi l'anello esterno a nord è in piedi fino all'attico (Platner e Ashby, Amphitheatrum Flavium: il lato nord del muro esterno è ancora in piedi). Il fronte sud cavato resta (scheda, Parco del Colosseo) |
| Foro di Augusto | cava dal 500 | r 0,33: tutto, muro tagliafuoco compreso, tagliato fino a due terzi dell'altezza | **errore sicuro**: la scheda dice «restano tre colonne del tempio con l'architrave, il podio e il grande muro di fondo»; il muro di fondo, alto 33 m, nell'800 c'era intero |
| Portico d'Ottavia | chiuso dal 450 | r 0,19: tagliato fino al 40% | il propileo è in piedi oggi (scheda: «è la struttura ancora visibile»). Errore sul propileo; il modello non distingue il propileo dal resto: non corretto (vedi sotto) |
| Palazzi del Palatino | chiuso dal 720 | r 0,10: tagliato fino al 21% | oggi restano alte le sostruzioni verso il Circo; il resto è basso. Incerto: lasciato |
| Circo Massimo | chiuso dal 556 | r 0,18, niente verde | oggi resta poco; nessuna fonte letta sull'800. Lasciato il taglio, aggiunto il verde |
| Stadio di Domiziano | chiuso dal 450 | r 0,19, niente verde | forma conservata nella piazza; lasciato il taglio, aggiunto il verde |
| Teatro di Balbo | chiuso 430, cava 750 | r 0,25 | resta poco: lasciato |
| Tempio della Pace | bruciato 500 | r 0,46 | resta il muro di Santi Cosma e Damiano (chiesa, monumento a sé): lasciato |
| Terme di Caracalla | abbandonate 537, spogliate 663, crollo 847 | nell'800 intere, con verde e cespugli; nell'852 il crollo di CROLLI | giusto: le volte cadono nell'847 (Platner e Ashby) |
| Terme di Diocleziano | abbandonate 537, spogliate 663 | intere, con verde | giusto: le volte del frigidario reggono ancora oggi (Santa Maria degli Angeli) |
| Terme di Traiano, di Costantino | abbandonate 537 | intere, coi tetti a cupola e verde | nessuna fonte letta sull'800: lasciate |
| Basilica di Massenzio | abbandonata 600, spogliata 663, crollo 847 | nell'800 intera, nell'852 resta la navata nord (CROLLI) | giusto (Platner e Ashby) |
| Tempio di Venere e Roma | abbandonato 392, spogliato 630, crollo 847 | nell'800 bianco e col tetto intero | la scheda: nel 630 Onorio I toglie le tegole di bronzo per San Pietro. Un tetto di legno senza manto per due secoli: scelta dichiarata (sotto) |
| Pantheon | chiesa dal 609 | intero | giusto |
| Teatro di Marcello, di Pompeo, mercati di Traiano, Tabularium | abbandonati | intatti, con verde | giusto (in piedi oggi) |
| Mausolei di Augusto e di Adriano | abbandonato / in uso | intatti | giusto |
| Archi, colonne Traiana e di Marco Aurelio | in uso | intatti | giusto |
| Acquedotti (Antoniniano chiuso 537) | — | resi in js/mura.js, non in questi file | non controllati qui |

### Quartieri

- Suburra a mezza distanza: una distesa di muretti scuri da un piano. I «gusci» (fato 0) sono il 63% delle insulae dei quartieri fitti, ma: muri di un solo foglio (dall'alto una linea), la trama del rudere ha due file di finestre stirate su tutta l'altezza (un muro di dieci metri sembra di un piano con finestre enormi), e i lati in ombra sono neri.
- Cumuli: poliedri di cinque-sei facce con l'ombreggiatura piatta (flatShading) e il verde a macchie dal bordo netto: da vicino «tuta mimetica».
- Domus dei colli: cumuli bassi e qualche colonna: giusto come intenzione, ma uguali ai muretti delle case basse.

### Fumo (300)

A mezza distanza colonne bianche larghe come una casa (la grandezza del punto arriva a 1,3-1,6 unità, cioè 13-16 m, e cresce salendo fino a 3 volte): sbuffi di ciminiera, non fili di cucina.

## Parte 2. Le moli in piedi (`js/monumenti.js`, `js/costruttore.js`)

- **Colosseo**: tolti i crolli dall'alto (tabella nuova `TENUTA`, colosseo 0): l'anello esterno sta in piedi fino all'attico tutto attorno, salvo il fronte sud smontato dalla cava (uSud, invariato). Fonte: Platner e Ashby, Amphitheatrum Flavium; la scheda del Colosseo (lato sud). Intonaco caduto ridotto (MISURA_I 0,25): la facciata è di travertino pieno.
- **Foro di Augusto**: voce in `CROLLI`: il muro tagliafuoco (x da 5,25 a 5,75 nel riferimento del foro) regge intero, portici, esedre e tempio prendono il taglio della cava. Fonte: la scheda («restano … il podio e il grande muro di fondo»).
- **Verde su ogni monumento uscito dall'uso** (`VERDE_OVUNQUE`): verde, muschio, intonaco caduto (shader) e cespugli ed edera (istanze) contano dagli anni passati fuori uso, qualunque sia lo stato; prima solo dallo stato «abbandonato». Ora prendono il verde il Colosseo, i Fori, il Circo, lo stadio di Domiziano, il Palatino, il teatro di Balbo, il portico d'Ottavia, i Saepta, l'Emporio e gli altri chiusi o cavati. Resa, non misura: nessuna fonte letta misura il verde nell'800.
- **Cespugli ed edera per posto**: ogni monumento ha il suo seme (prima un solo filo di numeri per tutti). L'edera: metà scende dalle creste, lunga, metà sale dal piede, più larga; più fitta sui muri esposti a nord. Quantità a misura della mole (`QUANTI`).
- **Venere e Roma**: tolto un difetto vecchio di `RM.rovina`: un monumento tornato in uso e poi di nuovo abbandonato (rifatto nel 312, chiuso nel 392) restava «ripulito» (uPulito 1) per sempre e nell'800 non aveva verde. Ora ha i segni del secondo abbandono.
- **Spogliato**: dove il monumento è stato spogliato cade più rivestimento e si vede il nucleo di mattoni; da vicino i fori delle grappe (schema: una fila ogni 1,3 m, metà dei posti).
- **Crepe**: sui muri le celle delle crepe sono stirate in verticale (circa 6 x 20 m invece di 9 x 9): sui muri grandi (il tagliafuoco del foro di Augusto) facevano un reticolo di piastrelle.
- **Cortili abbandonati**: l'erba alta copre quasi tutto, con l'orlo morbido; prima sui cortili grandi delle terme macchie nette a tuta mimetica.
- Provato e tolto lo stesso giorno: il tetto di Venere e Roma senza tegole dal 630 (scheda: Onorio I porta le tegole di bronzo a San Pietro). Nel modello il tetto è una lastra piatta di muratura con 28 triangoli di coppi: l'effetto non si vedeva, e cambiare la forma non è di questo lavoro.
- Non corretti (servono forme o dati nuovi): il propileo del portico d'Ottavia (in piedi oggi, ma nel modello non è separato dal portico, che prende il taglio del «chiuso»); il colonnato di legno in cima al Colosseo, che nell'800 resta col suo tetto rosso (nessuna fonte letta sul quando cadde); gli acquedotti (js/mura.js).

## Parte 3. I quartieri (`js/citta.js`)

- **Gusci alti** (fato 0): forma propria, `geoGuscio`: cinque tratti per lato invece di quattro, angoli più alti dei tratti di mezzo, un lato quasi caduto che cambia col quarto di giro del posto, due tramezzi più bassi, quattro file di finestre vuote sull'altezza (prima due, stirate) e su ogni cresta una lastra di 40 cm che prende la luce: dall'alto il muro ha uno spessore. 84 triangoli invece di 36.
- Più gusci e più alti nei quartieri fitti: nella Suburra fino a 78 insulae su cento restano guscio (prima 72), solo 8 su cento diventano muretti; nelle zone di case basse niente cambia. Altezza finale del guscio da 0,58 a 1 della casa (prima da 0,5), e nei secoli si abbassa di un ottavo invece di un quarto.
- **Cumuli**: sette lati, profilo a cupola, normali lisce date dalla forma (il materiale non ha più flatShading); tinte larghe di mattone, tufo e calcinaccio; il verde una coltre continua che scende dalla cima coi decenni, l'edera sui fianchi. Le case sono le stesse di prima (prova per posto: 2461 su 2461 identiche; `RM_provaCase(450)`: zero case lontane cambiate).

## Parte 4. Il fumo (`js/vita.js`)

I cumuli non gettano più ombra (la ricevono): sono bassi e lisci, e la mappa delle ombre, quando si rifà, ha circa 180.000 triangoli in meno.

Colonne delle case: larghe 3-4 m alla bocca invece di 13-16, più punti (22) più fitti in basso, alfa massima 0,5 invece di 0,7 e che cala salendo, grigio-azzurro (0xaeb7c2) invece di bianco sporco; si allargano e svaniscono salendo. Forni del pane un poco più densi delle case. Terme e calcare restano più larghe e più visibili (1,5 e 1,2 unità).

## Parte 5. Il controllo

Fogli (2000 punti di lato, PRIMA a sinistra e DOPO a destra, quattro righe per foglio): `scratchpad/RM/foglio-rovine-800-1.png` … `-7.png` (il primo anche come `foglio-rovine-800.png`). Nei cumuli da vicino PRIMA e DOPO possono mostrare isolati diversi: la scelta dei gusci e dei cumuli è cambiata per alcune case.

Misure (Edge senza finestra su questa macchina, Radeon integrata; città intera in vista):

| | prima | dopo |
|---|---|---|
| triangoli 300 («media») | 3.132.720 | 3.133.392 |
| triangoli 800 («media») | 4.306.112 | 4.554.166 (+5,8%) |
| cespugli + edera sui monumenti, 800 | 3591 + 1558 | 4987 + 2106 |
| fotogrammi 800, «media» 1280 x 800, sei aperture | 51,5 45,2 47,5 39,0 44,4 43,8 (media 45,2) | 48,4 40,8 49,8 40,2 39,9 42,7 (media 43,6) |
| fotogrammi 800, «telefono» 393 x 852, sei aperture | 53,4 60,0 60,1 52,9 58,0 53,7 (56,4) | 49,7 59,8 59,9 53,0 49,2 51,2 (53,8) |
| fotogrammi 300, «media», tre aperture | 54,8 53,5 59,5 | 55,0 52,6 58,9 |
| fotogrammi 300, «telefono», tre aperture | 59,0 60,0 59,7 | 59,9 59,5 57,7 |

Le differenze stanno dentro il rumore delle aperture (fra due aperture uguali si va da 39 a 51). Nella stessa pagina (800, telefono), con e senza gusci, verde dei monumenti e cumuli: sempre 59-60 al secondo. Sul PC la stessa prova oscilla da 36 a 52 nella stessa pagina e non dice nulla. Il calo medio di 1,6 (PC) e 2,6 (telefono) fotogrammi nell'800 non è dimostrato, ma non è nemmeno escluso: va guardato sull'iPhone e sul PC dell'utente. I triangoli in più sono il prezzo del verde sui monumenti (circa 100.000), dei gusci (circa 40.000) e dei cumuli rotondi (circa 30.000).

Prove: `node --check` dei quattro file; case per posto 2461 su 2461 identiche, `RM_provaCase(450)` zero case lontane cambiate; 235, 300, 410, 537, 590, 700, 800, 852 senza errori in console; le scene dell'800 (San Pietro) e dell'852 (mura leonine) al loro posto.

### Giudizio

Meglio, non ancora «magnifica». A mezza distanza ora si legge una città di monumenti in rovina: il Colosseo è alto e intero col fronte sud smontato e il verde sulle cornici, il muro del foro di Augusto torreggia sul foro cavato, Venere e Roma non è più un tempio bianco appena lavato, il Circo, lo stadio, i Fori, il Palatino hanno l'erba e i cespugli degli abbandonati; le terme restano moli scure e intere; nella Suburra i gusci hanno le file di finestre e la cresta, e da mezza distanza si distinguono dai muretti dei margini. Il fumo del 300 è un filo grigio-azzurro, non una nuvola.

Che cosa manca ancora:
- Dalla veduta larga (sei chilometri) le moli restano piccole: a scala vera dominano poco. Servirebbero luce e foschia (js/base.js) che stacchino i volumi alti dal tappeto basso, non altro verde.
- Il verde dei monumenti sono ancora palline e macchie piatte: da vicino si vedono singoli cespugli tondi sulle cornici del Colosseo. Mancano alberi veri nelle aule scoperchiate e fichi sulle creste (non fatti per tempo).
- I gusci sono un foglio con la cresta: da vicino si vede che non hanno spessore nei vani delle finestre; da lontano sono bassi quanto le case erano basse (12-16 m nel modello).
- I cumuli sono lisci ma hanno ancora il contorno a sette lati, e sul lato in ombra diventano scuri e bluastri.
- Il tetto di Venere e Roma è una lastra piatta: senza cambiare la forma non si può mostrare il tetto rimasto senza tegole dal 630.
- Il colonnato di legno in cima al Colosseo resta col tetto rosso nell'800; le pozze d'acqua nel Circo restano azzurre (da verificare se sono la palude della scheda).
- Il propileo del portico d'Ottavia e gli acquedotti (js/mura.js) non sono stati controllati contro «ciò che resta oggi».
- Nessuna riga in pagina dice ancora che il verde sui monumenti chiusi e cavati è una resa: va aggiunta nel piede (index.html, non di questo lavoro), accanto a quella sulle case.
