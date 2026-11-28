/* Costruttore: accumula solidi semplici in un'unica geometria colorata per vertice.
   Un monumento intero diventa così una sola maglia, con colonne, arcate e tetti. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;

/* tavolozza (colori lineari) */
var P=RM.P={ travertino:RM.col(0xe8dcc2), marmo:RM.col(0xf3ede0), tufo:RM.col(0xc9b08a), mattone:RM.col(0xb39274), intonaco:RM.col(0xe3cfa8),
  coppi:RM.col(0xb0603e), bronzo:RM.col(0xa8843f), oro:RM.col(0xd9b24a), ombra:RM.col(0x2c221b), sabbia:RM.col(0xd8c08f),
  prato:RM.col(0x879a58), chioma:RM.col(0x3d6b2c), chioma2:RM.col(0x5c8a3a), tronco:RM.col(0x5a4633), selce:RM.col(0xb9ad98), acqua:RM.col(0x6d9aa0), cocci:RM.col(0x9c7355), statua:RM.col(0x7a6238), granito:RM.col(0x9d9b97) };

function C(){ this.pos=[]; this.nor=[]; this.col=[]; this.tip=[]; this.fil=[]; this.fc=0; this.nFile=0; this.ultimaFila=0; this.lt=0; this.sf=null; this.conFascia=false; this.pila=[new THREE.Matrix4()]; }
/* Colonnati vicini e lontani (24 novembre 2026). Una fila di colonne più sottile di qualche pixel brulica quando la camera si muove: ogni fusto compare e sparisce
   fra un pixel e l'altro. Ora ogni fila di tre o più colonne ha anche una «fascia», un piano sull'asse della fila, colorato nello shader a strisce filtrate
   (la quota di colonna e di vuoto che cade in ogni pixel, calcolata con fwidth: da lontano diventa un tono medio fermo). Lo shader mostra le colonne finché il loro
   diametro sullo schermo supera RM.vistaU.uSogliaCol pixel, la fascia sotto quella soglia; la scelta si fa pixel per pixel, sulla distanza dall'occhio.
   Il segno sta nell'attributo «tipo»: tipo base (0-3) + 10 × (raggio in millesimi di unità + 1000 × larghezza della colonna in centesimi dell'interasse), +5 per la fascia;
   «fila» dà la posizione lungo la fila, in interassi (le colonne cadono sugli interi). Le geometrie senza fasce non portano «fila». */
/* tipo del materiale: 0 muratura, 1 copertura (coppi, bronzo, oro), 2 verde e altro che non si degrada, 3 prato (prende una grana d'erba). Serve al degrado.
   Il bronzo (tetti, porte) è bronzo brunito, non verde: prima le tegole dorate del tempio di Venere e Roma diventavano verdi una volta portate a San Pietro (23 novembre 2026). */
function tipoDi(c){ return (c===P.coppi||c===P.oro||c===P.bronzo)?1:c===P.prato?3:(c===P.chioma||c===P.chioma2||c===P.acqua||c===P.statua)?2:0; }      // il tipo 2 non prende conci, crepe né crolli
var m4=new THREE.Matrix4(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), n=new THREE.Vector3(), ab=new THREE.Vector3(), ac=new THREE.Vector3();

