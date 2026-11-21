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
    a=M[i]; b=M[(i+1)%M.length]; L=Math.hypot(b[0]-a[0],b[1]-a[1]); n=Math.max(1,Math.round(L/6));
    for(k=0;k<n;k++) passi.push({x:a[0]+(b[0]-a[0])*(k+.5)/n, z:a[1]+(b[1]-a[1])*(k+.5)/n, ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0]), len:L/n});
  }
  var T=new RM.Costruttore().scatola(1,1,.55,0,0,0,P.mattone);                                  // tratto: cortina, cammino di ronda, merli
  for(k=0;k<4;k++) T.scatola(.13,.14,.14,-.375+k*.25,1,.2,P.mattone);
  var W=new RM.Costruttore().scatola(1.5,1.42,1.6,0,0,.25,P.mattone).scatola(1.5,.06,1.6,0,1.42,.25,P.tufo);   // torre quadrata, sporgente
  [[-.6,-.4],[0,-.4],[.6,-.4],[-.6,.95],[0,.95],[.6,.95]].forEach(function(p){ W.scatola(.3,.16,.2,p[0],1.48,p[1],P.mattone); });
  var mat=RM.matPietra(classe('mura')), tratti=istanze(T.geometria(),mat,passi.length), torri=istanze(W.geometria(),mat,passi.length);

  /* porte dove le vie attraversano la cinta */
  var G=new RM.Costruttore(), porte=0;
  RM.STRADE.forEach(function(s){
    for(var i=0;i<s.length-1;i++) for(var j=0;j<M.length;j++){
      var p=s[i], r=[s[i+1][0]-p[0],s[i+1][1]-p[1]], q=M[j], w=M[(j+1)%M.length], sv=[w[0]-q[0],w[1]-q[1]], den=r[0]*sv[1]-r[1]*sv[0]; if(Math.abs(den)<1e-6) continue;
      var t=((q[0]-p[0])*sv[1]-(q[1]-p[1])*sv[0])/den, u=((q[0]-p[0])*r[1]-(q[1]-p[1])*r[0])/den; if(t<0||t>1||u<0||u>1) continue;
      var x=p[0]+r[0]*t, z=p[1]+r[1]*t; porte++;
      G.dentro(x,RM.h(x,z)-.3,z,Math.atan2(-sv[1],sv[0]),function(B){
        B.scatola(3,1.25,1.1,0,0,0,P.travertino).aperture(-.8,.56,.8,.56,1,0,.85,1).aperture(.8,-.56,-.8,-.56,1,0,.85,1);
        [-1,1].forEach(function(k){ B.cilindro(1,1.7,k*2,0,.3,P.mattone,null,14).cilindro(1.08,.12,k*2,1.7,.3,P.tufo,null,14); });
      });
    }
  });
  var magliaPorte=G.maglia(mat); RM.scene.add(magliaPorte);
  RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:tratti,id:'mura'},{maglia:torri,id:'mura'},{maglia:magliaPorte,id:'mura'}]);
  passi.forEach(function(p,j){ p.rotto=RM.grana(Math.floor(j/5),7)<.3; });      // i tratti che Totila fa abbattere nel 546: circa un terzo, a blocchi
  var ultima=-1, ultimaBr=-1;
  return function(alt,br){
    if(Math.abs(alt-ultima)<.002 && Math.abs(br-ultimaBr)<.01) return; ultima=alt; ultimaBr=br;
    passi.forEach(function(p,j){
      if(p.y==null){ var cx=Math.cos(p.ang)*p.len/2, cz=-Math.sin(p.ang)*p.len/2, ya=RM.h(p.x-cx,p.z-cz), yb=RM.h(p.x+cx,p.z+cz); p.y=(ya+yb)/2-.3; p.yt=ya-.3; p.pend=Math.atan2(yb-ya,p.len); }   // sui pendii la cortina segue il terreno invece di salire a gradoni
      var y=p.y, sy=Math.max(alt,.0001)*(p.rotto?1-.8*br:1);
      d.position.set(p.x,y,p.z); d.rotation.set(0,p.ang,p.pend); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix(); tratti.setMatrixAt(j,d.matrix);
      d.position.set(p.x-Math.cos(p.ang)*p.len/2,p.yt,p.z+Math.sin(p.ang)*p.len/2); d.rotation.z=0; d.scale.set(1,j%2?sy:0,j%2?1:0); d.updateMatrix(); torri.setMatrixAt(j,d.matrix);
    });
    tratti.instanceMatrix.needsUpdate=true; torri.instanceMatrix.needsUpdate=true;
    tratti.visible=torri.visible=magliaPorte.visible=alt>.01; magliaPorte.scale.y=Math.max(alt,.0001);
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
             {passo:1.5, p:[[-22,-175,3.9],[-19,-150,3.85],[-13.2,-112.4,3.79],[-17,-93,3.75],[-44,-74,3.7]]},                                    // Vergine: esce dalle pendici del Pincio e attraversa il Campo Marzio
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
    e.taglio=b[0]<.4?536.9+b[1]*.5:9999;                                           // il taglio del 537 colpisce tratti contigui
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
  var PC={A:new RM.Costruttore(),B:new RM.Costruttore(),C:new RM.Costruttore()}, B, curva=RM.curvaFiume;
  [[-157,-104,'A'],[-120,1,'B'],[-66,28,'A'],[-52,38,'A'],[-84,97,'C'],[-152,-479,'A']].forEach(function(p){     // Elio, Aurelio (ponte Sisto), isola Tiberina, Emilio, Probo, Milvio
    B=PC[p[2]];
    var m=1e9, tm=0, i, q; for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); var dd=Math.hypot(q.x-p[0],q.z-p[1]); if(dd<m){ m=dd; tm=i/2400; } }
    q=curva.getPoint(tm); var tg=curva.getTangent(tm);
    B.dentro(q.x,-.5,q.z,Math.atan2(-tg.x,-tg.z),function(B){            // l'asse x locale attraversa il fiume
      B.scatola(15,.3,1.3,0,.85,0,P.travertino).scatola(15,.16,.12,0,1.15,.6,P.travertino).scatola(15,.16,.12,0,1.15,-.6,P.travertino);
      [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.7,.9,1.5,x,0,0,P.travertino); });
      B.scatola(2,.9,1.3,-6.6,0,0,P.travertino).scatola(2,.9,1.3,6.6,0,0,P.travertino);
    });
  });
  B=PC.A;                                                                  // l'isola c'è; il tempio e la casa sopra sono indicativi
  B.dentro(-66,-.5,28,1.2,function(B){
    var is=RM.ellisse(2.3,6.6,20), su=RM.ellisse(2.1,6.3,20), ce=su.map(function(){ return [0,0]; });
    B.striscia(is,0,su,.85,P.travertino).striscia(su,.85,ce,.85,P.selce);
    B.dentro(0,.85,0,0,function(B){ B.tempio(1.5,2.4,1.1,0,-2.6,0,{fronte:4,podio:.25}); B.scatola(2.2,1,2.4,0,0,1.8,P.intonaco).falde(2.4,.5,2.4,0,1,1.8,P.coppi); B.cilindro(.1,1.4,0,0,-.4,P.mattone,.05,4); });
  });
  ['A','B','C'].forEach(function(k){ RM.scene.add(PC[k].maglia(RM.matPietra(k))); });
})();

RM.moduli.push(function(anno){
  mura(D.interp(D.MURA_ALTE,anno), RM.sfuma(545.2,546,anno)*(1-.7*RM.sfuma(546.8,549,anno))*(1-RM.sfuma(715,790,anno)));   // Belisario le richiude in fretta nel 547: resta la cicatrice
  acque(anno);
});
})();
