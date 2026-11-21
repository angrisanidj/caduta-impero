/* Dati dello scheletro. TUTTO DA VERIFICARE prima della pubblicazione:
   - i testi sono bozze di due righe, senza fonti;
   - lo stato delle regioni è una semplificazione (una regione = un colore);
   - le curve sono punti orientativi, non serie pubblicate. */
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

/* Stati di una regione: roma | usurpatore | conteso | federati | regno | perso | oriente | califfato | carolingio
   "cambia" elenca solo ciò che muta rispetto alla tappa precedente. */
var TAPPE=[
 {anno:235, titolo:"L'imperatore ucciso dai suoi soldati", testo:"A Magonza le legioni assassinano Severo Alessandro e acclamano Massimino. In cinquant'anni si conteranno oltre venti imperatori, quasi tutti morti di spada.",
  cambia:{britannia:'roma',gallia:'roma',aquitania:'roma',provenza:'roma',hispania:'roma',italia:'roma',isole:'roma',rezia:'roma',illirico:'roma',africa:'roma',mauretania:'roma',oriente:'roma'}},
 {anno:251, titolo:'La peste e un imperatore caduto in battaglia', testo:"Un'epidemia attraversa l'impero per più di dieci anni. Ad Abritto Decio muore combattendo i Goti: è il primo imperatore ucciso da un nemico esterno.",
  storici:"Quanto pesò la peste di Cipriano? Per Kyle Harper è una delle cause della crisi; altri la considerano impossibile da misurare con le fonti che abbiamo."},
 {anno:260, titolo:'Valeriano prigioniero, tre imperi', testo:"L'imperatore Valeriano è catturato dai Persiani. L'Occidente si stacca sotto Postumo: Gallie, Britannia e Hispania hanno un loro imperatore, un loro senato, una loro moneta.",
  cambia:{britannia:'usurpatore',gallia:'usurpatore',aquitania:'usurpatore',provenza:'usurpatore',hispania:'usurpatore'}},
 {anno:271, titolo:'Roma torna a costruire mura', testo:"Aureliano cinge la città con diciannove chilometri di mura: non accadeva da secoli. In Oriente Zenobia di Palmira controlla dall'Egitto all'Anatolia.",
  cambia:{hispania:'roma',oriente:'usurpatore'}},
 {anno:274, titolo:"L'impero ricucito", testo:"In tre anni Aureliano riprende Palmira e le Gallie. L'impero è di nuovo uno, ma la moneta d'argento non contiene quasi più argento.",
  cambia:{britannia:'roma',gallia:'roma',aquitania:'roma',provenza:'roma',oriente:'roma'}},
 {intermezzo:true, anno:284, titolo:'La moneta', testo:"Intermezzo: dal denario all'antoniniano, la svalutazione del III secolo e il ritorno all'oro con il solido."},

 {anno:293, titolo:'Quattro imperatori, nessuno a Roma', testo:"Diocleziano divide il comando fra due augusti e due cesari. Le capitali sono dove serve l'esercito: Treviri, Milano, Sirmio, Nicomedia."},
 {anno:301, titolo:'I prezzi fissati per legge', testo:"Un editto stabilisce il prezzo massimo di oltre mille merci e servizi, pena la morte. Non funziona, ma racconta uno Stato che vuole contare e tassare tutto."},
 {anno:330, titolo:'Una nuova Roma sul Bosforo', testo:"Costantino inaugura Costantinopoli. La sua moneta d'oro, il solido, resterà stabile per sette secoli; a Roma sorgono le prime grandi basiliche cristiane."},
 {anno:357, titolo:"L'imperatore in visita", testo:"Costanzo II entra a Roma per la prima volta e la guarda come un forestiero, stupito dal Foro di Traiano. La città è un monumento, non più una sede di governo."},
 {anno:378, titolo:'Adrianopoli', testo:"I Goti, accolti dentro l'impero due anni prima e ridotti alla fame, annientano l'esercito d'Oriente. Muore l'imperatore Valente.",
  storici:"Invasione o crisi di accoglienza? I Goti del 376 chiesero di entrare e furono ammessi: per Halsall il disastro nasce dalla gestione romana, per Heather dalla pressione degli Unni."},
 {anno:395, titolo:'Due corti', testo:"Alla morte di Teodosio l'impero passa ai due figli, uno a Costantinopoli e uno a Milano. Nessuno la considera una divisione definitiva; lo diventerà.",
  cambia:{oriente:'oriente'}},
 {intermezzo:true, anno:395, titolo:'I commerci', testo:"Intermezzo: relitti, anfore, piombo nei ghiacci. Che cosa misura davvero l'archeologia quando parla di crollo degli scambi."},

 {anno:402, titolo:'La corte si chiude a Ravenna', testo:"Stilicone ferma Alarico a Pollenzo. La corte lascia Milano per Ravenna, protetta dalle paludi; a Roma le mura vengono raddoppiate in altezza."},
 {anno:406, titolo:'Il Reno attraversato', testo:"Nell'ultima notte dell'anno Vandali, Alani e Svevi passano il Reno. In Britannia l'esercito proclama un proprio imperatore, che porta le truppe in Gallia.",
  cambia:{gallia:'conteso'}},
 {anno:409, titolo:'La Britannia lasciata a sé stessa', testo:"Senza più truppe né funzionari, le città britanniche provvedono da sole alla difesa. I gruppi entrati in Gallia passano i Pirenei.",
  cambia:{britannia:'perso',hispania:'conteso'}},
 {anno:410, titolo:'Il sacco di Roma', testo:"Dopo tre assedi e trattative fallite, i Goti di Alarico entrano in città e la saccheggiano per tre giorni. Alarico era stato generale romano.",
  storici:"Alarico è il caso di scuola: capo di un popolo o comandante di un esercito romano senza paga? Le due letture, invasione e guerra civile, partono dagli stessi fatti."},
 {anno:418, titolo:'Un regno dentro l\'impero', testo:"I Visigoti ricevono terre in Aquitania, per accordo, in cambio del servizio militare. È il primo insediamento stabile riconosciuto da Roma.",
  cambia:{aquitania:'federati',gallia:'roma'}},
 {anno:429, titolo:'I Vandali passano in Africa', testo:"Genserico attraversa lo stretto con il suo popolo, forse ottantamila persone in tutto. Nel 430, durante l'assedio di Ippona, muore Agostino.",
  cambia:{mauretania:'conteso'}},
 {anno:439, titolo:'Cartagine', testo:"I Vandali prendono Cartagine senza combattere. Roma perde la provincia più ricca, il grano dell'annona e la flotta: è il colpo da cui l'Occidente non si riprende.",
  cambia:{africa:'regno',illirico:'conteso'}},
 {intermezzo:true, anno:439, titolo:'I barbari', testo:"Intermezzo: quanti erano, chi erano, che rapporto giuridico avevano con Roma. Nemici, federati, soldati regolari, re."},

 {anno:451, titolo:'Ezio e Attila', testo:"Ai Campi Catalaunici l'esercito che ferma gli Unni è fatto in gran parte di Visigoti, Franchi e Burgundi. Il generale romano Ezio comanda una coalizione."},
 {anno:455, titolo:'Il secondo sacco', testo:"Ucciso Valentiniano III, Genserico sbarca a Ostia e spoglia Roma per quattordici giorni. Porta via anche metà delle tegole dorate del tempio di Giove.",
  cambia:{isole:'regno',mauretania:'perso'}},
 {anno:458, titolo:'Una legge contro chi smonta la città', testo:"Maggioriano vieta di demolire gli edifici pubblici per ricavarne materiali. È l'ultimo imperatore a tentare riforme e riconquiste; sarà deposto e ucciso nel 461.",
  cambia:{hispania:'conteso'}},
 {anno:468, titolo:"L'ultima flotta", testo:"Le due corti armano insieme una spedizione enorme contro i Vandali. Va perduta davanti a Capo Bon, e con essa le ultime riserve finanziarie dell'Occidente."},
 {anno:472, titolo:'Roma assediata dal proprio generale', testo:"Ricimero, che da quindici anni fa e disfa imperatori, assedia e prende la città. Gli imperatori ormai governano poco più dell'Italia.",
  cambia:{hispania:'regno',gallia:'conteso',aquitania:'regno'}},
 {anno:476, titolo:'Odoacre', testo:"Un ufficiale dell'esercito d'Italia depone il giovane Romolo Augustolo e rimanda le insegne imperiali a Costantinopoli. A Roma il Senato continua a riunirsi.",
  cambia:{italia:'regno',provenza:'regno',gallia:'perso',rezia:'perso'},
  storici:"Il 476 fu una data per i contemporanei? Quasi nessuno la notò. Diventa «la fine» nelle cronache orientali del secolo successivo."},
 {intermezzo:true, anno:476, titolo:'La città', testo:"Intermezzo: come si svuota una metropoli. Annona, acquedotti, spoliazioni, sepolture dentro le mura."},

 {anno:493, titolo:'Teodorico', testo:"Il re degli Ostrogoti governa l'Italia da Ravenna con funzionari romani. Restaura mura, acquedotti e il teatro di Pompeo; al Colosseo si danno ancora spettacoli.",
  cambia:{gallia:'regno',rezia:'regno',illirico:'regno'}},
 {anno:537, titolo:'Gli acquedotti tagliati', testo:"Giustiniano manda Belisario a riprendere l'Italia. Durante l'assedio di Roma i Goti tagliano gli acquedotti: le grandi terme si fermano e non riapriranno, anche se alcuni condotti verranno riparati.",
  cambia:{africa:'oriente',isole:'oriente',italia:'conteso',illirico:'oriente'}},
 {anno:542, titolo:'La peste', testo:"La peste bubbonica arriva dall'Egitto e ritorna a ondate per due secoli. Colpisce un'Italia già al quarto anno di guerra."},
 {anno:546, titolo:'La città vuota', testo:"Totila prende Roma e porta via gli abitanti: secondo una cronaca la città resta deserta per quaranta giorni. Nel 550, ripresa Roma, organizza le ultime corse di cavalli di cui si ha notizia.",
  storici:"Va preso alla lettera? Procopio scrive che Totila lasciò la città «del tutto deserta»; i quaranta giorni vengono da un'altra cronaca. Una metropoli senza nessuno è poco credibile, ma l'immagine dice quanto fosse sceso il numero degli abitanti."},
 {anno:568, titolo:'I Longobardi', testo:"Quattordici anni dopo la fine della guerra gotica, i Longobardi scendono in un'Italia spopolata. L'unità della penisola finisce qui, per tredici secoli.",
  cambia:{italia:'conteso'}},
 {anno:589, titolo:'Il Tevere in città', testo:"Nel novembre 589 il Tevere rompe gli argini, allaga i quartieri bassi e rovina i granai della Chiesa. Pochi mesi dopo torna la peste: ne muore papa Pelagio II, e al suo posto viene eletto Gregorio. Le piene torneranno: nel 716 o 717 l'acqua tiene la città per sette giorni, e in via Lata arriva a un'altezza d'uomo e mezza; poi nel dicembre 791."},
 {anno:593, titolo:"Dov'è il Senato, dov'è il popolo", testo:"Con i Longobardi di Agilulfo sotto le mura, papa Gregorio Magno predica: «Dov'è il Senato? Dov'è ormai il popolo?» (Omelie su Ezechiele, II, 6). È il vescovo, adesso, a distribuire il grano e a trattare con gli assedianti."},

 /* ---- atto VI: da Gregorio Magno a Carlo Magno ---- */
 {anno:609, apre:true, titolo:'Il Pantheon diventa una chiesa', testo:"Il 1° agosto 608 l'ultima colonna onoraria del Foro viene dedicata all'imperatore Foca; il 13 maggio 609 il Pantheon, donato da Foca a papa Bonifacio IV, è consacrato come chiesa. Dei templi antichi si salvano quelli che diventano chiese."},
 {anno:663, titolo:"L'ultimo imperatore a Roma", testo:"Costante II arriva il 5 luglio, resta dodici giorni e riparte con il bronzo dei monumenti, tegole del Pantheon comprese, diretto a Costantinopoli. Roma è una città di provincia dell'impero d'Oriente, governata di fatto dal papa."},
 {anno:711, titolo:'Il Mediterraneo si divide', testo:"Cartagine cade nel 698, la Spagna dei Visigoti nel 711. La sponda sud del mare che era stato di Roma passa al califfato; l'Occidente guarda ormai a nord.",
  cambia:{africa:'califfato',mauretania:'califfato',hispania:'califfato'},
  storici:"Henri Pirenne vide qui la vera fine del mondo antico: non le invasioni germaniche, ma la rottura dell'unità del Mediterraneo. L'archeologia mostra però che i commerci erano crollati già prima."},
 {anno:727, titolo:"San Pietro, meta dell'Occidente", testo:"Re e pellegrini anglosassoni, franchi, longobardi vengono a pregare sulla tomba dell'apostolo. Attorno alla basilica, fuori le mura, crescono monasteri, ospizi e le «scholae» delle nazioni: un quartiere nuovo, mentre la città antica si svuota."},
 {anno:756, titolo:'I Longobardi alle porte', testo:"Astolfo assedia Roma per tre mesi. Il papa non chiede aiuto a Costantinopoli ma ai Franchi: Pipino scende in Italia e consegna al papa le terre riprese ai Longobardi. Nasce uno Stato della Chiesa."},
 {anno:780, titolo:'Adriano I ripara la città', testo:"Carlo Magno ha conquistato il regno longobardo nel 774. A Roma papa Adriano I fa riparare quattro acquedotti, le mura e i tetti delle basiliche, e amplia le domuscultae, le tenute agricole della Chiesa che sfamano la città.",
  cambia:{italia:'regno'}},
 {anno:791, titolo:'Il Tevere porta via una porta', testo:"Nel dicembre 791 il Tevere divelle dalle fondamenta porta Flaminia e la trascina lungo la via Lata, dove l'acqua supera le due altezze d'uomo; presso il ponte che oggi è ponte Sisto abbatte un tratto di mura. Per tre giorni il fiume corre per la città come nel proprio letto. Papa Adriano fa portare il cibo in barca a chi è chiuso in casa (Liber Pontificalis)."},
 {anno:800, titolo:'Natale in San Pietro', testo:"Il 25 dicembre papa Leone III incorona Carlo Magno imperatore. In Occidente c'è di nuovo un impero, ma il suo centro è oltre le Alpi. Roma, poche decine di migliaia di abitanti fra le rovine, è la città dei papi e dei pellegrini.",
  cambia:{gallia:'carolingio',aquitania:'carolingio',provenza:'carolingio',rezia:'carolingio',italia:'carolingio'}},
 {anno:801, titolo:'La terra trema', testo:"Quattro mesi dopo l'incoronazione, la sera del 29 aprile 801 (il 30 nelle cronache), un terremoto fa crollare gran parte del tetto di San Paolo fuori le mura. È l'unico danno a Roma che le fonti ricordano. Papa Leone III lo fa ricostruire: le basiliche degli apostoli sono ormai gli edifici meglio curati della città."},
 {anno:846, titolo:'I Saraceni a San Pietro', testo:"Una flotta arrivata dall'Africa risale il Tevere. Le mura di Aureliano reggono, ma le due basiliche più venerate dell'Occidente sono fuori dalla cinta: San Pietro e San Paolo vengono saccheggiate."},
 {anno:852, epilogo:true, titolo:"Le mura dall'altra parte del fiume", testo:"Dopo il sacco saraceno e dopo l'incendio che nell'847 distrugge il Borgo, papa Leone IV chiude San Pietro dentro una cinta nuova: il 27 giugno 852 nasce la «città leonina». Le mura di Aureliano chiudono ancora diciannove chilometri di rovine, orti e vigne; quelle nuove proteggono una tomba. L'impero è finito da tempo, e Roma ha trovato un altro centro. Le rovine che vediamo oggi, però, sono in gran parte opera dei secoli seguenti, e più dei cantieri che dei terremoti: il lato sud del Colosseo fu usato come cava fin dal VI secolo, e quel che ne restava cadde in un terremoto: nell'847 secondo chi lo ha scavato, nel 1349 secondo la tradizione."}
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
  argento:{nome:'Argento nella moneta', nota:'% di fino, fino alla riforma di Diocleziano', punti:[[235,45],[250,40],[260,18],[268,3],[274,5],[294,5]], fine:294, dopo:'dal 309 solido d\'oro, stabile'},
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
  croce:[[0,'assente'],[325,'uso']], lorenzo:[[0,'assente'],[335,'uso']], agnese:[[0,'assente'],[350,'uso']], paolo:[[0,'assente'],[390,'uso'],[801,'crollato'],[806,'uso']],
  sabina:[[0,'assente'],[432,'uso']], mariamaggiore:[[0,'assente'],[434,'uso']], stefano:[[0,'assente'],[475,'uso']], cosma:[[0,'assente'],[527,'uso']],
  foca:[[0,'assente'],[608,'uso']],
  /* il quartiere che cresce attorno a San Pietro */
  monasteripietro:[[0,'assente'],[450,'uso']], porticopietro:[[0,'assente'],[400,'uso']], scholae:[[0,'assente'],[727,'uso']], leonine:[[0,'assente'],[852,'uso']],
  /* riuso */
  mulini:[[0,'assente'],[537,'uso']], casenerva:[[0,'assente'],[850,'uso']]
};

