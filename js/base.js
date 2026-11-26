/* Base della scena: renderer, luce radente con ombre, cielo, terreno con i colli, Tevere, strade.
   Unità: 1 = 10 metri. Origine = Foro Romano (41.8925 N, 12.4853 E). x cresce verso est, z verso sud.
   Tevere, mura e quote del terreno sono dati reali (js/roma-topo.js, generato da src/roma/genera.mjs);
   le strade seguono le vie moderne eredi di quelle antiche, con tratti a mano dove non ce n'è una. */
(function(){
'use strict';
var RM = window.RM = { moduli:[], zone:[], frame:[] };
var D0=window.RM_DATI||{};
RM.ll=function(lat,lon){ return [(lon-12.4853)*8287, -(lat-41.8925)*11113.2]; };       // da coordinate geografiche a coordinate della scena

/* ---- geografia ---- */
var TOPO=window.RM_TOPO;
RM.FIUME = TOPO.fiume;
RM.MURA = TOPO.mura;
/* vie principali: tengono liberi gli isolati e disegnano la città. Dove esiste, è il tracciato della via moderna che ricalca l'antica
   (via del Corso per la via Lata, via dei Coronari per la via Recta, l'Appia Antica…); dove manca, un tratto a mano fra punti noti.
   L'elenco, con le vie moderne usate, è in src/roma/genera.mjs: prima le vie consolari, poi quelle strette del centro antico (via Sacra, Argileto, vici e clivi). */
RM.STRADE = TOPO.strade;
/* giardini dei colli: verdi dal principio alla fine */
RM.HORTI = [[80,-167,20],[-36,-194,19],[138,-22,12],[171,-28,11],[221,-11,12],[20,-170,13],[236,48,9],[-150,120,12]];   // Sallustiani, Pincio, Mecenate, Lamiani, Liciniani, Luculliani, Spes Vetus, Cesare
/* dove la città resiste fino alla fine: ansa del Tevere, Trastevere, poli cristiani */
RM.NUCLEI = [[-102,-56,1,30],[-77,-22,1,26],[-115,40,.97,26],[-35,35,.97,20],[169,73,.97,13],[-240,-108,.5,30]]      // [x, z, tenuta, raggio]: Campo Marzio, Circo Flaminio, Trastevere, Ripa e Velabro, Laterano, Vaticano
  .concat((D0.CHIESE||[]).map(function(c){ var p=RM.ll(c[1],c[2]); return [p[0],p[1],.97,11]; }));               // e un piccolo nucleo attorno a ogni chiesa: l'abitato «a isole» dell'alto medioevo
function distSeg(px,pz,a,b){
  var dx=b[0]-a[0], dz=b[1]-a[1], t=((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz);
  t=Math.max(0,Math.min(1,t));
  var x=a[0]+t*dx-px, z=a[1]+t*dz-pz;
  return Math.sqrt(x*x+z*z);
}
/* Distanza da una spezzata. Dal 26 novembre 2026 i tratti stanno in pacchi di otto con il loro rettangolo: un pacco il cui rettangolo è più lontano della distanza già
   trovata non può darne una minore e si salta (con un margine, perché l'arrotondamento non decida al posto della geometria). Si comincia dal pacco che ha vinto la volta
   prima: il suolo, le case e i passanti chiedono punti vicini uno dopo l'altro. Il risultato è lo stesso numero di prima, bit per bit (il minimo non dipende dall'ordine);
   all'apertura della pagina le chiamate (Tevere, mura, strade) costavano circa un quarto di secondo. */
var PACCHI_LINEA=new WeakMap();
function pacchiLinea(linea,chiusa){
  var c=PACCHI_LINEA.get(linea), n=linea.length, fine=chiusa?n:n-1, i, k, a, b, p;
  if(c && c.n===n && c.chiusa===chiusa) return c;
  c={n:n, chiusa:chiusa, p:[], ultimo:0};
  for(i=0;i<fine;i+=8){ p={da:i, a:Math.min(fine,i+8), x0:1e9, x1:-1e9, z0:1e9, z1:-1e9};
    for(k=p.da;k<p.a;k++){ a=linea[k]; b=linea[(k+1)%n]; p.x0=Math.min(p.x0,a[0],b[0]); p.x1=Math.max(p.x1,a[0],b[0]); p.z0=Math.min(p.z0,a[1],b[1]); p.z1=Math.max(p.z1,a[1],b[1]); if(a[0]===b[0]&&a[1]===b[1]) c.nulla=true; }
    c.p.push(p); }      // un tratto lungo zero dà NaN in distSeg, e il NaN di prima deve restare: quella spezzata si misura come prima (c.nulla)
  PACCHI_LINEA.set(linea,c); return c;
}
RM.distLinea = function(px,pz,linea,chiusa){
  var n=linea.length, fine=chiusa?n:n-1;
  if(fine<24){ var d0=1e9; for(var i0=0;i0<fine;i0++) d0=Math.min(d0,distSeg(px,pz,linea[i0],linea[(i0+1)%n])); return d0; }      // spezzate corte: come prima
  var c=pacchiLinea(linea,!!chiusa), P=c.p, np=P.length, d=1e9, j, i, p, ex, ez, lb, vinto=c.ultimo, prima;
  if(c.nulla){ for(i=0;i<fine;i++) d=Math.min(d,distSeg(px,pz,linea[i],linea[(i+1)%n])); return d; }
  for(j=-1;j<np;j++){
    p=j<0?P[c.ultimo]:P[j]; if(j===c.ultimo) continue;
    if(d<1e9){ ex=Math.max(p.x0-px,0,px-p.x1); ez=Math.max(p.z0-pz,0,pz-p.z1); lb=Math.sqrt(ex*ex+ez*ez); if(lb*(1-1e-9)-1e-9>=d) continue; }
    prima=d; for(i=p.da;i<p.a;i++) d=Math.min(d,distSeg(px,pz,linea[i],linea[(i+1)%n]));
    if(d<prima) vinto=j<0?c.ultimo:j;
  }
  c.ultimo=vinto;
  return d;
};
RM.distFiume = function(x,z){ return RM.distLinea(x,z,RM.FIUME,false); };
RM.distStrade = function(x,z){ var d=1e9; for(var i=0;i<RM.STRADE.length;i++) d=Math.min(d,RM.distLinea(x,z,RM.STRADE[i],false)); return d; };
RM.dentroMura = function(x,z){
  var p=RM.MURA, dentro=false;
  for(var i=0,j=p.length-1;i<p.length;j=i++){
    if((p[i][1]>z)!==(p[j][1]>z) && x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0]) dentro=!dentro;
  }
  return dentro;
};
/* quota del terreno: griglia reale (metri sopra la riva del Tevere), interpolata; il letto del fiume è scavato */
var Q=TOPO.quote;
function quotaGriglia(x,z){
  var c=(x-Q.x0)/Q.dx, r=(Q.z0-z)/Q.dz;
  c=Math.max(0,Math.min(Q.colonne-1.001,c)); r=Math.max(0,Math.min(Q.righe-1.001,r));
  var c0=Math.floor(c), r0=Math.floor(r), fc=c-c0, fr=r-r0, i=r0*Q.colonne+c0;
  return ((Q.q[i]*(1-fc)+Q.q[i+1]*fc)*(1-fr)+(Q.q[i+Q.colonne]*(1-fc)+Q.q[i+Q.colonne+1]*fc)*fr)/10;
}
/* I colli. La griglia misurata è troppo liscia (e risente degli edifici moderni e dei riempimenti di duemila anni) per rendere
   le alture della città antica: qui sono ridisegnate come pianori dai fianchi ripidi, al loro posto e alle quote antiche note
   (unità = 10 m sopra la riva del Tevere). [x, z, raggio lungo, raggio corto, rotazione, quota] */
var COLLI=[
  [-29,1,10,8.5,0,3.3],[-19,-11,8.5,7.5,0,3.6],                 // Campidoglio: Capitolium e Arx
  [15,42,22,17,-.6,4.0],                                         // Palatino
  [36,12,12,9,0,2.3],                                            // Velia
  [-42,96,31,22,.6,3.6],[26,128,22,16,0,3.2],                    // Aventino e Piccolo Aventino
  [115,78,62,18,.15,3.8],[62,60,22,14,0,3.3],                    // Celio
  [100,-6,30,17,.2,4.0],[108,-55,26,14,.3,4.2],[176,-28,72,56,0,4.4],   // Esquilino: Oppio, Cispio, pianoro orientale
  [95,-95,46,13,-.75,4.3],                                       // Viminale
  [20,-70,24,10,-.75,4.4],[66,-121,42,13,-.75,4.6],[122,-152,62,42,0,4.6],   // Quirinale e pianoro del Castro Pretorio
  [-30,-192,33,18,.3,4.8]                                        // Pincio
];
var ESAGERA=1.8;                                                 // il rilievo è accentuato di quasi due volte, per leggerlo dall'alto
function colli(x,z){
  var y=0, i, c, dx, dz, ca, sa, u, v, d, f;
  for(i=0;i<COLLI.length;i++){
    c=COLLI[i]; dx=x-c[0]; dz=z-c[1]; if(Math.abs(dx)>c[2]||Math.abs(dz)>c[2]) continue;
    ca=Math.cos(c[4]); sa=Math.sin(c[4]); u=(dx*ca+dz*sa)/c[2]; v=(-dx*sa+dz*ca)/c[3]; d=Math.sqrt(u*u+v*v); if(d>=1) continue;
    f=1-RM.sfuma(.6,1,d); if(c[5]*f>y) y=c[5]*f;
  }
  return y;
}
/* terreno naturale: griglia misurata fuori città e per le alture maggiori (Gianicolo, Vaticano, Monte Mario), colli antichi dentro; letto del fiume scavato */
RM.hGrezza = function(x,z){
  var y=Math.max(Math.max(-.2,quotaGriglia(x,z)),colli(x,z))*ESAGERA, df=RM.distFiume(x,z), w=Math.exp(-(df*df)/55);
  return y*(1-w)-1.2*w;
};
/* terreno con le terrazze: sotto ogni grande monumento il suolo è spianato alla quota del suo centro (zone con h) */
/* Dove due terrazze si sfiorano le loro quote si fondono, pesate con l'ottava potenza della vicinanza: prima vinceva la più vicina e fra la terrazza di Venere e Roma e quella
   della basilica di Massenzio il suolo saltava di 20 m di colpo, e la via Sacra restava sospesa (23 novembre 2026). Nel nucleo di una terrazza l'altra pesa meno dell'1%. */
/* Dal 25 novembre 2026 una zona può avere t, la larghezza della sfumatura (senza: 7, cioè 70 m come prima), e può essere un rettangolo: a e b le mezze misure, c e s coseno e seno
   della rotazione del monumento, r zero (RM.dZona dà la distanza dal bordo). Serve alle piattaforme con muri di sostegno (tempio di Claudio, Venere e Roma, terme di Traiano):
   il pendio di terra di 70 m le faceva sembrare posate su un cumulo. */
RM.dZona = function(q,x,z){ var dx=x-q.x, dz=z-q.z; if(!q.a) return Math.hypot(dx,dz);
  return Math.hypot(Math.max(Math.abs(dx*q.c-dz*q.s)-q.a,0),Math.max(Math.abs(dx*q.s+dz*q.c)-q.b,0)); };
/* Indice delle zone (26 novembre 2026): RM.h si chiama centinaia di migliaia di volte all'apertura e ogni volta scorreva tutte le zone. Ora una griglia di quadrati di 20 unità
   dice quali zone possono toccare un punto (quelle il cui quadrato di prova, lo stesso di prima allargato di un quadrato per parte, lo copre); le altre il controllo di prima
   le avrebbe scartate comunque. Stesse zone, nello stesso ordine: stessa quota, bit per bit. Le zone si aggiungono solo all'avvio (js/monumenti.js, js/nuclei.js) e non
   cambiano dopo: l'indice si rifà quando ne cambia il numero. Fuori dalla griglia si scorrono tutte, come prima. */
var IZ={n:-1, S:20, X0:-1200, Z0:-1200, NX:120, NZ:120, celle:null};
function indiceZone(){
  var Z=RM.zone, c=new Array(IZ.NX*IZ.NZ), i, q, L, cx0, cx1, cz0, cz1, a, b;
  for(i=0;i<Z.length;i++){ q=Z[i]; if(q.h==null) continue; L=(q.r+(q.R||0)+(q.t||7))*1.5;
    cx0=Math.max(0,Math.floor((q.x-L-IZ.X0)/IZ.S)-1); cx1=Math.min(IZ.NX-1,Math.floor((q.x+L-IZ.X0)/IZ.S)+1);
    cz0=Math.max(0,Math.floor((q.z-L-IZ.Z0)/IZ.S)-1); cz1=Math.min(IZ.NZ-1,Math.floor((q.z+L-IZ.Z0)/IZ.S)+1);
    for(b=cz0;b<=cz1;b++) for(a=cx0;a<=cx1;a++){ var k=b*IZ.NX+a; (c[k]||(c[k]=[])).push(i); } }
  IZ.celle=c; IZ.n=Z.length;
}
var NESSUNA=[];
RM.h = function(x,z){
  var y=RM.hGrezza(x,z), i, q, d, w, p, t, meglio=0, sp=0, sh=0, Z=RM.zone, lista=null, j, nl;
  if(IZ.n!==Z.length) indiceZone();
  var cx=Math.floor((x-IZ.X0)/IZ.S), cz=Math.floor((z-IZ.Z0)/IZ.S);
  if(cx>=0 && cz>=0 && cx<IZ.NX && cz<IZ.NZ) lista=IZ.celle[cz*IZ.NX+cx]||NESSUNA;
  nl=lista?lista.length:Z.length;
  for(j=0;j<nl;j++){ i=lista?lista[j]:j; q=Z[i]; if(q.h==null) continue; t=q.t||7; d=Math.abs(x-q.x)+Math.abs(z-q.z); if(d>(q.r+(q.R||0)+t)*1.5) continue;
    d=RM.dZona(q,x,z); if(d<q.r+t){ w=1-RM.sfuma(q.r,q.r+t,d); if(w<=0) continue; if(w>meglio) meglio=w; p=w*w; p*=p; p*=p; sp+=p; sh+=p*q.h; } }
  return meglio?y*(1-meglio)+sh/sp*meglio:y;
};
/* quota letta da una griglia riempita al bisogno: per ciò che si muove a ogni fotogramma (passanti, fumo), dove RM.h costerebbe troppo */
var GR=2, GX0=-360, GZ0=-430, GNX=361, GNZ=446, griglia=null;
function nodo(c,r){ var i=r*GNX+c, v=griglia[i]; if(v!==v){ v=griglia[i]=RM.h(GX0+c*GR,GZ0+r*GR); } return v; }
RM.hRapida = function(x,z){
  var c=(x-GX0)/GR, r=(z-GZ0)/GR; if(c<0||r<0||c>=GNX-1||r>=GNZ-1) return RM.h(x,z);
  if(!griglia){ griglia=new Float32Array(GNX*GNZ); for(var k=0;k<griglia.length;k++) griglia[k]=NaN; }
  var c0=c|0, r0=r|0, fc=c-c0, fr=r-r0;
  return (nodo(c0,r0)*(1-fc)+nodo(c0+1,r0)*fc)*(1-fr)+(nodo(c0,r0+1)*(1-fc)+nodo(c0+1,r0+1)*fc)*fr;
};
RM.casuale = function(seme){            // generatore ripetibile
  var s=seme>>>0;
  return function(){ s=(s+0x6D2B79F5)>>>0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
};
RM.sfuma = function(a,b,t){ t=Math.max(0,Math.min(1,(t-a)/(b-a))); return t*t*(3-2*t); };
function grana(ix,iz){ var n=Math.sin(ix*127.1+iz*311.7)*43758.5453; return n-Math.floor(n); }
RM.rumore = function(x,z){               // rumore morbido 0…1
  var ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz; fx=fx*fx*(3-2*fx); fz=fz*fz*(3-2*fz);
  return (grana(ix,iz)*(1-fx)+grana(ix+1,iz)*fx)*(1-fz)+(grana(ix,iz+1)*(1-fx)+grana(ix+1,iz+1)*fx)*fz;
};
RM.grana = grana;

/* ---- renderer ---- */
var contenitore=document.getElementById('scena'), renderer;
/* Con WebGL2 la scena è disegnata su una tela intermedia e i bordi li liscia la passata finale (FXAA): l'antialias della tela vera non toccherebbe la scena
   e costerebbe solo memoria e tempo (quattro campioni per pixel). Resta acceso dove la passata finale non c'è (WebGL1). 23 novembre 2026 */
var GL2=!!window.WebGL2RenderingContext;
try{ renderer=new THREE.WebGLRenderer({antialias:!GL2}); }
catch(e){ document.getElementById('errore').hidden=false; RM.guasto=true; if(window.RM_carica) RM_carica.cittaPronta(); return; }
var piccolo=Math.min(window.innerWidth,window.innerHeight)<700; RM.piccolo=piccolo;
/* La «veste» (24 novembre 2026, fase 2; l'utente: «dobbiamo fare in modo davvero che migliori l'aspetto di Roma almeno da pc»): suolo, erba, luce, occlusione, acqua, tetti e muri.
   Dal 24 novembre 2026, sera, anche sui telefoni (l'utente: «Secondo te non si può migliorare la qualità della città anche su telefonino?»): il codice nuovo degli shader si compila
   dovunque ci sia WebGL2 (RM.VESTE; ?veste=0 lo toglie, per le prove) e si accende e si spegne col gradino della qualità (RM.vesteU: 0 in «bassa», che resta l'aspetto di prima,
   1 dal gradino «telefono» in su). In «bassa» i rami nuovi sono saltati da un'uniforme: aspetto e lavoro per pixel restano quelli di prima. */
RM.VESTE=!!(renderer.capabilities && renderer.capabilities.isWebGL2) && !/[?&]veste=0/.test(location.search); RM.vesteU={value:RM.VESTE?1:0};
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,piccolo?1.5:2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.07;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false;
contenitore.appendChild(renderer.domElement);
RM.col=function(hex){ return new THREE.Color(hex).convertSRGBToLinear(); };
/* trama disegnata su tela */
RM.tela=function(w,h,disegna,ripeti){
  var c=document.createElement('canvas'); c.width=w; c.height=h; disegna(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(ripeti!==false){ t.wrapS=t.wrapT=THREE.RepeatWrapping; }
  return t;
};

var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(36,1,2,9000);
camera.position.set(-200,255,470);
var controlli=new THREE.OrbitControls(camera,renderer.domElement);
controlli.target.set(0,0,5);
controlli.enableDamping=true; controlli.dampingFactor=.08;
controlli.minDistance=16; controlli.maxDistance=900;
controlli.maxPolarAngle=Math.PI*.475;
/* Sulla città ci si muove come su una carta: trascinare sposta (un dito sul telefono), la rotella o due dita avvicinano e ruotano, il tasto destro (o Ctrl e trascina) ruota.
   Lo spostamento resta sul piano del terreno e il punto guardato non esce dalla città. */
controlli.screenSpacePanning=false; controlli.panSpeed=1.1;
controlli.mouseButtons={LEFT:THREE.MOUSE.PAN, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.ROTATE};
controlli.touches={ONE:THREE.TOUCH.PAN, TWO:THREE.TOUCH.DOLLY_ROTATE};
controlli.addEventListener('change',function(){ var t=controlli.target, x=Math.max(-330,Math.min(330,t.x)), z=Math.max(-520,Math.min(420,t.z)); if(x!==t.x||z!==t.z){ camera.position.x+=x-t.x; camera.position.z+=z-t.z; t.x=x; t.z=z; } });
var MENO_MOTO=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches && !/[?&]moto=1/.test(location.search);      // ?moto=1 come nella carta, per le prove
controlli.autoRotate=!MENO_MOTO; controlli.autoRotateSpeed=.22;
/* La rotazione lenta è un dondolio di pochi gradi attorno a un angolo di riferimento, non un giro: lasciata girare per qualche minuto portava la città di traverso.
   Quando l'angolo si allontana di più di nove gradi dal riferimento, il verso si inverte. All'avvio il riferimento è la vista d'insieme.
   Si ferma al primo tocco, a ogni volo (un monumento, la regia di una tappa) e a ogni zoom; dal 23 novembre 2026 riparte da sola dopo cinque secondi di quiete
   (nessun dito o tasto premuto, nessun volo in corso), attorno alla vista in cui ci si è fermati. L'utente: «Perché la città smette di muoversi circolarmente dopo che faccio zoom su un monumento?».
   Non per chi ha chiesto meno animazioni, né durante il confronto «Prima e dopo» (RM.senzaGiro), dove l'inquadratura deve restare la stessa da un anno all'altro. */
var azRif=Math.atan2(-200,465), azPrima=0, quiete=0, premuto=0;
function fermaGiro(){ controlli.autoRotate=false; quiete=0; }
renderer.domElement.addEventListener('pointerdown',function(){ fermaGiro(); premuto++; });
window.addEventListener('pointerup',function(){ premuto=0; quiete=0; }); window.addEventListener('pointercancel',function(){ premuto=0; quiete=0; });
renderer.domElement.addEventListener('wheel',function(){ fermaGiro(); },{passive:true});
RM.frame.push(function(dt){
  if(!controlli.autoRotate){
    if(MENO_MOTO || premuto || volo || RM.senzaGiro){ quiete=0; return; }
    quiete+=dt; if(quiete<5) return;
    azRif=controlli.getAzimuthalAngle(); azPrima=0; controlli.autoRotateSpeed=Math.abs(controlli.autoRotateSpeed); controlli.autoRotate=true; return;
  }
  var d=controlli.getAzimuthalAngle()-azRif; d=Math.atan2(Math.sin(d),Math.cos(d));
  if(Math.abs(d)>.16 && Math.abs(d)>Math.abs(azPrima)) controlli.autoRotateSpeed*=-1;
  azPrima=d;
});
RM.scene=scene; RM.camera=camera; RM.renderer=renderer; RM.controlli=controlli;
/* apertura: la camera parte alta e lontana e scende sulla vista d'insieme in cinque secondi; un tocco o la rotella la fermano (si veda più sotto, dove «volo» si azzera) */
RM.apertura=function(){ if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return; camera.position.set(-330,640,1010); volo={t:0,dur:5,t0:controlli.target.clone(),p0:camera.position.clone(),t1:controlli.target.clone(),p1:new THREE.Vector3(-200,255,470)}; };
/* volo di camera verso un punto: tiene la direzione da cui si sta guardando */
var volo=null;
RM.vola=function(x,z,dist,quota){
  fermaGiro();
  var t1=new THREE.Vector3(x,(quota==null?RM.h(x,z):quota)+1,z), dir=camera.position.clone().sub(controlli.target); dir.y=0;
  if(dir.lengthSq()<1) dir.set(-.4,0,1); dir.normalize();
  var p1=t1.clone().add(dir.multiplyScalar(dist*.82)); p1.y=t1.y+dist*.56;
  volo={t:0,t0:controlli.target.clone(),p0:camera.position.clone(),t1:t1,p1:p1};
};
/* verso un'inquadratura fissa; dur in secondi (senza: 1,5) */
RM.volaA=function(t,c,dur){ fermaGiro(); volo={t:0,dur:dur,t0:controlli.target.clone(),p0:camera.position.clone(),t1:new THREE.Vector3(t[0],RM.h(t[0],t[1])+1,t[1]),p1:new THREE.Vector3(c[0],c[1],c[2])}; };
/* Volo che segue qualcosa che si muove (24 novembre 2026: il corteo dell'800): f(k), con k da 0 a 1 in dur secondi, dà {t:[x,y,z], c:[x,y,z]}, punto guardato e camera.
   Come gli altri voli si ferma al primo tocco o alla rotella, e finché dura la rotazione lenta non riparte. */
RM.segui=function(f,dur){ fermaGiro(); volo={t:0,dur:dur,f:f}; };
/* Sul telefono in piedi il riquadro è più alto che largo e un'inquadratura pensata per il PC taglia i lati: la camera si allontana lungo la stessa direzione
   (1,5 volte con il rapporto 0,5). Restituisce il fattore; RM.adatta(v) lo applica a un'inquadratura {t:[x,z], c:[x,y,z]}. */
RM.fattoreVista=function(){ var a=camera.aspect||1; return a>=1?1:Math.min(1.9,Math.pow(1/a,.6)); };
RM.adatta=function(v){ var k=RM.fattoreVista(); if(k===1||!v||!v.t) return v; var y0=RM.h(v.t[0],v.t[1])+1;
  return {t:v.t, c:[v.t[0]+(v.c[0]-v.t[0])*k, y0+(v.c[1]-y0)*k, v.t[1]+(v.c[2]-v.t[1])*k]}; };
/* La scena può scorrere dentro il suo riquadro, in pixel: quando una scheda o la linea del tempo ne coprono una parte, ciò che si guarda
   deve restare al centro di quel che si vede, non al centro del riquadro. x positivo sposta la scena a destra, y positivo in alto. */
var spost={x:0,y:0,mx:0,my:0};
RM.sposta=function(x,y){ spost.mx=Math.round(x); spost.my=Math.round(y); };
RM.frame.push(function(dt){
  if(!spost.x && !spost.y && !spost.mx && !spost.my) return;
  var k=Math.min(1,dt*6); spost.x+=(spost.mx-spost.x)*k; spost.y+=(spost.my-spost.y)*k;
  if(Math.abs(spost.mx-spost.x)<.5) spost.x=spost.mx; if(Math.abs(spost.my-spost.y)<.5) spost.y=spost.my;
  var w=contenitore.clientWidth||1, h=contenitore.clientHeight||1;
  if(!spost.x && !spost.y) camera.clearViewOffset(); else camera.setViewOffset(w,h,-spost.x,spost.y,w,h);
});
/* zoom a passi: ci si avvicina o ci si allontana dal punto che si sta guardando */
RM.zoom=function(f){
  fermaGiro();
  var d=camera.position.clone().sub(controlli.target), L=Math.max(controlli.minDistance*1.3,Math.min(controlli.maxDistance,d.length()*f));
  volo={t:0,dur:.45,t0:controlli.target.clone(),p0:camera.position.clone(),t1:controlli.target.clone(),p1:controlli.target.clone().add(d.setLength(L))};
};
RM.inVistaInsieme=function(){ return Math.abs(camera.position.distanceTo(controlli.target)-567)<50 && Math.abs(camera.position.y-255)<60 && controlli.target.length()<25; };      // la rotazione lenta dell'avvio non conta: conta distanza, quota e punto guardato
var INSIEME=new THREE.Vector3(-200,255,470);
RM.apertura();
RM.vistaInsieme=function(){ fermaGiro(); volo={t:0,t0:controlli.target.clone(),p0:camera.position.clone(),t1:new THREE.Vector3(0,0,5),p1:new THREE.Vector3(-200,255,470)}; };
renderer.domElement.addEventListener('pointerdown',function(){ volo=null; });
renderer.domElement.addEventListener('wheel',function(){ volo=null; },{passive:true});
RM.frame.push(function(dt){
  if(!volo) return;
  if(volo.f){ volo.t=Math.min(1,volo.t+dt/(volo.dur||1.5)); var r=volo.f(volo.t); controlli.target.set(r.t[0],r.t[1],r.t[2]); camera.position.set(r.c[0],r.c[1],r.c[2]); if(volo.t>=1) volo=null; return; }
  volo.t=Math.min(1,volo.t+dt/(volo.dur||1.5)); var k=volo.t*volo.t*(3-2*volo.t);
  controlli.target.lerpVectors(volo.t0,volo.t1,k); camera.position.lerpVectors(volo.p0,volo.p1,k);
  if(volo.t>=1) volo=null;
});

/* ---- cielo, sole, luna ---- */
var G={ alto:RM.col(0x9fb9cc), basso:RM.col(0xefe3c8), emiSu:RM.col(0xcfe0ff), emiGiu:RM.col(0x6c6a84), sole:RM.col(0xffe4bb), iSole:2.9, iEmi:.66 };      // sole caldo, ombre fredde, orizzonte color carta
var N={ alto:RM.col(0x05070f), basso:RM.col(0x1a2238), emiSu:RM.col(0x2a3a66), emiGiu:RM.col(0x05060a), sole:RM.col(0x8fa6e8), iSole:.85, iEmi:.36 };
var cielo=new THREE.Mesh(new THREE.SphereGeometry(3600,32,16), new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{ alto:{value:G.alto.clone()}, basso:{value:G.basso.clone()} },
  vertexShader:'varying float q; void main(){ q=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform vec3 alto; uniform vec3 basso; varying float q; void main(){ gl_FragColor=vec4(mix(basso,alto,pow(clamp(q*1.6,0.0,1.0),0.55)),1.0);\n#include <encodings_fragment>\n}'
}));
scene.add(cielo);
scene.fog=new THREE.Fog(G.basso.getHex(),700,2300);
(function(){                              // stelle
  var r=RM.casuale(7), p=[], i, a, b;
  for(i=0;i<700;i++){ a=r()*Math.PI*2; b=Math.acos(r()*.96); p.push(3300*Math.sin(b)*Math.cos(a),3300*Math.cos(b),3300*Math.sin(b)*Math.sin(a)); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  RM.stelle=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));
  scene.add(RM.stelle);
})();
var emi=new THREE.HemisphereLight(0xffffff,0xffffff,G.iEmi); scene.add(emi);
var sole=new THREE.DirectionalLight(0xffffff,G.iSole);
/* sole basso da ovest-nord-ovest: le ombre cadono verso chi guarda */
sole.position.set(-600,330,-170); sole.target.position.set(10,0,0); scene.add(sole); scene.add(sole.target);
sole.castShadow=true;
var lato=piccolo?1536:4096; sole.shadow.mapSize.set(lato,lato);
var oc=sole.shadow.camera; oc.left=-420; oc.right=420; oc.top=420; oc.bottom=-420; oc.near=150; oc.far=1500; oc.updateProjectionMatrix();
sole.shadow.bias=-.0007; sole.shadow.normalBias=.5;
/* Ombre da vicino. La mappa delle ombre copre tutta la città, e da vicino è sgranata: quando ci si avvicina il riquadro si stringe attorno a ciò che si guarda
   e si ridisegna solo quando lo sguardo si è spostato abbastanza; da lontano torna a coprire tutto. */
var ombra={x:10,z:0,s:420}, ombraFissa=null;
/* Un riquadro fermo per le scene animate (25 novembre 2026; l'utente, sull'iPhone, nella scena dell'800: «evitando che l'ombra faccia effetto flash»). Mentre la camera
   seguiva il corteo il riquadro si rispostava a ogni quinto del suo lato: la mappa si rifaceva (tutta la città, a 4096 pixel in «massima»: un fotogramma lungo) e le ombre
   saltavano di colpo. RM.ombraFissa({x, z, s}) tiene il riquadro dove dice la scena e rifà la mappa una volta sola; RM.ombraFissa(null) torna a seguire la camera.
   s: metà del lato, in unità; se manca, quello che dà circa dieci centimetri per pixel della mappa (bordi morbidi, non a scalini), mai sotto t (il minimo che serve). */
RM.ombraFissa=function(o){
  ombraFissa=o||null; if(!o){ ombra.s=-1; return; }
  var L=o.s||Math.max(o.t||7,sole.shadow.mapSize.x*.005);
  ombra.x=o.x; ombra.z=o.z; ombra.s=L;
  sole.target.position.set(o.x,0,o.z); sole.position.set(o.x-610,330,o.z-170); sole.target.updateMatrixWorld();
  oc.left=-L; oc.right=L; oc.top=L; oc.bottom=-L; oc.updateProjectionMatrix(); sole.shadow.normalBias=o.s?Math.max(.14,.5*L/420):Math.max(.012,5*L/sole.shadow.mapSize.x);      // un riquadro grande come quello che segue la camera; uno stretto: due pixel e mezzo della mappa
  renderer.shadowMap.needsUpdate=true; };
RM.frame.push(function(){
  if(!sole.castShadow || ombraFissa) return;
  var dist=camera.position.distanceTo(controlli.target), lato=Math.max(70,Math.min(420,dist*1.25)), x=lato>=420?10:controlli.target.x, z=lato>=420?0:controlli.target.z;
  if(Math.abs(lato-ombra.s)<ombra.s*.2 && Math.hypot(x-ombra.x,z-ombra.z)<ombra.s*.22) return;
  ombra.x=x; ombra.z=z; ombra.s=lato;
  sole.target.position.set(x,0,z); sole.position.set(x-610,330,z-170); sole.target.updateMatrixWorld();
  oc.left=-lato; oc.right=lato; oc.top=lato; oc.bottom=-lato; oc.updateProjectionMatrix(); sole.shadow.normalBias=Math.max(.14,.5*lato/420);
  renderer.shadowMap.needsUpdate=true;
});
/* Mentre il tempo scorre fra due tappe l'anno cambia a ogni fotogramma: rifare ogni volta la mappa delle ombre (tutta la città, una seconda volta) era la voce più cara
   del viaggio. Ora si rifà al massimo quindici volte al secondo, e sempre una volta dopo l'ultimo cambio (23 novembre 2026). */
var ombraChiesta=false, ombraFatta=0, ultimoAnno=0;
RM.moduli.push(function(){ ombraChiesta=true; ultimoAnno=performance.now(); });

/* ---- terreno: maglia fitta sulla città, larga in campagna. Si posa dopo che i monumenti hanno dichiarato le loro terrazze (RM.posa) ---- */
/* campagna: grano e stoppie, maggese, pascolo, vigna, oliveto; meno verde brillante di prima (23 novembre 2026: sembrava un prato all'inglese) */
var CAMPI=[0x93a062,0x7f9457,0xbcae6e,0xa6a468,0x738c52,0xc7b57a,0xa8996a,0x8b9a60,0xb5a56c].map(RM.col), URBE=RM.col(0xb8a684), RIVA=RM.col(0x6a8650), PRATO=RM.col(0x899a5e);
function coloreSuolo(x,z,c){
  var df=RM.distFiume(x,z), bordo=RM.distLinea(x,z,RM.MURA,true), dentro=RM.dentroMura(x,z);
  var ca=.82, sa=.57, u=(x*ca+z*sa)/26, v=(-x*sa+z*ca)/19;                  // campi: scacchiera ruotata
  c.copy(CAMPI[Math.floor(grana(Math.floor(u),Math.floor(v))*CAMPI.length)]);
  c.lerp(PRATO,.2+.3*RM.rumore(x/60,z/60));
  var urbano=dentro?Math.min(1,bordo/26):Math.max(0,1-bordo/40)*.5;          // terra battuta in città
  c.lerp(URBE,urbano*(.75+.25*RM.rumore(x/14,z/14)));
  c.lerp(RIVA,Math.max(0,1-df/20)*.8);
  c.multiplyScalar(.88+.24*RM.rumore(x/7,z/7));
  return urbano;
}
/* Il suolo con la veste del PC (24 novembre 2026). A: la terra battuta della città più bruna e meno sabbia, a chiazze di polvere; prato negli horti dei colli;
   l'erba che invade la città abbandonata a chiazze verdi e secche. C (dentro il blocco dei campi): campi più distinti fra loro, siepi più verdi.
   B: dove il suolo è verde, cespi scuri e macchie di paglia a più scale; da vicino le trame d'erba e di terra (filtrate dai mipmap: nessun brulichio). */
var VESTE_SUOLO_A=['vec4 mcA=vec4(0.5); vec4 mcB=vec4(0.5); float hoV=0.0;',
  'if(uVeste>0.5){ mcA=texture2D(tMacchie,vXZ/80.0); mcB=texture2D(tMacchie,mat2(0.8,-0.6,0.6,0.8)*vXZ/13.0+0.41);',
  '  diffuseColor.rgb*=mix(vec3(1.0),vec3(0.76,0.76,0.8)*(0.84+0.3*mcA.g)*(0.9+0.2*mcB.b),vUrb.x);',
  '  hoV=vHo;',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.15,0.22,0.07)*(0.8+0.4*mcB.r)*(0.9+0.2*mcA.b),hoV*0.8);',
  '  verdeV=mix(vec3(0.19,0.25,0.075),vec3(0.34,0.31,0.12),smoothstep(0.3,0.75,mcB.g*0.6+mcA.r*0.4)); }'].join(String.fromCharCode(10));
