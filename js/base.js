/* Base della scena: renderer, luce radente con ombre, cielo, terreno con i colli, Tevere, strade.
   Unità: 1 = 10 metri. Origine = Foro Romano (41.8925 N, 12.4853 E). x cresce verso est, z verso sud.
   Tevere, mura e quote del terreno sono dati reali (js/roma-topo.js, generato da src/roma/genera.mjs);
   le strade sono tracciate a mano fra punti noti (porte, ponti, piazze) e sono quindi approssimate. */
(function(){
'use strict';
var RM = window.RM = { moduli:[], zone:[], frame:[] };
var D0=window.RM_DATI||{};
RM.ll=function(lat,lon){ return [(lon-12.4853)*8287, -(lat-41.8925)*11113.2]; };       // da coordinate geografiche a coordinate della scena

/* ---- geografia ---- */
var TOPO=window.RM_TOPO;
RM.FIUME = TOPO.fiume;
RM.MURA = TOPO.mura;
/* vie principali: tengono liberi gli isolati e disegnano la città */
RM.STRADE = [
  [[-22,-37],[-77,-211],[-110,-330],[-152,-478],[-165,-600]],                       // via Lata e Flaminia, da piazza Venezia a porta del Popolo e ponte Milvio
  [[35,61],[43,96],[134,211],[304,417],[420,560]],                                   // Appia, per porta Capena e porta San Sebastiano
  [[-36,42],[-42,62],[-58,84],[-70,106],[-55,150],[-32,176],[-42,280],[-48,320],[-58,376],[-100,560]],  // Ostiense, lungo il fiume ai piedi dell'Aventino, per porta San Paolo
  [[-50,36],[-110,45],[-198,46],[-300,40],[-458,28]],                                // Aurelia, da ponte Emilio a porta San Pancrazio
  [[39,-22],[132,-36],[210,-56],[282,-98],[619,-250]],                               // Tiburtina
  [[72,22],[160,18],[249,12],[400,30],[619,50]],                                     // Labicana e Prenestina, per porta Maggiore
  [[24,-78],[80,-128],[139,-179],[270,-326],[420,-500]],                             // Alta Semita e Nomentana
  [[-44,-94],[-100,-98],[-150,-100],[-157,-104],[-157,-111],[-166,-112],[-185,-112],[-215,-110],[-247,-108]],// via Recta, ponte Elio, poi verso San Pietro
  [[13,-20],[50,-60],[85,-88]],                                                      // Vicus Longus
  [[43,96],[142,178],[370,361]],                                                     // Latina
  [[-50,36],[-94,96],[-210,250],[-300,400]],                                         // Portuense
  [[-110,45],[-147,3],[-185,-50],[-196,-87]],                                        // via Settimiana, verso il Vaticano
  [[80,-128],[106,-203],[120,-330],[130,-500]],                                      // Salaria
  [[66,34],[120,60],[194,76],[330,170]]                                              // verso il Laterano e porta Asinaria
];
/* giardini dei colli: verdi dal principio alla fine */
RM.HORTI = [[80,-167,20],[-36,-194,19],[138,-22,12],[171,-28,11],[221,-11,12],[20,-170,13],[236,48,9],[-150,120,12]];   // Sallustiani, Pincio, Mecenate, Lamiani, Liciniani, Luculliani, Spes Vetus, Cesare
/* dove la città resiste fino alla fine: ansa del Tevere, Trastevere, poli cristiani */
RM.NUCLEI = [[-102,-56,1,30],[-77,-22,1,26],[-115,40,.97,26],[-35,35,.97,20],[169,73,.97,13],[-240,-108,.5,30]]      // [x, z, tenuta, raggio]: Campo Marzio, Circo Flaminio, Trastevere, Ripa e Velabro, Laterano, Vaticano
  .concat((D0.CHIESE||[]).map(function(c){ var p=RM.ll(c[1],c[2]); return [p[0],p[1],.97,11]; }));               // e un piccolo nucleo attorno a ogni chiesa: l'abitato «a isole» dell'alto medioevo
function distSeg(px,pz,a,b){
  var dx=b[0]-a[0], dz=b[1]-a[1], t=((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz);
  t=Math.max(0,Math.min(1,t));
  var x=a[0]+t*dx-px, z=a[1]+t*dz-pz;
  return Math.sqrt(x*x+z*z);
}
RM.distLinea = function(px,pz,linea,chiusa){
  var d=1e9, n=linea.length, fine=chiusa?n:n-1;
  for(var i=0;i<fine;i++) d=Math.min(d,distSeg(px,pz,linea[i],linea[(i+1)%n]));
  return d;
};
RM.distFiume = function(x,z){ return RM.distLinea(x,z,RM.FIUME,false); };
RM.distStrade = function(x,z){ var d=1e9; for(var i=0;i<RM.STRADE.length;i++) d=Math.min(d,RM.distLinea(x,z,RM.STRADE[i],false)); return d; };
RM.dentroMura = function(x,z){
  var p=RM.MURA, dentro=false;
  for(var i=0,j=p.length-1;i<p.length;j=i++){
    if((p[i][1]>z)!==(p[j][1]>z) && x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0]) dentro=!dentro;
  }
  return dentro;
};
/* quota del terreno: griglia reale (metri sopra la riva del Tevere), interpolata; il letto del fiume è scavato */
var Q=TOPO.quote;
function quotaGriglia(x,z){
  var c=(x-Q.x0)/Q.dx, r=(Q.z0-z)/Q.dz;
  c=Math.max(0,Math.min(Q.colonne-1.001,c)); r=Math.max(0,Math.min(Q.righe-1.001,r));
  var c0=Math.floor(c), r0=Math.floor(r), fc=c-c0, fr=r-r0, i=r0*Q.colonne+c0;
  return ((Q.q[i]*(1-fc)+Q.q[i+1]*fc)*(1-fr)+(Q.q[i+Q.colonne]*(1-fc)+Q.q[i+Q.colonne+1]*fc)*fr)/10;
}
/* I colli. La griglia misurata è troppo liscia (e risente degli edifici moderni e dei riempimenti di duemila anni) per rendere
   le alture della città antica: qui sono ridisegnate come pianori dai fianchi ripidi, al loro posto e alle quote antiche note
   (unità = 10 m sopra la riva del Tevere). [x, z, raggio lungo, raggio corto, rotazione, quota] */
var COLLI=[
  [-29,1,10,8.5,0,3.3],[-19,-11,8.5,7.5,0,3.6],                 // Campidoglio: Capitolium e Arx
  [15,42,22,17,-.6,4.0],                                         // Palatino
  [36,12,12,9,0,2.3],                                            // Velia
  [-42,96,31,22,.6,3.6],[26,128,22,16,0,3.2],                    // Aventino e Piccolo Aventino
  [115,78,62,18,.15,3.8],[62,60,22,14,0,3.3],                    // Celio
  [100,-6,30,17,.2,4.0],[108,-55,26,14,.3,4.2],[176,-28,72,56,0,4.4],   // Esquilino: Oppio, Cispio, pianoro orientale
  [95,-95,46,13,-.75,4.3],                                       // Viminale
  [20,-70,24,10,-.75,4.4],[66,-121,42,13,-.75,4.6],[122,-152,62,42,0,4.6],   // Quirinale e pianoro del Castro Pretorio
  [-30,-192,33,18,.3,4.8]                                        // Pincio
];
var ESAGERA=1.8;                                                 // il rilievo è accentuato di quasi due volte, per leggerlo dall'alto
function colli(x,z){
  var y=0, i, c, dx, dz, ca, sa, u, v, d, f;
  for(i=0;i<COLLI.length;i++){
    c=COLLI[i]; dx=x-c[0]; dz=z-c[1]; if(Math.abs(dx)>c[2]||Math.abs(dz)>c[2]) continue;
    ca=Math.cos(c[4]); sa=Math.sin(c[4]); u=(dx*ca+dz*sa)/c[2]; v=(-dx*sa+dz*ca)/c[3]; d=Math.sqrt(u*u+v*v); if(d>=1) continue;
    f=1-RM.sfuma(.6,1,d); if(c[5]*f>y) y=c[5]*f;
  }
  return y;
}
/* terreno naturale: griglia misurata fuori città e per le alture maggiori (Gianicolo, Vaticano, Monte Mario), colli antichi dentro; letto del fiume scavato */
RM.hGrezza = function(x,z){
  var y=Math.max(Math.max(-.2,quotaGriglia(x,z)),colli(x,z))*ESAGERA, df=RM.distFiume(x,z), w=Math.exp(-(df*df)/55);
  return y*(1-w)-1.2*w;
};
/* terreno con le terrazze: sotto ogni grande monumento il suolo è spianato alla quota del suo centro (zone con h) */
RM.h = function(x,z){
  var y=RM.hGrezza(x,z), i, q, d, w, meglio=0, hb=0;
  for(i=0;i<RM.zone.length;i++){ q=RM.zone[i]; if(q.h==null) continue; d=Math.abs(x-q.x)+Math.abs(z-q.z); if(d>(q.r+7)*1.5) continue;
    d=Math.hypot(x-q.x,z-q.z); if(d<q.r+7){ w=1-RM.sfuma(q.r,q.r+7,d); if(w>meglio){ meglio=w; hb=q.h; } } }
  return meglio?y*(1-meglio)+hb*meglio:y;
};
/* quota letta da una griglia riempita al bisogno: per ciò che si muove a ogni fotogramma (passanti, fumo), dove RM.h costerebbe troppo */
var GR=2, GX0=-360, GZ0=-430, GNX=361, GNZ=446, griglia=null;
function nodo(c,r){ var i=r*GNX+c, v=griglia[i]; if(v!==v){ v=griglia[i]=RM.h(GX0+c*GR,GZ0+r*GR); } return v; }
RM.hRapida = function(x,z){
  var c=(x-GX0)/GR, r=(z-GZ0)/GR; if(c<0||r<0||c>=GNX-1||r>=GNZ-1) return RM.h(x,z);
  if(!griglia){ griglia=new Float32Array(GNX*GNZ); for(var k=0;k<griglia.length;k++) griglia[k]=NaN; }
  var c0=c|0, r0=r|0, fc=c-c0, fr=r-r0;
  return (nodo(c0,r0)*(1-fc)+nodo(c0+1,r0)*fc)*(1-fr)+(nodo(c0,r0+1)*(1-fc)+nodo(c0+1,r0+1)*fc)*fr;
};
RM.casuale = function(seme){            // generatore ripetibile
  var s=seme>>>0;
  return function(){ s=(s+0x6D2B79F5)>>>0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
};
RM.sfuma = function(a,b,t){ t=Math.max(0,Math.min(1,(t-a)/(b-a))); return t*t*(3-2*t); };
function grana(ix,iz){ var n=Math.sin(ix*127.1+iz*311.7)*43758.5453; return n-Math.floor(n); }
RM.rumore = function(x,z){               // rumore morbido 0…1
  var ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz; fx=fx*fx*(3-2*fx); fz=fz*fz*(3-2*fz);
  return (grana(ix,iz)*(1-fx)+grana(ix+1,iz)*fx)*(1-fz)+(grana(ix,iz+1)*(1-fx)+grana(ix+1,iz+1)*fx)*fz;
};
RM.grana = grana;

/* ---- renderer ---- */
var contenitore=document.getElementById('scena'), renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true}); }
catch(e){ document.getElementById('errore').hidden=false; RM.guasto=true; return; }
var piccolo=Math.min(window.innerWidth,window.innerHeight)<700; RM.piccolo=piccolo;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,piccolo?1.5:2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.07;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false;
contenitore.appendChild(renderer.domElement);
RM.col=function(hex){ return new THREE.Color(hex).convertSRGBToLinear(); };
/* trama disegnata su tela */
RM.tela=function(w,h,disegna,ripeti){
  var c=document.createElement('canvas'); c.width=w; c.height=h; disegna(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(ripeti!==false){ t.wrapS=t.wrapT=THREE.RepeatWrapping; }
  return t;
};

var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(36,1,2,9000);
camera.position.set(-200,255,470);
var controlli=new THREE.OrbitControls(camera,renderer.domElement);
controlli.target.set(0,0,5);
controlli.enableDamping=true; controlli.dampingFactor=.08;
controlli.minDistance=16; controlli.maxDistance=900;
controlli.maxPolarAngle=Math.PI*.475;
controlli.autoRotate=true; controlli.autoRotateSpeed=.22;
renderer.domElement.addEventListener('pointerdown',function(){ controlli.autoRotate=false; });
RM.scene=scene; RM.camera=camera; RM.renderer=renderer; RM.controlli=controlli;
/* volo di camera verso un punto: tiene la direzione da cui si sta guardando */
var volo=null;
RM.vola=function(x,z,dist,quota){
  controlli.autoRotate=false;
  var t1=new THREE.Vector3(x,(quota==null?RM.h(x,z):quota)+1,z), dir=camera.position.clone().sub(controlli.target); dir.y=0;
  if(dir.lengthSq()<1) dir.set(-.4,0,1); dir.normalize();
  var p1=t1.clone().add(dir.multiplyScalar(dist*.82)); p1.y=t1.y+dist*.56;
  volo={t:0,t0:controlli.target.clone(),p0:camera.position.clone(),t1:t1,p1:p1};
};
RM.vistaInsieme=function(){ controlli.autoRotate=false; volo={t:0,t0:controlli.target.clone(),p0:camera.position.clone(),t1:new THREE.Vector3(0,0,5),p1:new THREE.Vector3(-200,255,470)}; };
renderer.domElement.addEventListener('pointerdown',function(){ volo=null; });
renderer.domElement.addEventListener('wheel',function(){ volo=null; },{passive:true});
RM.frame.push(function(dt){
  if(!volo) return;
  volo.t=Math.min(1,volo.t+dt/1.5); var k=volo.t*volo.t*(3-2*volo.t);
  controlli.target.lerpVectors(volo.t0,volo.t1,k); camera.position.lerpVectors(volo.p0,volo.p1,k);
  if(volo.t>=1) volo=null;
});

/* ---- cielo, sole, luna ---- */
var G={ alto:RM.col(0x9fb9cc), basso:RM.col(0xefe3c8), emiSu:RM.col(0xcfe0ff), emiGiu:RM.col(0x6c6a84), sole:RM.col(0xffe4bb), iSole:2.9, iEmi:.66 };      // sole caldo, ombre fredde, orizzonte color carta
var N={ alto:RM.col(0x05070f), basso:RM.col(0x1a2238), emiSu:RM.col(0x2a3a66), emiGiu:RM.col(0x05060a), sole:RM.col(0x8fa6e8), iSole:.85, iEmi:.36 };
var cielo=new THREE.Mesh(new THREE.SphereGeometry(3600,32,16), new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{ alto:{value:G.alto.clone()}, basso:{value:G.basso.clone()} },
  vertexShader:'varying float q; void main(){ q=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform vec3 alto; uniform vec3 basso; varying float q; void main(){ gl_FragColor=vec4(mix(basso,alto,pow(clamp(q*1.6,0.0,1.0),0.55)),1.0);\n#include <encodings_fragment>\n}'
}));
scene.add(cielo);
scene.fog=new THREE.Fog(G.basso.getHex(),700,2300);
(function(){                              // stelle
  var r=RM.casuale(7), p=[], i, a, b;
  for(i=0;i<700;i++){ a=r()*Math.PI*2; b=Math.acos(r()*.96); p.push(3300*Math.sin(b)*Math.cos(a),3300*Math.cos(b),3300*Math.sin(b)*Math.sin(a)); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  RM.stelle=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));
  scene.add(RM.stelle);
})();
var emi=new THREE.HemisphereLight(0xffffff,0xffffff,G.iEmi); scene.add(emi);
var sole=new THREE.DirectionalLight(0xffffff,G.iSole);
/* sole basso da ovest-nord-ovest: le ombre cadono verso chi guarda */
sole.position.set(-600,330,-170); sole.target.position.set(10,0,0); scene.add(sole); scene.add(sole.target);
sole.castShadow=true;
var lato=piccolo?1536:4096; sole.shadow.mapSize.set(lato,lato);
var oc=sole.shadow.camera; oc.left=-420; oc.right=420; oc.top=420; oc.bottom=-420; oc.near=150; oc.far=1500; oc.updateProjectionMatrix();
sole.shadow.bias=-.0007; sole.shadow.normalBias=.5;
RM.moduli.push(function(){ renderer.shadowMap.needsUpdate=true; });

