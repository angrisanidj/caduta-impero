/* Tessuto abitato: isolati disposti per quartieri, ciascuno con la sua griglia di strade.
   Ogni isolato ha una "tenuta": chi ce l'ha bassa viene abbandonato per primo.
   Abbandonato, l'isolato non scompare: perde il tetto, resta un guscio di muri, poi crolla a tratti e si copre di sterpi.
   Ogni isolato ha un destino (guscio alto, rudere basso, orto fra i monconi) e un'età contata dall'anno in cui è stato lasciato. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, rnd=RM.casuale(476), PASSO=5.6, isolati=[];

/* ---------- dove sorgono gli isolati ---------- */
var QUARTIERI=[[-90,-70,.08],[-60,-150,.3],[40,-35,.6],[70,-90,.75],[150,-40,.35],[120,50,.1],[90,110,.5],[-25,110,.3],[-60,150,.05],[80,170,.75],
               [-125,40,.35],[-230,-105,0],[-40,25,.62],[-20,-190,.3],[150,-120,.6],[190,80,.9],[-70,-15,.3],[40,-110,.45],[220,10,.2],[210,60,.5],[-150,-20,.4]];
var NUCLEI=RM.NUCLEI;
function tenuta(x,z){
  var t=0;
  NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,n[2]*Math.exp(-(d*d)/(n[3]*n[3]))); });
  t+=.25*Math.exp(-RM.distFiume(x,z)/45);          // vicino al fiume c'è acqua anche senza acquedotti
  t-=.008*RM.h(x,z);                               // i colli si svuotano un po' prima
  return t+(rnd()-.5)*.08;
}
/* Tenuta nei secoli V-VII. Gli scavi mostrano un abitato sparso su tutta l'area dentro le mura, non ancora raccolto sul Tevere:
   qui conta soprattutto il caso, con un piccolo vantaggio per chi sta vicino al fiume o a una chiesa e uno svantaggio per i colli e i margini. */
function tenutaSparsa(x,z){
  var t=0;
  NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,(n[3]>15?.22:.4)*n[2]*Math.exp(-(d*d)/(n[3]>15?70*70:13*13))); });
  t+=.2*Math.exp(-RM.distFiume(x,z)/45)-.02*RM.h(x,z)-.22*RM.sfuma(140,300,Math.hypot(x-5,z-5));
  return t+(rnd()-.5)*.8;
}
/* 0 = occupato; 1 = libero; un anno = libero fino a quell'anno, quando sul sito si apre il cantiere di un monumento e le case vengono demolite
   (per le terme di Diocleziano lo dice l'iscrizione dedicatoria: edifici comprati e abbattuti per far posto all'opera) */
