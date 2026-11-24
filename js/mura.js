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
  for(i=0;i<M.length;i++){
    a=M[i]; b=M[(i+1)%M.length]; L=Math.hypot(b[0]-a[0],b[1]-a[1]); n=Math.max(1,Math.round(L/3));      // un passo ogni 30 m circa: tante sono le torri («every 100 feet», Platner)
    for(k=0;k<n;k++) passi.push({x:a[0]+(b[0]-a[0])*(k+.5)/n, z:a[1]+(b[1]-a[1])*(k+.5)/n, ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0]), len:L/n});
  }
  /* tratto: cortina, cammino di ronda, merli. Spessa circa 3,5 m («about 12 feet thick», Platner); alta 7 m sul terreno nella prima fase («not more than 25 feet»), poi rialzata */
  var T=new RM.Costruttore().scatola(1,1,.34,0,0,0,P.mattone);
  for(k=0;k<4;k++) T.scatola(.13,.14,.1,-.375+k*.25,1,-.12,P.mattone);      // i merli stanno sul filo esterno
  /* torre quadrata, sporgente circa 3 m dalla cortina («project about 10 feet», Platner); la larghezza, 7,5 m, è indicativa */
  /* Le torri sporgono verso l'esterno (24 novembre 2026): prima, su 96 lati della cinta su 99, sporgevano verso la città. Il lato esterno è il -z locale dei tratti. */
  var W=new RM.Costruttore().scatola(.75,1.42,.66,0,0,-.18,P.mattone).scatola(.75,.06,.66,0,1.42,-.18,P.tufo);
  [[-.25,.08],[.25,.08],[-.25,-.45],[.25,-.45]].forEach(function(p){ W.scatola(.18,.16,.12,p[0],1.48,p[1],P.mattone); });
  var mat=RM.matPietra(classe('mura')), tratti=istanze(T.geometria(),mat,passi.length), torri=istanze(W.geometria(),mat,passi.length);

  /* porte dove le vie attraversano la cinta */
  /* Dal 24 novembre 2026 ogni porta è un'istanza con la sua base: prima erano una maglia sola, scalata in altezza attorno al livello del fiume, e così le porte sui colli
     si staccavano da terra dopo il rialzo del 403 (porta Salaria di 49 m) e sprofondavano durante il cantiere. Sono tutte uguali: la forma è uno schema. */
  var GP=new RM.Costruttore(), posti=[];
  GP.scatola(3,1.25,1.1,0,0,0,P.travertino).aperture(-.8,.56,.8,.56,1,0,.85,1).aperture(.8,-.56,-.8,-.56,1,0,.85,1);
  [-1,1].forEach(function(k){ GP.cilindro(1,1.7,k*2,0,-.3,P.mattone,null,14).cilindro(1.08,.12,k*2,1.7,-.3,P.tufo,null,14); });
  RM.STRADE.forEach(function(s){
    for(var i=0;i<s.length-1;i++) for(var j=0;j<M.length;j++){
      var p=s[i], r=[s[i+1][0]-p[0],s[i+1][1]-p[1]], q=M[j], w=M[(j+1)%M.length], sv=[w[0]-q[0],w[1]-q[1]], den=r[0]*sv[1]-r[1]*sv[0]; if(Math.abs(den)<1e-6) continue;
      var t=((q[0]-p[0])*sv[1]-(q[1]-p[1])*sv[0])/den, u=((q[0]-p[0])*r[1]-(q[1]-p[1])*r[0])/den; if(t<0||t>1||u<0||u>1) continue;
      var x=p[0]+r[0]*t, z=p[1]+r[1]*t; if(posti.some(function(o){ return Math.hypot(o.x-x,o.z-z)<3; })) continue;      // una strada che taglia la cinta su uno spigolo darebbe due porte
      posti.push({x:x, z:z, y:RM.h(x,z)-.3, ang:Math.atan2(-sv[1],sv[0]), flaminia:Math.hypot(x+74,z+211)<15});      // la Flaminia a parte: la piena del 791 la porta via
    }
  });
  var magliaPorte=istanze(GP.geometria(),mat,Math.max(1,posti.length)); RM.porte=posti;
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:tratti,id:'mura'},{maglia:torri,id:'mura'},{maglia:magliaPorte,id:'mura'}]);
  passi.forEach(function(p,j){ p.rotto=RM.grana(Math.floor(j/10),7)<.3; p.riva791=Math.hypot(p.x+115.3,p.z+3.3)<1.3; });      // riva791: il tratto di mura sul Tevere presso ponte Sisto che la piena del dicembre 791 abbatte («usque ad pontem Antonini, ipsum evertens murum», Liber Pontificalis, Adriano I 95; ponte Sisto per Duchesne). Lunghezza indicativa; rifatto qui nel 795, anno ignoto     // i tratti che Totila fa abbattere nel 546: circa un terzo, a blocchi di 300 m
  /* Il cantiere. «Rome, which before had no walls, was now surrounded with them. This work was begun in the reign of Aurelianus, and was finished by Probus» (Zosimo I 49,
     letto il 22 novembre 2026 nella traduzione del 1814, tertullian.org). L'anno della fine non è scritto: nel modello il 280, a metà del regno di Probo (276-282); che il grosso
     fosse in piedi alla morte di Aureliano (275) è l'opinione corrente, non un dato. In che ordine salissero i tratti non si sa: qui a blocchi di circa 240 m, in ordine casuale.
     Dove il lavoro non è cominciato si vede il solo filare di fondazione lungo tutto il tracciato; dove è in corso, i ponteggi di legno. */
  passi.forEach(function(p,j){ p.turno=RM.grana(Math.floor(j/8),13); });
  var S=new RM.Costruttore(); [-.42,-.14,.14,.42].forEach(function(x){ S.scatola(.014,1.14,.03,x,0,.3,P.tronco); }); [.3,.62,.94].forEach(function(y){ S.scatola(1,.02,.1,0,y,.27,P.tronco); });
  var ponteggi=istanze(S.geometria(),RM.matPietra(),passi.length); ponteggi.visible=false; ponteggi.receiveShadow=false;
  /* Dicembre 791: il Tevere «portam quae dicitur Flamminea … a fundamenta evellens» (LP, Adriano I 94). Quando sia stata rifatta non è scritto: qui resta abbattuta. */
  var ultima=-1, ultimaBr=-1, ultimoCant=-1, ultimo791=-1, ultimaFlam=-1;      // alla tappa del 791 la porta Flaminia è già a terra, come dicono testo e didascalia
  return function(alt,br,anno,cant){
    var r791=anno>=790.9&&anno<795?1:0, rialzo=alt>1.004&&alt<1.496, inCantiere=(cant>0&&cant<1)||rialzo, porteSu=alt*Math.min(1,cant/.8);      // le porte salgono con la cinta; «rialzo»: i lavori di Onorio (401-403), con i ponteggi su tutta la cinta
    var flamGiu=anno>=790.9?1:0;
    if(Math.abs(alt-ultima)<.002 && Math.abs(br-ultimaBr)<.01 && Math.abs(cant-ultimoCant)<.002 && r791===ultimo791 && flamGiu===ultimaFlam) return; ultima=alt; ultimaBr=br; ultimoCant=cant; ultimo791=r791; ultimaFlam=flamGiu;
    posti.forEach(function(o,j){ var sy=o.flaminia&&flamGiu?0:porteSu; d.position.set(o.x,o.y,o.z); d.rotation.set(0,o.ang,0); if(sy>.01) d.scale.set(1,sy,1); else d.scale.set(0,0,0); d.updateMatrix(); magliaPorte.setMatrixAt(j,d.matrix); });
    magliaPorte.instanceMatrix.needsUpdate=true;
    passi.forEach(function(p,j){
      if(p.y==null){ var cx=Math.cos(p.ang)*p.len/2, cz=-Math.sin(p.ang)*p.len/2, ya=RM.h(p.x-cx,p.z-cz), yb=RM.h(p.x+cx,p.z+cz); p.y=(ya+yb)/2-.3; p.yt=ya-.3; p.pend=Math.atan2(yb-ya,p.len); }   // sui pendii la cortina segue il terreno invece di salire a gradoni
      var c=cant>=1?1:cant<=0?0:Math.max(.1,Math.min(1,(cant-p.turno*.55)/.45));      // quanto è alto questo tratto: 0,1 sono i primi filari sopra la fondazione, lungo tutto il tracciato
      var y=p.y, sy=Math.max(alt*c,.0001)*(p.rotto?1-.8*br:1)*(p.riva791&&r791?.12:1);
      d.position.set(p.x,y,p.z); d.rotation.set(0,p.ang,p.pend); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix(); tratti.setMatrixAt(j,d.matrix);
      d.position.set(p.x-Math.cos(p.ang)*p.len/2,p.yt,p.z+Math.sin(p.ang)*p.len/2); d.rotation.z=0; d.scale.set(1,sy,1); d.updateMatrix(); torri.setMatrixAt(j,d.matrix);      // una torre a ogni passo
      if(inCantiere){      // ponteggio sui tratti che stanno salendo, un poco più alto del muro
        if(rialzo||(c>.1&&c<1)){ d.position.set(p.x,y,p.z); d.rotation.set(0,p.ang,p.pend); d.scale.set(p.len/Math.cos(p.pend),alt*Math.min(1,c+.2),1); } else d.scale.set(0,0,0);
        d.updateMatrix(); ponteggi.setMatrixAt(j,d.matrix);
      }
    });
    tratti.instanceMatrix.needsUpdate=true; torri.instanceMatrix.needsUpdate=true;
    ponteggi.visible=inCantiere; if(inCantiere) ponteggi.instanceMatrix.needsUpdate=true;
    tratti.visible=torri.visible=alt>.01&&cant>0; magliaPorte.visible=porteSu>.01&&posti.length>0;
  };
})();

