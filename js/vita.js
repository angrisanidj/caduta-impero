/* La vita della città: gente lungo le vie (chi abita un isolato cammina sulla strada più vicina) e nei luoghi affollati di ogni epoca, carri e muli, il mercato dell'Emporio,
   le ronde dei vigili nelle notti del III secolo, fumo dai tetti e dalle terme, barche sul Tevere. Aggancio per le scene degli assedi: RM.vitaAnno(anno), RM.vitaFattore, RM.vitaEvita.
   Tutto dipende dagli stessi dati della scena: quando un isolato si svuota, la sua gente e il suo fumo scompaiono. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto||!RM.isolati) return;
var D=window.RM_DATI, P=RM.P, rnd=RM.casuale(1453), isolati=RM.isolati, N=isolati.length, annoOra=235, quotaGente=1, tempo=0;

/* ---------- gente ----------
   La vita per strada (25 novembre 2026, notte; l'utente: «la città reale doveva essere un po' caotica, gente in giro… riesci a fare carri, gente che cammina… di notte invece
   poca gente»; «molta più gente nell'epoca imperiale, molta meno in quella alto medioevale»; «andrebbero disegnati anche dei mercati… fai una ipotesi di vita reale nelle varie fasi»).
   Unica fonte: src/testi/vita-roma-fonti.md, letto per intero; accanto a ogni riga la sua voce. Dalle fonti: dove la gente si raccoglieva e fino a quando (i fori; le terme fino
   al 537, Procopio V 19; l'Emporio, «mercato sul fiume», finché il modello lo tiene in uso; i mendicanti davanti a San Pietro sotto Teodorico, Procopio, Storia segreta 26; la casa
   dei poveri di Leone III ai gradini di San Pietro; lo xenodochio di Belisario sulla via Lata; le diaconie), i carri tirati da buoi o da bestie da soma (Tabula Heracleensis),
   le ronde dei vigili nel III secolo (Digesto I 15, 3), gli anni d'assedio e la città vuota del 546-547 (VITA_ANNI, più sotto).
   Ipotesi, dette nel piede della pagina: quanta gente (una figura per molte persone, in proporzione a CURVE.popolazione), dove cammina (sulle vie principali e vicino alle case
   abitate), quanti carri e bestie e la loro forma, i banchi dell'Emporio, chi stava davanti alle diaconie; che il divieto dei carri di giorno valesse ancora (la pagina lo dice).
   Mercati attestati ma non disegnati, perché il modello non ha la piazza: foro Suario (case al suo posto), mercato di Livia, mercato grande del Celio, foro Olitorio (coperto di case);
   i gradini del pane (Codice Teodosiano XIV 17) non hanno un luogo nelle fonti lette. */
var MENO_MOTO=!!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) && !/[?&]moto=1/.test(location.search);      // con meno animazioni la gente c'è ma sta ferma
RM.QUALITA.gente=[.35,1,1.3,1.6,.5];      // quanta gente per gradino (bassa, media, alta, massima, telefono), rispetto a «media»: poca nei gradini leggeri, distribuita allo stesso modo
var GMAX=1.6, rndV=RM.casuale(2604);      // rndV: i numeri a caso della vita nuova (rnd resta quello di prima per fumo e barche)
var PER_ISOLATO=RM.piccolo?2:3, NR=N*PER_ISOLATO, NV0=RM.piccolo?900:1800, NV=Math.round(NV0*GMAX), NG0=RM.piccolo?200:360, NG=Math.round(NG0*GMAX), quotaPellegrini=0;
/* Gli anni in cui la vita di tutti i giorni si ferma o si dirada: [da, a, quanta gente resta (1 = la curva della popolazione), carri e bestie (0 = nessuno)]. Fonti in src/testi/vita-roma-fonti.md, «Assedi e fame».
   Solo il fondo: i gesti degli assedi (fame, sepolture, guardie sulle mura) li mette in scena js/scene-tappe.js, che legge questa tabella con RM.vitaAnno(anno). */
var VITA_ANNI=[
  [408.7,410.6,.55,.2,'Alarico chiude le porte e il Tevere; fame, poi peste (Zosimo V 39-40)'],
  [471.8,472.6,.6,.2,'Ricimero chiude la zona del Tevere e affama chi sta dentro (Giovanni di Antiochia, fr. 209)'],
  [536.9,538.4,.5,0,'assedio dei Goti: donne, bambini e servi mandati a Napoli; mancano i viveri anche per gli animali (Procopio V 19 e 25)'],
  [545,545.6,.35,0,'fame: un medimno di grano a sette monete d\'oro; chi può esce dalla città (Procopio VII 17)'],
  [545.6,547.5,0,0,'Totila manda via gli abitanti: Roma resta vuota «quadraginta aut amplius dies» (Procopio VII 22; Marcellino Conte, 547)'],
  [592.8,593.6,.7,.3,'Agilulfo sotto le mura; le veglie di guardia (Gregorio Magno, Registrum V 36)']];
function vitaAnno(anno){
  var q=1, cb=1, nota='', k, r;
  for(k=0;k<VITA_ANNI.length;k++){ r=VITA_ANNI[k]; if(anno>=r[0]-.4 && anno<r[1]+.4){ var w=RM.sfuma(r[0]-.4,r[0],anno)*(1-RM.sfuma(r[1],r[1]+.4,anno)); q=Math.min(q,1-(1-r[2])*w); cb=Math.min(cb,1-(1-r[3])*w); if(w>.5) nota=r[4]; } }
  return {quota:q, carri:cb, assedio:q<.95, nota:nota};
}
RM.vitaAnno=vitaAnno;      // per js/scene-tappe.js: {quota, carri, assedio, nota} dell'anno
RM.vitaFattore=1;          // un altro modulo può diradare la gente per un momento (1 = nessun effetto)
RM.vitaEvita=[];           // e tenerla lontana da un luogo: {x, z, r} in unità della scena (oltre alle scene accese, che la vita evita da sola)

/* Le strade sono un nastro 1 m sopra il terreno disegnato (RM.nastro(…,.1) in js/base.js): chi cammina su una strada sta su quel nastro, se no ci affonda (24 novembre 2026) */
function hVia(x,z){ var a=RM.hRapida(x,z); return RM.hSuolo?Math.max(a,RM.hSuolo(x,z)+.1):a; }
/* vie campionate a passo costante, con la quota del nastro in ogni punto: a ogni fotogramma basta un'interpolazione (prima due quote per persona, per fotogramma) */
var vie=RM.STRADE.map(function(s,i){
  var cv=new THREE.CatmullRomCurve3(s.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',.35), L=cv.getLength(), p=cv.getSpacedPoints(Math.max(2,Math.round(L/2))), y=new Float32Array(p.length), k;
  for(k=0;k<p.length;k++) y[k]=hVia(p[k].x,p[k].z);
  return {p:p, y:y, L:L, larga:((window.RM_TOPO||{}).stradeLarghe||[])[i]||.6};
});
/* A ogni isolato la via più vicina (entro 120 metri): la sua gente cammina lì. Le vie disegnate sono solo le principali: dove le case abitate sono fitte
   ci sono anche i vicoli fra l'una e l'altra, e lì si gira attorno a casa; attorno a una casa sola in mezzo agli orti non cammina nessuno. */
(function(){
  var CE=10, gr={};
  vie.forEach(function(v,vi){ v.p.forEach(function(q,pi){ var c=Math.floor(q.x/CE)+','+Math.floor(q.z/CE); (gr[c]||(gr[c]=[])).push(vi,pi); }); });
  isolati.forEach(function(b){
    var cx=Math.floor(b.x/CE), cz=Math.floor(b.z/CE), m=144, a, c, k, q, pt, dd; b.vv=-1;
    for(a=-1;a<=1;a++) for(c=-1;c<=1;c++){ q=gr[(cx+a)+','+(cz+c)]; if(!q) continue;
      for(k=0;k<q.length;k+=2){ pt=vie[q[k]].p[q[k+1]]; dd=(pt.x-b.x)*(pt.x-b.x)+(pt.z-b.z)*(pt.z-b.z); if(dd<m){ m=dd; b.vv=q[k]; b.vi=q[k+1]; } } }
  });
  var gi={}; isolati.forEach(function(b,n){ var c=Math.floor(b.x/CE)+','+Math.floor(b.z/CE); (gi[c]||(gi[c]=[])).push(n); });
  isolati.forEach(function(b,n){
    var cx=Math.floor(b.x/CE), cz=Math.floor(b.z/CE), a, c, k, q, o; b.vicini=[];
    for(a=-1;a<=1;a++) for(c=-1;c<=1;c++){ q=gi[(cx+a)+','+(cz+c)]; if(!q) continue; for(k=0;k<q.length;k++){ o=isolati[q[k]]; if(q[k]!==n && Math.hypot(o.x-b.x,o.z-b.z)<8.6) b.vicini.push(q[k]); } }
  });
})();
function vicoli(){ isolati.forEach(function(b){ var n=0, k; for(k=0;k<b.vicini.length;k++) if(isolati[b.vicini[k]].a0>.5) n++; b.vicoli=n>=3; }); }      // tre vicini abitati: fra le case ci sono vicoli

/* ---------- i luoghi dove la gente si raccoglie ----------
   Per ogni luogo: centro e semiassi (unità della scena), n = quante figure al pieno (gradino «media», PC), anni, e se il numero segue la popolazione (di norma sì) o resta fisso
   (i poveri e i pellegrini, che crescono mentre la città cala). anello: si sta solo nella corona esterna. mon: il luogo vive finché il monumento è «in uso».
   I quattro di prima (fidato) sono piazze lastricate senza ostacoli; per gli altri i posti si provano uno per uno (liberoQui, più sotto): niente figure dentro un edificio. */
var LUOGHI=[
  {id:'foro', x:-1.2,z:1.6,ax:5.5,az:2.2, n:240, fidato:true},                         // il Foro Romano (era già nel modello)
  {id:'foroTraiano', x:-1.3,z:-27.8,ax:4.5,az:3.5, n:150, fidato:true},                // il foro di Traiano
  {id:'colosseo', x:57,z:26,ax:13.5,az:12, anello:.82, n:200, fidato:true},             // la spianata attorno al Colosseo
  {id:'pantheon', x:-70,z:-77,ax:4,az:3, n:80, fidato:true},                           // la piazza davanti al Pantheon
  {id:'caracalla', x:59,z:150,ax:18,az:18, anello:.4, n:70, mon:'caracalla', a:537},    // terme: i nobili «con circa cinquanta servi» (Ammiano XXVIII 4, 9); i ladri di vesti nelle terme (Digesto I 15, 3, 5); chiuse dal 537 (Procopio V 19, 27)
  {id:'diocleziano', x:101,z:-122,ax:19,az:19, anello:.4, n:70, mon:'diocleziano', a:537},
  {id:'termeTraiano', x:97,z:4,ax:17,az:17, anello:.4, n:60, mon:'traiano', a:537},
  {id:'emporio', x:-102,z:131,ax:15,az:15, porto:true, n:110, mon:'emporio'},            // «mercati sul fiume»: banchine, magazzini di Galba «vino et oleo» (Platner, Emporium e Horrea Galbae); in uso finché il modello lo tiene (430)
  {id:'pietro493', x:-240.5,z:-108,ax:2.2,az:2.6, n:24, da:493, a:540, fisso:true},     // Teodorico dava ogni anno grano ai mendicanti presso San Pietro, tolto verso il 540 (Procopio, Storia segreta 26, 29-30); la forma della distribuzione non è detta: si vede solo la gente
  {id:'pietro800', x:-241,z:-112.5,ax:1.6,az:1.4, n:18, da:800, a:853, fisso:true},     // Leone III: casa e bagno «pro subsidiis Christi pauperum atque peregrinorum» a destra dei gradini dell'atrio (Liber Pontificalis, Leone III, c. LXXXIX); la casa non è nel modello
  {id:'trivio', x:-12.4,z:-92.2,ax:1.7,az:1.7, anello:.4, n:8, da:537, a:800, fisso:true}      // «fecit autem Belisarius xenodochium in via Lata» (Liber Pontificalis, Vigilio 2, in Platner, Xenodochia), presso Santa Maria in Trivio; fino a quando non è detto
];
(D.CHIESE||[]).forEach(function(c){ if(c[4]!=='diaconia') return; var p=RM.ll(c[1],c[2]);      // le diaconie (Liber Pontificalis, vita di Leone III: doni a San Giorgio, San Teodoro, Santa Maria in Cosmedin…): chi stava davanti è IPOTESI, poche figure
  LUOGHI.push({id:'diaconia '+c[0], x:p[0], z:p[1], ax:1.8, az:1.8, anello:.45, n:6, da:Math.max(600,c[3]), a:853, fisso:true}); });
var SCALA_L=RM.piccolo?.55:1, NL=0;
LUOGHI.forEach(function(L,k){ L.max=Math.ceil(L.n*SCALA_L*GMAX); L.i0=NL; NL+=L.max; L.da=L.da||0; L.a=L.a||9999; L.vis=0; L.ok=null; L.annoOk=-1e9; L.seme=901+k*37; });
/* carri e bestie da soma: quanti al massimo (gli strumenti a istanze più sotto) e chi li guida (una persona per ciascuno, tra la gente) */
var CARRI0=RM.piccolo?8:14, MULI0=RM.piccolo?16:30, NCAR=Math.round(CARRI0*GMAX*1.6)+12, NMUL=Math.round(MULI0*GMAX), NC=NCAR+NMUL, NRD=14;      // NRD: due ronde di sette vigili
var I_V=NR, I_L=I_V+NV, I_G=I_L+NL, I_C=I_G+NG, I_R=I_C+NC, NP=I_R+NRD;      // dove comincia ogni gruppo nella fila delle persone
var pos=new Float32Array(NP*3), col=new Float32Array(NP*3), giro=new Float32Array(NP), passo=new Float32Array(NP), piedi=new Float32Array(NP), forza=new Uint8Array(NP);      // piedi: la quota del suolo sotto ciascuno (le figure vicine stanno lì); forza: 1 = portatore (la veste col sacco in spalla)
var i, c;
for(i=0;i<NP;i++){ giro[i]=rnd()*4; passo[i]=(rnd()<.5?-1:1)*(.02+.035*rnd()); pos[i*3+1]=-60; }      // passo: il giro attorno all'isolato, lento come chi cammina (prima era tre volte più svelto)
function hh(j,s){ return (((j+(s||0)*7919)*2654435761)>>>0)/4294967296; }      // un numero fisso fra 0 e 1 per ogni persona

/* I viandanti: ognuno ha un tratto di via suo (centro e lunghezza) e lo percorre avanti e indietro a passo d'uomo; uno su tre sta fermo, a coppie, a parlare.
   Il tratto si sceglie a caso, con un peso: vie larghe più delle strette, dentro le mura molto più che fuori, case abitate vicine, i luoghi affollati dell'epoca.
   Si sceglie di nuovo quando cambiano gli anni (scegliVie): chi cammina dove la città si svuota passa dove si vive ancora. */
var CAMP=[]; vie.forEach(function(v,k){ var w0=Math.pow(v.larga/.6,1.6); v.p.forEach(function(q,i){ CAMP.push(k,i,w0*(RM.dentroMura(q.x,q.z)?1:.12)); }); });      // per ogni punto: via, indice, peso fisso
var NCAMP=CAMP.length/3, cumC=new Float32Array(NCAMP), annoVie=-1e9;
var wV=new Uint16Array(NV), wC=new Float32Array(NV), wR=new Float32Array(NV), wT=new Float32Array(NV), wVel=new Float32Array(NV), wLato=new Float32Array(NV), wFermo=new Uint8Array(NV);
for(i=0;i<NV;i++){ wR[i]=3+rndV()*9; wT[i]=(rndV()*2-1); wVel[i]=(rndV()<.5?-1:1)*(.055+.035*rndV()); wLato[i]=(rndV()-.5)*1.5; wFermo[i]=(i%6<2)?1:0; }      // wR: mezzo tratto in punti (da 60 a 240 m); wVel: punti al secondo (un punto ogni due unità: da 1,1 a 1,8 m/s)
var GX=-450, GZ=-700, GC=10, GNX=90, GNZ=140, abit=new Float32Array(GNX*GNZ);      // la griglia delle case abitate (celle di 100 m)
function pesoLuoghi(x,z){ var s=0, k, L, d2, r; for(k=0;k<LUOGHI.length;k++){ L=LUOGHI[k]; if(!L.vis || L.fisso) continue; r=Math.max(L.ax,L.az)+6; d2=(x-L.x)*(x-L.x)+(z-L.z)*(z-L.z); if(d2<9*r*r) s+=1.6*(L.n/120)*Math.exp(-d2/(r*r)); } return s; }
function scegliVie(anno){
  annoVie=anno; abit.fill(0);
  isolati.forEach(function(b){ if(b.a0<=.5) return; var i=Math.floor((b.x-GX)/GC), k=Math.floor((b.z-GZ)/GC); if(i>=0&&k>=0&&i<GNX&&k<GNZ) abit[k*GNX+i]+=1; });
  var tot=0, j, a, b2, x, z, gi, gk, s;
  for(j=0;j<NCAMP;j++){ var q=vie[CAMP[j*3]].p[CAMP[j*3+1]]; x=q.x; z=q.z; gi=Math.floor((x-GX)/GC); gk=Math.floor((z-GZ)/GC); s=0;
    for(a=-1;a<=1;a++) for(b2=-1;b2<=1;b2++){ var ii=gi+a, kk=gk+b2; if(ii>=0&&kk>=0&&ii<GNX&&kk<GNZ) s+=abit[kk*GNX+ii]; }
    tot+=CAMP[j*3+2]*(.04+Math.min(1,s/7)+pesoLuoghi(x,z)); cumC[j]=tot; }      // quasi nessuno dove non abita più nessuno
  for(j=0;j<NV;j++){ var u=hh(j,3)*tot, lo=0, hi=NCAMP-1; while(lo<hi){ var m=(lo+hi)>>1; if(cumC[m]<u) lo=m+1; else hi=m; }
    var v=CAMP[lo*3], ci=CAMP[lo*3+1], np=vie[v].p.length; wV[j]=v; wC[j]=Math.max(1,Math.min(np-2,ci)); }
}

/* ---------- posti liberi: niente figure dentro un edificio, un muro, il fiume ----------
   Un posto è libero se non cade nel Tevere, su un isolato, sotto un'arcata d'acquedotto, sulle mura, e se un raggio dall'alto non incontra un monumento più alto di 2,2 m
   sopra il terreno (il lastricato e i gradini bassi vanno bene: lì la figura sta sulla pietra). Si prova al bisogno, pochi posti per fotogramma (sono i monumenti di quell'anno). */
var IDX_VITA=RM.scene.children.length;      // tutto ciò che è stato messo in scena prima della vita (terreno, monumenti, mura, case); le scene delle tappe vengono dopo
var ray=new THREE.Raycaster(), GIU=new THREE.Vector3(0,-1,0), ORIG=new THREE.Vector3(), ost=null, ostAnno=-1e9;
function ostacoli(anno){      // i monumenti visibili di quell'anno, con la loro scatola in pianta
  if(ost && Math.abs(anno-ostAnno)<1) return ost; ostAnno=anno; ost=[];
  for(var k=0;k<IDX_VITA;k++){ var c=RM.scene.children[k], g=c.userData.gruppo; if(!c.visible||!c.isMesh||c.isInstancedMesh||g==='suolo'||g==='strade'||g==='vita'||!c.geometry) continue;
    if(!c.userData.scatolaVita){ if(!c.geometry.boundingBox) c.geometry.computeBoundingBox(); c.updateMatrixWorld(true); c.userData.scatolaVita=c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld); }
    var b=c.userData.scatolaVita; if(b.max.x-b.min.x>150 && b.max.z-b.min.z>150) continue;      // le maglie che coprono mezza città (acquedotti): le arcate si provano da RM.campateAcquedotti
    ost.push(c); }
  return ost; }
var grigliaIs={}; isolati.forEach(function(b,n){ var c=Math.floor(b.x/8)+','+Math.floor(b.z/8); (grigliaIs[c]||(grigliaIs[c]=[])).push(n); });
function suIsolato(x,z){ var cx=Math.floor(x/8), cz=Math.floor(z/8), i, j, k, q, b, dx, dz, ca, sa;
  for(i=-1;i<=1;i++) for(j=-1;j<=1;j++){ q=grigliaIs[(cx+i)+','+(cz+j)]; if(!q) continue;
    for(k=0;k<q.length;k++){ b=isolati[q[k]]; if((b.nasce && annoOra<b.nasce) || (b.via && annoOra>=b.via-1)) continue;      // ogni isolato è casa, rovina o orto murato; il Borgo solo da quando nasce; le case demolite per un monumento (via) non ci sono più
      ca=Math.cos(b.ry); sa=Math.sin(b.ry); dx=x-b.x; dz=z-b.z; if(Math.abs(dx*ca-dz*sa)<b.w/2+.25 && Math.abs(dx*sa+dz*ca)<b.d/2+.25) return true; } }
  return false; }
function liberoQui(x,z,anno){      // la quota dove stare, o NaN
  if(RM.distFiume(x,z)<3.3 || suIsolato(x,z)) return NaN;
  if(RM.MURA && RM.distLinea(x,z,RM.MURA,true)<.7) return NaN;
  var k, q; for(k=0;k<RM.campateAcquedotti.length;k++){ q=RM.campateAcquedotti[k]; if(Math.abs(x-q.x)<6 && Math.hypot(x-q.x,z-q.z)<1.2+q.len*.25) return NaN; }
  var h=RM.hSuolo?RM.hSuolo(x,z):RM.h(x,z), O=ostacoli(anno), alto=h;
  for(k=0;k<O.length;k++){ var b=O[k].userData.scatolaVita; if(x<b.min.x-.1||x>b.max.x+.1||z<b.min.z-.1||z>b.max.z+.1) continue;
    ORIG.set(x,b.max.y+5,z); ray.set(ORIG,GIU); ray.far=b.max.y+20; var hit=ray.intersectObject(O[k],false);
    if(hit.length){ var y=hit[0].point.y; if(y>h+.22) return NaN; if(y>alto) alto=y; } }
  return alto; }
/* i posti di un luogo: candidati fissi (stesso seme a ogni visita), provati a gruppi nei fotogrammi (provaLuoghi) e tenuti per trent'anni */
function stessaRiva(x0,z0,x1,z1){ for(var t=0;t<=1;t+=.05) if(RM.distFiume(x0+(x1-x0)*t,z0+(z1-z0)*t)<2.6) return false; return RM.dentroMura(x0,z0)===RM.dentroMura(x1,z1); }      // senza passare il fiume né le mura
function candidati(L){ var r=RM.casuale(L.seme), out=[], tent=0, S=Math.min(300,L.max+40);
  while(out.length<S && tent<S*25){ tent++; var a=r()*6.2832, q=L.anello?Math.sqrt(L.anello*L.anello+(1-L.anello*L.anello)*r()):Math.sqrt(r()), x=L.x+Math.cos(a)*q*L.ax, z=L.z+Math.sin(a)*q*L.az;
    if(L.porto){ var df=RM.distFiume(x,z); if(df<3.5||df>11 || !stessaRiva(L.x,L.z,x,z)) continue; }      // l'Emporio: la striscia fra la banchina e il portico, sulla riva sinistra
    out.push(x,z); }
  return out; }
function provaLuoghi(anno,budget){
  var t0=performance.now(), k, L;
  for(k=0;k<LUOGHI.length;k++){ L=LUOGHI[k]; if(!L.vis) continue;
    if(L.fidato){ if(!L.ok){ L.ok=candidati(L); L.okY=null; L.nOk=L.ok.length/2; } continue; }
    if(L.ok && Math.abs(anno-L.annoOk)<30 && !L.prova) continue;
    if(!L.prova){ L.prova={c:candidati(L), j:0, ok:[], y:[]}; }
    var P=L.prova;
    while(P.j<P.c.length/2){ var x=P.c[P.j*2], z=P.c[P.j*2+1], y=liberoQui(x,z,anno); P.j++; if(y===y){ P.ok.push(x,z); P.y.push(y); } if(performance.now()-t0>budget) return; }
    L.ok=P.ok; L.okY=P.y; L.nOk=P.ok.length/2; L.annoOk=anno; L.prova=null; posaBanchi(L); }
}
/* pellegrini a San Pietro: metà nell'atrio e sul sagrato, metà in cammino lungo il portico da ponte Elio. Crescono mentre la città cala */
var pellegrini=[]; for(i=0;i<NG;i++) pellegrini.push({s:rnd(), a:rnd()*6.283, r:Math.sqrt(rnd()), vel:(rnd()<.5?-1:1)*(.0018+.001*rnd()), lato:(rnd()-.5)*1.6});      // a passo d'uomo (prima andavano a sei-dieci metri al secondo)
/* la via che dal ponte Elio porta a San Pietro: i pellegrini in cammino la seguono, oppure stanno sotto il portico che le corre accanto */
var viaPietro=(function(){
  var meglio=-1, m=1e9; vie.forEach(function(v,k){ var a=1e9, b=1e9; v.p.forEach(function(q){ a=Math.min(a,Math.hypot(q.x+172,q.z+110)); b=Math.min(b,Math.hypot(q.x+236,q.z+108)); }); if(a+b<m){ m=a+b; meglio=k; } });
  if(meglio<0 || m>14) return null;
  var p=vie[meglio].p, ia=0, ib=0, da=1e9, db=1e9; p.forEach(function(q,k){ var d1=Math.hypot(q.x+160,q.z+107), d2=Math.hypot(q.x+243.5,q.z+108); if(d1<da){ da=d1; ia=k; } if(d2<db){ db=d2; ib=k; } });
  return {v:meglio, ia:ia, ib:ib};
})();
var PELLEGRINI_NEL_TEMPO=[[320,0],[400,.22],[500,.42],[700,.75],[800,1],[852,1]];
/* i portatori dell'Emporio: tre su cinque della sua gente, con la veste del lavoratore e il sacco in spalla */
LUOGHI.forEach(function(L){ if(!L.porto) return; for(var n=0;n<L.max;n++) if(n%5<3) forza[I_L+L.i0+n]=1; });
/* da lontano un punto, da vicino una figura: testa e mantello, con i piedi al centro del punto (che sta all'altezza del suolo) */
var texPunto=RM.tela(32,32,function(g){ g.fillStyle='#fff'; g.beginPath(); g.ellipse(16,4,2.3,2.8,0,0,6.3); g.fill(); g.fillRect(15.1,6.2,1.8,1.4);      // 25 novembre 2026, sera: una sagoma, non un birillo (testa piccola, collo, spalle spioventi, braccia, la veste che si allarga); stessa altezza e stessi piedi di prima
  g.beginPath(); [[14.2,7.2],[17.8,7.2],[20.2,9],[20.8,13],[19.9,13.4],[20.7,20],[11.3,20],[12.1,13.4],[11.2,13],[11.8,9]].forEach(function(p,i){ if(i) g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]); }); g.closePath(); g.fill(); },false);
