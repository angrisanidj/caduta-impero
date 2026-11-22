/* Ciò che una tappa racconta di Roma deve vedersi nella città, e la vista deve andarci da sola (richiesta dell'utente, 23 novembre 2026).
   1. Regia: a ogni cambio di tappa, se nell'anno della tappa c'è un evento di Roma con un luogo (campo «vista» in EVENTI di js/dati.js), la camera vola lì;
      se l'evento riguarda tutta la città, o non c'è un evento, torna alla vista d'insieme (solo se ci aveva portato la regia: chi esplora a mano non viene disturbato).
      Sul telefono la città non si apre da sola: la regia muove la vista solo se la città è già mostrata.
   2. Messe in scena, accese solo nell'anno della loro tappa, a grandezza naturale (1 unità = 10 m: un uomo è alto 0,18):
      - 312, la rotta al ponte Milvio. Lattanzio 44, 9: Massenzio, messo in fuga, «properat ad pontem, qui interruptus erat, ac multitudine fugientium pressus in Tiberim deturbatur»;
        Panegirico del 313, 16, 3 e 17, 1: l'esercito di Massenzio schierato «a tergo Tiberi amne», la rotta «angustiis Muluii pontis»; Zosimo II 16: il ponte provvisorio di travi cede.
        La battaglia vera è a Saxa Rubra, circa nove miglia a nord (Aurelio Vittore 40, 23), fuori dalla scena: qui si vede la fuga verso il ponte, la cavalleria di Costantino
        che incalza da nord, la calca sul ponte provvisorio e gli uomini in acqua. Numeri, schieramento e colori (rosso per Costantino, grigio per Massenzio) sono uno schema.
      - 357, l'ingresso di Costanzo II. Ammiano XVI 10, 4-13 (thelatinlibrary, letto il 23 novembre 2026): arriva da Otricoli lungo la Flaminia, «insidebat aureo solus ipse carpento
        fulgenti claritudine lapidum variorum»; attorno a lui «purpureis subtegminibus texti … dracones hastarum aureis gemmatisque summitatibus inligati»; «incedebat hinc inde ordo
        geminus armatorum clipeatus atque cristatus», con i cavalieri corazzati, «quos clibanarios dictitant»; si china passando le porte alte e arriva ai Rostri, nel Foro.
        Qui il corteo scende lungo la via Lata (via del Corso) verso il Foro, con la folla ai lati; la lunghezza del corteo e il numero delle figure sono uno schema. */
