/* Regioni e quartieri sulla scena di Roma (25 novembre 2026, chiesto dall'utente: «Riesci a fare un altro strumento: che divide Roma per i quartieri dell'epoca Romana? Da Suburra in poi?»).
   Fonti: src/testi/regioni-fonti.md (Platner e Ashby, voce Regiones Quattuordecim e voci dei quartieri, e i cataloghi del IV secolo, Notitia e Curiosum, letti su LacusCurtius il 25 novembre 2026)
   e, per i numeri dei cataloghi, la tabella «I cataloghi delle regioni» di src/testi/vita-roma-fonti.md (edizione Jordan).
   Come sono tracciati i confini. Nessuna fonte antica traccia una linea: i cataloghi danno solo l'elenco dei monumenti di ogni regione, e i confini che si leggono negli atlanti sono di Hülsen.
   Qui, come chiede la sezione «Per chi disegna» del file delle fonti: (1) ogni monumento del modello ha la sua regione (tabella 1 del file; quelli sul confine, segnati ≈, non contano);
   (2) a ogni regione si aggiungono pochi punti d'appoggio sui colli del modello (COLLI in js/base.js) che le voci le assegnano (Palatino alla X, Oppio alla III, Cispio e Velia alla IV,
   Quirinale e Viminale alla VI, Aventino alla XIII, Piccolo Aventino alla XII, Celio alla II e i suoi versanti sud alla I, il circo alla XI): sono ricostruzione, dichiarata;
   (3) ogni punto della città dentro le mura aureliane va alla regione del monumento o del punto d'appoggio più vicino (celle di Voronoi), con cinque vincoli: le strade che le voci danno
   come confine (via Lata fra VII e IX, via Appia fra I e XII, clivo Suburano fra III e IV, vico Patricio fra IV e VI, strada dal Colosseo alla porta Asinaria fra II e III / V);
   il prolungamento del clivo Suburano fino alla Meta Sudans (PA, voce III) è anch'esso un vincolo, ma senza strada nel modello: linea tratteggiata;
   (4) la riva destra del Tevere con l'isola è tutta la XIV; fuori dalle mura la XIV sfuma senza bordo (i suoi limiti «non determinabili» arrivavano al Vaticano); il resto fuori dalle mura non ha tinta.
   Linee continue: mura, Tevere e le cinque strade dove fanno da confine. Linee tratteggiate e morbide: tutto il resto (ricostruzione).
   Le regioni valgono per tutto il periodo: le pagine lette dicono solo che nel VII secolo arrivano le sette regioni della Chiesa, senza data né confini; la scheda lo dice dal 600.
   Interruttore «Regioni e quartieri» nel menu Strumenti, spento di norma; la scelta vale per la visita (sessionStorage «rm-regioni»); ?regioni=1 lo accende per le prove, ?regione=IV apre la scheda.
   Come i nomi delle strade (js/strade-nomi.js): scritte sulla scena che scansano i nomi dei monumenti e i comandi, nascoste nei primi piani, nelle messe in scena e, sul telefono, fuori dal tutto schermo.
   Nessun costo quando è spento: la pianta si calcola e la maglia si fa la prima volta che lo si accende. */
