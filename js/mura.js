/* Mura Aureliane con torri e porte, acquedotti ad arcate, ponti sul Tevere, Isola Tiberina. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI, d=new THREE.Object3D();
function istanze(geo,mat,quante){ var m=new THREE.InstancedMesh(geo,mat,quante); m.castShadow=m.receiveShadow=true; m.frustumCulled=false; RM.scene.add(m); return m; }

/* ---------- mura: 271-275, rialzate nel 401-403 ---------- */
var mura=(function(){
  var passi=[], M=RM.MURA, i, a, b, L, n, k;
  for(i=0;i<M.length;i++){
    a=M[i]; b=M[(i+1)%M.length]; L=Math.hypot(b[0]-a[0],b[1]-a[1]); n=Math.max(1,Math.round(L/6));
    for(k=0;k<n;k++) passi.push({x:a[0]+(b[0]-a[0])*(k+.5)/n, z:a[1]+(b[1]-a[1])*(k+.5)/n, ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0]), len:L/n});
  }
  var T=new RM.Costruttore().scatola(1,1,.55,0,0,0,P.mattone);                                  // tratto: cortina, cammino di ronda, merli
  for(k=0;k<4;k++) T.scatola(.13,.14,.14,-.375+k*.25,1,.2,P.mattone);
  var W=new RM.Costruttore().scatola(1.5,1.42,1.6,0,0,.25,P.mattone).scatola(1.5,.06,1.6,0,1.42,.25,P.tufo);   // torre quadrata, sporgente
  [[-.6,-.4],[0,-.4],[.6,-.4],[-.6,.95],[0,.95],[.6,.95]].forEach(function(p){ W.scatola(.3,.16,.2,p[0],1.48,p[1],P.mattone); });
  var mat=RM.matPietra(), tratti=istanze(T.geometria(),mat,passi.length), torri=istanze(W.geometria(),mat,passi.length);

  /* porte dove le vie attraversano la cinta */
  var G=new RM.Costruttore(), porte=0;
  RM.STRADE.forEach(function(s){
    for(var i=0;i<s.length-1;i++) for(var j=0;j<M.length;j++){
      var p=s[i], r=[s[i+1][0]-p[0],s[i+1][1]-p[1]], q=M[j], w=M[(j+1)%M.length], sv=[w[0]-q[0],w[1]-q[1]], den=r[0]*sv[1]-r[1]*sv[0]; if(Math.abs(den)<1e-6) continue;
      var t=((q[0]-p[0])*sv[1]-(q[1]-p[1])*sv[0])/den, u=((q[0]-p[0])*r[1]-(q[1]-p[1])*r[0])/den; if(t<0||t>1||u<0||u>1) continue;
      var x=p[0]+r[0]*t, z=p[1]+r[1]*t; porte++;
      G.dentro(x,RM.h(x,z)-.3,z,Math.atan2(-sv[1],sv[0]),function(B){
        B.scatola(3,1.25,1.1,0,0,0,P.travertino).aperture(-.8,.56,.8,.56,1,0,.85,1).aperture(.8,-.56,-.8,-.56,1,0,.85,1);
        [-1,1].forEach(function(k){ B.cilindro(1,1.7,k*2,0,.3,P.mattone,null,14).cilindro(1.08,.12,k*2,1.7,.3,P.tufo,null,14); });
      });
    }
  });
  var magliaPorte=G.maglia(mat); RM.scene.add(magliaPorte);
  passi.forEach(function(p,j){ p.rotto=RM.grana(Math.floor(j/5),7)<.3; });      // i tratti che Totila fa abbattere nel 546: circa un terzo, a blocchi
  var ultima=-1, ultimaBr=-1;
  return function(alt,br){
    if(Math.abs(alt-ultima)<.002 && Math.abs(br-ultimaBr)<.01) return; ultima=alt; ultimaBr=br;
    passi.forEach(function(p,j){
      if(p.y==null){ var cx=Math.cos(p.ang)*p.len/2, cz=-Math.sin(p.ang)*p.len/2, ya=RM.h(p.x-cx,p.z-cz), yb=RM.h(p.x+cx,p.z+cz); p.y=(ya+yb)/2-.3; p.yt=ya-.3; p.pend=Math.atan2(yb-ya,p.len); }   // sui pendii la cortina segue il terreno invece di salire a gradoni
      var y=p.y, sy=Math.max(alt,.0001)*(p.rotto?1-.8*br:1);
      d.position.set(p.x,y,p.z); d.rotation.set(0,p.ang,p.pend); d.scale.set(p.len/Math.cos(p.pend)+.05,sy,1); d.updateMatrix(); tratti.setMatrixAt(j,d.matrix);
      d.position.set(p.x-Math.cos(p.ang)*p.len/2,p.yt,p.z+Math.sin(p.ang)*p.len/2); d.rotation.z=0; d.scale.set(1,j%2?sy:0,j%2?1:0); d.updateMatrix(); torri.setMatrixAt(j,d.matrix);
    });
    tratti.instanceMatrix.needsUpdate=true; torri.instanceMatrix.needsUpdate=true;
    tratti.visible=torri.visible=magliaPorte.visible=alt>.01; magliaPorte.scale.y=Math.max(alt,.0001);
  };
})();

