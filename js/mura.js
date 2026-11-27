/* Mura Aureliane con torri e porte, acquedotti ad arcate, ponti sul Tevere, Isola Tiberina. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI, d=new THREE.Object3D();
function classe(id){ return ((D.CERTEZZA||{})[id]||['B'])[0]; }
function istanze(geo,mat,quante){ var m=new THREE.InstancedMesh(geo,mat,quante); m.castShadow=m.receiveShadow=true; m.frustumCulled=false; RM.scene.add(m); return m; }

/* ---------- mura: 271-275, rialzate nel 401-403 ---------- */
var mura=(function(){
  var passi=[], M=RM.MURA, i, a, b, L, n, k;
  /* I lati della cinta che attraversano il Tevere non si disegnano (25 novembre 2026): il poligono di src/roma/genera.mjs è chiuso, e due suoi lati passavano sull'acqua, sotto il ponte
     Aurelio e poco a valle del ponte di Probo, con merli e torri sul fiume. Nessuna fonte letta parla di un muro sull'acqua: al ponte Aurelio le due cinte si univano col ponte
     (Procopio, Guerra gotica I 19, 6-10); presso il ponte di Probo come si chiudesse la cinta non è detto. Il poligono resta chiuso per dire che cosa sta dentro le mura. */
  function sulFiume(j){ var p=M[j], q=M[(j+1)%M.length]; return RM.distFiume((p[0]+q[0])/2,(p[1]+q[1])/2)<2.5; }
  for(i=0;i<M.length;i++){
    if(sulFiume(i)) continue;
    a=M[i]; b=M[(i+1)%M.length]; L=Math.hypot(b[0]-a[0],b[1]-a[1]); n=Math.max(1,Math.round(L/3));      // un passo ogni 30 m circa: tante sono le torri («every 100 feet», Platner)
    for(k=0;k<n;k++) passi.push({x:a[0]+(b[0]-a[0])*(k+.5)/n, z:a[1]+(b[1]-a[1])*(k+.5)/n, ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0]), len:L/n});
  }
  /* tratto: cortina, cammino di ronda, merli. Spessa circa 3,5 m («about 12 feet thick», Platner); alta 7 m sul terreno nella prima fase («not more than 25 feet»), poi rialzata */
  var T=new RM.Costruttore().scatola(1,1,.34,0,0,0,P.mattone);
  /* I merli a parte (27 novembre 2026), per toglierli dove cadono e per l'ala che Belisario aggiunge nel 536: «he constructed each merlon of the battlement with a wing, adding a sort
     of flanking wall on the left side» (Procopio, Guerra gotica I 14, 15, Dewing); la nota di Dewing: a sinistra di chi difende, in pianta ┏ ┏ ┏. Chi difende guarda fuori (-z locale): la sua sinistra è -x */
  var MP=new RM.Costruttore(), MA=new RM.Costruttore();
  for(k=0;k<4;k++){ MP.scatola(.13,.14,.1,-.375+k*.25,1,-.12,P.mattone); MA.scatola(.13,.14,.1,-.375+k*.25,1,-.12,P.mattone).scatola(.025,.14,.12,-.375+k*.25-.0525,1,-.01,P.mattone); }      // i merli stanno sul filo esterno
  /* Il rattoppo di Belisario (547): «Gathering stones which lay close by, he threw them one on top of the other, regardless of order, without putting anything at all between the stones,
     since he had neither lime nor anything else of the sort, but caring only that the face of the masonry should be preserved, and he set a great quantity of stakes on the outside»
     (Procopio, Guerra gotica III 24, 4, Dewing). Qui pietre di colori diversi, senza merli, la cresta irregolare; i pali davanti. Pietre, cresta e pali sono uno schema */
  var TP=new RM.Costruttore().scatola(1,.88,.36,0,0,0,RM.col(0x948a7c));
  [[-.42,.06,P.selce],[-.24,.1,P.granito],[-.05,.04,P.tufo],[.14,.09,P.selce],[.33,.05,P.granito],[.45,.08,P.tufo]].forEach(function(b){ TP.scatola(.17,b[1],.3,b[0],.88,0,b[2]); });      // la cresta, a pietre di altezza diversa
  [[-.34,.08,.2,P.selce],[.02,.3,.16,P.granito],[.3,.12,.22,P.travertino],[-.16,.55,.14,P.granito],[.22,.62,.18,P.selce],[-.4,.7,.12,P.travertino]].forEach(function(b){ TP.scatola(.2,b[2],.012,b[0],b[1],-.184,b[3]); });      // pietre diverse sulla faccia esterna
  var PA=new RM.Costruttore(); for(k=0;k<9;k++) PA.scatola(.022,.17+(k%3)*.03,.022,-.45+k*.1125,0,-.42-(k%2)*.07,P.tronco);      // i pali piantati fuori
  /* torre quadrata, sporgente circa 3 m dalla cortina («project about 10 feet», Platner); la larghezza, 7,5 m, è indicativa */
  /* Le torri sporgono verso l'esterno (24 novembre 2026): prima, su 96 lati della cinta su 99, sporgevano verso la città. Il lato esterno è il -z locale dei tratti. */
  var W=new RM.Costruttore().scatola(.75,1.42,.66,0,0,-.18,P.mattone).scatola(.75,.06,.66,0,1.42,-.18,P.tufo);
  [[-.25,.08],[.25,.08],[-.25,-.45],[.25,-.45]].forEach(function(p){ W.scatola(.18,.16,.12,p[0],1.48,p[1],P.mattone); });
  var mat=RM.matPietra(classe('mura')), tratti=istanze(T.geometria(),mat,passi.length), torri=istanze(W.geometria(),mat,passi.length);
  var merliP=istanze(MP.geometria(),mat,passi.length), merliA=istanze(MA.geometria(),mat,passi.length), toppe=istanze(TP.geometria(),mat,passi.length), pali=istanze(PA.geometria(),RM.matPietra(),passi.length); pali.visible=false;

  /* porte dove le vie attraversano la cinta */
  /* Dal 24 novembre 2026 ogni porta è un'istanza con la sua base: prima erano una maglia sola, scalata in altezza attorno al livello del fiume, e così le porte sui colli
     si staccavano da terra dopo il rialzo del 403 (porta Salaria di 49 m) e sprofondavano durante il cantiere. Sono tutte uguali: la forma è uno schema. */
  var GP=new RM.Costruttore(), posti=[];
  GP.scatola(3,1.25,1.1,0,0,0,P.travertino).aperture(-.8,.56,.8,.56,1,0,.85,1).aperture(.8,-.56,-.8,-.56,1,0,.85,1);
  [-1,1].forEach(function(k){ GP.cilindro(1,1.7,k*2,0,-.3,P.mattone,null,14).cilindro(1.08,.12,k*2,1.7,-.3,P.tufo,null,14); });
  RM.STRADE.forEach(function(s){
    for(var i=0;i<s.length-1;i++) for(var j=0;j<M.length;j++){
      if(sulFiume(j)) continue;
      var p=s[i], r=[s[i+1][0]-p[0],s[i+1][1]-p[1]], q=M[j], w=M[(j+1)%M.length], sv=[w[0]-q[0],w[1]-q[1]], den=r[0]*sv[1]-r[1]*sv[0]; if(Math.abs(den)<1e-6) continue;
      var t=((q[0]-p[0])*sv[1]-(q[1]-p[1])*sv[0])/den, u=((q[0]-p[0])*r[1]-(q[1]-p[1])*r[0])/den; if(t<0||t>1||u<0||u>1) continue;
      var x=p[0]+r[0]*t, z=p[1]+r[1]*t; if(posti.some(function(o){ return Math.hypot(o.x-x,o.z-z)<6; })) continue;      // una strada che taglia la cinta su uno spigolo darebbe due porte (25 novembre 2026: da 3 a 6 unità; la Portuense, che ora parte dal ponte Emilio, a porta Portese corre quasi lungo il muro e lo tagliava due volte a 5 m)
      posti.push({x:x, z:z, y:RM.h(x,z)-.3, ang:Math.atan2(-sv[1],sv[0]), flaminia:Math.hypot(x+74,z+211)<15});      // la Flaminia a parte: la piena del 791 la porta via
    }
  });
  var magliaPorte=istanze(GP.geometria(),mat,Math.max(1,posti.length)); RM.porte=posti;
  /* La patina del tempo (PATINA in js/costruttore.js), istanza per istanza: un tratto rifatto riparte pulito dall'anno del restauro e invecchia da lì; i rattoppi
     di Belisario, di pietre raccolte lì attorno, sono già vecchi. Un solo attributo per cortine, torri e merli (lo stesso passo), uno per le porte.
     Restauri che ripuliscono (secondo giro, 27 novembre 2026: la regola di RESTAURI in js/monumenti.js, solo con una fonte letta): Belisario nel 536 sui tratti rovinati
     (Procopio, Guerra gotica I 14, 15), i papi da Gregorio II a Leone IV (Liber Pontificalis, più sotto), porta Flaminia nel 848; per ipotesi i tre passi di Teodorico nel 493
     (Anonimo Valesiano 66-67: quale tratto, non è detto; sono gli stessi del ponteggio). Il segno RM_PAT_MURA dà alle mura colature dai merli, piede umido e verde sulle creste. */
  mat.defines=mat.defines||{}; mat.defines.RM_PATI=''; mat.defines.RM_PAT_MURA=''; mat.userData.patinaPropria=true; mat.userData.patina.value=1;
  var patI=new THREE.InstancedBufferAttribute(new Float32Array(passi.length),1), patP=new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,posti.length)),1);
  [tratti,torri,merliP,merliA,toppe].forEach(function(m){ m.geometry.setAttribute('aPatina',patI); }); magliaPorte.geometry.setAttribute('aPatina',patP);
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:tratti,id:'mura'},{maglia:torri,id:'mura'},{maglia:magliaPorte,id:'mura'},{maglia:merliP,id:'mura'},{maglia:merliA,id:'mura'},{maglia:toppe,id:'mura'}]);
  /* colore per istanza: le maglie condividono il materiale, quindi tutte lo devono avere (come negli acquedotti) */
  var BIANCO=new THREE.Color(1,1,1), RICUPERO=new THREE.Color(.7,.6,.56),      /* terzo giro (27 novembre 2026): più scuro e grigio (prima 0,9, 0,72, 0,62), perché resti distinto dal mattone più rosso della cinta (MATTONI qui sotto) */      /* mattone di recupero: mattoni vecchi tolti dalle rovine, più scuri e spenti del mattone nuovo; la patina del tratto riparte comunque da zero (secondo giro, 27 novembre 2026: prima 1,03, 0,86, 0,76, e al sole i lati nord ed est dei Castra sembravano quasi bianchi). Tinta scelta, non misurata */ PIETRA=new THREE.Color(.95,1.04,1.22), tinta=new THREE.Color();
  /* Il mattone della cinta (27 novembre 2026, terzo giro della patina; scelta della sessione, da confermare dall'utente). Platner e Ashby, Muri Aureliani: «They are built of concrete
     faced with brick», e «The material used for the walls was largely older brick»: una cortina di laterizi in buona parte di recupero, quindi di cotture e tinte diverse. Prima la
     cinta aveva il solo P.mattone e al sole sembrava travertino (beige-ocra, circa 219, 174, 110); qui un mattone più rosso, con cinque tinte che cambiano da un tratto all'altro (a
     coppie di passi, dal posto: RM.grana) e un poco di luce in più o in meno per passo. Tinte scelte, non misurate. ?mura=prima rimette il colore di prima (per le prove). */
  var MURA_PRIMA=/[?&]mura=prima/.test(location.search), MATTONI=[[.98,.62,.58],[.84,.56,.52],[1.0,.76,.62],[.9,.64,.6],[1.02,.66,.54]];      // rosso, rosso scuro, giallastro, bruno, arancio (moltiplicano P.mattone)
  passi.forEach(function(p,j){ var t=MATTONI[Math.floor(RM.grana(Math.floor(j/2),77)*MATTONI.length)%MATTONI.length], l=.9+.2*RM.grana(j,78);
    p.mattone=MURA_PRIMA?BIANCO:new THREE.Color(t[0]*l,t[1]*l,t[2]*l); });
  if(MURA_PRIMA) RICUPERO.setRGB(.9,.72,.62);      // anche il mattone di recupero come prima
  [tratti,torri,merliP,merliA,toppe].forEach(function(m){ for(var j=0;j<passi.length;j++) m.setColorAt(j,BIANCO); }); for(k=0;k<Math.max(1,posti.length);k++) magliaPorte.setColorAt(k,BIANCO);
  passi.forEach(function(p,j){ p.rotto=RM.grana(Math.floor(j/10),7)<.3; p.riva791=Math.hypot(p.x+117.4,p.z+7.4)<2.4; });      /* 25 novembre 2026: la cinta di riva ora parte dalla testata del ponte (prima 50 m più a valle): il tratto del 791 sono i suoi primi due passi */      // riva791: il tratto di mura sul Tevere presso ponte Sisto che la piena del dicembre 791 abbatte («usque ad pontem Antonini, ipsum evertens murum», Liber Pontificalis, Adriano I 95; ponte Sisto per Duchesne). Lunghezza indicativa; rifatto qui nel 795, anno ignoto     // i tratti che Totila fa abbattere nel 546: circa un terzo, a blocchi di 300 m
  /* Il cantiere. «Rome, which before had no walls, was now surrounded with them. This work was begun in the reign of Aurelianus, and was finished by Probus» (Zosimo I 49,
     letto il 22 novembre 2026 nella traduzione del 1814, tertullian.org). L'anno della fine non è scritto: nel modello il 280, a metà del regno di Probo (276-282); che il grosso
     fosse in piedi alla morte di Aureliano (275) è l'opinione corrente, non un dato. In che ordine salissero i tratti non si sa: qui a blocchi di circa 240 m, in ordine casuale.
     Dove il lavoro non è cominciato si vede il solo filare di fondazione lungo tutto il tracciato; dove è in corso, i ponteggi di legno. */
  passi.forEach(function(p,j){ p.turno=RM.grana(Math.floor(j/8),13); });
  /* Le mura nei secoli (27 novembre 2026, l'utente: «Verifica anche se le mura crollano nel periodo in oggetto»). Fonti lette, in src/testi/topografia-fonti.md, «Mura, ponti e isola nei secoli»:
     536: Belisario trova la cinta «fallen into ruin in many places» e la ripara, coi merli ad ala (Procopio, Guerra gotica I 14, 15).
     546-547: Totila «tore down the fortifications in many places so that about one third of the defences were destroyed» (III 22, 7: Platner e Ashby, Muri Aureliani, «this is an
       exaggeration»); Belisario richiude in venticinque giorni con pietre a secco e pali (III 24, 3-6). Il terzo resta, a blocchi di 300 m (p.rotto): dove, Procopio non lo dice.
     708: Sisinnio fa cuocere la calce «pro restauratione murorum», ma muore dopo venti giorni (Liber Pontificalis, ed. Duchesne I, p. 388): nessun lavoro.
     715: Gregorio II «a portico sancti Laurenti inquoans, huius civitatis muros restaurare decreverat; et aliquam partem faciens» si ferma (Duchesne I, p. 396): qui dieci passi per parte
       da porta Tiburtina, dove comincia il portico di San Lorenzo; la lunghezza è una scelta.
     731-741: sotto Gregorio III «plurima pars murorum huius civitatis Romane restaurata est», e il papa paga la calce (Duchesne I, p. 420): qui sette danni su dieci.
     772-795: Adriano I trova «muros ... in ruinis positos et per loca plures turres usque ad terram eversas» e rifà «muros atque turres ... quae diruti erant et usque ad fundamenta
       destructi», «omnia in circuitu», con cento libbre d'oro (Duchesne I, pp. 501 e 513): qui il resto, fra il 776 e il 790 (gli anni dentro il pontificato sono una scelta).
     847-849: Leone IV rifà le mura, «longo iam senio» (il testo dell'OCR è guasto), «sed et portas» (Duchesne II, p. 115): qui nel 848-849.
     Che cosa cade fra un restauro e l'altro, e quando, le fonti non lo dicono: sono scelte nostre, prese dal posto (RM.grana), e piccole: merli caduti su un tratto su tre, torri
     a terra su una su dieci, tratti di cortina caduti fino alla fondazione su uno su trenta, prima di Adriano. Nessun tratto lungo cade. Ciò che i papi rifanno ha il colore del
     mattone di recupero, come gli acquedotti di Adriano I. */
  var iT=0, iTorto=0, dm=1e9, dm2=1e9;
  passi.forEach(function(p,j){ var a=Math.hypot(p.x-207.1,p.z+55.3), b=Math.hypot(p.x+33.5,p.z+212); if(a<dm){ dm=a; iT=j; } if(b<dm2){ dm2=b; iTorto=j; } });      // porta Tiburtina (porta San Lorenzo) e l'angolo del Pincio
  /* Il «muro rotto»: «between this gate [la Flaminia] and the small gate next on the right, which is called the Pincian, a certain portion of the wall had split open of its own accord in
     ancient times, not clear to the ground, however, but about half way down, but still it had not fallen or been otherwise destroyed, though it leaned so to either side that one part of it
     appeared outside the rest of the wall and the other inside»; nessuno lo rifà, «up to the present day the wall there is split open in this way» (Procopio, Guerra gotica I 23, 3-8).
     Qui due passi all'angolo del Pincio, uno piegato fuori e uno dentro: il punto fra le due porte e la piega di tutto il passo sono uno schema. Compare nel 537, quando Procopio lo descrive:
     quando si fosse aperto non è detto. Dopo, nessuna fonte letta dice che fu rifatto: resta così */
  passi[iTorto].piega=-.12; if(passi[iTorto+1]) passi[iTorto+1].piega=.12;      // sette gradi: quanto pendesse non è detto
  passi.forEach(function(p,j){
    function g(k){ return RM.grana(j,40+k); }
    var greg2=Math.abs(j-iT)<=10?715.5+1.5*Math.abs(j-iT)/10:0, greg3=731.5+g(1)*9.4, adr=776+g(2)*14, leo=848+g(3)*1.4, bel=536.5+g(4)*.4;
    var rip=[greg2||(g(5)<.7?greg3:adr),adr,adr,leo].filter(function(a){ return a>0; });
    function quando(da){ var a=9999; [bel<da?9999:bel].concat(rip).forEach(function(r){ if(r>da&&r<a) a=r; }); return a; }      // il primo restauro dopo il danno
    var ev=[];
    if(g(6)<.25) ev.push({tipo:'merli',da:505+g(7)*30}); if(g(8)<.04) ev.push({tipo:'torre',da:510+g(9)*25});      // prima del 536: «fallen into ruin in many places»
    if(g(10)<.33) ev.push({tipo:'merli',da:560+g(11)*170}); if(g(12)<.1) ev.push({tipo:'torre',da:580+g(13)*190}); if(g(14)<.033) ev.push({tipo:'muro',da:600+g(15)*170});      // fra Belisario e Adriano
    if(g(16)<.12) ev.push({tipo:'merli',da:796+g(17)*50}); if(g(18)<.03) ev.push({tipo:'torre',da:800+g(19)*46});      // prima di Leone IV: «longo iam senio»
    ev.forEach(function(e){ e.a=e.da<536.5?bel:quando(e.da); });
    if(p.rotto) ev.push({tipo:'totila',da:546.5,a:547.25},{tipo:'toppa',da:547.25,a:quando(547.3)});      // la breccia di Totila e il rattoppo di Belisario, finché un papa non lo rifà
    p.ev=ev; p.rifatto=9999; ev.forEach(function(e){ if(e.a<9999&&e.a>600&&e.a<p.rifatto) p.rifatto=e.a; });      // il primo restauro di un papa: da lì il mattone di recupero
  });
  RM.muraPassi=passi;      // per le prove
  var S=new RM.Costruttore(); [-.42,-.14,.14,.42].forEach(function(x){ S.scatola(.014,1.14,.03,x,0,.3,P.tronco); }); [.3,.62,.94].forEach(function(y){ S.scatola(1,.02,.1,0,y,.27,P.tronco); });
  var ponteggi=istanze(S.geometria(),RM.matPietra(),passi.length); ponteggi.visible=false; ponteggi.receiveShadow=false;
  /* Dicembre 791: il Tevere «portam quae dicitur Flamminea … a fundamenta evellens» (LP, Adriano I 94). Quando sia stata rifatta non è scritto: qui torna su nel 848, con le porte che Leone IV fa rifare («sed et portas»), ed è una scelta. */
  /* 493 (24 novembre 2026, l'utente: «anche le mura restaurate da Teodorico vanno fatte vedere»). Anonimo Valesiano 66-67, citato nella tappa: «per la riparazione delle mura della città
     si dessero ogni anno duecento libbre». Quale tratto si riparasse non è detto: qui, per ipotesi, i tre passi di cortina più vicini al teatro di Pompeo, lungo il Tevere, con il ponteggio,
     solo nell'anno della tappa, così si vedono nella stessa inquadratura del teatro in restauro. */
  var TEOD=(function(){ var d=passi.map(function(p,j){ return [Math.hypot(p.x+94.3,p.z+30.8),j]; }).sort(function(a,b){ return a[0]-b[0]; }); return d.slice(0,3).map(function(q){ return q[1]; }); })();
  RM.muraTeodorico=TEOD.map(function(j){ return [passi[j].x,passi[j].z]; });      // per la regia del 493 (js/scene-tappe.js)
  var ultima=-1, ultimoCant=-1, ultimo791=-1, ultimaFlam=-1, ultimoTeod=-1, ultimoPasso=-1;      // alla tappa del 791 la porta Flaminia è già a terra, come dicono testo e didascalia
  function zero(m,j){ d.scale.set(0,0,0); d.updateMatrix(); m.setMatrixAt(j,d.matrix); }
  return function(alt,anno,cant){
    var r791=anno>=790.9&&anno<795?1:0, rialzo=alt>1.004&&alt<1.496, teod=anno>=492.6&&anno<494?1:0, porteSu=alt*Math.min(1,cant/.8);      // le porte salgono con la cinta; «rialzo»: i lavori di Onorio (401-403), con i ponteggi su tutta la cinta
    var flamGiu=anno>=790.9&&anno<848?1:0;      // Leone IV fa rifare le mura «sed et portas» (Duchesne II, p. 115): che fra queste ci fosse porta Flaminia la fonte non lo dice; qui torna su nel 848
    var passo=anno>=500?Math.round(anno*8):0;      // dal 500 lo stato dei tratti cambia con gli anni (danni e restauri), un ottavo d'anno alla volta
    var PA=RM.patinaAnno, pAn=PA(anno); if(anno>400&&anno<500) passo=-Math.round(anno*4);      // fra il 400 e il 500 cambia solo la patina
    if(Math.abs(alt-ultima)<.002 && Math.abs(cant-ultimoCant)<.002 && r791===ultimo791 && flamGiu===ultimaFlam && teod===ultimoTeod && passo===ultimoPasso) return; ultima=alt; ultimoCant=cant; ultimo791=r791; ultimaFlam=flamGiu; ultimoTeod=teod; ultimoPasso=passo;
    for(var jp=0;jp<patP.count;jp++) patP.array[jp]=o2p(jp); patP.needsUpdate=true;
    function o2p(jp){ return posti[jp]&&posti[jp].flaminia&&anno>=848?pAn-PA(848):pAn; }      // porta Flaminia rifatta nel 848 (si veda flamGiu)
    posti.forEach(function(o,j){ var sy=o.flaminia&&flamGiu?0:porteSu; d.position.set(o.x,o.y,o.z); d.rotation.set(0,o.ang,0); if(sy>.01) d.scale.set(1,sy,1); else d.scale.set(0,0,0); d.updateMatrix(); magliaPorte.setMatrixAt(j,d.matrix); });
    magliaPorte.instanceMatrix.needsUpdate=true;
    var cantPapi=false, paliSu=false, ala=anno>=536.9;
    passi.forEach(function(p,j){
      if(p.y==null){ var cx=Math.cos(p.ang)*p.len/2, cz=-Math.sin(p.ang)*p.len/2, ya=RM.h(p.x-cx,p.z-cz), yb=RM.h(p.x+cx,p.z+cz); p.y=(ya+yb)/2-.3; p.yt=ya-.3; p.pend=Math.atan2(yb-ya,p.len); }   // sui pendii la cortina segue il terreno invece di salire a gradoni
      var c=cant>=1?1:cant<=0?0:Math.max(.1,Math.min(1,(cant-p.turno*.55)/.45));      // quanto è alto questo tratto: 0,1 sono i primi filari sopra la fondazione, lungo tutto il tracciato
      /* lo stato del passo in quest'anno: quali danni sono aperti, se c'è il rattoppo di Belisario, se un papa ci sta lavorando */
      var senzaMerli=false, torreGiu=false, muroGiu=false, breccia=0, toppa=false, lavori=false;
      p.ev.forEach(function(e){ if(anno>=e.da&&anno<e.a){ if(e.tipo==='merli') senzaMerli=true; else if(e.tipo==='torre') torreGiu=true; else if(e.tipo==='muro') muroGiu=true; else if(e.tipo==='totila') breccia=RM.sfuma(e.da,e.da+.25,anno); else if(e.tipo==='toppa') toppa=true; }
        if(e.a>600&&e.a<9999&&anno>=e.a-.9&&anno<e.a&&anno>=e.da) lavori=true; });      // il ponteggio del papa nell'anno prima della fine del restauro
      var y=p.y, h=Math.max(alt*c,.0001), sy=h*(1-.75*breccia)*(muroGiu?.25:1)*(p.riva791&&r791?.12:1), piega=anno>=536.9&&p.piega?p.piega:0;
      d.position.set(p.x,y,p.z); d.rotation.set(piega,p.ang,p.pend,'YZX'); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix();
      if(toppa){ toppe.setMatrixAt(j,d.matrix); zero(tratti,j); d.rotation.set(piega,p.ang,p.pend,'YZX'); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix(); } else { tratti.setMatrixAt(j,d.matrix); zero(toppe,j); d.rotation.set(piega,p.ang,p.pend,'YZX'); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix(); }
      var mSu=!(senzaMerli||muroGiu||toppa||breccia>.02||(p.riva791&&r791));
      if(mSu){ (ala?merliA:merliP).setMatrixAt(j,d.matrix); zero(ala?merliP:merliA,j); } else { zero(merliA,j); zero(merliP,j); }
      if(toppa&&anno<553){ paliSu=true; d.rotation.set(0,p.ang,p.pend,'YZX'); d.scale.set(p.len/Math.cos(p.pend),1,1); d.updateMatrix(); pali.setMatrixAt(j,d.matrix); } else zero(pali,j);      // i pali di Belisario: quando li si tolse non è scritto, qui con la fine della guerra
      d.position.set(p.x-Math.cos(p.ang)*p.len/2,p.yt,p.z+Math.sin(p.ang)*p.len/2); d.rotation.set(0,p.ang,0,'YZX'); d.scale.set(1,torreGiu?h*.12:sy,1); d.updateMatrix(); torri.setMatrixAt(j,d.matrix);      // una torre a ogni passo; a terra resta il moncone
      d.rotation.order='XYZ';
      tinta.copy(anno>=p.rifatto?RICUPERO:p.mattone); if(toppa) tinta.multiply(PIETRA);
      tratti.setColorAt(j,tinta); torri.setColorAt(j,tinta); merliA.setColorAt(j,tinta); merliP.setColorAt(j,tinta); toppe.setColorAt(j,BIANCO);
      var rf=TEOD.indexOf(j)>=0&&anno>=493.5?493.5:0; p.ev.forEach(function(e){ if(e.a>530&&e.a<9999&&e.tipo!=='totila'&&anno>=e.a&&e.a>rf) rf=e.a; }); patI.array[j]=rf?pAn-PA(rf):pAn;      // patina: dall'ultimo restauro (Teodorico per ipotesi, Belisario nel 536, i papi); la fine della breccia di Totila non è un restauro: il rattoppo è di pietre vecchie
      var suPonteggio=rialzo||(c>.1&&c<1)||(teod&&TEOD.indexOf(j)>=0)||lavori;
      if(lavori) cantPapi=true;
      if(suPonteggio){ d.position.set(p.x,y,p.z); d.rotation.set(0,p.ang,p.pend); d.scale.set(p.len/Math.cos(p.pend),alt*Math.min(1,c+.2),1); } else d.scale.set(0,0,0);      // ponteggio sui tratti che stanno salendo, un poco più alto del muro
      d.updateMatrix(); ponteggi.setMatrixAt(j,d.matrix);
    });
    var inCantiere=(cant>0&&cant<1)||rialzo||teod||cantPapi;
    [tratti,torri,merliP,merliA,toppe,pali,ponteggi].forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
    [tratti,torri,merliP,merliA,toppe].forEach(function(m){ m.instanceColor.needsUpdate=true; }); patI.needsUpdate=true;
    ponteggi.visible=inCantiere; pali.visible=paliSu;
    tratti.visible=torri.visible=merliP.visible=merliA.visible=toppe.visible=alt>.01&&cant>0; magliaPorte.visible=porteSu>.01&&posti.length>0;
  };
})();

