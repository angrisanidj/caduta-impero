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

/* ---------- aiuti per le cinque scene aggiunte il 23 novembre 2026 (274, 410, 455, 663, 852) ---------- */
function spezzata(L){      // un punto lungo una linea spezzata: t da 0 a 1, lat di lato (a sinistra positivo); ry rivolto nel verso di marcia
  var seg=[], tot=0, i; for(i=0;i<L.length-1;i++){ var l=Math.hypot(L[i+1][0]-L[i][0],L[i+1][1]-L[i][1]); seg.push(l); tot+=l; }
  return function(t,lat){ var d=Math.max(0,Math.min(1,t))*tot, k=0; while(k<seg.length-1 && d>seg[k]){ d-=seg[k]; k++; }
    var a=L[k], b=L[k+1], dx=(b[0]-a[0])/seg[k], dz=(b[1]-a[1])/seg[k], x=a[0]+dx*d-dz*(lat||0), z=a[1]+dz*d+dx*(lat||0);
    return {x:x, z:z, y:RM.h(x,z), ry:Math.atan2(dx,dz), lung:tot}; };
}
function elefante(B,x,z,y,ry){ var c=RM.col(0x8c8781); B.dentro(x,y,z,ry,function(B){
  [[-.055,-.1],[.055,-.1],[-.055,.1],[.055,.1]].forEach(function(p){ B.scatola(.05,.13,.05,p[0],0,p[1],c); });
  B.scatola(.17,.15,.34,0,.12,0,c).scatola(.11,.12,.1,0,.17,.2,c).scatola(.03,.15,.03,0,.04,.26,c); }); }
function carro(B,x,z,y,ry,carico){ B.dentro(x,y,z,ry,function(B){
  B.scatola(.13,.05,.22,0,.05,0,P.tronco).scatola(.015,.09,.09,-.075,0,0,P.tronco).scatola(.015,.09,.09,.075,0,0,P.tronco);
  if(carico) B.scatola(.11,.05,.17,0,.1,0,carico);
  B.scatola(.055,.08,.19,-.04,0,.3,C.cavalloC).scatola(.055,.08,.19,.04,0,.3,C.cavalloC); }); }
function vicinoAlFiume(px,pz){ var curva=RM.curvaFiume, m=1e9, tm=0, q, dd; for(var i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x-px,q.z-pz); if(dd<m){ m=dd; tm=i/2400; } } return curva.getPoint(tm); }
function maglia(B){ var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g); return g; }

/* ---------- 274: il trionfo di Aureliano ----------
   Eutropio IX 13 (thelatinlibrary, letto il 23 novembre 2026): «nobilem triumphum … egit praecedentibus currum Tetrico et Zenobia». Storia Augusta, Aureliano 33-34 (Magie, LacusCurtius):
   Aureliano sale al Campidoglio; venti elefanti e duecento animali; cartelli con i nomi dei popoli; Tetrico in clamide scarlatta e calzoni gallici; Zenobia coperta di gemme, in catene d'oro;
   poi il popolo, le insegne, i cavalieri corazzati. La Storia Augusta è una fonte poco sicura: elefanti e colori vengono da lei; il carro tirato da cervi che racconta non si disegna
   (qui quattro cavalli). Del percorso si mostra solo l'ultimo tratto, sulla via Sacra dall'arco di Tito al Campidoglio (la salita al Campidoglio è nella fonte; il resto è uno schema). */