function libero(x,z,margine){
  if(RM.distFiume(x,z)<9.5 || RM.distStrade(x,z)<2.5) return 0;
  var i, q, fino=1;
  for(i=0;i<RM.zone.length;i++){ q=RM.zone[i]; if(Math.hypot(x-q.x,z-q.z)<q.r+margine){ if(!(q.dal>0)) return 0; fino=fino>1?Math.min(fino,q.dal):q.dal; } }
  for(i=0;i<RM.HORTI.length;i++){ q=RM.HORTI[i]; if(Math.hypot(x-q[0],z-q[1])<q[2]+1) return 0; }
  for(i=0;i<RM.campateAcquedotti.length;i++){ q=RM.campateAcquedotti[i]; if(Math.abs(x-q.x)<6 && Math.hypot(x-q.x,z-q.z)<3.5+q.len*.25) return 0; }   // né sotto le arcate degli acquedotti
  return fino;
}
function quartiereDi(x,z){ var m=1e9, k=0; for(var i=0;i<QUARTIERI.length;i++){ var d=Math.hypot(x-QUARTIERI[i][0],z-QUARTIERI[i][1]); if(d<m){ m=d; k=i; } } return k; }
QUARTIERI.forEach(function(Q,k){
  var ca=Math.cos(Q[2]), sa=Math.sin(Q[2]), R=30;
  for(var i=-R;i<=R;i++) for(var j=-R;j<=R;j++){
    var x=Q[0]+(i*ca+j*sa)*PASSO, z=Q[1]+(-i*sa+j*ca)*PASSO;
    if(x<-330||x>330||z<-380||z>420 || quartiereDi(x,z)!==k) continue;
    var dentro=RM.dentroMura(x,z), bordo=RM.distLinea(x,z,RM.MURA,true), centro=Math.hypot(x-5,z-5);
    var borgo=dentro?0:Math.exp(-((x+228)*(x+228)+(z+106)*(z+106))/(27*27));                  // attorno a San Pietro: case che nasceranno dal V secolo
    var dens=dentro ? .95-.28*RM.sfuma(150,290,centro) : Math.max(.36*Math.exp(-bordo/24),.8*borgo);
    var lib; if(bordo<3.5 || rnd()>dens || !(lib=libero(x,z,2.4)) || (lib>1&&borgo>.3)) continue;
    var e=1.9, y0=RM.h(x,z), y1=RM.h(x+e,z+e), y2=RM.h(x-e,z+e), y3=RM.h(x+e,z-e), y4=RM.h(x-e,z-e), yMin=Math.min(y0,y1,y2,y3,y4);
    if(Math.max(y0,y1,y2,y3,y4)-yMin>2.2) continue;        // rupi e scarpate restano nude
    var fitto=1-RM.sfuma(30,240,centro), alt=dentro ? .9+1.7*fitto*(.5+.5*rnd())+.45*rnd() : .55+.5*rnd(), s=rnd();
    isolati.push({x:x,z:z,y:yMin,ry:Q[2]+(rnd()-.5)*.05,w:3.85+rnd()*.9,d:3.85+rnd()*.9,alt:alt,
      tipo:!dentro?(s<.6?2:0):(s<.5-.15*fitto?2:s<.92-.14*fitto?0:1),              // 0 a falde, 1 a corte, 2 a padiglione
      k:tenuta(x,z)+(dentro?0:-.35), k1:tenutaSparsa(x,z)+(dentro?0:-.6), rudere:.16+.3*rnd(), sorte:rnd(), tono:rnd(), sfasa:rnd(), dentro:dentro, via:lib>1?lib:0, a0:-1, q0:0, e0:-1, alb:0, nasce:borgo>.3?450+Math.round(330*rnd()*(1.15-borgo)):0});
  }
});
isolati.forEach(function(b){ if(b.nasce){ b.k=9; b.k1=9; b.alt=.6+.5*b.tono; } });      // il Borgo non si svuota: è l'unico quartiere che cresce
isolati.slice().sort(function(a,b){ return a.k-b.k; }).forEach(function(o,i,tutti){ o.p2=i/(tutti.length-1); });     // rango dall'VIII secolo: nuclei sul Tevere e isole attorno alle chiese
isolati.slice().sort(function(a,b){ return a.k1-b.k1; }).forEach(function(o,i,tutti){ o.p1=i/(tutti.length-1); });   // rango fino al VII secolo: abitato sparso
/* fra il 640 e il 790 si passa da un ordine all'altro: la gente si raccoglie nel Campo Marzio e attorno alle chiese, e lì si torna a costruire */
function rango(b,anno){ return b.p1+(b.p2-b.p1)*RM.sfuma(640,790,anno); }
var N=RM.N_ISOLATI=isolati.length; RM.isolati=isolati;
/* anno in cui ciascun isolato viene lasciato, e che cosa ne resta alla fine */
(function(){
  var soglie=[], y; for(y=200;y<=852;y++) soglie.push(1-D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,y)));
  isolati.forEach(function(b){
    b.lasciato=9999; for(var k=0;k<soglie.length;k++) if(rango(b,200+k)<soglie[k]){ b.lasciato=200+k; break; }
    b.fato=b.dentro?(b.sorte<.34?0:b.sorte<.8?1:2):(b.sorte<.3?1:2);          // 0 guscio alto, 1 rudere basso, 2 orto fra i monconi
    b.hFin=b.fato===0?.5+.38*b.tono:b.fato===1?b.rudere:.07+.1*b.tono;        // quanto resta in piedi, in quota dell'altezza
    b.giro=(b.sorte*977)|0;                                                   // quarti di giro: quattro profili di rovina diversi
  });
  /* incendi dei sacchi: attorno a ogni fuoco una parte degli isolati brucia e resta un guscio annerito per qualche decennio */
  (D.EVENTI||[]).forEach(function(ev){ if(!ev.bruciati) return; ev.fuochi.forEach(function(f){ isolati.forEach(function(b){
    var dd=Math.hypot(b.x-f[0],b.z-f[1])/(ev.bruciati*f[2]);
    if(dd<1 && b.fuoco==null && b.tono<1.05-dd){ b.fuoco=ev.da; b.fuocoFine=ev.da+(ev.ricostruzione?ev.ricostruzione*(.6+.8*b.sfasa):18+30*b.sfasa); }   // il Borgo dell'847 viene rifatto in pochi anni
  }); }); });
})();

