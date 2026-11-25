/* La vita della città: gente lungo le vie (chi abita un isolato cammina sulla strada più vicina) e nelle piazze lastricate, fumo dai tetti e dalle terme, barche sul Tevere.
   Tutto dipende dagli stessi dati della scena: quando un isolato si svuota, la sua gente e il suo fumo scompaiono. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto||!RM.isolati) return;
var D=window.RM_DATI, P=RM.P, rnd=RM.casuale(1453), isolati=RM.isolati, N=isolati.length, annoOra=235, quotaGente=1, tempo=0;

/* ---------- gente ---------- */
var PER_ISOLATO=RM.piccolo?1:2, NR=N*PER_ISOLATO, NV=RM.piccolo?600:1500, NZ=RM.piccolo?350:700, NG=RM.piccolo?200:360, NP=NR+NV+NZ+NG, quotaPellegrini=0;
var pos=new Float32Array(NP*3), col=new Float32Array(NP*3), giro=new Float32Array(NP), passo=new Float32Array(NP), piedi=new Float32Array(NP);      // piedi: la quota del suolo sotto ciascuno (le figure vicine stanno lì)
var ABITI=[0xfaf6ec,0x7a4a2e,0x8a5a3a,0x9c3b2e,0x4a5a6c,0x5f5a3c,0x3c342c,0xb5803f].map(RM.col), i, c;
for(i=0;i<NP;i++){
  c=ABITI[(rnd()*ABITI.length)|0]; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  giro[i]=rnd()*4; passo[i]=(rnd()<.5?-1:1)*(.05+.09*rnd());
}
/* Le strade sono un nastro 1 m sopra il terreno disegnato (RM.nastro(…,.1) in js/base.js): chi cammina su una strada sta su quel nastro, se no ci affonda (24 novembre 2026) */
function hVia(x,z){ var a=RM.hRapida(x,z); return RM.hSuolo?Math.max(a,RM.hSuolo(x,z)+.1):a; }
/* vie campionate a passo costante */
var vie=RM.STRADE.map(function(s,i){
  var cv=new THREE.CatmullRomCurve3(s.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',.35), L=cv.getLength();
  return {p:cv.getSpacedPoints(Math.max(2,Math.round(L/2))), L:L, larga:((window.RM_TOPO||{}).stradeLarghe||[])[i]||.6};
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
var lunghezza=vie.reduce(function(a,v){ return a+v.L; },0), viandanti=[];
for(i=0;i<NV;i++){
  var r=rnd()*lunghezza, k=0; while(r>vie[k].L){ r-=vie[k].L; k++; }
  var dentro=rnd()<.8;                                  // quasi tutti in città, pochi sulle vie consolari
  viandanti.push({v:k, s:dentro?rnd()*Math.min(1,230/vie[k].L):rnd(), vel:(rnd()<.5?-1:1)*(.9+rnd()*.9)/vie[k].L, lato:(rnd()-.5)*1.5});      // lato: frazione della mezza larghezza della via
}
/* piazze lastricate dove la folla si vede: Foro, foro di Traiano, la spianata attorno al Colosseo, la piazza davanti al Pantheon */
var PIAZZE=[[-1.2,1.6,5.5,2.2],[-1.3,-27.8,4.5,3.5],[57,26,13.5,12],[-70,-77,4,3]], folla=[];
for(i=0;i<NZ;i++){ var pz=PIAZZE[i%PIAZZE.length], an=rnd()*6.283, rr=(pz===PIAZZE[2]?.82+.18*rnd():Math.sqrt(rnd())); folla.push({p:pz,a:an,r:rr,vel:(rnd()-.5)*.12}); }
/* pellegrini a San Pietro: metà nell'atrio e sul sagrato, metà in cammino lungo il portico da ponte Elio. Crescono mentre la città cala */
var pellegrini=[]; for(i=0;i<NG;i++) pellegrini.push({s:rnd(), a:rnd()*6.283, r:Math.sqrt(rnd()), vel:(rnd()<.5?-1:1)*(.012+.02*rnd()), lato:(rnd()-.5)*1.6});
/* la via che dal ponte Elio porta a San Pietro: i pellegrini in cammino la seguono, oppure stanno sotto il portico che le corre accanto */
var viaPietro=(function(){
  var meglio=-1, m=1e9; vie.forEach(function(v,k){ var a=1e9, b=1e9; v.p.forEach(function(q){ a=Math.min(a,Math.hypot(q.x+172,q.z+110)); b=Math.min(b,Math.hypot(q.x+236,q.z+108)); }); if(a+b<m){ m=a+b; meglio=k; } });
  if(meglio<0 || m>14) return null;
  var p=vie[meglio].p, ia=0, ib=0, da=1e9, db=1e9; p.forEach(function(q,k){ var d1=Math.hypot(q.x+160,q.z+107), d2=Math.hypot(q.x+243.5,q.z+108); if(d1<da){ da=d1; ia=k; } if(d2<db){ db=d2; ib=k; } });
  return {v:meglio, ia:ia, ib:ib};
})();
var PELLEGRINI_NEL_TEMPO=[[320,0],[400,.22],[500,.42],[700,.75],[800,1],[852,1]];
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
  soldato7:{orlo:.55, maniche:'lunghe', cintura:true, manto:{t:'corto', col:LT.bruno}, scudo:{r:.4}, lancia:true, barba:true, tinte:[LT.crema,LT.grigio,LT.bruno]}      // IPOTESI intera: della milizia romana nessuna fonte dice la veste; tunica, mantello, scudo e lancia, niente elmo
};
var VECCHIE=[{orlo:.52, maniche:'corte', cintura:true},{orlo:.36, maniche:'lunghe', manto:{t:'vecchio', col:LANA}},{orlo:.02, maniche:'lunghe', velo:{t:'palla', col:VELO}},{orlo:.02, maniche:'lunghe', manto:{t:'toga3', col:BIANCO}},{seduto:true, maniche:'corte'}];      // le cinque fogge di prima (0-4), coi colori che js/scene-tappe.js riconosce
function epoca(anno){ return anno<=330?0:anno<=600?1:2; }      // III secolo; IV-VI; VII-IX
/* i passanti di ogni epoca: [veste, quota su cento, statura] (le quote sono di comodo, come prima) */
var EPOCHE=[
  [['uomo3',26],['uomo3b',16],['tunica3',14],['tunica3',8,.62],['toga3',4],['donna3',32]],
  [['uomo4',20],['uomo4b',14],['tunica4',12],['tunica4',8,.62],['schiavo4',8],['donna4',18],['donna4b',14],['clero4',6]],
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
function corpo(v,k,d){
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
  B.metti(tratto([0,1.42,0],[0,1.53,.008],.045,.042,L),pel,0,true);                                                                      // il collo
  var barba=v.barba?function(x,y,z){ return (y<1.565&&z>-.01&&y>1.47)?cap.clone().lerp(pel,.25+.5*sm(1.53,1.565,y)):null; }:null;      // la barba corta (VII-IX secolo: Teodoto, Gordiano)
  var fronte=ve&&ve.fascia?function(x,y,z){ return (y>1.655&&y<1.69&&z>.02)?ve.fascia:null; }:null;      // la fascia chiara sulla fronte, sotto il velo (Turtura)
  B.metti(testaG(LT2,L>=6),pel,0,true,barba||fronte);      // i volumi del volto ai passanti (sei lati: si possono vedere da vicino); le figure delle scene (cinque) hanno la testa più semplice                                                                                    // la testa
  if(v.elmo){ B.metti(new THREE.SphereGeometry(.093,LS,4,0,Math.PI*2,0,Math.PI*.53).scale(.95,1,1.08).translate(0,1.618,-.004),FERRO,0,true);      // l'elmo
    B.metti(new THREE.BoxGeometry(.022,v.elmo.cresta,.2).translate(0,1.7+v.elmo.cresta/2,-.012),CRINE,0,true); }                        // la cresta
  else if(!ve) B.metti(new THREE.SphereGeometry(.087,LL,L>=6?4:3,0,Math.PI*2,0,Math.PI*.56).scale(.95,1,1.1).rotateX(-.42).translate(0,1.632,-.004),cap,0,true);      // i capelli, corti
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
  return (TAB[ep]={nomi:nomi, t:t}); }
function maglieEpoca(ep){
  if(SET[ep]) return SET[ep];
  SET[ep]=tabella(ep).nomi.map(function(nome,q){ var g=cuoci(corpo(nome,q*3+1)); g.setAttribute('fase',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1)); g.setAttribute('moto',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1));
    g.setAttribute('posa',new THREE.InstancedBufferAttribute(new Float32Array(MAXF*3),3));
    var m=new THREE.InstancedMesh(g,matF,MAXF); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAXF*3),3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count=0; m.visible=false; m.frustumCulled=false; m.receiveShadow=true; m.userData.gruppo='vita'; RM.scene.add(m); figure.push(m); return m; });
  return SET[ep]; }
