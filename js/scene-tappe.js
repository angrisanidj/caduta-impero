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
function H(x,z){ var a=RM.h(x,z); a=RM.hSuolo?Math.max(a,RM.hSuolo(x,z)):a; return Math.max(a,suStrada(x,z)); }
/* Le strade sono un nastro 1 m sopra il terreno (RM.nastro(…,.1) in js/base.js): chi stava su una strada ci affondava fino al ginocchio, e i cavalli sembravano senza
   gambe (24 novembre 2026, visto sulla Flaminia del 593). Se il punto cade dentro una strada, la quota è quella del nastro. Le strade: RM.STRADE, mezze larghezze in RM_TOPO.stradeLarghe. */
var STRADE_BB=null;
function suStrada(x,z){
  var S=RM.STRADE, W=window.RM_TOPO&&RM_TOPO.stradeLarghe; if(!S||!W||!RM.hSuolo) return -1e9;
  if(!STRADE_BB) STRADE_BB=S.map(function(L,i){ var b=[1e9,1e9,-1e9,-1e9]; L.forEach(function(p){ b[0]=Math.min(b[0],p[0]); b[1]=Math.min(b[1],p[1]); b[2]=Math.max(b[2],p[0]); b[3]=Math.max(b[3],p[1]); }); var w=W[i]||.5; return [b[0]-w,b[1]-w,b[2]+w,b[3]+w]; });
  for(var i=0;i<S.length;i++){ var b=STRADE_BB[i]; if(x<b[0]||x>b[2]||z<b[1]||z>b[3]) continue;
    var L=S[i], w=(W[i]||.5)*.95;
    for(var k=0;k<L.length-1;k++){ var ax=L[k][0], az=L[k][1], dx=L[k+1][0]-ax, dz=L[k+1][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
      if(Math.hypot(x-ax-dx*t,z-az-dz*t)<w) return RM.hSuolo(x,z)+.1; } }
  return -1e9;
}
/* figure a blocchi, come le statue di js/monumenti.js (s=1: uomo alto 1,85 m, cavallo lungo 2,2 m): le «pedine», che restano sui telefoni, nel gradino «bassa» e per le folle */
function pedina(B,x,z,y,col,scudo,ry){
  B.dentro(x,y,z,ry||0,function(B){
    B.scatola(.05,.15,.035,0,0,0,col).scatola(.03,.035,.03,0,.15,0,C.pelle);
    if(scudo) B.scatola(.012,.075,.06,.032,.05,0,scudo);                                  // scudo tondo visto di taglio: una lastra
  });
}
function pedinaCav(B,x,z,y,ry,colC,colU){
  B.dentro(x,y,z,ry,function(B){
    B.scatola(.055,.085,.025,0,0,.08,colC).scatola(.055,.085,.025,0,0,-.08,colC).scatola(.06,.07,.22,0,.08,0,colC).scatola(.04,.1,.05,0,.13,.095,colC).scatola(.035,.04,.09,0,.2,.135,colC);
    B.scatola(.045,.11,.035,0,.15,-.01,colU).scatola(.03,.035,.03,0,.26,-.01,C.pelle);
  });
}

/* ---------- persone vere nelle messe in scena (24 novembre 2026) ----------
   L'utente, sull'iPhone, davanti ai prigionieri del 593: «sembrano omini lego, non puoi riprodurli meglio?», «puoi fare molto di meglio». Le figure delle scene diventano persone
   con il corpo dei passanti di js/vita.js (RM.figuraGeo: gambe, veste con la cintura, braccia, collo, testa con i capelli, sandali), qui fermo e messo in posa: capo chino e mani
   legate davanti per i prigionieri, veste lunga fino ai piedi per il clero (scalzo nell'852: «nudis pedibus», vita di Leone IV, 72), il mantello di lana per chi lo portava;
   il cavallo è quello delle statue (RM.cavalloStatua, js/monumenti.js). Fogge, pose e colori sono indicativi: lana grezza, bruni, ocra, bianchi sporchi; la porpora solo
   a chi la portava (gli imperatori sul carro, Massenzio, l'imperatrice Eudossia). Carlo a piedi porta il mantello blu che gli dà Eginardo («sago veneto amictus», Vita Karoli 23), senza corona.
   Il peso: una persona sono da 350 a 400 triangoli (la pedina 24), un cavaliere circa 1250 (la pedina 84). Perciò:
   - sui telefoni (RM.piccolo) le persone non si costruiscono nemmeno: restano le pedine di sempre;
   - le figure importanti di una scena si raccolgono con vicine(B, scena, centro, fn): ognuna diventa una voce, disegnata due volte, come pedina (in una maglia figlia della maglia
     della scena) e come persona (maglie a istanze, una per foggia, con il colore della veste per istanza), in ordine di distanza dal punto che guarda la regia;
   - i gruppi che si muovono a istanze (il corteo dell'800, i Goti del 410, Massenzio) hanno una seconda maglia a istanze con la persona, sulle stesse matrici:
     o tutto il gruppo è fatto di persone, o nessuno;
   - a ogni gradino della qualità (RM.qualita.quando) ogni scena spende al massimo RM.QUALITA.figScena triangoli di persone: prima le parti più importanti (pr più basso),
     dentro una lista le voci più vicine; le altre restano pedine (drawRange e count: nessun lavoro in più per il processore). In «bassa» tutte pedine.
   - folle lontane, il pubblico del Colosseo e i grandi gruppi del 312 restano pedine. */
var VERE=!!(RM.figuraGeo&&RM.figura&&RM.cavalloStatua)&&!RM.piccolo;
RM.QUALITA.figScena=[0,52000,125000,210000];      // triangoli di persone per scena: circa 150, 350 e 600 persone a piedi a «media», «alta», «massima» (un cavaliere ne vale tre e mezzo)
var VIC=null, DETT=false, contaP=0, PARTI={}, nParti=0, BASI={}, matPers=null, BIANCO1=new THREE.Color(1,1,1);
var V_BIANCO=RM.col(0xefe9da), V_LANA=RM.col(0x6b5a44), V_VELO=RM.col(0xe2d6bc), V_SANDALO=RM.col(0x4a3424), V_PELLE=RM.col(0xb07a55), CORDA=RM.col(0x3a2a1a);      // i colori del corpo di js/vita.js
function uomo(B,x,z,y,col,scudo,ry,ruolo){
  if(DETT){ persona(B,x,z,y,col,scudo,ry,ruolo); return; }
  voce(B,x,y,z,function(Q){ persona(Q,x,z,y,col,scudo,ry,ruolo); },function(Q){ pedina(Q,x,z,y,col,scudo,ry); },ruolo==='folla'?1.6:1);
}
function cavaliere(B,x,z,y,ry,colC,colU,solo,ruolo){
  if(DETT){ cavaliereVero(B,x,z,y,ry,colC,colU,solo,ruolo); return; }
  voce(B,x,y,z,function(Q){ cavaliereVero(Q,x,z,y,ry,colC,colU,solo,ruolo); },function(Q){ pedinaCav(Q,x,z,y,ry,colC,colU); },1);
}
/* una voce: d disegna la persona, s la pedina; fuori da una raccolta (o sul telefono) si disegna subito la pedina */
function voce(B,x,y,z,d,s,peso){
  if(!VIC||VIC.B!==B){ s(B); return; }
  var m=B.pila[B.pila.length-1].clone(); VIC.voci.push({m:m, p:new THREE.Vector3(x,y,z).applyMatrix4(m), d:d, s:s, peso:peso||1});
}
function parte(nome,q){ var L=PARTI[nome]||(PARTI[nome]=[]); q.n=nParti++;
  if(q.chiave){ var g=L.filter(function(u){ return u.chiave===q.chiave; })[0]; if(g){ g.coppie=g.coppie.concat(q.coppie); return g; } }
  L.push(q); L.sort(function(a,b){ return (a.pr-b.pr)||(a.n-b.n); }); return q; }
/* raccoglie le figure di fn disegnate in B: centro [x, z] è il punto guardato dalla regia (le più vicine diventano persone per prime), pr la priorità della parte nella scena */
function vicine(B,nome,centro,fn,pr){
  if(!VERE){ fn(); return; }
  var r={B:B, c:centro, voci:[], q:parte(nome,{tipo:'lista', pr:pr||0})}, prima=VIC; VIC=r; fn(); VIC=prima;
  (B.vicine||(B.vicine=[])).push(r);
  if(!B.magliaSola){ B.magliaSola=B.maglia; B.maglia=function(mat){ var g=this.magliaSola(mat), self=this; self.vicine.forEach(function(r){ chiudi(r,g); }); self.vicine=[]; return g; }; }
}
function chiudi(r,g){
  var tetto=Math.max.apply(null,RM.QUALITA.figScena), S=new RM.Costruttore(), fS=[0], tri=[], somma=0, VAR={};
  r.voci.forEach(function(v){ v.d2=Math.hypot(v.p.x-r.c[0],v.p.z-r.c[1])*v.peso; });
  r.voci.sort(function(a,b){ return a.d2-b.d2; });
  r.voci.forEach(function(v,i){
    S.pila=[v.m]; v.s(S); fS.push(S.pos.length/3);
    if(somma>tetto) return;                                                                 // oltre il tetto più alto la persona non serve mai
    var Q={pezzi:[], m:v.m}, t=0; v.d(Q);
    Q.pezzi.forEach(function(z){ t+=base(z.k,z.fa).attributes.position.count/3; (VAR[z.k]||(VAR[z.k]={k:z.k, v:[]})).v.push({i:i, m:z.m, t:z.t}); });
    tri.push(t); somma+=t; });
  var mS=new THREE.Mesh(S.geometria(),g.material); mS.castShadow=mS.receiveShadow=true; g.add(mS);
  r.q.mS=mS; r.q.fS=fS; r.q.tri=tri;
  r.q.vari=Object.keys(VAR).map(function(k){ var w=VAR[k], n=w.v.length, m=new THREE.InstancedMesh(base(k),matPersone(),n);
    m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);
    w.v.forEach(function(q,j){ m.setMatrixAt(j,q.m); var t=q.t||BIANCO1; m.instanceColor.setXYZ(j,t.r,t.g,t.b); });
    m.frustumCulled=false; m.castShadow=m.receiveShadow=true; m.count=0; m.userData.persone=true; g.add(m);
    return {m:m, ord:w.v.map(function(q){ return q.i; })}; });
}
/* il materiale delle persone: come quello delle pietre (js/costruttore.js), ma il colore della veste viene da ogni istanza e tocca solo le parti che non hanno un colore loro (attributo fisso) */
function matPersone(){
  if(matPers) return matPers;
  var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0}), A=String.fromCharCode(10);
  m.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'attribute float fisso;').replace('#include <color_vertex>','#include <color_vertex>'+A+'vColor.xyz=mix(vColor.xyz,color.xyz,fisso);'); };
  return (matPers=m);
}
function base(k,fa){ return BASI[k]||(BASI[k]=fa()); }
function locale(x,y,z,ry){ var m=new THREE.Matrix4().makeRotationY(ry||0); m.setPosition(x,y,z); return m; }
/* un pezzo di persona: in una raccolta diventa un'istanza, in un Costruttore (le maglie a istanze dei gruppi che si muovono) geometria con la veste già colorata */
function emetti(dest,k,fa,m,tinta){
  if(dest.pezzi){ dest.pezzi.push({k:k, fa:fa, m:dest.m.clone().multiply(m), t:tinta}); return; }
  var g=base(k,fa).clone(), c=g.attributes.color.array, f=g.attributes.fisso.array, i;
  if(tinta) for(i=0;i<f.length;i++) if(!f[i]){ c[i*3]=tinta.r; c[i*3+1]=tinta.g; c[i*3+2]=tinta.b; }
  dest.pila.push(dest.pila[dest.pila.length-1].clone().multiply(m)); dest.geo(g,P.statua); dest.pila.pop();      // P.statua: tipo 2, niente crepe né crolli dello shader
}
function hex(c){ return c?c.getHexString():'-'; }
/* un'asta o una corda diritta fra due punti [x,y,z] (nel riferimento di dest), di sezione r: un cubo unitario stirato, colorato per istanza */
function trave(dest,a,b,r,col){
  var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(); if(L<1e-6) return;
  if(Math.abs(d.x)+Math.abs(d.z)<1e-6*L) d.x+=1e-4*L;      // diritta in verticale: lookAt non saprebbe come girarla
  var m=new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0),d,new THREE.Vector3(0,1,0)); m.scale(new THREE.Vector3(r,r,L)); m.setPosition((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
  emetti(dest,'trave',function(){ var g=new THREE.BoxGeometry(1,1,1).toNonIndexed(), n=g.attributes.position.count;
    g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(n*3).fill(1),3)); g.setAttribute('fisso',new THREE.Float32BufferAttribute(new Float32Array(n),1)); return g; },m,col);
}
/* la foggia, secondo il ruolo: o.f 0 tunica corta, 1 tunica e mantello, 2 donna (stola lunga e palla sul capo), 3 veste lunga fino ai piedi, 4 a cavallo */
function opzioni(col,scudo,ruolo,k){
  var h=((k*2654435761)>>>0)%100, o={f:0, k:(h&1)?3:0, veste:col||C.tunica, scudo:scudo||null, s:1};      // due carnagioni e due capigliature (js/vita.js), non quattro: meno maglie da disegnare
  if(ruolo==='clero' || ruolo==='papa'){ o.f=3; o.sopra=col; if(ruolo==='papa') o.veste=C.bianco; }
  else if(ruolo==='scalzo'){ o.f=3; o.sopra=col; o.scalzo=true; }
  else if(ruolo==='carlo'){ o.f=1; o.sopra=col; o.veste=C.tunica; }
  else if(ruolo==='donna') o.f=2;
  else if(ruolo==='folla'){ if(h<32) o.f=2; else if(h<52) o.f=1; if(h>=92){ o.f=0; o.s=.7; } }      // donne, uomini col mantello, ragazzi
  else if(h<28) o.f=1;
  if(o.f===2 && h%3===1) o.velo=RM.col(0xb3a487);
  return o;
}
function chiaveP(o){ return ['p',o.f,o.k,hex(o.sopra),hex(o.velo),o.chino||0,o.legato?1:0,o.collare?1:0,hex(o.scudo),o.s,o.scalzo?1:0].join('|'); }
function persona(dest,x,z,y,col,scudo,ry,ruolo){ var o=opzioni(col,scudo,ruolo,contaP++); emetti(dest,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); }
function cavaliereVero(dest,x,z,y,ry,colC,colU,solo,ruolo){
  var k=contaP++, m=locale(x,y,z,ry), cc=colC||C.cavalloB;
  emetti(dest,'cav|'+hex(cc),function(){ return cavalloGeo(cc); },m,null);
  if(solo) return;
  var o=opzioni(colU,null,ruolo,k); o.f=4; o.sopra=null; o.velo=null; o.s=1;
  emetti(dest,chiaveP(o),function(){ return personaGeo(o); },m.clone().multiply(locale(0,.068,-.01,0)),o.veste);      // seduto in sella, come RM.figura.cavaliere di js/vita.js
}
function seduto(dest,x,y,z,ry,col){ var o=opzioni(col,null,null,contaP++); o.f=4; o.sopra=null; emetti(dest,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); }      // l'imperatore sul carro
function cavalloGeo(col){ var T=new RM.Costruttore(); RM.cavalloStatua(T,0,0,0,0,1,col); var g=T.geometria(); g.deleteAttribute('tipo');
  g.setAttribute('fisso',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(1),1)); return g; }