/* ---- terreno: maglia fitta sulla città, larga in campagna. Si posa dopo che i monumenti hanno dichiarato le loro terrazze (RM.posa) ---- */
var CAMPI=[0x86a056,0x759a4c,0xb3aa62,0x9aa35a,0x6a9348,0xc0b06a].map(RM.col), URBE=RM.col(0xb8a684), RIVA=RM.col(0x5f8c46), PRATO=RM.col(0x7fa054);
function coloreSuolo(x,z,c){
  var df=RM.distFiume(x,z), bordo=RM.distLinea(x,z,RM.MURA,true), dentro=RM.dentroMura(x,z);
  var ca=.82, sa=.57, u=(x*ca+z*sa)/26, v=(-x*sa+z*ca)/19;                  // campi: scacchiera ruotata
  c.copy(CAMPI[Math.floor(grana(Math.floor(u),Math.floor(v))*CAMPI.length)]);
  c.lerp(PRATO,.35+.3*RM.rumore(x/60,z/60));
  var urbano=dentro?Math.min(1,bordo/26):Math.max(0,1-bordo/40)*.5;          // terra battuta in città
  c.lerp(URBE,urbano*(.75+.25*RM.rumore(x/14,z/14)));
  c.lerp(RIVA,Math.max(0,1-df/20)*.8);
  c.multiplyScalar(.88+.24*RM.rumore(x/7,z/7));
  return urbano;
}
function nucleo(x,z){ var t=0; RM.NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,n[2]*Math.exp(-(d*d)/(n[3]*n[3]))); }); return Math.min(1,t+.25*Math.exp(-RM.distFiume(x,z)/45)); }
function posaSuolo(){
  var S=piccolo?220:300, geo=new THREE.PlaneGeometry(2,2,S,S); geo.rotateX(-Math.PI/2);
  var pos=geo.attributes.position, uv=geo.attributes.uv, col=new Float32Array(pos.count*3), urb=new Float32Array(pos.count*2), c=new THREE.Color(), i, x, z;
  var curva=function(t){ var a=Math.abs(t); return (t<0?-1:1)*(.3*a+.7*a*a*a)*3400; };
  for(i=0;i<pos.count;i++){
    x=curva(pos.getX(i)); z=curva(pos.getZ(i));
    pos.setXYZ(i,x,RM.h(x,z),z); uv.setXY(i,x/42,z/42);
    urb[i*2]=coloreSuolo(x,z,c); urb[i*2+1]=urb[i*2]>0?nucleo(x,z):0; col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('urb',new THREE.BufferAttribute(urb,2)); geo.computeVertexNormals();
  var granaTerra=RM.tela(256,256,function(g,W,H){
    var r=RM.casuale(3), d=g.createImageData(W,H), k, v;
    for(k=0;k<W*H;k++){ v=205+Math.floor(r()*50); d.data[k*4]=v; d.data[k*4+1]=v; d.data[k*4+2]=v-6; d.data[k*4+3]=255; }
    g.putImageData(d,0,0);
  });
  var matSuolo=new THREE.MeshStandardMaterial({vertexColors:true,map:granaTerra,roughness:1,metalness:0}), A=String.fromCharCode(10);
  RM.erba={value:0};                       // 0…1: quanta parte della città è lasciata da abbastanza tempo perché ci cresca l'erba
  matSuolo.onBeforeCompile=function(sh){
    sh.uniforms.uErba=RM.erba; sh.uniforms.uVerde={value:RM.col(0x8e9163)};
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute vec2 urb;','varying vec2 vUrb;','varying vec2 vXZ;','varying float vPend;'].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>','vUrb=urb; vXZ=position.xz; vPend=1.0-normal.y;'].join(A));
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',['#include <common>','uniform float uErba; uniform vec3 uVerde;','varying vec2 vUrb;','varying vec2 vXZ;','varying float vPend;'].join(A))
      .replace('#include <color_fragment>',['#include <color_fragment>',
        'float pe=sin(vXZ.x*0.21+sin(vXZ.y*0.13)*2.0)*sin(vXZ.y*0.19+sin(vXZ.x*0.11)*2.0)*0.5+0.5;',
        'float gr=dot(diffuseColor.rgb,vec3(0.34))/0.42;',
        'diffuseColor.rgb=mix(diffuseColor.rgb,uVerde*(0.72+0.4*pe)*clamp(gr,0.7,1.25),vUrb.x*smoothstep(0.1,0.5,uErba-vUrb.y*0.95)*(0.6+0.4*pe));',
        'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.27,0.25,0.15)*(0.8+0.4*pe),smoothstep(0.025,0.2,vPend)*0.8);',
        /* lontano dalla città il terreno diventa una carta antica: fondo color pergamena, tratteggio a inchiostro */
        'float lont=smoothstep(480.0,820.0,length(vXZ));',
        'vec3 carta=vec3(0.83,0.74,0.56)*(0.95+0.05*sin(vXZ.x*0.09)*sin(vXZ.y*0.09));',
        'float tratto=1.0-0.3*smoothstep(0.9,1.0,sin((vXZ.x+vXZ.y)*0.4))*smoothstep(0.25,0.8,lont);',
        'diffuseColor.rgb=mix(diffuseColor.rgb,carta*tratto,lont);'].join(A));
  };
  var suolo=new THREE.Mesh(geo,matSuolo);
  suolo.receiveShadow=true; scene.add(suolo); RM.suolo=suolo;
}

