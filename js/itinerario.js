/* Il percorso del pellegrino: uno degli itinerari della guida di Einsiedeln (fine VIII - inizio IX secolo), disegnato nella scena.
   Una fila di punti dorati sospesa sopra la città segue il tracciato; le stazioni sono numerate; la guida porta la camera
   da una stazione all'altra e dice che cosa il testo elenca a sinistra e a destra. I dati stanno in dati.js (ITINERARIO). */
(function(){
'use strict';
var RM=window.RM, D=window.RM_DATI, IT=D&&D.ITINERARIO, $=function(id){ return document.getElementById(id); };
var bottone=$('btnPellegrino'), carta=$('itinerario');
if(!bottone||!carta) return;
if(!IT||!RM||RM.guasto){ bottone.hidden=true; return; }
function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

var stazioni=IT.stazioni.map(function(s){ var p=RM.ll(s[1],s[2]); return {nome:s[0],x:p[0],z:p[1],sin:s[3],des:s[4],nota:s[5]}; });
/* tracciato: punti ogni 2 unità lungo la via, sospesi sopra i tetti e sempre visibili */
var curva=new THREE.CatmullRomCurve3(IT.via.map(function(v){ var p=RM.ll(v[0],v[1]); return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',.3);
var quanti=Math.round(curva.getLength()/3.2), pos=new Float32Array((quanti+1)*3), i, q;
for(i=0;i<=quanti;i++){ q=curva.getPoint(i/quanti); pos[i*3]=q.x; pos[i*3+1]=RM.h(q.x,q.z)+2.8; pos[i*3+2]=q.z; }
var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
var tondo=RM.tela(32,32,function(g){ g.fillStyle='#fff'; g.beginPath(); g.arc(16,16,13,0,6.3); g.fill(); g.lineWidth=3; g.strokeStyle='rgba(60,40,10,.9)'; g.stroke(); },false);
var punti=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffc94a,size:7,map:tondo,transparent:true,alphaTest:.3,depthTest:false,sizeAttenuation:false,fog:false,toneMapped:false}));
punti.frustumCulled=false; punti.renderOrder=5; punti.visible=false; RM.scene.add(punti);

/* stazioni: numeri proiettati sullo schermo */
var riquadro=$('scena').parentNode, strato=document.createElement('div'); strato.className='stazioni3d'; strato.hidden=true; riquadro.appendChild(strato);
stazioni.forEach(function(s,k){ s.y=RM.h(s.x,s.z)+3.6; s.el=document.createElement('button'); s.el.type='button'; s.el.textContent=k+1; s.el.title=s.nome; s.el.addEventListener('click',function(){ vai(k); }); strato.appendChild(s.el); });

var attivo=false, ora=-1, v=new THREE.Vector3();
function scrivi(){
  var n=stazioni.length, s=stazioni[ora], h='<button type="button" class="chiudi" aria-label="Chiudi il percorso">✕</button><p class="etichetta">'+esc(IT.fonte)+'</p>';
  if(ora<0) h+='<h3>'+esc(IT.titolo)+'</h3><p class="cosa">'+esc(IT.intro)+'</p>'+(IT.provvisorio?'<p class="stato">Testi delle stazioni provvisori, in attesa di verifica sul manoscritto.</p>':'')+'<div class="passi"><span></span><button type="button" class="dopo">Comincia ›</button></div>';
  else h+='<h3>'+(ora+1)+'. '+esc(s.nome)+'</h3>'+(s.sin?'<p class="lato"><b>A sinistra</b>'+esc(s.sin)+'</p>':'')+(s.des?'<p class="lato"><b>A destra</b>'+esc(s.des)+'</p>':'')+(s.nota?'<p class="cosa">'+esc(s.nota)+'</p>':'')+
    '<div class="passi"><button type="button" class="prima"'+(ora===0?' disabled':'')+'>‹ Indietro</button><span>'+(ora+1)+' di '+n+'</span><button type="button" class="dopo"'+(ora===n-1?' disabled':'')+'>Avanti ›</button></div>';
  carta.innerHTML=h;
  stazioni.forEach(function(t,k){ t.el.classList.toggle('qui',k===ora); });
}
function vai(k){
  ora=Math.max(-1,Math.min(stazioni.length-1,k)); scrivi();
  if(ora>=0) RM.vola(stazioni[ora].x,stazioni[ora].z,44); else if(RM.vistaInsieme) RM.vistaInsieme();
}
function accendi(si){
  attivo=si; punti.visible=si; strato.hidden=!si; carta.hidden=!si; bottone.setAttribute('aria-pressed',si?'true':'false');
  if(si){
    var sch=$('scheda'); if(sch) sch.hidden=true;
    var T=D.TAPPE, k=-1; T.forEach(function(t,j){ if(k<0 && !t.intermezzo && t.anno>=IT.anno) k=j; });       // la città com'era quando la guida fu scritta
    if(k>=0 && window.RM_pagina) window.RM_pagina.vai(k,true);
    var r=riquadro.getBoundingClientRect(); if(r.top<0||r.bottom>window.innerHeight+40) riquadro.scrollIntoView({behavior:'smooth',block:'start'});
    vai(-1);
  } else if(RM.vistaInsieme) RM.vistaInsieme();
}
bottone.addEventListener('click',function(){ accendi(!attivo); });
carta.addEventListener('click',function(ev){ var c=ev.target.className; if(c==='chiudi') accendi(false); else if(c==='dopo') vai(ora+1); else if(c==='prima') vai(ora-1); });
window.addEventListener('keydown',function(ev){ if(attivo && ev.key==='Escape'){ ev.stopImmediatePropagation(); accendi(false); } },true);

RM.frame.push(function(){
  if(!attivo) return;
  var w=riquadro.clientWidth, h=riquadro.clientHeight;
  stazioni.forEach(function(s){
    v.set(s.x,s.y,s.z).applyMatrix4(RM.camera.matrixWorldInverse); var davanti=v.z<-2;
    v.set(s.x,s.y,s.z).project(RM.camera);
    var vis=davanti && Math.abs(v.x)<.97 && Math.abs(v.y)<.95;
    s.el.style.visibility=vis?'visible':'hidden';
    if(vis) s.el.style.transform='translate(-50%,-50%) translate('+((v.x+1)*w/2).toFixed(1)+'px,'+((1-v.y)*h/2).toFixed(1)+'px)';
  });
});
RM.itinerario={accendi:accendi,vai:vai};
})();
