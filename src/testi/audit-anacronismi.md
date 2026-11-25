# Verifica degli anacronismi nella città in 3D (25 novembre 2026)

Richiesta dell'utente: «Nell'852 il Tempio di Claudio non può più essere utilizzato. Ricordati di far fare ad un subagente la verifica degli anacronismi nelle varie epoche» e «Papa Leone IV costruisce Santa Maria Nova fra le sue rovine. Non vedo la chiesa».

## Riassunto

1. Tabella degli stati di `MONUMENTI` (96 voci) in ognuno dei 55 anni di tappa: 19 righe sospette (tabella sotto).
2. Il caso più grave è proprio quello segnalato: il tempio di Claudio, il tempio di Adriano, i quattro templi di largo Argentina, l'Iseo e i templi del Foro Boario e del portico d'Ottavia non avevano mai cambiato stato (`[[0,'uso']]`): nell'852 erano templi bianchi con il tetto rosso intatto (catture `P-templi-852`).
3. Nel modello un monumento che resta `uso` non invecchia: le crepe dell'incuria ci sono, ma niente crolli e niente colonne mancanti.
4. Corretti 7 monumenti (tabella sotto), tutti come «scelta del modello dichiarata»: le fonti lette danno l'ultima notizia, non la data della fine. Provati e poi tolti l'arco di Gallieno con i Trofei di Mario e Minerva Medica: con `chiuso` il modello mangia le parti alte, e la cupola di Minerva Medica regge fino al 1828, l'arco fino a oggi. Lì serve uno stato nuovo, «abbandonato ma in piedi» (proposta).
5. Santa Maria Nova c'era, ma come «chiesetta» generica di `CHIESE` (`js/nuclei.js`): alta una dozzina di metri sopra il podio del tempio, posata ai piedi del podio, girata a caso, senza nome, coperta da ciò che restava del tetto. Ora è un monumento vero, con nome, scheda e cantiere dall'848.
6. Con la chiesetta generica, Santa Maria Nova era già per un terzo in piedi nella tappa dell'846, prima che Leone IV diventasse papa (aprile 847). Corretto.
7. Proposte, non applicate: 11 (bronzi e dorature rimasti fino all'852, l'arco di Claudio sulla via Lata, il portico degli Dei Consenti, il mausoleo di Augusto senza storia, uno stato «abbandonato ma in piedi» per l'Esquilino e Minerva Medica). Avvertenza sui templi corretti: il degrado del modello è uguale per tutti, e i due templi del Foro Boario, oggi ben conservati perché diventati chiese (Portuno nell'872, a memoria), nell'852 appaiono un poco più rovinati di quanto forse fossero.
8. Nessun campanile fuori epoca (l'unico è quello di Stefano II del 757 a San Pietro); croci solo sul Pantheon chiesa (609) e su Sant'Adriano (630).
9. Platner e Ashby letti: quattro voci (sotto). Le altre date vengono dalle schede già presenti.
10. Non verificate: le date delle 40 chiese minori di `CHIESE`, le figure delle scene (vesti, armi, navi), lo stato dei bronzi del Colosseo e della basilica Ulpia.

## Voci di Platner e Ashby lette (penelope.uchicago.edu, 25 novembre 2026)

- **Claudius, divus, templum** (`Templum_Claudii.html`): «The last mention of the temple is in the fourth century» (Notitia, reg. II); nulla sulla distruzione; nel 1217 una bolla di Onorio III nomina «formae et alia aedificia positae intra clausuram Clodei».
- **Venus et Roma, templum** (`Templum_Veneris_et_Romae.html`): «The history of its destruction is unknown»; Leone IV (847-855) costruì la chiesa di S. Maria Nova «in its ruins», rifatta nel 1612 e oggi S. Francesca Romana; il terremoto dell'847 (Liber Pontificalis) è proposto come causa di molti danni «in and around the forum», come argomento e non come fatto. Podio di 145 x 100 m. La voce non dice in quale parte del tempio stesse la chiesa.
- **Hadrianeum** (`Hadrianeum.html`): niente sulla storia tarda; restano undici colonne del lato nord-est.
- **Porticus Octaviae** (`Porticus_Octaviae.html`): incendi dell'80 e del 203; due colonne del propileo sostituite da un arco di mattoni «perhaps after the earthquake of A.D. 442»; niente data per Sant'Angelo in Pescheria; nulla sui due templi dopo l'antichità.

Già citate nel codice e non rilette qui: Arcus Claudii («in ruins as early as the eighth century»), Columna Phocae («the statue of Phocas in gilt bronze»), Nymphaeum (Minerva Medica).

## Tabella

| Monumento | Anni | Che cosa non va | Che cosa dice la fonte | Correzione | Tipo |
|---|---|---|---|---|---|
| Tempio di Claudio (`tempioclaudio`) | 392-852 | Sempre `uso`: tempio intatto nell'852 | Ultima menzione nel IV secolo; distruzione ignota; nel 1217 resta la «clausura Clodei» (Platner e Ashby) | `chiuso` dal 392, come gli altri templi; nella scheda la data è dichiarata scelta | applicata, scelta del modello |
| Tempio di Adriano (`tempioadriano`) | 392-852 | Sempre `uso` | Nessuna data tarda (Platner e Ashby) | `chiuso` dal 392, dichiarato | applicata, scelta del modello |
| Area sacra di largo Argentina (`argentina`) | 392-852 | Quattro templi `uso` fino all'852 | La scheda: il tempio A diventa chiesa forse nel IX secolo | `chiuso` dal 392, dichiarato | applicata, scelta del modello |
| Iseo Campense (`iseo`) | 392-852 | Santuario di Iside `uso` fino all'852 | Nessuna data tarda nelle schede | `chiuso` dal 392, dichiarato | applicata, scelta del modello |
| Foro Boario (`foroboario`) | 392-852 | Tempio rotondo e tempio di Portuno `uso` fino all'852 | Il tempio di Portuno diventa chiesa solo nell'872 (data a memoria, da verificare) | `chiuso` dal 392 per i templi; la scheda dice che archi e passaggio al fiume restano | applicata, scelta del modello |
| Portico d'Ottavia (`ottavia`) | 392-852 | Templi di Giunone e Giove `uso` fino all'852 | Riparazione del propileo forse dopo il terremoto del 442 (Platner e Ashby) | `chiuso` dal 450: templi senza culto dal 392, portico curato ancora a metà del V secolo | applicata, scelta del modello |
| Trofei di Mario e arco di Gallieno (`esquilino`) | 537-852 | La mostra d'acqua `uso` dopo il taglio degli acquedotti | Acquedotti tagliati nel 537 (scheda `acquedotti`); l'arco è in piedi ancora oggi | Provato `chiuso` dal 537: l'arco perdeva la cima. Lasciato `uso`; la scheda ora dice che la fontana resta senz'acqua e perché l'arco non invecchia | proposta: stato «abbandonato ma in piedi» |
| «Tempio» di Minerva Medica (`minervamedica`) | 537-852 | Padiglione di giardino `uso` fino all'852 | Funzione incerta; la cupola cade in parte nel 1828 (scheda) | Provato `chiuso` dal 537: la cupola spariva. Lasciato `uso`; la scheda lo spiega | proposta: stesso stato nuovo |
| Tempio di Venere e Roma (`venere`) | 847-852 | Nell'852 resta un tempio spogliato con il tetto a pezzi, e la chiesa di Leone IV non si vede | Santa Maria Nova costruita «in its ruins»; terremoto dell'847 proposto come causa dei danni (Platner e Ashby) | `crollato` nell'847, come la basilica di Massenzio; dichiarato nella scheda | applicata, scelta del modello |
| Santa Maria Nova (in `CHIESE`) | 844-852 | Chiesetta generica, nascosta, senza nome; per un terzo in piedi nell'846 | Leone IV, 847-855 (Platner e Ashby); «sita iuxta via Sacra» sotto Benedetto III (Liber Pontificalis, citato in `js/dati.js`) | Monumento `santamarianova`: cantiere dall'848, finita nell'850; tolta da `CHIESE` | applicata; forma e misure sono uno schema dichiarato |
| Arco di Claudio sulla via Lata (`archivialata`) | 700-852 | `uso` fino all'852 | «In ruins as early as the eighth century» (Platner e Ashby, citato nel codice) | Separare l'arco di Claudio dall'arco di Portogallo, che resta fino al 1662, e farlo cadere nell'VIII secolo | proposta |
| Portico degli Dei Consenti (`campidoglio`) | 392-852 | Portico pagano `uso` fino all'852 | Restaurato nel 367 da Pretestato (a memoria, da verificare) | Separarlo o mettere `chiuso` dal 392 a tutto il gruppo (cambierebbe anche il carcere e l'insula) | proposta |
| Tempio del Sole (`sole`) | 455-852 | La cupola della rotonda è di bronzo fino all'852 | La cupola di bronzo è un'ipotesi del modello; i Vandali portano via bronzi nel 455 | Cupola di coppi, o `spogliato` nel 455 | proposta |
| Colonna di Foca (`foca`) | 610-852 | La statua di bronzo dorato di Foca resta fino all'852 | Platner e Ashby danno la statua, non la sua fine; Foca è ucciso e condannato nel 610 | Togliere la statua dopo il 610, dichiarandolo | proposta |
| Curia (`curia`) | 410-630 | Tre statue di bronzo sul frontone attraverso i sacchi del 410 e del 455 | Le statue sono dedotte dalle monete di Augusto (commento in `js/monumenti.js`) | Toglierle nel 410 o nel 455, o dichiararle | proposta |
| Obelisco di Costanzo II (`obelisco357`) | 455-852 | Fiaccola di bronzo dorato in cima fino all'852 | Ammiano la descrive; la fine è ignota | Toglierla nel 455 | proposta |
| Orologio di Augusto (`orologio`) | 537-852 | Il pavimento della meridiana con la linea dorata visibile fino all'852 | La scheda: l'obelisco è in piedi nell'VIII secolo; del pavimento non dice | Verificare quando fu interrato | proposta |
| Mausoleo di Augusto (`augusto`) | tutta | Non ha una storia in `MONUMENTI`: usa quella di riserva (`uso`, `chiuso` nel 500) | Non verificato | Dargli una storia e una scheda | proposta |
| Foro Boario, tempio di Portuno | 872 | Data della chiesa (872) a memoria | Non verificato | Verificare | proposta |

