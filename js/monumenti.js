/* Monumenti: restano della stessa grandezza per tutta la storia, cambia solo il loro stato.
   La storia di quelli in elenco (uso | chiuso | spogliato | assente) sta in dati.js; gli altri sono comparse.
   Ogni monumento è una sola maglia costruita in coordinate locali (fronte verso +z, salvo rotazione). */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI;
var TINTA={ uso:new THREE.Color(1,1,1), chiuso:RM.col(0xb5ad9e), spogliato:RM.col(0x8c7e70), bruciato:RM.col(0x6f655c), crollato:RM.col(0xa69d90), cava:RM.col(0xa39584), assente:new THREE.Color(1,1,1) };

/* ---------- elementi ricorrenti ---------- */
function arcato(B,w,h,d,x,y,z,col,livelli,n){            // corpo con file di arcate sui lati lunghi
  B.scatola(w,h,d,x,y,z,col);
  for(var l=0;l<livelli;l++){ var yy=y+h*(l+.14)/livelli, hh=h/livelli*.6;
    B.aperture(x-w/2,z+d/2,x+w/2,z+d/2,n,yy,hh).aperture(x+w/2,z-d/2,x-w/2,z-d/2,n,yy,hh); }
  return B;
}
function basilica(B,w,d,h,x,z,tetto){                    // basilica civile a due ordini, navata rialzata
  arcato(B,w,h,d,x,0,z,P.travertino,2,Math.round(w/1.1));
  B.scatola(w*.92,h*.4,d*.46,x,h,z,P.marmo).falde(w*.92,h*.24,d*.5,x,h*1.4,z,tetto||P.coppi);
}
function portico(B,w,d,x,y,z,h,suolo){                   // piazza porticata
  var nx=Math.max(3,Math.round(w/.95)), nz=Math.max(3,Math.round(d/.95)), m=.65, r=.09, a=y+.1;
  B.scatola(w,.1,d,x,y,z,suolo||P.selce);
  B.colonne(x-w/2+m,z-d/2+m,x+w/2-m,z-d/2+m,nx,h,r,a).colonne(x-w/2+m,z+d/2-m,x+w/2-m,z+d/2-m,nx,h,r,a)
   .colonne(x-w/2+m,z-d/2+m,x-w/2+m,z+d/2-m,nz,h,r,a).colonne(x+w/2-m,z-d/2+m,x+w/2-m,z+d/2-m,nz,h,r,a);
  B.scatola(w,.14,m+.4,x,a+h,z-d/2+m/2+.1,P.coppi).scatola(w,.14,m+.4,x,a+h,z+d/2-m/2-.1,P.coppi)
   .scatola(m+.4,.14,d-2*m,x-w/2+m/2+.1,a+h,z,P.coppi).scatola(m+.4,.14,d-2*m,x+w/2-m/2-.1,a+h,z,P.coppi);
  B.scatola(w,h+.35,.14,x,y,z-d/2,P.tufo).scatola(.14,h+.35,d,x-w/2,y,z,P.tufo).scatola(.14,h+.35,d,x+w/2,y,z,P.tufo);
}
function circo(B,L,W,h,spina){                           // circo o stadio: gradinate, fornici, pista
  var pr=function(w){ return RM.stadio(L-(W-w),w,26,14); }, est=pr(W), cima=pr(W-1.3), pista=pr(W*.62);
  var asse=pista.map(function(p){ return [Math.max(-L/2+4,Math.min(L/2-W/2,p[0])),0]; });
  B.striscia(est,0,est,h,P.travertino).striscia(est,h,cima,h,P.travertino).striscia(cima,h,cima,h-.3,P.travertino)
   .striscia(cima,h-.3,pista,.45,P.tufo).striscia(pista,.45,pista,.12,P.travertino).striscia(pista,.12,asse,.12,P.sabbia);
  B.fornici(est,.15,h*.36,.5,1,false).fornici(est,h*.56,h*.28,.4,1,false).aperture(-L/2,-W/2+1,-L/2,W/2-1,12,.15,h*.4);
  if(spina){
    B.scatola(L*.56,.4,.8,-1,.12,0,P.travertino).scatola(.5,.3,.5,-1,.52,0,P.marmo).cilindro(.17,2.4,-1,.82,0,P.sabbia,.1,4).cono(.1,.2,-1,3.22,0,P.oro,4);      // la spina con l'obelisco di Augusto (oggi in piazza del Popolo)
    [-1,1].forEach(function(s2){ B.colonne(-1+s2*L*.12-.4,0,-1+s2*L*.12+.4,0,2,.9,.05,.52).scatola(1,.08,.2,-1+s2*L*.12,1.42,0,P.marmo); B.cilindro(.5,.12,-1+s2*L*.2,.52,0,P.acqua,null,10); });      // i contagiri (le uova e i delfini) e le vasche
    [-1,1].forEach(function(s){ for(var k=0;k<3;k++) B.cono(.16,.8,-1+s*(L*.28+.6),.12,(k-1)*.36,P.oro,8); });
    B.scatola(4,h+1,1.6,-4,0,-W/2+.2,P.marmo).falde(4,.7,1.8,-4,h+1,-W/2+.2,P.coppi);          // pulvinar, lato del Palatino
  }
}
function teatro(B,r,h){                                  // cavea a semicerchio verso +z, scena a -z
  var est=RM.ellisse(r,r,22,0,PI), int=RM.ellisse(r*.9,r*.9,22,0,PI), orc=RM.ellisse(r*.3,r*.3,22,0,PI), cen=orc.map(function(){ return [0,0]; });
  B.striscia(est,0,est,h,P.travertino,false).striscia(est,h,int,h,P.travertino,false).striscia(int,h,orc,.3,P.tufo,false).striscia(orc,.3,cen,.3,P.marmo,false);
  B.fornici(est,.15,h*.3,.5,1,false).fornici(est,h*.44,h*.26,.45,1,false);
  B.scatola(r*2,h*1.05,r*.24,0,0,-r*.12,P.travertino).aperture(-r*.9,0,r*.9,0,9,.4,h*.5).scatola(r*1.4,.35,r*.3,0,0,r*.15,P.marmo);
  [0,1].forEach(function(l){ B.colonne(-r*.66,.07,r*.66,.07,10,h*.36,.05,.35+l*h*.4).scatola(r*1.36,.07,.16,0,.35+l*h*.4+h*.36,.07,P.marmo); });      // la fronte della scena: due ordini di colonne
  B.aperture(r*.9,-r*.24,-r*.9,-r*.24,9,.2,h*.42);                                                                                                   // gli archi sul retro della scena
}
function terme(B,L,Pd){                                   // recinto con giardini, corpo centrale a volte, caldarium a sud (+z)
  var s=.7, a=1.5, zc=-Pd*.05;
  B.scatola(L-1,.08,Pd-1,0,0,0,P.prato);
  arcato(B,L,a,s,0,0,-Pd/2,P.mattone,1,Math.round(L/1.6)); arcato(B,L*.36,a,s,-L*.32,0,Pd/2,P.mattone,1,8); arcato(B,L*.36,a,s,L*.32,0,Pd/2,P.mattone,1,8);
  B.scatola(s,a,Pd,-L/2,0,0,P.mattone).scatola(s,a,Pd,L/2,0,0,P.mattone);
  var es=RM.ellisse(L*.15,L*.12,16,0,PI).map(function(p){ return [p[0],p[1]+Pd/2]; });           // esedra del recinto
  B.striscia(es,0,es,a+.3,P.mattone,false).fornici(es,.2,.8,.5,1,false);
  arcato(B,L*.64,2.3,Pd*.3,0,0,zc,P.intonaco,2,Math.round(L*.5));                                 // corpo centrale: i muri di mattoni erano coperti di intonaco
  B.scatola(L*.2,3.7,Pd*.17,0,0,zc,P.intonaco);                                                   // frigidarium, a tre crociere
  for(var i=-1;i<=1;i++) B.falde(Pd*.19,.8,L*.066,i*L*.066,3.7,zc,P.coppi,PI/2,P.intonaco);
  B.falde(L*.2,.7,Pd*.17,0,3.7,zc,P.coppi,0,P.intonaco);
  B.aperture(-L*.1,zc+Pd*.085,L*.1,zc+Pd*.085,3,2.5,1.05,L*.05).aperture(L*.1,zc-Pd*.085,-L*.1,zc-Pd*.085,3,2.5,1.05,L*.05);      // i finestroni termali, uno per crociera, sopra i tetti delle aule vicine
  [-1,1].forEach(function(k){
    B.scatola(L*.12,2.9,Pd*.26,k*L*.17,0,zc,P.intonaco).volta(Pd*.26,L*.06,k*L*.17,2.9,zc,P.intonaco,PI/2);  // aule laterali
    B.scatola(L*.13,.12,Pd*.2,k*L*.255,2.3,zc-Pd*.02,P.ombra);                                              // palestre a cielo aperto
    B.scatola(L*.1,1.9,Pd*.1,k*L*.3,0,Pd*.3,P.mattone).falde(L*.1,.5,Pd*.1,k*L*.3,1.9,Pd*.3,P.coppi);       // biblioteche
  });
  B.scatola(L*.2,.14,Pd*.09,0,2.3,zc-Pd*.11,P.acqua);                                                       // natatio
  B.cilindro(L*.085,3.3,0,0,zc+Pd*.2,P.intonaco).cupola(L*.085,0,3.3,zc+Pd*.2,P.intonaco,.62);              // caldarium: rotonda a cupola, con le grandi finestre a sud per il sole del pomeriggio
  var cal=RM.ellisse(L*.085,L*.085,12,0,PI).map(function(p){ return [p[0],p[1]+zc+Pd*.2]; });
  B.fornici(cal,.5,1.1,.5,1,false).fornici(cal,2,.9,.5,1,false);
  B.scatola(L*.1,2.6,Pd*.08,0,0,zc+Pd*.12,P.intonaco);
}
function chiesa(B,L,W,transetto){                         // basilica cristiana: navata lungo x, abside a -x, atrio a +x
  B.scatola(L,2.8,W*.36,0,0,0,P.mattone).falde(L,.9,W*.4,0,2.8,0,P.coppi,0,P.mattone);
  B.aperture(-L/2+.5,W*.18,L/2-.5,W*.18,Math.round(L/1.1),1.9,.55,.3).aperture(L/2-.5,-W*.18,-L/2+.5,-W*.18,Math.round(L/1.1),1.9,.55,.3);
  [-1,1].forEach(function(k){ B.scatola(L,1.5,W*.3,0,0,k*W*.33,P.mattone).scatola(L+.1,.14,W*.32,0,1.5,k*W*.33,P.coppi); });
  B.cilindro(W*.17,2.3,-L/2,0,0,P.mattone,null,14).cono(W*.18,.7,-L/2,2.3,0,P.coppi,14);
  B.vano(L/2+.03,0,0,0,1,.55,1.1).vano(L/2+.03,0,W*.33,0,1,.36,.8).vano(L/2+.03,0,-W*.33,0,1,.36,.8).vano(L/2+.03,1.75,0,0,1,.5,.75);      // le tre porte e la finestra della facciata
  if(transetto) B.scatola(2.4,2.8,W*1.25,-L/2+1.6,0,0,P.mattone).falde(W*1.25,.8,2.6,-L/2+1.6,2.8,0,P.coppi,PI/2,P.mattone);
  portico(B,W*.8,W*.8,L/2+W*.4,0,0,1.1);
}