function vestiEpoca(anno){      // le tinte di tutti, per l'epoca dell'anno
  var ep=epoca(anno); if(ep===EP) return; EP=ep; var T=tabella(ep).t, i;
  for(i=0;i<NP;i++){ var h=((i*2654435761)>>>0)%100, v=T[h].v, ti=v.tinte, c=ti[((i*7919)>>>0)%ti.length], k=.9+((i*.371)%1)*.2, cp=(v.manto&&v.manto.col)||(v.velo&&v.velo.col)||c;
    colT[i*3]=c.r*k; colT[i*3+1]=c.g*k; colT[i*3+2]=c.b*k; k*=.8; col[i*3]=cp.r*k; col[i*3+1]=cp.g*k; col[i*3+2]=cp.b*k; }      // il punto lontano non ha luce né ombra: un poco più scuro, come la figura illuminata
  if(gGente) gGente.attributes.color.needsUpdate=true;
  figure.forEach(function(m){ m.count=0; m.visible=false; }); }
if(MAXF){
  var texOmbra=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(0,0,0,.55)'); q.addColorStop(.6,'rgba(0,0,0,.25)'); q.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);
  ombraFig=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:texOmbra,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),MAXF);
  ombraFig.instanceMatrix.setUsage(THREE.DynamicDrawUsage); ombraFig.count=0; ombraFig.visible=false; ombraFig.frustumCulled=false; ombraFig.userData.gruppo='vita'; RM.scene.add(ombraFig);
}
var dirF=new Float32Array(NP), prima=new Float32Array(NP*2), mF=new THREE.Matrix4(), qF=new THREE.Quaternion(), vF=new THREE.Vector3(), sF=new THREE.Vector3(), eF=new THREE.Euler();
function figureVicine(n){
  var max=MAXF?(RM.QUALITA.figure[RM.q]||0):0, i, k;
  if(!max){ if(MAXF && (figure.some(function(m){ return m.count; })||ombraFig.count||ombraFig.visible)){ figure.forEach(function(m){ m.count=0; m.visible=false; }); ombraFig.count=0; ombraFig.visible=false; } return; }      // spente: in «bassa» non si compilano né si disegnano
  if(EP<0) vestiEpoca(annoOra);
  var cam=RM.camera.position, lim=.165*RM.vistaU.uPxScala.value/12, lim2=lim*lim, M=null, T=tabella(EP).t, conta=null, tot=0, cx=cam.x, cy=cam.y, cz=cam.z;      // vicina: alta più di dodici pixel sullo schermo
  for(i=0;i<n;i++){ var o=i*3, y=pos[o+1]; if(y<-50) continue;
    var dx=pos[o]-cx, dz=pos[o+2]-cz, dy=y-cy, d2=dx*dx+dy*dy+dz*dz, mx=pos[o]-prima[i*2], mz=pos[o+2]-prima[i*2+1], mv=mx*mx+mz*mz;
    if(mv>1e-8 && mv<1) dirF[i]=Math.atan2(mx,mz); prima[i*2]=pos[o]; prima[i*2+1]=pos[o+2];
    if(d2>lim2 || tot>=max) continue;
    if(!M){ M=maglieEpoca(EP); conta=M.map(function(){ return 0; }); }
    var fg=T[((i*2654435761)>>>0)%100], m=M[fg.f], c=conta[fg.f]++, ps=posaDi(i,false), mo=mv>1e-8&&mv<1?1:0; tot++;
    eF.set(0,dirF[i],0); qF.setFromEuler(eF); vF.set(pos[o],piedi[i],pos[o+2]); sF.set(fg.s,fg.s,fg.s); mF.compose(vF,qF,sF); m.setMatrixAt(c,mF);
    m.instanceColor.setXYZ(c,colT[o],colT[o+1],colT[o+2]); m.geometry.attributes.fase.array[c]=(i*.618034%1)*6.283; m.geometry.attributes.moto.array[c]=mo;
    m.geometry.attributes.posa.array[c*3]=ps.yaw*(mo?.6:1); m.geometry.attributes.posa.array[c*3+1]=ps.braccio; m.geometry.attributes.posa.array[c*3+2]=mo?0:(((i>>3)%3)-1)*.0035;      // chi cammina gira meno la testa; chi sta fermo sposta il peso su una gamba
    sF.set(.075*fg.s,1,.075*fg.s); vF.y+=.003; mF.compose(vF,qF,sF); ombraFig.setMatrixAt(tot-1,mF);
    pos[o+1]=-60;                                                                                                           // il punto lontano si spegne
  }
  var S2=SET[EP]||[];
  for(k=0;k<S2.length;k++){ var mm=S2[k], ck=conta?conta[k]:0; mm.count=ck; mm.visible=ck>0; if(ck){ mm.instanceMatrix.needsUpdate=true; mm.instanceColor.needsUpdate=true; mm.geometry.attributes.fase.needsUpdate=true; mm.geometry.attributes.moto.needsUpdate=true; mm.geometry.attributes.posa.needsUpdate=true; } }
  ombraFig.count=tot; ombraFig.visible=tot>0; if(tot) ombraFig.instanceMatrix.needsUpdate=true;
}