/* Chiese minori attorno a cui si raccoglie l'abitato: [nome, latitudine, longitudine, anno in cui compare, tipo].
   Date controllate (titoli attestati al sinodo del 499, diaconie nell'elenco dell'807 del Liber Pontificalis, voci delle singole chiese);
   quando la fonte dà solo un secolo o una prima attestazione, l'anno è una scelta nostra dentro quell'intervallo.
   Coordinate dell'edificio attuale; quattro sono spostate di poche decine di metri per non cadere su una strada o su un monumento del modello. */
var CHIESE=[
 ['San Marco',41.8960,12.4816,336,'titolo'],['Santa Maria in Trastevere',41.8894,12.4697,340,'titolo'],['San Lorenzo in Lucina',41.9034,12.4787,370,'titolo'],
 ['Santi Nereo e Achilleo',41.8806,12.4952,377,'titolo'],["Sant'Anastasia",41.8882,12.4841,380,'titolo'],['San Lorenzo in Damaso',41.8969,12.4717,380,'titolo'],
 ['Santa Susanna',41.9042,12.4937,380,'titolo'],['San Crisogono',41.8895,12.4735,380,'titolo'],['San Clemente',41.8893,12.4976,390,'titolo'],
 ['Santa Pudenziana',41.8985,12.4955,390,'titolo'],['Santi Giovanni e Paolo',41.8865,12.4926,398,'titolo'],['Santa Balbina',41.8805,12.4897,400,'titolo'],
 ['San Vitale',41.8997,12.4907,402,'titolo'],['San Pietro in Vincoli',41.8939,12.4931,439,'titolo'],['Santa Cecilia',41.8876,12.4759,450,'titolo'],
 ['Santi Quattro Coronati',41.8883,12.4983,450,'titolo'],["Sant'Agata dei Goti",41.8965,12.4888,465,'chiesa'],['Santa Bibiana',41.8955,12.5092,468,'basilica'],
 ['Santa Prassede',41.8961,12.4986,490,'titolo'],['San Martino ai Monti',41.8945,12.4986,500,'titolo'],['Santa Maria in Cosmedin',41.8881,12.4816,550,'diaconia'],
 ['Santa Maria Antiqua',41.8913,12.4857,560,'chiesa'],['Santi Apostoli',41.8981,12.4831,570,'basilica'],['San Gregorio al Celio',41.8855,12.4906,575,'monastero'],
 ['San Teodoro',41.8904,12.4848,580,'diaconia'],['Santa Lucia in Selci',41.8947,12.4964,630,'diaconia'],['San Saba',41.8786,12.4855,650,'monastero'],
 ['Santa Maria in via Lata',41.8982,12.4808,700,'diaconia'],['Santa Maria in Domnica',41.8847,12.4956,700,'diaconia'],["Sant'Eustachio",41.8988,12.4758,720,'diaconia'],
 ['Santa Maria in Aquiro',41.8999,12.4782,730,'diaconia'],['San Giorgio al Velabro',41.8896,12.4832,745,'diaconia'],['Santa Maria in Campo Marzio',41.9014,12.4765,750,'monastero'],
 ["Sant'Angelo in Pescheria",41.8925,12.4787,755,'diaconia'],['San Silvestro in Capite',41.9031,12.4806,761,'monastero'],["Sant'Apollinare",41.9009,12.4736,780,'monastero'],
 ['San Vito',41.8958,12.5017,780,'diaconia'],['San Bonifacio',41.8838,12.4786,780,'diaconia'],['Santa Maria Nova',41.8912,12.4889,850,'chiesa']
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
   TUTTO DA VERIFICARE sulle fonti (Procopio, Orosio, Prospero, Liber Pontificalis). */
var EVENTI=[
 {id:'sacco410', da:410, a:410.4, bruciati:14, fuochi:[[100,-192,1.2],[78,-165,1],[7.2,-1,.9]],      // Procopio, Guerre III 2: case presso la porta e casa di Sallustio. Aventino e Celio: nessun incendio attribuibile con sicurezza
  testo:"24 agosto 410 · I Goti di Alarico entrano da Porta Salaria. Tre giorni di saccheggio: bruciano le case presso la porta e la casa di Sallustio; nel Foro brucia, probabilmente allora, la basilica Emilia. San Pietro e San Paolo sono rispettate come luoghi d'asilo."},
 {id:'sacco455', da:455, a:455.4, bruciati:0, fuochi:[],
  testo:"2-16 giugno 455 · I Vandali di Genserico restano quattordici giorni. Papa Leone ottiene che non ci siano stragi né incendi; il saccheggio è metodico: dal tempio di Giove portano via metà del tetto di bronzo dorato."},
 {id:'assedio472', da:472, a:472.4, bruciati:0, fuochi:[],      // le fonti parlano di combattimenti e saccheggio, non di incendi
  testo:"Luglio 472 · Dopo cinque mesi d'assedio Ricimero prende la città all'imperatore Antemio, asserragliato sul Palatino. Lo scontro decisivo è al ponte Elio, davanti al mausoleo di Adriano."},
 {id:'velo536', da:536.2, a:537.3, bruciati:0, fuochi:[], velo:true,      // Procopio, Guerre IV 14; Cassiodoro, Variae XII 25. La didascalia è quella dell'assedio, che viene dopo nell'elenco
  testo:"536 · Per più di un anno il sole resta velato e non scalda."},
 {id:'assedio537', da:537, a:538.2, bruciati:0, fuochi:[], campi:true,
  testo:"Marzo 537 - marzo 538 · Vitige assedia Belisario per un anno e nove giorni. Sette accampamenti goti: sei davanti alle porte da nord a est, uno oltre il Tevere. Gli acquedotti vengono tagliati. Da un anno il sole è velato: Procopio scrive che dava luce senza splendore, come la luna; Cassiodoro, in Italia, che a mezzogiorno i corpi non facevano ombra. Oggi lo si attribuisce a grandi eruzioni vulcaniche."},
 {id:'totila546', da:546, a:546.5, bruciati:10, fuochi:[[-125,40,1],[-112,62,.8]], brecce:true,      // Procopio VIII 22: incendi soprattutto oltre il Tevere
  testo:"17 dicembre 546 · Totila entra di notte da Porta Asinaria. Fa abbattere tratti delle mura, brucia parte di Trastevere e porta via gli abitanti: per settimane Roma resta vuota."},
 {id:'piena589', da:589, a:589.5, bruciati:0, fuochi:[], piena:true,      // Gregorio di Tours, Storie X 1
  testo:"Novembre 589 · Il Tevere allaga la città bassa e rovina i granai della Chiesa (Gregorio di Tours). L'estensione dell'acqua qui disegnata è indicativa: le zone più basse e più vicine al fiume."},
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
  testo:"Agosto 846 · Una flotta saracena risale il Tevere. San Pietro e San Paolo, fuori dalle mura, vengono saccheggiate; i pellegrini delle scholae provano a difenderle."},
 {id:'incendio847', da:847, a:847.5, bruciati:9, ricostruzione:3, fuochi:[[-224,-100,.9]],
  testo:"847 · Un incendio distrugge parte del Borgo, il quartiere dei pellegrini; papa Leone IV lo fa ricostruire. Nello stesso anno una scossa di terremoto: le cronache non nominano danni, ma secondo gli archeologi del Colosseo fa cadere ciò che restava del suo fronte sud."}
];

