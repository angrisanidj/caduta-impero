/* Costruttore: accumula solidi semplici in un'unica geometria colorata per vertice.
   Un monumento intero diventa così una sola maglia, con colonne, arcate e tetti. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;

/* tavolozza (colori lineari) */
var P=RM.P={ travertino:RM.col(0xe8dcc2), marmo:RM.col(0xf3ede0), tufo:RM.col(0xc9b08a), mattone:RM.col(0xb39274), intonaco:RM.col(0xe3cfa8),
  coppi:RM.col(0xb0603e), bronzo:RM.col(0x7d8a5f), oro:RM.col(0xd9b24a), ombra:RM.col(0x2c221b), sabbia:RM.col(0xd8c08f),
  prato:RM.col(0x74a04a), chioma:RM.col(0x3d6b2c), chioma2:RM.col(0x5c8a3a), tronco:RM.col(0x5a4633), selce:RM.col(0xb9ad98), acqua:RM.col(0x6d9aa0), cocci:RM.col(0x9c7355), statua:RM.col(0x7a6238), granito:RM.col(0x9d9b97) };

function C(){ this.pos=[]; this.nor=[]; this.col=[]; this.tip=[]; this.pila=[new THREE.Matrix4()]; }
/* tipo del materiale: 0 muratura, 1 copertura (coppi, bronzo, oro), 2 verde. Serve al degrado. */
function tipoDi(c){ return (c===P.coppi||c===P.oro||c===P.bronzo)?1:(c===P.prato||c===P.chioma||c===P.chioma2||c===P.acqua||c===P.statua)?2:0; }      // il tipo 2 non prende conci, crepe né crolli
var m4=new THREE.Matrix4(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), n=new THREE.Vector3(), ab=new THREE.Vector3(), ac=new THREE.Vector3();

/* sistema di riferimento locale: tutto ciò che fn costruisce è spostato e ruotato */
C.prototype.dentro=function(x,y,z,ry,fn){
  var m=new THREE.Matrix4().makeRotationY(ry||0); m.setPosition(x,y,z);
  this.pila.push(this.pila[this.pila.length-1].clone().multiply(m)); fn(this); this.pila.pop(); return this;
};
/* aggiunge una geometria di three, già posizionata in coordinate locali */
C.prototype.geo=function(g,colore){
  var q=g.index?g.toNonIndexed():g; q.applyMatrix4(this.pila[this.pila.length-1]);
  var p=q.attributes.position.array, v=q.attributes.normal.array, i;
  for(i=0;i<p.length;i++){ this.pos.push(p[i]); this.nor.push(v[i]); }
  var tp=tipoDi(colore); for(i=0;i<p.length;i+=3){ this.col.push(colore.r,colore.g,colore.b); this.tip.push(tp); }
  if(q!==g) q.dispose(); g.dispose(); return this;
};
/* triangolo in coordinate locali, normale dal verso dei vertici */
C.prototype.tri=function(p0,p1,p2,colore){
  var m=this.pila[this.pila.length-1];
  a.set(p0[0],p0[1],p0[2]).applyMatrix4(m); b.set(p1[0],p1[1],p1[2]).applyMatrix4(m); c.set(p2[0],p2[1],p2[2]).applyMatrix4(m);
  n.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();
  this.pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
  var tp=tipoDi(colore); for(var i=0;i<3;i++){ this.nor.push(n.x,n.y,n.z); this.col.push(colore.r,colore.g,colore.b); this.tip.push(tp); }
  return this;
};
C.prototype.quad=function(p0,p1,p2,p3,colore){ return this.tri(p0,p1,p2,colore).tri(p0,p2,p3,colore); };