var VESTE_SUOLO_C=['  if(uVeste>0.5){ int ic=int(hc*9.0); vec3 rc=vec3(1.0); for(int k=0;k<9;k++){ if(k==ic) rc=uCampi[k]; }',
  '    diffuseColor.rgb*=mix(vec3(1.0),mix(vec3(1.0),rc,0.75)*(0.92+0.16*mcB.g),camp); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(0.3,0.59,0.11))),0.18*camp);',      // un poco meno saturi: con la curva della passata finale la scacchiera dei campi da lontano gridava
  '    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.07,0.1,0.035),camp*siepe*0.55); }'].join(String.fromCharCode(10));
var VESTE_SUOLO_B=['if(uVeste>0.5){',
  '  float ve=clamp((diffuseColor.g-diffuseColor.r*0.9)*10.0+0.6*hoV,0.0,1.0);',
  '  float sc=smoothstep(0.55,0.8,mcB.r); float se=smoothstep(0.6,0.85,mcB.g*0.7+mcA.b*0.3);',
  '  vec3 cv=diffuseColor.rgb*(0.9+0.2*mcA.r)*(1.0-0.2*sc)*mix(vec3(1.0),vec3(1.2,1.07,0.7),0.55*se*(1.0-sc));',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,cv,ve);',
  '  float fwV=max(fwidth(vXZ.x),fwidth(vXZ.y));',
  '  if(fwV<0.9){ float kE=1.0-smoothstep(0.35,0.9,fwV);',      // la camera non scende sotto i 160 m dal punto guardato: un pixel copre 10-30 cm, e dell'erba si leggono i cespi (da mezzo metro a tre), non i fili
  '    vec3 de=vec3(1.0); vec3 dt=vec3(1.0);',
  '    if(ve>0.02){ de=pow(texture2D(tErba,mat2(0.8,-0.6,0.6,0.8)*vXZ/7.5+0.37).rgb,vec3(2.2))/uMediaE; float wP=1.0-smoothstep(0.22,0.4,fwV); if(wP>0.0) de*=mix(vec3(1.0),pow(texture2D(tErba,vXZ/2.4).rgb,vec3(2.2))/uMediaE,wP); }',      // il prodotto delle due scale (non la media, che spegneva il contrasto): cespi piccoli dentro chiazze più grandi; la piccola solo dove si legge
  '    if(ve<0.98) dt=pow(texture2D(tTerra,vXZ/2.1+0.11).rgb,vec3(2.2))/uMediaT;',
  '    diffuseColor.rgb*=mix(vec3(1.0),clamp(mix(dt,de,ve),0.35,1.8),kE*0.85); } }'].join(String.fromCharCode(10));
