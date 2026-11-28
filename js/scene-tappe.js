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
var moduliPrima=RM.moduli.length;      // i moduli di questo file: alla fine si applicano all'anno d'apertura (più sotto, «la tappa d'apertura»)
var P=RM.P, rnd=RM.casuale(312);
var C={ rosso:RM.col(0x9a2f2a), grigio:RM.col(0x7b7f86), ferro:RM.col(0xa9adb3), tunica:RM.col(0xd9cfbf), pelle:RM.col(0xb98a6a), oro:RM.col(0xd4ae55), porpora:RM.col(0x6b2a5a),
        bianco:RM.col(0xeee8dc), cavalloB:RM.col(0x6b4a33), cavalloC:RM.col(0x9c8a74), folla:[RM.col(0xb5543e),RM.col(0x8c7a5b),RM.col(0xc9b48a),RM.col(0x6f7f6a),RM.col(0x9c6a48),RM.col(0xd8cdb6)] };

/* quota su cui posano figure e oggetti delle scene: quella del terreno come è disegnato (RM.hSuolo), o del nastro della strada se il punto cade su una strada.
   25 novembre 2026, sera: prima era la più alta fra la quota esatta (RM.h) e quella disegnata; dove la maglia del terreno è larga (ponte Milvio, il fortino del 552) la quota esatta
   sta fino a 2 m sopra il terreno disegnato, e le figure restavano sospese. */
function H(x,z){ var a=RM.hSuolo?RM.hSuolo(x,z):RM.h(x,z); return Math.max(a,suStrada(x,z)); }
/* Le strade sono un nastro 1 m sopra il terreno (RM.nastro(…,.1) in js/base.js): chi stava su una strada ci affondava fino al ginocchio, e i cavalli sembravano senza
   gambe (24 novembre 2026, visto sulla Flaminia del 593). Se il punto cade dentro una strada, la quota è quella del nastro. Le strade: RM.STRADE, mezze larghezze in RM_TOPO.stradeLarghe. */
var STRADE_BB=null;
function suStrada(x,z){
  var S=RM.STRADE, W=window.RM_TOPO&&RM_TOPO.stradeLarghe; if(!S||!W||!RM.hSuolo) return -1e9;
  if(!STRADE_BB) STRADE_BB=S.map(function(L,i){ var b=[1e9,1e9,-1e9,-1e9]; L.forEach(function(p){ b[0]=Math.min(b[0],p[0]); b[1]=Math.min(b[1],p[1]); b[2]=Math.max(b[2],p[0]); b[3]=Math.max(b[3],p[1]); }); var w=W[i]||.5; return [b[0]-w,b[1]-w,b[2]+w,b[3]+w]; });
  for(var i=0;i<S.length;i++){ var b=STRADE_BB[i]; if(x<b[0]||x>b[2]||z<b[1]||z>b[3]) continue;
    var L=S[i], w=(W[i]||.5)*1.0;      // fino all'orlo (prima 0,95: le guardie del 593 sul bordo della Flaminia affondavano di un metro nel nastro della strada)
    for(var k=0;k<L.length-1;k++){ var ax=L[k][0], az=L[k][1], dx=L[k+1][0]-ax, dz=L[k+1][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
      if(Math.hypot(x-ax-dx*t,z-az-dz*t)<w) return RM.hSuolo(x,z)+.1; } }
  return -1e9;
}
/* figure a blocchi, come le statue di js/monumenti.js (s=1: uomo alto 1,85 m, cavallo lungo 2,2 m): le «pedine», che restano sui telefoni, nel gradino «bassa» e per le folle.
   Dal 25 novembre 2026, sera (l'utente: da media distanza la folla «è ancora una fila di birilli»): la pedina è una sagoma, non due scatole. Un corpo girato a cinque lati
   con la veste che si allarga in basso, la vita, le spalle spioventi, il collo e la testa; i colori della veste dell'epoca (o), il mantello o il velo in alto; ai soldati lo scudo,
   la lancia e la cresta. 48 triangoli (66 il soldato) invece di 24: da 30-60 metri si legge una persona vestita. */
var SAGOME={};
function sagoma(o,col){
  var v=o&&o.v?(typeof o.v==='string'?RM.VESTI[o.v]:o.v):null, lunga=v?v.orlo<.2:(o&&(o.f===2||o.f===3)), mt=v&&v.manto&&v.manto.t, sopra=v?((v.manto&&v.manto.col)||(v.velo&&v.velo.col)||null):(o&&o.f===1?(o.sopra||V_LANA):o&&o.f===2?(o.velo||V_VELO):null);
  var tutto=mt==='paenula'||mt==='lungo'||mt==='planeta'||mt==='toga'||mt==='toga3', corpo=col, alto=sopra||col, basso=tutto&&sopra?sopra:corpo, sol=v&&v.lancia;
  var ch=[lunga?1:0,hex(corpo),hex(alto),hex(basso),sol?hex(v.scudo.col||C.grigio):'',v&&v.elmo?1:0].join('|');
  if(SAGOME[ch]) return SAGOME[ch];
  var y0=lunga?.004:.045, gambe=C.pelle.clone().multiplyScalar(.8), pr=[[.0195,y0],[.0162,.095],[.0178,.13],[.0135,.143],[.005,.149]];
  var g=new THREE.LatheGeometry(pr.map(function(q){ return new THREE.Vector2(q[0],q[1]); }),5,Math.PI).toNonIndexed(); g.scale(1,1,.74); g.computeVertexNormals();
  var p=g.attributes.position, cc=new Float32Array(p.count*3), i;
  for(i=0;i<p.count;i++){ var yy=p.getY(i), q=yy<.09?basso:alto; cc[i*3]=q.r; cc[i*3+1]=q.g; cc[i*3+2]=q.b; }
  g.setAttribute('color',new THREE.BufferAttribute(cc,3));
  var parti=[g], testa=new THREE.IcosahedronGeometry(.0092,0).scale(.92,1.22,1.05).translate(0,.162,.001).toNonIndexed(); parti.push(colora(testa,v&&v.velo?v.velo.col:C.pelle,v&&v.elmo?function(y){ return y>.164?RM.col(0x77797b):null; }:null));      // la testa (l'elmo, ai soldati che lo portano)
  if(!lunga){ var gb=new THREE.CylinderGeometry(.0075,.006,y0,4,1,true).scale(1.6,1,.8).translate(0,y0/2,0).toNonIndexed(); parti.push(colora(gb,gambe)); }      // le gambe sotto la tunica corta
  if(sol){ parti.push(colora(new THREE.CylinderGeometry(v.scudo.r*.1,v.scudo.r*.1,.002,8).rotateZ(Math.PI/2).rotateY(-.45).translate(.027,.098,.007).toNonIndexed(),v.scudo.col||C.grigio));      // lo scudo: un disco con due facce
    parti.push(colora(new THREE.BoxGeometry(.0018,.23,.0018).translate(-.024,.115,.011).toNonIndexed(),P.tronco));
    if(v.elmo) parti.push(colora(new THREE.BoxGeometry(.0022,v.elmo.cresta*.1,.018).translate(0,.174+v.elmo.cresta*.05,0).toNonIndexed(),RM.col(0x3a2f27))); }
  var tot=fondi(parti.map(function(q){ return {g:q}; })); parti.forEach(function(q){ q.dispose(); });
  return (SAGOME[ch]=tot);
}
function colora(g,c,f){ var n=g.attributes.position.count, a=new Float32Array(n*3); for(var i=0;i<n;i++){ var q=(f&&f(g.attributes.position.getY(i)))||c; a[i*3]=q.r; a[i*3+1]=q.g; a[i*3+2]=q.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; }      // f(y): un altro colore a quella quota
function pedina(B,x,z,y,col,scudo,ry,o){
  if(o && RM.VESTI){ B.dentro(x,y,z,ry||0,function(B){ var q=sagoma(o,o.v&&!scudo?o.veste:col).clone(); if(o.s && o.s!==1) q.scale(o.s,o.s,o.s); B.geo(q,col||C.tunica); }); return; }
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
   a chi la portava (gli imperatori sul carro, Massenzio, l'imperatrice Eudossia). Carlo senza corona; la tunica blu è quella che la scena gli dava già (colori di comodo),
   il mantello è di lana di colore sobrio (Eginardo, Vita Karoli 23, riletto il 25 novembre 2026: «sago veneto amictus» è il suo abito comune, ma a Roma due volte vestì alla romana, e quali giorni non è detto: il colore resta sobrio).
   Il peso: una persona sono da 350 a 400 triangoli (la pedina 24), un cavaliere circa 1250 (la pedina 84). Perciò:
   - nel gradino «bassa» (i telefoni e i dispositivi al tocco partono da lì) c'è un tetto piccolo, speso solo dalle parti segnate «tel» (le più importanti: i prigionieri
     e le guardie del 593, il papa e il clero sulle mura nell'852, Carlo, il papa e il clero sui gradini nell'800, le prigioniere del 455, chi apre la porta nel 410);
     sui telefoni e sui dispositivi al tocco la persona è più leggera (LEGGERA: tre lati invece di cinque, niente mani) e le altre parti non si preparano nemmeno;
   - le figure importanti di una scena si raccolgono con vicine(B, scena, centro, fn): ognuna diventa una voce, disegnata due volte, come pedina (in una maglia figlia della maglia
     della scena) e come persona (maglie a istanze, una per foggia, con il colore della veste per istanza), in ordine di distanza dal punto che guarda la regia;
   - i gruppi che si muovono a istanze (il corteo dell'800, i Goti del 410, Massenzio) hanno una seconda maglia a istanze con la persona, sulle stesse matrici:
     o tutto il gruppo è fatto di persone, o nessuno;
   - a ogni gradino della qualità (RM.qualita.quando) ogni scena spende al massimo RM.QUALITA.figScena triangoli di persone: prima le parti più importanti (pr più basso),
     dentro una lista le voci più vicine; le altre restano pedine (drawRange e count: nessun lavoro in più per il processore).
   - folle lontane, il pubblico del Colosseo e i grandi gruppi del 312 restano pedine. */
var VERE=!!(RM.figuraGeo&&RM.figura&&RM.cavalloStatua);
var LEGGERA=!!RM.piccolo || (navigator.maxTouchPoints>0) || !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);      // come TOCCO_Q di js/base.js
RM.QUALITA.figScena=[18000,62000,150000,250000];      // 25 novembre 2026, sera: un quinto in più, quanto pesa di più la persona nuova (js/vita.js): restano persone le stesse figure di prima
      // triangoli di persone per scena: in «bassa» solo le parti «tel» (una sessantina di persone leggere); circa 150, 350 e 600 persone a «media», «alta», «massima» (un cavaliere ne vale tre e mezzo)
var TETTO_TEL={'593':38000,'800i':36000,'800':44000};
var TETTO_PIU={'800':1.45};      // 26 novembre 2026, sera: l'arrivo dell'800 ha il seguito a cavallo vicino alla camera (70 cavalieri leggeri, circa 42.000 triangoli): con il tetto comune restavano pedine, o restavano pedine Carlo e il clero      // l'800 fuori: il clero sui gradini e il seguito a cavallo (cavallo leggero)      // l'800 dentro San Pietro: il clero e i Franchi attorno a Carlo      // in «bassa» il 593 ne ha di più: tutta la fila dei prigionieri (80) e le guardie a cavallo (30, col cavallo leggero)
var VIC=null, DETT=false, contaP=0, PARTI={}, nParti=0, BASI={}, matPers=null, BIANCO1=new THREE.Color(1,1,1);
var V_BIANCO=RM.col(0xefe9da), V_LANA=RM.col(0x6b5a44), V_VELO=RM.col(0xe2d6bc), V_SANDALO=RM.col(0x4a3424), V_PELLE=RM.col(0xb07a55), CORDA=RM.col(0x3a2a1a);      // i colori del corpo di js/vita.js
function uomo(B,x,z,y,col,scudo,ry,ruolo){
  if(DETT){ persona(B,x,z,y,col,scudo,ry,ruolo); return; }
  var o=opzioni(col,scudo,ruolo,contaP++);      // una volta sola: persona e sagoma hanno la stessa veste (e l'inverno dell'800 vale anche qui)
  voce(B,x,y,z,function(Q){ emetti(Q,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); },function(Q){ pedina(Q,x,z,y,col,scudo,ry,o); },ruolo==='folla'?1.6:1);
}
function cavaliere(B,x,z,y,ry,colC,colU,solo,ruolo){
  if(DETT){ cavaliereVero(B,x,z,y,ry,colC,colU,solo,ruolo); return; }
  voce(B,x,y,z,function(Q){ cavaliereVero(Q,x,z,y,ry,colC,colU,solo,ruolo); },function(Q){ pedinaCav(Q,x,z,y,ry,colC,colU); },1);
}
/* in ginocchio (800, la preghiera di Carlo davanti alla confessione e l'omaggio del papa): la persona con le gambe piegate; la pedina più bassa */
function inGinocchio(B,x,z,y,col,ry,ruolo){
  if(DETT){ var o=opzioni(col,null,ruolo,contaP++); o.ginocchio=true; emetti(B,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); return; }
  B.dentro(x,y,z,ry||0,function(B){ B.scatola(.05,.105,.035,0,0,0,col).scatola(.03,.035,.03,0,.105,0,C.pelle).scatola(.04,.012,.06,0,0,-.035,col); });
}
/* il papa col gesto della corona (800): le braccia tese in avanti; la pedina con due braccia avanti */
function aBracciaTese(B,col,ruolo){
  if(DETT){ var o=opzioni(col,null,ruolo,contaP++); o.braccia=2; emetti(B,chiaveP(o),function(){ return personaGeo(o); },locale(0,0,0,0),o.veste); return; }
  B.scatola(.05,.15,.035,0,0,0,col).scatola(.03,.035,.03,0,.15,0,C.pelle).scatola(.012,.012,.07,.02,.125,.04,col).scatola(.012,.012,.07,-.02,.125,.04,col);
}
var TESTA_FINE=false;      // mentre si costruiscono le persone vicine ai protagonisti dell'800: la testa fine (personaGeo, o.fine)
var PIENA=false;      // mentre si costruiscono le persone dell'interno dell'800: la persona piena (cinque lati, le mani) anche sui telefoni (si veda personaGeo)
var INVERNO=false;      // mentre si costruiscono le scene dell'800: la folla col mantello (dicembre e fine novembre)
/* una voce: d disegna la persona, s la pedina; fuori da una raccolta (o sul telefono) si disegna subito la pedina */
function voce(B,x,y,z,d,s,peso){
  if(!VIC||VIC.B!==B){ s(B); return; }
  var m=B.pila[B.pila.length-1].clone(); VIC.voci.push({m:m, p:new THREE.Vector3(x,y,z).applyMatrix4(m), d:d, s:s, peso:peso||1});
}
function parte(nome,q){ var L=PARTI[nome]||(PARTI[nome]=[]); q.n=nParti++;
  if(q.chiave){ var g=L.filter(function(u){ return u.chiave===q.chiave; })[0]; if(g){ g.coppie=g.coppie.concat(q.coppie); return g; } }
  L.push(q); L.sort(function(a,b){ return (a.pr-b.pr)||(a.n-b.n); }); return q; }
/* raccoglie le figure di fn disegnate in B: centro [x, z] è il punto guardato dalla regia (le più vicine diventano persone per prime), pr la priorità della parte nella scena */
function vicine(B,nome,centro,fn,pr,tel){
  if(annoDi(nome)) ANNO_SC=annoDi(nome);
  if(!VERE || (LEGGERA && !tel)){ fn(); return; }      // sui telefoni le parti non «tel» restano pedine e non si preparano
  var r={B:B, c:centro, voci:[], nome:nome, q:parte(nome,{tipo:'lista', pr:pr||0, tel:!!tel})}, prima=VIC; VIC=r; fn(); VIC=prima;
  (B.vicine||(B.vicine=[])).push(r);
  if(!B.magliaSola){ B.magliaSola=B.maglia; B.maglia=function(mat){ var g=this.magliaSola(mat), self=this; self.vicine.forEach(function(r){ chiudi(r,g); }); self.vicine=[]; return g; }; }
}
function chiudi(r,g){
  var annoPrima=ANNO_SC; ANNO_SC=annoDi(r.nome)||ANNO_SC;      // le vesti dell'epoca della scena
  try{ chiudi1(r,g); } finally { ANNO_SC=annoPrima; } }
function chiudi1(r,g){
  var tetto=LEGGERA?(TETTO_TEL[r.nome]||RM.QUALITA.figScena[0]):Math.max.apply(null,RM.QUALITA.figScena), S=new RM.Costruttore(), fS=[0], tri=[], somma=0, VAR={};      // sui telefoni si prepara solo ciò che serve a «bassa»
  r.voci.forEach(function(v){ v.d2=Math.hypot(v.p.x-r.c[0],v.p.z-r.c[1])*v.peso; });
  r.voci.sort(function(a,b){ return a.d2-b.d2; });
  r.voci.forEach(function(v,i){
    S.pila=[v.m]; v.s(S); fS.push(S.pos.length/3);
    if(somma>tetto) return;                                                                 // oltre il tetto più alto la persona non serve mai
    var Q={pezzi:[], m:v.m}, t=0; v.d(Q);
    Q.pezzi.forEach(function(z){ t+=base(z.k,z.fa).attributes.position.count/3; (VAR[z.k]||(VAR[z.k]={k:z.k, v:[]})).v.push({i:i, m:z.m, t:z.t}); });
    tri.push(t); somma+=t; });
  var mS=new THREE.Mesh(S.geometria(),g.material); mS.castShadow=mS.receiveShadow=true; mS.userData.pedine=true; g.userData.scena=true; g.add(mS);
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
  m.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'attribute float fisso;').replace('#include <color_vertex>','#include <color_vertex>'+A+'vColor.xyz=mix(vColor.xyz,color.xyz,fisso);');
    conLumi(sh); };      // i due lumi dell'800 (spenti, a colore nero, nelle altre scene)
  return (matPers=m);
}
/* L'ombra d'appoggio (25 novembre 2026, per la scena dell'800): chi si muove non fa più ombra nella mappa del sole (si rifaceva a scatti, e l'ombra restava indietro o
   saltava); sotto i piedi ha una macchia scura e morbida, ferma con lui. Per le maglie a istanze la macchia è un'altra maglia a istanze, figlia, sulle stesse matrici:
   nessun lavoro in più per il processore. rx, rz: mezze misure della macchia in unità (un uomo .028, un cavallo .03 per .12). */
var TEX_APPOGGIO=null, MAT_APPOGGIO=null;
function matAppoggio(){
  if(MAT_APPOGGIO) return MAT_APPOGGIO;
  var N=64, d=new Uint8Array(N*N*4), i, j; for(j=0;j<N;j++) for(i=0;i<N;i++){ var r=Math.hypot(i+.5-N/2,j+.5-N/2)/(N/2), k=(j*N+i)*4; d[k+3]=Math.round(255*(r>=1?0:.62*Math.pow(1-r*r,1.6))); }
  TEX_APPOGGIO=new THREE.DataTexture(d,N,N,THREE.RGBAFormat); TEX_APPOGGIO.magFilter=THREE.LinearFilter; TEX_APPOGGIO.minFilter=THREE.LinearMipmapLinearFilter; TEX_APPOGGIO.generateMipmaps=true; TEX_APPOGGIO.needsUpdate=true;
  return (MAT_APPOGGIO=new THREE.MeshBasicMaterial({map:TEX_APPOGGIO, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4, fog:false})); }
function geoAppoggio(rx,rz){ return new THREE.PlaneGeometry(rx*2,rz*2).rotateX(-Math.PI/2).translate(0,.0015,0); }
function appoggioIstanze(g,rx,rz){      // g: una maglia a istanze di figure (piedi a y=0); la macchia la segue (visibilità e quante)
  var b=new THREE.InstancedMesh(geoAppoggio(rx,rz),matAppoggio(),g.instanceMatrix.count); b.instanceMatrix=g.instanceMatrix; b.frustumCulled=false; b.castShadow=b.receiveShadow=false; b.renderOrder=1;
  b.count=g.count; b.onBeforeRender=function(){ b.count=g.count; }; g.add(b); return b; }
function senzaOmbra(o){ o.traverse(function(q){ if(q.isMesh) q.castShadow=false; }); }
/* la folla dell'800 a istanze: il materiale delle persone, più il dondolio (una rotazione lenta attorno all'asse della persona, al più due gradi) e il saltello di chi acclama,
   calcolati nello shader dei vertici dall'attributo dondolo (velocità, fase, momento) e dal tempo della scena */
var TEMPO800={value:0}, matFol=null;
function matFolla(){
  if(matFol) return matFol;
  var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0}), A=String.fromCharCode(10);
  m.onBeforeCompile=function(sh){ sh.uniforms.uTempo800=TEMPO800;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'attribute float fisso; attribute vec3 dondolo; uniform float uTempo800;')
      .replace('#include <color_vertex>','#include <color_vertex>'+A+'vColor.xyz=mix(vColor.xyz,color.xyz,fisso);')
      .replace('#include <begin_vertex>','#include <begin_vertex>'+A+'float aD=sin(uTempo800*dondolo.x+dondolo.y)*0.035; float cD=cos(aD), sD=sin(aD); transformed.xz=vec2(cD*transformed.x+sD*transformed.z,-sD*transformed.x+cD*transformed.z);'+A+
        'if(dondolo.z>-50.0) transformed.y+=max(0.0,sin((uTempo800-dondolo.z)*7.0))*0.0025;');
    conLumi(sh); };
  return (matFol=m); }
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
/* la foggia, secondo il ruolo: o.f 0 tunica corta, 1 tunica e mantello, 2 donna (stola lunga e palla sul capo), 3 veste lunga fino ai piedi, 4 a cavallo.
   Dal 25 novembre 2026, sera: o.v, la veste dell'epoca della scena (RM.VESTI in js/vita.js, dalla tabella «Per chi disegna» di src/testi/vita-roma-fonti.md), per la folla,
   per chi porta lo scudo (il soldato dell'epoca: elmo, scudo e lancia dove la tabella li dà) e per il clero dopo il 600; o.posa, la posa (RM.figuraPosaDi: testa girata,
   un braccio piegato, il peso su una gamba). La folla prende le tinte della veste (lana non tinta dove la fonte non dà colori), non quelle della scena. */
var ROMANI={274:1,312:1,357:1,472:1};      // le scene in cui chi porta lo scudo è un soldato romano (la tabella descrive solo quelli): Goti, Longobardi, Saraceni e gladiatori restano come prima; ruolo 'romano' per i romani delle altre scene
var ANNO_SC=300;      // l'anno della scena che si sta costruendo (vicine, istanze e le scene senza raccolta lo fissano): sceglie le vesti
function annoDi(nome){ var a=parseInt(nome,10); return a>=235&&a<=852?a:null; }
function vesteDi(nome,ov){ var b=RM.VESTI&&RM.VESTI[nome]; if(!b) return null; if(!ov) return nome; var v={}, q; for(q in b) v[q]=b[q]; for(q in ov) v[q]=ov[q]; v.nome=nome+'+'+Object.keys(ov).map(function(q){ var x=ov[q]; return q+':'+(x&&x.col?hex(x.col):x&&x.r!=null?hex(x):JSON.stringify(x)); }).join(','); return v; }
var CIVILI=[['uomo3','uomo3b','tunica3','donna3','donna3'],['uomo4','uomo4b','tunica4','schiavo4','donna4','donna4b'],['uomo7','uomo7b','uomo7c','tunica7','donna7','donna7']];
function opzioni(col,scudo,ruolo,k){
  var h=((k*2654435761)>>>0)%100, o={f:0, k:(h&1)?3:0, veste:col||C.tunica, scudo:scudo||null, s:1, pieno:PIENA, fine:TESTA_FINE}, ep=RM.epocaVesti?RM.epocaVesti(ANNO_SC):0, VS=!!RM.VESTI;      // due carnagioni e due capigliature (js/vita.js), non quattro: meno maglie da disegnare
  if(VS && ruolo!=='carlo'){ var p0=RM.figuraPosaDi(k,true); o.posa={yaw:p0.yaw, braccio:p0.braccio, anca:p0.anca}; }      // una copia: le pose sono condivise
  var romano=ruolo==='romano'; if(romano) ruolo=null;
  if(VS && scudo && !ruolo && (romano || ROMANI[ANNO_SC])){ var sv=['soldato3','soldato4','soldato7'][ep]; o.v=vesteDi(sv,{scudo:{r:RM.VESTI[sv].scudo.r, col:scudo}}); o.scudo=null; o.posa={yaw:o.posa.yaw*.4, braccio:0, anca:0}; return o; }      // il soldato dell'epoca: lo scudo nel colore della scena (le scene che distinguono due parti lo fanno con lo scudo: colori di comodo, detti lì)
  if(VS && ep===2 && (ruolo==='clero'||ruolo==='papa'||ruolo==='scalzo')){ o.v=vesteDi('clero7',{manto:{t:'planeta', col:col===C.oro?RM.col(0xb89040):RM.VESTI.clero7.manto.col}}); o.veste=C.bianco; o.scalzo=ruolo==='scalzo';      // la «planeta» gialla dei mosaici del IX secolo o castagna (Gregorio), sulla dalmatica bianca
    o.posa.braccio=h%3?2:0; return o; }
  if(VS && ruolo==='folla'){ var L=CIVILI[ep], nm=L[h%L.length]; if(INVERNO && /^tunica/.test(nm)) nm=L[0]; o.v=nm; var ti=RM.VESTI[nm].tinte; o.veste=ti[(h>>2)%ti.length].clone().multiplyScalar(.9+(h%7)*.033);
    if(h>=92 && /^tunica/.test(nm)) o.s=.7; return o; }      // donne, uomini col mantello, ragazzi: le vesti dell'epoca, in lana non tinta o nei colori attestati
  if(VS && ruolo==='donna'){ o.v=['donna3','donna4','donna7'][ep]; return o; }      // la donna dell'epoca, nel colore che la scena le dà
  if(ruolo==='clero' || ruolo==='papa'){ o.f=3; o.sopra=col; if(ruolo==='papa') o.veste=C.bianco; }
  else if(ruolo==='scalzo'){ o.f=3; o.sopra=col; o.scalzo=true; }
  else if(ruolo==='carlo'){ o.f=1; o.sopra=RM.col(0x5a4a3a); }      // la tunica nel colore della scena, il mantello di lana sobrio (Eginardo 23: blu l'abito comune, a Roma due volte alla romana; i giorni non sono detti)
  else if(ruolo==='donna') o.f=2;
  else if(ruolo==='folla'){ if(h<32) o.f=2; else if(h<52) o.f=1; if(h>=92){ o.f=0; o.s=.7; } }      // donne, uomini col mantello, ragazzi
  else if(h<28) o.f=1;
  if(o.f===2 && h%3===1) o.velo=RM.col(0xb3a487);
  if(INVERNO && o.f===0 && ruolo!=='carlo'){ o.f=1; o.s=1; }      // d'inverno il mantello (25 novembre 2026)
  return o;
}
function chiaveP(o){ var v=o.v?(typeof o.v==='string'?o.v:o.v.nome):'', p=o.posa?[o.posa.yaw.toFixed(1),o.posa.braccio,o.posa.anca.toFixed(4)].join(','):'';
  return ['p'+(o.pieno?'P':'')+(o.leggero?'L':'')+(o.fine?'F':''),o.f,o.k,hex(o.sopra),hex(o.velo),o.chino||0,o.legato?1:0,o.collare?1:0,hex(o.scudo),o.s,o.scalzo?1:0,o.ginocchio?1:0,o.braccia||0,v,p].join('|'); }
function persona(dest,x,z,y,col,scudo,ry,ruolo){ var o=opzioni(col,scudo,ruolo,contaP++); emetti(dest,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); }
function cavaliereVero(dest,x,z,y,ry,colC,colU,solo,ruolo){
  var k=contaP++, m=locale(x,y,z,ry), cc=colC||C.cavalloB, leg=CAV_LEGGERO;
  emetti(dest,(leg?'cavL|':'cav|')+hex(cc),function(){ return cavalloGeo(cc,leg); },m,null);
  if(solo) return;
  var o=opzioni(colU,null,ruolo,k); o.f=4; o.sopra=null; o.velo=null; o.s=1; o.v=null; o.posa=null; if(leg){ o.leggero=true; o.pieno=false; }      // a cavallo: la foggia seduta, senza posa (col cavallo leggero anche il cavaliere è leggero)
  emetti(dest,chiaveP(o),function(){ return personaGeo(o); },m.clone().multiply(locale(0,.068,-.01,0)),o.veste);      // seduto in sella, come RM.figura.cavaliere di js/vita.js
}
function seduto(dest,x,y,z,ry,col){ var o=opzioni(col,null,null,contaP++); o.f=4; o.sopra=null; o.v=null; o.posa=null; emetti(dest,chiaveP(o),function(){ return personaGeo(o); },locale(x,y,z,ry),o.veste); }      // l'imperatore sul carro
/* il cavallo leggero dei telefoni: le stesse misure di cavallo() in js/monumenti.js (un centimetro di statua = .0001), con meno lati e senza giunti: circa 200 triangoli invece di 900 */
function cavalloLeggero(T,col){ var u=.01;
  function palla(r,x,y,z,sx,sy,sz){ T.geo(new THREE.SphereGeometry(r,6,4).scale(sx,sy,sz).translate(x,y,z),col); }
  function arto(a,b,r0,r1){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,4,1);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); T.geo(g,col); }
  palla(3.6*u,0,12.3*u,0,.95,1,2.25); palla(3.2*u,0,12.9*u,-4.6*u,1,1.05,1.1); palla(3.1*u,0,12.6*u,4.6*u,1,1.05,1.1);
  arto([0,13.5*u,5.5*u],[0,19.4*u,8.6*u],3*u,1.9*u); arto([0,19.6*u,8.4*u],[0,16.6*u,13*u],2*u,1.15*u);
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(q,n){ var zx=q[1]*5.2*u, xx=q[0]*2.1*u, gin=zx+(q[1]<0?-.9*u:.3*u);
    if(n===0){ arto([xx,11*u,zx],[xx,7*u,zx+2.6*u],1.5*u,1.05*u); arto([xx,7*u,zx+2.6*u],[xx,3.4*u,zx+1.2*u],1*u,.8*u); }
    else { arto([xx,11*u,zx],[xx,5.6*u,gin],1.6*u,1*u); arto([xx,5.6*u,gin],[xx,.2*u,zx],.95*u,.85*u); } });
  arto([0,13.4*u,-7.6*u],[0,6.5*u,-9.6*u],1.1*u,.5*u);
}
var CAV_LEGGERO=false;      // mentre si costruisce il seguito dell'800: il cavallo leggero anche sul PC (70 cavalieri visti da 50 m: con il cavallo delle statue non stavano nel tetto di «media» e restavano pedine)
function cavalloGeo(col,leg){ var T=new RM.Costruttore(); if(LEGGERA||leg) cavalloLeggero(T,col); else RM.cavalloStatua(T,0,0,0,0,1,col); var g=T.geometria(); g.deleteAttribute('tipo');
  g.setAttribute('fisso',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(1),1)); return g; }
/* La geometria di una persona, in unità della scena (piedi a y=0, sguardo verso +z), dal corpo di js/vita.js. Le parti senza colore proprio (la veste) diventano bianche:
   il colore lo dà l'istanza o emetti(). Le pose: o.chino piega in avanti collo e testa attorno alla base del collo; o.legato porta le due braccia in avanti e verso il centro,
   le mani unite davanti al ventre con un giro di corda; o.collare mette un collare di corda al collo. */
