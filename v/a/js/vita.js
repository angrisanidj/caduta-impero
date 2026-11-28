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
var texPunto=RM.tela(32,32,function(g){ g.fillStyle='#fff'; g.beginPath(); g.arc(16,5,3.6,0,6.3); g.fill(); g.beginPath(); g.moveTo(12.4,9.5); g.lineTo(19.6,9.5); g.lineTo(21.5,20); g.lineTo(10.5,20); g.closePath(); g.fill(); },false);
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
function Parti(){ this.p=[]; this.n=[]; this.c=[]; this.o=[]; this.f=[]; }
Parti.prototype.metti=function(g,colore,osc,fisso){ var q=g.index?g.toNonIndexed():g, P=q.attributes.position.array, N=q.attributes.normal.array, i;
  for(i=0;i<P.length;i+=3){ this.p.push(P[i]*.1,P[i+1]*.1,P[i+2]*.1); this.n.push(N[i],N[i+1],N[i+2]); this.c.push(colore.r,colore.g,colore.b); this.o.push(osc||0); this.f.push(fisso?1:0); }
  return this; };
var SU=new THREE.Vector3(0,1,0);
function tratto(a,b,r0,r1,lati){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,lati,1,true);      // un tronco di cono fra due punti, in metri
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(SU,d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); return g; }
function girato(prof,lati,sx,sz){ var g=new THREE.LatheGeometry(prof.map(function(q){ return new THREE.Vector2(q[0],q[1]); }),lati); g.scale(sx||1,1,sz||1); return g; }      // un profilo girato attorno all'asse, schiacciato in pianta
/* Una figura in metri, i piedi a y=0, lo sguardo verso +z. foggia: 0 tunica, 1 mantello, 2 donna, 3 toga. Le parti «fisse» tengono il loro colore, le altre prendono quello della veste.
   d: lati dei pezzi tondi (6 per le figure dei passanti; le scene possono chiederne meno). */