(function(){
'use strict';

/* ---------- le quattordici regioni ----------
   n: numero; it: nome da mostrare; la: nome latino dei cataloghi; cosa: che cosa comprendeva (PA Regiones e voci; regioni-fonti.md, tabella 1);
   cat: Notitia [insulae, domus, horrea, balnea, lacus, pistrina], cur: i numeri del Curiosum dove sono diversi (vita-roma-fonti.md, «I cataloghi delle regioni»);
   mon: monumenti del modello (con * quelli nominati nel catalogo, C; senza, regione dedotta dai confini della voce, D); bordo: monumenti sul confine (≈);
   ancore: punti d'appoggio sui colli del modello (ricostruzione); luoghi: nomi del catalogo senza un posto noto; nota: riga in più */
var REGIONI=[
 {n:'I', it:'Porta Capena', la:'Porta Capena', cat:[3250,120,16,86,81,20], cur:{4:87},
  cosa:'Dalla porta Capena delle mura serviane verso sud, lungo la via Appia, fino al fiume Almone; con i versanti ovest e sud del Celio.',
  mon:['antoniniano'], bordo:['arcocostantino'], ancore:[[75,110],[100,125],[118,150],[133,180]],
  nota:'Il suo catalogo non nomina nessun monumento del modello; l\'acquedotto Antoniniano vi passa.'},
 {n:'II', it:'Celio', la:'Caelimontium', cat:[3600,127,27,85,65,15],
  cosa:'La parte centrale del Celio. Confinava con la regione I, con le mura aureliane e con la strada diritta dal Colosseo alla porta Celimontana e alla porta Asinaria.',
  mon:['*tempioclaudio','dolabella','stefano'], bordo:['laterano','patriarchio','triclinioleone','arcocostantino'], ancore:[[62,60],[120,76],[145,84]],
  luoghi:'Il catalogo nomina anche il «caput Africae» e la «Mica Aurea»: della seconda le pagine lette non dicono dove fosse.'},
 {n:'III', it:'Iside e Serapide', la:'Isis et Serapis', cat:[2757,60,18,80,65,16], cur:{1:160,2:17},
  cosa:'La valle del Colosseo e l\'Oppio. Confinava con la regione II, con le mura serviane e con il clivo Suburano, dalla porta Esquilina fino alla Meta Sudans.',
  mon:['*colosseo','*ludusmagnus','*tito','*traiano'], bordo:['esquilino','arcocostantino'], ancore:[[100,-6],[115,22]]},
 {n:'IV', it:'Tempio della Pace', la:'Templum Pacis', cat:[2757,88,18,65,71,15], cur:{3:75,4:78},
  cosa:'La via Sacra dall\'inizio all\'atrio di Vesta, la Suburra e il Cispio, con la parte nord del Foro. Confinava con le mura serviane, con il vico Patricio e con il passaggio fra il foro di Nerva e quello di Vespasiano.',
  mon:['*colosso','*metasudans','*metasudansvasca','*venere','*massenzio','*emilia','*emiliarovina','*antonino','pace','arcotito','cosma','santamarianova','mariamaggiore'], bordo:['casenerva','esquilino','arcocostantino','foronerva'],
  ancore:[[36,12],[50,-30],[108,-55]],
  nota:'Il nome non può essere più antico del Tempio della Pace di Vespasiano. Il foro di Nerva sta in due cataloghi: in questo come «forum transitorium», in quello della VIII come foro di Nerva.'},
 {n:'V', it:'Esquilie', la:'Esquiliae', cat:[3850,180,22,75,74,15],
  cosa:'Tutta fuori dalle mura serviane, a nord della via Asinaria, con l\'estremità est del Celio. Nel IV secolo il confine seguiva le mura aureliane dalla via Labicana al lato sud dei Castra Pretoria. Molti horti; Properzio chiama le Esquilie «aquosae», per gli acquedotti che entravano da porta Prenestina.',
  mon:['*sessoriano','*minervamedica','croce','eurisace'], bordo:['laterano','patriarchio','triclinioleone','esquilino'], ancore:[[176,-28],[215,-40],[195,22],[168,-82],[168,5]],
  luoghi:'Il catalogo nomina anche un «campus Viminalis subager»: il posto non si sa. In origine il nome Esquiliae indicava l\'Oppio e il Cispio, che restano fuori da questa regione (sono nella III e nella IV).',
  nota:'Che la «Minerva medica» del catalogo sia proprio l\'edificio che il modello chiama così non è stato verificato.'},
 {n:'VI', it:'Alta Semita', la:'Alta Semita', cat:[3403,146,18,75,73,16],
  cosa:'Il Quirinale, dai fori imperiali alle mura serviane fra porta Viminale e porta Collina, e gli horti Sallustiani; a nord andava oltre la linea delle mura aureliane. Il nome è quello della strada sul crinale (oggi via XX Settembre). Nel IV secolo il confine girava attorno ai Castra Pretoria.',
  mon:['*diocleziano','*termecostantino','*obeliscosallustiano','castrapretorio'], bordo:[], ancore:[[20,-70],[66,-121],[95,-95],[122,-152]],
  nota:'Fuori dalle mura la scena non dà tinta: dove finisse la regione non si sa.'},
 {n:'VII', it:'Via Lata', la:'Via Lata', cat:[3805,120,25,75,76,15],
  cosa:'Fra il tratto sud della via Flaminia, detto via Lata (oggi via del Corso), e la regione VI.',
  mon:['*sole','*arcusnovus','archivialata'], bordo:[], ancore:[],
  luoghi:'Il catalogo nomina un «campus Agrippae»: dove fosse esattamente, le pagine lette non lo dicono.'},
 {n:'VIII', it:'Foro Romano', la:'Forum Romanum (vel) Magnum', cat:[3480,130,18,86,120,20], cur:{3:85},
  cosa:'Il Foro (non tutta la via Sacra), i fori imperiali, il Campidoglio e la zona a sud, fino a una linea a nord del Foro Boario che attraversava il Velabro.',
  mon:['*fori','*curia','*curiaantica','*curiastatue','*santadriano','*giove','*campidoglio','foca','focastatua','*castori','*saturno','*vesta','arcoseveroforo','*colonnatraiana','*concordia','*vespasiano','divogiulio','*giulia','*rostri','tabularium','*foroaugusto','*forocesare','*forotraiano','marforio','regia','regiacasa'], bordo:['casenerva','mercatitraiano','foronerva'], ancore:[[-6,-22],[-19,-11]]},      // 26 novembre 2026: gli edifici del Foro resi monumenti a sé (con l'asterisco quelli del catalogo della VIII; l'arco di Severo, il Divo Giulio, il Tabularium e i mercati no)
 {n:'IX', it:'Circo Flaminio', la:'Circus Flaminius', cat:[2777,140,25,63,120,20],
  cosa:'Tutto il terreno fra le mura serviane, la via Flaminia e il Tevere: la parte del Campo Marzio a ovest della via Lata.',
  mon:['*pompeo','*marcello','*balbo','*domiziano','*pantheon','*pantheonpiazza','*pantheonchiesa','*termeagrippa','*termenerone','*tempioadriano','*colonnamarco','*iseo','saepta','argentina','ottavia','apollo','bellona','orologio','augusto','arcovalentiniano','olitorio'], bordo:[], ancore:[]},
 {n:'X', it:'Palatino', la:'Palatium', cat:[2742,89,48,44,90,20], cur:{0:2642,4:89},
  cosa:'Il Palatino, nei limiti che Tacito (Annali XII 24) dà al primo pomerio.',
  mon:['*palatino','*settizodio','*magnamater','*tiberiana'], bordo:['arcocostantino'], ancore:[[15,42],[25,35],[5,49],[20,49],[10,35]]},      // il Settizodio è nel catalogo della X («Septizonium divi Severi»)
 {n:'XI', it:'Circo Massimo', la:'Circus Maximus', cat:[2500,88,16,15,20,16], cur:{0:2600,1:89},
  cosa:'Molto irregolare: il Circo Massimo e il terreno fra il Tevere e le regioni IX, VIII, X, XII e XIII, col Foro Boario.',
  mon:['circo','obelisco357','fiaccola357','fangocirco','*foroboario'], bordo:[], ancore:[[-22,56],[22,86]],
  nota:'Il catalogo nomina qui un «arcum divi Constantini»; l\'arco del modello sta dove si incontrano le regioni I, II, III, IV e X: le pagine lette non sciolgono la cosa.'},
 {n:'XII', it:'Piscina Pubblica', la:'Piscina Publica', cat:[2487,113,27,63,80,25], cur:{4:81},
  cosa:'La parte est dell\'Aventino. Confinava con la via Appia, con la regione I, con le mura aureliane e con due vicoli, quello della porta Raudusculana e quello della Piscina Pubblica. Il nome è quello di un antico quartiere con una grande vasca pubblica.',
  mon:['*caracalla'], bordo:[], ancore:[[26,128],[25,160]]},
 {n:'XIII', it:'Aventino', la:'Aventinus', cat:[2487,130,35,44,89,20], cur:{3:60},
  cosa:'L\'Aventino e la zona a sud, fra la regione XII, la XI, le mura aureliane e il Tevere, con l\'Emporio sul fiume.',
  mon:['sabina','emporio','testaccio'], bordo:['piramide'], ancore:[[-42,96],[-25,118],[-40,150],[-15,170]]},
 {n:'XIV', it:'Trastevere', la:'Transtiberim', cat:[4405,150,22,86,180,24],
  cosa:'Tutta la riva destra del Tevere con l\'isola Tiberina. I limiti non si possono determinare: andava molto oltre le mura aureliane, a sud fino al tempio di Fors Fortuna, a nord fino al Vaticano. Sulla scena, fuori dalle mura, la tinta sfuma senza bordo.',
  mon:['*pietro','*tegolepietro','*obeliscovaticano','esculapio','adriano','adrianostatue','metaromuli','porticopietro','campanilepietro','episcopiapietro','monasteripietro','monasteripietro2','andreapietro','petronilla','scholae','scholae2','ospizionaumachia','leonine'], bordo:['mulini'], ancore:[],
  luoghi:'Il catalogo nomina anche il Gianicolo e i mulini («molinas»): sono i mulini del Gianicolo, non quelli sulle barche del modello, che stanno sul confine del Tevere.'}
];
/* dove il modello non dà un monumento con un nome (parti di altri gruppi), le coordinate stanno nell'elenco M di js/monumenti.js */
var POS={dolabella:[81.9,76.6], eurisace:[248.7,11.9], curia:[.8,-5.1], campidoglio:[-15,-14], augusto:[-74,-151]};
var CAT=['insulae','domus','horrea (magazzini)','balnea (bagni)','lacus (fontane)','pistrina (forni)'];

/* ---------- i quartieri con un nome antico (regioni-fonti.md, tabella 3) ----------
   p: dove sta il nome sulla scena (posto approssimato, dalle descrizioni della voce e dai colli del modello); r: regione; t: che cosa dice la fonte.
   Esquiliae e Transtiberim hanno il nome delle regioni V e XIV; campus Agrippae, campus Viminalis subager e Mica Aurea non hanno un posto noto: stanno nelle schede delle regioni. */
var QUARTIERI=[
 {n:'Suburra', la:'Subura', p:[56,-34], r:'IV', t:'La valle fra il Viminale e l\'Oppio, dall\'Argileto al clivo Suburano; il catalogo della IV regione la nomina. Fitta e rumorosa: «regione frequentissima» per un antico commento a Giovenale (XI 51), «clamosa» per Marziale (XII 18, 2), sporca e fangosa (Marziale V 22). Venditori di cibo e di cose fini (Giovenale XI 141), artigiani, prostitute (Persio, Marziale). Svetonio dice che Cesare vi abitò (Cesare 46).'},
 {n:'Velabro', la:'Velabrum', p:[-12,24], r:'VIII / XI', t:'Il terreno basso fra il Palatino e il Campidoglio, verso il Foro Boario: la linea della regione VIII lo attraversa, il catalogo della XI lo nomina. Un tempo palude (Varrone, Ovidio, Properzio), prosciugata dalla Cloaca Massima ma ancora allagata dalle piene. Botteghe di cibo, olio e vino, molto frequentate (Macrobio I 10, 15).'},
 {n:'Carine', la:'Carinae', p:[44,-6], r:'III / IV', t:'La punta ovest dell\'Oppio, sui pendii verso la Suburra e verso il Colosseo, al confine fra la III e la IV regione. «Celeberrima pars urbis» per Floro (II 18, 4): case di grandi famiglie in età repubblicana; Pompeo e poi Tiberio abitarono nella stessa casa (Svetonio, Tiberio 15).'},
 {n:'Velia', la:'Velia', p:[31,13], r:'IV', t:'Lo sperone fra il Palatino e l\'Oppio, più tardi detto Summa Sacra Via, segnato dall\'arco di Tito; nella IV regione, perché questa comprende la via Sacra. La posizione è discussa: per Platner e Ashby è una congettura.'},
 {n:'Argileto', la:'Argiletum', p:[30,-17], r:'IV / VIII', strada:1, t:'La strada dalla Suburra al Foro, fra la IV e la VIII regione.'},
 {n:'Campo Marzio', la:'Campus Martius', p:[-90,-120], r:'IX', t:'La pianura fra Campidoglio, Quirinale, Pincio e Tevere, circa 250 ettari; il catalogo della IX regione la nomina, mentre la parte a est della via Lata sta nella VII. Senza grandi edifici fino alla fine della Repubblica, poi circhi, teatri, portici, terme e templi (Strabone V 3, 8). Dopo le invasioni la gente si raccoglie qui (Platner e Ashby).'},
 {n:'Capo d\'Africa', la:'Caput Africae', p:[110,55], r:'II', t:'La parte est, più piccola, del Celio, dove stanno i Santi Quattro Coronati; il catalogo della II regione nomina il «caput Africae». Cicerone chiama «Caeliculus» il piccolo Celio. Il Celio fu molto abitato in età repubblicana, poi zona di case ricche e giardini.'},
 {n:'Emporio', la:'Emporium', p:[-98,120], r:'XIII', t:'Sulla riva sinistra del Tevere fuori porta Trigemina, fra il fiume e i magazzini di Galba; nella XIII regione (dedotto). Fondato nel 193 a.C. e lastricato nel 174 a.C. (Livio); poi scalo dei marmi.'},
 {n:'Gianicolo', la:'Ianiculum', p:[-176,28], r:'XIV', t:'Il colle sulla riva destra; il catalogo della XIV regione lo nomina insieme ai mulini.'},
 {n:'Vaticano', la:'Vaticanum', p:[-232,-136], r:'XIV', t:'La pianura fra il Gianicolo, Monte Mario e il Tevere; il catalogo della XIV la nomina. In parte malsana (Tacito, Storie II 93), con tombe lungo la strada e gente povera (Ammiano XXVII 3, 6). Il nome passò al circo di Gaio e Nerone.'}
];
var NOTA='Confini ricostruiti dagli studiosi: le fonti antiche danno solo gli elenchi dei monumenti di ogni regione.';

/* ---------- la pianta: a ogni cella di 20 m la sua regione ---------- */
/* tavolozza di Okabe e Ito (fatta per chi non distingue i colori), in ordine di distanza: le prime tinte sono le più diverse fra loro; due regioni vicine non hanno mai la stessa */
var TINTE=[[0,114,178],[230,159,0],[204,121,167],[86,180,233],[0,158,115],[240,228,66],[213,94,0]];      // il verde viene tardi: sul prato del modello il blu e il verde, trasparenti, sembravano uguali
function calcola(T,pos,isola){
  var C=2, X0=-320, Z0=-260, NX=310, NZ=310, NC=NX*NZ, i, j, k, c;
  var lab=new Int8Array(NC).fill(-1), den=new Uint8Array(NC), alfa=new Float32Array(NC);
  function cx(i){ return X0+(i+.5)*C; } function cz(j){ return Z0+(j+.5)*C; }
  /* dentro le mura aureliane: scansione per righe */
  var Mu=T.mura;
  for(j=0;j<NZ;j++){ var z=cz(j), xs=[];
    for(i=0,k=Mu.length-1;i<Mu.length;k=i++){ var a=Mu[i], b=Mu[k]; if((a[1]>z)!==(b[1]>z)) xs.push(a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1])); }
    xs.sort(function(p,q){ return p-q; });
    for(k=0;k+1<xs.length;k+=2){ var i0=Math.max(0,Math.ceil((xs[k]-X0)/C-.5)), i1=Math.min(NX-1,Math.floor((xs[k+1]-X0)/C-.5)); for(i=i0;i<=i1;i++) den[j*NX+i]=1; } }
  /* la linea più vicina: distanza, lato (segno), parametro (fuori dai capi: false) */
  function vicino(L,x,z){ var m=1e9, s=0, fuori=false, n=L.length;
    for(var q=0;q<n-1;q++){ var ax=L[q][0], az=L[q][1], dx=L[q+1][0]-ax, dz=L[q+1][1]-az, l2=dx*dx+dz*dz||1, t=((x-ax)*dx+(z-az)*dz)/l2, tc=Math.max(0,Math.min(1,t)), d=Math.hypot(ax+dx*tc-x,az+dz*tc-z);
      if(d<m){ m=d; s=dx*(z-az)-dz*(x-ax); fuori=(q===0&&t<0)?1:(q===n-2&&t>1)?2:0; } }
    return {d:m, s:s>0?1:-1, fuori:fuori}; }
  function distPoli(P,x,z){ var m=1e9; for(var q=0,r=P.length-1;q<P.length;r=q++){ var ax=P[r][0], az=P[r][1], dx=P[q][0]-ax, dz=P[q][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)), d=Math.hypot(ax+dx*t-x,az+dz*t-z); if(d<m) m=d; } return m; }
  /* il tratto della strada del modello più vicina a due punti (come in js/strade-nomi.js) */
  function tratto(a,b){ var meglio=null;
    T.strade.forEach(function(L){ var pa=piede(L,a), pb=piede(L,b), d=pa.d+pb.d; if(!meglio||d<meglio.d) meglio={d:d,L:L,ka:pa,kb:pb}; });
    var L=meglio.L, ka=meglio.ka, kb=meglio.kb, inv=ka.s>kb.s; if(inv){ var t=ka; ka=kb; kb=t; }
    var out=[ka.p]; for(var q=ka.k+1;q<=kb.k;q++) out.push(L[q]); out.push(kb.p); if(inv) out.reverse(); return out; }
  function piede(L,p){ var m=1e9, r=null; for(var q=0;q<L.length-1;q++){ var ax=L[q][0], az=L[q][1], dx=L[q+1][0]-ax, dz=L[q+1][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((p[0]-ax)*dx+(p[1]-az)*dz)/l2)), d=Math.hypot(ax+dx*t-p[0],az+dz*t-p[1]);
      if(d<m){ m=d; r={d:d,k:q,s:q+t,p:[ax+dx*t,az+dz*t]}; } } return r; }
  /* i confini che sono un'opera vera (regioni-fonti.md, punto 2); vieta: regioni escluse dal lato del punto p (A) e dall'altro (B) */
  var R={}; REGIONI.forEach(function(g,q){ R[g.n]=q; });
  function rr(s){ return s.split(' ').map(function(n){ return R[n]; }); }
  var clivo=tratto([62,-27],[140,-28]);
  var VINC=[
    {nome:'via Lata', L:tratto([-22,-37],[-77,-211]), p:[-70,-68], A:rr('VI VII'), B:rr('IX'), banda:80, vera:1, aperta:1},      // aperta: oltre il capo nord la linea prosegue fino alle mura (porta Flaminia),
    {nome:'via Appia', L:tratto([43,96],[139,228]), p:[59,150], A:rr('I II'), B:rr('XII XIII'), banda:45, vera:1},
    {nome:'clivo Suburano', L:clivo, p:[100,-6], A:rr('IV'), B:rr('III'), banda:30, vera:1},
    {nome:'prolungamento del clivo Suburano', L:[[46,28]].concat(clivo), p:[100,-6], A:rr('IV'), B:rr('III'), banda:30},
    {nome:'vico Patricio', L:tratto([61,-25],[96,-77]), p:[108,-55], A:rr('VI'), B:rr('IV'), banda:25, vera:1},
    {nome:'strada dal Colosseo alla porta Asinaria', L:tratto([66,34],[196,79]), p:[95,88], A:rr('III IV V'), B:rr('I II'), banda:30, vera:1}
  ];
  VINC.forEach(function(v){ v.sA=vicino(v.L,v.p[0],v.p[1]).s; v.mA=0; v.mB=0; v.A.forEach(function(r){ v.mA|=1<<r; }); v.B.forEach(function(r){ v.mB|=1<<r; }); });
  /* i semi: monumenti della regione (non quelli sul confine) e punti d'appoggio */
  var semi=[];
  REGIONI.forEach(function(g,r){ if(g.n==='XIV') return;
    g.mon.forEach(function(id){ id=id.replace('*',''); if(id==='antoniniano') return;      // l'acquedotto attraversa più regioni: il suo punto nel modello non dice dove
      var p=pos(id); if(p) semi.push([p[0],p[1],r]); });
    g.ancore.forEach(function(p){ semi.push([p[0],p[1],r]); }); });
  /* il Tevere: lato della riva destra preso da San Pietro */
  var F=T.fiume, destra=vicino(F,-259,-108).s, XIV=R.XIV, LARGO=5.6;
  for(j=0;j<NZ;j++) for(i=0;i<NX;i++){
    c=j*NX+i; var x=cx(i), z=cz(j), f=vicino(F,x,z);
    if(isola(x,z)){ lab[c]=XIV; alfa[c]=1; den[c]=1; continue; }
    if(f.d<LARGO) continue;                                     // l'acqua: nessuna regione, il fiume è il confine
    if(f.s===destra){
      if(den[c]){ lab[c]=XIV; alfa[c]=1; continue; }
      var dm=distPoli(Mu,x,z); if(dm<110){ var u=dm/110; lab[c]=XIV; alfa[c]=(1-u)*(1-u)*.9; }      // fuori dalle mura la XIV sfuma, senza bordo
      continue; }
    if(!den[c]) continue;
    var vieta=0;
    for(k=0;k<VINC.length;k++){ var v=VINC[k], w=vicino(v.L,x,z); if((w.fuori&&!(w.fuori===2&&v.aperta))||w.d>v.banda) continue; vieta|=(w.s===v.sA?v.mA:v.mB); }
    var m=1e9, r=-1;
    for(k=0;k<semi.length;k++){ var s=semi[k]; if(vieta&(1<<s[2])) continue; var d=(s[0]-x)*(s[0]-x)+(s[1]-z)*(s[1]-z); if(d<m){ m=d; r=s[2]; } }
    lab[c]=r; alfa[c]=1; }
  /* i bordi fra celle diverse, raccolti per coppia di regioni */
  var gruppi={};
  function lato(c1,c2,i1,j1,i2,j2){ var a=lab[c1], b=lab[c2]; if(a===b) return; var t;
    if(a<0||b<0){ var dentro=a<0?c2:c1; if(!den[dentro]) return; t='bordo'; } else t='interno';
    var ch=Math.min(a,b)+'|'+Math.max(a,b), g=gruppi[ch]||(gruppi[ch]={tipo:t,lati:[]}); g.lati.push([i1,j1,i2,j2]); }
  for(j=0;j<NZ;j++) for(i=0;i<NX;i++){ c=j*NX+i;
    if(i<NX-1) lato(c,c+1,i+1,j,i+1,j+1);
    if(j<NZ-1) lato(c,c+NX,i,j+1,i+1,j+1); }
  var linee=[], vicini={};
  Object.keys(gruppi).forEach(function(ch){ var g=gruppi[ch], per={}, usato=new Uint8Array(g.lati.length);
    var ab=ch.split('|').map(Number); if(ab[0]>=0){ (vicini[ab[0]]=vicini[ab[0]]||{})[ab[1]]=1; (vicini[ab[1]]=vicini[ab[1]]||{})[ab[0]]=1; }
    function kv(i,j){ return i*1024+j; }
    g.lati.forEach(function(e,q){ [kv(e[0],e[1]),kv(e[2],e[3])].forEach(function(K){ (per[K]=per[K]||[]).push(q); }); });
    function cammina(q,K){ var out=[]; while(true){ var l=per[K]; if(!l||l.length!==2) break; var nq=l[0]===q?l[1]:l[0]; if(usato[nq]) break; usato[nq]=1; var e=g.lati[nq], K2=kv(e[0],e[1])===K?kv(e[2],e[3]):kv(e[0],e[1]); out.push(K2); q=nq; K=K2; } return out; }
    g.lati.forEach(function(e,q){ if(usato[q]) return; usato[q]=1; var K1=kv(e[0],e[1]), K2=kv(e[2],e[3]);
      var avanti=cammina(q,K2), indietro=cammina(q,K1), ks=indietro.reverse().concat([K1,K2],avanti);
      var pts=ks.map(function(K){ return [X0+Math.floor(K/1024)*C, Z0+(K%1024)*C]; });
      if(pts.length>=3) linee.push({tipo:g.tipo, p:pts}); }); });
  /* le linee fra due regioni: vere dove corrono lungo una delle strade di confine (lì si disegna la strada), ricostruite altrove */
  var VERE=VINC.filter(function(v){ return v.vera; }), fuori=[];
  linee.forEach(function(l){
    if(l.tipo==='bordo'){ fuori.push({tipo:'vera', p:liscia(semplifica(l.p,1.1),2)}); return; }
    var run=[], vq=-2;
    function chiudi(){ if(run.length>=2){ if(vq>=0) fuori.push({tipo:'vera', p:run.map(function(p){ return proietta(VERE[vq].L,p); })}); else fuori.push({tipo:'ric', p:liscia(semplifica(run,1.6),3)}); } }
    l.p.forEach(function(p){ var qq=-1; for(var q=0;q<VERE.length;q++){ var w=vicino(VERE[q].L,p[0],p[1]); if(!w.fuori&&w.d<3.6){ qq=q; break; } }
      if(qq!==vq && run.length){ var ultimo=run[run.length-1]; chiudi(); run=[ultimo]; } vq=qq; run.push(p); });
    chiudi(); });
  /* tinte: colorazione golosa del grafo delle regioni vicine */
  var col=new Int8Array(14).fill(-1), ordine=REGIONI.map(function(g,q){ return q; }).sort(function(a,b){ return Object.keys(vicini[b]||{}).length-Object.keys(vicini[a]||{}).length; });
  ordine.forEach(function(r){ var preso={}; Object.keys(vicini[r]||{}).forEach(function(q){ if(col[q]>=0) preso[col[q]]=1; }); for(var t=0;t<TINTE.length;t++) if(!preso[t]){ col[r]=t; break; } });
  /* il centro di ogni regione: la cella più lontana dai suoi bordi (per la XIV dentro le mura) */
  var dist=new Float32Array(NC); for(c=0;c<NC;c++) dist[c]=(lab[c]<0)?0:1e9;
  function bordoC(c,c2){ return lab[c2]!==lab[c]||(lab[c]===XIV&&!den[c2]); }
  for(j=0;j<NZ;j++) for(i=0;i<NX;i++){ c=j*NX+i; if(dist[c]===0) continue;
    if(i===0||j===0||bordoC(c,c-1)||bordoC(c,c-NX)) dist[c]=1; else dist[c]=Math.min(dist[c],dist[c-1]+1,dist[c-NX]+1,dist[c-NX-1]+1.414,(i<NX-1?dist[c-NX+1]+1.414:1e9)); }
  for(j=NZ-1;j>=0;j--) for(i=NX-1;i>=0;i--){ c=j*NX+i; if(dist[c]===0) continue;
    if(i===NX-1||j===NZ-1||bordoC(c,c+1)||bordoC(c,c+NX)) dist[c]=Math.min(dist[c],1); else dist[c]=Math.min(dist[c],dist[c+1]+1,dist[c+NX]+1,dist[c+NX+1]+1.414,(i>0?dist[c+NX-1]+1.414:1e9)); }
  var centri=REGIONI.map(function(){ return null; }), posti=REGIONI.map(function(){ return []; }), cand=[];
  for(c=0;c<NC;c++){ if(lab[c]>=0&&den[c]&&dist[c]>=3) cand.push(c); }
  cand.sort(function(a,b){ return dist[b]-dist[a]; });
  /* altri posti per il nome, se il primo è coperto dai nomi dei monumenti: punti ben dentro la regione, lontani fra loro almeno 24 unità */
  cand.forEach(function(c){ var r2=lab[c], L=posti[r2]; if(L.length>=6) return; if(L.length && dist[c]<L[0][2]*.45) return;
    var x=cx(c%NX), z=cz(Math.floor(c/NX)); for(var q=0;q<L.length;q++) if(Math.hypot(L[q][0]-x,L[q][1]-z)<24) return; L.push([x,z,dist[c]]); });
  posti.forEach(function(L,r2){ if(L.length) centri[r2]=L[0]; });
  return {C:C, X0:X0, Z0:Z0, NX:NX, NZ:NZ, lab:lab, alfa:alfa, den:den, linee:fuori, tinte:col, centri:centri, posti:posti, vincoli:VINC};
  function proietta(L,p){ var m=1e9, r=p; for(var q=0;q<L.length-1;q++){ var ax=L[q][0], az=L[q][1], dx=L[q+1][0]-ax, dz=L[q+1][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((p[0]-ax)*dx+(p[1]-az)*dz)/l2)), qx=ax+dx*t, qz=az+dz*t, d=Math.hypot(qx-p[0],qz-p[1]); if(d<m){ m=d; r=[qx,qz]; } } return r; }
}
/* Douglas e Peucker, poi Chaikin: dalla scala di celle a una linea morbida */
function semplifica(P,tol){ if(P.length<3) return P.slice(); var tiene=new Uint8Array(P.length); tiene[0]=tiene[P.length-1]=1;
  (function dp(a,b){ var m=0, k=-1, ax=P[a][0], az=P[a][1], dx=P[b][0]-ax, dz=P[b][1]-az, l=Math.hypot(dx,dz)||1;
    for(var q=a+1;q<b;q++){ var d=Math.abs(dx*(P[q][1]-az)-dz*(P[q][0]-ax))/l; if(d>m){ m=d; k=q; } }
    if(m>tol){ tiene[k]=1; dp(a,k); dp(k,b); } })(0,P.length-1);
  return P.filter(function(p,q){ return tiene[q]; }); }
