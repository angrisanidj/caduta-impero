/* Chiese minori: titoli, diaconie, monasteri. Compaiono alla loro data e restano; attorno a ciascuna resiste un gruppo di case
   quando il resto della città si svuota (il peso è in RM.NUCLEI, base.js). I dati stanno in dati.js (CHIESE).
   Sono tutte la stessa chiesetta schematica: contano la posizione e la data, non l'architettura. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI, elenco=(D.CHIESE||[]).map(function(c){ var p=RM.ll(c[1],c[2]); return {nome:c[0],x:p[0],z:p[1],anno:c[3],tipo:c[4],p0:-1}; });
if(!elenco.length) return;
elenco.forEach(function(c){ RM.zone.push({x:c.x,z:c.z,r:2.8}); });                       // niente isolati sopra la chiesa
var B=new RM.Costruttore();
B.scatola(2.6,1.5,1.25,0,0,0,P.mattone).falde(2.7,.5,1.4,0,1.5,0,P.coppi,0,P.mattone);   // navata lungo x
B.cilindro(.55,1.2,-1.3,0,0,P.mattone,null,10).cono(.6,.35,-1.3,1.2,0,P.coppi,10);       // abside
B.scatola(.9,.9,1.6,1.75,0,0,P.mattone).scatola(1,.08,1.7,1.75,.9,0,P.coppi);            // nartece
B.aperture(-1,.63,1,.63,4,.95,.35,.18).aperture(1,-.63,-1,-.63,4,.95,.35,.18);
var maglia=new THREE.InstancedMesh(B.geometria(),RM.matPietra(),elenco.length), d=new THREE.Object3D();
maglia.castShadow=maglia.receiveShadow=true; maglia.frustumCulled=false; RM.scene.add(maglia);
elenco.forEach(function(c,i){ c.y=RM.h(c.x,c.z)-.1; c.ry=(RM.grana(i,3)-.5)*.9+(RM.grana(i,5)<.5?0:PI); });
RM.CHIESE=elenco;
RM.moduli.push(function(anno){
  var mosso=false;
  elenco.forEach(function(c,i){
    var p=RM.sfuma(c.anno-6,c.anno,anno); if(Math.abs(p-c.p0)<.002) return; c.p0=p; mosso=true;
    d.position.set(c.x,c.y,c.z); d.rotation.set(0,c.ry,0); d.scale.set(p>.01?1.25:0,Math.max(p*1.25,.001),p>.01?1.25:0); d.updateMatrix(); maglia.setMatrixAt(i,d.matrix);
  });
  if(mosso) maglia.instanceMatrix.needsUpdate=true;
});
})();