var trionfo274=(function(){
  var B=new RM.Costruttore(), i, p, via=spezzata([[42,25.9],[28.1,20.6],[25.9,16.7],[21.9,12.3],[19.3,10.7],[12.5,7.5],[6.2,3],[-1.6,-1.7],[-4.4,-2.5],[-8.9,-1.7],[-13,2.2],[-18.4,5.1],[-23,3.6],[-25,2]]);      // la via Sacra di js/roma-topo.js, poi la salita al tempio
  for(i=0;i<6;i++){ p=via(.97+i*.005,(i%2?.25:-.25)); insegna(B,p.x,p.z,p.y,C.oro,.4); }                                          // i cartelli con i nomi dei popoli
  for(i=0;i<20;i++){ p=via(.80+(i>>1)*.016,(i&1?.17:-.17)); elefante(B,p.x,p.z,p.y,p.ry); }                                      // venti elefanti (Storia Augusta)
  for(i=0;i<60;i++){ p=via(.69+(i>>2)*.0068,((i&3)-1.5)*.12); uomo(B,p.x,p.z,p.y,C.folla[i%C.folla.length],null,p.ry); }           // i prigionieri dei popoli vinti
  p=via(.665,-.08); uomo(B,p.x,p.z,p.y,C.rosso,null,p.ry); p=via(.665,.08); uomo(B,p.x,p.z,p.y,C.oro,null,p.ry);                      // Tetrico in scarlatto, Zenobia in oro
  p=via(.64,0); B.dentro(p.x,p.y,p.z,p.ry,function(B){ B.scatola(.16,.09,.2,0,.07,0,C.oro).scatola(.02,.1,.1,.09,0,0,C.oro).scatola(.02,.1,.1,-.09,0,0,C.oro).scatola(.05,.1,.04,0,.16,-.02,C.porpora).scatola(.03,.035,.03,0,.26,-.02,C.pelle); });
  for(i=0;i<4;i++){ p=via(.648+.002*(i>>1),((i&1)-.5)*.07); cavaliere(B,p.x,p.z,p.y,p.ry,C.bianco,C.bianco); }
  for(i=0;i<440;i++){ p=via(.33+(i>>2)/110*.29,((i&3)-1.5)*.13); uomo(B,p.x,p.z,p.y,C.ferro,C.rosso,p.ry); }                        // l'esercito dietro il carro
  for(i=0;i<8;i++){ p=via(.36+i*.032,(i%2?.32:-.32)); insegna(B,p.x,p.z,p.y,C.rosso,.42); }
  for(i=0;i<60;i++){ p=via(.06+rnd()*.25,(rnd()-.5)*.5); cavaliere(B,p.x,p.z,p.y,p.ry,C.cavalloB,C.ferro); }                       // i cavalieri corazzati, in coda
  for(i=0;i<900;i++){ var lat=(rnd()<.5?-1:1)*(.85+rnd()*.6); p=via(rnd(),lat); uomo(B,p.x,p.z,p.y,C.folla[(rnd()*C.folla.length)|0],null,p.ry+(lat>0?-1:1)*Math.PI/2+(rnd()-.5)); }
  return {g:maglia(B), da:273.6, a:275};
})();

/* ---------- 410: i Goti entrano da porta Salaria ----------
   Procopio, Guerre III 2, 22-24 (Dewing, LacusCurtius, letto il 23 novembre 2026): Alaric «was holding them in readiness close by the Salarian Gate; for it happened that he had
   encamped there at the beginning of the siege»; i giovani aprono la porta «and received Alaric and the army into the city»; bruciano le case vicino alla porta e la casa di Sallustio
   (i fuochi stanno in EVENTI). Qui il campo fuori porta e la colonna che entra; grandezza del campo e numero degli uomini sono uno schema. */
var salaria410=(function(){
  var B=new RM.Costruttore(), G=RM_TOPO.porte['Porta Salaria'], i, s, w, x, z, o, la, dentro;
  var fuori=[-.164,-.986], verso=[-.331,.944];      // la via Salaria di js/roma-topo.js: fuori porta verso nord, dentro verso il Quirinale
  campo(B,G[0]+fuori[0]*17+5,G[1]+fuori[1]*17,Math.atan2(fuori[0],fuori[1]),9,5);
  for(i=0;i<520;i++){ s=-15+rnd()*29; o=s>=0?fuori:[-verso[0],-verso[1]]; la=[-o[1],o[0]]; dentro=Math.atan2(-o[0],-o[1]);
    w=(rnd()-.5)*(s>-1&&s<1.5?.5:Math.min(3.4,.6+Math.abs(s)*.22)); x=G[0]+o[0]*s+la[0]*w; z=G[1]+o[1]*s+la[1]*w;      // s col segno: fuori porta lungo «fuori», dentro lungo «verso»
    if(s>-1&&s<1.5){ uomo(B,x,z,RM.h(x,z),C.grigio,C.cavalloB,dentro); continue; }
    if(rnd()<.1) cavaliere(B,x,z,RM.h(x,z),dentro,C.cavalloB,C.grigio); else uomo(B,x,z,RM.h(x,z),rnd()<.6?C.grigio:C.tunica,C.cavalloB,dentro+(rnd()-.5)*.6); }
  return {g:maglia(B), da:409.6, a:411};
})();