function liscia(P,volte){ for(var v=0;v<volte;v++){ if(P.length<3) return P; var Q=[P[0]];
    for(var q=0;q<P.length-1;q++){ var a=P[q], b=P[q+1]; Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]); }
    Q.push(P[P.length-1]); P=Q; } return P; }

window.RM_REGIONI={REGIONI:REGIONI, QUARTIERI:QUARTIERI, TINTE:TINTE, POS:POS, calcola:calcola};      // anche per le prove fuori dalla pagina (node)
var RM=window.RM; if(!RM || RM.guasto || !window.RM_TOPO || !RM.camera || !window.THREE) return;
var D=window.RM_DATI||{};

/* ---------- interruttore ---------- */
var acceso=false; try{ acceso=sessionStorage.getItem('rm-regioni')==='1'; }catch(e){}
if(/[?&]regioni=1/.test(location.search)) acceso=true;
var btn=document.getElementById('btnRegioni');
function scriviBtn(){ if(btn) btn.setAttribute('aria-pressed',acceso?'true':'false'); }
scriviBtn();
if(btn) btn.addEventListener('click',function(){ acceso=!acceso; scriviBtn(); try{ sessionStorage.setItem('rm-regioni',acceso?'1':'0'); }catch(e){} if(!acceso){ spegni(); chiudi(); } ultimo=''; });
if(acceso && RM.segnaStrumenti) setTimeout(RM.segnaStrumenti,0);