C.prototype.scatola=function(w,h,d,x,y,z,colore,ry){
  var g=new THREE.BoxGeometry(w,h,d); if(ry) g.rotateY(ry); g.translate(x||0,(y||0)+h/2,z||0); return this.geo(g,colore||P.travertino);
};
C.prototype.cilindro=function(r,h,x,y,z,colore,r2,lati){
  var g=new THREE.CylinderGeometry(r2==null?r:r2,r,h,lati||28); g.translate(x||0,(y||0)+h/2,z||0); return this.geo(g,colore||P.travertino);
};
C.prototype.cupola=function(r,x,y,z,colore,schiaccia,oculo){
  var t0=oculo?oculo:0, g=new THREE.SphereGeometry(r,28,10,0,Math.PI*2,t0,Math.PI/2-t0); g.scale(1,schiaccia||.7,1); g.translate(x||0,y||0,z||0); return this.geo(g,colore||P.travertino);
};
C.prototype.cono=function(r,h,x,y,z,colore,lati){
  var g=new THREE.ConeGeometry(r,h,lati||4); if((lati||4)===4) g.rotateY(Math.PI/4); g.translate(x||0,(y||0)+h/2,z||0); return this.geo(g,colore||P.coppi);
};
/* tetto a due falde, colmo lungo x (ry lo ruota), con i due timpani */
C.prototype.falde=function(w,h,d,x,y,z,colore,ry,timpano){
  var col=colore||P.coppi, t=timpano||P.travertino, W=w/2, D=d/2;
  return this.dentro(x||0,y||0,z||0,ry||0,function(B){
    B.quad([-W,0,D],[W,0,D],[W,h,0],[-W,h,0],col).quad([W,0,-D],[-W,0,-D],[-W,h,0],[W,h,0],col);
    B.tri([W,0,D],[W,0,-D],[W,h,0],t).tri([-W,0,-D],[-W,0,D],[-W,h,0],t);
  });
};
/* volta a botte, asse lungo x */
C.prototype.volta=function(lunga,r,x,y,z,colore,ry){
  var g=new THREE.CylinderGeometry(r,r,lunga,14,1,false,0,Math.PI); g.rotateZ(Math.PI/2); if(ry) g.rotateY(ry); g.translate(x||0,y||0,z||0); return this.geo(g,colore||P.travertino);
};
/* fila di colonne fra due punti */
C.prototype.colonne=function(x0,z0,x1,z1,quante,h,r,y,colore){
  var c=colore||P.marmo, ang=Math.atan2(-(z1-z0),x1-x0), ha=RM.piccolo&&r<.1?0:Math.min(.09,r*.7), hb=r>=.1?Math.min(.07,r*.5):0;      // sui telefoni le colonne piccole restano semplici fusti
  for(var i=0;i<quante;i++){
    var t=quante>1?i/(quante-1):.5, x=x0+(x1-x0)*t, z=z0+(z1-z0)*t, yy=y||0;
    this.cilindro(r,h-ha-hb,x,yy+hb,z,c,r*.86,r>=.1?9:7); if(ha) this.scatola(r*2.5,ha,r*2.5,x,yy+h-ha,z,c,ang);      // fusto e capitello
    if(hb) this.scatola(r*2.5,hb,r*2.5,x,yy,z,c,ang);                                                      // base
  }
  return this;
};
/* file di aperture scure su una parete dritta: leggono come arcate o finestre */
C.prototype.aperture=function(x0,z0,x1,z1,quante,y,h,larga,quadra){
  var dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz), w=larga||L/quante*.55, nx=-dz/L, nz=dx/L;
  for(var i=0;i<quante;i++){ var t=(i+.5)/quante; this.vano(x0+dx*t+nx*.075,y,z0+dz*t+nz*.075,dx/L,dz/L,w,h,quadra); }
  return this;
};
/* un vano scuro sulla parete: rettangolo con l'arco a tutto sesto in cima (se è abbastanza alto, e se non è chiesto quadro). (ux,uz) è la direzione della parete */
C.prototype.vano=function(cx,y,cz,ux,uz,w,h,quadra){
  var a=w/2, arco=!quadra&&h>w*.8, hr=arco?h-a:h, k, a0, a1, N=6;
  function p(s,q){ return [cx+ux*s,y+q,cz+uz*s]; }
  this.quad(p(-a,0),p(a,0),p(a,hr),p(-a,hr),P.ombra);
  if(arco) for(k=0;k<N;k++){ a0=Math.PI*k/N; a1=Math.PI*(k+1)/N; this.tri(p(0,hr),p(a*Math.cos(a0),hr+a*Math.sin(a0)),p(a*Math.cos(a1),hr+a*Math.sin(a1)),P.ombra); }
  return this;
};
/* tempio: podio, cella, colonnato sulla fronte (e sui lati), tetto. Fronte verso +z. */
C.prototype.tempio=function(w,d,h,x,z,ry,opz){
  opz=opz||{}; var tetto=opz.tetto||P.coppi, nf=opz.fronte||6, nl=opz.lati||0, hp=opz.podio==null?.5:opz.podio, r=opz.r||Math.min(.16,w/nf*.22);
  return this.dentro(x,0,z,ry||0,function(B){
    B.scatola(w+.5,hp,d+.5,0,0,0,P.travertino);                                                               // podio
    for(var g=0;g<3;g++) B.scatola(w*.74,hp*(3-g)/3.6,.24,0,0,d/2+.25+.12+g*.24,P.travertino);                // gradinata sulla fronte
    B.scatola(.12,hp*.9,.75,-w*.37-.06,0,d/2+.25+.37,P.travertino).scatola(.12,hp*.9,.75,w*.37+.06,0,d/2+.25+.37,P.travertino);   // guance della scala
    B.scatola(w*.74,h,d*.66,0,hp,-d*.13,P.marmo);                                                              // cella
    B.vano(0,hp,-d*.13+d*.33+.02,1,0,Math.min(w*.2,.9),h*.72,true);                                            // la porta
    B.colonne(-w/2+r,d/2-r,w/2-r,d/2-r,nf,h,r,hp); if(nf>4) B.colonne(-w/2+r,d/2-r*5,w/2-r,d/2-r*5,nf,h,r,hp);
    if(nl){ B.colonne(-w/2+r,d/2-r,-w/2+r,-d/2+r,nl,h,r,hp); B.colonne(w/2-r,d/2-r,w/2-r,-d/2+r,nl,h,r,hp); B.colonne(-w/2+r,-d/2+r,w/2-r,-d/2+r,nf,h,r,hp); }
    B.scatola(w,.22,d,0,hp+h,0,P.marmo); B.falde(d+.2,w*.21,w+.2,0,hp+h+.22,0,tetto,Math.PI/2,P.marmo);       // trabeazione e tetto
  });
};
/* striscia fra due profili (liste di punti [x,z]) a due quote: pareti curve, gradinate, corone */
C.prototype.striscia=function(P0,y0,P1,y1,colore,chiusa){
  var k=P0.length, fine=chiusa===false?k-1:k;
  for(var i=0;i<fine;i++){ var j=(i+1)%k; this.quad([P0[i][0],y0,P0[i][1]],[P0[j][0],y0,P0[j][1]],[P1[j][0],y1,P1[j][1]],[P1[i][0],y1,P1[i][1]],colore); }
  return this;
};
/* aperture lungo un profilo curvo, a una data quota */
C.prototype.fornici=function(prof,y,h,quota,passo,chiusa,quadra){
  var k=prof.length, fine=chiusa===false?k-1:k;
  for(var i=0;i<fine;i+=(passo||1)){
    var j=(i+1)%k, mx=(prof[i][0]+prof[j][0])/2, mz=(prof[i][1]+prof[j][1])/2, dx=prof[j][0]-prof[i][0], dz=prof[j][1]-prof[i][1], L=Math.hypot(dx,dz), m=Math.hypot(mx,mz)||1;
    this.vano(mx+mx/m*.085,y,mz+mz/m*.085,dx/L,dz/L,L*(quota||.55),h,quadra);
  }
  return this;
};
C.prototype.geometria=function(){
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(this.pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(this.nor,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(this.col,3)); g.setAttribute('tipo',new THREE.Float32BufferAttribute(this.tip,1));
  return g;
};
C.prototype.maglia=function(materiale){ var m=new THREE.Mesh(this.geometria(),materiale); m.castShadow=m.receiveShadow=true; return m; };

RM.Costruttore=C;
/* «Che cosa sappiamo davvero»: i materiali possono prendere la tinta della loro classe di certezza
   (A: posizione e forma certe; B: posizione certa, forma ricostruita; C: ipotesi). RM.sapere.q va da 0 (colori veri) a 1 (tinta piena);
   resta la luminosità di ciò che c'è sotto, così si leggono ancora volumi, ombre e rovine. */
RM.sapere={q:{value:0}, COL:{A:RM.col(0x9a3f2f), B:RM.col(0xe2b254), C:RM.col(0xd6d1c6)}};
var SAP_DICH='uniform float uSapQ; uniform vec3 uSapCol;', SAP_TINTA='diffuseColor.rgb=mix(diffuseColor.rgb,uSapCol*(0.42+0.8*dot(diffuseColor.rgb,vec3(0.3,0.59,0.11))),uSapQ);';
/* Da vicino la muratura mostra i conci: filari sfalsati e una lieve differenza di tono fra un blocco e l'altro. Sfuma con la distanza (fwidth), così da lontano non sfarfalla. */
var CONCI=[
  'if(vTipo<0.5){ vec3 anC=abs(vNor); vec2 qC=anC.y>0.7?vLoc.xz:vec2(anC.x>anC.z?vLoc.z:vLoc.x,vLoc.y);',
  '  float fwC=max(fwidth(qC.x),fwidth(qC.y)); float vicC=1.0-smoothstep(0.012,0.05,fwC);',
  '  if(vicC>0.0){ vec2 gC=qC/vec2(0.36,0.18); gC.x+=0.5*floor(gC.y); vec2 fC=abs(fract(gC)-0.5);',
  '    float giunto=max(smoothstep(0.47,0.5,fC.x),smoothstep(0.44,0.5,fC.y));',
  '    float tono=fract(sin(dot(floor(gC),vec2(127.1,311.7)))*43758.5453)-0.5;',
  '    diffuseColor.rgb*=1.0+vicC*(0.09*tono-0.16*giunto); } }'].join(String.fromCharCode(10));
function conConci(mat){
  var A=String.fromCharCode(10);
  mat.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute float tipo;','varying float vTipo;','varying vec3 vLoc;','varying vec3 vNor;'].join(A))
      .replace('#include <begin_vertex>',['#include <begin_vertex>','vTipo=tipo; vLoc=position; vNor=normal;'].join(A));
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',['#include <common>','varying float vTipo;','varying vec3 vLoc;','varying vec3 vNor;'].join(A))
      .replace('#include <color_fragment>','#include <color_fragment>'+A+CONCI);
  };
  return mat;
}
RM.tingi=function(mat,classe){
  var u={value:(RM.sapere.COL[classe]||RM.sapere.COL.C).clone()}, sua=mat.hasOwnProperty('onBeforeCompile'), prima=mat.onBeforeCompile, A=String.fromCharCode(10);
  mat.onBeforeCompile=function(sh,r){
    if(sua) prima.call(mat,sh,r);
    sh.uniforms.uSapQ=RM.sapere.q; sh.uniforms.uSapCol=u;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+SAP_DICH).replace('#include <alphamap_fragment>',SAP_TINTA+A+'#include <alphamap_fragment>');
  };
  mat.customProgramCacheKey=function(){ return 'sapere|'+(sua?prima.toString():''); };      // three riconosce i programmi dal testo di onBeforeCompile: qui è uguale per tutti, quindi si distingue da ciò che avvolge
  mat.userData.sapere=u; return mat;
};
RM.matPietra=function(classe){ var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,side:THREE.DoubleSide}); return classe?RM.tingi(conConci(m),classe):m; };      // gli edifici (quelli con una classe) mostrano i conci da vicino; barche, alberi e sterpi no
/* Pietra che va in rovina. Lo shader lavora in coordinate locali del monumento:
   ogni "colonna" di muratura (cella in pianta) viene troncata a un'altezza casuale, più bassa quanto più alto è uRovina,
   così i crolli partono dall'alto e non restano pezzi sospesi; le coperture si bucano; la pietra si macchia di muschio. */