/* ---------- 455: i Vandali portano via il bottino ----------
   Procopio, Guerre III 5, 3-5 (Dewing, LacusCurtius, letto il 23 novembre 2026): Genserico carica sulle navi l'oro e il tesoro imperiale, «having spared neither bronze nor anything else
   whatsoever in the palace»; «He plundered also the temple of Jupiter Capitolinus, and tore off half of the roof», di bronzo coperto d'oro; prende prigioniere Eudossia e le figlie.
   Qui: uomini sul tetto del tempio di Giove che ne smontano metà, le tegole dorate ammucchiate a terra, e una fila di carri e di prigionieri che esce da porta Portese verso Porto
   (Procopio dice solo che salpò con le navi: la strada e la fila sono uno schema). */
var vandali455=(function(){
  var B=new RM.Costruttore(), cx=-29, cz=0, ry=.5, c=Math.cos(ry), sn=Math.sin(ry), y0=RM.h(cx,cz)+.2, i, lx, lz, x, z;
  function mondo(lx,lz){ return [cx+lx*c+lz*sn, cz-lx*sn+lz*c]; }
  for(i=0;i<34;i++){ lx=.3+rnd()*1.9; lz=(rnd()-.5)*5; var q=mondo(lx,lz); uomo(B,q[0],q[1],y0+.3+2.8+.22+.945*(1-lx/2.35)-.02,C.tunica,null,ry+(rnd()-.5)*2); }      // sul tetto, metà verso est
  for(i=0;i<14;i++){ var q2=mondo(3.3+rnd()*.7,(rnd()-.5)*4.6); B.scatola(.22,.05+rnd()*.12,.3,q2[0],RM.h(q2[0],q2[1]),q2[1],C.oro,ry+(rnd()-.5)*.4); }      // le tegole dorate a terra
  for(i=0;i<22;i++){ var q3=mondo(3.1+rnd()*1.4,(rnd()-.5)*5); uomo(B,q3[0],q3[1],RM.h(q3[0],q3[1]),C.tunica,null,rnd()*6.28); }
  var G=RM_TOPO.porte['Porta Portese'], d=[-.838,.546], la=[-d[1],d[0]], rv=Math.atan2(d[0],d[1]);      // verso Porto (41,78 N, 12,26 E)
  for(i=0;i<70;i++){ var s=2+i*.62, w=(i%3-1)*.2; x=G[0]+d[0]*s+la[0]*w; z=G[1]+d[1]*s+la[1]*w; if(RM.distFiume(x,z)<6.3) continue;
    if(i%5===0) carro(B,x,z,RM.h(x,z),rv,i%10?C.oro:P.bronzo); else uomo(B,x,z,RM.h(x,z),i%7?C.folla[i%C.folla.length]:C.bianco,null,rv); }
  for(i=0;i<16;i++){ var s2=1+i*2.7; x=G[0]+d[0]*s2+la[0]*(i%2?.7:-.7); z=G[1]+d[1]*s2+la[1]*(i%2?.7:-.7); if(RM.distFiume(x,z)<6.3) continue; cavaliere(B,x,z,RM.h(x,z),rv,C.cavalloB,C.grigio); }
  return {g:maglia(B), da:454.6, a:456};
})();

/* ---------- 663: Costante II porta via il bronzo ----------
   Liber Pontificalis, vita di Vitaliano (Duchesne I p. 343, letto sul testo il 23 novembre 2026): «Omnia quae erant in aere ad ornatum civitatis deposuit, sed et ecclesiam beatae Mariae
   ad Martyres, quae de tegulis aereis erat, discooperuit et in regia urbe cum alia diversa quas deposuerat direxit». Qui: uomini sulla cupola del Pantheon che tolgono le tegole,
   le tegole a terra davanti al portico e i carri verso il Tevere, dove le aspetta una barca (la strada e la barca sono uno schema: la fonte dice solo che le mandò a Costantinopoli). */