/* ---------- la pianta, la trama e la maglia (la prima volta che serve) ---------- */
var P=null, maglia=null, mat=null;
function pos(id){ var m=(RM.MONUMENTI||[]).filter(function(o){ return o.id===id; })[0]; return m&&m.x!=null?[m.x,m.z]:POS[id]; }
function prepara(){
  if(P) return true; var h=RM.hSuolo||RM.h; if(!h) return false;
  var isola=RM.isolaTiberina?RM.isolaTiberina.dentro:function(){ return false; };
  P=calcola(RM_TOPO,pos,isola);
  /* la trama: tinte sfumate (la pianta di 310 celle ingrandita con l'interpolazione del disegno) e le linee */
  var lato=(RM.livello!=null&&RM.livello<1)||window.innerWidth<=700?1024:2048, k=lato/(P.NX*P.C);
  var pic=document.createElement('canvas'); pic.width=P.NX; pic.height=P.NZ; var pc=pic.getContext('2d'), im=pc.createImageData(P.NX,P.NZ), d=im.data;
  for(var c=0;c<P.lab.length;c++){ var r=P.lab[c]; if(r<0) continue; var t=TINTE[P.tinte[r]]; d[c*4]=t[0]*.9+20; d[c*4+1]=t[1]*.9+20; d[c*4+2]=t[2]*.9+20; d[c*4+3]=Math.round(255*.36*P.alfa[c]); }      // tinte quiete: appena schiarite; la trasparenza la regola mat.opacity
  pc.putImageData(im,0,0);
  var tela=document.createElement('canvas'); tela.width=tela.height=lato; var g=tela.getContext('2d');
  g.imageSmoothingEnabled=true; g.drawImage(pic,0,0,lato,lato);
  g.lineCap='round'; g.lineJoin='round';
  function traccia(l){ g.beginPath(); l.p.forEach(function(p,q){ var x=(p[0]-P.X0)*k, y=(p[1]-P.Z0)*k; if(q) g.lineTo(x,y); else g.moveTo(x,y); }); g.stroke(); }
  /* prima un alone chiaro, poi la linea scura: si legge sui tetti e sul verde */
  var sp=Math.max(1,2.2/k);      // con la trama piccola (telefono) le linee non scendono sotto i 2 pixel della trama
  P.linee.forEach(function(l){ g.setLineDash(l.tipo==='ric'?[8*k,6*k]:[]); g.strokeStyle='rgba(255,248,232,.45)'; g.lineWidth=2.8*k*sp; traccia(l); });
  P.linee.forEach(function(l){ g.setLineDash(l.tipo==='ric'?[8*k,6*k]:[]); g.strokeStyle=l.tipo==='ric'?'rgba(52,34,20,.8)':'rgba(52,34,20,.9)'; g.lineWidth=(l.tipo==='ric'?1.5:1.8)*k*sp; traccia(l); });
  var tex=new THREE.CanvasTexture(tela); tex.anisotropy=Math.min(4,RM.renderer.capabilities.getMaxAnisotropy?RM.renderer.capabilities.getMaxAnisotropy():1);
  /* la maglia: un velo sul terreno, solo dove c'è qualcosa da disegnare; passo di 4 unità */
  var PASSO=4, N=Math.round(P.NX*P.C/PASSO), pos3=[], uv=[], idx=[], quale={};
  function vert(a,b){ var K=a*1000+b; if(quale[K]!=null) return quale[K]; var x=P.X0+a*PASSO, z=P.Z0+b*PASSO; quale[K]=pos3.length/3; pos3.push(x,h(x,z)+.3,z); uv.push(a/N,1-b/N); return quale[K]; }
  function pieno(a,b){ var ci=Math.floor(a*PASSO/P.C), cj=Math.floor(b*PASSO/P.C);      // c'è tinta o linea nelle celle attorno
    for(var dj=-2;dj<=3;dj++) for(var di=-2;di<=3;di++){ var ii=ci+di, jj=cj+dj; if(ii<0||jj<0||ii>=P.NX||jj>=P.NZ) continue; var cc=jj*P.NX+ii; if(P.lab[cc]>=0&&(P.den[cc]||P.alfa[cc]>.02)) return true; } return false; }
  for(var b=0;b<N;b++) for(var a=0;a<N;a++){ if(!pieno(a,b)) continue; var v0=vert(a,b), v1=vert(a+1,b), v2=vert(a,b+1), v3=vert(a+1,b+1); idx.push(v0,v2,v1,v1,v2,v3); }
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos3,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx);
  mat=new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false, depthTest:false, fog:false, toneMapped:false});      // sopra tutto, come un foglio trasparente: col terreno solo, le case fitte coprivano la tinta e la città non si leggeva divisa
  maglia=new THREE.Mesh(geo,mat); maglia.renderOrder=6; maglia.frustumCulled=false; maglia.visible=false; RM.scene.add(maglia);
  return true; }