/* ---------- trame ---------- */
var FIN=[], rf=RM.casuale(21);
(function(){ for(var r=0;r<3;r++) for(var c=0;c<6;c++) FIN.push([9+c*20,22+r*27,7,11,rf()<.4]); for(var t=0;t<4;t++) FIN.push([8+t*31,99,19,22,rf()<.5]); })();
var texMuri=RM.tela(128,128,function(g,W,H){
  g.fillStyle='#f3eee4'; g.fillRect(0,0,W,H);
  for(var i=0;i<260;i++){ g.fillStyle='rgba(120,95,70,'+(.02+rf()*.05)+')'; g.fillRect(rf()*W,rf()*H,2+rf()*10,6+rf()*30); }
  g.fillStyle='rgba(110,85,60,.25)'; [47,74,98].forEach(function(y){ g.fillRect(0,y,W,1); });
  FIN.forEach(function(f){ g.fillStyle='#35281f'; g.fillRect(f[0],f[1],f[2],f[3]); });
});
var texLumi=RM.tela(128,128,function(g,W,H){
  g.fillStyle='#000'; g.fillRect(0,0,W,H);
  FIN.forEach(function(f){ if(f[4]){ g.fillStyle='#ffc070'; g.fillRect(f[0],f[1],f[2],f[3]); } });
});
var texCoppi=RM.tela(64,64,function(g,W,H){
  g.fillStyle='#aa6243'; g.fillRect(0,0,W,H);
  for(var x=0;x<W;x+=4){ g.fillStyle=x%8?'#9a573e':'#be8263'; g.fillRect(x,0,2,H); }
  for(var i=0;i<140;i++){ g.fillStyle='rgba('+(rf()<.5?'70,40,25':'230,170,120')+','+(.05+rf()*.12)+')'; g.fillRect(rf()*W,rf()*H,3,5); }
  g.fillStyle='rgba(60,35,22,.22)'; for(var y=0;y<H;y+=8) g.fillRect(0,y,W,1);
}); texCoppi.repeat.set(2,1.5);
var texRudere=RM.tela(64,64,function(g,W,H){                     // muro scrostato: intonaco a chiazze sul mattone, finestre vuote
  g.fillStyle='#d9cfc0'; g.fillRect(0,0,W,H);
  for(var i=0;i<120;i++){ g.fillStyle=['rgba(160,100,70,.45)','rgba(95,82,66,.28)','rgba(240,232,215,.45)','rgba(110,120,80,.25)','rgba(150,95,65,.3)'][(rf()*5)|0]; g.fillRect(rf()*W,rf()*H,3+rf()*10,2+rf()*6); }
  for(var y=0;y<H;y+=4){ g.fillStyle='rgba(90,60,40,.07)'; g.fillRect(0,y,W,1); }
  g.fillStyle='#3a2d24'; [[12,8],[42,8],[12,36],[42,36]].forEach(function(f){ g.fillRect(f[0],f[1],9,12); });
  g.fillStyle='rgba(60,50,40,.35)'; g.fillRect(0,58,W,6);
});
var texIncolto=RM.tela(64,64,function(g,W,H){                    // erba secca, terra, cespi
  g.fillStyle='#a09c70'; g.fillRect(0,0,W,H);
  for(var i=0;i<220;i++){ g.fillStyle=['rgba(95,115,65,.4)','rgba(175,160,110,.4)','rgba(130,112,84,.35)','rgba(70,95,55,.35)'][(rf()*4)|0]; g.beginPath(); g.arc(rf()*W,rf()*H,1.5+rf()*4.5,0,6.3); g.fill(); }
});
var texOrto=RM.tela(64,64,function(g,W,H){
  g.fillStyle='#93956a'; g.fillRect(0,0,W,H);
  for(var y=0;y<H;y+=7){ g.fillStyle=y%14?'#7a8852':'#878f5e'; g.fillRect(0,y,W,3); }
  for(var i=0;i<60;i++){ g.fillStyle='rgba('+(rf()<.5?'150,130,80':'60,90,45')+',.3)'; g.fillRect(rf()*W,rf()*H,5,3); }
});
var texAlone=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,190,110,1)'); q.addColorStop(.35,'rgba(255,160,70,.35)'); q.addColorStop(1,'rgba(255,140,50,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);