var costante663=(function(){
  var B=new RM.Costruttore(), cx=-70, cz=-68, y0=RM.h(cx,cz), i, a, r, x, z;
  for(i=0;i<40;i++){ a=rnd()*6.283; r=.7+rnd()*1.45; x=cx+Math.cos(a)*r; z=cz+Math.sin(a)*r; uomo(B,x,z,y0+3.6+2.24*.44*Math.sqrt(1-r*r/(2.24*2.24))-.03,C.tunica,null,a); }
  for(i=0;i<12;i++){ a=rnd()*6.283; x=cx+Math.cos(a)*2.55; z=cz+Math.sin(a)*2.55; uomo(B,x,z,y0+3.12+(2.74-2.55)*.6,C.tunica,null,a); }
  for(i=0;i<16;i++){ x=cx+(rnd()-.5)*4; z=cz-5.4-rnd()*2.2; B.scatola(.24,.05+rnd()*.1,.3,x,RM.h(x,z),z,P.bronzo,rnd()); }      // davanti al portico, che guarda a nord
  var F=vicinoAlFiume(cx,cz-6), A=[cx,cz-7], v=[F.x-A[0],F.z-A[1]], L=Math.hypot(v[0],v[1]), d=[v[0]/L,v[1]/L], rv=Math.atan2(d[0],d[1]);
  for(i=0;i<9;i++){ var s=1+i*(L-9)/9; x=A[0]+d[0]*s; z=A[1]+d[1]*s; if(RM.distFiume(x,z)<6.3) continue; carro(B,x,z,RM.h(x,z),rv,P.bronzo); uomo(B,x-d[1]*.2,z+d[0]*.2,RM.h(x,z),C.tunica,null,rv); }
  var bx=F.x-d[0]*4.6, bz=F.z-d[1]*4.6; B.dentro(bx,-.55,bz,rv+Math.PI/2,function(B){ B.scatola(.5,.18,2.2,0,0,0,P.tronco).scatola(.04,1.1,.04,0,.18,0,P.tronco).scatola(.4,.08,.6,0,.18,.3,P.bronzo); });
  for(i=0;i<6;i++) uomo(B,F.x-d[0]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,F.z-d[1]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,RM.h(F.x-d[0]*6.8,F.z-d[1]*6.8),C.tunica,null,rv);
  return {g:maglia(B), da:662.6, a:664};
})();

/* ---------- 852: Leone IV benedice le mura nuove ----------
   Liber Pontificalis, vita di Leone IV, 72-73 (Duchesne II pp. 123-124, letto sul testo il 23 novembre 2026): vescovi, sacerdoti e tutti gli ordini del clero «per totum murorum
   ambitum, nudis pedibus, cinerem portantes in capite, circuirent», spargendo acqua benedetta «transeuntes per murum»; il papa recita tre preghiere sulle mura: sulla porta «que respicit
   ad sanctum Peregrinum», sulla postierla presso Castel Sant'Angelo e su quella «que respicit ad scolam Saxonum». Il giorno, 27 giugno 852, è quello della didascalia.
   Qui il clero in fila sul cammino delle mura (il tracciato è quello di js/monumenti.js) e il papa con il suo gruppo sopra porta San Pellegrino, la prima preghiera. */
var leone852=(function(){
  var B=new RM.Costruttore(), L=[[-163,-120],[-233.3,-121],[-250,-124],[-272,-127],[-294,-124.5],[-300,-119],[-307,-111],[-313,-100.5],[-304,-96.5],[-285,-89],[-262,-87],[-240.2,-87.7],[-212,-86.5],[-196.5,-86.7],[-187,-84]],
      via=spezzata(L), lung=via(0).lung, n=Math.round(lung/.42), i, p, PP=RM_TOPO.porte['Porta San Pellegrino'];
  for(i=0;i<n;i++){ p=via(i/n,0); if(Math.hypot(p.x-PP[0],p.z-PP[1])<1.4) continue; uomo(B,p.x,p.z,p.y+1.05,i%9?C.bianco:C.tunica,null,p.ry); }
  for(i=0;i<14;i++){ var a=i/14*6.283, x=PP[0]+Math.cos(a)*.5, z=PP[1]+Math.sin(a)*.5; uomo(B,x,z,RM.h(PP[0],PP[1])+1.05,C.bianco,null,Math.atan2(PP[0]-x,PP[1]-z)); }
  uomo(B,PP[0],PP[1],RM.h(PP[0],PP[1])+1.05,C.oro,null,0); insegna(B,PP[0]+.25,PP[1],RM.h(PP[0],PP[1])+1.05,C.oro,.4);      // il papa e la croce
  for(i=0;i<300;i++){ var t=rnd(), q=via(t,(rnd()<.5?-1:1)*(1.2+rnd()*1.6)); if(RM.distFiume(q.x,q.z)<6.3) continue; uomo(B,q.x,q.z,q.y,C.folla[(rnd()*C.folla.length)|0],null,q.ry+(rnd()-.5)*2); }      // il popolo sotto le mura
  return {g:maglia(B), da:851.6, a:853};
})();

