/* ?misura=1: il registratore della fluidità per un telefono vero (27 novembre 2026, notte; l'utente: «rendere più fluido tutto dal cell»).
   Caricato da js/base.js solo con il parametro: senza, non esiste. Una riga piccola in sovrimpressione (fotogrammi al secondo degli ultimi due secondi,
   fotogramma peggiore, gradino della qualità, triangoli della scena) e il bottone «Copia», che copia negli appunti un riassunto in testo:
   il dispositivo come lo dà il browser (agente, schermo, densità, scheda grafica: nessun dato personale), poi una riga per ogni tappa visitata
   con fotogrammi medi, peggiore, quanti oltre 33 e oltre 100 millesimi, gradino e cambi del regolatore. Nulla va in rete. */
(function(){
  if(!window.RM || !RM.renderer) return;
  var R=RM.renderer, tri=0, rendi=R.render;
  R.render=function(sc,cam){ rendi.apply(R,arguments); if(sc===RM.scene) tri=R.info.render.triangles; };      // i triangoli del disegno della città (le passate degli effetti ne hanno due)
  var prima=0, ultimi=[], tappe=[], cur=null, cambi=0;
  function nomeTappa(tp){ var D=window.RM_DATI, i=window.RM_pagina?RM_pagina.tappa():-1, T=tp||(D&&D.TAPPE&&D.TAPPE[i]); return {i:i, anno:T?T.anno+(T.intermezzo?' ('+T.titolo+')':''):(window.RM_pagina?Math.round(RM_pagina.annoOra()):0)}; }      // l'anno della tappa scelta (nel viaggio l'anno della scena è ancora quello di prima)
  function nuova(tp){ var t=nomeTappa(tp); cur={tappa:t.i, anno:t.anno, n:0, s:0, mx:0, o33:0, o100:0, cambi:0, gradini:{}, t0:performance.now(), m:{n:0, s:0, mx:0, o33:0, o50:0}}; tappe.push(cur); }
  /* 28 novembre 2026, quarto giro: i fotogrammi in cui la camera della città si muove (un dito giù, o il punto guardato e l'occhio spostati dal fotogramma prima) si contano anche a parte */
  var giu=0, occhio=[0,0,0,0,0,0];
  window.addEventListener('pointerdown',function(){ giu++; },{capture:true,passive:true}); ['pointerup','pointercancel'].forEach(function(n){ window.addEventListener(n,function(){ giu=Math.max(0,giu-1); },{capture:true,passive:true}); });
  function mossa(){ var c=RM.camera&&RM.camera.position, t=RM.controlli&&RM.controlli.target; if(!c||!t) return false; var v=[c.x,c.y,c.z,t.x,t.y,t.z], d=0, i; for(i=0;i<6;i++){ d+=Math.abs(v[i]-occhio[i]); occhio[i]=v[i]; } return giu>0 || d>.002; }
  function stato(){ var q=RM.qualita&&RM.qualita.stato?RM.qualita.stato():null; return q?{g:q.gradino+(q.dens?' '+String(Math.round(q.dens*100)/100).replace('.',','):''), d:q.dens}:{g:'?',d:0}; }
  nuova();
  if(window.RM_pagina && RM_pagina.quando) RM_pagina.quando(function(i,t){ nuova(t); });
  if(RM.qualita && RM.qualita.quando) RM.qualita.quando(function(){ cambi++; if(cur) cur.cambi++; });
  /* la riga */
  var box=document.createElement('div'); box.id='misuraRiga'; box.setAttribute('role','status');
  box.style.cssText='position:fixed;left:6px;top:6px;z-index:99999;background:rgba(20,12,8,.82);color:#f3e7c9;font:600 11px/1.35 system-ui,sans-serif;padding:4px 6px;border-radius:6px;pointer-events:auto;max-width:92vw';
  var riga=document.createElement('span'), copia=document.createElement('button');
  copia.type='button'; copia.textContent='Copia'; copia.style.cssText='margin-left:6px;font:600 11px system-ui,sans-serif;padding:2px 7px;border-radius:5px;border:1px solid #c9a75a;background:#3a2617;color:#f3e7c9';
  box.appendChild(riga); box.appendChild(copia); document.body.appendChild(box);
  function giro(ts){
    requestAnimationFrame(giro);
    var mv=mossa();
    if(prima){ var d=ts-prima; if(d>0 && d<2000 && !document.hidden){ ultimi.push([ts,d]); var c=cur; c.n++; c.s+=d; if(d>c.mx) c.mx=d; if(d>33.4) c.o33++; if(d>100) c.o100++; var s=stato(); c.gradini[s.g]=(c.gradini[s.g]||0)+1;
      if(mv){ var m=c.m; m.n++; m.s+=d; if(d>m.mx) m.mx=d; if(d>33.4) m.o33++; if(d>50.1) m.o50++; } } }
    prima=ts;
    while(ultimi.length && ts-ultimi[0][0]>2000) ultimi.shift();
  }
  requestAnimationFrame(giro);
  setInterval(function(){ if(!ultimi.length) return; var s=0, mx=0; ultimi.forEach(function(u){ s+=u[1]; if(u[1]>mx) mx=u[1]; });
    var fps=1000*ultimi.length/Math.max(1,s), st=stato();
    riga.textContent=Math.round(fps)+' f/s · peggiore '+Math.round(mx)+' ms · '+st.g+' · '+(tri/1e6).toFixed(2).replace('.',',')+' M tri'; },500);
  function testo(){
    var gl=R.getContext(), e=gl.getExtension('WEBGL_debug_renderer_info'), sg=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'?', cv=R.domElement;
    var L=['Come finisce un impero, misura della fluidità ('+(RM.versione||'versione ignota')+')',
      'Browser: '+navigator.userAgent, 'Schermo: '+screen.width+' x '+screen.height+' punti, densità '+(window.devicePixelRatio||1)+'; tela della città adesso '+cv.width+' x '+cv.height+' (1 x 1 se è nascosta); scheda grafica: '+sg,
      'Qualità: '+(RM.qualita&&RM.qualita.automatica&&RM.qualita.automatica()?'automatica, ':'scelta a mano, ')+stato().g+'; cambi del regolatore in tutto: '+cambi,
      'Tappa (anno) | fotogrammi | media f/s | peggiore ms | oltre 33 ms | oltre 100 ms | gradini | cambi | con la camera che si muove: fotogrammi, media f/s, peggiore ms, oltre 33, oltre 50'];
    tappe.forEach(function(c){ if(!c.n) return; var g=Object.keys(c.gradini).map(function(k){ return k+' '+Math.round(100*c.gradini[k]/c.n)+'%'; }).join(', '), m=c.m;
      L.push(c.anno+' | '+c.n+' | '+(1000*c.n/c.s).toFixed(1)+' | '+Math.round(c.mx)+' | '+c.o33+' | '+c.o100+' | '+g+' | '+c.cambi+' | '+(m.n?m.n+', '+(1000*m.n/m.s).toFixed(1)+', '+Math.round(m.mx)+', '+m.o33+', '+m.o50:'—')); });
    return L.join('\n'); }
  copia.addEventListener('click',function(){ var t=testo();
    function vecchio(){ var a=document.createElement('textarea'); a.value=t; a.setAttribute('readonly',''); a.style.cssText='position:fixed;left:-9999px;top:0'; document.body.appendChild(a); a.select(); try{ document.execCommand('copy'); }catch(e){} document.body.removeChild(a); }
    var fatto=function(){ copia.textContent='Copiato'; setTimeout(function(){ copia.textContent='Copia'; },1600); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fatto,function(){ vecchio(); fatto(); }); else { vecchio(); fatto(); } });
  RM.misura={ testo:testo, tappe:tappe };      // per le prove
})();
