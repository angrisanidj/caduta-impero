/* Regia della pagina: tappe, anno che scorre, cruscotto, linea del tempo, schede, giorno e notte.
   Funziona anche senza il 3D: la scena di Roma è solo uno dei destinatari dell'anno corrente. */
(function(){
'use strict';
var D=window.RM_DATI, RM=window.RM||{moduli:[]}, MAPPA=window.RM_mappa;
var T=D.TAPPE, A0=235, A1=852;
var $=function(id){ return document.getElementById(id); };
var nf=new Intl.NumberFormat('it-IT');
var avvio=true, idx=0, anno=T[0].anno, meta=anno, vel=0, notte=0, metaNotte=0, coda=null, ascolto=[];      // ascolto: chi vuole sapere quando cambia la tappa (js/atti.js)

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
    return 'percentuale del territorio'+(s?': circa '+s+' su questa carta':', per regioni')+'; tratteggio: i territori di Costantinopoli (395 = 100)'; }},
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
  b.setAttribute('aria-label',(t.intermezzo?'Intermezzo: ':t.anno+' · ')+t.titolo+(t.intermezzo?' (carta e città non cambiano, il testo è sotto)':''));
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
    if(t.intermezzo){ var n=document.createElement('i'); n.textContent=' · si legge sotto'; fumetto.appendChild(n); }      // l'intermezzo non cambia carta e città: il fumetto lo dice prima del rilascio
    fumetto.classList.toggle('intermezzo',!!t.intermezzo);
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
/* Telefono (24 novembre 2026, l'utente: «Ricorda sempre di tornare su Impero ogni volta che cambi tappa»): a ogni tappa nuova la scheda torna all'Impero, che è ciò che cambia a ogni tappa.
   Resta su Roma quando chi guarda sta usando la città: a tutto schermo, con una scheda di monumento aperta, con «Prima e dopo» o con il percorso del pellegrino.
   Se la scena è già uscita di sopra (si sta leggendo la tappa) il testo resta dov'era. Per andare a Roma c'è la riga «A Roma, in quest'anno… Guarda la città». */