/* ---------- scritte ---------- */
var riquadro=document.getElementById('scena').parentNode, strato=document.createElement('div'); strato.className='regioni3d';
var etM=riquadro.querySelector('.etichette3d'); riquadro.insertBefore(strato,etM||null);
var nota=document.createElement('p'); nota.className='rg-nota'; nota.hidden=true; nota.textContent=NOTA; riquadro.appendChild(nota);
var scritte=[];
function faiScritte(){
  if(scritte.length) return;
  REGIONI.forEach(function(g,r){ var b=document.createElement('button'); b.type='button'; b.className='rg-nome';
    b.innerHTML='<b>'+g.n+'</b> · '+g.it+(g.la!==g.it?'<small>'+g.la+'</small>':''); b.setAttribute('aria-label','Regione '+g.n+', '+g.it+': apri la scheda');
    b.addEventListener('click',function(){ apri(r); }); strato.appendChild(b);
    scritte.push({el:b, r:r, tipo:'r'}); });
  QUARTIERI.forEach(function(q,i){ var b=document.createElement('button'); b.type='button'; b.className='rg-q'; b.textContent=q.n; b.setAttribute('aria-label',q.n+': che cosa dicono le fonti');
    b.addEventListener('click',function(){ apriQ(i); }); strato.appendChild(b);
    scritte.push({el:b, q:i, tipo:'q'}); });
}
function spegni(){ scritte.forEach(function(s){ if(s.vis){ s.vis=false; s.el.style.visibility='hidden'; s.el.style.opacity=0; } }); if(maglia) maglia.visible=false; nota.hidden=true; }