/* ---------- acquedotti ----------
   Tracciati rifatti il 24 novembre 2026 sulle fonti lette quel giorno, scritte accanto a ogni linea. Il canale scende con una pendenza minima: la sommità delle
   arcate è quasi orizzontale e sono le pile ad allungarsi o ad accorciarsi col terreno. Ogni punto è [x, z, quota della sommità, tipo del tratto che parte da lui]:
   'a' arcate; 'm' muro basso che segue il suolo (la Traiana, che arrivava al Gianicolo quasi a livello del terreno); 's' sotterraneo, non si disegna; 'p' porta della città
   scavalcata dall'acquedotto (si disegnano due pile e l'attico che porta il canale; sotto, dal 271, sta la porta delle mura); 'q' arco di js/monumenti.js che porta il canale
   (nessuna campata: si aggiunge solo l'attico, se il canale sta più in alto dell'arco). Le quote sono una ricostruzione, non un rilievo: tengono l'ordine noto (la Claudia più
   alta della Marcia a porta Maggiore, la Vergine bassa sul Campo Marzio) dentro un rilievo accentuato 1,8 volte; min è l'altezza minima della sommità sul suolo dove le fonti
   dicono che c'erano arcate. Claudia e Marcia cominciano al bordo della griglia del terreno misurato (x 436).
   La rovina nel tempo. Documentati: il taglio del 537 (Procopio); i quattro condotti rifatti da Adriano I (Liber Pontificalis, vita di Adriano, cc. 59-65): Sabbatina cioè Traiana
   e Iobia, rotte da vent'anni (quindi, per Duchesne, dall'assedio di Astolfo del 756 e in funzione prima), Claudia, che serviva il Laterano e portava ormai poca acqua, Vergine,
   «piena di rovine». La Iobia qui è la Marcia: è l'identificazione di Platner e Ashby (voce Aqua Marcia, letta il 24 novembre 2026: «The supply was increased by Diocletian, from
   whom it took the name forma Iovia (Iobia, Iopia)»; «The conduit was restored by Hadrian I (LPD I.504), Sergius II (II.91) and Nicolas I»). Altri, Lanciani e Duchesne, la
   mettono sul ramo per le terme di Caracalla, l'Antoniniano. La fonte non dice gli anni del cantiere: qui i quattro sono finiti fra il 774 e il 779, prima della tappa del 780.
   Ipotesi nostre: quali tratti cadono e quando, quanto fosse stato riparato dopo il 554, che l'Antoniniano (le terme di Caracalla non riaprono) e gli archi neroniani oltre il
   Patriarchio, mai nominati dalle fonti per l'VIII secolo, non vengano più rifatti. Quei tratti, dal 537, restano in piedi senza il canale, come rovine; un tratto in piedi di
   meno di cinque arcate accanto a un crollo cade anche lui, così non restano spezzoni isolati. I tratti rifatti nell'VIII secolo hanno il colore del mattone di recupero. */
