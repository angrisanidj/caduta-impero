/* Chiese minori: titoli, diaconie, monasteri. Compaiono alla loro data e restano (salvo quelle con un anno di fine: Santa Maria Antiqua); attorno a ciascuna resiste un gruppo di case
   quando il resto della città si svuota (il peso è in RM.NUCLEI, base.js). I dati stanno in dati.js (CHIESE).
   Le chiese minori, una per una (28 novembre 2026; l'utente: le cose «con lo stampino» non vanno). Prima erano tutte la stessa chiesetta, girata a caso. Ora ogni chiesa è fatta
   di pezzi (MODULI qui sotto: aula a una navata, basilica a tre navate, abside, portico, atrio a quadriportico, chiostro di monastero, rotonda), messi a misura chiesa per chiesa,
   con le fasi che la fonte dà (una chiesa rifatta cambia forma nell'anno del rifacimento). Fonti: Armellini, Le chiese di Roma (1891), su LacusCurtius, rione per rione; Liber Pontificalis
   (Duchesne) dove già letto in RESTAURI (js/monumenti.js). Posto, asse e lato dell'abside: contorno di OpenStreetMap (src/roma/grezzi/q21.txt). Frasi e tabella «fonte / modello / scarto» in
   src/testi/topografia-fonti.md, «Le chiese minori, una per una». Niente campanili (sono del XII secolo), niente facciate né cupole moderne. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI, elenco=(D.CHIESE||[]).map(function(c){ var p=RM.ll(c[1],c[2]); return {nome:c[0],x:p[0],z:p[1],anno:c[3],tipo:c[4],fine:c[5]||1e4,p0:-1}; });
if(!elenco.length) return;

/* ---- I pezzi, in unità: pianta 1 x 1 (asse della navata lungo x, facciata a +x, abside a -x), alto 1 alla gronda; ogni istanza li porta alla misura della sua chiesa ---- */
function aula(B){      // aula a una navata: muri, tetto a due falde, finestre alte sui fianchi, porta in facciata
  B.scatola(1,1,1,0,0,0,P.mattone).falde(1.03,.3,1.06,0,1,0,P.coppi,0,P.mattone);
  B.aperture(-.4,.5,.4,.5,5,.62,.22,.06).aperture(.4,-.5,-.4,-.5,5,.62,.22,.06);
  B.vano(.505,0,0,0,1,.24,.56);
}
function basilica(B){      // tre navate: la mediana più alta col cleristorio, le laterali basse con tetto a uno spiovente; tre porte in facciata
  B.scatola(1,1,.5,0,0,0,P.mattone).falde(1.03,.2,.54,0,1,0,P.coppi,0,P.mattone);
  B.scatola(1,.56,.25,0,0,.375,P.mattone).scatola(1,.56,.25,0,0,-.375,P.mattone);
  [1,-1].forEach(function(s){ var y0=.56, y1=.68;      // tetto della navata laterale, dal muro della mediana in giù verso fuori
    B.quad([-.51,y1,.25*s],[.51,y1,.25*s],[.51,y0,.51*s],[-.51,y0,.51*s],P.coppi);
    if(s<0) B.quad([-.51,y1,-.25],[-.51,y0,-.51],[.51,y0,-.51],[.51,y1,-.25],P.coppi);
    B.tri([.5,y0,.5*s],[.5,y1,.25*s],[.5,y0,.25*s],P.mattone).tri([-.5,y0,.5*s],[-.5,y0,.25*s],[-.5,y1,.25*s],P.mattone); });
  B.aperture(-.42,.252,.42,.252,7,.74,.17,.045).aperture(.42,-.252,-.42,-.252,7,.74,.17,.045);      // cleristorio
  B.aperture(-.4,.5,.4,.5,6,.2,.2,.04).aperture(.4,-.5,-.4,-.5,6,.2,.2,.04);
  B.vano(.505,0,0,0,1,.16,.5).vano(.505,0,.375,0,1,.08,.32).vano(.505,0,-.375,0,1,.08,.32);
}
function abside(B){ B.cilindro(1,1,0,0,0,P.mattone,null,14).cono(1.04,.42,0,1,0,P.coppi,14); }      // mezza è dentro la navata
function portico(B){      // portico in facciata: pilastri sul fronte, tetto a uno spiovente appoggiato alla facciata (a -x)
  for(var i=0;i<5;i++){ var z=-.45+.9*i/4; B.scatola(.16,.84,.06,.38,0,z,P.travertino); }
  B.scatola(1,.1,1.02,0,.84,0,P.travertino);
  B.quad([-.5,1.22,.52],[.52,.94,.52],[.52,.94,-.52],[-.5,1.22,-.52],P.coppi).quad([-.5,1.22,.52],[-.5,1.22,-.52],[.52,.94,-.52],[.52,.94,.52],P.coppi);
}
function atrio(B){      // atrio a quadriportico: muro di cinta, portici sui quattro lati verso il cortile, vasca nel mezzo (il cantharus di Santa Cecilia)
  var k, w=.17;
  B.scatola(1,.62,.04,0,0,.48,P.mattone).scatola(1,.62,.04,0,0,-.48,P.mattone).scatola(.04,.62,1,.48,0,0,P.mattone);
  B.scatola(.04,.62,.36,-.48,0,.32,P.mattone).scatola(.04,.62,.36,-.48,0,-.32,P.mattone);      // il lato verso la chiesa (a -x) resta aperto nel mezzo
  B.vano(.505,0,0,0,1,.16,.42);
  for(k=0;k<4;k++) B.dentro(0,0,0,k*PI/2,function(C){
    for(var i=0;i<5;i++) C.scatola(.04,.5,.04,-.3+.6*i/4,0,.5-w,P.travertino);
    C.quad([-.5,.62,.5],[.5,.62,.5],[.5-w,.46,.5-w],[-.5+w,.46,.5-w],P.coppi); });
  B.cilindro(.06,.08,0,0,0,P.marmo,null,10);
}
function chiostro(B){      // monastero: quattro corpi bassi attorno al chiostro, finestre piccole, tetti a due falde
  var k, d=.24;
  for(k=0;k<4;k++) B.dentro(0,0,0,k*PI/2,function(C){
    C.scatola(1-(k%2?2*d:0),1,d,0,0,.5-d/2,P.intonaco).falde(1.02-(k%2?2*d:0),.26,d+.03,0,1,.5-d/2,P.coppi,0,P.intonaco);
    C.aperture(-.38,.501,.38,.501,6,.55,.14,.04,true).aperture(.3,.5-d-.001,-.3,.5-d-.001,4,.08,.3,.06); });
}
function rotonda(B){ B.cilindro(.5,1,0,0,0,P.mattone,null,18).cono(.54,.36,0,1,0,P.coppi,18); B.vano(.505,0,0,0,1,.18,.5); }
var MODULI={aula:aula, basilica:basilica, abside:abside, portico:portico, atrio:atrio, chiostro:chiostro, rotonda:rotonda};

