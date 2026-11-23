/* Regia della pagina: tappe, anno che scorre, cruscotto, linea del tempo, schede, giorno e notte.
   Funziona anche senza il 3D: la scena di Roma è solo uno dei destinatari dell'anno corrente. */
(function(){
'use strict';
var D=window.RM_DATI, RM=window.RM||{moduli:[]}, MAPPA=window.RM_mappa;
var T=D.TAPPE, A0=235, A1=852;
var $=function(id){ return document.getElementById(id); };
var nf=new Intl.NumberFormat('it-IT');
var idx=0, anno=T[0].anno, meta=anno, vel=0, notte=0, metaNotte=0, coda=null, ascolto=[];      // ascolto: chi vuole sapere quando cambia la tappa (js/atti.js)

/* ---------- cruscotto ---------- */
var territorio=T.map(function(t){ return [t.anno, MAPPA?MAPPA.territorio(t.regioni,t.anno):100]; });
var territorioEst=T.map(function(t){ return [t.anno, MAPPA&&MAPPA.territorioEst?MAPPA.territorioEst(t.regioni):100]; });
function aGradini(p){ var o=[]; p.forEach(function(q,i){ if(i) o.push([q[0],p[i-1][1]]); o.push(q); }); o.push([A1,p[p.length-1][1]]); return o; }
function arrotonda(n){ var p=n>=200000?10000:n>=20000?5000:1000; return Math.round(n/p)*p; }
var SPIE=[
 {id:'territorio', nome:'Occidente governato da Roma', stima:true, punti:aGradini(territorio), altra:aGradini(territorioEst), max:125,
  quota:function(a){ var k=0; for(var i=0;i<territorio.length;i++) if(territorio[i][0]<=a+.001) k=i; return territorio[k][1]; },
  val:function(a){ return Math.round(this.quota(a))+'%'; },
  /* la quota tradotta in chilometri quadrati, misurati su questa carta (js/mappa.js, kmqOvest): un ordine di grandezza, non un dato pubblicato */
  notaA:function(a){ var q=MAPPA&&MAPPA.kmqOvest?this.quota(a)/100*MAPPA.kmqOvest():0, s=q>=950000?(q/1e6).toFixed(1).replace('.',',')+' milioni di km²':q>=10000?nf.format(Math.round(q/10000)*10000)+' km²':'';
    return 'quota di superficie'+(s?': circa '+s+' su questa carta':', per regioni')+'; tratteggio: i territori di Costantinopoli (395 = 100)'; }},
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
  $('cruscotto').appendChild(box); s.box=box;
  s.b=box.querySelector('b'); s.small=box.querySelector('small'); s.linea=box.querySelector('line');
});
function scriviSpie(){
  var via=anno>330.5, sm=SPIE[1]; if(sm.box.hidden!==via){ sm.box.hidden=via; $('cruscotto').classList.toggle('tre',via); }      // dopo Costantino la moneta è il solido d'oro e non cambia più: la spia esce, quella del territorio prende la riga
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
/* sui telefoni l'elenco è lungo: si apre per intero solo a richiesta (il bottone si vede solo lì, css/stile.css) */
var contaElenco=0, contaMonumenti=function(){};
(function(){ var sr=document.querySelector('.stato-roma'), bm=$('btnMonumenti'); if(!bm) return;
  function scrivi(){ var c=sr.classList.contains('corto'); bm.setAttribute('aria-expanded',c?'false':'true'); bm.textContent=c?'Mostra tutti i '+contaElenco+' monumenti':'Mostra meno'; bm.hidden=contaElenco<=20; }      // venti stanno nelle due colonne dell'elenco corto
  sr.classList.add('corto'); bm.addEventListener('click',function(){ sr.classList.toggle('corto'); scrivi();
    if(sr.classList.contains('corto') && sr.getBoundingClientRect().top<0) sr.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); });      // chiudendo l'elenco lungo si torna al suo inizio, non in mezzo alla pagina
  contaMonumenti=function(n){ contaElenco=n; scrivi(); };
})();
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
/* Nell'elenco stanno solo i monumenti che in quell'anno ci sono, anche in disuso o in rovina: quelli non ancora costruiti e quelli scomparsi non compaiono. La legenda mostra solo gli stati presenti. */
var legendaStati=[].slice.call(document.querySelectorAll('.stato-roma .legenda .st'));
function scriviMonumenti(){
  var cambiato=false;
  voci.forEach(function(v){
    var q=RM.statoMonumento(v.m.id,anno), st=q.t>.5?q.s1:q.s0; if(st===v.st) return;
    v.st=st; v.li.className=st+(v.m===schedaDi?' scelto':''); v.li.title=nomeStato(v.m,st); v.li.hidden=st==='assente'; cambiato=true;
    v.s.textContent=v.m.nome+(v.m.note&&v.m.note[st]?' · '+v.m.note[st]:'');
  });
  if(!cambiato) return;
  var ci={}, n=0; voci.forEach(function(v){ if(v.st!=='assente'){ ci[v.st]=1; n++; } if(n>20&&v.st!=='assente') v.li.setAttribute('data-oltre',''); else v.li.removeAttribute('data-oltre'); });      // oltre la ventesima: nascosta nell'elenco corto dei telefoni (css/stile.css)
  legendaStati.forEach(function(e){ var k=e.className.replace('st ',''); e.hidden=!ci[k]; });
  contaMonumenti(n);
}

/* ---------- linea del tempo ---------- */
var bottoni=[], gruppi=D.ATTI.map(function(a,k){
  var g=document.createElement('div'), p=document.createElement('p'), riga=document.createElement('div');
  g.className='atto-gruppo'; p.innerHTML='<b>'+a.da+'</b><span>'+a.nome+'</span>'+(k===D.ATTI.length-1?'<b class="fine">'+a.a+'</b>':''); g.appendChild(p); g.appendChild(riga); $('linea').appendChild(g); return {g:g,riga:riga,n:0};
});
T.forEach(function(t,i){
  var b=document.createElement('button'); b.type='button'; if(t.intermezzo) b.className='intermezzo';
  b.setAttribute('aria-label',(t.intermezzo?'Intermezzo: ':t.anno+' · ')+t.titolo);
  b.addEventListener('click',function(){ ferma(); vai(i); });
  var g=gruppi[Math.min(t.atto,gruppi.length-1)]; g.riga.appendChild(b); g.n++; bottoni.push(b);
});
gruppi.forEach(function(g){ g.g.style.setProperty('--n',g.n); });
/* Il dito (o il mouse) scorre sulla linea: un fumetto dice anno e titolo della tappa che ha sotto, e al rilascio ci si va.
   Sui telefoni le tappe sono larghe pochi punti e non si toccano una per una; i tasti di ogni tappa restano per la tastiera. */
var fumetto=document.createElement('p'), barra=$('linea'), cassa=barra.parentNode, mira=-1, premuto=false, centri=null;
fumetto.className='fumetto'; fumetto.hidden=true; fumetto.setAttribute('aria-hidden','true'); cassa.appendChild(fumetto);
function punta(x){
  if(!centri) centri=bottoni.map(function(b){ var r=b.getBoundingClientRect(); return r.left+r.width/2; });
  var k=0, d=1e9; centri.forEach(function(c,i){ var e=Math.abs(c-x); if(e<d){ d=e; k=i; } });
  if(k!==mira){
    if(mira>=0) bottoni[mira].classList.remove('mira'); mira=k; bottoni[k].classList.add('mira');
    var t=T[k], b=document.createElement('b'); b.textContent=t.intermezzo?'Intermezzo':t.anno; fumetto.textContent=''; fumetto.appendChild(b); fumetto.appendChild(document.createTextNode(t.titolo));
  }
  fumetto.hidden=false; var r=cassa.getBoundingClientRect(), m=fumetto.offsetWidth/2+4; fumetto.style.left=Math.max(m,Math.min(r.width-m,centri[k]-r.left))+'px';
}
function smetti(){ if(mira>=0) bottoni[mira].classList.remove('mira'); mira=-1; fumetto.hidden=true; premuto=false; centri=null; }
barra.addEventListener('pointerdown',function(e){ if(e.button) return; if(e.target.closest && e.target.closest('.atto-gruppo>p')) return;      // il nome dell'atto apre la sua scheda (js/atti.js), non sposta la tappa
  centri=null; premuto=true; punta(e.clientX); });
barra.addEventListener('pointermove',function(e){ if(!premuto && e.pointerType==='mouse') punta(e.clientX); });
barra.addEventListener('pointerleave',function(){ if(!premuto) smetti(); });
window.addEventListener('pointermove',function(e){ if(premuto) punta(e.clientX); });
window.addEventListener('pointerup',function(){ if(!premuto) return; var k=mira; smetti(); if(k>=0 && k!==idx){ ferma(); vai(k); } });
window.addEventListener('pointercancel',function(){ if(premuto) smetti(); });      // il dito è andato in verticale: la pagina scorre e non si cambia tappa

/* ---------- tappa ---------- */
function vai(i,subito){
  idx=Math.max(0,Math.min(T.length-1,i));
  var t=T[idx], a=D.ATTI[Math.min(t.atto,D.ATTI.length-1)];
  meta=t.anno; vel=Math.max(8,Math.abs(meta-anno))/1.7; if(subito) anno=meta;
  $('tAtto').innerHTML=(t.intermezzo?'':'<b>'+t.anno+'</b>')+(t.intermezzo?'Intermezzo':t.epilogo?'Epilogo':'Atto '+a.n+' · '+a.nome)+'<button type="button" class="as-apri" aria-controls="attoScheda">L’atto in breve</button>';
  $('tTitolo').textContent=t.titolo; $('tTesto').textContent=t.testo;
  $('tStorici').hidden=!t.storici; $('tStoriciTesto').textContent=t.storici||'';
  $('tLeggenda').hidden=!t.leggenda; $('tLeggendaTesto').textContent=t.leggenda||'';      // dove una leggenda nasce da questa tappa: che cosa dicono le fonti e che cosa viene dopo
  var chi=t.protagonisti||[], bc=$('tChiElenco'); $('tChi').hidden=!chi.length; bc.textContent='';      // chi c'è in questa tappa: [nome, date, una riga]
  if(window.RM_protagonisti) RM_protagonisti.elenco(bc,chi,t.anno);      // con i ritratti (js/protagonisti.js); senza, l'elenco di solo testo qui sotto
  else chi.forEach(function(p){ var li=document.createElement('li'), b=document.createElement('b'); b.textContent=p[0]; li.appendChild(b); var d=document.createElement('span'); d.className='date'; d.textContent=p[1]||''; li.appendChild(d);      /* anche senza date: lo span porta lo stacco e il punto fra nome e riga (prima «Cniva» restava attaccato al testo) */ li.appendChild(document.createTextNode(p[2])); bc.appendChild(li); });
  var voci=t.voci||[], bv=$('tVoci'); $('tVoce').hidden=!voci.length; bv.textContent=''; $('tVoceTitolo').textContent=voci.length>1?'Voci di allora':'Una voce di allora';      // parole dei contemporanei, tradotte dalla fonte
  voci.forEach(function(v){ var q=document.createElement('blockquote'), c=document.createElement('p'); q.textContent=v.testo; c.className='chi'; c.textContent=v.chi; bv.appendChild(q); bv.appendChild(c); });
  if(MAPPA) MAPPA.mostra(t.regioni,t.anno,t.luoghi,t.scena,t.passi);
  bottoni.forEach(function(b,k){ b.setAttribute('aria-current',k===idx?'true':'false'); b.classList.toggle('passata',k<idx); });
  gruppi.forEach(function(g,k){ g.g.classList.toggle('attivo',k===Math.min(t.atto,gruppi.length-1)); });
  $('btnPrima').disabled=idx===0; $('btnDopo').disabled=idx===T.length-1;
  try{ history.replaceState(null,'','#tappa-'+(idx+1)); }catch(e){}
  ascolto.forEach(function(f){ f(idx,t); });
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
  $('btnGrande').setAttribute('aria-label',si?'Esci dallo schermo intero':'Scena a tutto schermo'); $('btnGrande').title=si?'Chiudi':'Tutto schermo';
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
/* Prova: ?guarda=<id>&anno=<anno>&dist=<distanza>&da=<n|s|e|o|ne|no|se|so> apre la città a tutto schermo, già puntata su un monumento in un certo anno
   (oppure ?guarda=punto&x=..&z=..). Serve alle catture di controllo fatte con il browser senza finestra; nella pagina normale non fa nulla. */
(function(){
  var cerca=function(k){ var r=new RegExp('[?&]'+k+'=([^&#]+)').exec(location.search); return r?decodeURIComponent(r[1]):null; }, id=cerca('guarda'); if(!id||!RM.volaA) return;
  var mo=(RM.MONUMENTI||[]).filter(function(x){ return x.id===id; })[0], x=mo?mo.x:parseFloat(cerca('x')), z=mo?mo.z:parseFloat(cerca('z')); if(isNaN(x)||isNaN(z)) return;
  var d=parseFloat(cerca('dist'))||40, dir={n:[0,-1],s:[0,1],e:[1,0],o:[-1,0],so:[-.6,.8],se:[.6,.8],no:[-.6,-.8],ne:[.6,-.8]}[cerca('da')||'so']||[-.6,.8], a=parseFloat(cerca('anno'));
  setTimeout(function(){ grande(true); if(!isNaN(a)){ anno=meta=a; applica(); } var tp=document.querySelector('.tempo'); if(tp) tp.style.display='none';
    RM.renderer.domElement.dispatchEvent(new Event('pointerdown'));      // ferma il volo d'apertura: qui la camera va messa subito al suo posto
    var q=RM.h(x,z)+1; RM.controlli.target.set(x,q,z); RM.camera.position.set(x+dir[0]*d*.82,q+d*.56,z+dir[1]*d*.82); RM.controlli.update(); },400);
})();
[].forEach.call(document.querySelectorAll('.menu a'),function(a){ a.addEventListener('click',function(e){ var el=document.getElementById(a.getAttribute('href').slice(1)); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); } }); });
/* Telefono (richiesta dell'utente, 23 novembre 2026): un bottone che porta dalla scena al racconto della tappa e ritorno.
   Finché si guarda la scena e il titolo della tappa sta sotto lo schermo dice «Leggi la tappa»; quando la scena è uscita di sopra dice «Carta e città».
   Sta sopra la linea del tempo quando questa è incollata in fondo. Sul PC e a tutto schermo non c'è. */