/* sistema di riferimento locale: tutto ciò che fn costruisce è spostato e ruotato */
C.prototype.dentro=function(x,y,z,ry,fn){
  var m=new THREE.Matrix4().makeRotationY(ry||0); m.setPosition(x,y,z);
  this.pila.push(this.pila[this.pila.length-1].clone().multiply(m)); fn(this); this.pila.pop(); return this;
};
/* aggiunge una geometria di three, già posizionata in coordinate locali */
C.prototype.geo=function(g,colore){
  var q=g.index?g.toNonIndexed():g; q.applyMatrix4(this.pila[this.pila.length-1]);
  var p=q.attributes.position.array, v=q.attributes.normal.array, i, cc=q.attributes.color?q.attributes.color.array:null;      // una geometria può portare i suoi colori, vertice per vertice (la patina delle statue)
  for(i=0;i<p.length;i++){ this.pos.push(p[i]); this.nor.push(v[i]); }
  var tp=tipoDi(colore)+this.lt; for(i=0;i<p.length;i+=3){ if(cc) this.col.push(cc[i],cc[i+1],cc[i+2]); else this.col.push(colore.r,colore.g,colore.b); this.tip.push(tp); this.fil.push(this.fc); }
  if(q!==g) q.dispose(); g.dispose(); return this;
};
/* triangolo in coordinate locali, normale dal verso dei vertici */
C.prototype.tri=function(p0,p1,p2,colore){
  var m=this.pila[this.pila.length-1];
  a.set(p0[0],p0[1],p0[2]).applyMatrix4(m); b.set(p1[0],p1[1],p1[2]).applyMatrix4(m); c.set(p2[0],p2[1],p2[2]).applyMatrix4(m);
  n.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();
  this.pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
  var tp=tipoDi(colore)+this.lt, sf=this.sf; for(var i=0;i<3;i++){ this.nor.push(n.x,n.y,n.z); this.col.push(colore.r,colore.g,colore.b); this.tip.push(tp); this.fil.push(sf?sf[i]:this.fc); }
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
/* Fusto di una colonna coclide (Traiana, di Marco Aurelio): il fregio sale a spirale. La superficie è tagliata lungo l'elica: per ogni giro una fascia chiara (il fregio,
   con un tono diverso da un riquadro all'altro, a suggerire le figure) e un listello in ombra che la separa dal giro di sopra. r0 al piede, r1 in cima. */
C.prototype.coclide=function(r0,r1,h,x,y,z,giri,colore){
  var col=colore||P.marmo, lati=20, passo=h/giri, k, i, t, s=this, sc=col.clone().multiplyScalar(.4), toni=[col.clone().multiplyScalar(.84),col,col.clone().multiplyScalar(.93)];
  function pt(a,q){ q=Math.max(0,Math.min(h,q)); var r=r0+(r1-r0)*q/h; return [x+r*Math.cos(a),y+q,z+r*Math.sin(a)]; }
  for(k=-1;k<giri;k++) for(i=0;i<lati;i++){
    var a0=2*Math.PI*i/lati, a1=2*Math.PI*(i+1)/lati, q0=(k+i/lati)*passo, q1=(k+(i+1)/lati)*passo;
    if(q1+passo<=0) continue;
    t=toni[Math.abs(i*7+k*3+((i*k)%2))%3];
    s.quad(pt(a0,q0),pt(a0,q0+passo*.2),pt(a1,q1+passo*.2),pt(a1,q1),sc);
    s.quad(pt(a0,q0+passo*.2),pt(a0,q0+passo),pt(a1,q1+passo),pt(a1,q1+passo*.2),t);
  }
  return this;
};
/* fila di colonne fra due punti */
C.prototype.colonne=function(x0,z0,x1,z1,quante,h,r,y,colore){
  var c=colore||P.marmo, ang=Math.atan2(-(z1-z0),x1-x0), yy=y||0, L=Math.hypot(x1-x0,z1-z0), ia=quante>1?L/(quante-1):0, fascia=quante>=3&&ia>2.2*r, prima=this.lt, k=0, wf=0, i;
  var ha=Math.min(.09,r*.7), hb=r>=.1?Math.min(.07,r*.5):0, piena=r>=.1&&!RM.piccolo, prof=null, lati=RM.piccolo?5:6;
  RM.contaColonne=(RM.contaColonne||0)+quante;
  if(fascia){ k=Math.max(1,Math.min(999,Math.round(r*1000))); wf=Math.max(1,Math.min(99,Math.round(200*r/ia))); this.lt=10*(k+1000*wf); }
  /* Rovina (24 novembre 2026): ogni colonna di una fila ha un numero suo («fila» = numero della fila × 1000 + posto + 1), e lo shader del degrado ne toglie una parte
     sempre più grande col crescere del degrado, scelta per posizione (una colonna che manca nel 600 manca anche nell'852). Ogni due colonne c'è un rocchio a terra,
     segnato col numero negativo: si vede solo quando la sua colonna manca. Chi disegna sopra le colonne (architravi, tetti) può dare a un pezzo il numero di una
     colonna (B.fc), e il pezzo cade con lei: B.ultimaFila dice il numero della fila appena fatta (0 se la fila è troppo corta e non ha numeri). */
  var id0=0; if(fascia){ this.nFile++; id0=this.nFile*1000; } this.ultimaFila=id0;
  var uxR=L?(x1-x0)/L:1, uzR=L?(z1-z0)/L:0, fcPrima=this.fc;
  /* Le colonne piccole (portici, pronai minori) prima erano un fusto a sette lati con un dado in cima, senza base: da media distanza sembravano stecchi (24 novembre 2026).
     Ora sono un profilo girato a sei lati, di tre tratti: la base che si stringe sul plinto, il fusto rastremato, il capitello che si allarga fino all'abaco (36 triangoli). Proporzioni di Vitruvio: base alta mezzo diametro (III 5, 1),
     capitello corinzio alto un diametro (IV 1, 11); sui telefoni cinque lati e niente base. Plinto e abaco tondi invece che quadrati: a questa scala non si distingue. */
  if(!piena){ ha=Math.min(h*.2,2*r); hb=Math.min(h*.08,r);
    prof=(RM.piccolo?[[r,0],[r*.88,h-ha],[r*1.32,h]]:[[r*1.3,0],[r,hb],[r*.88,h-ha],[r*1.32,h]]).map(function(q){ return new THREE.Vector2(q[0],q[1]); }); }
  for(i=0;i<quante;i++){
    var t=quante>1?i/(quante-1):.5, x=x0+(x1-x0)*t, z=z0+(z1-z0)*t;
    if(piena){      /* le colonne grandi (templi, pronai) hanno una base a due tori sul plinto e un capitello che si allarga sotto l'abaco: prima erano un fusto fra due dadi (23 novembre 2026) */
      if(id0) this.fc=id0+i+1;
      this.cilindro(r,h-ha-hb,x,yy+hb,z,c,r*.86,12);
      this.cilindro(r*.9,ha*.62,x,yy+h-ha,z,c,r*1.3,12).scatola(r*2.75,ha*.38,r*2.75,x,yy+h-ha*.38,z,c,ang);
      this.scatola(r*2.7,hb*.4,r*2.7,x,yy,z,c,ang).cilindro(r*1.3,hb*.35,x,yy+hb*.4,z,c,r*1.22,12).cilindro(r*1.15,hb*.25,x,yy+hb*.75,z,c,r*1.05,12);
    } else { if(id0) this.fc=id0+i+1; this.geo(new THREE.LatheGeometry(prof,lati).translate(x,yy,z),c); }
    if(id0 && i%2===0 && !RM.piccolo){ this.fc=-(id0+i+1);      // il rocchio caduto: un pezzo di fusto lungo poco più di un quinto della colonna, steso accanto al suo posto
      this.geo(new THREE.CylinderGeometry(r*.92,r*.92,h*.22,5,1,true).rotateZ(Math.PI/2).rotateY(ang).translate(x+uxR*ia*.42-uzR*r*1.6,yy+r*.92,z+uzR*ia*.42+uxR*r*1.6),c); }
    this.fc=fcPrima;
  }
  if(fascia){      // la fascia: dal filo esterno della prima colonna a quello dell'ultima, alta quanto le colonne
    var ux=(x1-x0)/L, uz=(z1-z0)/L, e=r/ia, s1=quante-1+e, p0=[x0-ux*r,yy,z0-uz*r], p1=[x1+ux*r,yy,z1+uz*r], p2=[x1+ux*r,yy+h,z1+uz*r], p3=[x0-ux*r,yy+h,z0-uz*r];
    this.lt=10*(k+1000*wf)+5; this.conFascia=true;
    this.sf=[-e,s1,s1]; this.tri(p0,p1,p2,c); this.sf=[-e,s1,-e]; this.tri(p0,p2,p3,c); this.sf=null;
  }
  this.lt=prima; return this;
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
  if(this.conFascia) g.setAttribute('fila',new THREE.Float32BufferAttribute(this.fil,1));      // solo dove ci sono fasce: altrove l'attributo manca e vale zero
  return g;
};
C.prototype.maglia=function(materiale){ if(this.conFascia&&materiale&&materiale.defines) materiale.defines.RM_LOD=''; var m=new THREE.Mesh(this.geometria(),materiale); m.castShadow=m.receiveShadow=true; return m; };

RM.Costruttore=C;
/* «Che cosa sappiamo davvero»: i materiali possono prendere la tinta della loro classe di certezza
   (A: posizione e forma certe; B: posizione certa, forma ricostruita; C: ipotesi). RM.sapere.q va da 0 (colori veri) a 1 (tinta piena);
   resta la luminosità di ciò che c'è sotto, così si leggono ancora volumi, ombre e rovine. */
RM.sapere={q:{value:0}, COL:{A:RM.col(0x9a3f2f), B:RM.col(0xe2b254), C:RM.col(0xd6d1c6)}};
var SAP_DICH='uniform float uSapQ; uniform vec3 uSapCol;', SAP_TINTA='diffuseColor.rgb=mix(diffuseColor.rgb,uSapCol*(0.42+0.8*dot(diffuseColor.rgb,vec3(0.3,0.59,0.11))),uSapQ);';
/* Da vicino la muratura mostra i conci: filari sfalsati e una lieve differenza di tono fra un blocco e l'altro. Sfuma con la distanza (fwidth), così da lontano non sfarfalla. */
var CONCI=[
  'if(vTipo<0.5 && vFascia<0.5){ vec3 anC=abs(vNor); vec2 qC=anC.y>0.7?vLoc.xz:vec2(anC.x>anC.z?vLoc.z:vLoc.x,vLoc.y);',
  '  float fwC=max(fwidth(qC.x),fwidth(qC.y)); float vicC=1.0-smoothstep(0.012,0.05,fwC);',
  '  if(vicC>0.0){ vec2 gC=qC/vec2(0.36,0.18); gC.x+=0.5*floor(gC.y); vec2 fC=abs(fract(gC)-0.5);',
  '    float dG=min((0.5-fC.x)*0.36,(0.5-fC.y)*0.18); float giunto=(1.0-smoothstep(0.006-fwC*0.5,0.006+fwC*0.5,dG))*min(1.0,0.012/fwC);',      // il giunto largo 12 cm, sfumato su un pixel e alleggerito quando è più sottile di un pixel: prima era largo un pixel fisso e tremolava (24 novembre 2026)
  '    float tono=fract(sin(dot(floor(gC),vec2(127.1,311.7)))*43758.5453)-0.5;',
  '    diffuseColor.rgb*=1.0+vicC*(0.09*tono-0.16*giunto); } }'].join(String.fromCharCode(10));
/* colonne o fascia (si veda in testa): dichiarazioni, decodifica del tipo nel vertice, scelta e colore nel frammento */
var LOD_VD=['attribute float tipo; attribute float fila;','varying float vTipo; varying vec3 vLoc; varying vec3 vNor; varying float vFascia; varying float vLodR; varying float vWf; varying float vFila; varying vec3 vMondo;'].join(String.fromCharCode(10));
var LOD_V=['float tq=floor(tipo/10.0+0.0001); float tr=tipo-tq*10.0; vFascia=step(4.5,tr); vTipo=tr-5.0*vFascia;',
  'float tw=floor(tq/1000.0+0.0001); vLodR=(tq-tw*1000.0)*0.001; vWf=tw*0.01; vFila=fila; vLoc=position; vNor=normal;',
  'vec4 mwL=vec4(transformed,1.0);','#ifdef USE_INSTANCING','mwL=instanceMatrix*mwL;','#endif','vMondo=(modelMatrix*mwL).xyz;'].join(String.fromCharCode(10));
var LOD_FD='varying float vTipo; varying vec3 vLoc; varying vec3 vNor; varying float vFascia; varying float vLodR; varying float vWf; varying float vFila; varying vec3 vMondo; uniform vec3 uOcchio; uniform float uPxScala; uniform float uSogliaCol;';
var LOD_SCEGLI='if(vLodR>0.0){ float dpxL=2.0*vLodR*uPxScala/max(0.5,length(vMondo-uOcchio)); if((dpxL<uSogliaCol)!=(vFascia>0.5)) discard; }';
var LOD_SCEGLI_SE=['#ifdef RM_LOD',LOD_SCEGLI,'if(vFila<-0.5) discard;','#endif'].join(String.fromCharCode(10));      // fuori dai monumenti i rocchi non si vedono mai      // fuori dai monumenti la scelta si compila solo nei materiali che portano fasce (C.maglia): un «discard» nello shader toglie alla scheda il test di profondità anticipato
/* la fascia: quanta parte del pixel cade su una colonna (integrale della fila di impulsi su una finestra larga un pixel); fra le colonne c'è l'ombra del portico */
var LOD_COLORE=['if(vFascia>0.5){ float xs=vFila+0.5; float fwL=max(fwidth(xs),0.0001); float a0=xs-fwL*0.5; float a1=xs+fwL*0.5; float mz=0.5-vWf*0.5;',
  '  float F0=floor(a0)*vWf+clamp(fract(a0)-mz,0.0,vWf); float F1=floor(a1)*vWf+clamp(fract(a1)-mz,0.0,vWf);',
  '  diffuseColor.rgb*=mix(0.45,1.0,clamp((F1-F0)/fwL,0.0,1.0)); }'].join(String.fromCharCode(10));
var LOD_OMBRA='if(vFascia>0.5 && abs(fract(vFila+0.5)-0.5)>vWf*0.5) discard;';      // nell'ombra la fascia lascia passare la luce fra le colonne
function lodUniformi(sh){ var U=RM.vistaU; sh.uniforms.uOcchio=U.uOcchio; sh.uniforms.uPxScala=U.uPxScala; sh.uniforms.uSogliaCol=U.uSogliaCol; }
function lodVertice(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+String.fromCharCode(10)+LOD_VD).replace('#include <begin_vertex>','#include <begin_vertex>'+String.fromCharCode(10)+LOD_V); }
function conConci(mat){
  var A=String.fromCharCode(10);
  mat.onBeforeCompile=function(sh){
    lodUniformi(sh); lodVertice(sh);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+LOD_FD)
      .replace('#include <color_fragment>',['#include <color_fragment>',LOD_SCEGLI_SE,LOD_COLORE,CONCI].join(A));
  };
  return mat;
}
/* senza conci (barche, alberi, ponteggi): solo la scelta fra colonne e fascia */
function soloLod(mat){
  var A=String.fromCharCode(10);
  mat.onBeforeCompile=function(sh){
    lodUniformi(sh); lodVertice(sh);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+LOD_FD).replace('#include <color_fragment>',['#include <color_fragment>',LOD_SCEGLI_SE,LOD_COLORE].join(A));
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
RM.matPietra=function(classe){ var m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,side:THREE.DoubleSide}); return classe?RM.tingi(conConci(m),classe):soloLod(m); };      // gli edifici (quelli con una classe) mostrano i conci da vicino; barche, alberi e sterpi no
/* Pietra che va in rovina. Lo shader lavora in coordinate locali del monumento:
   ogni "colonna" di muratura (cella in pianta) viene troncata a un'altezza casuale, più bassa quanto più alto è uRovina,
   così i crolli partono dall'alto e non restano pezzi sospesi; le coperture si bucano; la pietra si macchia di muschio. */