/* ---- Le chiese. o: [x, z, ry, lunghezza, larghezza] dal contorno di OpenStreetMap (q21.txt, rettangolo più piccolo che lo contiene; il lato dell'abside è quello più stretto o
   curvo del contorno: dove il contorno non lo mostra è una scelta), in unità della scena e in metri. Senza o: il punto di CHIESE e un asse scelto come prima (pendio, poi caso).
   fasi: [anno, forma, opzioni]; forma a = aula, b = basilica, r = rotonda, d = diaconia (aula e un corpo basso accanto: magazzino e sala dei soccorsi, schema),
   m = monastero (aula e chiostro). Opzioni: L e W misure della fase (metri), p portico dall'anno, at atrio, ch chiostro, or oratori ai lati, amb corpo trasversale dietro l'abside,
   tr transetto, col colonne antiche nei muri, sup oratorio al piano alto del monastero, s2 seconda chiesa del monastero. schema: misure e forma non date dalla fonte. ---- */
var FORME={
 'San Marco':{o:[-31.21,-39.46,-1.31,60.5,27.6], fasi:[[336,'b',{p:780}]]},
 'Santa Maria in Trastevere':{o:[-131.03,34.16,-.033,74.3,39.4], fasi:[[340,'a',{W:20}],[780,'b',{ch:828}]]},
 'San Lorenzo in Lucina':{o:[-54.69,-119.68,1.866,61.1,23.4], fasi:[[370,'a',{p:370}]], schema:1},
 'Santi Nereo e Achilleo':{o:[78.46,136.95,-2.374,33.7,19.9], fasi:[[377,'a',{p:377}]], schema:1},
 "Sant'Anastasia":{fasi:[[380,'b',{L:45,W:22}]]},
 'San Lorenzo in Damaso':{fasi:[[380,'b',{L:38,W:22,p:380,p2:1,amb:1}]]},
 'Santa Susanna':{o:[68.82,-131.41,-2.396,45.9,42.5], fasi:[[380,'a',{L:22,W:11}],[800,'b',{L:36,W:20}]]},
 'San Crisogono':{o:[-97.69,37.61,3.036,63.1,37.7], fasi:[[380,'a',{L:38,W:18,ch:731}]]},
 'San Clemente':{fasi:[[390,'b',{L:38,W:22,p:390}]]},
 'Santa Pudenziana':{o:[83.98,-65.98,2.544,49.9,40.2], fasi:[[390,'a',{L:40,W:20,or1:390}]]},
 'Santi Giovanni e Paolo':{o:[56.32,66,-.129,57.5,50.4], fasi:[[398,'b',{W:28}]]},
 'Santa Balbina':{o:[36.22,133.08,.508,41.4,16], fasi:[[400,'a',{}]]},
 'San Vitale':{o:[44.82,-80.65,-.568,59.4,22], fasi:[[402,'a',{p:402}]]},
 'San Pietro in Vincoli':{o:[65.45,-15.6,-2.667,66.1,37], fasi:[[439,'b',{}]]},
 'Santa Cecilia':{o:[-78.46,54.76,-.485,53.3,24.3], fasi:[[499,'a',{L:30,W:14}],[820,'b',{p:820,at:820,ch:820}]]},
 'Santi Quattro Coronati':{o:[106.05,47.28,-.081,35.9,17.9], fasi:[[450,'a',{L:28,W:14}],[630,'b',{}],[850,'b',{amb:1}]]},
 "Sant'Agata dei Goti":{fasi:[[465,'a',{L:32,W:16,p:465}]], schema:1},
 'Santa Bibiana':{o:[198.4,-33.83,2.814,22.8,18.6], fasi:[[468,'a',{W:12,p:468}]], schema:1},
 'Santa Prassede':{o:[111.06,-41.3,.574,47.5,44.7], fasi:[[499,'a',{L:26,W:13}],[820,'b',{W:26,or:820,chd:820}]]},
 'San Martino ai Monti':{o:[106.91,-23.6,-.878,51,27.1], fasi:[[500,'a',{L:36,W:16}],[849,'b',{}]]},
 'Santa Maria in Cosmedin':{o:[-29.64,48.9,2.557,52.7,26], fasi:[[550,'d',{L:28,W:15,col:1}],[780,'b',{col:1}]]},
 'Santa Maria Antiqua':{fasi:[[560,'d',{L:24,W:14}]], schema:1},
 'Santi Apostoli':{fasi:[[570,'b',{L:48,W:26}]]},
 'San Gregorio al Celio':{fasi:[[575,'m',{L:24,W:12,ch:575,s2:720}]]},
 'San Teodoro':{fasi:[[580,'r',{L:18,W:18}]]},
 'Santa Lucia in Selci':{o:[95.52,-22.36,1.975,41.1,23.5], fasi:[[630,'d',{L:30,W:15}]], schema:1},
 'San Saba':{o:[1.91,154.33,2.18,38.7,34.5], fasi:[[650,'m',{L:30,W:16,ch:650}]]},
 'Santa Maria in via Lata':{o:[-33.09,-62.26,.287,33.9,26.3], fasi:[[700,'d',{W:15}]]},
 'Santa Maria in Domnica':{o:[84.52,86.78,.361,40.4,30.4], fasi:[[700,'d',{L:24,W:13}],[818,'b',{W:26}]]},
 "Sant'Eustachio":{o:[-79.34,-68.42,-1.409,45.3,22.5], fasi:[[720,'b',{L:34,W:18,p:720}]]},
 'Santa Maria in Aquiro':{o:[-58.61,-82.85,-3.072,45.2,28.9], fasi:[[730,'a',{L:15,W:9}],[738,'d',{L:30,W:16}]]},
 'San Giorgio al Velabro':{o:[-17.72,31.98,-1.551,37.9,20.6], fasi:[[745,'b',{p:835}]]},
 'Santa Maria in Campo Marzio':{o:[-72.72,-98.58,1.622,40.8,29.7], fasi:[[750,'m',{L:26,W:13,ch:750}]], schema:1},
 "Sant'Angelo in Pescheria":{o:[-54.69,-1.61,.957,23.1,19], fasi:[[755,'d',{W:13}]]},
 'San Silvestro in Capite':{fasi:[[761,'m',{L:28,W:14,ch:761,sup:761}]]},
 "Sant'Apollinare":{o:[-96.25,-94.01,-3.097,53.4,24.1], fasi:[[780,'b',{L:24,W:15,tr:1}]]},
 'San Vito':{o:[134.69,-37.34,3.132,31,14.4], fasi:[[780,'a',{p:780}]], schema:1},
 'San Bonifacio':{o:[-55.27,96.09,-.797,61.4,25.3], fasi:[[780,'d',{L:30,W:15}]], schema:1},
 'Santa Maria Domine Rose':{fasi:[[850,'a',{L:18,W:9}]], schema:1},
 'Santa Prisca':{o:[-10.93,104.71,-2.799,34.6,19.9], fasi:[[499,'b',{}]], schema:1},
 'San Sisto Vecchio':{fasi:[[499,'a',{L:30,W:15,ch:850}]], schema:1},
 'San Marcello':{o:[-27.33,-68.69,-2.868,55.2,29.6], fasi:[[418,'a',{W:16,p:418}]], schema:1},
 "Sant'Eusebio":{o:[153.35,-42.76,-2.106,52,19.8], fasi:[[499,'a',{p:499}]], schema:1},
 'San Giovanni a Porta Latina':{o:[138.09,169.76,2.525,25.3,22.1], fasi:[[496,'a',{L:22,W:12}],[772,'b',{}]]},
 'Santa Martina':{fasi:[[630,'a',{L:20,W:12}]], schema:1}
};