function tornaImpero(){
  var sc=$('scene'), b=document.querySelector('.schede button[data-vista="impero"]'), B=document.body.classList, pel=$('btnPellegrino');
  if(!sc || !b || sc.getAttribute('data-vista')!=='roma') return;
  if(getComputedStyle(b.parentNode).display==='none') return;      // sul PC le due scene stanno insieme
  if(B.contains('roma-grande') || schedaDi || document.querySelector('.riquadro.roma.confronto-attivo') || (pel&&pel.getAttribute('aria-pressed')==='true')) return;
  var tit=$('tAtto'), y0=tit?tit.getBoundingClientRect().top:0, sopra=sc.getBoundingClientRect().bottom<0;
  b.click();
  if(sopra && tit) window.scrollBy(0,tit.getBoundingClientRect().top-y0);
}
function vai(i,subito){
  var cambia=Math.max(0,Math.min(T.length-1,i))!==idx;
  idx=Math.max(0,Math.min(T.length-1,i));
  var t=T[idx], a=D.ATTI[Math.min(t.atto,D.ATTI.length-1)];
  if(cambia) tornaImpero();      // prima di ridisegnare la carta: così si ridisegna già visibile, alla misura giusta
  meta=t.anno; vel=Math.max(8,Math.abs(meta-anno))/1.7; if(subito) anno=meta;
  $('tAtto').innerHTML=(t.intermezzo?'':'<b>'+t.anno+'</b>')+(t.intermezzo?'Intermezzo':t.epilogo?'Epilogo':'Atto '+a.n+' · '+a.nome)+'<button type="button" class="as-apri" aria-controls="attoScheda">L’atto in breve</button>';
  $('tTitolo').textContent=t.titolo; $('tTesto').textContent=t.testo;
  $('tStorici').hidden=!t.storici; $('tStoriciTesto').textContent=t.storici||'';
  $('tLeggenda').hidden=!t.leggenda; $('tLeggendaTesto').textContent=t.leggenda||''; figuraLeggenda(t);      // dove una leggenda nasce da questa tappa: che cosa dicono le fonti e che cosa viene dopo
  var chi=t.protagonisti||[], bc=$('tChiElenco'); $('tChi').hidden=!chi.length; bc.textContent='';      // chi c'è in questa tappa: [nome, date, una riga]
  if(window.RM_protagonisti) RM_protagonisti.elenco(bc,chi,t.anno);      // con i ritratti (js/protagonisti.js); senza, l'elenco di solo testo qui sotto
  else chi.forEach(function(p){ var li=document.createElement('li'), b=document.createElement('b'); b.textContent=p[0]; li.appendChild(b); var d=document.createElement('span'); d.className='date'; d.textContent=p[1]||''; li.appendChild(d);      /* anche senza date: lo span porta lo stacco e il punto fra nome e riga (prima «Cniva» restava attaccato al testo) */ li.appendChild(document.createTextNode(p[2])); bc.appendChild(li); });
  var voci=t.voci||[], bv=$('tVoci'); $('tVoce').hidden=!voci.length; bv.textContent=''; $('tVoceTitolo').textContent=voci.length>1?'Voci di allora':'Una voce di allora';      // parole dei contemporanei, tradotte dalla fonte
  voci.forEach(function(v){ var q=document.createElement('blockquote'), c=document.createElement('p'); q.textContent=v.testo; c.className='chi'; c.textContent=v.chi; bv.appendChild(q); bv.appendChild(c); });
  daLeggere(t); inCitta(t);
  if(MAPPA) MAPPA.mostra(t.regioni,t.anno,t.luoghi,t.scena,t.passi);
  bottoni.forEach(function(b,k){ b.setAttribute('aria-current',k===idx?'true':'false'); b.classList.toggle('passata',k<idx); });
  gruppi.forEach(function(g,k){ g.g.classList.toggle('attivo',k===Math.min(t.atto,gruppi.length-1)); });
  $('btnPrima').disabled=idx===0; $('btnDopo').disabled=idx===T.length-1;
  try{ if(!avvio || !location.hash || /^#(tappa-\d+|\d{3}(-[a-z]+)?)$/.test(location.hash)) history.replaceState(null,'','#'+chiaveTappa(t)); }catch(e){}      // all'apertura un'ancora d'altro tipo (#fonti, #licenze) resta: la apre il piede      // l'indirizzo dice l'anno della tappa (#552; un intermezzo: #476-citta), non il suo numero, che cambia quando se ne aggiunge una
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
/* Indirizzi delle tappe (23 novembre 2026): l'anno, e per i quattro intermezzi l'anno col nome (#284-moneta, #395-commerci, #439-barbari, #476-esercito, #590-citta).
   I vecchi #tappa-N contavano le tappe: con le tre tappe del 23 novembre dalla 34 in poi portavano alla tappa sbagliata. Si traducono secondo la numerazione
   rimasta in rete dalla notte del 22 alla mattina del 23 novembre (51 tappe; VECCHIE); i link ancora più vecchi, di quando le tappe erano 47, non si possono distinguere. */
function chiaveTappa(t){ return t.intermezzo?t.anno+'-'+String(t.titolo).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^(la|il|lo|le|i|gli)\s+|^l['’]/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''):String(t.anno); }
var VECCHIE='235 251 260 271 274 284i 293 301 312 330 357 363 378 384 394 395 395i 402 406 409 410 418 429 439 439i 451 455 458 468 472 476 476i 493 526 537 542 546 568 589 593 609 663 711 727 756 780 791 800 801 846 852'.split(' ');
function tappaDaIndirizzo(h){
  var m=/^#tappa-(\d+)$/.exec(h), i, v;
  if(m){ v=VECCHIE[parseInt(m[1],10)-1]; if(!v) return -1; for(i=0;i<T.length;i++) if(String(T[i].anno)===v.replace('i','') && !!T[i].intermezzo===(v.slice(-1)==='i')) return i; return -1; }
  if(h==='#476-citta') h='#590-citta';      // «La città» spostata in fondo all'atto V il 23 novembre 2026: il vecchio indirizzo resta valido
  for(i=0;i<T.length;i++) if('#'+chiaveTappa(T[i])===h) return i;
  return -1;
}
var daIndirizzo=tappaDaIndirizzo(location.hash);
if(daIndirizzo>=0){ vai(daIndirizzo,true); }
else{                                   // apertura dalla fine: la città del 550, poi il riavvolgimento
  anno=550; vai(0); vel=(550-T[0].anno)/4.5; applica();
}
avvio=false;
window.addEventListener('hashchange',function(){ var i=tappaDaIndirizzo(location.hash); if(i>=0 && i!==idx) vai(i,true); });      // un indirizzo scritto a mano, o un link interno
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
    if(B.contains('roma-grande') || B.contains('impero-grande')){ b.hidden=true; return; }      // dal 23 novembre 2026 anche sul PC (prima solo fino a 1000 punti)
    if(B.contains('tempo-attesa')){ b.hidden=true; return; }      // in cima alla pagina, prima di scorrere, non c'è (come la linea del tempo)
    var ca=$('cause'), pi=document.querySelector('.piede'); if((ca&&ca.getBoundingClientRect().top<H-60) || (pi&&pi.getBoundingClientRect().top<H)){ b.hidden=true; return; }      // su «Perché cadde» e sul piede copriva le righe (proposta dell'audit del design, fatta il 23 novembre 2026)
    var r=tit.getBoundingClientRect(), s=sc.getBoundingClientRect(), dove=r.top>H*.85 && s.bottom>0 ? 'giu' : s.bottom<0 && r.top<H*.6 ? 'su' : '';
    if(dove==='giu' && T[idx].intermezzo && [].some.call(document.querySelectorAll('.ia-avviso:not([hidden]):not(.piccolo) .ia-carta'),function(c){ var q=c.getBoundingClientRect(); return q.width>0 && q.top>=0 && q.bottom<=H; })) dove='';      // l'avviso dell'intermezzo si vede tutto: dice già «Leggi l'intermezzo», due bottoni uguali uno sotto l'altro confondevano
    b.hidden=!dove; if(!dove) return;
    var inter=!!T[idx].intermezzo, chiave=dove+(inter?'-i':'');      // negli intermezzi (24 novembre 2026) dice «Leggi l'intermezzo» e resta acceso finché non si è scesi: carta e città lì non cambiano
    if(b.dataset.chiave!==chiave){ b.dataset.chiave=chiave; b.dataset.dove=dove; b.textContent=dove==='giu'?(inter?'Leggi l’intermezzo ↓':'Leggi la tappa ↓'):'↑ Torna alla carta e alla città'; b.classList.toggle('acceso',inter&&dove==='giu'); }
    var t=tp?tp.getBoundingClientRect():null; b.style.bottom=Math.max(14,t&&t.top<H&&t.bottom>H-70?H-t.top+10:14)+'px';      // H-70 e non H-4: la linea incollata sta a 8 punti dal fondo (bottom:8px), e con H-4 il bottone finiva sopra le tacche degli ultimi atti; 70 = bottone 40 + 14 di margine + aria, così sale anche quando la linea, al suo posto nella pagina, passa nella sua fascia
  }
  function presto(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; aggiorna(); }); }
  window.addEventListener('scroll',presto,{passive:true}); window.addEventListener('resize',presto); window.addEventListener('scroll-tempo',presto); ascolto.push(presto); aggiorna();
  ascolto.push(function(){ setTimeout(function(){ aggiorna(); if(b.hidden||b.dataset.dove!=='giu') return; b.classList.remove('pulsa'); void b.offsetWidth; b.classList.add('pulsa'); },250); });      // tappa nuova: «Leggi la tappa» pulsa, per dire che il racconto è sotto
  b.addEventListener('click',function(){ var ridotto=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    (b.dataset.dove==='giu'?tit:sc).scrollIntoView({behavior:ridotto?'auto':'smooth',block:'start'}); });
})();
/* Intermezzi (24 novembre 2026, l'utente: «fare in modo che quando ci si muove su una voce di intermezzo sia ben chiaro che bisogna leggere sotto perché le mappe sopra non cambiano»).
   Un intermezzo non ha un anno suo: carta e città restano com'erano. Per tutta la sua durata ciascuna delle due scene ha un velo chiaro e, al centro, un avviso
   («Intermezzo · La moneta. La carta e la città restano al 284…») che al tocco porta al testo; a tutto schermo, dove il testo non si vede, prima chiude lo schermo intero.
   La × riduce l'avviso a una pastiglia in alto e toglie il velo, per guardare la scena; alla tappa seguente si rimette. Sul telefono, scegliendo un intermezzo, la pagina
   scende da sola al testo (non durante «Riproduci» né a tutto schermo); sul PC no, per scelta: un salto non chiesto dà fastidio, basta l'avviso. Stili in fondo a css/stile.css. */