/* ---------- acquedotti ----------
   Il canale scende con una pendenza minima: la sommità delle arcate è quasi orizzontale e sono le pile ad allungarsi o ad accorciarsi
   col terreno. Dove il suolo sale fino al canale l'acquedotto corre interrato e non si vede (la Vergine sotto il Pincio, la Marcia
   oltre porta Tiburtina). Le quote della sommità [x, z, quota] sono una ricostruzione, non un rilievo: rispettano l'ordine noto
   (la Claudia più alta della Marcia a porta Maggiore, la Vergine bassa sul Campo Marzio) dentro un rilievo accentuato 1,8 volte.
   La Traiana arrivava al Gianicolo quasi a livello del suolo e scendeva il pendio verso i mulini: qui è un muro basso che segue il terreno. */
var acque=(function(){
  var LINEE=[{passo:3.6, p:[[619,361,9],[420,170,8.8],[249,12,8.6],[163,62,8.45],[89,74,8.3],[40,54,8.2],[29,51,8.18]]},       // Claudia e Anio Novus fino a porta Maggiore, poi archi neroniani sul Celio fino al Palatino
             {passo:3.2, p:[[600,330,8.5],[400,140,8.25],[255,5,8],[212,-54,7.9],[160,-84,7.8],[136,-92,7.75]]},              // Marcia, Tepula, Giulia: lungo le mura fino a porta Tiburtina, poi interrate verso le terme di Diocleziano
             {passo:1.5, p:[[-22,-175,3.9],[-19,-150,3.85],[-17,-93,3.75],[-44,-74,3.7]]},                                    // Vergine: esce dalle pendici del Pincio e attraversa il Campo Marzio
             {passo:1.6, suolo:.5, p:[[-420,60],[-300,52],[-198,46],[-160,33]]}];                                             // Traiana, sul Gianicolo fino ai mulini di Trastevere
  var el=[], rnd=RM.casuale(537), CIMA=.48;                                     // altezza del pezzo d'arcata (arco e canale), in quota della luce
  LINEE.forEach(function(l,li){
    for(var i=0;i<l.p.length-1;i++){
      var a=l.p[i], b=l.p[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/l.passo)), ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]), ux=(b[0]-a[0])/L, uz=(b[1]-a[1])/L;
      for(var k=0;k<n;k++){
        var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, len=L/n, y=RM.h(x,z), ya=RM.h(x-ux*len/2,z-uz*len/2), yb=RM.h(x+ux*len/2,z+uz*len/2), giu=l.suolo?y:Math.min(y,ya,yb);
        var cima=l.suolo?y+l.suolo:a[2]+(b[2]-a[2])*t;
        el.push({x:x,z:z,ang:ang,len:len,y:giu-.2,cima:cima,suolo:!!l.suolo,pend:l.suolo?Math.atan2(yb-ya,len):0,vis:cima-y>.3,rot:rnd(),blocco:li*1000+i*100+Math.floor(k/6)});
      }
    }
  });
  var sorte={}; el.forEach(function(e){ if(sorte[e.blocco]==null) sorte[e.blocco]=rnd(); e.taglio=sorte[e.blocco]<.4; });   // il taglio colpisce tratti contigui
  el=el.filter(function(e){ return e.vis; }); RM.campateAcquedotti=el;          // sotto le arcate non si costruisce (js/citta.js)
  /* arcata: due mezze pile, arco a tutto sesto, canale. Pila: le due mezze pile sotto l'imposta, allungate fino al suolo */
  var A=new RM.Costruttore(), r=.3, c=.36, k, a0, a1;
  [-1,1].forEach(function(s){ A.scatola(.2,c,1,s*.4,0,0,P.tufo); });
  for(k=0;k<8;k++){
    a0=PI*k/8; a1=PI*(k+1)/8; var x0=r*Math.cos(a0), x1=r*Math.cos(a1), h0=r*Math.sin(a0), h1=r*Math.sin(a1);
    A.quad([x0,h0,.5],[x1,h1,.5],[x1,c,.5],[x0,c,.5],P.tufo).quad([x0,h0,-.5],[x1,h1,-.5],[x1,c,-.5],[x0,c,-.5],P.tufo).quad([x0,h0,.5],[x1,h1,.5],[x1,h1,-.5],[x0,h0,-.5],P.ombra);
  }
  A.scatola(1,CIMA-c,1.1,0,c,0,P.travertino);
  var Pl=new RM.Costruttore(); [-1,1].forEach(function(s){ Pl.scatola(.2,1,1,s*.4,0,0,P.tufo); });
  var R=new RM.Costruttore().scatola(.42,.5,.95,0,0,0,P.tufo); R.quad([-.21,.5,.47],[.21,.5,.47],[.21,.5,-.47],[-.21,.95,-.47],P.tufo).tri([-.21,.5,.47],[-.21,.95,-.47],[-.21,.5,-.47],P.tufo);   // moncone
  var mat=RM.matPietra(), N=el.length, arcate=istanze(A.geometria(),mat,N*2), pile=istanze(Pl.geometria(),mat,N), monconi=istanze(R.geometria(),mat,N), ultimo=-1;
  function zero(maglia,j){ d.scale.set(0,0,0); d.updateMatrix(); maglia.setMatrixAt(j,d.matrix); }
  return function(danno){
    if(Math.abs(danno-ultimo)<.002) return; ultimo=danno;
    el.forEach(function(e,j){
      var rotto=e.taglio&&danno>.6, T=CIMA*e.len, larga=e.suolo?.6:.8, H=e.cima-e.y, Hp=H-T;
      d.rotation.set(0,e.ang,0);
      if(rotto){ zero(arcate,j); zero(arcate,N+j); zero(pile,j); }
      else if(e.suolo){ d.rotation.z=e.pend; d.position.set(e.x,e.y,e.z); d.scale.set(e.len/Math.cos(e.pend)+.05,H/CIMA,larga); d.updateMatrix(); arcate.setMatrixAt(j,d.matrix); d.rotation.z=0; zero(arcate,N+j); zero(pile,j); }   // arcatelle basse, schiacciate, inclinate col pendio
      else{
        d.position.set(e.x,e.cima-T,e.z); d.scale.set(e.len,e.len,larga); d.updateMatrix(); arcate.setMatrixAt(j,d.matrix);
        if(Hp>.02){ d.position.y=e.y; d.scale.set(e.len,Hp,larga); d.updateMatrix(); pile.setMatrixAt(j,d.matrix); } else zero(pile,j);
        if(Hp>T*1.7){ d.position.y=e.y+Hp*.5-T*.5; d.scale.set(e.len,e.len,larga); d.updateMatrix(); arcate.setMatrixAt(N+j,d.matrix); } else zero(arcate,N+j);   // le arcate più alte hanno un secondo ordine
      }
      if(rotto){ d.position.set(e.x-Math.cos(e.ang)*e.len/2,e.y,e.z+Math.sin(e.ang)*e.len/2); d.scale.set(e.len,H*(.25+.6*e.rot),larga); d.updateMatrix(); monconi.setMatrixAt(j,d.matrix); }
      else zero(monconi,j);
    });
    arcate.instanceMatrix.needsUpdate=true; pile.instanceMatrix.needsUpdate=true; monconi.instanceMatrix.needsUpdate=true;
  };
})();