/* Trame della veste del PC (solo con RM.VESTE), disegnate una volta su tela e ripetute senza giunte:
   - erba: vista dall'alto, cespi più scuri, fili chiari e secchi, terra fra i cespi (piastrelle di 24 e 75 m: si leggono i cespi da mezzo metro a tre, da lontano la media);
   - terra: terra battuta con sassi, ghiaia e qualche solco (piastrella di 21 m);
   - macchie: tre rumori morbidi indipendenti nei tre canali (4, 8 e 16 macchie per lato), per variare erba e terra su scale da pochi metri a qualche centinaio.
   Le prime due si usano divise per la loro media: da lontano i mipmap le riducono a 1 e non cambiano il colore, né sfarfallano. */
function trameVeste(){
  function onda(W,H,disegna){ var c=document.createElement('canvas'); c.width=W; c.height=H; var g=c.getContext('2d'); disegna(g,W,H);
    var d=g.getImageData(0,0,W,H).data, m=[0,0,0], k, lin=function(v){ return Math.pow(v/255,2.2); };      // three r128 non decodifica le trame passate come uniformi: lo shader le porta in lineare con la potenza 2,2, e la media si fa allo stesso modo
    for(k=0;k<W*H;k++){ m[0]+=lin(d[k*4]); m[1]+=lin(d[k*4+1]); m[2]+=lin(d[k*4+2]); }
    var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    return {t:t, media:new THREE.Vector3(m[0]/(W*H),m[1]/(W*H),m[2]/(W*H))}; }
  function giro(g,W,H,x,y,r,f){ for(var ox=-1;ox<=1;ox++) for(var oy=-1;oy<=1;oy++){ var X=x+ox*W, Y=y+oy*H; if(X>-r&&X<W+r&&Y>-r&&Y<H+r) f(X,Y); } }      // disegna anche le copie oltre i bordi: la piastrella si ripete senza giunte
  var r=RM.casuale(1717);
  var E=onda(256,256,function(g,W,H){ var k, x, y, a, l, c, rr;
    g.fillStyle='#66703f'; g.fillRect(0,0,W,H);
    for(k=0;k<70;k++){ x=r()*W; y=r()*H; rr=5+r()*14; c=r()<.55?'rgba(104,88,58,.5)':'rgba(140,134,82,.5)'; giro(g,W,H,x,y,rr*1.6,function(X,Y){ g.fillStyle=c; g.beginPath(); g.ellipse(X,Y,rr,rr*.7,0,0,6.3); g.fill(); }); }      // terra e paglia fra i cespi
    for(k=0;k<110;k++){ x=r()*W; y=r()*H; rr=4+r()*9; giro(g,W,H,x,y,rr*1.6,function(X,Y){ g.fillStyle='rgba(44,58,26,.62)'; g.beginPath(); g.ellipse(X,Y,rr,rr*.8,0,0,6.3); g.fill(); }); }      // cespi, più scuri
    for(k=0;k<5200;k++){ x=r()*W; y=r()*H; a=r()*6.283; l=2+r()*5; var t=r();
      c=t<.5?[78+r()*36,98+r()*36,44+r()*18]:t<.84?[112+r()*36,124+r()*30,62+r()*20]:[158+r()*40,148+r()*30,92+r()*26];      // fili verdi, verde chiaro, secchi
      g.strokeStyle='rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+',.78)'; g.lineWidth=.7+r()*.7;
      giro(g,W,H,x,y,l+2,function(X,Y){ g.beginPath(); g.moveTo(X,Y); g.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l); g.stroke(); }); }
  });
  var T=onda(256,256,function(g,W,H){ var k, x, y, rr, c;
    g.fillStyle='#8f7d62'; g.fillRect(0,0,W,H);
    for(k=0;k<60;k++){ x=r()*W; y=r()*H; rr=8+r()*22; c=r()<.5?'rgba(120,104,80,.35)':'rgba(96,82,62,.35)'; var ro=r()*3; giro(g,W,H,x,y,rr*1.6,function(X,Y){ g.fillStyle=c; g.beginPath(); g.ellipse(X,Y,rr,rr*.6,ro,0,6.3); g.fill(); }); }      // chiazze di polvere e di terra più scura
    for(k=0;k<1400;k++){ x=r()*W; y=r()*H; rr=.6+r()*1.8; c=r()<.6?'rgba(168,156,136,.8)':'rgba(70,60,48,.7)'; giro(g,W,H,x,y,rr+1,function(X,Y){ g.fillStyle=c; g.beginPath(); g.arc(X,Y,rr,0,6.3); g.fill(); }); }      // sassi e ghiaia
    for(k=0;k<6;k++){ y=r()*H; c='rgba(70,58,44,.22)'; for(x=0;x<W;x+=2){ g.fillStyle=c; g.fillRect(x,(y+Math.sin(x*.05+k)*3+H)%H,2,2); } }      // solchi di ruote
  });
  /* macchie: rumore a valori su una griglia periodica, interpolato in modo morbido; due ottave per canale */
  var M=256, cv=document.createElement('canvas'); cv.width=cv.height=M; var gm=cv.getContext('2d'), im=gm.createImageData(M,M);
  function rumoreP(n,seme){ var v=[], i, rr=RM.casuale(seme); for(i=0;i<n*n;i++) v.push(rr()); return function(x,y){ var X=x*n, Y=y*n, ix=Math.floor(X), iy=Math.floor(Y), fx=X-ix, fy=Y-iy; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy);
    var a=v[(iy%n)*n+ix%n], b=v[(iy%n)*n+(ix+1)%n], c=v[((iy+1)%n)*n+ix%n], d=v[((iy+1)%n)*n+(ix+1)%n]; return (a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy; }; }
  var CH=[[rumoreP(4,11),rumoreP(8,12)],[rumoreP(8,13),rumoreP(16,14)],[rumoreP(16,15),rumoreP(32,16)]], i, j, k2;
  for(j=0;j<M;j++) for(i=0;i<M;i++) for(k2=0;k2<3;k2++){ var vv=CH[k2][0](i/M,j/M)*.68+CH[k2][1](i/M,j/M)*.32; im.data[(j*M+i)*4+k2]=Math.max(0,Math.min(255,Math.round((vv-.5)*1.7*255+127.5))); im.data[(j*M+i)*4+3]=255; }
  gm.putImageData(im,0,0);
  var tM=new THREE.CanvasTexture(cv); tM.wrapS=tM.wrapT=THREE.RepeatWrapping;
  return {erba:E.t, mediaE:E.media, terra:T.t, mediaT:T.media, macchie:tM};
}
var TVc=null; RM.trameVeste=function(){ return TVc||(TVc=trameVeste()); };      // una volta sola: le usano suolo, strade, fiume, case
function nucleo(x,z){ var t=0; RM.NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,n[2]*Math.exp(-(d*d)/(n[3]*n[3]))); }); return Math.min(1,t+.25*Math.exp(-RM.distFiume(x,z)/45)); }
function posaSuolo(){
  var S=piccolo?220:300, geo=new THREE.PlaneGeometry(2,2,S,S); geo.rotateX(-Math.PI/2);
  var pos=geo.attributes.position, uv=geo.attributes.uv, col=new Float32Array(pos.count*3), urb=new Float32Array(pos.count*2), c=new THREE.Color(), i, x, z;
  var curva=function(t){ var a=Math.abs(t), a3=a*a*a; return (t<0?-1:1)*(.2*a+.05*a3+.75*a3*a3*a)*3400; };      // fitta in tutta la città: un vertice ogni 45 m sul Foro (prima 68), ogni 100 a ponte Milvio (prima 130, più della larghezza del Tevere, e la maglia gli passava sopra); rada solo nella campagna lontana (23 novembre 2026)
  for(i=0;i<pos.count;i++){
    x=curva(pos.getX(i)); z=curva(pos.getZ(i));
    pos.setXYZ(i,x,RM.h(x,z),z); uv.setXY(i,x/42,z/42);
    urb[i*2]=coloreSuolo(x,z,c); urb[i*2+1]=urb[i*2]>0?nucleo(x,z):0; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('urb',new THREE.BufferAttribute(urb,2)); geo.computeVertexNormals();
  var granaTerra=RM.tela(256,256,function(g,W,H){
    var r=RM.casuale(3), d=g.createImageData(W,H), k, v;
    for(k=0;k<W*H;k++){ v=205+Math.floor(r()*50); d.data[k*4]=v; d.data[k*4+1]=v; d.data[k*4+2]=v-6; d.data[k*4+3]=255; }
    g.putImageData(d,0,0);
  });
  var matSuolo=new THREE.MeshStandardMaterial({vertexColors:true,map:granaTerra,roughness:1,metalness:0}), A=String.fromCharCode(10);
  RM.erba={value:0}; RM.pratoU=RM.pratoU||{value:1};                       // 0…1: quanta parte della città è lasciata da abbastanza tempo perché ci cresca l'erba
  var TV=RM.VESTE?RM.trameVeste():null;
  /* la veste ricolora i campi (stesso indice della scacchiera di coloreSuolo): pascoli più verdi, stoppie dorate, un campo arato color terra; rapporti fra il colore nuovo e quello di prima */
  if(TV) TV.campi=[0x86a05a,0x6f8c4c,0xc4ad68,0x9c9a5c,0x6a8a4e,0xc9b06f,0x9a8060,0x82955a,0xa89a62].map(function(h,i){ var n=RM.col(h), c=CAMPI[i]; return new THREE.Vector3(n.r/c.r,n.g/c.g,n.b/c.b); });
  matSuolo.onBeforeCompile=function(sh){
    sh.uniforms.uErba=RM.erba; sh.uniforms.uVerde={value:RM.col(0x8e9163)}; sh.uniforms.uPrato=RM.pratoU;
    if(TV){ sh.uniforms.tErba={value:TV.erba}; sh.uniforms.tTerra={value:TV.terra}; sh.uniforms.tMacchie={value:TV.macchie}; sh.uniforms.uMediaE={value:TV.mediaE}; sh.uniforms.uMediaT={value:TV.mediaT}; sh.uniforms.uVeste=RM.vesteU;
      sh.uniforms.uCampi={value:TV.campi}; sh.uniforms.uHorti={value:RM.HORTI.map(function(h){ return new THREE.Vector3(h[0],h[1],h[2]); })}; }
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute vec2 urb;','varying vec2 vUrb;','varying vec2 vXZ;','varying float vPend;',TV?'uniform vec3 uHorti[8]; varying float vHo;':''].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>','vUrb=urb; vXZ=position.xz; vPend=1.0-normal.y;',
        TV?'vHo=0.0; for(int k=0;k<8;k++){ vec3 hq=uHorti[k]; vHo=max(vHo,1.0-smoothstep(hq.z*0.7,hq.z*1.1,length(position.xz-hq.xy))); }':''].join(A));      // gli horti nel vertice: nel frammento il giro costava a ogni pixel
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',['#include <common>','uniform float uErba; uniform vec3 uVerde; uniform float uPrato;','varying vec2 vUrb;','varying vec2 vXZ;','varying float vPend;',
        TV?'uniform sampler2D tErba; uniform sampler2D tTerra; uniform sampler2D tMacchie; uniform vec3 uMediaE; uniform vec3 uMediaT; uniform float uVeste; uniform vec3 uCampi[9]; varying float vHo;':''].join(A))
      .replace('#include <color_fragment>',['#include <color_fragment>',
        'float pe=sin(vXZ.x*0.21+sin(vXZ.y*0.13)*2.0)*sin(vXZ.y*0.19+sin(vXZ.x*0.11)*2.0)*0.5+0.5;',
        'float gr=dot(diffuseColor.rgb,vec3(0.34))/0.42;',
        'vec3 verdeV=uVerde;',
        TV?VESTE_SUOLO_A:'',
        'diffuseColor.rgb=mix(diffuseColor.rgb,verdeV*(0.72+0.4*pe)*clamp(gr,0.7,1.25),vUrb.x*smoothstep(0.1,0.5,uErba-vUrb.y*0.95)*(0.6+0.4*pe));',
        /* campagna: i confini fra i campi (siepi, fossi) e i solchi, ogni campo col suo verso e il suo passo; solo fuori città. La scacchiera è la stessa di coloreSuolo */
        'float camp=1.0-smoothstep(0.0,0.25,vUrb.x);',
        'if(camp>0.0){ vec2 fq=vec2(dot(vXZ,vec2(0.82,0.57))/26.0,dot(vXZ,vec2(-0.57,0.82))/19.0); float hc=fract(sin(dot(floor(fq),vec2(127.1,311.7)))*43758.5453);',
        '  float lungo=hc>0.5?fq.x*26.0:fq.y*19.0; float passoC=0.7+1.1*fract(hc*7.3); float fwC=fwidth(lungo)/passoC;',
        '  float solco=sin(lungo/passoC*6.2832)*(1.0-smoothstep(0.12,0.4,fwC))*step(0.25,hc);',
        '  vec2 bc=abs(fract(fq)-0.5); float fwB=max(fwidth(fq.x),fwidth(fq.y)); float siepe=smoothstep(0.5-0.012-fwB,0.5-0.006,max(bc.x,bc.y))*(1.0-smoothstep(0.01,0.05,fwB));',
        '  diffuseColor.rgb*=1.0+camp*(0.07*solco-0.22*siepe);',
        TV?VESTE_SUOLO_C:'',
        '}',
        /* Prati (24 novembre 2026; l'utente: «l'erba inesistente»). Dove il suolo è verde (campagna, prati, città abbandonata all'erba) il colore varia su tre scale, leggendo
           la stessa trama di rumore molto ingrandita (filtrata dai mipmap, quindi ferma quando la camera si muove): chiazze larghe più verdi e più spente (una trentina di metri),
           macchie che seccano verso il color paglia (una decina), cespi più scuri (due o tre metri). Peso: RM.QUALITA.prato (0 sui telefoni e in «bassa») */
        'float verde=clamp((diffuseColor.g-diffuseColor.r*0.92)*9.0+0.25*vUrb.x*uErba,0.0,1.0)*uPrato;',
        TV?'verde*=1.0-uVeste;':'',      // con la veste le chiazze dei prati le fa il blocco B, con le trame morbide: tre letture in meno per pixel
        'if(verde>0.0){ float n1=(texture2D(map,vXZ/900.0).r-0.8)*5.0; float n2=(texture2D(map,vXZ/260.0+0.31).r-0.8)*5.0; float n3=(texture2D(map,vXZ/61.0+0.67).r-0.8)*5.0;',
        '  vec3 c0=diffuseColor.rgb*(0.84+0.3*n1)*mix(vec3(1.0),vec3(1.14,1.02,0.66),smoothstep(0.5,0.85,n2)*0.55)*(1.0-0.3*smoothstep(0.55,0.95,n3));',
        '  diffuseColor.rgb=mix(diffuseColor.rgb,c0,verde); }',
        TV?VESTE_SUOLO_B:'',
        'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.27,0.25,0.15)*(0.8+0.4*pe),smoothstep(0.025,0.2,vPend)*0.8);',
        /* da vicino il terreno prende una grana più fine (ciuffi, sassi), che sfuma quando ci si allontana e non sfarfalla */
        /* 24 novembre 2026: la grana più fine (g2, passo di 5 cm) si spegne prima dell'altra e il contrasto è più basso: da vicino era una puntinatura dura */
        'float fwS=max(fwidth(vXZ.x),fwidth(vXZ.y)); float vic=1.0-smoothstep(0.03,0.14,fwS); float vic2=1.0-smoothstep(0.015,0.06,fwS);',
        TV?'vic*=1.0-uVeste; vic2*=1.0-uVeste;':'',      // con la veste la grana da vicino la danno le trame d'erba e di terra: due letture in meno
        'if(vic>0.0){ float g1=texture2D(map,vUv*9.0).r; float g2=texture2D(map,vUv*31.0+0.37).r; float ch=sin(vXZ.x*3.1+sin(vXZ.y*2.3)*1.9)*sin(vXZ.y*2.7+sin(vXZ.x*1.9)*2.1);',
        '  diffuseColor.rgb*=1.0+vic*((g1-0.9)*1.35+0.06*ch)+vic2*(g2-0.9)*0.8; }',
        /* lontano dalla città il terreno diventa una carta antica: fondo color pergamena, tratteggio a inchiostro */
        'float lont=smoothstep(480.0,820.0,length(vXZ));',
        'vec3 carta=vec3(0.83,0.74,0.56)*(0.95+0.05*sin(vXZ.x*0.09)*sin(vXZ.y*0.09));',
        'float tratto=1.0-0.3*smoothstep(0.9,1.0,sin((vXZ.x+vXZ.y)*0.4))*smoothstep(0.25,0.8,lont);',
        'diffuseColor.rgb=mix(diffuseColor.rgb,carta*tratto,lont);'].join(A));
  };
  var suolo=new THREE.Mesh(geo,matSuolo);
  suolo.receiveShadow=true; suolo.userData.gruppo='suolo'; scene.add(suolo); RM.suolo=suolo;
  suolo.renderOrder=.5; cielo.renderOrder=.6;      // il suolo, poi il cielo, dopo tutto il resto dell'opaco (26 novembre 2026): la profondità già scritta da case e monumenti scarta i loro pixel coperti prima di colorarli (lo shader del suolo è il più caro: 0,3-0,7 millesimi in meno a fotogramma sulla Radeon di prova). Prima e dopo i valori interi (le macchie d'appoggio a 1, l'acqua a 2-3) l'ordine resta quello di prima; l'immagine è la stessa
  /* la quota del terreno come è disegnato (triangolo per triangolo): fra un vertice e l'altro della maglia RM.h, più fine, può uscirne di qualche metro sui bordi delle terrazze.
     Le strade la seguono, così non galleggiano e non affondano (23 novembre 2026) */
  var N=S+1, inv=function(v){ var s=v<0?-1:1, a=Math.min(1,Math.abs(v)/3400), t=a; for(var k=0;k<12;k++){ var t2=t*t, t6=t2*t2*t2; t-=(.2*t+.05*t2*t+.75*t6*t-a)/(.2+.15*t2+5.25*t6); if(t>1) t=1; } return s*t; };      // (25 novembre 2026) il ciclo non aveva le graffe e faceva un passo solo: oltre 1,5 km dal Foro la cella cercata era sbagliata (fino a 130 celle) e strade, rampe dei ponti e figure prendevano la quota di un altro punto (Flaminia a ponte Milvio 105 m sotto terra); col tetto a 1 dodici passi bastano ovunque (scarto sotto un milionesimo di cella)
  RM.hSuolo=function(x,z){
    var tx=(inv(x)+1)*S/2, tz=(inv(z)+1)*S/2, ix=Math.max(0,Math.min(S-1,Math.floor(tx))), iz=Math.max(0,Math.min(S-1,Math.floor(tz)));
    var x0=curva(ix*2/S-1), x1=curva((ix+1)*2/S-1), z0=curva(iz*2/S-1), z1=curva((iz+1)*2/S-1), fx=(x-x0)/(x1-x0), fz=(z-z0)/(z1-z0);
    var a=pos.getY(iz*N+ix), b=pos.getY((iz+1)*N+ix), c=pos.getY((iz+1)*N+ix+1), d=pos.getY(iz*N+ix+1);      // i due triangoli della cella: (a,b,d) e (b,c,d), come in PlaneGeometry
    return fx+fz<=1 ? a+(d-a)*fx+(b-a)*fz : c+(b-c)*(1-fx)+(d-c)*(1-fz);
  };
}

