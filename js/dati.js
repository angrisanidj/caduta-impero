/* Dati. Stato delle verifiche:
   - i testi delle tappe dal 235 al 589 (e il fino dell'argento) sono stati controllati il 21 novembre 2026 sulle fonti: Ammiano XVI 10 e XXXI; Lattanzio, De mortibus 7;
     Orosio VII; Zosimo VI; Procopio, Guerre II-VIII (trad. Dewing); Marcellino Comes e il suo continuatore; Cassiodoro, Variae; Anonimo Valesiano; Gregorio di Tours X 1;
     Paolo Diacono; Liber Pontificalis (Duchesne); Bury, History of the Later Roman Empire. Citati a memoria dai verificatori e non riletti: Prospero, Idazio, Vittore di Vita, Malco, Giordane;
   - le tappe dal 593 all'852, gli eventi dal 663 e le schede delle chiese sono state controllate il 21 novembre 2026 sul Liber Pontificalis (Duchesne), su Paolo Diacono e sugli Annales regni Francorum;
     restano citati a memoria Gregorio Magno (Omelie su Ezechiele), Beda, il Codex Carolinus;
   - lo stato delle regioni è una semplificazione (una regione = un colore);
   - le curve sono punti orientativi, non serie pubblicate; le schede dei monumenti sono in gran parte ancora a memoria. */