var gGente=new THREE.BufferGeometry();
gGente.setAttribute('position',new THREE.BufferAttribute(pos,3)); gGente.setAttribute('color',new THREE.BufferAttribute(col,3));
var matGente=new THREE.PointsMaterial({size:.95,vertexColors:true,sizeAttenuation:true,transparent:true,map:texPunto,alphaTest:.4});
matGente.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>'+String.fromCharCode(10)+'gl_PointSize=max(gl_PointSize,2.6);'); };
var gente=new THREE.Points(gGente,matGente); gente.frustumCulled=false; gente.userData.gruppo='vita'; RM.scene.add(gente);

/* ---------- figure vicine (24 novembre 2026) ----------
   L'utente: «gli omini lego… puoi fare molto di meglio». Da lontano ognuno resta un punto (il disegno sopra, alto quanto un uomo); quando la figura sullo schermo supera
   una dozzina di pixel il punto si spegne e al suo posto c'è un corpo vero, a istanze: gambe, veste, braccia, collo e testa con i capelli, sandali, e un'ombra morbida ai piedi.
   Quattro fogge, scelte una volta per tutte dal numero della persona: uomo in tunica corta (con la cintura, gambe e avambracci nudi), uomo con il mantello di lana
   (paenula o pallium), donna con la stola lunga fino ai piedi e la palla sopra il capo, qualcuno in toga bianca; e bambini in tunica.
   Le fogge seguono il quadro corrente (Sebesta e Bonfante, The World of Roman Costume, 1994, per sommi capi): la tunica per tutti, la toga solo dei cittadini e di rado
   per strada, le donne velate fuori casa. I tagli sono semplificati; l'altezza (1,65 m) è una media, non una persona. Le gambe e le braccia oscillano col passo
   nello shader (nessun lavoro per il processore). Quante, al massimo, dipende dal gradino della qualità (RM.QUALITA.figure): nessuna in «bassa», 150 nel gradino «telefono»
   (dal 24 novembre 2026, sera: anche sui telefoni, che prima non ne avevano); senza figure le maglie restano spente e non si disegnano nemmeno. */
RM.QUALITA.figure=[0,400,700,1200,150];      // quante figure vicine al massimo, per gradino (bassa, media, alta, massima, telefono; misura del 24 novembre 2026: 400 figure costano meno di mezzo millesimo sulla Radeon integrata)
var PELLE=[0xc9946c,0xb07a55,0xd8a882,0x9c6a48].map(RM.col), CAPELLI=[0x2c2018,0x3e2a1c,0x1e1712,0x6a5440].map(RM.col), LANA=RM.col(0x6b5a44), BIANCO=RM.col(0xefe9da), SANDALO=RM.col(0x4a3424), VELO=RM.col(0xe2d6bc);
function Parti(){ this.p=[]; this.n=[]; this.c=[]; this.o=[]; this.f=[]; this.s=[]; }
Parti.prototype.metti=function(g,colore,osc,fisso,fc){ var q=g.index?g.toNonIndexed():g, P=q.attributes.position.array, N=q.attributes.normal.array, S=q.attributes.ombra?q.attributes.ombra.array:null, i, cc;      // fc(x,y,z): un colore diverso in quel punto (in metri), o null
  for(i=0;i<P.length;i+=3){ cc=(fc&&fc(P[i],P[i+1],P[i+2]))||colore; this.p.push(P[i]*.1,P[i+1]*.1,P[i+2]*.1); this.n.push(N[i],N[i+1],N[i+2]); this.c.push(cc.r,cc.g,cc.b); this.o.push(osc||0);
    this.f.push(typeof fisso==='function'?(fisso(P[i],P[i+1],P[i+2])?1:0):(fisso?1:0)); this.s.push(S?S[i/3]:1); }      // fisso può essere una funzione del punto
  return this; };
var SU=new THREE.Vector3(0,1,0);
function tratto(a,b,r0,r1,lati){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,lati,1,true);      // un tronco di cono fra due punti, in metri
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(SU,d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); return g; }
/* Un profilo [[r, y]] girato attorno all'asse e schiacciato in pianta. f(φ, y) → [moltiplicatore del raggio, spostamento in y, ombra]: le pieghe, l'orlo in diagonale, la parte
   davanti di un manto nascosta dentro il corpo (così il manto resta aperto sul davanti senza buchi); l'ombra va nell'attributo «ombra» (cuoci, più sotto). */
function girato(prof,lati,sx,sz,f){
  var g=new THREE.LatheGeometry(prof.map(function(q){ return new THREE.Vector2(q[0],q[1]); }),lati,Math.PI), p=g.attributes.position, om=new Float32Array(p.count).fill(1), k;      // la cucitura dietro (φ=π): davanti, sul volto, la normale spezzata si vedeva come una riga
  if(f) for(k=0;k<p.count;k++){ var x=p.getX(k), y=p.getY(k), z=p.getZ(k), r=f(Math.atan2(x,z),y); p.setXYZ(k,x*r[0],y+r[1],z*r[0]); om[k]=r[2]; }
  g.scale(sx||1,1,sz||1); g.computeVertexNormals(); g.setAttribute('ombra',new THREE.BufferAttribute(om,1)); return g; }
/* le pieghe di una veste a n lati pari: le colonne di vertici vanno alternate in fuori e in dentro, di più verso l'orlo (n/2 pieghe), con il fondo più scuro; incl: l'orlo
   in diagonale (sale a destra, scende a sinistra); davanti: l'arco davanti che rientra nel corpo (manti aperti) */
function pieghe(ytop,yorlo,n,amp,incl,davanti){
  return function(fi,y){ var w=Math.max(0,Math.min(1,(ytop-y)/(ytop-yorlo))), c=Math.cos(n*fi), m=1+amp*w*c;
    if(davanti && Math.abs(fi)<davanti) m*=.5;
    return [m,(incl||0)*Math.sin(fi)*w*w,(1+.2*c*w)*(1-.16*w)]; }; }
/* Una figura in metri, i piedi a y=0, lo sguardo verso +z. foggia: 0 tunica corta, 1 tunica e mantello, 2 donna, 3 veste lunga e toga (o il clero), 4 a cavallo. Le parti «fisse»
   tengono il loro colore, le altre prendono quello della veste. d: lati dei pezzi tondi (6 per le figure dei passanti; le scene possono chiederne meno).
   Rifatta il 25 novembre 2026, sera (l'utente: «Le figure non sembrano ancora dei lego?»): prima la testa era una palla larga, le spalle un ripiano orizzontale e la veste un tubo.
   Ora: circa sette teste e mezza (1,72 m), testa ovale più stretta, collo, spalle spioventi con la spalla tonda, braccia affusolate, mani; la veste a campana dalla vita all'orlo,
   con le pieghe che si aprono verso il basso e il fondo delle pieghe più scuro; sotto la tunica corta si vedono polpacci e caviglie. Il mantello di lana ha l'orlo in diagonale,
   la palla delle donne copre il capo e ricade sulla schiena lasciando libero il volto, la toga (o la veste del clero) scende al polpaccio sopra la veste lunga.
   I tagli sono semplificati e indicativi (Sebesta e Bonfante, per sommi capi, come prima). Le convenzioni lette da js/scene-tappe.js (personaGeo) restano: spalle a 1,38 m,
   anche a 0,92 m, ginocchio a 0,5 m, le mani in MANO (RM.figuraMani), i colori BIANCO, LANA, VELO, SANDALO per riconoscere le parti. */
var MANO={'-1':[-.21,.81,.095],'1':[.206,.815,.135]};      // dove stanno le mani (m): js/scene-tappe.js le cerca qui (RM.figuraMani)
/* Le vesti per epoca (25 novembre 2026, sera; l'utente: «molta più gente nell'epoca imperiale, molta meno in quella alto medioevale. E cambia anche come si vestono»).
   Fonte: src/testi/vita-roma-fonti.md, sezione «Abiti» e tabella «Per chi disegna» (17 immagini datate guardate). Si disegna solo ciò che la tabella attesta: capi, lunghezze,
   mantelli, copricapi; i colori solo dove la fonte li dà. Dove la tabella dice IPOTESI (donne del III secolo, poveri e soldati del VII-IX, il prete) c'è una forma neutra
   in lana non tinta; lo dice il piede della pagina («Come abbiamo ricostruito la carta e la città»). Campi di una veste: orlo (quota dell'orlo della tunica, in metri),
   maniche 'lunghe' o 'corte', cintura, manto {t, col}, cappuccio, velo {t, col, fascia}, barba, elmo {cresta}, scudo {r}, lancia, corazza (colore), gambe 'lacci',
   dalmatica {col, clavi}, fasce (le due fasce della veste), tinte (i colori possibili della tunica: li sceglie chi la mette in scena). */
var LT={bianco:RM.col(0xd8d0bd), crema:RM.col(0xbfae8f), grigio:RM.col(0x878075), grigioS:RM.col(0x5c574f), bruno:RM.col(0x6a5442), brunoS:RM.col(0x493a2e), nero:RM.col(0x312a24)};      // lana non tinta: i colori naturali delle pecore, per ciò che le fonti non colorano
var ATT={bianca:RM.col(0xe6e0d2), scuro:RM.col(0x3c2e25), castagna:RM.col(0x6b3f24), rossoBruno:RM.col(0x7a3a27), brunoRossa:RM.col(0x6e3a2b), biancoGrigia:RM.col(0xc6c1b5), veloBianco:RM.col(0xeeeae1), clavi:RM.col(0x96302a)};      // i colori attestati (vedi le righe di VESTI)
var FERRO=RM.col(0x77797b), CUOIO=RM.col(0x6b4f36), CRINE=RM.col(0x3a2f27), LEGNO=RM.col(0x6e5539);      // ferro, cuoio, crine e legno: materiali, non tinture
var T_UOMO=[LT.bianco,LT.crema,LT.grigio,LT.bruno], T_DONNA=[LT.crema,LT.grigio,LT.bruno,LT.bianco];
var VESTI={
  /* III secolo (235-330) */
  uomo3:{orlo:.46, maniche:'lunghe', manto:{t:'spalle', col:LT.crema}, tinte:[ATT.bianca,LT.bianco,LT.crema,LT.grigio,LT.bruno]},      // fregio «Oratio» dell'arco di Costantino (312-315): tunica al ginocchio o poco sotto, maniche lunghe, mantello sulle spalle che cade davanti, gambe nude; bianche le tuniche donate da Aureliano (Storia Augusta, Aureliano 48)
  uomo3b:{orlo:.46, maniche:'lunghe', manto:{t:'spalle', col:LT.bruno}, tinte:[ATT.bianca,LT.bianco,LT.crema,LT.grigio]},
  tunica3:{orlo:.5, maniche:'lunghe', cintura:true, tinte:[ATT.bianca,LT.bianco,LT.crema,LT.grigio,LT.bruno]},      // senza mantello (i bambini del fregio, con la tunica più corta); la cintura è ipotesi
  toga3:{orlo:.03, maniche:'lunghe', manto:{t:'toga', col:LT.bianco}, tinte:[LT.bianco]},      // i senatori sui rostri del fregio: toga fino ai piedi con la fascia di traverso sul petto
  donna3:{orlo:.02, maniche:'lunghe', velo:{t:'palla', col:LT.crema}, tinte:T_DONNA},      // IPOTESI intera: nessuna fonte del III secolo letta; per analogia col IV secolo, veste lunga e capo coperto
  soldato3:{orlo:.6, maniche:'lunghe', cintura:true, manto:{t:'corto', col:LT.bruno}, elmo:{cresta:.06}, scudo:{r:.38}, lancia:true, tinte:[LT.crema,LT.bianco,LT.grigio]},      // fregio del ponte Milvio (312-315) e Vegezio I 20: elmo con cresta, scudo tondo con umbone, tunica corta stretta in vita, mantello corto, lancia; i colori non sono noti
  /* IV-VI secolo (331-600) */
  uomo4:{orlo:.46, maniche:'corte', manto:{t:'paenula', col:LT.bruno}, tinte:T_UOMO},      // Codice Teodosiano XIV 10, 1 (382): «colobium» (tunica a maniche corte) e «paenula» (mantello chiuso); lunghezze e colori sono ipotesi
  uomo4b:{orlo:.46, maniche:'corte', manto:{t:'paenula', col:LT.grigio}, tinte:T_UOMO},
  tunica4:{orlo:.47, maniche:'corte', cintura:true, tinte:T_UOMO},
  schiavo4:{orlo:.47, maniche:'corte', manto:{t:'paenula', col:LT.brunoS}, cappuccio:true, tinte:T_UOMO},      // Codice Teodosiano XIV 10, 1, 2: gli schiavi col «byrrus», il mantello col cappuccio
  donna4:{orlo:.02, maniche:'lunghe', velo:{t:'palla', col:ATT.scuro}, tinte:[ATT.scuro,LT.brunoS,LT.nero,LT.bruno]},      // veste lunga fino a terra, capo coperto (Ammiano XIV 6, 16); scura (Girolamo, lettere 22, 27 e 127, 13)
  donna4b:{orlo:.02, maniche:'lunghe', velo:{t:'scuro', col:ATT.scuro, fascia:LT.bianco}, tinte:[ATT.scuro,LT.brunoS]},      // la vedova Turtura (catacomba di Commodilla, 528): veste lunga, velo bruno scuro, una fascia chiara sulla fronte
  clero4:{orlo:.04, maniche:'lunghe', manto:{t:'paenula', col:LT.brunoS}, tinte:[LT.bianco,LT.crema]},      // il clero per strada vestiva come i laici (Celestino I, 428): tunica lunga e mantello
  soldato4:{orlo:.58, maniche:'lunghe', cintura:true, corazza:RM.col(0xb4ad9e), manto:{t:'polpaccio', col:LT.grigio}, elmo:{cresta:.11}, scudo:{r:.48}, lancia:true, gambe:'lacci', tinte:[LT.crema,LT.bianco]},      // Santa Maria Maggiore (circa 430) e Onorio nel 406: tunica corta, corazza chiara, mantello al polpaccio, elmo a cresta alta, grande scudo tondo, lancia, calzari a lacci; i colori del mosaico sono convenzione e non si usano
  /* VII-IX secolo (601-852) */
  uomo7:{orlo:.36, maniche:'lunghe', manto:{t:'lungo', col:ATT.castagna}, barba:true, tinte:[ATT.bianca,LT.bianco]},      // Teodoto (Santa Maria Antiqua, 741-752) e Gordiano (Giovanni Diacono IV 83): mantello lungo e chiuso sotto il ginocchio, tunica chiara, barba corta; castagna e rosso-bruno sono attestati per i ricchi
  uomo7b:{orlo:.36, maniche:'lunghe', manto:{t:'lungo', col:ATT.rossoBruno}, barba:true, tinte:[ATT.bianca,LT.bianco]},
  uomo7c:{orlo:.36, maniche:'lunghe', manto:{t:'lungo', col:LT.bruno}, barba:true, tinte:[LT.bianco,LT.crema,LT.grigio]},      // IPOTESI: la stessa forma per chi non era ricco, in lana non tinta
  tunica7:{orlo:.47, maniche:'lunghe', cintura:true, barba:true, tinte:[LT.crema,LT.grigio,LT.bruno,LT.brunoS]},      // IPOTESI intera (i poveri): una forma neutra
  donna7:{orlo:.02, maniche:'lunghe', velo:{t:'bianco', col:ATT.veloBianco}, fasce:true, tinte:[ATT.brunoRossa,ATT.biancoGrigia,LT.crema,LT.bruno]},      // Silvia (Giovanni Diacono IV 83) e Teodora (Santa Prassede, 817-824): velo bianco sul capo e attorno al viso, veste lunga con due fasce, bruno-rossa o bianco-grigia
  clero7:{orlo:.02, maniche:'lunghe', dalmatica:{col:ATT.bianca, clavi:ATT.clavi}, manto:{t:'planeta', col:ATT.castagna}, tinte:[ATT.bianca]},      // IPOTESI per il prete: come il vescovo senza pallio, «planeta» castagna (Gregorio, Giovanni Diacono IV 84) sulla dalmatica bianca coi clavi rossi (mosaici del IX secolo)
  soldato7:{orlo:.55, maniche:'lunghe', cintura:true, manto:{t:'corto', col:LT.bruno}, scudo:{r:.4}, lancia:true, barba:true, tinte:[LT.crema,LT.grigio,LT.bruno]},      // IPOTESI intera: della milizia romana nessuna fonte dice la veste; tunica, mantello, scudo e lancia, niente elmo
  /* i portatori dell'Emporio (25 novembre 2026, notte): il lavoratore del fossore dei Santi Marcellino e Pietro (tunica corta sopra il ginocchio stretta in vita, gambe nude,
     il carico in spalla; data dell'immagine non detta) con un sacco sulla spalla sinistra; lana non tinta */
  portatore3:{orlo:.56, maniche:'lunghe', cintura:true, carico:true, tinte:[LT.crema,LT.grigio,LT.bruno,LT.bianco]},
  portatore4:{orlo:.56, maniche:'corte', cintura:true, carico:true, tinte:[LT.crema,LT.grigio,LT.bruno,LT.brunoS]}
};
var VECCHIE=[{orlo:.52, maniche:'corte', cintura:true},{orlo:.36, maniche:'lunghe', manto:{t:'vecchio', col:LANA}},{orlo:.02, maniche:'lunghe', velo:{t:'palla', col:VELO}},{orlo:.02, maniche:'lunghe', manto:{t:'toga3', col:BIANCO}},{seduto:true, maniche:'corte'}];      // le cinque fogge di prima (0-4), coi colori che js/scene-tappe.js riconosce
function epoca(anno){ return anno<=330?0:anno<=600?1:2; }      // III secolo; IV-VI; VII-IX
/* i passanti di ogni epoca: [veste, quota su cento, statura] (le quote sono di comodo, come prima) */
var EPOCHE=[
  [['uomo3',26],['uomo3b',16],['tunica3',14],['tunica3',8,.62],['toga3',4],['donna3',32],['portatore3',0]],
  [['uomo4',20],['uomo4b',14],['tunica4',12],['tunica4',8,.62],['schiavo4',8],['donna4',18],['donna4b',14],['clero4',6],['portatore4',0]],
  [['uomo7',14],['uomo7b',10],['uomo7c',16],['tunica7',12],['tunica7',8,.62],['donna7',32],['clero7',8]]];