function personaGeo(o){
  /* o.pieno (25 novembre 2026): dentro San Pietro, nell'800, le persone si vedono da pochi metri (i Franchi dietro Carlo, il clero, le prime file della folla): sui telefoni
     restavano a tre lati e senza mani, «birilli» nella cattura dell'utente. Lì sono piene anche sui telefoni: costano circa il doppio, pagato dalle figure leggere dei protagonisti */
  var LEG=(LEGGERA||!!o.leggero) && !o.pieno, g=RM.figuraGeo(o.v||o.f,o.k,LEG?3:5,o.fine?14:0),      /* o.fine (27 novembre 2026): la testa liscia a 14 lati, col naso e il mento accennati, per chi sta nei primi piani dell'800 */ pa=g.attributes.position.array, na=g.attributes.normal.array, ca=g.attributes.color.array, fa=g.attributes.fisso.array, oa=g.attributes.oscilla.array, sa=g.attributes.ombra?g.attributes.ombra.array:null;
  var Pp=[], Nn=[], Cc=[], Ff=[], i, n=pa.length/3, v=new THREE.Vector3(), w=new THREE.Vector3();
  function uguale(c,q){ return Math.abs(c[0]-q.r)+Math.abs(c[1]-q.g)+Math.abs(c[2]-q.b)<.01; }
  function rgb(q){ return [q.r,q.g,q.b]; }
  function ruota(p,asse,ang,cy,cz,cx){ var q=p.clone(); q.x-=cx||0; q.y-=cy||0; q.z-=cz||0; q.applyAxisAngle(asse,ang); q.x+=cx||0; q.y+=cy||0; q.z+=cz||0; return q; }
  var X=new THREE.Vector3(1,0,0), Z=new THREE.Vector3(0,0,1), GIN=.05;      // GIN: l'altezza del ginocchio (50 cm)
  function braccio(p,nn,s){ var a=-.3*s, b=-.45; p.copy(ruota(ruota(p,Z,a,.138,0,s*.02),X,b,.138,0,0)); if(nn){ nn.applyAxisAngle(Z,a).applyAxisAngle(X,b); } }
  function testa(p,nn){ p.copy(ruota(p,X,o.chino,.143,0,0)); if(nn) nn.applyAxisAngle(X,o.chino); }
  function alza(p,nn,s){ var up=o.braccia===1||o.braccia===3, a=(up?.3:-.06)*s, b=up?-2.6:-1.4; p.copy(ruota(ruota(p,Z,a,.138,0,s*.02),X,b,.138,0,0)); if(nn){ nn.applyAxisAngle(Z,a).applyAxisAngle(X,b); } }
  var MN=RM.figuraMani||{'-1':[-.21,.81,.095],'1':[.206,.815,.135]};
  function mano(i){ var j=i*3, M=MN[pa[j]>0?1:-1]; return Math.hypot(pa[j]-M[0]*.1,pa[j+1]-M[1]*.1,pa[j+2]-M[2]*.1)<.0047; }      // un vertice della mano (js/vita.js, RM.figuraMani, in metri)
  for(i=0;i<n;i++){
    if(LEG && i%3===0 && Math.abs(oa[i])>1.5 && mano(i) && mano(i+1) && mano(i+2)){ i+=2; continue; }      // la persona leggera non ha le mani
    var j=i*3, c=[ca[j],ca[j+1],ca[j+2]], fis=fa[i], os=oa[i];
    v.set(pa[j],pa[j+1],pa[j+2]); w.set(na[j],na[j+1],na[j+2]);
    if(!fis){ var lu=Math.min(1.1,(c[0]+c[1]+c[2])/(V_BIANCO.r+V_BIANCO.g+V_BIANCO.b)); c=[lu,lu,lu]; }      // la veste prende il colore dell'istanza (le fasce più scure restano più scure)
    else if(!o.v && uguale(c,V_BIANCO)) c=rgb(o.sopra||V_BIANCO);                           // la toga, o la veste lunga (le vesti dell'epoca, o.v, hanno già i loro colori)
    else if(!o.v && uguale(c,V_LANA)) c=rgb(o.sopra||V_LANA);                               // il mantello e le maniche
    else if(!o.v && uguale(c,V_VELO)) c=rgb(o.velo||V_VELO);                                // la palla delle donne
    else if(o.scalzo && uguale(c,V_SANDALO) && v.y<.012) c=rgb(V_PELLE);                    // a piedi nudi
    if(o.braccia && Math.abs(os)>1.5 && (o.braccia!==3 || os>0)) alza(v,w,os>0?1:-1);      // 800: le braccia alzate dell'acclamazione (1), un braccio solo (3), o tese in avanti (2)
    else if(o.legato && Math.abs(os)>1.5) braccio(v,w,os>0?1:-1);
    else if(o.chino && Math.abs(os)<.5 && v.y>.143 && Math.abs(v.x)<.13) testa(v,w);
    if(o.posa && !o.legato && !o.braccia && !o.chino && !o.ginocchio) RM.figuraPosa(v,w,os,o.posa);      // la posa (js/vita.js): testa girata, un braccio piegato, il peso su una gamba
    if(o.ginocchio){ if(v.y<GIN){ v.copy(ruota(v,X,Math.PI/2,GIN,0,0)); w.applyAxisAngle(X,Math.PI/2); } v.y-=GIN-.008; }      // in ginocchio (800): le gambe sotto il ginocchio piegate all'indietro, il corpo abbassato
    var om=sa?sa[i]:1; Pp.push(v.x,v.y,v.z); Nn.push(w.x,w.y,w.z); Cc.push(c[0]*om,c[1]*om,c[2]*om); Ff.push(fis?1:0);      // l'ombra delle pieghe (js/vita.js) moltiplica il colore, anche quello della veste data dall'istanza
  }
  function aggiungi(q,col,chino){ var t=q.index?q.toNonIndexed():q, P2=t.attributes.position.array, N2=t.attributes.normal.array;
    for(var k=0;k<P2.length;k+=3){ v.set(P2[k],P2[k+1],P2[k+2]); w.set(N2[k],N2[k+1],N2[k+2]); if(chino) testa(v,w); Pp.push(v.x,v.y,v.z); Nn.push(w.x,w.y,w.z); Cc.push(col.r,col.g,col.b); Ff.push(1); } }
  if(o.collare) aggiungi(new THREE.CylinderGeometry(.0072,.0072,.0045,8).translate(0,.1455,.002),CORDA,!!o.chino);      // il collare di corda
  if(o.legato){ var m0=new THREE.Vector3(MN[1][0]*.1,MN[1][1]*.1,MN[1][2]*.1), m1=new THREE.Vector3(MN[-1][0]*.1,MN[-1][1]*.1,MN[-1][2]*.1); braccio(m0,null,1); braccio(m1,null,-1);
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
  Object.keys(PARTI).forEach(function(nome){ var resto=(RM.q===0 && TETTO_TEL[nome])||tetto*(TETTO_PIU[nome]||1);
    PARTI[nome].forEach(function(q){
      var r0=resto; if(RM.q===0 && !q.tel) resto=0;      // in «bassa» spendono solo le parti «tel»
      if(q.tipo==='blocco'){ var t=0; q.coppie.forEach(function(c){ t+=c.tri*Math.max(0,c.g.count); }); var si=tetto>0&&t<=resto; if(si) resto-=t;
        if(RM.q===0 && !q.tel) resto=r0;
        q.coppie.forEach(function(c){ c.gd.visible=si; c.g.geometry.setDrawRange(0,si?0:Infinity); }); return; }
      if(!q.mS) return;
      var n=0; while(n<q.tri.length && q.tri[n]<=resto){ resto-=q.tri[n]; n++; }
      if(RM.q===0 && !q.tel) resto=r0;
      q.vari.forEach(function(w){ var c=0; while(c<w.ord.length && w.ord[c]<n) c++; w.m.count=c; });
      q.mS.geometry.setDrawRange(q.fS[n],Infinity); });
  });
}
RM.figureScene={ parti:PARTI, assegna:assegna, tettoTel:TETTO_TEL, triangoli:function(nome){ var t=0; (PARTI[nome]||[]).forEach(function(q){      // per le prove: triangoli di persone accesi in una scena
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
  if(!testo){ if(rigaEl.style.display!=='none') rigaEl.style.display='none'; return; }      // si scrive nello stile solo quando cambia: una scrittura a ogni fotogramma costringeva il browser a rifare l'impaginazione quando i cartellini leggono le misure
  if(rigaEl.textContent!==testo){ rigaEl.textContent=testo; rigaEl.style.top=sottoConta(62,12)+'px'; } if(rigaEl.style.display!=='block') rigaEl.style.display='block';
}
/* Sul telefono la riga del tempo e la frase dell'acclamazione stavano a 62 punti dal bordo, sopra la riga «stime da 20.000 a 60.000» del contatore della città
   (l'utente, 25 novembre 2026, dall'iPhone). Ora si mettono 8 punti sotto il contatore, misurato quando la riga cambia; sul PC restano dov'erano. */
function sottoConta(tel,pc){
  if(window.innerWidth>=700) return pc;
  var riq=document.querySelector('.riquadro.roma'), c=riq&&riq.querySelector('.conta'); if(!c||!c.offsetHeight) return tel;
  var a=c.getBoundingClientRect(), b=riq.getBoundingClientRect(); return Math.max(tel,Math.round(a.bottom-b.top+8)); }
var breveOra=null;
function breve(t){ if(t===breveOra) return; breveOra=t; if(RM.didascaliaBreve) RM.didascaliaBreve(t); }      // q[3]: fonte e riserve del tempo in corso, nella didascalia ridotta (solo le scene che le danno: l'800)
RM.frame.push(function(dt){
  if(inAttesa){ if(inAttesa.seq.visibile()) riga(RIGA_ATTESA); else riga(null); return; }      // la scena aspetta la carta: lo si dice nella riga dei tempi
  var o=corrente; if(!o||!o.righe||MENO||FERMA!=null||o.t==null){ if(rigaEl&&rigaEl.style.display!=='none'&&(!o||o.t==null)) riga(null); if(!MENO && breveOra && (!o||o.t==null)) breve(null); return; }
  if(!o.visibile()){ riga(null); breve(null); return; }
  if(o.t>=o.fine){ dopo+=dt; if(dopo>4){ riga(null); breve(null); corrente=null; } return; }
  var r=null, f=null, st=(RM.largW||window.innerWidth)<700; o.righe.forEach(function(q){ if(o.t>=q[0]){ r=(st&&q[2])||q[1]; f=q[3]||null; } }); riga(r); breve(f);      // q[2]: la riga corta per il telefono (la frase intera resta nella didascalia)
});
function quadro(o){ if(o.attende){ o.disegna(0); giornoDiNuovo(); return; }      // aspetta il passo della carta (410, più sotto): la città prima del sacco, alla luce scelta da chi guarda
  o.disegna(FERMA!=null?Math.min(o.fine,FERMA):o.quadroT!=null?o.quadroT:o.fine); }      // la scena ferma, prima che parta o dopo (quadroT: un altro istante, se la fine non è il quadro giusto: l'800)
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
function istanze(fa,N,nome,chiave,pr,faD,tel){ if(annoDi(nome)) ANNO_SC=annoDi(nome); var B=new RM.Costruttore(); fa(B); var g=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),Math.max(1,N)); g.frustumCulled=false; g.castShadow=true; g.visible=false;
  O3.position.set(0,-50,0); O3.scale.setScalar(0); O3.updateMatrix(); for(var k=0;k<g.count;k++) g.setMatrixAt(k,O3.matrix);      // le istanze non usate restano nascoste
  if(nome && VERE && (tel || !LEGGERA)){
    var Bd=new RM.Costruttore(); DETT=true; try{ (faD||fa)(Bd); } finally { DETT=false; }
    var gd=new THREE.InstancedMesh(Bd.geometria(),g.material,Math.max(1,N)), cnt=g.count;
    gd.instanceMatrix=g.instanceMatrix; gd.frustumCulled=false; gd.castShadow=gd.receiveShadow=true; gd.visible=false; gd.count=cnt; g.add(gd);
    Object.defineProperty(g,'count',{configurable:true, get:function(){ return cnt; }, set:function(v){ cnt=v; gd.count=v; }});      // le due maglie mostrano le stesse istanze
    parte(nome,{tipo:'blocco', pr:pr||0, chiave:chiave, tel:!!tel, coppie:[{g:g, gd:gd, tri:Bd.pos.length/9}]});
    g.userData.gd=gd;      // la maglia delle persone, per chi le cambia il materiale (il passo del corteo dell'800)
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
   26 novembre 2026, passi riletti (src/testi/scene-roma-fonti.md, «312, ponte Milvio»): togliere i ferri era il piano di Massenzio, Zosimo non dice che furono tolti; i suoi fuggono
   «over the bridge into the city», «The beams not being strong enough to bear so great a weight, they broke», e Massenzio «with the others, was carried with the stream».
   Nessuna delle tre fonti fa passare i fuggiaschi sul ponte di pietra: prima la scena li mandava anche lì e lo faceva intasare, e un terzo di quelli fermi alla testata
   veniva spinto nel fiume (non è nel racconto di Zosimo). Ora, in 14 secondi: i fuggiaschi corrono tutti al ponte di travi, i primi lo passano verso la città; la folla lo
   riempie, le travi si flettono e all'ottavo secondo cedono al centro (i ferri restano dove sono); chi era sopra cade nel Tevere e la corrente lo porta a valle, Massenzio
   (in porpora) con loro; chi non era ancora salito si ferma. La cavalleria di Costantino (in rosso) insegue da nord e si ferma prima del fiume. Il ponte di pietra resta vuoto.
   Forma e posto della passerella, numeri, tempi, percorsi e colori sono uno schema; che Massenzio fosse a cavallo è una scelta nostra.
   Sotto, ferma, una massa di fuggiaschi più lontani dal fiume, davanti al ponte di travi.
   Scelta dell'utente del 26 novembre 2026 («Pietra tagliato»): nel 312 il ponte di pietra si mostra interrotto (Lattanzio 44, 9: «Pons a tergo eius scinditur», «ad pontem, qui
   interruptus erat»; il varco sta in js/mura.js, campo taglio di GENERICI) accanto al ponte di travi di Zosimo. Unire i due racconti è una ricostruzione: nessuna fonte parla di due
   ponti; punto e forma del taglio e posto del ponte di travi sono ipotesi, dette nella didascalia. Il taglio non si vede accadere: Lattanzio non dice come né chi. */
ANNO_SC=312;      // le figure del 312 non stanno in una raccolta: le vesti del III secolo
var milvio=(function(){
  var B=new RM.Costruttore(), P2=M312.P, i, b, a, xz;
  for(i=0;i<1300;i++){
    b=11+Math.pow(rnd(),1.4)*7.5; rnd(); a=M312.AP+(rnd()-.5)*2*(1.5+(b-10)*1.1); xz=P2(a,b);      // tutti davanti al ponte di travi (prima metà davanti al ponte di pietra); il rnd() a vuoto tiene ferma la sequenza
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
  /* le figure che si muovono (26 novembre 2026: tutte verso il ponte di travi, nessuna sul ponte di pietra, nessuna spinta nel fiume; si veda il commento sopra).
     La sequenza dei numeri a caso del file (rnd) e il contatore delle persone (contaP) servono anche alle scene che seguono: qui si consumano come prima (consumo),
     e le figure nuove prendono i loro numeri da un generatore loro, così le altre scene non cambiano. */
  var c0=contaP, NF=RM.leggero?160:320, F=[], tent=0, r3=RM.casuale(3120);
  (function consumo(){ var n=0, t=0; while(n<NF*2 && t++<NF*20){ var pas=n%2===0; rnd(); rnd(); rnd();
    if(rnd()<.3) rnd(); else { var b0=10.8+rnd()*7, a0=(pas?AP:0)+(rnd()-.5)*2*(1+(b0-10)*1.1), q0=P2(a0,b0); if(RM.distFiume(q0[0],q0[1])<6.4) continue; rnd(); }
    if(pas) rnd(); rnd(); n++; } })();
  /* i più vicini al ponte di travi (NV) diventano persone se il gradino lo consente (RM.QUALITA.figScena; tutti insieme o nessuno), gli altri restano pedine */
  var NV=RM.leggero?50:100, fa0=function(B){ uomo(B,0,0,0,C.tunica,C.grigio,0); }, fa1=function(B){ uomo(B,0,0,0,C.grigio,C.grigio,0); };
  var corpi=[istanze(fa0,NV,'312','fuggiaschi',1), istanze(fa1,NV,'312','fuggiaschi',1), istanze(fa0,NF*2), istanze(fa1,NF*2)];
  while(F.length<NF*2 && tent++<NF*20){ var j=F.length, f={aB:AP,lat:(r3()-.5)*.56,v:1+r3()*.6,j:j,col:r3()<.75?0:1,fase:r3()*6.3};
    if(r3()<.3){ f.d1=0; f.rit=0; f.s0=r3()*9; }      // già sulla rampa o sul ponte
    else { var b0=10.8+r3()*7, a0=AP+(r3()-.5)*2*(1+(b0-10)*1.1), q0=P2(a0,b0); if(RM.distFiume(q0[0],q0[1])<6.4) continue;
      f.a0=a0; f.b0=b0; f.d1=Math.hypot(a0-AP-f.lat,b0-10.5); f.rit=r3()*2.5; f.s0=0; }
    f.ry=SUD+(r3()-.5)*.5; F.push(f); }
  F.slice().sort(function(x,y){ return (x.d1+x.rit-x.s0)-(y.d1+y.rit-y.s0); }).forEach(function(f,i){ f.g=corpi[(i<NV?0:2)+f.col]; });      // vicini: quelli che arrivano prima sul ponte
  var nk=[0,0,0,0]; F.forEach(function(f){ var q=corpi.indexOf(f.g); if(nk[q]>=(q<2?NV:NF*2)){ q+=q<2?2:0; f.g=corpi[q]; } f.k=nk[q]++; });
  corpi.forEach(function(g,k){ g.count=nk[k]; });
  /* il cedimento: le travi si flettono sotto il peso (da TC-1,6) e poi si spezzano al centro; le due metà ruotano attorno al capo a terra, la sud un poco dopo */
  var ANG=.2, FLES=.014;
  function liscio(x){ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function angolo(t,s){ var tc=TC+(s<0?.18:0), fl=FLES*liscio((t-TC+1.6)/1.6); return t<tc?fl:fl+(ANG*(s<0?.93:1)-fl)*Math.min(1,Math.pow((t-tc)/.9,2)); }
  function prima(f,t){      // [a,b] senza il crollo
    var s=Math.max(0,t-f.rit)*f.v;
    if(s<f.d1){ var k=s/f.d1; return [f.a0+(f.aB+f.lat-f.a0)*k, f.b0+(10.5-f.b0)*k, 0]; }
    return [f.aB+f.lat, Math.max(-16-(f.j%9)*.4,10.5-(f.s0+(s-f.d1)*.9)), 1];      // passato il ponte, verso la città: poi si fermano sulla pista
  }
  function inAcqua(a,b,t0,t,f){ var xz=P2(a+.22*Math.max(0,t-t0),b); return [xz[0],-.645+.008*Math.sin(t*2.2+f.fase),xz[1],1]; }      // sotto il pelo dell'acqua resta fuori la testa; la corrente porta a valle (Zosimo: «carried with the stream»)
  function sulPonte(a,b,t){ var s=b<0?-1:1, r=7.8-Math.abs(b), an=angolo(t,s); return [.5-r*Math.sin(an), b*(1-.25*an/ANG)]; }      // quota e posto lungo l'asse di chi è sull'impalcato mentre si flette e cede
  function passo(f,t){ return .0035*Math.abs(Math.sin(t*8.5+f.fase)); }      // il passo di corsa: un sobbalzo di pochi centimetri
  function dove(f,t){      // [x,y,z,in acqua]
    var p=prima(f,Math.min(t,TC)), xz, q;
    if(p[2] && Math.abs(p[1])<=7.8){      // sull'impalcato all'istante del cedimento (o prima): si flette e scende con la sua metà, poi è in acqua
      q=sulPonte(p[0],p[1],t); xz=P2(p[0],q[1]);
      if(q[0]>-.645) return [xz[0],q[0]+(t<TC?passo(f,t):0),xz[1],0];
      var tw=TC+.75; return inAcqua(p[0],q[1],tw,t,f);
    }
    if(t<TC || (p[2] && p[1]<-7.8)){ p=prima(f,t); xz=P2(p[0],p[1]); var cam=p[2]&&p[1]>-16-(f.j%9)*.4+.01;      // prima del cedimento, o già passato verso la città
      return [xz[0],(p[2]?quota(p[0],p[1],true):Hm(xz[0],xz[1]))+(cam||!p[2]?passo(f,t):0),xz[1],0]; }
    /* non ancora sull'impalcato: rallenta e si ferma dov'è, senza salire oltre la testata spezzata */
    var p1=prima(f,TC+.05), k=1-Math.exp(-3*(t-TC)), a=p[0]+(p1[0]-p[0])*6.67*k, b=Math.max(7.95,p[1]+(p1[1]-p[1])*6.67*k);
    if(p[1]<=7.95) b=p[1];
    xz=P2(a,b); return [xz[0],(p[2]||b<10.5?quota(a,b,true):Hm(xz[0],xz[1]))+passo(f,t)*(1-k),xz[1],0];
  }
  /* la cavalleria di Costantino, le insegne e Massenzio */
  /* la cavalleria di Costantino: i più avanti (NCV) diventano persone se il gradino lo consente, gli altri restano pedine */
  var NC=RM.leggero?80:160, NCV=12, K=[], fc0=function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.rosso); }, fc1=function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.rosso); };
  var cav=[istanze(fc0,NCV,'312','cavalieri',2), istanze(fc1,NCV,'312','cavalieri',2), istanze(fc0,NC), istanze(fc1,NC)];
  for(i=0;i<NC*2&&K.length<NC*2;i++){ var sc=i%3, a1=(rnd()-.5)*30+(sc-1)*8, b1=25+sc*3+rnd()*6, st=19.5+sc*1.6+rnd()*1.5, p1=P2(a1,st), p0=P2(a1,b1);
    if(RM.distFiume(p1[0],p1[1])<6.4||RM.distFiume(p0[0],p0[1])<6.4) continue; K.push({a:a1,b0:b1,stop:st,ry:SUD+(rnd()-.5)*.3,fase:K.length*1.7}); }
  var nc=[0,0,0,0]; K.slice().sort(function(x,y){ return x.stop-y.stop; }).forEach(function(k2,i2){ var q=(i2<NCV*2?0:2)+(i2%2); k2.g=cav[q]; k2.k=nc[q]++; });
  cav.forEach(function(g,q){ g.count=nc[q]; });
  var ins=istanze(function(B){ insegna(B,0,0,0,C.rosso,.42); },9), INS=[]; for(i=0;i<9;i++) INS.push({a:(i-4)*3.4,b0:29+rnd()*4,stop:23.5+rnd()*1.5});
  var mass=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.porpora); },1,'312','massenzio',0,null,true);      // Massenzio: persona anche sui telefoni (parte «tel»)
  contaP=c0+2+((VERE&&!LEGGERA)?1:0);      // il contatore delle persone come lo lasciava la scena di prima (si veda consumo)
  /* l'acqua attorno a chi cade: quando le due metà battono sull'acqua, chiazze di schiuma che si allargano e svaniscono (prima sfere grigie larghe 20 m); attorno a ogni
     uomo in acqua un anello chiaro che pulsa piano. Macchie piatte, morbide al bordo (la stessa trama dell'ombra d'appoggio, in bianco) */
  var TB=(function(){ var N=64, d=new Uint8Array(N*N*4), i2, j2; for(j2=0;j2<N;j2++) for(i2=0;i2<N;i2++){ var r=Math.hypot(i2+.5-N/2,j2+.5-N/2)/(N/2), k2=(j2*N+i2)*4; d[k2]=d[k2+1]=d[k2+2]=255; d[k2+3]=Math.round(255*(r>=1?0:Math.pow(1-r*r,1.3))); }
    var tx=new THREE.DataTexture(d,N,N,THREE.RGBAFormat); tx.magFilter=THREE.LinearFilter; tx.minFilter=THREE.LinearMipmapLinearFilter; tx.generateMipmaps=true; tx.needsUpdate=true; return tx; })();      // bianca: quella dell'ombra d'appoggio è nera (la schiuma di prima veniva scura, e sul fiume scuro non si vedeva)
  var mSch=new THREE.MeshBasicMaterial({map:TB, color:0xf2f5f3, transparent:true, opacity:0, depthWrite:false, fog:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-8}), spr=[];
  for(i=0;i<14;i++){ if(i<8) rnd(); var ps=P2(AP+(r3()-.5)*1.4,(i-6.5)*1.05), sm=new THREE.Mesh(geoAppoggio(1,1),mSch); sm.position.set(ps[0],-.497,ps[1]); sm.visible=false; sm.renderOrder=2; fissa.add(sm); spr.push({m:sm, r:1.2+r3()*1.4, d:Math.abs(i-6.5)*.03}); }      // il rnd() a vuoto: gli otto spruzzi di prima ne prendevano uno ciascuno; figlie della maglia fissa, si spengono con lei
  var mAn=new THREE.MeshBasicMaterial({map:TB, color:0xeef2f0, transparent:true, opacity:.85, depthWrite:false, fog:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-8}), anelli=new THREE.InstancedMesh(geoAppoggio(.11,.11),mAn,F.length+1);
  anelli.frustumCulled=false; anelli.castShadow=anelli.receiveShadow=false; anelli.renderOrder=2; anelli.visible=false; RM.scene.add(anelli);
  function anello(k,p,t,fase){ if(!p){ O3.position.set(0,-50,0); O3.scale.setScalar(0); } else { O3.position.set(p[0],-.497,p[2]); O3.scale.setScalar(1+.25*Math.sin(t*2.6+fase)); } O3.rotation.set(0,0,0); O3.updateMatrix(); anelli.setMatrixAt(k,O3.matrix); }
  function disegna(t){
    if(MENO) t=Math.min(t,TC+2.6);      // con meno animazioni la scena resta ferma qui: le travi cedute, gli uomini in acqua, Massenzio ancora visibile
    var aN=angolo(t,1), aS=angolo(t,-1); nord.rotation.z=-aN; sud.rotation.z=-aS;
    F.forEach(function(f,j){ var p=dove(f,t); metti(f.g,f.k,p[0],p[1],p[2],f.ry); anello(j,p[3]?p:null,t,f.fase); });
    K.forEach(function(k2){ var b=Math.max(k2.stop,k2.b0-t*1.1), p=P2(k2.a,b), cr=b>k2.stop+.01?.005*Math.abs(Math.sin(t*6+k2.fase)):0; metti(k2.g,k2.k,p[0],Hm(p[0],p[1])+cr,p[1],k2.ry); });
    INS.forEach(function(s,j){ var b=Math.max(s.stop,s.b0-t*1.1), p=P2(s.a,b); metti(ins,j,p[0],Hm(p[0],p[1]),p[1],0); });
    /* Massenzio: arriva sul mezzo del ponte di travi quando cede (Zosimo: «with the others, was carried with the stream»); in acqua la corrente lo porta a valle, poi sparisce sotto */
    var bm=Math.max(1.2,12-t*1.35), am=AP+.4*liscio(t/4), pm, ym, sm=1, inA=false;
    if(t<TC || bm>7.8){ pm=P2(am,bm); ym=bm>10.4?Hm(pm[0],pm[1]):bm>7.8?quota(am,bm,true):sulPonte(am,bm,t)[0]; }
    else { var bq=Math.max(1.2,12-TC*1.35), q=sulPonte(am,bq,t); inA=q[0]<=-.645;
      if(!inA){ pm=P2(am,q[1]); ym=q[0]; }
      else { var tw=TC+.82, sk=liscio((t-TC-3)/1.4); pm=P2(am+.22*Math.max(0,t-tw),q[1]); ym=-.645-.32*sk; sm=sk>=1?0:1; } }
    metti(mass,0,pm[0],ym,pm[1],SUD,sm); anello(F.length,inA&&sm?[pm[0],0,pm[1]]:null,t,0);
    posM=sm?[pm[0],ym+.1,pm[1]]:null; var c4=INS[4], b4=Math.max(c4.stop,c4.b0-t*1.1), q4=P2(c4.a,b4); posK=[q4[0],Hm(q4[0],q4[1]),q4[1]];      // per i nomi sulla scena
    var ks=t-TC-.35; mSch.opacity=ks>0&&ks<2.6?.8*(1-ks/2.6):0; spr.forEach(function(s){ var k=Math.max(0,(ks-s.d)/2.6); s.m.visible=ks>s.d&&k<1; var g=s.r*(.35+.9*Math.sqrt(k)); s.m.scale.set(g,1,g); });
    anelli.instanceMatrix.needsUpdate=true; corpi.concat(cav,[ins,mass]).forEach(function(g){ g.instanceMatrix.needsUpdate=true; });
  }
  var tutte=corpi.concat(cav,[ins,mass,nord,sud,fissa,anelli]), posM=null, posK=null;
  var o=sequenza({fine:14, attesa:1.8, disegna:disegna, visibile:function(){ return fissa.visible; },
    righe:[[0,'1 · I soldati di Massenzio fuggono verso il ponte di travi','1 · La fuga verso il ponte di travi'],[TC-1.6,'2 · La folla è troppo pesante: le travi si flettono (Zosimo)','2 · Le travi si flettono (Zosimo)'],
           [TC,'3 · Le travi cedono: chi era sopra cade nel Tevere','3 · Le travi cedono'],[TC+2.4,'4 · La corrente porta via Massenzio con gli altri (Zosimo)','4 · La corrente porta via Massenzio']],
    azioni:[[5.6,function(){ var q=P2(AP-5,-12.5), v=alto(RM.adatta({t:P2(AP+2.6,.5),c:[q[0],11.5,q[1]]})); RM.volaA(v.t,v.c,2.2); }]]});      // da vicino, sul ponte di travi che sta per cedere
  /* la vista della regia: da sud, oltre il fiume, alta e inclinata: in basso l'acqua (sotto la didascalia non c'è nulla), in mezzo il ponte di travi intero e accanto il ponte
     di pietra interrotto, in alto la riva nord con la folla che si stringe verso il ponte e i cavalieri di Costantino che arrivano; il sole alle spalle della camera.
     (26 novembre 2026, secondo giro: la vista da nord stava controsole e lasciava i ponti sul bordo alto, sotto la didascalia; quella stretta non mostrava chi fugge né chi insegue) */
  var vt=P2(AP+5.5,4.5), vc=P2(AP-3,-31);
  RM.prova312={seq:o, TC:TC, disegna:disegna};      // per le prove senza finestra: ?scena=<secondi> ferma la scena, RM.prova312.disegna(t) la porta a un istante
  return {seq:o, tutte:tutte, da:311.6, a:313, vista:{t:vt,c:[vc[0],38,vc[1]]}, massenzio:function(){ return posM; }, cavalieri:function(){ return posK; }};
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
  },0,true);
  vicine(B,'593',[vt0.x,vt0.z],function(){
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
  },1,true);      // le guardie dopo i prigionieri: in «bassa» il tetto va prima alla fila
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
function carro(B,x,z,y,ry,carico){ B.dentro(x,y,z,ry,function(B){
  B.scatola(.13,.05,.22,0,.05,0,P.tronco).scatola(.015,.09,.09,-.075,0,0,P.tronco).scatola(.015,.09,.09,.075,0,0,P.tronco);
  if(carico) B.scatola(.11,.05,.17,0,.1,0,carico);
  B.scatola(.055,.08,.19,-.04,0,.3,C.cavalloC).scatola(.055,.08,.19,.04,0,.3,C.cavalloC); }); }
function vicinoAlFiume(px,pz){ var curva=RM.curvaFiume, m=1e9, tm=0, q, dd; for(var i=0;i<=2400;i++){ q=curva.getPoint(i/2400); dd=Math.hypot(q.x-px,q.z-pz); if(dd<m){ m=dd; tm=i/2400; } } return curva.getPoint(tm); }
function maglia(B){ var g=B.maglia(RM.matPietra()); g.visible=false; g.castShadow=true; RM.scene.add(g); return g; }

/* ---------- 274: il trionfo di Aureliano ----------
   Eutropio IX 13 (thelatinlibrary, letto il 23 novembre 2026): «nobilem triumphum … egit praecedentibus currum Tetrico et Zenobia».
   La Storia Augusta (Aureliano 33-34) aggiunge molti particolari: elefanti e altri animali, cartelli coi nomi dei popoli, prigionieri di molte genti, le vesti di Tetrico,
   le gemme e le catene di Zenobia, le insegne, i cavalieri corazzati, la salita al Campidoglio. È una fonte poco sicura, e dal 25 novembre 2026 (l'utente: «se è poco sicura
   eviterei») non li mostriamo. Restano: il carro con Aureliano (i quattro cavalli sono schema), Tetrico e Zenobia a piedi davanti al carro (Eutropio), i soldati dietro e la folla
   ai lati. I soldati portano ciò che la tabella «Per chi disegna» di src/testi/vita-roma-fonti.md dà per il 274 (fregio del ponte Milvio, 312-315, e Vegezio I 20): elmo con cresta,
   scudo tondo con umbone, tunica corta stretta in vita, mantello corto, lancia; i colori non sono noti (lana non tinta, scudi color legno). Il percorso, l'ultimo tratto della
   via Sacra dall'arco di Tito verso il Campidoglio, è uno schema: Eutropio non lo dà. */
var trionfo274=(function(){
  var B=new RM.Costruttore(), i, p, via=spezzata([[42,25.9],[26.1,19.7],[24.6,17.2],[24.1,14.6],[22,12.4],[18.2,10.1],[12.6,7.5],[8.9,4.6],[5.4,2.5],[4.5,2.7],[3.1,5.2],[1.9,5.5],[-7.7,1.8],[-7.8,.8],[-7,-1],[-8.6,-2.1],[-9.4,-1.9],[-14.5,3.6],[-17,5.3],[-18.1,5.3],[-23,3.6],[-25,2]]);      // la via Sacra di js/roma-topo.js (rifatta il 27 novembre 2026, notte, su Platner e Ashby, Sacra Via: fra Regia e Antonino, a nord del Divo Giulio, giù verso i Castori, lungo la basilica Giulia, a sud dell'arco di Tiberio e su per il clivo), poi verso il tempio
  /* la folla non sta dentro gli edifici (27 novembre 2026, sera; prima una parte entrava nel Divo Giulio, in Saturno e nei Rostri): un raggio dall'alto sui monumenti che nel 274
     ci sono; chi cadrebbe sopra un edificio non si disegna (circa 200 su 900, metà sulla piattaforma di Venere e Roma). I numeri a caso si consumano lo stesso, così le scene che seguono restano uguali */
  var RAG=new THREE.Raycaster(), GIU=new THREE.Vector3(0,-1,0), SU=new THREE.Vector3(), EDIF=(RM.MONUMENTI||[]).filter(function(o){
    if(!o.g||o.x==null||o.x<-40||o.x>60||o.z<-25||o.z>40) return false; var s=RM.statoMonumento?RM.statoMonumento(o.id,274):null; return !s||s.s0!=='assente'; }).map(function(o){ o.g.updateMatrixWorld(true); return o.g; });
  function sopraEdificio(x,z){ var y=H(x,z); SU.set(x,y+40,z); RAG.set(SU,GIU); var c=RAG.intersectObjects(EDIF,true); return c.length>0&&c[0].point.y>y+.12; }
  var pc=via(.64,0), pe=via(.47,0), LG=RM.lanaGrezza||{crema:C.tunica,bruno:C.grigio,grigio:C.grigio}, SCUDO=RM.col(0x7d6446);
  vicine(B,'274',[pc.x,pc.z],function(){      // Tetrico, Zenobia e Aureliano: prima di tutto
  p=via(.665,-.08); uomo(B,p.x,p.z,p.y,LG.bruno,null,p.ry); p=via(.665,.08); uomo(B,p.x,p.z,p.y,LG.crema,null,p.ry,'donna');                      // Tetrico e Zenobia, a piedi davanti al carro (Eutropio); le vesti non sono dette (lana non tinta)
  p=pc; B.dentro(p.x,p.y,p.z,p.ry,function(B){ B.scatola(.16,.09,.2,0,.07,0,C.oro).scatola(.02,.1,.1,.09,0,0,C.oro).scatola(.02,.1,.1,-.09,0,0,C.oro);
    voce(B,0,.07,-.02,function(Q){ seduto(Q,0,.07,-.02,0,C.porpora); },function(Q){ Q.scatola(.05,.1,.04,0,.16,-.02,C.porpora).scatola(.03,.035,.03,0,.26,-.02,C.pelle); }); });      // Aureliano sul carro
  for(i=0;i<4;i++){ p=via(.648+.002*(i>>1),((i&1)-.5)*.07); cavaliere(B,p.x,p.z,p.y,p.ry,C.bianco,C.bianco,true); }      // i cavalli del carro
  },0);
  vicine(B,'274',[pe.x,pe.z],function(){      // i soldati dietro il carro, quattro per fila: persone a partire dal centro della colonna
  for(i=0;i<440;i++){ p=via(.33+(i>>2)/110*.29,((i&3)-1.5)*.13); uomo(B,p.x,p.z,p.y,[LG.bruno,LG.grigioS||LG.grigio,LG.grigio][i%3],SCUDO,p.ry); }      // i toni più scuri della lana non tinta: sul selciato chiaro della via Sacra la colonna si legge anche dalla vista della regia
  },1);
  for(i=0;i<120;i++) rnd();      // i numeri a caso dei cavalieri corazzati tolti: le scene che seguono restano uguali
  vicine(B,'274',[pc.x,pc.z],function(){      // la folla ai lati
  for(i=0;i<900;i++){ var lat=(rnd()<.5?-1:1)*(.85+rnd()*.6); p=via(rnd(),lat); var tinta=C.folla[(rnd()*C.folla.length)|0], giro=p.ry+(lat>0?-1:1)*Math.PI/2+(rnd()-.5); if(!sopraEdificio(p.x,p.z)) uomo(B,p.x,p.z,p.y,tinta,null,giro,'folla'); else contaP++; }      // contaP: come se la figura ci fosse, le vesti delle scene dopo non cambiano
  },2);
  var pT=via(.665,-.08), pZ=via(.665,.08);
  return {g:maglia(B), da:273.6, a:275, capi:{aureliano:[pc.x,pc.y+.07,pc.z], tetrico:[pT.x,pT.y,pT.z], zenobia:[pZ.x,pZ.y,pZ.z]}};
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
  GU.forEach(function(q){ var p=punto(q[0],q[1]), y=H(p[0],p[1]); uomo(gIn,p[0],p[1],y,ROSSO,C.ferro,VERSO_DENTRO+Math.PI,'romano');
    gGiu.dentro(p[0],y+.02,p[1],r4()*6.28,function(B){ B.scatola(.15,.035,.05,0,0,0,ROSSO).scatola(.035,.03,.03,.09,0,0,C.pelle).scatola(.06,.012,.06,-.03,0,.07,C.ferro); }); });      // a terra, con lo scudo accanto
  },0,true);
  vicine(gio,'410',G,function(){ for(i=0;i<9;i++){ var pg=punto(-.55-r4()*.7,(r4()-.5)*.7); uomo(gio,pg[0],pg[1],H(pg[0],pg[1]),C.tunica,null,VERSO_DENTRO+Math.PI+(r4()-.5)*.8); } },0,true);
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
  var cC=[G[0]+fuori[0]*17+5,G[1]+fuori[1]*17];
  return {seq:o, tutte:tutte, da:409.6, a:411, vista:VA, g:fisso, campo:[cC[0],H(cC[0],cC[1]),cC[1]]};
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
  },0);
  var pz=[cx+2.6,cz+1.4], prig=[[0,0,C.porpora],[.12,.06,C.bianco],[-.12,.06,C.bianco]];      // Eudossia e le figlie, fra quattro guardie (l'imperatrice in porpora)
  vicine(B,'455',pz,function(){ prig.forEach(function(q){ var xx=pz[0]+q[0], zz=pz[1]+q[1]; uomo(B,xx,zz,H(xx,zz),q[2],null,2.4,'donna'); }); },-1,true);      // le prigioniere prima di tutto, anche in «bassa»
  vicine(B,'455',[cx,cz],function(){
  [[-.3,-.2],[.3,-.2],[-.3,.35],[.3,.35]].forEach(function(q){ var xx=pz[0]+q[0], zz=pz[1]+q[1]; uomo(B,xx,zz,H(xx,zz),VAND,C.cavalloB,2.4); B.scatola(.01,.28,.01,xx+.03,H(xx,zz),zz,P.tronco); });
  },0);
  var g=maglia(B);
  var stretto=window.innerWidth<700, VP=stretto?mira(cx+1.2,cz+2.7,[cx+14.2,H(cx,cz)+8,cz-10.3]):mira(cx+3.2,cz+3.4,[cx+16.2,H(cx,cz)+8,cz-9.6]), VG=mira(-29,0,[-13,22,-15]);      // più larghe (24 novembre 2026): il palazzo intero, il tempio intero; VP spostata il 25 novembre di 4 unità perché Eudossia e le figlie non finiscano sotto la didascalia
  var o=sequenza({fine:16, attesa:1.8, disegna:function(){}, visibile:function(){ return g.visible; },
    righe:[[0,'1 · Il palazzo imperiale spogliato'],[4.5,'2 · Il tetto di Giove Capitolino'],[10,'3 · Il bottino scende alle navi']],
    azioni:[[4.5,function(){ var v=inquadra(VG); RM.volaA(v.t,v.c,2.4); }],[10,function(){ var v=inquadra(vandali455.vista); RM.volaA(v.t,v.c,2.6); }]]});
  return {g:g, da:454.6, a:456, seq:o, vista:VP, eudossia:[pz[0],H(pz[0],pz[1]),pz[1]]};
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
  },0,true);
  vicine(B,'852',PP,function(){
  for(i=0;i<300;i++){ var t=r2(), q=via(t,(r2()<.5?-1:1)*(1.2+r2()*1.6)); if(RM.distFiume(q.x,q.z)<6.3) continue; uomo(B,q.x,q.z,q.y,C.folla[(r2()*C.folla.length)|0],null,q.ry+(r2()-.5)*2,'folla'); }      // il popolo sotto le mura
  },1);
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
  /* 25 novembre 2026: fra il Colosseo e le mura, un tempo sopra Santa Maria Nova (santamarianova in js/monumenti.js), che Leone IV costruisce fra le rovine del tempio di Venere e Roma
     (Platner e Ashby, «in its ruins»; Liber Pontificalis, vita di Benedetto III: «iuxta via Sacra»): nell'ordine degli anni (847 il terremoto, dall'848 la chiesa e le mura) e dei luoghi
     (la chiesa sta a trecento metri dal Colosseo). Vista da sud-ovest, a una quarantina di unità: la chiesa sul podio del tempio, il Colosseo dietro. */
  var SUD0=.2, SUD1=.5, TC=.6, SMN=5.6, BORGO=10, MURA0=12, MURA1=20, PROC=20.4;
  var smn=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='santamarianova'; })[0]||{x:30.41,z:15.17}, ySmn=H(smn.x,smn.z);
  var VS=mira(smn.x,smn.z,[smn.x-22,ySmn+24,smn.z+22]);
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
  var o=sequenza({fine:25.4, attesa:1.8, disegna:disegna, visibile:function(){ return leone852.g.visible||t852; },
    righe:[[0,'1 · 847: il terremoto, e il Colosseo (un’ipotesi)'],[SMN,'2 · Santa Maria Nova fra le rovine del tempio'],[BORGO,'3 · 848-852: si costruiscono le mura leonine'],[PROC,'4 · 27 giugno 852: il clero percorre le mura in processione']],
    azioni:[[TC,function(){ scuoti(0,3,.22); }],[SMN,function(){ var v=inquadra(VS); RM.volaA(v.t,v.c,2.2); }],[BORGO,function(){ var v=inquadra(VB); RM.volaA(v.t,v.c,2.4); }],[PROC,function(){ var v=inquadra(VISTE.leonina852); RM.volaA(v.t,v.c,2.4); }]]});
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
/* La quota su cui posa una figura sopra gradini e podi di un monumento: la si legge dalla sua geometria, con un raggio che scende da poco sopra il suolo (alto, in unità:
   sotto i tetti dei portici) e trova il primo piano che incontra. Senza il monumento, H. */
