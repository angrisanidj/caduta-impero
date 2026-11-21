/* Prima e dopo: la stessa inquadratura a date diverse. Tre punti di vista fissi e un cursore sugli anni.
   Mentre il confronto è acceso il cursore comanda l'anno della scena (cruscotto compreso); alla chiusura si torna alla tappa in corso. */
(function(){
'use strict';
var RM=window.RM, D=window.RM_DATI, PG=window.RM_pagina, $=function(id){ return document.getElementById(id); };
var bottone=$('btnConfronto'), barra=$('confronto');
if(!bottone||!barra) return;
if(!RM||RM.guasto||!PG||!PG.anno||!RM.volaA){ bottone.hidden=true; return; }
var VISTE=[{nome:'Foro', t:[26,8], c:[-42,58,104]}, {nome:'Campo Marzio', t:[-82,-62], c:[-158,66,36]}, {nome:'San Pietro', t:[-214,-106], c:[-128,58,-36]}];   // [bersaglio x,z] e posizione della camera
var T=D.TAPPE, primo=T[0].anno, ultimo=T[T.length-1].anno, attivo=false, vista=0, riquadro=$('scena').parentNode;
barra.innerHTML='<div class="viste">'+VISTE.map(function(v,k){ return '<button type="button" data-k="'+k+'" aria-pressed="false">'+v.nome+'</button>'; }).join('')+
  '<button type="button" class="chiudi" aria-label="Chiudi il confronto">✕</button></div>'+
  '<label class="cursore"><span>'+primo+'</span><input type="range" id="confrontoAnno" min="'+primo+'" max="'+ultimo+'" step="1" aria-label="Anno"><span>'+ultimo+'</span><output id="confrontoOra"></output></label>';
var cursore=$('confrontoAnno'), ora=$('confrontoOra'), tasti=[].slice.call(barra.querySelectorAll('.viste button[data-k]'));
function guarda(k){ vista=k; RM.volaA(VISTE[k].t,VISTE[k].c); tasti.forEach(function(b,j){ b.setAttribute('aria-pressed',j===k?'true':'false'); }); }
function accendi(si){
  attivo=si; barra.hidden=!si; bottone.setAttribute('aria-pressed',si?'true':'false'); riquadro.classList.toggle('confronto-attivo',si);
  if(si){
    PG.ferma();
    var pel=$('btnPellegrino'); if(pel&&pel.getAttribute('aria-pressed')==='true') pel.click();
    var sch=$('scheda'); if(sch) sch.hidden=true;
    cursore.value=Math.round(PG.annoOra()); ora.textContent=cursore.value; guarda(vista);
  } else { PG.vai(PG.tappa(),true); if(RM.vistaInsieme) RM.vistaInsieme(); }
}
bottone.addEventListener('click',function(){ accendi(!attivo); });
barra.addEventListener('click',function(ev){ var b=ev.target; if(b.className==='chiudi') accendi(false); else if(b.getAttribute&&b.getAttribute('data-k')!=null) guarda(+b.getAttribute('data-k')); });
cursore.addEventListener('input',function(){ PG.ferma(); PG.anno(+cursore.value); ora.textContent=cursore.value; });
window.addEventListener('keydown',function(ev){ if(attivo && ev.key==='Escape'){ ev.stopImmediatePropagation(); accendi(false); } },true);
/* se intanto si cambia tappa dalla linea del tempo, il cursore la segue */
RM.frame.push(function(){ if(!attivo||document.activeElement===cursore) return; var a=Math.round(PG.annoOra()); if(+cursore.value!==a){ cursore.value=a; ora.textContent=a; } });
})();
