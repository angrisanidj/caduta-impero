/* Prova dei gradini della qualità, per il telefono di chi guarda (24 novembre 2026, sera; l'utente: «La qualità secondo me un iPhone nuovo può tenere anche qualità più alta.
   Riesci a fare un test?»). Si apre con l'indirizzo ?prova=qualita: js/base.js carica questo file solo allora, a pagina caricata.
   Da sola, in circa un minuto, apre la città a tutto schermo nell'852 e prova i cinque gradini (bassa, telefono, media, alta, massima) uno dopo l'altro, ognuno in tre vedute
   fisse (la vista d'insieme, una media distanza sui Fori e il Palatino, i Fori da vicino) e durante un volo dall'insieme ai Fori. Per ognuno conta i fotogrammi al secondo,
   l'intervallo peggiore fra due fotogrammi, quanti superano i 20 e i 34 millesimi (a 60 al secondo un fotogramma dura 16,7 millesimi: oltre 20 se n'è saltato uno, oltre 34 due)
   e il lavoro del processore. Prima, per un secondo e mezzo, la città non si disegna e si misura quante volte al secondo batte lo schermo; poi un giro di riscaldamento senza misure.
   Alla fine una tabella, il verdetto in parole semplici e i dati che servono a capire (schermo, densità, frequenza, scheda grafica se il browser la dice, versione della pagina);
   «Copia il risultato» mette tutto negli appunti, «Usa questo gradino» lo sceglie (come dal bottone «Qualità»). Nessun dato va in rete.
   Un gradino che va sotto i due terzi del ritmo pieno ferma la prova: i gradini sopra costerebbero di più. Si interrompe col bottone «Interrompi». */