var RAGGIO=new THREE.Raycaster(), GIU=new THREE.Vector3(0,-1,0);
function quotaSu(id,x,z,alto){
  var o=(RM.MONUMENTI||[]).filter(function(m){ return m.id===id; })[0], y0=H(x,z); if(!o||!o.g) return y0;
  o.g.updateMatrixWorld(true); RAGGIO.set(new THREE.Vector3(x,y0+(alto||.6),z),GIU); RAGGIO.far=(alto||.6)+1;
  var h=RAGGIO.intersectObject(o.g,true)[0]; return h?Math.max(y0,h.point.y):y0;
}
/* ---------- 800, secondo tempo: il 25 dicembre dentro San Pietro (25 novembre 2026, approvato dall'utente: la scena in due tempi, con le date) ----------
   Fonti lette il 25 novembre 2026 (src/testi/scene-roma-fonti.md, sezione 12):
   - Annali del regno dei Franchi, anno 801 (The Latin Library): «Ipsa die sacratissima natalis Domini, cum rex ad missam ante confessionem beati Petri apostoli ab oratione surgeret,
     Leo papa coronam capiti eius imposuit, et a cuncto Romanorum populo adclamatum est: Carolo augusto, a Deo coronato magno et pacifico imperatori Romanorum, vita et victoria!
     Et post laudes ab apostolico more antiquorum principum adoratus est».
   - Liber Pontificalis, vita di Leone III, XXIII-XXIV (Duchesne II p. 7, archive.org): il papa «manibus suis propriis pretiosissima corona coronavit eum»; i Romani gridano
     «unanimiter altisona voce»; «ante sacram confessionem beati Petri apostoli … ter dictum est»; «Ilico … unxit oleo sancto Karolo, excellentissimo filio eius, rege».
   - Eginardo, Vita Karoli 28 (The Latin Library): Carlo disse che quel giorno non sarebbe entrato in chiesa «si pontificis consilium praescire potuisset» (nella didascalia, non nella scena).
   Dopo la cerimonia nessuna fonte letta lo fa uscire sui gradini con la corona: la scena finisce dentro, e il tetto torna (l'utente: «se non è previsto che lui esca, lascia perdere»).
   La basilica (it.wikipedia, «Antica basilica di San Pietro in Vaticano», da Krautheimer e altri; en.wikipedia, «Old St. Peter's Basilica»): cinque navate, quattro file di colonne
   (22 per fila per la voce italiana, 21 per quella inglese: qui 22), il corpo di 87 x 64 m, il transetto alto come la navata, l'arco trionfale sull'asse, l'abside a ovest,
   la memoria di Pietro alla corda dell'abside, chiusa da una pergula di colonne tortili; undici finestre per lato nella navata (en.wikipedia). Le misure sono quelle del guscio
   (sanPietro in js/monumenti.js).
   Schema, detto nella didascalia e nella scheda: le altezze, il piano rialzato e l'altare, le sei colonne della pergula (lisce, non tortili), dove stanno tutti, i colori, il numero delle persone,
   il gesto dell'omaggio del papa (gli Annali non lo descrivono: qui il papa si inginocchia), la corona (forma ignota: un cerchio d'oro semplice, un poco più grande del vero perché si legga).
   Lo spaccato: i tetti e i muri della basilica si dissolvono dall'alto (due piani di taglio sul materiale di San Pietro e delle sue tegole: sopra una quota che scende, e solo a ovest della
   facciata), e resta l'interno, fatto qui, con i muri tagliati più bassi dal lato da cui si guarda (sud), come nei disegni in sezione. Si accende solo in quel momento. */
/* ---------- 800: i protagonisti da vicino (25 novembre 2026, l'utente: «Rendi spettacolare la scena di Carlo che viene incoronato») ----------
   Carlo, Leone III e il figlio Carlo hanno una figura loro, più fine delle persone della folla, con le giunture (busto, capo, spalle, gomiti) che si muovono: Carlo che si alza
   dalla preghiera, il papa che alza la corona e la posa, l'omaggio, l'unzione. Misure in metri (piedi a terra, sguardo verso +z), poi scalate a 1 unità = 10 m.
   Fonti lette il 25 novembre 2026 (src/testi/scene-roma-fonti.md, sezione 13):
   - Eginardo, Vita Karoli 22: «statura eminenti» (sette dei suoi piedi), «apice capitis rotundo, oculis praegrandibus ac vegetis, naso paululum mediocritatem excedenti,
     canitie pulchra», «cervix obesa et brevior venterque proiectior»: qui più alto degli altri, capelli bianchi, occhi grandi, naso un poco lungo, collo corto e grosso, il ventre.
     Della barba Eginardo non dice nulla: qui non c'è.
   - Eginardo 23: a Roma due volte, su richiesta di Adriano e poi di Leone, «longa tunica et clamide amictus, calceis quoque Romano more formatis»; nelle feste «veste auro texta
     … et fibula aurea sagum adstringente». Quale giorno vestisse alla romana non è detto: la scena gli dà la tunica lunga e la clamide (fermata sulla spalla destra), con l'orlo
     d'oro e la fibbia d'oro delle feste. I colori sono nostri; il mantello blu del suo abito comune («sago veneto») non c'entra.
   - Il papa: veste bianca lunga e, sopra, una veste ampia nel colore che la scena gli dava già (forma e colore schema); il pallio come lo descrive en.wikipedia, «Pallium»
     (letto il 25 novembre 2026): una fascia di lana bianca sulle spalle con i capi che nell'VIII secolo scendono in mezzo al petto e alla schiena, con croci scure vicino ai capi.
   - Il figlio Carlo: nessuna fonte letta lo descrive; tunica corta e mantello, alla franca (Eginardo 23 per l'abito dei Franchi), colori nostri.
   - La corona: «pretiosissima corona» (Liber Pontificalis); la forma non è detta. Qui un cerchio d'oro con pietre: schema.
   Le pose (in ginocchio a pregare, il papa in ginocchio per l'omaggio, il figlio in piedi) sono schema, dette nella didascalia. */
var SPENTI800={};      // gli interruttori della prova della scena (js/prova-scena.js: &appoggio=0, &lumi=0)
RM.interruttori800=function(k){ SPENTI800[k]=true; if(k==='appoggio') matAppoggio().visible=false; };
var LUMI800={uLumeV:{value:[new THREE.Vector3(),new THREE.Vector3()]}, uLumeC:{value:[new THREE.Color(0,0,0),new THREE.Color(0,0,0)]}, uLumeK:{value:[1,1]}, uPen:{value:1}, uMod:{value:new THREE.Vector4(.25,.85,1.5,.55)}, col:[1.9,1.4,.8,1.7,1.25,.7]};      // 27 novembre 2026: lumi meno arancioni (prima 2,1/1,25/0,52: pelle, oro e vesti finivano tutti dello stesso arancio)      // uMod (27 novembre 2026): la luce diffusa da sotto e da sopra, il riempimento freddo, il bordo caldo (si veda conLumi)      // uPen: la penombra dell'interno (1 fuori dalla scena: nessun effetto)      // due lumi caldi, in coordinate della camera: il faro sopra il presbiterio e le candele della confessione
function conLumi(sh){      // aggiunge ai materiali di persone e protagonisti la luce dei due lumi (senza luci vere: cambierebbero tutti i materiali della città)
  sh.uniforms.uLumeV=LUMI800.uLumeV; sh.uniforms.uLumeC=LUMI800.uLumeC; sh.uniforms.uLumeK=LUMI800.uLumeK; sh.uniforms.uPen=LUMI800.uPen; sh.uniforms.uMod800=LUMI800.uMod;
  var A=String.fromCharCode(10);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'uniform vec3 uLumeV[2]; uniform vec3 uLumeC[2]; uniform float uLumeK[2]; uniform float uPen; uniform vec4 uMod800;')
    .replace('#include <lights_fragment_end>',['#include <lights_fragment_end>',
      'if(uPen<0.999){ vec3 q0=uLumeV[0]+vViewPosition, q1=uLumeV[1]+vViewPosition; float pl=max(exp(-dot(q1,q1)/4.5),0.75*exp(-dot(q0,q0)/3.2)); float pn=mix(uPen,0.72,pl);',      // la penombra: piena luce solo vicino ai lumi
      '  reflectedLight.directDiffuse*=pn; reflectedLight.indirectDiffuse*=pn; reflectedLight.directSpecular*=pn;',
      '  float cal=clamp((1.0-uPen)/0.7,0.0,1.0); vec3 Uv=normalize((viewMatrix*vec4(0.0,1.0,0.0,0.0)).xyz); float su=dot(normal,Uv);',
      '  reflectedLight.indirectDiffuse*=mix(1.0,mix(uMod800.x,uMod800.y,smoothstep(-0.85,0.9,su)),cal);',      // la luce diffusa ha un verso: dall'alto più che da sotto (sotto il mento, fra le pieghe e sotto le braccia l'ombra morbida; mai nero)
      '  vec3 Fv=normalize((viewMatrix*vec4(0.45,0.75,0.35,0.0)).xyz); reflectedLight.directDiffuse+=diffuseColor.rgb*vec3(0.11,0.14,0.2)*max(dot(normal,Fv),0.0)*uMod800.z*cal;',      // il riempimento freddo dalle finestre alte
      '  float fr=pow(1.0-max(dot(normal,normalize(vViewPosition)),0.0),3.0); reflectedLight.directDiffuse+=diffuseColor.rgb*vec3(0.42,0.3,0.16)*fr*smoothstep(-0.4,0.5,su)*uMod800.w*cal;',      // il bordo delle figure che prende il caldo dei lumi (si staccano dalla navata)
      '  if(metalnessFactor>0.3){ vec3 Rv=reflect(-normalize(vViewPosition),normal); float ru=dot(Rv,Uv); vec3 env=mix(vec3(0.06,0.04,0.02),vec3(1.1,0.78,0.4),smoothstep(-0.35,0.75,ru))+vec3(1.6,1.1,0.55)*pow(max(dot(Rv,normalize(uLumeV[0])),0.0),24.0);',
      '    reflectedLight.indirectSpecular+=material.specularColor*env*0.8*cal; } }',      // l'oro e l'argento riflettono la basilica accesa: il buio sotto, i lumi e l'abside d'oro sopra (un ambiente finto, senza luci vere)
      'for(int i=0;i<2;i++){ vec3 Lv=uLumeV[i]+vViewPosition; float d=length(Lv); vec3 L=Lv/max(d,1e-4); float at=1.0/(1.0+d*d*uLumeK[i]);',
      '  reflectedLight.directDiffuse+=diffuseColor.rgb*uLumeC[i]*(max(dot(normal,L),0.0)*0.88+0.12)*at;',
      '  float sp=pow(max(dot(reflect(-L,normal),normalize(vViewPosition)),0.0),mix(70.0,6.0,roughnessFactor))*(1.0-roughnessFactor);',
      '  reflectedLight.directSpecular+=uLumeC[i]*sp*at*1.6; }'].join(A));
}
var MAT800={};
function matR(k){
  if(MAT800[k]) return MAT800[k];
  var m=k==='oro'?new THREE.MeshStandardMaterial({vertexColors:true,metalness:.55,roughness:.3,emissive:0x3a2608}):k==='argento'?new THREE.MeshStandardMaterial({color:0xc9cdd2,metalness:.7,roughness:.22,emissive:0x1d1a14}):
    new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93,metalness:0,side:THREE.DoubleSide});      // opaco: stoffa e pelle dipinte, non plastica
  m.onBeforeCompile=conLumi; return (MAT800[k]=m);
}
function fondi(lista){      // [{g, col}] → una geometria sola, non indicizzata, col colore nei vertici (quello della geometria, se ne ha uno: stoffe e pelle dei protagonisti)
  var P=[], N=[], Cc=[];
  lista.forEach(function(q){ var g=q.g.index?q.g.toNonIndexed():q.g, p=g.attributes.position.array, n=g.attributes.normal.array, c=g.attributes.color?g.attributes.color.array:null;
    for(var i=0;i<p.length;i+=3){ P.push(p[i],p[i+1],p[i+2]); N.push(n[i],n[i+1],n[i+2]); if(c) Cc.push(c[i],c[i+1],c[i+2]); else Cc.push(q.col.r,q.col.g,q.col.b); } });
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); return g;
}
/* Stoffe e pelle dei protagonisti (25 novembre 2026, sera; l'utente, sui primi piani: «Le figure non sembrano ancora dei lego?»). Prima erano coni, cilindri e palle con le
   giunture a vista; ora ogni parte è una superficie liscia, e le pieghe e le ombre sono nella superficie stessa e nei colori dei suoi vertici, come in una statuina dipinta
   (mai pezzi aggiunti sopra: il contorno scuro degli effetti li farebbe sembrare incollati).
   telo(o) tende una superficie su anelli orizzontali: o.prof [[y, raggio di lato, raggio in profondità, spostamento in z]] dall'alto in basso; o.lati; o.sudd (anelli in più fra due);
   o.a0 e o.a1 (numeri, o funzioni della quota) l'arco coperto, se la stoffa è aperta: 0 è il davanti, π/2 il fianco sinistro (+x); o.orlo(φ) di quanto sale l'orlo in quel punto,
   con effetto crescente verso il basso (l'orlo in diagonale di un mantello); o.segue: i raggi si leggono alla quota spostata (i capelli, che seguono il cranio);
   o.pieghe [[quante, ampiezza, fase]] le pieghe verticali, che si aprono verso l'orlo (o.da: da che punto della fila cominciano, fra 0 e 1); o.sp(φ,y,t) un rilievo
   (moltiplica il raggio: zigomi, mento, ventre); o.tinta(φ,yProfilo,t,y) un colore diverso in quel punto (orli d'oro, labbra) o null; o.ombra(φ,y,t) quanto scurire.
   Il fondo delle pieghe e il basso della veste (o.basso) sono più scuri: un'ombra «cotta» nei colori, non una luce. */
function profilo(pr){ return pr.map(function(q){ return [q[0],q[1],q[2]==null?q[1]:q[2],q[3]||0]; }); }
function aQuota(pr,y){      // il profilo [[y, rx, rz, dz]] (dall'alto in basso) alla quota y, per interpolazione lineare
  var n=pr.length-1, i; if(y>=pr[0][0]) return pr[0].slice(1); if(y<=pr[n][0]) return pr[n].slice(1);
  for(i=0;i<n;i++) if(y<=pr[i][0] && y>=pr[i+1][0]){ var a=pr[i], b=pr[i+1], u=(a[0]-y)/((a[0]-b[0])||1); return [a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u]; }
  return pr[n].slice(1); }
/* La trama del volto dei protagonisti (25 novembre 2026; l'utente, sui primi piani dell'iPhone: volti «senza lineamenti»). I volumi (orbite, naso, zigomi, mento) restano nella
   superficie; i particolari troppo piccoli per i vertici (la palpebra, l'occhio con l'iride, le sopracciglia, la linea della bocca) sono dipinti su una trama di 512 pixel,
   tesa sul capo dal davanti alla nuca (uv di telo). Lo shader mescola il colore della trama sopra quello della pelle secondo la sua opacità: dove la trama è vuota resta la pelle.
   Nessuna fonte letta dice il colore degli occhi: qui scuri, senza colore. Le misure sono quelle del capo (profilo PT di ritratto, in metri: occhi a 11 cm sopra il mento). */
var TRAME_VOLTO={};
function tramaVolto(chi,occ,ciglio,labbro){
  var k=chi+'|'+occ; if(TRAME_VOLTO[k]) return TRAME_VOLTO[k];
  var N=512, YA=.215, YB=-.02, c=document.createElement('canvas'); c.width=c.height=N; var g=c.getContext('2d');
  function X(f){ return N*(.5+f/(2*Math.PI)); } function Y(y){ return N*(YA-y)/(YA-YB); }
  function rgba(q,a){ var s=q.clone().convertLinearToSRGB(); return 'rgba('+Math.round(s.r*255)+','+Math.round(s.g*255)+','+Math.round(s.b*255)+','+a+')'; }
  function ell(cx,cy,rx,ry,col,blur){ g.save(); g.filter=blur?'blur('+blur+'px)':'none'; g.fillStyle=col; g.beginPath(); g.ellipse(cx,cy,rx,ry,0,0,2*Math.PI); g.fill(); g.restore(); }
  [-1,1].forEach(function(s){
    var fe=s*.42*occ, ex=X(fe), ey=Y(.1115), rx=14*occ, ry=8.5*occ;
    ell(ex,ey-2,rx*1.7,ry*2.4,'rgba(60,36,26,.30)',7);                                                   // l'orbita in ombra, morbida
    g.save(); g.beginPath(); g.ellipse(ex,ey,rx,ry,0,0,2*Math.PI); g.clip();
    g.fillStyle='rgba(222,210,192,.92)'; g.fillRect(ex-rx,ey-ry,rx*2,ry*2);                              // il bianco dell'occhio
    ell(ex+s*1.5,ey+.5,rx*.42,ry*1.05,'rgba(58,40,30,.97)');                                              // l'iride, scura
    ell(ex+s*1.5,ey+.5,rx*.17,ry*.45,'rgba(15,10,8,1)');                                                  // la pupilla
    ell(ex,ey-ry*1.1,rx*1.3,ry*.75,'rgba(70,45,35,.55)',1.5);                                             // l'ombra della palpebra sull'occhio
    g.restore();
    g.save(); g.lineCap='round'; g.strokeStyle='rgba(38,24,18,.85)'; g.lineWidth=3; g.beginPath(); g.ellipse(ex,ey+1,rx*1.02,ry*1.05,0,Math.PI*1.08,Math.PI*1.92); g.stroke();      // la palpebra superiore, con le ciglia
    g.strokeStyle='rgba(70,45,35,.35)'; g.lineWidth=2; g.beginPath(); g.ellipse(ex,ey-3,rx*1.15,ry*1.6,0,Math.PI*1.15,Math.PI*1.85); g.stroke();      // la piega sopra
    g.strokeStyle='rgba(80,52,40,.35)'; g.lineWidth=1.5; g.beginPath(); g.ellipse(ex,ey-1,rx*.98,ry*1.02,0,Math.PI*.15,Math.PI*.85); g.stroke();      // la palpebra inferiore, appena
    g.strokeStyle=rgba(ciglio,.85); g.lineWidth=7; g.beginPath(); g.moveTo(X(s*.2),Y(.1305)); g.quadraticCurveTo(X(s*.42*occ),Y(.137),X(s*.68),Y(.128)); g.stroke();      // il sopracciglio
    g.restore(); });
  var my=Y(.0505);
  ell(X(0),my-4,X(.27)-X(0),5,rgba(labbro,.45),1.5); ell(X(0),my+6,X(.22)-X(0),6.5,rgba(labbro,.5),1.5);      // le labbra
  g.save(); g.lineCap='round'; g.strokeStyle='rgba(70,32,28,.75)'; g.lineWidth=2.5; g.beginPath(); g.moveTo(X(-.27),my+1); g.quadraticCurveTo(X(0),my-1,X(.27),my+1); g.stroke(); g.restore();      // la linea della bocca
  ell(X(0),Y(.072),X(.06)-X(0),4,'rgba(70,40,30,.22)',2);                                                    // l'ombra sotto il naso
  var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return (TRAME_VOLTO[k]=t);
}
var MAT_VOLTO={};
function matVolto(tex){
  var k=tex.uuid; if(MAT_VOLTO[k]) return MAT_VOLTO[k];
  var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:0,map:tex}), A=String.fromCharCode(10);      // 27 novembre 2026: appena lucida (prima .85: la pelle opaca come il legno dipinto)
  m.onBeforeCompile=function(sh){ sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','vec4 tV=mapTexelToLinear(texture2D(map,vUv)); diffuseColor.rgb=mix(diffuseColor.rgb,tV.rgb,tV.a);'); conLumi(sh); };
  return (MAT_VOLTO[k]=m); }
