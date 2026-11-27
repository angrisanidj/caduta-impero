# Riserve aperte (27 novembre 2026, mattina)

Che cos'è: l'elenco unico di tutte le riserve rimaste aperte dai lavori dal pomeriggio del 26 al mattino del 27 novembre 2026 (e di alcune più vecchie ancora aperte): ciò che non è stato verificato, ciò che «resta», gli schemi da migliorare, le fonti non rilette, le cose venute deboli, le scelte da confermare. L'utente: «Segnati di fare un secondo passaggio dopo per tutte le riserve che trovi».
Come si usa: ogni riga ha uno stato, «aperta» o «chiusa»; quando una riserva si chiude, si cambia lo stato e si scrive accanto che cosa è stato fatto (e con quale commit). «Chi la chiude»: «noi» se basta leggere, guardare o rifare; «solo l'utente» se servono telefoni veri, il suo PC, un suo gusto o una sua decisione.
Quante sono: 112 riserve nelle tabelle, tutte aperte; più 31 scelte da confermare e 20 punti in cui le fonti tacciono (in fondo).

Fonti di questo elenco: messaggi dei commit dal 26 novembre alle 12 al 27 alle 7:09; `CLAUDE.md` (cambi del 26 novembre e voci seguenti); `src/design/completezza-monumenti.md` (sezioni 1, 2, 5, 7); `src/design/audit-rovine-800.md`; la memoria del progetto («STATO» della notte e «SECONDO PASSAGGIO SULLE RISERVE»). Dove una riserva non era chiara è scritta come domanda.

## Carta dell'Impero

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 1 | Alcuni nomi di regione restano sbiaditi (opacità 0,3) anche senza voci della legenda accese: «Tracia» nel 378, «Italia» nel 410. Notato, non indagato. | Pastiglie della legenda (1978b29) | Cercare in `js/mappa.js` chi mette quell'opacità; provare le 59 tappe | noi | aperta |
| 2 | La carta che compare prima della città non è provata su Safari: se il browser non ridisegna fra uno script e l'altro, compare quando compariva prima. | Carta prima della città (d96d3cc) | Aprire la pagina sull'iPhone e guardare se la carta arriva subito | solo l'utente | aperta |
| 3 | Sul telefono il caricamento totale dura circa 0,16 s in più (la pianta dei cartellini si rifà più tardi). | Carta prima della città (d96d3cc) | Misurare su un telefono vero; decidere se va bene | solo l'utente | aperta |
| 4 | Barre di scorrimento in tinta sui telefoni: Safari per iPhone le legge solo dalla 26.2; su Android il cursore si colora solo mentre si scorre. | Barre in tinta (d96d3cc) | Guardarle su iPhone e su Android | solo l'utente | aperta |
| 5 | «Velo a 812 x 375»: segnata come riserva nella memoria senza dire quale difetto. Domanda aperta: il velo di caricamento col telefono coricato? | Attesa delle due scene (d2fed3c) | Rifare la prova a 812 x 375 e scrivere che cosa non va | noi | aperta |
| 6 | Prove spente `?carta=cartellini` e `?carta=costa`, scartate dalle misure, sono ancora nel codice. | Fluidità della carta (24 novembre) | Toglierle da `js/mappa.js` | noi | aperta |

