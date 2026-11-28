/* Monumenti: restano della stessa grandezza per tutta la storia, cambia solo il loro stato.
   La storia di quelli in elenco (uso | chiuso | abbandonato | spogliato | assente) sta in dati.js; gli altri sono comparse.
   Ogni monumento è una sola maglia costruita in coordinate locali (fronte verso +z, salvo rotazione). */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI;
/* i mulini sulle barche (si veda 'mulini' più sotto): dove stanno le coppie lungo la corrente, lo scafo e le funi */
var MULINI_X=[-6,-3.4,-.8,1.8,4.4];      // il centro di ogni coppia, in unità lungo il fiume (verso valle: +x); a 26 m l'una dall'altra, SCHEMA
function scafoMulino(L,W,H,Dk){      // scafo aperto, a sezioni a U che si stringono ai capi; l'orlo a H sopra l'acqua, la chiglia a Dk sotto (y=0 il pelo dell'acqua)
  var pos=[], idx=[], NS=10, PR=[[-1,1],[-.97,.45],[-.62,0],[.62,0],[.97,.45],[1,1]], k, j;
  for(k=0;k<=NS;k++){ var t=k/NS*2-1, w=W/2*Math.sqrt(Math.max(.06,1-Math.pow(Math.abs(t),3))), rim=H+.04*Math.pow(Math.abs(t),3), kl=-Dk*(1-.6*Math.pow(Math.abs(t),4));
    PR.forEach(function(q){ pos.push(t*L/2, kl+(rim-kl)*q[1], q[0]*w); }); }
  for(k=0;k<NS;k++) for(j=0;j<PR.length-1;j++){ var a=k*PR.length+j, b=a+PR.length; idx.push(a,b,a+1, a+1,b,b+1); }
  [0,NS].forEach(function(k){ var o=k*PR.length; for(j=1;j<PR.length-1;j++) idx.push(o,o+j,o+j+1); });      // le due testate
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
function funeMulino(B,a,b,r,col){      // una fune da a a b, un poco lenta: due tratti col mezzo più basso
  var m=[(a[0]+b[0])/2,(a[1]+b[1])/2-.015*Math.hypot(b[0]-a[0],b[2]-a[2]),(a[2]+b[2])/2];
  [[a,m],[m,b]].forEach(function(s){ var p=new THREE.Vector3(s[0][0],s[0][1],s[0][2]), q=new THREE.Vector3(s[1][0],s[1][1],s[1][2]), d=q.clone().sub(p), l=d.length(); if(l<1e-4) return;
    var g=new THREE.CylinderGeometry(r,r,l,4); g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())));
    g.translate((p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2); B.geo(g,col); }); }
var TINTA={ uso:new THREE.Color(1,1,1), chiuso:RM.col(0xb5ad9e), abbandonato:RM.col(0xb2ae98), spogliato:RM.col(0x8c7e70), bruciato:RM.col(0x6f655c), crollato:RM.col(0xa69d90), cava:RM.col(0xa39584), assente:new THREE.Color(1,1,1) };

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
/* Piazza porticata. Rifatta il 24 novembre 2026: prima le colonne stavano a 9,5 m l'una dall'altra, senza base né trabeazione, sotto una lastra di coppi piatta,
   e da media distanza il portico era una fila di stecchi staccati dal tetto. Ora, con le proporzioni di Vitruvio (non misure lette per i singoli portici):
   colonna alta dieci diametri (il corinzio romano), intercolumnio di due diametri e un quarto, l'«eustilo» (III 3, 6), quindi un interasse di 3,25 diametri;
   la trabeazione è poco più di un quinto dell'altezza delle colonne (proporzione corrente, non letta); il tetto è a una falda, dalla cima del muro di fondo all'architrave, come nei portici veri, con la pendenza bassa
   dei tetti di coppi (circa 17°). La cima dell'architrave sta dove prima stava la lastra; i muri sono un metro più bassi (prima sporgevano sopra il tetto e gettavano
   sulla falda un'ombra radente a dente di sega). Il lato senza muro (+z) ha una seconda fila di colonne verso l'esterno, su cui poggia la falda: è uno schema. */
function portico(B,w,d,x,y,z,h,suolo){
  var m=.65, a=y+.1, he=h*.18, hc=h-he, r=hc/20, ia=r*6.5, X0=x-w/2+m, X1=x+w/2-m, Z0=z-d/2+m, Z1=z+d/2-m, ya=a+h, yo=a+h+.17, k;
  function quante(L){ return Math.max(3,Math.round(L/ia)+1); }
  var nx=quante(X1-X0), nz=quante(Z1-Z0), sz=(Z1-Z0)/(nz-1);
  B.scatola(w,.1,d,x,y,z,suolo||P.selce);
  var xe0=x-w/2+r*1.4, xe1=x+w/2-r*1.4, ze=z+d/2-r*1.4, nE=quante(xe1-xe0), id=[];      // la fila esterna sul lato aperto
  B.colonne(X0,Z0,X1,Z0,nx,hc,r,a); id[0]=B.ultimaFila; B.colonne(X0,Z1,X1,Z1,nx,hc,r,a); id[1]=B.ultimaFila;
  B.colonne(X0,Z0+sz,X0,Z1-sz,nz-2,hc,r,a); id[2]=B.ultimaFila; B.colonne(X1,Z0+sz,X1,Z1-sz,nz-2,hc,r,a); id[3]=B.ultimaFila;
  B.colonne(xe0,ze,xe1,ze,nE,yo-he-a,r,a); id[4]=B.ultimaFila;
  /* Architrave e tetto sono fatti a pezzi, uno per colonna (da mezzo interasse prima a mezzo dopo), e ogni pezzo porta il numero della sua colonna:
     in rovina, dove la colonna manca cadono anche l'architrave e il tetto sopra di lei (si veda «Colonne che mancano» in js/costruttore.js) */
  function num(f,i){ return id[f]?id[f]+i+1:0; }
  var LATI=[[nx,function(q){ return num(0,q); }],[nz,function(q){ return q===0?num(0,nx-1):q===nz-1?num(1,nx-1):num(3,q-1); }],
    [nx,function(q){ return num(1,nx-1-q); }],[nz,function(q){ return q===0?num(1,0):q===nz-1?num(0,0):num(2,nz-2-q); }]];
  var C4=[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]], t=r*2.7, ht=ya-a-hc, g=r*2.2, O=[[x-w/2,yo,z-d/2],[x+w/2,yo,z-d/2],[x+w/2,yo,z+d/2],[x-w/2,yo,z+d/2]], I=[[X0+g,ya,Z0+g],[X1-g,ya,Z0+g],[X1-g,ya,Z1-g],[X0+g,ya,Z1-g]];
  function lungo(P0,P1,f){ return [P0[0]+(P1[0]-P0[0])*f,P0[1]+(P1[1]-P0[1])*f,P0[2]+(P1[2]-P0[2])*f]; }
  function trave(P0,P1,y0,n,numero,ry){ var L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]), q, f0, f1;      // l'architrave, largo quanto l'abaco, a pezzi
    for(q=0;q<n;q++){ f0=q?(q-.5)/(n-1):-t/2/L; f1=q<n-1?(q+.5)/(n-1):1+t/2/L; B.fc=numero(q);
      B.scatola((f1-f0)*L,ht,t,P0[0]+(P1[0]-P0[0])*(f0+f1)/2,y0,P0[1]+(P1[1]-P0[1])*(f0+f1)/2,P.marmo,ry); } B.fc=0; }
  for(k=0;k<4;k++){ var j=(k+1)%4, n=LATI[k][0], nu=LATI[k][1], q;
    trave(C4[k],C4[j],a+hc,n,nu,k%2?PI/2:0);
    for(q=0;q<n;q++){ var f0=q?(q-.5)/(n-1):0, f1=q<n-1?(q+.5)/(n-1):1; B.fc=nu(q);      // il tetto: falde che scendono dal muro (alto) all'architrave (basso), con un poco di gronda
      B.quad(lungo(O[k],O[j],f0),lungo(O[k],O[j],f1),lungo(I[k],I[j],f1),lungo(I[k],I[j],f0),P.coppi); }
    B.fc=0; }
  trave([xe0,ze],[xe1,ze],yo-ht,nE,function(q){ return num(4,q); },0);
  B.scatola(w,h+.27,.14,x,y,z-d/2,P.tufo).scatola(.14,h+.27,d,x-w/2,y,z,P.tufo).scatola(.14,h+.27,d,x+w/2,y,z,P.tufo);
}
/* Muri di sostegno attorno a un rettangolo, da y0 a y1 (25 novembre 2026): dove il terreno scende oltre il bordo di una terrazza si vede il muro, non il vuoto sotto l'edificio */
function zoccolo(B,x0,x1,z0,z1,y0,y1,colore,s){ var h=y1-y0, c=colore||P.mattone; s=s||.3;
  return B.scatola(x1-x0,h,s,(x0+x1)/2,y0,z0+s/2,c).scatola(x1-x0,h,s,(x0+x1)/2,y0,z1-s/2,c).scatola(s,h,z1-z0-2*s,x0+s/2,y0,(z0+z1)/2,c).scatola(s,h,z1-z0-2*s,x1-s/2,y0,(z0+z1)/2,c); }
/* Un portico dritto, con le proporzioni di portico() (25 novembre 2026, per la piazza del Pantheon): lungo L sull'asse x, la fila di colonne su z=0, profondo prof verso -z,
   aperto verso +z. muro: un muro di fondo col tetto a una falda; altrimenti una seconda fila di colonne e il tetto a due falde (un colonnato che si attraversa).
   Architrave e tetto sono a pezzi, uno per colonna, col numero della colonna: in rovina cadono con lei (come in portico()).
   o (facoltativo, 25 novembre 2026): rialzo, quanto il pavimento sta sopra il piano attorno (con o.gradini gradini sul lato aperto); colore, delle colonne. */
function porticoDritto(B,L,prof,h,muro,o){
  o=o||{}; var ri=o.rialzo||0, ng=o.gradini||0, pd=.035, k;
  if(ri){ B.scatola(L,ri,prof+.15,0,0,-prof/2,P.travertino);                                                     // lo zoccolo del portico
    for(k=1;k<ng;k++) B.scatola(L,ri*(ng-k)/ng,pd,0,0,.075+pd*(k-.5),P.travertino);                             // i gradini verso la piazza: lo zoccolo è il più alto
    B.dentro(0,ri,0,0,function(B){ porticoDritto(B,L,prof,h,muro,{colore:o.colore}); }); return; }
  var a=.1, he=h*.18, hc=h-he, r=hc/20, ia=r*6.5, X0=-L/2+.2, X1=L/2-.2, n=Math.max(3,Math.round((X1-X0)/ia)+1), ht=he*.45, t=r*2.7, yl=a+hc+ht, yo=a+h+.17, q, f0, f1, xa, xb, id, id2=0;
  B.scatola(L,.1,prof+.15,0,0,-prof/2,P.selce);
  B.colonne(X0,0,X1,0,n,hc,r,a,o.colore); id=B.ultimaFila;
  if(muro) B.scatola(L,h+.27,.14,0,0,-prof,P.tufo); else { B.colonne(X0,-prof,X1,-prof,n,hc,r,a,o.colore); id2=B.ultimaFila; }
  for(q=0;q<n;q++){ f0=q?(q-.5)/(n-1):-.02; f1=q<n-1?(q+.5)/(n-1):1.02; xa=X0+(X1-X0)*f0; xb=X0+(X1-X0)*f1;
    B.fc=id?id+q+1:0; B.scatola(xb-xa,ht,t,(xa+xb)/2,a+hc,0,P.marmo);
    if(muro) B.quad([xb,yo,-prof-.07],[xa,yo,-prof-.07],[xa,yl,r*1.4],[xb,yl,r*1.4],P.coppi);
    else { B.quad([xb,yo,-prof/2],[xa,yo,-prof/2],[xa,yl,r*1.4],[xb,yl,r*1.4],P.coppi);
      B.fc=id2?id2+q+1:0; B.scatola(xb-xa,ht,t,(xa+xb)/2,a+hc,-prof,P.marmo).quad([xa,yo,-prof/2],[xb,yo,-prof/2],[xb,yl,-prof-r*1.4],[xa,yl,-prof-r*1.4],P.coppi); } }
  B.fc=0;
}
function circo(B,L,W,h,spina){                           // circo o stadio: gradinate, fornici, pista
  var pr=function(w){ return RM.stadio(L-(W-w),w,26,14); }, est=pr(W), cima=pr(W-1.3), pista=pr(W*.62);
  var asse=pista.map(function(p){ return [Math.max(-L/2+4,Math.min(L/2-W/2,p[0])),0]; });
  B.striscia(est,0,est,h,P.travertino).striscia(est,h,cima,h,P.travertino).striscia(cima,h,cima,h-.3,P.travertino)
   .striscia(cima,h-.3,pista,.45,P.tufo).striscia(pista,.45,pista,.12,P.travertino).striscia(pista,.12,asse,.12,P.arena);
  B.fornici(est,.15,h*.36,.5,1,false).fornici(est,h*.56,h*.28,.4,1,false).aperture(-L/2,-W/2+1,-L/2,W/2-1,12,.15,h*.4);
  if(spina){
    B.scatola(L*.56,.4,.8,-1,.12,0,P.travertino);      // la spina; l'obelisco di Augusto che stava nel mezzo (oggi in piazza del Popolo) è una voce a sé dal 27 novembre 2026 (obeliscoflaminio)
    [-1,1].forEach(function(s2){ B.colonne(-1+s2*L*.12-.4,0,-1+s2*L*.12+.4,0,2,.9,.05,.52).scatola(1,.08,.2,-1+s2*L*.12,1.42,0,P.marmo); B.cilindro(.5,.12,-1+s2*L*.2,.52,0,P.acqua,null,10); });      // i contagiri (le uova e i delfini) e le vasche
    [-1,1].forEach(function(s){ for(var k=0;k<3;k++) B.cono(.16,.8,-1+s*(L*.28+.6),.12,(k-1)*.36,P.oro,8); });
    B.scatola(4,h+1,1.6,-4,0,-W/2+.2,P.marmo).falde(4,.7,1.8,-4,h+1,-W/2+.2,P.coppi);          // pulvinar, lato del Palatino
  }
}
function teatro(B,r,h,tre){                              // cavea a semicerchio verso +z, scena a -z; tre: un terzo ordine di arcate in facciata
  var est=RM.ellisse(r,r,22,0,PI), int=RM.ellisse(r*.9,r*.9,22,0,PI), orc=RM.ellisse(r*.3,r*.3,22,0,PI), cen=orc.map(function(){ return [0,0]; });
  B.striscia(est,0,est,h,P.travertino,false).striscia(est,h,int,h,P.travertino,false).striscia(int,h,orc,.3,P.tufo,false).striscia(orc,.3,cen,.3,P.marmo,false);
  B.fornici(est,.15,h*.3,.5,1,false).fornici(est,h*.44,h*.26,.45,1,false);
  if(tre) B.fornici(est,h*.76,h*.17,.4,1,false);
  B.scatola(r*2,h*1.05,r*.24,0,0,-r*.12,P.travertino).aperture(-r*.9,0,r*.9,0,9,.4,h*.5).scatola(r*1.4,.35,r*.3,0,0,r*.15,P.marmo);
  [0,1].forEach(function(l){ B.colonne(-r*.66,.07,r*.66,.07,10,h*.36,.05,.35+l*h*.4).scatola(r*1.36,.07,.16,0,.35+l*h*.4+h*.36,.07,P.marmo); });      // la fronte della scena: due ordini di colonne
  B.aperture(r*.9,-r*.24,-r*.9,-r*.24,9,.2,h*.42);                                                                                                   // gli archi sul retro della scena
}
/* I teatri, uno per uno (27 novembre 2026). L'utente: teatri e terme «mi convincono poco perché tutti uguali». Uscivano tutti da teatro(), qui sopra, con due numeri.
   Ora ognuno ha il suo disegno, dalle fonti lette (src/testi/topografia-fonti.md, «I teatri, uno per uno»): misure, orientamento, numero e tipo degli ordini, materiali, scena.
   Cavea a semicerchio verso +z, scena a -z, centro dell'orchestra all'origine. o.r raggio esterno; o.archi arcate sulla mezza facciata; o.ordini: [y0,y1,altezza dell'arco] per ogni
   ordine di arcate aperte, fatte con campata() come al Colosseo; o.attico [y0,y1]: muro pieno con lesene (Marcello); o.col colore della facciata, o.semi delle semicolonne;
   o.sedili colore delle gradinate; o.rorc raggio dell'orchestra; o.scena [lunghezza, profondità, altezza]; o.frons ordini di colonne della fronte della scena;
   o.aule [larghezza, profondità]: le aule absidate ai capi della scena (Marcello); o.tettoia: il tetto sporgente sopra il palco (Pompeo); o.porticato: colonne davanti al retro della scena.
   Altezze degli archi, numero dei sedili e delle colonne della scena sono uno schema dove la fonte non li dà: lo dicono le schede. */
function teatroVero(B,o){
  var r=o.r, n=o.archi, col=o.col||P.travertino, sem=o.semi||col, sed=o.sedili||P.tufo, H=o.ordini, top=o.attico?o.attico[1]:H[H.length-1][1], k;
  var e=RM.ellisse(r,r,n,0,PI), ri=r-.55, w=RM.ellisse(ri,ri,n,0,PI), passo=PI*r/n, ro=o.rorc||r*.25, hc=top-.12, NS=28;
  function an(q){ return RM.ellisse(q,q,NS,0,PI); }
  for(k=0;k<n;k++) H.forEach(function(q){ campata(B,e[k],e[k+1],q[0],q[1],passo*.58,q[2],.24,col); });                                  // la facciata: arcate aperte
  H.forEach(function(q,l){ var c=RM.ellisse(r+.07,r+.07,n,0,PI); B.striscia(c,q[1]-.09,c,q[1],P.marmo,false).striscia(e,q[1]-.09,c,q[1]-.09,P.marmo,false);      // cornice in cima a ogni ordine
    B.striscia(e,q[1],w,q[1],col,false);                                                                                                  // il piano dell'ambulacro, che si vede dagli archi
    var sc=Array.isArray(sem)?sem[l]:sem;
    e.forEach(function(p){ var ang=Math.atan2(p[0],p[1]), hh=q[1]-q[0]-.12;                                                               // semicolonne fra gli archi
      B.dentro(p[0]*1.004,q[0],p[1]*1.004,ang,function(B){ B.geo(new THREE.CylinderGeometry(.045,.05,hh,5,1,true,-Math.PI/2,Math.PI).translate(0,hh/2,0),sc); }); }); });
  if(o.attico){ var a0=o.attico[0], a1=o.attico[1];                                                                                       // l'attico: muro pieno, lesene, cornicione
    B.striscia(e,a0,e,a1,col,false).striscia(e,a1,w,a1,col,false);
    e.forEach(function(p,q){ if(q%2===0) B.scatola(.08,a1-a0-.06,.05,p[0]*1.004,a0,p[1]*1.004,col,Math.atan2(p[0],p[1])); });
    var c3=RM.ellisse(r+.08,r+.08,n,0,PI); B.striscia(c3,a1-.08,c3,a1,P.marmo,false); }
  B.striscia(w,0,w,top,col,false);                                                                                                        // il muro di fondo dell'ambulacro
  for(k=0;k<14;k++){ var ra=ro+(ri-ro)*k/14, rb=ro+(ri-ro)*(k+1)/14, ya=.3+(hc-.3)*k/14, yb=.3+(hc-.3)*(k+1)/14;                         // la cavea, a gradini
    B.striscia(an(ra),ya,an(ra),yb,sed,false).striscia(an(ra),yb,an(rb),yb,sed,false); }
  var pr=ro+(ri-ro)*.5, yp=.3+(hc-.3)*.5; B.striscia(an(pr),yp,an(pr),yp+.12,col,false);                                                  // il muretto fra la parte bassa e quella alta della cavea
  B.striscia(an(ro),.15,an(ro),.3,P.marmo,false).striscia(an(ro),.15,an(ro).map(function(){ return [0,0]; }),.15,P.marmo,false);           // l'orchestra
  [-1,1].forEach(function(s){ B.quad([s*ro,0,0],[s*r,0,0],[s*r,top,0],[s*ro,.4,0],col).quad([s*ro,.4,0],[s*r,top,0],[s*r,0,0],[s*ro,0,0],col); });      // le testate della cavea
  var S=o.scena, Ls=S[0], Sd=S[1], Sh=S[2], zf=-.6;
  B.scatola(Ls*.92,.15,.6,0,0,-.3,P.marmo);                                                                                               // il palco
  B.scatola(Ls,Sh,Sd,0,0,zf-Sd/2,col).scatola(Ls+.06,.1,Sd+.06,0,Sh,zf-Sd/2,P.marmo);                                                     // l'edificio della scena
  var nf=o.frons||2, hf=(Sh-.2)/nf, nc=o.nc||Math.max(6,Math.round(Ls/.75));
  for(k=0;k<nf;k++){ var yf=.15+k*hf; B.colonne(-Ls/2+.25,zf+.12,Ls/2-.25,zf+.12,nc,hf*.8,Math.min(.06,hf*.05),yf).scatola(Ls-.3,hf*.12,.18,0,yf+hf*.8,zf+.08,P.marmo); }      // la fronte: colonne su più ordini
  [-1,0,1].forEach(function(q){ B.vano(q*Ls*.22,.15,zf+.01,1,0,q?.4:.55,hf*.7,true); });                                                  // le tre porte della scena
  B.aperture(Ls/2-.3,zf-Sd,-Ls/2+.3,zf-Sd,Math.max(5,Math.round(Ls/1.2)),.15,Sh*.38);                                                     // il retro della scena
  if(o.porticato) B.colonne(-Ls/2+.3,zf-Sd-.35,Ls/2-.3,zf-Sd-.35,o.porticato,Sh*.42,.07,0).scatola(Ls*.55,.12,.45,0,Sh*.42,zf-Sd-.25,P.marmo);      // portico davanti al retro (Marcello: sei colonne sulla Forma Urbis)
  if(o.tettoia) B.quad([-Ls/2,Sh,zf],[Ls/2,Sh,zf],[Ls/2,Sh-.25,.05],[-Ls/2,Sh-.25,.05],P.coppi);                                          // il tetto sporgente sopra il palco
  if(o.aule) [-1,1].forEach(function(s){ var al=o.aule, xa=s*(Ls/2+al[0]/2);                                                              // le aule absidate ai capi della scena
    B.scatola(al[0],Sh*.75,al[1],xa,0,zf-al[1]/2,col).falde(al[1],.3,al[0]+.1,xa,Sh*.75,zf-al[1]/2,P.coppi,PI/2,col).cilindro(al[0]*.36,Sh*.6,xa,0,zf-al[1],col,null,10); });
}
/* L'anfiteatro Castrense (voci castrense e castrensemura): tutto di mattoni, tre piani; murato: resta la metà sud (+z), con gli archi tamponati */
function castrense(B,murato){
  var n=40, MT=P.mattone, TAMP=RM.col(0x9c7f66), k, f;
  function ell(s,q){ return RM.ellisse(2.4+(4.43-2.4)*s,1.9+(3.9-1.9)*s,q||n); }
  function parte(l){ return murato?l.slice(0,n/2+1):l.concat([l[0]]); }                                                                  // dopo il 271 la metà sud, da est a ovest
  var e=parte(RM.ellisse(4.43,3.9,n)), w=parte(RM.ellisse(3.9,3.37,n)), m=e.length-1, PIA=[[0,.8,.6],[.8,1.5,.5]];
  for(k=0;k<m;k++) PIA.forEach(function(q,l){ campata(B,e[k],e[k+1],q[0],q[1],.3,q[2],.2,MT);
    var a=[e[k][0]*.985,e[k][1]*.985], b=[e[k+1][0]*.985,e[k+1][1]*.985];
    if(murato) B.quad([a[0],q[0],a[1]],[b[0],q[0],b[1]],[b[0],q[1]-.02,b[1]],[a[0],q[1]-.02,a[1]],TAMP);                                    // gli archi tamponati
    else if(l===1) B.quad([a[0],q[0],a[1]],[b[0],q[0],b[1]],[b[0],q[0]+.12,b[1]],[a[0],q[0]+.12,a[1]],MT); });                            // i parapetti del secondo piano
  [.8,1.5,2.05].forEach(function(y){ var c=parte(RM.ellisse(4.48,3.95,n)); B.striscia(c,y-.05,c,y,MT,false).striscia(e,y-.05,c,y-.05,MT,false); });      // le cornici
  B.striscia(e,1.5,e,2.05,MT,false).fornici(e,1.62,.22,.3,2,false).striscia(e,2.05,w,2.05,MT,false);                                      // l'attico con le finestre
  e.forEach(function(p){ var ang=Math.atan2(p[0],p[1]);                                                                                    // semicolonne e lesene, di mattoni
    PIA.forEach(function(q){ var hh=q[1]-q[0]-.06; B.dentro(p[0]*1.004,q[0],p[1]*1.004,ang,function(B){ B.geo(new THREE.CylinderGeometry(.04,.045,hh,5,1,true,-Math.PI/2,Math.PI).translate(0,hh/2,0),MT); }); });
    B.scatola(.07,.5,.04,p[0]*1.006,1.52,p[1]*1.006,MT,ang); });
  B.striscia(w,0,w,2.05,MT,false); [.8,1.5].forEach(function(y){ B.striscia(e,y,w,y,MT,false); });                                         // l'ambulacro
  for(f=0;f<7;f++){ var s0=.74-f*.105, s1=s0-.105; B.striscia(parte(ell(s0)),1.9-f*.23,parte(ell(s0)),1.67-f*.23,P.tufo,false).striscia(parte(ell(s0)),1.67-f*.23,parte(ell(s1)),1.67-f*.23,P.tufo,false); }      // la cavea
  var ar=parte(RM.ellisse(2.4,1.9,n)); B.striscia(ar,0,ar,.3,MT,false);                                                                    // il muro dell'arena
  if(!murato) B.striscia(ar,.12,ar.map(function(){ return [0,0]; }),.12,P.sabbia,false);
  else [-1,1].forEach(function(s){ B.quad([s*2.4,0,0],[s*4.43,0,0],[s*4.43,2.05,0],[s*2.4,.3,0],MT).quad([s*2.4,.3,0],[s*4.43,2.05,0],[s*4.43,0,0],[s*2.4,0,0],MT); });      // le testate del taglio
}
/* Le terme una per una (27 novembre 2026). Prima tutte le terme uscivano da terme() e da mezza distanza sembravano la stessa cosa (richiesta dell'utente: «mi convincono poco
   perché tutti uguali»). Ora le grandi terme hanno misure, orientamento e parti proprie, dalle voci di Platner e Ashby e da it.wikipedia lette quel giorno: frasi e tabella
   «Per chi disegna» in src/testi/topografia-fonti.md, sezione «Le terme, una per una». Coordinate locali: x lungo l'asse maggiore del corpo centrale, +z verso il caldarium.
   Schema dichiarato nelle schede: altezze, numero e forma delle sale minori, numero delle arcate, posto delle esedre piccole. La vecchia terme(), uguale per tutte e non più chiamata, è stata tolta il 27 novembre 2026. */
function muroTerme(B,x0,z0,x1,z1,h,s,col,liv){                 // un tratto di recinto ad arcate fra due punti
  var L=Math.hypot(x1-x0,z1-z0); B.dentro((x0+x1)/2,0,(z0+z1)/2,Math.atan2(-(z1-z0),x1-x0),function(B){ arcato(B,L,h,s,0,0,0,col||P.mattone,liv||1,Math.max(2,Math.round(L/1.6))); });
}
function esedraTerme(B,cx,cz,rx,rz,a0,a1,h,col,dentro){         // muro curvo da a0 ad a1 (0 = +x, PI/2 = +z); dentro: nicchie sul lato concavo, altrimenti arcate fuori
  var pr=RM.ellisse(rx,rz,14,a0,a1).map(function(p){ return [cx+p[0],cz+p[1]]; });
  B.striscia(pr,0,pr,h,col||P.mattone,false); if(dentro) vaniVerso(B,pr,cx,cz,h*.22,h*.5,.45); else B.fornici(pr,.2,h*.45,.5,1,false);
  return pr;
}
function gradiTeatro(B,cx,cz,rx,rz,a0,a1,n,h){                 // gradinate a semicerchio che salgono verso il muro (le esedre-teatro)
  for(var g=0;g<n;g++){ var k0=.45+.55*g/n, k1=.45+.55*(g+1)/n, y=h*(g+1)/n, p0=RM.ellisse(rx*k0,rz*k0,14,a0,a1).map(function(p){ return [cx+p[0],cz+p[1]]; }), p1=RM.ellisse(rx*k1,rz*k1,14,a0,a1).map(function(p){ return [cx+p[0],cz+p[1]]; });
    B.striscia(p0,y-h/n,p0,y,P.travertino,false).striscia(p0,y,p1,y,P.travertino,false); }
}
/* Il corpo centrale delle terme imperiali, simmetrico sull'asse z: davanti (z0) il frigidarium (frig:'scoperto', la natatio a cielo aperto con il muro esterno a nicchie e colonne
   di Caracalla e Diocleziano; 'sala' coperto), poi la sala centrale a tre crociere con i finestroni, il tepidarium, il caldarium che sporge (cald.forma 'tondo' o 'rett');
   ai capi dell'asse maggiore le palestre, cortili a portico su tre lati (pal: [larghezza, profondità], 0 senza); in fondo, ai lati del caldarium, una fila di sale (sale:false
   le toglie, come a Costantino). W, D: larghezza e profondità senza il caldarium; hb: altezza delle sale basse; ingresso: un portale al centro della fronte (Traiano). */
function corpoTerme(B,o){
  var W=o.W, D=o.D, z0=o.z0, z1=z0+D, hb=o.hb||1.9, sw=o.sala[0], sd=o.sala[1], sh=o.sala[2], nd=o.nat[1], nw=o.nat[0], c=o.cald, t=o.tep, I=P.intonaco;
  var zr=o.sale===false?z1:z1-(o.fila||1.8), pw=o.pal?o.pal[0]:0, pd=o.pal?o.pal[1]:0, xp=W/2-pw, zs=z0+nd+sd/2, zh=zs+sd/2, i, k;
  if(o.frig==='sala'){ B.scatola(nw,hb*1.25,nd,0,0,z0+nd/2,I).volta(nd,nw/2*.5,0,hb*1.25,z0+nd/2,I,PI/2).aperture(nw/2,z0,-nw/2,z0,3,hb*.45,hb*.6,nw/5); }      // frigidarium coperto, a botte
  else {                                                                                                                       // la natatio a cielo aperto
    B.scatola(nw,.1,nd,0,0,z0+nd/2,P.travertino).scatola(nw-.3,.05,nd-.45,0,.1,z0+nd/2+.08,P.acqua);
    B.scatola(nw,hb*1.2,.25,0,0,z0+.12,I);                                                                                     // il muro esterno a nicchie e colonne su due ordini
    for(k=0;k<2;k++){ B.colonne(nw/2-.25,z0-.16,-nw/2+.25,z0-.16,Math.max(4,Math.round(nw/.6)),hb*.52-.12,.06,.04+k*hb*.58);
      B.aperture(nw/2-.2,z0,-nw/2+.2,z0,Math.max(3,Math.round(nw/.6))-1,.16+k*hb*.58,hb*.34,.2); B.scatola(nw,.08,.3,0,hb*.52-.08+k*hb*.58,z0-.15,P.marmo); }
    [-1,1].forEach(function(s){ B.scatola(.2,hb*.7,nd,s*nw/2,0,z0+nd/2,I); }); }
  if(o.ingresso){ B.scatola(2.2,hb*1.7,.6,0,0,z0+.1,I).vano(0,0,z0-.21,-1,0,1,hb*1.15).falde(2.3,.5,.7,0,hb*1.7,z0+.1,P.coppi,0,I); }      // il portale al centro della facciata
  B.scatola(sw,sh,sd,0,0,zs,I);                                                                                                // la sala centrale, a tre crociere
  for(i=-1;i<=1;i++) B.falde(sd+.12,.7,sw/3,i*sw/3,sh,zs,P.coppi,PI/2,I);
  B.falde(sw+.05,.6,sd+.05,0,sh,zs,P.coppi,0,I);
  B.aperture(-sw/2,zs+sd/2,sw/2,zs+sd/2,3,sh*.62,sh*.3,sw/3*.62).aperture(sw/2,zs-sd/2,-sw/2,zs-sd/2,3,sh*.62,sh*.3,sw/3*.62);      // i finestroni termali sopra i tetti vicini
  [-1,1].forEach(function(s){
    if(nw<sw) B.scatola((sw-nw)/2,hb,nd,s*(nw+sw)/4,0,z0+nd/2,I);                                                              // i vestiboli accanto alla natatio
    var xa=sw/2, xb=pw?xp:W/2, la=xb-xa;
    if(la>.2){ B.scatola(la,hb,zr-z0,s*(xa+la/2),0,(z0+zr)/2,I);                                                              // le sale fra la sala centrale e la palestra (spogliatoi, vestiboli), una falda per sala
      var ns=Math.max(1,Math.round((zr-z0)/2.6)), ls=(zr-z0)/ns; for(i=0;i<ns;i++) B.falde(la+.06,.42+.12*(i%2),ls-.04,s*(xa+la/2),hb,z0+ls*(i+.5),P.coppi,0,I);
      B.aperture(Math.max(s*xa,s*xb),z0,Math.min(s*xa,s*xb),z0,Math.max(1,Math.round(la/.9)),hb*.25,hb*.45,.3); }
    if(pw){ var zp0=z0+.5, zp1=Math.min(zr,zp0+pd), zm=(zp0+zp1)/2, xo=s*W/2, xi=s*xp;                                     // la palestra: cortile scoperto con portico su tre lati
      B.scatola(pw,.06,zp1-zp0,s*(W/2-pw/2),0,zm,P.sabbia).scatola(.25,hb*.85,zp1-zp0,xo-s*.12,0,zm,I);
      B.aperture(xo,s>0?zp1-.3:zp0+.3,xo,s>0?zp0+.3:zp1-.3,Math.max(2,Math.round((zp1-zp0)/.9)),hb*.25,hb*.42,.32);      // finestre sul muro esterno, rivolte fuori
      B.colonne(xi+s*.25,zp0+.35,xo-s*.45,zp0+.35,Math.max(3,Math.round(pw/.45)),hb*.42,.05,.06).colonne(xi+s*.25,zp1-.35,xo-s*.45,zp1-.35,Math.max(3,Math.round(pw/.45)),hb*.42,.05,.06);
      B.colonne(xo-s*.45,zp0+.35,xo-s*.45,zp1-.35,Math.max(3,Math.round((zp1-zp0)/.45)),hb*.42,.05,.06);
      B.scatola(pw-.2,.06,.42,s*(W/2-pw/2),hb*.48,zp0+.2,P.coppi).scatola(pw-.2,.06,.42,s*(W/2-pw/2),hb*.48,zp1-.2,P.coppi).scatola(.42,.06,zp1-zp0,xo-s*.3,hb*.48,zm,P.coppi);
      if(zp0>z0+.05) B.scatola(pw,hb,zp0-z0,s*(W/2-pw/2),0,(z0+zp0)/2,I);
      if(zr>zp1+.05) B.scatola(pw,hb*.9,zr-zp1,s*(W/2-pw/2),0,(zp1+zr)/2,I).volta(pw-.1,Math.min(.9,(zr-zp1)/2)*.9,s*(W/2-pw/2),hb*.9,(zp1+zr)/2,I); }
    if(o.sale!==false){ var r0=c.forma==='tondo'?c.r+.15:c.w/2+.15, n=4, lw=(W/2-r0)/n;                                    // la fila di sale in fondo, quattro per parte del caldarium
      for(i=0;i<n;i++){ var hx=hb*(i%2?1.05:1.25), cx=s*(r0+lw*(i+.5));
        B.scatola(lw-.08,hx,zr<z1?z1-zr:1.6,cx,0,(zr+z1)/2,I).volta(z1-zr-.1,Math.min(lw/2-.06,.8),cx,hx,(zr+z1)/2,I,PI/2);
        B.aperture(cx-lw/2+.1,z1,cx+lw/2-.1,z1,2,hb*.3,hb*.5,lw*.25); } }
  });
  var zt1=(c.forma==='tondo'?z1+c.sporge-2*c.r:z1+c.sporge-c.d)+.15, tl=t.forma==='tondo'?2*t.r:Math.min(t.d||1.6,zt1-zh), zt0=Math.max(zh,zt1-tl), ztc=(zt0+zt1)/2, xw=t.forma==='tondo'?t.r:t.w/2;      // il tepidarium, davanti al caldarium
  if(t.forma==='tondo') B.cilindro(t.r,hb*1.45,0,0,ztc,I,null,16).cupola(t.r,0,hb*1.45,ztc,I,.6);
  else B.scatola(t.w,hb*1.3,zt1-zt0,0,0,ztc,I).falde(t.w,.4,zt1-zt0,0,hb*1.3,ztc,P.coppi,PI/2,I);
  if(zt0>zh+.1) B.scatola(2*xw,hb*.9,zt0-zh+.1,0,0,(zh+zt0)/2,I);                                                              // le sale di passaggio dalla sala centrale
  if(zr>zh+.2) [-1,1].forEach(function(s){ var lw2=sw/2-xw-.9, zw=Math.max(zh,Math.min(zt0,zr)), lw3=sw/2-xw;      // ai lati del tepidarium i cortili scoperti che danno luce («light wells», Platner e Ashby); fra loro e la sala centrale sale basse
    if(zw>zh+.1) B.scatola(lw3,hb*.85,zw-zh,s*(xw+lw3/2),0,(zh+zw)/2,I);
    if(zr>zw+.1){ if(lw2>.3) B.scatola(lw2,hb*.85,zr-zw,s*(sw/2-lw2/2),0,(zw+zr)/2,I); B.scatola(lw2>.3?.85:lw3,.05,zr-zw,s*(xw+(lw2>.3?.45:lw3/2)),0,(zw+zr)/2,P.selce); } });
  if(c.forma==='tondo'){ var zc=z1+c.sporge-c.r, pr=RM.ellisse(c.r,c.r,16,0,PI).map(function(p){ return [p[0],zc+p[1]]; });    // il caldarium rotondo a cupola, finestre su due file verso il sole
    B.cilindro(c.r,c.h,0,0,zc,I,null,24).cupola(c.r,0,c.h,zc,I,.6);
    B.fornici(pr,c.h*.14,c.h*.34,.55,1,false).fornici(pr,c.h*.58,c.h*.3,.5,1,false);
  } else { var zq=z1+c.sporge-c.d/2;                                                                                           // il caldarium rettangolare con tre absidi e una volta a botte
    B.scatola(c.w,c.h,c.d,0,0,zq,I).volta(c.w,c.d/2,0,c.h,zq,I);
    [-1,1].forEach(function(s){ B.cilindro(c.d*.3,c.h*.78,s*c.w/2,0,zq,I,null,12).cupola(c.d*.3,s*c.w/2,c.h*.78,zq,I,.6); });
    B.cilindro(c.w*.17,c.h*.78,0,0,zq+c.d/2,I,null,12).cupola(c.w*.17,0,c.h*.78,zq+c.d/2,I,.6);
    B.aperture(-c.w/2+.2,zq+c.d/2,c.w/2-.2,zq+c.d/2,4,c.h*.45,c.h*.42,c.w*.11); }
}
/* Caracalla: recinto di 337 x 328 m (406 con le esedre), corpo centrale di 220 x 114 m spinto verso la fronte (le esedre cominciano «almost as far as the back of the central
   building»), caldarium tondo di 34-35 m che sporge di 26 m al centro del lato sud-ovest; sulla fronte botteghe e uffici su due piani; sui fianchi le due grandi esedre con la sala
   ottagona a cupola, una sala rettangolare aperta e una sala riscaldata, e il portico verso il giardino; agli angoli di fondo le biblioteche; al centro del fondo lo stadio
   e, più in alto, le cisterne di 64 camere su due piani (Platner e Ashby; misure da it.wikipedia). */
function termeCaracalla(B){
  var L=33.7, Pd=32.8, a=1.5, s=.7, ws=L*.42, zf=Pd/2-Pd*.07-.2, ze=6.4, rz=5.4, rx=3.45, g;
  B.scatola(L-1,.08,Pd-1,0,0,0,P.prato);
  arcato(B,L,a*1.45,s*1.8,0,0,-Pd/2+.2,P.mattone,2,Math.round(L/1.1));                                           // la fronte: botteghe e uffici su due piani sotto il giardino rialzato
  arcato(B,L,a,s,0,0,Pd/2,P.mattone,1,Math.round(L/1.6));
  [-1,1].forEach(function(k){ var X=k*L/2, a0=k>0?-PI/2:PI/2, a1=k>0?PI/2:PI*1.5, xi=k*(L/2+rx*.5);
    muroTerme(B,X,-Pd/2,X,ze-rz,a,s); muroTerme(B,X,ze+rz,X,Pd/2,a,s);
    esedraTerme(B,X,ze,rx,rz,a0,a1,a+.7,P.mattone,false);                                                          // la grande esedra sul fianco
    B.cilindro(1,2.5,xi,0,ze-2.4,P.intonaco,null,8).cupola(1,xi,2.5,ze-2.4,P.intonaco,.62);                       // la sala ottagona a cupola
    B.scatola(1.7,2.1,1.8,xi,0,ze,P.intonaco).scatola(1.75,.08,1.85,xi,2.1,ze,P.coppi).vano(X-k*.02,0,ze,0,1,1.1,1.5);      // la sala rettangolare aperta verso il giardino
    B.scatola(1.7,2,1.8,xi,0,ze+2.4,P.intonaco).volta(1.8,.82,xi,2,ze+2.4,P.intonaco,PI/2);                         // la sala riscaldata
    B.colonne(X-k*.35,ze-rz+.3,X-k*.35,ze+rz-.3,14,1.1,.06,.05).scatola(.55,.07,2*rz-.4,X-k*.3,1.15,ze,P.coppi);       // il portico verso il giardino
    var xb=k*(L/2-2.2), zb=Pd/2-1.75;                                                                             // la biblioteca nell'angolo di fondo, aperta verso il giardino
    B.scatola(3.6,2.2,2.6,xb,0,zb,P.intonaco).falde(3.7,.45,2.7,xb,2.2,zb,P.coppi,0,P.intonaco).vano(xb,0,zb-1.31,-1,0,2.2,1.6); });
  B.scatola(ws,2.2,Pd*.07,0,0,Pd/2-Pd*.035-.2,P.mattone);                                                          // le cisterne: due file di camere su due piani
  [.2,1.25].forEach(function(y){ B.aperture(ws/2,zf,-ws/2,zf,16,y,.75); });
  for(g=0;g<4;g++) B.scatola(ws*.86,.9-.22*g,.42,0,0,zf-.21-.42*g,P.travertino);                                  // lo stadio: le file di sedili verso il giardino
  [-1,1].forEach(function(k){ var cu=RM.ellisse(1.7,1.7,8,0,PI).map(function(q){ return [k*(ws*.43+q[1]*.8),zf-.84+q[0]*-.5]; }); B.striscia(cu,0,cu,.5,P.travertino,false); });
  corpoTerme(B,{W:22,D:11.4,z0:-11,hb:2,sala:[5.8,2.4,4],nat:[5.4,3.2],pal:[4.4,4.8],frig:'scoperto',cald:{forma:'tondo',r:1.7,sporge:2.6,h:3.4},tep:{forma:'rett',w:1.9,d:1.5}});
}
/* Diocleziano: recinto di 356 x 316 m, corpo centrale «280 by 160 metres» (Platner e Ashby), più grande rispetto al recinto che a Caracalla; sala centrale a tre crociere;
   natatio scoperta con il muro nord a nicchie; tepidarium tondo e caldarium rettangolare che sporge a sud-ovest; al centro del lato sud-ovest la grande esedra con le gradinate,
   «served as a theatre»; agli angoli ovest e sud le due aule rotonde (una è San Bernardo); sui fianchi esedre piccole (posto in schema). Nessuno stadio, nessuna esedra grande
   sui fianchi: è ciò che, a colpo d'occhio, la separa da Caracalla. Misure della sala, della natatio e dell'esedra: schema. */
/* Traiano: «partly surrounded, on the east, west, and south sides, by a peribolus … and exedrae at the four corners. On the north side there was no enclosure, but the façade
   of the building with the main entrance in the middle»; dal centro del lato sud «a very large exedra projected outward which served as a theatre»; misure estreme 340 x 330 m
   (Platner e Ashby, Thermae Traiani). Il frigidarium coperto e le misure del corpo centrale e delle esedre d'angolo sono schema. */
function termeTraiano(B){
  var L=28, zN=-16.35, zS=12.6, a=1.5, s=.7, ex=4.65, ez=3.7;
  B.scatola(L-1,.08,zS-zN-.6,0,0,(zN+zS)/2+.3,P.prato);
  muroTerme(B,-L/2,zS,-ex,zS,a,s); muroTerme(B,ex,zS,L/2,zS,a,s);
  esedraTerme(B,0,zS,ex,ez,0,PI,a+1,P.mattone,false); gradiTeatro(B,0,zS,ex-.4,ez-.35,0,PI,5,a*.9);                       // la grande esedra a teatro, sopra le sale della domus Aurea
  [-1,1].forEach(function(k){ var X=k*L/2, a0=k>0?-PI/2:PI/2, a1=k>0?PI/2:PI*1.5;
    muroTerme(B,X,zN+.6,X,zN+1.6,a,s); muroTerme(B,X,zN+6.4,X,zS-6.2,a,s); muroTerme(B,X,zS-1.4,X,zS,a,s);
    [zN+4,zS-3.8].forEach(function(z){ esedraTerme(B,X,z,2.6,2.4,a0,a1,a+.9,P.mattone,true);                            // le esedre agli angoli, con le nicchie (quella a nord-est ne ha undici)
      B.cupola(1,X+k*1.2,a+.9,z,P.intonaco,.5); }); });
  corpoTerme(B,{W:19,D:19.5,z0:zN,hb:2,sala:[6,2.5,3.8],nat:[6.4,3],pal:[3.6,6],frig:'sala',ingresso:true,cald:{forma:'tondo',r:1.55,sporge:1.9,h:3.2},tep:{forma:'rett',w:1.8,d:2.6}});
}
function termeDiocleziano(B){
  var L=35.6, Pd=31.6, a=1.5, s=.7, ex=7.5, ez=4.2;
  B.scatola(L-1,.08,Pd-1,0,0,0,P.prato);
  arcato(B,L,a,s,0,0,-Pd/2,P.mattone,1,Math.round(L/1.6));
  muroTerme(B,-L/2,Pd/2,-ex,Pd/2,a,s); muroTerme(B,ex,Pd/2,L/2,Pd/2,a,s);
  esedraTerme(B,0,Pd/2,ex,ez,0,PI,a+1,P.mattone,false); gradiTeatro(B,0,Pd/2,ex-.5,ez-.4,0,PI,5,a*.9);                 // la grande esedra a teatro (oggi piazza della Repubblica)
  [-1,1].forEach(function(k){ var X=k*L/2;
    muroTerme(B,X,-Pd/2,X,-6,a,s); muroTerme(B,X,-2,X,Pd/2,a,s);
    esedraTerme(B,X,-4,1.4,2,k>0?-PI/2:PI/2,k>0?PI/2:PI*1.5,a+.3,P.mattone,false);                                 // un'esedra piccola sul fianco (schema)
    B.cilindro(1.15,1.9,k*(L/2-.6),0,Pd/2-.6,P.intonaco,null,16).cupola(1.15,k*(L/2-.6),1.9,Pd/2-.6,P.intonaco,.55); });      // le aule rotonde agli angoli ovest e sud
  corpoTerme(B,{W:28,D:16,z0:-13.4,hb:2.1,sala:[9,2.7,4.4],nat:[10,3.6],pal:[6,6.4],frig:'scoperto',cald:{forma:'rett',w:5.4,d:3.2,sporge:2.2,h:3.6},tep:{forma:'tondo',r:1.15}});
}
/* opz (facoltativo): strette = navatelle larghe circa metà della navata, il rapporto delle basiliche a tre navate di Roma (senza opz restano larghe come prima);
   finestre = finestre per lato della navata; atrio:false = niente quadriportico */
function chiesa(B,L,W,transetto,opz){                     // basilica cristiana: navata lungo x, abside a -x, atrio a +x
  opz=opz||{}; var an=opz.strette?W*.2:W*.3, zn=opz.strette?W*.28:W*.33, nf=opz.finestre||Math.round(L/1.1);
  B.scatola(L,2.8,W*.36,0,0,0,P.mattone).falde(L,.9,W*.4,0,2.8,0,P.coppi,0,P.mattone);
  B.aperture(-L/2+.5,W*.18,L/2-.5,W*.18,nf,1.9,.55,.3).aperture(L/2-.5,-W*.18,-L/2+.5,-W*.18,nf,1.9,.55,.3);
  [-1,1].forEach(function(k){ B.scatola(L,1.5,an,0,0,k*zn,P.mattone).scatola(L+.1,.14,an+.02*W,0,1.5,k*zn,P.coppi); });
  B.cilindro(W*.17,2.3,-L/2,0,0,P.mattone,null,14).cono(W*.18,.7,-L/2,2.3,0,P.coppi,14);
  B.vano(L/2+.03,0,0,0,1,.55,1.1).vano(L/2+.03,0,zn,0,1,.36,.8).vano(L/2+.03,0,-zn,0,1,.36,.8).vano(L/2+.03,1.75,0,0,1,.5,.75);      // le tre porte e la finestra della facciata
  if(transetto) B.scatola(2.4,2.8,W*1.25,-L/2+1.6,0,0,P.mattone).falde(W*1.25,.8,2.6,-L/2+1.6,2.8,0,P.coppi,PI/2,P.mattone);
  if(opz.atrio!==false) portico(B,W*.8,W*.8,L/2+W*.4,0,0,1.1);
}
/* basilica a cinque navate (il Laterano, San Paolo): navata lungo x, abside a -x, atrio a +x; tetti a scalare come a San Pietro.
   o: nave e nav = larghezza della navata e di ciascuna navatella; hn, hi, he = altezze di navata, navatelle interne ed esterne; ra = raggio dell'abside;
   transetto = {prof, lung, alto} (navata trasversale continua, alta quanto la navata se alto è vero); ali = {prof, alto} (navatella trasversale bassa in fondo alle navate);
   atrio = {lato, prof} (quadriportico); finestre per lato */
function cinqueNavate(B,L,o){
  var nv=o.nave, a=o.nav, hn=o.hn||2.9, hi=o.hi||2, he=o.he||1.4, nf=o.finestre||Math.round(L/.9), x0=-L/2, zi=nv/2+a/2, ze=nv/2+a*1.5, Wt=nv+4*a;
  B.scatola(L,hn,nv,0,0,0,P.mattone).falde(L,.75,nv+.2,0,hn,0,P.coppi,0,P.mattone);
  B.aperture(x0+.4,nv/2,L/2-.4,nv/2,nf,hi+.25,Math.min(.6,hn-hi-.4),.28).aperture(L/2-.4,-nv/2,x0+.4,-nv/2,nf,hi+.25,Math.min(.6,hn-hi-.4),.28);     // il cleristorio
  [-1,1].forEach(function(k){
    B.scatola(L,hi,a,0,0,k*zi,P.mattone).scatola(L+.06,.12,a+.04,0,hi,k*zi,P.coppi);                      // navatelle interne
    B.scatola(L,he,a,0,0,k*ze,P.mattone).scatola(L+.06,.12,a+.06,0,he,k*ze,P.coppi);                      // navatelle esterne, più basse
    B.aperture(x0+.4,k*Wt/2,L/2-.4,k*Wt/2,nf,.6,.55,.24);
  });
  if(o.transetto){ var t=o.transetto, ht=t.alto?hn:hn*.85;
    B.scatola(t.prof,ht,t.lung,x0+t.prof/2,0,0,P.mattone).falde(t.lung,.7,t.prof+.2,x0+t.prof/2,ht,0,P.coppi,PI/2,P.mattone); }
  if(o.ali) B.scatola(o.ali.prof,o.ali.alto,Wt+.6,x0+o.ali.prof/2,0,0,P.mattone).scatola(o.ali.prof+.06,.12,Wt+.66,x0+o.ali.prof/2,o.ali.alto,0,P.coppi);
  B.cilindro(o.ra,hn*.8,x0,0,0,P.mattone,null,16).cono(o.ra+.05,.6,x0,hn*.8,0,P.coppi,16);
  B.vano(L/2+.03,0,0,0,1,.55,1.1,true); [-1,1].forEach(function(k){ B.vano(L/2+.03,0,k*zi,0,1,.36,.85,true).vano(L/2+.03,0,k*ze,0,1,.34,.8,true); });      // le cinque porte
  [hi+.2,hi+.8].forEach(function(y){ if(y+.5<hn) [-.6,0,.6].forEach(function(z){ B.vano(L/2+.03,y,z*nv/2.4,0,1,.36,.5); }); });                         // finestre in facciata
  if(o.atrio) portico(B,o.atrio.lato,o.atrio.prof,L/2+o.atrio.prof/2,0,0,1.1);
}

/* vani lungo un profilo curvo, sul lato che guarda il punto (cx,cz): servono alle facciate concave, dove C.fornici li metterebbe dietro il muro */
function vaniVerso(B,prof,cx,cz,y,h,quota,quadra){
  for(var i=0;i<prof.length-1;i++){ var a=prof[i], b=prof[i+1], mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), nx=cx-mx, nz=cz-mz, m=Math.hypot(nx,nz)||1;
    B.vano(mx+nx/m*.07,y,mz+nz/m*.07,dx/L,dz/L,L*(quota||.5),h,quadra); }
}
/* un profilo chiuso ripreso a passo costante (per le arcate) */
function ricampiona(prof,passo){
  var o=[], i, n=prof.length, tot=0, L=[];
  for(i=0;i<n;i++){ var a=prof[i], b=prof[(i+1)%n]; L.push(Math.hypot(b[0]-a[0],b[1]-a[1])); tot+=L[i]; }
  var q=Math.max(8,Math.round(tot/passo)), d=tot/q, s=0, j=0, acc=0;
  for(i=0;i<q;i++){ s=i*d; while(j<n-1 && acc+L[j]<s){ acc+=L[j]; j++; } var f=(s-acc)/(L[j]||1), a2=prof[j], b2=prof[(j+1)%n]; o.push([a2[0]+(b2[0]-a2[0])*f,a2[1]+(b2[1]-a2[1])*f]); }
  return o;
}
/* stadio per le gare atletiche: facciata a due ordini di arcate con le loro cornici, due settori di gradinate divisi da un muro, pista senza spina; ingressi al centro dei lati lunghi, sulla curva e sulla testata */
function stadio(B,L,W,h){
  var pr=function(w){ return RM.stadio(L-(W-w),w,26,14); }, est=pr(W), fas=pr(W+.14), cima=pr(W-1.1), mez=pr(W-2.7), pod=pr(W*.52);
  var cen=pod.map(function(p){ return [Math.max(-L/2+3,Math.min(L/2-W/2,p[0])),0]; }), xm=-W/4;
  /* 27 novembre 2026: le arcate sono aperte, con campata() come al Colosseo e ai teatri (prima erano fornici dipinti sul muro pieno), con l'ambulacro dietro.
     Larghezza delle campate (5,5 m) e altezze sono uno schema: le fonti lette non le danno */
  var fit=ricampiona(est,.55), nf=fit.length, amb=pr(W-1), y1=h*.46, y2=h*.91, k;
  for(k=0;k<nf;k++){ campata(B,fit[k],fit[(k+1)%nf],0,y1,.3,h*.34,.2,P.travertino,true); campata(B,fit[k],fit[(k+1)%nf],y1,y2,.28,h*.3,.2,P.travertino,true); }
  B.striscia(amb,0,amb,h,P.travertino).striscia(est,y1,amb,y1,P.travertino).striscia(est,y2,amb,y2,P.travertino);
  B.striscia(est,y2,est,h,P.travertino).striscia(est,h,cima,h,P.travertino).striscia(cima,h,cima,h-.25,P.travertino)
   .striscia(cima,h-.25,mez,h*.55,P.tufo).striscia(mez,h*.55,mez,h*.55-.3,P.travertino)
   .striscia(mez,h*.55-.3,pod,.45,P.tufo).striscia(pod,.45,pod,.12,P.travertino).striscia(pod,.12,cen,.12,P.sabbia);
  [h*.46,h*.91].forEach(function(y){ B.striscia(fas,y,fas,y+.09,P.marmo).striscia(fas,y+.09,est,y+.09,P.marmo); });
  [-1,1].forEach(function(q){ var z=q*(W/2+.22);                                                    // gli avancorpi degli ingressi sui lati lunghi
    B.scatola(2,h*.5,.44,xm,0,z,P.travertino).scatola(2.1,.1,.54,xm,h*.5,z,P.marmo).vano(xm,0,z+q*.24,1,0,.8,h*.4).colonne(xm-.75,z+q*.3,xm+.75,z+q*.3,2,h*.46,.07,0); });
  B.scatola(.44,h*.5,2,L/2+.22,0,0,P.travertino).scatola(.54,.1,2.1,L/2+.22,h*.5,0,P.marmo).vano(L/2+.46,0,0,0,1,.8,h*.4).colonne(L/2+.52,-.75,L/2+.52,.75,2,h*.46,.07,0);      // l'ingresso sulla curva
}
/* San Pietro di Costantino: cinque navate con i tetti a scalare, transetto continuo più basso della navata, abside a ovest (-x), quadriportico con la fontana a est.
   Misure: circa 110 m dalla facciata all'abside, 64 di larghezza, transetto di 90, navata alta poco più di 30 (pianta di Alfarano e scavi; le altezze sono indicative). */
function sanPietro(B){
  var Ln=9.7, xn=.9, xf=5.78;
  B.scatola(Ln,3.3,2.4,xn,0,0,P.mattone).falde(Ln,.75,2.6,xn,3.3,0,P.coppi,0,P.mattone);
  B.aperture(xn-Ln/2+.3,1.2,xn+Ln/2-.3,1.2,11,2.4,.6,.3).aperture(xn+Ln/2-.3,-1.2,xn-Ln/2+.3,-1.2,11,2.4,.6,.3);          // undici finestre per lato sopra i tetti delle navatelle
  [-1,1].forEach(function(k){
    B.scatola(Ln,2.05,1,xn,0,k*1.7,P.mattone).scatola(Ln+.06,.12,1.04,xn,2.05,k*1.7,P.coppi);                            // navatelle interne
    B.scatola(Ln,1.4,1,xn,0,k*2.7,P.mattone).scatola(Ln+.06,.12,1.06,xn,1.4,k*2.7,P.coppi);                              // navatelle esterne, più basse
  });
  B.aperture(xn-Ln/2+.3,3.2,xn+Ln/2-.3,3.2,11,.65,.45,.26).aperture(xn+Ln/2-.3,-3.2,xn-Ln/2+.3,-3.2,11,.65,.45,.26);
  B.scatola(1.8,3,9,-4.85,0,0,P.mattone).falde(9,.7,2,-4.85,3,0,P.coppi,PI/2,P.mattone);                                  // il transetto
  B.aperture(-5.75,1.2,-5.75,4.2,3,1.9,.6,.3).aperture(-5.75,-4.2,-5.75,-1.2,3,1.9,.6,.3).aperture(-5.6,4.5,-4.1,4.5,2,1.9,.6,.3).aperture(-4.1,-4.5,-5.6,-4.5,2,1.9,.6,.3);
  B.cilindro(.9,2.4,-5.75,0,0,P.mattone,null,14).cono(.95,.6,-5.75,2.4,0,P.coppi,14);                                    // l'abside, sopra la tomba
  B.vano(xf,0,0,0,1,.5,1.05,true); [-1,1].forEach(function(k){ B.vano(xf,0,k*.8,0,1,.34,.85,true).vano(xf,0,k*2.2,0,1,.34,.8,true); });      // le cinque porte
  [1.75,2.55].forEach(function(y){ [-.75,0,.75].forEach(function(z){ B.vano(xf,y,z,0,1,.38,.55); }); });                // due file di tre finestre in facciata
  portico(B,5.28,6.2,8.39,0,0,1.1); B.scatola(5.28,1.45,.14,8.39,0,3.1,P.tufo);                                          // il quadriportico
  B.cilindro(.36,.16,8.39,.1,0,P.acqua,null,10).colonne(8.11,-.28,8.67,-.28,2,.7,.04,.1).colonne(8.11,.28,8.67,.28,2,.7,.04,.1).scatola(.78,.08,.78,8.39,.8,0,P.bronzo).cono(.5,.28,8.39,.88,0,P.bronzo,4);      // la fontana sotto il baldacchino di bronzo
  B.scatola(.7,1.7,3.4,11.35,0,0,P.mattone).scatola(.8,.12,3.5,11.35,1.7,0,P.coppi); [-1,0,1].forEach(function(z){ B.vano(11.73,0,z,0,1,.5,1); });      // l'ingresso a tre fornici
  for(var g=0;g<3;g++) B.scatola(.3,.3-.1*g,5.4,11.87+.3*g,0,0,P.travertino);                                            // la gradinata
}
/* Le tegole di bronzo di Onorio I (625-638): «cooperuit ecclesiam omnem ex tegulis aereis quas levavit de templo qui appellatur Romae» (Liber Pontificalis, Onorio I, Duchesne I p. 323).
   Uno strato sottile sopra i tetti di sanPietro, con le stesse misure: compare dal 630 come monumento a parte (tegolepietro). Hanno lo stesso colore dorato che avevano
   sul tempio di Venere e Roma: sono le stesse tegole (23 novembre 2026; prima erano verdi). */
function tegolePietro(B){
  var Ln=9.7, xn=.9, e=.025;
  B.falde(Ln+.04,.75,2.6+.04,xn,3.3+e,0,P.oro,0,P.mattone);
  [-1,1].forEach(function(k){ B.scatola(Ln+.08,.03,1.06,xn,2.17,k*1.7,P.oro).scatola(Ln+.08,.03,1.08,xn,1.52,k*2.7,P.oro); });
  B.falde(9+.04,.7,2+.04,-4.85,3+e,0,P.oro,PI/2,P.mattone).cono(.97,.6,-5.75,2.4+e,0,P.oro,14);
}

/* complessi su terreno in pendenza: ogni corpo poggia alla quota del suo punto */
function quota(x,z){ return Math.min(RM.h(x,z),RM.h(x+5,z),RM.h(x-5,z),RM.h(x,z+5),RM.h(x,z-5))-.1; }
function suTerreno(X,Z,ry){ var q=quota(X,Z), c=Math.cos(ry||0), s=Math.sin(ry||0); return function(lx,lz){ return RM.h(X+lx*c+lz*s,Z-lx*s+lz*c)-q; }; }
/* Statue a tutto tondo (23 novembre 2026; prima erano blocchi, e da vicino il Colosso sembrava un giocattolo). Un arto è un tronco di cono fra due punti qualsiasi, con una sfera
   al giunto d'arrivo; un uomo in piedi e un cavallo col muso verso +z si fanno con quelli. s=1 è la grandezza naturale (cavallo lungo 2,2 m, uomo alto 1,85). Le pose sono indicative. */
var SU=new THREE.Vector3(0,1,0);
function arto(B,a,b,r0,r1,col,lati,giunto){
  var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,lati||7,1);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(SU,d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); B.geo(g,col);
  if(giunto!==false) B.geo(new THREE.SphereGeometry(r1*1.03,lati||7,5).translate(b[0],b[1],b[2]),col);
  return B;
}
/* Una pelle liscia tesa su una fila di anelli ovali [x, y, z, raggio di lato, raggio in profondità]: ogni anello sta di traverso alla linea che unisce i centri, così la stessa
   funzione fa un torso, una gamba o un braccio piegato. Le normali sono quelle dei vertici, quindi la superficie non mostra spigoli: serve per le statue grandi (il Colosso).
   opz.sudd: fra un anello e l'altro se ne mettono altri, su una curva morbida (Catmull-Rom); opz.muscoli: rigonfiamenti (o solchi, con h negativo) sulla pelle, ciascuno
   {t: dove lungo la fila, in numero d'anello (2.5 = a metà fra il terzo e il quarto); wt: quanto è lungo, in anelli; dir: verso che parte guarda, nel mondo; wa: quanto è largo, in
   radianti; h: di quanto alza la pelle, in frazione del raggio}; opz.forza moltiplica tutti i rilievi; opz.patina scurisce gli incavi e schiarisce le sporgenze, come il bronzo
   vecchio, lucido dove sporge e scuro nelle pieghe: senza, su una superficie di un colore solo, in ombra i muscoli non si leggono. */
function pelle(B,anelli,col,lati,opz){
  opz=opz||{}; var n=lati||12, sudd=opz.sudd||1, mus=(opz.muscoli||[]).map(function(q){ var d=new THREE.Vector3(q.dir[0],q.dir[1],q.dir[2]).normalize(); return {t:q.t,wt:q.wt,d:d,wa:q.wa,h:q.h*(opz.forza||1)}; }), pat=opz.patina||0, tin=[];
  var fini=[], i, j, k, m0=anelli.length;
  function cr(a,b,c,d,u){ return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u); }
  for(i=0;i<m0-1;i++) for(k=0;k<sudd;k++){ var u=k/sudd, A=anelli[Math.max(0,i-1)], Bq=anelli[i], Cq=anelli[i+1], D=anelli[Math.min(m0-1,i+2)], r=[];
    for(j=0;j<5;j++){ var f=function(q){ return q[j]==null?q[3]:q[j]; }; r.push(cr(f(A),f(Bq),f(Cq),f(D),u)); } r[3]=Math.max(.0005,r[3]); r[4]=Math.max(.0005,r[4]); r.push(i+u); fini.push(r); }
  var ult=anelli[m0-1]; fini.push([ult[0],ult[1],ult[2],ult[3],ult[4]==null?ult[3]:ult[4],m0-1]);
  var m=fini.length, pos=[], idx=[], T=new THREE.Vector3(), U=new THREE.Vector3(), V=new THREE.Vector3(), X=new THREE.Vector3(1,0,0), W=new THREE.Vector3();
  for(i=0;i<m;i++){ var p=fini[i], q0=fini[Math.max(0,i-1)], q1=fini[Math.min(m-1,i+1)];
    T.set(q1[0]-q0[0],q1[1]-q0[1],q1[2]-q0[2]).normalize(); U.copy(X).addScaledVector(T,-X.dot(T)).normalize(); V.crossVectors(T,U);
    for(j=0;j<n;j++){ var an=2*Math.PI*j/n, c=Math.cos(an), d=Math.sin(an), g=1;
      if(mus.length){ W.copy(U).multiplyScalar(c).addScaledVector(V,d);
        for(k=0;k<mus.length;k++){ var mq=mus[k], dt=(p[5]-mq.t)/mq.wt; if(dt>2.6||dt<-2.6) continue; var da=Math.acos(Math.max(-1,Math.min(1,W.dot(mq.d))))/mq.wa; if(da>2.6) continue; g+=mq.h*Math.exp(-dt*dt-da*da); } }
      if(pat){ var lu=Math.max(.42,Math.min(1.2,g>1?1+pat*.45*(g-1):1+pat*2.2*(g-1))); tin.push(col.r*lu,col.g*lu,col.b*lu); }      // gli incavi scuriscono molto più di quanto le sporgenze schiariscano
      c*=p[3]*g; d*=p[4]*g; pos.push(p[0]+U.x*c+V.x*d,p[1]+U.y*c+V.y*d,p[2]+U.z*c+V.z*d); } }
  for(i=0;i<m-1;i++) for(j=0;j<n;j++){ var a0=i*n+j, a1=i*n+(j+1)%n; idx.push(a0,a1,a0+n,a1,a1+n,a0+n); }
  [0,m-1].forEach(function(kk,fine){ var ce=pos.length/3; pos.push(fini[kk][0],fini[kk][1],fini[kk][2]);      // i due capi, chiusi
    if(pat) tin.push(col.r,col.g,col.b);
    for(j=0;j<n;j++){ var x=kk*n+j, y=kk*n+(j+1)%n; if(fine) idx.push(x,y,ce); else idx.push(y,x,ce); } });
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); if(pat) geo.setAttribute('color',new THREE.Float32BufferAttribute(tin,3));
  geo.setIndex(idx); geo.computeVertexNormals(); return B.geo(geo,col);
}
function palla(B,r,x,y,z,col,sx,sy,sz,lati){ return B.geo(new THREE.SphereGeometry(r,lati||8,6).scale(sx||1,sy||1,sz||1).translate(x,y,z),col); }
function cavallo(B,x,y,z,ry,s,col){ return B.dentro(x,y,z,ry,function(){
  var u=s*.01;                                                                                                   // un centimetro di statua
  palla(B,3.6*u,0,12.3*u,0,col,.95,1,2.25,10);                                                                   // tronco
  palla(B,3.2*u,0,12.9*u,-4.6*u,col,1,1.05,1.1); palla(B,3.1*u,0,12.6*u,4.6*u,col,1,1.05,1.1);                   // groppa e petto
  arto(B,[0,13.5*u,5.5*u],[0,19.4*u,8.6*u],3*u,1.9*u,col,7);                                                     // collo
  arto(B,[0,19.6*u,8.4*u],[0,16.6*u,13*u],2*u,1.15*u,col,6);                                                     // testa, il muso in avanti e in basso
  arto(B,[0,20.6*u,8*u],[0,21.6*u,7.6*u],.5*u,.2*u,col,4,false);                                                 // orecchie, accennate
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(q,n){ var zx=q[1]*5.2*u, xx=q[0]*2.1*u, gin=zx+(q[1]<0?-.9*u:.3*u);      // zampe: una anteriore sollevata
    if(n===0){ arto(B,[xx,11*u,zx],[xx,7*u,zx+2.6*u],1.5*u,1.05*u,col,6); arto(B,[xx,7*u,zx+2.6*u],[xx,3.4*u,zx+1.2*u],1*u,.8*u,col,6); }
    else { arto(B,[xx,11*u,zx],[xx,5.6*u,gin],1.6*u,1*u,col,6); arto(B,[xx,5.6*u,gin],[xx,.2*u,zx],.95*u,.85*u,col,6,false); } });
  arto(B,[0,13.4*u,-7.6*u],[0,6.5*u,-9.6*u],1.1*u,.5*u,col,5,false);                                             // coda
}); }
function uomo(B,x,y,z,s,col,ry){ return B.dentro(x,y,z,ry||0,function(){
  var u=s*.01;
  [-1,1].forEach(function(k){ arto(B,[k*1.5*u,0,0],[k*1.7*u,9.2*u,0],.95*u,1.45*u,col,6,false); });               // gambe
  arto(B,[0,8.6*u,0],[0,12.2*u,0],2.5*u,2.2*u,col,8,false); arto(B,[0,12.2*u,0],[0,15.2*u,0],2.2*u,2.85*u,col,8,false);      // bacino e vita, torace
  palla(B,3*u,0,15.1*u,0,col,1.05,.5,.72);                                                                       // spalle
  [-1,1].forEach(function(k){ arto(B,[k*3.1*u,15*u,0],[k*3.6*u,11.4*u,.3*u],.95*u,.8*u,col,6); arto(B,[k*3.6*u,11.4*u,.3*u],[k*3.4*u,8.4*u,1.2*u],.78*u,.65*u,col,6); });   // braccia lungo i fianchi
  arto(B,[0,15.4*u,0],[0,16.6*u,0],.85*u,.8*u,col,6,false); palla(B,1.25*u,0,17.5*u,.1*u,col,1,1.15,1.08);        // collo e testa
}); }
RM.cavalloStatua=cavallo;      // per le figure delle scene (RM.figura.cavaliere in js/vita.js)
RM.pelle=pelle;      // per i protagonisti delle scene (ritratto in js/scene-tappe.js)
/* La statua equestre di Marco Aurelio (27 novembre 2026; l'utente: «La statua equestre di Marco Aurelio ponila nella zona più probabile»). Fonti in coda a src/testi/topografia-fonti.md.
   Musei Capitolini (scheda MC3247 e scheda didattica in PDF, lette quel giorno): bronzo dorato, 176-180 d.C., alta 4,24 m; la zampa anteriore destra piegata e sollevata, la sinistra
   tesa a terra, delle posteriori la sinistra più avanzata, tutte e due a terra; la testa del cavallo un poco girata a destra e piegata in basso; niente sella rigida ma strati di stoffa
   che scendono fino al basso ventre; l'imperatore con la testa girata verso il braccio destro, alzato all'altezza della spalla con le dita aperte; il sinistro piegato in basso teneva
   le redini, perdute; barba e capelli folti e ricci; tunica corta a mezze maniche con la cintura, mantello fermato sulla spalla destra che ricade sul petto e scende lungo la schiena
   sul dorso del cavallo, dai due lati; calzari, non stivali. Lunga 3,87 m dalla coda al muso (it.wikipedia, da Argan 1989). Forme e pose guardando due fotografie di Wikimedia
   Commons, il 27 novembre 2026: «Rome Capitoline Marcus Aurelius statue original.jpg» (l'originale, da vicino) e «Equestrian statue of Marcus Aurelius, Rome.jpg» (la copia in piazza).
   Le misure qui sotto sono quelle di un cavallo e di un uomo veri, in metri; F le porta a 1,6 volte, che dà la lunghezza e l'altezza della fonte. Il basamento è uno schema: quello
   antico non si conosce (l'ovale di oggi è di Michelangelo). Il cavallo guarda +z; la sua destra è -x. Circa 8.700 triangoli col basamento. */
function marcoAurelio(B){
  var B0=B, BR=P.bronzo, F=.16, Y0=.2, k;
  B=Object.create(B0); B.geo=function(g,c){      // tutto dello stesso bronzo dorato, ma col tipo delle statue (P.statua: niente conci, crepe né crolli)
    if(!g.attributes.color){ var n=g.attributes.position.count, a=new Float32Array(n*3); for(var i=0;i<n;i++){ a[i*3]=BR.r; a[i*3+1]=BR.g; a[i*3+2]=BR.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); }
    return B0.geo.call(this,g,P.statua); };
  function f(l){ return l.map(function(q){ return [q[0]*F,q[1]*F+Y0,q[2]*F,q[3]*F,(q[4]==null?q[3]:q[4])*F]; }); }
  function p(x,y,z){ return [x*F,y*F+Y0,z*F]; }
  function pz(r,x,y,z,sx,sy,sz,lati){ return palla(B,r*F,x*F,y*F+Y0,z*F,BR,sx,sy,sz,lati||6); }
  function dito(l,r){ for(var q=0;q<l.length-1;q++) arto(B,p(l[q][0],l[q][1],l[q][2]),p(l[q+1][0],l[q+1][1],l[q+1][2]),r*F*(1-.15*q),r*F*(1-.15*(q+1)),BR,5,false); }
  function solchi(t0,t1,passo,dir,wa,h){ var o=[]; for(var t=t0;t<=t1;t+=passo) o.push({t:t,wt:passo*.4,dir:dir,wa:wa,h:h}); return o; }      // pieghe o ciocche di traverso
  B0.scatola(.27,Y0-.02,.5,0,0,-.01,P.marmo).scatola(.3,.025,.53,0,Y0-.025,-.01,P.marmo).scatola(.3,.025,.53,0,0,-.01,P.marmo);      // il basamento (schema: 2 m, di marmo), con la cornice in alto e lo zoccolo
  /* il corpo del cavallo: massiccio, la groppa tonda, il petto largo */
  var MC=[{t:3.5,wt:4,dir:[0,1,0],wa:.22,h:-.035}];      // il solco della schiena
  [-1,1].forEach(function(q){ MC.push({t:1.9,wt:.9,dir:[q,.35,-.2],wa:.55,h:.09},{t:6.1,wt:.8,dir:[q,.25,.3],wa:.55,h:.1},{t:5.3,wt:.35,dir:[q,-.1,0],wa:.5,h:-.05},{t:4,wt:1.6,dir:[q*.6,-.8,0],wa:.4,h:.05}); });      // le cosce, le spalle col loro margine, il ventre
  pelle(B,f([[0,1.2,-.99,.05,.06],[0,1.21,-.91,.2,.24],[0,1.18,-.72,.29,.34],[0,1.15,-.45,.31,.37],[0,1.12,-.12,.3,.38],[0,1.13,.2,.305,.39],[0,1.18,.48,.31,.4],[0,1.22,.7,.25,.33],[0,1.26,.83,.1,.16]]),BR,20,{sudd:2,patina:2.2,muscoli:MC});
  /* il collo arcuato e grosso, con la criniera a ciocche sulla cresta */
  var MN=[{t:1.6,wt:2.2,dir:[0,.6,-.8],wa:.5,h:.14}]; for(k=0;k<7;k++) MN.push({t:.5+k*.45,wt:.18,dir:[0,.6,-.8],wa:.7,h:-.07});
  pelle(B,f([[0,1.3,.46,.22,.31],[0,1.48,.56,.23,.31],[0,1.7,.64,.21,.27],[0,1.88,.7,.175,.22],[-.01,2.0,.74,.14,.17]]),BR,16,{sudd:2,patina:2.2,muscoli:MN});
  /* la testa: un poco girata a destra (-x) e piegata in basso; la bardatura a doppie cinghie (solchi tutt'attorno) */
  pelle(B,f([[-.01,2.07,.74,.13,.17],[-.03,1.94,.83,.125,.17],[-.05,1.81,.9,.105,.145],[-.065,1.69,.95,.09,.12],[-.075,1.6,.98,.085,.105],[-.08,1.54,.99,.04,.05]]),BR,14,{sudd:2,patina:2,
    muscoli:[{t:1.2,wt:.12,dir:[0,1,0],wa:3,h:-.06},{t:1.45,wt:.12,dir:[0,1,0],wa:3,h:-.06},{t:3.3,wt:.12,dir:[0,1,0],wa:3,h:-.07},{t:.9,wt:.4,dir:[-1,0,0],wa:.5,h:.08},{t:.9,wt:.4,dir:[1,0,0],wa:.5,h:.08}]});
  [-1,1].forEach(function(q){ pz(.034,-.035+q*.12,1.95,.86,.7,1,1.1); arto(B,p(-.01+q*.06,2.1,.73),p(-.01+q*.09,2.29,.68),.038*F,.008*F,BR,5,false); pz(.025,-.075+q*.05,1.58,1.0,1,.8,.8); });      // gli occhi, le orecchie, le narici
  pz(.055,-.015,2.15,.77,1,1.4,.9);                                                                                  // il ciuffo sulla fronte, alzato fra le orecchie
  /* le zampe: anteriore sinistra tesa a terra, anteriore destra piegata e alzata; posteriori a terra, la sinistra più avanti */
  function zampa(l){ pelle(B,f(l.map(function(q){ return [q[0],q[1],q[2],q[3]*1.18,(q[4]==null?q[3]:q[4])*1.18]; })),BR,10,{sudd:2,patina:1.6}); }      // zampe robuste, come nella statua
  zampa([[.17,1.03,.58,.11,.14],[.17,.8,.6,.085,.1],[.17,.56,.61,.07],[.17,.46,.61,.052],[.17,.22,.62,.042],[.17,.13,.63,.055],[.17,.04,.66,.06,.07],[.17,0,.67,.064]]);
  zampa([[-.17,1.03,.62,.11,.14],[-.17,.86,.78,.088,.1],[-.17,.74,.92,.07],[-.17,.69,.97,.06],[-.17,.56,.92,.043],[-.17,.4,.85,.042],[-.17,.33,.8,.055],[-.17,.27,.72,.06,.07],[-.17,.25,.69,.05]]);
  [[-1,0],[1,.12]].forEach(function(q){ var x=q[0]*.17, dz=q[1];
    zampa([[x,1.06,-.58+dz*.5,.13,.17],[x,.8,-.52+dz*.6,.1,.12],[x,.58,-.74+dz,.07,.08],[x,.5,-.8+dz,.062],[x,.3,-.76+dz,.044],[x,.13,-.72+dz,.04],[x,.07,-.7+dz,.055],[x,.02,-.67+dz,.06,.07],[x,0,-.66+dz,.064]]); });
  pelle(B,f([[0,1.25,-.93,.07,.08],[0,1.12,-1.05,.09,.1],[0,.88,-1.12,.1,.09],[0,.62,-1.1,.08,.06],[0,.45,-1.06,.035]]),BR,10,{sudd:2,patina:2,muscoli:solchi(.3,4,.35,[0,0,-1],.5,-.12)});      // la coda, a ciocche
  /* la gualdrappa: strati di stoffa sul dorso che scendono fino al basso ventre, con l'orlo a frange (solchi) */
  pelle(B,f([[0,1.1,-.3,.25,.25],[0,1.21,-.25,.318,.33],[0,1.22,.08,.318,.34],[0,1.24,.36,.315,.325],[0,1.13,.42,.27,.27]]),BR,24,{sudd:2,patina:2,muscoli:[-1,1].map(function(q){ return {t:2,wt:3,dir:[q,-.75,0],wa:.25,h:.04}; })});
  /* il cavaliere: senza staffe, le gambe lungo i fianchi; tunica corta con la cintura */
  pelle(B,f([[0,1.55,.1,.18,.14],[0,1.67,.1,.22,.165],[0,1.82,.12,.21,.145],[0,1.98,.13,.235,.15],[0,2.1,.13,.245,.14],[0,2.19,.13,.15,.105]]),BR,16,{sudd:2,patina:2.4,
    muscoli:[{t:1.95,wt:.2,dir:[0,0,1],wa:3,h:.06},{t:2.2,wt:.12,dir:[0,0,1],wa:3,h:-.05}].concat(solchi(.4,4.4,.4,[0,0,1],.35,-.05))});      // la cintura annodata e le pieghe della tunica
  [-1,1].forEach(function(q){
    pelle(B,f([[q*.1,1.63,.08,.11],[q*.2,1.55,.18,.105,.1],[q*.31,1.4,.3,.085]]),BR,10,{sudd:2,patina:2,muscoli:solchi(.5,2,.5,[0,1,0],.6,-.08)});      // la coscia, con l'orlo della tunica
    pz(.08,q*.31,1.4,.3,1,1,1,8);                                                                                   // il ginocchio
    pelle(B,f([[q*.31,1.4,.3,.07],[q*.33,1.2,.25,.06],[q*.335,1.02,.19,.042],[q*.335,.96,.21,.046,.04],[q*.335,.92,.31,.035,.025]]),BR,10,{sudd:2,patina:1.6});      // la gamba e il piede coi calzari, che pende lungo il fianco
  });
  arto(B,p(0,2.17,.13),p(-.01,2.3,.15),.06*F,.055*F,BR,8,false);                                                    // il collo
  /* la testa, girata verso il braccio alzato: il volto; la barba folta che scende oltre il mento; i capelli ricci a ciocche tonde */
  var MT=[{t:2.6,wt:.4,dir:[-.25,0,1],wa:.7,h:.08}]; [-1,1].forEach(function(q){ MT.push({t:2.3,wt:.25,dir:[-.25+q*.4,0,.9],wa:.25,h:-.12}); });
  pelle(B,f([[-.02,2.24,.15,.06],[-.02,2.27,.155,.088,.095],[-.02,2.34,.15,.1,.11],[-.02,2.42,.145,.1,.11],[-.02,2.48,.14,.08,.09],[-.02,2.51,.14,.03]]),BR,18,{sudd:3,patina:2,muscoli:MT});
  pelle(B,f([[-.05,2.36,.24,.012,.01],[-.055,2.34,.265,.02,.02],[-.058,2.32,.27,.018,.014]]),BR,6,{sudd:1});      // il naso
  [-1,1].forEach(function(q){ pz(.016,-.05+q*.04,2.39,.24,1,.8,.6); });                                              // gli occhi, sporgenti
  pelle(B,f([[-.035,2.17,.2,.035,.03],[-.035,2.21,.2,.075,.065],[-.03,2.27,.185,.098,.08],[-.025,2.33,.165,.1,.075],[-.02,2.37,.15,.09,.06]]),BR,16,{sudd:3,patina:3,muscoli:solchi(.6,4,.45,[0,0,1],.7,-.12)});      // la barba, che segue la mascella e scende oltre il mento
  for(k=0;k<22;k++){ var ac=k*2.39996, yc=2.42+.07*Math.sin(k*1.7)*(k%3?1:.4); if(Math.cos(ac)>-.1&&yc<2.47) continue;      // i riccioli dei capelli: sulla nuca, sulla calotta e sopra la fronte, non sulle guance (la barba ha le sue ciocche nei solchi)
    pz(.024,-.02+Math.sin(ac)*.088,yc,.14+Math.cos(ac)*.092,1,1,1); }
  pz(.085,-.02,2.48,.13,1,.5,1.05,10);                                                                               // la calotta dei capelli
  /* il braccio destro: alzato in avanti e di lato, all'altezza della spalla e un poco più su, la mano aperta con le dita non tese; la manica corta della tunica */
  pelle(B,f([[-.2,2.11,.13,.075],[-.3,2.12,.17,.072],[-.39,2.13,.21,.062]]),BR,10,{sudd:2,patina:2,muscoli:solchi(.5,1.6,.4,[0,1,0],.8,-.06)});
  pelle(B,f([[-.39,2.13,.21,.058],[-.49,2.17,.28,.05],[-.58,2.24,.36,.042],[-.63,2.3,.41,.034]]),BR,10,{sudd:2,patina:1.6});
  pelle(B,f([[-.63,2.3,.41,.032,.021],[-.645,2.35,.44,.047,.021],[-.655,2.4,.46,.044,.019]]),BR,8,{sudd:1});      // il palmo, girato in avanti
  for(k=0;k<4;k++){ var xd=-.635-(k-1.5)*.022; dito([[xd,2.41,.46],[xd-(k-1.5)*.008,2.46,.475],[xd-(k-1.5)*.012,2.5,.49]],.0115); }      // le dita, aperte e appena piegate
  dito([[-.62,2.35,.44],[-.59,2.39,.47],[-.58,2.42,.49]],.0125);                                                        // il pollice
  /* il braccio sinistro: piegato in basso, la mano chiusa a metà, col palmo in su (le redini sono perdute) */
  pelle(B,f([[.2,2.1,.12,.07],[.24,1.97,.11,.065],[.27,1.84,.1,.055]]),BR,10,{sudd:2,patina:2});
  pelle(B,f([[.27,1.84,.1,.05],[.25,1.79,.22,.045],[.21,1.75,.35,.035]]),BR,10,{sudd:2,patina:1.6});
  pz(.04,.2,1.75,.39,1,.7,1.2);                                                                                       // la mano
  /* il mantello: fermato sulla spalla destra, ricade sul petto in un rotolo morbido; dietro scende lungo la schiena e si posa sul dorso del cavallo, dai due lati */
  pelle(B,f([[-.21,2.15,.16,.04],[-.12,2.08,.27,.05],[0,1.99,.29,.052],[.12,1.97,.26,.05],[.2,2.03,.18,.045],[.22,2.12,.08,.04]]),BR,10,{sudd:3,patina:2.6,muscoli:solchi(.5,4.5,.5,[0,1,0],.9,-.12)});
  pz(.035,-.2,2.15,.15,1,1,1,8);                                                                                      // la fibbia sulla spalla destra
  pelle(B,f([[0,2.14,.04,.17,.05],[0,1.97,-.01,.23,.06],[0,1.77,-.04,.25,.065],[0,1.62,-.08,.26,.06],[0,1.54,-.1,.2,.04]]),BR,14,{sudd:2,patina:2.6,muscoli:[-3,-1.5,0,1.5,3].map(function(q){ return {t:2,wt:3,dir:[q*.18,0,-1],wa:.12,h:-.25}; })});
  pelle(B,f([[0,1.3,-.15,.14,.12],[0,1.29,-.24,.31,.23],[0,1.29,-.45,.322,.235],[0,1.27,-.62,.31,.22],[0,1.25,-.7,.14,.1]]),BR,18,{sudd:2,patina:2.6,muscoli:[-.6,-.35,-.12,.12,.35,.6].map(function(q){ return {t:2,wt:2.5,dir:[q,.3,0],wa:.18,h:-.12}; })});      // sul dorso del cavallo, con le pieghe che scendono
}
/* La Pigna di bronzo (27 novembre 2026; l'utente: «Anche la pigna»). Musei Vaticani (pagina del restauro del 2020): fatta fra il I e il II secolo d.C. da Publius Cincius Salvius,
   «doveva ornare un monumento pubblico della Roma antica, forse nel Campo Marzio»; alta quasi 4 m (en.wikipedia, «Fontana della Pigna», dalla pagina storica del Vaticano), un
   tempo gettava acqua dalla cima. Forma guardando la fotografia di Wikimedia Commons «Rome - Pine cone.jpg» (27 novembre 2026): un ovale appuntito in alto, largo poco più di metà
   dell'altezza, con le squame a file sfalsate, ognuna gonfia e appuntita in basso. Qui alta 3,9 m e larga 2,3 (la larghezza dalla fotografia). Le squame sono rigonfiamenti della
   stessa pelle. h0: dove poggia, in unità. Circa 8.600 triangoli con la base. */
function pigna(B,h0){
  var B0=B, BR=P.bronzo, k, j, mus=[];
  B=Object.create(B0); B.geo=function(g,c){ return B0.geo.call(this,g,P.statua); };      // il colore viene dalla patina della pelle; il tipo è quello delle statue
  for(k=0;k<15;k++) for(j=0;j<13;j++){ var t=.6+k*.6, a=(j+(k%2)*.5)/13*2*Math.PI, a2=a+Math.PI/13;      // quindici file di squame, tredici per fila, sfalsate
    mus.push({t:t,wt:.24,dir:[Math.cos(a),-.3,Math.sin(a)],wa:.13,h:.17},{t:t-.3,wt:.14,dir:[Math.cos(a),0,Math.sin(a)],wa:.2,h:-.1},{t:t,wt:.3,dir:[Math.cos(a2),0,Math.sin(a2)],wa:.07,h:-.08}); }      // la squama, gonfia in basso, il solco sotto e quello fra due squame
  pelle(B,[[0,h0,0,.035],[0,h0+.03,0,.08],[0,h0+.08,0,.105],[0,h0+.14,0,.115],[0,h0+.2,0,.113],[0,h0+.26,0,.1],[0,h0+.31,0,.08],[0,h0+.35,0,.055],[0,h0+.375,0,.03],[0,h0+.39,0,.006]],BR,78,{sudd:6,muscoli:mus,patina:2});
}
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
function curiaAula(B,tetto,corpo){      // l'aula della Curia: corpo intonacato (o di mattoni, corpo), frontone, tre finestre, porta con i battenti di bronzo
  B.scatola(1.9,2.4,2.7,0,0,0,corpo||P.intonaco).falde(2.7,.6,2,0,2.4,0,tetto,PI/2,corpo||P.intonaco);
  B.vano(0,.25,1.37,1,0,.46,1.05,true).aperture(-.72,1.37,.72,1.37,3,1.55,.42,.2);
  B.scatola(.2,1.02,.03,-.11,.25,1.355,P.bronzo).scatola(.2,1.02,.03,.11,.25,1.355,P.bronzo);      // i due battenti, appena dentro il vano
}
function inForo(B,x,z,ry,fn){ var p=LF(x,z); return B.dentro(p[0],0,p[1],ry||0,fn); }
/* Monte Testaccio: il piede del monte com'è oggi, cioè il recinto del Parco Testaccio, «Monte de' Cocci» (OpenStreetMap, way 190994645; scaricato il 25 novembre 2026 con
   src/roma/grezzi/q15.txt, risultato in osm-testaccio.json), sfoltito a 12 punti (tolti i denti del recinto, sotto i 7 m), in coordinate relative al centro (-83.3,184.4).
   Prima si usava l'area archeologica (way 23921018: 4,3 ettari, 830 m di giro), che comprende anche le strade e le cantine attorno al monte. Arrotondato nel blocco del
   testaccio fa 2,75 ettari e 675 m di giro: più delle fonti (circa 2 ettari, 22.000 m² per il CEIPAC) e meno del «chilometro» di giro di Remesal e di Platner e Ashby;
   i due numeri delle fonti non stanno insieme (un triangolo di 2 ettari ha circa 650 m di giro). Forma triangolare come nella pianta a curve di livello di Remesal (p. 138). */
var TESTACCIO=[[-9.4,-2.1],[-8,-6.6],[1.7,-11.8],[2.6,-13.2],[3.7,-13],[5.5,-8.4],[6.2,.6],[8,6.8],[6.5,12],[3.6,14],[2.1,10.7],[-8.6,2.9]];
/* ---------- aiuti per i monumenti dell'inventario del 22 novembre 2026 (quelli che mancavano) ---------- */
function piede(x,z,r){ r=r||.8; return Math.min(RM.h(x,z),RM.h(x+r,z),RM.h(x-r,z),RM.h(x,z+r),RM.h(x,z-r)); }
/* un pezzo di un gruppo che segue il pendio (PENDIO): (X,Z) è l'origine della voce, (x,z) il punto reale in coordinate di scena, r il raggio dell'impronta */
function luogo(B,X,Z,x,z,ry,r,fn){ return B.dentro(x-X,piede(x,z,r)-quota(X,Z)-.05,z-Z,ry||0,fn); }
/* un tratto di mura serviane a rudere (27 novembre 2026, voci 'servianetermini' e 'servianeaventino'): (X,Z) l'origine della voce, linee le linee di mezzo [[a,b],…] in coordinate
   di scena, ciascuna divisa in pezzi di circa 7 m che seguono il terreno, con la cresta di altezza diversa (fra hMin e hMax, più bassa ai capi) e qualche blocco caduto al piede.
   Spessore 3 m e altezze: schema. Il seme fa sì che ogni tratto abbia il suo profilo. */
function muroServiano(B,X,Z,linee,seme,hMin,hMax){
  var rnd=RM.casuale(seme), q0=quota(X,Z);
  linee.forEach(function(l){ var a=l[0], b=l[1], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), ang=Math.atan2(-dz,dx), n=Math.max(2,Math.round(L/.7)), k;
    for(k=0;k<n;k++){ var t=(k+.5)/n, mx=a[0]+dx*t, mz=a[1]+dz*t, yb=piede(mx,mz,.3)-q0-.05, h=hMin+(hMax-hMin)*(.35+.65*rnd())*(k===0||k===n-1?.55:1);
      B.scatola(L/n+.02,h+.1,.3,mx-X,yb-.1,mz-Z,P.tufo,ang);                                                               // un tratto di filari, con la cresta che sale e scende
      if(rnd()<.45) B.scatola(.12,.06,.09,mx-X+(rnd()-.5)*.3-Math.sin(ang)*.3,yb,mz-Z-Math.cos(ang)*.3+(rnd()-.5)*.2,P.tufo,rnd()*3); }      // un blocco caduto al piede
  });
}
/* obelisco a sezione quadrata: alto h con la cuspide (un decimo dell'altezza), lato alla base l (se manca, un decimo di h), su un basamento alto hb e largo lb */
function obelisco(B,h,l,hb,x,z,lb,cb){
  l=l||h*.1; var r=l/Math.SQRT2, hc=h*.1;
  if(hb>0) B.scatola(lb||l*1.5,hb,lb||l*1.5,x,0,z,cb||P.marmo);
  B.dentro(x,hb||0,z,PI/4,function(B){ B.cilindro(r,h-hc,0,0,0,P.granito,r*.68,4).cilindro(r*.68,hc,0,h-hc,0,P.granito,0,4); });
}
/* tempio piccolo (B.tempio aggiunge 5 m di podio per lato): podio w x d alto hp, colonne alte hc, nf sulla fronte; lati: periptero; fronte verso +z */
function tempietto(B,w,d,hp,hc,nf,x,z,ry,lati){
  var r=Math.min(.075,w/nf*.2), e=r*1.6, sp=(w-2*e)/(nf-1), nl=Math.max(2,Math.round((d-2*e)/sp)+1);
  return B.dentro(x,0,z,ry||0,function(B){
    B.scatola(w,hp,d,0,0,0,P.travertino).scatola(w*.7,hp*.8,.3,0,0,d/2+.15,P.travertino);                         // podio e scala sulla fronte
    B.scatola(w*(lati?.62:.86),hc,d*(lati?.62:.6),0,hp,-d*(lati?.06:.18),P.marmo);                                   // cella
    B.vano(0,hp,-d*(lati?.06:.18)+d*(lati?.31:.3)+.01,1,0,w*.18,hc*.7,true);                                       // la porta
    B.colonne(-w/2+e,d/2-e,w/2-e,d/2-e,nf,hc,r,hp);
    if(lati) B.colonne(-w/2+e,d/2-e,-w/2+e,-d/2+e,nl,hc,r,hp).colonne(w/2-e,d/2-e,w/2-e,-d/2+e,nl,hc,r,hp).colonne(-w/2+e,-d/2+e,w/2-e,-d/2+e,nf,hc,r,hp);
    else B.colonne(-w/2+e,d/2-e-sp,-w/2+e,d/2-e-sp,1,hc,r,hp).colonne(w/2-e,d/2-e-sp,w/2-e,d/2-e-sp,1,hc,r,hp);  // una colonna per lato nel pronao
    B.scatola(w,.12,d,0,hp+hc,0,P.marmo).falde(d,w*.2,w+.06,0,hp+hc+.12,0,P.coppi,PI/2,P.marmo);                // trabeazione e tetto
  });
}
/* arco a un fornice: largo w, profondo p, alto h; fornice largo f e alto hf (quadro: architrave piano); fronte verso +z */
/* Un muro attraversato da fornici veri (23 novembre 2026: prima gli archi erano toppe scure dipinte su un blocco pieno, e da vicino non ci si passava sotto con lo sguardo).
   Largo w, alto h, profondo p, la base a quota y; fornici: [[x del centro, larghezza, altezza, piatto]…], piatto = architrave dritto invece dell'arco. */
function muroForato(B,w,h,p,fornici,col,y){
  y=y||0; var N=8, P2=p/2, W2=w/2, ord=fornici.slice().sort(function(q,r){ return q[0]-r[0]; }), c=col||P.marmo;
  function arco(f){ var a=f[1]/2, hs=f[3]?f[2]:f[2]-a, l=[], k; if(f[3]) return [[f[0]-a,y+hs],[f[0]+a,y+hs]]; for(k=0;k<=N;k++){ var t=Math.PI*(1-k/N); l.push([f[0]+a*Math.cos(t),y+hs+a*Math.sin(t)]); } return l; }
  [1,-1].forEach(function(q){ var z=q*P2, xa=-W2;
    ord.forEach(function(f){ var l=arco(f), k; B.quad([xa,y,z],[l[0][0],y,z],[l[0][0],y+h,z],[xa,y+h,z],c);
      for(k=0;k<l.length-1;k++) B.quad([l[k][0],l[k][1],z],[l[k+1][0],l[k+1][1],z],[l[k+1][0],y+h,z],[l[k][0],y+h,z],c);
      xa=l[l.length-1][0]; });
    B.quad([xa,y,z],[W2,y,z],[W2,y+h,z],[xa,y+h,z],c); });
  ord.forEach(function(f){ var l=arco(f), a=f[1]/2, k; [f[0]-a,f[0]+a].forEach(function(x,j){ var yy=l[j?l.length-1:0][1]; B.quad([x,y,P2],[x,y,-P2],[x,yy,-P2],[x,yy,P2],c); });      // i piedritti
    for(k=0;k<l.length-1;k++) B.quad([l[k][0],l[k][1],P2],[l[k+1][0],l[k+1][1],P2],[l[k+1][0],l[k+1][1],-P2],[l[k][0],l[k][1],-P2],c); });                                      // l'intradosso
  B.quad([-W2,y,P2],[-W2,y,-P2],[-W2,y+h,-P2],[-W2,y+h,P2],c).quad([W2,y,-P2],[W2,y,P2],[W2,y+h,P2],[W2,y+h,-P2],c).quad([-W2,y+h,P2],[W2,y+h,P2],[W2,y+h,-P2],[-W2,y+h,-P2],c);
  return B;
}
/* una campata d'arcata lungo un muro curvo, fra due punti del profilo: i due piedritti, l'arco, l'intradosso profondo t verso l'interno */
function campata(B,P0,P1,y0,y1,aw,ah,t,col,perp){                 // perp (27 novembre 2026): l'intradosso va perpendicolare al muro, non verso il centro (lati diritti dello stadio)
  var dx=P1[0]-P0[0], dz=P1[1]-P0[1], L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L, mx=(P0[0]+P1[0])/2, mz=(P0[1]+P1[1])/2, m=Math.hypot(mx,mz)||1, nx=mx/m, nz=mz/m, a=aw/2, hs=ah-a, N=6, k, sl=L/2-a;
  if(perp){ nx=uz; nz=-ux; if(nx*mx+nz*mz<0){ nx=-nx; nz=-nz; } }
  function pt(q,yy,d){ return [P0[0]+ux*q-nx*d,yy,P0[1]+uz*q-nz*d]; }
  B.quad(pt(0,y0,0),pt(sl,y0,0),pt(sl,y1,0),pt(0,y1,0),col).quad(pt(L-sl,y0,0),pt(L,y0,0),pt(L,y1,0),pt(L-sl,y1,0),col);
  B.quad(pt(sl,y0,0),pt(sl,y0,t),pt(sl,y0+hs,t),pt(sl,y0+hs,0),col).quad(pt(L-sl,y0,t),pt(L-sl,y0,0),pt(L-sl,y0+hs,0),pt(L-sl,y0+hs,t),col);
  for(k=0;k<N;k++){ var t0=Math.PI*(1-k/N), t1=Math.PI*(1-(k+1)/N), q0=L/2+a*Math.cos(t0), q1=L/2+a*Math.cos(t1), h0=y0+hs+a*Math.sin(t0), h1=y0+hs+a*Math.sin(t1);
    B.quad(pt(q0,h0,0),pt(q1,h1,0),pt(q1,y1,0),pt(q0,y1,0),col).quad(pt(q0,h0,0),pt(q0,h0,t),pt(q1,h1,t),pt(q1,h1,0),col); }
}
/* un disco in piedi (scudo, tondo a rilievo), la faccia verso +z locale */
function disco(B,r,sp,x,y,z,ry,col){ return B.dentro(x,y,z,ry||0,function(B){ B.geo(new THREE.CylinderGeometry(r,r,sp,12).rotateX(Math.PI/2),col); }); }
function arcoUno(B,w,p,h,f,hf,x,y,z,ry,col,quadro){
  return B.dentro(x,y,z,ry||0,function(B){ muroForato(B,w,h,p,[[0,f,hf,quadro]],col||P.marmo); });
}
/* Castra Praetoria: gli spigoli sono quelli delle mura del modello (js/roma-topo.js, da OpenStreetMap): nord-ovest, nord-est, sud-est; sud-ovest ricavato; SU è dove la cinta Aureliana
   lascia il lato sud. muri = lato ovest e metà ovest del lato sud (quelli che Aureliano non usa); camere = la fila di camere lungo l'interno dei quattro lati */
var CASTRA=(function(){ var C=[179,-156.5], NO=[153.6,-170.3], NE=[189.1,-183.2], SE=[204.4,-142.7], SO=[168.9,-129.8], SU=[181.1,-132.4], S18=[198.7,-137.3], muri=[], camere=[], zone=[];
  function passi(a,b,dentro,lista,tiene){ var len=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(len/3)), mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, ix=C[0]-mx, iz=C[1]-mz, m=Math.hypot(ix,iz);
    for(var k=0;k<n;k++){ var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t+ix/m*dentro, z=a[1]+(b[1]-a[1])*t+iz/m*dentro;
      lista.push({x:x,z:z,len:len/n,ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),tiene:!!tiene}); if(k%2===0) zone.push([x-C[0],z-C[1],1.3]); } }
  passi(NO,SO,0,muri); passi(SO,SU,0,muri);
  /* 27 novembre 2026: le camere del lato sud seguono il muro vero (SE, la piega S18 e SU, gli stessi punti delle mura di js/mura.js): prima andavano diritte da SE a SO e vicino a SU
     restavano fino a 20 m staccate dal muro. «tiene»: le camere addossate ai lati entrati nelle mura di Aureliano, che restano dopo il 312 (quelle dei lati nord ed est si vedono ancora) */
  [[NO,NE,1],[NE,SE,1],[SE,S18,1],[S18,SU,1],[SU,SO,0],[SO,NO,0]].forEach(function(l){ passi(l[0],l[1],.45,camere,l[2]); });
  var t=19/Math.hypot(SO[0]-NO[0],SO[1]-NO[1]);                                                    // la porta ovest, a 190 m dal lato nord
  return {C:C, NO:NO, NE:NE, SE:SE, SO:SO, muri:muri, camere:camere, zone:zone, porta:[NO[0]+(SO[0]-NO[0])*t, NO[1]+(SO[1]-NO[1])*t], ang:Math.atan2(-(SO[1]-NO[1]),SO[0]-NO[0])}; })();
/* Castra Praetoria, dentro (27 novembre 2026; l'utente, sul campo vuoto a prato del 300: «Questo spazio in alto cosa è?»). Fonti lette, in coda a src/testi/topografia-fonti.md,
   «Castra Praetoria, dentro»: Platner e Ashby, Castra Praetoria; LTUR I (1993), 251-254, voce di E. Lissi Caronna, con la pianta di C. Buzzetti del 1975 (fig. 145).
   Misurati negli scavi (LTUR): gli otto edifici del quadrante sud-est, lunghi 76,65 m e larghi 12, a doppia fila di camere, con l'asse est-ovest (scavi 1960-66); altri con l'asse
   nord-sud a est e a ovest di quelli; le tre file di celle di Lanciani lungo viale Castro Pretorio (celle di 3,65 x 5,37 m in due file con la parete di fondo comune, asse nord-sud,
   scalette a due rampe con pianerottoli di 2,10 x 1,10 m); un horreum semisotterraneo largo 17 m, visto per 48, con le stanze aperte a nord e un ambulacro a est; nel nord
   un edificio largo 21 m con cortile e due bracci di una sola fila di camere, e una vasca lunga e stretta sul lato est; la stanza dell'altare di Fortuna Restitutrix, a est della
   porta nord (Platner). Le posizioni sono prese dalla pianta di Buzzetti (n = metri dal lato nord, e = metri dal lato est). Lungo il lato nord le file di edifici sono
   tratteggiate nella pianta: qui le teniamo, come schema. SCHEMA, detto nella scheda: altezze e tetti (due piani, coppi), le file aggiunte per riempire i quadranti dove gli scavi
   non dicono nulla, le vie (via principalis da nord a sud e porta praetoria a ovest secondo Richmond, in Platner), principia, armeria e tempietto di Marte: le fonti li nominano
   (iscrizioni, Tacito) ma non dicono dove stavano. */
var CASTRA_DENTRO=(function(){ var NO=CASTRA.NO, NE=CASTRA.NE, SE=CASTRA.SE, SO=CASTRA.SO;
  function campo(n,e){ var fu=(380-e)/380, fv=n/440, a=[NO[0]+(NE[0]-NO[0])*fu, NO[1]+(NE[1]-NO[1])*fu], b=[SO[0]+(SE[0]-SO[0])*fu, SO[1]+(SE[1]-SO[1])*fu]; return [a[0]+(b[0]-a[0])*fv, a[1]+(b[1]-a[1])*fv]; }
  var E=[], i;
  for(i=0;i<8;i++) E.push({n:214+i*19.3, e:123.5, L:76.65, W:12, asse:'ew', h:6, scavo:1});                                      // gli otto edifici degli scavi 1960-66
  E.push({n:247.5,e:36,L:65,W:12,asse:'ns',h:6,scavo:1},{n:320,e:36,L:65,W:12,asse:'ns',h:6,scavo:1},{n:252,e:172,L:75,W:12,asse:'ns',h:6,scavo:1});      // a est e a ovest degli otto (lunghezze: schema)
  [[140,88],[262,78],[362,60]].forEach(function(q){ E.push({n:q[0], e:295, L:q[1], W:12.7, asse:'ns', h:6.5, scale:1, scavo:1}); });      // le tre file di Lanciani (la terza, vista per 43 m, allungata: schema)
  [[140,88],[262,78],[362,60]].forEach(function(q){ [245,345].forEach(function(e){ E.push({n:q[0], e:e, L:q[1]-6, W:12.7, asse:'ns', h:6.5, scale:1}); }); });      // file parallele: schema
  [62,89,116,143,170,224].forEach(function(e){ E.push({n:43, e:e, L:50, W:13, asse:'ns', h:6}); });                               // lungo il lato nord, tratteggiate nella pianta di Buzzetti: schema
  [82,101,120,139,162].forEach(function(n){ E.push({n:n, e:83.5, L:72, W:12, asse:'ew', h:6}); });                                 // nel quadrante nord-est, come gli otto: schema
  E.push({n:95, e:26, L:58, W:21, asse:'ns', tipo:'cortile', scavo:1});                                                             // l'edificio a cortile con la vasca a est
  E.push({n:12, e:180, L:8, W:8, asse:'ew', tipo:'stanza', scavo:1});                                                              // la stanza dell'altare di Fortuna Restitutrix
  E.push({n:378, e:104, L:48, W:17, asse:'ew', tipo:'horrea', scavo:1});                                                           // l'horreum semisotterraneo (posto nel quadrante: schema)
  E.push({n:176, e:153.5, L:57, W:52, asse:'ew', tipo:'principia'}, {n:132, e:156, L:43, W:24, asse:'ew', tipo:'armeria'}, {n:104, e:156, L:9, W:14, asse:'ew', tipo:'tempietto'});      // schema
  var vie=[[[6,190],[434,190]],[[190,196],[190,374]],[[190,6],[190,125]],[[9,5],[9,40]]];                                           // [n,e]: principalis, praetoria, decumana; l'ultima, la strada basolata di 35 m di Lanciani davanti alle celle, all'angolo nord-est
  return {campo:campo, EW:Math.atan2(-(NE[1]-NO[1]),NE[0]-NO[0]), NS:CASTRA.ang, edifici:E, vie:vie}; })();
/* un tratto del muro ovest o sud-ovest (fuori = +z locale), intero o rasato (dopo il 312). Colori più scuri dei comuni: con la luce della scena il mattone chiaro e la selce
   dall'alto si leggevano come un nastro bianco */
var CORNICE_C=RM.col(0x87604a), MATT_C=RM.col(0x9c7158), RETIC_C=RM.col(0xa08b6c), CAMMINO_C=RM.col(0x857867), VIE_C=RM.col(0x8a7d6a);
function castraMuro(B,p,raso){
  if(raso){ B.scatola(p.len+.05,.08+.06*((p.x*7.1)%1+1)%1,.3,0,-.05,0,MATT_C); return; }
  B.scatola(p.len+.1,.35,.3,0,-.05,0,MATT_C).scatola(p.len+.1,.025,.34,0,.3,0,CORNICE_C).scatola(p.len+.1,.06,.06,0,.325,.12,MATT_C).scatola(p.len+.1,.035,.04,0,.325,-.13,MATT_C).scatola(p.len+.1,.005,.2,0,.325,0,CAMMINO_C);
  var n=Math.max(1,Math.round(p.len/.3)); for(var k=0;k<n;k++) B.scatola(.15,.06,.06,-p.len/2+(k+.5)*p.len/n,.385,.12,MATT_C);      // i merli, a 3 m
}
/* una fila di camere addossate al muro (dentro = +z locale): intere, o rasate (dopo il 312, sui lati che Aureliano non usa) */
function castraCamere(B,p,raso){
  if(raso){ B.scatola(p.len,.1,.4,0,-.05,0,RETIC_C); return; }
  B.scatola(p.len+.05,.33,.4,0,-.03,0,RETIC_C).scatola(p.len+.05,.02,.42,0,.3,0,CAMMINO_C);
  var n=Math.max(1,Math.round(p.len/.42)); for(var k=0;k<n;k++) B.vano(-p.len/2+(k+.5)*p.len/n,0,.204,1,0,.16,.22,true);      // una porta per cella
}
/* disegna un edificio del campo: intero (caserma) o raso alle fondamenta (dopo il 312) */
function castraEdificio(B,X,Z,o,raso){
  var p=CASTRA_DENTRO.campo(o.n,o.e), ry=o.asse==='ns'?CASTRA_DENTRO.NS:CASTRA_DENTRO.EW, L=o.L/10, W=o.W/10, h=(o.h||6)/10;
  var v=Math.abs(Math.sin(o.n*12.9898+o.e*78.233)*43758.5)%1, muro=v<.5?RETIC_C:MATT_C, t=o.tipo||'caserma';      // reticolato di tufo o mattone, alternati (schema)
  var P={coppi:RM.P.coppi, selce:VIE_C, acqua:RM.P.acqua, marmo:RM.P.marmo, travertino:RM.P.travertino, intonaco:RM.P.intonaco};      // i coppi restano P.coppi: il Costruttore riconosce il tetto dal colore (tipoDi)
  luogo(B,X,Z,p[0],p[1],ry,Math.min(L,W)/2,function(B){
    if(raso){ var hr=.05+.06*v, sp=.067;                                                                                          // muri di 67 cm (LTUR) rasati a 0,5-1,1 m
      [[0,W/2-sp/2],[0,-W/2+sp/2]].forEach(function(q,k){ var tre=L/3; for(var j=0;j<3;j++) if((j+k+Math.floor(v*7))%4!==0) B.scatola(tre-.02,hr+.1,sp,-L/2+tre*(j+.5),-.1,q[1],muro); });
      if(t==='caserma') B.scatola(L*.8,hr*.7+.1,sp,0,-.1,0,muro);                                                                 // la parete di fondo comune
      [-1,1].forEach(function(s){ B.scatola(sp,hr+.1,W,s*(L/2-sp/2),-.1,0,muro); });
      return; }
    if(t==='caserma'){
      B.scatola(L,h+.3,W,0,-.3,0,muro).falde(L+.06,W*.24,W+.1,0,h,0,P.coppi,0,muro);
      var n=Math.max(2,Math.floor(L/.432)), k;
      for(k=0;k<n;k++){ var x=-L/2+(k+.5)*L/n; B.vano(x,0,W/2+.004,1,0,.15,.22,true).vano(x,0,-W/2-.004,-1,0,.15,.22,true); if(h>.55 && k%2) B.vano(x,.36,W/2+.004,1,0,.08,.1,true); }      // una porta per cella sui due lati; al piano di sopra una finestra ogni due
      if(o.scale) for(k=3;k<n-1;k+=6){ var xs=-L/2+(k+.5)*L/n; B.scatola(.21,.3,.11,xs,0,W/2+.06,muro); }                     // le scalette, con pianerottoli di 2,10 x 1,10 m
    } else if(t==='cortile'){
      [-1,1].forEach(function(s){ B.scatola(L,.42,.5,0,-.3,s*(W/2-.25),muro).falde(L+.04,.12,.56,0,.12,s*(W/2-.25),P.coppi,0,muro); });      // i due bracci di una sola fila di camere
      B.scatola(.3,.4,W-1,L/2-.15,-.3,0,muro).scatola(.3,.4,W-1,-L/2+.15,-.3,0,muro).scatola(L-.6,.02,W-1,0,-.01,0,P.selce);
      B.scatola(L*.8,.04,.18,0,-.02,-W/2-.22,P.selce).scatola(L*.78,.03,.12,0,.0,-W/2-.22,P.acqua);                             // la vasca lunga e stretta sul lato est
    } else if(t==='stanza'){ B.scatola(L,.42,W,0,-.3,0,muro).falde(L+.04,.16,W+.06,0,.12,0,P.coppi,0,muro);
    } else if(t==='horrea'){                                                                                                        // semisotterraneo: sporge poco dal suolo
      B.scatola(L,.42,W,0,-.3,0,muro).falde(L+.04,.18,W+.06,0,.12,0,P.coppi,0,muro);
      for(var j=0;j<8;j++) B.vano(-L/2+(j+.5)*L/8,0,-W/2-.004,-1,0,.28,.09,true);                                                 // otto stanze aperte a nord
      B.scatola(.3,.38,W,L/2+.15,-.3,0,muro);                                                                                      // l'ambulacro a est
    } else if(t==='principia'){                                                                                                     // fronte verso la via principalis, a ovest (-x)
      B.scatola(L,.02,W,0,-.01,0,P.selce);
      [-1,1].forEach(function(s){ B.scatola(L,.95,.8,0,-.3,s*(W/2-.4),muro).falde(L+.04,.2,.86,0,.65,s*(W/2-.4),P.coppi,0,muro); });
      [-1,1].forEach(function(s){ B.scatola(.8,.95,1.5,-L/2+.4,-.3,s*1.05,muro).falde(1.54,.2,.86,-L/2+.4,.65,s*1.05,P.coppi,PI/2,muro); });      // fronte con l'ingresso in mezzo
      B.scatola(.8,.95,W-1.6,L/2-.4,-.3,0,muro).falde(W-1.56,.2,.86,L/2-.4,.65,0,P.coppi,PI/2,muro);
      B.scatola(1.3,1.35,1.5,L/2-.95,-.3,0,muro).falde(1.36,.32,1.56,L/2-.95,1.05,0,P.coppi,0,muro);                            // il sacello delle insegne
      B.scatola(.5,.18,.9,L/2-1.95,-.03,0,P.marmo);                                                                                  // il tribunale
    } else if(t==='armeria'){ B.scatola(L,.95,W,0,-.3,0,muro).falde(L+.06,.34,W+.1,0,.65,0,P.coppi,0,muro); B.vano(-L/2-.004,0,0,0,1,.4,.45);
    } else if(t==='tempietto'){ B.scatola(L,.38,W,0,-.3,0,P.travertino).scatola(L*.7,.5,W*.7,.05,.08,0,P.intonaco).falde(L*.74,.18,W*.74,.05,.58,0,P.coppi,0,P.intonaco); }
  });
}
/* circo Variano: asse dai carceres verso nord-nord-est (vedi la voce sessoriano); zone lungo l'asse, relative all'anfiteatro Castrense */
var VARIANO={x:277.7, z:25.3, ry:1.065};

/* ---------- elenco ---------- */
var M=[
 {id:'colosseo', nome:'Colosseo', x:57,z:26, ry:-.3, zone:[[0,0,14.5]], et:1, fa:function(B){
    /* Rifatto il 23 novembre 2026 sulla voce Amphitheatrum Flavium di Platner e Ashby. Assi di 188 e 156 m, facciata alta 48,50; «eighty arches in the lower arcade», alti 7,05 m
       e larghi 4,20, poi 6,45 e 6,40 ai due ordini di sopra; semicolonne doriche, ioniche e corinzie (qui uguali: cambia solo il capitello, che a questa scala non si vede);
       l'attico con le lesene, una finestra «between every second pair of pilasters», gli scudi di bronzo (clipea) negli altri riquadri e tre mensole per riquadro con i fori per le
       antenne del velario; «in each of the second and third arcades was a statue». Dentro: arena di 86 x 54 m, il podio «about 4 metres above the arena», il maenianum primum
       («about twenty rows»), il secundum («about sixteen»), in cima un colonnato corinzio e il maenianum summum in ligneis, con i sedili di legno. Le arcate ora sono aperte: dietro
       c'è l'ambulacro, con il secondo anello in fondo. Le file dei sedili sono la metà di quelle vere; quote dei piani, altezza del colonnato e forma del suo tetto sono indicative. */
    var n=80, nc=40, ricco=!RM.piccolo, e=RM.ellisse(9.4,7.8,n), i=RM.ellisse(8.5,6.9,n), ce, k, j, PIANI=[[.06,1.28,.705],[1.4,2.48,.645],[2.6,3.7,.64]];
    function an(rx,quanti){ return RM.ellisse(rx,rx-1.6,quanti||nc); }
    /* facciata: tre ordini di arcate aperte, cornici, attico */
    for(k=0;k<n;k++) PIANI.forEach(function(q){ campata(B,e[k],e[(k+1)%n],q[0],q[1],.42,q[2],.24,P.travertino); });
    [1.28,2.48,3.7].forEach(function(y){ var c=RM.ellisse(9.5,7.9,n); B.striscia(c,y,c,y+.12,P.marmo).striscia(c,y+.12,e,y+.12,P.marmo).striscia(e,y,c,y,P.marmo); });      // cornici, con il loro aggetto
    B.striscia(e,3.82,e,4.85,P.travertino).striscia(e,4.85,i,4.85,P.travertino).striscia(i,4.85,i,3.75,P.travertino).fornici(e,4.02,.34,.26,2,true,true);                     // l'attico e le sue finestre, una ogni due riquadri
    { var c2=RM.ellisse(9.52,7.92,n); B.striscia(c2,4.78,c2,4.87,P.marmo).striscia(c2,4.87,e,4.87,P.marmo); }                                                                // il cornicione
    e.forEach(function(p,q){ var ang=Math.atan2(p[0],p[1]);
      PIANI.forEach(function(l){ B.dentro(p[0]*1.004,l[0],p[1]*1.004,ang,function(B){ B.geo(new THREE.CylinderGeometry(.05,.056,l[1]-l[0]-.1,5,1,true,-Math.PI/2,Math.PI).translate(0,(l[1]-l[0]-.1)/2,0),P.travertino).scatola(.15,.1,.09,0,l[1]-l[0]-.1,.02,P.travertino); }); });      // semicolonne
      B.scatola(.09,1.03,.07,p[0]*1.008,3.82,p[1]*1.008,P.travertino,ang);                                                                                                  // lesene dell'attico
      var d=e[(q+1)%n], mx=(p[0]+d[0])/2, mz=(p[1]+d[1])/2, am=Math.atan2(mx,mz);
      if(q%2) disco(B,.12,.03,mx*1.004,4.2,mz*1.004,am,P.bronzo);                                                                                                           // gli scudi di bronzo, dove non c'è la finestra
      [1.4,2.6].forEach(function(y){ B.scatola(.07,.2,.05,mx*.985,y,mz*.985,P.marmo,am).scatola(.045,.05,.045,mx*.985,y+.2,mz*.985,P.marmo,am); });                        // una statua in ogni arco del secondo e del terzo ordine
      (ricco?[.25,.5,.75]:[.5]).forEach(function(f){ var x=p[0]+(d[0]-p[0])*f, z=p[1]+(d[1]-p[1])*f;
        if(ricco) B.scatola(.05,.08,.07,x*1.006,4.5,z*1.006,P.travertino,am); B.scatola(.035,.85,.035,x*.999,4.58,z*.999,P.tronco,am); }); });                              // le mensole e le antenne del velario: tre per riquadro, duecentoquaranta in tutto
    /* l'ambulacro dietro le arcate: i piani, e il secondo anello, che oggi fa da facciata sul lato sud dove l'anello esterno è caduto */
    var w=RM.ellisse(8.7,7.2,n), wc=RM.ellisse(8.74,7.24,n);
    [1.3,2.5,3.72].forEach(function(y){ B.striscia(e,y,w,y,P.travertino); });
    B.striscia(w,0,w,3.72,P.travertino).fornici(w,.22,.9,.5).fornici(w,1.45,.88,.5);
    [1.28,2.48].forEach(function(y){ B.striscia(wc,y,wc,y+.1,P.marmo); });
    /* la cavea, a file di sedili */
    var arena=an(4.3), podio=an(4.62), ce=arena.map(function(){ return [0,0]; });
    B.striscia(arena,.12,ce,.12,P.sabbia).striscia(arena,.12,arena,.52,P.marmo).striscia(arena,.52,podio,.52,P.marmo);                                                        // arena, e il podio a quattro metri
    function gradinata(r0,r1,y0,y1,file,col){ for(j=0;j<file;j++){ var ra=r0+(r1-r0)*j/file, rb=r0+(r1-r0)*(j+1)/file, ya=y0+(y1-y0)*j/file, yb=y0+(y1-y0)*(j+1)/file; B.striscia(an(ra),ya,an(ra),yb,col).striscia(an(ra),yb,an(rb),yb,col); } }
    gradinata(4.62,6.1,.52,1.75,10,P.marmo);                                                                                                                                 // maenianum primum
    B.striscia(an(6.1),1.75,an(6.1),2.05,P.travertino); gradinata(6.1,7.5,2.05,3.35,8,P.travertino);                                                                         // il muro di cintura e il maenianum secundum
    B.striscia(an(7.5),3.35,an(7.5),3.75,P.travertino).striscia(an(7.5),3.75,i.filter(function(q,z){ return z%2===0; }),3.75,P.travertino);                                   // il muro e il ripiano del colonnato
    gradinata(7.75,8.4,3.78,4.2,3,P.tronco);                                                                                                                                 // maenianum summum in ligneis: i sedili di legno
    RM.ellisse(7.62,6.02,n).forEach(function(p){ B.cilindro(.045,.82,p[0],3.75,p[1],P.granito,.04,5); });                                                                     // il colonnato in cima
    B.striscia(RM.ellisse(7.56,5.96,n),4.57,i,4.8,P.coppi).striscia(RM.ellisse(7.56,5.96,n),4.5,RM.ellisse(7.56,5.96,n),4.57,P.travertino);                                   // il suo tetto (di tegole: ipotesi)
    B.scatola(.7,.5,.7,-11.7,0,-4.65,P.marmo);                                                                   // il basamento del Colosso: «7 metres square, of brick-faced concrete, and was originally covered with marble» (Platner e Ashby, Colossus Neronis); resta fino al 1936
 }},
 /* Il Colosso: statua di bronzo di circa 35 m, sul basamento reale (OpenStreetMap, way 709011412). La figura è indicativa: stante, corona di raggi, timone nella destra e globo
    nella sinistra come sulle monete; da che parte guardasse non si sa. */
 {id:'colosso', nome:'Colosso del Sole', x:47.2,z:18.1, ry:-.3, come:'colosseo', fa:function(B){
    /* Rifatto il 23 novembre 2026 (l'utente: «Rifai il colosso?», e poi «Ancora di più»): prima a blocchi, poi a pezzi tondi incastrati che sembravano un manichino. Ora è una figura
       sola dalla pelle liscia, scolpita: nudo stante, il peso sulla gamba destra e la sinistra flessa e arretrata, come nelle statue classiche; muscoli, mani con le dita, un volto,
       i capelli a riccioli. Guardando la statua di fronte la sua destra è a -x: lì sta il timone, a terra, e nella sinistra il globo. Alta 35 m (Svetonio, nella scheda) sopra il
       basamento. Posa, anatomia e volto sono di fantasia, sul tipo delle statue di Elio: delle fonti restano l'altezza, i raggi, il timone e il globo. Tutto dello stesso bronzo. */
    var S=P.statua, k, F=3.5/3.2, Y0=.5, FR=[0,0,1], DI=[0,0,-1];
    function fila(l){ return l.map(function(q){ return [q[0]*F,q[1]*F+Y0,q[2]*F,q[3]*F,(q[4]==null?q[3]:q[4])*F]; }); }
    function pt(x,y,z){ return [x*F,y*F+Y0,z*F]; }
    function pezzo(r,x,y,z,sx,sy,sz,lati){ return palla(B,r*F,x*F,y*F+Y0,z*F,S,sx,sy,sz,lati||10); }
    function largo(l,k,kz){ return l.map(function(q,i){ return i>0&&i<l.length-1?[q[0],q[1],q[2],q[3]*k,(q[4]==null?q[3]:q[4])*(kz||1)]:q; }); }
    function dito(l,r){ for(var q=0;q<l.length-1;q++) arto(B,pt(l[q][0],l[q][1],l[q][2]),pt(l[q+1][0],l[q+1][1],l[q+1][2]),r*F*(1-.12*q),r*F*(1-.12*(q+1)),S,6); }
    /* gambe: lato = -1 la destra (portante), +1 la sinistra (scarica, ginocchio in avanti, tallone alzato) */
    function gamba(anelli,lato){ pelle(B,fila(anelli),S,16,{sudd:3,muscoli:[
      {t:1,wt:.35,dir:[lato,0,0],wa:.5,h:.2},{t:1,wt:.35,dir:[-lato,0,.1],wa:.5,h:.16},                               // i malleoli
      {t:2.9,wt:.85,dir:[lato*.25,0,-1],wa:.75,h:.2},{t:2.6,wt:.9,dir:FR,wa:.45,h:-.07},                              // polpaccio, e la tibia, piatta
      {t:5,wt:.38,dir:[0,0,1],wa:.5,h:.1},{t:5.9,wt:.55,dir:[-lato*.75,0,.65],wa:.42,h:.12},                           // rotula, vasto mediale (la goccia sopra il ginocchio)
      {t:6.9,wt:1.1,dir:[lato*.7,0,.7],wa:.5,h:.09},{t:7.3,wt:1,dir:FR,wa:.4,h:.07},{t:6.9,wt:1.1,dir:DI,wa:.6,h:.08},  // vasto laterale, retto, bicipite femorale
      {t:6.6,wt:1.2,dir:[lato*.35,0,.93],wa:.1,h:-.04}],forza:1.5,patina:2.2}); }
    gamba([[-.15,.03,.0,.05],[-.15,.16,-.01,.056,.068],[-.15,.4,-.02,.076,.084],[-.155,.62,-.03,.095,.102],[-.16,.8,-.01,.083,.088],[-.16,.92,.01,.09,.096],[-.165,1.1,.015,.11,.118],[-.17,1.35,.01,.142,.152],[-.16,1.56,0,.158,.168],[-.12,1.7,0,.15,.16]],-1);
    gamba([[.27,.07,-.17,.05],[.265,.2,-.15,.056,.068],[.25,.44,-.09,.076,.084],[.235,.64,-.03,.094,.101],[.215,.82,.06,.083,.088],[.205,.93,.105,.09,.096],[.19,1.12,.09,.11,.118],[.17,1.36,.045,.142,.152],[.15,1.56,.01,.158,.168],[.11,1.7,0,.15,.16]],1);
    pelle(B,fila([[-.15,.02,-.075,.045,.032],[-.15,.048,-.01,.06,.05],[-.152,.042,.09,.066,.04],[-.155,.03,.165,.058,.03],[-.156,.024,.2,.04,.02]]),S,10,{sudd:2});      // piede destro
    pelle(B,fila([[.28,.1,-.245,.042,.032],[.275,.075,-.175,.058,.05],[.265,.042,-.085,.064,.04],[.26,.03,-.02,.056,.03],[.258,.024,.015,.04,.02]]),S,10,{sudd:2});      // piede sinistro
    /* tronco: bacino spostato sulla gamba portante, vita, costato, petto, spalle. I muscoli sono rigonfiamenti bassi sulla stessa pelle: non pezzi aggiunti */
    var MT=[{t:6.9,wt:.3,dir:FR,wa:.09,h:-.05},{t:5,wt:1.3,dir:FR,wa:.06,h:-.045},{t:5,wt:2.6,dir:DI,wa:.09,h:-.07},{t:3.25,wt:.7,dir:FR,wa:.5,h:.03},{t:10,wt:.5,dir:FR,wa:.3,h:-.06}];      // lo sterno, la linea alba, il solco della schiena, il basso ventre, la fossetta del collo
    [-1,1].forEach(function(q){ MT.push(
      {t:6.85,wt:.75,dir:[q*.52,0,.86],wa:.46,h:.115},{t:5.95,wt:.28,dir:[q*.5,0,.87],wa:.5,h:-.035},                 // pettorale, e il suo margine di sotto
      {t:5.55,wt:.2,dir:[q*.2,0,.98],wa:.16,h:.05},{t:5.05,wt:.2,dir:[q*.2,0,.98],wa:.16,h:.055},{t:4.5,wt:.22,dir:[q*.2,0,.98],wa:.16,h:.055},      // gli addominali, tre fasce
      {t:3.55,wt:.5,dir:[q*.82,0,.57],wa:.42,h:.07},{t:2.5,wt:.45,dir:[q*.6,0,.8],wa:.25,h:-.06},                      // la cresta del fianco e il solco dell'inguine
      {t:6,wt:1.1,dir:[q,0,-.25],wa:.45,h:.07},{t:7.3,wt:.7,dir:[q*.55,0,-.84],wa:.45,h:.07},{t:4,wt:1,dir:[q*.27,0,-.96],wa:.2,h:.05},      // gran dorsale, scapola, lombari
      {t:1.75,wt:.75,dir:[q*.5,0,-.87],wa:.5,h:.26},{t:9.3,wt:.5,dir:[q*.75,0,-.4],wa:.7,h:.16},                       // gluteo, trapezio
      {t:7.7,wt:.75,dir:[q*.9,0,.44],wa:.1,h:-.05},{t:8.75,wt:.16,dir:[q*.45,0,.9],wa:.5,h:-.035},{t:8.95,wt:.14,dir:[q*.45,0,.9],wa:.45,h:.04},      // il solco fra petto e spalla, la clavicola
      {t:5.3,wt:.07,dir:[q*.2,0,.98],wa:.2,h:-.03},{t:4.78,wt:.07,dir:[q*.2,0,.98],wa:.2,h:-.03},{t:5.4,wt:.9,dir:[q*.42,0,.9],wa:.07,h:-.03},      // le pieghe fra gli addominali e il loro margine di lato
      {t:1.2,wt:.25,dir:[q*.5,0,-.87],wa:.6,h:-.05}); });                                                                 // la piega sotto il gluteo
    pelle(B,fila(largo([[-.02,1.46,0,.12,.1],[-.025,1.56,0,.25,.175],[-.03,1.72,-.01,.272,.195],[-.03,1.87,-.005,.258,.185],[-.015,2.02,.005,.24,.17],[-.005,2.2,.012,.285,.192],[0,2.36,.022,.335,.218],[.002,2.48,.02,.365,.215],[.005,2.57,.005,.37,.185],[.005,2.64,-.005,.33,.155],[.005,2.71,-.01,.16,.125],[.005,2.83,0,.098,.1]],1.09,1.04)),S,28,{sudd:3,muscoli:MT,forza:1.7,patina:2.2});
    pezzo(.034,-.02,1.5,.158,.9,1.15,.9);                                                                                                                      // il sesso, appena accennato
    /* testa: mento, mascella, zigomi, fronte, calotta */
    var MF=[{t:3.95,wt:.28,dir:FR,wa:.75,h:.07},{t:.75,wt:.5,dir:FR,wa:.4,h:.16},{t:2.3,wt:.4,dir:FR,wa:.28,h:-.04}];                                         // arcata delle sopracciglia, mento, il solco sotto il naso
    [-1,1].forEach(function(q){ MF.push({t:3.45,wt:.25,dir:[q*.36,0,.93],wa:.2,h:-.1},{t:2.8,wt:.35,dir:[q*.62,0,.78],wa:.28,h:.07},{t:1.5,wt:.5,dir:[q*.92,0,.3],wa:.4,h:.07}); });      // orbite, zigomi, angoli della mascella
    pelle(B,fila([[.005,2.812,.045,.03,.035],[.005,2.85,.035,.082,.098],[.005,2.9,.025,.106,.126],[.005,2.96,.015,.122,.146],[.005,3.04,0,.132,.16],[.005,3.12,-.01,.118,.146],[.005,3.18,-.01,.076,.096],[.005,3.205,-.01,.02,.03]]),S,22,{sudd:3,muscoli:MF,forza:1.25,patina:2});
    pelle(B,fila([[.005,3.035,.128,.013,.012],[.005,2.99,.158,.017,.015],[.005,2.958,.178,.024,.02],[.005,2.942,.158,.02,.012]]),S,8,{sudd:2});                  // il naso
    pezzo(.03,.005,2.917,.146,1.3,.3,.5); pezzo(.027,.005,2.9,.144,1.15,.34,.5);                                                                               // le labbra
    [-1,1].forEach(function(q){ pezzo(.02,.005+q*.05,3.0,.116,1.25,.62,.6,8); pezzo(.03,.005+q*.134,2.985,.01,.4,1.2,.8,8); });                                // occhi, orecchie
    (function(){ var rn=RM.casuale(35), C0=[.005,3.045,-.005], RR=[.142,.172,.168];                                                                             // i riccioli: file di ciocche tonde sulla calotta, sopra la fronte, sulla nuca
      [[16,4],[38,9],[58,13],[78,15],[98,14],[116,11]].forEach(function(f,ri){ for(var q=0;q<f[1];q++){ var az=(q+(ri%2)*.5)/f[1]*6.2832, fi=f[0]*.01745, davanti=Math.cos(az);
        if(f[0]>50 && davanti>.42) continue; if(f[0]>100 && davanti>-.35) continue;                                                                             // il volto resta libero; sulla nuca solo dietro
        pezzo(.036+.012*rn(),C0[0]+Math.sin(fi)*Math.sin(az)*RR[0],C0[1]+Math.cos(fi)*RR[1],C0[2]+Math.sin(fi)*Math.cos(az)*RR[2],1,.8,1,6); } }); })();
    /* braccio destro (a -x): scende lungo il fianco, la mano stringe l'asta del timone */
    pelle(B,fila([[-.33,2.6,0,.1,.12],[-.425,2.54,0,.125,.138],[-.46,2.36,0,.112,.122],[-.47,2.13,-.01,.09,.096],[-.475,1.98,.03,.096,.1],[-.475,1.8,.09,.076,.08],[-.475,1.67,.14,.052,.058],[-.478,1.63,.155,.045,.05]]),S,14,{sudd:3,forza:1.5,patina:2.2,muscoli:[
      {t:1,wt:.75,dir:[-1,.2,0],wa:.95,h:.17},{t:2.2,wt:.6,dir:FR,wa:.6,h:.13},{t:2.3,wt:.7,dir:DI,wa:.6,h:.1},{t:4.1,wt:.6,dir:[-.6,0,.6],wa:.7,h:.13}]});      // deltoide, bicipite, tricipite, avambraccio
    pezzo(.05,-.508,1.585,.165,.5,1.15,.95); for(k=0;k<4;k++) dito([[-.522,1.632-k*.034,.185],[-.5,1.63-k*.034,.218],[-.462,1.628-k*.034,.214],[-.442,1.63-k*.034,.185]],.019);      // il dorso della mano e le quattro dita chiuse sull'asta
    dito([[-.5,1.655,.14],[-.47,1.668,.125],[-.445,1.662,.145]],.02);                                                                                           // il pollice
    arto(B,pt(-.5,0,.26),pt(-.466,1.9,.148),.022*F,.02*F,S,8,false); pezzo(.03,-.4655,1.91,.147,1,1,1,8);                                                       // il timone: l'asta e il pomo
    B.dentro(-.5*F,Y0,.26*F,.25,function(B){ B.scatola(.17*F,.5*F,.035*F,0,.06*F,0,S).scatola(.21*F,.07*F,.04*F,0,0,0,S).geo(new THREE.CylinderGeometry(.085*F,.085*F,.035*F,12,1,false,0,Math.PI).rotateX(Math.PI/2).translate(0,.56*F,0),S); });      // la pala, poggiata a terra
    /* braccio sinistro (a +x): gomito al fianco, avambraccio in avanti, il globo sul palmo aperto */
    pelle(B,fila([[.34,2.6,0,.1,.12],[.435,2.54,0,.125,.138],[.47,2.36,.01,.112,.122],[.475,2.13,.03,.09,.096],[.458,2.07,.17,.098,.092],[.432,2.1,.33,.078,.076],[.418,2.13,.44,.054,.056],[.415,2.135,.47,.05,.04]]),S,14,{sudd:3,forza:1.5,patina:2.2,muscoli:[
      {t:1,wt:.75,dir:[1,.2,0],wa:.95,h:.17},{t:2.15,wt:.55,dir:[0,.2,1],wa:.6,h:.19},{t:2.3,wt:.7,dir:DI,wa:.6,h:.1},{t:4.3,wt:.6,dir:[.6,.6,0],wa:.7,h:.13}]});
    var GC=[.41,2.31,.52], GR=.125;
    pezzo(.062,.412,2.152,.5,1.05,.36,1.2);                                                                                                                     // il palmo
    for(k=0;k<4;k++){ var lx=(k-1.5)*.03; dito([20,45,72,98].map(function(be){ var bq=be*.01745, e=GR+.014; return [GC[0]+lx,GC[1]-Math.cos(bq)*e,GC[2]+Math.sin(bq)*e]; }),.018); }      // le dita salgono sul davanti del globo
    dito([35,62,90].map(function(be){ var bq=be*.01745, e=GR+.014; return [GC[0]+Math.sin(bq)*e,GC[1]-Math.cos(bq)*e,GC[2]-.02]; }),.02);                         // il pollice, di lato
    pezzo(GR,GC[0],GC[1],GC[2],1,1,1,18);                                                                                                                       // il globo
    /* la corona: sette raggi a ventaglio attorno al capo, fra i riccioli */
    for(k=-3;k<=3;k++) B.geo(new THREE.ConeGeometry(.024*F,.42*F,6).translate(0,.21*F,0).rotateZ(-k*.4).translate(.005*F+Math.sin(k*.4)*.15*F,3.05*F+Y0+Math.cos(k*.4)*.15*F,-.01*F),P.oro);
 }},
 /* Meta Sudans: fontana conica flavia, con la vasca di 21 m rifatta nel IV secolo. Demolita nel 1936; la posizione è quella delle coordinate correnti (41°53'24" N, 12°29'27" E),
    a nord dell'arco di Costantino: vale entro una quindicina di metri. Altezza del cono (circa 17 m) dalle ricostruzioni correnti. */
 {id:'metasudans', nome:'Meta Sudans', x:45.6,z:27.8, ry:0, come:'colosseo', fa:function(B){
    /* Rifatta il 23 novembre 2026 (Platner e Ashby, Meta Sudans): «in shape it resembled a goal in the circus (meta) and sudans described the appearance of the jets of water»;
       il nucleo conico ha 5 m di diametro alla base; «the whole structure was originally covered with marble»; attribuita a Domiziano. La grande vasca di 21 m è «probably of the
       time of Constantine»: qui compare dal 315, con l'arco (metasudansvasca); prima c'è una vasca più piccola, di misura indicativa. Zoccolo, cornice a metà, pigna in cima e
       rivoli sono come sulle monete e nelle ricostruzioni correnti: indicativi. */
    B.cilindro(.66,.16,0,0,0,P.marmo,.66,24);                                                                                                  // la vasca di prima (l'acqua, che si muove, sta più sotto: «l'acqua della Meta Sudans»)
    B.cilindro(.4,.12,0,.12,0,P.marmo,.4,20).cilindro(.36,.34,0,.24,0,P.marmo,.34,18).cilindro(.38,.05,0,.58,0,P.marmo,.38,18);                // lo zoccolo e la sua cornice
    B.geo(new THREE.LatheGeometry([[.31,0],[.295,.25],[.262,.5],[.21,.75],[.14,.98],[.085,1.12],[.07,1.16]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),18).translate(0,.63,0),P.marmo);      // il cono
    B.cilindro(.115,.045,0,1.2,0,P.marmo,.115,12).geo(new THREE.SphereGeometry(.085,10,8).scale(1,1.25,1).translate(0,1.9,0),P.marmo).cilindro(.05,.1,0,1.79,0,P.marmo,.07,8);      // una cornice a metà, la pigna in cima
 }},
 {id:'metasudansvasca', x:45.6,z:27.8, ry:0, come:'colosseo', fa:function(B){                                                                 // la vasca di 21 m, dal 315
    var e1=RM.ellisse(1.05,1.05,28), e2=RM.ellisse(.97,.97,28), e3=RM.ellisse(.67,.67,28);
    B.striscia(e1,0,e1,.2,P.marmo).striscia(e1,.2,e2,.2,P.marmo).striscia(e2,.2,e2,.1,P.marmo).striscia(e2,.1,e3,.1,P.marmo);
 }},
 {id:'circo', nome:'Circo Massimo', x:0,z:71, ry:-.651, lunga:[62,10], fermo:[[0,0,31.2,7.2]], et:1, fa:function(B){      // fermo (27 novembre 2026): il fianco del Palatino non entra più nell'arena e nelle gradinate
    circo(B,62,14,2.5,true);
    /* l'arco di Tito al centro della curva orientale (81): «replaced by a triple arch, erected by the senate in honour of Titus» (Platner e Ashby, Circus Maximus; CIL VI.944, pianta marmorea fr. 38).
       Largo circa 17 m e profondo 15, tre fornici, colonne libere alte oltre 10 m, quadriga sull'attico (scavi del 2015, da it.wikipedia «Circo Massimo»). Le altezze qui sono ipotetiche. */
    B.scatola(1.5,1.55,1.7,28.95,0,0,P.marmo).scatola(1.6,.1,1.8,28.95,1.55,0,P.marmo).scatola(1.5,.35,1.7,28.95,1.65,0,P.marmo);      // corpo, cornice, attico
    B.vano(28.175,0,0,0,1,.55,1.15).vano(28.175,0,.55,0,1,.3,.75).vano(28.175,0,-.55,0,1,.3,.75);                                     // i tre fornici, sulla fronte verso l'arena
    [-.8,-.27,.27,.8].forEach(function(z){ B.scatola(.16,.4,.16,28.12,0,z,P.marmo); }); B.colonne(28.12,-.8,28.12,.8,4,1.1,.06,.4);     // le quattro colonne libere sui loro piedistalli
    B.scatola(.5,.25,.6,28.95,2,0,P.statua);                                                                                            // la quadriga
 }},
 /* Il secondo obelisco della spina, portato da Costanzo II: «obeliscus Romae in circo erectus est maximo» (Ammiano XVII 4.1), nel 357. Alto 32,50 m, di granito rosso
    (Platner e Ashby, Obeliscus Constantii). In cima una sfera di bronzo dorato, colpita subito da un fulmine e sostituita da una fiaccola di bronzo dorato (Ammiano XVII 4.15).
    Ammiano lo dice messo «in media», ma nel mezzo della spina stava già quello di Augusto: il punto, 35 m a est di quello, è una nostra scelta. Che fosse ancora in piedi nell'852 non si sa. */
 {id:'obelisco357', nome:'Obelisco di Costanzo II', x:2.78,z:73.12, ry:-.651, come:'circo', fa:function(B){
    B.scatola(.62,.36,.62,0,.52,0,P.marmo);                                                       // il basamento, con l'iscrizione di Costanzo sui quattro lati
    B.cilindro(.2,3.25,0,.88,0,P.sabbia,.13,4).cono(.13,.25,0,4.13,0,P.sabbia,4);                   // fusto e cuspide
 }},
 /* La fiaccola di bronzo dorato in cima all'obelisco (Ammiano XVII 4.15), a parte dal 25 novembre 2026 perché possa sparire: quando sia stata tolta non si sa; nel modello
    va via nel 663 con Costante II, che porta via «omnia quae erant in aere ad ornatum civitatis» (Liber Pontificalis, vita di Vitaliano). Scelta dichiarata nella scheda. */
 {id:'fiaccola357', x:2.78,z:73.12, ry:-.651, come:'circo', fa:function(B){
    B.cilindro(.025,.2,0,4.38,0,P.oro,.05,6).cono(.06,.14,0,4.58,0,P.oro,6);                         // la fiaccola dorata
 }},
 /* Dopo le ultime corse (550) la valle non è più drenata: la pista diventa un velo di fango e pozze. Che il circo si interrasse è certo («gradually buried under waterlogged alluvial soil»,
    en.wikipedia «Circus Maximus»: oggi la pista sta circa 6 m sotto il suolo; nel 1587 gli obelischi erano a circa 7 m, Platner e Ashby). Quanto deposito ci fosse nell'852 non lo sappiamo:
    per questo il suolo non si alza, si bagna soltanto. Forma e posizione delle pozze sono di fantasia. */
 {id:'fangocirco', x:0,z:71, ry:-.651, come:'circo', fa:function(B){
    var FANGO=RM.col(0x8a7656), L=62, w=8.3, p=RM.stadio(L-(14-w),w,26,14), asse=p.map(function(q){ return [Math.max(-L/2+4,Math.min(L/2-7,q[0])),0]; }), rnd=RM.casuale(550), k;
    B.striscia(p,.135,asse,.135,FANGO);
    var POZZA=RM.col(0x5d6650);      // 27 novembre 2026: acqua ferma e torbida di palude («waterlogged»), grigio-verde come il Tevere del modello; prima l'azzurro di P.acqua, quello delle vasche
    for(k=0;k<9;k++) B.cilindro(.5+.8*rnd(),.02,-25+48*rnd(),.14,(rnd()<.5?-1:1)*(1+1.8*rnd()),POZZA,null,12);
 }},
 {id:'fori', nome:'Fori', ex:-1.5,ez:2, x:3,z:-8, ry:-.35, altoFisso:4.118, raggioFisso:25.931, zone:[[-1.2,2.5,10.5],[-11,-1.5,7],[9,6,6],[0,-13.2,9],[11.5,-19.5,8.5],[13,-6,9.5],[-1.3,-27.8,9.5],[-7.5,-36,9.5],[5,-33,6],[11.2,13.1,3.8]].map(function(q){ var p=LF(q[0],q[1]); return [p[0],p[1],q[2]]; }), et:1, fa:function(B){
    /* Il nome «Fori» sta sul centro della piazza del Foro di OpenStreetMap (relazione 1849832, «Piazza del Foro»): dal 26 novembre 2026 il gruppo disegna solo la piazza, e il nome
       stava ancora nel mezzo del vecchio gruppo, fra la Curia e il foro di Nerva (27 novembre 2026, notte) */
    /* Posizioni reali: i centri dei resti rilevati in OpenStreetMap (src/roma/grezzi/osm-foro.json), scritti qui in coordinate di scena.
       Orientamenti: il Foro Romano lungo il suo asse, i fori imperiali sulla loro griglia comune, girata di circa 58° rispetto al Foro.
       Forme e misure restano schematiche; qualche edificio è accorciato di poco perché le vie vere gli passino accanto e non sopra. */
    var IMP=1.022;
    inForo(B,-1.2,1.6,0,function(B){ B.scatola(12.5,.1,5,0,0,0,P.selce); });                                                       // piazza del Foro
    /* la basilica Giulia è un monumento a sé dal 26 novembre 2026 (id 'giulia', più sotto); l'Emilia è un edificio a sé: brucia nel 410 */
    /* la Curia è un edificio a sé (id 'curia', più sotto): fino al 630 aula del Senato, poi la chiesa di Sant'Adriano */
    /* i Rostri sono un monumento a sé dal 26 novembre 2026 (id 'rostri', più sotto) */
    /* il tempio della Concordia è un monumento a sé dal 26 novembre 2026 (id 'concordia', più sotto) */
    /* il tempio di Vespasiano e Tito è un monumento a sé dal 26 novembre 2026 (id 'vespasiano', più sotto) */
    /* la casa delle Vestali e il tempio di Vesta sono un monumento a sé dal 26 novembre 2026 (id 'vesta', più sotto) */
    /* il tempio di Saturno è un monumento a sé dal 26 novembre 2026 (id 'saturno', più sotto) */
    /* il tempio dei Castori è un monumento a sé dal 26 novembre 2026 (id 'castori', più sotto) */
    /* il tempio del Divo Giulio è un monumento a sé dal 26 novembre 2026 (id 'divogiulio', più sotto) */
    /* il tempio di Antonino e Faustina è un monumento a sé dal 26 novembre 2026 (id 'antonino', più sotto) */
    /* il Tabularium è un monumento a sé dal 26 novembre 2026 (id 'tabularium', più sotto) */
    /* l'arco di Settimio Severo è un monumento a sé dal 26 novembre 2026 (id 'arcoseveroforo', più sotto) */
    /* il foro di Cesare è un monumento a sé dal 26 novembre 2026 (id 'forocesare', più sotto) */
    /* il foro di Augusto col tempio di Marte Ultore è un monumento a sé dal 26 novembre 2026 (id 'foroaugusto', più sotto) */
    /* il foro di Nerva è un monumento a sé dal 26 novembre 2026 (id 'foronerva', più sotto) */
    /* il tempio della Pace è un monumento a sé dal 26 novembre 2026 (id 'pace', più sotto) */
    /* il foro di Traiano con la basilica Ulpia è un monumento a sé dal 26 novembre 2026 (id 'forotraiano', più sotto); così la colonna, la sua statua e i mercati */
 }},
 /* Edifici del Foro resi monumenti a sé il 26 novembre 2026 (l'utente: «sei sicuro che ci siano tutti i monumenti, tipo il tempio di Castore e Polluce?»): stesso disegno, stesso posto
    e stesso orientamento di quando stavano nel gruppo 'fori' (x, z sono il punto che il gruppo dava a inForo; ry quello del Foro, -0,35); ora hanno nome, scheda e storia propria.
    Fonti in coda a src/testi/topografia-fonti.md. */
 /* Rimisurati il 27 novembre 2026 sui contorni dei resti su OpenStreetMap (src/roma/grezzi/osm-foro-geom.json, scaricato con q16.txt; tabella in coda a src/testi/topografia-fonti.md,
    «I vicini dell'arco di Augusto e dell'arco di Tiberio»): Castori spostato di 3,4 m verso ovest (il suo asse stava 3,4 m a est della mezzeria dei due fianchi del contorno);
    Divo Giulio spostato di 6 m verso est e girato di 10 gradi sull'asse del contorno (prima stava sull'asse comune del Foro, -0,35, e sporgeva verso la piazza); il modello è largo
    29 m contro i 26 del contorno e di Platner: sta 3 m più a sud-ovest del centro del contorno, perché lo spigolo dietro non cada sulla via Sacra (e sul trionfo del 274); Saturno girato di
    74 gradi: la fronte guarda il clivo e la piazza a nord-nord-est, non a est-sud-est (il contorno, 38,7 x 26,9 m, ha il lato lungo a 125 gradi); Rostri girati di 5 gradi; la casa
    delle Vestali spostata di 8,6 m sul cortile del contorno. Forme e stati invariati. */
 {id:'castori', nome:'Tempio dei Castori', etichetta:'Castori', x:2.69,z:9.16, ry:-.35, come:'fori', zone:[], fa:function(B){
    B.tempio(2.9,4.6,1.25,0,0,PI,{fronte:8,lati:11,podio:.8});                                                                  // «octastyle and peripteral, with eleven columns on each side»; tutto il tempio «about 50 metres long by 30 wide»; colonne «12.50 metres in height» (Platner e Ashby, Aedes Castoris; 27 novembre 2026: prima erano alte 20 m)
 }},
 {id:'concordia', nome:'Tempio della Concordia', etichetta:'Concordia', x:-9.1,z:-4.9, ry:-.559, come:'fori', zone:[], fa:function(B){      // cella larga, messa di traverso, e pronao verso il Foro: «the cella … was 45 metres wide and only 24 deep, while the pronaos was only 34 metres wide and 14 deep» (Platner e Ashby, Concordia); 27 novembre 2026 (notte): girato di 12 gradi sul contorno di OpenStreetMap (relazione 1767601: centro -9,01, -4,93, come il modello; lati a 32 gradi, il modello a 20)
    B.scatola(2,1.7,4.4,-.6,.5,0,P.marmo).falde(4.4,.5,2.1,-.6,2.2,0,P.coppi,PI/2,P.marmo).scatola(2.2,.5,4.5,-.6,0,0,P.travertino); B.tempio(2.2,1.6,1.6,.9,0,PI/2,{fronte:6});
 }},
 {id:'vespasiano', nome:'Tempio di Vespasiano e Tito', etichetta:'Vespasiano', x:-11.4,z:-2.6, ry:-.576, come:'fori', zone:[], fa:function(B){      // «prostyle hexastyle, 33 metres long and 22 wide», addossato al Tabularium (Platner e Ashby, Divus Vespasianus)
    B.tempio(1.7,2.8,1.6,0,0,PI/2,{fronte:6,podio:.6});      // 27 novembre 2026 (notte): girato di 13 gradi sul contorno di OpenStreetMap (relazione 1767603: centro -11,43, -2,56, come il modello; lati a 33 gradi, il modello a 20) e podio lungo 33 m come la fonte (prima 35); il clivo Capitolino passa davanti alla scala
 }},
 {id:'divogiulio', nome:'Tempio del Divo Giulio', etichetta:'Divo Giulio', x:6.15,z:5.35, ry:-.531, come:'fori', zone:[], fa:function(B){      // ionico, sei colonne sulla fronte, su una piattaforma alta 3,5 m con i rostri (Platner e Ashby, Divus Iulius, aedes)
    B.tempio(2.4,2.8,1.4,0,0,-PI/2,{fronte:6});
 }},
 {id:'giulia', nome:'Basilica Giulia', x:-4.6,z:6, ry:-.35, come:'fori', zone:[], fa:function(B){ basilica(B,9.6,4.9,1.9,0,0); }},      // «101 metres long and 49 wide» (Platner e Ashby, Basilica Iulia)
 {id:'rostri', nome:'Rostri', ey:1, x:-5.5,z:-1, ry:-.44, come:'fori', zone:[], fa:function(B){      // la tribuna degli oratori sul lato ovest della piazza: fronte «about 24 metres in length and 3 high» (Platner e Ashby, Rostra Augusti)
    B.scatola(1.3,.32,2.4,0,0,0,P.marmo).scatola(.12,.12,2.4,.6,.32,0,P.marmo).aperture(.66,1.1,.66,-1.1,6,.06,.2,.12,true);
 }},
 {id:'tabularium', nome:'Tabularium', x:-14.5,z:-5.2, ry:-.35, come:'fori', zone:[], fa:function(B){      // l'alto basamento di tufo e, sopra, la galleria ad arcate: «eleven arches, 7.50 metres in height» (Platner e Ashby, Tabularium)
    B.dentro(0,0,0,PI/2,function(B){ B.scatola(7.4,1.1,2.4,0,0,0,P.tufo); arcato(B,7.2,1.9,2.2,0,1.1,0,P.tufo,2,11); });
 }},
 /* Mercati di Traiano (monumento a sé dal 26 novembre 2026; prima nel foro di Traiano del gruppo, in B.dentro(5,75, 0, 0) del suo riquadro: qui x, z e ry sono quel punto e quel giro).
    Il grande emiciclo gira attorno all'esedra del foro, oltre una strada, e guarda la piazza con tre livelli: le botteghe, le finestre ad arco, un piano arretrato.
    Su OpenStreetMap (relazione 13353038) la facciata ha un raggio di 22 m e il corpo è profondo 7; qui il raggio è di 29,5 m, perché l'esedra del modello è più larga del vero.
    Dietro, più in alto sul pendio del Quirinale, gli isolati lungo la via Biberatica e, a nord, la Grande Aula: posizioni dal contorno di OpenStreetMap, forme e altezze schematiche. */
 {id:'mercatitraiano', nome:'Mercati di Traiano', etichetta:'Mercati di Traiano', x:3.1998,z:-31.3797, ry:.672, come:'fori', zone:[], fa:function(B){
    var arco=function(r,a,n){ return RM.ellisse(r,r,n||18,-a,a); }, f=arco(2.95,PI/2), t=arco(3.3,PI/2), o=arco(3.7,PI/2), cor=arco(2.9,PI/2), v=arco(3.7,PI*.36,12), u=arco(4.55,PI*.36,12);
    var IMP=1.022, th=IMP-.35, c0=Math.cos(th), s0=Math.sin(th), q0=quota(3,-8), su=function(lx,lz){ lx+=5.75; return Math.max(0,RM.h(-1.3+lx*c0+lz*s0,-27.8-lx*s0+lz*c0)-q0); };      // quanto sale il terreno rispetto al piano del foro
    B.striscia(f,0,f,1.3,P.mattone,false).striscia(f,1.3,t,1.3,P.selce,false).striscia(t,1.3,t,1.95,P.mattone,false).striscia(t,1.95,o,1.75,P.coppi,false).striscia(o,0,o,1.75,P.mattone,false);
    B.striscia(cor,.62,cor,.7,P.travertino,false).striscia(cor,.7,f,.7,P.travertino,false);                                  // la cornice sopra le botteghe
    vaniVerso(B,f,0,0,.04,.5,.5,true); vaniVerso(B,f,0,0,.78,.4,.42); vaniVerso(B,t,0,0,1.42,.3,.34,true);
    [-1,1].forEach(function(q){ B.scatola(.9,1.75,.75,.45,0,q*3.32,P.mattone).cilindro(.55,1.5,-.25,0,q*3.32,P.mattone,null,12).cupola(.55,-.25,1.5,q*3.32,P.mattone,.36); });      // le due aule di testata, a semicupola
    var hb=Math.max(1.75,su(4.1,0))+1.3;                                                                                      // gli isolati della via Biberatica
    B.striscia(v,1.75,v,hb,P.mattone,false).striscia(v,hb,u,hb-.2,P.coppi,false).striscia(u,0,u,hb-.2,P.mattone,false);
    [0,v.length-1].forEach(function(i){ B.quad([v[i][0],0,v[i][1]],[u[i][0],0,u[i][1]],[u[i][0],hb-.2,u[i][1]],[v[i][0],hb,v[i][1]],P.mattone); });
    vaniVerso(B,v,0,0,hb-.95,.4,.3); vaniVerso(B,v,0,0,hb-.42,.24,.3,true);
    var ya=su(6.2,-3.6), yc=su(4.9,-2.3);
    B.scatola(3.4,ya+2,2.6,6.2,0,-3.6,P.mattone).falde(3.4,.6,2.7,6.2,ya+2,-3.6,P.coppi,0,P.mattone);                       // la Grande Aula
    B.aperture(4.6,-2.3,7.8,-2.3,5,ya+.9,.6,.34).aperture(7.8,-4.9,4.6,-4.9,5,ya+.9,.6,.34);
    B.scatola(1.9,yc+1.5,1.8,4.9,0,-2.3,P.mattone).scatola(2,.12,1.9,4.9,yc+1.5,-2.3,P.coppi);                               // il corpo centrale
 }},
 /* i fori imperiali resi monumenti a sé il 26 novembre 2026: x, z sono il punto che il gruppo dava a inForo, ry quello dei fori imperiali (-0,35 + 1,022) */
 {id:'foroaugusto', nome:'Foro di Augusto e tempio di Marte Ultore', etichetta:'Foro di Augusto', x:11.2,z:-19.5, ry:.672, come:'fori', zone:[], fa:function(B){      // Marte Ultore contro il muro tagliafuoco verso la Suburra, le due esedre ai lati
    portico(B,10.5,9.5,0,0,0,1.2); B.tempio(3.4,4.6,2.3,2.3,0,-PI/2,{fronte:8,lati:8,podio:.7}).scatola(.5,3.3,10.5,5.5,0,0,P.tufo);      // «octostyle, and peripteral except at the north-east end, where it joined the forum wall» (Platner e Ashby, Forum Augustum)
    [-1,1].forEach(function(q){ var es=RM.ellisse(2,2,10,q>0?0:PI,q>0?PI:2*PI).map(function(p){ return [p[0]+1.6,p[1]+q*4.75]; }), ce=es.map(function(){ return [1.6,q*4.75]; });
      B.striscia(es,0,es,1.7,P.tufo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });
 }},
 {id:'foronerva', nome:'Foro di Nerva e tempio di Minerva', etichetta:'Foro di Nerva', x:10.7,z:-8.9, ry:.672, come:'fori', zone:[], fa:function(B){      // lo attraversa l'Argileto: «about 120 metres, its width about 40» (Platner e Ashby, Forum Nervae)
    portico(B,12,4.2,0,0,0,1.2); B.tempio(1.8,2.4,1.5,5.9,0,-PI/2,{fronte:6});                                                 // Minerva: «hexastyle prostyle»; «in the centre of the north-east end», «its apse projected beyond the limits of the forum» (Platner e Ashby, Forum Nervae): dal 27 novembre 2026 il centro sta a 59 m dal centro del foro (prima 46), presso il centro del tempio su OpenStreetMap (way 140264246, 65 m), e il retro esce dal muro di fondo. L'Argileto non lo attraversa più: il foro era il passaggio (src/roma/genera.mjs)
 }},
 {id:'forocesare', nome:'Foro di Cesare e tempio di Venere Genitrice', etichetta:'Foro di Cesare', x:0,z:-13.2, ry:.672, come:'fori', zone:[], fa:function(B){      // «rectangular, about 115 metres long and 30 wide, surrounded by a colonnade and wall» (Platner e Ashby, Forum Iulium); Venere Genitrice a nord-ovest
    portico(B,7,15,0,0,0,1.1); B.tempio(2.6,3.6,1.7,0,-5.2,0,{fronte:8});
 }},
 {id:'forotraiano', nome:'Foro di Traiano e basilica Ulpia', etichetta:'Foro di Traiano', x:-1.3,z:-27.8, ry:.672, come:'fori', zone:[], fa:function(B){      // la piazza «116 metres wide and 95 long» con le esedre, la basilica Ulpia, le biblioteche, il tempio del Divo Traiano (Platner e Ashby, Forum Traiani)
    portico(B,11.5,9,0,0,0,1.3);
    B.scatola(.62,.34,.34,0,.1,0,P.marmo).scatola(.56,.2,.18,0,.72,0,P.statua).scatola(.12,.26,.13,.3,.86,0,P.statua).scatola(.12,.3,.13,-.02,.92,0,P.statua);      // la statua equestre di Traiano, al centro della piazza
    [[-.2,-.06],[-.2,.06],[.2,-.06],[.2,.06]].forEach(function(p){ B.scatola(.05,.28,.05,p[0],.44,p[1],P.statua); });
    [-1,1].forEach(function(q){ var es=RM.ellisse(2.3,2.3,10,q>0?-PI/2:PI/2,q>0?PI/2:3*PI/2).map(function(p){ return [p[0]+q*5.75,p[1]]; }), ce=es.map(function(){ return [q*5.75,0]; });
      B.striscia(es,0,es,1.7,P.marmo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });        // le due grandi esedre ai lati della piazza
    basilica(B,17,5.6,2.4,0,-7.6,P.bronzo);                                                  // basilica Ulpia, con le absidi alle due testate
    [-1,1].forEach(function(q){ B.cilindro(2.5,2,q*8.5,0,-7.6,P.marmo,null,18).cilindro(2.5,.55,q*8.5,2,-7.6,P.bronzo,.3,18); });
    B.scatola(2,1.8,2.6,-2.8,0,-11.6,P.mattone).scatola(2,1.8,2.6,2.8,0,-11.6,P.mattone);     // biblioteche
    B.tempio(3.8,5.4,2.4,0,-16.4,PI,{fronte:8,lati:9,podio:.7});                              // tempio del Divo Traiano
 }},
 {id:'pace', nome:'Tempio della Pace', x:16.9,z:-2.6, ry:.672, come:'fori', zone:[], fa:function(B){      // una piazza a giardino di circa 110 x 105 m (Fogagnolo e Rossi 2010); con le aule di fondo il complesso arriva a 125 m
    portico(B,11,10.5,0,0,-.9,1.2,P.prato);
    B.scatola(3.6,1.7,1.8,3.7,0,5.25,P.mattone).scatola(3.7,.12,1.9,3.7,1.7,5.25,P.coppi);                                         // le aule sul lato di fondo (sud-est); quella all'angolo sud è Santi Cosma e Damiano
    B.tempio(3.2,2.4,2.1,0,5.15,PI,{fronte:6,podio:.2});                                                                          // il tempio: un'aula dietro il portico, da cui sporge solo il pronao a sei colonne
    [-1,1].forEach(function(q){ for(var k=0;k<3;k++) B.scatola(.42,.14,6,q*(1.3+k*1.15),.1,-1.3,P.mattone).scatola(.3,.04,5.86,q*(1.3+k*1.15),.24,-1.3,P.acqua); });      // le sei lunghe vasche fra le aiuole
    B.scatola(.5,.3,.5,0,.1,2.3,P.marmo);                                                                                        // l'altare davanti al tempio
 }},
 /* Il Marforio (26 novembre 2026; l'utente: «Non abbiamo proprio idea di dove fosse il Marforio?»). Statua colossale di marmo di un dio sdraiato, barbuto, col mantello: 6,10 x 2,42 m
    (Musei Capitolini); la conchiglia è del restauro del 1594 e non c'è. Dove stava: l'Itinerario di Einsiedeln (cod. 326, ff. 79v e 82v, letti sul codice) nomina «Tiberis» fra il foro
    di Traiano e Sant'Adriano, dove si passa «per arcum Severi», in due percorsi; che sia il Marforio lo dicono gli studiosi (Encyclopaedia Romana, voce Umbilicus; Nichols 1889), non il
    codice. I Mirabilia (dopo il 1143, Nichols 1889): «Ante privatam Mamertini, templum Martis, ubi nunc iacet simulacrum eius»; la Sovrintendenza: presso San Pietro in Carcere, di
    fronte ai Santi Luca e Martina, fino al 1588. Qui: sdraiato a terra davanti al Carcere (nel modello a x -5,92, z -7,14, gruppo campidoglio), dal lato del Foro, fuori dalla strada
    (1,4 unità dall'asse della più vicina). Il punto esatto e l'orientamento sono una scelta; posa e forme a superfici lisce (pelle) sono indicative. Lunghezza lungo z locale.
    Rifatto la sera del 26 novembre 2026 (l'utente: era «una specie di mummia»). Posa presa da due fotografie della statua vera su Wikimedia Commons, guardate quel giorno («0 Marforio
    - Cortile del Palazzo Nuovo - Musei Capitolini (MC0001).jpg» e «Marforio Musei Capitolini cortile Roma.jpg»): sdraiato sul fianco sinistro, il busto sollevato e piegato di lato,
    il gomito sinistro appoggiato a un sostegno coperto dal mantello e la mano che pende in avanti; il torso nudo e muscoloso guarda chi passa; la testa dritta, con la barba lunga e
    divisa in ciocche e i capelli lunghi e mossi che scendono sulle spalle; il mantello avvolto ai fianchi copre le gambe, distese, con la destra piegata e il ginocchio alzato; il
    piede sinistro nudo sporge in fondo. Nella statua di oggi la destra tiene la conchiglia del restauro del 1594: qui la conchiglia non c'è e la mano poggia sul ginocchio (scelta
    nostra). Misure: lunga 6,10 m, alta 2,42 col suo basamento di roccia (Musei Capitolini). Le misure qui sotto sono in metri (m() le porta in unità).
    Terzo giro, 27 novembre 2026 (nuovoMarforio): rifatto confrontando una cattura dallo stesso lato della prima fotografia. Il corpo è massiccio e quasi sdraiato (il bacino
    giace sul fianco, solo il petto si raddrizza), la testa è grande, chioma e barba sono folte, il mantello copre il grembo e le due gambe e sale dietro la schiena fino alla
    spalla sinistra, la mano sinistra pende oltre il masso, la mano destra è chiusa sul ginocchio alzato (senza la conchiglia del 1594, scelta nostra); il masso ha le bozze sui fianchi. Circa 9.900 triangoli. */
 {id:'marforio', nome:'Marforio (statua di un dio fluviale)', etichetta:'Marforio', x:-5.3,z:-5.9, ry:.9, come:'fori', zone:[], fa:function(B){
    var M=P.marmo, FR=[1,0,0], DI=[-1,0,0], k, B0=B;
    B=Object.create(B0); B.geo=function(g,c){      // tutto di marmo, ma col tipo delle statue (P.statua: niente conci, crepe né crolli, che sulla pietra liscia disegnavano filari di muro)
      if(!g.attributes.color){ var n=g.attributes.position.count, a=new Float32Array(n*3); for(var i=0;i<n;i++){ a[i*3]=M.r; a[i*3+1]=M.g; a[i*3+2]=M.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); }
      return B0.geo.call(this,g,P.statua); };
    function m(l){ return l.map(function(q){ return [q[0]*.1,q[1]*.1,q[2]*.1,q[3]*.1,(q[4]==null?q[3]:q[4])*.1]; }); }      // anelli in metri: [x, y, z, raggio in x, raggio nell'altro verso]
    function pz(r,x,y,z,sx,sy,sz,lati){ return palla(B,r*.1,x*.1,y*.1,z*.1,M,sx,sy,sz,lati||6); }
    function dito(l,r){ for(var q=0;q<l.length-1;q++) arto(B,[l[q][0]*.1,l[q][1]*.1,l[q][2]*.1],[l[q+1][0]*.1,l[q+1][1]*.1,l[q+1][2]*.1],r*.1*(1-.15*q),r*.1*(1-.15*(q+1)),M,5,false); }
    function pieghe(t0,t1,passo,dir,wa,h){ var o=[]; for(var t=t0;t<=t1;t+=passo) o.push({t:t,wt:passo*.42,dir:dir,wa:wa,h:h}); return o; }      // pieghe di stoffa di traverso (più larghe del passo degli anelli, se no non si vedono)
    function nuovoMarforio(){      // il corpo del terzo giro (27 novembre 2026); misure in metri dalla fotografia di fronte, lunghezza lungo z locale (piedi a +z), il petto verso +x
      function th(l,s){ return m(l.map(function(q){ return [q[0]*1.38-.12, 1.72+(q[1]-1.85)*1.38, -1.85+(q[2]+.82)*1.38, q[3]*s*1.15, (q[4]==null?q[3]:q[4])*s*1.15]; })); }      // la testa del secondo giro, ingrandita e portata al suo posto
      function hp(x,y,z){ return [x*1.38-.12, 1.72+(y-1.85)*1.38, -1.85+(z+.82)*1.38]; }
      /* il torso: il bacino giace sul fianco sinistro (la sua larghezza sta quasi in verticale), il ventre largo e pesante sale piano verso la testa, il petto si raddrizza e
         le spalle stanno quasi in piano; tutto un poco all'indietro, appoggiato al mantello. Primo raggio: profondità; secondo: larghezza da un fianco all'altro */
      pelle(B,m([[.08,.74,-1.45,.38,.36],[.09,.76,-1.1,.44,.42],[.11,.79,-.65,.46,.44],[.12,.82,-.25,.42,.4],[.12,.84,-.02,.36,.34]]),M,16,{sudd:2,patina:2.4});      // il bacino, che giace sul fianco sinistro (quasi tutto sotto il mantello)
      var MT=[{t:1.8,wt:1,dir:FR,wa:.07,h:-.05},{t:1.15,wt:.2,dir:FR,wa:.13,h:-.07},{t:1.2,wt:.9,dir:FR,wa:.75,h:.08},{t:6.6,wt:.35,dir:FR,wa:.12,h:-.06},{t:3,wt:3,dir:DI,wa:.1,h:-.06}];      // linea alba, ombelico, ventre pesante, fossetta del collo, solco della schiena
      [-1,1].forEach(function(q){ MT.push(
        {t:3.3,wt:.55,dir:[.84,q*.18,q*.5],wa:.5,h:.14},{t:2.8,wt:.2,dir:[.86,q*.15,q*.48],wa:.5,h:-.06},                        // pettorale e il suo margine
        {t:2.3,wt:.16,dir:[.97,0,q*.25],wa:.18,h:.05},{t:1.95,wt:.16,dir:[.97,0,q*.25],wa:.18,h:.055},{t:1.6,wt:.16,dir:[.97,0,q*.25],wa:.18,h:.05},      // addominali
        {t:.4,wt:.4,dir:[.75,q*.3,q*.6],wa:.3,h:-.07},{t:.7,wt:.45,dir:[.55,q*.4,q*.75],wa:.35,h:.07},                            // solco dell'inguine e cresta del fianco
        {t:4.2,wt:.5,dir:[.2,q*.35,q*.92],wa:.5,h:.15},{t:4,wt:.8,dir:[-.6,q*.25,q*.7],wa:.5,h:.07}); });                       // deltoidi, scapole
      [2,2.35,2.7].forEach(function(t){ MT.push({t:t,wt:.12,dir:[.45,.2,.87],wa:.3,h:.05}); });                                 // le costole del fianco destro, tese
      pelle(B,m([[.12,.5,-1.35,.4,.5],[.1,.74,-1.52,.55,.76],[.05,.97,-1.7,.56,.84],[-.02,1.17,-1.8,.52,.86],[-.08,1.32,-1.82,.47,.82],[-.1,1.43,-1.83,.38,.66],
        [-.1,1.52,-1.84,.28,.44],[-.09,1.62,-1.85,.22,.26],[-.07,1.72,-1.86,.2,.2],[-.06,1.8,-1.86,.19,.19]]),M,24,{sudd:2,muscoli:MT,forza:2.3,patina:3.4});      // il ventre e il petto: il ventre sale di traverso, il petto si raddrizza
      /* la testa, grande: il volto verso +x, appena girato e alzato */
      var MF=[{t:4.55,wt:.3,dir:FR,wa:.7,h:.07}];
      [-1,1].forEach(function(q){ MF.push({t:4.15,wt:.25,dir:[.93,0,q*.36],wa:.2,h:-.11},{t:3.4,wt:.35,dir:[.75,0,q*.65],wa:.3,h:.06}); });      // arcata delle sopracciglia, orbite e zigomi
      pelle(B,th([[.12,1.85,-.82,.06],[.12,1.89,-.82,.21,.18],[.11,1.97,-.82,.27,.21],[.1,2.08,-.82,.29,.225],[.09,2.18,-.82,.3,.23],[.08,2.27,-.82,.28,.225],[.07,2.35,-.82,.2,.17],[.07,2.39,-.82,.05]],1.2),M,16,{sudd:2,muscoli:MF,forza:1.2,patina:2});
      pelle(B,th([[.34,2.19,-.82,.03,.025],[.37,2.13,-.82,.035,.03],[.41,2.07,-.82,.045,.042],[.39,2.035,-.82,.035,.03]],1.2),M,8,{sudd:2});      // il naso
      [-1,1].forEach(function(q){ var a=hp(.31,2.155,-.82+q*.09), b=hp(.36,2.005,-.82+q*.06); pz(.038,a[0],a[1],a[2],1,.8,1.1); pz(.07,b[0],b[1],b[2],.6,.45,1.5); });      // gli occhi, i baffi folti
      /* la barba: piena, ricciuta, divisa in grosse ciocche, scende sul petto */
      var MB=[], k2; for(k2=-4;k2<=4;k2++){ var ab=k2*.36; MB.push({t:2.3,wt:2.2,dir:[Math.cos(ab),0,Math.sin(ab)],wa:.22,h:-.35}); }
      [1.2,2.4,3.4].forEach(function(t){ MB.push({t:t,wt:.25,dir:FR,wa:.9,h:.1}); });
      pelle(B,th([[.3,1.5,-.82,.07,.09],[.3,1.62,-.82,.15,.2],[.27,1.77,-.82,.2,.26],[.23,1.9,-.82,.21,.28],[.19,1.99,-.82,.17,.27],[.13,2.0,-.82,.08,.2]],1.2),M,22,{sudd:2,muscoli:MB,patina:3.4});
      [[.36,1.6,-.92],[.38,1.6,-.72],[.37,1.72,-1],[.39,1.72,-.82],[.37,1.72,-.64],[.32,1.86,-1.05],[.32,1.86,-.59]].forEach(function(p,i){ var a=hp(p[0],p[1],p[2]); pz(.075+.01*(i%3),a[0],a[1],a[2],.8,1,.9); });      // i riccioli della barba
      /* la chioma: una massa larga e folta dietro e ai lati, fino alle spalle, e riccioli grossi attorno al volto */
      var MC=[]; for(k2=0;k2<10;k2++){ var ac=k2*.63; MC.push({t:2+k2%3*.9,wt:1.6,dir:[Math.cos(ac),0,Math.sin(ac)],wa:.22,h:-.16}); }
      pelle(B,th([[-.02,2.47,-.82,.06],[-.01,2.455,-.82,.18,.19],[0,2.42,-.82,.26,.27],[-.03,2.31,-.82,.31,.32],[-.06,2.15,-.82,.31,.33],[-.1,2,-.82,.26,.33],[-.13,1.84,-.8,.2,.31],[-.14,1.7,-.78,.1,.2]],1.38),M,18,{sudd:2,muscoli:MC,patina:2.8});
      [[.24,2.35,-.97],[.28,2.38,-.82],[.24,2.35,-.67],[.16,2.32,-1.08],[.16,2.32,-.56],[.11,2.2,-1.1],[.11,2.2,-.54],[.11,2.06,-1.09],[.11,2.06,-.55],[.08,1.93,-1.08],[.08,1.93,-.56],[.05,1.8,-1.09],[.05,1.8,-.55],[-.02,2.42,-.95],[-.02,2.42,-.69]].forEach(function(p,i){ var a=hp(p[0],p[1],p[2]); pz(.085+.012*(i*7%5),a[0]+.025*(i*3%3-1),a[1]+.03*(i*5%3-1),a[2]+.02*(i%2?1:-1),1,.8+.05*(i%3),1.1-.05*(i%4)); });      // i riccioli della chioma, di misura e posto un poco diversi l'uno dall'altro
      /* il braccio destro: dalla spalla scende davanti al ventre, il gomito in basso, l'avambraccio sale poggiato sulla coscia alzata; la mano chiusa sul ginocchio (senza la conchiglia del 1594) */
      pelle(B,m([[-.02,1.42,-1.04,.27],[.16,1.3,-.8,.26,.27],[.34,1.16,-.53,.22,.23],[.46,1.1,-.35,.19]]),M,12,{sudd:2,patina:2,muscoli:[{t:1,wt:.5,dir:[.3,.9,.3],wa:.8,h:.15},{t:1.6,wt:.6,dir:[.6,.3,.7],wa:.6,h:.12}]});      // deltoide, bicipite
      pz(.19,.46,1.1,-.35,1,1,1,8);                                                                                                  // il gomito
      pelle(B,m([[.46,1.1,-.35,.22],[.48,1.22,-.05,.23,.22],[.48,1.36,.3,.19,.18],[.48,1.47,.55,.14,.13]]),M,12,{sudd:2,patina:2,muscoli:[{t:1,wt:.6,dir:[.5,.8,0],wa:.7,h:.12}]});
      pelle(B,m([[.48,1.48,.55,.11,.1],[.49,1.55,.7,.14,.1],[.48,1.54,.84,.13,.08]]),M,8,{sudd:2});                                 // la mano, chiusa
      for(k2=0;k2<4;k2++) dito([[.47,1.54,.84],[.47,1.47,.92],[.47,1.38,.9]].map(function(p){ return [p[0]+(k2-1.5)*.06,p[1],p[2]]; }),.032);      // le dita, piegate
      dito([[.38,1.54,.74],[.35,1.52,.86]],.035);                                                                                       // il pollice
      /* il braccio sinistro: la spalla sotto il mantello, il gomito sul sostegno, l'avambraccio viene avanti e la mano pende oltre il masso */
      pelle(B,m([[-.14,1.42,-2.58,.28],[-.18,1.25,-2.64,.27,.28],[-.22,1.08,-2.67,.23],[-.25,.96,-2.68,.2]]),M,12,{sudd:2,patina:2,muscoli:[{t:1,wt:.5,dir:[.3,-.2,-.9],wa:.8,h:.15},{t:1.7,wt:.6,dir:FR,wa:.6,h:.13}]});
      pz(.2,-.25,.96,-2.65,1,1,1,8);
      pelle(B,m([[-.25,.96,-2.65,.2],[.0,.94,-2.66,.21,.2],[.3,.91,-2.64,.17,.16],[.58,.88,-2.6,.13,.12]]),M,12,{sudd:2,patina:2,muscoli:[{t:1,wt:.6,dir:[0,1,0],wa:.7,h:.12}]});
      pelle(B,m([[.58,.88,-2.6,.12,.11],[.72,.8,-2.58,.14,.09],[.8,.67,-2.57,.13,.08]]),M,8,{sudd:2});                              // la mano: il dorso
      for(k2=0;k2<4;k2++) dito([[.8,.67,-2.57],[.85,.56,-2.57],[.86,.43,-2.57]].map(function(p){ return [p[0],p[1],p[2]+(k2-1.5)*.065]; }),.03);      // le dita, che pendono
      dito([[.7,.8,-2.47],[.78,.72,-2.43]],.034);                                                                                       // il pollice
      /* le gambe, coperte dal mantello: la sinistra distesa sul masso, dietro; la destra piegata, col ginocchio alzato; esce nudo solo il piede destro */
      pelle(B,m([[-.15,.78,0,.32],[-.2,.76,.5,.3,.28],[-.25,.71,1.1,.26,.23],[-.27,.67,1.6,.21,.19],[-.28,.64,2.1,.17],[-.28,.62,2.35,.12]]),M,14,{sudd:2,patina:2.4,muscoli:pieghe(.4,4.6,.7,[.5,.8,0],1.1,-.2)});
      pelle(B,m([[.12,.9,-.05,.34],[.22,1.04,.35,.33,.32],[.33,1.24,.72,.29,.28],[.42,1.34,.95,.26]]),M,14,{sudd:2,patina:2.4,muscoli:pieghe(.4,2.8,.45,[.3,1,0],1.1,-.24)});      // la coscia destra
      pz(.27,.42,1.34,.95,1,1,1,10);                                                                                                   // il ginocchio
      pelle(B,m([[.42,1.34,.95,.26],[.43,1.14,1.38,.25,.24],[.38,.88,1.85,.21,.2],[.32,.7,2.25,.16],[.3,.64,2.42,.13]]),M,14,{sudd:2,patina:2.4,muscoli:pieghe(.4,3.4,.55,[1,.3,0],1.2,-.24).concat([{t:3.7,wt:.25,dir:FR,wa:2,h:.15}])});      // la gamba destra, con l'orlo sopra la caviglia
      pelle(B,m([[.3,.62,2.42,.12,.12],[.32,.58,2.6,.14,.15],[.35,.62,2.8,.09,.15],[.37,.72,2.94,.05,.11],[.38,.78,3,.03,.05]]),M,10,{sudd:2});      // il piede destro, nudo, in fuori
      for(k2=0;k2<4;k2++) pz(.035,.38-(k2-1.5)*.05,.78-k2*.025,2.98-k2*.02,1,1,1.2,6);                                              // le dita del piede
      /* il mantello: il grande panneggio sul grembo e sulle gambe, il rotolo che ricade sul masso davanti al ventre, il telo che dietro la schiena sale alla spalla sinistra
         e ridiscende sul sostegno sotto il gomito. Pieghe spesse: solchi profondi di traverso */
      pelle(B,m([[.22,.95,-.55,.12],[.32,1,-.2,.3,.36],[.4,1.02,.4,.35,.44],[.43,1.02,.95,.35,.46],[.41,.82,1.6,.31,.4],[.36,.7,2.1,.24,.32],[.31,.6,2.38,.1,.12]]),M,16,{sudd:2,patina:2,forza:1.3,
        muscoli:pieghe(.6,5.4,.55,[.6,.8,0],1.3,-.26).concat(pieghe(.9,5,.8,[.2,1,0],.9,-.18))});
      pelle(B,m([[.3,1.04,-.32,.1],[.46,.96,-.26,.14,.26],[.58,.8,-.2,.14,.3],[.66,.6,-.15,.13,.3],[.7,.42,-.12,.08,.22]]),M,16,{sudd:2,patina:2,muscoli:[[1,-.5],[1,.5],[2,-.3],[2,.6],[3,0]].map(function(q){ return {t:q[0],wt:.9,dir:[.6,0,q[1]],wa:.25,h:-.18}; })});      // il rotolo che ricade sul masso, con le pieghe dritte
      pelle(B,m([[-.35,.7,-.35,.18],[-.44,.95,-1,.26,.32],[-.42,1.25,-1.6,.27,.34],[-.32,1.5,-2.2,.24,.32],[-.2,1.63,-2.5,.21,.27],[-.05,1.46,-2.74,.19,.26],[.05,1.1,-2.82,.18,.3],[.15,.8,-2.77,.16,.36],[.26,.6,-2.62,.08,.22]]),M,16,{sudd:2,patina:3,
        muscoli:pieghe(.4,7.6,.6,[-1,.3,0],1.4,-.22)});      // dietro la schiena, sulla spalla sinistra, giù sul sostegno
    }
    B.dentro(0,.05,0,0,function(B){      // il piano del Foro del modello sta 5 dm sotto il suolo disegnato qui
      /* 27 novembre 2026, terzo giro (l'utente: «Ma non è ancora un po' diverso da oggi il Marforio?»): rifatto sulla fotografia di fronte. Massiccio, quasi sdraiato sul fianco
         sinistro: il bacino giace di lato, il ventre sale piano verso la testa e solo il petto si raddrizza; testa grande con chioma e barba folte; il mantello in pieghe spesse
         copre il grembo e le due gambe e risale dietro la schiena fino alla spalla sinistra; la mano sinistra pende oltre il sostegno; un masso sbozzato sotto. */
      /* il basamento: un masso irregolare sbozzato, più alto sotto il gomito (il sostegno coperto dal mantello); le bozze sono rigonfiamenti e tagli sparsi */
      var MR=[], kr; for(kr=0;kr<22;kr++){ var ar=kr*2.39996; MR.push({t:.8+(kr*.283)%5.6,wt:.18+(kr%3)*.06,dir:[Math.cos(ar),Math.abs(Math.sin(ar))+.2,0],wa:.3+(kr%4)*.07,h:(kr%2?.2:-.17)}); }
      pelle(B,m([[0,0,-3.05,.45,.12],[-.05,.12,-2.75,.66,.45],[-.05,.22,-2.3,.68,.6],[0,.1,-1.3,.68,.45],[0,.06,.2,.66,.42],[0,.06,1.6,.62,.38],[0,.05,2.7,.55,.3],[0,0,3.08,.4,.1]]),M,18,{sudd:3,patina:3,muscoli:MR});
      for(kr=0;kr<14;kr++){ var zr=-2.9+kr*.44, lato=kr%3===2?-1:1; pz(.2+.07*(kr*5%3),lato*(.5+.06*(kr%2)),.16+.05*(kr*7%3),zr,1.3,.6+.1*(kr%3),1.5,6); }      // le bozze sui fianchi del masso, perché non sembri un cuscino (forma e numero: schema)
      nuovoMarforio();
    });
 }},
 /* Mancanti aggiunti la sera del 26 novembre 2026 (src/design/completezza-monumenti.md, sezione 2; fonti in coda a src/testi/topografia-fonti.md, «Mancanti aggiunti»).
    La Regia: nel recinto di Vesta, fra la via Sacra, il tempio di Vesta e quello del Divo Giulio; posto di Wikidata (Q786489: 41.8919 N, 12.4864 E, con RM.ll x 9,1, z 6,7).
    Platner e Ashby, Regia: dopo il restauro di Calvino (36 a.C.) un pentagono irregolare; la parte principale trapezia, lunga in media 22 m e larga 8, «of solid blocks of white
    marble», tre stanze; fra lei e la via Sacra un cortile lastricato di marmo con un'anticamera coperta a est, dove stava l'ingresso; tutta l'area larga da 12 a 27 m.
    Altezza: nessuna fonte letta; qui 7 m (scelta). Orientamento quello del Foro (-0,35). Il cortile è verso la via Sacra (a -z locale, verso nord). */
 {id:'regia', nome:'Regia', x:9.1,z:6.7, ry:-.35, come:'fori', zone:[], fa:function(B){
    B.scatola(2.2,.7,.8,0,0,.5,P.marmo).falde(2.2,.25,.86,0,.7,.5,P.coppi,0,P.marmo);                                        // la parte principale, di marmo bianco
    B.vano(0,0,.09,1,0,.22,.4,true);                                                                                        // la porta, verso il cortile
    B.scatola(2.2,.05,1.2,0,0,-.5,P.marmo);                                                                                    // il cortile lastricato
    B.scatola(.05,.3,1.2,-1.08,0,-.5,P.marmo).scatola(1.5,.3,.05,-.35,0,-1.08,P.marmo);                                        // il recinto basso del cortile (altezza: scelta)
    B.scatola(.7,.5,.6,.75,0,-.75,P.marmo).falde(.7,.18,.66,.75,.5,-.75,P.coppi,0,P.marmo);                                   // l'anticamera coperta a est, con l'ingresso
    B.cilindro(.13,.08,-.4,.05,-.45,P.tufo,null,10);                                                                           // la base rotonda di tufo presso la cisterna
 }},
 /* La casa privata nella Regia, «in the seventh or eighth century» (Platner e Ashby, Regia): verso la via Sacra due gradini rozzi di marmo e travertino e sopra una fila di
    colonne di cipollino prese da un edificio antico. Nel modello dal 700 (la data esatta non c'è); il numero delle colonne e l'altezza sono una scelta. */
 {id:'regiacasa', x:9.1,z:6.7, ry:-.35, come:'fori', zone:[], fa:function(B){
    var CIP=RM.col(0xc6ccb8);                                                                                                  // cipollino: marmo bianco verdastro
    B.scatola(2.1,.04,.22,0,0,-1.2,P.travertino).scatola(2.1,.04,.14,0,.04,-1.16,P.marmo);                                     // i due gradini
    B.colonne(-.95,-1.16,.95,-1.16,6,.42,.028,.08,CIP).scatola(2.05,.06,.1,0,.5,-1.16,P.tronco);                               // le colonne e una trave sopra (la trave è una scelta)
 }},
 /* I templi del Foro Olitorio (San Nicola in Carcere). Posto di Wikidata (Q1241176: 41.8911 N, 12.4800 E; x -43,9, z 15,6), accanto al teatro di Marcello.
    Platner e Ashby, Ianus, aedes: «three temples, standing side by side with the same orientation and facing the forum Holitorium»; il centrale, il più grande, ionico; quello a nord
    ionico, esastilo, periptero tranne che sul retro, colonne di 0,70 m di diametro (Giano, di solito); quello a sud il più piccolo, dorico (Giunone Sospita). Spes, aedes: il centrale
    «about 30 metres long and 10 wide», ionico, anfiprostilo esastilo, una scalinata alta di dodici o tredici gradini, colonne alte 8,70 m. Iuno Sospita: «hexastyle, amphiprostyle and
    peripteral», di travertino. Le misure del tempio di Giano e di quello di Giunone non le dà: qui un poco più piccoli del centrale (scelta), con nove colonne sui fianchi (scelta).
    Il Foro Olitorio sta fra i templi e il Campidoglio: le fronti guardano a nord-est (ry 2,38); l'angolo esatto è una scelta. A +x locale (nord-ovest) Giano, a -x Giunone. */
 {id:'olitorio', nome:'Templi del Foro Olitorio', etichetta:'Templi del Foro Olitorio', x:-43.9,z:15.6, ry:2.38, zone:[[0,.3,[2.2,2.3],.3]], fa:function(B){
    var r=.035;
    B.tempio(.95,2.6,.8,1.35,.15,0,{fronte:6,podio:.3});                                                                      // Giano
    [-1,1].forEach(function(q){ B.colonne(1.35+q*(.475-r),.15+1.3-r,1.35+q*(.475-r),.15-1.3+r,9,.8,r,.3); });                 // i fianchi; sul retro niente colonne
    B.tempio(1,3,.87,0,0,0,{fronte:6,podio:.35}).colonne(-.5+.037,-1.5+.037,.5-.037,-1.5+.037,6,.87,.037,.35);                // Speranza: anfiprostilo, sei colonne anche sul retro
    B.tempio(.85,2.2,.7,-1.3,.35,0,{fronte:6,lati:9,podio:.25});                                                              // Giunone Sospita, dorica
 }},
 /* il tempio della Magna Mater e la Domus Tiberiana (26 novembre 2026, sera) stanno dopo il gruppo palatino, sul cui piano poggiano (come:'palatino') */
 {id:'saturno', nome:'Tempio di Saturno', etichetta:'Saturno', x:-10.1,z:1.1, ry:.95, come:'fori', zone:[], fa:function(B){
    B.tempio(2.2,3.5,1.1,0,0,PI/2,{fronte:6,podio:.85});                                                                       // sul suo podio alto: «22.50 metres wide, about 40 long», ionico, sei colonne sulla fronte; «The columns are 11 metres in height» (Platner e Ashby, Saturnus, aedes; 27 novembre 2026: prima erano alte 17 m); podio lungo 40 m come la fonte (prima 45, e il clivo Capitolino ci passava sopra; il contorno di OpenStreetMap, relazione 1849835, è lungo 38,7 m)
 }},
 /* colonna Traiana: piedistallo «5.4 metres high»; base, fusto e capitello «3.70 metres in diameter … measure 100 Roman feet (29.77 metres)» (Platner e Ashby, Forum Traiani).
    Il punto è quello che aveva nel foro di Traiano del gruppo (locale 0, -11,6 nel riquadro del foro, girato di 1,022 sul Foro): x -8,5216, z -36,8779, ry 0,672. */
 {id:'colonnatraiana', nome:'Colonna Traiana', x:-8.5216,z:-36.8779, ry:.672, come:'fori', zone:[], fa:function(B){
    B.scatola(.56,.55,.56,0,0,0,P.marmo).cilindro(.23,.1,0,.55,0,P.marmo,.2,14).coclide(.185,.165,2.73,0,.65,0,23,P.marmo);      // basamento, toro, fusto col fregio a spirale: ventitré giri è il numero corrente, non letto in Platner
    B.scatola(.45,.12,.45,0,3.38,0,P.marmo).cilindro(.11,.1,0,3.5,0,P.marmo,.1,10);                                             // capitello e plinto della statua
 }},
 /* la statua di Trajano in cima, «in gilt bronze, of which we have no representation» (Platner e Ashby): forma indicativa. Quando sia stata tolta non si sa: nel modello va via nel 663
    con gli altri bronzi dei Fori (Costante II, Liber Pontificalis, vita di Vitaliano), scelta già dichiarata nella scheda dei Fori e ripetuta in quella della colonna */
 {id:'colonnatraianastatua', x:-8.5216,z:-36.8779, ry:.672, come:'fori', zone:[], fa:function(B){ uomo(B,0,3.6,0,2.1,P.statua); }},
 /* Posto e orientamento rifatti il 27 novembre 2026, notte, sul resto vero (prima x 11,6, z 3,7, ry -0,35, l'asse del Foro). Il contorno su OpenStreetMap (relazione 1841090, in
    grezzi/osm-foro-geom.json) copre solo la parte davanti, 263 metri quadrati: i suoi lati vanno a 32 e a 122 gradi, quindi l'asse del tempio sta a 122 gradi (ry -0,564; prima a 110).
    La chiesa di San Lorenzo in Miranda, che occupa la cella (Platner e Ashby), ha il centro su OpenStreetMap (relazione 1841086, in grezzi/osm-monumenti.json) esattamente su quell'asse:
    qui il centro della cella del modello sta sul centro della chiesa. Così il piede della scala cade sul bordo davanti del contorno (meno di 1 m di scarto): il contorno sono scala e pronao.
    Il contorno intero della chiesa non è stato scaricato (Overpass non rispondeva: richiesta pronta in grezzi/q20.txt); lunghezza del tempio e misure della scala restano quelle del modello. */
 {id:'antonino', nome:'Tempio di Antonino e Faustina', etichetta:'Antonino e Faustina', x:12.015,z:3.152, ry:-.564, come:'fori', zone:[], fa:function(B){
    B.tempio(2.1,3.4,1.7,0,0,0,{fronte:6});                                                                                     // «hexastyle prostyle», colonne di cipollino «17 metres high» (Platner e Ashby, Antoninus et Faustina, templum)
 }},
 /* Arco di Settimio Severo, rivisto il 27 novembre 2026 sulla voce Arcus Septimii Severi di Platner e Ashby, letta per intero (src/testi/topografia-fonti.md, «Gli archi, uno per uno»):
    «23 metres high, 25 wide and 11.85 deep, the central archway being 12 metres high and 7 wide, and the side archways 7.80 high and 3 wide»; «four fluted columns … 8.78 metres
    high … stand free from the arch on projecting pedestals»; «the lofty attic, 5.60 metres in height». Girato: prima ry -0,35 (quella del gruppo dei Fori), con le facce verso
    sud-sud-ovest; il contorno su OpenStreetMap (way 49824161, rettangolo di 23,3 x 7,7 m) dà il lato lungo a 0,94: le facce guardano il Foro a sud-est e il Campidoglio a nord-ovest,
    come nelle fotografie. Prima l'arco era alto 21 m, i fornici laterali larghi 3,4 m e le colonne interne stavano sul filo del fornice centrale; ora stanno in mezzo ai piloni.
    La quadriga a sei o otto cavalli e i quattro cavalieri in cima, noti dalle monete, non sono disegnati: non si sa quando sparirono. Nessuna strada ci passa sotto («never traversed
    by a road until mediaeval times»): niente strozzatura. */
 {id:'arcoseveroforo', nome:'Arco di Settimio Severo', etichetta:'Arco di Severo', ey:2.8, x:-4.6,z:-3.7, ry:.94, come:'fori', zone:[], fa:function(B){
    muroForato(B,2.5,1.62,1.185,[[0,.7,1.2],[-.82,.3,.78],[.82,.3,.78]],P.marmo); B.scatola(2.62,.13,1.3,0,1.62,0,P.marmo).scatola(2.5,.56,1.185,0,1.75,0,P.marmo);      // i fornici, la trabeazione che gira tutt'attorno, l'attico
    [1,-1].forEach(function(q){ var z=q*.71; [-1.11,-.51,.51,1.11].forEach(function(x){ B.scatola(.22,.55,.22,x,0,z,P.marmo).colonne(x,z,x,z,1,.88,.045,.55).scatola(.24,.19,.24,x,1.43,z,P.marmo); B.scatola(.12,1.62,.03,x,0,q*.6,P.marmo); });      // piedistallo con la base (alto 5,5 m: schema), colonna libera (8,78 m, diametro 0,90), il suo tratto di trabeazione; dietro, la lesena
      B.scatola(1.9,.42,.02,0,1.8,q*.6,P.travertino); [-.82,.82].forEach(function(x){ B.scatola(.5,.42,.02,x,1.0,q*.6,P.travertino).scatola(.4,.07,.02,x,.82,q*.6,P.travertino); }); });      // l'iscrizione dell'attico, i quattro grandi rilievi sopra i fornici laterali e le fasce strette sotto
 }},
 /* Arco di Tiberio (27 novembre 2026), dalla voce Arcus Tiberii di Platner e Ashby letta per intero (src/testi/topografia-fonti.md, «Gli archi, uno per uno»): eretto nel 16 d.C.;
    «It stood at the north-west corner of the basilica Julia, on the north side of the Sacra Via, which was made narrower at this point by having its curb bent toward the south.
    The arch was single … and was approached by steps from the level of the forum»; fondazioni «9 metres long and 6.3 wide». Nessun contorno su OpenStreetMap: il punto sta a nord
    dell'angolo nord-ovest della basilica Giulia (9 m a nord del suo fianco nel modello, 7 a nord e 9 a est dell'angolo del contorno di OpenStreetMap), fra i Rostri e Saturno, fuori
    dalle strade del modello (la via Sacra lungo la basilica non c'è). Schema, detto in scheda: quale lato è la fronte (qui verso la piazza, il passaggio sull'asse del Foro), altezza
    (10 m), luce del fornice (4 m), lo zoccolo alto 1,5 m e i tre gradini dal lato della piazza. Né statue né iscrizione: la fonte non ne dà (i frammenti attribuiti non sono suoi).
    Quando sparì non si sa: in piedi fino all'852. Niente strozzatura: nessuna strada del modello ci passa. */
 {id:'arcotiberio', nome:'Arco di Tiberio', etichetta:'Arco di Tiberio', ey:1.5, x:-7,z:1, ry:1.221, come:'fori', zone:[], fa:function(B){
    B.scatola(.9,.15,.63,0,0,0,P.travertino);                                                                                    // lo zoccolo sulle fondazioni di 9 x 6,3 m
    for(var g=0;g<3;g++) B.scatola(.6,.05*(3-g),.09,0,0,.315+.045+g*.09,P.travertino);                                         // i gradini dal piano del Foro (lato +z, verso la piazza)
    B.dentro(0,.15,0,0,function(B){ muroForato(B,.9,.66,.63,[[0,.4,.55]],P.marmo); B.scatola(.96,.06,.67,0,.66,0,P.marmo).scatola(.9,.2,.63,0,.72,0,P.marmo); });      // il fornice, la cornice, l'attico
 }},
 {id:'vesta', nome:'Tempio di Vesta e casa delle Vestali', etichetta:'Vesta', x:7.4,z:9, ry:-.35, come:'fori', zone:[], fa:function(B){
    B.cilindro(.76,.32,0,0,0,P.marmo,null,20).cilindro(.47,1.25,0,.32,0,P.marmo,null,16);                                      // il tempio: rotondo, colonne tutt'attorno, tetto conico con il foro per il fumo; il podio è largo 15 m («a circular foundation … 15.05 metres in diameter», Platner e Ashby, Vesta; 27 novembre 2026: prima 20)
    for(var k=0;k<20;k++){ var a=k*PI/10; B.cilindro(.048,1.25,.65*Math.cos(a),.32,.65*Math.sin(a),P.marmo,.042,7); }        // «peripteral, with twenty columns» (Platner e Ashby, Vesta)
    B.cilindro(.74,.14,0,1.57,0,P.marmo,null,20).cilindro(.74,.42,0,1.71,0,P.bronzo,.12,20);
    var p=LF(10.78,12.35), q=LF(7.4,9);                                                                                            // la casa delle Vestali: il centro del cortile su OpenStreetMap (relazione 13402580; prima 11,2, 13,1, dal gruppo dei Fori)
    B.dentro(p[0]-q[0],0,p[1]-q[1],0,function(B){ portico(B,6.8,3,0,0,0,1); B.scatola(6.8,1.1,.5,0,1.15,-1.5,P.mattone).scatola(.5,1.1,3,-3.4,1.15,0,P.mattone).scatola(.5,1.1,3,3.4,1.15,0,P.mattone); });      // il lungo cortile porticato, a due piani
 }},
 {id:'emilia', nome:'Basilica Emilia', x:7.2,z:-1, ry:-.35, come:'fori', fa:function(B){ basilica(B,8,3.4,1.8,0,0); }},
 /* La Basilica Emilia dopo l'incendio, probabilmente del 410 (scheda): il tetto è crollato e non viene rifatto; sul pavimento restano le monete. Qui il pavimento di marmo, i pilastri
    delle arcate rotti ad altezze diverse, i monconi delle colonne della navata, qualche fusto caduto e le travi bruciate. Altezze e numero dei pezzi sono indicativi; il portico di
    facciata che alcuni studiosi vogliono rifatto nel V secolo non si disegna (è discusso). Prima del 23 novembre 2026 era il blocco intero annerito dallo shader («va resa meglio»). */
 {id:'emiliarovina', nome:'Basilica Emilia', x:7.2,z:-1, ry:-.35, come:'fori', note:{chiuso:'in rovina dopo l’incendio'}, fa:function(B){
    var r=RM.casuale(410), i, h, x, TR=P.travertino, CARB=RM.col(0x3a3129);
    B.scatola(8,.08,3.4,0,0,0,P.marmo);                                                                                      // il pavimento
    for(i=0;i<8;i++){ x=-3.5+i; h=.45+1.25*r(); if(r()>.15) B.scatola(.42,h,.34,x,0,1.55,TR); h=.6+1.1*r(); if(r()>.1) B.scatola(.42,h,.34,x,0,-1.55,TR); }      // pilastri delle arcate, verso il Foro e dietro
    [-1,1].forEach(function(k){ B.scatola(.3,.9+.8*r(),3.4,k*3.85,0,0,TR); });                                               // i lati corti
    for(i=0;i<12;i++){ x=-3.3+i*.6; [-.75,.75].forEach(function(z){ if(r()<.75) B.cilindro(.07,.15+.9*r(),x,.08,z,P.marmo,.065,8); }); }      // i monconi delle colonne della navata
    for(i=0;i<5;i++) B.scatola(.85,.12,.12,-3+6*r(),.08,-1+2*r(),P.marmo,r()*3.14);                                            // fusti caduti
    for(i=0;i<6;i++) B.scatola(1.4,.1,.1,-3+6*r(),.1,-1.2+2.4*r(),CARB,r()*3.14);                                               // travi del tetto bruciate
 }},
 {id:'giove', nome:'Tempio di Giove Capitolino', x:-29,z:0, ry:.5, zone:[[0,0,7.5]], fa:function(B){      // basamento di circa 54 x 62 m, la misura più citata (le stime pubblicate vanno da 50 a 74 m di lato: pianta discussa)
    B.scatola(5.4,.2,6.2,0,0,0,P.tufo).dentro(0,.2,0,0,function(B){ B.tempio(4.5,5.3,2.8,0,0,0,{fronte:6,lati:7,tetto:P.oro,podio:.3,r:.17}); });      // podio alto in tutto 5 m: «Its height was apparently from 4 to 5 metres» (Platner e Ashby, Aedes Iovis Capitolini)
 }},
 {id:'palatino', nome:'Palazzi del Palatino', x:13,z:47, ry:-.62, altoFisso:5.4, raggioFisso:14.25, zone:[[-7,-1,13],[7,-1,13],[0,6,12]], fa:function(B){
    arcato(B,27,1.5,18,0,-.4,0,P.mattone,2,22);                                                // sostruzioni
    /* Domus Flavia, Domus Augustana con lo stadio e tempio di Apollo sono monumenti a sé dal 27 novembre 2026 (id 'domusflavia', 'domusaugustana', 'apollopalatino', qui sotto):
       stesso disegno, stesso posto, stessa quota; il gruppo tiene le sostruzioni e le sue misure (altoFisso, raggioFisso) */
    /* il Settizodio è un monumento a sé dal 26 novembre 2026 (id 'settizodio', qui sotto), spostato all'angolo sud-est del colle */
 }},
 /* Palazzi del Palatino resi monumenti a sé il 27 novembre 2026 (l'utente: «Almeno di questi devono esserci tutti»). x, z: il centro di ogni pezzo nelle coordinate del gruppo 'palatino'
    (x 13, z 47, ry -0,62), portato nella città; dentro, lo stesso disegno di prima spostato di quel centro e alzato di 1,1 come nel gruppo. Fonti in coda a src/testi/topografia-fonti.md,
    «Mancanti aggiunti, secondo gruppo». */
 {id:'domusflavia', nome:'Domus Flavia', etichetta:'Domus Flavia', x:8.755,z:40.898, ry:-.62, come:'palatino', zone:[], fa:function(B){      // Platner e Ashby, Domus Augustiana: «almost entirely» di Rabirio, finita nel 92; peristilio, Aula Regia, basilica, larario, triclinio
    B.dentro(7,1.1,2.5,0,function(B){
      portico(B,8.5,8,-7,0,-1,1.2,P.prato);                                                    // Domus Flavia: peristilio
      B.scatola(4.6,3.4,5,-7,0,-7.6,P.intonaco).falde(5,.9,4.8,-7,3.4,-7.6,P.coppi,PI/2,P.intonaco);          // Aula Regia: la sala delle udienze, altissima, con la facciata a colonne verso l'area Palatina
      B.scatola(2.4,2.4,5,-10.8,0,-7.6,P.intonaco).scatola(2.4,2.4,5,-3.2,0,-7.6,P.intonaco);                 // basilica e larario, ai lati
      B.colonne(-11.8,-10.4,-2.2,-10.4,12,1.9,.09,0).scatola(10.2,.14,.7,-7,1.9,-10.3,P.marmo).vano(-7,0,-10.12,1,0,.7,1.5);
      B.aperture(-8.9,-10.12,-5.1,-10.12,3,2.2,.8,.5);
      B.scatola(5.4,2.6,3.6,-7,0,5,P.intonaco).falde(5.6,.7,3.8,-7,2.6,5,P.coppi,0,P.intonaco);               // triclinio, con i due ninfei ovali ai fianchi
      [-1,1].forEach(function(q){ B.cilindro(.9,.14,-7+q*3.6,0,5,P.marmo,null,14).cilindro(.75,.05,-7+q*3.6,.14,5,P.acqua,null,14); });
    });
 }},
 {id:'domusaugustana', nome:'Domus Augustana e stadio palatino', etichetta:'Domus Augustana', x:17.883,z:50.486, ry:-.62, come:'palatino', zone:[], fa:function(B){      // Platner e Ashby, Domus Augustiana: il palazzo privato e l'«hippodromus Palatii», riparato da Teodorico e Atalarico (bolli dei mattoni)
    B.dentro(-6,1.1,0,0,function(B){
      arcato(B,9,2.7,13.5,2.6,0,-.5,P.mattone,2,7);                                            // Domus Augustana
      B.scatola(4,.12,4,2.6,2.7,-3.4,P.ombra).scatola(4,.12,4,2.6,2.7,2.6,P.ombra);
      var es=RM.ellisse(4.4,2.2,14,0,PI).map(function(p){ return [p[0]+2.6,p[1]+6.2]; }); B.striscia(es,-1.4,es,2.2,P.mattone,false).fornici(es,-1.1,.8,.5,1,false).fornici(es,.6,.8,.5,1,false);
      B.scatola(4.6,1.6,.3,9.4,0,-4.6,P.mattone).scatola(.3,1.6,14,7.2,0,2.4,P.mattone).scatola(.3,1.6,14,11.6,0,2.4,P.mattone).scatola(4,.1,13.6,9.4,0,2.4,P.prato);   // stadio palatino: giardino a forma di circo, col lato sud curvo
      var cs=RM.ellisse(2.2,1.4,8,0,PI).map(function(p){ return [p[0]+10.6,p[1]+6.8]; }); B.striscia(cs,0,cs,1.6,P.mattone,false);
      B.colonne(9,-6.6,9,6.4,46,.9,.045,.1).colonne(12.2,-6.6,12.2,6.4,46,.9,.045,.1).scatola(.5,.08,13.4,8.75,1,-.1,P.coppi).scatola(.5,.08,13.4,12.45,1,-.1,P.coppi);      // il portico attorno (colonne con le proporzioni di portico(): prima 14 per lato, a 10 m)
      B.scatola(1.6,2.2,2.6,13.6,0,-.2,P.mattone).cupola(1.3,13.6,2.2,-.2,P.intonaco,.5);        // la tribuna imperiale, sul lato est
    });
 }},
 {id:'apollopalatino', nome:'Tempio di Apollo Palatino', etichetta:'Apollo Palatino', x:1.665,z:43.085, ry:-.62, come:'palatino', zone:[], fa:function(B){      // Platner e Ashby, Apollo Palatinus: «burned down on 18th March, 363 (Amm. XXIII.3.3)»; resta il podio con la scalinata
    B.dentro(0,1.1,0,0,function(B){ B.tempio(2.4,3.6,1.8,0,0,0,{fronte:6}); });
 }},
 /* Settizodio (203): facciata scenografica a tre ordini di colonne libere, con tre grandi nicchie, verso chi arriva dalla via Appia. Demolito nel 1588-89; forma dai disegni del Cinquecento.
    Fino al 26 novembre 2026 stava in fondo al gruppo 'palatino', sul pianoro, circa 200 m a nord-ovest del suo posto. Ora sta al punto di Wikidata (Q1234446: 41.8856 N, 12.4887 E, con RM.ll
    x 28,18, z 76,68), al piede dell'angolo sud-est del Palatino, dove lo mette Platner e Ashby («at the extreme south-east corner of the Palatine hill», voce Septizonium); il punto di
    en.wikipedia (41.8854, 12.4889) dista circa 25 m. La facciata è la stessa di prima; prima guardava la valle del Circo (orientamento del gruppo, -0,62) e chi arrivava
    dalla via Appia la vedeva di taglio. Ora guarda porta Capena, da dove arriva l'Appia (ry 0,955: la direzione dal Settizodio alla porta), perché la Storia Augusta (Severo 24, riportata
    da Platner e Ashby) dice che doveva colpire chi arrivava dall'Africa: l'angolo esatto nessuna fonte letta lo dà. Prima era interrata di 4 m nel ciglio del colle, ora poggia sul piano
    della valle con tutti e tre gli ordini fuori terra. Altezza: nessuna fonte letta la dà. */
 {id:'settizodio', nome:'Settizodio', x:28.18,z:76.68, ry:.955, zone:[[0,.3,[4.9,.9],.3]], fa:function(B){
    B.scatola(9,2.9,.5,0,0,0,P.marmo);
    [0,1,2].forEach(function(l){ var yy=l*.97; B.colonne(-4.2,.75,4.2,.75,12,.82,.055,yy).scatola(9,.13,.95,0,yy+.82,.42,P.marmo); if(l<2) [-3,0,3].forEach(function(x){ B.vano(x,yy+.02,.27,1,0,1.5,.78); }); });
 }},
 /* Il tempio della Magna Mater (Cibele) all'angolo ovest del Palatino, in cima alle scale di Caco (Platner e Ashby, Magna Mater, aedes): lungo 33,18 m e largo 17,10,
    corinzio, prostilo esastilo, con una scalinata larga quanto tutta la fronte; podio massiccio. Il punto di Wikidata (Q383609: x -5,8, z 32,2) nel modello cade sul fianco del colle,
    che qui è più stretto del vero: il tempio sta sul ciglio dell'angolo ovest del pianoro, a x 0, z 37 (scelta). Fronte verso l'esterno del colle (ovest-nord-ovest): scelta.
    Altezza delle colonne e del podio: nessuna fonte letta; qui 13 e 5 m. */
 {id:'magnamater', nome:'Tempio della Magna Mater', etichetta:'Magna Mater', x:0,z:37, ey:3.6, ry:-2.1, come:'palatino', zone:[[0,.3,[1.3,2.4],.3]], fa:function(B){      // poggia sul piano del palazzo (come); la zona tiene lontane le case, senza toccare il terreno (PENDIO, più sotto)
    B.tempio(1.71,3.32,1.3,0,0,0,{fronte:6,podio:.5});
    for(var g=0;g<4;g++) B.scatola(2.2,.5*(4-g)/4.3,.22,0,0,1.66+.25+.11+g*.22,P.travertino);                                 // la scalinata larga quanto la fronte
 }},
 /* La Domus Tiberiana, il palazzo sulla metà nord-ovest del Palatino (Platner e Ashby, Domus Tiberiana): rifatto da Domiziano; «the whole rectangle (about 100 by 150 metres) seems
    to have had a large courtyard with pillars in the centre», e gran parte poggia su sostruzioni ad arcate; verso il Foro, sopra il clivo della Vittoria, un balcone a due ordini
    e uno a un ordine tutt'attorno. Qui: un rettangolo di 100 x 60 m (scelta: il pianoro del modello è più piccolo del vero), le sostruzioni ad arcate dal piede del pendio fino al
    piano del colle, sopra le ali a due piani attorno al cortile con i pilastri. Posto: Wikidata (Q1238767: x 7,5, z 25,6) cade sul pendio; il centro è a x 2, z 28,5, sul ciglio
    nord-ovest, girato come il palazzo (-0,62). Forme e altezze sono uno schema. La parte su cui fu costruita Santa Maria Antiqua, ai piedi del colle, non è disegnata. */
 {id:'tiberiana', nome:'Domus Tiberiana', etichetta:'Domus Tiberiana', x:2,z:28.5, ry:-.62, come:'palatino', zone:[[0,0,[5.3,3.3],.3]], fa:function(B){      // poggia sul piano del palazzo (come); la zona tiene lontane le case, senza toccare il terreno (PENDIO, più sotto)
    var Y0=RM.hGrezza(13,47)-.1, T=7.22-Y0, yb=.6-Y0, l;                                                                     // Y0: il piano del gruppo palatino; T: il piano del colle (7,2 nel modello); yb: sotto il piede del pendio verso il Foro
    arcato(B,10,T-yb,6,0,yb,0,P.mattone,4,18);                                                                                // le sostruzioni, con le arcate verso il Foro
    for(l=0;l<4;l++){ var yy=yb+(T-yb)*(l+.14)/4, hh=(T-yb)/4*.6; B.aperture(-5,-3,-5,3,10,yy,hh).aperture(5,3,5,-3,10,yy,hh); }      // e sui lati corti
    B.scatola(10.1,.12,6.1,0,T-.12,0,P.travertino);                                                                            // il piano, con la cornice
    portico(B,5,2.6,0,T,.1,.9);                                                                                                // il cortile coi pilastri
    [-1,1].forEach(function(q){ B.scatola(10,1.5,1.4,0,T,q*2.3,P.intonaco).falde(10,.42,1.5,0,T+1.5,q*2.3,P.coppi,0,P.intonaco);      // le ali lunghe
      B.aperture(q<0?4.8:-4.8,q*3,q<0?-4.8:4.8,q*3,16,T+.25,.45,.22,true).aperture(q<0?4.8:-4.8,q*3,q<0?-4.8:4.8,q*3,16,T+.95,.38,.2,true);
      B.scatola(2.4,1.5,3.2,q*3.8,T,0,P.intonaco).falde(3.2,.42,2.5,q*3.8,T+1.5,0,P.coppi,PI/2,P.intonaco); });                // le ali corte
 }},
 {id:'pantheon', nome:'Pantheon', x:-70,z:-68, ry:PI, zone:[[0,0,7],[0,7,6],[0,11.5,5],[0,-3.7,3.5],[0,11.1,[3.4,6.6],.5]], et:1, fa:function(B){      // l'ultima zona è la piazza porticata (pantheonpiazza), fino al lato nord, aperto
    /* La rotonda: tamburo di 56 m di diametro (43,2 dentro e muri di 6,2: Platner), alto circa 31, diviso in tre fasce da cornici; sopra, sette gradoni, il primo
       ancora rivestito di marmo, gli altri e la calotta coperti di tegole di bronzo (dorato secondo Cinti, ripreso da it.wikipedia; il Liber Pontificalis dice solo
       «tegulis aereis»): le toglie Costante II nel 663, Gregorio III (731-741) rifà il tetto «chartis plumbeis» (LP XCII 12). Il cambio di copertura sta nel modulo in fondo. */
    B.cilindro(2.8,3.05,0,0,0,P.intonaco,null,44);
    [1.22,2.2,3.02].forEach(function(y){ B.cilindro(2.87,.09,0,y,0,P.marmo,null,44); });
    for(var gr=0;gr<7;gr++) B.cilindro(2.74-gr*.075,.09,0,3.05+gr*.08,0,gr?P.oro:P.marmo,null,40);                                // i sette gradoni
    B.cupola(2.24,0,3.6,0,P.oro,.44,.2);                                                                                            // calotta con l'occhio di 9 m
    /* Avancorpo: il blocco fra pronao e rotonda, col secondo frontone più alto di quello del pronao; la punta arriva poco sotto la cima del tamburo (forma dalle foto, a memoria). */
    B.scatola(3.44,2.42,1.25,0,0,3,P.intonaco).scatola(3.5,.1,1.3,0,2.35,3,P.marmo).falde(1.3,.55,3.5,0,2.45,3,P.bronzo,PI/2,P.marmo);      // 27 novembre 2026: l'avancorpo alto 2,42 e non 2,45, sotto la cornice: le due facce di sopra stavano alla stessa quota
    /* Pronao, 34 x 13,6 m (Platner; 34,2 x 15,6 per Ziolkowski), rialzato di 1,3 m sulla piazza: otto colonne di granito grigio in fronte, quattro di granito rosa
       in ciascuna delle due file dietro (Platner), colonne alte 14,15 m con basi e capitelli (Ziolkowski). Nessuna cella: dietro le colonne c'è la porta di bronzo.
       Che le file interne stiano dietro la prima, la terza, la sesta e l'ottava colonna, formando tre navate, è detto a memoria. */
    var ROSA=RM.col(0xa98272), zf=5.1;
    B.scatola(3.42,.13,1.58,0,0,4.41,P.travertino);
    for(var gd=1;gd<=7;gd++) B.scatola(2.6,.13*(8-gd)/8,.06,0,0,5.2+gd*.06,P.travertino);                                          // i sette gradini, 1,30 m in tutto sopra il lastricato della piazza (Marder e Wilson Jones 2015, p. 59, ripreso da en.wikipedia «Pantheon, Rome»); prima erano cinque
    B.colonne(-1.64,zf,1.64,zf,8,1.415,.074,.13,P.granito);
    [zf-.48,zf-.96].forEach(function(z){ [-1.64,-.7,.7,1.64].forEach(function(x){ B.colonne(x,z,x,z,1,1.415,.074,.13,ROSA); }); });
    B.scatola(3.42,.2,1.6,0,1.545,4.4,P.marmo);                                                                                     // trabeazione; le iscrizioni del fregio e dell'architrave stanno in fondo al file
    B.falde(1.64,.68,3.5,0,1.745,4.42,P.bronzo,PI/2,P.marmo);                                                                       // frontone e tetto, retto da capriate di bronzo
    B.vano(0,.13,3.66,1,0,.62,1.15);                                                                                                // la grande porta di bronzo
    [-1.17,1.17].forEach(function(x){ B.vano(x,.25,3.66,1,0,.4,.85); });                                                           // le due nicchie in fondo alle navate laterali
 }},
 /* La piazza e l'aula a sud stanno in una maglia a parte, perché il cambio di copertura del Pantheon (663, 735) non tocchi i loro tetti di coppi */
 /* La piazza davanti al pronao (rifatta il 25 novembre 2026; prima era un recinto murato su tre lati, staccato di 6 m dai gradini e cieco a nord: chi arrivava dal Campo Marzio
    vedeva un muro). Fonti lette: «In front of it was an open space surrounded by colonnades» (Platner e Ashby, Pantheon); il pronao stava sette gradini, 1,30 m, sopra il
    lastricato (Marder e Wilson Jones 2015, p. 59, da en.wikipedia); il lastricato adrianeo di travertino si è ritrovato in piazza della Rotonda e la piazza antica era
    «molto più grande» di oggi verso nord (Soprintendenza Speciale di Roma, 2020, in Turismo Roma). Nessuna fonte letta dice di un muro o di una demolizione nel 609.
    Ipotesi, dette nella scheda del Pantheon: larga 66 m come la piazza di oggi (OpenStreetMap, way 1295329514), lunga 120 m, fino all'altezza della Maddalena; portici a una navata
    sui lati lunghi, col muro verso l'esterno; sul lato nord un colonnato a due file, senza muro, che si attraversa. L'«arcus Pietatis» che i testi medievali (Mirabilia) mettono
    a nord del Pantheon, «perhaps in the line of the enclosing porticus» (Platner e Ashby, arcus), non si disegna: posto e data non si conoscono. */
 /* Rifatta di nuovo il 25 novembre 2026, sugli scavi (src/testi/topografia-fonti.md, sezione 3): Lanciani, Notizie degli scavi 1881, pp. 262 e 269-274, e Hülsen 1907, pp. 589-590.
    La piazza, lastricata di travertino, stava 1,32 m sotto il piano del pronao; larga circa 60 m («ca. 60 m breit», Hülsen; poco o nulla più della piazza di oggi, Lanciani) e lunga
    circa il doppio. Portico est: fondamenta sotto le case di oggi, pavimento di granito 1,19 m sopra la piazza, sei gradini, colonne di granito bigio larghe 1,00 m (Lanciani). Portico ovest:
    nessun resto, «ma sarebbe assurdo credere che non vi fosse» (Lanciani): probabile, detto nella scheda. Lato nord: nessun portico; la piazza finiva su una strada antica, perpendicolare
    all'asse, trovata nel 1873 sotto via delle Coppelle (Lanciani): il colonnato a due file di stamattina non aveva fonti ed è tolto. Qui la piazza resta lunga 120 m, come prima; la strada
    del modello (la «via Recta») passa 35 m più a nord e una via corta, sulla linea di via della Maddalena (ipotesi), la unisce al lato aperto (VIE in src/roma/genera.mjs).
    Dopo il 609: le scale del pronao rifatte alla meglio con pezzi di spoglio (scavo del 1874; quando, non si sa) sono un dettaglio che a questa scala non si vede; case addossate e interramento
    non hanno date nelle fonti lette e non ci sono. L'arcus Pietatis non si disegna: posto e data ignoti (Hülsen). Profondità dei portici e altezza delle colonne (dieci diametri) indicative. */
 {id:'pantheonpiazza', x:-70,z:-68, ry:PI, come:'pantheon', fa:function(B){
    var W=6.6, Z0=4.4, Z1=17.65, L=Z1-Z0, ZC=(Z0+Z1)/2;
    B.scatola(W,.12,Z1-5.65,0,-.1,(5.65+Z1)/2,P.selce);                                                                                // il lastricato, alla quota del piede dei gradini
    [-1,1].forEach(function(q){ B.dentro(q*(W/2-.65),0,ZC,-q*PI/2,function(B){ porticoDritto(B,L,.65,1.22,true,{rialzo:.119,gradini:6,colore:P.granito}); }); });      // i portici dei lati lunghi, dal fianco del pronao al lato nord, aperto: colonne di 1 m (alte dieci diametri)
    /* A sud, addossata alla rotonda, l'aula detta basilica di Nettuno: 45 x 19 m, con un'abside di 9 m nel muro nord (Platner, Thermae Agrippae). Altezza e tetto sono ricostruiti. */
    B.scatola(4.5,2,1.9,0,0,-3.7,P.mattone).falde(4.6,.5,2,0,2,-3.7,P.coppi,0,P.mattone);
 }},
 /* Odeon di Domiziano (27 novembre 2026; mancava: src/design/completezza-monumenti.md, sezione 2, n. 11). Platner e Ashby, Odeum: «a building for musical performances, erected by Domitian
    in the campus Martius, probably near the Stadium», restaurato da Apollodoro sotto Traiano, 10.600 posti (circa 5000 persone; it.wikipedia ne dà 10.000), nel IV secolo fra i
    monumenti più notevoli (Ammiano XVI 10, 14), nel V fra i sette «mira praecipua» (Polemio Silvio). Il posto: «The outline of its cavea is still preserved by the façade of the
    Palazzo Massimo alle Colonne» (en.wikipedia), a sud dello stadio. Centro e raggio (63 m) sono ricavati dalla curva della facciata del palazzo su OpenStreetMap (via 125915788,
    cinque punti): l'arco è corto, la misura è incerta. La cavea guarda a nord, verso lo stadio. La scena «alta quattro piani» e le circa novanta colonne (una, di cipollino, è in piazza
    dei Massimi) sono di it.wikipedia. Schema: facciata (due ordini di arcate), altezze, profondità della scena; se fosse coperto non si sa, e qui non lo è. */
 {id:'odeon', nome:'Odeon di Domiziano', x:-95.3,z:-52.4, ry:0, zone:[[0,0,6.6]], fa:function(B){
    teatroVero(B,{r:6.3, archi:40, ordini:[[.05,1.1,.76],[1.1,2.2,.72]], rorc:1.9, scena:[9,1,2.2], frons:4, nc:22});
 }},
 {id:'domiziano', nome:'Stadio di Domiziano', x:-101,z:-74, ry:PI/2, lunga:[28,7.5], fa:function(B){ stadio(B,27.5,10.6,1.9); }},      // circa 275 x 106 m, la curva a nord: è piazza Navona. Ordini di arcate e altezza della facciata sono ricostruiti
 {id:'traiano', nome:'Terme di Traiano', x:97.4,z:3.7, ry:-.524, zone:[[0,0,[12,12.5],3.5],[0,17,2.4,1.5]], fa:function(B){ termeTraiano(B);      /* 27 novembre 2026: pianta propria (termeTraiano); ry da -.62 a -.524, «at an angle of 30 degrees from the meridian» (Platner e Ashby). Posizione: il centro della relazione OpenStreetMap 13162787 «Thermae Traianae» (Nominatim, 23 novembre 2026); prima stava circa 95 m più a ovest */
    /* La terrazza (25 novembre 2026): le terme stanno su un piano artificiale, fondato dentro le sale della domus Aurea riempite («This exedra was built over part of the domus Aurea»,
       muri aggiunti «to provide sufficiently strong foundations», Platner e Ashby, Thermae Traiani). Verso la valle del Colosseo (+z) il piano sta circa 35 m sopra il terreno: lì e sugli
       altri lati dove il colle scende si vedono muri di mattoni. Prima la zona sfumava su 70 m e la terrazza stava su un cumulo, staccata da terra fino a 15 m. Forma dei muri: una resa. */
    zoccolo(B,-15.85,15.85,-16.35,16.35,-3.75,.02,P.mattone,.7);
    var esT=RM.ellisse(4.65,3.7,16,0,PI).map(function(p){ return [p[0],p[1]+12.6]; }); B.striscia(esT,-3.75,esT,.02,P.mattone,false).striscia(esT.slice().reverse(),-3.75,esT.slice().reverse(),.02,P.mattone,false);      // sotto l'esedra del lato verso il Colosseo (27 novembre 2026: l'esedra sta al centro del lato sud del recinto, misure estreme 340 x 330 m)
 }},
 /* Terme di Tito: «just west of the later thermae Traianae on the edge of the slope overhanging the Colosseum, with the same orientation as the domus Aurea … about 105 by 120 metres.
    The façade and principal entrance were on the north side … a caldarium projecting out from the south side» (Platner e Ashby, Thermae Titi). Oggi quasi nulla resta (it.wikipedia: fra via Nicola Salvi,
    via delle Terme di Tito e viale del Monte Oppio). Centro e orientamento sono stimati da queste vie; corpo unico senza recinto, caldario verso il Colosseo. */
 {id:'tito', nome:'Terme di Tito', x:68,z:10, ry:0, zone:[[0,-.2,[4,3.3],1.6],[0,4.35,.9,.8]], fa:function(B){ corpoTerme(B,{W:10.5,D:8.5,z0:-4.75,hb:1.6,sala:[3.2,1.8,2.8],nat:[3.4,1.8],frig:'sala',ingresso:true,pal:[2.4,3.4],cald:{forma:'tondo',r:.9,sporge:1.5,h:2.2},tep:{forma:'rett',w:1.1,d:.9}});      // 27 novembre 2026: lo stesso corpo delle terme imperiali (corpoTerme), senza recinto, ingresso a nord e caldarium che sporge a sud (Platner e Ashby); le sale interne sono schema. Zone a misura dell'edificio (25 novembre 2026: prima un cerchio di 50 m sotto un corpo di 105 x 102, che restava in parte sepolto e in parte sospeso)
    zoccolo(B,-5.25,5.25,-4.75,3.75,-1,.02,P.mattone,.25); B.cilindro(.9,1.02,0,-1,4.35,P.mattone,null,16);      // lo zoccolo dove il bordo dell'Oppio scende, «on the edge of the slope overhanging the Colosseum» (Platner e Ashby)
 }},      // corpo centrale di circa 190 x 212 m, verso il lato nord del recinto (it.wikipedia, da Caruso e Volpe); il caldarium tondo è schematico
 {id:'caracalla', nome:'Terme di Caracalla', x:59,z:150, ry:-.78, zone:[[0,0,25]], et:1, fa:function(B){ termeCaracalla(B); }},      // 27 novembre 2026: pianta propria (termeCaracalla). Il caldarium rotondo, al centro del lato sud-ovest, ha una cupola di 35 m; sul fondo del recinto la gradinata e le cisterne, sui fianchi le due esedre (Platner)
 {id:'diocleziano', nome:'Terme di Diocleziano', x:101,z:-122, ry:-.78, zone:[[0,0,27.5]], et:1, fa:function(B){ termeDiocleziano(B); }},      // 27 novembre 2026: pianta propria (termeDiocleziano), recinto di 356 x 316 m invece di 376 x 360. Corpo centrale di 280 x 160 m, caldarium rettangolare che sporge a sud-ovest, tepidarium circolare, grande esedra al centro del lato sud-ovest, due sale rotonde agli angoli ovest e sud (Platner)
 {id:'massenzio', nome:'Basilica di Massenzio', x:25,z:7, ry:-.35, zone:[[0,0,7.5]], fa:function(B){
    B.scatola(8.2,3.5,2.6,0,0,0,P.mattone); for(var i=-1;i<=1;i++){ B.falde(2.7,.9,2.7,i*2.72,3.5,0,P.bronzo,PI/2,P.mattone);
      [-1,1].forEach(function(k){ B.scatola(2.6,2.4,2,i*2.72,0,k*2.3,P.mattone).volta(2,1.3,i*2.72,2.4,k*2.3,P.intonaco,PI/2); B.vano(i*2.72,.25,k*3.31,1,0,.5,.9).vano(i*2.72-.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72+.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72,1.4,k*3.31,1,0,1.6,1.5); }); }      // ogni campata laterale: tre archi in basso e il grande finestrone sopra
    B.falde(8.2,.9,2.6,0,3.5,0,P.bronzo,0,P.mattone);
    B.aperture(-3.9,1.31,3.9,1.31,3,2.75,.7,1.5).aperture(3.9,-1.31,-3.9,-1.31,3,2.75,.7,1.5);                    // i finestroni della navata, sopra le volte laterali
    B.cilindro(1.25,3.2,-4.15,0,0,P.mattone,null,16).cupola(1.25,-4.15,3.2,0,P.intonaco,.6);                      // l'abside ovest, dove stava il colosso di Costantino
    /* Costantino aggiunge «a second entrance from the Sacra via in the middle of the south side» e, di fronte, «a second semicircular apse in the north wall», grande come quella ovest
       ma più bassa (Platner e Ashby, Basilica Constantini). Qui +z è il sud, verso la via Sacra. */
    B.colonne(-1,3.75,1,3.75,4,1.5,.09,0).scatola(2.6,.14,.8,0,1.5,3.7,P.marmo);                                  // il portico d'ingresso sul fianco sud
    B.cilindro(1,2.4,0,0,-3.3,P.mattone,null,16).cupola(1,0,2.4,-3.3,P.intonaco,.6);                               // l'abside nord, la sala del tribunale
 }},
 {id:'venere', nome:'Tempio di Venere e Roma', x:36.3,z:17.8, ry:-.42, zone:[[0,0,[3.75,1.5],3.5],[-9,4.5,4.5,6]], fa:function(B){      // tempio di Venere e Roma. Zone (25 novembre 2026): il podio, spianato fino ai suoi muri; il colmo della Velia verso il Foro, dove stanno l'arco di Tito e la via Sacra
    /* Posizione e orientamento dal contorno della piattaforma su OpenStreetMap (relazione 1841091, 23 novembre 2026): i lati lunghi corrono a circa 24° a sud dell'est, lungo la via Sacra,
       che passa libera fra il podio e il Palatino. Prima era girato di 7° di meno e copriva la strada a est dell'Arco di Tito.
       Podio di 145 x 100 m rivestito di travertino; tempio decastilo e pseudodiptero, con colonne di 1,8 m di diametro e due celle schiena contro schiena, ciascuna con quattro colonne fra le ante;
       sui lati lunghi del recinto, portici di colonne di granito grigio (Platner e Ashby). La cella di Roma guarda il Foro (-x), quella di Venere il Colosseo (+x).
       Non lette: il numero delle colonne sui fianchi (qui 22) e le altezze. Le tegole erano di bronzo dorato: le porta via papa Onorio I verso il 630. */
    /* Il podio scende fino al piede della Velia (25 novembre 2026): prima era alto 7 m e sotto c'era un pendio di terra di 70 m. Verso il Colosseo è più alto, per il pendio, e dentro
       ha le camere «for the storage of the machinery and apparatus of the amphitheatre»; verso il Foro «a wide flight of steps», verso il Colosseo «only two small flights» (Platner e Ashby).
       Le due scale piccole scendono lungo il muro, perché fra il podio e il Colosseo non c'è spazio per una scala diritta: è una resa, come il numero dei gradini e delle camere. */
    B.scatola(14.5,3.3,10,0,-2.6,0,P.travertino).scatola(14.56,.08,10.06,0,.62,0,P.marmo);
    for(var g=0;g<8;g++) B.scatola(.12,.7*(8-g)/8,6,-7.31-g*.12,0,0,P.travertino);                                                  // la scalinata larga verso il Foro
    B.aperture(7.25,4.6,7.25,-4.6,10,-1.75,.8,.55);                                                                                   // le camere nel podio, verso il Colosseo
    [-1,1].forEach(function(q){ for(var gk=0;gk<12;gk++){ var top=.7-(gk+1)*2.4/12; B.scatola(.55,top+1.9,.31,7.53,-1.9,q*(1.25+(gk+.5)*.31),P.travertino); } });      // le due rampe verso il Colosseo, lungo il muro
    [-1,1].forEach(function(q){ B.colonne(-6.9,q*4.7,6.9,q*4.7,22,1.25,.09,.7,P.granito).scatola(14,.1,.5,0,1.95,q*4.7,P.coppi); });
    B.scatola(10.9,.3,5.2,0,.7,0,P.marmo);
    [-1,1].forEach(function(q){
      B.scatola(4.6,1.9,3.3,q*2.3,1,0,P.marmo).vano(q*4.63,1,0,0,1,.7,1.45,true);                                            // la cella e la sua porta
      B.colonne(q*5,-1,q*5,1,4,1.9,.09,1).colonne(q*5.3,-1.906,q*5.3,1.906,8,1.9,.09,1).colonne(-5.3,q*2.45,5.3,q*2.45,22,1.9,.09,1);
    });
    B.scatola(10.9,.32,5.2,0,2.9,0,P.marmo).falde(10.9,.72,5.3,0,3.22,0,P.oro,0,P.marmo);
 }},
 /* L'arco sta a nove metri dal centro del recinto di Venere e Roma, dentro la sua terrazza: con una terrazza propria, più bassa, restava sepolto. Ora poggia sullo stesso piano del tempio,
    che è il colmo della via Sacra fra il Foro e la valle del Colosseo; per questo la voce sta dopo quella del tempio. */
 {id:'arcotito', nome:'Arco di Tito', x:27.2,z:20.15, ry:1.14, come:'venere', fa:function(B){                                     // un solo fornice, a cavallo della via Sacra; posizione e orientamento dal contorno su OpenStreetMap (way 23913953): il fornice guarda a ovest-nord-ovest verso il Foro e a est-sud-est verso il Colosseo
    /* «13.50 metres wide, 15.40 high, and 4.75 deep. The archway is 8.30 metres high and 5.36 wide»; colonne scanalate su piedistalli; «an attic 4.40 metres in height, on which is
       the inscription» (Platner e Ashby, Arcus Titi). Il fornice ora è aperto (23 novembre 2026). Che cosa stesse in cima la voce non lo dice: niente. */
    muroForato(B,1.35,1,.475,[[0,.536,.83]],P.marmo);
    B.scatola(1.45,.1,.58,0,1,0,P.marmo).scatola(1.35,.44,.475,0,1.1,0,P.marmo);
    [1,-1].forEach(function(q){ B.vano(q*.677,.42,0,0,-q,.13,.26,true); });      // 27 novembre 2026: «the sides of the piers … were adorned with niches like windows» (Platner e Ashby, Arcus Titi): una nicchia per fianco
    [1,-1].forEach(function(q){ [-.58,-.38,.38,.58].forEach(function(x){ B.scatola(.13,.2,.1,x,0,q*.27,P.marmo); }); B.colonne(-.58,q*.27,.58,q*.27,2,.8,.05,.2).colonne(-.38,q*.27,.38,q*.27,2,.8,.05,.2);
      B.scatola(.7,.28,.02,0,1.18,q*.24,P.travertino); });                                                                                        // i piedistalli, le colonne, la lastra dell'iscrizione
 }},
 /* Santa Maria Nova (25 novembre 2026, l'utente: «Papa Leone IV costruisce Santa Maria Nova fra le sue rovine. Non vedo la chiesa»). Prima era una chiesetta di CHIESE (js/nuclei.js):
    posata ai piedi del podio, alta una dozzina di metri sopra il suo piano, girata a caso, senza nome, coperta da ciò che restava del tetto del tempio.
    Leone IV (847-855) la costruisce «in its ruins» (Platner e Ashby, Venus et Roma); sotto Benedetto III è «sita iuxta via Sacra» (Liber Pontificalis, Duchesne II p. 145); in antico
    a tre navate (it.wikipedia, Basilica di Santa Francesca Romana). Il posto è quello della chiesa di oggi (OpenStreetMap, il punto che stava in CHIESE): l'estremità del podio verso il Foro.
    Schema dichiarato nella scheda: tre navate, abside, nessun campanile (quello di oggi è del XII secolo), misure indicative (circa 26 x 13 m, navata alta 15 m sopra il podio);
    sta di traverso sul podio, fra la scalinata e il colonnato della cella di Roma, con la facciata verso la via Sacra, perché il tempio non dice come fosse girata.
    Centro: (-6,45, 0) nel riferimento del tempio di Venere e Roma (x 36,3, z 17,8, ry -0,42); ry -1,99 porta il suo +x (la facciata) sul +z del tempio, il lato della via Sacra. */
 {id:'santamarianova', nome:'Santa Maria Nova', x:30.41,z:15.17, ry:-1.99, come:'venere', zone:[], fa:function(B){
    var y0=.7;                                                                                                                       // il piano del podio del tempio
    B.scatola(2.6,1.55,.62,0,y0,0,P.mattone).falde(2.6,.3,.68,0,y0+1.55,0,P.coppi,0,P.mattone);                                      // la navata centrale
    B.aperture(-1.05,.31,1.05,.31,6,y0+1.1,.3,.13).aperture(1.05,-.31,-1.05,-.31,6,y0+1.1,.3,.13);                                  // le finestre alte
    [-1,1].forEach(function(k){ B.scatola(2.6,.95,.36,0,y0,k*.49,P.mattone).scatola(2.66,.08,.4,0,y0+.95,k*.49,P.coppi); });          // le navate laterali
    B.cilindro(.28,1.15,-1.3,y0,0,P.mattone,null,14).cono(.3,.28,-1.3,y0+1.15,0,P.coppi,14);                                        // l'abside
    B.vano(1.33,y0,0,0,1,.3,.6).vano(1.33,y0,.49,0,1,.2,.45).vano(1.33,y0,-.49,0,1,.2,.45).vano(1.33,y0+1.05,0,0,1,.24,.32);        // le tre porte e la finestra della facciata
    B.scatola(.5,.08,1.2,1.56,y0,0,P.travertino);                                                                                    // il gradino davanti alle porte
 }},
 {id:'adriano', nome:'Mausoleo di Adriano', x:-156.97,z:-118, ry:.064,      /* sull'asse di ponte Sant'Angelo (OpenStreetMap): il ponte arriva alla porta (24 novembre 2026; prima x -157, ry 0,1) */ zone:[[0,0,10]], et:1, fa:function(B){
    /* basamento quadrato di circa 84 m di lato e 10 di altezza, tamburo di 64 m di diametro e 21 di altezza, sopra un giardino (Platner) */
    B.scatola(8.4,1,8.4,0,0,0,P.marmo).scatola(8.55,.12,8.55,0,1,0,P.marmo).cilindro(3.2,2.07,0,1.12,0,P.travertino,null,40).cilindro(3.27,.1,0,3.12,0,P.marmo,null,40).cilindro(3,.3,0,3.22,0,P.prato,2.2,24).scatola(1.5,1.7,1.5,0,3.4,0,P.marmo).scatola(1.6,.1,1.6,0,5.1,0,P.marmo);      // 27 novembre 2026: il tamburo alto 2,07 e non 2,1 (la sua cima ora sta dentro lo spessore della cornice), perché la sua faccia di sopra stava alla stessa quota della cornice e le due si contendevano i pixel (raggi verticali)
    B.vano(0,0,4.23,1,0,.7,.85);                                                                                // l'ingresso, verso il ponte
    for(var st=0;st<20;st+=5) uomo(B,3.05*Math.cos(st*PI/10),3.22,3.05*Math.sin(st*PI/10),2.2,P.marmo);            // le poche statue sull'orlo che restano dopo il 537: le altre stanno in 'adrianostatue'
    for(var k=0;k<14;k++) B.cono(.22,1.2,2.5*Math.cos(k*.449),3.45,2.5*Math.sin(k*.449),P.chioma,6);
 }},
 /* Le statue del mausoleo, che nel 537 spariscono. Procopio (Guerre V 22, 13-14 e 22, nella traduzione di Dewing, riletto il 22 novembre 2026): la tomba è di marmo pario e in alto
    ci sono statue dello stesso marmo, «representing men and horses»; gli assediati fanno a pezzi la maggior parte delle statue, che erano molto grandi, e ne gettano le pietre sui Goti.
    Qui: sedici statue su venti sull'orlo del tamburo e i quattro gruppi di uomini e cavalli agli angoli del basamento (Platner e Ashby, «Mausoleum Hadriani»: agli angoli il muro
    si ispessisce per reggerli). Numero, misure e forma sono indicativi.
    La quadriga in cima: Platner e Ashby la riferiscono a Giovanni di Antiochia (una «colossal quadriga on the summit») e riportano il dubbio di Hülsen; è un'ipotesi, dichiarata nella scheda.
    Quando sia sparita non lo dice nessuna fonte letta: qui scompare con le statue, e anche questo è un'ipotesi. */
 {id:'adrianostatue', x:-156.97,z:-118, ry:.064, come:'adriano', fa:function(B){
    for(var st=0;st<20;st++) if(st%5) uomo(B,3.05*Math.cos(st*PI/10),3.22,3.05*Math.sin(st*PI/10),2.2,P.marmo);
    [-3.95,3.95].forEach(function(x){ [-3.95,3.95].forEach(function(z){ var ry=Math.atan2(x,z);      // ogni gruppo guarda in fuori, lungo la diagonale
      B.scatola(.62,.08,.62,x,1.12,z,P.marmo); cavallo(B,x,1.2,z,ry,2.2,P.marmo); uomo(B,x+.2*Math.cos(ry),1.2,z-.2*Math.sin(ry),2.2,P.marmo); }); });
    [-.33,-.11,.11,.33].forEach(function(x){ cavallo(B,x,5.2,.2,0,2.2,P.statua); });                               // i quattro cavalli, verso il ponte
    B.scatola(.5,.16,.26,0,5.2,-.36,P.statua).scatola(.5,.12,.04,0,5.36,-.25,P.statua); uomo(B,0,5.36,-.38,2.2,P.statua);      // il carro e chi lo guida
 }},
 {id:'augusto', nome:'Mausoleo di Augusto', x:-74,z:-151, ry:0, zone:[[0,0,7]], fa:function(B){                             // mausoleo di Augusto; nome, scheda e storia dal 26 novembre 2026 (Platner e Ashby, Mausoleum Augusti: tamburo di 87 m, ingresso a sud, obelischi davanti, statua di bronzo in cima)
    B.cilindro(4.4,1.2,0,0,0,P.travertino,null,40).cilindro(4,.3,0,1.2,0,P.prato,3.2,24).cilindro(2.6,1.1,0,1.4,0,P.travertino,null,30).cilindro(1,1.5,0,2.5,0,P.marmo,null,16).scatola(.3,.6,.3,0,4,0,P.bronzo);
    for(var k=0;k<18;k++) B.cono(.22,1.2,3.6*Math.cos(k*.349),1.45,3.6*Math.sin(k*.349),P.chioma,6);
    B.vano(0,0,4.42,1,0,.5,.85);                                                                                 // l'ingresso, a sud
    // i due obelischi ai lati dell'ingresso sono voci a sé dal 27 novembre 2026 (obeliscomausoleo1, obeliscomausoleo2)
 }},
 /* Teatro di Pompeo, la sua storia (25 novembre 2026): Platner e Ashby, «Theatrum Pompei» (letto quel giorno), danno i restauri fino a quello di Simmaco per Teodorico,
    fra il 507 e il 511 (Cassiodoro), e nient'altro fino al Medioevo, quando una volta delle sostruzioni dà il nome a Santa Maria de Crypta Pinta e piazza di Grottapinta
    conserva la forma della cavea. In dati.js: abbandonato dal 546 (la data che il modello aveva già), in piedi, senza crolli; marmi e bronzi tolti nel 663 per scelta.
    Dal 25 novembre 2026, sera, ha nome e scheda (SCHEDE.pompeo in js/dati.js), che dichiara le due scelte. */
 /* Rifatto il 27 novembre 2026 sulle voci Theatrum Pompei e Porticus Pompei di Platner e Ashby: diametro di «150-160 metres» (qui 160, il raggio di prima, su cui sta il ponteggio
    del 493), la scena «about 95 metres»; la facciata a «three series of arcades, adorned with columns», dorico, ionico, corinzio, con archi di peperino e davanti alle arcate di sotto
    colonne di granito rosso; il tempio di Venere Vincitrice «at the top of the central part of the cavea», con le file dei sedili come gradini; il «theatrum marmoreum» dei calendari
    (sedili di marmo). Il portico, «about 180 metres long and 135 wide», con «four parallel rows of columns» e il giardino con i viali d'ombra (Properzio): qui le due file interne
    corrono lungo il lato lungo, gli alberi fra le file; in fondo la sala della Curia di Pompeo, che Augusto fece murare (it.wikipedia). Il tetto sporgente sopra il palco e i tre
    ordini di colonne della scena sono di it.wikipedia («Teatro di Pompeo»). Schema: altezze (30 m), numero degli archi, profondità della scena, misure del tempio. */
 {id:'pompeo', nome:'Teatro di Pompeo', x:-94.3,z:-30.8, ry:-PI/2, zone:[[0,0,10],[0,-14,10]], fa:function(B){
    var PEP=RM.col(0xb3ab9a), GRR=RM.col(0x9a6253);                                                                                      // peperino e granito rosso
    teatroVero(B,{r:8, archi:48, ordini:[[.05,1.05,.76],[1.05,2.05,.72],[2.05,3,.66]], col:PEP, semi:[GRR,PEP,PEP], sedili:P.marmo, rorc:2.3, scena:[9.5,1.4,2.9], frons:3, tettoia:true});
    B.scatola(2.5,2.85,2.3,0,0,6.3,PEP);                                                                                                  // il podio del tempio, che sale dalla cavea dietro l'ultima fila
    B.dentro(0,2.85,6.4,PI,function(B){ B.tempio(2,2,1.3,0,0,0,{fronte:6,podio:.15}); });                                                 // Venere Vincitrice, rivolta alla scena
    portico(B,13.5,18,0,0,-11,1.1,P.prato);                                                                                               // il portico dietro la scena, col giardino
    [-1,1].forEach(function(s){ B.colonne(s*3.4,-3.4,s*3.4,-18.6,20,.9,.045,.1);                                                          // le due file di colonne interne
      for(var k=0;k<9;k++) [2.2,4.6].forEach(function(x){ B.cilindro(.03,.25,s*x,.1,-4.2-k*1.7,P.tronco,null,4).cono(.38,.75,s*x,.3,-4.2-k*1.7,P.chioma,7); }); });      // i viali d'alberi
    B.scatola(2.4,1.5,1.5,0,0,-19.05,P.tufo).falde(1.6,.4,2.5,0,1.5,-19.05,P.coppi,PI/2,P.tufo);                                         // la Curia di Pompeo, murata
 }},
 /* Rifatto il 27 novembre 2026 (Platner e Ashby, Theatrum Marcelli; it.wikipedia «Teatro di Marcello», che segue il Lexicon Topographicum): di travertino, «three series of open
    arcades», doriche e ioniche, e in cima un attico a muro pieno con paraste corinzie; 41 arcate e 42 semicolonne; alto circa 32,60 m, e i due ordini che restano ne misurano circa 20;
    la scena rettilinea, lunga 80-90 m e profonda 20, con «un portico di sei colonne verso l'esterno» (Forma Urbis) e alle due estremità un'aula absidata di circa 25 x 15 m; dietro,
    una grande esedra con i due tempietti ricostruiti della Pietà e di Diana; dentro, stucco e marmo; la scena verso il fiume, l'asse da nord-nord-est a sud-sud-ovest. Il raggio resta
    quello della facciata conservata (59 m): Platner dà un diametro di 150 m, il Lexicon 129,80. Schema: altezza degli archi, sedili, colonne della scena, forma dell'esedra e dei tempietti. */
 {id:'marcello', nome:'Teatro di Marcello', x:-49.85,z:9, ry:PI*.8, zone:[[0,0,7.5]], fa:function(B){
    teatroVero(B,{r:6, archi:41, ordini:[[.05,1,.72],[1,2,.7]], attico:[2,3.26], sedili:P.marmo, rorc:1.85, scena:[8.5,2,3], frons:2, aule:[2.5,1.5], porticato:6});
    var es=RM.ellisse(2,1.6,14,PI,2*PI).map(function(p){ return [p[0],p[1]-2.6]; });                                                      // l'esedra dietro la scena
    B.striscia(es,0,es,.9,P.travertino,false);
    [-.8,.8].forEach(function(x){ B.tempio(.55,.8,.5,x,-3.5,0,{fronte:4,podio:.2}); });                                                   // i tempietti della Pietà e di Diana
 }},      /* centro e raggio ricavati dal cerchio della facciata curva conservata (OpenStreetMap, via 86217821: raggio di circa 59 m); prima il teatro stava circa 45 m più a nord-est e copriva i due templi */
 /* I due templi a nord del teatro, sui contorni di OpenStreetMap (vie 182282759 e 998844739): Apollo «in circo», detto Sosiano (it.wikipedia) e quello che gli studi successivi a Platner e Ashby
    identificano con Bellona (per loro, nel 1929, il sito di Bellona «is not known with certainty»; it.wikipedia lo pone accanto al tempio di Apollo). Fronte verso nord, verso il circo Flaminio:
    orientamento e alzati sono indicativi. Chiusi come gli altri templi dopo le leggi di Teodosio. */
 {id:'apollo', nome:'Tempio di Apollo Sosiano', x:-47.8,z:.8, ry:PI, zone:[[0,0,2.3]], fa:function(B){ B.tempio(2,3.3,1.5,0,0,0,{fronte:6,lati:9,podio:.4}); }},
 {id:'bellona', nome:'Tempio di Bellona', x:-44.8,z:1.15, ry:PI, zone:[[0,0,2.4]], fa:function(B){ B.tempio(1.6,3.9,1.4,0,0,0,{fronte:6,podio:.4}); }},      // «built with three series of open arcades»: dorico, ionico e un terzo ordine a lesene corinzie, perduto (Platner)
 {id:'laterano', nome:'San Giovanni in Laterano', x:169,z:73, ry:.1, zone:[[0,0,8],[8,0,6],[-11.3,-3.5,2.6]], fa:function(B){
    /* cinque navate «fortemente digradanti in altezza» e in fondo «una navatella trasversale, il primitivo transetto» (it.wikipedia, Basilica di San Giovanni in Laterano); larghezze e altezze indicative */
    cinqueNavate(B,10,{nave:1.9,nav:.85,hn:2.9,hi:2,he:1.4,ra:.95,ali:{prof:1.4,alto:1.9},atrio:{lato:4.8,prof:4.8}});
    B.cilindro(1.2,1.6,-11.3,0,-3.5,P.mattone,null,8).cono(1.3,.7,-11.3,1.6,-3.5,P.coppi,8); }},      // il battistero ottagonale, dov'è oggi (OpenStreetMap): dietro l'abside, verso nord
 /* Il Patriarchio, la residenza del vescovo di Roma accanto alla basilica dal IV secolo (it.wikipedia, «Palazzo del Laterano», che riassume il Liber Pontificalis): verso la metà dell'VIII secolo
    papa Zaccaria vi costruisce un triclinio; Leone III (795-816) un altro, «di ampiezza impressionante», con un'abside a mosaico e altre dieci absidi. Demolito da Sisto V alla fine del Cinquecento.
    Stava a nord della basilica, dove oggi sono il palazzo del Laterano e la Scala Santa (OpenStreetMap: Scala Santa a 178,8, 59,2). Forma e misure sono uno schema: della pianta antica non sappiamo. */
 {id:'patriarchio', nome:'Patriarchio lateranense', x:176.5,z:63, ry:.1, zone:[[0,0,4.2]], fa:function(B){
    B.scatola(7,1.6,2,0,0,0,P.intonaco).falde(7.2,.5,2.2,0,1.6,0,P.coppi,0,P.intonaco);                       // il corpo lungo, verso la basilica
    B.scatola(2.2,1.9,3,-2.6,0,-2.2,P.intonaco).falde(2.4,.5,3.2,-2.6,1.9,-2.2,P.coppi,PI/2,P.intonaco);      // un'ala a nord
    B.scatola(1,3,1,3.1,0,-.6,P.mattone).falde(1.1,.4,1.1,3.1,3,-.6,P.coppi,0,P.mattone);                   // una torre
 }},
 {id:'triclinioleone', nome:'Triclinio di Leone III', x:183,z:61.5, ry:.1, come:'patriarchio', zone:[[0,0,2.4]], fa:function(B){
    B.scatola(3.4,1.8,1.5,0,0,0,P.intonaco).falde(3.5,.45,1.6,0,1.8,0,P.coppi,0,P.intonaco);
    B.cilindro(.62,1.5,1.7,0,0,P.intonaco,null,12).cono(.66,.35,1.7,1.5,0,P.coppi,12);                       // l'abside principale; le dieci absidi laterali non si disegnano
 }},
 /* La Curia (aula alta e stretta, 27 x 18 m, rifatta da Diocleziano dopo l'incendio del 283) e, dal 630 circa, la stessa aula come chiesa di Sant'Adriano (Liber Pontificalis, vita di Onorio I).
    Stessa posizione e orientamento che aveva dentro i Fori (inForo). Separate il 23 novembre 2026 perché si vedesse il cambio (l'utente: «la Curia falla più carina… non c'erano dei bronzi?»
    e, per la chiesa, «ricostruiscila più spoglia»). Della Curia: la facciata di mattoni rivestita di stucco a finti blocchi, con lo zoccolo di lastre di marmo, la cornice e il frontone,
    tre finestre e la porta con i battenti di bronzo, che dal 1660 stanno in San Giovanni in Laterano: quindi c'erano ancora nella chiesa. Il portichetto davanti è discusso; le statue
    di bronzo sul frontone sono come le mostrano le monete con la Curia di Augusto (un'immagine più antica: qui indicativa). La chiesa: le stesse mura, tetto di coppi, niente portico né statue. */
 /* Il Pantheon chiesa di Santa Maria ad Martyres (13 maggio 609): una croce in cima al frontone del pronao (23 novembre 2026, richiesta dell'utente). La croce è indicativa: che ci fosse
    e come fosse non è scritto nelle fonti lette. Stessa posizione e orientamento del Pantheon. */
 {id:'pantheonchiesa', x:-70,z:-68, ry:PI, come:'pantheon', zone:[], fa:function(B){
    B.scatola(.07,.5,.07,0,2.4,5.18,P.oro).scatola(.28,.07,.07,0,2.72,5.18,P.oro);
 }},
 /* La Curia prima dell'incendio del 283, al tempo di Carino (voce «Curia Julia» della Wikipedia inglese): la sua forma non è nota, qui è la stessa aula con un portichetto. Brucia nel 283 e,
    ancora bruciata, si vede nel 284; dal 285 al suo posto sale la Curia di Diocleziano (23 novembre 2026, l'utente: «se la Curia è bruciata e viene ricostruita da Diocleziano fallo vedere») */
 /* nome sulla scena (27 novembre 2026; l'utente aveva preso la Curia per i Rostri: fra il 285 e il 630 l'aula non aveva un nome suo); la scheda è quella di Sant'Adriano, che racconta la Curia.
    ey: il nome sta appena sopra il tetto, non a 70 m come gli altri: a mezza distanza «Rostri», alto sopra la tribuna, finiva sulla Curia. Lo stesso per Rostri, Sant'Adriano e i due archi. */
 {id:'curiaantica', nome:'Curia', ey:3.5, x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    curiaAula(B,P.bronzo); B.scatola(1.5,.25,.5,0,0,1.6,P.travertino);
 }},
 {id:'curia', nome:'Curia', ey:3.5, x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    curiaAula(B,P.bronzo);
    B.scatola(1.96,.85,.04,0,0,1.36,P.marmo).scatola(2.0,.1,2.76,0,2.32,0,P.marmo);                                                  // zoccolo di marmo in facciata e cornice tutt'attorno
    B.scatola(.5,.12,.05,0,1.32,1.37,P.marmo);                                                                                       // architrave della porta
    B.scatola(1.5,.25,.5,0,0,1.6,P.travertino).colonne(-.62,1.72,.62,1.72,4,.95,.055,.25).scatola(1.6,.07,.62,0,1.2,1.6,P.coppi);          // gradini e portichetto davanti alla porta
 }},
 /* Le statue di bronzo sul frontone della Curia, a parte dal 25 novembre 2026: sono già un'ipotesi (le monete con la Curia di Augusto) e nel modello spariscono nel 455,
    quando i Vandali portano via i bronzi (Procopio, Guerre III 5). Scelta dichiarata nella scheda dei Fori. */
 {id:'curiastatue', x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    B.scatola(.12,.34,.12,0,3.0,1.25,P.bronzo).scatola(.1,.26,.1,-.88,2.4,1.25,P.bronzo).scatola(.1,.26,.1,.88,2.4,1.25,P.bronzo);      // statue di bronzo sul frontone
 }},
 {id:'santadriano', nome:"Sant'Adriano (la Curia)", etichetta:"Sant'Adriano", ey:3.9, x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    /* 24 novembre 2026 (segnalato nelle prove delle infografiche: nel 700 era «una scatola bianca senza dettagli»). È la stessa aula della Curia: la facciata di mattoni, qui senza lo
       stucco a finti blocchi, che non si sa quanto restasse; la cornice, l'architrave della porta e i battenti di bronzo, che dal 1660 stanno in San Giovanni in Laterano e quindi
       c'erano ancora nella chiesa. Niente statue sul frontone e niente portichetto; tetto di coppi e la croce. Quanto stucco e quanto marmo restassero non è detto dalle fonti lette. */
    curiaAula(B,P.coppi,P.mattone);
    B.scatola(2.0,.1,2.76,0,2.32,0,P.travertino).scatola(.5,.12,.05,0,1.32,1.37,P.marmo);                                              // la cornice tutt'attorno e l'architrave della porta
    B.scatola(1.0,.18,.4,0,0,1.55,P.travertino);                                                                                    // i gradini davanti alla porta
    B.scatola(.07,.5,.07,0,2.95,1.3,P.oro).scatola(.28,.07,.07,0,3.27,1.3,P.oro);                                                    // la croce sul frontone
    /* L'abside: la chiesa «was founded in the curia by Honorius I (625‑638; LP LXXII.6), who added the apse» (Platner e Ashby, Curia Iulia, riletta il 25 novembre 2026). Il passo
       non dice su quale muro né quanto fosse grande, né se sporgesse fuori dall'aula: qui sta sul muro di fondo, di fronte alla porta che resta in uso, e sporge (raggio di 5 m,
       alta 16): scelta dichiarata nella scheda. Fino al 630 l'aula è la Curia, senza abside. */
    B.cilindro(.5,1.6,0,0,-1.38,P.mattone,null,16).cupola(.52,0,1.6,-1.38,P.coppi,.55);
 }},
 {id:'pietro', nome:'San Pietro', x:-259,z:-108, ry:0, zone:[[0,0,9],[10,0,7]], et:1, fa:function(B){
    sanPietro(B);
    B.scatola(5.4,.07,7.2,13.7,0,0,P.selce).scatola(5.4,.1,.5,13.7,0,3.4,P.travertino).scatola(5.4,.1,.5,13.7,0,-3.4,P.travertino);      // il sagrato lastricato davanti all'atrio, dove si raccolgono i pellegrini
 }},
 {id:'tegolepietro', x:-259,z:-108, ry:0, come:'pietro', fa:function(B){ tegolePietro(B); }},      // dal 630: le tegole di bronzo di Onorio I sopra i tetti della basilica
 /* L'obelisco del circo di Nerone (Caligola, anno 40) resta in piedi accanto alla rotonda di Sant'Andrea (it.wikipedia, Obelisco Vaticano): c'è da prima della basilica.
    Posizione originale dalla targa in piazza dei Protomartiri Romani (OpenStreetMap, nodo 13308484173, «Original Obelisk Position»). */
 {id:'obeliscovaticano', nome:'Obelisco vaticano', x:-258.3,z:-101.1, ry:0, come:'pietro', zone:[[0,0,.8]], fa:function(B){
    B.scatola(.5,.3,.5,0,0,0,P.travertino).cilindro(.2,2.4,0,.3,0,P.sabbia,.12,4).cono(.13,.25,0,2.7,0,P.sabbia,4);
 }},
 /* ---- costruiti durante la storia, in ordine di data ---- */
 {id:'sole', nome:'Tempio del Sole', x:-30,z:-106, ry:.16, zone:[[0,0,9],[0,11.6,5]], fa:function(B){
    /* Dai disegni di Palladio, attribuiti al tempio da Hülsen (incerto): un cortile grande di 130 x 90 m con al centro una rotonda di 25 m circa, la cella di 10 e sedici colonne;
       sullo stesso asse una sala quadrata di 15 m e un primo cortile di 55 x 75 m con due emicicli (en.wikipedia, da Richardson). Che il cortile minore stia a sud è una nostra scelta; gli emicicli non sono disegnati. */
    portico(B,8,13,0,0,0,1.2); B.cilindro(1.25,.3,0,.1,0,P.travertino,null,24).cilindro(.5,1.7,0,.4,0,P.marmo,null,16).cilindro(1.2,.16,0,1.9,0,P.marmo,null,24).cupola(1.2,0,2.06,0,P.bronzo,.5);
    for(var k=0;k<16;k++) B.cilindro(.07,1.5,1.12*Math.cos(k*.3927),.4,1.12*Math.sin(k*.3927),P.marmo,.06,7);
    B.scatola(1.5,1.6,1.5,0,0,7.25,P.mattone).falde(1.6,.4,1.6,0,1.6,7.25,P.coppi,0,P.mattone);
    portico(B,5.5,7.5,0,0,11.75,1.2);
 }},
 /* 27 novembre 2026, voce riletta per intero e confronto con una fotografia: le colonne ora stanno in mezzo ai piloni (prima a ±0,4 e ±1,2, fuori centro), l'arco è girato come il
    suo contorno su OpenStreetMap (way 23590989, rettangolo di 25,3 x 6,9 m: ry -0,23, prima -0,3). La voce dice anche che la strada che parte di qui verso il Circo «did not, however,
    run through it» e che fornici e spiazzo erano lastricati di travertino. Dal 27 novembre 2026 (sera) la via Appia del modello (src/roma/genera.mjs) passa accanto all'arco, dal
    lato del Palatino (il lato è una scelta), e qui non c'è più la strozzatura; lo spiazzo lastricato non è disegnato. */
 {id:'arcocostantino', nome:'Arco di Costantino', x:44.5,z:30.4, ry:-.23, zone:[[0,0,3]], fa:function(B){
    /* Rifatto il 23 novembre 2026 (Platner e Ashby, Arcus Constantini): «21 metres high, 25.70 wide, and 7.40 deep; the central archway is 11.50 high and 6.50 wide, and the two
       lateral arches are 7.40 metres high and 3.36 wide»; «eight fluted Corinthian columns of giallo antico» su piedistalli; «eight statues of Dacians in pavonazzetto… standing on
       the cornice in front of the attic, each above one of the giallo antico columns»; nell'attico l'iscrizione e otto rilievi rettangolari; sopra i fornici laterali, quattro tondi
       per facciata. I fornici ora sono aperti. Dei rilievi si vede solo dove stanno; se in cima ci fosse una quadriga la voce non lo dice: non c'è. */
    muroForato(B,2.57,1.5,.74,[[0,.65,1.15],[-.8,.336,.74],[.8,.336,.74]],P.marmo);
    B.scatola(2.69,.14,.86,0,1.5,0,P.marmo).scatola(2.57,.46,.74,0,1.64,0,P.marmo).scatola(2.63,.05,.8,0,2.08,0,P.marmo);                          // cornice, attico, coronamento
    [1,-1].forEach(function(q){ var z=q*.375, ry=q>0?0:Math.PI;
      [-1.13,-.48,.48,1.13].forEach(function(x){ B.scatola(.2,.4,.2,x,0,q*.47,P.marmo).colonne(x,q*.47,x,q*.47,1,.98,.058,.4,P.sabbia).scatola(.22,.14,.22,x,1.5,q*.47,P.marmo);      // piedistallo, colonna di giallo antico, il suo tratto di trabeazione
        uomo(B,x,1.64,q*.49,1.55,P.marmo,ry); });                                                                                                  // i Daci
      B.scatola(.68,.36,.02,0,1.69,z,P.travertino); [-.98,-.62,.62,.98].forEach(function(x){ B.scatola(.3,.36,.02,x,1.69,z,P.travertino); });    // l'iscrizione e i rilievi dell'attico
      [-.9,-.7,.7,.9].forEach(function(x){ disco(B,.085,.02,x,.98,z,ry,P.travertino); });                                                         // i tondi
      B.scatola(.5,.1,.02,-.8,1.16,z,P.travertino).scatola(.5,.1,.02,.8,1.16,z,P.travertino); });                                                 // il fregio basso sopra i fornici laterali
 }},
 {id:'termecostantino', nome:'Terme di Costantino', x:21.5,z:-65.9, ry:-.2, sc:.45, zone:[[0,.33,[2,2.9],2.8]], fa:function(B){      // senza peribolo: il corpo occupa tutto lo spazio fra le strade, davanti si apre un'area chiusa a nord da una linea curva (Platner). Misure schematiche
    /* «Because the baths were built on a side-hill, it was necessary to make an artificial level» (Platner e Ashby, Thermae Constantinianae, letta il 25 novembre 2026): qui un piano
       murato che scende fino al pendio a est e a sud; prima la zona sfumava su 70 m e le terme stavano su un cumulo. La scala che dal lato ovest scendeva verso il Campo Marzio
       («a magnificent flight of steps») non c'è: nel modello il lato ovest sta alla quota della cima del colle. Le misure del piano sono quelle dell'edificio (qui si conta in unità
       scalate di 1/0,45). */
    B.scatola(21.4,7.96,25.6,0,-7.8,.7,P.mattone).scatola(21.5,.1,25.7,0,.06,.7,P.selce);
    /* 27 novembre 2026, pianta propria (prima la stessa delle altre terme in piccolo): «The frigidarium seems to have had its longer axis north and south instead of east and west,
       and behind it were tepidarium and caldarium both circular in shape. Because of the comparative narrowness of the building, the ordinary arrangement of the anterooms on each
       side of the caldarium was not carried out» (Platner e Ashby, Thermae Constantinianae). Qui in fila da nord a sud: frigidarium lungo, tepidarium e caldarium tondi; ai lati
       del frigidarium due ali di sale, nessuna sala ai lati del caldarium; l'ingresso al centro del lato nord. Misure e altezze: schema (unità della maglia, scalate di 0,45). */
    var I=P.intonaco, k, z;
    B.scatola(6,7.5,8,0,0,-2,I); for(k=0;k<3;k++) B.falde(6.1,1.2,8/3,0,7.5,-2-8/3+k*8/3,P.coppi,0,I);                     // il frigidarium, lungo da nord a sud, a tre crociere
    B.falde(8.1,1,6.1,0,7.5,-2,P.coppi,PI/2,I);
    B.aperture(3,2,3,-6,3,4.6,2.2,1.6).aperture(-3,-6,-3,2,3,4.6,2.2,1.6);                                                    // i finestroni sopra le ali
    B.scatola(3.2,5.2,1,0,0,-6.2,I).vano(0,0,-6.72,-1,0,1.8,3.6).falde(3.3,.9,1.1,0,5.2,-6.2,P.coppi,0,I);                   // l'ingresso al centro del lato nord
    B.cilindro(2.4,6,0,0,4.5,I,null,18).cupola(2.4,0,6,4.5,I,.6);                                                             // il tepidarium tondo
    B.cilindro(3.4,7,0,0,9.8,I,null,24).cupola(3.4,0,7,9.8,I,.6);                                                             // il caldarium tondo, a sud
    var cal=RM.ellisse(3.4,3.4,14,0,PI).map(function(p){ return [p[0],p[1]+9.8]; }); B.fornici(cal,1,2.3,.5,1,false).fornici(cal,4,2,.5,1,false);
    [-1,1].forEach(function(s){ B.scatola(6.3,4.4,10,s*6.15,0,-1,I);                                                           // le due ali di sale ai lati del frigidarium
      for(z=-6;z<4;z+=2.5) B.falde(6.4,.9,2.46,s*6.15,4.4,z+1.25,P.coppi,0,I);
      B.aperture(s*9.3,s>0?4:-6,s*9.3,s>0?-6:4,5,1,1.8,.9); B.aperture(s>0?9.3:-3,-6.01,s>0?3:-9.3,-6.01,3,1,1.8,.9); });
    var cv=RM.ellisse(10,6,16,PI,2*PI).map(function(p){ return [p[0],p[1]-6]; });
    B.striscia(cv,.16,cv,1.2,P.mattone,false);
 }},
 /* I Dioscuri del Quirinale (27 novembre 2026): i due gruppi colossali di marmo, ciascuno un giovane accanto a un cavallo che s'impenna. Platner e Ashby, Thermae Constantinianae: nel
    restauro del 443 «it is probable that the colossal statues of the Dioscuri and horses, now in the Piazza del Quirinale, were set up within the thermae». Dal 443 quindi, con la
    riserva della fonte; dove, dentro le terme, la fonte non lo dice: qui nello spiazzo chiuso dalla linea curva davanti all'ingresso nord (scelta). Misure: la fonte dice solo
    «colossal»; qui figure alte circa 5,5 m (schema). Le figure sono quelle delle statue del modello (uomo, cavallo), non copie dei gruppi veri. Stessa quota delle terme (come). */
 {id:'dioscuri', nome:'Dioscuri del Quirinale', etichetta:'Dioscuri', x:22.349,z:-70.09, ry:-.2, come:'termecostantino', zone:[], fa:function(B){
    var y=.072, M=P.marmo, B0=B;                                                                                      // il piano delle terme (0,16 x 0,45)
    B=Object.create(B0); B.geo=function(g,c){      // marmo bianco col tipo delle statue (P.statua), come il Marforio
      if(!g.attributes.color){ var n=g.attributes.position.count, a=new Float32Array(n*3); for(var i=0;i<n;i++){ a[i*3]=M.r; a[i*3+1]=M.g; a[i*3+2]=M.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); }
      return B0.geo.call(this,g,P.statua); };
    [-1,1].forEach(function(q){ var x=q*1.35;
      B.scatola(1.05,.28,.75,x,y,0,P.marmo);                                                                          // il basamento
      cavallo(B,x-q*.12,y+.28,.05,PI+q*.25,2.9,P.statua);                                                             // il cavallo, rivolto verso l'esterno dello spiazzo
      uomo(B,x+q*.3,y+.28,-.05,2.95,P.statua,PI-q*.3);                                                                // il giovane accanto, verso il centro
    });
 }},
 {id:'croce', nome:'Santa Croce in Gerusalemme', x:253.3,z:47.6, ry:2.72, zone:[[0,0,4]], fa:function(B){
    var L=3.65, W=2.2, H=2.2;                                                                  // l'aula del palazzo Sessoriano: un vano solo di 36 x 22 m, alto quanto largo, non una basilica a navate
    B.scatola(L,H,W,0,0,0,P.mattone).falde(L,.42,W+.12,0,H,0,P.coppi,0,P.mattone);
    [1,-1].forEach(function(q){ var a=-q*(L/2-.15), b=q*(L/2-.15); B.aperture(a,q*W/2,b,q*W/2,5,.3,.8,.42).aperture(a,q*W/2,b,q*W/2,5,1.35,.62,.4); });      // due ordini di cinque finestre per lato
    B.cilindro(W*.34,1.75,-L/2,0,0,P.mattone,null,14).cono(W*.36,.45,-L/2,1.75,0,P.coppi,14);  // l'abside aggiunta quando l'aula diventa chiesa
    B.vano(L/2+.03,0,0,0,1,.45,.9).vano(L/2+.03,1.25,0,0,1,.5,.6);
 }},
 /* San Lorenzo: la basilica di Costantino è un'aula cimiteriale a forma di circo, 99 x 35 m, 98,60 x 35,50 m per Krautheimer, parallela alla basilica attuale e circa 28 m a sud del suo fianco; la facciata, a est, cade all'altezza dell'ingresso sud della chiesa di Pelagio e il corpo si allunga verso ovest (Corpus Basilicarum II, pp. 116-117);
    nel 580 Pelagio II costruisce sopra la tomba una chiesa più piccola, a gallerie, con l'abside a ovest: è il presbiterio della basilica attuale. */
 {id:'lorenzo', nome:'San Lorenzo, la basilica maggiore', x:296,z:-104.4, ry:.35+PI, zone:[[0,0,6]], fa:function(B){
    var L=9.9, W=3.55, Ln=L-(W-1.9), pr=function(w){ return RM.stadio(L-(W-w),w,8,10); }, est=pr(W), nav=pr(1.9), x1=Ln/2-.95;
    B.striscia(est,0,est,1,P.mattone).striscia(est,1,nav,1.35,P.coppi).striscia(nav,1.35,nav,2.1,P.mattone);                  // navatella che gira attorno all'abside, come nelle altre basiliche a circo
    B.falde(x1+Ln/2,.5,2,(x1-Ln/2)/2,2.1,0,P.coppi,0,P.mattone).cono(1,.5,x1,2.1,0,P.coppi,14);
    B.fornici(est,.35,.45,.4,1,false).fornici(nav,1.5,.42,.4,1,false);
    B.vano(-L/2-.03,0,0,0,-1,.5,.95);
 }},
 {id:'lorenzopelagio', nome:'San Lorenzo, la chiesa di Pelagio II', x:299.5,z:-111.6, ry:.35, zone:[[0,0,3]], fa:function(B){
    var L=3.2;
    B.scatola(L,1.95,.95,0,0,0,P.mattone).falde(L,.4,1.05,0,1.95,0,P.coppi,0,P.mattone);                                      // navata alta quasi venti metri
    [-1,1].forEach(function(q){ B.scatola(L,1.35,.58,0,0,q*.76,P.mattone).scatola(L+.06,.1,.62,0,1.35,q*.76,P.coppi); });      // navatelle a due piani: sopra, le gallerie
    [1,-1].forEach(function(q){ var a=-q*(L/2-.2), b=q*(L/2-.2); B.aperture(a,q*1.05,b,q*1.05,6,.85,.38,.24).aperture(a,q*.475,b,q*.475,6,1.5,.34,.22); });
    B.cilindro(.45,1.5,-L/2,0,0,P.mattone,null,12).cono(.48,.4,-L/2,1.5,0,P.coppi,12);
    B.vano(-.3,0,1.08,1,0,.44,.8);                                                                                            // l'ingresso sul fianco sud
 }},
 /* Sant'Agnese. La basilica di Costantina è un'aula cimiteriale a forma di circo: OpenStreetMap (way 23944398, «Basilica costantiniana di S. Agnese») ne dà il fianco nord-est, larghezza 41 m,
    asse a 40° e la curva dell'abside a nord-ovest; quel contorno si ferma dopo 79 m, ma il mausoleo, attaccato al fianco sud-ovest, sporge oltre, quindi l'aula era più lunga:
    la si porta a 98 m, misura ricordata da Krautheimer e qui non riletta (ipotesi). Abbandonata probabilmente nel VII secolo (it.wikipedia, Complesso monumentale di Sant'Agnese). */
 {id:'agnese', nome:"Sant'Agnese, la basilica di Costantina", x:265.6,z:-340.3, ry:2.449, zone:[[-3.2,0,2.4],[0,0,2.4],[3.2,0,2.4]], fa:function(B){
    var L=9.8, W=4.1, wn=2.2, Ln=L-(W-wn), pr=function(w){ return RM.stadio(L-(W-w),w,8,10); }, est=pr(W), nav=pr(wn), x1=Ln/2-wn/2;
    B.striscia(est,0,est,1,P.mattone).striscia(est,1,nav,1.35,P.coppi).striscia(nav,1.35,nav,2.1,P.mattone);                  // navatella che gira attorno all'abside, come a San Lorenzo
    B.falde(x1+Ln/2,.5,wn+.1,(x1-Ln/2)/2,2.1,0,P.coppi,0,P.mattone).cono(wn/2+.05,.5,x1,2.1,0,P.coppi,14);
    B.fornici(est,.35,.45,.4,1,false).fornici(nav,1.5,.42,.4,1,false);
    B.vano(-L/2-.03,0,0,0,-1,.5,.95);
 }},
 /* il mausoleo di Costantina, oggi Santa Costanza: posizione e diametro da OpenStreetMap (way 35306502) */
 {id:'costanza', nome:'Mausoleo di Costantina (Santa Costanza)', x:265.8,z:-334.9, ry:0, sc:.7, zone:[[0,0,2.2]], fa:function(B){
    B.cilindro(2.4,1,0,0,0,P.mattone,null,24).cono(2.5,.4,0,1,0,P.coppi,24).cilindro(1.5,2,0,0,0,P.mattone,null,20).cupola(1.5,0,2,0,P.coppi,.6);
 }},
 /* La chiesa di Onorio I sopra la tomba: «fecit ecclesiam beatae Agne martyris, via Numentana… a solo, ubi requiescit» (Liber Pontificalis, Onorio I, Duchesne I p. 323).
    Pianta da OpenStreetMap (way 205704488): circa 30 x 20 m, asse a 40°, abside a sud-est. Semisotterranea: si entrava dall'alto, sulle gallerie (it.wikipedia). Alzato indicativo. */
 {id:'agneseonorio', nome:"Sant'Agnese, la chiesa di Onorio I", x:278.25,z:-338.5, ry:2.449, zone:[[0,0,2]], fa:function(B){
    var L=3;
    B.scatola(L,1.7,.9,0,0,0,P.mattone).falde(L,.35,1,0,1.7,0,P.coppi,0,P.mattone);
    [-1,1].forEach(function(q){ B.scatola(L,1.2,.55,0,0,q*.72,P.mattone).scatola(L+.06,.1,.6,0,1.2,q*.72,P.coppi); });      // navatelle con le gallerie sopra
    [1,-1].forEach(function(q){ var a=-q*(L/2-.2), b=q*(L/2-.2); B.aperture(a,q*1,b,q*1,6,.75,.34,.22).aperture(a,q*.45,b,q*.45,6,1.3,.3,.2); });
    B.cilindro(.35,1.3,-L/2,0,0,P.mattone,null,12).cono(.38,.35,-L/2,1.3,0,P.coppi,12);
    B.vano(L/2+.03,.85,0,0,1,.4,.7);                                                                                          // l'ingresso in alto, all'altezza delle gallerie
 }},
 /* San Paolo dei tre imperatori: «un edificio a cinque navate, con 80 colonne e un quadriportico» (it.wikipedia), lunga 131 m e larga 65, alta 29,70; transetto alto quanto la navata. Larghezze delle navate indicative. */
 {id:'paolo', nome:'San Paolo fuori le mura', x:-70.1,z:375.7, ry:2.98, zone:[[0,0,10],[8,0,7]], et:1, fa:function(B){
    cinqueNavate(B,12,{nave:2.4,nav:1,hn:2.8,hi:2,he:1.4,ra:1.2,transetto:{prof:2.4,lung:7.2,alto:true},atrio:{lato:5.3,prof:5.3}});
 }},
 /* la prima chiesa, di Costantino: «fecit Augustus Constantinus basilicam beato Paulo apostolo» (Liber Pontificalis, Silvestro); «un piccolo edificio probabilmente a tre navate» con la tomba presso l'abside (it.wikipedia).
    Rivolta al contrario della basilica di Teodosio: abside a ovest, sulla tomba, ingresso dalla via Ostiense. Misure ipotetiche. */
 {id:'paolocostantino', nome:'San Paolo di Costantino', x:-63.4,z:376.8, ry:-.162, zone:[[0,0,2.6]], fa:function(B){ chiesa(B,4,2.2,false,{strette:true,atrio:false}); }},
 /* Santa Sabina: «tre navate, divise da dodici colonne doppie» e un nartece che era un braccio del quadriportico (it.wikipedia). Le navatelle larghe metà della navata sono il rapporto consueto, non una misura letta. */
 {id:'sabina', nome:'Santa Sabina', x:-46,z:89, ry:.785, sc:.62, zone:[[0,0,6],[8.6,0,1.6,1.5]], fa:function(B){ chiesa(B,10,6,false,{strette:true}); }},      // la seconda zona: uno spiazzo libero davanti all'atrio (25 novembre 2026: prima c'era una casa davanti all'ingresso)
 /* Santa Maria Maggiore di Sisto III: «tre navate, divise da 21 colonne» per lato, con 21 finestre per lato nella navata (it.wikipedia). Navatelle: come a Santa Sabina, proporzione consueta. */
 {id:'mariamaggiore', nome:'Santa Maria Maggiore', x:109,z:-57, ry:-.5, sc:.82, zone:[[0,0,8],[10.4,0,1.8,1.5]], fa:function(B){ chiesa(B,10,6,false,{strette:true,finestre:21}); }},      // la seconda zona: uno spiazzo libero davanti all'atrio (25 novembre 2026: prima c'era una casa davanti all'ingresso)
 {id:'stefano', nome:'Santo Stefano Rotondo', x:94.5,z:88, ry:0, zone:[[0,0,5.5]], fa:function(B){
    /* tre cerchi: tamburo (22 m di diametro e 22 di altezza), ambulacro (42 m), anello esterno (66 m). Nell'anello esterno quattro bracci più alti disegnano una croce:
       stanno sulle diagonali (quello di nord-est sopravvive, è la cappella dei Santi Primo e Feliciano); fra un braccio e l'altro, un corridoio basso lungo il muro e un cortile. */
    var e3=RM.ellisse(3.29,3.29,36), e3t=RM.ellisse(3.34,3.34,36), e2=RM.ellisse(2.78,2.78,36), k, a;
    B.striscia(e3,0,e3,.75,P.mattone).striscia(e3t,.75,e2,.98,P.coppi).striscia(e2,.98,e2,0,P.mattone);
    B.cilindro(2.1,1.2,0,0,0,P.mattone,null,32).cono(2.18,.45,0,1.2,0,P.coppi,32);
    for(k=0;k<4;k++){ a=PI/4+k*PI/2; B.scatola(1.35,1.25,1.1,2.66*Math.cos(a),0,2.66*Math.sin(a),P.mattone,-a).falde(1.4,.35,1.2,2.66*Math.cos(a),1.25,2.66*Math.sin(a),P.coppi,-a,P.mattone); }
    B.cilindro(1.125,2.2,0,0,0,P.mattone,null,22).cono(1.2,.5,0,2.2,0,P.coppi,22);
    for(k=0;k<22;k++) B.scatola(.12,.3,.06,1.145*Math.cos(k*.2856),1.75,1.145*Math.sin(k*.2856),P.ombra,-k*.2856+PI/2);
 }},
 {id:'cosma', nome:'Santi Cosma e Damiano', x:16.5,z:4, ry:-.35, come:'fori', fa:function(B){
    B.scatola(2.2,2,3.6,0,0,0,P.mattone).falde(3.6,.6,2.4,0,2,0,P.coppi,PI/2,P.mattone).cilindro(.9,1.4,0,0,2.6,P.mattone,null,16).cupola(.9,0,1.4,2.6,P.bronzo,.6);
 }},
 {id:'foca', nome:'Colonna dell\'imperatore Foca', x:-3.7,z:.6, ry:-.35, come:'fori', fa:function(B){
    B.scatola(1.1,.22,1.1,0,0,0,P.mattone).scatola(.7,.28,.7,0,.22,0,P.marmo).cilindro(.07,1.36,0,.5,0,P.marmo,.065,10).scatola(.2,.1,.2,0,1.86,0,P.marmo);   // colonna «1.39 metres in diameter and 13.60 high», con «the statue of Phocas in gilt bronze» (Platner e Ashby, Columna Phocae)
 }},
 /* La statua di Foca in bronzo dorato, a parte dal 25 novembre 2026: Foca è ucciso nel 610, ma quando la statua sia stata tolta non si sa; nel modello va via nel 663
    con Costante II («omnia quae erant in aere ad ornatum civitatis», Liber Pontificalis, vita di Vitaliano). Scelta dichiarata nella scheda. */
 {id:'focastatua', x:-3.7,z:.6, ry:-.35, come:'fori', fa:function(B){ B.scatola(.12,.3,.12,0,1.96,0,P.oro); }},
 /* ---- il quartiere di San Pietro: cresce mentre la città antica si svuota ---- */
 {id:'monasteripietro', nome:'Monastero dei Santi Giovanni e Paolo', x:-261,z:-108, ry:0, zone:[[0,0,14],[-15,4,5]], fa:function(B){
    var y=suTerreno(-261,-108,0);
    casa(B,y(-3,-9.5),-3,-9.5,4.6,2.8,1.5);                 // Santi Giovanni e Paolo, a nord del transetto (Leone I)
 }},
 {id:'monasteripietro2', nome:'Monasteri di San Martino e Santo Stefano Maggiore', x:-261,z:-108, ry:0, fa:function(B){
    var y=suTerreno(-261,-108,0);
    casa(B,y(-8,2.6),-8,2.6,2.6,3,1.4);                     // San Martino, addossato all'abside a sud-ovest: c'è nel 679-680 (Beda)
    casa(B,y(-15.5,4),-15.5,4,4,3,1.5);                     // Santo Stefano Maggiore, dietro l'abside: data di fondazione non letta, qui compare con San Martino
 }},
 /* Le due rotonde sul fianco sud, lungo la spina del circo di Nerone. Da ovest: il mausoleo di Onorio (poi Santa Petronilla), attaccato alla testata del transetto,
    e un mausoleo dell'età di Caracalla, che Simmaco (498-514) fa chiesa di Sant'Andrea (it.wikipedia, Antica basilica di San Pietro; Liber Pontificalis, Simmaco).
    Sant'Andrea sta subito a ovest del posto vero dell'obelisco; distanze fra le due rotonde e diametri sono indicativi (pianta di Alfarano, non riletta). */
 {id:'andreapietro', nome:"Rotonda di Sant'Andrea", x:-260.6,z:-101.4, ry:0, zone:[[0,0,1.6]], fa:function(B){
    var q=suTerreno(-260.6,-101.4,0)(0,0); B.cilindro(1.3,1.9,0,q-.3,0,P.mattone,null,18).cono(1.4,.5,0,q+1.6,0,P.coppi,18);
 }},
 {id:'petronilla', nome:'Mausoleo di Onorio (Santa Petronilla)', x:-263.2,z:-101.4, ry:0, zone:[[0,0,1.6]], fa:function(B){
    var q=suTerreno(-263.2,-101.4,0)(0,0); B.cilindro(1.3,1.9,0,q-.3,0,P.mattone,null,18).cono(1.4,.5,0,q+1.6,0,P.coppi,18);
 }},
 /* Il campanile di San Pietro: «fecit super basilicam beati Petri apostoli turrem, quam ex parte inauravit et ex parte argento investivit, in quo tribus posuit campanis» (Liber Pontificalis, Stefano II, 752-757;
    il passo è un'aggiunta di una parte dei manoscritti). Pochi anni dopo la stessa fonte nomina una «turrem sanctae Mariae ad Grada» all'ingresso dell'atrio: per questo sta lì, accanto ai tre fornici. Forma e misure sono ipotetiche. */
 {id:'campanilepietro', nome:'Campanile di San Pietro', x:-247.65,z:-105.5, ry:0, quota:quota(-259,-108)+.05, zone:[[0,0,1.2]], fa:function(B){
    B.scatola(.9,3.3,.9,0,0,0,P.mattone).scatola(1,.1,1,0,3.3,0,P.travertino).cono(.72,.55,0,3.4,0,P.oro);
    [1.2,2,2.75].forEach(function(y){ B.aperture(-.45,.45,.45,.45,2,y,.4,.2).aperture(.45,-.45,-.45,-.45,2,y,.4,.2).aperture(.45,.45,.45,-.45,2,y,.4,.2).aperture(-.45,-.45,-.45,.45,2,y,.4,.2); });      // tre ordini di bifore: le campane stanno nell'ultimo
 }},
 {id:'porticopietro', nome:'Portico dei pellegrini', x:-201.75,z:-108.1, ry:.0685, lunga:[90.5,2.2], fa:function(B){          // dalla testata di ponte Sant'Angelo (posizione da OpenStreetMap), sotto il mausoleo, ai gradini dell'atrio: circa 900 m
    var y=suTerreno(-201.75,-108.1,.0685), q;
    for(var k=0;k<12;k++){ var lx=(k-5.5)*7.54; q=y(lx,0);
      B.scatola(7.64,.12,1.5,lx,q+1.05,0,P.coppi).colonne(lx-3.65,-.6,lx+3.65,-.6,18,1.35,.0675,q-.3).colonne(lx-3.65,.6,lx+3.65,.6,18,1.35,.0675,q-.3); }      // colonne con il passo dei portici di portico() (dieci diametri d'altezza, interasse di 3,25 diametri): uno schema, il passo vero non è noto; prima erano 8 per tratto, a 10 m
 }},
 /* «Item episcopia in eodem loco dextra levaque fecit» (Liber Pontificalis, Simmaco, 498-514): le due case stanno dove erano prima nel portico, ora con un'origine davanti all'atrio */
 {id:'episcopiapietro', nome:'Residenze di papa Simmaco', x:-248.11,z:-108.18, ry:.0685, fa:function(B){
    var y=suTerreno(-248.11,-108.18,.0685);
    [[0,-6.75],[0,6.75]].forEach(function(p){ casa(B,y(p[0],p[1]),p[0],p[1],2.6,3.4,1.3); });      // a destra e a sinistra dell'atrio
 }},
 /* Le scholae: quella dei Sassoni dal 727 (tradizione tarda su re Ine), le altre tre dal 799, quando le nomina per la prima volta il Liber Pontificalis (Leone III).
    La torre campanaria di Stefano II non sta qui: è campanilepietro (prima ce n'era una seconda copia, che compariva nel 727). */
 {id:'scholae', nome:'La comunità dei Sassoni (Schola dei Sassoni)', etichetta:'Comunità dei Sassoni', ex:-199.5,ez:-95.5, x:-233,z:-108, ry:0, zone:[[33.5,12.5,5]], fa:function(B){
    var y=suTerreno(-233,-108,0), q;
    [[33.5,12.5]].forEach(function(p){       // Sassoni, verso il fiume, sul sito di Santo Spirito in Sassia (OpenStreetMap)
      q=y(p[0],p[1]); casa(B,q,p[0]-1.2,p[1],3.6,2.4,1.2); casa(B,q,p[0]+1.4,p[1]+2,1.6,3,1,PI/2);
      B.scatola(1.3,1.8,2.6,p[0]+2.6,q-.3,p[1]-1.6,P.mattone).falde(2.6,.4,1.5,p[0]+2.6,q+1.5,p[1]-1.6,P.coppi,PI/2,P.mattone).cilindro(.5,1.4,p[0]+2.6,q-.3,p[1]-3,P.mattone,null,10);
    });
 }},
 {id:'scholae2', nome:'Le comunità dei Frisoni, dei Franchi e dei Longobardi (scholae)', etichetta:'Comunità di Frisoni, Franchi e Longobardi', ex:-245,ez:-91, x:-233,z:-108, ry:0, zone:[[14,9,5],[-8,17,5],[-12,-11,5],[-32,12.5,4]], fa:function(B){
    var y=suTerreno(-233,-108,0), q;
    [[14,9],[-8,17],[-12,-11]].forEach(function(p){       // Frisoni sul sito dei Santi Michele e Magno (OpenStreetMap), Franchi a sud dell'atrio, Longobardi a nord (posizione discussa)
      q=y(p[0],p[1]); casa(B,q,p[0]-1.2,p[1],3.6,2.4,1.2); casa(B,q,p[0]+1.4,p[1]+2,1.6,3,1,PI/2);
      B.scatola(1.3,1.8,2.6,p[0]+2.6,q-.3,p[1]-1.6,P.mattone).falde(2.6,.4,1.5,p[0]+2.6,q+1.5,p[1]-1.6,P.coppi,PI/2,P.mattone).cilindro(.5,1.4,p[0]+2.6,q-.3,p[1]-3,P.mattone,null,10);
    });
    casa(B,y(-32,12.5),-32,12.5,3.2,2.6,1.4);                                                 // Santo Stefano Minore, a sud presso le rotonde (seconda metà dell'VIII secolo)
 }},
 /* L'ospizio di Leone III «in loco qui Naumachia dicitur» (Liber Pontificalis, vita di Leone III, c. XC; Duchesne II, p. 28 e nota 115): case per poveri e pellegrini e una chiesa di San Pietro.
    Posto: la chiesa di San Pellegrino in Vaticano (OpenStreetMap, 41.90497 N, 12.45702 E), che per Duchesne ne segna il sito; per Platner e Ashby la Naumachia stava poco a nord-ovest
    di Castel Sant'Angelo. Ipotesi fra le due, detta nella scheda. Fuori dalle mura leonine (il Passetto passa 17 unità più a sud); case e chiesa sono uno schema, come le scholae. */
 {id:'ospizionaumachia', nome:'Ospizio della Naumachia (Leone III)', etichetta:'Ospizio della Naumachia', x:-234.3,z:-138.5, ry:0, zone:[[.4,0,5.2]], fa:function(B){
    var y=suTerreno(-234.3,-138.5,0), q;
    q=y(-1.2,0); casa(B,q,-1.2,0,3.6,2.2,1.1);                 // le case dell'ospizio
    q=y(1.5,2.3); casa(B,q,1.5,2.3,1.6,2.8,.9,PI/2);
    q=y(2.7,-1.4); B.scatola(1.2,1.6,2.4,2.7,q-.3,-1.4,P.mattone).falde(2.4,.4,1.4,2.7,q+1.3,-1.4,P.coppi,PI/2,P.mattone).cilindro(.46,1.25,2.7,q-.3,-2.7,P.mattone,null,10);      // la chiesa di San Pietro, con l'abside a nord
 }},
 /* Procopio (Guerra gotica I 19): «Just below the bridge» legato alle mura, dove la corrente esce dall'arcata, due barche «side by side and two feet apart», con «two mills on either boat»
    e la ruota appesa in mezzo; sotto, altre coppie in fila «for a great distance». Qui cinque coppie, subito a valle di ponte Aurelio; misure delle barche e della ruota indicative. */
 /* Rifatti il 27 novembre 2026 sul testo (Procopio, Guerra gotica I 19, 19-25, traduzione Loeb su LacusCurtius): Belisario «fastened ropes from the two banks of the river
    and stretched them as tight as he could», vi legò «two boats side by side and two feet apart, where the flow of the water comes down from the arch of the bridge with the
    greatest force», mise «two mills on either boat» e appese fra le due barche il meccanismo che fa girare i mulini; dietro, altre barche «each attached to the one next behind
    in order», con le ruote fra l'una e l'altra «for a great distance», e la corrente faceva girare ogni ruota da sé. SCHEMA, detto nella scheda: quante coppie (qui cinque),
    misure di barche (18 x 4 m) e ruote (4 m di diametro, otto pale), le macine sotto una tettoia di tavole, dove le funi toccano le rive. La ruota gira (MULINI_RUOTE, più sotto). */
 {id:'mulini', nome:'Mulini sul Tevere', x:-111.7,z:4.6, ry:-.37, fa:function(B){
    var W0=.74, fune=RM.col(0x8a7a5a), legno=RM.col(0x6e553c), legnoS=RM.col(0x4f3d2b), pietra=RM.col(0x9a948a), tavole=RM.col(0x7d6a52);      // W0: il pelo dell'acqua, in unità del monumento
    MULINI_X.forEach(function(lx,k){
      [-1,1].forEach(function(lato){ var zc=lato*.24;      // due barche affiancate, sessanta centimetri d'acqua fra l'una e l'altra («two feet apart»)
        B.geo(scafoMulino(1.8,.42,.15,.09).translate(lx,W0,zc),legno);
        B.scatola(1.5,.03,.34,lx,W0+.11,zc,legnoS);                                                     // il tavolato
        [-.38,.32].forEach(function(dx){ var mx=lx+dx;                                                  // due mulini per barca: macina sopra macina, la tramoggia, una tettoia su quattro pali
          B.geo(new THREE.CylinderGeometry(.075,.075,.04,10).translate(mx,W0+.16,zc),pietra).geo(new THREE.CylinderGeometry(.07,.07,.035,10).translate(mx,W0+.198,zc),pietra);
          B.geo(new THREE.CylinderGeometry(.06,.015,.07,4).translate(mx,W0+.27,zc),legno);
          [[-.2,-.13],[-.2,.13],[.2,-.13],[.2,.13]].forEach(function(q){ B.scatola(.025,.3,.025,mx+q[0],W0+.14,zc+q[1],legnoS); });
          B.falde(.5,.1,.34,mx,W0+.44,zc,tavole,0,legno); });
      });
      B.geo(new THREE.CylinderGeometry(.025,.025,.62,6).rotateX(PI/2).translate(lx,W0+.14,0),legnoS);  // l'albero della ruota, di traverso sulle due barche
      [-1,1].forEach(function(lato){ funeMulino(B,[lx+.88,W0+.12,lato*.24],[lx+.88+(MULINI_X[k+1]!=null?MULINI_X[k+1]-lx-1.76:0),W0+.12,lato*.24],.012,fune); });      // ogni coppia legata a quella che le sta dietro
    });
    var a=MULINI_X[0]-.88;      // le funi tese dalle due rive alla prima coppia, sotto l'arcata del ponte (le rive: misurate sul terreno del modello)
    funeMulino(B,[-8.6,W0+.42,-5.2],[a,W0+.13,-.24],.016,fune); funeMulino(B,[-8.6,W0+.42,6.1],[a,W0+.13,.24],.016,fune);
    B.scatola(.06,.45,.06,-8.6,W0,-5.2,legnoS).scatola(.06,.45,.06,-8.6,W0,6.1,legnoS);      // i pali a riva
 }},
 {id:'casenerva', nome:'Case nel foro di Nerva', x:10.7,z:-8.9, ry:.672, come:'fori', fa:function(B){
    casa(B,.1,-2.2,.2,3.4,2.2,1.7); B.aperture(-3.6,1.33,-.8,1.33,4,.1,.75,.4);        // domus a due piani con portico ad arcate
    casa(B,.1,2.6,-.1,2.6,2,1.4);
 }},
 /* Teatro e Crypta di Balbo. Posizioni reali (OpenStreetMap): l'isolato del museo fra via Caetani, via delle Botteghe Oscure, via dei Polacchi e via dei Delfini è la crypta;
    la cavea (95 m di diametro) sta a ovest, sotto palazzo Mattei. Misure del portico e forma dell'esedra sono indicative. */
 {id:'balbo', nome:'Teatro e Crypta di Balbo', x:-57.7,z:-21.5, ry:-PI/2, zone:[[0,2.4,5.6],[0,-5.6,6.8]], et:1, fa:function(B){
    /* 27 novembre 2026: il più piccolo dei tre, 95 m di diametro e circa 7700 spettatori (Platner e Ashby, Theatrum Balbi; it.wikipedia); delle sue arcate le fonti lette non dicono
       nulla: due ordini, come schema. Restano tracce in opera quadrata e reticolata della parte bassa della cavea. Il posto e l'asse di Platner (sotto palazzo Cenci) sono superati
       dagli scavi della Crypta, dal 1981: il teatro sta a ovest del portico. */
    teatroVero(B,{r:4.75, archi:30, ordini:[[.05,.95,.68],[.95,1.9,.64]], col:P.tufo, rorc:1.4, scena:[6.6,.8,1.9], frons:2});      // cavea verso ovest, scena lungo l'odierna via Caetani
    /* la crypta: un cortile dietro la scena chiuso da gallerie coperte. Platner e Ashby, Crypta Balbi: il nome indica «a vaulted passage lighted from above»; perciò qui le gallerie
       sono a volta, chiuse verso fuori, aperte ad archi verso il cortile, con le luci sul tetto (27 novembre 2026; prima era un portico a colonne come quello di Pompeo).
       Larghezza e altezza delle gallerie, numero degli archi e delle luci sono uno schema. */
    var cw=9, cd=8.4, cz=-5.6, cs=.8, ch=.85, z0=cz-cd/2, z1=cz+cd/2;
    B.scatola(cw-2*cs,.06,cd-2*cs,0,0,cz,P.selce);                                                                                 // il cortile
    B.scatola(cw,ch,cs,0,0,z0+cs/2,P.tufo).scatola(cw,ch,cs,0,0,z1-cs/2,P.tufo).scatola(cs,ch,cd-2*cs,-cw/2+cs/2,0,cz,P.tufo).scatola(cs,ch,cd-2*cs,cw/2-cs/2,0,cz,P.tufo);
    B.aperture(-cw/2+cs,z0+cs+.01,cw/2-cs,z0+cs+.01,9,.06,.55).aperture(cw/2-cs,z1-cs-.01,-cw/2+cs,z1-cs-.01,9,.06,.55)                 // gli archi verso il cortile
     .aperture(cw/2-cs-.01,z0+cs,cw/2-cs-.01,z1-cs,8,.06,.55).aperture(-cw/2+cs+.01,z1-cs,-cw/2+cs+.01,z0+cs,8,.06,.55);
    for(var lk=0;lk<6;lk++){ var lx=-cw/2+cs+(lk+.5)*(cw-2*cs)/6, lz=z0+cs+(lk+.5)*(cd-2*cs)/6;                                     // le luci nella volta
      B.scatola(.3,.02,.12,lx,ch,z0+cs/2,P.ombra).scatola(.3,.02,.12,lx,ch,z1-cs/2,P.ombra).scatola(.12,.02,.3,-cw/2+cs/2,ch,lz,P.ombra).scatola(.12,.02,.3,cw/2-cs/2,ch,lz,P.ombra); }
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
    B.scatola(47,1.5,1,0,-1.75,-12.7,P.travertino);                                                                                         // muro di banchina (27 novembre 2026: un metro di modello più verso terra; a -13,7 la sua faccia stava da 4,3 a 4,6 unità dall'asse del fiume, che è largo 5,6 per parte: 10-13 m dentro l'acqua)
    for(k=-4;k<=4;k++) B.scatola(1.8,1.15,1.2,k*5.2,-1.75,-13.6,P.travertino);                                                             // scale e rampe verso l'acqua
 }},
 {id:'testaccio', nome:'Monte Testaccio', x:-83.3,z:184.4, ry:0, zone:[[-1.5,-1.3,8],[-2.8,-1.5,7],[-.5,-3.3,7],[.8,2.5,6.4],[3.3,6.5,4.8],[1.5,-7.5,4.3],[4.5,10.5,2.7],[2.8,-10.8,2.3],[4,12.5,1.5]], et:1, fa:function(B){       // collina di cocci d'anfora: 35 m sul piano, qui 1,8 volte tanto come gli altri rilievi; le zone (cerchi scelti per coprire il contorno con poco avanzo) tengono le case fuori dal monte
    /* Rifatto il 25 novembre 2026 sulle fonti lette (src/testi/topografia-fonti.md, sezione «Monte Testaccio»); contorno e gradoni rifatti la sera dello stesso giorno.
       Il contorno (TESTACCIO, più sopra: il piede di oggi da OpenStreetMap) è arrotondato tagliando gli spigoli due volte e ricampionato a passo costante.
       Da fonte: un monte «a gradoni» («una piràmide escalonada», Remesal 1994, p. 136) i cui gradoni sono file di anfore intere riempite di cocci, ogni fila «una mica reculada»
       rispetto alla prima, così che il fianco è una scarpata (p. 137); due piattaforme affiancate, la prima allungata da nord a sud, la seconda sul suo lato ovest (p. 136);
       tutto di cocci di Dressel 20, color terracotta (p. 135); calce sparsa sui cocci (Archaeology 2009; Turismo Roma); una rampa (Turismo Roma: «una prima rampa e due
       stradelle»); le anfore salivano intere «al llom de cavalleries», secondo l'opinione degli scavatori (Remesal, p. 138), fino al 265, l'ultima data consolare trovata
       (Archaeology 2009, dalla bocca di Remesal).
       Schema dichiarato nella scheda: numero, altezza e larghezza dei gradoni (sei, diversi l'uno dall'altro e diversi lungo il giro: dove la fila di un gradone è arretrata poco,
       due gradoni si fondono in una scarpata sola; le fonti dicono «almeno quattro serie»), le due piattaforme rese solo con un avvallamento fra loro (alla stessa quota: le fonti
       lette non danno la sezione), luogo e percorso della rampa (qui a tornanti sul lato nord-ovest, verso l'Emporio), quante bestie e come caricate, la fila d'anfore in cima,
       il verde dopo l'abbandono.
       La maglia è una griglia sola (anelli per raggi dal centro): nessun pezzo aggiunto, quindi niente buchi né facce rovesce. Prima la rampa era fatta di pezzi incassati nella
       scarpata, e dove li tagliava restavano piccoli triangoli neri (fessure fra i pezzi e testate girate al contrario); ora la rampa è la scarpata stessa, scavata.
       Il colore di base è uno solo, screziato per vertice (più sotto): le fasce alterne di prima facevano da lontano una pila di dischi.
       Tutta la maglia è di tipo 3 (in fondo): niente conci, crepe e crolli dello shader del degrado, che sono cose da muro; il verde lo mettono lo shader del prato e il modulo qui sotto. */
    var H=6.3, N=6, picc=RM.piccolo, n=picc?48:96, k, i, j, r, seme=11, ROSSI=[0x8c644d,0x936a52,0x88604a,0x997158].map(RM.col), CALCE=RM.col(0xb59a80), STRADA=RM.col(0xb38a66);
    function rnd(){ seme=(seme*16807)%2147483647; return (seme-1)/2147483646; }
    function hs(a,b){ var s=Math.sin(a*12.9898+b*78.233)*43758.5453; return s-Math.floor(s); }
    function idx(i){ return ((i%n)+n)%n; }
    var prof=TESTACCIO; for(k=0;k<2;k++) prof=prof.map(function(p,i,L){ var q=L[(i+1)%L.length]; return [[p[0]*.75+q[0]*.25,p[1]*.75+q[1]*.25],[p[0]*.25+q[0]*.75,p[1]*.25+q[1]*.75]]; }).reduce(function(a,b){ return a.concat(b); },[]);
    var m0=prof.length, cum=[0], P=[], sg=0;
    for(i=0;i<m0;i++){ var q0=prof[i], q1=prof[(i+1)%m0]; cum.push(cum[i]+Math.hypot(q1[0]-q0[0],q1[1]-q0[1])); sg+=q0[0]*q1[1]-q1[0]*q0[1]; }
    for(i=0,j=0;i<n;i++){ var sa=i/n*cum[m0]; while(cum[j+1]<sa) j++; var fa=(sa-cum[j])/(cum[j+1]-cum[j]), a=prof[j], b=prof[(j+1)%m0]; P.push([a[0]+(b[0]-a[0])*fa,a[1]+(b[1]-a[1])*fa]); }
    var Lr=P.map(function(p){ return Math.hypot(p[0],p[1]); });      // il monte si stringe verso il baricentro del contorno (il centro del monumento), raggio per raggio
    /* come un cumulo vero, l'altezza dipende dalla distanza dal piede: il fianco finisce dove si è a D dal bordo (54 m: con la quota 1,8 volte, sono circa 32 gradi veri); dove il monte è stretto (le punte, lo sperone a sud-est)
       quella distanza non si raggiunge e il fianco resta più basso, con la stessa pendenza. Per ogni raggio: SS = larghezza del fianco lungo il raggio, HH = altezza raggiunta */
    function dBordo(x,z){ var m=1e9; for(var q=0;q<m0;q++){ var a=prof[q], b=prof[(q+1)%m0], dx=b[0]-a[0], dz=b[1]-a[1], t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
      m=Math.min(m,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)); } return m; }
    var D=5.4, SS=[], HH=[];
    for(i=0;i<n;i++){ var Li=Lr[i], sm=0, dm=0; for(var s0=.1;s0<Li*.9;s0+=.1){ var d0=dBordo(P[i][0]*(1-s0/Li),P[i][1]*(1-s0/Li)); if(d0>dm){ dm=d0; sm=s0; } if(d0>=D){ dm=D; sm=s0; break; } }
      SS.push(sm); HH.push(Math.min(1,dm/D)); }
    for(k=0;k<3;k++){ SS=SS.map(function(v,i){ return (SS[idx(i-1)]+2*v+SS[idx(i+1)])/4; }); HH=HH.map(function(v,i){ return (HH[idx(i-1)]+2*v+HH[idx(i+1)])/4; }); }      // senza scalini fra un raggio e l'altro
    /* onde lente lungo il giro, una per gradone e per misura: sono periodiche, quindi il giro si chiude senza salti */
    function onda(){ var a=2+Math.floor(rnd()*2), b=4+Math.floor(rnd()*4), c=9+Math.floor(rnd()*5), fa=rnd()*6.283, fb=rnd()*6.283, fc=rnd()*6.283;
      return function(i){ var t=i/n*6.283; return .55*Math.sin(a*t+fa)+.3*Math.sin(b*t+fb)+.15*Math.sin(c*t+fc); }; }
    var LARG=[.2,.17,.18,.16,.15,.14], ALTO=[1.14,.9,1.06,.86,1.05,.99], oL=[], oA=[], oR=[], oF=[], oT=onda();      // larghezze e altezze di base dei sei gradoni: diverse apposta (schema)
    for(k=0;k<N;k++){ oL.push(onda()); oA.push(onda()); oR.push(onda()); oF.push(onda()); }
    /* la rampa: a tornanti sul lato nord-ovest, un tratto per gradone, avanti e indietro dentro la stessa finestra di J raggi; il tratto è scavato nella scarpata */
    var iA=0, J=picc?4:8; for(i=1;i<n;i++) if(Math.hypot(P[i][0]+5.6,P[i][1]+7.9)<Math.hypot(P[iA][0]+5.6,P[iA][1]+7.9)) iA=i;
    var i0=idx(iA-J/2);
    function inRampa(i,mg){ var d=idx(i-i0); return d<=J+mg || d>=n-mg; }
    function posRampa(i){ return idx(i-i0); }
    var V=[], T=[], RO=[], RI=[], RS=[], RE=[], rowE, PL=picc?2:4;       // V[riga][raggio] = punto; T = che cosa è la fascia che finisce su quella riga (0 scarpata, 1 ripiano, 2 strada)
    for(i=0;i<n;i++){
      var L=Lr[i], S=SS[i], rows=[], s=.035*S, y=.08, wl=[], hl=[], sw=0, sh=0, ramp=inRampa(i,3), rr=inRampa(i,0), hT=.08+(H-.33+.08*oT(i))*HH[i];
      rows.push([0,-.15,0],[s,y,0]);                                                                                    // il piede: cocci scivolati, appena sopra il piano
      for(k=0;k<N;k++){ wl.push(LARG[k]*(1+.36*oL[k](i))); hl.push(ALTO[k]*(1+.34*oA[k](i))); sw+=wl[k]; sh+=hl[k]; }
      for(k=0;k<N;k++){ var w=wl[k]/sw*S*.965, h=hl[k]/sh*(hT-.08), rf=.68+.1*oR[k](i), mf=RM.sfuma(.15,.55,oF[k](i)), tf=(1-rf)*(1-.9*mf), e1=.3, e2=.7;      // la scarpata prende due terzi del gradone: è un pendio di file arretrate, non un muro
        if(ramp){ tf=.14; e1=.24; e2=.68; }                                                                              // nella finestra della rampa i gradoni restano distinti e la scarpata è più larga
        var wr=w*(1-tf), hr=h*.93, y1=y+e1*e1*1.4*hr, y2=y+(e2-.12)*hr;      // profilo concavo: ripido sotto la fila in cima, più dolce verso il piede, dove i cocci scivolano
        var dR=posRampa(i), wR=dR<=J?1:dR<=J+3?1-(dR-J)/3.5:dR>=n-3?1-(n-dR)/3.5:0;      // la strada: piana di traverso, sale lungo il giro; ai due capi la scarpata la raggiunge per gradi (prima finiva di colpo, con facce quasi verticali che in ombra sembravano buchi neri)
        if(wR>0){ var f=dR<=J?dR/J:dR<=J+3?1:0, yr; if(k%2) f=1-f; yr=y+f*hr; y1+=(yr-y1)*wR*(dR<=J?1:wR); y2+=(yr-y2)*wR; }      // fuori dalla finestra il ciglio esterno scende prima: niente lame di terra sottili
        RO[k]=rows.length; rows.push([s+e1*wr,y1,0]); RI[k]=rows.length; rows.push([s+e2*wr,y2,rr?2:0]); rows.push([s+wr,y+hr,0]);
        RS[k]=rows.length-1; if(!picc) rows.push([s+wr+w*tf*.5,y+hr+.035*h,1]); rows.push([s+wr+w*tf,y+h,1]); RE[k]=rows.length-1;
        s+=w; y+=h; }
      rowE=rows.length-1;
      var rT=1-s/L;                                                                                                       // il ripiano di cima: dal bordo verso il centro sale ancora un poco
      for(j=PL;j>=1;j--){ var rho=rT*j/(PL+1); rows.push([L*(1-rho),y+(H-y)*Math.pow(1-rho/rT,.7),1]); }
      for(r=0;r<rows.length;r++){ var u=1-rows[r][0]/L, x=P[i][0]*u, z=P[i][1]*u, yy=rows[r][1];
        if(r>=rowE+1) yy-=sella(x,z);
        if(r>0 && rows[r][2]!==2 && !(rr&&RO.indexOf(r)>=0)) yy+=(hs(i,r*7.1)-.5)*.035;                                    // un tremito: i tasselli del cumulo
        (V[r]=V[r]||[])[i]=[x,yy,z]; (T[r]=T[r]||[])[i]=rows[r][2]; } }
    /* le due piattaforme (Remesal, p. 136: la prima da nord a sud, la seconda sul suo lato ovest; fra loro un muro di anfore): qui solo un avvallamento largo una ventina di metri
       lungo il confine, uno schema; quale delle due fosse più alta le fonti lette non lo dicono */
    function sella(x,z){ return .32*Math.exp(-Math.pow((x+1.3-.08*z)/.9,2)); }
    var cen=[0,H+.05-sella(0,0),0], R=V.length;
    function faccia(a,b,c,col){ if(sg>0) B.tri(a,c,b,col); else B.tri(a,b,c,col); }
    for(r=0;r<R-1;r++) for(i=0;i<n;i++){ j=(i+1)%n; var tp=T[r+1][i]===2&&T[r+1][j]===2?2:T[r+1][i]===1?1:0;
      var col=tp===2?STRADA.clone().multiplyScalar(.9+.2*rnd()):ROSSI[1].clone().multiplyScalar(tp===1?1.02:1);
      faccia(V[r][i],V[r][j],V[r+1][j],col); faccia(V[r][i],V[r+1][j],V[r+1][i],col); }
    for(i=0;i<n;i++) faccia(V[R-1][i],V[R-1][(i+1)%n],cen,ROSSI[1].clone().multiplyScalar(1.02));
    /* screziatura per vertice, che dipende solo dal posto: i tasselli vicini sfumano l'uno nell'altro invece di fare un mosaico; qua e là la calce */
    for(i=0;i<B.pos.length;i+=3){ var vx=B.pos[i], vy=B.pos[i+1], vz=B.pos[i+2], h1=hs(Math.round(vx*97)+Math.round(vz*13),Math.round(vy*101)), h2=hs(Math.round(vz*89),Math.round(vx*7+vy*53)), cr=ROSSI[Math.floor(h1*3.99)], mv=.93+.14*h2;
      B.col[i]*=cr.r/ROSSI[1].r*mv; B.col[i+1]*=cr.g/ROSSI[1].g*mv; B.col[i+2]*=cr.b/ROSSI[1].b*mv;
      if(h2>.9){ var kc=(h2-.9)*6; B.col[i]+=(CALCE.r-B.col[i])*kc; B.col[i+1]+=(CALCE.g-B.col[i+1])*kc; B.col[i+2]+=(CALCE.b-B.col[i+2])*kc; } }
    for(i=0;i<B.tip.length;i++) B.tip[i]=3;      // tipo 3, come i prati: la grana fine dello shader (fino a 60 cm, la misura di un coccio) e, lasciato a sé, l'erba incolta a chiazze (uCrepe)
    /* Gli anni dello scarico (fino al 265): bestie da soma con un'anfora per fianco sulla rampa e, in cima, verso ovest (la piattaforma che cresce per ultima), la fila d'anfore
       intere che chiude lo scarico. Quante bestie, come caricate e dove stia la fila è uno schema; persone niente: le fonti non le nominano. */
    var Bv=new RM.Costruttore(), MULO=RM.col(0x5a4838), ANF=[RM.col(0xb7764e),RM.col(0xa86a45)];
    function mulo(x,y,z,ry){ Bv.dentro(x,y,z,ry,function(){
      palla(Bv,.04,0,.1,0,MULO,.85,.9,1.9,6);                                                    // tronco, lungo un metro e mezzo
      [-1,1].forEach(function(a){ [-1,1].forEach(function(b){ arto(Bv,[a*.022,.07,b*.055],[a*.022,0,b*.058],.009,.008,MULO,4,false); }); });
      arto(Bv,[0,.11,.06],[0,.155,.1],.017,.013,MULO,5,false); palla(Bv,.021,0,.155,.118,MULO,.8,.8,1.5,5);      // collo e testa
      [-1,1].forEach(function(a){ palla(Bv,.03,a*.058,.1,-.01,ANF[0],1,1.2,1,6); });              // un'anfora vuota per fianco (Dressel 20, una trentina di chili: Remesal, p. 138)
    }); }
    function suStrada(k,fi){ var a=Math.floor(fi), t=fi-a, p0=V[RO[k]][idx(a)], p1=V[RI[k]][idx(a)], q0=V[RO[k]][idx(a+1)], q1=V[RI[k]][idx(a+1)];      // il mezzo della strada al raggio fi (con la virgola)
      return [0,1,2].map(function(c){ return ((p0[c]+p1[c])*(1-t)+(q0[c]+q1[c])*t)/2; }); }
    [[0,.3],[0,.75],[1,.5],[2,.45],[3,.6]].forEach(function(m){ var k=m[0], e=k%2?-1:1, fi=i0+(k%2?1-m[1]:m[1])*J, c=suStrada(k,fi), d=suStrada(k,fi+e*.5);
      mulo(c[0],c[1],c[2],Math.atan2(d[0]-c[0],d[2]-c[2])); });
    var iW=0, fila=picc?3:6; for(i=1;i<n;i++) if(P[i][0]<P[iW][0]) iW=i;
    for(i=iW-fila;i<iW+fila;i++){ var a0=V[rowE][idx(i)], a1=V[rowE][idx(i+1)], lg=Math.hypot(a1[0]-a0[0],a1[2]-a0[2]), m=Math.max(1,Math.floor(lg/.066)), ru=Math.atan2(P[idx(i)][0],P[idx(i)][1]);
      for(j=0;j<m;j++){ var f=(j+.5)/m; Bv.dentro(a0[0]+(a1[0]-a0[0])*f,a0[1]+(a1[1]-a0[1])*f+.028,a0[2]+(a1[2]-a0[2])*f,ru,function(){ Bv.geo(new THREE.SphereGeometry(.03,5,3).scale(1,1,1.25),ANF[(i+j)%2]); }); } }
    var vivo=Bv.maglia(RM.matPietra()); vivo.receiveShadow=true; vivo.castShadow=!RM.piccolo;
    /* Dopo l'abbandono: nessuna fonte letta dice che cosa ci fosse sul monte fra il 265 e il Medioevo. Come per gli altri ruderi (RM.rovina): nudo per qualche decennio, poi
       erba sui ripiani e, meno, sulle scarpate, e qualche arbusto; tutto dopo trecento anni. Niente alberi d'alto fusto né piante venute dopo. È una resa, non una misura. */
    var Bc=new RM.Costruttore(), cespi=[], ncs=RM.piccolo?40:110;
    Bc.geo(new THREE.SphereGeometry(.14,RM.piccolo?5:6,RM.piccolo?2:3).scale(1.3,.75,1.1).translate(0,.04,0),RM.col(0x4c5a30));
    for(i=0;i<ncs;i++){ var kk=Math.floor(rnd()*(N+1)), ii=Math.floor(rnd()*n), t=.15+.7*rnd(), e0=kk<N?V[RS[kk]][ii]:V[rowE][ii], e1=kk<N?V[RE[kk]][ii]:cen;      // sui ripiani e in cima
      cespi.push({x:e0[0]+(e1[0]-e0[0])*t,y:e0[1]+(e1[1]-e0[1])*t,z:e0[2]+(e1[2]-e0[2])*t,soglia:rnd(),sc:.5+.7*rnd(),ry:rnd()*6.28,q:rnd()}); }
    var mc=new THREE.InstancedMesh(Bc.geometria(),RM.matPietra(),ncs); mc.castShadow=!RM.piccolo; mc.receiveShadow=true; mc.frustumCulled=false; mc.count=0; mc.visible=false;
    var dm=new THREE.Object3D(), o=null, ultimo=-1, qU=-1;
    function verde(anno){ var ea=anno-265; return ea<=0?0:(.1+.9*RM.sfuma(0,300,ea))*RM.sfuma(0,30,ea); }
    RM.moduli.push(function(anno){
      if(!o){ o=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='testaccio'; })[0]; if(!o||!o.g) { o=null; return; }
        o.g.add(vivo); o.g.add(mc);
        /* dopo il modulo dei monumenti (che qui si aggiunge in coda): la tinta dello stato «abbandonato» scurirebbe i cocci come un muro sporco, e l'erba incolta dello shader
           del prato (uCrepe; con uVerde scura come i rovi dei recinti) seguirebbe i tempi degli edifici. Qui: cocci appena più spenti col tempo, e l'erba incolta dello shader
           (chiazze larghe, uCrepe) che cresce secondo il verde del monte: per i tre quarti trecento anni dopo; le scarpate restano in parte scoperte dove le chiazze non arrivano */
        RM.moduli.push(function(a){ var u=o.mat.userData.u; o.mat.color.setScalar(1-.12*RM.sfuma(265,450,a)); u.uVerde.value=verde(a)>0?.002:0; u.uCrepe.value=.7*verde(a); /* uVerde appena sopra zero: nello shader del prato sceglie l'erba scura incolta invece della paglia chiara (che sui cocci sembrava calce); sul tipo 3 non accende altro */ }); var no=o.g.geometry.attributes.normal;
        /* la trama dei cocci, da vicino: una tela di 256 punti con circa quattrocento frammenti (da 6 a 20 cm) su un fondo scuro, e qualche scaglia bianca di calce; un riquadro
           copre 2,5 m. Da lontano le mipmap la riducono a un tono medio, più scuro di un quarto: la screziatura per vertice fa il resto. Disegno generico, non un rilievo */
        var cv=document.createElement('canvas'); cv.width=cv.height=256; var cx=cv.getContext('2d'), sm=5, q, v, ox, oy;
        function rn(){ sm=(sm*16807)%2147483647; return (sm-1)/2147483646; }
        cx.fillStyle='#6b5a50'; cx.fillRect(0,0,256,256);
        for(q=0;q<420;q++){ var x0=rn()*256, y0=rn()*256, rr=6+rn()*14, a0=rn()*6.28, l=Math.round(195+rn()*60), pts=[];
          for(v=0;v<4+Math.floor(rn()*2);v++){ var an=a0+v*1.4+(rn()-.5)*.8, rv=rr*(.6+.5*rn()); pts.push([Math.cos(an)*rv,Math.sin(an)*rv*.75]); }
          cx.fillStyle=rn()<.06?'rgb(250,246,236)':'rgb('+l+','+Math.round(l*(.88+.08*rn()))+','+Math.round(l*(.8+.1*rn()))+')';
          for(ox=-256;ox<=256;ox+=256) for(oy=-256;oy<=256;oy+=256){ cx.beginPath(); pts.forEach(function(p,k){ cx[k?'lineTo':'moveTo'](x0+ox+p[0],y0+oy+p[1]); }); cx.closePath(); cx.fill(); } }
        var tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.encoding=THREE.sRGBEncoding; tx.anisotropy=4;
        var po=o.g.geometry.attributes.position.array, uv=new Float32Array(po.length/3*2), TT=.25;
        for(q=0;q<po.length/3;q++){ var px=po[q*3], py=po[q*3+1], pz=po[q*3+2], f3=Math.floor(q/3)*9, nx=no.array[f3], ny=no.array[f3+1], nz=no.array[f3+2], lh=Math.hypot(nx,nz)||1;      // per faccia: i ripiani in pianta, le scarpate lungo il fianco (se no la trama si stira a strisce)
          if(Math.abs(ny)>.75){ uv[q*2]=(px*.8+pz*.6)/TT; uv[q*2+1]=(pz*.8-px*.6)/TT; } else { uv[q*2]=(-px*nz+pz*nx)/lh/TT; uv[q*2+1]=(py*1.25+(px*nx+pz*nz)/lh*.3)/TT; } }
        o.g.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2)); o.mat.map=tx; o.mat.needsUpdate=true; }
      var tq=RM.QUALITA&&RM.QUALITA.verde, fr=tq&&tq[RM.q]!=null?tq[RM.q]:1;
      vivo.visible=anno<265.5;
      if(Math.abs(anno-ultimo)<.05 && fr===qU) return; ultimo=anno; qU=fr;
      var v=verde(anno);
      var nn=0; cespi.forEach(function(e){ var w=Math.max(0,Math.min(1,(v-.3-.6*e.soglia)*4)); if(w<=0||e.q>=fr) return;
        dm.position.set(e.x,e.y,e.z); dm.rotation.set(0,e.ry,0); var sc=e.sc*(.35+.65*w); dm.scale.set(sc,sc,sc); dm.updateMatrix(); mc.setMatrixAt(nn++,dm.matrix); });
      mc.count=nn; mc.visible=nn>0; mc.instanceMatrix.needsUpdate=true;
    });
    RM.testaccio={vivo:vivo, cespugli:mc, verde:verde};      // per le prove
 }},
 /* ======== Inventario del 22 novembre 2026: i monumenti che mancavano, al loro posto antico. Fonti lette: Platner e Ashby (LacusCurtius), it.wikipedia, OpenStreetMap (Overpass,
    Nominatim, API), annotate voce per voce; ciò che è detto «indicativo» non viene da una fonte. Le misure in metri delle fonti stanno nei commenti; nel modello 1 unità = 10 m. ======== */
 /* Colonna di Marco Aurelio (176-193): «100 Roman feet (29.77 metres)» fra plinto, fusto e capitello; fusto di 26,50 m con 3,90 di diametro; plinto e toro alti 1,385; capitello dorico di 1,5
    (Platner e Ashby, Columna M. Aurelii Antonini). Posizione: OpenStreetMap, way 201735339. Il piedistallo antico, oggi in parte sotto il suolo e rifasciato da Sisto V, è indicativo (circa 10 m);
    del recinto con il tempio del Divo Marco, che Platner crede a ovest della colonna, non si conosce la pianta. */
 {id:'colonnamarco', nome:'Colonna di Marco Aurelio', x:-44,z:-92.8, ry:0, zone:[[0,0,2.2]], fa:function(B){
    B.scatola(.8,.95,.8,0,-.1,0,P.marmo).scatola(.9,.1,.9,0,.85,0,P.marmo);                        // piedistallo e cornice (indicativi)
    B.cilindro(.235,.1385,0,.95,0,P.marmo,.215,18);                                                  // plinto e toro
    B.coclide(.195,.18,2.65,0,1.0885,0,21,P.marmo);                                                  // il fusto col fregio a spirale (ventuno giri è il numero corrente, non letto in Platner): rastrema meno di quello di Traiano
    B.scatola(.44,.15,.44,0,3.7385,0,P.marmo).cilindro(.14,.12,0,3.8885,0,P.marmo,.12,12);           // capitello dorico e tamburo in cima
 }},
 /* La statua equestre di Marco Aurelio in due posti (27 novembre 2026; fonti in coda a src/testi/topografia-fonti.md, «Marco Aurelio, Pigna, Ara Pacis»). Dove stesse in antico
    non si sa: «alcuni dicono si trovasse nel Foro Romano, altri a piazza Colonna» (it.wikipedia, che cita i Musei Capitolini). Qui la seconda, accanto alla colonna di Marco Aurelio,
    26 m a nord della colonna, rivolta verso di lei, 47 m a ovest dell'asse della via Lata (punto e orientamento: scelta). I Musei Capitolini: al Laterano «first recorded in the tenth century», ma «likely» lì «from at least the end of the eighth
    century»: qui al Laterano dal 790 (anno: scelta), nel campo davanti al Patriarchio, a nord del palazzo verso la Scala Santa (punto e orientamento: scelta). */
 {id:'marcoaurelio', nome:'Statua equestre di Marco Aurelio', etichetta:'Marco Aurelio', x:-44,z:-90.2, ry:PI, zone:[[0,0,.45]], fa:function(B){ marcoAurelio(B); }},
 {id:'marcoaureliolat', nome:'Statua equestre di Marco Aurelio al Laterano', etichetta:'Marco Aurelio', x:180.2,z:57.6, ry:-PI/2+.1, zone:[[0,0,.45]], fa:function(B){ marcoAurelio(B); }},
 /* La Pigna in due posti (27 novembre 2026). In antico: «forse nel Campo Marzio» (Musei Vaticani); «near the Pantheon next to the Temple of Isis» (en.wikipedia, dalla pagina storica
    del Vaticano): qui dentro il recinto dell'Iseo, su una base (punto e base: schema). Nell'atrio di San Pietro la nomina per primo Pietro Mallio (1159-1181): «ad pineam aeneam,
    quae est in paradiso»; Stefano II (752-757) mise sopra il cantaro «aereum ... tegumenum», una copertura di bronzo, e a quegli anni gli studiosi (van den Hoek) legano «probabilmente»
    l'arrivo della pigna (Roger Pearse, che cita Krautheimer e van den Hoek). Qui nell'atrio dal 755 (anno: scelta dentro quegli anni), dentro la vasca della fontana, sotto il baldacchino
    di bronzo a quattro colonne di Paolino da Nola (Lettera 13, 13), che il modello già disegna. */
 {id:'pigna', nome:'Pigna di bronzo', etichetta:'Pigna', x:-51.6,z:-64.2, ry:0, zone:[], fa:function(B){      // senza «come»: l'Iseo viene dopo nella lista
    B.scatola(.2,.14,.2,0,0,0,P.marmo).scatola(.23,.02,.23,0,.13,0,P.marmo); pigna(B,.15); }},      // la base (schema: 1,5 m di marmo)
 {id:'pignapietro', nome:'Pigna di bronzo nell\'atrio di San Pietro', etichetta:'Pigna', x:-250.61,z:-108, ry:0, come:'pietro', zone:[], fa:function(B){
    B.cilindro(.07,.1,0,.16,0,P.marmo,null,10); pigna(B,.26); }},      // su un piede basso dentro la vasca (schema)
 /* Orologio di Augusto. L'obelisco di Psammetico II, portato da Augusto nel 10 a.C., è alto 21,79 m e fa da gnomone a una meridiana: un pavimento di marmo a nord, con le linee di bronzo dorato
    (Platner e Ashby, Obeliscus Augusti; Plinio NH XXXVI 72). In piedi nell'VIII secolo (Itinerario di Einsiedeln), caduto in data ignota. Stava sotto piazza del Parlamento, dove se ne trovarono i pezzi
    nel 1502 e la meridiana nel 1748 (it.wikipedia «Obelisco di Montecitorio»; Nominatim, way 28157922). In cima, la sfera di cui parla Plinio. Lunghezza della meridiana (circa 50 m, l'ombra di
    mezzogiorno d'inverno) dal calcolo di Thayer nella stessa pagina; larghezza del pavimento e altezza del basamento indicative.
    L'Ara Pacis, che stava qui dentro, dal 27 novembre 2026 è la voce arapacis, subito dopo.
    Colonna di Antonino Pio (161): monolite di granito rosso alto 14,75 m con 1,90 di diametro, su un piedistallo di marmo bianco, con la statua di Antonino in cima come sulle monete
    (Platner e Ashby, Columna Antonini Pii). Posizione da it.wikipedia (41,90155 N, 12,47742 E); altezza del piedistallo indicativa. */
 {id:'orologio', nome:'Orologio di Augusto', x:-56.68,z:-108.69, ry:0, zone:[[0,0,1.4],[0,-2.8,2.4],[-8.62,8.12,.7]], fa:function(B){      // 27 novembre 2026: l'Ara Pacis è una voce a sé (arapacis, qui sotto), con la sua zona
    var X=-56.68, Z=-108.69;
    luogo(B,X,Z,X,Z,0,.4,function(B){
      obelisco(B,2.18,.24,.3,0,0); B.geo(new THREE.SphereGeometry(.09,10,8).translate(0,2.57,0),P.oro);           // basamento, fusto e sfera
      B.scatola(1.6,.04,5.2,0,0,-2.85,P.marmo).scatola(.05,.045,5,0,0,-2.85,P.oro);                               // il pavimento della meridiana e la linea di bronzo dorato
    });
    luogo(B,X,Z,-65.3,-100.57,0,.3,function(B){                                                                    // colonna di Antonino Pio
      B.scatola(.36,.25,.36,0,0,0,P.marmo).cilindro(.095,1.475,0,.25,0,P.granito,.085,14).scatola(.22,.06,.22,0,1.725,0,P.marmo).cilindro(.04,.16,0,1.785,0,P.statua,.04,6);
    });
 }},
 /* L'Ara Pacis Augustae (13-9 a.C.), voce a sé dal 27 novembre 2026 (prima stava nel gruppo dell'orologio con «misure a memoria»). Platner e Ashby, «Ara Pacis Augustae», letta quel
    giorno: «on the west side of the via Flaminia», dove oggi è palazzo Fiano-Almagià; il recinto di marmo bianco «about 6 metres high», «11.625 metres east and west, and 10.55 north and
    south»; «In the middle of the east and west sides were entrances flanked with pilasters»; «The altar itself was not found» (allora: fu trovato negli scavi del 1937-1938). Prima
    il recinto era girato di 90 gradi, con le misure scambiate e alto 4,6 m. Il posto resta quello di prima (palazzo Fiano, Nominatim way 80220845): il lato est sta 10 m a ovest dell'asse della via Lata.
    Gradino, altare e lesene sono uno schema; la scala davanti alla porta ovest della ricostruzione di oggi non c'è, perché le fonti lette non la descrivono. Sito del museo
    (arapacis.it, «The Ara Pacis in the Field of Mars»): il suolo salì per le piene del Tevere, un muro tentò di fermarlo invano, e per più di mille anni l'altare fu dimenticato;
    quando sparì alla vista non lo dice: qui resta in piedi fino all'852. Chiuso al culto nel 392 come i templi (scelta del modello), poi «abbandonato, ma in piedi». */
 {id:'arapacis', nome:'Ara Pacis', x:-50.55,z:-120.69, ry:0, zone:[[0,0,.85]], fa:function(B){
    B.scatola(1.22,.04,1.11,0,0,0,P.marmo);                                                                       // il gradino sotto il recinto (schema)
    B.scatola(1.1625,.56,.06,0,.04,.4975,P.marmo).scatola(1.1625,.56,.06,0,.04,-.4975,P.marmo);                    // i lati nord e sud, lunghi 11,6 m
    [-1,1].forEach(function(q){ B.scatola(.06,.56,.37,q*.55125,.04,.3425,P.marmo).scatola(.06,.56,.37,q*.55125,.04,-.3425,P.marmo);      // i lati est e ovest, con la porta in mezzo (larga 3,2 m: schema)
      B.scatola(.08,.56,.05,q*.56,.04,.18,P.marmo).scatola(.08,.56,.05,q*.56,.04,-.18,P.marmo); });                 // le lesene ai lati delle porte
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(q){ B.scatola(.08,.56,.08,q[0]*.56,.04,q[1]*.505,P.marmo); });   // le lesene agli angoli
    B.scatola(.62,.06,.5,0,.04,0,P.marmo).scatola(.5,.14,.36,0,.1,0,P.marmo);                                       // l'altare a gradini (schema)
 }},
 /* Obelisco degli Horti Sallustiani: copia romana, alta 13 m, dei geroglifici dell'obelisco di Ramesse II del Circo Massimo; in piedi nell'VIII secolo (Itinerario di Einsiedeln); nel XV secolo
    a terra in due pezzi. La base di granito, di 2,50 x 2,55 m, fu ritrovata nel 1843 fra via Sicilia, via Sardegna, via Toscana e via Abruzzi (Platner e Ashby, Obeliscus Hortorum Sallustianorum).
    Il punto è via Toscana (Nominatim, way 4951071): vale per il luogo del ritrovamento; dell'ippodromo degli horti, sulla cui spina it.wikipedia lo pone, non si conosce la pianta. Altezza della base indicativa. */
 {id:'obeliscosallustiano', nome:'Obelisco degli Horti Sallustiani', x:51.38,z:-182.26, ry:0, zone:[[0,0,1]], fa:function(B){ obelisco(B,1.3,.135,.25,0,0,.255,P.granito); }},
 /* Piramide di Gaio Cestio (18-12 a.C.): alta 36,40 m, base quadrata di 29,50 m (it.wikipedia «Piramide Cestia»; Platner e Ashby danno 27 e circa 22). Contorno e orientamento: OpenStreetMap,
    way 432946457. Dal 271-275 è murata nella cinta Aureliana. */
 {id:'piramide', nome:'Piramide Cestia', x:-36.84,z:178.38, ry:1.152, zone:[[0,0,2.4]], fa:function(B){ B.scatola(3.05,.08,3.05,0,-.03,0,P.travertino).cono(2.086,3.64,0,.05,0,P.marmo,4); }},
 /* Castra Praetoria (21-23): rettangolo di 440 x 380 m; mura alte 4,73 m; dentro, lungo le mura, una fila di camere alte 3 m con un camminamento sopra; porta ovest a 190 m dal lato nord
    (Platner e Ashby, Castra Praetoria). Aureliano fa entrare nella sua cinta il lato nord, quello est e metà del lato sud (in js/mura.js, da OpenStreetMap); qui c'è il resto, che Costantino
    smantella nel 312 quando scioglie i pretoriani (Zosimo II 17, citato da Platner). Spessore dei muri, larghezza delle camere e torri della porta indicativi. */
 /* Niente insulae dentro il campo (25 novembre 2026; prima ce n'erano 33 nel 300, quando era una caserma). Dentro c'erano gli alloggi lungo le mura, le vie, i sacelli e l'armeria
    (Platner e Ashby); dopo il 312 Costantino «dismantled their barracks», e nel campo si è trovato un cimitero cristiano dell'inizio del VI secolo: case non ne dice nessuno,
    e il recinto resta vuoto in ogni anno. La zona è il rettangolo dei quattro spigoli, girato come il campo (0,348 rad). */
 /* 27 novembre 2026: i muri sono di mattone fino alla cornice di mattoni sagomati (2,96 m), poi parapetto e merli per 1,20 m, i merli a 3 m l'uno dall'altro (LTUR, per i lati
    nord ed est; il lato ovest era più spesso); prima avevano una copertina di tufo, e con le camere intonacate in cima dall'alto si leggevano come un nastro bianco. Le camere:
    reticolato di tufo, una porta per cella (larghe 3,60 m in media, alte 3), il camminamento lastricato sopra. Dentro, le caserme e il resto (CASTRA_DENTRO, più sopra). */
 {id:'castrapretorio', nome:'Castra Praetoria', x:179,z:-156.5, ry:0, zone:CASTRA.zone.concat([[0,0,[16.4,19.1],0,.348]]), fa:function(B){
    var X=CASTRA.C[0], Z=CASTRA.C[1];
    CASTRA.muri.forEach(function(p){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ castraMuro(B,p,false); }); });
    CASTRA.camere.forEach(function(p){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ castraCamere(B,p,false); }); });
    luogo(B,X,Z,CASTRA.porta[0],CASTRA.porta[1],CASTRA.ang,.6,function(B){
      [-1,1].forEach(function(s){ B.scatola(.5,.75,.6,s*.55,-.05,0,P.mattone); });
      B.scatola(.6,.62,.36,0,-.05,0,P.mattone).vano(0,-.05,.19,1,0,.36,.45).vano(0,-.05,-.19,-1,0,.36,.45);
    });
    CASTRA_DENTRO.edifici.forEach(function(o){ castraEdificio(B,X,Z,o,false); });
    CASTRA_DENTRO.vie.forEach(function(v){ var a=CASTRA_DENTRO.campo(v[0][0],v[0][1]), b=CASTRA_DENTRO.campo(v[1][0],v[1][1]), L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/2)), ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
      for(var k=0;k<n;k++){ var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t; B.dentro(x-X,Math.max(RM.h(x,z),RM.h(x+.8,z),RM.h(x-.8,z),RM.h(x,z+.8),RM.h(x,z-.8))-quota(X,Z)-.05,z-Z,ang,function(B){ B.scatola(L/n+.05,.2,L<5?.5:.9,0,-.12,0,VIE_C); }); } });      // vie di 9 m (strada di Lanciani 5 m), posate sul punto più alto del tratto: schema
 }},
 /* Dopo il 312: «Constantine disbanded the praetorian guard and dismantled their barracks, presumably by destroying the inner walls that had not been used by Aurelian»
    (Platner e Ashby, da Zosimo II 17: «destroyed the fortresses in which they used to reside»). Qui: il lato ovest e la metà ovest del lato sud rasati a monconi, salvo un
    tratto in piedi («a part of the west wall is reported as standing in the sixteenth century»: quale tratto non si sa, schema); le caserme rase alle fondamenta, che l'erba
    copre con gli anni (lo stato «abbandonato»); le camere addossate ai lati nord, est e sud-est, entrati nelle mura di Aureliano, restano. Dopo, per la Soprintendenza, il campo
    resta «sostanzialmente non occupato dall'età medievale sino al XVII secolo». Dall'inizio del VI secolo il cimitero cristiano (TOMBE in js/scene-tappe.js). */
 {id:'castrapretoriorasa', nome:'Castra Praetoria', x:179,z:-156.5, ry:0, zone:[], fa:function(B){
    var X=CASTRA.C[0], Z=CASTRA.C[1];
    CASTRA.muri.forEach(function(p,i){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ if(i>=2&&i<=4) castraMuro(B,p,false); else if(i%5!==3) castraMuro(B,p,true); }); });
    CASTRA.camere.forEach(function(p,i){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ if(p.tiene) castraCamere(B,p,false); else if(i%4) castraCamere(B,p,true); }); });
    luogo(B,X,Z,CASTRA.porta[0],CASTRA.porta[1],CASTRA.ang,.6,function(B){ [-1,1].forEach(function(s){ B.scatola(.5,.2,.6,s*.55,-.05,0,P.mattone); }); });
    CASTRA_DENTRO.edifici.forEach(function(o){ castraEdificio(B,X,Z,o,true); });
 }},
 /* Terme di Nerone (62 o 64), rifatte da Alessandro Severo nel 227 e da allora dette Alessandrine: «a rectangular area extending from the north-west corner of the Pantheon to the stadium
    of Domitian, an area of about 190 by 120 metres, and fronted north», con il caldarium che sporge dal centro del lato sud (Platner e Ashby, Thermae Neronianae). Il riquadro sta fra lo stadio
    del modello e il Pantheon, alla latitudine di palazzo Madama, dove ne restano muri (Nominatim, relazione 76432). La pianta interna è quella schematica delle altre terme. */
 {id:'termenerone', nome:'Terme di Nerone e di Alessandro', x:-85.8,z:-72, ry:0, zone:[[-5,0,6.2],[5,0,6.2]], fa:function(B){      // 27 novembre 2026, pianta propria: frigidarium al centro del lato nord, tepidarium, caldarium che sporge dal centro del lato sud, grandi cortili a colonne a est e a ovest della sala centrale, quattro sale per parte del caldarium (Platner e Ashby). Misure delle sale e altezze: schema
    corpoTerme(B,{W:19,D:10.6,z0:-6,hb:1.8,sala:[5,2.2,3.2],nat:[4.4,2.4],frig:'sala',ingresso:true,pal:[5,6.4],cald:{forma:'tondo',r:1.4,sporge:1.6,h:2.8},tep:{forma:'rett',w:1.6,d:1.4}}); }},
 /* Terme di Agrippa (25-19 a.C.): orientate nord-sud sull'asse del Pantheon, circa 100-120 m da nord a sud e 80-100 da est a ovest; appena a nord del centro una sala rotonda di circa 25 m,
    di un rifacimento non anteriore ad Alessandro Severo, l'«arco della Ciambella» (Platner e Ashby, Thermae Agrippae). Centro: OpenStreetMap, relazione 6596512. Altezze indicative. */
 {id:'termeagrippa', nome:'Terme di Agrippa', x:-68.78,z:-49.23, ry:0, zone:[[0,-2.5,5],[0,2.5,5]], fa:function(B){
    B.scatola(9,1.3,11,0,0,0,P.intonaco).falde(11,.4,9.2,0,1.3,0,P.coppi,PI/2,P.intonaco);
    B.cilindro(1.25,1.9,0,0,-1,P.mattone,null,24).cupola(1.25,0,1.9,-1,P.intonaco,.55);
    /* 27 novembre 2026: «the caldarium was probably directly west of the circular hall» (Platner e Ashby, Thermae Agrippae): una sala più alta a ovest della rotonda, con l'abside
       verso ovest e le finestre al sole del pomeriggio. Forma e misure: schema, perché la fonte dice «probably» e la disposizione delle altre sale «is uncertain». */
    B.scatola(2.4,1.65,2.8,-3.1,0,-1,P.intonaco).falde(2.9,.5,2.5,-3.1,1.65,-1,P.coppi,PI/2,P.intonaco).cilindro(.9,1.4,-4.3,0,-1,P.intonaco,null,12).cupola(.9,-4.3,1.4,-1,P.intonaco,.6);
    B.aperture(-4.3,.41,-1.9,.41,2,.75,.7,.5);
    B.aperture(-4.5,5.5,4.5,5.5,9,.15,.7).aperture(4.5,-5.5,-4.5,-5.5,9,.15,.7);
 }},
 /* Tempio del Divo Adriano (145): periptero ottastilo, tredici colonne sui fianchi; restano undici colonne del lato nord, alte 15 m con 1,44 di diametro, su un podio di peperino alto 4 m
    (Platner e Ashby, Hadrianeum; it.wikipedia «Tempio di Adriano»). Posizione e orientamento: l'edificio della Borsa che lo ingloba (Nominatim, way 130920782), con il fianco nord sul limite
    di piazza di Pietra. Fronte a est, verso la via Lata: a memoria. Larghezza e lunghezza (circa 28 x 47 m) vengono dal numero e dal diametro delle colonne con un interasse indicativo. */
 {id:'tempioadriano', nome:'Tempio di Adriano', x:-48.7,z:-80.9, ry:1.641, zone:[[0,0,3.2]], fa:function(B){ tempietto(B,2.8,4.7,.4,1.5,8,0,0,0,true); }},
 /* Tempio del Divo Claudio sul Celio (iniziato nel 54, rifatto da Vespasiano): piattaforma di 180 x 200 m su muri alti fino a 15 m; tempio esastilo, con tre colonne di profondità nel pronao,
    rivolto verso il Palatino (it.wikipedia «Tempio del Divo Claudio»). Centro da it.wikipedia; il lato est è parallelo a via Claudia (OpenStreetMap, way 129115593), dove resta la facciata a nicchie
    della mostra d'acqua. Le misure del tempio sono indicative. */
 {id:'tempioclaudio', nome:'Tempio di Claudio', x:64.72,z:50.57, ry:-1.21, zone:[[0,0,[6,5],4]], fa:function(B){      // la zona spiana solo sotto la piattaforma e finisce ai suoi muri (25 novembre 2026; prima sei cerchi sfumati su 70 m facevano un cumulo di terra)
    /* La piattaforma sale di 8,5 m sopra la spianata (23 novembre 2026): prima il suo piano era a filo del terreno, e a sud-est il pendio del Celio, più alto, ne copriva un angolo.
       Dal vero la terrazza dominava la valle del Colosseo con le sue sostruzioni e verso il colle arrivava alla quota della cima; l'altezza qui è indicativa.
       Dal 25 novembre 2026 i muri di sostegno scendono fino al piede del colle e ciascun lato ha la sua sostruzione (Platner e Ashby, Templum Claudii, letta quel giorno): a ovest
       «double rows of travertine arches with engaged columns and entablature» (due ordini di arcate: it.wikipedia «Tempio del Divo Claudio», in basso piatte, in alto ad arco);
       a nord «what seem to be reservoirs for water», una fila di stanze a volta; a est, il ninfeo di Nerone, «alternately square and semicircular recesses»; a sud, il lato meno
       elaborato (it.wikipedia). Qui +z è l'ovest, -x il nord, -z l'est, +x il sud. Numero e misura dei vani sono indicativi.
       Orientamento e scale (25 novembre 2026, src/testi/topografia-fonti.md, sezione 2): il tempio guarda a ovest (+z) come nel disegno del Cinquecento del frammento perduto 5c della pianta
       marmorea, «oriented to the W, and with four steps in front providing access to its podium» (Stanford Digital Forma Urbis, scheda 4b, dal Lexicon di Buzzetti). L'«ovest» della pianta,
       girata di circa 21 gradi, è il lato di via Claudia del modello, che è storto allo stesso modo. Il «fronting towards the north» di Platner viene dalla combinazione dei frammenti
       proposta da Hülsen nel 1903, che lui stesso dà per condizionata. Scale della piattaforma: a nord «einer nach dem Colosseum hinabführenden Freitreppe» (Hülsen 1907, pp. 232-234: ne
       restavano tracce), a sud una rampa a gradini che sale dal piano più basso (pianta marmorea, scheda 4b). Di nessuna delle due si sanno posto e misure: qui stanno sull'asse nord-sud,
       dove la pianta mostra i sentieri che vanno al tempio, larghe 24 e 16 m; la pendenza della scalinata e il numero dei gradini sono uno schema. */
    B.scatola(20,3.97,18,0,-3.07,0,P.tufo).scatola(19.6,.06,17.6,0,.87,0,P.prato);                // la piattaforma, a giardino, coi muri fino al piede del colle
    B.scatola(20.06,.12,18.06,0,.78,0,P.travertino);                                                // la cornice in cima ai muri
    B.scatola(20.04,3.9,.04,0,-3.07,9,P.travertino);                                               // ovest: la fronte di travertino
    B.aperture(-10,9,10,9,18,-2.75,1.05,.62).aperture(-10,9,10,9,18,-1.45,1.4,.62);               // le due file di arcate (27 novembre 2026: tutte e due ad arco, «double rows of travertine arches», Platner e Ashby; prima quella bassa era piatta)
    B.colonne(-8.89,9.06,8.89,9.06,17,2.6,.07,-2.95,P.travertino);                                 // le semicolonne fra un'arcata e l'altra
    B.scatola(20.04,.12,.1,0,-1.62,9.03,P.travertino).scatola(20.04,.1,.1,0,-.1,9.03,P.travertino);      // la trabeazione sopra ciascun ordine («with engaged columns and entablature»)
    for(var nb=0;nb<26;nb++) B.scatola(20.02,.012,.05,0,-2.95+nb*.15,9.04,P.ombra);                // i filari dei blocchi a bugnato (Hülsen 1907, p. 232: «lesene a bugne»; qui solo le commessure orizzontali, schema)
    B.aperture(-10,-9,-10,9,16,-2.95,.95,.7);                                                      // nord: le stanze a volta delle cisterne
    B.scatola(20.04,3.9,.04,0,-3.07,-9,P.mattone).scatola(.04,3.9,18.04,-10,-3.07,0,P.mattone);      // est e nord: muri di mattoni («the brick facing of the concrete substructures on the east», Platner e Ashby; a nord «Reste grosser Ziegelmauern», Hülsen 1907)
    var ter=suTerreno(64.72,50.57,-1.21), piedeEst=function(lx){ return Math.max(-2.5,ter(lx,-9.5)+.06); };      // 27 novembre 2026: il terreno lungo via Claudia sale verso sud; le nicchie partono dal suolo di quel punto (prima erano quasi tutte sotto terra)
    for(var nc=0;nc<14;nc++){ var xn=10-(nc+.5)*20/14, yn=piedeEst(xn); B.vano(xn,yn,-9.075,-1,0,.75,Math.min(1.3,.72-yn),nc%2===0); }        // est: le nicchie del ninfeo, quadre e a semicerchio alternate
    for(nc=1;nc<14;nc++) for(var n3=-1;n3<=1;n3++){ var x3=10-nc*20/14+n3*.17, y3=piedeEst(x3)+.25; B.vano(x3,y3,-9.075,-1,0,.1,Math.min(.55,.7-y3)); }      // fra l'una e l'altra «narrow semicircular niches in groups of three» (Platner e Ashby, Templum Claudii)
    /* il giardino della pianta marmorea (27 novembre 2026; Stanford, scheda 4b): «long, narrow strips» attorno al tempio, lette come siepi (Lloyd 1982), spazio libero davanti e
       dietro, sentieri sull'asse nord-sud dai bordi al tempio. Quante strisce, quanto distanti e quanto alte: schema */
    /* le siepi stanno in tempioclaudiosiepi, qui sotto: potate finché il tempio è in uso, poi macchie (27 novembre 2026) */
    B.scatola(15.6,.01,.5,0,.93,0,P.sabbia);                                                        // il sentiero sull'asse nord-sud, dal bordo nord al bordo sud
    B.dentro(0,.85,0,0,function(B){ tempietto(B,2.2,3.8,.35,1.4,6,0,0,0,false);
      [[.296,2.05,.3],[.242,2.275,.15],[.188,2.425,.15],[.134,2.575,.15]].forEach(function(g){ B.scatola(1.65,g[0],g[2],0,0,g[1],P.travertino); }); });      // i quattro gradini davanti al podio (pianta marmorea); il primo copre la scala di tempietto()
    var NG=44, SA=3.67/(NG+1), PA=.097, k;                                                          // nord: la scalinata verso il Colosseo, dal piano (0,93) al terreno della valle (-2,74)
    for(k=1;k<=NG;k++) B.scatola(PA,.93-SA*k+2.9,2.4,-10-PA*(k-.5),-2.9,0,P.travertino);
    for(k=1;k<=6;k++) B.scatola(.2,.93-.04*k-.5,1.6,10+.2*(k-.5),.5,0,P.travertino);             // sud: la rampa a gradini, fino al terreno del Celio (0,7)
 }},
 /* Le siepi del giardino del tempio di Claudio (27 novembre 2026, riserva 47): potate finché il tempio è curato; dopo la chiusura (392) nessuno le pota più e dal 440 al loro posto
    ci sono macchie e arbusti disordinati lungo le stesse file. Che le siepi si inselvatichissero non lo dice nessuna fonte: è ciò che succede a un giardino lasciato, e l'anno è una scelta. */
 {id:'tempioclaudiosiepi', x:64.72,z:50.57, ry:-1.21, come:'tempioclaudio', fa:function(B){
    [[-1,1],[1,1]].forEach(function(q){ [3.2,5.2,7.2].forEach(function(dx){ B.scatola(.9,.12,.14,q[0]*dx,.93,-2.3,P.chioma).scatola(.9,.12,.14,q[0]*dx,.93,2.3,P.chioma); }); });      // le siepi ai lati lunghi del tempio, a nord e a sud
    [-1,1].forEach(function(q){ [2.6,4.6,6.6].forEach(function(dx){ B.scatola(.14,.12,1.5,q*dx,.93,1.05,P.chioma).scatola(.14,.12,1.5,q*dx,.93,-1.05,P.chioma); }); });      // le siepi di traverso, interrotte dal sentiero
 }},
 {id:'tempioclaudiomacchie', x:64.72,z:50.57, ry:-1.21, come:'tempioclaudio', fa:function(B){
    var r=RM.casuale(441);
    function macchia(x0,z0,lx,lz){ var n=3+Math.floor(r()*3); for(var j=0;j<n;j++){ var t=(j+.5)/n+(r()-.5)*.25, rr=.09+.12*r();      // lungo la vecchia siepe, a ciuffi di misura diversa, con dei vuoti
      if(r()<.2) continue; palla(B,rr,x0+(t-.5)*lx+(r()-.5)*.12,.93+rr*.55,z0+(t-.5)*lz+(r()-.5)*.12,r()<.5?P.chioma:P.chioma2,1+.5*r(),.7+.4*r(),1+.5*r(),7); } }
    [[-1,1],[1,1]].forEach(function(q){ [3.2,5.2,7.2].forEach(function(dx){ macchia(q[0]*dx,-2.3,.9,0); macchia(q[0]*dx,2.3,.9,0); }); });
    [-1,1].forEach(function(q){ [2.6,4.6,6.6].forEach(function(dx){ macchia(q*dx,1.05,0,1.5); macchia(q*dx,-1.05,0,1.5); }); });
 }},
 /* Arco di Dolabella e Silano (10 d.C.), in travertino, poi sotto gli archi neroniani dell'acqua Claudia (Platner e Ashby, arcus). Contorno e orientamento: OpenStreetMap, way 135618677.
    Altezza e larghezza del fornice indicative. */
 {id:'dolabella', nome:'Arco di Dolabella e Silano', etichetta:'Arco di Dolabella', x:81.86,z:76.56, ry:.89, zone:[[0,0,.7]], fa:function(B){ arcoUno(B,.81,.52,.65,.4,.5,0,0,0,0,P.travertino); }},
 /* Ludus Magnus, la caserma dei gladiatori accanto al Colosseo (Domiziano, rifatta sotto Traiano): celle su tre piani attorno a un cortile con un'arena ellittica e piccole gradinate
    (it.wikipedia «Ludus Magnus»). Orientamento e lunghezza (86 m) dalla parte scavata (OpenStreetMap, relazione 1894844), che è la metà nord; larghezza (circa 72 m) e arena (circa 62 x 45)
    a memoria, indicative. */
 {id:'ludusmagnus', nome:'Ludus Magnus', x:79.6,z:27.8, ry:-.296, zone:[[0,0,[3,2.3],1.4]], fa:function(B){      // zona a misura del recinto (25 novembre 2026: prima un cerchio di 50 m, e la terra del Celio sovrastava il lato sud)
    zoccolo(B,-4.35,4.35,-3.65,3.65,-.9,.02,P.mattone,.25);
    [-3,3].forEach(function(z){ B.scatola(8.6,.95,1.2,0,0,z,P.mattone).falde(8.6,.3,1.3,0,.95,z,P.coppi,0,P.mattone); });
    [-3.7,3.7].forEach(function(x){ B.scatola(1.2,.95,4.8,x,0,0,P.mattone).falde(4.8,.3,1.3,x,.95,0,P.coppi,PI/2,P.mattone); });
    B.aperture(-4.2,3.6,4.2,3.6,12,.15,.3).aperture(4.2,-3.6,-4.2,-3.6,12,.15,.3);
    var a=RM.ellisse(3.1,2.25,28), g=RM.ellisse(2.6,1.75,28), c=g.map(function(){ return [0,0]; });
    B.striscia(a,0,a,.35,P.travertino).striscia(a,.35,g,.12,P.tufo).striscia(g,.12,c,.12,P.sabbia);
 }},
 /* Meta Romuli: piramide fra il mausoleo di Adriano e il Vaticano, «larger than the pyramid of Cestius»; copriva l'incrocio di Borgo Nuovo con via di Porta Castello e Alessandro VI
    ne tolse la parte sud nel 1499 (Platner e Ashby, Meta Romuli). Il punto: via di Porta Castello prolungata (OpenStreetMap, way 202591024) fino a Borgo Nuovo, poco a nord del portico
    dei pellegrini: un'ipotesi. Misure: un decimo più della piramide Cestia, indicative. */
 {id:'metaromuli', nome:'Meta Romuli', x:-184,z:-111.9, ry:.0685, zone:[[0,0,2.3]], fa:function(B){ B.scatola(3.3,.08,3.3,0,-.03,0,P.travertino).cono(2.3,4,0,.05,0,P.marmo,4); }},
 /* Foro Boario. Posizioni e orientamenti da OpenStreetMap: tempio rotondo (way 251342364), di Portuno (way 251331418), arco di Giano (way 52924046), degli Argentari (way 123971358);
    lo sbocco della Cloaca da Nominatim (nodo 4754734734). Ercole Vincitore: venti colonne alte 10,6 m (it.wikipedia). Portuno: tetrastilo, pseudoperiptero, ionico (it.wikipedia), fronte
    a nord verso il fiume; podio e colonne di altezza indicativa. Arco di Giano: 12 m di lato e 16 di altezza, fornici di 10,60 x 5,70, quarantotto nicchie (Platner e Ashby, Ianus Quadrifrons);
    l'attico tolto nel 1827 non c'è. Arco degli Argentari (204): architrave su due piloni, alto 6,15 m, luce 3,30 (Platner e Ashby). Cloaca: arco di circa 4,5 m (a memoria). */
 {id:'foroboario', nome:'Foro Boario', x:-29,z:37, ry:0, altoFisso:2.0100255, raggioFisso:11.6825, zone:[[-8.57,4.76,1.2],[-7.45,-.89,1.3],[8.02,-2.06,1],[9.96,-3.56,.5],[-12.93,3.79,.5]], fa:function(B){      // altoFisso, raggioFisso: le misure del gruppo prima che i quattro pezzi qui sotto ne uscissero (27 novembre 2026)
    var X=-29, Z=37;
    /* il tempio rotondo, il tempio di Portuno, l'arco di Giano e l'arco degli Argentari sono monumenti a sé dal 27 novembre 2026 (id 'ercolevincitore', 'portuno', 'giano', 'argentari', qui sotto) */
    luogo(B,X,Z,-41.93,40.79,0,.5,function(B){ B.scatola(.3,.7,1.2,0,-.55,0,P.tufo).vano(-.16,-.55,0,0,1,.45,.5); });
 }},
 /* Edifici del Foro Boario resi monumenti a sé il 27 novembre 2026: stesso disegno, stesso posto (il punto che il gruppo dava a luogo()), stessa quota del piede; ora hanno nome,
    scheda e storia propria. Fonti in coda a src/testi/topografia-fonti.md, «Mancanti aggiunti, secondo gruppo». */
 {id:'ercolevincitore', nome:'Tempio di Ercole Vincitore', etichetta:'Ercole Vincitore', x:-37.57,z:41.76, ry:0, zone:[], fa:function(B){      // il tempio rotondo, per Platner e Ashby (Hercules Victor, aedes) «the existing round temple which is the church of S. Maria del Sole»; il nome è discusso
    luogo(B,-37.57,41.76,-37.57,41.76,0,.9,function(B){
      B.cilindro(.92,.12,0,0,0,P.travertino,.88,24).cilindro(.42,1.06,0,.12,0,P.marmo,null,20);
      for(var k=0;k<20;k++){ var a=k*PI/10; B.colonne(.72*Math.cos(a),.72*Math.sin(a),.72*Math.cos(a),.72*Math.sin(a),1,1.06,.045,.12); }
      B.cilindro(.8,.08,0,1.18,0,P.marmo,null,24).cono(.82,.32,0,1.26,0,P.coppi,20);
    });
 }},
 {id:'portuno', nome:'Tempio di Portuno', etichetta:'Portuno', x:-36.45,z:36.11, ry:0, zone:[], fa:function(B){      // Platner e Ashby lo chiamano tempio di Mater Matuta (Mater Matuta, templum): ionico, tetrastilo, pseudoperiptero, 20 x 12 m, podio di 2,50 m
    luogo(B,-36.45,36.11,-36.45,36.11,-2.845,.9,function(B){ tempietto(B,1.06,1.95,.25,.88,4,0,0,0,false); });
 }},
 {id:'giano', nome:'Arco di Giano', etichetta:'Arco di Giano', x:-20.98,z:34.94, ry:0, zone:[], fa:function(B){      // Platner e Ashby, Ianus Quadrifrons: «12 metres square and 16 high», arcate alte 10,60 e larghe 5,70, «two rows of niches… forty-eight in all»
    /* 27 novembre 2026 (voce riletta per intero, confronto con una fotografia): prima era un blocco pieno con quattro porte dipinte; ora «four piers connected by quadripartite
       vaulting»: quattro piloni e quattro archi aperti, e sopra l'attico. La parte alta «removed in 1827 as mediaeval, probably belonged to the attic» (Hülsen, in Platner e Ashby):
       nell'800 l'arco aveva ancora l'attico. Quanto fosse alto la voce non lo dice (alto 2,5 m: schema, detto in scheda); la piramide che Hülsen ci mette sopra è una sua ricostruzione
       e non si disegna. Orientamento e centro tornano col contorno su OpenStreetMap (way 52924046). */
    luogo(B,-20.98,34.94,-20.98,34.94,.314,.7,function(B){
      B.dentro(0,0,.4425,0,function(B){ muroForato(B,1.2,1.6,.315,[[0,.57,1.06]],P.marmo); }).dentro(0,0,-.4425,0,function(B){ muroForato(B,1.2,1.6,.315,[[0,.57,1.06]],P.marmo); });      // le due fronti nord e sud, coi piloni
      [1,-1].forEach(function(q){ B.dentro(q*.4425,0,0,PI/2,function(B){ muroForato(B,.57,1.6,.315,[[0,.57,1.06]],P.marmo); }); });      // i due archi est e ovest, fra i piloni
      B.scatola(.57,.54,.57,0,1.06,0,P.marmo).scatola(1.24,.06,1.24,0,1.6,0,P.marmo).scatola(1.2,.25,1.2,0,1.66,0,P.marmo);      // sopra la crociera; la cornice e l'attico
      [[0,.61,1,0],[.61,0,0,-1],[0,-.61,-1,0],[-.61,0,0,1]].forEach(function(f){
        [-1,1].forEach(function(s){ [.3,.68].forEach(function(y){ [-.09,0,.09].forEach(function(q){ var o=s*.45+q; B.vano(f[0]+f[2]*o,y,f[1]+f[3]*o,f[2],f[3],.055,.16); }); }); });   // tre nicchie per pilone, su due file
      });
    });
 }},
 {id:'argentari', nome:'Arco degli Argentari', etichetta:'Argentari', x:-19.04,z:33.44, ry:0, zone:[], fa:function(B){      // Platner e Ashby, Arcus Argentariorum: del 204, «not a true arch, but a flat lintel resting on two piers», alto 6,15 m, luce 3,30
    luogo(B,-19.04,33.44,-19.04,33.44,0,.4,function(B){ arcoUno(B,.63,.33,.615,.33,.45,0,0,0,0,P.marmo,true);
      B.scatola(.63,.04,.33,0,0,0,P.travertino).scatola(.69,.05,.39,0,.565,0,P.marmo);      // 27 novembre 2026: lo zoccolo di travertino («entirely of marble, except the base, which is of travertine») e la cornice in cima, che sporge (fotografia)
      [-1,1].forEach(function(s){ [-1,1].forEach(function(q){ B.scatola(.05,.5,.02,s*.29,.04,q*.17,P.marmo).scatola(.07,.04,.03,s*.29,.5,q*.17,P.marmo); }); });      // «at the corners of the piers are pilasters with Corinthian capitals»: le lesene sulle due fronti, coi capitelli
    });
 }},
 /* Portico d'Ottavia (dopo il 27 a.C., rifatto da Settimio Severo): «a rectangular area, 118 metres in width and somewhat more in length», con una doppia fila di colonne di granito,
    ventotto per fila sulla fronte (Platner e Ashby, Porticus Octaviae); la lunghezza (132 m) è indicativa. Il propileo, che resta come ingresso di Sant'Angelo in Pescheria (dal 755, a memoria),
    è il centro della fronte sud (OpenStreetMap, way 123530471, che dà anche l'orientamento). Dentro, i templi di Giunone Regina e di Giove Statore: misure e posti indicativi. */
 {id:'ottavia', nome:"Portico d'Ottavia", x:-52.9,z:-5.56, ry:-.488, altoFisso:1.985, raggioFisso:6.8075, zone:[[0,-3.3,5.2],[0,3.3,5.2],[0,6.3,1.4],[-4.6,-5.3,2.2],[4.6,-5.3,2.2],[-4.6,5.3,2.2],[4.6,5.3,2.2]], fa:function(B){      // altoFisso, raggioFisso: le misure di prima che il propileo ne uscisse (27 novembre 2026)
    portico(B,11.8,13.2,0,0,0,.85,P.prato); B.colonne(-5.3,5.4,5.3,5.4,28,.85,.06,.1,P.granito);
    /* il propileo è un monumento a sé dal 27 novembre 2026 (id 'ottaviapropileo', qui sotto): resta in piedi mentre il portico cade */
    B.tempio(1.5,2.6,1.1,-2.6,-.6,0,{fronte:6,lati:9,podio:.35}).tempio(1.5,2.6,1.1,2.6,-.6,0,{fronte:6,lati:9,podio:.35});
 }},
 /* Il propileo del portico d'Ottavia (Platner e Ashby, Porticus Octaviae): l'ingresso al centro del lato sud-ovest, «a double pronaos, projecting inward and outward», con quattro
    colonne corinzie di marmo bianco su ogni fronte, alte 8,60 m; due colonne della fronte esterna «have been replaced by a brick arch, perhaps after the earthquake of A.D. 442» (non disegnato).
    È in piedi oggi, ingresso di Sant'Angelo in Pescheria. Stesso disegno e stesso posto di prima (il punto (0, 6) del portico, portato nella città), stessa quota del portico (come). */
 {id:'ottaviapropileo', nome:"Propileo del portico d'Ottavia", etichetta:"Propileo d'Ottavia", x:-55.713,z:-.26, ry:-.488, come:'ottavia', zone:[], fa:function(B){
    tempietto(B,1.99,1.29,.12,.95,4,0,0,0,false);                                                     // il propileo
 }},
 /* Area sacra di largo Argentina: quattro templi repubblicani (III-II secolo a.C.) rivolti a est. Contorni da OpenStreetMap: A (sotto San Nicola de Calcarario, way 125566963), B rotondo
    (way 125566965), C (way 125566967), D (way 125566969); il podio di ciascuno ha la misura del contorno. Altezze di podi e colonne indicative. */
 {id:'argentina', nome:'Area sacra di largo Argentina', x:-70.3,z:-31, ry:0, zone:[[0,-2.5,4],[0,2.5,4]], fa:function(B){
    B.scatola(5,.04,10.4,-.3,0,0,P.selce);
    B.tempio(1.25,2.3,.9,.01,-4.01,1.658,{fronte:6,lati:9,podio:.3});                                 // A
    B.dentro(.37,0,-.97,1.658,function(B){                                                            // B, rotondo
      B.cilindro(.85,.3,0,0,0,P.travertino,null,24).cilindro(.45,.9,0,.3,0,P.marmo,null,18);
      for(var k=0;k<18;k++){ var a=k*PI/9; B.colonne(.72*Math.cos(a),.72*Math.sin(a),.72*Math.cos(a),.72*Math.sin(a),1,.9,.04,.3); }
      B.cilindro(.8,.08,0,1.2,0,P.marmo,null,24).cono(.82,.3,0,1.28,0,P.coppi,18).scatola(.6,.25,.4,0,0,1,P.travertino);
    });
    B.tempio(1.07,1.74,.85,-.37,1.59,1.658,{fronte:4,podio:.4}).tempio(1.4,3.62,1,-.37,4.01,1.658,{fronte:6,podio:.35});   // C e D
 }},
 /* Iseo Campense, il santuario di Iside e Serapide (Domiziano, poi i Severi), «between the Saepta and the temple of Minerva» (Platner e Ashby, Isis): qui il recinto va da piazza di San Macuto
    a Santo Stefano del Cacco (Nominatim) e ad est dell'abside della Minerva; l'ingombro, circa 95 x 210 m, è dato dai punti di ritrovamento ed è indicativo, come il muro. Gli obelischi stanno
    dove furono trovati (Platner e Ashby, Obelisci Isei Campensis; it.wikipedia): il Macuteo in piazza di San Macuto (nel 1373), quello della Minerva nel giardino del convento (1665),
    quello di Dogali sotto l'abside (1883); i punti presso la Minerva sono stimati. Altezze: 6 m, 5,47 m e 6,34 m. Quelli di Boboli e di Urbino, trovati davanti alla chiesa, non ci sono. */
 /* Corretto il 23 novembre 2026: l'Iseo stava 40 m troppo a ovest e copriva i Saepta, che gli studi di Gatti mettono fra il Pantheon e il santuario (it.wikipedia, «Saepta Iulia»:
    fra via del Seminario, via di Sant'Ignazio, via del Plebiscito, via dei Cestari e via della Minerva; «Iseo Campense»: lungo 240 m e largo 60, l'esedra sotto Santo Stefano del Cacco).
    Ora il recinto va dal confine dei Saepta (x -55) a via di Sant'Ignazio, largo 80 m; i punti degli obelischi della Minerva e di Dogali, presso l'abside della chiesa, restano stimati. */
 {id:'iseo', nome:'Iseo Campense', x:-51,z:-62.5, ry:0, zone:[[0,-7.5,4.6],[0,0,4.6],[0,7.5,4.6]], fa:function(B){
    var W=8, L=21;
    B.scatola(W,.5,.2,0,0,-L/2,P.mattone).scatola(W,.5,.2,0,0,L/2,P.mattone).scatola(.2,.5,L,-W/2,0,0,P.mattone).scatola(.2,.5,L,W/2,0,0,P.mattone).scatola(W-.4,.04,L-.4,0,0,0,P.selce);
    // i tre obelischi (Macuteo, della Minerva, di Dogali) sono voci a sé dal 27 novembre 2026, nei punti di prima
 }},
 /* Saepta Iulia: il recinto delle votazioni finito da Agrippa nel 26 a.C., poi passeggio e mercato; un quadriportico con due grandi portici lunghi (it.wikipedia «Saepta Iulia», da Gatti).
    Posizione secondo Gatti: fra il Pantheon e le terme di Agrippa a ovest e l'Iseo a est, da via del Seminario verso sud (via del Plebiscito chiude l'isolato; lì, lungo il portico sud, il Diribitorium,
    che non si disegna). Platner e Ashby (1929) lo mettevano invece lungo la via Lata: la scheda lo dice. «No reference has been found to it in the Middle Ages»: dopo il V secolo non lo
    nominano più; qui chiude nel 450 (ipotesi). Misure dalle vie di oggi, alzati indicativi. */
 {id:'saepta', nome:'Saepta Iulia', x:-59.5,z:-58.5, ry:0, zone:[[0,-9,4.6],[0,0,4.6],[0,9,4.6]], fa:function(B){      // 25 novembre 2026: il lato est finisce a x -55, dove comincia il recinto dell'Iseo (qui sotto); prima i due muri si sovrapponevano per 5 m. Il lato ovest resta dov'era
    var W=9, L=29;
    B.scatola(W-.4,.04,L-.4,0,0,0,P.selce);                                                             // la grande piazza
    [-1,1].forEach(function(q){ var x=q*(W/2-.7);                                                      // i due portici lunghi, a ovest e a est
      B.scatola(.2,1.3,L,q*(W/2-.1),0,0,P.intonaco).colonne(x-q*.6,-L/2+.6,x-q*.6,L/2-.6,Math.round((L-1.2)/.374)+1,1.15,.0575,0).falde(L,.32,1.4,x,1.15,0,P.coppi,PI/2,P.intonaco); });      // colonne con le proporzioni dei portici (in portico(), qui sopra): prima erano 24 per lato, a 12 m l'una dall'altra
    [-1,1].forEach(function(q){ B.scatola(W,1.3,.25,0,0,q*(L/2-.12),P.intonaco); });                  // i lati corti
 }},
 /* Esquilino. Arco di Gallieno: la porta Esquilina rifatta e dedicata a Gallieno nel 262 (Platner e Ashby, Porta Esquilina; OpenStreetMap, way 81741050); misure a memoria, indicative
    (alto circa 8,8 m). Trofei di Mario, la mostra d'acqua di piazza Vittorio (OpenStreetMap, way 345702226): i trofei di marmo vi restano fino al 1590 (Platner e Ashby, Tropaea Marii); massa
    e altezza (circa 20 m) indicative. Auditorium di Mecenate (OpenStreetMap, relazione 5886457): aula absidata in parte sotto il suolo, misure indicative. */
 {id:'esquilino', nome:'Auditorium di Mecenate', etichetta:'Auditorium di Mecenate', ex:132.79,ez:-16.86, x:140,z:-28, ry:0, altoFisso:2.05, raggioFisso:10.864368, zone:[[-6.93,-8.43,.8],[12.14,-2.42,1.9],[-7.21,11.14,1.5]], fa:function(B){      // fino al 27 novembre 2026 «Arco di Gallieno e Trofei di Mario»: arco e mostra d'acqua sono ora monumenti a sé ('arcogallieno', 'trofeimario', qui sotto); altoFisso, raggioFisso: le misure di prima
    var X=140, Z=-28;
    luogo(B,X,Z,132.79,-16.86,2.548,1.2,function(B){      // l'Auditorium (27 novembre 2026, Platner e Ashby, Auditorium Maecenatis, e Sovrintendenza): lungo 24,10 m con l'abside, largo 10,60 (13 per la Sovrintendenza); il pavimento 7 m sotto il suolo antico, i muri 6 m sopra; volta «probably»; si entra in discesa
      B.scatola(1.88,1.3,1.06,-.26,-.7,0,P.mattone).cilindro(.53,1.3,.68,-.7,0,P.mattone,null,16).volta(1.88,.53,-.26,.6,0,P.mattone).cupola(.53,.68,.6,0,P.mattone,1);      // aula, abside, volta a botte e catino
      [[-2.15,0,.2],[-1.2,-.62,.2],[-1.2,-.62,-.2],[-2.15,0,-.2]].forEach(function(v,i,a){ if(i===0){ B.quad(a[0],a[1],a[2],a[3],P.selce); B.quad(a[3],a[2],a[1],a[0],P.selce); } });      // la rampa in discesa verso l'ingresso (la doppia rampa della Sovrintendenza, qui una)
      [-1,1].forEach(function(q){ B.scatola(.95,.7,.06,-1.68,-.68,q*.23,P.mattone); }); });
 }},
 /* L'arco di Gallieno e i Trofei di Mario, resi monumenti a sé il 27 novembre 2026: stesso disegno, stesso posto e stessa quota del piede di quando stavano nel gruppo 'esquilino'.
    Fonti in coda a src/testi/topografia-fonti.md, «Mancanti aggiunti, secondo gruppo». */
 /* Arco di Gallieno, rifatto il 27 novembre 2026 sulla voce Arcus Gallieni di Platner e Ashby, letta per intero, e su una fotografia: «The existing single arch is of travertine,
    8.80 metres high, 7.30 wide, and 3.50 deep. The piers which support it are 1.40 metres wide and 3.50 deep, and outside of them are two pilasters of the same depth, with Corinthian
    capitals. The entablature is 2 metres high … Beneath the spring of the arch on each side is a simple cornice. A drawing … of the fifteenth century shows small side arches».
    Prima 7,30 x 8,80 era la misura di tutto l'arco e il fornice era largo 4,5 m; ed era girato di 90 gradi: la strada (la Tiburtina del modello) gli passava nel muro. Ora il fornice
    è largo 7,30 e alto 8,80, coi piloni, le lesene e la trabeazione di 2 m; il lato lungo segue il contorno su OpenStreetMap (way 81741050, 11,7 x 4,7 m: ry 1,6), e la strada passa
    sotto. I due archi minori del disegno del Quattrocento erano ancora in piedi allora, quindi anche nell'800: ci sono, ma la loro misura la fonte non la dà (larghi 2,4 m, alti 4,4,
    in due ali basse: schema, detto in scheda). */
 {id:'arcogallieno', nome:'Arco di Gallieno', etichetta:'Arco di Gallieno', x:133.07,z:-36.43, ry:0, zone:[], fa:function(B){      // Platner e Ashby, Porta Esquilina: il posto della porta «is marked by the existing Arcus Gallieni»
    luogo(B,133.07,-36.43,133.07,-36.43,1.6,.6,function(B){
      muroForato(B,1.13,.92,.35,[[0,.73,.88]],P.travertino);                                                                     // il fornice di 7,30 x 8,80 fra i piloni di 1,40
      B.scatola(1.17,.2,.37,0,.92,0,P.travertino).scatola(1.21,.03,.4,0,1.12,0,P.travertino);                                     // la trabeazione di 2 m, con l'iscrizione sull'architrave, e la cornice
      [-1,1].forEach(function(s){ [-1,1].forEach(function(q){ B.scatola(.07,.92,.02,s*.53,0,q*.18,P.travertino).scatola(.09,.05,.03,s*.53,.87,q*.18,P.travertino); });      // le lesene coi capitelli corinzi
        B.scatola(.16,.025,.37,s*.435,.495,0,P.travertino);                                                                      // la cornice semplice sotto l'imposta dell'arco
        B.dentro(s*.835,0,0,0,function(B){ muroForato(B,.54,.44,.3,[[0,.24,.38]],P.travertino); B.scatola(.56,.04,.32,0,.44,0,P.travertino); }); });      // gli archi minori ai lati (schema)
    });
 }},
 {id:'trofeimario', nome:'Trofei di Mario (ninfeo di Alessandro)', etichetta:'Trofei di Mario', x:152.14,z:-30.42, ry:0, zone:[], fa:function(B){      // Platner e Ashby, Nymphaeum Alexandri: mostra d'acqua probabilmente di Severo Alessandro, «connected with the aqua Alexandrina»; i trofei portati in Campidoglio nel 1590
    luogo(B,152.14,-30.42,152.14,-30.42,.052,1.5,function(B){
      B.scatola(2.4,.5,3.4,0,0,0,P.mattone).scatola(1.2,1.5,1.5,0,.5,0,P.mattone).vano(-.61,.5,0,0,1,.7,1.1);
      [-.95,.95].forEach(function(z){ B.scatola(.3,.9,.5,0,.5,z,P.mattone).scatola(.22,.35,.3,0,1.4,z,P.statua); });   // i due trofei, ai lati
    });
 }},
 /* Tempio di Minerva Medica: aula decagona di mattoni, larga circa 24 m e alta 33, con nove nicchie oltre all'ingresso e dieci finestre ad arco sopra; la cupola cade in parte nel 1828
    (Platner e Ashby, Nymphaeum); «presumibilmente» dell'inizio del IV secolo (it.wikipedia): il 320 è una scelta. Le sale aggiunte attorno non ci sono. OpenStreetMap, relazione 13471829. */
 {id:'minervamedica', nome:'Tempio di Minerva Medica', x:220.27,z:-16.27, ry:.873, zone:[[0,0,2.2]], fa:function(B){
    B.cilindro(1.2,2.35,0,0,0,P.mattone,1.2,10).cupola(1.17,0,2.35,0,P.mattone,.8);
    for(var k=0;k<10;k++){ var t=(k+.5)*PI/5, s=Math.sin(t), c=Math.cos(t), ap=1.2*Math.cos(PI/10)+.01;
      B.vano(s*ap,1.45,c*ap,c,-s,.38,.6); if(k===0) B.vano(s*ap,0,c*ap,c,-s,.4,.9); }
 }},
 /* Sessoriano. Anfiteatro Castrense: ellisse di 88,5 x 78 m (Platner e Ashby, Amphitheatrum Castrense), murato nella cinta Aureliana; centro da OpenStreetMap (nodo 1791417716), asse lungo
    est-ovest come il tratto di mura che lo chiude a sud; altezza e arena indicative. Circo Variano: i carceres stanno dentro le mura (OpenStreetMap, way 261041472, che dà l'orientamento) e la pista
    corre verso nord-nord-est fuori dalla cinta, che la taglia; lunghezza (circa 565 m) a memoria, larghezza dai carceres (91 m), indicativa. L'obelisco di Antinoo vi fu portato da Elagabalo
    (it.wikipedia «Obelisco del Pincio») e fu ritrovato in tre pezzi fuori porta Maggiore: il posto a metà della spina è un'ipotesi. Alto 9,24 m. */
 /* Anfiteatro Castrense, rifatto il 27 novembre 2026 e diviso in due voci, prima e dopo le mura (prima stava nel gruppo sessoriano, sempre intero). Platner e Ashby,
    Amphitheatrum Castrense: assi di 88,5 e 78 m, «constructed entirely of brick and brick-faced concrete»; fuori «three stories of open arcades, adorned with pilasters and
    Corinthian capitals»; it.wikipedia («Anfiteatro castrense»): al primo piano arcate fra semicolonne, al secondo arcate chiuse da bassi parapetti fra lesene, il terzo un attico
    con finestre. Con le mura di Aureliano il muro si attacca a metà dei lati est e ovest: la metà esterna diventa un bastione, «the open arcades of the exterior were walled up»,
    e «the inner half was evidently pulled down». Qui le mura del modello (da OpenStreetMap) girano attorno al lato sud: il bastione è la metà sud. I disegni del Cinquecento
    mostrano ancora i tre piani. Schema: altezze dei piani, numero delle arcate, gradinate. L'abbassamento del terreno attorno non è disegnato. */
 {id:'castrense', nome:'Anfiteatro Castrense', x:246.79,z:53.9, ry:0, fa:function(B){ luogo(B,246.79,53.9,246.79,53.9,0,3,function(B){ castrense(B,false); }); }},
 {id:'castrensemura', nome:'Anfiteatro Castrense', x:246.79,z:53.9, ry:0, note:{chiuso:'murato nelle mura, come bastione'}, fa:function(B){ luogo(B,246.79,53.9,246.79,53.9,0,3,function(B){ castrense(B,true); }); }},
 /* Sessoriano: resta il circo Variano (l'anfiteatro ha le sue due voci qui sopra) */
 {id:'sessoriano', nome:'Circo Variano', ex:VARIANO.x, ez:VARIANO.z, x:246.79,z:53.9, ry:0, zone:[[0,0,4.8]].concat([-24,-16,-8,0,8,16,24].map(function(t){ return [VARIANO.x-246.79+.485*t, VARIANO.z-53.9-.875*t, 6.2]; })), fa:function(B){
    var X=246.79, Z=53.9;
    luogo(B,X,Z,VARIANO.x,VARIANO.z,VARIANO.ry,4,function(B){
      var L=56.5, o=RM.stadio(L,11.5,26,14), t=RM.stadio(L-2,9.5,26,14), asse=t.map(function(p){ return [Math.max(-L/2+4,Math.min(L/2-6,p[0])),0]; });
      B.striscia(o,-1,o,.7,P.mattone).striscia(o,.7,t,.25,P.tufo).striscia(t,.25,asse,.25,P.sabbia);
      B.scatola(30,.18,.5,-1,.2,0,P.travertino);                                                     // la spina
    });      // l'obelisco di Antinoo sulla spina è una voce a sé dal 27 novembre 2026 (obeliscoantinoo)
 }},
 /* Gli obelischi, ognuno una voce a sé (27 novembre 2026; fonti in coda a src/testi/topografia-fonti.md, «Gli obelischi»). Disegno e punto sono quelli che avevano dentro i
    loro gruppi; cambia solo l'altezza dove Platner e Ashby la danno. Per nessuno di questi le fonti lette danno l'anno della caduta: restano in piedi fino all'852. */
 {id:'obeliscoantinoo', nome:"Obelisco di Antinoo", x:246.79,z:53.9, ry:0, fa:function(B){      // «about 9 metres high» (Platner e Ashby, Obeliscus Antinoi); sulla spina del circo Variano (it.wikipedia, ipotesi già dichiarata)
    luogo(B,246.79,53.9,VARIANO.x,VARIANO.z,VARIANO.ry,4,function(B){ B.dentro(-1,.38,0,0,function(B){ obelisco(B,.924,0,.1,0,0); }); });
 }},
 {id:'obeliscoflaminio', nome:"Obelisco di Augusto nel Circo Massimo", etichetta:'Obelisco di Augusto', x:0,z:71, ry:-.651, come:'circo', fa:function(B){      // «23.70 metres» (Platner e Ashby, Obeliscus Augusti in Circo Maximo): fusto e cuspide 2,37 unità; prima 2,6
    B.scatola(.5,.3,.5,-1,.52,0,P.marmo).cilindro(.17,2.13,-1,.82,0,P.sabbia,.1,4).cono(.1,.24,-1,2.95,0,P.sabbia,4);
 }},
 {id:'obeliscomausoleo1', nome:"Obelisco del Mausoleo di Augusto (a ovest dell'ingresso)", etichetta:'Obelisco', x:-74.9,z:-145.9, ry:0, fa:function(B){      // «a little over 14 metres high» (Platner e Ashby, Obelisci Mausolei Augusti); dei due, uno è oggi dietro Santa Maria Maggiore e l'altro in piazza del Quirinale: quale stesse a ovest non si sa
    B.scatola(.22,.2,.22,0,0,0,P.marmo).cilindro(.09,1.3,0,.2,0,P.sabbia,.06,4).cono(.065,.13,0,1.5,0,P.sabbia,4);
 }},
 {id:'obeliscomausoleo2', nome:"Obelisco del Mausoleo di Augusto (a est dell'ingresso)", etichetta:'Obelisco', x:-73.1,z:-145.9, ry:0, fa:function(B){      // il gemello, alto uguale
    B.scatola(.22,.2,.22,0,0,0,P.marmo).cilindro(.09,1.3,0,.2,0,P.sabbia,.06,4).cono(.065,.13,0,1.5,0,P.sabbia,4);
 }},
 {id:'obeliscomacuteo', nome:"Obelisco Macuteo", x:-49.39,z:-72.35, ry:0, fa:function(B){ obelisco(B,.6,0,.12,0,0); }},      // «6 metres high» (Platner e Ashby, Obelisci Isei Campensis, 1); oggi davanti al Pantheon
 {id:'obeliscominerva', nome:"Obelisco della Minerva", x:-53.8,z:-64, ry:0, fa:function(B){ obelisco(B,.547,0,.12,0,0); }},      // trovato nel 1665, oggi sull'elefante di Bernini (Obelisci Isei Campensis, 2); 5,47 m (commento dell'Iseo)
 {id:'obeliscodogali', nome:"Obelisco di Dogali", x:-52.6,z:-61.5, ry:0, fa:function(B){ obelisco(B,.634,0,.12,0,0); }},      // «about 6 metres high», trovato nel 1883 sotto l'abside della Minerva (Obelisci Isei Campensis, 3)
 /* Sepolcro di Eurisace, il fornaio (fine della repubblica): trapezio di 8,75, 6,85, 5,80 e 4,05 m, rivestito di travertino, nell'angolo fra Prenestina e Labicana; quando Onorio rifà le mura
    una delle torri di porta Maggiore lo chiude dentro di sé (Platner e Ashby, Sepulchrum Eurysacis): sparisce alla vista nel 402. OpenStreetMap, way 585473524. Altezza (circa 10 m) a memoria. */
 {id:'eurisace', nome:'Sepolcro di Eurisace', x:248.73,z:11.94, ry:1.187, zone:[[0,0,.7]], fa:function(B){
    B.scatola(.8,.95,.6,0,0,0,P.travertino).scatola(.84,.18,.64,0,.72,0,P.marmo);                    // il fregio con le scene della panificazione
    [.2,.45].forEach(function(y){ B.aperture(-.4,.31,.4,.31,6,y,.14,.07).aperture(.4,-.31,-.4,-.31,6,y,.14,.07); });      // le file di bocche cilindriche
 }},
 /* Archi della via Lata. Arco di Claudio (51-52), sull'acqua Vergine dove passa la via Lata, «in ruins as early as the eighth century» (Platner e Ashby, Arcus Claudii); posizione da it.wikipedia
    (41,89932 N, 12,48110 E): l'acquedotto del modello, interpolato, passa una quarantina di metri più a nord. Arco di Portogallo, «close to the Ara Pacis», di età incerta, con rilievi di Adriano;
    demolito nel 1662 (Platner e Ashby, Arco di Portogallo); posizione da it.wikipedia (41,90310 N, 12,47960 E). Misure di entrambi indicative; i fornici guardano lungo la strada. */
 /* 27 novembre 2026: il gruppo «Archi della via Lata» è diviso in due voci, perché i due archi hanno storie diverse (voci Arcus Claudii e Arco di Portogallo di Platner e Ashby, lette
    per intero). Stessi punti, stesse misure, stesse zone di prima. L'arco di Claudio «seems to have been in ruins as early as the eighth century»: crollato dal 700 (anno scelto
    all'inizio del secolo). L'arco di Portogallo: i disegni del Cinque e Seicento mostrano «a single archway flanked on each side with two columns, and surrounded with a cornice»;
    l'età è incerta (Adriano, Marco Aurelio, o per Hülsen il IV o il V secolo): nel modello c'è già nel 235, scelta detta in scheda. Un lato fu demolito nel XII secolo, dopo il periodo. */
 {id:'arcoclaudio', nome:'Arco di Claudio', x:-34.81,z:-75.79, ry:.285, zone:[[0,0,.9]], fa:function(B){ arcoUno(B,1.4,.55,1.3,.6,.85,0,0,0,0,P.travertino);
    [1,-1].forEach(function(q){ B.scatola(.9,.3,.02,0,.95,q*.285,P.travertino); }); }},      // la lastra dell'iscrizione sulle due fronti (ne furono trovati pezzi: Platner e Ashby)
 {id:'arcoportogallo', nome:'Arco di Portogallo', x:-48,z:-117.8, ry:.285, zone:[[0,0,.8]], fa:function(B){      /* 8 m più a ovest del punto di it.wikipedia, sull'asse della via del Corso (24 novembre 2026): che l'arco scavalcasse la strada è il dato della fonte */
    arcoUno(B,1,.5,1.15,.45,.75,0,0,0,0,P.marmo);
    B.scatola(1.06,.06,.56,0,.86,0,P.marmo);                                                                                    // la cornice che gira tutt'attorno
    [1,-1].forEach(function(q){ [-.41,-.3,.3,.41].forEach(function(x){ B.scatola(.1,.12,.08,x,0,q*.28,P.marmo).colonne(x,q*.28,x,q*.28,1,.74,.035,.12); }); });      // due colonne per parte del fornice, sulle due fronti (forma dai disegni citati dalla fonte; misure schema)
 }},
 /* Archi alle teste dei ponti (27 novembre 2026, Platner e Ashby, voce Arcus, letta per intero). Arco di Graziano, Valentiniano e Teodosio: «built between 379 and 383 … as the
    monumental end of their Porticus Maximae. It stood close to the pons Ælius, and probably spanned its southern approach. It was destroyed in the fourteenth century»: qui dal 381
    (anno scelto fra il 379 e il 383) alla testa sud del ponte Elio, 8 m oltre il piede della rampa (RM.ponti in js/mura.js; come l'arco di Valentiniano al ponte Aurelio), sull'asse del ponte. Arco di Arcadio, Onorio e Teodosio: «a marble arch erected
    by the senate after the victory of Stilicho at Pollentia in 405 … It stood at the west end of the Pons Neronianus and probably spanned its approach … It was standing in the
    fifteenth century, but had been stripped of its marble facing»: dal 405 alla testa ovest del ponte Neroniano, sul suo asse. Il modello dà quel ponte in rovina dal 300 (js/mura.js,
    scelta più vecchia): l'arco del 405 lo contraddice, detto nella scheda. Di tutti e due la fonte non dà forma né misure: un fornice, misure come gli altri archi (schema, in scheda). */
 {id:'arcograziano', nome:'Arco di Graziano, Valentiniano e Teodosio', etichetta:'Arco di Graziano', x:-155.49,z:-94.14, ry:.06, zone:[[0,0,.8]], fa:function(B){ arcoUno(B,1.2,.5,1.25,.55,.8,0,0,0,0,P.marmo);
    B.scatola(1.26,.06,.56,0,.95,0,P.marmo); [1,-1].forEach(function(q){ B.scatola(.7,.2,.02,0,1.02,q*.255,P.travertino); }); }},
 {id:'arcoarcadio', nome:'Arco di Arcadio, Onorio e Teodosio', etichetta:'Arco di Arcadio', x:-183.14,z:-100.67, ry:.88, zone:[[0,0,.8]], fa:function(B){ arcoUno(B,1.2,.5,1.25,.55,.8,0,0,0,0,P.marmo);
    B.scatola(1.26,.06,.56,0,.95,0,P.marmo); [1,-1].forEach(function(q){ B.scatola(.7,.2,.02,0,1.02,q*.255,P.travertino); }); }},
 /* Arcus Novus sulla via Lata, per Diocleziano e Massimiano: «fu eretto nel 293» per i decennali e demolito nel 1491 (it.wikipedia «Arcus Novus», dove sta anche la posizione:
    41,89818 N, 12,48153 E). Misure indicative. */
 {id:'arcusnovus', nome:'Arcus Novus', x:-31.24,z:-63.12, ry:.285, zone:[[0,0,.8]], fa:function(B){ arcoUno(B,1.2,.5,1.3,.5,.8,0,0,0,0,P.marmo); }},
 /* Arco di Valentiniano e Valente alla testata del ponte Aurelio sulla riva del Campo Marzio (25 novembre 2026; src/testi/topografia-fonti.md, sezione 1): «rebuilding of arch and bridge
    by Valentinian I in 365-366» (Platner e Ashby, Pons Aurelius); l'iscrizione di Simmaco stava sul ponte e su un arco alla testata est (Taylor 2002); un arco trionfale «decorated the approach
    from the Campus Martius» e nel 1878 i suoi pezzi stavano nel fiume, con le statue di bronzo (Lanciani, Ruins and Excavations, pp. 25-26). Il punto è il piede della rampa del ponte del
    modello (RM.ponti in js/mura.js), sull'asse del ponte, coi ponteggi dal 365 come il ponte. Forma, misure, numero e posa delle statue sono generici (un fornice, tre figure di bronzo).
    Quando cadde nel fiume non si sa: qui resta in piedi fino all'852. Nessuna zona: il terreno e le case attorno non cambiano. */
 {id:'arcovalentiniano', nome:'Arco di Valentiniano', x:-110.9,z:-9.2, ry:-.797, fa:function(B){ arcoUno(B,1.3,.45,1.15,.55,.8,0,0,0,0,P.marmo);
    [-.42,0,.42].forEach(function(x){ uomo(B,x,1.15,0,1.4,P.bronzo,0); }); }},
 /* Alle pendici del Campidoglio, posizioni da OpenStreetMap. Carcere Mamertino (relazione 1849827): ancora prigione nel 368 (Platner e Ashby, Carcer); il corpo fuori terra è indicativo.
    Portico degli Dei Consenti (nodo 1448531164): piccolo colonnato rivolto al Foro, misure indicative. Insula dell'Aracoeli: caseggiato del II secolo addossato al colle, misure indicative.
    Sepolcro di Bibulo (way 124808519): la fronte, larga 6,4 m, guarda la via Flaminia; profondità e altezza indicative. */
 {id:'campidoglio', x:-15,z:-14, ry:0, zone:[[9.08,6.86,.6],[2.01,13.61,.6],[-9.86,-3.78,1],[-2.39,-16.39,.5]], fa:function(B){
    var X=-15, Z=-14;
    luogo(B,X,Z,-5.92,-7.14,1.484,.5,function(B){ B.scatola(1.1,.5,.9,0,-.1,0,P.tufo).vano(0,0,.46,1,0,.22,.3,true); });
    luogo(B,X,Z,-12.99,-.39,1.22,.5,function(B){ B.scatola(1,.6,.35,0,0,-.2,P.tufo).colonne(-.42,.12,.42,.12,6,.5,.035,.05).scatola(1,.06,.3,0,.55,.05,P.marmo); });
    luogo(B,X,Z,-24.86,-17.78,0,.8,function(B){ B.scatola(1.4,1.5,1.1,0,-.2,0,P.mattone).falde(1.5,.25,1.2,0,1.3,0,P.coppi,0,P.mattone);
      [.2,.55,.9].forEach(function(y){ B.aperture(-.6,.56,.6,.56,5,y,.18,.12); }); });
    luogo(B,X,Z,-17.39,-30.39,2.566,.4,function(B){ B.scatola(.64,.6,.5,0,0,0,P.travertino).vano(0,.1,.26,1,0,.16,.3,true); });
 }},
 {id:'leonine', nome:'Mura leonine', x:-215,z:-92, ry:0, zone:LEO.zone, fa:function(B){
    var y=suTerreno(-215,-92,0);
    LEO.passi.forEach(function(p,j){ var q=y(p.x,p.z); B.scatola(p.len+.15,1.35,.45,p.x,q-.3,p.z,P.tufo,p.ang); if(j%4===0) B.scatola(1,2.1,1,p.x,q-.3,p.z,P.tufo,p.ang).scatola(1.15,.12,1.15,p.x,q+1.8,p.z,P.mattone,p.ang); });
 }},
 /* Le mura serviane, due dei tratti che Platner e Ashby (Murus Servii Tullii) dicono ancora in vista: «(b) in the Piazza dei Cinquecento, opposite the station», che era «the retaining
    wall at the back of the agger», e «a fine piece of wall … in the depression between the greater and the lesser Aventine in the Via di Porta S. Paolo». Il tracciato di ciascuno è il
    contorno di OpenStreetMap (way 112675404, con Wikidata Q281330, e ways 120880574 e 120880575, «Mura Serviane», sull'Aventino), ridotto alla sua linea di mezzo. Grossi blocchi di tufo
    di Grotta Oscura in filari di circa 0,60 m (la fonte). Altezza, spessore e profilo della cresta: nessuna fonte letta; qui uno schema (fra 3 e 6 m, spessore 3 m), diverso per ogni
    tratto. Se fra il 235 e l'852 i due tratti fossero in vista o chiusi fra le case non lo dice nessuna fonte letta: nel modello sono ruderi in vista in tutti gli anni (scelta, detta
    nella scheda). Gli altri tratti della voce (via delle Finanze, scoperto nel 1907; Palatino, Campidoglio, palazzo Colonna) non ci sono, e l'aggere sull'Esquilino resta quello degli
    horti di Mecenate. Il disegno sta in muroServiano(), accanto a luogo(). */
 {id:'servianetermini', nome:'Mura serviane (tratto di Termini)', etichetta:'Mura serviane', x:135.9,z:-103.1, ry:0, zone:[[1.2,2.2,.8],[0,0,.8],[-1.3,-2.4,.8]], fa:function(B){
    muroServiano(B,135.9,-103.1,[[[137.96,-98.9],[133.8,-107.38]]],235,.42,.6);
 }},
 {id:'servianeaventino', nome:"Mura serviane (tratto dell'Aventino)", etichetta:'Mura serviane', x:-21.9,z:135.4, ry:0, zone:[[2.3,.7,.6],[-3.6,-.9,.6]], fa:function(B){
    muroServiano(B,-21.9,135.4,[[[-21.4,136.2],[-17.56,136.04]],[[-26.92,134.14],[-24.3,134.9]]],409,.3,.5);
 }},
 /* ---------- gli horti, i grandi giardini dei colli (26 novembre 2026; l'utente: «rendile anche più riconoscibili», e sugli horti «Mettici anche laghi fontane etc?») ----------
    Il cerchio di ciascuno è RM.HORTI (js/base.js): lì niente case, il prato e i pini (js/citta.js). Qui, per ciascuno, ciò che dice la sua voce di Platner e Ashby (LacusCurtius,
    lette il 26 novembre 2026; i passi in horti(), più sotto) e nient'altro: dove la voce non nomina edifici, solo il recinto, i viali e le aiuole, che sono uno schema.
    Acqua solo dove la voce la dà a quel giardino: un ninfeo e tre piscine nei Sallustiani, il ninfeo ottagonale negli horti degli Acilii. Laghi: nessuna voce letta. */
 {id:'hortisallustiani', nome:'Horti Sallustiani', x:RM.HORTI[0][0],z:RM.HORTI[0][1], ry:0, fa:function(B){ horti(B,0); }},
 {id:'casasallustio', x:RM.HORTI[0][0],z:RM.HORTI[0][1], ry:0, fa:function(B){ casaSallustio(B); }},      // la casa di Sallustio, a parte perché brucia nel 410 (Procopio III 2, 24) e il resto del giardino no; al clic apre la scheda degli horti
 {id:'hortiacilii', nome:'Horti degli Acilii', etichetta:'Horti Aciliorum', x:RM.HORTI[1][0],z:RM.HORTI[1][1], ry:0, fa:function(B){ horti(B,1); }},
 {id:'hortimaecenatis', nome:'Horti di Mecenate', x:RM.HORTI[2][0],z:RM.HORTI[2][1], ry:0, fa:function(B){ horti(B,2); }},
 {id:'hortilamiani', nome:'Horti Lamiani', x:RM.HORTI[3][0],z:RM.HORTI[3][1], ry:0, fa:function(B){ horti(B,3); }},
 {id:'hortilamianistatue', x:RM.HORTI[3][0],z:RM.HORTI[3][1], ry:0, fa:function(B){ statueLamiani(B); }},
 /* I riquadri bordati di siepe dei Lamiani e la siepe di cinta (27 novembre 2026, riserva 60): tenuti finché gli horti sono curati; dal 600, sessant'anni dopo l'abbandono del 537,
    non si vedono più sotto il bosco cresciuto. Che si perdessero allora è una scelta, detta nella scheda: nessuna fonte racconta la fine del giardino. */
 {id:'hortilamianiriquadri', x:RM.HORTI[3][0],z:RM.HORTI[3][1], ry:0, fa:function(B){ var H=RM.HORTI[3], a3=.5, W3=15, D3=10;
    parterre(B,H,H[0],H[1],W3,D3,a3,5,3); muroLinea(B,H,rett(H[0],H[1],W3+1.3,D3+1.3,a3),.22,P.chioma,.24); }},      // le statue dei Lamiani (27 novembre 2026), a parte perché si tolgono nel 537 e il giardino resta
 {id:'hortiliciniani', nome:'Horti Liciniani', x:RM.HORTI[4][0],z:RM.HORTI[4][1], ry:0, fa:function(B){ horti(B,4); }},
 {id:'hortiluculliani', nome:'Horti di Lucullo', x:RM.HORTI[5][0],z:RM.HORTI[5][1], ry:0, fa:function(B){ horti(B,5); }},
 {id:'hortispeiveteris', nome:'Horti Spei Veteris', x:RM.HORTI[6][0],z:RM.HORTI[6][1], ry:0, fa:function(B){ horti(B,6); }},
 {id:'horticaesaris', nome:'Horti di Cesare', x:RM.HORTI[7][0],z:RM.HORTI[7][1], ry:0, fa:function(B){ horti(B,7); }}
];

/* ---------- gli horti: come si costruiscono ----------
   Ogni pezzo sta sul suo terreno (luogo, piede) e lontano da strade, mura, fiume, monumenti e dagli altri pezzi (liberoH); se il posto voluto non è libero si cerca il più vicino
   (postoH). INGOMBRI_HORTI (RM.hortiIngombri) tiene lontani anche gli alberi di js/citta.js. ACQUE_HORTI: l'acqua, disegnata più sotto («l'acqua degli horti»).
   Misure, forme e posti dei pezzi sono una resa: nessuna voce letta dà una misura. Dove una voce dà un luogo (il ninfeo dei Sallustiani in fondo a via Sallustiana, il ninfeo
   degli Acilii sotto villa Medici) il pezzo sta lì o, se lì c'è altro nel modello, il più vicino possibile. */
var ACQUE_HORTI=[], INGOMBRI_HORTI=[]; RM.hortiIngombri=INGOMBRI_HORTI;
function liberoH(x,z,m,H){
  if(Math.hypot(x-H[0],z-H[1])>H[2]-m-.3) return false;
  if(RM.distStrade(x,z)<m+1.05 || RM.distFiume(x,z)<9.5 || RM.distLinea(x,z,RM.MURA,true)<m+.8) return false;
  var i, q; for(i=0;i<RM.zone.length;i++){ q=RM.zone[i]; if(RM.dZona(q,x,z)<q.r+(q.a?q.t||0:0)+m) return false; }
  for(i=0;i<INGOMBRI_HORTI.length;i++){ q=INGOMBRI_HORTI[i]; if(Math.hypot(x-q[0],z-q[1])<q[2]+m) return false; }
  return true; }
function postoH(x,z,m,H){ for(var k=0;k<500;k++){ var r=k*.1, a=k*2.4, px=x+r*Math.cos(a), pz=z+r*Math.sin(a); if(liberoH(px,pz,m,H)){ INGOMBRI_HORTI.push([px,pz,m]); return [px,pz]; } } return null; }
function hS(x,z){ return (RM.hSuolo||RM.h)(x,z); }
/* un padiglione: muri intonacati, tetto a due falde, a volte un colonnato davanti (verso +z locale) */
function padiglione(B,H,p,w,d,h,ry,colonnato){ luogo(B,H[0],H[1],p[0],p[1],ry,Math.max(w,d)/2,function(B){
  B.scatola(w,h+.25,d,0,-.25,0,P.intonaco).falde(w+.16,h*.3,d+.16,0,h,0,P.coppi,0,P.intonaco);
  if(colonnato){ B.scatola(w,.08,.5,0,-.2,d/2+.25,P.marmo).colonne(-w/2+.08,d/2+.42,w/2-.08,d/2+.42,Math.max(4,Math.round(w/.42)),h*.72,.045,-.12,P.marmo).scatola(w,.07,.56,0,h*.6-.12,d/2+.26,P.marmo); }
  [.25,.6].forEach(function(f){ if(h*f<h-.15) B.aperture(-w/2+.15,d/2+.005,w/2-.15,d/2+.005,Math.max(2,Math.round(w/.6)),h*f,.18,.1); }); }); }
/* un viale di ghiaia, largo w, lungo una fila di punti [x, z] del mondo, sul terreno disegnato; si salta dove non è libero */
function viale(B,H,pts,w){ var Y0=quota(H[0],H[1]), k, j;
  for(k=0;k<pts.length-1;k++) VIALI_H.push([pts[k][0],pts[k][1],pts[k+1][0],pts[k+1][1],w]);      // per tenere gli alberi fuori dai viali (pianta)
  for(k=0;k<pts.length-1;k++){ var a=pts[k], b=pts[k+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/.8));
    for(j=0;j<n;j++){ var x0=a[0]+(b[0]-a[0])*j/n, z0=a[1]+(b[1]-a[1])*j/n, x1=a[0]+(b[0]-a[0])*(j+1)/n, z1=a[1]+(b[1]-a[1])*(j+1)/n, nx=-(z1-z0)/(L/n)*w/2, nz=(x1-x0)/(L/n)*w/2;
      if(!liberoH(x0,z0,w/2,H) || !liberoH(x1,z1,w/2,H)) continue;
      function v(x,z){ return [x-H[0],hS(x,z)+.045-Y0,z-H[1]]; }
      B.quad(v(x0-nx,z0-nz),v(x1-nx,z1-nz),v(x1+nx,z1+nz),v(x0+nx,z0+nz),P.sabbia); } } }
/* il recinto: un muro di tufo alto un paio di metri sul giro del cerchio, interrotto dove passano strade o mura (lì il confine è un altro) */
function recinto(B,H){ var Y0=quota(H[0],H[1]), R=H[2]-.75, n=Math.ceil(6.283*R/1.3), k;
  for(k=0;k<n;k++){ var a0=k/n*6.283, a1=(k+1)/n*6.283, x0=H[0]+R*Math.cos(a0), z0=H[1]+R*Math.sin(a0), x1=H[0]+R*Math.cos(a1), z1=H[1]+R*Math.sin(a1);
    if(!liberoH(x0,z0,.2,H) || !liberoH(x1,z1,.2,H)) continue;
    var y=Math.min(hS(x0,z0),hS(x1,z1)); B.dentro((x0+x1)/2-H[0],y-Y0-.35,(z0+z1)/2-H[1],Math.atan2(-(z1-z0),x1-x0),function(B){ B.scatola(Math.hypot(x1-x0,z1-z0)+.06,.6+Math.abs(hS(x0,z0)-hS(x1,z1)),.08,0,0,0,P.tufo); }); } }
/* aiuole di prato rialzate, una per quarto, fra il viale ad anello e i due viali diritti: abbandonato il giardino, lì crescono gli arbusti (js/monumenti.js, «il verde sui ruderi») */
function aiuole(B,H,fi){ var Y0=quota(H[0],H[1]), R=H[2];
  [0,1,2,3].forEach(function(q){ var a=fi+Math.PI/4+q*Math.PI/2, r=R*.36, x=H[0]+r*Math.cos(a), z=H[1]+r*Math.sin(a), w=R*.2, d=R*.13;
    if(!liberoH(x,z,Math.hypot(w,d)/2+.1,H)) return;
    B.dentro(x-H[0],hS(x,z)-Y0-.12,z-H[1],-a,function(B){ B.scatola(w,.17,d,0,0,0,P.prato).scatola(w+.1,.12,.05,0,0,d/2+.03,P.chioma).scatola(w+.1,.12,.05,0,0,-d/2-.03,P.chioma); }); }); }
/* il ninfeo: una parete con tre nicchie e la vasca davanti; l'acqua cade dalle nicchie (cascata) nella vasca (specchio). Forma ignota: uno schema */
function ninfeo(B,H,p,ry,k){ var w=2.2, y0=piede(p[0],p[1],1.2)-.05;
  luogo(B,H[0],H[1],p[0],p[1],ry,1.2,function(B){
    B.scatola(w,1.25,.35,0,-.2,-.5,P.mattone).scatola(w+.1,.08,.42,0,1.05,-.5,P.marmo);
    [-.7,0,.7].forEach(function(x){ B.vano(x,.25,-.32,1,0,x?.32:.46,x?.6:.75); });
    B.scatola(w,.1,1.1,0,-.05,.25,P.marmo).scatola(w,.22,.08,0,-.05,.8,P.marmo).scatola(.08,.22,1.1,-w/2+.04,-.05,.25,P.marmo).scatola(.08,.22,1.1,w/2-.04,-.05,.25,P.marmo); });
  var c=Math.cos(ry), s=Math.sin(ry);
  function mondo(lx,lz){ return [p[0]+lx*c+lz*s, p[1]-lx*s+lz*c]; }
  [-.7,0,.7].forEach(function(x){ var q=mondo(x,-.31); var hc=(x?.6:.75)+.13; ACQUE_HORTI.push({tipo:'cascata', x:q[0], y:y0+.12+hc/2, z:q[1], w:x?.26:.38, h:hc, ry:ry, k:k}); });
  var v=mondo(0,.25); ACQUE_HORTI.push({tipo:'specchio', x:v[0], y:y0+.12, z:v[1], w:w-.16, d:1.0, ry:ry, k:k}); }
/* una piscina rettangolare col bordo di marmo; fino al 537 piena d'acqua */
function piscina(B,H,p,w,d,ry,k){ var y0=piede(p[0],p[1],Math.max(w,d)/2)-.05;
  luogo(B,H[0],H[1],p[0],p[1],ry,Math.max(w,d)/2,function(B){
    B.scatola(w,.08,d,0,-.1,0,P.selce).scatola(w+.12,.24,.06,0,-.1,d/2+.03,P.marmo).scatola(w+.12,.24,.06,0,-.1,-d/2-.03,P.marmo).scatola(.06,.24,d,w/2+.03,-.1,0,P.marmo).scatola(.06,.24,d,-w/2-.03,-.1,0,P.marmo); });
  ACQUE_HORTI.push({tipo:'specchio', x:p[0], y:y0+.06, z:p[1], w:w, d:d, ry:ry, k:k}); }
/* ---------- gli horti, uno per uno (27 novembre 2026) ----------
   Fino al 26 novembre tutti gli horti avevano lo stesso disegno (muro sul giro del cerchio, viale ad anello, croce di viali, quattro aiuole, pini e lecci a caso): «troppo con
   lo stampino». Ora ognuno ha il suo, da ciò che dice la sua voce di Platner e Ashby (letta di nuovo il 27 novembre 2026; passi e tabella in src/testi/topografia-fonti.md,
   «Gli horti, uno per uno»): la forma del terreno, i pezzi noti, i confini. Nessuna voce letta descrive viali, siepi o alberi: dove la fonte tace il disegno è uno schema,
   diverso da giardino a giardino, e la scheda lo dice. Gli alberi li mette qui ogni giardino (PIANTE_HORTI, RM.hortiPiante) e li pianta js/citta.js; specie: 0 cipresso,
   1 pino, 2 ulivo, 3 leccio, 4 pioppo bianco, 5 fico, 6 olmo (scelte del modello). */
var VIALI_H=[], PIANTE_HORTI=[]; RM.hortiPiante=PIANTE_HORTI;
function dSeg(x,z,s){ var dx=s[2]-s[0], dz=s[3]-s[1], L=dx*dx+dz*dz, t=L?Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/L)):0; return Math.hypot(x-s[0]-t*dx,z-s[1]-t*dz); }
function pianta(k,H,x,z,sp,s){ if(Math.hypot(x-H[0],z-H[1])>H[2]-.7 || !liberoH(x,z,.3,H)) return;
  for(var i=0;i<VIALI_H.length;i++) if(dSeg(x,z,VIALI_H[i])<VIALI_H[i][4]/2+.3) return;
  PIANTE_HORTI.push({k:k,x:x,z:z,sp:sp,s:s||1}); }
/* un filare lungo una fila di punti: lato 0, una fila sola sulla linea; altrimenti due file, a destra e a sinistra */
function filare(k,H,pts,passo,lato,sp,s){ for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/passo)), nx=-(b[1]-a[1])/L, nz=(b[0]-a[0])/L;
  for(var j=0;j<n;j++){ var t=(j+.5)/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t; if(!lato) pianta(k,H,x,z,sp,s); else { pianta(k,H,x+nx*lato,z+nz*lato,sp,s); pianta(k,H,x-nx*lato,z-nz*lato,sp,s); } } } }
/* un gruppo d'alberi in un cerchio, con le specie date (numeri a caso da un seme fisso del giardino) */
function boschetto(k,H,cx,cz,r,n,specie,seme){ var rnd=RM.casuale(seme); for(var i=0;i<n;i++){ var a=rnd()*6.283, d=Math.sqrt(rnd())*r, sp=specie[Math.floor(rnd()*specie.length)], s=.8+rnd()*.5; pianta(k,H,cx+d*Math.cos(a),cz+d*Math.sin(a),sp,s); } }
/* un rettangolo come fila chiusa di punti del mondo, girato di a (come globale()) */
function rett(cx,cz,w,d,a){ var c=Math.cos(a), s=Math.sin(a); return [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(function(p){ var lx=p[0]*w/2, lz=p[1]*d/2; return [cx+lx*c+lz*s, cz-lx*s+lz*c]; }); }
function inMondo(cx,cz,a,lx,lz){ var c=Math.cos(a), s=Math.sin(a); return [cx+lx*c+lz*s, cz-lx*s+lz*c]; }
/* un muro (o una siepe: colore P.chioma, più spessa) lungo una fila di punti, sul terreno; si salta dove non è libero */
function muroLinea(B,H,pts,h,col,sp){ var Y0=quota(H[0],H[1]);
  for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/1.3));
    for(var j=0;j<n;j++) (function(x0,z0,x1,z1){ if(!liberoH(x0,z0,sp/2+.1,H) || !liberoH(x1,z1,sp/2+.1,H)) return; var y=Math.min(hS(x0,z0),hS(x1,z1));
      B.dentro((x0+x1)/2-H[0],y-Y0-.35,(z0+z1)/2-H[1],Math.atan2(-(z1-z0),x1-x0),function(B){ B.scatola(Math.hypot(x1-x0,z1-z0)+.04,h+.35+Math.abs(hS(x0,z0)-hS(x1,z1)),sp,0,0,0,col); }); })(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n,a[0]+(b[0]-a[0])*(j+1)/n,a[1]+(b[1]-a[1])*(j+1)/n); } }
/* un muro di terrazza: regge il terreno a monte (alto quanto serve per arrivare a «su» sopra il punto più basso) con un parapetto; lungo una fila di punti */
function terrazza(B,H,pts,su,col){ var Y0=quota(H[0],H[1]);
  for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/1.1));
    for(var j=0;j<n;j++) (function(x0,z0,x1,z1){ if(!liberoH(x0,z0,.2,H) || !liberoH(x1,z1,.2,H)) return; var y=Math.min(hS(x0,z0),hS(x1,z1));
      B.dentro((x0+x1)/2-H[0],y-Y0-.3,(z0+z1)/2-H[1],Math.atan2(-(z1-z0),x1-x0),function(B){ var l=Math.hypot(x1-x0,z1-z0)+.04; B.scatola(l,su+.3,.16,0,0,0,col).scatola(l,.06,.2,0,su+.3,0,P.travertino); }); })(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n,a[0]+(b[0]-a[0])*(j+1)/n,a[1]+(b[1]-a[1])*(j+1)/n); } }
/* statue su un piedistallo, in punti [x, z, rotazione] del mondo */
function statueH(B,H,pts,col){ var Y0=quota(H[0],H[1]); pts.forEach(function(p){ if(!liberoH(p[0],p[1],.12,H)) return; var y=hS(p[0],p[1])-Y0;
  B.scatola(.13,.17,.13,p[0]-H[0],y-.05,p[1]-H[1],P.marmo); uomo(B,p[0]-H[0],y+.12,p[1]-H[1],1.3,col||P.marmo,p[2]||0); }); }
/* aiuole rettangolari basse (prato rialzato bordato di bosso, schema), in un rettangolo cx, cz, w, d girato di a, divise in nx per nz riquadri */
function parterre(B,H,cx,cz,w,d,a,nx,nz){ var Y0=quota(H[0],H[1]), i, j, pw=w/nx, pd=d/nz;
  for(i=0;i<nx;i++) for(j=0;j<nz;j++){ var lx=-w/2+pw*(i+.5), lz=-d/2+pd*(j+.5), p=inMondo(cx,cz,a,lx,lz); if(!liberoH(p[0],p[1],Math.hypot(pw,pd)/2-.15,H)) continue;
    B.dentro(p[0]-H[0],hS(p[0],p[1])-Y0-.1,p[1]-H[1],a,function(B){ B.scatola(pw-.45,.13,pd-.45,0,0,0,P.prato).scatola(pw-.4,.1,.05,0,.02,(pd-.4)/2,P.chioma).scatola(pw-.4,.1,.05,0,.02,-(pd-.4)/2,P.chioma).scatola(.05,.1,pd-.4,(pw-.4)/2,.02,0,P.chioma).scatola(.05,.1,pd-.4,-(pw-.4)/2,.02,0,P.chioma); }); } }
var CASA_SALL=null, STATUE_LAMIA=[];
function statueLamiani(B){ statueH(B,RM.HORTI[3],STATUE_LAMIA,P.marmo); }      // a parte: le statue si tolgono nel 537 (js/dati.js), il giardino resta
function casaSallustio(B){ var H=RM.HORTI[0], p=CASA_SALL; if(!p) return; var c3=Math.cos(.3), s3=Math.sin(.3);      // un corpo col colonnato e un'ala dietro; forma e misure ignote
  padiglione(B,H,p,4.6,2.6,1.15,.3,true);
  luogo(B,H[0],H[1],p[0]-1.9*s3,p[1]-1.9*c3,.3,1.6,function(B){ B.scatola(2.6,1.6,1.4,0,-.25,0,P.intonaco).falde(2.7,.4,1.5,0,1.35,0,P.coppi,0,P.intonaco); B.aperture(-1.1,.705,1.1,.705,4,.5,.25,.14); }); }
function horti(B,k){
  var H=RM.HORTI[k], R=H[2], fi=[.35,.1,.6,.2,.9,.4,.7,0][k], p;
  if(k===0){
    /* Horti Sallustiani (Platner e Ashby, «Horti Sallustiani»): nella regione VI, fra Quirinale e Pincio; un «hippodromus» nella valle, «with walls and terraces up the Quirinal
       slope»; un tempio di Venere, noto solo dalle iscrizioni; tre piscine; un ninfeo, l'unico resto visibile, «at the end of the via Sallustiana», accanto a un edificio di quattro
       piani (Rivoira: età di Vespasiano); un «palatium» negli Atti dei martiri; l'obelisco (voce a sé, obeliscosallustiano). Ancora un luogo di soggiorno nel IV secolo;
       nel 410 i Goti bruciano «the house of Sallust», che «has stood half-burned up to my time» (Procopio III 2, 24). Il portico Miliarense di Aureliano è solo nella Storia
       Augusta (Domaszewski: un'invenzione): non c'è. Il ninfeo sta su piazza Sallustio (RM.ll 41,9071 N, 12,4954 E, posto moderno del resto); l'ippodromo lungo la valle,
       verso la porta Salaria; palazzo, tempio e piscine dove c'è posto. */
    var asse=.78, v=RM.ll(41.9071,12.4954), vx=v.x!=null?v.x:v[0], vz=v.z!=null?v.z:v[1];
    if((p=postoH(vx,vz,1.3,H))) ninfeo(B,H,p,-2.2,k);      // la fronte verso la valle e il palazzo
    if((p=postoH(vx+3.6,vz+1.6,1.1,H))) luogo(B,H[0],H[1],p[0],p[1],.9,1,function(B){ B.scatola(2.1,2.1,1.5,0,-.3,0,P.mattone).falde(2.2,.35,1.6,0,1.8,0,P.coppi,0,P.mattone);      // l'edificio di quattro piani accanto al ninfeo
      [.15,.6,1.05,1.45].forEach(function(y){ B.aperture(-.9,.755,.9,.755,5,y,.24,.13).aperture(.9,-.755,-.9,-.755,5,y,.24,.13); }); });
    CASA_SALL=postoH(76,-172,2.7,H);      // il palatium, la casa di Sallustio: la costruisce casaSallustio, voce a sé
    /* l'ippodromo, un giardino a forma di circo: lungo 80 m e largo 22 (misure ignote), una testata tonda, la pista di sabbia e nel mezzo un'aiuola lunga; muretto e colonnato sul lato del colle */
    for(var t=0, ip=null; t<60 && !ip; t++){ var cx=vx-5.5-.35*t*Math.cos(asse)+(t%3-1)*.6, cz=vz+3+.35*t*Math.sin(asse)+(t%2)*.5, ok=true;
      for(var u=-4.2;u<=4.2&&ok;u+=.7) for(var w2=-1.2;w2<=1.2&&ok;w2+=.6) ok=liberoH(cx+u*Math.cos(asse)+w2*Math.sin(asse),cz-u*Math.sin(asse)+w2*Math.cos(asse),.25,H);
      if(ok) ip=[cx,cz]; }
    if(ip){ for(var u2=-4;u2<=4;u2+=1) INGOMBRI_HORTI.push([ip[0]+u2*Math.cos(asse),ip[1]-u2*Math.sin(asse),1.3]);
      var hy=suTerreno(ip[0],ip[1],asse), ql=quota(ip[0],ip[1])-quota(H[0],H[1]);
      B.dentro(ip[0]-H[0],0,ip[1]-H[1],asse,function(B){ var L=8, W=2.2, k2, n=18;
        for(k2=0;k2<n;k2++){ var x=-L/2+1.1+(L-2.2)*k2/(n-1), y=hy(x,0)+ql; B.scatola((L-2.2)/(n-1)+.02,.14,W-.3,x,y-.1,0,P.sabbia).scatola((L-2.2)/(n-1)+.02,.2,.5,x,y-.1,0,P.prato);      // pista e aiuola nel mezzo
          B.scatola((L-2.2)/(n-1)+.03,.45,.1,x,y-.3,W/2,P.tufo).scatola((L-2.2)/(n-1)+.03,.45,.1,x,y-.3,-W/2,P.tufo); }
        var ye=hy(L/2-1.1,0)+ql; for(k2=0;k2<10;k2++){ var a0=-PI/2+PI*k2/10, a1=-PI/2+PI*(k2+1)/10, r=W/2;      // la testata tonda
          B.dentro(L/2-1.1+r*Math.cos((a0+a1)/2),ye-.3,r*Math.sin((a0+a1)/2),-(a0+a1)/2+PI/2,function(B){ B.scatola(r*(a1-a0)+.04,.45,.1,0,0,0,P.tufo); }); }
        var yc=hy(0,-W/2-.35)+ql; B.colonne(-L/2+1.3,-W/2-.3,L/2-1.6,-W/2-.3,14,.42,.035,yc,P.marmo); B.scatola(L-2.8,.06,.4,-.15,yc+.42,-W/2-.3,P.marmo); }); }
    if((p=postoH(70,-178,1.4,H))) luogo(B,H[0],H[1],p[0],p[1],-.4,1.3,function(B){ B.tempio(1.1,1.8,.85,0,0,0,{fronte:4,podio:.3}); });      // il tempio di Venere: forma ignota
    [[72,-160],[75.5,-157.6],[79,-155.2]].forEach(function(q){ if((p=postoH(q[0],q[1],1.05,H))) piscina(B,H,p,1.7,.85,asse,k); });      // le tre piscine: posto e misura ignoti
    /* 27 novembre 2026: le terrazze sul pendio del Quirinale («walls and terraces extending up the slope of the latter hill»), a sud-est della valle, parallele all'ippodromo,
       ognuna col suo viale. Nel modello il terreno qui sale appena (un dislivello di una decina di metri), più piano del vero: i muri sono disegnati come se la valle ci fosse.
       Numero, altezza e distanza delle terrazze sono uno schema; i cipressi lungo la valle e i pini sulle terrazze una scelta. */
    var o=ip||[vx-5.5,vz+3], ax=[Math.cos(asse),-Math.sin(asse)], az=[Math.sin(asse),Math.cos(asse)];
    function corda(d,m){ var cx=o[0]+az[0]*d-H[0], cz=o[1]+az[1]*d-H[1], b=cx*ax[0]+cz*ax[1], c=cx*cx+cz*cz-(R-m)*(R-m), D=b*b-c; if(D<=0) return null; var t0=-b-Math.sqrt(D), t1=-b+Math.sqrt(D), q=[];
      for(var t=t0;t<=t1+.01;t+=(t1-t0)/8) q.push([H[0]+cx+ax[0]*t,H[1]+cz+ax[1]*t]); return q; }
    [3.4,6,8.6,11.2].forEach(function(d,i){ var c=corda(d,1.2), cv=corda(d+.9,1.4), ca=corda(d+2,1.6); if(c) terrazza(B,H,c,.45+.08*i,P.tufo); if(cv) viale(B,H,cv,.34); if(ca && i%2===0) filare(k,H,ca,2.6,0,1,1.1); });
    var cl=corda(-2.6,1.5); if(cl){ viale(B,H,cl,.4); filare(k,H,cl,.75,.5,0,1.15); }      // il viale lungo la valle, sul lato del Pincio, coi cipressi
    boschetto(k,H,H[0]-az[0]*9,H[1]-az[1]*9,6,26,[1,1,3],901);      // verso il Pincio, pini e lecci
  } else if(k===1){
    /* Horti degli Acilii (Platner e Ashby, «Horti Aciliorum»): sul Pincio, chiusi a nord, ovest ed est da muri di sostegno lungo il pendio, «lofty arcades with massive intervening
       piers» in opera reticolata; a est e a nord Aureliano li prese nelle mura (il Muro Torto). A nord della Trinità un grande emiciclo aperto a ovest con rampe di scale verso
       la pianura; sotto il casino moderno una cisterna (sotto terra: non si vede); sotto il monte di villa Medici un ninfeo ottagonale detto Parnaso. Degli Acilii Glabrioni nel
       II secolo, nel IV dei Pincii, poi di Anicia Faltonia Proba e Petronio Probo, poi dell'imperatore. Qui: le arcate dove il terreno scende verso il Campo Marzio, l'emiciclo
       sul ciglio verso la Trinità, il ninfeo verso villa Medici (nel modello il cerchio del giardino sta un poco a nord dei luoghi veri: i pezzi vanno al bordo più vicino). */
    var Y0=quota(H[0],H[1]), n=56, a, prima=null;
    for(var j=0;j<n;j++){ a=j/n*6.283; var ri=R-2.4, ro=R-.5, xi=H[0]+ri*Math.cos(a), zi=H[1]+ri*Math.sin(a), xo=H[0]+ro*Math.cos(a), zo=H[1]+ro*Math.sin(a), xm=H[0]+(R-1.3)*Math.cos(a), zm=H[1]+(R-1.3)*Math.sin(a);
      var cad=hS(xi,zi)-hS(xo,zo); if(cad<.7 || !liberoH(xm,zm,.4,H)) continue;
      var len=(R-1.3)*6.283/n+.05, hgt=cad+.45, yb=hS(xo,zo)-Y0-.25;
      B.dentro(xm-H[0],yb,zm-H[1],-a-PI/2,function(B){ arcato(B,len,hgt,.4,0,0,0,P.tufo,hgt>1.3?2:1,2); }); }
    var tr=RM.ll(41.9060,12.4832), tx=tr.x!=null?tr.x:tr[0], tz=tr.z!=null?tr.z:tr[1], dl=Math.hypot(tx-H[0],tz-H[1]);
    var em=null; if((p=em=postoH(H[0]+(tx-H[0])/dl*(R-3.2),H[1]+(tz-H[1])/dl*(R-3.2),1.6,H))) luogo(B,H[0],H[1],p[0],p[1],-PI/2,1.4,function(B){      // l'emiciclo, aperto a ovest (verso +z locale), con le rampe
      var arc=[]; for(var q=0;q<=12;q++){ var t2=PI*q/12; arc.push([1.3*Math.cos(t2),-1.3*Math.sin(t2)]); }
      B.striscia(arc,-.2,arc,.6,P.tufo,false).striscia(arc,.6,arc.map(function(c){ return [c[0]*.88,c[1]*.88]; }),.6,P.marmo,false);
      for(var g=0;g<4;g++) B.scatola(2.4-g*.2,.42-g*.12,.32,0,-.3,.25+g*.32,P.travertino); });
    var vm=RM.ll(41.9087,12.4826), mx=vm.x!=null?vm.x:vm[0], mz=vm.z!=null?vm.z:vm[1];
    if((p=postoH(mx,mz,1.1,H))){ var y8=piede(p[0],p[1],1)-.05;      // il ninfeo ottagonale, Parnaso: forma ignota oltre la pianta; qui un recinto a otto lati con la vasca
      luogo(B,H[0],H[1],p[0],p[1],PI/8,1,function(B){ var o=[], o2=[]; for(var q=0;q<8;q++){ var t3=q*PI/4; o.push([.95*Math.cos(t3),.95*Math.sin(t3)]); o2.push([.8*Math.cos(t3),.8*Math.sin(t3)]); }
        B.striscia(o,-.2,o,.75,P.mattone).striscia(o2,-.2,o2,.75,P.mattone).striscia(o,.75,o2,.75,P.marmo).cilindro(.72,.1,0,-.05,0,P.selce,.72,8).cilindro(.12,.45,0,0,0,P.marmo,.08,8);
        for(var q2=0;q2<8;q2+=2){ var t4=(q2+.5)*PI/4; B.vano(.9*Math.cos(t4),.1,.9*Math.sin(t4),-Math.sin(t4),Math.cos(t4),.3,.5); } });
      ACQUE_HORTI.push({tipo:'vasca', x:p[0], y:y8+.1, z:p[1], r:.7, lati:8, ry:PI/8, k:k}); }
    /* 27 novembre 2026: i ruderi stanno «all along the brow of the hill»; qui un viale che segue il ciglio del pianoro, 25 m dentro il punto dove il terreno comincia a
       scendere, e un viale diritto dall'emiciclo verso est. Sul pianoro lecci a gruppi, sul ciglio cipressi radi: viali e alberi sono uno schema e una scelta. */
    var hc=hS(H[0],H[1]), giro=[], pezzi=[];
    for(var q5=0;q5<=60;q5++){ var a5=q5/60*6.283, r5=null; for(var rr=2;rr<R-.8;rr+=.35){ if(hS(H[0]+rr*Math.cos(a5),H[1]+rr*Math.sin(a5))<hc-.4){ r5=rr; break; } }
      if(r5!==null && r5>4.5){ giro.push([H[0]+(r5-2.5)*Math.cos(a5),H[1]+(r5-2.5)*Math.sin(a5)]); } else if(giro.length){ pezzi.push(giro); giro=[]; } }
    if(giro.length) pezzi.push(giro);
    pezzi.forEach(function(g){ if(g.length<3) return; viale(B,H,g,.34); filare(k,H,g,2.2,-.55,0,1); });
    if(em){ var ve=[[em[0]+1.6,em[1]],[em[0]+R*.9,em[1]+1]]; viale(B,H,ve,.4); filare(k,H,ve,1.3,.55,1,1.1); }
    boschetto(k,H,H[0]+4,H[1]-3,5,26,[3,3,3,1],911); boschetto(k,H,H[0]-3,H[1]+5,4,16,[3,3,1],912);
  } else if(k===2){
    /* Horti di Mecenate (Platner e Ashby, «Horti Maecenatis»): sull'Esquilino, sull'aggere serviano e sulla necropoli vicina; la «turris Maecenatiana» da cui Nerone guardò
       l'incendio, forse la mole «propinquam nubibus arduis» di Orazio; imperiali dopo Mecenate. Il primo bagno caldo di Roma, che Cassio Dione dà a Mecenate, «may have been»
       nei giardini: incerto, non c'è. L'Auditorium (aula absidata, «may have been a sort of conservatory») è nel gruppo esquilino. Qui la torre: alta 30 m, misura ignota. */
    if((p=postoH(H[0]+2,H[1]+3,.9,H))) luogo(B,H[0],H[1],p[0],p[1],.2,.8,function(B){ B.scatola(1.1,3.2,1.1,0,-.3,0,P.mattone).scatola(1.25,.1,1.25,0,2.9,0,P.travertino).cono(.88,.5,0,3,0,P.coppi,4);
      [.6,1.3,2,2.55].forEach(function(y){ B.aperture(-.4,.555,.4,.555,2,y,.22,.12).aperture(.4,-.555,-.4,-.555,2,y,.22,.12); }); });
    /* 27 novembre 2026: la passeggiata. I giardini nascono «on the Servian agger and the adjacent necropolis, thus transforming this unsavoury region into a beautiful
       promenade» (Platner e Ashby, da Orazio, Satire I 8, 14); la Sovrintendenza: Mecenate bonificò il sepolcreto e riempì il fossato davanti alle mura. Nel modello il giardino
       sta a sud della porta Esquilina (arco di Gallieno), dove la linea delle mura serviane passa sotto l'Auditorium: la passeggiata corre in cima a quella linea, su un
       terrapieno erboso alto tre metri, dalla porta all'Auditorium. Larghezza, altezza e alberi sono uno schema; i pini sulla passeggiata e i cipressi sparsi una scelta. */
    var Y2=quota(H[0],H[1]), ag=[[133.05,-33.6],[133.0,-26],[132.9,-19.2]];
    for(var s2=0;s2<ag.length-1;s2++){ var a2=ag[s2], b2=ag[s2+1], L2=Math.hypot(b2[0]-a2[0],b2[1]-a2[1]), n2=Math.ceil(L2/.9);
      for(var j2=0;j2<n2;j2++){ var x2=a2[0]+(b2[0]-a2[0])*(j2+.5)/n2, z2=a2[1]+(b2[1]-a2[1])*(j2+.5)/n2; if(!liberoH(x2,z2,.55,H)) continue;
        B.dentro(x2-H[0],hS(x2,z2)-Y2-.2,z2-H[1],Math.atan2(-(b2[1]-a2[1]),b2[0]-a2[0]),function(B){ B.scatola(L2/n2+.03,.5,1.25,0,0,0,P.prato).scatola(L2/n2+.03,.03,.42,0,.5,0,P.sabbia).scatola(L2/n2+.03,.36,.12,0,.05,.68,P.prato).scatola(L2/n2+.03,.36,.12,0,.05,-.68,P.prato); }); } }
    ag.forEach(function(q){ INGOMBRI_HORTI.push([q[0],q[1],.8]); });
    filare(k,H,ag,2.3,1.05,1,1.15);
    var tor=INGOMBRI_HORTI.filter(function(q){ return Math.abs(q[0]-H[0]-2)<3 && Math.abs(q[1]-H[1]-3)<3 && q[2]===.9; })[0];
    if(tor){ var vt=[[133.9,(tor[1]+ag[1][1])/2],[tor[0]-.7,tor[1]]]; viale(B,H,vt,.3); }
    boschetto(k,H,H[0]+6,H[1]-4,4.5,14,[1,0,1],921); boschetto(k,H,H[0]+5,H[1]+7,3.5,9,[0,1],922);
  } else if(k===3){
    /* Horti Lamiani (Platner e Ashby, «Horti Lamiani»): poco a sud-est di piazza Vittorio, «numerous works of art and a few structural remains»; di L. Elio Lamia, poi di Tiberio
       e degli imperatori; vi fu deposto per un tempo il corpo di Caligola. Nessun edificio descritto: un padiglione col colonnato, come segno dei resti, forma ignota. */
    if((p=postoH(H[0],H[1],1.6,H))) padiglione(B,H,p,2.6,1.6,.8,.5,true);
    /* 27 novembre 2026: il luogo dei Lamiani si riconosce dalle «numerous works of art» trovate lì. Qui un giardino in piano, a riquadri bordati di siepe, chiuso da una
       siepe con i cipressi, e le statue sugli incroci dei viali (a parte, hortilamianistatue: si tolgono nel 537). La forma a riquadri, la siepe, il numero e il posto delle
       statue sono uno schema: la fonte dice solo che lì si trovarono molte opere d'arte. */
    var a3=.5, W3=15, D3=10, nx3=5, nz3=3, i3, j3;      // i riquadri bordati di siepe e la siepe di cinta stanno in hortilamianiriquadri (27 novembre 2026): si perdono dopo l'abbandono
    for(i3=0;i3<=nx3;i3++) viale(B,H,[inMondo(H[0],H[1],a3,-W3/2+W3*i3/nx3,-D3/2-.3),inMondo(H[0],H[1],a3,-W3/2+W3*i3/nx3,D3/2+.3)],.3);
    for(j3=0;j3<=nz3;j3++) viale(B,H,[inMondo(H[0],H[1],a3,-W3/2-.3,-D3/2+D3*j3/nz3),inMondo(H[0],H[1],a3,W3/2+.3,-D3/2+D3*j3/nz3)],.3);
    for(i3=0;i3<=nx3;i3++) for(j3=0;j3<=nz3;j3++){ var s3=inMondo(H[0],H[1],a3,-W3/2+W3*i3/nx3,-D3/2+D3*j3/nz3); if(liberoH(s3[0],s3[1],.15,H)) STATUE_LAMIA.push([s3[0],s3[1],a3+(i3<nx3/2?PI/2:-PI/2)]); }
    filare(k,H,rett(H[0],H[1],W3+2.6,D3+2.6,a3),1.1,0,0,1);
    boschetto(k,H,H[0]+inMondo(0,0,a3,0,7.8)[0],H[1]+inMondo(0,0,a3,0,7.8)[1],2.5,6,[3],931); boschetto(k,H,H[0]-inMondo(0,0,a3,0,7.8)[0],H[1]-inMondo(0,0,a3,0,7.8)[1],2.5,6,[3],932);
  } else if(k===5){
    /* Horti di Lucullo (Platner e Ashby, «Horti Luculliani»): sopra il punto dove l'acqua Vergine esce dal colle, presso Capo le Case; di Lucullo verso il 60 a.C., poi di Valerio
       Asiatico, poi di Messalina, che vi fu uccisa; «among the richest of the imperial properties»; «these horti were very beautiful», e una sala si chiamava Apollo.
       Qui la sala, forma ignota. Nel modello il cerchio del giardino sta più a nord-est del luogo vero. */
    /* 27 novembre 2026: sul pendio occidentale del Pincio (a ovest il confine stava «on the slope of the hill above the Due Macelli», a est la strada della porta Salutare).
       La sala in alto, rivolta a ovest verso il Campo Marzio, e da lì un lungo viale diritto che scende il pendio fra due file di cipressi; un muro sul lato della strada.
       La fonte dà solo il nome della sala, Apollo: posto, forma e orientamento della sala, viale, cipressi e muro sono uno schema; i pini a gruppi una scelta. */
    var p5=postoH(H[0]+4.2,H[1]-.5,1.8,H);
    if(p5){ padiglione(B,H,p5,3,1.8,1,-PI/2,true);
      var asse5=[[p5[0]-1.5,p5[1]],[H[0]-R+.8,p5[1]+.6]]; viale(B,H,asse5,.5); filare(k,H,asse5,1,.75,0,1.15);
      var bel=[[p5[0]-1.9,p5[1]-R*.55],[p5[0]-1.9,p5[1]+R*.55]]; viale(B,H,bel,.3); }
    muroLinea(B,H,[[H[0]+R*.62,H[1]-R*.72],[H[0]+R*.84,H[1]-R*.35],[H[0]+R*.9,H[1]],[H[0]+R*.84,H[1]+R*.35],[H[0]+R*.62,H[1]+R*.72]],.4,P.tufo,.1);
    boschetto(k,H,H[0]-2,H[1]-7,4,14,[1,1,3],951); boschetto(k,H,H[0]-2,H[1]+7,4,14,[1,1,3],952);
  } else if(k===4){
    /* Horti Liciniani: luogo ignoto; nel modello attorno al ninfeo di Minerva Medica, che alcuni attribuiscono a questi horti «without adequate reason» (Platner e Ashby,
       Nymphaeum 2). 27 novembre 2026: la sala decagona in alto, un viale largo che scende il pendio verso sud-est e, ai lati, un uliveto a quinconce; muro di mattoni sul giro
       in alto. Tutto è uno schema: la fonte non dice nulla del giardino. Gli ulivi una scelta. */
    var mm=[220.27,-16.27], d4=[.62,.78], perp=[-d4[1],d4[0]];
    var ax4=[[mm[0]+d4[0]*2.4,mm[1]+d4[1]*2.4],[mm[0]+d4[0]*20,mm[1]+d4[1]*20]]; viale(B,H,ax4,.55); filare(k,H,ax4,1.2,.75,1,1.1);
    [-1,1].forEach(function(q){ for(var u4=1;u4<9;u4++) for(var w4=1;w4<6;w4++){ var x4=H[0]+d4[0]*(u4*1.35-4)+perp[0]*q*(w4*1.35+.35*(u4%2)), z4=H[1]+d4[1]*(u4*1.35-4)+perp[1]*q*(w4*1.35+.35*(u4%2)); pianta(k,H,x4,z4,2,.95); } });
    muroLinea(B,H,(function(){ var g=[]; for(var q=0;q<=14;q++){ var a=Math.atan2(-d4[1],-d4[0])-1.3+2.6*q/14; g.push([H[0]+(R-.9)*Math.cos(a),H[1]+(R-.9)*Math.sin(a)]); } return g; })(),.35,P.mattone,.12);
  } else if(k===6){
    /* Horti Spei Veteris: «mentioned only once» (Storia Augusta, Elagabalo 13), presso Spes Vetus, «the district just inside the later Porta Praenestina, where several
       aqueducts met», «the highest point on the east side of the city». Nessun edificio, nessuna forma. 27 novembre 2026: un bosco fitto di lecci con una radura e un solo
       viale diritto verso nord, verso la porta e gli acquedotti. Bosco, radura e viale sono uno schema, i lecci una scelta. */
    var v6=[[H[0]-.5,H[1]+R-1],[H[0]+1.2,H[1]-R+1]]; viale(B,H,v6,.34);
    boschetto(k,H,H[0]-3.5,H[1],4.5,34,[3,3,3,6],961); boschetto(k,H,H[0]+4.5,H[1]+1,4,28,[3,3,6],962);
    var Y6=quota(H[0],H[1]); B.dentro(0,hS(H[0]+.3,H[1]-.2)-Y6-.08,0,0,function(B){ B.cilindro(1.9,.1,.3,0,-.2,P.prato,1.9,20); });      // la radura
  } else if(k===7){
    /* Horti di Cesare (Platner e Ashby, Caesaris 2): sulla riva destra, «from a point near the porta Portuensis southwards along the via Portuensis»; lasciati al popolo
       romano. Il terreno scende verso il Tevere. 27 novembre 2026: un giardino pubblico in lunghezza, con tre viali paralleli alla via Portuense e viali di traverso, le file
       di pioppi bianchi verso il fiume e di pini lungo la strada, una siepe sul lato della strada. Tutto è uno schema: la fonte non descrive il giardino. */
    var t7, tb=0, dm=1e9; for(t7=0;t7<=400;t7++){ var pf=RM.curvaFiume.getPoint(t7/400), dd=Math.hypot(pf.x-H[0],pf.z-H[1]); if(dd<dm){ dm=dd; tb=t7/400; } }
    var tg=RM.curvaFiume.getTangent(tb), dx7=[tg.x/Math.hypot(tg.x,tg.z),tg.z/Math.hypot(tg.x,tg.z)], pz7=[-dx7[1],dx7[0]], sg=hS(H[0]+pz7[0]*5,H[1]+pz7[1]*5)<hS(H[0]-pz7[0]*5,H[1]-pz7[1]*5)?1:-1;      // la via Portuense corre lungo la riva: i viali vanno come il fiume nel punto più vicino; sg: il lato più basso, verso il fiume
    [-4,0,4].forEach(function(o7,i){ var o=o7*sg, l=[[H[0]+pz7[0]*o-dx7[0]*R,H[1]+pz7[1]*o-dx7[1]*R],[H[0]+pz7[0]*o+dx7[0]*R,H[1]+pz7[1]*o+dx7[1]*R]]; viale(B,H,l,i===1?.45:.3); filare(k,H,l,1.25,.6,i===0?1:i===1?0:4,1.05); });
    [-6,-2,2,6].forEach(function(o7){ viale(B,H,[[H[0]+dx7[0]*o7-pz7[0]*7,H[1]+dx7[1]*o7-pz7[1]*7],[H[0]+dx7[0]*o7+pz7[0]*7,H[1]+dx7[1]*o7+pz7[1]*7]],.25); });
    var o8=-7.6*sg; muroLinea(B,H,[[H[0]+pz7[0]*o8-dx7[0]*R,H[1]+pz7[1]*o8-dx7[1]*R],[H[0]+pz7[0]*o8+dx7[0]*R,H[1]+pz7[1]*o8+dx7[1]*R]],.18,P.chioma,.22);      // la siepe sul lato della strada
  }
  /* fino al 26 novembre 2026 qui c'era per tutti lo stesso disegno: viale ad anello, croce di viali, quattro aiuole e il muro sul giro (aiuole() e recinto(), non più usate) */
}

/* ---------- messa in scena ---------- */
var riquadro=document.getElementById('scena').parentNode;
var etichette=document.createElement('div'); etichette.className='etichette3d'; riquadro.appendChild(etichette);
function globale(o,lx,lz){ var c=Math.cos(o.ry||0), s=Math.sin(o.ry||0); return [o.x+lx*c+lz*s, o.z-lx*s+lz*c]; }
/* prima le zone: sotto ogni monumento il terreno si spiana alla quota del suo centro; poi si posa il suolo */
var PENDIO={campanilepietro:1,monasteripietro:1,porticopietro:1,scholae:1,leonine:1,mulini:1,monasteripietro2:1,andreapietro:1,petronilla:1,episcopiapietro:1,scholae2:1,obeliscovaticano:1,ospizionaumachia:1};        // complessi che seguono il pendio: niente terrazza
['orologio','castrapretorio','castrapretoriorasa','foroboario','esquilino','sessoriano','campidoglio'].forEach(function(k){ PENDIO[k]=1; });
['magnamater','tiberiana'].forEach(function(k){ PENDIO[k]=1; });
['ercolevincitore','portuno','giano','argentari','arcogallieno','trofeimario','servianetermini','servianeaventino'].forEach(function(k){ PENDIO[k]=1; });      // 27 novembre 2026: pezzi usciti dai gruppi foroboario ed esquilino, che seguono il pendio; ognuno al piede di prima (luogo)      // 26 novembre 2026 (sera): sul pianoro del Palatino, che nel modello è la terrazza del gruppo palatino; RM.hGrezza lì sta 6 unità più in basso
['casasallustio','hortilamianistatue','hortisallustiani','hortiacilii','hortimaecenatis','hortilamiani','hortiliciniani','hortiluculliani','hortispeiveteris','horticaesaris'].forEach(function(k){ PENDIO[k]=1; });      // gli horti (26 novembre 2026): ogni pezzo sul suo terreno, senza zona (le case stanno già fuori dal cerchio di RM.HORTI)      // i gruppi dell'inventario del 22 novembre 2026: pezzi lontani, ognuno sul suo terreno
/* Piani fermi trovati dalla prova a tappeto del 27 novembre 2026 (notte): dove il suolo disegnato usciva sopra un pavimento, una gradinata o un podio. Il rettangolo è l'ingombro
   del monumento nelle sue coordinate [x, z, mezza lunghezza, mezza larghezza]; quanto usciva, in metri, nel commento */
var FERMI_TAB={pace:[[.06,.19,5.63,6.41]], olitorio:[[.05,.37,2.03,2.12]], vesta:[[3.6,1.39,4.37,2.15]], traiano:[[0,-.12,16.6,16.48]], massenzio:[[-.65,-.1,4.75,4.2]],      // pace 3,5; olitorio 0,1; vesta 0,1; traiano 0,2; massenzio 0,9
  apollo:[[0,.37,1.25,2.28]], bellona:[[0,.37,1.05,2.57]], termecostantino:[[0,.32,4.84,5.79]], mariamaggiore:[[1.61,0,6.57,2.02]], tempioclaudio:[[-1.54,.09,12.74,9.16]],      // apollo 1,4; bellona 0,4; termecostantino 0,3; mariamaggiore 0,3; tempioclaudio 0,6
  ottavia:[[.04,-.02,6,6.66]], pantheonpiazza:[[0,6.5,3.4,11.25,0,-.06]]};      // ottavia 2; piazza del Pantheon 0,5: qui il suolo scende 60 cm sotto il piano del Pantheon, perché il lastricato della piazza sta 30 cm sotto quel piano e il suolo lo copriva (raggi verticali: a meno di 2 mm in cinque punti)
M.forEach(function(o){
  var h=PENDIO[o.id]?null:RM.hGrezza(o.x,o.z)-.05; o.quota=h;
  var st=D.MONUMENTI&&D.MONUMENTI[o.id], dal=st&&st[0][1]==='assente'&&st.length>1?(D.CANTIERI&&D.CANTIERI[o.id]?D.CANTIERI[o.id]-1:st[1][0]-8):0;      // monumento non ancora costruito: fino all'apertura del cantiere (otto anni prima) sul sito ci sono case (js/citta.js)
  (o.zone||[]).forEach(function(q){ var p=globale(o,q[0],q[1]), z={x:p[0],z:p[1],r:q[2],h:h,dal:dal};
    if(q[3]!=null) z.t=q[3];                                                                     // [x, z, raggio, sfumatura]: la sfumatura sottile per le piattaforme murate (RM.h in js/base.js)
    if(q[2] instanceof Array){ var gz=(o.ry||0)+(q[4]||0); z.r=0; z.a=q[2][0]; z.b=q[2][1]; z.c=Math.cos(gz); z.s=Math.sin(gz); z.R=Math.hypot(z.a,z.b); }      // [x, z, [mezza larghezza, mezza profondità], sfumatura, rotazione in più]: un rettangolo girato col monumento
    RM.zone.push(z); });
  if(o.lunga){ var n=Math.ceil(o.lunga[0]/o.lunga[1]); for(var i=0;i<n;i++){ var p=globale(o,((i+.5)/n-.5)*o.lunga[0],0); RM.zone.push({x:p[0],z:p[1],r:o.lunga[1],h:h}); } }
  var fe=o.fermo||FERMI_TAB[o.id], hf=o.come?(M.filter(function(p){ return p.id===o.come; })[0]||{}).quota:h;      // i pezzi con come poggiano sul piano del complesso
  if(fe&&hf!=null) fe.forEach(function(q){ var p=globale(o,q[0],q[1]), g=(o.ry||0)+(q[4]||0); (RM.pianiFermi||(RM.pianiFermi=[])).push([p[0],p[1],Math.cos(g),Math.sin(g),q[2],q[3],hf+(q[5]||0)]); });      // fermo: [x, z, mezza lunghezza, mezza larghezza, rotazione in più, quota in più]: la pianta dove la maglia del suolo non deve salire sopra il piano (posaSuolo in js/base.js)
});
/* dove una strada passa sotto un arco si stringe alla luce del fornice: [x, z, raggio, mezza larghezza] (24 novembre 2026: con strade larghe 16 m e fornici di 5 o 6, anche un arco
   ben centrato sembrava stare «accanto» alla strada) */
RM.strozzature=[[-34.81,-75.79,2,.28],[-48,-117.8,2,.21],[-31.24,-63.12,2,.23],[133.07,-36.43,1.6,.34],[27.2,20.15,1.6,.25],[81.86,76.56,1.4,.19],[-110.9,-9.2,1.6,.25],[-155.49,-94.14,1.6,.26],[-7.53,.64,.9,.3]];      // Claudio, Portogallo, Arcus Novus, Gallieno (fornice di 7,30 dal 27 novembre 2026), Tito, Dolabella (Costantino tolto il 27 novembre 2026: la strada gli passa accanto, si veda l'arco), Valentiniano (ponte Aurelio), Graziano (ponte Elio); l'ultima, 27 novembre 2026 (sera), la via accanto all'arco di Tiberio: Platner e Ashby, Arcus Tiberii, «on the north side of the Sacra Via, which was made narrower at this point by having its curb bent toward the south»; di quanto, la fonte non lo dice (qui 3 m)
RM.posa();
var perId={};
M.forEach(function(o){
  var B=new RM.Costruttore(); o.fa(B); perId[o.id]=o;
  o.g=B.maglia(RM.matPietra()); if(o.sc) o.g.geometry.scale(o.sc,o.sc,o.sc); o.g.geometry.computeBoundingBox();
  var bb=o.g.geometry.boundingBox; o.raggio=o.raggioFisso||Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2; o.alto=o.altoFisso||bb.max.y;      // altoFisso, raggioFisso: le misure di un gruppo da cui si sono staccati dei pezzi (26 novembre 2026), perché il degrado del resto non cambi
  o.mat=o.g.material=RM.matRovina(o.alto); o.g.customDepthMaterial=o.mat.userData.ombra;
  o.certezza=((D.CERTEZZA||{})[o.id]||['C'])[0]; o.mat.userData.u.uSapCol.value.copy(RM.sapere.COL[o.certezza]);      // «che cosa sappiamo davvero»
  o.g.position.set(o.x,o.quota!=null?o.quota-.05:quota(o.x,o.z),o.z); o.g.rotation.y=o.ry||0;
  if(o.come) o.g.position.y=perId[o.come].g.position.y;                       // poggia sullo stesso piano del complesso vicino
  o.g.userData.gruppo='monumenti'; RM.scene.add(o.g);
  if(o.nome){ o.div=document.createElement('span'); o.div.textContent=o.etichetta||o.nome;      /* etichetta: nome corto per la scena, dove quello della scheda è lungo (23 novembre 2026) */ etichette.appendChild(o.div); o.div.addEventListener('click',function(){ if(RM.apriScheda) RM.apriScheda(o.id); }); }
});
RM.MONUMENTI=M.filter(function(o){ return o.nome; }).concat([{id:'mura', nome:'Mura Aureliane', x:106,z:-203, raggio:28, alto:2}, {id:'acquedotti', nome:'Acquedotti', note:{chiuso:'tagliati nel 537'}, x:249,z:12, raggio:30, alto:3},
  {id:'antoniniano', nome:'Acquedotto Antoniniano', note:{chiuso:'tagliato nel 537'}, x:120,z:200, raggio:26, alto:2}]);

/* stato in un dato anno: {s0, s1, t}, con t che sfuma nei sei anni prima del cambio. Le comparse decadono verso il 500. */
var COMPARSA=[[0,'uso'],[500,'chiuso']];
RM.statoMonumento=function(id,anno){
  var st=D.MONUMENTI[id]||COMPARSA, i=0, k;
  for(k=0;k<st.length;k++) if(anno>=st[k][0]) i=k;
  var s0=anno<st[0][0]?'assente':st[i][1], prossimo=st[i+1];
  var brusco=prossimo&&(prossimo[1]==='bruciato'||prossimo[1]==='spogliato'||prossimo[1]==='crollato'||(prossimo[1]==='assente'&&(id==='adrianostatue'||id==='colosso'||id==='castrapretorio'||id==='curiaantica'||id==='curiastatue'||id==='focastatua'||id==='fiaccola357'||id==='colonnatraianastatua')));      /* anche il Colosso sparisce di colpo: non si accorcia negli anni prima; i Castra Praetoria, smantellati dopo il 312, nel 312 sono ancora interi */      // le statue del mausoleo cadono in un giorno (537)
  var inizio=prossimo&&s0==='assente'&&D.CANTIERI&&D.CANTIERI[id];      // inizio dei lavori, dove la scheda lo dice (CANTIERI in js/dati.js)
  return {s0:s0, s1:prossimo?prossimo[1]:s0, t:prossimo?RM.sfuma(inizio||prossimo[0]-(brusco?.4:6),prossimo[0],anno):0};
};
/* Degrado in due tempi.
   c = incuria: dal 390 circa la manutenzione pubblica si dirada per tutti, e accelera dopo la chiusura. Si vede come crepe, colature, erba, coppi mancanti.
   r = crolli veri e propri: pochi, e solo decenni dopo la chiusura; alla fine del VI secolo i grandi edifici sono ancora in piedi.
   Fino al 23 novembre 2026 alla chiusura toglieva subito un poco di cima a ogni tratto: sul tetto di Giove Capitolino il colmo si spezzava a blocchi e il tempio sembrava spaccato (l'utente: «fai delle crepe, non che si spacchi a metà»).
   Le basiliche cristiane sono tenute in ordine; il mausoleo di Adriano, ormai fortezza, quasi. */
var CURA={laterano:0, santamarianova:0, santadriano:0, curia:.5, curiaantica:.5, pantheonchiesa:0, patriarchio:0, triclinioleone:0, pietro:0, croce:0, lorenzo:0, lorenzopelagio:0, agnese:0, paolo:0, sabina:0, mariamaggiore:0, stefano:0, cosma:0, monasteripietro:0, campanilepietro:0, porticopietro:0, scholae:0, leonine:0, costanza:0, agneseonorio:0, paolocostantino:0, tegolepietro:0, obeliscovaticano:.2, andreapietro:0, petronilla:0, monasteripietro2:0, episcopiapietro:0, scholae2:0, ospizionaumachia:0, mulini:0, casenerva:0, foca:.4, focastatua:.4, fiaccola357:.4, curiastatue:.5, adriano:.35, arcocostantino:.5, arcotito:.5, arcoseveroforo:.5, colonnatraiana:.5, testaccio:.5, colosso:0, obelisco357:.4, fangocirco:0, giano:.5, argentari:.5, arcogallieno:.5, ottaviapropileo:.4, marcoaurelio:0, marcoaureliolat:0, pigna:0, pignapietro:0};      // 27 novembre 2026: i tre archi usciti dai gruppi, come gli altri archi in uso; il propileo d'Ottavia, che è in piedi oggi con le sue colonne, perde meno pezzi
/* «abbandonato» (25 novembre 2026, l'utente: «Ok» alla proposta della verifica degli anacronismi, src/testi/audit-anacronismi.md): non più in uso, ma la struttura regge
   per secoli (la cupola di Minerva Medica fino al 1828, il Pantheon fra il 392 e il 609, i templi del Foro Boario diventati chiese). Prende l'incuria della chiusura
   (sporco, crepe, erba, coppi mancanti: uCrepe) ma niente crolli (uRovina resta a zero), finché un evento non li porta (terremoto, incendio, cava). Uno «spogliato»
   che viene dopo toglie i bronzi senza far cadere nulla.
   Dal 25 novembre 2026, sera, anche v (verde: erba, muschio, umido) e i (intonaco caduto, crepe grandi), per lo shader del degrado (DEGRADO in js/costruttore.js):
   crescono con gli anni d'abbandono, poco dopo qualche decennio (nel 600 le terme di Diocleziano sono a un terzo), tutto dopo trecento anni. Meno sui templi del Foro Boario,
   sulla Meta Sudans e sull'arco di Gallieno. Le misure sono una resa, non una fonte.
   Il Pantheon (25 novembre 2026, l'utente: nel 600 «quasi invariato»): prima aveva un terzo del verde e un quinto dell'intonaco caduto e non si vedeva nulla; ora quasi
   come gli altri (erba sui gradoni e sulle cornici, muschio e umido sulla rotonda, intonaco caduto a chiazze; dal 609 ripulito per gradi, con una parte dei segni che resta: si veda RIUSO), ma niente crolli
   e niente tegole cadute (uCoppi a zero: le tegole di bronzo ci sono fino al 663, quando le toglie Costante II; la scheda: «nel 609 il papa riceve un edificio intero»).
   Prima nel 500 e nel 600 la calotta mostrava buchi dove mancavano le tegole: un crollo che le fonti non dicono. */
var MISURA_V={pantheon:.9, foroboario:.45, metasudans:.5, esquilino:.7, colosseo:.85}, MISURA_I={pantheon:.9, foroboario:.4, metasudans:.6, esquilino:.6, colosseo:.25, marcello:.35};      // colosseo e Marcello (27 novembre 2026): facciate di travertino pieno, senza intonaco da far cadere; il poco che cade è dei muri di mattoni interni
/* VERDE_OVUNQUE (27 novembre 2026; l'utente: «La Roma dell'800 deve sembrare al visitatore una città magnifica in rovine… anche le macerie, tipo con le edere ed altre piante sopra»).
   Fino a oggi il verde (v), l'intonaco caduto (i) e i cespugli e l'edera dei ruderi venivano solo dallo stato «abbandonato»: il Colosseo, i Fori, il Circo, lo stadio di Domiziano,
   i monumenti «chiusi» o usati come cava restavano puliti per secoli, come pietra appena tagliata. Ora contano gli anni da quando il monumento è uscito dall'uso, qualunque sia lo
   stato (chiuso, cava, spogliato, bruciato, crollato). Quanto verde e in quanto tempo resta una resa, uguale per tutti: nessuna fonte letta misura il verde sui monumenti nell'800;
   le fonti dicono solo «erba», «arbusta», «dumi et vepres» (src/testi/vita-roma-fonti.md, «Le piante dell'incolto»). */
/* TENUTA (27 novembre 2026): quota dei crolli (r) che un monumento prende davvero. Regola: ciò che resta in piedi oggi nell'800 c'era; dove il taglio uniforme di rmCrollo
   abbassava una parte che oggi è in piedi, qui si toglie. Colosseo: l'anello esterno a nord è ancora intero fino all'attico (Platner e Ashby, Amphitheatrum Flavium); la
   cava del VI-IX secolo resta sul solo fronte sud (uSud, più sotto). Prima il modello lo abbassava tutto attorno di un quarto. */
var TENUTA={colosseo:0};
/* Quale parte cade, dove una fonte letta lo dice (26 novembre 2026; lo shader in taglio e rmCrollo, js/costruttore.js). zona: [dx, dz, da, a] in coordinate del monumento,
   il piano che divide la parte che regge (prima di «da») da quella che cade (dopo «a»); peso: [chi regge, chi cade]; base: taglio fisso in più nella parte che cade,
   in frazioni dell'altezza, che arriva col crollo; muri: 0 se cadde solo il tetto. Gli altri monumenti crollano col campo continuo, uguale ovunque. */
var CROLLI={
  massenzio:{zona:[0,1,-1.45,-1.25], peso:[.05,1.3], base:.45},      // Platner e Ashby, Basilica Constantini (letta il 26 novembre 2026): «The south aisle and the roof of the nave probably collapsed in the earthquake of Leo IV in 847»; «the north wall and the north aisle … are still standing». Qui -z è il nord e la navata nord va da z -3,3 a -1,3: regge lei, con il muro nord e l'abside nord; cade tutto ciò che nella navata centrale e in quella sud sta sopra le volte laterali (base 0,45: sopra 2,4 unità su 4,4, l'imposta delle volte), cioè la volta e le pareti alte della navata, e la navata sud scende ancora, per campate. Che con la volta cadessero anche le pareti alte e quanto in basso arrivi la rottura è una resa; «probably» è di Platner e Ashby
  foroaugusto:{zona:[-1,0,-5.1,-4.6], peso:[0,1]},      // 27 novembre 2026. La scheda: «Restano tre colonne del tempio con l'architrave, alte 15,30 metri, il podio e il grande muro di fondo». Il muro tagliafuoco del modello sta a x da 5,25 a 5,75 (nel riferimento del foro): regge intero (peso 0); portici, esedre e tempio, davanti, prendono il taglio della cava. Prima la cava abbassava anche il muro fino a due terzi
  arcoclaudio:{zona:[1,0,-.25,.25], peso:[.5,1.4], base:.5},      // 27 novembre 2026. Platner e Ashby, Arcus Claudii: «It seems to have been in ruins as early as the eighth century»: dal 700 metà dell'arco scende a metà altezza. Quale metà e quanto è una resa: la fonte dice solo «in ruins»
  paolo:{zona:[0,0,-2,-1], peso:[1,1], muri:0}      // Annali del regno dei Franchi, 801: «tectum basilicae beati Pauli apostoli magna ex parte cum suis trabibus decidit»: cade il tetto, non i muri
};
/* La quota del taglio di rmCrollo (js/costruttore.js) rifatta qui, con le ottave fini al loro valore medio: serve a posare macerie e verde dove la cima è caduta davvero.
   rv: il risultato di RM.rovina; muri: per le murature vale il peso dei muri. */
function crolloJS(o,lx,lz,rv,muri){
  var cr=CROLLI[o.id]||{zona:[0,0,-2,-1],peso:[1,1]}, t=Math.min(1,Math.max(0,(lx*cr.zona[0]+lz*cr.zona[1]-cr.zona[2])/(cr.zona[3]-cr.zona[2]))), zs=t*t*(3-2*t), m=cr.peso[0]+(cr.peso[1]-cr.peso[0])*zs;
  var kl=.5+.2*Math.sin(lx*.37+lz*.21+1.3)+.16*Math.sin(-lx*.19+lz*.43+4.1)+.1*Math.sin(lx*.71-lz*.53+2.2), k=.55*kl+.225;
  return ((rv.r||0)*(.1+2*Math.min(1,Math.max(0,(k-.3)/.42)))*m+(cr.base||0)*(rv.k||0)*zs)*(muri&&cr.muri!=null?cr.muri:1);
}
function grezza(id,anno){      // il degrado senza i ritorni in uso graduali (si veda RM.rovina, più sotto)
  var st=D.MONUMENTI[id]||COMPARSA, da=null, dc=null, spoglio=0, fuoco=0, crollo=0, scavo=0, rinato=false, k, cura=CURA[id]==null?1:CURA[id], q, y, dk=null;
  for(k=0;k<st.length;k++){
    q=st[k][1]; y=st[k][0];
    if(q==='uso'){ if(k>0 && st[k-1][1]!=='assente' && anno>=y){ da=null; dc=null; spoglio=0; fuoco=0; crollo=0; scavo=0; dk=null; rinato=true; } continue; }   // riaperto: qui si azzera; quanto resta dei segni lo decide RM.rovina (RIUSO)
    if(q!=='assente' && anno>=y-3 && dk==null) dk=y;      // il primo cambio dopo l'ultimo uso: da qui si contano gli anni d'abbandono
    if(anno>=y-3 && q==='abbandonato' && dc==null) dc=y;
    if(anno>=y-3 && (q==='chiuso'||q==='bruciato'||(q==='spogliato'&&dc==null)) && da==null) da=y;
    if(q==='spogliato'||q==='bruciato') spoglio=Math.max(spoglio,RM.sfuma(y-.4,y+.3,anno));
    if(q==='bruciato') fuoco=RM.sfuma(y-.4,y+.3,anno);       // un incendio porta via subito il tetto e parte dei muri
    if(q==='crollato') crollo=RM.sfuma(y-.4,y+.1,anno);      // terremoto: cede il tetto
    if(q==='cava'){ if(anno>=y-3 && da==null) da=y; scavo=RM.sfuma(y,y+200,anno); spoglio=Math.max(spoglio,.6*RM.sfuma(y,y+40,anno)); }   // smontato poco a poco, dall'alto: prima le coperture e i rivestimenti
  }
  var d0=da==null?dc:(dc==null?da:Math.min(da,dc)), chiuso=d0==null?0:RM.sfuma(0,70,anno-d0), eta=da==null?0:anno-da, regge=da==null&&dc!=null;      // regge: abbandonato, la struttura resta in piedi
  var ea=d0==null?0:anno-d0, mv=MISURA_V[id]==null?1:MISURA_V[id], mi=MISURA_I[id]==null?1:MISURA_I[id];      // anni d'abbandono: dal 27 novembre 2026 da qualunque stato che non sia l'uso (si veda VERDE_OVUNQUE)
  return {v:d0==null?0:mv*(.25+.75*RM.sfuma(0,300,ea))*RM.sfuma(0,25,ea), i:d0==null?0:mi*(.25+.75*RM.sfuma(20,260,ea))*RM.sfuma(5,40,ea), r:(da==null?0:.15*RM.sfuma(20,120,eta)+.04*RM.sfuma(120,320,eta))+(regge?0:.07*spoglio)+.2*fuoco+.2*crollo+.1*scavo, s:spoglio,
          c:Math.min(1,Math.max(.45*crollo,cura*(rinato?.35:1)*(.62*RM.sfuma(390,570,anno)+.45*chiuso+.2*spoglio+.5*fuoco+.3*scavo))), k:crollo, dk:dk, dv:dc};
}
/* Ritorno in uso (26 novembre 2026; l'utente: il Pantheon nel 610 «più nuovo che nel 390» non è credibile; e sulla regola generale: «Ok a meno che le fonti non dicano altro»).
   Fino al 25 novembre l'uso che seguiva un abbandono azzerava tutto in un istante: erba, muschio, intonaco caduto, crepe, bronzo brunito. Ora, caso di base:
   - la pulizia comincia mezzo anno prima della data del ritorno e dura tre anni e mezzo (p, da 0 a 1);
   - via l'erba, il muschio, i cespugli e l'edera (uPulito nello shader, crescita del verde più sotto);
   - resta una parte dei segni, tanto più grande quanto più lungo è stato l'abbandono: dal 25% (pochi anni) al 50% (trecento anni) del verde-sporco (colature, umido,
     bronzo brunito), delle crepe e dell'incuria; dell'intonaco caduto ne resta il 60% di quella parte (è la cosa che si ripara per prima); i crolli si riparano (un
     edificio che si usa ha il tetto), gli spogli no (ciò che è stato portato via non torna). La tinta dello stato si schiarisce, ma un poco della vecchia resta.
   - il degrado dell'edificio in uso continua sopra questi resti (si prende il più alto dei due).
   Quanto si pulisca e in quanti anni è una resa, uguale per tutti, finché una fonte letta non dica altro: allora la voce di RIUSO la scavalca, con la fonte accanto.
   Campi: da (anni dal ritorno all'inizio dei lavori), durata, resta (quota dei segni che restano, al posto di quella calcolata), intonaco (quota dell'intonaco caduto
   che resta, fra i segni), ripara (quota dei crolli riparati), da_chi (il monumento di cui eredita i segni, se è un altro oggetto del modello: la stessa fabbrica). */
var RIUSO={
  pantheon:{},      // regola di base. Liber Pontificalis, vita di Bonifacio IV (LXVIIII nell'ed. Duchesne, I p. 317; LXVIII 2 per Platner e Ashby): «petiit a Focate principe templum qui appellatur Pantheum, in quo fecit ecclesiam beatae Mariae semper virginis et omnium martyrum; in qua ecclesia princeps dona multa optulit». Nessun lavoro nominato; Platner e Ashby (voce Pantheon) neppure
  paolo:{da:-2.5, durata:2.5},      // regola di base per i segni; il tetto (il solo crollo) si ricostruisce: la scheda (dati.js) «papa Leone III lo ricostruisce», dal Liber Pontificalis, che qui non è stato riletto. L'806 del modello è la riapertura, quindi i lavori finiscono lì e non dopo: due anni e mezzo è una resa
  santadriano:{da_chi:'curia'}      // la Curia diventata chiesa (Liber Pontificalis, vita di Onorio I, dalla scheda: «vi fa la chiesa del beato Adriano»; anno ignoto): eredita i segni della Curia e li perde per la regola di base. La Curia nel modello non fu abbandonata: restano poche crepe
};
RM.rovina=function(id,anno){
  var b=grezza(id,anno), tb=RIUSO[id], st=D.MONUMENTI[id]||COMPARSA, yr=null, prima=null, k, da=(tb&&tb.da!=null)?tb.da:-.5;
  for(k=1;k<st.length;k++){
    if(st[k][1]==='uso' && st[k-1][1]!=='assente' && anno>=st[k][0]+da){ yr=st[k][0]; prima=st[k-1][1]; }
    if(st[k][1]==='uso' && st[k-1][1]==='assente' && tb && tb.da_chi && anno>=st[k][0]+da){ yr=st[k][0]; prima='uso'; }
  }
  if(TENUTA[id]!=null) b.r*=TENUTA[id];      // si veda TENUTA
  if(yr==null) return b;
  for(k=0;k<st.length;k++) if(st[k][0]>yr && anno>=st[k][0]-3 && st[k][1]!=='uso') return b;      // di nuovo fuori uso dopo il ritorno (Venere e Roma: rifatto nel 312, chiuso nel 392): contano i segni del nuovo abbandono, non la pulizia di allora (27 novembre 2026: prima uPulito restava a 1 e nell'800 il tempio non aveva verde)
  var pre=grezza(tb&&tb.da_chi||id,yr-.001), p=RM.sfuma(yr+da,yr+da+(tb&&tb.durata!=null?tb.durata:3.5),anno);
  var anni=pre.dk==null?0:yr-pre.dk, resta=(tb&&tb.resta!=null)?tb.resta:.25+.25*RM.sfuma(0,300,anni), ri=(tb&&tb.intonaco!=null)?tb.intonaco:.6, rp=(tb&&tb.ripara!=null)?tb.ripara:1;
  function verso(a,z){ return a+(z-a)*p; }
  return {v:Math.max(b.v,verso(pre.v,pre.v*resta)), i:Math.max(b.i,verso(pre.i,pre.i*resta*ri)), c:Math.min(1,Math.max(b.c,verso(pre.c,pre.c*resta))), r:Math.max(b.r,verso(pre.r,pre.r*(1-rp))),
          s:Math.max(b.s,pre.s), k:verso(pre.k,pre.k*(1-rp)), dk:b.dk, dv:b.dv, pulito:p, prima:prima, tinta:1-p*(1-.3*resta), resta:resta, ritorno:yr};      // tinta: quanto resta della tinta dello stato di prima
};
RM.TINTA=TINTA;
/* La patina del tempo (27 novembre 2026; PATINA in js/costruttore.js): la dose di RM.patinaAnno accumulata dall'anno in cui il monumento compare (o ricompare dopo essere stato
   «assente»: pietra nuova, che parte pulita). Secondo giro, stesso giorno (l'utente: «Ok ripulisci solo quelli per cui sai che c'è stato un restauro»): tutto invecchia alla
   stessa velocità, chiese comprese; prima le chiese in uso e ciò che tornava in uso dopo il 392 invecchiavano più piano senza una fonte dietro, e non è più così. La patina
   torna indietro solo nell'anno di un restauro che una fonte letta attesta (RESTAURI): la dose accumulata fino a lì scende della quota «quanto» (1: pulito come nuovo) e poi
   ricresce. Un restauro ripulisce ciò che la fonte dice: se parla solo del tetto o dei gradini, i muri restano quasi come prima (quota piccola). La quota è una scelta nostra,
   detta riga per riga; le frasi e gli indirizzi stanno in src/testi/topografia-fonti.md, «I restauri che ripuliscono la patina». I restauri prima del 400 non cambiano nulla
   (la patina comincia dopo) e qui non stanno: ponte Cestio (369), ponte Aurelio (365-366), Venere e Roma rifatto da Massenzio (307-312), il rialzo di Onorio (401-403, dose quasi zero).
   Ciò che la fonte non lega a un anno ha l'anno scelto dentro il periodo che dà (detto accanto). Le mura (js/mura.js) e le chiese minori (js/nuclei.js) seguono lo stesso criterio. */
var RESTAURI=[
  ['giulia',416,1],      // Platner e Ashby, Basilica Iulia: «restored … again in 416 A.D. by a certain Gabinus Vettius Probianus, prefect of the city, who also adorned it with statues»
  ['termecostantino',443,1],      // Platner e Ashby, Thermae Constantinianae: «They suffered greatly from fire and earthquake and were restored in 443 by the city prefect Petronius Perpenna Magnus Quadratianus (CIL VI.1750)»
  ['colosseo',445,.5],      // Platner e Ashby, Amphitheatrum Flavium: terremoto del 442 e restauri «negli anni seguenti» (src/testi/scene-roma-fonti.md): anno scelto; ripara i danni, non tutto l'anfiteatro
  ['colosseo',470,.5],      // stessa voce: altri restauri nel 470
  ['colosseo',508,.5],      // stessa voce: dopo un altro terremoto restauri del prefetto Basilio, «probably consul in 508»
  ['rostri',470,1],      // Platner e Ashby, Rostra Augusti: ultimo restauro verso il 470, di Giunio Valentino, prefetto della città (iscrizione): restaura e allunga la piattaforma
  ['pompeo',509,.6],      // Platner e Ashby, Theatrum Pompei: restaurato «finally by Symmachus at the command of Theodoric between 507 and 511 (Cassiod. Var. IV.51)»; Variae IV 51: va rinforzato («roboranda»): un rinforzo della struttura, non una pulitura di tutte le facce; anno a metà
  ['caracalla',510,.4],      // Platner e Ashby, Thermae Antoninianae: mattoni col bollo di Teodorico (493-526): riparazioni, di quali parti non è detto; anno scelto
  ['domusaugustana',525,.4],      // Platner e Ashby, Domus Augustiana: «Repairs by Theodoric and Athalaric are vouched for by brick-stamps (CIL XV.1665 a, 1, 1672)»; anno scelto fra i due regni (493-534)
  ['laterano',780,.5,1],      // Liber Pontificalis, vita di Adriano I, cc. LXXI-LXXVIII (Duchesne I, pp. 505-509): la basilica «in ruinis posita» con i portici, rifatta; anno scelto dentro il pontificato (772-795); soprattutto tetti e portici. Terzo giro: c. LXX (Duchesne I, p. 507) «a noviter sicut ecclesias beatorum principum Petri et Pauli renovavit, in qua et mutavit trabes maiores numero XV»: il tetto nuovo (quarto valore)
  /* Terzo giro (27 novembre 2026), Liber Pontificalis nell'edizione Duchesne letto su archive.org (duchesne01, duchesne02). Il quarto valore, se c'è, è la quota del tetto (i coppi:
     uPatTetto in js/costruttore.js): dove la fonte dice rifatte le travi e il tetto, i coppi ripartono puliti anche se i muri si ripuliscono poco. */
  ['pietro',780,.1,1],      // vita di Adriano I, cc. LXIV-LXV (Duchesne I, p. 505): «mutavit ibidem trabes numero XIIII; atque totum eiusdem basilice tectum et portica a noviter restauravit»; anno scelto (772-795)
  ['paolo',780,.3,1],      // vita di Adriano I, c. LXVII (Duchesne I, p. 506): travi «ad modicumque ruituras […] totam a noviter restauravit. In qua et mutavit trabes maiores numero XXXV»; anno scelto
  ['paolo',806,.5,1],      // vita di Leone III, c. XXXI (Duchesne II, p. 9): il terremoto del 30 aprile 801, «omnia sarta tecta ruerunt»; il papa «tota aecclesia marmoravit et eius portica renovavit […] sarta tecta omnia noviter restauravit». 806: l'anno in cui nella scena (terremoto801, js/scene-tappe.js) spariscono le macerie, scelto
  ['mariamaggiore',780,.5,1],      // vita di Adriano I, c. LXXIV (Duchesne I, p. 508): la basilica «ad Praesepe quae a priscis temporibus tota marcuerat, ultro citroque restauravit, et in sarta tecta eiusdem ecclesiae posuit trabes maiores XX»; anno scelto
  ['santadriano',780,.8],      // vita di Adriano I, c. LXXXI (Duchesne I, pp. 509-510): «basilicas, scilicet beati Adriani martyris seu sanctorum Cosme et Damiani, quas noviter restauravit»; anno scelto. Onorio I (c. VI, Duchesne I, p. 324) «Fecit ecclesiam beati Adriani in Tribus Fatis»: fa la chiesa, non dice di restauri; non entra
  ['pantheon',735,.1],      // Liber Pontificalis, vita di Gregorio III, XCII 12: il tetto rifatto con lastre di piombo (uPiombo più sotto): solo il tetto, i muri restano quasi come prima
  ['pietro',800,.1],      // Liber Pontificalis, vita di Leone III, c. LXXXIX (Duchesne II, p. 28): rifà i gradini dell'atrio; anno scelto dentro il pontificato (795-816); solo i gradini
  /* le chiese minori (js/nuclei.js), per nome: Adriano I rifà le chiese «in ruinis», con i tetti caduti o cadenti (vita di Adriano I, cc. LXXI-LXXVIII, Duchesne I, pp. 505-509,
     in src/testi/vita-roma-fonti.md); anno scelto dentro il pontificato (772-795); tetti e muri rappezzati, non pietra nuova: quota 0,6 */
  ['chiesa:San Lorenzo in Lucina',780,.6],      // «a priscis temporibus marcuentes in ruinis», con San Martino
  ['chiesa:San Martino ai Monti',780,.6],      // San Martino presso San Silvestro, stessa frase
  ['chiesa:Santa Prisca',780,.6],      // nell'elenco della stessa vita
  ['chiesa:Santa Prassede',780,.6],      // «ex parte ruens»
  ['chiesa:Santa Pudenziana',780,.6],      // nell'elenco della stessa vita
  ['chiesa:San Marcello',780,1],      // Armellini: «titulum s. Marcelli via Lata situm a novo restauravit» (Adriano I): rifatta da capo
  /* terzo giro (27 novembre 2026), Duchesne letto su archive.org; le chiese minori non hanno una dose a parte per il tetto: un tetto rifatto vale 0,6 come sopra */
  ['chiesa:San Marco',780,.6],      // vita di Adriano I (Duchesne I, p. 500): «Ecclesia vero beati Marci, cuius tectum iam vetustate […] depositis vetustissimis travibus et aliis fortissimis inpositis, a noviter ipsum tectum atque portica»
  ['chiesa:Santa Susanna',780,.6],      // vita di Adriano I, c. LXX (Duchesne I, p. 507): «tectum tituli beate Susanne martyris […] que iam casurum erat et in ruinis positum, a noviter restauravit»
  ['chiesa:San Pietro in Vincoli',780,.8],      // vita di Adriano I, c. LXXV (Duchesne I, p. 508): «titulum Apostolorum quae appellatur Eudoxiae ad vincula, totam eius noviter restauravit ecclesiam»
  ['chiesa:Sant\'Eusebio',780,.8],      // vita di Adriano I, c. LXXIV (Duchesne I, p. 508): «basilicam sancti Eusebii undique renovans restauravit»
  ['chiesa:San Giovanni a Porta Latina',780,.8],      // vita di Adriano I, c. LXXVI (Duchesne I, p. 508): «ecclesiam beati Iohannis Baptistae sitam iuxta portam Latinam, ruinis praeventam, in omnibus noviter renovavit»
  ['chiesa:Santi Quattro Coronati',780,.6],      // vita di Adriano I (Duchesne I, p. 512): «sarta tecta tituli sanctorum Quattuor Coronatorum, quae in ruinis existebant, trabes ibidem plures imponens, omnia noviter restauravit»
  ['chiesa:Santa Prassede',820,1],      // vita di Pasquale I (817-824), Duchesne II, p. 54: la chiesa «ita ut fundamentis casura ruinam sui minaretur […] in alio non longe demutans loco, in meliorem eam quam dudum fuerat erexit statum»: rifatta da capo, poco lontano. Anno scelto; nel modello resta al suo punto (CHIESE)
  ['chiesa:Santa Cecilia',820,1]      // vita di Pasquale I, Duchesne II, p. 56: le mura «a fundamentis ruitura», il papa «novam construere ecclesiam cepit et perficere satis meliorem quam fuerat studuit»; anno scelto
];
function cresciCon(rs,p,a,b,qt){ var PA=RM.patinaAnno; rs.forEach(function(r){ if(r[1]>=a&&r[1]<b){ p+=PA(r[1])-PA(a); p*=1-(qt&&r[3]!=null?r[3]:r[2]); a=r[1]; } }); return p+PA(b)-PA(a); }      // dentro un tratto: la dose sale fino al restauro, scende, risale; qt: la quota del tetto (quarto valore), dove c'è
/* la dose di una cosa fatta pulita nell'anno a0, con i suoi restauri (chiave: id del monumento, o «chiesa:» e il nome): la usano js/nuclei.js e le prove */
RM.patinaRestauri=function(chiave,a0,anno){ if(a0>=anno) return 0; return cresciCon(RESTAURI.filter(function(r){ return r[0]===chiave&&r[1]<anno; }),0,a0,anno); };
/* Chi continua un altro (stesse pietre, nuova voce nel modello): prende la patina di quello nell'anno in cui compare, invece di partire pulito. La Curia diventa Sant'Adriano nel 630
   (la vita di Onorio I non è letta: nessun restauro); la Basilica Emilia bruciata resta in piedi come rovina; statue e pigna portate altrove sono le stesse; la Regia diventa una casa. */
var CONTINUA={santadriano:'curia', emiliarovina:'emilia', marcoaureliolat:'marcoaurelio', pignapietro:'pigna', regiacasa:'regia', castrapretoriorasa:'castrapretorio', castrensemura:'castrense'};
RM.RESTAURI=RESTAURI;      // per le prove
RM.patinaMon=function(id,anno,qt){ var st=D.MONUMENTI[id]||COMPARSA, p=0, k, a, b, rs=RESTAURI.filter(function(r){ return r[0]===id&&r[1]<anno; }), prima=true;
  for(k=0;k<st.length;k++){ a=st[k][0]; if(a>=anno) break; if(st[k][1]==='assente'){ p=0; continue; }
    if(prima&&CONTINUA[id]&&p===0&&a>0) p=RM.patinaMon(CONTINUA[id],a,qt); prima=false;
    b=Math.min(k+1<st.length?st[k+1][0]:1e4,anno); p=cresciCon(rs,p,a,b,qt); }
  return RM.patinaSpenta?0:p; };
RM.patinaTetto=function(id,anno){ return RM.patinaMon(id,anno,true); };      // terzo giro: la dose dei coppi, con la quota del tetto dei restauri (quarto valore di RESTAURI)
/* Un edificio in costruzione non è l'edificio finito schiacciato: i muri salgono dal basso, a tratti (uCant nello shader, js/costruttore.js), dentro un ponteggio di legno.
   Che aspetto avesse ciascun cantiere non si sa: è uno schema, uguale per tutti. Restano fuori i monoliti alzati in un giorno e le cose che non si costruiscono (fango, tegole, mulini). */
var SENZA_CANTIERE={dioscuri:1,curiastatue:1,focastatua:1,fiaccola357:1,metasudansvasca:1,santadriano:1, curiaantica:1, pantheonchiesa:1, emiliarovina:1,obelisco357:1,fangocirco:1,tegolepietro:1,foca:1,mulini:1,marcoaureliolat:1,pignapietro:1,castrapretoriorasa:1}, SENZA_PONTEGGI={casenerva:1,monasteripietro:1,monasteripietro2:1,scholae:1,scholae2:1,episcopiapietro:1,leonine:1,ospizionaumachia:1};
function ponteggio(o,t){
  if(!t||SENZA_PONTEGGI[o.id]||o.raggio>22){ if(o.pont) o.pont.visible=false; return; }
  if(!o.pont){
    var bb=o.g.geometry.boundingBox, x0=bb.min.x-.2, x1=bb.max.x+.2, z0=bb.min.z-.2, z1=bb.max.z+.2, H=bb.max.y+.3, dx=x1-x0, dz=z1-z0, passo=Math.max(1.1,(dx+dz)/22), B=new RM.Costruttore(), i, n;
    n=Math.max(1,Math.round(dx/passo)); for(i=0;i<=n;i++){ B.scatola(.05,H,.05,x0+dx*i/n,0,z0,RM.P.tronco); B.scatola(.05,H,.05,x0+dx*i/n,0,z1,RM.P.tronco); }
    n=Math.max(1,Math.round(dz/passo)); for(i=1;i<n;i++){ B.scatola(.05,H,.05,x0,0,z0+dz*i/n,RM.P.tronco); B.scatola(.05,H,.05,x1,0,z0+dz*i/n,RM.P.tronco); }
    [.2,.4,.6,.8,1].forEach(function(f){ var y=H*f-.05; B.scatola(dx,.035,.1,(x0+x1)/2,y,z0,RM.P.tronco); B.scatola(dx,.035,.1,(x0+x1)/2,y,z1,RM.P.tronco); B.scatola(.1,.035,dz,x0,y,(z0+z1)/2,RM.P.tronco); B.scatola(.1,.035,dz,x1,y,(z0+z1)/2,RM.P.tronco); });
    o.pont=B.maglia(RM.matPietra()); o.pont.position.copy(o.g.position); o.pont.rotation.y=o.g.rotation.y; o.pont.receiveShadow=false; RM.scene.add(o.pont);
  }
  o.pont.visible=true; o.pont.scale.y=Math.min(1,t*.95+.12);      // il ponteggio sta sempre un poco più su dei muri
}
RM.moduli.push(function(anno){
  M.forEach(function(o){
    var q=RM.statoMonumento(o.id,anno), p=(q.s0==='assente'?0:1)*(1-q.t)+(q.s1==='assente'?0:1)*q.t;
    var cant=q.s0==='assente'&&q.s1!=='assente'&&q.t>0&&q.t<1&&!SENZA_CANTIERE[o.id];
    o.mat.color.copy(TINTA[q.s0]).lerp(TINTA[q.s1],q.t);
    o.presenza=p; o.g.visible=p>.01; o.g.scale.y=cant?1:Math.max(p,.001); o.mat.userData.u.uCant.value=cant?q.t:1; ponteggio(o,cant?q.t:0);
    var rv=RM.rovina(o.id,anno); o.mat.userData.u.uRovina.value=rv.r; o.mat.userData.u.uSpoglio.value=rv.s; o.mat.userData.u.uCrepe.value=rv.c; o.mat.userData.u.uVerde.value=rv.v; o.mat.userData.u.uIntonaco.value=rv.i;
    o.mat.userData.u.uPatina.value=RM.patinaMon(o.id,anno); o.mat.userData.u.uPatTetto.value=RM.patinaTetto(o.id,anno);      // la patina del tempo (si veda RM.patinaMon); i coppi a parte (RM.patinaTetto)
    o.mat.userData.u.uPulito.value=rv.pulito||0; if(rv.prima) o.mat.color.copy(TINTA.uso).lerp(TINTA[rv.prima]||TINTA.uso,rv.tinta);      // tornato in uso: si ripulisce per gradi (RIUSO)
    else if(q.s1==='uso' && q.s0!=='uso' && q.s0!=='assente') o.mat.color.copy(TINTA[q.s0]);      // e non schiarisce nei sei anni prima, come faceva la sfumatura degli stati
    var cr=CROLLI[o.id]; if(cr){ var uz=o.mat.userData.u; uz.uCrZona.value.set(cr.zona[0],cr.zona[1],cr.zona[2],cr.zona[3]); uz.uCrPeso.value.set(cr.peso[0],cr.peso[1],(cr.base||0)*(rv.k||0),cr.muri==null?1:cr.muri); }
    if(o.id==='pompeo' && anno>=493){ var tPo=1-RM.sfuma(546,640,anno); o.mat.userData.u.uCrepe.value*=1-.45*tPo; o.mat.userData.u.uRovina.value*=1-.5*tPo; }      // restaurato sotto Teodorico (Cassiodoro, Variae IV 51: «roboranda», a spese del re): crepe e crolli arretrano; di quanto è una resa. Abbandonato dal 546 (25 novembre 2026): l'effetto del restauro svanisce in un secolo
    if(o.id==='pantheon'){ o.mat.userData.u.uCoppi.value=0; o.mat.userData.u.uSpoglio.value=RM.sfuma(662.6,663.3,anno)*(1-RM.sfuma(734,736,anno)); o.mat.userData.u.uPiombo.value=RM.sfuma(734,736,anno); }   // la chiesa resta in uso: cambia solo il tetto. Bronzo tolto da Costante II (LP LXXVIII 3), piombo di Gregorio III (LP XCII 12)
    if(o.id==='colosseo'){ var us=o.mat.userData.u; us.uSudDir.value.set(-Math.sin(o.ry),Math.cos(o.ry)); us.uSudR.value.set(9.4,7.8);
      us.uSud.value=.2*RM.sfuma(523,800,anno)+.3*RM.sfuma(846.6,847,anno); us.uRovina.value*=.4; }      // il fronte sud: cava dal VI secolo; nell'847, secondo il Parco del Colosseo, cade quel che ne resta
  });
});

/* ---------- il verde sui ruderi abbandonati ----------
   25 novembre 2026, l'utente sullo stato «abbandonato»: «Ok fai vedere erba e crepe però». Lo shader del degrado (js/costruttore.js) mette l'erba solo sui piani bassi
   e il muschio solo con i crolli (uRovina): un edificio abbandonato ma in piedi restava quasi solo più scuro. Qui, per i monumenti che hanno lo stato «abbandonato»,
   cespugli e ciuffi sui piani alti (cornici, cime dei muri, terrazze, volte; non sui coppi, che lo shader fa cadere) e rampicanti appesi ai muri. Crescono con gli anni
   dall'abbandono: pochi dopo sessant'anni, tanti dopo trecento. Dove poi un terremoto fa cadere le cime (Caracalla, Massenzio, 847) restano solo quelli più in basso.
   Che fossero cespugli, fichi o edera, e quanti, nessuna fonte lo dice: è una resa dell'abbandono, non una misura. MISURA: il Pantheon fino al 609 e i templi del
   Foro Boario, che arrivano a noi interi, ne prendono meno. */
(function(){
  var MISURA=MISURA_V, QUANTI={diocleziano:400, caracalla:400, pompeo:220, sessoriano:160, massenzio:130, pantheon:50, minervamedica:35, foroboario:50, esquilino:50, metasudans:14, hortisallustiani:170, casasallustio:45, hortiacilii:110, hortimaecenatis:60, hortilamiani:55, hortiliciniani:55, hortiluculliani:60, hortispeiveteris:35, horticaesaris:55,
    colosseo:220, venere:110, traiano:190, termecostantino:90, termenerone:90, termeagrippa:80, mercatitraiano:80, marcello:100, tabularium:45, giulia:55, settizodio:45, augusto:70, sole:80, tempioclaudio:80, forotraiano:90, forocesare:55, foronerva:40, foroaugusto:70, odeon:45,
    circo:110, fori:90, palatino:140, tiberiana:55, domiziano:85, balbo:50, ottavia:50, pace:50, tito:60, saepta:50, ludusmagnus:35, emporio:55, emiliarovina:30};      // 27 novembre 2026: anche i monumenti chiusi, cavati, spogliati (VERDE_OVUNQUE), con la quantità a misura della mole      // horti: arbusti sulle aiuole e sui pezzi, a giardino lasciato      // MISURA: la stessa del verde nello shader (RM.rovina)
  var ruderi=M.filter(function(o){ var st=D.MONUMENTI[o.id]; return o.g&&st&&CURA[o.id]!==0&&(o.raggio==null||o.raggio>=1.5)&&st.some(function(q){ return q[1]!=='uso'&&q[1]!=='assente'; }); });      // dal 27 novembre 2026 ogni monumento uscito dall'uso, non solo gli «abbandonati» (VERDE_OVUNQUE); non le chiese tenute (CURA 0) né le cose piccole
  if(!ruderi.length) return;
  var tel=RM.piccolo, quota=tel?.35:1, cespi=[], viti=[], alberi=[], seme=7;
  /* Alberi veri dentro i ruderi (27 novembre 2026; l'utente: «La Roma dell'800 deve sembrare al visitatore una città magnifica in rovine»): dalla veduta larga i cespugli
     sono puntini e il verde si leggeva a macchie uguali. Quanti per monumento: pochi e grandi, a misura della mole e dello spazio scoperto (cortili delle terme, arene,
     piste, fori). Che specie fossero e quanti, nessuna fonte letta lo dice: è una resa dell'abbandono, come i cespugli; crescono dopo una cinquantina d'anni fuori uso. */
  var ALBERI={caracalla:26, diocleziano:24, traiano:16, termecostantino:7, colosseo:12, circo:14, domiziano:9, fori:10, forotraiano:8, foroaugusto:5, forocesare:5, pace:8, palatino:14,
    marcello:5, pompeo:10, balbo:5, ottavia:5, saepta:8, ludusmagnus:4, venere:5, emiliarovina:4, sessoriano:6, tiberiana:5, emporio:6};
  function rnd(){ seme=(seme*16807)%2147483647; return (seme-1)/2147483646; }
  function semeDi(id){ var h=2166136261, k; for(k=0;k<id.length;k++){ h^=id.charCodeAt(k); h=Math.imul(h,16777619)>>>0; } return 1+h%2147483645; }      // ogni monumento il suo seme (27 novembre 2026): prima un solo filo di numeri per tutti, e aggiungere un monumento spostava il verde di tutti gli altri
  ruderi.forEach(function(o){ seme=semeDi(o.id);
    var g=o.g.geometry, P0=g.attributes.position.array, T=g.attributes.tipo, alti=[], muri=[], corti=[], bassi=[], at=0, am=0, ac=0, ab=0, i;
    for(i=0;i<P0.length;i+=9){
      var tp=T?Math.round(T.array[i/3])%10%5:0; if(tp!==0&&tp!==3) continue;                                // murature e prati dei cortili: niente coppi, chiome
      if(tp===3){ var qy=(P0[i+1]+P0[i+4]+P0[i+7])/3, qa=Math.abs((P0[i+3]-P0[i])*(P0[i+8]-P0[i+2])-(P0[i+5]-P0[i+2])*(P0[i+6]-P0[i])); if(qa>1e-6&&qy<o.alto*.12){ ac+=qa; corti.push([ac,i]); } continue; }      // cortili e giardini dentro il recinto (25 novembre 2026)
      var ax=P0[i],ay=P0[i+1],az=P0[i+2],bx=P0[i+3],by=P0[i+4],bz=P0[i+5],cx=P0[i+6],cy=P0[i+7],cz=P0[i+8];
      var ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az, nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, a2=Math.hypot(nx,ny,nz); if(a2<1e-6) continue;
      var my=(ay+by+cy)/3;
      if(Math.abs(ny)/a2>.5 && my>o.alto*.12){ at+=a2; alti.push([at,i]); }                                  // piani in alto (le due facce della lastra: la normale può guardare giù)
      else if(ny/a2>.8 && my<=o.alto*.12 && ALBERI[o.id]){ ab+=a2; bassi.push([ab,i]); }                     // piani bassi rivolti in su (arene, piste, pavimenti delle aule): qui crescono gli alberi
      else if(Math.abs(ny)/a2<.25 && Math.max(ay,by,cy)>o.alto*.3){ am+=a2; muri.push([am,i,nx/a2,nz/a2]); }  // pareti abbastanza alte per un rampicante
    }
    function pesca(l,tot){ var x=rnd()*tot, lo=0, hi=l.length-1; while(lo<hi){ var m=(lo+hi)>>1; if(l[m][0]<x) lo=m+1; else hi=m; } return l[lo]; }
    function punto(i){ var r1=rnd(), r2=rnd(); if(r1+r2>1){ r1=1-r1; r2=1-r2; } return [P0[i]+(P0[i+3]-P0[i])*r1+(P0[i+6]-P0[i])*r2, P0[i+1]+(P0[i+4]-P0[i+1])*r1+(P0[i+7]-P0[i+1])*r2, P0[i+2]+(P0[i+5]-P0[i+2])*r1+(P0[i+8]-P0[i+2])*r2]; }
    var n=Math.round((QUANTI[o.id]||40)*quota), k, c=Math.cos(o.g.rotation.y), s=Math.sin(o.g.rotation.y);
    function mondo(p){ return [o.g.position.x+p[0]*c+p[2]*s, o.g.position.y+p[1], o.g.position.z-p[0]*s+p[2]*c]; }
    var kS=Math.min(1,.5+(o.raggio||5)/10);      // sui monumenti piccoli (Minerva Medica) arbusti più piccoli: prima facevano un cappello di palle
    if(alti.length) for(k=0;k<n;k++){ var p=punto(pesca(alti,at)[1]); cespi.push({o:o, p:mondo(p), l:[p[0],p[2]], y:p[1], soglia:rnd(), sc:(.7+rnd()*1.2)*kS, ry:rnd()*6.28, q:rnd()}); }
    if(corti.length) for(k=0;k<Math.round(n*.3);k++){ var pc=punto(pesca(corti,ac)[1]); cespi.push({o:o, p:mondo(pc), l:[pc[0],pc[2]], y:pc[1], soglia:rnd(), sc:1+rnd()*1.4, ry:rnd()*6.28, q:rnd()}); }      // nei cortili gli arbusti si fanno più grandi
    /* edera (27 novembre 2026): metà scende dalle creste dei muri, lunga, metà sale dal piede, più larga; più spessa sui muri che guardano a nord, dove il sole non asciuga
       (la normale del muro nel mondo: z va a sud). Prima le macchie stavano a quota a caso, tutte uguali. Le proporzioni sono una resa. */
    if(muri.length) for(k=0;k<Math.round(n*.5);k++){ var w=pesca(muri,am), t2;
      for(t2=0;t2<3;t2++){ if(rnd()<.35+.65*Math.max(0,w[2]*s-w[3]*c)) break; w=pesca(muri,am); }
      var j=w[1], top=Math.max(P0[j+1],P0[j+4],P0[j+7]), bot=Math.min(P0[j+1],P0[j+4],P0[j+7]), q=punto(j), h=.3+rnd()*.6, appesa=rnd()<.55, fx=appesa?.8+rnd()*.4:1.1+rnd()*.5, fy=appesa?1.4+rnd()*.9:.8+rnd()*.5, mezzo=h*fy*.5;
      q[1]=appesa?top-mezzo*.92:Math.min(bot+mezzo*.95,top-mezzo); viti.push({o:o, p:mondo([q[0]+w[2]*.012,q[1],q[2]+w[3]*.012]), l:[q[0],q[2]], y:q[1]+mezzo, soglia:rnd(), h:h, fx:fx, fy:fy, ry:Math.atan2(w[2]*c+w[3]*s,-w[2]*s+w[3]*c), q:rnd()}); }
    /* alberi (27 novembre 2026): nei cortili, nelle arene, sulle piste e sui pavimenti delle aule, pochi e grandi, ognuno al suo posto (seme del monumento) */
    var na=Math.round((ALBERI[o.id]||0)*(tel?.5:1)), lb=corti.length?corti:bassi, tb=corti.length?ac:ab;
    if(lb.length) for(k=0;k<na;k++){ var pa=punto(pesca(lb,tb)[1]); alberi.push({o:o, p:mondo(pa), l:[pa[0],pa[2]], y:pa[1], soglia:rnd(), sc:1.2+rnd()*.6, fx:.8+rnd()*.5, fz:.8+rnd()*.5, ry:rnd()*6.28, q:rnd()}); }
  });
  if(!cespi.length&&!viti.length) return;
  var Bc=new RM.Costruttore(), Bv=new RM.Costruttore(), sg=tel?[5,2]:[6,3], rovo=RM.col(0x4c5a30), secco=RM.col(0x75744a), edera=RM.col(0x3a4f2a);
  Bc.geo(new THREE.SphereGeometry(.14,sg[0],sg[1]).scale(1.3,.75,1.1).translate(0,.05,0),rovo);                       // un cespuglio largo da tre a sette metri
  if(!tel) Bc.geo(new THREE.SphereGeometry(.09,5,2).scale(1.2,.9,1).translate(.13,.06,.05),secco);
  Bv.geo(new THREE.SphereGeometry(.5,6,3).scale(.6,1,.08),edera);                                                      // una macchia d'edera alta da tre a nove metri (27 novembre 2026: sei spicchi e tre fasce, 24 triangoli invece di 30: è piatta, le fasce non si vedono)
  function maglia(B,N,ombra){ var m=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),Math.max(1,N)); m.castShadow=ombra; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='monumenti'; RM.scene.add(m); return m; }
  var mc=maglia(Bc,cespi.length,!tel), mv=maglia(Bv,viti.length,false), d=new THREE.Object3D(), ultimo=-1;
  /* quanto verde c'è in quell'anno: da zero all'abbandono a pieno trecento anni dopo; zero se l'edificio torna in uso (il Pantheon chiesa) */
  function crescita(o,anno){ var rv=RM.rovina(o.id,anno), a=rv.ritorno!=null?Math.min(anno,rv.ritorno-.01):anno, st=D.MONUMENTI[o.id], dc=null, k;      // rv.ritorno c'è solo se il monumento è ancora in uso (si veda RM.rovina)      // tornato in uso (RIUSO): il verde di quel momento, tolto via via che si pulisce (26 novembre 2026: prima spariva in un istante)
    for(k=0;k<st.length;k++){ if(a<st[k][0]) break; if(st[k][1]==='uso') dc=null; else if(st[k][1]!=='assente'&&dc==null) dc=st[k][0]; }      // dal 27 novembre 2026 da qualunque uscita dall'uso (VERDE_OVUNQUE)
    return dc==null||!o.g.visible?0:(MISURA[o.id]||1)*(.15+.85*RM.sfuma(0,300,a-dc))*RM.sfuma(0,25,a-dc)*(1-(rv.pulito||0)); }
  /* Si disegnano solo le istanze che si vedono, in fila (m.count): prima si disegnavano tutte, anche quelle a grandezza zero (circa 110.000 triangoli nel caso peggiore).
     Il gradino della qualità ne tiene una parte (RM.QUALITA.verde: 45% in «bassa», 70% sul «telefono»), scelta a caso una volta per tutte (campo q). */
  function posa(m,el,anno,alto,fr){
    var g={}, rc={}, j=0; el.forEach(function(e){
      var o=e.o; if(g[o.id]==null){ g[o.id]=crescita(o,anno); rc[o.id]=RM.rovina(o.id,anno); }
      var v=Math.max(0,Math.min(1,(g[o.id]-e.soglia)*5)); if(e.y>o.alto*(1-crolloJS(o,e.l[0],e.l[1],rc[o.id])) || e.q>=fr) v=0; if(v<=0) return;      // sopra la quota del taglio dello shader la cima è caduta: lì niente verde
      d.position.set(e.p[0],e.p[1],e.p[2]); d.rotation.set(0,e.ry,0); var sc=(alto?e.h:e.sc)*(.35+.65*v); d.scale.set(sc*(e.fx||1),sc*(e.fy||1),sc); d.updateMatrix(); m.setMatrixAt(j++,d.matrix); });
    m.count=j; m.visible=j>0; m.instanceMatrix.needsUpdate=true; }
  var qUltimo=-1;
  function quotaQ(){ var t=RM.QUALITA&&RM.QUALITA.verde; return t&&t[RM.q]!=null?t[RM.q]:1; }
  var passoVerde={};      // nel viaggio fra due tappe al più otto volte al secondo; all'arrivo sempre (RM.saltaPasso in js/base.js)
  RM.moduli.push(function(anno){ var fr=quotaQ(); if(Math.abs(anno-ultimo)<.05 && fr===qUltimo) return; if(RM.saltaPasso && RM.saltaPasso(passoVerde,125)) return; ultimo=anno; qUltimo=fr; posa(mc,cespi,anno,false,fr); posa(mv,viti,anno,true,fr); });
  RM.frame.push(function(){ var t=RM.QUALITA&&RM.QUALITA.degrado, dq=t&&t[RM.q]!=null?t[RM.q]:1; if(dq!==RM.degradoQ.value) RM.degradoQ.value=dq;      // il dettaglio dello shader dell'abbandono segue il gradino
    if(quotaQ()!==qUltimo && ultimo>=0){ qUltimo=quotaQ(); posa(mc,cespi,ultimo,false,qUltimo); posa(mv,viti,ultimo,true,qUltimo); RM.renderer.shadowMap.needsUpdate=true; } });
  /* gli alberi: un tronco e una chioma di cinque masse a faccette (non una palla), due verdi; alti da 12 a 20 m (lecci e fichi dei ruderi arrivano a tanto). Spuntano quando il verde del monumento è avanti (crescita oltre
     0,35-0,65 secondo l'albero), poi crescono. */
  var Ba=new RM.Costruttore(), fogA=RM.col(0x3d5629), fogB=RM.col(0x56683a), legno=RM.col(0x4b3c2b), ma=null;
  if(alberi.length){
    Ba.geo(new THREE.CylinderGeometry(.035,.06,.62,5).translate(0,.31,0),legno);
    [[0,.78,0,.32,.26,fogA],[.2,.66,.1,.24,.2,fogB],[-.18,.7,-.08,.25,.21,fogA],[.05,.62,-.22,.22,.18,fogB],[-.06,.95,.06,.2,.17,fogB]].forEach(function(b){
      Ba.geo(new THREE.IcosahedronGeometry(1,0).scale(b[3],b[4],b[3]*.95).rotateY(b[0]*7).translate(b[0],b[1],b[2]),b[5]); });
    ma=maglia(Ba,alberi.length,!tel);
  }
  var ultimoA=-1, qA=-1;
  function posaAlberi(anno,fr){ if(!ma) return; var g={}, rc={}, j=0;
    alberi.forEach(function(e){ var o=e.o; if(g[o.id]==null){ g[o.id]=crescita(o,anno); rc[o.id]=RM.rovina(o.id,anno); }
      var v=Math.max(0,Math.min(1,(g[o.id]-(.35+.3*e.soglia))*4)); if(e.y>o.alto*(1-crolloJS(o,e.l[0],e.l[1],rc[o.id])) || e.q>=fr) v=0; if(v<=0) return;
      var sc=e.sc*(.4+.6*v); d.position.set(e.p[0],e.p[1],e.p[2]); d.rotation.set(0,e.ry,0); d.scale.set(sc*e.fx,sc,sc*e.fz); d.updateMatrix(); ma.setMatrixAt(j++,d.matrix); });
    ma.count=j; ma.visible=j>0; ma.instanceMatrix.needsUpdate=true; }
  RM.moduli.push(function(anno){ var fr=quotaQ(); if(Math.abs(anno-ultimoA)<.05 && fr===qA) return; ultimoA=anno; qA=fr; posaAlberi(anno,fr); });
  RM.frame.push(function(){ if(ultimoA>=0 && quotaQ()!==qA){ qA=quotaQ(); posaAlberi(ultimoA,qA); } });
  M.forEach(function(o){ if(o.id==='testaccio'&&o.mat&&o.mat.userData.u.uMole) o.mat.userData.u.uMole.value=0; });      // il monte di cocci non prende la luce delle moli (MOLE in js/costruttore.js)
  RM.verdeRuderi={cespugli:mc, rampicanti:mv, alberi:ma, listaAlberi:alberi, quanti:cespi.length+viti.length+alberi.length};      // per le prove: nasconderli mostra lo stato «abbandonato» senza il verde
})();
/* MULINI_RUOTE (27 novembre 2026): la ruota a pale fra le due barche di ogni coppia, che la corrente fa girare (Procopio, Guerra gotica I 19, 22: «all the wheels, one after
   the other, were made to revolve independently»). Una maglia a parte, figlia del monumento (ne segue la visibilità), che gira attorno al suo albero; ferma con «meno
   animazioni» e negli anni delle piene (EVENTI con piena), quando il Tevere in piena portava via tutto: che allora i mulini si fermassero è una scelta del modello. Forma, otto pale e velocità
   (mezzo giro ogni sei secondi circa, una corrente di un metro al secondo) sono SCHEMA. */
(function(){
  var o=M.filter(function(q){ return q.id==='mulini'&&q.g; })[0]; if(!o) return;
  var legno=RM.col(0x5e4831), r=.21, k, parti=[];
  for(k=0;k<8;k++){ var a=k*PI/4, gB=new THREE.BoxGeometry(.012,.07,.06).translate(0,r-.035,0).rotateZ(a); parti.push(gB); var gR=new THREE.BoxGeometry(.014,r,.012).translate(0,r/2,0).rotateZ(a); parti.push(gR); }
  var B2=new RM.Costruttore(); B2.geo(new THREE.CylinderGeometry(.04,.04,.08,8).rotateX(PI/2),legno); parti.forEach(function(g){ B2.geo(g,legno); });
  var geo=B2.geometria(), mat=RM.matPietra(), ruote=[];
  var im=new THREE.InstancedMesh(geo,mat,MULINI_X.length), d=new THREE.Object3D(), ang=0; im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; o.g.add(im);      // le cinque ruote in un solo disegno
  function posa(){ MULINI_X.forEach(function(lx,i){ d.position.set(lx,.74+.14,0); d.rotation.set(0,0,ang+lx); d.updateMatrix(); im.setMatrixAt(i,d.matrix); }); im.instanceMatrix.needsUpdate=true; }
  posa(); ruote.push(im);
  var MENO=!!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) && !/[?&]moto=1/.test(location.search);
  var PIENE=(D.EVENTI||[]).filter(function(e){ return e.piena; }), ferme=false;
  RM.moduli.push(function(anno){ ferme=PIENE.some(function(e){ return anno>=e.da-.5 && anno<e.a+.5; }); });
  RM.frame.push(function(dt){ if(MENO||ferme||!o.g.visible) return; ang+=.5*Math.min(dt,.1); posa(); });      // il fondo della ruota va con la corrente, verso +x
  RM.muliniRuote=ruote;      // per le prove
})();

/* ---------- le macerie dei crolli ----------
   26 novembre 2026, insieme ai crolli continui (rmCrollo in js/costruttore.js): dove un terremoto fa cadere volte e muri (stato «crollato»: Massenzio, terme di Caracalla,
   Venere e Roma nell'847) le macerie restano al piede e dentro le navate: cumuli bassi e sformati, posati dove il taglio è più profondo (crolloJS), sul piano più alto che
   resta sotto la rottura (il pavimento della navata, una terrazza, il suolo fuori). Per Caracalla Platner e Ashby (Thermae Antoninianae) dicono di una colonna del cortile
   che poggia su un cumulo di macerie dell'847; per gli altri è la conseguenza del crollo, non una notizia. Forma, numero e grandezza dei cumuli sono una resa.
   San Paolo no: nell'801 cade il tetto e le sue travi stanno nella scena della tappa (js/scene-tappe.js). Poche decine di istanze per monumento, una sola maglia. */
(function(){
  var cad=M.filter(function(o){ var st=D.MONUMENTI[o.id], cr=CROLLI[o.id]; return o.g&&st&&!(cr&&cr.muri===0)&&st.some(function(q){ return q[1]==='crollato'; }); });
  if(!cad.length) return;
  var tel=RM.piccolo, el=[], seme=11;
  function rnd(){ seme=(seme*16807)%2147483647; return (seme-1)/2147483646; }
  cad.forEach(function(o){
    var st=D.MONUMENTI[o.id], yc=st.filter(function(q){ return q[1]==='crollato'; })[0][0], rv=RM.rovina(o.id,yc+1), g=o.g.geometry, P0=g.attributes.position.array, bb=g.boundingBox, piani=[], i;
    for(i=0;i<P0.length;i+=9){ var ux=P0[i+3]-P0[i],uy=P0[i+4]-P0[i+1],uz=P0[i+5]-P0[i+2],vx=P0[i+6]-P0[i],vy=P0[i+7]-P0[i+1],vz=P0[i+8]-P0[i+2], nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, a2=Math.hypot(nx,ny,nz);
      if(a2>1e-6 && Math.abs(ny)/a2>.9) piani.push(i); }      // i piani orizzontali, dove un cumulo può posarsi
    function suolo(x,z,sopra){ var y=-1, j; for(j=0;j<piani.length;j++){ var i=piani[j], ax=P0[i],az=P0[i+2],bx=P0[i+3],bz=P0[i+5],cx=P0[i+6],cz=P0[i+8], yy=(P0[i+1]+P0[i+4]+P0[i+7])/3; if(yy<=y||yy>sopra) continue;
        var d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz); if(Math.abs(d)<1e-9) continue; var l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d, l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d; if(l1>=0&&l2>=0&&l1+l2<=1) y=yy; }
      return y; }      // -1: nessun piano del monumento sotto il punto (fuori dalla pianta)
    var passo=Math.min(.7,Math.max(.35,o.raggio/12)), cand=[], x, z;      // cumuli da quattro a quindici metri, anche sulle terme grandi
    for(x=bb.min.x-.4;x<=bb.max.x+.4;x+=passo) for(z=bb.min.z-.4;z<=bb.max.z+.4;z+=passo){ var xx=x+(rnd()-.5)*passo, zz=z+(rnd()-.5)*passo, dd=crolloJS(o,xx,zz,rv,true); if(dd>.3) cand.push([dd+rnd()*.15,xx,zz,dd]); }
    cand.sort(function(a,b){ return b[0]-a[0]; });
    var n=tel?30:70, c=Math.cos(o.g.rotation.y), s=Math.sin(o.g.rotation.y), presi=0;
    for(i=0;i<cand.length&&presi<n&&i<n*4;i++){ var q=cand[i], y=suolo(q[1],q[2],o.alto*(1-q[3])-.05), w=passo*(1.3+.9*rnd())*(.7+q[3]); if(y<0) continue; presi++;      // solo sopra i piani del monumento (fuori, sulla strada, no); al più quattro prove per cumulo, perché suolo scorre tutti i piani
      el.push({o:o, yc:yc, p:[o.g.position.x+q[1]*c+q[2]*s, o.g.position.y+y, o.g.position.z-q[1]*s+q[2]*c], w:w, h:w*(.22+.2*rnd())*Math.min(1,.4+q[3]), ry:rnd()*6.28, t:rnd()}); }
  });
  if(!el.length) return;
  var B=new RM.Costruttore(), ico=new THREE.IcosahedronGeometry(.5,1), pa=ico.attributes.position, k, r2=RM.casuale?RM.casuale(5):rnd;
  for(k=0;k<pa.count;k++){ var f=.75+.5*r2(); pa.setXYZ(k,pa.getX(k)*f,Math.max(0,pa.getY(k))*f,pa.getZ(k)*f); }      // sformato e con la base piatta
  ico.computeVertexNormals(); B.geo(ico,P.selce);
  var m=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),el.length); m.castShadow=!tel; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='monumenti'; RM.scene.add(m);
  var NUC=RM.col(0xc9bca6), MAT=RM.col(0xc49478), cc=new THREE.Color(), d=new THREE.Object3D(), ultimo=-1;
  el.forEach(function(e,j){ e.col=new THREE.Color().copy(NUC).lerp(MAT,e.t*.6); m.setColorAt(j,e.col); });      // calcestruzzo e mattone: il nucleo e il paramento dei muri caduti (i colori ci sono prima del primo disegno: three r128 non rifà il programma se arrivano dopo)
  RM.moduli.push(function(anno){ if(Math.abs(anno-ultimo)<.05) return; ultimo=anno; var j=0;
    el.forEach(function(e){ var v=e.o.g.visible?RM.sfuma(e.yc-.4,e.yc+.1,anno):0; if(v<=0) return;      // arrivano con il crollo
      d.position.set(e.p[0],e.p[1],e.p[2]); d.rotation.set(0,e.ry,0); d.scale.set(e.w*v,e.h*v,e.w*.8*v); d.updateMatrix(); m.setColorAt(j,cc.copy(e.col).multiply(e.o.mat.color)); m.setMatrixAt(j++,d.matrix); });
    m.count=j; m.visible=j>0; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; });
  RM.macerieCrolli={maglia:m, quante:el.length};      // per le prove
})();

/* ---------- le iscrizioni e il timpano del Pantheon ----------
   24 novembre 2026, l'utente: «verifica se sul Pantheon deve esserci la scritta sul timpano». Platner e Ashby, «Pantheon» (letto quel giorno): l'iscrizione di Agrippa,
   «M. Agrippa L. f. cos. tertium fecit», sta sul fregio del pronao (CIL VI 896); sotto, sull'architrave, quella più piccola del restauro di Settimio Severo e Caracalla del 202;
   nel timpano «were bronze decorations», di forma non detta. Qui: la scritta di Agrippa sul fregio, in lettere scure, disegnata su una tela (una lastra di due triangoli,
   con le mipmap: da lontano sfuma invece di brulicare); le due righe dell'architrave sono solo un segno di scrittura minuta, non un testo; nel timpano un tondo di bronzo,
   che indica la decorazione di forma ignota (qui fino al 663, quando Costante II porta via «omnia quae erant in aere ad ornatum civitatis», Liber Pontificalis, vita di
   Vitaliano: che la decorazione fosse fra queste è un'ipotesi). Le lettere ci sono per tutto il periodo: se fossero di bronzo e quando sparirono non lo dice nessuna fonte letta. */
(function(){
  var o=M.filter(function(m){ return m.id==='pantheon'; })[0]; if(!o||!o.g||!document.createElement('canvas').getContext) return;
  var cv=document.createElement('canvas'); cv.width=2048; cv.height=256; var cx=cv.getContext('2d'); if(!cx) return;
  var LARGO=3.2, ALTO=.137, sx=(cv.width/LARGO)/(cv.height/ALTO);      // la tela è più schiacciata del vero: si scrive in un riferimento dove x e y hanno la stessa misura
  cx.fillStyle='rgb(58,44,28)'; cx.textBaseline='alphabetic';
  cx.setTransform(sx,0,0,1,0,0); cx.font='bold 150px Georgia, "Times New Roman", serif';
  var T='M·AGRIPPA·L·F·COS·TERTIVM·FECIT', W=cv.width/sx, usa=W*.84, w0=0, k;
  for(k=0;k<T.length;k++) w0+=cx.measureText(T[k]).width;
  var spazio=(usa-w0)/(T.length-1), xx=(W-usa)/2;
  for(k=0;k<T.length;k++){ cx.fillText(T[k],xx,150); xx+=cx.measureText(T[k]).width+spazio; }
  var r=RM.casuale(202); cx.fillStyle='rgba(58,44,28,.8)';      // l'architrave: due righe di segni minuti, che da vicino si leggono come scrittura e non come testo
  [205,240].forEach(function(y){ for(var x=W*.06;x<W*.94;){ var l=14+r()*22; if(r()<.12){ x+=30; continue; } cx.fillRect(x,y-22,l,22); x+=l+9; } });
  var tx=new THREE.CanvasTexture(cv); tx.anisotropy=Math.min(8,RM.renderer.capabilities.getMaxAnisotropy());
  var lastra=new THREE.Mesh(new THREE.PlaneGeometry(LARGO,ALTO),new THREE.MeshLambertMaterial({map:tx,transparent:true,alphaTest:.25,depthWrite:false}));
  lastra.position.set(0,1.553+ALTO/2,5.207); o.g.add(lastra);      // il fronte della trabeazione sta a z 5,2 nel riferimento del Pantheon; il pronao guarda +z
  var tondo=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.014,20),new THREE.MeshLambertMaterial({color:P.bronzo}));
  tondo.rotation.x=Math.PI/2; tondo.position.set(0,1.965,5.247); o.g.add(tondo);      // il timpano del pronao: triangolo a z 5,24, da quota 1,745 a 2,425
  RM.moduli.push(function(anno){ tondo.visible=anno<663; });
})();

/* ---------- l'acqua della Meta Sudans ----------
   «Sudans described the appearance of the jets of water» (Platner e Ashby): l'acqua esce in cima e scende lungo il cono, a rivoli, fino alla vasca. Qui è una pelle trasparente
   sopra il cono, con i rivoli che scorrono, e uno specchio d'acqua nella vasca, con i cerchi che si allargano. Quanti fossero i rivoli e come uscisse l'acqua non si sa: è uno
   schema. Dal 537, tagliati gli acquedotti, la fontana è asciutta. (23 novembre 2026, l'utente: «La Meta Sudans con l'acqua che scende?») */
(function(){
  var o=M.filter(function(m){ return m.id==='metasudans'; })[0]; if(!o||!o.g) return;
  var NL=String.fromCharCode(10), uF={value:1}, uG={value:0}, uN={value:0}, gr=new THREE.Group(); gr.position.copy(o.g.position); RM.scene.add(gr);
  var VS='varying vec2 vUv; varying vec2 vP; void main(){ vUv=uv; vP=position.xz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var matCono=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; varying vec2 vUv;',
    'float hh(float n){ return fract(sin(n*127.1)*43758.5453); }',
    'void main(){ float n=18.0; float c=floor(vUv.x*n); float f=fract(vUv.x*n); float giu=1.0-vUv.y;',                                                  // giu: 0 in cima, 1 al piede
    '  float larg=0.2+0.28*hh(c+3.0); float riv=smoothstep(larg,0.0,abs(f-0.5+0.12*sin(giu*9.0+hh(c)*6.28)));',                                       // ogni rivolo ha la sua larghezza e serpeggia un poco
    '  float vel=1.2+0.9*hh(c);',
    '  float onde=0.5+0.5*sin(giu*30.0-uTempo*vel*3.4+hh(c+7.0)*6.28);',                                                                              // le onde scendono
    '  float gocce=smoothstep(0.7,1.0,sin(giu*85.0-uTempo*vel*8.0+hh(c+1.0)*6.28));',
    '  float a=(0.05+riv*(0.3+0.34*onde+0.36*gocce))*uForza;',
    '  vec3 col=mix(vec3(0.60,0.80,0.86),vec3(0.96,0.99,1.0),riv*(0.35*onde+0.65*gocce));',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),a); }'].join(NL)});
  var matVasca=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN,uR0:{value:.4}},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; uniform float uR0; varying vec2 vP;',
    'void main(){ float r=length(vP); float an=atan(vP.y,vP.x);',
    '  float cerchi=0.5+0.5*sin(r*46.0-uTempo*3.2+0.6*sin(an*7.0));',                                                                                // i cerchi si allargano dal piede del cono
    '  float schiuma=smoothstep(uR0+0.12,uR0,r)*(0.55+0.45*sin(an*22.0+uTempo*7.0+r*80.0));',                                                         // dove l'acqua cade
    '  vec3 col=vec3(0.40,0.60,0.64)*(0.86+0.2*cerchi)+vec3(0.5,0.52,0.52)*schiuma;',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),0.93*uForza); }'].join(NL)});
  var cono=new THREE.Mesh(new THREE.LatheGeometry([[.318,0],[.303,.25],[.27,.5],[.218,.75],[.148,.98],[.093,1.12],[.078,1.16]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),36).translate(0,.63,0),matCono);
  var piede=new THREE.Mesh(new THREE.LatheGeometry([[.4,0],[.385,.34],[.39,.4],[.318,.42]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),36).translate(0,.2,0),matCono);      // il velo continua sullo zoccolo
  var matGrande=matVasca.clone(); matGrande.uniforms.uTempo=RM.tempoAcqua; matGrande.uniforms.uForza=uG; matGrande.uniforms.uNotte=uN; matGrande.uniforms.uR0={value:.7};
  var piccola=new THREE.Mesh(new THREE.RingGeometry(.4,.6,40).rotateX(-Math.PI/2).translate(0,.175,0),matVasca);
  var grande=new THREE.Mesh(new THREE.RingGeometry(.66,.97,48).rotateX(-Math.PI/2).translate(0,.165,0),matGrande);
  [cono,piede,piccola,grande].forEach(function(m){ m.renderOrder=3; gr.add(m); });
  var secca=((D.MONUMENTI.metasudans||[]).filter(function(q){ return q[1]==='chiuso'; })[0]||[537])[0];
  RM.moduli.push(function(anno){
    var f=1-RM.sfuma(secca-.3,secca+.2,anno), st=RM.statoMonumento('metasudansvasca',anno), g=(st.s0==='assente'?(st.s1==='assente'?0:st.t>.98?1:0):1)*f;
    uF.value=f; uG.value=g; uN.value=RM.notte||0; gr.visible=f>.01; grande.visible=g>.01;
  });
})();

/* ---------- l'acqua degli horti (26 novembre 2026) ----------
   Le cascate del ninfeo dei Sallustiani, le sue vasche e le tre piscine, e la vasca del ninfeo ottagonale degli Acilii (ACQUE_HORTI, si veda «gli horti: come si costruiscono»).
   Si muove come quella della Meta Sudans (stesso tempo, RM.tempoAcqua): rivoli che scendono, increspature sugli specchi. Come la Meta Sudans si ferma quando i Goti tagliano
   gli acquedotti (il primo «chiuso» degli acquedotti in js/dati.js, il 537): dopo restano le vasche vuote. Se dopo il 410 qualcuno curasse ancora le fontane dei Sallustiani
   non lo dice nessuna fonte letta: qui l'acqua corre finché arriva. Rivoli e increspature sono uno schema. */
(function(){
  if(!ACQUE_HORTI.length) return;
  var NL=String.fromCharCode(10), uF={value:1}, uN={value:0}, gr=new THREE.Group(); RM.scene.add(gr);
  var VS='varying vec2 vUv; varying vec2 vP; void main(){ vUv=uv; vP=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var matCascata=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; varying vec2 vUv;',
    'float hh(float n){ return fract(sin(n*127.1)*43758.5453); }',
    'void main(){ float n=7.0; float c=floor(vUv.x*n); float f=fract(vUv.x*n); float giu=1.0-vUv.y;',
    '  float riv=smoothstep(0.42,0.05,abs(f-0.5+0.1*sin(giu*7.0+hh(c)*6.28)));',
    '  float vel=1.3+0.8*hh(c); float onde=0.5+0.5*sin(giu*26.0-uTempo*vel*3.6+hh(c+7.0)*6.28);',
    '  float gocce=smoothstep(0.7,1.0,sin(giu*70.0-uTempo*vel*8.0+hh(c+1.0)*6.28));',
    '  float a=(0.22+riv*(0.32+0.26*onde+0.3*gocce))*uForza;',
    '  vec3 col=mix(vec3(0.58,0.78,0.84),vec3(0.96,0.99,1.0),riv*(0.35*onde+0.65*gocce));',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),a); }'].join(NL)});
  var matSpecchio=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; varying vec2 vUv; varying vec2 vP;',
    'void main(){ float o=sin(vP.x*34.0+uTempo*1.6)*sin(vP.y*27.0-uTempo*1.2)+0.6*sin((vP.x-vP.y)*52.0-uTempo*2.3);',      // increspature del vento: lente, incrociate
    '  float l=smoothstep(0.85,1.6,o);',
    '  vec3 col=vec3(0.33,0.54,0.6)*(0.9+0.07*o)+vec3(0.35,0.37,0.36)*l;',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),0.9*uForza); }'].join(NL)});
  ACQUE_HORTI.forEach(function(a){ var g, m;
    if(a.tipo==='cascata'){ g=new THREE.PlaneGeometry(a.w,a.h); m=new THREE.Mesh(g,matCascata); }
    else if(a.tipo==='specchio'){ g=new THREE.PlaneGeometry(a.w,a.d); m=new THREE.Mesh(g,matSpecchio); m.rotation.x=-Math.PI/2; }
    else { g=new THREE.CircleGeometry(a.r,a.lati||24); m=new THREE.Mesh(g,matSpecchio); m.rotation.x=-Math.PI/2; }
    var piv=new THREE.Group(); piv.position.set(a.x,a.y,a.z); piv.rotation.y=a.ry||0; piv.add(m); m.renderOrder=3; gr.add(piv); });
  var secca=((D.MONUMENTI.acquedotti||[]).filter(function(q){ return q[1]==='chiuso'; })[0]||[537])[0];
  RM.moduli.push(function(anno){ var f=1-RM.sfuma(secca-.3,secca+.2,anno); uF.value=f; uN.value=RM.notte||0; gr.visible=f>.01; });
  RM.acqueHorti=gr;      // per le prove
  var cs=M.filter(function(o){ return o.id==='casasallustio'; })[0]; if(cs&&cs.g) RM.cliccabili=(RM.cliccabili||[]).concat([{maglia:cs.g, id:'hortisallustiani'}]);      // la casa di Sallustio apre la scheda degli horti
})();

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
var v=new THREE.Vector3(), rqW=-1, rqH=-1;
if(window.ResizeObserver) new ResizeObserver(function(){ rqW=riquadro.clientWidth; rqH=riquadro.clientHeight; }).observe(riquadro);      // 27 novembre 2026, notte: la misura del riquadro letta solo quando cambia, non a ogni fotogramma (una lettura dell'impaginazione nel ciclo, dopo gli stili scritti dalle etichette, obbliga il browser a ricalcolarli)
var firmaEt=new Float64Array(26), firmaNuova=new Float64Array(26);      // 28 novembre 2026, notte: a camera ferma (stessa camera, stesso riquadro, stessi posti riservati, stesse presenze) le etichette restano dove sono e il conto si salta: sul banco da telefono mezzo millesimo a fotogramma a 4x
RM.frame.push(function(){
  var w0=rqW>=0?rqW:riquadro.clientWidth, h0=rqH>=0?rqH:riquadro.clientHeight, cm=RM.camera.matrixWorld.elements, cp=RM.camera.projectionMatrix.elements, pr=RM.postiRiservati||[], f=firmaNuova, i0, pres=0;
  for(i0=0;i0<16;i0++) f[i0]=cm[i0]; f[16]=cp[0]; f[17]=cp[5]; f[18]=cp[8]; f[19]=cp[9]; f[20]=w0; f[21]=h0;
  for(i0=0;i0<M.length;i0++) if(M[i0].div) pres+=(M[i0].presenza||0)*(i0+1);
  f[22]=pres; f[23]=pr.length; f[24]=pr.length?pr[0][0]+3.1*pr[0][1]+7.3*pr[0][2]+11.7*pr[0][3]:0; f[25]=RM.scene.position.y;
  var uguale=true; for(i0=0;i0<26;i0++) if(f[i0]!==firmaEt[i0]){ uguale=false; break; }
  if(uguale) return; firmaEt.set(f);
  var w=w0, h=h0, messi=pr.slice();      // posti riservati: il nome del Campidoglio (js/strade-nomi.js), a cui i monumenti vicini cedono il posto (27 novembre 2026); messi: i rettangoli delle etichette già visibili; una che ne coprirebbe un'altra si nasconde (23 novembre 2026: le due scholae si accavallavano)
  M.forEach(function(o){
    if(!o.div) return;
    var ex=o.ex!=null?o.ex:o.x, ez=o.ez!=null?o.ez:o.z, ey=o.ey!=null?o.ey:7;      // ex, ez: dove sta il nome, se non al centro del gruppo; ey: a che altezza sopra il gruppo (di norma 70 m; 27 novembre 2026)
    v.set(ex,o.g.position.y+ey,ez).applyMatrix4(RM.camera.matrixWorldInverse); var davanti=v.z<-2;      // dietro la camera non si proietta
    v.set(ex,o.g.position.y+ey,ez).project(RM.camera);
    var vis=o.presenza>.5 && davanti && v.z<1 && Math.abs(v.x)<.8 && v.y>-.9 && v.y<.88 && !(v.y>.3 && v.x<-.1) && (o.et || Math.hypot(RM.camera.position.x-o.x,RM.camera.position.y,RM.camera.position.z-o.z)<(o.raggio>6?150:95));   // non sui bordi né sopra il contatore; i monumenti minori hanno il nome solo da vicino
    var px=(v.x+1)*w/2, py=(1-v.y)*h/2;
    if(vis){ if(!o.lw){ o.lw=o.div.offsetWidth||o.div.textContent.length*7; o.lh=o.div.offsetHeight||16; }
      var r=[px-o.lw/2-4,py-o.lh-2,px+o.lw/2+4,py+2];
      for(var k=0;k<messi.length;k++){ var q=messi[k]; if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]){ vis=false; break; } }
      if(vis) messi.push(r); }
    if(o.visEt!==vis){ o.visEt=vis; o.div.style.opacity=vis?1:0; o.div.style.visibility=vis?'visible':'hidden'; }      // si scrive solo ciò che cambia (26 novembre 2026): a camera ferma nessuno stile da ricalcolare
    if(vis){ var tr='translate(-50%,-100%) translate('+px.toFixed(1)+'px,'+py.toFixed(1)+'px)'; if(o.trEt!==tr){ o.trEt=tr; o.div.style.transform=tr; } }
  });
  RM.etichetteMesse=messi.slice((RM.postiRiservati||[]).length);      // i nomi delle strade (js/strade-nomi.js) li scansano: i monumenti hanno la precedenza
});
})();