var RIT_DET=1;      // dettaglio delle figure dei protagonisti (ritratto): 1 pieno, meno di 1 la versione leggera per le inquadrature larghe (ritrattoDoppio)
function telo(o){
  var L0=o.lati||24, pr=profilo(o.prof), n=RIT_DET<1?Math.max(Math.min(L0,6),Math.round(L0*RIT_DET)):L0, sd=RIT_DET<1?Math.max(1,Math.round((o.sudd||3)*RIT_DET)):(o.sudd||3), aperto=o.a0!=null, W=aperto?n+1:n, file=[], i, j, k;
  function cr(a,b,c,d,u){ return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u); }
  for(i=0;i<pr.length-1;i++) for(k=0;k<sd;k++){ var u=k/sd, A=pr[Math.max(0,i-1)], B=pr[i], C=pr[i+1], D=pr[Math.min(pr.length-1,i+2)], r=[];
    for(j=0;j<4;j++) r.push(cr(A[j],B[j],C[j],D[j],u)); r[1]=Math.max(0,r[1]); r[2]=Math.max(0,r[2]); file.push(r); }
  file.push(pr[pr.length-1].slice());
  var m=file.length, yA=file[0][0], yB=file[m-1][0], pos=[], col=[], uv=[], idx=[], pk=o.pieghe||[], somma=0, c0=o.col, da=o.da||0;
  pk.forEach(function(q){ somma+=q[1]; });
  function val(v,y){ return typeof v==='function'?v(y):v; }
  for(i=0;i<m;i++){ var f=file[i], t=Math.max(0,Math.min(1,(yA-f[0])/((yA-yB)||1))), a0=aperto?val(o.a0,f[0]):0, a1=aperto?val(o.a1,f[0]):Math.PI*2, cre=Math.pow(Math.max(0,(t-da)/(1-da)),.85);
    for(j=0;j<W;j++){ var fi=a0+(a1-a0)*j/n, pv=0;
      for(k=0;k<pk.length;k++) pv+=pk[k][1]*Math.sin(pk[k][0]*fi+pk[k][2]+.6*Math.sin(2.3*fi+1.7*pk[k][2]));      // pieghe un poco irregolari
      var pq=somma?pv/somma:0, y=f[0]+(o.orlo?o.orlo(fi)*Math.pow(t,1.3):0)+(o.onda?o.onda*(1-pq)*.5*Math.pow(t,6):0), rr=o.segue?aQuota(pr,y):[f[1],f[2],f[3]], gg=(1+pv*cre)*(o.sp?o.sp(fi,y,t):1);      // o.onda: l'orlo sale nei fondi delle pieghe e resta giù sulle creste, solo vicino all'orlo (non più un anello)
      pos.push(Math.sin(fi)*rr[0]*gg,y,Math.cos(fi)*rr[1]*gg+rr[2]); uv.push((fi+Math.PI)/(2*Math.PI),1-t);      // uv: il davanti a metà, la cima in alto (la trama del volto)
      var c=(o.tinta&&o.tinta(fi,f[0],t,y))||c0, lu=(1+(pq>0?.24:.8)*pq*cre)*(1-.14*t*(o.basso==null?1:o.basso))*(o.ombra?o.ombra(fi,y,t):1);      // il fondo delle pieghe più scuro di quanto la cresta è chiara (27 novembre 2026: prima simmetrico, e le pieghe si leggevano appena)
      col.push(c.r*lu,c.g*lu,c.b*lu); } }
  for(i=0;i<m-1;i++) for(j=0;j<n;j++){ var a=i*W+j, b=i*W+(aperto?j+1:(j+1)%n); idx.push(a,a+W,b,b,a+W,b+W); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* la pelle liscia del Colosso (RM.pelle, js/monumenti.js) come geometria, col colore nei vertici: braccia nelle maniche, mani, naso, piedi. tinta(x,y,z): un colore diverso in quel punto, o null */
function pelleG(anelli,lati,opz,col,tinta){
  if(RIT_DET<1){ lati=Math.max(5,Math.round(lati*RIT_DET)); opz=Object.assign({},opz||{},{sudd:1}); }
  var B={geo:function(q){ this.q=q; return this; }}; RM.pelle(B,anelli,col,lati,opz||{});
  var g=B.q, p=g.attributes.position, c=g.attributes.color, a=new Float32Array(p.count*3), s0=col.r+col.g+col.b||1, i;
  for(i=0;i<p.count;i++){ var t=tinta&&tinta(p.getX(i),p.getY(i),p.getZ(i)), q=t||col, lu=c?(c.getX(i)+c.getY(i)+c.getZ(i))/s0:1; a[i*3]=q.r*lu; a[i*3+1]=q.g*lu; a[i*3+2]=q.b*lu; }
  g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g;
}
function palla3(r,x,y,z,sx,sy,sz,w,h){ w=w||16; h=h||12; if(RIT_DET<1){ w=Math.max(6,Math.round(w*RIT_DET)); h=Math.max(4,Math.round(h*RIT_DET)); } return new THREE.SphereGeometry(r,w,h).scale(sx||1,sy||1,sz||1).translate(x,y,z); }
function anello(r,t,y,sx,sz){ return new THREE.TorusGeometry(r,t,6,36).rotateX(Math.PI/2).scale(sx||1,1,sz||1).translate(0,y,0); }
/* o: {chi:'carlo'|'papa'|'figlio', statura, pelle, capelli}. Restituisce {g (la figura), posa(p)}: p.k in ginocchio (0-1), p.chino (capo), p.busto (inclinazione),
   p.mani:{d:Vector3|null, s:Vector3|null} (dove vanno le mani, nel mondo; null: a riposo), p.guarda (punto del mondo che il capo guarda, o null) */
function ritratto(o){
  var R=new THREE.Group(), WA=1.0, CADE=.45, chi=o.chi, pel=o.pelle||RM.col(0xb39484),      /* 27 novembre 2026: pelle meno arancione (prima 0xad8a72) */ cap=o.capelli||RM.col(0x5a4636), PI=Math.PI;
  var veste, sopra, scarpe=RM.col(0x4a3022), oroC=RM.col(0xd2a84c), oroT=RM.col(0xb48e40), bianco=RM.col(0xf0ece2), nero=RM.col(0x2a2420);
  if(chi==='carlo'){ veste=RM.col(0x9e7e40); sopra=RM.col(0x6a2428); }          // tunica lunga color oro scuro («veste auro texta») e clamide rosso scuro: colori nostri (Eginardo non li dice); opachi, come una statuina dipinta
  else if(chi==='papa'){ veste=RM.col(0xe6e0d2); sopra=RM.col(0xa9874a); }
  else { veste=RM.col(0x86684a); sopra=RM.col(0x4e5a3c); }
  function pz(){ return {st:[], oro:[], volto:[]}; }
  function nodo(padre,q,x,y,z){ var g=new THREE.Group(); g.position.set(x||0,y||0,z||0);
    q.volto.forEach(function(v){ var m=new THREE.Mesh(v.g,matVolto(v.tex)); m.receiveShadow=true; g.add(m); });      // il volto con la sua trama (occhi, sopracciglia, labbra)
    ['st','oro'].forEach(function(k){ if(!q[k].length) return; var m=new THREE.Mesh(fondi(q[k]),matR(k)); m.castShadow=true; m.receiveShadow=true; g.add(m); }); padre.add(g); return g; }
  function gau(a,s){ return Math.exp(-a*a/(s*s)); }
  function mix(a,b,k){ return a.clone().lerp(b,Math.max(0,Math.min(1,k))); }
  /* Le proporzioni (25 novembre 2026, sera): circa sette teste e mezza, spalle spioventi, collo, braccia affusolate dentro le maniche. Le misure sono di un uomo di 1,78 m
     (poi la statura di ognuno); i tagli delle vesti sono schema, come i colori.
     La veste sotto la vita: tunica lunga fino ai piedi (Carlo, il papa) o fino al ginocchio (il figlio), con le pieghe che si aprono verso l'orlo; si accorcia quando si inginocchia (scala in altezza) */
  var qG=pz(), lunga=chi!=='figlio';
  var PG=lunga?[[WA+.03,.15,.103,.004],[.92,.168,.118,.006],[.8,.183,.132,.01],[.6,.198,.148,.012],[.4,.212,.16,.012],[.25,.224,.169,.011],[.15,.232,.175,.01],[.1,.236,.178,.01],[.07,.239,.18,.01],[.045,.242,.182,.011],[.02,.245,.185,.012],[0,.247,.187,.012]]
              :[[WA+.03,.15,.103,.004],[.92,.168,.118,.006],[.8,.185,.135,.01],[.66,.203,.149,.012],[.56,.213,.156,.012],[.5,.218,.16,.012]];
  qG.st.push({g:telo({prof:PG, lati:60, sudd:2, col:veste, pieghe:[[9,.08,0],[14,.03,1.3],[5,.045,2.1]], onda:.035, orlo:function(f){ return .01*Math.sin(3*f+1); },      // 27 novembre 2026: pieghe profonde il doppio, che si aprono verso l'orlo, e l'orlo che segue le pieghe
    tinta:chi==='carlo'?function(f,y){ return (y<.075&&y>.035)||(y<.13&&y>.1)?oroT:null; }:chi==='figlio'?function(f,y){ return y>WA-.01?RM.col(0x3a2a1c):null; }:
      function(f){ var a=Math.abs(f); return Math.min(Math.abs(a-.42),Math.abs(a-(PI-.42)))<.045?RM.col(0x8e2a24):null; }})});      // il papa: la dalmatica bianca coi clavi rossi, davanti e dietro (mosaici del IX secolo: vita-roma-fonti.md, «Per chi disegna»)      // per Carlo l'orlo d'oro a due fasce («veste auro texta»); per il figlio la cintura
  if(chi==='figlio') [-1,1].forEach(function(s){ var cx=s*.083;      // le gambe fasciate (Eginardo 23, «fasciolis crura»): le fasce girano a spirale
    qG.st.push({g:pelleG([[s*.08,.62,0,.058],[s*.08,.5,-.006,.058,.062],[s*.082,.4,-.012,.05,.058],[s*.083,.3,-.012,.044,.05],[s*.084,.17,-.004,.036,.038],[s*.085,.09,0,.031,.034],[s*.085,.06,0,.03]],12,{sudd:4},RM.col(0x5e4a38),
      function(x,y,z){ var k=(y*22+Math.atan2(x-cx,z)/6.283+10)%1; return k<.2?RM.col(0x463626):null; })}); });
  var gonna=nodo(R,qG);
  var qP=pz(); [-1,1].forEach(function(s){ qP.st.push({g:pelleG([[s*.085,.035,-.075,.032,.032],[s*.087,.045,-.02,.042,.045],[s*.09,.038,.07,.046,.036],[s*.092,.028,.15,.04,.026],[s*.093,.018,.19,.026,.016],[s*.093,.014,.2,.01,.008]],10,{sudd:2},scarpe)}); });      // le scarpe («calceis Romano more formatis» per Carlo, Eginardo 23; la forma è schema)
  var piedi=nodo(R,qP);
  /* (25 novembre 2026, l'utente: nell'omaggio «la tunica bianca esce di lato come un blocco orizzontale») prima la veste sopra le gambe piegate era larga 41 cm e alta 18 come una
     cassa; ora segue due tibie sotto la stoffa, larga 30 cm alle ginocchia e 20 alle caviglie, più bassa, con le pieghe che scendono sul pavimento e la parte sotto più scura */
  var qK=pz(); qK.st.push({g:pelleG([[0,.085,.0,.15,.08],[0,.078,-.1,.152,.072],[0,.066,-.24,.14,.058],[0,.054,-.36,.12,.046],[0,.046,-.44,.1,.036],[0,.043,-.48,.07,.025],[0,.042,-.495,.03,.012]],24,{sudd:3},veste,
    function(x,y,z){ var p=Math.sin(x*140+z*9); return y<.03?veste.clone().multiplyScalar(.72):(p>.6?veste.clone().multiplyScalar(.9):null); })});
  [-1,1].forEach(function(s){ qK.st.push({g:pelleG([[s*.075,.035,-.43,.03,.026],[s*.077,.04,-.49,.04,.032],[s*.078,.04,-.53,.036,.028],[s*.078,.038,-.55,.012,.01]],8,{sudd:2},scarpe)}); });
  var polp=nodo(R,qK);      // in ginocchio: la veste sopra le gambe piegate, e le suole dietro
  /* il busto, dalla vita in su: spalle spioventi, il petto, la vita; per Carlo il ventre («venter proiectior», Eginardo 22) */
  var qB=pz(), pancia=chi==='carlo';
  var PB=[[.535,.05,.048,.004],[.515,.07,.064,.002],[.49,.11,.08,0],[.46,.155,.095,-.004],[.42,.183,.104,-.006],[.37,.192,.112,-.004],[.3,.185,.118,.002],[.2,.172,.115,.006],[.1,.16,.108,.006],[0,.153,.104,.004],[-.045,.153,.104,.004]];
  if(chi!=='papa') qB.st.push({g:telo({prof:PB, lati:48, sudd:2, col:veste, pieghe:[[9,.03,.4],[5,.018,1.9]], da:.35, basso:-.4,      // 27 novembre 2026: la stoffa si raccoglie verso la vita in pieghe che si stringono (prima quasi liscia) e fa una piccola sacca sopra la vita
    sp:pancia?function(f,y){ return (1+.17*gau(y-.12,.1)*Math.pow(Math.max(0,Math.cos(f)),2))*(1+.035*gau(y-.035,.045)); }:function(f,y){ return 1+.035*gau(y-.035,.045); }, tinta:chi==='figlio'?function(f,y){ return y<.01?RM.col(0x3a2a1c):null; }:null})});
  qB.st.push({g:pelleG([[0,.44,0,.05],[0,.5,.004,(chi==='carlo'?.062:.054),(chi==='carlo'?.058:.05)],[0,.58,.008,(chi==='carlo'?.058:.05),(chi==='carlo'?.054:.046)],[0,.62,.01,.044]],14,{sudd:2},pel,
    function(x,y,z){ return y>.54?pel.clone().multiplyScalar(.86):null; })});      // il collo («cervix obesa et brevior» per Carlo), più scuro sotto il mento
  /* la clamide di Carlo e il mantello del figlio: fermati sulla spalla destra con una fibbia, coprono la spalla sinistra e la schiena e lasciano libero il braccio destro;
     davanti l'orlo scende in diagonale dalla fibbia al fianco sinistro, sotto sale verso destra. Il drappeggio è schema. */
  function clamide(fondo,alza){
    var PC=[[.505,.085,.078,-.004],[.47,.19,.118,-.008],[.43,.256,.136,-.01],[.38,.276,.154,-.012],[.28,.272,.166,-.012],[.12,.27,.172,-.014],[0,.268,.176,-.014],[-.2,.274,.186,-.016],[fondo,.288,.2,-.018]];
    var A0=[[.505,-.29],[.43,-.22],[.36,-.02],[.27,.22],[.16,.4],[.04,.5],[-.3,.56],[-1,.58]];
    function a0(y){ for(var i=0;i<A0.length-1;i++) if(y>=A0[i+1][0]) return PI*(A0[i][1]+(A0[i+1][1]-A0[i][1])*(A0[i][0]-y)/(A0[i][0]-A0[i+1][0])); return PI*A0[A0.length-1][1]; }
    return telo({prof:PC, lati:56, sudd:3, col:sopra, a0:a0, a1:PI*1.32, pieghe:[[7,.07,0],[11,.035,1.1],[4,.04,2.6]], da:.15, onda:.03, orlo:function(f){ return alza*RM.sfuma(PI*.5,PI*1.3,f); }});
  }
  if(chi==='carlo'){ qB.st.push({g:clamide(-.62,.27)}); qB.oro.push({g:palla3(.027,-.13,.468,.068,1,1,.5,12,8),col:oroC}); }      // la fibbia d'oro sulla spalla destra (Eginardo 23: «fibula aurea sagum adstringente», nelle feste)
  if(chi==='figlio'){ qB.st.push({g:clamide(-.42,.15)}); qB.st.push({g:palla3(.02,-.13,.468,.068,1,1,.5,10,6),col:RM.col(0x6a5a40)}); }
  /* il papa: sopra la veste bianca lunga una veste ampia a campana, che ricade dalle spalle e si solleva ai fianchi sulle braccia; sopra, il pallio (en.wikipedia, «Pallium»):
     la fascia bianca sulle spalle e i due capi in mezzo al petto e alla schiena, con le croci scure. La forma della veste ampia è schema (detto nella scheda) */
  if(chi==='papa'){
    var PP=[[.535,.06,.056,.004],[.51,.11,.084,.002],[.47,.212,.114,-.004],[.42,.266,.136,-.006],[.35,.262,.15,-.006],[.2,.268,.166,-.004],[0,.274,.18,0],[-.2,.284,.196,.004],[-.36,.292,.208,.006],[-.5,.3,.216,.008]];
    qB.st.push({g:telo({prof:PP, lati:64, sudd:3, col:sopra, pieghe:[[8,.06,.5],[13,.025,2],[3,.035,1]], da:.18, onda:.03, orlo:function(f){ var s=Math.abs(Math.sin(f)); return .26*Math.pow(s,1.6); }})});      // l'orlo sale sui fianchi, dove la veste si raccoglie sulle braccia (25 novembre 2026: più morbido; prima saliva di 34 cm e davanti e dietro restavano due teli a punta)
    var sopraP=function(y,k){ var q=aQuota(profilo(PP),y); return [y,q[0]*k+.003,q[1]*k+.003,q[2]]; };
    qB.st.push({g:telo({prof:[.512,.5,.488,.476,.464,.452,.435].map(function(y){ return sopraP(y,1.17); }), lati:48, sudd:1, col:bianco, basso:0})});      // il pallio sulle spalle (25 novembre 2026, sera: più largo e con più file; prima la «planeta», che fra una fila e l'altra si gonfia, lo bucava con un punto giallo sulla spalla)
    /* 27 novembre 2026: i capi pendono davanti e dietro fin sotto il ginocchio e le croci sono rosse, come il pallio dei papi nei mosaici del IX secolo (Santa Prassede, San Marco:
       src/testi/vita-roma-fonti.md, «Per chi disegna», papa e vescovo, VII-IX secolo); prima finivano sul petto con croci nere. Il disegno delle croci è schema */
    var rosso=RM.col(0x8e2a24), KP=function(y){ return 1.09+.08*RM.sfuma(.3,-.5,y); }, YC=[.3,-.42];
    [0,PI].forEach(function(c){ var rig=[.44,.36,.28,.2,.12,.04,-.06,-.18,-.3,-.42,-.53].map(function(y){ return sopraP(y,KP(y)); });
      qB.st.push({g:telo({prof:rig, lati:4, sudd:2, col:bianco, a0:c-.15, a1:c+.15, basso:0})});      // i capi, in mezzo al petto e alla schiena
      YC.forEach(function(yc){ var q=aQuota(profilo(PP),yc), zc=(q[1]*KP(yc)+.006)*(c?-1:1)+q[2];
        qB.st.push({g:new THREE.BoxGeometry(.034,.009,.004).translate(0,yc,zc),col:rosso}); qB.st.push({g:new THREE.BoxGeometry(.009,.04,.004).translate(0,yc,zc),col:rosso}); }); });      // le croci, sul petto e vicino al capo
  }
  var busto=nodo(R,qB,0,WA,0);
  /* Il capo (25 novembre 2026, sera): un cranio ovale più stretto della palla di prima, con l'arcata delle sopracciglia, le orbite, gli zigomi, il mento e la mascella sulla
     stessa pelle; naso, orecchie, le labbra nel colore; gli occhi piccoli dentro le orbite (non bottoni). I capelli sono una massa sopra il cranio, con l'attaccatura sulla fronte.
     Eginardo 22 per Carlo: «oculis praegrandibus» (qui un poco più grandi), «naso paululum mediocritatem excedenti», «canitie pulchra» (bianchi). Niente barba: Eginardo non ne parla. */
  var qT=pz(), occ=chi==='carlo'?1.15:1, kN=chi==='carlo'?1.04:1, ET=chi==='carlo'?1:chi==='papa'?.6:0;      // ET: l'età nei volumi del volto (si veda volto)
  /* l'età (27 novembre 2026): volti diversi fra loro, non ritratti. Carlo aveva circa cinquant'anni e più, il figlio circa trenta (anni di nascita noti); l'età del papa non
     è detta nelle fonti lette: qui di mezza età. Con gli anni le guance scendono sotto gli zigomi, il solco fra naso e bocca si approfondisce, la mascella si appesantisce (rilievi, più sotto) */
  var guancia=mix(pel,RM.col(0xb8644e),.16), ciglio=chi==='carlo'?RM.col(0x9a9284):cap.clone().multiplyScalar(.7);
  /* Il capo, secondo giro (27 novembre 2026, pomeriggio; il coordinatore, dai fogli: i volti erano ancora «statuine», viso lungo e mascella larga, naso a cuneo, occhi dipinti).
     Ora una pelle sola (RM.pelle, come il Colosso e il Marforio) tesa su diciassette anelli ovali, dal cranio al sotto del mento: cranio più alto e tondo, viso ovale, mascella
     e mento che rientrano. Tutti i volumi del volto sono rilievi della stessa pelle (opz.muscoli): l'arcata, le orbite incavate con le due palpebre, il naso con la radice fra gli
     occhi, gli zigomi, il solco fra naso e bocca, le due labbra, il mento; l'età (ET) nelle guance e nella mascella. Gli occhi sono in volume: un globo chiaro nell'orbita, coperto
     sopra e sotto dalle palpebre, con una piccola iride scura; niente più occhi dipinti sulla trama. Le sopracciglia e le labbra sono solo un colore sulla pelle.
     NON sono ritratti: nessuna fonte letta descrive questi volti; misure di una testa d'uomo qualsiasi (alta 23 cm, larga 16), forme scelte. Per Carlo, Eginardo 22: occhi un poco
     più grandi, naso un poco più lungo. Al più circa 5.800 triangoli per testa (pelle, occhi, orecchie; i capelli a parte). */
  var AN=[[.229,.012,.014,-.01],[.225,.035,.043,-.01],[.215,.055,.068,-.009],[.2,.068,.085,-.008],[.182,.076,.096,-.007],[.162,.079,.1,-.006],[.142,.0795,.101,-.005],[.124,.078,.1,-.003],
          [.108,.0765,.098,-.001],[.092,.0745,.095,.001],[.076,.07,.091,.003],[.06,.064,.087,.005],[.045,.058,.084,.006],[.03,.05,.08,.006],[.016,.041,.074,.006],[.003,.03,.062,.006],[-.008,.014,.034,.006]];      // sotto la bocca i centri non avanzano più (gli anelli inclinati schiacciavano il mento in su): il mento in avanti e la gola indietro vengono dai rilievi
  function tY(y){ for(var i=0;i<AN.length-1;i++) if(y<=AN[i][0] && y>=AN[i+1][0]) return i+(AN[i][0]-y)/(AN[i][0]-AN[i+1][0]); return y>AN[0][0]?0:AN.length-1; }
  function rilievi(){ var L=[];
    /* gli anelli di RM.pelle stanno di traverso alla linea dei centri, che qui si sposta in avanti scendendo verso il mento: il davanti di ogni anello è un poco più alto del
       suo centro e guarda un poco in su. Il verso e la quota di ogni rilievo tengono conto di questa inclinazione (se no il naso finiva un centimetro più su e mezzo appiattito) */
    function inclina(t){ var i=Math.max(1,Math.min(AN.length-2,Math.round(t))), ty=AN[i+1][0]-AN[i-1][0], tz=AN[i+1][3]-AN[i-1][3], l=Math.hypot(ty,tz); return [tz/l,-ty/l,AN[i][2]]; }      // [V.y, V.z, raggio in profondità]
    function M(y,a,h,wy,wa){ var t=tY(y), v=inclina(t); t=tY(y-v[0]*v[2]*Math.cos(a)); v=inclina(t);
      var dy=AN[Math.min(AN.length-1,Math.floor(t)+1)][0]-AN[Math.floor(t)][0]; L.push({t:t, wt:wy/Math.abs(dy||.015), dir:[Math.sin(a),Math.cos(a)*v[0],Math.cos(a)*v[1]], wa:wa, h:h}); }
    function M2(y,a,h,wy,wa){ M(y,a,h,wy,wa); M(y,-a,h,wy,wa); }
    M(.15,0,.02,.015,.6); M(.148,PI,.03,.03,.8);                       // la fronte; la nuca tonda
    M2(.127,.4,.07,.006,.32); M(.124,0,.03,.006,.12);                  // l'arcata delle sopracciglia (sporge sopra l'occhio e lo mette in ombra), la glabella
    M2(.108,.42,-.12,.009,.2);                                         // le orbite, incavate
    M2(.1135,.42,.06,.0035,.17); M2(.1005,.42,.035,.003,.17);          // le palpebre, sopra e sotto: coprono il globo in alto e in basso
    M(.11,0,.09,.007,.13); M(.097,0,.17*kN,.008,.15); M(.084,0,.25*kN,.007,.18); M(.075,0,.1,.003,.1); M2(.077,.2,.1,.005,.1);      // il naso: la radice fra gli occhi, il dorso, la punta (circa 2,5 cm davanti al volto), il setto, le ali
    M2(.09,.85,.06,.012,.3); M2(.062,.75,-.035*ET,.014,.25);           // gli zigomi; con l'età le guance che scendono
    M2(.063,.32,-.02-.025*ET,.01,.06);                                 // il solco fra naso e bocca
    M(.0555,0,.045,.004,.22); M(.063,0,-.01,.004,.05); M(.05,0,-.04,.0022,.26); M2(.05,.25,-.02,.003,.06); M(.0445,0,.04,.0045,.2);      // il labbro di sopra, il filtro, la bocca e i suoi angoli, il labbro di sotto
    M(.035,0,-.025,.004,.25); M(.019,0,.06,.009,.26);                  // il solco sotto il labbro, il mento
    M(.02,PI,-.3,.018,1); M(.004,PI,-.35,.012,1);                      // dietro, sotto la mascella: la pelle rientra verso il collo
    M2(.028,1.35,.02+.02*ET,.014,.3); M2(.14,1.3,-.025,.02,.35);       // l'angolo della mascella (più pesante con l'età), le tempie
    return L; }
  var labbroT=mix(pel,RM.col(0x8a4a3e),.55), solco=pel.clone().multiplyScalar(.72), bordoP=RM.col(0x3a2a22), ciglioT=chi==='carlo'?RM.col(0x7d756a):ciglio;      // le sopracciglia di Carlo grigie ma più scure della pelle (bianche non si vedevano)
  function tintaT(x,y,z){ var f=Math.atan2(x,z+.001), a=Math.abs(f), c=pel.clone();
    c.lerp(ciglioT,.95*gau(y-.1285,.0035)*gau(a-.42,.2));                             // le sopracciglia
    c.lerp(solco,.5*gau(y-.1165,.0025)*gau(a-.42,.13));                              // la piega sopra la palpebra
    c.lerp(bordoP,.7*gau(y-.1125,.0016)*gau(a-.42,.12));                             // l'orlo della palpebra sopra l'occhio, con le ciglia
    c.lerp(labbroT,Math.min(1,gau(y-.05,.0065)*gau(f,.22)*1.1));                     // le labbra
    c.lerp(solco,.6*gau(y-.075,.003)*gau(a-.12,.07));                                 // le narici, in ombra
    c.lerp(bordoP,.45*gau(y-.0502,.0022)*gau(f,.2));                                  // la linea fra le labbra, appena
    c.lerp(guancia,.8*gau(y-.08,.02)*gau(a-.75,.25));
    return c.multiplyScalar(1-.18*gau(y+.004,.012)*(1-gau(f,.5)*.5)); }              // più scura sotto la mascella
  qT.st.push({g:pelleG(AN.map(function(q){ return [0,q[0],q[3],q[1],q[2]]; }),52,{sudd:3,muscoli:rilievi(),patina:1},pel,tintaT)});
  /* gli occhi: un globo chiaro (non bianco puro) e l'iride scura, guardano avanti; le palpebre (più sopra) li coprono in alto e in basso */
  var kO=chi==='carlo'?1.06:1;
  [-1,1].forEach(function(s){ qT.st.push({g:palla3(.0118*kO,s*.0268,.108,.0712,1,1,1,10,8),col:RM.col(0xc2b4a2)}); qT.st.push({g:palla3(.0048*kO,s*.026,.1082,.0712+.0118*kO-.0011,1,1,.35,8,6),col:RM.col(0x3a2a20)}); });      // il globo un poco più indietro: l'occhio sta nell'orbita, non sporge
  [-1,1].forEach(function(s){ var gO=palla3(.013,0,0,0,.5,2.2,1.55,10,8); gO.rotateZ(s*.12).rotateY(s*.25).translate(s*.077,.096,-.01);
    qT.st.push({g:gO,col:pel.clone().multiplyScalar(.88)}); });      // le orecchie: piatte e aderenti al capo, appena girate in avanti
  /* 27 novembre 2026: i capelli come una massa, non una cuffia: più volume ai lati e sulla nuca, l'orlo frastagliato a ciocche (prima una linea netta), le ciocche più marcate
     e il fondo fra una ciocca e l'altra più scuro; per Carlo grigio-bianchi e non bianco puro (Eginardo: «canitie pulchra»). Corti per tutti (papa: vita-roma-fonti.md, VII-IX secolo) */
  var capT=chi==='carlo'?RM.col(0xcdc6b8):cap;
  function ciocca(f,y){ return Math.sin(f*11+y*70)*(.6+.4*Math.sin(f*5+1)); }
  qT.st.push({g:telo({prof:[[.24,0,0,-.009],[.233,.045,.052,-.009],[.221,.068,.08,-.009],[.2,.083,.099,-.008],[.172,.09,.108,-.007],[.142,.091,.109,-.006],[.112,.088,.106,-.005],[.082,.081,.099,-.004],[.05,.07,.087,-.003]],      // secondo giro: segue il cranio più alto, meno massa dietro la nuca
    lati:40, sudd:3, col:capT, segue:true, orlo:function(f){ var d=.5-.5*Math.cos(f); return .12*Math.pow(.5+.5*Math.cos(f),.9)+.007*Math.sin(f*8+2)*d*d; }, pieghe:[[17,.025,0],[29,.014,1.2]], basso:.5,      // l'orlo mosso solo sulla nuca (davanti e ai lati le punte uscivano dal volto)
    sp:function(f,y,t){ return (1+.024*ciocca(f,y))*(1-.05*t*t*Math.pow(.5+.5*Math.cos(f),2)); }, ombra:function(f,y,t){ return (1+.24*ciocca(f,y))*(1-.25*t*t); }})});      // davanti l'orlo aderisce alla fronte e alle tempie; le ciocche, anche sulla calotta, più scure verso l'orlo, dove la massa è in ombra
  var testa=nodo(busto,qT,0,.56,0);
  /* le braccia nelle maniche: la spalla tonda sotto la stoffa del busto, il gomito coperto dalla manica dell'avambraccio, che si allarga al polso; la mano col pollice.
     Per Carlo i polsi d'oro («veste auro texta»); il papa ha le maniche bianche della veste di sotto */
  var spalle=[];
  [-1,1].forEach(function(s){
    var qS=pz(), qA=pz(), man=veste;
    /* 27 novembre 2026: la manica non è più un tubo liscio: verso il gomito la stoffa si raccoglie in pieghe (rigonfiamenti e solchi nella superficie, più scuri nel fondo),
       e all'avambraccio ricade in due pieghe larghe verso il polso. Forma schema */
    function piegaM(f0,a){ return function(x,y,z){ var w=Math.sin(y*f0+z*26+x*18*s); return w<-.35?man.clone().multiplyScalar(1-a*(-.35-w)/.65):null; }; }
    qS.st.push({g:pelleG([[0,.028,0,.02],[0,.012,0,.046,.048],[0,-.025,0,.058,.056],[0,-.1,0,.06,.057],[0,-.18,0,.055,.052],[0,-.215,.002,.058,.054],[0,-.245,.003,.051,.048],[0,-.27,.004,.055,.051],[0,-.3,.004,.049,.046],[0,-.32,.004,.042,.04],[0,-.34,.004,.02]],16,{sudd:2},man,piegaM(95,.3))});
    qA.st.push({g:pelleG([[0,.035,0,.02],[0,.015,0,.044],[0,-.03,0,.05,.048],[0,-.06,.001,.045,.044],[0,-.14,.002,.051,.05],[0,-.215,.003,.058,.056],[0,-.245,.003,.061,.059],[0,-.252,.003,.03]],16,{sudd:2},man,
      chi==='carlo'?function(x,y,z){ return y<-.222?oroT:piegaM(55,.22)(x,y,z); }:piegaM(55,.22))});
    qA.st.push({g:pelleG([[0,-.232,0,.02,.026],[0,-.262,.002,.018,.036],[0,-.3,.004,.017,.042],[0,-.335,.005,.015,.04],[0,-.36,.004,.012,.033],[0,-.375,.002,.008,.022],[0,-.383,0,.003,.01]],14,{sudd:3},pel,
      function(x,y,z){ if(y>-.305) return y>-.27?null:(Math.abs(x)<.008?pel.clone().multiplyScalar(.93):null);      // la mano (25 novembre 2026, «mani povere»): più piena; sul dorso le nocche appena; dalle nocche le quattro dita, divise da solchi scuri
        var q=(z-.004)/.019, f=q-Math.round(q); return Math.abs(f)<.12 && Math.abs(q)<1.4?pel.clone().multiplyScalar(.62):(y<-.372?pel.clone().multiplyScalar(1.06):null); })});      // le unghie un poco più chiare
    qA.st.push({g:pelleG([[-s*.004,-.262,.022,.011],[-s*.006,-.29,.04,.01],[-s*.006,-.312,.048,.008],[-s*.005,-.322,.05,.004]],8,{sudd:2},pel)});      // il pollice
    var sp=nodo(busto,qS,s*.172,.43,0), gm=nodo(sp,qA,0,-.3,0); spalle.push({s:s, sp:sp, gm:gm}); });
  R.scale.setScalar(.1*(o.statura||1));
  /* il braccio che arriva a un punto (due segmenti): il gomito sta nel piano che passa per spalla, mano e un punto «di richiamo» in basso, di fuori e un poco dietro */
  var T=new THREE.Vector3(), L1=.3, L2=.31, uA=new THREE.Vector3(), vA=new THREE.Vector3(), E=new THREE.Vector3(), GIU3=new THREE.Vector3(0,-1,0), qU=new THREE.Quaternion();
  function braccio(b,mondo){
    if(mondo){ T.copy(mondo); busto.worldToLocal(T); } else T.set(b.s*.2,-.13,.05);      // a riposo, le mani lungo i fianchi
    var S=b.sp.position; uA.copy(T).sub(S); var D=uA.length()||1e-4, d=Math.max(.12,Math.min(L1+L2-.004,D)); uA.divideScalar(D);
    vA.set(b.s*.45,-1,-.25); vA.addScaledVector(uA,-vA.dot(uA)); if(vA.lengthSq()<1e-6) vA.set(0,0,-1); vA.normalize();
    var al=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    E.copy(uA).multiplyScalar(L1*Math.cos(al)).addScaledVector(vA,L1*Math.sin(al));                      // il gomito, rispetto alla spalla
    b.sp.quaternion.setFromUnitVectors(GIU3,E.clone().divideScalar(L1));
    T.copy(uA).multiplyScalar(d).sub(E).normalize().applyQuaternion(qU.copy(b.sp.quaternion).invert());   // l'avambraccio, nel riferimento del braccio
    b.gm.quaternion.setFromUnitVectors(GIU3,T);
  }
  var G=new THREE.Vector3();
  function posa(p){
    var k=p.k||0; busto.position.y=WA-CADE*k; gonna.scale.y=Math.max(.02,(WA-CADE*k)/WA); polp.visible=k>.02; polp.scale.set(1,Math.max(.01,k),Math.max(.01,k)); piedi.visible=k<.6;
    busto.rotation.x=p.busto||0; testa.rotation.set(p.chino||0,0,0);
    R.updateMatrixWorld(true);
    if(p.guarda){ G.copy(p.guarda); busto.worldToLocal(G); G.y-=.56; testa.rotation.set((p.chino||0)+Math.max(-.4,Math.min(.4,-Math.atan2(G.y-.12,Math.hypot(G.x,G.z))*.6)),Math.max(-.7,Math.min(.7,Math.atan2(G.x,G.z))),0); }
    var m=p.mani||{}; spalle.forEach(function(b){ var w=b.s<0?m.d:m.s; braccio(b,w||null); });
    R.updateMatrixWorld(true);
  }
  function capo(v){ return testa.localToWorld(v.set(0,.215,.0)); }      // la cima del capo, nel mondo
  posa({});
  return {g:R, posa:posa, capo:capo, testa:testa, spalle:spalle, busto:busto};
}
/* Due versioni di ogni protagonista (25 novembre 2026, fluidità sull'iPhone): quella piena, con la trama del volto, nei primi piani; una leggera (circa due quinti dei lati,
   una fila per tratto, il volto senza trama) quando la figura è alta meno di 110 pixel sullo schermo (130 per tornare alla piena: niente altalena al confine). Si mette in posa
   solo quella che si vede. Prima i tre protagonisti pesavano 44 mila triangoli anche nei campi larghi, dove erano alti una cinquantina di pixel. */
function ritrattoDoppio(o){
  RIT_DET=1; var A=ritratto(o), B; RIT_DET=.42; try{ B=ritratto(o); } finally { RIT_DET=1; }
  var g=new THREE.Group(); g.scale.copy(A.g.scale); A.g.scale.setScalar(1); B.g.scale.setScalar(1); g.add(A.g); g.add(B.g); B.g.visible=false;
  var att=A, vicino=true, V=new THREE.Vector3();
  function scegli(){ var cam=RM.camera; if(!cam) return; var d=cam.position.distanceTo(g.getWorldPosition(V))||1, H=(RM.renderer&&RM.renderer.domElement.clientHeight)||800, px=.19/d*H/(2*Math.tan(cam.fov*Math.PI/360));
    var v=px>(vicino?110:130); if(v!==vicino){ vicino=v; A.g.visible=v; B.g.visible=!v; } att=vicino?A:B; }
  return {g:g, posa:function(p){ scegli(); att.posa(p); }, capo:function(v){ return att.capo(v); }, triangoli:function(){ var t=[0,0]; [A,B].forEach(function(r,i){ r.g.traverse(function(q){ if(q.isMesh) t[i]+=(q.geometry.index?q.geometry.index.count:q.geometry.attributes.position.count)/3; }); }); return t; }, pieno:function(){ return vicino; }};
}
/* la corona: un cerchio d'oro con pietre (la forma non è nota: schema); misure in metri */
function corona800(){
  var q=[], oroC=RM.col(0xe2b54e), g=new THREE.Group();
  q.push({g:new THREE.CylinderGeometry(.102,.1,.05,32,1,true),col:oroC}); q.push({g:anello(.102,.008,.025),col:oroC}); q.push({g:anello(.1,.008,-.025),col:oroC});
  for(var i=0;i<8;i++){ var a=i/8*Math.PI*2; q.push({g:palla3(.012,Math.sin(a)*.104,0,Math.cos(a)*.104,1,1,.6,8,6),col:i%2?RM.col(0x2f7a4a):RM.col(0x9a1e24)});
    q.push({g:palla3(.012,Math.sin(a+.39)*.1,.04,Math.cos(a+.39)*.1,1,1.4,1,8,6),col:oroC}); }
  var m=new THREE.Mesh(fondi(q),matR('oro')); m.castShadow=true; g.add(m); return g;
}
var interno800=(function(){
  var pie=(RM.MONUMENTI||[]).filter(function(m){ return m.id==='pietro'; })[0]; if(!pie||!pie.g||!pie.mat) return null;
  var gy=pie.g.position.y, X0=pie.x, Z0=pie.z, teg=null, i, j;
  RM.scene.children.forEach(function(c){ if(c!==pie.g && c.userData.gruppo==='monumenti' && Math.abs(c.position.x-X0)<.01 && Math.abs(c.position.z-Z0)<.01) teg=c; });      // le tegole di Onorio I (tegolepietro): stessa posizione
  /* il piano dell'interno: sopra il terreno in ogni punto della pianta */
  var f=.08; for(i=-6.5;i<=5.6;i+=.5) for(j=-4.4;j<=4.4;j+=.5){ if(i>-3.95 && Math.abs(j)>3.1) continue; f=Math.max(f,H(X0+i,Z0+j)-gy+.012); }
  var B=new RM.Costruttore(), lastra=[RM.col(0xbfb39b),RM.col(0xaa9d84),RM.col(0xb5a78c)], porfido=RM.col(0x8f6656), muro=RM.col(0xd3c4a5), marmo=P.marmo, scuro=RM.col(0x2a2420), abside=RM.col(0xc4a35e), franco=RM.col(0x3e5f7a);
  var BL=new RM.Costruttore(), luce=RM.col(0xfff1cf);      // BL: le finestre alte, accese (materiale senza ombre)
  B.dentro(X0,gy,Z0,0,function(B){
    /* il pavimento a grandi lastre, con una fascia scura sull'asse della navata (misure, colori e fascia sono schema) */
    for(i=0;i<16;i++) for(j=0;j<10;j++){ var x0=-3.95+i*.6, z0=-3.1+j*.62; B.quad([x0,f,z0],[x0,f,z0+.62],[x0+.6,f,z0+.62],[x0+.6,f,z0],(j===4||j===5)&&i%4===1?porfido:lastra[(i+j*2)%3]); }
    for(i=0;i<3;i++) for(j=0;j<14;j++){ var x1=-5.72+i*.59, z1=-4.42+j*.63; B.quad([x1,f,z1],[x1,f,z1+.63],[x1+.59,f,z1+.63],[x1+.59,f,z1],lastra[(i*2+j)%3]); }
    B.cilindro(.84,.016,-5.75,f-.02,0,lastra[1],null,14);      // il piano dell'abside, 4 cm sotto il pavimento (27 novembre 2026): alla stessa quota delle lastre le due facce si contendevano i pixel attorno a Carlo e al papa (il disco arriva fin sotto i loro piedi), e i triangoli del disco, più chiari o più scuri delle lastre, lampeggiavano a ogni movimento della camera: era «l'ombra che flasha»
    /* i muri esterni, tagliati: a nord alti, a sud bassi (da sud si guarda) */
    B.scatola(9.6,1.2,.08,.85,f,-3.12,muro).scatola(9.6,.5,.08,.85,f,3.12,muro);
    B.scatola(.08,1.4,3.58,-5.72,f,-2.63,muro).scatola(.08,.55,3.58,-5.72,f,2.63,muro);                      // il fondo del transetto, ai due lati dell'abside
    B.scatola(1.74,1.4,.08,-4.85,f,-4.42,muro).scatola(1.74,.55,.08,-4.85,f,4.42,muro);                       // le testate del transetto
    B.scatola(.08,1.4,1.3,-3.98,f,-3.77,muro).scatola(.08,.55,1.3,-3.98,f,3.77,muro);
    var ab=new THREE.CylinderGeometry(.84,.84,1.4,16,1,true,Math.PI,Math.PI); ab.translate(-5.75,f+.7,0); B.geo(ab,abside);      // l'abside, color oro scuro (il mosaico di Cristo fra Pietro e Paolo, it.wikipedia: qui solo il colore)
    /* le quattro file di colonne: la navata con l'architrave, le navatelle con gli archi (qui una fascia di muro); sopra le file della navata il muro alto con le undici finestre,
       a nord intero fino al taglio, a sud tagliato a metà delle finestre */
    [-1,1].forEach(function(s){
      B.colonne(-3.75,s*1.2,5.45,s*1.2,22,.92,.05,f,marmo).scatola(9.6,.12,.14,.85,f+.92,s*1.2,marmo);
      B.colonne(-3.75,s*2.2,5.45,s*2.2,22,.6,.035,f,marmo).scatola(9.6,s<0?.26:.1,.08,.85,f+.6,s*2.2,muro);
    });
    B.scatola(9.6,1.0,.1,.85,f+1.04,-1.2,muro).scatola(9.6,.46,.1,.85,f+1.04,1.2,muro);
  });
  BL.dentro(X0,gy,Z0,0,function(B){ for(i=0;i<11;i++){ B.scatola(.3,.42,.012,-3.3+i*.85,f+1.35,-1.144,luce); B.scatola(.3,.15,.012,-3.3+i*.85,f+1.35,1.144,luce); } });      // le finestre: la luce del giorno
  B.dentro(X0,gy,Z0,0,function(B){
    /* l'arco trionfale: due piloni e il muro con l'arco, tagliato in alto */
    var xa=-3.95, rA=1.0, yA=f+1.05, top=f+2.3;
    B.scatola(.2,top-f,.2,xa,f,-1.1,muro).scatola(.2,top-f,.2,xa,f,1.1,muro);
    for(i=0;i<10;i++){ var a0=Math.PI*i/10, a1=Math.PI*(i+1)/10, z0=rA*Math.cos(a0), z1=rA*Math.cos(a1), y0=yA+rA*Math.sin(a0), y1=yA+rA*Math.sin(a1);
      [-.1,.1].forEach(function(dx){ B.quad([xa+dx,y0,z0],[xa+dx,y1,z1],[xa+dx,top,z1],[xa+dx,top,z0],muro); });
      B.quad([xa-.1,y0,z0],[xa+.1,y0,z0],[xa+.1,y1,z1],[xa-.1,y1,z1],muro); }
    /* il presbiterio alla corda dell'abside: il piano rialzato, l'altare sopra la tomba, la finestrella della confessione, la pergula di sei colonne (schema) */
    B.scatola(.9,.05,1.9,-5.82,f,0,RM.col(0xa99f8d)).scatola(.12,.1,.22,-5.58,f+.05,0,RM.col(0xe6dfcf)).scatola(.012,.06,.11,-5.515,f+.055,0,scuro).scatola(.014,.012,.13,-5.514,f+.115,0,P.bronzo);      // la finestrella della confessione, con la cornice (misure schema)
    /* la pergula (25 novembre 2026): dodici colonne tortili, come la nota 38 di Duchesne alla vita di Adriano I («portique de douze colonnes, en avant du presbyterium»)
       e it.wikipedia («colonne tortili»); in una fila sola, con l'architrave: la disposizione è schema */
    for(i=0;i<12;i++){ var zc=-.75+i*1.5/11; B.cilindro(.03,.03,-5.3,f+.05,zc,marmo,.03,8); B.coclide(.022,.019,.37,-5.3,f+.08,zc,3,marmo); B.cilindro(.028,.025,-5.3,f+.45,zc,marmo,.022,8); }
    B.scatola(.05,.04,1.56,-5.3,f+.475,0,marmo);
  });
  /* I veli fra le colonne (25 novembre 2026). Liber Pontificalis, vita di Adriano I (772-795), 46 (Duchesne I p. 499, letto il 25 novembre 2026): «per universos arcos eiusdem
     … basilicae de palleis tyreis atque fundatis fecit vela numero LXV»; la nota di Duchesne: «les courtines disposées entre les colonnes des nefs intérieures». Qui tende di porpora
     raccolte alle colonne della navata, con la balza in alto; forma, misura e quante se ne vedono sono schema. */
  var porpora=RM.col(0x5a1d3a), porporaS=RM.col(0x441530);
  B.dentro(X0,gy,Z0,0,function(B){
    [-1,1].forEach(function(s){ for(i=0;i<21;i++){ var xa=-3.75+i*9.2/21, xb=xa+9.2/21, zz=s*(1.2-.035);
      B.scatola(xb-xa-.03,.1,.008,(xa+xb)/2,f+.8,zz,porpora);                                                        // la balza
      [xa+.035,xb-.035].forEach(function(xc,j){ var d=j?-1:1;
        B.quad([xc,f+.8,zz],[xc+d*.07,f+.8,zz],[xc+d*.02,f+.42,zz],[xc,f+.42,zz],porpora);                          // il velo raccolto contro la colonna
        B.quad([xc,f+.42,zz],[xc+d*.02,f+.42,zz],[xc+d*.035,f,zz],[xc,f,zz],porporaS); }); } });
  });
  /* il faro: Liber Pontificalis, vita di Adriano I, 46 (Duchesne I p. 499): «fecit et farum maiorem in eadem beati Petri ecclesia, in tipum crucis, qui pendet ante presbiterium,
     habentem candelas mille CCCLXV; et constituit ut quattuor vicibus in anno ipsum farum accendatur, id est in natale Domini, in Pascha, in natale Apostolorum et in natale pontificis».
     A Natale era acceso. Qui una croce di metallo appesa davanti al presbiterio con 1365 lumi; misure, altezza, catene e metallo sono schema.
     Il pavimento d'argento: stessa vita, 45: «ab introitu de rugas usque ad confessionem pavimentum vestivit de argento purissimo» (nota 38 di Duchesne: dalla grata del portico
     di dodici colonne all'ingresso della confessione). Qui una lastra d'argento fra la pergula e la confessione; la misura è schema. */
  var FARO=[X0-4.55,gy+f+1.22,Z0];
  B.dentro(FARO[0],FARO[1],FARO[2],0,function(B){
    var br=RM.col(0x3a2c1c); B.scatola(1.0,.02,.05,0,0,0,br).scatola(.05,.02,1.0,0,0,0,br).scatola(.16,.025,.16,0,-.005,0,br);
    [[.5,0],[-.5,0],[0,.5],[0,-.5]].forEach(function(q){ fune(B,[q[0]*.92,.02,q[1]*.92],[0,.75,0],.006,br); });
  });
  fune(B,[FARO[0],FARO[1]+.75,FARO[2]],[FARO[0],FARO[1]+1.2,FARO[2]],.008,RM.col(0x3a2c1c));
  var argento=new THREE.Mesh(new THREE.PlaneGeometry(.2,.5).rotateX(-Math.PI/2),matR('argento')); argento.position.set(X0-5.41,gy+f+.0515,Z0); argento.receiveShadow=true; argento.visible=false; RM.scene.add(argento);
  /* le persone ferme: il clero nel presbiterio, i Franchi nel transetto dietro Carlo, il popolo romano nella navata, nelle navatelle e nelle ali del transetto */
  var r8=RM.casuale(801), CX=X0-4.98, CZ=Z0, Y=gy+f;
  function W(lx,lz){ return [X0+lx,Z0+lz]; }
  function verso(x,z){ return Math.atan2(X0-5.4-x,Z0-z); }      // rivolti verso la confessione
  INVERNO=true; PIENA=true;
  vicine(B,'800i',[CX,CZ],function(){
    [-1,1].forEach(function(s){ for(var a=0;a<4;a++) for(var b=0;b<3;b++){ var p=W(-6.05+a*.2,s*(.5+b*.17)); TESTA_FINE=!LEGGERA||a>=2; uomo(B,p[0],p[1],Y+.05,(a+b)%3?C.bianco:C.oro,null,s>0?Math.PI:0,'clero'); } });
  },0,true);
  vicine(B,'800i',[CX,CZ],function(){
    for(var a=0;a<4;a++) for(var b=-6;b<=6;b++){ if(a===0 && Math.abs(b)<3) continue; var p=W(-4.62+a*.18+(r8()-.5)*.04,b*.2+(r8()-.5)*.05); TESTA_FINE=!LEGGERA||a===0; uomo(B,p[0],p[1],Y,a%2?C.ferro:franco,null,-Math.PI/2+(r8()-.5)*.3); }
  },1,true);
  TESTA_FINE=false;      // 27 novembre 2026: il clero e i Franchi dietro ai protagonisti hanno la testa fine; sui telefoni solo le due file del clero più vicine e la prima dei Franchi      // anche sui telefoni (25 novembre 2026, sera): nel campo largo stanno in primo piano, e come pedine sembravano blocchi
  INVERNO=false;
  var g=B.maglia(RM.matPietra()); PIENA=false; g.visible=false; g.castShadow=false; g.receiveShadow=true; RM.scene.add(g);      // i muri tagliati non fanno ombra: nello spaccato navata e transetto restavano in ombra piena (25 novembre 2026)
  /* la luce dipinta nei colori dei vertici: più calda e chiara verso la confessione e l'abside, appena più spenta verso la facciata (schema della luce, non una misura) */
  /* 25 novembre 2026, sera (penombra): prima la navata era chiara e slavata, il pavimento quasi bianco. Ora è l'interno di una basilica coperta: la luce calda delle candele
     della confessione e del faro cade sul gruppo dei protagonisti e si spegne verso la facciata e le navatelle (un terzo della luce). Le persone hanno la stessa penombra
     (uPen in conLumi, più sopra). Schema della luce, non una misura. */
  (function(){ var ca=g.geometry.attributes.color, pa=g.geometry.attributes.position, k, x, z, d2, dF, gl, e;
    for(k=0;k<pa.count;k++){ x=pa.getX(k)-X0; z=pa.getZ(k)-Z0; d2=(x+5.45)*(x+5.45)+z*z; dF=(x+4.55)*(x+4.55)+z*z; gl=Math.max(Math.exp(-d2/4.5),.75*Math.exp(-dF/2.2));
      e=1-.3*RM.sfuma(1.25,3.1,Math.abs(z))*(x>-3.95?1:0);      // le navatelle più scure della navata
      var m=(.26+.52*gl)*e; ca.setXYZ(k,Math.min(1,ca.getX(k)*m*(1+.1*gl)),Math.min(1,ca.getY(k)*m),Math.min(1,ca.getZ(k)*m*(1-.22*gl))); }
    ca.needsUpdate=true; })();
  var finestre=BL.maglia(new THREE.MeshBasicMaterial({vertexColors:true})); finestre.visible=false; RM.scene.add(finestre);
  /* Il popolo romano (Annali: «a cuncto Romanorum populo adclamatum est»): persone a istanze nella navata, nelle navatelle e nelle ali del transetto, d'inverno col mantello
     o con la palla; due pose, ferme e con le braccia alzate per l'acclamazione, a ondate dalla confessione verso la facciata, tre volte (Liber Pontificalis: «ter dictum est»).
     Quante, il gesto delle braccia e il ritmo delle ondate sono schema. Quante se ne vedono dipende dal gradino della qualità. */
  /* 25 novembre 2026, sera: la folla più fitta (circa 1,2 m fra una persona e l'altra nella navata, prima 2) e più viva. I posti si riempiono a partire dalla confessione:
     con meno persone (gradini bassi, telefoni) resta piena la parte davanti all'altare e si svuota il fondo verso la facciata. Tre pose: ferme, con le due braccia alzate,
     con un braccio solo; chi acclama alza le braccia a tempi un poco diversi, e tutti si muovono appena (un dondolio lento). Gesti, ritmo e numeri sono schema. */
  var POSTI=[], lx, lz;
  for(lx=-3.55;lx<5.4;lx+=.12) for(lz=-1.02;lz<=1.03;lz+=.12){ if(r8()<.08) continue; if(lx<-3.3 && Math.abs(lz)<.35) continue; POSTI.push({x:X0+lx+(r8()-.5)*.05, z:Z0+lz+(r8()-.5)*.05, ry:-Math.PI/2+(r8()-.5)*.45}); }
  for(i=0;i<640;i++){ var s1=r8()<.5?-1:1, x2=X0-3.6+r8()*9, z2=Z0+s1*(1.35+r8()*1.7); if(Math.abs(Math.abs(z2-Z0)-2.2)<.09) continue; POSTI.push({x:x2,z:z2,ry:-Math.PI/2+(r8()-.5)*.8}); }
  for(i=0;i<220;i++){ var s2=r8()<.5?-1:1, x3=X0-5.5+r8()*1.4, z3=Z0+s2*(1.5+r8()*2.7); POSTI.push({x:x3,z:z3,ry:verso(x3,z3)+(r8()-.5)*.4}); }
  POSTI.forEach(function(p){ p.ord=Math.hypot(p.x-X0+4.9,(p.z-Z0)*1.6)+r8()*2.2; });
  POSTI.sort(function(a,b){ return a.ord-b.ord; });      // dalla confessione verso la facciata
  /* 25 novembre 2026, sera, secondo giro: le vesti del VII-IX secolo (RM.VESTI in js/vita.js: il mantello lungo e chiuso degli uomini, il velo bianco e la veste lunga delle donne)
     e sei fogge invece di quattro, con la testa girata, il peso su una gamba o le mani giunte quando le braccia non sono alzate. Le tinte: quelle attestate o la lana non tinta. */
  var VV=!!RM.VESTI, TV=VV?[RM.VESTI.uomo7.manto.col,RM.VESTI.uomo7b.manto.col].concat(RM.VESTI.donna7.tinte,RM.VESTI.uomo7c.tinte):null;
  var LANA=VV?TV:[0x6b5a44,0x8a4a33,0x5f6a4e,0x7a6a52,0x5b5f66,0xa58f6a,0x4a5a72,0x9a7a4a,0x7d5a3a,0x8e8a7a].map(RM.col), FOGGE=VV?[{v:'uomo7c',k:0,p:1},{v:'donna7',k:3,p:3},{v:'uomo7',k:3,p:2},{v:'donna7',k:0,p:1},{v:'uomo7b',k:0,p:0},{v:'uomo7c',k:3,p:3}]:[{f:1,k:0},{f:2,k:3},{f:1,k:3},{f:2,k:0}], folla=[], NP=POSTI.length, NF=FOGGE.length;
  /* 27 novembre 2026: le prime file della folla (le più vicine alla confessione, quelle che si vedono a fuoco dietro i protagonisti) hanno la testa fine, in maglie a parte;
     dietro resta la testa semplice. Quante: KF, 40 sul PC; sui telefoni nessuna (le maglie in più erano dieci disegni in più: lì la testa fine l'hanno solo il clero e i Franchi più vicini) */
  var KF=Math.min(NP,LEGGERA?0:40);
  if(VERE) folla=FOGGE.map(function(fo,q){ var capF=Math.max(1,Math.ceil((KF-q)/NF)), capN=Math.max(1,Math.ceil((NP-q)/NF)-capF+1);
    function mk(br,fine){ var cap=fine?capF:capN, pz=VV&&!br&&RM.figuraPose?RM.figuraPose[fo.p]:null, gq=personaGeo({f:fo.f||0,v:fo.v,k:fo.k,s:1,pieno:true,fine:fine,braccia:br,posa:pz?{yaw:pz.yaw,braccio:pz.braccio,anca:pz.anca}:null});
      gq.setAttribute('dondolo',new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3));      // per istanza: velocità e fase del dondolio, momento del saltello (si veda matFolla)
      var m=new THREE.InstancedMesh(gq,matFolla(),cap); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);
      m.frustumCulled=false; m.castShadow=false; m.receiveShadow=true; m.visible=false; m.count=0; RM.scene.add(m); return m; }
    return {giu:mk(0), su:mk(1), uno:mk(3), fgiu:mk(0,true), fsu:mk(1,true), funo:mk(3,true)}; });
  var MAGLIE=['giu','su','uno','fgiu','fsu','funo'];      // le tre pose, con la testa semplice e con la testa fine
  /* le macchie d'appoggio della folla: una maglia sola per tutti (un disegno), riscritta con le altre quando qualcuno cambia posa */
  var piediFolla=new THREE.InstancedMesh(geoAppoggio(.026,.026),matAppoggio(),Math.max(1,NP)); piediFolla.frustumCulled=false; piediFolla.renderOrder=1; piediFolla.count=0; piediFolla.visible=false; RM.scene.add(piediFolla);
  POSTI.forEach(function(p,n){ p.q=n%NF; p.k=(n/NF)|0; p.su=null; var h=r8(); p.no=h<.1; p.uno=h>.72; p.rit=(p.x-X0+5.5)*.05+r8()*.35; p.dur=.85+r8()*.55; p.fase=r8()*6.283; p.vel=.6+r8()*.8;
    var c=LANA[(r8()*LANA.length)|0]; p.col=c.clone().multiplyScalar(.85+r8()*.3); });
  var NQ=LEGGERA?[90,150,220,300]:[140,440,760,NP];      // persone del popolo per gradino («bassa», «media», «alta», «massima»)
  var ONDE=[19.4,21.2,23.0];
  /* Ogni persona sta in una sola delle tre maglie della sua foggia (ferma, due braccia, un braccio): le istanze si riempiono da capo a ogni fotogramma, così le maglie disegnano
     solo chi c'è (prima le pose non usate erano istanze schiacciate a zero, disegnate lo stesso: tre volte i triangoli). Il dondolio: una rotazione lenta, diversa per ognuno. */
  var POSE=['giu','su','uno'];
  /* 25 novembre 2026, sera (fluidità sull'iPhone): il dondolio e il saltello dell'acclamazione li fa lo shader dei vertici (matFolla, con il tempo della scena in TEMPO800):
     le matrici si riscrivono solo quando qualcuno cambia posa (le tre ondate) o cambia il numero delle persone; il resto del tempo il processore non tocca la folla. */
  var firmaPop='';
  function popolo(u){
    if(!folla.length) return; var n=Math.min(NP,NQ[RM.q]||NQ[1]), k, w, f=n+'|';
    TEMPO800.value=MENO?0:u;
    for(k=0;k<n;k++){ var p=POSTI[k], su=0;
      if(!p.no) for(w=0;w<3;w++){ var a=ONDE[w]+p.rit; if(u>=a && u<a+p.dur){ su=p.uno?2:1; break; } }
      p.suOra=su; f+=su; }
    if(f===firmaPop) return; firmaPop=f;
    folla.forEach(function(F){ F.n=[0,0,0,0,0,0]; });
    for(k=0;k<n;k++){ var p2=POSTI[k], s2=p2.suOra+(k<KF?3:0), F2=folla[p2.q], m=F2[MAGLIE[s2]], j=F2.n[s2]++, dd=m.geometry.attributes.dondolo;
      metti(m,j,p2.x,Y,p2.z,p2.ry,1); m.instanceColor.setXYZ(j,p2.col.r,p2.col.g,p2.col.b); dd.setXYZ(j,MENO?0:p2.vel,p2.fase,p2.suOra&&!MENO?ONDE[0]+p2.rit:-99); piediFolla.setMatrixAt(k,O3.matrix); }
    piediFolla.count=n; piediFolla.visible=acceso && n>0; piediFolla.instanceMatrix.needsUpdate=true;
    folla.forEach(function(F){ MAGLIE.forEach(function(t,i){ var m=F[t]; m.count=F.n[i]; m.visible=acceso && m.count>0; m.instanceMatrix.needsUpdate=true; m.instanceColor.needsUpdate=true; m.geometry.attributes.dondolo.needsUpdate=true; }); });      // una maglia vuota non si disegna (un disegno in meno, con la sua macchia d'appoggio)
  }
  /* chi si muove: Carlo in ginocchio e in piedi, il papa in piedi, col gesto della corona e in ginocchio, il figlio Carlo */
  /* (25 novembre 2026, sera) figure fini con le giunture: vedi «i protagonisti da vicino», più sopra */
  var rC=ritrattoDoppio({chi:'carlo', statura:1.07, capelli:RM.col(0xe4dfd3)}), rP=ritrattoDoppio({chi:'papa', statura:1, capelli:RM.col(0x8c867c)}), rF=ritrattoDoppio({chi:'figlio', statura:1.02, capelli:RM.col(0x6a4a30), pelle:RM.col(0xb89684)});
  [rC,rP,rF].forEach(function(r){ r.g.visible=false; RM.scene.add(r.g); senzaOmbra(r.g); r.piedi=new THREE.Mesh(geoAppoggio(.032,.032),matAppoggio()); r.piedi.renderOrder=1; r.piedi.visible=false; RM.scene.add(r.piedi); });      // si muovono: niente ombra nella mappa del sole, la macchia d'appoggio sotto i piedi (matAppoggio, in testa)
  /* la corona, a grandezza vera (prima era più grande, perché si leggesse da lontano: ora la vista le arriva vicino); brilla con un alone */
  var corona=corona800(); corona.scale.setScalar(.1*1.07); corona.visible=false; RM.scene.add(corona); senzaOmbra(corona);
  var mobili=[rC.g,rP.g,rF.g,rC.piedi,rP.piedi,rF.piedi,argento];
  /* il taglio: piani sul materiale di San Pietro e delle tegole (renderer.localClippingEnabled); a k=0 il piano orizzontale sta lontano e non taglia nulla */
  if(RM.renderer) RM.renderer.localClippingEnabled=true;
  var pA=new THREE.Plane(new THREE.Vector3(0,-1,0),1e5), pB=new THREE.Plane(new THREE.Vector3(1,0,0),-(X0+5.66)), mats=[pie.mat].concat(teg?[teg.material]:[]);
  mats.forEach(function(m){ m.clippingPlanes=[pA,pB]; m.clipIntersection=true; m.clipShadows=false; m.needsUpdate=true; });
  var ombraPie=pie.g.castShadow, ombraTeg=teg?teg.castShadow:false, kT=0, acceso=false, giroPrima=false;
  function taglio(k){
    k=Math.max(0,Math.min(1,k)); if(k===kT) return; kT=k;
    pA.constant=k<=0?1e5:gy+4.45-k*4.6;
    /* 25 novembre 2026, sera: il tetto tagliato continua a fare ombra (le ombre non sono tagliate): dentro c'è la penombra di una basilica coperta, rotta dai raggi delle
       finestre e dalla luce calda dei lumi. Prima l'ombra si spegneva, e l'interno restava in pieno sole, chiaro e piatto. */
    var om=ombraPie; if(pie.g.castShadow!==om){ pie.g.castShadow=om; if(teg) teg.castShadow=ombraTeg; if(RM.renderer) RM.renderer.shadowMap.needsUpdate=true; }
  }
  /* ---- la luce di una messa di Natale (25 novembre 2026, l'utente: «la scena deve essere spettacolare»). Tutto schema, detto nella didascalia: nessuna fonte letta descrive
     lampade, candele o luce di quel giorno. Senza luci nuove (cambierebbero tutti i materiali della città): la conca dell'abside d'oro che brilla da sé, le finestre alte accese,
     i raggi che ne scendono (lastre trasparenti che si sommano alla scena), lampade appese sulla navata e candele sulla pergula e attorno all'altare come punti di luce con l'alone,
     un bagliore caldo sul gruppo davanti alla confessione, e un poco di luce propria dei muri (emissivo) perché niente resti al buio. */
  var cupola=new THREE.Mesh(new THREE.SphereGeometry(.84,20,8,-Math.PI/2,Math.PI,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xd9b153,emissive:0x8a5e18,emissiveIntensity:.5,metalness:.35,roughness:.45,side:THREE.DoubleSide}));
  cupola.position.set(X0-5.75,Y+1.4,Z0); cupola.visible=false; RM.scene.add(cupola);      // la conca dell'abside, dorata come i mosaici a fondo d'oro
  /* L'alone dei lumi, delle pozze di luce sul pavimento e della corona. Fino al 25 novembre 2026 era un gradiente disegnato su una tela 2D: Safari lo disegna con un retino
     diverso per rosso, verde e blu, e sui bordi quasi trasparenti, riportati a colore pieno, quel retino diventava rumore colorato; ingrandito cinquanta volte sul pavimento
     faceva le chiazze iridescenti viste sull'iPhone (sul PC il gradiente non ha retino). Ora i pixel si calcolano qui: bianco pieno, la trasparenza scende liscia. */
  var alone=(function(){ var N=128, d=new Uint8Array(N*N*4), i, j;
    for(j=0;j<N;j++) for(i=0;i<N;i++){ var r=Math.hypot(i+.5-N/2,j+.5-N/2)/(N/2), a=r>=1?0:(r<.25?1-1.8*r:.55*(1-r)/.75), k=(j*N+i)*4;      // come il gradiente di prima: 1 al centro, 0,55 a un quarto, 0 al bordo
      d[k]=d[k+1]=d[k+2]=255; d[k+3]=Math.round(255*Math.max(0,Math.min(1,a))); }
    var t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat); t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.needsUpdate=true; return t; })();
  function lumi(P3,sz,col){ var gq=new THREE.BufferGeometry(); gq.setAttribute('position',new THREE.Float32BufferAttribute(P3,3));
    var m=new THREE.Points(gq,new THREE.PointsMaterial({size:sz,map:alone,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,opacity:0}));
    m.frustumCulled=false; m.visible=false; RM.scene.add(m); return m; }
  var pL=[], pC=[];
  for(i=0;i<13;i++) [-.62,.62].forEach(function(s){ pL.push(X0-3.4+i*.7,Y+.98,Z0+s); });      // le lampade appese sulla navata
  [-3.3,-2.4,2.4,3.3].forEach(function(s){ pL.push(X0-4.85,Y+.95,Z0+s); });                      // e nel transetto
  for(i=0;i<12;i++) pC.push(X0-5.3,Y+.54,Z0-.75+i*1.5/11);                                        // candele sull'architrave della pergula
  pC.push(X0-5.58,Y+.19,Z0-.08, X0-5.58,Y+.19,Z0+.08);                                             // sull'altare
  [-1,1].forEach(function(s){ for(i=0;i<4;i++) pC.push(X0-6.15+i*.28,Y+.32,Z0+s*1.02); });          // candelabri attorno al presbiterio
  var lampade=lumi(pL,.3,0xffb85e), candele=lumi(pC,.17,0xffc870), fiamme=lumi(pL.concat(pC),.05,0xfff2c8);
  /* i 1365 lumi del faro (vita di Adriano I, 46: «habentem candelas mille CCCLXV»), lungo i bracci della croce in tre file e attorno al centro; e il suo alone */
  var pF=[], q3=0; while(pF.length<1365*3){ var bz=q3%2, tq=((q3*.618034)%1)*2-1, fila=((q3/2)|0)%3-1, rr=.46*tq; q3++;
    pF.push(FARO[0]+(bz?fila*.02:rr), FARO[1]+.03, FARO[2]+(bz?rr:fila*.02)); }
  var faroLumi=lumi(pF,.022,0xffd890), faroAlone=lumi([FARO[0],FARO[1],FARO[2], FARO[0]+.32,FARO[1],FARO[2], FARO[0]-.32,FARO[1],FARO[2], FARO[0],FARO[1],FARO[2]+.32, FARO[0],FARO[1],FARO[2]-.32],.7,0xffb860);
  /* i raggi: da ogni finestra della navata, nella direzione del sole della scena (js/base.js: da ovest-nord-ovest, alto 28 gradi), fino al pavimento */
  var RP=[], RC=[], D3=[.86,-.47,.24];
  for(i=0;i<11;i++){ var wx=X0-3.3+i*.85, wy=Y+1.5, wz=Z0-1.1, L=1.5/.47, bx=wx+D3[0]*L, bz=wz+D3[2]*L;
    [[.15,0],[0,.2]].forEach(function(w){ var a=[wx-w[0],wy-w[1],wz], b=[wx+w[0],wy+w[1],wz], c=[bx+w[0]*1.6,Y+w[1]*1.6,bz], d=[bx-w[0]*1.6,Y-w[1]*1.6+.01,bz];
      RP.push.apply(RP,a.concat(b,c,a,c,d)); var t=[.5,.38,.2], o=[0,0,0]; RC.push.apply(RC,t.concat(t,o,t,o,o)); }); }
  var gR=new THREE.BufferGeometry(); gR.setAttribute('position',new THREE.Float32BufferAttribute(RP,3)); gR.setAttribute('color',new THREE.Float32BufferAttribute(RC,3));
  var raggi=new THREE.Mesh(gR,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  raggi.frustumCulled=false; raggi.visible=false; RM.scene.add(raggi);
  var bagliore=new THREE.Sprite(new THREE.SpriteMaterial({map:alone,color:0xffcf78,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  bagliore.position.set(X0-5.35,Y+.45,Z0); bagliore.scale.set(2.6,2.6,1); bagliore.visible=false; RM.scene.add(bagliore);
  var pozza=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:alone,color:0xffd58a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  pozza.position.set(X0-5.05,Y+.014,Z0+.1); pozza.visible=false; RM.scene.add(pozza);      // la luce sul gruppo davanti alla confessione
  var pozzaF=pozza.clone(); pozzaF.material=pozza.material.clone(); pozzaF.scale.setScalar(1.5); pozzaF.position.set(FARO[0],Y+.013,FARO[2]); RM.scene.add(pozzaF);      // la luce del faro sul pavimento
  var luccichio=new THREE.Sprite(new THREE.SpriteMaterial({map:alone,color:0xffe7a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  luccichio.scale.set(.16,.16,1); luccichio.visible=false; RM.scene.add(luccichio);      // l'alone della corona
  /* il soffitto a capriate: travi di legno sotto i tetti, che si vedono quando i tetti sono spariti e si dissolvono per ultime (misure e passo sono schema) */
  var BT=new RM.Costruttore(), legno=RM.col(0x6e4c30);
  for(i=0;i<22;i++){ var xc=X0-3.75+i*.44, yb=gy+3.3; fune(BT,[xc,yb,Z0-1.25],[xc,yb,Z0+1.25],.06,legno); fune(BT,[xc,yb,Z0-1.25],[xc,gy+3.98,Z0],.05,legno); fune(BT,[xc,yb,Z0+1.25],[xc,gy+3.98,Z0],.05,legno); fune(BT,[xc,yb,Z0],[xc,gy+3.98,Z0],.035,legno); }
  fune(BT,[X0-3.8,gy+3.98,Z0],[X0+5.6,gy+3.98,Z0],.05,legno);
  var capriate=BT.maglia(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,transparent:true,opacity:1})); capriate.visible=false; RM.scene.add(capriate);
  var effetti=[finestre,cupola,lampade,candele,fiamme,raggi,bagliore,pozza,pozzaF,luccichio,capriate,faroLumi,faroAlone];
  [g,corona,piediFolla].concat(mobili,effetti).forEach(function(m){ m.userData.noZona=true; }); folla.forEach(function(F){ MAGLIE.forEach(function(t){ F[t].userData.noZona=true; }); });      // tutto dentro la basilica: i passanti di js/vita.js non devono girarci attorno (si veda zoneScene)
  /* la scritta dell'acclamazione, in sovrimpressione: entra ed esce col ritmo, in alto (sopra la navata, non sui volti) */
  var scritta=null;
  function sovra(testo,a){
    if(!scritta){ var riq=document.querySelector('.riquadro.roma'); if(!riq) return; scritta=document.createElement('div'); scritta.setAttribute('aria-live','polite');
      var tl=window.innerWidth<700;
      scritta.style.cssText='position:absolute;left:50%;top:'+(tl?'64px':'9%')+';transform:translateX(-50%);z-index:4;pointer-events:none;width:'+(tl?'88%':'72%')+';text-align:center;'+
        'font-family:"EB Garamond",Garamond,Georgia,serif;font-style:italic;font-size:'+(tl?'21px':'31px')+';line-height:1.25;color:#fff3d2;letter-spacing:.01em;'+
        'text-shadow:0 2px 10px rgba(30,15,5,.95),0 0 26px rgba(30,15,5,.75);opacity:0;transition:opacity .25s linear';
      riq.appendChild(scritta); }
    if(scritta.textContent!==testo){ scritta.textContent=testo; if(window.innerWidth<700) scritta.style.top=sottoConta(64,0)+'px'; } scritta.style.opacity=String(Math.max(0,Math.min(1,a)));
  }
  var minPrima=16;
  function mostra(on){
    if(on===acceso) return; acceso=on; g.visible=on; corona.visible=on; mobili.forEach(function(m){ m.visible=on; }); effetti.forEach(function(m){ m.visible=on; });
    folla.forEach(function(F){ MAGLIE.forEach(function(t){ F[t].visible=on; }); }); piediFolla.visible=false; firmaPop=''; if(on) popolo(0);
    var et=document.querySelector('.etichette3d'); if(et) et.style.display=on?'none':'';      // dentro la basilica i nomi dei monumenti lontani (visti attraverso il taglio) non servono e coprirebbero la scena
    if(on){ giroPrima=!!RM.senzaGiro; RM.senzaGiro=true; if(RM.controlli){ RM.controlli.autoRotate=false; minPrima=RM.controlli.minDistance; RM.controlli.minDistance=.4; } }      // da vicino il dondolio lento della città (js/base.js) sposterebbe l'inquadratura: fermo finché si sta dentro
    else { RM.senzaGiro=giroPrima; if(RM.controlli) RM.controlli.minDistance=Math.max(RM.controlli.minDistance,minPrima); if(scritta) scritta.style.opacity='0';
      if(RM.camera && nearPrima!=null){ RM.camera.near=nearPrima; RM.camera.updateProjectionMatrix(); nearPrima=null; }
      LUMI800.uLumeC.value[0].setRGB(0,0,0); LUMI800.uLumeC.value[1].setRGB(0,0,0); LUMI800.uPen.value=1; }
    if(RM.renderer) RM.renderer.shadowMap.needsUpdate=true;
  }
  /* Il piano vicino della camera sta a 2 unità (20 m, js/base.js): da lì in qua non si disegna nulla, e i primi piani (4-6 m) non si potevano fare. Finché si sta dentro
     la basilica scende con la distanza dal punto guardato (un ottavo, fra 30 cm e 2 unità); le passate degli effetti leggono quello vero (aggancio in RM.post.disegna). */
  var nearPrima=null, mInv=new THREE.Matrix4();
  RM.frame.push(function(){
    if(!acceso || !RM.camera) return;
    if(nearPrima==null) nearPrima=RM.camera.near;
    var dc=RM.controlli?RM.camera.position.distanceTo(RM.controlli.target):20, nv=Math.max(.03,Math.min(nearPrima,dc*.125));
    if(Math.abs(nv-RM.camera.near)>1e-4){ RM.camera.near=nv; RM.camera.updateProjectionMatrix(); }
    RM.camera.updateMatrixWorld(); var mi=mInv.copy(RM.camera.matrixWorld).invert();
    LUMI800.uLumeV.value[0].set(FARO[0],FARO[1],FARO[2]).applyMatrix4(mi); LUMI800.uLumeV.value[1].set(X0-5.45,Y+.42,Z0).applyMatrix4(mi);
  });
  function liscio(a,b,u){ return RM.sfuma(a,b,u); }
  var pos={carlo:[CX,Y,CZ], papa:[X0-5.17,Y,CZ], figlio:[X0-4.92,Y,CZ-.42]},      /* il figlio a nord di Carlo (25 novembre 2026, sera; prima a sud, dove ora sta la camera dei primi piani): il posto è schema */ GIU=.05-.008, tel0=window.innerWidth<700;
  /* u: secondi dentro il secondo tempo (la regia in carlo800). Le azioni, dalle fonti: Carlo prega davanti alla confessione e si alza (Annali), il papa gli posa la corona
     con le sue mani (Annali, Liber Pontificalis), i Romani acclamano tre volte (Liber Pontificalis), il papa gli rende omaggio (Annali: il gesto non è descritto, qui in ginocchio),
     il papa unge re il figlio (Liber Pontificalis). Tempi e pose sono schema. */
  /* 25 novembre 2026, sera: i tre protagonisti sono figure con le giunture (ritratto, più sopra). Carlo prega in ginocchio a mani giunte e si alza (13,3-14,6); il papa,
     con la corona fra le mani, fa un passo (14,0-14,7), la alza sopra il capo di Carlo (14,6-15,6) e la posa (15,6-16,9): le mani seguono la corona; Carlo china appena il capo.
     L'omaggio: il papa in ginocchio (26,4-28,0, schema); l'unzione: la destra del papa sul capo del figlio (28,9-30,3). */
  var CP=new THREE.Vector3(), CA=new THREE.Vector3(), MA=new THREE.Vector3(), MB=new THREE.Vector3(), PQ=new THREE.Vector3(), V0=new THREE.Vector3();
  var PX0=X0-5.17, PXC=CX-.05, rC0=-Math.PI/2;      // 26 novembre 2026, sera: il papa mezzo metro davanti a Carlo (prima 58 cm: con la corona alzata le mani non ci arrivavano e la corona restava sospesa da sola)
  function posa(u){
    var su=liscio(13.3,14.6,u), avanti=liscio(14.0,14.7,u), alFiglio=liscio(28.2,28.8,u), ingin=liscio(26.4,27.0,u)*(1-liscio(27.6,28.1,u));
    var px=PX0+(PXC-PX0)*avanti*(1-alFiglio)+(pos.figlio[0]-.058-PX0)*alFiglio, pz=CZ+(pos.figlio[2]-CZ)*alFiglio; pos.papa=[px,Y,pz];
    /* il figlio, fermo in piedi a mani giunte; china il capo all'unzione */
    rF.g.position.set(pos.figlio[0],Y,pos.figlio[2]); rF.g.rotation.y=rC0; rF.g.updateMatrixWorld(true); rF.piedi.position.set(pos.figlio[0],Y,pos.figlio[2]);
    var ung=liscio(28.6,29.2,u)*(1-liscio(30.3,30.9,u));
    function inFig(r,v,x,y,z){ return v.set(x,y,z).applyMatrix4(r.g.matrixWorld); }      // un punto in metri, nel riferimento della figura (piedi a terra, sguardo verso +z), nel mondo
    rF.posa({chino:.28*ung, mani:{d:inFig(rF,MA,-.03,1.02,.2), s:inFig(rF,MB,.03,1.02,.2)}});
    rF.capo(PQ);
    /* Carlo: a mani giunte davanti al petto finché si alza, poi le braccia lungo i fianchi */
    rC.g.position.set(CX,Y,CZ); rC.g.rotation.y=rC0; rC.g.updateMatrixWorld(true); rC.piedi.position.set(CX,Y,CZ);
    var chinoC=.3*(1-liscio(13.3,14.2,u))+.24*liscio(15.3,15.9,u)*(1-liscio(16.9,17.6,u)), yG=.88+.4*su;
    rC.posa({k:1-su, chino:chinoC, mani:u<14.3?{d:inFig(rC,MA,-.025,yG,.24), s:inFig(rC,MB,.025,yG,.24)}:{}});
    rC.capo(CA); pos.carlo=[CX,CA.y-.02,CZ];
    /* la corona: fra le mani del papa davanti al petto, poi sopra il capo di Carlo, poi giù; posata, segue il capo */
    rP.g.position.set(px,Y,pz); rP.g.rotation.y=Math.PI/2; rP.g.updateMatrixWorld(true); rP.piedi.position.set(px,Y,pz);
    var su1=liscio(14.6,15.6,u), giu1=liscio(15.6,16.9,u);
    inFig(rP,V0,0,1.2,.3);                                                                                  // davanti al petto del papa
    if(u<14.6) CP.copy(V0);
    else if(u<15.6) CP.copy(V0).lerp(MA.copy(CA).setY(CA.y+.012),su1);
    else CP.copy(CA).setY(CA.y+.012*(1-giu1));      // alzata 12 cm sopra il capo (prima 30: fuori dalla portata delle braccia del papa)
    if(u>=16.9) CP.copy(CA);
    corona.position.copy(CP); corona.position.y-=.0025; corona.rotation.set(0,rC0,0);
    var tieneCor=u<17.0, unge=u>=28.9&&u<30.3, giunteP=ingin>.3, yP=1.3-.42*ingin;
    var mP={};
    if(tieneCor){ MA.set(0,0,.1*.107*.95).add(CP); MB.set(0,0,-.1*.107*.95).add(CP); mP={d:MA, s:MB}; }      // le mani ai due lati della corona (il papa guarda verso +x: la sua destra è a +z)
    else if(giunteP){ mP={d:inFig(rP,MA,-.025,yP,.24), s:inFig(rP,MB,.025,yP,.24)}; }
    else if(unge) mP={d:MA.copy(PQ).setY(PQ.y+.004)};
    rP.posa({k:ingin, chino:.38*ingin+.08*liscio(15.4,16.2,u)*(1-liscio(17,17.6,u)), busto:.12*ingin, mani:mP, guarda:(unge||ingin>.5)?null:CA});
    popolo(u);
    /* la luce: si accende quando il tetto si apre; il bagliore sul gruppo cresce nel momento della corona */
    var k=kT, cal=liscio(.15,.6,k), pic=liscio(14.6,16.9,u)*(1-liscio(19,21,u));
    g.material.emissive.setRGB(.05,.032,.014).multiplyScalar(cal); cupola.material.emissiveIntensity=.25+.75*cal;
    lampade.material.opacity=.85*cal; candele.material.opacity=cal; fiamme.material.opacity=cal; raggi.material.opacity=.5*cal; faroLumi.material.opacity=cal; faroAlone.material.opacity=.55*cal*(.92+.08*Math.sin(u*3.1));
    bagliore.material.opacity=cal*(.05+.1*pic); pozza.material.opacity=cal*(.06+.1*pic);      /* (25 novembre 2026, sera, secondo giro: il gruppo restava troppo chiaro rispetto alla navata in penombra) */ pozzaF.material.opacity=.14*cal;      /* meno bagliore (25 novembre 2026, sera): sommato alla penombra schiariva il pavimento fino al bianco */ argento.visible=acceso;
    var CL=LUMI800.col; LUMI800.uLumeC.value[0].setRGB(CL[0],CL[1],CL[2]).multiplyScalar(cal); LUMI800.uLumeK.value[0]=.9;      // il faro
    LUMI800.uLumeC.value[1].setRGB(CL[3],CL[4],CL[5]).multiplyScalar(cal*(.7+.4*pic)); LUMI800.uLumeK.value[1]=3;      // le candele della pergula e dell'altare (più deboli dal secondo giro: il gruppo non deve staccarsi chiaro dalla navata)
    LUMI800.uPen.value=1-.7*cal;      // la penombra delle persone lontane dai lumi, come i muri e il pavimento
    if(SPENTI800.lumi){ LUMI800.uLumeC.value[0].setRGB(0,0,0); LUMI800.uLumeC.value[1].setRGB(0,0,0); bagliore.visible=pozza.visible=pozzaF.visible=luccichio.visible=faroAlone.visible=false; }      // la prova senza lumi (js/prova-scena.js, &lumi=0)
    var luc=liscio(16.6,17.2,u)*(1-liscio(18.4,19.6,u)); luccichio.visible=luc>.01; luccichio.material.opacity=luc*(.8+.2*Math.sin(u*9)); luccichio.position.copy(corona.position); luccichio.scale.setScalar(.05+.05*luc);
    capriate.material.opacity=1-liscio(.55,.85,k); capriate.visible=capriate.material.opacity>.02; capriate.material.depthWrite=capriate.material.opacity>.98;
    /* l'acclamazione in sovrimpressione: prima la frase intera, poi «tre volte» */
    var a1=liscio(18.2,18.9,u)*(1-liscio(22.0,22.6,u)), a2=liscio(22.6,23.2,u)*(1-liscio(24.6,25.1,u));
    if(a1>.001) sovra(tel0?'«A Carlo augusto, incoronato da Dio… vita e vittoria!»':'«A Carlo augusto, incoronato da Dio, grande e pacifico imperatore dei Romani, vita e vittoria!»',a1);
    else if(a2>.001) sovra('«…vita e vittoria!» — tre volte',a2); else if(scritta && scritta.style.opacity!=='0') scritta.style.opacity='0';
  }
  /* ---- la regia dentro la basilica: inquadrature in coordinate locali (x verso la facciata, z verso sud) e quota sul pavimento; [camera, punto guardato] ----
     sul telefono in piedi le inquadrature vicine e larghe si allontanano lungo la stessa linea (RM.fattoreVista) e guardano un poco più in basso: il soggetto sale nella metà alta.
     Le chiavi della navata no: allontanate, finirebbero dietro la facciata. */
  function W3(q){ return [X0+q[0],Y+q[1],Z0+q[2]]; }
  function adatta(c,t,lontano){ var a=RM.camera&&RM.camera.aspect||1; if(a>=.85) return [c,t];
    var k=lontano?(lontano===2?Math.min(1.3,RM.fattoreVista()):RM.fattoreVista()):1, c2=[t[0]+(c[0]-t[0])*k,t[1]+(c[1]-t[1])*k,t[2]+(c[2]-t[2])*k], d=Math.hypot(c2[0]-t[0],c2[1]-t[1],c2[2]-t[2]);
    return [c2,[t[0],t[1]-d*.16,t[2]]]; }
  /* Il piano vicino della camera sta a 2 unità (20 m, js/base.js): ogni inquadratura tiene il pavimento in basso nel quadro oltre quella distanza, se no lo si vede bucato */
  /* 25 novembre 2026, sera: con il piano vicino che scende (più sopra) la vista arriva a pochi metri dai protagonisti. Le chiavi nuove:
     p1 Carlo in ginocchio, da davanti e di lato, dietro la pergula; p2 di profilo, da sud, il papa che alza e posa la corona; p3 il volto di Carlo incoronato, da sopra la spalla
     del papa; g l'omaggio di profilo; h l'unzione del figlio. Le chiavi «a» e «b» scendono nella navata, «c» e «d» finiscono davanti alla pergula, «e» è il campo largo
     dall'abside, più basso di prima (le braccia alzate si leggono contro la navata). */
  var K={a:[[4.8,4.3,2.6],[-2,.5,0]], b:[[3.2,1.55,.15],[-3.4,.6,0]], c:[[-2.4,1.2,.9],[-5,.3,.05]], d:[[-4.1,.75,1.25],[-5.08,.12,.05]],
         p1a:[[-5.27,.17,.4],[-4.99,.075,0]], p1b:[[-5.25,.17,.33],[-4.99,.1,0]],
         p2a:[[-4.86,.215,.56],[-5.02,.165,0]], p2b:[[-4.89,.205,.43],[-5.02,.175,0]],
         p3a:[[-5.29,.215,-.22],[-4.985,.175,0]], p3b:[[-5.22,.205,-.145],[-4.985,.178,0]],
         m1:[[-5.3,.75,.9],[-4.4,.2,0]], e:[[-5.32,.36,.5],[-3.9,.1,-.6]], et:[[-4.75,.42,.55],[-2.6,.05,-.3]],
         g:[[-4.95,.2,.62],[-5.02,.1,0]], g2:[[-4.96,.19,.57],[-5.02,.1,0]], h:[[-5.17,.21,-.86],[-4.96,.13,-.4]]};      // et: il campo largo sul telefono, più alto e non allontanato (allontanato, l'arco trionfale copriva la navata)
  /* Il telefono in piedi (25 novembre 2026; l'utente, dall'iPhone: nell'omaggio «non si vede il papa e Carlo ma gente qualunque della folla in primo piano»). Prima le chiavi
     del PC si allontanavano lungo la stessa linea e guardavano più in basso: il riquadro del telefono è stretto (17 gradi di larghezza) e in più la scena sale di metà
     della linea del tempo (RM.sposta): i protagonisti finivano sotto la riga del tempo o fuori, e nel campo largo la camera stava fra i Franchi.
     Ora ogni tempo ha sul telefono un'inquadratura calcolata: i punti dei protagonisti di quel tempo (piedi, capo, mani alzate), il lato da cui si guarda (az, verso la camera)
     e l'altezza dello sguardo (el, gradi); distanza e punto guardato si cercano perché quei punti stiano, con la proiezione vera della camera, fra la riga del tempo
     e la didascalia (dal 13% al 60% dell'altezza) e dentro la larghezza. c: una camera fissa (si cerca solo dove guardare). Nessuno sta fra la camera e loro: le direzioni
     passano fra il clero del presbiterio e le file dei Franchi (controllato con le catture a 393 x 852 e 375 x 812). */
  var KT={
    p1a:{s:[[-4.98,0,0],[-4.92,0,0],[-4.98,.2,0],[-5.17,0,0],[-5.17,.19,0],[-5.04,.16,.03]], az:[-.25,1], el:5, d:1},      // Carlo in ginocchio e il papa davanti a lui, da sud-ovest: il volto di Carlo
    p1b:{s:'p1a', az:[-.25,1], el:5, d:.93},
    p2a:{s:[[-4.95,0,0],[-5.08,0,0],[-4.98,.235,0],[-5.04,.225,0]], az:[0,1], el:4, d:1},      // la corona, di profilo da sud
    p2b:{s:'p2a', az:[0,1], el:4, d:.94},
    p3a:{s:[[-4.98,.13,0],[-4.98,.225,0],[-5.04,.15,-.02],[-4.95,.15,.02]], az:[-.8,-.58], el:6, d:1, giu:.5},      // il volto di Carlo incoronato, sopra la spalla del papa
    p3b:{s:'p3a', az:[-.8,-.58], el:6, d:.93, giu:.5},
    et:{s:[[-3.4,0,-.9],[-3.4,0,.9],[3,.2,-.9],[3,.2,.9],[-3.4,.2,0]], c:[-4.5,.3,0]},      // il campo largo dell'acclamazione: la camera sopra i Franchi, la navata che acclama davanti (i Franchi restano sotto, dietro la didascalia)
    et2:{s:'et', c:[-4.42,.31,0]},
    g:{s:[[-5.12,0,0],[-4.96,0,0],[-5.04,.15,0],[-4.98,.225,0]], az:[0,1], el:5, d:1},      // l'omaggio, di profilo da sud: il papa in ginocchio davanti a Carlo
    g2:{s:'g', az:[0,1], el:5, d:.94},
    h:{s:[[-4.978,0,-.42],[-4.92,0,-.42],[-4.978,.195,-.42],[-4.92,.2,-.42],[-4.95,.21,-.42]], az:[-.15,-1], el:5, d:1} };      // l'unzione, da nord: il papa e il figlio
  var CAM2=new THREE.PerspectiveCamera(), PV=new THREE.Vector3();
  function telefono(){ return RM.camera && RM.camera.aspect<.85; }
  function quadroTel(n){
    var k=KT[n], P=[]; (typeof k.s==='string'?KT[k.s].s:k.s).forEach(function(q){ [[0,0],[.028,0],[-.028,0],[0,.028],[0,-.028]].forEach(function(o){ P.push(new THREE.Vector3(X0+q[0]+(k.c?0:o[0]),Y+q[1],Z0+q[2]+(k.c?0:o[1]))); }); });      // ogni punto con la larghezza di un corpo attorno
    var y0=.13, y1=k.giu?Math.min(.6,y0+k.giu):.6, x0=.08, x1=.92;      // la parte libera del riquadro, in frazioni dello schermo
    var M=new THREE.Vector3(); P.forEach(function(q){ M.add(q); }); M.divideScalar(P.length);
    CAM2.copy(RM.camera); var T=M.clone(), C=new THREE.Vector3(), dist=1, i;
    function misura(){ CAM2.position.copy(C); CAM2.lookAt(T); CAM2.updateMatrixWorld(true); var b=[1e9,1e9,-1e9,-1e9];
      P.forEach(function(q){ PV.copy(q).project(CAM2); var x=(PV.x+1)/2, y=(1-PV.y)/2; b[0]=Math.min(b[0],x); b[1]=Math.min(b[1],y); b[2]=Math.max(b[2],x); b[3]=Math.max(b[3],y); }); return b; }
    if(k.c){ C.set(X0+k.c[0],Y+k.c[1],Z0+k.c[2]); }
    else { var az=new THREE.Vector2(k.az[0],k.az[1]).normalize(), e=k.el*Math.PI/180; dist=.6; }
    for(i=0;i<12;i++){
      if(!k.c) C.set(M.x+az.x*Math.cos(e)*dist,M.y+Math.sin(e)*dist,M.z+az.y*Math.cos(e)*dist);
      var b=misura(), f=Math.max((b[3]-b[1])/(y1-y0),(b[2]-b[0])/(x1-x0));
      if(!k.c) dist*=Math.max(.5,Math.min(2,f));
      var dy=((b[1]+b[3])/2-(y0+y1)/2)*2*Math.tan(CAM2.fov*Math.PI/360)*C.distanceTo(T);      // quanto spostare il punto guardato in quota perché il gruppo stia al centro della parte libera
      T.y-=dy; }
    if(!k.c){ dist*=k.d||1; C.set(M.x+az.x*Math.cos(e)*dist,M.y+Math.sin(e)*dist,M.z+az.y*Math.cos(e)*dist); }
    return {c:[C.x,C.y,C.z], t:[T.x,T.y,T.z]}; }
  function chiave(n,lontano){
    if(telefono() && KT[n]) return quadroTel(n);
    var q=K[n]||K[KT[n]&&typeof KT[n].s==='string'?KT[n].s:'g'], t=q[1].slice();
    if(n==='d') t[0]-=telefono()?.05:.2;      // il gruppo un poco a destra del centro
    var r=adatta(W3(q[0]),W3(t),lontano); return {c:r[0],t:r[1]}; }
  function ripresa(n1,n2,dur,lon){      // uno stacco sulla chiave n1, poi la camera scivola piano fino a n2 (carrello)
    var a=chiave(n1,lon==null?2:lon), b=chiave(n2,lon==null?2:lon);
    RM.segui(function(k){ var s=k*(2-k)*.5+k*.5, c=[0,0,0], t=[0,0,0]; for(var j=0;j<3;j++){ c[j]=a.c[j]+(b.c[j]-a.c[j])*s; t[j]=a.t[j]+(b.t[j]-a.t[j])*s; } return {c:c, t:t}; },dur);
  }
  function cammino(nomi,dur,lontani){      // da dove si è ora, lungo una curva liscia per le chiavi date
    var C0=RM.camera.position, T0=RM.controlli?RM.controlli.target:new THREE.Vector3(), PC=[C0.clone()], PT=[T0.clone()];
    nomi.forEach(function(n,i){ var q=chiave(n,lontani&&lontani[i]); PC.push(new THREE.Vector3(q.c[0],q.c[1],q.c[2])); PT.push(new THREE.Vector3(q.t[0],q.t[1],q.t[2])); });
    var cc=new THREE.CatmullRomCurve3(PC,false,'centripetal'), ct=new THREE.CatmullRomCurve3(PT,false,'centripetal'), v1=new THREE.Vector3(), v2=new THREE.Vector3();
    RM.segui(function(k){ var s=k*k*(3-2*k); cc.getPoint(s,v1); ct.getPoint(s,v2); return {c:[v1.x,v1.y,v1.z], t:[v2.x,v2.y,v2.z]}; },dur);
  }
  function fermo(n,lontano){ var q=chiave(n,lontano); RM.segui(function(){ return q; },.05); }      // senza movimento (meno animazioni)
  var VE=mira(X0-1,Z0,[X0+20,gy+24,Z0+24]);      // da sud-est, sopra la basilica: il tetto, poi l'interno che si scopre
  var regia={ discesa:function(){ cammino(['a','b','c','d'],7.8,[0,0,0,1]); },
              preghiera:function(){ ripresa('p1a','p1b',1.9); }, corona:function(){ ripresa('p2a','p2b',2.4); }, volto:function(){ ripresa('p3a','p3b',1.5,0); },
              largo:function(){ if(telefono()) ripresa('et','et2',6.5); else cammino(['m1','e'],2.4,[1,1]); },      // sul telefono uno stacco: la strada da Carlo alla navata passava sopra le teste
              omaggio:function(){ ripresa('g','g2',3); }, unzione:function(){ cammino(['h'],1.3,[2]); }, fermo:fermo };      // l'omaggio con uno stacco (25 novembre 2026): prima la camera ci arrivava in 1,8 secondi, e la riga «L'omaggio del papa» compariva sul campo largo della folla
  /* Prima che la scena parta: i programmi della scheda grafica per tutto ciò che compare solo dentro la basilica (pavimento, figure, lumi, raggi, corona) si preparano subito,
     mentre la vista vola sui gradini (25 novembre 2026). Prima si compilavano al primo fotogramma in cui comparivano, a scena in corso: sull'iPhone un fotogramma da un
     decimo di secondo e più quando il tetto si apre e a ogni cosa nuova. */
  var compilato=false;
  function compila(){
    if(compilato || acceso || !RM.renderer || !RM.renderer.compile) return; compilato=true;
    var L=[g,finestre,corona].concat(mobili,effetti), prima=L.map(function(m){ return m.visible; }), pf=[];
    var conTaglio=[pie.g].concat(teg?[teg]:[]);      // 27 novembre 2026, notte: anche San Pietro e le tegole col taglio (i piani che aprono il tetto): il loro programma con i due piani nasceva all'entrata nella basilica, un fermo di un secondo sul banco; ora nasce qui, al primo passo (provato e scartato: il taglio dentro lo shader dei monumenti, che rendeva quattro volte più lenta la compilazione di tutti i loro programmi su Direct3D)
    folla.forEach(function(F){ MAGLIE.forEach(function(t){ pf.push([F[t],F[t].visible]); F[t].visible=true; }); });
    L.forEach(function(m){ m.visible=true; });
    try{ if(RM.prepara) RM.prepara(conTaglio.concat(L,pf.map(function(q){ return q[0]; })),true); else RM.renderer.compile(RM.scene,RM.camera); }catch(e){}      // 27 novembre 2026, notte: renderer.compile preparava i programmi di tutta la scena con chiavi diverse da quelle del disegno (sul banco 1,2 secondi di compilazioni che poi non servivano, e quelle vere arrivavano lo stesso dentro la scena): ora si disegnano davvero, una volta, solo queste cose (RM.prepara in js/base.js)
    L.forEach(function(m,i){ m.visible=prima[i]; }); pf.forEach(function(q){ q[0].visible=q[1]; }); }
  return {mostra:mostra, taglio:taglio, posa:posa, VE:VE, regia:regia, compila:compila, pos:pos, Y:Y, X0:X0, Z0:Z0, chiave:chiave, ritratti:{carlo:rC, papa:rP, figlio:rF}, corona:corona, attivo:function(){ return acceso; }, k:function(){ return kT; }};
})();
var carlo800=(function(){
  var B=new RM.Costruttore(), i, x, z, e=Math.PI/2, Z=-108.1, franco=RM.col(0x3e5f7a), zA=V800.zAsse, CO=V800.CORSIA;      // e: rivolti a est, verso chi arriva
  INVERNO=true;      // 24 novembre: la folla col mantello
  /* le persone (24 novembre 2026): prima il papa e il clero sui gradini, poi Carlo, le bandiere e i capi, poi il seguito, poi i gruppi lungo il portico.
     I gradini (24 novembre 2026, sanPietro in js/monumenti.js): tre gradini larghi 3 m davanti ai fornici dell'atrio, da x -247,28 a -246,38, alti 3, 2 e 1 m, sopra il sagrato
     lastricato (70 cm). Prima il clero stava fra x -247,9 e -247,24, cioè per tre quarti dentro il muro dei fornici, e a 70 cm sopra il suolo: si vedevano le teste. Ora le quattro
     file stanno sui tre gradini, ognuna alla quota del suo gradino letta dalla geometria (quotaSu), e lasciano libero in mezzo il passaggio per cui sale Carlo. */
  vicine(B,'800',[-247,-108],function(){
  for(i=0;i<36;i++){ var zr=-1.9+(i>>2)*.42; x=-247.16+(i%4)*.22; z=Z+zr+(zr<0?-.25:.25)+(rnd()-.5)*.1; uomo(B,x,z,quotaSu('pietro',x,z),i<8?C.oro:C.bianco,null,e,'clero'); }      // vescovi e clero
  var yp=quotaSu('pietro',-247.1,Z); uomo(B,-247.1,Z,yp,C.oro,null,e,'papa'); insegna(B,-247.1,Z-.22,quotaSu('pietro',-247.1,Z-.22),C.oro,.45);                              // il papa e la croce
  },0,true);
  var SAG=quotaSu('pietro',-244,-108), GRAD=[];      // il piano del sagrato; le quote lungo la salita di Carlo, da x -245,6 a -247
  for(i=0;i<=28;i++) GRAD.push(quotaSu('pietro',-245.6-i*.05,-108.1));
  function sulSagrato(x,z){ return (x>-248 && x<-242.6 && Math.abs(z+108)<3.6)?SAG:-1e9; }
  function salita(x){ var k=Math.round((-245.6-x)/.05); return k<0?SAG:GRAD[Math.min(28,k)]; }
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
  /* il corteo, a istanze; via(t,lat) dà punto e verso lungo il percorso. Carlo nella tunica blu che la scena gli dava, a piedi con un mantello di lana di colore sobrio
     (Eginardo, Vita Karoli 23, riletto il 25 novembre 2026: il mantello blu è l'abito comune, ma in quale giorno a Roma vestisse alla romana non è detto), a capo scoperto: niente corona il 24 novembre */
  var via=spezzata(V800.L), LUN=via(0).lung, D=108.8, FINE=24, VIAGGIO=20;
  CAV_LEGGERO=true;      // il seguito: cavallo leggero, priorità davanti alla folla lungo il portico, anche sui telefoni (26 novembre 2026, sera: come pedine erano i «blocchi» che scivolavano)
  var cav=[istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,C.ferro); },35,'800','seguito',2,null,true), istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloC,C.ferro); },35,'800','seguito',2,null,true)];
  var capi=istanze(function(B){ cavaliere(B,0,0,0,0,C.cavalloB,franco); },8,'800','capi',2,null,true);
  CAV_LEGGERO=false;      // qualche cavaliere dei Franchi in blu, come prima
  var band=[C.rosso,C.oro,C.bianco,C.porpora].map(function(col){ return istanze(function(B){ uomo(B,0,0,0,C.tunica,null,0); bandiera(B,.03,0,0,col,.55); },2,'800','bandiere',1,null,true); });
  var re=istanze(function(B){ cavaliere(B,0,0,0,0,C.bianco,franco); },1,'800','carlo',1,null,true), cavallo=istanze(function(B){      // il cavallo, senza cavaliere
    B.scatola(.055,.085,.025,0,0,.08,C.bianco).scatola(.055,.085,.025,0,0,-.08,C.bianco).scatola(.06,.07,.22,0,.08,0,C.bianco).scatola(.04,.1,.05,0,.13,.095,C.bianco).scatola(.035,.04,.09,0,.2,.135,C.bianco); },1,'800','carlo',1,
    function(B){ cavaliere(B,0,0,0,0,C.bianco,null,true); },true);
  var aPiedi=istanze(function(B){ uomo(B,0,0,0,franco,null,0,'carlo'); },1,'800','carlo',1,null,true);
  cav.concat([capi,re,cavallo]).forEach(function(m){ senzaOmbra(m); appoggioIstanze(m,.035,.13); }); band.concat([aPiedi]).forEach(function(m){ senzaOmbra(m); appoggioIstanze(m,.028,.028); });      // il corteo si muove: niente ombra nella mappa del sole (si veda ombre800, più sotto), la macchia d'appoggio
  /* Il passo (26 novembre 2026, sera; l'utente: «l'animazione di Carlo Magno che si muove fino ad arrivare a San Pietro è weird … non un blocco che si muove così»).
     Prima tutto il corteo scivolava in blocco, alla stessa velocità, e in 20 secondi faceva più di un chilometro: 80 metri al secondo, con le zampe ferme.
     Ora il corteo si vede in tre momenti, con uno stacco fra l'uno e l'altro (lo dice la didascalia): su ponte Elio, lungo il portico, davanti ai gradini, dove rallenta e si ferma.
     Va al passo, circa 1,7 metri al secondo, e ognuno ha il suo: le zampe dei cavalli e le gambe di chi va a piedi si muovono nello shader dei vertici (matCammino), con la fase
     presa dalla strada fatta (niente scivolamento: un passo intero ogni 1,6 m per i cavalli, 1,4 m per gli uomini), il corpo sale e scende col passo; le file si allungano e si
     stringono un poco, ognuno sbanda appena di lato, e alla fermata la coda si ferma dopo la testa. Che cosa succede non cambia: il corteo arriva ai gradini, Carlo scende
     da cavallo e sale verso il papa (Annali dei Franchi, 800: «equo descendentem gradusque ascendentem»). Andatura, misure e tempi sono uno schema. */
  var A_CAV=[], A_PIE=[];
  function matCammino(cav,pedina){
    var m=RM.matPietra(), prima=m.onBeforeCompile, A=String.fromCharCode(10);
    var hip=cav?(pedina?.085:.108):(pedina?.088:.092), fz=cav?(pedina?.08:.052):0, amp=cav?(pedina?.18:.34):(pedina?.3:.4), sale=cav?.0035:.0028;      // anca, dove stanno le zampe lungo il corpo, ampiezza, quanto sale il corpo
    m.onBeforeCompile=function(sh,r){ if(prima) prima.call(this,sh,r);
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'attribute vec2 passo;')
        .replace('#include <begin_vertex>',['#include <begin_vertex>',
          '{ float ph=passo.x, am=passo.y; vec3 p0=transformed;',
          (cav?'  float w=(1.0-smoothstep('+(hip-.022).toFixed(3)+','+(hip-.002).toFixed(3)+',p0.y))*smoothstep(0.004,0.012,abs(p0.x)); float zp=p0.z>0.0?'+fz.toFixed(3)+':-'+fz.toFixed(3)+'; float of=(p0.x<0.0?0.0:3.1416)+(p0.z>0.0?1.5708:0.0);'
              :'  float w=(1.0-smoothstep('+(hip-.017).toFixed(3)+','+hip.toFixed(3)+',p0.y))*(1.0-smoothstep(0.022,0.027,abs(p0.x))); float zp=0.0; float of=p0.x<0.0?0.0:3.1416;'),
          '  float an=sin(ph+of)*'+amp.toFixed(2)+'*am*w; vec2 q=vec2(p0.y-'+hip.toFixed(3)+',p0.z-zp); float ca=cos(an), sa=sin(an);',
          '  transformed.y='+hip.toFixed(3)+'+q.x*ca-q.y*sa; transformed.z=zp+q.x*sa+q.y*ca;',
          '  transformed.y+=(0.5-0.5*cos(2.0*ph))*'+sale.toFixed(4)+'*am; }'].join(A)); };      // la zampa gira attorno alla sua anca; due salite per passo intero
    return m; }
  function cammina(gm,cav){      // il materiale col passo, alla pedina e alla persona; la fase e l'ampiezza per istanza
    var n=gm.instanceMatrix.count, at=new THREE.InstancedBufferAttribute(new Float32Array(n*2),2); at.setUsage(THREE.DynamicDrawUsage);
    gm.geometry.setAttribute('passo',at); gm.material=matCammino(cav,true);
    var gd=gm.userData.gd; if(gd){ gd.geometry.setAttribute('passo',at); gd.material=matCammino(cav,false); }
    gm.userData.passo=at; return at; }
  if(!MENO){ cav.concat([capi,re]).forEach(function(m){ cammina(m,true); }); band.concat([aPiedi]).forEach(function(m){ cammina(m,false); }); }
  function passo(gm,k,s,v,cav){ var at=gm.userData.passo; if(!at) return; at.setXY(k,s/(cav?.16:.14)*6.2832,Math.min(1,v/.12)); }      // fase dalla strada fatta (un passo intero: 1,6 m il cavallo, 1,4 m l'uomo); ampiezza dalla velocità
  function y(p){ var d=RM.distFiume(p.x,p.z); return d<7.5?.66:Math.max(p.y,.66-(d-7.5)*.33,sulSagrato(p.x,p.z)); }      // sul piano di ponte Elio (0,65, js/mura.js), poi giù per la rampa; in fondo sopra il sagrato
  var VEL=.17, SA=53.2, SB=99.2, TA=7, TB=13.5, TC=6.2, ARR=FINE+2.6;      // al passo (1,7 m/s); ponte Elio (s 47,9-62,9) e la metà del portico; i tre momenti; Carlo in cima ai gradini
  function sTempo(t,rit){      // dove sta, lungo la strada, chi è rit secondi dietro la testa (alla fermata la coda si ferma dopo): s e velocità
    if(t<TA) return {s:SA+VEL*Math.max(0,t), v:t<0?0:VEL};
    if(t<TB) return {s:SB+VEL*(t-TA), v:VEL};
    var u=t-TB-rit; if(u>=TC) return {s:LUN, v:0};
    return {s:LUN-VEL*TC/2+VEL*(u-(u>0?u*u/(2*TC):0)), v:VEL*(1-Math.max(0,u)/TC)}; }
  function sC(t){ return sTempo(t,0).s; }      // dove sta Carlo lungo il percorso
  function posa(gm,k,s,lat,ry){ var p=via(Math.max(0,s)/LUN,lat); metti(gm,k,p.x,y(p),p.z,ry==null?p.ry:ry); return p; }
  var posC=[-245.8,0,-108.1];      // dov'è Carlo (per il suo nome sulla scena)
  function arrivo(t){
    var c0=sTempo(t,0), s=c0.s, scende=t>=VIAGGIO+.3, apre=RM.sfuma(VIAGGIO-2.5,VIAGGIO,t), i, nb=[0,0,0,0], pf=via(1,0);
    for(i=0;i<70;i++){ var row=i>>1, gm=(i%9===4)?capi:cav[i&1], kk=gm===capi?(i/9)|0:(i>>1), h=((i*2654435761)>>>0)%1000/1000;
      var q=sTempo(t,row*.09+h*.2), gap=1+row*.42*(.95+.1*h)+.035*Math.sin(t*.8+row*.7)*(q.v/VEL);      // la coda si ferma dopo la testa; le file si allungano e si stringono un poco
      var sr=q.s-gap, lat=((i&1)?.13:-.13)+.012*Math.sin(t*.45+i*1.7);      // ognuno sbanda appena di lato
      posa(gm,kk,sr,lat); passo(gm,kk,sr+h*.08,q.v*(1+.06*Math.cos(t*.8+row*.7)),true); }
    for(i=0;i<6;i++){ var c=i%4, sb0=s+1.3+(i>>1)*.5, cap=LUN-.4-(i>>1)*.5, sb=Math.min(sb0,cap); posa(band[c],nb[c],sb,((i&1)?1:-1)*(.13+.8*apre)); passo(band[c],nb[c],sb+i*.03,sb0<cap?c0.v:0,false); nb[c]++; }
    if(!scende){ var pr=posa(re,0,s,0); passo(re,0,s,c0.v,true); posC=[pr.x,y(pr)+.1,pr.z]; metti(cavallo,0,0,-50,0,0,0); metti(aPiedi,0,0,-50,0,0,0); }
    else { metti(re,0,0,-50,0,0,0); metti(cavallo,0,pf.x,Math.max(H(pf.x,pf.z),sulSagrato(pf.x,pf.z)),pf.z,pf.ry);      // sceso da cavallo, sale i gradini fino al papa
      var ks=RM.sfuma(VIAGGIO+.6,ARR,t), x0=pf.x-.03, z0=pf.z+.075, xa=x0+(-246.8-x0)*ks, za=z0+(-108.1-z0)*ks; metti(aPiedi,0,xa,salita(xa),za,-Math.PI/2); posC=[xa,salita(xa),za];      // sceso accanto al cavallo, a sinistra (prima compariva tre metri più in là); gradino per gradino (quotaSu), a passo d'uomo
      var dk=RM.sfuma(VIAGGIO+.6,ARR,t+.05)-RM.sfuma(VIAGGIO+.6,ARR,t-.05), Lp=Math.hypot(-246.8-x0,-108.1-z0); passo(aPiedi,0,ks*Lp,dk/.1*Lp,false); }
    cav.concat([capi,re,cavallo,aPiedi],band).forEach(function(m){ m.instanceMatrix.needsUpdate=true; if(m.userData.passo) m.userData.passo.needsUpdate=true; });
  }
  var tutte=[g].concat(cav,[capi,re,cavallo,aPiedi],band), F=function(){ return RM.fattoreVista(); };
  /* Il secondo tempo (25 novembre 2026): il 25 dicembre dentro San Pietro (interno800, più sopra). T2 è il suo inizio; u=t-T2:
     0 la vista sopra la basilica; 2,4-4,6 tetti e muri si dissolvono; 4 la vista scende nella navata; 7 Carlo si alza dalla preghiera; 7,8-9,2 il papa gli posa la corona;
     9,6-13,6 l'acclamazione (tre volte, Liber Pontificalis); 13,9-15,8 l'omaggio del papa (Annali); 16-18,8 l'unzione del figlio (Liber Pontificalis); 19 la vista risale e il tetto torna.
     Il corteo del 24 novembre non c'è più: è passato un mese. Prima che la scena parta (e dopo, al cambio di tappa) si vede il quadro dell'arrivo (quadroT). */
  /* 25 novembre 2026, sera (l'utente: «la scena deve essere spettacolare»): il secondo tempo dura 34 secondi. u=t-T2:
     0 la vista sopra la basilica; 2,4-5,4 tetti e muri si dissolvono, le capriate per ultime, i lumi si accendono; 4,8-12,6 la discesa lungo la navata fino alla confessione;
     12,6-17,8 il primo piano: Carlo prega, si alza (13,3), il papa alza la corona e la posa (14,6-16,9), un attimo di sospensione; 17,8 campo largo dall'abside sulla navata piena,
     l'acclamazione (le braccia a tre ondate); 25 a metà, l'omaggio (26,4-28); l'unzione del figlio (28,2-30,3); 30,6 la vista risale, il tetto torna.
     Stessa sera, i primi piani veri (il piano vicino della camera scende: interno800): 12,4 stacco su Carlo in ginocchio (p1), 14,3 di profilo la corona alzata e posata (p2),
     16,7 il volto di Carlo incoronato da sopra la spalla del papa (p3), 18,2 il campo largo dietro Carlo sulla navata che acclama (e), 25 l'omaggio (g), 28,3 l'unzione (h). */
  var T2=FINE+3, FINE2=T2+34.2, I=interno800;
  function disegna(t){
    var dentro=I && t>=T2 && t<FINE2-.05, prima=t<T2;
    arrivo(Math.min(t,ARR));
    tutte.forEach(function(m){ m.visible=prima; });
    if(!I) return;
    var u=t-T2; I.mostra(!!dentro); I.taglio(dentro?RM.sfuma(2.4,5.4,u)*(1-RM.sfuma(31.2,33.6,u)):0);
    if(dentro) I.posa(u);
  }
  /* la camera dei tre momenti (26 novembre 2026, sera): a 50-60 m dal corteo, perché il passo si veda; su ponte Elio da est, sul fiume; lungo il portico e ai gradini
     da nord-est (il portico, a sud, non copre il corteo). Fra un momento e l'altro uno stacco. */
  function inquadra(t){ var k=t<TA?0:t<TB?1:2, o=[[5.0,2.1,1.3],[2.6,2.4,-5.0],[3.1,2.5,-4.7]][k], p=via(Math.max(0,sC(t)-.7)/LUN,0), y0=y(p)+.06, f=F();
    return {t:[p.x,y0,p.z], c:[p.x+o[0]*f,y0+o[1]*f,p.z+o[2]*f]}; }
  function vai(v,dur){ var w=alto(RM.adatta(v)), y0=RM.h(w.t[0],w.t[1])+1, d=Math.hypot(w.c[0]-w.t[0],w.c[1]-y0,w.c[2]-w.t[1]); if(RM.controlli) RM.controlli.minDistance=Math.min(RM.controlli.minDistance,d*.85); RM.volaA(w.t,w.c,dur); }
  var R2='2 · 25 dicembre: ';
  /* Il quarto elemento di ogni riga (25 novembre 2026, sera): fonte e riserve di quel tempo della scena. Sul PC la didascalia dell'evento, che copriva un terzo della scena,
     si riduce a questa riga in basso (js/eventi.js, RM.didascaliaBreve), con il bottone per leggerla tutta; sul telefono resta com'era (raccolta a tutto schermo). */
  var FA='Annali dei Franchi, 801; Liber Pontificalis, vita di Leone III', FS='L’interno è uno spaccato: navate, colonne, arco e abside seguono la pianta nota, altezze e luci sono ipotetiche.';
  var o=sequenza({fine:I?FINE2:ARR, quadroT:ARR, attesa:1.8, disegna:disegna, visibile:function(){ return !!(carlo800&&carlo800.acceso); },
    righe:[[0,'1 · 24 novembre: l’arrivo',null,'Fonte: Annali dei Franchi, anno 800. La strada del corteo, i numeri, i colori e i posti sono nostri; il corteo si vede in tre momenti, al passo (andatura e tempi sono uno schema).'],
      [VIAGGIO,'1 · 24 novembre: il papa lo accoglie sui gradini di San Pietro','1 · 24 novembre: il papa lo accoglie','Annali dei Franchi, 800: il papa sui gradini con il clero e i vescovi, le bandiere della città, i gruppi di pellegrini e di cittadini. Posti e numeri sono nostri.']]
      .concat(I?[[T2,R2+'Natale, a San Pietro',null,'Fonti: '+FA+'. '+FS],
      [T2+2.4,R2+'la messa, dentro la basilica','2 · Dentro la basilica','Vita di Adriano I (Liber Pontificalis): il faro a croce con 1365 lumi, acceso a Natale, e le tende di porpora fra le colonne. Forme e misure sono ipotetiche, come lampade e candele.'],
      [T2+12.4,R2+'Carlo prega davanti alla confessione','2 · Carlo prega','Annali dei Franchi, 801: davanti alla confessione di san Pietro, «mentre si alzava dalla preghiera». In ginocchio: la posa è ipotetica.'],
      [T2+13.3,R2+'Carlo si alza dalla preghiera','2 · Carlo si alza','Vesti di Carlo da Eginardo (23): a Roma una lunga tunica e la clamide; nelle feste l’oro e una fibbia d’oro. Quale giorno non è detto; i colori sono nostri.'],
      [T2+14.6,R2+'Leone III gli posa la corona sul capo','2 · Leone III lo incorona','Liber Pontificalis: «con le sue mani, una corona preziosissima». La forma della corona non è nota.'],
      [T2+18.0,'',null,'Liber Pontificalis: i Romani gridano tre volte, davanti alla confessione. Il gesto delle braccia e il numero delle persone sono ipotetici.'],
      [T2+25,R2+'il papa gli rende omaggio, come agli antichi imperatori','2 · L’omaggio del papa','Annali dei Franchi, 801: «more antiquorum principum adoratus est». Il gesto non è descritto: qui il papa si inginocchia (ipotesi).'],
      [T2+28.2,R2+'il papa unge re il figlio Carlo','2 · Il papa unge re il figlio','Liber Pontificalis: subito dopo il papa unge re con l’olio santo il figlio Carlo. Le pose sono ipotetiche.'],
      [T2+30.6,'2 · 25 dicembre 800: l’incoronazione','2 · 25 dicembre 800','Fonti: '+FA+'; Eginardo. Spaccato, luci, pose, colori, tagli delle vesti e numeri sono ipotetici; la luce d’inverno viene dalle date, non dal tempo di quei giorni.']]:[]),
    azioni:[[0,function(){ RM.segui(function(k){ return inquadra(k*VIAGGIO); },VIAGGIO); }],
            [VIAGGIO,function(){ var v=alto(RM.adatta({t:[-244,-107.5],c:[-232.5,11.5,-120.5]})); RM.volaA(v.t,v.c,2.5); }]]      // un poco più alta (24 novembre 2026): sul telefono, allontanata, la camera aveva un tetto del portico davanti
      .concat(I?[[T2,function(){ vai(I.VE,2.4); }],[T2+4.8,function(){ I.regia.discesa(); }],[T2+12.4,function(){ I.regia.preghiera(); }],[T2+14.3,function(){ I.regia.corona(); }],
                 [T2+16.7,function(){ I.regia.volto(); }],[T2+18.2,function(){ I.regia.largo(); }],[T2+25,function(){ I.regia.omaggio(); }],[T2+28.3,function(){ I.regia.unzione(); }],
                 [T2+30.6,function(){ vai(I.VE,2.6); }]]:[])});      // la discesa nella navata; i primi piani: la preghiera, la corona di profilo, il volto incoronato; il campo largo per l'acclamazione; l'omaggio e l'unzione da vicino
  INVERNO=false;
  var v0=inquadra(0);
  return {g:g, tutte:tutte, seq:o, da:799.6, a:801, vista:{t:[v0.t[0],v0.t[2]],c:v0.c}, carlo:function(){ return posC; }, T2:T2, FINE:ARR};      // FINE: la fine del primo tempo, Carlo in cima ai gradini
})();
/* Con meno animazioni (24 novembre 2026, poi 25 per il secondo tempo): tre viste ferme, l'arrivo, dopo otto secondi la corona in primo piano, dopo sedici la navata */
/* Le ombre dell'800 (25 novembre 2026; l'utente, sull'iPhone: «evitando che l'ombra faccia effetto flash»). Mentre la scena gira il riquadro della mappa delle ombre
   sta fermo (RM.ombraFissa, js/base.js) e la mappa si rifà una volta per tempo: attorno a tutta la strada del corteo, da ponte Elio ai gradini, finché la vista è larga;
   dentro la basilica, da quando il tetto è sparito a quando la vista risale, stretto attorno a lei (circa dieci centimetri per pixel: i bordi delle ombre del tetto e delle finestre sono morbidi, non a scalini). Chi si muove (il corteo, la folla,
   Carlo, il papa, il figlio) non entra nella mappa e ha la macchia d'appoggio; restano nella mappa le figure ferme (clero, Franchi). Se chi guarda tocca la scena, l'ombra torna
   a seguire la camera. */