var anno=300; RM.moduli.push(function(a){ anno=a; ultimo=''; if(aperta) scriviScheda(); });
var v=new THREE.Vector3(), ultimo='', conta=0, capi=false, ostacoli=[], firmaOst='';
var SOPRA='.strumenti .apri, .strumenti .voci, .comandi-scena, .evento, .ev-i, .conta, .scheda, .riga-tempo, .legenda-sapere, .esplora, .rg-nota';
function tocca(a,b){ return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]; }
RM.frame.push(function(){
  if(!acceso) return;
  var w=riquadro.clientWidth, hh=riquadro.clientHeight, grande=document.body.classList.contains('roma-grande');
  if((conta++)%6===0){ capi=false; var cp=document.querySelector('.capi3d'); if(cp){ for(var i=0;i<cp.children.length;i++) if(cp.children[i].style.display==='block'){ capi=true; break; } }
    if(w){ ostacoli=[]; var rq=riquadro.getBoundingClientRect(), el=riquadro.querySelectorAll(SOPRA);
      for(i=0;i<el.length;i++){ if(el[i]===nota&&nota.hidden) continue; var bb=el[i].getBoundingClientRect(); if(!bb.width||!bb.height) continue; var cs=getComputedStyle(el[i]); if(cs.visibility==='hidden'||+cs.opacity<.05) continue;
        ostacoli.push([bb.left-rq.left-4,bb.top-rq.top-4,bb.right-rq.left+4,bb.bottom-rq.top+4]); }
      var tp=grande&&document.querySelector('.tempo'); if(tp){ var bt=tp.getBoundingClientRect(); if(bt.height) ostacoli.push([0,bt.top-rq.top-6,w,hh]); }      // a tutto schermo la linea del tempo sta sopra la scena
      firmaOst=ostacoli.map(function(q){ return q.map(Math.round).join(','); }).join(';'); } }
  var dT=RM.camera.position.distanceTo(RM.controlli.target);
  var via=!w || !hh || (window.innerWidth<=700 && !grande) || document.body.classList.contains('impero-grande') || capi || dT<30;
  if(via){ if(ultimo!=='via'){ spegni(); ultimo='via'; } return; }
  if(!P){ if(!prepara()) return; faiScritte(); }
  if(!maglia.visible){ maglia.visible=true; }
  var n=RM.notte||0; mat.color.setRGB(1-.55*n,1-.55*n,1-.5*n); mat.opacity=.5+.5*RM.sfuma(70,260,dT);      // da vicino il foglio si fa più leggero: contano gli edifici
  if(nota.hidden){ nota.hidden=false; firmaOst=''; }
  var senzaNomi=etM && etM.style.display==='none';
  var e=RM.camera.matrixWorld.elements, firma=w+'|'+hh+'|'+e[12].toFixed(1)+'|'+e[13].toFixed(1)+'|'+e[14].toFixed(1)+'|'+e[8].toFixed(3)+'|'+e[9].toFixed(3)+'|'+e[10].toFixed(3)+'|'+(RM.etichetteMesse?RM.etichetteMesse.length:0)+'|'+firmaOst+'|'+strade();
  if(firma===ultimo) return; ultimo=firma;
  var inv=RM.camera.matrixWorldInverse, h=RM.hSuolo||RM.h, cand=[], t=RM.controlli.target, stradeOn=RM.nomiStrade&&RM.nomiStrade.acceso();
  scritte.forEach(function(s){ s.prossimo=null; if(senzaNomi) return;
    var lista;
    if(s.tipo==='r'){ if(dT<70) return; lista=P.posti[s.r]; if(!lista||!lista.length) return; }
    else { var q=QUARTIERI[s.q]; if(dT>330) return; if(q.strada&&stradeOn) return; lista=[q.p]; }      // l'Argileto, se ci sono i nomi delle strade, è già scritto
    var pts=[];
    lista.forEach(function(p){ v.set(p[0],h(p[0],p[1])+2,p[1]).applyMatrix4(inv); if(!(v.z<-2&&-v.z<2200)) return;
      v.set(p[0],h(p[0],p[1])+2,p[1]).project(RM.camera); if(v.z>=1||Math.abs(v.x)>.92||v.y<-.9||v.y>.9) return;
      pts.push({x:(v.x+1)*w/2, y:(1-v.y)*hh/2}); });
    if(!pts.length) return;
    if(!s.lw){ s.lw=s.el.offsetWidth||80; s.lh=s.el.offsetHeight||18; s.lwG=grande; } else if(s.lwG!==grande){ s.lw=s.el.offsetWidth||s.lw; s.lh=s.el.offsetHeight||s.lh; s.lwG=grande; }
    var p0=lista[0]; cand.push({s:s, pts:pts, d:Math.hypot(p0[0]-t.x,p0[1]-t.z)+(s.tipo==='r'?0:dT>200?60:-30)}); });
  cand.sort(function(a,b){ return a.d-b.d; });
  var messi=(RM.etichetteMesse||[]).concat(ostacoli,rettiStrade());
  /* prima il posto migliore della regione, poi gli altri; per ciascuno, piccoli spostamenti */
  cand.forEach(function(c){ var s=c.s, prove=[[0,0],[0,s.lh*.9],[0,-s.lh*.9],[s.lw*.35,0],[-s.lw*.35,0]];
    for(var i=0;i<c.pts.length&&!s.prossimo;i++) for(var k=0;k<prove.length;k++){ var x=c.pts[i].x+prove[k][0], y=c.pts[i].y+prove[k][1], rr=[x-s.lw/2-3,y-s.lh/2-2,x+s.lw/2+3,y+s.lh/2+2];
      if(rr[0]<4||rr[2]>w-4||rr[1]<4||rr[3]>hh-4) continue;
      var libero=true; for(var q=0;q<messi.length;q++) if(tocca(rr,messi[q])){ libero=false; break; }
      if(!libero) continue; messi.push(rr); s.prossimo={x:x, y:y}; break; } });
  scritte.forEach(function(s){ var p=s.prossimo;
    if(p){ s.el.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) translate(-50%,-50%)'; if(!s.vis){ s.vis=true; s.el.style.visibility='visible'; s.el.style.opacity=1; } }
    else if(s.vis){ s.vis=false; s.el.style.visibility='hidden'; s.el.style.opacity=0; } });
});
/* i nomi delle strade già messi (js/strade-nomi.js disegna prima): le scritte delle regioni li scansano */
function strade(){ if(!RM.nomiStrade||!RM.nomiStrade.acceso()) return ''; return RM.nomiStrade.nomi.map(function(o){ return o.prossimo?Math.round(o.prossimo.x)+','+Math.round(o.prossimo.y):''; }).join(';'); }
function rettiStrade(){ var out=[]; if(!RM.nomiStrade||!RM.nomiStrade.acceso()) return out;
  RM.nomiStrade.nomi.forEach(function(o){ var p=o.prossimo; if(!p||!o.lw) return; var a=p.a*Math.PI/180, cs=Math.abs(Math.cos(a)), sn=Math.abs(Math.sin(a)), mw=(cs*o.lw+sn*o.lh)/2+2, mh=(sn*o.lw+cs*o.lh)/2+2; out.push([p.x-mw,p.y-mh,p.x+mw,p.y+mh]); });
  return out; }