## Tevere, barche, porto

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 7 | Nessuna scia di schiuma attorno alle pile dei ponti Fabricio e Cestio (le loro pile non escono da `js/mura.js`). | Tevere, terzo giro (9c4d774) | Far uscire le pile da `js/mura.js` e aggiungerle a `pileFiume` | noi | aperta |
| 8 | Il fiume nuovo non è stato guardato al gradino «bassa». | Tevere, terzo giro (9c4d774) | Catture con `?qualita=bassa` | noi | aperta |
| 9 | Dopo il terzo giro, una apertura lenta su sei (prima nessuna su nove): «da tenere d'occhio». | Tevere, terzo giro (9c4d774) | Ripetere le misure di apertura; sentire l'utente sul suo PC | noi e l'utente | aperta |
| 10 | Una linea orizzontale vicino all'isola Tiberina (segnata nella memoria). | Tevere (memoria, riserve del 26) | Guardare da vicino l'isola e capire se è la maglia o un'ombra | noi | aperta |
| 11 | Tevere, corrente, barche, buoi e bovaro non provati su telefoni veri. | Tevere (2a4cba8, 9c4d774), barche (2531ffd), bovaro e corrente (0773025) | Guardarli sull'iPhone | solo l'utente | aperta |
| 12 | La corrente visibile da lontano non è stata guardata in movimento (solo due catture a due secondi). | Bovaro e corrente (0773025) | Guardarla in movimento, da lontano e da vicino | noi | aperta |
| 13 | Zampe dei buoi e remi delle barche piccole non guardati in movimento. | Barche (2531ffd) | Guardarli in movimento | noi | aperta |
| 14 | Carro coi buoi: le zampe si aprono «a ventaglio»? (domanda della memoria) | Barche, correzione dei carri (2531ffd) | Guardare un carro da vicino in movimento | noi | aperta |
| 15 | Le ombre di barche e buoi che si muovono restano indietro nella mappa delle ombre e poi saltano. | Scena dell'800, ombre (33f9824) | Rifare più spesso le ombre degli oggetti mobili, o toglierle a chi si muove | noi | aperta |
| 16 | I mulini sulle barche del 537 sono ancora scatole. | Barche (CLAUDE.md, «Restano») | Leggere una fonte sui mulini galleggianti (Procopio) e rifarli | noi | aperta |
| 17 | Emporio: il mercato che c'era già dopo il 271 sta in parte dentro le mura. | Emporio (2cb97a8) | Spostare la merce o le mura dopo aver letto dove passavano | noi | aperta |
| 18 | Emporio: la banchina del monumento sta circa 10 m dentro l'acqua. | Emporio (2cb97a8) | Confrontare con l'asse del fiume e spostarla | noi | aperta |
| 19 | Emporio: non letti Richmond 1930 e Gatti 1936. | Emporio (2cb97a8) | Cercarli e leggerli, se sono in rete | noi | aperta |

## Scene di Roma: 312, 410, 552, 800

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 20 | 312: sul telefono, dopo il cedimento, la riva nord è quasi fuori quadro. | Ponte Milvio sulla città (4e4de59) | Rivedere la vista per il telefono in verticale | noi, poi l'utente sull'iPhone | aperta |
| 21 | 312: i cavalieri sono ancora sagome. | Ponte Milvio (4e4de59) | Rifare i cavalieri con le figure di `js/vita.js` | noi | aperta |
| 22 | 312: una linea nera sottile in diagonale sulla scena (forse una strada). | Ponte Milvio (memoria) | Trovare che cos'è e toglierla se è un difetto | noi | aperta |
| 23 | 312: `CLAUDE.md` dice ancora da correggere il commento «all'ottavo secondo si tolgono i ferri» in `js/scene-tappe.js` e il commento di `js/mura.js` (Zosimo non dice che i ferri furono tolti). La scena è stata corretta il 26; i commenti forse no. | Infografiche (820b217), ponte Milvio (4e4de59) | Cercare i due commenti e correggerli se ci sono ancora | noi | aperta |
| 24 | 410: non provato su telefoni veri. | 410 aspetta la carta (cf0f041) | Guardare sull'iPhone che la scena parta subito | solo l'utente | aperta |
| 25 | 552: la vista va subito sul fortino mentre la carta mostra ancora Tagina (stesso difetto del 410, più lieve). | 410 aspetta la carta (cf0f041) | Far aspettare anche il 552 il suo passo della carta | noi | aperta |
| 26 | 800: volti, teste a faccette, pieghe delle vesti e luce dell'interno non fatti («non è al livello» dell'infografica). | Scena dell'800 (33f9824) | Lavoro a sé sull'incoronazione | noi | aperta |
| 27 | 800: sull'iPhone l'ultimo tempo crolla a 19-28 fotogrammi al secondo; in Edge non si riproduce. | Scena dell'800 (33f9824) | Prova sull'iPhone con `?prova=qualita` o a occhio | solo l'utente | aperta |
| 28 | 800: strisce d'ombra scure in diagonale sul terreno attorno a San Pietro (c'erano già). | Scena dell'800 (33f9824) | Capire da dove vengono (mappa delle ombre?) | noi | aperta |
| 29 | Figure ancora «dei lego» per l'utente: volti, soldati del 274 come pedine, teste a faccette. | Figure (25 novembre) | Rifare volti e soldati con le figure nuove | noi | aperta |

