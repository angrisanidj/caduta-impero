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

/* quota su cui posano figure e oggetti delle scene: la più alta fra quella esatta e quella del terreno come è disegnato, così le figure (alte 1,85 m) non finiscono dentro il terreno */
function H(x,z){ var a=RM.h(x,z); return RM.hSuolo?Math.max(a,RM.hSuolo(x,z)):a; }
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

/* ---------- scene animate (24 novembre 2026) ----------
   Prima le animazioni partivano al cambio di tappa e contavano il tempo con l'orologio del computer: sul telefono, a città chiusa, la regia non parte, e quando la scena
   non si vede RM.frame non gira; chi apriva la città dopo trovava la scena già finita. Ora una scena animata parte quando la regia porta la vista sul luogo (regia, più sotto:
   anche dal bottone «Guarda la città» del telefono) e il suo tempo avanza con il dt di RM.frame, che si ferma quando la scena non si vede.
   Una sequenza: {fine, attesa (secondi prima di partire: il volo della regia), disegna(t), visibile(), azioni:[[t, fn]]} (le azioni muovono la camera: saltano se chi guarda
   ha toccato la scena, con meno animazioni e nelle prove). Prima che parta, la scena mostra il suo quadro finale.
   Prova: ?scena=<secondi> ferma ogni scena animata a quell'istante (con ?guarda=…&anno=… di js/pagina.js). */
var MENO=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches && !/[?&]moto=1/.test(location.search);
var FERMA=(function(){ var r=/[?&]scena=([0-9.]+)/.exec(location.search); return r?+r[1]:null; })();
var ANIMA={}, SEQ=[];
function sequenza(o){ o.t=null; o.azioni=o.azioni||[]; o.attesa=o.attesa==null?1.8:o.attesa; SEQ.push(o); return o; }
function avvia(o){ o.t=FERMA!=null?FERMA:MENO?o.fine:-o.attesa; o.fatte=0; o.toccato=false; o.disegna(Math.max(0,Math.min(o.fine,o.t))); }
function quadro(o){ o.disegna(FERMA!=null?Math.min(o.fine,FERMA):o.fine); }      // la scena ferma, prima che parta o dopo
RM.frame.push(function(dt){
  SEQ.forEach(function(o){
    if(o.t==null || FERMA!=null || o.t>=o.fine || !o.visibile()) return;
    o.t+=dt;
    while(o.fatte<o.azioni.length && o.t>=o.azioni[o.fatte][0]){ if(!o.toccato && !MENO) o.azioni[o.fatte][1](); o.fatte++; }
    o.disegna(Math.max(0,Math.min(o.fine,o.t)));
  });
});
if(RM.renderer) RM.renderer.domElement.addEventListener('pointerdown',function(){ SEQ.forEach(function(o){ o.toccato=true; }); });
function fermaTutte(){ SEQ.forEach(function(o){ if(o.t!=null){ o.t=null; quadro(o); } }); }
function anima(t){ var f=!t.intermezzo && ANIMA[t.anno]; if(f) f(); }
/* figure a istanze, una maglia per gruppo di colori (i colori stanno nei vertici): fa(B) disegna una figura all'origine */
var O3=new THREE.Object3D();
function istanze(fa,N){ var B=new RM.Costruttore(); fa(B); var g=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),Math.max(1,N)); g.frustumCulled=false; g.castShadow=true; g.visible=false;
  O3.position.set(0,-50,0); O3.scale.setScalar(0); O3.updateMatrix(); for(var k=0;k<g.count;k++) g.setMatrixAt(k,O3.matrix);      // le istanze non usate restano nascoste
  RM.scene.add(g); return g; }
function metti(g,k,x,y,z,ry,s){ O3.position.set(x,y,z); O3.rotation.set(0,ry||0,0); O3.scale.setScalar(s==null?1:s); O3.updateMatrix(); g.setMatrixAt(k,O3.matrix); }

/* ---------- 312: la rotta al ponte Milvio ----------
   Il luogo: c è il centro del ponte di pietra (js/mura.js), u la direzione lungo il fiume verso valle (qui verso ovest), n quella verso nord, la riva dove l'esercito di Massenzio
   ha il fiume alle spalle. P(a,b): a lungo il fiume (positivo a valle), b verso nord. La passerella sta 32 m a monte (a=-3,2). */
var M312=(function(){
  var curva=RM.curvaFiume, m=1e9, tm=0, i, q, dd;
  for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x+152,q.z+479); if(dd<m){ m=dd; tm=i/2400; } }
  var c=curva.getPoint(tm), tg=curva.getTangent(tm), u=[tg.x,tg.z], n=[-tg.z,tg.x];
  if(n[1]>0) n=[-n[0],-n[1]];
  return {c:c, tm:tm, u:u, n:n, AP:-3.2, SUD:Math.atan2(-n[0],-n[1]),      // SUD: rivolti verso il fiume, cioè in fuga (il davanti delle figure è +z locale)
    P:function(a,b){ return [c.x+u[0]*a+n[0]*b, c.z+u[1]*a+n[1]*b]; }, rivaY:function(d){ return -.44+(d-5.45)*.012; }};
})();

/* La riva a ponte Milvio (24 novembre 2026, l'utente: «il ponte sembra staccato dal nulla»). Lì la pianura è bassa (la griglia SRTM di js/roma-topo.js dà da 1 a 4 m sotto la
   riva del Tevere in città) e il letto scavato da RM.hGrezza faceva scendere il terreno sotto il pelo dell'acqua (-0,5) per circa 45 m lungo le due rive: il fiume pareva una
   lastra sollevata dentro un fosso, e le rampe dei ponti ci scendevano dentro. Solo qui, per 800 m attorno ai due ponti, una sponda copre il fosso: all'orlo sta 60 cm sopra
   l'acqua e sale piano fino al terreno; ai due capi sfuma nel terreno. È una correzione del disegno, non un dato: quanto fossero alte le rive nel 312 non è noto. Sempre visibile. */
var riva312=(function(){
  var curva=RM.curvaFiume, L=curva.getLength(), hq=RM.hSuolo||RM.h, B=new RM.Costruttore(), verde=RM.col(0x6c7f4d), terra=RM.col(0x5f5645);
  var OFF=[5.45,6.2,7,8,9,10.5,12,14], NS=90, MEZZO=40, i, j, righe=[];
  for(i=0;i<=NS;i++){
    var sl=-MEZZO+2*MEZZO*i/NS, t=M312.tm+sl/L, p=curva.getPoint(t), g=curva.getTangent(t), nx=-g.z, nz=g.x, fine=RM.sfuma(MEZZO,MEZZO-12,Math.abs(sl)), lati=[];
    [-1,1].forEach(function(sg){ lati.push(OFF.map(function(o){ var x=p.x+nx*sg*o, z=p.z+nz*sg*o, h=hq(x,z); return [x,h+(Math.max(h+.02,M312.rivaY(o))-h)*fine,z]; })); });
    righe.push(lati);
  }
  for(i=0;i<NS;i++) for(var s=0;s<2;s++){ var A=righe[i][s], Z=righe[i+1][s];
    for(j=0;j<OFF.length-1;j++){ if(s) B.quad(A[j],A[j+1],Z[j+1],Z[j],verde); else B.quad(A[j],Z[j],Z[j+1],A[j+1],verde); }
    B.quad([A[0][0],-.9,A[0][2]],A[0],Z[0],[Z[0][0],-.9,Z[0][2]],terra);      // l'orlo verso l'acqua, fino sotto il pelo dell'acqua
  }
  var m=B.maglia(RM.matPietra()); m.castShadow=false; RM.scene.add(m); return m;
})();

/* La messa in scena del 312 (dal 24 novembre 2026 animata: l'utente, «non si vede la folla che ci sale sopra e poi crolla?»).
   Fonti: Lattanzio 44, 9, Massenzio, messo in fuga, «properat ad pontem, qui interruptus erat, ac multitudine fugientium pressus in Tiberim deturbatur»; Panegirico del 313, 16, 3
   e 17, 1: l'esercito di Massenzio schierato «a tergo Tiberi amne», la rotta «angustiis Muluii pontis»; Zosimo II 15-16 (traduzione del 1814): il ponte provvisorio di travi in due
   metà, unite al centro da ferri da togliere, cede sotto i fuggiaschi. Eusebio, Storia ecclesiastica IX 9: un ponte di barche. La scena segue Zosimo e lo dice la didascalia.
   La battaglia vera è a Saxa Rubra, circa nove miglia a nord (Aurelio Vittore 40, 23), fuori dalla scena: qui la fuga.
   In 14 secondi: i fuggiaschi corrono ai due ponti, il ponte di pietra si intasa, la passerella si riempie; all'ottavo secondo si tolgono i ferri e le due metà cadono in acqua
   con chi c'è sopra; dalla riva altri sono spinti nel fiume; la corrente porta via gli uomini in acqua, Massenzio (in porpora) fra loro. La cavalleria di Costantino (in rosso)
   incalza da nord e si ferma prima del fiume. Forma e posto della passerella, numeri, tempi, percorsi e colori sono uno schema; che Massenzio fosse a cavallo è una scelta nostra.
   Sotto, ferma, una massa di fuggiaschi più lontani dal fiume (prima metà dell'imbuto era 32 m a valle, dalla parte sbagliata: ora a monte, verso la passerella). */