function gau(a,s){ return Math.exp(-a*a/(s*s)); }
function sm(a,b,x){ var t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
/* una striscia di stoffa (i clavi della dalmatica, le fasce della veste) sopra un profilo [[r,y]] girato e schiacciato di sz, all'angolo fi, larga w, k volte fuori dalla veste */
function striscia(prof,fi,w,sz,k){
  var p=[], i; for(i=0;i<prof.length-1;i++){ var A=prof[i], B2=prof[i+1];
    function pt(q,d){ var r=q[0]*k, x=Math.sin(fi)*r, z=Math.cos(fi)*r*sz, tx=Math.cos(fi), tz=-Math.sin(fi)*sz, tl=Math.hypot(tx,tz); return [x+tx/tl*d,q[1],z+tz/tl*d]; }
    var a=pt(A,-w/2), b=pt(A,w/2), c=pt(B2,w/2), d=pt(B2,-w/2); p.push.apply(p,a.concat(b,c,a,c,d)); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.computeVertexNormals(); return g; }
/* pieghe, l'orlo in diagonale (incl) e i fianchi sollevati (alza: l'orlo sale ai lati, sopra le braccia: la «planeta»; poco: l'orlo arrotondato del mantello lungo) */
function piegheM(ytop,yorlo,n,amp,incl,alza){ var f=pieghe(ytop,yorlo,n,amp,incl); return function(fi,y){ var r=f(fi,y), w=Math.max(0,Math.min(1,(ytop-y)/(ytop-yorlo))); r[1]+=(alza||0)*Math.pow(Math.sin(fi),2)*w*w; return r; }; }
/* la testa (25 novembre 2026, sera): un ovale con i volumi del volto sulla stessa pelle, la fronte e l'arcata, le orbite in ombra (niente occhi a bottone: a questa distanza
   l'occhio è un'ombra nell'orbita), il naso, gli zigomi, la bocca appena segnata, il mento, la nuca. lati: 8 da vicino, 6 sui telefoni */
function testaG(lati,fine){
  var pr=fine?[[0,1.488],[.036,1.494],[.056,1.515],[.066,1.545],[.071,1.575],[.074,1.6],[.075,1.63],[.071,1.662],[.057,1.69],[.033,1.708],[0,1.716]]:[[0,1.49],[.05,1.505],[.07,1.56],[.074,1.61],[.07,1.665],[.04,1.706],[0,1.716]];
  return girato(pr,lati,.9,1.12,function(fi,y){ var a=Math.abs(fi), m=1, om=1;
    m+=.2*gau(fi,.22)*gau(y-1.598,.018);                                   // il naso
    m+=.06*gau(fi,.4)*gau(y-1.508,.016);                                   // il mento
    m+=.05*gau(a-Math.PI,.9)*gau(y-1.64,.035);                             // la nuca
    if(fine){ m+=.045*gau(fi,.6)*gau(y-1.632,.011);                        // l'arcata delle sopracciglia
      m-=.05*gau(a-.63,.26)*gau(y-1.612,.013);                             // le orbite
      m+=.035*gau(a-1.1,.3)*gau(y-1.578,.02);                              // gli zigomi
      m-=.035*gau(a-1.6,.35)*gau(y-1.63,.03);                              // le tempie
      om-=.42*gau(a-.63,.28)*gau(y-1.612,.012);                            // l'ombra nell'orbita
      om-=.18*gau(fi,.35)*gau(y-1.537,.006); }                             // la bocca
    om-=.2*gau(y-1.49,.012)*gau(fi,1.2);                                   // sotto il mento
    return [m,0,om]; }).translate(0,0,.008); }
function corpo(v,k,d,tf){      // tf (27 novembre 2026): i lati di una testa più fine, chiesta solo dalle scene per le figure nei primi piani (l'800 dentro San Pietro); senza, nulla cambia
  if(typeof v==='number') v=VECCHIE[v]; else if(typeof v==='string') v=VESTI[v];
  var B=new Parti(), pel=PELLE[k%PELLE.length], cap=CAPELLI[(k>>1)%CAPELLI.length], L=d||6, LL=(L+2)+((L+2)&1), n2=LL/2, LS=L>=5?12:LL, LT2=L>=5?8:6, seduto=!!v.seduto, h=v.orlo, lunga=!seduto&&h<.2, mt=v.manto&&v.manto.t, mc=v.manto&&v.manto.col, S, U;
  U=lunga?[[.153,.9],[.165,1.15],[.17,1.33],[.135,1.41],[.085,1.45],[.045,1.47]]:[[.153,.9],[.163,1.12],[.17,1.33],[.135,1.41],[.085,1.45],[.045,1.47]];      // dalla vita in su: il petto, le spalle spioventi
  if(seduto) S=[[.2,.84],[.17,.9],[.155,.97]];                                                                                          // dalla vita in giù, a campana
  else if(lunga) S=[[.215,h],[.19,.4],[.16,.82],[.153,.97]];
  else S=[[.198,h],[.184,h+.14],[.158,.88],[.153,.97]];
  var dal=v.dalmatica, tunF=dal?true:false, tunC=dal?dal.col:BIANCO;      // la dalmatica ha il suo colore; la tunica prende quello di chi la porta
  B.metti(girato(S,LS,1,.72,pieghe(.97,S[0][1],LS/2,.075,0)),tunC,0,tunF).metti(girato(U,LL,1,.72),v.corazza||tunC,0,!!v.corazza||tunF);      // la veste: le pieghe si aprono verso l'orlo; la corazza sul busto
  if(dal||v.fasce) [-.42,.42,Math.PI-.42,Math.PI+.42].forEach(function(fi){ var cs=dal?dal.clavi:BIANCO.clone().multiplyScalar(.62);      // i clavi (o le due fasce), davanti e dietro, dalle spalle all'orlo
    B.metti(striscia(S,fi,.034,.72,1.085),cs,0,!!dal).metti(striscia(U.slice(0,3),fi,.034,.72,1.03),cs,0,!!dal); });
  if(v.cintura) B.metti(girato([[.157,.93],[.159,.985]],LL,1,.73),SANDALO,0,true);                                                     // la cintura
  if(mt==='vecchio') B.metti(girato([[.245,.6],[.232,.76],[.212,1.0],[.2,1.2],[.205,1.32],[.165,1.42],[.1,1.465],[.05,1.485]],LL,1,.8,pieghe(1.3,.6,n2,.07,.09)),mc,0,true);      // il mantello di lana di prima, l'orlo in diagonale
  if(mt==='toga3'||mt==='toga') B.metti(girato([[.235,mt==='toga'?.07:.3],[.212,.5],[.186,.8],[.176,1.0],[.183,1.2],[.18,1.33],[.13,1.43],[.05,1.48]],LL,1,.78,pieghe(1.25,mt==='toga'?.07:.3,n2,.08,.12)),mc,0,true);      // la toga (o la veste di sopra del clero)
  if(mt==='toga') B.metti(tratto([.13,1.345,.122],[0,1.16,.168],.03,.032,Math.max(4,L)),mc.clone().multiplyScalar(.93),0,true).metti(tratto([0,1.16,.168],[-.125,.985,.13],.032,.03,Math.max(4,L)),mc.clone().multiplyScalar(.93),0,true);      // la fascia ripiegata di traverso sul petto
  if(mt==='spalle') B.metti(girato([[.232,.5],[.222,.7],[.206,.95],[.198,1.15],[.205,1.31],[.168,1.415],[.1,1.462],[.05,1.482]],LL,1,.8,pieghe(1.3,.5,n2,.065,0,.22*Math.PI)),mc,0,true);      // il mantello sulle spalle, aperto davanti, che cade in pieghe verticali (III secolo)
  if(mt==='paenula') B.metti(girato([[.25,.5],[.236,.68],[.218,.92],[.205,1.12],[.206,1.31],[.168,1.415],[.1,1.462],[.05,1.484]],LL,1,.8,piegheM(1.25,.5,n2,.06,0,.03)),mc,0,true);      // la «paenula», chiusa, a campana
  if(mt==='lungo') B.metti(girato([[.245,.3],[.236,.5],[.222,.78],[.208,1.05],[.206,1.31],[.168,1.415],[.1,1.462],[.05,1.484]],LL,1,.8,piegheM(1.25,.3,n2,.055,0,.07)),mc,0,true);      // il mantello lungo e chiuso, sotto il ginocchio, con l'orlo arrotondato (VII-IX secolo)
  if(mt==='planeta') B.metti(girato([[.3,.46],[.282,.62],[.25,.86],[.215,1.1],[.207,1.31],[.168,1.415],[.1,1.462],[.05,1.484]],LL,1,.82,piegheM(1.2,.46,n2,.05,0,.2)),mc,0,true);      // la «planeta» a campana, fino al ginocchio, sollevata sulle braccia
  if(mt==='corto'||mt==='polpaccio'){ var po=mt==='corto'?[[.222,.74],[.21,.95],[.202,1.15],[.206,1.31],[.168,1.415],[.1,1.462],[.05,1.482]]:[[.24,.32],[.23,.55],[.215,.85],[.204,1.1],[.206,1.31],[.168,1.415],[.1,1.462],[.05,1.482]];
    B.metti(girato(po,LL,1,.8,pieghe(1.3,po[0][1],n2,.06,.05,.3*Math.PI)),mc,0,true); }      // il mantello del soldato, sulle spalle e sulla schiena, aperto davanti
  if(v.carico) B.metti(new THREE.SphereGeometry(1,LS,5).scale(.13,.11,.27).rotateZ(-.35).translate(.13,1.5,-.03),RM.col(0xb9a98a),0,true);      // il sacco sulla spalla sinistra (i portatori)
  if(v.cappuccio) B.metti(new THREE.SphereGeometry(1,LS,4).scale(.1,.065,.075).translate(0,1.445,-.1),mc,0,true);      // il cappuccio abbassato sulla nuca
  var ve=v.velo;
  if(ve && (ve.t==='palla'||ve.t==='scuro')) B.metti(girato([[0,1.738],[.075,1.708],[.094,1.62],[.1,1.5],[.19,1.42],[.215,1.25],[.218,.9],[.225,.6]],LL,1,.85,pieghe(1.35,.6,n2,.06,.1,.3*Math.PI)),ve.col,0,true);      // la palla: sopra il capo, ricade sulla schiena, il volto libero
  if(ve && ve.t==='bianco') B.metti(girato([[0,1.742],[.072,1.716],[.093,1.648],[.097,1.56],[.112,1.472],[.19,1.405],[.212,1.3],[.21,1.17]],LL,1,.86,function(fi,y){ return [(Math.abs(fi)<.75&&y>1.5&&y<1.705)?.45:1,0,1]; }),ve.col,0,true);      // il velo bianco attorno al viso, fino alle spalle
  [-1,1].forEach(function(s){
    if(seduto){ B.metti(tratto([s*.1,.95,0],[s*.17,.9,.34],.075,.06,L),BIANCO,s,false).metti(tratto([s*.17,.9,.34],[s*.18,.48,.3],.055,.045,L),pel,s,true);      // a cavallo: le cosce in avanti, le gambe giù lungo i fianchi
      B.metti(new THREE.BoxGeometry(.08,.05,.2).translate(s*.18,.45,.36),SANDALO,s,true); }
    else {
      var lac=v.gambe==='lacci'?function(x,y){ return y<.3&&(y*90%1)<.45?CUOIO:null; }:null;      // i calzari a lacci incrociati fino a metà polpaccio (IV-V secolo)
      if(!lunga) B.metti(tratto([s*.088,.07,0],[s*.09,.33,-.012],.034,.05,L),pel,s,true,lac).metti(tratto([s*.09,.33,-.012],[s*.088,.64,0],.05,.056,L),pel,s,true);      // caviglia, polpaccio e ginocchio sotto la tunica
      B.metti(new THREE.BoxGeometry(.075,.045,.2).translate(s*.088,.022,.045),SANDALO,s,true); }                                        // i sandali
    var vecchio=mt==='vecchio', man=vecchio?LANA:tunC, fis=vecchio||tunF, nudo=v.maniche==='corte'||seduto;
    var M=MANO[s], gz=s>0?.035:.015, LA=Math.max(4,L);      // la sinistra un poco più avanti della destra: niente braccia di soldatino
    B.metti(new THREE.SphereGeometry(1,5,3).scale(L<5?.04:.048,L<5?.042:.05,L<5?.046:.052).translate(s*(L<5?.172:.176),1.355,0),man,2*s,fis).metti(tratto([s*.186,1.35,0],[s*.198,1.1,gz],.048,.041,LA),man,2*s,fis);      // la spalla tonda e il braccio, nella manica
    B.metti(tratto([s*.199,1.13,gz-.004],[M[0]*1.01,M[1]+.06,M[2]-.02],.04,.03,LA),nudo?pel:man,2*s,nudo||fis);                         // l'avambraccio, appena piegato in avanti: nudo con le maniche corte, nella manica con quelle lunghe
    B.metti(new THREE.SphereGeometry(1,4,3).scale(.024,.042,.03).translate(M[0],M[1],M[2]),pel,2*s,true); });                        // la mano
  B.metti(tratto([0,1.42,0],[0,1.53,.008],.045,.042,tf?10:L),pel,0,true);                                                                      // il collo
  var barba=v.barba?function(x,y,z){ return (y<1.565&&z>-.01&&y>1.47)?cap.clone().lerp(pel,.25+.5*sm(1.53,1.565,y)):null; }:null;      // la barba corta (VII-IX secolo: Teodoto, Gordiano)
  var fronte=ve&&ve.fascia?function(x,y,z){ return (y>1.655&&y<1.69&&z>.02)?ve.fascia:null; }:null;      // la fascia chiara sulla fronte, sotto il velo (Turtura)
  B.metti(testaG(tf||LT2,!!tf||L>=6),pel,0,true,barba||fronte);      // i volumi del volto ai passanti (sei lati: si possono vedere da vicino); le figure delle scene (cinque) hanno la testa più semplice                                                                                    // la testa
  if(v.elmo){ B.metti(new THREE.SphereGeometry(.093,LS,4,0,Math.PI*2,0,Math.PI*.53).scale(.95,1,1.08).translate(0,1.618,-.004),FERRO,0,true);      // l'elmo
    B.metti(new THREE.BoxGeometry(.022,v.elmo.cresta,.2).translate(0,1.7+v.elmo.cresta/2,-.012),CRINE,0,true); }                        // la cresta
  else if(!ve) B.metti(new THREE.SphereGeometry(.087,tf||LL,tf?7:L>=6?4:3,0,Math.PI*2,0,Math.PI*.56).scale(.95,1,1.1).rotateX(-.42).translate(0,1.632,-.004),cap,0,true);      // i capelli, corti
  if(v.scudo){ var r=v.scudo.r; B.metti(new THREE.CylinderGeometry(r,r,.03,LS).rotateZ(Math.PI/2).rotateY(-.45).translate(.3,.98,.07),v.scudo.col||LEGNO,0,true);      // lo scudo tondo, al braccio sinistro (legno; nelle scene il colore che distingue le due parti)
    B.metti(new THREE.SphereGeometry(.065,6,3,0,Math.PI*2,0,Math.PI/2).rotateZ(-Math.PI/2).rotateY(-.45).translate(.3+.016*Math.cos(.45),.98,.07+.016*Math.sin(.45)),FERRO,0,true); }      // l'umbone
  if(v.lancia) B.metti(new THREE.CylinderGeometry(.013,.013,2.3,4).translate(-.24,1.15,.11),LEGNO,0,true).metti(new THREE.ConeGeometry(.026,.17,4).translate(-.24,2.38,.11),FERRO,0,true);      // la lancia, nella destra
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));
  g.setAttribute('oscilla',new THREE.Float32BufferAttribute(B.o,1)); g.setAttribute('fisso',new THREE.Float32BufferAttribute(B.f,1)); g.setAttribute('ombra',new THREE.Float32BufferAttribute(B.s,1)); return g;
}
/* l'ombra nelle pieghe dentro i colori (per chi non riconosce le parti dal colore: le figure dei passanti, le figure del Costruttore) */
function cuoci(g){ var c=g.attributes.color.array, s=g.attributes.ombra.array, i; for(i=0;i<s.length;i++){ c[i*3]*=s[i]; c[i*3+1]*=s[i]; c[i*3+2]*=s[i]; } g.deleteAttribute('ombra'); return g; }
RM.figuraMani=MANO; RM.figuraGeo=corpo;      // con l'attributo «ombra» a parte: js/scene-tappe.js riconosce le parti dal colore e poi lo moltiplica
RM.VESTI=VESTI; RM.epocaVesti=epoca; RM.lanaGrezza=LT;      // per js/scene-tappe.js: le vesti di ogni epoca e i toni della lana non tinta
/* Le pose (25 novembre 2026, sera; l'utente: la folla «è ancora una fila di birilli, con le braccia rigide lungo il corpo»). Tre gesti, sulla stessa figura:
   yaw: la testa girata (radianti; il collo segue piano); braccio: un avambraccio piegato in avanti attorno al gomito (-1 il destro, 1 il sinistro, 2 tutti e due: le mani
   davanti, giunte); anca: il peso su una gamba (il bacino si sposta di lato, in unità della scena, le spalle meno). v e n in unità della scena (1 = 10 m); os: «oscilla».
   La stessa cosa la fa lo shader dei passanti (matFigure, più sotto). Pose indicative. */
function posaVertice(v,n,os,P){
  var ao=Math.abs(os), s=os>0?1:-1, a, c, q;
  if(P.braccio && ao>1.5 && (P.braccio===2 || P.braccio===s) && v.y<.1125){
    a=P.braccio===2?-1.3:-1.1; c=Math.cos(a); q=Math.sin(a); var y=v.y-.1115, z=v.z; v.y=y*c-z*q+.1115; v.z=y*q+z*c; if(n){ var ny=n.y, nz=n.z; n.y=ny*c-nz*q; n.z=ny*q+nz*c; }
    var b=-s*(P.braccio===2?.55:.3), cb=Math.cos(b), sb=Math.sin(b), x=v.x-s*.0199; z=v.z; v.x=x*cb+z*sb+s*.0199; v.z=-x*sb+z*cb; if(n){ var nx=n.x; nz=n.z; n.x=nx*cb+nz*sb; n.z=-nx*sb+nz*cb; } }      // e verso il centro
  if(P.anca){ var w=v.y<.092?Math.sin(Math.PI/2*Math.max(0,v.y)/.092):1-.6*sm(.092,.145,v.y); v.x+=P.anca*w; }
  if(P.yaw){ var t=P.yaw*sm(.141,.152,v.y), ct=Math.cos(t), st=Math.sin(t), x2=v.x, z2=v.z; v.x=x2*ct+z2*st; v.z=-x2*st+z2*ct; if(n){ var n1=n.x, n2=n.z; n.x=n1*ct+n2*st; n.z=-n1*st+n2*ct; } }
}
RM.figuraPosa=posaVertice;
var POSE=[{yaw:0,braccio:0,anca:0},{yaw:.4,braccio:0,anca:.0035},{yaw:-.3,braccio:-1,anca:-.003},{yaw:.15,braccio:2,anca:0}];      // le quattro pose ferme delle scene (poche: ogni posa è una maglia in più)
function posaDi(j,ferma){ var h=((j*2246822519)>>>0)%1000, br=h%10;      // la posa di una persona, fissa per numero: chi passa per strada ha la testa e un braccio suoi; chi sta fermo in una scena una delle quattro pose
  if(ferma) return POSE[h%4];
  return {yaw:((h*.0377)%1-.5)*(h%3?.5:1.1), braccio:br<6?0:br<8?-1:br<9?1:2, anca:0}; }
RM.figuraPosaDi=posaDi; RM.figuraPose=POSE;
/* Le stesse figure, ferme, per chi costruisce scene con il Costruttore (js/scene-tappe.js): stessi argomenti delle sue figure a blocchi, così basta che le sue uomo e cavaliere
   chiamino queste. Cinque lati invece di sei (le scene ne mettono a centinaia): un uomo sono 351 triangoli (391 con lo scudo), un cavaliere 1255 (il cavallo è quello delle statue). Le pose sono ferme e indicative.
   Dal 25 novembre 2026, sera, con la figura nuova: circa un quinto di triangoli in più (cinque figure a sei lati, una per foggia: 2204 prima, 2672 dopo). */
var CACHE_F={};
function figuraTinta(foggia,k,col){ var ch=foggia+'|'+(k&3), g=CACHE_F[ch]||(CACHE_F[ch]=cuoci(corpo(foggia,k&3,5))), q=g.clone(), c=q.attributes.color.array, f=q.attributes.fisso.array, i;
  if(col) for(i=0;i<f.length;i++) if(!f[i]){ c[i*3]*=col.r; c[i*3+1]*=col.g; c[i*3+2]*=col.b; }
  q.deleteAttribute('oscilla'); q.deleteAttribute('fisso'); return q; }
var contaF=0;
RM.figura={
  uomo:function(B,x,z,y,col,scudo,ry){ var k=contaF++, h=((k*2654435761)>>>0)%100, f=h<70?0:h<85?1:2;
    B.dentro(x,y,z,ry||0,function(B){ B.geo(figuraTinta(f,k,col),col||BIANCO); if(scudo) B.geo(new THREE.CylinderGeometry(.045,.045,.008,10).rotateZ(Math.PI/2).translate(.034,.1,.01),scudo); }); return B; },
  cavaliere:function(B,x,z,y,ry,colC,colU){ var k=contaF++;
    B.dentro(x,y,z,ry||0,function(B){ if(RM.cavalloStatua) RM.cavalloStatua(B,0,0,0,0,1,colC); B.dentro(0,.068,-.01,0,function(B){ B.geo(figuraTinta(4,k,colU),colU||BIANCO); }); }); return B; } };
var uPasso={value:0};
function matFigure(){ var m=new THREE.MeshLambertMaterial({vertexColors:true}), A=String.fromCharCode(10);
  m.onBeforeCompile=function(sh){ sh.uniforms.uPasso=uPasso;
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute float oscilla; attribute float fisso; attribute float fase; attribute float moto; attribute vec3 posa; uniform float uPasso;'].join(A))
      .replace('#include <color_vertex>',['#include <color_vertex>','vColor.xyz=mix(vColor.xyz,color.xyz,fisso);'].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>',
        'float fP=uPasso*5.6+fase; float ao=abs(oscilla); float sg=sign(oscilla);',
        'float pg=(ao>1.5 && (posa.y>1.5 || abs(posa.y-sg)<0.1))?1.0:0.0;',      // questo braccio è piegato (posaVertice, più sopra)
        'if(pg>0.5 && transformed.y<0.1125){ vec3 q=transformed; q.y-=0.1115; float b=posa.y>1.5?-1.3:-1.1; float cb=cos(b), sb=sin(b); transformed=vec3(q.x,q.y*cb-q.z*sb+0.1115,q.y*sb+q.z*cb); }',
        'transformed.x+=posa.z*(transformed.y<0.092?sin(1.5708*max(transformed.y,0.0)/0.092):1.0-0.6*smoothstep(0.092,0.145,transformed.y));',
        'if(ao>0.5){ float br=step(1.5,ao); float pv=mix(0.092,0.138,br); float an=sin(fP)*moto*mix(0.42,-0.32,br)*sign(oscilla)*(1.0-0.75*pg);',
        '  vec3 q=transformed; q.y-=pv; float ca=cos(an), sa=sin(an); transformed=vec3(q.x,q.y*ca-q.z*sa,q.y*sa+q.z*ca); transformed.y+=pv; }',
        '{ float t=posa.x*smoothstep(0.141,0.152,transformed.y); float ct=cos(t), st=sin(t); transformed.xz=vec2(transformed.x*ct+transformed.z*st,-transformed.x*st+transformed.z*ct); }',      // la testa girata
        'transformed.y+=abs(sin(fP))*0.0035*moto;'].join(A));
  }; return m; }
/* I passanti per epoca (25 novembre 2026, sera): una maglia a istanze per ogni veste dell'epoca (EPOCHE, più sopra), fatte la prima volta che servono; cambiando epoca
   si spengono quelle dell'altra. Il colore della tunica (colT) e quello del punto lontano (col: il mantello o il velo, se ci sono) vengono dalle tinte della veste. */
var figure=[], ombraFig, MAXF=Math.max.apply(null,RM.QUALITA.figure), EP=-1, SET=[], TAB=[], colT=new Float32Array(NP*3);
var matF=MAXF?matFigure():null;
function tabella(ep){ if(TAB[ep]) return TAB[ep]; var L=EPOCHE[ep], nomi=[], t=[], i, j;
  L.forEach(function(q){ if(nomi.indexOf(q[0])<0) nomi.push(q[0]); });
  for(i=0;i<L.length;i++) for(j=0;j<L[i][1];j++) t.push({f:nomi.indexOf(L[i][0]), s:L[i][2]||1, v:VESTI[L[i][0]]});
  while(t.length<100) t.push(t[t.length-1]);
  var pf=nomi.indexOf(ep===0?'portatore3':'portatore4');      // la veste di chi la porta per forza (forza[i]=1: i portatori); nel VII-IX secolo non serve
  return (TAB[ep]={nomi:nomi, t:t, fz:pf<0?null:{f:pf, s:1, v:VESTI[nomi[pf]]}}); }
function maglieEpoca(ep){
  if(SET[ep]) return SET[ep];
  SET[ep]=tabella(ep).nomi.map(function(nome,q){ var g=cuoci(corpo(nome,q*3+1)); g.setAttribute('fase',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1)); g.setAttribute('moto',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1));
    g.setAttribute('posa',new THREE.InstancedBufferAttribute(new Float32Array(MAXF*3),3));
    var m=new THREE.InstancedMesh(g,matF,MAXF); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAXF*3),3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count=0; m.visible=false; m.frustumCulled=false; m.receiveShadow=true; m.userData.gruppo='vita'; RM.scene.add(m); figure.push(m); return m; });
  return SET[ep]; }
function vestiEpoca(anno){      // le tinte di tutti, per l'epoca dell'anno
  var ep=epoca(anno); if(ep===EP) return; EP=ep; var TB=tabella(ep), T=TB.t, i;
  for(i=0;i<NP;i++){ var h=((i*2654435761)>>>0)%100, v=(forza[i]&&TB.fz)?TB.fz.v:T[h].v, ti=v.tinte, c=ti[((i*7919)>>>0)%ti.length], k=.9+((i*.371)%1)*.2, cp=(v.manto&&v.manto.col)||(v.velo&&v.velo.col)||c;
    colT[i*3]=c.r*k; colT[i*3+1]=c.g*k; colT[i*3+2]=c.b*k; k*=.8; col[i*3]=cp.r*k; col[i*3+1]=cp.g*k; col[i*3+2]=cp.b*k; }      // il punto lontano non ha luce né ombra: un poco più scuro, come la figura illuminata
  if(gGente) gGente.attributes.color.needsUpdate=true;
  figure.forEach(function(m){ m.count=0; m.visible=false; }); }
if(MAXF){
  var texOmbra=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(0,0,0,.55)'); q.addColorStop(.6,'rgba(0,0,0,.25)'); q.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);
  ombraFig=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:texOmbra,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),MAXF);
  ombraFig.instanceMatrix.setUsage(THREE.DynamicDrawUsage); ombraFig.count=0; ombraFig.visible=false; ombraFig.frustumCulled=false; ombraFig.userData.gruppo='vita'; RM.scene.add(ombraFig);
}
var dirF=new Float32Array(NP), prima=new Float32Array(NP*2), mF=new THREE.Matrix4(), qF=new THREE.Quaternion(), vF=new THREE.Vector3(), sF=new THREE.Vector3(), eF=new THREE.Euler();
/* 28 novembre 2026, sesto giro (le prime misure dall'iPhone): si carica sulla scheda grafica solo la parte usata di un attributo, i primi k valori (le istanze disegnate),
   non tutto l'attributo, che è grande quanto il gradino più alto. Prima le figure vicine caricavano circa 300 kB a ogni fotogramma anche con poche persone in vista; su Safari ogni
   caricamento passa a un altro processo. La scheda grafica legge solo le istanze contate: l'immagine non cambia. */
if(RM.fluido) RM.fluido.parziale=!/[?&]parziale=0/.test(location.search);      // ?parziale=0 lo spegne (per le prove; anche a pagina aperta con RM.fluido.parziale=false)
function parziale(a,k){ if(RM.fluido && RM.fluido.parziale===false){ a.updateRange.count=-1; a.needsUpdate=true; return; } a.updateRange.offset=0; a.updateRange.count=Math.min(k,a.array.length); a.needsUpdate=true; }
RM.parziale=parziale;
function figureVicine(n){
  var max=MAXF?(RM.QUALITA.figure[RM.q]||0):0, i, k;
  if(!max){ if(MAXF && (figure.some(function(m){ return m.count; })||ombraFig.count||ombraFig.visible)){ figure.forEach(function(m){ m.count=0; m.visible=false; }); ombraFig.count=0; ombraFig.visible=false; } return; }      // spente: in «bassa» non si compilano né si disegnano
  if(EP<0) vestiEpoca(annoOra);
  var cam=RM.camera.position, lim=.165*RM.vistaU.uPxScala.value/12, lim2=lim*lim, M=null, TB=tabella(EP), T=TB.t, conta=null, tot=0, cx=cam.x, cy=cam.y, cz=cam.z;      // vicina: alta più di dodici pixel sullo schermo
  for(i=0;i<n;i++){ var o=i*3, y=pos[o+1]; if(y<-50) continue;
    var dx=pos[o]-cx, dz=pos[o+2]-cz, dy=y-cy, d2=dx*dx+dy*dy+dz*dz, mx=pos[o]-prima[i*2], mz=pos[o+2]-prima[i*2+1], mv=mx*mx+mz*mz;
    if(mv>1e-8 && mv<1) dirF[i]=Math.atan2(mx,mz); prima[i*2]=pos[o]; prima[i*2+1]=pos[o+2];
    if(d2>lim2 || tot>=max) continue;
    if(!M){ M=maglieEpoca(EP); conta=M.map(function(){ return 0; }); }
    var fz=forza[i]&&TB.fz, fg=fz?TB.fz:T[((i*2654435761)>>>0)%100], m=M[fg.f], c=conta[fg.f]++, ps=fz?{yaw:0,braccio:1,anca:0}:posaDi(i,false), mo=mv>1e-8&&mv<1?1:0; tot++;
    eF.set(0,dirF[i],0); qF.setFromEuler(eF); vF.set(pos[o],piedi[i],pos[o+2]); sF.set(fg.s,fg.s,fg.s); mF.compose(vF,qF,sF); m.setMatrixAt(c,mF);
    m.instanceColor.setXYZ(c,colT[o],colT[o+1],colT[o+2]); m.geometry.attributes.fase.array[c]=(i*.618034%1)*6.283; m.geometry.attributes.moto.array[c]=mo;
    m.geometry.attributes.posa.array[c*3]=ps.yaw*(mo?.6:1); m.geometry.attributes.posa.array[c*3+1]=ps.braccio; m.geometry.attributes.posa.array[c*3+2]=mo?0:(((i>>3)%3)-1)*.0035;      // chi cammina gira meno la testa; chi sta fermo sposta il peso su una gamba
    sF.set(.075*fg.s,1,.075*fg.s); vF.y+=.003; mF.compose(vF,qF,sF); ombraFig.setMatrixAt(tot-1,mF);
    pos[o+1]=-60;                                                                                                           // il punto lontano si spegne
  }
  var S2=SET[EP]||[];
  for(k=0;k<S2.length;k++){ var mm=S2[k], ck=conta?conta[k]:0; mm.count=ck; mm.visible=ck>0; if(ck){ var ga=mm.geometry.attributes; parziale(mm.instanceMatrix,ck*16); parziale(mm.instanceColor,ck*3); parziale(ga.fase,ck); parziale(ga.moto,ck); parziale(ga.posa,ck*3); } }
  ombraFig.count=tot; ombraFig.visible=tot>0; if(tot) parziale(ombraFig.instanceMatrix,tot*16);
}