var NL=String.fromCharCode(10);
var TAGLIO=[
  /* cantiere (uCant da 0 a 1): la muratura c'è solo fino a una certa quota, diversa da un tratto all'altro (celle di venti metri in pianta); tetti e parti alte arrivano per ultimi */
  'if(uCant<0.999){ float cn=rmH(vec3(floor(vLoc.xz*0.5+0.21),3.0)); if(vLoc.y>uAlt*uCant*(0.7+0.6*cn)+0.04) discard; }',
  'if(vTipo<1.5 && uRovina*2.0+uCrepe*uCrepe*0.2>0.0){',      // (24 novembre 2026) le prove si fanno solo se c'è degrado: su un edificio intatto il pixel non paga il rumore
  '  float rn=rmH(vec3(floor(vLoc.xz*1.6+0.37),1.0));',
  '  float rq=clamp(vLoc.y/uAlt,0.0,1.0);',
  '  if(rq>1.0-uRovina*(0.25+1.7*rn)) discard;',
  '  if(vTipo>0.5 && 0.55*rmN(vec3(vLoc.xz*1.1,2.0))+0.45*rmH(vec3(floor(vLoc.xz*5.0+0.19),2.0))<uRovina*2.0+uCrepe*uCrepe*0.2) discard;',   // coppi caduti: chiazze irregolari
  '}',
  /* smontaggio da un lato solo (il fronte sud del Colosseo): sparisce l'anello esterno con l'attico e la parte alta della cavea, a partire dal punto più a sud e allargandosi; resta il secondo anello, più basso */
  'if(uSud>0.001){ vec2 qs=vLoc.xz/uSudR; float ro=length(qs); if(ro>0.94 || (ro>0.74 && vLoc.y>3.09)){ float an=acos(clamp(dot(qs/ro,uSudDir),-1.0,1.0)); if(an<3.1416*uSud*(0.9+0.2*rmH(vec3(floor(vLoc.xz*0.9),6.0)))) discard; } }'].join(NL);