var ombra800=null;
RM.frame.push(function(){
  var o=carlo800.seq, on=!!carlo800.acceso && o.t!=null && o.t<o.fine && !o.toccato && FERMA==null, f=null;
  if(on) f=(interno800 && o.t>=carlo800.T2+5.4 && o.t<carlo800.T2+30.6)?'dentro':'fuori';      // dentro: da quando il tetto è sparito a quando la vista risale (prima e dopo la vista è larga, sopra la basilica)
  if(f===ombra800) return; ombra800=f;
  if(!RM.ombraFissa) return;
  if(f==='dentro') RM.ombraFissa({x:interno800.X0-.5, z:interno800.Z0, t:7.5});
  else if(f==='fuori') RM.ombraFissa({x:-190, z:-100, s:80});      // nel riquadro della luce: da ponte Elio (x -110) a oltre San Pietro
  else RM.ombraFissa(null);
});
var meno800=null;
RM.prova800={seq:carlo800.seq, T2:carlo800.T2, FINE:carlo800.FINE, interno:interno800, lumi:LUMI800};      // per le prove senza finestra (catture della sequenza): a che punto è la scena
/* per la prova delle scene sul telefono (js/prova-scena.js, ?prova=scena&anno=800): fa partire la scena animata di un anno come la regia, e dice a che punto è */
RM.scenaProva={ avvia:function(anno){ fermaTutte(); var f=ANIMA[anno]; if(!f) return false; f(); return true; },
  corrente:function(){ return corrente || SEQ.filter(function(o){ return o.t!=null && o.t<o.fine; })[0] || null; }, anni:function(){ return Object.keys(ANIMA).map(Number); } };