/* ---------- carri, bestie da soma, banchi dell'Emporio, ronde (25 novembre 2026, notte) ----------
   Le forme sono generiche e dichiarate: nessuna fonte letta descrive un carro, un mulo o un banco di Roma. Un carro a due ruote piene tirato da una coppia di buoi
   (la Tabula Heracleensis nomina carri tirati da buoi o da bestie da soma), un mulo col basto, un banco con la tenda di tela non tinta. In metri, poi in unità (×0,1).
   Le zampe oscillano nello shader (perno: la quota dell'anca; zampa: la fase), come le gambe della gente. */
function Pz(){ this.p=[]; this.n=[]; this.c=[]; this.pe=[]; this.pz=[]; this.za=[]; this.pa=[]; this.parte=0; }      // parte: le varianti nella stessa maglia (si vede solo quella dell'istanza, attributo tipo)
Pz.prototype.metti=function(g,colore,perno,zampa,pernoZ){ var q=g.index?g.toNonIndexed():g, P=q.attributes.position.array, Nn=q.attributes.normal.array, i;      // pernoZ: dove sta la zampa lungo il corpo (la zampa gira attorno alla sua spalla, non al centro dell'animale)
  for(i=0;i<P.length;i+=3){ this.p.push(P[i]*.1,P[i+1]*.1,P[i+2]*.1); this.n.push(Nn[i],Nn[i+1],Nn[i+2]); this.c.push(colore.r,colore.g,colore.b); this.pe.push((perno||0)*.1); this.pz.push((pernoZ||0)*.1); this.za.push(zampa||0); this.pa.push(this.parte); }
  return this; };
Pz.prototype.geometria=function(nIst){ var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
  g.setAttribute('perno',new THREE.Float32BufferAttribute(this.pe,1)); g.setAttribute('pernoZ',new THREE.Float32BufferAttribute(this.pz,1)); g.setAttribute('zampa',new THREE.Float32BufferAttribute(this.za,1)); g.setAttribute('parte',new THREE.Float32BufferAttribute(this.pa,1)); g.setAttribute('tipo',new THREE.InstancedBufferAttribute(new Float32Array(nIst),1));
  g.setAttribute('fase',new THREE.InstancedBufferAttribute(new Float32Array(nIst),1)); g.setAttribute('moto',new THREE.InstancedBufferAttribute(new Float32Array(nIst),1)); return g; };
function scat(w,h,d,x,y,z){ return new THREE.BoxGeometry(w,h,d).translate(x,y,z); }
function palla(rx,ry,rz,x,y,z,lati){ return new THREE.SphereGeometry(1,lati||8,5).scale(rx,ry,rz).translate(x,y,z); }
var C_BUE=RM.col(0x948a7c), C_MULO=RM.col(0x5e4e40), C_CORNA=RM.col(0xcfc4ae), C_ZOCCOLO=RM.col(0x2e2620), C_TUFO=RM.col(0xb09a72), C_SACCO=RM.col(0xb9a98a), C_TERRA=RM.col(0xa35f3c), C_CESTO=RM.col(0x8a6b40);
/* Il bue (26 novembre 2026, rifatto: prima erano due uova con le zampe; l'utente trova le figure «dei lego»). Superfici lisce tese su sezioni ovali (RM.pelle di js/monumenti.js),
   non scatole né sfere: tronco a botte, garrese, collo, testa bassa col muso scuro, corna, orecchie, quattro zampe col garretto piegato e lo zoccolo, coda col fiocco.
   SCHEMA: nessuna fonte letta descrive i buoi da lavoro di Roma; misure da bue da lavoro (garrese a 1,45 m, lungo 2,2 m) e mantello grigio chiaro sono scelte del modello.
   Circa 630 triangoli da vicino (fino:true), circa 330 da lontano e al gradino «bassa». La testa verso +z. */
var C_BUE2=RM.col(0xa59d8f), C_MUSO=RM.col(0x3d3731);
var finta={geo:function(g){ return g; }};      // RM.pelle consegna la superficie a B.geo: qui la si vuole indietro, per metterla nel Pz
function telo(anelli,lati){ return RM.pelle(finta,anelli,C_BUE,lati); }
function bue(B,x0,z0,opz){
  opz=opz||{}; var fino=opz.fino!==false, col=opz.col||C_BUE, nC=fino?9:6, nT=fino?7:5, nZ=fino?5:4, fs=opz.fase||0;
  function an(z,su,giu,rx){ return [x0,(su+giu)/2,z0+z,rx,(su-giu)/2]; }      // una sezione del tronco: dorso, ventre, mezza larghezza
  B.metti(telo([an(-1.08,1.3,1.12,.1),an(-.98,1.37,.86,.27),an(-.72,1.38,.68,.36),an(-.3,1.34,.6,.4),an(.12,1.36,.58,.41),an(.45,1.45,.6,.36),an(.68,1.38,.62,.27),an(.8,1.2,.78,.16)],nC),col);      // il tronco a botte, il garrese sopra le spalle
  B.metti(telo([[x0,1.15,z0+.5,.2,.25],[x0,1.16,z0+.82,.17,.24],[x0,1.15,z0+1.02,.14,.17],[x0,1.03,z0+1.16,.13,.13],[x0,.9,z0+1.3,.1,.1],[x0,.83,z0+1.39,.088,.088]],nT),col);      // il collo e la testa, bassa come sotto il giogo
  if(fino) B.metti(telo([[x0,.8,z0+.6,.05,.06],[x0,.86,z0+.84,.06,.12],[x0,.93,z0+1.02,.04,.06]],5),col);      // la giogaia sotto il collo
  B.metti(telo([[x0,.845,z0+1.37,.092,.09],[x0,.79,z0+1.45,.088,.078],[x0,.765,z0+1.49,.06,.05]],nT),C_MUSO);      // il muso scuro
  [-1,1].forEach(function(s){
    B.metti(telo([[x0+s*.09,1.2,z0+1.06,.04,.04],[x0+s*.2,1.27,z0+1.1,.032,.032],[x0+s*.26,1.41,z0+1.12,.012,.012]],fino?5:3),C_CORNA);      // le corna, in fuori e in su
    if(fino) B.metti(telo([[x0+s*.12,1.12,z0+1.01,.025,.025],[x0+s*.21,1.1,z0+.99,.05,.02],[x0+s*.29,1.07,z0+.97,.008,.008]],4),col);      // le orecchie, di lato
  });
  B.metti(tratto([x0,1.3,z0-1.06],[x0,.62,z0-1.16],.035,.02,fino?4:3),col).metti(palla(.05,.09,.05,x0,.56,z0-1.16,4),C_MUSO);      // la coda col fiocco
  [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]].forEach(function(g){ var x=x0+g[0]*.2, dav=g[1]>0, z=z0+(dav?.48:-.68), pe=dav?.95:1.0, fa=g[2]+fs;      // le zampe, a coppie diagonali alterne
    var A=dav?[[x,1.0,z,.12,.16],[x,.62,z+.01,.075,.09],[x,.4,z,.055,.06],[x,.25,z+.01,.04,.045],[x,.09,z+.02,.045,.05]]
             :[[x,1.05,z,.15,.2],[x,.72,z-.04,.09,.12],[x,.5,z-.1,.06,.075],[x,.26,z-.05,.045,.05],[x,.09,z-.02,.045,.05]];      // davanti diritte; dietro la coscia larga e il garretto piegato indietro
    B.metti(telo(A,nZ),col,pe,fa,z).metti(tratto([x,.11,z+(dav?.02:-.02)],[x,0,z+(dav?.05:.01)],.05,.062,4),C_MUSO,pe,fa,z); });      // la zampa e lo zoccolo
}
function giogo(B,xs,z,lar){      // il giogo di legno sopra i due colli, con gli archetti che li cingono (forma: SCHEMA)
  B.metti(scat(lar,.1,.13,0,1.46,z),LEGNO);
  xs.forEach(function(x){ [-1,1].forEach(function(s){ B.metti(tratto([x+s*.19,1.44,z],[x+s*.17,.97,z],.02,.02,4),LEGNO); }); B.metti(scat(.38,.035,.04,x,.95,z),LEGNO); }); }
function geoCarro(){ var B=new Pz();      // una maglia sola: il carro vuoto (tipo 1), con i blocchi (2), con i sacchi (3)
  bue(B,-.46,1.45); bue(B,.46,1.45,{col:C_BUE2,fase:.5});      // la stessa forma dei buoi del traino sul Tevere
  giogo(B,[-.46,.46],2.29,1.35); B.metti(tratto([0,.98,-.42],[0,1.42,2.29],.055,.05,5),LEGNO);                                         // il giogo sul collo e il timone
  B.metti(scat(1.35,.09,2.1,0,.93,-1.5),LEGNO);                                                                                      // il pianale
  [-1,1].forEach(function(s){ B.metti(scat(.06,.32,2.1,s*.65,1.12,-1.5),LEGNO).metti(new THREE.CylinderGeometry(.56,.56,.13,12).rotateZ(Math.PI/2).translate(s*.79,.56,-1.5),LEGNO.clone().multiplyScalar(.8)); });      // le sponde e le ruote piene
  B.metti(scat(1.35,.32,.06,0,1.12,-.47),LEGNO).metti(scat(1.35,.32,.06,0,1.12,-2.53),LEGNO);
  B.parte=2; { B.metti(scat(.55,.38,.5,-.3,1.17,-1),C_TUFO).metti(scat(.55,.38,.55,.3,1.17,-1.1),C_TUFO).metti(scat(.6,.36,.5,0,1.17,-1.9),C_TUFO).metti(scat(.5,.32,.45,0,1.52,-1.4),C_TUFO); }      // blocchi per un cantiere
  B.parte=3; { [[-.32,-.85],[.32,-.9],[-.3,-1.6],[.32,-1.65],[0,-2.2]].forEach(function(q,k){ B.metti(palla(.27,.17,.38,q[0],1.15,q[1]),C_SACCO.clone().multiplyScalar(.9+.05*(k%3))); }); B.metti(palla(.27,.17,.38,0,1.43,-1.3),C_SACCO); }      // sacchi
  B.parte=0; return B.geometria(NCAR); }
function geoMulo(){ var B=new Pz();      // un mulo col basto
  B.metti(palla(.25,.3,.62,0,.98,0,8),C_MULO).metti(tratto([0,1.08,.45],[0,1.34,.72],.13,.085,6),C_MULO).metti(new THREE.SphereGeometry(1,6,5).scale(.085,.105,.25).rotateX(.5).translate(0,1.34,.88),C_MULO);
  [-1,1].forEach(function(s){ B.metti(new THREE.ConeGeometry(.03,.19,4).rotateZ(-s*.25).translate(s*.05,1.5,.75),C_MULO); });       // le orecchie lunghe
  B.metti(tratto([0,1.1,-.6],[0,.55,-.7],.025,.02,4),C_MULO.clone().multiplyScalar(.6));
  [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]].forEach(function(g){ var x=g[0]*.14, z=g[1]*.42; B.metti(tratto([x,.72,z],[x,.06,z],.055,.035,5),C_MULO,.72,g[2],z).metti(scat(.07,.06,.08,x,.03,z),C_ZOCCOLO,.72,g[2],z); });
  B.metti(scat(.5,.07,.55,0,1.29,0),CUOIO);                                                                                        // il basto
  [-1,1].forEach(function(s){ B.metti(scat(.22,.36,.52,s*.34,1.04,0),C_SACCO.clone().multiplyScalar(.85)); });                       // i due carichi ai fianchi
  return B.geometria(NMUL); }
function banco(B){      // un banco: tavola, quattro pali, una tenda di tela; sopra ceste e vasi
  B.metti(scat(2,.08,.85,0,.85,0),LEGNO);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ B.metti(scat(.07,.85,.07,q[0]*.9,.42,q[1]*.36),LEGNO).metti(scat(.06,2.25,.06,q[0]*.95,1.12,q[1]*.4),LEGNO); });
  B.metti(new THREE.BoxGeometry(2.3,.04,1.3).rotateX(.16).translate(0,2.22,0),LT.crema);      // tela non tinta: il colore delle tende non è nelle fonti
  [-.6,0,.6].forEach(function(x,k){ B.metti(new THREE.CylinderGeometry(.2,.16,.16,8).translate(x,.97,-.1),C_CESTO).metti(palla(.17,.07,.17,x,1.06,-.1,6),k===1?LT.bruno:RM.col(0x7d7a45)); });
  B.metti(palla(.12,.2,.12,-.3,1.08,.25,6),C_TERRA).metti(palla(.12,.2,.12,.35,1.08,.25,6),C_TERRA); }
function anfora(B,x,z,inclina,ry){ var g=new THREE.LatheGeometry([[0,0],[.05,.06],[.13,.3],[.17,.55],[.15,.75],[.06,.86],[.055,.98],[.07,1.0],[0,1.0]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),7);
  g.rotateX(inclina||0).rotateY(ry||0).translate(x,.02,z); B.metti(g,C_TERRA.clone().multiplyScalar(.9+.1*Math.cos(x*9+z*7))); }
function anfore(B){ for(var k=0;k<10;k++) anfora(B,(k%4-1.5)*.36,(Math.floor(k/4)-1)*.36,.12*Math.sin(k*2.1),k); }      // vino e olio dei magazzini (Porfirione in Platner, Horrea Galbae): anfore in piedi a file
function sacchi(B){ [[-.3,0,.2],[.3,0,.25],[0,0,-.3],[-.3,.3,-.35],[.32,.3,-.32],[0,.3,.4],[0,.58,0]].forEach(function(q,k){ B.metti(new THREE.SphereGeometry(1,8,5).scale(.3,.17,.42).rotateY(k).translate(q[0],.17+q[1],q[2]),C_SACCO.clone().multiplyScalar(.88+.04*(k%3))); }); }
function geoMercato(){ var B=new Pz(); B.parte=1; banco(B); B.parte=2; anfore(B); B.parte=3; sacchi(B); B.parte=0; return B.geometria(28); }      // banco (tipo 1), anfore (2), sacchi (3) in una maglia sola: un disegno      // il grano dell'annona in sacchi
function matAnimali(){ var m=new THREE.MeshLambertMaterial({vertexColors:true}), A=String.fromCharCode(10);
  m.onBeforeCompile=function(sh){ sh.uniforms.uPasso=uPasso;
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute float perno; attribute float pernoZ; attribute float zampa; attribute float parte; attribute float tipo; attribute float fase; attribute float moto; uniform float uPasso;'].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>','if(parte>0.5 && abs(parte-tipo)>0.5) transformed=vec3(0.0);','if(perno>0.0){ float an=sin(uPasso*3.6+fase+zampa)*0.3*moto; vec3 q=transformed; q.y-=perno; q.z-=pernoZ; float ca=cos(an), sa=sin(an); transformed=vec3(q.x,q.y*ca-q.z*sa,q.y*sa+q.z*ca); transformed.y+=perno; transformed.z+=pernoZ; }'].join(A));      // la zampa gira attorno alla sua spalla (perno, pernoZ)
  }; return m; }
var matAn=matAnimali();
function istanze(geo,n,ombra){ var m=new THREE.InstancedMesh(geo,matAn,n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);
  m.count=0; m.visible=false; m.frustumCulled=false; m.castShadow=!!ombra; m.receiveShadow=true; m.userData.gruppo='vita'; RM.scene.add(m); return m; }
var mCarri=istanze(geoCarro(),NCAR,true), mMuli=istanze(geoMulo(),NMUL,false), mMerc=istanze(geoMercato(),28,false);      // tre disegni in tutto; muli e banchi senza ombra (piccoli: costerebbero un disegno e migliaia di triangoli in più)
mMerc.instanceMatrix.setUsage(THREE.StaticDrawUsage);
var oT=new THREE.Object3D();
/* i banchi dell'Emporio sui posti liberi della striscia: banchi verso il portico, anfore e sacchi verso la banchina; i venditori dietro i banchi */
function posaBanchi(L){
  if(!L.porto) return; var riva=[], terra=[], k, x, z, df;
  for(k=0;k<L.nOk;k++){ x=L.ok[k*2]; z=L.ok[k*2+1]; df=RM.distFiume(x,z); (df<6?riva:terra).push(k); }
  var presi=[], usati={};
  function distanti(k,dmin){ for(var q=0;q<presi.length;q++){ var p=presi[q]; if(Math.hypot(L.ok[k*2]-L.ok[p*2],L.ok[k*2+1]-L.ok[p*2+1])<dmin) return false; } return true; }
  var tot=0, T=mMerc.geometry.attributes.tipo;
  function scegli(lista,quanti,dmin,tipo){ var n=0; for(var q=0;q<lista.length && n<quanti && tot<28;q++){ var s=lista[q]; if(usati[s]||!distanti(s,dmin)) continue; presi.push(s); usati[s]=1;
      oT.position.set(L.ok[s*2],L.okY[s],L.ok[s*2+1]); oT.rotation.set(0,Math.atan2(L.x-L.ok[s*2],L.z-L.ok[s*2+1])+(tipo===1?0:s),0); oT.scale.setScalar(1); oT.updateMatrix(); mMerc.setMatrixAt(tot,oT.matrix); T.array[tot]=tipo; tot++; n++; }
    return n; }
  L.banchi=[]; var nb=scegli(terra,12,1.1,1); for(k=0;k<nb;k++) L.banchi.push(presi[k]);
  scegli(riva.concat(terra),8,.9,2); scegli(riva.concat(terra),8,.9,3);
  mMerc.count=tot; mMerc.instanceMatrix.needsUpdate=true; T.needsUpdate=true;
  L.riva=riva.filter(function(s){ return !usati[s]; }); L.terra=terra.filter(function(s){ return !usati[s]; });
  if(!L.riva.length) L.riva=L.terra.slice(); if(!L.terra.length) L.terra=L.riva.slice();
}
function banchiVisibili(on){ mMerc.visible=on && mMerc.count>0; }

/* I carri. Di giorno pochi (la Tabula Heracleensis li vieta in città «post solem ortum neve ante horam X», salvo i materiali per i templi e le opere pubbliche, le macerie,
   i carri vuoti o del letame; che valesse ancora dopo il II secolo non è attestato, e la pagina lo dice), di notte un poco di più. Accanto ai cantieri aperti in quell'anno
   due carri di blocchi ciascuno (l'eccezione delle opere pubbliche; i cantieri sono quelli dei monumenti, CANTIERI in js/dati.js, e delle mura di Aureliano, 271-280, Zosimo I 49).
   Nessun carro negli assedi, quando mancavano i viveri anche per gli animali (Procopio V 19). Ogni carro e ogni mulo ha chi lo guida, a piedi. */
var CANT=[]; (RM.MONUMENTI||[]).forEach(function(m){ var st=D.MONUMENTI&&D.MONUMENTI[m.id]; if(m.x==null||!st||st[0][1]!=='assente'||!st[1]) return;
  CANT.push({x:m.x, z:m.z, da:(D.CANTIERI&&D.CANTIERI[m.id])||st[1][0]-6, a:st[1][0]}); });
(function(){ if(!RM.MURA) return; var k, q; for(k=0;k<RM.MURA.length;k+=Math.max(1,Math.floor(RM.MURA.length/4))){ q=RM.MURA[k]; CANT.push({x:q[0], z:q[1], da:271, a:280, mura:true}); } })();      // quattro tratti delle mura di Aureliano
function puntoVicino(x,z,dmax){ var m=dmax*dmax, r=-1, j, q, d; for(j=0;j<NCAMP;j++){ q=vie[CAMP[j*3]].p[CAMP[j*3+1]]; d=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z); if(d<m){ m=d; r=j; } } return r; }
CANT.forEach(function(c){ c.j=puntoVicino(c.x,c.z,30); });
var cV=new Uint16Array(NC), cC=new Float32Array(NC), cR=new Float32Array(NC), cT=new Float32Array(NC), cVel=new Float32Array(NC), cDir=new Float32Array(NC), cVira=new Float32Array(NC), cTipo=new Uint8Array(NC), nCar=0, nMul=0;
for(i=0;i<NC;i++){ cR[i]=8+rndV()*22; cT[i]=(rndV()*2-1)*cR[i]; cVel[i]=(i<NCAR?.045:.06)*(.85+.3*rndV()); cDir[i]=rndV()<.5?-1:1; }      // carri a passo di bue (circa 0,9 m/s), muli un poco più svelti
function scegliCarri(anno){
  var tot=cumC[NCAMP-1]||1, k=0, j;
  CANT.forEach(function(c){ if(c.j<0 || anno<c.da || anno>=c.a) return; for(var q=0;q<2 && k<NCAR;q++,k++){ cV[k]=CAMP[c.j*3]; cC[k]=CAMP[c.j*3+1]; cR[k]=6; cTipo[k]=1; } });      // i carri dei cantieri
  RM.vitaCantieri=k/2;
  for(j=k;j<NC;j++){ var u=hh(j,11)*tot, lo=0, hi=NCAMP-1; while(lo<hi){ var m=(lo+hi)>>1; if(cumC[m]<u) lo=m+1; else hi=m; }
    cV[j]=CAMP[lo*3]; cC[j]=CAMP[lo*3+1]; if(j<NCAR){ cTipo[j]=hh(j,12)<.45?0:2; cR[j]=8+hh(j,13)*22; } }      // vuoti o con sacchi
  nCarCant=k; }
var nCarCant=0;
/* Le ronde dei vigili (Digesto I 15, 3: sette coorti, una ogni due regioni; il prefetto «per totam noctem vigilare»; graffiti di un posto di guardia in Trastevere dal 215 al 245,
   Platner, Cohortium Vigilum Stationes). Solo di notte e solo nel III secolo: dopo, le fonti lette non descrivono ronde per le vie di Roma. Vesti e attrezzi non sono descritti:
   la stessa veste di lana non tinta della gente comune.
   27 novembre 2026 (l'utente: vederli meglio, con un lume, in un punto preciso del centro; fonti rilette in coda a src/testi/vita-roma-fonti.md, «Le ronde dei vigili»):
   - da dove partono: Platner e Ashby, «Cohortium Vigilum Stationes», danno per certe quattro caserme (I «on the east side of the via Lata, directly opposite the Saepta»;
     II sull'Esquilino; IV sull'Aventino presso San Saba; V sul Celio accanto al Macellum Magnum) e il posto di guardia della VII coorte in Trastevere, presso San Crisogono,
     coi graffiti dal 215 al 245. La prima ronda esce dalla caserma della via Lata, scende la via fino al Campidoglio e per il clivo arriva al Foro, poi torna; la seconda
     esce dal posto di Trastevere e va lungo la via fino al fiume, verso l'isola, e torna. I punti vengono dalle coordinate di oggi (piazza dei Santi Apostoli, monte de' Fiori):
     le caserme non sono disegnate e la ronda parte dalla via davanti; il percorso è uno schema (il Digesto dice solo che il prefetto gira tutta la notte);
   - che cosa portano: il Digesto I 15, 3, 3 (Paolo) vuole il prefetto «per totam noctem vigilare … et coerrare calciatum cum hamis et dolabris»: in giro, calzato, con
     uncini e asce. Qui due uomini per ronda portano l'uncino in cima a un'asta e due l'ascia (forme e misure: schema);
   - il lume: nessuna fonte letta dà torce o lanterne ai vigili (Cassiodoro, Variae VII 7, descrive anzi un lavoro «sub profunda caligine»). Il lume che porta il primo,
     un punto caldo con l'alone a terra, c'è solo perché la ronda si veda di notte anche dalla vista d'insieme: è detto nel piede della pagina. */
var RONDE=[], PUNTI_RONDE=[{da:RM.ll(41.8987,12.4822), meta:[[-22,-37],[0,-8]], min:.75}, {da:RM.ll(41.8889,12.4733), meta:[RM.ll(41.8907,12.4776)], min:.55, max:24}];      // caserma della I coorte (via Lata) e posto di guardia della VII (Trastevere); mete: il piede della via Lata, il Foro; l'isola Tiberina
(function(){
  function vicinoSu(k,x,z){ var v=vie[k], m=1e9, r=0; v.p.forEach(function(q,i){ var d=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z); if(d<m){ m=d; r=i; } }); return [r,Math.sqrt(m)]; }
  function piuVicina(x,z,min,salta){ var best=-1, bd=1e9; vie.forEach(function(v,k){ if(v.larga<min || k===salta) return; var r=vicinoSu(k,x,z); if(r[1]<bd){ bd=r[1]; best=k; } }); return [best,bd]; }
  PUNTI_RONDE.forEach(function(R){
    var P=[], Y=[], k=piuVicina(R.da[0],R.da[1],R.min,-1)[0]; if(k<0) return;
    var i0=vicinoSu(k,R.da[0],R.da[1])[0], cur=k, ultima=null;
    R.meta.forEach(function(m,n){
      if(n>0){ var q=P[P.length-1], s=piuVicina(q.x,q.z,.4,cur); if(s[0]<0 || s[1]>3) return; cur=s[0]; i0=vicinoSu(cur,q.x,q.z)[0]; }      // il tratto dopo: la via che comincia dove finisce questa (al più 30 m)
      var i1=vicinoSu(cur,m[0],m[1])[0], st=i1>=i0?1:-1, i, v=vie[cur];
      if(R.max) i1=i0+st*Math.min(R.max,Math.abs(i1-i0));
      for(i=i0;;i+=st){ if(!(ultima && ultima===v.p[i])){ P.push(v.p[i]); Y.push(v.y[i]); } ultima=v.p[i]; if(i===i1) break; } });
    if(P.length>4) RONDE.push({v:{p:P, y:new Float32Array(Y), larga:.6}, t:0, fine:P.length-1.001, vel:.05, ferma:0}); });
})();
/* il lume e l'alone a terra (vedi sopra: schema per vedere la ronda) */
var texLume=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,236,190,1)'); q.addColorStop(.22,'rgba(255,214,150,.95)'); q.addColorStop(.5,'rgba(255,170,80,.4)'); q.addColorStop(1,'rgba(255,140,50,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);
var pLume=new Float32Array(6), gLume=new THREE.BufferGeometry(); gLume.setAttribute('position',new THREE.BufferAttribute(pLume,3));
var lumiR=[new THREE.Points(gLume,new THREE.PointsMaterial({size:24,sizeAttenuation:false,map:texLume,color:0xffe8c0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false})),      // da lontano: sempre ventiquattro pixel (il nucleo chiaro ne occupa circa la metà), più chiaro e più grande dei lumi delle finestre (11 pixel, arancio), che sono centinaia
  new THREE.Points(gLume,new THREE.PointsMaterial({size:.6,sizeAttenuation:true,map:texLume,color:0xffb060,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}))];      // da vicino: un fuoco di circa sei metri di luce