var NL=String.fromCharCode(10);
var TAGLIO=[
  'if(vTipo<1.5){',
  '  float rn=rmH(vec3(floor(vLoc.xz*1.6+0.37),1.0));',
  '  float rq=clamp(vLoc.y/uAlt,0.0,1.0);',
  '  if(rq>1.0-uRovina*(0.25+1.7*rn)) discard;',
  '  if(vTipo>0.5 && 0.55*rmN(vec3(vLoc.xz*1.1,2.0))+0.45*rmH(vec3(floor(vLoc.xz*5.0+0.19),2.0))<uRovina*2.0+uCrepe*uCrepe*0.2) discard;',   // coppi caduti: chiazze irregolari
  '}',
  /* smontaggio da un lato solo (il fronte sud del Colosseo): sparisce l'anello esterno con l'attico e la parte alta della cavea, a partire dal punto più a sud e allargandosi; resta il secondo anello, più basso */
  'if(uSud>0.001){ vec2 qs=vLoc.xz/uSudR; float ro=length(qs); if(ro>0.94 || (ro>0.74 && vLoc.y>3.09)){ float an=acos(clamp(dot(qs/ro,uSudDir),-1.0,1.0)); if(an<3.1416*uSud*(0.9+0.2*rmH(vec3(floor(vLoc.xz*0.9),6.0)))) discard; } }'].join(NL);
