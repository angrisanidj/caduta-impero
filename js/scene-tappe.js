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

/* ---------- 472: Ricimero assedia Antemio ----------
   Fonti (src/testi/scene-roma-fonti.md, sezione 1): Paolo Diacono, Historia Romana XV 3, il campo «apud Anicionis pontem» (ponte non identificato: ponte Milvio è un'ipotesi
   di Tillemont, Roberto e MacGeorge); XV 4, lo scontro a ponte Elio; Giovanni di Antiochia fr. 209 (Blockley): Ricimero chiude «la zona attorno al Tevere».
   Qui, come ipotesi dichiarata nella didascalia: il campo principale nella piana vaticana (i luoghi delle fonti sono tutti a ovest: Sessa, Roberto, MacGeorge),
   un campo piccolo all'imbocco nord di ponte Milvio, uno sbarramento di barche sul Tevere sotto l'Aventino (la forma è nostra) e la mischia su ponte Elio. */
function campo(B,cx,cz,ry,nx,nz){
  var ca=Math.cos(ry), sa=Math.sin(ry), tela=[RM.col(0xd8c9a8),RM.col(0xc4b08a),RM.col(0xb99f7c)], W=nx*1.6+1, L=nz*1.6+1;
  B.dentro(cx,RM.h(cx,cz),cz,ry,function(B){ B.scatola(W,.4,.12,0,0,-L/2,P.tronco).scatola(W,.4,.12,0,0,L/2,P.tronco).scatola(.12,.4,L,-W/2,0,0,P.tronco).scatola(.12,.4,L,W/2,0,0,P.tronco); });
  for(var i=0;i<nx;i++) for(var j=0;j<nz;j++){ if(rnd()<.2) continue; var lx=(i-(nx-1)/2)*1.6, lz=(j-(nz-1)/2)*1.6, x=cx+lx*ca+lz*sa, z=cz-lx*sa+lz*ca; B.cono(.4+.18*rnd(),.48+.2*rnd(),x,RM.h(x,z),z,tela[(rnd()*3)|0],4); }
}
var assedio472=(function(){
  var B=new RM.Costruttore(), i;
  campo(B,-206,-97,.1,8,4); campo(B,-150,-494,.3,4,3);      // il campo principale fra il portico di San Pietro e il fiume, a valle del mausoleo
  // sbarramento: barche legate di traverso al fiume sotto l'Aventino
  var curva=RM.curvaFiume, m=1e9, tm=0, q, dd; for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x+95,q.z-112); if(dd<m){ m=dd; tm=i/2400; } }
  q=curva.getPoint(tm); var tg=curva.getTangent(tm);
  B.dentro(q.x,-.55,q.z,Math.atan2(-tg.x,-tg.z),function(B){ for(var k=-6;k<=6;k++) B.scatola(.32,.16,.9,k*.95,0,0,P.tronco).scatola(.06,.6,.06,k*.95,.15,0,P.tronco); B.scatola(12.6,.05,.05,0,.32,0,P.tronco); });
  // la mischia su ponte Elio e davanti al mausoleo: due schiere che si scontrano
  (function(){      // lungo l'asse vero del ponte (perpendicolare al fiume) e sulla riva davanti al mausoleo
    var m2=1e9, t2=0, k, qq; for(k=0;k<=2400;k++){ qq=curva.getPoint(k/2400); var d2=Math.hypot(qq.x+157,qq.z+104); if(d2<m2){ m2=d2; t2=k/2400; } }
    var c2=curva.getPoint(t2), tg2=curva.getTangent(t2), ax=[-tg2.z,tg2.x], lat=[tg2.x,tg2.z], mz=[-157-c2.x,-118-c2.z];
    if(ax[0]*mz[0]+ax[1]*mz[1]<0) ax=[-ax[0],-ax[1]];      // ax punta verso il mausoleo
    for(k=0;k<240;k++){
      var s=(rnd()-.4)*15, w=(rnd()-.5)*(Math.abs(s)>7.4?6:1.1), x=c2.x+ax[0]*s+lat[0]*w, z=c2.z+ax[1]*s+lat[1]*w, sul=Math.abs(s)<=7.4;
      if(!sul && RM.distFiume(x,z)<6.2) continue;
      var dife=s>.3, ry=Math.atan2(ax[0],ax[1])+(dife?Math.PI:0);      // dalla parte del mausoleo gli uomini di Ricimero, rivolti alla città; dall'altra quelli di Antemio (colori di comodo)
      uomo(B,x,z,sul?.66:RM.h(x,z),dife?C.tunica:C.grigio,dife?C.rosso:C.grigio,ry);
    }
  })();
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:471.6, a:473};
})();

