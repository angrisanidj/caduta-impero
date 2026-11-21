/* Regia della pagina: tappe, anno che scorre, cruscotto, linea del tempo, schede, giorno e notte.
   Funziona anche senza il 3D: la scena di Roma è solo uno dei destinatari dell'anno corrente. */
(function(){
'use strict';
var D=window.RM_DATI, RM=window.RM||{moduli:[]}, MAPPA=window.RM_mappa;
var T=D.TAPPE, A0=235, A1=852;
var $=function(id){ return document.getElementById(id); };
var nf=new Intl.NumberFormat('it-IT');
var idx=0, anno=T[0].anno, meta=anno, vel=0, notte=0, metaNotte=0, coda=null;

/* ---------- cruscotto ---------- */
var territorio=T.map(function(t){ return [t.anno, MAPPA?MAPPA.territorio(t.regioni):100]; });
var territorioEst=T.map(function(t){ return [t.anno, MAPPA&&MAPPA.territorioEst?MAPPA.territorioEst(t.regioni):100]; });
function aGradini(p){ var o=[]; p.forEach(function(q,i){ if(i) o.push([q[0],p[i-1][1]]); o.push(q); }); o.push([A1,p[p.length-1][1]]); return o; }
function arrotonda(n){ var p=n>=200000?10000:n>=20000?5000:1000; return Math.round(n/p)*p; }
var SPIE=[
 {id:'territorio', nome:'Occidente governato da Roma', nota:'quota di superficie, per regioni; tratteggio: i territori di Costantinopoli (395 = 100)', stima:true, punti:aGradini(territorio), altra:aGradini(territorioEst), max:125,
  val:function(a){ var k=0; for(var i=0;i<territorio.length;i++) if(territorio[i][0]<=a+.001) k=i; return Math.round(territorio[k][1])+'%'; }},
 {id:'argento', nome:D.CURVE.argento.nome, punti:D.CURVE.argento.punti, max:50, fine:D.CURVE.argento.fine,
  val:function(a){ return a<=D.CURVE.argento.fine ? Math.round(D.interp(this.punti,a))+'%' : 'oro'; },
  notaA:function(a){ return a<=D.CURVE.argento.fine ? D.CURVE.argento.nota : D.CURVE.argento.dopo; }},
 {id:'popolazione', nome:D.CURVE.popolazione.nome, stima:true, punti:D.CURVE.popolazione.punti, banda:D.CURVE.popolazione.banda, max:1200000,
  val:function(a){ return '≈ '+nf.format(arrotonda(D.interp(this.punti,a))); },
  notaA:function(a){ return forchetta(a); }},
 {id:'commerci', nome:D.CURVE.commerci.nome, nota:D.CURVE.commerci.nota, stima:true, punti:D.CURVE.commerci.punti, max:100,
  val:function(a){ return String(Math.round(D.interp(this.punti,a))); }}
];
/* forchetta delle stime pubblicate per l'anno dato */
function forchetta(a){
  var b=D.CURVE.popolazione.banda; if(!b) return 'stima';
  var lo=D.interp(b.map(function(p){ return [p[0],p[1]]; }),a), hi=D.interp(b.map(function(p){ return [p[0],p[2]]; }),a);
  return 'stime da '+nf.format(arrotonda(lo))+' a '+nf.format(arrotonda(hi));
}
var X=function(a){ return (Math.max(A0,Math.min(A1,a))-A0)/(A1-A0)*200; };
SPIE.forEach(function(s){
  var d=s.punti.map(function(p,i){ return (i?'L':'M')+X(p[0]).toFixed(1)+' '+(38-p[1]/s.max*34).toFixed(1); }).join('');
  var box=document.createElement('div'); box.className='spia'+(s.stima?' stima':'');
  box.innerHTML='<p class="etichetta">'+s.nome+'</p><b></b><small></small>'+
    '<svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">'+(s.banda?'<path class="banda" d="'+
      s.banda.map(function(p,i){ return (i?'L':'M')+X(p[0]).toFixed(1)+' '+(38-p[2]/s.max*34).toFixed(1); }).join('')+
      s.banda.slice().reverse().map(function(p){ return 'L'+X(p[0]).toFixed(1)+' '+(38-p[1]/s.max*34).toFixed(1); }).join('')+'Z"/>':'')+
    (s.altra?'<path class="altra" d="'+s.altra.map(function(p,i){ return (i?'L':'M')+X(p[0]).toFixed(1)+' '+(38-p[1]/s.max*34).toFixed(1); }).join('')+'"/>':'')+
    '<path d="'+d+'"/><line y1="0" y2="40"/></svg>';
  $('cruscotto').appendChild(box);
  s.b=box.querySelector('b'); s.small=box.querySelector('small'); s.linea=box.querySelector('line');
});
function scriviSpie(){
  SPIE.forEach(function(s){
    var v=s.val(anno); if(s.b.textContent!==v) s.b.textContent=v;
    var n=s.notaA?s.notaA(anno):s.nota; if(s.small.textContent!==n) s.small.textContent=n;
    var x=X(anno).toFixed(1); s.linea.setAttribute('x1',x); s.linea.setAttribute('x2',x);
  });
  var pop='≈ '+nf.format(arrotonda(D.interp(D.CURVE.popolazione.punti,anno)));
  if($('abitanti').textContent!==pop) $('abitanti').textContent=pop;
  var fo=forchetta(anno); if($('abitantiNota') && $('abitantiNota').textContent!==fo) $('abitantiNota').textContent=fo;
}

/* ---------- monumenti ---------- */
var NOMI_CERTEZZA={A:'posizione e forma certe',B:'posizione certa, forma ricostruita',C:'ipotesi'};
var NOMI_STATO={uso:'in uso',chiuso:'in disuso',spogliato:'spogliato',bruciato:'bruciato',crollato:'danneggiato da un terremoto',cava:'usato come cava',assente:'non ancora costruito'};
function nomeStato(m,st){ var s=(D.MONUMENTI||{})[m.id]; return st==='assente'&&s&&s[0][1]!=='assente'?'scomparso':NOMI_STATO[st]; }      // «assente» dopo essere esistito vuol dire sparito, non «non ancora costruito»
var voci=(RM.MONUMENTI||[]).map(function(m){
  var li=document.createElement('li'), s=document.createElement('span'); li.appendChild(s); $('elencoMonumenti').appendChild(li); return {m:m,li:li,s:s,st:''};
});
if(!voci.length) document.querySelector('.stato-roma').hidden=true;
/* scheda di un monumento: che cos'è, in che stato è nell'anno corrente, le date che contano */
var schedaDi=null, schedaChiave='';
function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function scriviScheda(){
  if(!schedaDi) return;
  var m=schedaDi, q=RM.statoMonumento(m.id,anno), st=q.t>.5?q.s1:q.s0, sc=(D.SCHEDE||{})[m.id]||{}, ce=(D.CERTEZZA||{}).provvisorio?null:(D.CERTEZZA||{})[m.id], chiave=m.id+st+Math.round(anno);
  if(chiave===schedaChiave) return; schedaChiave=chiave;
  var righe=(sc.date||[]).map(function(r){ var futura=typeof r[0]==='number'&&r[0]>anno+.5; return '<li'+(futura?' class="futura"':'')+'><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></li>'; }).join('');
  $('scheda').innerHTML='<button type="button" class="chiudi" aria-label="Chiudi la scheda">✕</button><h3>'+esc(m.nome)+'</h3>'+
    '<p class="stato"><span class="st '+st+'">'+nomeStato(m,st)+'</span> nel '+Math.round(anno)+'</p>'+(sc.cosa?'<p class="cosa">'+esc(sc.cosa)+'</p>':'')+(ce?'<p class="certezza"><i class="c'+ce[0]+'"></i><span><b>Che cosa sappiamo:</b> '+NOMI_CERTEZZA[ce[0]]+(ce[1]?'. '+esc(ce[1]):'')+'</span></p>':'')+(righe?'<ul>'+righe+'</ul>':'');
}
/* la scena si sposta di metà di quanto è coperta: dal foglio in basso (telefono), dal riquadro a sinistra (schermi larghi), dalla linea del tempo (schermo intero) */
function scostaScena(){
  if(!RM.sposta) return;
  var rq=document.querySelector('.riquadro.roma').getBoundingClientRect(), sc=$('scheda'), su=0, dx=0;
  if(document.body.classList.contains('roma-grande')){ var tp=document.querySelector('.tempo'); if(tp) su=Math.max(0,rq.bottom-tp.getBoundingClientRect().top); }
  if(schedaDi && !sc.hidden){
    var r=sc.getBoundingClientRect();
    if(r.width>rq.width*.7) su=Math.max(su,Math.min(rq.height*.8,rq.bottom-r.top));
    else if(r.right>rq.left && r.left<rq.right && r.left-rq.left<rq.width*.4) dx=Math.min(rq.width*.6,r.right-rq.left);
  }
  RM.sposta(dx/2,Math.max(0,su)/2);
}
function apriScheda(m){
  schedaDi=m; schedaChiave=''; scriviScheda(); $('scheda').hidden=false; document.querySelector('.riquadro.roma').classList.add('con-scheda');
  voci.forEach(function(v){ v.li.classList.toggle('scelto',v.m===m); });
  if($('scene').getAttribute('data-vista')!=='roma'){ var b=document.querySelector('.schede button[data-vista="roma"]'); if(b) b.click(); }
  var r=document.querySelector('.riquadro.roma').getBoundingClientRect(); if(r.top<0||r.bottom>window.innerHeight+40) document.querySelector('.riquadro.roma').scrollIntoView({behavior:'smooth',block:'start'});
  if(RM.vola&&m.x!=null) RM.vola(m.x,m.z,Math.max(46,(m.raggio||6)*6));
  scostaScena();
}
function chiudiScheda(){ if(!schedaDi) return; schedaDi=null; $('scheda').hidden=true; document.querySelector('.riquadro.roma').classList.remove('con-scheda'); scostaScena(); voci.forEach(function(v){ v.li.classList.remove('scelto'); }); if(RM.vistaInsieme) RM.vistaInsieme(); }
$('scheda').addEventListener('click',function(ev){ if(ev.target.className==='chiudi') chiudiScheda(); });
voci.forEach(function(v){
  v.li.tabIndex=0; v.li.setAttribute('role','button');
  v.li.addEventListener('click',function(){ apriScheda(v.m); });
  v.li.addEventListener('keydown',function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); apriScheda(v.m); } });
});
RM.apriScheda=function(id){ voci.forEach(function(v){ if(v.m.id===id) apriScheda(v.m); }); };
function scriviMonumenti(){
  voci.forEach(function(v){
    var q=RM.statoMonumento(v.m.id,anno), st=q.t>.5?q.s1:q.s0; if(st===v.st) return;
    v.st=st; v.li.className=st+(v.m===schedaDi?' scelto':''); v.li.title=nomeStato(v.m,st);
    v.s.textContent=v.m.nome+(v.m.note&&v.m.note[st]?' · '+v.m.note[st]:'');
  });
}

