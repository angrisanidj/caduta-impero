# Audit della città in 3D

23 novembre 2026. Riguarda la scena di Roma: i monumenti visti da vicino, la città attorno, la resa dell'immagine, la fluidità.

## Come è stato fatto

- Tutti gli 84 monumenti con un nome sono stati ripresi da vicino nell'anno in cui sono in uso, in 14 fogli da sei. In più 30 inquadrature scelte: prospetti, i Fori, le rovine nel 600 e nell'852, mura, ponti, acquedotti, la vista d'insieme in tre anni.
- Di ogni monumento sono state misurate pianta, altezza e quota sul terreno, e confrontate con le misure note.
- Il costo di un fotogramma è stato misurato disegnando la scena più volte di fila a tre risoluzioni (schermo intero da PC, telefono, PC ad alta densità).
- Il banco di ripresa resta in `src/prove/audit-citta.js` (cartella fuori dal repository).

Limiti da dire subito.

- Il confronto con «ciò che sappiamo» è fatto con le misure e le forme che conosco dalla letteratura (Platner e Ashby, Coarelli, il plastico di Gismondi, le piante di Lanciani). In questa sessione non ho riletto nessuna fonte. Ogni voce segnata **da verificare** va letta su una fonte prima di toccare il modello.
- La velocità è misurata su un PC con scheda grafica integrata (AMD Radeon del processore). Nessuna misura su un telefono vero: lì serve la prova dell'utente.

## Corretto subito

### 1. Nove monumenti senza storia (errore già pubblicato)

In `js/dati.js` due commenti scritti a metà riga avevano «spento» le voci che seguivano sulla stessa riga. Il modello trattava quei monumenti come comparse: presenti dall'anno 0, chiusi nel 500.

| Monumento | Che cosa si vedeva | Com'è ora |
|---|---|---|
| Croce sul Pantheon | c'era già nel 235 | dal 609 |
| Patriarchio lateranense | c'era già nel 235 | dal 324 |
| Triclinio di Leone III | c'era già nel 235 | dall'800 |
| Fori | chiusi nel 500, mai cava | chiusi nel 537, cava dall'800 |
| Terme di Tito, terme di Caracalla | chiuse nel 500 | chiuse nel 537 |
| Saepta | chiusi nel 500 | chiusi nel 450 |
| Templi di Apollo Sosiano e di Bellona | chiusi nel 500 | chiusi nel 392 |

Il primo commento è entrato con la tappa del teatro di Pompeo, il secondo con l'incendio della Curia. Lo stesso errore stava in `js/confronto.js`: in «Prima e dopo» la didascalia dell'evento finiva sotto il cursore degli anni.

Per non ricaderci: `node --check` non lo vede. Ho cercato in tutti i file le righe in cui un commento contiene qualcosa che sembra codice. Non ce ne sono altre.

### 2. Rovine nel 235

Al massimo della popolazione un isolato su venti era già un rudere. La scala degli isolati abitati arrivava a un milione di abitanti, la curva a 900.000. Ora nel 235 la città è tutta abitata.

### 3. Tempio di Claudio

La terrazza era a filo del terreno e il pendio del Celio ne copriva un angolo, con un bordo a denti. Ora sale di 8,5 m sopra la spianata. L'altezza è indicativa (**da verificare**: le sostruzioni verso il Colosseo erano più alte).

### 4. Bordi a scalini

La scena non aveva un vero antialias. I bordi degli edifici erano solo ammorbiditi e i contorni scuri restavano a scalini. Ora gli effetti a tutto schermo sono due passate: prima i contorni, poi l'antialias (FXAA) su tutto. Si vede soprattutto sulle colonne e sulle arcate, e quando la risoluzione scende.

### 5. Fluidità

Vedi più sotto, «Fluidità».

## I monumenti, uno per uno

Giudizio: **buono** = forma e misure tornano; **schema** = posto e ingombro giusti, forma generica; **da rifare** = da vicino non regge.

