/* Schede d'apertura degli atti. Alla prima tappa di ogni atto, sotto la linea del tempo, compare «l'atto in breve»: un frontespizio (numero dell'atto, titolo, anni),
   tre frasi (ATTI[k].sommario in js/dati.js), una carta piccola con l'interruttore «inizio / fine» (e il bottone che la fa scorrere tappa per tappa),
   i numeri del cruscotto prima e dopo, e le tappe dell'atto come una piccola linea del tempo, da toccare per andarci.
   Niente dati nuovi: carte e numeri sono quelli delle tappe (stati delle regioni, curve di js/dati.js, quota di territorio di js/mappa.js), letti agli anni dell'atto;
   la freccia accanto a ogni numero dice soltanto se il secondo valore è più alto o più basso del primo.
   La scheda si apre da sola alla prima tappa dell'atto e si richiude quando si va avanti; aperta a mano (dal nome dell'atto sulla linea del tempo o da «L'atto in breve»
   accanto al titolo della tappa) resta aperta e segue l'atto, finché non la si chiude. */
(function(){
'use strict';
var D=window.RM_DATI, P=window.RM_pagina, M=window.RM_mappa, osp=document.getElementById('attoScheda'); if(!D||!P||!P.quando||!osp) return;
var T=D.TAPPE, A0=235, A1=852, NA=D.ATTI.length, NS='http://www.w3.org/2000/svg';
var ridotto=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function attoDi(t){ return Math.min(t.atto,NA-1); }
var tappe=D.ATTI.map(function(){ return []; }); T.forEach(function(t,i){ tappe[attoDi(t)].push(i); });
function statiA(anno){ var r=T[0].regioni; T.forEach(function(t){ if(t.anno<=anno) r=t.regioni; }); return r; }      // la carta di un anno: quella dell'ultima tappa non successiva
function crea(tipo,classe,testo,padre){ var e=document.createElement(tipo); if(classe) e.className=classe; if(testo!=null) e.textContent=testo; if(padre) padre.appendChild(e); return e; }
function svg(tipo,attr,padre){ var e=document.createElementNS(NS,tipo); for(var k in attr) e.setAttribute(k,attr[k]); if(padre) padre.appendChild(e); return e; }
var CARDINALI=['','uno','due','tre','quattro','cinque','sei','sette','otto'];

/* ---- ossatura, fatta una volta ---- */
/* il frontespizio: numero romano, titolo, anni */
var testa=crea('header','as-testa',null,osp);
var eRomano=crea('p','as-romano',null,testa); eRomano.setAttribute('aria-hidden','true');
var titoli=crea('div','as-titoli',null,testa), eNum=crea('p','as-num',null,titoli), eNome=crea('h2',null,null,titoli);
var eAnni=crea('p','as-anni',null,testa), eDaA=crea('span','as-da-a',null,eAnni), eDurata=crea('span','as-durata',null,eAnni);
var chiudi=crea('button','chiudi','✕',testa); chiudi.type='button'; chiudi.setAttribute('aria-label','Chiudi la scheda dell\'atto');

var corpo=crea('div','as-corpo',null,osp);
var eSom=crea('p','as-sommario',null,corpo);

/* sui telefoni carta e numeri non stanno insieme in una schermata: un selettore a due voci (come quello delle scene) mostra l'una o gli altri */
var eVista=crea('div','as-vista',null,corpo), bVista=[];
['La carta','I numeri'].forEach(function(q,k){
  var b=crea('button',null,q,eVista); b.type='button'; b.setAttribute('aria-pressed',k?'false':'true');
  b.addEventListener('click',function(){ corpo.setAttribute('data-vista',k?'numeri':'carta'); bVista.forEach(function(x,j){ x.setAttribute('aria-pressed',j===k?'true':'false'); }); });
  bVista.push(b);
});
corpo.setAttribute('data-vista','carta');

/* la carta: una sola, che passa dall'anno d'inizio a quello di fine (o scorre le tappe) ricolorando le regioni */
var carta=null, eTarga=null, eTargaAnno=null, bGioca=null, bScelta=[], eLegenda=null;
if(M && M.miniatura){
  var fig=crea('figure','as-carta',null,corpo), riquadro=crea('div','as-mappa',null,fig);
  carta=M.miniatura(); riquadro.appendChild(carta.svg);
  eTarga=crea('p','as-targa',null,riquadro); eTarga.setAttribute('aria-hidden','true');
  eTargaAnno=crea('b',null,null,eTarga);
  var com=crea('div','as-comandi',null,fig);
  bGioca=crea('button','as-gioca',null,com); bGioca.type='button';
  bGioca.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.6 8z"/></svg><span>Tappa per tappa</span>';
  bGioca.setAttribute('aria-label','Fai scorrere la carta tappa per tappa');
  var scelta=crea('div','as-scelta',null,com); scelta.setAttribute('role','group'); scelta.setAttribute('aria-label','Carta dell\'Impero');
  ['inizio','fine'].forEach(function(q,k){
    var b=crea('button',null,null,scelta); b.type='button'; crea('b',null,null,b); crea('span',null,q,b);
    b.addEventListener('click',function(){ ferma(); scegli(k); });
    bScelta.push(b);
  });
  bGioca.addEventListener('click',function(){ if(timer) ferma(), scegli(1); else gioca(); });
  eLegenda=crea('p','as-legenda',null,fig);
}
var eNumeri=crea('ul','as-numeri',null,corpo);

/* le tappe: una piccola linea del tempo */
var eElenco=crea('nav','as-tappe',null,osp); eElenco.setAttribute('aria-label','Le tappe dell\'atto');
var eScorre=crea('div','as-scorre',null,eElenco), eTappe=crea('ol',null,null,eScorre);

/* ---- la carta: passi (inizio, ogni tappa, fine), interruttore, scorrimento ---- */
var passi=[], scelto=1, timer=0, attesa=0, vista=-1;
function mostraPasso(p){
  if(!carta||!passi[p]) return; vista=p; carta.mostra(passi[p].stati);
  eTargaAnno.textContent=passi[p].anno;
  bScelta.forEach(function(b,k){ b.setAttribute('aria-pressed', (k===0&&p===0)||(k===1&&p===passi.length-1) ? 'true':'false'); });
  bottoniTappe.forEach(function(q){ q[1].classList.toggle('in-carta', passi[p].i===q[0]); });
}
function scegli(k){ scelto=k; mostraPasso(k?passi.length-1:0); }
function ferma(){ clearTimeout(timer); clearTimeout(attesa); timer=attesa=0; osp.classList.remove('gioca'); if(bGioca) bGioca.setAttribute('aria-pressed','false'); }
function gioca(){
  ferma(); if(!passi.length) return; var p=0; osp.classList.add('gioca'); bGioca.setAttribute('aria-pressed','true');
  (function passo(){ mostraPasso(p); if(p>=passi.length-1){ timer=0; scelto=1; osp.classList.remove('gioca'); bGioca.setAttribute('aria-pressed','false'); return; } p++; timer=setTimeout(passo, p===1?650:820); })();
}
function preparaPassi(k){
  var at=D.ATTI[k]; passi=[{anno:at.da, stati:statiA(at.da), i:-1}];
  tappe[k].forEach(function(i){ var t=T[i]; if(t.intermezzo||t.anno<=at.da||t.anno>=at.a) return; passi.push({anno:t.anno, stati:t.regioni||statiA(t.anno), i:i}); });
  passi.push({anno:at.a, stati:statiA(at.a), i:-1});
  /* la tappa che cade proprio nell'anno d'inizio o di fine dà il titolo a quel passo */
  tappe[k].forEach(function(i){ var t=T[i]; if(t.intermezzo) return; if(t.anno===at.da) passi[0].i=i; if(t.anno===at.a) passi[passi.length-1].i=i; });
}

/* ---- i numeri: quelli del cruscotto, all'anno in cui l'atto comincia e a quello in cui finisce ---- */
/* note corte: quelle complete (fonti, forchette, limiti) stanno nel cruscotto, subito sotto */
var NOTE={territorio:'quota di superficie, su questa carta', popolazione:'stime: la forchetta sta nel cruscotto', commerci:'relitti datati, I secolo = 100: contano le navi ritrovate, non le merci'};
var X=function(a){ return (Math.max(A0,Math.min(A1,a))-A0)/(A1-A0)*200; };
function Y(v,max){ return (38-v/max*34).toFixed(1); }
function traccia(punti,max){ return punti.map(function(p,i){ return (i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1],max); }).join(''); }
function tratto(punti,da,a){ var o=[[da,D.interp(punti,da)]]; punti.forEach(function(p){ if(p[0]>da&&p[0]<a) o.push(p); }); o.push([a,D.interp(punti,a)]); return o; }
function numero(s){ var m=String(s).replace(/\./g,'').match(/\d+(?:,\d+)?/); return m?parseFloat(m[0].replace(',','.')):null; }
function scriviNumeri(at){
  eNumeri.textContent='';
  (P.spie||[]).forEach(function(s){
    if(s.id==='argento' && at.da>330) return;                              // dopo Costantino la moneta è il solido e non cambia più: come nel cruscotto, la voce esce
    var li=crea('li','as-n-'+s.id,null,eNumeri), capo=crea('p','as-capo',null,li); crea('span','etichetta',s.nome,capo);
    var v0=s.val(at.da), v1=s.val(at.a), n0=numero(v0), n1=numero(v1);
    var b=crea('b',null,null,li);
    if(v1!==v0){ crea('span','v prima',v0,b); crea('i',null,'→',b).setAttribute('aria-hidden','true'); crea('span','sr',' a ',b); b.appendChild(document.createTextNode(' ')); /* lo spazio lascia andare a capo il secondo valore, se la scheda è stretta */ crea('span','v dopo',v1.replace(/^≈ /,''),b); }
    else crea('span','v dopo',v1,b);
    if(v1!==v0 && n0!=null && n1!=null && n0!==n1){                         // solo il verso: più alto o più basso del primo valore, nessuna cifra nuova
      var su=n1>n0, vs=crea('span','as-verso '+(su?'su':'giu'),su?'▲':'▼',b); vs.title=su?'sale':'scende'; crea('span','sr',su?' (sale)':' (scende)',vs);
    }
    var g=svg('svg',{viewBox:'0 0 200 40',preserveAspectRatio:'none','aria-hidden':'true'});
    var fine=Math.min(at.a,s.fine||A1);
    svg('rect',{x:X(at.da).toFixed(1),y:0,width:Math.max(1,X(at.a)-X(at.da)).toFixed(1),height:40},g);
    svg('path',{'class':'tutta',d:traccia(s.punti,s.max)},g);
    if(fine>at.da){
      var tr=tratto(s.punti,at.da,fine), u=tr[tr.length-1];
      svg('path',{'class':'atto',d:traccia(tr,s.max)},g);
      svg('path',{'class':'punto',d:'M'+X(tr[0][0]).toFixed(1)+' '+Y(tr[0][1],s.max)+'h0'},g);           // un tratto lungo zero con la punta tonda: un punto che non si deforma
      svg('path',{'class':'punto fine',d:'M'+X(u[0]).toFixed(1)+' '+Y(u[1],s.max)+'h0'},g);
    }
    li.appendChild(g);
    crea('small',null,s.id==='argento'?(v1==='oro'?'dal 309-312 il solido d’oro, stabile per secoli':'percentuale d’argento, valori indicativi'):NOTE[s.id]||s.nota||'',li);
  });
}

/* ---- la scheda di un atto ---- */
var aperto=-1, tenuta=false, bottoniTappe=[];
function scrivi(k){
  var at=D.ATTI[k], n=tappe[k].filter(function(i){ return !T[i].intermezzo; }).length;
  eRomano.textContent=at.n;
  eNum.textContent='Atto '+at.n+' di '+CARDINALI[NA];
  eNome.textContent=at.nome; eDaA.textContent=at.da+'–'+at.a; eDurata.textContent=(at.a-at.da)+' anni · '+n+' tappe'; eSom.textContent=at.sommario||'';
  eTappe.textContent=''; eTappe.style.setProperty('--n',tappe[k].length);
  bottoniTappe=tappe[k].map(function(i,j){
    var t=T[i], li=crea('li',t.intermezzo?'intermezzo':null,null,eTappe), b=crea('button',null,null,li); b.type='button';
    li.style.setProperty('--j',j);
    crea('b',null,t.intermezzo?'Intermezzo':String(t.anno),b).setAttribute('aria-hidden','true'); crea('i',null,null,b); crea('span',null,t.titolo,b);
    b.setAttribute('aria-label',(t.intermezzo?'Intermezzo':t.anno)+': '+t.titolo); b.title=(t.intermezzo?'Intermezzo':t.anno)+' · '+t.titolo;
    b.addEventListener('click',function(){ tenuta=true; P.ferma(); P.vai(i); });      // chi sceglie una tappa dalla scheda la tiene aperta
    /* passando sopra una tappa (o arrivandoci con la tastiera) la carta mostra quella tappa; uscendo torna all'interruttore */
    function anteprima(){ if(t.intermezzo||!carta) return; ferma(); var p=-1; passi.forEach(function(q,x){ if(q.i===i) p=x; }); if(p>=0) mostraPasso(p); else { vista=-1; carta.mostra(t.regioni||statiA(t.anno)); eTargaAnno.textContent=t.anno; } }
    function torna(){ if(!timer) scegli(scelto); }
    b.addEventListener('mouseenter',anteprima); b.addEventListener('focus',anteprima);
    b.addEventListener('mouseleave',torna); b.addEventListener('blur',torna);
    return [i,b];
  });
  if(carta){
    preparaPassi(k);
    bScelta[0].firstChild.textContent=at.da; bScelta[1].firstChild.textContent=at.a;
    bGioca.hidden=passi.length<3;                                           // con le sole carte d'inizio e di fine non c'è niente da far scorrere
    eLegenda.textContent=''; M.vociPresenti(passi.map(function(q){ return q.stati; }),at.a).forEach(function(v){ var sp=crea('span',null,null,eLegenda), i=crea('i',null,null,sp); i.style.background=v[0]; sp.appendChild(document.createTextNode(v[1])); });
    eLegenda.classList.toggle('due',eLegenda.children.length>10);
  }
  scriviNumeri(at);
}
function segna(){
  var qui=P.tappa(), j=-1;
  bottoniTappe.forEach(function(q,x){ var si=q[0]===qui; q[1].setAttribute('aria-current',si?'true':'false'); q[1].parentNode.classList.toggle('passata',j<0&&!si); if(si) j=x; });
  if(j<0) bottoniTappe.forEach(function(q){ q[1].parentNode.classList.remove('passata'); });
  eTappe.style.setProperty('--fatto',j<0?0:j);
  /* sui telefoni la fila scorre: la tappa di adesso resta in vista (senza muovere la pagina) */
  if(j>=0 && eScorre.scrollWidth>eScorre.clientWidth){ var li=bottoniTappe[j][1].parentNode; eScorre.scrollLeft=Math.max(0,li.offsetLeft-(eScorre.clientWidth-li.offsetWidth)/2); }
  [].forEach.call(document.querySelectorAll('.as-apri'),function(b){ b.setAttribute('aria-expanded',aperto>=0?'true':'false'); });
}
/* l'entrata: la scheda sale e la carta, se si può, racconta l'atto da sola (dall'inizio alla fine, tappa per tappa) */
function entra(){
  osp.classList.remove('entra'); void osp.offsetWidth; osp.classList.add('entra');
  if(!carta) return; ferma(); scegli(0);
  if(!ridotto) attesa=setTimeout(function(){ attesa=0; if(!osp.hidden) gioca(); },900);
}
function apri(k){ var nuovo=k!==aperto, chiusa=osp.hidden; if(nuovo){ scrivi(k); aperto=k; } osp.hidden=false; segna(); if(nuovo||chiusa) entra(); }
function nascondi(){ ferma(); osp.hidden=true; osp.classList.remove('entra'); }
function chiudiScheda(){ aperto=-1; tenuta=false; nascondi(); segna(); }
function aggiorna(i,t){
  var k=attoDi(t);
  if(i===tappe[k][0] || tenuta) apri(k); else if(aperto>=0) { aperto=-1; nascondi(); }
  segna();
}
P.quando(aggiorna);
chiudi.addEventListener('click',chiudiScheda);
function mostraAVista(){ var r=osp.getBoundingClientRect(); if(r.top<0||r.bottom>window.innerHeight) osp.scrollIntoView({behavior:ridotto?'auto':'smooth',block:r.height>window.innerHeight?'start':'nearest'}); }
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
