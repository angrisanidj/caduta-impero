/* «Perché cadde l'Occidente?»: le spiegazioni degli storici, una per riga.
   In alto un quadro: per ogni spiegazione, gli anni che mette al centro (scelta di questa pagina, per orientarsi: lo dice la didascalia).
   Toccando una riga o una scheda si apre la spiegazione: la tesi, una citazione letta sulla fonte, l'obiezione, e i tasti che portano alle tappe in cui «si vede».
   I testi stanno in TESI, più sotto; le fonti di ogni citazione sono annotate accanto e in testa a js/dati.js. */
(function(){
var D=window.RM_DATI, radice=document.getElementById('tesi'); if(!radice||!D) return;
var A0=235, A1=852, T=D.TAPPE;
var FAMIGLIE=[['tutte','Tutte'],['dentro','Da dentro'],['fuori','Da fuori'],['natura','Clima e malattie'],['caso','Il caso'],['mai','Trasformazione'],['elenco','Il catalogo']];
var NOME_FAM={dentro:'da dentro',fuori:'da fuori',natura:'clima e malattie',caso:'il caso',mai:'trasformazione',elenco:'il catalogo'};

/* Le spiegazioni. Ogni citazione è stata letta sulla fonte il 22 novembre 2026 (o prima: si veda «Stato delle verifiche» in testa a js/dati.js) ed è tradotta qui;
   l'originale sta nel commento accanto. «anni»: [anno, che cosa si vede nella tappa] oppure [da, '', a] per un periodo: è una scelta nostra.
   A MEMORIA, senza una pagina aperta: la seconda frase della tesi di Halsall; che per Ward-Perkins il crollo cominci con le invasioni; la tesi di Harper sulle tre epidemie e sul clima;
   Peter Brown (il libro non si è potuto aprire: nessuna citazione); l'emigrazione di Rostovtzeff dopo il 1917; Ferrill. Da Wikipedia: le date del programma europeo (1992-1997),
   l'obiezione di Heather e Ward-Perkins a Bury, Nriagu e Scarborough (di cui si sono visti solo i dati bibliografici su PubMed).
   Il 22 novembre 2026 è stato letto Heather 2005 (scansione su archive.org, lettura OCR rovinata): p. 435 conferma la parte di Heather nell'obiezione a Bury (i gruppi entrati
   tolgono all'impero i contribuenti di intere province) e pp. 449-450 l'obiezione a Halsall (senza l'urto esterno degli Unni nel 376-380 e nel 405-408 l'Occidente non sarebbe caduto);
   per Ward-Perkins, in quell'obiezione, resta la fonte di prima. Passi in src/testi/studi-e-scavi.md. */
var TESI=[
 {id:'montesquieu', fam:'dentro', corto:'Montesquieu', chi:'Montesquieu', anno:'1734', titolo:'Un impero indebolito dalla sua stessa grandezza',
  tesi:"Per Montesquieu l'espansione di Roma indebolì le istituzioni che l'avevano resa potente. I soldati, rimasti per anni lontani dalla città, finirono per sentirsi più legati ai loro generali che allo Stato. Secondo il filosofo, cambiamenti profondi come questo influenzano il corso degli eventi. Contò anche la geografia. Gli eserciti che non riuscirono a prendere Costantinopoli si diressero verso ovest e l'Occidente «fu il primo abbattuto».",
  cit:"«Vi sono cause generali, morali o fisiche, che agiscono in ogni monarchia, la innalzano, la mantengono o la fanno precipitare; tutti gli accidenti sono sottomessi a queste cause.»",      // «Il y a des causes générales, soit morales, soit physiques, qui agissent dans chaque monarchie, l'élèvent, la maintiennent, ou la précipitent ; tous les accidents sont soumis à ces causes» (fr.wikisource)
  fonte:"Considérations sur les causes de la grandeur des Romains et de leur décadence, cap. XVIII; il passo sull'Occidente è nel cap. XIX",
  obiezione:"Bury osserva che le stesse condizioni esistevano nell'impero d'Oriente, che sopravvisse per altri mille anni.",
  anni:[[235,"gli eserciti fanno e disfano gli imperatori"],[395,"l'impero diviso fra due corti"]]},
 {id:'gibbon', fam:'dentro', corto:'Gibbon', chi:'Edward Gibbon', anno:'1776-1789', titolo:'Troppo grande per durare',
  tesi:"Gibbon definisce la caduta di Roma «l'effetto naturale e inevitabile di una grandezza smisurata». A suo giudizio, la prosperità dell'impero contribuì a indebolirlo. Ogni nuova conquista estendeva i territori da governare e moltiplicava le ragioni della crisi. Gibbon presenta la sua opera come il racconto di quello che chiama «il trionfo della barbarie e della religione».",
  cit:"«La storia della sua rovina è semplice e ovvia; e invece di chiederci perché l'impero romano fu distrutto, dovremmo piuttosto stupirci che sia durato così a lungo.»",      // «The story of its ruin is simple and obvious; and instead of inquiring why the Roman empire was destroyed, we should rather be surprised that it had subsisted so long» (ccel.org)
  fonte:"The History of the Decline and Fall of the Roman Empire, «Osservazioni generali sulla caduta dell'impero romano in Occidente», alla fine del cap. XXXVIII",
  obiezione:"A Gibbon si può rivolgere la stessa obiezione mossa a Montesquieu. L'estensione dell'impero, da sola, lascia aperte due domande. Perché cadde soltanto la parte occidentale? E perché proprio in quel periodo?",
  anni:[[235,'',476],[476,"l'ultimo imperatore d'Occidente"]]},
 {id:'religione', fam:'dentro', corto:'Il cristianesimo', chi:'Edward Gibbon, sul cristianesimo', anno:'1781', titolo:'La religione che disarma',
  tesi:"Secondo Gibbon, il clero incoraggiò la pazienza e la vita monastica a scapito dell'impegno civile e militare. Poche righe dopo, lo storico attenua il giudizio. Una volta adottato anche dai vincitori, il cristianesimo «attutì la violenza della caduta».",
  cit:"«Il clero predicò con successo le dottrine della pazienza e della pusillanimità; le virtù attive della società furono scoraggiate, e gli ultimi resti dello spirito militare furono sepolti nel chiostro.»",      // «The clergy successfully preached the doctrines of patience and pusillanimity: the active virtues of society were discouraged; and the last remains of military spirit were buried in the cloister»
  fonte:"Decline and Fall, «Osservazioni generali», alla fine del cap. XXXVIII",
  obiezione:"Bury: «i cristiani erano bellicosi quanto i pagani». E l'Oriente, non meno cristiano, non cadde.",      // Bury p. 310: «The Christians were as pugnacious as the pagans»
  anni:[[330,"un imperatore cristiano fonda la nuova capitale"],[395,"muore Teodosio"]]},
 {id:'rostovtzeff', fam:'dentro', corto:'Rostovtzeff', chi:'Michail Rostovtzeff', anno:'1926', titolo:"L'esercito contro le città",
  tesi:"Per Rostovtzeff il conflitto nasce all'interno della società romana. Nel III secolo i soldati, reclutati in gran parte nelle campagne, sono sempre più lontani dalla cultura delle città. Finiscono per abbattere il potere delle classi colte e privilegiate. Lo storico parla di una «barbarizzazione dell'impero dall'interno», particolarmente forte in Occidente e già in corso prima delle invasioni.",
  cit:"«L'esercito combatté le classi privilegiate, e non smise di combattere finché queste classi non ebbero perduto tutto il loro prestigio sociale.»",      // «The army fought the privileged classes, and did not cease fighting until these classes had lost all their social prestige»; p. 532: «a gradual barbarization of the Empire from within, especially in the West»
  fonte:"The Social and Economic History of the Roman Empire, letta nella seconda edizione (1957), p. 495 e p. 532",
  obiezione:"Rostovtzeff aveva lasciato la Russia dopo la rivoluzione, e lui stesso ricorda l'accusa che gli fu mossa: aver letto il III secolo «sotto l'influsso degli eventi della Russia moderna».",
  anni:[[235,'',284],[235,"i soldati uccidono l'imperatore"],[260,"l'impero in tre pezzi"]]},
 {id:'vegezio', fam:'dentro', corto:'Vegezio', chi:'Vegezio e la crisi dell\'esercito', anno:'fine del IV secolo', titolo:'I soldati senza corazza',
  tesi:"Vegezio, vissuto nel tardo impero, sostiene che i fanti romani avessero portato corazza ed elmo dalla fondazione di Roma fino al regno di Graziano. Quando l'addestramento fu trascurato, quelle protezioni cominciarono a sembrare troppo pesanti e i soldati le abbandonarono. Nel Novecento Arther Ferrill ha ripreso l'idea del declino militare, insistendo sulla perdita di disciplina e sul crescente ricorso a truppe di origine barbarica.",
  cit:"«Così i nostri soldati, scontratisi con i Goti a petto e a capo scoperti, furono spesso annientati dalla moltitudine degli arcieri.»",      // «Sic detectis pectoribus et capitibus congressi contra Gothos milites nostri multitudine sagittariorum saepe deleti sunt» (thelatinlibrary)
  fonte:"Epitoma rei militaris I 20",
  obiezione:"Bury: dopo Adrianopoli i Germani non vinsero più nessuna grande battaglia contro un esercito romano.",
  anni:[[378,"Adrianopoli"],[451,"un esercito fatto di alleati"]]},
 {id:'wickham', fam:'dentro', corto:'Wickham', chi:'Chris Wickham', anno:'2005', titolo:'Quando lo Stato smette di tassare',
  tesi:"Come pagava Roma i soldati e la corte? Soprattutto con le imposte sulle terre. Per Wickham la capacità di riscuoterle era «la principale singola struttura» dello Stato. Fra il V e il VII secolo questo sistema smise progressivamente di funzionare in Occidente, in tempi diversi da un regno all'altro. Per molti storici la perdita di entrate più grave risale al 439, quando i Vandali conquistarono Cartagine e sottrassero al governo romano le ricche province africane.",      // «The land tax, and the fiscal system as a whole, was the main single structure» (Framing the Early Middle Ages)
  fonte:"Framing the Early Middle Ages (2005)",
  anni:[[439,"l'Africa, il suo grano e le sue tasse"],[468,"l'ultima flotta"],[476,"un re al posto dell'imperatore"]]},
 {id:'halsall', fam:'dentro', corto:'Halsall', chi:'Guy Halsall', anno:'2007', titolo:"Le lotte di Roma coinvolgono i popoli vicini",
  tesi:"Secondo Halsall, per capire perché i popoli oltre la frontiera entrarono nell'impero occorre partire dalle lotte per il potere a Roma. Le fazioni romane avevano bisogno di soldati. Per chi attraversava la frontiera, schierarsi con una di esse era un modo per trovare un posto nell'impero.",
  cit:"«Le \"migrazioni barbariche\" furono dunque il prodotto della \"fine dell'impero romano\", e non viceversa.»",      // «'barbarian migrations' were, therefore, the product of the 'end of the Roman Empire', and not vice versa»
  fonte:"Barbarian Migrations and the Roman West, 376-568 (2007)",
  obiezione:"Per Heather l'avanzata degli Unni è decisiva per spiegare sia il passaggio del Danubio nel 376 sia gli attraversamenti della frontiera negli anni 405-408.",
  anni:[[395,"due corti rivali"],[406,"il Reno"],[418,"un regno dentro l'impero"]]},
 {id:'jones', fam:'fuori', corto:'Jones', chi:'A. H. M. Jones', anno:'1964', titolo:'Un Occidente più esposto agli attacchi',
  tesi:"Secondo Jones, nell'impero «troppo pochi produttori mantenevano troppe bocche inutili» e il peso delle imposte scoraggiava la popolazione. Gli stessi problemi, osserva però lo storico, esistevano nell'Impero d'Oriente, che sopravvisse. A suo giudizio la differenza decisiva fu che l'Occidente era più esposto agli attacchi dall'esterno.",      // vol. II p. 1045: «too few producers supported too many idle mouths»; p. 1067: «The oppressive weight of the taxation contributed to the general apathy»; p. 1068: «The internal weaknesses of the empire cannot have been a major factor in its decline»
  cit:"«La causa principale della sua caduta fu che era più esposto agli assalti dei barbari.»",      // «the major cause of its fall was that it was more exposed to barbarian onslaughts»
  fonte:"The Later Roman Empire 284-602, vol. II, p. 1068",
  obiezione:"Per Halsall la successione degli eventi va letta partendo da Roma. Furono le lotte interne all'impero a spingere i popoli vicini a intervenire.",
  anni:[[378,"Adrianopoli"],[406,"il Reno"],[439,"Cartagine"]]},
 {id:'heather', fam:'fuori', corto:'Heather', chi:'Peter Heather', anno:'2005 e 2010', titolo:'La spinta degli Unni',
  tesi:"Secondo Heather, l'avanzata degli Unni spinse prima i Goti ad attraversare il Danubio nel 376, poi altri popoli a oltrepassare il Reno tra il 405 e il 408. Per questi gruppi entrare nell'impero sembrava meno rischioso che affrontare gli Unni. Una volta insediati, presero progressivamente il controllo di diverse province. Il governo d'Occidente perse così anche le tasse che gli abitanti di quelle terre gli avevano pagato fino ad allora.",      // 2005, p. 435: «the permanent alienation of a significant chunk of the western Empire's taxpayers»
  cit:"«Le crisi del 376-380 e del 405-408 videro entrambe gli Unni spingere altri gruppi oltre la frontiera dell'impero.»",      // «the crises of 376-80 and 405-8 both saw the Huns push other groups across the imperial frontier»
  fonte:"Empires and Barbarians (2010), pp. 208-209; la stessa tesi in The Fall of the Roman Empire (2005), pp. 435 e 449-450",
  obiezione:"Halsall: le migrazioni sono il prodotto della fine dell'impero, non la causa.",
  anni:[[378,"i Goti dentro l'impero"],[406,"il Reno"],[439,"Cartagine"],[451,"Attila"]]},
 {id:'wardperkins', fam:'fuori', corto:'Ward-Perkins', chi:'Bryan Ward-Perkins', anno:'2005', titolo:'La fine di una civiltà',
  tesi:"Secondo Ward-Perkins, tra il V e il VII secolo le condizioni di vita in Occidente peggiorarono bruscamente. Per mostrarlo lo storico guarda a ciò che gli archeologi ritrovano nelle case e negli insediamenti, dalle stoviglie di ceramica alle tegole e alle monete. Persino i bovini, che in età romana erano diventati più grandi, tornarono a essere di taglia più piccola. Ward-Perkins parla di «l'ascesa e la caduta della mucca romana» e colloca l'inizio del declino al tempo delle invasioni.",      // «the rise and fall of the Roman cow»
  fonte:"The Fall of Rome and the End of Civilization (2005)",
  obiezione:"Goffart e la scuola della trasformazione leggono gli stessi secoli come un adattamento.",
  anni:[[400,'',700],[439,"Cartagine"],[546,"Roma vuota"],[593,"dov'è il Senato, dov'è il popolo"]]},
 {id:'pirenne', fam:'fuori', corto:'Pirenne', chi:'Henri Pirenne', anno:'1922 e 1937', titolo:"Le conquiste arabe dividono il Mediterraneo",
  tesi:"Per Pirenne, dopo le invasioni germaniche i nuovi regni continuarono a far parte di un unico mondo mediterraneo. La svolta arrivò con le conquiste arabe del VII e dell'VIII secolo, che secondo lo storico spezzarono i legami fra le sponde del mare. Il centro politico dell'Occidente si spostò allora verso nord, nelle terre in cui sarebbe sorto l'impero di Carlo Magno.",
  cit:"«Il Mediterraneo era stato un lago romano: diventa un lago musulmano.» «Carlo Magno, senza Maometto, sarebbe inconcepibile.»",      // «La Méditerranée avait été un lac romain : elle devient un lac musulman»; «Charlemagne, sans Mahomet, serait inconcevable»
  fonte:"«Mahomet et Charlemagne», Revue belge de philologie et d'histoire 1 (1922), pp. 77-86",
  obiezione:"Già dal III secolo diminuiscono i relitti databili ritrovati nel Mediterraneo. È un indizio di un calo dei traffici marittimi anteriore alle conquiste arabe.",
  anni:[[711,"il Mediterraneo si divide"],[800,"Carlo Magno imperatore"]]},
 {id:'harper', fam:'natura', corto:'Harper', chi:'Kyle Harper', anno:'2017', titolo:'Il ruolo del clima e delle epidemie',
  tesi:"Harper considera anche gli effetti di un clima meno favorevole dopo il II secolo e di tre grandi epidemie che colpirono gli abitanti delle città e i soldati. Nel percorso si incontrano l'epidemia della metà del III secolo, il sole velato del 536 e la peste che raggiunse Costantinopoli nel 542.",
  fonte:"The Fate of Rome (2017)",
  obiezione:"Nel 2018 John Haldon e altri studiosi hanno giudicato insufficienti le prove per attribuire a clima e malattie un ruolo decisivo. Per l'epidemia del III secolo, detta «peste di Cipriano», le fonti non permettono di stimare l'impatto.",
  anni:[[251,"la peste di Cipriano"],[537,"il sole velato del 536"],[542,"la peste di Giustiniano"]]},
 {id:'piombo', fam:'natura', corto:'Il piombo', chi:'Jerome Nriagu', anno:'1983', titolo:'Avvelenati dal piombo',
  tesi:"Secondo Nriagu, i Romani benestanti rischiavano di avvelenarsi bevendo vino. Per addolcirlo si aggiungeva mosto fatto bollire in recipienti di piombo. Lo studioso ipotizza che così i ricchi assorbissero il metallo e si ammalassero di «gotta saturnina», una forma di gotta legata all'esposizione al piombo. A suo giudizio, il fenomeno avrebbe contribuito alla caduta di Roma.",
  fonte:"«Saturnine gout among Roman aristocrats», New England Journal of Medicine 308 (1983): visti solo i dati bibliografici",
  obiezione:"Nel 1984 John Scarborough contestò quello che definiva «il mito dell'avvelenamento da piombo fra i Romani». Osservò che gli antichi conoscevano bene gli effetti del metallo. Le tracce di piombo ritrovate nei ghiacci della Groenlandia ci informano su quanto ne disperdessero nell'aria le miniere e le fonderie. Durante le crisi del II e del III secolo la quantità depositata nei ghiacci diminuì bruscamente e restò bassa per cinque secoli.",
  anni:[]},
 {id:'bury', fam:'caso', corto:'Bury', chi:'J. B. Bury', anno:'1923', titolo:'Una successione di eventi dall\'esito incerto',
  tesi:"Bury osserva che tasse, spopolamento e cristianesimo caratterizzavano anche l'Oriente, che sopravvisse. Per spiegare la fine dell'Occidente segue invece una successione di eventi, ciascuno dei quali avrebbe potuto avere un esito diverso. Arrivarono gli Unni. La cattiva gestione dei profughi goti sfociò nella crisi di Adrianopoli, dove Valente scelse di dare battaglia. Teodosio insediò un intero popolo nell'impero come alleato. Alla sua morte il trono passò al giovane Onorio, che Bury giudica «un ragazzo debole di mente». Il comando militare toccò a Stilicone, che entrò in conflitto con la corte d'Oriente.",
  cit:"«Il graduale crollo della potenza romana in questa parte dell'impero fu la conseguenza di una serie di eventi contingenti. Non si possono indicare cause generali che lo rendessero inevitabile.»",      // «The gradual collapse of the Roman power in this section of the Empire was the consequence of a series of contingent events. No general causes can be assigned that made it inevitable» (LacusCurtius)
  fonte:"History of the Later Roman Empire, cap. IX, § 7, p. 311",
  obiezione:"Heather e Ward-Perkins sottolineano che perdere una provincia significava perdere anche le imposte dei suoi abitanti. Con meno entrate diventava più difficile pagare i soldati necessari a difendere le province rimaste.",
  anni:[[378,"Adrianopoli"],[395,"muore Teodosio"],[402,"Stilicone e la corte a Ravenna"],[410,"il sacco di Roma"]]},
 {id:'goffart', fam:'mai', corto:'Goffart', chi:'Walter Goffart', anno:'1980', titolo:'Un esperimento sfuggito di mano',
  tesi:"Secondo Goffart, le autorità romane negoziarono con i gruppi provenienti da oltre frontiera le condizioni per stabilirsi nelle province. Roma fissò le regole degli insediamenti e l'amministrazione provinciale continuò a funzionare anche dopo l'arrivo dei nuovi abitanti.",
  cit:"«Quella che chiamiamo caduta dell'impero d'Occidente fu un esperimento fantasioso un po' sfuggito di mano.»",      // «an imaginative experiment that got a little out of hand» (p. 35)
  fonte:"Barbarians and Romans, A.D. 418-584 (1980), p. 35",
  obiezione:"Ward-Perkins richiama l'attenzione sulle condizioni degli abitanti. A suo giudizio, gli scavi mostrano che nel passaggio ai nuovi regni il tenore di vita peggiorò bruscamente.",
  anni:[[418,"i Visigoti insediati per trattato"],[476,"Odoacre"],[493,"Teodorico governa con i Romani"]]},
 {id:'trasformazione', fam:'mai', corto:'La trasformazione', chi:'Peter Brown e la scuola della trasformazione', anno:'dal 1971', titolo:'Come si trasformò il mondo romano',
  tesi:"Dagli anni Settanta del Novecento Peter Brown e altri studiosi smettono di parlare di decadenza e descrivono i secoli dal III all'VIII come un periodo di trasformazione. Studiano come, nel mondo che era stato romano, presero forma i regni romano-barbarici, l'impero bizantino e la Chiesa dei vescovi e dei monaci, e come vi si diffuse l'islam. Negli anni Novanta la European Science Foundation dedicò a questo tema il programma «La trasformazione del mondo romano».",
  fonte:"P. Brown, The World of Late Antiquity (1971), non riletto; il programma europeo, 1992-1997, da una voce d'enciclopedia",
  obiezione:"Per Ward-Perkins (2005), concentrarsi sulle trasformazioni lascia in ombra il calo del tenore di vita documentato dagli scavi.",
  anni:[[235,'',800],[609,"il Pantheon diventa una chiesa"],[800,"un impero nuovo"]]},
 {id:'demandt', fam:'elenco', corto:'Le 210 cause', chi:'Alexander Demandt', anno:'1984', titolo:'Duecentodieci ragioni',
  tesi:"Nel 1984 lo storico tedesco Alexander Demandt raccolse in ordine alfabetico 210 cause proposte nei due secoli precedenti per spiegare la caduta di Roma. L'elenco documenta la varietà delle interpretazioni, anche quando si contraddicono. Qui ne compare una selezione.",
  elenco:[["assalto degli Unni"],["pane e giochi"],["bolscevizzazione"],["cristianesimo"],["peggioramento del clima"],["concatenazione di disgrazie"],["eccessi della tavola"],["divisione dell'impero"],["epidemie"],["gotta"],["edonismo"],["grandezza smisurata"],["avvelenamento da piombo"],["malaria"],["terme"],["perdita di fertilità dei terreni"],["peso delle tasse"],["volgarizzazione"]],
  fonte:"Der Fall Roms (1984), p. 695: l'elenco è stato letto in una traduzione inglese",
  anni:[]}
];

function el(tag,cl,testo){ var e=document.createElement(tag); if(cl) e.className=cl; if(testo!=null) e.textContent=testo; return e; }
function X(a){ return (Math.max(A0,Math.min(A1,a))-A0)/(A1-A0)*100; }
/* la tappa più vicina a un anno (non gli intermezzi) */
function tappaDi(a){ var k=0,d=1e9; T.forEach(function(t,i){ if(t.intermezzo) return; var e=Math.abs(t.anno-a); if(e<d){ d=e; k=i; } }); return k; }
function vaiA(a){ var PG=window.RM_pagina; if(!PG) return; PG.ferma(); PG.vai(tappaDi(a)); var s=document.getElementById('scene'); if(s) s.scrollIntoView({behavior:'smooth',block:'start'}); }

var filtro='tutte', aperta=null, righe={}, schede={};

/* ---- filtri ---- */
var barra=el('div','tesi-filtri'); barra.setAttribute('role','group'); barra.setAttribute('aria-label','Tipi di spiegazione');
FAMIGLIE.forEach(function(f){
  if(f[0]!=='tutte' && !TESI.some(function(t){ return t.fam===f[0]; })) return;
  var b=el('button',f[0]==='tutte'?'':'f-'+f[0],f[1]); b.type='button'; b.setAttribute('aria-pressed',f[0]===filtro?'true':'false');
  b.addEventListener('click',function(){ filtro=f[0]; [].forEach.call(barra.children,function(c){ c.setAttribute('aria-pressed',c===b?'true':'false'); }); applica(); });
  barra.appendChild(b);
});
radice.appendChild(barra);

/* ---- il quadro: una riga per spiegazione, gli anni sull'asse ---- */
var quadro=el('div','tesi-quadro'), asse=el('div','tesi-asse');
D.ATTI.forEach(function(a){ var s=el('span',null,String(a.da)); s.style.left=X(a.da)+'%'; asse.appendChild(s); });
var fine=el('span','fine',String(A1)); fine.style.left='100%'; asse.appendChild(fine);
quadro.appendChild(asse);
TESI.forEach(function(t){
  var r=el('button','tesi-riga f-'+t.fam), nome=el('span','chi',t.corto||t.chi), pista=el('span','pista');
  r.type='button'; r.setAttribute('aria-label',t.chi+': '+t.titolo);
  D.ATTI.forEach(function(a,i){ if(!i) return; var g=el('i','atto'); g.style.left=X(a.da)+'%'; pista.appendChild(g); });
  (t.anni||[]).forEach(function(q){
    if(q.length>2 && q[2]){ var f=el('i','fascia'); f.style.left=X(q[0])+'%'; f.style.width=(X(q[2])-X(q[0]))+'%'; pista.appendChild(f); }
    else { var p=el('i','punto'); p.style.left=X(q[0])+'%'; p.title=q[0]+' · '+q[1]; pista.appendChild(p); }
  });
  r.appendChild(nome); r.appendChild(pista); r.addEventListener('click',function(){ apri(t.id,true); });
  quadro.appendChild(r); righe[t.id]=r;
});
radice.appendChild(quadro);
radice.appendChild(el('p','tesi-nota','Ogni riga presenta una spiegazione della caduta dell\'Occidente. I punti indicano singoli anni, le fasce periodi più lunghi. Abbiamo scelto le date sulla base dei testi citati. Seleziona una riga per leggere l\'interpretazione corrispondente.'));

/* ---- le schede ---- */
var elenco=el('div','tesi-elenco');
TESI.forEach(function(t){
  var s=el('article','tesi-scheda f-'+t.fam), testa=el('button','testa'), corpo=el('div','corpo');
  testa.type='button'; testa.setAttribute('aria-expanded','false');
  testa.appendChild(el('span','fam',NOME_FAM[t.fam]||''));
  testa.appendChild(el('span','titolo',t.titolo));
  testa.appendChild(el('span','autore',t.chi+(t.anno?' · '+t.anno:'')));
  corpo.hidden=true;
  corpo.appendChild(el('p','tesi-testo',t.tesi));
  if(t.cit) corpo.appendChild(el('blockquote',null,t.cit));
  if(t.fonte) corpo.appendChild(el('p','fonte',t.fonte));
  if(t.obiezione){ var o=el('p','obiezione'); o.appendChild(el('b',null,'Le obiezioni degli altri studiosi. ')); o.appendChild(document.createTextNode(t.obiezione)); corpo.appendChild(o); }
  if(t.elenco){ var ul=el('ul','tesi-voci'); t.elenco.forEach(function(v){ var li=el('li'); li.appendChild(el('b',null,v[0])); if(v[1]) li.appendChild(document.createTextNode(' '+v[1])); ul.appendChild(li); }); corpo.appendChild(ul); }
  var punti=(t.anni||[]).filter(function(q){ return !(q.length>2 && q[2]); });
  if(punti.length){
    var dove=el('p','dove'); dove.appendChild(el('span',null,'Le tappe legate a questa spiegazione'));
    punti.forEach(function(q){ var b=el('button',null); b.type='button'; b.appendChild(el('b',null,String(T[tappaDi(q[0])].anno))); b.appendChild(document.createTextNode(' '+q[1])); b.addEventListener('click',function(){ vaiA(q[0]); }); dove.appendChild(b); });
    corpo.appendChild(dove);
  }
  testa.addEventListener('click',function(){ apri(aperta===t.id?null:t.id,false); });
  s.appendChild(testa); s.appendChild(corpo); elenco.appendChild(s); schede[t.id]={s:s,testa:testa,corpo:corpo};
});
radice.appendChild(elenco);

function apri(id,scorri){
  aperta=id;
  TESI.forEach(function(t){ var c=schede[t.id], si=t.id===id; c.s.classList.toggle('aperta',si); c.testa.setAttribute('aria-expanded',si?'true':'false'); c.corpo.hidden=!si; righe[t.id].classList.toggle('scelta',si); });
  if(id && scorri){ var t=TESI.filter(function(x){ return x.id===id; })[0]; if(t && filtro!=='tutte' && t.fam!==filtro){ filtro='tutte'; [].forEach.call(barra.children,function(c,i){ c.setAttribute('aria-pressed',i===0?'true':'false'); }); applica(); } schede[id].s.scrollIntoView({behavior:'smooth',block:'nearest'}); }
}
function applica(){ TESI.forEach(function(t){ var via=filtro!=='tutte'&&t.fam!==filtro; schede[t.id].s.hidden=via; righe[t.id].classList.toggle('spenta',via); }); }
})();