/* ---------- 593: i Longobardi di Agilulfo sotto Roma ----------
   Le fonti non dicono dove fosse il loro campo (Gregorio, Omelie su Ezechiele, prefazione al libro II e II 10, 24; Paolo Diacono IV 8): niente accampamento.
   Si vede ciò che Gregorio scrive di aver visto (Registrum V 36, giugno 595): Romani portati via «more canum in collis funibus», per essere venduti in Francia;
   qui una fila di prigionieri legati, con uomini a cavallo, sulla Flaminia verso nord (la strada è una scelta nostra), e casali che bruciano (i fuochi stanno in EVENTI). */
var prigionieri593=(function(){
  var B=new RM.Costruttore(), A=[-75.6,-206], i, t, x, z, dx=-.29, dz=-.957;      // la Flaminia fuori porta: il primo tratto di RM_TOPO.strade[0], da porta Flaminia verso nord-ovest
  for(i=0;i<46;i++){ t=8+i*.55; x=A[0]+dx*t+(i%2?.12:-.12); z=A[1]+dz*t; uomo(B,x,z,RM.h(x,z),C.folla[i%C.folla.length],null,Math.PI); }
  for(i=0;i<46;i+=2){ t=8+i*.55; x=A[0]+dx*t; z=A[1]+dz*t; B.scatola(.012,.012,.55,x,RM.h(x,z)+.17,z,P.tronco); }      // la corda che li lega, al collo
  for(i=0;i<9;i++){ t=7+i*3.2; x=A[0]+dx*t+(i%2?.7:-.7); z=A[1]+dz*t; cavaliere(B,x,z,RM.h(x,z),Math.PI,C.cavalloB,C.ferro); }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:592.6, a:594};
})();

/* ---------- 552: Narsete e il forte dei Goti al mausoleo di Adriano ----------
   Procopio VIII 33, 14-27 (Dewing, LacusCurtius): i Goti, troppo pochi per tutta la cinta, «enclosed a small part of the city with a short wall around the Tomb of Hadrian and, by connecting this
   with the earlier wall, he made a kind of fortress»; poi si arrendono a Narsete, che avanza «against the fortress with his whole army». Qui: un muro basso attorno al mausoleo, interrotto
   dove c'è il fiume (il tracciato è nostro), dal 550, quando Totila riprende Roma (la data della costruzione non è detta: ipotesi), e lo schieramento di Narsete sul lato di terra nel 552.
   Dove fosse entrato Dagisteo con le scale non si sa: non si disegna. */
var fortino552=(function(){
  var B=new RM.Costruttore(), cx=-157, cz=-118, R=7.2, n=44, i;
  for(i=0;i<n;i++){ var a=i/n*6.283, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R; if(RM.distFiume(x,z)<6.4) continue;
    B.scatola(1.1,.72,.24,x,RM.h(x,z)-.1,z,P.tufo,-a+Math.PI/2); if(i%6===0) B.scatola(.5,.96,.5,x,RM.h(x,z)-.1,z,P.tufo,-a); }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  var B2=new RM.Costruttore(), k=0;      // lo schieramento: file di fanti con le insegne, rivolte al forte, a nord-ovest, sul lato di terra
  for(var fila=0;fila<6;fila++) for(var j=-14;j<=14;j++){ var ang=-2.25+j*.028, r=R+3.2+fila*.6, x2=cx+Math.cos(ang)*r, z2=cz+Math.sin(ang)*r; if(RM.distFiume(x2,z2)<6.5) continue;
    uomo(B2,x2+(rnd()-.5)*.25,z2+(rnd()-.5)*.25,RM.h(x2,z2),fila<2?C.ferro:C.grigio,fila<3?C.rosso:null,Math.atan2(cx-x2,cz-z2)); k++;
    if(fila===5 && j%7===0) insegna(B2,x2,z2,RM.h(x2,z2),C.porpora,.42); }
  var g2=B2.maglia(RM.matPietra()); g2.visible=false; g2.castShadow=true; RM.scene.add(g2);
  return {g:g, g2:g2, da:550, a:556, da2:551.6, a2:553};
})();