var acque=(function(){
  var LINEE=[
    /* 0. Claudia e Anio Novus. OpenStreetMap, relazioni 17803359 e 17803361 (vie 243044347, 1000800331, 998191581; la relazione dice che i luoghi sono approssimati): lungo il
       Mandrione, poi sul tracciato delle mura (entro 5 m) fino all'angolo a sud di porta Maggiore, poi sopra la porta (relazione 13394492), dove finisce il condotto principale. */
    {passo:3.6, min:.8, p:[[436,228.2,9.9,'a'],[423.5,210.9,9.89,'a'],[412.2,177.7,9.88,'a'],[397.1,139.7,9.87,'a'],[389.3,127.2,9.86,'a'],[376.9,101.4,9.85,'a'],[350.6,75,9.83,'a'],
      [336,70.6,9.82,'a'],[318,63.4,9.81,'a'],[302.1,56.8,9.8,'a'],[275.9,40.7,9.78,'a'],[264.9,29.7,9.77,'a'],[244.9,17.4,9.76,'a'],[248.12,11.04,9.75,'p'],[249.48,8.36,9.745]]},
    /* 1. Marcia, Tepula, Giulia. Platner e Ashby, Aqua Marcia: i tre canali «are to be seen in section in the Aurelian wall, just to the right of the Porta Maior. From this point
       they have been made use of by it as far as the Porta Tiburtina», dove passano sull'arco di Augusto; poi «begin to run underground once more» fino al castello «at the north
       angle of the thermae Diocletiani» (OpenStreetMap, via 201568922). Fuori città è uno schema: lo stesso corridoio della Claudia, una quindicina di metri più a nord-est. */
    {passo:3.2, min:.8, castello:true, p:[[436,224,9.65,'a'],[423,207,9.64,'a'],[413.5,176.5,9.63,'a'],[398.5,138.5,9.62,'a'],[390.5,126,9.61,'a'],[378,100.2,9.6,'a'],[351.6,73.8,9.58,'a'],
      [337,69.4,9.57,'a'],[319,62.2,9.56,'a'],[303,55.6,9.55,'a'],[277,39.5,9.53,'a'],[262,21,9.5,'a'],[253.5,6.5,9.47,'a'],[247.55,2.85,9.46,'a'],[241.1,-12.3,9.45,'a'],
      [209.8,-50.8,9.44,'a'],[208.34,-53.94,9.435,'p'],[207.06,-56.66,9.43,'a'],[205.75,-59.46,9.42,'s'],[160,-95,9.3,'s'],[107,-140,9.2]]},
    /* 2. Vergine. Platner e Ashby, Aqua Virgo: sotto terra fino al Pincio, sulle arcate dalla curva presso via Capo le Case (posizione a memoria); un arco in via del Nazareno
       (OpenStreetMap, via 1390965274); passa la via Lata sull'arco di Claudio (js/monumenti.js: l'arco porta il canale, nessuna campata fra i suoi spigoli, a 0,7 unità dal centro
       lungo la direzione del muro); le arcate finiscono «near the north-west angle of the church of S. Ignazio», dove stava il castello (coordinate della chiesa a memoria). */
    {passo:1.5, min:.4, castello:true, p:[[-22,-175,4.15,'s'],[-19,-150,4.12,'s'],[-16,-121,4.1,'a'],[-13.2,-112.4,4.08,'a'],[-17,-93,4.05,'a'],[-32.7,-76.41,4.01,'a'],
      [-34.138,-75.987,4.0,'q',1.3,null,null,700],[-35.482,-75.593,4.0,'a'],[-36.92,-75.17,3.99,'a'],[-49,-74.5,3.97]]},
    /* 3. Traiana (Sabbatina). OpenStreetMap, vie 1331087548-1331087558 «Acquedotto Traiano» lungo l'Aurelia antica, dove oggi corre l'acqua Paola; il castello presso la porta
       Aurelia, poi San Pancrazio (it.wikipedia, «Acquedotto Traiano»): qui passa le mura una quarantina di metri a sud del fornice, che sta sull'angolo della cinta; poi giù dal Gianicolo verso i mulini e Trastevere (schema). */
    {passo:1.6, suolo:.5, p:[[-382,40.2,0,'m'],[-356.4,40.6,0,'m'],[-348.3,38.3,0,'m'],[-327.1,38.4,0,'m'],[-305.4,39.4,0,'m'],[-288.4,40.1,0,'m'],[-266.4,38.4,0,'m'],[-251,44.2,0,'m'],
      [-242.7,50.7,0,'m'],[-236.7,56,0,'m'],[-229.9,57.6,0,'m'],[-222,55.1,0,'m'],[-206,51.5,0,'m'],[-195.3,48.7,0,'m'],[-183,38,0,'m'],[-160,33,0]]},
    /* 4. Antoniniano (212-213), il ramo per le terme di Caracalla. Platner e Ashby, Aqua Marcia: l'inizio «is uncertain», forse presso il terzo miglio della via Latina; «crossed the
       via Appia by the so-called Arco di Druso and thence led to the great reservoir to the south-west of the thermae». Punti reali: i resti di piazza Galeria, dove le arcate escono
       dal terreno, e l'arco di Druso (OpenStreetMap); la quota sull'arco di Druso (fondo del canale a 41,4 m sul mare, circa otto metri sopra la strada) è misurata; il resto del
       profilo e l'arrivo alle cisterne delle terme (js/monumenti.js) sono ricostruiti. Dal 537 non torna più in uso: è un'ipotesi. */
    {passo:1.5, min:0, morto:true, p:[[175.4,200.9,4.28,'a'],[133.7,208.1,4.15,'a'],[68,175,4.02,'a'],[53.5,165.7,3.98]]},
    /* 5. Archi neroniani, il ramo della Claudia sul Celio, e il prolungamento di Domiziano fino al Palatino. OpenStreetMap, relazioni 13394499 «Aqua Neroniana», 1876737 e 1900744,
       vie 200350823 e 112174949 sul Celio, 131704036 e 131704118 ai piedi del Palatino; il punto 120,70, lungo via di Santo Stefano Rotondo, è un'ipotesi. Scavalca l'arco di Dolabella
       (js/monumenti.js). Fino al Patriarchio (x 156) è la Claudia che serve il Laterano e Adriano I la rifà; oltre, per ipotesi, resta in rovina dopo il 537. */
    {passo:3.2, min:.8, morto:function(x){ return x<156; }, p:[[244.9,17.4,9.74,'a'],[241,16.6,9.73,'a'],[234.6,18.1,9.71,'a'],[226,22,9.69,'a'],[220,27,9.67,'a'],[208,36.3,9.63,'a'],
      [204.5,39.3,9.62,'a'],[196.2,45.7,9.59,'a'],[186,51.3,9.56,'a'],[176.9,54.4,9.53,'a'],[156.7,57.1,9.46,'a'],[120,70,9.2,'a'],[87.1,81.7,8.9,'a'],[82.16,76.83,8.87,'q',.65,.89,.52],
      [81.56,76.29,8.86,'a'],[76.1,71.7,8.82,'a'],[71.1,66.9,8.78,'a'],[37,60.4,8.45,'a'],[32,59.4,8.4,'a'],[26,54,8.3]]}];
  var el=[], rnd=RM.casuale(537), CIMA=.48, PEZZI=new RM.Costruttore(), ATTICI_CADUTI=[];
  /* attico sopra una porta o sopra un arco: da sopra il fornice (alto «sotto») fino alla sommità del canale; per le porte anche le due pile ai lati del passaggio */
  /* Sopra un arco che c'era già (a[5]: il suo orientamento, a[6]: la sua profondità; 27 novembre 2026, l'arco di Dolabella): la muratura sta sulla pianta dell'arco, di mattone come
     gli archi neroniani, e non più larga di lui; prima era un blocco di travertino più profondo dell'arco (0,95 contro 0,52) e girato sul tracciato, che da vicino lo copriva come
     un pilone. Platner e Ashby, Arcus Dolabellae et Silani: l'arco «is usually supposed to have been built to support a branch of the aqua Marcia …, and afterwards to have been used
     by Nero in his extension of the aqua Claudia, the arcus Neroniani»: il canale gli passava sopra. Il contorno dell'arco su OpenStreetMap (Nominatim, «Porta Caelimontana») dà
     l'orientamento del modello (0,89). Altezza e forma della muratura sopra l'arco sono uno schema. */
  function attico(a,b,sotto,pile){
    var mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, L=Math.hypot(b[0]-a[0],b[1]-a[1]), y0=RM.h(mx,mz)-.3, su=(a[2]+b[2])/2-y0, sopraArco=a[5]!=null, dp=sopraArco?a[6]:.95;
    if(su<sotto+.05) return;
    var dove=PEZZI; if(a[7]){ dove=new RM.Costruttore(); ATTICI_CADUTI.push({B:dove,fino:a[7]}); }      // a[7]: l'anno in cui l'attico cade con l'arco (la Vergine sull'arco di Claudio)
    dove.dentro(mx,y0,mz,sopraArco?a[5]:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),function(B){
      if(pile) B.scatola(.62,sotto,.95,-(L/2-.31),0,0,P.travertino).scatola(.62,sotto,.95,L/2-.31,0,0,P.travertino);
      if(sopraArco) B.scatola(L-.04,su-sotto-.12,dp-.06,0,sotto,0,P.mattone).scatola(L,.12,dp,0,su-.12,0,P.travertino);      // muratura neroniana appena arretrata dal filo dell'arco (20-30 cm), il canale in cima
      else B.scatola(L,su-sotto,.95,0,sotto,0,P.travertino).scatola(L+.12,.07,1.05,0,su-.07,0,P.travertino);
    });
  }
  /* castello d'acqua alla fine di una linea: posizione dalle fonti dette sopra, forma e misure indicative */
  function castello(q,ultimo){
    var y=RM.h(q[0],q[1])-.2, su=ultimo==='s'?1.1:Math.max(1.1,q[2]-y+.1);
    PEZZI.scatola(1.3,su,1.3,q[0],y,q[1],P.mattone).scatola(1.42,.08,1.42,q[0],y+su,q[1],P.tufo);
  }
  LINEE.forEach(function(l,li){
    var ord=0;
    for(var i=0;i<l.p.length-1;i++){
      var a=l.p[i], b=l.p[i+1], tipo=a[3], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/l.passo)), ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]), ux=(b[0]-a[0])/L, uz=(b[1]-a[1])/L;
      if(tipo==='p') attico(a,b,1.3,true);
      if(tipo==='q') attico(a,b,a[4],false);
      if(tipo!=='a'&&tipo!=='m'){ ord+=2; continue; }
      for(var k=0;k<n;k++){
        var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, len=L/n, y=RM.h(x,z), ya=RM.h(x-ux*len/2,z-uz*len/2), yb=RM.h(x+ux*len/2,z+uz*len/2), m=tipo==='m', giu=m?y:Math.min(y,ya,yb);
        var cima=m?y+l.suolo:Math.max(a[2]+(b[2]-a[2])*t,y+(l.min||0)), morto=typeof l.morto==='function'?l.morto(x,z):!!l.morto;
        el.push({li:li,ord:ord++,perso:morto,x:x,z:z,ang:ang,len:len,y:giu-.2,cima:cima,suolo:m,pend:m?Math.atan2(yb-ya,len):0,vis:m||cima-y>.3,rot:rnd(),blocco:li*1000+i*100+Math.floor(k/6),blocchetto:li*1000+i*100+Math.floor(k/(morto?6:3))});
      }
    }
    if(l.castello) castello(l.p[l.p.length-1],l.p[l.p.length-2][3]);
  });
  /* RIPARA e INCURIA, per linea: quota dei tagli riparati dopo il 554; quota dei tratti che cedono per incuria fra VI e VIII secolo. VENTI: le linee «rotte da vent'anni» del
     Liber Pontificalis, la Marcia (Iobia) e la Sabbatina, di nuovo rotte probabilmente nell'assedio di Astolfo. I tratti in rovina (perso) non si riparano e cedono di più. */
  var sorte={}, RIPARA=[.5,.85,.4,1,0,.5], INCURIA=[.3,.2,.35,.1,.2,.3], VENTI={1:1,3:1};
  el.forEach(function(e){
    var b=sorte[e.blocco]||(sorte[e.blocco]=[rnd(),rnd(),rnd(),rnd()]), c=sorte['c'+e.blocchetto]||(sorte['c'+e.blocchetto]=[rnd(),rnd()]);
    e.taglio=b[0]<.4?536.5+b[1]*.48:9999;
    e.ripara=e.taglio<9999&&!e.perso&&b[2]<RIPARA[e.li]?556+b[3]*50:9999;
    e.cede=c[0]<(e.perso?.45:INCURIA[e.li])?570+c[1]*190:9999;
    e.rotto756=VENTI[e.li]&&b[1]<.45?756+b[3]*.4:9999;
    e.rifatto=e.perso?9999:774+b[3]*5.5;
  });
  /* La Vergine sulla via Lata (27 novembre 2026). Platner e Ashby, Arcus Claudii (2): l'arco «formed part of the aqua Virgo, where this aqueduct crossed the via Lata, just north
     of the Saepta. It seems to have been in ruins as early as the eighth century»; Aqua Virgo: «It was repaired by Hadrian I», e il Liber Pontificalis (vita di Adriano I, c. LXV,
     Duchesne I, p. 505) dice la forma Virginis «demolita atque a ruinis plena», tanto che «vix modica aqua in urbe Roma ingrediebat», rifatta «a noviter» fino a dissetare «poene
     totam civitatem». Prima il modello faceva crollare l'arco nel 700 e lasciava il canale intatto ai suoi lati e sopra. Ora con l'arco (700, anno scelto) cadono la campata
     che lo tocca da ogni lato e l'attico; le arcate oltre la via Lata, verso i Saepta, restano senza canale e Adriano I non le rifà, perché l'arco resta in rovina: dove portasse
     l'acqua rifatta da Adriano, la fonte non lo dice. Sono scelte, dette nella scheda dell'arco. */
  el.forEach(function(e){ if(e.li!==2) return; var dA=Math.hypot(e.x+34.81,e.z+75.79);
    if(dA<2.6){ e.cede=Math.min(e.cede,700); e.rifatto=9999; e.cadeArco=true; }
    if(e.x<-35){ e.spentaDa=700; e.rifatto=9999; } });
  el=el.filter(function(e){ return e.vis; }); RM.campateAcquedotti=el;          // sotto le arcate non si costruisce (js/citta.js)
  /* arcata: due mezze pile, arco a tutto sesto, canale; senza canale per i tratti in rovina. Pila: le due mezze pile sotto l'imposta, allungate fino al suolo */
  var r=.3, c=.36, k, a0, a1;
  function arcata(canale){
    var A=new RM.Costruttore();
    [-1,1].forEach(function(s){ A.scatola(.2,c,1,s*.4,0,0,P.tufo); });
    for(var k=0;k<8;k++){
      a0=PI*k/8; a1=PI*(k+1)/8; var x0=r*Math.cos(a0), x1=r*Math.cos(a1), h0=r*Math.sin(a0), h1=r*Math.sin(a1);
      A.quad([x0,h0,.5],[x1,h1,.5],[x1,c,.5],[x0,c,.5],P.tufo).quad([x0,h0,-.5],[x1,h1,-.5],[x1,c,-.5],[x0,c,-.5],P.tufo).quad([x0,h0,.5],[x1,h1,.5],[x1,h1,-.5],[x0,h0,-.5],P.ombra);
    }
    if(canale) A.scatola(1,CIMA-c,1.1,0,c,0,P.travertino);
    return A.geometria();
  }
  var Pl=new RM.Costruttore(); [-1,1].forEach(function(s){ Pl.scatola(.2,1,1,s*.4,0,0,P.tufo); });
  var R=new RM.Costruttore().scatola(.42,.5,.95,0,0,0,P.tufo); R.quad([-.21,.5,.47],[.21,.5,.47],[.21,.5,-.47],[-.21,.95,-.47],P.tufo).tri([-.21,.5,.47],[-.21,.95,-.47],[-.21,.5,-.47],P.tufo);   // moncone
  var mat=RM.matPietra(classe('acquedotti')), N=el.length, arcate=istanze(arcata(true),mat,N*2), spente=istanze(arcata(false),mat,N*2), pile=istanze(Pl.geometria(),mat,N), monconi=istanze(R.geometria(),mat,N), ultimo=-1, tinta=new THREE.Color(), MATTONE=RM.col(0xe4c6b2), BIANCO=new THREE.Color(1,1,1);
  var pezzi=PEZZI.maglia(mat); pezzi.castShadow=pezzi.receiveShadow=true; RM.scene.add(pezzi);
  ATTICI_CADUTI.forEach(function(o){ o.m=o.B.maglia(mat); o.m.castShadow=o.m.receiveShadow=true; RM.scene.add(o.m); });
  function quale(c){ var e=el[c.instanceId%N]; return e&&e.li===4?'antoniniano':'acquedotti'; }
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:arcate,id:quale},{maglia:spente,id:quale},{maglia:pile,id:quale},{maglia:monconi,id:quale},{maglia:pezzi,id:'acquedotti'}]);
  for(k=0;k<N;k++) monconi.setColorAt(k,BIANCO);                                 // le maglie condividono il materiale: tutte devono avere il colore per istanza
  function zero(maglia,j){ d.scale.set(0,0,0); d.updateMatrix(); maglia.setMatrixAt(j,d.matrix); }
  function vicino(i,j){ return j>=0&&j<el.length&&el[j].li===el[i].li&&Math.abs(el[j].ord-el[i].ord)===1; }
  return function(anno){
    var passo=Math.round(anno*4); if(passo===ultimo) return; ultimo=passo;
    ATTICI_CADUTI.forEach(function(o){ o.m.visible=anno<o.fino; });
    var st=el.map(function(e){
      var riparato=e.ripara<9999, perIncuria=e.cede<9999&&!(riparato&&e.cede<e.ripara);        // un crollo precedente alla riparazione viene rimesso su con quella
      var giuTaglio=anno>=e.taglio&&!(anno>=e.ripara), giuIncuria=anno>=e.cede&&(perIncuria||anno<e.ripara), caduto=giuTaglio||giuIncuria||anno>=e.rotto756;
      var rifatto=anno>=e.rifatto;
      return {rotto:caduto&&!rifatto, da:giuTaglio?e.taglio:giuIncuria?e.cede:e.rotto756, toppa:rifatto&&((e.taglio<9999&&!riparato)||(perIncuria&&e.cede<e.rifatto)||e.rotto756<9999)};
    });
    /* niente spezzoni: un tratto in piedi di meno di cinque arcate, chiuso da un crollo almeno da un lato, cade anche lui */
    for(var i=0;i<el.length;){
      if(st[i].rotto){ i++; continue; }
      var j=i; while(vicino(j,j+1)&&!st[j+1].rotto) j++;
      var prima=vicino(i,i-1)&&st[i-1].rotto, dopo=vicino(j,j+1)&&st[j+1].rotto;
      if(j-i<4&&(prima||dopo)){ for(var q=i;q<=j;q++){ st[q].rotto=true; st[q].da=prima?st[i-1].da:st[j+1].da; } }
      i=j+1;
    }
    el.forEach(function(e,j){
      var s=st[j], rotto=s.rotto, spenta=(e.perso&&anno>=537)||anno>=(e.spentaDa||9999), ar=spenta?spente:arcate, T=CIMA*e.len, larga=e.suolo?.6:.8, H=e.cima-e.y, Hp=H-T;
      d.rotation.set(0,e.ang,0);
      zero(spenta?arcate:spente,j); zero(spenta?arcate:spente,N+j);
      if(rotto){ zero(ar,j); zero(ar,N+j); zero(pile,j); }
      else if(e.suolo){ d.rotation.z=e.pend; d.position.set(e.x,e.y,e.z); d.scale.set(e.len/Math.cos(e.pend)+.05,H/CIMA,larga); d.updateMatrix(); ar.setMatrixAt(j,d.matrix); d.rotation.z=0; zero(ar,N+j); zero(pile,j); }
      else{
        d.position.set(e.x,e.cima-T,e.z); d.scale.set(e.len,e.len,larga); d.updateMatrix(); ar.setMatrixAt(j,d.matrix);
        if(Hp>.02){ d.position.y=e.y; d.scale.set(e.len,Hp,larga); d.updateMatrix(); pile.setMatrixAt(j,d.matrix); } else zero(pile,j);
        if(Hp>T*1.7){ d.position.y=e.y+Hp*.5-T*.5; d.scale.set(e.len,e.len,larga); d.updateMatrix(); ar.setMatrixAt(N+j,d.matrix); } else zero(ar,N+j);
      }
      if(rotto){ d.position.set(e.x-Math.cos(e.ang)*e.len/2,e.y,e.z+Math.sin(e.ang)*e.len/2); d.scale.set(e.len,H*(.25+.6*e.rot)*(1-.45*RM.sfuma(0,220,anno-s.da)),larga); d.updateMatrix(); monconi.setMatrixAt(j,d.matrix); }
      else zero(monconi,j);
      tinta.copy(s.toppa?MATTONE:BIANCO); arcate.setColorAt(j,tinta); arcate.setColorAt(N+j,tinta); spente.setColorAt(j,tinta); spente.setColorAt(N+j,tinta); pile.setColorAt(j,tinta);
    });
    arcate.instanceMatrix.needsUpdate=true; spente.instanceMatrix.needsUpdate=true; pile.instanceMatrix.needsUpdate=true; monconi.instanceMatrix.needsUpdate=true;
    arcate.instanceColor.needsUpdate=true; spente.instanceColor.needsUpdate=true; pile.instanceColor.needsUpdate=true;
  };
})();

