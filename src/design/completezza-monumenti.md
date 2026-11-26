# Completezza dei monumenti della città in 3D (26 novembre 2026)

Lavoro di sola lettura: nessun file della pagina è stato toccato. Richiesta dell'utente: «sei sicuro che ci siano tutti i monumenti, tipo il tempio di Castore e Polluce?»; «Verifica prima dalle liste storiche e poi da cosa rimane oggi»; «verifica che ci siano tutti quelli rimasti a noi»; «anche la bocca della verità e il Marforio riesci a posizionarli?».

Regola seguita: ogni nome, data e posizione viene da una pagina aperta oggi (elenco in fondo, sezione 7). Dove non ho letto, c'è scritto «non letto» o «da leggere». Le coordinate di oggi vengono da due fonti lette, segnate così: **[SC]** = mappa dei luoghi della Sovrintendenza Capitolina (i punti della sua carta), **[WD]** = Wikidata (proprietà P625, con il numero Q dell'elemento). Non sono stime mie.

Sigle dello stato nel modello:
- **NOME** = voce propria in `MONUMENTI` (`js/dati.js`), con storia, e un `nome` in `js/monumenti.js`: si clicca, ha la scheda.
- **GRUPPO** = disegnato dentro un gruppo senza nome proprio (si vede, ma non ha nome, scheda né storia sua: cambia stato con tutto il gruppo).
- **SENZA NOME** = ha un `id` suo in `js/monumenti.js` ma niente `nome` (non si clicca); per `augusto` manca anche la voce in `MONUMENTI`.
- **CHIESA** = nell'elenco `CHIESE` di `js/dati.js` (nucleo disegnato da `js/nuclei.js`, con anno di fondazione, senza scheda).
- **MANCA** = non c'è.

---

## 1. I numeri