/* nastro steso sul terreno lungo una linea */
RM.nastro=function(linea,larga,materiale,alza,quotaFissa){
  var punti=linea.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }), piena=larga, STR=quotaFissa==null?(RM.strozzature||[]):[];
  var curva=new THREE.CatmullRomCurve3(punti,false,'catmullrom',.35), n=Math.max(20,Math.round(curva.getLength()/(larga<.5?1:3))), v=[], uv=[], idx=[], k, p, t, nx, nz, y1, y2;
  for(k=0;k<=n;k++){
    p=curva.getPointAt(k/n); t=curva.getTangentAt(k/n); nx=-t.z; nz=t.x;
    larga=piena; for(var q=0;q<STR.length;q++){ var dq=Math.hypot(p.x-STR[q][0],p.z-STR[q][1]); if(dq<STR[q][2]) larga=Math.min(larga,STR[q][3]+(piena-STR[q][3])*RM.sfuma(STR[q][2]*.35,STR[q][2],dq)); }      // sotto un arco la strada si stringe alla luce del fornice      // a passo costante lungo la via: con getPoint i tratti lunghi restavano radi e il terreno copriva la strada
    var hq=RM.hSuolo||RM.h; y1=quotaFissa!=null?quotaFissa:hq(p.x+nx*larga,p.z+nz*larga)+alza; y2=quotaFissa!=null?quotaFissa:hq(p.x-nx*larga,p.z-nz*larga)+alza;
    v.push(p.x+nx*larga,y1,p.z+nz*larga, p.x-nx*larga,y2,p.z-nz*larga); uv.push(0,k/2,1,k/2);
    if(k<n){ var a=k*2; idx.push(a,a+2,a+1, a+1,a+2,a+3); }
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  var m=new THREE.Mesh(g,materiale); m.receiveShadow=true; m.userData.gruppo='strade'; scene.add(m); m.userData.curva=curva; return m;
};
/* strade (le vie strette del centro prendono la quota ogni 10 m, le altre ogni 30: con 30 m sulla Velia il nastro affondava nel terreno e la via Sacra sembrava a pezzi; 23 novembre 2026) */
var matStrada=new THREE.MeshStandardMaterial({color:RM.col(0xcdbfa3),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
/* Veste del PC: le strade non sono più nastri color crema ma lastricate di basalto («silex»), grigie e scurite dove passano le ruote, con i margini di terra e polvere più chiari;
   da vicino i poligoni del basolato, ognuno col suo tono; nella città che si svuota l'erba le invade a chiazze (dove la gente resta, nei nuclei, la scena non lo sa: è una media).
   I marciapiedi rialzati e le crepidini lungo le vie consolari sono resi solo col colore: uno schema. */
if(RM.VESTE) matStrada.onBeforeCompile=function(sh){ var A=String.fromCharCode(10), TVs=RM.trameVeste();
  sh.uniforms.uVeste=RM.vesteU; sh.uniforms.tMacchie={value:TVs.macchie}; sh.uniforms.uErbaS=RM.erba||{value:0};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying vec2 vXZs; varying vec2 vUvS;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vXZs=position.xz; vUvS=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying vec2 vXZs; varying vec2 vUvS; uniform float uVeste; uniform sampler2D tMacchie; uniform float uErbaS;'+A+
      'vec2 bH2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }')
    .replace('#include <color_fragment>',['#include <color_fragment>',
      'if(uVeste>0.5){ float bx=abs(vUvS.x-0.5)*2.0; vec4 mS=texture2D(tMacchie,vXZs/9.0); vec4 mL=texture2D(tMacchie,vXZs/70.0+0.3);',
      '  vec3 sel=vec3(0.175,0.168,0.152)*(0.88+0.24*mS.b)*(1.0-0.1*smoothstep(0.25,0.0,abs(bx-0.38)));',      // basolato, più scuro nei solchi delle ruote
      '  vec3 marg=vec3(0.3,0.26,0.19)*(0.9+0.2*mS.g);',
      '  diffuseColor.rgb=mix(sel,marg,smoothstep(0.72,0.86,bx));',
      '  float fwS=max(fwidth(vXZs.x),fwidth(vXZs.y));',
      '  if(fwS<0.03){ vec2 pq=vXZs/0.075; vec2 n=floor(pq); vec2 f=fract(pq); float d1=8.0; float d2=8.0; vec2 idv=vec2(0.0);',
      '    for(int j=-1;j<=1;j++){ for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); vec2 o=bH2(n+g); float dd=length(g+o-f); if(dd<d1){ d2=d1; d1=dd; idv=n+g; } else if(dd<d2) d2=dd; } }',
      '    float kv=1.0-smoothstep(0.012,0.03,fwS); float giunto=1.0-smoothstep(0.03,0.09+fwS*8.0,d2-d1);',
      '    diffuseColor.rgb*=1.0+kv*(1.0-smoothstep(0.72,0.86,bx))*((bH2(idv).x-0.5)*0.22-0.25*giunto); }',
      '  float erbaS=uErbaS*smoothstep(0.42,0.72,mL.r*0.6+mS.g*0.4)*(0.55+0.45*smoothstep(0.5,1.0,bx));',
      '  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.2,0.24,0.09)*(0.85+0.3*mS.r),erbaS*0.8); }'].join(A)); };

/* Tevere */
/* Il Tevere è torbido: «flavus», biondo, per i poeti latini. Fino al 23 novembre 2026 era turchese, più bello che vero; ora è un verde-grigio scuro: il giallo fango, provato, dall'alto non si leggeva più come un fiume. L'acqua limpida resta quella degli acquedotti (fontane, vasche). */
RM.matFiume=new THREE.MeshStandardMaterial({color:RM.col(0x5a6c53),roughness:.25,metalness:.1,side:THREE.DoubleSide});
RM.tempoAcqua={value:0};
RM.matFiume.onBeforeCompile=function(sh){                       // corrente che scorre e schiuma lungo le rive
  var A=String.fromCharCode(10); sh.uniforms.uTempo=RM.tempoAcqua;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying vec2 vRiva;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vRiva=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying vec2 vRiva; uniform float uTempo;').replace('#include <color_fragment>',['#include <color_fragment>',
    'float bordo=abs(vRiva.x-0.5)*2.0;',
    'float onda=sin(vRiva.y*5.0-uTempo*1.2+sin(vRiva.x*7.0+uTempo*0.5)*1.3)*0.5+0.5;',
    'diffuseColor.rgb*=0.88+0.26*onda*(1.0-bordo);',
    'float fwA=fwidth(vRiva.y); float vicA=1.0-smoothstep(0.02,0.12,fwA);',
    'diffuseColor.rgb*=1.0+vicA*0.07*sin(vRiva.y*37.0-uTempo*2.1+sin(vRiva.x*23.0+uTempo*0.9)*2.0)*sin(vRiva.x*19.0+vRiva.y*11.0+uTempo*0.6);',
    'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*2.2+0.08,smoothstep(0.8,0.97,bordo)*(0.35+0.4*onda));'].join(A));
  if(RM.VESTE) fiumeVeste(sh);
};
/* Il Tevere con la veste del PC (24 novembre 2026): acqua torbida di fiume di pianura, più bruna e opaca al centro, più chiara e gialla sulle secche lungo le rive (senza la schiuma
   bianca di prima); la superficie ha increspature lente che scendono con la corrente (si spengono quando diventano più piccole di un pixel: niente sfarfallio) e strisce di
   torbida più chiara; riflette il cielo secondo l'angolo di vista (Fresnel): quasi nulla guardando dall'alto, di più radente, come un fiume vero. Niente specchio. */
function fiumeVeste(sh){ var A=String.fromCharCode(10), TVf=RM.trameVeste();
  sh.uniforms.uVeste=RM.vesteU; sh.uniforms.tMacchie={value:TVf.macchie}; sh.uniforms.uCieloA=cielo.material.uniforms.alto; sh.uniforms.uCieloB=cielo.material.uniforms.basso;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying vec3 vWf;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vWf=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying vec3 vWf; uniform float uVeste; uniform sampler2D tMacchie; uniform vec3 uCieloA; uniform vec3 uCieloB; vec3 nFiume=vec3(0.0,1.0,0.0);')
    .replace('float bordo=abs(vRiva.x-0.5)*2.0;','float bordo=abs(vRiva.x-0.5)*2.0; vec3 base0=diffuseColor.rgb;')
    .replace('#include <normal_fragment_maps>',['#include <normal_fragment_maps>',
      'if(uVeste>0.5){',
      '  float bw=abs(vRiva.x-0.5)*2.0; vec4 mf=texture2D(tMacchie,vec2(vRiva.x*0.35,vRiva.y*0.045-uTempo*0.006));',
      '  diffuseColor.rgb=base0*vec3(1.08,0.9,0.78)*(0.94+0.12*mf.g)*(1.0-0.12*(1.0-bw));',      // torbida: bruna, un poco più scura al centro, a strisce
      '  diffuseColor.rgb=mix(diffuseColor.rgb,base0*vec3(1.75,1.55,1.05),smoothstep(0.78,0.98,bw)*0.7);',      // secche e fango lungo le rive
      '  float filo=smoothstep(0.62,0.8,texture2D(tMacchie,vec2(vRiva.x*1.3+0.2,vRiva.y*0.012-uTempo*0.004)).b);',      // filoni di torbida più chiara, lunghi, che scendono con la corrente
      '  diffuseColor.rgb*=1.0+0.16*filo*(1.0-bw);',
      '  vec2 p=vWf.xz; float fw=max(fwidth(p.x),fwidth(p.y)); vec2 g=vec2(0.0);',
      '  vec2 d1=vec2(0.6,0.8); vec2 d2=vec2(-0.83,0.55); vec2 d3=vec2(0.2,-0.98);',
      '  float am=0.4+1.2*mf.b;',      // le increspature vanno e vengono a chiazze: onde regolari dappertutto facevano righe
      '  g+=d1*cos(dot(p,d1)*9.0-uTempo*1.1+mf.r*4.0)*0.045*am*(1.0-smoothstep(0.6,1.6,fw*9.0));',      // ogni onda si spegne prima di stare in meno di quattro pixel
      '  g+=d2*cos(dot(p,d2)*15.0+uTempo*1.5)*0.03*am*(1.0-smoothstep(0.6,1.6,fw*15.0));',
      '  g+=d3*cos(dot(p,d3)*27.0-uTempo*2.0+sin(p.x*3.0))*0.022*am*(1.0-smoothstep(0.6,1.6,fw*27.0));',
      '  g+=(mf.rb-0.5)*0.1;',
      '  nFiume=normalize(vec3(-g.x,1.0,-g.y)); normal=normalize((viewMatrix*vec4(nFiume,0.0)).xyz);',
      '}'].join(A))
    .replace('#include <emissivemap_fragment>',['#include <emissivemap_fragment>',
      'if(uVeste>0.5){ vec3 Vf=normalize(cameraPosition-vWf); vec3 Rf=reflect(-Vf,nFiume); vec3 cie=mix(uCieloB,uCieloA,pow(clamp(Rf.y*1.6,0.0,1.0),0.55));',
      '  float Ff=0.02+0.98*pow(1.0-max(dot(nFiume,Vf),0.0),5.0); totalEmissiveRadiance+=cie*Ff*0.85*(1.0-0.6*smoothstep(0.8,1.0,abs(vRiva.x-0.5)*2.0)); }'].join(A));
}
RM.frame.push(function(dt){ RM.tempoAcqua.value+=dt; });
RM.posa=function(){
  if(RM.suolo) return;
  posaSuolo();
  /* Le strade si disegnano sul loro tracciato (24 novembre 2026). La curva che le liscia, dove un tratto corto confina con uno lungo, sbordava dalla linea dei dati fino a 38 m e faceva
     cappi: ma porte, case e passanti si calcolano sulla linea, e così la strada passava accanto all'arco di Gallieno invece che sotto. Con un punto ogni 30 m lo scarto resta sotto i 3. */
  function fitta(l){ var o=[l[0]], k, a, b, n, j; for(k=0;k<l.length-1;k++){ a=l[k]; b=l[k+1]; n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3)); for(j=1;j<=n;j++) o.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]); } return o; }
  RM.STRADE.forEach(function(s,i){ RM.nastro(fitta(s),TOPO.stradeLarghe[i],matStrada,.1); });
  RM.curvaFiume=RM.nastro(RM.FIUME,5.6,RM.matFiume,0,-.5).userData.curva;
};