/* una scena animata è in corso (e si vede): js/base.js tiene ferma la qualità finché dura (si veda giudica) */
RM.scenaInCorso=function(){ for(var i=0;i<SEQ.length;i++){ var o=SEQ[i]; if(o.t!=null && o.t<o.fine && o.visibile()) return true; } return false; };
ANIMA[800]=function(){
  if(MENO && interno800){ fermaTutte(); carlo800.seq.disegna(carlo800.FINE); meno800={t:0}; return; }
  if(interno800) interno800.compila();
  avvia(carlo800.seq);
};
RM.frame.push(function(dt){
  if(!meno800 || !carlo800.acceso) return; meno800.t+=dt;
  if(!meno800.gradini && meno800.t>.05){ meno800.gradini=true; var g=alto(RM.adatta({t:[-244,-107.5],c:[-232.5,11.5,-120.5]})); RM.volaA(g.t,g.c,.05); }      // la prima vista: i gradini, dove il corteo è già arrivato
  if(meno800.t>=8 && !meno800.corona){ meno800.corona=true; carlo800.seq.disegna(carlo800.T2+17.4); interno800.regia.fermo('p3b',0);      // la corona in primo piano
    breve('Annali dei Franchi, 801; Liber Pontificalis: davanti alla confessione il papa gli posa sul capo «con le sue mani» una corona preziosissima. Forma della corona, vesti, luci e pose sono in parte ipotetiche.'); }
  if(meno800.t>=16){ meno800=null; carlo800.seq.disegna(carlo800.T2+21.9); var tl=RM.camera&&RM.camera.aspect<.85; interno800.regia.fermo(tl?'et':'e',!tl);                           // la navata, le braccia alzate
    breve('Liber Pontificalis: i Romani gridano tre volte, davanti alla confessione. Il gesto delle braccia e il numero delle persone sono ipotetici.'); }
});
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
var seq546=sequenza({fine:14, attesa:0, visibile:function(){ return totila546.g.visible; }, disegna:function(){}, righe:[[0,'1 · Di notte Totila entra da porta Asinaria'],[7,'2 · Trastevere brucia'],[10.5,'3 · Poi Totila fa abbattere le mura in molti punti: circa un terzo, secondo Procopio']],      // la terza riga: Procopio, Guerra gotica III 22, 7 (src/testi/topografia-fonti.md, «Mura, ponti e isola nei secoli»); i tratti abbattuti, in js/mura.js, ci sono dal 546,5
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
  [[-1.1,-.3],[-.3,.5],[.6,-.4],[1.3,.4]].forEach(function(q){ var ry=rG()*6.28; uomo(A,q[0]-.09*Math.sin(ry),q[1]-.09*Math.cos(ry),Y,C.ferro,C.rosso,ry,'arena'); uomo(A,q[0]+.09*Math.sin(ry),q[1]+.09*Math.cos(ry),Y,C.tunica,P.bronzo,ry+Math.PI,'arena'); });      // 'arena': i gladiatori non sono soldati (niente veste del soldato dell'epoca)
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

/* ---------- le corse: il Circo Massimo e lo stadio di Domiziano (27 novembre 2026) ----------
   L'utente: «per Circo Massimo e Stadio di Domiziano fai vedere le corse ogni tanto quando erano in uso». Fonti lette: src/testi/vita-roma-fonti.md, sezione «Le corse».
   Circo: quattro quadrighe, una per fazione (Smith, «Circus»: «The usual number of chariots which started for each race was four»; i quattro colori anche in Cassiodoro,
   Variae III 51, 5), partono affiancate dal lato dei carceres, a ovest (Platner e Ashby, «Circus Maximus»), corrono sette giri con la spina sempre a sinistra (Smith, da
   Varrone e Ovidio; Cassiodoro III 51, 7: «septem metis certamen omne peragitur»), girano strette attorno alle mete e dopo la linea rallentano e si fermano. L'auriga sta
   in piedi, con le redini tese, inclinato indietro (Smith: «within the reins, which went round his back», per buttare il peso contro i cavalli).
   Schema, detto nella scheda: la velocità (circa 16 m al secondo), le corsie, i sorpassi e chi vince, la forma del carro, il mantello dei cavalli, la tunica nel colore della
   fazione, la polvere, il pubblico (quanto e dove). Nessun incidente né premio: non sono il racconto di una corsa qualunque.
   Quando: nelle tappe di ACCESE_C, una sì e una no fra quelle in cui il circo è in uso e la scena di Roma non ne ha un'altra vicina (fuori il 274 del trionfo, il 409-410,
   il 455 dei Vandali sul Palatino, il 472 dell'assedio, il 476 della sepoltura nella valle del Colosseo), fino al 507: dopo, nessuna fonte letta dà corse a Roma, salvo
   Totila nel 549-550, dove il luogo è incerto (Procopio, Guerra gotica III 37, 4: «after witnessing the horse-races there») e non c'è una tappa.
   Stadio: una corsa a piedi (Svetonio, Domiziano 4, 4: «in stadio vero cursu etiam virgines»), atleti nudi (Smith, «Athletae»), sei corridori su un tratto di 185 m
   (schema), solo nella tappa del 235: l'agone Capitolino si teneva ogni quattro anni ed era ancora vivo nel 238 (Censorino 18, 15); fino a quando, nessuna fonte letta lo dice.
   La regia non vola qui: non sono l'evento della tappa. Chi apre il circo o lo stadio li trova.
   Prove: RM.senzaCorse=true spegne tutto; ?corse=<secondi> ferma le due corse a quell'istante; RM.provaCorse.circo(t) e RM.provaCorse.stadio(t) le portano a un istante
   (RM.provaCorse.ferma(true) le tiene lì). Con meno animazioni i carri restano fermi a metà del terzo giro e i corridori a metà pista. */
var corse=(function(){
  function mon(id){ return (RM.MONUMENTI||[]).filter(function(m){ return m.id===id; })[0]; }
  var mC=mon('circo'), mS=mon('domiziano'); if(!mC||!mC.g||!mS||!mS.g) return null;
  var FERMA_C=(function(){ var r=/[?&]corse=([0-9.]+)/.exec(location.search); return r?+r[1]:null; })();
  var ACCESE_C={235:1,260:1,301:1,330:1,363:1,384:1,402:1,418:1,439:1,468:1,507:1}, ACCESE_S={235:1};      // 27 novembre 2026: tolto il 284, che è solo l'intermezzo «La moneta» (carta e città restano al 274): la corsa non si vedeva mai
  var pop=(D.CURVE&&D.CURVE.popolazione&&D.CURVE.popolazione.punti)||[[0,900000]], AN=String.fromCharCode(10);
  function sm(a,b,x){ var t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
  function gruppo(m){ var g=new THREE.Group(); g.position.copy(m.g.position); g.quaternion.copy(m.g.quaternion); g.scale.copy(m.g.scale); g.visible=false; RM.scene.add(g); return g; }
  /* pezzi in una geometria sola, coi colori nei vertici e l'attributo «fisso» di matPersone (0: prende il colore dell'istanza) */
  function unisci(lista){ var Pp=[], Nn=[], Cc=[], Ff=[];
    lista.forEach(function(q){ var g=q.g.index?q.g.toNonIndexed():q.g, pa=g.attributes.position.array, na=g.attributes.normal.array, ca=g.attributes.color?g.attributes.color.array:null, fa=g.attributes.fisso?g.attributes.fisso.array:null, n=pa.length/3, i;
      for(i=0;i<n;i++){ Pp.push(pa[i*3],pa[i*3+1],pa[i*3+2]); Nn.push(na[i*3],na[i*3+1],na[i*3+2]);
        if(q.col){ Cc.push(q.col.r,q.col.g,q.col.b); Ff.push(q.f==null?1:q.f); } else { Cc.push(ca[i*3],ca[i*3+1],ca[i*3+2]); Ff.push(fa?fa[i]:1); } } });
    var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); g.setAttribute('fisso',new THREE.Float32BufferAttribute(Ff,1)); return g; }
  function scatola(w,h,d,x,y,z){ return new THREE.BoxGeometry(w,h,d).translate(x,y,z); }
  function asta(a,b,r){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), m=new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0),d,new THREE.Vector3(0,1,0));
    m.scale(new THREE.Vector3(r,r,L)); m.setPosition((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); return new THREE.BoxGeometry(1,1,1).applyMatrix4(m); }
  function istMesh(geo,mat,n){ var g=new THREE.InstancedMesh(geo,mat,n); g.frustumCulled=false; g.castShadow=false; g.receiveShadow=true; return g; }
  var Ob=new THREE.Object3D(), Mt=new THREE.Matrix4(), Mt2=new THREE.Matrix4();
  /* Il pubblico (schema): sulle gradinate un «tappeto» di gente, una trama in cui ogni punto è una persona (50 cm per 60), piena secondo la curva della popolazione
     come al Colosseo; nelle prime file qualche figura a istanze. Si vede solo quando c'è la corsa. pr(w): il contorno della gradinata larga w (come circo() e stadio() di js/monumenti.js) */
  var TINTE=[C.bianco,C.tunica,C.folla[0],C.folla[1],C.folla[2],C.folla[3],C.folla[4],C.folla[5]];
  function pubblico(gr,pr,bande,seme,nFig){
    var Pp=[], Uv=[], Ii=[], n0=0, posti=[], r=RM.casuale(seme);
    bande.forEach(function(b){ var A=pr(b[0]), B2=pr(b[2]), d=0, i;
      for(i=0;i<A.length;i++){ if(i>0) d+=Math.hypot(A[i][0]-A[i-1][0],A[i][1]-A[i-1][1]);
        Pp.push(A[i][0],b[1]+.01,A[i][1],B2[i][0],b[3]+.01,B2[i][1]); Uv.push(d/.05/512,0,d/.05/512,1);
        if(i>0){ var a=n0+(i-1)*2; Ii.push(a,a+1,a+2,a+1,a+3,a+2); } }
      n0+=A.length*2; });
    var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(Uv,2)); geo.setIndex(Ii); geo.computeVertexNormals();
    var TW=512, TH=64, dati=new Uint8Array(TW*TH*4), soglia=new Float32Array(TW*TH), gente=new Float32Array(TW*TH*3), i, j, GR=RM.col(0x7a6a58), CAPO=[RM.col(0x2e241c),RM.col(0x4a3a2c),C.pelle];      // due punti per persona, uno sopra l'altro: la veste e, sopra, il capo
    for(j=0;j<TH;j+=2) for(i=0;i<TW;i++){ var k=j*TW+i, t=TINTE[(r()*TINTE.length)|0].clone().lerp(GR,.35), l=.6+.35*r(), c2=CAPO[(r()*3)|0], s0=r();
      soglia[k]=soglia[k+TW]=s0; gente[k*3]=t.r*l; gente[k*3+1]=t.g*l; gente[k*3+2]=t.b*l; gente[(k+TW)*3]=c2.r*.8; gente[(k+TW)*3+1]=c2.g*.8; gente[(k+TW)*3+2]=c2.b*.8; }
    var tex=new THREE.DataTexture(dati,TW,TH,THREE.RGBAFormat); tex.wrapS=THREE.RepeatWrapping; tex.wrapT=THREE.ClampToEdgeWrapping; tex.magFilter=THREE.LinearFilter; tex.minFilter=THREE.LinearMipmapLinearFilter; tex.generateMipmaps=true;
    if(RM.renderer) tex.anisotropy=Math.min(8,RM.renderer.capabilities.getMaxAnisotropy());
    var mat=new THREE.MeshStandardMaterial({map:tex, roughness:1, metalness:0, side:THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2});
    var tappeto=new THREE.Mesh(geo,mat); tappeto.receiveShadow=true; gr.add(tappeto);
    function riempi(f){ for(var k=0;k<TW*TH;k++){ var on=soglia[k]<f, fila=(k/TW|0)%4<2?.88:1, q=on?[gente[k*3],gente[k*3+1],gente[k*3+2]]:[P.tufo.r*.8*fila,P.tufo.g*.8*fila,P.tufo.b*.8*fila];      // dove non c'è nessuno, la pietra della gradinata
        dati[k*4]=Math.min(255,q[0]*255); dati[k*4+1]=Math.min(255,q[1]*255); dati[k*4+2]=Math.min(255,q[2]*255); dati[k*4+3]=255; } tex.needsUpdate=true; }
    /* le figure nelle prime file: corpo e testa (la testa non prende il colore dell'istanza) */
    var b0=bande[0], Ain=pr(b0[0]), Aout=pr(b0[2]), nn=Ain.length, fig=null, cnt=0;
    if(nFig){ var gF=unisci([{g:scatola(.044,.07,.042,0,.035,0), col:BIANCO1, f:0},{g:new THREE.OctahedronGeometry(.018).scale(1,1.15,1).translate(0,.09,0), col:C.pelle}]);
      fig=istMesh(gF,matPersone(),nFig); fig.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(nFig*3),3);
      for(var q=0;q<nFig*6&&cnt<nFig;q++){ var s=r()*(nn-1.001), i0=s|0, fr=s-i0, uu=.04+.3*r(), xa=Ain[i0][0]+(Ain[i0+1][0]-Ain[i0][0])*fr, za=Ain[i0][1]+(Ain[i0+1][1]-Ain[i0][1])*fr,
          xb=Aout[i0][0]+(Aout[i0+1][0]-Aout[i0][0])*fr, zb=Aout[i0][1]+(Aout[i0+1][1]-Aout[i0][1])*fr, x=xa+(xb-xa)*uu, z=za+(zb-za)*uu, y=b0[1]+(b0[3]-b0[1])*uu;
        Ob.position.set(x,y,z); Ob.rotation.set(0,Math.atan2(xa-xb,za-zb),0); Ob.scale.setScalar(1); Ob.updateMatrix(); fig.setMatrixAt(cnt,Ob.matrix);
        var tt=TINTE[(r()*TINTE.length)|0]; fig.instanceColor.setXYZ(cnt,tt.r,tt.g,tt.b); cnt++; }
      fig.count=cnt; fig.castShadow=true; gr.add(fig); }
    return {riempi:riempi, tappeto:tappeto, fig:fig, n:cnt, tri:Ii.length/3+(fig?cnt*fig.geometry.attributes.position.count/3:0)};
  }
  /* ---- il Circo Massimo: misure di circo(B,62,14,2.5) in js/monumenti.js, nel riferimento del circo (x lungo l'asse, verso est; -z il lato del Palatino) ---- */
  var gC=gruppo(mC), L=62, W=14, h=2.5, YA=.12;
  var prC=function(w){ return RM.stadio(L-(W-w),w,26,14); };
  var pubC=pubblico(gC,prC,[[W*.62,.45,W-1.3,h-.3]],235,LEGGERA?220:700);
  var XE=-1+L*.28+.6, XW=-1-L*.28-.6, XC=-29.3, RS=[.95,1.4,1.85,2.3], LAPN=80, V=1.6, TA=4, GIRI=7, S0=XW-XC, T0=2, TB=7;      // le due mete (i coni di circo()), la linea dei carceres, le corsie, il giro «nominale», la velocità (16 m/s), i sette giri
  var LAPS=RS.map(function(r){ return 2*(XE-XW)+2*Math.PI*r; }), UFIN=S0+GIRI*LAPN;
  var VAR=[[1.3,.071,0,.009],[1.1,.083,2.1,-.004],[1.5,.064,4.0,.002],[1.2,.077,1.0,-.008]];      // chi sorpassa chi e chi vince: ampiezza, pulsazione, fase, tendenza (schema)
  var FAZ=[RM.col(0x3f7a3a),RM.col(0xa8342c),RM.col(0x3c679c),RM.col(0xe9e3d5)];      // verde, rosso, azzurro, bianco (le tinte sono uno schema)
  function uN(i,t){ if(t<=0) return 0; var q=VAR[i], b=t<TA?V*t*t/(2*TA):V*(t-TA/2); return b+sm(TA,TA+25,t)*(q[0]*(Math.sin(q[1]*(t-TA)+q[2])-Math.sin(q[2]))+q[3]*(t-TA)); }
  var TF=RS.map(function(r,i){ var a=0, b=600; for(var k=0;k<50;k++){ var c=(a+b)/2; if(uN(i,c)<UFIN) a=c; else b=c; } return b; });      // quando ognuno passa la linea dopo il settimo giro
  var CICLO=T0+Math.max.apply(null,TF)+TB+12, T_MENO=T0+TA+(S0+2.55*LAPN-V*TA/2)/V;      // 12 s fermi dopo l'arrivo, poi la corsa seguente; con meno animazioni: a metà del terzo giro
  function sulGiro(r,s,o){ var A=XE-XW, c=Math.PI*r, f;
    if(s<A){ o.x=XW+s; o.z=r; o.dx=1; o.dz=0; return; } s-=A;
    if(s<c){ f=s/r; o.x=XE+r*Math.sin(f); o.z=r*Math.cos(f); o.dx=Math.cos(f); o.dz=-Math.sin(f); return; } s-=c;
    if(s<A){ o.x=XE-s; o.z=-r; o.dx=-1; o.dz=0; return; } s-=A; f=Math.min(Math.PI,s/r);
    o.x=XW-r*Math.sin(f); o.z=-r*Math.cos(f); o.dx=-Math.cos(f); o.dz=Math.sin(f); }
  function carroA(i,t,o){      // dove sta il carro i all'istante t del ciclo: x, z, direzione, strada fatta d (per le ruote e il passo dei cavalli)
    var r=RS[i], tr=t-T0, k=LAPS[i]/LAPN;
    if(tr>=TF[i]){ var tau=tr-TF[i], vF=V*k, e=tau<TB?vF*tau-vF*tau*tau/(2*TB):vF*TB/2; o.x=XW+e; o.z=r; o.dx=1; o.dz=0; o.d=S0+GIRI*LAPS[i]+e; return o; }
    var u=uN(i,tr);
    if(u<S0){ o.x=XC+u; o.z=r; o.dx=1; o.dz=0; o.d=u; return o; }
    var f=(u-S0)/LAPN; sulGiro(r,(f-Math.floor(f))*LAPS[i],o); o.d=S0+(u-S0)*k; return o; }
  /* i cavalli: il cavallo delle statue (sui telefoni il leggero), quattro affiancati davanti al carro; il galoppo nello shader dei vertici: le zampe girano attorno all'anca
     (le due di dietro quasi insieme, poi le due davanti), il corpo beccheggia e sale e scende una volta per falcata (circa 6,8 m) */
  function matGaloppo(){ var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0});
    m.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+AN+'attribute vec2 passo;')
      .replace('#include <begin_vertex>',['#include <begin_vertex>',
        '{ float ph=passo.x, am=passo.y; vec3 p0=transformed;',
        '  float w=(1.0-smoothstep(0.082,0.102,p0.y))*smoothstep(0.004,0.012,abs(p0.x)); float dav=step(0.0,p0.z); float zp=dav>0.5?0.052:-0.052;',
        '  float of=dav*2.5+(p0.x<0.0?0.0:0.45); float an=(sin(ph+of)*0.52+(dav>0.5?-0.1:0.12))*am*w;',
        '  vec2 q=vec2(p0.y-0.108,p0.z-zp); float ca=cos(an), sa=sin(an); transformed.y=0.108+q.x*ca-q.y*sa; transformed.z=zp+q.x*sa+q.y*ca;',
        '  float pt=sin(ph+1.2)*0.06*am; vec2 r=vec2(transformed.y-0.11,transformed.z); transformed.y=0.11+r.x*cos(pt)-r.y*sin(pt); transformed.z=r.x*sin(pt)+r.y*cos(pt);',
        '  transformed.y+=(0.5+0.5*sin(ph+0.4))*0.007*am; }'].join(AN)); };
    return m; }
  var XH=[-.105,-.035,.035,.105], ZH=[.19,.205,.205,.19];      // i quattro cavalli: i due al giogo nel mezzo, i due di fuori a fianco
  var mantelli=[C.cavalloB,RM.col(0x4a3324),C.cavalloC,RM.col(0x7d5a3c)], cav=[], matG=matGaloppo();
  mantelli.forEach(function(col){ var g=istMesh(cavalloGeo(col),matG,4), at=new THREE.InstancedBufferAttribute(new Float32Array(8),2); at.setUsage(THREE.DynamicDrawUsage); g.geometry.setAttribute('passo',at); g.userData.passo=at; gC.add(g); appoggioIstanze(g,.035,.12); cav.push(g); });
  /* il carro e l'auriga: la cassa bassa aperta dietro, il parapetto davanti, l'asse, il timone, il giogo; l'auriga (la figura comune in tunica corta, le braccia tese)
     in piedi inclinato indietro, le redini dalle mani alle teste dei cavalli. Una maglia a istanze: la tunica prende il colore della fazione */
  var LEGNO=RM.col(0x6e5034), CUOIO=RM.col(0x3b2a1c), FERRO=RM.col(0x6d6a66);
  var oA=opzioni(C.tunica,null,null,7); oA.f=0; oA.v=null; oA.posa=null; oA.sopra=null; oA.velo=null; oA.s=1; oA.braccia=2;
  var gAur=personaGeo(oA); gAur.applyMatrix4(new THREE.Matrix4().makeRotationX(-.2)); gAur.translate(0,.047,-.008);
  var pezzi=[{g:gAur},{g:scatola(.12,.008,.075,0,.047,0),col:LEGNO},{g:scatola(.12,.072,.008,0,.086,.036),col:LEGNO},{g:scatola(.008,.042,.06,-.058,.072,.004),col:LEGNO},{g:scatola(.008,.042,.06,.058,.072,.004),col:LEGNO},
    {g:scatola(.17,.007,.007,0,.045,0),col:FERRO},{g:asta([0,.05,.04],[0,.118,.27],.007),col:LEGNO},{g:scatola(.16,.01,.012,0,.122,.27),col:LEGNO}];
  XH.forEach(function(x,k){ pezzi.push({g:asta([x<0?-.02:.02,.19,.03],[x,.16,ZH[k]+.12],.0022),col:CUOIO}); });      // le redini
  var carri=istMesh(unisci(pezzi),matPersone(),4); carri.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(12),3); FAZ.forEach(function(c,i){ carri.instanceColor.setXYZ(i,c.r,c.g,c.b); });
  gC.add(carri); appoggioIstanze(carri,.07,.05);      // chi si muove non fa ombra nella mappa del sole: la macchia d'appoggio (come nell'800)
  /* le ruote, che girano: cerchione, sei raggi, mozzo (circa 90 cm) */
  var gR=unisci([{g:new THREE.TorusGeometry(.045,.0042,4,16).rotateY(Math.PI/2),col:LEGNO},{g:new THREE.CylinderGeometry(.008,.008,.02,8).rotateZ(Math.PI/2),col:FERRO}].concat([0,1,2].map(function(k){ return {g:scatola(.004,.088,.005,0,0,0).rotateX(k*Math.PI/3),col:LEGNO}; })));
  var ruote=istMesh(gR,matPersone(),8); ruote.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(24).fill(1),3); gC.add(ruote);      // matPersone vuole il colore per istanza (il programma è lo stesso dei carri)
  /* la polvere (schema: nessuna fonte letta la descrive): sbuffi bassi e chiari dietro ogni carro, che si allargano e salgono */
  var NP=LEGGERA?6:10, polv=istMesh(new THREE.SphereGeometry(1,7,5),new THREE.MeshBasicMaterial({color:P.sabbia.clone().multiplyScalar(1.05),transparent:true,opacity:.14,depthWrite:false}),4*NP); polv.renderOrder=2; gC.add(polv);
  /* le uova che contano i giri (27 novembre 2026; Smith, «Circus», letto quel giorno: sette «ova» su due colonne della spina, «as each round was run, one of the ova was put up
     (Cassiodor. Var. Ep. III.51) or taken down, according to Varro»). Qui segue Cassiodoro, il più vicino agli anni della pagina: a ogni giro del primo carro se ne alza uno.
     Sulla sbarra a ovest (circo() in js/monumenti.js), i delfini sull'altra: da che parte stessero è uno schema; forma e misura (circa 80 cm) anche. */
  var uova=istMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:P.marmo,roughness:.6}),7), XU=-1-L*.12, nUova=-1; uova.count=7; gC.add(uova);
  function mettiUova(n){ if(n===nUova) return; nUova=n; for(var k=0;k<7;k++){ Ob.position.set(XU-.39+k*.13,1.5+.04,0); Ob.rotation.set(0,0,0); if(k<n) Ob.scale.set(.035,.045,.035); else Ob.scale.setScalar(.00001); Ob.updateMatrix(); uova.setMatrixAt(k,Ob.matrix); } uova.instanceMatrix.needsUpdate=true; }
  var oc={}, op={}, tC=25, fermoC=false;
  function disegnaC(t){
    t=((t%CICLO)+CICLO)%CICLO; var vis=t<CICLO-1.5;      // l'ultimo secondo e mezzo del ciclo i carri non ci sono: poi la corsa seguente esce dai carceres
    var uMax=0; for(var iu=0;iu<4;iu++) uMax=Math.max(uMax,uN(iu,t-T0)); mettiUova(vis?Math.max(0,Math.min(7,Math.floor((uMax-S0)/LAPN))):0);      // i giri finiti dal primo carro
    for(var i=0;i<4;i++){
      carroA(i,t,oc); var ry=Math.atan2(oc.dx,oc.dz), d=oc.d; carroA(i,t+.1,op); var v=(op.d-d)/.1, am=Math.min(1,v/1.1);
      var y=YA+(0.5+0.5*Math.sin(d/.68*6.2832+.4))*.004*am;
      Ob.position.set(oc.x,vis?y:-50,oc.z); Ob.rotation.set(0,ry,0); Ob.scale.setScalar(1); Ob.updateMatrix(); carri.setMatrixAt(i,Ob.matrix);
      [-1,1].forEach(function(s,w){ Mt.makeRotationX(d/.045); Mt.setPosition(s*.075,.045,0); Mt2.multiplyMatrices(Ob.matrix,Mt); ruote.setMatrixAt(i*2+w,Mt2); });
      for(var k=0;k<4;k++){ var g=cav[(i+k)%4], j=i; Mt.makeTranslation(XH[k],0,ZH[k]); Mt2.multiplyMatrices(Ob.matrix,Mt); Mt2.elements[13]=vis?YA:-50; g.setMatrixAt(j,Mt2);      // ogni carro ha un cavallo di ogni mantello
        g.userData.passo.setXY(j,d/.068*6.2832*.1+i*1.3+k*.17,am); }
      for(k=0;k<NP;k++){ var age=(k+1)*.17; carroA(i,t-age,op); var vv=Math.min(1,v/1.2), sc=(.035+.07*age)*vv;
        Ob.position.set(op.x-op.dx*.02,YA+.012+.025*age,op.z-op.dz*.02); Ob.rotation.set(0,0,0); Ob.scale.set(sc*1.3,sc*.55,sc*1.3); if(!vis||sc<.004) Ob.scale.setScalar(.00001); Ob.updateMatrix(); polv.setMatrixAt(i*NP+k,Ob.matrix); }
    }
    carri.instanceMatrix.needsUpdate=ruote.instanceMatrix.needsUpdate=polv.instanceMatrix.needsUpdate=true;
    cav.forEach(function(g){ g.instanceMatrix.needsUpdate=true; g.userData.passo.needsUpdate=true; });
  }
  /* ---- lo stadio di Domiziano: misure di stadio(B,27.5,10.6,1.9) in js/monumenti.js; la pista larga W*.52, il fondo a 0,12; x verso la curva (nord) ---- */
  var gS=gruppo(mS), LS=27.5, WS=10.6, HS=1.9;
  var prS=function(w){ return RM.stadio(LS-(WS-w),w,26,14); };
  var pubS=pubblico(gS,prS,[[WS*.52,.45,WS-2.7,HS*.55-.3],[WS-2.7,HS*.55,WS-1.1,HS-.25]],86,LEGGERA?100:300);
  /* i corridori: la figura comune senza veste (la pelle al posto della tunica, a piedi nudi); la parte di sotto della tunica, divisa in due, segue le cosce.
     La corsa nello shader dei vertici: gambe e braccia (piegate al gomito) oscillano, il ginocchio si piega, il corpo è inclinato in avanti e sobbalza a ogni passo */
  function corridoreGeo(k){ var g=RM.figuraGeo({orlo:.7, maniche:'corte'},k,LEGGERA?3:5), pa=g.attributes.position.array, ca=g.attributes.color.array, fa=g.attributes.fisso.array, oa=g.attributes.oscilla.array, sa=g.attributes.ombra?g.attributes.ombra.array:null, n=pa.length/3, i, t;
    var pel=[RM.col(0xc99a76),RM.col(0xb98762),RM.col(0xa57452)][k%3];      // tre carnagioni
    function sandalo(i){ return Math.abs(ca[i*3]-V_SANDALO.r)+Math.abs(ca[i*3+1]-V_SANDALO.g)+Math.abs(ca[i*3+2]-V_SANDALO.b)<.03; }
    for(t=0;t<n;t+=3){ var veste=!fa[t], cx=(pa[t*3]+pa[t*3+3]+pa[t*3+6])/3, cy=(pa[t*3+1]+pa[t*3+4]+pa[t*3+7])/3;
      for(i=t;i<t+3;i++){ var om=sa?sa[i]:1;
        if(veste||sandalo(i)){ ca[i*3]=pel.r; ca[i*3+1]=pel.g; ca[i*3+2]=pel.b; fa[i]=1; }
        ca[i*3]*=om; ca[i*3+1]*=om; ca[i*3+2]*=om;
        if(veste && cy<.09 && Math.abs(oa[i])<.5) oa[i]=cx<0?-1:1; } }      // le due metà dell'orlo seguono le gambe
    g.attributes.color.needsUpdate=true; return g; }
  function matCorsa(){ var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,metalness:0});
    m.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+AN+'attribute float oscilla; attribute vec2 corsa;')
      .replace('#include <begin_vertex>',['#include <begin_vertex>',
        '{ float ph=corsa.x, am=corsa.y, ao=abs(oscilla), sg=sign(oscilla); vec3 q; float a, ca, sa;',
        '  if(ao>0.5 && ao<1.5){ float gin=transformed.y<0.05?1.0:0.0;',      // la gamba: prima il ginocchio, poi l'anca
        '    a=gin*am*(0.25+0.95*max(0.0,sin(ph-1.1)*sg)); q=transformed; q.y-=0.05; ca=cos(a); sa=sin(a); transformed=vec3(q.x,q.y*ca-q.z*sa+0.05,q.y*sa+q.z*ca);',
        '    a=sin(ph)*0.62*am*sg; q=transformed; q.y-=0.092; ca=cos(a); sa=sin(a); transformed=vec3(q.x,q.y*ca-q.z*sa+0.092,q.y*sa+q.z*ca); }',
        '  if(ao>1.5){ if(transformed.y<0.1125){ q=transformed; q.y-=0.1115; a=-1.45*am; ca=cos(a); sa=sin(a); transformed=vec3(q.x,q.y*ca-q.z*sa+0.1115,q.y*sa+q.z*ca); }',      // il braccio: il gomito piegato, poi la spalla
        '    a=-sin(ph)*0.75*am*sg; q=transformed; q.y-=0.138; ca=cos(a); sa=sin(a); transformed=vec3(q.x,q.y*ca-q.z*sa+0.138,q.y*sa+q.z*ca); }',
        '  a=0.14*am; ca=cos(a); sa=sin(a); q=transformed; transformed=vec3(q.x,q.y*ca-q.z*sa,q.y*sa+q.z*ca);',      // inclinato in avanti
        '  transformed.y+=abs(sin(ph))*0.006*am; }'].join(AN)); };
    return m; }
  var NC=6, matR=matCorsa(), corr=[], ZC=[-1.05,-.63,-.21,.21,.63,1.05], VC=[.8,.84,.78,.82,.86,.79], XS=-9.6, XF=8.9, SC0=3, ACC=1.4, TBS=2.2;      // sei corsie; velocità (8 m/s circa); la partenza e l'arrivo (185 m: lo stadio di Olimpia, schema)
  for(var k=0;k<NC;k++){ var gk=istMesh(corridoreGeo(k),matR,1), atc=new THREE.InstancedBufferAttribute(new Float32Array(2),2); atc.setUsage(THREE.DynamicDrawUsage); gk.geometry.setAttribute('corsa',atc); gk.userData.corsa=atc; gS.add(gk); appoggioIstanze(gk,.028,.028); corr.push(gk); }
  function corrA(i,t){      // strada fatta e velocità del corridore i
    var v=VC[i], tr=t-SC0; if(tr<=0) return [0,0];
    var s=tr<ACC?v*tr*tr/(2*ACC):v*(tr-ACC/2), sF=XF-XS; if(s<sF) return [s,tr<ACC?v*tr/ACC:v];
    var tf=ACC/2+sF/v, tau=tr-tf; if(tau<TBS) return [sF+v*tau-v*tau*tau/(2*TBS),v*(1-tau/TBS)]; return [sF+v*TBS/2,0]; }
  var CICLOS=SC0+ACC/2+(XF-XS)/.78+TBS+8, T_MENO_S=SC0+ACC/2+(XF-XS)/2/.82, tS=4, fermoS=false;      // 8 s fermi dopo l'arrivo, poi la corsa seguente
  function disegnaS(t){ t=((t%CICLOS)+CICLOS)%CICLOS; var vis=t<CICLOS-1;
    for(var i=0;i<NC;i++){ var q=corrA(i,t), am=Math.min(1,q[1]/.5); Ob.position.set(XS+q[0],vis?YA:-50,ZC[i]); Ob.rotation.set(0,Math.PI/2,0); Ob.scale.setScalar(1); Ob.updateMatrix(); corr[i].setMatrixAt(0,Ob.matrix);
      corr[i].userData.corsa.setXY(0,q[0]/.32*6.2832+i*.9,am); corr[i].instanceMatrix.needsUpdate=true; corr[i].userData.corsa.needsUpdate=true; } }      // un passo intero ogni 3,2 m
  var accC=false, accS=false;
  RM.frame.push(function(dt){
    if(RM.senzaCorse){ gC.visible=gS.visible=false; return; }
    gC.visible=accC; gS.visible=accS;
    if(accC){ if(FERMA_C==null && !MENO && !fermoC) tC+=dt; disegnaC(FERMA_C!=null?FERMA_C:MENO?T_MENO:tC); }
    if(accS){ if(FERMA_C==null && !MENO && !fermoS) tS+=dt; disegnaS(FERMA_C!=null?FERMA_C:MENO?T_MENO_S:tS); }
  });
  RM.provaCorse={ circo:function(t){ fermoC=true; tC=t; disegnaC(t); }, stadio:function(t){ fermoS=true; tS=t; disegnaS(t); }, ferma:function(v){ fermoC=fermoS=!!v; },
    gruppi:{circo:gC, stadio:gS}, carro:function(i,t){ carroA(i,((t%CICLO)+CICLO)%CICLO,oc); var v=new THREE.Vector3(oc.x,YA,oc.z); gC.localToWorld(v); return {x:v.x,y:v.y,z:v.z,dx:oc.dx,dz:oc.dz}; },      // per inquadrare: dove sta il carro i all'istante t, nel mondo
    corridore:function(i,t){ var q=corrA(i,((t%CICLOS)+CICLOS)%CICLOS); return [XS+q[0],YA,ZC[i]]; },      // nel riferimento dello stadio
    ciclo:{circo:CICLO, stadio:CICLOS}, arrivi:TF.map(function(x){ return x+T0; }), meno:{circo:T_MENO, stadio:T_MENO_S}, accese:{circo:ACCESE_C, stadio:ACCESE_S},
    triangoli:function(){ var t=pubC.tri+pubS.tri; [carri,ruote,polv].concat(cav,corr).forEach(function(m){ t+=m.geometry.attributes.position.count/3*(m.count||1); }); return Math.round(t); } };
  return {aggiorna:function(anno){
    var c=!!ACCESE_C[anno]&&!RM.senzaCorse, s=!!ACCESE_S[anno]&&!RM.senzaCorse, f=Math.max(.35,Math.min(1,.4+.6*D.interp(pop,anno)/900000));      // il pubblico segue la curva della popolazione (schema)
    if(c&&!accC){ tC=25; pubC.riempi(f); } if(s&&!accS){ tS=4; pubS.riempi(f); }      // ogni volta che si accende, la corsa è già partita da poco
    accC=c; accS=s; gC.visible=c; gS.visible=s; if(c) disegnaC(FERMA_C!=null?FERMA_C:MENO?T_MENO:tC); if(s) disegnaS(FERMA_C!=null?FERMA_C:MENO?T_MENO_S:tS); }};
})();
if(corse) RM.moduli.push(function(anno){ corse.aggiorna(anno); });      // RM.senzaCorse=true le spegne (per le prove di peso)

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
  [10,11,1.2,6,593,'atrio di Santa Maria Antiqua e casa delle Vestali'],
  [166.15,-153.4,1.6,30,500,'cimitero nei Castra Praetoria']];      // 27 novembre 2026: «A Christian cemetery of the beginning of the sixth century was also found in the castra» (Platner e Ashby, Castra Praetoria, nota 3, da De Rossi, Roma Sotterranea I 218); dove, quanto grande e quante tombe non lo dice: qui a ovest, presso la vecchia porta (n 205 m, e 322 m nel campo, CASTRA_DENTRO), dal 500; schema detto nella scheda
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