var DICHIARA=[SAP_DICH,'uniform float uRovina; uniform float uSpoglio; uniform float uPiombo; uniform float uAlt; uniform float uCrepe; uniform float uSud; uniform vec2 uSudDir; uniform vec2 uSudR;','varying float vTipo; varying vec3 vLoc; varying vec3 vNor;',
  'float rmH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }',
  'vec2 rmH2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }',
  'float rmN(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);',
  '  return mix(mix(mix(rmH(i),rmH(i+vec3(1.0,0.0,0.0)),f.x),mix(rmH(i+vec3(0.0,1.0,0.0)),rmH(i+vec3(1.0,1.0,0.0)),f.x),f.y),',
  '             mix(mix(rmH(i+vec3(0.0,0.0,1.0)),rmH(i+vec3(1.0,0.0,1.0)),f.x),mix(rmH(i+vec3(0.0,1.0,1.0)),rmH(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z); }',
  /* distanza dal confine fra due celle: dove è quasi zero passa una crepa, che si dirama come quelle vere */
  'float rmCrepa(vec2 p){ vec2 n=floor(p); vec2 f=fract(p); float d1=8.0; float d2=8.0;',
  '  for(int j=-1;j<=1;j++){ for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); float d=length(g+rmH2(n+g)-f); if(d<d1){ d2=d1; d1=d; } else if(d<d2){ d2=d; } } }',
  '  return d2-d1; }'].join(NL);