## Monumenti

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 30 | Tre stati presi dalla scheda dei Fori, la cui fonte non è stata riletta: foro di Augusto «cava» dal 500 (contro la regola «mai cava senza fonte»), foro di Cesare spogliato dall'800, foro di Traiano cava dall'850. | Secondo gruppo a sé (2da1ca7); templi (d5dad2f) | Leggere le voci di Platner e Ashby e le fonti della scheda dei Fori; correggere o dichiarare | noi | aperta |
| 31 | I confini delle regioni VIII e X si sono mossi un poco con i punti nuovi: non guardato. | Secondo gruppo a sé (2da1ca7) | Guardare lo strumento «Regioni e quartieri» prima e dopo | noi | aperta |
| 32 | San Marcello, San Giovanni a Porta Latina e Santa Martina hanno come fonte it.wikipedia. | Mancanti, primo gruppo (ca4df82) | Leggere Armellini, parte II | noi | aperta |
| 33 | Altre quattro chiese da confermare (San Cesareo, Santo Stefano del Cacco, Santo Stefano degli Abissini, Aracoeli) non aggiunte: Armellini parte II non letta. | Completezza, sezione 2 riga 23 | Leggere Armellini, parte II | noi | aperta |
| 34 | Sant'Omobono non aggiunto: manca una fonte sulla sua storia (Platner non basta). | Completezza; mancanti 2 (608f5be) | Trovare e leggere una fonte sull'area sacra | noi | aperta |
| 35 | Domus Tiberiana ridotta (schema). | Mancanti, primo gruppo (ca4df82) | Leggere lo stato fra IV e IX secolo e rifarla | noi | aperta |
| 36 | Orientamento dei templi nuovi (Foro Olitorio) e misure non date dalle fonti: schema. | Mancanti, primo gruppo (ca4df82) | Leggere le voci Ianus, Spes, Iuno Sospita, Pietas | noi | aperta |
| 37 | Il cartellino della Magna Mater sta discosto dal tempio. | Mancanti, primo gruppo (memoria) | Mettere `ex`/`ez` sul tempio | noi | aperta |
| 38 | Settizodio: la frase «in rovina alla fine dell'VIII secolo» di it.wikipedia non è stata letta nella sua fonte. | Completezza, 5.1; primo gruppo (641f831) | Trovare la fonte della frase | noi | aperta |
| 39 | Voci di Platner e Ashby non lette alla data del rapporto: Divus Iulius, Templum Romuli, Ianus Quadrifrons, Vesta (parte tarda), Magna Mater (parte tarda), Apollo Palatino (parte tarda). Domanda aperta: quante sono state lette dopo? | Completezza, sezione 7 | Controllare le fonti annotate in `src/testi/topografia-fonti.md` e leggere quelle che mancano | noi | aperta |
| 40 | Coordinate «da prendere»: tempio di Vespasiano (punto esatto), sepolcro di Bibulo, rampa di Domiziano, archi di Augusto e di Tiberio, Pigna in Vaticano, prua dell'isola Tiberina. | Completezza, sezione 7 | Prenderle da Sovrintendenza o Wikidata | noi | aperta |
| 41 | Statua equestre di Marco Aurelio e Pigna: lasciate fuori per mancanza di fonte; l'utente ora chiede di metterle «nella zona più probabile». | Mancanti 2 (608f5be); richiesta delle 6:35 | Lavoro già in coda: fonti lette, poi posto più probabile dichiarato ipotesi | noi | aperta |
| 42 | Ara Pacis: c'è, dentro il gruppo dell'orologio di Augusto, senza nome né scheda, con misure «a memoria, indicative». | Verifica delle 6:45 (memoria) | Lavoro già in coda: voce di Platner e Ashby e pagina del museo | noi | aperta |
| 43 | Rampa di Domiziano non aggiunta (pagina non raggiungibile); Giunone Moneta e Arx non disegnati; Excubitorium della VII coorte e archi di Augusto e Tiberio non fatti. | Mancanti 2 (608f5be); completezza | Riprovare la pagina; leggere le voci; decidere | noi | aperta |
| 44 | Obelisco Capitolino non aggiunto (posto antico ignoto); quello dell'isola Tiberina sta in `js/mura.js` senza voce propria. | Templi e obelischi (d5dad2f) | Decidere se aggiungerli; dare una voce a quello dell'isola | noi | aperta |
| 45 | Obelischi: l'Itinerario di Einsiedeln è citato come lo cita Platner, non letto direttamente per gli obelischi. | Templi e obelischi (d5dad2f) | Leggere i passi nell'edizione Urlichs 1871 | noi | aperta |
| 46 | Tempio di Adriano: 13 o 15 colonne? | Templi (d5dad2f) | Rileggere la voce e contare | noi | aperta |
| 47 | Le siepi del tempio di Claudio restano ordinate nell'800. | Templi (d5dad2f) | Farle inselvatichire dopo l'abbandono | noi | aperta |
| 48 | Voci non riaperte per Giove Capitolino, Iseo, largo Argentina, Marte Ultore. | Templi (d5dad2f) | Leggerle e confrontare col modello | noi | aperta |
| 49 | Marforio: volto e riccioli restano rozzi. | Marforio terzo giro (d5dad2f) | Quarto giro sulla testa, accanto alla fotografia | noi | aperta |
| 50 | Terme: case che toccano le esedre nuove. | Terme (b3f37ed) | Allargare le zone libere attorno ai recinti | noi | aperta |
| 51 | Terme di Tito: voce non riletta (corpo centrale comune). | Terme (b3f37ed) | Leggere la voce e dare un disegno proprio | noi | aperta |
| 52 | Sette Sale e cisterna di Diocleziano non fatte. | Terme (b3f37ed) | Leggere le voci e aggiungerle | noi | aperta |
| 53 | La vecchia funzione `terme()` non è più chiamata: codice morto da togliere. | Terme (b3f37ed) | Toglierla da `js/monumenti.js` | noi | aperta |
| 54 | Teatri: le colonne del portico di Pompeo da lontano sembrano muri. | Teatri (5645284) | Guardare da lontano e alleggerire | noi | aperta |
| 55 | Teatro di Marcello: le fonti danno tre raggi diversi; nel modello 59-60 m. | Teatri (5645284) | Decidere quale misura e dirlo in scheda | noi | aperta |
| 56 | Sant'Agnese in Agone non disegnata. | Teatri (memoria) | Leggere da quando c'era e decidere | noi | aperta |
| 57 | Il terremoto del 442 non è usato. | Teatri (memoria) | Leggere la fonte e decidere se mostrarlo | noi | aperta |
| 58 | Horti: il terreno del modello non ha la valle dei Sallustiani. | Horti (4be91f6) | Scavare la valle nel terreno (`js/base.js`) | noi | aperta |
| 59 | Horti: la volta dell'Auditorium di Mecenate sembra «una capsula». | Horti (memoria) | Rifare la volta | noi | aperta |
| 60 | Horti: i riquadri dei Lamiani restano ordinati sotto il bosco. | Horti (memoria) | Sfumarli dopo l'abbandono | noi | aperta |
| 61 | Horti: «solo una seconda fonte». Domanda aperta: si intende che per gli horti c'è una sola fonte oltre a Platner e Ashby? | Horti (memoria) | Chiarire e, se serve, cercare un'altra fonte | noi | aperta |
| 62 | Colosseo: il colonnato di legno in cima resta col tetto rosso nell'800. | Moli in rovina (18ec8a6) | Toglierlo o farlo rovinare | noi | aperta |
| 63 | Circo Massimo: le pozze d'acqua restano azzurre (da verificare se sono la palude della scheda). | Moli in rovina (18ec8a6) | Leggere la scheda e intonare l'acqua | noi | aperta |
| 64 | Acquedotti non controllati contro «ciò che resta oggi». | Moli in rovina (18ec8a6) | Guardarli nell'800 accanto ai resti di oggi | noi | aperta |
| 65 | Tempio di Venere e Roma: il tetto è una lastra piatta, non si può mostrare senza tegole dal 630. | Moli in rovina (18ec8a6) | Cambiare la forma del tetto | noi | aperta |
| 66 | Chiese minori di `js/nuclei.js` simili fra loro; archi, portici, porte, torri, acquedotti e alberi da guardare «con lo stampino» (riscontro dell'amico dell'utente). | Riscontro delle 01:25 (memoria) | Un foglio «tutti affiancati» per ogni famiglia, poi correggere | noi | aperta |
| 67 | Alcune chiese minori stanno sotto il terreno o dentro edifici antichi. | Controllo a tappeto (25 novembre) | Controllare le quote e i posti in `js/nuclei.js` | noi | aperta |