var milvio=(function(){
  var B=new RM.Costruttore(), P2=M312.P, i, b, a, xz;
  for(i=0;i<1300;i++){
    b=11+Math.pow(rnd(),1.4)*7.5; a=(rnd()<.5?0:M312.AP)+(rnd()-.5)*2*(1.5+(b-10)*1.1); xz=P2(a,b);
    if(RM.distFiume(xz[0],xz[1])<6.4) continue;
    uomo(B,xz[0],xz[1],H(xz[0],xz[1]),rnd()<.75?C.tunica:C.grigio,C.grigio,M312.SUD+(rnd()-.5)*.8);
  }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:311.6, a:313};
})();
var fuga312=(function(){
  var P2=M312.P, AP=M312.AP, SUD=M312.SUD, n=M312.n, c=M312.c, TC=8, i;
  /* quote: una griglia locale (passo 10 m) con la sponda; costa meno di RM.h a ogni fotogramma */
  var X0=Math.floor(c.x-44), Z0=Math.floor(c.z-46), NX=90, NZ=96, G=new Float32Array(NX*NZ);
  for(var r=0;r<NZ;r++) for(var k=0;k<NX;k++){ var gx=X0+k, gz=Z0+r, d=RM.distFiume(gx,gz); G[r*NX+k]=Math.max(H(gx,gz),d>5.45&&d<14?M312.rivaY(d):-9); }
  function Hm(x,z){ var cx=x-X0, cz=z-Z0; if(cx<0||cz<0||cx>=NX-1||cz>=NZ-1) return H(x,z); var k=cx|0, r=cz|0, fx=cx-k, fz=cz-r, i0=r*NX+k;
    return (G[i0]*(1-fx)+G[i0+1]*fx)*(1-fz)+(G[i0+NX]*(1-fx)+G[i0+NX+1]*fx)*fz; }
  /* quota lungo il passaggio: impalcato (ponte di pietra 0,65, passerella 0,5), rampa, terreno */
  function quota(a,b,pas){ var mz=pas?7.8:7.5, ra=pas?2.6:3, yp=pas?.5:.65, ab=Math.abs(b); if(ab<=mz) return yp; var xz=P2(a,b), yt=Hm(xz[0],xz[1]); return ab<mz+ra?yp+(yt-yp)*(ab-mz)/ra:yt; }
  /* la passerella: rampe e piste fisse, due metà che ruotano attorno al loro capo a terra. Le piste di terra battuta la uniscono alla Flaminia sulle due rive (schema) */
  var BF=new RM.Costruttore(), legno=P.tronco, pista=RM.col(0x9b8a68), rp=Math.atan2(-n[1],n[0]), PC=P2(AP,0);      // rp: l'asse x locale verso nord
  BF.dentro(PC[0],0,PC[1],rp,function(B){ [-1,1].forEach(function(s){ var x0=s*7.8, x1=s*10.4, y1=Hm.apply(null,P2(AP,s*10.4))+.03;
    B.quad([x0,.5,.4],[x1,y1,.4],[x1,y1,-.4],[x0,.5,-.4],legno).quad([x0,y1-.4,.4],[x1,y1-.4,.4],[x1,y1,.4],[x0,.5,.4],legno).quad([x0,.5,-.4],[x1,y1,-.4],[x1,y1-.4,-.4],[x0,y1-.4,-.4],legno); }); });
  function piste(L){ var k, s, tot=0, seg=[]; for(k=0;k<L.length-1;k++){ var l=Math.hypot(L[k+1][0]-L[k][0],L[k+1][1]-L[k][1]); seg.push(l); tot+=l; }
    var pr=null; for(s=0;s<=tot+1e-6;s+=.5){ var d=s, j=0; while(j<seg.length-1&&d>seg[j]){ d-=seg[j]; j++; } var A=L[j], Bp=L[j+1], dx=(Bp[0]-A[0])/seg[j], dz=(Bp[1]-A[1])/seg[j], x=A[0]+dx*d, z=A[1]+dz*d;
      var cur=[[x-dz*.3,Hm(x-dz*.3,z+dx*.3)+.035,z+dx*.3],[x+dz*.3,Hm(x+dz*.3,z-dx*.3)+.035,z-dx*.3]]; if(pr) BF.quad(pr[0],cur[0],cur[1],pr[1],pista); pr=cur; } }
  piste([P2(AP,10.3),P2(AP,12.3),[-153.1,-494.5]]); piste([P2(AP,-10.3),P2(AP,-12.5),[-152.6,-462]]);      // fino alla Flaminia (strada 0 di js/roma-topo.js) a nord e a sud
  var fissa=BF.maglia(RM.matPietra()); fissa.visible=false; RM.scene.add(fissa);
  function meta(s){      // s=1 la metà nord, -1 quella sud; asse x locale dal capo a terra verso il centro, quota 0 = piano dell'impalcato
    var B=new RM.Costruttore(), dir=s>0?[-n[0],-n[1]]:[n[0],n[1]], ferro=RM.col(0x3a3a3c);
    B.scatola(7.8,.1,.8,3.9,-.1,0,legno).scatola(7.8,.22,.05,3.9,0,.38,legno).scatola(7.8,.22,.05,3.9,0,-.38,legno);
    [.8,2.2,3.6,5,6.4].concat(s>0?[7.7]:[]).forEach(function(x){ B.scatola(.14,.95,.14,x,-1,.3,legno).scatola(.14,.95,.14,x,-1,-.3,legno); });      // i cavalletti nel fiume
    B.scatola(.16,.03,.7,7.72,0,0,ferro);      // i ferri che uniscono le due metà al centro (Zosimo)
    var g=B.maglia(RM.matPietra()), pv=P2(AP,s*7.8); g.position.set(pv[0],.5,pv[1]); g.rotation.order='YXZ'; g.rotation.y=Math.atan2(-dir[1],dir[0]);
    g.castShadow=true; g.visible=false; RM.scene.add(g); return g;
  }
  var nord=meta(1), sud=meta(-1);
  /* le figure che si muovono */
  var NF=RM.leggero?160:320, F=[], tent=0;
  var corpi=[istanze(function(B){ uomo(B,0,0,0,C.tunica,C.grigio,0); },NF*2), istanze(function(B){ uomo(B,0,0,0,C.grigio,C.grigio,0); },NF*2)];
  while(F.length<NF*2 && tent++<NF*20){ var j=F.length, pas=j%2===0, aB=pas?AP:0, f={pas:pas,aB:aB,lat:(rnd()-.5)*(pas?.56:1),v:1+rnd()*.6,j:j,g:corpi[rnd()<.75?0:1]};
    if(rnd()<.3){ f.d1=0; f.rit=0; f.s0=rnd()*(pas?9:16); }      // già sulla rampa o sul ponte
    else { var b0=10.8+rnd()*7, a0=aB+(rnd()-.5)*2*(1+(b0-10)*1.1), q0=P2(a0,b0); if(RM.distFiume(q0[0],q0[1])<6.4) continue;
      f.a0=a0; f.b0=b0; f.d1=Math.hypot(a0-aB-f.lat,b0-10.5); f.rit=rnd()*2.5; f.s0=0; }
    f.stop=8.3+(j%9)*.32; f.spinto=pas&&rnd()<.3; f.tp=TC+1+(j%13)*.28; f.ry=SUD+(rnd()-.5)*.5; F.push(f); }
  var nk=[0,0]; F.forEach(function(f){ f.k=f.g===corpi[0]?nk[0]++:nk[1]++; });
  corpi.forEach(function(g,k){ g.count=nk[k]; });
  function cadi(t){ return t<TC?0:Math.min(1,Math.pow((t-TC)/.9,2)); }
  var ANG=.2;
  function prima(f,t){      // [a,b] senza il crollo
    var s=Math.max(0,t-f.rit)*f.v;
    if(s<f.d1){ var k=s/f.d1; return [f.a0+(f.aB+f.lat-f.a0)*k, f.b0+(10.5-f.b0)*k, 0]; }
    var b=10.5-(f.s0+(s-f.d1)*(f.pas?.9:.5));
    if(!f.pas) b=Math.max(b,-14-(f.j%12)*1.6);      // passato il ponte di pietra, verso Roma
    return [f.aB+f.lat, b, 1];
  }
  function inAcqua(a,b,t0,t){ var xz=P2(a+.3*Math.max(0,t-t0),b); return [xz[0],-.645,xz[1]]; }      // sotto il pelo dell'acqua resta fuori la testa; la corrente porta a valle
  function dove(f,t){      // [x,y,z]
    var p=prima(f,Math.min(t,TC)), xz;
    if(t<TC || !f.pas || p[1]<-7.8){ p=prima(f,t); xz=P2(p[0],p[1]); return [xz[0],p[2]?quota(p[0],p[1],f.pas):Hm(xz[0],xz[1]),xz[1]]; }
    if(p[2] && p[1]<=7.8){      // sull'impalcato quando cede: scende con la sua metà, poi è in acqua
      var r=7.8-Math.abs(p[1]), y=.5-r*Math.sin(ANG*cadi(t)), bb=p[1]*(1-.25*cadi(t)); xz=P2(p[0],bb);
      return y>-.645?[xz[0],y,xz[1]]:inAcqua(p[0],bb,TC+.6,t);
    }
    p=prima(f,t); var b=Math.max(p[1],f.stop);      // non ancora sull'impalcato: si ferma sul capo spezzato
    if(f.spinto && b<=f.stop+.01 && t>f.tp){ var kp=Math.min(1,(t-f.tp)/.6); if(kp>=1) return inAcqua(p[0],5,f.tp+.6,t);      // Lattanzio: spinti nel fiume dalla folla
      var b2=b-(b-5)*kp; xz=P2(p[0],b2); return [xz[0],quota(p[0],b,true)*(1-kp)-.645*kp,xz[1]]; }
    xz=P2(p[0],b); return [xz[0],p[2]?quota(p[0],b,true):Hm(xz[0],xz[1]),xz[1]];
  }
  /* la cavalleria di Costantino, le insegne e Massenzio */
  var NC=RM.leggero?80:160, K=[], cav=[istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.rosso); },NC), istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.rosso); },NC)];
  for(i=0;i<NC*2&&K.length<NC*2;i++){ var sc=i%3, a1=(rnd()-.5)*30+(sc-1)*8, b1=25+sc*3+rnd()*6, st=19.5+sc*1.6+rnd()*1.5, p1=P2(a1,st), p0=P2(a1,b1);
    if(RM.distFiume(p1[0],p1[1])<6.4||RM.distFiume(p0[0],p0[1])<6.4) continue; K.push({a:a1,b0:b1,stop:st,g:cav[K.length%2],k:K.length>>1,ry:SUD+(rnd()-.5)*.3}); }
  cav[0].count=Math.ceil(K.length/2); cav[1].count=Math.floor(K.length/2);
  var ins=istanze(function(B){ insegna(B,0,0,0,C.rosso,.42); },9), INS=[]; for(i=0;i<9;i++) INS.push({a:(i-4)*3.4,b0:29+rnd()*4,stop:23.5+rnd()*1.5});
  var mass=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.porpora); },1);
  /* gli spruzzi quando le due metà battono sull'acqua */
  var mSpr=new THREE.MeshBasicMaterial({color:0xe9eef0,transparent:true,opacity:0,depthWrite:false}), spr=[];
  for(i=0;i<8;i++){ var ps=P2(AP+(rnd()-.5)*1.2,(i-3.5)*1.1), sm=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),mSpr); sm.position.set(ps[0],-.5,ps[1]); sm.visible=false; RM.scene.add(sm); spr.push(sm); }
  function disegna(t){
    var ang=ANG*cadi(t); nord.rotation.z=-ang; sud.rotation.z=-ang;
    F.forEach(function(f){ var p=dove(f,t); metti(f.g,f.k,p[0],p[1],p[2],f.ry); });
    K.forEach(function(k2){ var b=Math.max(k2.stop,k2.b0-t*1.1), p=P2(k2.a,b); metti(k2.g,k2.k,p[0],Hm(p[0],p[1]),p[1],k2.ry); });
    INS.forEach(function(s,j){ var b=Math.max(s.stop,s.b0-t*1.1), p=P2(s.a,b); metti(ins,j,p[0],Hm(p[0],p[1]),p[1],0); });
    var bm=Math.max(2.8,12-t*1.15), am=AP+.4*Math.min(1,t/4), pm, ym;      // Massenzio arriva sul mezzo della passerella quando cede
    if(t<TC){ pm=P2(am,bm); ym=bm>10.4?Hm(pm[0],pm[1]):quota(am,bm,true); }
    else { var rr=7.8-bm, yy=.5-rr*Math.sin(ANG*cadi(t)), b3=bm*(1-.25*cadi(t)); pm=P2(am+.3*Math.max(0,t-TC-.6),b3); ym=Math.max(-.645,yy); }
    metti(mass,0,pm[0],ym,pm[1],SUD,t>TC+3?Math.max(0,1-(t-TC-3)):1);      // annega
    var ks=(t-TC-.25)/1.5; mSpr.opacity=ks>0&&ks<1?.75*(1-ks):0; spr.forEach(function(sm,j){ sm.visible=ks>0&&ks<1; var g=.4+1.6*Math.sqrt(Math.max(0,ks))+(j%3)*.2; sm.scale.set(g,g*.55,g); });
    corpi.concat(cav,[ins,mass]).forEach(function(g){ g.instanceMatrix.needsUpdate=true; });
  }
  var tutte=corpi.concat(cav,[ins,mass,nord,sud,fissa]);
  var o=sequenza({fine:14, attesa:1.8, disegna:disegna, visibile:function(){ return fissa.visible; },
    azioni:[[6.3,function(){ var q=P2(AP+10,15), v=RM.adatta({t:P2(AP,2),c:[q[0],Hm(q[0],q[1])+7,q[1]]}); RM.volaA(v.t,v.c,2.2); }]]});      // da vicino, sulla passerella che sta per cedere
  /* la vista della regia: da nord, dietro la cavalleria di Costantino, verso i ponti e la città (prima guardava a nord, verso il bordo del disegno) */
  var vt=P2(-1.6,3), vc=P2(7,34);
  return {seq:o, tutte:tutte, da:311.6, a:313, vista:{t:vt,c:[vc[0],Hm(vc[0],vc[1])+19,vc[1]]}};
})();
ANIMA[312]=function(){ avvia(fuga312.seq); };