/* Che cosa dice la fonte, fase per fase, per la scheda che si apre toccando il nome (Armellini, frasi in src/testi/topografia-fonti.md). Dove manca, la scheda descrive solo la forma. */
var NOTE={
 'San Marco':["Basilica sotto il Campidoglio. Adriano I ne rifà il tetto e il portico; Gregorio IV (827-844) «la ricostruì quasi a nuovo» e di lui resta l'abside a mosaico (Armellini)."],
 'Santa Maria in Trastevere':["Giulio I la edifica «dai fondamenti» verso il 340.","Adriano I «ampliò la basilica aggiungendo due navi»; Gregorio IV nell'828 le costruisce accanto un monastero (Armellini). Che prima avesse una navata sola è la nostra lettura di quella frase."],
 "Sant'Anastasia":["«Era anticamente divisa in tre navi da trenta colonne» (Armellini)."],
 'San Lorenzo in Damaso':["Davanti alla facciata un doppio portico, dentro tre navate e una nave traversa dietro l'abside, «a modo di portico postico» (Armellini). La chiesa di oggi fu rifatta altrove nel Quattrocento: il posto antico non si sa, qui sta al posto di quella di oggi."],
 'Santa Susanna':["Un'aula «angusta e buia», dice l'epigrafe di Leone III.","Leone III la rifà dalle fondamenta verso l'800 (Armellini)."],
 'San Crisogono':["La chiesa antica sta sotto quella di oggi; la sua forma non è descritta. Gregorio III verso il 731 ne rifà il tetto e le fonda accanto un monastero (Armellini)."],
 'San Clemente':["La basilica ricordata da Girolamo, col suo portico; oggi è sotto la chiesa del XII secolo (Armellini)."],
 'Santa Pudenziana':["Un'aula nelle terme di Novato, rifatta dai preti Ilicio e Leopardo alla fine del IV secolo, con accanto la cappella di San Pietro (Armellini)."],
 'San Vitale':["Dedicata da Innocenzo I nel 401-402; davanti un portico «sorretto da quattro colonne» (Armellini)."],
 'San Pietro in Vincoli':["La basilica di Eudossia, verso il 442, «nel sito dove tuttora sorge», a tre navate su due file di colonne (Armellini)."],
 'Santa Cecilia':["Titolo attestato nel 499 (concilio di Simmaco, in Armellini): com'era la chiesa la fonte non lo dice.","Pasquale I «la rinnovò dai fondamenti» e vi fece «un gran monastero»; davanti un atrio col cantharus e un portico di quattro colonne. La chiesa di oggi «conserva ancora il carattere» di quella di Pasquale (Armellini). L'anno 820 è scelto nel pontificato (817-824)."],
 'Santi Quattro Coronati':["La chiesa prima di Onorio I: forma non descritta.","Onorio I «la rinnovò dalle fondamenta»; la sua forma è sparita (Armellini).","Leone IV la ricostruisce: di lui resta «l'ambulacro dietro la tribuna» (Armellini). Anno scelto nel pontificato (847-855)."],
 'Santa Prassede':["Titolo attestato nel 499 (Armellini). Dove stesse non si sa: «non lungi» da quella di Pasquale.","Pasquale I la rifà in un altro posto vicino, con due oratori ai lati e un monastero dietro l'abside; la chiesa di oggi è la sua (Armellini). L'anno 820 è scelto nel pontificato (817-824)."],
 'San Martino ai Monti':["Papa Simmaco la costruisce sopra un'aula più antica, al piano delle terme (Armellini).","Sergio II la comincia, Leone IV la finisce; tre navate su due file di dodici colonne (Armellini). Anno scelto."],
 'Santa Maria in Cosmedin':["Diaconia fra le rovine di un tempio antico, di cui restano colonne nei muri (Armellini): piccola e «angusta».","Adriano I la riedifica più grande (Armellini). Anno scelto nel pontificato (772-795)."],
 'Santi Apostoli':["«L'antica basilica era a tre navi sostenute da due file di colonne» (Armellini)."],
 'San Gregorio al Celio':["Gregorio Magno fa della sua casa un monastero con una chiesa; Gregorio II vi aggiunge un'altra chiesa (Armellini; anno scelto)."],
 'San Teodoro':["«Antichissima chiesa di forma circolare», con l'abside a mosaico; diaconia (Armellini). Fu rifatta nel Quattrocento un poco più in là."],
 'San Saba':["Il monastero «Cella nuova» dei monaci greci, ricordato nella vita di Leone III (Armellini)."],
 'Santa Maria in via Lata':["Diaconia sulla via Lata, sopra un edificio romano del III secolo (Armellini)."],
 'Santa Maria in Domnica':["«La prima tra le Diaconie» (Armellini).","Pasquale I la riedifica dalle fondamenta, più grande; tre navate e il mosaico dell'abside finito nell'817 (Armellini)."],
 "Sant'Eustachio":["Diaconia ricordata nel 795; «lunga palmi 152, larga 81¼ con tre navi», col portico (Armellini)."],
 'Santa Maria in Aquiro':["Prima una diaconia e un piccolo oratorio.","Gregorio III la ricostruisce «dalle fondamenta più lunga e più larga» (Liber Pontificalis in Armellini). Anno scelto nel pontificato (731-741)."],
 'San Giorgio al Velabro':["Zaccaria la rifà quasi dalle fondamenta; Gregorio IV le aggiunge due portici (Armellini; qui uno, dall'835). L'arco degli Argentari sta al suo angolo sud-ovest (Platner e Ashby)."],
 "Sant'Angelo in Pescheria":["Diaconia nel portico d'Ottavia; Teodoro, zio di Adriano I, la rifà «dal suolo» (Armellini)."],
 'San Silvestro in Capite':["Paolo I fa della sua casa un monastero, con un oratorio al piano alto e una chiesa dentro il recinto (Armellini)."],
 "Sant'Apollinare":["Adriano I la costruisce verso il 780: «tre piccole navi da tre colonne per lato» e una nave traversa in fondo (Armellini)."],
 'San Sisto Vecchio':["Accanto, il «monasterium Corsarum» della vita di Leone IV (Armellini)."],
 'San Giovanni a Porta Latina':["Eretta da Gelasio I (492-496).","Riedificata da Adriano I nel 772, a tre navate su dieci colonne (Armellini)."],
 'Santa Martina':["Costruita sulle rovine del Secretarium Senatus (Armellini), che nel modello non c'è."]
};
var NOMI_FORMA={a:"aula a una navata",b:"basilica a tre navate",r:"chiesa rotonda",d:"diaconia: aula e un corpo basso accanto",m:"monastero: chiesa e chiostro"};