/* ---------- linea del tempo ---------- */
var bottoni=[], gruppi=D.ATTI.map(function(a){
  var g=document.createElement('div'), p=document.createElement('p'), riga=document.createElement('div');
  g.className='atto-gruppo'; p.textContent=a.n+' · '+a.nome; g.appendChild(p); g.appendChild(riga); $('linea').appendChild(g); return {g:g,riga:riga,n:0};
});
T.forEach(function(t,i){
  var b=document.createElement('button'); b.type='button'; if(t.intermezzo) b.className='intermezzo';
  b.title=(t.intermezzo?'Intermezzo: ':t.anno+' · ')+t.titolo; b.setAttribute('aria-label',b.title);
  b.addEventListener('click',function(){ ferma(); vai(i); });
  var g=gruppi[Math.min(t.atto,gruppi.length-1)]; g.riga.appendChild(b); g.n++; bottoni.push(b);
});
gruppi.forEach(function(g){ g.g.style.setProperty('--n',g.n); });

/* ---------- tappa ---------- */
function vai(i,subito){
  idx=Math.max(0,Math.min(T.length-1,i));
  var t=T[idx], a=D.ATTI[Math.min(t.atto,D.ATTI.length-1)];
  meta=t.anno; vel=Math.max(8,Math.abs(meta-anno))/1.7; if(subito) anno=meta;
  $('tAtto').innerHTML=(t.intermezzo?'':'<b>'+t.anno+'</b>')+(t.intermezzo?'Intermezzo':t.epilogo?'Epilogo':'Atto '+a.n+' · '+a.nome);
  $('tTitolo').textContent=t.titolo; $('tTesto').textContent=t.testo;
  $('tStorici').hidden=!t.storici; $('tStoriciTesto').textContent=t.storici||'';
  $('tLeggenda').hidden=!t.leggenda; $('tLeggendaTesto').textContent=t.leggenda||'';      // dove una leggenda nasce da questa tappa: che cosa dicono le fonti e che cosa viene dopo
  var chi=t.protagonisti||[], bc=$('tChiElenco'); $('tChi').hidden=!chi.length; bc.textContent='';      // chi c'è in questa tappa: [nome, date, una riga]
  chi.forEach(function(p){ var li=document.createElement('li'), b=document.createElement('b'); b.textContent=p[0]; li.appendChild(b); if(p[1]){ var d=document.createElement('span'); d.className='date'; d.textContent=p[1]; li.appendChild(d); } li.appendChild(document.createTextNode(p[2])); bc.appendChild(li); });
  var voci=t.voci||[], bv=$('tVoci'); $('tVoce').hidden=!voci.length; bv.textContent=''; $('tVoceTitolo').textContent=voci.length>1?'Voci di allora':'Una voce di allora';      // parole dei contemporanei, tradotte dalla fonte
  voci.forEach(function(v){ var q=document.createElement('blockquote'), c=document.createElement('p'); q.textContent=v.testo; c.className='chi'; c.textContent=v.chi; bv.appendChild(q); bv.appendChild(c); });
  if(MAPPA) MAPPA.mostra(t.regioni,t.anno);
  bottoni.forEach(function(b,k){ b.setAttribute('aria-current',k===idx?'true':'false'); b.classList.toggle('passata',k<idx); });
  gruppi.forEach(function(g,k){ g.g.classList.toggle('attivo',k===Math.min(t.atto,gruppi.length-1)); });
  $('btnPrima').disabled=idx===0; $('btnDopo').disabled=idx===T.length-1;
  try{ history.replaceState(null,'','#tappa-'+(idx+1)); }catch(e){}
  if(subito) applica();
}
function applica(){
  for(var i=0;i<RM.moduli.length;i++) RM.moduli[i](anno);
  scriviSpie(); if(voci.length){ scriviMonumenti(); scriviScheda(); }
}