var DICHIARA=[SAP_DICH,'uniform float uVesteR; uniform sampler2D tMacchieR;','uniform float uRovina; uniform float uCant; uniform float uSpoglio; uniform float uPiombo; uniform float uAlt; uniform float uCrepe; uniform float uSud; uniform vec2 uSudDir; uniform vec2 uSudR;',LOD_FD,
  'float rmH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }',
  'vec2 rmH2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }',
  'float rmN(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);',
  '  return mix(mix(mix(rmH(i),rmH(i+vec3(1.0,0.0,0.0)),f.x),mix(rmH(i+vec3(0.0,1.0,0.0)),rmH(i+vec3(1.0,1.0,0.0)),f.x),f.y),',
  '             mix(mix(rmH(i+vec3(0.0,0.0,1.0)),rmH(i+vec3(1.0,0.0,1.0)),f.x),mix(rmH(i+vec3(0.0,1.0,1.0)),rmH(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z); }',
  /* distanza dal confine fra due celle: dove è quasi zero passa una crepa, che si dirama come quelle vere */
  'float rmCrepa(vec2 p){ vec2 n=floor(p); vec2 f=fract(p); float d1=8.0; float d2=8.0;',
  '  for(int j=-1;j<=1;j++){ for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); float d=length(g+rmH2(n+g)-f); if(d<d1){ d2=d1; d1=d; } else if(d<d2){ d2=d; } } }',
  '  return d2-d1; }'].join(NL);