var aloneR=new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4,2.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:texLume,color:0xffa858,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),2);      // la luce a terra, 15 m
lumiR.concat([aloneR]).forEach(function(m){ m.visible=false; m.frustumCulled=false; m.renderOrder=3; m.userData.gruppo='vita'; RM.scene.add(m); });
/* uncini e asce (Digesto I 15, 3, 3): due per ronda di ciascuno, in mano a chi segue il primo */
var geoUncino=new RM.Costruttore().scatola(.007,.25,.007,0,.03,0,RM.col(0x6b5236)).scatola(.006,.006,.03,0,.272,.012,RM.col(0x4a4a4c)).scatola(.006,.02,.006,0,.255,.025,RM.col(0x4a4a4c)).geometria();      // asta di circa 2,5 m e l'uncino di ferro
var geoAscia=new RM.Costruttore().scatola(.006,.08,.006,0,.06,0,RM.col(0x6b5236)).scatola(.005,.014,.032,0,.13,.004,RM.col(0x4a4a4c)).geometria();      // manico e testa
var attrR=[new THREE.InstancedMesh(geoUncino,RM.matPietra(),4), new THREE.InstancedMesh(geoAscia,RM.matPietra(),4)];
attrR.forEach(function(m){ m.count=0; m.visible=false; m.frustumCulled=false; m.castShadow=true; m.userData.gruppo='vita'; RM.scene.add(m); });
var oR=new THREE.Object3D();
function rondeSpente(){ lumiR.forEach(function(m){ m.visible=false; }); aloneR.visible=false; attrR.forEach(function(m){ m.visible=false; }); }

/* ---------- le scene hanno la precedenza ----------
   Le messe in scena delle tappe (js/scene-tappe.js) e gli eventi stanno dopo la vita fra i figli della scena: quelle accese segnano una griglia di celle di 20 m (i loro vertici e
   le loro figure, con un margine di 15 m), e lì la gente di tutti i giorni non c'è. Si rifà quando cambia ciò che è acceso, e ogni tre secondi se una scena si muove.
   Altri moduli possono aggiungere un luogo da tenere libero in RM.vitaEvita ({x, z, r}). */
var OX=-450, OZ=-700, OC=2, ONX=450, ONZ=700, occ=new Uint8Array(ONX*ONZ), occN=0, occFirma='', occT=0, mT=new THREE.Matrix4(), vT=new THREE.Vector3(), bT=new THREE.Box3();
function segna(x,z,r){ var i0=Math.max(0,Math.floor((x-r-OX)/OC)), i1=Math.min(ONX-1,Math.floor((x+r-OX)/OC)), k0=Math.max(0,Math.floor((z-r-OZ)/OC)), k1=Math.min(ONZ-1,Math.floor((z+r-OZ)/OC)), i, k;
  for(k=k0;k<=k1;k++) for(i=i0;i<=i1;i++) occ[k*ONX+i]=1; occN++; }
function occupato(x,z){ if(!occN) return false; var i=Math.floor((x-OX)/OC), k=Math.floor((z-OZ)/OC); return i>=0&&k>=0&&i<ONX&&k<ONZ&&occ[k*ONX+i]===1; }
function segnaOggetto(o){ if(!o.visible) return;
  var g=o.geometry, P=g&&g.attributes&&g.attributes.position, j, st;
  if(P && (o.isMesh||o.isLine)){
    if(o.isInstancedMesh){ st=Math.max(1,Math.floor(o.count/1500)); for(j=0;j<o.count;j+=st){ o.getMatrixAt(j,mT); vT.setFromMatrixPosition(mT).applyMatrix4(o.matrixWorld); segna(vT.x,vT.z,1.5); } }
    else { st=Math.max(1,Math.floor(P.count/1500)); for(j=0;j<P.count;j+=st){ vT.fromBufferAttribute(P,j).applyMatrix4(o.matrixWorld); segna(vT.x,vT.z,1.5); } } }
  for(j=0;j<o.children.length;j++) segnaOggetto(o.children[j]); }
function zoneScene(forza){
  var ch=RM.scene.children, firma='', k, c;
  for(k=IDX_VITA;k<ch.length;k++){ c=ch[k]; if(c.visible && c.userData.gruppo!=='vita' && !c.isPoints && !c.userData.noZona) firma+=k+','; }      // noZona: ciò che sta dentro un edificio (l'interno di San Pietro nell'800) non toglie posto a nessuno, e si muove a ogni fotogramma
  firma+='|'+RM.vitaEvita.length;
  if(firma===occFirma && !forza) return; occFirma=firma; occ.fill(0); occN=0;
  for(k=IDX_VITA;k<ch.length;k++){ c=ch[k]; if(!c.visible || c.userData.gruppo==='vita' || c.isPoints || c.isSprite || c.isLight || c.userData.noZona) continue;
    c.updateMatrixWorld(true); bT.setFromObject(c); if(bT.isEmpty() || (bT.max.x-bT.min.x>200 && bT.max.z-bT.min.z>200)) continue;      // la piena e il velo coprono tutto: non sono scene
    segnaOggetto(c); }
  RM.vitaEvita.forEach(function(e){ if(e && e.x!=null) segna(e.x,e.z,e.r||2); });
}
/* Il rifacimento di ogni tre secondi a pezzi (28 novembre 2026, quarto giro della fluidità sul telefono; l'utente: «scatta soprattutto nelle scene avanzate alto medievali»).
   Con una scena accesa che si muove (il corteo dell'800) la griglia si rifaceva tutta in un fotogramma: centinaia di maglie, fino a 1.500 vertici l'una (sul banco da telefono
   a 4x da 20 a 43 millesimi, uno scatto ogni tre secondi, anche a camera ferma). Ora la griglia nuova si scrive a parte, al più un millesimo per fotogramma, una maglia per volta,
   con gli stessi vertici di prima; finché non è finita vale quella di prima, poi si scambiano. Al cambio di ciò che è acceso (zoneDaRifare) resta tutto in un fotogramma, come prima. */
var zP=null, occB=new Uint8Array(ONX*ONZ);
function segnaUno(o){ var g=o.geometry, P=g&&g.attributes&&g.attributes.position, j, st;      // segnaOggetto senza i figli
  if(!P || !(o.isMesh||o.isLine)) return;
  if(o.isInstancedMesh){ st=Math.max(1,Math.floor(o.count/1500)); for(j=0;j<o.count;j+=st){ o.getMatrixAt(j,mT); vT.setFromMatrixPosition(mT).applyMatrix4(o.matrixWorld); segna(vT.x,vT.z,1.5); } }
  else { st=Math.max(1,Math.floor(P.count/1500)); for(j=0;j<P.count;j+=st){ vT.fromBufferAttribute(P,j).applyMatrix4(o.matrixWorld); segna(vT.x,vT.z,1.5); } } }
function raccogli(o,q){ if(!o.visible) return; q.push(o); for(var j=0;j<o.children.length;j++) raccogli(o.children[j],q); }
function zoneAvvia(){ var ch=RM.scene.children, firma='', k, c, lista=[];
  for(k=IDX_VITA;k<ch.length;k++){ c=ch[k]; if(c.visible && c.userData.gruppo!=='vita' && !c.isPoints && !c.userData.noZona) firma+=k+','; }
  occFirma=firma+'|'+RM.vitaEvita.length;
  for(k=IDX_VITA;k<ch.length;k++){ c=ch[k]; if(!c.visible || c.userData.gruppo==='vita' || c.isPoints || c.isSprite || c.isLight || c.userData.noZona) continue; lista.push(c); }
  occB.fill(0); zP={lista:lista, i:0, coda:[], n:0}; }
function zonePasso(ms){ var t0=performance.now(), vecchia=occ, vecchioN=occN, fatto=false, c; occ=occB; occN=zP.n;      // segna scrive nella griglia nuova
  while(performance.now()-t0<ms){
    if(zP.coda.length){ segnaUno(zP.coda.pop()); continue; }
    if(zP.i>=zP.lista.length){ RM.vitaEvita.forEach(function(e){ if(e && e.x!=null) segna(e.x,e.z,e.r||2); }); fatto=true; break; }
    c=zP.lista[zP.i++]; c.updateMatrixWorld(true); bT.setFromObject(c); if(bT.isEmpty() || (bT.max.x-bT.min.x>200 && bT.max.z-bT.min.z>200)) continue;
    raccogli(c,zP.coda); }
  if(fatto){ occB=vecchia; zP=null; } else { zP.n=occN; occ=vecchia; occN=vecchioN; } }
RM.zoneProva=function(confronta){ if(!confronta) return {aPezzi:!!zP, segni:occN};      // per le prove; con confronta: la griglia rifatta in un colpo e a pezzi nello stesso istante, cella per cella
  var salva=occ.slice(), sN=occN, i, n1=0, n2=0, div=0; zP=null; zoneScene(true); var A=occ.slice(), nA=occN; occ.set(salva); occN=sN;
  zoneAvvia(); while(zP) zonePasso(1e9);
  for(i=0;i<A.length;i++){ if(A[i]) n1++; if(occ[i]) n2++; if(A[i]!==occ[i]) div++; } return {celleInUnColpo:n1, celleAPezzi:n2, diverse:div, segniInUnColpo:nA, segniAPezzi:occN}; };

/* ---------- a ogni fotogramma ---------- */
var VA={quota:1,carri:1,assedio:false,nota:''}, vieDaRifare=true, zoneDaRifare=true;
function sulla(v,t,lat,o,j){      // mette la persona j sulla via v al punto t (in punti), spostata di lat unità verso destra
  var np=v.p.length; if(t<0) t=0; if(t>np-1.001) t=np-1.001; var i0=t|0, pa=v.p[i0], pb=v.p[i0+1], f=t-i0, ex=pb.x-pa.x, ez=pb.z-pa.z, el=Math.hypot(ex,ez)||1;
  tX=ex/el; tZ=ez/el; pos[o]=pa.x+ex*f-tZ*lat; pos[o+2]=pa.z+ez*f+tX*lat; piedi[j]=v.y[i0]+(v.y[i0+1]-v.y[i0])*f; pos[o+1]=piedi[j]+.2; }
var tX=0, tZ=1;      // la direzione della via nell'ultimo punto (sulla)
/* Chi è lontano dalla camera (più di 450 m) si muove un fotogramma su tre, con un passo tre volte più lungo: a quella distanza non si vede, e il lavoro per fotogramma
   cala di quasi due terzi. lontano(o,j): 1 vicino, 3 lontano e tocca a lui, 0 lontano e non tocca a lui (la posizione resta quella di prima). */
var FC=0, CX=0, CZ=0, CY2=0;
function lontano(o,j){ var dx=pos[o]-CX, dz=pos[o+2]-CZ, d2=dx*dx+dz*dz+CY2; if(d2<2025) return 1; if(d2<8100) return (j+FC)%3?0:3; return (j+FC)%6?0:6; }      // oltre 900 m un fotogramma su sei (25 novembre 2026: nel 300, con la città piena, la gente costava 6 millesimi per fotogramma; i più sono lontani)
function muoviGente(dt){
  var j=0, n, b, s, o, vp, tt, f, hs, lx, lz, ca, sa, lato, k, L;
  var fr=RM.QUALITA.gente[RM.q]||1, nt=RM.notte||0, F=(RM.vitaFattore==null?1:RM.vitaFattore)*VA.quota, dtm=MENO_MOTO?0:dt;
  var fracRes=(.1+.9*Math.pow(quotaGente,.7))*(1-.88*nt)*F, d3;      // nelle case di una città piena escono in tanti, in quella vuota dell'VIII secolo pochi
  FC++; CX=RM.camera.position.x; CZ=RM.camera.position.z; CY2=RM.camera.position.y*RM.camera.position.y;
  /* chi abita un isolato: avanti e indietro sulla via di casa, o attorno all'isolato nei vicoli; di notte quasi tutti in casa */
  for(n=0;n<N;n++){
    b=isolati[n];
    for(var q=0;q<PER_ISOLATO;q++,j++){
      o=j*3;
      if(b.a0<.5 || (b.vv<0 && !b.vicoli) || (q>0 && fr<.8) || hh(j,1)>=fracRes){ pos[o+1]=-60; continue; }
      if(pos[o+1]>-50 && (d3=lontano(o,j))===0) continue;      // lontano: si muove un fotogramma su tre
      s=giro[j]=(giro[j]+passo[j]*dtm*(d3||1)+4)%4;
      if(b.vv<0 || (q%2===1 && b.vicoli)){                                                 // nei vicoli, attorno all'isolato
        ca=Math.cos(b.ry); sa=Math.sin(b.ry); lato=s|0; f=s-lato; hs=b.w/2+.45;
        if(lato===0){ lx=-hs+2*hs*f; lz=hs; } else if(lato===1){ lx=hs; lz=hs-2*hs*f; } else if(lato===2){ lx=hs-2*hs*f; lz=-hs; } else { lx=-hs; lz=-hs+2*hs*f; }
        pos[o]=b.x+lx*ca+lz*sa; pos[o+1]=b.y+.16; piedi[j]=b.y; pos[o+2]=b.z-lx*sa+lz*ca;
      } else {
        vp=vie[b.vv]; tt=b.vi+(3+2*q+(q>1?3:0))*(Math.abs(s-2)-1);                                 // avanti e indietro lungo la via di casa, per una sessantina di metri
        sulla(vp,tt,((j*.618034)%1-.5)*1.5*vp.larga,o,j);
      }
      if(occupato(pos[o],pos[o+2])) pos[o+1]=-60;
    }
  }
  /* i viandanti */
  var nV=Math.min(NV,Math.round(NV0*fr*quotaGente*(1-.88*nt)*F));
  for(n=0;n<NV;n++,j++){
    o=j*3;
    if(n>=nV){ pos[o+1]=-60; continue; }
    if(pos[o+1]>-50 && (d3=lontano(o,j))===0) continue;
    vp=vie[wV[n]];
    if(!wFermo[n]){ wT[n]+=wVel[n]*dtm*(d3||1); if(wT[n]>wR[n]||wT[n]<-wR[n]){ wVel[n]=-wVel[n]; wT[n]=Math.max(-wR[n],Math.min(wR[n],wT[n])); } }
    var pr=wFermo[n]&&(n%6===1), lat=(pr?wLato[n-1]:wLato[n])*vp.larga, t0=pr?wC[n-1]+wT[n-1]:wC[n]+wT[n], sg=(lat+.14>vp.larga*.75)?-1:1;
    if(pr) lat+=sg*.14;                                                                      // il compagno, a un metro e mezzo
    sulla(vp,t0,lat,o,j);
    if(wFermo[n]){ var d=pr?-sg:sg; dirF[j]=Math.atan2(-tZ*d,tX*d); }                         // fermi a coppie, l'uno davanti all'altro
    if(occupato(pos[o],pos[o+2])) pos[o+1]=-60;
  }
  /* i luoghi affollati */
  for(k=0;k<LUOGHI.length;k++){ L=LUOGHI[k];
    var nL=0; if(L.vis && L.ok && L.nOk) nL=Math.min(L.max,Math.round(L.n*SCALA_L*fr*(L.fisso?1:quotaGente)*(1-.92*nt)*F));
    if(!L.fidato && nL) nL=Math.min(nL,L.nOk+(L.porto&&L.riva&&L.riva.length?20:0));      // non più gente che posti liberi
    for(n=0;n<L.max;n++){ j=I_L+L.i0+n; o=j*3;
      if(n>=nL){ pos[o+1]=-60; continue; }
      var A, B2, x, z, y, u=0;
      if(L.porto && L.riva){
        if(forza[j]){ A=L.riva[(n*7)%L.riva.length]; B2=L.terra[(n*11+3)%L.terra.length]; }      // i portatori: dalla banchina ai magazzini e ritorno
        else if(L.banchi.length && n%4<2){ var bi=L.banchi[(n>>1)%L.banchi.length]; A=B2=bi; }  // venditori e compratori ai banchi
        else { A=B2=L.terra[(n*5+1)%L.terra.length]; }
      } else { A=(n*7+3)%L.nOk; B2=(n%3===0)?(n*13+5)%L.nOk:A; }                          // uno su tre va da un posto all'altro
      var xa=L.ok[A*2], za=L.ok[A*2+1], xb=L.ok[B2*2], zb=L.ok[B2*2+1];
      if(A!==B2){ var dd=Math.hypot(xb-xa,zb-za)||1; giro[j]=(giro[j]+Math.abs(passo[j])*2.4*dtm/dd)%2; u=giro[j]<1?giro[j]:2-giro[j]; x=xa+(xb-xa)*u; z=za+(zb-za)*u; }
      else { var ang=hh(j,5)*6.2832, rr=(L.porto&&L.banchi&&L.banchi.indexOf(A)>=0)?.15+.05*(n%3):.06*hh(j,6); x=xa+Math.cos(ang)*rr; z=za+Math.sin(ang)*rr; dirF[j]=Math.atan2(xa-x,za-z)+(rr<.08?ang:0); }
      y=L.okY?(A!==B2?L.okY[A]+(L.okY[B2]-L.okY[A])*u:L.okY[A]):RM.hRapida(x,z)+.1;
      pos[o]=x; pos[o+2]=z; piedi[j]=y; pos[o+1]=y+.2;
      if(occupato(x,z)) pos[o+1]=-60;
    }
  }
  j=I_G;
  var arrivati=Math.round(NG0*Math.min(GMAX,fr)*quotaPellegrini*(1-.75*nt)*F);
  for(n=0;n<NG;n++,j++){
    o=j*3; var pg=pellegrini[n];
    if(n>=arrivati){ pos[o+1]=-60; continue; }
    if(n%2){ pg.a+=pg.vel*dtm*3; pos[o]=-246.6+Math.cos(pg.a)*pg.r*3.5; pos[o+2]=-108+Math.sin(pg.a)*pg.r*2.9; }                     // nel cortile dell'atrio e sul sagrato lastricato davanti
    else{
      pg.s+=pg.vel*dtm; if(pg.s>1||pg.s<0){ pg.vel=-pg.vel; pg.s=Math.max(0,Math.min(1,pg.s)); }
      if(n%4===0 || !viaPietro){ pos[o]=-180.1-66.8*pg.s; pos[o+2]=-109+4*pg.s+pg.lato*.55; }                                        // sotto il portico, lungo il suo asse
      else{ var vq=vie[viaPietro.v]; sulla(vq,viaPietro.ia+(viaPietro.ib-viaPietro.ia)*pg.s,pg.lato*vq.larga,o,j); pos[o+1]+=.1; if(occupato(pos[o],pos[o+2])) pos[o+1]=-60; continue; }                      // sulla via, dal ponte alla basilica
    }
    piedi[j]=RM.hRapida(pos[o],pos[o+2])+.1; pos[o+1]=piedi[j]+.2;
    if(occupato(pos[o],pos[o+2])) pos[o+1]=-60;
  }
  muoviCarri(dtm,fr,nt);
  muoviRonde(dtm,nt);
  figureVicine(NP);
  gGente.attributes.position.needsUpdate=true;
}
/* carri e muli: avanti e indietro sul loro tratto, tenendo la destra; in fondo al tratto girano sul posto in tre secondi */
function muoviCarri(dt,fr,nt){
  var giorno=1-nt, k, o, j, v, np, t, i0, f, pa, pb, ex, ez, el, x, z, y, ang, lat;
  var nCg=Math.round(CARRI0*fr*quotaGente*(giorno+1.6*nt)*VA.carri*F_());      // pochi di giorno, un poco di più di notte
  var nMu=Math.round(MULI0*fr*quotaGente*(1-.6*nt)*VA.carri*F_());
  var cm=0, cc=0;
  for(k=0;k<NC;k++){ j=I_C+k; o=j*3;
    var mulo=k>=NCAR, on=mulo?(k-NCAR<nMu):(k<nCarCant?VA.carri>.5:(k-nCarCant<nCg));
    if(!on){ pos[o+1]=-60; continue; }
    v=vie[cV[k]]; np=v.p.length;
    if(cVira[k]>0){ cVira[k]=Math.max(0,cVira[k]-dt/3); }
    else { cT[k]+=cDir[k]*cVel[k]*dt; if(cT[k]>cR[k]||cT[k]<-cR[k]){ cT[k]=Math.max(-cR[k],Math.min(cR[k],cT[k])); cDir[k]=-cDir[k]; cVira[k]=1; } }
    t=Math.max(0,Math.min(np-1.001,cC[k]+cT[k])); i0=t|0; f=t-i0; pa=v.p[i0]; pb=v.p[i0+1]; ex=pb.x-pa.x; ez=pb.z-pa.z; el=Math.hypot(ex,ez)||1;
    lat=cDir[k]*(.12+.25*v.larga);                                                       // tiene la destra
    x=pa.x+ex*f-ez/el*lat; z=pa.z+ez*f+ex/el*lat; y=v.y[i0]+(v.y[i0+1]-v.y[i0])*f;
    ang=Math.atan2(ex,ez)+(cDir[k]<0?Math.PI:0)+(cVira[k]>0?Math.PI*cVira[k]*cVira[k]*(3-2*cVira[k]):0);
    if(occupato(x,z)){ pos[o+1]=-60; continue; }
    oT.position.set(x,y,z); oT.rotation.set(0,ang,0);      // 26 novembre 2026: sulla quota dei piedi di chi guida (prima 0,8 m più giù: ruote e zampe sparivano nel basolato) oT.scale.setScalar(1); oT.updateMatrix();
    var m=mulo?mMuli:mCarri, c=mulo?cm++:cc++;
    m.setMatrixAt(c,oT.matrix); m.geometry.attributes.tipo.array[c]=mulo?0:cTipo[k]+1; m.geometry.attributes.fase.array[c]=k*1.7; m.geometry.attributes.moto.array[c]=(MENO_MOTO||cVira[k]>0)?0:1; var tn=.88+.24*hh(k,8); m.instanceColor.setXYZ(c,tn,tn,tn);
    /* chi guida: accanto ai buoi, o davanti al mulo con la cavezza */
    var sx=Math.sin(ang), sz=Math.cos(ang), av=mulo?.13:.16, la=mulo?.03:-.11;
    pos[o]=x+sx*av+sz*la; pos[o+2]=z+sz*av-sx*la; piedi[j]=y; pos[o+1]=y+.2; if(cVira[k]>0) dirF[j]=ang;
  }
  [[mCarri,cc],[mMuli,cm]].forEach(function(q){ var m=q[0], n=q[1]; m.count=n; m.visible=n>0; if(n){ parziale(m.instanceMatrix,n*16); parziale(m.instanceColor,n*3); var A=m.geometry.attributes; parziale(A.fase,n*A.fase.itemSize); parziale(A.moto,n*A.moto.itemSize); parziale(A.tipo,n*A.tipo.itemSize); } });      // solo le istanze contate (sesto giro, si veda parziale)
}
function F_(){ return RM.vitaFattore==null?1:RM.vitaFattore; }
function muoviRonde(dt,nt){
  var on=annoOra>=235 && annoOra<330 && nt>.35, g, m, j, o, nU=0, nA=0, nL=0, kL=Math.min(1,(nt-.35)/.25);
  for(g=0;g<2;g++){ var R=RONDE[g];
    for(m=0;m<7;m++){ j=I_R+g*7+m; o=j*3;
      if(!on || !R){ pos[o+1]=-60; continue; }
      if(m===0){ if(R.ferma>0) R.ferma-=dt; else { R.t+=R.vel*dt; if(R.t>R.fine||R.t<0){ R.vel=-R.vel; R.t=Math.max(0,Math.min(R.fine,R.t)); R.ferma=6; } } }      // in fondo e alla caserma si fermano qualche secondo e tornano indietro
      var v=R.v, dir=R.vel>0?1:-1, t=R.t-dir*(m?(.35+Math.floor((m-1)/2)*.32):0), lat=m?((m%2)?-.07:.07):0;      // il primo davanti, gli altri a due a due dietro (in punti della via: uno ogni 20 m circa)
      sulla(v,t,lat,o,j); if(occupato(pos[o],pos[o+2])){ pos[o+1]=-60; continue; }
      var ang=Math.atan2(tX*dir,tZ*dir), sx=Math.sin(ang), sz=Math.cos(ang);
      if(m===0){ R.dove=[pos[o],pos[o+2]]; pLume[nL*3]=pos[o]+sz*.035+sx*.02; pLume[nL*3+1]=piedi[j]+.155; pLume[nL*3+2]=pos[o+2]-sx*.035+sz*.02;      // il lume, nella mano destra all'altezza della spalla; R.dove: dov'è il primo, per le prove (RM.vitaProve.ronde)
        oR.position.set(pos[o],piedi[j]+.035,pos[o+2]); oR.rotation.set(0,0,0); oR.scale.setScalar(1); oR.updateMatrix(); aloneR.setMatrixAt(nL,oR.matrix); nL++; }
      else if(m<5){ var uc=m<3, M=uc?attrR[0]:attrR[1], c=uc?nU++:nA++;      // il secondo e il terzo l'uncino, il quarto e il quinto l'ascia
        oR.position.set(pos[o]+sz*.026,piedi[j],pos[o+2]-sx*.026); oR.rotation.set(0,ang,0); oR.updateMatrix(); M.setMatrixAt(c,oR.matrix); }
    } }
  attrR[0].count=nU; attrR[1].count=nA; attrR.forEach(function(M){ M.visible=M.count>0; if(M.count) M.instanceMatrix.needsUpdate=true; });
  gLume.setDrawRange(0,nL); gLume.attributes.position.needsUpdate=true; aloneR.count=nL; if(nL) aloneR.instanceMatrix.needsUpdate=true;
  var tr=MENO_MOTO?1:.85+.15*Math.sin(tempo*11.3)*Math.sin(tempo*4.7+1.3);      // la fiamma trema un poco; ferma con «meno animazioni»
  lumiR.forEach(function(L){ L.visible=nL>0; L.material.opacity=kL*tr; }); aloneR.visible=nL>0; aloneR.material.opacity=.7*kL*tr;
}