/* ---------- 800: l'inverno (25 novembre 2026, l'utente: «Se è Natale vuoi mostrare anche che sia inverno?») ----------
   Le date vengono dalle fonti (24 novembre e 25 dicembre), il tempo che faceva no: niente neve, gelo o pioggia. Si vede la stagione: la luce un poco più fredda (la stessa leva
   della notte del 410, RM.applicaLuce, a un decimo), i prati e i campi più spenti e bruni (i colori dei vertici del suolo, come le macchie del 756), la folla col mantello.
   Il sole della scena è già basso (js/base.js: 28 gradi, quasi quello di mezzogiorno a fine dicembre), ma viene da ovest-nord-ovest e non da sud: per spostarlo serve un aggancio
   in js/base.js. Gli alberi caducifogli (i pioppi di js/citta.js) restano verdi: le loro maglie non sono raggiungibili da qui. La didascalia lo dice in mezza riga. */
var inverno800=(function(){
  var col=null, orig=null, idx=[], ultimo=0;
  function prepara(){ var gq=RM.suolo.geometry; col=gq.attributes.color; orig=col.array.slice();
    for(var i=0;i<col.count;i++){ var r=orig[i*3], g=orig[i*3+1], b=orig[i*3+2]; if(g>r*.96 && g>b*1.05) idx.push(i); } }      // solo i vertici verdi: prati, campi, rive
  return function(k){
    if(!RM.suolo || k===ultimo) return; if(!orig) prepara(); ultimo=k; var a=col.array;
    idx.forEach(function(i){ var o=i*3, r=orig[o], g=orig[o+1], b=orig[o+2], l=.3*r+.55*g+.15*b;
      a[o]=r+((l*1.06)*.92-r)*.55*k; a[o+1]=g+((l*.98)*.9-g)*.55*k; a[o+2]=b+((l*.8)*.88-b)*.55*k; });
    col.needsUpdate=true;
  };
})();
RM.moduli.push(function(anno){
  [milvio,corteo,assedio472,prigionieri593,sepoltura476,trionfo274,palazzo455,teatro493,vandali455,costante663,leone852,carlo800,saraceni846,totila546,casali756].forEach(function(s){ s.g.visible=anno>=s.da&&anno<s.a; });
  [fuga312,carlo800,S410].forEach(function(s){ var v=anno>=s.da&&anno<s.a; if(v&&!s.acceso&&s.seq.t==null) quadro(s.seq); s.acceso=v; s.tutte.forEach(function(m){ m.visible=v; }); });      // le scene animate: prima che partano, il quadro finale
  if(interno800 && !carlo800.acceso){ interno800.mostra(false); interno800.taglio(0); meno800=null; breve(null); }      // fuori dall'800 San Pietro torna intera (e la didascalia torna intera)
  macchie756(RM.sfuma(755.6,756,anno)*(1-RM.sfuma(757,760,anno)));
  tombe.forEach(function(s){ s.g.visible=anno>=s.da; });
  if(!(anno>=409.6&&anno<411)) giornoDiNuovo();      // la notte del 410 non resta accesa nelle altre tappe
  var inv=carlo800.acceso?1:0; inverno800(inv); if(inv) notte(.1);      // 800: la luce d'inverno, un poco più fredda (giornoDiNuovo la toglie nelle altre tappe)
  if(giochi) giochi.aggiorna(anno);      // RM.senzaGiochi=true li spegne (per le prove di peso)
  if(terremoto801){ terremoto801.detriti.visible=anno>=801&&anno<806; applicaScossa(); }
  if(S852){ t852=anno>=851.6&&anno<853; if(!t852) S852.macerie.visible=anno>=846.95; if(S852.anni&&!t852) S852.anni.style.display='none';
    if(!t852 && S852.attiva){ S852.leo.mat.userData.u.uCant.value=1; S852.attiva=false; } if(t852 && !S852.attiva){ S852.attiva=true; if(S852.seq.t==null) quadro(S852.seq); } }      // le macerie del Colosseo restano dopo l'847      // le travi restano a terra fino ai restauri; durante la sequenza la scossa comanda
  fortino552.g.visible=anno>=fortino552.da&&anno<fortino552.a; fortino552.g2.visible=anno>=fortino552.da2&&anno<fortino552.a2;
});

