/* Sacchi e assedi: incendi con colonne di fumo scuro, accampamenti goti attorno alle mura, piena del Tevere, cielo velato del 536, didascalia dell'evento in corso.
   I dati stanno in dati.js (EVENTI). Gli isolati bruciati li gestisce citta.js, le brecce nelle mura mura.js. */
(function(){
'use strict';
var RM=window.RM, D=window.RM_DATI, didascalia=document.getElementById('evento');
var EV=D.EVENTI||[];
function atto(ev,anno){ return RM.sfuma(ev.da-.5,ev.da,anno)*(1-RM.sfuma(ev.a,ev.a+1.2,anno)); }     // 0…1: quanto l'evento è in scena
/* la didascalia funziona anche senza 3D */
/* La didascalia si può chiudere (23 novembre 2026, l'utente: «Fai in modo che sia possibile cancellare queste scritte»): la × la toglie finché in scena resta lo stesso evento;
   al posto suo resta un piccolo bottone «i» che la riporta. Un evento nuovo la mostra di nuovo. */
var testoEv=null, chiusa=null, riapri=null, ultimo=null;
if(didascalia){
  testoEv=document.createElement('span'); testoEv.className='ev-testo'; didascalia.textContent=''; didascalia.appendChild(testoEv);
  var x=document.createElement('button'); x.type='button'; x.className='ev-chiudi'; x.setAttribute('aria-label','Chiudi la didascalia'); x.textContent='×'; didascalia.appendChild(x);
  riapri=document.createElement('button'); riapri.type='button'; riapri.className='ev-riapri'; riapri.setAttribute('aria-label','Mostra la didascalia dell\'evento'); riapri.title='Mostra la didascalia'; riapri.textContent='i';
  didascalia.appendChild(riapri);      // dentro la didascalia: ne eredita le posizioni (tutto schermo, telefono, «Prima e dopo»)
  x.addEventListener('click',function(e){ e.stopPropagation(); chiusa=ultimo; aggiorna(); });
  riapri.addEventListener('click',function(e){ e.stopPropagation(); chiusa=null; aggiorna(); });
}
function aggiorna(){ var c=!!ultimo && chiusa===ultimo; didascalia.classList.toggle('vivo',!!ultimo); didascalia.classList.toggle('chiusa',c); }
function scrivi(anno){
  var vivo=null; EV.forEach(function(ev){ ev.q=atto(ev,anno); if(ev.q>.5) vivo=ev; });
  if(!didascalia) return;
  if(vivo && testoEv.textContent!==vivo.testo) testoEv.textContent=vivo.testo;
  if(vivo!==ultimo){ ultimo=vivo; if(chiusa && chiusa!==vivo) chiusa=null; aggiorna(); }
}
if(!RM||RM.guasto){ if(RM&&RM.moduli) RM.moduli.push(scrivi); return; }
var P=RM.P, rnd=RM.casuale(410), NL=String.fromCharCode(10), tempo=0;

/* ---------- accampamenti del 537: sei davanti alle porte da nord a est, uno oltre il Tevere ---------- */
var CAMPI=[[-80,-252,.1],[30,-226,.2],[116,-242,.4],[180,-215,.8],[250,-72,1.3],[292,18,1.6],[-215,-170,-.3]];   // davanti alle porte Flaminia, Pinciana, Salaria, Nomentana, Tiburtina, Prenestina; il settimo nel campo di Nerone
var campi=(function(){
  var B=new RM.Costruttore(), tela=[RM.col(0xd8c9a8),RM.col(0xc4b08a),RM.col(0xb99f7c)];
  CAMPI.forEach(function(c){
    var ca=Math.cos(c[2]), sa=Math.sin(c[2]), y0=RM.h(c[0],c[1]);
    B.dentro(c[0],y0,c[1],c[2],function(B){                                    // palizzata e fossato
      B.scatola(15,.45,.14,0,0,-6,P.tronco).scatola(15,.45,.14,0,0,6,P.tronco).scatola(.14,.45,12,-7.5,0,0,P.tronco).scatola(.14,.45,5,7.5,0,-3.5,P.tronco).scatola(.14,.45,5,7.5,0,3.5,P.tronco);
    });
    for(var i=-4;i<=4;i++) for(var j=-3;j<=3;j++){
      if(rnd()<.22) continue;
      var lx=i*1.55+(rnd()-.5)*.5, lz=j*1.6+(rnd()-.5)*.5, x=c[0]+lx*ca+lz*sa, z=c[1]-lx*sa+lz*ca;
      B.cono(.42+.2*rnd(),.5+.25*rnd(),x,RM.h(x,z),z,tela[(rnd()*3)|0],4);
    }
  });
  var m=B.maglia(RM.matPietra()); m.visible=false; RM.scene.add(m); return m;
})();

/* ---------- fuochi e fumo ---------- */
var fonti=[];                                 // {x,y,z,forza,ev,alto,chiaro}
EV.forEach(function(ev){
  (ev.fuochi||[]).forEach(function(f){
    for(var k=0;k<5;k++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*7*f[2], x=f[0]+Math.cos(a)*r, z=f[1]+Math.sin(a)*r; fonti.push({x:x,y:RM.h(x,z)+1.2,z:z,forza:f[2]*(.6+.6*rnd()),ev:ev,alto:38+14*rnd(),fiamma:true}); }
  });
  if(ev.campi) CAMPI.forEach(function(c){ fonti.push({x:c[0],y:RM.h(c[0],c[1])+.6,z:c[1],forza:.45,ev:ev,alto:14,fiamma:false}); });
});
var PER=9, NF=fonti.length*PER, fPos=new Float32Array(NF*3), fAlfa=new Float32Array(NF), fFase=new Float32Array(NF), i;
for(i=0;i<NF;i++) fFase[i]=rnd();
var gFumo=new THREE.BufferGeometry();
gFumo.setAttribute('position',new THREE.BufferAttribute(fPos,3)); gFumo.setAttribute('alfa',new THREE.BufferAttribute(fAlfa,1));
var texFumo=RM.tela(64,64,function(g){ var q=g.createRadialGradient(32,32,0,32,32,32); q.addColorStop(0,'rgba(255,255,255,1)'); q.addColorStop(.5,'rgba(255,255,255,.5)'); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(0,0,64,64); },false);
var matFumo=new THREE.ShaderMaterial({
  transparent:true, depthWrite:false,
  uniforms:{ map:{value:texFumo}, colore:{value:RM.col(0x3f3a36)}, lato:{value:1} },
  vertexShader:['attribute float alfa; varying float vA; uniform float lato;','void main(){ vA=alfa; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=(10.0+26.0*alfa)*lato/-mv.z; gl_Position=projectionMatrix*mv; }'].join(NL),
  fragmentShader:['uniform sampler2D map; uniform vec3 colore; varying float vA;','void main(){ gl_FragColor=vec4(colore,texture2D(map,gl_PointCoord).a*vA);','#include <encodings_fragment>','}'].join(NL)
});
var fumo=new THREE.Points(gFumo,matFumo); fumo.frustumCulled=false; fumo.visible=false; RM.scene.add(fumo);
/* bagliore delle fiamme */
var fiamme=fonti.filter(function(f){ return f.fiamma; }), bPos=new Float32Array(fiamme.length*3), bCol=new Float32Array(fiamme.length*3);
fiamme.forEach(function(f,k){ bPos[k*3]=f.x; bPos[k*3+1]=f.y+.6; bPos[k*3+2]=f.z; });
var gBagl=new THREE.BufferGeometry();
gBagl.setAttribute('position',new THREE.BufferAttribute(bPos,3)); gBagl.setAttribute('color',new THREE.BufferAttribute(bCol,3));
var texAlone=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,220,150,1)'); q.addColorStop(.3,'rgba(255,140,50,.55)'); q.addColorStop(1,'rgba(255,90,20,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);
var bagliori=new THREE.Points(gBagl,new THREE.PointsMaterial({size:15,map:texAlone,vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,sizeAttenuation:true,fog:false}));
bagliori.frustumCulled=false; bagliori.visible=false; RM.scene.add(bagliori);

/* ---------- piena del Tevere e cielo velato ----------
   La piena è un velo d'acqua sulle zone più basse e più vicine al fiume: l'estensione è indicativa, non una ricostruzione idraulica
   (il rilievo della scena è accentuato, quindi l'acqua ha uno spessore fisso e non la profondità vera).
   La maglia si costruisce la prima volta che serve. */
var piena=null, matPiena=new THREE.ShaderMaterial({
  transparent:true, depthWrite:false, uniforms:{ livello:{value:-9}, colore:{value:RM.col(0x87a094)} },
  vertexShader:['attribute float soglia; uniform float livello; varying float vF;','void main(){ vF=clamp((livello-soglia)*0.6,0.0,0.24); gl_Position=projectionMatrix*modelViewMatrix*vec4(position.x,position.y+vF,position.z,1.0); }'].join(NL),
  fragmentShader:['uniform vec3 colore; varying float vF;','void main(){ if(vF<0.004) discard; gl_FragColor=vec4(colore,smoothstep(0.0,0.07,vF)*0.84);','#include <encodings_fragment>','}'].join(NL)
});
var coloreAcqua=RM.col(0x87a094);
function posaPiena(){
  var PS=5, X0=-340, Z0=-420, NX=137, NZ=173, pos=new Float32Array(NX*NZ*3), sg=new Float32Array(NX*NZ), ind=[], c, r, k=0;
  for(r=0;r<NZ;r++) for(c=0;c<NX;c++,k++){
    var x=X0+c*PS, z=Z0+r*PS, y=RM.h(x,z); pos[k*3]=x; pos[k*3+1]=y; pos[k*3+2]=z;
    sg[k]=y+Math.max(0,RM.distFiume(x,z)-90)*.012;                               // lontano dal fiume l'acqua arriva meno in alto
  }
  for(r=0;r<NZ-1;r++) for(c=0;c<NX-1;c++){ k=r*NX+c; if(Math.min(sg[k],sg[k+1],sg[k+NX],sg[k+NX+1])>3.2) continue; ind.push(k,k+NX,k+1,k+1,k+NX,k+NX+1); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('soglia',new THREE.BufferAttribute(sg,1)); g.setIndex(ind);
  piena=new THREE.Mesh(g,matPiena); piena.frustumCulled=false; piena.renderOrder=2; RM.scene.add(piena);
}
function pienaEVelo(){
  var qp=0, qv=0; EV.forEach(function(ev){ if(ev.piena) qp=Math.max(qp,ev.q); if(ev.velo) qv=Math.max(qv,ev.q); });
  if(qp>.01 && !piena) posaPiena();
  if(piena){ piena.visible=qp>.01; matPiena.uniforms.livello.value=-1.4+qp*4.25; matPiena.uniforms.colore.value.copy(coloreAcqua).multiplyScalar(1-.75*RM.notte); }
  if(RM.applicaVelo) RM.applicaVelo(qv);
}

var acceso=false;
RM.moduli.push(function(anno){
  scrivi(anno); pienaEVelo();
  acceso=false; EV.forEach(function(ev){ if(ev.q>.01 && ((ev.fuochi&&ev.fuochi.length)||ev.campi)) acceso=true; });
  fumo.visible=bagliori.visible=acceso;
  var qc=0; EV.forEach(function(ev){ if(ev.campi) qc=Math.max(qc,ev.q); });
  campi.visible=qc>.02; campi.scale.y=Math.max(qc,.001);
});
RM.frame.push(function(dt){
  if(!acceso) return;
  tempo+=dt;
  matFumo.uniforms.lato.value=RM.renderer.domElement.height*.5;
  for(var k=0;k<NF;k++){
    var f=fonti[(k/PER)|0], p=(fFase[k]+tempo*.05*(1+(k%4)*.15))%1, o=k*3;
    fPos[o]=f.x+p*f.alto*.9+Math.sin(tempo*.25+k)*1.2*p; fPos[o+1]=f.y+p*f.alto; fPos[o+2]=f.z+p*f.alto*.35+Math.cos(tempo*.2+k)*1.2*p;
    fAlfa[k]=Math.sin(Math.PI*Math.pow(p,.6))*.62*f.forza*f.ev.q;
  }
  gFumo.attributes.position.needsUpdate=true; gFumo.attributes.alfa.needsUpdate=true;
  fiamme.forEach(function(f,j){
    var l=f.ev.q*f.forza*(.65+.35*Math.sin(tempo*9+j*2.3)*Math.sin(tempo*5.3+j)), n=.5+.5*RM.notte;       // di notte il bagliore si vede di più
    bCol[j*3]=l*n; bCol[j*3+1]=l*.55*n; bCol[j*3+2]=l*.2*n;
  });
  gBagl.attributes.color.needsUpdate=true;
});
})();