function corpo(foggia,k,d){
  var B=new Parti(), pel=PELLE[k%PELLE.length], cap=CAPELLI[(k>>1)%CAPELLI.length], L=d||6, lunga=foggia===2, seduto=foggia===4, orlo=lunga?.04:seduto?.84:foggia===0?.56:.5, man=foggia===1||foggia===3;
  [-1,1].forEach(function(s){
    if(seduto){ B.metti(tratto([s*.1,.95,0],[s*.17,.9,.34],.075,.06,L),BIANCO,s,false).metti(tratto([s*.17,.9,.34],[s*.18,.48,.3],.055,.045,L),pel,s,true);      // a cavallo: le cosce in avanti, le gambe giù lungo i fianchi
      B.metti(new THREE.BoxGeometry(.09,.05,.2).translate(s*.18,.45,.36),SANDALO,s,true); return; }
    if(!lunga) B.metti(tratto([s*.085,.06,0],[s*.095,.9,0],.052,.072,L),pel,s,true);                                                      // le gambe nude sotto la tunica
    B.metti(new THREE.BoxGeometry(.09,.05,.22).translate(s*.085,.025,.04),SANDALO,s,true); });                                            // i sandali
  B.metti(girato([[.15,orlo],[.175,orlo+.03],[.16,(orlo+.95)/2],[.15,.95],[.16,1.18],[.19,1.36],[.12,1.45],[.06,1.47]],L+2,1,.72),BIANCO,0,false);      // la veste, dall'orlo alle spalle
  if(!lunga) B.metti(girato([[.158,.93],[.158,.98]],L+2,1,.73),SANDALO,0,true);                                                           // la cintura
  if(foggia===1) B.metti(girato([[.2,.6],[.215,.66],[.2,1.0],[.2,1.3],[.2,1.4],[.12,1.47]],L+2,1,.8),LANA,0,true);                         // il mantello di lana, fino al ginocchio
  if(foggia===3) B.metti(girato([[.19,.12],[.21,.2],[.2,.8],[.2,1.3],[.21,1.4],[.12,1.47]],L+2,1,.78),BIANCO,0,true);                      // la toga bianca, fino ai piedi
  if(lunga) B.metti(girato([[.2,1.0],[.2,1.3],[.21,1.42],[.1,1.52],[.11,1.66],[.06,1.73]],L+2,1,.85),VELO,0,true);                          // la palla, dalle spalle sopra il capo
  [-1,1].forEach(function(s){ var sp=[s*.2,1.38,0], gom=[s*.23,1.1,.02], ma=[s*.22,.84,.06];
    B.metti(tratto(sp,gom,.048,.042,L),man?LANA:BIANCO,2*s,man);                                                                         // il braccio, nella manica o sotto il mantello
    B.metti(tratto(gom,ma,.04,.034,L),pel,2*s,true).metti(new THREE.SphereGeometry(.04,5,3).translate(ma[0],ma[1]-.03,ma[2]),pel,2*s,true); });      // l'avambraccio nudo e la mano
  B.metti(tratto([0,1.42,0],[0,1.52,.005],.05,.045,L),pel,0,true);                                                                       // il collo
  B.metti(new THREE.SphereGeometry(.1,L+2,L).scale(.9,1.12,1).translate(0,1.6,.01),pel,0,true);                                          // la testa
  if(!lunga) B.metti(new THREE.SphereGeometry(.106,L+2,4,0,Math.PI*2,0,Math.PI*.55).scale(.92,1.05,1.02).rotateX(-.35).translate(0,1.61,-.005),cap,0,true);      // i capelli, corti
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));
  g.setAttribute('oscilla',new THREE.Float32BufferAttribute(B.o,1)); g.setAttribute('fisso',new THREE.Float32BufferAttribute(B.f,1)); return g;
}
RM.figuraGeo=corpo;
/* Le stesse figure, ferme, per chi costruisce scene con il Costruttore (js/scene-tappe.js): stessi argomenti delle sue figure a blocchi, così basta che le sue uomo e cavaliere
   chiamino queste. Cinque lati invece di sei (le scene ne mettono a centinaia): un uomo sono 351 triangoli (391 con lo scudo), un cavaliere 1255 (il cavallo è quello delle statue). Le pose sono ferme e indicative. */
var CACHE_F={};
function figuraTinta(foggia,k,col){ var ch=foggia+'|'+(k&3), g=CACHE_F[ch]||(CACHE_F[ch]=corpo(foggia,k&3,5)), q=g.clone(), c=q.attributes.color.array, f=q.attributes.fisso.array, i;
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
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute float oscilla; attribute float fisso; attribute float fase; attribute float moto; uniform float uPasso;'].join(A))
      .replace('#include <color_vertex>',['#include <color_vertex>','vColor.xyz=mix(vColor.xyz,color.xyz,fisso);'].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>',
        'float fP=uPasso*5.6+fase; float ao=abs(oscilla);',
        'if(ao>0.5){ float br=step(1.5,ao); float pv=mix(0.092,0.138,br); float an=sin(fP)*moto*mix(0.42,-0.32,br)*sign(oscilla);',
        '  vec3 q=transformed; q.y-=pv; float ca=cos(an), sa=sin(an); transformed=vec3(q.x,q.y*ca-q.z*sa,q.y*sa+q.z*ca); transformed.y+=pv; }',
        'transformed.y+=abs(sin(fP))*0.0035*moto;'].join(A));
  }; return m; }