## Vita della città e case

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 68 | Il fumo parte ancora 10-17 m sopra le case altomedievali (`js/vita.js`, righe 747-748). | Case altomedievali (1a71376) | Usare la quota della casa nuova | noi | aperta |
| 69 | Nell'800, dalla vista d'insieme, i nuclei abitati quasi non si leggono. | Case altomedievali (1a71376) | Rendere più leggibili case, orti e fumo attorno alle chiese | noi | aperta |
| 70 | Una casa altomedievale lasciata o bruciata lascia una rovina «romana». | Case altomedievali (1a71376) | Dare una rovina propria alle case nuove | noi | aperta |
| 71 | Niente case dentro i monumenti (Fori, basilica Emilia, arcate dello stadio di Domiziano: un atto del 958 lo dice per lo stadio). | Case altomedievali (1a71376) | Leggere l'atto del 958 e le fonti sui Fori, poi aggiungerle | noi | aperta |
| 72 | Non trovato un testo leggibile dei due scavatori (Meneghini, Santangeli Valenzani) né pagine sulle case della Crypta Balbi. | Case altomedievali (1a71376) | Cercare ancora; se si trovano, confrontare | noi | aperta |
| 73 | `?notte=1` non accende le finestre (il bottone «Notte» sì). | Vita della città (c29f5ef) | Correggere il parametro | noi | aperta |
| 74 | Nell'800 i fotogrammi sono un poco sotto (+2,7% di triangoli per i rovi tornati). | Vita della città (c29f5ef) | Misurare sul PC e sull'iPhone dell'utente | noi e l'utente | aperta |
| 75 | «Densità per ettaro non oltre 3 lotti» (memoria). Domanda aperta: è un limite voluto o una riserva da sciogliere? | Vita della città (memoria) | Chiarire leggendo `js/citta.js` | noi | aperta |
| 76 | `PIANTA_REG` in `js/citta.js` va rifatta ogni volta che cambiano le regioni (rifatta il 27 mattina; lo script sta nello scratchpad e va riscritto al bisogno). | Vita della città (c29f5ef); case (1a71376) | Rifarla dopo ogni lavoro che tocca `js/regioni.js` (anche dopo Marco Aurelio, Pigna, Ara Pacis) | noi | aperta |