/* La geometria di una persona, in unità della scena (piedi a y=0, sguardo verso +z), dal corpo di js/vita.js. Le parti senza colore proprio (la veste) diventano bianche:
   il colore lo dà l'istanza o emetti(). Le pose: o.chino piega in avanti collo e testa attorno alla base del collo; o.legato porta le due braccia in avanti e verso il centro,
   le mani unite davanti al ventre con un giro di corda; o.collare mette un collare di corda al collo. */
function personaGeo(o){
  var g=RM.figuraGeo(o.f,o.k,5), pa=g.attributes.position.array, na=g.attributes.normal.array, ca=g.attributes.color.array, fa=g.attributes.fisso.array, oa=g.attributes.oscilla.array;
  var Pp=[], Nn=[], Cc=[], Ff=[], i, n=pa.length/3, v=new THREE.Vector3(), w=new THREE.Vector3();
  function uguale(c,q){ return Math.abs(c[0]-q.r)+Math.abs(c[1]-q.g)+Math.abs(c[2]-q.b)<.01; }
  function rgb(q){ return [q.r,q.g,q.b]; }
  function ruota(p,asse,ang,cy,cz,cx){ var q=p.clone(); q.x-=cx||0; q.y-=cy||0; q.z-=cz||0; q.applyAxisAngle(asse,ang); q.x+=cx||0; q.y+=cy||0; q.z+=cz||0; return q; }
  var X=new THREE.Vector3(1,0,0), Z=new THREE.Vector3(0,0,1);
  function braccio(p,nn,s){ var a=-.3*s, b=-.45; p.copy(ruota(ruota(p,Z,a,.138,0,s*.02),X,b,.138,0,0)); if(nn){ nn.applyAxisAngle(Z,a).applyAxisAngle(X,b); } }
  function testa(p,nn){ p.copy(ruota(p,X,o.chino,.143,0,0)); if(nn) nn.applyAxisAngle(X,o.chino); }
  for(i=0;i<n;i++){
    var j=i*3, c=[ca[j],ca[j+1],ca[j+2]], fis=fa[i], os=oa[i];
    v.set(pa[j],pa[j+1],pa[j+2]); w.set(na[j],na[j+1],na[j+2]);
    if(!fis) c=[1,1,1];
    else if(uguale(c,V_BIANCO)) c=rgb(o.sopra||V_BIANCO);                                   // la toga, o la veste lunga
    else if(uguale(c,V_LANA)) c=rgb(o.sopra||V_LANA);                                       // il mantello e le maniche
    else if(uguale(c,V_VELO)) c=rgb(o.velo||V_VELO);                                        // la palla delle donne
    else if(o.scalzo && uguale(c,V_SANDALO) && v.y<.012) c=rgb(V_PELLE);                    // a piedi nudi
    if(o.legato && Math.abs(os)>1.5) braccio(v,w,os>0?1:-1);
    else if(o.chino && Math.abs(os)<.5 && v.y>.143 && Math.abs(v.x)<.13) testa(v,w);
    Pp.push(v.x,v.y,v.z); Nn.push(w.x,w.y,w.z); Cc.push(c[0],c[1],c[2]); Ff.push(fis?1:0);
  }
  function aggiungi(q,col,chino){ var t=q.index?q.toNonIndexed():q, P2=t.attributes.position.array, N2=t.attributes.normal.array;
    for(var k=0;k<P2.length;k+=3){ v.set(P2[k],P2[k+1],P2[k+2]); w.set(N2[k],N2[k+1],N2[k+2]); if(chino) testa(v,w); Pp.push(v.x,v.y,v.z); Nn.push(w.x,w.y,w.z); Cc.push(col.r,col.g,col.b); Ff.push(1); } }
  if(o.collare) aggiungi(new THREE.CylinderGeometry(.0072,.0072,.0045,8).translate(0,.1455,.002),CORDA,!!o.chino);      // il collare di corda
  if(o.legato){ var m0=new THREE.Vector3(.022,.081,.006), m1=new THREE.Vector3(-.022,.081,.006); braccio(m0,null,1); braccio(m1,null,-1);
    aggiungi(new THREE.BoxGeometry(Math.abs(m0.x-m1.x)+.012,.007,.009).translate((m0.x+m1.x)/2,(m0.y+m1.y)/2,(m0.z+m1.z)/2),CORDA,false); }      // la corda ai polsi
  if(o.scudo) aggiungi(new THREE.CylinderGeometry(.045,.045,.008,10).rotateZ(Math.PI/2).translate(.034,.1,.01),o.scudo,false);      // lo scudo, al fianco sinistro (come in js/vita.js)
  if(o.s!==1) for(i=0;i<Pp.length;i++) Pp[i]*=o.s;
  var q=new THREE.BufferGeometry(); q.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); q.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
  q.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); q.setAttribute('fisso',new THREE.Float32BufferAttribute(Ff,1)); g.dispose(); return q;
}
/* un prigioniero del 593: capo chino, mani legate davanti, collare; h la statura (0,72 i ragazzi) */
function prigioniero(dest,x,z,y,ry,h,veste,k){
  var f=h<1?0:[0,1,2,0,0,2,1,0,2,0][(k*3+((k/10)|0)*7)%10], o={f:f, k:(k*7)&1?3:0, veste:veste, s:h, chino:.42, legato:true, collare:true, scudo:null};
  if(f===1) o.sopra=V_LANA; if(f===2) o.velo=[RM.col(0xb9ab8e),RM.col(0x8f8068)][k%2];
  emetti(dest,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),veste);
}
/* tutte le scene: ogni parte riceve la sua quota di triangoli, in ordine di priorità */
function assegna(){
  var tetto=VERE?(RM.QUALITA.figScena[RM.q]||0):0;
  Object.keys(PARTI).forEach(function(nome){ var resto=tetto;
    PARTI[nome].forEach(function(q){
      if(q.tipo==='blocco'){ var t=0; q.coppie.forEach(function(c){ t+=c.tri*Math.max(0,c.g.count); }); var si=tetto>0&&t<=resto; if(si) resto-=t;
        q.coppie.forEach(function(c){ c.gd.visible=si; c.g.geometry.setDrawRange(0,si?0:Infinity); }); return; }
      if(!q.mS) return;
      var n=0; while(n<q.tri.length && q.tri[n]<=resto){ resto-=q.tri[n]; n++; }
      q.vari.forEach(function(w){ var c=0; while(c<w.ord.length && w.ord[c]<n) c++; w.m.count=c; });
      q.mS.geometry.setDrawRange(q.fS[n],Infinity); });
  });
}
RM.figureScene={ parti:PARTI, assegna:assegna, triangoli:function(nome){ var t=0; (PARTI[nome]||[]).forEach(function(q){      // per le prove: triangoli di persone accesi in una scena
  if(q.tipo==='blocco') q.coppie.forEach(function(c){ if(c.gd.visible) t+=c.tri*c.g.count; }); else if(q.vari) q.vari.forEach(function(w){ t+=w.m.count*w.m.geometry.attributes.position.count/3; }); }); return t; } };
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
function avvia(o){ o.t=FERMA!=null?FERMA:MENO?o.fine:-o.attesa; o.fatte=0; o.toccato=false; o.disegna(Math.max(0,Math.min(o.fine,o.t))); corrente=o; dopo=0; }
/* La riga dei tempi (24 novembre 2026, l'utente: «non si capisce come finisce»). Una scena in più tempi dichiara righe:[[secondo, '1 · Il palazzo'], …]; in alto sulla scena si legge
   il tempo in corso; finita la scena l'ultima riga resta qualche secondo e poi sparisce. Niente righe con meno animazioni (la scena è già ferma all'ultimo tempo) né nelle prove ferme. */
var corrente=null, dopo=0, rigaEl=null;
function riga(testo){
  if(!rigaEl){ var riq=document.querySelector('.riquadro.roma'); if(!riq) return; rigaEl=document.createElement('div'); rigaEl.className='riga-tempo'; rigaEl.setAttribute('aria-live','polite');
    rigaEl.style.cssText='position:absolute;left:50%;top:'+(window.innerWidth<700?62:12)+'px;transform:translateX(-50%);z-index:4;pointer-events:none;max-width:86%;text-align:center;padding:5px 12px;border-radius:14px;background:rgba(40,22,26,.72);color:#fff;font:600 14px/1.3 system-ui,-apple-system,sans-serif;letter-spacing:.01em;display:none';
    riq.appendChild(rigaEl); }
  if(!testo){ rigaEl.style.display='none'; return; }
  if(rigaEl.textContent!==testo) rigaEl.textContent=testo; rigaEl.style.display='block';
}
RM.frame.push(function(dt){
  var o=corrente; if(!o||!o.righe||MENO||FERMA!=null||o.t==null){ if(rigaEl&&rigaEl.style.display!=='none'&&(!o||o.t==null)) riga(null); return; }
  if(!o.visibile()){ riga(null); return; }
  if(o.t>=o.fine){ dopo+=dt; if(dopo>4){ riga(null); corrente=null; } return; }
  var r=null; o.righe.forEach(function(q){ if(o.t>=q[0]) r=q[1]; }); riga(r);
});
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
function fermaTutte(){ SEQ.forEach(function(o){ if(o.t!=null){ o.t=null; quadro(o); } }); corrente=null; riga(null); }
function anima(t){ var f=!t.intermezzo && ANIMA[t.anno]; if(f) f(); }
/* figure a istanze, una maglia per gruppo di colori (i colori stanno nei vertici): fa(B) disegna una figura all'origine */
var O3=new THREE.Object3D();
/* nome, chiave, pr: se c'è nome il gruppo ha anche la maglia con le persone (vedi «persone vere» in testa), nella scena nome; i gruppi con la stessa chiave diventano persone
   tutti insieme; faD, se c'è, disegna la persona al posto di fa */
function istanze(fa,N,nome,chiave,pr,faD){ var B=new RM.Costruttore(); fa(B); var g=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),Math.max(1,N)); g.frustumCulled=false; g.castShadow=true; g.visible=false;
  O3.position.set(0,-50,0); O3.scale.setScalar(0); O3.updateMatrix(); for(var k=0;k<g.count;k++) g.setMatrixAt(k,O3.matrix);      // le istanze non usate restano nascoste
  if(nome && VERE){
    var Bd=new RM.Costruttore(); DETT=true; try{ (faD||fa)(Bd); } finally { DETT=false; }
    var gd=new THREE.InstancedMesh(Bd.geometria(),g.material,Math.max(1,N)), cnt=g.count;
    gd.instanceMatrix=g.instanceMatrix; gd.frustumCulled=false; gd.castShadow=gd.receiveShadow=true; gd.visible=false; gd.count=cnt; g.add(gd);
    Object.defineProperty(g,'count',{configurable:true, get:function(){ return cnt; }, set:function(v){ cnt=v; gd.count=v; }});      // le due maglie mostrano le stesse istanze
    parte(nome,{tipo:'blocco', pr:pr||0, chiave:chiave, coppie:[{g:g, gd:gd, tri:Bd.pos.length/9}]});
  }
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
  var mass=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.porpora); },1,'312','massenzio',0);      // Massenzio: l'unico, qui, fatto da persona (i gruppi grandi restano pedine)
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
  var o=sequenza({fine:14, attesa:1.8, disegna:disegna, visibile:function(){ return fissa.visible; }, righe:[[0,'1 · La fuga verso il Tevere, a ponte Milvio'],[7.6,'2 · Il ponte di travi cede (versione di Zosimo)']],
    azioni:[[6.3,function(){ var q=P2(AP+10,15), v=alto(RM.adatta({t:P2(AP,2),c:[q[0],Hm(q[0],q[1])+7,q[1]]})); RM.volaA(v.t,v.c,2.2); }]]});      // da vicino, sulla passerella che sta per cedere
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
  var pc=lungo(.74,0);
  vicine(B,'357',[pc[0],pc[1]],function(){      // persone attorno al carro, dove guarda la regia
  // la doppia fila di armati con scudi e cimieri, da una parte e dall'altra, per tutto il tratto
  for(k=0;k<2;k++) for(i=0;i<300;i++){ var t=.45+i/300*.55, p=lungo(t,(k?1:-1)*(.62+.12*(i%2))); uomo(B,p[0],p[1],p[2],C.ferro,C.rosso,rot+(k?-1:1)*Math.PI/2); }
  // davanti, i reparti che lo precedono, quattro per fila
  for(i=0;i<240;i++){ var p2=lungo(.80+(i>>2)/60*.2,((i&3)-1.5)*.13); uomo(B,p2[0],p2[1],p2[2],C.tunica,C.rosso,rot); }
  // il carro d'oro, tirato da quattro cavalli, con l'imperatore seduto solo; attorno i draghi di porpora sulle aste
  B.dentro(pc[0],pc[2],pc[1],rot,function(B){
    B.scatola(.16,.09,.2,0,.07,0,C.oro).scatola(.02,.1,.1,.09,0,0,C.oro).scatola(.02,.1,.1,-.09,0,0,C.oro);             // cassa e ruote
    voce(B,0,.07,-.02,function(Q){ seduto(Q,0,.07,-.02,0,C.porpora); },function(Q){ Q.scatola(.05,.1,.04,0,.16,-.02,C.porpora).scatola(.03,.035,.03,0,.26,-.02,C.pelle); });      // l'imperatore
  });
  for(i=0;i<4;i++){ var pcv=lungo(.74+.0016+.0005*(i>>1),((i&1)-.5)*.07); cavaliere(B,pcv[0],pcv[1],pcv[2],rot,C.bianco,C.bianco,true); }      // i quattro cavalli del carro (le persone: senza cavaliere)
  for(i=0;i<14;i++){ var pd=lungo(.70+i*.006,(i%2?1:-1)*.3); insegna(B,pd[0],pd[1],pd[2],C.porpora,.5); }
  // i clibanarii, cavalieri corazzati, sparsi dietro e ai lati del carro
  for(i=0;i<90;i++){ var pk=lungo(.48+rnd()*.24,(rnd()-.5)*.8); cavaliere(B,pk[0],pk[1],pk[2],rot,C.cavalloB,C.ferro); }
  // la folla della plebe, ai due lati, dietro gli armati
  for(i=0;i<1400;i++){ var lat=(rnd()<.5?-1:1)*(.95+rnd()*.5), pf=lungo(.45+rnd()*.55,lat); uomo(B,pf[0],pf[1],pf[2],C.folla[(rnd()*C.folla.length)|0],null,rot+(lat>0?-1:1)*Math.PI/2+(rnd()-.5),'folla'); }
  // ai Rostri, nel Foro: chi lo aspetta
  for(i=0;i<160;i++){ var a=rnd()*6.283, r=1.5+rnd()*3, x=R[0]+Math.cos(a)*r, z=R[1]+Math.sin(a)*r; uomo(B,x,z,H(x,z),i<40?C.bianco:C.folla[(rnd()*C.folla.length)|0],null,Math.atan2(R[0]-x,R[1]-z),i<40?null:'folla'); }
  });
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
    vicine(B,'472',[c2.x,c2.z],function(){
    for(k=0;k<240;k++){
      var s=(rnd()-.4)*15, w=(rnd()-.5)*(Math.abs(s)>7.4?6:1.1), x=c2.x+ax[0]*s+lat[0]*w, z=c2.z+ax[1]*s+lat[1]*w, sul=Math.abs(s)<=7.4;
      if(!sul && RM.distFiume(x,z)<6.2) continue;
      var dife=s>.3, ry=Math.atan2(ax[0],ax[1])+(dife?Math.PI:0);      // dalla parte del mausoleo gli uomini di Ricimero, rivolti alla città; dall'altra quelli di Antemio (colori di comodo)
      uomo(B,x,z,sul?.66:H(x,z),dife?C.tunica:C.grigio,dife?C.rosso:C.grigio,ry);
    }
    });
  })();
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:471.6, a:473};
})();

