/* Prova di una scena animata della città, per il telefono di chi guarda (25 novembre 2026; l'utente, sull'iPhone: «Figure e scena 800, leggermente a scatti su iPhone»).
   Si apre con l'indirizzo ?prova=scena&anno=800 (anche 312, 410, 455, 493, 546, 846, 852: le scene animate di js/scene-tappe.js; negli altri anni dice quali ci sono); js/base.js carica questo file
   solo allora, a pagina caricata. Porta la pagina alla tappa di quell'anno, apre la città a tutto schermo e fa girare la scena dall'inizio alla fine, come la regia.
   Per ogni tempo della scena (le righe in alto, «2 · L'omaggio del papa»…) conta i fotogrammi al secondo, l'intervallo peggiore fra due fotogrammi, quanti superano i 20 e
   i 34 millesimi (a 60 al secondo un fotogramma dura 16,7 millesimi: oltre 20 se n'è saltato uno, oltre 34 due), il lavoro del processore per fotogramma (tutto, e la parte
   dei moduli: animazioni, folla, regia), i disegni e i triangoli di un fotogramma, quante volte si è rifatta la mappa delle ombre e la tela della pagina, il gradino e la densità.
   In fondo il dispositivo, lo schermo, la scheda grafica se il browser la dice, la versione; «Copia il risultato» mette tutto negli appunti. Nessun dato va in rete.
   ?gradino=media tiene fermo un gradino per tutta la prova (senza, decide l'automatica, come nella pagina normale). Il risultato resta anche in RM.provaScena.risultato. */