/* ---- giorno / notte ---- */
RM.notte=0;
var fiumeG=RM.col(0x5a6c53), fiumeN=RM.col(0x10160f);
/* il velo del 536: sole pallido e azzurrognolo, cielo lattiginoso, ombre deboli (Cassiodoro, Variae XII 25; Procopio, Guerre IV 14) */
RM.velo=0;
var VELO={ alto:RM.col(0xa9b2ba), basso:RM.col(0xcfc9ba), sole:RM.col(0xc4d0e6) };
RM.applicaVelo=function(v){ if(Math.abs(v-RM.velo)<.004) return; RM.velo=v; RM.applicaLuce(RM.notte); };
/* La luce della veste del PC (24 novembre 2026): sole più caldo e un poco più forte, cielo più azzurro che riempie le ombre con una tinta fredda, la terra che rimanda
   un riflesso caldo; orizzonte meno giallo, perché la foschia della distanza (negli effetti a tutto schermo) è azzurrina. La notte resta quella di prima. */
var G2={ alto:RM.col(0x89abcc), basso:RM.col(0xe6e2d6), emiSu:RM.col(0xb4cbeb), emiGiu:RM.col(0x7c6b55), sole:RM.col(0xffd9a6), iSole:3.2, iEmi:.46, esp:.9 }, G1=G; RM.luceVeste=G2;
RM.hazeU={value:new THREE.Color(0xc9d3da)}; var HAZE_G=new THREE.Color(0xc9d3da), HAZE_N=new THREE.Color(0x1a2236);      // colore della foschia, già in sRGB: si mescola nella passata dei contorni
RM.applicaLuce=function(n){
  G=RM.vesteU.value>.5?G2:G1; RM.hazeU.value.copy(HAZE_G).lerp(HAZE_N,n); renderer.toneMappingExposure=RM.vesteU.value>.5?G2.esp:1.07;
  RM.notte=n; var v=RM.velo*(1-n);
  cielo.material.uniforms.alto.value.copy(G.alto).lerp(N.alto,n).lerp(VELO.alto,v*.85); cielo.material.uniforms.basso.value.copy(G.basso).lerp(N.basso,n).lerp(VELO.basso,v*.85);
  scene.fog.color.copy(cielo.material.uniforms.basso.value);
  emi.color.copy(G.emiSu).lerp(N.emiSu,n); emi.groundColor.copy(G.emiGiu).lerp(N.emiGiu,n); emi.intensity=(G.iEmi+(N.iEmi-G.iEmi)*n)*(1+.5*v);
  sole.color.copy(G.sole).lerp(N.sole,n).lerp(VELO.sole,v); sole.intensity=(G.iSole+(N.iSole-G.iSole)*n)*(1-.62*v);
  RM.matFiume.color.copy(fiumeG).lerp(fiumeN,n); RM.stelle.material.opacity=n*.9;
};
RM.applicaLuce(0);

/* ---- ciclo ---- */
/* ---- effetti a tutto schermo ----
   La scena viene disegnata su una tela intermedia con la sua mappa di profondità. Poi due passate a tutto schermo (dal 23 novembre 2026; prima era una sola):
   1. i contorni: una linea scura dove la profondità salta (sagome di edifici e colli);
   2. il finale: antialias (FXAA) su colori e contorni insieme, la sfocatura «da miniatura» verso l'alto e il basso dello schermo, un filo di saturazione.
   Con una passata sola i contorni si disegnavano dopo l'antialias e restavano a scalini, e i bordi degli edifici erano solo ammorbiditi. L'antialias a più campioni (MSAA)
   su questa tela è stato provato e scartato: con la profondità da riportare a un campione raddoppiava il tempo di ogni fotogramma.
   Serve WebGL2; altrimenti si disegna direttamente, con l'antialias della tela. */
/* nella passata dei contorni, con la veste: l'occlusione (quattro letture che coprono la scacchiera 2x2 della mezza risoluzione) e la foschia della distanza (non sul cielo) */
var VESTE_POST_C=['  if(uVeste>0.5){',
  '    if(uAO>0.0){ vec2 ua=vUv*aoK; float ao=0.25*(texture2D(tAO,ua+px).r+texture2D(tAO,ua-px).r+texture2D(tAO,ua+vec2(px.x,-px.y)).r+texture2D(tAO,ua+vec2(-px.x,px.y)).r);',      // aoK: la mezza risoluzione è arrotondata per eccesso, così ogni suo pixel copre esattamente due pixel della tela (25 novembre 2026)
  '      c*=mix(1.0,ao,uAO*(1.0-0.5*notte)*(1.0-0.35*smoothstep(250.0,700.0,p))); }',      // da lontano più leggera: dalla vista d'insieme scuriva i vicoli fino a sporcare la città
  '    float hz=(1.0-exp(-max(0.0,p-120.0)*0.0005))*0.36*step(p,3000.0);',
  '    c=mix(c,uHaze,hz); contorno*=1.0-min(1.0,hz*1.5); }'].join(String.fromCharCode(10));
var post=null, ALTA=1;      // ALTA: quante volte i pixel dello schermo ha la tela degli effetti (1; 1,25 o 1,5 con l'«alta qualità», più sotto)
/* Per i colonnati che da lontano diventano una fascia (js/costruttore.js): dov'è l'occhio e quanti pixel fa un'unità a distanza 1. Si aggiornano a ogni disegno,
   anche per l'ombra, che così sceglie colonne o fascia come le vede la camera e non come le vede il sole (24 novembre 2026) */
RM.vistaU={uOcchio:{value:new THREE.Vector3()}, uPxScala:{value:1000}, uSogliaCol:{value:7}};      // sotto i sette pixel di diametro una fila di colonne fitta (interasse di tre diametri) tremola: le misure del 24 novembre 2026 lo dicono
RM.occhio=function(cam,H){ RM.vistaU.uOcchio.value.copy(cam.position); RM.vistaU.uPxScala.value=H/(2*Math.tan(cam.fov*Math.PI/360)/(cam.zoom||1)); };
(function(){
  if(!renderer.capabilities.isWebGL2) return;
  var NL=String.fromCharCode(10);
  var tela=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false});
  tela.texture.encoding=THREE.sRGBEncoding; tela.texture.generateMipmaps=false;
  tela.depthTexture=new THREE.DepthTexture(4,4); tela.depthTexture.type=THREE.FloatType;      // profondità a 32 bit in virgola mobile (25 novembre 2026; prima 24 bit interi): sugli iPhone il formato a 24 bit non c'è e il browser lo sostituisce; vicino a 1 la precisione è la stessa
  var PREC='precision highp float; precision highp sampler2D;';      // le trame lette nelle passate (profondità compresa) a piena precisione: in WebGL2 i campionatori sono «lowp» se non lo si dice, e le schede grafiche Apple lo rispettano
  var tela2=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false});
  tela2.texture.generateMipmaps=false;
  var uPx={value:new THREE.Vector2(1,1)}, uSfoca={value:1}, uNotte={value:0}, uDens={value:1}, uScala={value:1}, uLarga={value:1}, uAoK={value:new THREE.Vector2(1,1)};      // condivisi dalle due passate; uScala: pixel della tela per pixel dello schermo; uLarga: densità di disegno rispetto a quella di base (la linea dei contorni resta larga uguale in punti); uAoK: tela piena / due volte la mezza
  var VS='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
  var FUOCO='float fuoco=smoothstep(0.24,0.52,abs(vUv.y-0.46))*sfoca;';                             // 0 al centro, 1 ai bordi alto e basso
  var matC=new THREE.ShaderMaterial({ depthTest:false, depthWrite:false, toneMapped:false,
    uniforms:{ tCol:{value:tela.texture}, tProf:{value:tela.depthTexture}, px:uPx, vicino:{value:camera.near}, lontano:{value:camera.far}, notte:uNotte, sfoca:uSfoca, scala:uScala, larga:uLarga, aoK:uAoK },
    vertexShader:VS,
    fragmentShader:[
      PREC,
      'uniform sampler2D tCol; uniform sampler2D tProf; uniform vec2 px; uniform float vicino; uniform float lontano; uniform float notte; uniform float sfoca; uniform float scala; uniform float larga; uniform vec2 aoK; varying vec2 vUv;',
      RM.VESTE?'uniform sampler2D tAO; uniform float uAO; uniform vec3 uHaze; uniform float uVeste;':'',
      'float prof(vec2 uv){ float z=texture2D(tProf,uv).x*2.0-1.0; return 2.0*vicino*lontano/(lontano+vicino-z*(lontano-vicino)); }',
      'void main(){',
      '  vec3 c=texture2D(tCol,vUv).rgb;',
      '  '+FUOCO,
      /* Dal 24 novembre 2026 la linea sta da un lato solo, sul pixel più lontano (fuori dalla sagoma), ed è un po' più chiara: con i due lati ogni spigolo
         faceva una riga di due pixel che scattava avanti e indietro mentre la camera si muoveva (sui Fori da vicino il tremolio misurato cala di circa un decimo). La distanza che la
         spegne si misura sul pixel più vicino, perché la sagoma contro lo sfondo lontano resti segnata. */
      '  vec2 q=px*scala*larga;',                                                                         // i vicini a un pixel di schermo: con la tela più grande la linea resta larga uguale
      '  float p=prof(vUv), pa=prof(vUv+vec2(q.x,0.0)), pb=prof(vUv-vec2(q.x,0.0)), pc=prof(vUv+vec2(0.0,q.y)), pd=prof(vUv-vec2(0.0,q.y));',
      '  float salto=max(0.0,4.0*p-pa-pb-pc-pd)/p, pv=min(p,min(min(pa,pb),min(pc,pd)));',
      '  float contorno=smoothstep(0.006,0.03,salto)*(1.0-fuoco)*(1.0-smoothstep(500.0,1400.0,pv));',
      RM.VESTE?VESTE_POST_C:'',
      '  c=mix(c,c*vec3(0.34,0.25,0.18),contorno*0.5*(1.0-0.6*notte));',
      '  gl_FragColor=vec4(c,1.0);',
      '}'].join(NL) });
  /* Veste del PC: occlusione d'ambiente (quanto un punto è chiuso dalle cose vicine: piedi dei muri, vicoli, cortili, attorno alle colonne) a metà risoluzione, letta dalla sola
     profondità. Otto prove in un disco il cui raggio nel mondo cresce con la distanza (3 m sui Fori da vicino, una quarantina di metri dalla vista d'insieme), ruotato a scacchiera 2x2
     e riunito nella passata dei contorni con quattro letture bilineari che coprono la scacchiera: il risultato è fermo sullo schermo, non brulica. Poi la foschia della distanza,
     azzurrina, che dà profondità alla vista d'insieme senza fare nebbia. Peso dell'occlusione: RM.QUALITA.ao (0 in «bassa»). */
  var telaAO=null, matAO=null, uAO={value:0}, uNAO={value:8}, uTan={value:new THREE.Vector2(1,1)}, uPxS={value:1000};
  if(RM.VESTE){
    telaAO=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false}); telaAO.texture.generateMipmaps=false;
    matC.uniforms.tAO={value:telaAO.texture}; matC.uniforms.uAO=uAO; matC.uniforms.uHaze=RM.hazeU; matC.uniforms.uVeste=RM.vesteU;
    matAO=new THREE.ShaderMaterial({ depthTest:false, depthWrite:false, toneMapped:false,
      uniforms:{ tProf:{value:tela.depthTexture}, px:uPx, vicino:{value:camera.near}, lontano:{value:camera.far}, uTan:uTan, uPxS:uPxS, uNAO:uNAO },
      vertexShader:VS,
      fragmentShader:[
        PREC,
        'uniform sampler2D tProf; uniform vec2 px; uniform float vicino; uniform float lontano; uniform vec2 uTan; uniform float uPxS; uniform float uNAO; varying vec2 vUv;',
        'float lin(float zt){ float z=zt*2.0-1.0; return 2.0*vicino*lontano/(lontano+vicino-z*(lontano-vicino)); }',
        'float prof(vec2 uv){ return lin(textureLod(tProf,uv,0.0).x); }',      // textureLod: nel giro delle prove la lettura non chiede derivate (WebGL2, come tutta questa passata)
        'vec3 posV(vec2 uv,float d){ return vec3((uv*2.0-1.0)*uTan*d,-d); }',
        'void main(){',
        /* Il punto di partenza è un pixel preciso della tela piena, il primo del blocco 2x2 (25 novembre 2026). Prima si leggeva la profondità al centro del pixel della mezza
           risoluzione, cioè esattamente sul confine fra quattro pixel della tela: quale dei quattro si prende lo decide l'arrotondamento della scheda grafica, e sugli iPhone
           cambiava da una riga all'altra. Le normali, prese dalle differenze fra pixel vicini, saltavano su quelle righe: righe orizzontali ferme sullo schermo. */
        '  ivec2 tx=min(ivec2(gl_FragCoord.xy)*2,textureSize(tProf,0)-1); vec2 u0=(vec2(tx)+0.5)*px;',
        '  float d=lin(texelFetch(tProf,tx,0).x); if(d>3000.0){ gl_FragColor=vec4(1.0); return; }',
        '  vec3 P=posV(u0,d); vec3 N=normalize(cross(dFdx(P),dFdy(P)));',
        '  float R=0.16+d*0.0042; float rpx=min(R*uPxS/d,70.0);',                                    // raggio nel mondo e sullo schermo (pixel della tela piena)
        '  vec2 sc=mod(floor(gl_FragCoord.xy),2.0); float a0=(sc.x*2.0+sc.y)*0.3927; float ca=cos(a0); float sa=sin(a0); mat2 ro=mat2(ca,sa,-sa,ca);',
        '  float s=0.0; float R2=R*R;',
        '  for(int i=0;i<12;i++){ if(float(i)>=uNAO) break; float t=(float(i)+0.6)/uNAO; float a=float(i)*2.39996; vec2 o=ro*vec2(cos(a),sin(a))*sqrt(t)*rpx*px; vec2 uv=(floor((u0+o)/px)+0.5)*px;',      // quante prove: RM.QUALITA.aoN; ogni prova cade al centro di un pixel della tela, mai su un confine
        '    vec3 v=posV(uv,prof(uv))-P; float vv=dot(v,v); s+=max(0.0,dot(v,N)*inversesqrt(vv+1e-6)-0.08)*(1.0-smoothstep(R2,R2*4.0,vv)); }',
        '  float ao=clamp(1.0-s*1.68/uNAO,0.0,1.0); gl_FragColor=vec4(ao,ao,ao,1.0);',
        '}'].join(NL) });
  }
  /* FXAA nella forma breve di Timothy Lottes (nove letture): cerca la direzione del bordo dai quattro angoli e media lungo quella */
  var mat=new THREE.ShaderMaterial({ depthTest:false, depthWrite:false, toneMapped:false,
    uniforms:{ tCol:{value:tela2.texture}, px:uPx, sfoca:uSfoca, dens:uDens, notte:uNotte, scala:uScala },
    vertexShader:VS,
    fragmentShader:[
      PREC,
      'uniform sampler2D tCol; uniform vec2 px; uniform float sfoca; uniform float dens; uniform float scala; varying vec2 vUv;',
      RM.VESTE?'uniform float uVeste; uniform float uGrado;':'',
      'float lum(vec3 c){ return dot(c,vec3(0.299,0.587,0.114)); }',
      'void main(){',
      '  vec3 c;',
      '  if(scala>1.01){ vec2 o=px*scala*0.25;',                                                     // tela più grande dello schermo («alta qualità»): ogni pixel è la media di quattro letture bilineari, al posto dell'FXAA
      '    c=0.25*(texture2D(tCol,vUv-o).rgb+texture2D(tCol,vUv+vec2(o.x,-o.y)).rgb+texture2D(tCol,vUv+vec2(-o.x,o.y)).rgb+texture2D(tCol,vUv+o).rgb); } else {',
      '  vec3 cM=texture2D(tCol,vUv).rgb;',
      '  float lNO=lum(texture2D(tCol,vUv+vec2(-px.x,-px.y)).rgb), lNE=lum(texture2D(tCol,vUv+vec2(px.x,-px.y)).rgb), lSO=lum(texture2D(tCol,vUv+vec2(-px.x,px.y)).rgb), lSE=lum(texture2D(tCol,vUv+px).rgb), lM=lum(cM);',
      '  float l0=min(lM,min(min(lNO,lNE),min(lSO,lSE))), l1=max(lM,max(max(lNO,lNE),max(lSO,lSE)));',
      '  vec2 dir=vec2(-((lNO+lNE)-(lSO+lSE)),(lNO+lSO)-(lNE+lSE));',
      '  float riduci=max((lNO+lNE+lSO+lSE)*0.03125,0.0078125);',
      '  dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+riduci),vec2(-8.0),vec2(8.0))*px;',
      '  vec3 cA=0.5*(texture2D(tCol,vUv-dir*0.16667).rgb+texture2D(tCol,vUv+dir*0.16667).rgb);',
      '  vec3 cB=cA*0.5+0.25*(texture2D(tCol,vUv-dir*0.5).rgb+texture2D(tCol,vUv+dir*0.5).rgb);',
      '  float lB=lum(cB);',
      '  c=(lB<l0||lB>l1)?cA:cB; }',
      '  '+FUOCO,
      '  if(fuoco>0.02){ vec2 r=px*fuoco*2.1*dens*scala;',                                                // la sfocatura ha la stessa larghezza sullo schermo a ogni risoluzione
      '    c=(c*2.0+texture2D(tCol,vUv+vec2(r.x,0.0)).rgb+texture2D(tCol,vUv-vec2(r.x,0.0)).rgb+texture2D(tCol,vUv+vec2(0.0,r.y)).rgb+texture2D(tCol,vUv-vec2(0.0,r.y)).rgb',
      '      +texture2D(tCol,vUv+r*0.7).rgb+texture2D(tCol,vUv-r*0.7).rgb+texture2D(tCol,vUv+vec2(r.x,-r.y)*0.7).rgb+texture2D(tCol,vUv+vec2(-r.x,r.y)*0.7).rgb)/10.0; }',
      '  float g=lum(c); c=mix(vec3(g),c,1.1);',
      RM.VESTE?'  if(uVeste>0.5){ c=clamp(c,0.0,1.0); c=mix(c,c*c*(3.0-2.0*c),uGrado); }':'',      // veste: una curva a S leggera, più contrasto nei toni medi
      '  c+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))))-0.5)/255.0;',      // un filo di retino (mezzo gradino degli 8 bit, fermo sullo schermo): nelle penombre (l'interno di San Pietro nell'800) le sfumature scure non fanno più scalini di colore sugli schermi OLED (25 novembre 2026)
      '  gl_FragColor=vec4(c,1.0);',
      '}'].join(NL) });
  if(RM.VESTE){ mat.uniforms.uVeste=RM.vesteU; mat.uniforms.uGrado=RM.gradoU={value:.32}; }
  var quadro=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat); quadro.frustumCulled=false;
  var scena2=new THREE.Scene(), camera2=new THREE.OrthographicCamera(-1,1,1,-1,0,1); scena2.add(quadro);
  post={ tela:tela, mat:mat, scena:scena2, camera:camera2, attivo:true, dens:uDens,
    /* misure in pixel veri delle due tele */
    misura:function(W,H){ W=Math.round(W); H=Math.round(H); tela.setSize(W,H); tela2.setSize(W,H); uPx.value.set(1/W,1/H);
      if(telaAO){ var wa=Math.max(2,(W+1)>>1), ha=Math.max(2,(H+1)>>1); telaAO.setSize(wa,ha); uAoK.value.set(W/(2*wa),H/(2*ha)); } },      // la mezza risoluzione per eccesso: con una tela dispari l'ultimo pixel ha il suo
    ao:uAO, aoN:uNAO, larga:uLarga, telaAO:telaAO,
    /* la scena e le due passate, sulla tela della pagina. Chi disegna fuori dal ciclo (i fotogrammi delle infografiche, le prove) passa di qui */
    disegna:function(sc,cam){
      uScala.value=Math.max(1,tela.width/Math.max(1,renderer.domElement.width));
      if(cam.isPerspectiveCamera) RM.occhio(cam,tela.height/uScala.value);      // in pixel dello schermo: la soglia dei colonnati non cambia con la tela
      if(cam.isPerspectiveCamera && matC.uniforms.vicino.value!==cam.near){ matC.uniforms.vicino.value=cam.near; if(matAO) matAO.uniforms.vicino.value=cam.near; }      // il piano vicino può scendere per i primi piani (800, js/scene-tappe.js): le passate leggono la profondità con quello vero
      renderer.setRenderTarget(tela); renderer.render(sc,cam);
      if(telaAO && uAO.value>0 && cam.isPerspectiveCamera){ var ty=Math.tan(cam.fov*Math.PI/360)/(cam.zoom||1); uTan.value.set(ty*cam.aspect,ty); uPxS.value=tela.height/(2*ty);
        if(RM.q===1) uNAO.value=tela.width*tela.height>1.6e6?4:RM.QUALITA.aoN[1];      // «media» su uno schermo grande (1920x1080): quattro prove invece di sei, perché il gradino non costi di più dove i pixel sono più del doppio
        quadro.material=matAO; renderer.setRenderTarget(telaAO); renderer.render(scena2,camera2); }
      quadro.material=matC; renderer.setRenderTarget(tela2); renderer.render(scena2,camera2);
      quadro.material=mat; renderer.setRenderTarget(null); renderer.render(scena2,camera2);
    } };
})();
RM.post=post;
/* le misure della tela della pagina e delle tele degli effetti. La densità di disegno (pixel della tela per punto) è quella della scala della qualità (DENS, più sotto)
   o, sotto la densità di base, quella del regolatore di prima (prReg); la tela della pagina si rifà solo se cambia davvero, perché rifarla la svuota */