(function(){
  var b=document.createElement('button'), tit=$('tAtto')||$('tTitolo'), sc=$('scene'), tp=document.querySelector('.tempo'), raf=0; if(!tit||!sc) return;
  b.type='button'; b.className='salta-giu'; b.hidden=true; document.body.appendChild(b);
  function aggiorna(){
    var B=document.body.classList, H=window.innerHeight;
    if(window.innerWidth>1000 || B.contains('roma-grande') || B.contains('impero-grande')){ b.hidden=true; return; }
    var r=tit.getBoundingClientRect(), s=sc.getBoundingClientRect(), dove=r.top>H*.85 && s.bottom>0 ? 'giu' : s.bottom<0 && r.top<H*.6 ? 'su' : '';
    b.hidden=!dove; if(!dove) return;
    if(b.dataset.dove!==dove){ b.dataset.dove=dove; b.textContent=dove==='giu'?'Leggi la tappa ↓':'↑ Carta e città'; }
    var t=tp?tp.getBoundingClientRect():null; b.style.bottom=Math.max(14,t&&t.top<H&&t.bottom>H-4?H-t.top+10:14)+'px';
  }
  function presto(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; aggiorna(); }); }
  window.addEventListener('scroll',presto,{passive:true}); window.addEventListener('resize',presto); ascolto.push(presto); aggiorna();
  b.addEventListener('click',function(){ var ridotto=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    (b.dataset.dove==='giu'?tit:sc).scrollIntoView({behavior:ridotto?'auto':'smooth',block:'start'}); });
})();
window.RM_pagina={vai:vai, ferma:ferma, spie:SPIE, quando:function(f){ ascolto.push(f); }, tappa:function(){ return idx; }, annoOra:function(){ return anno; }, anno:function(y){ anno=meta=y; applica(); }};      // anno(y): porta la scena a un anno qualsiasi senza cambiare tappa (js/confronto.js)
})();

/* il piede a voci che si aprono: un collegamento a #fonti, #come o #licenze (il menu in testa, un indirizzo con l'ancora) apre la voce e ci porta */
(function(){
  function apri(){ var id=location.hash.slice(1), d=id&&document.getElementById(id); if(d && d.tagName==='DETAILS'){ d.open=true; setTimeout(function(){ d.scrollIntoView({block:'start'}); },30); } }
  document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a) return; var d=document.getElementById(a.getAttribute('href').slice(1)); if(d && d.tagName==='DETAILS') d.open=true; });
  window.addEventListener('hashchange',apri); apri();
})();
/* il numero delle tappe nella testata si conta dai dati: non va più corretto a mano quando se ne aggiunge una (intermezzi compresi, come si è sempre contato) */
(function(){ var n=document.getElementById('numTappe'), T=(window.RM_DATI||{}).TAPPE; if(n&&T) n.textContent=T.length; })();