/* Schede dei monumenti: che cos'è, e le date che contano. Testi provvisori, scritti a memoria: DA VERIFICARE. */
var SCHEDE={
  colosseo:{cosa:"Anfiteatro Flavio: cinquantamila posti o più.", date:[[80,"Inaugurato da Tito."],[217,"Un fulmine lo incendia; i restauri durano più di vent'anni."],["inizio V sec.","Vietati i combattimenti fra gladiatori (ultime menzioni verso il 435); restano le cacce."],["484 o 508","Restaurato dopo un terremoto a spese del senatore Decio Mario Venanzio Basilio."],[443,"Un terremoto lo danneggia; seguono restauri."],["c. 500","Mentre si danno ancora spettacoli, sul lato sud si apre un cantiere di smontaggio: un blocco porta il nome del senatore Geronzio (lettura discussa)."],[523,"Ultime cacce con animali di cui si ha notizia, sotto Teodorico."],["fine VI sec.","Cunicoli scavati per estrarre travertino e metallo; una vasca per spegnere la calce al primo ordine. Dalla seconda metà dell'VIII secolo lo spoglio diventa massiccio."],[847,"Secondo il Parco archeologico del Colosseo, dopo il terremoto di quest'anno cade ciò che restava del fronte sud, già in gran parte smontato, e forma un cumulo di travertini. Nessuna cronaca lo dice, e per i sismologi a Roma la scossa fu debole."],[1349,"La tradizione attribuiva il crollo al terremoto del 1349. Già nel 1993 chi ha scavato il monumento (R. Rea) scriveva: «il Colosseo non crolla, viene a più riprese smontato»."]]},
  circo:{cosa:"Il più grande edificio per spettacoli di Roma: le corse dei carri.", date:[[357,"Costanzo II, in visita, assiste ai giochi."],[550,"Ultime corse di cavalli di cui si ha notizia, volute da Totila."]]},
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
  adriano:{cosa:"Tomba di Adriano e dei suoi successori.", date:[[139,"Completato."],["III-V sec.","Inglobato nelle difese della città (sotto Aureliano o sotto Onorio: le fonti divergono)."],[537,"Gli assediati lanciano le statue sui Goti."]]},
  laterano:{cosa:"La cattedrale di Roma, voluta da Costantino.", date:[[318,"Consacrata il 9 novembre 318 secondo gli studi recenti; nel 324 secondo la tradizione."],[410,"I Goti portano via il grande baldacchino d'argento."],[455,"I Vandali asportano gli arredi; papa Leone I fa rifare i vasi sacri."]]},
  pietro:{cosa:"Basilica costantiniana sulla tomba dell'apostolo, fuori le mura.", date:[[320,"Inizio dei lavori, verso il 319-322; finita attorno alla metà del secolo."],[410,"Alarico la rispetta, con San Paolo, come luogo d'asilo."],[500,"Papa Simmaco costruisce residenze ai due lati dell'atrio, fontane e ospizi per i poveri."],[727,"Nasce la Schola Saxonum, primo ospizio di una nazione di pellegrini."],[800,"Carlo Magno vi è incoronato imperatore."],[846,"Saccheggiata dai Saraceni: pochi anni dopo sarà chiusa dentro le mura leonine."]]},
  mura:{cosa:"Diciannove chilometri di cinta: Roma non aveva mura in uso da secoli.", date:[[271,"Iniziate da Aureliano, finite sotto Probo."],[403,"Onorio ne raddoppia l'altezza."],[546,"Totila ne abbatte dei tratti (un terzo secondo Procopio, che forse esagera); nel 547 Belisario richiude le brecce in venticinque giorni."],[715,"Papa Gregorio II avvia il restauro; Gregorio III ne rifà gran parte a sue spese, Adriano I lo prosegue per tutto il pontificato."]]},
  acquedotti:{cosa:"Undici condotti che portavano l'acqua a terme, fontane e mulini.", date:[[537,"Tagliati dai Goti durante l'assedio."],[554,"La Prammatica Sanzione di Giustiniano conferma i fondi per riparare gli acquedotti: è una norma, non la prova di lavori fatti. Verso il 600 papa Gregorio Magno scrive che sono trascurati al punto da rischiare la rovina."],[780,"Papa Adriano I (772-795) ne fa riparare quattro (Liber Pontificalis). La Sabbatina, l'antica Traiana, era rotta da vent'anni, con cento arcate a terra: torna a servire San Pietro e i mulini del Gianicolo. La Iovia, anch'essa ferma da vent'anni, è forse un ramo della Marcia. La Claudia riporta l'acqua al Laterano; della Vergine entrava pochissima acqua, e dopo i lavori disseta quasi tutta la città. Gli anni precisi non sono scritti: verso il 776 è una deduzione degli studiosi."]]},
  sole:{cosa:"Tempio del Sole Invitto.", date:[[274,"Dedicato da Aureliano il 25 dicembre 274, dopo la vittoria su Palmira."],[392,"Vietati i culti pagani."]]},
  arcocostantino:{cosa:"Arco trionfale accanto al Colosseo.", date:[[315,"Inaugurato il 25 luglio 315, dedicato dal Senato per la vittoria su Massenzio. Molti rilievi vengono da monumenti di Traiano, Adriano e Marco Aurelio: probabilmente presi dai depositi dello Stato più che da edifici ancora in piedi."]]},
  termecostantino:{cosa:"Le ultime grandi terme di Roma, sul Quirinale.", date:[[315,"Costruite sotto Costantino, probabilmente prima del 315."],[443,"Restaurate dal prefetto urbano dopo gravi danni."],["VI sec.","Non si sa quando chiudono; qui si assume il 537, come per le altre grandi terme."]]},
  croce:{cosa:"Chiesa ricavata in un'aula del palazzo Sessoriano, residenza di Elena, madre di Costantino.", date:[[325,"Trasformata in chiesa attorno al 320-325."]]},
  lorenzo:{cosa:"Basilica sulla via Tiburtina, presso la tomba del martire.", date:[["IV sec.","Fondata da Costantino; la cronologia precisa non è nota."],[580,"Papa Pelagio II costruisce una nuova chiesa sopra la tomba."]]},
  agnese:{cosa:"Basilica cimiteriale e mausoleo di Costantina, sulla via Nomentana.", date:[[338,"Basilica fondata da Costantina, figlia di Costantino."],[351,"Il mausoleo è finito entro la metà del secolo."]]},
  paolo:{cosa:"Basilica sulla tomba dell'apostolo, sulla via Ostiense: grande quanto San Pietro.", date:[[384,"Tre imperatori ordinano di sostituire la piccola chiesa costantiniana (rescritto del 383-384) e ne rovesciano l'orientamento: abside verso la via Ostiense, facciata verso il Tevere."],[390,"Consacrata da papa Siricio; i lavori finiscono sotto Onorio, entro il 403 circa."],[801,"Il terremoto del 29 aprile fa crollare gran parte del tetto con le sue travi; papa Leone III lo ricostruisce."],[846,"Saccheggiata dai Saraceni, come San Pietro."]]},
  sabina:{cosa:"Basilica sull'Aventino.", date:[[432,"Costruita fra il 422 e il 432 da Pietro d'Illiria. Le ventiquattro colonne vengono tutte da uno stesso edificio antico, forse le terme di Sura."]]},
  mariamaggiore:{cosa:"Basilica sull'Esquilino dedicata a Maria.", date:[[434,"Consacrata il 5 agosto 434 da papa Sisto III (432-440), dopo il concilio di Efeso."]]},
  stefano:{cosa:"Chiesa a pianta circolare sul Celio.", date:[[455,"Cantiere avviato sotto papa Leone I: le travi sono datate al 455 circa."],[475,"Consacrata da papa Simplicio (468-483)."]]},
  foca:{cosa:"Colonna onoraria nella piazza del Foro.", date:[[608,"Dedicata il 1° agosto dall'esarca Smaragdo all'imperatore d'Oriente Foca. È l'ultimo monumento eretto nel Foro; colonna e basamento sono presi da monumenti più antichi."]]},
  monasteripietro:{cosa:"Monasteri, mausolei e residenze cresciuti attorno alla basilica.", date:[[400,"Mausoleo della famiglia di Onorio all'estremità sud del transetto; accanto, una rotonda più antica che papa Simmaco dedica a sant'Andrea."],[450,"Primo monastero, attribuito a papa Leone I: Santi Giovanni e Paolo, a nord."],[680,"San Martino, addossato all'abside, è attestato da Beda."],[732,"I monasteri sono tre; il quarto, Santo Stefano Minore, arriva nella seconda metà del secolo. I monaci cantano l'ufficio in basilica giorno e notte."],[757,"Il mausoleo di Onorio diventa la cappella di santa Petronilla, protettrice dei re franchi."]]},
  porticopietro:{cosa:"Via coperta da ponte Elio alla basilica, per i pellegrini.", date:[["fine IV sec.","Costruita probabilmente allora (secondo altri verso il 500): circa ottocento metri coperti."],[537,"Prima notizia sicura: la cita Procopio durante l'assedio."],[780,"Restaurata da papa Adriano I con dodicimila blocchi di tufo presi dagli argini del Tevere."]]},
  scholae:{cosa:"Ospizi delle nazioni: alloggio, chiesa e cimitero per i pellegrini di uno stesso popolo.", date:[[727,"Schola dei Sassoni: una tradizione più tarda la attribuisce al re Ine del Wessex, venuto a Roma verso il 726."],[755,"Papa Stefano II alza una torre con tre campane all'ingresso dell'atrio."],[799,"Prima notizia certa delle quattro scholae: Sassoni, Franchi, Frisoni e Longobardi accolgono papa Leone III al suo ritorno. Il sito di quella dei Longobardi è discusso. Da qui il nome «Borgo», dal germanico burg."],[847,"Bruciano nell'incendio di Borgo; Leone IV le fa ricostruire."]]},
  leonine:{cosa:"Cinta attorno a San Pietro e al Borgo: circa tre chilometri, con decine di torri, costruita in buona parte con blocchi tolti a edifici antichi.", date:[[846,"Il sacco saraceno mostra che le basiliche fuori le mura sono indifese."],[848,"Papa Leone IV avvia i lavori (fra l'847 e l'848)."],[852,"Cerimonia conclusiva il 27 giugno: nasce la «città leonina»."]]},
  venere:{cosa:"Il tempio più grande di Roma, fra il Foro e il Colosseo.", date:[[307,"Ricostruito da Massenzio dopo un incendio."],[392,"Chiuso al culto."],[630,"Papa Onorio I (625-638), con il permesso dell'imperatore Eraclio, toglie le tegole di bronzo dorato del «tempio di Roma» per coprire San Pietro. Per i più è questo tempio; secondo altri la vicina basilica di Massenzio."],[850,"Papa Leone IV costruisce Santa Maria Nova fra le sue rovine."]]},
  marcello:{cosa:"Teatro voluto da Augusto, fra il Campidoglio e il Tevere.", date:[[370,"Parte dei suoi travertini serve a restaurare il ponte Cestio: è il più antico caso documentato di un monumento di Roma usato come cava."],[421,"Vi si collocano ancora statue: il teatro è in piedi e frequentato."]]},
  mulini:{cosa:"Mulini montati su barche ancorate nella corrente del Tevere.", date:[[537,"Tagliati gli acquedotti, i mulini del Gianicolo si fermano: Belisario fa legare coppie di barche subito sotto un ponte, con la ruota sospesa in mezzo (Procopio). Il ponte è probabilmente quello dove oggi c'è ponte Sisto."],["VIII-IX sec.","I mulini del Gianicolo tornano a macinare quando Adriano I ripara l'acquedotto che li muove, rotto da vent'anni (Liber Pontificalis). Che funzionassero già nel VII secolo lo dice un solo manoscritto, per papa Onorio I. Per i mulini sul fiume in questi secoli mancano documenti, ma resteranno sul Tevere fino al 1870."]]},
  casenerva:{cosa:"Due case signorili ai lati della strada che attraversa il foro di Nerva.", date:[["prima","Il foro è ridotto a una strada: sul pavimento spogliato restano i solchi dei carri."],[850,"In pieno IX secolo sorgono le due case. La maggiore misura circa dieci metri per diciannove: piano terra in blocchi antichi con portico ad archi, piano superiore in mattoni, scala esterna di marmo di recupero."],["XI sec.","Abbandonate."]]},
  cosma:{cosa:"Chiesa ricavata in un'aula del tempio della Pace.", date:[[527,"Voluta da papa Felice IV (526-530) in edifici donati da Teodorico e Amalasunta: è il primo luogo di culto cristiano nell'area del Foro."]]}
};
var MURA_ALTE=[[0,0],[270,0],[276,1],[400,1],[404,1.5]];   // rialzate nel 401-403

function interp(punti,x){
  if(x<=punti[0][0]) return punti[0][1];
  for(var i=1;i<punti.length;i++) if(x<=punti[i][0]){ var a=punti[i-1], b=punti[i]; return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]); }
  return punti[punti.length-1][1];
}
/* stato cumulato delle regioni a ogni tappa */
var st={};
TAPPE.forEach(function(t){ if(t.cambia) for(var k in t.cambia) st[k]=t.cambia[k]; t.regioni=JSON.parse(JSON.stringify(st)); });
/* l'atto avanza dopo ogni intermezzo: l'intermezzo chiude l'atto che lo precede */
var atto=0; TAPPE.forEach(function(t){ if(t.apre) atto++; t.atto=atto; if(t.intermezzo) atto++; });   // "apre": la tappa inizia un atto nuovo

return {ATTI:ATTI,TAPPE:TAPPE,CURVE:CURVE,ABITATI:ABITATI,MONUMENTI:MONUMENTI,MURA_ALTE:MURA_ALTE,EVENTI:EVENTI,SCHEDE:SCHEDE,CHIESE:CHIESE,ITINERARIO:ITINERARIO,interp:interp};
})();