/* ---- Le istanze: ogni chiesa diventa una fila di pezzi, ognuno con i suoi anni ---- */
var hq=RM.hSuolo||RM.h, ISTANZE=[], USO={}; RM.chieseZona0=RM.zone.length;      // da qui in poi le zone delle chiese (le prove le distinguono da quelle dei monumenti)
function quota(x,z,ry,sx,sz){      // sui pendii a metà fra la quota del centro e quella dello spigolo più basso (la chiesa entra un poco nel monte)
  var ca=Math.cos(ry), sa=Math.sin(ry), y0=hq(x,z), m=y0;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ var lx=q[0]*sx/2, lz=q[1]*sz/2; m=Math.min(m,hq(x+lx*ca+lz*sa,z-lx*sa+lz*ca)); });
  return (y0+m)/2-.1;
}
elenco.forEach(function(c,i){
  var F=FORME[c.nome]||{fasi:[[c.anno,'a',{L:28,W:14,p:c.anno}]],schema:1}, o=F.o;
  if(o){ c.x=o[0]; c.z=o[1]; c.ry=o[2]; }
  else { var y0=hq(c.x,c.z), r0=(RM.grana(i,3)-.5)*.9+(RM.grana(i,5)<.5?0:PI);      // senza contorno: l'asse di prima (sui pendii forti la navata segue le curve di livello)
    function spigoli(ry){ var ca=Math.cos(ry), sa=Math.sin(ry); return [[-2,-.7],[2,-.7],[-2,.7],[2,.7]].map(function(q){ var lx=q[0]*1.25, lz=q[1]*1.25; return hq(c.x+lx*ca+lz*sa,c.z-lx*sa+lz*ca); }); }
    var a=spigoli(r0), b=spigoli(r0+PI/2), da=Math.max.apply(0,a)-Math.min.apply(0,a), db=Math.max.apply(0,b)-Math.min.apply(0,b); c.ry=(da>.6&&db<da*.6)?r0+PI/2:r0;
    /* con le misure vere della fase più grande: fra i quattro versi, quello in cui la pianta scende meno sul pendio (Sant'Anastasia, sotto il Palatino, finiva col tetto sotto il monte) */
    var Lm=0, Wm=0; F.fasi.forEach(function(f){ var q=f[2]||{}; Lm=Math.max(Lm,(q.L||30)/10); Wm=Math.max(Wm,(q.W||15)/10); });
    var meglio=1e9, ry0=c.ry; [0,1,2,3].forEach(function(k){ var r=ry0+k*PI/2, ca=Math.cos(r), sa=Math.sin(r), h=[];
      for(var u=-1;u<=1;u+=.5) for(var v=-1;v<=1;v+=1) h.push(hq(c.x+u*Lm/2*ca+v*Wm/2*sa,c.z-u*Lm/2*sa+v*Wm/2*ca));
      var dd=Math.max.apply(0,h)-Math.min.apply(0,h); if(dd<meglio-.05){ meglio=dd; c.ry=r; } }); }
  c.forme=F; c.schema=!!F.schema; c.conContorno=!!o; c.fasi=F.fasi.map(function(f){ return {anno:f[0],forma:f[1]}; });
  var ca=Math.cos(c.ry), sa=Math.sin(c.ry);
  F.fasi.forEach(function(f,k){
    var op=f[2]||{}, dal=f[0], al=k+1<F.fasi.length?F.fasi[k+1][0]-2:c.fine, forma=f[1];
    var Lt=(op.L||(o?o[3]:30))/10, W=(op.W||(o?o[4]:15))/10;      // lunghezza tutta (abside compresa) e larghezza, in unità
    if(forma==='r'){ metti('rotonda',0,0,W,Math.max(1,W*.62),W,dal,al); metti('abside',-W*.48,0,W*.2,W*.45,W*.2,dal,al); return; }
    var b=forma==='b', ra=b?W*.22:W*.36, Lp=op.p&&!b?Math.min(.5,Lt*.12):(op.p?Math.min(.6,Lt*.12):0);
    var Ln=Lt-ra-Lp, xn=Lt/2-Lp-Ln/2, H=b?Math.min(1.9,.55*W+.25):Math.min(1.35,.5*W+.35);      // nave: dal fondo dell'abside alla facciata, portico in fondo
    if(op.tr){ var Wt=W*1.45, Lt2=W*.45; Ln-=Lt2; xn+=Lt2/2; metti('aula',xn-Ln/2-Lt2/2,0,Lt2,H*.92,Wt,dal,al,true); metti('abside',xn-Ln/2-Lt2,0,ra,H*.78,ra,dal,al); }
    else metti('abside',xn-Ln/2,0,ra,H*(b?.66:.8),ra,dal,al);
    metti(b?'basilica':'aula',xn,0,Ln,H,W,dal,al);
    if(op.p){ var dp=Math.max(dal,op.p); metti('portico',xn+Ln/2+Lp/2,0,Lp,H*(b?.36:.5),W,dp,al); if(op.p2) metti('portico',xn+Ln/2+Lp*1.5,0,Lp,H*.32,W,dp,al); }
    if(op.amb) metti('aula',xn-Ln/2-ra-.25,0,.5,H*.42,W*.92,dal,al);      // corpo basso dietro l'abside: la nave traversa di San Lorenzo in Damaso, l'ambulacro di Leone IV ai Santi Quattro
    if(op.col){ metti('portico',xn,W/2+.06,.14,H*.72,Ln*.96,dal,al,false,-PI/2); metti('portico',xn,-W/2-.06,.14,H*.72,Ln*.96,dal,al,false,PI/2); }      // le colonne del tempio antico nei muri (Cosmedin)
    if(op.or1) metti('aula',xn-Ln*.15,W/2+.45,Ln*.35,H*.55,.9,Math.max(dal,op.or1),al);      // la cappella di San Pietro accanto all'aula di Pudenziana
    if(op.or){ metti('aula',xn-Ln*.28,W/2+.4,Ln*.22,H*.45,.8,Math.max(dal,op.or),al,false,PI/2); metti('aula',xn-Ln*.28,-W/2-.4,Ln*.22,H*.45,.8,Math.max(dal,op.or),al,false,-PI/2); }      // i due oratori di Pasquale I ai lati
    if(op.at){ var la=Math.max(2,W*.95); metti('atrio',xn+Ln/2+Lp+la/2,0,la,Math.max(.7,H*.38),W*1.02,Math.max(dal,op.at),al); }
    if(op.ch){ var lc=Math.max(2.4,W*1.15); metti('chiostro',xn-Ln*.05,W/2+lc/2+.15,Ln*.9,.8,lc,Math.max(dal,op.ch),al); }      // il monastero accanto, su un fianco (il lato è una scelta)
    if(op.chd){ var lq=Math.max(2.4,W*1.0); metti('chiostro',xn-Ln/2-ra-lq/2-.2,0,lq,.8,lq,Math.max(dal,op.chd),al); }      // il monastero di Pasquale dietro l'abside
    if(op.sup){ var lcs=Math.max(2.4,W*1.15); metti('aula',xn-Ln*.05,W/2+.15+lcs*.88,Ln*.45,.5,lcs*.24,dal,al,false,0,.8); }      // l'oratorio «in superioribus monasterii moeniis»: sul tetto del corpo del chiostro
    if(op.s2) metti('aula',xn-Ln*.1,-W/2-.9,Ln*.7,H*.85,1.1,Math.max(dal,op.s2),al);      // la seconda chiesa di Gregorio II
    if(forma==='d') metti('aula',xn+Ln*.05,-W/2-.5,Ln*.75,H*.6,1,dal,al,false,0,0,true);      // il corpo basso della diaconia (schema)
    function metti(g,lx,lz,sx,sy,sz,d0,d1,giu,ry2,su,intonaco){ var x=c.x+lx*ca+lz*sa, z=c.z-lx*sa+lz*ca, r=c.ry+(ry2||0);
      var I={g:g,c:i,x:x,z:z,ry:r,sx:sx,sy:sy,sz:sz,dal:d0,al:d1,y:quota(x,z,r,Math.max(.2,sx),Math.max(.2,sz))+(su||0),p0:-1};
      if(g==='abside'||g==='rotonda') I.y=quota(x,z,r,sx*2,sz*2)+(su||0);
      if(RM.zone.slice(0,RM.chieseZona0).some(function(q){ return q.h!=null && RM.dZona(q,x,z)<q.r; })) I.y=Math.max(I.y,RM.h(x,z)-.15+(su||0));      // dentro il piano di un monumento (il cortile della Crypta Balbi) la chiesa sta sul piano, non 4 m sotto
      ISTANZE.push(I); USO[g]=(USO[g]||0)+1;
      var rr=g==='abside'?sx:0;      // niente isolati sopra la chiesa da quando c'è: prima, una casa come le altre
      if(rr) RM.zone.push({x:x,z:z,r:rr+.15,dal:d0-2});
      else if(g==='rotonda') RM.zone.push({x:x,z:z,r:sx/2+.15,dal:d0-2});
      else if(!su) RM.zone.push({x:x,z:z,a:(Math.abs(Math.cos(ry2||0))*sx+Math.abs(Math.sin(ry2||0))*sz)/2,b:(Math.abs(Math.sin(ry2||0))*sx+Math.abs(Math.cos(ry2||0))*sz)/2,c:Math.cos(c.ry),s:Math.sin(c.ry),r:.15,dal:d0-2}); }
  });
  var Fu=F.fasi[F.fasi.length-1], opU=Fu[2]||{}, Lu=(opU.L||(o?o[3]:30))/10;
  c.davanti=[c.x+(Lu/2+.9)*ca, c.z-(Lu/2+.9)*sa];      // il sagrato, davanti alla facciata dell'ultima fase (la gente delle diaconie, js/vita.js)
});
RM.CHIESE=elenco; RM.chieseIstanze=ISTANZE;