function muoviGente(dt){
  var j=0, n, b, s, o, vp, tt, i0, pa, pb, fr, ex, ez, el, lat, lato, f, hs, lx, lz, ca, sa;
  for(n=0;n<N;n++){
    b=isolati[n];
    for(var q=0;q<PER_ISOLATO;q++,j++){
      o=j*3;
      if(b.a0<.5 || (b.vv<0 && !b.vicoli)){ pos[o+1]=-60; continue; }
      s=giro[j]=(giro[j]+passo[j]*dt+4)%4;
      if(b.vv<0 || (q===1 && b.vicoli)){                                                 // nei vicoli, attorno all'isolato
        ca=Math.cos(b.ry); sa=Math.sin(b.ry); lato=s|0; f=s-lato; hs=b.w/2+.45;
        if(lato===0){ lx=-hs+2*hs*f; lz=hs; } else if(lato===1){ lx=hs; lz=hs-2*hs*f; } else if(lato===2){ lx=hs-2*hs*f; lz=-hs; } else { lx=-hs; lz=-hs+2*hs*f; }
        pos[o]=b.x+lx*ca+lz*sa; pos[o+1]=b.y+.16; piedi[j]=b.y; pos[o+2]=b.z-lx*sa+lz*ca; continue;
      }
      vp=vie[b.vv];
      tt=Math.max(0,Math.min(vp.p.length-1.001,b.vi+(3+2*q)*(Math.abs(s-2)-1)));       // avanti e indietro lungo la via di casa, per una sessantina di metri
      i0=tt|0; pa=vp.p[i0]; pb=vp.p[i0+1]; fr=tt-i0; ex=pb.x-pa.x; ez=pb.z-pa.z; el=Math.hypot(ex,ez)||1; lat=((j*.618034)%1-.5)*1.5*vp.larga;
      pos[o]=pa.x+ex*fr-ez/el*lat; pos[o+2]=pa.z+ez*fr+ex/el*lat; piedi[j]=hVia(pos[o],pos[o+2]); pos[o+1]=piedi[j]+.2;
    }
  }
  var visibili=Math.round(NV*quotaGente);
  for(n=0;n<NV;n++,j++){
    o=j*3; var w=viandanti[n];
    if(n>=visibili){ pos[o+1]=-60; continue; }
    w.s+=w.vel*dt; if(w.s>1||w.s<0){ w.vel=-w.vel; w.s=Math.max(0,Math.min(1,w.s)); }
    var pp=vie[w.v].p, t=w.s*(pp.length-1), k0=Math.min(pp.length-2,t|0), a=pp[k0], bb=pp[k0+1], g=t-k0, dx=bb.x-a.x, dz=bb.z-a.z, L=Math.hypot(dx,dz)||1;
    var fuori=w.lato*vie[w.v].larga; pos[o]=a.x+dx*g-dz/L*fuori; pos[o+2]=a.z+dz*g+dx/L*fuori; piedi[j]=hVia(pos[o],pos[o+2]); pos[o+1]=piedi[j]+.2;
  }
  var inPiazza=Math.round(NZ*quotaGente);
  for(n=0;n<NZ;n++,j++){
    o=j*3; var u=folla[n];
    if(n>=inPiazza){ pos[o+1]=-60; continue; }
    u.a+=u.vel*dt; pos[o]=u.p[0]+Math.cos(u.a)*u.r*u.p[2]; pos[o+2]=u.p[1]+Math.sin(u.a)*u.r*u.p[3]; piedi[j]=RM.hRapida(pos[o],pos[o+2])+.1; pos[o+1]=piedi[j]+.2;
  }
  var arrivati=Math.round(NG*quotaPellegrini);
  for(n=0;n<NG;n++,j++){
    o=j*3; var pg=pellegrini[n];
    if(n>=arrivati){ pos[o+1]=-60; continue; }
    if(n%2){ pg.a+=pg.vel*dt*3; pos[o]=-246.6+Math.cos(pg.a)*pg.r*3.5; pos[o+2]=-108+Math.sin(pg.a)*pg.r*2.9; }                     // nel cortile dell'atrio e sul sagrato lastricato davanti
    else{
      pg.s+=pg.vel*dt; if(pg.s>1||pg.s<0){ pg.vel=-pg.vel; pg.s=Math.max(0,Math.min(1,pg.s)); }
      if(n%4===0 || !viaPietro){ pos[o]=-180.1-66.8*pg.s; pos[o+2]=-109+4*pg.s+pg.lato*.55; }                                        // sotto il portico, lungo il suo asse
      else{ var vq=vie[viaPietro.v], tq=viaPietro.ia+(viaPietro.ib-viaPietro.ia)*pg.s, kq=Math.max(0,Math.min(vq.p.length-2,tq|0)), qa=vq.p[kq], qb=vq.p[kq+1], gq=tq-kq, qx=qb.x-qa.x, qz=qb.z-qa.z, ql=Math.hypot(qx,qz)||1, qf=pg.lato*vq.larga;
        pos[o]=qa.x+qx*gq-qz/ql*qf; pos[o+2]=qa.z+qz*gq+qx/ql*qf; piedi[j]=hVia(pos[o],pos[o+2]); pos[o+1]=piedi[j]+.3; continue; }                      // sulla via, dal ponte alla basilica
    }
    piedi[j]=RM.hRapida(pos[o],pos[o+2])+.1; pos[o+1]=piedi[j]+.2;
  }
  figureVicine(j);
  gGente.attributes.position.needsUpdate=true;
}