/* ---------- 593: i Longobardi di Agilulfo sotto Roma ----------
   Le fonti non dicono dove fosse il loro campo (Gregorio, Omelie su Ezechiele, prefazione al libro II e II 10, 24; Paolo Diacono IV 8): niente accampamento.
   Si vede ciò che Gregorio scrive di aver visto (Registrum V 36, giugno 595): Romani portati via «more canum in collis funibus», per essere venduti in Francia;
   qui una fila di prigionieri legati, con uomini a cavallo, sulla Flaminia verso nord (la strada è una scelta nostra), e casali che bruciano (i fuochi stanno in EVENTI). */
/* 24 novembre 2026, l'utente: «non puoi mostrarmi la porta così, ma la strada dove si vedono chiaramente i prigionieri incatenati che vanno via». Rifatta: la colonna segue la Flaminia
   com'è disegnata (RM_TOPO.strade[0], dalla porta del Popolo verso nord), comincia 35 m fuori porta e cammina verso nord; gruppi di dieci, uno dietro l'altro a passo d'uomo (1,7 m),
   con un collare scuro al collo e la corda da un collo al seguente, tesa e appena calante, più grossa del vero (8 cm invece di 2-3) perché si legga anche sul telefono;
   il primo di ogni gruppo è legato alla sella di un cavaliere. Ai lati le guardie longobarde a cavallo, con la lancia, e qualcuna a piedi. Uomini, donne e ragazzi in vesti
   diverse. Gregorio dice solo «more canum in collis funibus ligatos»: numeri, ordine, guardie e il legame alla sella sono uno schema. */
function fune(B,a,b,r,col){      // una corda diritta fra due punti [x,y,z], di sezione r
  var dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], L=Math.hypot(dx,dy,dz), g=new THREE.BoxGeometry(r,r,L);
  g.applyMatrix4(new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0),new THREE.Vector3(dx,dy,dz),new THREE.Vector3(0,1,0)));
  g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); B.geo(g,col);
}
var prigionieri593=(function(){
  var r5=RM.casuale(593), B=new RM.Costruttore(), S=RM_TOPO.strade[0], PG=RM_TOPO.porte['Porta del Popolo']||[-77.1,-211.4], i, j, k, p, q;
  var via=spezzata([PG,S[2],S[3]]), corda=RM.col(0x3a2a1a), lancia=P.tronco, VESTI=[C.folla[0],C.folla[1],C.folla[3],C.folla[4],RM.col(0x56677a),RM.col(0x7a4a5a),RM.col(0x8a6f3e)];      // vesti scure o colorate: le chiare si perdevano sulla strada
  var COLLO=.142, PASSO=.17, s0=3.5, gruppi=8, prima=[];
  /* 24 novembre 2026 (l'utente: «sembrano omini lego»): da «media» in su i prigionieri e le guardie sono persone (vedi «persone vere» in testa al file). I prigionieri hanno
     il capo chino, le mani legate davanti e il collare di corda, e la corda da un collo all'altro. Vesti povere di lana, in tinte diverse ma abbastanza scure da staccarsi
     dalla strada chiara: bruna, rossiccia, verde spento, ocra, grigia, bianco sporco, azzurro di guado; donne con la stola lunga e la palla sul capo, uomini in tunica
     o col mantello, un ragazzo ogni tanto. */
  var VESTI_P=[0x5f4a37,0x8a4a33,0x4f5a3e,0x9a6a2a,0x5b5f66,0xc9bfa8,0x4a5a72].map(RM.col), lunghezza=via(0).lung, vt0=via(8.6/lunghezza,0);
  function collo(pp){ return [pp.x,pp.y+COLLO*pp.h,pp.z]; }
  var FERRO_SCURO=RM.col(0x55575b), SPESSA=.005;      // la punta della lancia; la corda delle persone, 5 cm (più del vero, perché si legga dalla vista della regia)
  function colloV(pp,ry){ return [pp.x+.003*Math.sin(ry),pp.y+.1445*pp.h,pp.z+.003*Math.cos(ry)]; }      // il collare della persona, col capo chino
  /* corde e lance stanno nella voce di chi le porta: sulla pedina come prima (la corda di 8 cm, perché si legga sul telefono), sulla persona più fini (corda di 5 cm, asta di 4 cm con la punta di ferro) */
  function uno(B,p,ry,col,k,pr,ryPr){ voce(B,p.x,p.y,p.z,function(Q){ prigioniero(Q,p.x,p.z,p.y,ry,p.h,VESTI_P[k%VESTI_P.length],k); if(pr) trave(Q,colloV(pr,ryPr),colloV(p,ry),SPESSA,corda); },
    function(Q){ Q.dentro(p.x,p.y,p.z,ry,function(B){ var h=p.h; B.scatola(.05,.15*h,.035,0,0,0,col).scatola(.03,.035,.03,0,.15*h,0,C.pelle).scatola(.042,.016,.042,0,COLLO*h-.008,0,corda); });      // corpo, testa, collare
      if(pr) fune(Q,collo(pr),collo(p),.008,corda); }); }
  function asta(Q,x,z,y0,y1,vera){ if(!vera){ Q.scatola(.01,y1-y0,.01,x,y0,z,P.tronco); return; } trave(Q,[x,y0,z],[x,y1-.03,z],.004,P.tronco); trave(Q,[x,y1-.03,z],[x,y1,z],.006,FERRO_SCURO); }
  vicine(B,'593',[vt0.x,vt0.z],function(){
  for(j=0;j<gruppi;j++){
    var lat=(j%2?.14:-.14), sg=s0+j*(PASSO*10+.75), lunga=via(0).lung, prec=null, ryPrec=0;
    for(i=0;i<10;i++){
      var s=sg+i*PASSO; p=via(s/lunga,lat+(r5()-.5)*.04); p.h=(i===4&&j%3===1)?.72:1;      // un ragazzo ogni tanto
      var col=VESTI[(j*5+i*3)%VESTI.length], ry=p.ry+(r5()-.5)*.25;
      uno(B,p,ry,col,j*10+i,prec,ryPrec);      // con la corda dal collo di chi gli sta dietro
      prec=p; ryPrec=ry;
    }
    prima.push([prec,ryPrec]);      // il primo del gruppo, quello più avanti
  }
  /* le guardie: un cavaliere davanti a ogni gruppo, con la corda legata alla sella; altri ai due lati, con la lancia alzata */
  prima.forEach(function(cr,j){ var cp=cr[0], s=s0+j*(PASSO*10+.75)+9*PASSO+.4, qq=via(s/lunghezza,j%2?.14:-.14), cc=j%2?C.cavalloB:C.cavalloC;
    voce(B,qq.x,qq.y,qq.z,function(Q){ cavaliereVero(Q,qq.x,qq.z,qq.y,qq.ry,cc,C.ferro); trave(Q,[qq.x,qq.y+.12,qq.z],colloV(cp,cr[1]),SPESSA,corda); },
      function(Q){ pedinaCav(Q,qq.x,qq.z,qq.y,qq.ry,cc,C.ferro); fune(Q,[qq.x,qq.y+.13,qq.z],collo(cp),.008,corda); }); });
  for(i=0;i<22;i++){ var sl=s0-1+i*1.0, la=(i%2?1:-1)*(.62+r5()*.15); q=via(sl/lunghezza,la);
    if(i%4===3){ (function(q){ var lx=q.x+.035*Math.cos(q.ry), lz=q.z-.035*Math.sin(q.ry);      // a piedi, con la lancia
      voce(B,q.x,q.y,q.z,function(Q){ persona(Q,q.x,q.z,q.y,C.ferro,C.cavalloB,q.ry); asta(Q,lx,lz,q.y,q.y+.28,true); },function(Q){ pedina(Q,q.x,q.z,q.y,C.ferro,C.cavalloB,q.ry); asta(Q,lx,lz,q.y,q.y+.28); }); })(q); continue; }
    (function(q,ry,cc){ var lx=q.x+.04*Math.cos(q.ry), lz=q.z-.04*Math.sin(q.ry);      // la lancia, dritta accanto al cavaliere: da 1,2 a 4,2 m da terra
      voce(B,q.x,q.y,q.z,function(Q){ cavaliereVero(Q,q.x,q.z,q.y,ry,cc,C.ferro); asta(Q,lx,lz,q.y+.1,q.y+.42,true); },function(Q){ pedinaCav(Q,q.x,q.z,q.y,ry,cc,C.ferro); asta(Q,lx,lz,q.y+.12,q.y+.42); });
    })(q,q.ry+(r5()-.5)*.3,r5()<.5?C.cavalloB:C.cavalloC); }
  });
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  /* la vista della regia: da fuori, a ovest della strada (verso il fiume, in piano), 13 m sopra il suolo, a una quarantina di metri dalla colonna, che viene verso chi guarda
     di tre quarti; la porta e le mura restano sullo sfondo */
  var vt=via(8.6/lunghezza,0), vc=via(12.1/lunghezza,-1.5);
  return {g:g, da:592.6, a:594, vista:{g:[vt.x,vt.z], c:[vc.x,Math.max(vc.y,vt.y)+1.35,vc.z]}};      // g: il punto a terra da mettere al centro (mira, più sotto)
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
  var pc=via(.64,0);
  vicine(B,'274',[pc.x,pc.z],function(){      // persone attorno al carro e ai prigionieri
  for(i=0;i<60;i++){ p=via(.69+(i>>2)*.0068,((i&3)-1.5)*.12); uomo(B,p.x,p.z,p.y,C.folla[i%C.folla.length],null,p.ry,'folla'); }           // i prigionieri dei popoli vinti
  p=via(.665,-.08); uomo(B,p.x,p.z,p.y,C.rosso,null,p.ry); p=via(.665,.08); uomo(B,p.x,p.z,p.y,C.oro,null,p.ry,'donna');                      // Tetrico in scarlatto, Zenobia in oro
  p=pc; B.dentro(p.x,p.y,p.z,p.ry,function(B){ B.scatola(.16,.09,.2,0,.07,0,C.oro).scatola(.02,.1,.1,.09,0,0,C.oro).scatola(.02,.1,.1,-.09,0,0,C.oro);
    voce(B,0,.07,-.02,function(Q){ seduto(Q,0,.07,-.02,0,C.porpora); },function(Q){ Q.scatola(.05,.1,.04,0,.16,-.02,C.porpora).scatola(.03,.035,.03,0,.26,-.02,C.pelle); }); });      // Aureliano sul carro
  for(i=0;i<4;i++){ p=via(.648+.002*(i>>1),((i&1)-.5)*.07); cavaliere(B,p.x,p.z,p.y,p.ry,C.bianco,C.bianco,true); }      // i cavalli del carro
  for(i=0;i<440;i++){ p=via(.33+(i>>2)/110*.29,((i&3)-1.5)*.13); uomo(B,p.x,p.z,p.y,C.ferro,C.rosso,p.ry); }                        // l'esercito dietro il carro
  for(i=0;i<8;i++){ p=via(.36+i*.032,(i%2?.32:-.32)); insegna(B,p.x,p.z,p.y,C.rosso,.42); }
  for(i=0;i<60;i++){ p=via(.06+rnd()*.25,(rnd()-.5)*.5); cavaliere(B,p.x,p.z,p.y,p.ry,C.cavalloB,C.ferro); }                       // i cavalieri corazzati, in coda
  for(i=0;i<900;i++){ var lat=(rnd()<.5?-1:1)*(.85+rnd()*.6); p=via(rnd(),lat); uomo(B,p.x,p.z,p.y,C.folla[(rnd()*C.folla.length)|0],null,p.ry+(lat>0?-1:1)*Math.PI/2+(rnd()-.5),'folla'); }
  });
  return {g:maglia(B), da:273.6, a:275};
})();

/* ---------- 410: i Goti entrano da porta Salaria, in tre tempi ----------
   Fonti (src/testi/scene-roma-fonti.md, sezione 5): Procopio, Guerre III 2, 14-27 (Dewing): un lungo assedio; Alarico «had encamped there at the beginning of the siege», presso
   porta Salaria; i giovani goti «assailing the guards suddenly, put them to death; then they opened the gates»; oppure Proba «commanded her domestics … to open the gates by night»;
   entrati, «they set fire to the houses which were next to the gate, among which was also the house of Sallust». Orosio VII 39: «facto quidem aliquantarum aedium incendio».
   Sozomeno IX 9: presa «by treachery». Nessuna battaglia davanti alla porta: non si disegna.
   Dal 24 novembre 2026 la scena è in tre tempi (l'utente: prima il fuori porta, poi l'ingresso, poi gli incendi), in 17 secondi:
   (a) 0-4: il blocco. Il campo e i Goti fermi fuori porta, i battenti chiusi, quattro guardie romane dentro la porta;
   (b) 4-8: la porta aperta da dentro: il gruppo di giovani alla porta, le guardie a terra, i battenti che si aprono verso la città;
   (c) 8-17: la colonna entra (prima i cavalieri, poi i fanti) e scende verso il Quirinale; alle 9,5 si accendono le case presso la porta, alle 10,5 la casa di Sallustio, alle 13,5
       il fuoco nel Foro (la basilica Emilia, «probabilmente»): i quarti valori dei fuochi in EVENTI (js/eventi.js, RM.tempoFuochi).
   La luce resta quella del giorno: Procopio dà due versioni e solo quella di Proba dice «di notte». Campo, numeri, colori, tempi e percorso dentro la città sono uno schema.
   Con meno animazioni la scena sta ferma all'ultimo tempo. */