/* ---------- 357: l'ingresso di Costanzo II lungo la via Lata ---------- */
var corteo=(function(){
  var A=RM.ll(41.9110,12.4763), Z=RM.ll(41.8960,12.4823), R=[-4,-2];                     // porta Flaminia, piazza Venezia, i Rostri
  var L=Math.hypot(Z[0]-A[0],Z[1]-A[1]), d=[(Z[0]-A[0])/L,(Z[1]-A[1])/L], nx=[-d[1],d[0]], rot=Math.atan2(d[0],d[1]);
  var B=new RM.Costruttore(), i, k;
  function lungo(t,lat){ var x=A[0]+d[0]*t*L+nx[0]*lat, z=A[1]+d[1]*t*L+nx[1]*lat; return [x,z,H(x,z)]; }
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
  for(i=0;i<160;i++){ var a=rnd()*6.283, r=1.5+rnd()*3, x=R[0]+Math.cos(a)*r, z=R[1]+Math.sin(a)*r; uomo(B,x,z,H(x,z),i<40?C.bianco:C.folla[(rnd()*C.folla.length)|0],null,Math.atan2(R[0]-x,R[1]-z)); }
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
  B.dentro(cx,H(cx,cz),cz,ry,function(B){ B.scatola(W,.4,.12,0,0,-L/2,P.tronco).scatola(W,.4,.12,0,0,L/2,P.tronco).scatola(.12,.4,L,-W/2,0,0,P.tronco).scatola(.12,.4,L,W/2,0,0,P.tronco); });
  for(var i=0;i<nx;i++) for(var j=0;j<nz;j++){ if(rnd()<.2) continue; var lx=(i-(nx-1)/2)*1.6, lz=(j-(nz-1)/2)*1.6, x=cx+lx*ca+lz*sa, z=cz-lx*sa+lz*ca; B.cono(.4+.18*rnd(),.48+.2*rnd(),x,H(x,z),z,tela[(rnd()*3)|0],4); }
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
    if(RM.ponteElio){ c2={x:RM.ponteElio.x,z:RM.ponteElio.z}; ax=RM.ponteElio.asse.slice(); lat=[-ax[1],ax[0]]; mz=[-157-c2.x,-118-c2.z]; }      // l'asse del ponte com'è disegnato (js/mura.js)
    if(ax[0]*mz[0]+ax[1]*mz[1]<0) ax=[-ax[0],-ax[1]];      // ax punta verso il mausoleo
    for(k=0;k<240;k++){
      var s=(rnd()-.4)*15, w=(rnd()-.5)*(Math.abs(s)>7.4?6:1.1), x=c2.x+ax[0]*s+lat[0]*w, z=c2.z+ax[1]*s+lat[1]*w, sul=Math.abs(s)<=7.4;
      if(!sul && RM.distFiume(x,z)<6.2) continue;
      var dife=s>.3, ry=Math.atan2(ax[0],ax[1])+(dife?Math.PI:0);      // dalla parte del mausoleo gli uomini di Ricimero, rivolti alla città; dall'altra quelli di Antemio (colori di comodo)
      uomo(B,x,z,sul?.66:H(x,z),dife?C.tunica:C.grigio,dife?C.rosso:C.grigio,ry);
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
  /* 23 novembre 2026, l'utente: «mostra di più i prigionieri catturati come descritto». Ora sono molti di più, in due file, a gruppi di dieci legati alla stessa corda al collo
     , uomini, donne e ragazzi; ai lati le guardie longobarde a cavallo e a piedi. Quanti fossero non è scritto: è uno schema */
  var ry=Math.atan2(dx,dz), px=-dz, pz=dx, fila, k, y;
  for(fila=-1;fila<=1;fila+=2) for(i=0;i<90;i++){ t=6+i*.32; x=A[0]+dx*t+px*fila*.16; z=A[1]+dz*t+pz*fila*.16; y=H(x,z);
    var bimbo=i%7===3; B.dentro(x,y,z,ry,function(B){ var h=bimbo?.7:1; B.scatola(.05,.15*h,.035,0,0,0,C.folla[(i*3+fila+5)%C.folla.length]).scatola(.03,.035,.03,0,.15*h,0,C.pelle); });
    if(i%10!==9){ var x2=A[0]+dx*(t+.32)+px*fila*.16, z2=A[1]+dz*(t+.32)+pz*fila*.16; B.scatola(.012,.012,.32,(x+x2)/2,(y+H(x2,z2))/2+.142,(z+z2)/2,RM.col(0x4a3a28),ry); } }      // la corda al collo, da un prigioniero al seguente
  for(i=0;i<16;i++){ t=4+i*2; k=i%2?1:-1; x=A[0]+dx*t+px*k*.9; z=A[1]+dz*t+pz*k*.9; cavaliere(B,x,z,H(x,z),ry+Math.PI,C.cavalloB,C.ferro); }      // guardie a cavallo
  for(i=0;i<14;i++){ t=5+i*2.2; k=i%2?-1:1; x=A[0]+dx*t+px*k*.5; z=A[1]+dz*t+pz*k*.5; y=H(x,z); uomo(B,x,z,y,C.ferro,C.cavalloB,ry+Math.PI); B.scatola(.008,.3,.008,x+.03,y,z,P.tronco); }      // guardie a piedi con la lancia
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:592.6, a:594};
})();