/* ---------- 800: Carlo arriva a San Pietro ----------
   Annali del regno dei Franchi, anno 800 (thelatinlibrary, letto il 23 novembre 2026): il papa gli va incontro a Mentana, «duodecimo ab urbe lapide»; il giorno dopo, 24 novembre,
   «in gradibus basilicae beati Petri apostoli stans, missis obviam Romanae urbis vexillis, ordinatis etiam atque dispositis per congrua loca tam peregrinorum quam civium turmis, qui venienti
   laudes dicerent, ipse cum clero et episcopis equo descendentem gradusque ascendentem suscepit». Qui: il papa col clero sui gradini dell'atrio, Carlo appena sceso da cavallo,
   il seguito dei Franchi, le bandiere della città e i gruppi di pellegrini e di cittadini lungo il portico che arriva dal ponte. Da dove venisse il corteo non è detto: lo schema
   lo fa arrivare dal ponte di Sant'Angelo; numeri, colori e posti dei gruppi sono nostri. */
var carlo800=(function(){
  var B=new RM.Costruttore(), i, x, z, e=Math.PI/2, o=-Math.PI/2, Z=-108.1, franco=RM.col(0x3e5f7a);      // e: rivolti a est, verso chi arriva; o: verso la basilica
  for(i=0;i<36;i++){ x=-247.9+(i%4)*.22; z=Z-1.9+(i>>2)*.42+(rnd()-.5)*.1; uomo(B,x,z,RM.h(x,z)+.07,i<8?C.oro:C.bianco,null,e); }      // vescovi e clero
  uomo(B,-247.1,Z,RM.h(-247.1,Z)+.07,C.oro,null,e); insegna(B,-247.1,Z-.22,RM.h(-247.1,Z)+.07,C.oro,.45);                              // il papa e la croce
  B.dentro(-245.6,RM.h(-245.6,Z)+.07,Z+.35,o,function(B){ B.scatola(.055,.085,.025,0,0,.08,C.bianco).scatola(.055,.085,.025,0,0,-.08,C.bianco).scatola(.06,.07,.22,0,.08,0,C.bianco).scatola(.04,.1,.05,0,.13,.095,C.bianco).scatola(.035,.04,.09,0,.2,.135,C.bianco); });      // il cavallo, senza cavaliere
  uomo(B,-246.2,Z,RM.h(-246.2,Z)+.07,franco,null,o);                                                                                     // Carlo, sceso da cavallo, verso i gradini
  function strada(x){ return -112+(x+185)*(-4/62); }      // la strada del Borgo (js/roma-topo.js, da -185,-112 a -247,-108), a nord del portico dei pellegrini
  for(i=0;i<70;i++){ x=-244.4+(i>>1)*.42; z=strada(x)+(i&1?.22:-.22); cavaliere(B,x,z,RM.h(x,z),o,rnd()<.5?C.cavalloB:C.cavalloC,i%9?C.ferro:franco); }      // il seguito, a cavallo, sulla strada
  for(i=0;i<12;i++){ x=-242+i*3.6; z=strada(x)-(i%2?.85:1.05); insegna(B,x,z,RM.h(x,z),i%3?C.rosso:C.oro,.45); }                       // le bandiere della città
  [-239,-231,-223,-214,-205,-196,-187].forEach(function(cx,k){                                                                            // i gruppi di pellegrini e di cittadini, ai due lati
    var cz=strada(cx)+(k%2?-2.4:1.35), col=k%2?C.folla:[C.tunica,C.bianco,C.folla[2],C.folla[5]];
    for(var j=0;j<45;j++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*1.3, xx=cx+Math.cos(a)*r*1.6, zz=cz+Math.sin(a)*r*.6; if(RM.distFiume(xx,zz)<6.3) continue;
      uomo(B,xx,zz,RM.h(xx,zz),col[(rnd()*col.length)|0],null,Math.atan2(cx-xx,strada(cx)-zz)); } });
  return {g:maglia(B), da:799.6, a:801};
})();