/* ---------- fumo ----------
   Rifatto il 27 novembre 2026 (l'utente: «per far sembrare più viva la città quando era abitata… fai apparire del fumo da qualche parte»: quello di prima, 130 nuvolette chiare
   di quattro punti grandi come un isolato, sulla città chiara non si vedeva). Ora colonne sottili, grigio chiare, che salgono diritte e poi si piegano tutte dalla stessa parte,
   come col vento: da vicino un filo, dalla vista d'insieme una riga di pochi punti. Chi fuma:
   - le case abitate, circa una su diciassette, di più nelle insulae alte e nella Suburra (fuochi per cucinare: «l'odore delle cucine» che attira la plebe, Ammiano XIV 6, 25-26
     e XXVIII 4, 34, in src/testi/vita-roma-fonti.md); quante e quali è uno schema, detto nel piede della pagina;
   - i forni del pane: i cataloghi del IV secolo danno i pistrina di ogni regione (da 15 a 25: src/testi/regioni-fonti.md, «Densità dei quartieri»); qui una colonna più densa
     ogni quattro pistrina, su un caseggiato abitato della regione scelto dal posto; dove stessero davvero non si sa;
   - le terme finché sono in uso (il modello le chiude nel 537, quando i Goti tagliano gli acquedotti, Procopio V 19): pennacchi più larghi; che fumassero è uno schema;
   - le calcare accanto ai monumenti usati come cava (Codice Teodosiano XIV 6, 1, e le vite del Liber Pontificalis: già prima).
   Tutto segue gli abitanti: una casa lasciata non fuma più, e con la popolazione che cala nell'800 restano pochi fili attorno ai nuclei vivi. Il vento ha una sola direzione
   (schema). Con «meno animazioni» le colonne restano ferme; al gradino «bassa» ne resta la metà (RM.QUALITA.fumo); col regolatore al terzo grado spariscono come prima.
   Perché prima non si vedeva: dal 26 novembre il porto dell'Emporio (più sotto) dichiara un altro NF, il numero delle navi ferme (8), e il ciclo del fumo, che legge NF
   a ogni fotogramma, muoveva solo otto punti su più di settecento. Ora il conto del fumo si chiama NFU. */
RM.QUALITA.fumo=[.5,1,1,1,.7];      // la parte delle colonne delle case e dei forni che si accende, per gradino (bassa, media, alta, massima, telefono)
var FONTI=[], i, rndF=RM.casuale(9127), VENTO=[.92,.38];
var PISTRINA=[20,15,16,15,15,16,15,20,20,20,16,25,20,24];      // regioni I-XIV, Notitia
/* calcare: accanto a ogni monumento usato come cava, un forno da calce che fuma finché dura lo smontaggio */
var forni=[];
(RM.MONUMENTI||[]).forEach(function(m){
  var st=D.MONUMENTI[m.id]||[]; if(m.x==null || !st.some(function(q){ return q[1]==='cava'; })) return;
  var x=m.x+(m.raggio||6)*.95+1.6, z=m.z+(m.raggio||6)*.45, f={x:x,y:RM.h(x,z)+.9,z:z,id:m.id,stato:'cava',n:18,alto:17,larg:1.2,forza:1.3,vivo:0,q:0};
  FONTI.push(f); forni.push(f);
});
for(i=0;i<130+130*4+3*16+forni.length*8;i++) rnd();      // i numeri a caso che il fumo di prima prendeva da rnd: consumati lo stesso, così le barche (che vengono dopo) restano dove erano
isolati.forEach(function(b){ var g=RM.grana(Math.round(b.x*3.7)+101,Math.round(b.z*2.9)-77), p=.06*(b.tipo<3?.5+.5*b.alt:b.tipo===3?.7:.55)*(1+1.4*(b.sub||0));      // case: fuochi di cucina
  if(g<p) FONTI.push({x:b.x,y:b.y+b.alt,z:b.z,b:b,n:22,alto:7+4*(g/p),larg:.3+.08*(g/p),forza:.8,q:g/p}); });      // 27 novembre 2026: un filo largo tre metri alla bocca, non più sbuffi di tredici-sedici metri
PISTRINA.forEach(function(np,r){ var c=isolati.filter(function(b){ return b.reg===r && b.tipo<3; }).map(function(b){ return [RM.grana(Math.round(b.x*5.9)-31,Math.round(b.z*4.3)+53),b]; }).sort(function(a,b){ return a[0]-b[0]; }), quanti=Math.round(np/4);
  for(var k=0;k<Math.min(c.length,quanti);k++){ var b=c[k][1]; FONTI.push({x:b.x+.8,y:b.y+b.alt,z:b.z-.6,b:b,n:16,alto:11,larg:.42,forza:.85,q:k/quanti,forno:1}); } });      // forni del pane
['caracalla','diocleziano','traiano','tito','termecostantino','termenerone','termeagrippa'].forEach(function(id,k){ var m=(RM.MONUMENTI||[]).filter(function(o){ return o.id===id; })[0]; if(!m||m.x==null) return;
  var gr=k<3?1:.7; FONTI.push({x:m.x+1.5,y:RM.h(m.x,m.z)+3.5*gr,z:m.z+1.5,id:id,n:Math.round(26*gr),alto:24*gr,larg:1.5*gr,forza:1.2,q:0}); });      // terme: le tre grandi più delle altre
/* I nuclei di case altomedievali (27 novembre 2026; l'utente ha chiesto il fumo leggibile dall'alto): ogni nucleo ha una ventina di casette attorno al cortile (b.villa in js/citta.js),
   ma il fumo partiva solo dal lotto, una volta su diciassette, come per le insulae. Con la stessa regola di una casa su diciassette un nucleo acceso di almeno otto case fa un filo,
   dal tetto della quinta casa; si accende con le case e si spegne con loro. Messi in coda, così le fasi del fumo di prima restano le stesse. */
isolati.forEach(function(b){ if(!b.villa || b.villa.length<8) return; var o=b.villa[4];
  FONTI.push({x:o.x,y:o.y+o.h+.15,z:o.z,b:b,nucleo:1,n:14,alto:6,larg:.3,forza:.68,q:RM.grana(Math.round(b.x*4.1)-13,Math.round(b.z*3.3)+29)}); });
var geoForno=new RM.Costruttore().cilindro(.6,.55,0,0,0,P.tufo,.48,10).cupola(.48,0,.55,0,P.mattone,.8).scatola(.55,.26,.36,1,0,.25,P.marmo).scatola(.42,.22,.3,1.05,.26,.2,P.marmo).scatola(.5,.2,.3,.85,0,-.5,P.marmo,.6).geometria();
var magliaForni=new THREE.InstancedMesh(geoForno,RM.matPietra(),Math.max(1,forni.length)), dF=new THREE.Object3D();
magliaForni.castShadow=true; magliaForni.frustumCulled=false; magliaForni.userData.gruppo='vita'; RM.scene.add(magliaForni);
function mostraForni(){ for(var k=0;k<Math.max(1,forni.length);k++){ var f=forni[k]; dF.position.set(f?f.x:0,f?f.y-1:-80,f?f.z:0); dF.scale.setScalar(f&&f.vivo>.05?1.6:0); dF.updateMatrix(); magliaForni.setMatrixAt(k,dF.matrix); } magliaForni.instanceMatrix.needsUpdate=true; }
var NFU=FONTI.reduce(function(a,f){ return a+f.n; },0), fPos=new Float32Array(NFU*3), fFase=new Float32Array(NFU), fDi=[];
FONTI.forEach(function(f){ for(var k=0;k<f.n;k++){ fFase[fDi.length]=(k+.5*rndF())/f.n; fDi.push(f); } if(f.vivo==null) f.vivo=1; });      // le fasi distribuite lungo la colonna: un filo continuo, non sbuffi
var gFumo=new THREE.BufferGeometry(), fAlfa=new Float32Array(NFU), fMis=new Float32Array(NFU);
gFumo.setAttribute('position',new THREE.BufferAttribute(fPos,3)); gFumo.setAttribute('alfa',new THREE.BufferAttribute(fAlfa,1)); gFumo.setAttribute('mis',new THREE.BufferAttribute(fMis,1));
var texFumo=RM.tela(64,64,function(g){ var q=g.createRadialGradient(32,32,0,32,32,32); q.addColorStop(0,'rgba(255,255,255,1)'); q.addColorStop(.55,'rgba(255,255,255,.62)'); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(0,0,64,64); },false);
var NL=String.fromCharCode(10);
var matFumo=new THREE.ShaderMaterial({
  transparent:true, depthWrite:false,
  uniforms:{ map:{value:texFumo}, colore:{value:RM.col(0xd2cec7)}, lato:{value:1} },
  vertexShader:['attribute float alfa; attribute float mis; varying float vA; uniform float lato;','void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); float px=mis*projectionMatrix[1][1]*lato/-mv.z;',
    '  vA=alfa*clamp(px/2.0,0.0,1.0); gl_PointSize=clamp(px,2.0,90.0); gl_Position=projectionMatrix*mv; }'].join(NL),      // la grandezza vera in unità della scena; sotto i due pixel il punto resta di due pixel e sbiadisce
  fragmentShader:['uniform sampler2D map; uniform vec3 colore; varying float vA;','void main(){ gl_FragColor=vec4(colore,texture2D(map,gl_PointCoord).a*vA);','#include <encodings_fragment>','}'].join(NL)
});
var fumo=new THREE.Points(gFumo,matFumo); fumo.frustumCulled=false; fumo.userData.gruppo='vita'; RM.scene.add(fumo);
var fumoG=RM.col(0xaeb7c2), fumoN=RM.col(0x30343f);      // 27 novembre 2026: grigio-azzurro, il fumo di legna sottile (prima bianco sporco); colonne più sottili e più trasparenti, che si allargano e svaniscono salendo: fili di cucina, non comignoli di fabbrica. Terme e calcare restano più larghe e più dense
function vivaF(f,qf){ return f.b?(f.b.a0>.5&&f.q<qf&&(!f.nucleo||f.b.qv0>=8)?1:0):f.vivo; }      // fuma? le case finché sono abitate; i nuclei con almeno otto case accese
/* Veduta dei secoli tardi (RM.vedutaU in js/base.js; come la corrente del fiume, che da lontano va più svelta): oltre 1,2 km dall'occhio, e pieno oltre 4, il filo si fa un poco più
   alto, largo e denso, e grigio più chiaro contro il bruno dei ruderi, perché dalla vista d'insieme si veda dove si vive. Da vicino e fino al 520 restano i fili sottili di prima.
   Lo stesso giorno l'utente: «Riduci leggermente il fumo della Roma alto medioevale»: larghezza da lontano da 2,8 a 2,25 volte, altezza da 1,7 a 1,55, meno denso e meno bianco, fili dei nuclei un poco più tenui. */
var fumoV=RM.col(0xd9dde0), occhioF=new THREE.Vector3();
function muoviFumo(){
  matFumo.uniforms.lato.value=RM.renderer.domElement.height*.5;
  var vU=RM.vedutaU?RM.vedutaU.value:0, k, f;
  matFumo.uniforms.colore.value.copy(fumoG);
  if(vU>0){ occhioF.copy(RM.camera.position); matFumo.uniforms.colore.value.lerp(fumoV,.42*vU*RM.sfuma(120,400,occhioF.distanceTo(RM.controlli.target))); }
  matFumo.uniforms.colore.value.lerp(fumoN,RM.notte);
  for(k=0;k<FONTI.length;k++){ f=FONTI[k]; f.lon=vU>0?vU*RM.sfuma(120,400,Math.hypot(f.x-occhioF.x,f.y-occhioF.y,f.z-occhioF.z)):0; }
  var tF=MENO_MOTO?30:tempo, qf=RM.QUALITA.fumo[RM.q]||1;
  for(k=0;k<NFU;k++){
    f=fDi[k]; var o=k*3, v=vivaF(f,qf);
    if(v<=.01){ if(fAlfa[k]!==0){ fAlfa[k]=0; fPos[o+1]=-1e4; } continue; }
    var L=f.lon*Math.min(1,.4/f.larg), al=f.alto*(1+.55*L), p=(fFase[k]+tF*.05*(1+(k%5)*.08))%1, cu=al*.8*Math.pow(p,1.7), on=Math.sin(tF*.5+k*1.7)*.12*p*f.larg*3;      // sale diritta, poi il vento la piega; un poco di ondeggiare. L: i pennacchi già larghi (calcare, terme) crescono poco, sono i fili sottili delle case che si perdevano
    fPos[o]=f.x+VENTO[0]*cu+VENTO[1]*on; fPos[o+1]=f.y+Math.pow(p,1.35)*al; fPos[o+2]=f.z+VENTO[1]*cu-VENTO[0]*on;      // più fitto in basso, dove il filo è sottile
    fMis[k]=f.larg*(.9+3.2*p)*(1+1.25*L);      // si allarga salendo e si disperde (alla bocca i punti si toccano: un filo, non una fila di perle)
    fAlfa[k]=Math.min(.5+.04*L,Math.sin(Math.PI*Math.sqrt(p))*(1-.7*p)*f.forza*v*(1+.25*L));
  }
  gFumo.attributes.position.needsUpdate=true; gFumo.attributes.alfa.needsUpdate=true; gFumo.attributes.mis.needsUpdate=true;
}
RM.fumoConta=function(){ var r={fonti:FONTI.length, punti:NFU, case:0, forni:0, terme:0, calcare:0}; FONTI.forEach(function(f){ var v=vivaF(f,RM.QUALITA.fumo[RM.q]||1); if(v<=.01) return; if(f.forno) r.forni++; else if(f.nucleo) r.nuclei=(r.nuclei||0)+1; else if(f.b) r.case++; else if(f.stato==='cava') r.calcare++; else r.terme++; }); return r; };      // quante colonne fumano ora (per le prove e per il rapporto)

/* ---------- barche ----------
   Seguono il filo della corrente a velocità costante, tenendo la destra, e passano sotto i ponti fra una pila e l'altra; in fondo al tratto virano.
   Due tratti navigabili: a monte, da ponte Milvio a ponte Aurelio; a valle, da ponte Emilio verso l'Emporio e San Paolo. Fra i due ci sono l'isola e, dal 537, i mulini. */
/* Rifatte il 26 novembre 2026 (l'utente: «La qualità delle barche deve essere diversa e migliorata molto»). Fonti lette e tabella «Per chi disegna» in src/testi/vita-roma-fonti.md,
   «Le barche sul Tevere». Scritto: le chiatte (naves codicariae) fra Porto e Roma non usano né vele né remi e controcorrente sono tirate da buoi con corde legate al collo (Procopio V 26, 10-12);
   un solo albero per la corda (sintesi di ostia-antica.org dai rilievi); il timoniere a poppa e i sacchi di grano (affresco della Isis Geminiana, Musei Vaticani); barche piccole a remi
   (Procopio VI 7, 7-9, nel 538). SCHEMA: misure, forma di prua e poppa, fasciame, colori, posizione dell'albero, due buoi, la riva dei buoi, le velocità, la discesa con la corrente,
   che le barche piccole girassero anche in tempi normali. Tre corse: le chiatte tirate dai buoi dal fondo del tratto di valle fino all'Emporio e quelle che scendono con la corrente
   (a valle); a monte, fra ponte Milvio e ponte Aurelio, chiatte che scendono e barche piccole a remi. A fine corsa una barca resta ormeggiata e ricomincia solo fuori dall'inquadratura.
   Sotto i ponti la corsia passa per il centro di un'arcata (RM.ponti in js/mura.js). In metri, poi in unità (×0,1): prua verso +x. */
RM.QUALITA.barche=[0,6,10,16,3];      // quante barche vicine hanno uomini veri (bassa, media, alta, massima, telefono); le altre hanno sagome
var NB=16, quotaBarche=1, d=new THREE.Object3D(), MB=.1;
function gM(g){ return g.scale(MB,MB,MB); }      // da metri a unità
function scatM(w,h,dd,x,y,z){ return gM(new THREE.BoxGeometry(w,h,dd).translate(x,y,z)); }
/* lo scafo a guscio: sezioni lungo x (poppa -L/2, prua +L/2), ognuna dalla chiglia all'orlo; prua e poppa rialzate, fondo che risale ai capi, fasciame a corsi di tavole
   (un colore per corso, la commessura più scura). Dentro, il guscio interno più scuro e il pagliolo appena sopra il pelo dell'acqua (y=0) */
function scafoGeo(L,W,Hm,chi,alzaPr,alzaPp,NS,corsi,legno){
  var pos=[], col=[], idx=[], fil=[], k, j, S=[];
  for(j=0;j<corsi;j++){ S.push(j/corsi+.015); S.push((j+1)/corsi-.015); }
  S[0]=0; S[S.length-1]=1;
  function sez(t){ var a=Math.abs(t), pr=t>0, w=W/2*Math.sqrt(Math.max(.012,1-Math.pow(a,pr?2.2:3.2))), ysh=Hm+(pr?alzaPr:alzaPp)*Math.pow(sm(.45,1,a),1.6), yk=chi+(-chi-.05)*Math.pow(sm(.6,1,a),1.8); return [w,ysh,yk]; }
  function punto(t,s,dentro){ var q=sez(t), z=q[0]*Math.pow(1-Math.pow(1-s,3),.55), y=q[2]+(q[1]-q[2])*s; if(dentro){ z=Math.max(0,z-.07); y+=dentro*.06; } return [t*L/2,y,z]; }
  [1,-1].forEach(function(lato){ [0,1].forEach(function(dentro){
    var base=pos.length/3;
    for(k=0;k<=NS;k++){ var t=k/NS*2-1; t=Math.sign(t)*Math.pow(Math.abs(t),.8);
      for(j=0;j<S.length;j++){ var p=punto(t,S[j],dentro), corso=Math.floor(j/2), c=legno.clone().multiplyScalar(dentro?.62:(.86+.14*((corso*7)%3)/2)*(j%2===0&&j>0?.8:1)*(corso===corsi-1?.78:1));
        pos.push(p[0],p[1],p[2]*lato); col.push(c.r,c.g,c.b); } }
    var n=S.length;
    for(k=0;k<NS;k++) for(j=0;j<n-1;j++){ var a=base+k*n+j, b=a+n, c2=a+1, e=b+1, fuori=(lato>0)!==(dentro===1);
      if(fuori){ idx.push(a,b,c2, c2,b,e); } else { idx.push(a,c2,b, c2,e,b); } }
  }); });
  /* l'orlo: dal guscio esterno a quello interno, sopra */
  [1,-1].forEach(function(lato){ var base=pos.length/3;
    for(k=0;k<=NS;k++){ var t=k/NS*2-1; t=Math.sign(t)*Math.pow(Math.abs(t),.8); var a=punto(t,1,0), b=punto(t,1,1), c=legno.clone().multiplyScalar(.7);
      pos.push(a[0],a[1]+.03,a[2]*lato, b[0],b[1]+.03,b[2]*lato); col.push(c.r,c.g,c.b,c.r,c.g,c.b); }
    for(k=0;k<NS;k++){ var q=base+k*2; if(lato>0) idx.push(q,q+1,q+2, q+1,q+3,q+2); else idx.push(q,q+2,q+1, q+1,q+2,q+3); } });
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
  return {g:gM(g), sez:sez}; }
var LEGNO_B=RM.col(0x7a6148);      // legno non dipinto: SCHEMA (nessuna fonte letta dà il colore)
function pagliolo(B,sc,L,y,col){ for(var k=0;k<10;k++){ var t0=-.9+k*.18, tm=t0+.09, q=sc.sez(tm), w=Math.max(.05,q[0]*Math.pow(1-Math.pow(1-Math.max(0,(y-q[2])/(q[1]-q[2])),3),.55)-.1); B.geo(scatM(.18*L/2+.02,.05,2*w,tm*L/2,y,0),col); } }      // a tratti, largo quanto lo scafo a quella quota
/* sagoma di un uomo per le barche lontane: un fuso e una testa (una ventina di triangoli) */
function sagoma(B,x,y,z,col){ B.geo(gM(new THREE.CylinderGeometry(.16,.22,1.4,5).translate(x,y+.7,z)),col); B.geo(gM(new THREE.SphereGeometry(.12,5,3).translate(x,y+1.55,z)),PELLE[1]); }
function uomoB(B,x,y,z,ry,nome,k,col,vere){ if(vere) B.dentro(x*MB,y*MB,z*MB,ry,function(B){ B.geo(figuraTinta(nome,k,col),col); }); else sagoma(B,x,y,z,col); }
/* la chiatta (navis codicaria): 18 x 4,5 m, l'albero della corda a un terzo dalla prua, il remo-timone a poppa, sacchi nella stiva, due uomini (timoniere a poppa, uno a prua) */
var LC=18, WC=4.5, ALB=LC/6, HALB=6.5;
var MARMI_B=[[-4.6,.3,2.8,1.1,1.7,.94],[-1.4,-.5,2.3,.9,1.5,.88],[1.7,.4,3,1.2,1.8,1],[-1.6,1.1,1.5,.7,1,.91]];      // i blocchi di una chiatta da marmo: [x, z, lungo, alto, largo, tinta], in metri (SCHEMA)
function geoChiatta(vere,ep,carico){ var B=new RM.Costruttore(), sc=scafoGeo(LC,WC,.7,-.9,1.3,1.0,vere?22:10,vere?5:2,LEGNO_B), q;      // carico: niente = in viaggio (sacchi e due uomini); 'sacchi', 'marmo', 'vuota' = ormeggiata all'Emporio, senza uomini
  B.geo(sc.g,P.tronco);
  pagliolo(B,sc,LC,.1,LEGNO_B.clone().multiplyScalar(.7));      // il pagliolo, sopra il pelo dell'acqua
  [-.47,.47].forEach(function(f){ q=sc.sez(f); B.geo(scatM(.32,.1,q[0]*1.86,f*LC/2,q[1]-.18,0),LEGNO_B.clone().multiplyScalar(.85)); });      // due banchi
  q=sc.sez(-.86); B.geo(scatM(1.6,.08,q[0]*1.9,-.86*LC/2,q[1]-.12,0),LEGNO_B.clone().multiplyScalar(.8));      // il ponticello del timoniere
  B.geo(gM(new THREE.CylinderGeometry(.08,.13,HALB,vere?7:4).translate(ALB,.1+HALB/2,0)),LEGNO_B.clone().multiplyScalar(.9));      // l'albero della corda, senza vela (Procopio V 26, 11)
  if(vere) [.25,.5,.75].forEach(function(f){ B.geo(scatM(.06,.06,.42,ALB,.1+HALB*f,0),LEGNO_B); });      // le piccole sporgenze dell'albero (ostia-antica.org)
  B.geo(gM(tratto([-LC/2+1.1,1.6,WC/2-.3],[-LC/2-1.6,-.5,WC/2+.35],.07,.06,vere?6:4)),LEGNO_B.clone().multiplyScalar(.8));      // il remo-timone, sul fianco destro a poppa
  B.geo(gM(new THREE.BoxGeometry(.08,1.1,.45).translate(0,-.55,0).rotateZ(.9).translate(-LC/2-1.5,-.2,WC/2+.33)),LEGNO_B.clone().multiplyScalar(.75));      // la pala
  var sacchi=[], i, j; if(!carico || carico==='sacchi') for(i=0;i<(vere?7:4);i++) for(j=0;j<3;j++) sacchi.push([-5+i*(vere?1.45:2.5),(j-1)*1.05]);
  if(carico==='marmo') MARMI_B.forEach(function(m){ B.geo(scatM(m[2],m[3],m[4],m[0],.1+m[3]/2,m[1]),P.marmo.clone().multiplyScalar(m[5])); });      // blocchi squadrati nella stiva (Lanciani 1897, p. 531: il marmo passava dalle navi a chiatte più leggere che risalivano il fiume); numero e misure: SCHEMA
  sacchi.forEach(function(s,n){ var h=((n*37)%5)/5; B.geo(gM(new THREE.SphereGeometry(1,vere?8:5,vere?5:3).scale(.62,.36,.5).rotateY(h*.6).translate(s[0],.45,s[1])),C_SACCO.clone().multiplyScalar(.85+.15*h));
    if(vere && n%3===1) B.geo(gM(new THREE.SphereGeometry(1,8,5).scale(.6,.34,.48).rotateY(-h).translate(s[0]+.3,1.05,s[1]*.6)),C_SACCO.clone().multiplyScalar(.9)); });      // sacchi di grano (Isis Geminiana)
  if(carico) return B.geometria();      // ormeggiata: nessun uomo a bordo (nessun testo letto descrive lo scarico all'Emporio)
  var nomeU=['tunica3','tunica4','tunica7'][ep], tinte=VESTI[nomeU].tinte;
  q=sc.sez(-.86); uomoB(B,-.86*LC/2,q[1]-.08,.3,Math.PI/2,nomeU,1,tinte[1%tinte.length],vere);      // il timoniere, rivolto a prua
  uomoB(B,ALB+2.2,.13,-.6,Math.PI*.35,nomeU,2,tinte[2%tinte.length],vere);      // un uomo a prua
  return B.geometria(); }