/* incuria (uCrepe): crepe nella muratura, colature sotto le creste, erba fra le lastre, coppi scoloriti e mancanti.
   rovina (uRovina): muschio e crolli. Le due cose sono separate: un edificio si crepa molto prima di cadere. */
var COLORA=[
  'float rq2=clamp(vLoc.y/uAlt,0.0,1.0);',
  'if(vTipo<0.5 && uCrepe>0.01){',
  '  vec3 an=abs(vNor); bool piano=an.y>0.7;',
  '  vec2 cp=piano?vLoc.xz:vec2(an.x>an.z?vLoc.z:vLoc.x,vLoc.y);',
  '  float e=rmCrepa(cp*1.1+3.7); float fw=fwidth(e)+0.0001; float largo=max(0.03,fw*0.7);',
  '  float zona=rmN(vec3(cp*0.45+1.3,5.0));',
  '  float riga=(1.0-smoothstep(largo*0.5,largo,e))*clamp(0.4/fw,0.0,1.0)*smoothstep(0.0,0.1,0.12+uCrepe*0.48-zona)*smoothstep(0.3,0.5,rmN(vec3(cp*2.3,7.0)));',
  '  diffuseColor.rgb*=1.0-0.52*riga;',
  '  if(piano){',
  '    if(rq2<0.4) diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.25,0.29,0.12),uCrepe*0.9*smoothstep(0.42,0.62,rmN(vec3(vLoc.xz*1.8,9.0))+0.3*riga));',      // erba fra le lastre
  '    else diffuseColor.rgb*=1.0-0.55*clamp((uRovina*2.0+uCrepe*uCrepe*0.2)*3.0,0.0,1.0);',                                                           // sotto i tetti sfondati si vede il buio
  '  } else diffuseColor.rgb*=1.0-0.34*uCrepe*smoothstep(0.5,0.8,rmN(vec3(cp.x*4.0,vLoc.y*0.45,3.0)));',                                              // colature
  '}',
  'if(vTipo<1.5){ float rm=smoothstep(0.35,0.72,rmN(vLoc*2.3+0.11)); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.5,0.56,0.38),clamp((uRovina*2.4+uCrepe*0.5)*rm*(1.15-rq2),0.0,1.0)); }',
  'if(vTipo>0.5 && vTipo<1.5){ diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.62,0.66,0.6)+0.015,uCrepe*0.75*rmN(vec3(vLoc.xz*1.4,4.0))); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.3,0.27,0.23),uSpoglio); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.2,0.215,0.235),uPiombo); }',      // uPiombo: coperture rifatte in lastre di piombo (il Pantheon dopo Gregorio III)
  'if(vTipo<1.5) diffuseColor.rgb*=mix(0.74,1.0,smoothstep(0.0,0.2,rq2));'].join(NL);      // ombra d'appoggio al piede