/* nastro steso sul terreno lungo una linea */
RM.nastro=function(linea,larga,materiale,alza,quotaFissa){
  var punti=linea.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); });
  var curva=new THREE.CatmullRomCurve3(punti,false,'catmullrom',.35), n=Math.max(20,Math.round(curva.getLength()/3)), v=[], uv=[], idx=[], k, p, t, nx, nz, y1, y2;
  for(k=0;k<=n;k++){
    p=curva.getPoint(k/n); t=curva.getTangent(k/n); nx=-t.z; nz=t.x;
    y1=quotaFissa!=null?quotaFissa:RM.h(p.x+nx*larga,p.z+nz*larga)+alza; y2=quotaFissa!=null?quotaFissa:RM.h(p.x-nx*larga,p.z-nz*larga)+alza;
    v.push(p.x+nx*larga,y1,p.z+nz*larga, p.x-nx*larga,y2,p.z-nz*larga); uv.push(0,k/2,1,k/2);
    if(k<n){ var a=k*2; idx.push(a,a+2,a+1, a+1,a+2,a+3); }
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  var m=new THREE.Mesh(g,materiale); m.receiveShadow=true; scene.add(m); m.userData.curva=curva; return m;
};
/* strade */
var matStrada=new THREE.MeshStandardMaterial({color:RM.col(0xcdbfa3),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});