/* ---------- fumo ---------- */
var FONTI=[], PER_FONTE=4, PER_TERME=16;
for(i=0;i<130;i++){ var bf=isolati[(rnd()*N)|0]; FONTI.push({x:bf.x,y:bf.y+bf.alt,z:bf.z,b:bf,n:PER_FONTE,alto:7,forza:1}); }
[['caracalla',59,150],['diocleziano',108,-118],['traiano',92,-2]].forEach(function(t){ FONTI.push({x:t[1]+2,y:RM.h(t[1],t[2])+3.5,z:t[2]+3,id:t[0],n:PER_TERME,alto:16,forza:1.5}); });
/* calcare: accanto a ogni monumento usato come cava, un forno da calce che fuma finché dura lo smontaggio */
var forni=[];
(RM.MONUMENTI||[]).forEach(function(m){
  var st=D.MONUMENTI[m.id]||[]; if(m.x==null || !st.some(function(q){ return q[1]==='cava'; })) return;
  var x=m.x+(m.raggio||6)*.95+1.6, z=m.z+(m.raggio||6)*.45, f={x:x,y:RM.h(x,z)+.9,z:z,id:m.id,stato:'cava',n:8,alto:11,forza:1.2,vivo:0};
  FONTI.push(f); forni.push(f);
});
var geoForno=new RM.Costruttore().cilindro(.6,.55,0,0,0,P.tufo,.48,10).cupola(.48,0,.55,0,P.mattone,.8).scatola(.55,.26,.36,1,0,.25,P.marmo).scatola(.42,.22,.3,1.05,.26,.2,P.marmo).scatola(.5,.2,.3,.85,0,-.5,P.marmo,.6).geometria();
var magliaForni=new THREE.InstancedMesh(geoForno,RM.matPietra(),Math.max(1,forni.length)), dF=new THREE.Object3D();
magliaForni.castShadow=true; magliaForni.frustumCulled=false; magliaForni.userData.gruppo='vita'; RM.scene.add(magliaForni);
function mostraForni(){ for(var k=0;k<Math.max(1,forni.length);k++){ var f=forni[k]; dF.position.set(f?f.x:0,f?f.y-1:-80,f?f.z:0); dF.scale.setScalar(f&&f.vivo>.05?1.6:0); dF.updateMatrix(); magliaForni.setMatrixAt(k,dF.matrix); } magliaForni.instanceMatrix.needsUpdate=true; }
var NF=FONTI.reduce(function(a,f){ return a+f.n; },0), fPos=new Float32Array(NF*3), fFase=new Float32Array(NF), fDi=[];
FONTI.forEach(function(f){ for(var k=0;k<f.n;k++){ fFase[fDi.length]=rnd(); fDi.push(f); } f.vivo=1; });
var gFumo=new THREE.BufferGeometry(), fAlfa=new Float32Array(NF);
gFumo.setAttribute('position',new THREE.BufferAttribute(fPos,3)); gFumo.setAttribute('alfa',new THREE.BufferAttribute(fAlfa,1));
var texFumo=RM.tela(64,64,function(g){ var q=g.createRadialGradient(32,32,0,32,32,32); q.addColorStop(0,'rgba(255,255,255,1)'); q.addColorStop(.45,'rgba(255,255,255,.45)'); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(0,0,64,64); },false);
var NL=String.fromCharCode(10);
var matFumo=new THREE.ShaderMaterial({
  transparent:true, depthWrite:false,
  uniforms:{ map:{value:texFumo}, colore:{value:RM.col(0xd9d4cc)}, lato:{value:1} },
  vertexShader:['attribute float alfa; varying float vA; uniform float lato;','void main(){ vA=alfa; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=(7.0+13.0*alfa)*lato/-mv.z; gl_Position=projectionMatrix*mv; }'].join(NL),
  fragmentShader:['uniform sampler2D map; uniform vec3 colore; varying float vA;','void main(){ gl_FragColor=vec4(colore,texture2D(map,gl_PointCoord).a*vA);','#include <encodings_fragment>','}'].join(NL)
});
var fumo=new THREE.Points(gFumo,matFumo); fumo.frustumCulled=false; fumo.userData.gruppo='vita'; RM.scene.add(fumo);
var fumoG=RM.col(0xd9d4cc), fumoN=RM.col(0x30343f);
function muoviFumo(){
  matFumo.uniforms.lato.value=RM.renderer.domElement.height*.5;
  matFumo.uniforms.colore.value.copy(fumoG).lerp(fumoN,RM.notte);
  for(var k=0;k<NF;k++){
    var f=fDi[k], p=(fFase[k]+tempo*.045*(1+(k%5)*.12))%1, o=k*3, v=f.b?(f.b.a0>.5?1:0):f.vivo;
    fPos[o]=f.x+p*f.alto*.9+Math.sin(tempo*.3+k)*.6; fPos[o+1]=f.y+p*f.alto; fPos[o+2]=f.z+p*f.alto*.35+Math.cos(tempo*.23+k)*.6;
    fAlfa[k]=Math.sin(Math.PI*Math.sqrt(p))*.5*f.forza*v;
  }
  gFumo.attributes.position.needsUpdate=true; gFumo.attributes.alfa.needsUpdate=true;
}

