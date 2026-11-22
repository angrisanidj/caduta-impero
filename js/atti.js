/* Schede d'apertura degli atti. Alla prima tappa di ogni atto, sotto la linea del tempo, compare «l'atto in breve»: tre frasi (ATTI[k].sommario in js/dati.js),
   due carte a confronto (com'è l'Impero quando l'atto comincia e quando finisce), i numeri del cruscotto prima e dopo, e le tappe dell'atto, da toccare per andarci.
   Niente dati nuovi: carte e numeri sono quelli delle tappe (stati delle regioni, curve di js/dati.js, quota di territorio di js/mappa.js), letti ai due anni dell'atto.
   La scheda si apre da sola alla prima tappa dell'atto e si richiude quando si va avanti; aperta a mano (dal nome dell'atto sulla linea del tempo o da «L'atto in breve»
   accanto al titolo della tappa) resta aperta e segue l'atto, finché non la si chiude. */
(function(){
'use strict';
var D=window.RM_DATI, P=window.RM_pagina, M=window.RM_mappa, osp=document.getElementById('attoScheda'); if(!D||!P||!P.quando||!osp) return;
var T=D.TAPPE, A0=235, A1=852, NA=D.ATTI.length, NS='http://www.w3.org/2000/svg';
function attoDi(t){ return Math.min(t.atto,NA-1); }
var tappe=D.ATTI.map(function(){ return []; }); T.forEach(function(t,i){ tappe[attoDi(t)].push(i); });
function statiA(anno){ var r=T[0].regioni; T.forEach(function(t){ if(t.anno<=anno) r=t.regioni; }); return r; }      // la carta di un anno: quella dell'ultima tappa non successiva
function crea(tipo,classe,testo,padre){ var e=document.createElement(tipo); if(classe) e.className=classe; if(testo!=null) e.textContent=testo; if(padre) padre.appendChild(e); return e; }

/* ---- ossatura, fatta una volta ---- */
var chiudi=crea('button','chiudi','✕',osp); chiudi.type='button'; chiudi.setAttribute('aria-label','Chiudi la scheda dell\'atto');
var testa=crea('div','as-testa',null,osp), eNum=crea('p','as-num etichetta',null,testa), eNome=crea('h2',null,null,testa), eAnni=crea('p','as-anni',null,testa), eSom=crea('p','as-sommario',null,testa);
var carte=crea('div','as-carte',null,osp), mini=[], eAnnoCarta=[];
if(M && M.miniatura){
  ['all’inizio','alla fine'].forEach(function(quando,k){
    var f=crea('figure','as-carta',null,carte), m=M.miniatura(); f.appendChild(m.svg); mini.push(m);
    var c=crea('figcaption',null,null,f); eAnnoCarta.push(crea('b',null,null,c)); c.appendChild(document.createTextNode(' '+quando));
    if(!k) crea('span','as-freccia','→',carte).setAttribute('aria-hidden','true');
  });
}
var eLegenda=crea('p','as-legenda',null,carte);
var eNumeri=crea('ul','as-numeri',null,osp);
var eElenco=crea('div','as-tappe',null,osp); crea('p','etichetta','Le tappe',eElenco); var eTappe=crea('ol',null,null,eElenco);

/* ---- i numeri: quelli del cruscotto, all'anno in cui l'atto comincia e a quello in cui finisce ---- */
/* note corte: quelle complete (fonti, forchette, limiti) stanno nel cruscotto, subito sotto */
var NOTE={territorio:'quota di superficie, su questa carta', popolazione:'stime: la forchetta sta nel cruscotto', commerci:'relitti datati, I secolo = 100: contano le navi ritrovate, non le merci'};
var X=function(a){ return (Math.max(A0,Math.min(A1,a))-A0)/(A1-A0)*200; };
function traccia(punti,max){ return punti.map(function(p,i){ return (i?'L':'M')+X(p[0]).toFixed(1)+' '+(38-p[1]/max*34).toFixed(1); }).join(''); }
function tratto(punti,da,a){ var o=[[da,D.interp(punti,da)]]; punti.forEach(function(p){ if(p[0]>da&&p[0]<a) o.push(p); }); o.push([a,D.interp(punti,a)]); return o; }
function scriviNumeri(at){
  eNumeri.textContent='';
  (P.spie||[]).forEach(function(s){
    if(s.id==='argento' && at.da>330) return;                              // dopo Costantino la moneta è il solido e non cambia più: come nel cruscotto, la voce esce
    var li=crea('li',null,null,eNumeri); crea('span','etichetta',s.nome,li);
    var b=crea('b',null,null,li), v0=s.val(at.da), v1=s.val(at.a);
    crea('span','v',v0,b); if(v1!==v0){ crea('i',null,'→',b).setAttribute('aria-hidden','true'); crea('span','sr',' a ',b); crea('span','v',v1.replace(/^≈ /,''),b); }
    var g=document.createElementNS(NS,'svg'); g.setAttribute('viewBox','0 0 200 40'); g.setAttribute('preserveAspectRatio','none'); g.setAttribute('aria-hidden','true');
    var fine=Math.min(at.a,s.fine||A1), r=document.createElementNS(NS,'rect'); r.setAttribute('x',X(at.da).toFixed(1)); r.setAttribute('y',0); r.setAttribute('width',Math.max(1,X(at.a)-X(at.da)).toFixed(1)); r.setAttribute('height',40); g.appendChild(r);
    var p0=document.createElementNS(NS,'path'); p0.setAttribute('class','tutta'); p0.setAttribute('d',traccia(s.punti,s.max)); g.appendChild(p0);
    if(fine>at.da){ var p1=document.createElementNS(NS,'path'); p1.setAttribute('class','atto'); p1.setAttribute('d',traccia(tratto(s.punti,at.da,fine),s.max)); g.appendChild(p1); }
    li.appendChild(g);
    crea('small',null,s.id==='argento'?(v1==='oro'?'dal 309-312 il solido d’oro, stabile per secoli':'percentuale d’argento, valori indicativi'):NOTE[s.id]||s.nota||'',li);
  });
}

/* ---- la scheda di un atto ---- */
var aperto=-1, tenuta=false, bottoniTappe=[];
function scrivi(k){
  var at=D.ATTI[k], n=tappe[k].filter(function(i){ return !T[i].intermezzo; }).length;
  eNum.textContent='Atto '+at.n+' di '+['','uno','due','tre','quattro','cinque','sei','sette','otto'][NA];
  eNome.textContent=at.nome; eAnni.textContent=at.da+'–'+at.a+' · '+(at.a-at.da)+' anni · '+n+' tappe'; eSom.textContent=at.sommario||'';
  if(mini.length){
    var s0=statiA(at.da), s1=statiA(at.a); mini[0].mostra(s0); mini[1].mostra(s1); eAnnoCarta[0].textContent=at.da; eAnnoCarta[1].textContent=at.a;
    eLegenda.textContent=''; M.vociPresenti([s0,s1],at.a).forEach(function(v){ var sp=crea('span',null,null,eLegenda), i=crea('i',null,null,sp); i.style.background=v[0]; sp.appendChild(document.createTextNode(v[1])); });
  }
  scriviNumeri(at);
  eTappe.textContent=''; bottoniTappe=tappe[k].map(function(i){
    var t=T[i], b=crea('button',null,null,crea('li',null,null,eTappe)); b.type='button'; crea('b',null,t.intermezzo?'Intermezzo':String(t.anno),b); b.appendChild(document.createTextNode(' '+t.titolo));
    b.addEventListener('click',function(){ tenuta=true; P.ferma(); P.vai(i); });      // chi sceglie una tappa dalla scheda la tiene aperta
    return [i,b];
  });
}
function segna(){ var qui=P.tappa(); bottoniTappe.forEach(function(q){ q[1].setAttribute('aria-current',q[0]===qui?'true':'false'); });
  [].forEach.call(document.querySelectorAll('.as-apri'),function(b){ b.setAttribute('aria-expanded',aperto>=0?'true':'false'); }); }
function apri(k){ if(k!==aperto){ scrivi(k); aperto=k; } osp.hidden=false; segna(); }
function chiudiScheda(){ aperto=-1; tenuta=false; osp.hidden=true; segna(); }
function aggiorna(i,t){
  var k=attoDi(t);
  if(i===tappe[k][0] || tenuta) apri(k); else if(aperto>=0) { aperto=-1; osp.hidden=true; }
  segna();
}
P.quando(aggiorna);
chiudi.addEventListener('click',chiudiScheda);
function mostraAVista(){ var r=osp.getBoundingClientRect(); if(r.top<0||r.bottom>window.innerHeight) osp.scrollIntoView({behavior:'smooth',block:r.height>window.innerHeight?'start':'nearest'}); }
/* «L'atto in breve», accanto al titolo della tappa (il bottone lo riscrive js/pagina.js a ogni tappa) */
document.addEventListener('click',function(e){
  var b=e.target.closest && e.target.closest('.as-apri'); if(!b) return;
  if(aperto>=0){ chiudiScheda(); return; }
  tenuta=true; apri(attoDi(T[P.tappa()])); mostraAVista();
});
/* il nome dell'atto sulla linea del tempo porta alla sua prima tappa e apre la scheda */
[].forEach.call(document.querySelectorAll('#linea .atto-gruppo'),function(g,k){
  var p=g.querySelector('p'); if(!p||!tappe[k]) return;
  p.setAttribute('role','button'); p.tabIndex=0; p.title='Atto '+D.ATTI[k].n+': '+D.ATTI[k].nome+', in breve'; p.classList.add('as-nome');
  function vai(){ P.ferma(); tenuta=true; if(P.tappa()===tappe[k][0]) apri(k); else P.vai(tappe[k][0]); mostraAVista(); }
  p.addEventListener('click',vai); p.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); vai(); } });
});
aggiorna(P.tappa(),T[P.tappa()]);
window.RM_atti={apri:function(k){ tenuta=true; apri(k); }, chiudi:chiudiScheda};
})();