/* ---------- comandi ---------- */
function ferma(){ if(coda){ clearInterval(coda); coda=null; } $('btnPlay').textContent='▶ Riproduci'; }
$('btnPlay').addEventListener('click',function(){
  if(coda){ ferma(); return; }
  if(idx===T.length-1) vai(0);
  $('btnPlay').textContent='■ Ferma';
  coda=setInterval(function(){ if(idx>=T.length-1){ ferma(); return; } vai(idx+1); },6500);
});
$('btnPrima').addEventListener('click',function(){ ferma(); vai(idx-1); });
$('btnDopo').addEventListener('click',function(){ ferma(); vai(idx+1); });
window.addEventListener('keydown',function(ev){
  if(ev.altKey||ev.ctrlKey||ev.metaKey) return;
  if(ev.key==='ArrowRight'){ ferma(); vai(idx+1); } else if(ev.key==='ArrowLeft'){ ferma(); vai(idx-1); }
});
/* «Che cosa sappiamo davvero»: la scena prende i colori della certezza e compare la legenda */
var sapere=0, metaSapere=0;
if(!D.CERTEZZA || D.CERTEZZA.provvisorio) $('btnSapere').hidden=true;
$('btnSapere').addEventListener('click',function(){
  metaSapere=metaSapere?0:1; this.setAttribute('aria-pressed',metaSapere?'true':'false'); $('legendaSapere').hidden=!metaSapere;
});
$('btnNotte').addEventListener('click',function(){
  metaNotte=metaNotte?0:1; this.setAttribute('aria-pressed',metaNotte?'true':'false'); this.textContent=metaNotte?'Giorno':'Notte';
});
/* Dispositivi al tocco: fuori dallo schermo intero la scena non risponde al dito, così la pagina scorre; un tocco la apre a tutto schermo, dove si esplora. */
var tocco=!!(window.matchMedia && window.matchMedia('(hover:none) and (pointer:coarse)').matches);
if(tocco){ document.body.classList.add('tocco'); if(RM.controlli) RM.controlli.enabled=false; }
RM.toccoApre=function(){ if(tocco && !document.body.classList.contains('roma-grande')){ grande(true); return true; } return false; };
function grande(si){
  document.body.classList.toggle('roma-grande',si); $('btnGrande').setAttribute('aria-pressed',si?'true':'false'); $('btnGrande').textContent=si?'✕':'⤢';
  $('btnGrande').setAttribute('aria-label',si?'Chiudi lo schermo intero':'Scena a tutto schermo'); $('btnGrande').title=si?'Chiudi':'Tutto schermo';
  if(si){ var tp=document.querySelector('.tempo'); document.body.style.setProperty('--tempo',(tp?tp.offsetHeight:92)+'px'); }      // i comandi stanno sopra la linea del tempo, quanto è alta
  if(tocco && RM.controlli) RM.controlli.enabled=si;
  if(tocco && !si && !schedaDi && RM.vistaInsieme) RM.vistaInsieme();      // sul telefono, chiuso lo schermo intero, la scena non si può più muovere: torna alla vista d'insieme invece di restare ingrandita
  chiudiStrumenti();
  window.dispatchEvent(new Event('resize'));
  setTimeout(scostaScena,0);
}
/* menu degli strumenti: chiuso di norma, perché non copra la scena; dopo una scelta si richiude */
function compatto(){ return window.getComputedStyle($('btnStrumenti')).display!=='none'; }
function chiudiStrumenti(){ $('strumenti').classList.remove('aperto'); $('btnStrumenti').setAttribute('aria-expanded','false'); }
function segnaStrumenti(){ var n=$('vociStrumenti').querySelectorAll('[aria-pressed="true"]').length; $('btnStrumenti').classList.toggle('attivo',n>0); $('btnStrumenti').textContent=n?'Strumenti · '+n:'Strumenti'; }
$('btnStrumenti').addEventListener('click',function(){ var a=!$('strumenti').classList.contains('aperto'); $('strumenti').classList.toggle('aperto',a); this.setAttribute('aria-expanded',a?'true':'false'); });
$('vociStrumenti').addEventListener('click',function(){ setTimeout(function(){ segnaStrumenti(); if(compatto()) chiudiStrumenti(); },0); });
$('btnPiu').addEventListener('click',function(){ if(RM.zoom) RM.zoom(.62); });
$('btnMeno').addEventListener('click',function(){ if(RM.zoom) RM.zoom(1.6); });
$('btnInsieme').addEventListener('click',function(){ if(schedaDi) chiudiScheda(); else if(RM.vistaInsieme) RM.vistaInsieme(); });
$('btnEsplora').addEventListener('click',function(){ grande(true); });
window.addEventListener('resize',function(){ if(document.body.classList.contains('roma-grande')){ var tp=document.querySelector('.tempo'); if(tp) document.body.style.setProperty('--tempo',tp.offsetHeight+'px'); } setTimeout(scostaScena,0); });
$('btnGrande').addEventListener('click',function(){ grande(!document.body.classList.contains('roma-grande')); });
window.addEventListener('keydown',function(ev){ if(ev.key==='Escape'){ if(schedaDi) chiudiScheda(); else grande(false); } });
[].forEach.call(document.querySelectorAll('.schede button'),function(b){
  b.addEventListener('click',function(){
    $('scene').setAttribute('data-vista',b.getAttribute('data-vista'));
    window.dispatchEvent(new Event('resize'));          // il riquadro appena mostrato va rimisurato, anche dove manca ResizeObserver
    [].forEach.call(document.querySelectorAll('.schede button'),function(o){ o.setAttribute('aria-selected',o===b?'true':'false'); });
  });
});

