# Audit del design, 23 novembre 2026

Prove fatte nel pannello di anteprima con `src/cornice.html` (riquadro largo come il telefono, barre di scorrimento tolte per avere la larghezza vera) a 375x600, 360x600, 812x375 e 1280x800, tappe 418, 451 e 552, carta e città, in linea e a tutto schermo. Misure con script nella pagina: nessun elemento esce dai bordi (`scrollWidth` uguale alla larghezza a 360, 375, 812 e 1280, controllato a sei altezze di scorrimento, prima e dopo le modifiche).

## (a) Cosa ho cambiato

Tutte le regole nuove stanno in fondo ai file, con un commento che dice cosa e perché.

### `js/pagina.js` (solo presentazione, bottone «Leggi la tappa» del telefono)
- **Errore vero**: il bottone «Leggi la tappa ↓» / «↑ Torna alla carta e alla città» doveva salire sopra la linea del tempo incollata in fondo, ma il controllo chiedeva `t.bottom > H-4`, mentre la linea incollata sta a 8 punti dal fondo (`bottom:8px`). La condizione non era mai vera: il bottone restava a 14 punti dal fondo, **sopra le tacche degli ultimi due atti** (dal 590 all'852 non si potevano toccare finché c'era). Ora la soglia è `H-70`: il bottone sale sopra la linea sia quando è incollata sia quando, al suo posto nella pagina, passa nella fascia del bottone. Provato a cinque altezze di scorrimento: nessuna sovrapposizione.

### `css/stile.css`
- **Telefono coricato, scene dentro la pagina** (`max-height:559px`, orizzontale, fino a 1000 punti): la linea del tempo incollata occupava circa 150 dei 375 punti d'altezza e copriva quasi tutta la carta. Ora sta su una riga sola (comandi a sinistra, tacche, solo gli anni degli atti), come era già a tutto schermo: circa 60 punti.
- **Bottone fluttuante al centro** (`.salta-giu`): a destra copriva il bottone del tutto schermo della carta e i comandi della città (zoom, schermo intero); al centro non tocca nessun comando.
- **Cruscotto sul telefono** (fino a 520 punti): le spie una sotto l'altra. In due colonne da 166 punti la nota dei «Commerci» andava su dieci righe strette e la spia «Abitanti» accanto restava mezza vuota (290 punti d'altezza entrambe). Ora 168, 133 e 203 punti, righe leggibili; la lunghezza totale è quasi uguale.
- **Protagonisti**: il punto « · » dopo le date andava a capo da solo all'inizio della riga (si vedeva con Vallia nel 418). Ora uno spazio unificatore lo tiene attaccato alle date.
- **Piede sul telefono e sul tablet**: il bottone fluttuante copriva la riga «Versione del…»; il piede ha 76 punti sotto invece di 36.
- **Telefoni da 360 punti**: l'occhiello «Infografica interattiva · 235-852» andava su due righe con «852» da solo; spaziatura delle lettere da .16em a .12em sotto i 375 punti.

### `css/carta.css`
- Sui dispositivi al tocco (`pointer:coarse`) i bottoni «Passo per passo» passano da 28 a 34 punti d'altezza.

### `css/atti.css`
- Al tocco «L'atto in breve» passa da 25 a 32 punti d'altezza (sul telefono sta comunque su una riga sua).

### `css/cause.css`
- Sul telefono (fino a 520 punti) sull'asse del quadro degli storici «235» e «284» si sovrapponevano («23384»): resta solo «235».
- Le etichette delle famiglie nelle schede («Da dentro», «Da fuori»…) passano da 10,5 a 11 punti.

## (b) Cosa propongo ma non ho fatto

> Il 23 novembre 2026, alle 17:40, su richiesta dell'utente: FATTE la 1 (zona di tocco più alta di 3 punti, solo con `pointer:coarse`, in fondo a `css/carta.css`), la 2 (il bottone fluttuante sparisce su «Perché cadde» e sul piede, `js/pagina.js`), la 3 (invito «Guarda la carta a tutto schermo» col telefono coricato, `invitoGrande` in `js/mappa.js`, chiudibile per la visita) e, della 4, gli anni sull'asse di «Perché cadde» (da 10-10,5 a 11-11,5). Lasciate le altre scritte piccole: «Legenda» e «I popoli» sono strette apposta perché le prime voci stiano sulla stessa riga, i nomi delle regioni toccano la disposizione delle scritte sulla carta.

1. **Pastiglie della legenda alte 26 punti** (carta, sotto il disegno). Sono bottoni, e al tocco 26 punti sono pochi (il minimo consigliato è 44, quello di WCAG 2.2 è 24). Non le ho toccate perché l'altezza delle tre righe del telefono è calcolata al punto (`max-height:101px` in `css/carta.css`, insieme al bottone «+N»): portarle a 32 vuol dire rifare quel conto e cambiare lo spazio che la legenda occupa, cosa su cui l'utente ha già deciso. Si può allargare solo la zona sensibile con un `::after` trasparente di 2 o 3 punti sopra e sotto, ma con 5 punti fra le righe il guadagno è piccolo.
2. **Il bottone fluttuante resta sopra i contenuti** mentre si legge «Perché cadde» e le schede (copre per un momento righe del quadro). Si potrebbe nasconderlo quando la sezione «Perché cadde» o il piede sono sullo schermo: è logica di `js/pagina.js` e cambia un comportamento chiesto dall'utente, quindi lo lascio a lui.
3. **Didascalia della carta in linea sul telefono coricato**: anche con la linea del tempo su una riga, a 812x375 la carta, le legende e la linea non stanno insieme sullo schermo. Una scelta possibile è proporre il tutto schermo appena si gira il telefono (un invito, non un'apertura automatica).
4. **Scritte di 10,5-11 punti** ancora presenti: nomi delle regioni sulla carta (11), nomi sulle frecce (11,5 voluti), «I popoli» e «Legenda» (11, maiuscoletto), anni sull'asse di «Perché cadde» (10). Leggibili ma al limite; alzarli tocca la disposizione delle scritte sulla carta (`js/mappa.js`), quindi non li ho toccati.
5. **Prove con Edge senza finestra**: con `--virtual-time-budget` la carta a volte esce vuota e una cattura su quattro esce senza fogli di stile (in parallelo si disturbano). Per le prove di veste conviene il pannello con `src/cornice.html` e le misure via script, come fatto qui; le catture vanno fatte una alla volta.

## (c) Da provare su un telefono vero

- Il bottone «Leggi la tappa» sopra la linea del tempo, scorrendo lentamente fra la carta e il titolo della tappa (iPhone con la barra di Safari che entra ed esce: `innerHeight` cambia).
- Telefono coricato: la linea del tempo su una riga dentro la pagina, con la tacca della tappa e il fumetto quando si trascina il dito; che «Riproduci» resti comodo da toccare.
- Il cruscotto in colonna dopo il 330, quando ci sono quattro spie (con la moneta): la pagina si allunga di circa 150 punti; vedere se piace.
- I bottoni «Passo per passo» e «L'atto in breve» più alti: la regola vale solo con `pointer:coarse`, quindi nel pannello del PC non si vede.
- L'occhiello su un Android da 360 punti, con il carattere di sistema vero (Roboto), che è più largo di quello del PC.