/* ---------- 846: le navi saracene sotto San Pietro ----------
   Liber Pontificalis, vita di Sergio II, 44-47 (Duchesne II pp. 99-101, letto sul testo il 23 novembre 2026): la lettera del conte Adalberto parla di 73 navi con 500 cavalli;
   il 23 agosto sbarcano a Ostia; dopo la strage della guardia a Porto «iter assumentes navigio et pedestres simul et equestres coeperunt Romam festinare … diluculo venerunt ad loca
   ubi constituerant; ibique ex navibus examinantes equestres ecclesiam beati Petri … invaserunt»; i Romani, «sine capite positi», li affrontano armati «campo qui dicitur Neronis»
   (il testo si interrompe qui). Qui: una ventina di navi ormeggiate sulla riva destra, sotto il Borgo (il punto d'approdo non è detto: schema), i cavalieri sbarcati e quelli
   attorno alla basilica, e la milizia romana schierata nel campo di Nerone, a nord del Vaticano. I fuochi stanno in EVENTI. */
var saraceni846=(function(){
  var B=new RM.Costruttore(), curva=RM.curvaFiume, i, k, q, tg, n, x, z, scuro=RM.col(0x3b3632), vela=RM.col(0xd9d0bd);
  var t0=0, m=1e9; for(k=0;k<=2400;k++){ q=curva.getPoint(k/2400); var d0=Math.hypot(q.x+176,q.z+86); if(d0<m){ m=d0; t0=k/2400; } }
  for(i=0;i<20;i++){
    q=curva.getPoint(t0+(i-10)*.0026); tg=curva.getTangent(t0+(i-10)*.0026); n=[-tg.z,tg.x]; if(n[0]>0) n=[-n[0],-n[1]];      // n verso ovest: la riva del Vaticano
    var off=1.1+(i%2)*1.1; x=q.x+n[0]*off; z=q.z+n[1]*off;
    while(off>.5 && RM.distFiume(x,z)>2.1){ off-=.3; x=q.x+n[0]*off; z=q.z+n[1]*off; }      // sempre in acqua, anche dove il fiume si stringe
    B.dentro(x,-.55,z,Math.atan2(tg.x,tg.z)+(rnd()-.5)*.25,function(B){ B.scatola(.42,.2,2.6,0,0,0,scuro).scatola(.36,.06,2.2,0,.2,0,P.tronco).scatola(.04,1.3,.04,0,.2,.25,P.tronco).scatola(.02,.75,.9,0,.62,.25,vela); });
  }
  var SP=[-247,-108];      // i gradini dell'atrio di San Pietro
  for(i=0;i<70;i++){ var f=rnd(), a=curva.getPoint(t0), xx=a.x-9+(SP[0]-a.x+9)*f+(rnd()-.5)*5, zz=a.z+(SP[1]-a.z)*f+(rnd()-.5)*5; if(RM.distFiume(xx,zz)<6.4) continue;
    cavaliere(B,xx,zz,RM.h(xx,zz),Math.atan2(SP[0]-xx,SP[1]-zz),rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }                 // dalle navi verso la basilica
  for(i=0;i<50;i++){ var an=rnd()*6.283, r=3+rnd()*3; x=SP[0]+3+Math.cos(an)*r*1.3; z=SP[1]+Math.sin(an)*r; cavaliere(B,x,z,RM.h(x,z),rnd()*6.28,rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }      // attorno all'atrio
  for(var fila=0;fila<5;fila++) for(i=0;i<34;i++){ x=-246+i*.5+(rnd()-.5)*.15; z=-133+fila*.55; uomo(B,x,z,RM.h(x,z),fila<2?C.ferro:C.tunica,fila<3?C.rosso:null,Math.PI); }      // la milizia romana nel campo di Nerone, rivolta a sud
  for(i=0;i<5;i++) insegna(B,-243+i*3.5,-130.6,RM.h(-243+i*3.5,-130.6),C.rosso,.42);
  return {g:maglia(B), da:845.6, a:847};
})();

/* ---------- 801: il terremoto e il tetto di San Paolo ----------
   23 novembre 2026, l'utente: «quando ci sia un terremoto si muove la terra inizialmente e crolla qualcosa». Annali del regno dei Franchi, 801: la sera del 29 aprile un terremoto
   e il tetto di San Paolo crollato con le sue travi («cum ipsis trabibus», riassunto nella didascalia). Arrivati sulla basilica: la scena trema per tre secondi, il tetto cede
   durante la scossa (crepe e crolli dello shader, che prima della scossa tornano allo stato dell'800), si alza la polvere e restano a terra travi e tegole fino ai restauri (806).
   Forma e quantità dei detriti sono uno schema. Con meno animazioni niente scossa: il tetto è già crollato. */
var terremoto801=(function(){
  var o=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='paolo'; })[0]; if(!o||!o.mat) return null;
  var B=new RM.Costruttore(), c=Math.cos(o.ry), s=Math.sin(o.ry), i;
  function mondo(lx,lz){ return [o.x+lx*c+lz*s, o.z-lx*s+lz*c]; }
  for(i=0;i<46;i++){ var lx=-5.5+rnd()*11, lz=(rnd()-.5)*2.2, p=mondo(lx,lz), ry=o.ry+(rnd()-.5)*1.2;
    if(i%3) B.scatola(.12,.09,1.6+rnd()*.9,p[0],o.g.position.y+.05+rnd()*.25,p[1],P.tronco,ry); else B.scatola(.5,.08+rnd()*.12,.5,p[0],o.g.position.y+.05,p[1],P.coppi,ry); }
  var detriti=B.maglia(RM.matPietra()); detriti.visible=false; detriti.castShadow=true; RM.scene.add(detriti);
  var polvere=[], mp=new THREE.MeshBasicMaterial({color:0xcfc4b0,transparent:true,opacity:0,depthWrite:false});
  for(i=0;i<9;i++){ var q=mondo(-5+i*1.25,(rnd()-.5)*1.5), m=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),mp); m.position.set(q[0],o.g.position.y+2.4+rnd()*.8,q[1]); m.visible=false; RM.scene.add(m); polvere.push(m); }
  return {o:o, detriti:detriti, polvere:polvere, mp:mp, seq:null};
})();
var MENO_SCOSSE=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches && !/[?&]moto=1/.test(location.search);
/* La scossa, uguale per tutti i terremoti (23 novembre 2026, l'utente: «verifica che tremi anche per gli altri terremoti»): si muove il mondo, non la camera, per dur secondi,
   sempre più piano. Le scosse delle tappe: 801 (San Paolo, qui sotto) e 847, che si attraversa passando dalla tappa dell'846 a quella dell'852: è la scossa a cui il Parco del Colosseo
   attribuisce il crollo del lato sud dell'anfiteatro, e nel modello fa crollare la basilica di Massenzio (Liber Pontificalis, vita di Leone IV: un forte terremoto in quell'anno). */