var S410=(function(){
  var r4=RM.casuale(410), B=new RM.Costruttore(), G=RM_TOPO.porte['Porta Salaria'], i, s, w, x, z;
  var fuori=[-.164,-.986], verso=[-.331,.944], laF=[-fuori[1],fuori[0]], laV=[-verso[1],verso[0]];      // la via Salaria di js/roma-topo.js: fuori porta verso nord, dentro verso il Quirinale
  campo(B,G[0]+fuori[0]*17+5,G[1]+fuori[1]*17,Math.atan2(fuori[0],fuori[1]),9,5);
  var fisso=maglia(B);
  /* dove sta un punto della via: s>0 fuori porta, s<0 dentro; w di lato */
  function punto(s,w){ return s>=0?[G[0]+fuori[0]*s+laF[0]*w, G[1]+fuori[1]*s+laF[1]*w]:[G[0]-verso[0]*s+laV[0]*w, G[1]-verso[1]*s+laV[1]*w]; }
  var VERSO_DENTRO=Math.atan2(verso[0],verso[1]), VERSO_PORTA=Math.atan2(-fuori[0],-fuori[1]);
  /* i battenti, sulla porta com'è disegnata (RM.porte, js/mura.js): il passaggio largo 8,5 m al centro dell'istanza, che ruota di «ang» */
  var po=(RM.porte||[]).reduce(function(m,q){ return !m||Math.hypot(q.x-G[0],q.z-G[1])<Math.hypot(m.x-G[0],m.z-G[1])?q:m; },null)||{x:G[0],z:G[1],y:H(G[0],G[1])-.3,ang:Math.atan2(-laF[1],laF[0])};
  var zl=[Math.sin(po.ang),Math.cos(po.ang)], dentroZ=(zl[0]*verso[0]+zl[1]*verso[1])>0?1:-1;      // da che parte del riferimento della porta sta la città
  var legno=RM.col(0x4a3524), batt=[-1,1].map(function(k){ var Bb=new RM.Costruttore(); Bb.scatola(.42,.95,.05,-k*.21,0,0,legno).scatola(.42,.04,.06,-k*.21,.25,0,RM.col(0x2e241b)).scatola(.42,.04,.06,-k*.21,.7,0,RM.col(0x2e241b));
    var m=Bb.maglia(RM.matPietra()); m.castShadow=true; m.visible=false;
    var piv=new THREE.Group(); piv.position.set(po.x,po.y+.3,po.z); piv.rotation.y=po.ang; m.position.set(k*.42,0,dentroZ*.585); piv.add(m); piv.userData={k:k}; RM.scene.add(piv); return piv; });      // i battenti sul fronte verso la città: il corpo della porta è pieno
  /* le guardie romane: in piedi dentro la porta, poi a terra; i giovani che aprono */
  var GU=[[-1.1,-.25],[-1.1,.25],[-1.6,-.3],[-1.6,.3]], gIn=new RM.Costruttore(), gGiu=new RM.Costruttore(), gio=new RM.Costruttore(), ROSSO=C.rosso;
  vicine(gIn,'410',G,function(){
  GU.forEach(function(q){ var p=punto(q[0],q[1]), y=H(p[0],p[1]); uomo(gIn,p[0],p[1],y,ROSSO,C.ferro,VERSO_DENTRO+Math.PI);
    gGiu.dentro(p[0],y+.02,p[1],r4()*6.28,function(B){ B.scatola(.15,.035,.05,0,0,0,ROSSO).scatola(.035,.03,.03,.09,0,0,C.pelle).scatola(.06,.012,.06,-.03,0,.07,C.ferro); }); });      // a terra, con lo scudo accanto
  });
  vicine(gio,'410',G,function(){ for(i=0;i<9;i++){ var pg=punto(-.55-r4()*.7,(r4()-.5)*.7); uomo(gio,pg[0],pg[1],H(pg[0],pg[1]),C.tunica,null,VERSO_DENTRO+Math.PI+(r4()-.5)*.8); } });
  var mIn=maglia(gIn), mGiu=maglia(gGiu), mGio=maglia(gio);
  /* chi aspetta fuori e poi entra: fanti e cavalieri, a istanze (persone dal gradino che le regge: prima i cavalieri, poi i fanti) */
  var NF=RM.leggero?150:300, NC=RM.leggero?24:48, F=[], K=[];
  var fanti=[istanze(function(B){ uomo(B,0,0,0,C.grigio,C.cavalloB,0); },NF,'410','fanti',2), istanze(function(B){ uomo(B,0,0,0,C.tunica,C.cavalloB,0); },NF,'410','fanti',2)];
  var cav=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.grigio); },NC,'410','cav',1);
  for(i=0;i<NF;i++){ var s0=4.5+Math.pow(r4(),.8)*12, w0=(r4()-.5)*Math.min(6.4,1.6+s0*.4); F.push({s0:s0,w0:w0,s1:-2.5-r4()*12,v:1.3+r4()*.5,ts:8.6+(s0-4.5)*.42+r4()*.5,g:fanti[i&1],k:i>>1,ry:VERSO_PORTA+(r4()-.5)*.5}); }
  for(i=0;i<NC;i++){ var sc=3.6+r4()*3, wc=(r4()-.5)*2.4; K.push({s0:sc,w0:wc,s1:-4-r4()*10,v:2.1,ts:8+r4()*.8,g:cav,k:i,ry:VERSO_PORTA}); }
  fanti[0].count=Math.ceil(NF/2); fanti[1].count=Math.floor(NF/2);
  /* di notte (Girolamo, Lettera 127, 12; Procopio III 2, 27, la versione di Proba): una fiaccola ogni sei fanti, accesa anche al buio (non prende la luce della scena) */
  var conFiaccola=F.filter(function(f,j){ return j%6===0; }), fiaccole=new THREE.InstancedMesh(new THREE.BoxGeometry(.035,.05,.035),new THREE.MeshBasicMaterial({color:0xffa448}),Math.max(1,conFiaccola.length));
  fiaccole.frustumCulled=false; fiaccole.visible=false; RM.scene.add(fiaccole); conFiaccola.forEach(function(f,j){ f.fiaccola=j; });
  function posa(f,t){
    var s=f.s0, ry=f.ry;
    if(t>f.ts){ s=Math.max(f.s1,f.s0-(t-f.ts)*f.v); ry=s>0?VERSO_PORTA:VERSO_DENTRO; }
    var a=Math.abs(s), stretto=Math.min(1,Math.max(.1,(a-1)*.25)), p=punto(s,f.w0*stretto);
    var y=H(p[0],p[1]); metti(f.g,f.k,p[0],y,p[1],ry);
    if(f.fiaccola!=null) metti(fiaccole,f.fiaccola,p[0]+.04*Math.cos(ry),y+.24,p[1]-.04*Math.sin(ry),ry);
  }
  function disegna(t){
    F.forEach(function(f){ posa(f,t); }); K.forEach(function(f){ posa(f,t); });
    fanti.concat([cav,fiaccole]).forEach(function(g){ g.instanceMatrix.needsUpdate=true; });
    notte(.3+.7*RM.sfuma(1.2,4,t));
    var ap=RM.sfuma(5.2,7,t)*Math.PI*.48;      // i battenti si aprono verso la città
    batt.forEach(function(pv){ pv.children[0].rotation.y=pv.userData.k*dentroZ*ap; });      // ogni battente gira attorno al suo cardine, sul lato del passaggio
    mIn.visible=t<4.6; mGiu.visible=t>=4.6; mGio.visible=t>=4;
    RM.tempoFuochi('sacco410',t);
  }
  var tutte=[fisso,mIn,mGiu,mGio,cav,fiaccole].concat(fanti,batt.map(function(pv){ return pv.children[0]; }));
  /* le tre inquadrature: dentro la città, sopra le case, verso la porta e il campo; poi la porta da vicino; poi, più larga, la porta, la colonna e gli Horti Sallustiani */
  var yG=H(G[0],G[1]);
  /* 24 novembre 2026, dopo le prove sull'iPhone: viste più larghe; la terza da fuori le mura, a nord-est, sopra la cortina (prima c'era un tetto in primo piano) */
  var VA=mira(G[0]+fuori[0]*7,G[1]+fuori[1]*7,[G[0]+verso[0]*17+laV[0]*8,yG+11,G[1]+verso[1]*17+laV[1]*8]);
  var VB=mira(G[0]+verso[0]*1.2,G[1]+verso[1]*1.2,[G[0]+verso[0]*9+laV[0]*4,yG+5.5,G[1]+verso[1]*9+laV[1]*4]);
  var VC=mira(99,-194,[120,yG+11,-217]);
  var o=sequenza({fine:17, attesa:1.8, disegna:disegna, visibile:function(){ return fisso.visible; },
    righe:[[0,'1 · Il campo dei Goti davanti a porta Salaria'],[4,'2 · Di notte la porta si apre da dentro'],[8.4,'3 · I Goti entrano, le case bruciano']],
    azioni:[[3.6,function(){ var v=inquadra(VB); RM.volaA(v.t,v.c,1.6); }],[8.4,function(){ var v=inquadra(VC); RM.volaA(v.t,v.c,2.4); }]]});
  return {seq:o, tutte:tutte, da:409.6, a:411, vista:VA, g:fisso};
})();
/* la luce della notte: quella del comando «Notte» (RM.applicaLuce di js/base.js), solo mentre la scena del 410 è in vista; uscendo torna quella scelta da chi guarda */
var notteScena=false;
function notteUtente(){ var b=document.getElementById('btnNotte'); return b&&b.getAttribute('aria-pressed')==='true'?1:0; }
function notte(n){ if(!RM.applicaLuce) return; var u=notteUtente(); RM.applicaLuce(Math.max(u,n)); notteScena=true; }
function giornoDiNuovo(){ if(notteScena&&RM.applicaLuce){ RM.applicaLuce(notteUtente()); notteScena=false; } }
ANIMA[410]=function(){ avvia(S410.seq); };

/* ---------- 455: i Vandali portano via il bottino ----------
   Procopio, Guerre III 5, 3-5 (Dewing, LacusCurtius, letto il 23 novembre 2026): Genserico carica sulle navi l'oro e il tesoro imperiale, «having spared neither bronze nor anything else
   whatsoever in the palace»; «He plundered also the temple of Jupiter Capitolinus, and tore off half of the roof», di bronzo coperto d'oro; prende prigioniere Eudossia e le figlie.
   Qui: uomini sul tetto del tempio di Giove che ne smontano metà, le tegole dorate ammucchiate a terra, e una fila di carri e di prigionieri che esce da porta Portese verso Porto
   (Procopio dice solo che salpò con le navi: la strada e la fila sono uno schema). */
var vandali455=(function(){
  var B=new RM.Costruttore(), cx=-29, cz=0, ry=.5, c=Math.cos(ry), sn=Math.sin(ry), y0=H(cx,cz)+.2, i, lx, lz, x, z;
  function mondo(lx,lz){ return [cx+lx*c+lz*sn, cz-lx*sn+lz*c]; }
  vicine(B,'455',[cx,cz],function(){      // le tre scene del 455 (palazzo, tetto di Giove, fila verso il fiume) si dividono un tetto solo: si vedono nella stessa tappa
  for(i=0;i<34;i++){ lx=.3+rnd()*1.9; lz=(rnd()-.5)*5; var q=mondo(lx,lz); uomo(B,q[0],q[1],y0+.3+2.8+.22+.945*(1-lx/2.35)-.02,C.tunica,null,ry+(rnd()-.5)*2); }      // sul tetto, metà verso est
  for(i=0;i<14;i++){ var q2=mondo(3.3+rnd()*.7,(rnd()-.5)*4.6); B.scatola(.22,.05+rnd()*.12,.3,q2[0],H(q2[0],q2[1]),q2[1],C.oro,ry+(rnd()-.5)*.4); }      // le tegole dorate a terra
  for(i=0;i<22;i++){ var q3=mondo(3.1+rnd()*1.4,(rnd()-.5)*5); uomo(B,q3[0],q3[1],H(q3[0],q3[1]),C.tunica,null,rnd()*6.28); }
  },1);
  /* 24 novembre 2026: la fila non va più via per la campagna verso Porto, ma esce da porta Portese e scende al Tevere, dove le chiatte caricano il bottino. Procopio III 5, 3:
     Genserico mise l'oro e il tesoro «in his ships»; dove stessero le navi non lo dice: le chiatte sotto porta Portese sono uno schema, e la didascalia lo dice */
  var G=RM_TOPO.porte['Porta Portese'], d=[-.838,.546], A0=[G[0]+d[0]*3,G[1]+d[1]*3], curva=RM.curvaFiume, tm=0, mm=1e9, k;
  for(k=0;k<=2400;k++){ var qf=curva.getPoint(k/2400), df=Math.hypot(qf.x-A0[0],qf.z-A0[1]); if(df<mm){ mm=df; tm=k/2400; } }
  var F=curva.getPoint(tm), tg=curva.getTangent(tm), nr=[A0[0]-F.x,A0[1]-F.z], ln=Math.hypot(nr[0],nr[1]); nr=[nr[0]/ln,nr[1]/ln];
  var riva=[F.x+nr[0]*6.9,F.z+nr[1]*6.9], via=spezzata([G,A0,riva]);
  vicine(B,'455',riva,function(){
  for(i=0;i<56;i++){ var p=via(i/56,(i%3-1)*.18); if(RM.distFiume(p.x,p.z)<6.3) continue;
    if(i%5===0) carro(B,p.x,p.z,p.y,p.ry,i%10?C.oro:P.bronzo); else uomo(B,p.x,p.z,p.y,i%7?C.folla[i%C.folla.length]:C.bianco,null,p.ry,'folla'); }
  for(i=0;i<12;i++){ var p2=via(i/12,i%2?.7:-.7); if(RM.distFiume(p2.x,p2.z)<6.3) continue; cavaliere(B,p2.x,p2.z,p2.y,p2.ry,C.cavalloB,C.grigio); }
  var rb=Math.atan2(tg.x,tg.z);
  [-2.6,0,2.6].forEach(function(o,j){ var bx=F.x+nr[0]*3.6+tg.x*o, bz=F.z+nr[1]*3.6+tg.z*o; B.dentro(bx,-.55,bz,rb,function(B){ B.scatola(.5,.16,2.2,0,0,0,P.tronco);
    for(var c2=0;c2<4;c2++) B.scatola(.16,.08+.04*(c2%2),.22,(c2%2?.1:-.1),.16,-.6+c2*.4,c2%2?C.oro:P.bronzo); }); });      // le chiatte con il carico
  for(i=0;i<10;i++){ var xr=riva[0]-nr[0]*(.2+(i%3)*.15)+tg.x*(i-5)*.25, zr=riva[1]-nr[1]*(.2+(i%3)*.15)+tg.z*(i-5)*.25; uomo(B,xr,zr,H(xr,zr),C.grigio,null,Math.atan2(-nr[0],-nr[1])); }      // chi carica, sulla riva
  },2);
  var VR=mira(riva[0]-nr[0]*.5,riva[1]-nr[1]*.5,[F.x-nr[0]*13+tg.x*9,H(riva[0],riva[1])+9,F.z-nr[1]*13+tg.z*9]);
  return {g:maglia(B), da:454.6, a:456, vista:VR};
})();

/* 493, il teatro di Pompeo in restauro (24 novembre 2026, l'utente: «metti in costruzione il teatro»). Cassiodoro, Variae IV 51 (Teodorico a Simmaco, The Latin Library): il teatro
   «magna se mole solventem», le volte come «cryptas … excelsi montis»; va «roboranda», e il re paga «de nostro cubiculo». È il rinforzo di un edificio in piedi, non un cantiere da zero:
   un ponteggio su un tratto della facciata curva, operai sui piani e a terra, blocchi di tufo e travi, una gru a ruota. Quale tratto, quanti uomini e la gru sono uno schema; la lettera
   è degli anni 507-511 circa, la tappa è il 493: la scena sta nella tappa di Teodorico, come la didascalia. Le mura in restauro sono in js/mura.js. */