/* ---- Nome sulla scena e scheda (come le porte delle mura: RM.etichetteExtra, letto da js/monumenti.js; la scheda la scrive js/pagina.js con RM.chieseVoci e RM.statoChiesa).
   Le schede si scrivono qui dai dati di FORME e NOTE: nessuna voce nuova in MONUMENTI. ---- */
var EXTRA={p:'un portico in facciata',p2:'un secondo portico',at:"un atrio a quadriportico con la vasca nel mezzo",ch:'il monastero accanto, su un fianco (il lato è una scelta)',chd:"il monastero dietro l'abside",
  or:'due oratori ai lati',or1:'la cappella sul fianco',amb:"un corpo basso dietro l'abside",tr:'una nave traversa in fondo',col:'colonne antiche nei muri dei fianchi',sup:"l'oratorio al piano alto del monastero",s2:'una seconda chiesa accanto'};
RM.chieseVoci={}; D.SCHEDE=D.SCHEDE||{};
var contEt=document.querySelector('.etichette3d'); RM.etichetteExtra=RM.etichetteExtra||[];
elenco.forEach(function(c,i){
  var id='chiesa-'+i, F=c.forme, N=NOTE[c.nome]||[];
  c.id=id; c.vista={vis:false};
  var date=F.fasi.map(function(f,k){ var op=f[2]||{}, L=op.L||(F.o?F.o[3]:30), W=op.W||(F.o?F.o[4]:15), ex=[];
    Object.keys(EXTRA).forEach(function(q){ if(op[q]) ex.push(EXTRA[q]+(typeof op[q]==='number'&&op[q]>f[0]+.5?' (dal '+op[q]+')':'')); });
    var t=(N[k]?N[k]+' ':'')+'Nel modello: '+NOMI_FORMA[f[1]]+(f[1]==='r'?', larga '+Math.round(W)+' m':', lunga '+Math.round(L)+' m e larga '+Math.round(W)+' m')+(ex.length?', con '+ex.join(', '):'')+'.'+
      ((op.L||op.W)&&F.o?' Le misure di questa fase sono una scelta: quelle di oggi sono '+Math.round(F.o[3])+' x '+Math.round(F.o[4])+' m.':'');
    return [f[0],t]; });
  if(c.fine<1e4) date.push([c.fine,"Nel modello qui la chiesa non c'è più."]);
  D.SCHEDE[id]={cosa:(c.tipo==='diaconia'?'Diaconia':c.tipo==='monastero'?'Monastero':c.tipo==='titolo'?'Titolo':'Chiesa')+'. '+
    (c.conContorno?"Posto, asse e misure vengono dalla chiesa di oggi (OpenStreetMap), dove la fonte non dice che quella antica era diversa; il lato dell'abside, quando il contorno non lo mostra, è una scelta.":"Sta al punto della chiesa di oggi; l'asse è una scelta.")+
    (F.schema?" Com'era nei secoli del racconto la fonte letta non lo dice: forma e misure sono uno schema.":'')+' Altezze e finestre sono uno schema; i campanili, del XII secolo, non ci sono. Fonte: Armellini, Le chiese di Roma (1891).', date:date};
  var mie=ISTANZE.filter(function(I){ return I.c===i; }), ytop=Math.max.apply(0,mie.map(function(I){ return I.y+I.sy; }));
  RM.chieseVoci[id]={id:id, nome:c.nome, x:c.x, z:c.z, raggio:2.5, chiesa:true};
  if(!contEt) return;
  var dv=document.createElement('span'); dv.textContent=c.nome; contEt.appendChild(dv);
  dv.addEventListener('click',function(){ if(RM.apriScheda) RM.apriScheda(id); });
  RM.etichetteExtra.push({div:dv, x:c.x, z:c.z, y:ytop, ey:.8, raggio:2, presenza:0, porta:c.vista});      // «porta» è il nome del campo che js/monumenti.js legge: vis dice se la chiesa c'è
});
RM.statoChiesa=function(id,anno){ var c=elenco.filter(function(q){ return q.id===id; })[0]; if(!c) return 'uso'; if(anno<c.anno-.5) return 'assente'; if(anno>=c.fine) return 'crollato'; return 'uso'; };

