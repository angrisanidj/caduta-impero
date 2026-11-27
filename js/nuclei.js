/* Chiese minori: titoli, diaconie, monasteri. Compaiono alla loro data e restano (salvo quelle con un anno di fine: Santa Maria Antiqua); attorno a ciascuna resiste un gruppo di case
   quando il resto della città si svuota (il peso è in RM.NUCLEI, base.js). I dati stanno in dati.js (CHIESE).
   Sono tutte la stessa chiesetta schematica: contano la posizione e la data, non l'architettura. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI, elenco=(D.CHIESE||[]).map(function(c){ var p=RM.ll(c[1],c[2]); return {nome:c[0],x:p[0],z:p[1],anno:c[3],tipo:c[4],fine:c[5]||1e4,p0:-1}; });
if(!elenco.length) return;
elenco.forEach(function(c){ RM.zone.push({x:c.x,z:c.z,r:2.8,dal:c.anno-2}); });       // niente isolati sopra la chiesa, da quando c'è: prima, una casa come le altre
var B=new RM.Costruttore();
B.scatola(2.6,1.5,1.25,0,0,0,P.mattone).falde(2.7,.5,1.4,0,1.5,0,P.coppi,0,P.mattone);   // navata lungo x
B.cilindro(.55,1.2,-1.3,0,0,P.mattone,null,10).cono(.6,.35,-1.3,1.2,0,P.coppi,10);       // abside
B.scatola(.9,.9,1.6,1.75,0,0,P.mattone).scatola(1,.08,1.7,1.75,.9,0,P.coppi);            // nartece
B.aperture(-1,.63,1,.63,4,.95,.35,.18).aperture(1,-.63,-1,-.63,4,.95,.35,.18);
var maglia=new THREE.InstancedMesh(B.geometria(),RM.matPietra(((window.RM_DATI.CERTEZZA||{}).chiese||['B'])[0]),elenco.length), d=new THREE.Object3D();
RM.veduta(maglia.material,{luce:.3,muro:0xe8dcc4,quanta:.4,tetto:0xb84a2c,quantaT:.55});      // veduta dei secoli tardi (RM.veduta in js/base.js): da lontano muri chiari e tetti di un rosso pulito, perché la chiesa in uso si stacchi dai ruderi
maglia.castShadow=maglia.receiveShadow=true; maglia.frustumCulled=false; maglia.userData.gruppo='citta'; RM.scene.add(maglia);
/* La patina del tempo (PATINA in js/costruttore.js), chiesa per chiesa: ognuna parte pulita dal suo anno e invecchia come tutta la città; torna indietro solo dove una fonte letta
   dice che fu restaurata (RESTAURI in js/monumenti.js, chiave «chiesa:» e il nome). Nessuna chiesa invecchia più piano
   delle altre senza una fonte (secondo giro, 27 novembre 2026). Tinte e ritmo sono una resa. */
var patC=new THREE.InstancedBufferAttribute(new Float32Array(elenco.length),1), patUlt=-1; maglia.geometry.setAttribute('aPatina',patC);
maglia.material.defines=maglia.material.defines||{}; maglia.material.defines.RM_PATI=''; maglia.material.userData.patinaPropria=true; maglia.material.userData.patina.value=1;
/* La quota dal terreno come è disegnato (RM.hSuolo), non da RM.h (25 novembre 2026): la maglia del suolo è più rada della funzione, e sui pendii Sant'Anastasia stava 10 m
   sotto terra e Santi Giovanni e Paolo 4 m sopra. Sui pendii si scende a metà fra la quota del centro e quella dello spigolo più basso della navata: la chiesa entra un poco
   nel monte e dal lato a valle non resta sospesa più di qualche metro (lo zoccolo è uno schema, non c'è). */
/* Sui pendii forti la chiesa si gira di un quarto di giro se così la navata segue di più le curve di livello (l'orientamento è comunque schematico: «contano la posizione e la data»). */
/* Le chiese che stanno attaccate a un monumento del modello, posate sul loro contorno (27 novembre 2026). San Giorgio al Velabro: girata a caso, copriva l'arco degli Argentari.
   Platner e Ashby, Arcus Argentariorum: l'arco «stands at the south-west angle of the church of S. Giorgio in Velabro, the campanile resting partly upon one pier of the arch».
   Il contorno della chiesa di oggi su OpenStreetMap (Nominatim): abside a nord (z 29,9), facciata col portico a sud (z 33,7), fianco ovest a x -18,7, a filo dell'arco
   (x -19,04, z 33,44). Qui la stessa chiesetta schematica, girata con la facciata a sud e accorciata a quella lunghezza (sx); il campanile, del XII secolo, non c'è. */
var FISSE={'San Giorgio al Velabro':{x:-17.69,z:31.67,ry:-PI/2,sx:.94}};
elenco.forEach(function(c,i){ var hq=RM.hSuolo||RM.h, y0=hq(c.x,c.z), r0=(RM.grana(i,3)-.5)*.9+(RM.grana(i,5)<.5?0:PI);
  function spigoli(ry){ var ca=Math.cos(ry), sa=Math.sin(ry); return [[-2,-.7],[2,-.7],[-2,.7],[2,.7]].map(function(q){ var lx=q[0]*1.25, lz=q[1]*1.25; return hq(c.x+lx*ca+lz*sa,c.z-lx*sa+lz*ca); }); }
  var a=spigoli(r0), b=spigoli(r0+PI/2), da=Math.max.apply(0,a)-Math.min.apply(0,a), db=Math.max.apply(0,b)-Math.min.apply(0,b), giro=da>.6&&db<da*.6;
  c.ry=giro?r0+PI/2:r0; c.y=(y0+Math.min(y0,Math.min.apply(0,giro?b:a)))/2-.1;
  var f=FISSE[c.nome]; if(f){ c.x=f.x; c.z=f.z; c.ry=f.ry; c.sx=f.sx; c.y=hq(c.x,c.z)-.1; } });
RM.CHIESE=elenco;
RM.moduli.push(function(anno){
  var mosso=false;
  elenco.forEach(function(c,i){
    var p=RM.sfuma(c.anno-6,c.anno,anno)*(1-RM.sfuma(c.fine-2,c.fine,anno)); if(Math.abs(p-c.p0)<.002) return; c.p0=p; mosso=true;
    d.position.set(c.x,c.y,c.z); d.rotation.set(0,c.ry,0); d.scale.set(p>.01?1.25*(c.sx||1):0,Math.max(p*1.25,.001),p>.01?1.25:0); d.updateMatrix(); maglia.setMatrixAt(i,d.matrix);
  });
  if(mosso) maglia.instanceMatrix.needsUpdate=true;
  var pA=RM.patinaAnno(anno); if(Math.abs(pA-patUlt)>.002){ patUlt=pA; elenco.forEach(function(c,i){ patC.array[i]=RM.patinaSpenta?0:RM.patinaRestauri('chiesa:'+c.nome,c.anno,anno); }); patC.needsUpdate=true; }
});
})();