var teatro493=(function(){
  var r9=RM.casuale(493), B=new RM.Costruttore(), X0=-94.3, Z0=-30.8, RY=-Math.PI/2, cr=Math.cos(RY), sr=Math.sin(RY), i, k;
  function W(lx,lz){ return [X0+lx*cr+lz*sr, Z0-lx*sr+lz*cr]; }      // dal riferimento del teatro (cavea verso +z) al mondo
  var A0=.35, A1=1.15, NP=12, legno=P.tronco, tavola=RM.col(0x8a6a48), y0=H(X0,Z0)-.08;
  for(i=0;i<=NP;i++){ var a=A0+(A1-A0)*i/NP; [8.22,8.55].forEach(function(r){ var p=W(r*Math.cos(a),r*Math.sin(a)); B.scatola(.022,2.85,.022,p[0],y0,p[1],legno); }); }      // i pali, due file
  [.66,1.32,1.98,2.64].forEach(function(h){ for(i=0;i<NP;i++){ var a=A0+(A1-A0)*i/NP, b=A0+(A1-A0)*(i+1)/NP, rm=8.39, p=W(rm*Math.cos(a),rm*Math.sin(a)), q=W(rm*Math.cos(b),rm*Math.sin(b));
    fune(B,[p[0],y0+h,p[1]],[q[0],y0+h,q[1]],.035,tavola); fune(B,[p[0],y0+h+.02,p[1]],[q[0],y0+h+.02,q[1]],.035,tavola); } });      // i piani di tavole
  for(i=0;i<NP;i+=2){ var a2=A0+(A1-A0)*i/NP, b2=A0+(A1-A0)*(i+2)/NP, p2=W(8.6*Math.cos(a2),8.6*Math.sin(a2)), q2=W(8.6*Math.cos(b2),8.6*Math.sin(b2)); fune(B,[p2[0],y0,p2[1]],[q2[0],y0+1.32,q2[1]],.016,legno); }      // le diagonali
  vicine(B,'493',W(8.4*Math.cos(.75),8.4*Math.sin(.75)),function(){
  for(i=0;i<14;i++){ var a3=A0+r9()*(A1-A0), h3=[0,.66,1.32,1.98][(r9()*4)|0], r3=h3?8.39:8.9+r9()*.8, p3=W(r3*Math.cos(a3),r3*Math.sin(a3)); uomo(B,p3[0],p3[1],y0+h3+(h3?.035:0),C.tunica,null,RY+a3+(r9()-.5)); }      // gli operai
  });
  for(k=0;k<3;k++){ var a4=.5+k*.25, p4=W(10*Math.cos(a4),10*Math.sin(a4)); for(i=0;i<7;i++) B.scatola(.12,.06,.08,p4[0]+(r9()-.5)*.45,y0+(i>3?.06:0),p4[1]+(r9()-.5)*.45,P.tufo,r9()); }      // blocchi di tufo
  var pt=W(10.2*Math.cos(1.05),10.2*Math.sin(1.05)); for(i=0;i<6;i++) B.scatola(.9,.025,.03,pt[0],y0+i*.025,pt[1]+(i%3)*.04,legno,.3);      // travi
  /* la gru a ruota (un'ipotesi: ce n'erano nei cantieri romani; qui non è nella fonte) */
  var pg=W(9.6*Math.cos(.75),9.6*Math.sin(.75)), rg=RY+.75;
  B.dentro(pg[0],y0,pg[1],rg,function(B){ var ru=new THREE.CylinderGeometry(.3,.3,.08,16,1,true); ru.rotateX(Math.PI/2); ru.translate(0,.32,0); B.geo(ru,legno);
    B.scatola(.03,.4,.03,0,0,-.06,legno).scatola(.03,.4,.03,0,0,.06,legno); });
  fune(B,[pg[0],y0+.3,pg[1]],[W(8.4*Math.cos(.75),8.4*Math.sin(.75))[0],y0+3.1,W(8.4*Math.cos(.75),8.4*Math.sin(.75))[1]],.03,legno);      // il braccio, appoggiato sopra la facciata
  var g=maglia(B), C0=W(8.4*Math.cos(.75),8.4*Math.sin(.75));
  /* tre tempi (24 novembre 2026, l'utente: «troppo zoom sul teatro, e non passa al Colosseo»): il teatro intero col ponteggio, il tratto di mura in restauro (js/mura.js:
     dove fosse non è detto, qui il più vicino al teatro), il Colosseo con la caccia agli orsi (i giochi più sotto) */
  var VT=mira(X0-1,Z0+2,[C0[0]-15,H(X0,Z0)+11,C0[1]+17]);
  var MT=RM.muraTeodorico||[[-118,-38]], mx=0, mz=0; MT.forEach(function(q){ mx+=q[0]/MT.length; mz+=q[1]/MT.length; });
  var VM=mira(mx,mz,[mx-12,H(mx,mz)+9,mz+4]);      // da sopra il Tevere: davanti il muro col ponteggio, dietro la città
  var VK=mira(57,26,[67,H(57,26)+10.5,41]);
  var o=sequenza({fine:15, attesa:1.8, disegna:function(){}, visibile:function(){ return g.visible; },
    righe:[[0,'1 · Il teatro di Pompeo si restaura'],[5,'2 · Si riparano le mura (il tratto è un’ipotesi)'],[10,'3 · Al Colosseo, la caccia agli orsi']],
    azioni:[[5,function(){ var v=inquadra(VM); RM.volaA(v.t,v.c,2.2); }],[10,function(){ var v=inquadra(VK); RM.volaA(v.t,v.c,2.4); }]]});
  return {g:g, da:492.6, a:494, vista:VT, seq:o};
})();
ANIMA[493]=function(){ avvia(teatro493.seq); };

/* 455, il palazzo spogliato (24 novembre 2026, l'utente: «non si vede il bronzo trafugato dal palazzo imperiale»). Procopio, Guerre III 5, 1-5 (Dewing, letto il 24 novembre):
   Genserico «took possession of the palace», carica sulle navi «an exceedingly great amount of gold and other imperial treasure», «having spared neither bronze nor anything
   else whatsoever in the palace», e prende prigioniere Eudossia con le figlie Eudocia e Placidia. Nessun incendio (Prospero: il papa ottiene che si risparmino fuoco, stragi e torture).
   Qui, sul Palatino davanti al palazzo: carri carichi di bronzo e d'oro, uomini che portano fuori pezzi di bronzo, un mucchio di bottino a terra, le tre prigioniere fra le guardie.
   Che cosa fosse il bronzo Procopio non lo dice: statue, porte, arredi, tegole sono possibili, e le forme qui sono generiche; posto, numeri e colori sono uno schema.
   La regia va dal palazzo al Campidoglio (il mezzo tetto di Giove) e poi alla fila verso Porto. */
var palazzo455=(function(){
  var r5=RM.casuale(455), B=new RM.Costruttore(), cx=18.5, cz=35.5, i, x, z, VAND=C.grigio;
  for(i=0;i<10;i++){ x=cx-2.2+i*.75; z=cz+(i%2)*.5-(i>5?(i-5)*.5:0); carro(B,x,z,H(x,z),2.4+(r5()-.5)*.3,i%3===1?C.oro:P.bronzo); }      // i carri, in fila verso la discesa al Foro
  for(i=0;i<16;i++){ x=cx-2.6+r5()*5; z=cz-1.6+r5()*.9; B.scatola(.12+r5()*.12,.05+r5()*.12,.1+r5()*.14,x,H(x,z),z,r5()<.3?C.oro:P.bronzo,r5()*3); }      // il mucchio del bottino: pezzi di bronzo e d'oro, di forma generica
  vicine(B,'455',[cx,cz],function(){
  for(i=0;i<22;i++){ x=cx-3+r5()*6; z=cz-2.4+r5()*3.4; var y=H(x,z), ry=r5()*6.28, porta=i%2===0;
    uomo(B,x,z,y,VAND,null,ry); if(porta) B.scatola(.09,.05,.07,x,y+.19,z,r5()<.25?C.oro:P.bronzo,ry); }      // chi porta fuori e chi carica: un pezzo sulle spalle
  var pz=[cx+2.6,cz+1.4], prig=[[0,0,C.porpora],[.12,.06,C.bianco],[-.12,.06,C.bianco]];      // Eudossia e le figlie, fra quattro guardie (l'imperatrice in porpora)
  prig.forEach(function(q){ var xx=pz[0]+q[0], zz=pz[1]+q[1]; uomo(B,xx,zz,H(xx,zz),q[2],null,2.4,'donna'); });
  [[-.3,-.2],[.3,-.2],[-.3,.35],[.3,.35]].forEach(function(q){ var xx=pz[0]+q[0], zz=pz[1]+q[1]; uomo(B,xx,zz,H(xx,zz),VAND,C.cavalloB,2.4); B.scatola(.01,.28,.01,xx+.03,H(xx,zz),zz,P.tronco); });
  },0);
  var g=maglia(B);
  var VP=mira(cx-1,cz+2,[cx+12,H(cx,cz)+8,cz-11]), VG=mira(-29,0,[-13,22,-15]);      // più larghe (24 novembre 2026): il palazzo intero, il tempio intero
  var o=sequenza({fine:16, attesa:1.8, disegna:function(){}, visibile:function(){ return g.visible; },
    righe:[[0,'1 · Il palazzo imperiale spogliato'],[4.5,'2 · Il tetto di Giove Capitolino'],[10,'3 · Il bottino scende alle navi']],
    azioni:[[4.5,function(){ var v=inquadra(VG); RM.volaA(v.t,v.c,2.4); }],[10,function(){ var v=inquadra(vandali455.vista); RM.volaA(v.t,v.c,2.6); }]]});
  return {g:g, da:454.6, a:456, seq:o, vista:VP};
})();
ANIMA[455]=function(){ avvia(palazzo455.seq); };

/* ---------- 663: Costante II porta via il bronzo ----------
   Liber Pontificalis, vita di Vitaliano (Duchesne I p. 343, letto sul testo il 23 novembre 2026): «Omnia quae erant in aere ad ornatum civitatis deposuit, sed et ecclesiam beatae Mariae
   ad Martyres, quae de tegulis aereis erat, discooperuit et in regia urbe cum alia diversa quas deposuerat direxit». Qui: uomini sulla cupola del Pantheon che tolgono le tegole,
   le tegole a terra davanti al portico e i carri verso il Tevere, dove le aspetta una barca (la strada e la barca sono uno schema: la fonte dice solo che le mandò a Costantinopoli). */
var costante663=(function(){
  var B=new RM.Costruttore(), cx=-70, cz=-68, y0=H(cx,cz), i, a, r, x, z;
  vicine(B,'663',[cx,cz-3],function(){
  for(i=0;i<40;i++){ a=rnd()*6.283; r=.7+rnd()*1.45; x=cx+Math.cos(a)*r; z=cz+Math.sin(a)*r; uomo(B,x,z,y0+3.6+2.24*.44*Math.sqrt(1-r*r/(2.24*2.24))-.03,C.tunica,null,a); }
  for(i=0;i<12;i++){ a=rnd()*6.283; x=cx+Math.cos(a)*2.55; z=cz+Math.sin(a)*2.55; uomo(B,x,z,y0+3.12+(2.74-2.55)*.6,C.tunica,null,a); }
  for(i=0;i<16;i++){ x=cx+(rnd()-.5)*4; z=cz-5.4-rnd()*2.2; B.scatola(.24,.05+rnd()*.1,.3,x,H(x,z),z,P.bronzo,rnd()); }      // davanti al portico, che guarda a nord
  var F=vicinoAlFiume(cx,cz-6), A=[cx,cz-7], v=[F.x-A[0],F.z-A[1]], L=Math.hypot(v[0],v[1]), d=[v[0]/L,v[1]/L], rv=Math.atan2(d[0],d[1]);
  for(i=0;i<9;i++){ var s=1+i*(L-9)/9; x=A[0]+d[0]*s; z=A[1]+d[1]*s; if(RM.distFiume(x,z)<6.3) continue; carro(B,x,z,H(x,z),rv,P.bronzo); uomo(B,x-d[1]*.2,z+d[0]*.2,H(x,z),C.tunica,null,rv); }
  var bx=F.x-d[0]*4.6, bz=F.z-d[1]*4.6; B.dentro(bx,-.55,bz,rv+Math.PI/2,function(B){ B.scatola(.5,.18,2.2,0,0,0,P.tronco).scatola(.04,1.1,.04,0,.18,0,P.tronco).scatola(.4,.08,.6,0,.18,.3,P.bronzo); });
  for(i=0;i<6;i++) uomo(B,F.x-d[0]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,F.z-d[1]*(6.6+rnd()*.6)+(rnd()-.5)*1.4,H(F.x-d[0]*6.8,F.z-d[1]*6.8),C.tunica,null,rv);
  });
  return {g:maglia(B), da:662.6, a:664};
})();

/* ---------- 852: Leone IV benedice le mura nuove ----------
   Liber Pontificalis, vita di Leone IV, 72-73 (Duchesne II pp. 123-124, letto sul testo il 23 novembre 2026): vescovi, sacerdoti e tutti gli ordini del clero «per totum murorum
   ambitum, nudis pedibus, cinerem portantes in capite, circuirent», spargendo acqua benedetta «transeuntes per murum»; il papa recita tre preghiere sulle mura: sulla porta «que respicit
   ad sanctum Peregrinum», sulla postierla presso Castel Sant'Angelo e su quella «que respicit ad scolam Saxonum». Il giorno, 27 giugno 852, è quello della didascalia.
   Qui il clero in fila sul cammino delle mura (il tracciato è quello di js/monumenti.js) e il papa con il suo gruppo sopra porta San Pellegrino, la prima preghiera. */
/* 24 novembre 2026, dopo le prove sull'iPhone («gli omini che fluttuano… non si capisce che siano»): il gruppo del papa era un cerchio di 14 figure largo 10 m attorno al punto
   della porta, mentre il muro è spesso 4,5 m: metà del cerchio stava nel vuoto. E la quota delle figure era quella del terreno «come è disegnato» (H), che sulle strade sta un metro
   più su. Ora tutti stanno sul cammino di ronda: la cima del muro di js/monumenti.js (RM.h + 1,05), in fila, uno dietro l'altro come in una processione; dove c'è una torre
   (una ogni quattro tratti, più alta) la fila si interrompe. Sopra porta San Pellegrino il papa con la croce e il suo seguito, in fila lungo il muro. */
var leone852=(function(){
  var B=new RM.Costruttore(), L=[[-163,-120],[-233.3,-121],[-250,-124],[-272,-127],[-294,-124.5],[-300,-119],[-307,-111],[-313,-100.5],[-304,-96.5],[-285,-89],[-262,-87],[-240.2,-87.7],[-212,-86.5],[-196.5,-86.7],[-187,-84]],
      via=spezzata(L), lung=via(0).lung, n=Math.round(lung/.36), i, p, PP=RM_TOPO.porte['Porta San Pellegrino'], torri=[], r2=RM.casuale(852);
  for(i=0;i<L.length-1;i++){ var a=L[i], b=L[i+1], len=Math.hypot(b[0]-a[0],b[1]-a[1]), m=Math.max(1,Math.round(len/3.2)); for(var k=0;k<m;k++) torri.push([a[0]+(b[0]-a[0])*(k+.5)/m, a[1]+(b[1]-a[1])*(k+.5)/m]); }
  torri=torri.filter(function(q,j){ return j%4===0; });      // le torri: come in js/monumenti.js (LEO), una ogni quattro tratti
  function cima(x,z){ return RM.h(x,z)+1.05; }
  function libero(x,z){ return !torri.some(function(q){ return Math.hypot(q[0]-x,q[1]-z)<.62; }); }
  var tp=0; for(i=0;i<n;i++){ var d=via(i/n,0); if(Math.hypot(d.x-PP[0],d.z-PP[1])<1.1){ tp=i; } }      // dov'è la porta lungo il giro
  /* le persone (24 novembre 2026): clero e papa in veste lunga, scalzi («nudis pedibus»); il papa con la veste che la scena gli dava (oro), il seguito in bianco e in lana
     chiara (prima in parte in porpora: i colori delle vesti dell'852 non sono nelle fonti lette, e la porpora resta a chi la portava) */
  vicine(B,'852',PP,function(){
  for(i=0;i<n;i++){ p=via(i/n,0); if(Math.abs(i-tp)<4 || !libero(p.x,p.z)) continue; uomo(B,p.x,p.z,cima(p.x,p.z),i%9?C.bianco:C.tunica,null,p.ry,'scalzo'); }      // il clero in fila sul cammino
  for(i=-3;i<=3;i++){ p=via((tp+i*.75)/n,0); if(!libero(p.x,p.z)) continue; if(i===0){ uomo(B,p.x,p.z,cima(p.x,p.z),C.oro,null,p.ry,'scalzo'); insegna(B,p.x+.03,p.z,cima(p.x,p.z),C.oro,.4); } else uomo(B,p.x,p.z,cima(p.x,p.z),i%2?C.bianco:C.tunica,null,p.ry,'scalzo'); }      // sopra la porta: il papa con la croce e il seguito
  for(i=0;i<300;i++){ var t=r2(), q=via(t,(r2()<.5?-1:1)*(1.2+r2()*1.6)); if(RM.distFiume(q.x,q.z)<6.3) continue; uomo(B,q.x,q.z,q.y,C.folla[(r2()*C.folla.length)|0],null,q.ry+(r2()-.5)*2,'folla'); }      // il popolo sotto le mura
  });
  var vp=via(tp/n,0);
  return {g:maglia(B), da:851.6, a:853, porta:[vp.x,vp.z]};
})();