/* ---------- i nomi dei protagonisti sulla scena (25 novembre 2026, l'utente: «rendere riconoscibili i capi tipo Carlo Magno») ----------
   A quella scala il volto non si vede: chi è lo dicono il nome, il posto e ciò che la fonte gli mette attorno (il carro, la scorta, la croce, il seguito). Un cartellino segue la figura,
   nello stile dei nomi dei monumenti ma in oro (in bianco i nomi di gruppo o di luogo); toccato, dice in una riga che cosa fa e da quale fonte. Solo per chi la scena mostra davvero:
   Costantino, Alarico, Genserico, Teodorico, Totila, Narsete, papa Gregorio e Costante II nelle scene non ci sono e non si aggiungono (per Costantino, Alarico, Totila e Narsete
   c'è il nome del gruppo o del luogo che la fonte lega a loro). I cartellini non coprono i nomi dei monumenti né si coprono fra loro: se non c'è posto salgono, poi si nascondono.
   Sul telefono il nome corto e al massimo due alla volta. */
var quotaLeone3=null;
function dentro800(){ return !!(interno800 && interno800.attivo() && interno800.k()>.85); }
var CAPI=[
  {nome:'Aureliano', riga:'Sul carro del trionfo; davanti al carro sfilano Tetrico e Zenobia (Eutropio IX 13).', vis:function(){ return trionfo274.g.visible; }, p:function(){ return trionfo274.capi.aureliano; }, su:.2},
  {nome:'Zenobia', riga:'La regina di Palmira, prigioniera davanti al carro (Eutropio IX 13).', vis:function(){ return trionfo274.g.visible; }, p:function(){ return trionfo274.capi.zenobia; }},
  {nome:'Tetrico', riga:'L’imperatore delle Gallie, prigioniero davanti al carro (Eutropio IX 13).', vis:function(){ return trionfo274.g.visible; }, p:function(){ return trionfo274.capi.tetrico; }},
  {nome:'Massenzio', riga:'Fugge sul ponte di travi; le travi cedono e la corrente lo porta via (Zosimo II 16). Che fosse a cavallo è una scelta della ricostruzione.', vis:function(){ return !!fuga312.acceso; }, p:function(){ return fuga312.massenzio(); }},
  {nome:'Cavalieri di Costantino', corto:'Costantino', gruppo:true, riga:'Incalzano da nord; Costantino stesso non si vede. Il rosso è un colore di comodo.', vis:function(){ return !!fuga312.acceso; }, p:function(){ return fuga312.cavalieri(); }},
  {nome:'Costanzo II', riga:'Seduto solo sul carro d’oro, fra i draghi di porpora sulle aste e la doppia fila di armati (Ammiano XVI 10).', vis:function(){ return corteo.g.visible; }, p:function(){ return [corteo.carro[0],H(corteo.carro[0],corteo.carro[1])+.07,corteo.carro[1]]; }, su:.22},
  {nome:'Campo di Alarico', corto:'Alarico', gruppo:true, riga:'Procopio: Alarico si era accampato qui, davanti a porta Salaria, all’inizio dell’assedio. Forma e misure del campo sono uno schema.', vis:function(){ return !!S410.acceso; }, p:function(){ return S410.campo; }, su:.5},
  {nome:'Eudossia', riga:'L’imperatrice, portata via prigioniera con le figlie Eudocia e Placidia (Procopio III 5).', vis:function(){ return palazzo455.g.visible; }, p:function(){ return palazzo455.eudossia; }},
  {nome:'Goti di Totila', corto:'Totila', gruppo:true, riga:'Entrano di notte da porta Asinaria, aperta da quattro soldati isauri (Procopio VII 20).', vis:function(){ return totila546.g.visible; }, p:function(){ var x=193.8-.93*6, z=75.8-.36*6; return [x,H(x,z),z]; }, su:.35},
  {nome:'Esercito di Narsete', corto:'Narsete', gruppo:true, riga:'Davanti al forte dei Goti attorno al mausoleo di Adriano (Procopio VIII 33). Lo schieramento è uno schema.', vis:function(){ return fortino552.g2.visible; }, p:function(){ var x=-164.5, z=-127.3; return [x,H(x,z),z]; }, su:.4},
  {nome:'Carlo, re dei Franchi', corto:'Carlo', riga:'24 novembre: arriva a cavallo, scende e sale i gradini; il papa lo accoglie col clero (Annali dei Franchi, 800).', vis:function(){ return !!carlo800.acceso && carlo800.g.visible; }, p:function(){ return carlo800.carlo(); }, su:.26},
  {nome:'Leone III', corto:'Leone III', riga:'Il papa, sui gradini di San Pietro con il clero e i vescovi (Annali dei Franchi, 800).', vis:function(){ return !!carlo800.acceso && carlo800.g.visible; },
    p:function(){ if(quotaLeone3==null) quotaLeone3=quotaSu('pietro',-247.1,-108.1); return [-247.1,quotaLeone3,-108.1]; }},
  {nome:'Carlo', riga:'25 dicembre: davanti alla confessione di Pietro si alza dalla preghiera, e Leone III gli posa la corona sul capo (Annali dei Franchi, 801).', vis:dentro800, p:function(){ return interno800.pos.carlo; }, lontano:30, vicino:1.1, su:.2},
  {nome:'Leone III', riga:'Lo incorona «con le sue mani» (Liber Pontificalis), poi gli rende omaggio come agli antichi imperatori (Annali dei Franchi).', vis:dentro800, p:function(){ return interno800.pos.papa; }, lontano:30, vicino:1.1, su:.2},
  {nome:'Carlo il Giovane', corto:'Il figlio', riga:'Il figlio di Carlo: quel giorno il papa lo unge re (Liber Pontificalis, vita di Leone III).', vis:dentro800, p:function(){ return [interno800.pos.figlio[0],interno800.Y,interno800.pos.figlio[2]]; }, lontano:30, vicino:1.1, su:.2},
  {nome:'Leone IV', riga:'Sopra la porta che guarda a San Pellegrino recita la prima preghiera; il clero gira le mura scalzo (vita di Leone IV, 72-73).', vis:function(){ return leone852.g.visible; }, p:function(){ var q=leone852.porta; return [q[0],RM.h(q[0],q[1])+1.05,q[1]]; }}
];
var capiEl=null, capiW=-1, capiH=-1, vC=new THREE.Vector3(), contaF=0, rettM=[];
function capiPrepara(){
  var riq=document.querySelector('.riquadro.roma'); if(!riq) return false;
  capiEl=document.createElement('div'); capiEl.className='capi3d'; capiEl.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3'; riq.appendChild(capiEl);
  if(window.ResizeObserver) new ResizeObserver(function(){ capiW=capiEl.clientWidth; capiH=capiEl.clientHeight; }).observe(capiEl);      // 27 novembre 2026, notte: la misura letta quando cambia, non a ogni fotogramma
  CAPI.forEach(function(c){
    var s=document.createElement('span'), r=document.createElement('i'), n=document.createElement('b'), st=document.createElement('div'), oro=c.gruppo?'rgba(239,232,218,.8)':'rgba(244,210,124,.95)';
    s.setAttribute('role','button'); s.tabIndex=0; s.setAttribute('aria-expanded','false');
    s.style.cssText='position:absolute;left:0;top:0;display:none;text-align:center;pointer-events:auto;cursor:pointer;outline-offset:2px';
    r.style.cssText='display:none;width:max-content;max-width:230px;margin:0 auto 3px;padding:5px 8px;font:400 12.5px/1.3 system-ui,-apple-system,sans-serif;font-style:normal;color:#fff;background:rgba(40,22,26,.88);border-radius:6px;white-space:normal;text-align:left';
    /* 25 novembre 2026, «ritocca»: più grandi e su una pastiglia scura con il bordo, perché si leggano anche su suolo chiaro, sui tetti e di notte (i nomi dei monumenti
       sono solo scritte bianche: questi, che sono persone, si distinguono); il filo più spesso con un punto sulla figura; sul telefono la pastiglia è alta almeno 30 punti, da toccare */
    var tl=window.innerWidth<700, punto=document.createElement('div');
    n.style.cssText='display:inline-block;box-sizing:border-box;white-space:nowrap;font-family:var(--cap),Cinzel,Georgia,serif;font-weight:700;font-size:'+(tl?'12.5px':'13.5px')+';line-height:1.2;letter-spacing:.08em;text-transform:uppercase;'+
      'color:'+(c.gruppo?'#f3ede0':'#f7da8c')+';background:rgba(28,16,10,.8);border:1.5px solid '+oro+';border-radius:999px;padding:'+(tl?'7px 11px':'3px 10px')+';min-height:'+(tl?'30px':'0')+';box-shadow:0 1px 5px rgba(0,0,0,.45)';
    st.style.cssText='width:2px;height:10px;margin:0 auto;background:'+oro+';box-shadow:0 0 2px rgba(0,0,0,.8)';
    punto.style.cssText='width:7px;height:7px;margin:-1px auto 0;border-radius:50%;background:'+oro+';box-shadow:0 0 0 1.5px rgba(28,16,10,.85)';
    r.textContent=c.riga; s.appendChild(r); s.appendChild(n); s.appendChild(st); s.appendChild(punto);
    function tocca(ev){ ev.stopPropagation(); ev.preventDefault(); c.aperto=!c.aperto; r.style.display=c.aperto?'block':'none'; s.setAttribute('aria-expanded',c.aperto?'true':'false'); c.lw=null; }
    s.addEventListener('click',tocca); s.addEventListener('pointerdown',function(ev){ ev.stopPropagation(); });
    s.addEventListener('keydown',function(ev){ if(ev.key==='Enter'||ev.key===' ') tocca(ev); });
    c.el=s; c.n=n; c.r=r; c.st=st; capiEl.appendChild(s);
  });
  return true;
}
function tocca2(a,b){ return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]; }
/* Le letture dell'impaginazione all'inizio del fotogramma (28 novembre 2026, quarto giro della fluidità sul telefono): i nomi dei monumenti visibili, la didascalia e la riga dei tempi
   si leggono prima che i nomi dei monumenti scrivano i loro stili (RM.frame.unshift), ogni sei fotogrammi come prima. Prima si leggevano dopo quelle scritture: mentre la camera si
   muoveva il browser doveva ricalcolare stili e impaginazione in mezzo al fotogramma. Ora i rettangoli sono quelli del fotogramma prima (prima erano vecchi fino a cinque). */
var capiVivi=false;
function leggiRett(){ rettM=[]; var rq=capiEl.getBoundingClientRect();      // i nomi dei monumenti visibili (js/monumenti.js)
  var et=document.querySelectorAll('.etichette3d span'); for(var i=0;i<et.length;i++){ if(et[i].style.visibility!=='visible') continue; var b=et[i].getBoundingClientRect(); if(b.width) rettM.push([b.left-rq.left-2,b.top-rq.top-2,b.right-rq.left+2,b.bottom-rq.top+2]); }
  var sopra=document.querySelectorAll('.riquadro.roma .evento, .riquadro.roma .riga-tempo');      // la didascalia dell'evento e la riga dei tempi: i nomi non ci vanno sopra
  for(i=0;i<sopra.length;i++){ var s2=getComputedStyle(sopra[i]); if(s2.display==='none'||+s2.opacity<.05) continue; var b2=sopra[i].getBoundingClientRect(); if(b2.width) rettM.push([b2.left-rq.left-4,b2.top-rq.top-4,b2.right-rq.left+4,b2.bottom-rq.top+4].concat([1])); } }
RM.frame.unshift(function(){ if(capiEl && capiVivi && (contaF%6)===0) leggiRett(); });
RM.frame.push(function(){
  if(!capiEl && !capiPrepara()) return;
  var w=capiW>=0?capiW:capiEl.clientWidth, h=capiH>=0?capiH:capiEl.clientHeight, tel=(RM.largW||window.innerWidth)<700, messi=[], quanti=0; if(!w||!h) return;
  var qualcuno=false; CAPI.forEach(function(c){ var p=null; try{ p=c.vis()&&c.p(); }catch(e){ p=null; } c.__p=p; if(p || c.el.style.display!=='none') qualcuno=true; });      // 28 novembre 2026, notte: senza nomi da mostrare né da spegnere non si legge l'impaginazione (sul banco da telefono un terzo di millesimo a fotogramma a 4x); al primo nome si rilegge subito
  if(!qualcuno){ contaF=0; capiVivi=false; return; }
  if(!capiVivi){ capiVivi=true; contaF=0; leggiRett(); }      // il primo nome: si legge subito, come prima
  contaF++;
  CAPI.forEach(function(c){
    var p=c.__p, ok=false;
    if(p && (!tel||quanti<2)){
      vC.set(p[0],p[1],p[2]);
      var dC=vC.distanceTo(RM.camera.position); if(dC<(c.lontano||75) && !(c.vicino && dC<c.vicino)){      // vicino: nei primi piani dell'800 il nome coprirebbe i volti (lo dice la riga dei tempi)
        vC.applyMatrix4(RM.camera.matrixWorldInverse);
        if(vC.z<-RM.camera.near-.1){ vC.set(p[0],p[1]+(c.su||.24),p[2]).project(RM.camera);      // davanti al piano vicino della camera: più vicino la figura non si disegna, e il nome finirebbe a caso sullo schermo
          if(vC.z<1 && Math.abs(vC.x)<.94 && Math.abs(vC.y)<.94){
            var px=(vC.x+1)*w/2, py=(1-vC.y)*h/2, testo=tel&&c.corto?c.corto:c.nome;
            if(c.n.textContent!==testo){ c.n.textContent=testo; c.lw=null; }
            if(c.el.style.display==='none'){ c.el.style.display='block'; }
            if(!c.lw){ c.lw=c.el.offsetWidth; c.lh=c.el.offsetHeight-c.st.offsetHeight-6; }
            for(var alza=0;alza<4 && !ok;alza++){ var y1=py-16-alza*(c.lh+4), r=[px-c.lw/2-3,y1-c.lh-2,px+c.lw/2+3,y1], rF=[r[0],r[1],r[2],py];      // rF: col filo fino alla figura
              ok=!messi.some(function(q){ return tocca2(r,q); }) && !rettM.some(function(q){ return (q[4] || !c.aperto) && tocca2(q[4]?rF:r,q); });      // aperto, scavalca i nomi dei monumenti ma non la didascalia (né col nome né col filo)
              if(ok){ messi.push(r); c.st.style.height=(10+alza*(c.lh+4))+'px'; } }
            if(ok){ quanti++; c.el.style.transform='translate(-50%,-100%) translate('+px.toFixed(1)+'px,'+py.toFixed(1)+'px)'; }
          } } } }
    if(!ok && c.el.style.display!=='none') c.el.style.display='none';
  });
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
/* La scena di Roma aspetta la carta (26 novembre 2026, l'utente: «410: l'animazione dell'assedio e del sacco nella mappa di Roma deve partire quando la mappa dell'impero
   arriva al 410»). Nella tappa del 410 la regia della carta mostra prima il 408 e il 409: finché li mostra, la città resta ferma com'era prima del sacco (il primo quadro
   della scena: il campo dei Goti fuori porta Salaria, la porta chiusa), con la luce di chi guarda e la vista d'insieme; quando la carta arriva al passo del 410 partono il volo
   e la scena, come prima all'arrivo. Il segnale è quello dei fuochi: RM.passoCarta (js/eventi.js), chiamato da js/mappa.js. Se la regia della carta si ferma prima
   (un tocco sulla carta) la scena parte subito; un passo della barra «Passo per passo» la rimette in attesa (408, 409) o la fa ripartire (410).
   Non aspetta: con meno animazioni, a tutto schermo, sul telefono (la carta non si vede accanto alla città), con l'attesa del via della carta (la regia non gira) e nelle prove ferme. */
var ASPETTA={410:S410.seq}, RIGA_ATTESA='La scena di Roma parte quando la carta arriva al 410', inAttesa=null, tappaOra=null;
function cartaGuida(){
  if(MENO || FERMA!=null || document.body.classList.contains('roma-grande') || window.innerWidth<=1000) return false;
  var m=document.getElementById('mappa'); return !!(m && m.offsetWidth>0);
}
function attesa(t){
  if(inAttesa) inAttesa.seq.attende=false; inAttesa=null; if(!t) return;
  var o=ASPETTA[t.anno]; o.attende=true; inAttesa={t:t,seq:o};
  fermaTutte(); quadro(o);                                                               // anche una scena già partita torna al quadro di prima del sacco
  if(portata && RM.vistaInsieme){ if(RM.controlli) RM.controlli.minDistance=16; RM.vistaInsieme(); portata=false; }
}
function aspettaCarta(t){
  if(!t || t.intermezzo || !ASPETTA[t.anno] || !cartaGuida()) return false;
  if(RM.passoCartaOra!=null && RM.passoCartaOra>=t.anno) return false;                  // la carta è già al suo anno
  if(!(window.RM_mappa && RM_mappa.inRegia && RM_mappa.inRegia())) return false;        // la regia della carta non gira (attesa del via, tocco): si parte subito
  attesa(t); return true;
}
function parti(){ var t=inAttesa&&inAttesa.t; attesa(null); if(!t) return; if(document.body.classList.contains('roma-grande')) anima(t); else regia(t); }      // a tutto schermo, come al cambio di tappa: la vista resta dov'è, la scena parte
RM.suPassoCarta && RM.suPassoCarta.push(function(y){
  var t=tappaOra; if(!t || t.intermezzo || !ASPETTA[t.anno]) return;
  if(inAttesa){
    if(y!=null && y>=t.anno) parti();
    else if(y==null) setTimeout(function(){ if(inAttesa && !(window.RM_mappa && RM_mappa.inRegia && RM_mappa.inRegia())) parti(); },80);      // null anche all'avvio della regia: si guarda un attimo dopo
    return;
  }
  if(y!=null && y<t.anno && cartaGuida()) attesa(t);                                     // la carta ricomincia dal 408 (il ▶ o un passo della barra): la scena torna ad aspettare
});
if(window.RM_pagina) RM_pagina.quando(function(i,t){
  attesa(null); tappaOra=t;
  fermaTutte();                                                                          // le scene animate della tappa di prima tornano al loro quadro
  if(document.body.classList.contains('roma-grande')){ anima(t); return; }               // a tutto schermo decide chi guarda: la vista resta dov'è, la scena parte
  var telefono=window.innerWidth<=1000; if(telefono && scena()!=='roma') return;         // sul telefono la città non si apre da sola
  regia(t);
});
/* la tappa d'apertura (indirizzo diretto, #410) è scelta da js/pagina.js prima che questo file ascolti: se è una che aspetta la carta e la regia della carta gira,
   la scena parte quando la carta arriva al suo anno; se la regia aspetta il via («▶ Guarda la scena»), parte dopo il via, allo stesso passo */
/* (26 novembre 2026) js/pagina.js applica l'anno d'apertura prima che questo file ci sia: le scene dell'anno restavano nascoste finché l'anno non cambiava
   (con l'indirizzo #410 la porta Salaria era vuota). Qui si applicano una volta i moduli di questo file all'anno in cui la pagina si apre. */
if(window.RM_pagina && RM_pagina.annoOra){ var annoApertura=RM_pagina.annoOra(); RM.moduli.slice(moduliPrima).forEach(function(f){ f(annoApertura); }); }
if(window.RM_pagina && D.TAPPE){ tappaOra=D.TAPPE[RM_pagina.tappa()]||null; aspettaCarta(tappaOra); }
/* chiamata anche dalla riga «A Roma, in quest'anno» del telefono (js/pagina.js), dopo aver aperto la città */
RM.regiaTappa=function(t){ regia(t); };
function regia(t){
  if(aspettaCarta(t)) return;                                                            // 410: volo e scena aspettano il passo della carta
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