### Valle del Colosseo e Fori

| Monumento | Giudizio | Note |
|---|---|---|
| Colosseo | buono | Quattro ordini (tre di arcate e l'attico con le finestre), le antenne del velario, la cavea. Alto 54 m con le antenne (48,5 dal vero senza). Nell'852 sul fronte sud resta in piedi una lama bianca sottile e alta: sembra un difetto. |
| Colosso del Sole | da rifare | Alto 36 m (le fonti: da 30 a 35). La figura è fatta di blocchi: da vicino sembra un giocattolo. |
| Meta Sudans | buono | Cono di 18 m (17 dal vero). La vasca è larga 21 m, dal vero 16: **da verificare**. |
| Arco di Costantino, arco di Tito | buono | Tre fornici, colonne, attico; il fornice unico di Tito. Senza rilievi né statue. |
| Tempio di Venere e Roma | buono | Piattaforma, tempio periptero, i portici sui lati lunghi, tetto dorato. |
| Fori | buono | È la parte più ricca (27.000 triangoli). La Colonna Traiana è un fusto liscio; accanto, una biblioteca è una scatola di mattoni senza tetto. |
| Basilica Emilia, Curia, Sant'Adriano, colonna di Foca | buono | |
| Basilica di Massenzio | buono | Le tre aule a nord, la navata a crociere, l'abside a ovest, il portico a sud. Tetto verde (bronzo). |
| Tempio di Claudio | schema | Corretta la terrazza (vedi sopra). Il tempio al centro è generico. |
| Ludus Magnus, terme di Tito | schema | |

### Campidoglio, Palatino, Circo

| Monumento | Giudizio | Note |
|---|---|---|
| Giove Capitolino | buono | Sei colonne in fronte, tre file, frontone, tetto dorato. Classe C: l'alzato è ipotesi, ed è detto. |
| Palatino | schema | Un blocco con cortili, lo stadio, le arcate verso il Circo. Riconoscibile da lontano, povero da vicino. |
| Circo Massimo | buono | 621 x 118 m, la spina, i due obelischi dal 357. Accanto agli obelischi si vedono due triangoli chiari sulla pista: da guardare (terreno che spunta?). |
| Foro Boario, teatro di Marcello, portico d'Ottavia | buono | Il teatro è largo 143 m (130 dal vero) e alto 30. |

### Campo Marzio

| Monumento | Giudizio | Note |
|---|---|---|
| Pantheon | buono | Il migliore. Cupola a gradoni dorata, oculo, corpo intermedio col secondo frontone, pronao a otto colonne. |
| Stadio di Domiziano | buono | 275 x 106 m. Nel modello l'asse è esattamente nord-sud; piazza Navona è girata di qualche grado: **da verificare**. |
| Terme di Nerone, di Agrippa | schema | Vedi «Le terme» più sotto. |
| Largo Argentina | buono | I quattro templi nell'ordine giusto, il tondo al secondo posto. |
| Saepta, Iseo | schema | Recinti quasi vuoti. Classe C. |
| Tempio di Adriano | buono | Manca il recinto porticato che lo circondava: **da verificare**. |
| Colonna di Marco Aurelio | schema | 41 m, ma è un fusto bianco liscio: manca il fregio a spirale, che è ciò che la fa riconoscere. |
| Horologium, archi della via Lata, Arcus Novus | schema | L'Arcus Novus è un blocco con un fornice. |
| Tempio del Sole | buono | I due recinti e il tempio tondo, da Palladio. Classe C, detto. |
| Teatro di Balbo, teatro di Pompeo | buono | |

### Le terme

Traiano, Caracalla, Diocleziano, Costantino, Nerone e Tito escono dallo stesso stampo: recinto, corpo centrale, due aule a botte, le crociere, un caldarium tondo a cupola. Cambia solo la scala. Le misure dei recinti tornano (Caracalla 358 m di lato contro 337, Diocleziano 397 contro 380, Traiano circa 330).

Ciò che dal vero le distingue, e che nel modello manca (**tutto da verificare** prima di disegnarlo):

- Diocleziano: caldarium rettangolare con absidi, non tondo; la grande esedra a sud-ovest (oggi piazza della Repubblica); due rotonde agli angoli (una è San Bernardo).
- Caracalla: il caldarium tondo c'è; mancano le due esedre sui lati del recinto e le cisterne con la gradinata sul fondo.
- Traiano: la grande esedra a sud-ovest; il corpo centrale addossato al lato nord-est.

I prati dei recinti sono un verde piatto e saturo: è la cosa che più stona nelle viste da vicino.

### Laterano, Esquilino, Celio

| Monumento | Giudizio | Note |
|---|---|---|
| San Giovanni in Laterano | buono | Cinque navate, abside a ovest, battistero. |
| Patriarchio, triclinio di Leone III | schema | Classe C, detto. Ora compaiono nell'anno giusto. |
| Santa Croce, anfiteatro Castrense, circo Variano | buono | L'aula con due ordini di finestroni. |
| Santa Maria Maggiore, Santo Stefano Rotondo, Santa Sabina | buono | Santo Stefano con i tre anelli e i quattro bracci. |
| Minerva Medica | schema | Una capsula con le finestre: mancano le absidi che sporgono dal decagono. |
| Castra Praetoria | buono | Le mura basse (4,73 m, da Platner) sono giuste. Dentro ci sono caseggiati della città, non baracche. La pianta misura 509 x 535 m contro 440 x 380: **da verificare** (il rettangolo è ruotato, e la misura è presa sugli assi della scena). |

### Vaticano e fuori le mura

| Monumento | Giudizio | Note |
|---|---|---|
| San Pietro e il suo complesso | buono | Navate, transetto, atrio col cantaro, le due rotonde, l'obelisco a sud, il campanile, il portico fino al ponte. |
| Mausoleo di Adriano | buono | Base di 89 m, tamburo, il tumulo con i cipressi (ipotesi tradizionale), la quadriga. |
| Meta Romuli, piramide Cestia | buono | 30 m di lato e 37 d'altezza. |
| San Paolo, San Lorenzo, Sant'Agnese, Santa Costanza | buono | Le due basiliche a forma di circo sono giuste. |
| Monte Testaccio | da rifare | Una tenda a spicchi, sfaccettata. Alto 66 m perché segue il rilievo accentuato. |
| Emporio | schema | |

### Mura, acquedotti, ponti, fiume

- Mura Aureliane e leonine: torri, merli, cantiere. Bene.
- Acquedotti: arcate semplici, quota costante. Bene.
- Ponti: tavole piatte. L'isola Tiberina è una sagoma chiara con due edifici.
- Tevere: turchese vivo. Il Tevere è torbido, giallo-verde («flavus» per i Romani). Fra effetto e verosimiglianza qui ha vinto l'effetto.

### Coerenze da sistemare

- Il bronzo dei tetti ha due colori. Sul tempio di Venere e Roma è oro; le stesse tegole, portate a San Pietro nel 630, diventano verdi. Anche il pronao del Pantheon è verde sotto una cupola d'oro.
- Le statue (Colosso, quadriga, cavalli, Traiano a cavallo) sono fatte di blocchi.

## La città attorno

- Case abitate: caseggiati con finestre e tetti di coppi, cortili. Uniformi ma credibili.
- Rovine (dal V secolo): il racconto funziona. Tre difetti da vicino: la trama dei muri è stirata sui tratti lunghi; i cespugli sono piramidi verdi; qualche muro resta in piedi come una lama.
- Pavimenti in rovina (Foro, arena del Colosseo nell'852): le chiazze d'erba hanno bordi netti e grandi, sembrano una tela mimetica.
- Piana vaticana e campagna: un verde uniforme e saturo, quasi vuoto.
- Ombre a terra: grigio-verdi e pesanti sulla sabbia.

## Fluidità

### Che cosa costa

| | 235 | 600 |
|---|---|---|
| Chiamate di disegno | 144 | 203 |
| Triangoli a fotogramma | 590.000 | 860.000 |
| di cui il terreno | 180.000 (97.000 sul telefono) | uguale |
| di cui le case | 190.000 | 150.000 più 280.000 di rovine |

- Il lavoro del processore a ogni fotogramma è trascurabile (0,2 millesimi di secondo).
- Il tempo dipende soprattutto dal numero di pixel. A risoluzione da telefono circa un terzo è geometria.
- Case e rovine non vengono mai scartate quando sono fuori dall'inquadratura: guardando un solo monumento si disegna comunque tutta la città.

### Che cosa non andava

1. Il regolatore della qualità scattava solo sotto i 28 fotogrammi al secondo. Fra 28 e 60 la scena andava a scatti e non succedeva nulla. Su un PC con scheda integrata e schermo ad alta densità è il caso normale.
2. Il suo primo gradino spegneva gli effetti a tutto schermo. Su questa scheda rallentava (13 millesimi contro 10): riaccendeva l'antialias a più campioni della tela.
3. Non risaliva mai: un momento pesante abbassava la qualità per tutta la visita.
4. La tela aveva l'antialias a più campioni acceso anche se la scena è disegnata altrove: memoria e tempo spesi per nulla.
5. Nel viaggio fra due tappe la mappa delle ombre si rifaceva a ogni fotogramma.

### Che cosa è cambiato

- Regolatore nuovo (`js/base.js`). Scende sotto i 45 fotogrammi al secondo. Abbassa prima la risoluzione, a passi; poi le ombre; poi passanti e fumo. Dopo ogni passo controlla se è servito: se no, rimette com'era e si ferma (è il caso del telefono in risparmio energetico, fermo a 30). Dopo qualche secondo a pieno ritmo prova a risalire, tre volte al massimo.
- La tela non ha più l'antialias proprio.
- Ombre rifatte al massimo quindici volte al secondo durante il viaggio.

Misure sulla stessa scheda, vista d'insieme, millesimi di secondo a fotogramma:

| | prima | dopo |
|---|---|---|
| Schermo intero da PC (1920 x 1080) | da 10 a 14 | da 8 a 11 |
| Telefono (585 x 1266) | da 6 a 9 | da 4 a 5 |

L'antialias a più campioni (MSAA) sulla tela degli effetti è stato provato e scartato: raddoppiava il tempo (31 millesimi contro 14).

### Che cosa resta

- Provare su un telefono vero: l'iPhone dell'utente e, se possibile, un Android di fascia media.
- Dividere case e rovine in riquadri, così da vicino si disegna solo il quartiere inquadrato. È il lavoro che rende di più sui telefoni lenti. Tocca `js/citta.js`.
- Terreno più rado lontano dalla città.

## Proposte, in ordine di resa

Servono un sì, perché cambiano l'aspetto.

1. **Tevere** color fiume: giallo-verde torbido al posto del turchese.
2. **Prati e campagna**: verde meno saturo, con una grana (campi, filari, alberi). Vale per i recinti delle terme, la piana vaticana, la terrazza di Claudio.
3. **Statue** a tutto tondo al posto dei blocchi: Colosso, quadriga di Adriano, Traiano a cavallo.
4. **Colonne coclidi** (Traiana, di Marco Aurelio) con il fregio a spirale.
5. **Terme** distinte fra loro, lette sulle piante: per prima Diocleziano.
6. **Rovine da vicino**: trama dei muri non stirata, cespugli veri, chiazze d'erba più fini.
7. **Bronzo** dello stesso colore prima e dopo il trasloco delle tegole.
8. **Monte Testaccio** a gradoni di cocci.
9. **Ponti** con le arcate e isola Tiberina a forma di nave.