/* la barca piccola: 8 x 2 m, un rematore al centro (i remi sono a parte, si muovono), il timoniere a poppa */
var LP=8, WP=2;
function geoPiccola(vere,ep){ var B=new RM.Costruttore(), sc=scafoGeo(LP,WP,.45,-.5,.6,.45,vere?16:8,vere?4:2,LEGNO_B.clone().multiplyScalar(.92)), q;
  B.geo(sc.g,P.tronco); pagliolo(B,sc,LP,.06,LEGNO_B.clone().multiplyScalar(.7));
  [-.55,0,.45].forEach(function(f){ q=sc.sez(f); B.geo(scatM(.26,.07,q[0]*1.84,f*LP/2,q[1]-.14,0),LEGNO_B.clone().multiplyScalar(.85)); });      // i banchi (quello di mezzo è del rematore)
  B.geo(gM(tratto([-LP/2+.5,.9,WP/2-.15],[-LP/2-1,-.4,WP/2+.2],.045,.04,vere?5:4)),LEGNO_B.clone().multiplyScalar(.8));      // il remo-timone
  var nomeU=['tunica3','tunica4','tunica7'][ep], tinte=VESTI[nomeU].tinte;
  if(vere) B.dentro(0,-.054,0,-Math.PI/2,function(B){ B.geo(figuraTinta(4,3,tinte[0]),tinte[0]); });      // il rematore, seduto sul banco di mezzo (piano a 0,31 m: le anche della figura seduta stanno a 0,86), rivolto a poppa; gli scalmi gli stanno davanti
  else sagoma(B,0,-.25,0,tinte[0]);
  q=sc.sez(-.8); uomoB(B,-.8*LP/2,q[1]-.1,0,Math.PI/2,nomeU,0,tinte[3%tinte.length],vere);
  B.geo(gM(new THREE.CylinderGeometry(.18,.16,.5,6).translate(2,.32,0)),C_TERRA);      // un'anfora a bordo (SCHEMA)
  return B.geometria(); }
var matBarche=RM.matPietra(), EPB=-1, MAGLIE={};
function magliaB(chiave,fa){ var m=new THREE.InstancedMesh(new THREE.BufferGeometry(),matBarche,NB); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.count=0; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='vita'; m.userData.fa=fa; RM.scene.add(m); MAGLIE[chiave]=m; return m; }
var mCV=magliaB('cv',function(ep){ return geoChiatta(true,ep); }), mCL=magliaB('cl',function(ep){ return geoChiatta(false,ep); }), mPV=magliaB('pv',function(ep){ return geoPiccola(true,ep); }), mPL=magliaB('pl',function(ep){ return geoPiccola(false,ep); });
var GEOB={};      // le geometrie delle barche di ogni epoca, fatte una volta sola e tenute (27 novembre 2026, sera): prima si rifacevano a ogni passaggio di epoca, anche nel viaggio fra due tappe (circa 40 millesimi a passaggio); le tre epoche sono le stesse di epoca()
function geoBarca(k,ep){ var c=k+ep; return GEOB[c]||(GEOB[c]=MAGLIE[k].userData.fa(ep)); }
function epocaBarche(anno){ var ep=epoca(anno); if(ep===EPB) return; EPB=ep; for(var k in MAGLIE) MAGLIE[k].geometry=geoBarca(k,ep); if(typeof epocaBovaro==='function') epocaBovaro(ep); }
/* le geometrie delle altre epoche si preparano nei momenti morti dopo l'apertura, una per volta, così il primo viaggio oltre il 330 o il 600 non le costruisce lì */
(function(){ var coda=[];
  var chiedi=window.requestIdleCallback||function(f){ return setTimeout(function(){ f({timeRemaining:function(){ return 8; }}); },200); };
  function passo(sc){ while(coda.length && sc.timeRemaining()>6){ var q=coda.shift(); if(q[0]==='bovaro'){ if(typeof geoBovaroEp==='function') geoBovaroEp(q[1]); } else geoBarca(q[0],q[1]); } if(coda.length) chiedi(passo); }
  setTimeout(function(){ [0,1,2].forEach(function(ep){ for(var k in MAGLIE) coda.push([k,ep]); coda.push(['bovaro',ep]); }); chiedi(passo); },4000); })();      // qui MAGLIE ha già anche la sagoma lontana del bovaro
/* i remi della barca piccola: due per barca, a istanze, che girano attorno allo scalmo */
var geoRemo=(function(){ var B=new RM.Costruttore(); B.geo(gM(new THREE.CylinderGeometry(.035,.035,3.75,5).rotateX(Math.PI/2).translate(0,0,1.175)),LEGNO_B); B.geo(scatM(.05,.18,.75,0,0,2.9),LEGNO_B.clone().multiplyScalar(.85)); return B.geometria(); })();      // dallo scalmo: 0,7 m di manico verso le mani del rematore, la pala a 2,9 m
var mRemi=new THREE.InstancedMesh(geoRemo,new THREE.MeshLambertMaterial({vertexColors:true, side:THREE.DoubleSide}),NB*2); mRemi.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mRemi.count=0; mRemi.castShadow=true; mRemi.frustumCulled=false; mRemi.userData.gruppo='vita'; RM.scene.add(mRemi);
/* i buoi del traino: una coppia col giogo (Procopio: le corde legate al collo); le zampe camminano nello shader degli animali */
function geoCoppia(fino){ var B=new Pz(); bue(B,-.5,0,{fino:fino}); bue(B,.5,0,{fino:fino,col:C_BUE2,fase:.5}); giogo(B,[-.5,.5],.84,1.5); return B.geometria(NB); }      // la corda si lega al centro del giogo (0; 1,46; 0,84 m)
var geoBuoi=geoCoppia(true), geoBuoiL=geoCoppia(false), matBuoi=matAnimali();      // da vicino e da lontano (e al gradino «bassa»)
function magliaBuoi(g){ var m=new THREE.InstancedMesh(g,matBuoi,NB); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NB*3).fill(1),3); m.count=0; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='vita'; RM.scene.add(m); return m; }
var mBuoi=magliaBuoi(geoBuoi), mBuoiL=magliaBuoi(geoBuoiL);
/* Il bovaro (26 novembre 2026, decisione dell'utente: «Vai con bovaro»). IPOTESI: Procopio (Guerra gotica I 26, 10-12) racconta solo che le corde si legano al collo dei buoi,
   non dice chi li guida; un uomo a piedi accanto alla coppia è una scelta del modello, detta nel piede della pagina. Cammina dal lato della terra, un poco avanti alla spalla
   del bue, al passo dei buoi; in mano un bastone lungo (forma e misura: SCHEMA). Veste della gente comune dell'epoca, come i barcaioli. Persona vera da vicino (le gambe
   camminano nello shader dei passanti), sagoma da lontano e al gradino «bassa»; non c'è quando non ci sono i buoi (piene). */
var NOME_BOV=['tunica3','tunica4','tunica7'];
function geoBovaro(ep){ var g=corpo(NOME_BOV[ep],2), B=new Parti();      // la figura comune, con il bastone che segue il braccio destro (oscilla -2)
  B.metti(tratto([-.23,.06,.36],[-.2,1.62,-.1],.016,.013,4),LEGNO,-2,true);
  var A=g.attributes, n0=A.position.count, n1=B.p.length/3, g2=new THREE.BufferGeometry();
  function unisci(a,b,k){ var r=new Float32Array((n0+n1)*k); r.set(a); r.set(b,n0*k); return new THREE.Float32BufferAttribute(r,k); }
  g2.setAttribute('position',unisci(A.position.array,B.p,3)); g2.setAttribute('normal',unisci(A.normal.array,B.n,3)); g2.setAttribute('color',unisci(A.color.array,B.c,3));
  g2.setAttribute('oscilla',unisci(A.oscilla.array,B.o,1)); g2.setAttribute('fisso',unisci(A.fisso.array,B.f,1)); g2.setAttribute('ombra',unisci(A.ombra.array,B.s,1)); cuoci(g2);
  g2.setAttribute('fase',new THREE.InstancedBufferAttribute(new Float32Array(NB),1)); g2.setAttribute('moto',new THREE.InstancedBufferAttribute(new Float32Array(NB),1)); g2.setAttribute('posa',new THREE.InstancedBufferAttribute(new Float32Array(NB*3),3));
  return g2; }
var mBov=new THREE.InstancedMesh(new THREE.BufferGeometry(),matF||matFigure(),NB); mBov.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mBov.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NB*3).fill(1),3);
mBov.count=0; mBov.visible=false; mBov.frustumCulled=false; mBov.castShadow=true; mBov.receiveShadow=true; mBov.userData.gruppo='vita'; RM.scene.add(mBov);
var mBovL=magliaB('bov',function(ep){ var B=new RM.Costruttore(), ti=VESTI[NOME_BOV[ep]].tinte; sagoma(B,0,0,0,ti[0]); B.geo(gM(tratto([-.23,.06,.36],[-.2,1.62,-.1],.03,.03,3)),LEGNO); return B.geometria(); });      // da lontano: la sagoma col bastone
var GEOBOV={}; function geoBovaroEp(ep){ return GEOBOV[ep]||(GEOBOV[ep]=geoBovaro(ep)); }      // come le barche: una geometria per epoca, tenuta (27 novembre 2026, sera)
function epocaBovaro(ep){ mBov.geometry=geoBovaroEp(ep); var c=VESTI[NOME_BOV[ep]].tinte[0]; for(var i=0;i<NB;i++) mBov.instanceColor.setXYZ(i,c.r,c.g,c.b); mBov.instanceColor.needsUpdate=true; }
var mCorde=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0,.5),new THREE.MeshLambertMaterial({color:0x8d7a5c}),NB); mCorde.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mCorde.count=0; mCorde.frustumCulled=false; mCorde.userData.gruppo='vita'; RM.scene.add(mCorde);
/* la scia: un velo a istanze con una trama a V, solo dietro chi si muove rispetto all'acqua (tirate o a remi; chi scende con la corrente non ne lascia) */
var texScia=RM.tela(64,128,function(g){ g.clearRect(0,0,64,128); var y, k, j;
  for(y=0;y<128;y++){ var a=.6*Math.pow(1-y/128,1.4), w=3+y*.2;      // due bordi a V che si allargano e sbiadiscono, e la schiuma in mezzo, a chiazze
    for(j=-1;j<=1;j+=2){ var gr=g.createLinearGradient(32+j*w-3,0,32+j*w+3,0); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(.5,'rgba(255,255,255,'+a.toFixed(3)+')'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(32+j*w-3,y,6,1); }
    for(k=0;k<3;k++){ var x=32+(Math.sin(y*1.7+k*2.1)*.5)*w*.9; g.fillStyle='rgba(255,255,255,'+(a*.28*(.5+.5*Math.sin(y*.9+k))).toFixed(3)+')'; g.fillRect(x-1.5,y,3,1); } } },false);
var matScia=new THREE.MeshBasicMaterial({map:texScia,transparent:true,depthWrite:false,opacity:.85,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
var mScie=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).rotateY(-Math.PI/2).translate(-.5,0,0),matScia,NB); mScie.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mScie.count=0; mScie.frustumCulled=false; mScie.renderOrder=2; mScie.userData.gruppo='vita'; RM.scene.add(mScie);
var fiume=RM.curvaFiume; fiume.arcLengthDivisions=1200; fiume.updateArcLengths();
var lungoFiume=fiume.getLength();
function uVicino(x,z){ var m=1e9, um=0, k, q, dd; for(k=0;k<=1500;k++){ q=fiume.getPointAt(k/1500); dd=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z); if(dd<m){ m=dd; um=k/1500; } } return um; }
function normale(u){ var tg=fiume.getTangentAt(u); return [-tg.z,tg.x]; }
var uMilvio=uVicino(-152,-479)+6/lungoFiume, uAurelio=uVicino(-120,1)-5/lungoFiume, uEmilio=uVicino(-52,38)+4/lungoFiume, uFondo=uVicino(-90,400), uEmporio=uVicino(-102,131);
var pE=fiume.getPointAt(uEmporio), nE=normale(uEmporio), latoEmp=((-102-pE.x)*nE[0]+(131-pE.z)*nE[1])>0?1:-1;      // da che parte sta l'Emporio
/* le rive: per ogni punto del fiume quanto è lontana la terra asciutta, da una parte e dall'altra (per i buoi e gli ormeggi) */
var NR=500, RIVA=[new Float32Array(NR+1),new Float32Array(NR+1)];
(function(){ for(var k=0;k<=NR;k++){ var u=k/NR, p=fiume.getPointAt(u), n=normale(u);
  [1,-1].forEach(function(s,si){ var w=7; for(var r=1.5;r<14;r+=.2){ if((RM.hSuolo||RM.h)(p.x+n[0]*s*r,p.z+n[1]*s*r)>-.46){ w=r; break; } } RIVA[si][k]=Math.min(w,5.4); }); } })();      // la riva: dove il terreno supera il pelo dell'acqua (-0,5), al più all'orlo del nastro del fiume (5,6, frastagliato)
function riva(u,s){ var f=Math.max(0,Math.min(NR,u*NR)), k=Math.floor(f), t=f-k, A=RIVA[s>0?0:1]; return A[k]+(A[Math.min(NR,k+1)]-A[k])*t; }
/* dove camminano i buoi: fuori dal nastro del fiume (frastagliato fino a circa 6) e sul terreno sopra il pelo dell'acqua; prima stavano a riva+0,55 e lungo il tratto di valle,
   dove la riva è bassa (fino a -0,8), il nastro dell'acqua copriva loro le zampe */
var RIVA_B=[new Float32Array(NR+1),new Float32Array(NR+1)];
(function(){ for(var k=0;k<=NR;k++){ var u=k/NR, p=fiume.getPointAt(u), n=normale(u);
  [1,-1].forEach(function(s,si){ var r=Math.max(RIVA[si][k]+.55,6.4); while(r<9.5 && (RM.hSuolo||RM.h)(p.x+n[0]*s*r,p.z+n[1]*s*r)<=-.48) r+=.25; RIVA_B[si][k]=r; }); } })();
function rivaBuoi(u,s){ var f=Math.max(0,Math.min(NR,u*NR)), k=Math.floor(f), t=f-k, A=RIVA_B[s>0?0:1]; return A[k]+(A[Math.min(NR,k+1)]-A[k])*t; }
/* i ponti: la corsia passa per il centro dell'arcata più vicina (le arcate dei ponti comuni: centri a 0, ±2,95, ±5,18; il Sublicio di legno: stilate ogni 1,1) */
var PONTI_B=(RM.ponti||[]).filter(function(p){ return p.id!=='pontefabricio' && p.id!=='pontecestio'; }).map(function(p){ var u=uVicino(p.x,p.z), q=fiume.getPointAt(u), n=normale(u), de=(p.x-q.x)*n[0]+(p.z-q.z)*n[1];
  var archi=p.id==='pontesublicio'?[-5.55,-4.45,-3.35,-2.25,-1.15,-.05,1.05,2.15,3.25,4.35,5.45]:[-5.18,-2.95,0,2.95,5.18];
  return {u:u, de:de, archi:archi}; });
function corsia(u,lat){ var out=lat, limS=riva(u,1)-.6, limD=riva(u,-1)-.6;
  PONTI_B.forEach(function(p){ var ds=Math.abs(u-p.u)*lungoFiume; if(ds>3.5) return; var best=1e9, c; p.archi.forEach(function(a){ var v=a+p.de; if(Math.abs(a)<4.6 && v<limS && -v<limD && Math.abs(v-lat)<Math.abs(best-lat)) best=v; }); if(best>1e8) return;
    var w=1-sm(1.4,3.5,ds); out=out+(best-out)*w; });
  var s=out<0?-1:1, lim=riva(u,s)-.6; if(Math.abs(out)>lim) out=s*Math.max(.3,lim);      // mai addosso alla riva: mezza larghezza della chiatta (0,23) e un margine
  return out; }
/* Il traino (26 novembre 2026, secondo giro): i buoi camminano sulla riva destra (lato opposto all'Emporio), perché sulla sinistra, dall'Emporio in giù, le mura di riva stanno
   a filo dell'acqua (RM.MURA). Quale riva usassero davvero le fonti lette non lo dicono (ostia-antica.org: «most likely on both banks»): IPOTESI. Ogni anno si cerca il tratto più lungo
   in cui il posto dei buoi è libero (liberoQui: niente case, mura, monumenti, acqua) e la chiatta viaggia solo lì; nelle piene (EVENTI con piena) niente traino: le barche restano ferme. */
var SALTO_BUOI=5, PIENE=(D.EVENTI||[]).filter(function(e){ return e.piena; }), tiroOk=true, inPiena=false;
function postoBuoi(u,s){ var pa=fiume.getPointAt(u), na=normale(u), rw=rivaBuoi(u,s); return [pa.x+na[0]*s*rw, pa.z+na[1]*s*rw]; }
function trattoTiro(anno){ var C=CORSE.tira, s=Math.sign(C.lato), N=60, ok=[], k, best=[0,-1], i0=-1;
  inPiena=PIENE.some(function(e){ return anno>=e.da-.5 && anno<e.a+.5; }); tiroOk=!inPiena;
  for(k=0;k<=N;k++){ var u=uEmporio+(uFondo-uEmporio)*k/N, q=postoBuoi(u,s), lib=!isNaN(liberoQui(q[0],q[1],anno));
    if(lib){ var pb=fiume.getPointAt(Math.min(1,u+SALTO_BUOI/lungoFiume)), nb=normale(Math.min(1,u+SALTO_BUOI/lungoFiume)), bx=pb.x+nb[0]*C.lato, bz=pb.z+nb[1]*C.lato;      // la corda: dalla barca (cinque unità più a valle) ai buoi, provata a terra
      for(var j=1;j<5 && lib;j++){ var x=bx+(q[0]-bx)*j/5, z=bz+(q[1]-bz)*j/5; if((RM.hSuolo||RM.h)(x,z)>-.46 && (suIsolato(x,z) || (RM.MURA && RM.distLinea(x,z,RM.MURA,true)<.4))) lib=false; } }
    ok.push(lib); }
  for(k=0;k<=N+1;k++){ if(k<=N && ok[k]){ if(i0<0) i0=k; } else if(i0>=0){ if(k-1-i0>best[1]-best[0]) best=[i0,k-1]; i0=-1; } }
  var uO=function(k){ return uEmporio+(uFondo-uEmporio)*k/N; };
  if(best[1]-best[0]<8 || inPiena) tiroOk=false;
  C.b=Math.min(uFondo,uO(best[0])+SALTO_BUOI/lungoFiume); C.a=Math.min(uFondo,uO(best[1])+SALTO_BUOI/lungoFiume);      // la barca sta cinque unità a valle dei buoi
  RM.barcheTiro={anno:anno, ok:tiroOk, da:best[0], a:best[1], N:N}; }      // per le prove
/* le sedici barche, nell'ordine in cui compaiono quando il commercio cresce (con una sola barca: una chiatta tirata dai buoi verso l'Emporio) */
var CORSE={tira:{a:uFondo, b:uEmporio, lato:-latoEmp*2.6, vel:.07, tipo:0, traino:true}, scende:{a:uEmporio+3/lungoFiume, b:uFondo, lato:latoEmp*2.6, vel:.1, tipo:0},
  monte:{a:uMilvio, b:uAurelio, lato:2.95, vel:.1, tipo:0}, remiSu:{a:uAurelio, b:uMilvio, lato:-2.95, vel:.1, tipo:1, remi:true}, remiValle:{a:uEmilio, b:uFondo, lato:-latoEmp*1.2, vel:.15, tipo:1, remi:true}};