/* ---------- acquedotti ----------
   Il canale scende con una pendenza minima: la sommità delle arcate è quasi orizzontale e sono le pile ad allungarsi o ad accorciarsi
   col terreno. Dove il suolo sale fino al canale l'acquedotto corre interrato e non si vede (la Vergine sotto il Pincio, la Marcia
   oltre porta Tiburtina). Le quote della sommità [x, z, quota] sono una ricostruzione, non un rilievo: rispettano l'ordine noto
   (la Claudia più alta della Marcia a porta Maggiore, la Vergine bassa sul Campo Marzio) dentro un rilievo accentuato 1,8 volte.
   La Traiana arrivava al Gianicolo quasi a livello del suolo e scendeva il pendio verso i mulini: qui è un muro basso che segue il terreno.
   La rovina nel tempo. Documentati: il taglio del 537 (Procopio); i quattro condotti rifatti da Adriano I (Liber Pontificalis, vita di Adriano, cc. 59-65):
   Sabbatina cioè Traiana e Iobia, rotte da vent'anni (quindi, per Duchesne, dall'assedio di Astolfo del 756 e in funzione prima), Claudia, che serviva il Laterano
   e portava ormai poca acqua, Vergine, «piena di rovine». La Iobia, secondo l'ipotesi più diffusa (Lanciani, Duchesne; Ashby dubita), è il ramo che Caracalla
   costruì per le sue terme, l'Antoniniano: della linea della Marcia torna in piedi solo il tronco fuori città, e con esso questo ramo. Ipotesi nostre: quali tratti cadono e quando,
   quanto fosse stato riparato dopo il 554, e che gli archi neroniani oltre il Laterano, mai nominati dalle fonti, non vengano più rialzati. I tratti rifatti nell'VIII secolo hanno il colore del mattone di recupero. */