var scossa=null;
function scuoti(ritardo,dur,amp){ if(MENO_SCOSSE) return; scossa={t0:performance.now()+ritardo,dur:dur,amp:amp}; }
RM.frame.push(function(){
  if(!scossa) return; var t=(performance.now()-scossa.t0)/1000; if(t<0) return;
  if(t>scossa.dur){ scossa=null; RM.scene.position.set(0,0,0); return; }
  var a=scossa.amp*(1-t/scossa.dur); RM.scene.position.set(a*Math.sin(t*47),a*.5*Math.sin(t*31+1),a*Math.cos(t*53));
});
if(window.RM_pagina) RM_pagina.quando(function(i,t){ if(!t.intermezzo && (t.anno===589||t.anno===791) && RM.ondaPiena) RM.ondaPiena(2300); });      // le due piene: l'ondata parte quando la vista è arrivata
var annoPrima=null;
RM.moduli.push(function(anno){      // 847: la scossa quando il tempo, andando avanti fra due tappe vicine, passa l'anno del terremoto
  if(annoPrima!=null && annoPrima>840 && annoPrima<847 && anno>=847 && anno-annoPrima<2) scuoti(0,2.8,.2);
  annoPrima=anno;
});
function valoriPaolo(anno){ var r=RM.rovina('paolo',anno); return {r:r.r, s:r.s, c:r.c}; }
function applicaScossa(){      // durante la sequenza: il tetto va dallo stato dell'800 a quello dell'801, la polvere sale e svanisce, la terra trema
  var T=terremoto801, q=T&&T.seq; if(!q) return;
  var t=(performance.now()-q.t0)/1000, u=T.o.mat.userData.u, k=RM.sfuma(.5,1.8,t), pre=q.pre, post=q.post;
  if(t<0){ k=0; }
  u.uRovina.value=pre.r+(post.r-pre.r)*k; u.uSpoglio.value=pre.s+(post.s-pre.s)*k; u.uCrepe.value=pre.c+(post.c-pre.c)*k;
  T.o.mat.color.copy(RM.TINTA.uso).lerp(q.col,k);
  T.detriti.visible=k>.35;
  var pv=t>.6&&t<6.5; T.mp.opacity=pv?.55*RM.sfuma(.6,1.4,t)*(1-RM.sfuma(3.5,6.5,t)):0;
  T.polvere.forEach(function(m,j){ m.visible=pv; var g=1+2.2*RM.sfuma(.6,4,t)+(j%3)*.3; m.scale.set(g,g*.7,g); m.position.y=T.o.g.position.y+2.2+1.6*RM.sfuma(.6,5,t); });
  if(t>6.5){ T.seq=null; T.mp.opacity=0; T.polvere.forEach(function(m){ m.visible=false; }); }
}
if(terremoto801){
  RM.frame.push(applicaScossa);
  if(window.RM_pagina) RM_pagina.quando(function(i,t){
    var T=terremoto801; T.seq=null;
    if(t.anno!==801 || t.intermezzo || MENO_SCOSSE) return;
    T.seq={t0:performance.now()+2300, pre:valoriPaolo(800.5), post:valoriPaolo(801), col:RM.TINTA.crollato.clone()};      // la scossa parte quando la vista è arrivata sulla basilica
    scuoti(2300,3.2,.22);
  });
}

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
  [milvio,corteo,assedio472,prigionieri593,trionfo274,salaria410,vandali455,costante663,leone852,carlo800,saraceni846].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
  tombe.forEach(function(s){ s.g.visible=anno>=s.da; });
  if(terremoto801){ terremoto801.detriti.visible=anno>=801&&anno<806; applicaScossa(); }      // le travi restano a terra fino ai restauri; durante la sequenza la scossa comanda
  fortino552.g.visible=anno>=fortino552.da&&anno<fortino552.a; fortino552.g2.visible=anno>=fortino552.da2&&anno<fortino552.a2;
});