/* ---------- 852 in due tempi (24 novembre 2026, l'utente: prima il terremoto sul Colosseo, poi San Pietro e le mura che si costruiscono fino a chiudersi) ----------
   (a) Il terremoto dell'847. Il Liber Pontificalis (vita di Leone IV) lo ricorda; che abbia fatto cadere ciò che restava del lato sud del Colosseo lo scrivono Platner e Ashby (1929,
       senza dire su quale fonte) e oggi il Parco archeologico: un'ipotesi, che la didascalia dichiara. Qui la scossa (scuoti), il settore sud che cede (uSud nello shader del
       Colosseo, da quanto era già smontato a quanto ne manca dopo l'847: js/monumenti.js), la polvere e i blocchi di travertino a terra, che restano.
   (b) Il volo sul Borgo: le mura leonine salgono dal basso (uCant, come i cantieri dei monumenti), mentre in alto scorrono gli anni dal 848 al 852 (CANTIERI: «Leone IV avvia i lavori
       nell'848»); i quattro anni durano otto secondi, e la scritta lo dice. Finite le mura, la processione del 27 giugno 852 che c'era già (leone852) e la vista su porta San Pellegrino.
   Chi lavorasse alle mura non si vede: le fonti lette non lo dicono (Wikipedia, che cita Ward-Perkins e Gregorovius, parla di contadini delle tenute della Chiesa e di prigionieri
   saraceni, ma il Liber Pontificalis non è stato riletto). Con meno animazioni: niente scossa, mura finite, vista su San Pietro. */
var S852=(function(){
  var col=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='colosseo'; })[0], leo=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='leonine'; })[0];
  if(!col||!col.mat||!leo||!leo.mat) return null;
  var rC=RM.casuale(847), B=new RM.Costruttore(), cr=Math.cos(col.ry), sr=Math.sin(col.ry), i;
  function W(lx,lz){ return [col.x+lx*cr+lz*sr, col.z-lx*sr+lz*cr]; }
  var dir=Math.atan2(.955,.296), y0=col.g.position.y;      // il settore sud nello shader: la direzione (0,296, 0,955) del riferimento del Colosseo
  for(i=0;i<90;i++){ var sg=rC()<.5?-1:1, an=dir+sg*(.63+rC()*.95), rr=1.02+rC()*.22, p=W(9.4*rr*Math.cos(an),7.8*rr*Math.sin(an));      // fuori dall'anello, nel tratto che cade nell'847
    B.scatola(.12+rC()*.14,.06+rC()*.08,.08+rC()*.1,p[0],y0+rC()*.1,p[1],P.travertino,rC()*3); }
  var macerie=B.maglia(RM.matPietra()); macerie.visible=false; macerie.castShadow=true; RM.scene.add(macerie);
  var mp=new THREE.MeshBasicMaterial({color:0xd6cbb6,transparent:true,opacity:0,depthWrite:false}), polvere=[];
  for(i=0;i<8;i++){ var an2=dir+(i-3.5)*.3, q=W(9.6*Math.cos(an2),8*Math.sin(an2)), m=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8),mp); m.position.set(q[0],y0+1.5,q[1]); m.visible=false; RM.scene.add(m); polvere.push(m); }
  /* la scritta degli anni */
  var riq=document.querySelector('.riquadro.roma'), anni=null;
  if(riq){ anni=document.createElement('div'); anni.setAttribute('aria-hidden','true');
    anni.style.cssText='position:absolute;left:50%;top:'+(window.innerWidth<700?104:50)+'px;transform:translateX(-50%);z-index:4;pointer-events:none;text-align:center;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.75);font-family:Cinzel,Georgia,serif;font-size:26px;line-height:1.15;display:none';
    riq.appendChild(anni); }
  var SUD0=.2, SUD1=.5, TC=.6, MURA0=7.6, MURA1=15.6, PROC=16;
  function disegna(t){
    var k=RM.sfuma(TC,TC+2.2,t), us=col.mat.userData.u;
    us.uSud.value=SUD0+(SUD1-SUD0)*k; macerie.visible=k>.3;
    var pv=t>TC+.3&&t<TC+6.5; mp.opacity=pv?.42*RM.sfuma(TC+.3,TC+1.2,t)*(1-RM.sfuma(TC+3.5,TC+6.5,t)):0;
    polvere.forEach(function(m,j){ m.visible=pv; var g=.6+1.2*RM.sfuma(TC+.3,TC+4,t)+(j%3)*.2; m.scale.set(g,g*.7,g); m.position.y=y0+1.2+1.2*RM.sfuma(TC+.3,TC+5,t); });
    var km=Math.max(.02,RM.sfuma(MURA0,MURA1,t)); leo.mat.userData.u.uCant.value=km>=1?1:km; leo.g.scale.y=1; leo.g.visible=true;
    if(anni){ var su=t>MURA0-.6&&t<PROC+.6&&FERMA==null; anni.style.display=su?'block':'none';
      if(su) anni.innerHTML=(848+Math.min(4,Math.floor(4.999*RM.sfuma(MURA0,MURA1,t))))+'<div style="font:500 12px/1.3 system-ui,sans-serif;margin-top:2px">le mura leonine salgono: quattro anni in pochi secondi</div>'; }
    leone852.g.visible=t>=PROC;
  }
  var VC=mira(W(9.4*1.05*Math.cos(dir),7.8*1.05*Math.sin(dir))[0],W(9.4*1.05*Math.cos(dir),7.8*1.05*Math.sin(dir))[1],(function(){ var c=W(9.4*4.3*Math.cos(dir-.5),7.8*4.3*Math.sin(dir-.5)); return [c[0],y0+13,c[1]]; })());
  var VB=mira(-246,-106,[-196,34,-50]);      // il Borgo da sud-est, alto: tutto il giro delle mura attorno a San Pietro
  var o=sequenza({fine:21, attesa:1.8, disegna:disegna, visibile:function(){ return leone852.g.visible||t852; },
    righe:[[0,'1 · 847: il terremoto, e il Colosseo (un’ipotesi)'],[5.6,'2 · 848-852: si costruiscono le mura leonine'],[16,'3 · 27 giugno 852: il clero percorre le mura in processione']],
    azioni:[[TC,function(){ scuoti(0,3,.22); }],[5.6,function(){ var v=inquadra(VB); RM.volaA(v.t,v.c,2.4); }],[PROC,function(){ var v=inquadra(VISTE.leonina852); RM.volaA(v.t,v.c,2.4); }]]});
  return {seq:o, vista:MENO?null:VC, macerie:macerie, anni:anni, col:col, leo:leo};
})();
var t852=false;      // vero nell'anno della tappa: la scena si vede anche quando la processione è ancora nascosta

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
  /* le persone (24 novembre 2026): prima il papa e il clero sui gradini, poi Carlo, le bandiere e i capi, poi il seguito, poi i gruppi lungo il portico */
  vicine(B,'800',[-247,-108],function(){
  for(i=0;i<36;i++){ x=-247.9+(i%4)*.22; z=Z-1.9+(i>>2)*.42+(rnd()-.5)*.1; uomo(B,x,z,H(x,z)+.07,i<8?C.oro:C.bianco,null,e,'clero'); }      // vescovi e clero
  uomo(B,-247.1,Z,H(-247.1,Z)+.07,C.oro,null,e,'papa'); insegna(B,-247.1,Z-.22,H(-247.1,Z)+.07,C.oro,.45);                              // il papa e la croce
  },0);
  /* le bandiere della città («vexilla», Annali dei Franchi, 800): più grandi e più numerose (23 novembre 2026, l'utente: «metti delle bandiere»), lungo il lato nord della corsia
     e fra le colonne del portico; colori e forma sono uno schema */
  function bandiera(B,x,z,y,col,alta){ B.scatola(.016,alta,.016,x,y,z,P.tronco).scatola(.17,.12,.01,x+.085,y+alta-.13,z,col).scatola(.06,.05,.01,x+.03,y+alta-.18,z,col); }
  for(i=0;i<26;i++){ x=-242+i*1.75; z=zA(x)-(i%2?CO+.5:.66); bandiera(B,x,z,H(x,z),[C.rosso,C.oro,C.bianco,C.porpora][i%4],.55); }
  vicine(B,'800',[-247,-108],function(){
  [-239,-231,-223,-214,-205,-196,-187].forEach(function(cx,k){                                                                            // i gruppi di pellegrini e di cittadini, «per congrua loca»
    var cz=zA(cx)-CO-(k%2?2.3:1.25), col=k%2?C.folla:[C.tunica,C.bianco,C.folla[2],C.folla[5]];
    for(var j=0;j<45;j++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*1.2, xx=cx+Math.cos(a)*r*1.6, zz=cz+Math.sin(a)*r*.45; if(RM.distFiume(xx,zz)<6.3) continue;
      uomo(B,xx,zz,H(xx,zz),col[(rnd()*col.length)|0],null,Math.atan2(cx-xx,zA(cx)-CO-zz),'folla'); } });
  },4);
  var g=maglia(B);
  /* il corteo, a istanze; via(t,lat) dà punto e verso lungo il percorso. Carlo a cavallo in blu, a piedi con il mantello blu sopra la tunica (Eginardo, Vita Karoli 23:
     «sago veneto amictus»), a capo scoperto: niente corona il 24 novembre */
  var via=spezzata(V800.L), LUN=via(0).lung, D=108.8, FINE=24, VIAGGIO=20;
  var cav=[istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.ferro); },35,'800','seguito',3), istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.ferro); },35,'800','seguito',3)];
  var capi=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,franco); },8,'800','capi',2);      // qualche cavaliere dei Franchi in blu, come prima
  var band=[C.rosso,C.oro,C.bianco,C.porpora].map(function(col){ return istanze(function(B){ uomo(B,0,0,0,C.tunica,null,0); bandiera(B,.03,0,0,col,.55); },2,'800','bandiere',1); });
  var re=istanze(function(B){ cavaliere(B,0,0,0,0,C.bianco,franco); },1,'800','carlo',1), cavallo=istanze(function(B){      // il cavallo, senza cavaliere
    B.scatola(.055,.085,.025,0,0,.08,C.bianco).scatola(.055,.085,.025,0,0,-.08,C.bianco).scatola(.06,.07,.22,0,.08,0,C.bianco).scatola(.04,.1,.05,0,.13,.095,C.bianco).scatola(.035,.04,.09,0,.2,.135,C.bianco); },1,'800','carlo',1,
    function(B){ cavaliere(B,0,0,0,0,C.bianco,null,true); });
  var aPiedi=istanze(function(B){ uomo(B,0,0,0,franco,null,0,'carlo'); },1,'800','carlo',1);
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
  var o=sequenza({fine:FINE, attesa:1.8, disegna:disegna, visibile:function(){ return g.visible; }, righe:[[0,'1 · Il corteo di Carlo passa il Tevere'],[VIAGGIO,'2 · Il papa lo accoglie sui gradini di San Pietro']],
    azioni:[[0,function(){ RM.segui(function(k){ return inquadra(k*VIAGGIO); },VIAGGIO); }],
            [VIAGGIO,function(){ var v=alto(RM.adatta({t:[-244,-107.5],c:[-232.5,11.5,-120.5]})); RM.volaA(v.t,v.c,2.5); }]]});      // un poco più alta (24 novembre 2026): sul telefono, allontanata, la camera aveva un tetto del portico davanti
  var v0=inquadra(0);
  return {g:g, tutte:tutte, seq:o, da:799.6, a:801, vista:{t:[v0.t[0],v0.t[2]],c:[v0.t[0]+18,v0.t[1]+15,v0.t[2]-20]}};
})();
ANIMA[800]=function(){ avvia(carlo800.seq); };
if(S852) ANIMA[852]=function(){ avvia(S852.seq); };

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
  vicine(B,'846',[-188,-93],function(){      // il punto guardato dalla regia (VISTE.saraceni846)
  for(i=0;i<70;i++){ var f=rnd(), a=curva.getPoint(t0), xx=a.x-9+(SP[0]-a.x+9)*f+(rnd()-.5)*5, zz=a.z+(SP[1]-a.z)*f+(rnd()-.5)*5; if(RM.distFiume(xx,zz)<6.4) continue;
    cavaliere(B,xx,zz,H(xx,zz),Math.atan2(SP[0]-xx,SP[1]-zz),rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }                 // dalle navi verso la basilica
  for(i=0;i<50;i++){ var an=rnd()*6.283, r=3+rnd()*3; x=SP[0]+3+Math.cos(an)*r*1.3; z=SP[1]+Math.sin(an)*r; cavaliere(B,x,z,H(x,z),rnd()*6.28,rnd()<.5?C.cavalloB:C.cavalloC,C.bianco); }      // attorno all'atrio
  for(var fila=0;fila<5;fila++) for(i=0;i<34;i++){ x=-246+i*.5+(rnd()-.5)*.15; z=-133+fila*.55; uomo(B,x,z,H(x,z),fila<2?C.ferro:C.tunica,fila<3?C.rosso:null,Math.PI); }      // la milizia romana nel campo di Nerone, rivolta a sud
  });
  for(i=0;i<5;i++) insegna(B,-243+i*3.5,-130.6,H(-243+i*3.5,-130.6),C.rosso,.42);
  var g=maglia(B); navi.forEach(function(nv){ g.add(nv.m); });      // le navi seguono la scena: visibili solo nell'anno della tappa
  return {g:g, da:845.6, a:847, navi:navi, posa:posa};
})();
/* l'arrivo: la vista vola sul Borgo (circa due secondi), poi le navi risalgono il fiume in nove secondi; la scena (cavalieri, milizia) compare quando sono ormeggiate.
   Con meno animazioni niente viaggio: le navi sono già all'ormeggio */
var VIAGGIO=.05;      // quanto più a valle partono, in frazione del fiume (circa 70 m)
/* dal 24 novembre 2026 è una sequenza (in testa al file): parte con la regia e il suo tempo si ferma quando la scena non si vede */
var seq846=sequenza({fine:9, attesa:1.8, visibile:function(){ return saraceni846.g.visible; }, righe:[[0,'1 · Le navi saracene risalgono il Tevere'],[8.6,'2 · I cavalieri sbarcano e assalgono San Pietro']], disegna:function(t){
  var k=t/9, e=1-Math.pow(1-k,3);
  saraceni846.navi.forEach(function(nv,j){ saraceni846.posa(nv,nv.t+VIAGGIO*(1-e)*(1+.15*(j%4))); });
  saraceni846.g.material.visible=k>=1; saraceni846.g.children.forEach(function(c){ if(c.userData.persone) c.visible=k>=1; }); }});      // cavalieri e milizia quando le navi sono arrivate (le persone hanno un materiale loro)
ANIMA[846]=function(){ avvia(seq846); };