/* complessi su terreno in pendenza: ogni corpo poggia alla quota del suo punto */
function quota(x,z){ return Math.min(RM.h(x,z),RM.h(x+5,z),RM.h(x-5,z),RM.h(x,z+5),RM.h(x,z-5))-.1; }
function suTerreno(X,Z,ry){ var q=quota(X,Z), c=Math.cos(ry||0), s=Math.sin(ry||0); return function(lx,lz){ return RM.h(X+lx*c+lz*s,Z-lx*s+lz*c)-q; }; }
function casa(B,y,lx,lz,w,d,h,ry){ B.scatola(w,h+.3,d,lx,y-.3,lz,P.mattone,ry).falde(w+.2,.45,d+.2,lx,y+h,lz,P.coppi,ry,P.mattone); }

/* tracciato delle mura leonine (848-852): dal mausoleo di Adriano attorno al colle Vaticano, fino al Tevere. Coordinate relative a (-215,-92).
   Punti reali (OpenStreetMap): il lato nord è il Passetto fino a porta San Pellegrino; in cima al colle i due tratti superstiti nei giardini vaticani e la torre di San Giovanni,
   accanto a porta Pertusa; a sud porta Cavalleggeri e porta Santo Spirito. Fra un punto e l'altro il tracciato è interpolato. */
var LEO=(function(){ var L=[[-163,-120],[-233.3,-121],[-250,-124],[-272,-127],[-294,-124.5],[-300,-119],[-307,-111],[-313,-100.5],[-304,-96.5],[-285,-89],[-262,-87],[-240.2,-87.7],[-212,-86.5],[-196.5,-86.7],[-187,-84]], passi=[], zone=[];
  for(var i=0;i<L.length-1;i++){ var a=L[i], b=L[i+1], len=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(len/3.2));
    for(var k=0;k<n;k++){ var x=a[0]+(b[0]-a[0])*(k+.5)/n+215, z=a[1]+(b[1]-a[1])*(k+.5)/n+92; passi.push({x:x,z:z,len:len/n,ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}); if(k%2===0) zone.push([x,z,2.4]); } }
  return {passi:passi,zone:zone}; })();