(function(){
'use strict';
var RM=window.RM, D=window.RM_DATI;
if(!RM||RM.guasto||!RM.scene) return;
var P=RM.P, rnd=RM.casuale(312);
var C={ rosso:RM.col(0x9a2f2a), grigio:RM.col(0x7b7f86), ferro:RM.col(0xa9adb3), tunica:RM.col(0xd9cfbf), pelle:RM.col(0xb98a6a), oro:RM.col(0xd4ae55), porpora:RM.col(0x6b2a5a),
        bianco:RM.col(0xeee8dc), cavalloB:RM.col(0x6b4a33), cavalloC:RM.col(0x9c8a74), folla:[RM.col(0xb5543e),RM.col(0x8c7a5b),RM.col(0xc9b48a),RM.col(0x6f7f6a),RM.col(0x9c6a48),RM.col(0xd8cdb6)] };

/* figure a blocchi, come le statue di js/monumenti.js (s=1: uomo alto 1,85 m, cavallo lungo 2,2 m) */
function uomo(B,x,z,y,col,scudo,ry){
  B.dentro(x,y,z,ry||0,function(B){
    B.scatola(.05,.15,.035,0,0,0,col).scatola(.03,.035,.03,0,.15,0,C.pelle);
    if(scudo) B.scatola(.012,.075,.06,.032,.05,0,scudo);                                  // scudo tondo visto di taglio: una lastra
  });
}
function cavaliere(B,x,z,y,ry,colC,colU){
  B.dentro(x,y,z,ry,function(B){
    B.scatola(.055,.085,.025,0,0,.08,colC).scatola(.055,.085,.025,0,0,-.08,colC).scatola(.06,.07,.22,0,.08,0,colC).scatola(.04,.1,.05,0,.13,.095,colC).scatola(.035,.04,.09,0,.2,.135,colC);
    B.scatola(.045,.11,.035,0,.15,-.01,colU).scatola(.03,.035,.03,0,.26,-.01,C.pelle);
  });
}
function insegna(B,x,z,y,col,alta){ B.scatola(.012,alta,.012,x,y,z,P.tronco).scatola(.11,.08,.008,x+.055,y+alta-.09,z,col); }

/* ---------- 312: la rotta al ponte Milvio ---------- */
var milvio=(function(){
  var curva=RM.curvaFiume, p=[-152,-479], m=1e9, tm=0, i, q, dd;
  for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x-p[0],q.z-p[1]); if(dd<m){ m=dd; tm=i/2400; } }
  var c=curva.getPoint(tm), tg=curva.getTangent(tm), u=[tg.x,tg.z], n=[-tg.z,tg.x];
  if(n[1]>0){ n=[-n[0],-n[1]]; }                                                          // n punta a nord (z minore): la riva dove l'esercito di Massenzio ha il fiume alle spalle
  var B=new RM.Costruttore(), terra=function(x,z){ return RM.distFiume(x,z)>6.2; };
  function punto(a,b){ return [c.x+u[0]*a+n[0]*b, c.z+u[1]*a+n[1]*b]; }
  var rot=Math.atan2(-n[0],-n[1]);                                                         // rivolti verso il fiume, cioè in fuga
  // i fuggiaschi: una massa che si stringe verso i due ponti
  for(i=0;i<1700;i++){
    var b=6.6+Math.pow(rnd(),2)*16, imbuto=2.5+b*1.2, a=(rnd()-.5)*2*imbuto+(rnd()<.5?0:3.2), xz=punto(a,b);
    if(!terra(xz[0],xz[1])) continue;
    uomo(B,xz[0],xz[1],RM.h(xz[0],xz[1]),rnd()<.75?C.tunica:C.grigio,C.grigio,rot+(rnd()-.5)*.8);
  }
  // la cavalleria di Costantino incalza da nord, in tre schiere
  for(i=0;i<260;i++){
    var sc=(i%3), xz2=punto((rnd()-.5)*34+(sc-1)*12, 24+sc*3+rnd()*7);
    if(!terra(xz2[0],xz2[1])) continue;
    cavaliere(B,xz2[0],xz2[1],RM.h(xz2[0],xz2[1]),rot+Math.PI+(rnd()-.5)*.3,rnd()<.5?C.cavalloB:C.cavalloC,C.rosso);
  }
  for(i=0;i<9;i++){ var xi=punto((i-4)*4.2,27+rnd()*4); insegna(B,xi[0],xi[1],RM.h(xi[0],xi[1]),C.rosso,.42); }
  // la calca sul ponte provvisorio (a monte, come in js/mura.js) e gli uomini in acqua
  var t=tm, q0=c; while(t>0.0005){ t-=0.0002; q=curva.getPoint(t); if(Math.hypot(q.x-q0.x,q.z-q0.z)>=3.2) break; }
  var tg2=curva.getTangent(t), nn=[-tg2.z,tg2.x];
  for(i=0;i<110;i++){ var s=(rnd()-.5)*14, w=(rnd()-.5)*.6; uomo(B,q.x+nn[0]*s+tg2.x*w,q.z+nn[1]*s+tg2.z*w,-.5+.95,C.tunica,C.grigio,Math.atan2(nn[0],nn[1])+(rnd()-.5)); }
  for(i=0;i<80;i++){ var s2=(rnd()-.5)*10, w2=(rnd()-.5)*9, xw=q.x+nn[0]*s2+tg2.x*(w2+2), zw=q.z+nn[1]*s2+tg2.z*(w2+2);      // solo le teste fuori dall'acqua
    if(RM.distFiume(xw,zw)>5) continue; B.scatola(.035,.04,.035,xw,-.5,zw,C.pelle); }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:311.6, a:313};
})();