/* ---- Una maglia a istanze per pezzo, tutte sullo stesso materiale (un solo programma della scheda grafica) ---- */
var mat=RM.matPietra(((window.RM_DATI.CERTEZZA||{}).chiese||['B'])[0]);
RM.veduta(mat,{luce:.3,muro:0xe8dcc4,quanta:.4,tetto:0xb84a2c,quantaT:.55});      // veduta dei secoli tardi (RM.veduta in js/base.js): da lontano muri chiari e tetti di un rosso pulito, perché la chiesa in uso si stacchi dai ruderi
/* La patina del tempo (PATINA in js/costruttore.js), pezzo per pezzo: ognuno parte pulito dal suo anno e invecchia come tutta la città; torna indietro solo dove una fonte letta
   dice che la chiesa fu restaurata (RESTAURI in js/monumenti.js, chiave «chiesa:» e il nome). Una chiesa rifatta (una fase nuova) riparte pulita. Tinte e ritmo sono una resa. */
mat.defines=mat.defines||{}; mat.defines.RM_PATI=''; mat.userData.patinaPropria=true; mat.userData.patina.value=1;
var MAGLIE=[], d=new THREE.Object3D();
Object.keys(MODULI).forEach(function(g){
  var mie=ISTANZE.filter(function(I){ return I.g===g; }); if(!mie.length) return;
  var B=new RM.Costruttore(); MODULI[g](B);
  var m=new THREE.InstancedMesh(B.geometria(),mat,mie.length), pat=new THREE.InstancedBufferAttribute(new Float32Array(mie.length),1);
  m.geometry.setAttribute('aPatina',pat); m.castShadow=m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='citta'; RM.scene.add(m);
  mie.forEach(function(I,k){ I.k=k; I.m=m; d.position.set(I.x,-80,I.z); d.scale.set(0,0,0); d.updateMatrix(); m.setMatrixAt(k,d.matrix); });
  MAGLIE.push({m:m,pat:pat,lista:mie});
});
var patUlt=-1;
RM.moduli.push(function(anno){
  MAGLIE.forEach(function(G){
    var mosso=false;
    G.lista.forEach(function(I){
      var p=RM.sfuma(I.dal-6,I.dal,anno)*(1-RM.sfuma(I.al-2,I.al,anno)); if(p===I.p0 || (RM.inViaggio && Math.abs(p-I.p0)<.002)) return; I.p0=p; mosso=true;      // all'arrivo il valore esatto (28 novembre 2026)
      d.position.set(I.x,I.y,I.z); d.rotation.set(0,I.ry,0); d.scale.set(p>.01?I.sx:0,Math.max(p*I.sy,.001),p>.01?I.sz:0); d.updateMatrix(); G.m.setMatrixAt(I.k,d.matrix);
    });
    if(mosso) G.m.instanceMatrix.needsUpdate=true;
  });
  elenco.forEach(function(c){ if(c.vista) c.vista.vis=false; }); ISTANZE.forEach(function(I){ if(I.p0>.5 && elenco[I.c].vista) elenco[I.c].vista.vis=true; });      // il nome si vede solo se la chiesa c'è
  var pA=RM.patinaAnno(anno); if(anno!==patUlt && !(RM.inViaggio && Math.abs(pA-RM.patinaAnno(patUlt))<=.002)){ patUlt=anno;      // patUlt è l'anno scritto: la patina di ogni pezzo dipende anche dai restauri della sua chiesa
    MAGLIE.forEach(function(G){ G.lista.forEach(function(I){ G.pat.array[I.k]=RM.patinaSpenta?0:RM.patinaRestauri('chiesa:'+elenco[I.c].nome,I.dal,anno); }); G.pat.needsUpdate=true; }); }
});
})();