## Strade e rovine

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 77 | Dalla veduta larga le moli dei monumenti restano piccole: servono luce e foschia che stacchino i volumi alti (`js/base.js`). | Moli in rovina (18ec8a6) | Lavoro «veduta larga dell'800», in coda | noi | aperta |
| 78 | Il verde dei monumenti sono ancora palline e macchie piatte; niente alberi nelle aule scoperchiate né fichi sulle creste. | Moli in rovina (18ec8a6) | Alberi veri nelle aule, verde meno tondo | noi | aperta |
| 79 | I gusci delle insulae non hanno spessore nei vani delle finestre; da lontano sono bassi (12-16 m). | Moli in rovina (18ec8a6); strade e rovine (e70aa1d) | Dare spessore ai vani; guardare da lontano | noi | aperta |
| 80 | I cumuli hanno ancora il contorno a sette lati e sul lato in ombra diventano scuri e bluastri («a tuta mimetica», «a faccette»). | Strade e rovine (e70aa1d); moli (18ec8a6) | Rifare il contorno e l'ombreggiatura | noi | aperta |
| 81 | Quasi tutte le vie grandi risultano «tenute» e restano lastricate. | Strade e rovine (e70aa1d) | Ricontrollare `TENUTE` contro l'Itinerario di Einsiedeln | noi | aperta |
| 82 | Le lastre chiare nei Fori non sono fatte. | Strade e rovine (e70aa1d) | Aggiungerle in `js/monumenti.js` da una fonte letta | noi | aperta |
| 83 | Strade e rovine non guardate al gradino «bassa». | Strade e rovine (e70aa1d) | Catture con `?qualita=bassa` | noi | aperta |
| 84 | Triangoli nell'800 +5,8% (4,55 milioni): un piccolo calo dei fotogrammi non è dimostrato né escluso. | Moli in rovina (18ec8a6) | Guardare l'800 sull'iPhone e sul PC dell'utente | solo l'utente | aperta |
| 85 | Strade del rapporto del 24 novembre (casi 8-17): Salaria, Vicus Longus, Alta Semita e via Settimiana che cominciano o finiscono nel nulla, Foro Boario senza strada, la Portuense che taglia la cinta di sbieco. Domanda aperta: quali sono state chiuse il 25? | Strade, porte e archi (24 novembre) | Ricontrollare i casi uno per uno | noi | aperta |