Nessuna correzione per: Colosseo (cava dal 523), Circo Massimo (chiuso nel 556, obelischi in piedi dichiarati nella scheda), teatro di Pompeo (chiuso nel 546), Palatino (chiuso nel 720, ultima menzione 713), terme (chiuse nel 537), stadio di Domiziano e Saepta (450, dichiarati), Colosso (455, dichiarato), statue del mausoleo di Adriano (537), Castra Praetoria (313), sepolcro di Eurisace (402), campanile di San Pietro (757: Liber Pontificalis, Stefano II), acquedotti (776), mulini galleggianti (537, dichiarati senza fonti per i secoli seguenti).

## Che cosa non ho potuto verificare

- Le 40 chiese minori di `CHIESE`: date e tipo (titolo, diaconia, monastero) sono state prese dalle note in testa alla tabella, non rilette.
- Le figure delle scene (vesti, armi, navi, corone): le catture d'insieme non bastano a giudicarle; servirebbe un giro scena per scena.
- I bronzi del Colosseo (scudi dell'attico) e il tetto di bronzo della basilica Ulpia: lo spoglio dello shader li scurisce con `cava`, ma non li toglie.
- Dove stesse con precisione Santa Maria Nova nel IX secolo dentro il recinto del tempio: Platner e Ashby non lo dicono. Il posto è quello della chiesa di oggi (coordinate di OpenStreetMap già in `CHIESE`).
- L'anno di costruzione di Santa Maria Nova dentro il pontificato di Leone IV: 848-850 è una scelta.

Catture: cartella `scratchpad\AN\cat` della sessione (prima: `P-*.jpg`; dopo: `D-*.jpg`); fogli `N1`-`N4`.

## Per la regia dell'852 (`js/scene-tappe.js`, non toccato)

La didascalia `leonina852` ora nomina Santa Maria Nova. Perché la vista ci passi, basta una tappa del volo sul monumento `santamarianova` (centro x 30,4, z 15,2; la facciata guarda a sud-ovest, verso l'arco di Tito: un punto di vista da sud-ovest, distanza 35-45 unità, mostra facciata, tempio crollato e Colosseo insieme), prima o dopo il passaggio sul Colosseo (`colosseo852`, già vicino).

## Prove

- `node --check js/dati.js` e `js/monumenti.js`: in ordine. `MONUMENTI` 97 voci (96 più `santamarianova`), `EVENTI` 37, `TAPPE` 59, `CHIESE` 39 (40 meno Santa Maria Nova).
- Santa Maria Nova: assente nell'846, cantiere a metà nell'849, finita nell'852; nome «Santa Maria Nova» sulla scena; la scheda si apre.
- Nella pagina, il 25 novembre, `js/infografiche.js` dava un errore di sintassi (riga 1876, «missing ) after argument list»): file di un altro lavoro in corso, non toccato qui.

## Applicate il 25 novembre 2026, dopo il sì dell'utente alle tre proposte

### 1. Lo stato «abbandonato»

Nuovo stato in `MONUMENTI` (`js/dati.js`) e in `RM.rovina` (`js/monumenti.js`): l'edificio non è più in uso e prende l'incuria della chiusura (crepe, sporco, erba, una parte dei coppi), ma `uRovina` resta a zero: niente cime spezzate, niente colonne mancanti, niente crolli, finché un terremoto, un incendio o la cava non li portano. Uno «spogliato» che viene dopo scurisce i bronzi senza far cadere nulla. Tinta propria in `TINTA`, poco più chiara di `chiuso`. Nessuna modifica allo shader.

Applicato a (con la frase nella scheda):
- Minerva Medica, dal 537: la cupola regge fino al 1828 (scheda).
- Arco di Gallieno e Trofei di Mario (`esquilino`), dal 537: l'arco è in piedi ancora oggi.
- Foro Boario, dal 392: il tempio rettangolare diventa Santa Maria Egiziaca nell'872 (Platner e Ashby, «Aedes Matris Matutae», letto il 25 novembre: la data 872 è data lì senza riserve); il tempio rotondo è chiesa di Santo Stefano Rotondo nel 1140 (Platner e Ashby, «Portunium», letto lo stesso giorno).
- Pantheon, dal 392 al 609: con `chiuso` la cupola si sbriciolava fra il 392 e il 609 e tornava intera con la chiesa (catture N5, «pantheon 600»).
- Meta Sudans, dal 537: il cono di mattoni resta in piedi fino al 1936.
- Basilica di Massenzio, dal 600 al terremoto dell'847: volte e muri reggono fino a lì (Platner e Ashby, nella scheda).
- Anfiteatro Castrense e circo Variano (`sessoriano`), dal 275: l'anfiteatro, murato nella cinta, resta in piedi.

Restano `chiuso` (proposta: decidere con l'utente) le terme di Diocleziano e di Caracalla, i cui muri e alcune volte reggono a lungo (l'aula di Santa Maria degli Angeli), e il teatro di Pompeo: cambierebbero molto l'aspetto della città.

### 2. Bronzi e dorature

- Statue di bronzo sul frontone della Curia: monumento a parte `curiastatue`, via nel 455 con il sacco dei Vandali (Procopio, Guerre III 5). Scelta dichiarata nella scheda dei Fori: le statue stesse sono un'ipotesi tratta dalle monete.
- Statua di Foca in bronzo dorato: monumento a parte `focastatua`, via nel 663. Platner e Ashby danno la statua, non la sua fine; Foca è ucciso nel 610. Scelta dichiarata nella scheda.
- Fiaccola dorata dell'obelisco di Costanzo II (Ammiano XVII 4, 15): `fiaccola357`, via nel 663, scelta dichiarata.
- Cupola del tempio del Sole: era bronzo dorato senza fonte; ora `spogliato` nel 663 e la scheda dice che il bronzo stesso è un'ipotesi.
- Fori: `spogliato` nel 663 (tetto di bronzo della basilica Ulpia e delle esedre); scheda: «se ci fosse ancora non si sa».
- Basilica di Massenzio: `spogliato` nel 663 (le tegole di bronzo, forse quelle di Onorio I del 630: la scheda lo dice).
- Colosseo, scudi di bronzo dell'attico: già scuriti dal 523 dalla cava; ora la scheda lo dichiara.

Per tutte le date 663 la fonte è il Liber Pontificalis, vita di Vitaliano: Costante II porta via «omnia quae erant in aere ad ornatum civitatis». Che quei singoli bronzi ci fossero ancora non lo dice nessuno: è una scelta.

Restano (proposte): la punta dorata dell'obelisco di Augusto e i coni dorati delle mete nel Circo Massimo (`circo`, fino all'852) e la statua equestre di Traiano nel suo foro. Le tegole dorate di Venere e Roma erano già a posto: vanno via con lo `spogliato` del 630 (Onorio I).