var ORDINE_B=['tira','monte','remiValle','tira','scende','remiSu','monte','tira','remiValle','scende','monte','tira','remiSu','scende','monte','remiValle'];
var dati=ORDINE_B.map(function(c,i){ var C=CORSE[c]; return {c:C, nome:c, f:rnd(), fermo:0, fase:rnd()*6.28, x:0, z:0, ry:0, vis:false, mov:0, i:i}; });
var frustB=new THREE.Frustum(), mPB=new THREE.Matrix4(), vB=new THREE.Vector3(), tB=0, mB2=new THREE.Matrix4(), qB=new THREE.Quaternion(), eB=new THREE.Euler(), sB=new THREE.Vector3(1,1,1), pB=new THREE.Vector3();
function muoviBarche(dt){
  var visibili=Math.round(NB*quotaBarche), cam=RM.camera.position, dtm=MENO_MOTO?0:dt, nC=0, nCL=0, nP=0, nPL=0, nR=0, nBu=0, nBv=0, nBl=0, nBo=0, nBoL=0, nS=0;
  tB+=dtm; mPB.multiplyMatrices(RM.camera.projectionMatrix,RM.camera.matrixWorldInverse); frustB.setFromProjectionMatrix(mPB);
  var maxV=RM.QUALITA.barche[RM.q]||0, vicine=[];
  dati.forEach(function(b,k){ b.vis=k<visibili; if(!b.vis) return;
    var C=b.c, L=(C.b-C.a)*lungoFiume, mosso=0;
    if(b.fermo>0){ b.fermo-=dtm; if(b.fermo<=0){ vB.set(b.x,-.4,b.z); if(frustB.containsPoint(vB)) b.fermo=5; else b.f=0; } }      // ormeggiata: ricomincia solo quando nessuno la guarda
    else if(dtm>0 && !inPiena && !(C.traino && !tiroOk)){ b.f+=C.vel*dtm/Math.abs(L); mosso=1; if(b.f>=1){ b.f=1; b.fermo=60+((k*17)%40); } }
    b.mov=mosso;
    var u=C.a+(C.b-C.a)*b.f, p=fiume.getPointAt(u), tg=fiume.getTangentAt(u), n=[-tg.z,tg.x], dirS=C.b>C.a?1:-1, lat=C.lato;
    if(C.traino){ var sv=sm(.93,1,b.f); if(sv>0) lat=lat+(Math.sign(C.lato)*(riva(u,Math.sign(C.lato))-.5)-lat)*sv; }      // a fine corsa accosta alla riva dei buoi, di fronte all'Emporio, piano (prima saltava di 23 m all'ultimo passo)
    lat=corsia(u,lat);
    b.x=p.x+n[0]*lat; b.z=p.z+n[1]*lat; b.ry=Math.atan2(-tg.z*dirS,tg.x*dirS); b.u=u; b.n=n; b.lat=lat; b.dirS=dirS; b.tg=tg;
    if(C.traino && tiroOk!==true && b.f<.999){ var sr=Math.sign(C.lato); lat=sr*(riva(u,sr)-.6); b.x=p.x+n[0]*lat; b.z=p.z+n[1]*lat; }      // senza traino: ormeggiata alla riva
    var dd=(b.x-cam.x)*(b.x-cam.x)+(-.5-cam.y)*(-.5-cam.y)+(b.z-cam.z)*(b.z-cam.z); b.d2=dd; vicine.push(b); });
  vicine.sort(function(a,b2){ return a.d2-b2.d2; });
  vicine.forEach(function(b,r){ var C=b.c, vera=r<maxV && b.d2<70*70, piccola=C.tipo===1, ampio=MENO_MOTO?0:(piccola?2:1);
    eB.set(.012*ampio*Math.sin(tB*1.1+b.fase),b.ry,.008*ampio*Math.sin(tB*.8+b.fase*1.3),'YXZ'); qB.setFromEuler(eB); pB.set(b.x,-.5+.004*ampio*Math.sin(tB*1.4+b.fase),b.z); sB.set(1,1,1); mB2.compose(pB,qB,sB);      // beccheggio appena accennato
    var m=piccola?(vera?mPV:mPL):(vera?mCV:mCL), c=piccola?(vera?nP++:nPL++):(vera?nC++:nCL++); m.setMatrixAt(c,mB2);
    if(piccola && C.remi){ var fi=tB*3.2+b.fase, sw=b.mov?.42*Math.sin(fi):0, dip=b.mov?-.15-.07*Math.cos(fi):-.13;      // i remi: avanti e indietro, la pala giù mentre tira (fermi senza animazioni)
      [1,-1].forEach(function(s){ eB.set(dip*s,0,0); var qr=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,s>0?-sw:Math.PI+sw,0)); var qd=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-dip);      // la pala scende fino all'acqua (lo scalmo a 0,42 m, la pala a 2,9 m dallo scalmo)
        var ql=qr.multiply(qd), q2=qB.clone().multiply(ql), off=new THREE.Vector3(-.4*MB,.42*MB,s*.85*MB).applyQuaternion(qB); pB.set(b.x+off.x,-.5+off.y,b.z+off.z); mB2.compose(pB,q2,sB); mRemi.setMatrixAt(nR++,mB2); }); }
    if(C.traino && b.f<.999 && tiroOk===true){      // la coppia di buoi sulla riva, una cinquantina di metri avanti, e la corda all'albero
      var sL=Math.sign(C.lato), uA=b.u+b.dirS*SALTO_BUOI/lungoFiume, pa=fiume.getPointAt(uA), na=normale(uA), ta=fiume.getTangentAt(uA), rw=rivaBuoi(uA,sL), bx=pa.x+na[0]*sL*rw, bz=pa.z+na[1]*sL*rw, by=(RM.hSuolo||RM.h)(bx,bz);
      b.bx=bx; b.bz=bz; b.by=by; eB.set(0,Math.atan2(ta.x*b.dirS,ta.z*b.dirS),0); qB.setFromEuler(eB); pB.set(bx,by,bz); mB2.compose(pB,qB,sB);
      var vic=RM.q!==0 && (bx-cam.x)*(bx-cam.x)+(by-cam.y)*(by-cam.y)+(bz-cam.z)*(bz-cam.z)<40*40, mb=vic?mBuoi:mBuoiL, nb=vic?nBv++:nBl++;      // da vicino la forma fine, da lontano e a «bassa» quella leggera
      mb.setMatrixAt(nb,mB2); mb.geometry.attributes.fase.array[nb]=b.fase; mb.geometry.attributes.moto.array[nb]=b.mov; nBu++;
      var tl=Math.hypot(ta.x,ta.z)||1, hx=bx+na[0]*sL*.12+ta.x/tl*b.dirS*.08, hz=bz+na[1]*sL*.12+ta.z/tl*b.dirS*.08;      // il bovaro: 1,2 m dal centro della coppia verso la terra, 0,8 m avanti
      pB.set(hx,(RM.hSuolo||RM.h)(hx,hz),hz); mB2.compose(pB,qB,sB);
      if(RM.QUALITA.barche[RM.q] && vic && mBov.geometry.attributes.fase){ mBov.setMatrixAt(nBo,mB2); var GA=mBov.geometry.attributes; GA.fase.array[nBo]=b.fase*1.7; GA.moto.array[nBo]=b.mov; GA.posa.array[nBo*3]=.15; nBo++; }      // vero: cammina; la testa appena girata verso i buoi
      else mBovL.setMatrixAt(nBoL++,mB2);
      var top=new THREE.Vector3(ALB*MB,(.1+HALB)*MB,0).applyEuler(new THREE.Euler(0,b.ry,0)); vB.set(b.x+top.x,-.5+top.y,b.z+top.z);
      var gio=new THREE.Vector3(0,.146,.084).applyQuaternion(qB).add(pB); d.position.copy(vB); d.lookAt(gio); d.scale.set(.006,.006,vB.distanceTo(gio)); d.updateMatrix(); mCorde.setMatrixAt(nBu-1,d.matrix); }
    if(b.mov && (C.traino||C.remi)){ var lg=piccola?2:4.2, lr=piccola?.6:1.2, ri=b.ry; eB.set(0,ri,0); qB.setFromEuler(eB); var st=new THREE.Vector3(-(piccola?LP:LC)/2*MB*.9,0,0).applyQuaternion(qB);
      pB.set(b.x+st.x,-.497,b.z+st.z); sB.set(lg,1,lr); mB2.compose(pB,qB,sB); mScie.setMatrixAt(nS++,mB2); sB.set(1,1,1); }
  });
  mCV.count=nC; mCL.count=nCL; mPV.count=nP; mPL.count=nPL; mRemi.count=nR; mBuoi.count=nBv; mBuoiL.count=nBl; mScie.count=nS; mCorde.count=nBu; mBov.count=nBo; mBovL.count=nBoL;
  [mCV,mCL,mPV,mPL,mRemi,mBuoi,mBuoiL,mScie,mCorde,mBov,mBovL].forEach(function(m){ m.visible=m.count>0; if(m.count) parziale(m.instanceMatrix,m.count*16); });
  if(nBo){ var GB=mBov.geometry.attributes; GB.fase.needsUpdate=true; GB.moto.needsUpdate=true; GB.posa.needsUpdate=true; }
  [geoBuoi,geoBuoiL].forEach(function(g){ g.attributes.fase.needsUpdate=true; g.attributes.moto.needsUpdate=true; });
  matScia.color.setScalar(1-.75*(RM.notte||0));
}
/* Il porto dell'Emporio (26 novembre 2026, sera; l'utente: «all'emporio non dovrebbero esserci navi al porto a scaricare quando era in funzione?»). Fonti lette in
   src/testi/vita-roma-fonti.md, «Il porto dell'Emporio». Scritto: l'Emporio è «the landing place and market for the merchandise that was brought up the Tiber from Ostia», con la banchina,
   «the steps and paved inclines which led down to the water to facilitate unloading» e mensole forate «for mooring rings»; dopo i grandi magazzini «largely used for unloading marble»
   (Platner e Ashby, Emporium); le banchine «did not protrude into the river» (Lanciani 1897, p. 510); i blocchi trovati alla Marmorata, squadrati o sbozzati in colonne (ivi, p. 531).
   Nel modello: chiatte ferme accostate alla banchina del monumento `emporio`, una per ogni tratto fra due scale, prua a monte, legate alla banchina con due cime; cariche di sacchi,
   di blocchi di marmo o vuote; sulla banchina accanto, blocchi e un fusto di colonna o una pila di sacchi. Quante: con la curva dei commerci, come le barche che si muovono; nessuna
   quando l'Emporio non è in uso (dal 430 nel modello, scelta già nella scheda). SCHEMA: numero, posti, carichi, cime, mucchi. Nessuno scarica: nessun testo letto descrive uomini al
   lavoro all'Emporio (i portatori sulla passerella sono descritti a Porto e a Ostia). Dopo il 271 le mura corrono dietro la banchina e nessun testo letto nomina aperture verso il fiume:
   non se ne disegnano, e la merce resta sulla banchina, fuori dal muro (come entrasse in città non si vede: limite dichiarato). */
var FERMI=[2.6,-2.6,7.8,-7.8,13,-13,18.2,-18.2], CARICHI_F=['sacchi','marmo','vuota','marmo','sacchi','vuota','marmo','sacchi'], NF=FERMI.length;      // i posti fra le scale del monumento (in unità lungo la banchina, +x verso monte), dal centro ai capi
var TIPI_F={sacchi:0, marmo:1, vuota:2}, mFermi=[[],[]];      // [vicine, lontane][tipo]
['sacchi','marmo','vuota'].forEach(function(t){ [true,false].forEach(function(v,l){ var m=new THREE.InstancedMesh(geoChiatta(v,0,t),matBarche,NF); m.count=0; m.visible=false; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='vita'; RM.scene.add(m); mFermi[l].push(m); }); });
var geoMucchi=[(function(){ var B=new RM.Costruttore(); B.geo(scatM(2.6,1.1,1.6,-2.2,.55,-.2),P.marmo.clone().multiplyScalar(.93)); B.geo(scatM(2.1,.9,1.4,.6,.45,.4),P.marmo.clone().multiplyScalar(.87)); B.geo(scatM(1.6,.8,1.2,.4,1.3,.3),P.marmo);
    B.geo(gM(new THREE.CylinderGeometry(.5,.55,6,10).rotateZ(Math.PI/2).translate(.3,.52,-1.15)),P.marmo.clone().multiplyScalar(.96)); return B.geometria(); })(),      // blocchi squadrati e un fusto sbozzato a terra (Lanciani, p. 531); misure: SCHEMA
  (function(){ var B=new RM.Costruttore(), k=0; for(var i=0;i<4;i++) for(var j=0;j<2;j++){ B.geo(gM(new THREE.SphereGeometry(1,7,4).scale(.62,.36,.5).translate(-1.9+i*1.25,.34,-.5+j*1.05)),C_SACCO.clone().multiplyScalar(.85+.05*((k++)%4))); }
    for(i=0;i<3;i++) B.geo(gM(new THREE.SphereGeometry(1,7,4).scale(.62,.36,.5).translate(-1.3+i*1.25,.96,0)),C_SACCO.clone().multiplyScalar(.9)); return B.geometria(); })()];      // una pila di sacchi (SCHEMA)
var mMucchi=geoMucchi.map(function(g){ var m=new THREE.InstancedMesh(g,matBarche,NF); m.count=0; m.visible=false; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='vita'; RM.scene.add(m); return m; });
var mCime=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0,.5),mCorde.material,NF*2); mCime.count=0; mCime.visible=false; mCime.frustumCulled=false; mCime.userData.gruppo='vita'; RM.scene.add(mCime);
var fermi=null, nFermi=0;      // i posti provati (una volta sola) e quanti ne sono occupati quest'anno
function postiFermi(){ var m=(RM.MONUMENTI||[]).filter(function(q){ return q.id==='emporio'; })[0]; if(!m || !m.g) return [];
  var c=Math.cos(m.ry), s=Math.sin(m.ry), yQ=m.g.position.y-.25;      // la cima della banchina: il muro del monumento va da -1,75 a -0,25 sotto la sua base
  function W(lx,lz){ return [m.x+lx*c+lz*s, m.z-lx*s+lz*c]; }
  return FERMI.map(function(lx,k){ var ok=true;
    [-.95,0,.95].forEach(function(dx){ [-.25,.25].forEach(function(dz){ var p=W(lx+dx,-14.45+dz); if(RM.hSuolo(p[0],p[1])>-.6 || (RM.MURA && RM.distLinea(p[0],p[1],RM.MURA,true)<.5)) ok=false;
      (RM.ponti||[]).forEach(function(q){ if(Math.hypot(q.x-p[0],q.z-p[1])<4) ok=false; }); }); });      // nell'acqua, lontano da mura e ponti
    var b=W(lx,-14.45), q=W(lx,-13.7);
    return {ok:ok, x:b[0], z:b[1], ry:m.ry, mx:q[0], mz:q[1], yQ:yQ, tipo:TIPI_F[CARICHI_F[k]], prua:W(lx+1.25,-14.2), poppa:W(lx-1.25,-14.2), bp:W(lx+.8,-14.3), bq:W(lx-.8,-14.3)}; }); }
var oF=new THREE.Object3D(), vF=new THREE.Vector3(), vG=new THREE.Vector3();
function annoFermi(anno){ if(!fermi) fermi=postiFermi(); var q=RM.statoMonumento('emporio',anno), on=q.s0==='uso' && !(q.s1!=='uso' && q.t>.5);
  var quota=Math.min(1,D.interp(D.CURVE.commerci.punti,anno)/60); nFermi=on?Math.round(NF*quota):0;      // come le barche che si muovono (quotaBarche)
  var nm=[0,0], nc=0; mMucchi.forEach(function(mm){ mm.count=0; });
  fermi.forEach(function(f,k){ f.on=k<nFermi && f.ok; if(!f.on) return;
    if(f.tipo<2){ var mm=mMucchi[f.tipo===1?0:1]; oF.position.set(f.mx,f.yQ,f.mz); oF.rotation.set(0,f.ry+(k%2?.08:-.06),0); oF.scale.setScalar(1); oF.updateMatrix(); mm.setMatrixAt(mm.count++,oF.matrix); }      // la merce sulla banchina accanto
    [[f.bp,f.prua],[f.bq,f.poppa]].forEach(function(cc){ vF.set(cc[0][0],-.43,cc[0][1]); vG.set(cc[1][0],f.yQ,cc[1][1]); oF.position.copy(vF); oF.lookAt(vG); oF.scale.set(.005,.005,vF.distanceTo(vG)); oF.updateMatrix(); mCime.setMatrixAt(nc++,oF.matrix); }); });      // due cime: dalla prua e dalla poppa a terra (gli anelli delle mensole: Platner)
  mMucchi.forEach(function(mm){ mm.visible=mm.count>0; mm.instanceMatrix.needsUpdate=true; }); mCime.count=nc; mCime.visible=nc>0; mCime.instanceMatrix.needsUpdate=true; }
function frameFermi(){ if(!fermi) return; var cam=RM.camera.position, cnt=[[0,0,0],[0,0,0]];
  fermi.forEach(function(f){ if(!f.on) return; var l=(RM.q!==0 && Math.hypot(f.x-cam.x,f.z-cam.z,-.5-cam.y)<60)?0:1, m=mFermi[l][f.tipo];
    oF.position.set(f.x,-.5,f.z); oF.rotation.set(0,f.ry,0); oF.scale.setScalar(1); oF.updateMatrix(); m.setMatrixAt(cnt[l][f.tipo]++,oF.matrix); });      // ferme: niente beccheggio, il fiume qui è calmo (SCHEMA)
  mFermi.forEach(function(L,l){ L.forEach(function(m,t){ m.count=cnt[l][t]; m.visible=m.count>0; if(m.count) parziale(m.instanceMatrix,m.count*16); }); }); }
RM.portoProva={ posti:function(){ return fermi; }, conta:function(){ return {fermi:nFermi, ok:fermi?fermi.filter(function(f){ return f.ok; }).length:0, accese:fermi?fermi.filter(function(f){ return f.on; }).length:0, mucchi:mMucchi.map(function(m){ return m.count; }), cime:mCime.count}; } };      // per le prove
RM.barcheProva={ lista:function(){ return dati.map(function(b){ return {i:b.i, x:b.x, z:b.z, ry:b.ry, tipo:b.c.tipo, corsa:b.nome, vis:b.vis, mov:b.mov, bx:b.bx, bz:b.bz, by:b.by, f:b.f}; }); },      // per le prove
  conta:function(){ return {visibili:dati.filter(function(b){ return b.vis; }).length, vere:mCV.count+mPV.count, buoi:mBuoi.count+mBuoiL.count, buoiVicini:mBuoi.count, bovari:mBov.count, bovariSagoma:mBovL.count, triBue:Math.round(geoBuoi.attributes.position.count/3/2), triBueL:Math.round(geoBuoiL.attributes.position.count/3/2)}; },
  interni:{fiume:fiume, riva:riva, normale:normale, corsia:corsia, CORSE:CORSE, uFondo:uFondo, uEmporio:uEmporio, uMilvio:uMilvio, uAurelio:uAurelio, uEmilio:uEmilio, latoEmp:latoEmp, lungo:lungoFiume, PONTI:PONTI_B} };

/* ---------- le fontane dei quartieri (27 novembre 2026) ----------
   I cataloghi del IV secolo contano i lacus, le vasche pubbliche, regione per regione: da 20 (XI) a 180 (XIV), 1.352 in tutto nel breviario (src/testi/vita-roma-fonti.md;
   src/testi/regioni-fonti.md, «Densità dei quartieri»). Qui una vasca ogni sei, all'angolo di un isolato della regione scelto dal posto, fra un lotto e l'altro: dove stessero
   e che forma avessero (una vasca di pietra di circa 3,5 x 2 m con la bocca dell'acqua) è uno schema, detto nel piede della pagina. L'acqua c'è finché il modello tiene
   in uso gli acquedotti: fino al 537, quando i Goti li tagliano (Procopio V 19); poi le vasche restano asciutte, col fondo di terra. Dal 776 il modello rimette in uso
   gli acquedotti (i restauri di Adriano I, Liber Pontificalis): l'acqua torna solo nelle vasche accanto a una casa abitata (schema). Circa 4.000 triangoli in tutto. */
var LACUS=[81,65,65,71,74,73,76,120,120,90,20,80,89,180], vasche=[];
LACUS.forEach(function(nl,r){ var c=isolati.filter(function(b){ return b.reg===r && b.dentro && !b.via; }).map(function(b){ return [RM.grana(Math.round(b.x*4.9)+211,Math.round(b.z*6.3)-157),b]; }).sort(function(a,b){ return a[0]-b[0]; }), quante=Math.round(nl/6), k, n=0;
  for(k=0;k<c.length && n<quante;k++){ var b=c[k][1], ca=Math.cos(b.ry), sa=Math.sin(b.ry), angoli=[[1,1],[-1,1],[1,-1],[-1,-1]], j;
    for(j=0;j<4;j++){ var lx=angoli[j][0]*(b.w/2+.42), lz=angoli[j][1]*(b.d/2+.42), x=b.x+lx*ca+lz*sa, z=b.z-lx*sa+lz*ca;      // l'angolo dell'isolato, fuori dai muri
      if(RM.distStrade(x,z)>1.1 && RM.distFiume(x,z)>12){ vasche.push({x:x,z:z,y:(RM.hSuolo||RM.h)(x,z),ry:b.ry,b:b}); n++; break; } } } });
var geoVasca=new RM.Costruttore().scatola(.36,.08,.22,0,0,0,P.travertino).scatola(.3,.012,.16,0,.06,0,P.terra||P.tufo).scatola(.05,.17,.05,.16,0,0,P.travertino).geometria();      // la vasca, il fondo, la bocca
var magliaVasche=new THREE.InstancedMesh(geoVasca,RM.matPietra(),Math.max(1,vasche.length)), matAcqua=new THREE.MeshStandardMaterial({color:RM.col(0x5d93a6),roughness:.08,metalness:.1,emissive:RM.col(0x16303a)});
var geoAcqua=new THREE.PlaneGeometry(.3,.16); geoAcqua.rotateX(-Math.PI/2); geoAcqua.translate(0,.075,0);
var magliaAcqua=new THREE.InstancedMesh(geoAcqua,matAcqua,Math.max(1,vasche.length)); magliaAcqua.count=0;
[magliaVasche,magliaAcqua].forEach(function(m){ m.frustumCulled=false; m.userData.gruppo='vita'; m.receiveShadow=true; RM.scene.add(m); }); magliaVasche.castShadow=true;
(function(){ var o=new THREE.Object3D(); vasche.forEach(function(v,i){ o.position.set(v.x,v.y-.01,v.z); o.rotation.set(0,v.ry,0); o.scale.setScalar(1); o.updateMatrix(); magliaVasche.setMatrixAt(i,o.matrix); }); magliaVasche.count=vasche.length; magliaVasche.instanceMatrix.needsUpdate=true; })();
function acquaVasche(anno){ var q=RM.statoMonumento?RM.statoMonumento('acquedotti',anno):null, su=q?(q.t>.5?q.s1:q.s0)==='uso':anno<537, o=new THREE.Object3D(), n=0;
  vasche.forEach(function(v){ if(!su || (anno>=537 && !(v.b.a0>.5))) return; o.position.set(v.x,v.y-.01,v.z); o.rotation.set(0,v.ry,0); o.updateMatrix(); magliaAcqua.setMatrixAt(n++,o.matrix); });
  magliaAcqua.count=n; magliaAcqua.instanceMatrix.needsUpdate=true; RM.vascheConta={vasche:vasche.length, conAcqua:n}; }      // per le prove

var modVita=function(anno){
  if(RM.aPezzi){ var p=modVita.anno===anno?modVita.passo:0; modVita.anno=anno;      // all'arrivo a pezzi (js/pagina.js, 28 novembre 2026): tre fotogrammi invece di uno; stessi conti, stesso ordine
    if(p===0){ modVita.passo=1; acquaVasche(anno); annoOra=anno; vestiEpoca(anno); VA=vitaAnno(anno); quotaGente=Math.min(1,D.interp(D.CURVE.popolazione.punti,anno)/900000);
      quotaBarche=Math.min(1,D.interp(D.CURVE.commerci.punti,anno)/60); epocaBarche(anno); trattoTiro(anno); annoFermi(anno); return false; }
    if(p===1){ modVita.passo=2; quotaPellegrini=D.interp(PELLEGRINI_NEL_TEMPO,anno); luoghiFonti(anno); return false; }
    modVita.anno=null; mostraForni(); vicoli(); return; }
  modVita.anno=null;
  acquaVasche(anno);
  annoOra=anno; vestiEpoca(anno);
  VA=vitaAnno(anno);      // assedi e città vuota (VITA_ANNI): il 546 di prima ora sta lì
  quotaGente=Math.min(1,D.interp(D.CURVE.popolazione.punti,anno)/900000);      // una figura ogni tante persone: la stessa proporzione in ogni secolo
  quotaBarche=Math.min(1,D.interp(D.CURVE.commerci.punti,anno)/60); epocaBarche(anno); trattoTiro(anno); annoFermi(anno);      // 26 novembre 2026: tolto l'aumento a 16 barche nell'846 (era per le navi saracene, che dal 23 novembre stanno in js/scene-tappe.js; le chiatte coi buoi non sono navi saracene)
  quotaPellegrini=D.interp(PELLEGRINI_NEL_TEMPO,anno);
  luoghiFonti(anno);
  mostraForni(); vicoli();
};
function luoghiFonti(anno){
  LUOGHI.forEach(function(L){ var on=anno>=L.da && anno<L.a; if(on && L.mon){ var q=RM.statoMonumento(L.mon,anno); on=q.s0==='uso' && !(q.s1!=='uso' && q.t>.5); } L.vis=on?1:0; if(L.porto) banchiVisibili(on && !!L.ok); });
  if(Math.abs(anno-annoVie)>=2) vieDaRifare=true;
  zoneDaRifare=true;
  var bassaF=1-.42*RM.sfuma(470,720,anno); FONTI.forEach(function(f){ if(f.id){ var q=RM.statoMonumento(f.id,anno), s=f.stato||'uso'; f.vivo=(q.s0===s?1-q.t:0)+(q.s1===s?q.t:0); } else if(f.b && !f.nucleo) faiTetto(f,anno); });      // il fumo esce dal tetto, che dal V secolo si abbassa con le case
  function faiTetto(f,anno){ var b=f.b, cm=b.medP&&b.medP.case&&b.medP.case[0];      // 27 novembre 2026: sulla casa altomedievale il fumo esce dal suo tetto (alta da 5 a 10 m), non 10-17 m più in alto dove stava il tetto della casa romana
    if(f.x0==null){ f.x0=f.x; f.z0=f.z; }
    if(cm && anno>=b.medDa+1.5){ f.x=cm.x; f.z=cm.z; f.y=cm.y+cm.h+.15; }      // la prima casa del lotto: la sua scala in altezza (o.h + 0,15) è quella di scriviMed in js/citta.js
    else { f.x=f.x0; f.z=f.z0; f.y=b.y+b.alt*(b.nasce?1:bassaF)+.15; } }
}
modVita.arrivo=0; RM.moduli.push(modVita);      // sul telefono nel viaggio fra due tappe non lavora: all'arrivo, a pezzi (js/pagina.js, 28 novembre 2026)
RM.frame.push(function(dt){
  tempo+=dt; if(!MENO_MOTO) uPasso.value=tempo;
  if(vieDaRifare){ vieDaRifare=false; scegliVie(annoOra); scegliCarri(annoOra); }
  if(zoneDaRifare){ occT=tempo; zP=null; zoneScene(false); zoneDaRifare=false; }      // le scene accese tengono libero il loro posto (e se si muovono, ogni tre secondi: a pezzi, zoneAvvia e zonePasso)
  else if(occN && tempo-occT>3){ occT=tempo; if(!zP) zoneAvvia(); }
  if(zP) zonePasso(1);
  provaLuoghi(annoOra,1.5);      // i posti liberi dei luoghi affollati, al più un millesimo e mezzo per fotogramma
  LUOGHI.forEach(function(L){ if(L.porto) banchiVisibili(L.vis && !!L.ok && !!L.banchi); });
  matGente.opacity=1-.8*RM.notte;
  if(RM.leggero){ if(gente.visible){ gente.visible=false; fumo.visible=false; figure.forEach(function(m){ m.visible=false; }); if(ombraFig) ombraFig.visible=false; mCarri.visible=false; mMuli.visible=false; rondeSpente(); } }       // regolatore al terzo grado: si rinuncia a passanti e fumo
  else { if(!gente.visible){ gente.visible=true; fumo.visible=true; }
    if(ALTERNA_V && !(RM.fluido && RM.fluido.alterna===false)){ pariV=!pariV; dtGente+=dt; if(pariV){ muoviGente(dtGente); dtGente=0; } else muoviFumo(); }
    else { muoviGente(dt); muoviFumo(); } }
  muoviBarche(dt); frameFermi();
});
/* 28 novembre 2026, notte (l'utente: «rendere più fluido tutto dal cell»): sui dispositivi al tocco i passanti e il fumo si muovono a fotogrammi alterni, ognuno trenta volte
   al secondo, i passanti col tempo di due fotogrammi: sul banco da telefono erano da 3 a 5 millesimi a fotogramma a 4x, il lavoro più grosso dei RM.frame. Un passo di
   trenta al secondo è di 5 cm per chi cammina e di meno per il fumo, che sale lento. Le barche restano a ogni fotogramma (da vicino si vedrebbero a scatti). */
var ALTERNA_V=(navigator.maxTouchPoints>0)||!!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches), pariV=false, dtGente=0;
/* per le prove: ?notte=1 accende la notte all'avvio (le catture senza finestra non possono premere «Notte») */
if(/[?&]notte=1/.test(location.search)) setTimeout(function(){ var b=document.getElementById('btnNotte'); if(b && b.getAttribute('aria-pressed')!=='true') b.click(); else if(RM.applicaLuce) RM.applicaLuce(1); },1500);      // 27 novembre 2026: come il bottone, così la regia rifà anche i moduli (finestre accese di js/citta.js); prima si cambiava solo la luce
RM.vitaProve={luoghi:LUOGHI, ronde:RONDE, lumiRonde:lumiR, aloneRonde:aloneR, attrezziRonde:attrR, vie:vie,libero:liberoQui, suIsolato:suIsolato, ostacoli:ostacoli, occupato:occupato, carri:mCarri};      // per le prove
RM.vitaConta=function(){ var c={persone:0, carri:mCarri.count, muli:mMuli.count, mercato:mMerc.visible?mMerc.count:0}, k; for(k=0;k<NP;k++) if(pos[k*3+1]>-50) c.persone++;
  figure.forEach(function(m){ c.persone+=m.count; }); c.luoghi={}; LUOGHI.forEach(function(L){ if(L.vis) c.luoghi[L.id]=L.nOk||0; }); return c; };      // quante figure ci sono ora (per le prove e per il rapporto)
})();