function innesta(sh,u,colore){
  sh.uniforms.uSapQ=RM.sapere.q; sh.uniforms.uSapCol=u.uSapCol;
  sh.uniforms.uRovina=u.uRovina; sh.uniforms.uSpoglio=u.uSpoglio; sh.uniforms.uPiombo=u.uPiombo; sh.uniforms.uAlt=u.uAlt; sh.uniforms.uCrepe=u.uCrepe; sh.uniforms.uSud=u.uSud; sh.uniforms.uSudDir=u.uSudDir; sh.uniforms.uSudR=u.uSudR;
  sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute float tipo;','varying float vTipo;','varying vec3 vLoc;','varying vec3 vNor;'].join(NL))
    .replace('#include <begin_vertex>',['#include <begin_vertex>','vTipo=tipo; vLoc=position; vNor=normal;'].join(NL));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+NL+DICHIARA);
  if(colore) sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',TAGLIO,CONCI,COLORA,SAP_TINTA].join(NL));
  else sh.fragmentShader=sh.fragmentShader.replace('#include <clipping_planes_fragment>',TAGLIO+NL+'#include <clipping_planes_fragment>');
}
RM.matRovina=function(alt){
  var u={uSapCol:{value:RM.sapere.COL.C.clone()},uRovina:{value:0},uSpoglio:{value:0},uPiombo:{value:0},uAlt:{value:alt||1},uCrepe:{value:0},uSud:{value:0},uSudDir:{value:new THREE.Vector2(0,1)},uSudR:{value:new THREE.Vector2(1,1)}};
  var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){ innesta(sh,u,true); };
  m.userData.u=u;
  m.userData.ombra=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  m.userData.ombra.onBeforeCompile=function(sh){ innesta(sh,u,false); };
  return m;
};
/* profili */
RM.ellisse=function(rx,rz,quanti,a0,a1){
  var o=[], da=(a1==null?Math.PI*2:a1-(a0||0)), pieni=a1==null?quanti:quanti+1;
  for(var i=0;i<pieni;i++){ var t=(a0||0)+da*i/quanti; o.push([rx*Math.cos(t),rz*Math.sin(t)]); }
  return o;
};
/* circo: due rettilinei, una curva a +x, testata piatta a -x */
RM.stadio=function(L,W,lato,curva){
  var o=[], i, t, R=W/2, x0=-L/2, x1=L/2-R;
  for(i=0;i<=lato;i++) o.push([x0+(x1-x0)*i/lato,R]);
  for(i=1;i<curva;i++){ t=Math.PI/2-Math.PI*i/curva; o.push([x1+R*Math.cos(t),R*Math.sin(t)]); }
  for(i=0;i<=lato;i++) o.push([x1+(x0-x1)*i/lato,-R]);
  return o;
};
})();
