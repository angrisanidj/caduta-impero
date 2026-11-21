/* La vita della città: gente attorno agli isolati abitati e lungo le vie, fumo dai tetti e dalle terme, barche sul Tevere.
   Tutto dipende dagli stessi dati della scena: quando un isolato si svuota, la sua gente e il suo fumo scompaiono. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto||!RM.isolati) return;
var D=window.RM_DATI, P=RM.P, rnd=RM.casuale(1453), isolati=RM.isolati, N=isolati.length, annoOra=235, quotaGente=1, tempo=0;

/* ---------- gente ---------- */
var PER_ISOLATO=RM.piccolo?1:2, NR=N*PER_ISOLATO, NV=RM.piccolo?600:1500, NZ=RM.piccolo?350:700, NG=RM.piccolo?200:360, NP=NR+NV+NZ+NG, quotaPellegrini=0;
var pos=new Float32Array(NP*3), col=new Float32Array(NP*3), giro=new Float32Array(NP), passo=new Float32Array(NP);
var ABITI=[0xfaf6ec,0x7a4a2e,0x8a5a3a,0x9c3b2e,0x4a5a6c,0x5f5a3c,0x3c342c,0xb5803f].map(RM.col), i, c;
for(i=0;i<NP;i++){
  c=ABITI[(rnd()*ABITI.length)|0]; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  giro[i]=rnd()*4; passo[i]=(rnd()<.5?-1:1)*(.05+.09*rnd());
}
/* vie campionate a passo costante */
var vie=RM.STRADE.map(function(s){
  var cv=new THREE.CatmullRomCurve3(s.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',.35), L=cv.getLength();
  return {p:cv.getSpacedPoints(Math.round(L/2)), L:L};
});
var lunghezza=vie.reduce(function(a,v){ return a+v.L; },0), viandanti=[];
for(i=0;i<NV;i++){
  var r=rnd()*lunghezza, k=0; while(r>vie[k].L){ r-=vie[k].L; k++; }
  var dentro=rnd()<.8;                                  // quasi tutti in città, pochi sulle vie consolari
  viandanti.push({v:k, s:dentro?rnd()*Math.min(1,230/vie[k].L):rnd(), vel:(rnd()<.5?-1:1)*(.9+rnd()*.9)/vie[k].L, lato:(rnd()-.5)*1.1});
}
/* piazze e spianate dove la folla si vede: Foro, foro di Traiano, Colosseo, Pantheon, Campo Marzio, Trastevere */
var PIAZZE=[[-1.2,1.6,5.5,2.2],[-1.3,-27.8,4.5,3.5],[57,26,13.5,12],[-70,-77,4,3],[-95,-55,5,5],[-125,38,4,4],[30,-2,5,3]], folla=[];
for(i=0;i<NZ;i++){ var pz=PIAZZE[i%PIAZZE.length], an=rnd()*6.283, rr=(pz===PIAZZE[2]?.82+.18*rnd():Math.sqrt(rnd())); folla.push({p:pz,a:an,r:rr,vel:(rnd()-.5)*.12}); }
/* pellegrini a San Pietro: metà nell'atrio e sul sagrato, metà in cammino lungo il portico da ponte Elio. Crescono mentre la città cala */
var pellegrini=[]; for(i=0;i<NG;i++) pellegrini.push({s:rnd(), a:rnd()*6.283, r:Math.sqrt(rnd()), vel:(rnd()<.5?-1:1)*(.012+.02*rnd()), lato:(rnd()-.5)*1.6});
var PELLEGRINI_NEL_TEMPO=[[320,0],[400,.22],[500,.42],[700,.75],[800,1],[852,1]];
var texPunto=RM.tela(16,16,function(g){ g.fillStyle='#fff'; g.beginPath(); g.arc(8,8,6.5,0,6.3); g.fill(); },false);
var gGente=new THREE.BufferGeometry();
gGente.setAttribute('position',new THREE.BufferAttribute(pos,3)); gGente.setAttribute('color',new THREE.BufferAttribute(col,3));
var matGente=new THREE.PointsMaterial({size:.6,vertexColors:true,sizeAttenuation:true,transparent:true,map:texPunto,alphaTest:.4});
matGente.onBeforeCompile=function(sh){ sh.vertexShader=sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>'+String.fromCharCode(10)+'gl_PointSize=max(gl_PointSize,2.6);'); };
var gente=new THREE.Points(gGente,matGente); gente.frustumCulled=false; RM.scene.add(gente);

function muoviGente(dt){
  var j=0, n, b, s, lato, f, hs, lx, lz, ca, sa, o;
  for(n=0;n<N;n++){
    b=isolati[n]; ca=Math.cos(b.ry); sa=Math.sin(b.ry);
    for(var q=0;q<PER_ISOLATO;q++,j++){
      o=j*3;
      if(b.a0<.5){ pos[o+1]=-60; continue; }
      s=giro[j]=(giro[j]+passo[j]*dt+4)%4; lato=s|0; f=s-lato; hs=b.w/2+.5+.25*q;       // gira attorno all'isolato
      if(lato===0){ lx=-hs+2*hs*f; lz=hs; } else if(lato===1){ lx=hs; lz=hs-2*hs*f; } else if(lato===2){ lx=hs-2*hs*f; lz=-hs; } else { lx=-hs; lz=-hs+2*hs*f; }
      pos[o]=b.x+lx*ca+lz*sa; pos[o+1]=b.y+.16; pos[o+2]=b.z-lx*sa+lz*ca;
    }
  }
  var visibili=Math.round(NV*quotaGente);
  for(n=0;n<NV;n++,j++){
    o=j*3; var w=viandanti[n];
    if(n>=visibili){ pos[o+1]=-60; continue; }
    w.s+=w.vel*dt; if(w.s>1||w.s<0){ w.vel=-w.vel; w.s=Math.max(0,Math.min(1,w.s)); }
    var pp=vie[w.v].p, t=w.s*(pp.length-1), k0=Math.min(pp.length-2,t|0), a=pp[k0], bb=pp[k0+1], g=t-k0, dx=bb.x-a.x, dz=bb.z-a.z, L=Math.hypot(dx,dz)||1;
    pos[o]=a.x+dx*g-dz/L*w.lato; pos[o+2]=a.z+dz*g+dx/L*w.lato; pos[o+1]=RM.hRapida(pos[o],pos[o+2])+.2;
  }
  var inPiazza=Math.round(NZ*quotaGente);
  for(n=0;n<NZ;n++,j++){
    o=j*3; var u=folla[n];
    if(n>=inPiazza){ pos[o+1]=-60; continue; }
    u.a+=u.vel*dt; pos[o]=u.p[0]+Math.cos(u.a)*u.r*u.p[2]; pos[o+2]=u.p[1]+Math.sin(u.a)*u.r*u.p[3]; pos[o+1]=RM.hRapida(pos[o],pos[o+2])+.3;
  }
  var arrivati=Math.round(NG*quotaPellegrini);
  for(n=0;n<NG;n++,j++){
    o=j*3; var pg=pellegrini[n];
    if(n>=arrivati){ pos[o+1]=-60; continue; }
    if(n%2){ pg.a+=pg.vel*dt*3; pos[o]=-246+Math.cos(pg.a)*pg.r*5.5; pos[o+2]=-108+Math.sin(pg.a)*pg.r*4.2; }                       // sagrato e atrio
    else{ pg.s+=pg.vel*dt; if(pg.s>1||pg.s<0){ pg.vel=-pg.vel; pg.s=Math.max(0,Math.min(1,pg.s)); } pos[o]=-158-89*pg.s; pos[o+2]=-111.5+3.5*pg.s+pg.lato; }   // dal ponte alla basilica
    pos[o+1]=RM.hRapida(pos[o],pos[o+2])+.3;
  }
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
magliaForni.castShadow=true; magliaForni.frustumCulled=false; RM.scene.add(magliaForni);
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
var fumo=new THREE.Points(gFumo,matFumo); fumo.frustumCulled=false; RM.scene.add(fumo);
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

/* ---------- barche ---------- */
var NB=16, scafo=new RM.Costruttore().scatola(1.9,.22,.55,0,0,0,P.tronco).scatola(.5,.16,.4,.95,.06,0,P.tronco).cilindro(.035,1.1,-.1,.2,0,P.tronco,.03,5);
scafo.quad([-.1,.45,-.55],[-.1,.45,.55],[-.1,1.2,.55],[-.1,1.2,-.55],P.marmo);
var barche=new THREE.InstancedMesh(scafo.geometria(),RM.matPietra(),NB), dati=[], d=new THREE.Object3D(), quotaBarche=1;
barche.instanceMatrix.setUsage(THREE.DynamicDrawUsage); barche.castShadow=true; barche.frustumCulled=false; RM.scene.add(barche);
for(i=0;i<NB;i++) dati.push({t:.4+rnd()*.26, vel:(i%2?-1:1)*(.0016+rnd()*.0016), lato:(rnd()-.5)*5});
function muoviBarche(dt){
  var visibili=Math.round(NB*quotaBarche);
  dati.forEach(function(b,k){
    b.t+=b.vel*dt; if(b.t>.67||b.t<.39){ b.vel=-b.vel; b.t=Math.max(.39,Math.min(.67,b.t)); }
    var p=RM.curvaFiume.getPoint(b.t), tg=RM.curvaFiume.getTangent(b.t), s=k<visibili?1:0;
    d.position.set(p.x-tg.z*b.lato,-.52,p.z+tg.x*b.lato); d.rotation.set(0,Math.atan2(-tg.z,tg.x)+(b.vel<0?Math.PI:0),0); d.scale.setScalar(s); d.updateMatrix(); barche.setMatrixAt(k,d.matrix);
  });
  barche.instanceMatrix.needsUpdate=true;
}

RM.moduli.push(function(anno){
  annoOra=anno;
  quotaGente=Math.min(1,D.interp(D.CURVE.popolazione.punti,anno)/900000);
  quotaBarche=Math.max(Math.min(1,D.interp(D.CURVE.commerci.punti,anno)/60), RM.sfuma(845.5,846,anno)*(1-RM.sfuma(846.4,847.4,anno)));   // nell'846 il fiume si riempie delle navi saracene
  quotaPellegrini=D.interp(PELLEGRINI_NEL_TEMPO,anno);
  FONTI.forEach(function(f){ if(f.id){ var q=RM.statoMonumento(f.id,anno), s=f.stato||'uso'; f.vivo=(q.s0===s?1-q.t:0)+(q.s1===s?q.t:0); } });
  mostraForni();
  matGente.opacity=1-.8*RM.notte;
});
RM.frame.push(function(dt){
  tempo+=dt;
  if(RM.leggero){ if(gente.visible){ gente.visible=false; fumo.visible=false; } }       // regolatore al terzo grado: si rinuncia a passanti e fumo
  else { muoviGente(dt); muoviFumo(); }
  muoviBarche(dt);
});
})();