/* ---------- 546: Totila entra da porta Asinaria ----------
   Procopio VII 20: di notte quattro Isauri della guardia aprono la porta Asinaria e i Goti entrano; VII 22 e il continuatore di Marcellino Comes (a. 547): la città svuotata, incendi soprattutto
   oltre il Tevere (i fuochi stanno in EVENTI). Qui una colonna di Goti, alcuni con le fiaccole, che passa la porta e scende verso il Laterano; dopo qualche secondo la vista va su Trastevere
   che brucia (23 novembre 2026, l'utente: «fai vedere che entra da qui e l'incendio in Trastevere»). Numero e ordine della colonna sono uno schema. */
var totila546=(function(){
  var B=new RM.Costruttore(), G=[193.8,75.8], d=[.93,.36], n=[-.36,.93], i, f, x, z, fiamma=RM.col(0xffa040);
  vicine(B,'546',G,function(){
  for(i=0;i<320;i++){ f=rnd(); var lat=(rnd()-.5)*.9, lung=16-f*30;       // da 16 unità fuori a 14 dentro
    x=G[0]+d[0]*lung+n[0]*lat; z=G[1]+d[1]*lung+n[1]*lat;
    var y=H(x,z); uomo(B,x,z,y,rnd()<.5?C.ferro:C.grigio,rnd()<.6?C.cavalloB:null,Math.atan2(-d[0],-d[1]));
    if(i%9===0) B.scatola(.012,.12,.012,x+.03,y+.12,z,P.tronco).scatola(.03,.04,.03,x+.03,y+.25,z,fiamma);      // fiaccole
  }
  for(i=0;i<4;i++){ x=G[0]-d[0]*1.2+n[0]*(i-1.5)*.4; z=G[1]-d[1]*1.2+n[1]*(i-1.5)*.4; uomo(B,x,z,H(x,z),C.tunica,null,Math.atan2(d[0],d[1])); }      // i quattro Isauri che hanno aperto
  });
  return {g:maglia(B), da:545.6, a:547};
})();
/* da porta Asinaria a Trastevere, che brucia: sette secondi dopo l'arrivo (dal 24 novembre 2026 è una sequenza, che parte con la regia) */
var seq546=sequenza({fine:9.5, attesa:0, visibile:function(){ return totila546.g.visible; }, disegna:function(){}, righe:[[0,'1 · Di notte Totila entra da porta Asinaria'],[7,'2 · Trastevere brucia']],
  azioni:[[7,function(){ var v=alto(RM.adatta({t:[-118,50],c:[-84,34,90]})); RM.volaA(v.t,v.c); }]]});
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
  vicine(B2,'552',[-163,-126],function(){      // il punto guardato dalla regia (VISTE.fortino552)
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
  });
  var g2=B2.maglia(RM.matPietra()); g2.visible=false; g2.castShadow=true; RM.scene.add(g2);
  return {g:g, g2:g2, da:550, a:556, da2:551.6, a2:553};
})();

/* ---------- i giochi nel Colosseo, finché è in uso (24 novembre 2026, l'utente: «tutte le volte che il Colosseo è ancora in funzione mostra dentro i giochi») ----------
   Che cosa: Platner e Ashby, «Amphitheatrum Flavium»: «the last gladiatorial combats occurred in 404» (Teodoreto V 26), «the last recorded venationes … took place in 523»
   (Cassiodoro, Variae V 42). Quindi: fino al 403 coppie di gladiatori e una caccia; dal 404 al 523 solo la caccia, con gli orsi e gli attrezzi che descrive Cassiodoro (V 42:
   l'asta di legno con cui si corre incontro alla belva, il salto sopra di lei, il muro portatile di canne in cui ci si chiude «ericii exemplo», le porte a grata dietro cui ci si
   nasconde); dal 523 l'arena è vuota. Il pubblico siede sulle gradinate (js/monumenti.js: le tre fasce di sedili), prima nei posti più bassi, ed è più rado quando la città si spopola
   (CURVE.popolazione: al massimo un posto su sei pieno, nel 235). Numeri, colori, posizioni e figure sono uno schema; le figure sono a grandezza vera, il pubblico è a istanze. */
var giochi=(function(){
  var col=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='colosseo'; })[0]; if(!col||!col.g) return null;
  var rG=RM.casuale(80), gruppo=new THREE.Group(); gruppo.position.copy(col.g.position); gruppo.rotation.y=col.ry; RM.scene.add(gruppo);
  /* i posti: [x, y, z, rango]; an(r) è l'ellisse delle gradinate, raggi r e r-1,6 */
  var FASCE=[[4.62,6.1,.52,1.75,10],[6.1,7.5,2.05,3.35,8],[7.75,8.4,3.78,4.2,3]], posti=[];
  FASCE.forEach(function(f,fi){ for(var j=0;j<f[4];j++){ var ra=f[0]+(f[1]-f[0])*(j+.55)/f[4], y=f[2]+(f[3]-f[2])*(j+1)/f[4], per=Math.round(ra*6.283/.09);
    for(var k=0;k<per;k++){ var a=(k+rG()*.6)/per*6.283; posti.push([ra*Math.cos(a), y, (ra-1.6)*Math.sin(a), fi*20+j+rG()*14]); } } });
  posti.sort(function(p,q){ return p[3]-q[3]; });
  var NMAX=RM.piccolo?300:1100, tinte=[C.bianco,C.folla[0],C.folla[1],C.folla[2],C.folla[4]], O=new THREE.Object3D();
  var pub=tinte.map(function(t){ var B=new RM.Costruttore(); B.scatola(.045,.075,.045,0,0,0,t).scatola(.028,.03,.028,0,.075,0,C.pelle); var g=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),Math.ceil(NMAX/tinte.length)); g.frustumCulled=false; g.count=0; gruppo.add(g); return g; });
  var passo=Math.max(1,Math.floor(posti.length/(NMAX*1.2))), scelti=[];      // un posto ogni tanto, sparsi su tutto l'anello
  for(var i=0;i<posti.length&&scelti.length<NMAX;i+=passo) scelti.push(posti[i]);
  scelti.sort(function(p,q){ return p[3]-q[3]; });
  scelti.forEach(function(p,j){ var g=pub[j%tinte.length], k=(j/tinte.length)|0; O.position.set(p[0],p[1],p[2]); O.rotation.set(0,Math.atan2(-p[0],-p[2]),0); O.scale.setScalar(1); O.updateMatrix(); g.setMatrixAt(k,O.matrix); });
  pub.forEach(function(g){ g.instanceMatrix.needsUpdate=true; });
  /* l'arena: y 0,12, raggi 4,3 e 2,7 */
  var Y=.12, orso=RM.col(0x5b4128), leone=RM.col(0xb08a4a), canne=RM.col(0xb9a46a);
  function belva(B,x,z,ry,colore,lungo){ B.dentro(x,Y,z,ry,function(B){ B.scatola(.07,.08,lungo||.2,0,.04,0,colore).scatola(.05,.05,.06,0,.07,(lungo||.2)/2+.02,colore); [[-.025,-.06],[.025,-.06],[-.025,.06],[.025,.06]].forEach(function(q){ B.scatola(.02,.04,.02,q[0],0,q[1],colore); }); }); }
  var A=new RM.Costruttore(), Bv=new RM.Costruttore();
  /* fino al 403: quattro coppie di gladiatori al centro e, di lato, un leone con due cacciatori */
  vicine(A,'giochi',[0,0],function(){
  [[-1.1,-.3],[-.3,.5],[.6,-.4],[1.3,.4]].forEach(function(q){ var ry=rG()*6.28; uomo(A,q[0]-.09*Math.sin(ry),q[1]-.09*Math.cos(ry),Y,C.ferro,C.rosso,ry); uomo(A,q[0]+.09*Math.sin(ry),q[1]+.09*Math.cos(ry),Y,C.tunica,P.bronzo,ry+Math.PI); });
  belva(A,-2.6,.4,1.2,leone,.22); uomo(A,-2.25,.65,Y,C.tunica,null,-2); uomo(A,-2.9,.05,Y,C.tunica,null,.6); A.scatola(.01,.3,.01,-2.22,Y,.6,P.tronco);
  });
  /* dal 404 al 523: la caccia agli orsi di Variae V 42 */
  [[-1.4,.2,.4],[.2,-.6,2.2],[1.5,.5,3.6]].forEach(function(q){ belva(Bv,q[0],q[1],q[2],orso,.22); });
  vicine(Bv,'giochi',[0,0],function(){
  uomo(Bv,-1.05,.42,Y,C.tunica,null,-1.9); fune(Bv,[-1.12,Y+.02,.5],[-1.0,Y+.22,.36],.012,P.tronco);      // chi corre incontro alla belva con l'asta di legno
  uomo(Bv,.24,-.62,Y+.16,C.bianco,null,.4);                                                       // chi salta sopra l'orso
  uomo(Bv,2.25,-.82,Y,C.tunica,null,0); uomo(Bv,-2.35,-.6,Y,C.tunica,null,0);
  });
  Bv.dentro(1.05,Y,.7,0,function(B){ for(var k=0;k<14;k++){ var a=k/14*6.283; B.scatola(.012,.17,.012,.09*Math.cos(a),0,.09*Math.sin(a),canne); } B.scatola(.03,.02,.03,0,.17,0,C.pelle); });      // il muro di canne, con chi ci sta chiuso dentro
  [[2.2,-.9],[-2.4,-.7],[0,1.6]].forEach(function(q){ Bv.dentro(q[0],Y,q[1],Math.atan2(q[0],q[1]),function(B){ B.scatola(.3,.24,.015,0,0,0,P.tronco); for(var k=-2;k<=2;k++) B.scatola(.012,.24,.02,k*.06,0,0,RM.col(0x3a2e22)); }); });      // le porte a grata (chi ci sta dietro: più sopra, fra le persone)
  var mA=A.maglia(RM.matPietra()), mB=Bv.maglia(RM.matPietra()); [mA,mB].forEach(function(m){ m.castShadow=true; m.visible=false; gruppo.add(m); });
  var pop=(D.CURVE&&D.CURVE.popolazione&&D.CURVE.popolazione.punti)||[[0,900000]];
  return {gruppo:gruppo, aggiorna:function(anno){
    var in_uso=anno>=235&&anno<523&&!RM.senzaGiochi, n=in_uso?Math.round(scelti.length*Math.max(.12,Math.min(1,D.interp(pop,anno)/900000))):0;
    pub.forEach(function(g,k){ g.count=Math.max(0,Math.ceil((n-k)/tinte.length)); g.visible=n>0; });
    mA.visible=in_uso&&anno<404; mB.visible=in_uso&&anno>=404;
  }};
})();

/* ---------- tombe dentro le mura ----------
   Fonti (scene-roma-fonti.md, sezione 4, dal Companion to Rome c. 400-c. 1050, Brill 2026: Andrews II pp. 674-676, Spera II pp. 828-836, Stefani II pp. 839-848):
   dal V secolo, rare; nella seconda metà del VI e nel VII quasi la regola; fosse semplici, casse di mattoni, coperture «a cappuccina» di tegole, anfore per i bambini.
   Sei luoghi; le posizioni sono quelle dei monumenti, non delle singole fosse (il catalogo del 2004 non è stato letto), e il numero delle tombe disegnate è indicativo,
   tranne i 44 di Vigna Barberini. L'Athenaeum di piazza Venezia (dieci tombe, VIII secolo) sta in una sala coperta e non si vede dall'alto. */
var TOMBE=[      // [x, z, raggio, numero, dal anno, nome]
  [51,37,1.1,7,410,'valle del Colosseo'],[51,37,2,18,537,'valle del Colosseo'],      // raggi ristretti il 24 novembre 2026: prima le tombe stavano sparse su 50-60 m e non si vedevano
  [-78,160,1,5,455,'via Marmorata e Porticus Aemilia'],[-78,160,1.7,12,568,'via Marmorata e Porticus Aemilia'],
  [27,32,1.9,44,526,'Vigna Barberini, sul Palatino'],
  [73,146,2.4,26,568,'recinto delle terme di Caracalla, lato est'],
  [10,11,1.2,6,593,'atrio di Santa Maria Antiqua e casa delle Vestali']];
/* 24 novembre 2026, l'utente: «di tombe non se ne vede nessuna» (la regia arrivava su una chiazza a spicchi con qualche segnetto arancione). Rifatte:
   - le coperture a cappuccina avevano il colmo di traverso (80 cm di colmo, 2,1 m di falda): ora il colmo corre lungo il corpo, 2,1 m, larghe 75 cm, alte 40 cm,
     su un piccolo rialzo di terra e con la fila di coppi scuri sul colmo; poi casse di mattoni chiuse da una lastra e, per i bambini, anfore spezzate coricate (Spera, p. 830);
   - le tombe del V e del primo VI secolo sono sparse, quelle più tarde in file, dentro aree delimitate (Andrews, pp. 674-676): qui in file dal 526;
   - la chiazza di terra smossa è una maglia ad anelli che segue il terreno (RM.hSuolo), con il contorno morbido e irregolare; l'anello esterno prende il colore del suolo
     lì sotto (i colori dei vertici di RM.suolo), così il bordo sfuma. Un gruppo più tardi nello stesso luogo stende la sua chiazza un poco più in alto.
   Misure, proporzioni fra i tipi e disposizione sono uno schema; la forma dei tipi viene da Spera. */