function misura(){
  var w=contenitore.clientWidth||1, h=contenitore.clientHeight||1, cv=renderer.domElement;
  var pr=(DENS>PR0+.001)?limita(DENS,w,h):(prReg||renderer.getPixelRatio());
  if(Math.abs(renderer.getPixelRatio()-pr)>.001 || cv.width!==Math.floor(w*pr) || cv.height!==Math.floor(h*pr)){ renderer.setPixelRatio(pr); renderer.setSize(w,h,false); }
  camera.aspect=w/h; camera.updateProjectionMatrix();
  if(post){ post.misura(Math.max(2,Math.floor(w*pr*ALTA)),Math.max(2,Math.floor(h*pr*ALTA))); post.dens.value=pr; post.larga.value=(PR0 && pr>PR0+.001)?pr/PR0:1; }
}
window.addEventListener('resize',misura); misura();
if(window.ResizeObserver) new ResizeObserver(misura).observe(contenitore);
/* Regolatore della qualità (rifatto il 23 novembre 2026).
   Prima scattava solo sotto i 28 fotogrammi al secondo, non risaliva mai, e il suo primo gradino (spegnere gli effetti a tutto schermo) su molte schede rallentava invece
   di alleggerire, perché riaccendeva l'antialias a più campioni. Le misure dicono che il tempo di un fotogramma dipende soprattutto dal numero di pixel: quindi
   - i gradini sono, nell'ordine: la risoluzione (da quella di partenza fino a un pixel per pixel, a passi di un terzo dei pixel), poi le ombre, poi passanti e fumo (RM.leggero);
   - si scende quando la media di cinquanta fotogrammi supera i 22 millesimi (sotto i 45 al secondo); dal 24 novembre 2026, sul PC, i 18,2 (sotto i 55: il gradino «media» deve tenere i 60);
   - dopo ogni discesa si controlla se è servita: se il guadagno è sotto il 7% il freno è altrove (il processore, o un telefono in risparmio energetico, che ferma tutto
     a 30 al secondo): si rimette com'era e ci si ferma;
   - dopo sei medie di fila a pieno ritmo si prova a risalire di un gradino di risoluzione; se non regge si torna giù e non si riprova più; in tutto si risale al massimo tre volte.
   I fotogrammi in cui l'anno sta cambiando non contano: lì si ricostruisce mezza città. ?qualita=fissa lo spegne (per le prove). RM.livello = gradino corrente, 0 = tutto. */
RM.livello=0;
var PR0=renderer.getPixelRatio(), prReg=PR0, PR_MIN=PR0>1?1:.8, GRADINI=[];
(function(){ var q=PR0; while(q>PR_MIN+.01){ q=Math.round(q*.82*100)/100; if(q-PR_MIN<.2) q=PR_MIN; GRADINI.push(q); } GRADINI.push('ombre','leggero'); })();
function metti(n){                                   // porta la scena al gradino n
  var pr=PR0, ombre=true, leggero=false, k, g;
  for(k=0;k<n;k++){ g=GRADINI[k]; if(typeof g==='number') pr=g; else if(g==='ombre') ombre=false; else leggero=true; }
  if(Math.abs(prReg-pr)>.001){ prReg=pr; misura(); }
  if(sole.castShadow!==ombre){ sole.castShadow=ombre; renderer.shadowMap.needsUpdate=true; }
  if(leggero) RM.leggero=true;
  RM.livello=n;
}
var SOGLIA=(piccolo||(navigator.maxTouchPoints>0))?.022:.0182, prova=null, buone=0, noSalita=false, salite=0, fermo=/[?&]qualita=fissa/.test(location.search), scalda=40;
function regola(media){
  if(fermo) return;
  if(prova){
    var p=prova; prova=null;
    if(p.su){ if(media>.0185){ metti(RM.livello+1); noSalita=true; scalda=20; } return; }                                      // la risalita non ha retto
    if(media>p.prima*.93 && GRADINI[RM.livello-1]!=='leggero'){ metti(RM.livello-1); fermo=true; scalda=20; return; }           // la discesa non è servita
  }
  if(media>SOGLIA){ buone=0; if(RM.livello<GRADINI.length){ prova={prima:media}; metti(RM.livello+1); scalda=20; } return; }
  if(media<.0172 && RM.livello>0 && !noSalita && typeof GRADINI[RM.livello-1]==='number'){ if(++buone>=6){ buone=0; prova={su:true}; metti(RM.livello-1); scalda=20; if(++salite>=3) noSalita=true; } }
  else buone=0;
}
/* ---- La scala della qualità (24 novembre 2026; l'utente: «miglioralo al massimo e cerca un modo smart per renderlo il più fluido possibile», «metti uno switch»).
   Cinque gradini, dal più leggero: «bassa» (i telefoni com'erano fino al 24 novembre 2026), «telefono» (la veste senza le parti care: suolo ed erba, basolato, tetti e mattoni,
   Tevere, luce e foschia, poche figure vicine; niente occlusione, niente risoluzione maggiorata, ombre a 2048), «media» (il PC di riferimento, una Radeon integrata: deve tenere
   60 fotogrammi al secondo), «alta», «massima». Nelle file di RM.QUALITA l'indice è quello di NOMI_Q: «telefono» sta in coda (indice 4), così le file a quattro gradini scritte
   dai moduli restano valide; l'ordine della scala è SCALA. Le file a quattro si completano da sole (completaQ: il valore di TEL_Q, o quello di «bassa»).
   Ogni gradino è solo una fila di numeri (RM.QUALITA): risoluzione della tela degli effetti, lato della mappa delle ombre, e quelli che i moduli aggiungono
   (le figure vicine in js/vita.js, i ciuffi d'erba, gli alberi…), letti con RM.qp(nome). Chi deve rifare qualcosa al cambio si iscrive con RM.qualita.quando(fn).
   «Automatica» (la norma; ricordata nel browser come le scelte a mano) non riconosce i modelli dal nome: misura. Sui telefoni pretende i 60 al secondo pieni (qui sotto);
   sul PC ha soglie sue (si veda «Sul PC», più sotto).
   - Misura d'avvio (24 novembre 2026, sera; l'utente: «una qualità automatica che faccia un controllo sulla capacità di ogni telefono»): la prima volta che la città è sullo
     schermo, a scena tranquilla, si contano gli intervalli fra un fotogramma e l'altro (requestAnimationFrame è agganciato allo schermo, 60 o 120 volte al secondo: non si
     misurano i millesimi sotto il tetto ma quanti fotogrammi saltano) e il lavoro del processore, per poco più di un secondo; se è lento si scende di un gradino e si riprova;
     se è pulito, di nascosto, la scena si disegna una volta in più per fotogramma, poi due (la tela si ridisegna subito dopo: non si vede), e da quanto carico in più regge
     si sceglie il gradino di partenza con la tabella COSTO (costo di ogni gradino rispetto al «telefono», misurato sul PC a 393 x 852 punti con densità 3 e alzato per prudenza):
     la scena in più costa quasi un fotogramma intero, e se ne conta metà. In tutto tre o quattro secondi.
     Il gradino trovato si ricorda (localStorage «rm-qualita-auto», con la data e la misura dello schermo) e si rimisura dopo sette giorni o su un altro schermo.
   - Poi sale di un gradino quando per due secondi e mezzo la scena è tranquilla (niente volo, nessun cambio d'anno da un secondo e mezzo, camera ferma o mossa piano)
     e negli ultimi novanta fotogrammi il ritmo è pieno (media sotto 1,05 volte il periodo di riferimento, cioè 17,5 millesimi a 60 al secondo), nessuno degli ultimi venti è lungo
     e il lavoro del processore per fotogramma sta sotto i 10,5 millesimi; il tempo della scheda grafica dalla pagina non si legge: per questo dopo ogni passo si guarda il ritmo vero, e
   - scende subito di un gradino se la media degli ultimi venti fotogrammi supera 1,09 volte il periodo (18,2 millesimi) e almeno quattro sono lunghi: è un «ritorno»; dopo il primo
     non riprova per trenta secondi, dopo il secondo non sale più per tutta la visita. Sopra il gradino di partenza scende anche nei voli; sotto, solo a scena tranquilla.
   - Se rallenta dopo tre quarti di minuto senza inciampi (il telefono si scalda, entra in risparmio energetico) scende e non risale più (e il gradino più basso non si ricorda);
     se una discesa a scena tranquilla non migliora il ritmo il freno è altrove (un telefono in risparmio, fermo a 30 al secondo): si torna su e non si scende più.
   - Il periodo di riferimento è 1/60 di secondo; se nei fotogrammi in cui la città non si disegna lo schermo batte più piano di 36 volte al secondo (risparmio energetico) vale quello.
   - La risoluzione più alta (1,25 e 1,5 volte i pixel dello schermo: da lontano la città trema soprattutto per le migliaia di case di pochi pixel, e lì serve solo disegnare
     più pixel; la passata finale riduce la tela con quattro letture bilineari per pixel) vale solo a scena tranquilla: nei voli, nei cambi d'anno e negli spostamenti veloci
     la tela torna a 1, senza contarlo come ritorno. Cambiano solo le due tele intermedie, e solo ai passi. In automatica non si va oltre 2,25 pixel di tela per punto (risQ).
   Sotto «bassa» resta il regolatore di prima (risoluzione sotto 1, ombre, passanti): in automatica conta solo in «bassa», con una scelta a mano dove la tela è a 1.
   - Sul PC (25 novembre 2026). L'utente, col suo PC in «automatica (bassa)»: «Perché da pc mi va in qualità automatica (bassa) quando riesco a gestire comunque quella
     massima?», e dopo la prova: «stiamo parlando di un PC secondo me non possiamo fare gli stessi calcoli di un telefonino». La sua prova (grafica Intel integrata, finestra
     1528 x 794, densità 1,25, 60 Hz) dava bassa 59,4, telefono 58,6, media 56,9, alta 47,7, massima 39,6 al secondo (nei voli 39,1), 11 fotogrammi su 342 oltre 34 millesimi
     in «massima», il processore a 5-7 millesimi: il freno è la scheda grafica, e con la regola dei telefoni (scendere appena la media supera 18,2 millesimi) finiva in «bassa».
     Su un telefono i 60 pieni servono (calore, batteria, il dito che trascina la città); su un PC a schermo grande chi guarda preferisce il dettaglio, e 40 al secondo
     gli sembrano fluidi. PC vuol dire nessun tocco (TOCCO_Q) e uno schermo di almeno 700 punti sul lato corto (PC_Q); sui dispositivi al tocco, anche i portatili col vetro
     sensibile, e sugli schermi piccoli resta tutto come sopra. Sul PC:
     · sale di un gradino se, a scena tranquilla, nei novanta fotogrammi il gradino attuale tiene almeno 42 al secondo (23,8 millesimi), con al più un fotogramma da 50
       millesimi e il processore sotto i 10,5;
     · scende se due finestre di novanta fotogrammi di fila stanno sotto i 35 al secondo (28,6 millesimi; il più lungo non conta), o se uno su otto dura 50 millesimi o più.
       Fra 42 e 35 c'è l'isteresi: a 60 Hz i fotogrammi durano 16,7, 33,3 o 50 millesimi, e un gradino da 40 al secondo è metà dell'uno e metà dell'altro; la media di venti
       balla di quattro millesimi, quella di novanta di uno, e due finestre di fila tolgono il caso (in mezz'ora simulata, con venti sequenze diverse, il PC dell'utente resta
       sempre in «massima»). «Lungo», sul PC, vuol dire 50 millesimi (PC_LUNGO, 45): oltre 20 lo è metà dei fotogrammi di un gradino che va benissimo a 40;
     · un gradino da cui si è scesi non si riprova per la visita (alta.tetto): una prova sola, niente altalena fra «media» e «alta»;
     · non scende sotto «media» se non quando «media» sta sotto i 24 al secondo (PC_PAVIMENTO: una macchina davvero debole); sotto, le soglie di sopra (35 e 42);
     · la misura d'avvio parte da «media» con le stesse soglie (pulita da 42, lenta sotto i 24);
     · il gradino ricordato porta nella firma la versione della regola (PC_REGOLA): quelli trovati con la regola dei telefoni si buttano e si rimisura. Le scelte a mano restano.
     Con uno schermo che batte più piano (risparmio, periodoV) le soglie si allargano come sopra. La densità oltre «massima» (solo con più di 2 pixel per punto) vuole
     ancora i 60 pieni. Prova senza schermo: node src/prove/automatica-pc.js (anche --semi=20, e con un'altra copia del file per confrontare le decisioni).
   ?qualita=bassa|telefono|media|alta|massima fissa un gradino (per le prove, non ricordato); ?qualita=fissa spegne i regolatori e tiene il gradino di partenza.
   ?prova=qualita carica js/prova-qualita.js, che prova i gradini uno dopo l'altro e dà una tabella (RM.qualita.forza e rilascia).
   RM.regolatore.alta per le prove: stato(), passo(dt,lavoro,ora,calmo) per simulare i tempi, azzera(). */
var NOMI_Q=['bassa','media','alta','massima','telefono'];
var SCALA=[0,4,1,2,3];      // l'ordine dei gradini, dal più leggero: bassa, telefono, media, alta, massima (indici delle file)
RM.QUALITA={ ris:[1,1,1.25,1.5,1], ombra:[1536,2048,4096,4096,2048], prato:[0,1,1,1,1],
  veste:[0,1,1,1,1],      // la veste (suolo, erba, luce, acqua, tetti): 0 in «bassa», che resta com'era
  ao:[0,.75,.8,.8,0],      // peso dell'occlusione d'ambiente negli effetti a tutto schermo
  aoN:[0,6,8,12,0],      // quante prove per pixel dell'occlusione (in «media» quattro sopra 1,6 milioni di pixel)
  dens:[0,2,2,3,0] };      // tetto della densità di disegno scelto a mano (0: quella di base, 1,5 sui telefoni, 2 sul PC; mai oltre quella dello schermo). In automatica la densità sale solo dopo «massima» (DPASSI)