/* ---------- la scheda ---------- */
var scheda=document.createElement('aside'); scheda.className='scheda regione'; scheda.id='schedaRegione'; scheda.hidden=true; scheda.setAttribute('aria-live','polite'); riquadro.appendChild(scheda);
var aperta=null;      // {r} o {q}
function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function num(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
function nomeMon(id){ var m=(RM.MONUMENTI||[]).filter(function(o){ return o.id===id; })[0]; return m?m.nome:null; }
function presente(id){ if(!RM.statoMonumento) return true; var q=RM.statoMonumento(id,anno), st=q.t>.5?q.s1:q.s0; return st!=='assente'; }
function bottoni(ids){ var visti={}, out=[];
  ids.forEach(function(s){ var c=s.charAt(0)==='*', id=s.replace('*',''), nm=nomeMon(id); if(!nm||visti[nm]||!presente(id)) return; visti[nm]=1;      // parti dello stesso gruppo (la Curia e Sant'Adriano, Emilia e la sua rovina) hanno lo stesso nome
    out.push('<button type="button" data-id="'+id+'"'+(c?' class="cat" title="Nominato nel catalogo della regione"':'')+'>'+esc(nm)+'</button>'); });
  return out.join(''); }
function scriviScheda(){
  if(!aperta) return; var h='<button type="button" class="chiudi" aria-label="Chiudi la scheda">✕</button>';
  if(aperta.q!=null){ var q=QUARTIERI[aperta.q];
    h+='<p class="rg-tipo">Quartiere · regione '+esc(q.r)+'</p><h3>'+esc(q.n)+(q.la!==q.n?' <small>'+esc(q.la)+'</small>':'')+'</h3><p class="cosa">'+esc(q.t)+'</p>'+
       '<p class="rg-riserva">Nome antico attestato; il posto della scritta sulla scena è approssimato. Fonti in Platner e Ashby, <i>A Topographical Dictionary of Ancient Rome</i>.</p>';
    scheda.innerHTML=h; return; }
  var g=REGIONI[aperta.r], c=g.cat, cur=g.cur||{};
  function n(i){ return num(c[i])+(cur[i]!=null?' ('+num(cur[i])+')':''); }
  h+='<p class="rg-tipo">Regione di Augusto</p><h3><span class="rg-num" style="--rg:'+tinta(aperta.r)+'">'+g.n+'</span> '+esc(g.it)+(g.la!==g.it?' <small>'+esc(g.la)+'</small>':'')+'</h3>'+
     '<p class="cosa">'+esc(g.cosa)+'</p>'+(g.luoghi?'<p class="rg-luoghi">'+esc(g.luoghi)+'</p>':'')+(g.nota?'<p class="rg-luoghi">'+esc(g.nota)+'</p>':'')+
     '<h4>Nei cataloghi del IV secolo</h4><dl class="rg-cat">'+CAT.map(function(t,i){ return '<div><dt>'+t+'</dt><dd>'+n(i)+'</dd></div>'; }).join('')+'</dl>'+
     '<p class="rg-riserva">Numeri della <i>Notitia</i>; fra parentesi il <i>Curiosum</i>, dove è diverso. «Insula» qui è forse un\'unità d\'affitto, non un palazzo intero (Storey, 2001); ricopiati a mano per secoli, i numeri valgono come ordini di grandezza.</p>';
  var bm=bottoni(g.mon), bb=bottoni(g.bordo);
  if(bm||bb) h+='<h4>Monumenti del modello, nel '+Math.round(anno)+'</h4>'+(bm?'<p class="rg-mon">'+bm+'</p>':'')+(bb?'<p class="rg-bordo">Sul confine: </p><p class="rg-mon">'+bb+'</p>':'')+(bm&&/class="cat"/.test(bm)?'<p class="rg-riserva">Con il segno ◆ quelli nominati nel catalogo della regione; gli altri le sono assegnati dai confini che descrivono gli studiosi.</p>':'');
  if(RM.caseIn && P){ try{ var r=aperta.r, cs=RM.caseIn(anno,function(x,z){ return regioneIn(x,z)===r; });
      if(cs) h+='<p class="rg-case"><b>Nel modello, nel '+Math.round(anno)+':</b> '+num(cs.abitate||0)+' case abitate, '+num(cs.abbandonate||0)+' abbandonate, '+num(cs.rovine||0)+' in rovina'+(cs.domus!=null?'; fra quelle in piedi, '+num(cs.domus)+' domus e '+num(cs.insulae||0)+' insulae':'')+'. Quante e dove sono le singole case è uno schema del modello.</p>'; }catch(e){} }
  if(anno>=600) h+='<p class="rg-luoghi">Nel VII secolo la Chiesa divide la città in sette regioni: le pagine lette non ne danno la data né i confini, e la scena tiene le quattordici di Augusto.</p>';
  h+='<p class="rg-riserva">I nomi sono quelli dei cataloghi del IV secolo: in origine le regioni avevano solo il numero. '+NOTA+' Sono certi solo dove seguono le mura, il Tevere o una strada (linea continua); il resto è tratteggiato.</p>';
  scheda.innerHTML=h; }
function tinta(r){ if(!P) return '#999'; var t=TINTE[P.tinte[r]]; return 'rgb('+t.join(',')+')'; }
function regioneIn(x,z){ if(!P) return -1; var i=Math.floor((x-P.X0)/P.C), j=Math.floor((z-P.Z0)/P.C); if(i<0||j<0||i>=P.NX||j>=P.NZ) return -1; var c=j*P.NX+i; return P.den[c]||P.alfa[c]>.25?P.lab[c]:-1; }
function mostra(){ var sm=document.getElementById('scheda'); if(sm && !sm.hidden){ var ch=sm.querySelector('.chiudi'); if(ch) ch.click(); }
  scheda.hidden=false; scriviScheda(); scheda.scrollTop=0; riquadro.classList.add('con-scheda'); }      // con-scheda: come per i monumenti, la didascalia dell'evento si fa da parte (css/stile.css)
function apri(r){ aperta={r:r}; mostra(); }
function apriQ(i){ aperta={q:i}; mostra(); }
function chiudi(){ if(!aperta) return; aperta=null; scheda.hidden=true; var sm=document.getElementById('scheda'); if(!sm||sm.hidden) riquadro.classList.remove('con-scheda'); }
scheda.addEventListener('click',function(ev){ var t=ev.target.closest?ev.target.closest('button'):ev.target; if(!t) return;
  if(t.classList.contains('chiudi')){ chiudi(); return; }
  var id=t.getAttribute('data-id'); if(id && RM.apriScheda){ chiudi(); RM.apriScheda(id); } });
window.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && aperta){ chiudi(); ev.stopPropagation(); } },true);
/* aprendo un monumento (dalla scena o dall'elenco) la scheda della regione si chiude; il tocco che l'ha aperto non apre anche la regione */
var aprMon=0, apriM=RM.apriScheda;
if(apriM) RM.apriScheda=function(id){ aprMon=performance.now(); if(aperta) chiudi(); return apriM.apply(this,arguments); };