/* dal mondo al riferimento locale del gruppo dei Fori (origine 3,-8; rotazione -.35): così gli edifici si scrivono con le loro coordinate di scena reali */
function LF(x,z){ var dx=x-3, dz=z+8, c=Math.cos(-.35), s=Math.sin(-.35); return [dx*c-dz*s, dx*s+dz*c]; }
function inForo(B,x,z,ry,fn){ var p=LF(x,z); return B.dentro(p[0],0,p[1],ry||0,fn); }
/* Monte Testaccio: contorno reale (OpenStreetMap, way 23921018), in coordinate relative al centro (-84,184). */
var TESTACCIO=[[-94.7,181.4],[-94.6,183.1],[-94.5,185],[-93.8,186.7],[-92.8,188.5],[-91.8,189.8],[-90.4,191.2],[-89.5,191.8],[-88.6,192],[-86,193.1],[-83.9,195.9],[-82.1,198.6],[-80.6,199.3],[-78.9,199.1],[-77.3,198.5],[-75.8,197.5],[-74.6,195.9],[-73,192.1],[-72.8,190.6],[-73.2,188],[-74,186.1],[-75.2,182.4],[-76.2,180.1],[-76.8,177.8],[-76.9,176.1],[-76.4,174.3],[-77,171.1],[-78,169.1],[-78.2,168.6],[-94.5,177.4],[-94.7,179.1]].map(function(p){ return [p[0]+84,p[1]-184]; });
/* ---------- elenco ---------- */
var M=[
 {id:'colosseo', nome:'Colosseo', x:57,z:26, ry:-.3, zone:[[0,0,14.5]], et:1, fa:function(B){
    var n=80, e=RM.ellisse(9.4,7.8,n), i=RM.ellisse(8.5,6.9,n), m1=RM.ellisse(7.3,5.7,n), m2=RM.ellisse(6.1,4.5,n), po=RM.ellisse(4.9,3.3,n), ar=RM.ellisse(4.35,2.75,n), ce=ar.map(function(){ return [0,0]; });
    B.striscia(e,0,e,4.85,P.travertino).striscia(e,4.85,i,4.85,P.travertino).striscia(i,4.85,i,4,P.travertino)
     .striscia(i,4,m1,3.1,P.tufo).striscia(m1,3.1,m1,2.8,P.travertino).striscia(m1,2.8,m2,1.9,P.tufo).striscia(m2,1.9,m2,1.6,P.travertino).striscia(m2,1.6,po,.9,P.tufo)
     .striscia(po,.9,po,.25,P.marmo).striscia(po,.25,ar,.25,P.marmo).striscia(ar,.25,ce,.25,P.sabbia);
    B.fornici(e,.22,.9,.5).fornici(e,1.45,.88,.5).fornici(e,2.65,.88,.5).fornici(e,4.02,.34,.26,2,true,true);
    e.forEach(function(p){ var q=1.008; [[.12,1.16],[1.4,1.08],[2.6,1.1],[3.82,1.03]].forEach(function(l,k){ B.scatola(k<3?.11:.09,l[1],k<3?.11:.07,p[0]*q,l[0],p[1]*q,P.travertino,Math.atan2(p[0],p[1])); }); });      // semicolonne dei tre ordini e lesene dell'attico, fra un fornice e l'altro
    [1.28,2.48,3.7].forEach(function(y){ var c=RM.ellisse(9.5,7.9,n); B.striscia(c,y,c,y+.12,P.marmo); });      // cornici
    /* secondo anello: il muro ad arcate che oggi fa da facciata sul lato sud, dove l'anello esterno è caduto. Arriva a due ordini, circa due terzi dell'altezza del muro esterno;
       dietro, al posto della parte alta della cavea, resta un ripiano di rovine. Finché l'esterno è in piedi tutto questo resta nascosto */
    var w=RM.ellisse(8.7,7.2,n), wc=RM.ellisse(8.74,7.24,n);
    B.striscia(w,0,w,3,P.travertino).fornici(w,.22,.9,.5).fornici(w,1.45,.88,.5).striscia(w,3,m1,3.08,P.tufo);
    [1.28,2.48].forEach(function(y){ B.striscia(wc,y,wc,y+.1,P.marmo); });
    /* i pali del velario: duecentoquaranta nella realtà, infilati nelle mensole dell'attico; qui uno ogni tre */
    e.forEach(function(p){ B.scatola(.05,.95,.05,p[0]*.997,4.45,p[1]*.997,P.tronco); });
    B.scatola(1,.5,1,-11.7,0,-4.65,P.marmo);                                                                     // il basamento del Colosso (sette metri di lato, rivestito di marmo): resta fino al 1936
 }},
 /* Il Colosso: statua di bronzo di circa 35 m, sul basamento reale (OpenStreetMap, way 709011412). La figura è indicativa: stante, corona di raggi, timone nella destra e globo
    nella sinistra come sulle monete; da che parte guardasse non si sa. */
 {id:'colosso', nome:'Colosso del Sole', x:47.2,z:18.1, ry:-.3, come:'colosseo', fa:function(B){
    var S=P.statua, k;
    [-.2,.2].forEach(function(x){ B.cilindro(.17,1.5,x,.5,0,S,.14,8); });                                         // gambe
    B.cilindro(.31,1.15,0,2,0,S,.38,10);                                                                         // torso
    B.geo(new THREE.SphereGeometry(.2,10,8).translate(0,3.5,0),S).cilindro(.1,.18,0,3.15,0,S,.1,8);             // testa e collo
    B.cilindro(.09,1.15,.48,2,0,S,.1,6).scatola(.05,2.3,.05,.62,.5,.14,S).scatola(.05,.5,.3,.62,.5,.14,S);       // braccio destro e timone
    B.cilindro(.09,.55,-.48,2.6,0,S,.1,6).geo(new THREE.CylinderGeometry(.08,.08,.5,6).rotateX(PI/2).translate(-.48,2.62,.25),S).geo(new THREE.SphereGeometry(.13,8,6).translate(-.48,2.74,.52),S);   // braccio sinistro e globo
    for(k=-3;k<=3;k++) B.geo(new THREE.ConeGeometry(.035,.42,5).translate(0,.4,0).rotateZ(-k*.42).translate(0,3.5,0),P.oro);      // i raggi del Sole
 }},
 /* Meta Sudans: fontana conica flavia, con la vasca di 21 m rifatta nel IV secolo. Demolita nel 1936; la posizione è quella delle coordinate correnti (41°53'24" N, 12°29'27" E),
    a nord dell'arco di Costantino: vale entro una quindicina di metri. Altezza del cono (circa 17 m) dalle ricostruzioni correnti. */
 {id:'metasudans', nome:'Meta Sudans', x:45.6,z:27.8, ry:0, come:'colosseo', fa:function(B){
    B.cilindro(1.05,.14,0,0,0,P.marmo,1.05,24).cilindro(.95,.03,0,.13,0,P.acqua,.95,24);
    B.cilindro(.37,.36,0,.12,0,P.marmo,.34,14).cilindro(.31,1.2,0,.48,0,P.marmo,.07,14).geo(new THREE.SphereGeometry(.09,8,6).translate(0,1.74,0),P.marmo);
 }},
 {id:'circo', nome:'Circo Massimo', x:0,z:71, ry:-.651, lunga:[62,10], et:1, fa:function(B){ circo(B,62,14,2.5,true); }},
 {id:'fori', nome:'Fori', x:3,z:-8, ry:-.35, zone:[[-1.2,2.5,10.5],[-11,-1.5,7],[9,6,6],[0,-13.2,9],[11.5,-19.5,8.5],[13,-6,9.5],[-1.3,-27.8,9.5],[-7.5,-36,9.5],[5,-33,6],[11.2,13.1,3.8]].map(function(q){ var p=LF(q[0],q[1]); return [p[0],p[1],q[2]]; }), et:1, fa:function(B){
    /* Posizioni reali: i centri dei resti rilevati in OpenStreetMap (src/roma/grezzi/osm-foro.json), scritti qui in coordinate di scena.
       Orientamenti: il Foro Romano lungo il suo asse, i fori imperiali sulla loro griglia comune, girata di circa 58° rispetto al Foro.
       Forme e misure restano schematiche; qualche edificio è accorciato di poco perché le vie vere gli passino accanto e non sopra. */
    var IMP=1.022;
    inForo(B,-1.2,1.6,0,function(B){ B.scatola(12.5,.1,5,0,0,0,P.selce); });                                                       // piazza del Foro
    inForo(B,-4.6,6,0,function(B){ basilica(B,9.6,4.9,1.9,0,0); });                                                               // Giulia (l'Emilia è un edificio a sé: brucia nel 410)
    inForo(B,.8,-5.1,0,function(B){                                                                                               // Curia: aula alta e stretta, intonacata, con la porta di bronzo e tre finestre in facciata
      B.scatola(1.9,2.4,2.7,0,0,0,P.intonaco).falde(2.7,.6,2,0,2.4,0,P.bronzo,PI/2,P.intonaco);
      B.vano(0,.25,1.37,1,0,.46,1.05,true).aperture(-.72,1.37,.72,1.37,3,1.55,.42,.2);
      B.scatola(1.5,.25,.5,0,0,1.6,P.travertino).colonne(-.62,1.72,.62,1.72,4,.95,.055,.25).scatola(1.6,.07,.62,0,1.2,1.6,P.coppi);          // gradini e portichetto davanti alla porta
    });
    inForo(B,-5.5,-1,0,function(B){ B.scatola(1.3,.32,2.4,0,0,0,P.marmo).scatola(.12,.12,2.4,.6,.32,0,P.marmo).aperture(.66,1.1,.66,-1.1,6,.06,.2,.12,true); });   // i Rostri: la tribuna degli oratori, sul lato ovest della piazza
    inForo(B,-9.1,-4.9,0,function(B){ B.scatola(2,1.7,4.4,-.6,.5,0,P.marmo).falde(4.4,.5,2.1,-.6,2.2,0,P.coppi,PI/2,P.marmo).scatola(2.2,.5,4.5,-.6,0,0,P.travertino); B.tempio(2.2,1.6,1.6,.9,0,PI/2,{fronte:6}); });   // Concordia: cella larga, messa di traverso, e pronao verso il Foro
    inForo(B,-11.4,-2.6,0,function(B){ B.tempio(1.7,3,1.6,0,0,PI/2,{fronte:6,podio:.6}); });                                       // Vespasiano e Tito
    inForo(B,11.2,13.1,0,function(B){ portico(B,6.8,3,0,0,0,1); B.scatola(6.8,1.1,.5,0,1.15,-1.5,P.mattone).scatola(.5,1.1,3,-3.4,1.15,0,P.mattone).scatola(.5,1.1,3,3.4,1.15,0,P.mattone); });   // casa delle Vestali: il lungo cortile porticato, a due piani
    inForo(B,-10.1,1.1,0,function(B){ B.tempio(2.2,4,1.7,0,0,PI/2,{fronte:6,podio:.85}); });                                      // Saturno, sul suo podio alto
    inForo(B,3,9.3,0,function(B){ B.tempio(2.9,4.6,2,0,0,PI,{fronte:8,lati:9,podio:.8}); });                                      // Castori
    inForo(B,7.4,9,0,function(B){                                                                                                 // Vesta: tempio rotondo, colonne tutt'attorno, tetto conico con il foro per il fumo
      B.cilindro(1,.32,0,0,0,P.marmo,null,20).cilindro(.62,1.25,0,.32,0,P.marmo,null,16);
      for(var k=0;k<16;k++){ var a=k*PI/8; B.cilindro(.06,1.25,.86*Math.cos(a),.32,.86*Math.sin(a),P.marmo,.052,7); }
      B.cilindro(.98,.14,0,1.57,0,P.marmo,null,20).cilindro(.98,.5,0,1.71,0,P.bronzo,.16,20);
    });
    inForo(B,5.6,5.6,0,function(B){ B.tempio(2.4,2.8,1.4,0,0,-PI/2,{fronte:6}); });                                               // Divo Giulio
    inForo(B,11.6,3.7,0,function(B){ B.tempio(2.1,3.4,1.7,0,0,0,{fronte:6}); });                                                  // Antonino e Faustina
    inForo(B,-14.5,-5.2,PI/2,function(B){ B.scatola(7.4,1.1,2.4,0,0,0,P.tufo); arcato(B,7.2,1.9,2.2,0,1.1,0,P.tufo,2,11); });      // Tabularium: l'alto basamento di tufo e, sopra, la galleria ad arcate
    inForo(B,-4.6,-3.7,0,function(B){                                                                                             // arco di Settimio Severo: tre fornici, colonne su piedistalli, attico
      B.scatola(2.3,1.45,1.1,0,0,0,P.marmo).scatola(2.42,.13,1.22,0,1.45,0,P.marmo).scatola(2.3,.52,1.1,0,1.58,0,P.marmo);
      [1,-1].forEach(function(q){ B.vano(0,0,q*.575,1,0,.68,1.2).vano(-.78,0,q*.575,1,0,.34,.76).vano(.78,0,q*.575,1,0,.34,.76); B.colonne(-1.06,q*.66,1.06,q*.66,4,1.2,.06,.25); [-1.06,-.353,.353,1.06].forEach(function(x){ B.scatola(.2,.25,.2,x,0,q*.66,P.marmo); }); });
    });
    inForo(B,0,-13.2,IMP,function(B){ portico(B,7,15,0,0,0,1.1); B.tempio(2.6,3.6,1.7,0,-5.2,0,{fronte:8}); });                   // foro di Cesare, Venere Genitrice a nord-ovest
    inForo(B,11.2,-19.5,IMP,function(B){                                                                                          // foro di Augusto: Marte Ultore contro il muro tagliafuoco verso la Suburra, le due esedre ai lati
      portico(B,10.5,9.5,0,0,0,1.2); B.tempio(3.4,4.6,2.3,2.3,0,-PI/2,{fronte:8,lati:8,podio:.7}).scatola(.5,3.3,10.5,5.5,0,0,P.tufo);
      [-1,1].forEach(function(q){ var es=RM.ellisse(2,2,10,q>0?0:PI,q>0?PI:2*PI).map(function(p){ return [p[0]+1.6,p[1]+q*4.75]; }), ce=es.map(function(){ return [1.6,q*4.75]; });
        B.striscia(es,0,es,1.7,P.tufo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });
    });
    inForo(B,10.7,-8.9,IMP,function(B){ portico(B,12,4.2,0,0,0,1.2); B.tempio(1.8,2.4,1.5,4.6,0,-PI/2,{fronte:6}); });            // foro di Nerva, Minerva: lo attraversa l'Argileto
    inForo(B,16.9,-2.6,IMP,function(B){ portico(B,10,10,0,0,0,1.2,P.prato); });                                                   // tempio della Pace
    inForo(B,-1.3,-27.8,IMP,function(B){
      portico(B,11.5,9,0,0,0,1.3);                                                             // foro di Traiano
      B.scatola(.62,.34,.34,0,.1,0,P.marmo).scatola(.56,.2,.18,0,.72,0,P.statua).scatola(.12,.26,.13,.3,.86,0,P.statua).scatola(.12,.3,.13,-.02,.92,0,P.statua);      // la statua equestre di Traiano, al centro della piazza
      [[-.2,-.06],[-.2,.06],[.2,-.06],[.2,.06]].forEach(function(p){ B.scatola(.05,.28,.05,p[0],.44,p[1],P.statua); });
      [-1,1].forEach(function(q){ var es=RM.ellisse(2.3,2.3,10,q>0?-PI/2:PI/2,q>0?PI/2:3*PI/2).map(function(p){ return [p[0]+q*5.75,p[1]]; }), ce=es.map(function(){ return [q*5.75,0]; });
        B.striscia(es,0,es,1.7,P.marmo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });        // le due grandi esedre ai lati della piazza
      basilica(B,17,5.6,2.4,0,-7.6,P.bronzo);                                                  // basilica Ulpia, con le absidi alle due testate
      [-1,1].forEach(function(q){ B.cilindro(2.5,2,q*8.5,0,-7.6,P.marmo,null,18).cilindro(2.5,.55,q*8.5,2,-7.6,P.bronzo,.3,18); });
      B.scatola(.56,.55,.56,0,0,-11.6,P.marmo).cilindro(.26,.1,0,.55,-11.6,P.marmo,.23,14).cilindro(.21,3.5,0,.65,-11.6,P.marmo,.19,14);      // colonna Traiana: basamento, toro, fusto
      for(var gk=1;gk<9;gk++) B.cilindro(.212,.025,0,.65+gk*.39,-11.6,P.travertino,.21,14);     // le spire del fregio, accennate
      B.scatola(.5,.12,.5,0,4.15,-11.6,P.marmo).cilindro(.09,.5,0,4.27,-11.6,P.statua,.07,6);   // capitello e statua dell'imperatore
      B.scatola(2,1.8,2.6,-2.8,0,-11.6,P.mattone).scatola(2,1.8,2.6,2.8,0,-11.6,P.mattone);     // biblioteche
      B.tempio(3.8,5.4,2.4,0,-16.4,PI,{fronte:8,lati:9,podio:.7});                              // tempio del Divo Traiano
      B.dentro(5.9,0,0,PI/2,function(B){ var em=RM.ellisse(5,5,16,0,PI); B.striscia(em,0,em,2.6,P.mattone,false).fornici(em,.15,.6,.5,1,false).fornici(em,.95,.5,.4,1,false).fornici(em,1.75,.5,.4,1,false); });   // mercati di Traiano
    });
 }},
 {id:'arcotito', nome:'Arco di Tito', x:27.2,z:20.3, ry:1.38, zone:[[0,0,1.7]], fa:function(B){                          // un solo fornice, a cavallo della via Sacra; posizione reale (OpenStreetMap)
    B.scatola(1.35,1,.5,0,0,0,P.marmo).scatola(1.45,.1,.6,0,1,0,P.marmo).scatola(1.35,.44,.5,0,1.1,0,P.marmo);
    [1,-1].forEach(function(q){ B.vano(0,0,q*.275,1,0,.54,.84).colonne(-.58,q*.3,.58,q*.3,2,.8,.05,.2).colonne(-.38,q*.3,.38,q*.3,2,.8,.05,.2); });
 }},
 {id:'emilia', nome:'Basilica Emilia', x:7.2,z:-1, ry:-.35, come:'fori', fa:function(B){ basilica(B,8,3.4,1.8,0,0); }},
 {id:'giove', nome:'Tempio di Giove Capitolino', x:-29,z:0, ry:.5, zone:[[0,0,7.5]], fa:function(B){      // basamento di circa 54 x 62 m, la misura più citata (le stime pubblicate vanno da 50 a 74 m di lato: pianta discussa)
    B.scatola(5.4,.7,6.2,0,0,0,P.tufo).dentro(0,.7,0,0,function(B){ B.tempio(4.5,5.3,2.8,0,0,0,{fronte:6,lati:7,tetto:P.oro,podio:.5,r:.17}); });
 }},
 {id:'palatino', nome:'Palazzi del Palatino', x:13,z:47, ry:-.62, zone:[[-7,-1,13],[7,-1,13],[0,6,12]], fa:function(B){
    arcato(B,27,1.5,18,0,-.4,0,P.mattone,2,22);                                                // sostruzioni
    B.dentro(0,1.1,0,0,function(B){
      portico(B,8.5,8,-7,0,-1,1.2,P.prato);                                                    // Domus Flavia: peristilio
      B.scatola(4.6,3.4,5,-7,0,-7.6,P.intonaco).falde(5,.9,4.8,-7,3.4,-7.6,P.coppi,PI/2,P.intonaco);          // Aula Regia: la sala delle udienze, altissima, con la facciata a colonne verso l'area Palatina
      B.scatola(2.4,2.4,5,-10.8,0,-7.6,P.intonaco).scatola(2.4,2.4,5,-3.2,0,-7.6,P.intonaco);                 // basilica e larario, ai lati
      B.colonne(-11.8,-10.4,-2.2,-10.4,12,1.9,.09,0).scatola(10.2,.14,.7,-7,1.9,-10.3,P.marmo).vano(-7,0,-10.12,1,0,.7,1.5);
      B.aperture(-8.9,-10.12,-5.1,-10.12,3,2.2,.8,.5);
      B.scatola(5.4,2.6,3.6,-7,0,5,P.intonaco).falde(5.6,.7,3.8,-7,2.6,5,P.coppi,0,P.intonaco);               // triclinio, con i due ninfei ovali ai fianchi
      [-1,1].forEach(function(q){ B.cilindro(.9,.14,-7+q*3.6,0,5,P.marmo,null,14).cilindro(.75,.05,-7+q*3.6,.14,5,P.acqua,null,14); });
      arcato(B,9,2.7,13.5,2.6,0,-.5,P.mattone,2,7);                                            // Domus Augustana
      B.scatola(4,.12,4,2.6,2.7,-3.4,P.ombra).scatola(4,.12,4,2.6,2.7,2.6,P.ombra);
      var es=RM.ellisse(4.4,2.2,14,0,PI).map(function(p){ return [p[0]+2.6,p[1]+6.2]; }); B.striscia(es,-1.4,es,2.2,P.mattone,false).fornici(es,-1.1,.8,.5,1,false).fornici(es,.6,.8,.5,1,false);
      B.scatola(4.6,1.6,.3,10.6,0,-7.2,P.mattone).scatola(.3,1.6,14,8.4,0,-.2,P.mattone).scatola(.3,1.6,14,12.8,0,-.2,P.mattone).scatola(4,.1,13.6,10.6,0,-.2,P.prato);   // stadio palatino: giardino a forma di circo, col lato sud curvo
      var cs=RM.ellisse(2.2,1.4,8,0,PI).map(function(p){ return [p[0]+10.6,p[1]+6.8]; }); B.striscia(cs,0,cs,1.6,P.mattone,false);
      B.colonne(9,-6.6,9,6.4,14,.9,.05,.1).colonne(12.2,-6.6,12.2,6.4,14,.9,.05,.1).scatola(.5,.08,13.4,8.75,1,-.1,P.coppi).scatola(.5,.08,13.4,12.45,1,-.1,P.coppi);      // il portico attorno
      B.scatola(1.6,2.2,2.6,13.6,0,-.2,P.mattone).cupola(1.3,13.6,2.2,-.2,P.intonaco,.5);        // la tribuna imperiale, sul lato est
      B.tempio(2.4,3.6,1.8,-11.5,3.4,0,{fronte:6});                                            // tempio di Apollo
    });
    /* Settizodio (203): facciata scenografica a tre ordini di colonne libere, con tre grandi nicchie, verso chi arriva dalla via Appia. Demolito nel 1588-89; forma dai disegni del Cinquecento */
    B.scatola(9,2.9,.5,10.5,-.4,9.2,P.marmo);
    [0,1,2].forEach(function(l){ var yy=-.4+l*.97; B.colonne(6.3,9.95,14.7,9.95,12,.82,.055,yy).scatola(9,.13,.95,10.5,yy+.82,9.62,P.marmo); if(l<2) [-3,0,3].forEach(function(x){ B.vano(10.5+x,yy+.02,9.47,1,0,1.5,.78); }); });
 }},
 {id:'pantheon', nome:'Pantheon', x:-70,z:-68, ry:PI, zone:[[0,0,7],[0,7,6]], et:1, fa:function(B){
    /* La rotonda: tamburo di 56 m di diametro alto circa 31, diviso in tre fasce da cornici; sopra, i gradoni che contengono la spinta e la calotta bassa
       con l'occhio aperto, coperta di tegole di bronzo dorato (fino al 663). Davanti, l'avancorpo e il pronao a otto colonne; a nord la piazza porticata. */
    B.cilindro(2.8,3.05,0,0,0,P.intonaco,null,44);
    [1.22,2.2,3.02].forEach(function(y){ B.cilindro(2.87,.09,0,y,0,P.marmo,null,44); });
    [[2.74,3.11],[2.6,3.25],[2.46,3.39],[2.32,3.53]].forEach(function(g){ B.cilindro(g[0],.14,0,g[1],0,P.oro,null,40); });
    B.cupola(2.2,0,3.67,0,P.oro,.42,.2);
    B.scatola(3.5,3.05,1.25,0,0,3,P.intonaco).falde(1.3,.5,3.5,0,3.05,3,P.bronzo,PI/2,P.intonaco);                                  // avancorpo, più alto del pronao
    B.tempio(3.4,2.2,1.45,0,4.6,0,{fronte:8,podio:.22,tetto:P.bronzo});                                                             // pronao
    B.vano(0,.22,3.66,1,0,.62,1.15);                                                                                                // la grande porta di bronzo
    B.dentro(0,0,9.2,PI,function(B){ portico(B,7,6.2,0,0,0,.9,P.selce); });                                                         // piazza porticata, chiusa sul lato nord
 }},
 {id:'domiziano', nome:'Stadio di Domiziano', x:-101,z:-74, ry:PI/2, lunga:[28,7.5], fa:function(B){ circo(B,27.5,10.6,1.9,false); }},
 {id:'traiano', nome:'Terme di Traiano', x:88,z:5, ry:-.62, zone:[[0,0,23]], fa:function(B){ terme(B,31,32); }},
 {id:'caracalla', nome:'Terme di Caracalla', x:59,z:150, ry:-.78, zone:[[0,0,25]], et:1, fa:function(B){ terme(B,33.7,32.8); }},
 {id:'diocleziano', nome:'Terme di Diocleziano', x:101,z:-122, ry:-.78, zone:[[0,0,27.5]], et:1, fa:function(B){ terme(B,37.6,36); }},
 {id:'massenzio', nome:'Basilica di Massenzio', x:25,z:7, ry:-.35, zone:[[0,0,7.5]], fa:function(B){
    B.scatola(8.2,3.5,2.6,0,0,0,P.mattone); for(var i=-1;i<=1;i++){ B.falde(2.7,.9,2.7,i*2.72,3.5,0,P.bronzo,PI/2,P.mattone);
      [-1,1].forEach(function(k){ B.scatola(2.6,2.4,2,i*2.72,0,k*2.3,P.mattone).volta(2,1.3,i*2.72,2.4,k*2.3,P.intonaco,PI/2); B.vano(i*2.72,.25,k*3.31,1,0,.5,.9).vano(i*2.72-.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72+.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72,1.4,k*3.31,1,0,1.6,1.5); }); }      // ogni campata laterale: tre archi in basso e il grande finestrone sopra
    B.falde(8.2,.9,2.6,0,3.5,0,P.bronzo,0,P.mattone);
    B.aperture(-3.9,1.31,3.9,1.31,3,2.75,.7,1.5).aperture(3.9,-1.31,-3.9,-1.31,3,2.75,.7,1.5);                    // i finestroni della navata, sopra le volte laterali
    B.cilindro(1.25,3.2,-4.15,0,0,P.mattone,null,16).cupola(1.25,-4.15,3.2,0,P.intonaco,.6);                      // l'abside ovest, dove stava il colosso di Costantino
    B.colonne(-1,-3.75,1,-3.75,4,1.5,.09,0).scatola(2.6,.14,.8,0,1.5,-3.7,P.marmo);                               // l'ingresso aggiunto sul fianco, verso la via Sacra
 }},
 {id:'venere', nome:'Tempio di Venere e Roma', x:36,z:18.6, ry:-.3, zone:[[0,0,9.5]], fa:function(B){                            // tempio di Venere e Roma
    B.scatola(15,.7,10,0,0,0,P.travertino).colonne(-7,4.6,7,4.6,22,1.3,.09,.7).colonne(-7,-4.6,7,-4.6,22,1.3,.09,.7);
    B.dentro(0,.7,0,PI/2,function(B){ B.tempio(4.8,10.6,2.6,0,0,0,{fronte:8,lati:16,tetto:P.oro,podio:.4}); });
 }},
 {id:'adriano', nome:'Mausoleo di Adriano', x:-157,z:-118, ry:.1, zone:[[0,0,10]], et:1, fa:function(B){
    B.scatola(8.9,1.5,8.9,0,0,0,P.marmo).scatola(9.05,.12,9.05,0,1.5,0,P.marmo).cilindro(3.2,2.1,0,1.62,0,P.travertino,null,40).cilindro(3.27,.1,0,3.62,0,P.marmo,null,40).cilindro(3,.3,0,3.72,0,P.prato,2.2,24).scatola(1.5,1.7,1.5,0,3.9,0,P.marmo).scatola(1.6,.1,1.6,0,5.6,0,P.marmo);
    B.scatola(.7,.36,.3,0,5.7,0,P.statua).scatola(.12,.5,.12,0,5.9,-.05,P.statua);                               // la quadriga in cima (la ricordano le fonti tarde: forma indicativa)
    B.vano(0,0,4.48,1,0,.7,1.1);                                                                                 // l'ingresso, verso il ponte
    [-4.2,4.2].forEach(function(x){ [-4.2,4.2].forEach(function(z){ B.scatola(.3,.5,.3,x,1.62,z,P.statua); }); }); // gruppi di bronzo agli angoli del basamento
    for(var st=0;st<20;st++) B.scatola(.11,.4,.11,3.05*Math.cos(st*PI/10),3.72,3.05*Math.sin(st*PI/10),P.marmo);  // le statue sull'orlo: nel 537 gli assediati le gettano sui Goti (Procopio)
    for(var k=0;k<14;k++) B.cono(.22,1.2,2.5*Math.cos(k*.449),3.95,2.5*Math.sin(k*.449),P.chioma,6);
 }},
 {id:'augusto', x:-74,z:-151, ry:0, zone:[[0,0,7]], fa:function(B){                             // mausoleo di Augusto
    B.cilindro(4.4,1.2,0,0,0,P.travertino,null,40).cilindro(4,.3,0,1.2,0,P.prato,3.2,24).cilindro(2.6,1.1,0,1.4,0,P.travertino,null,30).cilindro(1,1.5,0,2.5,0,P.marmo,null,16).scatola(.3,.6,.3,0,4,0,P.bronzo);
    for(var k=0;k<18;k++) B.cono(.22,1.2,3.6*Math.cos(k*.349),1.45,3.6*Math.sin(k*.349),P.chioma,6);
    B.vano(0,0,4.42,1,0,.5,.85);                                                                                 // l'ingresso, a sud
    [-.9,.9].forEach(function(x){ B.scatola(.22,.2,.22,x,0,5.1,P.marmo).cilindro(.09,1.4,x,.2,5.1,P.sabbia,.06,4).cono(.065,.14,x,1.6,5.1,P.sabbia,4); });      // i due obelischi ai lati dell'ingresso
 }},
 {id:'pompeo', x:-98,z:-30, ry:-PI/2, zone:[[0,0,10],[0,-14,10]], fa:function(B){ teatro(B,8,2.6); B.tempio(2,2.6,1.4,0,6.6,PI,{fronte:6}); portico(B,13,18,0,0,-11.5,1.1,P.prato); }},   // teatro e portici di Pompeo
 {id:'marcello', nome:'Teatro di Marcello', x:-46,z:7, ry:PI*.8, zone:[[0,0,8]], fa:function(B){ teatro(B,6.5,2.9); }},
 {id:'laterano', nome:'San Giovanni in Laterano', x:169,z:73, ry:.1, zone:[[0,0,8],[8,0,6],[-11.3,-3.5,2.6]], fa:function(B){ chiesa(B,10,6); B.cilindro(1.2,1.6,-11.3,0,-3.5,P.mattone,null,8).cono(1.3,.7,-11.3,1.6,-3.5,P.coppi,8); }},      // il battistero ottagonale, dov'è oggi (OpenStreetMap): dietro l'abside, verso nord
 {id:'pietro', nome:'San Pietro', x:-259,z:-108, ry:0, zone:[[0,0,9],[10,0,7]], et:1, fa:function(B){
    chiesa(B,11.5,6.6,true);
    B.scatola(5.4,.07,7.2,13.7,0,0,P.selce).scatola(5.4,.1,.5,13.7,0,3.4,P.travertino).scatola(5.4,.1,.5,13.7,0,-3.4,P.travertino);      // il sagrato lastricato davanti all'atrio, dove si raccolgono i pellegrini
    B.scatola(.5,.3,.5,3.6,0,6.6,P.travertino).cilindro(.2,2.4,3.6,.3,6.6,P.sabbia,.12,4).cono(.13,.25,3.6,2.7,6.6,P.sabbia,4);      // l'obelisco del circo di Nerone, sul fianco sud
 }},
 /* ---- costruiti durante la storia, in ordine di data ---- */
 {id:'sole', nome:'Tempio del Sole', x:-30,z:-106, ry:.16, zone:[[0,0,9]], fa:function(B){
    portico(B,8,13,0,0,0,1.2); B.cilindro(1.9,.3,0,.1,-1.5,P.travertino,null,24).cilindro(1.5,1.7,0,.4,-1.5,P.marmo,null,24).cupola(1.5,0,2.1,-1.5,P.bronzo,.6);
    for(var k=0;k<14;k++) B.cilindro(.08,1.5,1.8*Math.cos(k*.449),.4,-1.5+1.8*Math.sin(k*.449),P.marmo,.07,7);
 }},
 {id:'arcocostantino', nome:'Arco di Costantino', x:44.5,z:30.4, ry:-.3, zone:[[0,0,3]], fa:function(B){
    B.scatola(2.6,1.5,.75,0,0,0,P.marmo).scatola(2.72,.14,.87,0,1.5,0,P.marmo).scatola(2.6,.5,.75,0,1.64,0,P.marmo);          // fornici, cornice, attico
    B.aperture(-.33,.38,.33,.38,1,0,1.15,.62).aperture(-1.05,.38,-.55,.38,1,0,.72,.34).aperture(.55,.38,1.05,.38,1,0,.72,.34);
    B.aperture(.33,-.38,-.33,-.38,1,0,1.15,.62).aperture(-.55,-.38,-1.05,-.38,1,0,.72,.34).aperture(1.05,-.38,.55,-.38,1,0,.72,.34);
    B.colonne(-1.2,.47,1.2,.47,4,1.3,.07,.1,P.sabbia).colonne(-1.2,-.47,1.2,-.47,4,1.3,.07,.1,P.sabbia);                    // colonne di giallo antico
 }},
 {id:'termecostantino', nome:'Terme di Costantino', x:13,z:-67, ry:-.2, sc:.45, zone:[[0,0,9]], fa:function(B){ terme(B,33,32); }},
 {id:'croce', nome:'Santa Croce in Gerusalemme', x:253.3,z:47.6, ry:2.72, sc:.7, zone:[[0,0,7]], fa:function(B){ chiesa(B,9,6); }},
 {id:'lorenzo', nome:'San Lorenzo fuori le mura', x:299.5,z:-111.6, ry:.35, sc:.7, zone:[[0,0,8]], fa:function(B){ chiesa(B,10,6); }},
 {id:'agnese', nome:"Sant'Agnese e Santa Costanza", x:278.3,z:-338.2, ry:-.8, sc:.7, zone:[[0,0,7],[-6.1,11.5,4.5]], fa:function(B){
    chiesa(B,10,6); B.cilindro(2.4,1,-8.75,0,16.4,P.mattone,null,24).cono(2.5,.4,-8.75,1,16.4,P.coppi,24).cilindro(1.5,2,-8.75,0,16.4,P.mattone,null,20).cupola(1.5,-8.75,2,16.4,P.coppi,.6);   // mausoleo rotondo di Costanza, 130 m a ovest della basilica (posizione reale)
 }},
 {id:'paolo', nome:'San Paolo fuori le mura', x:-70.1,z:375.7, ry:2.98, zone:[[0,0,10],[8,0,7]], et:1, fa:function(B){ chiesa(B,12.5,6.6,true); }},
 {id:'sabina', nome:'Santa Sabina', x:-46,z:89, ry:.785, sc:.62, zone:[[0,0,6]], fa:function(B){ chiesa(B,10,6); }},
 {id:'mariamaggiore', nome:'Santa Maria Maggiore', x:109,z:-57, ry:-.5, sc:.82, zone:[[0,0,8]], fa:function(B){ chiesa(B,10,6); }},
 {id:'stefano', nome:'Santo Stefano Rotondo', x:94.5,z:88, ry:0, zone:[[0,0,5.5]], fa:function(B){
    B.cilindro(3.2,.9,0,0,0,P.mattone,null,32).cono(3.3,.5,0,.9,0,P.coppi,32).cilindro(2.1,1.6,0,0,0,P.mattone,null,28).cono(2.2,.5,0,1.6,0,P.coppi,28)
     .cilindro(1.1,2.6,0,0,0,P.mattone,null,22).cono(1.2,.6,0,2.6,0,P.coppi,22);
    for(var k=0;k<22;k++) B.scatola(.12,.3,.06,1.12*Math.cos(k*.2856),2.1,1.12*Math.sin(k*.2856),P.ombra,-k*.2856+PI/2);
 }},
 {id:'cosma', nome:'Santi Cosma e Damiano', x:16.5,z:4, ry:-.35, come:'fori', fa:function(B){
    B.scatola(2.2,2,3.6,0,0,0,P.mattone).falde(3.6,.6,2.4,0,2,0,P.coppi,PI/2,P.mattone).cilindro(.9,1.4,0,0,2.6,P.mattone,null,16).cupola(.9,0,1.4,2.6,P.bronzo,.6);
 }},
 {id:'foca', nome:'Colonna di Foca', x:-3.7,z:.6, ry:-.35, come:'fori', fa:function(B){
    B.scatola(1.1,.22,1.1,0,0,0,P.mattone).scatola(.7,.28,.7,0,.22,0,P.marmo).cilindro(.13,1.36,0,.5,0,P.marmo,.11,10).scatola(.3,.1,.3,0,1.86,0,P.marmo).scatola(.12,.3,.12,0,1.96,0,P.bronzo);
 }},
 /* ---- il quartiere di San Pietro: cresce mentre la città antica si svuota ---- */
 {id:'monasteripietro', nome:'Monasteri di San Pietro', x:-261,z:-108, ry:0, zone:[[0,0,14],[-15,4,5]], fa:function(B){
    var y=suTerreno(-261,-108,0);
    [[-2.2,6.6],[2.5,6.6]].forEach(function(p){ var q=y(p[0],p[1]); B.cilindro(1.3,1.9,p[0],q-.3,p[1],P.mattone,null,18).cono(1.4,.5,p[0],q+1.6,p[1],P.coppi,18); });   // da ovest: mausoleo di Onorio (poi Santa Petronilla) e rotonda di Sant'Andrea
    casa(B,y(-3,-9.5),-3,-9.5,4.6,2.8,1.5);                 // Santi Giovanni e Paolo, a nord del transetto (Leone I)
    casa(B,y(-8,2.6),-8,2.6,2.6,3,1.4);                     // San Martino, addossato all'abside a sud-ovest
    casa(B,y(-15.5,4),-15.5,4,4,3,1.5);                     // Santo Stefano Maggiore, dietro l'abside
 }},
 {id:'porticopietro', nome:'Portico dei pellegrini', x:-213.5,z:-107, ry:.0597, lunga:[67,2.2], fa:function(B){          // dall'ansa del Tevere, passato il mausoleo, ai gradini dell'atrio
    var y=suTerreno(-213.5,-107,.0597), q;
    for(var k=0;k<9;k++){ var lx=(k-4)*7.46; q=y(lx,0);
      B.scatola(7.56,.12,1.5,lx,q+1.05,0,P.coppi).colonne(lx-3.6,-.6,lx+3.6,-.6,8,1.35,.06,q-.3).colonne(lx-3.6,.6,lx+3.6,.6,8,1.35,.06,q-.3); }
    [[-34.5,-10],[-34.5,3.5]].forEach(function(p){ casa(B,y(p[0],p[1]),p[0],p[1],2.6,3.4,1.3); });      // gli episcopia di papa Simmaco, a destra e a sinistra dell'atrio
 }},
 {id:'scholae', nome:'Scholae dei pellegrini', x:-233,z:-108, ry:0, zone:[[33.5,12.5,5],[14,9,5],[-8,17,5],[-12,-11,5],[-32,12.5,4]], fa:function(B){
    var y=suTerreno(-233,-108,0), q;
    [[33.5,12.5],[14,9],[-8,17],[-12,-11]].forEach(function(p){       // Sassoni e Frisoni sui siti di Santo Spirito in Sassia e dei Santi Michele e Magno (OpenStreetMap)                                  // Sassoni (verso il fiume), Frisoni, Franchi (a sud dell'atrio), Longobardi (a nord: posizione discussa)
      q=y(p[0],p[1]); casa(B,q,p[0]-1.2,p[1],3.6,2.4,1.2); casa(B,q,p[0]+1.4,p[1]+2,1.6,3,1,PI/2);
      B.scatola(1.3,1.8,2.6,p[0]+2.6,q-.3,p[1]-1.6,P.mattone).falde(2.6,.4,1.5,p[0]+2.6,q+1.5,p[1]-1.6,P.coppi,PI/2,P.mattone).cilindro(.5,1.4,p[0]+2.6,q-.3,p[1]-3,P.mattone,null,10);
    });
    casa(B,y(-32,12.5),-32,12.5,3.2,2.6,1.4);                                                 // Santo Stefano Minore, a sud presso le rotonde (seconda metà dell'VIII secolo)
    q=y(-14.6,-2.6); B.scatola(.9,3.4,.9,-14.6,q-.3,-2.6,P.mattone).cono(.75,.6,-14.6,q+3.1,-2.6,P.coppi,4);     // torre campanaria di Stefano II, nel fronte dell'atrio a nord dell'ingresso
 }},
 {id:'mulini', nome:'Mulini sul Tevere', x:-92,z:18, ry:-.37, fa:function(B){                 // tre zattere ancorate nella corrente a valle di ponte Aurelio
    [-7,0,7].forEach(function(lx){ var y=.72;
      B.scatola(2,.26,.45,lx,y,-.62,P.tronco).scatola(2,.26,.45,lx,y,.62,P.tronco);
      B.geo(new THREE.CylinderGeometry(.62,.62,.3,12).rotateX(PI/2).translate(lx-.2,y+.3,0),P.tronco);
      B.scatola(.9,.6,.5,lx+.5,y+.26,-.62,P.intonaco).falde(1,.25,.6,lx+.5,y+.86,-.62,P.coppi,0,P.intonaco);
    });
 }},
 {id:'casenerva', nome:'Case nel foro di Nerva', x:10.7,z:-8.9, ry:.672, come:'fori', fa:function(B){
    casa(B,.1,-2.2,.2,3.4,2.2,1.7); B.aperture(-3.6,1.33,-.8,1.33,4,.1,.75,.4);        // domus a due piani con portico ad arcate
    casa(B,.1,2.6,-.1,2.6,2,1.4);
 }},
 /* Teatro e Crypta di Balbo. Posizioni reali (OpenStreetMap): l'isolato del museo fra via Caetani, via delle Botteghe Oscure, via dei Polacchi e via dei Delfini è la crypta;
    la cavea (95 m di diametro) sta a ovest, sotto palazzo Mattei. Misure del portico e forma dell'esedra sono indicative. */
 {id:'balbo', nome:'Teatro e Crypta di Balbo', x:-57.7,z:-21.5, ry:-PI/2, zone:[[0,2.4,5.6],[0,-5.6,6.8]], et:1, fa:function(B){
    teatro(B,4.75,2);                                                                              // cavea verso ovest, scena lungo l'odierna via Caetani
    portico(B,9,8.4,0,0,-5.6,.9);                                                                  // la crypta: cortile porticato dietro la scena
    var es=RM.ellisse(1.1,1.1,12,PI,2*PI).map(function(p){ return [p[0],p[1]-9.8]; });             // l'esedra sul lato est: tombe nel VI secolo, scarico nel VII, calcara nell'VIII
    B.striscia(es,0,es,1.5,P.mattone,false).fornici(es,.2,.8,.5,1,false);
 }},
 /* Emporio. La Porticus Aemilia è posta sul muro superstite fra via Rubattino e via Florio (OpenStreetMap, relazione 17192321), che ne dà l'orientamento, e va da via Marmorata
    a via Franklin: 487 x 60 m, cinquanta navate a gradoni verso il fiume (ricostruzione di G. Gatti sulla Forma Urbis). Che il muro sia al centro dell'edificio è una nostra scelta.
    I magazzini di Galba (circa 200 x 155 m, tre cortili) sono dietro, verso il Testaccio: la posizione è indicativa, la pianta è schematica. Banchine lungo la riva reale. */
 {id:'emporio', nome:'Emporio e Porticus Aemilia', x:-89.6,z:133, ry:.764, lunga:[48.7,4.2], zone:[[-15,13,8.6],[-5,13,8.6]], et:1, fa:function(B){
    var n=50, w=48.7/n, r=w/2-.04, j, k, i;
    for(j=0;j<4;j++){ var z0=-3+j*1.5, hh=.62+j*.17, arco=[];
      for(i=0;i<=5;i++) arco.push([r*Math.cos(PI*i/5), hh+r*Math.sin(PI*i/5)]);
      B.scatola(48.7,hh,1.5,0,0,z0+.75,P.tufo);
      for(k=0;k<n;k++){ var cx=-24.35+(k+.5)*w;
        for(i=0;i<5;i++){
          B.quad([cx+arco[i][0],arco[i][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0+1.5],[cx+arco[i][0],arco[i][1],z0+1.5],P.intonaco);
          B.tri([cx,hh,z0],[cx+arco[i][0],arco[i][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0],j?P.tufo:P.ombra);                              // testata della volta: aperta verso il fiume
          if(j===3) B.tri([cx,hh,z0+1.5],[cx+arco[i][0],arco[i][1],z0+1.5],[cx+arco[i+1][0],arco[i+1][1],z0+1.5],P.tufo);
        }
      }
    }
    B.aperture(24.35,-3,-24.35,-3,n,.05,.5);
    for(k=0;k<4;k++){ var ax=-19.1+k*6.07; B.scatola(1.8,.95,15.5,ax,0,13,P.mattone).falde(15.6,.4,1.9,ax,.95,13,P.coppi,PI/2,P.mattone); }     // magazzini di Galba: quattro ali di celle, tre cortili
    [-1,1].forEach(function(q){ B.scatola(20,.95,1.8,-10,0,13+q*6.85,P.mattone).falde(20.1,.4,1.9,-10,.95,13+q*6.85,P.coppi,0,P.mattone); });
    B.scatola(47,1.5,1,0,-1.75,-13.7,P.travertino);                                                                                         // muro di banchina
    for(k=-4;k<=4;k++) B.scatola(1.8,1.15,1.2,k*5.2,-1.75,-14.6,P.travertino);                                                             // scale e rampe verso l'acqua
 }},
 {id:'testaccio', nome:'Monte Testaccio', x:-84,z:184, ry:0, zone:[[4,-10,6],[0,-3,10.5],[1,5,11],[4,11,6]], et:1, fa:function(B){       // collina di cocci d'anfora: 35 m sul piano, qui 1,8 volte tanto come gli altri rilievi
    var H=6.3, giri=[[1,-.15],[.86,.42*H],[.72,.78*H],[.6,.95*H],[.45,H]], k, a, b;
    function giro(s){ return TESTACCIO.map(function(p){ return [p[0]*s,p[1]*s]; }); }
    for(k=0;k<giri.length-1;k++){ a=giri[k]; b=giri[k+1]; B.striscia(giro(a[0]),a[1],giro(b[0]),b[1],P.cocci); }
    B.striscia(giro(.45),H,TESTACCIO.map(function(){ return [0,0]; }),H+.12,P.cocci);
 }},
 {id:'leonine', nome:'Mura leonine', x:-215,z:-92, ry:0, zone:LEO.zone, fa:function(B){
    var y=suTerreno(-215,-92,0);
    LEO.passi.forEach(function(p,j){ var q=y(p.x,p.z); B.scatola(p.len+.15,1.35,.45,p.x,q-.3,p.z,P.tufo,p.ang); if(j%4===0) B.scatola(1,2.1,1,p.x,q-.3,p.z,P.tufo,p.ang).scatola(1.15,.12,1.15,p.x,q+1.8,p.z,P.mattone,p.ang); });
 }}
];

/* ---------- messa in scena ---------- */
var riquadro=document.getElementById('scena').parentNode;
var etichette=document.createElement('div'); etichette.className='etichette3d'; riquadro.appendChild(etichette);
function globale(o,lx,lz){ var c=Math.cos(o.ry||0), s=Math.sin(o.ry||0); return [o.x+lx*c+lz*s, o.z-lx*s+lz*c]; }
/* prima le zone: sotto ogni monumento il terreno si spiana alla quota del suo centro; poi si posa il suolo */
var PENDIO={monasteripietro:1,porticopietro:1,scholae:1,leonine:1,mulini:1};        // complessi che seguono il pendio: niente terrazza
M.forEach(function(o){
  var h=PENDIO[o.id]?null:RM.hGrezza(o.x,o.z)-.05; o.quota=h;
  var st=D.MONUMENTI&&D.MONUMENTI[o.id], dal=st&&st[0][1]==='assente'&&st.length>1?st[1][0]-8:0;      // monumento non ancora costruito: fino all'apertura del cantiere (otto anni prima) sul sito ci sono case (js/citta.js)
  (o.zone||[]).forEach(function(q){ var p=globale(o,q[0],q[1]); RM.zone.push({x:p[0],z:p[1],r:q[2],h:h,dal:dal}); });
  if(o.lunga){ var n=Math.ceil(o.lunga[0]/o.lunga[1]); for(var i=0;i<n;i++){ var p=globale(o,((i+.5)/n-.5)*o.lunga[0],0); RM.zone.push({x:p[0],z:p[1],r:o.lunga[1],h:h}); } }
});
RM.posa();
var perId={};
M.forEach(function(o){
  var B=new RM.Costruttore(); o.fa(B); perId[o.id]=o;
  o.g=B.maglia(RM.matPietra()); if(o.sc) o.g.geometry.scale(o.sc,o.sc,o.sc); o.g.geometry.computeBoundingBox();
  var bb=o.g.geometry.boundingBox; o.raggio=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2; o.alto=bb.max.y;
  o.mat=o.g.material=RM.matRovina(o.g.geometry.boundingBox.max.y); o.g.customDepthMaterial=o.mat.userData.ombra;
  o.certezza=((D.CERTEZZA||{})[o.id]||['C'])[0]; o.mat.userData.u.uSapCol.value.copy(RM.sapere.COL[o.certezza]);      // «che cosa sappiamo davvero»
  o.g.position.set(o.x,o.quota!=null?o.quota-.05:quota(o.x,o.z),o.z); o.g.rotation.y=o.ry||0;
  if(o.come) o.g.position.y=perId[o.come].g.position.y;                       // poggia sullo stesso piano del complesso vicino
  RM.scene.add(o.g);
  if(o.nome){ o.div=document.createElement('span'); o.div.textContent=o.nome; etichette.appendChild(o.div); o.div.addEventListener('click',function(){ if(RM.apriScheda) RM.apriScheda(o.id); }); }
});
RM.MONUMENTI=M.filter(function(o){ return o.nome; }).concat([{id:'mura', nome:'Mura Aureliane', x:106,z:-203, raggio:28, alto:2}, {id:'acquedotti', nome:'Acquedotti', note:{chiuso:'tagliati nel 537'}, x:249,z:12, raggio:30, alto:3},
  {id:'antoniniano', nome:'Acquedotto Antoniniano', note:{chiuso:'tagliato nel 537'}, x:120,z:200, raggio:26, alto:2}]);

/* stato in un dato anno: {s0, s1, t}, con t che sfuma nei sei anni prima del cambio. Le comparse decadono verso il 500. */
var COMPARSA=[[0,'uso'],[500,'chiuso']];
RM.statoMonumento=function(id,anno){
  var st=D.MONUMENTI[id]||COMPARSA, i=0, k;
  for(k=0;k<st.length;k++) if(anno>=st[k][0]) i=k;
  var s0=anno<st[0][0]?'assente':st[i][1], prossimo=st[i+1];
  var brusco=prossimo&&(prossimo[1]==='bruciato'||prossimo[1]==='spogliato'||prossimo[1]==='crollato');
  return {s0:s0, s1:prossimo?prossimo[1]:s0, t:prossimo?RM.sfuma(prossimo[0]-(brusco?.4:6),prossimo[0],anno):0};
};
/* Degrado in due tempi.
   c = incuria: dal 390 circa la manutenzione pubblica si dirada per tutti, e accelera dopo la chiusura. Si vede come crepe, colature, erba, coppi mancanti.
   r = crolli veri e propri: pochi, e solo decenni dopo la chiusura; alla fine del VI secolo i grandi edifici sono ancora in piedi.
   Le basiliche cristiane sono tenute in ordine; il mausoleo di Adriano, ormai fortezza, quasi. */
var CURA={laterano:0, pietro:0, croce:0, lorenzo:0, agnese:0, paolo:0, sabina:0, mariamaggiore:0, stefano:0, cosma:0, monasteripietro:0, porticopietro:0, scholae:0, leonine:0, mulini:0, casenerva:0, foca:.4, adriano:.35, arcocostantino:.5, arcotito:.5, testaccio:.5, colosso:0};
RM.rovina=function(id,anno){
  var st=D.MONUMENTI[id]||COMPARSA, da=null, spoglio=0, fuoco=0, crollo=0, scavo=0, rinato=false, k, cura=CURA[id]==null?1:CURA[id], q, y;
  for(k=0;k<st.length;k++){
    q=st[k][1]; y=st[k][0];
    if(q==='uso'){ if(k>0 && st[k-1][1]!=='assente' && anno>=y){ da=null; spoglio=0; fuoco=0; crollo=0; scavo=0; rinato=true; } continue; }   // riaperto e restaurato (il Pantheon chiesa, gli acquedotti)
    if(anno>=y-3 && (q==='chiuso'||q==='spogliato'||q==='bruciato') && da==null) da=y;
    if(q==='spogliato'||q==='bruciato') spoglio=Math.max(spoglio,RM.sfuma(y-.4,y+.3,anno));
    if(q==='bruciato') fuoco=RM.sfuma(y-.4,y+.3,anno);       // un incendio porta via subito il tetto e parte dei muri
    if(q==='crollato') crollo=RM.sfuma(y-.4,y+.1,anno);      // terremoto: cede il tetto
    if(q==='cava'){ if(anno>=y-3 && da==null) da=y; scavo=RM.sfuma(y,y+200,anno); spoglio=Math.max(spoglio,.6*RM.sfuma(y,y+40,anno)); }   // smontato poco a poco, dall'alto: prima le coperture e i rivestimenti
  }
  var chiuso=da==null?0:RM.sfuma(0,70,anno-da), eta=da==null?0:anno-da;
  return {r:(da==null?0:RM.sfuma(-3,6,eta)*.03+.15*RM.sfuma(10,110,eta)+.04*RM.sfuma(110,320,eta))+.07*spoglio+.2*fuoco+.07*crollo+.1*scavo, s:spoglio,
          c:Math.min(1,Math.max(.9*crollo,cura*(rinato?.35:1)*(.62*RM.sfuma(390,570,anno)+.45*chiuso+.2*spoglio+.5*fuoco+.3*scavo)))};
};
RM.TINTA=TINTA;
RM.moduli.push(function(anno){
  M.forEach(function(o){
    var q=RM.statoMonumento(o.id,anno), p=(q.s0==='assente'?0:1)*(1-q.t)+(q.s1==='assente'?0:1)*q.t;
    o.mat.color.copy(TINTA[q.s0]).lerp(TINTA[q.s1],q.t);
    o.presenza=p; o.g.visible=p>.01; o.g.scale.y=Math.max(p,.001);
    var rv=RM.rovina(o.id,anno); o.mat.userData.u.uRovina.value=rv.r; o.mat.userData.u.uSpoglio.value=rv.s; o.mat.userData.u.uCrepe.value=rv.c;
    if(o.id==='colosseo'){ var us=o.mat.userData.u; us.uSudDir.value.set(-Math.sin(o.ry),Math.cos(o.ry)); us.uSudR.value.set(9.4,7.8);
      us.uSud.value=.2*RM.sfuma(523,800,anno)+.3*RM.sfuma(846.6,847,anno); us.uRovina.value*=.4; }      // il fronte sud: cava dal VI secolo; nell'847, secondo il Parco del Colosseo, cade quel che ne resta
  });
});

/* ---------- travertini ai piedi del Colosseo ----------
   Dal VI secolo il fronte sud è un cantiere di smontaggio: pochi blocchi a terra in attesa d'essere portati via.
   Nell'847, se si segue il Parco del Colosseo, cade quel che ne restava: il cumulo che per secoli farà da cava (la «coxa Colisei» dei documenti medievali).
   Forma e quantità dei blocchi sono di fantasia. */
(function(){
  var o=M.filter(function(m){ return m.id==='colosseo'; })[0]; if(!o) return;
  var rnd=RM.casuale(847), N=90, sx=-Math.sin(o.ry), sz=Math.cos(o.ry), blocchi=[], d=new THREE.Object3D(), i;
  for(i=0;i<N;i++){
    var a=(rnd()-.5)*1.5, fuori=(i<14?1.03:.9)+.26*rnd()*rnd(), lx=Math.sin(a)*9.4*fuori, lz=Math.cos(a)*7.8*fuori;        // un arco attorno al punto più a sud, appena fuori dall'ellisse
    blocchi.push({x:o.x+lx*sz+lz*sx, z:o.z-lx*sx+lz*sz, w:.25+.4*rnd(), h:.18+.28*rnd(), p:.22+.3*rnd(), ry:rnd()*3.14, rx:(rnd()-.5)*.5, su:i>=14&&fuori<1.02?rnd()*.6:0, quando:i<14?0:1});
  }
  var m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),RM.tingi(new THREE.MeshStandardMaterial({color:RM.col(0xcbc1aa),roughness:.95}),'C'),N);
  m.castShadow=m.receiveShadow=true; m.frustumCulled=false; RM.scene.add(m);
  var ultimo=-1;
  RM.moduli.push(function(anno){
    var cava=RM.sfuma(523,560,anno), crollo=RM.sfuma(846.6,847.2,anno), chiave=cava+2*crollo; if(Math.abs(chiave-ultimo)<.004) return; ultimo=chiave;
    blocchi.forEach(function(b,j){
      var q=b.quando?crollo:Math.max(cava,crollo);
      d.position.set(b.x,RM.h(b.x,b.z)-.05+b.su*q,b.z); d.rotation.set(b.rx,b.ry,0); d.scale.set(b.w*q,b.h*q,b.p*q); d.updateMatrix(); m.setMatrixAt(j,d.matrix);
    });
    m.instanceMatrix.needsUpdate=true; m.visible=chiave>.01;
  });
})();

/* ---------- clic o tocco sulla scena: si apre la scheda del monumento colpito ----------
   Vale per tutti i monumenti che hanno un nome, non solo per quelli con l'etichetta; mura e acquedotti si registrano in RM.cliccabili (js/mura.js). */
(function(){
  var tela=RM.renderer.domElement, giu=null, raggio=new THREE.Raycaster(), punto=new THREE.Vector2();
  function colpito(ev){
    var r=tela.getBoundingClientRect(); punto.set((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height*2-1)); raggio.setFromCamera(punto,RM.camera);
    var bersagli=[], di=[];
    M.forEach(function(o){ if(o.nome && o.g.visible && o.presenza>.5){ bersagli.push(o.g); di.push(o.id); } });
    (RM.cliccabili||[]).forEach(function(c){ if(c.maglia.visible){ bersagli.push(c.maglia); di.push(c.id); } });
    var colpi=raggio.intersectObjects(bersagli,false); if(!colpi.length) return null;
    var id=di[bersagli.indexOf(colpi[0].object)]; return typeof id==='function'?id(colpi[0]):id;
  }
  tela.addEventListener('pointerdown',function(ev){ giu={x:ev.clientX,y:ev.clientY,t:performance.now()}; });
  tela.addEventListener('pointerup',function(ev){
    var fermo=giu && Math.hypot(ev.clientX-giu.x,ev.clientY-giu.y)<8 && performance.now()-giu.t<600; giu=null;
    if(!fermo) return;                                                       // era un trascinamento: si stava girando la scena
    if(RM.toccoApre && RM.toccoApre()) return;                               // sui telefoni, fuori dallo schermo intero, il tocco apre la scena (js/pagina.js)
    var id=colpito(ev); if(id && RM.apriScheda) RM.apriScheda(id);
  });
  var ultimoMov=0;
  tela.addEventListener('pointermove',function(ev){                         // col mouse, il cursore dice dove si può cliccare
    if(ev.pointerType!=='mouse' || ev.buttons || performance.now()-ultimoMov<120) return; ultimoMov=performance.now();
    tela.style.cursor=colpito(ev)?'pointer':'';
  });
})();

/* ---------- etichette proiettate ---------- */
var v=new THREE.Vector3();
RM.frame.push(function(){
  var w=riquadro.clientWidth, h=riquadro.clientHeight;
  M.forEach(function(o){
    if(!o.div) return;
    v.set(o.x,o.g.position.y+7,o.z).applyMatrix4(RM.camera.matrixWorldInverse); var davanti=v.z<-2;      // dietro la camera non si proietta
    v.set(o.x,o.g.position.y+7,o.z).project(RM.camera);
    var vis=o.presenza>.5 && davanti && v.z<1 && Math.abs(v.x)<.8 && v.y>-.9 && v.y<.88 && !(v.y>.3 && v.x<-.1) && (o.et || Math.hypot(RM.camera.position.x-o.x,RM.camera.position.y,RM.camera.position.z-o.z)<(o.raggio>6?150:95));   // non sui bordi né sopra il contatore; i monumenti minori hanno il nome solo da vicino
    o.div.style.opacity=vis?1:0; o.div.style.visibility=vis?'visible':'hidden';
    if(vis) o.div.style.transform='translate(-50%,-100%) translate('+((v.x+1)*w/2).toFixed(1)+'px,'+((1-v.y)*h/2).toFixed(1)+'px)';
  });
});
})();