### Fuori da questi file (da fare altrove)

- `js/pagina.js`, riga 65, `NOMI_STATO`: aggiungere `abbandonato:'abbandonato, ma in piedi'` (senza, scheda ed elenco scrivono «undefined»).
- `index.html`, riga 150, legenda degli stati: aggiungere `<span class="st abbandonato">abbandonato, in piedi</span>` dopo «in disuso».
- `css/stile.css`, righe 160, 167, 207: il colore di `.abbandonato`, `.legenda .abbandonato::before`, `.st.abbandonato::before` (per esempio `#B3A58C`, fra «in disuso» e «in uso»; da provare con `src/prove/daltonismo.mjs`).
- `js/infografiche.js`, «Il Pantheon nel tempo»: la banda 392-609 si chiama ancora «chiuso»; va bene, ma si può dire «abbandonato».
- `MONUMENTI` ora ha 100 voci: 96 + `santamarianova` + i tre pezzi `curiastatue`, `focastatua`, `fiaccola357` (senza nome: non compaiono nell'elenco).

Foglio: `N5-abbandonato-e-bronzi.jpg` (prima e dopo, 600 e 852).

### 3. Terme di Diocleziano, terme di Caracalla, teatro di Pompeo (25 novembre 2026, sera)

Lette tre voci di Platner e Ashby:
- **Thermae Diocletiani**: le guerre gotiche, tagliando gli acquedotti, le rendono inutilizzabili; nel 625 un registro della Chiesa le nomina ancora; l'aula centrale deve la sua «excellent preservation» alla trasformazione nella chiesa di Santa Maria degli Angeli e conserva la volta a crociera; le grandi demolizioni vengono con Sisto V. Nessun terremoto o crollo datato prima dell'852.
- **Thermae Antoninianae**: restauro sotto Teodorico; l'uso diventa impossibile con il taglio degli acquedotti del 537 (deduzione della voce); «evidence has been found here too of the harm wrought by the earthquake of 847» (una colonna del cortile poggia su un cumulo di macerie); le rovine soffrirono meno di molti altri edifici.
- **Theatrum Pompei**: restauri fino a quello di Simmaco per Teodorico (507-511, Cassiodoro); poi solo i nomi medievali (Santa Maria de Crypta Pinta, piazza di Grottapinta). Nessun crollo datato.

Applicato: Diocleziano `abbandonato` dal 537, `spogliato` nel 663 (scelta); Caracalla `abbandonato` dal 537, `spogliato` nel 663 (scelta), `crollato` nell'847 (Platner e Ashby); Pompeo `abbandonato` dal 546 (data che il modello aveva già), `spogliato` nel 663 (scelta). Il teatro non ha nome né scheda: la scelta è dichiarata nel commento in `js/monumenti.js` (proposta: dargli un nome e una scheda). L'effetto del restauro di Teodorico nella scena del 493 resta e svanisce in un secolo dopo il 546.

### 4. Il verde sui ruderi abbandonati

L'utente: «Ok fai vedere erba e crepe però». Lo shader del degrado mette l'erba solo sui piani bassi (meno del 40% dell'altezza) e il muschio solo in proporzione ai crolli (`uRovina`); con `uRovina` a zero un edificio abbandonato restava quasi solo più scuro (foglio N5). Senza toccare lo shader, in `js/monumenti.js` («il verde sui ruderi abbandonati»): cespugli sui piani alti (cornici, cime dei muri, volte, gradinate; mai sui coppi, che lo shader fa cadere) e macchie d'edera appese ai muri, per i monumenti che hanno lo stato `abbandonato`. Crescono dall'abbandono: un terzo dopo sessant'anni, tutti dopo trecento; meno sul Pantheon (fino al 609), sui templi del Foro Boario, sulla Meta Sudans e sull'arco di Gallieno. Dove un terremoto fa cadere le cime restano solo quelli più bassi. Circa 2.300 istanze sul PC (un terzo sui telefoni), circa 110.000 triangoli in più nel caso peggiore: il tempo di un fotogramma non l'ho potuto misurare in modo affidabile (Edge senza finestra, disegno via software). Quanti e quali arbusti è una resa, non una fonte.

Foglio: `N6-terme-teatro-verde.jpg`.

### 5. L'abbandono nello shader del degrado (25 novembre 2026, notte)

Fatto in `js/costruttore.js` (blocco `DEGRADO`) e `js/monumenti.js` (`RM.rovina`, il verde sui ruderi):
1. **Tetti bianchi** (difetto del foglio N6): lo stato `spogliato` portava i coppi verso un grigio chiaro (0,3 lineare: bianco al sole); sulle terme abbandonate e spogliate nel 663 i tetti, senza crolli che li bucassero, diventavano bianchi. Ora, sugli edifici abbandonati, lo spoglio scopre solo le coperture di metallo (bronzo, oro); i coppi restano coppi, anneriti e invasi dal verde. Altrove (cava, incendi) resta com'era.
2. `uVerde` (0-1): erba e muschio sui piani a ogni altezza (terrazze, cime dei muri, cima delle volte), coppi anneriti, sporco, colature d'umido a gruppi, umido di risalita al piede, muschio sui muri; sui tetti abbandonati mancano più coppi.
3. `uIntonaco` (0-1): l'intonaco cade a chiazze dal bordo in ombra sui muri chiari (intonaco, marmo, travertino) e sotto compare il mattone, a tratti il tufo; da vicino i filari; crepe grandi, quasi verticali.
4. Crescita (`RM.rovina`, campi `v` e `i`): un quarto subito dopo l'abbandono, tutto dopo trecento anni; misura ridotta per il Pantheon fino al 609, i templi del Foro Boario, la Meta Sudans, l'arco di Gallieno (`MISURA_V`, `MISURA_I`). Nessun crollo: restano a `uRovina`.
5. Scala (`RM.QUALITA.degrado`, `RM.degradoQ`): «bassa» niente; «telefono» erba sui piani, coppi anneriti, sporco e umido al piede, una sola lettura della trama; da «media» tutto. Il verde a cespugli si disegna solo dove c'è (`m.count`), anche nei cortili, e ne resta il 45% in «bassa» e il 70% sul «telefono» (`RM.QUALITA.verde`).
6. Il teatro di Pompeo ha nome e scheda (`SCHEDE.pompeo`).

Da fare ancora: le coperture di metallo spogliate (Giove Capitolino, i Fori) restano grigio chiaro; travi e vuoti sotto i coppi mancanti non ci sono (si vede il buio dell'interno); quanto intonaco cada e dove è una resa, non una fonte. Fogli: scratchpad `AN2/R1…R4`.