/* ---------- aiuti per le cinque scene aggiunte il 23 novembre 2026 (274, 410, 455, 663, 852) ---------- */
function spezzata(L){      // un punto lungo una linea spezzata: t da 0 a 1, lat di lato (a sinistra positivo); ry rivolto nel verso di marcia
  var seg=[], tot=0, i; for(i=0;i<L.length-1;i++){ var l=Math.hypot(L[i+1][0]-L[i][0],L[i+1][1]-L[i][1]); seg.push(l); tot+=l; }
  return function(t,lat){ var d=Math.max(0,Math.min(1,t))*tot, k=0; while(k<seg.length-1 && d>seg[k]){ d-=seg[k]; k++; }
    var a=L[k], b=L[k+1], dx=(b[0]-a[0])/seg[k], dz=(b[1]-a[1])/seg[k], x=a[0]+dx*d-dz*(lat||0), z=a[1]+dz*d+dx*(lat||0);
    return {x:x, z:z, y:H(x,z), ry:Math.atan2(dx,dz), lung:tot}; };
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
    if(s>-1&&s<1.5){ uomo(B,x,z,H(x,z),C.grigio,C.cavalloB,dentro); continue; }
    if(rnd()<.1) cavaliere(B,x,z,H(x,z),dentro,C.cavalloB,C.grigio); else uomo(B,x,z,H(x,z),rnd()<.6?C.grigio:C.tunica,C.cavalloB,dentro+(rnd()-.5)*.6); }
  return {g:maglia(B), da:409.6, a:411};
})();

/* ---------- 455: i Vandali portano via il bottino ----------
   Procopio, Guerre III 5, 3-5 (Dewing, LacusCurtius, letto il 23 novembre 2026): Genserico carica sulle navi l'oro e il tesoro imperiale, «having spared neither bronze nor anything else
   whatsoever in the palace»; «He plundered also the temple of Jupiter Capitolinus, and tore off half of the roof», di bronzo coperto d'oro; prende prigioniere Eudossia e le figlie.
   Qui: uomini sul tetto del tempio di Giove che ne smontano metà, le tegole dorate ammucchiate a terra, e una fila di carri e di prigionieri che esce da porta Portese verso Porto
   (Procopio dice solo che salpò con le navi: la strada e la fila sono uno schema). */
var vandali455=(function(){
  var B=new RM.Costruttore(), cx=-29, cz=0, ry=.5, c=Math.cos(ry), sn=Math.sin(ry), y0=H(cx,cz)+.2, i, lx, lz, x, z;
  function mondo(lx,lz){ return [cx+lx*c+lz*sn, cz-lx*sn+lz*c]; }
  for(i=0;i<34;i++){ lx=.3+rnd()*1.9; lz=(rnd()-.5)*5; var q=mondo(lx,lz); uomo(B,q[0],q[1],y0+.3+2.8+.22+.945*(1-lx/2.35)-.02,C.tunica,null,ry+(rnd()-.5)*2); }      // sul tetto, metà verso est
  for(i=0;i<14;i++){ var q2=mondo(3.3+rnd()*.7,(rnd()-.5)*4.6); B.scatola(.22,.05+rnd()*.12,.3,q2[0],H(q2[0],q2[1]),q2[1],C.oro,ry+(rnd()-.5)*.4); }      // le tegole dorate a terra
  for(i=0;i<22;i++){ var q3=mondo(3.1+rnd()*1.4,(rnd()-.5)*5); uomo(B,q3[0],q3[1],H(q3[0],q3[1]),C.tunica,null,rnd()*6.28); }
  var G=RM_TOPO.porte['Porta Portese'], d=[-.838,.546], la=[-d[1],d[0]], rv=Math.atan2(d[0],d[1]);      // verso Porto (41,78 N, 12,26 E)
  for(i=0;i<70;i++){ var s=2+i*.62, w=(i%3-1)*.2; x=G[0]+d[0]*s+la[0]*w; z=G[1]+d[1]*s+la[1]*w; if(RM.distFiume(x,z)<6.3) continue;
    if(i%5===0) carro(B,x,z,H(x,z),rv,i%10?C.oro:P.bronzo); else uomo(B,x,z,H(x,z),i%7?C.folla[i%C.folla.length]:C.bianco,null,rv); }
  for(i=0;i<16;i++){ var s2=1+i*2.7; x=G[0]+d[0]*s2+la[0]*(i%2?.7:-.7); z=G[1]+d[1]*s2+la[1]*(i%2?.7:-.7); if(RM.distFiume(x,z)<6.3) continue; cavaliere(B,x,z,H(x,z),rv,C.cavalloB,C.grigio); }
  return {g:maglia(B), da:454.6, a:456};
})();

/* ---------- 663: Costante II porta via il bronzo ----------
   Liber Pontificalis, vita di Vitaliano (Duchesne I p. 343, letto sul testo il 23 novembre 2026): «Omnia quae erant in aere ad ornatum civitatis deposuit, sed et ecclesiam beatae Mariae
   ad Martyres, quae de tegulis aereis erat, discooperuit et in regia urbe cum alia diversa quas deposuerat direxit». Qui: uomini sulla cupola del Pantheon che tolgono le tegole,
   le tegole a terra davanti al portico e i carri verso il Tevere, dove le aspetta una barca (la strada e la barca sono uno schema: la fonte dice solo che le mandò a Costantinopoli). */
var costante663=(function(){
  var B=new RM.Costruttore(), cx=-70, cz=-68, y0=H(cx,cz), i, a, r, x, z;
  for(i=0;i<40;i++){ a=rnd()*6.283; r=.7+rnd()*1.45; x=cx+Math.cos(a)*r; z=cz+Math.sin(a)*r; uomo(B,x,z,y0+3.6+2.24*.44*Math.sqrt(1-r*r/(2.24*2.24))-.03,C.tunica,null,a); }
  for(i=0;i<12;i++){ a=rnd()*6.283; x=cx+Math.cos(a)*2.55; z=cz+Math.sin(a)*2.55; uomo(B,x,z,y0+3.12+(2.74-2.55)*.6,C.tunica,null,a); }
  for(i=0;i<16;i++){ x=cx+(rnd()-.5)*4; z=cz-5.4-rnd()*2.2; B.scatola(.24,.05+rnd()*.1,.3,x,H(x,z),z,P.bronzo,rnd()); }      // davanti al portico, che guarda a nord
  var F=vicinoAlFiume(cx,cz-6), A=[cx,cz-7], v=[F.x-A[0],F.z-A[1]], L=Math.hypot(v[0],v[1]), d=[v[0]/L,v[1]/L], rv=Math.atan2(d[0],d[1]);
  for(i=0;i<9;i++){ var s=1+i*(L-9)/9; x=A[0]+d[0]*s; z=A[1]+d[1]*s; if(RM.distFiume(x,z)<6.3) continue; carro(B,x,z,H(x,z),rv,P.bronzo); uomo(B,x-d[1]*.2,z+d[0]*.2,H(x,z),C.tunica,null,rv); }
  var bx=F.x-d[0]*4.6, bz=F.z-d[1]*4.6; B.dentro(bx,-.55,bz,rv+Math.PI/2,function(B){ B.scatola(.5,.18,2.2,0,0,0,P.tronco).scatola(.04,1.1,.04,0,.18,0,P.tronco).scatola(.4,.08,.6,0,.18,.3,P.bronzo); });
  for(i=0;i<6;i++) uomo(B,F.x-d[0]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,F.z-d[1]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,H(F.x-d[0]*6.8,F.z-d[1]*6.8),C.tunica,null,rv);
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
  for(i=0;i<14;i++){ var a=i/14*6.283, x=PP[0]+Math.cos(a)*.5, z=PP[1]+Math.sin(a)*.5; uomo(B,x,z,H(PP[0],PP[1])+1.05,C.bianco,null,Math.atan2(PP[0]-x,PP[1]-z)); }
  uomo(B,PP[0],PP[1],H(PP[0],PP[1])+1.05,C.oro,null,0); insegna(B,PP[0]+.25,PP[1],H(PP[0],PP[1])+1.05,C.oro,.4);      // il papa e la croce
  for(i=0;i<300;i++){ var t=rnd(), q=via(t,(rnd()<.5?-1:1)*(1.2+rnd()*1.6)); if(RM.distFiume(q.x,q.z)<6.3) continue; uomo(B,q.x,q.z,q.y,C.folla[(rnd()*C.folla.length)|0],null,q.ry+(rnd()-.5)*2); }      // il popolo sotto le mura
  return {g:maglia(B), da:851.6, a:853};
})();