## Corse

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 86 | Le quadrighe sono piccole per chi guarda (la camera non scende sotto i 160 m). | Corse (86bd7ae) | Abbassare la distanza minima sopra il circo, o una vista apposta | noi | aperta |
| 87 | Da vicino i cavalli restano un po' a blocchi. | Corse (86bd7ae) | Rifare i cavalli con `pelle()` | noi | aperta |
| 88 | Il corridore dello stadio sembra un manichino. | Corse (86bd7ae) | Rifare la figura in corsa | noi | aperta |
| 89 | Le uova contagiri restano ferme. | Corse (86bd7ae) | Farle scendere a ogni giro (se la fonte lo dice) | noi | aperta |
| 90 | La sabbia dell'arena ha il disegno a lastre. | Corse (86bd7ae) | Cambiare la trama dell'arena | noi | aperta |
| 91 | Il peso delle corse non è misurabile in Edge senza finestra (circa 70.000 triangoli nel 235). | Corse (memoria) | Misurare sul PC e sull'iPhone dell'utente | solo l'utente | aperta |
| 92 | Fra le tappe con la corsa c'è il 284, ma il 284 è solo un intermezzo («La moneta», `#284-moneta`). Domanda aperta: la corsa si vede lì? | Corse (86bd7ae) | Aprire `#284-moneta` e guardare il circo | noi | aperta |

## Fluidità e telefoni

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 93 | Dove la città va a scatti sul PC (apertura, voli, mouse). | Elenco «da fargli vedere» | Dirlo dopo una prova sul suo PC | solo l'utente | aperta |
| 94 | «Non provato su telefoni veri»: Emporio, mancanti, 410, Tevere, barche, corrente, case altomedievali, corse. | Quasi tutti i lavori della notte | Guardarli sull'iPhone | solo l'utente | aperta |
| 95 | `?prova=qualita` su Android non fatta. | Elenco «da fargli vedere» | Aprirla su un Android | solo l'utente | aperta |
| 96 | Sull'iPhone è acceso «Riduci movimento»? Cambia la regia, la corrente e le scene. | Elenco «da fargli vedere» | Dirlo | solo l'utente | aperta |
| 97 | Case e rovine non vengono scartate fuori dall'inquadratura (dividerle in riquadri). | Resa e fluidità (23 novembre) | Lavoro di fluidità | noi | aperta |
| 98 | Proposte rimaste a parità d'immagine: messe in scena costruite solo quando servono (circa un secondo d'apertura), `muoviGente` in `js/vita.js`, letture dell'impaginazione in `js/scene-tappe.js` e `js/strade-nomi.js`. | Fluidità (d2fed3c) | Lavoro di fluidità | noi | aperta |