/* Tevere */
RM.matFiume=new THREE.MeshStandardMaterial({color:RM.col(0x4f97a6),roughness:.2,metalness:.1,side:THREE.DoubleSide});
RM.tempoAcqua={value:0};
RM.matFiume.onBeforeCompile=function(sh){                       // corrente che scorre e schiuma lungo le rive
  var A=String.fromCharCode(10); sh.uniforms.uTempo=RM.tempoAcqua;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying vec2 vRiva;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vRiva=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying vec2 vRiva; uniform float uTempo;').replace('#include <color_fragment>',['#include <color_fragment>',
    'float bordo=abs(vRiva.x-0.5)*2.0;',
    'float onda=sin(vRiva.y*5.0-uTempo*1.2+sin(vRiva.x*7.0+uTempo*0.5)*1.3)*0.5+0.5;',
    'diffuseColor.rgb*=0.88+0.26*onda*(1.0-bordo);',
    'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*2.2+0.08,smoothstep(0.8,0.97,bordo)*(0.35+0.4*onda));'].join(A));
};
RM.frame.push(function(dt){ RM.tempoAcqua.value+=dt; });
RM.posa=function(){
  if(RM.suolo) return;
  posaSuolo();
  RM.STRADE.forEach(function(s,i){ RM.nastro(s,i<8?.8:.6,matStrada,.06); });
  RM.curvaFiume=RM.nastro(RM.FIUME,5.6,RM.matFiume,0,-.5).userData.curva;
};

