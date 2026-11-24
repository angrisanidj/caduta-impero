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
      [-34.138,-75.987,4.0,'q',1.3],[-35.482,-75.593,4.0,'a'],[-36.92,-75.17,3.99,'a'],[-49,-74.5,3.97]]},
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
      [204.5,39.3,9.62,'a'],[196.2,45.7,9.59,'a'],[186,51.3,9.56,'a'],[176.9,54.4,9.53,'a'],[156.7,57.1,9.46,'a'],[120,70,9.2,'a'],[87.1,81.7,8.9,'a'],[82.16,76.83,8.87,'q',.65],
      [81.56,76.29,8.86,'a'],[76.1,71.7,8.82,'a'],[71.1,66.9,8.78,'a'],[37,60.4,8.45,'a'],[32,59.4,8.4,'a'],[26,54,8.3]]}];
  var el=[], rnd=RM.casuale(537), CIMA=.48, PEZZI=new RM.Costruttore();
  /* attico sopra una porta o sopra un arco: da sopra il fornice (alto «sotto») fino alla sommità del canale; per le porte anche le due pile ai lati del passaggio */
  function attico(a,b,sotto,pile){
    var mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, L=Math.hypot(b[0]-a[0],b[1]-a[1]), y0=RM.h(mx,mz)-.3, su=(a[2]+b[2])/2-y0;
    if(su<sotto+.05) return;
    PEZZI.dentro(mx,y0,mz,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),function(B){
      if(pile) B.scatola(.62,sotto,.95,-(L/2-.31),0,0,P.travertino).scatola(.62,sotto,.95,L/2-.31,0,0,P.travertino);
      B.scatola(L,su-sotto,.95,0,sotto,0,P.travertino).scatola(L+.12,.07,1.05,0,su-.07,0,P.travertino);
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
  function quale(c){ var e=el[c.instanceId%N]; return e&&e.li===4?'antoniniano':'acquedotti'; }
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:arcate,id:quale},{maglia:spente,id:quale},{maglia:pile,id:quale},{maglia:monconi,id:quale},{maglia:pezzi,id:'acquedotti'}]);
  for(k=0;k<N;k++) monconi.setColorAt(k,BIANCO);                                 // le maglie condividono il materiale: tutte devono avere il colore per istanza
  function zero(maglia,j){ d.scale.set(0,0,0); d.updateMatrix(); maglia.setMatrixAt(j,d.matrix); }
  function vicino(i,j){ return j>=0&&j<el.length&&el[j].li===el[i].li&&Math.abs(el[j].ord-el[i].ord)===1; }
  return function(anno){
    var passo=Math.round(anno*4); if(passo===ultimo) return; ultimo=passo;
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
      var s=st[j], rotto=s.rotto, spenta=e.perso&&anno>=537, ar=spenta?spente:arcate, T=CIMA*e.len, larga=e.suolo?.6:.8, H=e.cima-e.y, Hp=H-T;
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
   qui una passerella di travi su cavalletti, una trentina di metri a monte del ponte di pietra, visibile solo nella tappa del 312. È uno schema, detto nella didascalia (milvio312 in js/dati.js).
   Dal 24 novembre 2026 la passerella, con le sue rampe, sta in js/scene-tappe.js (fuga312), in due metà che cedono al centro. */

/* avanzamento del cantiere delle mura (0-1): aperto nel 271, il grosso fatto alla morte di Aureliano, finito sotto Probo (vedi sopra); alla tappa del 271 è appena cominciato */
var CANTIERE_MURA=[[270.6,0],[271,.3],[275,.85],[280,1]];
RM.moduli.push(function(anno){
  mura(Math.max(D.interp(D.MURA_ALTE,anno),anno>=270.6?1:0), RM.sfuma(545.2,546,anno)*(1-.7*RM.sfuma(546.8,549,anno))*(1-RM.sfuma(715,790,anno)),anno,D.interp(CANTIERE_MURA,anno));   // Belisario le richiude in fretta nel 547: resta la cicatrice
  acque(anno);
});
})();