/* ---------- ponti e Isola Tiberina ---------- */
(function(){
  /* Certezza, ponte per ponte: Elio, i due dell'isola, Emilio (ponte Rotto) e Milvio sono in piedi o lo sono le loro pile (A); dell'Aurelio si sono trovati i resti sotto ponte Sisto (B);
     il ponte di Probo è noto solo dai cataloghi, e il sito è dedotto da quello del ponte di Teodosio, le cui ultime pile furono tolte nel 1878 (C). */
  /* Ogni ponte con la sua storia (Platner e Ashby, voci Pons …, lette il 23 novembre 2026): il ponte di Probo è «a new construction of the emperor Probus (276–282)», poi rifatto da
     Teodosio (384-387): nel modello compare nel 280; l'Aurelio, rifatto da Valentiniano I nel 365-366, fu «partially destroyed in 772, hence the name ruptus»: da allora gli manca un'arcata;
     il Neroniano, subito sotto ponte Vittorio Emanuele, era in rovina «probably in the fourth [century], as it is not mentioned in Not.»: qui intero fino al 300 e poi le sole pile (l'anno
     è un'ipotesi); posizione dalla via OpenStreetMap 226257804. Il ponte di Agrippa (noto da un cippo di Claudio) e il Sublicio, di legno, «standing as late as the fifth century»
     ma in un punto discusso, non si disegnano. */
  /* 25 novembre 2026: ogni ponte con nome ha una scheda (SCHEDE in js/dati.js) e si apre col clic; l'isola ha due ponti, il Fabricio e il Cestio, con le misure di Platner e Ashby,
     al posto di un ponte di 150 m che la scavalcava; c'è il Sublicio, di legno, fino al V secolo; i cantieri attestati (Aurelio 365-366, Cestio finito nel 369, Probo-Teodosio 384-387)
     hanno i ponteggi; le testate finiscono nelle strade (VIE in src/roma/genera.mjs). Fonti e ipotesi accanto a ciascuno, più sotto, e in src/testi/scene-roma-fonti.md, «Ponti e isola Tiberina». */
  var PC={A:new RM.Costruttore(),B:new RM.Costruttore(),C:new RM.Costruttore()}, B, curva=RM.curvaFiume, storie=[], cantieri=[], dati=[];
  RM.ponti=[];
  function vicino(x,z){ var m=1e9, tm=0, i, q; for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); var dd=Math.hypot(q.x-x,q.z-z); if(dd<m){ m=dd; tm=i/2400; } } return tm; }
  /* d unità lungo il fiume, misurate sulla curva (a valle se d>0): la curva non va a passo costante, e presso il ponte Emilio un tratto di parametro vale la metà che altrove */
  function avanza(t,d){ var s=0, a=curva.getPoint(t), b, dt=(d<0?-1:1)*2e-5; while(s<Math.abs(d)){ t+=dt; b=curva.getPoint(t); s+=Math.hypot(b.x-a.x,b.z-a.z); a=b; } return t; }
  function asse(t){ var q=curva.getPoint(t), g=curva.getTangent(t), n=Math.hypot(g.x,g.z)||1; return {q:q, tg:[g.x/n,g.z/n], dx:[-g.z/n,g.x/n], rot:Math.atan2(-g.x,-g.z)}; }      // dx: verso la riva destra; è l'asse x locale dei ponti
  /* l'isola: il contorno (riempito più sotto), per sapere dove il terreno è il suo piano (0,35) e non il letto del fiume */
  var isolaBordo=[];
  function sullIsola(x,z){ var p=isolaBordo, d=false; for(var i=0,j=p.length-1;i<p.length;j=i++){ if((p[i][1]>z)!==(p[j][1]>z) && x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0]) d=!d; } return d; }
  function suolo(x,z){ return sullIsola(x,z)?.35:(RM.hSuolo||RM.h)(x,z); }
  /* ponteggio di un cantiere: pali e correnti sui due fianchi dell'impalcato. La forma è uno schema, come quella dei ponteggi dei monumenti */
  function impalcatura(B,mezzo,larga,alto){ var x; for(x=-mezzo;x<=mezzo+.01;x+=.75){ B.scatola(.05,alto,.05,x,0,larga+.12,P.tronco).scatola(.05,alto,.05,x,0,-larga-.12,P.tronco); }
    [.35,.7,1].forEach(function(f){ B.scatola(2*mezzo,.04,.06,0,alto*f-.04,larga+.12,P.tronco).scatola(2*mezzo,.04,.06,0,alto*f-.04,-larga-.12,P.tronco); }); }
  /* un'arcata fra due pile: i due fianchi sotto l'impalcato e l'intradosso, a mezzo ovale (23 novembre 2026: prima i ponti erano tavole posate su quattro blocchi).
     Il numero delle arcate è lo stesso per tutti e non è quello di ciascun ponte vero. */
  function arcata(B,x0,x1,ys,yc,w,col){ var N=8, k, xa, xb, ya, yb;
    for(k=0;k<N;k++){ xa=x0+(x1-x0)*k/N; xb=x0+(x1-x0)*(k+1)/N; ya=ys+(yc-ys)*Math.sin(Math.PI*k/N); yb=ys+(yc-ys)*Math.sin(Math.PI*(k+1)/N);
      B.quad([xa,ya,w],[xb,yb,w],[xb,yc,w],[xa,yc,w],col).quad([xb,yb,-w],[xa,ya,-w],[xa,yc,-w],[xb,yc,-w],col).quad([xa,ya,-w],[xb,yb,-w],[xb,yb,w],[xa,ya,w],col); } }
  function ponte(B,parti,q,rot){      // parti: 'tutto', 'rotto' (senza un'arcata), 'pile'. Restituisce i piedi delle rampe
    var piedi=null;
    [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.5,parti==='pile'?.45:.6,.5,x,0,.75,P.travertino,Math.PI/4).scatola(.5,parti==='pile'?.45:.6,.5,x,0,-.75,P.travertino,Math.PI/4); });      // i rostri delle pile
    if(parti!=='pile') (parti==='rotto'?[[-5.6,-4.75],[-4.05,-1.85],[4.75,5.6]]:[[-5.6,-4.75],[-4.05,-1.85],[-1.15,1.15],[1.85,4.05],[4.75,5.6]]).forEach(function(c){ arcata(B,c[0],c[1],.25,.87,.65,P.travertino); });
    if(parti!=='pile'){ piedi=rampe(B,q,rot,7.5,1.15,.65,P.travertino,suolo);
      if(parti==='rotto'){ B.scatola(6.8,.3,1.3,-4.1,.85,0,P.travertino).scatola(5.2,.3,1.3,4.9,.85,0,P.travertino); }      // manca il tratto fra le due pile centrali
      else B.scatola(15,.3,1.3,0,.85,0,P.travertino).scatola(15,.16,.12,0,1.15,.6,P.travertino).scatola(15,.16,.12,0,1.15,-.6,P.travertino);
    }
    [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.7,parti==='pile'?.6:.9,1.5,x,0,0,P.travertino); });
    if(parti!=='pile') B.scatola(2,.9,1.3,-6.6,0,0,P.travertino).scatola(2,.9,1.3,6.6,0,0,P.travertino);
    return piedi;
  }
  /* Un ponte con le arcate misurate (il Fabricio e il Cestio): parti è la fila, da sinistra a destra, di [larghezza, freccia dell'arco] (freccia 0: muratura piena dal fiume
     all'impalcato); db: intradosso dell'impalcato, yTop: il piano; coordinate locali, origine a -0,5 (il pelo dell'acqua). Restituisce la metà della lunghezza */
  function misurato(B,parti,larga,db,yTop,col){ var tot=parti.reduce(function(a,p){ return a+p[0]; },0), x=-tot/2;
    parti.forEach(function(p){ var x1=x+p[0]; if(p[1]) arcata(B,x,x1,db-p[1],db,larga,col); else B.scatola(p[0],db,2*larga,(x+x1)/2,0,0,col); x=x1; });
    B.scatola(tot,yTop-db,2*larga,0,db,0,col).scatola(tot,.14,.1,0,yTop,larga-.05,col).scatola(tot,.14,.1,0,yTop,-larga+.05,col);      // impalcato e parapetti
    return tot/2; }
  /* il Sublicio, di legno: stilate di due pali con la traversa, ogni undici metri, e l'impalcato di tavole. Forma, passo e misure sono uno schema: la fonte dice solo che era di legno */
  function legname(B,mezzo,larga,yTop){ var x;
    for(x=-mezzo+.5;x<mezzo;x+=1.1){ B.scatola(.12,yTop-.1,.12,x,0,larga-.08,P.tronco).scatola(.12,yTop-.1,.12,x,0,-larga+.08,P.tronco).scatola(.14,.1,2*larga+.24,x,yTop-.32,0,P.tronco); }
    B.scatola(2*mezzo,.1,2*larga,0,yTop-.1,0,P.tronco).scatola(2*mezzo,.08,.06,0,yTop+.12,larga-.03,P.tronco).scatola(2*mezzo,.08,.06,0,yTop+.12,-larga+.03,P.tronco);
    for(x=-mezzo;x<=mezzo+.01;x+=.8){ B.scatola(.05,.2,.05,x,yTop,larga-.03,P.tronco).scatola(.05,.2,.05,x,yTop,-larga+.03,P.tronco); } }
  /* Isola Tiberina. «The present length of the island is 269 metres, and its greatest width 67 metres»; «the island itself was made to resemble a ship. A stone platform was built
     round it, and upon this a wall was erected which in shape reproduced exactly the sides of a Roman ship»; l'obelisco «is thought to have represented the mast» (Platner e Ashby,
     Insula Tiberina, letto il 23 novembre 2026). Quale capo fosse la prua la voce non lo dice in modo univoco (poppa a est nel testo, prua a est in una nota): qui i due capi sono
     a punta, quello a valle di più. Prima l'isola era un ovale di 46 x 132 m. Segue la curva del fiume; il fiume del modello è largo 112 m dappertutto, quindi i due rami
     restano più stretti del vero. Dal 25 novembre 2026 la lunghezza si misura lungo la curva (prima era in passi di parametro, e l'isola veniva più corta del vero).
     Il fiume del modello, preso dalla linea del Tevere di OpenStreetMap, qui corre nel ramo di Trastevere: l'isola vera sta 70-80 m più a nord del suo centro e il ponte Fabricio vero
     140 m a nord di quello disegnato. I due ponti stanno quindi dove li mette il fiume del modello, nell'ordine vero: il Cestio dove c'è il ponte Cestio, il Fabricio una ventina di metri
     a valle, come ponte Fabricio rispetto a ponte Cestio su OpenStreetMap (relazioni 5676411 e 5676410). */
  var tC=vicino(-66,28), tIs=avanza(tC,-3.2), MEZZA=13.45, NI=14, WI=3.35, isS=[], isD=[];      // il centro dell'isola 32 m a monte del Cestio: il capo a valle resta prima del ponte Emilio
  (function(){ for(var i=0;i<=NI*2;i++){ var u=i/NI-1, A=asse(avanza(tIs,u*MEZZA)), w=WI*Math.pow(1-Math.pow(Math.abs(u),u<0?2.6:1.7),.75), c=A.q, n=A.dx;
      isS.push([c.x-n[0]*w,c.z-n[1]*w,c.x-n[0]*w*.9,c.z-n[1]*w*.9]); isD.push([c.x+n[0]*w,c.z+n[1]*w,c.x+n[0]*w*.9,c.z+n[1]*w*.9]); }
    isolaBordo=isS.map(function(p){ return [p[0],p[1]]; }).concat(isD.slice().reverse().map(function(p){ return [p[0],p[1]]; })); })();
  RM.isolaTiberina={bordo:isolaBordo, dentro:sullIsola, piano:.35};      // per le scene e le prove
  var GENERICI=[      // [x, z, classe, dal, rotto, pile, rotazione fissa, id, nome, cantiere [da, a]]
    [-156.1,-104.37,'A',0,null,null,1.63,'ponteelio','Ponte Elio'],
    [-120,1,'B',0,772,null,null,'ponteaurelio','Ponte Aurelio',[364.6,367]],      // «rebuilding of arch and bridge by Valentinian I in 365-366» (Platner e Ashby, Pons Aurelius, letto il 25 novembre 2026)
    [-52,38,'A',0,null,null,null,'ponteemilio','Ponte Emilio'],
    [-84,97,'C',280,null,null,null,'ponteprobo','Ponte di Probo',[383,388]],      // i lavori del ponte di Teodosio: cominciati prima del 384, non finiti nel 387 (lettere di Simmaco, in Platner e Ashby, Pons Probi). Inizio e fine nel modello sono ipotesi
    [-152,-479,'A',0,null,null,null,'pontemilvio','Ponte Milvio',null,[311.6,313]],      // l'undicesimo campo: gli anni in cui il ponte si mostra interrotto (312, Lattanzio 44, 9: si veda il blocco del 312 più sotto)
    [-173.5,-92.6,'C',0,null,300,null,'ponteneroniano','Ponte Neroniano']];
  GENERICI.forEach(function(p){     // Elio, Aurelio (ponte Sisto), Emilio, Probo, Milvio, Neroniano
    var q, A=asse(vicino(p[0],p[1])), rot=A.rot; q=A.q;            // l'asse x locale attraversa il fiume
    /* Ponte Elio (24 novembre 2026): centro e asse sono quelli di ponte Sant'Angelo su OpenStreetMap (way 25752465: 3,65 gradi da nord verso ovest), non la perpendicolare al fiume
       del modello, che lo girava di 8,4 gradi e lo faceva arrivare 15 m a ovest della porta del mausoleo. */
    if(p[6]!=null){ q=new THREE.Vector3(p[0],q.y,p[1]); rot=p[6]; RM.ponteElio={x:p[0], z:p[1], asse:[Math.cos(rot),-Math.sin(rot)]}; }
    var piedi=null, info={id:p[7], nome:p[8], x:q.x, z:q.z, rot:rot, mezzo:7.5, larga:.65, yTop:.65, classe:p[2]};
    if(!p[3] && !p[4] && !p[5] && !p[10]){ PC[p[2]].dentro(q.x,-.5,q.z,rot,function(B){ piedi=ponte(B,'tutto',q,rot); }); info.comune=p[2]; }      // i ponti che non cambiano restano nella maglia comune
    else { var mat=RM.matPietra(p[2]), fa=function(parti){ var C=new RM.Costruttore(); C.dentro(q.x,-.5,q.z,rot,function(B){ var pp=ponte(B,parti,q,rot); if(pp) piedi=pp; }); var g=C.maglia(mat); g.visible=false; RM.scene.add(g); return g; };
      var s={dal:p[3]||0, rotto:p[4], pile:p[5], taglio:p[10], intero:fa('tutto'), mezzo:(p[4]||p[10])?fa('rotto'):null, resti:p[5]?fa('pile'):null}; storie.push(s);
      RM.cliccabili=(RM.cliccabili||[]).concat([s.intero,s.mezzo,s.resti].filter(Boolean).map(function(g){ return {maglia:g, id:p[7]}; })); }
    if(p[9]) cantieri.push({da:p[9][0], a:p[9][1], g:scaffale(q,rot,7.5,.65,1.15)});
    info.piedi=piedi; RM.ponti.push(info);
  });
  function scaffale(q,rot,mezzo,larga,yTop){ var C=new RM.Costruttore(); C.dentro(q.x,-.5,q.z,rot,function(B){ impalcatura(B,mezzo,larga,yTop+.35); }); var g=C.maglia(RM.matPietra()); g.visible=false; g.receiveShadow=false; RM.scene.add(g); return g; }
  /* I due ponti dell'isola (Platner e Ashby, Pons Fabricius e Pons Cestius, letti il 25 novembre 2026).
     Fabricio: del 62 a.C., «between the left bank of the river and the island», lungo 62 m, due arcate di circa 24,25 e 24,50 m con un'arcata piccola fra loro, tufo e peperino
     rivestiti di travertino; «the best preserved bridge in Rome, being practically the original structure»: intero per tutto il periodo. La larghezza (6 m), le spalle e la luce
     dell'arcata piccola (4 m) non sono nella voce: schema.
     Cestio: «the first stone bridge from the island to the right bank»; sostituito da «what was practically a new structure, which the Emperors Valentinian I, Valens and Gratian
     finished in 369», dedicato nel 370 come pons Gratiani: «48 metres long and 8.20 wide», un'arcata centrale di 23,65 m e una piccola per lato di 5,80. Si disegna il ponte di
     Graziano, il solo di cui si sappiano le misure; com'era il ponte di prima la voce non lo dice. Il cantiere ha i ponteggi dal 367 al 369: la fine è della fonte, l'inizio è
     un'ipotesi (Graziano è augusto dall'agosto 367). Le pile e le spalle (4 m e 2,5 m) sono schema.
     Le arcate sono a tutto sesto e partono dal pelo dell'acqua del modello: l'impalcato sta così a 8,5 m, due metri sopra quello degli altri ponti; scende al piano dell'isola
     e alle rive con le rampe. */
  var A=asse(tC), F=asse(avanza(tC,2.1)), DB=1.24, YT=1.35;
  function dueSponde(Ax,lat,mezzo,larga,parti,id,nome){
    var q={x:Ax.q.x+Ax.dx[0]*lat, z:Ax.q.z+Ax.dx[1]*lat}, piedi=null;
    PC.A.dentro(q.x,-.5,q.z,Ax.rot,function(B){ misurato(B,parti,larga,DB,YT,P.travertino); piedi=rampe(B,q,Ax.rot,mezzo,YT,larga,P.travertino,suolo); });
    var pile=[], xp=-mezzo; parti.forEach(function(p,i){ if(p[1]===0 && i>0 && i<parti.length-1) pile.push([xp+p[0]/2,p[0]/2]); xp+=p[0]; });      // centro e mezza larghezza delle pile, per la schiuma del fiume (js/base.js, pileFiume; 27 novembre 2026)
    RM.ponti.push({id:id, nome:nome, x:q.x, z:q.z, rot:Ax.rot, mezzo:mezzo, larga:larga, yTop:YT-.5, classe:'A', comune:'A', piedi:piedi, pile:pile}); return q; }
  /* il capo sull'isola sta sull'orlo di travertino; il resto, più lungo del ramo del fiume del modello (22 m), finisce sulla riva */
  function orlo(d){ var u=d/MEZZA; return WI*Math.pow(1-Math.pow(Math.abs(u),u<0?2.6:1.7),.75); }      // mezza larghezza dell'isola a d unità dal suo centro
  var qF=dueSponde(F,-(orlo(5.3)+3.11-.15),3.11,.3,[[.27,0],[2.425,1.21],[.2,0],[.4,.2],[.2,0],[2.45,1.22],[.275,0]],'pontefabricio','Ponte Fabricio');      // dalla riva sinistra (-x) all'isola
  var qC=dueSponde(A,orlo(3.2)+2.42-.15,2.42,.41,[[.26,0],[.58,.29],[.4,0],[2.365,1.18],[.4,0],[.58,.29],[.255,0]],'pontecestio','Ponte Cestio');           // dall'isola a Trastevere (+x)
  cantieri.push({da:367,a:369.9,g:scaffale(qC,A.rot,2.42,.41,YT)});
  /* Il Sublicio, di legno: «The strongest evidence indicates that it crossed from the forum Boarium just below the later pons Aemilius»; «constructed of wood without metal of any sort
     whatsoever»; «the bridge was always repaired and was standing as late as the fifth century» (Platner e Ashby, Pons Sublicius, letto il 25 novembre 2026; la posizione «has been the
     subject of much dispute»). Qui 150 m a valle del ponte Emilio, dove la riva sinistra arriva all'inizio della via Ostiense (più a monte la rampa cadeva sul tempio rotondo), fino al 500: dopo il V secolo le fonti lette tacciono, e l'anno della fine è un'ipotesi. Lunghezza, larghezza, stilate
     e altezza dell'impalcato (4,5 m) sono schema. */
  var S=asse(avanza(vicino(-52,38),15)), sub=new RM.Costruttore(), subPiedi=null;
  sub.dentro(S.q.x,-.5,S.q.z,S.rot,function(B){ legname(B,6.6,.3,.95); subPiedi=rampe(B,S.q,S.rot,6.6,.95,.3,P.tronco,suolo); });
  var gSub=sub.maglia(RM.matPietra('C')); RM.scene.add(gSub); storie.push({dal:0, fino:500, intero:gSub});
  RM.ponti.push({id:'pontesublicio', nome:'Ponte Sublicio', x:S.q.x, z:S.q.z, rot:S.rot, mezzo:6.6, larga:.3, yTop:.45, classe:'C', piedi:subPiedi});
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:gSub, id:'pontesublicio'}]);
  RM.moduli.push(function(anno){ storie.forEach(function(s){
    var su=anno>=s.dal&&!(s.fino&&anno>=s.fino), r=(s.rotto&&anno>=s.rotto)||(s.taglio&&anno>=s.taglio[0]&&anno<s.taglio[1]), pi=s.pile&&anno>=s.pile;      // taglio: un varco solo in quegli anni (ponte Milvio nel 312)
    s.intero.visible=su&&!r&&!pi; if(s.mezzo) s.mezzo.visible=su&&r; if(s.resti) s.resti.visible=pi; });
    cantieri.forEach(function(c){ c.g.visible=anno>=c.da&&anno<c.a; }); });
  /* l'isola: fiancate di travertino e piano.
     27 novembre 2026 (l'utente: «E l'isola Tiberina?»; voce Insula Tiberina di Platner e Ashby riletta lo stesso giorno, src/testi/topografia-fonti.md, «La patina del tempo»):
     isola, obelisco e case hanno ora maglie loro, fuori dalla maglia comune dei ponti. L'isola (scheda isolatiberina) prende la patina comune e l'erba fra le pietre del
     piano (RM_PAT_ERBA): quando smise di essere curata nessuna fonte letta lo dice, e la patina segue il ritmo di tutta la città. La voce dice che la forma di nave era di
     tutta l'isola («a wall was erected which in shape reproduced exactly the sides of a Roman ship») e che oggi ne resta una parte di travertino al capo est: la forma resta
     com'era. Lo stesso materiale delle fiancate di prima, così negli anni romani nulla cambia. */
  var IS=new RM.Costruttore(); B=IS;
  (function(){ var i;
    for(i=0;i<NI*2;i++){ var a=isS[i], b=isS[i+1], e=isD[i], f=isD[i+1];
      B.quad([b[0],-.5,b[1]],[a[0],-.5,a[1]],[a[2],.35,a[3]],[b[2],.35,b[3]],P.travertino).quad([e[0],-.5,e[1]],[f[0],-.5,f[1]],[f[2],.35,f[3]],[e[2],.35,e[3]],P.travertino);      // le fiancate di travertino
      B.quad([b[2],.35,b[3]],[a[2],.35,a[3]],[e[2],.35,e[3]],[f[2],.35,f[3]],P.selce); }                                                                                           // il piano dell'isola
    /* la strada fra le due teste, sul piano dell'isola: oggi via di Ponte Quattro Capi e piazza di San Bartolomeo (OpenStreetMap); in antico il tracciato non è noto */
    var pf=(RM.ponti.filter(function(p){ return p.id==='pontefabricio'; })[0].piedi||[])[1], pc=(RM.ponti.filter(function(p){ return p.id==='pontecestio'; })[0].piedi||[])[0];
    if(pf&&pc){ var dx=pc.x-pf.x, dz=pc.z-pf.z, l=Math.hypot(dx,dz)||1, nx=-dz/l*.32, nz=dx/l*.32, via=RM.col(0x6e685d);
      B.quad([pf.x+nx,.37,pf.z+nz],[pc.x+nx,.37,pc.z+nz],[pc.x-nx,.37,pc.z-nz],[pf.x-nx,.37,pf.z-nz],via); }
    /* L'obelisco (scheda obeliscoisola). Platner e Ashby, Insula Tiberina: «An obelisk, fragments of which are in the museum at Naples, is thought to have represented the mast».
       La voce non dà misure, né il posto, né quando cadde: qui a metà dell'isola (dove starebbe l'albero), alto 14 m sul suo basamento come prima, ed è uno schema detto nella scheda;
       resta in piedi fino all'852 («non si sa quando cadde», come gli altri obelischi). Due case a monte (indicative): nessuna fonte letta parla di case sull'isola; qui sono
       lasciate dal 550 come tante case della città, perdono il tetto nel 600 e i muri calano fino al 700 (scelte dette nella scheda dell'isola). */
    var M0=asse(tIs), rM0=Math.atan2(M0.tg[0],M0.tg[1]), OB=new RM.Costruttore(), CA=new RM.Costruttore(), CR=new RM.Costruttore();
    OB.dentro(M0.q.x,.35,M0.q.z,rM0,function(B){ B.scatola(.3,.3,.3,0,0,0,P.marmo).cilindro(.1,1.4,0,.3,0,P.granito,.05,4); });
    CA.dentro(M0.q.x,.35,M0.q.z,rM0,function(B){
      B.scatola(2.2,.9,2.2,.2,0,-4.2,P.intonaco).falde(2.4,.5,2.2,.2,.9,-4.2,P.coppi); B.scatola(1.5,.7,2.2,-.1,0,-7.3,P.intonaco).falde(2.2,.4,1.7,-.1,.7,-7.3,P.coppi,Math.PI/2); });
    CR.dentro(M0.q.x,.35,M0.q.z,rM0,function(B){      // le stesse due case senza tetto: muri sottili di altezza diversa, a pezzi
      [[2.2,.12,.2,-5.24,.9],[2.2,.12,.2,-3.16,.62],[.12,2.2,1.24,-4.2,.8],[.12,1.3,-.84,-4.75,.55],[.12,.6,-.84,-3.5,.3]].forEach(function(w){ B.scatola(w[0],w[4],w[1],w[2],0,w[3],P.intonaco); });
      [[1.5,.12,-.1,-8.34,.7],[1.5,.12,-.1,-6.26,.4],[.12,2.2,-.79,-7.3,.62],[.12,1.1,.59,-7.85,.5]].forEach(function(w){ B.scatola(w[0],w[4],w[1],w[2],0,w[3],P.intonaco); });
      B.scatola(1.1,.06,.9,.3,0,-4.4,P.tufo).scatola(.8,.05,.7,-.2,0,-7.1,P.tufo); });      // i calcinacci a terra
    var gOb=OB.maglia(RM.matPietra(classe('obeliscoisola'))), gCa=CA.maglia(RM.matPietra('C')), mCr=RM.matPietra('C'); mCr.defines={RM_PAT_ERBA:''}; var gCr=CR.maglia(mCr);
    gCr.visible=false; [gOb,gCa,gCr].forEach(function(g){ g.userData.gruppo='monumenti'; RM.scene.add(g); });
    gCr.position.y=.35; gCr.geometry.translate(0,-.35,0);      // i muri calano verso il piano dell'isola
    RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:gOb, id:'obeliscoisola'},{maglia:gCa, id:'isolatiberina'},{maglia:gCr, id:'isolatiberina'}]);
    RM.MONUMENTI.push({id:'obeliscoisola', nome:"Obelisco dell'isola Tiberina", x:M0.q.x, z:M0.q.z, raggio:1, alto:1.7});
    RM.moduli.push(function(anno){ gCa.visible=anno<600; gCr.visible=anno>=600; gCr.scale.y=1-.55*RM.sfuma(600,700,anno);
      mCr.userData.patinaPropria=true; mCr.userData.patina.value=RM.patinaSpenta?0:Math.max(RM.patinaAnno(anno),.35*RM.sfuma(600,640,anno)); });      // la casa lasciata e scoperchiata prende l'erba anche prima che la patina della città sia forte
  })();
  var mIs=RM.matPietra('A'); mIs.defines={RM_PAT_ERBA:''}; var gIs=IS.maglia(mIs); gIs.userData.gruppo='monumenti'; RM.scene.add(gIs);
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:gIs, id:'isolatiberina'}]);
  RM.MONUMENTI.push({id:'isolatiberina', nome:'Isola Tiberina', x:M0x(), z:M0z(), raggio:12, alto:.9});
  function M0x(){ return asse(tIs).q.x; } function M0z(){ return asse(tIs).q.z; }
  /* Il tempio di Esculapio: «probably occupied the site of the present church of S. Bartolomeo» (Platner e Ashby, Aedes Aesculapii, letto il 25 novembre 2026), che sta «toward the E end,
     or prow, of the island» (Insula Tiberina): qui a valle dei ponti, con la fronte verso di loro, come la chiesa di oggi sulla sua piazza. Forma e misure non sono nella voce
     («There are no certain remains of this temple»): il tempio è uno schema. Ha una sua maglia per avere lo stato (MONUMENTI.esculapio in js/dati.js): chiuso al culto nel 392
     come gli altri templi (scelta del modello, src/testi/audit-anacronismi.md), poi abbandonato ma in piedi, perché nessuna fonte letta dice quando cadde. */
  (function(){ var T=asse(avanza(tC,5.6)), C=new RM.Costruttore(); C.tempio(1.6,2.6,1.1,0,0,0,{fronte:4,podio:.25});
    var g=C.maglia(RM.matPietra()); g.geometry.computeBoundingBox(); var mt=RM.matRovina(g.geometry.boundingBox.max.y); g.material=mt; g.customDepthMaterial=mt.userData.ombra;
    g.position.set(T.q.x,.35,T.q.z); g.rotation.y=Math.atan2(-T.tg[0],-T.tg[1]); g.userData.gruppo='monumenti'; RM.scene.add(g);      // la fronte (+z locale) guarda a monte
    RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:g, id:'esculapio'}]);
    RM.MONUMENTI.push({id:'esculapio', nome:'Tempio di Esculapio (isola Tiberina)', x:T.q.x, z:T.q.z, raggio:5, alto:1.5});
    RM.moduli.push(function(anno){ var q=RM.statoMonumento('esculapio',anno), rv=RM.rovina('esculapio',anno), u=mt.userData.u, TN=RM.TINTA;
      mt.color.copy(TN[q.s0]||TN.uso).lerp(TN[q.s1]||TN.uso,q.t); u.uRovina.value=rv.r; u.uSpoglio.value=rv.s; u.uCrepe.value=rv.c; u.uVerde.value=rv.v; u.uIntonaco.value=rv.i; u.uPulito.value=rv.pulito||0; u.uPatina.value=RM.patinaMon('esculapio',anno); });
  })();
  ['A','B','C'].forEach(function(k){ var g=PC[k].maglia(RM.matPietra(k)); RM.scene.add(g);
    /* un clic sui ponti della maglia comune apre la scheda del ponte più vicino; sull'isola quella del tempio */
    RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:g, id:function(h){ var x=h.point.x, z=h.point.z, m=1e9, id=null; if(k==='A'&&sullIsola(x,z)) return 'isolatiberina';
      RM.ponti.forEach(function(p){ if(p.comune!==k) return; var d=Math.hypot(p.x-x,p.z-z); if(d<m){ m=d; id=p.id; } }); return id; }}]); });
  RM.ponti.forEach(function(p){ RM.MONUMENTI.push({id:p.id, nome:p.nome, x:p.x, z:p.z, raggio:8, alto:1}); });
})();