(function(){
  var tit=$('tAtto'), rq=[document.querySelector('.riquadro.impero'),document.querySelector('.riquadro.roma')].filter(Boolean), avvisi=[], piccolo=false, ultima=idx, scritto='';
  if(!tit||!rq.length) return;
  function ridotto(){ return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function al(a){ return (/^(8|11)/.test(String(a))?'all’':'al ')+a; }      // «al 284», «all'852»
  var voce=document.createElement('p'); voce.className='sr'; voce.setAttribute('aria-live','polite'); document.body.appendChild(voce);      // per i lettori di schermo, una frase sola
  function aTesto(){
    var B=document.body.classList; if(B.contains('roma-grande')) grande(false); if(B.contains('impero-grande') && MAPPA && MAPPA.grande) MAPPA.grande(false);
    setTimeout(function(){ tit.scrollIntoView({behavior:ridotto()?'auto':'smooth',block:'start'}); try{ tit.setAttribute('tabindex','-1'); tit.focus({preventScroll:true}); }catch(e){} },60);      // anche il fuoco va al testo, per chi usa la tastiera
  }
  rq.forEach(function(r){
    var v=document.createElement('div'), box=document.createElement('div'), carta=document.createElement('div'), leggi=document.createElement('button'), chiudi=document.createElement('button');
    v.className='ia-velo'; v.setAttribute('aria-hidden','true'); v.hidden=true; box.className='ia-avviso'; box.hidden=true; carta.className='ia-carta';
    leggi.type='button'; leggi.className='ia-leggi'; leggi.innerHTML='<span class="ia-occhio"></span><span class="ia-frase"></span><span class="ia-vai"></span>';
    chiudi.type='button'; chiudi.className='ia-chiudi'; chiudi.setAttribute('aria-label','Riduci l’avviso e guarda la scena'); chiudi.title='Riduci'; chiudi.textContent='×';
    carta.appendChild(leggi); carta.appendChild(chiudi); box.appendChild(carta); r.appendChild(v); r.appendChild(box);
    leggi.addEventListener('click',aTesto); chiudi.addEventListener('click',function(){ piccolo=true; scrivi(); leggi.focus(); });
    avvisi.push({v:v,box:box,occhio:leggi.children[0],frase:leggi.children[1],vai:leggi.children[2]});
  });
  function scrivi(){
    var t=T[idx], si=!!t.intermezzo, B=document.body.classList, tutto=B.contains('roma-grande')||B.contains('impero-grande'), k=si?idx+'|'+piccolo+'|'+tutto:'';
    if(k===scritto) return; scritto=k; B.toggle('in-intermezzo',si);
    avvisi.forEach(function(a){
      a.box.hidden=!si; a.v.hidden=!si||piccolo; a.box.classList.toggle('piccolo',piccolo); if(!si) return;
      a.occhio.textContent='Intermezzo · '+t.titolo;
      a.frase.textContent='La carta e la città restano '+al(t.anno)+'. L’intermezzo si legge sotto.';
      a.vai.textContent=tutto?'Esci e leggi ↓':piccolo?'Leggi ↓':'Leggi l’intermezzo ↓';
    });
    window.dispatchEvent(new Event('scroll-tempo'));      // il bottone fluttuante si rimisura (si nasconde mentre l'avviso intero è sullo schermo)
  }
  ascolto.push(function(i,t){
    var nuova=i!==ultima; ultima=i; if(nuova) piccolo=false; scrivi(); if(!nuova) return;
    voce.textContent=t.intermezzo?'Intermezzo: '+t.titolo+'. La carta e la città restano '+al(t.anno)+'; il testo è sotto.':'';
    var B=document.body.classList;
    if(t.intermezzo && !coda && !B.contains('roma-grande') && !B.contains('impero-grande') && window.matchMedia && matchMedia('(max-width:1000px)').matches)
      setTimeout(function(){ var y=tit.getBoundingClientRect().top; if(y>window.innerHeight*.35 || y<0) tit.scrollIntoView({behavior:ridotto()?'auto':'smooth',block:'start'}); },320);      // dopo tornaImpero e il ridisegno della carta
  });
  if(window.MutationObserver) new MutationObserver(scrivi).observe(document.body,{attributes:true,attributeFilter:['class']});      // aperto o chiuso lo schermo intero: cambia la scritta del bottone
  scrivi();
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

/* «Da leggere in questa tappa» (23 novembre 2026, l'utente: «quando per ogni tappa ci sono citazioni o aneddoti indicamelo chiaramente così da invogliarmi a leggerle»):
   sotto il testo della tappa, un invito per ogni riquadro che c'è: le voci di allora (con l'autore), la storia fra storia e leggenda, la domanda degli storici.
   Toccato, porta al riquadro e lo fa risaltare per un momento. Gli inviti si scrivono dai dati: nessuna parola nuova sui fatti. */
function daLeggere(t){
  var $=function(id){ return document.getElementById(id); }, nav=$('tDaLeggere'); if(!nav) return; nav.textContent='';      // fuori dalla funzione principale del file: $ va ridefinito
  function breve(s,n){ s=String(s||'').replace(/\s+/g,' ').trim(); var f=s.match(/^[^.?!]*[?]/); if(f && f[0].length<=n+30) return f[0]; var w=s.split(' '), o=''; for(var i=0;i<w.length && (o+' '+w[i]).length<=n;i++) o+=(o?' ':'')+w[i]; return o.length>=s.length?s:o.replace(/[,;:.]$/,'')+'…'; }
  function autore(c){ return String(c||'').split(/[,.]/)[0]; }
  var voci=t.voci||[], inviti=[];
  if(voci.length) inviti.push({id:'tVoce', cl:'voce', segno:'«»', titolo:voci.length>1?voci.length+' voci di allora':'Una voce di allora', sotto:voci.map(function(v){ return autore(v.chi); }).filter(function(x,i,a){ return a.indexOf(x)===i; }).join(' · ')});
  if(t.leggenda) inviti.push({id:'tLeggenda', cl:'leggenda', segno:'✦', titolo:'Fra storia e leggenda', sotto:breve(t.leggenda,70)});
  if(t.storici) inviti.push({id:'tStorici', cl:'storici', segno:'?', titolo:'Gli storici discutono', sotto:breve(t.storici,70)});
  nav.hidden=!inviti.length; if(!inviti.length) return;
  var et=document.createElement('p'); et.className='dl-etichetta'; et.textContent='Letture di questa tappa'; nav.appendChild(et);
  var ul=document.createElement('ul'); nav.appendChild(ul);
  inviti.forEach(function(x){
    var li=document.createElement('li'), b=document.createElement('button'), s=document.createElement('span'), tt=document.createElement('b'), so=document.createElement('span');
    b.type='button'; b.className='dl-invito dl-'+x.cl; s.className='dl-segno'; s.setAttribute('aria-hidden','true'); s.textContent=x.segno; tt.textContent=x.titolo; so.className='dl-sotto'; so.textContent=x.sotto;
    b.appendChild(s); var c=document.createElement('span'); c.className='dl-testi'; c.appendChild(tt); c.appendChild(so); b.appendChild(c); li.appendChild(b); ul.appendChild(li);
    b.addEventListener('click',function(){ var r=$(x.id); if(!r) return; var basso=matchMedia('(prefers-reduced-motion: reduce)').matches; r.scrollIntoView({behavior:basso?'auto':'smooth',block:'center'});
      r.classList.remove('risalta'); void r.offsetWidth; r.classList.add('risalta'); });
  });
}

/* Un'immagine nel riquadro «Fra storia e leggenda» (24 novembre 2026, pronta per il rilievo delle spoglie dell'arco di Tito nella tappa del 534). Campo della tappa in js/dati.js:
   leggendaImmagine:{src, w, h, alt, did, autore, licenza, pagina}. La figura entra in pagina solo quando l'immagine si è caricata: senza il campo, o se il file manca, non resta nessun buco. */
function figuraLeggenda(t){
  var box=document.getElementById('tLeggenda'), f=t.leggendaImmagine; if(!box) return;
  var vecchia=box.querySelector('.lg-figura'); if(vecchia) box.removeChild(vecchia); if(!f||!f.src) return;
  var fig=document.createElement('figure'), img=new Image(), cap=document.createElement('figcaption');
  fig.className='lg-figura'; fig.hidden=true; img.alt=f.alt||''; img.decoding='async'; if(f.w&&f.h){ img.width=f.w; img.height=f.h; }
  cap.textContent=(f.did?f.did+' ':'');
  if(f.autore||f.licenza){ var cr=document.createElement(f.pagina?'a':'span'); if(f.pagina){ cr.href=f.pagina; cr.target='_blank'; cr.rel='noopener'; } cr.className='lg-credito'; cr.textContent='Foto: '+[f.autore,f.licenza].filter(Boolean).join(', '); cap.appendChild(cr); }
  img.onload=function(){ fig.hidden=false; }; img.onerror=function(){ if(fig.parentNode) fig.parentNode.removeChild(fig); };
  fig.appendChild(img); fig.appendChild(cap); box.appendChild(fig); img.src=f.src;
}

/* «A Roma, in quest'anno» (23 novembre 2026): sul telefono la città non si apre da sola, e chi legge non sa che c'è qualcosa da vedere. Sotto il testo della tappa, se nell'anno
   della tappa c'è un evento di Roma (EVENTI in js/dati.js), una riga con la sua didascalia accorciata e il bottone «Guarda la città»: apre la scheda «Roma», porta su la scena
   e la fa volare sul luogo (RM.regiaTappa in js/scene-tappe.js). Sul PC le due scene stanno insieme e la regia parte da sola: la riga lì non si mostra (css/stile.css). */
function inCitta(t){
  var box=document.getElementById('tCitta'); if(!box) return; box.textContent='';
  var ev=null; if(!t.intermezzo) ((window.RM_DATI||{}).EVENTI||[]).forEach(function(e){ if(!ev && Math.floor(e.da)===t.anno && e.testo) ev=e; });
  box.hidden=!ev; if(!ev) return;
  var s=String(ev.testo).replace(/\s+/g,' ').trim(), k=s.indexOf(' · '); if(k>=0 && k<40) s=s.slice(k+3);      // via la data in testa («Luglio 472 · …»): l'anno c'è già
  var fr=s.match(/[^.!?]+[.!?]+(\s|$)/g)||[s], o1='';      // le frasi intere che stanno in 130 caratteri (almeno la prima)
  for(var j=0;j<fr.length && (!o1 || (o1+fr[j]).trim().length<=130);j++) o1+=fr[j]; s=o1.trim();
  if(s.length>130){ var w=s.split(' '), o=''; for(var i=0;i<w.length && (o+' '+w[i]).length<=125;i++) o+=(o?' ':'')+w[i]; s=o.replace(/[,;:.]$/,'')+'…'; }
  var b=document.createElement('button'), ic=document.createElement('span'), tx=document.createElement('span'), tt=document.createElement('b'), so=document.createElement('span'), va=document.createElement('span');
  b.type='button'; b.className='ic-bottone'; ic.className='ic-segno'; ic.setAttribute('aria-hidden','true');
  ic.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 20h18M5 20V11l7-5 7 5v9M9 20v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  tx.className='ic-testi'; tt.textContent='A Roma, in quest\'anno'; so.className='ic-sotto'; so.textContent=s; va.className='ic-vai'; va.textContent='Guarda la città →';
  tx.appendChild(tt); tx.appendChild(so); tx.appendChild(va); b.appendChild(ic); b.appendChild(tx); box.appendChild(b);
  b.addEventListener('click',function(){
    var sc=document.getElementById('scene'), br=document.querySelector('.schede button[data-vista="roma"]');
    if(sc && sc.getAttribute('data-vista')!=='roma' && br) br.click();
    var rq=document.querySelector('.riquadro.roma'), basso=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(rq) rq.scrollIntoView({behavior:basso?'auto':'smooth',block:'start'});
    setTimeout(function(){ if(RM.regiaTappa) RM.regiaTappa(t); },60);      // dopo il ridimensionamento della scena appena mostrata
  });
}

/* La linea del tempo all'apertura (23 novembre 2026, l'utente: «È brutto che parta così il Riproduci all'inizio. Io lo terrei nascosto finché non scendi»): finché la pagina è in cima
   (meno di 40 punti di scorrimento) la linea del tempo incollata in fondo e il bottone «Leggi la tappa» non si vedono; al primo scorrimento la linea entra dal basso.
   Non vale a tutto schermo, dove la linea del tempo è sempre lì, né se la linea sta già al suo posto nella pagina (finestra molto alta). */
(function(){
  var tp=document.querySelector('.tempo'), raf=0; if(!tp) return;
  function aggiorna(){ raf=0; var B=document.body.classList, H=window.innerHeight;
    var cima=(window.scrollY||document.documentElement.scrollTop||0)<40 && !B.contains('roma-grande') && !B.contains('impero-grande') && tp.parentNode.getBoundingClientRect().bottom>H+tp.offsetHeight;      // si nasconde solo se è davvero incollata sopra il contenuto (il suo posto nella pagina è più in basso)
    var prima=B.contains('tempo-attesa'); B.toggle('tempo-attesa',cima); if(prima!==cima) window.dispatchEvent(new Event('scroll-tempo')); }
  function presto(){ if(!raf) raf=requestAnimationFrame(aggiorna); }
  window.addEventListener('scroll',presto,{passive:true}); window.addEventListener('resize',presto); aggiorna(); setTimeout(aggiorna,400);
})();

/* Le due pastiglie dell'apertura («L'Impero», «Roma»): portano alle scene; dove le scene stanno a schede (telefono) aprono quella toccata. */
(function(){
  [].forEach.call(document.querySelectorAll('.ds-voce'),function(a){
    a.addEventListener('click',function(e){
      var v=a.getAttribute('data-vista'), b=document.querySelector('.schede button[data-vista="'+v+'"]'), sc=document.getElementById('scene');
      if(b && getComputedStyle(b.parentNode).display!=='none' && sc && sc.getAttribute('data-vista')!==v) b.click();
      if(!sc) return; e.preventDefault();
      var basso=matchMedia('(prefers-reduced-motion: reduce)').matches; sc.scrollIntoView({behavior:basso?'auto':'smooth',block:'start'});
    });
  });
})();