| Che cosa | Quanti |
|---|---|
| Voci dei Cataloghi regionari (*Notitia*, testo di Jordan 1871 nella traduzione di Pearse), regione per regione, contando come una voce ogni riga dell'elenco (sezione 6) | 208 |
| … di cui quartieri, strade, aree, colli (non edifici) | 10 |
| … nel modello con NOME | 32 |
| … dentro un GRUPPO | 18 |
| … che MANCANO | 148 (quasi tutti edifici scomparsi, statue, caserme, bagni, uffici, luoghi senza posto noto; alcune righe sono miste, per esempio «Casa Augustiana e Tiberiana»: l'una c'è, l'altra no) |
| Obelischi e ponti dell'appendice dei Cataloghi | 6 su 6 e 8 su 8 nel modello |
| Terme dell'appendice | 7 su 11 (mancano di Sura, Commodiane, Severiane, Deciane) |
| Basiliche dell'appendice | 5 su 10 |
| Rimasti oggi già nel modello con NOME (sezione 2 bis) | 67 righe, più le 39 chiese di `CHIESE` |
| Rimasti oggi dentro un GRUPPO o SENZA NOME (sezione 3) | 47 (il Septizodium, che non resta, è la quarantottesima riga) |
| Rimasti oggi che MANCANO (sezione 2) | 45 edifici o oggetti in 27 righe (righe 1-25 ter), più due righe di ambienti sotterranei che allora non si vedevano |
| … di questi, quelli che un visitatore cerca davvero (righe 1-16 della sezione 2) | 17 |
| Mancanti che stanno solo nelle liste storiche, scelti fra i grandi (sezione 4) | 25 righe |

Che cosa colpisce:
- **Il Septizodium non manca**: è disegnato in fondo al gruppo `palatino` (`js/monumenti.js`, righe 647-649: «Settizodio (203): facciata scenografica a tre ordini di colonne libere, con tre grandi nicchie… Demolito nel 1588-89»), ma non ha nome, scheda né storia: segue il Palatino, che nel modello chiude nel 720 e poi non cambia più. Va reso monumento a sé.
- **Il tempio dei Castori non manca**: è nel gruppo `fori` (riga 551, «octastyle and peripteral, with eleven columns on each side»). Lo stesso vale per Saturno, Vesta, Concordia, Vespasiano, Divo Giulio, Antonino e Faustina, basilica Giulia, Rostri, Tabularium, arco di Settimio Severo, casa delle Vestali, i quattro fori imperiali, la colonna Traiana e i mercati di Traiano: tutti disegnati, nessuno col suo nome.
- **Il mausoleo di Augusto** è disegnato (`id:'augusto'`, riga 791) ma non ha `nome` e **non ha voce in `MONUMENTI`**: non si clicca e non ha storia (Platner e Ashby: nel Medioevo «Mons Augustus» nel 955-962, fortezza dei Colonna distrutta nel 1167, usato come calcara).
- Fra i **rimasti oggi mancano del tutto**: Bocca della Verità, Marforio, i tre templi del Foro Olitorio (San Nicola in Carcere), la Domus Tiberiana, il tempio della Magna Mater, l'area sacra di Sant'Omobono, i tratti delle mura serviane, la Regia, la statua equestre di Marco Aurelio, i Dioscuri del Quirinale, la Pigna, l'Odeon di Domiziano e sei chiese fondate prima dell'852 e ancora in piedi (Santa Prisca, San Sisto Vecchio, San Marcello e Sant'Eusebio, tutti titoli del concilio del 499; Santa Martina; San Giovanni a Porta Latina), più quattro da confermare. Tabella completa nella sezione 2.

Che cosa farei, in ordine (proposte, nessuna fatta):
1. Dare nome, scheda e storia propria agli edifici del Foro della sezione 3, cominciando da Castori, Saturno, Vesta, Antonino e Faustina, Vespasiano, arco di Settimio Severo, basilica Giulia, colonna Traiana; e al mausoleo di Augusto (voce in `MONUMENTI` e `nome`), al Septizodium (staccato dal Palatino, posizione da controllare: sezione 5.1), all'arco di Dolabella e al sepolcro di Eurisace (manca solo il `nome`).
2. Aggiungere i grandi mancanti che si vedono ancora: templi del Foro Olitorio, Domus Tiberiana, Magna Mater, Regia, Odeon, Sant'Omobono (dopo aver letto la storia di ciascuno).
3. Aggiungere a `CHIESE` le chiese con una fonte letta: Santa Prisca, San Sisto Vecchio, San Marcello, Sant'Eusebio (titoli del 499), San Giovanni a Porta Latina, Santa Martina; le altre dopo Armellini.
4. Marforio, Bocca della Verità, statua di Marco Aurelio, Pigna: non metterli fra il 235 e l'852 finché una fonte non li dà in quegli anni (sezione 5); servono invece per una «Roma oggi».

---

## 2. MANCANTI FRA I RIMASTI OGGI (la parte più importante)

In ordine d'importanza per chi visita Roma oggi. «Allora» = che cosa dice la fonte letta sullo stato fra il 235 e l'852.

| # | Monumento | Che cosa resta oggi | Dove sta oggi | Spostato? | Allora, dalle fonti lette | Proposta |
|---|---|---|---|---|---|---|
| 1 | **Bocca della Verità** | Disco di marmo con un volto, diametro circa 1,80 m (Turismo Roma) | 41.8881, 12.4817 [WD Q729490], portico di Santa Maria in Cosmedin | Sì: nel portico dal 1631-1632; prima fuori dal portico (sezione 5) | Non si sa dove stesse in antico né quando arrivò alla chiesa (sezione 5) | Vedi sezione 5: niente fino a che una fonte non la mette lì |
| 2 | **Marforio** | Statua colossale di dio fluviale o Oceano, I secolo, 6,10 x 2,42 m (Musei Capitolini) | 41.8935, 12.4832 [WD Q831467]; 41.8938, 12.4832 [SC]; cortile di Palazzo Nuovo | Sì, più volte dal 1588 | Le fonti lette non dicono dove stesse fra il 235 e l'852 (sezione 5) | Vedi sezione 5 |
| 3 | **Templi del Foro Olitorio** (tre dei quattro templi di Pietà, Giano, Speranza e Giunone Sospita) | Colonne e podi di tre templi dentro e attorno a San Nicola in Carcere | 41.8911, 12.4800 [WD Q1241176]; 41.8930, 12.4811 [SC, «Templi Repubblicani di San Nicola in Carcere»] | No | Platner e Ashby, Forum Holitorium: «The ruins of three of these temples exist beneath the church of S. Nicola in Carcere»; storia fra 235 e 852: da leggere (voci Ianus, Spes, Iuno Sospita non trovate oggi su LacusCurtius con quei nomi) | Gruppo nuovo accanto al teatro di Marcello, con nome; stato dal 392 come gli altri templi |
| 4 | **Domus Tiberiana** | Resti del palazzo e delle sostruzioni sul lato nord-ovest del colle (Platner e Ashby: resti più antichi «in and under the later substructions», verso il Campidoglio) | 41.8902, 12.4862 [WD Q1238767] | No | Platner e Ashby, Domus Tiberiana: rifatta da Domiziano dopo l'incendio dell'80; la stessa voce dice che Santa Maria Antiqua vi fu inserita «before the sixth century». Lo stato nel IV-IX secolo: da leggere | Nel gruppo `palatino` (che ha Flavia, Augustana, stadio, Apollo, Settizodio) manca la metà nord-ovest del colle: aggiungerla |
| 5 | **Tempio della Magna Mater** (Cibele) | Resti del tempio sul Palatino (quali: da leggere) | 41.8896, 12.4846 [WD Q383609] | No | Platner e Ashby, Magna Mater, aedes: eretto dopo il 204 a.C., bruciato nel 111 a.C. e rifatto da Augusto nel 3 d.C.; nei Cataloghi (X, «aedem Matris deum»). Dopo il IV secolo: da leggere | Nel gruppo `palatino`, con nome |
| 6 | **Area sacra di Sant'Omobono** | Due templi su un'area sacra (nomi e storia: da leggere) | 41.8906, 12.4813 [WD Q2552044]; 41.8907, 12.4812 [SC] | No | Da leggere. Attenzione: Platner e Ashby (voce Mater Matuta, templum) mettono il tempio di Mater Matuta nel tempio del lato nord di piazza della Bocca della Verità (quello che il modello chiama Portuno), e la voce Fortuna in Foro Boario dice che l'identificazione con l'altro tempio-chiesa «seems far from certain»: per Sant'Omobono serve una fonte diversa da Platner | Accanto al Foro Boario, dopo averne letto la storia |
| 7 | **Mura serviane** | Tratti di mura in più punti (la Sovrintendenza ha una voce «Mura Serviane»; quali tratti: da leggere) | 41.9017, 12.5017 [WD Q281330, tratto di Termini] | No | Nei Cataloghi ci sono le porte serviane come nomi di luogo (porta Capena, Trigemina). Stato fra 235 e 852: da leggere | Tratti visibili dove restano, come ruderi |
| 8 | **Statua equestre di Marco Aurelio** | La statua, sul Campidoglio (Wikidata) | 41.8930, 12.4830 [WD Q21141671] | Sì (quando e da dove: non letto) | Mirabilia Urbis Romae (testo latino su The Latin Library), cap. «Lateranis est quidam caballus hereus qui dicitur Constantini, sed non ita est»: nel Medioevo era al Laterano e lo si credeva Costantino. Prima dei Mirabilia e fra il 235 e l'852: **non letto** | Nessuna proposta per il 235-852 senza fonte; da cercare nel Liber Pontificalis (Laterano) |
| 9 | **Regia** (Foro) | Fondazioni, nel recinto di Vesta (Platner e Ashby, Atrium Vestae: il recinto comprendeva il tempio, la casa delle Vestali e la Regia) | 41.8919, 12.4864 [WD Q786489] | No | Platner e Ashby, Regia: «In the seventh or eighth century the regia was transferred into a private house», con due gradini di marmo e travertino e una fila di colonne di cipollino prese da un edificio antico | Nel gruppo `fori`, con nome; casa dal VII-VIII secolo (stato da scegliere: «uso» con forma di casa) |
| 10 | **Dioscuri del Quirinale** (Montecavallo) | Due colossi con cavalli, in piazza del Quirinale | 41.8991, 12.4867 (punto dell'obelisco del Quirinale, nella stessa piazza) [WD Q3348571]; punto proprio dei colossi: da prendere | Spostamenti: non letti | Platner e Ashby, Thermae Constantinianae: restauro del 443, «at which time it is probable that the colossal statues of the Dioscuri and horses, now in the Piazza del Quirinale, were set up within the thermae» | Dentro `termecostantino`, dal 443, dichiarato «probabile» come dice la fonte |
| 11 | **Odeon di Domiziano** | Resti (quali: da leggere) | 41.8972, 12.4734 [WD Q2291009] | No | Platner e Ashby, Odeum: nel IV secolo fra i monumenti più notevoli (Ammiano XVI 10, 14), nel V secolo fra i sette «mira praecipua» (Polemio Silvio); «It is possible that the artificial elevation, called monte Giordano, covers its ruins» | Accanto allo stadio di Domiziano, con nome; nessuna data di abbandono letta |
| 12 | **Pigna** di bronzo | La pigna nel cortile della Pigna in Vaticano | 41.8971, 12.4781 [WD Q1329671] è il rione Pigna; il punto in Vaticano: da prendere | Sì | Mirabilia, cap. «De cantaro Sancti Petri»: nel «paradiso» (l'atrio) di San Pietro c'è il «cantarum quod fecit Simacus papa», con colonne di porfido, e «In medio cantari est pinea erea» (secondo il testo, che qui racconta una leggenda, era stata il coperchio dell'occhio del Pantheon). Il cantaro è quindi attribuito a papa Simmaco (498-514); quando la pigna vi arrivò, il testo non lo dice | Il cantaro di Simmaco nell'atrio di San Pietro (che il modello non disegna) è una proposta da verificare nel Liber Pontificalis, vita di Simmaco; la pigna solo se la stessa fonte la nomina |
| 13 | **Rampa di Domiziano** (accanto a Santa Maria Antiqua) | La rampa coperta che saliva ai palazzi del Palatino, e la sala d'ingresso diventata l'oratorio dei Quaranta Martiri | Da prendere (accanto a Santa Maria Antiqua, 41.8910, 12.4856 [WD Q195660]) | No | Parco archeologico del Colosseo, scheda «Santa Maria Antiqua con l'Oratorio dei Quaranta Martiri e la Rampa di Domiziano»: la sala «in origine era probabilmente sala di ingresso alla Rampa di Domiziano, che conduceva ai Palazzi Imperiali sul Palatino. Con la cristianizzazione del Foro l'edificio divenne un oratorio», con una pittura dell'VIII secolo; Santa Maria Antiqua fu abbandonata «a seguito dei crolli del terremoto dell'847» | Nel gruppo `palatino`, accanto a Santa Maria Antiqua (nel modello finisce nell'848, dopo il terremoto dell'847: d'accordo con la scheda) |
| 14 | **Excubitorium della VII coorte dei vigili** | Resti del corpo di guardia, in Trastevere | 41.8887, 12.4745 [SC] | No | Cataloghi XIV, «cohortem VII vigilum»; Platner e Ashby, Stationes Vigilum, parla degli excubitoria; la storia del posto: da leggere | Minore: sta sotto il piano di oggi, allora forse visibile |
| 15 | **Cisterna delle Sette Sale** | La cisterna sull'Oppio (che servisse le terme di Traiano: da leggere) | 41.8934, 12.4965 [WD Q3678238] | No | Da leggere | Dentro `traiano` |
| 16 | **Arco partico di Augusto** e **arco di Tiberio** (Foro) | Solo fondazioni | Da prendere | No | Platner e Ashby, Arcus Augusti: fondazioni fra il Divo Giulio e i Castori, larghezza 17,75 m; Arcus Tiberii: all'angolo nord-ovest della basilica Giulia, fondazioni di 9 x 6,3 m. Quando caddero: non detto | Minori; solo se si rifà il Foro |
| 17 | **Santa Prisca** (Aventino) | Chiesa | 41.8831, 12.4838 [WD Q1750627] | No | «Titulus s. Priscae» fra i titoli sottoscritti al concilio di papa Simmaco del 1° marzo 499 (Armellini, Le chiese di Roma, 1891, parte I, cap. III); it.wikipedia: restaurata da Adriano I (seconda metà dell'VIII secolo) | In `CHIESE` dal 499 al più tardi |
| 18 | **San Sisto Vecchio** | Chiesa | 41.8805, 12.4959 [WD Q2736770] | No | «Titulus Crescentianae» nel 499 (Armellini); che il titolo di Crescenziana sia San Sisto lo dice it.wikipedia | In `CHIESE` dal 499 |
| 19 | **San Marcello al Corso** | Chiesa (rifatta) | 41.8988, 12.4816 [WD Q972881] | No | «Titulus s. Marcelli» nel 499 (Armellini) | In `CHIESE` dal 499 |
| 20 | **Sant'Eusebio** (Esquilino) | Chiesa | 41.8952, 12.5049 [WD Q1785642] | No | «Titulus Eusebi» nel 499 (Armellini) | In `CHIESE` dal 499 |
| 21 | **Santi Luca e Martina** (Santa Martina al Foro) | Chiesa | 41.8931, 12.4844 [WD Q1813867] | No | it.wikipedia: intitolata a Santa Martina, «fondata nel VII secolo, presumibilmente da Onorio I», come Sant'Adriano. `CLAUDE.md` la segna già fra i problemi aperti | In `CHIESE` dal 630 circa, con la riserva |
| 22 | **San Giovanni a Porta Latina** | Chiesa | 41.8773, 12.5019 [WD Q592799] | No | it.wikipedia: «Fu fondata nel V secolo o alla fine del IV, ricostruita certamente nel 720» | In `CHIESE` dal V secolo |
| 23 | **San Cesareo de Appia** (via di Porta San Sebastiano), **Santo Stefano del Cacco** (presso l'Iseo), **Santo Stefano degli Abissini** (Vaticano), **Santa Maria in Aracoeli** | Chiese | 41.8787, 12.4971 [WD Q1439551]; 41.8972, 12.4793 [WD Q2223693]; 41.9019, 12.4522 [WD Q1166213]; 41.8939, 12.4833 [WD Q318660] | No | it.wikipedia: San Cesareo «risale all'VIII secolo»; Santo Stefano del Cacco «fatta risalire a papa Pasquale I nel IX secolo» (817-824); Santo Stefano degli Abissini «apparteneva ad un monastero esistente già al tempo di papa Gregorio III (VIII secolo)»; Aracoeli «La prima costruzione risale al VI secolo» (senza nota). Fonte primaria per tutte: da leggere in Armellini, parte II | Dopo la lettura in Armellini |
| 24 | **Insula dell'Aventino**, **insula di San Paolo alla Regola**, **Domus Parthorum**, **Privata Traiani**, **ninfei di via Amba Aradam, degli Annibaldi, del Colle Oppio** | Resti per lo più sotto terra | [SC]: 41.8862, 12.4796; 41.8932, 12.4732; 41.8785, 12.4952; 41.8829, 12.4823; 41.8853, 12.5025; 41.8920, 12.4918; 41.8928, 12.4982 | No | Domus Parthorum e Privata Traiani sono nei Cataloghi (XII «septem domos Parthorum», XIII «privata Traiani») | Minori: le case della città ne fanno le veci |
| 25 | **Sepolcro degli Scipioni** (dentro le mura, via di Porta San Sebastiano) | Tomba di famiglia con i loculi scavati nel tufo | 41.8792, 12.4966 [SC] | No | Platner e Ashby, Sepulcrum Scipionum: Hülsen ritiene che molti danni fossero già del IV secolo; aperta nel Seicento, scavata nel 1780 | Minore; fino al 1600 era nascosta |
| 25 bis | Altri punti antichi della mappa della Sovrintendenza dentro l'area: **tempio di Veiove** (sotto il Tabularium), **sepolcri repubblicani di via Statilia**, **latrina romana** (Trastevere), **ipogeo di via Giovanni Lanza**, **casa romana sotto il Museo Barracco**, **sepolcreto della via Ostiense** (presso San Paolo), **area archeologica di via delle Botteghe Oscure** | Resti, in parte sotto il piano di oggi | [SC]: 41.8930, 12.4836; 41.8903, 12.5118; 41.8879, 12.4667; 41.8950, 12.4984; 41.8969, 12.4725; 41.8600, 12.4783; 41.8951, 12.4789 | No | Non letto (solo il nome e il punto della mappa) | Minori; da guardare una per una prima di decidere |
| 25 ter | **Statue «parlanti»**: Madama Lucrezia, Abate Luigi, Pasquino | Statue antiche nelle piazze | [SC]: 41.8957, 12.4813; 41.8961, 12.4746; 41.8978, 12.4723 | Sì (dove stessero in antico: non letto) | Non letto | Come il Marforio: nessuna fonte letta le dà fra il 235 e l'852 |
| 26 | **Colombario di Pomponio Hylas**, **mitrei** (Circo Massimo, San Clemente, Santa Prisca, Santo Stefano Rotondo, Barberini) | Ambienti sotterranei | [SC] e [WD] | No | Sotto terra già allora: non si vedevano | Non servono nella scena |
| 27 | **Casa di Augusto**, **casa di Livia**, **Domus Aurea**, **Domus Transitoria**, **basilica sotterranea di Porta Maggiore** | Ambienti sotterranei | [WD] | No | Sepolti già prima del 235 (Platner e Ashby, Thermae Traiani: la Domus Aurea «destroyed or buried beneath them») | Non servono nella scena: è giusto che manchino |

### 2 bis. I rimasti oggi che ci sono già col loro nome

Per completezza (l'utente vuole che «ci siano tutti»): ciò che si vede oggi ed è nel modello con NOME. «Spostato» solo dove la fonte letta lo dice.

| Nel modello (`id`) | Che cosa resta oggi, in una riga | Dove oggi | Spostato? |
|---|---|---|---|
| `colosseo` | L'anfiteatro, con l'anello esterno a metà | 41.8903, 12.4922 [WD Q10285] | No |
| `circo` | La valle della pista e i resti della curva | 41.8859, 12.4857 [WD Q207808] | No |
| `obelisco357` | L'obelisco, oggi a San Giovanni in Laterano | 41.8868, 12.5048 [WD Q645181] | Sì (data dello spostamento: non letta) |
| `pompeo` | La curva della cavea nelle case di via di Grottapinta, sostruzioni | 41.8953, 12.4736 [WD Q944814] | No |
| `giove` | Resti del podio | 41.8922, 12.4817 [WD Q586468] | No |
| `pantheon` (e `pantheonchiesa`) | Intero | 41.8986, 12.4769 [WD Q99309] | No |
| `domiziano` | La forma della piazza Navona, resti sotto la piazza | 41.8989, 12.4731 [WD Q963671] | No |
| `traiano` | Esedre sul colle Oppio | 41.8919, 12.4963 [WD Q599035] | No |
| `tito` | Pochi muri accanto a via delle Terme di Tito | 41.8918, 12.4932 [SC] | No |
| `santadriano` (`curia`) | La Curia | 41.8929, 12.4854 [WD Q3672239] | No |
| `saepta` | Resti minimi | 41.8983, 12.4780 [WD Q672752] | No |
| `apollo`, `bellona` | Colonne di Apollo Sosiano, resti di Bellona | 41.8927, 12.4808 [SC] | No |
| `caracalla` | Il corpo centrale e il recinto | 41.8803, 12.4928 [WD Q502098] | No |
| `diocleziano` | Santa Maria degli Angeli, l'aula ottagona, il museo | 41.9028, 12.4983 [WD Q836108] | No |
| `massenzio` | La navata nord | 41.8919, 12.4883 [WD Q371921] | No |
| `adriano` | Castel Sant'Angelo | 41.9030, 12.4663 [WD Q486382] | No |
| `laterano` | La basilica, rifatta | 41.8859, 12.5062 [WD Q84090] | No |
| `patriarchio` | Il Sancta Sanctorum (San Lorenzo in Palatio) alla Scala Santa (che sia l'unico resto del patriarchio: da leggere) | 41.8872, 12.5070 [WD Q1997122] | No |
| `triclinioleone` | L'abside col mosaico, rifatta (quando e dove: non letto) | Da prendere | Da leggere |
| `pietro` | Niente della basilica antica (demolita dal 1505, [WD Q810126]); al suo posto la basilica nuova | 41.9022, 12.4533 [WD Q810126] | — |
| `obeliscovaticano` | L'obelisco, in piazza San Pietro | 41.9022, 12.4563 [WD Q1444766] | Sì |
| `mura` | Le mura aureliane, in gran parte | 41.8733, 12.4990 [WD Q625149] | No |
| `emilia`, `emiliarovina` | Pavimento e basi | 41.8926, 12.4861 [WD Q522924] | No |
| `marcello` | Le arcate della cavea, con le case sopra | 41.8922, 12.4800 [SC] | No |
| `venere` | Parte della cella e il podio | 41.8909, 12.4898 [WD Q430792] | No |
| `sole` | Quasi niente in vista: Platner e Ashby, Templum Solis, dice che nel Cinquecento nei giardini di palazzo Colonna restavano parte della cella e un angolo della facciata, distrutti del tutto verso il 1630; l'ultima notizia antica è del VI secolo, quando otto colonne di porfido furono mandate a Costantinopoli | 41.9026, 12.4811 [WD Q4536138] | — |
| `arcocostantino` | Intero | 41.8898, 12.4906 [WD Q5786] | No |
| `croce` | La basilica, rifatta | 41.8878, 12.5164 [WD Q685940] | No |
| `lorenzo`, `lorenzopelagio` | La basilica di oggi (la parte di Pelagio II è il presbiterio: non letto) | 41.9025, 12.5205 [WD Q738214] | No |
| `agnese`, `agneseonorio` | La chiesa di Onorio I; ruderi della basilica di Costantina | 41.9229, 12.5189 [WD Q1636696] | No |
| `costanza` | Il mausoleo, intero | 41.9226, 12.5174 [WD Q831361] | No |
| `paolo` | La basilica, ricostruita (quando: non letto) | 41.8586, 12.4772 [WD Q231699] | No |
| `sabina` | Intera | 41.8844, 12.4797 [WD Q592244] | No |
| `mariamaggiore` | La basilica (rifatta in parte) | 41.8975, 12.4986 [WD Q186282] | No |
| `stefano` | La rotonda (senza l'anello esterno) | 41.8845, 12.4968 [WD Q919456] | No |
| `cosma` | La chiesa e la rotonda detta tempio di Romolo | 41.8923, 12.4875 [WD Q675513] | No |
| `foca` | La colonna | 41.8925, 12.4847 [WD Q369075] | No |
| `colonnamarco` | La colonna, con san Paolo in cima | 41.9008, 12.4800 [WD Q265384] | No |
| `orologio` | L'obelisco, oggi in piazza di Montecitorio | 41.9006, 12.4787 [WD Q740755] | Sì |
| `obeliscosallustiano` | L'obelisco, oggi a Trinità dei Monti | 41.9061, 12.4832 [WD Q784104] | Sì |
| `piramide` | Intera | 41.8764, 12.4808 [WD Q725404] | No |
| `castrapretorio` | I muri del campo dentro le mura | 41.9088, 12.5079 [WD Q1049836] | No |
| `termenerone` | Colonne e resti (da leggere) | 41.8987, 12.4758 [WD Q1890176] | — |
| `termeagrippa` | Resti (Sovrintendenza, voce «Terme di Agrippa») | 41.8970, 12.4768 [SC] | No |
| `tempioadriano` | Il fianco colonnato | 41.8997, 12.4794 [WD Q431062] | No |
| `tempioclaudio` | I muri della piattaforma | 41.8879, 12.4931 [WD Q523765] | No |
| `ludusmagnus` | Resti del recinto e dell'arena | 41.8903, 12.4948 [SC] | No |
| `foroboario` (gruppo con nome) | Vedi sezione 3 | — | — |
| `ottavia` | Resti del portico (Sovrintendenza, voce «Portico d'Ottavia») | 41.8926, 12.4783 [SC] | No |
| `argentina` | I quattro templi | 41.8954, 12.4769 [WD Q119855487] | No |
| `iseo` | Gli obelischi (sezione 3) e altri pezzi | — | Sì |
| `esquilino` (gruppo con nome) | Vedi sezione 3 | — | — |
| `minervamedica` | L'aula, senza metà della cupola | 41.8940, 12.5118 [WD Q1411575] | No |
| `sessoriano` | L'anfiteatro castrense nelle mura | 41.8876, 12.5150 [SC] | No |
| `santamarianova` | Santa Francesca Romana | 41.8912, 12.4885 [WD Q1091640] | No |
| `testaccio` | Il monte | 41.8772, 12.4761 [SC] | No |
| `arcotito` | Intero (restauri moderni: non letti) | 41.8907, 12.4886 [WD Q723887] | No |
| `metasudans` | Le fondazioni | 41.8901, 12.4907 [WD Q1924755] | No |
| `emporio` | La Porticus Aemilia e le banchine dell'Emporio | 41.8782, 12.4726 [SC] | No |
| `balbo` | La Crypta Balbi (museo) | 41.8951, 12.4789 [SC] | No |
| `leonine` | Le mura leonine | 41.9031, 12.4597 [WD Q370350] | No |
| `scholae` | L'ospedale e la chiesa di Santo Spirito in Sassia (rifatti) | 41.9014, 12.4611 [WD Q1428488] | No |
| `esculapio` | San Bartolomeo all'Isola e la prua | 41.8901, 12.4788 [WD Q3023765] | No |
| `hortisallustiani` | Resti degli horti | 41.9081, 12.4969 [WD Q1241278] | No |
| `acquedotti`, `antoniniano` | Archi della Claudia, della Marcia, dell'Antoniniano (arco di Druso) | 41.8983, 12.5094 [SC, Marcio]; 41.8738, 12.5014 [WD Q1107952] | No |
| `ponteelio` | Ponte Sant'Angelo | 41.9018, 12.4665 [WD Q870476] | No |
| `ponteaurelio` | Ponte Sisto, rifatto (la Sovrintendenza lo mette fra i beni medievali e moderni) | 41.8923, 12.4708 [WD Q586329] | No |
| `pontefabricio` | Intero | 41.8909, 12.4780 [SC] | No |
| `pontecestio` | Il ponte (rifatto in parte: quando, non letto) | 41.8904, 12.4780 [SC] | No |
| `ponteemilio` | Ponte Rotto (rudere) | 41.8894, 12.4794 [WD Q640092] | No |
| `pontemilvio` | Il ponte | 41.9362, 12.4666 [SC] | No |
| `ponteneroniano` | Resti delle pile (da leggere) | 41.9010, 12.4641 [WD Q1902995] | No |
| Le 39 chiese di `CHIESE` | Per quasi tutte Wikidata ha una chiesa di oggi con lo stesso nome e le coordinate (per San Martino ai Monti e Santa Maria in Campo Marzio la ricerca per nome non ha dato risultato: da rifare). Santa Maria Antiqua è un rudere scavato (Parco archeologico del Colosseo). Santa Maria Domine Rose: se sia oggi Santa Caterina dei Funari (41.8939, 12.4786 [WD Q1134284]) è da leggere. Che ciascuna sia ancora in piedi e quanto sia rifatta: non verificato chiesa per chiesa | Coordinate già in `js/dati.js` | — |

Non restano (e quindi non contano qui): Terme di Costantino (distrutte nel 1605-1621, Platner e Ashby), Meta Romuli (posto: 41.9027, 12.4636 [WD Q165815]), Arcus Novus, Arco di Portogallo (Platner e Ashby: demolito nel 1662), Colosso, ponte Sublicio, ponte di Probo, arco di Valentiniano, Sant'Andrea e Santa Petronilla in Vaticano, i monasteri di San Pietro, i mulini, le case nel foro di Nerva, gli horti diversi dai Sallustiani.

### 2 ter. Coordinate di scena dei mancanti (per chi li aggiungerà)

Calcolate con `RM.ll` di `js/base.js` (x = (lon - 12,4853) x 8287; z = -(lat - 41,8925) x 11113,2) dai punti letti sopra. Sono i punti di oggi: per gli oggetti spostati non sono il posto antico.

| Monumento | x | z |
|---|---|---|
| Templi del Foro Olitorio | -43,9 | 15,6 |
| Domus Tiberiana | 7,5 | 25,6 |
| Tempio della Magna Mater | -5,8 | 32,2 |
| Area sacra di Sant'Omobono | -33,1 | 21,1 |
| Regia | 9,1 | 6,7 |
| Odeon di Domiziano | -98,6 | -52,2 |
| Cisterna delle Sette Sale | 92,8 | -10,0 |
| Excubitorium della VII coorte | -89,5 | 42,2 |
| Santa Prisca | -12,4 | 104,5 |
| San Sisto Vecchio | 87,8 | 133,4 |
| San Marcello al Corso | -30,7 | -70,0 |
| Sant'Eusebio | 162,4 | -30,0 |
| Santi Luca e Martina | -7,5 | -6,7 |
| San Giovanni a Porta Latina | 137,6 | 168,9 |
| Bocca della Verità (oggi, spostata) | -29,8 | 48,9 |
| Marforio (oggi, spostato) | -17,4 | -11,1 |
| Carcere Mamertino (dove i Mirabilia mettono un «simulacrum» che giace) | -7,5 | -8,9 |
| Mausoleo di Augusto (c'è già: `augusto` a x -74, z -151, d'accordo con Wikidata x -73,8, z -151,1) | -73,8 | -151,1 |

Da verificare nel modello (non ho trovato il nome cercando nei file, ma potrebbero esserci sotto un'altra forma): **Porta Maggiore** (la porta non compare fra i nomi di `RM_TOPO.porte`; l'acquedotto passa sopra e la tomba di Eurisace si chiude nella torre nel 402: probabilmente c'è come pezzo di mura e acquedotti); la **statua colossale di Costantino** (in `massenzio` c'è l'abside ovest «dove stava il colosso», ma la statua non si disegna); la **basilica di Nettuno** (è dentro `pantheonpiazza`, riga 694: c'è).

---

## 3. Edifici dentro un gruppo che meritano nome, scheda e storia propria

Per ognuno: gruppo e riga di `js/monumenti.js`, che cosa resta oggi, dove sta oggi. La storia nel modello oggi è quella del gruppo (`fori`: uso, chiuso dal 537, spogliato dal 663, cava dall'800), che non va bene per quasi nessuno di loro.

### Il Foro Romano (gruppo `fori`)

| Edificio | Riga | Resta oggi | Dove oggi | Dalle fonti lette |
|---|---|---|---|---|
| **Tempio dei Castori** | 551 | Tre colonne del lato est, il podio | 41.8917, 12.4856 [WD Q380530] | Platner e Ashby, Aedes Castoris: «This temple was standing in the fourth century, but nothing is known of its subsequent history, except that in the fifteenth century only three columns were visible» (la via si chiamava via Trium Columnarum) |
| **Tempio di Saturno** | 550 | Le colonne del pronao, il podio | 41.8924, 12.4841 [WD Q746721] | Platner e Ashby, Saturnus: nel IV secolo danneggiato da un incendio e rifatto per voto del Senato (iscrizione dell'architrave, CIL VI 937); nei Cataloghi (VIII). Poggio vide nel 1402 un portico quasi intero e nel 1447 lo trovò demolito per farne calce, ma lo chiama «aedis Concordiae»: Platner riferisce il passo alla voce di Saturno |
| **Tempio di Vesta** | 552 | Un tratto del giro di colonne, il podio | 41.8917, 12.4862 [WD Q753791] | Platner e Ashby, Vesta: bruciato e rifatto più volte, l'ultima volta restaurato da Giulia Domna, moglie di Settimio Severo. Dopo il IV secolo: non detto nelle parti lette |
| **Casa delle Vestali** (Atrium Vestae) | 549 | Il cortile e le stanze attorno | 41.8914, 12.4867 [WD Q285196] | Platner e Ashby, Atrium Vestae: rifatta dopo l'incendio di Nerone; scavi del 1549, 1883 e 1899-1902. Dopo il IV secolo: da leggere |
| **Tempio della Concordia** | 547 | Il podio | 41.8929, 12.4842 [WD Q828143] | Platner e Ashby, Concordia, aedes, templum: restaurato da Tiberio e dedicato nel 10 d.C.; un restauro più tardo, «perhaps after the fire of 284», è ricordato da un'iscrizione (CIL VI 89) «which was seen on the pronaos of the temple by the copyist of the inscriptions in the Einsiedeln Itinerary»: il pronao era quindi ancora in piedi quando fu copiata. Poggio (citato alla voce Saturno) chiama «aedis Concordiae» un portico quasi intero nel 1402 e demolito per calce nel 1447: Platner lo riferisce al tempio di Saturno |
| **Tempio di Vespasiano e Tito** | 548 | Tre colonne d'angolo con l'architrave | Da prendere (vicino a 41.8927, 12.4839, che Wikidata dà per Q731284) | Platner e Ashby, Divus Vespasianus: «This inscription was complete in the seventh century and was copied by the compiler of the Einsiedeln Itinerary»; colonne alte 15,20 m, rimesse in piedi nel 1811 |
| **Tempio del Divo Giulio** | 557 | Il nucleo del podio e l'esedra dei Rostri | 41.8920, 12.4861 [WD Q1133288] | Da leggere |
| **Tempio di Antonino e Faustina** (San Lorenzo in Miranda) | 558 | Le colonne del pronao, l'architrave e il fregio, parti della cella nei muri della chiesa | 41.8921, 12.4867 [WD Q752555] | Cataloghi IV, «templum Faustinae». Platner e Ashby, Antoninus et Faustina: «In the seventh or eighth century this temple, apparently in good condition, was converted into the church of S. Lorenzo in Miranda» (rimanda ad Armellini, pp. 156-157); il pavimento della chiesa sta circa 12 m sopra il livello antico |
| **Basilica Giulia** | 544 | Il pavimento, basi dei pilastri | 41.8920, 12.4848 [WD Q616271] | Platner e Ashby, Basilica Iulia: restaurata da Diocleziano; «In the seventh or eighth century the outer aisle on the west side was converted into a church»; nel Medioevo i suoi marmi furono la «special prey» dei calcarari, e una calcara è stata trovata sul suo pavimento |
| **Rostri** | 546 | La tribuna in fondo alla piazza | 41.8926, 12.4846 [WD Q426372] | Platner e Ashby, Rostra: i Cataloghi ne nominano tre («rostra III») |
| **Tabularium** | 559 | Il basamento e la galleria ad arcate sotto il palazzo Senatorio | 41.8928, 12.4836 [WD Q568342]; 41.8930, 12.4836 [SC] | Platner e Ashby, Tabularium: «nothing else is known of the history of the building until the reign of Boniface VIII (about 1300 A.D.)» |
| **Arco di Settimio Severo** | 560 | Intero | 41.8928, 12.4847 [WD Q162353] | Platner e Ashby, Arcus Septimii Severi: del 203, alto 23 m, largo 25, profondo 11,85; «The arch was never traversed by a road until mediaeval times»; nel IV secolo, forse, il livello davanti fu abbassato e la scala allungata |
| **Foro di Cesare e tempio di Venere Genitrice** | 564 | Colonne del tempio e del portico | 41.8942, 12.4848 [WD Q2459870] | Platner e Ashby, Forum Iulium: bruciato nel 283 e restaurato da Diocleziano |
| **Foro di Augusto e tempio di Marte Ultore** | 565 | Colonne e podio del tempio, il muro tagliafuoco | 41.8943, 12.4868 [WD Q679665] | Platner e Ashby, Forum Augustum: restaurato da Adriano; «Three of the columns with the architrave are still standing»; nel podio una camera tagliata nel Medioevo per farne una tomba |
| **Foro di Nerva** (le «Colonnacce», tempio di Minerva) | 570 | Colonne con il fregio | 41.8931, 12.4862 [WD Q686911] | Platner e Ashby, Forum Nervae: il tempio di Minerva fu distrutto nel 1606 da Paolo V per la fontana del Gianicolo; restano due colonne con circa 11 m di muro (le «Colonnacce», nel Medioevo «Arca Noe»). Nel modello dall'850 le case (`casenerva`) |
| **Tempio della Pace** | 571 | Un'aula (Santi Cosma e Damiano), resti della piazza | 41.8926, 12.4876 [WD Q1456939] | Platner e Ashby, Templum Pacis: bruciato poco prima della morte di Commodo, forse nel 191, poi restaurato; Procopio, nel VI secolo, dice che era distrutto da tempo da un fulmine, ma che attorno restavano molte opere d'arte; l'ingresso dalla via Sacra è oggi Santi Cosma e Damiano. Dà il nome alla regione IV |
| **Foro di Traiano e basilica Ulpia** | 578, 584 | Colonne della basilica | 41.8956, 12.4846 [WD Q1266234] | Cataloghi VIII; Ammiano (XVI 10) non letto oggi |
| **Colonna Traiana** | 587 | Intera | 41.8958, 12.4842 [WD Q192784] | Cataloghi VIII: «columnam coclidem», nella traduzione di Pearse alta 127 piedi («127 paces»), con 180 gradini e 45 finestre. Platner e Ashby, Forum Traiani: 29,77 m |
| **Mercati di Traiano** | 591-609 | Emiciclo, via Biberatica, Grande Aula | 41.8956, 12.4862 [WD Q478642]; 41.8961, 12.4860 [SC] | Da leggere |
| **Tempio del Divo Romolo** (vestibolo di Santi Cosma e Damiano) | dentro `cosma`, riga 976 | La rotonda | 41.8920, 12.4874 [WD Q338397] | Da leggere |

### Palatino (gruppo `palatino`)

| Edificio | Riga | Resta oggi | Dove oggi | Dalle fonti lette |
|---|---|---|---|---|
| **Septizodium** | 647-649 | Niente (demolito) | Il punto antico: 41.8856, 12.4887 [WD Q1234446] | Sezione 5 |
| **Domus Flavia e Aula Regia** | 631-637 | Resti del palazzo | 41.8885, 12.4869 [WD Q22907580, «Palazzo di Domiziano»] | Platner e Ashby, Domus Augustiana: quasi tutto è di Rabirio, finito nel 92; nel Medioevo «the central portion… seems to have been almost entirely left alone. Both the Anonymus Einsiedlensis and the writers of the Mirabilia barely mention it» |
| **Domus Augustana** | 638-640 | Muri e cortili | 41.8877, 12.4866 [WD Q908472] | Come sopra |
| **Stadio palatino** | 641-644 | Intero nella pianta | 41.8874, 12.4872 [WD Q2484732] | Parco archeologico del Colosseo, scheda «Stadio palatino» (solo titolo letto) |
| **Tempio di Apollo Palatino** | 645 | Il podio | 41.8889, 12.4857 [WD Q1236860] | Platner e Ashby, Apollo Palatinus: dedicato il 9 ottobre del 28 a.C.; Ammiano è fra le fonti citate dalla voce; la parte sulla storia tarda è da leggere |

### Campidoglio (gruppo `campidoglio`, riga 1469)

| Edificio | Resta oggi | Dove oggi | Dalle fonti lette |
|---|---|---|---|
| **Carcere Mamertino** (San Pietro in Carcere) | Le due celle | 41.8933, 12.4844 [WD Q1035634] | Platner e Ashby, Carcer: la parte alta diventata chiesa per la tradizione di san Pietro (Thayer; data non letta) |
| **Portico degli Dei Consenti** | Il colonnato rimontato: Platner: «most of the entablature and four of the columns are ancient» | 41.8925, 12.4838 [WD Q7231810] | Platner e Ashby, Porticus Deorum Consentium: di età flavia, restaurato nel 367 |
| **Insula dell'Aracoeli** | Caseggiato a più piani | 41.8941, 12.4823 [SC] | Da leggere |
| **Sepolcro di Bibulo** | La fronte | Da prendere | Platner e Ashby, Sepulcrum Bibuli: fronte conservata, basamento alto 4,76 m e largo 6,50 |

### Foro Boario (gruppo `foroboario`, riga 1344)

| Edificio | Resta oggi | Dove oggi | Dalle fonti lette |
|---|---|---|---|
| **Tempio di Ercole Vincitore** (tempio rotondo) | Intero | 41.8887, 12.4808 [WD Q576929] | Il commento del modello cita it.wikipedia; nei Cataloghi XI «Herculem olivarium» (identificazione: da leggere) |
| **Tempio di Portuno** | Intero | 41.8893, 12.4809 [WD Q849241] | Attenzione: Platner e Ashby (Mater Matuta, templum) identificano con il tempio di Mater Matuta il tempio sul lato nord di piazza della Bocca della Verità «converted into the church of S. …»: il nome «Portuno» va controllato |
| **Arco di Giano** | Intero senza attico | 41.8894, 12.4828 [WD Q580555] | Platner e Ashby, Ianus Quadrifrons, citato nel commento del modello |
| **Arco degli Argentari** | Intero | 41.8895, 12.4830 [WD Q645062] | Platner e Ashby, citato nel commento (204) |
| **Sbocco della Cloaca Massima** | L'arco sul Tevere | 41.8893, 12.4829 [SC] | Da leggere |

### Esquilino (gruppo `esquilino`, riga 1408, che ha già un nome di gruppo)

| Edificio | Resta oggi | Dove oggi |
|---|---|---|
| **Arco di Gallieno** | L'arco | 41.8958, 12.5013 [SC] |
| **Trofei di Mario** (ninfeo di Alessandro, Cataloghi V «nympheum divi Alexandri») | Il rudere | 41.8954, 12.5043 [SC]; 41.8953, 12.5037 [WD Q3877101] |
| **Auditorium di Mecenate** | L'aula | 41.8941, 12.5013 [SC] |

### Altri gruppi e oggetti senza nome

| Edificio | Dove nel modello | Resta oggi | Dove oggi | Nota |
|---|---|---|---|---|
| **Mausoleo di Augusto** | `augusto`, riga 791, SENZA NOME e senza voce in `MONUMENTI` | Il tamburo | 41.9061, 12.4764 [WD Q770847]; 41.9060, 12.4771 [SC] | Platner e Ashby, Mausoleum Augusti: diametro 87 m; «During the whole of the Middle Ages it kept its name — Mons Augustus in 955-962»; fortezza dei Colonna, distrutta nel 1167, rifatta nel 1241; le volte interne crollate e il tutto usato come calcara nel Medioevo |
| **Obelischi del mausoleo di Augusto** (oggi Esquilino e Quirinale) | dentro `augusto`, riga 795 | I due obelischi | 41.8982, 12.4974 [WD Q3348559]; 41.8991, 12.4867 [WD Q3348571] | Spostati; Cataloghi, appendice: «in mausuleo Augusti duo» |
| **Arco di Dolabella e Silano** | `dolabella`, riga 1324, SENZA NOME | L'arco | 41.8856, 12.4952 [WD Q5830586] | Ha la voce in `MONUMENTI` ma non si clicca |
| **Sepolcro di Eurisace** | `eurisace`, riga 1444, SENZA NOME | La tomba a porta Maggiore | 41.8912, 12.5156 [SC] | Il modello lo fa sparire nel 402, chiuso nella torre (Platner e Ashby, citato nel commento) |
| **Ara Pacis** | dentro `orologio`, riga 1246 | Ricomposta nel museo | 41.9064, 12.4756 [WD Q623612] | Spostata (il posto antico sotto palazzo Fiano, dice il commento) |
| **Obelischi dell'Iseo** (Macuteo al Pantheon, Minerva, Dogali) | dentro `iseo`, riga 1392 | Tre obelischi | 41.8993, 12.4767 [WD Q3348569]; 41.8980, 12.4775 [WD Q826635]; 41.9022, 12.4975 [WD Q3348579] | Spostati |
| **Obelisco di Antinoo** (oggi al Pincio) | dentro `sessoriano`, riga 1439 | L'obelisco | 41.9108, 12.4797 [WD Q3348567] | Spostato; il posto antico è un'ipotesi del modello, dichiarata |
| **Obelisco di Augusto del Circo Massimo** (oggi piazza del Popolo) | dentro la funzione `circo`, riga 84 | L'obelisco | 41.9107, 12.4764 [WD Q568194] | Spostato (quando: non letto) |
| **Isola Tiberina, la prua di travertino** | `js/mura.js`, riga 286 e seguenti | Resti del rivestimento a forma di nave (quali: da leggere) | Da prendere | Nel modello c'è già la nave; la voce è `esculapio` |
| **Arco di Druso** (arco dell'acquedotto Antoniniano a porta San Sebastiano) | `js/mura.js`, riga 123 | L'arco | 41.8738, 12.5014 [WD Q1107952] | Ha un punto suo nella linea dell'acquedotto, senza nome |
| **Battistero lateranense** | dentro `laterano`, riga 811 | Intero | 41.8862, 12.5043 [WD Q2519438] | Merita nome e scheda (data e stato: da leggere) |

---

## 4. Mancanti che stanno solo nelle liste storiche

Sono edifici dei Cataloghi (o di Platner e Ashby) scomparsi: oggi non si vedono, ma un visitatore del 235-852 li avrebbe visti. Scelgo solo quelli grandi, che hanno un posto noto e che contano in una veduta della città.

| Edificio | Fonte che lo nomina | Dove | Quando sparisce, dalle fonti lette |
|---|---|---|---|
| **Colonna di Antonino Pio** (granito rosso, 14,75 m, con la statua) | Platner e Ashby, Columna Antonini Pii | Campo Marzio, sul ciglio di Montecitorio, 25 m a nord dell'Ustrino | Prima del Settecento la base era sepolta e il fusto sporgeva «about 6 metres above the ground»; scavata nel 1703, il fusto restò a terra in piazza Colonna fino al 1764, poi i pezzi servirono a restaurare l'obelisco di Montecitorio; la base è in Vaticano (giardino della Pigna) |
| **Statua equestre di Costantino** nel Foro | Cataloghi VIII, «aureum et equum Constantini»; Platner e Ashby, Equus Constantini | Forse sul basamento di mattoni ancora visibile all'estremità est della piazza | Citata nell'Itinerario di Einsiedeln (data dell'Itinerario: da leggere); la fine: non detta |
| **Terme di Costantino** (già nel modello) e le loro statue | Platner e Ashby | Quirinale | Distrutte quasi del tutto nel 1605-1621 (palazzo Rospigliosi) |
| **Tempio di Serapide sul Quirinale** («templum Salutis et Serapis», VI) | Cataloghi VI | Quirinale | Da leggere |
| **Tempio di Quirino** | Cataloghi VI | Quirinale | Da leggere |
| **Tempio della Gens Flavia** | Cataloghi VI | Quirinale | Da leggere |
| **Tempio di Giove Statore** | Cataloghi IV | Velia, presso l'arco di Tito | Da leggere (il modello ha Giove Statore solo dentro il portico d'Ottavia) |
| **Tempio di Tellus** | Cataloghi IV | Carine | Da leggere |
| **Macellum magnum** | Cataloghi II; Platner e Ashby, Stationes Vigilum: «the Macellum magnum, the present church of S. Stefano Rotondo» | Celio | Santo Stefano è del 475 nel modello: il macellum prima manca |
| **Castra peregrina** | Cataloghi II | Celio, accanto a Santo Stefano | Da leggere |
| **Le sette stazioni dei vigili** (I via Lata, II Esquilino, IV Aventino presso San Saba, V Celio) | Cataloghi; Platner e Ashby, Stationes Vigilum | Posti dati dalla voce | Da leggere |
| **Terme Deciane** e **terme di Sura** | Cataloghi XIII | Aventino (Terme Deciane: 41.8833, 12.4843 [WD Q2129565]) | Da leggere |
| **Terme Severiane e Commodiane** | Cataloghi I | Fuori porta Capena | Posto incerto: non disegnabili |
| **Horrea Galbae** (i grandi magazzini) | Cataloghi XIII | Fra l'Aventino e l'Emporio | Da leggere; il modello ha l'Emporio e la Porticus Aemilia |
| **Circo di Gaio e Nerone e Phrygianum** | Cataloghi XIV («Gaianum et Frigianum») | Vaticano | Il modello ha l'obelisco del circo; il circo stesso: da leggere |
| **Naumachia di Traiano** | Cataloghi XIV («naumachias») | Vaticano | Da leggere |
| **Portico di Filippo e tempio di Ercole delle Muse**, **Minucia** | Cataloghi IX | Campo Marzio meridionale | Da leggere |
| **Stalle delle fazioni del circo** («stabula IIII factionum») | Cataloghi IX | Campo Marzio | Posto discusso |
| **Tempio di Minerva Calcidica**, **porticus Divorum** | Cataloghi IX | Campo Marzio, presso l'Iseo | Da leggere |
| **Statua del Genio del popolo romano**, **Miliario aureo**, **Umbilicus Romae** | Cataloghi VIII | Foro | Piccoli; il miliario e l'umbilicus hanno basi oggi visibili (da leggere) |
| **Casa Romuli, Lupercale, auguratorium, curia vetus, tempio di Giove Vincitore** | Cataloghi X | Palatino | Da leggere |
| **Portico di Livia** | Cataloghi III | Oppio | Da leggere |
| **La Zecca** («moneta») | Cataloghi III | Presso San Clemente | Da leggere |
| **Tempio di Diana sull'Aventino** | Cataloghi XIII | Aventino | Da leggere |
| **Archi di Lucio Vero, Traiano e Druso** | Cataloghi I | Porta Capena, via Appia | Da leggere |

---

## 5. I tre casi

### 5.1 Septizodium

Fonte principale: Platner e Ashby, voce «Septizonium», pp. 473-475 (letta oggi intera). Seconda: it.wikipedia, «Septizodium» (letta oggi, per le misure e gli ultimi secoli; dove cita una fonte la scrivo).

- **Che cos'era e dove**: facciata monumentale fatta costruire da Settimio Severo «at the extreme south-east corner of the Palatine hill», dedicata nel 203 (iscrizione CIL VI 1032). La Storia Augusta (Severo 24) dice che doveva colpire chi arrivava dall'Africa per la via Appia. Ammiano (XV 7, 3), nel 355, lo chiama «Septemzodium… ubi operis ambitiosi nymfaeum Marcus condidit imperator»: era quindi una mostra d'acqua, un ninfeo. Platner: «There appears indeed to be no doubt that it was actually decorated with fountains». Nei Cataloghi: regione X, «septizonium divi Severi».
- **Forma e misure**: «an ornamental façade with three large niches, and three orders of columns», simile alla scena dei teatri; «There is no doubt, however, that the building only had three stories»; colonne dei tre ordini tutte composite, di marmi rari. it.wikipedia: prospetto lungo 89 m (300 piedi), con due avancorpi quadrati ai capi; la forma viene dalla pianta marmorea (fr. 38) e dai disegni del Rinascimento.
- **Punto di oggi** (il sito, non c'è più nulla): 41.8856, 12.4887 [WD Q1234446] (punto indicativo di un edificio scomparso).
- **Che cosa ne restava, secolo per secolo**:
  - 355: in uso, luogo affollato dove la plebe si raduna (Ammiano XV 7, 3).
  - fine dell'VIII secolo: it.wikipedia scrive «già in rovina»; la frase non ha una nota: **non letto** nella fonte.
  - Mirabilia (testo latino letto): «Septisolium fuit templum Solis et Lune», e un «theatrum Tarquinii et imperatorum ad Septem solium»: il nome è ancora in uso.
  - Medioevo (Platner): i nomi storpiati «septem viae», «septem solia maius» e «minus» (le due estremità, est e ovest; it.wikipedia: perché la parte di mezzo era crollata), «scuola di Vergilio»; la chiesa di Santa Lucia de Septem Solio è citata la prima volta nell'Itinerario di Einsiedeln; fortezza nel Medioevo (Platner rimanda a Stevenson, Bartoli e Lanciani, non letti); it.wikipedia: conclavi del 1198 e del 1241 tenuti lì.
  - 1588-1589: «The east angle of the building itself was preserved until the pontificate of Sixtus V, who ordered its destruction»; «Its destruction was completed by 14th September, 1588» (Platner); it.wikipedia, citando Lanciani: demolito nell'inverno 1588-89 da Domenico Fontana; le pietre nella base dell'obelisco di piazza del Popolo, nella colonna Antonina e altrove.
- **Posizione nel modello, da controllare**: con `globale()` di `js/monumenti.js` il centro della facciata disegnata (punto locale 10,5; 9,2 del gruppo `palatino`, x 13, z 47, ry -0,62) cade in scena a circa x 16,2, z 60,6. Il punto di Wikidata (41.8856, 12.4887) dà con `RM.ll` x 28,2, z 76,7: circa 200 m più a sud-est. La torre della Moletta, che it.wikipedia mette «lì presso», sta a 41.8843, 12.4887 [SC], cioè x 28,2, z 91,1. Per un edificio scomparso il punto di Wikidata è indicativo, ma tutte e due le fonti lo mettono più in basso e più a est di dove è ora, all'angolo del colle verso la via Appia, come dice la Storia Augusta. Prima di spostarlo: leggere la pianta (Forma Urbis fr. 38, o la carta di Lanciani).
- **Proposta**: farne un monumento a sé (`settizodio`), staccato dal gruppo `palatino`, con nome e scheda; la forma c'è già (righe 647-649). Storia: «uso» dal 203 (c'è dall'inizio); fino all'852 resta in piedi, perché nessuna fonte letta dice altro; l'acqua (è un ninfeo) si ferma nel 537 come gli altri acquedotti del modello, scelta da dichiarare; la frase «in rovina alla fine dell'VIII secolo» va letta nella fonte di it.wikipedia prima di usarla. Da tenere sempre in piedi anche quando il Palatino chiude (720): l'est fu demolito solo nel 1588.

### 5.2 Marforio

Fonti lette: Musei Capitolini, scheda «Colossal statue restored as Oceanus: Marforio» (museicapitolini.org/en/node/2613); Sovrintendenza Capitolina, «Statua detta di Marforio»; Turismo Roma, «Marforio»; it.wikipedia, «Marforio».

- **Che cos'è**: statua colossale di marmo di una divinità sdraiata, barbuta, con un mantello; I secolo d.C. (Musei Capitolini: «1rst century AD»; un'altra pagina dello stesso museo, non letta oggi, la direbbe del II secolo); misure 6,10 x 2,42 m. Restaurata nel 1594 come Oceano (conchiglia aggiunta); per altri un fiume (il Nera, il Reno, il Tevere: la Sovrintendenza dice che l'identificazione è «ardua»).
- **Dove stava in antico**: **le fonti non concordano**.
  - Sovrintendenza: «si trovava presso la chiesa di S. Pietro in Carcere, di fronte alla Chiesa dei Ss. Luca e Martina, dove la statua sarebbe rimasta fino al 1588».
  - Musei Capitolini: provenienza «Roma, Chiesa dei Ss. Luca e Martina (until 1592)».
  - Turismo Roma: «rinvenuta nel Foro di Augusto, presso il Tempio di Marte Ultore, nel XVI secolo, nella zona denominata nel Medioevo Foro di Marte o Martis Forum»; il nome verrebbe da lì, oppure dalla famiglia Marfoli, che aveva proprietà vicino al Carcere Mamertino.
  - it.wikipedia: «rinvenuta intorno al 1510 nel Foro di Augusto», poi messa ai piedi del clivo Argentario («salita di Marforio»).
- **Da quando è attestato lì**: le pagine degli enti parlano solo del Cinquecento. Nei *Mirabilia Urbis Romae* (testo latino letto su The Latin Library) c'è: «Ante privatam Mamertini, templum Martis, ubi nunc iacet simulacrum eius» («Davanti al carcere Mamertino, il tempio di Marte, dove ora giace la sua statua»). Una statua che «giace» davanti al Carcere: potrebbe essere il Marforio, ma **il testo non lo dice**, e la data dei Mirabilia (it.wikipedia: XI secolo per i primi) non l'ho letta in una fonte primaria. Prima dei Mirabilia: niente di letto. L'Itinerario di Einsiedeln: non letto.
- **Dove sta oggi**: cortile di Palazzo Nuovo, Musei Capitolini, 41.8935, 12.4832 [WD Q831467] (Sovrintendenza: 41.8938, 12.4832). Spostato nel 1588 in piazza San Marco, poi in piazza del Campidoglio in una fontana di Giacomo della Porta (1594), poi nel cortile (metà del Seicento).
- **Proposta**: per ora **non metterlo**. Nessuna fonte letta dice dove fosse fra il 235 e l'852; la più antica (i Mirabilia, se parlano di lui) è di circa due secoli dopo l'852 se è dell'XI secolo come dice it.wikipedia, e lo mette davanti al Carcere Mamertino, mentre Turismo Roma e it.wikipedia lo dicono trovato nel Foro di Augusto nel Cinquecento. Se si vuole, la cosa più vicina alle fonti è un cenno nella scheda del Foro di Augusto: «qui fu trovata nel Cinquecento la statua detta Marforio» (Turismo Roma), con la versione della Sovrintendenza accanto. Prima di disegnarlo bisogna leggere una fonte che lo dia nel Medioevo.

### 5.3 Bocca della Verità

Fonti lette: Turismo Roma, «Bocca della Verità»; it.wikipedia, «Bocca della Verità» (con le citazioni dei Mirabilia).

- **Che cos'è**: un «antico mascherone in marmo», un «grosso tondo» di circa 1,80 m di diametro (Turismo Roma), forse un tombino d'età romana (Turismo Roma: «probabilmente un tombino»; it.wikipedia lo dà come fatto, citando una nota). Il collegamento con Tarquinio il Superbo che dà Turismo Roma non ha una fonte: non lo userei.
- **Dov'era prima di Santa Maria in Cosmedin**: **non si sa** dalle fonti lette. it.wikipedia: i primi Mirabilia (XI secolo) parlano di un simulacro che parla presso «sanctam Mariam in Fontana», «si presume» che sia questo. Ho letto il passo nel testo latino («Ad sanctam Mariam in Fontana, templum Fauni; quod simulacrum locutum est Iuliano et decepit eum»): sta in mezzo ai luoghi dell'Esquilino (il «templum Marii» detto Cimbrum, il palazzo di Licinio, Santa Maria Maggiore, San Pietro in Vincoli), non a quelli del Foro Boario; che parli della Bocca è quindi tutt'altro che sicuro; il nome «Bocca della Verità» compare nel 1485; dai disegni e dalle stampe «era in origine collocata all'esterno del portico della chiesa».
- **Da quando sta nel portico**: dal 1631-1632, con i restauri di Urbano VIII (it.wikipedia 1631; Turismo Roma «dal 1632»).
- **Dove sta oggi**: 41.8881, 12.4817 [WD Q729490], portico di Santa Maria in Cosmedin (che nel modello è una chiesa di `CHIESE` dal 550).
- **Proposta**: **non metterla** fra il 235 e l'852: il primo dato sicuro fra quelli letti è il nome «Bocca della Verità» nel 1485 (it.wikipedia); il passo dei Mirabilia che it.wikipedia le riferisce («si presume») sta fra i luoghi dell'Esquilino; il suo posto in antico è ignoto. Al più, una riga nella scheda di Santa Maria in Cosmedin, se un giorno ne avrà una, e una voce in «Che cosa resta» per Roma oggi.

---

## 6. I Cataloghi regionari, regione per regione

Testo: *Notitia* (con le varianti del *Curiosum* dove la traduzione le segna), edizione Jordan 1871, traduzione di Roger Pearse (tertullian.org), letta su ToposText (topostext.org/work/688). La parola latina fra parentesi è quella del testo. Le righe finali di ogni regione (vici, insulae, domus…) non sono monumenti e non le conto.

Stato: **NOME** (id) / **GRUPPO** (quale) / **MANCA** (con «resta» se qualcosa si vede oggi).

### I. Porta Capena (14 voci)
| Voce | Stato |
|---|---|
| Tempio dell'Onore e della Virtù (aedem Honoris et Virtutis) | MANCA |
| Camene (Camenas) | MANCA |
| Fontana di Prometeo (lacum Promethei) | MANCA |
| Bagni di Torquato e di Vespasiano (balineum) | MANCA |
| Terme Severiane e Commodiane (thermas Severianas et Commodianas) | MANCA (posto incerto) |
| Area di Apollo e di Splenis (aream Apollinis et Splenis) | MANCA |
| Vico vetrario (vicum vitrarium) | quartiere, MANCA come nome |
| Area pannaria (aream pannariam) | MANCA |
| Mutatorium di Cesare (mutatorium Caesaris) | MANCA |
| Bagni di Bolano, Mamertino, Abascanto, Antiochiano | MANCA |
| Area dei carri (aream carruces) | MANCA |
| Templi di Marte, Minerva e Tempesta (aedem Martis et Minervae et Tempestatis) | MANCA |
| Fiume Almone (flumen Almonis) | MANCA (nessun «Almone» nei file) |
| Archi del divo Vero Partico, del divo Traiano e di Druso (arcum… Drusi) | GRUPPO per l'«arco di Druso», che oggi è l'arco dell'acquedotto Antoniniano (`js/mura.js`, riga 123); gli altri MANCA |

### II. Celio (15 voci)
| Voce | Stato |
|---|---|
| Tempio di Claudio (templum Claudii) | NOME `tempioclaudio` |
| Macellum magnum | MANCA (sotto Santo Stefano Rotondo, Platner e Ashby) |
| Lupanari | MANCA |
| Antro del Ciclope (antrum Cyclopis) | MANCA |
| V coorte dei vigili | MANCA |
| Castra peregrina | MANCA |
| Caput Africae | MANCA |
| Albero sacro (arborem sanctam) | MANCA |
| Casa di Filippo (domum Philippi) | MANCA |
| Victiliana | MANCA |
| Ludus matutinus e Gallicus | MANCA |
| Spoliarium | MANCA |
| Saniarium | MANCA |
| Armamentarium | MANCA |
| Mica aurea | MANCA |

### III. Iside e Serapide (10 voci)
| Voce | Stato |
|---|---|
| Zecca (monetam) | MANCA |
| Anfiteatro (amphitheatrum) | NOME `colosseo` |
| Ludus matutinus e Dacicus (nel *Curiosum* «ludum magnum») | NOME `ludusmagnus` per il Ludus Magnus; gli altri MANCA |
| Casa di Bruttio Presente | MANCA |
| Summum choragium | MANCA |
| Fontana dei pastori (lacum pastorum) | MANCA |
| Schola dei questori e dei caplatori | MANCA |
| Terme di Tito e di Traiano (thermas Titianas et Traianas) | NOME `tito`, `traiano` |
| Portico di Livia (porticum Liviae) | MANCA |
| Castra dei marinai di Miseno (castra Misenatium) | MANCA |

### IV. Tempio della Pace (18 voci)
| Voce | Stato |
|---|---|
| Porticus absidata | MANCA |
| Area di Vulcano (aream Vulcani) | MANCA |
| Buccina d'oro (aureum bucinum) | MANCA |
| Apollo Sandaliario | MANCA |
| Tempio di Tellus (templum Telluris) | MANCA |
| Horrea chartaria | MANCA |
| Tigillum sororium | MANCA |
| Colosso (colossum) | NOME `colosso` |
| Meta Sudans (metam sudantem) | NOME `metasudans` (e `metasudansvasca`) |
| Tempio di Roma e Venere | NOME `venere` |
| Tempio di Giove Statore (aedem Iovis statoris) | MANCA |
| Via Sacra (viam sacram) | strada, con nome in `js/strade-nomi.js` |
| Basilica Costantiniana | NOME `massenzio` |
| Tempio di Faustina (templum Faustinae) | GRUPPO `fori` (Antonino e Faustina, riga 558) |
| Basilica di Paolo (basilicam Pauli) | NOME `emilia`, `emiliarovina` |
| Foro transitorio (forum transitorium) | GRUPPO `fori` (foro di Nerva, riga 570); `casenerva` dall'850 |
| Suburra | quartiere (case di `js/citta.js`) |
| Bagno di Dafni | MANCA |

### V. Esquilie (10 voci)
| Voce | Stato |
|---|---|
| Fontana di Orfeo (lacum Orphei) | MANCA |
| Macellum Liviani | MANCA |
| Ninfeo del divo Alessandro | GRUPPO `esquilino` (Trofei di Mario) |
| II coorte dei vigili | MANCA |
| Ercole Sullano | MANCA |
| Horti Pallantiani | MANCA |
| Anfiteatro castrense | NOME `sessoriano` |
| Campo Viminale subager | MANCA |
| Minerva Medica | NOME `minervamedica` (che sia lo stesso edificio: non verificato) |
| Iside patrizia | MANCA |

### VI. Alta Semita (14 voci)
| Voce | Stato |
|---|---|
| Tempio della Salute e di Serapide | MANCA |
| Tempio di Flora | MANCA |
| Campidoglio antico (Capitolium antiquum) | MANCA |
| Statua di Mamurio | MANCA |
| Tempio del dio Quirino | MANCA |
| Malum punicum | MANCA |
| Horti Sallustiani | NOME `hortisallustiani` (e `casasallustio`, `obeliscosallustiano`) |
| Tempio della gens Flavia | MANCA |
| Terme di Diocleziano e di Costantino | NOME `diocleziano`, `termecostantino` |
| Castra praetoria | NOME `castrapretorio` (aggiunta dell'editore, secondo `src/testi/regioni-fonti.md`) |
| Dieci taverne (X tabernas) | MANCA |
| Galline bianche (gallinas albas) | MANCA |
| Area di Candido | MANCA |
| III coorte dei vigili | MANCA |

### VII. Via Lata (14 voci)
| Voce | Stato |
|---|---|
| Fontana di Ganimede | MANCA |
| I coorte dei vigili | MANCA (Platner e Ashby: sul lato est della via Lata, di fronte ai Saepta) |
| Arco nuovo (arcum novum) | NOME `arcusnovus` |
| Ninfeo di Giove | MANCA |
| Edicola capraria | MANCA |
| Campo di Agrippa | MANCA |
| Tempio del Sole e castra | NOME `sole`; i castra MANCA |
| Portico di Gipsiano e di Costantino | MANCA |
| Tempio nuovo della Speranza e della Fortuna | MANCA |
| Cavallo di Tiridate | MANCA |
| Foro suario | MANCA |
| Horti Largiani | MANCA |
| Mansuetae | MANCA |
| Lapis pertusus | MANCA |

### VIII. Foro Romano o Magno (24 voci)
| Voce | Stato |
|---|---|
| Tre rostri (rostra III) | GRUPPO `fori` (una tribuna, riga 546) |
| Genio del popolo romano | MANCA |
| Cavallo di Costantino (equum Constantini) | MANCA |
| Senato (senatum) | NOME `curia`, poi `santadriano` |
| Atrium Minervae | MANCA |
| Fori di Cesare, Augusto, Nerva, Traiano | GRUPPO `fori` |
| Tempio di Traiano e colonna coclide | GRUPPO `fori` (righe 587, 590) |
| VI coorte dei vigili | MANCA |
| Basilica argentaria | MANCA |
| Tempio della Concordia | GRUPPO `fori` (riga 547) |
| Ombelico di Roma | MANCA |
| Templi di Saturno e di Vespasiano e Tito | GRUPPO `fori` (righe 550, 548) |
| Campidoglio (Capitolium) | NOME `giove`; `campidoglio` SENZA NOME |
| Miliario aureo | MANCA |
| Basilica Giulia | GRUPPO `fori` (riga 544) |
| Tempio di Castore (templum Castorem) | GRUPPO `fori` (riga 551) |
| Vesta (Vestam) | GRUPPO `fori` (righe 549, 552) |
| Horrea Germaniciana e Agrippiana | MANCA |
| Aqua cernens IIII scauros | MANCA |
| Atrium Caci | MANCA |
| Vico iugario e unguentario | strade (non verificato se hanno nome) |
| Grecostadio | MANCA |
| Porticus margaritaria | MANCA |
| Elefante erbario | MANCA |

### IX. Circo Flaminio (23 voci)
| Voce | Stato |
|---|---|
| Stalle delle fazioni | MANCA |
| Aedes (senza nome nel testo) | — |
| Portico di Filippo | MANCA |
| Minucia vetus e frumentaria | MANCA |
| Crypta Balbi | NOME `balbo` |
| Teatro di Balbo | NOME `balbo` |
| Teatro di Pompeo | NOME `pompeo` |
| Teatro di Marcello | NOME `marcello` |
| Odeon (odium) | MANCA (resta: sezione 2, n. 11) |
| Stadio (stadium) | NOME `domiziano` |
| Campo Marzio | area |
| Trigarium | MANCA |
| Ciconiae nixae | MANCA |
| Pantheon (pantheum) | NOME `pantheon` |
| Basilica di Nettuno, di Matidia e di Marciana | GRUPPO `pantheonpiazza` per Nettuno (riga 694); Matidia e Marciana MANCA |
| Tempio del divo Antonino e colonna coclide | NOME `colonnamarco` per la colonna; il tempio MANCA |
| Hadrianeum | NOME `tempioadriano` |
| Terme Alessandrine e Agrippiane | NOME `termenerone`, `termeagrippa` |
| Portico degli Argonauti e di Meleagro | MANCA |
| Iseo e Serapeo | NOME `iseo` |
| Minerva Calcidica | MANCA |
| Divorum | MANCA |
| Insula Felicles | MANCA |

### X. Palatino (13 voci)
| Voce | Stato |
|---|---|
| Casa di Romolo | MANCA |
| Tempio della Madre degli dei e di Apollo Ramnusio | MANCA la Magna Mater (resta: sezione 2, n. 5); GRUPPO `palatino` per un tempio di Apollo (riga 645) |
| Pentapylum | MANCA |
| Casa Augustiana e Tiberiana | GRUPPO `palatino` per l'Augustana; la Tiberiana MANCA (resta: sezione 2, n. 4) |
| Auguratorium | MANCA |
| Area Palatina | GRUPPO `palatino` (sottinteso) |
| Tempio di Giove Vincitore | MANCA |
| Casa di Dione | MANCA |
| Curia vecchia | MANCA |
| Fortuna Respiciens | MANCA |
| Septizonium del divo Severo | GRUPPO `palatino` (righe 647-649), senza nome |
| Vittoria Germaniciana | MANCA |
| Lupercale (lupercam) | MANCA |

### XI. Circo Massimo (13 voci)
| Voce | Stato |
|---|---|
| Circo | NOME `circo` |
| Tempio del Sole e della Luna | MANCA |
| Madre degli dei e Giove Arboratore | MANCA |
| Tempio di Cerere (due volte nel testo) | MANCA |
| Le dodici porte (i carceres) | GRUPPO dentro `circo` (non verificato se si vedono) |
| Tempio di Mercurio | MANCA |
| Tempio di Dite padre | MANCA |
| Porta Trigemina | MANCA |
| Apollo Celispice | MANCA |
| Ercole Olivario | GRUPPO `foroboario` (se è il tempio rotondo: identificazione da leggere) |
| Velabro | area |
| Fortunium | MANCA |
| Arco del divo Costantino | NOME `arcocostantino` (la nota 2 di `regioni-fonti.md` discute perché sta qui) |

### XII. Piscina Pubblica (13 voci)
| Voce | Stato |
|---|---|
| Area radicaria | MANCA |
| Via Nova | strada (non verificato) |
| Fortuna mammosa | MANCA |
| Iside Atenodoria | MANCA |
| Bona Dea Subsaxana | MANCA |
| Clivo del Delfino | strada (non verificato) |
| Terme Antoniniane | NOME `caracalla` |
| Sette case dei Parti | MANCA (resti sotterranei, [SC] «Domus Parthorum») |
| Campo lanatario | MANCA |
| Casa di Cilone | MANCA |
| IV coorte dei vigili | MANCA (presso San Saba, Platner e Ashby) |
| Casa di Cornificia | MANCA |
| Casa privata di Adriano | MANCA |

### XIII. Aventino (12 voci)
| Voce | Stato |
|---|---|
| Armilustrium | MANCA |
| Tempio di Diana e Minerva | MANCA |
| Tre ninfei | MANCA |
| Terme di Sura e Deciane | MANCA |
| Dolocenum | MANCA |
| Casa privata di Traiano | MANCA (resti sotterranei, [SC] «Privata Traiani Domus») |
| Mappa aurea | MANCA |
| Platanon | MANCA |
| Horrea di Galba e Aniciana | MANCA (il modello ha l'Emporio accanto) |
| Portico fabario | MANCA |
| Scale di Cassio | MANCA |
| Foro pistorio | MANCA |

### XIV. Trastevere (16 voci)
| Voce | Stato |
|---|---|
| Gaianum e Phrygianum | MANCA (c'è solo l'obelisco del circo, `obeliscovaticano`) |
| Vaticano e naumachie | MANCA le naumachie |
| Horti di Domizia | MANCA |
| Gianicolo (due volte) | colle |
| Bagni di Ampelide, Prisco e Diana | MANCA |
| Mulini (molinas) | NOME `mulini` (dal 537; quelli dei Cataloghi stavano sul Gianicolo, nota 3 di `regioni-fonti.md`) |
| Statua Valeriana | MANCA |
| VII coorte dei vigili | MANCA (resta l'excubitorium, sezione 2, n. 14) |
| Testa della Gorgone | MANCA |
| Ercole che dorme | MANCA |
| Fors Fortuna | MANCA |
| Coraria Septimiana | MANCA |
| Campo Bruttiano e Codetano | MANCA |
| Horti di Geta | MANCA |
| Castra dei lettighieri | MANCA |

### I titoli del concilio del 499 (Armellini)

Mariano Armellini, *Le chiese di Roma dal secolo IV al XIX* (1891), parte I, cap. III, riporta i ventotto titoli sottoscritti al concilio di papa Simmaco del 1° marzo 499 (https://penelope.uchicago.edu/Thayer/I/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/churches/_Texts/Armellini/ARMCHI*/1.html). È l'elenco più antico delle chiese di quartiere di Roma. Confronto con il modello; l'identificazione con la chiesa di oggi, dove la scrivo, è quella corrente e va confermata nella parte II di Armellini:

| Titolo (499) | Chiesa di oggi | Nel modello |
|---|---|---|
| Praxedis | Santa Prassede | CHIESA (dal 490) |
| Vestinae | San Vitale | CHIESA (dal 402) |
| s. Ceciliae | Santa Cecilia | CHIESA (dal 450) |
| Pammachi | Santi Giovanni e Paolo | CHIESA (dal 398) |
| Clementis | San Clemente | CHIESA (dal 390) |
| Iulii | Santa Maria in Trastevere | CHIESA (dal 340) |
| Crysogoni | San Crisogono | CHIESA (dal 380) |
| Pudentis | Santa Pudenziana | CHIESA (dal 390) |
| s. Sabinae | Santa Sabina | NOME `sabina` (dal 432) |
| Equitii | San Martino ai Monti | CHIESA (dal 500: un anno dopo il concilio) |
| Damasi | San Lorenzo in Damaso | CHIESA (dal 380) |
| Matthaei | San Matteo in Merulana (demolita; il punto: 41.8919, 12.5024 [WD Q56514136]) | MANCA |
| Aemilianae | Santi Quattro Coronati (identificazione da confermare) | CHIESA (dal 450) |
| Eusebi | Sant'Eusebio | MANCA |
| Tigridis | da confermare | — |
| Crescentianae | San Sisto Vecchio (it.wikipedia) | MANCA |
| Nicomedis | da confermare | — |
| Cyriaci | San Ciriaco alle Terme (demolita; 41.9047, 12.4971 [WD Q24940077]) | MANCA |
| s. Susannae | Santa Susanna | CHIESA (dal 380) |
| Romani | da confermare | — |
| Bizantis | da confermare | — |
| s. Anastasiae | Sant'Anastasia | CHIESA (dal 380) |
| ss. Apostolorum | Santi Apostoli o San Pietro in Vincoli (da confermare) | tutte e due CHIESA |
| Fasciolae | Santi Nereo e Achilleo | CHIESA (dal 377) |
| s. Priscae | Santa Prisca | MANCA |
| s. Marcelli | San Marcello al Corso | MANCA |
| Lucinae | San Lorenzo in Lucina | CHIESA (dal 370) |
| Marci | San Marco | CHIESA (dal 336) |

Nota: San Martino ai Monti nel modello compare nel 500, ma il titolo di Equizio esiste già nel 499: da correggere, se l'identificazione regge.

### Appendice dei Cataloghi
- **Obelischi** (6): Circo Massimo 2 (GRUPPO `circo` riga 84 e NOME `obelisco357`), Vaticano (NOME `obeliscovaticano`), Campo Marzio (GRUPPO `orologio`), mausoleo di Augusto 2 (GRUPPO `augusto`). Tutti e sei nel modello.
- **Ponti** (8): Elio, Emilio, Aurelio, Milvio, Sublicio, Fabricio, Cestio, Probo: tutti NOME (`ponteelio`, `ponteemilio`, `ponteaurelio`, `pontemilvio`, `pontesublicio`, `pontefabricio`, `pontecestio`, `ponteprobo`).
- **Fori** (11): Romano, di Cesare, di Augusto, di Nerva, di Traiano (GRUPPO `fori`), Boario (NOME `foroboario`); di Enobarbo, suario, pistorio, dei Galli, dei Rustici MANCA.
- **Basiliche** (10): Giulia e Ulpia (GRUPPO `fori`), di Paolo (NOME `emilia`), Costantiniana (NOME `massenzio`), di Nettuno (GRUPPO `pantheonpiazza`); Vestilia, di Matidia, di Marciana, vascolaria, floscellaria MANCA.
- **Terme** (11): di Traiano, di Tito, di Agrippa, Antoniniane, Alessandrine, di Diocleziano, di Costantino NOME; di Sura, Commodiane, Severiane, Deciane MANCA.
- **Acquedotti** (19 nomi): il modello ne disegna cinque grandi più l'Antoniniano (`js/mura.js`); non li ho confrontati uno per uno.

---

## 7. Fonti lette (26 novembre 2026) e ciò che non ho potuto leggere

### Lette
- **Cataloghi regionari**: *Notitia* (edizione Jordan, Topographie der Stadt Rom II, 1871, pp. 543-571), traduzione e note di Roger Pearse, su ToposText: https://topostext.org/work/688 (testo intero, 14 regioni e appendici, con il latino fra parentesi). L'edizione di LacusCurtius citata in `src/testi/regioni-fonti.md` risponde all'indirizzo con l'asterisco vero, https://penelope.uchicago.edu/Thayer/L/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/_Texts/Regionaries/text*.html (con `curl -g`): l'ho aperta solo per controllare alcune voci (il «ludum magnum» del *Curiosum* nella III, «templum Castorum» nella VIII, «Iseum et Serapeum» nella IX, «septizonium divi Severi» nella X); il confronto intero l'ho fatto sul testo di ToposText. Il *Curiosum* da solo non l'ho riletto voce per voce.
- **Platner e Ashby**, A Topographical Dictionary of Ancient Rome (1929), su LacusCurtius, cartella https://penelope.uchicago.edu/Thayer/E/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/_Texts/PLATOP*/ , voci: Septizonium (intera), Aedes Castoris, Saturnus, Vesta (in parte), Concordia (solo i templi minori), Atrium Vestae, Regia, Rostra, Tabularium, Templum Vespasiani, Arcus Septimii Severi, Arcus Augusti, Arcus Tiberii, Carcer, Sepulcrum Bibuli, Domus Augustiana, Domus Tiberiana, Aedes Matris Deum (Magna Mater), Aedes Apollinis Palatini, Forum Holitorium, Odeum, Mausoleum Augusti, Columna Antonini Pii, Equus Constantini, Thermae Constantinianae, Thermae Traiani, Stationes Vigilum, Sepulcrum Scipionum, Aedes Fortunae (indice delle Fortune), Basilica Iulia, Forum Augustum, Forum Iulium, Forum Nervae, Forum Traiani (in parte), Templum Pacis, Templum Antonini et Faustinae, Concordia (il tempio grande), Aedes Matris Matutae, Fortuna in Foro Boario, Porticus Deorum Consentium, Templum Solis. Le pagine per lettera (A, D, F, M, S, T) servono a trovare il nome esatto dei file: le voci con «see separate page» hanno un indirizzo proprio che non sempre si indovina (per esempio `Templum_Antonini-Faustinae.html`).
- **Sovrintendenza Capitolina**, mappa dei luoghi (295 punti con nome e coordinate): https://www.sovraintendenzaroma.it/i_luoghi/mappa_dei_luoghi ; elenco delle aree archeologiche: https://www.sovraintendenzaroma.it/i_luoghi/roma_antica/aree_archeologiche ; scheda «Statua detta di Marforio»: https://www.sovraintendenzaroma.it/content/statua-detta-di-marforio
- **Parco archeologico del Colosseo**, pagine delle aree (Foro Romano, Palatino, Colosseo) e titoli delle schede «Mirabilia»: https://colosseo.it/area/foro-romano/ , https://colosseo.it/mirabilia/ (letti i titoli delle 31 schede e la scheda di Santa Maria Antiqua con la rampa di Domiziano).
- **Musei Capitolini**, scheda del Marforio: https://www.museicapitolini.org/en/node/2613
- **Turismo Roma** (Roma Capitale): https://www.turismoroma.it/it/luoghi/marforio , https://www.turismoroma.it/it/luoghi/bocca-della-verita
- **it.wikipedia**: «Bocca della Verità», «Marforio», «Septizodium», e le voci di Santa Prisca, San Sisto Vecchio, Santi Luca e Martina, San Giovanni a Porta Latina, San Cesareo de Appia, Santo Stefano del Cacco, Santo Stefano degli Abissini, Santa Maria in Aracoeli, San Lorenzo in Panisperna (prima chiesa attestata sotto Formoso, IX secolo tardo: dopo l'852, quindi esclusa), San Nicola in Carcere (prima menzione certa una lapide del 1128: esclusa) (usata solo dove le pagine degli enti tacciono, e detto ogni volta).
- **Mirabilia Urbis Romae**, testo latino: https://www.thelatinlibrary.com/mirabilia.html (passi sul cavallo del Laterano, sul «simulacrum» davanti al Carcere, su Santa Maria in Fontana, sul «Septisolium»).
- **Armellini**, *Le chiese di Roma dal secolo IV al XIX* (1891), indice e parte I: https://penelope.uchicago.edu/Thayer/I/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/churches/_Texts/Armellini/ARMCHI*/home.html e `…/1.html` (elenco dei titoli del 499).
- **Wikidata**: interrogazione SPARQL su https://query.wikidata.org/ di tutti gli elementi con coordinate fra 41,855-41,940 N e 12,440-12,530 E con data di fondazione (P571) fino all'852 (189 elementi), e di tutti quelli della stessa area con un nome che comincia per tempio, arco, porta, ponte, chiesa, basilica e simili (1923 righe). Ne vengono le coordinate [WD]. Le date di fondazione di Wikidata le riporto solo come indizio («Wikidata dà…»), non come fonte.

### Non lette, o lette solo in parte
- Il *Curiosum* da solo, voce per voce (su LacusCurtius c'è, all'indirizzo con l'asterisco).
- Le voci di Platner e Ashby per Ianus, Spes, Iuno Sospita, Pietas (Foro Olitorio), Divus Iulius, Templum Romuli, Ianus Quadrifrons, Vesta (la parte sul tempio del Foro dopo i Severi), Magna Mater (la parte tarda), Apollo Palatinus (la parte tarda): da cercare con il nome esatto nelle pagine per lettera (I, J non trovate con quei nomi). La storia di Sant'Omobono: da leggere.
- Le schede «Mirabilia» del Parco archeologico del Colosseo, salvo quella di Santa Maria Antiqua.
- Un elenco ufficiale delle chiese con la data di fondazione: non c'è fra le pagine degli enti che ho trovato. Ho usato l'elenco dei titoli del 499 in Armellini, l'elenco `CHIESE` del modello, Wikidata e it.wikipedia. Armellini, parte II (le schede chiesa per chiesa, rione per rione): **non letta**; è la fonte da usare per confermare le identificazioni dei titoli e le chiese della riga 23 della sezione 2.
- Per Marforio e Bocca della Verità: l'Itinerario di Einsiedeln; un'edizione critica datata dei Mirabilia.
- Per la statua equestre di Marco Aurelio al Laterano e per la Pigna nell'atrio di San Pietro: nessuna fonte letta.

### Coordinate «da prendere»
Tempio di Vespasiano (punto esatto), sepolcro di Bibulo, rampa di Domiziano, fondazioni degli archi di Augusto e Tiberio, Dioscuri del Quirinale, Pigna in Vaticano, prua dell'isola Tiberina.