var acque=(function(){
  var LINEE=[{passo:3.6, p:[[619,361,9],[420,170,8.8],[249,12,8.6],[163,62,8.45],[89,74,8.3],[40,54,8.2],[29,51,8.18]]},       // Claudia e Anio Novus fino a porta Maggiore, poi archi neroniani sul Celio fino al Palatino
             {passo:3.2, p:[[600,330,8.5],[400,140,8.25],[255,5,8],[208.5,-53.5,7.9],[160,-84,7.8],[136,-92,7.75]]},              // Marcia, Tepula, Giulia: lungo le mura fino a porta Tiburtina, poi interrate verso le terme di Diocleziano
             {passo:1.5, p:[[-22,-175,3.9],[-19,-150,3.85],[-13.2,-112.4,3.79],[-17,-93,3.75],[-34.8,-75.8,3.72],[-44,-74,3.7]]},      /* il punto sull'arco di Claudio, dove l'acquedotto attraversava la via Lata (Platner e Ashby, Arcus Claudii; posizione in js/monumenti.js): prima la linea passava circa 47 m più a nord */                                    // Vergine: esce dalle pendici del Pincio e attraversa il Campo Marzio
             {passo:1.6, suolo:.5, p:[[-422,28],[-371,37.8],[-311,40.8],[-263,41.8],[-240,43.5],[-198,46],[-160,33]]},
             /* Antoniniano (212-213), il ramo per le terme di Caracalla. Punti reali: i resti di piazza Galeria e l'arco detto di Druso (OpenStreetMap). Secondo Ashby correva interrato o su
                sostruzioni lungo la via Latina e saliva su arcate solo presso le mura e sulla via Appia: qui si vede dove il terreno scende sotto il canale. La quota sull'arco di Druso
                (fondo del canale a 41,4 m sul mare, circa otto metri sopra la strada) è misurata; il resto del profilo e l'arrivo alle cisterne delle terme sono ricostruiti. */
             {passo:1.5, p:[[240,214,4.42],[175.4,200.9,4.28],[133.7,208.1,4.15],[68,175,4.02]]}];
  // la quarta linea, la Traiana: lungo l'Aurelia (dove oggi corre l'acqua Paola, che ne riusa il percorso), poi giù dal Gianicolo fino ai mulini di Trastevere
  var el=[], rnd=RM.casuale(537), CIMA=.48;                                     // altezza del pezzo d'arcata (arco e canale), in quota della luce
  LINEE.forEach(function(l,li){
    for(var i=0;i<l.p.length-1;i++){
      var a=l.p[i], b=l.p[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/l.passo)), ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]), ux=(b[0]-a[0])/L, uz=(b[1]-a[1])/L;
      for(var k=0;k<n;k++){
        var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, len=L/n, y=RM.h(x,z), ya=RM.h(x-ux*len/2,z-uz*len/2), yb=RM.h(x+ux*len/2,z+uz*len/2), giu=l.suolo?y:Math.min(y,ya,yb);
        var cima=l.suolo?y+l.suolo:a[2]+(b[2]-a[2])*t;
        el.push({li:li,perso:(li===0&&i>=3)||(li===1&&x<489),x:x,z:z,ang:ang,len:len,y:giu-.2,cima:cima,suolo:!!l.suolo,pend:l.suolo?Math.atan2(yb-ya,len):0,vis:cima-y>.3,rot:rnd(),blocco:li*1000+i*100+Math.floor(k/6),blocchetto:li*1000+i*100+Math.floor(k/3)});
      }
    }
  });
  var sorte={}, RIPARA=[.5,.85,.4,1,.85], INCURIA=[.3,.2,.35,.1,.2], VENTI={1:1,3:1,4:1};        // VENTI: le linee «rotte da vent'anni» del Liber Pontificalis (Marcia-Iobia, Sabbatina, e l'Antoniniano se è la Iobia)
  // RIPARA e INCURIA, per linea: quota dei tagli riparati dopo il 554; quota dei tratti che cedono per incuria fra VI e VIII secolo
  el.forEach(function(e){
    var b=sorte[e.blocco]||(sorte[e.blocco]=[rnd(),rnd(),rnd(),rnd()]), c=sorte['c'+e.blocchetto]||(sorte['c'+e.blocchetto]=[rnd(),rnd()]);
    e.taglio=b[0]<.4?536.5+b[1]*.48:9999;                                           // il taglio del 537 colpisce tratti contigui
    e.ripara=e.taglio<9999&&!e.perso&&b[2]<RIPARA[e.li]?556+b[3]*50:9999;          // riparazioni dopo la Prammatica Sanzione
    e.cede=c[0]<(e.perso?.65:INCURIA[e.li])?570+c[1]*190:9999;                     // crolli per incuria
    e.rotto756=VENTI[e.li]&&b[1]<.45?756+b[3]*.4:9999;                    // Sabbatina e Iobia: di nuovo rotte, probabilmente nell'assedio di Astolfo
    e.rifatto=e.perso?9999:(VENTI[e.li]?775:776)+b[3]*(VENTI[e.li]?3:13);   // Adriano I
  });
  el=el.filter(function(e){ return e.vis; }); RM.campateAcquedotti=el;          // sotto le arcate non si costruisce (js/citta.js)
  /* arcata: due mezze pile, arco a tutto sesto, canale. Pila: le due mezze pile sotto l'imposta, allungate fino al suolo */
  var A=new RM.Costruttore(), r=.3, c=.36, k, a0, a1;
  [-1,1].forEach(function(s){ A.scatola(.2,c,1,s*.4,0,0,P.tufo); });
  for(k=0;k<8;k++){
    a0=PI*k/8; a1=PI*(k+1)/8; var x0=r*Math.cos(a0), x1=r*Math.cos(a1), h0=r*Math.sin(a0), h1=r*Math.sin(a1);
    A.quad([x0,h0,.5],[x1,h1,.5],[x1,c,.5],[x0,c,.5],P.tufo).quad([x0,h0,-.5],[x1,h1,-.5],[x1,c,-.5],[x0,c,-.5],P.tufo).quad([x0,h0,.5],[x1,h1,.5],[x1,h1,-.5],[x0,h0,-.5],P.ombra);
  }
  A.scatola(1,CIMA-c,1.1,0,c,0,P.travertino);
  var Pl=new RM.Costruttore(); [-1,1].forEach(function(s){ Pl.scatola(.2,1,1,s*.4,0,0,P.tufo); });
  var R=new RM.Costruttore().scatola(.42,.5,.95,0,0,0,P.tufo); R.quad([-.21,.5,.47],[.21,.5,.47],[.21,.5,-.47],[-.21,.95,-.47],P.tufo).tri([-.21,.5,.47],[-.21,.95,-.47],[-.21,.5,-.47],P.tufo);   // moncone
  var mat=RM.matPietra(classe('acquedotti')), N=el.length, arcate=istanze(A.geometria(),mat,N*2), pile=istanze(Pl.geometria(),mat,N), monconi=istanze(R.geometria(),mat,N), ultimo=-1, tinta=new THREE.Color(), MATTONE=RM.col(0xe4c6b2), BIANCO=new THREE.Color(1,1,1);
  function quale(c){ var e=el[c.instanceId%N]; return e&&e.li===4?'antoniniano':'acquedotti'; }
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:arcate,id:quale},{maglia:pile,id:quale},{maglia:monconi,id:quale}]);
  for(k=0;k<N;k++) monconi.setColorAt(k,BIANCO);                                 // le tre maglie condividono il materiale: tutte devono avere il colore per istanza
  function zero(maglia,j){ d.scale.set(0,0,0); d.updateMatrix(); maglia.setMatrixAt(j,d.matrix); }
  return function(anno){
    var passo=Math.round(anno*4); if(passo===ultimo) return; ultimo=passo;
    el.forEach(function(e,j){
      var riparato=e.ripara<9999, perIncuria=e.cede<9999&&!(riparato&&e.cede<e.ripara);        // un crollo precedente alla riparazione viene rimesso su con quella
      var giuTaglio=anno>=e.taglio&&!(anno>=e.ripara), giuIncuria=anno>=e.cede&&(perIncuria||anno<e.ripara), caduto=giuTaglio||giuIncuria||anno>=e.rotto756, daQuando=giuTaglio?e.taglio:giuIncuria?e.cede:e.rotto756;
      var rifatto=anno>=e.rifatto, toppa=rifatto&&((e.taglio<9999&&!riparato)||(perIncuria&&e.cede<e.rifatto)||e.rotto756<9999), rotto=caduto&&!rifatto, T=CIMA*e.len, larga=e.suolo?.6:.8, H=e.cima-e.y, Hp=H-T;
      d.rotation.set(0,e.ang,0);
      if(rotto){ zero(arcate,j); zero(arcate,N+j); zero(pile,j); }
      else if(e.suolo){ d.rotation.z=e.pend; d.position.set(e.x,e.y,e.z); d.scale.set(e.len/Math.cos(e.pend)+.05,H/CIMA,larga); d.updateMatrix(); arcate.setMatrixAt(j,d.matrix); d.rotation.z=0; zero(arcate,N+j); zero(pile,j); }   // arcatelle basse, schiacciate, inclinate col pendio
      else{
        d.position.set(e.x,e.cima-T,e.z); d.scale.set(e.len,e.len,larga); d.updateMatrix(); arcate.setMatrixAt(j,d.matrix);
        if(Hp>.02){ d.position.y=e.y; d.scale.set(e.len,Hp,larga); d.updateMatrix(); pile.setMatrixAt(j,d.matrix); } else zero(pile,j);
        if(Hp>T*1.7){ d.position.y=e.y+Hp*.5-T*.5; d.scale.set(e.len,e.len,larga); d.updateMatrix(); arcate.setMatrixAt(N+j,d.matrix); } else zero(arcate,N+j);   // le arcate più alte hanno un secondo ordine
      }
      if(rotto){ d.position.set(e.x-Math.cos(e.ang)*e.len/2,e.y,e.z+Math.sin(e.ang)*e.len/2); d.scale.set(e.len,H*(.25+.6*e.rot)*(1-.45*RM.sfuma(0,220,anno-daQuando)),larga); d.updateMatrix(); monconi.setMatrixAt(j,d.matrix); }
      else zero(monconi,j);
      tinta.copy(toppa?MATTONE:BIANCO); arcate.setColorAt(j,tinta); arcate.setColorAt(N+j,tinta); pile.setColorAt(j,tinta);
    });
    arcate.instanceMatrix.needsUpdate=true; pile.instanceMatrix.needsUpdate=true; monconi.instanceMatrix.needsUpdate=true; arcate.instanceColor.needsUpdate=true; pile.instanceColor.needsUpdate=true;
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
  var PC={A:new RM.Costruttore(),B:new RM.Costruttore(),C:new RM.Costruttore()}, B, curva=RM.curvaFiume, storie=[];
  /* un'arcata fra due pile: i due fianchi sotto l'impalcato e l'intradosso, a mezzo ovale (23 novembre 2026: prima i ponti erano tavole posate su quattro blocchi).
     Il numero delle arcate è lo stesso per tutti e non è quello di ciascun ponte vero. */
  function arcata(B,x0,x1,ys,yc,w,col){ var N=8, k, xa, xb, ya, yb;
    for(k=0;k<N;k++){ xa=x0+(x1-x0)*k/N; xb=x0+(x1-x0)*(k+1)/N; ya=ys+(yc-ys)*Math.sin(Math.PI*k/N); yb=ys+(yc-ys)*Math.sin(Math.PI*(k+1)/N);
      B.quad([xa,ya,w],[xb,yb,w],[xb,yc,w],[xa,yc,w],col).quad([xb,yb,-w],[xa,ya,-w],[xa,yc,-w],[xb,yc,-w],col).quad([xa,ya,-w],[xb,yb,-w],[xb,yb,w],[xa,ya,w],col); } }
  function ponte(B,parti,q,rot){      // parti: 'tutto', 'rotto' (senza un'arcata), 'pile'
    [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.5,parti==='pile'?.45:.6,.5,x,0,.75,P.travertino,Math.PI/4).scatola(.5,parti==='pile'?.45:.6,.5,x,0,-.75,P.travertino,Math.PI/4); });      // i rostri delle pile
    if(parti!=='pile') (parti==='rotto'?[[-5.6,-4.75],[-4.05,-1.85],[4.75,5.6]]:[[-5.6,-4.75],[-4.05,-1.85],[-1.15,1.15],[1.85,4.05],[4.75,5.6]]).forEach(function(c){ arcata(B,c[0],c[1],.25,.87,.65,P.travertino); });
    if(parti!=='pile'){ rampe(B,q,rot,7.5,1.15,.65,P.travertino);
      if(parti==='rotto'){ B.scatola(6.8,.3,1.3,-4.1,.85,0,P.travertino).scatola(5.2,.3,1.3,4.9,.85,0,P.travertino); }      // manca il tratto fra le due pile centrali
      else B.scatola(15,.3,1.3,0,.85,0,P.travertino).scatola(15,.16,.12,0,1.15,.6,P.travertino).scatola(15,.16,.12,0,1.15,-.6,P.travertino);
    }
    [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.7,parti==='pile'?.6:.9,1.5,x,0,0,P.travertino); });
    if(parti!=='pile') B.scatola(2,.9,1.3,-6.6,0,0,P.travertino).scatola(2,.9,1.3,6.6,0,0,P.travertino);
  }
  [[-156.1,-104.37,'A',0,null,null,1.63],[-120,1,'B',0,772],[-66,28,'A'],[-52,38,'A'],[-84,97,'C',280],[-152,-479,'A'],[-173.5,-92.6,'C',0,null,300]].forEach(function(p){     // Elio, Aurelio (ponte Sisto), isola Tiberina, Emilio, Probo, Milvio, Neroniano
    var m=1e9, tm=0, i, q; for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); var dd=Math.hypot(q.x-p[0],q.z-p[1]); if(dd<m){ m=dd; tm=i/2400; } }
    q=curva.getPoint(tm); var tg=curva.getTangent(tm), rot=Math.atan2(-tg.x,-tg.z);            // l'asse x locale attraversa il fiume
    /* Ponte Elio (24 novembre 2026): centro e asse sono quelli di ponte Sant'Angelo su OpenStreetMap (way 25752465: 3,65 gradi da nord verso ovest), non la perpendicolare al fiume
       del modello, che lo girava di 8,4 gradi e lo faceva arrivare 15 m a ovest della porta del mausoleo. */
    if(p[6]!=null){ q=new THREE.Vector3(p[0],q.y,p[1]); rot=p[6]; RM.ponteElio={x:p[0], z:p[1], asse:[Math.cos(rot),-Math.sin(rot)]}; }
    if(!p[3] && !p[4] && !p[5]){ PC[p[2]].dentro(q.x,-.5,q.z,rot,function(B){ ponte(B,'tutto',q,rot); }); return; }      // i ponti che non cambiano restano nella maglia comune
    var mat=RM.matPietra(p[2]), fa=function(parti){ var C=new RM.Costruttore(); C.dentro(q.x,-.5,q.z,rot,function(B){ ponte(B,parti,q,rot); }); var g=C.maglia(mat); g.visible=false; RM.scene.add(g); return g; };
    storie.push({dal:p[3]||0, rotto:p[4], pile:p[5], intero:fa('tutto'), mezzo:p[4]?fa('rotto'):null, resti:p[5]?fa('pile'):null});
  });
  RM.moduli.push(function(anno){ storie.forEach(function(s){
    var su=anno>=s.dal, r=s.rotto&&anno>=s.rotto, pi=s.pile&&anno>=s.pile;
    s.intero.visible=su&&!r&&!pi; if(s.mezzo) s.mezzo.visible=su&&r; if(s.resti) s.resti.visible=pi; }); });
  /* Isola Tiberina. «The present length of the island is 269 metres, and its greatest width 67 metres»; «the island itself was made to resemble a ship. A stone platform was built
     round it, and upon this a wall was erected which in shape reproduced exactly the sides of a Roman ship»; l'obelisco «is thought to have represented the mast» (Platner e Ashby,
     Insula Tiberina, letto il 23 novembre 2026). Quale capo fosse la prua la voce non lo dice in modo univoco (poppa a est nel testo, prua a est in una nota): qui i due capi sono
     a punta, quello a valle di più. Prima l'isola era un ovale di 46 x 132 m. Segue la curva del fiume; il fiume del modello è largo 112 m dappertutto, quindi i due rami
     restano più stretti del vero. Il tempio di Esculapio c'era, ma a quale capo la voce non lo dice: tempio e case sono indicativi. */
  B=PC.A;
  (function(){
    var m=1e9, tm=0, i, q, L=curva.getLength(), sx=[], dx=[], N=14, W=3.35, MEZZA=13.45, monte=curva.getPoint(0).z<curva.getPoint(1).z?-1:1;      // il fiume scende da nord: da che parte della curva sta il monte
    for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); var dd=Math.hypot(q.x+66,q.z-28); if(dd<m){ m=dd; tm=i/2400; } }
    var tmPonte=tm; tm+=monte*3.2/L;      /* i due ponti non stanno a metà dell'isola ma verso valle: il centro va 32 m a monte, così il capo a valle resta prima del ponte Emilio (posizione dei capi indicativa) */
    for(i=0;i<=N*2;i++){ var u=i/N-1, c=curva.getPoint(tm+u*MEZZA/L), tg=curva.getTangent(tm+u*MEZZA/L), n=Math.hypot(tg.x,tg.z)||1, w=W*Math.pow(1-Math.pow(Math.abs(u),u*monte<0?1.7:2.6),.75);
      sx.push([c.x-tg.z/n*w,c.z+tg.x/n*w,c.x-tg.z/n*w*.9,c.z+tg.x/n*w*.9]); dx.push([c.x+tg.z/n*w,c.z-tg.x/n*w,c.x+tg.z/n*w*.9,c.z-tg.x/n*w*.9]); }
    for(i=0;i<N*2;i++){ var a=sx[i], b=sx[i+1], e=dx[i], f=dx[i+1];
      B.quad([a[0],-.5,a[1]],[b[0],-.5,b[1]],[b[2],.35,b[3]],[a[2],.35,a[3]],P.travertino).quad([f[0],-.5,f[1]],[e[0],-.5,e[1]],[e[2],.35,e[3]],[f[2],.35,f[3]],P.travertino);      // le fiancate di travertino
      B.quad([a[2],.35,a[3]],[b[2],.35,b[3]],[f[2],.35,f[3]],[e[2],.35,e[3]],P.selce); }                                                                                           // il piano dell'isola
    q=curva.getPoint(tm); var t0=curva.getTangent(tm), pb=curva.getPoint(tmPonte), nn=Math.hypot(t0.x,t0.z)||1, zb=((pb.x-q.x)*t0.x+(pb.z-q.z)*t0.z)/nn, sg=zb<0?-1:1;      // zb: dove il ponte attraversa l'isola, lungo il suo asse
    B.dentro(q.x,.35,q.z,Math.atan2(t0.x,t0.z),function(B){      /* tempio e case stanno dalla parte lunga dell'isola, lontano dal ponte; l'obelisco dall'altra (24 novembre 2026: una casa finiva sotto l'impalcato) */
      B.tempio(1.6,2.6,1.1,0,zb-sg*5.4,0,{fronte:4,podio:.25});
      B.scatola(2.2,.9,2.2,.2,0,zb-sg*9.3,P.intonaco).falde(2.4,.5,2.2,.2,.9,zb-sg*9.3,P.coppi); B.scatola(1.5,.7,2.2,-.1,0,zb-sg*12.2,P.intonaco).falde(2.2,.4,1.7,-.1,.7,zb-sg*12.2,P.coppi,Math.PI/2);
      B.scatola(.3,.3,.3,0,0,zb+sg*2.4,P.marmo).cilindro(.1,1.4,0,.3,zb+sg*2.4,P.granito,.05,4); });      // l'obelisco, l'albero della nave
  })();
  ['A','B','C'].forEach(function(k){ RM.scene.add(PC[k].maglia(RM.matPietra(k))); });
})();