var figure=[], ombraFig, MAXF=Math.max.apply(null,RM.QUALITA.figure);
if(MAXF){
  var matF=matFigure();
  [0,1,2,3].forEach(function(f){ var g=corpo(f,f*3+1); g.setAttribute('fase',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1)); g.setAttribute('moto',new THREE.InstancedBufferAttribute(new Float32Array(MAXF),1));
    var m=new THREE.InstancedMesh(g,matF,MAXF); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAXF*3),3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count=0; m.visible=false; m.frustumCulled=false; m.receiveShadow=true; m.userData.gruppo='vita'; RM.scene.add(m); figure.push(m); });
  var texOmbra=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(0,0,0,.55)'); q.addColorStop(.6,'rgba(0,0,0,.25)'); q.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);
  ombraFig=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:texOmbra,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),MAXF);
  ombraFig.instanceMatrix.setUsage(THREE.DynamicDrawUsage); ombraFig.count=0; ombraFig.visible=false; ombraFig.frustumCulled=false; ombraFig.userData.gruppo='vita'; RM.scene.add(ombraFig);
}
var dirF=new Float32Array(NP), prima=new Float32Array(NP*2), mF=new THREE.Matrix4(), qF=new THREE.Quaternion(), vF=new THREE.Vector3(), sF=new THREE.Vector3(), eF=new THREE.Euler();
function foggiaDi(j){ var h=((j*2654435761)>>>0)%100; return h<4?{f:3,s:1}:h<12?{f:0,s:.62}:h<46?{f:0,s:1}:h<66?{f:1,s:1}:{f:2,s:.95}; }      // toga 4%, bambini 8%, tunica 34%, mantello 20%, donne 34%: proporzioni di comodo
function figureVicine(n){
  var max=MAXF?(RM.QUALITA.figure[RM.q]||0):0, i, k;
  if(!max){ if(MAXF && (figure[0].count||ombraFig.count||ombraFig.visible)){ figure.forEach(function(m){ m.count=0; m.visible=false; }); ombraFig.count=0; ombraFig.visible=false; } return; }      // spente: in «bassa» non si compilano né si disegnano
  var cam=RM.camera.position, lim=.165*RM.vistaU.uPxScala.value/12, lim2=lim*lim, conta=[0,0,0,0], tot=0, cx=cam.x, cy=cam.y, cz=cam.z;      // vicina: alta più di dodici pixel sullo schermo
  for(i=0;i<n;i++){ var o=i*3, y=pos[o+1]; if(y<-50) continue;
    var dx=pos[o]-cx, dz=pos[o+2]-cz, dy=y-cy, d2=dx*dx+dy*dy+dz*dz, mx=pos[o]-prima[i*2], mz=pos[o+2]-prima[i*2+1], mv=mx*mx+mz*mz;
    if(mv>1e-8 && mv<1) dirF[i]=Math.atan2(mx,mz); prima[i*2]=pos[o]; prima[i*2+1]=pos[o+2];
    if(d2>lim2 || tot>=max) continue;
    var fg=foggiaDi(i), m=figure[fg.f], c=conta[fg.f]++; tot++;
    eF.set(0,dirF[i],0); qF.setFromEuler(eF); vF.set(pos[o],piedi[i],pos[o+2]); sF.set(fg.s,fg.s,fg.s); mF.compose(vF,qF,sF); m.setMatrixAt(c,mF);
    m.instanceColor.setXYZ(c,col[o],col[o+1],col[o+2]); m.geometry.attributes.fase.array[c]=(i*.618034%1)*6.283; m.geometry.attributes.moto.array[c]=mv>1e-8&&mv<1?1:0;
    sF.set(.075*fg.s,1,.075*fg.s); vF.y+=.003; mF.compose(vF,qF,sF); ombraFig.setMatrixAt(tot-1,mF);
    pos[o+1]=-60;                                                                                                           // il punto lontano si spegne
  }
  for(k=0;k<figure.length;k++){ var mm=figure[k]; mm.count=conta[k]; mm.visible=conta[k]>0; if(conta[k]){ mm.instanceMatrix.needsUpdate=true; mm.instanceColor.needsUpdate=true; mm.geometry.attributes.fase.needsUpdate=true; mm.geometry.attributes.moto.needsUpdate=true; } }
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
  annoOra=anno;
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