## Infografiche

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 99 | La prova delle scritte dà zero casi per quattro infografiche; le altre quindici restano da provare. | Infografiche (820b217) | `src/prove/infografiche-scritte.js` sulle altre quindici, a 393 con scritte allargate e a 1280 | noi | aperta |
| 100 | Col telefono coricato la carta del 235 e la pianta degli acquedotti sono piccole. | Infografiche (23 novembre) | Rifare l'impaginazione a 812 x 375 | noi | aperta |
| 101 | A 1280 spazio vuoto nella colonna di destra di «I barbari» (e prima di «L'altare», ora dentro la Curia). | Infografiche (23 novembre) | Guardare a 1280 e riempire o stringere | noi | aperta |
| 102 | Curia e «Il trionfo del Cristianesimo a Roma» a schermo stretto sull'iPhone. | Infografiche (820b217) | Guardarle sull'iPhone | solo l'utente | aperta |
| 103 | Sul telefono: linea del tempo, la × e «Senza soldi non c'è esercito». | Elenco «da fargli vedere» | Guardarle sul telefono | solo l'utente | aperta |

## Pagina e linea del tempo

| N | Riserva | Da quale lavoro | Che cosa serve per chiuderla | Chi la chiude | Stato |
|---|---|---|---|---|---|
| 104 | La linea del tempo nascosta fin dal primo istante: corretta dopo una prova dell'utente sul telefono, non riguardata da lui. | Linea del tempo all'apertura (6b07905) | Riaprire la pagina sul telefono | solo l'utente | aperta |
| 105 | Velo di caricamento e carta prima della città su iPhone e Android. | Attesa (d2fed3c), carta prima (d96d3cc) | Guardarli sui telefoni | solo l'utente | aperta |
| 106 | «Riproduci»: tempi di ogni tappa e pausa quando si apre una finestra non verificati. | Richiesta delle 21:00 del 26 (memoria) | Tabella tappa per tappa; prove con ogni finestra | noi | aperta |
| 107 | «Riproduci»: proposta dell'utente di tornare su alla carta quando si è letto fino in fondo. Lettura nostra: si può, senza mai strappare la pagina a chi legge. | Richiesta delle 21:00 del 26 (memoria) | Conferma dell'utente, poi lavoro | solo l'utente decide | aperta |
| 108 | Date «27 novembre» scritte per errore in commenti del 26. | Memoria, riserve del 26 | Cercarle e correggerle | noi | aperta |
| 109 | Pareri sui nomi delle strade sulla scena. | Nomi delle strade (25 novembre) | Parere | solo l'utente | aperta |
| 110 | Pareri sulle regioni (strumento «Regioni e quartieri»). | Regioni (25 novembre) | Parere | solo l'utente | aperta |
| 111 | Pareri sugli horti nuovi. | Horti (4be91f6) | Parere | solo l'utente | aperta |
| 112 | Riga nel piede sulle scelte della notte: ogni lavoro ha aggiunto una frase; non è stato riletto il piede intero dopo tutte le aggiunte. Domanda aperta: si ripete? è troppo lungo? | Tutti i lavori della notte | Rileggere la voce «Come abbiamo ricostruito…» del piede | noi | aperta |

## Scelte fatte senza chiedere, da confermare

1. Le corse nel Circo Massimo solo in alcune tappe: 235, 260, 284, 301, 330, 363, 384, 402, 418, 439, 468, 507 (una sì e una no, saltando quelle con un'altra scena vicina) (86bd7ae).
2. Nessuna corsa dopo il 507: Procopio III 37, 4 dice che Totila guardò le corse nel 549-550 ma non dove (86bd7ae).
3. Stadio di Domiziano: atleti solo nel 235 (86bd7ae).
4. Le chiatte tirate dai buoi finiscono la corsa sulla riva opposta all'Emporio (portarle alla banchina sarebbe un'ipotesi) (2cb97a8).
5. L'Emporio in uso fino al 429: dal 430 nessuna chiatta alla banchina (2cb97a8).
6. I buoi camminano sulla riva destra (a sinistra dal 271 le mura sono a filo d'acqua) (2531ffd).
7. Nell'846 le barche seguono i commerci, non più sedici (2531ffd).
8. Marforio davanti al Carcere Mamertino per tutti gli anni; prima dell'VIII secolo il posto è un'ipotesi (2da1ca7).
9. Bocca della Verità non disegnata fra il 235 e l'852: tenuta per «Roma oggi» (completezza, 5.3).
10. Case romane sostituite da quelle altomedievali casa per casa fra il 690 e l'805; rappezzate dal 550; case a due piani dal 775; dal 650 una casa che torna abitata è del tipo nuovo; tetto di scandole preso da una carta del 1012 come confronto (1a71376).
11. Terme di Agrippa «cava» dal 650 (anno scelto nel VII secolo) (b3f37ed).
12. Terme di Traiano, Costantino e Nerone «abbandonate, ma in piedi» dal 537 (b3f37ed).
13. Non aggiunte le terme di Sura, Deciane, Commodiane, Severiane (posto o forma non sicuri) (b3f37ed).
14. Teatro di Marcello «abbandonato» dal 537 invece che «cava» (5645284).
15. Anfiteatro Castrense intero fino al 271, poi bastione delle mura (5645284).
16. Templi chiusi nel 392, poi «abbandonati, ma in piedi» (scelta del modello) (641f831, d5dad2f).
17. Fine dell'uso dei Fori nel 537 (2da1ca7).
18. Tempio della Pace bruciato nel 500 (Procopio dice «da molto tempo»: l'anno è una scelta) (2da1ca7).
19. Antonino e Faustina chiesa dal 700; Regia casa privata dal 700 (anni scelti fra VII e VIII secolo) (641f831, ca4df82).
20. Settizodio: angolo esatto scelto; ninfeo fino al 537 (641f831).
21. Domus Augustana in uso fino al 720 (608f5be).
22. Venere e Roma di nuovo in uso dal 312 dopo l'incendio del 307 (durata scelta); tempio del Sole spogliato dal 532 (data scelta nel VI secolo) (d5dad2f).
23. San Giovanni a Porta Latina dal 500 (l'anno più tardo che la fonte permette); Santa Martina dal 630 (ca4df82).
24. Dioscuri dal 443 davanti alle terme di Costantino: posto, altezza e forma scelti; la fonte dice «probabile» (608f5be).
25. Suburra la più fitta perché le fonti la dicono affollata, non per un numero; sul Palatino solo domus (c29f5ef).
26. Fontane dei quartieri con l'acqua fino al 537 e, dal 776, solo accanto alle case abitate (c29f5ef).
27. Regola nuova: ciò che è ancora in piedi oggi, nell'800 del modello è in piedi almeno quanto oggi (18ec8a6).
28. Vie «tenute» scelte dai percorsi dell'Itinerario di Einsiedeln, più il percorso del pellegrino (e70aa1d).
29. Specie, viali e recinti degli otto horti; statue dei Lamiani via nel 537 (4be91f6).
30. Infografica sulle mura sì (in fondo alla coda), trionfo di Aureliano in movimento sì, infografica su Artù no, sugli Arabi no (memoria, 26 sera).
31. «Riproduci»: risalita lenta alla carta quando si arriva in fondo al testo, mai mentre si legge, mai con «meno animazioni» (lettura nostra della proposta dell'utente).

## Che cosa le fonti lette non dicono, e resta schema dichiarato in pagina

1. Il colore del Tevere: le fonti dicono «flavus» (Orazio, Virgilio); il grigio-verde è una scelta dell'utente, detta nel piede.
2. Barche: misure, forme, colori, velocità; chi guidava i buoi (il bovaro è un'ipotesi, detta nel piede).
3. Emporio: numero delle barche, carichi, mucchi; nessun testo letto descrive lo scarico; nessuna apertura nelle mura di riva dopo il 271.
4. 312: nessuna fonte parla di due ponti; punto e forma del taglio, posto del ponte di travi, numeri, tempi, colori.
5. 800: andatura e tempi del corteo di Carlo.
6. Corse: velocità, sorpassi, chi vince, forma dei carri, polvere, quanta gente sulle gradinate; dove corse Totila; fino a quando si gareggiò nello stadio.
7. Terme: altezze, sale minori, numero delle arcate.
8. Teatri: altezze, numero degli archi, la facciata di Balbo; la misura dell'Odeon.
9. Horti: quali alberi, viali e recinti ci fossero.
10. Templi nuovi del Foro Olitorio: orientamento e misure non date.
11. Obelischi: per nessuno l'anno della caduta; restano in piedi fino all'852 e ogni scheda lo dice.
12. Rovine: come e in quanto tempo caddero quartieri e lastricati; quanto verde e in quanto tempo; il mattone a vista e i fori delle grappe dove il marmo è stato tolto.
13. Densità: i numeri dei Cataloghi non contano palazzi; se ne usano solo i rapporti.
14. Case altomedievali: quando le case romane furono sostituite; misure, finestre, colori, tetti.
15. Panni stesi, tende, banchi: nessuna fonte letta, quindi non ci sono.
16. Marforio: dove stava prima dell'VIII secolo; che «Tiberis» dell'Itinerario sia il Marforio lo dicono gli studiosi.
17. Settizodio: l'angolo esatto della facciata.
18. Dioscuri: la fonte dice «probabile»; posto, altezza e forma.
19. Vesti delle figure: lana non tinta dove manca una fonte.
20. Pantheon: forma e data del tondo di bronzo nel timpano.