/* ---------- barche ----------
   Seguono il filo della corrente a velocità costante, tenendo la destra, e passano sotto i ponti fra una pila e l'altra; in fondo al tratto virano.
   Due tratti navigabili: a monte, da ponte Milvio a ponte Aurelio; a valle, da ponte Emilio verso l'Emporio e San Paolo. Fra i due ci sono l'isola e, dal 537, i mulini. */
var NB=16, scafo=new RM.Costruttore().scatola(1.9,.22,.55,0,0,0,P.tronco).scatola(.5,.16,.4,.95,.06,0,P.tronco).cilindro(.035,1.1,-.1,.2,0,P.tronco,.03,5);
scafo.quad([-.1,.45,-.55],[-.1,.45,.55],[-.1,1.2,.55],[-.1,1.2,-.55],P.marmo);
var barche=new THREE.InstancedMesh(scafo.geometria(),RM.matPietra(),NB), dati=[], d=new THREE.Object3D(), quotaBarche=1;
barche.instanceMatrix.setUsage(THREE.DynamicDrawUsage); barche.castShadow=true; barche.frustumCulled=false; barche.userData.gruppo='vita'; RM.scene.add(barche);
var fiume=RM.curvaFiume; fiume.arcLengthDivisions=1200; fiume.updateArcLengths();
var lungoFiume=fiume.getLength();
function uVicino(x,z){ var m=1e9, um=0, k, q, dd; for(k=0;k<=1500;k++){ q=fiume.getPointAt(k/1500); dd=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z); if(dd<m){ m=dd; um=k/1500; } } return um; }
var TRATTI=[[uVicino(-152,-479)+6/lungoFiume, uVicino(-120,1)-5/lungoFiume],[uVicino(-52,38)+6/lungoFiume, uVicino(-90,400)]];
for(i=0;i<NB;i++){ var tr=i%3===0?0:1; dati.push({tr:tr, u:TRATTI[tr][0]+rnd()*(TRATTI[tr][1]-TRATTI[tr][0]), dir:i%2?-1:1, corsia:2.3+rnd()*.8, vel:.8+rnd()*.8, vira:0}); }
function muoviBarche(dt){
  var visibili=Math.round(NB*quotaBarche);
  dati.forEach(function(b,k){
    var T=TRATTI[b.tr], lato=b.dir*b.corsia, gira=0, e;
    if(b.vira>0){ b.vira=Math.max(0,b.vira-dt/6); e=1-b.vira; e=e*e*(3-2*e); lato=-b.dir*b.corsia*Math.cos(Math.PI*e); gira=Math.PI*(1-e); }      // virata: attraversa la corrente e riparte dall'altra parte
    else{ b.u+=b.dir*b.vel*dt/lungoFiume; if(b.u>T[1]||b.u<T[0]){ b.u=Math.max(T[0],Math.min(T[1],b.u)); b.dir=-b.dir; b.vira=1; lato=-b.dir*b.corsia; gira=Math.PI; } }
    var p=fiume.getPointAt(b.u), tg=fiume.getTangentAt(b.u), s=k<visibili?1:0;
    d.position.set(p.x-tg.z*lato,-.52,p.z+tg.x*lato); d.rotation.set(0,Math.atan2(-tg.z,tg.x)+(b.dir<0?Math.PI:0)-gira,0); d.scale.setScalar(s); d.updateMatrix(); barche.setMatrixAt(k,d.matrix);
  });
  barche.instanceMatrix.needsUpdate=true;
}