var rT=RM.casuale(476), SEP=[50.25,36.55];      // dove si scava la fossa del 476 (più sotto)
function coloreSuolo(cx,cz,R){      // i vertici del suolo vicini al gruppo, per sfumare il bordo
  var g=RM.suolo&&RM.suolo.geometry, out=[]; if(!g||!g.attributes.color) return out;
  var pos=g.attributes.position, col=g.attributes.color;
  for(var i=0;i<pos.count;i++){ var x=pos.getX(i), z=pos.getZ(i); if(Math.abs(x-cx)<R && Math.abs(z-cz)<R) out.push([x,z,col.getX(i),col.getY(i),col.getZ(i)]); }
  return out;
}
function triColori(B,p0,p1,p2,c0,c1,c2){ B.tri(p0,p1,p2,c0); var n=B.col.length; [c0,c1,c2].forEach(function(c,k){ B.col[n-9+k*3]=c.r; B.col[n-8+k*3]=c.g; B.col[n-7+k*3]=c.b; }); B.tip[B.tip.length-1]=B.tip[B.tip.length-2]=B.tip[B.tip.length-3]=2; }      // tipo 2: niente conci né crepe
function tomba(B,x,y,z,ry,tipo){
  var coppi=P.coppi, scuri=RM.col(0x7a3a26), rialzo=RM.col(0x6a5a46), mattone=P.mattone, lastra=RM.col(0xb8b2a6);
  B.dentro(x,y,z,ry,function(B){
    if(tipo===0){ B.scatola(.24,.022,.095,0,0,0,rialzo).falde(.21,.04,.075,0,.022,0,coppi,0,coppi).scatola(.212,.014,.016,0,.056,0,scuri); }      // a cappuccina: due file di tegole a tetto, i coppi sul colmo
    else if(tipo===1){ B.scatola(.22,.032,.085,0,0,0,mattone).scatola(.2,.012,.068,0,.032,0,lastra); }                                          // cassa di mattoni chiusa da una lastra
    else { B.scatola(.13,.014,.06,0,0,0,rialzo); var c=new THREE.CylinderGeometry(.019,.016,.1,8); c.rotateZ(Math.PI/2); c.translate(0,.03,0); B.geo(c,P.cocci); }      // un'anfora coricata, per un bambino
  });
}
var tombe=TOMBE.map(function(t,it){
  var B=new RM.Costruttore(), hq=RM.hSuolo||RM.h, smossa=RM.col(0x75644d), dopo=TOMBE.slice(0,it).some(function(u){ return u[0]===t[0]&&u[1]===t[1]; }), alza=dopo?.022:.012;
  /* la chiazza: 48 spicchi, anelli a 0, 35, 65, 85 e 100 per cento del raggio; contorno con tre ondulazioni lente */
  var R=t[2]+.35, NS=48, AN=[0,.35,.65,.85,1], f1=rT()*6.28, f2=rT()*6.28, f3=rT()*6.28, vic=coloreSuolo(t[0],t[1],R*1.3+1.5);
  function bordo(a){ return R*(1+.12*Math.sin(2*a+f1)+.08*Math.sin(3*a+f2)+.05*Math.sin(5*a+f3)); }
  function suolo(x,z){ if(!vic.length) return smossa; var m=1e9, c=null; vic.forEach(function(v){ var d=(v[0]-x)*(v[0]-x)+(v[1]-z)*(v[1]-z); if(d<m){ m=d; c=v; } }); return new THREE.Color(c[2],c[3],c[4]); }
  var G=[]; for(var r=0;r<AN.length;r++){ var riga=[]; for(var j=0;j<NS;j++){ var a=j/NS*6.283, rr=bordo(a)*AN[r], x=t[0]+Math.cos(a)*rr, z=t[1]+Math.sin(a)*rr, c;
      if(r<3) c=smossa; else if(r===3) c=smossa.clone().lerp(suolo(x,z),.35); else c=suolo(x,z);
      riga.push({p:[x,hq(x,z)+(r<4?alza:alza*.3),z],c:c}); } G.push(riga); }
  for(r=0;r<AN.length-1;r++) for(j=0;j<NS;j++){ var A0=G[r][j], A1=G[r][(j+1)%NS], B0=G[r+1][j], B1=G[r+1][(j+1)%NS];
    if(r===0) triColori(B,A0.p,B1.p,B0.p,A0.c,B1.c,B0.c); else { triColori(B,A0.p,B1.p,B0.p,A0.c,B1.c,B0.c); triColori(B,A0.p,A1.p,B1.p,A0.c,A1.c,B1.c); } }
  /* le tombe: sparse fino al 525, poi in file parallele; quasi tutte nello stesso verso */
  var inFila=t[4]>=526, k=0, tent=0, ry0=rT()*Math.PI, posti=[];
  while(k<t[3] && tent<t[3]*30){ tent++;
    var x, z, ry;
    if(inFila){ var per=Math.ceil(Math.sqrt(t[3]*2.2)), fila=Math.floor(k/per), col=k%per, ca=Math.cos(ry0), sa=Math.sin(ry0), lx=(col-(per-1)/2)*.13, lz=(fila-(Math.ceil(t[3]/per)-1)/2)*.32;
      x=t[0]+lx*sa+lz*ca+(rT()-.5)*.03; z=t[1]+lx*ca-lz*sa+(rT()-.5)*.03; ry=ry0+(rT()-.5)*.08; }
    else { var aa=rT()*6.283, rr2=Math.sqrt(rT())*t[2]*.8; x=t[0]+Math.cos(aa)*rr2; z=t[1]+Math.sin(aa)*rr2; ry=ry0+(rT()-.5)*.5; }
    if(Math.hypot(x-t[0],z-t[1])>bordo(Math.atan2(z-t[1],x-t[0]))*.8) continue;
    if(posti.some(function(q){ return Math.hypot(q[0]-x,q[1]-z)<.2; }) || Math.hypot(x-SEP[0],z-SEP[1])<.42) continue;      // lascia libero il posto della sepoltura del 476
    posti.push([x,z]); var u=rT(); tomba(B,x,hq(x,z)+alza,z,ry,u<.6?0:u<.85?1:2); k++; }
  var g=B.maglia(RM.matPietra()); g.visible=false; g.receiveShadow=true; RM.scene.add(g); return {g:g, da:t[4]};
});
/* 476: una sepoltura in corso nella valle del Colosseo (l'utente: «magari una fossa aperta con due persone»): la fossa scura, la terra ammucchiata accanto, il morto avvolto
   nel lenzuolo e due uomini, uno con la pala. Solo nell'anno della tappa; è uno schema: le fonti dicono che si seppelliva lì, non come. */
var sepoltura476=(function(){
  var B=new RM.Costruttore(), x=SEP[0], z=SEP[1], ry=.35, y=(RM.hSuolo||RM.h)(x,z)+.02, buio=RM.col(0x2a2219), terra=RM.col(0x6a5a46);
  B.dentro(x,y,z,ry,function(B){
    B.scatola(.22,.006,.08,0,0,0,buio);                                                       // la fossa aperta
    B.scatola(.16,.05,.1,0,0,.16,terra).scatola(.1,.03,.07,.02,.05,.16,terra);                // la terra scavata
    B.scatola(.17,.03,.05,0,0,-.13,C.bianco);                                                 // il morto nel lenzuolo
  });
  vicine(B,'476',[x,z],function(){ uomo(B,x+.12,z-.24,y,C.tunica,null,ry+2.6); uomo(B,x-.16,z+.02,y,C.folla[1],null,ry+1.2); });
  B.scatola(.01,.17,.01,x-.12,y,z+.04,P.tronco);                                            // la pala
  var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g);
  return {g:g, da:475.6, a:477};
})();

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
  [milvio,corteo,assedio472,prigionieri593,sepoltura476,trionfo274,palazzo455,teatro493,vandali455,costante663,leone852,carlo800,saraceni846,totila546,casali756].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
  [fuga312,carlo800,S410].forEach(function(s){ var v=anno>=s.da&&anno<s.a; if(v&&!s.acceso&&s.seq.t==null) quadro(s.seq); s.acceso=v; s.tutte.forEach(function(m){ m.visible=v; }); });      // le scene animate: prima che partano, il quadro finale
  macchie756(RM.sfuma(755.6,756,anno)*(1-RM.sfuma(757,760,anno)));
  tombe.forEach(function(s){ s.g.visible=anno>=s.da; });
  if(!(anno>=409.6&&anno<411)) giornoDiNuovo();      // la notte del 410 non resta accesa nelle altre tappe
  if(giochi) giochi.aggiorna(anno);      // RM.senzaGiochi=true li spegne (per le prove di peso)
  if(terremoto801){ terremoto801.detriti.visible=anno>=801&&anno<806; applicaScossa(); }
  if(S852){ t852=anno>=851.6&&anno<853; if(!t852) S852.macerie.visible=anno>=846.95; if(S852.anni&&!t852) S852.anni.style.display='none';
    if(!t852 && S852.attiva){ S852.leo.mat.userData.u.uCant.value=1; S852.attiva=false; } if(t852 && !S852.attiva){ S852.attiva=true; if(S852.seq.t==null) quadro(S852.seq); } }      // le macerie del Colosseo restano dopo l'847      // le travi restano a terra fino ai restauri; durante la sequenza la scossa comanda
  fortino552.g.visible=anno>=fortino552.da&&anno<fortino552.a; fortino552.g2.visible=anno>=fortino552.da2&&anno<fortino552.a2;
});

/* ---------- regia: la vista va sul luogo dell'evento della tappa ---------- */
/* Sul telefono in verticale la didascalia dell'evento copre la metà bassa della scena (24 novembre 2026): lì la camera guarda un poco più in basso, così ciò che si racconta
   sale a circa un terzo dall'alto. Il punto guardato si sposta verso la camera lungo il suolo, la camera resta dov'è. */
function alto(v){
  var cam=RM.camera, a=cam&&cam.aspect||1; if(!v||!v.t||a>=.85) return v;
  var yT=RM.h(v.t[0],v.t[1])+1, dx=v.t[0]-v.c[0], dz=v.t[1]-v.c[2], oriz=Math.hypot(dx,dz), alt=v.c[1]-yT; if(oriz<.01||alt<=.05) return v;
  var giu=Math.atan2(alt,oriz)+Math.atan(.42*Math.tan(cam.fov*Math.PI/360)), d=alt/Math.tan(Math.min(1.45,giu));
  return {t:[v.c[0]+dx/oriz*d, v.c[2]+dz/oriz*d], c:v.c};
}
function inquadra(v){ return alto(RM.adatta(v)); }
var perId={}; (RM.MONUMENTI||[]).forEach(function(m){ perId[m.id]=m; });
/* le due messe in scena hanno un'inquadratura fissa (punto guardato, posizione della camera): al ponte Milvio da sud, oltre il fiume, verso la riva dove fuggono;
   per il corteo da sud-est, sopra le case della via Lata */
/* 24 novembre 2026: al ponte Milvio da nord, dietro la cavalleria di Costantino, verso i ponti e la città (prima da sud verso nord: dietro la scena c'era il bordo del disegno);
   il corteo dell'800 parte dalla testata di ponte Elio sulla riva sinistra, e la vista lo segue (RM.segui); il 756 da sopra le mura del Castro Pretorio verso nord-est (dal 24 novembre 2026 più vicino ai casali);
   l'846 (24 novembre 2026) da est, oltre il fiume: le navi in primo piano, i cavalieri verso San Pietro, la basilica dietro (prima le navi restavano sotto l'inquadratura) */
var VISTE={ milvio:fuga312.vista, carlo800:carlo800.vista, assedio756:{t:[158,-284],c:[124,36,-196]}, fortino552:{t:[-163,-126],c:[-131,30,-90]}, corteo:{t:corteo.carro,c:[corteo.carro[0]+20,24,corteo.carro[1]+24]},
  assedio472:{t:[-158,-109],c:[-122,44,-62]},      /* centrata sul mausoleo di Adriano e su ponte Elio, dove avviene lo scontro (23 novembre 2026, richiesta dell'utente); il campo resta a sinistra */
  prigionieri593:null, trionfo274:{t:[8,8],c:[44,26,44]}, saraceni846:{t:[-188,-93],c:[-147,26,-117]}, totila546:{t:[190,74],c:[218,16,96]} };      // il trionfo: dal Palatino verso il Campidoglio      // il campo vaticano e ponte Elio; la Flaminia fuori porta
/* Inquadrature aggiunte il 24 novembre 2026 (l'utente: la camera non deve finire addosso a un muro, e la cosa raccontata deve stare al centro e abbastanza grande).
   vicino(tx,tz,dx,dy,dz): punto guardato e camera spostata di dx, dz e alzata di dy sopra il suolo del punto guardato.
   - tombe476: le tombe della valle del Colosseo da sud-est, a una trentina di metri, con l'arco di Costantino e la Meta Sudans dietro e il Colosseo di lato;
   - pantheon609 (anche per il 663): dal lato del pronao, a nord-est, sopra la piazza: il portico, la croce sul frontone, la scritta sul fregio; l'aula a sud resta dietro la rotonda;
   - leonina852: porta San Pellegrino dal campo fuori le mura, a nord, con il papa sopra la porta e il clero sul cammino di ronda. */
function vicino(tx,tz,dx,dy,dz){ return {t:[tx,tz], c:[tx+dx, RM.h(tx,tz)+1+dy, tz+dz]}; }
/* RM.volaA guarda un punto 10 m sopra il suolo (RM.h+1): da vicino una cosa a terra finiva in fondo allo schermo, o sotto. mira(gx,gz,c) mette al centro il punto a terra
   [gx, gz]: il punto guardato si sposta, lungo la linea fra la camera e quel punto, fino alla quota che volaA gli darà. La camera deve stare più di 10 m sopra il suolo. */
function mira(gx,gz,c){
  var gy=H(gx,gz), x=gx, z=gz;
  for(var k=0;k<3;k++){ var f=(c[1]-(RM.h(x,z)+1))/(c[1]-gy); x=c[0]+(gx-c[0])*f; z=c[2]+(gz-c[2])*f; }
  return {t:[x,z], c:c};
}
function aTerra(gx,gz,dx,dy,dz){ return mira(gx,gz,[gx+dx, H(gx,gz)+dy, gz+dz]); }      // camera spostata di dx, dz e alta dy sopra il suolo del punto a terra
VISTE.sacco410=S410.vista;
VISTE.sacco455=palazzo455.vista;
VISTE.teodorico493=teatro493.vista;
VISTE.prigionieri593=mira(prigionieri593.vista.g[0],prigionieri593.vista.g[1],prigionieri593.vista.c);
VISTE.tombe476=aTerra(51.1,37.2,2.4,1.6,3.3);
VISTE.pantheon609=vicino(-70,-72.5,5.6,6.2,-11.4);
VISTE.leonina852=mira(-236,-117,[-224,RM.h(-233,-121)+6.2,-134.5]);      // da fuori, a nord-est: il cammino delle mura con la processione, porta San Pellegrino, San Pietro dietro
VISTE.colosseo852=S852&&S852.vista||VISTE.leonina852;      // 852: prima il Colosseo (con meno animazioni direttamente San Pietro)
/* Le viste date come [x, z, distanza] o come id di un monumento prima usavano RM.vola, che tiene la direzione da cui si guarda: la stessa tappa si vedeva da un lato o dall'altro
   secondo la tappa di prima, e a volte la camera finiva dietro un edificio. Ora la direzione è fissa: da sud-sud-ovest, come la vista d'insieme, o quella data come quarto
   elemento ('n', 'ne', 'e', 'se', 's', 'so', 'o', 'no': il lato da cui si guarda); quota e distanza sono quelle di prima. */
var LATI={n:[0,-1],s:[0,1],e:[1,0],o:[-1,0],ne:[.6,-.8],no:[-.6,-.8],se:[.6,.8],so:[-.6,.8]}, LATO0=[-.395,.919];
function fissa(x,z,d,lato){ var u=LATI[lato]||LATO0, y=RM.h(x,z)+1; return {t:[x,z], c:[x+u[0]*d*.82, y+d*.56, z+u[1]*d*.82]}; }
var portata=false;                                                                      // la vista ce l'ha portata la regia
function scena(){ var s=document.getElementById('scene'); return s?s.getAttribute('data-vista'):null; }
function vista(v){
  if(v==='insieme'||v==null) return null;
  if(typeof v==='string'){ if(VISTE[v]) return VISTE[v]; var m=perId[v]; return m?fissa(m.x,m.z,Math.max(40,(m.raggio||6)*5)):null; }
  if(Array.isArray(v)) return fissa(v[0],v[1],v[2],v[3]);
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
  if(v&&v.t) v=inquadra(v);                                                              // sul telefono in piedi la camera si allontana, e guarda un poco più in basso
  anima(t);                                                                              // la scena animata parte con la regia: il suo tempo comincia dopo il volo
  /* La distanza minima dei controlli (16 unità, 160 m: js/base.js) riportava indietro, lungo la stessa linea, ogni camera più vicina: nel 593 la regia chiedeva 90 m
     e la camera finiva dentro la torre di porta Flaminia (24 novembre 2026). Per un'inquadratura più vicina la distanza minima scende finché si resta in quella tappa. */
  var MIN=16;
  if(v&&v.t){ var y0=RM.h(v.t[0],v.t[1])+1, d=Math.hypot(v.c[0]-v.t[0],v.c[1]-y0,v.c[2]-v.t[1]); if(RM.controlli) RM.controlli.minDistance=Math.min(MIN,d*.85); RM.volaA(v.t,v.c); portata=true; }
  else if(v){ RM.vola(v[0],v[1],v[2]); portata=true; }
  else if(portata && RM.vistaInsieme){ if(RM.controlli) RM.controlli.minDistance=MIN; RM.vistaInsieme(); portata=false; }
}
/* persone o pedine, secondo il gradino della qualità (vedi «persone vere» in testa al file) */
assegna();
if(RM.qualita && RM.qualita.quando) RM.qualita.quando(assegna);
})();