(function(){
'use strict';
var RM=window.RM, PG=window.RM_pagina; if(!RM || RM.guasto || !RM.qualita || !RM.qualita.forza || !RM.camera) return;
var ANNO=852;      // un anno pesante: la città in rovina, le chiese, le mura leonine
var GRADINI=RM.qualita.scala.slice();      // bassa, telefono, media, alta, massima
var NOMI={bassa:'bassa',telefono:'telefono',media:'media',alta:'alta',massima:'massima'};
function dorme(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function $(t,c,testo){ var e=document.createElement(t); if(c) e.className=c; if(testo!=null) e.textContent=testo; return e; }
function cifra(v,d){ return (+v).toFixed(d==null?1:d).replace('.',','); }

/* ---- aspetto: riquadro chiaro, caratteri della pagina ---- */
var css=$('style'); css.textContent=[
  '.pq{position:fixed;z-index:9000;left:50%;transform:translateX(-50%);font-family:var(--ui,system-ui,sans-serif);color:var(--ink,#221C18);}',
  '.pq-corso{top:calc(10px + env(safe-area-inset-top,0px));width:min(92vw,420px);background:rgba(255,255,255,.94);border:1px solid var(--line,#E3DDD2);border-radius:12px;box-shadow:var(--ombra,0 6px 18px -10px rgba(0,0,0,.3));padding:12px 14px;}',
  '.pq-corso h2{font:600 13px/1.2 var(--ui,system-ui);letter-spacing:.04em;text-transform:uppercase;color:var(--porpora,#7A1F2B);margin:0 0 6px;}',
  '.pq-riga{font-size:17px;font-weight:600;margin:0 0 2px;}',
  '.pq-sotto{font-size:14px;color:var(--muted,#5F554B);margin:0 0 8px;}',
  '.pq-barra{height:6px;background:var(--line,#E3DDD2);border-radius:3px;overflow:hidden;margin:0 0 10px;}',
  '.pq-barra i{display:block;height:100%;width:0;background:var(--porpora,#7A1F2B);transition:width .3s;}',
  '.pq button{font:600 15px/1 var(--ui,system-ui);padding:11px 16px;border-radius:999px;border:1px solid var(--line,#E3DDD2);background:#fff;color:var(--porpora,#7A1F2B);cursor:pointer;min-height:44px;}',
  '.pq button.pq-primo{background:var(--porpora,#7A1F2B);border-color:var(--porpora,#7A1F2B);color:#fff;}',
  '.pq-fine{top:0;bottom:0;width:100%;max-width:none;transform:none;left:0;overflow:auto;-webkit-overflow-scrolling:touch;background:rgba(246,244,239,.97);padding:calc(16px + env(safe-area-inset-top,0px)) 16px calc(24px + env(safe-area-inset-bottom,0px));box-sizing:border-box;}',
  '.pq-carta{max-width:640px;margin:0 auto;background:#fff;border:1px solid var(--line,#E3DDD2);border-radius:14px;box-shadow:var(--ombra,none);padding:18px 16px 20px;}',
  '.pq-carta h2{font:600 20px/1.2 var(--cap,Georgia,serif);letter-spacing:.04em;margin:0 0 12px;color:var(--ink,#221C18);}',
  '.pq-verdetto{font-size:19px;line-height:1.35;margin:0 0 6px;}',
  '.pq-verdetto b{color:var(--porpora,#7A1F2B);}',
  '.pq-nota{font-size:14px;line-height:1.45;color:var(--muted,#5F554B);margin:0 0 14px;}',
  '.pq table{width:100%;border-collapse:collapse;font-size:14px;margin:0 0 14px;font-variant-numeric:tabular-nums;}',
  '.pq th{font-weight:600;font-size:12px;color:var(--muted,#5F554B);text-align:right;padding:6px 4px;border-bottom:1px solid var(--line,#E3DDD2);line-height:1.2;}',
  '.pq td{text-align:right;padding:9px 4px;border-bottom:1px solid var(--line,#E3DDD2);white-space:nowrap;}',
  '.pq th:first-child,.pq td:first-child{text-align:left;}',
  '.pq td.g{font-weight:600;}',
  '.pq td.esito{text-align:left;padding-left:8px;}',
  '.pq .si{color:#2f6b3a;} .pq .forse{color:#8a5a12;} .pq .no{color:#9A2F2A;} .pq .salto{color:var(--muted,#5F554B);}',
  '.pq dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px;margin:0 0 16px;}',
  '.pq dt{color:var(--muted,#5F554B);} .pq dd{margin:0;overflow-wrap:anywhere;}',
  '.pq details{font-size:13px;margin:0 0 16px;color:var(--muted,#5F554B);} .pq details pre{white-space:pre-wrap;font-size:12px;}',
  '.pq-bottoni{display:flex;flex-wrap:wrap;gap:8px;}',
  '.pq-avviso{font-size:14px;margin:10px 0 0;min-height:1.2em;}',
  '.pq textarea{width:100%;height:140px;font-size:12px;margin-top:8px;}'
].join('\n'); document.head.appendChild(css);

var stop=false, corso=null;
function pannelloCorso(){
  corso=$('div','pq pq-corso'); corso.setAttribute('role','status'); corso.setAttribute('aria-live','polite');
  var h=$('h2',null,'Prova della qualità'), r=$('p','pq-riga','Preparo la città…'), s=$('p','pq-sotto','Tieni il telefono fermo e lo schermo acceso: ci vuole circa un minuto.'), b=$('div','pq-barra'), i=$('i'), x=$('button',null,'Interrompi');
  b.appendChild(i); x.type='button'; x.addEventListener('click',function(){ stop=true; x.disabled=true; x.textContent='Mi fermo…'; });
  corso.appendChild(h); corso.appendChild(r); corso.appendChild(s); corso.appendChild(b); corso.appendChild(x); document.body.appendChild(corso);
  return {riga:r, sotto:s, barra:i};
}

/* ---- la scena ---- */
function apriCitta(){
  var bt=document.querySelector('.schede button[data-vista="roma"]'); if(bt) bt.click();      // sul telefono la scheda «Roma»
  if(!document.body.classList.contains('roma-grande')){ var g=document.getElementById('btnGrande'); if(g) g.click(); }
  var tp=document.querySelector('.tempo'); if(tp) tp.style.visibility='hidden';
  RM.senzaGiro=true; RM.controlli.autoRotate=false;
  RM.renderer.domElement.dispatchEvent(new Event('pointerdown')); window.dispatchEvent(new Event('pointerup'));      // ferma il volo d'apertura
}
function chiudiCitta(){ var tp=document.querySelector('.tempo'); if(tp) tp.style.visibility=''; RM.senzaGiro=false; }
function vista(t,c){ var v=RM.adatta?RM.adatta({t:t,c:c}):{t:t,c:c}, y=RM.h(t[0],t[1])+1;
  RM.controlli.target.set(t[0],y,t[1]); RM.camera.position.set(v.c[0],v.c[1],v.c[2]); RM.controlli.update(); }
function inquadra(x,z,d,az,el){ var y=RM.h(x,z)+1, a=az*Math.PI/180, e=el*Math.PI/180; return {t:[x,z], c:[x+Math.sin(a)*Math.cos(e)*d, y+Math.sin(e)*d, z+Math.cos(a)*Math.cos(e)*d]}; }
var VEDUTE=[
  {n:'insieme', nome:'vista d’insieme', v:{t:[0,5], c:[-200,255,470]}},
  {n:'media', nome:'media distanza, Fori e Palatino', v:inquadra(18,8,190,-35,33)},
  {n:'vicino', nome:'i Fori da vicino', v:inquadra(4,-12,21,12,43)}
];

/* ---- la misura: intervalli fra un fotogramma e l'altro, da requestAnimationFrame ---- */
function misura(ms,durante){
  return new Promise(function(fatto){
    var iv=[], lav=[], prima=0, t0=0, nascosta=false;
    function giro(ts){
      if(document.hidden) nascosta=true;
      if(prima){ iv.push(ts-prima); if(RM.lavoro!=null) lav.push(RM.lavoro); }
      prima=ts; if(!t0) t0=ts;
      if(durante) durante((ts-t0)/ms);
      if(ts-t0<ms && !stop) requestAnimationFrame(giro); else fatto({iv:iv, lav:lav, tempo:ts-t0, nascosta:nascosta});
    }
    requestAnimationFrame(giro);
  });
}
/* Un intoppo isolato (il più lungo della veduta, se supera un decimo di secondo: la memoria che si libera, un'altra app) non conta nei fotogrammi al secondo
   né nel giudizio: su due secondi di misura ne dimezzerebbe il ritmo. Resta nella colonna «Peggiore» e nel conto degli intoppi. */
function riassumi(m){
  var n=m.iv.length, s=0, peg=0, o20=0, o34=0, l=0, k;
  for(k=0;k<n;k++){ s+=m.iv[k]; if(m.iv[k]>peg) peg=m.iv[k]; if(m.iv[k]>20) o20++; if(m.iv[k]>34) o34++; }
  for(k=0;k<m.lav.length;k++) l+=m.lav[k];
  var tolto=peg>100?1:0;
  return {n:n-tolto, s:s-(tolto?peg:0), peg:peg, o20:o20-tolto, o34:o34-tolto, intoppi:tolto, lavoro:m.lav.length?l/m.lav.length:0, nascosta:m.nascosta, get fps(){ return this.s?1000*this.n/this.s:0; }};
}
function somma(lista){
  var t={n:0, s:0, peg:0, o20:0, o34:0, intoppi:0, l:0, nl:0, nascosta:false};
  lista.forEach(function(r){ t.n+=r.n; t.s+=r.s; if(r.peg>t.peg) t.peg=r.peg; t.o20+=r.o20; t.o34+=r.o34; t.intoppi+=r.intoppi; t.l+=r.lavoro*r.n; t.nl+=r.n; t.nascosta=t.nascosta||r.nascosta; });
  return {n:t.n, s:t.s, fps:t.s?1000*t.n/t.s:0, peg:t.peg, o20:t.o20, o34:t.o34, intoppi:t.intoppi, lavoro:t.nl?t.l/t.nl:0, nascosta:t.nascosta};
}
/* il giudizio: «regge» se tiene il ritmo pieno (almeno il 92% di 60, o della frequenza dello schermo se è più bassa) con pochi salti */
function giudica(r,meta){
  if(!r || !r.n) return {k:'salto', t:'non provato'};
  var q20=r.o20/r.n, q34=r.o34/r.n;
  if(r.fps>=meta*.92 && q20<=.05 && q34<=.01) return {k:'si', t:'✓ regge'};
  if(r.fps>=meta*.75 && q34<=.04) return {k:'forse', t:'≈ al limite'};
  return {k:'no', t:'✗ lento'};
}

/* ---- i dati del dispositivo ---- */
function scheda(){ try{ var gl=RM.renderer.getContext(), e=gl.getExtension('WEBGL_debug_renderer_info'); return String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)); }catch(x){ return 'non detta dal browser'; } }
function dati(hz){
  var c=RM.renderer.domElement;
  return { schermo:screen.width+' × '+screen.height+' punti', finestra:window.innerWidth+' × '+window.innerHeight+' punti', densita:cifra(window.devicePixelRatio||1,2).replace(/,00$/,''),
    tela:c.width+' × '+c.height+' pixel (densità di disegno '+cifra(RM.renderer.getPixelRatio(),2).replace(/,00$/,'')+')', hz:hz, scheda:scheda(), versione:RM.versione||'(senza versione)',
    browser:navigator.userAgent, data:new Date().toLocaleString('it-IT'), webgl:RM.renderer.capabilities.isWebGL2?'WebGL 2':'WebGL 1', veste:RM.VESTE?'sì':'no' };
}

/* ---- il giro della prova ---- */
async function prova(){
  var P=pannelloCorso(), esiti={}, info, hz, i, j, passi=GRADINI.length*(VEDUTE.length+1), fatti=0, auto=RM.qualita.stato();
  apriCitta(); await dorme(1500);
  if(PG && PG.anno) PG.anno(ANNO);
  await dorme(2500);
  /* la frequenza dello schermo: per un secondo e mezzo la città non si disegna */
  P.riga.textContent='Misuro lo schermo…'; P.sotto.textContent='Per un secondo l’immagine resta ferma.';
  RM.fuoriVista=true; await dorme(150); var mv=await misura(1500); RM.fuoriVista=false;
  var ord=mv.iv.slice().sort(function(a,b){ return a-b; }), med=ord.length?ord[ord.length>>1]:16.7; hz=Math.round(1000/med);
  if(hz>=55 && hz<=65) hz=60; else if(hz>=110 && hz<=130) hz=120; else if(hz>=27 && hz<=33) hz=30; else if(hz>=85 && hz<=95) hz=90;
  var meta=Math.min(60,hz);
  info=dati(hz);
  /* riscaldamento: un giro delle vedute e un volo in «media», senza misurare. La prima volta che un edificio o un effetto entra nell'inquadratura il browser ne prepara
     il programma per la scheda grafica, e quel fotogramma dura mezzo secondo: va pagato prima, se no pesa sul primo gradino che lo incontra */
  if(!stop){ P.riga.textContent='Preparo la città…'; P.sotto.textContent='Un giro senza misurare.'; RM.qualita.forza('media');
    for(j=0;j<VEDUTE.length && !stop;j++){ vista(VEDUTE[j].v.t,VEDUTE[j].v.c); await dorme(800); }
    vista(VEDUTE[0].v.t,VEDUTE[0].v.c); await dorme(300); var d0=RM.adatta?RM.adatta(VEDUTE[2].v):VEDUTE[2].v; RM.volaA(d0.t,d0.c,2.6); await dorme(2800); }
  for(i=0;i<GRADINI.length && !stop;i++){
    var g=GRADINI[i], parti=[], perVeduta={};
    RM.qualita.forza(g);
    P.riga.textContent='Provo: '+NOMI[g]+' · '+(i+1)+' di '+GRADINI.length; P.sotto.textContent='Preparo il gradino…';
    vista(VEDUTE[0].v.t,VEDUTE[0].v.c); await dorme(1200);
    for(j=0;j<VEDUTE.length && !stop;j++){
      var V=VEDUTE[j]; P.sotto.textContent='Veduta: '+V.nome+' ('+(j+1)+' di '+(VEDUTE.length+1)+')';
      vista(V.v.t,V.v.c); await dorme(500);      // l'ombra si rifà al primo fotogramma della veduta nuova: non si conta
      var r=riassumi(await misura(2000,function(k){ P.barra.style.width=(100*(fatti+Math.min(1,k))/passi)+'%'; }));
      perVeduta[V.n]=r; parti.push(r); fatti++;
    }
    if(!stop){
      P.sotto.textContent='Durante un volo ('+(VEDUTE.length+1)+' di '+(VEDUTE.length+1)+')';
      vista(VEDUTE[0].v.t,VEDUTE[0].v.c); await dorme(300);
      var dest=RM.adatta?RM.adatta(VEDUTE[2].v):VEDUTE[2].v; RM.volaA(dest.t,dest.c,2.6);
      var rv=riassumi(await misura(2600,function(k){ P.barra.style.width=(100*(fatti+Math.min(1,k))/passi)+'%'; }));
      perVeduta.volo=rv; parti.push(rv); fatti++;
    }
    if(parti.length){ var tot=somma(parti); esiti[g]={tot:tot, viste:perVeduta, giudizio:giudica(tot,meta), parziale:parti.length<VEDUTE.length+1};
      if(tot.fps<meta*.66 && !stop){ for(var k=i+1;k<GRADINI.length;k++) esiti[GRADINI[k]]={salto:true}; break; } }      // già troppo lento: i gradini sopra costano di più
  }
  RM.qualita.rilascia(); chiudiCitta();
  if(corso){ corso.remove(); corso=null; }
  risultato(esiti,info,meta,auto);
}

/* ---- il risultato ---- */
function risultato(esiti,info,meta,auto){
  var buono=null, i, g, e;
  for(i=0;i<GRADINI.length;i++){ e=esiti[GRADINI[i]]; if(e && e.giudizio && e.giudizio.k==='si') buono=GRADINI[i]; }
  var fuori=$('div','pq pq-fine'), carta=$('div','pq-carta'); fuori.appendChild(carta);
  carta.appendChild($('h2',null,stop?'Prova interrotta':'Risultato della prova'));
  var v=$('p','pq-verdetto');
  if(buono){ v.appendChild(document.createTextNode('Questo telefono regge bene fino a: ')); v.appendChild($('b',null,NOMI[buono])); v.appendChild(document.createTextNode('.')); }
  else if(Object.keys(esiti).length) v.textContent='Questo telefono fatica già col gradino più basso.';
  else v.textContent='La prova si è fermata prima di misurare.';
  carta.appendChild(v);
  var nota=[];
  if(info.hz<=33) nota.push('Lo schermo batte solo 30 volte al secondo: forse è acceso il risparmio energetico. Spegnilo e rifai la prova.');
  else nota.push('«Regge» vuol dire almeno '+Math.round(meta*.92)+' fotogrammi al secondo e quasi nessun salto. Lo schermo batte '+info.hz+' volte al secondo.');
  nota.push('Un intoppo isolato in una veduta (oltre un decimo di secondo) non conta nel giudizio: si vede in «Peggiore».');
  if(Object.keys(esiti).some(function(k){ return esiti[k].tot && esiti[k].tot.nascosta; })) nota.push('Durante la prova la pagina è stata nascosta: i numeri di quel gradino non valgono.');
  if(stop) nota.push('I gradini non provati restano senza numeri.');
  else if(GRADINI.some(function(k){ return esiti[k] && esiti[k].salto; })) nota.push('I gradini più alti non si provano quando uno sotto è già troppo lento: costano di più.');
  carta.appendChild($('p','pq-nota',nota.join(' ')));
  var tb=$('table'), th=$('tr');
  ['Gradino','Al secondo','Peggiore','Oltre 20 ms','Oltre 34 ms',''].forEach(function(t){ th.appendChild($('th',null,t)); });
  var thead=$('thead'); thead.appendChild(th); tb.appendChild(thead); var tbody=$('tbody'); tb.appendChild(tbody);
  GRADINI.forEach(function(g){ var e=esiti[g], tr=$('tr'); tr.appendChild($('td','g',NOMI[g]));
    if(!e || e.salto || !e.tot){ var np=$('td','esito salto','non provato'); np.colSpan=5; np.style.textAlign='center'; tr.appendChild(np); }
    else { var t=e.tot; tr.appendChild($('td',null,cifra(t.fps,0))); tr.appendChild($('td',null,cifra(t.peg,0)+' ms')); tr.appendChild($('td',null,String(t.o20))); tr.appendChild($('td',null,String(t.o34)));
      tr.appendChild($('td','esito '+e.giudizio.k,e.giudizio.t)); }
    tbody.appendChild(tr); });
  carta.appendChild(tb);
  var dl=$('dl'); [['Schermo',info.schermo+', densità '+info.densita],['Disegno',info.tela],['Frequenza',info.hz+' volte al secondo (misurata)'],['Scheda grafica',info.scheda],['Versione',info.versione],
    ['Automatica',auto.ricordato?'aveva ricordato «'+auto.ricordato+'»':(auto.misura&&auto.misura.esito?'aveva scelto «'+auto.misura.esito+'»':'non aveva ancora misurato')]].forEach(function(r){ dl.appendChild($('dt',null,r[0])); dl.appendChild($('dd',null,r[1])); });
  carta.appendChild(dl);
  var testo=testoCopia(esiti,info,buono,meta,auto), det=$('details'), sm=$('summary',null,'Tutti i numeri, veduta per veduta'), pre=$('pre',null,testo); det.appendChild(sm); det.appendChild(pre); carta.appendChild(det);
  var bt=$('div','pq-bottoni'), copia=$('button','pq-primo','Copia il risultato'), usa=$('button',null,buono?'Usa questo gradino ('+NOMI[buono]+')':'Usa il gradino «bassa»'), rifai=$('button',null,'Rifai la prova'), esci=$('button',null,'Torna alla pagina'), avv=$('p','pq-avviso');
  [copia,usa,rifai,esci].forEach(function(b){ b.type='button'; bt.appendChild(b); });
  copia.addEventListener('click',function(){ copiaTesto(testo,avv,carta); });
  usa.addEventListener('click',function(){ RM.qualita.scegli(buono||'bassa'); avv.textContent='Scelto: '+NOMI[buono||'bassa']+'. Si cambia dal bottone «Qualità» nel menu Strumenti della città.'; });
  rifai.addEventListener('click',function(){ location.reload(); });
  esci.addEventListener('click',function(){ location.href=location.pathname+location.hash; });
  carta.appendChild(bt); carta.appendChild(avv);
  document.body.appendChild(fuori); try{ copia.focus({preventScroll:true}); }catch(x){}
  window.RM_provaQualita={esiti:esiti, info:info, testo:testo, verdetto:buono};      // per le prove senza finestra
}
function testoCopia(esiti,info,buono,meta,auto){
  var r=[], NV={insieme:'insieme',media:'media dist.',vicino:'Fori vicino',volo:'volo'};
  r.push('Prova della qualità – Come finisce un impero');
  r.push('Data: '+info.data+' · versione '+info.versione);
  r.push('Schermo: '+info.schermo+', densità '+info.densita+'; finestra '+info.finestra+'; disegno '+info.tela);
  r.push('Frequenza dello schermo: '+info.hz+' Hz (misurata) · '+info.webgl+' · scheda grafica: '+info.scheda);
  r.push('Browser: '+info.browser);
  r.push('Anno della città: '+ANNO+' · automatica prima della prova: '+(auto.ricordato?'ricordato '+auto.ricordato:auto.misura&&auto.misura.esito?'misurato '+auto.misura.esito:'non misurato')+' (gradino '+auto.gradino+', periodo '+auto.periodo+' ms)');
  r.push('');
  r.push('gradino | al secondo | peggiore ms | >20 ms | >34 ms | intoppi tolti | fotogrammi | lavoro ms | giudizio');
  GRADINI.forEach(function(g){ var e=esiti[g];
    if(!e || !e.tot){ r.push(g+' | non provato'); return; }
    var t=e.tot; r.push([g,t.fps.toFixed(1),t.peg.toFixed(0),t.o20,t.o34,t.intoppi,t.n,t.lavoro.toFixed(1),e.giudizio.t.replace(/^\S+ /,'')+(e.parziale?' (parziale)':'')].join(' | ')); });
  r.push('');
  r.push('Per veduta (al secondo / peggiore ms / >20 / >34 / lavoro ms):');
  GRADINI.forEach(function(g){ var e=esiti[g]; if(!e || !e.viste) return;
    r.push(g+': '+Object.keys(e.viste).map(function(k){ var t=e.viste[k]; return NV[k]+' '+t.fps.toFixed(1)+'/'+t.peg.toFixed(0)+'/'+t.o20+'/'+t.o34+'/'+t.lavoro.toFixed(1); }).join(' · ')); });
  r.push('');
  r.push('Verdetto: '+(buono?'regge bene fino a '+buono:'fatica anche in bassa')+' (soglia: '+Math.round(meta*.92)+' al secondo, al più 5% oltre 20 ms e 1% oltre 34 ms)');
  return r.join('\n');
}
function copiaTesto(t,avv,carta){
  function aMano(){ avv.textContent='Non riesco a copiare da solo: tieni il dito sul testo qui sotto, «Seleziona tutto» e «Copia».'; var ta=$('textarea'); ta.value=t; ta.readOnly=true; carta.appendChild(ta); ta.focus(); ta.select(); }
  function vecchio(){ try{ var ta=$('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); var ok=document.execCommand('copy'); ta.remove(); if(ok) avv.textContent='Copiato. Ora incollalo nel messaggio.'; else aMano(); }catch(e){ aMano(); } }
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ avv.textContent='Copiato. Ora incollalo nel messaggio.'; },vecchio); else vecchio();
}

RM.provaQualita={ ferma:function(){ stop=true; } };
prova().catch(function(e){ try{ RM.qualita.rilascia(); chiudiCitta(); }catch(x){} if(corso) corso.remove(); var d=$('div','pq pq-corso'); d.textContent='La prova si è fermata per un errore: '+(e&&e.message||e); document.body.appendChild(d); });
})();
