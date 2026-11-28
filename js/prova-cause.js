/* ?prova=cause: che cosa rallenta la città su questo dispositivo (28 novembre 2026, sesto giro della fluidità sul telefono; le prime misure vere dall'iPhone dell'utente
   dicevano 26-28 fotogrammi al secondo nell'800 a scena ferma e 9-12 durante le scene con figure, e il banco sul PC non lo riproduce). Caricato da js/base.js solo con il
   parametro. Alla qualità scelta da chi guarda (il bottone «Qualità» o ?qualita=…), apre la città a tutto schermo e, per ogni caso (800 a scena ferma, 439 durante la corsa
   nel Circo e, se scelti, 846 e 852 durante la scena), misura tre secondi con tutto acceso, poi spegne una cosa per volta per tre secondi e la riaccende: le figure delle scene,
   la gente comune, il fumo, le case, i monumenti, i rifacimenti della mappa delle ombre, l'occlusione, la patina, la veste, le ottimizzazioni di RM.fluido, la scala adattiva
   (piena e a metà dei lati), la preparazione dei programmi, gli effetti a tutto schermo (per ultimi: spegnerli può far preparare di nuovo i programmi). Nei casi fermi la camera
   gira piano da sola. Per ogni riga: fotogrammi al secondo, fotogramma peggiore, lavoro del processore nel ciclo della città (RM.lavoro), disegni e chilobyte caricati sulla
   scheda grafica per fotogramma; in fondo una riga con l'attesa della scheda grafica (gl.finish dopo il disegno: se è lunga, il freno è la scheda grafica e non il processore).
   Alla fine una tabella e «Copia». Nulla va in rete. Si interrompe col bottone «Interrompi». */