/* Le testate dei ponti scendono (o salgono) fino al terreno con una rampa: prima l'impalcato finiva di colpo sopra la riva o dentro (23 novembre 2026, l'utente: «sembra che i ponti
   siano sospesi senza finire»). q, rot: centro del ponte e rotazione; mezzo: metà lunghezza; yTop: piano dell'impalcato in coordinate locali (origine a -0,5); larga: metà larghezza */
function rampe(B,q,rot,mezzo,yTop,larga,colore){
  [-1,1].forEach(function(s){
    var c=Math.cos(rot), sn=Math.sin(rot), hq=RM.hSuolo||RM.h, x0=s*mezzo, k, yg=yTop;
    for(k=1;k<=12;k++){ var xl=s*(mezzo+k*.5); yg=hq(q.x+xl*c,q.z-xl*sn)+.5; if(Math.abs(yg-yTop)<.08) break; }      // il terreno lungo l'asse, mezzo metro alla volta
    var dy=yg-yTop; if(Math.abs(dy)<.05) return;
    var L=Math.min(6,Math.max(1.2,Math.abs(dy)*3)), x1=s*(mezzo+L), y1=hq(q.x+x1*c,q.z-x1*sn)+.5+.04, fondo=Math.min(yTop,y1)-.4;
    B.quad([x0,yTop,larga],[x1,y1,larga],[x1,y1,-larga],[x0,yTop,-larga],colore);      // il piano della rampa
    B.quad([x0,fondo,larga],[x1,fondo,larga],[x1,y1,larga],[x0,yTop,larga],colore).quad([x0,yTop,-larga],[x1,y1,-larga],[x1,fondo,-larga],[x0,fondo,-larga],colore);      // i fianchi
  });
}
/* 312: il ponte provvisorio di Massenzio accanto al ponte Milvio. Zosimo II 15-16 (traduzione del 1814): un ponte di travi in due metà, unite al centro da ferri da togliere, che cede
   sotto i fuggiaschi; Eusebio, Storia ecclesiastica IX 9, 5-7: un ponte di barche; Lattanzio 44, 9: il ponte alle spalle di Massenzio «viene tagliato». Dove fosse esattamente non è scritto:
   qui una passerella di travi su cavalletti, una trentina di metri a monte del ponte di pietra, visibile solo nella tappa del 312. È uno schema, detto nella didascalia (milvio312 in js/dati.js). */