/* ---------- forme (cubo unitario: base al suolo, lato 1, altezza 1) ---------- */
function Forma(){ this.g=[[],[],[]]; }                        // gruppi: 0 muri, 1 tetto, 2 corte
Forma.prototype.q=function(gr,a,b,c,d,piano){
  var u=piano?[[.01,.99],[.01,.99],[.01,.99],[.01,.99]]:[[0,0],[1,0],[1,1],[0,1]], v=[a,b,c,d];
  [[0,1,2],[0,2,3]].forEach(function(t){ t.forEach(function(k){ this.g[gr].push(v[k][0],v[k][1],v[k][2],u[k][0],u[k][1]); },this); },this); return this;
};
Forma.prototype.t=function(gr,a,b,c){ [a,b,c].forEach(function(p){ this.g[gr].push(p[0],p[1],p[2],.01,.99); },this); return this; };
Forma.prototype.muri=function(h){
  var s=.5;
  return this.q(0,[-s,0,s],[s,0,s],[s,h,s],[-s,h,s]).q(0,[s,0,-s],[-s,0,-s],[-s,h,-s],[s,h,-s]).q(0,[s,0,s],[s,0,-s],[s,h,-s],[s,h,s]).q(0,[-s,0,-s],[-s,0,s],[-s,h,s],[-s,h,-s]);
};
Forma.prototype.fine=function(){
  var pos=[], uv=[], g=new THREE.BufferGeometry(), inizio=0;
  this.g.forEach(function(lista,k){
    for(var i=0;i<lista.length;i+=5){ pos.push(lista[i],lista[i+1],lista[i+2]); uv.push(lista[i+3],lista[i+4]); }
    if(lista.length){ g.addGroup(inizio,lista.length/5,k); inizio+=lista.length/5; }
  });
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals(); return g;
};
var s=.5, o=.54;
var FORME=[
  (function(){ var f=new Forma().muri(.78);                                            // a due falde
    f.t(0,[s,.78,s],[s,.78,-s],[s,1,0]).t(0,[-s,.78,-s],[-s,.78,s],[-s,1,0]);
    return f.q(1,[-o,.74,o],[o,.74,o],[o,1,0],[-o,1,0]).q(1,[o,.74,-o],[-o,.74,-o],[-o,1,0],[o,1,0]).fine(); })(),
  (function(){ var f=new Forma().muri(.9), c=.2, m=.35;                                // a corte
    f.q(0,[-c,.04,-c],[c,.04,-c],[c,.8,-c],[-c,.8,-c],1).q(0,[c,.04,c],[-c,.04,c],[-c,.8,c],[c,.8,c],1).q(0,[c,.04,-c],[c,.04,c],[c,.8,c],[c,.8,-c],1).q(0,[-c,.04,c],[-c,.04,-c],[-c,.8,-c],[-c,.8,c],1);
    [[1,1],[-1,1],[-1,-1],[1,-1]].forEach(function(e,i,E){ var n=E[(i+1)%4];           // falda esterna e interna, lato per lato
      f.q(1,[e[0]*o,.88,e[1]*o],[n[0]*o,.88,n[1]*o],[n[0]*m,1,n[1]*m],[e[0]*m,1,e[1]*m]).q(1,[e[0]*m,1,e[1]*m],[n[0]*m,1,n[1]*m],[n[0]*c,.8,n[1]*c],[e[0]*c,.8,e[1]*c]); });
    return f.q(2,[-c,.04,c],[c,.04,c],[c,.04,-c],[-c,.04,-c],1).fine(); })(),
  (function(){ var f=new Forma().muri(.72), r=.2;                                      // a padiglione
    f.q(1,[-o,.7,o],[o,.7,o],[r,1,0],[-r,1,0]).q(1,[o,.7,-o],[-o,.7,-o],[-r,1,0],[r,1,0]);
    return f.t(1,[o,.7,o],[o,.7,-o],[r,1,0]).t(1,[-o,.7,-o],[-o,.7,o],[-r,1,0]).fine(); })()
];
/* guscio: muri perimetrali a creste rotte, due tramezzi. Alto 1: l'istanza lo abbassa man mano che crolla */
var geoRudere=(function(){ var f=new Forma(), n=4, lati=[[-s,s,s,s],[s,s,s,-s],[s,-s,-s,-s],[-s,-s,-s,s]],
    alt=[[[1,1],[.92,.7],[.7,.96],[.96,.82]],[[.82,.82],[.36,.3],[.3,.9],[1,1]],[[.66,.52],[.94,.94],[.94,.8],[.46,.2]],[[.9,.9],[.74,.6],[.2,.26],[.6,.88]]];
  lati.forEach(function(l,i){ for(var k=0;k<n;k++){ var x0=l[0]+(l[2]-l[0])*k/n, z0=l[1]+(l[3]-l[1])*k/n, x1=l[0]+(l[2]-l[0])*(k+1)/n, z1=l[1]+(l[3]-l[1])*(k+1)/n, h=alt[i][k];
    f.q(0,[x0,0,z0],[x1,0,z1],[x1,h[1],z1],[x0,h[0],z0]); } });
  f.q(0,[-.12,0,-s],[-.12,0,s],[-.12,.5,s],[-.12,.84,-s]).q(0,[-.12,0,.1],[s,0,.1],[s,.34,.1],[-.12,.62,.1]);
  return f.fine(); })();