/* ---------- tocco sulla scena: fuori dai monumenti, apre la regione del punto toccato ---------- */
var tela=RM.renderer.domElement, giu=null, raggio=new THREE.Raycaster(), punto=new THREE.Vector2();
tela.addEventListener('pointerdown',function(ev){ giu={x:ev.clientX,y:ev.clientY,t:performance.now()}; });
tela.addEventListener('pointerup',function(ev){
  var fermo=giu && Math.hypot(ev.clientX-giu.x,ev.clientY-giu.y)<8 && performance.now()-giu.t<600; giu=null;
  if(!fermo || !acceso || !P || !maglia || !maglia.visible) return;
  if(performance.now()-aprMon<80) return;                                                           // ha già aperto un monumento (js/monumenti.js ascolta prima)
  if(document.body.classList.contains('tocco') && !document.body.classList.contains('roma-grande')) return;
  var r=tela.getBoundingClientRect(); punto.set((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height*2-1)); raggio.setFromCamera(punto,RM.camera);
  var o=raggio.ray.origin, d=raggio.ray.direction, h=RM.hSuolo||RM.h, t0=0, t1=-1, passo=3;
  for(var t=0;t<4000;t+=passo){ var x=o.x+d.x*t, y=o.y+d.y*t, z=o.z+d.z*t; if(y<h(x,z)){ t1=t; break; } t0=t; if(t>60) passo=6; }
  if(t1<0) return;
  for(var q=0;q<12;q++){ var tm=(t0+t1)/2; if(o.y+d.y*tm<h(o.x+d.x*tm,o.z+d.z*tm)) t1=tm; else t0=tm; }
  var reg=regioneIn(o.x+d.x*t1,o.z+d.z*t1); if(reg>=0) apri(reg);
});

RM.regioni={ acceso:function(){ return acceso; }, apri:function(n){ var r=REGIONI.map(function(g){ return g.n; }).indexOf(n); if(r>=0){ if(!P){ prepara(); faiScritte(); } apri(r); } }, apriQ:apriQ, chiudi:chiudi, pianta:function(){ return P; }, regioneIn:regioneIn };
var mq=/[?&]regione=([IVX]+)/.exec(location.search); if(mq) setTimeout(function(){ RM.regioni.apri(mq[1]); },1500);
})();