window.RM_DATI=(function(){
'use strict';

var ATTI=[
 {n:'I',  nome:'La crisi',          da:235, a:284},
 {n:'II', nome:'La ricostruzione',  da:284, a:395},
 {n:'III',nome:'I barbari dentro',  da:395, a:439},
 {n:'IV', nome:'Lo svuotamento',    da:439, a:476},
 {n:'V',  nome:'Dopo la fine',      da:476, a:590},
 {n:'VI', nome:'La città dei papi',  da:590, a:852}
];

/* Stati di una regione: roma | usurpatore | conteso | federati | regno | perso | oriente | califfato | carolingio | chiesa.
   CAMBI elenca, per anno di tappa, solo ciò che muta rispetto alla tappa precedente. Le regioni sono quelle di src/mappa/genera.mjs (unioni di province reali).
   È una semplificazione dichiarata: una regione, un colore. Scelte da sapere: l'impero delle Gallie e Palmira sono «usurpatore»; la Britannia di Carausio pure (286-296);
   la Gallia del nord di Egidio e Siagrio (461-486) è «usurpatore», perché resta romana ma non obbedisce più a Ravenna; la Dalmazia resta «roma» fino al 480, con Giulio Nepote;
   i regni franchi sono «regno» fino all'800, poi «carolingio»; dal 756 Lazio ed Emilia sono «chiesa». Gli stati dell'Oriente servono solo alla linea tratteggiata del cruscotto.
   Scritti a memoria sui manuali correnti: DA VERIFICARE. */
var OVEST=['britannia','gallia','belgica','aquitania','provenza','burgundia','hispania','gallaecia','italia_nord','ravenna','spoleto','roma','benevento','calabria','sicilia','isole','rezia','pannonia','dalmazia','africa','mauretania','decumati'],
    EST=['dacia','balcani','anatolia','levante','egitto'];
var CAMBI={
 235:{},
 260:{britannia:'usurpatore',gallia:'usurpatore',belgica:'usurpatore',aquitania:'usurpatore',provenza:'usurpatore',burgundia:'usurpatore',hispania:'usurpatore',gallaecia:'usurpatore',decumati:'perso'},
 271:{hispania:'roma',gallaecia:'roma',provenza:'roma',dacia:'perso',levante:'usurpatore',egitto:'usurpatore',anatolia:'conteso'},
 274:{britannia:'roma',gallia:'roma',belgica:'roma',aquitania:'roma',burgundia:'roma',levante:'roma',egitto:'roma',anatolia:'roma'},
 293:{britannia:'usurpatore'},
 301:{britannia:'roma'},
 395:{balcani:'oriente',anatolia:'oriente',levante:'oriente',egitto:'oriente'},
 406:{gallia:'conteso',belgica:'conteso',britannia:'usurpatore'},
 409:{britannia:'perso',hispania:'conteso',gallaecia:'conteso'},
 418:{aquitania:'federati',gallia:'roma',gallaecia:'regno'},
 429:{mauretania:'conteso'},
 439:{africa:'regno',pannonia:'perso'},
 451:{burgundia:'federati'},
 455:{isole:'regno',mauretania:'perso',sicilia:'conteso'},
 458:{belgica:'regno'},
 468:{sicilia:'regno',gallia:'usurpatore'},
 472:{hispania:'regno',aquitania:'regno',burgundia:'regno',provenza:'conteso'},
 476:{italia_nord:'regno',ravenna:'regno',spoleto:'regno',roma:'regno',benevento:'regno',calabria:'regno',provenza:'regno',rezia:'perso'},
 493:{gallia:'regno',rezia:'regno',dalmazia:'regno'},
 537:{africa:'oriente',isole:'oriente',sicilia:'oriente',dalmazia:'oriente',calabria:'oriente',benevento:'oriente',roma:'conteso',spoleto:'conteso',ravenna:'conteso',italia_nord:'conteso'},
 568:{italia_nord:'regno',ravenna:'oriente',spoleto:'oriente',roma:'oriente'},
 589:{spoleto:'regno',benevento:'regno',balcani:'conteso'},
 663:{levante:'califfato',egitto:'califfato'},
 711:{africa:'califfato',mauretania:'califfato',hispania:'califfato',gallaecia:'califfato'},
 727:{gallaecia:'regno'},
 756:{ravenna:'chiesa',roma:'chiesa'},
 800:{gallia:'carolingio',belgica:'carolingio',aquitania:'carolingio',provenza:'carolingio',burgundia:'carolingio',rezia:'carolingio',decumati:'carolingio',italia_nord:'carolingio',spoleto:'carolingio'},
 846:{sicilia:'conteso'}
};
var TAPPE=[
 {anno:235, titolo:"L'imperatore ucciso dai suoi soldati", testo:"A Magonza i soldati assassinano Severo Alessandro e acclamano Massimino. In cinquant'anni si conteranno oltre venti imperatori, senza contare gli usurpatori: quasi tutti uccisi dalle proprie truppe o in battaglia."},
 {anno:251, titolo:'La peste e un imperatore caduto in battaglia', testo:"Un'epidemia attraversa l'impero per più di dieci anni. Ad Abritto Decio muore combattendo i Goti: per le fonti romane è il primo imperatore caduto contro un nemico esterno, ma i Persiani rivendicavano già la morte di Gordiano III, nel 244.",
  storici:"Quanto pesò la peste di Cipriano? Per Kyle Harper è una delle cause della crisi; altri la considerano impossibile da misurare con le fonti che abbiamo."},
 {anno:260, titolo:"Valeriano prigioniero, l'Occidente si stacca", testo:"L'imperatore Valeriano è catturato dai Persiani. L'Occidente si stacca sotto Postumo: Gallie, Britannia e Hispania hanno un loro imperatore, loro consoli, una loro moneta."},
 {anno:271, titolo:'Roma torna a costruire mura', testo:"Aureliano cinge la città con diciannove chilometri di mura: non accadeva da secoli. In Oriente Zenobia di Palmira controlla dall'Egitto all'Anatolia."},
 {anno:274, titolo:"L'impero ricucito", testo:"In tre anni Aureliano riprende Palmira e le Gallie. L'impero è di nuovo uno; una riforma ferma il crollo della moneta, che però contiene ormai solo il cinque per cento d'argento."},
 {intermezzo:true, anno:284, titolo:'La moneta', testo:"Intermezzo: dal denario all'antoniniano, la svalutazione del III secolo e il ritorno all'oro con il solido."},

 {anno:293, titolo:'Quattro imperatori, nessuno a Roma', testo:"Diocleziano divide il comando fra due augusti e due cesari. Non ci sono più capitali ma residenze vicine agli eserciti, che cambiano con le campagne: Treviri, Milano, Sirmio, Nicomedia."},
 {anno:301, titolo:'I prezzi fissati per legge', testo:"Un editto stabilisce il prezzo massimo di oltre mille merci e servizi, pena la morte. Non funziona, ma racconta uno Stato che vuole contare e tassare tutto."},
 {anno:330, titolo:'Una nuova Roma sul Bosforo', testo:"Costantino inaugura Costantinopoli. La sua moneta d'oro, il solido, resterà stabile per sette secoli; a Roma stanno sorgendo le prime grandi basiliche cristiane."},
 {anno:357, titolo:"L'imperatore in visita", testo:"Costanzo II entra a Roma per la prima volta e la guarda come un forestiero, stupito dal Foro di Traiano. La città è un monumento, non più una sede di governo."},
 {anno:378, titolo:'Adrianopoli', testo:"I Goti, accolti dentro l'impero due anni prima e ridotti alla fame, distruggono l'esercito dell'imperatore Valente: secondo Ammiano se ne salva appena un terzo. Muore lo stesso Valente.",
  storici:"Invasione o crisi di accoglienza? I Goti del 376 chiesero di entrare e furono ammessi. Per Heather a spingerli sul Danubio sono gli Unni; Halsall ridimensiona gli Unni e guarda alla politica romana oltre il fiume. Sulla rivolta concordano: nasce da come Roma gestì i profughi."},
 {anno:395, titolo:'Due corti', testo:"Alla morte di Teodosio l'impero passa ai due figli, uno a Costantinopoli e uno a Milano. Nessuno la considera una divisione definitiva; lo diventerà."},
 {intermezzo:true, anno:395, titolo:'I commerci', testo:"Intermezzo: relitti, anfore, piombo nei ghiacci. Che cosa misura davvero l'archeologia quando parla di crollo degli scambi."},

 {anno:402, titolo:'La corte si chiude a Ravenna', testo:"Stilicone affronta Alarico a Pollenzo e a Verona e lo costringe a lasciare l'Italia. La corte lascia Milano per Ravenna, protetta dalle paludi; a Roma Onorio fa restaurare mura, porte e torri, e forse è allora che la cinta raddoppia in altezza."},
 {anno:406, titolo:'Il Reno attraversato', testo:"Nell'ultima notte dell'anno (del 405, secondo alcuni studiosi) Vandali, Alani e Svevi passano il Reno. In Britannia l'esercito acclama un imperatore dopo l'altro; nel 407 il terzo, Costantino, porta le truppe in Gallia."},
 {anno:409, titolo:'La Britannia lasciata a sé stessa', testo:"Rimaste senza truppe, le città britanniche cacciano i funzionari dell'usurpatore e provvedono da sole alla difesa; Roma non tornerà più. I gruppi entrati in Gallia passano i Pirenei."},
 {anno:410, titolo:'Il sacco di Roma', testo:"Al terzo assedio in tre anni, fallite le trattative, i Goti di Alarico entrano in città e la saccheggiano per tre giorni (sei, secondo un altro cronista). Alarico era stato generale romano.",
  /* Girolamo, Commento a Ezechiele, prologhi ai libri I e III (latino letto su epistolae.unisi.it, lettera 274; traduzione nostra): «Postquam vero clarissimum terrarum omnium lumen
     exstinctum est, immo romani imperii truncatum caput et, ut verius dicam, in una urbe totus orbis interiit, obmutui»; «Quis crederet ut totius orbis exstructa victoriis Roma corrueret,
     ut ipsa suis populis et mater fieret et sepulcrum, […] ut cotidie sancta Bethleem, nobiles quondam utriusque sexus atque omnibus divitiis affluentes, susciperet mendicantes?»
     Agostino, Sermo 81, 9 (latino letto su augustinus.it; traduzione nostra): «Forte Roma non perit, si Romani non pereant. […] Roma enim quid est, nisi Romani?
     Non enim de lapidibus et lignis agitur, de excelsis insulis et amplissimis moenibus. Hoc sic erat factum, ut esset aliquando ruiturum.» La data del discorso (fine 410 o 411) è quella corrente, non controllata. */
  voci:[{testo:"«Dopo che si è spenta la luce più splendente di tutta la terra, anzi è stato troncato il capo dell'impero romano e, per dirlo più esattamente, in una sola città è perito il mondo intero, sono ammutolito. […] Chi avrebbe creduto che Roma, costruita con le vittorie sul mondo intero, sarebbe crollata, che sarebbe diventata per i suoi popoli insieme madre e sepolcro, […] che ogni giorno la santa Betlemme avrebbe accolto, ridotti a mendicare, uomini e donne un tempo nobili e colmi di ogni ricchezza?»",
         chi:"Girolamo, da Betlemme, dove arrivano i profughi: prologhi ai libri I e III del Commento a Ezechiele, scritto fra il 410 e il 414."},
        {testo:"«Forse Roma non perisce, se non periscono i Romani. […] Che cos'è Roma, infatti, se non i Romani? Non si tratta di pietre e di legni, di alti caseggiati e di mura grandissime. Tutto questo era stato fatto in modo che un giorno dovesse cadere.»",
         chi:"Agostino, vescovo di Ippona, Discorso 81, 9. Lo predica in Africa pochi mesi dopo il sacco, in risposta a chi diceva: «Ecco, è nei tempi cristiani che Roma perisce»."}],
  storici:"Alarico è il caso di scuola: capo di un popolo o comandante di un esercito romano senza paga? Le due letture, invasione e guerra civile, partono dagli stessi fatti."},
 {anno:418, titolo:'Un regno dentro l\'impero', testo:"I Visigoti si insediano in Aquitania per accordo (nel 418 o nel 419, secondo le cronache), come federati in cambio del servizio militare; se ricevano terre o una quota delle imposte è discusso. Non è il primo patto del genere, ma da questo nasce un regno."},
 {anno:429, titolo:'I Vandali passano in Africa', testo:"Genserico attraversa lo stretto con il suo popolo, forse ottantamila persone in tutto. Nel 430, durante l'assedio di Ippona, muore Agostino."},
 {anno:439, titolo:'Cartagine', testo:"I Vandali prendono Cartagine a sorpresa, in tempo di pace. Roma perde le province più ricche, il grano dell'annona e i porti da cui ora partono le flotte vandale: è il colpo da cui l'Occidente non si riprende."},
 {intermezzo:true, anno:439, titolo:'I barbari', testo:"Intermezzo: quanti erano, chi erano, che rapporto giuridico avevano con Roma. Nemici, federati, soldati regolari, re."},

 {anno:451, titolo:'Ezio e Attila', testo:"Ai Campi Catalaunici l'esercito che ferma gli Unni è fatto soprattutto di Visigoti, con Alani, Franchi, Burgundi e altri alleati. Il generale romano Ezio comanda una coalizione."},
 {anno:455, titolo:'Il secondo sacco', testo:"Ucciso Valentiniano III, Genserico arriva dal mare e spoglia Roma per quattordici giorni. Porta via anche metà delle tegole dorate del tempio di Giove."},
 {anno:458, titolo:'Una legge contro chi smonta la città', testo:"Maggioriano vieta di demolire gli edifici pubblici per ricavarne materiali. Tenta riforme e la riconquista dell'Africa; nel 461 sarà deposto e ucciso da Ricimero, il suo generale."},
 {anno:468, titolo:"L'ultima flotta", testo:"Le due corti armano insieme una spedizione enorme contro i Vandali, pagata quasi tutta da Costantinopoli. Va perduta davanti a Capo Bon, e con essa l'ultima speranza dell'Occidente di riavere l'Africa."},
 {anno:472, titolo:'Roma assediata dal proprio generale', testo:"Ricimero, che dal 456 fa e disfa imperatori, assedia e prende la città. Gli imperatori ormai governano poco più dell'Italia."},
 {anno:476, titolo:'Odoacre', testo:"Un ufficiale dell'esercito d'Italia depone il giovane Romolo Augustolo e rimanda le insegne imperiali a Costantinopoli. A Roma il Senato continua a riunirsi.",
  storici:"Il 476 fu una data per i contemporanei? Registrarono la deposizione, non una fine: Giulio Nepote restò imperatore riconosciuto, in Dalmazia, fino al 480. Diventa «la fine» nelle cronache scritte a Costantinopoli nel secolo successivo (Marcellino Comes; lo ha mostrato Brian Croke nel 1983)."},
 {intermezzo:true, anno:476, titolo:'La città', testo:"Intermezzo: come si svuota una metropoli. Annona, acquedotti, spoliazioni, sepolture dentro le mura."},

 {anno:493, titolo:'Teodorico', testo:"Il re degli Ostrogoti governa l'Italia da Ravenna con funzionari romani. A Roma fa restaurare le mura e il teatro di Pompeo e vieta di deviare l'acqua degli acquedotti; al Colosseo si danno ancora cacce alle fiere (l'ultima notizia è del 523)."},
 {anno:537, titolo:'Gli acquedotti tagliati', testo:"Nel 535 Giustiniano ha mandato Belisario a riprendere l'Italia. Durante l'assedio di Roma i Goti tagliano tutti gli acquedotti: le grandi terme si fermano e non riapriranno, anche se dopo la guerra alcuni condotti verranno riparati."},
 {anno:542, titolo:'La peste', testo:"La peste bubbonica parte dall'Egitto nel 541, l'anno dopo è a Costantinopoli, nel 543 raggiunge un'Italia in guerra da otto anni. Tornerà a ondate per due secoli."},
 {anno:546, titolo:'La città vuota', testo:"Totila prende Roma e porta via gli abitanti: secondo una cronaca la città resta deserta per quaranta giorni o più. Nel 550, ripresa Roma, vi assiste alle ultime corse di cavalli di cui si ha notizia.",
  /* Procopio, Guerre VII 22, 7-19 (Guerra gotica III 22), tradotto da noi dall'inglese di H. B. Dewing (Loeb 1924, letto su LacusCurtius): non dal greco. I tagli sono segnati. */
  voci:[{testo:"«Abbatté le fortificazioni in molti punti, così che ne andò distrutto circa un terzo. Stava anche per bruciare gli edifici più belli e più notevoli e per fare di Roma un pascolo per le pecore, ma Belisario lo seppe e gli mandò una lettera: “[…] L'hanno costruita a poco a poco, lasciando alle generazioni future il ricordo del valore di tutti: oltraggiare questi monumenti sarebbe un grande crimine contro gli uomini di ogni tempo”. […] Totila la lesse più volte, si convinse e non fece altro male a Roma. […] Non permise però che in città restasse anima viva, e la lasciò del tutto deserta.»",
         chi:"Procopio di Cesarea, Guerre VII 22. Era stato il consigliere di Belisario; la lettera, come i discorsi degli storici antichi, è scritta a modo suo, e il «terzo» delle mura è forse esagerato."}],
  storici:"Va preso alla lettera? Procopio scrive che Totila lasciò la città «del tutto deserta»; i «quaranta giorni o più», in cui a Roma sarebbero rimaste solo le bestie, vengono dal continuatore di Marcellino Comes. Una metropoli senza nessuno è poco credibile, ma l'immagine dice quanto fosse sceso il numero degli abitanti."},
 {anno:568, titolo:'I Longobardi', testo:"Quattordici anni dopo la fine ufficiale della guerra gotica, i Longobardi scendono in un'Italia spopolata: nel 568 secondo Paolo Diacono, nel 569 secondo un cronista del tempo. L'unità della penisola finisce qui, per tredici secoli."},
 {anno:589, titolo:'Il Tevere in città', testo:"Nell'autunno del 589, probabilmente a novembre, il Tevere esce dal letto, scavalca le mura, allaga i quartieri bassi e rovina i granai della Chiesa. Pochi mesi dopo torna la peste: ne muore papa Pelagio II, e al suo posto viene eletto Gregorio. Le piene torneranno: nel 716 o 717 l'acqua tiene la città per sette giorni, e in via Lata arriva a un'altezza d'uomo e mezza; poi nel dicembre 791."},
 {anno:593, titolo:"Dov'è il Senato, dov'è il popolo", testo:"Mentre i Longobardi di Agilulfo marciano su Roma, papa Gregorio Magno predica: «Dov'è il Senato? Dov'è ormai il popolo?» (Omelie su Ezechiele, II, 6). È il vescovo, adesso, a distribuire il grano e a trattare con gli assedianti."},

 /* ---- atto VI: da Gregorio Magno a Carlo Magno ---- */
 {anno:609, apre:true, titolo:'Il Pantheon diventa una chiesa', testo:"Il 1° agosto 608 l'ultima colonna onoraria del Foro viene dedicata all'imperatore Foca; il 13 maggio 609 il Pantheon, donato da Foca a papa Bonifacio IV, è consacrato come chiesa. Dei templi antichi si salvano quelli che diventano chiese."},
 {anno:663, titolo:"L'ultimo imperatore a Roma", testo:"Costante II arriva il 5 luglio, resta dodici giorni e manda a Costantinopoli il bronzo dei monumenti, tegole del Pantheon comprese; poi passa in Sicilia. Roma è una città di provincia dell'impero d'Oriente, governata di fatto dal papa."},
 {anno:711, titolo:'Il Mediterraneo si divide', testo:"Cartagine cade nel 698, la Spagna dei Visigoti nel 711. La sponda sud del mare che era stato di Roma passa al califfato; l'Occidente guarda ormai a nord.",
  storici:"Henri Pirenne vide qui la vera fine del mondo antico: non le invasioni germaniche, ma la rottura dell'unità del Mediterraneo. L'archeologia mostra però che i commerci erano crollati già prima."},
 {anno:727, titolo:"San Pietro, meta dell'Occidente", testo:"Re e pellegrini anglosassoni, franchi, longobardi vengono a pregare sulla tomba dell'apostolo. Attorno alla basilica, fuori le mura, crescono monasteri, ospizi e le «scholae» delle nazioni: un quartiere nuovo, mentre la città antica si svuota."},
 {anno:756, titolo:'I Longobardi alle porte', testo:"Astolfo assedia Roma per tre mesi. Il papa chiama di nuovo i Franchi, non Costantinopoli: Pipino scende in Italia e consegna al papa le terre riprese ai Longobardi. Nasce uno Stato della Chiesa."},
 {anno:780, titolo:'Adriano I ripara la città', testo:"Carlo Magno ha conquistato il regno longobardo nel 774. A Roma papa Adriano I fa riparare quattro acquedotti, le mura e i tetti delle basiliche, e amplia le domuscultae, le tenute agricole della Chiesa che sfamano la città."},
 {anno:791, titolo:'Il Tevere porta via una porta', testo:"Nel dicembre 791 il Tevere divelle dalle fondamenta porta Flaminia e la trascina lungo la via Lata, dove l'acqua supera le due altezze d'uomo; presso il ponte che oggi è ponte Sisto abbatte un tratto di mura. Per tre giorni il fiume corre per la città come nel proprio letto. Papa Adriano fa portare il cibo in barca a chi è chiuso in casa (Liber Pontificalis)."},
 {anno:800, titolo:'Natale in San Pietro', testo:"Il 25 dicembre papa Leone III incorona Carlo Magno imperatore. In Occidente c'è di nuovo un impero, ma il suo centro è oltre le Alpi. Roma, poche decine di migliaia di abitanti fra le rovine, è la città dei papi e dei pellegrini."},
 {anno:801, titolo:'La terra trema', testo:"Quattro mesi dopo l'incoronazione, la sera del 29 aprile 801 (il 30 nelle cronache), un terremoto fa crollare gran parte del tetto di San Paolo fuori le mura. È l'unico danno a Roma che le fonti ricordano. Papa Leone III lo fa ricostruire: le basiliche degli apostoli sono ormai gli edifici meglio curati della città."},
 {anno:846, titolo:'I Saraceni a San Pietro', testo:"Una flotta saracena, forse dalla Sicilia o dall'Africa, sbarca a Ostia e risale il Tevere. Le mura di Aureliano proteggono la città, ma le due basiliche più venerate dell'Occidente sono fuori dalla cinta: San Pietro viene saccheggiato e, secondo il Liber Pontificalis, anche San Paolo."},
 {anno:852, epilogo:true, titolo:"Le mura dall'altra parte del fiume", testo:"Dopo il sacco saraceno e dopo l'incendio che verso l'847 brucia parte del Borgo, papa Leone IV chiude San Pietro dentro una cinta nuova: il 27 giugno 852 nasce la «città leonina». Le mura di Aureliano chiudono ancora diciannove chilometri di rovine, orti e vigne; quelle nuove proteggono una tomba. L'impero è finito da tempo, e Roma ha trovato un altro centro. Le rovine che vediamo oggi, però, sono in gran parte opera dei secoli seguenti, e più dei cantieri che dei terremoti: il lato sud del Colosseo fu usato come cava fin dal VI secolo, e quel che ne restava cadde in un terremoto: nell'847 secondo chi lo ha scavato, nel 1349 secondo la tradizione."}
];

/* curve: [anno, valore] */
var CURVE={
  /* Abitanti di Roma. "punti" è la linea che muove la scena; "banda" è la forchetta delle stime pubblicate [anno, minimo, massimo].
     Fonti delle forchette: Krautheimer 1980 (800.000 verso il 400; 30.000 a metà VI secolo; forse 90.000 verso il 600; 35.000 in età carolingia),
     Durliat 1990 (600-800.000 nel IV secolo), Lançon (500.000 nel 419), Novella 36 di Valentiniano III (450-500.000 verso il 452), A.H.M. Jones (650.000),
     Delogu (15-30.000 a metà VI), Santangeli Valenzani (50-60.000 a metà VI; 20-30.000 in età carolingia), Wickham (20-25.000),
     Meneghini e Santangeli Valenzani 2023 (circa 60.000 stabili). Stime estreme per l'VIII-IX secolo: da 5.000 (Hodges) a 90.000.
     Il 476 non ha stime puntuali: è un'interpolazione. Il 550 è il valore minimo (Krautheimer), non il centro della forchetta. */
  popolazione:{nome:'Abitanti di Roma', nota:'stima',
    punti:[[235,900000],[300,800000],[367,750000],[408,750000],[419,450000],[452,450000],[476,250000],[500,100000],[535,80000],[550,30000],[590,45000],[600,50000],[680,32000],[750,25000],[801,30000],[852,30000]],
    banda:[[235,700000,1200000],[300,600000,1200000],[367,500000,1000000],[408,700000,1000000],[419,300000,500000],[452,400000,650000],[476,150000,400000],[500,60000,200000],[535,60000,200000],[550,15000,100000],[600,20000,90000],[700,20000,60000],[852,20000,60000]]},
  /* Fino della moneta d'argento: denario di Severo Alessandro 43-50%, Decio circa 40%, Gallieno 18% nel 260 e 2,5% a fine regno (dati Walker, in Katsari 2002);
     riforma di Aureliano 5% garantito (RIC online). Le analisi di Walker sono di superficie e sovrastimano il fino (Butcher e Ponting): valori indicativi. */
  argento:{nome:'Argento nella moneta', nota:'% di fino, stime, fino alla riforma di Diocleziano', punti:[[235,45],[250,40],[260,18],[268,3],[274,5],[294,5]], fine:294, dopo:'dal 309-310 solido d\'oro, stabile'},
  commerci:{nome:'Commerci', nota:'indice orientativo dai relitti (I secolo = 100)', punti:[[235,60],[300,45],[400,35],[439,25],[500,18],[568,12],[590,12],[700,6],[801,8],[852,8]]}
};

/* dalla popolazione alla quota di isolati abitati nel modello */
var ABITATI=[[0,0],[30000,.07],[500000,.74],[1000000,1]];

/* storia dei monumenti: [anno, stato]. Prima del primo anno vale "assente" se indicato, altrimenti il primo stato.
   Stati: uso | chiuso | spogliato (tolti bronzi e rivestimenti) | cava (smontato per ricavarne pietra e calce) | bruciato | crollato | assente. */
var MONUMENTI={
  colosseo:[[80,'uso'],[523,'cava']], circo:[[0,'uso'],[550,'chiuso']], fori:[[0,'uso'],[537,'chiuso'],[800,'cava']],
  giove:[[0,'uso'],[392,'chiuso'],[455,'spogliato']], palatino:[[0,'uso'],[720,'chiuso']], pantheon:[[126,'uso'],[392,'chiuso'],[609,'uso'],[663,'spogliato'],[735,'uso']],
  domiziano:[[86,'uso'],[450,'chiuso']], traiano:[[109,'uso'],[430,'chiuso']], caracalla:[[0,'assente'],[216,'uso'],[537,'chiuso']],
  diocleziano:[[0,'assente'],[306,'uso'],[537,'chiuso']], massenzio:[[0,'assente'],[312,'uso'],[600,'chiuso']], adriano:[[139,'uso']],
  laterano:[[0,'assente'],[318,'uso']], pietro:[[0,'assente'],[333,'uso']],
  mura:[[0,'assente'],[275,'uso']], acquedotti:[[0,'uso'],[537,'chiuso'],[780,'uso']],
  /* quel che viene costruito, o distrutto, durante la storia */
  emilia:[[0,'uso'],[410,'bruciato']], marcello:[[0,'uso'],[370,'cava']], venere:[[0,'uso'],[392,'chiuso'],[630,'spogliato']],
  sole:[[0,'assente'],[274,'uso'],[392,'chiuso']], arcocostantino:[[0,'assente'],[315,'uso']], termecostantino:[[0,'assente'],[315,'uso'],[537,'chiuso']],
  croce:[[0,'assente'],[330,'uso']], lorenzo:[[0,'assente'],[335,'uso']], agnese:[[0,'assente'],[350,'uso']], paolo:[[0,'assente'],[390,'uso'],[801,'crollato'],[806,'uso']],
  sabina:[[0,'assente'],[432,'uso']], mariamaggiore:[[0,'assente'],[434,'uso']], stefano:[[0,'assente'],[475,'uso']], cosma:[[0,'assente'],[527,'uso']],
  foca:[[0,'assente'],[608,'uso']],
  /* il quartiere che cresce attorno a San Pietro */
  monasteripietro:[[0,'assente'],[450,'uso']], porticopietro:[[0,'assente'],[400,'uso']], scholae:[[0,'assente'],[727,'uso']], leonine:[[0,'assente'],[852,'uso']],
  /* riuso */
  mulini:[[0,'assente'],[537,'uso']], casenerva:[[0,'assente'],[850,'uso']],
  /* luoghi del lavoro e dei commerci */
  testaccio:[[0,'uso']], arcotito:[[0,'uso']], colosso:[[0,'uso'],[455,'assente']], metasudans:[[0,'uso'],[537,'chiuso']], emporio:[[0,'uso'],[430,'chiuso']], balbo:[[0,'uso'],[430,'chiuso'],[750,'cava']], antoniniano:[[0,'uso'],[537,'chiuso'],[776,'uso']]
};

/* Chiese minori attorno a cui si raccoglie l'abitato: [nome, latitudine, longitudine, anno in cui compare, tipo].
   Date controllate (titoli attestati al sinodo del 499, diaconie nell'elenco dell'807 del Liber Pontificalis, voci delle singole chiese);
   quando la fonte dà solo un secolo o una prima attestazione, l'anno è una scelta nostra dentro quell'intervallo.
   Coordinate dell'edificio attuale, controllate su OpenStreetMap il 21 novembre 2026 (tutte entro 25 m dal centro dell'edificio; Santa Maria in Trastevere, Sant'Agata dei Goti e San Vito sono scostate di una ventina di metri per non cadere sulla strada che le costeggia).
   Santa Maria Domine Rose (IX secolo: l'anno è una scelta nostra) è al centro dell'isolato della Crypta Balbi, dove l'hanno trovata gli scavi. */
var CHIESE=[
 ['San Marco',41.8960,12.4816,336,'titolo'],['Santa Maria in Trastevere',41.88924,12.46974,340,'titolo'],['San Lorenzo in Lucina',41.9034,12.4787,370,'titolo'],
 ['Santi Nereo e Achilleo',41.88017,12.49476,377,'titolo'],["Sant'Anastasia",41.8882,12.4841,380,'titolo'],['San Lorenzo in Damaso',41.8969,12.4717,380,'titolo'],
 ['Santa Susanna',41.9042,12.4937,380,'titolo'],['San Crisogono',41.88911,12.47351,380,'titolo'],['San Clemente',41.8893,12.4976,390,'titolo'],
 ['Santa Pudenziana',41.8985,12.4955,390,'titolo'],['Santi Giovanni e Paolo',41.88655,12.49209,398,'titolo'],['Santa Balbina',41.8805,12.4897,400,'titolo'],
 ['San Vitale',41.8997,12.4907,402,'titolo'],['San Pietro in Vincoli',41.8939,12.4931,439,'titolo'],['Santa Cecilia',41.8876,12.4759,450,'titolo'],
 ['Santi Quattro Coronati',41.8883,12.4983,450,'titolo'],["Sant'Agata dei Goti",41.89648,12.48920,465,'chiesa'],['Santa Bibiana',41.8955,12.5092,468,'basilica'],
 ['Santa Prassede',41.8961,12.4986,490,'titolo'],['San Martino ai Monti',41.89460,12.49823,500,'titolo'],['Santa Maria in Cosmedin',41.8881,12.4816,550,'diaconia'],
 ['Santa Maria Antiqua',41.89093,12.48555,560,'chiesa'],['Santi Apostoli',41.89808,12.48347,570,'basilica'],['San Gregorio al Celio',41.8855,12.4906,575,'monastero'],
 ['San Teodoro',41.8904,12.4848,580,'diaconia'],['Santa Lucia in Selci',41.89453,12.49684,630,'diaconia'],['San Saba',41.8786,12.4855,650,'monastero'],
 ['Santa Maria in via Lata',41.89812,12.48131,700,'diaconia'],['Santa Maria in Domnica',41.8847,12.4956,700,'diaconia'],["Sant'Eustachio",41.8988,12.4758,720,'diaconia'],
 ['Santa Maria in Aquiro',41.8999,12.4782,730,'diaconia'],['San Giorgio al Velabro',41.8896,12.4832,745,'diaconia'],['Santa Maria in Campo Marzio',41.9014,12.4765,750,'monastero'],
 ["Sant'Angelo in Pescheria",41.8925,12.4787,755,'diaconia'],['San Silvestro in Capite',41.9031,12.4806,761,'monastero'],["Sant'Apollinare",41.9009,12.4736,780,'monastero'],
 ['San Vito',41.89596,12.50173,780,'diaconia'],['San Bonifacio',41.8838,12.4786,780,'diaconia'],['Santa Maria Domine Rose',41.89443,12.47901,850,'chiesa'],['Santa Maria Nova',41.8912,12.4889,850,'chiesa']
];

/* Il percorso del pellegrino: Itinerario di Einsiedeln (Einsiedeln, Stiftsbibliothek, cod. 326, ff. 82v-84r), percorso VIII,
   «A porta sancti Petri usque porta Asinaria». Testo latino letto sul codice (e-codices) e confrontato con Lanciani 1891 e Hülsen 1907;
   identificazioni di Lanciani e Hülsen. Nel codice la pagina sinistra elenca ciò che sta a sinistra di chi cammina, la destra ciò che sta a destra;
   il lato è affidabile, la distanza no (sono citati anche edifici lontani mezzo chilometro). Il raggruppamento in stazioni è nostro.
   stazioni: [nome, latitudine, longitudine, a sinistra, a destra, nota]; via: punti del tracciato secondo Lanciani e Hülsen. */
var ITINERARIO={
  titolo:"Da porta San Pietro a porta Asinaria", fonte:"Itinerario di Einsiedeln · fra il 757 e l'855, forse verso l'800", anno:800,
  intro:"Un quaderno copiato nel IX secolo, oggi nell'abbazia di Einsiedeln, elenca i percorsi che attraversano Roma: su una pagina ciò che si vede a sinistra, su quella di fronte ciò che si vede a destra. Chi lo scrisse non si sa. Questo percorso taglia tutta la città, dal ponte davanti al mausoleo di Adriano fino alla cattedrale. Le parole fra virgolette sono quelle del manoscritto.",
  stazioni:[
   ["Il ponte e l'arco",41.9005,12.4668,"","","«Per arcum»: passato ponte Elio si entra in città sotto un arco, probabilmente quello degli imperatori Graziano, Valentiniano e Teodosio."],
   ["Verso il teatro di Pompeo",41.8972,12.4712,"«Circus Flamineus, ibi sancta Agnes»: è lo stadio di Domiziano, chiamato con un nome sbagliato, con la chiesa di Sant'Agnese. «Thermae Alexandrinae»: le terme fra lo stadio e il Pantheon.","«Sancti Laurentii in Damaso» e «Theatrum Pompei».","La guida nomina ancora teatri e terme come punti di riferimento, senza dire in che stato sono."],
   ["Il Campo Marzio",41.8948,12.4780,"«Sancti Eustachii. Rotunda»: il Pantheon, chiamato con il nome antico e non con quello della chiesa. «Thermae Commodianae»: probabilmente le terme di Agrippa. «Minervium, ibi sancta Maria».","«Cypresus»: non si sa che cosa fosse. «Sancti Laurentii in Minerva»: identificazione discussa.",""],
   ["Sotto il Campidoglio",41.8954,12.4814,"«Ad sanctum Marcum». «Forum Traiani et columna eius».","«Capitolium».","Dopo San Marco la strada gira a destra ai piedi del colle: la via diretta verso i Fori, suppone Lanciani, era già ingombra di rovine."],
   ["L'arco di Severo",41.8929,12.4847,"«Tiberis»: forse la statua di un dio fluviale, il futuro Marforio. «Sancti Hadriani»: la Curia del Senato diventata chiesa.","«Sancti Sergii, ibi umbilicum Romae»: una chiesa scomparsa, accanto al punto che segnava il centro della città. «Sancti Georgii», lontano, al Velabro.","«Per arcum Severi»: si entra nel Foro passando sotto l'arco."],
   ["Il Foro",41.8921,12.4861,"«Sancti Cosmae et Damiani».","«Sancta Maria antiqua». «Ad sanctum Theodorum».","«Forum Romanum» è scritto a cavallo delle due pagine: è la strada stessa."],
   ["La via Sacra",41.8907,12.4886,"«Palatius Neronis»: per Lanciani la basilica di Massenzio, di cui si era perso il nome. «Aeclesia sancti Petri». «Ad vincula»: San Pietro in Vincoli, lontano. «Arcus Titi et Vespasiani».","«Palatinus». «Testamentum»: ignoto.","I nomi sbagliati mostrano che la memoria degli edifici antichi si stava già confondendo."],
   ["Il Colosseo",41.8899,12.4911,"«Palatium Traiani»: forse il tempio di Venere e Roma, forse le terme di Traiano. «Amphitheatrum».","«Arcus Constantini». «Meta sudante».",""],
   ["Sul Celio",41.8888,12.4980,"«Ad sanctum Clementem».","«Caput Africae»: una contrada del Celio. «Quattuor Coronati».",""],
   ["Il Laterano",41.8862,12.5062,"«Monasterium Honorii». «Forma Claudiana»: l'acquedotto. «Patriarchium Lateranense»: il palazzo del papa.","«Sancti Iohannis in Lateranis».","«Porta Asinaria»: il percorso finisce alla porta, subito oltre la cattedrale."]
  ],
  via:[[41.9020,12.4664],[41.9005,12.4668],[41.8985,12.4686],[41.8972,12.4712],[41.8958,12.4729],[41.8950,12.4756],[41.8947,12.4785],[41.8953,12.4812],[41.8940,12.4838],[41.8929,12.4847],[41.8921,12.4861],[41.8912,12.4878],[41.8905,12.4888],[41.8899,12.4908],[41.8895,12.4932],[41.8888,12.4978],[41.8872,12.5025],[41.8862,12.5060],[41.8857,12.5087]]
};

/* Sacchi e assedi, come si vedono in città. da/a: anni in cui l'evento è in scena.
   fuochi: [x, z, forza]; attorno a ogni fuoco gli isolati restano bruciati per qualche decennio (raggio "bruciati", in decine di metri).
   Testi fino al 589 e piena del 791 controllati sulle fonti; gli altri solo in parte. Posizione e forza dei fuochi sono una nostra resa. */
var EVENTI=[
 {id:'sacco410', da:410, a:410.4, bruciati:14, fuochi:[[100,-192,1.2],[78,-165,1],[7.2,-1,.9]],      // Procopio, Guerre III 2: case presso la porta e casa di Sallustio. Aventino e Celio: tracce d'incendio negli scavi (già in Bury), ma nessuna attribuibile al sacco con sicurezza
  testo:"24 agosto 410 · I Goti di Alarico entrano da Porta Salaria. Tre giorni di saccheggio secondo Orosio, sei secondo Marcellino Comes: bruciano le case presso la porta e la casa di Sallustio; nel Foro brucia, probabilmente allora, la basilica Emilia. San Pietro e San Paolo sono rispettate come luoghi d'asilo."},
 {id:'sacco455', da:455, a:455.4, bruciati:0, fuochi:[],
  testo:"2-16 giugno 455 · I Vandali di Genserico restano quattordici giorni. Papa Leone, scrive Prospero d'Aquitania, ottiene che non ci siano stragi né incendi; il saccheggio è metodico: dal tempio di Giove portano via metà del tetto di bronzo dorato."},
 {id:'assedio472', da:472, a:472.4, bruciati:0, fuochi:[],      // le fonti parlano di combattimenti e saccheggio, non di incendi
  testo:"Luglio 472 · Dopo mesi d'assedio Ricimero prende la città all'imperatore Antemio, asserragliato sul Palatino. Lo scontro decisivo è al ponte Elio, davanti al mausoleo di Adriano."},
 {id:'velo536', da:536.2, a:537.3, bruciati:0, fuochi:[], velo:true,      // Procopio, Guerre IV 14; Cassiodoro, Variae XII 25. La didascalia è quella dell'assedio, che viene dopo nell'elenco
  testo:"536 · Per circa un anno il sole resta velato e non scalda."},
 {id:'assedio537', da:537, a:538.2, bruciati:0, fuochi:[], campi:true,
  testo:"Marzo 537 - marzo 538 · Vitige assedia Belisario per un anno e nove giorni. Sette accampamenti goti: sei davanti alle porte da nord a est, uno oltre il Tevere. Gli acquedotti vengono tagliati. Da un anno il sole è velato: Procopio scrive che dava luce senza splendore, come la luna; Cassiodoro, in Italia, che a mezzogiorno i corpi non facevano ombra. Oggi lo si attribuisce a grandi eruzioni vulcaniche."},
 {id:'totila546', da:546, a:546.5, bruciati:10, fuochi:[[-125,40,1],[-112,62,.8]], brecce:true,      // Procopio VII 37.3 e VIII 22.3; continuatore di Marcellino Comes, a. 547: incendi, soprattutto oltre il Tevere
  testo:"17 dicembre 546 · Totila entra di notte da Porta Asinaria. Fa abbattere tratti delle mura, brucia parte di Trastevere e porta via gli abitanti: per settimane Roma resta vuota."},
 {id:'piena589', da:589, a:589.5, bruciati:0, fuochi:[], piena:true,      // Gregorio di Tours, Storie X 1 («mense nono»: novembre per Duchesne); Gregorio Magno, Dialoghi III 19; Paolo Diacono III 23-24
  testo:"Autunno 589 · Il Tevere allaga la città bassa e rovina i granai della Chiesa (Gregorio di Tours, che scrive «nel nono mese»: probabilmente novembre). L'estensione dell'acqua qui disegnata è indicativa: le zone più basse e più vicine al fiume."},
 {id:'piena791', da:791, a:791.5, bruciati:0, fuochi:[], piena:true,      // Liber Pontificalis, vita di Adriano I, cc. 94-95 (ed. Duchesne I, p. 513): «in vicesimo anno, mense decembrio, XV indictione»
  testo:"Dicembre 791 · Il Tevere divelle porta Flaminia e la trascina fino all'arco detto Tres Falciclas, sulla via Lata; lì l'acqua supera le due altezze d'uomo (Liber Pontificalis). L'estensione qui disegnata è indicativa."},
 {id:'costante663', da:663, a:663.4, bruciati:0, fuochi:[],
  testo:"5-17 luglio 663 · Costante II è l'ultimo imperatore a visitare Roma finché l'impero la governa. In dodici giorni fa smontare il bronzo dei monumenti, comprese le tegole del Pantheon."},
 {id:'assedio756', da:756, a:756.4, bruciati:0, fuochi:[], campi:true,
  testo:"Gennaio-marzo 756 · I Longobardi di Astolfo assediano Roma per tre mesi e devastano i dintorni. Il papa chiama i Franchi."},
 {id:'natale800', da:800, a:800.4, bruciati:0, fuochi:[],
  testo:"25 dicembre 800 · In San Pietro papa Leone III incorona imperatore Carlo Magno, re dei Franchi."},
 {id:'terremoto801', da:801, a:802, bruciati:0, fuochi:[],
  testo:"29 aprile 801, di sera · Un terremoto scuote l'Italia centrale. A Roma crolla gran parte del tetto di San Paolo fuori le mura, con le sue travi."},
 {id:'saraceni846', da:846, a:846.4, bruciati:5, ricostruzione:3, fuochi:[[-218,-100,.6],[-74,370,.5]],
  testo:"Agosto 846 · Una flotta saracena sbarca a Ostia e risale il Tevere. San Pietro, fuori dalle mura, viene saccheggiato (anche San Paolo, per il Liber Pontificalis); le milizie delle scholae, mandate a Porto, vengono massacrate."},
 {id:'incendio847', da:847, a:847.5, bruciati:9, ricostruzione:3, fuochi:[[-224,-100,.9]],
  testo:"847 · Un incendio brucia le case di Sassoni e Longobardi nel Borgo e arriva al portico di San Pietro; il Liber Pontificalis racconta che Leone IV lo ferma con il segno della croce. Nello stesso anno una scossa di terremoto: le cronache non nominano danni, ma secondo gli archeologi del Colosseo fa cadere ciò che restava del suo fronte sud."}
];

/* Schede dei monumenti: che cos'è, e le date che contano. Testi provvisori, scritti a memoria: DA VERIFICARE. */
var SCHEDE={
  colosseo:{cosa:"Anfiteatro Flavio: cinquantamila posti o più.", date:[[80,"Inaugurato da Tito."],[217,"Un fulmine lo incendia; i restauri durano più di vent'anni."],["inizio V sec.","Vietati i combattimenti fra gladiatori (ultime menzioni verso il 435); restano le cacce."],["484 o 508","Restaurato dopo un terremoto a spese del senatore Decio Mario Venanzio Basilio."],[443,"Un terremoto lo danneggia; seguono restauri."],["c. 500","Mentre si danno ancora spettacoli, sul lato sud si apre un cantiere di smontaggio: un blocco porta il nome del senatore Geronzio (lettura discussa)."],[523,"Ultime cacce con animali di cui si ha notizia, sotto Teodorico."],["fine VI sec.","Cunicoli scavati per estrarre travertino e metallo; una vasca per spegnere la calce al primo ordine. Dalla seconda metà dell'VIII secolo lo spoglio diventa massiccio."],[847,"Secondo il Parco archeologico del Colosseo, dopo il terremoto di quest'anno cade ciò che restava del fronte sud, già in gran parte smontato, e forma un cumulo di travertini. Nessuna cronaca lo dice, e per i sismologi a Roma la scossa fu debole."],[1349,"La tradizione attribuiva il crollo al terremoto del 1349. Già nel 1993 chi ha scavato il monumento (R. Rea) scriveva: «il Colosseo non crolla, viene a più riprese smontato»."]]},
  circo:{cosa:"Il più grande edificio per spettacoli di Roma: le corse dei carri.", date:[[357,"Costanzo II, in visita, assiste ai giochi."],[550,"Ultime corse di cavalli di cui si ha notizia: vi assiste Totila, che ha ripreso la città (Procopio)."]]},
  fori:{cosa:"Foro Romano e Fori imperiali: il centro politico e monumentale.", date:[[283,"Un incendio devasta il Foro; Diocleziano ricostruisce la Curia."],[357,"Costanzo II, in visita, resta ammirato dal foro di Traiano."],[410,"Brucia, probabilmente nel sacco, la basilica Emilia."],[527,"Prima chiesa nell'area: Santi Cosma e Damiano."],[537,"Dopo l'assedio le funzioni pubbliche si spengono. Gli edifici restano in piedi."],["484 o 508","Un terremoto danneggia il tempio della Pace e quello di Marte Ultore."],[608,"Colonna di Foca: l'ultimo monumento eretto nel Foro."],[630,"Intorno al 630 papa Onorio I trasforma la Curia del Senato nella chiesa di Sant'Adriano."],["c. 500","Nel foro di Augusto il tempio di Marte Ultore viene quasi del tutto smontato: su un rocchio di colonna c'è il nome del proprietario, il patrizio Decio."],["VII-VIII sec.","Una calcara lavora nel foro di Traiano, che per il resto è ancora in piedi e in uso."],["inizio IX sec.","Tolto il lastricato del foro di Cesare: al suo posto capanne, orti, una vigna. Nel foro di Nerva sorgono case signorili fatte di blocchi antichi."],[850,"Verso la metà del secolo vengono asportate tutte le lastre della piazza del foro di Traiano, forse per farne calce."],[847,"Alcuni archeologi attribuiscono al terremoto crolli nel foro di Traiano e nella basilica Ulpia. Le cronache non lo dicono."],["XI sec.","Dopo la fine di questa storia la zona si impaluda: il villaggio nato nel foro di Cesare viene abbandonato e l'area prende il nome di «i Pantani», fino alla bonifica di fine Cinquecento."]]},
  emilia:{cosa:"Basilica civile sul lato nord del Foro.", date:[["inizio V sec.","Il tetto brucia, probabilmente nel sacco del 410: sul pavimento sono rimaste le monete, le più tarde del 409."],["dopo","L'aula non viene ricostruita e serve da cava di materiali. Secondo alcuni studiosi fu rifatto il portico di facciata; altri lo negano."]]},
  giove:{cosa:"Tempio di Giove Ottimo Massimo, sul Campidoglio.", date:[[392,"Vietati i culti pagani: il tempio chiude."],[408,"Prima di quest'anno Stilicone fa togliere le lamine d'oro dalle porte."],[455,"I Vandali asportano metà del tetto di bronzo dorato (Procopio)."],["VI sec.","Cassiodoro lo cita ancora fra le meraviglie di Roma. Poi le fonti tacciono."]]},
  palatino:{cosa:"I palazzi degli imperatori.", date:[["dal III sec.","Gli imperatori vi abitano sempre più di rado."],[455,"I Vandali portano via bronzi e arredi."],[500,"Teodorico, in visita, assegna duecento libbre l'anno al restauro del palazzo e delle mura."],[663,"Vi alloggia l'imperatore Costante II."],[705,"Vi risiede papa Giovanni VII, figlio di un curatore del palazzo."],["dopo il 712","Ultime notizie del palazzo in funzione."]]},
  pantheon:{cosa:"Il tempio di tutti gli dèi, ricostruito da Adriano.", date:[[126,"Completato sotto Adriano."],[392,"Chiuso al culto."],[609,"Donato al papa dall'imperatore Foca, il 13 maggio è consacrato come Santa Maria ad Martyres: per questo è arrivato intero fino a noi."],[663,"Costante II fa togliere le tegole di bronzo dorato e le spedisce verso Costantinopoli."],["731-741","Papa Gregorio III lo ricopre di lastre di piombo."]]},
  domiziano:{cosa:"Stadio per le gare atletiche; oggi è piazza Navona.", date:[[86,"Inaugurato da Domiziano."],["V sec.","In disuso; nelle arcate si insediano case e botteghe."]]},
  traiano:{cosa:"Terme sul colle Oppio.", date:[[109,"Inaugurate."],["V sec.","Abbandonate: nell'esedra si seppelliscono i morti."]]},
  caracalla:{cosa:"Terme sulla via Appia, per migliaia di bagnanti al giorno.", date:[[216,"Inaugurate."],[537,"Senz'acqua dopo il taglio degli acquedotti; non riapriranno."]]},
  diocleziano:{cosa:"Le terme più grandi mai costruite a Roma.", date:[[306,"Inaugurate."],[537,"Senz'acqua dopo il taglio degli acquedotti."]]},
  massenzio:{cosa:"L'ultima grande basilica civile.", date:[[312,"Iniziata da Massenzio nel 308, finita da Costantino."],["VI sec.","Non si sa quando smette di funzionare; ormai la chiamano «tempio di Roma»."],[847,"Secondo alcuni archeologi le volte crollano con il terremoto di quest'anno; non ci sono fonti scritte."]]},
  adriano:{cosa:"Tomba di Adriano e dei suoi successori. La quadriga in cima e i bronzi agli angoli del basamento sono indicativi: li suggeriscono le ricostruzioni correnti, non un rilievo.", date:[[139,"Completato."],["III-V sec.","Inglobato nelle difese della città (sotto Aureliano o sotto Onorio: le fonti divergono)."],[537,"Gli assediati lanciano le statue sui Goti."]]},
  laterano:{cosa:"La cattedrale di Roma, voluta da Costantino.", date:[[318,"Dedicata il 9 novembre secondo la tradizione liturgica; l'anno non è attestato: si propongono il 318 e il 324."],[410,"I «barbari», quasi certamente i Goti di Alarico, portano via il grande fastigio d'argento donato da Costantino; Valentiniano III lo farà rifare (Liber Pontificalis)."],[455,"I Vandali asportano gli arredi; papa Leone I fa rifare i vasi sacri."]]},
  pietro:{cosa:"Basilica costantiniana sulla tomba dell'apostolo, fuori le mura.", date:[[320,"Inizio dei lavori verso il 319-322 secondo Krautheimer, dopo il 324 secondo altri; finita attorno alla metà del secolo."],[410,"Alarico la rispetta, con San Paolo, come luogo d'asilo."],[500,"Papa Simmaco (498-514) costruisce residenze ai due lati dell'atrio, fontane e ospizi per i poveri."],[727,"Secondo una tradizione tarda nasce ora la Schola Saxonum, primo ospizio di una nazione di pellegrini; le fonti dicono solo che le scholae sorgono nel corso dell'VIII secolo."],[800,"Carlo Magno vi è incoronato imperatore."],[846,"Saccheggiata dai Saraceni: pochi anni dopo sarà chiusa dentro le mura leonine."]]},
  mura:{cosa:"Diciannove chilometri di cinta: Roma non aveva mura in uso da secoli.", date:[[271,"Iniziate da Aureliano, finite sotto Probo."],[403,"Sotto Onorio, fra il 401 e il 403, mura, porte e torri vengono restaurate (lo dicono le iscrizioni sulle porte). Il raddoppio dell'altezza è attribuito da alcuni a questi lavori, da altri a Massenzio: qui lo si mostra sotto Onorio."],[546,"Totila ne abbatte dei tratti (un terzo secondo Procopio, che forse esagera); nel 547 Belisario richiude le brecce in venticinque giorni."],[715,"Papa Gregorio II avvia il restauro; Gregorio III ne rifà gran parte a sue spese, Adriano I lo prosegue per tutto il pontificato."]]},
  acquedotti:{cosa:"Undici condotti che portavano l'acqua a terme, fontane e mulini.", date:[[537,"Tagliati dai Goti durante l'assedio."],[554,"La Prammatica Sanzione di Giustiniano conferma i fondi per riparare gli acquedotti: è una norma, non la prova di lavori fatti. Verso il 600 papa Gregorio Magno scrive che sono trascurati al punto da rischiare la rovina."],[780,"Papa Adriano I (772-795) ne fa riparare quattro (Liber Pontificalis). La Sabbatina, l'antica Traiana, era rotta da vent'anni, con cento arcate a terra: torna a servire San Pietro e i mulini del Gianicolo. La Iovia, anch'essa ferma da vent'anni, è forse un ramo della Marcia. La Claudia riporta l'acqua al Laterano; della Vergine entrava pochissima acqua, e dopo i lavori disseta quasi tutta la città. Gli anni precisi non sono scritti: verso il 776 è una deduzione degli studiosi."]]},
  sole:{cosa:"Tempio del Sole Invitto.", date:[[274,"Dedicato da Aureliano il 25 dicembre 274, dopo la vittoria su Palmira."],[392,"Vietati i culti pagani."]]},
  arcocostantino:{cosa:"Arco trionfale accanto al Colosseo.", date:[[315,"Inaugurato il 25 luglio 315, dedicato dal Senato per la vittoria su Massenzio. Molti rilievi vengono da monumenti di Traiano, Adriano e Marco Aurelio: probabilmente presi dai depositi dello Stato più che da edifici ancora in piedi."]]},
  termecostantino:{cosa:"Le ultime grandi terme di Roma, sul Quirinale.", date:[[315,"Costruite sotto Costantino, probabilmente prima del 315."],[443,"Restaurate dal prefetto urbano dopo gravi danni."],["VI sec.","Non si sa quando chiudono; qui si assume il 537, come per le altre grandi terme."]]},
  croce:{cosa:"Chiesa ricavata in un'aula del palazzo Sessoriano, residenza di Elena, madre di Costantino.", date:[[330,"Trasformata in chiesa sotto Costantino, probabilmente dopo il ritorno di Elena dalla Terrasanta (326-328): l'anno non è noto."]]},
  lorenzo:{cosa:"Basilica sulla via Tiburtina, presso la tomba del martire.", date:[["IV sec.","Fondata da Costantino; la cronologia precisa non è nota."],[580,"Papa Pelagio II costruisce una nuova chiesa sopra la tomba."]]},
  agnese:{cosa:"Basilica cimiteriale e mausoleo di Costantina, sulla via Nomentana.", date:[[338,"Basilica fondata da Costantina, figlia di Costantino, fra il 337 e il 351: l'anno non è noto."],[351,"Il mausoleo è finito attorno alla metà del secolo; secondo alcuni qualche anno dopo."]]},
  paolo:{cosa:"Basilica sulla tomba dell'apostolo, sulla via Ostiense: grande quanto San Pietro.", date:[[386,"Tre imperatori ordinano di sostituire la piccola chiesa costantiniana (lettera al prefetto Sallustio, 386) e ne rovesciano l'orientamento: abside verso la via Ostiense, facciata verso il Tevere."],[390,"Consacrata da papa Siricio, probabilmente nel 390 (la data è su una colonna); i lavori finiscono sotto Onorio, nei primi anni del V secolo."],[801,"Il terremoto del 29 aprile fa crollare gran parte del tetto con le sue travi; papa Leone III lo ricostruisce."],[846,"Saccheggiata dai Saraceni secondo il Liber Pontificalis; per gli Annali di San Bertino quelli diretti qui furono fermati e uccisi dalla gente della Campagna."]]},
  sabina:{cosa:"Basilica sull'Aventino.", date:[[432,"Fondata da Pietro d'Illiria sotto Celestino I (422-432) e finita sotto Sisto III. Le ventiquattro colonne vengono tutte da uno stesso edificio antico, non identificato."]]},
  mariamaggiore:{cosa:"Basilica sull'Esquilino dedicata a Maria.", date:[[434,"Costruita sotto papa Sisto III (432-440), dopo il concilio di Efeso. Il 5 agosto è la festa della dedicazione; l'anno non è noto, e il 434 qui è nominale."]]},
  stefano:{cosa:"Chiesa a pianta circolare sul Celio.", date:[[455,"Cantiere avviato sotto papa Leone I: le travi sono datate al 455 circa."],[475,"Consacrata da papa Simplicio (468-483)."]]},
  foca:{cosa:"Colonna onoraria nella piazza del Foro.", date:[[608,"Dedicata il 1° agosto dall'esarca Smaragdo all'imperatore d'Oriente Foca. È l'ultimo monumento eretto nel Foro; colonna e basamento sono presi da monumenti più antichi."]]},
  monasteripietro:{cosa:"Monasteri, mausolei e residenze cresciuti attorno alla basilica.", date:[[400,"Mausoleo della famiglia di Onorio all'estremità sud del transetto; accanto, una rotonda più antica che papa Simmaco dedica a sant'Andrea."],[450,"Primo monastero presso la basilica, fondato da papa Leone I (Liber Pontificalis); che sia quello dei Santi Giovanni e Paolo, a nord, è un'identificazione moderna."],[680,"San Martino, addossato all'abside, è attestato da Beda."],[732,"I monasteri sono tre; il quarto, Santo Stefano Minore, arriva nella seconda metà del secolo. I monaci cantano in basilica le vigilie e le ore di ogni giorno."],[757,"Il mausoleo di Onorio diventa la cappella di santa Petronilla, protettrice dei re franchi."]]},
  porticopietro:{cosa:"Via coperta da ponte Elio alla basilica, per i pellegrini.", date:[["fine IV sec.","Costruita probabilmente allora (secondo altri verso il 500): circa ottocento metri coperti."],[537,"Prima notizia sicura: la cita Procopio durante l'assedio."],[780,"Restaurata da papa Adriano I, che ne rifà le fondazioni lungo la riva del Tevere con oltre dodicimila blocchi di tufo."]]},
  scholae:{cosa:"Ospizi delle nazioni: alloggio, chiesa e cimitero per i pellegrini di uno stesso popolo.", date:[[727,"Schola dei Sassoni: una tradizione più tarda la attribuisce al re Ine del Wessex, venuto a Roma verso il 726."],[756,"Fra il 756 e il 757 papa Stefano II alza sulla basilica una torre con tre campane, forse all'ingresso dell'atrio."],[799,"Prima notizia certa delle quattro scholae: Sassoni, Franchi, Frisoni e Longobardi accolgono papa Leone III al suo ritorno. Il sito di quella dei Longobardi è discusso. Da qui il nome «Borgo», dal germanico burg, che compare nelle fonti sotto Pasquale I (817-824)."],[847,"Un incendio brucia le case di Sassoni e Longobardi e arriva al portico della basilica; un altro, sotto Pasquale I, aveva già distrutto il borgo dei Sassoni."]]},
  leonine:{cosa:"Cinta attorno a San Pietro e al Borgo: circa tre chilometri, con decine di torri, costruita in buona parte con blocchi tolti a edifici antichi.", date:[[846,"Il sacco saraceno mostra che le basiliche fuori le mura sono indifese."],[848,"Papa Leone IV avvia i lavori nel secondo anno di pontificato."],[852,"Cerimonia conclusiva il 27 giugno: nasce la «città leonina»."]]},
  venere:{cosa:"Il tempio più grande di Roma, fra il Foro e il Colosseo.", date:[[307,"Ricostruito da Massenzio dopo un incendio."],[392,"Chiuso al culto."],[630,"Papa Onorio I (625-638), con il permesso dell'imperatore Eraclio, toglie le tegole di bronzo dorato del «tempio di Roma» per coprire San Pietro. Per i più è questo tempio; secondo altri la vicina basilica di Massenzio."],[850,"Papa Leone IV costruisce Santa Maria Nova fra le sue rovine."]]},
  marcello:{cosa:"Teatro voluto da Augusto, fra il Campidoglio e il Tevere.", date:[[370,"Parte dei suoi travertini serve a restaurare il ponte Cestio: è il più antico caso documentato di un monumento di Roma usato come cava."],[421,"Vi si collocano ancora statue: il teatro è in piedi e frequentato."]]},
  mulini:{cosa:"Mulini montati su barche ancorate nella corrente del Tevere.", date:[[537,"Tagliati gli acquedotti, i mulini del Gianicolo si fermano: Belisario fa legare coppie di barche subito sotto un ponte, con la ruota sospesa in mezzo (Procopio). Il ponte è probabilmente quello dove oggi c'è ponte Sisto."],["VIII-IX sec.","I mulini del Gianicolo tornano a macinare quando Adriano I ripara l'acquedotto che li muove, rotto da vent'anni (Liber Pontificalis). Che funzionassero già nel VII secolo lo dice un solo manoscritto, per papa Onorio I. Per i mulini sul fiume in questi secoli mancano documenti, ma resteranno sul Tevere fino al 1870."]]},
  casenerva:{cosa:"Due case signorili ai lati della strada che attraversa il foro di Nerva.", date:[["prima","Il foro è ridotto a una strada: sul pavimento spogliato restano i solchi dei carri."],[850,"In pieno IX secolo sorgono le due case. La maggiore misura circa dieci metri per diciannove: piano terra in blocchi antichi con portico ad archi, piano superiore in mattoni, scala esterna di marmo di recupero."],["XI sec.","Abbandonate."]]},
  arcotito:{cosa:"Arco a un solo fornice a cavallo della via Sacra, nel punto più alto fra il Foro e la valle del Colosseo: eretto dopo la morte di Tito (81) per la sua vittoria in Giudea.", date:[[800,"L'Itinerario di Einsiedeln lo nomina come «Arcus Titi et Vespasiani»: è ancora un punto di riferimento per chi attraversa la città."],["Medioevo","Viene inglobato in una fortezza, ed è anche per questo che arriva fino a noi; le parti mancanti sono rifatte nell'Ottocento."]]},
  colosso:{cosa:"Statua colossale di bronzo alta circa 35 metri (120 piedi, secondo Svetonio), opera del greco Zenodoro. Fatta per Nerone, trasformata da Vespasiano in statua del Sole. È da lei, non dall'anfiteatro, che viene il nome «Colosseo». La figura qui è indicativa.", date:[[128,"Verso il 128 Adriano la sposta qui, più vicino all'anfiteatro, per far posto al tempio di Venere e Roma: senza smontarla, dice la Historia Augusta."],[192,"Commodo ne aveva fatto un Ercole con il proprio volto; alla sua morte torna a essere il Sole."],[354,"Ultima notizia antica: un calendario ricorda che il 6 giugno il colosso viene incoronato di ghirlande."],[455,"Non si sa quando cade o viene fuso. Qui scompare con il sacco dei Vandali, che portano via i bronzi: è una nostra scelta, senza fonti. Il basamento resta fino al 1936."],["VIII sec.","«Finché starà il Colosso starà Roma», riporta Beda: per gli studiosi il detto riguarda la statua, non l'anfiteatro, che ne prende il nome solo verso il Mille."]]},
  metasudans:{cosa:"Grande fontana a forma di cono, come la meta di un circo, da cui l'acqua trasudava: rivestita di marmo, al punto d'incontro di cinque regioni della città.", date:[[96,"Costruita sotto Domiziano, secondo un cronografo antico; i mattoni concordano."],["IV sec.","Attorno al cono una vasca di ventuno metri di diametro, probabilmente dell'età di Costantino."],[537,"Senza acquedotti non può più funzionare: qui la si considera spenta da allora. È una deduzione."],[800,"L'Itinerario di Einsiedeln la nomina ancora come punto di riferimento: «Meta sudante»."],[1936,"Il nucleo di mattoni resta in piedi fino al Novecento, quando viene demolito per fare spazio alla strada."]]},
  balbo:{cosa:"Il teatro di Balbo, del 13 a.C., con il grande cortile porticato dietro la scena, la crypta, chiuso a est da un'esedra. Gli scavi cominciati nel 1981 ne hanno seguito la vita, strato per strato, fino al Medioevo: è il luogo dove si vede meglio come la città antica diventa un'altra. Misure del portico e forma dell'esedra qui sono indicative.", date:[["prima metà del V sec.","Teatro e portico smettono di funzionare: fogne e pavimenti si riempiono di detriti, nell'esedra lavora un forno, forse da vetro. Qui l'abbandono è messo verso il 430."],["fine V-VI sec.","Nell'esedra, in piena città, si scavano alcune povere tombe."],["fine VII sec.","L'esedra diventa lo scarico di un'officina di oggetti di lusso, forse del vicino monastero di San Lorenzo in Pallacinis: centomila cocci, e l'ottanta per cento dei materiali viene ancora da fuori, soprattutto dall'Africa e dall'Oriente."],["prima metà dell'VIII sec.","Anfore e ceramiche d'oltremare spariscono dagli strati; le sostituiscono prodotti dell'Italia meridionale. È qui che si misura la fine dei commerci mediterranei di Roma."],[750,"Nell'VIII secolo (fra VIII e IX secondo altri) una calcara brucia nell'esedra i marmi del complesso."],["IX sec.","Al centro del vecchio portico sorge la chiesa di Santa Maria Domine Rose; sulle rovine del teatro, più tardi, il «castello d'oro», attestato nel 1192."]]},
  emporio:{cosa:"Il porto fluviale di Roma sotto l'Aventino: le banchine dell'Emporio, il grande edificio a cinquanta navate detto Porticus Aemilia (487 metri per 60) e, dietro, i magazzini di Galba. Che l'edificio sia la Porticus Aemilia è discusso: per alcuni erano le darsene della flotta. Posizione dei magazzini ed estensione delle banchine qui sono indicative.", date:[["193-174 a.C.","Si costruiscono il porto e il portico (Livio)."],["fine I-inizio II sec.","Parte delle navate viene divisa in magazzini: in una si è trovato farro carbonizzato."],[271,"Le mura di Aureliano corrono lungo la riva, sopra le banchine; i magazzini scavati restano in uso almeno fino al V secolo."],["V-VI sec.","Gli ambienti scavati si svuotano, probabilmente all'inizio del V secolo, e fra i muri si seppelliscono morti dentro anfore africane. Qui l'abbandono è messo verso il 430: una nostra scelta dentro quell'intervallo."],["prima metà del VII sec.","Nella navata scavata crollano le volte; fra le macerie qualcuno alza un recinto di pietre a secco, forse per gli animali."],["Medioevo","La riva prende il nome di Marmorata, dai marmi che vi si scaricavano."]]},
  antoniniano:{cosa:"Il ramo d'acquedotto che Caracalla costruì per le sue terme. Correva in gran parte interrato lungo la via Latina, saliva su arcate presso le mura e scavalcava la via Appia sull'arco detto di Druso (il nome è un'invenzione del Cinquecento). Qui si vedono solo le arcate; il loro profilo, salvo la quota sull'arco, è ricostruito.", date:[[212,"Fra il 212 e il 213 Caracalla restaura la Marcia, vi aggiunge una sorgente nuova (iscrizione di porta Tiburtina) e porta l'acqua alle terme. Che quest'acqua venisse dalla Marcia è discusso: le incrostazioni nel canale sopra l'arco indicano quella della Tepula e della Giulia."],[537,"I Goti tagliano tutti gli acquedotti e le terme di Caracalla non riapriranno. Se e quando questo ramo abbia ripreso a portare acqua non si sa: qui si assume di sì, come per la Marcia."],["VIII-IX sec.","L'Itinerario di Einsiedeln nomina alla porta Appia la «forma Iobia», che «viene dalla Marcia e corre fino alla riva»."],[776,"Verso il 776 Adriano I rifà «dalle fondamenta» la forma Iobia, rotta da vent'anni (Liber Pontificalis). Che sia questo ramo è l'ipotesi più diffusa (Lanciani, Duchesne); per Ashby è la Marcia in generale, perché ai papi le terme non servivano più. Qui si segue la prima."],["844-867","Altri due restauri di una forma «Iovia» o «Iocia», sotto Sergio II e Niccolò I: l'acqua, dice il Liber Pontificalis, basta «quasi a tutta la città»."]]},
  testaccio:{cosa:"Collina artificiale fatta di cocci: le anfore dell'olio sbarcate al porto sul Tevere e rotte qui, disposte a terrazze. Alta 35 metri, con quasi un chilometro di giro e i resti stimati di 53 milioni di anfore; in antico era probabilmente più alta.", date:[["I sec. a.C.?","Non si sa quando comincia lo scarico: gli strati più bassi non sono stati scavati. Quelli datati vanno dal 140 al 250 circa."],["fine II sec.","Il momento di massimo: fino a 130.000 anfore l'anno, quasi tutte dalla Betica, nel sud della Spagna, per l'olio distribuito dallo Stato."],["dopo il 260","Lo scarico si ferma. L'olio viaggia ormai in contenitori diversi, e forse cambiano gli approdi: la ragione non è certa."],["poi","La zona attorno resta dentro le mura ma si svuota. Che sul monte crescesse l'erba già in questi secoli è una nostra supposizione; nel Medioevo vi si terranno i giochi del carnevale."]]},
  cosma:{cosa:"Chiesa ricavata in un'aula del tempio della Pace.", date:[[527,"Voluta da papa Felice IV (526-530) in edifici del tempio della Pace concessi, secondo la tradizione, dalla regina Amalasunta: è il primo luogo di culto cristiano nell'area del Foro."]]}
};
/* «Che cosa sappiamo davvero»: per ogni cosa disegnata, quanto è sicuro che fosse lì e avesse quella forma generale. [classe, nota].
   A: posizione e forma certe (sta ancora in piedi in buona parte, o la pianta è rilevata per intero); B: posizione certa, forma ricostruita (resti parziali, scavi,
   pianta marmorea severiana, edificio poi rifatto, disegni antichi); C: ipotesi (posizione, estensione o forma supposte o discusse). I modelli sono schematici: la classe non riguarda il dettaglio.
   Classi assegnate il 21 novembre 2026 con una ricerca dedicata. Per i casi dubbi sono state lette le fonti (Platner-Ashby per ponti, terme di Costantino e magazzini di Galba;
   una tesi di York sulle scholae); per gli edifici in piedi il giudizio è quello corrente e non cita una fonte. Dove una voce mescola parti diverse vale la prevalente, e la nota lo dice.
   I ponti hanno la classe uno per uno in js/mura.js. */
var CERTEZZA={
  colosseo:['A',"In piedi per due terzi, con la pianta completa."],
  arcotito:['A',"In piedi; i fianchi sono un restauro dell'Ottocento."],
  colosso:['B',"Il basamento è stato visto e rilevato (oggi è segnato sul selciato); l'aspetto della statua viene dalle monete e dai testi, e qui è indicativo."],
  metasudans:['B',"Il rudere è rimasto in piedi fino al 1936 e le fondazioni sono state scavate; la forma viene dalle monete e dalle fotografie, la posizione qui vale entro una quindicina di metri."],
  circo:['B',"La valle ne conserva la forma e la curva orientale è stata scavata; gradinate e spina sono ricostruite."],
  fori:['B',"Misto. Sono in piedi la Curia, l'arco di Settimio Severo, la colonna e i mercati di Traiano, il tempio di Antonino e Faustina; piazze, basiliche e gli altri templi sono noti da scavi e dalla pianta marmorea severiana. Il tempio del Divo Traiano è un'ipotesi: non si sa nemmeno da che parte della colonna stesse."],
  emilia:['B',"Restano fondazioni e pavimento; l'alzato è ricostruito."],
  giove:['C',"Il sito è certo (fondazioni sotto i Musei Capitolini), ma misure e pianta sono discusse (le stime vanno da 50 a 74 metri di lato; qui ha la misura più citata, circa 54 per 62), e del tempio di età imperiale si sa pochissimo."],
  palatino:['B',"Le piante della Domus Flavia e Augustana e dello stadio sono rilevate dagli scavi; gli alzati, il tempio di Apollo e il Settizodio (demolito nel 1588) sono ricostruiti."],
  pantheon:['A',"Intero."],
  domiziano:['A',"Piazza Navona ne conserva esattamente la pianta; resti delle arcate sotto il lato nord."],
  traiano:['B',"In piedi alcune esedre e la cisterna delle Sette Sale; il corpo centrale è noto soprattutto dai disegni del Cinquecento."],
  caracalla:['A',"In piedi, con la pianta completa."],
  diocleziano:['A',"In buona parte in piedi (Santa Maria degli Angeli, l'aula ottagona, l'esedra della piazza)."],
  massenzio:['A',"In piedi la navata nord; la pianta è nota per intero."],
  venere:['A',"In piedi il podio e le due celle; i colonnati sono ricostruiti."],
  adriano:['A',"Tamburo e basamento sono dentro Castel Sant'Angelo; il coronamento è ricostruito."],
  augusto:['B',"Restano gli anelli inferiori; la forma della parte alta è discussa."],
  pompeo:['B',"La curva della cavea sopravvive nelle strade e nelle cantine, il portico è nella pianta marmorea; gli alzati sono ricostruiti."],
  marcello:['A',"In piedi."],
  laterano:['B',"La pianta costantiniana è nota dagli scavi sotto la chiesa attuale; l'alzato è ricostruito."],
  pietro:['B',"Demolita fra il 1506 e il 1606, ma rilevata prima (pianta di Alfarano, disegni del Cinquecento) e ritrovata negli scavi sotto la basilica."],
  sole:['C',"Nessun resto sicuro: lo si colloca in questa zona per deduzione dalle fonti. Posizione e forma sono ipotesi."],
  arcocostantino:['A',"Intero."],
  termecostantino:['B',"Distrutte fra Seicento e Ottocento; la pianta è nota dai disegni di Palladio e di altri."],
  croce:['B',"L'aula antica è in piedi dentro la chiesa attuale; era un'aula unica, mentre il modello qui è una basilica generica, più grande del vero."],
  lorenzo:['C',"La basilica costantiniana, scavata nel 1950, aveva la forma di un circo e stava accanto, non qui; quella che si vede è sul sito della chiesa di Pelagio II (580), che sopravvive nella chiesa attuale."],
  agnese:['B',"Il mausoleo di Costantina è in piedi (Santa Costanza); della grande basilica a forma di circo restano i muri perimetrali."],
  paolo:['A',"Bruciata nel 1823 e ricostruita sulla stessa pianta, con le stesse misure."],
  sabina:['A',"La basilica del V secolo è conservata."],
  mariamaggiore:['A',"Le navate del V secolo sono conservate."],
  stefano:['A',"Il nucleo è in piedi; l'anello esterno, demolito nel Quattrocento, è noto dagli scavi ed era più articolato di come appare qui."],
  cosma:['A',"L'aula e la rotonda sono in piedi."],
  foca:['A',"In piedi."],
  monasteripietro:['C',"Le due rotonde sono note dai disegni e Santo Stefano Maggiore esiste ancora; degli altri monasteri si conosce il sito approssimativo, non la forma."],
  porticopietro:['C',"Nessun resto in piedi; tracciato e data sono discussi."],
  scholae:['C',"Sassoni e Frisoni hanno un sito certo (Santo Spirito in Sassia, Santi Michele e Magno), ma la forma è ignota; i siti di Franchi e Longobardi sono discussi."],
  mulini:['C',"Li descrive Procopio; numero, posizione precisa e aspetto sono ipotesi."],
  casenerva:['B',"Scavate fra il 1995 e il 2000: il piano terra della maggiore è visibile, il resto è ricostruito."],
  balbo:['B',"Teatro dalla pianta marmorea e dalle cantine dei palazzi; portico ed esedra dagli scavi, e l'esedra si visita nel museo."],
  emporio:['B',"Muri in piedi e pianta marmorea per il grande edificio (la cui identificazione è discussa); magazzini e banchine da scavi parziali."],
  testaccio:['A',"Esiste: il contorno è quello di oggi."],
  leonine:['B',"Misto: in piedi alcuni tratti e una torre nei giardini vaticani; il lato nord è ricalcato dal Passetto, più tardo; il lato sud è interpolato."],
  mura:['A',"In piedi per quasi tutto il circuito."],
  acquedotti:['B',"Misto: la Claudia e gli archi neroniani sono in buona parte in piedi; Marcia, Vergine e Traiana sono note per tratti, e il resto del percorso e tutte le quote sono ricostruiti."],
  antoniniano:['B',"Certi due punti: l'arco detto di Druso, in piedi, e i resti di piazza Galeria. Il tracciato fra l'uno e l'altro e fino alle terme è ricostruito."],
  chiese:['B',"Il sito è quello della chiesa attuale; la forma antica è quasi sempre perduta, e qui tutte hanno lo stesso modello."]
};
var MURA_ALTE=[[0,0],[270,0],[276,1],[400,1],[404,1.5]];   // rialzate nel 401-403 (o già sotto Massenzio: discusso)

function interp(punti,x){
  if(x<=punti[0][0]) return punti[0][1];
  for(var i=1;i<punti.length;i++) if(x<=punti[i][0]){ var a=punti[i-1], b=punti[i]; return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]); }
  return punti[punti.length-1][1];
}
/* stato cumulato delle regioni a ogni tappa */
var st={}; OVEST.concat(EST).forEach(function(k){ st[k]='roma'; });
TAPPE.forEach(function(t){ var c=!t.intermezzo&&CAMBI[t.anno]; if(c) for(var k in c) st[k]=c[k]; t.regioni=JSON.parse(JSON.stringify(st)); });
/* l'atto avanza dopo ogni intermezzo: l'intermezzo chiude l'atto che lo precede */
var atto=0; TAPPE.forEach(function(t){ if(t.apre) atto++; t.atto=atto; if(t.intermezzo) atto++; });   // "apre": la tappa inizia un atto nuovo

return {ATTI:ATTI,TAPPE:TAPPE,CAMBI:CAMBI,CURVE:CURVE,ABITATI:ABITATI,MONUMENTI:MONUMENTI,MURA_ALTE:MURA_ALTE,EVENTI:EVENTI,SCHEDE:SCHEDE,CERTEZZA:CERTEZZA,CHIESE:CHIESE,ITINERARIO:ITINERARIO,interp:interp};
})();