/* quel che resta del tetto subito dopo l'abbandono: una falda e mezza, sfondata */
var geoTettoRotto=(function(){ var f=new Forma();
  f.q(0,[-o,.74,o],[.12,.74,o],[-.05,1,0],[-o,1,0]).t(0,[.12,.74,o],[.34,.8,.3],[-.05,1,0]).q(0,[-.2,.74,-o],[-o,.74,-o],[-o,1,0],[-.3,1,0]);
  return f.fine(); })();
/* cumulo di macerie */
var geoMacerie=(function(){ var f=new Forma(), r=RM.casuale(99);                 // tre cumuli bassi e sformati, non un solo cono
  [[-.12,-.08,.38],[.2,.2,.26]].forEach(function(c){
    var n=5, est=[], int=[], k, j, alto=.5+.5*r();
    for(k=0;k<n;k++){ var a=k/n*6.283+r(), re=c[2]*(.8+.4*r()), ri=c[2]*(.35+.3*r()); est.push([c[0]+Math.cos(a)*re,0,c[1]+Math.sin(a)*re]); int.push([c[0]+Math.cos(a)*ri,alto*(.6+.4*r()),c[1]+Math.sin(a)*ri]); }
    for(k=0;k<n;k++){ j=(k+1)%n; f.t(0,est[k],int[k],est[j]).t(0,est[j],int[k],int[j]).t(0,int[k],[c[0],alto*.85,c[1]],int[j]); }
  });
  return f.fine(); })();
/* sterpi e alberelli cresciuti fra i muri */
var geoSterpi=(function(){ var B=new RM.Costruttore(), secco=RM.col(0x8a8a5c), rovo=RM.col(0x66744a);
  [[-.3,-.26,.14,rovo],[.3,.32,.17,P.chioma2],[.12,-.42,.11,secco],[-.38,.3,.12,secco]].forEach(function(c){
    B.geo(new THREE.SphereGeometry(c[2],4,2).scale(1,.75,1).translate(c[0],c[2]*.45,c[1]),c[3]); });
  return B.geometria(); })();