/* ---------- 800: Carlo arriva a San Pietro ----------
   Annali del regno dei Franchi, anno 800 (thelatinlibrary, letto il 23 novembre 2026): il papa gli va incontro a Mentana, «duodecimo ab urbe lapide»; il giorno dopo, 24 novembre,
   «in gradibus basilicae beati Petri apostoli stans, missis obviam Romanae urbis vexillis, ordinatis etiam atque dispositis per congrua loca tam peregrinorum quam civium turmis, qui venienti
   laudes dicerent, ipse cum clero et episcopis equo descendentem gradusque ascendentem suscepit». Qui: il papa col clero sui gradini dell'atrio, Carlo appena sceso da cavallo,
   il seguito dei Franchi, le bandiere della città e i gruppi di pellegrini e di cittadini lungo il portico che arriva dal ponte. Da dove venisse il corteo non è detto: lo schema
   lo fa arrivare dal ponte di Sant'Angelo; numeri, colori e posti dei gruppi sono nostri.
   Dal 24 novembre 2026 il corteo si muove (l'utente: «si deve vedere il corteo che entra»): in 24 secondi esce dal Campo Marzio lungo la via Recta, passa ponte Elio, gira davanti
   alla porta del mausoleo e risale accanto al portico fino ai gradini; in testa sei portatori con le bandiere della città («missis obviam … vexillis»: andate incontro, qui tornano
   davanti a lui), poi Carlo e il seguito. Ai gradini le bandiere si aprono, Carlo scende da cavallo e sale verso il papa («equo descendentem gradusque ascendentem»).
   Il corteo cammina sul lato nord del portico, che è coperto: dentro, dall'alto, non si vedrebbe. Strada, durata, ordine del corteo e numeri sono uno schema. */
var V800=(function(){
  /* il percorso: la via Recta di js/roma-topo.js (RM.STRADE[7]) fino a ponte Elio, il ponte (RM.ponteElio), la porta del mausoleo, poi una corsia 10 m a nord dell'asse del portico
     (porticopietro in js/monumenti.js: x -201,75, z -108,1, ry 0,0685) fino al sagrato */
  var CORSIA=1.0, PE=RM.ponteElio||{x:-156.1,z:-104.37,asse:[-.059,-.998]};
  function zAsse(x){ return -108.1-(x+201.75)*Math.tan(.0685); }
  var L=[[-110.2,-88.5],[-150,-90],[PE.x-PE.asse[0]*8.6,PE.z-PE.asse[1]*8.6],[PE.x+PE.asse[0]*6.4,PE.z+PE.asse[1]*6.4],[-159.5,zAsse(-159.5)-CORSIA],[-243,zAsse(-243)-CORSIA],[-245.4,-108]];
  return {L:L, zAsse:zAsse, CORSIA:CORSIA, PE:PE};
})();
var carlo800=(function(){
  var B=new RM.Costruttore(), i, x, z, e=Math.PI/2, Z=-108.1, franco=RM.col(0x3e5f7a), zA=V800.zAsse, CO=V800.CORSIA;      // e: rivolti a est, verso chi arriva
  for(i=0;i<36;i++){ x=-247.9+(i%4)*.22; z=Z-1.9+(i>>2)*.42+(rnd()-.5)*.1; uomo(B,x,z,H(x,z)+.07,i<8?C.oro:C.bianco,null,e); }      // vescovi e clero
  uomo(B,-247.1,Z,H(-247.1,Z)+.07,C.oro,null,e); insegna(B,-247.1,Z-.22,H(-247.1,Z)+.07,C.oro,.45);                              // il papa e la croce
  /* le bandiere della città («vexilla», Annali dei Franchi, 800): più grandi e più numerose (23 novembre 2026, l'utente: «metti delle bandiere»), lungo il lato nord della corsia
     e fra le colonne del portico; colori e forma sono uno schema */
  function bandiera(B,x,z,y,col,alta){ B.scatola(.016,alta,.016,x,y,z,P.tronco).scatola(.17,.12,.01,x+.085,y+alta-.13,z,col).scatola(.06,.05,.01,x+.03,y+alta-.18,z,col); }
  for(i=0;i<26;i++){ x=-242+i*1.75; z=zA(x)-(i%2?CO+.5:.66); bandiera(B,x,z,H(x,z),[C.rosso,C.oro,C.bianco,C.porpora][i%4],.55); }
  [-239,-231,-223,-214,-205,-196,-187].forEach(function(cx,k){                                                                            // i gruppi di pellegrini e di cittadini, «per congrua loca»
    var cz=zA(cx)-CO-(k%2?2.3:1.25), col=k%2?C.folla:[C.tunica,C.bianco,C.folla[2],C.folla[5]];
    for(var j=0;j<45;j++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*1.2, xx=cx+Math.cos(a)*r*1.6, zz=cz+Math.sin(a)*r*.45; if(RM.distFiume(xx,zz)<6.3) continue;
      uomo(B,xx,zz,H(xx,zz),col[(rnd()*col.length)|0],null,Math.atan2(cx-xx,zA(cx)-CO-zz)); } });
  var g=maglia(B);
  /* il corteo, a istanze; via(t,lat) dà punto e verso lungo il percorso */
  var via=spezzata(V800.L), LUN=via(0).lung, D=108.8, FINE=24, VIAGGIO=20;
  var cav=[istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.ferro); },35), istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.ferro); },35)];
  var capi=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,franco); },8);      // qualche cavaliere dei Franchi in blu, come prima
  var band=[C.rosso,C.oro,C.bianco,C.porpora].map(function(col){ return istanze(function(B){ uomo(B,0,0,0,C.tunica,null,0); bandiera(B,.03,0,0,col,.55); },2); });
  var re=istanze(function(B){ cavaliere(B,0,0,0,0,C.bianco,franco); },1), cavallo=istanze(function(B){      // il cavallo, senza cavaliere
    B.scatola(.055,.085,.025,0,0,.08,C.bianco).scatola(.055,.085,.025,0,0,-.08,C.bianco).scatola(.06,.07,.22,0,.08,0,C.bianco).scatola(.04,.1,.05,0,.13,.095,C.bianco).scatola(.035,.04,.09,0,.2,.135,C.bianco); },1);
  var aPiedi=istanze(function(B){ uomo(B,0,0,0,franco,null,0); },1);
  function y(p){ var d=RM.distFiume(p.x,p.z); return d<7.5?.66:Math.max(p.y,.66-(d-7.5)*.33); }      // sul piano di ponte Elio (0,65, js/mura.js), poi giù per la rampa
  function sC(t){ var k=Math.min(1,t/VIAGGIO); return LUN+D*(k*k*(3-2*k)-1); }      // dove sta Carlo lungo il percorso
  function posa(gm,k,s,lat,ry){ var p=via(Math.max(0,s)/LUN,lat); metti(gm,k,p.x,y(p),p.z,ry==null?p.ry:ry); return p; }
  function disegna(t){
    var s=sC(t), scende=t>=VIAGGIO+.3, apre=RM.sfuma(VIAGGIO-2.5,VIAGGIO,t), i, nb=[0,0,0,0], pf=via(1,0);
    for(i=0;i<70;i++){ var row=i>>1, gm=(i%9===4)?capi:cav[i&1], kk=gm===capi?(i/9)|0:(i>>1); posa(gm,kk,s-1-row*.42,(i&1)?.13:-.13); }
    for(i=0;i<6;i++){ var c=i%4, sb=Math.min(s+1.3+(i>>1)*.5,LUN-.4-(i>>1)*.5); posa(band[c],nb[c]++,sb,((i&1)?1:-1)*(.13+.8*apre)); }
    if(!scende){ posa(re,0,s,0); metti(cavallo,0,0,-50,0,0,0); metti(aPiedi,0,0,-50,0,0,0); }
    else { metti(re,0,0,-50,0,0,0); metti(cavallo,0,pf.x,H(pf.x,pf.z),pf.z,pf.ry);      // sceso da cavallo, sale i gradini fino al papa
      var ks=RM.sfuma(VIAGGIO+1,FINE,t), xa=-245.8+(-246.8+245.8)*ks; metti(aPiedi,0,xa,H(xa,-108.1)+.07*ks,-108.1-.3*(1-ks),-Math.PI/2); }
    cav.concat([capi,re,cavallo,aPiedi],band).forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
  }
  var tutte=[g].concat(cav,[capi,re,cavallo,aPiedi],band), F=function(){ return RM.fattoreVista(); };
  function inquadra(t){ var p=via(Math.max(0,sC(t)-3)/LUN,0), y0=H(p.x,p.z)+1, f=F(); return {t:[p.x,y0,p.z], c:[p.x+18*f,y0+15*f,p.z-20*f]}; }      // da nord-est: il portico, a sud, non copre il corteo
  var o=sequenza({fine:FINE, attesa:1.8, disegna:disegna, visibile:function(){ return g.visible; },
    azioni:[[0,function(){ RM.segui(function(k){ return inquadra(k*VIAGGIO); },VIAGGIO); }],
            [VIAGGIO,function(){ var v=RM.adatta({t:[-244,-107.5],c:[-231,9,-118]}); RM.volaA(v.t,v.c,2.5); }]]});
  var v0=inquadra(0);
  return {g:g, tutte:tutte, seq:o, da:799.6, a:801, vista:{t:[v0.t[0],v0.t[2]],c:[v0.t[0]+18,v0.t[1]+15,v0.t[2]-20]}};
})();
ANIMA[800]=function(){ avvia(carlo800.seq); };