/* ---------- regia: la vista va sul luogo dell'evento della tappa ---------- */
var perId={}; (RM.MONUMENTI||[]).forEach(function(m){ perId[m.id]=m; });
/* le due messe in scena hanno un'inquadratura fissa (punto guardato, posizione della camera): al ponte Milvio da sud, oltre il fiume, verso la riva dove fuggono;
   per il corteo da sud-est, sopra le case della via Lata */
var VISTE={ milvio:{t:[-152,-486],c:[-140,10,-466]}, fortino552:{t:[-163,-126],c:[-131,30,-90]}, corteo:{t:corteo.carro,c:[corteo.carro[0]+20,24,corteo.carro[1]+24]},
  assedio472:{t:[-182,-110],c:[-143,47,-58]}, prigionieri593:{t:[-84,-232],c:[-57,33,-196]}, trionfo274:{t:[8,8],c:[44,26,44]}, carlo800:{t:[-236,-108],c:[-212,24,-84]}, saraceni846:{t:[-214,-104],c:[-182,34,-66]} };      // il trionfo: dal Palatino verso il Campidoglio      // il campo vaticano e ponte Elio; la Flaminia fuori porta
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
  regia(t);
});
/* chiamata anche dalla riga «A Roma, in quest'anno» del telefono (js/pagina.js), dopo aver aperto la città */
RM.regiaTappa=function(t){ regia(t); };
function regia(t){
  var ev=null; (D.EVENTI||[]).forEach(function(e){ if(!ev && Math.floor(e.da)===t.anno && !t.intermezzo) ev=e; });
  var v=ev?vista(ev.vista):null;
  if(v&&v.t){ RM.volaA(v.t,v.c); portata=true; }
  else if(v){ RM.vola(v[0],v[1],v[2]); portata=true; }
  else if(portata && RM.vistaInsieme){ RM.vistaInsieme(); portata=false; }
}
})();