/* ---------- ponti e Isola Tiberina ---------- */
(function(){
  var B=new RM.Costruttore(), curva=RM.curvaFiume;
  [[-157,-104],[-120,1],[-66,28],[-52,38],[-84,97],[-152,-479]].forEach(function(p){     // Elio, Aurelio (ponte Sisto), isola Tiberina, Emilio, Probo, Milvio
    var m=1e9, tm=0, i, q; for(i=0;i<=2400;i++){ q=curva.getPoint(i/2400); var dd=Math.hypot(q.x-p[0],q.z-p[1]); if(dd<m){ m=dd; tm=i/2400; } }
    q=curva.getPoint(tm); var tg=curva.getTangent(tm);
    B.dentro(q.x,-.5,q.z,Math.atan2(-tg.x,-tg.z),function(B){            // l'asse x locale attraversa il fiume
      B.scatola(15,.3,1.3,0,.85,0,P.travertino).scatola(15,.16,.12,0,1.15,.6,P.travertino).scatola(15,.16,.12,0,1.15,-.6,P.travertino);
      [-4.4,-1.5,1.5,4.4].forEach(function(x){ B.scatola(.7,.9,1.5,x,0,0,P.travertino); });
      B.scatola(2,.9,1.3,-6.6,0,0,P.travertino).scatola(2,.9,1.3,6.6,0,0,P.travertino);
    });
  });
  B.dentro(-66,-.5,28,1.2,function(B){
    var is=RM.ellisse(2.3,6.6,20), su=RM.ellisse(2.1,6.3,20), ce=su.map(function(){ return [0,0]; });
    B.striscia(is,0,su,.85,P.travertino).striscia(su,.85,ce,.85,P.selce);
    B.dentro(0,.85,0,0,function(B){ B.tempio(1.5,2.4,1.1,0,-2.6,0,{fronte:4,podio:.25}); B.scatola(2.2,1,2.4,0,0,1.8,P.intonaco).falde(2.4,.5,2.4,0,1,1.8,P.coppi); B.cilindro(.1,1.4,0,0,-.4,P.mattone,.05,4); });
  });
  RM.scene.add(B.maglia(RM.matPietra()));
})();

RM.moduli.push(function(anno){
  mura(D.interp(D.MURA_ALTE,anno), RM.sfuma(545.2,546,anno)*(1-.7*RM.sfuma(546.8,549,anno))*(1-RM.sfuma(715,790,anno)));   // Belisario le richiude in fretta nel 547: resta la cicatrice
  acque(RM.sfuma(534,538,anno)*(1-.75*RM.sfuma(772,790,anno)));   // Adriano I ne rimette in funzione quattro
});
})();