/* ---------- 846: le navi saracene sotto San Pietro ----------
   Liber Pontificalis, vita di Sergio II, 44-47 (Duchesne II pp. 99-101, letto sul testo il 23 novembre 2026): la lettera del conte Adalberto parla di 73 navi con 500 cavalli;
   il 23 agosto sbarcano a Ostia; dopo la strage della guardia a Porto «iter assumentes navigio et pedestres simul et equestres coeperunt Romam festinare … diluculo venerunt ad loca
   ubi constituerant; ibique ex navibus examinantes equestres ecclesiam beati Petri … invaserunt»; i Romani, «sine capite positi», li affrontano armati «campo qui dicitur Neronis»
   (il testo si interrompe qui). Qui: una ventina di navi ormeggiate sulla riva destra, sotto il Borgo (il punto d'approdo non è detto: schema), i cavalieri sbarcati e quelli
   attorno alla basilica, e la milizia romana schierata nel campo di Nerone, a nord del Vaticano. I fuochi stanno in EVENTI. */
var saraceni846=(function(){
  var B=new RM.Costruttore(), curva=RM.curvaFiume, i, k, q, tg, n, x, z, scuro=RM.col(0x3b3632), vela=RM.col(0xd9d0bd);
  var t0=0, m=1e9; for(k=0;k<=2400;k++){ q=curva.getPoint(k/2400); var d0=Math.hypot(q.x+176,q.z+86); if(d0<m){ m=d0; t0=k/2400; } }
  /* le navi: ognuna una maglia a sé, perché all'arrivo della tappa risalgono il Tevere da valle fino all'ormeggio (23 novembre 2026, l'utente: «fai vedere prima la flotta saracena che
     arriva»; LP: «iter assumentes navigio»). Il punto da cui partono, una settantina di metri più a valle, e la durata sono uno schema */
  var NB=new RM.Costruttore(); NB.dentro(0,0,0,0,function(B){ B.scatola(.42,.2,2.6,0,0,0,scuro).scatola(.36,.06,2.2,0,.2,0,P.tronco).scatola(.04,1.3,.04,0,.2,.25,P.tronco).scatola(.02,.75,.9,0,.62,.25,vela); });
  var geoNave=NB.geometria(), matNave=RM.matPietra(), navi=[];
  for(i=0;i<20;i++){ var nv=new THREE.Mesh(geoNave,matNave); nv.castShadow=true; navi.push({m:nv, t:t0+(i-10)*.0026, off:1.1+(i%2)*1.1, gira:(rnd()-.5)*.25}); }
  function posa(nv,t){ var q=curva.getPoint(Math.max(0,Math.min(1,t))), tg=curva.getTangent(Math.max(0,Math.min(1,t))), n=[-tg.z,tg.x]; if(n[0]>0) n=[-n[0],-n[1]];      // n verso ovest: la riva del Vaticano
    var off=nv.off, x=q.x+n[0]*off, z=q.z+n[1]*off;
    while(off>.5 && RM.distFiume(x,z)>2.1){ off-=.3; x=q.x+n[0]*off; z=q.z+n[1]*off; }      // sempre in acqua, anche dove il fiume si stringe
    nv.m.position.set(x,-.55,z); nv.m.rotation.y=Math.atan2(tg.x,tg.z)+nv.gira; }
  navi.forEach(function(nv){ posa(nv,nv.t); });
  var SP=[-247,-108];      // i gradini dell'atrio di San Pietro
  for(i=0;i<70;i++){ var f=rnd(), a=curva.getPoint(t0), xx=a.x-9+(SP[0]-a.x+9)*f+(rnd()-.5)*5, zz=a.z+(SP[1]-a.z)*f+(rnd()-.5)*5; if(RM.distFiume(xx,zz)<6.4) continue;
    cavaliere(B,xx,zz,H(xx,zz),Math.atan2(SP[0]-xx,SP[1]-zz),rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }                 // dalle navi verso la basilica
  for(i=0;i<50;i++){ var an=rnd()*6.283, r=3+rnd()*3; x=SP[0]+3+Math.cos(an)*r*1.3; z=SP[1]+Math.sin(an)*r; cavaliere(B,x,z,H(x,z),rnd()*6.28,rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }      // attorno all'atrio
  for(var fila=0;fila<5;fila++) for(i=0;i<34;i++){ x=-246+i*.5+(rnd()-.5)*.15; z=-133+fila*.55; uomo(B,x,z,H(x,z),fila<2?C.ferro:C.tunica,fila<3?C.rosso:null,Math.PI); }      // la milizia romana nel campo di Nerone, rivolta a sud
  for(i=0;i<5;i++) insegna(B,-243+i*3.5,-130.6,H(-243+i*3.5,-130.6),C.rosso,.42);
  var g=maglia(B); navi.forEach(function(nv){ g.add(nv.m); });      // le navi seguono la scena: visibili solo nell'anno della tappa
  return {g:g, da:845.6, a:847, navi:navi, posa:posa};
})();
/* l'arrivo: la vista vola sul Borgo (circa due secondi), poi le navi risalgono il fiume in nove secondi; la scena (cavalieri, milizia) compare quando sono ormeggiate.
   Con meno animazioni niente viaggio: le navi sono già all'ormeggio */
var VIAGGIO=.05;      // quanto più a valle partono, in frazione del fiume (circa 70 m)
/* dal 24 novembre 2026 è una sequenza (in testa al file): parte con la regia e il suo tempo si ferma quando la scena non si vede */
var seq846=sequenza({fine:9, attesa:1.8, visibile:function(){ return saraceni846.g.visible; }, disegna:function(t){
  var k=t/9, e=1-Math.pow(1-k,3);
  saraceni846.navi.forEach(function(nv,j){ saraceni846.posa(nv,nv.t+VIAGGIO*(1-e)*(1+.15*(j%4))); });
  saraceni846.g.material.visible=k>=1; }});      // cavalieri e milizia quando le navi sono arrivate
ANIMA[846]=function(){ avvia(seq846); };

/* ---------- 546: Totila entra da porta Asinaria ----------
   Procopio VII 20: di notte quattro Isauri della guardia aprono la porta Asinaria e i Goti entrano; VII 22 e il continuatore di Marcellino Comes (a. 547): la città svuotata, incendi soprattutto
   oltre il Tevere (i fuochi stanno in EVENTI). Qui una colonna di Goti, alcuni con le fiaccole, che passa la porta e scende verso il Laterano; dopo qualche secondo la vista va su Trastevere
   che brucia (23 novembre 2026, l'utente: «fai vedere che entra da qui e l'incendio in Trastevere»). Numero e ordine della colonna sono uno schema. */
var totila546=(function(){
  var B=new RM.Costruttore(), G=[193.8,75.8], d=[.93,.36], n=[-.36,.93], i, f, x, z, fiamma=RM.col(0xffa040);
  for(i=0;i<320;i++){ f=rnd(); var lat=(rnd()-.5)*.9, lung=16-f*30;       // da 16 unità fuori a 14 dentro
    x=G[0]+d[0]*lung+n[0]*lat; z=G[1]+d[1]*lung+n[1]*lat;
    var y=H(x,z); uomo(B,x,z,y,rnd()<.5?C.ferro:C.grigio,rnd()<.6?C.cavalloB:null,Math.atan2(-d[0],-d[1]));
    if(i%9===0) B.scatola(.012,.12,.012,x+.03,y+.12,z,P.tronco).scatola(.03,.04,.03,x+.03,y+.25,z,fiamma);      // fiaccole
  }
  for(i=0;i<4;i++){ x=G[0]-d[0]*1.2+n[0]*(i-1.5)*.4; z=G[1]-d[1]*1.2+n[1]*(i-1.5)*.4; uomo(B,x,z,H(x,z),C.tunica,null,Math.atan2(d[0],d[1])); }      // i quattro Isauri che hanno aperto
  return {g:maglia(B), da:545.6, a:547};
})();
/* da porta Asinaria a Trastevere, che brucia: sette secondi dopo l'arrivo (dal 24 novembre 2026 è una sequenza, che parte con la regia) */
var seq546=sequenza({fine:7.2, attesa:0, visibile:function(){ return totila546.g.visible; }, disegna:function(){},
  azioni:[[7,function(){ var v=RM.adatta({t:[-118,50],c:[-84,34,90]}); RM.volaA(v.t,v.c); }]]});
ANIMA[546]=function(){ if(!document.body.classList.contains('roma-grande')) avvia(seq546); };

/* ---------- 801: il terremoto e il tetto di San Paolo ----------
   23 novembre 2026, l'utente: «quando ci sia un terremoto si muove la terra inizialmente e crolla qualcosa». Annali del regno dei Franchi, 801: la sera del 30 aprile («II. Kal. Mai.») un terremoto
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
var scossa=null;      // dal 24 novembre 2026 il tempo della scossa avanza con il dt di RM.frame (si ferma quando la scena non si vede)
function scuoti(ritardo,dur,amp){ if(MENO_SCOSSE) return; scossa={t:-ritardo/1000,dur:dur,amp:amp}; }
RM.frame.push(function(dt){
  if(!scossa) return; scossa.t+=dt; var t=scossa.t; if(t<0) return;
  if(t>scossa.dur){ scossa=null; RM.scene.position.set(0,0,0); return; }
  var a=scossa.amp*(1-t/scossa.dur); RM.scene.position.set(a*Math.sin(t*47),a*.5*Math.sin(t*31+1),a*Math.cos(t*53));
});
ANIMA[589]=ANIMA[791]=function(){ if(RM.ondaPiena) RM.ondaPiena(2300); };      // le due piene: l'ondata parte quando la vista è arrivata (js/eventi.js)
var annoPrima=null;
RM.moduli.push(function(anno){      // 847: la scossa quando il tempo, andando avanti fra due tappe vicine, passa l'anno del terremoto
  if(annoPrima!=null && annoPrima>840 && annoPrima<847 && anno>=847 && anno-annoPrima<2) scuoti(0,2.8,.2);
  annoPrima=anno;
});
function valoriPaolo(anno){ var r=RM.rovina('paolo',anno); return {r:r.r, s:r.s, c:r.c}; }
function applicaScossa(){      // durante la sequenza: il tetto va dallo stato dell'800 a quello dell'801, la polvere sale e svanisce, la terra trema
  var T=terremoto801, q=T&&T.seq; if(!q) return;
  var t=q.t, u=T.o.mat.userData.u, k=RM.sfuma(.5,1.8,t), pre=q.pre, post=q.post;
  if(t<0){ k=0; }
  u.uRovina.value=pre.r+(post.r-pre.r)*k; u.uSpoglio.value=pre.s+(post.s-pre.s)*k; u.uCrepe.value=pre.c+(post.c-pre.c)*k;
  T.o.mat.color.copy(RM.TINTA.uso).lerp(q.col,k);
  T.detriti.visible=k>.35;
  var pv=t>.6&&t<6.5; T.mp.opacity=pv?.55*RM.sfuma(.6,1.4,t)*(1-RM.sfuma(3.5,6.5,t)):0;
  T.polvere.forEach(function(m,j){ m.visible=pv; var g=1+2.2*RM.sfuma(.6,4,t)+(j%3)*.3; m.scale.set(g,g*.7,g); m.position.y=T.o.g.position.y+2.2+1.6*RM.sfuma(.6,5,t); });
  if(t>6.5){ T.seq=null; T.mp.opacity=0; T.polvere.forEach(function(m){ m.visible=false; }); }
}
if(terremoto801){
  RM.frame.push(function(dt){ if(terremoto801.seq) terremoto801.seq.t+=dt; applicaScossa(); });      // il tempo della sequenza avanza con il dt (24 novembre 2026)
  if(window.RM_pagina) RM_pagina.quando(function(){ terremoto801.seq=null; });
  ANIMA[801]=function(){      // parte con la regia (anche dal bottone «Guarda la città» del telefono), quando la vista è arrivata sulla basilica
    if(MENO_SCOSSE) return;
    terremoto801.seq={t:-2.3, pre:valoriPaolo(800.5), post:valoriPaolo(801), col:RM.TINTA.crollato.clone()};
    scuoti(2300,3.2,.22);
  };
}

/* ---------- 552: Narsete e il forte dei Goti al mausoleo di Adriano ----------
   Procopio VIII 33, 14-27 (Dewing, LacusCurtius): i Goti, troppo pochi per tutta la cinta, «enclosed a small part of the city with a short wall around the Tomb of Hadrian and, by connecting this
   with the earlier wall, he made a kind of fortress»; poi si arrendono a Narsete, che avanza «against the fortress with his whole army». Qui: un muro basso attorno al mausoleo, interrotto
   dove c'è il fiume (il tracciato è nostro), dal 550, quando Totila riprende Roma (la data della costruzione non è detta: ipotesi), e lo schieramento di Narsete sul lato di terra nel 552.
   Dove fosse entrato Dagisteo con le scale non si sa: non si disegna. */
var fortino552=(function(){
  var B=new RM.Costruttore(), cx=-157, cz=-118, R=7.2, n=44, i;
  for(i=0;i<n;i++){ var a=i/n*6.283, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R; if(RM.distFiume(x,z)<6.4) continue;
    B.scatola(1.1,.72,.24,x,H(x,z)-.1,z,P.tufo,-a+Math.PI/2); if(i%6===0) B.scatola(.5,.96,.5,x,H(x,z)-.1,z,P.tufo,-a); }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  var B2=new RM.Costruttore(), k=0;      // lo schieramento: file di fanti con le insegne, rivolte al forte, a nord-ovest, sul lato di terra
  for(var fila=0;fila<6;fila++) for(var j=-14;j<=14;j++){ var ang=-2.25+j*.028, r=R+3.2+fila*.6, x2=cx+Math.cos(ang)*r, z2=cz+Math.sin(ang)*r; if(RM.distFiume(x2,z2)<6.5) continue;
    uomo(B2,x2+(rnd()-.5)*.25,z2+(rnd()-.5)*.25,H(x2,z2),fila<2?C.ferro:C.grigio,fila<3?C.rosso:null,Math.atan2(cx-x2,cz-z2)); k++;
    if(fila===5 && j%7===0) insegna(B2,x2,z2,H(x2,z2),C.porpora,.42); }
  /* l'assalto al forte (23 novembre 2026, l'utente: «mostra la battaglia qui»). Procopio VIII 33 racconta l'attacco alle mura e la resa del forte attorno al mausoleo, non come fu
     assalito il forte: scale appoggiate al muro dal lato di terra, assalitori ammassati ai piedi con gli scudi alzati e difensori goti sul muro sono uno schema */
  var ROSSO=C.rosso, GOTI=RM.col(0x5a5a3a);
  for(i=0;i<7;i++){ var aa=-2.6+i*.17, xw=cx+Math.cos(aa)*R, zw=cz+Math.sin(aa)*R; if(RM.distFiume(xw,zw)<6.4) continue;
    var xo=cx+Math.cos(aa)*(R+.55), zo=cz+Math.sin(aa)*(R+.55), yo=H(xo,zo), yt=H(xw,zw)+.66, tx=-Math.sin(aa)*.05, tz=Math.cos(aa)*.05;
    [-1,1].forEach(function(sg){ B2.quad([xo+tx*sg,yo,zo+tz*sg],[xw+tx*sg,yt,zw+tz*sg],[xw+tx*sg*1.4,yt,zw+tz*sg*1.4],[xo+tx*sg*1.4,yo,zo+tz*sg*1.4],P.tronco); });      // i due montanti della scala
    for(var gr=1;gr<6;gr++){ var f=gr/6; B2.scatola(.1,.012,.012,xo+(xw-xo)*f,yo+(yt-yo)*f,zo+(zw-zo)*f,P.tronco,-aa+Math.PI/2); }      // i pioli
    for(var u=0;u<9;u++){ var ra=R+.4+rnd()*1.3, an=aa+(rnd()-.5)*.12, xu=cx+Math.cos(an)*ra, zu=cz+Math.sin(an)*ra; uomo(B2,xu,zu,H(xu,zu),C.ferro,ROSSO,Math.atan2(cx-xu,cz-zu)); }
    var ys=H(xo,zo)+(yt-yo)*.55; uomo(B2,xo+(xw-xo)*.55,zo+(zw-zo)*.55,ys,C.ferro,ROSSO,Math.atan2(cx-xo,cz-zo));      // uno che sale
  }
  for(i=0;i<40;i++){ var ad=-3.1+i*.05, xd=cx+Math.cos(ad)*(R-.06), zd=cz+Math.sin(ad)*(R-.06); if(RM.distFiume(xd,zd)<6.4 || rnd()<.35) continue;
    uomo(B2,xd,zd,H(xd,zd)+.62,GOTI,C.cavalloB,Math.atan2(xd-cx,zd-cz)); }      // i Goti sul muro, rivolti fuori
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
  var B=new RM.Costruttore(), coppi=P.coppi||RM.col(0xa8553a), terra=RM.col(0x8a7a62), smossa=RM.col(0x6f6150), k=0, tent=0, hq=RM.hSuolo||RM.h;
  /* sotto il gruppo una chiazza di terra smossa, irregolare, che si vede anche da lontano (23 novembre 2026, l'utente: «dove si vedono le tombe?»): le fosse sono in grandezza vera */
  var n=14, j, pr=[]; for(j=0;j<n;j++){ var aj=j/n*6.283, rj=(t[2]+.5)*(.8+.35*rnd()); pr.push([t[0]+Math.cos(aj)*rj, t[1]+Math.sin(aj)*rj]); }
  for(j=0;j<n;j++){ var p1=pr[j], p2=pr[(j+1)%n]; B.tri([t[0],hq(t[0],t[1])+.03,t[1]],[p2[0],hq(p2[0],p2[1])+.03,p2[1]],[p1[0],hq(p1[0],p1[1])+.03,p1[1]],smossa); }
  while(k<t[3] && tent<t[3]*20){ tent++;
    var a=rnd()*6.283, r=Math.sqrt(rnd())*t[2], x=t[0]+Math.cos(a)*r, z=t[1]+Math.sin(a)*r, ry=(rnd()-.5)*.6+(rnd()<.5?0:Math.PI/2), y=hq(x,z)+.03;
    if(rnd()<.75) B.falde(.08,.045,.21,x,y,z,coppi,ry); else B.scatola(.08,.03,.21,x,y,z,terra,ry);      // a cappuccina (due file di tegole a tetto) o fossa coperta di terra
    k++; }
  var g=B.maglia(RM.matPietra()); g.visible=false; RM.scene.add(g); return {g:g, da:t[4]};
});

/* ---------- 756: i dintorni devastati ----------
   La didascalia (EVENTI assedio756 in js/dati.js) dice che i Longobardi di Astolfo «devastano i dintorni»; le fonti lette non dicono dove né come (24 novembre 2026, l'utente:
   «Metti qualche incendio nei dintorni? Rendi il terreno più distrutto?»). Qui, fuori dalle porte Salaria e Nomentana, sette casali bruciati, quattro ancora in fiamme (i fuochi
   stanno in EVENTI), e attorno campi anneriti e calpestati, che tornano verdi in pochi anni. Posti, numero e forma sono una scelta del modello, detta nella didascalia.
   Niente accampamenti (prima si vedevano quelli del 537, che per il 756 non hanno fonte), niente chiese bruciate né tombe dei martiri violate: non sono nelle fonti lette. */
var ev756=(D.EVENTI||[]).filter(function(e){ return e.id==='assedio756'; })[0];
var POSTI756=((ev756&&ev756.fuochi)||[]).map(function(f){ return [f[0],f[1]]; }).concat([[60,-242],[150,-302],[206,-226]]);      // gli ultimi tre già spenti
var casali756=(function(){
  var B=new RM.Costruttore(), nero=RM.col(0x3b342d), muro=RM.col(0x7d6f5c);
  POSTI756.forEach(function(p,k){ B.dentro(p[0],H(p[0],p[1]),p[1],rnd()*1.5,function(B){
    B.scatola(2.2,.42,.14,0,0,-.8,k%2?muro:nero).scatola(2.2,.26,.14,0,0,.8,nero).scatola(.14,.42,1.6,-1.03,0,0,muro).scatola(.14,.2,1.6,1.03,0,0,nero);      // i muri, senza tetto
    for(var j=0;j<6;j++) B.scatola(.08,.06,1.3+rnd()*.6,(rnd()-.5)*1.5,.02+rnd()*.12,(rnd()-.5)*.9,nero,(rnd()-.5)*1.2);      // le travi del tetto cadute
  }); });
  return {g:maglia(B), da:755.6, a:757};
})();
/* i campi anneriti: si scuriscono i vertici del terreno (RM.suolo, js/base.js) attorno ai casali, così le macchie seguono il terreno. [x, z, raggio, forza] */
var macchie756=(function(){
  var M=POSTI756.map(function(p,k){ return [p[0],p[1],k<4?9:7,k<4?1:.75]; }).concat([[105,-255,6,.6],[170,-285,6,.6],[95,-300,5,.5],[245,-270,5,.5]]);
  var col=null, orig=null, idx=[], peso=[], ultimo=0;
  function prepara(){ var g=RM.suolo.geometry, pos=g.attributes.position; col=g.attributes.color; orig=col.array.slice();
    for(var i=0;i<pos.count;i++){ var x=pos.getX(i), z=pos.getZ(i), w=0;
      M.forEach(function(m){ var d=Math.hypot(x-m[0],z-m[1]); if(d<m[2]) w=Math.max(w,(1-RM.sfuma(m[2]*.45,m[2],d))*m[3]); });
      if(w>0){ idx.push(i); peso.push(w*(.7+.3*RM.rumore(x/3,z/3))); } } }
  return function(k){
    if(k<.01) k=0; if(!RM.suolo || k===ultimo || (Math.abs(k-ultimo)<.02 && k>0 && k<1)) return;
    if(!orig) prepara(); ultimo=k; var a=col.array;
    idx.forEach(function(i,j){ var w=peso[j]*k, o=i*3; a[o]=orig[o]*(1-.72*w)+.03*w; a[o+1]=orig[o+1]*(1-.75*w)+.024*w; a[o+2]=orig[o+2]*(1-.75*w)+.018*w; });
    col.needsUpdate=true;
  };
})();

RM.moduli.push(function(anno){
  [milvio,corteo,assedio472,prigionieri593,trionfo274,salaria410,vandali455,costante663,leone852,carlo800,saraceni846,totila546,casali756].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
  [fuga312,carlo800].forEach(function(s){ var v=anno>=s.da&&anno<s.a; if(v&&!s.acceso&&s.seq.t==null) quadro(s.seq); s.acceso=v; s.tutte.forEach(function(m){ m.visible=v; }); });      // le scene animate: prima che partano, il quadro finale
  macchie756(RM.sfuma(755.6,756,anno)*(1-RM.sfuma(757,760,anno)));
  tombe.forEach(function(s){ s.g.visible=anno>=s.da; });
  if(terremoto801){ terremoto801.detriti.visible=anno>=801&&anno<806; applicaScossa(); }      // le travi restano a terra fino ai restauri; durante la sequenza la scossa comanda
  fortino552.g.visible=anno>=fortino552.da&&anno<fortino552.a; fortino552.g2.visible=anno>=fortino552.da2&&anno<fortino552.a2;
});

/* ---------- regia: la vista va sul luogo dell'evento della tappa ---------- */
var perId={}; (RM.MONUMENTI||[]).forEach(function(m){ perId[m.id]=m; });
/* le due messe in scena hanno un'inquadratura fissa (punto guardato, posizione della camera): al ponte Milvio da sud, oltre il fiume, verso la riva dove fuggono;
   per il corteo da sud-est, sopra le case della via Lata */
/* 24 novembre 2026: al ponte Milvio da nord, dietro la cavalleria di Costantino, verso i ponti e la città (prima da sud verso nord: dietro la scena c'era il bordo del disegno);
   il corteo dell'800 parte dalla testata di ponte Elio sulla riva sinistra, e la vista lo segue (RM.segui); il 756 da sopra le mura del Castro Pretorio verso nord-est */
var VISTE={ milvio:fuga312.vista, carlo800:carlo800.vista, assedio756:{t:[160,-282],c:[112,46,-150]}, fortino552:{t:[-163,-126],c:[-131,30,-90]}, corteo:{t:corteo.carro,c:[corteo.carro[0]+20,24,corteo.carro[1]+24]},
  assedio472:{t:[-158,-109],c:[-122,44,-62]},      /* centrata sul mausoleo di Adriano e su ponte Elio, dove avviene lo scontro (23 novembre 2026, richiesta dell'utente); il campo resta a sinistra */
  prigionieri593:{t:[-80,-219],c:[-74.5,3.2,-212]}, trionfo274:{t:[8,8],c:[44,26,44]}, saraceni846:{t:[-214,-104],c:[-182,34,-66]}, totila546:{t:[190,74],c:[218,16,96]} };      // il trionfo: dal Palatino verso il Campidoglio      // il campo vaticano e ponte Elio; la Flaminia fuori porta
var portata=false;                                                                      // la vista ce l'ha portata la regia
function scena(){ var s=document.getElementById('scene'); return s?s.getAttribute('data-vista'):null; }
function vista(v){
  if(v==='insieme'||v==null) return null;
  if(typeof v==='string'){ if(VISTE[v]) return VISTE[v]; var m=perId[v]; return m?[m.x,m.z,Math.max(40,(m.raggio||6)*5)]:null; }
  return v;
}
if(window.RM_pagina) RM_pagina.quando(function(i,t){
  fermaTutte();                                                                          // le scene animate della tappa di prima tornano al loro quadro
  if(document.body.classList.contains('roma-grande')){ anima(t); return; }               // a tutto schermo decide chi guarda: la vista resta dov'è, la scena parte
  var telefono=window.innerWidth<=1000; if(telefono && scena()!=='roma') return;         // sul telefono la città non si apre da sola
  regia(t);
});
/* chiamata anche dalla riga «A Roma, in quest'anno» del telefono (js/pagina.js), dopo aver aperto la città */
RM.regiaTappa=function(t){ regia(t); };
function regia(t){
  var ev=null; (D.EVENTI||[]).forEach(function(e){ if(!ev && Math.floor(e.da)===t.anno && !t.intermezzo) ev=e; });
  var v=ev?vista(ev.vista):null;
  if(v&&v.t) v=RM.adatta(v);                                                             // sul telefono in piedi la camera si allontana
  anima(t);                                                                              // la scena animata parte con la regia: il suo tempo comincia dopo il volo
  if(v&&v.t){ RM.volaA(v.t,v.c); portata=true; }
  else if(v){ RM.vola(v[0],v[1],v[2]); portata=true; }
  else if(portata && RM.vistaInsieme){ RM.vistaInsieme(); portata=false; }
}
})();