/* ---- giorno / notte ---- */
RM.notte=0;
var fiumeG=RM.col(0x4f97a6), fiumeN=RM.col(0x0d1626);
RM.applicaLuce=function(n){
  RM.notte=n;
  cielo.material.uniforms.alto.value.copy(G.alto).lerp(N.alto,n); cielo.material.uniforms.basso.value.copy(G.basso).lerp(N.basso,n);
  scene.fog.color.copy(cielo.material.uniforms.basso.value);
  emi.color.copy(G.emiSu).lerp(N.emiSu,n); emi.groundColor.copy(G.emiGiu).lerp(N.emiGiu,n); emi.intensity=G.iEmi+(N.iEmi-G.iEmi)*n;
  sole.color.copy(G.sole).lerp(N.sole,n); sole.intensity=G.iSole+(N.iSole-G.iSole)*n;
  RM.matFiume.color.copy(fiumeG).lerp(fiumeN,n); RM.stelle.material.opacity=n*.9;
};
RM.applicaLuce(0);

/* ---- ciclo ---- */
function misura(){
  var w=contenitore.clientWidth||1, h=contenitore.clientHeight||1;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
window.addEventListener('resize',misura); misura();
if(window.ResizeObserver) new ResizeObserver(misura).observe(contenitore);
/* Regolatore: se i fotogrammi durano troppo, la scena rinuncia per gradi a ciò che costa di più.
   1 = risoluzione a un pixel per pixel; 2 = niente ombre; 3 = niente passanti né fumo. Non risale: evita di oscillare. */
RM.livello=0;
function alleggerisci(){
  RM.livello++;
  if(RM.livello===1){ renderer.setPixelRatio(1); misura(); }
  else if(RM.livello===2){ sole.castShadow=false; }
  else if(RM.livello===3){ RM.leggero=true; }
}
var orologio=new THREE.Clock(), somma=0, quanti=0, scalda=40;
(function ciclo(){
  requestAnimationFrame(ciclo);
  var grezzo=orologio.getDelta(), dt=Math.min(grezzo,.1);
  if(!document.hidden && grezzo<.4){                       // le pause (scheda nascosta, caricamento) non contano
    if(scalda>0) scalda--; else { somma+=grezzo; quanti++; }
    if(quanti>=50){ if(somma/quanti>.036 && RM.livello<3){ alleggerisci(); scalda=20; } somma=0; quanti=0; }
  }
  for(var i=0;i<RM.frame.length;i++) RM.frame[i](dt);
  controlli.update();
  renderer.render(scene,camera);
})();

})();