(function(){
  var curva=RM.curvaFiume, p=[-152,-479], m=1e9, tm=0, i, q, dd;
  for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x-p[0],q.z-p[1]); if(dd<m){ m=dd; tm=i/2400; } }
  var c0=curva.getPoint(tm), t=tm;
  while(t>0.0005){ t-=0.0002; q=curva.getPoint(t); if(Math.hypot(q.x-c0.x,q.z-c0.z)>=3.2) break; }      // circa 30 m lungo il fiume
  var tg=curva.getTangent(t), B=new RM.Costruttore(), rp=Math.atan2(-tg.x,-tg.z);
  B.dentro(q.x,-.5,q.z,rp,function(B){
    rampe(B,q,rp,7.8,1,.4,P.tronco);
    B.scatola(15.6,.1,.8,0,.9,0,P.tronco).scatola(15.6,.22,.05,0,1,.38,P.tronco).scatola(15.6,.22,.05,0,1,-.38,P.tronco);      // impalcato e parapetti
    for(var x=-7;x<=7.01;x+=1.4){ B.scatola(.14,.95,.14,x,0,.3,P.tronco).scatola(.14,.95,.14,x,0,-.3,P.tronco); }      // cavalletti nel fiume
  });
  var g=B.maglia(RM.matPietra()); g.visible=false; RM.scene.add(g);
  RM.moduli.push(function(anno){ g.visible=anno>=311.6&&anno<313; });
})();

/* avanzamento del cantiere delle mura (0-1): aperto nel 271, il grosso fatto alla morte di Aureliano, finito sotto Probo (vedi sopra); alla tappa del 271 è appena cominciato */
var CANTIERE_MURA=[[270.6,0],[271,.3],[275,.85],[280,1]];
RM.moduli.push(function(anno){
  mura(Math.max(D.interp(D.MURA_ALTE,anno),anno>=270.6?1:0), RM.sfuma(545.2,546,anno)*(1-.7*RM.sfuma(546.8,549,anno))*(1-RM.sfuma(715,790,anno)),anno,D.interp(CANTIERE_MURA,anno));   // Belisario le richiude in fretta nel 547: resta la cicatrice
  acque(anno);
});
})();