/* Colonne che mancano (24 novembre 2026): con il degrado una parte delle colonne numerate (si veda C.colonne) sparisce, e con lei i pezzi di architrave e di tetto
   che portano il suo numero; al suo posto compare il rocchio a terra. La quota cresce col degrado che lo shader già mostra (uRovina, che sale con gli anni dalla
   chiusura, con gli incendi, i crolli, la cava, e lo spoglio): 0 per un edificio in uso, circa tre quarti nell'852 per i Fori. La proporzione è una scelta, non una misura:
   delle colonne dei portici dei Fori in età carolingia non si sa quante stessero ancora in piedi; si sa che molte finirono nelle chiese come spoglio. */
var MANCA='if(vFascia<0.5 && abs(vFila)>0.5){ float qM=clamp(uRovina*2.8+uSpoglio*0.15,0.0,0.85); bool manca=fract(sin(floor(abs(vFila)+0.5)*12.9898)*43758.5453)<qM; if(manca!=(vFila<0.0)) discard; }';
/* incuria (uCrepe): crepe nella muratura, colature sotto le creste, erba fra le lastre, coppi scoloriti e mancanti.
   rovina (uRovina): muschio e crolli. Le due cose sono separate: un edificio si crepa molto prima di cadere. */
var COLORA=[
  'float rq2=clamp(vLoc.y/uAlt,0.0,1.0);',
  'if(vTipo<0.5 && uCrepe>0.01){',
  '  vec3 an=abs(vNor); bool piano=an.y>0.7;',
  '  vec2 cp=piano?vLoc.xz:vec2(an.x>an.z?vLoc.z:vLoc.x,vLoc.y);',
  '  float fw=max(fwidth(cp.x),fwidth(cp.y))*1.8+0.0001; float largo=max(0.03,fw*0.7);',      // (24 novembre 2026) la larghezza del pixel si stima dalle coordinate, non dalla crepa: così la crepa si calcola solo dove può comparire
  '  float zona=rmN(vec3(cp*0.45+1.3,5.0));',
  '  float kz=clamp(0.4/fw,0.0,1.0)*smoothstep(0.0,0.1,0.12+uCrepe*0.48-zona); float riga=0.0;',
  '  if(kz>0.0){ float e=rmCrepa(cp*1.1+3.7); riga=(1.0-smoothstep(largo*0.5,largo,e))*kz*smoothstep(0.3,0.5,rmN(vec3(cp*2.3,7.0))); }',      // il diagramma delle celle (nove prove) solo nelle zone crepate: prima si pagava su tutti i muri degradati
  '  diffuseColor.rgb*=1.0-0.52*riga;',
  '  if(piano){',
  '    float kE=1.0-smoothstep(0.015,0.045,fwidth(vLoc.x)+fwidth(vLoc.z));',                                                                                // la grana fine dell'erba sfuma da lontano (24 novembre 2026)
  '    if(rq2<0.4 && uVesteR>0.5){ vec4 mg=texture2D(tMacchieR,vLoc.xz/7.0+0.17); vec4 mg2=texture2D(tMacchieR,vLoc.xz/2.2+0.61); float mE=0.5*mg.r+0.3*mg2.g+0.2*mg2.b+0.25*riga;',      // veste del PC: chiazze morbide da una trama (prima il rumore a celle disegnava una tela mimetica a poligoni), erba verde e secca
  '      diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(0.19,0.25,0.08),vec3(0.33,0.3,0.12),smoothstep(0.35,0.7,mg2.r))*(0.82+0.32*mg.b),uCrepe*0.88*smoothstep(0.36,0.6,mE)); }',
  '    else if(rq2<0.4) diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(0.27,0.3,0.14),vec3(0.19,0.25,0.08),uVesteR)*(0.85+0.3*mix(0.5,rmN(vec3(vLoc.xz*9.0,8.0)),kE)),uCrepe*0.85*smoothstep(0.4,0.7,0.55*rmN(vec3(vLoc.xz*1.8,9.0))+0.3*rmN(vec3(vLoc.xz*5.3,9.5))+0.15*mix(0.5,rmN(vec3(vLoc.xz*14.0,9.7)),kE)+0.3*riga));',      // erba fra le lastre: chiazze a più grane, dal bordo sfrangiato (prima erano macchie larghe e nette, da tela mimetica)
  '    else diffuseColor.rgb*=1.0-0.55*clamp((uRovina*2.0+uCrepe*uCrepe*0.2)*3.0,0.0,1.0);',                                                           // sotto i tetti sfondati si vede il buio
  '  } else diffuseColor.rgb*=1.0-0.34*uCrepe*smoothstep(0.5,0.8,rmN(vec3(cp.x*4.0,vLoc.y*0.45,3.0)));',                                              // colature
  '}',
  'if(vTipo<1.5 && uRovina*2.4+uCrepe*0.5>0.0){ float rm=smoothstep(0.35,0.72,rmN(vLoc*2.3+0.11)); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.5,0.56,0.38),clamp((uRovina*2.4+uCrepe*0.5)*rm*(1.15-rq2),0.0,1.0)); }',
  'if(vTipo>0.5 && vTipo<1.5){ if(uCrepe>0.0) diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.62,0.66,0.6)+0.015,uCrepe*0.75*rmN(vec3(vLoc.xz*1.4,4.0))); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.3,0.27,0.23),uSpoglio); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.2,0.215,0.235),uPiombo); }',      // uPiombo: coperture rifatte in lastre di piombo (il Pantheon dopo Gregorio III)
  'if(vTipo>2.5){ float pa=rmN(vec3(vLoc.xz*0.9,11.0)); float pb=rmN(vec3(vLoc.xz*4.3,12.0)); float pc=rmN(vec3(vLoc.xz*17.0,13.0));',                    // prato: chiazze larghe, ciuffi, filo d'erba
  '  float fwP=fwidth(vLoc.x)+fwidth(vLoc.z); float kcP=1.0-smoothstep(0.012,0.035,fwP); float kbP=1.0-smoothstep(0.05,0.14,fwP);',                       // ciuffi e fili si spengono quando il loro passo scende sotto i tre pixel: da lontano brulicavano (24 novembre 2026)
  '  diffuseColor.rgb*=0.82+0.22*pa+0.12*kbP*(pb-0.5)+0.1*kcP*(pc-0.5);',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.36,0.34,0.17)*(0.8+0.5*pb),clamp(uCrepe*1.1,0.0,0.85)*smoothstep(0.25,0.65,pa+0.3*pb)); }',                // lasciato a sé stesso ingiallisce e si fa incolto
  'if(vTipo<1.5) diffuseColor.rgb*=mix(0.74,1.0,smoothstep(0.0,0.2,rq2));'].join(NL);      // ombra d'appoggio al piede