/* ---------- ciclo ---------- */
var ultimo=performance.now(), contaGiri=0;
(function ciclo(ora){
  requestAnimationFrame(ciclo);
  var dt=Math.min(((ora||performance.now())-ultimo)/1000,.25), mosso=false; ultimo=ora||performance.now();
  if(anno!==meta){ var p=vel*dt; anno=Math.abs(meta-anno)<=p?meta:anno+Math.sign(meta-anno)*p; mosso=true; }
  if(notte!==metaNotte){ var pn=dt/1.6; notte=Math.abs(metaNotte-notte)<=pn?metaNotte:notte+Math.sign(metaNotte-notte)*pn; if(RM.applicaLuce) RM.applicaLuce(notte); mosso=true; }
  if(sapere!==metaSapere && RM.sapere){ var ps=dt/.5; sapere=Math.abs(metaSapere-sapere)<=ps?metaSapere:sapere+Math.sign(metaSapere-sapere)*ps; RM.sapere.q.value=sapere*sapere*(3-2*sapere); }
  if(RM.inVistaInsieme && (contaGiri=(contaGiri+1)%12)===0){ var via=!RM.inVistaInsieme(); if($('btnInsieme').hidden===via) $('btnInsieme').hidden=!via; }      // il pulsante per tornare alla vista d'insieme c'è solo quando serve
  if(mosso) applica();
})();

/* ---------- avvio ---------- */
var m=/^#tappa-(\d+)$/.exec(location.hash);
if(m){ vai(parseInt(m[1],10)-1,true); }
else{                                   // apertura dalla fine: la città del 550, poi il riavvolgimento
  anno=550; vai(0); vel=(550-T[0].anno)/4.5; applica();
}
window.RM_pagina={vai:vai, ferma:ferma, tappa:function(){ return idx; }, annoOra:function(){ return anno; }, anno:function(y){ anno=meta=y; applica(); }};      // anno(y): porta la scena a un anno qualsiasi senza cambiare tappa (js/confronto.js)
})();