/* ---------- tombe dentro le mura ----------
   Fonti (scene-roma-fonti.md, sezione 4, dal Companion to Rome c. 400-c. 1050, Brill 2026: Andrews II pp. 674-676, Spera II pp. 828-836, Stefani II pp. 839-848):
   dal V secolo, rare; nella seconda metà del VI e nel VII quasi la regola; fosse semplici, casse di mattoni, coperture «a cappuccina» di tegole, anfore per i bambini.
   Sei luoghi; le posizioni sono quelle dei monumenti, non delle singole fosse (il catalogo del 2004 non è stato letto), e il numero delle tombe disegnate è indicativo,
   tranne i 44 di Vigna Barberini. L'Athenaeum di piazza Venezia (dieci tombe, VIII secolo) sta in una sala coperta e non si vede dall'alto. */
var TOMBE=[      // [x, z, raggio, numero, dal anno, nome]
  [51,37,2.6,6,410,'valle del Colosseo'],[51,37,3.2,16,537,'valle del Colosseo'],
  [-78,160,2.2,4,455,'via Marmorata e Porticus Aemilia'],[-78,160,2.8,10,568,'via Marmorata e Porticus Aemilia'],
  [27,32,2.6,44,526,'Vigna Barberini, sul Palatino'],
  [73,146,4,26,568,'recinto delle terme di Caracalla, lato est'],
  [10,11,1.2,6,593,'atrio di Santa Maria Antiqua e casa delle Vestali']];
var tombe=TOMBE.map(function(t){
  var B=new RM.Costruttore(), coppi=P.coppi||RM.col(0xa8553a), terra=RM.col(0x8a7a62), k=0, tent=0;
  while(k<t[3] && tent<t[3]*20){ tent++;
    var a=rnd()*6.283, r=Math.sqrt(rnd())*t[2], x=t[0]+Math.cos(a)*r, z=t[1]+Math.sin(a)*r, ry=(rnd()-.5)*.6+(rnd()<.5?0:Math.PI/2), y=RM.h(x,z);
    if(rnd()<.75) B.falde(.08,.045,.21,x,y,z,coppi,ry); else B.scatola(.08,.03,.21,x,y,z,terra,ry);      // a cappuccina (due file di tegole a tetto) o fossa coperta di terra
    k++; }
  var g=B.maglia(RM.matPietra()); g.visible=false; RM.scene.add(g); return {g:g, da:t[4]};
});

RM.moduli.push(function(anno){
  [milvio,corteo,assedio472,prigionieri593].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
  tombe.forEach(function(s){ s.g.visible=anno>=s.da; });
  fortino552.g.visible=anno>=fortino552.da&&anno<fortino552.a; fortino552.g2.visible=anno>=fortino552.da2&&anno<fortino552.a2;
});

/* ---------- regia: la vista va sul luogo dell'evento della tappa ---------- */
var perId={}; (RM.MONUMENTI||[]).forEach(function(m){ perId[m.id]=m; });
/* le due messe in scena hanno un'inquadratura fissa (punto guardato, posizione della camera): al ponte Milvio da sud, oltre il fiume, verso la riva dove fuggono;
   per il corteo da sud-est, sopra le case della via Lata */
var VISTE={ milvio:{t:[-152,-486],c:[-140,10,-466]}, fortino552:{t:[-163,-126],c:[-131,30,-90]}, corteo:{t:corteo.carro,c:[corteo.carro[0]+20,24,corteo.carro[1]+24]},
  assedio472:{t:[-182,-110],c:[-143,47,-58]}, prigionieri593:{t:[-84,-232],c:[-57,33,-196]} };      // il campo vaticano e ponte Elio; la Flaminia fuori porta
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