/* La densità di disegno (25 novembre 2026; l'iPhone dell'utente, 393 x 852 punti a densità 3, teneva 60 al secondo anche in «massima» con la tela a 589 x 1042 pixel, metà
   della definizione dello schermo). Fino a oggi la tela della pagina aveva al più 1,5 pixel per punto sui telefoni e 2 sul PC (PR0), a ogni gradino; «alta» e «massima» davano
   più pixel solo alla tela degli effetti (ris, 1,25 e 1,5 volte), che la passata finale riduce alla tela della pagina, e il browser poi la ingrandisce allo schermo.
   Ora la densità è un altro numero della scala: in automatica, dopo «massima», due passi in più, a densità 2 e alla densità piena dello schermo (al più 3), uno alla volta e
   solo dopo cinque secondi tranquilli a ritmo pieno senza un solo fotogramma lungo; scendendo sono i primi a cadere. Con la densità alta la tela degli effetti non si
   allarga più (al più 2,25 pixel per punto in tutto: a densità 2 la scena costa quanto «massima» di prima, ma lo schermo la mostra più nitida; a densità 3 si disegna
   un pixel per pixel dello schermo). Un tetto ai pixel della tela della pagina (TETTO) tiene a bada tablet e schermi grandi. Sul PC a densità 1 o 2 non cambia nulla. */
var DPR=window.devicePixelRatio||1, DPIENA=Math.min(DPR,3), DPASSI=[PR0], TETTO=4.5e6, DENS=PR0, densMano=null, densProva=null, rifai=false;      // DPASSI: le densità della scala in automatica, dalla base; densMano: scelta dalla prova («Usa questo gradino»); rifai: la tela della pagina si rifà all'inizio del fotogramma seguente, non dopo averlo disegnato (si vedrebbe vuota)
if(DPIENA>PR0+.05){ if(DPIENA>2.05 && PR0<1.95) DPASSI.push(2); DPASSI.push(DPIENA); }
function limita(d,w,h){ if(d<=PR0+.001) return d; w=w||contenitore.clientWidth||1; h=h||contenitore.clientHeight||1;      // il tetto dei pixel, mai sotto la densità di base
  return Math.max(PR0,Math.min(d,Math.floor(Math.sqrt(TETTO/(w*h))*100)/100)); }
var TEL_Q={figScena:52000};      // il «telefono» nelle file a quattro gradini dei moduli: sui telefoni le scene preparano solo le persone di «bassa» (js/scene-tappe.js) e le mostrano tutte
function completaQ(){ for(var k in RM.QUALITA){ var v=RM.QUALITA[k]; if(Array.isArray(v) && v.length<5) v[4]=(k in TEL_Q)?TEL_Q[k]:v[0]; } }
var COSTO=[.95,1,1.15,1.5,1.9];      // costo di un fotogramma per gradino, nell'ordine della scala, rispetto al «telefono»: sulla Radeon a 393 x 852 (densità 3) 0,95 / 1 / 1,05 / 1,2 / 1,35, con la scena che pesa quasi tutto il fotogramma; qui alzati per le schede che pagano soprattutto i pixel (alta 1,56 e massima 2,25 volte i pixel)
var TOCCO_Q=(navigator.maxTouchPoints>0) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
var LATO_SCH=0; try{ LATO_SCH=Math.min(screen.width,screen.height)||0; }catch(e){}
var PC_Q=!TOCCO_Q && LATO_SCH>=700;      // il PC (25 novembre 2026, si veda in testa al blocco): nessun tocco e uno schermo non piccolo; conta lo schermo, non la finestra (un portatile a 1366 x 768 ha meno di 700 punti d'altezza dentro il browser)
var PC_SALE=1/42, PC_SCENDE=1/35, PC_PAVIMENTO=1/24, PC_LUNGO=.045, PC_N=90, PC_REGOLA='pc2';      // le soglie del PC, in secondi per fotogramma (si veda in testa al blocco); PC_LUNGO: un fotogramma da 50 millesimi a 60 Hz; PC_N: i fotogrammi guardati per scendere (tutta la finestra, più di due secondi a 40 al secondo: con venti, fra 16,7 e 33,3 millesimi mescolati, la media balla di 4 millesimi e un gradino da 39 al secondo scenderebbe per caso); PC_REGOLA: la versione della regola, nella firma del gradino ricordato
var SENZA_AO=/[?&]ao=0/.test(location.search), FIRMA='';      // ?ao=0 spegne l'occlusione d'ambiente (per le prove: le righe orizzontali dell'iPhone, 25 novembre 2026)
try{ FIRMA=[screen.width,screen.height,Math.round((window.devicePixelRatio||1)*100)].join('x')+(PC_Q?'-'+PC_REGOLA:''); }catch(e){}      // sul PC la firma porta la versione della regola: i gradini ricordati con la regola dei telefoni (fino al 25 novembre 2026) non valgono più
var P_DEF=PC_Q?2:(piccolo||TOCCO_Q)?1:2, qScelta=null, qUrl=(/[?&]qualita=(bassa|telefono|media|alta|massima)/.exec(location.search)||[])[1], memAuto=null;      // senza misura: «telefono» sui dispositivi al tocco e sugli schermi piccoli, «media» sul PC
try{ var qMem=localStorage.getItem('rm-qualita'); if(NOMI_Q.indexOf(qMem)>=0){ qScelta=qMem; var dm=+localStorage.getItem('rm-qualita-dens'); if(dm>0) densMano=dm; }
  var ma=JSON.parse(localStorage.getItem('rm-qualita-auto')||'null'), et=ma?Date.now()-ma.t:-1; if(ma && NOMI_Q.indexOf(ma.g)>=0 && ma.s===FIRMA && et>=0 && et<7*864e5) memAuto=ma; }catch(e){}
if(qUrl){ qScelta=qUrl; var dU=+((/[?&]dens=([\d.]+)/.exec(location.search)||[])[1]); densMano=dU>0?dU:null; }      // ?qualita=massima&dens=2 per le prove
var NS=SCALA.length, ND=DPASSI.length-1, TOP=NS-1+ND;      // in automatica la scala continua dopo «massima» con i passi della densità: posizioni da 0 a TOP
function posDi(nome){ return SCALA.indexOf(NOMI_Q.indexOf(nome)); }
function gDi(p){ return SCALA[Math.min(p,NS-1)]; }
function dpDi(p){ return Math.max(0,p-(NS-1)); }
var p0=qScelta?posDi(qScelta):memAuto?posDi(memAuto.g)+(memAuto.g==='massima'?Math.min(memAuto.d||0,ND):0):P_DEF;
var alta={p:p0, g:gDi(p0), partenza:Math.min(p0,NS-1), ritorni:0, spenta:false, calore:false, giuFermo:false, verifica:null, blocco:0, discesa:-1e9, cambio:0, salvato:true, calma:0, f:[], motivo:'', calmo:true, calmoD:true, calmoDa:0, densFerma:false, ascoltatori:[]};      // calmoD: tranquilla da più di 0,7 secondi (la densità alta torna solo allora: non si rifà la tela a ogni tocco); densFerma: dopo una discesa dalla densità alta non la si riprova più
var altaAdatta=!fermo && !qScelta, provaQ=null;      // in automatica: nessuna scelta a mano, regolatore acceso
var avvio={fatta:!altaAdatta || !!memAuto, carico:0, f:[], calma:0, primo:0, scese:0};      // la misura d'avvio: si fa una volta, se non c'è un gradino ricordato
if(qUrl) fermo=true;
RM.q=alta.g;
RM.qp=function(nome){ completaQ(); var v=RM.QUALITA[nome]; return v?v[RM.q]:undefined; };
function rigaDens(g){ return Math.max(PR0,Math.min(DPIENA,RM.QUALITA.dens[g]||0)); }
/* la densità voluta adesso: nella prova quella chiesta, a mano quella scelta o il tetto del gradino, in automatica il passo della scala (la base nei voli e nei movimenti) */
function densQ(nominale){
  if(provaQ) return densProva||PR0;
  if(qScelta) return Math.max(PR0,Math.min(DPIENA,densMano||rigaDens(alta.g)));
  if(altaAdatta && !alta.calmoD && !nominale) return PR0;
  return DPASSI[dpDi(alta.p)]||PR0; }
/* la tela degli effetti: in automatica al più 2,25 pixel per punto e 1 nei voli (come prima); con la densità alzata anche a mano */
function risQ(){ var r=RM.QUALITA.ris[alta.g], d=limita(densQ());
  if(altaAdatta) return alta.calmo?Math.min(r,Math.max(1,2.25/d)):1;
  return d>PR0+.001?Math.min(r,Math.max(1,2.25/d)):r; }
/* rimette densità e tela al gradino: la tela della pagina al fotogramma seguente, quella degli effetti subito (non si vede) */
function aggiornaMisura(){ var d=densQ(), r=risQ();
  if(Math.abs(d-DENS)>.001){ DENS=d; ALTA=r; rifai=true; return true; }
  if(r!==ALTA){ ALTA=r; if(!rifai) misura(); return true; }
  return false; }
function nomeQ(){ return NOMI_Q[alta.g]; }
function densTesto(){ var d=limita(densQ(true)); return d>PR0+.001?(d>=DPIENA-.01?', piena definizione':', densità '+String(Math.round(d*100)/100).replace('.',',')):''; }
function testoQ(){ return 'Qualità · '+(provaQ?'prova ('+nomeQ()+densTesto()+')':qScelta?nomeQ()+densTesto():'automatica ('+nomeQ()+densTesto()+')'); }
function applicaQ(){
  completaQ();
  RM.q=alta.g; var L=RM.QUALITA.ombra[alta.g]; RM.pratoU=RM.pratoU||{value:1}; RM.pratoU.value=RM.QUALITA.prato[alta.g];
  var ve=RM.VESTE?RM.QUALITA.veste[alta.g]:0; if(ve!==RM.vesteU.value){ RM.vesteU.value=ve; RM.applicaLuce(RM.notte); }
  if(post){ post.ao.value=(RM.VESTE && !SENZA_AO)?RM.QUALITA.ao[alta.g]:0; post.aoN.value=RM.QUALITA.aoN[alta.g]||8; }
  if(sole.shadow.mapSize.x!==L){ sole.shadow.mapSize.set(L,L); if(sole.shadow.map){ sole.shadow.map.dispose(); sole.shadow.map=null; } renderer.shadowMap.needsUpdate=true; }
  aggiornaMisura();
  alta.ascoltatori.forEach(function(fn){ try{ fn(alta.g); }catch(e){} });
  var b=document.getElementById('btnQualita'); if(b){ b.textContent=testoQ(); b.title='Qualità della città: automatica, bassa, telefono, media, alta, massima'; }
}
function mettiAlta(p,motivo){ p=Math.max(0,Math.min(TOP,p)); alta.motivo=motivo||''; alta.f.length=0; alta.calma=0; somma=0; quanti=0; if(p===alta.p) return; alta.p=p; alta.g=gDi(p); alta.cambio=oraPasso||performance.now(); alta.assesta=alta.cambio+800; alta.salvato=false; applicaQ(); }      // assesta: i fotogrammi subito dopo un cambio (mappa delle ombre rifatta, alberi ricostruiti) sono lunghi e non dicono nulla del gradino
/* periodo di riferimento: 1/60 di secondo, o quello dello schermo se, nei fotogrammi in cui la città non si disegna, batte più piano di 36 volte al secondo (risparmio energetico) */
var vuoti=[], periodoV=0;
function mediana(a){ var b=a.slice().sort(function(x,y){ return x-y; }); return b[b.length>>1]; }
function TQ(){ return periodoV>1/36?periodoV:1/60; }
/* il gradino trovato si ricorda dopo venti secondi tenuti a scena tranquilla, non se si è scesi per il calore */
function ricorda(ora){
  if(alta.salvato || !altaAdatta || provaQ || !avvio.fatta || alta.calore || !alta.calmo || ora-alta.cambio<20000) return;
  salvaSubito(); }
function salvaSubito(){ alta.salvato=true; memAuto={g:nomeQ(), d:dpDi(alta.p), t:Date.now(), s:FIRMA}; try{ localStorage.setItem('rm-qualita-auto',JSON.stringify(memAuto)); }catch(e){} }
/* la misura d'avvio (si veda sopra): tre tempi di 72 fotogrammi, ognuno dopo 0,8 secondi di calma; il carico in più lo disegna il ciclo (avvio.carico) */
function misuraAvvio(dt,lavoro,ora,calmo,T){
  var a=avvio; if(!a.primo) a.primo=ora;
  var pazienza=ora-a.primo>20000;      // dopo venti secondi senza un momento tranquillo si misura lo stesso
  if(!calmo && !pazienza){ a.f.length=0; a.calma=0; return; }
  a.calma+=dt; if(a.calma<.8) return;
  a.f.push(dt,lavoro); if(a.f.length<144) return;
  var n=a.f.length/2, s=0, l=0, lunghi=0, l50=0, mx=0, k; for(k=0;k<a.f.length;k+=2){ s+=a.f[k]; l+=a.f[k+1]; if(a.f[k]>T*1.25) lunghi++; if(a.f[k]>PC_LUNGO) l50++; if(a.f[k]>mx) mx=a.f[k]; }      // lungo: oltre 20,8 millesimi a 60 al secondo; sul PC conta anche quelli da 50 (l50)
  if(mx>.1){ s-=mx; n--; lunghi--; l50--; }      // un intoppo isolato (la memoria che si libera, un'altra app) non dice nulla del gradino
  s/=n; l/=n+(mx>.1?1:0); a.f.length=0; a.calma=0;
  var pulito=s<T*1.05 && lunghi<=n*.04 && l<T*.63, lento=s>T*1.12 || lunghi>n*.12;
  if(PC_Q){ pulito=s<suPC(T) && l50<=n*.02 && l<T*.63; lento=s>giuPC(T) || (alta.p!==P_MEDIA && l50>n*.13); }      // sul PC le soglie del PC: si parte da «media», che scende solo sotto i 24 al secondo (il pavimento)
  a.ultima={media:+(s*1000).toFixed(1), lunghi:lunghi, lavoro:+(l*1000).toFixed(1), carico:a.carico, gradino:nomeQ()};
  if(a.carico===0){
    if(lento && alta.p>0 && a.scese<2){ a.scese++; mettiAlta(alta.p-1,'misura'); return; }      // lento: un gradino sotto, e si riprova
    if(pulito && !a.scese){ a.carico=1; return; }
    fineAvvio(alta.p); return; }
  if(pulito && a.carico<2){ a.carico=2; return; }
  var regge=pulito?a.carico:a.carico-1, m=1+.5*regge, c0=COSTO[Math.min(alta.p,NS-1)], p=Math.min(alta.p,NS-1);      // la scena disegnata k volte in più costa quasi k fotogrammi: ne contiamo metà, per prudenza
  while(p<SCALA.length-1 && COSTO[p+1]<=c0*m) p++;
  fineAvvio(p);
}
/* le soglie del PC per fotogramma, col periodo di riferimento T (più larghe se lo schermo batte più piano): sale sotto i 42 al secondo, scende sopra i 35, a «media» solo sopra i 24 */
var P_MEDIA=posDi('media');
function suPC(T){ return Math.max(PC_SALE,T*1.05); }
function giuPC(T){ return alta.p===P_MEDIA?Math.max(PC_PAVIMENTO,T*1.09):Math.max(PC_SCENDE,T*1.09); }
/* sul PC si scende solo se due finestre di novanta fotogrammi di fila, una dopo l'altra e senza sovrapporsi, sono lente: con 16,7 e 33,3 millesimi mescolati una finestra
   sola di un gradino da 39 al secondo esce lenta per caso circa una volta su mille, e in mezz'ora di finestre ce ne sono ottocento (la simulazione di src/prove/automatica-pc.js) */
function lentoPC(lento,n){
  if(n<PC_N){ alta.contaPC=PC_N-1; alta.lentiPC=0; return false; }      // la finestra si sta riempiendo (dopo un cambio, un volo, uno scorrimento): la prima si giudica appena è piena
  if(++alta.contaPC<PC_N) return false;
  alta.contaPC=0; alta.lentiPC=lento?(alta.lentiPC||0)+1:0; return alta.lentiPC>=2; }
function fineAvvio(p){ avvio.fatta=true; avvio.carico=0; alta.partenza=p; avvio.esito=NOMI_Q[SCALA[p]]; mettiAlta(p,'misura'); alta.blocco=performance.now()+4000; salvaSubito(); }
/* Isteresi (25 novembre 2026; sull'iPhone il gradino andava avanti e indietro fra «alta» e «massima»): non contano i fotogrammi del secondo dopo uno scorrimento della pagina,
   un cambio di misura (la barra degli indirizzi di Safari che entra ed esce), il ritorno della scheda in primo piano, e del secondo e mezzo dopo un cambio d'anno
   (si ricostruisce mezza città); la finestra delle misure si svuota. Per scendere non basta un fotogramma lungo isolato: il più lungo dei venti non conta nella media
   e ne servono almeno quattro oltre la soglia. Dopo una discesa vera non si risale per novanta secondi (prima trenta), dopo la seconda mai più; la densità alta,
   una volta scesa, non si riprova per tutta la visita. */
var disturbo=-1e9;
['scroll','resize','orientationchange'].forEach(function(e){ window.addEventListener(e,function(){ disturbo=performance.now(); },{passive:true}); });
document.addEventListener('visibilitychange',function(){ disturbo=performance.now(); });
var oraPasso=0;      // l'ora del fotogramma che si sta giudicando (le prove simulate la danno loro): i cambi decisi qui partono da lì
function passoAlta(dt,lavoro,ora,calmo){ oraPasso=ora; try{ giudica(dt,lavoro,ora,calmo); } finally { oraPasso=0; } }
/* Durante una scena animata (RM.scenaInCorso, da js/scene-tappe.js; 25 novembre 2026, l'utente dall'iPhone sull'800: scatti e «effetto flash») la qualità sta ferma:
   la camera si muove quasi sempre, e la densità alta che cadeva a ogni volo e tornava a ogni pausa rifaceva la tela della pagina (un fotogramma lungo, e la nitidezza che cambia),
   mentre un cambio di gradino accendeva o spegneva veste, occlusione e figure e rifaceva la mappa delle ombre a un'altra misura. In scena: densità e tela come a scena
   tranquilla, nessuna salita, la misura d'avvio rimandata; si scende solo se la scena proprio non regge (media oltre 1,25 volte il periodo, almeno otto fotogrammi lunghi su venti). */