/* ---------- 357: l'ingresso di Costanzo II lungo la via Lata ---------- */
var corteo=(function(){
  var A=RM.ll(41.9110,12.4763), Z=RM.ll(41.8960,12.4823), R=[-4,-2];                     // porta Flaminia, piazza Venezia, i Rostri
  var L=Math.hypot(Z[0]-A[0],Z[1]-A[1]), d=[(Z[0]-A[0])/L,(Z[1]-A[1])/L], nx=[-d[1],d[0]], rot=Math.atan2(d[0],d[1]);
  var B=new RM.Costruttore(), i, k;
  function lungo(t,lat){ var x=A[0]+d[0]*t*L+nx[0]*lat, z=A[1]+d[1]*t*L+nx[1]*lat; return [x,z,RM.h(x,z)]; }
  // la doppia fila di armati con scudi e cimieri, da una parte e dall'altra, per tutto il tratto
  for(k=0;k<2;k++) for(i=0;i<300;i++){ var t=.45+i/300*.55, p=lungo(t,(k?1:-1)*(.62+.12*(i%2))); uomo(B,p[0],p[1],p[2],C.ferro,C.rosso,rot+(k?-1:1)*Math.PI/2); }
  // davanti, i reparti che lo precedono, quattro per fila
  for(i=0;i<240;i++){ var p2=lungo(.80+(i>>2)/60*.2,((i&3)-1.5)*.13); uomo(B,p2[0],p2[1],p2[2],C.tunica,C.rosso,rot); }
  // il carro d'oro, tirato da quattro cavalli, con l'imperatore seduto solo; attorno i draghi di porpora sulle aste
  var pc=lungo(.74,0);
  B.dentro(pc[0],pc[2],pc[1],rot,function(B){
    B.scatola(.16,.09,.2,0,.07,0,C.oro).scatola(.02,.1,.1,.09,0,0,C.oro).scatola(.02,.1,.1,-.09,0,0,C.oro);             // cassa e ruote
    B.scatola(.05,.1,.04,0,.16,-.02,C.porpora).scatola(.03,.035,.03,0,.26,-.02,C.pelle);                                 // l'imperatore
  });
  for(i=0;i<4;i++){ var pcv=lungo(.74+.0016+.0005*(i>>1),((i&1)-.5)*.07); cavaliere(B,pcv[0],pcv[1],pcv[2],rot,C.bianco,C.bianco); }
  for(i=0;i<14;i++){ var pd=lungo(.70+i*.006,(i%2?1:-1)*.3); insegna(B,pd[0],pd[1],pd[2],C.porpora,.5); }
  // i clibanarii, cavalieri corazzati, sparsi dietro e ai lati del carro
  for(i=0;i<90;i++){ var pk=lungo(.48+rnd()*.24,(rnd()-.5)*.8); cavaliere(B,pk[0],pk[1],pk[2],rot,C.cavalloB,C.ferro); }
  // la folla della plebe, ai due lati, dietro gli armati
  for(i=0;i<1400;i++){ var lat=(rnd()<.5?-1:1)*(.95+rnd()*.5), pf=lungo(.45+rnd()*.55,lat); uomo(B,pf[0],pf[1],pf[2],C.folla[(rnd()*C.folla.length)|0],null,rot+(lat>0?-1:1)*Math.PI/2+(rnd()-.5)); }
  // ai Rostri, nel Foro: chi lo aspetta
  for(i=0;i<160;i++){ var a=rnd()*6.283, r=1.5+rnd()*3, x=R[0]+Math.cos(a)*r, z=R[1]+Math.sin(a)*r; uomo(B,x,z,RM.h(x,z),i<40?C.bianco:C.folla[(rnd()*C.folla.length)|0],null,Math.atan2(R[0]-x,R[1]-z)); }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:356.6, a:358, carro:[pc[0],pc[1]]};
})();

RM.moduli.push(function(anno){
  [milvio,corteo].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
});

/* ---------- regia: la vista va sul luogo dell'evento della tappa ---------- */
var perId={}; (RM.MONUMENTI||[]).forEach(function(m){ perId[m.id]=m; });
/* le due messe in scena hanno un'inquadratura fissa (punto guardato, posizione della camera): al ponte Milvio da sud, oltre il fiume, verso la riva dove fuggono;
   per il corteo da sud-est, sopra le case della via Lata */
var VISTE={ milvio:{t:[-152,-486],c:[-140,10,-466]}, corteo:{t:corteo.carro,c:[corteo.carro[0]+20,24,corteo.carro[1]+24]} };
var portata=false;                                                                      // la vista ce l'ha portata la regia
function scena(){ var s=document.getElementById('scene'); return s?s.getAttribute('data-vista'):null; }
function vista(v){
  if(v==='insieme'||v==null) return null;
  if(typeof v==='string'){ if(VISTE[v]) return VISTE[v]; var m=perId[v]; return m?[m.x,m.z,Math.max(40,(m.raggio||6)*5)]:null; }
  return v;
}
if(window.RM_pagina) RM_pagina.quando(function(i,t){
  if(document.body.classList.contains('roma-grande')) return;                            // a tutto schermo decide chi guarda
  var telefono=window.innerWidth<=1000; if(telefono && scena()!=='roma') return;         // sul telefono la città non si apre da sola
  var ev=null; (D.EVENTI||[]).forEach(function(e){ if(!ev && Math.floor(e.da)===t.anno && !t.intermezzo) ev=e; });
  var v=ev?vista(ev.vista):null;
  if(v&&v.t){ RM.volaA(v.t,v.c); portata=true; }
  else if(v){ RM.vola(v[0],v[1],v[2]); portata=true; }
  else if(portata && RM.vistaInsieme){ RM.vistaInsieme(); portata=false; }
});
})();
