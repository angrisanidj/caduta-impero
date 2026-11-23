/* Infografiche animate (23 novembre 2026; l'utente: «per le infografiche animate inizia dalla 1 e segui fino alla 6»; proposta in src/proposte/infografiche-animate.md).
   Ognuna è una breve sequenza che spiega un processo: si apre da un bottone «▶ Guarda in un minuto» nelle tappe a cui appartiene, in una finestra (<dialog>) con un grafico SVG
   che si disegna da solo e frasi che compaiono quando la linea passa per gli eventi. Pausa, rivedi, chiudi (anche con Esc). Con «Riduci movimento» il grafico è già completo.
   I dati vengono da js/dati.js (CURVE e testi delle tappe): nessun numero nuovo senza fonte. */
(function(){
'use strict';
var D=window.RM_DATI||{}, NS='http://www.w3.org/2000/svg';
var POCO=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches && !/[?&]moto=1/.test(location.search);
function el(t,a,p){ var e=document.createElementNS(NS,t); for(var k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; }
function h(t,c,txt,p){ var e=document.createElement(t); if(c) e.className=c; if(txt!=null) e.textContent=txt; if(p) p.appendChild(e); return e; }
function num(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }

/* ---------- 1. Roma si svuota ----------
   La curva degli abitanti con la forchetta delle stime (CURVE.popolazione, fonti nel commento in js/dati.js); i momenti sono quelli delle tappe e delle didascalie della città. */
var ROMA={ titolo:'Roma si svuota', sotto:'Gli abitanti di Roma dal 235 all\'852, secondo le stime',
  momenti:[[271,"Aureliano fa costruire le nuove mura: diciannove chilometri."],[410,"I Goti di Alarico saccheggiano Roma per tre giorni."],[419,"Le razioni di carne di maiale fanno stimare circa mezzo milione di abitanti."],
    [455,"I Vandali saccheggiano Roma per quattordici giorni."],[476,"Deposto Romolo Augustolo, a Roma il Senato continua a riunirsi."],[537,"I Goti tagliano tutti gli acquedotti: le terme non possono più funzionare."],
    [546,"Totila entra a Roma e la fa evacuare."],[590,"Peste e piena del Tevere: Gregorio Magno diventa papa."],[663,"Costante II porta via il bronzo dei monumenti."],
    [780,"Papa Adriano I fa riparare quattro acquedotti."],[846,"I Saraceni saccheggiano San Pietro, fuori dalle mura."]],
  fonte:"Stime: Krautheimer, Durliat, il Companion to Rome del 2026 e gli altri studi citati in fondo alla pagina. La linea è una media fra le stime; la fascia chiara va dalla più bassa alla più alta. Prima del VI secolo i numeri vengono soprattutto dalle razioni di cibo; dopo, quasi solo dall'archeologia." };

function disegnaRoma(svg,stato){
  var C=(D.CURVE||{}).popolazione; if(!C) return;
  var W=640, H=300, L=62, Rr=14, T=14, B=34, x=function(a){ return L+(a-235)/(852-235)*(W-L-Rr); }, y=function(v){ return T+(1-v/1250000)*(H-T-B); };
  el('rect',{x:0,y:0,width:W,height:H,fill:'transparent'},svg);
  [0,250000,500000,750000,1000000].forEach(function(v){ el('line',{x1:L,x2:W-Rr,y1:y(v),y2:y(v),class:'ig-griglia'},svg); var t=el('text',{x:L-6,y:y(v)+4,class:'ig-asse','text-anchor':'end'},svg); t.textContent=v?(v>=1e6?'1 milione':num(v/1000)+' mila'):'0'; });
  [235,300,400,476,500,600,700,800,852].forEach(function(a){ var t=el('text',{x:x(a),y:H-14,class:'ig-asse','text-anchor':'middle'},svg); t.textContent=a; });
  var banda=C.banda, su=banda.map(function(b){ return x(b[0])+','+y(b[2]); }), giu=banda.slice().reverse().map(function(b){ return x(b[0])+','+y(b[1]); });
  var fascia=el('polygon',{points:su.concat(giu).join(' '),class:'ig-fascia'},svg);
  var d=C.punti.map(function(p,i){ return (i?'L':'M')+x(p[0]).toFixed(1)+' '+y(p[1]).toFixed(1); }).join(' ');
  var linea=el('path',{d:d,class:'ig-linea'},svg), lung=linea.getTotalLength?linea.getTotalLength():2000;
  var segni=ROMA.momenti.map(function(m){ var v=valore(C.punti,m[0]); var g=el('g',{class:'ig-momento'},svg); el('line',{x1:x(m[0]),x2:x(m[0]),y1:y(v)-4,y2:H-B,class:'ig-asta'},g); el('circle',{cx:x(m[0]),cy:y(v),r:4.5},g); return {a:m[0],g:g,t:m[1]}; });
  var cur=el('g',{class:'ig-cursore'},svg), lab=el('text',{x:0,y:0,class:'ig-valore','text-anchor':'middle'},cur);
  stato.passo=function(k){      // k da 0 a 1: l'anno arriva a 235+k*617
    var anno=235+k*617; linea.style.strokeDasharray=lung; linea.style.strokeDashoffset=lung*(1-k);
    fascia.style.clipPath='inset(0 '+((1-k)*100).toFixed(1)+'% 0 0)';
    var v=valore(C.punti,anno); cur.setAttribute('transform','translate('+x(anno).toFixed(1)+','+(y(v)-12).toFixed(1)+')'); lab.textContent=k<1?Math.round(anno)+': circa '+num(Math.round(v/1000)*1000):'852: circa '+num(v);
    var ultimo=null; segni.forEach(function(s){ var on=s.a<=anno; s.g.classList.toggle('acceso',on); if(on) ultimo=s; });
    return ultimo?ultimo.a+' · '+ultimo.t:ROMA.sotto;
  };
  stato.tutti=segni.map(function(s){ return [s.a,s.t]; });
}
function valore(P,a){ for(var i=1;i<P.length;i++) if(a<=P[i][0]){ var f=(a-P[i-1][0])/(P[i][0]-P[i-1][0]); return P[i-1][1]+(P[i][1]-P[i-1][1])*f; } return P[P.length-1][1]; }

/* ---------- 2. Senza soldi non c'è esercito ----------
   La parte dell'Occidente governata da Roma, misurata sulla carta di questa pagina tappa per tappa (RM_mappa.territorio: federati e contesi a metà fino al 480).
   La tesi delle entrate perdute con le province è quella di «Perché cadde» (Wickham, Heather): qui non si aggiungono numeri sulle tasse. */
var TERRE={ titolo:"Senza soldi non c'è esercito", sotto:"La parte dell'Occidente governata da Roma, dal 395 al 476, misurata sulla carta",
  momenti:[[406,"Vandali, Alani e Svevi passano il Reno: la Gallia sfugge di mano."],[409,"La Britannia si difende da sola; i barbari entrano in Spagna."],[418,"I Visigoti si stabiliscono in Aquitania come alleati."],
    [429,"I Vandali passano in Africa."],[439,"Cartagine cade: per molti storici è la perdita di entrate più grave."],[455,"I Vandali saccheggiano Roma."],[468,"Fallisce l'ultima spedizione per riprendere l'Africa."],[476,"Odoacre depone Romolo Augustolo."]],
  fonte:"Percentuale misurata sulla carta di questa pagina: le regioni dei federati e quelle contese contano per metà. Meno terre voleva dire meno tasse per pagare l'esercito: è la tesi di Wickham e di Heather, che trovi in «Perché cadde l'Occidente?»." };
function disegnaTerre(svg,stato){
  var T=(D.TAPPE||[]).filter(function(t){ return t.regioni && !t.intermezzo && t.anno>=395 && t.anno<=476; }), M=window.RM_mappa; if(!M||!M.territorio) return;
  var P=T.map(function(t){ return [t.anno,M.territorio(t.regioni,t.anno)]; });
  var W=640, H=300, L=50, Rr=14, Tp=14, B=34, x=function(a){ return L+(a-395)/(476-395)*(W-L-Rr); }, y=function(v){ return Tp+(1-v/100)*(H-Tp-B); };
  [0,25,50,75,100].forEach(function(v){ el('line',{x1:L,x2:W-Rr,y1:y(v),y2:y(v),class:'ig-griglia'},svg); var t=el('text',{x:L-6,y:y(v)+4,class:'ig-asse','text-anchor':'end'},svg); t.textContent=v+'%'; });
  [395,410,425,439,455,476].forEach(function(a){ var t=el('text',{x:x(a),y:H-14,class:'ig-asse','text-anchor':'middle'},svg); t.textContent=a; });
  var d='M'+x(P[0][0])+' '+y(P[0][1]); for(var i=1;i<P.length;i++) d+=' H'+x(P[i][0]).toFixed(1)+' V'+y(P[i][1]).toFixed(1);      // a gradini: il territorio cambia di colpo, a ogni tappa
  var area=el('path',{d:d+' V'+y(0)+' H'+x(P[0][0])+' Z',class:'ig-fascia'},svg), linea=el('path',{d:d,class:'ig-linea'},svg), lung=linea.getTotalLength?linea.getTotalLength():1500;
  var segni=TERRE.momenti.map(function(m){ var v=valoreGradini(P,m[0]), g=el('g',{class:'ig-momento'},svg); el('line',{x1:x(m[0]),x2:x(m[0]),y1:y(v)-4,y2:H-B,class:'ig-asta'},g); el('circle',{cx:x(m[0]),cy:y(v),r:4.5},g); return {a:m[0],g:g,t:m[1]}; });
  var cur=el('g',{class:'ig-cursore'},svg), lab=el('text',{x:0,y:0,class:'ig-valore','text-anchor':'middle'},cur);
  stato.passo=function(k){ var anno=395+k*81, v=valoreGradini(P,anno); linea.style.strokeDasharray=lung; linea.style.strokeDashoffset=lung*(1-k); area.style.clipPath='inset(0 '+((1-k)*100).toFixed(1)+'% 0 0)';
    cur.setAttribute('transform','translate('+x(anno).toFixed(1)+','+(y(v)-12).toFixed(1)+')'); lab.textContent=Math.round(anno)+': '+Math.round(v)+'%';
    var ultimo=null; segni.forEach(function(s){ var on=s.a<=anno; s.g.classList.toggle('acceso',on); if(on) ultimo=s; }); return ultimo?ultimo.a+' · '+ultimo.t:TERRE.sotto; };
  stato.tutti=segni.map(function(s){ return [s.a,s.t]; });
}
function valoreGradini(P,a){ var v=P[0][1]; for(var i=0;i<P.length;i++) if(P[i][0]<=a) v=P[i][1]; return v; }

var INFO={ roma:{d:ROMA, disegna:disegnaRoma, dura:26000, tappe:function(t){ return t.anno===590&&t.intermezzo || t.anno===852&&!t.intermezzo; }},
  terre:{d:TERRE, disegna:disegnaTerre, dura:22000, tappe:function(t){ return t.anno===476&&t.intermezzo&&/esercito/i.test(t.titolo) || t.anno===439&&!t.intermezzo; }} };

/* ---------- la finestra ---------- */
var dlg=null, raf=0;
function apri(chi){
  var I=INFO[chi]; if(!I) return; chiudi();
  dlg=h('dialog','ig-finestra',null,document.body); dlg.setAttribute('aria-label',I.d.titolo);
  var testa=h('div','ig-testa',null,dlg); h('h2','ig-titolo',I.d.titolo,testa); h('p','ig-sotto',I.d.sotto,testa);
  var x=h('button','ig-chiudi','×',testa); x.type='button'; x.setAttribute('aria-label','Chiudi');
  var svg=el('svg',{viewBox:'0 0 640 300',class:'ig-grafico',role:'img','aria-label':I.d.titolo},dlg); dlg.appendChild(svg);
  var frase=h('p','ig-frase','',dlg); frase.setAttribute('aria-live','polite');
  var comandi=h('div','ig-comandi',null,dlg), bp=h('button','ig-pausa','❚❚ Pausa',comandi), br=h('button','ig-rivedi','↺ Rivedi',comandi); bp.type=br.type='button';
  var fonte=h('p','ig-fonte',I.d.fonte,dlg);
  var stato={}; I.disegna(svg,stato);
  var t0=0, fermo=false, k=0;
  function va(ora){ if(fermo) return; if(!t0) t0=ora-k*I.dura; k=Math.min(1,(ora-t0)/I.dura); frase.textContent=stato.passo(k); if(k<1) raf=requestAnimationFrame(va); else { bp.disabled=true; } }
  bp.addEventListener('click',function(){ fermo=!fermo; bp.textContent=fermo?'▶ Riprendi':'❚❚ Pausa'; if(!fermo){ t0=0; raf=requestAnimationFrame(va); } });
  br.addEventListener('click',function(){ cancelAnimationFrame(raf); k=0; t0=0; fermo=false; bp.disabled=false; bp.textContent='❚❚ Pausa'; raf=requestAnimationFrame(va); });
  x.addEventListener('click',chiudi); dlg.addEventListener('cancel',function(e){ e.preventDefault(); chiudi(); });
  dlg.addEventListener('click',function(e){ if(e.target===dlg) chiudi(); });
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
  if(POCO){ frase.textContent=stato.passo(1); comandi.hidden=true; var ul=h('ul','ig-elenco',null,dlg); dlg.insertBefore(ul,fonte); stato.tutti.forEach(function(m){ h('li',null,m[0]+' · '+m[1],ul); }); }
  else raf=requestAnimationFrame(va);
}
function chiudi(){ cancelAnimationFrame(raf); if(dlg){ try{ dlg.close(); }catch(e){} dlg.remove(); dlg=null; } }

/* il bottone sotto il testo della tappa */
var posto=document.getElementById('tDaLeggere'), box=null;
if(posto){ box=document.createElement('div'); box.className='ig-inviti'; box.hidden=true; posto.parentNode.insertBefore(box,posto); }
function inviti(i,t){
  box.textContent=''; var ci=Object.keys(INFO).filter(function(k){ return INFO[k].tappe(t); }); box.hidden=!ci.length;
  ci.forEach(function(k){ var b=h('button','ig-invito',null,box); b.type='button'; h('span','ig-play','▶',b); var s=h('span','ig-testi',null,b); h('b',null,INFO[k].d.titolo,s); h('span',null,'Guarda in un minuto',s); b.addEventListener('click',function(){ apri(k); }); });
}
if(window.RM_pagina && box){ RM_pagina.quando(inviti); var T0=(D.TAPPE||[])[RM_pagina.tappa()]; if(T0) inviti(RM_pagina.tappa(),T0); }      // anche la tappa aperta all'avvio
window.RM_infografiche={apri:apri, chiudi:chiudi};
})();