RM.moduli.push(function(anno){
  annoOra=anno; vestiEpoca(anno);
  quotaGente=Math.min(1,D.interp(D.CURVE.popolazione.punti,anno)/900000)*(1-RM.sfuma(545.6,546,anno)*(1-RM.sfuma(546.3,547.5,anno)));      // 546: Totila porta via gli abitanti e la città resta deserta «quadraginta aut amplius dies» (Marcellino Comes): alla tappa le strade sono vuote
  quotaBarche=Math.max(Math.min(1,D.interp(D.CURVE.commerci.punti,anno)/60), RM.sfuma(845.5,846,anno)*(1-RM.sfuma(846.4,847.4,anno)));   // nell'846 il fiume si riempie delle navi saracene
  quotaPellegrini=D.interp(PELLEGRINI_NEL_TEMPO,anno);
  FONTI.forEach(function(f){ if(f.id){ var q=RM.statoMonumento(f.id,anno), s=f.stato||'uso'; f.vivo=(q.s0===s?1-q.t:0)+(q.s1===s?q.t:0); } });
  mostraForni(); vicoli();
  matGente.opacity=1-.8*RM.notte;
});
RM.frame.push(function(dt){
  tempo+=dt; uPasso.value=tempo;
  if(RM.leggero){ if(gente.visible){ gente.visible=false; fumo.visible=false; figure.forEach(function(m){ m.visible=false; }); if(ombraFig) ombraFig.visible=false; } }       // regolatore al terzo grado: si rinuncia a passanti e fumo
  else { muoviGente(dt); muoviFumo(); }
  muoviBarche(dt);
});
})();