function innesta(sh,u,colore){
  sh.uniforms.uSapQ=RM.sapere.q; sh.uniforms.uSapCol=u.uSapCol; sh.uniforms.uVesteR=RM.vesteU||{value:0}; sh.uniforms.tMacchieR={value:RM.VESTE?RM.trameVeste().macchie:null};      // veste del PC: l'erba fra le lastre prende il verde dell'erba del suolo
  sh.uniforms.uRovina=u.uRovina; sh.uniforms.uCant=u.uCant; sh.uniforms.uSpoglio=u.uSpoglio; sh.uniforms.uPiombo=u.uPiombo; sh.uniforms.uAlt=u.uAlt; sh.uniforms.uCrepe=u.uCrepe; sh.uniforms.uSud=u.uSud; sh.uniforms.uSudDir=u.uSudDir; sh.uniforms.uSudR=u.uSudR;
  lodUniformi(sh); lodVertice(sh);
  var SCEGLI=LOD_SCEGLI.replace('dpxL<uSogliaCol','dpxL<uSogliaCol*(1.0-step(0.02,uRovina))');      // in rovina niente fascia: il portico è senza tetto e senza muri, e fra i monconi si vede il prato, non l'ombra
  SCEGLI+=NL+MANCA;      // le colonne che mancano, e i rocchi a terra
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+NL+DICHIARA);
  if(colore) sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',SCEGLI,TAGLIO,LOD_COLORE,CONCI,COLORA,SAP_TINTA].join(NL));
  else sh.fragmentShader=sh.fragmentShader.replace('#include <clipping_planes_fragment>',[SCEGLI,LOD_OMBRA,TAGLIO,'#include <clipping_planes_fragment>'].join(NL));
}
RM.matRovina=function(alt){
  var u={uSapCol:{value:RM.sapere.COL.C.clone()},uRovina:{value:0},uCant:{value:1},uSpoglio:{value:0},uPiombo:{value:0},uAlt:{value:alt||1},uCrepe:{value:0},uSud:{value:0},uSudDir:{value:new THREE.Vector2(0,1)},uSudR:{value:new THREE.Vector2(1,1)}};
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