/* ---------- maglie ---------- */
var matMuri=new THREE.MeshStandardMaterial({map:texMuri,roughness:.95,side:THREE.DoubleSide,emissive:new THREE.Color(0xffffff),emissiveMap:texLumi,emissiveIntensity:0});
var matTetti=new THREE.MeshStandardMaterial({map:texCoppi,roughness:.9,side:THREE.DoubleSide});
var matCorte=new THREE.MeshStandardMaterial({color:RM.col(0x8f7f6a),roughness:1});
/* ombra d'appoggio: le pareti si scuriscono verso il suolo, così le case sembrano posate e non incollate */
function appoggio(mat){ var A=String.fromCharCode(10); mat.onBeforeCompile=function(sh){
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying float vAlto;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vAlto=position.y;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying float vAlto;').replace('#include <color_fragment>','#include <color_fragment>'+A+'diffuseColor.rgb*=mix(0.6,1.0,smoothstep(0.0,0.5,vAlto));'); }; return mat; }
appoggio(matMuri);
function istanze(geo,mat,quante){ var m=new THREE.InstancedMesh(geo,mat,quante); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.castShadow=m.receiveShadow=true; m.frustumCulled=false; RM.scene.add(m); return m; }
/* Pacco di istanze compattato: le istanze a scala zero (case sparite, rovine non ancora nate) non vengono inviate alla scheda grafica.
   Si scrive per indice come su una InstancedMesh; stringi() ricopia in testa solo quelle vive e aggiorna il conteggio. */
function pacco(geo,mat,quante){
  var m=istanze(geo,mat,quante), M=new Float32Array(quante*16), C=new Float32Array(quante*3), vivo=new Uint8Array(quante);
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(quante*3),3); m.instanceColor.setUsage(THREE.DynamicDrawUsage); m.count=0;
  return { maglia:m,
    setMatrixAt:function(i,mat){ var e=mat.elements, o=i*16; for(var j=0;j<16;j++) M[o+j]=e[j]; vivo[i]=(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])>1e-10?1:0; },
    setColorAt:function(i,c){ C[i*3]=c.r; C[i*3+1]=c.g; C[i*3+2]=c.b; },
    stringi:function(){ var k=0, a=m.instanceMatrix.array, ca=m.instanceColor.array, i, j, o, t;
      for(i=0;i<quante;i++) if(vivo[i]){ o=i*16; t=k*16; for(j=0;j<16;j++) a[t+j]=M[o+j]; ca[k*3]=C[i*3]; ca[k*3+1]=C[i*3+1]; ca[k*3+2]=C[i*3+2]; k++; }
      m.count=k; m.instanceMatrix.needsUpdate=true; m.instanceColor.needsUpdate=true; } };
}
var conta=[0,0,0]; isolati.forEach(function(b){ b.ti=conta[b.tipo]++; });
var vivi=FORME.map(function(g,k){ return pacco(g,[matMuri,matTetti,matCorte],Math.max(1,conta[k])); });
var ruderi=pacco(geoRudere,appoggio(new THREE.MeshStandardMaterial({map:texRudere,roughness:1,side:THREE.DoubleSide})),N);
var tettiRotti=pacco(geoTettoRotto,new THREE.MeshStandardMaterial({map:texCoppi,roughness:1,side:THREE.DoubleSide}),N);
var macerie=pacco(geoMacerie,new THREE.MeshStandardMaterial({roughness:1,side:THREE.DoubleSide,flatShading:true}),N);
var sterpi=pacco(geoSterpi,RM.matPietra(),N); sterpi.maglia.castShadow=false;
var geoPiano=new THREE.PlaneGeometry(1,1); geoPiano.rotateX(-Math.PI/2);
var incolti=pacco(geoPiano,new THREE.MeshStandardMaterial({map:texIncolto,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),N); incolti.maglia.castShadow=false;
var geoOrto=new THREE.PlaneGeometry(1,1); geoOrto.rotateX(-Math.PI/2);
var orti=pacco(geoOrto,new THREE.MeshStandardMaterial({map:texOrto,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),N); orti.maglia.castShadow=false;

/* alberi: cipressi e pini a ombrello */
var matAlbero=RM.matPietra();
var geoCipresso=new RM.Costruttore().cilindro(.06,.3,0,0,0,P.tronco,.06,5).geo(new THREE.ConeGeometry(.3,2.1,7).translate(0,1.3,0),P.chioma).geometria();
var geoPino=new RM.Costruttore().cilindro(.07,1.3,0,0,0,P.tronco,.05,5).geo(new THREE.SphereGeometry(.72,8,5).scale(1,.42,1).translate(0,1.5,0),P.chioma2).geometria();
var alberi=[[],[]];
isolati.forEach(function(b,i){ if(rnd()<(b.fato===2?.4:.2)) alberi[rnd()<(b.fato===2?.45:.15)?0:1].push({x:b.x+(rnd()-.5)*3,z:b.z+(rnd()-.5)*3,s:.7+rnd()*.7,b:i}); });   // negli orti, e selvatici fra le rovine
RM.HORTI.forEach(function(h){ for(var k=0;k<h[2]*h[2]/9;k++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*h[2]; alberi[rnd()<.4?0:1].push({x:h[0]+r*Math.cos(a),z:h[1]+r*Math.sin(a),s:.8+rnd()*.7,b:-1}); } });
for(var f=0;f<260;f++){ var t=rnd(), pf=RM.curvaFiume.getPoint(.12+t*.76), lato=rnd()<.5?-1:1, tg=RM.curvaFiume.getTangent(.12+t*.76); alberi[1].push({x:pf.x-tg.z*lato*(9+rnd()*4),z:pf.z+tg.x*lato*(9+rnd()*4),s:.6+rnd()*.5,b:-2}); }   // rive
var magliaAlberi=[istanze(geoCipresso,matAlbero,alberi[0].length),istanze(geoPino,matAlbero,alberi[1].length)];
alberi.forEach(function(l){ l.forEach(function(a){ a.y=RM.h(a.x,a.z); a.q0=-1; }); });

/* luci della notte */
var pPos=new Float32Array(N*3), pCol=new Float32Array(N*3);
isolati.forEach(function(b,i){ pPos[i*3]=b.x; pPos[i*3+1]=b.y+b.alt*.8; pPos[i*3+2]=b.z; });
var gLuci=new THREE.BufferGeometry();
gLuci.setAttribute('position',new THREE.BufferAttribute(pPos,3)); gLuci.setAttribute('color',new THREE.BufferAttribute(pCol,3));
var luci=new THREE.Points(gLuci,new THREE.PointsMaterial({size:11,map:texAlone,vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true,fog:false}));
luci.visible=false; luci.frustumCulled=false; RM.scene.add(luci);

var INTONACI=[0xf0dfb8,0xe6c79c,0xf2e9d2,0xe3b89c,0xf6efde,0xe8d2a6].map(RM.col), CAMPI=[0xf2f0e0,0xe6dcae,0xd3dcae,0xd6c896,0xc9c2a0].map(RM.col);
var MURO_VECCHIO=[0xb48f72,0xa98a70,0x9d9278,0xb89a7c].map(RM.col), MACERIA=RM.col(0xa58c74), MACERIA_VECCHIA=RM.col(0x8f8468), ERBE=[0xffffff,0xe9e6c8,0xd6e0b8,0xf0e2c0].map(RM.col), COPPI_ROTTI=RM.col(0xb8a898);
var d=new THREE.Object3D(), c=new THREE.Color(), bianco=new THREE.Color(1,1,1);

/* ---------- aggiornamento: si riscrivono solo gli isolati che cambiano ---------- */
var ultimaBassa=-1;
function aggiorna(anno){
  var fr=D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,anno)), soglia=1-fr, numVivi=0, toccati=false, i, b, a, q, eta, v, crollo, H, hm, m;
  var bassa=1-.42*RM.sfuma(470,720,anno), forza=Math.abs(bassa-ultimaBassa)>.01; if(forza) ultimaBassa=bassa;      // le case a più piani lasciano il posto a case basse, a uno o due piani
  for(i=0;i<N;i++){
    b=isolati[i];
    a=RM.sfuma(-.02,.02,rango(b,anno)-soglia);             // 1 abitato, 0 abbandonato
    var arso=0, da0=b.lasciato+b.sfasa*12;
    if(b.fuoco!=null && anno>b.fuoco-.4){
      if(anno<b.fuocoFine){ arso=RM.sfuma(b.fuoco-.4,b.fuoco,anno)*(1-RM.sfuma(b.fuocoFine-Math.min(5,(b.fuocoFine-b.fuoco)*.5),b.fuocoFine,anno)); a*=1-arso; }   // poi, se il quartiere è ancora vivo, si ricostruisce
      if(b.fuoco<da0) da0=b.fuoco;
    }
    var dm=b.via?RM.sfuma(b.via-3*b.sfasa-1,b.via-3*b.sfasa,anno):0; if(dm>0) a*=1-dm;       // demolita per far posto a un monumento: non restano rovine
    if(b.nasce) a=RM.sfuma(b.nasce-5,b.nasce,anno)*(1-arso); // casa del Borgo: prima della sua data non c'è nulla, nemmeno rovine
    if(a>.5) numVivi++;
    eta=a>.999?0:b.nasce?(arso>0?Math.max(0,anno-b.fuoco):0):Math.max(0,anno-da0);          // anni passati dall'abbandono (o dall'incendio)
    if(!(forza&&a>.01) && Math.abs(a-b.a0)<.002 && (a>.999 || Math.abs(eta-b.e0)<1.5 || (eta>430&&b.e0>430))) continue;
    b.a0=a; b.e0=eta; toccati=true; v=b.nasce?arso:(1-a)*(1-dm);
    crollo=b.fato===2?RM.sfuma(5,60,eta):RM.sfuma(8,95,eta); H=(1-(1-b.hFin)*crollo)*(1-.4*RM.sfuma(140,420,eta));   // nei secoli anche i gusci si abbassano
    q=(b.fato===2?RM.sfuma(50,120,eta):b.fato===1&&b.tono>.45?RM.sfuma(200,330,eta):0)*v; b.q0=q;   // 1 = ormai orto o vigna (dal VII secolo anche fra i ruderi bassi)
    b.alb=Math.max(q,b.fato===2?0:RM.sfuma(70,160,eta)*v);             // alberi: coltivati negli orti, selvatici altrove
    d.rotation.set(0,b.ry,0);
    d.position.set(b.x,b.y-.15,b.z); d.scale.set(b.w,a>.01?b.alt*a*(b.nasce?1:bassa)+.15:0,b.d); if(a<=.01) d.scale.set(0,0,0); d.updateMatrix();
    vivi[b.tipo].setMatrixAt(b.ti,d.matrix); vivi[b.tipo].setColorAt(b.ti,c.copy(INTONACI[(b.tono*INTONACI.length)|0]).multiplyScalar(.86+.28*b.sfasa));
    /* muri: appena lasciati hanno il colore dell'intonaco, poi resta il mattone */
    hm=v*b.alt*H; d.rotation.set(0,b.ry+b.giro*Math.PI/2,0);
    d.scale.set(hm>.01?b.w:0,hm,hm>.01?b.d:0); d.updateMatrix(); ruderi.setMatrixAt(i,d.matrix);
    ruderi.setColorAt(i,c.copy(INTONACI[(b.tono*INTONACI.length)|0]).multiplyScalar(.9).lerp(MURO_VECCHIO[(b.sfasa*MURO_VECCHIO.length)|0],RM.sfuma(3,70,eta)).multiplyScalar((.82+.3*b.tono)*(1-.55*arso*(1-RM.sfuma(0,30,eta)))));    // annerito se è bruciato da poco
    /* il tetto cede nei primi trent'anni */
    m=v*(1-RM.sfuma(10,34,eta))*(1-arso); d.scale.set(m>.02?b.w:0,b.alt*(.35+.65*m),m>.02?b.d:0); d.updateMatrix(); tettiRotti.setMatrixAt(i,d.matrix);
    tettiRotti.setColorAt(i,c.copy(bianco).lerp(COPPI_ROTTI,RM.sfuma(0,25,eta)).multiplyScalar(.8+.25*b.tono));
    /* macerie: crescono mentre i muri scendono; negli orti vengono sgombrate */
    m=v*crollo*(1-.85*q); d.rotation.set(0,b.ry+b.sfasa*6,0); d.scale.set(m>.02?b.w*1.05:0,m*(.16+.2*b.alt*(1-b.hFin)),m>.02?b.d*1.05:0); d.updateMatrix(); macerie.setMatrixAt(i,d.matrix);
    macerie.setColorAt(i,c.copy(MACERIA).lerp(MACERIA_VECCHIA,RM.sfuma(30,150,eta)).multiplyScalar(.8+.35*b.tono));
    /* sterpi fra i muri */
    m=(b.tono>.3?1:0)*v*RM.sfuma(25,130,eta)*(1-q); d.rotation.set(0,b.ry+b.giro*Math.PI/2,0); d.position.y=b.y; d.scale.set(m>.02?b.w*1.05:0,b.w*(.3+.7*m),m>.02?b.d*1.05:0); d.updateMatrix(); sterpi.setMatrixAt(i,d.matrix);
    sterpi.setColorAt(i,c.copy(bianco).multiplyScalar(.7+.35*b.sfasa));
    /* suolo: erba sulle strade e nei cortili, poi (per alcuni) filari */
    m=v*RM.sfuma(10,55,eta); d.rotation.set(0,b.ry,0); d.position.y=b.y+.04; d.scale.set(PASSO*1.04*m,1,PASSO*1.04*m); d.updateMatrix(); incolti.setMatrixAt(i,d.matrix);
    incolti.setColorAt(i,c.copy(ERBE[(b.sfasa*ERBE.length)|0]).multiplyScalar(.8+.3*b.tono));
    d.position.y=b.y+.08; d.scale.set(PASSO*1.02*q,1,PASSO*1.02*q); d.updateMatrix(); orti.setMatrixAt(i,d.matrix);
    orti.setColorAt(i,c.copy(CAMPI[(b.sfasa*CAMPI.length)|0]).multiplyScalar(.8+.3*b.tono));
    var l=a*(.3+.7*b.sfasa); pCol[i*3]=l; pCol[i*3+1]=l*.88; pCol[i*3+2]=l*.66;
  }
  alberi.forEach(function(lista,k){
    var mosso=false;
    lista.forEach(function(al,j){
      var qa=al.b<0?1:isolati[al.b].alb; if(Math.abs(qa-al.q0)<.002) return;
      al.q0=qa; mosso=true; d.rotation.set(0,j,0); d.position.set(al.x,al.y-.05,al.z); d.scale.setScalar(al.s*qa*1.25); d.updateMatrix(); magliaAlberi[k].setMatrixAt(j,d.matrix);
    });
    if(mosso) magliaAlberi[k].instanceMatrix.needsUpdate=true;
  });
  if(toccati){
    vivi.concat([ruderi,tettiRotti,macerie,sterpi,incolti,orti]).forEach(function(p){ p.stringi(); });
    gLuci.attributes.color.needsUpdate=true;
  }
  matMuri.emissiveIntensity=RM.notte*2.2; luci.material.opacity=RM.notte; luci.visible=RM.notte>.02;
  RM.quotaAbitati=numVivi/N;
  if(RM.erba) RM.erba.value=1-D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,anno-30));   // l'erba arriva una trentina d'anni dopo
}
RM.moduli.push(aggiorna);
})();