(function(){
'use strict';
var RM=window.RM, PG=window.RM_pagina, D=window.RM_DATI; if(!RM || RM.guasto || !RM.camera || !RM.scenaProva) return;
function cerca(k){ var r=new RegExp('[?&]'+k+'=([^&#]+)').exec(location.search); return r?decodeURIComponent(r[1]):null; }
var ANNO=+(cerca('anno')||800), GRADINO=cerca('gradino');
function dorme(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function $(t,c,testo){ var e=document.createElement(t); if(c) e.className=c; if(testo!=null) e.textContent=testo; return e; }
function cifra(v,d){ return (+v).toFixed(d==null?1:d).replace('.',','); }
function mediana(a){ if(!a.length) return 0; var b=a.slice().sort(function(x,y){ return x-y; }); return b[b.length>>1]; }

var css=$('style'); css.textContent=[
  '.ps{position:fixed;z-index:9000;font-family:var(--ui,system-ui,sans-serif);color:var(--ink,#221C18);}',
  '.ps-corso{left:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));max-width:min(70vw,320px);background:rgba(255,255,255,.9);border:1px solid var(--line,#E3DDD2);border-radius:10px;padding:6px 10px;font-size:13px;line-height:1.3;pointer-events:auto;}',
  '.ps-corso b{color:var(--porpora,#7A1F2B);}',
  '.ps button{font:600 15px/1 var(--ui,system-ui);padding:11px 16px;border-radius:999px;border:1px solid var(--line,#E3DDD2);background:#fff;color:var(--porpora,#7A1F2B);cursor:pointer;min-height:44px;}',
  '.ps button.ps-primo{background:var(--porpora,#7A1F2B);border-color:var(--porpora,#7A1F2B);color:#fff;}',
  '.ps-fine{top:0;bottom:0;left:0;right:0;overflow:auto;-webkit-overflow-scrolling:touch;background:rgba(246,244,239,.97);padding:calc(16px + env(safe-area-inset-top,0px)) 12px calc(24px + env(safe-area-inset-bottom,0px));box-sizing:border-box;}',
  '.ps-carta{max-width:760px;margin:0 auto;background:#fff;border:1px solid var(--line,#E3DDD2);border-radius:14px;padding:16px 12px 18px;}',
  '.ps-carta h2{font:600 19px/1.2 var(--cap,Georgia,serif);letter-spacing:.04em;margin:0 0 10px;}',
  '.ps-nota{font-size:14px;line-height:1.45;color:var(--muted,#5F554B);margin:0 0 12px;}',
  '.ps-tab{overflow-x:auto;margin:0 0 14px;} .ps table{border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums;min-width:100%;}',
  '.ps th{font-weight:600;font-size:11px;color:var(--muted,#5F554B);text-align:right;padding:5px 4px;border-bottom:1px solid var(--line,#E3DDD2);line-height:1.2;}',
  '.ps td{text-align:right;padding:7px 4px;border-bottom:1px solid var(--line,#E3DDD2);white-space:nowrap;}',
  '.ps th:first-child,.ps td:first-child{text-align:left;white-space:normal;min-width:8em;}',
  '.ps .no{color:#9A2F2A;font-weight:600;} .ps .si{color:#2f6b3a;}',
  '.ps dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;margin:0 0 14px;} .ps dt{color:var(--muted,#5F554B);} .ps dd{margin:0;overflow-wrap:anywhere;}',
  '.ps-bottoni{display:flex;flex-wrap:wrap;gap:8px;} .ps-avviso{font-size:14px;margin:10px 0 0;min-height:1.2em;} .ps textarea{width:100%;height:140px;font-size:12px;margin-top:8px;}'
].join('\n'); document.head.appendChild(css);

/* ---- le misure, a ogni fotogramma ---- */
var R=RM.renderer, info=R.info, SM=R.shadowMap, ombre=0, ombraOra=false;
/* la mappa delle ombre si rifà quando three.js rimette needsUpdate a falso dopo averla disegnata: si contano quei passaggi */
(function(){ var v=SM.needsUpdate; try{ Object.defineProperty(SM,'needsUpdate',{configurable:true, get:function(){ return v; }, set:function(x){ if(v===true && x===false){ ombre++; ombraOra=true; } v=x; }}); }catch(e){} })();
/* il tempo dei moduli (RM.frame: animazioni, folla, regia, scene): ogni funzione misurata a parte */
var costi=[], tModuli=0;
function avvolgi(){ for(var i=0;i<RM.frame.length;i++){ var f=RM.frame[i]; if(f.__ps) continue;
  (function(f,i){ var c=costi[i]={f:f, ms:0, max:0, nome:String(f).replace(/\s+/g,' ').slice(0,70)}; var g=function(dt){ var t0=performance.now(); try{ return f(dt); } finally { var d=performance.now()-t0; c.ms+=d; if(d>c.max) c.max=d; tModuli+=d; } }; g.__ps=true; RM.frame[i]=g; })(f,i); } }
info.autoReset=false;
var prima=0, fot=[], tela0=null, cambiTela=0;
var testa=function(){      // in testa a RM.frame: chiude il fotogramma di prima (disegni e triangoli di tutto il fotogramma, ombre e passate comprese) e ne apre uno nuovo
  ultimo={calls:info.render.calls, tri:info.render.triangles}; info.reset(); }; testa.__ps=true; RM.frame.unshift(testa);
function giro(ts){
  if(!corsa) return; requestAnimationFrame(giro);
  var cv=R.domElement, tl=cv.width+'x'+cv.height; if(tela0 && tl!==tela0) cambiTela++; tela0=tl;
  if(prima && !document.hidden){ var o=RM.scenaProva.corrente();
    if(o && o.t!=null && fot.length && fot[fot.length-1].t!=null && o.t<fot[fot.length-1].t-1){ fot.length=0; ombre=0; cambiTela=0; costi.forEach(function(c){ if(c){ c.ms=0; c.max=0; } }); ripartenze++; }      // la scena è ripartita da capo (la regia della tappa, arrivata dopo): si ricomincia a contare
    fot.push({iv:ts-prima, lav:RM.lavoro||0, mod:tModuli, calls:ultimo.calls, tri:ultimo.tri, ombra:ombraOra, t:o?o.t:null, g:RM.qualita?RM.qualita.nome():'', d:R.getPixelRatio(), tela:tl}); }
  ombraOra=false; tModuli=0; prima=ts;
}
var ultimo={calls:0,tri:0}, corsa=false, ripartenze=0;

/* ---- la scena ---- */
function apriCitta(){
  var bt=document.querySelector('.schede button[data-vista="roma"]'); if(bt) bt.click();
  if(!document.body.classList.contains('roma-grande')){ var g=document.getElementById('btnGrande'); if(g) g.click(); }
}
function tappa(){ var T=D&&D.TAPPE||[], i; for(i=0;i<T.length;i++) if(T[i].anno===ANNO && !T[i].intermezzo) return i; return -1; }
var corso=null;
function stato(t){ if(!corso){ corso=$('div','ps ps-corso'); corso.setAttribute('role','status'); document.body.appendChild(corso); } corso.innerHTML=t; }

async function prova(){
  stato('<b>Prova della scena '+ANNO+'</b> · preparo la città…');
  var i=tappa(); if(i<0){ stato('Nessuna tappa per l’anno '+ANNO); return; }
  if(GRADINO && RM.qualita && RM.qualita.forza) RM.qualita.forza(GRADINO);
  /* interruttori per cercare che cosa fa tremare o rallentare (26 novembre 2026): &ombre=0 niente ombre del sole, &appoggio=0 niente macchie d'appoggio sotto i piedi,
     &lumi=0 niente luce dei lumi né aloni (scena dell'800) */
  if(cerca('ombre')==='0'){ var luci=[]; RM.scene.traverse(function(o){ if(o.isDirectionalLight) luci.push(o); }); RM.frame.push(function(){ luci.forEach(function(l){ l.castShadow=false; }); }); }      // a ogni fotogramma: la qualità le riaccenderebbe
  if(cerca('appoggio')==='0' && RM.interruttori800) RM.interruttori800('appoggio');
  if(cerca('lumi')==='0' && RM.interruttori800) RM.interruttori800('lumi');
  apriCitta(); await dorme(600);
  if(PG && PG.tappa()!==i) PG.vai(i,true);
  await dorme(4000);      // la città si ricostruisce per l'anno, le scene si accendono
  avvolgi();
  var ok=RM.scenaProva.avvia(ANNO); if(!ok){ RM.provaScena.risultato={errore:'nessuna scena animata nel '+ANNO}; stato('Nell’anno '+ANNO+' non c’è una scena animata. Anni: '+RM.scenaProva.anni().filter(function(a){ return a!==801 && a!==589 && a!==791; }).join(', ')); return; }
  var o=RM.scenaProva.corrente(); if(!o){ RM.provaScena.risultato={errore:'la scena non è partita'}; stato('La scena non è partita (meno animazioni?)'); return; }
  corsa=true; requestAnimationFrame(giro);
  var t0=performance.now(), ferma=0;
  while(true){ await dorme(250); var oo=RM.scenaProva.corrente(), tt=oo&&oo.t!=null?oo.t:o.fine;
    stato('<b>Prova della scena '+ANNO+'</b> · '+cifra(Math.max(0,tt),0)+' di '+cifra(o.fine,0)+' s · '+(RM.qualita?RM.qualita.nome():'')+' · densità '+cifra(R.getPixelRatio(),2));
    if(!oo || oo.t==null){ if(++ferma>12) break; } else ferma=0;      // ferma da tre secondi: interrotta
    if((oo && oo.t>=o.fine) || performance.now()-t0>(o.fine+o.attesa+40)*1000) break; }
  await dorme(500); corsa=false;
  if(GRADINO && RM.qualita && RM.qualita.rilascia) RM.qualita.rilascia();
  fine(o);
}
/* ---- i tempi della scena: le righe in alto (o le azioni della regia, se la scena non ha righe) ---- */
function tempi(o){
  var L=(o.righe&&o.righe.length?o.righe.map(function(q,k){ return [q[0], q[2]||q[1]||('tempo '+(k+1))]; }):(o.azioni||[]).map(function(q,k){ return [q[0],'azione '+(k+1)]; }));
  if(!L.length || L[0][0]>0) L.unshift([-99,'inizio']);
  L[0][0]=-99; return L; }
function riassumi(lista){
  var n=lista.length, s=0, peg=0, o20=0, o34=0, l=0, m=0, om=0, k; if(!n) return null;
  for(k=0;k<n;k++){ var f=lista[k]; s+=f.iv; if(f.iv>peg) peg=f.iv; if(f.iv>20) o20++; if(f.iv>34) o34++; l+=f.lav; m+=f.mod; if(f.ombra) om++; }
  var g={}; lista.forEach(function(f){ var c=f.g+' '+cifra(f.d,2).replace(/,?0+$/,''); g[c]=(g[c]||0)+1; });
  return {n:n, dur:s/1000, fps:1000*n/s, peg:peg, o20:o20, o34:o34, lav:l/n, lavMax:Math.max.apply(null,lista.map(function(f){ return f.lav; })), mod:m/n, calls:mediana(lista.map(function(f){ return f.calls; })), tri:mediana(lista.map(function(f){ return f.tri; })), ombre:om,
    gradi:Object.keys(g).map(function(c){ return c+(Object.keys(g).length>1?' ('+g[c]+')':''); }).join(', '), tele:Object.keys(lista.reduce(function(a,f){ a[f.tela]=1; return a; },{})).length};
}
function scheda(){ try{ var gl=R.getContext(), e=gl.getExtension('WEBGL_debug_renderer_info'); return String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)); }catch(x){ return 'non detta dal browser'; } }
function precisione(){ try{ var gl=R.getContext(), f=gl.FRAGMENT_SHADER; function p(t){ var x=gl.getShaderPrecisionFormat(f,t); return x?x.precision+' bit':'?'; } return 'mediump '+p(gl.MEDIUM_FLOAT)+', highp '+p(gl.HIGH_FLOAT); }catch(e){ return '?'; } }
function fine(o){
  var L=tempi(o), righe=L.map(function(q,k){ var a=q[0], b=k+1<L.length?L[k+1][0]:1e9; return {nome:q[1], r:riassumi(fot.filter(function(f){ return f.t!=null && f.t>=a && f.t<b; }))}; }).filter(function(x){ return x.r; });
  var tutto=riassumi(fot.filter(function(f){ return f.t!=null; }));
  var care=costi.filter(function(c){ return c; }).sort(function(a,b){ return b.ms-a.ms; }).slice(0,5);
  var dati={ dispositivo:navigator.userAgent, schermo:screen.width+' × '+screen.height+' punti, densità '+cifra(window.devicePixelRatio||1,2).replace(/,00$/,''), finestra:window.innerWidth+' × '+window.innerHeight,
    scheda:scheda(), precisione:precisione(), versione:RM.versione||'(senza versione)', gradino:GRADINO?'fisso «'+GRADINO+'»':'automatica', data:new Date().toLocaleString('it-IT') };
  RM.provaScena.risultato={anno:ANNO, righe:righe, tutto:tutto, care:care.map(function(c){ return {ms:+(c.ms/Math.max(1,fot.length)).toFixed(3), max:+c.max.toFixed(1), nome:c.nome}; }), dati:dati, cambiTela:cambiTela, ombre:ombre, ripartenze:ripartenze};
  var testo=aTesto(RM.provaScena.risultato);
  if(corso) corso.remove();
  var fuori=$('div','ps ps-fine'), carta=$('div','ps-carta'); fuori.appendChild(carta);
  carta.appendChild($('h2',null,'Prova della scena · '+ANNO));
  carta.appendChild($('p','ps-nota','Una riga per ogni tempo della scena. «Fot./s»: fotogrammi al secondo; «>20» e «>34»: fotogrammi saltati (uno e due); «JS»: millesimi di lavoro del processore per fotogramma (fra parentesi i moduli: animazioni e folla); «Ombre»: quante volte si è rifatta la mappa delle ombre.'));
  var tw=$('div','ps-tab'), tb=$('table'), th=$('tr'); ['Tempo','s','Fot./s','Peggiore','>20','>34','JS ms','Disegni','Triangoli','Ombre','Gradino'].forEach(function(t){ th.appendChild($('th',null,t)); }); tb.appendChild(th);
  righe.concat([{nome:'Tutta la scena', r:tutto}]).forEach(function(x){ var r=x.r, tr=$('tr'); if(!r) return;
    [x.nome, cifra(r.dur,1), cifra(r.fps,0), cifra(r.peg,0)+' ms', String(r.o20), String(r.o34), cifra(r.lav,1)+' ('+cifra(r.mod,1)+')', String(r.calls), cifra(r.tri/1e6,2)+' M', String(r.ombre), r.gradi].forEach(function(v,k){ var td=$('td',k===2?(r.fps<55?'no':'si'):null,v); tr.appendChild(td); }); tb.appendChild(tr); });
  tw.appendChild(tb); carta.appendChild(tw);
  var dl=$('dl'); [['Dispositivo',dati.dispositivo],['Schermo',dati.schermo],['Finestra',dati.finestra],['Scheda grafica',dati.scheda],['Precisione',dati.precisione],['Qualità',dati.gradino],['Tela rifatta',cambiTela+' volte'],['Versione',dati.versione],['Data',dati.data]].forEach(function(q){ dl.appendChild($('dt',null,q[0])); dl.appendChild($('dd',null,q[1])); }); carta.appendChild(dl);
  var bt=$('div','ps-bottoni'), copia=$('button','ps-primo','Copia il risultato'), rifai=$('button',null,'Rifai la prova'), esci=$('button',null,'Torna alla pagina'), avv=$('p','ps-avviso');
  [copia,rifai,esci].forEach(function(b){ b.type='button'; bt.appendChild(b); });
  copia.addEventListener('click',function(){ copiaTesto(testo,avv,carta); });
  rifai.addEventListener('click',function(){ location.reload(); });
  esci.addEventListener('click',function(){ location.href=location.pathname+'#'+ANNO; });
  carta.appendChild(bt); carta.appendChild(avv); document.body.appendChild(fuori);
}
function aTesto(q){
  var r=['Prova della scena '+q.anno+' — «Come finisce un impero»','Tempo | s | fot./s | peggiore ms | >20 | >34 | JS ms (moduli) | disegni | triangoli | ombre | gradino'];
  q.righe.concat([{nome:'TUTTA', r:q.tutto}]).forEach(function(x){ var t=x.r; if(t) r.push([x.nome,cifra(t.dur,1),cifra(t.fps,1),cifra(t.peg,0),t.o20,t.o34,cifra(t.lav,1)+' ('+cifra(t.mod,1)+')',t.calls,cifra(t.tri/1e6,2)+'M',t.ombre,t.gradi].join(' | ')); });
  r.push('Tela rifatta: '+q.cambiTela+' volte; ombre rifatte in tutto: '+q.ombre);
  r.push('Moduli più cari (ms per fotogramma): '+q.care.map(function(c){ return cifra(c.ms,2)+' (al più '+cifra(c.max,1)+') «'+c.nome+'»'; }).join(' · '));
  Object.keys(q.dati).forEach(function(k){ r.push(k+': '+q.dati[k]); });
  return r.join('\n');
}
function copiaTesto(t,avv,carta){
  function aMano(){ avv.textContent='Non riesco a copiare da solo: tieni il dito sul testo qui sotto, «Seleziona tutto» e «Copia».'; var ta=$('textarea'); ta.value=t; ta.readOnly=true; carta.appendChild(ta); ta.focus(); ta.select(); }
  function vecchio(){ try{ var ta=$('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); var ok=document.execCommand('copy'); ta.remove(); if(ok) avv.textContent='Copiato. Ora incollalo nel messaggio.'; else aMano(); }catch(e){ aMano(); } }
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ avv.textContent='Copiato. Ora incollalo nel messaggio.'; },vecchio); else vecchio();
}
RM.provaScena={ risultato:null };
prova().catch(function(e){ corsa=false; stato('La prova si è fermata per un errore: '+(e&&e.message||e)); });
})();