function inScena(){ return !!(RM.scenaInCorso && RM.scenaInCorso()); }
function giudica(dt,lavoro,ora,calmo){
  var sc=inScena(); if(sc) calmo=true;
  if(calmo!==alta.calmo){ alta.calmo=calmo; alta.calmoDa=ora; if(!calmo) alta.calmoD=false; if(aggiornaMisura()) alta.f.length=0; }      // nei voli la tela degli effetti e la densità tornano alla base, a scena tranquilla risalgono
  if(calmo && !alta.calmoD && ora-alta.calmoDa>700){ alta.calmoD=true; if(aggiornaMisura()){ alta.f.length=0; alta.assesta=ora+500; } }      // la densità alta torna dopo 0,7 secondi di calma: un tocco breve non rifà la tela due volte
  if(!altaAdatta || ora<(alta.assesta||0)) return;
  if(ora-disturbo<1000 || ora-ultimoAnno<1500){ alta.f.length=0; alta.calma=0; return; }
  var T=TQ(), f=alta.f, k, n, s=0, l=0; f.push(dt,lavoro); if(f.length>180) f.splice(0,2);
  if(!avvio.fatta){ if(!sc) misuraAvvio(dt,lavoro,ora,calmo,T); return; }      // in scena la misura aspetta (disegnerebbe la scena due o tre volte per fotogramma)
  if(alta.verifica && f.length>=80){ var v=alta.verifica; alta.verifica=null; for(k=0;k<f.length;k+=2) s+=f[k]; s/=f.length/2;      // una discesa a scena tranquilla che non ha migliorato il ritmo: il freno è altrove, si torna su e non si scende più
    if(s>v.prima*.93 && s>(PC_Q?giuPC(T):T*1.09)){ mettiAlta(alta.p+1,'inutile'); alta.partenza=alta.p; alta.giuFermo=true; alta.spenta=true; return; } s=0; }
  if(alta.p>0 && !alta.giuFermo && !alta.verifica && (calmo || alta.p>alta.partenza)){      // con una verifica in corso non si scende ancora: prima si vede se la discesa è servita
    var mx=0; n=Math.min(PC_Q?PC_N:20,f.length/2); for(k=0;k<n;k++){ var fk=f[f.length-2-2*k]; s+=fk; if(fk>mx) mx=fk; if(fk>(PC_Q?PC_LUNGO:T*1.09)) l++; }
    var giu=PC_Q?lentoPC((s-mx)/(n-1)>giuPC(T) || (alta.p>P_MEDIA && l>=n*.13),n):(n>=12 && (s-mx)/(n-1)>T*1.09 && l>=4);
    if(sc) giu=n>=20 && (s-mx)/(n-1)>T*1.25 && l>=8;      // in scena: solo se proprio non regge      // sul PC: novanta fotogrammi sotto i 35 al secondo di media (a «media» sotto i 24) o, sopra «media», uno su otto da 50 millesimi o più, due volte di fila
    if(giu){      // lento davvero: media alta anche senza il fotogramma più lungo, e almeno quattro lunghi, perché un singolo inciampo (la memoria che si libera, la barra di Safari) non basti
      var tenuto=ora-alta.cambio, prima=s/n, sotto=alta.p<=alta.partenza, dalla=alta.p>NS-1;
      if(dalla){ mettiAlta(calmo?alta.p-1:NS-2,'lento'); alta.densFerma=true; alta.blocco=ora+90000; return; }      // la densità alta scende per prima e non si riprova; nei voli non è accesa: è «massima» stessa a non reggere
      mettiAlta(alta.p-1,'lento'); if(ora-alta.discesa>3000) alta.ritorni++; alta.discesa=ora; alta.blocco=ora+90000; if(alta.ritorni>=2) alta.spenta=true;      // due discese di fila (da «massima» a «media») sono un ritorno solo
      if(PC_Q) alta.tetto=Math.min(alta.tetto||1e9,alta.p+1);      // sul PC un gradino che non ha retto non si riprova per tutta la visita: una prova sola, niente altalena
      if(tenuto>45000){ alta.spenta=true; alta.calore=true; alta.motivo='calore'; }      // dopo tre quarti di minuto senza inciampi: il telefono si scalda o risparmia; si scende e non si risale
      if(sotto){ alta.partenza=alta.p; alta.verifica={prima:prima}; }
      return; }
    s=0; l=0;
  }
  ricorda(ora);
  var suDens=alta.p>=NS-1;      // il passo seguente è la densità: più prudenza
  if(sc || alta.spenta || !calmo || RM.livello>0 || alta.p>=TOP || ora<alta.blocco || (suDens && (alta.densFerma || !alta.calmoD)) || (PC_Q && alta.p+1>=(alta.tetto||1e9))){ alta.calma=0; return; }      // spenta: scende ancora se serve, ma non sale più
  alta.calma+=dt; if(alta.calma<(suDens?5:2.5) || f.length<180) return;
  var lunghi=0, l50=0; n=f.length/2; for(k=0;k<f.length;k+=2){ s+=f[k]; l+=f[k+1]; if((suDens || k>=f.length-40) && f[k]>T*1.09) lunghi++; if(f[k]>PC_LUNGO) l50++; }
  if(PC_Q && !suDens){ if(s/n<suPC(T) && l/n<T*.63 && l50<=1) mettiAlta(alta.p+1,'margine'); return; }      // sul PC: almeno 42 al secondo nei novanta fotogrammi, al più uno da 50 millesimi; verso la densità valgono le soglie piene, qui sotto
  if(suDens?(s/n<T*1.03 && l/n<T*.55 && !lunghi):(s/n<T*1.05 && l/n<T*.63 && !lunghi)) mettiAlta(alta.p+1,'margine');      // verso la densità: media più bassa, meno lavoro e nessun fotogramma lungo in tutti i novanta
}
function riparti(){ alta.tetto=1e9; alta.ritorni=0; alta.spenta=false; alta.calore=false; alta.giuFermo=false; alta.verifica=null; alta.blocco=0; alta.discesa=-1e9; alta.densFerma=false; }
RM.qualita={ nomi:NOMI_Q, scala:SCALA.map(function(g){ return NOMI_Q[g]; }), gradino:function(){ return alta.g; }, nome:nomeQ, automatica:function(){ return !qScelta; },
  quando:function(fn){ alta.ascoltatori.push(fn); },
  /* scegli(nome, densità): un gradino a mano; la densità (dalla prova, «Usa questo gradino») è facoltativa, senza vale il tetto del gradino (RM.QUALITA.dens) */
  scegli:function(nome,dens){ qScelta=NOMI_Q.indexOf(nome)>=0?nome:null; densMano=(qScelta && dens>0)?dens:null;
    try{ if(qScelta) localStorage.setItem('rm-qualita',qScelta); else localStorage.removeItem('rm-qualita'); if(densMano) localStorage.setItem('rm-qualita-dens',String(densMano)); else localStorage.removeItem('rm-qualita-dens'); }catch(e){}
    altaAdatta=!fermo && !qScelta && !provaQ; riparti();
    var pa=qScelta?posDi(qScelta):memAuto?posDi(memAuto.g)+(memAuto.g==='massima'?Math.min(memAuto.d||0,ND):0):P_DEF; if(!qScelta && !memAuto){ avvio.fatta=false; avvio.primo=0; avvio.scese=0; avvio.carico=0; avvio.f.length=0; }      // tornando ad «automatica» senza un gradino ricordato si rimisura
    alta.partenza=Math.min(pa,NS-1); mettiAlta(pa,'scelta'); applicaQ(); },
  /* per la prova (js/prova-qualita.js): un gradino tenuto fermo, con la sua densità (facoltativa: senza, quella di base), senza regolatori e senza ricordarlo; rilascia() torna com'era */
  forza:function(nome,dens){ if(!provaQ) provaQ={p:alta.p, adatta:altaAdatta}; altaAdatta=false; densProva=dens>0?dens:null; avvio.carico=0; metti(0); mettiAlta(posDi(nome),'prova'); applicaQ(); },
  rilascia:function(){ if(!provaQ) return; var q=provaQ; provaQ=null; densProva=null; altaAdatta=q.adatta; mettiAlta(q.p,'fine prova'); applicaQ(); },
  /* la densità: quella di base, i passi dell'automatica, quella piena dello schermo, quella che si userebbe con d (dopo il tetto dei pixel) */
  densita:function(){ return {base:PR0, passi:DPASSI.slice(), piena:DPIENA, schermo:DPR, tetto:TETTO, ora:renderer.getPixelRatio(), voluta:limita(densQ(true))}; },
  limita:function(d){ return limita(d); },
  /* le soglie dell'automatica in fotogrammi al secondo (per la prova: js/prova-qualita.js giudica con le stesse): sul PC sale da 42, regge da 35, «media» scende sotto 24 */
  soglie:function(){ return PC_Q?{pc:true, sale:Math.round(1/PC_SALE), regge:Math.round(1/PC_SCENDE), pavimento:Math.round(1/PC_PAVIMENTO), lungo:Math.round(PC_LUNGO*1000)}:{pc:false}; },
  rimisura:function(){ try{ localStorage.removeItem('rm-qualita-auto'); }catch(e){} memAuto=null; if(!qScelta) RM.qualita.scegli(null); },
  stato:function(){ var cv=renderer.domElement; return {gradino:nomeQ(), passoDens:dpDi(alta.p), dens:renderer.getPixelRatio(), densAdesso:limita(densQ()), densMano:densMano, tela:[cv.width,cv.height], effetti:post?[post.tela.width,post.tela.height]:null, occl:(post&&post.telaAO)?[post.telaAO.width,post.telaAO.height]:null, densFerma:alta.densFerma,
    automatica:!qScelta, prova:!!provaQ, partenza:NOMI_Q[SCALA[alta.partenza]], misura:{fatta:avvio.fatta, carico:avvio.carico, esito:avvio.esito||null, ultima:avvio.ultima||null},
    ricordato:memAuto?memAuto.g+(memAuto.d?' a densità '+String(DPASSI[Math.min(memAuto.d,ND)]).replace('.',','):''):null, periodo:+(TQ()*1000).toFixed(2), schermo:periodoV?+(periodoV*1000).toFixed(2):null, ris:ALTA, pr:renderer.getPixelRatio(), ritorni:alta.ritorni, spenta:alta.spenta, calore:alta.calore, motivo:alta.motivo, livello:RM.livello, regola:PC_Q?'PC':'telefono', tetto:(alta.tetto||1e9)<NS?NOMI_Q[SCALA[alta.tetto]]:null}; } };
/* il bottone nel menu «Strumenti» (index.html): a ogni tocco il gradino seguente, automatica → bassa → telefono → media → alta → massima → automatica */
(function(){ var b=document.getElementById('btnQualita'); if(!b) return;
  b.addEventListener('click',function(){ var i=qScelta?posDi(qScelta)+1:0; RM.qualita.scegli(i<SCALA.length?NOMI_Q[SCALA[i]]:null); }); })();
applicaQ();
/* le file dei moduli caricati dopo (js/scene-tappe.js) si completano e si riapplicano a pagina pronta */
document.addEventListener('DOMContentLoaded',function(){ applicaQ(); });
RM.regolatore={ gradini:GRADINI, regola:regola, stato:function(){ return {livello:RM.livello, pr:renderer.getPixelRatio(), ombre:sole.castShadow, leggero:!!RM.leggero, fermo:fermo, noSalita:noSalita, ris:ALTA, qualita:nomeQ()}; },
  alta:{ stato:function(){ return {gradino:nomeQ(), ris:ALTA, adatta:altaAdatta, ritorni:alta.ritorni, spenta:alta.spenta, motivo:alta.motivo, partenza:NOMI_Q[SCALA[alta.partenza]], misura:avvio.fatta, blocco:Math.max(0,Math.round(alta.blocco-performance.now()))}; }, passo:passoAlta,
    azzera:function(){ altaAdatta=!qScelta; avvio.fatta=true; avvio.carico=0; alta.partenza=P_DEF; mettiAlta(P_DEF,'azzera'); riparti(); alta.calmo=true; } } };      // per le prove
var orologio=new THREE.Clock(), somma=0, quanti=0, occhioPrima=new THREE.Vector3(), puntoPrima=new THREE.Vector3();
/* Quando la scena non è sullo schermo (si è scesi a leggere, o sul telefono si guarda la mappa) non si disegna: la pagina scorre meglio e la batteria ringrazia. */
RM.fuoriVista=false;
if(window.IntersectionObserver) new IntersectionObserver(function(v){ RM.fuoriVista=!v[v.length-1].isIntersecting; },{rootMargin:'80px'}).observe(contenitore);
var tsPrima=0;
(function ciclo(ts){
  requestAnimationFrame(ciclo);
  var iv=(ts && tsPrima)?(ts-tsPrima)/1000:0; tsPrima=ts||0;      // l'intervallo vero fra due fotogrammi, dal tempo che dà requestAnimationFrame (più fedele dell'orologio, che legge l'ora a metà del lavoro)
  if(RM.fuoriVista || document.body.classList.contains('impero-grande')){ orologio.getDelta();      // sotto la carta a tutto schermo la città è coperta: disegnarla costava 6 ms a fotogramma (misura del 24 novembre 2026)
    if(iv>0 && iv<.2 && !document.hidden){ vuoti.push(iv); if(vuoti.length>60) vuoti.shift(); if(vuoti.length>=30 && vuoti.length%10===0) periodoV=mediana(vuoti); }      // senza disegnare: il battito dello schermo
    return; }
  var grezzo=orologio.getDelta(), dt=Math.min(grezzo,.1), ora=performance.now();
  if(!document.hidden && grezzo<.4 && ora-ultimoAnno>400){      // le pause (scheda nascosta, caricamento) e il viaggio fra due tappe non contano
    if(scalda>0) scalda--; else if(!provaQ && !inScena() && avvio.fatta && ALTA===1 && DENS<=PR0+.001 && (altaAdatta?alta.p===0:true)){ somma+=grezzo; quanti++; }      // il regolatore di prima: in automatica solo in «bassa» (sopra, il ritmo lo guarda la scala della qualità), con una scelta a mano dove la tela è a 1
    if(quanti>=50){ regola(somma/quanti); somma=0; quanti=0; }
  }
  for(var i=0;i<RM.frame.length;i++) RM.frame[i](dt);
  controlli.update();
  if(ombraChiesta && ora-ombraFatta>66){ renderer.shadowMap.needsUpdate=true; ombraChiesta=false; ombraFatta=ora; }
  if(rifai){ rifai=false; misura(); }      // un cambio di densità chiesto dopo il fotogramma di prima: la tela della pagina si rifà qui, prima di disegnare, e non resta vuota sullo schermo
  if(post && post.attivo){
    if(Math.abs(post.tela.width-renderer.domElement.width*ALTA)>renderer.domElement.width*ALTA*.02) misura();      // chi ha disegnato fuori dal ciclo (i fotogrammi delle infografiche) ha rimesso la tela a 1
    post.mat.uniforms.notte.value=RM.notte||0;
    post.mat.uniforms.sfoca.value=RM.sfuma(70,260,camera.position.distanceTo(controlli.target));      // l'effetto «plastico» sfoca i bordi solo da lontano: da vicino si vuole vedere nitido
    for(var ci=0;ci<avvio.carico;ci++){ renderer.setRenderTarget(post.tela); renderer.render(scene,camera); }      // la misura d'avvio: la scena disegnata una o due volte in più, di nascosto (la tela si ridisegna qui sotto)
    post.disegna(scene,camera);
  } else { RM.occhio(camera,renderer.domElement.height); renderer.render(scene,camera); }
  if(post && post.attivo && !document.hidden && grezzo<.4){      // la camera si muove piano? (spostamento in quota della distanza, al secondo)
    var dd=camera.position.distanceTo(controlli.target)||1, mv=(camera.position.distanceTo(occhioPrima)+controlli.target.distanceTo(puntoPrima))/dd/Math.max(dt,.001);
    occhioPrima.copy(camera.position); puntoPrima.copy(controlli.target);
    passoAlta(iv>0&&iv<.4?iv:grezzo,(performance.now()-ora)/1000,ora,!volo && ora-ultimoAnno>1500 && mv<.15);
  }
  if(!RM.disegnata && document.readyState!=='loading' && contenitore.clientWidth>40 && contenitore.clientHeight>40){ RM.disegnata=true; if(window.RM_carica) RM_carica.cittaPronta(); }      // il primo disegno della città intera (tutti i file eseguiti): si toglie il velo dell'attesa (index.html). Sul telefono con la scheda della carta aperta la città non si disegna: il velo resta finché non la si apre
  RM.lavoro=performance.now()-ora;      // millesimi di lavoro del processore in questo fotogramma (per la prova della qualità)
})();
/* ?prova=qualita: la prova dei gradini sul telefono (js/prova-qualita.js), caricata solo a richiesta, con la versione di questo file */
(function(){ var sc=document.currentScript, v=sc && /\?v=[^&#]+/.exec(sc.src||''); RM.versione=v?v[0].slice(3):'';
  var pr=/[?&]prova=(qualita|scena)/.exec(location.search); if(!pr) return;      // ?prova=scena&anno=800: la prova di una scena animata (js/prova-scena.js)
  window.addEventListener('load',function(){ var s=document.createElement('script'); s.src='js/prova-'+pr[1]+'.js'+(v?v[0]:''); document.body.appendChild(s); }); })();

})();
