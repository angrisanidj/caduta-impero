# Audit dei contenuti · 23 novembre 2026

Lettura di `js/dati.js` (TAPPE, ATTI, CAMBI, LUOGHI_TAPPA, SCENE_CARTA, PASSI_CARTA, EVENTI, SCHEDE, CURVE), di `src/testi/scritte.md` e, per i soli anni con una scena, di `js/scene-tappe.js` e `js/atti.js`. Nessun file del progetto è stato modificato. Sigle come in `scritte.md` (`T05-274` = quinta tappa, anno 274). Le righe sono quelle di `js/dati.js` alla data di oggi.

**Riepilogo**
1. Il racconto ha tre vuoti lunghi in cui la carta cambia senza che un testo lo spieghi: la riconquista dell'Africa (533-534), il VII secolo (609-711, due sole tappe) e gli anni 801-846 (Verdun e la Sicilia araba).
2. Ci sono incoerenze interne nette su tre punti: l'argento dell'antoniniano nel 274 (il testo dice il contrario dell'intermezzo e della curva), la data del terremoto dell'801 (29 o 30 aprile, secondo il punto della pagina) e i confini dell'atto V (476-590), che lasciano fuori le tappe del 593 e del 597.
3. Il tracciato schematico dei monaci di Agostino passa per Pavia longobarda. Le lettere di Gregorio indicano invece la via della Provenza e del Rodano.
4. Alcune frasi hanno perso una cautela: Vittore di Vita non è nominato nel 429, il «primo imperatore caduto» del 251 non ha fonte, il papa che «di fatto» governa Roma nel 663 lo dice dieci anni dopo l'arresto di Martino I, e il Colosseo dell'852 sarebbe stato «cava» prima del crollo.
5. Mancano alcune pastiglie dell'apparato: il riquadro degli storici per il 542, l'800, il 418 e il 568, Gallieno fra i protagonisti del 260 e una didascalia della città per il 293.

---

## Priorità alta

**A1. La riconquista vandalica dell'Africa (533-534) non è raccontata**
- Dove: tappe T36-526 (r. 532) e T37-537 (r. 534); `CAMBI` 537 (r. 394: `africa:'oriente'`, `sardegna`, `sicilia`); il passo della carta del 537 parte da Siracusa.
- Problema: nel 537 la carta ricolora Africa, Sardegna e Baleari come impero d'Oriente, ma nessun testo nomina Belisario in Africa, Gelimero, Ad Decimum o Tricamaro («Gelimero» non compare in nessun file). Chi legge vede l'Africa vandala dal 439 al 526 e poi imperiale, senza spiegazione.
- Proposta: aggiungere al testo del 537, prima di «Nel 535», una frase come: «Nel 533 Belisario sbarca in Africa e in pochi mesi abbatte il regno dei Vandali; nel 534 il re Gelimero si arrende». Meglio ancora una tappa «534 · La fine dei Vandali» con Gelimero e Belisario fra i protagonisti. Come voce c'è Procopio IV 9, il trionfo di Belisario a Costantinopoli, con il tesoro del Tempio di Gerusalemme portato via da Roma nel 455: lega con la tappa del 455.
- Fonte: Procopio, Guerre III 10 - IV 9 (Dewing, LacusCurtius); Vittore di Tunnuna, all'anno 534.

**A2. Fra l'801 e l'846 la carta e il racconto saltano quarantacinque anni**
- Dove: fra T53-801 (r. 602) e T54-846 (r. 604); `CAMBI` 846 (r. 412: `sicilia:'conteso'`, `creta:'califfato'`); le linee di Verdun (`VERDUN` in `src/mappa/genera.mjs`).
- Problema: la carta disegna la divisione dell'843, ma nessun testo nomina Verdun (zero risultati in `dati.js` e in `scritte.md`). Mancano anche la morte di Carlo Magno (814), Ludovico il Pio, la Constitutio Romana dell'824, che lega l'elezione del papa al giuramento all'imperatore ed è un fatto di Roma, e lo sbarco arabo a Mazara dell'827, che spiega da dove vengono i Saraceni dell'846.
- Proposta: una tappa «843 · Il trattato di Verdun» con Lotario I, Ludovico il Germanico e Carlo il Calvo. Il testo direbbe dell'814, dell'824, dell'827 e dell'843. Come voce, Nitardo IV o gli Annali di San Bertino all'anno 843. Il testo del 846 potrebbe allora dire «dalla Sicilia, dove gli Arabi combattono dall'827».
- Fonte: Annales Bertiniani 843; Nitardo, Storie IV 1-3; Constitutio Romana (MGH Capitularia I, n. 161); Vasiliev, Byzance et les Arabes I (già citato nel commento della r. 246).

**A3. Il VII secolo ha due tappe in cento anni (609-711)**
- Dove: T45-609 (r. 577), T46-663 (r. 579), T47-711 (r. 581); `CAMBI` 663 (r. 403: Levante ed Egitto «califfato», Balcani, Mesie).
- Problema: fra il 609 e il 711 passano cento anni con solo la visita di Costante II. Nel 663 la carta dà il Levante e l'Egitto al califfato in silenzio: le conquiste arabe si leggono solo nei passi del 711. A Roma mancano i fatti più rivelatori del secolo. Il primo è la Curia trasformata in Sant'Adriano verso il 630, già nelle schede (r. 797) ma mai in una tappa. Il secondo è l'arresto di papa Martino I nel Laterano (653), portato a Costantinopoli e mandato in esilio in Crimea.
- Proposta: una tappa «653 · Il papa arrestato» con Martino I, Costante II e l'esarca Teodoro Calliopa. Il testo direbbe del sinodo lateranense del 649 e dell'arresto; si può aggiungere che intanto la Siria e l'Egitto sono passati al califfato (636-642). Nella città, una didascalia sul Laterano; ma la regola «un evento si vede solo se cade nell'anno di una tappa» lascerebbe fuori Sant'Adriano. In alternativa, una tappa del 630 su Onorio I (Curia e tegole di San Pietro, entrambe già nei dati).
- Fonte: Liber Pontificalis, vita di Martino I (Duchesne I, pp. 336-340); la Commemoratio e le lettere di Martino (PL 129, coll. 585-604); per la Curia, LP, vita di Onorio I.

**A4. Argento dell'antoniniano: il testo del 274 e il sommario dell'atto I contraddicono l'intermezzo e la curva**
- Dove: T05-274 (r. 424) «la moneta, che ormai contiene appena il 5% d'argento»; `[atto.I.sommario]` (r. 320) «la percentuale del metallo prezioso scende a circa il 5%»; intermezzo T06 (r. 426); `CURVE.argento` (r. 637-638: «Gallieno… 2,5% a fine regno», punti `[268,3],[274,5]`).
- Problema: l'intermezzo e la curva dicono che sotto Claudio II la moneta è quasi tutta di rame (2-3%) e che il 5% è il minimo fissato da Aureliano. Il testo del 274 e il sommario fanno del 5% il punto più basso della caduta. Il lettore legge due cose opposte a pochi centimetri di distanza.
- Proposta: per il 274, «Con una riforma monetaria arresta la perdita di valore della moneta: l'argento, sceso sotto il 3%, deve tornare ad almeno il 5%». Per il sommario dell'atto I, «… scende a pochi punti percentuali, finché Aureliano non ne fissa un minimo del 5%».
- Fonte: già nei dati (Walker in Katsari 2002; RIC online). La sigla XXI sulle monete riformate è in RIC V/1.

**A5. Terremoto dell'801: tre date diverse nella stessa pagina**
- Dove: T53-801 (r. 602): «notte tra il 29 e il 30 aprile… Le cronache indicano il 30 aprile»; `EVENTI` terremoto801 (r. 784): «29 aprile 801, di sera»; `LUOGHI_TAPPA` 801 (r. 1185 circa): «il terremoto del 29 aprile»; scheda di San Paolo (r. 828): «notte fra il 29 e il 30… cioè il 30».
- Problema: la fonte (Annales regni Francorum, «II. Kal. Mai. hora noctis secunda», citata nel commento della r. 144) dà il 30 aprile alla seconda ora di notte. La didascalia della città e la riga della carta affermano il 29 senza cautela, contro il testo della tappa.
- Proposta: scegliere una forma sola. Per esempio «30 aprile 801, di notte (II Kal. Mai., seconda ora)» ovunque, oppure ovunque «la notte fra il 29 e il 30», con la nota sul computo. La scheda di San Paolo attribuisce la formula al Liber Pontificalis e il commento agli Annali: va controllato che le due fonti dicano davvero la stessa cosa.
- Fonte: Annales regni Francorum 801 (ed. Kurze, p. 114); LP, vita di Leone III (Duchesne II, p. 8).

**A6. L'atto V finisce nel 590, ma contiene le tappe del 593 e del 597**
- Dove: `ATTI` (r. 327-329: V `a:590`, VI `da:590`); `apre` sta sulla tappa del 609, quindi 589, 593 e 597 sono contati nell'atto V; `js/atti.js` r. 86 (`t.anno>=at.a` esclude le tappe) e r. 133 (mostra «476–590»).
- Problema: la scheda «L'atto in breve» dell'atto V scrive «476–590» e la sua carta «Tappa per tappa» salta il 593 e il 597. Il sommario dell'atto VI, intanto, racconta il papa che «tratta con gli assedianti», cioè la tappa del 593, che sta nell'atto V. Il sommario non riassume più le tappe del proprio atto, come vuole il `CLAUDE.md`.
- Proposta: portare la fine dell'atto V e l'inizio del VI a 609, togliendo dal sommario del VI la frase su grano e assedianti (o spostandola nel V). In alternativa, mettere `apre` sulla tappa del 589 o del 593 e lasciare 590. In ogni caso va riprovata la miniatura degli atti.
- Fonte: interna.

**A7. Il cammino di Agostino passa per il regno longobardo**
- Dove: `SCENE_CARTA` 597 (r. 1254-1256): Roma, Lucca, Pavia, Torino, Susa, Lione, Autun, Parigi, Boulogne.
- Problema: il commento lo dichiara uno schema, ma nel 596 Lucca e Pavia erano longobarde e ostili (tre anni prima Agilulfo era sotto Roma, tappa del 593). Le lettere di raccomandazione di Gregorio del luglio 596 sono indirizzate all'abate di Lérins e ai vescovi di Aix, Arles, Marsiglia, Vienne, Lione, Autun e Tours. Indicano quindi la via del mare fino alla Provenza e poi del Rodano. Beda I 24 riporta la lettera al vescovo di Arles.
- Proposta: mare da Roma (o da Porto) a Lérins e Marsiglia, poi Aix, Arles, Vienne, Lione, Autun, Tours (o Parigi) e la Manica. Nel commento: «tappe dalle lettere di Gregorio; il tracciato fra le città resta uno schema».
- Fonte: Gregorio Magno, Registrum VI 50a-57 (MGH Epp. I, pp. 423-432); Beda I 23-24.

**A8. Il Colosseo nell'852: «cava» prima del crollo**
- Dove: T55-852 (r. 606): «Il lato sud del Colosseo, per esempio, servì a lungo da cava. Il Parco archeologico… attribuisce il crollo della parte che restava al terremoto dell'847»; `MONUMENTI` colosseo `[523,'cava']` (r. 654); `CERTEZZA` colosseo (r. 885): «già in parte smontato».
- Problema: l'ordine dice che il lato sud fu smontato prima dell'847 e poi crollò la parte rimasta. Lo spoglio su larga scala del travertino è documentato dal XIV-XV secolo, cioè dopo il crollo e sulle sue macerie. Prima dell'847 si conoscono soprattutto i buchi lasciati togliendo le grappe di metallo. Se il «già in parte smontato» viene da una fonte (forse il testo del Parco), va citata. Se no, è un'ipotesi detta come fatto, e in più fra passato remoto e presente.
- Proposta: «L'anello esterno, sul lato sud, crollò: forse nel terremoto dell'847, come pensa il Parco archeologico del Colosseo, o nel 1349, come vuole la tradizione. Nessuna cronaca dell'epoca descrive il crollo. Le macerie servirono poi per secoli da cava». Va riguardato anche lo stato `cava` dal 523 (forse `spogliato`).
- Fonte: pagina del Parco archeologico già usata; Rea, Rota Colisei (2002); Lanciani, Storia degli scavi I.

## Priorità media

> Fatte il 23 novembre 2026, alle 17, sulle fonti indicate accanto a ciascuna in `js/dati.js` (script in scratchpad `audit.py`): M1, M2, M3, M4, M8, M10, M11, M12, M13, M16, M17. Le altre (M5-M7, M9, M14, M15) erano già state applicate con gli errori chiari.

**M1. La Britannia «usurpatore» nel 293 non è spiegata**
- Dove: `CAMBI` 293 (r. 372); T07-293 (r. 428).
- Problema: la carta colora la Britannia come usurpata e Carausio compare solo nei commenti. Né il testo, né i luoghi, né i protagonisti lo nominano.
- Proposta: una riga in `LUOGHI_TAPPA` 293 (Londra: «Carausio, poi Alletto, governano la Britannia dal 286 al 296») oppure una frase nel testo.
- Fonte: Eutropio IX 21-22; Aurelio Vittore 39, 20-21 e 39-42.

**M2. Gallieno manca nel 260**
- Dove: T03-260 (r. 420), protagonisti.
- Problema: il sovrano regnante dal 253 al 268, figlio di Valeriano, non c'è. Di lui manca anche l'editto di tolleranza del 260, che spiega il «nel 311 Galerio…» del 312 come ritorno a una situazione già vista. Manca pure l'irruzione di Alamanni e Iutungi in Italia, ricordata dall'altare di Augusta del 260. Aurelio Vittore, nella voce del 271, parla di «ciò che era avvenuto sotto Gallieno», ma Gallieno non è mai presentato.
- Proposta: Gallieno fra i protagonisti del 260, con questa riga: «Figlio di Valeriano, regna da solo dal 260 al 268; perde le Gallie e l'Oriente; nel 260 restituisce ai cristiani chiese e cimiteri».
- Fonte: Eusebio, Storia ecclesiastica VII 13; l'altare di Augusta (AE 1993, 1231); Aurelio Vittore 33.

**M3. 380 e 325: la religione dell'impero non viene mai fissata**
- Dove: atto II, T13-378 (r. 445) e T15-394 (r. 452); T35-507 (r. 528), che spiega l'arianesimo di passaggio.
- Problema: il racconto passa da Milano (313) ai divieti del 391-392 senza l'editto di Tessalonica (380, «Cunctos populos»), di solito quello che il lettore si aspetta. Manca anche la scelta ariana dei Goti (Ulfila, la conversione sotto Valente). Eppure tutto l'atto V si regge sulla differenza fra re ariani e cattolici: Teodorico, Clodoveo, l'Anonimo Valesiano «cattolico».
- Proposta: nel testo del 394, «Nel 380 Teodosio aveva già imposto a tutti i sudditi la fede di Nicea»; nel 378, una frase: «I Goti passati il Danubio sono cristiani, ma ariani, come l'imperatore Valente».
- Fonte: Codice Teodosiano XVI 1, 2; Socrate IV 33; Giordane, Getica 131-133.

**M4. Il ritorno dell'altare della Vittoria fra il 357 e il 382 manca**
- Dove: T11-357 (r. 438), «Costanzo fa rimuovere… l'altare»; T14-384 (r. 448), «Intorno al 382 l'imperatore Graziano fa rimuovere… l'altare».
- Problema: l'altare viene rimosso due volte senza che si dica che era tornato al suo posto.
- Proposta: nel 384, «L'altare, tolto da Costanzo II nel 357, era stato rimesso al suo posto, forse sotto Giuliano». La data va lasciata incerta, perché le fonti non la dicono.
- Fonte: Ambrogio, Lettera 18, 32; Simmaco, Relazione III 4-6.

**M5. Gli 80.000 Vandali del 429 senza l'autore**
- Dove: T23-429 (r. 483): «Con le famiglie al seguito sarebbero forse 80.000 persone».
- Problema: la cifra è di Vittore di Vita. L'intermezzo T25 dice che è discussa e cita la spiegazione di Procopio. Nel testo della tappa la cifra resta senza autore.
- Proposta: «Secondo Vittore di Vita, contando vecchi, bambini e servi, erano 80.000 (la cifra è discussa: vedi l'intermezzo «I barbari»)».
- Fonte: Vittore di Vita I 2; Procopio III 5, 18-19.

**M6. 251: «Le fonti romane lo ricordano come il primo imperatore caduto contro un nemico straniero»**
- Dove: T02-251 (r. 417).
- Problema: non ho trovato una fonte antica che lo dica. Sembra un'osservazione dei moderni, attribuita alle fonti.
- Proposta: «È il primo imperatore, per quanto sappiamo, a cadere combattendo contro un nemico esterno», oppure citare la fonte precisa se c'è.
- Fonte da cercare: Aurelio Vittore 29; Zosimo I 23; Giordane, Getica 103; altrimenti Potter, The Roman Empire at Bay, cap. VI.

**M7. 663: «in città il governo è di fatto nelle mani del papa»**
- Dove: T46-663 (r. 579); `[atto.VI.sommario]`.
- Problema: la frase è troppo netta. Dieci anni prima l'esarca aveva arrestato papa Martino I nel Laterano, e in città c'era un duca imperiale. La stessa visita di Costante II, che spoglia i monumenti, mostra che a Roma l'imperatore comandava ancora.
- Proposta: «In città il papa ha un peso crescente: distribuisce il grano e cura gli edifici. Ma l'impero vi comanda ancora, come mostra l'arresto di papa Martino I nel 653».
- Fonte: LP, vite di Martino I e di Vitaliano.

**M8. Sutri o Pipino: quale «primo nucleo» dello Stato della Chiesa?**
- Dove: T49-756 (r. 591), «Nasce così il primo nucleo dello Stato della Chiesa»; T48-727, protagonista Liutprando: «Nel 728 dona al papa il castello di Sutri».
- Problema: i manuali italiani chiamano quasi sempre «primo nucleo» la donazione di Sutri. La pagina riporta i due fatti, ma senza dire quale dei due conti e perché.
- Proposta: «Sutri, donata da Liutprando nel 728, era stata il primo possesso; con Pipino il papa riceve un vero territorio».
- Fonte: LP, vita di Gregorio II 21; vita di Stefano II 47.

**M9. 537: «Le grandi terme chiudono»**
- Dove: T37-537 (r. 534); SCHEDE delle terme (per esempio quella di Diocleziano, r. 811: «Senz'acqua dopo il taglio…»).
- Problema: la frase è detta come un fatto; le fonti dicono solo che gli acquedotti furono tagliati. Che le terme non abbiano più funzionato è una deduzione, plausibile ma da dichiarare. Il modello ha fissato `chiuso` al 537 per tutte le terme.
- Proposta: «Senz'acqua, le grandi terme non possono più funzionare», e nella scheda «la data esatta dell'abbandono non è attestata».
- Fonte: Procopio V 19, 13-18.

**M10. Una didascalia per Roma nel 293**
- Dove: T07-293 (r. 428), il cui titolo è «nessuno a Roma»; `EVENTI` non ha una voce per il 293; nelle SCHEDE, la Curia ricostruita da Diocleziano dopo l'incendio del 283 (r. 797) e le terme di Diocleziano (dal 298 al 306).
- Problema: la tappa parla di Roma, ma la città non mostra niente. Proprio in quegli anni gli imperatori assenti costruiscono a Roma l'Arcus Novus (dal 293), la Curia che vediamo oggi e le terme più grandi.
- Proposta: una didascalia in `EVENTI` (solo `testo`, vista sul Foro): «293 · Gli imperatori non vivono più a Roma, ma continuano a costruirvi: Diocleziano fa rifare la Curia, bruciata nel 283, e dal 298 sorgono le sue terme». Va poi controllato che il cantiere delle terme si veda nel 298 (`CANTIERI`).
- Fonte: Cronografo del 354, Diocleziano; CIL VI 1130 (dedica delle terme).

**M11. Il riquadro degli storici per la peste del 542**
- Dove: T38-542 (r. 536); nel 251 il riquadro c'è.
- Problema: il dibattito sul peso della peste di Giustiniano è vivo quanto quello sulla peste di Cipriano, e il confronto fra le due tappe verrebbe da sé. Da una parte i «massimalisti» (Harper, Little); dall'altra Mordechai ed Eisenberg (2019), per cui l'effetto sarebbe stato più limitato; in mezzo, la conferma di *Yersinia pestis* dal DNA antico (Wagner e altri 2014, anche in Baviera).
- Proposta: «Quanto pesò la peste di Giustiniano? …», con le due tesi e la prova del DNA.
- Fonte: Mordechai, Eisenberg e altri, PNAS 116 (2019); Harper, The Fate of Rome (2017), cap. 6; Wagner e altri, Lancet Infectious Diseases 14 (2014).

**M12. Il riquadro degli storici per l'800**
- Dove: T52-800 (r. 599).
- Problema: la tappa forse più nota dell'atto VI non ha il riquadro. Il dibattito è classico: Carlo sorpreso (Eginardo 28, citato nelle voci) o regia concordata, e che cosa intendessero il papa e i Franchi con quel titolo.
- Proposta: «Chi volle l'incoronazione?», con la tesi della riluttanza come topos, l'iniziativa di Leone III e il «nomen imperatoris» degli Annali di Lorsch («quia… vacabat nomen imperatoris» per una donna sul trono, che lega al protagonista Irene).
- Fonte: Annales Laureshamenses 801; Eginardo 28; Collins, Charlemagne (1998), cap. 7; Fried, Karl der Große (2013).

**M13. Il riquadro degli storici per il 418 (terre o tasse?)**
- Dove: T22-418 (r. 481): «Gli storici discutono ancora se abbiano ricevuto terre o una parte delle imposte»; intermezzo T25 (Goffart).
- Problema: il dibattito è annunciato ma non spiegato nel posto dove nasce.
- Proposta: un riquadro breve, con Goffart (Barbarians and Romans, 1980: quote delle imposte), le critiche (Liebeschuetz, Barnish) e la posizione di mezzo (Halsall, Barbarian Migrations, cap. 14).
- Fonte: le opere citate; Codice Teodosiano VII 8, 5 sulla hospitalitas.

**M14. 568: «un'Italia spopolata» e il richiamo di Narsete**
- Dove: T41-568 (r. 557).
- Problema: «spopolata» è detto come un fatto. Manca anche la tradizione secondo cui Narsete, offeso dall'imperatrice, chiamò lui i Longobardi: è una leggenda già nel Liber Pontificalis e in Paolo Diacono, ed è adatta al riquadro «Fra storia e leggenda».
- Proposta: «in un'Italia provata da diciotto anni di guerra e dalla peste». Riquadro della leggenda: Paolo Diacono II 5 (la conocchia di Sofia), LP vita di Giovanni III; molti storici la ritengono un'invenzione posteriore.
- Fonte: Paolo Diacono II 5; LP, Giovanni III (Duchesne I, p. 305).

**M15. «Aurelio Vittore dedica l'arco a Gallieno»**
- Dove: scheda dell'Esquilino (r. 849, data 262).
- Problema: chi dedicò l'arco fu Marco Aurelio Vittore, funzionario del III secolo. Non è lo storico Aurelio Vittore citato nella voce del 271 (vissuto un secolo dopo). Il lettore li confonde.
- Proposta: «Un funzionario, Marco Aurelio Vittore (da non confondere con lo storico), dedica l'arco a Gallieno e a Salonina».
- Fonte: CIL VI 1106.

**M16. Il Codice di Giustiniano e il diritto romano in Occidente**
- Dove: intermezzo T56 «Che cosa resta» (r. 606 sgg.): «Anche il diritto romano sopravvive»; T40-552 (Prammatica Sanzione).
- Problema: non si dice in che forma il diritto romano sia sopravvissuto. In Gallia e in Spagna fu il Breviario di Alarico (506); in Italia, il Corpus di Giustiniano esteso proprio dalla Prammatica (§ 11).
- Proposta: nel 552, «La Prammatica estende all'Italia le leggi di Giustiniano»; in «Che cosa resta», «nei regni dei Franchi il diritto romano si legge soprattutto nel Breviario di Alarico II, del 506».
- Fonte: Prammatica Sanzione 11 (Novelle, app. VII); Lex Romana Visigothorum (ed. Haenel).

**M17. Leone IV e la battaglia di Ostia (849)**
- Dove: T55-852 (r. 606).
- Problema: fra il sacco dell'846 e le mura dell'852 manca la vittoria navale di Ostia dell'849, con le flotte di Napoli, Amalfi e Gaeta. È nel Liber Pontificalis, è un fatto di Roma e spiega perché nell'852 Roma non fu riattaccata.
- Proposta: una frase nel testo dell'852; facoltativa una didascalia, che però non si vedrebbe, perché l'849 non è anno di tappa.
- Fonte: LP, vita di Leone IV, 47-55 (Duchesne II, pp. 117-119).

## Priorità bassa

**B1. Teia, 552 o 553**
- Dove: protagonista Teia, «re dei Goti nel 552» (T40); `LUOGHI_TAPPA` 552 («Nel 552 o nel 553»); il testo della tappa sottintende il 552.
- Proposta: «re dei Goti nel 552-553», e nel testo «nell'ottobre 552 o all'inizio del 553».
- Fonte: Procopio VIII 35; Agazia I 1.

**B2. 384: «Simmaco parla a nome di tutti i senatori»**
- Dove: T14-384.
- Problema: il riquadro degli storici e Ambrogio smentiscono subito la frase.
- Proposta: «Simmaco dice di parlare a nome di tutto il Senato».

**B3. Il solido nel 330**
- Dove: T10-330: «La sua moneta d'oro, il solido».
- Problema: il solido è coniato dal 309-310, prima che Costantino regni in Oriente.
- Proposta: «La moneta d'oro coniata da Costantino dal 309 circa, il solido, …».
- Fonte: RIC VI, Treviri.

**B4. I 1.200 prezzi del 301**
- Dove: T08-301 e intermezzo T06.
- Problema: il numero delle voci dell'editto varia secondo i frammenti e le edizioni (fra 1.000 e 1.400 circa).
- Proposta: «più di mille».
- Fonte: Lauffer, Diokletians Preisedikt (1971).

**B5. Durata dell'assedio del 756**
- Dove: T49-756 e `EVENTI` assedio756 (r. 781): «per tre mesi».
- Problema: ricordo, senza averlo potuto verificare (una ricerca mirata non l'ha confermato), che una lettera di Stefano II nel Codex Carolinus parla di cinquantacinque giorni. È la stessa raccolta da cui viene la voce della tappa.
- Proposta: controllare il Codex Carolinus 8 (MGH Epp. III, pp. 494-498) e, se il dato c'è, scrivere «per circa due mesi secondo il papa, tre secondo il Liber Pontificalis».

**B6. Carlo Martello e Abd al-Rahman fuori dai protagonisti del 711**
- Dove: T47-711, protagonisti; Poitiers è solo nei passi e nei luoghi.
- Proposta: aggiungere Carlo Martello (morto nel 741), con la riga «ferma la spedizione araba fra Tours e Poitiers nel 732 o 733; suo figlio è Pipino il Breve». La riga lega la tappa con quella del 756.

**B7. Le conquiste arabe tacciono nella tappa del 663**
- Dove: T46-663 e `CAMBI` 663.
- Problema: Levante ed Egitto cambiano colore senza una riga.
- Proposta: due righe in `LUOGHI_TAPPA` 663 (Yarmuk 636, Alessandria 642) o una frase nel testo. Se si fa la tappa A3, la frase sta lì.

**B8. L'Esarcato appare senza essere stato introdotto**
- Dove: protagonista Smaragdo, «esarca» (T45-609).
- Problema: l'istituzione non è mai presentata.
- Proposta: «… con il titolo di esarca, il governatore civile e militare che dalla fine del VI secolo rappresenta l'imperatore in Italia».
- Fonte: Gregorio Magno, Registrum (prima attestazione nel 584, lettera di Pelagio II).

**B9. Egidio e Siagrio, la Gallia del nord «usurpatore» dal 468**
- Dove: `CAMBI` 468 (r. 387); T29-468.
- Problema: il colore arriva otto tappe prima che il testo del 507 nomini Siagrio.
- Proposta: una riga in `LUOGHI_TAPPA` 468 o 472 (Soissons: «Egidio e poi il figlio Siagrio governano la Gallia del nord senza obbedire a Ravenna»).
- Fonte: Gregorio di Tours II 11-12, 18, 27; Prisco, frammento 30.

**B10. Le voci degli intermezzi**
- Dove: intermezzi T06, T17, T25, T33.
- Problema: «La moneta», «I commerci», «I barbari» e «La città» non hanno citazioni dell'epoca, mentre «L'esercito» e «Che cosa resta» sì.
- Proposta: per «La città», Cassiodoro, Variae XI 39 (la grandezza delle mura e degli acquedotti come prova di quanti erano i Romani); per «I barbari», Sidonio Apollinare, Carmi XII (i Burgundi «alti sette piedi» ospiti in casa); per «La moneta», un passo dell'editto sulla moneta di Afrodisia (301).

**B11. Il 476 non ha Oreste fra i protagonisti**
- Dove: T31-476.
- Problema: l'intermezzo «L'esercito» lo nomina come chi rifiutò il terzo delle terre e fu ucciso.
- Proposta: aggiungere Oreste (morto nel 476), «padre di Romolo, già segretario di Attila».
- Fonte: Anonimo Valesiano 37-38; Procopio V 1.