/* Le testate dei ponti scendono (o salgono) fino al terreno con una rampa: prima l'impalcato finiva di colpo sopra la riva o dentro (23 novembre 2026, l'utente: «sembra che i ponti
   siano sospesi senza finire»). q, rot: centro del ponte e rotazione; mezzo: metà lunghezza; yTop: piano dell'impalcato in coordinate locali (origine a -0,5); larga: metà larghezza */
/* suolo: la quota del terreno (nel mondo) da usare; per i ponti dell'isola è il piano dell'isola. Restituisce i due piedi, [lato -x, lato +x], in coordinate del mondo (25 novembre 2026: servono a far cominciare le strade lì) */
function rampe(B,q,rot,mezzo,yTop,larga,colore,suolo){
  var c=Math.cos(rot), sn=Math.sin(rot), hq=suolo||RM.hSuolo||RM.h;
  return [-1,1].map(function(s){
    /* il terreno lungo l'asse, mezzo metro alla volta. Se arriva all'altezza dell'impalcato, la rampa (quasi piana) va fin lì; se no si prende il punto più alto trovato
       (sull'isola, oltre il suo piano, c'è di nuovo il letto del fiume) e la pendenza decide la lunghezza. Prima, quando il terreno raggiungeva l'impalcato più in là,
       la rampa non si faceva e l'impalcato finiva in aria (25 novembre 2026, ponte Sublicio) */
    var x0=s*mezzo, k, yg=-1e9, Lf=0, g0=hq(q.x+x0*c,q.z-x0*sn)+.5;
    for(k=1;k<=12;k++){ var xl=s*(mezzo+k*.5), yk=hq(q.x+xl*c,q.z-xl*sn)+.5; if(yk>=yTop-.08){ Lf=k*.5; break; } yg=Math.max(yg,yk); }
    var dy=Lf?0:yg-yTop; if(!Lf&&Math.abs(dy)<.05) return {x:q.x+x0*c, z:q.z-x0*sn, y:yTop-.5};
    var L=Lf||Math.min(6,Math.max(1.2,Math.abs(dy)*3)), x1=s*(mezzo+L), y1=hq(q.x+x1*c,q.z-x1*sn)+.5+.04, fondo=Math.min(yTop,y1,g0)-.4;      // i fianchi scendono fino al terreno sotto la testata
    B.quad([x0,yTop,larga],[x1,y1,larga],[x1,y1,-larga],[x0,yTop,-larga],colore);      // il piano della rampa
    B.quad([x0,fondo,larga],[x1,fondo,larga],[x1,y1,larga],[x0,yTop,larga],colore).quad([x0,yTop,-larga],[x1,y1,-larga],[x1,fondo,-larga],[x0,fondo,-larga],colore);      // i fianchi
    return {x:q.x+x1*c, z:q.z-x1*sn, y:y1-.5};
  });
}
/* 312: il ponte provvisorio di Massenzio accanto al ponte Milvio. Zosimo II 15-16 (traduzione del 1814): un ponte di travi in due metà, unite al centro da ferri; toglierli era il piano
   di Massenzio, ma il testo non dice che furono tolti: le travi cedono sotto il peso dei fuggiaschi. Eusebio, Storia ecclesiastica IX 9, 5-7: un ponte di barche; Lattanzio 44, 9: il ponte
   alle spalle di Massenzio «viene tagliato». Nessuna fonte dice dove fosse il ponte provvisorio, né che i ponti in uso fossero due (riletti il 26 novembre 2026: src/testi/scene-roma-fonti.md):
   qui una passerella di travi su cavalletti, una trentina di metri a monte del ponte di pietra, visibile solo nella tappa del 312. È uno schema, detto nella didascalia (milvio312 in js/dati.js).
   Scelta dell'utente del 26 novembre 2026 («Pietra tagliato»): nel 312 il ponte di pietra si mostra interrotto, come in Lattanzio 44, 9 («Pons a tergo eius scinditur»; «ad pontem, qui
   interruptus erat»), con il ponte di travi di Zosimo accanto. Unire i due racconti è una ricostruzione: nessuna fonte parla di due ponti. Il varco è la forma 'rotto' di ponte()
   (manca l'arcata di mezzo, restano le pile), solo dal 311,6 al 313 (campo taglio in GENERICI): punto e forma del taglio non sono nelle fonti, nessuno lo taglia sulla scena.
   Dal 24 novembre 2026 la passerella, con le sue rampe, sta in js/scene-tappe.js (fuga312), in due metà che cedono al centro. */

/* avanzamento del cantiere delle mura (0-1): aperto nel 271, il grosso fatto alla morte di Aureliano, finito sotto Probo (vedi sopra); alla tappa del 271 è appena cominciato */
var CANTIERE_MURA=[[270.6,0],[271,.3],[275,.85],[280,1]];
RM.moduli.push(function(anno){
  mura(Math.max(D.interp(D.MURA_ALTE,anno),anno>=270.6?1:0),anno,D.interp(CANTIERE_MURA,anno));   // brecce di Totila, rattoppi, danni e restauri dei papi: anno per anno nei passi (sopra)
  acque(anno);
});
})();