(function(){
'use strict';
var RM=window.RM, PG=window.RM_pagina; if(!RM || !RM.renderer || !RM.camera || !PG) return;
function dorme(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function $(t,c,testo){ var e=document.createElement(t); if(c) e.className=c; if(testo!=null) e.textContent=testo; return e; }
function cifra(v,d){ return (+v).toFixed(d==null?1:d).replace('.',','); }
var R=RM.renderer, gl=R.getContext();

/* il contatore leggero delle chiamate (lo stesso di js/misura.js): disegni e byte caricati, nient'altro */
var CG=window.RM_contaGL||(window.RM_contaGL=(function(){ var c={d:0,b:0};
  [window.WebGL2RenderingContext,window.WebGLRenderingContext].forEach(function(K){ if(!K) return; var P=K.prototype;
    ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced','drawRangeElements'].forEach(function(n){ var f=P[n]; if(!f||f.__rm) return; P[n]=function(){ c.d++; return f.apply(this,arguments); }; P[n].__rm=1; });
    ['bufferData','bufferSubData','texImage2D','texSubImage2D','texImage3D','texSubImage3D'].forEach(function(n){ var f=P[n]; if(!f||f.__rm) return;
      P[n]=function(){ for(var i=arguments.length-1;i>=0;i--){ var x=arguments[i]; if(x && x.byteLength!==undefined){ c.b+=(n==='bufferSubData'&&arguments.length>=5&&arguments[4])?arguments[4]*(x.BYTES_PER_ELEMENT||1):x.byteLength; break; } if(x && x.width){ c.b+=x.width*x.height*4; break; } } return f.apply(this,arguments); }; P[n].__rm=1; }); });
  return c; })());

var css=$('style'); css.textContent=[
  '.pc{position:fixed;z-index:9000;left:50%;transform:translateX(-50%);font-family:var(--ui,system-ui,sans-serif);color:var(--ink,#221C18);}',
  '.pc-corso{top:calc(10px + env(safe-area-inset-top,0px));width:min(92vw,440px);background:rgba(255,255,255,.95);border:1px solid var(--line,#E3DDD2);border-radius:12px;padding:12px 14px;box-sizing:border-box;}',
  '.pc h2{font:600 13px/1.2 var(--ui,system-ui);letter-spacing:.04em;text-transform:uppercase;color:var(--porpora,#7A1F2B);margin:0 0 6px;}',
  '.pc-riga{font-size:16px;font-weight:600;margin:0 0 4px;} .pc-sotto{font-size:13px;color:var(--muted,#5F554B);margin:0 0 8px;}',
  '.pc label{display:block;font-size:14px;margin:4px 0;} .pc input{margin-right:6px;}',
  '.pc button{font:600 15px/1 var(--ui,system-ui);padding:11px 16px;border-radius:999px;border:1px solid var(--line,#E3DDD2);background:#fff;color:var(--porpora,#7A1F2B);min-height:44px;margin:6px 6px 0 0;}',
  '.pc button.pc-primo{background:var(--porpora,#7A1F2B);border-color:var(--porpora,#7A1F2B);color:#fff;}',
  '.pc-fine{top:0;bottom:0;left:0;width:100%;transform:none;overflow:auto;-webkit-overflow-scrolling:touch;background:rgba(246,244,239,.97);padding:calc(14px + env(safe-area-inset-top,0px)) 12px 24px;box-sizing:border-box;}',
  '.pc table{border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums;margin:0 0 14px;width:100%;}',
  '.pc th,.pc td{padding:5px 3px;border-bottom:1px solid var(--line,#E3DDD2);text-align:right;white-space:nowrap;} .pc th:first-child,.pc td:first-child{text-align:left;white-space:normal;}',
  '.pc textarea{width:100%;height:120px;font-size:11px;}',
  '.pc-senza-scritte .etichette3d,.pc-senza-scritte .strade3d,.pc-senza-scritte .colli3d,.pc-senza-scritte .capi3d,.pc-senza-scritte .riga-tempo,.pc-senza-scritte .riquadro.roma .evento,.pc-senza-scritte #misuraRiga{display:none!important}'].join('\n'); document.head.appendChild(css);

/* ---- che cosa si spegne: oggetti nascosti solo durante il disegno (scene.onBeforeRender / onAfterRender), così chi li riaccende a ogni fotogramma non conta ---- */
var nascondi=[], nascosti=[], ombreFerme=false, gira=false, finisci=false, attesaGpu=[];
var sc=RM.scene, pB=sc.onBeforeRender, pA=sc.onAfterRender;
sc.onBeforeRender=function(){ for(var i=0;i<nascondi.length;i++){ var o=nascondi[i]; if(o.visible){ o.visible=false; nascosti.push(o); } }
  if(ombreFerme) R.shadowMap.needsUpdate=false; if(pB) pB.apply(this,arguments); };
sc.onAfterRender=function(){ if(pA) pA.apply(this,arguments); for(var i=0;i<nascosti.length;i++) nascosti[i].visible=true; nascosti.length=0; };
function gruppo(nome){ var L=[]; sc.children.forEach(function(o){ var g=o.userData&&o.userData.gruppo; if(g===nome) L.push(o); }); return L; }
function figureScene(){ var L=[], P=(RM.figureScene&&RM.figureScene.parti)||{};
  Object.keys(P).forEach(function(n){ P[n].forEach(function(q){ if(q.tipo==='blocco') q.coppie.forEach(function(c){ L.push(c.g); }); else { if(q.mS) L.push(q.mS); (q.vari||[]).forEach(function(w){ L.push(w.m); }); } }); });
  if(RM.provaCorse && RM.provaCorse.gruppi){ L.push(RM.provaCorse.gruppi.circo, RM.provaCorse.gruppi.stadio); }
  return L; }
function vita(punti){ return gruppo('vita').filter(function(o){ return punti?o.isPoints:!o.isPoints; }); }
var salva={};
var PASSI=[
  {k:'tutto', n:'tutto acceso', su:function(){}, giu:function(){}},
  {k:'figure', n:'senza le figure delle scene (e le corse, i giochi)', su:function(){ nascondi=figureScene(); salva.g=RM.senzaGiochi; RM.senzaGiochi=true; }, giu:function(){ nascondi=[]; RM.senzaGiochi=salva.g; }},
  {k:'gente', n:'senza la gente comune (figure vicine, carri, barche)', su:function(){ nascondi=vita(false); }, giu:function(){ nascondi=[]; }},
  {k:'punti', n:'senza i punti lontani (gente e fumo)', su:function(){ nascondi=vita(true); }, giu:function(){ nascondi=[]; }},
  {k:'case', n:'senza le case e le rovine', su:function(){ nascondi=gruppo('citta'); }, giu:function(){ nascondi=[]; }},
  {k:'monumenti', n:'senza i monumenti', su:function(){ nascondi=gruppo('monumenti'); }, giu:function(){ nascondi=[]; }},
  {k:'altro', n:'senza ciò che non ha gruppo (scene, mura, chiese, acqua)', su:function(){ nascondi=sc.children.filter(function(o){ return !o.isLight && !(o.userData&&o.userData.gruppo); }); }, giu:function(){ nascondi=[]; }},
  {k:'scritte', n:'senza le scritte sulla scena (nomi, cartellini, didascalie)', su:function(){ document.body.classList.add('pc-senza-scritte'); }, giu:function(){ document.body.classList.remove('pc-senza-scritte'); }},
  {k:'ombre', n:'mappa delle ombre mai rifatta', su:function(){ ombreFerme=true; }, giu:function(){ ombreFerme=false; R.shadowMap.needsUpdate=true; }},
  {k:'ao', n:'senza occlusione', su:function(){ if(RM.post){ salva.ao=RM.post.ao.value; RM.post.ao.value=0; } }, giu:function(){ if(RM.post) RM.post.ao.value=salva.ao; }},
  {k:'patina', n:'senza patina', su:function(){ salva.pt=(RM.patinaMat||[]).map(function(m){ var v=m.userData.patina.value; m.userData.patina.value=0; return v; }); }, giu:function(){ (RM.patinaMat||[]).forEach(function(m,i){ m.userData.patina.value=salva.pt[i]; }); }},
  {k:'veste', n:'senza veste', su:function(){ if(RM.vesteU){ salva.v=RM.vesteU.value; RM.vesteU.value=0; } }, giu:function(){ if(RM.vesteU) RM.vesteU.value=salva.v; }},
  {k:'fluido', n:'senza le ottimizzazioni di RM.fluido', su:function(){ salva.f={}; for(var k in RM.fluido){ salva.f[k]=RM.fluido[k]; RM.fluido[k]=false; } }, giu:function(){ for(var k in salva.f) RM.fluido[k]=salva.f[k]; }},
  {k:'piena', n:'scala adattiva ferma a 1 (tutti i pixel)', su:function(){ if(RM.scalaAdatta) RM.scalaAdatta.forza(1); }, giu:function(){ if(RM.scalaAdatta) RM.scalaAdatta.forza(); }},
  {k:'meta', n:'metà dei lati (un quarto dei pixel)', su:function(){ if(RM.scalaAdatta) RM.scalaAdatta.forza(.5); }, giu:function(){ if(RM.scalaAdatta) RM.scalaAdatta.forza(); }},
  {k:'prep', n:'preparazione dei programmi ferma', su:function(){ RM.preparaPausa=true; }, giu:function(){ RM.preparaPausa=false; }},
  {k:'gpu', n:'attesa della scheda grafica (gl.finish dopo il disegno)', su:function(){ finisci=true; attesaGpu=[]; }, giu:function(){ finisci=false; }},
  {k:'effetti', n:'senza effetti a tutto schermo (per ultimo)', attesa:2500, su:function(){ if(RM.post){ salva.p=RM.post.attivo; RM.post.attivo=false; } }, giu:function(){ if(RM.post) RM.post.attivo=salva.p; }},
  {k:'tutto2', n:'tutto acceso, di nuovo', su:function(){}, giu:function(){}}
];
var CASI=[
  {k:'800', n:'800, scena ferma', anno:800, ferma:true, vista:{t:[-236,-112], d:95, az:140, el:28}},
  {k:'439', n:'439, durante la corsa nel Circo', anno:439, ferma:true, mon:'circo', d:36, el:34},
  {k:'846', n:'846, durante la scena', anno:846, scena:846, scelta:false},
  {k:'852', n:'852, durante la scena', anno:852, scena:852, scelta:false}
];

/* ---- la misura: intervalli fra due fotogrammi (requestAnimationFrame), lavoro del ciclo, disegni e byte ---- */
var stop=false;
function misura(ms){ return new Promise(function(fatto){ var iv=[], lav=[], prima=0, t0=0, d0=CG.d, b0=CG.b;
  function giro(ts){ if(prima){ iv.push(ts-prima); if(RM.lavoro!=null) lav.push(RM.lavoro); } prima=ts; if(!t0) t0=ts;
    if(gira){ var c=RM.camera.position, t=RM.controlli.target, a=.00007*Math.min(50,iv.length?iv[iv.length-1]:16), dx=c.x-t.x, dz=c.z-t.z, ca=Math.cos(a), sa=Math.sin(a); c.x=t.x+dx*ca-dz*sa; c.z=t.z+dx*sa+dz*ca; RM.controlli.update(); }      // la camera gira piano (circa 4 gradi al secondo)
    if(finisci){ var f0=performance.now(); gl.finish(); attesaGpu.push(performance.now()-f0); }
    if(ts-t0<ms && !stop) requestAnimationFrame(giro); else { var n=iv.length, s=0, mx=0, l=0, i; for(i=0;i<n;i++){ s+=iv[i]; if(iv[i]>mx) mx=iv[i]; } for(i=0;i<lav.length;i++) l+=lav[i];
      var g=0; for(i=0;i<attesaGpu.length;i++) g+=attesaGpu[i];
      fatto({n:n, fps:s?1000*n/s:0, peg:mx, lav:lav.length?l/lav.length:0, d:n?(CG.d-d0)/(n+1):0, kb:n?(CG.b-b0)/(n+1)/1024:0, gpu:attesaGpu.length?g/attesaGpu.length:null}); } }
  requestAnimationFrame(giro); }); }

function apriCitta(){ var bt=document.querySelector('.schede button[data-vista="roma"]'); if(bt) bt.click();
  if(!document.body.classList.contains('roma-grande')){ var g=document.getElementById('btnGrande'); if(g) g.click(); }
  RM.senzaGiro=true; RM.controlli.autoRotate=false; }
function guarda(x,z,d,az,el){ var y=(RM.hSuolo?RM.hSuolo(x,z):RM.h(x,z))+1, a=az*Math.PI/180, e=el*Math.PI/180; RM.controlli.target.set(x,y,z); RM.camera.position.set(x+Math.sin(a)*Math.cos(e)*d, y+Math.sin(e)*d, z+Math.cos(a)*Math.cos(e)*d); RM.controlli.update(); }
function tappa(anno){ var i=window.RM_indirizzi?RM_indirizzi.tappa('#'+anno):(RM_DATI.TAPPE||[]).findIndex(function(t){ return t.anno===anno && !t.intermezzo; }); return i; }
async function arriva(anno){ if(Math.round(PG.annoOra())!==anno || (RM_DATI.TAPPE[PG.tappa()]||{}).anno!==anno) PG.vai(tappa(anno)); await dorme(1500);
  for(var k=0;k<60 && RM.arrivoInCorso && RM.arrivoInCorso();k++) await dorme(250); await dorme(1500); }
async function prepara(c){
  if(c.ferma){ await arriva(c.anno); if(RM.scenaProva && RM.scenaProva.finisci) RM.scenaProva.finisci();
    if(c.mon){ var m=(RM.MONUMENTI||[]).filter(function(x){ return x.id===c.mon; })[0]; if(m) guarda(m.x,m.z,c.d,215,c.el); }
    else guarda(c.vista.t[0],c.vista.t[1],c.vista.d,c.vista.az,c.vista.el);
    gira=true; await dorme(800); return; }
  gira=false; await arriva(c.anno); }
async function passo(c,P){
  if(c.scena && RM.scenaProva){ RM.scenaProva.avvia(c.scena); await dorme(2300); }      // la scena da capo: si misura lo stesso tratto (dal mezzo secondo al terzo e mezzo)
  P.su(); await dorme(P.attesa||600); var r=await misura(3000); P.giu(); await dorme(300); return r; }

var esiti=[], corso=null;
function pannello(){ var d=$('div','pc pc-corso'); d.setAttribute('role','status'); d.setAttribute('aria-live','polite');
  d.appendChild($('h2',null,'Prova delle cause'));
  var r=$('p','pc-riga','Che cosa rallenta la città su questo dispositivo'), s=$('p','pc-sotto','Alla qualità scelta adesso ('+((RM.qualita&&RM.qualita.stato)?RM.qualita.stato().gradino:'?')+'). Tieni il telefono fermo e lo schermo acceso; non toccare la città. Circa un minuto per caso.');
  d.appendChild(r); d.appendChild(s);
  var scelte=CASI.map(function(c){ var l=$('label'), i=$('input'); i.type='checkbox'; i.checked=c.scelta!==false; l.appendChild(i); l.appendChild(document.createTextNode(c.n)); d.appendChild(l); return i; });
  var via=$('button','pc-primo','Avvia'), x=$('button',null,'Interrompi'); via.type=x.type='button'; x.hidden=true; d.appendChild(via); d.appendChild(x);
  x.addEventListener('click',function(){ stop=true; x.disabled=true; x.textContent='Mi fermo…'; });
  via.addEventListener('click',function(){ via.hidden=true; x.hidden=false; scelte.forEach(function(i){ i.disabled=true; }); vai(CASI.filter(function(c,j){ return scelte[j].checked; }),r,s); });
  document.body.appendChild(d); corso=d; }
async function vai(casi,r,s){
  apriCitta(); await dorme(1200);
  for(var i=0;i<casi.length && !stop;i++){ var c=casi[i]; r.textContent=c.n+': preparo'; s.textContent='';
    await prepara(c);
    for(var j=0;j<PASSI.length && !stop;j++){ var P=PASSI[j]; r.textContent=c.n+' ('+(j+1)+' di '+PASSI.length+')'; s.textContent=P.n;
      var e=await passo(c,P); e.caso=c.n; e.passo=P.n; e.k=P.k; esiti.push(e); } }
  gira=false; nascondi=[]; ombreFerme=false; finisci=false; RM.senzaGiro=false; fine(); }
function testo(){ var cv=R.domElement, e=gl.getExtension('WEBGL_debug_renderer_info'), sg=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'?';
  var L=['Come finisce un impero, prova delle cause ('+(RM.versione||'?')+')','Browser: '+navigator.userAgent,'Schermo: '+screen.width+' x '+screen.height+' punti, densità '+(window.devicePixelRatio||1)+'; tela '+cv.width+' x '+cv.height+'; scheda grafica: '+sg,
    'Qualità: '+((RM.qualita&&RM.qualita.stato)?RM.qualita.stato().gradino:'?')+'; programmi della scheda grafica: '+((R.info.programs||[]).length),
    'Caso | che cosa è spento | f/s | peggiore ms | lavoro del ciclo ms | disegni per fotogramma | kB caricati per fotogramma | attesa scheda grafica ms'];
  esiti.forEach(function(x){ L.push(x.caso+' | '+x.passo+' | '+cifra(x.fps)+' | '+Math.round(x.peg)+' | '+cifra(x.lav)+' | '+Math.round(x.d)+' | '+cifra(x.kb)+' | '+(x.gpu==null?'—':cifra(x.gpu))); });
  return L.join('\n'); }
function fine(){ if(corso) corso.remove(); var d=$('div','pc pc-fine'), k=$('div'); d.appendChild($('h2',null,'Prova delle cause: risultato'));
  var tb=$('table'), h=$('tr'); ['Che cosa è spento','f/s','peggiore','ciclo ms','disegni','kB','gpu ms'].forEach(function(t){ h.appendChild($('th',null,t)); }); tb.appendChild(h);
  var caso=null; esiti.forEach(function(x){ if(x.caso!==caso){ caso=x.caso; var tr0=$('tr'), td0=$('th',null,caso); td0.colSpan=7; td0.style.textAlign='left'; tr0.appendChild(td0); tb.appendChild(tr0); }
    var tr=$('tr'); [x.passo,cifra(x.fps),Math.round(x.peg),cifra(x.lav),Math.round(x.d),cifra(x.kb),x.gpu==null?'—':cifra(x.gpu)].forEach(function(t){ tr.appendChild($('td',null,String(t))); }); tb.appendChild(tr); });
  d.appendChild(tb); var t=testo(), a=$('textarea'); a.value=t; a.setAttribute('readonly','');
  var cp=$('button','pc-primo','Copia'), ch=$('button',null,'Chiudi'); cp.type=ch.type='button';
  cp.addEventListener('click',function(){ function vecchio(){ a.select(); try{ document.execCommand('copy'); }catch(e){} } var ok=function(){ cp.textContent='Copiato'; setTimeout(function(){ cp.textContent='Copia'; },1600); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){ vecchio(); ok(); }); else { vecchio(); ok(); } });
  ch.addEventListener('click',function(){ d.remove(); });
  k.appendChild(cp); k.appendChild(ch); d.appendChild(k); d.appendChild(a); document.body.appendChild(d); }
RM.provaCause={ esiti:esiti, testo:testo, avvia:function(lista){ var c=CASI.filter(function(x){ return !lista || lista.indexOf(x.k)>=0; }); if(corso) corso.remove(); pannello(); var r=corso.querySelector('.pc-riga'), s=corso.querySelector('.pc-sotto'); return vai(c,r,s); } };      // per le prove sul banco
if(document.readyState==='complete') setTimeout(pannello,800); else window.addEventListener('load',function(){ setTimeout(pannello,800); });
})();
