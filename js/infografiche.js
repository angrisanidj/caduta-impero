/* Infografiche animate (23 novembre 2026; l'utente: «per le infografiche animate inizia dalla 1 e segui fino alla 6»; proposta in src/proposte/infografiche-animate.md).
   Rifatte lo stesso giorno («alza nettamente la qualità... voglio che dici WOW»): ognuna è una breve regia a fasi, non più una sola linea che avanza.
   Si apre da un bottone nelle tappe a cui appartiene, in una finestra (<dialog>): copertina, apertura d'effetto, soste sugli eventi con note accanto ai punti,
   numeri che contano verso il valore, un finale che riassume. Pausa, momento precedente e successivo, cursore, rivedi, chiudi (anche con Esc).
   Il disegno si fa in pixel veri: il viewBox è grande quanto il riquadro, così le scritte non rimpiccioliscono sul telefono; sotto i 600 punti e sui telefoni coricati
   l'impaginazione cambia (verticale o con la colonna di testo a destra). Con «Riduci movimento» il grafico è già completo e le frasi stanno in elenco; ?moto=1 forza l'animazione, ?fermo=1 la versione ferma.
   I dati vengono da js/dati.js (CURVE, TAPPE, CAMBI) e dalla carta (RM_mappa, RM_MAPPA, RM_TOPO): nessun numero nuovo. Le etichette brevi delle note (terzo elemento dei momenti)
   riassumono la frase accanto, senza aggiungere fatti.
   Lo stesso giorno se ne aggiungono tre: «Ponte Milvio» (tappa del 312), «Il Pantheon nel tempo» (609) e «La Curia nel tempo» (630); le ultime due prendono i loro fotogrammi
   dalla città in 3D della pagina (scatta e fotogrammi, più sotto), che torna poi com'era. */
(function(){
'use strict';
var D=window.RM_DATI||{}, NS='http://www.w3.org/2000/svg', XL='http://www.w3.org/1999/xlink';
var MOTO=/[?&]moto=1/.test(location.search);
var POCO=/[?&]fermo=1/.test(location.search) || !MOTO && !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);      // ?fermo=1: la versione ferma, per le prove

/* ---------- piccoli aiuti ---------- */
function el(t,a,p){ var e=document.createElementNS(NS,t); if(a) for(var k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; }
function tx(p,x,y,c,s,an){ var t=el('text',{x:r1(x),y:r1(y),'class':c},p); if(an) t.setAttribute('text-anchor',an); if(s!=null) t.textContent=s; return t; }
function h(t,c,s,p){ var e=document.createElement(t); if(c) e.className=c; if(s!=null) e.textContent=s; if(p) p.appendChild(e); return e; }
function r1(v){ return Math.round(v*10)/10; }
function num(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
function virgola(v){ return v<10&&Math.round(v)!==v?v.toFixed(1).replace('.',','):String(Math.round(v)); }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function fase(t,a,b){ return b<=a?(t>=b?1:0):clamp((t-a)/(b-a),0,1); }
function lerp(a,b,k){ return a+(b-a)*k; }
var E={ io:function(k){ return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2; }, out:function(k){ return 1-Math.pow(1-k,3); },
  back:function(k){ var c=1.70158; return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2); } };
function valore(P,a){ if(a<=P[0][0]) return P[0][1]; for(var i=1;i<P.length;i++) if(a<=P[i][0]){ var f=(a-P[i-1][0])/(P[i][0]-P[i-1][0]||1); return P[i-1][1]+(P[i][1]-P[i-1][1])*f; } return P[P.length-1][1]; }
function caso(s){ return function(){ s=s+0x6D2B79F5|0; var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function xy(p){ return r1(p[0])+','+r1(p[1]); }
/* scritture solo quando cambia qualcosa: a ogni fotogramma si toccano pochi attributi */
function cls(e,c,on){ on=!!on; if(e.classList.contains(c)!==on) e.classList.toggle(c,on); }
function fissa(e,k,v){ if(e['_'+k]!==v){ e['_'+k]=v; e.setAttribute(k,v); } }
function scrivi(e,s){ if(e._s!==s){ e._s=s; e.textContent=s; } }
/* Larghezza di una scritta. Sull'iPhone (WebKit) getComputedTextLength non basta per le scritte con letter-spacing o text-transform:
   per quelle si misura anche col canvas (maiuscole vere, spaziatura aggiunta a mano) e si tiene la misura più larga. */
var MISURA=null;
function largo(t){ var w; try{ w=t.getComputedTextLength(); }catch(e){ w=(t.textContent||'').length*7; }
  try{ var cs=getComputedStyle(t), up=cs.textTransform==='uppercase', ls=parseFloat(cs.letterSpacing)||0;
    if(up||ls>0){ var s=t.textContent||''; MISURA=MISURA||document.createElement('canvas').getContext('2d'); MISURA.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
      w=Math.max(w,MISURA.measureText(up?s.toUpperCase():s).width+ls*s.length); } }catch(e){}
  return w; }
/* testo a capo dentro maxW (tspan); restituisce il numero di righe */
function avvolgi(t,s,maxW,lh){
  var x=t.getAttribute('x')||0, parole=String(s).split(' '), riga=[], ts=el('tspan',{x:x},t), n=1;
  parole.forEach(function(p){ riga.push(p); ts.textContent=riga.join(' ');
    if(riga.length>1 && largo(ts)>maxW){ riga.pop(); ts.textContent=riga.join(' '); riga=[p]; ts=el('tspan',{x:x,dy:lh},t); ts.textContent=p; n++; } });
  return n;
}
/* Il tempo della regia: l'anno corre fra le soste con un'accelerazione morbida e si ferma su ogni evento (fermate: [{anno, sosta}]) */
function Tempo(a0,fermate,o){
  var t=o.inizio, cur=a0, seg=[], arrivi=[];
  fermate.forEach(function(f){ if(f.anno>cur){ var d=Math.max(o.min,(f.anno-cur)*o.vel); seg.push([t,t+d,cur,f.anno]); t+=d; cur=f.anno; } arrivi.push(t); t+=f.sosta||0; });
  return {fine:t, arrivi:arrivi, anno:function(tt){ if(!seg.length||tt<=seg[0][0]) return a0;
    for(var i=0;i<seg.length;i++){ var s=seg[i]; if(tt<s[0]) return s[2]; if(tt<=s[1]) return lerp(s[2],s[3],E.io((tt-s[0])/(s[1]-s[0]))); } return cur; }};
}
/* assi alla maniera dei giornali: le cifre stanno sopra le righe della griglia, a sinistra, senza margine */
function grafico(p,b,o){
  var g=el('g',{'class':'ig-assi'},p), et=el('g',{'class':'ig-assi ig-etichette'}), L=b[0], T=b[1]+(o.sopra||0), R=b[0]+b[2], B=b[1]+b[3]-20;
  var x=function(a){ return L+(a-o.x0)/(o.x1-o.x0)*(R-L); }, y=function(v){ return B-(v-o.y0)/(o.y1-o.y0)*(B-T); };
  o.ty.forEach(function(v){ el('line',{x1:L,x2:R,y1:r1(y(v)),y2:r1(y(v)),'class':v===o.y0?'ig-base':'ig-griglia'},g); var s=o.fy(v); if(s) tx(et,L,y(v)-5,'ig-asse',s); });
  o.tx.forEach(function(a,i){ var an=i===0?'start':i===o.tx.length-1?'end':'middle'; tx(et,x(a),B+15,'ig-asse ig-asse-x',String(a),an); el('line',{x1:r1(x(a)),x2:r1(x(a)),y1:B,y2:B+4,'class':'ig-base'},g); });
  /* le cifre vanno sopra i dati: chi disegna chiama sopra() quando ha finito */
  return {g:g,x:x,y:y,L:L,T:T,R:R,B:B,sopra:function(){ p.appendChild(et); },vis:function(on){ cls(g,'vis',on); cls(et,'vis',on); }};
}
/* Nota accanto a un punto, con la sua linea guida. Si prova in più posti (prima a destra, dove la curva non è ancora disegnata) e si sceglie quello che copre
   meno la parte di linea già tracciata (o.linea, in pixel) e resta dentro il riquadro. */
function nota(p,o){
  var g=el('g',{'class':'ig-nota'+(o.classe?' '+o.classe:'')},p), ln=el('path',{'class':'ig-nota-linea'},g), bx=el('g',{'class':'ig-nota-box'},g);
  var fondo=el('rect',{rx:5,'class':'ig-nota-fondo'},bx), ta=tx(bx,10,18,'ig-nota-anno',String(o.anno)), tt=el('text',{x:10,y:35,'class':'ig-nota-testo'},bx);
  var b=o.box, maxW=Math.max(110,Math.min(o.maxW||220,b[2]-b[0]-24)), n=avvolgi(tt,o.testo,maxW-20,16);
  var wt=0; [].forEach.call(tt.childNodes,function(s){ wt=Math.max(wt,largo(s)); });
  var bw=Math.ceil(Math.max(largo(ta),wt)+20), bh=26+n*16, d=o.dist||16, pts=[];
  (o.linea||[]).forEach(function(q,i,L){ if(!i||L[i-1][0]>o.x+1) return; var a=L[i-1], e=q[0]>o.x?[o.x,a[1]+(q[1]-a[1])*(o.x-a[0])/((q[0]-a[0])||1)]:q, l=Math.hypot(e[0]-a[0],e[1]-a[1]), m=Math.max(1,Math.ceil(l/5));
    for(var k=0;k<=m;k++) pts.push([lerp(a[0],e[0],k/m),lerp(a[1],e[1],k/m)]); });
  var cand=[[o.x+d,o.y-bh/2],[o.x+d,o.y-bh-6],[o.x+d,o.y+6],[o.x-bw/2,o.y+18],[o.x-bw/2,o.y-bh-18],[o.x-d-bw,o.y+8],[o.x-d-bw,o.y-bh-8]], best=null;
  cand.forEach(function(c,i){ var X=clamp(c[0],b[0],b[2]-bw), Y=clamp(c[1],b[1],b[3]-bh), sc=i*0.4+(Math.abs(X-c[0])+Math.abs(Y-c[1]))/6;
    pts.forEach(function(q){ if(q[0]>X-5&&q[0]<X+bw+5&&q[1]>Y-5&&q[1]<Y+bh+5) sc+=4; });
    if(o.x>X-8&&o.x<X+bw+8&&o.y>Y-8&&o.y<Y+bh+8) sc+=500;
    if(!best||sc<best.s) best={s:sc,X:X,Y:Y}; });
  if(best.s>=4 && !o.stretta){ var spazio=Math.max(b[2]-o.x-d,o.x-d-b[0])-4; if(spazio>=96 && spazio<bw){ g.remove(); var o2={}; for(var kk in o) o2[kk]=o[kk]; o2.stretta=true; o2.maxW=spazio; return nota(p,o2); } }      // nei grafici stretti si riprova andando più a capo
  var X=best.X, Y=best.Y;
  fondo.setAttribute('width',bw); fondo.setAttribute('height',bh); el('rect',{x:0,y:0,width:3,height:bh,rx:1.5,'class':'ig-nota-filo'},bx);
  bx.setAttribute('transform','translate('+r1(X)+','+r1(Y)+')');
  var ax=clamp(o.x,X,X+bw), ay=clamp(o.y,Y,Y+bh); if(ax>X&&ax<X+bw&&ay>Y&&ay<Y+bh) ay=Y;
  ln.setAttribute('d','M'+r1(o.x)+' '+r1(o.y)+' L'+r1(ax)+' '+r1(ay));
  return g;
}
function dentro(p,poly){ var c=false; for(var i=0,j=poly.length-1;i<poly.length;j=i++){ var a=poly[i], b=poly[j]; if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; }
function distSeg(p,a,b){ var dx=b[0]-a[0], dy=b[1]-a[1], l=dx*dx+dy*dy, k=l?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l,0,1):0, x=a[0]+k*dx-p[0], y=a[1]+k*dy-p[1]; return Math.sqrt(x*x+y*y); }
/* punti sparsi dentro un poligono, lontani fra loro e dal fiume (ordine di uscita: casuale, ma sempre lo stesso) */
function semina(poly,fiume,n,seme){
  var R=caso(seme), mn=[1e9,1e9], mx=[-1e9,-1e9], A=0, pts=[];
  poly.forEach(function(p,i){ var q=poly[(i+1)%poly.length]; mn[0]=Math.min(mn[0],p[0]); mn[1]=Math.min(mn[1],p[1]); mx[0]=Math.max(mx[0],p[0]); mx[1]=Math.max(mx[1],p[1]); A+=p[0]*q[1]-q[0]*p[1]; });
  var d=Math.sqrt(Math.abs(A)/2/n)*0.98, dUsato=d;
  for(var giro=0; giro<14 && pts.length<n; giro++){
    for(var k=0; k<3000 && pts.length<n; k++){
      var p=[lerp(mn[0],mx[0],R()),lerp(mn[1],mx[1],R())], ok=dentro(p,poly), j;
      for(j=0; ok && j<pts.length; j++){ var dx=pts[j][0]-p[0], dy=pts[j][1]-p[1]; if(dx*dx+dy*dy<d*d) ok=false; }
      for(j=1; ok && j<fiume.length; j++) if(distSeg(p,fiume[j-1],fiume[j])<d*0.5) ok=false;
      if(ok){ pts.push(p); dUsato=d; }
    }
    d*=0.93;
  }
  return {p:pts,d:dUsato};
}
/* treemap «squarified»: assegna a ogni voce (campo v) un rettangolo r=[x,y,w,h] */
function squarify(voci,x,y,w,hh){
  var tot=0; voci.forEach(function(v){ tot+=v.v; }); if(!tot||w<=0||hh<=0) return;
  var k=w*hh/tot, lista=voci.map(function(v){ return {v:v,a:v.v*k}; });
  function peggio(r,c){ var s=0,mx=0,mn=Infinity; r.forEach(function(q){ s+=q.a; mx=Math.max(mx,q.a); mn=Math.min(mn,q.a); }); return Math.max(c*c*mx/(s*s),(s*s)/(c*c*mn)); }
  while(lista.length){
    var c=Math.min(w,hh), riga=[], pg=Infinity, i=0;
    while(i<lista.length){ var prova=riga.concat([lista[i]]), q=peggio(prova,c); if(riga.length && q>pg) break; riga=prova; pg=q; i++; }
    var s=0; riga.forEach(function(q){ s+=q.a; }); var sp=s/c, o=0;
    riga.forEach(function(q){ var l=q.a/sp; q.v.r=w>=hh?[x,y+o,sp,l]:[x+o,y,l,sp]; o+=l; });
    if(w>=hh){ x+=sp; w-=sp; } else { y+=sp; hh-=sp; }
    lista=lista.slice(riga.length);
  }
}

/* ======================================================================
   1. Roma si svuota
   La città di punti: ogni punto pieno vale 10.000 abitanti secondo la linea centrale delle stime (CURVE.popolazione), i cerchi vuoti arrivano fino alla stima più alta
   (la «banda»). I punti stanno dentro il tracciato delle mura di Aureliano del modello (RM_TOPO, da OpenStreetMap), che si disegnano nel 271; sono isolati della città
   in 3D e si spengono con il criterio di js/citta.js (vedi doveAbitanti, più sotto). Accanto, la curva con la forchetta delle stime e le note sugli eventi delle tappe. */
var ROMA={ titolo:'Roma si svuota', sotto:'Gli abitanti di Roma dal 235 all\'852, secondo le stime',
  momenti:[[271,"Aureliano fa costruire le nuove mura: diciannove chilometri.","Le mura di Aureliano"],[410,"I Goti di Alarico saccheggiano Roma per tre giorni.","Il sacco dei Goti"],
    [419,"Le razioni di carne di maiale fanno stimare circa mezzo milione di abitanti.","Le razioni di carne"],
    [455,"I Vandali saccheggiano Roma per quattordici giorni.","Il sacco dei Vandali"],[476,"Deposto Romolo Augustolo, a Roma il Senato continua a riunirsi.","Deposto Romolo Augustolo"],
    [537,"I Goti tagliano tutti gli acquedotti: le terme non possono più funzionare.","Tagliati gli acquedotti"],
    [546,"Totila entra a Roma e la fa evacuare.","Totila fa evacuare Roma"],[590,"Peste e piena del Tevere: Gregorio Magno diventa papa.","Peste e piena del Tevere"],
    [663,"Costante II porta via il bronzo dei monumenti.","Via il bronzo dei monumenti"],
    [780,"Papa Adriano I fa riparare quattro acquedotti.","Riparati quattro acquedotti"],[846,"I Saraceni saccheggiano San Pietro, fuori dalle mura.","I Saraceni a San Pietro"]],
  fonte:"Stime: Krautheimer, Durliat, il Companion to Rome del 2026 e gli altri studi citati in fondo alla pagina. La linea è una media fra le stime; la fascia chiara va dalla più bassa alla più alta. Prima del VI secolo i numeri vengono soprattutto dalle razioni di cibo; dopo, quasi solo dall'archeologia. Nella città ogni punto pieno vale 10.000 abitanti della linea centrale, i cerchi vuoti arrivano alla stima più alta. "+(window.RM&&RM.isolati&&RM.isolati.length
    ? "I punti accesi stanno dove, nella Roma in 3D, le case sono ancora abitate in quell'anno. È una ricostruzione del modello, non una mappa degli scavi."
    : window.RM&&RM.NUCLEI
    ? "I punti accesi seguono lo stesso criterio della Roma in 3D (fino al VII secolo un po' in tutta la città, poi lungo il Tevere e attorno alle chiese), calcolato senza la città in 3D. È una ricostruzione del modello, non una mappa degli scavi."
    : "Dove cadano i punti non ha significato.") };

/* Dove restano gli abitanti (24 novembre 2026, l'utente: «dove effettivamente sono rimasti, non a caso»). I punti sono 120 isolati della città in 3D
   (RM.isolati, js/citta.js), dentro le mura e lontani fra loro; a ogni anno si accendono per primi quelli che la città lascia per ultimi, con lo stesso rango
   di js/citta.js: abitato sparso fino al VII secolo, poi nuclei sul Tevere e attorno alle chiese (fra il 640 e il 790). Così un punto pieno sta sempre su un
   isolato che nella città, in quell'anno, è abitato (provato anno per anno dal 235 all'852). Restano fuori il Borgo (fuori dalle mura, nel modello non si svuota mai),
   le case abbattute per un monumento e gli incendi dei sacchi. Senza la città in 3D: lo stesso calcolo sui nuclei di RM.NUCLEI, senza le quote dei colli;
   senza nemmeno quelli, a caso come prima. La geografia dei due ranghi è un'ipotesi del modello: lo dice la fonte dell'infografica. */
function doveAbitanti(muraP,fiume,n,seme,Q,Qi){
  var X=window.RM||{}, I=X.isolati, sf=X.sfuma||function(a,b,t){ t=clamp((t-a)/(b-a),0,1); return t*t*(3-2*t); };
  var R=caso(seme), pts=[], d, modo, A=0, i, j, m;
  muraP.forEach(function(p,i){ var q=muraP[(i+1)%muraP.length]; A+=p[0]*q[1]-q[0]*p[1]; });
  if(I && I.length && I[0].p1!=null){
    modo='citta';
    var cand=I.filter(function(b){ return b.dentro && !b.nasce && !b.via; }).map(function(b){ return {p:Q([b.x,b.z]),p1:b.p1,p2:b.p2}; });
    for(i=cand.length-1;i>0;i--){ j=Math.floor(R()*(i+1)); m=cand[i]; cand[i]=cand[j]; cand[j]=m; }
    d=Math.sqrt(Math.abs(A)/2/n)*0.98; var dUsato=d;
    for(var giro=0; giro<14 && pts.length<n; giro++){
      for(i=0;i<cand.length && pts.length<n;i++){ var c=cand[i]; if(c.preso) continue; var ok=true;
        for(m=0;ok&&m<pts.length;m++){ var dx=pts[m].p[0]-c.p[0], dy=pts[m].p[1]-c.p[1]; if(dx*dx+dy*dy<d*d) ok=false; }
        if(ok){ c.preso=true; pts.push(c); dUsato=d; } }
      d*=0.93; }
    d=dUsato;
  } else {
    var sem=semina(muraP,fiume,n,seme), NU=X.NUCLEI; d=sem.d;
    if(NU && NU.length){
      modo='nuclei';
      var F=(window.RM_TOPO||{}).fiume||[];
      var grezzi=sem.p.map(function(p){ var s=Qi(p), t2=0, t1=0, dF=1e9, k;
        for(k=1;k<F.length;k++) dF=Math.min(dF,distSeg(s,F[k-1],F[k]));
        NU.forEach(function(q){ var dd=Math.hypot(s[0]-q[0],s[1]-q[1]); t2=Math.max(t2,q[2]*Math.exp(-dd*dd/(q[3]*q[3]))); t1=Math.max(t1,(q[3]>15?.22:.4)*q[2]*Math.exp(-dd*dd/(q[3]>15?4900:169))); });
        return {p:p,k:t2+.25*Math.exp(-dF/45)+(R()-.5)*.08,k1:t1+.2*Math.exp(-dF/45)-.22*sf(140,300,Math.hypot(s[0]-5,s[1]-5))+(R()-.5)*.8}; });
      grezzi.slice().sort(function(a,b){ return a.k-b.k; }).forEach(function(o,i,tt){ o.p2=i/(tt.length-1); });
      grezzi.slice().sort(function(a,b){ return a.k1-b.k1; }).forEach(function(o,i,tt){ o.p1=i/(tt.length-1); });
      pts=grezzi;
    } else { modo='caso'; pts=sem.p.map(function(p,i){ return {p:p,p1:1-i/n,p2:1-i/n}; }); }
  }
  /* ordine(anno): gli indici dei punti dal più tenace al meno, con il rango di js/citta.js in quell'anno: i primi sono le case che la città lascia per ultime */
  return {p:pts.map(function(q){ return q.p; }), d:d, modo:modo,
    ordine:function(anno){ var f=sf(640,790,anno);
      return pts.map(function(q,i){ return {i:i,s:q.p1+(q.p2-q.p1)*f}; }).sort(function(a,b){ return b.s-a.s; }).map(function(x){ return x.i; }); }};
}

function disegnaRoma(svg,S,W,H){
  var C=(D.CURVE||{}).popolazione, TP=window.RM_TOPO; if(!C||!TP) return;
  var P=C.punti, ALTO=C.banda.map(function(b){ return [b[0],b[2]]; }), BASSO=C.banda.map(function(b){ return [b[0],b[1]]; });
  var oriz=W/H>=1.15, pad=16, cb, kb, gb, s;
  if(oriz){ s=Math.min(H-2*pad,W*0.42); cb=[pad,(H-s)/2,s]; var x0=pad+s+Math.max(26,W*0.035); kb=[x0,pad,W-x0-pad]; var top=pad+(H>420?132:112); gb=[x0,top,W-x0-pad,H-top-pad+4]; }
  else { s=Math.min(W-2*pad-120,(H-92)*0.56); kb=[pad,8,W-2*pad]; cb=[pad,72,s,W-2*pad]; var top2=72+s+10; gb=[pad,top2,W-2*pad,H-top2-2]; }
  var cw=cb[3]||s;      // in verticale il riquadro della città è largo quanto il palco: la legenda sta a destra delle mura
  var defs=el('defs',null,svg);
  var gs=el('linearGradient',{id:'ig-sotto',x1:0,y1:0,x2:0,y2:1},defs); el('stop',{offset:0,'stop-color':'#7A1F2B','stop-opacity':.2},gs); el('stop',{offset:1,'stop-color':'#7A1F2B','stop-opacity':0},gs);
  var gf=el('radialGradient',{id:'ig-suolo',cx:'50%',cy:'46%',r:'62%'},defs); el('stop',{offset:0,'stop-color':'#FFFDF8'},gf); el('stop',{offset:1,'stop-color':'#EFE7D8'},gf);
  var cp=el('clipPath',{id:'ig-cc'},defs); el('rect',{x:cb[0],y:cb[1],width:cw,height:s,rx:14},cp);
  var rv=el('clipPath',{id:'ig-rv'},defs), rvR=el('rect',{x:0,y:0,width:0,height:H},rv);

  /* la città */
  var gc=el('g',{'class':'ig-citta'},svg);
  el('rect',{x:cb[0],y:cb[1],width:cw,height:s,rx:14,'class':'ig-citta-fondo'},gc);
  var mn=[1e9,1e9], mx=[-1e9,-1e9]; TP.mura.forEach(function(p){ mn[0]=Math.min(mn[0],p[0]); mn[1]=Math.min(mn[1],p[1]); mx[0]=Math.max(mx[0],p[0]); mx[1]=Math.max(mx[1],p[1]); });
  var basso=oriz&&s<330, bw=mx[0]-mn[0], bh=mx[1]-mn[1], k=s*(basso?0.7:0.84)/Math.max(bw,bh), ox=cb[0]+s/2-(mn[0]+bw/2)*k, oy=cb[1]+s*(basso?0.42:0.47)-(mn[1]+bh/2)*k;
  function Q(p){ return [ox+p[0]*k, oy+p[1]*k]; }
  var fiume=TP.fiume.map(Q);
  el('polyline',{points:fiume.map(xy).join(' '),'class':'ig-tevere-alone','clip-path':'url(#ig-cc)'},gc);
  el('polyline',{points:fiume.map(xy).join(' '),'class':'ig-tevere','clip-path':'url(#ig-cc)'},gc);
  var muraP=TP.mura.map(Q), dM='M'+muraP.map(xy).join('L')+'Z';
  var muraF=el('path',{d:dM,'class':'ig-mura-fondo'},gc), mura=el('path',{d:dM,'class':'ig-mura-citta'},gc), lm=mura.getTotalLength?mura.getTotalLength():2000;
  mura.style.strokeDasharray=lm+' '+lm; mura.setAttribute('stroke-dashoffset',lm);
  var nord=muraP.reduce(function(a,b){ return b[1]<a[1]?b:a; }), lMura=tx(gc,nord[0],nord[1]-7,'ig-leg-mura','mura di Aureliano','middle');
  var tv=fiume.filter(function(p){ return p[1]>cb[1]+s*0.2 && p[1]<cb[1]+s*0.34 && p[0]>cb[0]+20; })[0]; if(tv) tx(gc,tv[0]-7,tv[1],'ig-leg-tevere','Tevere','end');
  var dove=doveAbitanti(muraP,fiume,120,11,Q,function(p){ return [(p[0]-ox)/k,(p[1]-oy)/k]; }), rr=Math.max(2.4,Math.min(5.5,dove.d*0.31)), annoP=null;
  var punti=dove.p.map(function(p){ return el('circle',{cx:r1(p[0]),cy:r1(p[1]),r:r1(rr),'class':'ig-ab'},gc); }), statoP=[], posto=[];
  var lg=el('g',{'class':'ig-citta-leg'},gc), lx=oriz?cb[0]+12:cb[0]+s+6, ly=oriz?cb[1]+s-30:cb[1]+s-58;
  el('circle',{cx:lx+rr,cy:ly-4,r:rr,'class':'ig-ab pieno fisso'},lg); tx(lg,lx+rr*2+7,ly,'ig-leg','10.000 abitanti');
  el('circle',{cx:lx+rr,cy:ly+16,r:rr,'class':'ig-ab vuoto fisso'},lg);
  if(oriz) tx(lg,lx+rr*2+7,ly+20,'ig-leg','fino alla stima più alta'); else { tx(lg,lx+rr*2+7,ly+20,'ig-leg','fino alla stima'); tx(lg,lx+rr*2+7,ly+35,'ig-leg','più alta'); }
  /* i posti dei punti sono una ricostruzione del modello: lo dice una riga della legenda (in orizzontale in alto a destra, perché in basso toccherebbe le mura) */
  if(dove.modo!=='caso'){ if(oriz) tx(lg,cb[0]+s-12,cb[1]+20,'ig-leg ig-leg-dove','dove: come nella Roma in 3D','end'); else { tx(lg,lx,ly-40,'ig-leg ig-leg-dove','dove: come nella'); tx(lg,lx,ly-25,'ig-leg ig-leg-dove','Roma in 3D'); } }

  /* il contatore */
  var gk=el('g',{'class':'ig-conta'},svg), fsN, tA, tN, tL, tL2=null;
  if(oriz){ fsN=Math.min(66,kb[2]/5.2); tA=tx(gk,kb[0],kb[1]+14,'ig-k-anno',''); tN=tx(gk,kb[0],kb[1]+18+fsN*.84,'ig-k-num',''); tL=tx(gk,kb[0],kb[1]+18+fsN*.84+24,'ig-k-lab','abitanti, secondo le stime'); tL2=tx(gk,kb[0],kb[1]+18+fsN*.84+43,'ig-k-lab2',''); }
  else { fsN=Math.min(42,kb[2]/7.6); tA=tx(gk,kb[0],kb[1]+13,'ig-k-anno',''); tL=tx(gk,kb[0]+kb[2],kb[1]+13,'ig-k-lab','abitanti, secondo le stime','end'); tN=tx(gk,kb[0],kb[1]+16+fsN*.9,'ig-k-num',''); }
  tN.style.fontSize=fsN+'px';

  /* la curva */
  var tkx=gb[2]>520?[235,300,400,476,600,700,852]:gb[2]>300?[235,476,600,852]:[235,476,852];
  var c=grafico(svg,gb,{x0:235,x1:852,y0:0,y1:1250000,tx:tkx,ty:gb[3]>230?[0,250000,500000,750000,1000000]:[0,500000,1000000],sopra:4,
    fy:function(v){ return v>=1e6?'1 milione':v?num(v/1000)+' mila':''; }});
  var gd=el('g',{'clip-path':'url(#ig-rv)'},svg);
  var su=C.banda.map(function(b){ return xy([c.x(b[0]),c.y(b[2])]); }), giu=C.banda.slice().reverse().map(function(b){ return xy([c.x(b[0]),c.y(b[1])]); });
  el('polygon',{points:su.concat(giu).join(' '),'class':'ig-fascia'},gd);
  var dl=P.map(function(p,i){ return (i?'L':'M')+xy([c.x(p[0]),c.y(p[1])]); }).join('');
  el('path',{d:dl+'L'+xy([c.x(852),c.B])+'L'+xy([c.x(235),c.B])+'Z',fill:'url(#ig-sotto)'},gd);
  el('path',{d:dl,'class':'ig-linea'},gd);
  var fN=gb[3]>150&&gb[2]>420?tx(svg,c.x(300)+4,c.y(1080000),'ig-fascia-nome','forchetta delle stime'):null;
  rvR.setAttribute('x',c.L-6); c.sopra();
  var T0=1250, fer=ROMA.momenti.map(function(m){ return {anno:m[0],sosta:2200}; }); fer.push({anno:852,sosta:0});
  var tm=Tempo(235,fer,{inizio:2700,vel:8,min:650});
  var segni=ROMA.momenti.map(function(m,i){ return {t:tm.arrivi[i],fine:tm.arrivi[i+1],g:el('circle',{cx:r1(c.x(m[0])),cy:r1(c.y(valore(P,m[0]))),r:4,'class':'ig-segno'},svg)}; });
  var cur=el('g',{'class':'ig-cursore'},svg), cl=el('line',{x1:0,x2:0,y1:6,y2:0,'class':'ig-cur-linea'},cur); el('circle',{r:9,'class':'ig-cur-alone'},cur); el('circle',{r:5,'class':'ig-cur-punto'},cur);
  var lineaPx=P.map(function(p){ return [c.x(p[0]),c.y(p[1])]; });
  segni.forEach(function(sg,i){ var m=ROMA.momenti[i]; sg.fine=sg.t+2100; sg.n=nota(svg,{x:c.x(m[0]),y:c.y(valore(P,m[0])),anno:m[0],testo:m[2],box:[c.L,c.T-2,c.R,c.B],maxW:oriz?230:170,linea:lineaPx}); });
  /* il finale */
  var tFin=tm.arrivi[ROMA.momenti.length]+700, fin=el('g',{'class':'ig-sintesi'},svg), fx=c.R, fy=c.T+(oriz?30:22);
  tx(fin,fx,fy,'ig-sint-1','Da circa '+num(P[0][1]),'end'); tx(fin,fx,fy+(oriz?32:24),'ig-sint-2','a circa '+num(P[P.length-1][1])+' abitanti','end');

  S.passo=function(t){
    var a=tm.anno(t), v=valore(P,a), ap=E.out(fase(t,T0+100,T0+1500));
    cls(gk,'vis',t>=T0); scrivi(tA,'ROMA · '+Math.round(a)); scrivi(tN,num(Math.round(v*ap/1000)*1000));
    if(tL2) scrivi(tL2,'le stime vanno da '+num(Math.round(valore(BASSO,a)/1e4)*1e4)+' a '+num(Math.round(valore(ALTO,a)/1e4)*1e4));
    var nC=Math.round(v/1e4), nH=Math.round(valore(ALTO,a)/1e4);
    /* il posto di ogni punto nella fila dei più tenaci, ricalcolato quando cambia l'anno */
    var ay=Math.round(a); if(ay!==annoP){ annoP=ay; dove.ordine(ay).forEach(function(i,j){ posto[i]=j; }); }
    for(var i=0;i<punti.length;i++){ var j=posto[i], st=t<T0+150+i*9?'':j<nC?'pieno':j<nH?'vuoto':''; if(statoP[i]!==st){ statoP[i]=st; punti[i].setAttribute('class','ig-ab '+st); } }
    var fm=E.io(fase(t,tm.arrivi[0]-500,tm.arrivi[0]+1300)); fissa(mura,'stroke-dashoffset',r1(lm*(1-fm))); cls(mura,'vis',fm>0); cls(muraF,'vis',fm>=1); cls(lMura,'vis',fm>=1);
    c.vis(t>=T0+500); cls(lg,'vis',t>=T0+900); if(fN) cls(fN,'vis',a>=330);
    var xr=c.x(a), yr=c.y(v); fissa(rvR,'width',r1(Math.max(0,xr-c.L+6)));
    fissa(cur,'transform','translate('+r1(xr)+','+r1(yr)+')'); fissa(cl,'y2',r1(c.B-yr)); cls(cur,'vis',t>=T0+900&&t<tFin);
    segni.forEach(function(sg){ cls(sg.g,'vis',t>=sg.t); cls(sg.n,'vis',t>=sg.t&&t<sg.fine); });
    cls(fin,'vis',t>=tFin);
  };
  S.dura=tFin+4400;
  S.battute=ROMA.momenti.map(function(m,i){ return {t:tm.arrivi[i],anno:m[0],testo:m[1]}; });
}

/* ======================================================================
   2. Senza soldi non c'è esercito
   Rifatta il 24 novembre 2026 (l'utente, per la seconda volta: «non è ancora ben chiaro il collegamento tra i soldi e l'esercito che perde controllo del terreno»;
   il 23: «legenda cliccabile e interattiva»). Non mostra più solo il territorio che cala: mostra il giro che la tesi afferma, terra → tasse → paga → soldati → altra terra,
   e lo fa ripartire a ogni perdita. Nessun numero nuovo: l'unica cifra è la quota dell'Occidente governata da Roma, misurata sulla carta (RM_mappa.territorio, federati
   e contese a metà fino al 480). Le parole degli anelli vengono dalla pagina:
   - tesi di Wickham in js/cause.js («Come pagava Roma i soldati e la corte? Soprattutto con le imposte sulle terre», «la principale singola struttura» dello Stato; «per molti
     storici la perdita di entrate più grave risale al 439»); tesi di Heather (2005, p. 435: chi si insedia nelle province toglie al governo d'Occidente le tasse dei loro
     abitanti); obiezione a Bury in js/cause.js («Heather e Ward-Perkins sottolineano che perdere una provincia significava perdere anche le imposte dei suoi abitanti. Con meno
     entrate diventava più difficile pagare i soldati necessari a difendere le province rimaste»);
   - intermezzo «L'esercito» in js/dati.js (la spesa maggiore dello Stato è l'esercito; le province danno reclute o l'equivalente in oro; nel V secolo combattono sempre più
     gruppi alleati per trattato; Procopio V 1: nel 476 chiedono un terzo delle terre d'Italia, Oreste rifiuta ed è ucciso, Odoacre accetta);
   - tappe del 406, 409, 418 (federati in Aquitania: terre o una parte delle imposte, gli storici discutono), 439 (Cartagine, le province più ricche, il grano), 468 (l'ultima
     flotta: Costantinopoli sostiene quasi tutta la spesa);
   - le due cautele del finale: Bury (una serie di eventi contingenti) e Jones (gli stessi mali nell'Oriente, che sopravvisse), in js/cause.js.
   Non letto, quindi non usato: le Novelle di Valentiniano III sulla cassa vuota (si cercavano il 24 novembre 2026, il testo non si è trovato in rete). Il giro è uno schema:
   quanto calassero tasse, paga e soldati, giro per giro, le fonti non lo dicono, e il disegno non lo misura. */
var TERRE={ titolo:"Senza soldi non c'è esercito", sotto:"Terre, tasse, paga, soldati: il giro che, secondo molti storici, svuota l'Occidente fra il 395 e il 476",
  fasi:[["Il giro","Lo Stato romano paga i soldati soprattutto con le imposte sulle terre. Meno terre, meno imposte; meno imposte, meno paga; meno paga, meno soldati; meno soldati, altre terre perse. È la tesi di Wickham, di Heather e di Ward-Perkins."],
    ["406-409","Vandali, Alani e Svevi passano il Reno. Le truppe della Britannia seguono in Gallia l'usurpatore Costantino III e l'isola resta sola. Le terre perse non pagano più le imposte a Roma."],
    ["418","I Visigoti si stabiliscono in Aquitania come federati: alleati tenuti a combattere per Roma. Gli storici discutono se in cambio abbiano ricevuto terre o una parte delle imposte della regione."],
    ["439","I Vandali prendono Cartagine. Per molti storici è la perdita di entrate più grave: le province più ricche, il loro grano e le loro tasse."],
    ["468","L'ultima flotta per riprendere l'Africa: Costantinopoli ne sostiene quasi tutta la spesa. Fallisce davanti a Capo Bon."],
    ["476","I soldati alleati in Italia chiedono un terzo delle terre, secondo Procopio. Oreste rifiuta ed è ucciso; Odoacre accetta. Al posto della paga, la terra."],
    ["È una tesi","Non tutti la leggono così. Per Bury la fine fu una serie di eventi, ognuno dei quali poteva andare diversamente. Per Jones gli stessi mali c'erano in Oriente, che sopravvisse."]],
  fonte:"Tesi di Wickham, Heather e Ward-Perkins come le riassume «Perché cadde l'Occidente?» in questa pagina; intermezzo «L'esercito» (con Procopio, Guerre V 1) e tappe del 406, 409, 418, 439, 468 e 476. L'unico numero è la quota dell'Occidente governata da Roma, misurata sulla carta di questa pagina: le regioni dei federati e quelle contese contano per metà. Il giro è uno schema: di quanto calassero tasse, paga e soldati, giro per giro, le fonti non lo dicono e il disegno non lo misura. Tocca un anello del giro per leggerne la spiegazione, una voce della legenda per accendere le sue regioni." };
var GRUPPI=[['Britannia',['britannia','galles']],['Gallie',['gallia','bretagna','belgica','soissons','aquitania','alvernia','provenza','settimania','burgundia','sapaudia']],
  ['Hispania',['hispania','baleari','gallaecia','asturie','marca','spania']],
  ['Italia e isole|Italia',['italia_nord','liguria','venezia','ravenna','bolognese','spoleto','pentapoli','roma','campania','napoli','benevento','salento','otranto','calabria','bruzio','sicilia','sardegna','corsica']],
  ['Alpi e Danubio|Danubio',['rezia','carantania','pannonia','dalmazia','decumati']],['Africa',['africa','numidia','mauri','mauretania']]];
/* i quattro anelli del giro: nome, sottotitolo, la frase che porta all'anello seguente, la spiegazione (con la sua fonte) che si legge toccandolo */
var ANELLI=[{k:'terra',n:'TERRA',s:'le province',freccia:'meno terre, meno imposte',
    sp:"Le terre dell'Occidente governate da Roma. La quota è misurata sulla carta di questa pagina: le regioni dei federati e quelle contese contano per metà, fino al 480.",f:'misura della carta di questa pagina'},
  {k:'tasse',n:'TASSE',s:'sulla terra',freccia:'meno imposte, meno paga',
    sp:"Roma pagava soldati e corte soprattutto con le imposte sulle terre: per Wickham «la principale singola struttura» dello Stato. Chi perde una provincia perde le imposte dei suoi abitanti.",f:'Wickham 2005; Heather 2005, p. 435'},
  {k:'paga',n:'PAGA',s:'dei soldati',freccia:'meno paga, meno soldati',
    sp:"La spesa maggiore dello Stato romano è l'esercito. Ogni anno le province devono dare reclute o versare l'equivalente in oro.",f:"intermezzo «L'esercito»"},
  {k:'soldati',n:'SOLDATI',s:'e federati',freccia:'meno soldati, altre terre perse',
    sp:"Con meno entrate diventa più difficile pagare i soldati che difendono le province rimaste. Nel V secolo combattono sempre più alleati per trattato, compensati anche con terre.",f:"Heather e Ward-Perkins; intermezzo «L'esercito»"}];
var GIRI=[{anno:409,nodo:0,tit:'Il Reno e la Britannia',riga:'le terre perse non pagano più le imposte a Roma',f:'tappe del 406 e del 409'},
  {anno:418,nodo:3,tit:'I Visigoti federati',riga:'alleati in Aquitania: in cambio terre o imposte, si discute',f:'tappa del 418'},
  {anno:439,nodo:1,tit:'Cartagine',riga:'per molti storici la perdita di entrate più grave',f:'tappa del 439; Wickham'},
  {anno:468,nodo:2,tit:"L'ultima flotta",riga:'Costantinopoli ne paga quasi tutta la spesa',f:'tappa del 468'},
  {anno:476,nodo:3,tit:'Un terzo delle terre',riga:'i soldati alleati chiedono terre, Odoacre accetta',f:'Procopio V 1'}];
function disegnaTerre(svg,S,W,H){
  var M=window.RM_mappa, G=window.RM_MAPPA; if(!M||!M.territorio||!G) return;
  var TP=(D.TAPPE||[]).filter(function(t){ return t.regioni && !t.intermezzo && t.anno>=395 && t.anno<=476; }); if(!TP.length) return;
  function tappaA(a){ var s=TP[0]; TP.forEach(function(t){ if(t.anno<=a) s=t; }); return s; }
  var P=[{anno:395,stati:TP[0].regioni,v:M.territorio(TP[0].regioni,TP[0].anno)}].concat(GIRI.map(function(g){ var t=tappaA(g.anno); return {anno:g.anno,stati:t.regioni,v:M.territorio(t.regioni,t.anno)}; }));
  var ovest=Object.keys(G.regioni).filter(function(id){ return !G.regioni[id].est && !G.regioni[id].oltre; }), messi={};
  var colori={}; (M.vociPresenti?M.vociPresenti(P.map(function(p){ return p.stati; }),476):[]).forEach(function(v){ colori[v[2]]=v[0]; });
  var oriz=W/H>=1.15, pad=oriz?16:10, defs=el('defs',null,svg), i;
  /* le misure: il giro a sinistra (sul telefono in piedi in alto), il numero e il mosaico a destra (sotto) */
  var gb, xR, wR;
  if(oriz){ var lato=Math.min(H-2*pad,W*.5); gb=[pad,pad,lato,H-2*pad]; xR=pad+lato+22; wR=W-xR-pad; }
  else { gb=[pad,pad,W-2*pad,Math.min(W-2*pad,H*.62)]; xR=pad; wR=W-2*pad; }
  var did=30, cx=gb[0]+gb[2]/2, cy=gb[1]+(gb[3]-did)/2, mn=Math.min(gb[2],gb[3]-did), rn=clamp(mn*.13,25,46), R=mn/2-rn-6, A=[-90,0,90,180];
  function polare(a,r){ var q=a*Math.PI/180; return [cx+Math.cos(q)*r, cy+Math.sin(q)*r]; }
  /* il giro: il cerchio di fondo, i quattro archi con la punta, i quattro anelli */
  var gG=el('g',{'class':'ig-tr-giro'},svg);
  el('circle',{cx:r1(cx),cy:r1(cy),r:r1(R),'class':'ig-tr-orbita'},gG);
  var da=Math.asin(Math.min(.95,(rn+6)/R))*180/Math.PI, archi=A.map(function(a,j){ var a1=a+da, a2=A[(j+1)%4]+(j===3?360:0)-da-2, p1=polare(a1,R), p2=polare(a2,R), g=el('g',{'class':'ig-tr-arco'},gG);
    var p=el('path',{d:'M'+xy(p1)+' A'+r1(R)+' '+r1(R)+' 0 0 1 '+xy(p2)},g), tg=a2+90;
    el('path',{d:'M3 0 L-8 -5.5 L-5.5 0 L-8 5.5 Z',transform:'translate('+xy(polare(a2+1,R))+') rotate('+r1(tg)+')','class':'ig-tr-punta'},g); return g; });
  var palla=el('circle',{r:r1(clamp(rn*.17,5,8)),'class':'ig-tr-palla'},gG);      // sotto gli anelli: passa dietro le parole
  var nodi=ANELLI.map(function(an,j){ var q=polare(A[j],R), g=el('g',{'class':'ig-tr-nodo '+an.k,transform:'translate('+xy(q)+')',tabindex:0,role:'button','aria-label':an.n.toLowerCase()+', '+an.s+': spiegazione'},gG);
    el('circle',{r:r1(rn),'class':'ig-tr-nodo-c'},g); var t1=tx(g,0,rn>32?-1:2,'ig-tr-nodo-n',an.n,'middle'); t1.style.fontSize=r1(clamp(rn*.34,10.5,15))+'px';
    if(rn>30){ var t2=tx(g,0,rn*.36,'ig-tr-nodo-s',an.s,'middle'); t2.style.fontSize=r1(clamp(rn*.24,9.5,12))+'px'; }
    return g; });
  /* al centro: il giro in corso */
  var wc=2*(R-rn)-18, gC=el('g',{'class':'ig-tr-centro'},gG), cA=tx(gC,cx,cy-8,'ig-tr-c-anno','','middle'), cT=tx(gC,cx,cy+12,'ig-tr-c-tit','','middle'), cR=el('text',{x:r1(cx),y:r1(cy+30),'class':'ig-tr-c-riga','text-anchor':'middle'},gC), cF=tx(gC,cx,cy+60,'ig-tr-c-fonte','','middle');
  cA.style.fontSize=r1(clamp(wc/4.6,22,40))+'px';
  var cap=tx(gG,cx,gb[1]+gb[3]-8,'ig-tr-frase','','middle');
  function centro(anno,tit,riga,fonte){ var fa=parseFloat(cA.style.fontSize); scrivi(cA,anno); cT.textContent=''; var nt=tit?avvolgi(cT,tit,wc,13):0; cR.textContent=''; var nr=riga?avvolgi(cR,riga,wc,14):0; scrivi(cF,fonte||'');
    var hTot=fa*.8+(nt?6+nt*13:0)+(nr?6+nr*14:0)+(fonte?18:0), y=cy-hTot/2+fa*.8; cA.setAttribute('y',r1(y)); y+=nt?6+13:0; cT.setAttribute('y',r1(y)); [].forEach.call(cT.childNodes,function(c){ c.setAttribute('x',r1(cx)); });
    var yy=y; [].forEach.call(cT.childNodes,function(c,ii){ if(ii) yy+=13; }); y=yy+(nr?6+14:0); cR.setAttribute('y',r1(y)); [].forEach.call(cR.childNodes,function(c){ c.setAttribute('x',r1(cx)); }); yy=y; [].forEach.call(cR.childNodes,function(c,ii){ if(ii) yy+=14; }); cF.setAttribute('y',r1(yy+18)); }
  /* a destra (sotto): la quota misurata e il mosaico delle regioni */
  var gK=el('g',{'class':'ig-conta'},svg), fsN=oriz?Math.min(60,wR/4.2,H*.16):Math.min(38,W/9), yK=oriz?pad+14:gb[1]+gb[3]+16;
  var kA=tx(gK,xR,yK,'ig-k-anno','OCCIDENTE · 395'), kN=tx(gK,xR,yK+6+fsN*.86,'ig-k-num',''), kL=el('text',{x:r1(xR+(oriz?0:fsN*2.5)),y:r1(oriz?yK+fsN*.86+26:yK+fsN*.5),'class':'ig-k-lab'},gK); kN.style.fontSize=fsN+'px';
  avvolgi(kL,'governato da Roma, misurato sulla carta',oriz?wR:wR-fsN*2.5,16);
  var legIn=oriz&&H>=450, legH=legIn?58:0, tb=oriz?[xR,yK+fsN*.86+(kL.childNodes.length>1?56:40),wR,0]:[xR,yK+fsN*.86+16,wR,0]; tb[3]=Math.max(40,H-pad-legH-tb[1]);
  var gruppi=GRUPPI.map(function(g){ var ids=g[1].filter(function(id){ return ovest.indexOf(id)>=0; }); ids.forEach(function(id){ messi[id]=1; }); return {nome:g[0],ids:ids}; });
  var altri=ovest.filter(function(id){ return !messi[id]; }); if(altri.length) gruppi.push({nome:'Altre',ids:altri});
  gruppi.forEach(function(g){ g.v=0; g.ids.forEach(function(id){ g.v+=G.regioni[id].peso; }); }); gruppi=gruppi.filter(function(g){ return g.v>0; }).sort(function(a,b){ return b.v-a.v; });
  var pt=el('pattern',{id:'ig-trama',width:7,height:7,patternUnits:'userSpaceOnUse',patternTransform:'rotate(40)'},defs); el('rect',{width:7,height:7,fill:'#DCD0B8'},pt); el('rect',{width:3.2,height:7,fill:'#9A2F2A'},pt);
  squarify(gruppi,tb[0],tb[1],tb[2],tb[3]);
  var gt=el('g',{'class':'ig-mosaico'},svg), gx=el('g',{'class':'ig-mosaico-testi'},svg), tessere=[];
  gruppi.forEach(function(gr){ var r=gr.r, x=r[0]+2, y=r[1]+2, w=r[2]-4, hh=r[3]-4, voci=gr.ids.map(function(id){ return {id:id,v:G.regioni[id].peso}; }).sort(function(a,b){ return b.v-a.v; });
    squarify(voci,x,y,w,hh);
    if(w>56&&hh>24){ var nomi=gr.nome.split('|'), gn=null; for(var z=0;z<nomi.length&&!gn;z++){ gn=tx(gx,x+6,y+15,'ig-gr-nome',nomi[z].toUpperCase()); if(largo(gn)>w-10){ gn.remove(); gn=null; } } }
    voci.forEach(function(it,j){ var q=it.r, rect=el('rect',{x:r1(q[0]+.7),y:r1(q[1]+.7),width:r1(Math.max(0,q[2]-1.4)),height:r1(Math.max(0,q[3]-1.4)),'class':'ig-tes'},gt); tessere.push({id:it.id,rect:rect,st:null}); }); });
  /* la legenda degli stati: si tocca, e accende le regioni di quel colore */
  var leg=legIn?S.strato('ig-legenda in-riga ig-tr-leg'):S.fuori('ig-legenda ig-tr-leg'), fuoco=null;      // sul telefono, anche coricato, la legenda sta nella colonna del testo
  if(legIn){ leg.style.left=xR+'px'; leg.style.top=(H-pad-legH+6)+'px'; leg.style.width=wR+'px'; leg.style.maxHeight=(legH-4)+'px'; }
  leg.setAttribute('role','group'); leg.setAttribute('aria-label','Legenda: tocca un colore per accendere le sue regioni');
  function voci(j){ var ci={}; ovest.forEach(function(id){ ci[P[j].stati[id]||'perso']=1; }); return (M.vociPresenti?M.vociPresenti([P[j].stati],P[j].anno):[]).filter(function(v){ return ci[v[2]]; }); }
  function accendi(){ tessere.forEach(function(q){ var s=q.st||'perso'; cls(q.rect,'spento',!!fuoco&&s!==fuoco); cls(q.rect,'acceso',!!fuoco&&s===fuoco); }); [].forEach.call(leg.children,function(b){ b.setAttribute('aria-pressed',b._st===fuoco?'true':'false'); }); }
  function legenda(j){ leg.textContent=''; var vs=voci(j); if(fuoco&&!vs.some(function(v){ return v[2]===fuoco; })) fuoco=null;
    vs.forEach(function(v){ var b=h('button','ig-chip ig-chip-b',null,leg); b.type='button'; b._st=v[2]; h('i',null,null,b).style.background=v[0]; h('span',null,v[1],b);
      b.addEventListener('click',function(){ fuoco=fuoco===v[2]?null:v[2]; accendi(); }); }); accendi(); }
  /* la spiegazione di un anello, toccandolo: nella colonna del testo; l'animazione si ferma */
  var sch=S.fuori('ig-tr-scheda'), schOra=-1; sch.setAttribute('aria-live','polite'); sch.hidden=true;
  function scheda(j){ schOra=schOra===j?-1:j; nodi.forEach(function(g,ii){ cls(g,'scelto',ii===schOra); g.setAttribute('aria-pressed',ii===schOra?'true':'false'); }); sch.textContent=''; sch.hidden=schOra<0; if(schOra<0) return;
    var an=ANELLI[j]; h('b',null,an.n.charAt(0)+an.n.slice(1).toLowerCase()+' · '+an.s,sch); h('p',null,an.sp,sch); h('span','ig-tr-scheda-f',an.f,sch); }
  nodi.forEach(function(g,j){ g.addEventListener('click',function(){ if(S.ferma) S.ferma(); scheda(j); });
    g.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); if(S.ferma) S.ferma(); scheda(j); } }); });
  /* la regia: un primo giro che disegna la catena, poi un giro per ogni perdita, che parte dall'anello in cui la perdita cade */
  var T0=1400, PA=1150, TR=T0+4*PA+700, DR=5400, TF=TR+GIRI.length*DR, visto=-2;
  function giroDi(t){ return t<TR?-1:Math.min(GIRI.length-1,Math.floor((t-TR)/DR)); }
  S.passo=function(t){
    var g=t>=TF?GIRI.length:giroDi(t), j=g<0?0:Math.min(g+1,P.length-1), ang, attivo=-1, fatti=4;
    if(t<TR){ var f=clamp((t-T0)/(4*PA),0,1); ang=A[0]+360*f; attivo=t<T0?-1:Math.min(3,Math.floor(f*4)); fatti=Math.max(0,attivo); }
    else if(g<GIRI.length){ var t0=TR+g*DR+900, f2=clamp((t-t0)/(4*1050),0,1), n0=GIRI[g].nodo; ang=A[n0]+360*f2; attivo=t<t0?-1:(n0+Math.min(3,Math.floor(f2*4)))%4; }
    else ang=A[0];
    var p=polare(ang,R); fissa(palla,'cx',r1(p[0])); fissa(palla,'cy',r1(p[1])); cls(palla,'vis',t>=T0&&t<TF+400);
    archi.forEach(function(a,ii){ cls(a,'vis',t>=TR||ii<fatti||ii===attivo); cls(a,'attivo',ii===attivo); });
    nodi.forEach(function(n,ii){ cls(n,'vis',t>=T0-600+ii*150); cls(n,'evento',g>=0&&g<GIRI.length&&GIRI[g].nodo===ii); });
    scrivi(cap,attivo>=0?ANELLI[attivo].freccia:t>=TF?'il giro, secondo Wickham, Heather e Ward-Perkins':'');
    if(g!==visto){ visto=g; if(g<0) centro('395','Il giro','',''); else if(g<GIRI.length) centro(String(GIRI[g].anno),GIRI[g].tit,GIRI[g].riga,GIRI[g].f); else centro('476','È una tesi','non tutti la leggono così','«Perché cadde l\'Occidente?»'); legenda(j); }
    cls(gG,'vis',t>=T0-900); cls(gC,'vis',t>=T0-400);
    /* la quota: scende all'inizio di ogni giro */
    var v=j===0?P[0].v*E.out(fase(t,T0,T0+1600)):lerp(P[j-1].v,P[j].v,E.out(fase(t,TR+(j-1)*DR,TR+(j-1)*DR+900)));
    scrivi(kA,'OCCIDENTE · '+P[j].anno); scrivi(kN,Math.round(v)+'%'); cls(gK,'vis',t>=T0);
    tessere.forEach(function(q){ var st=P[j].stati[q.id]||'perso', base=st.indexOf('regno:')===0?'regno':st; if(q.st!==st){ q.st=st; q.rect.setAttribute('class','ig-tes vis '+base); q.rect.style.color=st.indexOf('regno:')===0&&colori[st]?colori[st]:''; } });
    if(fuoco) accendi(); cls(gt,'vis',t>=T0+300); cls(gx,'vis',t>=T0+600); cls(leg,'vis',t>=T0+600);
  };
  S.dura=TF+5200;
  S.battute=TERRE.fasi.map(function(f,ii){ return {t:ii===0?T0:ii<=GIRI.length?TR+(ii-1)*DR:TF,anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   3. La moneta perde l'argento
   Una moneta col busto radiato (come gli antoniniani del III secolo; schema, nessuna moneta precisa) che passa dal colore dell'argento a quello del rame seguendo CURVE.argento
   (Walker in Katsari 2002, RIC online, Burnett, Estiot; valori indicativi), la barra dell'argento e la curva colorata dall'argento al rame. Nel finale il solido d'oro
   (309-312, frase già nelle fonti dell'infografica), col diadema e senza raggi. I momenti vengono dai testi del 274 e dell'intermezzo della moneta (284). */
var MONETA={ titolo:"La moneta perde l'argento", sotto:"Quanto argento c'era nella moneta d'argento, dal 235 al 308",
  momenti:[[235,"Il denario contiene ancora quasi metà d'argento.","Quasi metà d'argento"],[260,"Sotto Gallieno l'argento scende a meno di un quinto.","Gallieno: meno di un quinto"],
    [268,"Sotto Claudio II la moneta è ormai quasi tutta di rame: meno del 3%.","Claudio II: meno del 3%"],
    [274,"Aureliano stabilisce che la moneta contenga almeno il 5% d'argento.","Aureliano: almeno il 5%"],[294,"Diocleziano introduce una moneta nuova, il nummo, con circa il 4%.","Diocleziano: il nummo"],
    [301,"Diocleziano raddoppia per legge il valore delle monete e fissa più di 1.200 prezzi massimi.","L'editto dei prezzi"]],
  solido:"Tra il 309 e il 312 compare il solido d'oro, stabile per secoli.",
  fonte:"Percentuali indicative: le analisi della superficie delle monete sovrastimano l'argento (Butcher e Ponting). Dati di Walker (in Katsari 2002), RIC online, Burnett ed Estiot; l'editto dei prezzi del 301 nell'edizione di Kropff (2016). Tra il 309 e il 312 compare il solido d'oro, stabile per secoli. Le monete disegnate sono uno schema, non la copia di una moneta precisa." };
var METALLI={ argento:[[247,248,250],[201,205,211],[125,131,140]], rame:[[242,180,138],[184,105,58],[94,46,20]], oro:[[255,241,184],[217,169,58],[122,86,23]] };
function mescola(a,b,k){ return 'rgb('+a.map(function(c,i){ return Math.round(c+(b[i]-c)*k); }).join(',')+')'; }
/* la moneta in un cerchio di raggio 100: bordo, perline, busto in rilievo, corona radiata o diadema */
function moneta(p,id,corona){
  var g=el('g',{'class':'ig-moneta'},p);
  el('circle',{cx:0,cy:6,r:100,fill:'url(#'+id+'-o)'},g);      // lo spessore
  el('circle',{cx:0,cy:0,r:100,fill:'url(#'+id+')'},g);
  el('circle',{cx:0,cy:0,r:99,fill:'none',stroke:'rgba(255,255,255,.35)','stroke-width':1.5},g);
  el('circle',{cx:0,cy:0,r:86,fill:'none',stroke:'rgba(0,0,0,.22)','stroke-width':2},g);
  el('circle',{cx:0,cy:0,r:87.5,fill:'none',stroke:'rgba(255,255,255,.28)','stroke-width':1},g);
  var pe=el('g',null,g); for(var i=0;i<60;i++){ var a=i/60*Math.PI*2, x=Math.cos(a)*93, y=Math.sin(a)*93; el('circle',{cx:r1(x+.7),cy:r1(y+.8),r:2.3,fill:'rgba(0,0,0,.25)'},pe); el('circle',{cx:r1(x),cy:r1(y),r:2.3,fill:'rgba(255,255,255,.38)'},pe); }
  /* busto di profilo verso destra col mantello sulle spalle; barba corta solo sulla moneta del III secolo (schema, nessun imperatore preciso) */
  var busto='M-16 22 C-34 14 -40 -8 -36 -26 C-32 -48 -12 -60 8 -56 C22 -53 30 -42 30 -30 C31 -26 33 -24 32 -21 L40 -8 C38 -5 35 -4 33 -4 C34 -1 34 1 32 2 C34 4 33 6 31 7 C32 14 26 20 16 21 C12 24 12 28 14 32 C18 36 26 40 34 44 C46 50 54 62 56 80 L-58 80 C-56 60 -46 46 -30 40 C-22 36 -18 30 -16 22 Z';
  el('path',{d:busto,transform:'translate(2.2,2.6)',fill:'rgba(0,0,0,.3)'},g); el('path',{d:busto,transform:'translate(-1.4,-1.6)',fill:'rgba(255,255,255,.45)'},g);
  el('path',{d:busto,fill:'url(#'+id+')'},g); el('path',{d:busto,fill:'rgba(0,0,0,.06)'},g);
  var dett='M20 -23 q4 -2.4 7 0 M-12 -18 c-4 3 -4 9 0 12 M-28 -30 c4 -5 10 -6 15 -3 M-30 -14 c4 -5 10 -6 15 -3 M-22 0 c4 -4 9 -5 13 -2 M-4 -44 c4 -4 10 -5 15 -2 '+(corona?'M14 10 c2 3 6 4 10 2 M8 16 c2 3 6 4 10 2 M18 2 c2 2 5 3 8 2':'')+
    ' M-40 58 C-20 50 0 52 22 60 M-34 72 C-12 63 14 65 38 76 M-6 40 C-2 46 4 50 12 50';
  el('path',{d:dett,fill:'none',stroke:'rgba(0,0,0,.26)','stroke-width':2.2,'stroke-linecap':'round'},g);
  el('path',{d:dett,transform:'translate(-.9,-.9)',fill:'none',stroke:'rgba(255,255,255,.32)','stroke-width':1.3,'stroke-linecap':'round'},g);
  el('circle',{cx:-22,cy:50,r:4.2,fill:'none',stroke:'rgba(0,0,0,.28)','stroke-width':2},g);
  if(corona){ var cr=el('g',null,g); for(var j=0;j<8;j++){ var b=(-162+j*16)*Math.PI/180, r0=37, r2=56, w=.1, cy0=-20;
      var pts=[[Math.cos(b-w)*r0,Math.sin(b-w)*r0+cy0],[Math.cos(b)*r2,Math.sin(b)*r2+cy0],[Math.cos(b+w)*r0,Math.sin(b+w)*r0+cy0]].map(xy).join(' ');
      el('polygon',{points:pts,transform:'translate(1.6,1.8)',fill:'rgba(0,0,0,.26)'},cr); el('polygon',{points:pts,fill:'url(#'+id+')',stroke:'rgba(255,255,255,.35)','stroke-width':.8},cr); }
    el('path',{d:'M-36 -22 C-30 -44 -6 -56 16 -50 C22 -48 26 -44 28 -40',fill:'none',stroke:'rgba(0,0,0,.3)','stroke-width':4,'stroke-linecap':'round'},g); }
  else { el('path',{d:'M-36 -20 C-30 -42 -6 -54 16 -48 C22 -46 26 -42 28 -38',fill:'none',stroke:'rgba(0,0,0,.25)','stroke-width':5,'stroke-linecap':'round'},g);
    el('path',{d:'M-36 -20 C-30 -42 -6 -54 16 -48 C22 -46 26 -42 28 -38',fill:'none',stroke:'rgba(255,255,255,.5)','stroke-width':2.2,'stroke-dasharray':'2 5','stroke-linecap':'round'},g);
    el('path',{d:'M-37 -20 c-6 4 -8 10 -6 16 M-37 -20 c-3 6 -2 12 1 17',fill:'none',stroke:'rgba(0,0,0,.25)','stroke-width':1.8,'stroke-linecap':'round'},g); }
  el('circle',{cx:0,cy:0,r:100,fill:'url(#ig-luccica)','class':'ig-luccica'},g);
  return g;
}
function gradMetallo(defs,id){
  var g=el('radialGradient',{id:id,cx:'36%',cy:'30%',r:'78%'},defs), s=[el('stop',{offset:0},g),el('stop',{offset:.5},g),el('stop',{offset:1},g)];
  var o=el('linearGradient',{id:id+'-o',x1:0,y1:0,x2:0,y2:1},defs), so=[el('stop',{offset:0},o),el('stop',{offset:1},o)];
  return function(m){ [0,1,2].forEach(function(i){ fissa(s[i],'stop-color',m[i]); }); fissa(so[0],'stop-color',m[1]); fissa(so[1],'stop-color',m[2]); };
}
function disegnaMoneta(svg,S,W,H){
  var C=(D.CURVE||{}).argento; if(!C) return; var P=C.punti;
  var oriz=W/H>=1.15, pad=16, cx, cy, r, kb, cb, gb, fsN, zw=0;
  if(oriz){ zw=Math.min(W*0.36,H*0.95); r=Math.min(zw*0.36,H*0.25); cx=pad+zw/2; cy=pad+r+14; fsN=Math.min(62,zw/3.2); kb=[pad+zw/2,cy+r+22+fsN*.8,zw*0.78];
    gb=[pad+zw+26,pad+6,W-(pad+zw+26)-pad,H-2*pad-4]; }
  else { r=Math.min(W*0.15,H*0.12); cx=pad+r+2; cy=pad+r+8; fsN=Math.min(46,W/7.4); kb=[cx+r+22,pad+4,W-(cx+r+22)-pad]; gb=[pad,cy+r+26,W-2*pad,H-(cy+r+26)-2]; }
  var defs=el('defs',null,svg), met=gradMetallo(defs,'ig-met'), oro=gradMetallo(defs,'ig-oro'); oro(METALLI.oro.map(function(c){ return 'rgb('+c.join(',')+')'; }));
  var lu=el('linearGradient',{id:'ig-luccica',gradientUnits:'userSpaceOnUse',x1:-70,y1:-100,x2:70,y2:100},defs);
  [[0,0],[.42,0],[.5,.6],[.58,0],[1,0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':'#fff','stop-opacity':q[1]},lu); });
  var ag=el('linearGradient',{id:'ig-ag',gradientUnits:'userSpaceOnUse',x1:0,x2:0,y1:0,y2:0},defs); el('stop',{offset:0,'stop-color':'#C9CDD3'},ag); el('stop',{offset:.55,'stop-color':'#C89A78'},ag); el('stop',{offset:1,'stop-color':'#B8693A'},ag);
  var al=el('linearGradient',{id:'ig-agl',gradientUnits:'userSpaceOnUse',x1:0,x2:0,y1:0,y2:0},defs); el('stop',{offset:0,'stop-color':'#6F7680'},al); el('stop',{offset:1,'stop-color':'#8A4A26'},al);
  var rv=el('clipPath',{id:'ig-rv'},defs), rvR=el('rect',{x:0,y:0,width:0,height:H},rv);
  /* la curva */
  var tkx=gb[2]>480?[235,250,260,268,274,284,294,301,308]:gb[2]>300?[235,260,274,294,308]:[235,268,308];
  var c=grafico(svg,gb,{x0:235,x1:308,y0:0,y1:50,tx:tkx,ty:gb[3]>220?[0,10,20,30,40,50]:[0,25,50],sopra:4,fy:function(v){ return v?v+'%':''; }});
  [ag,al].forEach(function(g){ g.setAttribute('y1',r1(c.y(45))); g.setAttribute('y2',r1(c.y(0))); });
  var gd=el('g',{'clip-path':'url(#ig-rv)'},svg), dl=P.map(function(p,i){ return (i?'L':'M')+xy([c.x(p[0]),c.y(p[1])]); }).join('');
  el('path',{d:dl+'L'+xy([c.x(308),c.B])+'L'+xy([c.x(235),c.B])+'Z',fill:'url(#ig-ag)','class':'ig-ag-area'},gd); el('path',{d:dl,'class':'ig-linea metallo'},gd);
  rvR.setAttribute('x',c.L-6); c.sopra();
  /* la moneta */
  var gm=el('g',{'class':'ig-mon-posto'},svg), ombra=el('ellipse',{cx:r1(cx),cy:r1(cy+r*1.06),rx:r1(r*0.86),ry:r1(r*0.12),'class':'ig-mon-ombra'},gm), mon=moneta(gm,'ig-met',true), luc=lu;
  /* il contatore e la barra */
  var gk=el('g',{'class':'ig-conta'},svg), an=oriz?'middle':'start', tN, tL, tA, bw=oriz?kb[2]:Math.min(kb[2],190), bx=oriz?kb[0]-bw/2:kb[0], by;
  if(oriz){ tA=tx(gk,kb[0],Math.max(14,cy-r-16),'ig-k-anno','',an); tN=tx(gk,kb[0],kb[1],'ig-k-num','',an); tL=tx(gk,kb[0],kb[1]+22,'ig-k-lab',"d'argento nella moneta",an); by=kb[1]+40; }
  else { tA=tx(gk,kb[0],kb[1]+12,'ig-k-anno',''); tN=tx(gk,kb[0],kb[1]+14+fsN*.88,'ig-k-num',''); tL=tx(gk,kb[0],kb[1]+14+fsN*.88+18,'ig-k-lab',"d'argento nella moneta"); by=kb[1]+14+fsN*.88+30; }
  tN.style.fontSize=fsN+'px';
  var barra=el('g',{'class':'ig-barra-lega'},gk); el('rect',{x:r1(bx),y:r1(by),width:r1(bw),height:9,rx:4.5,'class':'ig-barra-rame'},barra);
  var bAg=el('rect',{x:r1(bx),y:r1(by),width:0,height:9,rx:4.5,'class':'ig-barra-ag'},barra), tBa=tx(barra,bx,by+24,'ig-leg','argento');
  /* note, cursore */
  var T0=1250, fer=MONETA.momenti.map(function(m){ return {anno:m[0],sosta:2600}; }); fer.push({anno:308,sosta:0});
  var tm=Tempo(235,fer,{inizio:3300,vel:38,min:800}), n=MONETA.momenti.length;
  var segni=MONETA.momenti.map(function(m,i){ return {t:tm.arrivi[i],fine:tm.arrivi[i+1],g:el('circle',{cx:r1(c.x(m[0])),cy:r1(c.y(valore(P,m[0]))),r:4,'class':'ig-segno'},svg)}; });
  var cur=el('g',{'class':'ig-cursore'},svg), cl=el('line',{x1:0,x2:0,y1:6,y2:0,'class':'ig-cur-linea'},cur); el('circle',{r:9,'class':'ig-cur-alone'},cur); el('circle',{r:5,'class':'ig-cur-punto metallo'},cur);
  var lineaPx=P.map(function(p){ return [c.x(p[0]),c.y(p[1])]; });
  segni.forEach(function(sg,i){ var m=MONETA.momenti[i]; sg.fine=sg.t+2450; sg.n=nota(svg,{x:c.x(m[0]),y:c.y(valore(P,m[0])),anno:m[0],testo:m[2],box:[c.L,c.T-2,c.R,c.B],maxW:oriz?230:170,linea:lineaPx}); });
  /* il finale: il solido d'oro, nell'angolo alto a destra della curva, dove la linea è ormai bassa */
  var tSol=tm.arrivi[n]+900, rs=Math.min(r*0.72,(c.B-c.T)*0.26,62), sxo=c.R-rs-8, syo=c.T+rs+6;
  var gso=el('g',{'class':'ig-solido'},svg), sol=el('g',{transform:'translate('+r1(sxo)+','+r1(syo)+') scale('+r1(rs/100*1000)/1000+')'},gso); moneta(sol,'ig-oro',false);
  var ts1=tx(gso,sxo-rs-12,syo-4,'ig-sol-1',"il solido d'oro",'end'), ts2=tx(gso,sxo-rs-12,syo+15,'ig-sol-2','309–312','end');
  S.passo=function(t){
    var a=tm.anno(t), v=valore(P,a), ks=clamp(v/45,0,1), f=fase(t,T0,T0+1800), fe=E.out(f);
    met([0,1,2].map(function(i){ return mescola(METALLI.rame[i],METALLI.argento[i],ks); }));
    var giro=(1-fe)*Math.PI*5, sx=Math.cos(giro), sc=r/100, dy=-46*(1-E.out(fase(t,T0,T0+1100)));
    fissa(mon,'transform','translate('+r1(cx)+','+r1(cy+dy)+') scale('+(Math.round(sx*sc*1000)/1000)+','+(Math.round(sc*1000)/1000)+')');
    cls(gm,'vis',t>=T0); fissa(ombra,'rx',r1(r*0.86*Math.max(.15,Math.abs(sx))));
    var lp=-1.4; [[T0+1500,T0+2700]].concat(segni.map(function(sg){ return [sg.t,sg.t+1200]; })).forEach(function(w){ if(t>=w[0]&&t<=w[1]) lp=lerp(-1.3,1.3,E.io(fase(t,w[0],w[1]))); });
    fissa(luc,'gradientTransform','translate('+r1(lp*170)+',0)');
    var mostra=t>=T0+700, vv=v*E.out(fase(t,T0+700,T0+2200))+(1-E.out(fase(t,T0+700,T0+2200)))*0;
    cls(gk,'vis',mostra); scrivi(tN,virgola(Math.round(vv*10)/10)+'%'); scrivi(tA,'ANNO '+Math.round(a));
    fissa(bAg,'width',r1(bw*clamp(vv/100,0,1)));
    c.vis(t>=T0+900);
    var xr=c.x(a), yr=c.y(v); fissa(rvR,'width',r1(Math.max(0,xr-c.L+6))); fissa(cur,'transform','translate('+r1(xr)+','+r1(yr)+')'); fissa(cl,'y2',r1(c.B-yr)); cls(cur,'vis',t>=T0+1200&&t<tSol);
    segni.forEach(function(sg){ cls(sg.g,'vis',t>=sg.t); cls(sg.n,'vis',t>=sg.t&&t<sg.fine); });
    var fs=fase(t,tSol,tSol+1300); cls(gso,'vis',fs>0); fissa(sol,'transform','translate('+r1(sxo+(1-E.out(fs))*60)+','+r1(syo)+') rotate('+r1((1-E.out(fs))*120)+') scale('+r1(rs/100*Math.max(.01,E.back(fs))*1000)/1000+')');
    cls(ts1,'vis',fs>=.6); cls(ts2,'vis',fs>=.6); var fin=t>=tSol; if(tL._fin!==fin){ tL._fin=fin; tL.textContent=''; var nr=avvolgi(tL,fin?"d'argento nel 308 · era il "+P[0][1]+'% nel 235':"d'argento nella moneta",oriz?zw*0.98:W-kb[0]-pad,16); fissa(barra,'transform','translate(0,'+(nr-1)*16+')'); }
  };
  S.dura=tSol+5200;
  S.battute=MONETA.momenti.map(function(m,i){ return {t:tm.arrivi[i],anno:m[0],testo:m[1]}; }).concat([{t:tSol,anno:'309–312',testo:MONETA.solido}]);
}

/* ======================================================================
   4. Il sacco del 410, in pochi giorni
   Pianta notturna con le mura, il Tevere e le strade del modello (RM_TOPO, da OpenStreetMap). La vista si avvicina alla porta, ai fuochi, al Foro e si riapre sulle basiliche.
   Le fasi e i luoghi sono quelli della didascalia della città (EVENTI sacco410: Procopio III 2, Orosio VII 39, Marcellino Comes); la basilica Emilia è detta «probabilmente»
   come lì e ha un cerchio tratteggiato. Il campo è segnato fuori dalla porta senza un luogo preciso (Procopio dice solo che Alarico era accampato lì); dove i Goti siano passati
   dopo la porta non è scritto: nessuna freccia dentro la città. L'orologio dei giorni non assegna i fatti a un giorno: dice solo quanto dura il saccheggio per Orosio e per Marcellino. */
var SACCO={ titolo:"Il sacco del 410", sotto:"Che cosa dicono le fonti, giorno per giorno", notte:true,
  fasi:["24 agosto 410: i Goti di Alarico entrano da porta Salaria, dove erano accampati dall'inizio dell'assedio.","Bruciano le case vicino alla porta e la casa di Sallustio, lo storico.",
    "Probabilmente risale a quei giorni anche l'incendio della basilica Emilia, nel Foro.","Chi cerca rifugio nelle basiliche di San Pietro e di San Paolo è rispettato.",
    "Il saccheggio dura tre giorni, secondo Orosio.","Sei giorni, secondo Marcellino Comes: le fonti non concordano."],
  fonte:"Procopio, Guerre III 2 (porta Salaria, il campo di Alarico, la casa di Sallustio); Orosio VII 39 (tre giorni, il rispetto delle basiliche); Marcellino Comes (sei giorni). La pianta usa le mura, il Tevere e le strade del modello; i luoghi degli incendi sono quelli della scena della città. Il campo dei Goti è segnato fuori dalla porta senza un luogo preciso." };
function disegnaSacco(svg,S,W,H){
  var TP=window.RM_TOPO; if(!TP||!TP.porte) return;
  var G=TP.porte['Porta Salaria'], CAMPO=[G[0]+14,G[1]-46], SP=[-259,-108], SPA=[-70,376], CASE=[100,-192], SALL=[78,-165], EMI=[7.2,-1];
  var oriz=W/H>=1.15, pad=oriz?26:16, mn=[1e9,1e9], mx=[-1e9,-1e9];
  TP.mura.concat([SP,SPA,CAMPO]).forEach(function(p){ mn[0]=Math.min(mn[0],p[0]); mn[1]=Math.min(mn[1],p[1]); mx[0]=Math.max(mx[0],p[0]); mx[1]=Math.max(mx[1],p[1]); });
  var riserva=oriz?0:112, bw=mx[0]-mn[0], bh=mx[1]-mn[1], top=oriz?pad+10:58, k=Math.min((W-2*pad-(oriz?0:60))/bw,(H-top-pad-riserva)/bh), ox=W/2-(mn[0]+bw/2)*k, oy=top+(H-top-pad-riserva)/2-(mn[1]+bh/2)*k;
  if(oriz){ ox-=Math.min(60,W*0.06); }
  function B(p){ return [ox+p[0]*k, oy+p[1]*k]; }
  var defs=el('defs',null,svg);
  var gfu=el('radialGradient',{id:'ig-fuoco'},defs); [[0,'#FFF3D0',1],[.22,'#FFC85A',.95],[.55,'#E8622C',.5],[1,'#B8321A',0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},gfu); });
  var gri=el('radialGradient',{id:'ig-rifugio'},defs); [[0,'#FFF4CF',.9],[.35,'#F1D99A',.45],[1,'#D4AE55',0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},gri); });
  var gpo=el('radialGradient',{id:'ig-porta'},defs); [[0,'#F4E9D8',.7],[1,'#F4E9D8',0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},gpo); });
  /* il mondo, che la «macchina da presa» sposta */
  var mondo=el('g',{'class':'ig-mondo'},svg), ns={'vector-effect':'non-scaling-stroke'};
  function at(o){ for(var q in ns) o[q]=ns[q]; return o; }
  var fiu=TP.fiume.map(B).map(xy).join(' ');
  el('polyline',at({points:fiu,'class':'ig-n-fiume-alone'}),mondo); el('polyline',at({points:fiu,'class':'ig-n-fiume'}),mondo);
  var dS=(TP.strade||[]).map(function(l){ return 'M'+l.map(B).map(xy).join('L'); }).join('');
  if(dS) el('path',at({d:dS,'class':'ig-n-strade'}),mondo);
  var dM='M'+TP.mura.map(B).map(xy).join('L')+'Z';
  /* la città dentro le mura: una trama di puntini caldi, come luci lontane (decorazione: non dice dove si abitasse) */
  var pz=el('pattern',{id:'ig-luci',width:9,height:9,patternUnits:'userSpaceOnUse',patternTransform:'rotate(18)'},defs); el('circle',{cx:2,cy:2,r:.75,fill:'rgba(240,200,130,.32)'},pz); el('circle',{cx:6.5,cy:6.8,r:.55,fill:'rgba(240,200,130,.2)'},pz);
  el('path',{d:dM,fill:'url(#ig-luci)'},mondo);
  el('path',at({d:dM,'class':'ig-n-mura-alone'}),mondo); el('path',at({d:dM,'class':'ig-n-mura'}),mondo);
  /* la macchina da presa: [tempo, punto del disegno al centro, ingrandimento] */
  var Wc=[ox+(mn[0]+bw/2)*k, oy+(mn[1]+bh/2)*k], centro=[W/2+(oriz?-Math.min(60,W*0.06):0), top+(H-top-pad-riserva)/2];
  var zG=oriz?2.3:2.1, zF=oriz?2.7:2.5, zE=oriz?2.0:1.9;
  var t1=2000, t2=6900, t3=11700, t4=16500, t5=21300, t6=25900, tF=29600, T0=1250;
  var P1=B(G), P2=B([(CASE[0]+SALL[0])/2,(CASE[1]+SALL[1])/2]), P3=B([(EMI[0]*3+SALL[0])/4,(EMI[1]*3+SALL[1])/4]);
  var CAM=[[0,Wc,1],[t1-900,Wc,1],[t1+700,P1,zG],[t2-700,P1,zG],[t2+700,P2,zF],[t3-900,P2,zF],[t3+700,P3,zE],[t4-1000,P3,zE],[t4+1000,Wc,1]];
  function camera(t){ var a=CAM[0], b=null; for(var i=1;i<CAM.length;i++){ if(t<CAM[i][0]){ b=CAM[i]; break; } a=CAM[i]; } if(!b) return {c:a[1],z:a[2]};
    var f=E.io(fase(t,a[0],b[0])), z=Math.exp(lerp(Math.log(a[2]),Math.log(b[2]),f)); return {c:[lerp(a[1][0],b[1][0],f),lerp(a[1][1],b[1][1],f)],z:z}; }
  var cam={c:Wc,z:1};
  function scr(p){ var q=B(p); return [centro[0]+(q[0]-cam.c[0])*cam.z, centro[1]+(q[1]-cam.c[1])*cam.z]; }
  /* i segni sopra la pianta, in pixel dello schermo: si spostano con la vista ma non ingrandiscono */
  var sopra=el('g',{'class':'ig-sopra'},svg), luoghi=[];
  function luogo(p,cl,nome,dx,dy,an,sotto){
    var g=el('g',{'class':'ig-luogo '+cl},sopra), ic=el('g',{'class':'ig-icona'},g), lab=el('g',{'class':'ig-luogo-lab'},g);
    el('line',{x1:0,y1:0,x2:r1(dx*0.86),y2:r1(dy*0.86-4),'class':'ig-n-guida'},lab);
    var t=tx(lab,dx+(an==='end'?-3:an==='middle'?0:3),dy,'ig-n-nome',nome,an||'start'); if(sotto) tx(lab,dx+(an==='end'?-3:3),dy+15,'ig-n-sotto',sotto,an||'start');
    var L={p:p,g:g,ic:ic,lab:lab,t:t}; luoghi.push(L); return L;
  }
  var campo=luogo(CAMPO,'campo','campo dei Goti',-26,-18,'end');
  [[-12,4],[0,-3],[12,3],[-3,10],[9,12]].forEach(function(q){ el('path',{d:'M'+(q[0]-6)+' '+(q[1]+5)+' L'+q[0]+' '+(q[1]-6)+' L'+(q[0]+6)+' '+(q[1]+5)+' Z','class':'ig-tenda'},campo.ic); });
  var porta=luogo(G,'porta','porta Salaria',22,-22,'start'); el('circle',{r:16,fill:'url(#ig-porta)','class':'ig-porta-alone'},porta.ic); el('circle',{r:5.5,'class':'ig-porta-punto'},porta.ic); el('circle',{r:9,'class':'ig-porta-onda'},porta.ic);
  function fuoco(L,incerto){ el('circle',{r:26,fill:'url(#ig-fuoco)','class':'ig-fiamma'},L.ic); el('circle',{r:3.2,'class':'ig-brace'},L.ic); if(incerto) el('circle',{r:17,'class':'ig-incerto'},L.ic); }
  var fC=luogo(CASE,'fuoco','case presso la porta',26,22,'start'); fuoco(fC);
  var fS=luogo(SALL,'fuoco','casa di Sallustio',-24,20,'end'); fuoco(fS);
  var fE=luogo(EMI,'fuoco incerto','basilica Emilia',24,22,'start','probabilmente'); fuoco(fE,true);
  function rifugio(L){ el('circle',{r:30,fill:'url(#ig-rifugio)','class':'ig-alone'},L.ic); el('path',{d:'M0 -8 V8 M-5.5 -2.5 H5.5','class':'ig-croce'},L.ic); }
  var rP=oriz?luogo(SP,'rifugio','San Pietro',-20,-20,'end','rifugio rispettato'):luogo(SP,'rifugio','San Pietro',16,-26,'start','rifugio rispettato'); rifugio(rP);
  var rA=luogo(SPA,'rifugio','San Paolo',22,-12,'start','rifugio rispettato'); rifugio(rA);
  var freccia=el('g',{'class':'ig-ingresso'},sopra), fl=el('path',{'class':'ig-freccia-linea'},freccia), fp=el('path',{'class':'ig-freccia-punta',d:'M0 0 L-11 -6 L-8 0 L-11 6 Z'},freccia);
  /* nome del fiume, fisso nella pianta */
  var tvP=TP.fiume.filter(function(p){ return p[1]>60&&p[1]<200; })[0], tevere=tvP?luogo(tvP,'tevere','Tevere',-10,0,'end'):null; if(tevere) tevere.lab.firstChild.remove();
  /* la data e l'orologio dei giorni, sullo schermo */
  var gd=el('g',{'class':'ig-data'},svg); tx(gd,pad-6,oriz?pad+16:24,'ig-data-1','24 AGOSTO 410'); tx(gd,pad-6,(oriz?pad+16:24)+18,'ig-data-2','Roma, da porta Salaria');
  var rk=oriz?40:30, ckx=W-pad-rk-4, cky=H-pad-rk-(oriz?16:12), gc=el('g',{'class':'ig-orologio'},svg);
  var lw=oriz?184:196; el('rect',{x:r1(ckx-rk-lw-14),y:r1(cky-rk-14),width:r1(rk*2+lw+28),height:r1(rk*2+28+(oriz?12:8)),rx:12,'class':'ig-orologio-fondo'},gc);
  var archi=[]; for(var i=0;i<6;i++){ var a0=(-90+i*60+3)*Math.PI/180, a1=(-90+(i+1)*60-3)*Math.PI/180, dA='M'+xy([ckx+Math.cos(a0)*rk,cky+Math.sin(a0)*rk])+' A'+rk+' '+rk+' 0 0 1 '+xy([ckx+Math.cos(a1)*rk,cky+Math.sin(a1)*rk]);
    el('path',{d:dA,'class':'ig-arco-vuoto'},gc); var pa=el('path',{d:dA,'class':'ig-arco '+(i<3?'orosio':'marcellino')},gc); var la=pa.getTotalLength?pa.getTotalLength():rk; pa.style.strokeDasharray=la+' '+la; pa.setAttribute('stroke-dashoffset',la); archi.push({p:pa,l:la}); }
  var cN=tx(gc,ckx,cky+(oriz?7:6),'ig-oro-num','0','middle'), cG=tx(gc,ckx,cky+(oriz?22:18),'ig-oro-lab','giorni','middle');
  var lx=ckx-rk-14, l1=el('g',{'class':'ig-oro-voce'},gc), l2=el('g',{'class':'ig-oro-voce'},gc);
  el('rect',{x:lx-lw+2,y:cky-rk+2,width:14,height:5,rx:2.5,'class':'ig-sw orosio'},l1); tx(l1,lx-lw+22,cky-rk+9,'ig-oro-t','Orosio: tre giorni');
  el('rect',{x:lx-lw+2,y:cky-rk+24,width:14,height:5,rx:2.5,'class':'ig-sw marcellino'},l2); tx(l2,lx-lw+22,cky-rk+31,'ig-oro-t','Marcellino Comes: sei in tutto');
  var l3=tx(gc,lx-lw+2,cky-rk+56,'ig-oro-nota','le fonti non concordano');
  S.passo=function(t){
    cam=camera(t); fissa(mondo,'transform','translate('+r1(centro[0])+','+r1(centro[1])+') scale('+Math.round(cam.z*1000)/1000+') translate('+r1(-cam.c[0])+','+r1(-cam.c[1])+')');
    cls(mondo,'vis',t>=T0-400);
    luoghi.forEach(function(L){ var q=scr(L.p); fissa(L.g,'transform','translate('+r1(q[0])+','+r1(q[1])+')'); });
    cls(campo.g,'vis',t>=t1-1200); cls(porta.g,'vis',t>=t1); cls(gd,'vis',t>=t1-600);
    var fa=E.io(fase(t,t1+100,t1+1500)), a=scr(CAMPO), b=scr(G), dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L, uy=dy/L, a2=[a[0]+ux*14,a[1]+uy*14], b2=[b[0]-ux*9,b[1]-uy*9];
    var pe=[lerp(a2[0],b2[0],fa),lerp(a2[1],b2[1],fa)]; fissa(fl,'d','M'+xy(a2)+' L'+xy(pe)); fissa(fp,'transform','translate('+xy(pe)+') rotate('+r1(Math.atan2(uy,ux)*180/Math.PI)+')'); cls(freccia,'vis',fa>0);
    cls(fC.g,'vis',t>=t2); cls(fS.g,'vis',t>=t2+700); cls(fE.g,'vis',t>=t3+300); cls(rP.g,'vis',t>=t4+500); cls(rA.g,'vis',t>=t4+1000);
    var vicino=cam.z>1.45; [fC,fS].forEach(function(L){ cls(L.lab,'via',!vicino); }); cls(porta.lab,'via',t>t4+600 && !oriz && false); if(tevere) cls(tevere.g,'vis',t>=T0);
    cls(campo.lab,'via',!vicino && t>t4);
    var gg=0; for(var i=0;i<6;i++){ var w0=i<3?t5+i*520:t6+(i-3)*520, f=E.io(fase(t,w0,w0+480)); fissa(archi[i].p,'stroke-dashoffset',r1(archi[i].l*(1-f))); if(f>=1) gg=i+1; }
    cls(gc,'vis',t>=t5-500); scrivi(cN,String(gg)); cls(l1,'vis',t>=t5+1500); cls(l2,'vis',t>=t6+1500); cls(l3,'vis',t>=tF-1500);
  };
  S.dura=tF+3800;
  S.battute=[t1,t2,t3,t4,t5,t6].map(function(tt,i){ return {t:tt,anno:i?'410':'',testo:SACCO.fasi[i]}; });
}

/* ======================================================================
   5. Le navi scompaiono
   Una flotta di cento navi da carico sul mare: restano quante ne dicono i relitti datati nel Mediterraneo, con il I secolo uguale a 100 (CURVE.commerci: banca dati
   di Oxford, 2017; Robinson e Wilson 2011). La nave è uno schema dell'oneraria delle raffigurazioni (scafo panciuto, collo di cigno a poppa, vela quadra con le cuciture,
   artemone, due remi-timone), in tre grandezze per la profondità; le navi che mancano restano tratteggiate. L'ordine in cui si spengono è casuale.
   Rifatta il 24 novembre 2026 (l'utente: «migliorare qualità grafica e navi»): file prospettiche che non si toccano, cento navi esatte, mare in profondità.
   La nave che manca è un contorno tratteggiato e non un relitto: il dato conta proprio i relitti trovati, e un relitto disegnato farebbe leggere il contrario.
   I momenti vengono dalle tappe (439, 534, la conquista araba nei passi del 711). */
var NAVI={ titolo:"Le navi scompaiono", sotto:"Relitti datati nel Mediterraneo: per ogni 100 del I secolo, quanti ne restano",
  momenti:[[235,"Nel III secolo i relitti sono già meno della metà di quelli del I secolo."],[439,"I Vandali prendono Cartagine, il grande porto del grano per Roma."],[534,"Belisario riprende l'Africa: il mare torna dell'impero, ma i traffici restano bassi."],
    [642,"Gli Arabi prendono Alessandria; nel 698 anche Cartagine."],[725,"Nell'VIII secolo i relitti sono pochissimi."]],
  fonte:"Banca dati dei relitti di Strauss, Wilson e Flohr (Oxford Roman Economy Project, 2017) e Robinson e Wilson (2011). Si contano le navi trovate e datate, non le merci: navi più grandi, o meno naufragi, cambierebbero il quadro. Ogni nave disegnata vale un relitto su cento; le navi tratteggiate sono quelle che mancano rispetto al I secolo; la forma delle navi è uno schema; l'ordine in cui si spengono è casuale." };

/* La nave oneraria, in tre grandezze per la profondità (v vicina, m media, l lontana: le lontane hanno meno dettagli e colori velati dalla foschia),
   e la nave che manca (solo il contorno tratteggiato). Unità della nave: linea d'acqua a y=0, prua a destra; ingombro da x -25 a 29 e da y -38 a 7.
   Schema dalle raffigurazioni delle navi da carico romane: scafo panciuto, poppa alta col collo di cigno (cheniscus), casotto a poppa, vela quadra
   col suo pennone e le cuciture (sulla nave vicina anche i rinforzi orizzontali: la trama a quadri), l'artemone (albero inclinato a prua con la vela piccola),
   due remi-timone ai lati della poppa. Non è una nave precisa. */
function naviDefs(defs){
  var P={v:{scafo:'#4A2E1E',fascia:'#7A5235',filo:'#B08A5E',scuro:'#2A1A12',casa:'#8A6040',vela:'#F1E7D2',ombra:'#D8C9AC',cuci:'rgba(120,92,58,.5)',art:'#E6D9BF',drappo:'#9A2F2A'},
         m:{scafo:'#56402F',fascia:'#80634A',filo:'#A88C68',scuro:'#3A2A20',casa:'#8C6C50',vela:'#ECE4D3',ombra:'#D3C8B3',cuci:'rgba(120,98,70,.4)',art:'#E0D6C2',drappo:'#93473F'},
         l:{scafo:'#5E5753',fascia:'#77706A',filo:'#8E8780',scuro:'#4C4744',casa:'#7E7670',vela:'#DEDCD1',ombra:'#C9C8BE',cuci:'rgba(110,104,92,.3)',art:'#D3D1C6',drappo:'#8A6260'}};
  ['v','m','l'].forEach(function(q){
    var c=P[q], g=el('g',{id:'ig-nave-'+q},defs), det=q!=='l';
    /* l'ombra sull'acqua e, dietro lo scafo, il timone dell'altro lato */
    el('ellipse',{cx:1,cy:2.4,rx:21,ry:2.1,fill:'rgba(8,26,32,.32)'},g);
    if(det){ el('path',{d:'M-13.2 -8.6 L-18.6 3.4',stroke:c.scuro,'stroke-width':1.2,'stroke-linecap':'round'},g);
      el('path',{d:'M-17.5 .4 L-19.9 5.2 L-18.3 5.9 L-16.2 1.2 Z',fill:c.scuro},g); }
    /* lo scafo panciuto, le tavole alte più chiare, il cinto, il casotto di poppa */
    el('path',{d:'M-21.5 -9.6 C-21 -3.6 -16 2.6 -7 3.2 L9 3.2 C15.5 3 19.6 -1.6 21.6 -8.3 L20 -8.7 C12 -6.6 -6 -6 -20 -10.1 Z',fill:c.scafo},g);
    el('path',{d:'M-20.4 -9.2 C-6 -5.6 12 -6.1 20.6 -8.1 L20.2 -6.5 C12 -4.5 -6 -3.9 -20 -7.3 Z',fill:c.fascia},g);
    el('path',{d:'M-19.4 -4.5 C-8 -1.5 9 -1.7 19.3 -4.3',fill:'none',stroke:c.filo,'stroke-width':.7,opacity:.85},g);
    el('path',{d:'M-18.2 -9.7 L-18.2 -13.4 L-11.4 -12.4 L-11.4 -8.2 Z',fill:c.casa},g);
    el('path',{d:'M-18.8 -13.6 L-10.9 -12.4',stroke:c.scuro,'stroke-width':.8,'stroke-linecap':'round'},g);
    /* il collo di cigno a poppa e il timone di questo lato */
    el('path',{d:'M-21.2 -9.8 C-24.6 -13.2 -24.9 -19.2 -21.3 -21 C-19.1 -22.1 -17.2 -20.6 -17.9 -18.7 L-16.2 -18.2',fill:'none',stroke:c.scuro,'stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round'},g);
    el('path',{d:'M-15.6 -9.4 L-20.9 3.7',stroke:c.scuro,'stroke-width':1.3,'stroke-linecap':'round'},g);
    el('path',{d:'M-19.9 .9 L-22.4 5.9 L-20.6 6.6 L-18.5 1.7 Z',fill:c.scuro},g);
    /* l'albero maestro, gli stralli (solo da vicino), la fiamma in cima */
    el('path',{d:'M-1 -7 V-37.2',stroke:c.scuro,'stroke-width':1.4,'stroke-linecap':'round'},g);
    if(q==='v') el('path',{d:'M-1 -36 L19.6 -9.2 M-1 -36 L-18.8 -11',stroke:'rgba(42,26,18,.5)','stroke-width':.5,fill:'none'},g);
    el('path',{d:'M-1 -37.4 L5.2 -36.4 L-1 -35.4 Z',fill:c.drappo},g);
    /* la vela quadra, gonfia, in due toni, con le cuciture verticali (dove corrono gli imbrogli) e, da vicino, i rinforzi orizzontali */
    el('path',{d:'M-14 -33 Q-1 -34.6 12 -33 Q14.2 -22 12 -11.4 Q-1 -9.9 -14 -11.4 Q-16.1 -22 -14 -33 Z',fill:c.vela},g);
    el('path',{d:'M-1 -34.2 Q5.5 -33.9 12 -33 Q14.2 -22 12 -11.4 Q5.5 -10.6 -1 -10.5 Z',fill:c.ombra},g);
    if(det){ var cu='';
      [-9.5,-5,3.5,8].forEach(function(x){ cu+='M'+x+' -33.7 Q'+(x-.8)+' -22 '+x+' -10.9 '; });
      if(q==='v') [-27,-21.5,-16].forEach(function(y){ cu+='M-14.7 '+y+' Q-1 '+(y-1.3)+' 12.9 '+y+' '; });
      el('path',{d:cu,fill:'none',stroke:c.cuci,'stroke-width':q==='v'?.5:.6},g); }
    el('path',{d:'M-15 -33.2 Q-1 -35.1 13 -33.2',fill:'none',stroke:c.scuro,'stroke-width':1.3,'stroke-linecap':'round'},g);
    /* l'artemone, inclinato in avanti, con la sua vela e il pennone */
    el('path',{d:'M16.4 -7.6 L25.8 -20.8',stroke:c.scuro,'stroke-width':1.1,'stroke-linecap':'round'},g);
    el('path',{d:'M21 -18.9 L28.2 -20.7 Q29.3 -16 28.1 -12.5 L21.8 -11.3 Q20.4 -15 21 -18.9 Z',fill:c.art},g);
    if(det) el('path',{d:'M24.6 -19.8 Q25.5 -16 24.9 -11.9',fill:'none',stroke:c.cuci,'stroke-width':.45},g);
    el('path',{d:'M20.4 -19.1 L28.9 -21.2',stroke:c.scuro,'stroke-width':.9,'stroke-linecap':'round'},g);
    /* l'acqua che lambisce lo scafo e la schiuma a prua */
    el('path',{d:'M-17 1.5 q2.5 -1.5 5 0 t5 0 t5 0 t5 0 t5 0 t5 0 t5 0',fill:'none',stroke:'rgba(226,240,240,.55)','stroke-width':q==='l'?.6:.8},g);
    if(det) el('path',{d:'M17.5 .2 q3.5 -.6 7.5 1.3',fill:'none',stroke:'rgba(255,255,255,.6)','stroke-width':.8,'stroke-linecap':'round'},g);
  });
  /* la nave che manca: solo il contorno tratteggiato, come un posto vuoto sul mare */
  var f=el('g',{id:'ig-assente'},defs);
  el('path',{d:'M-21.5 -9.6 C-21 -3.6 -16 2.6 -7 3.2 L9 3.2 C15.5 3 19.6 -1.6 21.6 -8.3 C12 -6.4 -6 -5.8 -21.5 -9.6 Z M-14 -33 Q-1 -34.6 12 -33 Q14.2 -22 12 -11.4 Q-1 -9.9 -14 -11.4 Q-16.1 -22 -14 -33 Z M21 -18.9 L28.2 -20.7 Q29.3 -16 28.1 -12.5 L21.8 -11.3 Q20.4 -15 21 -18.9 Z',
    fill:'rgba(214,232,234,.06)',stroke:'rgba(214,232,234,.34)','stroke-width':1,'stroke-dasharray':'2.6 2.4','stroke-linejoin':'round'},f);
  el('path',{d:'M-1 -7 V-33.5 M-21.2 -9.8 C-24.6 -13.2 -24.9 -19.2 -21.3 -21',fill:'none',stroke:'rgba(214,232,234,.24)','stroke-width':.9,'stroke-dasharray':'2.6 2.4','stroke-linecap':'round'},f);
}
/* I posti delle navi, in file prospettiche: in fondo (in alto) file lunghe di navi piccole, davanti file corte di navi grandi, con la scala che cresce di 1,7 volte.
   Si sceglie il numero di file che dà le navi più grandi senza che nessuna tocchi le altre: l'ingombro di ogni nave (54 x 45 unità, più 4 di aria) non si sovrappone
   a quello delle vicine, né nella fila né fra una fila e l'altra (provato a 369 x 477, 369 x 560, 860 x 520, 540 x 250). Le navi in più si tolgono dalle file più piene.
   Nei posti, x è il centro dell'ingombro spostato di 2 unità e y la linea d'acqua, 7 unità sopra il fondo dell'ingombro. */
function postiFlotta(x0,y0,w,h,n){
  var LW=58, LH=45, G=.7, best=null, R, k, s0, cnt, tot, sc;
  for(R=3;R<=16;R++){
    sc=[]; var sum=0; for(k=0;k<R;k++){ sc.push(1+G*(R>1?k/(R-1):1)); sum+=sc[k]; }
    s0=h/(LH*sum); cnt=sc.map(function(f){ return Math.floor(w/(LW*s0*f)); }); tot=cnt.reduce(function(a,b){ return a+b; },0);
    if(tot>=n && (!best||s0>best.s0)) best={R:R,s0:s0,sc:sc,cnt:cnt};
  }
  if(!best) return null;
  var c=best.cnt.slice(); tot=c.reduce(function(a,b){ return a+b; },0);
  while(tot>n){ var j=0, m=-1; c.forEach(function(v,i){ var pieno=v*LW*best.s0*best.sc[i]/w; if(pieno>m){ m=pieno; j=i; } }); c[j]--; tot--; }
  var out=[], y=y0, R2=caso(41);
  for(k=0;k<best.R;k++){
    var s=best.s0*best.sc[k], passo=w/c[k], gioco=Math.max(0,passo-LW*s), sf=(k%2?.5:0)*Math.min(gioco,passo*.5);
    y+=LH*s;
    for(var i=0;i<c[k];i++){ var x=x0+(i+.5)*passo-sf/2+(k%2?sf:0)+(R2()-.5)*gioco*.5;
      out.push({x:x-2*s, y:y-7*s, s:s, fila:k, prof:best.R>1?k/(best.R-1):1}); }
  }
  return {posti:out, file:best.R};
}
/* Il mare in prospettiva: in fondo onde brevi, fitte e tenui, davanti lunghe, rade e più marcate, ciascuna col suo cavo scuro; si fermano prima del bordo del mare */
function mareProfondo(p,W,mh,yTop,R){
  var g=el('g',{'class':'ig-onde'},p), y=yTop, k=0;
  while(y<mh-4){
    var f=(y-yTop)/Math.max(1,mh-yTop), L=7+f*26, A=.8+f*2.6, d='', x=-R()*L*2;
    while(x<W+L){ var l=L*(.6+R()*.8); d+='M'+r1(x)+' '+r1(y+(R()-.5)*3*f)+' q'+r1(l/2)+' -'+r1(A)+' '+r1(l)+' 0 '; x+=l+L*(.5+R()*1.4); }
    el('path',{d:d,'class':'ig-onda',style:'opacity:'+r1(.07+f*.16)+';stroke-width:'+r1(.6+f*.9)},g);
    if(k%2===0) el('path',{d:d.replace(/M([\d.-]+) ([\d.-]+)/g,function(_,a,b){ return 'M'+r1(+a+L*.4)+' '+r1(+b+2+3*f); }),'class':'ig-onda scura',style:'stroke-width:'+r1(.6+f*.9)},g);
    y+=4+f*f*16; k++;
  }
  return g;
}
function disegnaNavi(svg,S,W,H){
  var C=(D.CURVE||{}).commerci; if(!C) return; var P=C.punti;
  var oriz=W/H>=1.15, pad=16, mh=Math.round(H*(oriz?0.68:0.72)), fsN=oriz?Math.min(64,W/12):Math.min(46,W/7.5), kh=oriz?fsN+44:fsN+30;
  var defs=el('defs',null,svg);
  var gm=el('linearGradient',{id:'ig-mare',x1:0,y1:0,x2:0,y2:1},defs); [[0,'#5E8B94'],[.28,'#44717B'],[.68,'#2B5560'],[1,'#1B3841']].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1]},gm); });
  var gl=el('radialGradient',{id:'ig-mare-luce',cx:'72%',cy:'0%',r:'85%'},defs); el('stop',{offset:0,'stop-color':'#F6E7C6','stop-opacity':.34},gl); el('stop',{offset:1,'stop-color':'#F6E7C6','stop-opacity':0},gl);
  var gv=el('linearGradient',{id:'ig-mare-fondo',x1:0,y1:0,x2:0,y2:1},defs); el('stop',{offset:0,'stop-color':'#0B2229','stop-opacity':0},gv); el('stop',{offset:1,'stop-color':'#0B2229','stop-opacity':.38},gv);
  naviDefs(defs);
  /* il mare, con una striscia di riflessi sotto la luce */
  el('rect',{x:0,y:0,width:W,height:mh,fill:'url(#ig-mare)'},svg); el('rect',{x:0,y:0,width:W,height:mh,fill:'url(#ig-mare-luce)'},svg);
  var R=caso(5); mareProfondo(svg,W,mh,kh*.55,R);
  var sx=W*.72, sl=el('g',{'class':'ig-scintille'},svg);
  for(var z=0;z<26;z++){ var yy=kh*.6+Math.pow(R(),.8)*(mh-kh*.6-6), ww=3+yy/mh*16, xx=sx+(R()-.5)*(30+yy/mh*90); el('path',{d:'M'+r1(xx-ww/2)+' '+r1(yy)+' h'+r1(ww),'class':'ig-scintilla',style:'animation-delay:'+r1(-R()*3)+'s'},sl); }
  el('rect',{x:0,y:mh*.55,width:W,height:mh*.45,fill:'url(#ig-mare-fondo)'},svg);
  /* la flotta: file prospettiche che non si toccano, sotto il contatore; sui telefoni coricati (palco poco alto) a destra del contatore */
  var basso=oriz&&H<360, prova=tx(svg,0,-50,'ig-k-lab','relitti datati, per ogni 100 del I secolo'), lk=largo(prova); prova.remove();
  var fx0=basso?pad+lk+18:pad+4, fy0=basso?pad+6:pad+14+fsN*.86+(oriz?20:18)+8, fl=postiFlotta(fx0,fy0,W-fx0-pad-4,mh-fy0-24,100);
  var fondali=el('g',{'class':'ig-fondali'},svg), flotta=el('g',{'class':'ig-flotta'},svg), navi=[], file=[], ordine=[], i;
  for(i=0;i<100;i++) ordine.push(i); var R2=caso(29); for(i=99;i>0;i--){ var j=Math.floor(R2()*(i+1)), tmp=ordine[i]; ordine[i]=ordine[j]; ordine[j]=tmp; }
  for(var rw=0;rw<fl.file;rw++){ var fila=el('g',{'class':'ig-fila'},flotta); fila.style.animationDelay=(-rw*0.47)+'s'; fila.style.animationDuration=(3.1+rw*0.23)+'s'; file.push(fila); }
  fl.posti.forEach(function(q,i){
    var tr='translate('+r1(q.x)+','+r1(q.y)+') scale('+r1(q.s*1000)/1000+')', tipo=q.prof<.3?'l':q.prof<.7?'m':'v';
    var gr=el('g',{transform:tr},fondali), r=el('use',{'class':'ig-r'},gr); r.setAttribute('href','#ig-assente'); r.setAttributeNS(XL,'xlink:href','#ig-assente');
    var g=el('g',{transform:tr},file[q.fila]), u=el('use',{'class':'ig-n'},g); u.setAttribute('href','#ig-nave-'+tipo); u.setAttributeNS(XL,'xlink:href','#ig-nave-'+tipo);
    var rank=ordine[i]; u.style.transitionDelay=(((rank*37)%23)*28)+'ms'; navi.push({u:u,r:r,rank:rank,st:null}); });
  /* che cosa sono le navi tratteggiate, in basso sul mare */
  var lv=el('g',{'class':'ig-conta chiaro ig-leg-navi'},svg), ly=mh-9;
  var ic=el('use',{transform:'translate('+r1(pad+11)+','+r1(ly-1)+') scale(.42)'},lv); ic.setAttribute('href','#ig-assente'); ic.setAttributeNS(XL,'xlink:href','#ig-assente');
  tx(lv,pad+26,ly,'ig-k-leg','tratteggiate: quelle che mancano rispetto al I secolo');
  /* il contatore, sul mare */
  var gk=el('g',{'class':'ig-conta chiaro'},svg), tA=tx(gk,pad,pad+12,'ig-k-anno',''), tN=tx(gk,pad,pad+14+fsN*.86,'ig-k-num',''), tS=el('text',{x:pad,y:pad+14+fsN*.86,'class':'ig-k-su'},gk), tL=tx(gk,pad,pad+14+fsN*.86+20,'ig-k-lab','relitti datati, per ogni 100 del I secolo');
  tN.style.fontSize=fsN+'px'; if(!oriz){ tL.setAttribute('y',pad+14+fsN*.86+18); }
  var tPrima=el('text',{x:W-pad,y:pad+12,'class':'ig-k-prima','text-anchor':'end'},gk);
  /* la striscia del tempo, sotto: la scala arriva a 50, perché dal 235 i valori stanno sotto il 41 (il 100 del I secolo resta scritto nell'etichetta) */
  var sb=[pad,mh+14,W-2*pad,H-mh-14-4], c=grafico(svg,sb,{x0:235,x1:852,y0:0,y1:50,tx:sb[2]>520?[235,400,500,600,700,852]:[235,534,852],ty:[0,25,50],sopra:2,fy:function(v){ return v===50?'50 (I secolo = 100)':v?String(v):''; }});
  var ga=el('linearGradient',{id:'ig-sotto',x1:0,y1:0,x2:0,y2:1},defs); el('stop',{offset:0,'stop-color':'#3B6570','stop-opacity':.38},ga); el('stop',{offset:1,'stop-color':'#3B6570','stop-opacity':.04},ga);
  var rv=el('clipPath',{id:'ig-rv'},defs), rvR=el('rect',{x:c.L-6,y:0,width:0,height:H},rv), gdd=el('g',{'clip-path':'url(#ig-rv)'},svg);
  var dl=P.map(function(p,i){ return (i?'L':'M')+xy([c.x(p[0]),c.y(p[1])]); }).join('');
  el('path',{d:dl+'L'+xy([c.x(852),c.B])+'L'+xy([c.x(235),c.B])+'Z',fill:'url(#ig-sotto)'},gdd); el('path',{d:dl,'class':'ig-linea mare'},gdd); c.sopra();
  var T0=1250, t0=T0+2600, fer=NAVI.momenti.slice(1).map(function(m){ return {anno:m[0],sosta:2700}; }); fer.push({anno:852,sosta:0});
  var tm=Tempo(235,fer,{inizio:t0+2700,vel:9,min:800}), nM=NAVI.momenti.length, tFin=tm.arrivi[nM-1]+600;
  var arr=[t0].concat(tm.arrivi.slice(0,nM-1));
  var segni=NAVI.momenti.map(function(m,i){ return {t:arr[i],g:el('circle',{cx:r1(c.x(m[0])),cy:r1(c.y(valore(P,m[0]))),r:4,'class':'ig-segno'},svg)}; });
  var cur=el('circle',{r:5,'class':'ig-cur-punto mare'},svg);
  S.passo=function(t){
    var a=tm.anno(t), prima=t<t0, v=prima?100:valore(P,a), nn=Math.round(v);
    if(!prima && t<t0+1300) nn=Math.round(lerp(100,valore(P,235),E.io(fase(t,t0,t0+1300))));
    for(var i=0;i<100;i++){ var q=navi[i], st=t<T0+200+q.rank*11?'':q.rank<(prima?100:nn)?'su':'via'; if(q.st!==st){ q.st=st; q.u.setAttribute('class','ig-n '+st); q.r.setAttribute('class','ig-r '+st); } }
    cls(gk,'vis',t>=T0+300); cls(lv,'vis',t>=t0+1300); scrivi(tA,prima?'I SECOLO':'ANNO '+Math.round(a)); scrivi(tN,String(nn)); scrivi(tS,' su 100');
    fissa(tS,'x',r1(pad+largo(tN)+6));
    scrivi(tPrima,t>=tFin?'nel I secolo erano 100':'');
    c.vis(t>=t0-400); fissa(rvR,'width',prima?'0':r1(Math.max(0,c.x(a)-c.L+6))); fissa(cur,'cx',r1(c.x(a))); fissa(cur,'cy',r1(c.y(valore(P,a)))); cls(cur,'vis',!prima&&t<tFin+2000);
    segni.forEach(function(sg){ cls(sg.g,'vis',t>=sg.t); });
  };
  S.dura=tFin+4600;
  S.battute=NAVI.momenti.map(function(m,i){ return {t:arr[i],anno:m[0],testo:m[1]}; });
}

/* ======================================================================
   6. Chi governa l'Occidente
   La carta piccola (RM_mappa.miniatura) con gli stati delle regioni delle tappe del 395, 476, 568 e 800 (CAMBI in js/dati.js). Il cambio passa da ovest a est come un'onda;
   le regioni che cambiano mano si accendono; i nomi dei regni si posano sulla regione più grande di ciascuno, coi nomi della legenda della carta. Nel finale i quattro momenti
   uno accanto all'altro. Le frasi riassumono quelle tappe. */
var GOVERNO={ titolo:"Chi governa l'Occidente", sotto:"La carta in quattro momenti: 395, 476, 568, 800",
  fasi:[[395,"Nel 395 l'Occidente è ancora governato da Roma, da un imperatore che risiede a Milano."],[476,"Nel 476 Odoacre governa l'Italia; Visigoti, Franchi, Burgundi, Vandali e Svevi hanno i loro regni."],
    [568,"Nel 568 l'Italia e l'Africa sono dell'impero d'Oriente, dopo le guerre di Giustiniano; e i Longobardi entrano in Italia."],[800,"Nell'800 Carlo Magno, re dei Franchi, è incoronato imperatore a Roma; gran parte della Spagna e l'Africa sono degli Arabi."]],
  fonte:"I colori sono quelli della carta di questa pagina nelle tappe del 395, 476, 568 e 800: confini e attribuzioni delle regioni sono approssimativi, come spiegato in fondo alla pagina. I nomi stanno sul pezzo più grande che si vede di ciascuno stato; uno stato che nel riquadro si vede appena, come la Persia, non ha né nome né voce in legenda." };
var VB=[95,55,810,518];
function disegnaGoverno(svg,S,W,H){
  var M=window.RM_mappa, G=window.RM_MAPPA; if(!M||!M.miniatura||!G) return;
  function tappa(a){ return (D.TAPPE||[]).filter(function(t){ return t.regioni && !t.intermezzo && t.anno===a; })[0]||{regioni:{},titolo:''}; }
  var FR=GOVERNO.fasi.map(function(f){ var tp=tappa(f[0]); return {anno:f[0],stati:tp.regioni,titolo:tp.titolo}; }), ids=Object.keys(G.regioni);
  var q=VB[2]/VB[3], pad=14, oriz=W/H>=1.15, largo2=oriz&&W>=700, ma, col=null;
  if(largo2){ var mw=Math.min(W*0.7-pad,(H-2*pad)*q); ma=[pad,(H-mw/q)/2,mw,mw/q]; col=[pad+mw+24,pad,W-(pad+mw+24)-pad,H-2*pad]; }
  else if(oriz){ var mw2=Math.min(W-2*pad,(H-2*pad)*q); ma=[(W-mw2)/2,(H-mw2/q)/2,mw2,mw2/q]; }
  else { var mw3=W-2*pad; ma=[pad,pad,mw3,mw3/q]; col=[pad,pad+ma[3]+10,W-2*pad,H-(pad+ma[3]+10)-6]; }
  var kk=ma[2]/VB[2];
  /* la carta, in HTML sotto il disegno */
  var strato=S.strato('ig-carta',true); strato.style.left=ma[0]+'px'; strato.style.top=ma[1]+'px'; strato.style.width=ma[2]+'px'; strato.style.height=ma[3]+'px';
  var m=M.miniatura(); m.svg.setAttribute('preserveAspectRatio','xMidYMid meet'); m.svg.setAttribute('class','m-mini ig-mini'); strato.appendChild(m.svg);
  var paths=[].slice.call(m.svg.querySelectorAll('.m-regione')); paths.forEach(function(p,i){ var id=ids[i]; p.style.transitionDelay=Math.round((G.regioni[id].c[0]-VB[0])/VB[2]*650)+'ms'; });
  var luce=el('path',{'class':'ig-mini-luce',d:''},m.svg), gn=el('g',{'class':'ig-regni'},m.svg), fs=(largo2?13:12.5)/kk;
  /* dove stanno i nomi delle città della carta piccola (js/mappa.js, miniatura: corpo 25, Roma 28, in unità della carta) */
  var CITTA_MINI=[].slice.call(m.svg.querySelectorAll('.m-mini-citta-nome')).map(function(t){ var fc=/roma/.test(t.getAttribute('class'))?28:25, x=+t.getAttribute('x'), y=+t.getAttribute('y'), w=t.textContent.length*fc*.46+8, fine=t.getAttribute('text-anchor')==='end';
    return {fermo:true,x:fine?x-w/2+12:x+w/2-12,y:y-fc*.33,w:w+24,h:fc*1.15}; });      // il riquadro comprende anche il punto della città
  /* che cosa si vede davvero nel riquadro: una griglia di punti (passo 9 unità) sopra le regioni; per ogni stato il pezzo visibile più grande e, dentro, il punto più lontano dai bordi.
     Uno stato che nel riquadro non c'è, o è una scheggia, non ha nome sulla carta né voce in legenda (24 novembre 2026, cattura dell'utente: il nome della Persia, che sta fuori
     dal riquadro, era tirato dentro e finiva sull'Anatolia; quello dell'Oriente sull'Egitto, al bordo) */
  var PS=9, NX=Math.floor(VB[2]/PS), NY=Math.floor(VB[3]/PS), cella=[], prof=[], pt=m.svg.createSVGPoint(), bb=paths.map(function(p){ try{ return p.getBBox(); }catch(e){ return null; } }), xx, yy, ri;
  for(yy=0;yy<NY;yy++) for(xx=0;xx<NX;xx++){ pt.x=VB[0]+(xx+.5)*PS; pt.y=VB[1]+(yy+.5)*PS; var dove=-1;
    for(ri=paths.length-1;ri>=0;ri--){ var bq=bb[ri]; if(!bq||pt.x<bq.x||pt.x>bq.x+bq.width||pt.y<bq.y||pt.y>bq.y+bq.height) continue; try{ if(paths[ri].isPointInFill(pt)){ dove=ri; break; } }catch(e){} }
    cella.push(dove); }
  var SOGLIA=14;      // celle: sotto questa misura (circa 1.100 unità quadrate, un riquadro di 100 km di lato) uno stato è una scheggia
  function profondita(st){      // per ogni cella dello stesso stato, quante celle mancano al bordo del pezzo (passate avanti e indietro, distanza a scacchiera)
    var P=cella.map(function(r){ return r>=0&&st[r]?1e4:0; }), i, x, y;
    for(y=0;y<NY;y++) for(x=0;x<NX;x++){ i=y*NX+x; if(!P[i]) continue; P[i]=Math.min(P[i],(x?P[i-1]:0)+1,(y?P[i-NX]:0)+1,(x&&y?P[i-NX-1]:0)+1,(y&&x<NX-1?P[i-NX+1]:0)+1); }
    for(y=NY-1;y>=0;y--) for(x=NX-1;x>=0;x--){ i=y*NX+x; if(!P[i]) continue; P[i]=Math.min(P[i],(x<NX-1?P[i+1]:0)+1,(y<NY-1?P[i+NX]:0)+1,(x<NX-1&&y<NY-1?P[i+NX+1]:0)+1,(y<NY-1&&x?P[i+NX-1]:0)+1); }
    return P; }
  var visti=FR.map(function(f){ var c={}; cella.forEach(function(r){ if(r<0) return; var st=f.stati[ids[r]]||'perso'; c[st]=(c[st]||0)+1; }); return c; });
  /* i nomi dei regni: sul pezzo visibile più grande del loro stato, spostati se si toccano */
  var sullaCarta=[], nomiF=FR.map(function(f,fi){
    var voci={}; (M.vociPresenti([f.stati],f.anno)||[]).forEach(function(v){ voci[v[2]]=v[1]; });
    /* dal più grande al più piccolo, ogni nome prova i punti del suo stato dal più interno in giù (prima quelli della regione che si vede di più) e prende, fra quelli che non toccano
       un nome già messo né le città, quello che sta di più sul suo colore (e poi il più interno). Se nessun punto va, resta sul più interno */
    var L=Object.keys(visti[fi]).filter(function(st){ return !/^(perso|fuori|conteso|federati|usurpatore)$/.test(st)&&visti[fi][st]>=SOGLIA; })
      .map(function(st){ return {st:st,nome:voci[st]||st,tot:visti[fi][st]}; }).sort(function(a,b){ return b.tot-a.tot; }).slice(0,largo2?8:6), messi=CITTA_MINI.slice();
    function tocca(a,b){ return Math.abs(a.x-b.x)<(a.w+b.w)/2+3 && Math.abs(a.y-b.y)<(a.h+b.h)/2+2; }
    L.forEach(function(l){ l.w=l.nome.length*fs*0.55+fs*0.6; l.h=fs*1.35;
      var mio=ids.map(function(id){ return (f.stati[id]||'perso')===l.st; }), P=profondita(mio), conta={};
      cella.forEach(function(r){ if(r>=0&&mio[r]) conta[r]=(conta[r]||0)+1; }); var rMax=+Object.keys(conta).sort(function(a,b){ return conta[b]-conta[a]; })[0];      // la regione dello stato che si vede di più
      var cand=[]; cella.forEach(function(r,i){ if(r>=0&&mio[r]) cand.push(i); }); cand.sort(function(a,b){ return (cella[b]===rMax)-(cella[a]===rMax) || P[b]-P[a]; });
      function quota(x,y){ var n=0, k=0; for(var dx=-2;dx<=2;dx++) for(var dy=-1;dy<=1;dy++){ var cx=Math.floor((x+dx*l.w/4-VB[0])/PS), cy=Math.floor((y+dy*l.h/2.4-VB[1])/PS); k++; if(cx>=0&&cy>=0&&cx<NX&&cy<NY&&cella[cy*NX+cx]>=0&&mio[cella[cy*NX+cx]]) n++; } return n/k; }
      var scelto=null, meglio=-1;
      for(var c=0;c<cand.length;c++){ var i=cand[c], x=clamp(VB[0]+(i%NX+.5)*PS,VB[0]+l.w/2+4,VB[0]+VB[2]-l.w/2-4), y=clamp(VB[1]+(Math.floor(i/NX)+.5)*PS,VB[1]+l.h,VB[1]+VB[3]-l.h*0.75), q={x:x,y:y,w:l.w,h:l.h};
        if(messi.some(function(m2){ return tocca(q,m2); })) continue; var v=Math.min(quota(x,y),.75)*100+P[i]+(cella[i]===rMax?3:0); if(v>meglio){ meglio=v; scelto=q; } }      // quanto sta sul suo colore conta più di quanto è interno
      if(!scelto){ var i0=cand[0]; scelto={x:clamp(VB[0]+(i0%NX+.5)*PS,VB[0]+l.w/2+4,VB[0]+VB[2]-l.w/2-4),y:clamp(VB[1]+(Math.floor(i0/NX)+.5)*PS,VB[1]+l.h,VB[1]+VB[3]-l.h*0.75)}; }
      l.x=scelto.x; l.y=scelto.y; messi.push(l); });
    sullaCarta[fi]=L.map(function(l){ return l.nome; });
    var g=el('g',{'class':'ig-regni-f'},gn);
    L.forEach(function(l,i){ var t=tx(g,l.x,l.y+fs*0.35,'ig-regno',l.nome,'middle'); t.style.fontSize=r1(fs)+'px'; t.style.strokeWidth=r1(3.2/kk)+'px'; t.style.transitionDelay=(500+i*170)+'ms'; });
    return g; });
  /* l'anno, il titolo della tappa e la legenda */
  var pan=col?S.strato('ig-pannello'+(largo2?'':' sotto')):S.strato('ig-pannello sopra'); if(col){ pan.style.left=col[0]+'px'; pan.style.top=col[1]+'px'; pan.style.width=col[2]+'px'; pan.style.height=col[3]+'px'; }
  else { pan.style.right=(W-ma[0]-ma[2]+8)+'px'; pan.style.top=(ma[1]+6)+'px'; }      // in alto a destra, sulle steppe: lascia libere Britannia e Gallia
  var pAnno=h('div','ig-p-anno','395',pan), pTit=h('div','ig-p-titolo','',pan), pLeg=h('div','ig-legenda dentro',null,col?pan:S.fuori('ig-legenda-fuori'));      // sul telefono coricato la legenda sta nella colonna del testo
  if(!col) pTit.hidden=true;
  if(!col && !oriz){ }
  /* il finale: i quattro momenti affiancati */
  var cw2=(W-2*pad-14)/2, riga=W/H>=1.6 || 2*(cw2/q+40)+10>H-2*pad, quattro=S.strato('ig-quattro'+(riga?' riga':'')+(riga&&(W-2*pad-42)/4<170?' stretta':'')); quattro.style.left=pad+'px'; quattro.style.top=pad+'px'; quattro.style.width=(W-2*pad)+'px'; quattro.style.height=(H-2*pad)+'px';
  FR.forEach(function(f,i){ var c=h('figure','ig-q',null,quattro); c.style.transitionDelay=(i*220)+'ms'; var mm=M.miniatura(); mm.svg.setAttribute('preserveAspectRatio','xMidYMid meet'); mm.svg.setAttribute('class','m-mini ig-mini');
    c.appendChild(mm.svg); mm.mostra(f.stati,f.anno); var fc=h('figcaption',null,null,c); h('b',null,String(f.anno),fc); h('span',null,f.titolo,fc); });
  var T0=1250, tf=[1700,7900,14100,20300], tFin=26500, visto=-2;
  function legenda(i){ pLeg.textContent=''; (M.vociPresenti([FR[i].stati],FR[i].anno)||[]).forEach(function(v){ if(v[2]==='perso'||(visti[i][v[2]]||0)<SOGLIA) return; if(col&&!largo2&&sullaCarta[i].indexOf(v[1])>=0) return;      /* sul telefono in piedi: i regni col nome sulla carta non si ripetono */ var c=h('span','ig-chip',null,pLeg); h('i',null,null,c).style.background=v[0]; h('span',null,v[1],c); });
    if(col&&!largo2){ pLeg.classList.remove('fitta'); if(pan.scrollHeight>pan.clientHeight+1) pLeg.classList.add('fitta'); } }      /* sul telefono in piedi, se la legenda non ci sta: due colonne, corpo più piccolo */
  m.mostra({},null);
  S.passo=function(t){
    var i=-1; tf.forEach(function(x,j){ if(t>=x) i=j; });
    if(i!==visto){ if(i>=0){ m.mostra(FR[i].stati,FR[i].anno); legenda(i); pTit.textContent=FR[i].titolo;
        var d=''; if(i>0) ids.forEach(function(id,j){ if((FR[i].stati[id]||'perso')!==(FR[i-1].stati[id]||'perso')) d+=G.regioni[id].d; }); luce.setAttribute('d',d); }
      else { m.mostra({},null); pLeg.textContent=''; pTit.textContent=''; } visto=i; }
    var nx=tf[i+1], a=i<0?FR[0].anno:FR[i].anno; if(nx!=null && t>nx-900) a=Math.round(lerp(FR[i<0?0:i].anno,FR[i+1].anno,E.io(fase(t,nx-900,nx))));
    if(i<0) a=FR[0].anno; scrivi(pAnno,String(a));
    cls(luce,'vis',i>0 && t<tf[i]+1500);
    nomiF.forEach(function(g,j){ cls(g,'vis',j===i && t<tFin); });
    cls(strato,'vis',t>=T0-200); cls(strato,'via',t>=tFin); cls(pan,'vis',t>=T0+200); cls(pan,'via',t>=tFin); cls(quattro,'vis',t>=tFin+300); if(!col) cls(pLeg,'via',t>=tFin);
    cls(pLeg,'cambia',i>=0 && t<tf[i]+500);
  };
  S.dura=tFin+4600;
  S.battute=FR.map(function(f,i){ return {t:tf[i],anno:f.anno,testo:GOVERNO.fasi[i][1]}; });
  /* con meno movimento: la legenda di tutte e quattro le carte, sotto l'elenco */
  S.fermo=function(lato){ var l=h('div','ig-legenda fermo',null,lato); (M.vociPresenti(FR.map(function(f){ return f.stati; }),800)||[]).forEach(function(v){ if(v[2]==='perso'||!visti.some(function(c){ return (c[v[2]]||0)>=SOGLIA; })) return; var c=h('span','ig-chip',null,l); h('i',null,null,c).style.background=v[0]; h('span',null,v[1],c); }); return l; };
}

/* ======================================================================
   7. La cattura di Valeriano (260)
   Aggiunta il 23 novembre 2026 (l'utente: «tra le infografiche animate anche la cattura di Valeriano?»). La carta è quella della pagina (RM_MAPPA: coste, fiumi, regioni),
   inquadrata sulla Mesopotamia; i luoghi sono quelli della tappa. Fonti lette: Shapur I, iscrizione della Ka'ba-ye Zardosht (nell'inglese di Sprengling, già nelle voci della tappa:
   l'assedio di Carre ed Edessa, i settantamila, la battaglia «al di là di Carre e di Edessa», la cattura di Valeriano, del prefetto del pretorio, di senatori e generali, portati in Persia);
   Eutropio IX 7 («mox etiam captus apud Parthos ignobili servitute consenuit»); Lattanzio, Sulla morte dei persecutori 5, 2-6 (lo sgabello: «inclinare sibi Romanum iubebat ac terga
   praebere et imposito pede super dorsum eius»; la pelle «infecta rubro colore» nel tempio): Lattanzio scrive verso il 315, è cristiano e Valeriano aveva perseguitato i cristiani;
   il rilievo di Naqsh-e Rostam e le identificazioni discusse dalla voce «Naqsh-e Rostam» della Wikipedia inglese. Le frecce sono uno schema: il cammino vero non è noto. */
var VALERIANO={ titolo:"La cattura di Valeriano", sotto:"260: per la prima volta un imperatore romano è fatto prigioniero",
  fasi:["Shapur I, re dei Persiani, assedia Carre ed Edessa, in Mesopotamia. L'imperatore Valeriano gli va contro, da Antiochia.",
    "Secondo Shapur l'esercito romano conta settantamila uomini. Il numero è quello del vincitore.",
    "«Al di là di Carre e di Edessa» i Romani sono sconfitti. Valeriano è fatto prigioniero, con il prefetto del pretorio, senatori e generali.",
    "Shapur li porta via, in Persia. Secondo Eutropio Valeriano vi invecchiò in una schiavitù senza onore.",
    "Lattanzio, un cristiano che scrive mezzo secolo dopo, ostile a Valeriano che aveva perseguitato i cristiani, racconta che Shapur lo usava come sgabello per salire a cavallo. Gli storici ne discutono.",
    "A Naqsh-e Rostam, in Persia, un rilievo mostra Shapur a cavallo davanti a imperatori romani sottomessi. Di solito vi si riconoscono Valeriano e Filippo l'Arabo, ma le identificazioni sono discusse."],
  fonte:"Shapur I, iscrizione della Ka'ba-ye Zardosht (traduzione inglese di Sprengling, 1953); Eutropio, Breviario IX 7; Lattanzio, Sulla morte dei persecutori 5 (fonte cristiana e ostile, verso il 315); per il rilievo di Naqsh-e Rostam la voce della Wikipedia inglese. La carta è quella della pagina; le frecce sono uno schema: il cammino degli eserciti non è noto." };
function disegnaValeriano(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G) return;
  var L=function(k){ var q=(G.luoghi||{})[k]||G.citta[k]; return q?[q.x,q.y]:null; };
  var AN=L('antiochia'), ED=L('edessa'), CA=L('carre'), NI=L('nisibi'), TI=L('tigri'); if(!AN||!ED||!CA) return;
  var oriz=W/H>=1.15, pad=oriz?22:14, top=oriz?pad+34:70, riserva=oriz?0:Math.min(210,H*.36);
  var V=[836,330,166,132];      // la finestra sulla carta: da Antiochia al Tigri
  var k=Math.min((W-2*pad-(oriz?Math.min(420,W*.42):0))/V[2],(H-top-pad-riserva)/V[3]), ox=(oriz?W-pad-V[2]*k:(W-V[2]*k)/2)-V[0]*k, oy=top+(H-top-pad-riserva-V[3]*k)/2-V[1]*k;
  function B(p){ return [ox+p[0]*k, oy+p[1]*k]; }
  var clip=el('clipPath',{id:'ig-v-clip'},el('defs',null,svg)); el('rect',{x:r1(ox+V[0]*k),y:r1(oy+V[1]*k),width:r1(V[2]*k),height:r1(V[3]*k),rx:10},clip);
  var carta=el('g',{'class':'ig-v-carta','clip-path':'url(#ig-v-clip)'},svg), mondo=el('g',{transform:'translate('+r1(ox)+','+r1(oy)+') scale('+Math.round(k*1000)/1000+')'},carta);
  el('rect',{x:V[0]-5,y:V[1]-5,width:V[2]+10,height:V[3]+10,'class':'ig-v-mare'},mondo); el('path',{d:G.terra,'class':'ig-v-terra'},mondo);
  ['anatolia','levante','nisibi'].forEach(function(id){ if(G.regioni[id]) el('path',{d:G.regioni[id].d,'class':'ig-v-roma'},mondo); });
  (G.fiumi||[]).forEach(function(f){ if(f.d) el('path',{d:f.d,'class':'ig-v-fiume','vector-effect':'non-scaling-stroke'},mondo); });
  el('path',{d:G.terra,'class':'ig-v-costa','vector-effect':'non-scaling-stroke'},mondo);
  var sopra=el('g',null,svg);
  function punto(p,nome,dx,dy,an){ var q=B(p), g=el('g',{'class':'ig-v-luogo',transform:'translate('+xy(q)+')'},sopra); el('circle',{r:4.2,'class':'ig-v-punto'},g);
    tx(g,dx,dy,'ig-v-nome',nome,an||'start'); return g; }
  var pA=punto(AN,'Antiochia',-8,18,'end'), pE=punto(ED,'Edessa',-14,-14,'end'), pC=punto(CA,'Carre',11,-14,'start'), pN=NI?punto(NI,'Nisibi',8,-8,'start'):null;      // i nomi stanno fuori dagli anelli dell'assedio (24 novembre 2026)
  var est=B([V[0]+V[2]-4,CA[1]+18]);
  /* frecce: si tracciano con stroke-dashoffset */
  function freccia(pts,cl,curva){ var g=el('g',{'class':'ig-v-freccia '+cl},sopra), q=pts.map(B), d=curva?curvaPezzi(q).join(' '):'M'+q.map(xy).join(' L'), p=el('path',{d:d,'class':'ig-v-linea'},g), l=p.getTotalLength?p.getTotalLength():300;
    p.style.strokeDasharray=l+' '+l; p.setAttribute('stroke-dashoffset',l); var a=q[q.length-2], b=q[q.length-1], ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
    var pu=el('path',{d:'M0 0 L-11 -6 L-8 0 L-11 6 Z','class':'ig-v-punta',transform:'translate('+xy(b)+') rotate('+r1(ang)+')'},g); return {g:g,p:p,l:l,pu:pu}; }
  var fR=freccia([AN,[(AN[0]+ED[0])/2,AN[1]-14],[ED[0]-3,ED[1]+5]],'roma'), fP=freccia([[V[0]+V[2]-2,CA[1]-6],NI||CA,[CA[0]+50/k,CA[1]-2/k],[CA[0]+17/k,CA[1]+3/k]],'persia',true);      // da Nisibi una curva morbida scende a destra di Carre e arriva da est, sotto il nome (24 novembre 2026: prima la punta copriva «Carre», poi un gomito ad angolo retto)
  var SC=[(ED[0]+CA[0])/2-4,(ED[1]+CA[1])/2+14];      // la battaglia «al di là di Carre e di Edessa»: il punto è uno schema, sotto le due città perché non ne copra i nomi
  var fV=freccia([SC,[CA[0]+20,CA[1]+10],[V[0]+V[2]-3,CA[1]+18]],'prigionieri');
  function anello(p){ var q=B(p), g=el('g',{'class':'ig-v-assedio',transform:'translate('+xy(q)+')'},sopra); el('circle',{r:13,'class':'ig-v-anello'},g); return g; }
  var aE=anello(ED), aC=anello(CA);
  var sc=B(SC), scontro=el('g',{'class':'ig-v-scontro',transform:'translate('+xy(sc)+')'},sopra);
  el('circle',{r:17,'class':'ig-v-lampo'},scontro); el('path',{d:'M-9 -9 L9 9 M9 -9 L-9 9','class':'ig-v-spade'},scontro);
  var tP=tx(sopra,est[0]-6,est[1]+20,'ig-v-verso','verso la Persia','end');
  /* la data e il numero dei settantamila */
  var gd=el('g',{'class':'ig-data'},svg); tx(gd,pad,pad+18,'ig-v-data1','260'); tx(gd,pad+56,pad+17,'ig-v-data2','Mesopotamia');
  var nx=oriz?pad:W-pad, an=oriz?'start':'end', ny=oriz?pad+78:pad+18, gn=el('g',{'class':'ig-v-numero'},svg), cN=tx(gn,nx,ny,'ig-v-num','0',an); tx(gn,nx,ny+17,'ig-v-num-lab','soldati romani, secondo Shapur',an);
  /* il rilievo di Naqsh-e Rostam: la foto (Carole Raddato, CC BY-SA 2.0, da Wikimedia Commons; scaricata a mano perché Commons rifiuta gli scarichi da questa rete) occupa lo spazio
     libero a sinistra, sul telefono sotto la carta; finché la foto manca resta uno schema (un cavaliere e due figure), non una copia (23 novembre 2026, l'utente: «troppo spazio vuoto sulla sinistra, mettici il bassorilievo famoso») */
  var mapL=ox+V[0]*k, mapB=oy+(V[1]+V[3])*k;
  var rx=pad, ry=oriz?pad+112:mapB+14, rw=oriz?Math.max(160,mapL-pad-20):W-2*pad, rh=H-ry-pad-38; if(!oriz) rh=Math.min(rh,rw*.62);      // sotto la foto due righe di didascalia (23 novembre 2026: sul telefono una riga sola usciva dalla tavola)
  var ril=el('g',{'class':'ig-v-rilievo',transform:'translate('+r1(rx)+','+r1(ry)+')'},svg);
  var cr=el('clipPath',{id:'ig-v-ril-clip'},el('defs',null,svg)); el('rect',{x:0,y:0,width:r1(rw),height:r1(rh),rx:8},cr);
  var schema=el('g',null,ril); el('rect',{x:0,y:0,width:r1(rw),height:r1(rh),rx:8,'class':'ig-v-roccia'},schema);
  var sw=Math.min(rw,rh*2), s0=(rw-sw)/2, sx=sw/220, sy=rh/110; function sp(d){ var i=0; return d.replace(/-?\d+(\.\d+)?/g,function(n){ i++; return r1(i%2?s0+n*sx:n*sy); }); }
  el('path',{d:sp('M70 100 L74 70 Q78 58 96 56 L128 54 Q140 50 146 38 L150 30 L156 34 L154 46 L146 60 L148 100 L142 100 L140 72 L104 74 L102 100 L96 100 L94 74 L82 76 L78 100 Z'),'class':'ig-v-fig'},schema);      // il cavallo
  el('path',{d:sp('M112 56 L110 34 Q112 26 120 26 Q128 26 128 34 L126 56 Z M114 24 L126 24 L124 12 L116 12 Z'),'class':'ig-v-fig'},schema);      // il re, con la corona
  el('path',{d:sp('M162 100 L164 66 Q166 58 172 58 Q178 58 180 66 L182 100 Z M166 56 Q166 46 172 46 Q178 46 178 56 Z'),'class':'ig-v-fig r'},schema);      // una figura in piedi
  el('path',{d:sp('M36 100 L40 84 Q42 76 50 76 L58 78 L56 100 Z M44 74 Q44 64 50 64 Q56 64 56 74 Z'),'class':'ig-v-fig r'},schema);      // una figura in ginocchio
  var lab=tx(ril,0,rh+15,'ig-v-ril-lab','Naqsh-e Rostam: schema del rilievo','start');
  var foto=el('image',{x:0,y:0,width:r1(rw),height:r1(rh),preserveAspectRatio:'xMidYMid slice','clip-path':'url(#ig-v-ril-clip)','class':'ig-v-foto'},ril);
  foto.addEventListener('load',function(){ schema.style.display='none'; lab.textContent='';
    var r1t=el('tspan',{x:0},lab), r2t=el('tspan',{x:0,dy:15},lab); r1t.textContent='Il trionfo di Shapur a Naqsh-e Rostam'; r2t.textContent='foto Carole Raddato, CC BY-SA 2.0, Wikimedia Commons';
    if(largo(r2t)>rw){ r2t.textContent=''; lab.removeChild(r2t); var resto=el('text',{x:0,y:r1(rh+30),'class':'ig-v-ril-lab'},ril); avvolgi(resto,'foto Carole Raddato, CC BY-SA 2.0, Wikimedia Commons',rw,13); } });
  foto.addEventListener('error',function(){ foto.style.display='none'; });
  foto.setAttribute('href','img/infografiche/shapur-naqsh-e-rostam.jpg'); foto.setAttributeNS(XL,'xlink:href','img/infografiche/shapur-naqsh-e-rostam.jpg');
  var t1=1400, t2=6200, t3=11000, t4=16000, t5=21400, t6=27400, tF=33600;
  S.passo=function(t){
    cls(carta,'vis',t>=200); cls(pA,'vis',t>=t1-300); cls(pE,'vis',t>=400); cls(pC,'vis',t>=400); if(pN) cls(pN,'vis',t>=400); cls(gd,'vis',t>=400);
    [[fR,t1,t1+2200],[fP,t1+900,t1+3200],[fV,t4,t4+3200]].forEach(function(q){ var f=E.io(fase(t,q[1],q[2])); fissa(q[0].p,'stroke-dashoffset',r1(q[0].l*(1-f))); cls(q[0].g,'vis',f>0); cls(q[0].pu,'vis',f>=.98); });
    cls(aE,'vis',t>=t1+2600); cls(aC,'vis',t>=t1+3000);
    var fn=E.out(fase(t,t2,t2+2600)); cls(gn,'vis',t>=t2); scrivi(cN,num(Math.round(70000*fn/1000)*1000));
    cls(scontro,'vis',t>=t3); cls(aE,'spento',t>=t3+600); cls(aC,'spento',t>=t3+600);
    cls(tP,'vis',t>=t4+2600); cls(ril,'vis',t>=t6);
  };
  S.dura=tF+3000;
  S.battute=[t1,t2,t3,t4,t5,t6].map(function(tt){ return {t:tt,anno:'260'}; }).map(function(b,i){ b.testo=VALERIANO.fasi[i]; return b; });
}

/* ---------- aiuti per le infografiche 8-10 ---------- */
/* curva morbida (Catmull-Rom) per una fila di punti: un pezzo per ogni tratto, così ogni tratto si traccia da solo */
function curvaPezzi(P){ return P.slice(0,-1).map(function(p1,i){ var p0=P[i-1]||p1, p2=P[i+1], p3=P[i+2]||p2;
  return 'M'+xy(p1)+' C'+xy([p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6])+' '+xy([p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6])+' '+xy(p2); }); }
function lungo(p){ try{ return p.getTotalLength()||1; }catch(e){ return 100; } }
function puntoA(p,l){ try{ var q=p.getPointAtLength(l); return [q.x,q.y]; }catch(e){ return [0,0]; } }
function scopri(p){ var L=lungo(p); p.style.strokeDasharray=L+' '+L; p.setAttribute('stroke-dashoffset',L); p._L=L; return p; }      // da tracciare con traccia()
function traccia(p,f){ fissa(p,'stroke-dashoffset',r1(p._L*(1-clamp(f,0,1)))); cls(p,'vis',f>0); }
function href(e,u){ e.setAttribute('href',u); e.setAttributeNS(XL,'xlink:href',u); return e; }
function grad(defs,id,stops,o){ var g=el(o&&o.r?'radialGradient':'linearGradient',o||{x1:0,y1:0,x2:0,y2:1},defs); g.setAttribute('id',id);
  stops.forEach(function(s){ el('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]==null?1:s[2]},g); }); return g; }
/* un uomo piccolissimo, visto di lato (h = altezza in pixel) */
function omino(p,h,cl){ var g=el('g',{'class':'ig-omino'+(cl?' '+cl:'')},p); el('circle',{cx:0,cy:r1(-h*.86),r:r1(h*.14)},g); el('path',{d:'M0 '+r1(-h*.7)+' L0 '+r1(-h*.32)+' M0 '+r1(-h*.32)+' L'+r1(-h*.16)+' 0 M0 '+r1(-h*.32)+' L'+r1(h*.18)+' '+r1(-h*.02)+' M0 '+r1(-h*.62)+' L'+r1(h*.2)+' '+r1(-h*.44)+' M0 '+r1(-h*.62)+' L'+r1(-h*.18)+' '+r1(-h*.46),'stroke-width':r1(Math.max(1,h*.1))},g); return g; }

/* PROPOSTA (non applicata): funzioni nuove per js/infografiche.js, da mettere dopo omino() (riga ~734) e prima delle infografiche 11-13.
   Nessun fatto nuovo: sono solo disegni. */

/* ---------- una sagoma d'uomo, alta h pixel, piedi in (0,0), rivolta a destra (o.verso=-1: a sinistra) ----------
   o.mantello, o.elmo (di serie sì), o.scudo, o.lancia, o.arco, o.braccio:'avanti' (gesto); o.cl: classi in più (notte, porpora, oro) */
function guerriero(p,h,o){ o=o||{}; var g=el('g',{'class':'ig-gu'+(o.cl?' '+o.cl:'')},p), k=h/100, s=el('g',{transform:'scale('+r1(k*(o.verso||1)*1000)/1000+','+r1(k*1000)/1000+')'},g);
  if(o.mantello) el('path',{d:'M-6 -79 Q-23 -62 -22 -29 Q-16 -25 -9 -29 Q-13 -55 -1 -76 Z','class':'ig-gu-mant'},s);
  if(o.lancia) el('path',{d:'M-17 -3 L-6 -118 M-6 -120 l-3.6 10 l6.4 .7 Z','class':'ig-gu-asta'},s);
  el('path',{d:'M-7 -31 L-11 0 L-3 0 L0 -21 L3 0 L11 0 L7 -31 Z','class':'ig-gu-c'},s); el('path',{d:'M-8 -79 Q0 -82 8 -79 L12 -57 L11 -37 L15 -28 Q0 -24 -15 -28 L-11 -37 L-12 -57 Z','class':'ig-gu-c'},s);      // gambe e tunica: due tracciati (in uno solo l'incrocio resterebbe vuoto)
  el('circle',{cx:0,cy:-87,r:7.5,'class':'ig-gu-c'},s);
  if(o.elmo!==false) el('path',{d:'M-8.6 -87 Q-8.6 -98.5 0 -98.5 Q8.6 -98.5 8.6 -87 L10.6 -85.6 L-10.6 -85.6 Z','class':'ig-gu-c'},s);
  if(o.arco){ el('path',{d:'M5 -73 L19 -63','class':'ig-gu-braccio'},s); el('path',{d:'M19 -87 Q36 -63 19 -39','class':'ig-gu-arco'},s); el('path',{d:'M19 -87 L9 -65 L19 -39','class':'ig-gu-corda'},s); }
  else if(o.braccio==='avanti') el('path',{d:'M5 -73 Q18 -80 31 -90','class':'ig-gu-braccio'},s);
  if(o.scudo){ el('circle',{cx:7,cy:-55,r:15,'class':'ig-gu-scudo'},s); el('circle',{cx:7,cy:-55,r:3.4,'class':'ig-gu-umbone'},s); }
  return g; }

/* ---------- una nave da guerra vista di lato (lunga ~250 unità a s=1), linea di galleggiamento in y; prua verso +x (o.verso=-1: verso sinistra) ----------
   remi, timone, albero con sartie, vela quadra gonfia con l'ombra e le cuciture, pennone, fiamma in cima, scafo con la cinta, i fori dei remi, il parapetto, l'aplustre a poppa.
   Il rostro a prua è uno schema (Procopio dice che i Vandali «speronavano»). Restituisce {g, ponte(lx)}: il punto del ponte a lx unità dal centro. */
var SCAFO_GL='M-114 -34 Q-104 -22 -84 -21 L84 -21 Q104 -22 114 -30 L118 -10 L133 -3 L116 4 L-98 4 Q-112 -4 -114 -34 Z', NGL=0;
function galea(p,x,y,s,o){ o=o||{}; var v=o.verso||1, g=el('g',{'class':'ig-gl '+(o.cl||'roma'),transform:'translate('+r1(x)+','+r1(y)+') scale('+r1(s*v*1000)/1000+','+r1(s*1000)/1000+')'},p), k, d='';
  g.id='ig-gl-'+(++NGL);
  for(k=0;k<11;k++){ var rx=-78+k*15.5; d+='M'+r1(rx)+' -9 L'+r1(rx-13)+' 17 '; } el('path',{d:d,'class':'ig-gl-remo'},g);
  el('path',{d:'M-96 -22 L-118 15','class':'ig-gl-timone'},g); el('path',{d:'M-118 15 l-5 9 l8 2 Z','class':'ig-gl-pala'},g);
  el('path',{d:'M0 -158 L-100 -25 M0 -158 L106 -25','class':'ig-gl-sartia'},g);
  el('path',{d:'M0 -21 V-163','class':'ig-gl-albero'},g);
  if(o.vela!==false){ el('path',{d:'M-60 -144 Q0 -152 60 -144 C71 -116 67 -86 56 -66 Q0 -55 -56 -66 C-67 -86 -71 -116 -60 -144 Z','class':'ig-gl-vela'},g);
    el('path',{d:'M6 -150 Q34 -149 60 -144 C71 -116 67 -86 56 -66 Q32 -60 6 -57 Z','class':'ig-gl-vela-ombra'},g);
    el('path',{d:'M-30 -149 C-35 -112 -33 -82 -28 -59 M30 -149 C35 -112 33 -82 28 -59 M-62 -114 Q0 -122 66 -114 M-63 -86 Q0 -94 64 -86','class':'ig-gl-cucitura'},g); }
  el('path',{d:'M-67 -146 Q0 -155 67 -146','class':'ig-gl-pennone'},g); el('path',{d:'M0 -163 L21 -158.5 L0 -154 Z','class':'ig-gl-fiamma'},g);
  el('path',{d:SCAFO_GL,'class':'ig-gl-scafo'},g);
  el('path',{d:'M-108 -12 Q0 -5 117 -13','class':'ig-gl-cinta'},g);
  d=''; for(k=0;k<11;k++) d+='M'+r1(-79.8+k*15.5)+' -9 a1.8 1.8 0 1 0 3.6 0 a1.8 1.8 0 1 0 -3.6 0 '; el('path',{d:d,'class':'ig-gl-foro'},g);
  d='M-94 -27 H100'; for(k=-90;k<=96;k+=12) d+=' M'+k+' -21 V-27'; el('path',{d:d,'class':'ig-gl-parapetto'},g);
  el('path',{d:'M-114 -34 Q-127 -50 -117 -63 Q-108 -69 -104 -60 M114 -30 Q121 -40 116 -47','class':'ig-gl-orn'},g);
  return {g:g,v:v,ponte:function(lx){ return [x+lx*s*v,y-21*s]; }}; }
/* il riflesso di una nave (o di qualunque gruppo con id): la copia rovesciata sulla linea dell'acqua yA, schiacciata (k) e chiara */
function riflesso(p,src,yA,kk){ kk=kk||.5; var u=el('use',{'class':'ig-gl-rifl',transform:'translate(0,'+r1(yA*(1+kk))+') scale(1,'+(-kk)+')'},p); return href(u,'#'+src.id); }
/* una colonna di fumo che sale da (x,yb), alta hh, che piega col vento verso destra */
function colonnaFumo(p,x,yb,hh,w,seme){ var g=el('g',{'class':'ig-cb-fumo-col'},p), R=caso(seme);
  for(var i=0;i<7;i++){ var f=i/6, cx=x+f*f*hh*.45+(R()-.5)*w*.2, cy=yb-f*hh, rr=w*(.35+f*.75); el('path',{d:macchia(cx,cy,rr,rr*.62,seme+i,9),style:'opacity:'+r1((.5-f*.32)*100)/100},g); }
  return g; }

/* ---------- la nave vista dall'alto (lunghezza L pixel, prua verso +x): scafo affusolato, remi sotto i 16 pixel spariscono, ponte, vela di traverso ---------- */
function naveAlto(p,L,cl){ var g=el('g',{'class':'ig-cb-nave'+(cl?' '+cl:'')},p), w=L*.26, d='';
  if(L>=16){ for(var k=0;k<7;k++){ var x=-L*.3+k*L*.09; d+='M'+r1(x)+' '+r1(-w*.42)+' l'+r1(-L*.05)+' '+r1(-w*.6)+' M'+r1(x)+' '+r1(w*.42)+' l'+r1(-L*.05)+' '+r1(w*.6)+' '; } el('path',{d:d,'class':'ig-cb-remi'},g); }
  el('path',{d:'M'+r1(L*.5)+' 0 C'+r1(L*.32)+' '+r1(-w*.56)+' '+r1(-L*.3)+' '+r1(-w*.6)+' '+r1(-L*.45)+' '+r1(-w*.32)+' Q'+r1(-L*.53)+' 0 '+r1(-L*.45)+' '+r1(w*.32)+' C'+r1(-L*.3)+' '+r1(w*.6)+' '+r1(L*.32)+' '+r1(w*.56)+' '+r1(L*.5)+' 0 Z','class':'ig-cb-scafo'},g);
  if(L>=16) el('path',{d:'M'+r1(-L*.36)+' 0 H'+r1(L*.34),'class':'ig-cb-ponte'},g);
  el('path',{d:'M'+r1(-L*.03)+' '+r1(-w*1.05)+' Q'+r1(L*.13)+' 0 '+r1(-L*.03)+' '+r1(w*1.05)+' Q'+r1(L*.04)+' 0 '+r1(-L*.03)+' '+r1(-w*1.05)+' Z','class':'ig-cb-vela'},g);
  return g; }

/* ---------- Capo Bon, D1: la scena di Giovanni (sostituisce le righe 2293-2308 di js/infografiche.js; ib, aff, sc come prima) ---------- */
function scenaGiovanni(gD,defs,ib){
  var cpD=el('clipPath',{id:'ig-cb-clipD'},defs); el('rect',{x:r1(ib[0]),y:r1(ib[1]),width:r1(ib[2]),height:r1(ib[3]),rx:14},cpD);
  var scena=el('g',{'clip-path':'url(#ig-cb-clipD)'},gD), oriz0=ib[1]+ib[3]*.58, i;
  el('rect',{x:r1(ib[0]),y:r1(ib[1]),width:r1(ib[2]),height:r1(oriz0-ib[1]+2),fill:'url(#ig-cb-cielo2)'},scena);
  /* il fumo della flotta che brucia, lontano (il quadro di prima) */
  [[.12,.34,.11,7],[.47,.42,.14,11],[.93,.3,.1,17]].forEach(function(q){ colonnaFumo(scena,ib[0]+ib[2]*q[0],oriz0-1,ib[3]*q[1],ib[2]*q[2],q[3]); });
  el('rect',{x:r1(ib[0]),y:r1(oriz0),width:r1(ib[2]),height:r1(ib[1]+ib[3]-oriz0),fill:'url(#ig-cb-acqua)'},scena);
  el('rect',{x:r1(ib[0]),y:r1(oriz0-.5),width:r1(ib[2]),height:1.4,'class':'ig-cb-orizzonte'},scena);
  var sc=Math.min(ib[2]/330,ib[3]/228), ny=oriz0+ib[3]*.17, nx=ib[0]+ib[2]*.34;
  var sV=sc*.6, xV=ib[0]+ib[2]*.86, yV=ny-12*sc, sV2=sc*.28, xV2=ib[0]+ib[2]*.6, yV2=oriz0+7*sc;
  var rifl=el('g',null,scena), onde=el('g',null,scena), navi=el('g',null,scena);
  var V2=galea(navi,xV2,yV2,sV2,{verso:-1,cl:'vandali lontana'}), V=galea(navi,xV,yV,sV,{verso:-1,cl:'vandali'}), G=galea(navi,nx,ny,sc,{cl:'roma'});
  riflesso(rifl,V2.g,yV2,.45); riflesso(rifl,V.g,yV,.5); riflesso(rifl,G.g,ny,.5);
  var Ro=caso(24); for(i=0;i<9;i++){ var wy=oriz0+6+Math.pow((i+.5)/9,1.4)*(ib[1]+ib[3]-oriz0-6), wd='M'+r1(ib[0]-20+Ro()*20)+' '+r1(wy), st=10+i*2.2; for(var wx=ib[0]-20;wx<ib[0]+ib[2]+40;wx+=st*2) wd+=' q'+r1(st/2)+' -'+r1(1.2+i*.25)+' '+r1(st)+' 0 t'+r1(st)+' 0'; el('path',{d:wd,'class':'ig-cb-onda2',style:'opacity:'+r1((.16+i*.035)*100)/100},onde); }
  /* le persone: Giovanni sul ponte della sua nave, Genzone a prua della nave vandala */
  var pG=G.ponte(40), hG=Math.max(34,52*sc), gio=el('g',{transform:'translate('+xy(pG)+')'},scena), gioI=guerriero(gio,hG,{cl:'porpora',mantello:true,scudo:true,lancia:true});
  var pZ=V.ponte(70), hZ=Math.max(28,52*sV*1.2), genz=el('g',{transform:'translate('+xy(pZ)+')'},scena); guerriero(genz,hZ,{verso:-1,cl:'vandalo',mantello:true,braccio:'avanti'});
  var tGio=tx(scena,pG[0],pG[1]-hG-9,'ig-cb-et scuro','Giovanni','middle'), tGen=tx(scena,pZ[0],pZ[1]-hZ-9,'ig-cb-et scuro','Genzone','middle');
  /* il salto: dal ponte, verso chi guarda, in mare davanti allo scafo */
  var arrivo=[pG[0]+56*sc,ny+30*sc], salto=el('path',{d:'M'+xy(pG)+' Q'+xy([pG[0]+60*sc,pG[1]-80*sc])+' '+xy(arrivo),'class':'ig-ad-traiett'},scena), saltoL=lungo(salto);
  var spruzzo=el('ellipse',{cx:r1(arrivo[0]),cy:r1(arrivo[1]),rx:r1(20*sc),ry:r1(5*sc),'class':'ig-m-spruzzo'},scena);
  return {gio:gio,gioI:gioI,genz:genz,tGio:tGio,tGen:tGen,salto:salto,saltoL:saltoL,spruzzo:spruzzo,pG:pG,hG:hG};
}

/* ---------- Campi Catalaunici, C: il recinto dei carri, gli arcieri, Attila e il rogo di selle (sostituisce le righe 2059-2082) ---------- */
function carroLato(par,q,s,dietro){ var g=el('g',{'class':'ig-ca-carro'+(dietro?' dietro':''),transform:'translate('+xy(q)+') scale('+r1(s*100)/100+')'},par);
  el('path',{d:'M15 -6 L25 -2','class':'ig-ca-timone'},g);
  el('path',{d:'M-15 -3 L15 -3 L13 -12 L-13 -12 Z','class':'ig-ca-cassa'},g); el('path',{d:'M-12.5 -12 Q-12 -25.5 0 -26.5 Q12 -25.5 12.5 -12 Z','class':'ig-ca-telo'},g);
  el('path',{d:'M-6 -12 Q-6.5 -21 -4 -25.4 M6 -12 Q6.5 -21 4 -25.4','class':'ig-ca-centina'},g);
  [-8,8].forEach(function(x){ el('circle',{cx:x,cy:0,r:4.6,'class':'ig-ca-ruota'},g); el('path',{d:'M'+(x-4.2)+' 0 H'+(x+4.2)+' M'+x+' -4.2 V4.2','class':'ig-ca-raggi'},g); el('circle',{cx:x,cy:0,r:1.2,'class':'ig-ca-mozzo'},g); }); return g; }
/* il rogo di selle (Giordane 213: «si racconta»): una catasta di legna e selle di cavallo ammucchiate. Non brucia: Attila lo aveva preparato. */
function rogoSelle(p,x,y,s){ var g=el('g',{transform:'translate('+r1(x)+','+r1(y)+') scale('+r1(s*100)/100+')'},p), sel=[], R=caso(213), k;
  for(k=0;k<3;k++) el('rect',{x:-50+k*4,y:-6-k*6,width:100-k*8,height:6,rx:3,'class':'ig-ca-legno'},g);
  for(k=0;k<7;k++) el('circle',{cx:-45+k*15,cy:-3,r:3,'class':'ig-ca-legno-t'},g);
  [7,6,5,4,3,2].forEach(function(n,ri){ for(var q=0;q<n;q++){ var sx=(q-(n-1)/2)*(15-ri*.4)+(R()-.5)*4, sy=-20-ri*9.5+(R()-.5)*2.5, rot=(R()-.5)*26, sg=el('g',{transform:'translate('+r1(sx)+','+r1(sy)+') rotate('+r1(rot)+')'},g), c=el('g',{'class':'ig-ca-sella'+(ri<2?' sotto':'')},sg);
    el('path',{d:'M-12 -1 Q-14.5 -9 -9.5 -11.5 Q-7 -7.2 -3 -6.2 Q0 -5.6 3 -6.2 Q7.5 -7.2 9 -12.5 Q14.5 -10.5 12 -1 Q6 2 0 1.6 Q-6 2 -12 -1 Z','class':'ig-ca-sella-c'},c);
    el('path',{d:'M-8.5 -6.8 Q0 -3.6 8 -7.6','class':'ig-ca-sella-l'},c); el('path',{d:'M-4 1.2 q-1.2 4.6 1 7.6 M5 1.2 q1 4 -1 6.6','class':'ig-ca-sella-cinghia'},c); sel.push(c); } });
  return {g:g,sel:sel,alto:20+6*9.5+12}; }
function scenaRecinto(tav,defs,tv,oz,oriz2,ST){
  var cx=tv[0]+tv[2]*(oriz2?.6:.5), cy=oz+(tv[1]+tv[3]-oz)*(oriz2?.5:.42), rx=Math.min(tv[2]*(oriz2?.3:.44),(tv[1]+tv[3]-oz)*1.5), ry=rx*(oriz2?.3:.5), i;
  /* la luce: un chiarore sul terreno del campo (il rogo non è acceso) */
  var brace=el('ellipse',{cx:r1(cx),cy:r1(cy+ry*.05),rx:r1(rx*.78),ry:r1(ry*.95),fill:'url(#ig-ca-brace)','class':'ig-ca-brace',opacity:ST?.85:0},tav);
  var NC=24, cDietro=[], cDavanti=[]; for(i=0;i<NC;i++){ var a=i/NC*Math.PI*2, p=[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry], d=Math.sin(a)<0; (d?cDietro:cDavanti).push({p:p,s:(.72+.28*(Math.sin(a)+1)/2)*Math.max(.7,rx/220),y:p[1]}); }
  cDietro.sort(function(a,b){ return a.y-b.y; }).forEach(function(c){ carroLato(tav,c.p,c.s,true); });
  var sS=Math.max(.7,rx/(oriz2?260:170)), sR=sS*(oriz2?1.55:1.4), yR=cy+(oriz2?14:12)*sS;      // il rogo grande, al centro del recinto (24 novembre 2026, l'utente: «il rogo delle selle deve essere visibile»)
  el('ellipse',{cx:r1(cx),cy:r1(yR+2*sR),rx:r1(62*sR),ry:r1(9*sR),'class':'ig-ca-rogo-ombra'},tav);
  var R=rogoSelle(tav,cx,yR,sR);
  /* Attila, a sinistra del rogo; il nome sopra la testa, dove nessuno lo copre */
  var hA=Math.max(36,56*sS), xA=cx-52*sR-20*sS, attila=el('g',{'class':'ig-ca-attila'+(ST?' vis':''),transform:'translate('+r1(xA)+','+r1(yR)+')'},tav);
  guerriero(attila,hA,{cl:'notte oro',mantello:true,elmo:false}); tx(attila,0,-hA-8,'ig-ca-et-n vis','Attila','middle');
  /* gli arcieri, lungo i carri e lontani dal centro: tirano verso fuori */
  var arcieri=[]; [[-.8,-.18],[.78,-.22],[-.66,.42],[.62,.46],[.9,.16],[.12,.7]].forEach(function(q,ii){ var p=[cx+q[0]*rx,cy+q[1]*ry], v=q[0]<0?-1:1, g=el('g',{transform:'translate('+xy(p)+')'},tav);
    guerriero(g,Math.max(22,30*sS),{verso:v,cl:'notte',arco:true});
    var fr=el('line',{x1:r1(v*6*sS),y1:r1(-17*sS),x2:r1(v*24*sS),y2:r1(-23*sS),'class':'ig-ca-dardo'},g); fr.style.animationDelay=(-ii*.31).toFixed(2)+'s'; arcieri.push(g); });
  cDavanti.sort(function(a,b){ return a.y-b.y; }).forEach(function(c){ carroLato(tav,c.p,c.s,false); });
  /* il cartellino del rogo, a destra in alto, con il suo filo: «pronto, non acceso» (Giordane 213: construxisse pyram; nessuno lo accende) */
  var tRogo=el('g',{'class':'ig-ca-et-rogo'+(ST?' vis':'')},tav), ya=yR-R.alto*sR, lato=oriz2, xe=cx+44*sR, ye=ya-10*sS;
  var tR1=tx(tRogo,xe+5,ye,'ig-ca-et-n vis grande','il rogo di selle','start'), tR2=tx(tRogo,xe+5,ye+16,'ig-ca-et-sotto','pronto, non acceso · «si racconta»','start');
  if(lato&&xe+5+Math.max(largo(tR1),largo(tR2))>tv[0]+tv[2]-12) lato=false;      // se a destra non c'è posto (telefono in piedi o coricato), sopra il rogo, centrato
  if(!lato){ ye=ya-34; [tR1,tR2].forEach(function(t,j){ t.setAttribute('x',r1(cx)); t.setAttribute('y',r1(ye+j*16)); t.setAttribute('text-anchor','middle'); }); }
  tRogo.insertBefore(el('path',{d:lato?'M'+r1(cx+24*sR)+' '+r1(ya+12*sR)+' L'+r1(xe)+' '+r1(ye+8):'M'+r1(cx)+' '+r1(ye+22)+' L'+r1(cx)+' '+r1(ya+6*sR),'class':'ig-ca-filo'},null),tR1);
  /* il corteo di Teodorico, in primo piano: sei uomini col mantello e la bara, due fiaccole */
  var corteo=el('g',{'class':'ig-ca-corteo'+(ST?' vis':'')},tav), ycort=tv[1]+tv[3]-(oriz2?22:18), hcort=Math.max(22,Math.min(34,tv[3]*.08)), xc0=tv[0]+tv[2]*(oriz2?.36:.6);
  el('path',{d:'M'+r1(xc0+hcort*.3)+' '+r1(ycort-hcort*.74)+' h'+r1(hcort*3.6)+' l'+r1(-hcort*.2)+' '+r1(hcort*.14)+' h'+r1(-hcort*3.2)+' Z','class':'ig-ca-bara'},corteo);
  el('path',{d:'M'+r1(xc0+hcort*.6)+' '+r1(ycort-hcort*.74)+' q'+r1(hcort*1.4)+' '+r1(-hcort*.34)+' '+r1(hcort*3)+' 0 l'+r1(hcort*.1)+' '+r1(hcort*.3)+' h'+r1(-hcort*3.2)+' Z','class':'ig-ca-drappo'},corteo);
  for(i=0;i<6;i++){ var gg=el('g',{transform:'translate('+r1(xc0+i*hcort*.78)+','+r1(ycort)+')'},corteo); guerriero(gg,hcort,{verso:-1,cl:'notte oro',mantello:true,elmo:false}); }
  [0,5].forEach(function(k){ var t0=xc0+k*hcort*.78-hcort*.12; el('line',{x1:r1(t0),y1:r1(ycort-hcort*.62),x2:r1(t0-3),y2:r1(ycort-hcort*1.28),'class':'ig-ca-torcia'},corteo); el('circle',{cx:r1(t0-3),cy:r1(ycort-hcort*1.36),r:3,'class':'ig-ca-fiammella'},corteo); });
  var tCort=tx(corteo,xc0-hcort*.4,ycort-hcort*.3,'ig-ca-et-n','verso Tolosa','end');
  return {brace:brace,sel:R.sel,attila:attila,arcieri:arcieri,tRogo:tRogo,corteo:corteo,cx:cx,cy:cy,rx:rx,ry:ry};
}

/* ======================================================================
   8. Ponte Milvio (312)
   Aggiunta il 23 novembre 2026. Quattro quadri: la marcia sulla carta della pagina (RM_MAPPA, col rilievo), lo schieramento e la rotta sulla pianta del modello
   (RM_TOPO: Tevere, mura, via Flaminia), i due racconti del segno, le tre versioni del ponte e l'iscrizione dell'arco. Fatti e citazioni vengono solo da ciò che la pagina
   già annota: le città della marcia accanto a SCENE_CARTA[312] in js/dati.js (Panegirico del 313, Pan. Lat. XII: «a Rheno ad Alpes» 5, 4, una città «sub ipsis Alpium iugis» presa
   d'assalto 5, 4-6, «Taurinatibus campis» 6, 4, Milano 7, 5, l'assedio di Verona 8-10, la resa di Aquileia 11, 1; Nazario, Pan. Lat. IV del 321: Susa 17, 3 e 21, 1, Torino 22, 1,
   Brescia 25, 1, Verona 25-26, «te, Aquileia, te, Mutina» 27, 1; Aurelio Vittore 40, 23: Saxa Rubra, nove miglia da Roma); lo schieramento «a tergo Tiberi amne» e la rotta
   «angustiis Mulvii pontis» (Panegirico del 313, 16, 3 e 17, 1) e la fuga di Massenzio (Lattanzio 44, 9) dal commento della messa in scena milvio in js/scene-tappe.js; il sogno, la croce
   luminosa e i tre ponti dal riquadro degli storici e dalle voci della tappa 312 (Lattanzio 44, 5 e 9; Eusebio, Vita di Costantino I 28 e Storia ecclesiastica IX 9) e dal commento
   della passerella in js/mura.js (Zosimo II 15-16); l'iscrizione dell'arco (CIL VI 1139, «instinctu divinitatis mentis magnitudine») e il Cronografo del 354 dalle note in testa a js/dati.js.
   Schemi, detti nel disegno e nelle avvertenze: la partenza da Treviri (ipotesi: era la residenza di Costantino), le linee fra le città (la strada esatta non è scritta), il tracciato
   da Modena a Roma, lo schieramento e la rotta, il segno sugli scudi (disegnato dalla descrizione di Lattanzio), la forma dei tre ponti e dell'arco. */
var MILVIO={ titolo:"Ponte Milvio", sotto:"312: la marcia, la battaglia, il segno e il ponte, secondo le fonti",
  fasi:[["312","Costantino scende «dal Reno alle Alpi». Che partisse da Treviri, la sua residenza, è un'ipotesi."],
    ["312","Sotto le Alpi prende d'assalto Susa, poi passa per Torino, Milano e Brescia: sono le città che nominano i panegirici del 313 e del 321."],
    ["312","Verona è assediata. Aquileia si arrende. Nazario nomina anche Modena."],
    ["312","Da Modena a Roma le fonti non dicono la strada: qui il tracciato è uno schema."],
    ["28 ottobre","Secondo il panegirico del 313, l'esercito di Massenzio è schierato con il Tevere alle spalle. Aurelio Vittore pone la battaglia a Saxa Rubra, circa nove miglia da Roma."],
    ["28 ottobre","Messo in fuga, Massenzio corre verso il ponte. Spinto dalla folla dei fuggiaschi, precipita nel Tevere e annega."],
    ["Lattanzio","Lattanzio scrive verso il 315: un sogno, la notte prima della battaglia. Costantino fa segnare sugli scudi dei soldati il segno di Cristo."],
    ["Eusebio","Eusebio scrive dopo il 337: durante la marcia, verso mezzogiorno, una croce luminosa sopra il sole, con la scritta «Con questo vinci». Poi, in sogno, Costantino apprende come usare quel segno."],
    ["Lattanzio","Anche il ponte cambia da una fonte all'altra. Per Lattanzio il ponte alle spalle di Massenzio viene tagliato: nella fuga lo trova «interrotto»."],
    ["Eusebio","Per Eusebio, nella Storia ecclesiastica, è un ponte di barche."],
    ["Zosimo","Per Zosimo è un ponte di travi in due metà, unite al centro da ferri da togliere. Sotto i fuggiaschi cede."],
    ["L'arco","Sull'arco che il Senato dedica a Costantino, la vittoria è attribuita all'«ispirazione della divinità», senza nominarla."]],
  fonte:"Panegirico del 313 e panegirico di Nazario del 321 (Panegirici latini XII e IV) per le città della marcia; Aurelio Vittore 40, 23 per Saxa Rubra; Lattanzio, La morte dei persecutori 44 (verso il 315); Eusebio, Vita di Costantino I 28 (dopo il 337) e Storia ecclesiastica IX 9; Zosimo II 15-16; l'iscrizione dell'arco di Costantino (CIL VI 1139); il Cronografo del 354 per la data. La partenza da Treviri è un'ipotesi; le linee uniscono le città nominate, ma la strada esatta non è scritta, e da Modena a Roma il tracciato è uno schema. Lo schieramento, la rotta, il segno sugli scudi, i tre ponti e l'arco sono disegni schematici: le fonti non dicono numeri, posizioni né forme." };
function disegnaMilvio(svg,S,W,H){
  var G=window.RM_MAPPA, TP=window.RM_TOPO; if(!G||!G.citta||!TP||!TP.fiume) return;
  var oriz=W/H>=1.15, pad=oriz?20:12, defs=el('defs',null,svg);
  var CI=function(c){ var q=G.citta[c]||(G.luoghi||{})[c]; return q?[q.x,q.y]:null; };
  var T={a1:1400,a2:6000,a3:11000,a4:15800,b1:21200,b2:27400,s1:33800,s2:39800,c1:46800,c2:51600,c3:56200,d1:62200};
  T.fin=T.d1+8400;
  grad(defs,'ig-m-notte',[[0,'#141A2A'],[1,'#2C3754']]);
  grad(defs,'ig-m-giorno',[[0,'#FFF4DA'],[.6,'#F7DFAE'],[1,'#EBC27C']]);
  grad(defs,'ig-m-sole',[[0,'#FFFDF4'],[.45,'#FFE7A6'],[1,'#F2B94E',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-m-scudo',[[0,'#B5423A'],[1,'#7E241F']],{x1:0,y1:0,x2:1,y2:1});
  grad(defs,'ig-m-acqua',[[0,'#9CC0CC'],[1,'#5E8C9C']]);
  grad(defs,'ig-m-luce',[[0,'#FFFFFF',.95],[.4,'#FFF3CF',.55],[1,'#FFE3A0',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-m-marmo',[[0,'#F7F2E7'],[1,'#E2D8C4']]);
  grad(defs,'ig-m-suolo',[[0,'#F6F0E2'],[1,'#E6DCC5']]);
  grad(defs,'ig-m-cielo',[[0,'#FBF6EC'],[1,'#EFE5D2']]);

  /* ---------- A. la marcia, sulla carta della pagina ---------- */
  var gA=el('g',{'class':'ig-atto'},svg), V=[336,158,190,212], mb;
  if(oriz){ var mh=H-2*pad, mw=mh*V[2]/V[3], lim=W<700?0.56:0.42; if(mw>W*lim){ mw=W*lim; mh=mw*V[3]/V[2]; } mb=[W-pad-mw,(H-mh)/2,mw,mh]; }
  else { var mw2=W-2*pad, mh2=Math.min(mw2*V[3]/V[2],H*0.64); mw2=mh2*V[2]/V[3]; mb=[(W-mw2)/2,pad,mw2,mh2]; }
  var k=mb[2]/V[2]; function M(p){ return [mb[0]+(p[0]-V[0])*k, mb[1]+(p[1]-V[1])*k]; }
  var cpA=el('clipPath',{id:'ig-m-clip'},defs); el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),rx:12},cpA);
  el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),rx:12,'class':'ig-m-cornice'},gA);
  var zoom=el('g',null,el('g',{'clip-path':'url(#ig-m-clip)'},gA));
  var carta=el('g',{transform:'translate('+r1(mb[0]-V[0]*k)+','+r1(mb[1]-V[1]*k)+') scale('+Math.round(k*1000)/1000+')'},zoom);
  el('rect',{x:V[0]-30,y:V[1]-30,width:V[2]+60,height:V[3]+60,'class':'ig-v-mare'},carta); el('path',{d:G.terra,'class':'ig-v-terra'},carta);
  href(el('image',{x:0,y:0,width:G.w,height:G.h,preserveAspectRatio:'none','class':'ig-m-rilievo'},carta),'img/rilievo.jpg');
  (G.fiumi||[]).forEach(function(f){ if(f.d) el('path',{d:f.d,'class':'ig-v-fiume','vector-effect':'non-scaling-stroke'},carta); });
  el('path',{d:G.terra,'class':'ig-v-costa','vector-effect':'non-scaling-stroke'},carta);
  var sopraA=el('g',null,zoom);
  var R=['treviri','susa','torino','milano','brescia','verona','modena','rimini','narni','roma'].map(CI); if(R.some(function(p){ return !p; })) return;
  var orari=[[T.a1+400,T.a2-400],[T.a2,T.a2+800],[T.a2+800,T.a2+1700],[T.a2+1700,T.a2+2600],[T.a3,T.a3+900],[T.a3+2700,T.a3+3700],[T.a4+200,T.a4+1500],[T.a4+1500,T.a4+2500],[T.a4+2500,T.a4+3400]];
  var gl=el('g',{'class':'ig-m-rotta'},sopraA);
  var tratti=curvaPezzi(R.map(M)).map(function(d,i){ var schema=i===0||i>=6, p=el('path',{d:d,'class':schema?'ig-m-misura':'ig-m-tratto'},gl), o={p:p,schema:schema,t0:orari[i][0],t1:orari[i][1],pt:[]};
    o.L=lungo(p); if(schema){ var n=Math.max(2,Math.floor(o.L/6.5)); for(var j=0;j<=n;j++){ var q=puntoA(p,o.L*j/n); o.pt.push(el('circle',{cx:r1(q[0]),cy:r1(q[1]),r:1.9,'class':'ig-m-punto'},gl)); } } else scopri(p);
    return o; });
  var anello=el('g',{'class':'ig-f',transform:'translate('+xy(M(CI('verona')))+')'},sopraA); el('circle',{r:10.5,'class':'ig-v-anello'},anello);
  var NOMI=[['treviri','Treviri',8,4,'start'],['susa','Susa',-8,4,'end'],['torino','Torino',5,15,'start'],['milano','Milano',-2,-9,'middle'],['brescia','Brescia',2,17,'middle'],['verona','Verona',10,-9,'middle'],
    ['aquileia','Aquileia',4,-9,'middle'],['modena','Modena',-7,14,'end'],['rimini','Rimini',8,4,'start'],['narni','Narni',8,4,'start'],['roma','Roma',10,5,'start']];
  var citta={}; NOMI.forEach(function(n){ var q=M(CI(n[0])), sch=n[0]==='rimini'||n[0]==='narni', g=el('g',{'class':'ig-v-luogo'+(sch?' tenue':''),transform:'translate('+xy(q)+')'},sopraA);
    el('circle',{r:n[0]==='roma'?5.2:sch?2.6:3.8,'class':'ig-v-punto'+(n[0]==='roma'?' roma':'')},g); tx(g,n[2],n[3],'ig-v-nome'+(n[0]==='roma'?' roma':''),n[1],n[4]); citta[n[0]]=g; });
  var arrivo=[T.a1,orari[0][1],orari[1][1],orari[2][1],orari[3][1],orari[4][1],orari[5][1],orari[6][1],orari[7][1],orari[8][1]], idsR=['treviri','susa','torino','milano','brescia','verona','modena','rimini','narni','roma'];
  var Rm=M(CI('roma')), pulsa=el('circle',{cx:r1(Rm[0]),cy:r1(Rm[1]),r:9,'class':'ig-m-onda'},sopraA);
  var testa=el('g',{'class':'ig-m-testa'},sopraA); el('circle',{r:11,'class':'ig-m-alone'},testa); el('circle',{r:5.5,'class':'ig-m-capo'},testa);
  var avvA=el('text',{x:r1(mb[0]+10),y:r1(mb[1]+mb[3]-10),'class':'ig-m-avverte su-carta'},gA); avvA.textContent='linee fra le città nominate: la strada non è scritta';
  if(largo(avvA)>mb[2]-20) avvA.textContent='la strada esatta non è scritta';
  /* il registro delle città, con la fonte di ognuna */
  var REG=[{c:'treviri',n:'Treviri',nota:"la partenza: un'ipotesi",f:'era la residenza di Costantino',tipo:'ipotesi',t:T.a1},
    {n:'Le Alpi',nota:'«dal Reno alle Alpi»',f:'Panegirico del 313, 5',t:T.a1+1700},
    {c:'susa',n:'Susa',nota:"presa d'assalto",f:'Panegirico del 313, 5; Nazario 17 e 21',t:orari[0][1]},
    {c:'torino',n:'Torino',nota:'«nei campi di Torino»',f:'Panegirico del 313, 6; Nazario 22',t:orari[1][1]},
    {c:'milano',n:'Milano',nota:'',f:'Panegirico del 313, 7',t:orari[2][1]},
    {c:'brescia',n:'Brescia',nota:'',f:'Nazario 25',t:orari[3][1]},
    {c:'verona',n:'Verona',nota:'assediata',f:'Panegirico del 313, 8-10; Nazario 25-26',t:orari[4][1]},
    {c:'aquileia',n:'Aquileia',nota:'si arrende',f:'Panegirico del 313, 11',t:T.a3+1800},
    {c:'modena',n:'Modena',nota:'',f:'Nazario 27',t:orari[5][1]},
    {n:'Verso Roma',nota:'la strada non è scritta',f:'schema',tipo:'schema',t:T.a4+300},
    {c:'roma',n:'Roma',nota:'28 ottobre 312',f:'Cronografo del 354',t:orari[8][1]}];
  var lb=oriz?[pad+4,pad,mb[0]-pad-34,H-2*pad]:[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-4];
  var gR=el('g',{'class':'ig-m-registro'},gA), rh=Math.min(31,(lb[3]-50)/REG.length), righe=[], luceR=null, modo=lb[2]>=440&&rh>=20?'righe':'scheda', scheda=null;
  if(modo==='righe'){
    var y0=lb[1]+Math.max(0,(lb[3]-50-rh*REG.length)/2);
    tx(gR,lb[0],y0+12,'ig-m-testata','LE CITTÀ NELLE FONTI'); tx(gR,lb[0],y0+30,'ig-m-sotto','Panegirico del 313 e panegirico di Nazario del 321');
    var luce=el('rect',{x:r1(lb[0]-8),y:0,width:r1(lb[2]+16),height:r1(rh-2),rx:6,'class':'ig-m-riga-luce'},gR);
    var colN=0; REG.forEach(function(r){ var p=tx(gR,0,0,'ig-m-nome',r.n); colN=Math.max(colN,largo(p)); p.remove(); }); colN=Math.min(colN+30,lb[2]*0.3);
    REG.forEach(function(r,i){ var y=y0+50+i*rh, g=el('g',{'class':'ig-m-riga'+(r.tipo?' '+r.tipo:'')},el('g',{transform:'translate(0,'+r1(y)+')'},gR));      // la classe muove la riga: la posizione sta sul gruppo di fuori
      el('circle',{cx:r1(lb[0]+5),cy:r1(rh*.5),r:4,'class':'ig-m-segno'},g); tx(g,lb[0]+18,rh*.5,'ig-m-nome',r.n);
      var tn=r.nota?tx(g,lb[0]+colN,rh*.5,'ig-m-nota',r.nota):null, tf=tx(g,lb[0]+lb[2],rh*.5,'ig-m-fonte',r.f,'end');
      if(tn && lb[0]+colN+largo(tn)+12>lb[0]+lb[2]-largo(tf)) tf.setAttribute('class','ig-m-fonte stretta');
      el('line',{x1:r1(lb[0]),x2:r1(lb[0]+lb[2]),y1:r1(rh-2),y2:r1(rh-2),'class':'ig-m-filo'},g); righe.push({g:g,y:y}); });
    luceR=luce;
  } else {
    scheda={g:el('g',{'class':'ig-m-scheda'},gR)}; var sx=lb[0], sy=lb[1];
    scheda.n=tx(scheda.g,sx,sy+22,'ig-m-nome grande',''); scheda.no=tx(scheda.g,sx,sy+44,'ig-m-nota',''); scheda.f=tx(scheda.g,sx,sy+63,'ig-m-fonte',''); scheda.f.setAttribute('text-anchor','start');
    scheda.tr=lb[3]>=96?tx(scheda.g,sx,sy+lb[3]-6,'ig-m-scia',''):null;
  }

  /* ---------- B. lo schieramento e la rotta, sulla pianta del modello ---------- */
  var gB=el('g',{'class':'ig-atto'},svg), PV=[-336,-646,372,306], pb;
  var sovr=oriz&&W<700;      // telefono coricato: la pianta prende il palco e la legenda le sta sopra, in un riquadro
  if(oriz){ var ph=H-2*pad, pw=ph*PV[2]/PV[3]; if(pw>W*(sovr?1:0.5)-(sovr?2*pad:0)){ pw=W*(sovr?1:0.5)-(sovr?2*pad:0); ph=pw*PV[3]/PV[2]; } pb=[sovr?(W-pw)/2:pad,(H-ph)/2,pw,ph]; }
  else { var pw2=W-2*pad, ph2=Math.min(pw2*PV[3]/PV[2],H*0.7); pw2=ph2*PV[2]/PV[3]; pb=[(W-pw2)/2,pad,pw2,ph2]; }
  var kp=pb[2]/PV[2]; function Pp(p){ return [pb[0]+(p[0]-PV[0])*kp, pb[1]+(p[1]-PV[1])*kp]; }
  var cpB=el('clipPath',{id:'ig-m-clipB'},defs); el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),rx:12},cpB);
  var pianta=el('g',{'class':'ig-m-pianta'},gB), dentroB=el('g',{'clip-path':'url(#ig-m-clipB)'},pianta);
  el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),fill:'url(#ig-m-suolo)'},dentroB);
  var pz=el('pattern',{id:'ig-m-campi',width:14,height:14,patternUnits:'userSpaceOnUse',patternTransform:'rotate(32)'},defs); el('path',{d:'M0 7 H14',stroke:'rgba(140,120,80,.09)','stroke-width':1},pz);
  el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),fill:'url(#ig-m-campi)'},dentroB);
  var muraD='M'+TP.mura.map(Pp).map(xy).join('L')+'Z';
  el('path',{d:muraD,'class':'ig-m-urbe'},dentroB); el('path',{d:muraD,'class':'ig-m-mura'},dentroB);
  var fiumeP=TP.fiume.map(Pp), fiumeD=fiumeP.map(xy).join(' ');
  el('polyline',{points:fiumeD,'class':'ig-m-tevere-alone','stroke-width':r1(Math.max(12,20*kp))},dentroB); el('polyline',{points:fiumeD,'class':'ig-m-tevere','stroke-width':r1(Math.max(5,8*kp))},dentroB);
  var flam=TP.strade[0]||[], flamD=flam.length?'M'+flam.map(Pp).map(xy).join('L'):'';
  if(flamD){ el('path',{d:flamD,'class':'ig-m-via-bordo'},dentroB); el('path',{d:flamD,'class':'ig-m-via'},dentroB); }
  /* il ponte: dove la Flaminia passa il fiume (-152,-480, come in js/mura.js) */
  var B0=[-152,-480], U=[-67,10], lu=Math.hypot(U[0],U[1]); U=[U[0]/lu,U[1]/lu]; var N=[U[1],-U[0]]; if(N[1]>0) N=[-N[0],-N[1]];      // U lungo il fiume, N verso nord
  function piu(p,a,b){ return [p[0]+U[0]*a+N[0]*b, p[1]+U[1]*a+N[1]*b]; }
  var pa=Pp(piu(B0,0,11)), pz2=Pp(piu(B0,0,-11)); el('line',{x1:r1(pa[0]),y1:r1(pa[1]),x2:r1(pz2[0]),y2:r1(pz2[1]),'class':'ig-m-ponte-b'},dentroB); el('line',{x1:r1(pa[0]),y1:r1(pa[1]),x2:r1(pz2[0]),y2:r1(pz2[1]),'class':'ig-m-ponte'},dentroB);
  var lp=Pp(piu(B0,9,-14)); var tPonte=tx(dentroB,lp[0],lp[1]+4,'ig-m-et','ponte Milvio','end');
  var tvP=Pp([-211,-405]); tx(dentroB,tvP[0]-12,tvP[1]+4,'ig-m-et-fiume','Tevere','end');
  /* verso Roma: la Flaminia esce dal fondo della pianta */
  var rq=null; for(i=1;i<flam.length;i++) if(flam[i-1][1]>=PV[1]+PV[3]-8&&flam[i][1]<PV[1]+PV[3]-8){ var fr=(PV[1]+PV[3]-8-flam[i-1][1])/(flam[i][1]-flam[i-1][1]); rq=[lerp(flam[i-1][0],flam[i][0],fr),PV[1]+PV[3]-8]; }
  if(rq){ var rP=Pp(rq); el('path',{d:'M0 0 L-6 -9 L6 -9 Z','class':'ig-m-sx-punta',transform:'translate('+xy([rP[0],rP[1]+6])+')'},dentroB); tx(dentroB,rP[0]-8,rP[1]-12,'ig-m-et','verso Roma','end'); }
  var fl0=Pp([-113,-555]), fl1=Pp([-110,-575]); var tFl=tx(dentroB,0,0,'ig-m-et','via Flaminia','middle'); tFl.setAttribute('transform','translate('+xy([(fl0[0]+fl1[0])/2-9,(fl0[1]+fl1[1])/2])+') rotate('+r1(Math.atan2(fl1[1]-fl0[1],fl1[0]-fl0[0])*180/Math.PI)+')');
  /* Saxa Rubra: fuori dalla pianta, verso nord lungo la Flaminia */
  var sxA=Pp([-104,-596]), sxB=[sxA[0]+4,pb[1]+10], gSx=el('g',{'class':'ig-f'},pianta);
  el('path',{d:'M'+xy(sxA)+' L'+xy(sxB),'class':'ig-m-sx-linea'},gSx); el('path',{d:'M0 0 L-6 9 L6 9 Z','class':'ig-m-sx-punta',transform:'translate('+xy(sxB)+')'},gSx);
  var sxT=tx(gSx,sxB[0]+10,sxB[1]+12,'ig-m-sx','Saxa Rubra, circa nove miglia','start'), sxT2=tx(gSx,sxB[0]+10,sxB[1]+27,'ig-m-sx2','la battaglia, per Aurelio Vittore','start');
  if(sxB[0]+10+largo(sxT)>pb[0]+pb[2]-6){ [sxT,sxT2].forEach(function(q){ q.setAttribute('text-anchor','end'); q.setAttribute('x',r1(sxB[0]-10)); }); }
  var nd=[pb[0]+pb[2]-18,pb[1]+pb[3]-40]; var gN=el('g',{transform:'translate('+xy(nd)+')','class':'ig-m-nord'},pianta); el('path',{d:'M0 -12 L5 4 L0 0 L-5 4 Z'},gN); tx(gN,0,17,'ig-m-et','N','middle');
  var sc0=[pb[0]+12,pb[1]+pb[3]-14]; el('path',{d:'M'+xy(sc0)+' h'+r1(100*kp)+' M'+xy(sc0)+' v-4 M'+xy([sc0[0]+100*kp,sc0[1]])+' v-4','class':'ig-m-scala'},pianta); tx(pianta,sc0[0]+100*kp+6,sc0[1]+1,'ig-m-et','1 km','start');
  el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),rx:12,'class':'ig-m-cornice'},pianta);
  /* gli eserciti: blocchi di fanti (uno schema: numeri e posizioni non sono nelle fonti) */
  var dF=function(p){ var m=1e9; for(var i=1;i<TP.fiume.length;i++) m=Math.min(m,distSeg(p,TP.fiume[i-1],TP.fiume[i])); return m; };
  var ang=r1(Math.atan2(U[1],U[0])*180/Math.PI), bw=Math.max(7,13*kp), bh=Math.max(3.5,5.5*kp), gE=el('g',null,gB), mass=[], cost=[], i, j;
  for(i=-4;i<=4;i++) for(j=0;j<2;j++){ var q=piu(B0,i*14+(j?7:0),26+j*12); if(dF(q)<12) continue; var g=el('g',{'class':'ig-m-blocco mass'},gE); el('rect',{x:r1(-bw/2),y:r1(-bh/2),width:r1(bw),height:r1(bh),rx:1.2},g); mass.push({g:g,p:q}); }
  for(i=-5;i<=5;i++) for(j=0;j<2;j++){ var c=i===-5||i===5, q2=piu(B0,i*13+(j?6:0),84+j*12), g2=el('g',{'class':'ig-m-blocco cost'+(c?' cav':'')},gE);
    if(c) el('path',{d:'M'+r1(-bw/2)+' '+r1(-bh)+' L'+r1(bw/2)+' '+r1(-bh)+' L0 '+r1(bh*1.2)+' Z'},g2); else el('rect',{x:r1(-bw/2),y:r1(-bh/2),width:r1(bw),height:r1(bh),rx:1.2},g2); cost.push({g:g2,p:q2,i:i}); }
  /* la rotta: punti che scorrono verso il ponte; una parte passa, una parte finisce in acqua */
  var arco=[0]; for(i=1;i<TP.fiume.length;i++) arco.push(arco[i-1]+Math.hypot(TP.fiume[i][0]-TP.fiume[i-1][0],TP.fiume[i][1]-TP.fiume[i-1][1]));
  var s0=0, mB=1e9; for(i=1;i<TP.fiume.length;i++){ var a=TP.fiume[i-1], b=TP.fiume[i], dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy, kk=clamp(((B0[0]-a[0])*dx+(B0[1]-a[1])*dy)/l2,0,1), d0=Math.hypot(a[0]+dx*kk-B0[0],a[1]+dy*kk-B0[1]); if(d0<mB){ mB=d0; s0=arco[i-1]+kk*Math.sqrt(l2); } }
  function sulFiume(s){ for(var i=1;i<arco.length;i++) if(arco[i]>=s){ var f=(s-arco[i-1])/(arco[i]-arco[i-1]); return [lerp(TP.fiume[i-1][0],TP.fiume[i][0],f),lerp(TP.fiume[i-1][1],TP.fiume[i][1],f)]; } return TP.fiume[TP.fiume.length-1]; }
  var Rr=caso(312), gP=el('g',{'class':'ig-m-folla'},gB), fuga=[], testaP=piu(B0,0,9);
  for(i=0;i<190;i++){ var m0=mass[Math.floor(Rr()*mass.length)], st=piu(m0.p,(Rr()-.5)*12,(Rr()-.5)*7), acqua=Rr()<.46, fine=acqua?sulFiume(s0+(Rr()-.5)*50):piu(B0,(Rr()-.5)*56,-18-Rr()*46);
    var vc=piu(testaP,(Rr()-.5)*8,6), t0=T.b2+300+Rr()*2600; fuga.push({c:el('circle',{r:r1(Math.max(1.3,1.9*kp)),'class':'ig-m-fuggiasco'},gP),a:Pp(st),v:Pp(vc),b:Pp(fine),t0:t0,t1:t0+1500+Rr()*1100,acqua:acqua,st:null}); }
  var mx=Pp(piu(B0,0,44)), mxV=Pp(testaP), mxF=Pp(sulFiume(s0+9));
  var gMx=el('g',{'class':'ig-m-massenzio'},gB); el('circle',{r:6.5},gMx); var tMx=tx(gMx,10,4,'ig-m-et-mx','Massenzio','start');
  var onda=el('circle',{cx:r1(mxF[0]),cy:r1(mxF[1]),r:5,'class':'ig-m-onda acqua'},gB);
  /* i nomi degli eserciti, accanto alle loro file */
  var mOv=Pp(piu(B0,64,30)), cOv=Pp(piu(B0,-80,96));
  var tM=tx(gB,0,0,'ig-m-et-es mass','Massenzio','end'), tC=tx(gB,0,0,'ig-m-et-es cost','Costantino','end');
  var aOvest=Pp(piu(B0,80,90))[0]-largo(tC)>pb[0]+6, mOvest=Pp(piu(B0,74,32))[0]-largo(tM)>pb[0]+6;
  if(!aOvest) tC.setAttribute('text-anchor','start'); if(!mOvest) tM.setAttribute('text-anchor','start');
  var gMi=el('g',{'class':'ig-f'},gB), lMi=Pp(piu(B0,-34,13)); var tAl=tx(gMi,lMi[0],lMi[1],'ig-m-alle','il Tevere alle spalle','middle');
  /* il pannello accanto: la data, la legenda, le parole delle fonti */
  var xL=oriz?pb[0]+pb[2]+30:pad, yL=oriz?pad+6:pb[1]+pb[3]+12, wL=oriz?W-xL-pad:W-2*pad, hL=oriz?H-2*pad:H-yL-4, gL=el('g',{'class':'ig-m-lato'},gB);
  if(sovr){ wL=136; hL=58; xL=pb[0]+pb[2]-wL-10; yL=pb[1]+46; el('rect',{x:r1(xL-8),y:r1(yL-6),width:wL+14,height:hL+6,rx:8,'class':'ig-m-sovr'},gL); }
  var piccolo=wL<260||hL<120;
  var dD=tx(gL,xL,yL+(piccolo?20:30),'ig-m-data','28 OTTOBRE 312'), fsD=piccolo?20:34; dD.style.fontSize=fsD+'px'; while(largo(dD)>wL-4&&fsD>15){ fsD-=1; dD.style.fontSize=fsD+'px'; }
  var yLg=yL+(piccolo?32:48); function voceLeg(x,y,cl,s){ var g=el('g',null,gL); el('rect',{x:x,y:y-9,width:16,height:7,rx:1.5,'class':'ig-m-leg '+cl},g); tx(g,x+22,y-1,'ig-m-leg-t',s); return g; }
  if(sovr){ voceLeg(xL,yLg,'cost','Costantino'); voceLeg(xL,yLg+17,'mass','Massenzio'); }
  else { voceLeg(xL,yLg+(piccolo?0:6),'cost','Costantino'); voceLeg(xL+(piccolo?110:130),yLg+(piccolo?0:6),'mass','Massenzio'); }
  var citaz=[], una=hL<240;
  if(!piccolo && !sovr && hL>=96){ var yc=yLg+(una?24:40), cw=Math.min(wL,440), yy=yc;
    var cita=function(y,q,chi,t){ var g=el('g',{'class':'ig-m-cita'},gL), fi=el('rect',{x:xL,y:y,width:3,height:10,rx:1.5,'class':'ig-m-cita-filo'},g), tq=el('text',{x:xL+14,y:y+17,'class':'ig-m-cita-t'},g), n=avvolgi(tq,q,cw-20,20);
      tx(g,xL+14,y+17+n*20+2,'ig-m-cita-chi',chi); fi.setAttribute('height',n*20+20); return {g:g,t:t,h:n*20+30}; };
    [['«con il Tevere alle spalle»','Panegirico del 313, 16',T.b1+900],['«nelle strettezze del ponte Milvio»','Panegirico del 313, 17',T.b2+600],
     ['«spinto dalla folla dei fuggiaschi, precipita nel Tevere»','Lattanzio, La morte dei persecutori 44, 9',T.b2+2600]].forEach(function(d){
      var c=cita(una?yc:yy,d[0],d[1],d[2]); if(!una && yy+c.h>yL+hL-44){ c.g.remove(); return; } citaz.push(c); yy+=c.h+16; });
    if(!una){ var avv=el('text',{x:xL,y:yL+hL-4,'class':'ig-m-avverte'},gL); avvolgi(avv,'Schieramento e rotta sono uno schema: le fonti non dicono numeri né posizioni.',wL,15);
      var na=avv.childNodes.length; if(na>1) avv.setAttribute('y',r1(yL+hL-4-(na-1)*15)); }
  }

  /* ---------- il segno, nelle due versioni ---------- */
  var gS=el('g',{'class':'ig-atto'},svg), xS=oriz&&W-(pb[0]+pb[2]+30)-pad>=470?pb[0]+pb[2]+30:pad, sopraPianta=xS===pad;
  var rS=[xS,pad,W-xS-pad,H-2*pad], affianco=rS[2]>=rS[3]*1.25, cwS=affianco?(rS[2]-16)/2:rS[2], chS=affianco?rS[3]:(rS[3]-14)/2;
  function cartaSegno(x,y,w,h,tipo){
    var g=el('g',{'class':'ig-m-carta '+tipo},gS), sc=Math.min(w/300,h/300), notte=tipo==='lattanzio';
    el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(h),rx:14,fill:notte?'url(#ig-m-notte)':'url(#ig-m-giorno)','class':'ig-m-carta-fondo'},g);
    var ti=tx(g,x+16,y+26,'ig-m-c-tit',notte?'LATTANZIO':'EUSEBIO'), so=tx(g,x+16,y+43,'ig-m-c-sot',notte?'verso il 315 · La morte dei persecutori 44':'dopo il 337 · Vita di Costantino I 28');
    var top=56; if(largo(so)>w-28-(notte?30:0)){ so.textContent=''; avvolgi(so,notte?'verso il 315 · La morte dei persecutori 44':'dopo il 337 · Vita di Costantino I 28',w-28-(notte?30:0),14); top=56+14*(so.childNodes.length-1); }
    var o={g:g,linee:[]}, notaS=notte?'Il segno: schema dalla descrizione di Lattanzio.':'Nella Storia ecclesiastica (IX 9) nessuna visione.', nl=0;
    if(h>=230){ o.nota=el('text',{x:r1(x+16),y:0,'class':'ig-m-c-nota'},g); nl=avvolgi(o.nota,notaS,w-32,15); o.nota.setAttribute('y',r1(y+h-11-(nl-1)*15)); }
    var impila=(w-32)/2<150, foot=(nl?nl*15+10:0)+(impila?44:(h>=200?34:28)), cx=x+w/2, cy=y+top+(h-top-foot)/2, R0=Math.min((h-top-foot)/2-4,w*0.34);
    if(notte){
      var Rs=caso(7); for(var i=0;i<26;i++) el('circle',{cx:r1(x+12+Rs()*(w-24)),cy:r1(y+50+Rs()*(h*0.5)),r:r1(.6+Rs()*1.1),'class':'ig-m-stella'},g);
      var lr=Math.max(8,R0*0.15); el('path',{d:'M0 '+r1(-lr)+' A'+r1(lr)+' '+r1(lr)+' 0 1 1 0 '+r1(lr)+' A'+r1(lr*.72)+' '+r1(lr)+' 0 1 0 0 '+r1(-lr)+' Z','class':'ig-m-luna',transform:'translate('+r1(x+w-20-lr)+','+r1(y+22+lr)+')'},g);
      var ry=R0*0.95, rx=ry*0.64; o.scudo=el('g',{transform:'translate('+r1(cx)+','+r1(cy)+')','class':'ig-m-scudo'},g);
      el('ellipse',{rx:r1(rx+5),ry:r1(ry+5),'class':'ig-m-scudo-ombra'},o.scudo); el('ellipse',{rx:r1(rx),ry:r1(ry),fill:'url(#ig-m-scudo)','class':'ig-m-scudo-bordo'},o.scudo);
      el('ellipse',{rx:r1(rx-7),ry:r1(ry-7),'class':'ig-m-scudo-filo'},o.scudo);
      /* il segno: la X «piegata», con la cima ricurva (Lattanzio 44, 5): disegno schematico */
      [['M0 '+r1(-ry*.62)+' L0 '+r1(ry*.66)],['M'+r1(-rx*.58)+' '+r1(-ry*.12)+' L'+r1(rx*.58)+' '+r1(-ry*.12)],['M0 '+r1(-ry*.62)+' C'+r1(rx*.62)+' '+r1(-ry*.7)+' '+r1(rx*.62)+' '+r1(-ry*.24)+' 0 '+r1(-ry*.28)]].forEach(function(d){
        var p=el('path',{d:d[0],'class':'ig-m-segno-d'},o.scudo); scopri(p); o.linee.push(p); });
    } else {
      var A0=h-top-foot-4, Re=Math.max(20,Math.min(w*0.34,(A0-40)/1.75)), ys=y+top+16, cl=Re*0.46, cyc=ys+12+cl*0.78, sr=Re*0.42, sy=Math.min(cyc+cl*0.95+sr*1.15,y+h-foot-sr*1.05);
      el('circle',{cx:r1(cx),cy:r1(sy),r:r1(sr*2.4),fill:'url(#ig-m-sole)'},g);
      var raggi=el('g',{'class':'ig-m-raggi',transform:'translate('+r1(cx)+','+r1(sy)+')'},g); for(var q=0;q<16;q++){ var a=q/16*Math.PI*2; el('line',{x1:r1(Math.cos(a)*sr*1.25),y1:r1(Math.sin(a)*sr*1.25),x2:r1(Math.cos(a)*sr*(q%2?1.6:1.9)),y2:r1(Math.sin(a)*sr*(q%2?1.6:1.9))},raggi); }
      el('circle',{cx:r1(cx),cy:r1(sy),r:r1(sr),'class':'ig-m-sole'},g);
      o.croce=el('g',{transform:'translate('+r1(cx)+','+r1(cyc)+')','class':'ig-m-croce'},g);
      el('circle',{r:r1(cl*1.2),fill:'url(#ig-m-luce)'},o.croce); el('path',{d:'M0 '+r1(-cl*.75)+' V'+r1(cl*.85)+' M'+r1(-cl*.5)+' '+r1(-cl*.25)+' H'+r1(cl*.5),'class':'ig-m-croce-l'},o.croce);
      o.scritta=tx(g,cx,ys,'ig-m-vinci','CON QUESTO VINCI','middle');
    }
    var st=notte?['il sogno, la notte prima','il segno sugli scudi']:['la croce nel cielo, in marcia','poi il sogno'], yb=y+h-foot+16;
    o.passi=st.map(function(s,i){ var gg=el('g',{'class':'ig-m-passo'},g), xx=impila?x+16:x+16+i*(w-32)/2, yy=impila?yb-6+i*20:yb; el('circle',{cx:r1(xx+8),cy:r1(yy-4),r:8,'class':'ig-m-passo-n'},gg); tx(gg,xx+8,yy,'ig-m-passo-c',String(i+1),'middle'); var t=tx(gg,xx+21,yy,'ig-m-passo-t',s);
      if(!impila && largo(t)>(w-32)/2-26){ t.textContent=''; avvolgi(t,s,(w-32)/2-26,14); t.setAttribute('y',r1(yy-6)); [].forEach.call(t.childNodes,function(c){ c.setAttribute('x',r1(xx+21)); }); } return gg; });
    return o;
  }
  var kL=cartaSegno(rS[0],rS[1],cwS,chS,'lattanzio'), kE=cartaSegno(affianco?rS[0]+cwS+16:rS[0],affianco?rS[1]:rS[1]+chS+14,cwS,chS,'eusebio');

  /* ---------- C. tre ponti, tre racconti ---------- */
  /* Ogni carta è alta quanto il suo testo, misurato dopo avvolgi (23 novembre 2026: sul telefono la citazione di Lattanzio usciva dalla carta); fra opera e numero del passo
     uno spazio unificatore, perché il numero non vada a capo da solo */
  var gC=el('g',{'class':'ig-atto'},svg), riga=W/3>=210, gap=12, pW=riga?(W-2*pad-2*gap)/3:W-2*pad, disp=H-2*pad-(riga?0:2*gap), basso=!riga&&disp/3<175, frTw=.42, pHs=[];
  var TESTI=[['LATTANZIO','La morte dei persecutori\u00a044,\u00a09','Il ponte alle spalle di Massenzio viene tagliato: nella fuga è «interrotto».'],['EUSEBIO','Storia ecclesiastica\u00a0IX\u00a09','Un ponte di barche.'],
    ['ZOSIMO','libro\u00a0II,\u00a015-16','Travi in due metà, unite al centro da ferri da togliere: sotto i fuggiaschi cede.']];
  function righeDi(s,cl,w,lh){ var t=el('text',{x:0,y:0,'class':cl},gC); t.textContent=s; var n=1; if(largo(t)>w){ t.textContent=''; n=avvolgi(t,s,w,lh); } t.remove(); return n; }
  function serve(d,tw){ var nr=righeDi(d[1],'ig-m-c-sot dark',tw-4,13); return (nr>1?72:58)+(righeDi(d[2],'ig-m-pann-dida',tw-4,16)-1)*16+14; }
  if(riga) pHs=[disp,disp,disp];
  else if(basso){ var tw0, nec; [.42,.5,.58,.66].some(function(f){ frTw=f; tw0=Math.min(pW*f,f>.42?260:190); nec=TESTI.map(function(d){ return serve(d,tw0); }); return nec[0]+nec[1]+nec[2]<=disp; });
    var ex=Math.max(0,(disp-nec[0]-nec[1]-nec[2])/3); pHs=nec.map(function(n){ return n+ex; }); }
  else pHs=[disp/3,disp/3,disp/3];
  function pannello(i,chi,rif,dida){
    var pH=pHs[i], x=pad+(riga?i*(pW+gap):0), y=pad+(riga?0:pHs.slice(0,i).reduce(function(a,b){ return a+b+gap; },0)), g=el('g',{'class':'ig-m-pann'},gC);
    el('rect',{x:r1(x),y:r1(y),width:r1(pW),height:r1(pH),rx:12,'class':'ig-m-pann-fondo'},g);
    var tw=basso?Math.min(pW*frTw,frTw>.42?260:190):pW-24;
    tx(g,x+12,y+(basso?22:24),'ig-m-c-tit dark',chi); var r=tx(g,x+12,y+(basso?38:41),'ig-m-c-sot dark',rif); if(largo(r)>tw-4){ r.textContent=''; avvolgi(r,rif,tw-4,13); }
    var lh=basso?16:18, dd=el('text',{x:r1(x+12),y:0,'class':'ig-m-pann-dida'},g), nd=avvolgi(dd,dida,tw-4,lh), yd=basso?y+(r.childNodes.length>1?72:58):y+pH-14-(nd-1)*lh;
    dd.setAttribute('y',r1(yd)); var top=y+(r.childNodes.length>1?62:50), bx=basso?[x+tw+14,y+8,pW-tw-22,pH-16]:[x+12,top,pW-24,yd-lh-6-top];
    var cp=el('clipPath',{id:'ig-m-pc'+i},defs); el('rect',{x:r1(bx[0]),y:r1(bx[1]),width:r1(bx[2]),height:r1(bx[3]),rx:8},cp);
    var dis=el('g',{'clip-path':'url(#ig-m-pc'+i+')'},g); return {g:g,b:bx,d:dis};
  }
  /* il fiume visto di fianco: le rive, l'acqua, il piano del ponte a quota yd */
  function fiumeLato(P,o){
    var b=P.b, x=b[0], y=b[1], w=b[2], h=b[3], yw=y+h*0.64, yd=y+h*0.42, xa=x+w*0.13, xb=x+w*0.87;
    el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(h),fill:'url(#ig-m-cielo)'},P.d);
    el('path',{d:'M'+r1(x)+' '+r1(yd-h*.05)+' Q'+r1(x+w*.25)+' '+r1(yd-h*.16)+' '+r1(x+w*.5)+' '+r1(yd-h*.08)+' T'+r1(x+w)+' '+r1(yd-h*.1)+' L'+r1(x+w)+' '+r1(yw)+' L'+r1(x)+' '+r1(yw)+' Z','class':'ig-m-colli'},P.d);
    el('rect',{x:r1(x),y:r1(yw),width:r1(w),height:r1(y+h-yw),fill:'url(#ig-m-acqua)'},P.d); el('line',{x1:r1(x),x2:r1(x+w),y1:r1(yw+.5),y2:r1(yw+.5),'class':'ig-m-pelo'},P.d);
    for(var q=0;q<3;q++){ var yy=yw+8+q*((y+h-yw-8)/3), dd='M'+r1(x)+' '+r1(yy); for(var xx=x;xx<x+w+20;xx+=18) dd+=' q4.5 -2.2 9 0 t9 0'; el('path',{d:dd,'class':'ig-onda',style:'opacity:'+(.22-q*.05)},P.d); }
    el('path',{d:'M'+r1(x)+' '+r1(yd+2)+' L'+r1(xa)+' '+r1(yd+2)+' L'+r1(xa+w*0.1)+' '+r1(y+h)+' L'+r1(x)+' '+r1(y+h)+' Z','class':'ig-m-riva'},P.d);
    el('path',{d:'M'+r1(x+w)+' '+r1(yd+2)+' L'+r1(xb)+' '+r1(yd+2)+' L'+r1(xb-w*0.1)+' '+r1(y+h)+' L'+r1(x+w)+' '+r1(y+h)+' Z','class':'ig-m-riva'},P.d);
    el('path',{d:'M'+r1(x)+' '+r1(yd+2)+' H'+r1(xa)+' M'+r1(xb)+' '+r1(yd+2)+' H'+r1(x+w),'class':'ig-m-erba'},P.d);
    var et=tx(P.d,x+w-8,y+15,'ig-m-schema','schema','end');
    return {x:x,y:y,w:w,h:h,yw:yw,yd:yd,xa:xa,xb:xb};
  }
  var P1=pannello(0,TESTI[0][0],TESTI[0][1],TESTI[0][2]), P2=pannello(1,TESTI[1][0],TESTI[1][1],TESTI[1][2]), P3=pannello(2,TESTI[2][0],TESTI[2][1],TESTI[2][2]);
  var f1=fiumeLato(P1), f2=fiumeLato(P2), f3=fiumeLato(P3), th=Math.max(4,f1.h*0.045), hu=Math.max(8,f1.h*0.12);
  /* 1. Lattanzio: un piano su pile; il tratto di mezzo si stacca e cade */
  var L1={}, m1=(f1.xa+f1.xb)/2, g1=(f1.xb-f1.xa)*0.11;
  [f1.xa+(f1.xb-f1.xa)*0.28,f1.xa+(f1.xb-f1.xa)*0.72].forEach(function(px){ el('rect',{x:r1(px-th*.6),y:r1(f1.yd),width:r1(th*1.2),height:r1(f1.y+f1.h-f1.yd),'class':'ig-m-pila'},P1.d); });
  el('rect',{x:r1(f1.xa-4),y:r1(f1.yd-th),width:r1(m1-g1-f1.xa+4),height:r1(th),'class':'ig-m-piano'},P1.d); el('rect',{x:r1(m1+g1),y:r1(f1.yd-th),width:r1(f1.xb+4-m1-g1),height:r1(th),'class':'ig-m-piano'},P1.d);
  L1.pezzo=el('rect',{x:r1(m1-g1),y:r1(f1.yd-th),width:r1(2*g1),height:r1(th),'class':'ig-m-piano rotto'},P1.d);
  L1.spruzzo=el('ellipse',{cx:r1(m1),cy:r1(f1.yw+2),rx:r1(g1*1.6),ry:4,'class':'ig-m-spruzzo'},P1.d);
  /* 2. Eusebio: barche affiancate sotto un piano di passaggio */
  var L2={barche:[]}, nb=riga?6:8, sp2=(f2.xb-f2.xa)/(nb+0.2), yb2=f2.yw+2, bl=sp2*0.92, bh2=Math.max(6,f2.h*0.09);
  for(i=0;i<nb;i++){ var bx2=f2.xa+sp2*(i+0.6), gb=el('g',{'class':'ig-m-barca'},P2.d);
    el('path',{d:'M'+r1(-bl/2)+' '+r1(-bh2*.55)+' Q'+r1(-bl*.42)+' '+r1(bh2*.6)+' 0 '+r1(bh2*.6)+' Q'+r1(bl*.42)+' '+r1(bh2*.6)+' '+r1(bl/2)+' '+r1(-bh2*.55)+' Z','class':'ig-m-scafo'},gb);
    el('line',{x1:0,y1:r1(-bh2*.55),x2:0,y2:r1(-(yb2-f2.yd)+th*.2),'class':'ig-m-palo'},gb); L2.barche.push({g:gb,x:bx2,f:i*1.3}); }
  L2.piano=el('rect',{x:r1(f2.xa-4),y:r1(f2.yd-th),width:r1(f2.xb-f2.xa+8),height:r1(th),'class':'ig-m-piano'},P2.d);
  /* 3. Zosimo: due metà su cavalletti, unite da ferri al centro; i ferri si tolgono e le metà cedono */
  var L3={}, m3=(f3.xa+f3.xb)/2;
  [f3.xa+(f3.xb-f3.xa)*0.16,f3.xb-(f3.xb-f3.xa)*0.16].forEach(function(px){ el('path',{d:'M'+r1(px-th*1.6)+' '+r1(f3.y+f3.h)+' L'+r1(px)+' '+r1(f3.yd)+' L'+r1(px+th*1.6)+' '+r1(f3.y+f3.h),'class':'ig-m-cavalletto'},P3.d); });
  L3.sx=el('g',null,P3.d); el('rect',{x:r1(f3.xa-4),y:r1(f3.yd-th),width:r1(m3-f3.xa+4),height:r1(th),'class':'ig-m-piano'},L3.sx);
  L3.dx=el('g',null,P3.d); el('rect',{x:r1(m3),y:r1(f3.yd-th),width:r1(f3.xb+4-m3),height:r1(th),'class':'ig-m-piano'},L3.dx);
  L3.ferri=el('g',{'class':'ig-m-ferri'},P3.d); L3.alone=el('circle',{cx:r1(m3),cy:r1(f3.yd-th/2),r:r1(th*3.2),'class':'ig-m-ferri-luce'},L3.ferri);
  L3.chiodi=[-1,1].map(function(s){ var g=el('g',null,L3.ferri); el('rect',{x:r1(m3+s*th*0.9-th*.35),y:r1(f3.yd-th*1.8),width:r1(th*.7),height:r1(th*2.6),rx:1,'class':'ig-m-ferro'},g); return g; });
  L3.spruzzo=el('ellipse',{cx:r1(m3),cy:r1(f3.yw+2),rx:r1((f3.xb-f3.xa)*0.16),ry:4,'class':'ig-m-spruzzo'},P3.d);
  /* gli uomini in fuga sui tre ponti */
  function fuggiaschi(P,f,n){ var a=[]; for(var q=0;q<n;q++) a.push({o:omino(P.d,hu,'mass'),d:q/n}); return a; }
  var U1=fuggiaschi(P1,f1,5), U2=fuggiaschi(P2,f2,5), U3=fuggiaschi(P3,f3,6);

  /* ---------- D. l'arco del Senato ---------- */
  var gD=el('g',{'class':'ig-atto'},svg), ab, tb;
  if(oriz){ var aw=Math.min(W*(W<700?0.46:0.54),(H-2*pad-30)*1.25); ab=[pad+10,(H-30-aw/1.25)/2+4,aw,aw/1.25]; tb=[ab[0]+aw+34,pad,W-(ab[0]+aw+34)-pad,H-2*pad]; }
  else { var aw2=W-2*pad-10, ah2=Math.min(aw2/1.25,H*0.5); aw2=ah2*1.25; ab=[(W-aw2)/2,pad+6,aw2,ah2]; tb=[pad,ab[1]+ah2+40,W-2*pad,H-(ab[1]+ah2+40)-4]; }
  var arcoG=el('g',{'class':'ig-m-arco'},gD), az=el('g',null,arcoG), A=function(px,py){ return [ab[0]+px/100*ab[2], ab[1]+py/80*ab[3]]; }, p0=function(px){ return A(px,0)[0]; };
  grad(defs,'ig-m-buio',[[0,'#2A221D'],[.75,'#3B322B'],[1,'#6B5A49']]);
  el('ellipse',{cx:r1(ab[0]+ab[2]/2),cy:r1(ab[1]+ab[3]+2),rx:r1(ab[2]*0.56),ry:r1(ab[3]*0.03),'class':'ig-m-a-ombra'},arcoG);
  function rA(x,y,w,h,cl){ var p=A(x,y), q=A(x+w,y+h); return el('rect',{x:r1(p[0]),y:r1(p[1]),width:r1(q[0]-p[0]),height:r1(q[1]-p[1]),'class':cl},az); }
  function fornice(cx,w,yTop,yBase){ var p=A(cx-w/2,yBase), q=A(cx+w/2,yTop+w/2), rr=(q[0]-p[0])/2, t=A(cx,yTop);
    el('path',{d:'M'+r1(p[0]-3)+' '+r1(q[1])+' A'+r1(rr+3)+' '+r1(rr+3)+' 0 0 1 '+r1(q[0]+3)+' '+r1(q[1]),'class':'ig-m-a-ghiera'},az);
    el('path',{d:'M'+xy(p)+' L'+r1(p[0])+' '+r1(q[1])+' A'+r1(rr)+' '+r1(rr)+' 0 0 1 '+r1(q[0])+' '+r1(q[1])+' L'+r1(q[0])+' '+r1(p[1])+' Z',fill:'url(#ig-m-buio)','class':'ig-m-fornice'},az);
    el('rect',{x:r1(t[0]-rr*0.09),y:r1(t[1]-2),width:r1(rr*0.18),height:r1(rr*0.22),'class':'ig-m-a-chiave'},az); }
  rA(0,76,100,4,'ig-m-a-base'); rA(2,22,96,54,'ig-m-a-corpo'); rA(0,18,100,5,'ig-m-a-cornice'); rA(3,1,94,17,'ig-m-a-attico'); rA(1,0,98,1.6,'ig-m-a-cornice');
  fornice(50,25,30,76); fornice(18.5,12,47,76); fornice(81.5,12,47,76);
  [[18.5,37],[81.5,37]].forEach(function(c){ [-3.6,3.6].forEach(function(dx){ var p=A(c[0]+dx,c[1]); el('circle',{cx:r1(p[0]),cy:r1(p[1]),r:r1(ab[2]*0.028),'class':'ig-m-tondo'},az); }); });
  [7.5,31.5,68.5,92.5].forEach(function(cx){ rA(cx-3.2,64,6.4,12,'ig-m-a-plinto'); rA(cx-2.1,27,4.2,37,'ig-m-a-colonna'); rA(cx-2.8,24.5,5.6,2.6,'ig-m-a-capitello'); rA(cx-3.4,18,6.8,6.5,'ig-m-a-risalto');
    var s=A(cx,18), sh=ab[3]*0.19, X=function(v){ return r1(s[0]+v*sh); }, Y=function(v){ return r1(s[1]-v*sh); };      // un Dace in piedi, le mani incrociate davanti: sagoma schematica
    el('path',{d:'M'+X(-.15)+' '+Y(0)+' L'+X(-.13)+' '+Y(.42)+' L'+X(-.16)+' '+Y(.66)+' Q'+X(-.15)+' '+Y(.76)+' '+X(-.06)+' '+Y(.78)+' L'+X(.06)+' '+Y(.78)+' Q'+X(.15)+' '+Y(.76)+' '+X(.16)+' '+Y(.66)+' L'+X(.13)+' '+Y(.42)+' L'+X(.15)+' '+Y(0)+' Z','class':'ig-m-a-statua'},az);
    el('path',{d:'M'+X(-.13)+' '+Y(.5)+' Q'+X(0)+' '+Y(.44)+' '+X(.13)+' '+Y(.5),'class':'ig-m-a-braccia'},az);
    el('path',{d:'M'+X(-.075)+' '+Y(.8)+' Q'+X(-.08)+' '+Y(.98)+' '+X(.02)+' '+Y(1)+' Q'+X(.1)+' '+Y(.97)+' '+X(.075)+' '+Y(.8)+' Z','class':'ig-m-a-statua'},az);
    for(var fl=-1;fl<=1;fl++) el('line',{x1:r1(p0(cx)+fl*ab[2]*0.008),x2:r1(p0(cx)+fl*ab[2]*0.008),y1:r1(A(0,28)[1]),y2:r1(A(0,63)[1]),'class':'ig-m-a-scanal'},az); });
  [[11,4,15,12],[74,4,15,12]].forEach(function(q){ rA(q[0],q[1],q[2],q[3],'ig-m-a-rilievo'); });
  var isc=rA(37,3,26,13,'ig-m-a-isc'), righeI=[];
  var Rw=caso(1139); for(i=0;i<6;i++){ var w0=[20,24,22,24,21,16][i], gr=el('g',{'class':'ig-m-a-riga'+(i===3?' chiave':'')},az), xx=50-w0/2; while(xx<50+w0/2-1){ var lw=Math.min(50+w0/2-xx,2+Rw()*4.5); var q1=A(xx,4.6+i*1.85), q2=A(xx+lw,4.6+i*1.85+.9); el('rect',{x:r1(q1[0]),y:r1(q1[1]),width:r1(q2[0]-q1[0]),height:r1(q2[1]-q1[1])},gr); xx+=lw+.8; } righeI.push(gr); }
  var pI=A(50,4.6+3*1.85+.45), tI=tx(az,pI[0],pI[1]+ab[3]*0.006,'ig-m-a-lettere','INSTINCTV DIVINITATIS','middle'); tI.style.fontSize=r1(ab[3]*0.016)+'px';
  var lente=A(50,9.5);
  /* il testo accanto */
  var gT=el('g',{'class':'ig-m-arco-testo'},gD), tq=el('text',{x:r1(tb[0]),y:r1(tb[1]+(oriz?tb[3]*0.3:30)),'class':'ig-m-arco-q'},gT), fq=oriz?Math.min(34,tb[2]/9):Math.min(26,W/13);
  tq.style.fontSize=r1(fq)+'px'; var nq=avvolgi(tq,'«ispirazione della divinità»',tb[2],fq*1.15);
  var yq=+tq.getAttribute('y')+(nq-1)*fq*1.15;
  var tl=tx(gT,tb[0],yq+fq*0.9,'ig-m-arco-lat','INSTINCTV DIVINITATIS'), fl=15; while(largo(tl)>tb[2]&&fl>10){ fl-=.5; tl.style.fontSize=fl+'px'; } var tn=el('text',{x:r1(tb[0]),y:r1(yq+fq*0.9+28),'class':'ig-m-arco-n'},gT); avvolgi(tn,'Con queste parole l\'iscrizione attribuisce la vittoria a una divinità, senza nominarla.',tb[2],19);
  var ts=tx(gT,tb[0],yq+fq*0.9+28+tn.childNodes.length*19+10,'ig-m-arco-f','Arco di Costantino, dedicato dal Senato · CIL VI 1139');
  if(largo(ts)>tb[2]) ts.textContent='Arco di Costantino · CIL VI 1139';
  var tsc=tx(gD,ab[0]+ab[2],ab[1]+ab[3]+14,'ig-m-schema','arco: disegno schematico','end');
  /* Le due foto vere (23 novembre 2026, richiesta dall'utente), da Wikimedia Commons: l'arco intero, lato sud (Paris Orlando, CC BY-SA 4.0) e l'iscrizione da vicino
     (Carole Raddato, CC BY-SA 2.0). Tutto si disegna nelle coordinate della foto dell'arco (1200 x 1013); la foto ravvicinata (1200 x 900) vi è posata nel riquadro RI, che copre
     la stessa porzione dell'attico (misurato sui due file: lo specchio dell'iscrizione va da x 478 a 772 nell'arco e da x 190 a 1000 nella foto ravvicinata). Una «camera» passa
     dall'arco intero all'attico, la foto ravvicinata entra in dissolvenza, un velo scurisce il resto e una banda dorata segna «INSTINCTV DIVINITATIS» (misurata sul file: x 292-842,
     y 313-345), poi la camera si avvicina alla riga. Se manca una foto si usa l'altra; se mancano tutte e due resta il disegno. Con «Riduci movimento» le due foto stanno ferme,
     una sopra l'altra, con la riga già segnata. Le didascalie seguono la foto che si vede. */
  var cpF=el('clipPath',{id:'ig-m-arco-clip'},defs); el('rect',{x:r1(ab[0]),y:r1(ab[1]),width:r1(ab[2]),height:r1(ab[3]),rx:10},cpF);
  var AW=1200, AH=1013, RI=[409,177,435,326.25], ks=RI[2]/1200, BAND=[292,313,550,32], BR=[RI[0]+BAND[0]*ks,RI[1]+BAND[1]*ks,BAND[2]*ks,BAND[3]*ks];
  var fotoG=el('g',{'class':'ig-m-arco ig-m-arco-foto'},gD), fotoA=null, ok={a:false,i:false}, capOra='';
  fotoG.style.display='none';
  function pannelloFoto(box,id){ var cp=el('clipPath',{id:id},defs); el('rect',{x:r1(box[0]),y:r1(box[1]),width:r1(box[2]),height:r1(box[3]),rx:10},cp);
    var o={box:box,g:el('g',{'clip-path':'url(#'+id+')'},fotoG)}; el('rect',{x:r1(box[0]),y:r1(box[1]),width:r1(box[2]),height:r1(box[3]),'class':'ig-m-foto-fondo'},o.g); o.cam=el('g',null,o.g);
    o.imA=el('image',{x:0,y:0,width:AW,height:AH,preserveAspectRatio:'none'},o.cam);
    o.vic=el('g',{transform:'translate('+RI[0]+','+RI[1]+') scale('+Math.round(ks*100000)/100000+')'},o.cam); o.imI=el('image',{x:0,y:0,width:1200,height:900,preserveAspectRatio:'none'},o.vic);
    o.velo=el('path',{d:'M-20 -20 H1220 V920 H-20 Z M'+BAND[0]+' '+BAND[1]+' V'+(BAND[1]+BAND[3])+' H'+(BAND[0]+BAND[2])+' V'+BAND[1]+' Z','fill-rule':'evenodd','class':'ig-m-velo',opacity:0},o.vic);
    o.banda=el('rect',{x:BAND[0],y:BAND[1],width:BAND[2],height:BAND[3],rx:3,'class':'ig-m-banda',opacity:0},o.vic);
    o.bandaL=el('rect',{x:BAND[0],y:BAND[1],width:BAND[2],height:BAND[3],rx:3,'class':'ig-m-banda-l','vector-effect':'non-scaling-stroke'},o.vic);
    o.bandaL._L=2*(BAND[2]+BAND[3]); o.bandaL.style.strokeDasharray=o.bandaL._L+' '+o.bandaL._L; o.bandaL.setAttribute('stroke-dashoffset',o.bandaL._L);
    o.K=function(R,cover){ var s=cover?Math.max(box[2]/R[2],box[3]/R[3]):Math.min(box[2]*.92/R[2],box[3]*.9/R[3]); return {s:s,c:[R[0]+R[2]/2,R[1]+R[3]/2]}; };
    o.metti=function(K){ fissa(o.cam,'transform','translate('+r1(box[0]+box[2]/2)+','+r1(box[1]+box[3]/2)+') scale('+Math.round(K.s*100000)/100000+') translate('+r1(-K.c[0])+','+r1(-K.c[1])+')'); };
    return o; }
  function mezzo(a,b,e){ return {s:a.s*Math.pow(b.s/a.s,e),c:[lerp(a.c[0],b.c[0],e),lerp(a.c[1],b.c[1],e)]}; }
  var PF=[], vicinoR=[BR[0]-BR[2]*.05,BR[1]-BR[3]*1.4,BR[2]*1.1,BR[3]*3.8];
  if(POCO){ var hh=(ab[3]-8)/2; PF.push(pannelloFoto([ab[0],ab[1],ab[2],hh],'ig-m-fa')); PF.push(pannelloFoto([ab[0],ab[1]+hh+8,ab[2],hh],'ig-m-fb')); }
  else PF.push(pannelloFoto(ab,'ig-m-fa'));
  PF.forEach(function(P){ P.K0=P.K([0,0,AW,AH],true); P.K1=P.K(RI,true); P.K2=P.K(vicinoR,false); });
  function didascalia(s){ if(capOra===s) return; capOra=s; tsc.textContent=''; tsc.setAttribute('text-anchor','start'); tsc.setAttribute('x',r1(ab[0])); tsc.setAttribute('class','ig-v-ril-lab'); avvolgi(tsc,s,ab[2],14); }
  var CAP={a:"L'arco di Costantino, lato sud · foto Paris Orlando (NikonZ7II), CC BY-SA 4.0, Wikimedia Commons",i:"L'iscrizione sul lato sud dell'arco · foto Carole Raddato, CC BY-SA 2.0, Wikimedia Commons",
    due:"Sopra l'arco, lato sud: foto Paris Orlando (NikonZ7II), CC BY-SA 4.0. Sotto l'iscrizione: foto Carole Raddato, CC BY-SA 2.0. Wikimedia Commons"};
  function pronta(){ fotoA=fotoG; fotoG.style.display=''; arcoG.style.display='none'; if(S._t!=null) S.passo(S._t); }      // ridisegna il fotogramma in corso (anche fermo, con «Riduci movimento»)
  PF.forEach(function(P,ii){
    P.imA.addEventListener('load',function(){ ok.a=true; pronta(); }); P.imA.addEventListener('error',function(){ P.imA.remove(); });
    P.imI.addEventListener('load',function(){ ok.i=true; pronta(); }); P.imI.addEventListener('error',function(){ P.vic.remove(); });
    href(P.imA,'img/infografiche/arco-costantino.jpg'); href(P.imI,'img/infografiche/arco-costantino-iscrizione.jpg'); });

  /* ---------- la regia ---------- */
  S.passo=function(t){ S._t=t;
    /* A */
    var vA=t>=300&&t<T.b1-250; cls(gA,'vis',vA);
    var z=lerp(1,3.4,E.io(fase(t,T.b1-2400,T.b1-300))); fissa(zoom,'transform',z>1.001?'translate('+r1(Rm[0])+','+r1(Rm[1])+') scale('+Math.round(z*1000)/1000+') translate('+r1(-Rm[0])+','+r1(-Rm[1])+')':'');
    var testaP=null;
    tratti.forEach(function(o){ var f=E.io(fase(t,o.t0,o.t1)); if(o.schema){ var n=Math.round(f*(o.pt.length-1)); o.pt.forEach(function(c,ii){ cls(c,'vis',f>0&&ii<=n); }); } else traccia(o.p,f);
      if(t>=o.t0&&t<=o.t1+250) testaP=puntoA(o.p,o.L*f); });
    if(testaP) fissa(testa,'transform','translate('+xy(testaP)+')'); cls(testa,'vis',!!testaP);
    idsR.forEach(function(c,ii){ cls(citta[c],'vis',t>=arrivo[ii]-150); cls(citta[c],'ora',t>=arrivo[ii]&&t<arrivo[ii]+900); });
    cls(citta.aquileia,'vis',t>=T.a3+1800); cls(anello,'vis',t>=orari[4][1]+200); cls(pulsa,'vis',t>=orari[8][1]); cls(avvA,'vis',t>=T.a1+800);
    var ri=-1; REG.forEach(function(r,ii){ if(t>=r.t) ri=ii; });
    if(modo==='righe'){ righe.forEach(function(r,ii){ cls(r.g,'vis',ii<=ri); cls(r.g,'ora',ii===ri); }); cls(luceR,'vis',ri>=0); if(ri>=0) fissa(luceR,'transform','translate(0,'+r1(righe[ri].y)+')'); }
    else if(scheda){ var r=REG[Math.max(0,ri)]; cls(scheda.g,'vis',ri>=0); cls(scheda.g,'tenue',ri>=0&&!!r.tipo);
      if(scheda.ri!==ri){ scheda.ri=ri; [[scheda.n,ri>=0?r.n:'',26],[scheda.no,ri>=0?r.nota:'',19],[scheda.f,ri>=0?r.f:'',15]].forEach(function(q){ q[0].textContent=''; q[0]._n=q[1]?avvolgi(q[0],q[1],lb[2],q[2]):0; });
        scheda.no.setAttribute('y',r1(lb[1]+22+(scheda.n._n-1)*26+22)); [].forEach.call(scheda.no.childNodes,function(c){ c.setAttribute('x',r1(lb[0])); });
        scheda.f.setAttribute('y',r1(+scheda.no.getAttribute('y')+(Math.max(1,scheda.no._n)-1)*19+(scheda.no._n?20:0))); [].forEach.call(scheda.f.childNodes,function(c){ c.setAttribute('x',r1(lb[0])); }); }
      if(scheda.tr){ var nomi=REG.slice(0,ri).map(function(q){ return q.n; }), s=''; for(var jj=nomi.length;jj>0;jj--){ var prova=(jj<nomi.length?'… ':'')+nomi.slice(nomi.length-jj).join(' · '); scrivi(scheda.tr,prova); if(largo(scheda.tr)<=lb[2]){ s=prova; break; } } scrivi(scheda.tr,s); } }
    /* B */
    var vB=t>=T.b1-500&&t<T.c1-300&&!(sopraPianta&&t>=T.s1-200); cls(gB,'vis',vB); cls(pianta,'via',t>=T.s1-200&&sopraPianta); cls(gL,'via',t>=T.s1-200);
    var av=E.io(fase(t,T.b1+300,T.b1+2600)), ra=E.io(fase(t,T.b2,T.b2+3400));
    mass.forEach(function(m,ii){ var q=Pp(m.p); fissa(m.g,'transform','translate('+xy(q)+') rotate('+ang+')'); cls(m.g,'vis',t>=T.b1+200+ii*40); cls(m.g,'rotto',t>=T.b2+200); });
    cost.forEach(function(c,ii){ var off=lerp(70,0,av)+(-40)*ra, q=Pp(piu(c.p,0,off)); fissa(c.g,'transform','translate('+xy(q)+') rotate('+ang+')'); cls(c.g,'vis',t>=T.b1+300); });
    var lm=Pp(piu(B0,mOvest?74:-70,32)), lc=Pp(piu(B0,aOvest?80:-78,90+lerp(70,0,av)-40*ra));
    fissa(tM,'x',r1(lm[0])); fissa(tM,'y',r1(lm[1]+4)); fissa(tC,'x',r1(lc[0])); fissa(tC,'y',r1(lc[1]+4));
    cls(tM,'vis',t>=T.b1+800&&t<T.b2+600); cls(tC,'vis',t>=T.b1+1200);
    cls(gSx,'vis',t>=T.b1+1800); cls(gMi,'vis',t>=T.b1+1400&&t<T.b2+400);
    fuga.forEach(function(f){ var p=fase(t,f.t0,f.t1), st=p<=0?'':p<1?'va':f.acqua?'giu':'via';
      if(p>0&&p<1){ var e=E.io(p), u=1-e, x=u*u*f.a[0]+2*u*e*f.v[0]+e*e*f.b[0], y=u*u*f.a[1]+2*u*e*f.v[1]+e*e*f.b[1]; fissa(f.c,'cx',r1(x)); fissa(f.c,'cy',r1(y)); }
      else if(p>=1){ fissa(f.c,'cx',r1(f.b[0])); fissa(f.c,'cy',r1(f.b[1])); }
      if(f.st!==st){ f.st=st; f.c.setAttribute('class','ig-m-fuggiasco '+st+(f.acqua?' acq':'')); } });
    var pm=fase(t,T.b2+600,T.b2+3600), mp=pm<.7?[lerp(mx[0],mxV[0],E.io(pm/.7)),lerp(mx[1],mxV[1],E.io(pm/.7))]:[lerp(mxV[0],mxF[0],E.io((pm-.7)/.3)),lerp(mxV[1],mxF[1],E.io((pm-.7)/.3))];
    fissa(gMx,'transform','translate('+xy(mp)+')'); cls(gMx,'vis',t>=T.b1+900); cls(tMx,'via',t<T.b2+200); cls(gMx,'annega',pm>=1); scrivi(tMx,pm>=1?'Massenzio annega':'Massenzio');
    cls(onda,'vis',pm>=1&&t<T.s1); citaz.forEach(function(c,ii){ cls(c.g,'vis',t>=c.t&&(!una||ii===citaz.length-1||t<citaz[ii+1].t)); });
    /* il segno */
    cls(gS,'vis',t>=T.s1&&t<T.c1-300);
    cls(kL.g,'vis',t>=T.s1); kL.linee.forEach(function(p,ii){ traccia(p,E.io(fase(t,T.s1+900+ii*700,T.s1+1700+ii*700))); });
    kL.passi.forEach(function(p,ii){ cls(p,'vis',t>=T.s1+600+ii*2600); }); if(kL.nota) cls(kL.nota,'vis',t>=T.s1+3200);
    cls(kE.g,'vis',t>=T.s2); cls(kE.croce,'vis',t>=T.s2+900); cls(kE.scritta,'vis',t>=T.s2+1900); kE.passi.forEach(function(p,ii){ cls(p,'vis',t>=T.s2+700+ii*3000); }); if(kE.nota) cls(kE.nota,'vis',t>=T.s2+4200);
    cls(kL.g,'pieno',t<T.s2); cls(kE.g,'pieno',t>=T.s2);
    /* C */
    cls(gC,'vis',t>=T.c1-300&&t<T.d1-300); cls(P1.g,'vis',t>=T.c1-300); cls(P2.g,'vis',t>=T.c2-300); cls(P3.g,'vis',t>=T.c3-300);
    cls(P1.g,'ora',t<T.c2); cls(P2.g,'ora',t>=T.c2&&t<T.c3); cls(P3.g,'ora',t>=T.c3);
    var ft=fase(t,T.c1+1400,T.c1+2400), e1=E.io(ft); fissa(L1.pezzo,'transform',ft>0?'translate(0,'+r1(e1*(f1.yw-f1.yd+6))+') rotate('+r1(e1*24)+' '+r1(m1)+' '+r1(f1.yd)+')':''); cls(L1.pezzo,'giu',ft>=1);
    cls(L1.spruzzo,'vis',ft>=.95&&t<T.c1+3400);
    U1.forEach(function(u){ var c=((t-T.c1)/2600+u.d)%1, run=t>=T.c1+300, x=lerp(f1.xa-hu,m1-g1,c), y=f1.yd-th, cade=ft>=1&&x>m1-g1-hu*.8;
      if(ft>=1 && c>0.7){ var k2=(c-0.7)/0.3; x=m1-g1+k2*g1; y=f1.yd-th+E.out(k2)*(f1.yw-f1.yd+hu); }
      fissa(u.o,'transform','translate('+r1(x)+','+r1(y)+')'+(ft>=1&&c>0.7?' rotate('+r1((c-.7)*300)+')':'')); cls(u.o,'vis',run&&t<T.d1); cls(u.o,'giu',ft>=1&&c>0.92); });
    var tb2=(t-T.c2)/1000; L2.barche.forEach(function(b){ fissa(b.g,'transform','translate('+r1(b.x)+','+r1(yb2+Math.sin(tb2*2.2+b.f)*1.2)+')'); });
    fissa(L2.piano,'transform','translate(0,'+r1(Math.sin(tb2*2.2)*0.6)+')');
    U2.forEach(function(u){ var c=((t-T.c2)/3000+u.d)%1; fissa(u.o,'transform','translate('+r1(lerp(f2.xa-hu,f2.xb+hu,c))+','+r1(f2.yd-th)+')'); cls(u.o,'vis',t>=T.c2+300&&t<T.d1); });
    var fz=fase(t,T.c3+700,T.c3+1300), fo=fase(t,T.c3+1500,T.c3+2300), fc=E.io(fase(t,T.c3+2400,T.c3+3200));
    cls(L3.alone,'vis',fz>0&&fo<1); L3.chiodi.forEach(function(c,ii){ fissa(c,'transform',fo>0?'translate('+r1((ii?1:-1)*fo*th*2)+','+r1(-E.out(fo)*f3.h*0.3)+')':''); cls(c,'via',fo>=1); });
    fissa(L3.sx,'transform',fc>0?'rotate('+r1(fc*32)+' '+r1(f3.xa)+' '+r1(f3.yd)+')':''); fissa(L3.dx,'transform',fc>0?'rotate('+r1(-fc*32)+' '+r1(f3.xb)+' '+r1(f3.yd)+')':''); cls(L3.spruzzo,'vis',fc>=.95&&t<T.c3+4200);
    U3.forEach(function(u,ii){ var c=((t-T.c3)/2800+u.d)%1, x=lerp(f3.xa-hu,f3.xb+hu,c), y=f3.yd-th; if(fc>0){ var dx=x-m3, sl=Math.tan(fc*32*Math.PI/180); y+=Math.max(0,dx<0?(x-f3.xa):(f3.xb-x))*sl; if(fc>=1&&Math.abs(dx)<(f3.xb-f3.xa)*0.3) y=lerp(y,f3.yw+hu*0.6,clamp((t-T.c3-3200)/600,0,1)); }
      fissa(u.o,'transform','translate('+r1(x)+','+r1(y)+')'); cls(u.o,'vis',t>=T.c3+300&&t<T.d1); cls(u.o,'giu',fc>=1&&Math.abs(x-m3)<(f3.xb-f3.xa)*0.3&&t>T.c3+3600); });
    /* D */
    cls(gD,'vis',t>=T.d1-300);
    var zi=E.io(fase(t,T.d1+1700,T.d1+2900))*(1-E.io(fase(t,T.d1+4800,T.d1+6000))), zs=1+zi*(oriz?1.9:1.6);
    fissa(az,'transform',zi>0.001?'translate('+xy(lente)+') scale('+Math.round(zs*1000)/1000+') translate('+r1(-lente[0])+','+r1(-lente[1])+')':'');
    if(fotoA){ cls(fotoG,'vis',t>=T.d1);
      var z1=E.io(fase(t,T.d1+1600,T.d1+3200)), xf=E.io(fase(t,T.d1+3000,T.d1+3900)), fv=E.io(fase(t,T.d1+3900,T.d1+4600)), fl2=E.io(fase(t,T.d1+4200,T.d1+5200)), z2=E.io(fase(t,T.d1+5400,T.d1+6900));
      if(!ok.a){ z1=1; xf=1; } if(!ok.i){ xf=0; fv=0; fl2=0; z2=0; }
      PF.forEach(function(P,ii){ var K, x=xf, v=fv, f=fl2;
        if(PF.length>1){ K=ii?P.K1:P.K0; x=ii?(ok.i?1:0):0; v=x; f=x; if(!ok.a&&!ii) K=P.K1; } else K=z2>0?mezzo(P.K1,P.K2,z2):mezzo(P.K0,P.K1,z1);
        P.metti(K); fissa(P.vic,'opacity',r1(x*100)/100); fissa(P.velo,'opacity',r1(v*100)/100); fissa(P.banda,'opacity',r1(f*100)/100); traccia(P.bandaL,f); cls(P.bandaL,'luce',f>=1); });
      didascalia(PF.length>1&&ok.a&&ok.i?CAP.due:(xf>=.5?CAP.i:CAP.a)); }
    cls(arcoG,'vis',t>=T.d1); cls(tI,'vis',t>=T.d1+2600); cls(isc,'luce',t>=T.d1+2600); righeI.forEach(function(r,ii){ cls(r,'vis',t>=T.d1+1400+ii*120); });
    cls(gT,'vis',t>=T.d1+5200); cls(tsc,'vis',t>=T.d1+800);
  };
  S.dura=T.fin;
  var bt=[T.a1,T.a2,T.a3,T.a4,T.b1,T.b2,T.s1,T.s2,T.c1,T.c2,T.c3,T.d1];
  S.battute=MILVIO.fasi.map(function(f,ii){ return {t:bt[ii],anno:f[0],testo:f[1]}; });
}

/* ---------- fotogrammi dalla città in 3D (infografiche 9 e 10) ----------
   La scena di Roma (js/base.js) viene portata a un anno con RM_pagina.anno(), inquadrata da una posa fissa e disegnata una volta su una tela delle misure del riquadro;
   il fotogramma si prende con toDataURL subito dopo il disegno. Poi anno, camera, misure della tela e della passata degli effetti tornano come erano. Un fotogramma per volta,
   con una pausa fra l'uno e l'altro, perché la pagina non si blocchi; si conservano in CACHE3D (chiave, anno, misure). Senza 3D, o se qualcosa non va, resta il disegno vettoriale. */
var CACHE3D={}, scattiTok=0;
function citta3D(){ var R=window.RM; return R&&!R.guasto&&R.renderer&&R.scene&&R.camera&&R.controlli&&window.THREE&&window.RM_pagina&&RM_pagina.anno&&RM_pagina.annoOra?R:null; }
function scatta(anno,posa,w,h,punti){
  var R=citta3D(); if(!R) return null;
  var Rd=R.renderer, C=R.camera, K=R.controlli, P=R.post, sz=new THREE.Vector2(), pr=Rd.getPixelRatio(), a0=RM_pagina.annoOra(), cp=C.position.clone(), cq=C.quaternion.clone(), ct=K.target.clone(), asp=C.aspect;
  var vw=C.view&&C.view.enabled?[C.view.fullWidth,C.view.fullHeight,C.view.offsetX,C.view.offsetY,C.view.width,C.view.height]:null, sf=P?P.mat.uniforms.sfoca.value:null, url=null, out={};
  Rd.getSize(sz);
  try{
    RM_pagina.anno(anno);
    Rd.setPixelRatio(1); Rd.setSize(w,h,false); C.aspect=w/h; C.clearViewOffset(); C.position.set(posa.c[0],posa.c[1],posa.c[2]); C.lookAt(posa.t[0],posa.t[1],posa.t[2]); C.updateProjectionMatrix(); C.updateMatrixWorld(true);
    Rd.shadowMap.needsUpdate=true;
    if(P&&P.attivo){ P.misura(w,h); P.mat.uniforms.sfoca.value=0; P.disegna(R.scene,C); }
    else Rd.render(R.scene,C);
    url=Rd.domElement.toDataURL('image/jpeg',.88);
    (punti||[]).forEach(function(q){ var v=new THREE.Vector3(q[1],q[2],q[3]).project(C); out[q[0]]=[(v.x+1)/2,(1-v.y)/2]; });
  }catch(e){ url=null; }
  try{ RM_pagina.anno(a0); }catch(e){}
  Rd.setPixelRatio(pr); Rd.setSize(sz.x,sz.y,false); C.aspect=asp; C.position.copy(cp); C.quaternion.copy(cq); K.target.copy(ct); if(vw) C.setViewOffset.apply(C,vw); C.updateProjectionMatrix();
  if(P){ var W2=Math.max(2,Math.floor(sz.x*pr)), H2=Math.max(2,Math.floor(sz.y*pr)); P.misura(W2,H2); if(sf!=null) P.mat.uniforms.sfoca.value=sf; }
  Rd.shadowMap.needsUpdate=true;
  return url&&url.length>2000?{url:url,p:out}:null;
}
/* scatta in sequenza gli anni di «anni» (un numero, o {a: anno, posa: posa propria}); pronto(i, fotogramma) per ognuno riuscito. Un nuovo giro (o la chiusura della finestra) ferma quello vecchio. */
function fotogrammi(chiave,anni,posa,w,h,punti,pronto){
  var tok=++scattiTok, i=0, dpr=Math.min(2,window.devicePixelRatio||1), f=Math.min(dpr,Math.sqrt(1800000/Math.max(1,w*h))), pw=Math.max(64,Math.round(w*f)), ph=Math.max(64,Math.round(h*f));
  if(!citta3D()) return false;
  (function uno(){ if(tok!==scattiTok||!dlg||i>=anni.length) return; var q=anni[i], a=q.a!=null?q.a:q, po=q.posa||posa, k=chiave+'|'+a+'|'+po.c.join(',')+'|'+pw+'x'+ph, r=CACHE3D[k]||(CACHE3D[k]=scatta(a,po,pw,ph,q.punti||punti)), j=i++;
    if(r) pronto(j,r); setTimeout(uno,70); })();
  return true;
}
/* un fumetto su una foto: punto, linea e cartellino; dove = frazioni [x,y] del riquadro b */
function fumetto(p,b,testo,lato){
  var g=el('g',{'class':'ig-fum'},p), ln=el('path',{'class':'ig-fum-linea'},g), pt=el('circle',{r:3.6,'class':'ig-fum-punto'},g), bx=el('g',null,g), fo=el('rect',{rx:6,'class':'ig-fum-fondo'},bx), t=tx(bx,9,15,'ig-fum-t',testo);
  var w=largo(t)+18, h=22; fo.setAttribute('width',r1(w)); fo.setAttribute('height',h);
  g.metti=function(q){ var x=b[0]+q[0]*b[2], y=b[1]+q[1]*b[3], dx=lato==='sx'?-1:1, X=x+dx*34-(dx<0?w:0), Y=y-38; X=clamp(X,b[0]+6,b[0]+b[2]-w-6); Y=clamp(Y,b[1]+6,b[1]+b[3]-h-6);
    pt.setAttribute('cx',r1(x)); pt.setAttribute('cy',r1(y)); bx.setAttribute('transform','translate('+r1(X)+','+r1(Y)+')'); var ax=clamp(x,X,X+w), ay=Y+h; if(Math.abs(ax-x)<2&&ay>y) ay=Y; ln.setAttribute('d','M'+r1(x)+' '+r1(y)+' L'+r1(ax)+' '+r1(ay)); };
  return g;
}

/* ======================================================================
   9. Il Pantheon nel tempo
   Aggiunta il 23 novembre 2026. I fotogrammi sono la città in 3D di questa pagina, presa da una posa fissa a nord-ovest negli anni 130, 370, 400, 609, 663, 740 e 852;
   finché non sono pronti (o senza 3D) c'è l'alzato vettoriale. Fatti: scheda pantheon in js/dati.js (Adriano, il 126, l'ingresso a nord, le sedici colonne, le leggi lette nel 368 o 370,
   il silenzio delle fonti fino al 609, la chiusura scelta nel modello per il 392, il dono di Foca e la consacrazione del 13 maggio 609, Costante II nel 663, il piombo di Gregorio III
   tra il 731 e il 741), CERTEZZA (si conserva per intero), le voci delle tappe 609 e 663 (Liber Pontificalis, vite di Bonifacio IV e di Vitaliano); misure e coperture dai commenti
   del monumento pantheon in js/monumenti.js (Platner e Ashby: tamburo di 56 m, 43,2 dentro, alto circa 31; occhio di 9 m; pronao di 34 x 13,6 m; otto colonne grigie in fronte e quattro rosa
   in ciascuna delle due file dietro; colonne di 14,15 m secondo Ziolkowski; tegole di bronzo, «tegulis aereis», dorate secondo Cinti: un'ipotesi; «chartis plumbeis», LP XCII 12).
   Schemi: la pianta (le file interne dietro la prima, la terza, la sesta e l'ottava colonna sono indicative, come nel modello), l'alzato, la croce sul frontone (indicativa nel modello). */
/* un cursore «prima e dopo» vero, sopra due fotogrammi affiancati: si trascina col dito e col mouse (pointer events con cattura; sul telefono un gesto in verticale
   fa ancora scorrere la finestra, la maniglia no), si muove con le frecce, Inizio e Fine; chi lo prende mette in pausa l'animazione, che da lì non lo muove più
   (24 novembre 2026, l'utente: «rendi interattiva questa parte»). fb è il riquadro delle foto in pixel del palco; cambia(f) ridisegna con la lama a f (da 0 a 1) */
function cursorePD(S,fb,etichetta,testo,cambia){
  var d=S.strato('ig-pd'); d.style.left=fb[0]+'px'; d.style.top=fb[1]+'px'; d.style.width=fb[2]+'px'; d.style.height=fb[3]+'px';
  var m=h('div','ig-pd-maniglia',null,d); m.tabIndex=0; m.setAttribute('role','slider'); m.setAttribute('aria-label',etichetta); m.setAttribute('aria-valuemin','0'); m.setAttribute('aria-valuemax','100'); m.setAttribute('aria-orientation','horizontal');
  var o={f:.5,mano:false,vivo:false}, preso=null, x0=0, attivo=false;
  function metti(f,daMano){ f=clamp(f,0,1); o.f=f; m.style.left=(f*100).toFixed(2)+'%'; var v=Math.round(f*100); if(m._v!==v){ m._v=v; m.setAttribute('aria-valuenow',v); m.setAttribute('aria-valuetext',testo(f)); }
    if(daMano){ if(!o.mano){ o.mano=true; if(S.ferma) S.ferma(); } cambia(f); } }
  function qui(e){ var r=d.getBoundingClientRect(); return (e.clientX-r.left)/(r.width||1); }
  d.addEventListener('pointerdown',function(e){ if(!o.vivo||preso!=null) return; preso=e.pointerId; x0=e.clientX; attivo=e.pointerType==='mouse'||e.target===m; try{ d.setPointerCapture(e.pointerId); }catch(x){}
    if(attivo){ metti(qui(e),true); e.preventDefault(); } });
  d.addEventListener('pointermove',function(e){ if(preso!==e.pointerId) return; if(!attivo&&Math.abs(e.clientX-x0)>6) attivo=true; if(attivo){ metti(qui(e),true); e.preventDefault(); } });
  function lascia(e,tocco){ if(preso!==e.pointerId) return; if(tocco&&!attivo) metti(qui(e),true); preso=null; attivo=false; try{ d.releasePointerCapture(e.pointerId); }catch(x){} if(tocco) try{ m.focus({preventScroll:true}); }catch(x){} }
  d.addEventListener('pointerup',function(e){ lascia(e,true); }); d.addEventListener('pointercancel',function(e){ lascia(e,false); });      // un tocco senza trascinare porta lì la lama
  m.addEventListener('keydown',function(e){ var k=e.key, p=k==='ArrowLeft'||k==='ArrowDown'?-.05:k==='ArrowRight'||k==='ArrowUp'?.05:k==='PageDown'?-.2:k==='PageUp'?.2:k==='Home'?-1:k==='End'?1:0;
    if(!p) return; e.preventDefault(); e.stopPropagation(); metti(o.f+p,true); });      // le frecce non arrivano alla finestra (che cambierebbe momento) né alla pagina
  o.metti=function(f){ metti(f,false); }; o.mostra=function(v){ v=!!v; if(o.vivo===v) return; o.vivo=v; cls(d,'vis',v); if(!v&&document.activeElement===m) try{ m.blur(); }catch(x){} }; o.libera=function(){ o.mano=false; };
  return o; }
var PANTHEON={ titolo:"Il Pantheon nel tempo", sotto:"Tempio, chiesa, tetto di piombo: perché è arrivato intero fino a noi",
  fasi:[["126","Ricostruito da Adriano e dedicato a tutti gli dèi, il Pantheon è completato nel 126. L'ingresso è a nord."],
    ["126","La sala rotonda misura 56 metri di diametro; in cima alla cupola si apre un occhio di 9 metri. Davanti, un portico di sedici colonne di granito: otto grigie in facciata, otto rosa dietro."],
    ["126","La cupola è coperta di tegole di bronzo. Che fossero dorate è un'ipotesi."],
    ["368 o 370","Nel Pantheon si leggono ancora pubblicamente le leggi imperiali. Poi le fonti non lo nominano più fino al 609."],
    ["392","Non sappiamo quando finì il culto pagano. Nel modello della città il tempio si chiude nel 392, l'anno dei divieti imperiali."],
    ["609","Il 13 maggio papa Bonifacio IV consacra il tempio, donato dall'imperatore Foca, come chiesa di Santa Maria ad Martyres. Per questo è arrivato intero fino a noi."],
    ["663","In luglio l'imperatore Costante II, in dodici giorni a Roma, fa togliere le tegole di bronzo e le spedisce verso Costantinopoli."],
    ["731-741","Papa Gregorio III lo ricopre di lastre di piombo."],
    ["Oggi","L'edificio si conserva per intero."]],
  fonte:"Scheda del Pantheon, tappe del 609 e del 663 e voci del Liber Pontificalis (vite di Bonifacio IV, Vitaliano e Gregorio III: «tegulis aereis», «chartis plumbeis») in questa pagina; misure, e l'iscrizione di Agrippa sul fregio del portico (CIL VI 896), da Platner e Ashby; l'altezza delle colonne da Ziolkowski. Le fotografie sono fotogrammi della città in 3D di questa pagina negli anni indicati: una ricostruzione con le sue ipotesi (la chiusura nel 392 è una scelta del modello, la croce sul frontone è indicativa, che le tegole fossero dorate è un'ipotesi). La pianta e l'alzato sono schemi; la posizione delle file interne di colonne è indicativa." };
var TETTI={ bronzo:['#E3C27A','#B58A3C','#7C5A22'], senza:['#DCD3C3','#C3B8A4','#9E927C'], piombo:['#B9C0C6','#8E979F','#5F6870'] };
/* l'alzato da nord, in metri (dal modello e da Platner): tamburo di 56 m alto 30,5, sette gradoni, calotta fino a circa 45,6; avancorpo; pronao con otto colonne alte 14,15 su un podio di 1,3 */
function alzato(p,b,id,defs){
  var s=Math.min(b[2]/64,b[3]/49), x0=b[0]+b[2]/2, y0=b[1]+b[3]-(b[3]-46.5*s)/2, g=el('g',{'class':'ig-alz'},p), M=function(x,y){ return [x0+x*s,y0-y*s]; };
  function R(x1,y1,x2,y2,cl,f){ var a=M(x1,y2), c=M(x2,y1); var r=el('rect',{x:r1(a[0]),y:r1(a[1]),width:r1(c[0]-a[0]),height:r1(c[1]-a[1]),'class':cl},g); if(f) r.setAttribute('fill',f); return r; }
  var gt=el('linearGradient',{id:id,x1:0,y1:0,x2:1,y2:0},defs), st=[el('stop',{offset:0},gt),el('stop',{offset:.45},gt),el('stop',{offset:1},gt)], o={g:g,tetto:[]};
  o.colora=function(k){ var c=TETTI[k]; st.forEach(function(q,i){ fissa(q,'stop-color',c[i]); }); };
  el('line',{x1:r1(b[0]),x2:r1(b[0]+b[2]),y1:r1(y0),y2:r1(y0),'class':'ig-alz-suolo'},g);
  R(-28,0,28,30.5,'ig-alz-muro'); [12.2,22,30.2].forEach(function(y){ R(-28.7,y,28.7,y+.9,'ig-alz-cornice'); });
  for(var q=0;q<7;q++){ var hw=27.4-q*.75; o.tetto.push(R(-hw,30.5+q*.8,hw,31.4+q*.8,q?'ig-alz-tetto':'ig-alz-marmo',q?'url(#'+id+')':null)); }
  var a=M(-22.4,36), c=M(22.4,36), top=M(0,45.6); o.tetto.push(el('path',{d:'M'+xy(a)+' Q'+r1(a[0]+(c[0]-a[0])*.06)+' '+r1(top[1])+' '+r1(top[0])+' '+r1(top[1])+' Q'+r1(c[0]-(c[0]-a[0])*.06)+' '+r1(top[1])+' '+xy(c)+' Z',fill:'url(#'+id+')','class':'ig-alz-cupola'},g));
  R(-17.2,0,17.2,24.5,'ig-alz-muro'); R(-17.6,23.6,17.6,24.5,'ig-alz-cornice');
  var p1=M(-17.6,24.5), p2=M(17.6,24.5), p3=M(0,30); el('path',{d:'M'+xy(p1)+' L'+xy(p3)+' L'+xy(p2)+' Z','class':'ig-alz-frontone'},g);
  R(-3.1,1.3,3.1,12.8,'ig-alz-porta'); R(-17,0,17,1.3,'ig-alz-podio');
  for(var k=0;k<8;k++){ var cx=-16.4+k*4.686; R(cx-.74,1.3,cx+.74,15.45,'ig-alz-colonna'); R(cx-1.05,14.6,cx+1.05,15.45,'ig-alz-capitello'); R(cx-1.05,1.3,cx+1.05,1.9,'ig-alz-capitello'); }
  R(-17.3,15.45,17.3,17.45,'ig-alz-trabeazione'); R(-8.5,16.1,8.5,16.8,'ig-alz-iscr');
  var f1=M(-17.6,17.45), f2=M(17.6,17.45), f3=M(0,24.25); el('path',{d:'M'+xy(f1)+' L'+xy(f3)+' L'+xy(f2)+' Z','class':'ig-alz-frontone'},g);
  var cr=M(0,24.25); o.croce=el('path',{d:'M'+r1(cr[0])+' '+r1(cr[1])+' v'+r1(-5*s)+' M'+r1(cr[0]-1.4*s)+' '+r1(cr[1]-3.6*s)+' h'+r1(2.8*s),'class':'ig-alz-croce'},g);
  o.velo=R(-30,0,30,46,'ig-alz-velo');
  o.punti={cupola:[(top[0]-b[0])/b[2],(top[1]+3*s-b[1])/b[3]],croce:[(cr[0]-b[0])/b[2],(cr[1]-4*s-b[1])/b[3]],portico:[(M(-9,8)[0]-b[0])/b[2],(M(-9,8)[1]-b[1])/b[3]],rotonda:[(M(-24,20)[0]-b[0])/b[2],(M(-24,20)[1]-b[1])/b[3]]};
  o.colora('bronzo'); return o;
}
function disegnaPantheon(svg,S,W,H){
  var oriz=W/H>=1.15, pad=oriz?18:12, defs=el('defs',null,svg), fasi=PANTHEON.fasi;
  var T=[1400,4600,8600,13200,17600,22000,27600,32600,37000], tFin=T[8]+5200;
  /* le misure */
  var fb, rb, cb, rib=oriz?58:62;
  if(oriz){ var fw=Math.round(W*(W<700?0.62:0.64)); fb=[pad,pad,fw,H-2*pad-rib-10]; rb=[pad,H-pad-rib,fw,rib]; cb=[pad+fw+24,pad+4,W-(pad+fw+24)-pad,H-2*pad-4]; }
  else { var fh=Math.round(Math.min(H*0.44,(W-2*pad)*0.66)); fb=[pad,pad,W-2*pad,fh]; rb=[pad,H-rib-2,W-2*pad,rib]; cb=[pad,fb[1]+fh+12,W-2*pad,rb[1]-(fb[1]+fh+12)-6]; }
  var clip=el('clipPath',{id:'ig-p-clip'},defs); el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12},clip);
  var foto=el('g',{'class':'ig-p-foto'},svg); el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12,'class':'ig-p-foto-fondo'},foto);
  var dentro=el('g',{'clip-path':'url(#ig-p-clip)'},foto);
  /* l'alzato vettoriale: c'è sempre sotto le fotografie (si vede finché non sono pronte, o se non ci sono) */
  var alz=alzato(dentro,[fb[0]+fb[2]*0.08,fb[1]+fb[3]*0.1,fb[2]*0.84,fb[3]*0.84],'ig-p-tetto',defs), alzEt=tx(dentro,fb[0]+fb[2]-12,fb[1]+fb[3]-12,'ig-p-dida','alzato da nord: schema','end');
  /* le fotografie */
  var ANNI=[130,370,400,609.5,663,740,852], ETI=['130','370','400','609','663','740','852'], quale=[0,0,0,1,2,3,4,5,6];
  var imm=ANNI.map(function(){ var im=el('image',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],preserveAspectRatio:'xMidYMid slice','class':'ig-p-img'},dentro); return {im:im,ok:false}; });
  var punti={}, haFoto=false, didaF=el('g',{'class':'ig-p-dida-f'},foto), didaR=el('rect',{x:fb[0]+10,y:fb[1]+fb[3]-30,height:20,rx:10,'class':'ig-p-dida-fondo'},didaF), didaT=tx(didaF,fb[0]+20,fb[1]+fb[3]-16,'ig-p-dida-t','');
  var posa={t:[-69.6,4.1,-69.4],c:[-76.6,8.4,-82.2]};
  fotogrammi('pantheon',ANNI,posa,Math.round(fb[2]),Math.round(fb[3]),[['cupola',-70,6.2,-68],['croce',-70,4.8,-73.2],['portico',-71.2,3,-73.3],['rotonda',-72.6,3.6,-67]],function(i,r){
    href(imm[i].im,r.url); imm[i].ok=true; haFoto=true; if(r.p) punti=r.p; if(ultimoT!=null) S.passo(ultimoT); });      // anche a animazione ferma (pausa, «Riduci movimento») la foto pronta si vede subito
  /* la pianta: il primo quadro */
  var gP=el('g',{'class':'ig-p-pianta'},svg), pk=Math.min(fb[2]/(oriz?132:112),(fb[3]-26)/100), pc=[fb[0]+fb[2]*(oriz?0.34:0.5),fb[1]+14+60*pk];
  function PP(x,y){ return [pc[0]+x*pk,pc[1]+y*pk]; }
  el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12,'class':'ig-p-carta'},gP);
  var pr=PP(-22.5,27.5), pr2=PP(22.5,46.5); el('rect',{x:r1(pr[0]),y:r1(pr[1]),width:r1(pr2[0]-pr[0]),height:r1(pr2[1]-pr[1]),'class':'ig-p-nettuno'},gP);
  var lin=[];
  function linea(d,cl){ var p=el('path',{d:d,'class':cl||'ig-p-tratto'},gP); scopri(p); lin.push(p); return p; }
  var c0=PP(0,0);
  linea('M'+r1(c0[0])+' '+r1(c0[1]-28*pk)+' a'+r1(28*pk)+' '+r1(28*pk)+' 0 1 1 -0.01 0 Z');
  linea('M'+r1(c0[0])+' '+r1(c0[1]-21.6*pk)+' a'+r1(21.6*pk)+' '+r1(21.6*pk)+' 0 1 1 -0.01 0 Z','ig-p-tratto sottile');
  var av1=PP(-17.2,-36.25), av2=PP(17.2,-23.75); linea('M'+xy(av1)+' H'+r1(av2[0])+' V'+r1(av2[1])+' H'+r1(av1[0])+' Z');
  var pn1=PP(-17,-49.85), pn2=PP(17,-36.25); linea('M'+xy([pn1[0],pn2[1]])+' V'+r1(pn1[1])+' H'+r1(pn2[0])+' V'+r1(pn2[1]),'ig-p-tratto sottile');
  var occ=el('circle',{cx:r1(c0[0]),cy:r1(c0[1]),r:r1(4.5*pk),'class':'ig-p-occhio'},gP);
  var colonne=[]; for(var k=0;k<8;k++){ var q=PP(-16.4+k*4.686,-49); colonne.push(el('circle',{cx:r1(q[0]),cy:r1(q[1]),r:r1(Math.max(2,.9*pk)),'class':'ig-p-col grigia'},gP)); }
  [-44.2,-39.4].forEach(function(y){ [-16.4,-7,7,16.4].forEach(function(x){ var q=PP(x,y); colonne.push(el('circle',{cx:r1(q[0]),cy:r1(q[1]),r:r1(Math.max(2,.9*pk)),'class':'ig-p-col rosa'},gP)); }); });
  /* le quote */
  function quota(x1,y1,x2,y2,testo,sotto){ var g=el('g',{'class':'ig-p-quota'},gP), a=PP(x1,y1), b=PP(x2,y2); el('path',{d:'M'+xy(a)+' L'+xy(b)+' M'+r1(a[0])+' '+r1(a[1]-4)+' v8 M'+r1(b[0])+' '+r1(b[1]-4)+' v8'},g);
    tx(g,(a[0]+b[0])/2,(a[1]+b[1])/2+(sotto?15:-6),'ig-p-quota-t',testo,'middle'); return g; }
  var q56=quota(-28,36,28,36,'56 m',true), q34=quota(-17,-55,17,-55,'34 m');
  var qOcc=el('g',{'class':'ig-p-quota'},gP), qo=PP(4.5,0); el('path',{d:'M'+xy(qo)+' l'+r1(26)+' '+r1(-14)},qOcc); tx(qOcc,qo[0]+30,qo[1]-16,'ig-p-quota-t',"occhio di 9 m",'start');
  var nord=el('g',{'class':'ig-p-quota',transform:'translate('+r1(PP(23,-44)[0])+','+r1(PP(23,-44)[1])+')'},gP); el('path',{d:'M0 -7 L5 4 L0 1 L-5 4 Z','class':'ig-p-nord'},nord); tx(nord,9,3,'ig-p-quota-t','ingresso a nord','start');
  var lN=tx(gP,pr[0]+(pr2[0]-pr[0])/2,pr2[1]-7,'ig-p-nettuno-t','basilica di Nettuno','middle'); if(pr2[1]>fb[1]+fb[3]-4) lN.remove();
  /* la legenda della pianta, accanto */
  var lx=oriz?fb[0]+fb[2]*0.68:fb[0]+12, ly=oriz?fb[1]+fb[3]*0.3:fb[1]+fb[3]-50, gLeg=el('g',{'class':'ig-p-pleg'},gP);
  if(oriz){ tx(gLeg,lx,ly,'ig-p-pleg-tit','PIANTA'); tx(gLeg,lx,ly+18,'ig-p-pleg-sot','schema, misure di Platner e Ashby');
    [['grigia','8 colonne di granito grigio'],['rosa','8 di granito rosa']].forEach(function(v,i){ el('circle',{cx:lx+5,cy:ly+44+i*20,r:4.5,'class':'ig-p-col '+v[0]},gLeg); tx(gLeg,lx+16,ly+48+i*20,'ig-p-pleg-t',v[1]); });
    var ln2=tx(gLeg,lx,ly+96,'ig-p-pleg-sot','le file interne: indicative'); }
  else { [['grigia','8 grigie'],['rosa','8 rosa']].forEach(function(v,i){ el('circle',{cx:lx+5,cy:ly+i*18,r:4,'class':'ig-p-col '+v[0]},gLeg); tx(gLeg,lx+14,ly+4+i*18,'ig-p-pleg-t',v[1]); }); tx(gLeg,lx,ly+38,'ig-p-pleg-sot','pianta: schema'); }
  /* i fumetti sulle fotografie */
  var fum={cupola:fumetto(svg,fb,'tegole di bronzo','dx'),croce:fumetto(svg,fb,'una croce (indicativa)','dx'),portico:fumetto(svg,fb,'sedici colonne','sx'),rotonda:fumetto(svg,fb,'56 m di diametro','sx'),
    chiuso:fumetto(svg,fb,'chiuso: data scelta dal modello','sx'),via:fumetto(svg,fb,'via le tegole','dx'),piombo:fumetto(svg,fb,'lastre di piombo','dx')};
  /* il nastro del tempo: uso e copertura */
  var rx0=rb[0]+(oriz?78:66), rx1=rb[0]+rb[2]-6, A0=100, A1=800, X=function(a){ return rx0+(a-A0)/(A1-A0)*(rx1-rx0); }, gR=el('g',{'class':'ig-p-nastro'},svg), rh=13;
  var y1=rb[1]+8, y2=y1+rh+6;
  tx(gR,rb[0],y1+rh-2.5,'ig-p-n-et','USO'); tx(gR,rb[0],y2+rh-2.5,'ig-p-n-et','COPERTURA');
  var pt=el('pattern',{id:'ig-p-trat',width:6,height:6,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs); el('rect',{width:6,height:6,fill:'#F2ECE0'},pt); el('rect',{width:2.2,height:6,fill:'#CDBFA6'},pt);
  var bande=[[y1,126,392,'tempio','ig-p-b tempio'],[y1,392,609,'chiuso','ig-p-b chiuso'],[y1,609,800,'chiesa','ig-p-b chiesa'],[y2,126,663,'bronzo','ig-p-b bronzo'],[y2,663,736,'senza','ig-p-b senza'],[y2,736,800,'piombo','ig-p-b piombo']].map(function(q){
    var g=el('g',{'class':q[4]},gR); el('rect',{x:r1(X(q[1])),y:r1(q[0]),width:r1(X(q[2])-X(q[1])-1),height:rh,rx:2},g); var t=tx(g,X(q[1])+5,q[0]+rh-3,'ig-p-b-t',q[3]); if(largo(t)>X(q[2])-X(q[1])-8) t.remove(); return g; });
  var cpR=el('clipPath',{id:'ig-p-cn'},defs), cpRr=el('rect',{x:r1(rx0-2),y:r1(y1-8),width:0,height:r1(rh*2+20)},cpR); bande.forEach(function(g){ g.setAttribute('clip-path','url(#ig-p-cn)'); });
  var silenzio=el('g',{'class':'ig-p-silenzio','clip-path':'url(#ig-p-cn)'},gR); el('rect',{x:r1(X(370)),y:r1(y1-3),width:r1(X(609)-X(370)),height:rh+6,fill:'url(#ig-p-trat)',rx:2},silenzio); var tS=tx(silenzio,X(489),y1+rh-3,'ig-p-sil-t','le fonti tacciono','middle'); if(largo(tS)>X(609)-X(370)-6) tS.textContent='silenzio';
  var tick=[126,392,609,663,736], tl=['126','392','609','663','731-741'];
  tick.forEach(function(a,i){ var an=i===2?'end':i===3?'start':i===4?'end':'middle', t=tx(gR,X(a)+(i===2?3:i===3?-3:0),y2+rh+14,'ig-p-n-anno',tl[i],an); if(i===4){ t.setAttribute('x',r1(Math.min(X(a)+24,rx1))); if(rx1-rx0<380){ t.setAttribute('y',r1(y1-9)); t.setAttribute('x',r1(rx1)); } } });
  var cur=el('g',{'class':'ig-p-cur'},gR); el('line',{x1:0,x2:0,y1:r1(y1-6),y2:r1(y2+rh+3),'class':'ig-p-cur-l'},cur); el('circle',{cx:0,cy:r1(y1-6),r:4,'class':'ig-p-cur-p'},cur);
  /* la colonna di destra (o sotto): l'anno, lo stato, le parole della fonte */
  var gC=el('g',{'class':'ig-p-col-d'},svg), stretta=cb[2]<230, fsA=oriz?Math.min(64,cb[2]/4.2):Math.min(36,W/10);
  var tA=tx(gC,cb[0],cb[1]+fsA*.82,'ig-p-anno',''); tA.style.fontSize=r1(fsA)+'px';
  var tStato=el('text',{x:r1(cb[0]),y:r1(cb[1]+fsA*.82+24),'class':'ig-p-stato'},gC);
  var STATI=['IL TEMPIO DI TUTTI GLI DÈI','IL TEMPIO DI TUTTI GLI DÈI','TEGOLE DI BRONZO','LE FONTI TACCIONO','TEMPIO CHIUSO','SANTA MARIA AD MARTYRES','VIA IL BRONZO','IL TETTO DI PIOMBO','INTERO FINO A NOI'];
  var CIT=[null,null,null,null,null,["«Chiese all'imperatore Foca il tempio chiamato Pantheon, e ne fece la chiesa della beata Maria sempre vergine e di tutti i martiri.»","Liber Pontificalis, vita di Bonifacio IV"],
    ["«Scoperchiò anche la chiesa di Santa Maria ad Martyres, che aveva le tegole di bronzo, e le mandò alla città imperiale.»","Liber Pontificalis, vita di Vitaliano"],["«chartis plumbeis»: con lastre di piombo","Liber Pontificalis, vita di Gregorio III"],null];
  var yCit=cb[1]+fsA*.82+(oriz?64:42), hCit=(oriz?cb[1]+cb[3]:cb[1]+cb[3])-yCit, gCit=el('g',{'class':'ig-p-cita'},gC), citVista=-1;
  var SCH=[[['costruito da','Adriano'],['completato','nel 126'],['ingresso','a nord'],['sul fregio','M·AGRIPPA·L·F·COS·TERTIVM·FECIT']],      /* l'iscrizione di Agrippa sta sul fregio, non nel timpano (CIL VI 896; commento del Pantheon in js/monumenti.js, da Platner e Ashby, 24 novembre 2026) */[['rotonda','56 m, 43,2 dentro'],['occhio','9 m'],['portico','34 × 13,6 m'],['colonne','16, alte 14,15 m']],
    [['copertura','tegole di bronzo'],['dorate?',"un'ipotesi"]],[['ultima notizia','368 o 370'],['poi','nessuna fino al 609']],[['fine del culto','non si sa'],['nel modello','392']],null,null,null,[['oggi','si conserva per intero']]];
  function scriviCit(i){ gCit.textContent=''; var c=CIT[i]; if(stretta) return;
    if(!c && SCH[i]){ var rr=SCH[i], rh2=oriz?28:24, wl=oriz&&!stretta?112:96; if(rr.length*rh2+4>hCit) rr=rr.slice(0,Math.max(0,Math.floor((hCit-4)/rh2)));
      rr.forEach(function(r,j){ var y=yCit+j*rh2; el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},gCit); tx(gCit,cb[0],y+rh2*.66,'ig-p-sch-k',r[0].toUpperCase()); var v=tx(gCit,cb[0]+wl,y+rh2*.68,'ig-p-sch-v'+(/·/.test(r[1])?' iscr':''),r[1]); if(largo(v)>cb[2]-wl){ v.style.fontSize='14px'; } if(largo(v)>cb[2]-wl){ v.setAttribute('x',r1(cb[0])); v.setAttribute('y',r1(y+rh2*.68+17)); var fz=14; while(largo(v)>cb[2]&&fz>9){ fz-=1; v.style.fontSize=fz+'px'; } } });      // l'iscrizione, se non entra accanto, va a capo sotto la sua voce
      return; }
    if(!c||hCit<60) return; var fq=oriz&&!stretta?18:15.5, t=el('text',{x:r1(cb[0]+14),y:r1(yCit+fq),'class':'ig-p-cita-t'},gCit); t.style.fontSize=fq+'px';
    var n=avvolgi(t,c[0],cb[2]-16,fq*1.22), hh=n*fq*1.22; if(hh+24>hCit){ gCit.textContent=''; return; } el('rect',{x:r1(cb[0]),y:r1(yCit),width:3,height:r1(hh+20),rx:1.5,'class':'ig-m-cita-filo'},gCit); tx(gCit,cb[0]+14,yCit+hh+fq*.4+12,'ig-m-cita-chi',c[1]); }
  /* il finale: tre coperture una accanto all'altra */
  var gF=el('g',{'class':'ig-p-tre'},svg); el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12,'class':'ig-p-carta'},gF);
  var tre=[['bronzo','126-663','tegole di bronzo'],['senza','663-731/741','senza tegole'],['piombo','dal 731-741','lastre di piombo']].map(function(v,i){
    var w3=(fb[2]-24)/3, bx=[fb[0]+12+i*w3,fb[1]+10,w3,fb[3]-46], g=el('g',{'class':'ig-p-tre-i'},gF); g.style.transitionDelay=(i*260)+'ms';
    var a=alzato(g,[bx[0]+6,bx[1],bx[2]-12,bx[3]],'ig-p-t3'+i,defs); a.colora(v[0]); cls(a.croce,'vis',i>0); cls(a.velo,'vis',false);
    tx(g,bx[0]+bx[2]/2,fb[1]+fb[3]-24,'ig-p-tre-a',v[1],'middle'); tx(g,bx[0]+bx[2]/2,fb[1]+fb[3]-9,'ig-p-tre-t',v[2],'middle'); return g; });
  var visto=-1, ultimoT=null;
  S.passo=function(t){
    ultimoT=t; var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; }); var ii=Math.max(0,i);
    /* la pianta nei primi due momenti, poi le fotografie */
    var inPianta=t<T[2]-200; cls(gP,'vis',t>=T[0]-300&&inPianta);
    lin.forEach(function(p,j){ traccia(p,E.io(fase(t,T[0]+j*380,T[0]+900+j*380))); });
    colonne.forEach(function(c,j){ cls(c,'vis',t>=T[1]+200+j*70); }); cls(occ,'vis',t>=T[0]+1600);
    cls(q56,'vis',t>=T[1]+400); cls(q34,'vis',t>=T[1]+800); cls(qOcc,'vis',t>=T[1]+1200); cls(nord,'vis',t>=T[0]+1800); cls(gLeg,'vis',t>=T[1]+1600);
    var fin=t>=T[8]+1400; cls(foto,'vis',t>=T[2]-700); cls(gF,'vis',fin); tre.forEach(function(g){ cls(g,'vis',fin); });
    var fq=quale[ii]; imm.forEach(function(m,j){ cls(m.im,'vis',m.ok&&j===fq&&t>=T[2]-700); var t0=T[Math.max(2,quale.indexOf(j))]-700, kb=1+0.05*E.io(fase(t,t0,t0+5200)); fissa(m.im,'transform','translate('+r1(fb[0]+fb[2]/2)+','+r1(fb[1]+fb[3]/2)+') scale('+Math.round(kb*1000)/1000+') translate('+r1(-fb[0]-fb[2]/2)+','+r1(-fb[1]-fb[3]/2)+')'); });
    var conFoto=imm[fq]&&imm[fq].ok; cls(alz.g,'vis',!conFoto); cls(alzEt,'vis',!conFoto);
    alz.colora(i>=7?'piombo':i>=6?'senza':'bronzo'); cls(alz.croce,'vis',i>=5); cls(alz.velo,'vis',i===4);
    scrivi(didaT,conFoto?'La città di questa pagina, anno '+ETI[fq]:''); if(conFoto) fissa(didaR,'width',r1(largo(didaT)+20)); cls(didaF,'vis',conFoto&&t>=T[2]-200);
    var P2=conFoto?punti:alz.punti; function F(nome,chiave,da,a){ var f=fum[nome], q=P2[chiave]; cls(f,'vis',!!q&&t>=da&&t<a&&!fin); if(q) f.metti(q); }
    F('rotonda','rotonda',T[2]+300,T[2]+2600); F('portico','portico',T[2]+900,T[2]+3600); F('cupola','cupola',T[2]+1400,T[3]-200);
    F('chiuso','portico',T[4]+600,T[5]-200); F('croce','croce',T[5]+800,T[6]-200); F('via','cupola',T[6]+800,T[7]-200); F('piombo','cupola',T[7]+800,T[8]+1200);
    /* il nastro */
    var anni=[126,126,126,369,392,609,663,736,800], a=i<1?126:i>=8?800:lerp(anni[ii],anni[Math.min(8,ii+1)],E.io(fase(t,T[ii+1]-900,T[ii+1])));
    if(i>=8) a=lerp(736,800,E.io(fase(t,T[8],T[8]+1200)));
    cls(gR,'vis',t>=T[0]+400); fissa(cur,'transform','translate('+r1(X(a))+',0)'); fissa(cpRr,'width',r1(Math.max(0,X(a)-rx0+2)));
    bande.forEach(function(g,j){ var q=[[126,392],[392,609],[609,800],[126,663],[663,736],[736,800]][j]; cls(g,'vis',a>=q[0]-1); cls(g,'ora',a>=q[0]&&a<q[1]+(j===2||j===5?1:0)); });
    cls(silenzio,'vis',i>=3);
    /* la colonna */
    cls(gC,'vis',t>=T[0]-200); if(i!==visto){ visto=i; scrivi(tA,i<0?'':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>20){ fa-=2; tA.style.fontSize=fa+'px'; } tStato.textContent=''; if(i>=0){ avvolgi(tStato,STATI[ii],cb[2],17); } scriviCit(ii); }
    cls(gC,'cambia',i>=0&&t<T[ii]+120);
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,j){ return {t:T[j],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   10. La Curia nel tempo
   Aggiunta il 23 novembre 2026. La tavola è la facciata della Curia vista di fronte, disegnata con le misure del modello (js/monumenti.js, curiaAula e curia: aula di 27 x 18 m,
   zoccolo di lastre di marmo, stucco a finti blocchi, cornice, frontone, tre finestre, porta con i battenti di bronzo; il portichetto «discusso»; le statue di bronzo sul frontone
   come sulle monete della Curia di Augusto, «qui indicative»; la chiesa: stesse mura, niente portico né statue, croce indicativa). Fatti: l'incendio del 283 e la ricostruzione
   di Diocleziano (EVENTI tetrarchia293 e scheda dei Fori in js/dati.js), l'altare della Vittoria tolto nel 357, rimesso «probabilmente sotto Giuliano: le fonti non dicono quando»,
   tolto di nuovo verso il 382 (tappa 384, con le voci di Simmaco e di Ambrogio), il Senato «attestato fino al 603» (scheda dei Fori), «Dov'è il Senato?» di Gregorio Magno nel 593,
   Onorio I e la chiesa del beato Adriano «ai Tre Fati» (tappa 630 e scheda santadriano, Liber Pontificalis), le porte di bronzo in San Giovanni in Laterano dal 1660 (commento
   del monumento curia), «ancora in piedi: fu chiesa fino al Novecento» (CERTEZZA). Schemi: l'incendio (della Curia di prima non si disegna la forma: resta un contorno), la facciata,
   l'altare (un altare qualsiasi: dove stesse nell'aula e com'era non è detto qui), il cantiere. Le fotografie sono fotogrammi della città in 3D di questa pagina nel 300, nel 384 e nel 700. */
var CURIA={ titolo:"La Curia nel tempo", sotto:"L'aula del Senato, dall'incendio del 283 alla chiesa di Sant'Adriano",
  fasi:[["Il Foro","Nel Foro romano, l'aula dove si riunisce il Senato: la Curia. Qui la si vede nella città di questa pagina com'è nel 300, dopo la ricostruzione."],
    ["283","Un incendio devasta il Foro. La Curia brucia."],
    ["284-305","Diocleziano la fa ricostruire: un'aula alta e stretta, di 27 metri per 18."],
    ["284-305","La facciata è di mattoni, rivestita di stucco a finti blocchi, con uno zoccolo di lastre di marmo, tre finestre e la porta con i battenti di bronzo. Il portico davanti è discusso; le statue sul frontone sono indicative."],
    ["357","Durante la sua visita, l'imperatore Costanzo II fa togliere dalla Curia l'altare della dea Vittoria."],
    ["dopo il 357","L'altare torna al suo posto, probabilmente sotto Giuliano: le fonti non dicono quando."],
    ["verso il 382","L'imperatore Graziano lo fa togliere di nuovo."],
    ["384","Simmaco, prefetto di Roma, chiede che l'altare torni nella Curia. Ambrogio, vescovo di Milano, si oppone. Valentiniano II respinge la richiesta."],
    ["593","«Dov'è il Senato?», chiede Gregorio Magno. Il Senato è attestato fino al 603."],
    ["625-638","Papa Onorio I fa la chiesa del beato Adriano «ai Tre Fati», l'angolo nord del Foro. Che fosse proprio la Curia lo mostrano gli studi sull'edificio."],
    ["1660","Le porte di bronzo restano al loro posto fino al 1660. Oggi sono in San Giovanni in Laterano."],
    ["Oggi","La Curia è ancora in piedi: è stata una chiesa fino al Novecento. Così è arrivata fino a noi."]],
  fonte:"Tappe del 293, del 357, del 384 e del 630, schede del Foro e di Sant'Adriano e voci di Simmaco (Relazione III 10), di Ambrogio (Lettera 18, 8) e del Liber Pontificalis (vita di Onorio I) in questa pagina; misure e facciata dai commenti del modello della Curia. L'altare fu rimesso «probabilmente» sotto Giuliano: le fonti non dicono quando. La facciata è uno schema dalle misure del modello: il portico davanti è discusso, le statue sul frontone e la croce sono indicative, l'incendio e il cantiere sono disegni. L'altare disegnato è un altare qualsiasi. Le fotografie sono fotogrammi della città in 3D di questa pagina negli anni indicati." };
function disegnaCuria(svg,S,W,H){
  var oriz=W/H>=1.15, pad=oriz?18:12, defs=el('defs',null,svg), fasi=CURIA.fasi;
  var T=[1400,5200,8600,12600,17600,21600,25200,28600,35200,39400,45000,49600], tFin=T[11]+6200;
  var fb, rb, cb, rib=oriz?66:70;
  if(oriz){ var fw=Math.round(W*(W<700?0.6:0.62)); fb=[pad,pad,fw,H-2*pad-rib-8]; rb=[pad,H-pad-rib,fw,rib]; cb=[pad+fw+24,pad+4,W-(pad+fw+24)-pad,H-2*pad-4]; }
  else { var fh=Math.round(Math.min(H*0.56,(W-2*pad)*0.95)); fb=[pad,pad,W-2*pad,fh]; rb=[pad,H-rib-2,W-2*pad,rib]; cb=[pad,fb[1]+fh+12,W-2*pad,rb[1]-(fb[1]+fh+12)-6]; }
  grad(defs,'ig-c-cielo',[[0,'#FBF6EC'],[1,'#EADFC9']]); grad(defs,'ig-c-bronzo',[[0,'#8C6A3A'],[.5,'#B48A4A'],[1,'#6F5129']],{x1:0,y1:0,x2:1,y2:0});
  grad(defs,'ig-c-fuoco',[[0,'#FFF6DA'],[.35,'#FFD36A'],[.75,'#F0782E'],[1,'#C2381C',.85]],{x1:0,y1:1,x2:0,y2:0});
  var clip=el('clipPath',{id:'ig-c-clip'},defs); el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12},clip);
  var tav=el('g',{'class':'ig-c-tavola'},svg); el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],rx:12,fill:'url(#ig-c-cielo)','class':'ig-c-fondo'},tav);
  var dentro=el('g',{'clip-path':'url(#ig-c-clip)'},tav);
  /* la facciata, in metri (dal modello): larga 19, muri alti 24, frontone fino a 30; il terreno a quota 0 */
  var s=Math.min(fb[2]/34,(fb[3]-20)/32.5), x0=fb[0]+fb[2]*(oriz?.5:.35), y0=fb[1]+fb[3]-14, M=function(x,y){ return [x0+x*s,y0-y*s]; };
  function R(p,x1,y1,x2,y2,cl){ var a=M(x1,y2), c=M(x2,y1); return el('rect',{x:r1(a[0]),y:r1(a[1]),width:r1(c[0]-a[0]),height:r1(c[1]-a[1]),'class':cl},p); }
  el('rect',{x:fb[0],y:r1(y0),width:fb[2],height:r1(fb[1]+fb[3]-y0),'class':'ig-c-suolo'},dentro);
  /* la Curia di prima, nel 283: solo un contorno (la sua forma non si disegna) */
  var prima=el('g',{'class':'ig-c-prima'},dentro), pr1=M(-9.5,0), pr2=M(9.5,24), pr3=M(0,30);
  el('path',{d:'M'+xy(pr1)+' V'+r1(pr2[1])+' L'+xy(pr3)+' L'+r1(pr2[0])+' '+r1(pr2[1])+' V'+r1(pr1[1]),'class':'ig-c-contorno'},prima);
  var fuoco=el('g',{'class':'ig-c-fuoco'},dentro), Rf=caso(283);
  var bag=M(0,6); el('ellipse',{cx:r1(bag[0]),cy:r1(bag[1]),rx:r1(15*s),ry:r1(12*s),'class':'ig-c-bagliore'},fuoco);
  for(var q=0;q<11;q++){ var fx=lerp(-9,9,q/10)+(Rf()-.5)*2, fy=Rf()*6+(q%2?4:0), fh2=(7+Rf()*9)*s, fw2=fh2*(.32+Rf()*.12), p0=M(fx,fy);
    var fl=el('path',{d:'M'+r1(-fw2)+' 0 C'+r1(-fw2)+' '+r1(-fh2*.45)+' '+r1(-fw2*.25)+' '+r1(-fh2*.62)+' 0 '+r1(-fh2)+' C'+r1(fw2*.25)+' '+r1(-fh2*.62)+' '+r1(fw2)+' '+r1(-fh2*.45)+' '+r1(fw2)+' 0 Q0 '+r1(fw2*.7)+' '+r1(-fw2)+' 0 Z',fill:'url(#ig-c-fuoco)','class':'ig-c-fiamma'},el('g',{transform:'translate('+xy(p0)+')'},fuoco)); fl.style.animationDelay=(-Rf()*1.3)+'s'; }
  var fumo=el('g',{'class':'ig-c-fumo'},fuoco); for(q=0;q<6;q++){ var pf=M((Rf()-.5)*14,26+Rf()*6); el('circle',{cx:r1(pf[0]),cy:r1(pf[1]),r:r1((3+Rf()*3)*s)},fumo); }
  /* la nuova Curia: sale dal basso dentro il cantiere */
  var cpC=el('clipPath',{id:'ig-c-sale'},defs), cpR=el('rect',{x:fb[0],y:r1(y0),width:fb[2],height:0},cpC);
  var nuova=el('g',{'clip-path':'url(#ig-c-sale)'},dentro), fac=el('g',null,nuova);
  R(fac,-9.5,0,9.5,24,'ig-c-stucco');
  var blocchi=el('g',{'class':'ig-c-blocchi'},fac), bd='';
  for(var yb=8.5;yb<23.2;yb+=1.25){ var a1=M(-9.5,yb), a2=M(9.5,yb); bd+='M'+xy(a1)+' H'+r1(a2[0])+' '; var off=((yb-8.5)/1.25)%2?1.5:0; for(var xb=-9.5+off;xb<9.5;xb+=3){ var v1=M(xb,yb), v2=M(xb,Math.min(23.2,yb+1.25)); bd+='M'+xy(v1)+' V'+r1(v2[1])+' '; } }
  el('path',{d:bd},blocchi);
  var zoccolo=R(fac,-9.8,0,9.8,8.5,'ig-c-marmo'), zl=''; for(var xz=-9.8;xz<9.8;xz+=2.45){ var z1=M(xz,0), z2=M(xz,8.5); zl+='M'+xy(z1)+' V'+r1(z2[1])+' '; } el('path',{d:zl,'class':'ig-c-giunti'},fac);
  var cornice=R(fac,-10,23.2,10,24.2,'ig-c-cornice');
  var f1=M(-10,24.2), f2=M(10,24.2), f3=M(0,30); var frontone=el('path',{d:'M'+xy(f1)+' L'+xy(f3)+' L'+xy(f2)+' Z','class':'ig-c-frontone'},fac);
  var fi1=M(-6.4,25.4), fi2=M(6.4,25.4), fi3=M(0,28.9); el('path',{d:'M'+xy(fi1)+' L'+xy(fi3)+' L'+xy(fi2)+' Z','class':'ig-c-timpano'},fac);
  var finestre=el('g',{'class':'ig-c-finestre'},fac); [-6.3,0,6.3].forEach(function(cx){ var a=M(cx-1.9,13), b=M(cx+1.9,19.6), rr=(b[0]-a[0])/2; el('path',{d:'M'+xy(a)+' V'+r1(b[1]+rr)+' A'+r1(rr)+' '+r1(rr)+' 0 0 1 '+r1(b[0])+' '+r1(b[1]+rr)+' V'+r1(a[1])+' Z'},finestre); });
  R(fac,-2.9,12.9,2.9,13.8,'ig-c-marmo');      // l'architrave della porta
  var vano=R(fac,-2.3,2.5,2.3,12.9,'ig-c-vano');
  var porte=el('g',{'class':'ig-c-porte'},fac); [-1,1].forEach(function(sx){ var g=el('g',null,porte), a=M(sx<0?-2.2:0.05,2.5), b=M(sx<0?-0.05:2.2,12.8); el('rect',{x:r1(a[0]),y:r1(b[1]),width:r1(b[0]-a[0]),height:r1(a[1]-b[1]),fill:'url(#ig-c-bronzo)','class':'ig-c-battente'},g);
    for(var k=0;k<4;k++){ var c1=M(sx<0?-1.9:.35,3.2+k*2.35), c2=M(sx<0?-.35:1.9,4.9+k*2.35); el('rect',{x:r1(c1[0]),y:r1(c2[1]),width:r1(c2[0]-c1[0]),height:r1(c1[1]-c2[1]),'class':'ig-c-formella'},g); } });
  var pVia=tx(dentro,fb[0]+fb[2]-14,fb[1]+fb[3]*0.5,'ig-c-porte-via','verso San Giovanni in Laterano →','end');
  var gradini=R(fac,-7.5,0,7.5,2.5,'ig-c-gradini'), gradChiesa=R(fac,-5,0,5,1.8,'ig-c-gradini chiesa');
  /* il portichetto (discusso) e le statue (indicative) */
  var portico=el('g',{'class':'ig-c-portico'},fac); R(portico,-7.2,11.5,7.2,12.4,'ig-c-tettuccio'); [-6.2,-2.07,2.07,6.2].forEach(function(cx){ R(portico,cx-.42,2.5,cx+.42,11.5,'ig-c-colonna'); });
  var statue=el('g',{'class':'ig-c-statue'},fac); [[0,30,1.2],[-9.6,24.2,.9],[9.6,24.2,.9]].forEach(function(q){ var b=M(q[0],q[1]), h=3.2*s*q[2]+3;
    el('path',{d:'M'+r1(b[0]-h*.16)+' '+r1(b[1])+' L'+r1(b[0]-h*.12)+' '+r1(b[1]-h*.7)+' Q'+r1(b[0])+' '+r1(b[1]-h*.84)+' '+r1(b[0]+h*.12)+' '+r1(b[1]-h*.7)+' L'+r1(b[0]+h*.16)+' '+r1(b[1])+' Z'},statue); el('circle',{cx:r1(b[0]),cy:r1(b[1]-h*.9),r:r1(h*.12)},statue); });
  var cr=M(0,30), croce=el('path',{d:'M'+r1(cr[0])+' '+r1(cr[1])+' v'+r1(-4.6*s)+' M'+r1(cr[0]-1.3*s)+' '+r1(cr[1]-3.4*s)+' h'+r1(2.6*s),'class':'ig-c-croce'},fac);
  /* il ponteggio del cantiere */
  var ponteggio=el('g',{'class':'ig-c-ponteggio'},dentro), pd=''; for(var xp=-11;xp<=11;xp+=3.67){ var q1=M(xp,0), q2=M(xp,31); pd+='M'+xy(q1)+' V'+r1(q2[1])+' '; } for(var yp=3;yp<=30;yp+=3.5){ var h1=M(-11,yp), h2=M(11,yp); pd+='M'+xy(h1)+' H'+r1(h2[0])+' '; }
  el('path',{d:pd},ponteggio);
  /* il velo del Senato vuoto (593) */
  var velo=el('rect',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],'class':'ig-c-velo'},dentro);
  var quota=el('g',{'class':'ig-p-quota'},dentro), qa=M(-9.5,-1.6), qb=M(9.5,-1.6); el('path',{d:'M'+xy(qa)+' H'+r1(qb[0])+' M'+r1(qa[0])+' '+r1(qa[1]-4)+' v8 M'+r1(qb[0])+' '+r1(qb[1]-4)+' v8'},quota);
  var etS=tx(dentro,fb[0]+fb[2]-10,fb[1]+fb[3]-6,'ig-p-dida vis','facciata: schema dal modello','end');
  /* le fotografie: il Foro nel 300 (all'inizio), la Curia nel 384 e Sant'Adriano nel 700 (alla fine, prima e dopo) */
  var X0=.8, Z0=-5.1, ry=-.35, fx2=Math.sin(ry), fz2=Math.cos(ry), hC=.8;
  var posaV={t:[X0,hC+1.4,Z0],c:[X0+fx2*10.8-fz2*4.6,hC+5.6,Z0+fz2*10.8+fx2*4.6]}, posaF={t:[X0+1,hC+.6,Z0-2],c:[X0+fx2*20+6,hC+12.5,Z0+fz2*20]};
  var foto=[0,1,2].map(function(){ return el('image',{x:fb[0],y:fb[1],width:fb[2],height:fb[3],preserveAspectRatio:'xMidYMid slice','class':'ig-p-img'},dentro); }), fOk=[false,false,false], pCuria=null, cW=.5;
  var cpW=el('clipPath',{id:'ig-c-wipe'},defs), cpWr=el('rect',{x:fb[0],y:fb[1],width:fb[2]/2,height:fb[3]},cpW); foto[1].setAttribute('clip-path','url(#ig-c-wipe)'); dentro.insertBefore(foto[2],foto[1]);      // il 384 sta sopra il 700 e si vede a sinistra della lama
 
  var lama=el('g',{'class':'ig-c-lama'},dentro); el('line',{x1:0,x2:0,y1:fb[1],y2:fb[1]+fb[3]},lama); el('circle',{cx:0,cy:r1(fb[1]+fb[3]/2),r:13},lama); el('path',{d:'M-4 '+r1(fb[1]+fb[3]/2-5)+' l-5 5 l5 5 M4 '+r1(fb[1]+fb[3]/2-5)+' l5 5 l-5 5','class':'ig-c-lama-f'},lama);
  var dW1=tx(dentro,fb[0]+12,fb[1]+fb[3]-14,'ig-c-wipe-t','384 · la Curia','start'), dW2=tx(dentro,fb[0]+fb[2]-12,fb[1]+fb[3]-14,'ig-c-wipe-t','700 · Sant\'Adriano','end');
  var pd=cursorePD(S,fb,'Prima e dopo: la Curia nel 384 e Sant\'Adriano nel 700',function(f){ return f<.15?'quasi tutto il 700, Sant\'Adriano':f>.85?'quasi tutto il 384, la Curia':'a sinistra il 384, a destra il 700'; },function(){ if(ultimoT!=null) S.passo(ultimoT); });
  var dida=el('g',{'class':'ig-p-dida-f'},dentro), didaR=el('rect',{x:fb[0]+10,y:fb[1]+fb[3]-30,height:20,rx:10,'class':'ig-p-dida-fondo'},dida), didaT=tx(dida,fb[0]+20,fb[1]+fb[3]-16,'ig-p-dida-t','La città di questa pagina, anno 300');
  fissa(didaR,'width',r1(largo(didaT)+20));
  var fCuria=fumetto(dentro,fb,'la Curia','dx');
  fotogrammi('curia',[{a:300,posa:posaF,punti:[['curia',X0,hC+1.6,Z0]]},{a:384,posa:posaV,punti:[['curia',X0,hC+1.3,Z0]]},{a:700,posa:posaV}],null,Math.round(fb[2]),Math.round(fb[3]),[],function(i,r){ href(foto[i],r.url); fOk[i]=true; if(i===0&&r.p&&r.p.curia) pCuria=r.p.curia; if(i===1&&r.p&&r.p.curia) cW=clamp(r.p.curia[0],.3,.7); if(ultimoT!=null) S.passo(ultimoT); });
  /* i fumetti sulla facciata */
  function frac(x,y){ var p=M(x,y); return [(p[0]-fb[0])/fb[2],(p[1]-fb[1])/fb[3]]; }
  var F={zoccolo:[fumetto(svg,fb,'zoccolo di marmo','sx'),frac(-7,5)],stucco:[fumetto(svg,fb,'stucco a finti blocchi','sx'),frac(-7.5,20)],finestre:[fumetto(svg,fb,'tre finestre','dx'),frac(6.3,17)],
    porte:[fumetto(svg,fb,'porte di bronzo','dx'),frac(1.2,7)],portico:[fumetto(svg,fb,'portico: discusso','sx'),frac(-6.2,9)],statue:[fumetto(svg,fb,'statue: indicative','dx'),frac(9.6,26)],
    croce:[fumetto(svg,fb,'croce: indicativa','dx'),frac(0,32)],misura:[fumetto(svg,fb,'fronte: 19 m','dx'),frac(8,-1.6)]};
  /* le voci del 384 e del 593, sopra la tavola */
  function carta(x,y,w,q,chi,cl){ var g=el('g',{'class':'ig-c-voce '+(cl||'')},svg), t=el('text',{x:r1(x+14),y:r1(y+24),'class':'ig-c-voce-t'},g), n=avvolgi(t,q,w-28,20), hh=n*20+44;
    el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(hh),rx:10,'class':'ig-c-voce-fondo'},g).parentNode.insertBefore(g.lastChild,g.firstChild); tx(g,x+14,y+24+n*20+6,'ig-c-voce-chi',chi); g._h=hh; return g; }
  var vw=fb[2]<520?fb[2]-24:Math.min(fb[2]*0.47,300), simm=carta(fb[0]+12,fb[1]+14,vw,'«Non si può arrivare per una sola strada a un mistero così grande.»','Simmaco, Relazione III, 10','sx'),
    ambr=carta(fb[0]+fb[2]-vw-12,fb[1]+14+(fb[2]<520?simm._h+8:46),vw,'«Ciò che voi ignorate, noi l\'abbiamo conosciuto dalla voce di Dio.»','Ambrogio, Lettera 18, 8','dx');
  var dove=el('g',{'class':'ig-c-dove'},svg), dq=tx(dove,fb[0]+fb[2]/2,fb[1]+fb[3]*0.42,'ig-c-dove-t','«Dov\'è il Senato?»','middle'), fsq=Math.min(44,fb[2]/11); dq.style.fontSize=r1(fsq)+'px';
  tx(dove,fb[0]+fb[2]/2,fb[1]+fb[3]*0.42+fsq*0.62+8,'ig-c-dove-chi','Gregorio Magno, 593','middle');
  /* il nastro: Senato, altare, chiesa (con un salto fra il 700 e il 1660) */
  var rx0=rb[0]+(oriz?82:70), rxB=rb[0]+rb[2]-(oriz?92:76), rx1=rb[0]+rb[2]-4, A0=250, A1=700;
  var X=function(a){ return a<=A1?rx0+(a-A0)/(A1-A0)*(rxB-rx0):a<2000?rxB+26:rx1; }, gR=el('g',{'class':'ig-p-nastro'},svg), rh=11, ys=[rb[1]+6,rb[1]+6+rh+5,rb[1]+6+2*(rh+5)];
  ['SENATO','ALTARE','CHIESA'].forEach(function(n,i){ tx(gR,rb[0],ys[i]+rh-2,'ig-p-n-et',n); });
  var cpN=el('clipPath',{id:'ig-c-cn'},defs), cpNr=el('rect',{x:r1(rx0-2),y:r1(ys[0]-6),width:0,height:r1(3*(rh+5)+10)},cpN), gB=el('g',{'clip-path':'url(#ig-c-cn)'},gR);
  function banda(i,a,b,cl){ return el('rect',{x:r1(X(a)),y:r1(ys[i]),width:r1(Math.max(2,X(b)-X(a)-1)),height:rh,rx:2,'class':'ig-c-b '+cl},gB); }
  var ptC=el('pattern',{id:'ig-c-trat',width:5,height:5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs); el('rect',{width:5,height:5,fill:'#EFE6D4'},ptC); el('rect',{width:2,height:5,fill:'#B8A98E'},ptC);
  banda(0,250,283,'senato'); banda(0,283,305,'cantiere'); banda(0,305,603,'senato');
  banda(1,305,357,'altare'); banda(1,357,382,'forse'); banda(2,625,638,'cantiere'); banda(2,638,700,'chiesa'); el('rect',{x:r1(rxB+8),y:r1(ys[2]),width:r1(rx1-rxB-8),height:rh,rx:2,'class':'ig-c-b chiesa'},gB);
  var sF=tx(gB,X(370),ys[1]+rh-2,'ig-c-b-t','?','middle');
  el('path',{d:'M'+r1(rxB+4)+' '+r1(ys[0]-3)+' l5 '+r1(3*(rh+5))+' M'+r1(rxB+9)+' '+r1(ys[0]-3)+' l5 '+r1(3*(rh+5)),'class':'ig-c-salto'},gR);
  [[283,'283','middle'],[357,'357','end'],[384,'384','start'],[603,'603','end'],[638,'630','start'],[1660,'1660','middle'],[3000,'oggi','end']].filter(function(q){ return rxB-rx0>=300||q[0]!==357; }).forEach(function(q){ var x=q[0]===638?X(625):X(q[0]); tx(gR,x,ys[2]+rh+14,'ig-p-n-anno',q[1],q[2]); });
  var cur=el('g',{'class':'ig-p-cur'},gR); el('line',{x1:0,x2:0,y1:r1(ys[0]-5),y2:r1(ys[2]+rh+3),'class':'ig-p-cur-l'},cur); el('circle',{cx:0,cy:r1(ys[0]-5),r:4,'class':'ig-p-cur-p'},cur);
  /* la colonna: l'anno, lo stato, l'altare */
  var gC=el('g',{'class':'ig-p-col-d'},svg), stretta=cb[2]<230, fsA=oriz?Math.min(60,cb[2]/4.4):Math.min(34,W/10.5), tA=tx(gC,cb[0],cb[1]+fsA*.82,'ig-p-anno',''), tSt=el('text',{x:r1(cb[0]),y:r1(cb[1]+fsA*.82+24),'class':'ig-p-stato'},gC);
  var STATI=['L\'AULA DEL SENATO','L\'INCENDIO','LA RICOSTRUZIONE','LA FACCIATA','VIA L\'ALTARE','L\'ALTARE TORNA','VIA DI NUOVO','LA RICHIESTA RESPINTA','IL SENATO SCOMPARE','SANT\'ADRIANO','LE PORTE DI BRONZO','ANCORA IN PIEDI'];
  /* l'altare della Vittoria: un altare qualsiasi, che entra ed esce */
  var ay=cb[1]+fsA*.82+(oriz?64:48), ah=Math.min(oriz?92:62,cb[3]-(ay-cb[1])-30), gA=el('g',{'class':'ig-c-altare-box'},gC), mostraA=ah>=40&&!stretta, ayQ=ay, inTav=false, xL=0, wL=0, fondoA=null;
  /* senza posto nella colonna (telefono in piedi) l'altare va nella tavola, a destra della facciata: prima stava in alto a sinistra e copriva il frontone */
  if(!mostraA){ inTav=true; mostraA=true; xL=M(10.8,0)[0]+8; wL=fb[0]+fb[2]-8-xL; ah=Math.min(44,fb[3]*0.19); ay=fb[1]+16; svg.appendChild(gA); fondoA=el('rect',{x:r1(xL),y:r1(ay-8),width:r1(wL),rx:10,'class':'ig-c-altare-fondo'},gA); }
  var aw=ah*0.62, ax=inTav?xL+10:cb[0]+8, alt=el('g',{'class':'ig-c-altare'},gA), alGhost=el('g',{'class':'ig-c-altare-ombra'},gA);
  function altare(p){ var P=function(x,y){ return xy([ax+x*aw,ay+y*ah]); };
    el('path',{d:'M'+P(.05,1)+' L'+P(.95,1)+' L'+P(.95,.9)+' L'+P(.85,.86)+' L'+P(.85,.32)+' L'+P(.95,.27)+' L'+P(.95,.18)+' L'+P(.05,.18)+' L'+P(.05,.27)+' L'+P(.15,.32)+' L'+P(.15,.86)+' L'+P(.05,.9)+' Z'},p);
    el('path',{d:'M'+P(.02,.18)+' Q'+P(.02,.06)+' '+P(.16,.08)+' L'+P(.84,.08)+' Q'+P(.98,.06)+' '+P(.98,.18)+' Z'},p); el('path',{d:'M'+P(.3,.45)+' Q'+P(.5,.38)+' '+P(.7,.45)+' L'+P(.7,.7)+' Q'+P(.5,.76)+' '+P(.3,.7)+' Z','class':'ig-c-altare-rilievo'},p); }
  altare(alt); altare(alGhost);
  var tX=ax+aw+(inTav?10:14), aT=el('text',{x:r1(tX),y:r1(ay+ah*(inTav?.3:.38)),'class':'ig-c-alt-tit'},gA), nT=1;
  if(inTav) nT=avvolgi(aT,'l\'altare della Vittoria',xL+wL-10-tX,17); else { aT.textContent='l\'altare della Vittoria'; if(tX+largo(aT)>cb[0]+cb[2]) aT.textContent='l\'altare'; }
  var sX=inTav?xL+10:tX, sY=inTav?Math.max(ay+ah,ay+ah*.3+(nT-1)*17)+18:ay+ah*0.38+19, wS=inTav?wL-20:cb[0]+cb[2]-tX, aS=el('text',{x:r1(sX),y:r1(sY),'class':'ig-c-alt-st'},gA);
  function statoA(s0){ if(aS._s===s0) return; aS._s=s0; aS.textContent=''; aS.style.fontSize=''; if(inTav){ avvolgi(aS,s0,wS,15); return; } aS.textContent=s0; if(largo(aS)>wS) aS.style.fontSize='12px'; }
  if(fondoA){ var nMax=1; ['nella Curia','tolto da Costanzo II','rimesso, probabilmente sotto Giuliano','tolto da Graziano','la richiesta di Simmaco è respinta'].forEach(function(s0){ aS.textContent=''; nMax=Math.max(nMax,avvolgi(aS,s0,wS,15)); }); aS.textContent=''; fondoA.setAttribute('height',r1(sY+(nMax-1)*15+12-(ay-8))); }
  var yQ=inTav?ayQ:ay+ah+22, gQ=el('g',{'class':'ig-p-cita'},gC), qVista=-2;
  var CQ={9:["«Fece la chiesa del beato Adriano ai Tre Fati, la dedicò e vi offrì molti doni.»","Liber Pontificalis, vita di Onorio I"]};
  var SCH={1:[['il fuoco','devasta il Foro']],2:[['aula','27 × 18 m'],['la rifà','Diocleziano'],['anni','284-305']],8:[['il Senato','attestato fino al 603']],10:[['porte di bronzo','qui fino al 1660'],['oggi','in San Giovanni in Laterano']],11:[['la Curia','ancora in piedi'],['chiesa','fino al Novecento']]};
  function scriviQ(i){ gQ.textContent=''; var c=CQ[i]; if(stretta) return;
    if(!c && SCH[i]){ var rr=SCH[i], rh2=oriz?28:24, y0q=mostraA&&!inTav&&i>=4&&i<8?yQ:ayQ, wl=oriz?118:104; if(y0q+rr.length*rh2>cb[1]+cb[3]) rr=rr.slice(0,Math.max(0,Math.floor((cb[1]+cb[3]-y0q)/rh2)));
      rr.forEach(function(r,j){ var y=y0q+j*rh2; el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},gQ); tx(gQ,cb[0],y+rh2*.66,'ig-p-sch-k',r[0].toUpperCase()); var v=tx(gQ,cb[0]+wl,y+rh2*.68,'ig-p-sch-v',r[1]); if(largo(v)>cb[2]-wl) v.style.fontSize='14px'; if(largo(v)>cb[2]-wl){ v.setAttribute('x',r1(cb[0])); v.setAttribute('y',r1(y+rh2*.68+16)); } });
      return; }
    if(!c) return; var yy=mostraA&&!inTav&&i>=4&&i<8?yQ:ayQ, hq=cb[1]+cb[3]-yy; if(hq<60) return; var fq=oriz?17:15, t=el('text',{x:r1(cb[0]+14),y:r1(yy+fq),'class':'ig-p-cita-t'},gQ); t.style.fontSize=fq+'px';
    var n=avvolgi(t,c[0],cb[2]-16,fq*1.22), hh=n*fq*1.22; if(hh+24>hq){ gQ.textContent=''; return; } el('rect',{x:r1(cb[0]),y:r1(yy),width:3,height:r1(hh+20),rx:1.5,'class':'ig-m-cita-filo'},gQ); tx(gQ,cb[0]+14,yy+hh+fq*.4+12,'ig-m-cita-chi',c[1]); }
  var visto=-1, ultimoT=null;
  S.passo=function(t){
    ultimoT=t; var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; }); var ii=Math.max(0,i), fin=t>=T[11]+600;
    cls(tav,'vis',t>=T[0]-400);
    /* la fotografia del Foro all'inizio */
    var f0=t<T[1]-300; cls(foto[0],'vis',fOk[0]&&f0&&t>=T[0]-400); cls(fCuria,'vis',fOk[0]&&f0&&t>=T[0]+900&&!!pCuria); if(pCuria) fCuria.metti(pCuria); cls(dida,'vis',fOk[0]&&f0&&t>=T[0]);
    if(f0) fissa(foto[0],'transform','translate('+r1(fb[0]+fb[2]/2)+','+r1(fb[1]+fb[3]/2)+') scale('+r1(1+0.06*E.io(fase(t,T[0]-400,T[1])))+') translate('+r1(-fb[0]-fb[2]/2)+','+r1(-fb[1]-fb[3]/2)+')');
    /* l'incendio */
    cls(prima,'vis',t>=T[1]-300&&t<T[2]+400); cls(fuoco,'vis',t>=T[1]+200&&t<T[2]-200);
    /* la ricostruzione */
    var su=E.io(fase(t,T[2]+200,T[3]-600)); fissa(cpR,'y',r1(y0-su*(y0-fb[1]))); fissa(cpR,'height',r1(su*(y0-fb[1])+2)); cls(ponteggio,'vis',t>=T[2]&&t<T[3]+400);
    cls(blocchi,'vis',t>=T[3]); cls(porte,'vis',true); cls(finestre,'vis',true);
    var chiesa=i>=9, porteVia=i>=10;
    cls(portico,'vis',su>=1&&!chiesa); cls(statue,'vis',su>=1&&!chiesa); cls(croce,'vis',chiesa); cls(gradini,'via',chiesa); cls(gradChiesa,'vis',chiesa);
    var dp=E.io(fase(t,T[10]+500,T[10]+2200)); fissa(porte,'transform',dp>0?'translate('+r1(dp*fb[2]*0.7)+',0)':''); cls(porte,'via',dp>=1); cls(pVia,'vis',dp>0.15&&i===10);
    cls(velo,'vis',i===8); cls(quota,'vis',i===2&&t>=T[2]+1600); cls(etS,'vis',t>=T[2]&&!(i===2&&t>=T[2]+1600)&&!(fin&&fOk[1]&&fOk[2]));
    /* le fotografie della fine: prima e dopo */
    var vF=fin&&fOk[1]&&fOk[2]; cls(foto[2],'vis',vF); cls(foto[1],'vis',vF); var wp=fase(t,T[11]+1400,T[11]+5200), fw=cW+0.2*Math.sin(wp*Math.PI*2)*(1-wp*0.4);
    if(!fin) pd.libera(); if(pd.mano) fw=pd.f; else pd.metti(fw); pd.mostra(vF); var wx=fb[0]+fb[2]*fw;      // presa in mano, la lama sta dove la lascia chi guarda
    fissa(cpWr,'width',r1(wx-fb[0])); fissa(lama,'transform','translate('+r1(wx)+',0)'); cls(lama,'vis',vF); cls(dW1,'vis',vF); cls(dW2,'vis',vF);
    /* i fumetti */
    function Fu(k,da,a){ var f=F[k]; cls(f[0],'vis',t>=da&&t<a); f[0].metti(f[1]); }
    var uno=fb[2]<520, seq=['stucco','zoccolo','finestre','porte','portico','statue'];      // sul telefono i cartellini della facciata vengono uno alla volta
    Fu('misura',T[2]+1800,T[3]-200); seq.forEach(function(k,j){ var da=T[3]+200+j*(uno?760:400); Fu(k,da,uno?da+740:T[4]-300); });
    Fu('croce',T[9]+1200,T[10]-200);
    /* l'altare */
    var st=i<4||i===4&&t<T[4]+1500?'c':i===4?'via':i===5?'forse':'via2';
    cls(gA,'vis',mostraA&&i>=4&&i<8&&!(inTav&&i===7&&t>=T[7]+400)); cls(alt,'via',st==='via'||st==='via2'); cls(alt,'forse',st==='forse'); cls(alGhost,'vis',st!=='c');
    statoA(st==='c'?'nella Curia':st==='via'?'tolto da Costanzo II':st==='forse'?'rimesso, probabilmente sotto Giuliano':i>=7?'la richiesta di Simmaco è respinta':'tolto da Graziano');
    cls(simm,'vis',i===7&&t>=T[7]+500); cls(ambr,'vis',i===7&&t>=T[7]+2600); cls(dove,'vis',i===8&&t>=T[8]+300);
    /* il nastro */
    var anni=[250,283,284,300,357,370,382,384,593,630,1660,3000], a=lerp(anni[ii],anni[Math.min(11,ii+1)],E.io(fase(t,T[Math.min(11,ii+1)]-900,T[Math.min(11,ii+1)])));
    if(i<0) a=250; if(i===0) a=Math.min(a,283); if(i>=11) a=3000; if(i===10&&t<T[11]-900) a=1660;
    cls(gR,'vis',t>=T[0]+300); fissa(cur,'transform','translate('+r1(X(a))+',0)'); fissa(cpNr,'width',r1(Math.max(0,X(a)-rx0+2)));
    /* la colonna */
    cls(gC,'vis',t>=T[0]-200);
    if(i!==visto){ visto=i; scrivi(tA,i<0?'':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>18){ fa-=2; tA.style.fontSize=fa+'px'; } tSt.textContent=''; if(i>=0) avvolgi(tSt,STATI[ii],cb[2],17); scriviQ(ii); }
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,j){ return {t:T[j],anno:f[0],testo:f[1]}; });
}

/* ---------- aiuti per le infografiche 11-13 (Adrianopoli, Campi Catalaunici, Capo Bon) ---------- */
/* i colori degli stati della carta della pagina (css/stile.css e REGNI in js/mappa.js) */
var COLORE_STATO={roma:'#9A2F2A',oriente:'#B8B3BB',federati:'#94AC84',usurpatore:'#F2C85A',conteso:'#C89A8E',regno:'#4D6B7C',
  'regno:vandali':'#967E56','regno:visigoti':'#8054C3','regno:burgundi':'#C16BBC','regno:franchi':'#405D83','regno:svevi':'#AD6B0A','regno:persia':'#C79931'};
function statiDi(anno){ var t=(D.TAPPE||[]).filter(function(q){ return q.anno===anno&&!q.intermezzo; })[0]; return t&&t.regioni||{}; }
/* una finestra sulla carta della pagina (RM_MAPPA, col rilievo): V in unità della carta, b in pixel; M() porta un punto della carta in pixel, C() un luogo per nome */
function finestra(par,defs,id,V,b,o){
  var G=window.RM_MAPPA; o=o||{}; var k=b[2]/V[2], g=el('g',{'class':'ig-fin'},par);
  var cp=el('clipPath',{id:id},defs); el('rect',{x:r1(b[0]),y:r1(b[1]),width:r1(b[2]),height:r1(b[3]),rx:12},cp);
  var zoom=el('g',null,el('g',{'clip-path':'url(#'+id+')'},g));
  var carta=el('g',{transform:'translate('+r1(b[0]-V[0]*k)+','+r1(b[1]-V[1]*k)+') scale('+Math.round(k*1000)/1000+')'},zoom);
  el('rect',{x:V[0]-V[2],y:V[1]-V[3],width:V[2]*3,height:V[3]*3,'class':'ig-v-mare'},carta); var terra=el('path',{d:G.terra,'class':'ig-v-terra'},carta);
  /* le regioni dell'atlante (province del DARE) non hanno lo stesso bordo della costa di Natural Earth: ingrandite, lasciavano strisce di terra chiara lungo la riva e sporgevano
     sul mare (24 novembre 2026, cattura dell'utente su Capo Bon). Rimedio nel solo disegno, i dati restano come sono: le regioni si ritagliano sulla terra, e sotto di loro un bordo
     largo dello stesso colore, mascherato dove la regione c'è già, riempie lo scarto fra regione e costa (fino a 3 unità della carta, circa 15 km) */
  var reg={}; if(o.stati){ var nid=id.replace(/\W/g,''), cT=el('clipPath',{id:nid+'-terra'},defs); el('path',{d:G.terra},cT);
    var mk=el('mask',{id:nid+'-fuori',maskUnits:'userSpaceOnUse',x:V[0]-V[2],y:V[1]-V[3],width:V[2]*3,height:V[3]*3},defs); el('rect',{x:V[0]-V[2],y:V[1]-V[3],width:V[2]*3,height:V[3]*3,fill:'#fff'},mk);
    var gOrlo=el('g',{'clip-path':'url(#'+nid+'-terra)'},carta), orlo=el('g',{mask:'url(#'+nid+'-fuori)','class':'ig-fin-orli'},gOrlo), gReg=el('g',{'clip-path':'url(#'+nid+'-terra)'},carta);
    Object.keys(G.regioni).forEach(function(r){ var c=COLORE_STATO[o.stati[r]]; if(!c) return; el('path',{d:G.regioni[r].d,fill:'#000'},mk);
      reg[r]=el('path',{d:G.regioni[r].d,'class':'ig-fin-reg',style:'fill:'+c},gReg); reg[r]._orlo=el('path',{d:G.regioni[r].d,'class':'ig-fin-orlo',style:'stroke:'+c},orlo); }); }
  if(o.rilievo!==false) href(el('image',{x:0,y:0,width:G.w,height:G.h,preserveAspectRatio:'none','class':'ig-m-rilievo'},carta),'img/rilievo.jpg');
  (G.fiumi||[]).forEach(function(f){ if(f.d) el('path',{d:f.d,'class':'ig-v-fiume'+(f.forte?' forte':''),'vector-effect':'non-scaling-stroke'},carta); });
  el('path',{d:G.terra,'class':'ig-v-costa','vector-effect':'non-scaling-stroke'},carta);
  var sopra=el('g',null,zoom); el('rect',{x:r1(b[0]),y:r1(b[1]),width:r1(b[2]),height:r1(b[3]),rx:12,'class':'ig-m-cornice'},g);
  function M(p){ return [b[0]+(p[0]-V[0])*k, b[1]+(p[1]-V[1])*k]; }
  return {g:g,zoom:zoom,carta:carta,sopra:sopra,reg:reg,k:k,b:b,M:M,terra:terra,inTerra:function(p){ try{ var q=(window.DOMPoint?new DOMPoint(p[0],p[1]):{x:p[0],y:p[1]}); return terra.isPointInFill(q); }catch(e){ return false; } },C:function(n){ var q=(G.luoghi||{})[n]||G.citta[n]; return q?M([q.x,q.y]):null; }};
}
/* un luogo sulla finestra: punto e nome */
function luogo(par,q,nome,dx,dy,an,cl){ var g=el('g',{'class':'ig-v-luogo'+(cl?' '+cl:''),transform:'translate('+xy(q)+')'},par); el('circle',{r:cl&&/grande/.test(cl)?5:3.8,'class':'ig-v-punto'+(cl&&/roma/.test(cl)?' roma':'')},g);
  tx(g,dx,dy,'ig-v-nome'+(cl&&/roma/.test(cl)?' roma':''),nome,an||'start'); return g; }
/* i nomi dei luoghi stanno sopra frecce, anelli e segni: ogni luogo (punto e nome, con l'alone del fondo) torna in cima al suo strato, dopo il disegno
   (24 novembre 2026, l'utente: «i nomi delle città siano sempre visibili»; i segni fermi sono comunque spostati perché non tocchino i nomi) */
function nomiInCima(p){ var gs=[].slice.call(p.querySelectorAll('.ig-v-luogo,.ig-sc-nome,.ig-nome-cima')); gs.forEach(function(g){ g.parentNode.appendChild(g); });
  /* e i nomi anche sopra i punti delle altre città: il nome passa in un gruppo gemello in fondo allo strato, che copia classe, posizione e stile del luogo */
  gs.forEach(function(g){ if(g.tagName!=='g') return; var ts=[].filter.call(g.childNodes,function(c){ return c.tagName==='text'; }); if(!ts.length) return;
    var g2=g.cloneNode(false); ts.forEach(function(t){ g2.appendChild(t); }); g.parentNode.appendChild(g2);
    function copia(){ ['class','transform','style','opacity'].forEach(function(a){ var v=g.getAttribute(a); if(v==null){ if(g2.hasAttribute(a)) g2.removeAttribute(a); } else if(g2.getAttribute(a)!==v) g2.setAttribute(a,v); }); }
    if(window.MutationObserver) new MutationObserver(copia).observe(g,{attributes:true}); }); }
/* il nome di una rotta (Abd al-Rahman, Carlo…) che tocca il nome o il punto di una città, o esce dalla carta, si sposta lungo la sua linea, a destra o a sinistra,
   finché trova un posto libero; se non lo trova resta dov'era (24 novembre 2026: sul telefono «Carlo» copriva Metz e «Abd al-Rahman» Tolosa) */
function scansaNomi(svg){
  function R(e){ var r=e.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom]; }
  function urta(a,b,m){ return a[0]<b[2]+m&&a[2]>b[0]-m&&a[1]<b[3]+m&&a[3]>b[1]-m; }
  [].forEach.call(svg.querySelectorAll('.ig-rt-nome'),function(t){ var g=t.parentNode, p=g.querySelector('.ig-rt-l'), box=t.closest('.ig-fin')||t.closest('.ig-atto')||svg; if(!p) return;
    var cor=box.querySelector('.ig-m-cornice'), B=cor?R(cor):R(svg), L=lungo(p);
    var ost=[].slice.call(box.querySelectorAll('.ig-v-luogo text,.ig-v-luogo circle,.ig-rt-nome')).filter(function(e){ return e!==t; }).map(R).filter(function(r){ return r[2]-r[0]>0; });
    function libero(){ var r=R(t); return r[0]>=B[0]+4&&r[2]<=B[2]-4&&r[1]>=B[1]+4&&r[3]<=B[3]-4&&!ost.some(function(o){ return urta(r,o,2); }); }
    if(libero()) return;
    var x0=t.getAttribute('x'), y0=t.getAttribute('y'), a0=t.getAttribute('text-anchor'), prove=[];
    [.5,.62,.38,.74,.26,.86,.14,.94].forEach(function(f){ [[9,4,'start'],[-9,4,'end'],[0,-9,'middle'],[0,16,'middle']].forEach(function(s){ prove.push([f,s]); }); });
    for(var i=0;i<prove.length;i++){ var q=puntoA(p,L*prove[i][0]), s=prove[i][1]; t.setAttribute('x',r1(q[0]+s[0])); t.setAttribute('y',r1(q[1]+s[1])); t.setAttribute('text-anchor',s[2]); if(libero()) return; }
    t.setAttribute('x',x0); t.setAttribute('y',y0); t.setAttribute('text-anchor',a0||'middle'); }); }
/* una rotta che si traccia, con la punta che segue la linea; o.schema la fa a trattini (si scopre con una maschera), o.c ne dà il colore */
var NRT=0;
function rotta(par,defs,pts,o){
  o=o||{}; var g=el('g',{'class':'ig-rt'+(o.cl?' '+o.cl:'')},par); if(o.c) g.style.setProperty('--c',o.c);
  var d=pts.length>2?curvaPezzi(pts).join(' '):'M'+xy(pts[0])+' L'+xy(pts[1]);
  var p=el('path',{d:d,'class':'ig-rt-l'+(o.schema?' schema':'')},g), L=lungo(p), r={g:g,p:p,L:L,f:-1};
  if(o.schema){ var id='ig-rtm'+(++NRT), m=el('mask',{id:id,maskUnits:'userSpaceOnUse',x:-3000,y:-3000,width:9000,height:9000},defs);
    r.m=el('path',{d:d,'class':'ig-rt-maschera'},m); r.m.style.strokeDasharray=L+' '+L; r.m.setAttribute('stroke-dashoffset',L); p.setAttribute('mask','url(#'+id+')'); }
  else { p.style.strokeDasharray=L+' '+L; p.setAttribute('stroke-dashoffset',L); }
  r.pu=el('path',{d:'M3 0 L-8 -5.5 L-5.5 0 L-8 5.5 Z','class':'ig-rt-p'},g);
  if(o.nome){ var q=puntoA(p,L*(o.dove==null?.5:o.dove)); r.et=tx(g,q[0]+(o.dx||0),q[1]+(o.dy||0),'ig-rt-nome',o.nome,o.an||'middle'); }
  return r;
}
function segui(r,f){ f=clamp(f,0,1); if(r.f===f) return; r.f=f; cls(r.g,'vis',f>0); fissa(r.m||r.p,'stroke-dashoffset',r1(r.L*(1-f)));
  var a=puntoA(r.p,Math.max(0,r.L*f-4)), b=puntoA(r.p,Math.max(4,r.L*f)); fissa(r.pu,'transform','translate('+xy(b)+') rotate('+r1(Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI)+')');
  cls(r.pu,'vis',f>.04); if(r.et) cls(r.et,'vis',f>=.97); }
/* i segni della carta: scontro, assedio, fuoco */
var FIAMMA='M0 -12c1.2 4.8 7 7 7 13.5a7 7 0 0 1-14 0c0-3.5 1.9-5.4 3.5-7 .4 2.3 1.4 3.5 2.6 3.7C-1.6 -5 -1.1 -8.5 0 -12z';
function segnoCarta(par,tipo,q,s){ s=s||1; var g=el('g',{'class':'ig-sg '+tipo,transform:'translate('+xy(q)+')'},par);
  if(tipo==='scontro'){ el('circle',{r:r1(12*s),'class':'ig-v-lampo'},g); el('path',{d:'M-6.5 -6.5 L6.5 6.5 M6.5 -6.5 L-6.5 6.5','class':'ig-v-spade'},g); }
  else if(tipo==='assedio') el('circle',{r:r1(12*s),'class':'ig-v-anello'},g);
  else { el('circle',{r:r1(11*s),'class':'ig-sg-alone'},g); el('path',{d:FIAMMA,'class':'ig-sg-fiamma',transform:'scale('+s+')'},g); }
  return g; }
/* posizione lungo una fila di tappe [t, x, y]: fra una e l'altra con accelerazione morbida */
/* una macchia chiusa e morbida (colli, nuvole di polvere): raggi un po' irregolari, sempre gli stessi per lo stesso seme */
function macchia(cx,cy,rx,ry,seme,n){ var R=caso(seme), P=[]; n=n||11; for(var i=0;i<n;i++){ var a=i/n*Math.PI*2, f=1+(R()-.5)*.38; P.push([cx+Math.cos(a)*rx*f,cy+Math.sin(a)*ry*f]); }
  var d='M'+xy(P[0]); for(i=0;i<n;i++){ var p0=P[(i-1+n)%n], p1=P[i], p2=P[(i+1)%n], p3=P[(i+2)%n]; d+=' C'+xy([p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6])+' '+xy([p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6])+' '+xy(p2); } return d+'Z'; }
function pista(K,t){ if(t<=K[0][0]) return [K[0][1],K[0][2]]; for(var i=1;i<K.length;i++) if(t<K[i][0]){ var e=E.io((t-K[i-1][0])/((K[i][0]-K[i-1][0])||1)); return [lerp(K[i-1][1],K[i][1],e),lerp(K[i-1][2],K[i][2],e)]; }
  var z=K[K.length-1]; return [z[1],z[2]]; }
/* una citazione con il filo d'oro a sinistra: testo, chi; restituisce l'altezza */
function citazione(p,x,y,w,q,chi,fs){ fs=fs||18; var g=el('g',{'class':'ig-ad-cita'},p), fi=el('rect',{x:r1(x),y:r1(y),width:3,height:10,rx:1.5,'class':'ig-m-cita-filo'},g);
  var t=el('text',{x:r1(x+13),y:r1(y+fs*.95),'class':'ig-m-cita-t'},g); t.style.fontSize=fs+'px'; var n=avvolgi(t,q,w-16,fs*1.18);
  var c=tx(g,x+13,y+fs*.95+(n-1)*fs*1.18+fs*.95,'ig-m-cita-chi',chi); if(largo(c)>w-16){ c.textContent=''; avvolgi(c,chi,w-16,14); }
  var hh=fs*.95+(n-1)*fs*1.18+fs*.95+(c.childNodes.length>1?(c.childNodes.length-1)*14:0)+6; fi.setAttribute('height',r1(hh)); g._h=hh; return g; }
/* tiene una scritta di una riga dentro il riquadro b=[x,y,w,h] (margine m): se esce, la sposta e la allinea a sinistra */
function nelRiquadro(t,b,m){ m=m==null?6:m; var w=largo(t), an=t.getAttribute('text-anchor')||'start', x=+t.getAttribute('x'), x0=an==='middle'?x-w/2:an==='end'?x-w:x;
  var x1=clamp(x0,b[0]+m,b[0]+b[2]-m-w); if(Math.abs(x1-x0)>.5){ t.setAttribute('x',r1(x1)); t.setAttribute('text-anchor','start'); } return t; }
/* passi numerati sotto un disegno (come nei due racconti del segno di ponte Milvio) */
function passi(p,x,y,w,voci,chiaro,cap){ var impila=cap||w/voci.length<150, out=[];
  voci.forEach(function(s,i){ var g=el('g',{'class':'ig-m-passo'+(chiaro?' chiaro':'')},p), xx=impila?x:x+i*w/voci.length, yy=impila?y+i*20:y;
    el('circle',{cx:r1(xx+8),cy:r1(yy-4),r:8,'class':'ig-m-passo-n'},g); tx(g,xx+8,yy,'ig-m-passo-c',String(i+1),'middle'); var t=tx(g,xx+21,yy,'ig-m-passo-t',s);
    if(!impila&&largo(t)>w/voci.length-26){ t.textContent=''; avvolgi(t,s,w/voci.length-26,14); t.setAttribute('y',r1(yy-6)); [].forEach.call(t.childNodes,function(c){ c.setAttribute('x',r1(xx+21)); }); }
    out.push(g); }); return out; }

/* ======================================================================
   11. Adrianopoli (378)
   Aggiunta il 23 novembre 2026. Quattro quadri: dal Danubio ad Adrianopoli sulla carta della pagina; la battaglia del 9 agosto su un campo schematico, ora per ora; le due morti
   di Valente; il conto. Fonte letta: Ammiano Marcellino, Storie XXXI, nella traduzione inglese di Rolfe (LacusCurtius), e il latino dei due passi già annotati in js/dati.js.
   XXXI 4-5 e 7-8 (il passaggio dei Tervingi col permesso di Valente, i Greutungi «on rafts», la rivolta presso Marcianopoli, la Tracia saccheggiata) sono quelli già usati per i passi
   della tappa (PASSI_CARTA[378] in js/dati.js); XXXI 11, 6: Graziano scende il Danubio per venire in aiuto; 12, 3: i Goti a quindici miglia dalla città, «making for the station of Nice»,
   e gli esploratori che «through some mistake or other» li dicono «only ten thousand men»; 12, 7: Valente non aspetta Graziano; 12, 10: all'alba del «fifth before the Ides of August»
   l'esercito parte e lascia «all its baggage and packs near the walls of Hadrianopolis», tesoro e insegne dentro le mura; 12, 11: «after hastening a long distance over rough ground…
   at the eighth hour they saw the wagons of the enemy… arranged in the form of a perfect circle»; la cavalleria dell'ala destra spinta avanti per prima, «the greater part of the infantry
   waited in reserve»; 12, 12: l'ala sinistra che arriva di corsa, «very many of them were still scattered along the roads», e i Goti che chiedono la pace perché Alateo e Safrace sono lontani;
   12, 13: «the broad plains gleamed with fires», la sete, la fame; 12, 15-16: Ricomere che va come ostaggio, gli arcieri di Bacurio e Cassione che attaccano «too eagerly» e si ritirano;
   12, 17: la cavalleria gota di Alateo e Safrace, con gli Alani, «dashed out as a thunderbolt»; 13, 2: «the left wing, which had made its way as far as the very wagons… being deserted by
   the rest of the cavalry… was crushed» e i fanti «ita concatervatis manipulis ut vix mucronem exerere aut manus reducere quisquam posset. nec iam obiectu pulveris caelum patere potuit»;
   13, 7: la fuga; 13, 11: «a night without the bright light of the moon put an end» alla strage; 13, 12: Valente colpito da una freccia «amid the common soldiers as was supposed (for no one
   asserted that he had seen him…)», mai ritrovato; 13, 14-16: «Others say» la casa di contadini «well fortified in its second storey», bruciata, e il soldato della guardia che salta dalla
   finestra e poi racconta; 13, 18-19: Traiano e Sebastiano, trentacinque tribuni, «constatque vix tertiam evasisse exercitus partem. nec ulla annalibus praeter Cannensem pugnam ita ad
   internecionem res legitur gesta». Ammiano non dà numeri dei Romani, distanze né l'orientamento del campo: tutto il campo è uno schema, ed è detto nel disegno. */
var ADRIANOPOLI={ titolo:"Adrianopoli", sotto:"9 agosto 378: l'esercito d'Oriente distrutto e l'imperatore ucciso, secondo Ammiano Marcellino",
  fasi:[["376","I Goti Tervingi passano il Danubio con il permesso di Valente. Poco dopo passano anche i Greutungi, su zattere e senza permesso. Dove passarono, le fonti non lo dicono."],
    ["377","Affamati e maltrattati dai funzionari romani, i Goti si ribellano vicino a Marcianopoli e saccheggiano la Tracia."],
    ["378","Valente marcia verso Adrianopoli. I Goti, da Cabile, vanno verso la stazione di Nice. Graziano, il nipote, scende il Danubio per venire in aiuto."],
    ["378","Gli esploratori dicono a Valente che i Goti sono soltanto diecimila. Secondo Ammiano era un errore. Valente decide di attaccare senza aspettare Graziano."],
    ["9 agosto","All'alba l'esercito parte in gran fretta. Bagagli, tesoro e insegne restano ad Adrianopoli. Dopo una lunga marcia su un terreno accidentato, all'ottava ora appaiono i carri dei Goti, disposti in un cerchio perfetto."],
    ["9 agosto","La cavalleria dell'ala destra si schiera per prima; gran parte dei fanti aspetta dietro. L'ala sinistra arriva di corsa: molti cavalieri sono ancora sparsi lungo le strade."],
    ["9 agosto","I Goti chiedono la pace e prendono tempo. Accendono fuochi nella pianura. I Romani, affamati, soffrono il caldo e la sete."],
    ["9 agosto","Ricomere sta per andare dai Goti come ostaggio, quando gli arcieri di Bacurio e Cassione attaccano troppo presto e si ritirano. Torna la cavalleria gota di Alateo e Safrace, con gli Alani: piomba sui Romani «come un fulmine»."],
    ["9 agosto","L'ala sinistra arriva fino ai carri, ma il resto della cavalleria la lascia sola, ed è travolta. I fanti restano scoperti, così ammassati che a stento si poteva sguainare la spada o ritirare il braccio."],
    ["9 agosto","Per la polvere non si vede più il cielo; le frecce arrivano da ogni parte. Alla fine la linea romana si spezza e i soldati fuggono come possono. Una notte senza luna mette fine alla strage."],
    ["Ammiano","Come morì Valente? Secondo una versione, al calare del buio, fra i soldati semplici, fu colpito da una freccia. Ma nessuno disse di averlo visto, e il corpo non fu mai trovato."],
    ["Altri dicono","Ferito, fu portato in una casa di contadini a due piani. I Goti, senza sapere chi fosse, la circondarono e le diedero fuoco. Uno della guardia saltò da una finestra: fu lui, più tardi, a raccontarlo."],
    ["Il conto","Morirono anche i generali Traiano e Sebastiano e trentacinque tribuni. Secondo Ammiano si salvò appena un terzo dell'esercito: negli annali una disfatta così si legge solo per Canne."]],
  fonte:"Ammiano Marcellino, Storie XXXI 4-13, nella traduzione inglese di Rolfe (LacusCurtius); i passi dei fanti ammassati e del terzo dell'esercito anche nel latino. Ammiano scrive a Roma verso il 390 e non assistette alla battaglia. La carta è quella della pagina: il punto in cui i Goti passarono il Danubio non è noto e le linee sono uno schema. Il campo di battaglia è un disegno schematico: Ammiano non dà distanze, numeri dei Romani né l'orientamento dello schieramento, e non dice da dove arrivasse la cavalleria di Alateo e Safrace. Le due morti di Valente sono le due versioni che riferisce Ammiano; i disegni sono indicativi." };
function disegnaAdrianopoli(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G||!G.citta) return;
  var oriz=W/H>=1.15, stretto=oriz&&W<700, pad=oriz?20:12, defs=el('defs',null,svg), i, j;
  var T={a1:1400,a2:7000,a3:12200,a4:17600,b1:23400,b2:29400,b3:35000,b4:40600,b5:47400,b6:54400,c1:61400,c2:67400,d1:74400}; T.fin=T.d1+9000;
  grad(defs,'ig-ad-suolo',[[0,'#F4E7C6'],[1,'#E3CC98']]);
  grad(defs,'ig-ad-colle',[[0,'#D9BE86',.9],[1,'#D9BE86',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-ad-caldo',[[0,'#F08A2E',.55],[1,'#F08A2E',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-ad-polvere',[[0,'#A8936F',.95],[.55,'#B9A27C',.7],[1,'#C4AD86',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-ad-notte',[[0,'#0E1424'],[1,'#25304A']]);
  grad(defs,'ig-ad-fiamme',[[0,'#2A1710'],[.55,'#4A2416'],[1,'#8A3A16']]);
  grad(defs,'ig-ad-vampa',[[0,'#FFD27A',.9],[.5,'#F08A2E',.45],[1,'#F08A2E',0]],{cx:'50%',cy:'50%',r:'50%'});

  /* ---------- A. dal Danubio ad Adrianopoli ---------- */
  var gA=el('g',{'class':'ig-atto'},svg), V=[600,197,182,161], mb;
  if(oriz){ var mh=H-2*pad, mw=mh*V[2]/V[3]; if(mw>W*(stretto?.58:.56)){ mw=W*(stretto?.58:.56); mh=mw*V[3]/V[2]; } mb=[W-pad-mw,(H-mh)/2,mw,mh]; }
  else { var mw2=W-2*pad, mh2=Math.min(mw2*V[3]/V[2],H*.6); mw2=mh2*V[2]/V[3]; mb=[(W-mw2)/2,pad,mw2,mh2]; }
  var F=finestra(gA,defs,'ig-ad-clipA',V,mb,{stati:statiDi(378)}), sA=F.sopra, MP=F.M;
  var DN=F.C('dnestr'), DU=F.C('durostoro'), MA=F.C('marcianopoli'), CB=F.C('cabile'), AD=F.C('adrianopoli'), CO=F.C('costantinopoli'); if(!DN||!DU||!MA||!CB||!AD||!CO) return;
  var tDa=tx(sA,MP([643,281])[0],MP([643,281])[1],'ig-ad-fiume','Danubio','middle'), tPE=tx(sA,MP([760,300])[0],MP([760,300])[1],'ig-ad-mare','Ponto Eusino','middle');
  var zona=el('g',{'class':'ig-f'},sA); el('ellipse',{cx:r1(DU[0]),cy:r1(DU[1]),rx:r1(16*F.k),ry:r1(5.5*F.k),'class':'ig-ad-zona'},zona);
  var tZ=tx(zona,DU[0]+16*F.k+5,DU[1]+16,'ig-ad-zona-t','dove? non è detto','start');
  var rT=rotta(sA,defs,[MP([723.4,221.6]),MP([716,252]),MP([703,280])],{c:'#3B2F26',nome:'Tervingi',dove:.45,dx:-8,an:'end'});
  var rGr=rotta(sA,defs,[MP([741,228]),MP([731,258]),MP([712,284])],{c:'#3B2F26',schema:true,nome:'Greutungi',dove:.4,dx:8,an:'start'});
  var rR=rotta(sA,defs,[MP([701,288]),MA,MP([700,312]),MP([693,316])],{c:'#3B2F26',nome:'i Goti in rivolta',dove:.62,dx:-9,an:'end'});
  var rV=rotta(sA,defs,[MP([735,344]),MP([716,349]),MP([700,341])],{c:'#9A2F2A',nome:'Valente',dove:.5,dy:-9});
  var rN=rotta(sA,defs,[MP([692.5,321]),MP([695,333])],{c:'#3B2F26',schema:true,nome:'verso Nice',dove:.75,dx:8,an:'start'});
  var rGz=rotta(sA,defs,[MP([601,262]),MP([618,264]),MP([630,262])],{c:'#9A2F2A',schema:true,nome:'Graziano',dove:.4,dy:-9});
  var sMA=segnoCarta(sA,'scontro',MA,.85), onda=el('circle',{cx:r1(AD[0]),cy:r1(AD[1]),r:9,'class':'ig-m-onda'},sA);
  var pDU=luogo(sA,DU,'Durostoro',8,-7,'start','tenue'), pMA=luogo(sA,MA,'Marcianopoli',13,4,'start'), pCB=luogo(sA,CB,'Cabile',-8,4,'end'), pAD=luogo(sA,AD,'Adrianopoli',-9,15,'end','grande roma'), pCO=luogo(sA,CO,'Costantinopoli',-6,17,'end');
  var avvA=el('text',{x:r1(mb[0]+10),y:r1(mb[1]+18),'class':'ig-m-avverte su-carta'},gA); avvA.textContent='le linee sono uno schema: le strade non sono scritte'; if(largo(avvA)>mb[2]-20) avvA.textContent='le linee sono uno schema';
  /* il registro accanto: tre anni e il numero degli esploratori */
  var lb=oriz?[pad+4,pad,mb[0]-pad-34,H-2*pad]:[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-4];
  var REG=[{a:'376',n:'Il Danubio',s:'i Tervingi passano con il permesso; i Greutungi senza',t:T.a1},{a:'377',n:'La rivolta',s:'presso Marcianopoli; la Tracia è saccheggiata',t:T.a2},{a:'378',n:'Adrianopoli',s:'Valente non aspetta Graziano',t:T.a3}];
  var gR=el('g',{'class':'ig-ad-reg'},gA), righe=[], modo=lb[2]>=300&&lb[3]>=300?'righe':'scheda', sch=null, gNum, cNum;
  if(modo==='righe'){
    var y0=lb[1]+Math.max(0,(lb[3]-330)/2);
    tx(gR,lb[0],y0+12,'ig-m-testata','DAL DANUBIO AD ADRIANOPOLI'); tx(gR,lb[0],y0+31,'ig-m-sotto','Ammiano Marcellino, Storie XXXI 4-12');
    REG.forEach(function(r,ii){ var y=y0+58+ii*58, g=el('g',{'class':'ig-ad-riga'},el('g',{transform:'translate(0,'+r1(y)+')'},gR));
      tx(g,lb[0],24,'ig-ad-anno',r.a); tx(g,lb[0]+78,13,'ig-ad-rn',r.n); var s=el('text',{x:r1(lb[0]+78),y:32,'class':'ig-ad-rs'},g); avvolgi(s,r.s,lb[2]-80,16);
      el('line',{x1:r1(lb[0]),x2:r1(lb[0]+lb[2]),y1:50,y2:50,'class':'ig-m-filo'},g); righe.push(g); });
    gNum=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(y0+242)+')'},gR)); cNum=tx(gNum,lb[0],34,'ig-ad-num-n','0');
    var nl=el('text',{x:r1(lb[0]+150),y:12,'class':'ig-ad-num-t'},gNum); avvolgi(nl,'i Goti visti dagli esploratori. «Per qualche errore», scrive Ammiano: erano molti di più.',lb[2]-150,16);
  } else {
    sch={g:el('g',{'class':'ig-ad-scheda'},gR)}; var sx=lb[0], sy=lb[1]+(oriz?6:0);
    sch.a=tx(sch.g,sx,sy+26,'ig-ad-anno',''); sch.n=tx(sch.g,sx+(oriz?0:74),sy+(oriz?50:12),'ig-ad-rn',''); sch.s=el('text',{x:r1(sx+(oriz?0:74)),y:r1(sy+(oriz?70:31)),'class':'ig-ad-rs'},sch.g); sch.w=lb[2]-(oriz?0:76);
    gNum=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(oriz?sy+lb[3]-92:sy+Math.min(lb[3]-46,72))+')'},gR)); cNum=tx(gNum,sx,34,'ig-ad-num-n','0');
    var nl2=el('text',{x:r1(sx+(oriz?0:136)),y:r1(oriz?56:12),'class':'ig-ad-num-t'},gNum); avvolgi(nl2,'i Goti secondo gli esploratori: «per qualche errore»',oriz?lb[2]:lb[2]-136,15);
  }

  /* ---------- B. il 9 agosto, sul campo (schema) ---------- */
  var gB=el('g',{'class':'ig-atto'},svg), FW=100, FH=62, fb, sb=null;
  if(oriz&&!stretto){ var fh=H-2*pad, fw=fh*FW/FH; if(fw>W*.64){ fw=W*.64; fh=fw*FH/FW; } fb=[pad,(H-fh)/2,fw,fh]; sb=[pad+fw+28,pad+4,W-(pad+fw+28)-pad,H-2*pad-4]; }
  else if(stretto){ var fw2=Math.min(W-2*pad,(H-2*pad)*FW/FH); fb=[(W-fw2)/2,(H-fw2*FH/FW)/2,fw2,fw2*FH/FW]; }
  else { var fw3=W-2*pad; fb=[pad,pad,fw3,fw3*FH/FW]; sb=[pad,fb[1]+fb[3]+14,W-2*pad,H-(fb[1]+fb[3]+14)-6]; }
  var ku=fb[2]/FW; function Fp(x,y){ return [fb[0]+x*ku, fb[1]+y*ku]; }
  var cpB=el('clipPath',{id:'ig-ad-clipB'},defs); el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),rx:12},cpB);
  var campo=el('g',{'clip-path':'url(#ig-ad-clipB)'},gB);
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),fill:'url(#ig-ad-suolo)'},campo);
  var pz=el('pattern',{id:'ig-ad-erba',width:9,height:7,patternUnits:'userSpaceOnUse'},defs); el('path',{d:'M1 6 l1.4 -3.2 M4.5 6.5 l-.8 -3 M7 5.5 l1.2 -2.6',stroke:'rgba(140,110,60,.2)','stroke-width':.8,fill:'none'},pz);
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),fill:'url(#ig-ad-erba)'},campo);
  /* i colli e il terreno accidentato della marcia */
  [[24,16,14,7.5],[34,51,13,6],[14,55,10,5],[44,8,11,5],[91,55,13,6.5],[93,8,10,5.5],[30,30,6,3]].forEach(function(c,ii){ var q=Fp(c[0],c[1]);
    el('path',{d:macchia(q[0],q[1],c[2]*ku*1.15,c[3]*ku*1.15,40+ii),fill:'url(#ig-ad-colle)'},campo);
    for(var l=0;l<3;l++) el('path',{d:macchia(q[0]+l*.5*ku,q[1]-l*.35*ku,c[2]*ku*(.92-l*.26),c[3]*ku*(.92-l*.26),70+ii*5+l),'class':'ig-ad-quota'},campo); });
  var STR=[[12,39],[19,35.5],[27,37],[35,33.5],[43,31.5],[50,31]].map(function(p){ return Fp(p[0],p[1]); }), strD=curvaPezzi(STR).join(' ');
  el('path',{d:strD,'class':'ig-ad-strada-b','stroke-width':r1(Math.max(3,1.3*ku))},campo); el('path',{d:strD,'class':'ig-ad-strada','stroke-width':r1(Math.max(1.4,.55*ku))},campo);
  var colonna=el('path',{d:strD,'class':'ig-ad-colonna','stroke-width':r1(Math.max(2.4,.9*ku))},campo); colonna.style.strokeDasharray=r1(1.2*ku)+' '+r1(.9*ku);
  /* Adrianopoli, con i bagagli sotto le mura */
  var cA=Fp(7,40), muraA=[]; for(i=0;i<9;i++){ var an=i/9*Math.PI*2+.3, rr=(i%2?4.4:5)*ku; muraA.push([cA[0]+Math.cos(an)*rr,cA[1]+Math.sin(an)*rr*.86]); }
  el('path',{d:'M'+muraA.map(xy).join('L')+'Z','class':'ig-ad-citta'},campo);
  for(i=0;i<7;i++) el('rect',{x:r1(cA[0]+(i%3-1.4)*1.8*ku),y:r1(cA[1]+(Math.floor(i/3)-1.2)*1.7*ku),width:r1(1.2*ku),height:r1(.9*ku),'class':'ig-ad-casa'},campo);
  var tAd=tx(campo,cA[0]-4.6*ku,cA[1]-5.6*ku,'ig-ad-et forte','Adrianopoli','start');
  var gBag=el('g',{'class':'ig-f'},campo); for(i=0;i<5;i++) el('rect',{x:r1(cA[0]+5*ku+(i%3)*1.3*ku),y:r1(cA[1]+1.5*ku+Math.floor(i/3)*1.1*ku),width:r1(1.1*ku),height:r1(.8*ku),rx:1,'class':'ig-ad-bagaglio'},gBag);
  var tBag=tx(gBag,cA[0]+4.6*ku,cA[1]+6.6*ku,'ig-ad-et','bagagli, tesoro, insegne','start');
  /* il cerchio dei carri */
  var C0=[80,31], RC=11, carri=[], gC=el('g',null,campo);
  var interno=el('g',{'class':'ig-f'},gC), Rg=caso(378); for(i=0;i<46;i++){ var aa=Rg()*Math.PI*2, dd=Math.sqrt(Rg())*RC*.78, q=Fp(C0[0]+Math.cos(aa)*dd,C0[1]+Math.sin(aa)*dd); el('circle',{cx:r1(q[0]),cy:r1(q[1]),r:r1(Math.max(1.1,.4*ku)),'class':'ig-ad-goto'},interno); }
  for(i=0;i<34;i++){ var a2=i/34*Math.PI*2, q2=Fp(C0[0]+Math.cos(a2)*RC,C0[1]+Math.sin(a2)*RC), g=el('g',{'class':'ig-ad-carro',transform:'translate('+xy(q2)+') rotate('+r1(a2*180/Math.PI+90)+')'},gC);
    el('rect',{x:r1(-1.05*ku),y:r1(-.5*ku),width:r1(2.1*ku),height:r1(1*ku),rx:r1(.2*ku),'class':'ig-ad-cassa'},g);
    [-.7,.7].forEach(function(s){ el('circle',{cx:r1(s*ku),cy:r1(.62*ku),r:r1(.36*ku),'class':'ig-ad-ruota'},g); }); carri.push(g); }
  var tCarri=tx(campo,Fp(C0[0],C0[1]-RC-2.2)[0],Fp(C0[0],C0[1]-RC-2.2)[1],'ig-ad-et ig-ad-tag','i carri dei Goti, in cerchio','middle');
  if(fb[2]<480){ var xr=fb[0]+fb[2]-6, yr=Fp(0,C0[1]-RC-2.2)[1]; tCarri.textContent=''; tCarri.setAttribute('text-anchor','end'); tCarri.setAttribute('x',r1(xr)); tCarri.setAttribute('y',r1(yr-14));
    el('tspan',{x:r1(xr)},tCarri).textContent='i carri dei Goti,'; el('tspan',{x:r1(xr),dy:14},tCarri).textContent='in cerchio'; }      // sul telefono: a capo, a destra sopra il cerchio, lontano dalle frecce dell'ala sinistra
  /* i fuochi della pianura e il caldo */
  var caldo=el('ellipse',{cx:r1(Fp(60,31)[0]),cy:r1(Fp(60,31)[1]),rx:r1(46*ku),ry:r1(34*ku),fill:'url(#ig-ad-caldo)','class':'ig-ad-caldo'},campo);
  var fuochi=[[63,25],[67,35.5],[59,7],[69,47],[71,11],[56,54],[73,41],[66,21],[61,58],[74,52]].map(function(p,ii){ var q=Fp(p[0],p[1]), g=el('g',{'class':'ig-ad-fuoco',transform:'translate('+xy(q)+')'},campo), s=Math.max(.45,ku*.11);
    el('circle',{r:r1(9*s),'class':'ig-sg-alone'},g);
    for(var k=0;k<3;k++){ var f=el('circle',{cx:0,cy:r1(-8*s),r:r1(4.5*s),'class':'ig-ad-fumo'},g); f.style.animationDelay=(-(ii*.37+k*.9)).toFixed(2)+'s'; }
    el('path',{d:FIAMMA,transform:'scale('+r1(s*.75*100)/100+')','class':'ig-ad-fiamma'},g); return g; });
  var tFuochi=tx(campo,Fp(74,5)[0],Fp(74,5)[1]+4,'ig-ad-et ig-ad-tag','fuochi nella pianura','start');
  /* i reparti */
  function reparto(tipo,cl){ var g=el('g',{'class':'ig-ad-u '+cl},campo);
    if(tipo==='f') el('rect',{x:r1(-1.6*ku),y:r1(-1.05*ku),width:r1(3.2*ku),height:r1(2.1*ku),rx:r1(.3*ku)},g);
    else el('path',{d:'M'+r1(1.8*ku)+' 0 L'+r1(-1.4*ku)+' '+r1(-1.2*ku)+' L'+r1(-.75*ku)+' 0 L'+r1(-1.4*ku)+' '+r1(1.2*ku)+' Z'},g); return g; }
  function metti(g,p,ang){ fissa(g,'transform','translate('+xy(Fp(p[0],p[1]))+')'+(ang?' rotate('+r1(ang)+')':'')); }
  var fanti=[], destra=[], sinistra=[], goticav=[], gotifanti=[], frecce=[], fuga=[];
  for(i=0;i<2;i++) for(j=0;j<5;j++) fanti.push({g:reparto('f','roma'),b:[49.5+i*4.2,23+j*4.1]});
  [[62,43.5],[65.6,45.6],[62,47.8],[65.6,49.9]].forEach(function(p){ destra.push({g:reparto('c','roma'),b:p}); });
  [[24,34.5],[30,36.3],[36,33],[41,31.4],[45.5,31.2]].forEach(function(p,ii){ sinistra.push({g:reparto('c','roma'),a:p,b:[[61.5,13],[65,15.2],[61.5,17.4],[65,19.6],[58,15.4]][ii],k:ii}); });
  for(i=0;i<8;i++) goticav.push({g:reparto('c','goti cav'),k:i});
  [[61.5,21.5],[63.2,25.6],[63.8,30],[63.8,34.4],[63.2,38.6],[61,42.3],[56.5,19.2],[51,19],[55.5,43.4]].forEach(function(p,ii){ gotifanti.push({g:reparto('f','goti'),a:[71.5,24+ii*1.7],b:p}); });
  var inviato=el('circle',{r:r1(Math.max(2,.6*ku)),'class':'ig-ad-inviato'},campo), ricomere=el('circle',{r:r1(Math.max(2.3,.7*ku)),'class':'ig-ad-ricomere'},campo);
  var arcieri=[]; for(i=0;i<6;i++) arcieri.push({c:el('circle',{r:r1(Math.max(1.4,.45*ku)),'class':'ig-ad-arciere'},campo),o:[(i%3)*1.1,Math.floor(i/3)*1.2]});
  var Rf=caso(13); for(i=0;i<34;i++){ var fq=Fp(44+Rf()*24,16+Rf()*32), ang=200+Rf()*50, l=Math.max(5,1.6*ku), fl=el('line',{x1:r1(fq[0]),y1:r1(fq[1]),x2:r1(fq[0]+Math.cos(ang*Math.PI/180)*l),y2:r1(fq[1]+Math.sin(ang*Math.PI/180)*l),'class':'ig-ad-freccia'},campo); fl.style.animationDelay=(-Rf()*1.6).toFixed(2)+'s'; frecce.push(fl); }
  var polveri=[[55,30,24,15],[46,21,16,10],[61,41,18,11],[50,38,14,9],[66,25,15,10],[40,32,12,8]].map(function(p){ var q=Fp(p[0],p[1]); return {e:el('ellipse',{cx:r1(q[0]),cy:r1(q[1]),rx:r1(p[2]*ku),ry:r1(p[3]*ku),fill:'url(#ig-ad-polvere)','class':'ig-ad-polvere',opacity:0},campo),dx:p[2]*.18}; });
  for(i=0;i<70;i++){ var a0=[50+Rf()*8,22+Rf()*19], b0=[8+Rf()*34,6+Rf()*52]; fuga.push({c:el('circle',{r:r1(Math.max(1.3,.42*ku)),'class':'ig-ad-fuggiasco'},campo),a:a0,b:b0,t0:T.b6+2600+Rf()*1800,d:1600+Rf()*1400}); }
  var notte=el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),'class':'ig-ad-buio',opacity:0},campo);
  /* le etichette del campo, ciascuna nel suo momento */
  function etichetta(x,y,s,an,cl){ var q=Fp(x,y); return tx(campo,q[0],q[1],'ig-ad-et ig-ad-tag'+(cl?' '+cl:''),s,an||'middle'); }
  var E1=etichetta(66.5,55.6,'ala destra','middle'), E2=etichetta(61,10,'ala sinistra','middle'), E3=etichetta(48,47.5,'fanti','middle'), E4=etichetta(64,28.2,'inviati: chiedono la pace','middle','piccola'),
    E5=etichetta(64.5,26,'Ricomere, ostaggio','start','piccola'), E6=etichetta(68,39.6,'arcieri di Bacurio e Cassione','start','piccola'), E7=etichetta(84,3.6,'Alateo e Safrace, con gli Alani','end','scuro'),
    E8=etichetta(71,15.8,'fino ai carri','start','scuro'), E9=etichetta(54,25,'ammassati','middle','scuro'), E10=etichetta(50,58.5,'notte senza luna','middle','notte');
  [tAd,tBag,tFuochi,E1,E2,E3,E4,E5,E6,E7,E8,E9,E10].concat(fb[2]<480?[]:[tCarri]).forEach(function(t){ nelRiquadro(t,fb); });      // prima «fuochi nella pianura» usciva a destra
  /* la lente: i fanti stretti (schema) */
  var LC=Fp(29,14.5), LR=Math.max(40,13*ku), gLe=el('g',{'class':'ig-ad-lente'},gB), cpL=el('clipPath',{id:'ig-ad-clipL'},defs); el('circle',{cx:r1(LC[0]),cy:r1(LC[1]),r:r1(LR)},cpL);
  el('circle',{cx:r1(LC[0]),cy:r1(LC[1]),r:r1(LR+3),'class':'ig-ad-lente-bordo'},gLe); var dentroL=el('g',{'clip-path':'url(#ig-ad-clipL)'},gLe);
  el('circle',{cx:r1(LC[0]),cy:r1(LC[1]),r:r1(LR),'class':'ig-ad-lente-fondo'},dentroL); var omL=[];
  for(i=0;i<6;i++) for(j=0;j<9;j++) omL.push({o:omino(dentroL,LR*.34,'roma vis'),i:j-4,j:i-2.5});
  var tLe=tx(gLe,LC[0]+LR*.8,LC[1]+LR*.8+8,'ig-ad-et','schema','start');
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),rx:12,'class':'ig-m-cornice'},gB);
  var tSch=tx(gB,fb[0]+fb[2]-10,fb[1]+fb[3]-9,'ig-m-schema','schema: posizioni e distanze non sono nelle fonti','end'); if(largo(tSch)>fb[2]-20) tSch.textContent='schema';
  /* il pannello: la data, l'ora, la legenda, le parole di Ammiano */
  var gP=el('g',{'class':'ig-ad-pann'},gB), ora=null, quote=[], legY;
  function voce(x,y,cl,tipo,s){ var g=el('g',{'class':'ig-ad-leg'},gP); if(tipo==='f') el('rect',{x:x,y:y-9,width:14,height:9,rx:1.5,'class':'ig-ad-u vis '+cl},g); else el('path',{d:'M'+(x+15)+' '+(y-4.5)+' L'+x+' '+(y-10)+' L'+(x+3)+' '+(y-4.5)+' L'+x+' '+(y+1)+' Z','class':'ig-ad-u vis '+cl},g);
    tx(g,x+21,y,'ig-m-leg-t',s); return g; }
  if(sb){
    var dD=tx(gP,sb[0],sb[1]+(oriz?24:20),'ig-m-data','9 AGOSTO 378'); dD.style.fontSize=(oriz?30:22)+'px'; while(largo(dD)>sb[2]&&parseFloat(dD.style.fontSize)>15) dD.style.fontSize=(parseFloat(dD.style.fontSize)-1)+'px';
    var oy=sb[1]+(oriz?46:34), ow=Math.min(sb[2],oriz?sb[2]:sb[2]);
    ora={g:el('g',{'class':'ig-ad-ora'},gP)}; el('line',{x1:r1(sb[0]+6),x2:r1(sb[0]+ow-6),y1:r1(oy+12),y2:r1(oy+12),'class':'ig-ad-ora-l'},ora.g);
    ora.tac=[['alba',0],['mezzogiorno',.42],['ottava ora',.66],['notte',1]].map(function(q){ var x=sb[0]+6+q[1]*(ow-12); el('line',{x1:r1(x),x2:r1(x),y1:r1(oy+8),y2:r1(oy+16),'class':'ig-ad-ora-l'},ora.g);
      return tx(ora.g,x,oy+31,'ig-ad-ora-t',q[0],q[1]===0?'start':q[1]===1?'end':'middle'); });
    ora.sole=el('g',{'class':'ig-ad-sole'},ora.g); for(i=0;i<8;i++){ var ar=i/8*Math.PI*2; el('line',{x1:r1(Math.cos(ar)*9),y1:r1(Math.sin(ar)*9),x2:r1(Math.cos(ar)*13),y2:r1(Math.sin(ar)*13)},ora.sole); } el('circle',{r:6.5},ora.sole);
    ora.x0=sb[0]+6; ora.w=ow-12; ora.y=oy+12;
    legY=oy+(oriz?62:52); var lw=Math.min(150,sb[2]/2);
    voce(sb[0],legY,'roma','f','fanti romani'); voce(sb[0]+lw,legY,'roma','c','cavalieri romani'); voce(sb[0],legY+19,'goti','f','Goti'); voce(sb[0]+lw,legY+19,'goti cav','c','cavalieri goti');
    var qy=legY+(oriz?46:34), qw=sb[2], qh=sb[1]+sb[3]-qy, fsq=oriz?(qw>=320?22:18):16;
    [["«i carri… disposti in un cerchio perfetto»","Ammiano XXXI 12, 11",T.b1+5200],["«la pianura brillava di fuochi»","Ammiano XXXI 12, 13",T.b3+800],["«come un fulmine»","Ammiano XXXI 12, 17: la cavalleria gota",T.b4+2600],
     ["«così ammassati che a stento qualcuno poteva sguainare la spada o ritirare il braccio»","Ammiano XXXI 13, 2 · ita concatervatis manipulis ut vix mucronem exerere aut manus reducere quisquam posset",T.b5+2600],
     ["«per la polvere non si riusciva più a vedere il cielo»","Ammiano XXXI 13, 2",T.b6],["«una notte senza luna mise fine alla strage»","Ammiano XXXI 13, 11",T.b6+4200]].forEach(function(d){
      var c=citazione(gP,sb[0],qy,qw,d[0],d[1],fsq); if(c._h>qh){ c.remove(); c=citazione(gP,sb[0],qy,qw,d[0],d[1].split(' · ')[0],fsq-2); } if(c._h>qh+4){ c.remove(); return; } quote.push({g:c,t:d[2]}); });
  } else {
    var box=el('g',{'class':'ig-ad-sovr'},gP), dS=tx(box,fb[0]+12,fb[1]+22,'ig-m-data','9 AGOSTO 378'); dS.style.fontSize='17px'; var bw2=largo(dS)+24;
    ora={g:box,solo:tx(box,fb[0]+12,fb[1]+40,'ig-ad-ora-t','alba')}; el('rect',{x:r1(fb[0]+4),y:r1(fb[1]+5),width:r1(Math.max(bw2,120)),height:44,rx:8,'class':'ig-m-sovr'},box).parentNode.insertBefore(box.lastChild,box.firstChild);
  }

  /* ---------- C. le due morti di Valente ---------- */
  var gCm=el('g',{'class':'ig-atto'},svg), rS=[pad,pad,W-2*pad,H-2*pad], aff=rS[2]>=rS[3]*1.25, cw=aff?(rS[2]-16)/2:rS[2], ch=aff?rS[3]:(rS[3]-14)/2;
  function scheda(x,y,w,h,tipo){
    var g=el('g',{'class':'ig-m-carta ig-ad-carta '+tipo},gCm), primo=tipo==='freccia', o={g:g};
    el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(h),rx:14,fill:primo?'url(#ig-ad-notte)':'url(#ig-ad-fiamme)','class':'ig-m-carta-fondo'},g);
    var cp=el('clipPath',{id:'ig-ad-cc'+tipo},defs); el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(h),rx:14},cp); var art=el('g',{'clip-path':'url(#ig-ad-cc'+tipo+')'},g);
    tx(g,x+16,y+26,'ig-m-c-tit',primo?'UNA VERSIONE':'ALTRI DICONO'); var so=tx(g,x+16,y+43,'ig-m-c-sot',primo?'Ammiano XXXI 13, 12':'Ammiano XXXI 13, 14-16');
    var voci=primo?['una freccia, al buio','il corpo non si trovò']:['una casa a due piani','i Goti le danno fuoco','uno si salta giù e racconterà'];
    voci=primo?voci:['una casa a due piani','i Goti le danno fuoco','uno salta giù: racconterà'];
    var impila=(w-32)/voci.length<175, foot=impila?voci.length*20+16:36, ax=x+16, ay=y+54, aw=w-32, ah=h-54-foot;
    o.passi=passi(g,x+16,y+h-foot+(impila?14:20),w-32,voci,true,impila);
    var suolo=ay+ah*.84;
    if(primo){
      el('path',{d:'M'+r1(x)+' '+r1(suolo)+' Q'+r1(x+w*.3)+' '+r1(suolo-ah*.05)+' '+r1(x+w*.55)+' '+r1(suolo+2)+' T'+r1(x+w)+' '+r1(suolo-3)+' V'+r1(y+h)+' H'+r1(x)+' Z','class':'ig-ad-c-suolo'},art);
      var Rs=caso(9), hu=Math.max(16,ah*.2), sold=[];
      for(var q=0;q<11;q++){ var sx=ax+aw*(.05+q*.09)+(Rs()-.5)*10; if(Math.abs(sx-(ax+aw*.58))<aw*.05) continue; var gi=Rs()<.35, om=omino(art,hu*(.75+Rs()*.3),'vis ig-ad-ombra');
        om.setAttribute('transform','translate('+r1(sx)+','+r1(suolo+2+Rs()*6)+')'+(gi?' rotate('+r1(70+Rs()*25)+')':'')); sold.push(om); }
      var vx=ax+aw*.58, vy=suolo+3; o.val=el('g',{transform:'translate('+r1(vx)+','+r1(vy)+')'},art); o.valI=el('g',{'class':'ig-ad-valente'},o.val); omino(o.valI,hu*1.05,'vis porpora');
      o.vT=tx(art,vx,vy-hu*1.25,'ig-ad-c-et','Valente?','middle');
      var p0=[ax+aw*.04,ay+ah*.06], p1=[vx-hu*.05,vy-hu*.7]; o.fr=el('path',{d:'M'+xy(p0)+' Q'+xy([lerp(p0[0],p1[0],.55),p0[1]-ah*.02])+' '+xy(p1),'class':'ig-ad-scia'},art); scopri(o.fr);
      o.fp=el('path',{d:'M3 0 L-6 -3.5 L-4 0 L-6 3.5 Z','class':'ig-ad-punta'},art);
      o.perso=el('g',{'class':'ig-ad-perso',transform:'translate('+r1(vx)+','+r1(vy)+') rotate(-82)'},art); omino(o.perso,hu*1.05,'vis');
      for(q=0;q<16;q++){ var lx=ax+Rs()*aw, ly=suolo+4+Rs()*(y+h-foot-suolo-8), la=(Rs()<.5?-1:1)*(18+Rs()*30), ll=hu*(.45+Rs()*.5); el('line',{x1:r1(lx),y1:r1(ly),x2:r1(lx+Math.sin(la*Math.PI/180)*ll),y2:r1(ly-Math.cos(la*Math.PI/180)*ll),'class':'ig-ad-asta'},art); }
      if(w>=300) tx(art,x+w-16,y+26,'ig-ad-c-nota-r','notte senza luna','end');
      o.nota=el('text',{x:r1(x+16),y:r1(ay+ah*.2),'class':'ig-ad-c-nota'},art); avvolgi(o.nota,'«nessuno disse di averlo visto»',Math.min(aw*.5,230),16);
      o.nota.setAttribute('x',r1(x+w-16)); o.nota.setAttribute('text-anchor','end'); [].forEach.call(o.nota.childNodes,function(c){ c.setAttribute('x',r1(x+w-16)); }); o.nota.setAttribute('y',r1(ay+ah*.42));
    } else {
      el('rect',{x:r1(x),y:r1(suolo),width:r1(w),height:r1(y+h-suolo),'class':'ig-ad-c-suolo caldo'},art);
      var hw=Math.min(aw*.4,ah*.95), hs=hw*.36, hx=ax+aw*.5-hw/2, top=suolo-2*hs;
      o.vampa=el('ellipse',{cx:r1(hx+hw/2),cy:r1(suolo-hs*.6),rx:r1(hw*1.1),ry:r1(hs*1.9),fill:'url(#ig-ad-vampa)','class':'ig-ad-vampa',opacity:0},art);
      o.casa=el('g',{'class':'ig-ad-casa2'},art);
      el('rect',{x:r1(hx),y:r1(top+hs),width:r1(hw),height:r1(hs),'class':'ig-ad-muro'},o.casa); el('rect',{x:r1(hx+hw*.04),y:r1(top),width:r1(hw*.92),height:r1(hs),'class':'ig-ad-muro alto'},o.casa);
      el('path',{d:'M'+r1(hx-hw*.06)+' '+r1(top)+' L'+r1(hx+hw/2)+' '+r1(top-hs*.7)+' L'+r1(hx+hw*1.06)+' '+r1(top)+' Z','class':'ig-ad-tetto'},o.casa);
      el('rect',{x:r1(hx+hw*.43),y:r1(top+hs*1.35),width:r1(hw*.14),height:r1(hs*.65),'class':'ig-ad-porta'},o.casa);
      el('rect',{x:r1(hx+hw*.14),y:r1(top+hs*.28),width:r1(hw*.12),height:r1(hs*.38),'class':'ig-ad-fin'},o.casa); el('rect',{x:r1(hx+hw*.74),y:r1(top+hs*.28),width:r1(hw*.12),height:r1(hs*.38),'class':'ig-ad-fin'},o.casa);
      el('path',{d:'M'+r1(hx-hw*.08)+' '+r1(top+hs)+' H'+r1(hx+hw*.36)+' M'+r1(hx-hw*.08)+' '+r1(top+hs*.8)+' V'+r1(top+hs),'class':'ig-ad-balcone'},o.casa);
      var hu2=Math.max(12,hs*.62); [hx+hw*.02,hx+hw*.2].forEach(function(px){ var a=omino(o.casa,hu2,'vis ig-ad-ombra'); a.setAttribute('transform','translate('+r1(px)+','+r1(top+hs-1)+')'); el('path',{d:'M'+r1(px+hu2*.16)+' '+r1(top+hs-hu2*.85)+' q'+r1(hu2*.22)+' '+r1(hu2*.2)+' 0 '+r1(hu2*.4),'class':'ig-ad-arco'},o.casa); });
      o.fasci=[]; for(var fsx=0;fsx<9;fsx++) o.fasci.push(el('rect',{x:r1(hx-hw*.06+fsx*hw*.135),y:r1(suolo-hs*.2-(fsx%2)*hs*.1),width:r1(hw*.13),height:r1(hs*.2),rx:2,'class':'ig-ad-fascina'},art));
      o.gotici=[]; [-.3,-.18,1.18,1.32,1.45].forEach(function(f){ var a=omino(art,hu2*1.05,'ig-ad-ombra'); a.setAttribute('transform','translate('+r1(hx+hw*f)+','+r1(suolo+3)+')'); o.gotici.push(a); });
      o.fiamme=[]; for(var fi=0;fi<7;fi++){ var fg=el('g',{transform:'translate('+r1(hx+hw*(-.02+fi*.17))+','+r1(suolo)+')'},art), fl=el('g',null,fg); el('path',{d:FIAMMA,'class':'ig-ad-fiamma grande'},fl); el('path',{d:FIAMMA,'class':'ig-ad-fiamma cuore',transform:'translate(0,2) scale(.55)'},fl); o.fiamme.push({g:fl,s:hs/12*(fi%2?.5:.68)}); }
      var pj0=[hx+hw*.8,top+hs*.62], pj1=[hx+hw*1.32,suolo+2]; o.salto=el('path',{d:'M'+xy(pj0)+' Q'+xy([hx+hw*1.12,top-hs*.2])+' '+xy(pj1),'class':'ig-ad-traiett'},art); o.saltoL=lungo(o.salto);
      o.saltatore=omino(art,hu2,'porpora-chiaro');
      o.nota=el('text',{x:r1(x+w-16),y:r1(ay+16),'class':'ig-ad-c-nota','text-anchor':'end'},art); avvolgi(o.nota,'preso, poi fuggì e tornò dai Romani',Math.min(aw*.42,220),16); [].forEach.call(o.nota.childNodes,function(c){ c.setAttribute('x',r1(x+w-16)); });
    }
    return o;
  }
  var K1=scheda(rS[0],rS[1],cw,ch,'freccia'), K2=scheda(aff?rS[0]+cw+16:rS[0],aff?rS[1]:rS[1]+ch+14,cw,ch,'casa');

  /* ---------- D. il conto ---------- */
  var gD=el('g',{'class':'ig-atto'},svg), tb, gb;
  if(oriz){ tb=[pad+6,pad,stretto?W*.5:Math.min(W*.42,420),H-2*pad]; gb=[tb[0]+tb[2]+(stretto?18:30),pad+10,W-(tb[0]+tb[2]+(stretto?18:30))-pad,H-2*pad-20]; }
  else { tb=[pad,pad,W-2*pad,Math.min(H*.46,230)]; gb=[pad,tb[1]+tb[3]+10,W-2*pad,H-(tb[1]+tb[3]+10)-pad]; }
  var gT=el('g',{'class':'ig-ad-conto'},gD), yT=tb[1]+(oriz?Math.max(20,tb[3]*.12):18);
  var tT1=tx(gT,tb[0],yT,'ig-m-testata','SI SALVÒ APPENA'), tT2=tx(gT,tb[0],yT+(oriz&&!stretto?58:46),'ig-ad-terzo','un terzo'); tT2.style.fontSize=(oriz&&!stretto?60:44)+'px'; while(largo(tT2)>tb[2]&&parseFloat(tT2.style.fontSize)>28) tT2.style.fontSize=(parseFloat(tT2.style.fontSize)-2)+'px';
  var gr3=oriz&&!stretto, tT3=el('text',{x:r1(tb[0]),y:r1(yT+(gr3?88:70)),'class':'ig-ad-conto-t'},gT); if(stretto) tT3.style.fontSize='16px'; var n3=avvolgi(tT3,"dell'esercito, scrive Ammiano. Quanti fossero i soldati, non lo dice.",tb[2],stretto?18:20);
  var yN=yT+(gr3?88:70)+n3*(stretto?18:20)+(gr3?16:8), gNomi=el('g',{'class':'ig-f'},gT), tN=el('text',{x:r1(tb[0]),y:r1(yN),'class':'ig-ad-conto-n'},gNomi), n4=avvolgi(tN,'Morti anche i generali Traiano e Sebastiano e trentacinque tribuni.',tb[2],stretto?16:18); if(stretto) tN.style.fontSize='12.5px';
  var gCa=el('g',{'class':'ig-ad-canne'},gD), yC=oriz?yN+n4*(stretto?16:18)+(stretto?24:30):null, fC=oriz&&!stretto?24:stretto?17:19;
  /* la fila degli uomini: uno su tre resta */
  var cols, rows, N=60; if(gb[2]/gb[3]>2.2){ rows=3; cols=20; } else if(gb[2]/gb[3]>1.1){ rows=5; cols=12; } else { rows=6; cols=10; }
  var cq=el('text',{x:r1(oriz?tb[0]:pad),y:0,'class':'ig-ad-canne-q'},gCa); cq.style.fontSize=fC+'px';      // prima il carattere, poi si va a capo
  var nc=avvolgi(cq,'«Negli annali non si legge di un\'altra disfatta così, tranne Canne.»',oriz?tb[2]:W-2*pad,fC*1.1), bassoQ=oriz?0:18+12+fC*.85+(nc-1)*fC*1.1+fC+4;      // sul telefono, sotto le figure: nota, citazione, fonte
  var cel=Math.min(gb[2]/cols,(gb[3]-bassoQ)/rows), hu3=cel*.8, gx=gb[0]+(gb[2]-cols*cel)/2, gy=gb[1]+(oriz?(gb[3]-rows*cel)/2:0), uomini=[];
  for(i=0;i<rows;i++) for(j=0;j<cols;j++){ var om2=omino(gD,hu3,'roma vis'); om2.setAttribute('transform','translate('+r1(gx+(j+.5)*cel)+','+r1(gy+(i+.92)*cel)+')'); uomini.push({o:om2,j:j}); }
  var sopr=Math.round(cols/3), filo=el('line',{x1:r1(gx+sopr*cel),x2:r1(gx+sopr*cel),y1:r1(gy-4),y2:r1(gy+rows*cel+4),'class':'ig-ad-filo'},gD);
  var tF=tx(gD,gx,gy+rows*cel+18,'ig-m-schema','schema: la proporzione è di Ammiano, le figure non sono un numero','start'); if(largo(tF)>gb[2]) tF.textContent='schema: la proporzione, non un numero'; if(largo(tF)>gb[2]) tF.textContent='schema';
  if(!oriz) yC=gy+rows*cel+18+12+fC*.85;      // la nota «schema» sta a +18: 12 punti d'aria e l'altezza delle maiuscole
  cq.setAttribute('y',r1(yC));
  tx(gCa,oriz?tb[0]:pad,yC+(nc-1)*fC*1.1+fC,'ig-m-cita-chi','Ammiano XXXI 13, 19 · praeter Cannensem pugnam');

  /* ---------- la regia ---------- */
  S.passo=function(t){
    /* A */
    cls(gA,'vis',t>=300&&t<T.b1-300);
    segui(rT,E.io(fase(t,T.a1+300,T.a1+2600))); segui(rGr,E.io(fase(t,T.a1+2600,T.a1+4400))); cls(zona,'vis',t>=T.a1+1800); cls(pDU,'vis',t>=T.a1+1800);
    segui(rR,E.io(fase(t,T.a2+200,T.a2+2600))); cls(sMA,'vis',t>=T.a2+1300); cls(pMA,'vis',t>=400); cls(pCB,'vis',t>=400); cls(pAD,'vis',t>=400); cls(pCO,'vis',t>=400);
    if(F.reg.tracia) cls(F.reg.tracia,'acceso',t>=T.a2+1800&&t<T.a3); if(F.reg.mesia_inf) cls(F.reg.mesia_inf,'acceso',t>=T.a2+800&&t<T.a3);
    segui(rV,E.io(fase(t,T.a3+300,T.a3+2600))); segui(rN,E.io(fase(t,T.a3+1200,T.a3+2600))); segui(rGz,E.io(fase(t,T.a3+2400,T.a3+4000))); cls(onda,'vis',t>=T.a4); cls(avvA,'vis',t>=T.a1+800);
    var ri=-1; REG.forEach(function(r,ii){ if(t>=r.t) ri=ii; });
    if(modo==='righe') righe.forEach(function(r,ii){ cls(r,'vis',ii<=ri); cls(r,'ora',ii===ri); });
    else if(sch){ cls(sch.g,'vis',ri>=0&&!(t>=T.a4&&!oriz&&lb[3]<120)); if(sch.ri!==ri&&ri>=0){ sch.ri=ri; scrivi(sch.a,REG[ri].a); scrivi(sch.n,REG[ri].n); sch.s.textContent=''; avvolgi(sch.s,REG[ri].s,sch.w,15); } }
    var fn=E.out(fase(t,T.a4+200,T.a4+2400)); cls(gNum,'vis',t>=T.a4); scrivi(cNum,num(Math.round(10000*fn/100)*100));
    /* B */
    cls(gB,'vis',t>=T.b1-400&&t<T.c1-300);
    var mar=fase(t,T.b1+400,T.b1+5200); cls(colonna,'vis',mar>0&&t<T.b2+600); fissa(colonna,'stroke-dashoffset',r1(-(t-T.b1)/1000*ku*6));
    cls(gBag,'vis',t>=T.b1+600); carri.forEach(function(c,ii){ cls(c,'vis',t>=T.b1+4200+ii*45); }); cls(interno,'vis',t>=T.b1+4800); cls(tCarri,'vis',t>=T.b1+5400&&t<T.b4);
    var sole=t<T.b1+5200?lerp(0,.66,E.io(fase(t,T.b1,T.b1+5200))):t<T.b6+2600?.66:lerp(.66,1,E.io(fase(t,T.b6+2600,T.b6+5600)));
    if(ora){ if(ora.sole){ fissa(ora.sole,'transform','translate('+r1(ora.x0+sole*ora.w)+','+r1(ora.y)+')'); cls(ora.sole,'notte',sole>=.97); ora.tac.forEach(function(q,ii){ cls(q,'ora',[0,.42,.66,1][ii]<=sole+.01&&(ii===3||[0,.42,.66,1][ii+1]>sole+.01)); }); }
      else scrivi(ora.solo,sole<.3?'alba':sole<.6?'verso mezzogiorno':sole<.97?'ottava ora':'notte senza luna'); }
    var dep=E.io(fase(t,T.b2-600,T.b2+1800)), sq=E.io(fase(t,T.b5+1800,T.b5+4400)), via=fase(t,T.b6+2400,T.b6+4400);
    fanti.forEach(function(f,ii){ var p=[lerp(50,f.b[0],dep),lerp(31,f.b[1],dep)]; p=[lerp(p[0],54+(f.b[0]-51.6)*.42,sq),lerp(p[1],31+(f.b[1]-31.2)*.4,sq)]; metti(f.g,p); cls(f.g,'vis',t>=T.b2-800+ii*60&&via<1); cls(f.g,'stretti',sq>.5); cls(f.g,'rotto',t>=T.b6+2400); });
    var depD=E.io(fase(t,T.b2-1800,T.b2+600)); destra.forEach(function(f){ metti(f.g,[lerp(50,f.b[0],depD),lerp(31,f.b[1],depD)]); cls(f.g,'vis',t>=T.b2-1900&&t<T.b6+2400); });
    sinistra.forEach(function(f){ var k0=T.b2+900+f.k*500, p=pista([[k0,f.a[0],f.a[1]],[k0+2600,f.b[0],f.b[1]],[T.b5+200,f.b[0],f.b[1]],[T.b5+1600,f.b[0]+7.5,f.b[1]+3]],t); metti(f.g,p); cls(f.g,'vis',t>=T.b2+400+f.k*500&&t<T.b5+2600); cls(f.g,'travolto',t>=T.b5+1700); });
    goticav.forEach(function(f){ var k=f.k, a=[104+k*1.6,-8+k*2.2], m=[88-k*.8,4+k*.9], b=[70.5+(k%4)*1.6,13.5+Math.floor(k/4)*2.4], c2=[59+(k%4)*1.5,19.5+Math.floor(k/4)*2],
      K=[[T.b4+2400,a[0],a[1]],[T.b4+3600,m[0],m[1]],[T.b4+4800,b[0],b[1]],[T.b5+2200,b[0],b[1]],[T.b5+4200,c2[0],c2[1]]], p=pista(K,t), p2=pista(K,t-80), an=Math.hypot(p[0]-p2[0],p[1]-p2[1])>.01?Math.atan2(p[1]-p2[1],p[0]-p2[0])*180/Math.PI:(f.an||180);
      f.an=an; metti(f.g,p,an); cls(f.g,'vis',t>=T.b4+2400&&t<T.b6+4800); });
    gotifanti.forEach(function(f,ii){ var e=E.io(fase(t,T.b5+600+ii*120,T.b5+3400+ii*120)); metti(f.g,[lerp(f.a[0],f.b[0],e),lerp(f.a[1],f.b[1],e)]); cls(f.g,'vis',e>0&&t<T.b6+5200); });
    fuochi.forEach(function(f,ii){ cls(f,'vis',t>=T.b3+500+ii*160&&t<T.b6+800); }); cls(caldo,'vis',t>=T.b3+800&&t<T.b6+3000); cls(tFuochi,'vis',t>=T.b3+900&&t<T.b4);
    var pi=pista([[T.b3+2400,69.5,30],[T.b3+3800,59.8,30],[T.b3+4300,59.8,30],[T.b3+5400,69.5,30]],t); fissa(inviato,'transform','translate('+xy(Fp(pi[0],pi[1]))+')'); cls(inviato,'vis',t>=T.b3+2300&&t<T.b3+5500);
    var pr=pista([[T.b4,57.2,27.4],[T.b4+1800,63.6,27.4]],t); fissa(ricomere,'transform','translate('+xy(Fp(pr[0],pr[1]))+')'); cls(ricomere,'vis',t>=T.b4&&t<T.b5); cls(ricomere,'fermo',t>=T.b4+2000);
    var pa=pista([[T.b4+600,56.5,36],[T.b4+1600,66.5,35.5],[T.b4+1900,66.5,35.5],[T.b4+2900,58,36.5]],t); arcieri.forEach(function(a){ fissa(a.c,'transform','translate('+xy(Fp(pa[0]+a.o[0],pa[1]+a.o[1]))+')'); cls(a.c,'vis',t>=T.b4+500&&t<T.b5); });
    cls(E1,'vis',t>=T.b2&&t<T.b4); cls(E2,'vis',t>=T.b2+2600&&t<T.b4+2400); cls(E3,'vis',t>=T.b2+1400&&t<T.b3); cls(E4,'vis',t>=T.b3+2600&&t<T.b3+5400); cls(E5,'vis',t>=T.b4+400&&t<T.b4+3000);
    cls(E6,'vis',t>=T.b4+1000&&t<T.b4+3200); cls(E7,'vis',t>=T.b4+3000&&t<T.b5+1200); cls(E8,'vis',t>=T.b5+400&&t<T.b5+2400); cls(E9,'vis',t>=T.b5+3600&&t<T.b6+1800); cls(E10,'vis',t>=T.b6+5000);
    cls(gLe,'vis',t>=T.b5+2400&&t<T.b6+1600); var ls=E.io(fase(t,T.b5+2600,T.b5+4600)), sxL=LR*lerp(.3,.2,ls), syL=LR*lerp(.36,.29,ls);
    omL.forEach(function(o){ fissa(o.o,'transform','translate('+r1(LC[0]+o.i*sxL+(o.j%2?sxL*.5:0))+','+r1(LC[1]+o.j*syL+LR*.2)+')'); });
    frecce.forEach(function(f){ cls(f,'vis',t>=T.b6-200&&t<T.b6+3600); });
    var pv=fase(t,T.b6-600,T.b6+1200)*(1-fase(t,T.b6+4800,T.b6+6400)); polveri.forEach(function(p,ii){ fissa(p.e,'opacity',r1(pv*.9*100)/100); fissa(p.e,'transform',pv>0?'translate('+r1(Math.sin((t-T.b6)/1400+ii)*p.dx*ku)+',0)':''); });
    fuga.forEach(function(f){ var p=fase(t,f.t0,f.t0+f.d), e=E.out(p); if(p>0){ var q=Fp(lerp(f.a[0],f.b[0],e),lerp(f.a[1],f.b[1],e)); fissa(f.c,'cx',r1(q[0])); fissa(f.c,'cy',r1(q[1])); } cls(f.c,'vis',p>0&&t<T.b6+6200); });
    fissa(notte,'opacity',r1(E.io(fase(t,T.b6+3600,T.b6+6200))*.6*100)/100);
    quote.forEach(function(q,ii){ cls(q.g,'vis',t>=q.t&&(ii===quote.length-1||t<quote[ii+1].t)); });
    /* C */
    cls(gCm,'vis',t>=T.c1-300&&t<T.d1-300); cls(K1.g,'vis',t>=T.c1-300); cls(K2.g,'vis',t>=T.c2-300); cls(K1.g,'pieno',t<T.c2); cls(K2.g,'pieno',t>=T.c2);
    K1.passi.forEach(function(p,ii){ cls(p,'vis',t>=T.c1+500+ii*2900); }); K2.passi.forEach(function(p,ii){ cls(p,'vis',t>=T.c2+500+ii*1700); });
    var ff=E.io(fase(t,T.c1+1000,T.c1+2300)); traccia(K1.fr,ff); var fa=puntoA(K1.fr,Math.max(0,K1.fr._L*ff-4)), fb2=puntoA(K1.fr,Math.max(4,K1.fr._L*ff));
    fissa(K1.fp,'transform','translate('+xy(fb2)+') rotate('+r1(Math.atan2(fb2[1]-fa[1],fb2[0]-fa[0])*180/Math.PI)+')'); cls(K1.fp,'vis',ff>.03&&ff<1);
    var cad=E.io(fase(t,T.c1+2300,T.c1+3100)); fissa(K1.valI,'transform',cad>0?'rotate('+r1(-cad*82)+')':''); cls(K1.val,'via',t>=T.c1+3900); cls(K1.perso,'vis',t>=T.c1+3900); cls(K1.vT,'vis',t>=T.c1+300&&t<T.c1+3900); cls(K1.nota,'vis',t>=T.c1+4200);
    K2.fasci.forEach(function(f,ii){ cls(f,'vis',t>=T.c2+1500+ii*90); }); K2.gotici.forEach(function(g,ii){ cls(g,'vis',t>=T.c2+900+ii*120); });
    var fu=E.out(fase(t,T.c2+2600,T.c2+3800)), cresce=1+.55*E.io(fase(t,T.c2+3400,T.c2+5600)); K2.fiamme.forEach(function(f,ii){ var s=f.s*fu*cresce*(ii%3===1?1.15:1)*(1+.08*Math.sin(t/120+ii*1.7)); fissa(f.g,'transform',fu>0?'scale('+r1(s*100)/100+','+r1(s*(1+.12*Math.sin(t/90+ii))*100)/100+')':'scale(0)'); });
    fissa(K2.vampa,'opacity',r1(fu*(.75+.15*Math.sin(t/160))*100)/100); cls(K2.casa,'bruciata',t>=T.c2+3600);
    var fs2=E.io(fase(t,T.c2+3900,T.c2+4900)), qs=puntoA(K2.salto,K2.saltoL*fs2); fissa(K2.saltatore,'transform','translate('+xy(qs)+')'+(fs2>0&&fs2<1?' rotate('+r1(fs2*40)+')':'')); cls(K2.saltatore,'vis',t>=T.c2+3800); cls(K2.nota,'vis',t>=T.c2+5000);
    /* D */
    cls(gD,'vis',t>=T.d1-300); cls(gNomi,'vis',t>=T.d1+3400); cls(gCa,'vis',t>=T.d1+5600);
    uomini.forEach(function(u){ cls(u.o,'perso',u.j>=sopr&&t>=T.d1+900+(cols-1-u.j)*90); }); cls(filo,'vis',t>=T.d1+900+(cols-sopr)*90+300);
  };
  S.dura=T.fin;
  var bt=[T.a1,T.a2,T.a3,T.a4,T.b1,T.b2,T.b3,T.b4,T.b5,T.b6,T.c1,T.c2,T.d1];
  S.battute=ADRIANOPOLI.fasi.map(function(f,ii){ return {t:bt[ii],anno:f[0],testo:f[1]}; });
}

/* l'ora del giorno su una linea: tacche [nome, posizione 0..1]; set(f) sposta il sole (oltre .97 diventa notte) e accende la tacca giusta */
function orologio(par,x,y,w,tacche){ var g=el('g',{'class':'ig-ad-ora'},par), o={g:g};
  el('line',{x1:r1(x+6),x2:r1(x+w-6),y1:r1(y+12),y2:r1(y+12),'class':'ig-ad-ora-l'},g);
  o.t=tacche.map(function(q){ var xx=x+6+q[1]*(w-12); el('line',{x1:r1(xx),x2:r1(xx),y1:r1(y+8),y2:r1(y+16),'class':'ig-ad-ora-l'},g); return {t:tx(g,xx,y+31,'ig-ad-ora-t',q[0],q[1]===0?'start':q[1]===1?'end':'middle'),f:q[1]}; });
  o.sole=el('g',{'class':'ig-ad-sole'},g); for(var i=0;i<8;i++){ var a=i/8*Math.PI*2; el('line',{x1:r1(Math.cos(a)*9),y1:r1(Math.sin(a)*9),x2:r1(Math.cos(a)*13),y2:r1(Math.sin(a)*13)},o.sole); } el('circle',{r:6.5},o.sole);
  o.set=function(f,notte){ fissa(o.sole,'transform','translate('+r1(x+6+f*(w-12))+','+r1(y+12)+')'); cls(o.sole,'notte',!!notte);
    var k=-1; o.t.forEach(function(q,i){ if(q.f<=f+.01) k=i; }); o.t.forEach(function(q,i){ cls(q.t,'ora',i===k); }); };
  return o; }

/* ======================================================================
   12. Campi Catalaunici (451)
   Aggiunta il 23 novembre 2026. Quattro quadri: dalla Pannonia ai Campi Catalaunici sulla carta della pagina; la battaglia su un campo schematico; il recinto dei carri e il rogo di
   selle; i morti di Giordane. Fonti lette: Giordane, Getica (The Latin Library). 192: «Convenitur itaque in campos Catalaunicos, qui et Mauriaci nominantur, centum leuvas… in longum
   tenentes et septuaginta in latum»; 194-195: Sangibano, re degli Alani, promette di consegnare Orléans ad Attila, Teodorico ed Ezio fortificano la città e lo mettono «inter suos
   auxiliares medium»; 195-196: gli aruspici annunciano «Hunnis infausta», ma che «summus hostium ductor de parte adversa occumberet», e Attila attacca «circa nonam diei horam… ut, si
   secus cederet, nox imminens subveniret»; 197: «Erat autem positio loci declivi tumore in editum collis excrescens»; «Dextrum itaque cornum cum Vesegothis Theoderidus tenebat,
   sinistrum Aetius cum Romanis, conlocantes in medio Sanguibanum… ut eum, de cuius animo minus praesumebant, fidelium turba concluderent»; 198-200: «in medio Attila cum suis
   fortissimis», alle ali gli Ostrogoti di Valamiro, Teodemiro e Videmiro e i Gepidi di Ardarico, su cui Attila contava «contra parentes Vesegothas» (quale ala tenessero non è detto);
   201: Attila manda i suoi a prendere la cima, «sed a Thorismundo et Aetio praevenitur»; 208: «si senioribus credere fas est» il ruscello del campo divenne un torrente di sangue;
   209: Teodorico «equo depulsus pedibusque suorum conculcatus», o, per altri, «interfectum telo Andagis»; 210: i Visigoti «dividentes se ab Alanis» quasi uccidono Attila, che si chiude
   «intra septa castrorum, quam plaustris vallatum habebat»; 211-212: Torismondo «ad hostium carpenta ignarus incurrit», ferito alla testa; Ezio «relicuum noctis scutorum defensione
   transegit»; Attila chiuso «velut leo venabulis praessus speluncae aditus obambulans», con le trombe; 213: Goti e Romani decidono «eum obsidione fatigari», e i suoi arcieri «intra
   septa castrorum locatis» tengono lontani i nemici; «Fertur autem… equinis sellis construxisse pyram seseque, si adversarii inrumperent, flammis inicere voluisse»; 214-216: il corpo
   di Teodorico ritrovato «inter densissima cadavera» e portato via «cantibus»; Ezio consiglia a Torismondo di tornare, «metuens, ne Hunnis funditus interemptis a Gothis Romanum
   praemeretur imperium»; 217: «ab utrisque partibus clxv milia caesa referuntur, exceptis quindecim milibus Gepidarum et Francorum». Gregorio di Tours II 7 (letto): Orléans liberata
   da «Aetius et Theudor Gothorum rex ac Thorismodus», Attila «Mauriacum campum adiens»; Metz bruciata la vigilia di Pasqua e la partenza dalla Pannonia «ut quidam ferunt» vengono dai
   passi della tappa (PASSI_CARTA[451] in js/dati.js), come la voce di Prospero («stragi incalcolabili», «chiude l'opera nel 455») e la data di Giordane (verso il 551).
   Schemi, detti nel disegno: il luogo del campo, le linee della marcia, l'orientamento dello schieramento, le ali di Ostrogoti e Gepidi, distanze e numeri dei reparti, la forma del
   recinto e del rogo. */
var CATALAUNICI={ titolo:"Campi Catalaunici", sotto:"451: Ezio, Teodorico e Attila nella battaglia raccontata da Giordane",
  fasi:[["451","In primavera gli Unni di Attila lasciano la Pannonia e passano il Reno: le fonti non dicono dove. Alla vigilia di Pasqua Metz viene incendiata."],
    ["451","Attila assedia Orléans. Ezio e Teodorico, re dei Visigoti, accorrono e liberano la città. Dentro ci sono gli Alani di Sangibano: secondo Giordane volevano consegnarla ad Attila."],
    ["451","Attila si ritira verso est. Gli eserciti si incontrano nei Campi Catalaunici, «detti anche Mauriaci». Dove fossero di preciso, non si sa."],
    ["Giordane","Prima della battaglia gli indovini di Attila annunciano una sconfitta per gli Unni, ma anche la morte del capo nemico. Attila attacca verso la nona ora, perché la notte lo aiuti se le cose vanno male."],
    ["Lo schieramento","Sull'ala destra Teodorico con i Visigoti, sulla sinistra Ezio con i Romani. Al centro Sangibano con gli Alani, chiusi fra gli altri: di lui non ci si fidava."],
    ["Lo schieramento","Di fronte, Attila al centro con i suoi Unni più forti. Alle ali i popoli sottomessi: gli Ostrogoti di Valamiro, Teodemiro e Videmiro, e i Gepidi del re Ardarico."],
    ["La collina","Il campo sale verso una collina. Attila manda i suoi a prenderne la cima, ma Torismondo, figlio di Teodorico, ed Ezio arrivano prima e respingono gli Unni dall'alto."],
    ["Teodorico","Il re Teodorico, mentre incita i suoi, cade da cavallo e muore calpestato. Altri dicono che lo uccise una lancia di Andagis, un Ostrogoto. Secondo i vecchi, il ruscello del campo si gonfiò di sangue."],
    ["La notte","I Visigoti si staccano dagli Alani e caricano gli Unni. Quasi uccidono Attila, che si chiude nel recinto dei suoi carri. Nel buio Torismondo finisce fra i carri nemici ed è ferito; Ezio passa la notte al riparo degli scudi."],
    ["Il giorno dopo","Attila resta chiuso nel cerchio dei carri, fra squilli di tromba, «come un leone» stretto dalle lance. Goti e Romani decidono di prenderlo per fame; i suoi arcieri tengono lontano chi si avvicina."],
    ["Si racconta","Si racconta che Attila preparò un rogo di selle di cavallo, per gettarsi tra le fiamme se i nemici fossero entrati: nessuno doveva prenderlo vivo. Il rogo resta spento: Goti e Romani decidono di stancarlo con l'assedio."],
    ["Torismondo","I Visigoti trovano il corpo del re fra i cadaveri e lo portano via con i canti. Ezio consiglia a Torismondo di tornare a Tolosa a prendersi il regno: secondo Giordane temeva che, distrutti gli Unni, i Goti diventassero un pericolo per l'impero."],
    ["I morti","Giordane scrive di 165.000 morti, più 15.000 Franchi e Gepidi uccisi la notte prima. È la cifra della fonte, scritta un secolo dopo, e non è credibile come conto. Prospero, che scriveva in quegli anni, parla solo di «stragi incalcolabili»."]],
  fonte:"Giordane, Storia dei Goti 192-217, nel latino (The Latin Library); Gregorio di Tours, Storie II 7; Prospero d'Aquitania, Cronaca, anno 451, citato nella tappa. Giordane scrive verso il 551, un secolo dopo; Prospero chiude la sua cronaca nel 455. Il luogo della battaglia non è noto: la carta lo segna dove lo mette la tradizione, e le linee della marcia sono uno schema. Lo schieramento segue Giordane; l'orientamento del campo, le distanze e i reparti sono disegnati a schema, e su quale ala stessero Ostrogoti e Gepidi Giordane non è esplicito. Il ruscello di sangue è un racconto «dei vecchi», il rogo di selle un «si racconta»; i 165.000 morti sono la cifra di Giordane, non un conto credibile." };
function disegnaCatalaunici(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G||!G.citta) return;
  var oriz=W/H>=1.15, stretto=oriz&&W<700, pad=oriz?20:12, defs=el('defs',null,svg), i, j;
  var T={a1:1400,a2:7000,a3:12600,b1:19000,b2:24400,b3:29400,b4:34600,b5:40400,b6:46400,c1:53400,c2:59000,c3:64600,d1:70600}; T.fin=T.d1+9500;
  var CO={roma:'#9A2F2A',romani:'#9A2F2A',visigoti:'#8054C3',alani:'#5E8A63',unni:'#4A3A2C',ostrogoti:'#B07A38',gepidi:'#7E7A62'};
  grad(defs,'ig-ca-suolo',[[0,'#EEE6C9'],[1,'#DCCFA5']]); grad(defs,'ig-ca-colle',[[0,'#CDBB86',.95],[1,'#CDBB86',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-ca-cielo',[[0,'#0B1020'],[.6,'#1C2540'],[1,'#3A3550']]); grad(defs,'ig-ca-terra',[[0,'#1B1712'],[1,'#0C0A08']]);
  grad(defs,'ig-ca-brace',[[0,'#FFB45A',.75],[.5,'#E06A1E',.3],[1,'#E06A1E',0]],{cx:'50%',cy:'50%',r:'50%'});

  /* ---------- A. dalla Pannonia ai Campi Catalaunici ---------- */
  var gA=el('g',{'class':'ig-atto'},svg), V=[282,150,196,168], mb;
  if(oriz){ var mh=H-2*pad, mw=mh*V[2]/V[3]; if(mw>W*(stretto?.6:.58)){ mw=W*(stretto?.6:.58); mh=mw*V[3]/V[2]; } mb=[W-pad-mw,(H-mh)/2,mw,mh]; }
  else { var mw2=W-2*pad, mh2=Math.min(mw2*V[3]/V[2],H*.66); mw2=mh2*V[2]/V[3]; mb=[(W-mw2)/2,pad,mw2,mh2]; }
  var F=finestra(gA,defs,'ig-ca-clipA',V,mb,{stati:statiDi(451)}), sA=F.sopra, MP=F.M, Cq=F.C;
  var TB=Cq('tibisco'), MZ=Cq('magonza'), ME=Cq('metz'), OR=Cq('orleans'), AR=Cq('arles'), TO=Cq('tolosa'), CC=Cq('catalaunici'); if(!TB||!MZ||!ME||!OR||!AR||!TO||!CC) return;
  var reno=el('g',{'class':'ig-f'},sA); el('ellipse',{cx:r1(MZ[0]),cy:r1(MZ[1]),rx:r1(9*F.k),ry:r1(6*F.k),'class':'ig-ad-zona'},reno); if(F.k>=2) tx(reno,MZ[0],MZ[1]+6*F.k+14,'ig-ad-zona-t','il Reno: dove, non è detto','middle');
  var r1a=rotta(sA,defs,[MP([480,196]),MP([452,184]),MP([420,178])],{c:CO.unni,schema:true,nome:'dalla Pannonia',dove:.3,dy:-10});
  var r1b=rotta(sA,defs,[MP([416,176]),MP([402,183]),MP([388,192])],{c:CO.unni});
  var sME=segnoCarta(sA,'fuoco',ME,.9);
  var r2a=rotta(sA,defs,[MP([385,194]),MP([355,198]),MP([324,211])],{c:CO.unni,nome:'Attila',dove:.45,dy:-9});
  var r2e=rotta(sA,defs,[MP([352,305]),MP([340,262]),MP([325,216])],{c:CO.roma,nome:'Ezio',dove:.55,dx:8,an:'start'});
  var r2t=rotta(sA,defs,[MP([303,302]),MP([308,260]),MP([320,216])],{c:CO.visigoti,nome:'Teodorico',dove:.3,dx:7,an:'start'});
  var sOR=segnoCarta(sA,'assedio',OR,.9);
  var r3=rotta(sA,defs,[MP([324,213]),MP([348,214]),MP([372,200]),MP([360,201])],{c:CO.unni,nome:F.k>=2?'si ritira':null,dove:.22,dy:15});
  var zonaC=el('g',{'class':'ig-f'},sA); el('ellipse',{cx:r1(CC[0]),cy:r1(CC[1]),rx:r1(17*F.k),ry:r1(9*F.k),'class':'ig-ca-zona'},zonaC);
  var tZ1=tx(zonaC,CC[0]+6,CC[1]+9*F.k+16,'ig-ca-zona-n','Campi Catalaunici','middle'), tZ2=tx(zonaC,CC[0]+6,CC[1]+9*F.k+31,'ig-ad-zona-t','il luogo esatto non è noto','middle');
  var sCC=segnoCarta(sA,'scontro',CC,.85);
  var pME=luogo(sA,ME,'Metz',9,4,'start'), pOR=luogo(sA,OR,'Orléans',-8,-7,'end'), pAR=luogo(sA,AR,'Arles',8,4,'start','tenue'), pTO=luogo(sA,TO,'Tolosa',F.k>=2?-8:7,F.k>=2?4:-6,F.k>=2?'end':'start','tenue'), pMZ=luogo(sA,MZ,'Magonza',8,-6,'start','tenue');
  var avvA=el('text',{x:r1(mb[0]+10),y:r1(mb[1]+18),'class':'ig-m-avverte su-carta'},gA); avvA.textContent='le linee sono uno schema: le strade non sono scritte'; if(largo(avvA)>mb[2]-20||F.k<2) avvA.textContent='le linee sono uno schema';
  var lb=oriz?[pad+4,pad,mb[0]-pad-30,H-2*pad]:[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-4];
  var REG=[{n:'Metz',s:'incendiata alla vigilia di Pasqua',f:'passi della tappa',t:T.a1+2600,ic:'fuoco'},{n:'Orléans',s:'assediata, poi liberata da Ezio e Teodorico',f:'Gregorio di Tours II 7; Giordane 194-195',t:T.a2+1800,ic:'assedio'},
    {n:'Campi Catalaunici',s:'«detti anche Mauriaci»: dove, non si sa',f:'Giordane 192; Gregorio II 7',t:T.a3+2200,ic:'scontro'}];
  var gR=el('g',null,gA), righe=[], modo=lb[2]>=300&&lb[3]>=280?'righe':'scheda', sch=null, gChi=null;
  if(modo==='righe'){
    var y0=lb[1]+Math.max(0,(lb[3]-330)/2);
    tx(gR,lb[0],y0+12,'ig-m-testata','DALLA PANNONIA ALLA GALLIA'); tx(gR,lb[0],y0+31,'ig-m-sotto','tre luoghi, tre fonti');
    REG.forEach(function(r,ii){ var y=y0+52+ii*64, g=el('g',{'class':'ig-ad-riga'},el('g',{transform:'translate(0,'+r1(y)+')'},gR));
      segnoCarta(g,r.ic,[lb[0]+13,26],.85).setAttribute('class','ig-sg vis '+r.ic); tx(g,lb[0]+36,16,'ig-ad-rn',r.n); var s=el('text',{x:r1(lb[0]+36),y:34,'class':'ig-ad-rs'},g); var ns=avvolgi(s,r.s,lb[2]-38,16);
      tx(g,lb[0]+36,34+ns*16+1,'ig-m-cita-chi',r.f); el('line',{x1:r1(lb[0]),x2:r1(lb[0]+lb[2]),y1:58,y2:58,'class':'ig-m-filo'},g); righe.push(g); });
    gChi=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(y0+52+3*64+14)+')'},gR));
    tx(gChi,lb[0],10,'ig-m-testata','CHI LO RACCONTA'); var ax0=lb[0]+6, ax1=lb[0]+lb[2]-6, X=function(a){ return ax0+(a-451)/(551-451)*(ax1-ax0); };
    el('line',{x1:r1(ax0),x2:r1(ax1),y1:34,y2:34,'class':'ig-ad-ora-l'},gChi);
    [[451,'451','',-6,22,'start'],[455,'Prospero','entro il 455',-4,58,'start'],[551,'Giordane','verso il 551',6,22,'end']].forEach(function(q,ii){ var x=X(q[0]); el('circle',{cx:r1(x),cy:34,r:ii?5:6.5,'class':ii?'ig-ca-chi-p':'ig-ca-chi-b'},gChi);
      tx(gChi,x+q[3],q[4],'ig-ca-chi-n',q[1],q[5]); if(q[2]) tx(gChi,x+q[3],ii===1?q[4]+15:q[4]+36,'ig-ca-chi-t',q[2],q[5]); });
  } else {
    sch={g:el('g',{'class':'ig-ad-scheda'},gR)}; var sx=lb[0], sy=lb[1]+(oriz?8:2);
    sch.n=tx(sch.g,sx,sy+18,'ig-ad-rn',''); sch.s=el('text',{x:r1(sx),y:r1(sy+40),'class':'ig-ad-rs'},sch.g); sch.f=tx(sch.g,sx,sy+40,'ig-m-cita-chi','');
  }

  /* ---------- B. la battaglia (schema) ---------- */
  var gB=el('g',{'class':'ig-atto'},svg), FW=100, FH=62, fb, sb=null;
  if(oriz&&!stretto){ var fh=H-2*pad, fw=fh*FW/FH; if(fw>W*.64){ fw=W*.64; fh=fw*FH/FW; } fb=[pad,(H-fh)/2,fw,fh]; sb=[pad+fw+28,pad+4,W-(pad+fw+28)-pad,H-2*pad-4]; }
  else if(stretto){ var fw2=Math.min(W-2*pad,(H-2*pad)*FW/FH); fb=[(W-fw2)/2,(H-fw2*FH/FW)/2,fw2,fw2*FH/FW]; }
  else { var fw3=W-2*pad; fb=[pad,pad,fw3,fw3*FH/FW]; sb=[pad,fb[1]+fb[3]+14,W-2*pad,H-(fb[1]+fb[3]+14)-6]; }
  var ku=fb[2]/FW; function Fp(x,y){ return [fb[0]+x*ku, fb[1]+y*ku]; }
  var cpB=el('clipPath',{id:'ig-ca-clipB'},defs); el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),rx:12},cpB);
  var campo=el('g',{'clip-path':'url(#ig-ca-clipB)'},gB);
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),fill:'url(#ig-ca-suolo)'},campo);
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),fill:'url(#ig-ad-erba)'},campo);
  var pz=el('pattern',{id:'ig-ad-erba',width:9,height:7,patternUnits:'userSpaceOnUse'},defs); el('path',{d:'M1 6 l1.4 -3.2 M4.5 6.5 l-.8 -3 M7 5.5 l1.2 -2.6',stroke:'rgba(110,110,60,.2)','stroke-width':.8,fill:'none'},pz);
  /* la collina: «declivi tumore in editum collis excrescens» */
  var HC=Fp(50,10);
  el('path',{d:macchia(HC[0],HC[1],30*ku,11*ku,451,13),fill:'url(#ig-ca-colle)'},campo);
  for(var l=0;l<4;l++) el('path',{d:macchia(HC[0]+l*.4*ku,HC[1]-l*.6*ku,ku*(27-l*6.2),ku*(9.6-l*2.1),460+l,12),'class':'ig-ad-quota'},campo);
  var cima=el('path',{d:'M'+xy(Fp(41,7.5))+' Q'+xy(Fp(50,5.5))+' '+xy(Fp(59,7.6)),'class':'ig-ca-cresta'},campo);
  var tCol=tx(campo,HC[0],HC[1]+8*ku,'ig-ad-et ig-ad-tag','la collina','middle');
  /* il ruscello del campo */
  var RU=[[2,58],[18,54],[34,56.5],[50,53.5],[66,56],[82,52.5],[99,55]].map(function(p){ return Fp(p[0],p[1]); }), ruD=curvaPezzi(RU).join(' ');
  el('path',{d:ruD,'class':'ig-ca-rivo-b','stroke-width':r1(Math.max(4,1.3*ku))},campo); var rivo=el('path',{d:ruD,'class':'ig-ca-rivo','stroke-width':r1(Math.max(2,.6*ku))},campo);
  var tRivo=tx(campo,Fp(50,50.5)[0],Fp(50,50.5)[1],'ig-ad-et ig-ad-tag scuro','«se si deve credere ai vecchi»: un torrente di sangue','middle'); if(largo(tRivo)>fb[2]-20) tRivo.textContent='il ruscello di sangue, «secondo i vecchi»';
  /* il recinto dei carri di Attila */
  var CR=[91,31], RCr=6.5, carriA=[]; for(i=0;i<22;i++){ var a2=i/22*Math.PI*2, q2=Fp(CR[0]+Math.cos(a2)*RCr,CR[1]+Math.sin(a2)*RCr), g=el('g',{'class':'ig-ad-carro vis',transform:'translate('+xy(q2)+') rotate('+r1(a2*180/Math.PI+90)+')'},campo);
    el('rect',{x:r1(-.9*ku),y:r1(-.45*ku),width:r1(1.8*ku),height:r1(.9*ku),rx:r1(.2*ku),'class':'ig-ad-cassa'},g); carriA.push(g); }
  var tRec=tx(campo,Fp(CR[0]-1,CR[1]-RCr-2.2)[0],Fp(CR[0]-1,CR[1]-RCr-2.2)[1],'ig-ad-et ig-ad-tag','i carri di Attila','middle');
  /* i reparti */
  function blocco(c,x,y,lato){ var g=el('g',{'class':'ig-ca-u'},campo); g.style.setProperty('--c',c); el('rect',{x:r1(-1.6*ku),y:r1(-1.4*ku),width:r1(3.2*ku),height:r1(2.8*ku),rx:r1(.3*ku)},g); return {g:g,b:[x,y],lato:lato}; }
  var R=[], U=[], gruppi={};
  function schiera(nome,c,xs,ys,lato){ gruppi[nome]=[]; xs.forEach(function(x){ ys.forEach(function(y){ var b=blocco(c,x,y,lato); b.n=nome; gruppi[nome].push(b); (lato<0?R:U).push(b); }); }); }
  schiera('romani',CO.roma,[20,24.5],[15,19.5,24],-1); schiera('alani',CO.alani,[22,26.5],[29.5,33.5],-1); schiera('visigoti',CO.visigoti,[18.5,23,27.5],[38.5,43,47.5],-1);
  schiera('gepidi',CO.gepidi,[72,76.5],[15,19.5,24],1); schiera('unni',CO.unni,[73,77.5],[29.5,33.5],1); schiera('ostrogoti',CO.ostrogoti,[71,75.5,80],[38.5,43,47.5],1);
  var recAl=el('rect',{x:r1(Fp(19.6,0)[0]),y:r1(Fp(0,27.4)[1]),width:r1(9.3*ku),height:r1(8.2*ku),rx:r1(1*ku),'class':'ig-ca-chiuso'},campo);
  /* i nomi: Alani e Unni accanto ai loro blocchi, verso il centro (fra le file non c'è posto); il testo in una tinta più scura del colore del blocco, per leggerlo sul campo chiaro */
  var CO_T={romani:'#7A1F1B',alani:'#2F5A37',visigoti:'#5A3596',unni:'#2E241C',ostrogoti:'#7A4A12',gepidi:'#4F4B36'};
  var NOMI=[['romani','Ezio e i Romani',22,11.2,'middle'],['alani','Alani di Sangibano',29.4,32.6,'start'],['visigoti','Visigoti di Teodorico',23,52.6,'middle'],['gepidi','Gepidi di Ardarico',74.3,11.2,'middle'],['unni','Attila e gli Unni',70.6,32.6,'end'],['ostrogoti','Ostrogoti',75.5,52.6,'middle']], etG={};
  NOMI.forEach(function(n){ var q=Fp(n[2],n[3]); etG[n[0]]=tx(campo,q[0],q[1],'ig-ca-et ig-ad-tag',n[1],n[4]); etG[n[0]].style.fill=CO_T[n[0]]; });
  if(largo(etG.alani)+largo(etG.unni)>(70.6-29.4)*ku-10){ scrivi(etG.alani,'Alani'); scrivi(etG.unni,'Unni'); }      // sul telefono i nomi corti (Sangibano resta nella citazione)
  [tCol,tRivo,tRec].concat(NOMI.map(function(n){ return etG[n[0]]; })).forEach(function(t){ nelRiquadro(t,fb); });
  function capo(c,nome,an,dy){ var g=el('g',{'class':'ig-ca-capo'},campo); g.style.setProperty('--c',c); el('circle',{r:r1(Math.max(4,1.25*ku))},g); var t=tx(g,an==='end'?-9:9,dy==null?4:dy,'ig-ca-capo-t',nome,an||'start'); return {g:g,t:t}; }
  var kAt=capo(CO.unni,'Attila','start'), kTe=capo(CO.visigoti,'Teodorico','end'), kTo=capo(CO.visigoti,'Torismondo','end',-5), kEz=capo(CO.roma,'Ezio','end',15);
  var croce=el('g',{'class':'ig-ca-croce'},campo); var rcr=Math.max(7,1.7*ku); el('circle',{r:r1(rcr),'class':'ig-ca-croce-f'},croce); el('path',{d:'M0 '+r1(-rcr*.66)+' V'+r1(rcr*.66)+' M'+r1(-rcr*.42)+' '+r1(-rcr*.2)+' H'+r1(rcr*.42),'class':'ig-ca-croce-l'},croce); tx(croce,-rcr-5,4,'ig-ca-capo-t viola','Teodorico muore','end');
  var mischia=[[49.5,17],[49.5,31.5],[49.5,43]].map(function(p){ return segnoCarta(campo,'scontro',Fp(p[0],p[1]),Math.max(.6,ku*.11)); });
  var vetta=[]; for(i=0;i<3;i++){ var gw=el('g',{'class':'ig-ad-u goti cav'},campo); el('path',{d:'M'+r1(1.8*ku)+' 0 L'+r1(-1.4*ku)+' '+r1(-1.2*ku)+' L'+r1(-.75*ku)+' 0 L'+r1(-1.4*ku)+' '+r1(1.2*ku)+' Z'},gw); vetta.push(gw); }
  var notte=el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),'class':'ig-ad-buio',opacity:0},campo);
  el('rect',{x:r1(fb[0]),y:r1(fb[1]),width:r1(fb[2]),height:r1(fb[3]),rx:12,'class':'ig-m-cornice'},gB);
  var tSch=tx(gB,fb[0]+fb[2]-10,fb[1]+fb[3]-9,'ig-m-schema','schema: orientamento e distanze non sono nelle fonti','end'); if(largo(tSch)>fb[2]-20) tSch.textContent='schema';
  var gP=el('g',null,gB), ora=null, quote=[];
  if(sb){
    var dD=tx(gP,sb[0],sb[1]+(oriz?24:20),'ig-m-data','451 · CAMPI CATALAUNICI'); dD.style.fontSize=(oriz?24:19)+'px'; while(largo(dD)>sb[2]&&parseFloat(dD.style.fontSize)>13) dD.style.fontSize=(parseFloat(dD.style.fontSize)-1)+'px';
    var oy=sb[1]+(oriz?42:32); ora=orologio(gP,sb[0],oy,sb[2],[['nona ora',0],['notte',.5],['il giorno dopo',1]]);
    var legY=oy+(oriz?60:50), lw=sb[2]/2, LEG=[['romani','Romani'],['unni','Unni'],['visigoti','Visigoti'],['ostrogoti','Ostrogoti'],['alani','Alani'],['gepidi','Gepidi']];
    LEG.forEach(function(q,ii){ var x=sb[0]+(ii%2)*lw, y=legY+Math.floor(ii/2)*18, g=el('g',null,gP); el('rect',{x:r1(x),y:r1(y-9),width:14,height:9,rx:1.5,style:'fill:'+CO[q[0]]},g); tx(g,x+21,y,'ig-m-leg-t',q[1]); });
    var qy=legY+(oriz?46:46), qh=sb[1]+sb[3]-qy, fsq=oriz?(sb[2]>=320?20:17):15.5;
    [["«verso la nona ora del giorno»","Giordane 196",T.b1+800],["«perché lo chiudesse in mezzo gente fidata»","Giordane 197: Sangibano e gli Alani",T.b2+1600],["«Attila al centro, con i più forti dei suoi»","Giordane 198",T.b3+600],
     ["«saliti per primi, respinsero facilmente gli Unni che arrivavano»","Giordane 201",T.b4+2400],["«se si deve credere ai vecchi», il ruscello del campo divenne un torrente di sangue","Giordane 208",T.b5+2600],
     ["«si chiuse dentro il recinto del campo, che aveva cinto di carri»","Giordane 210",T.b6+1200]].forEach(function(d){
      var c=citazione(gP,sb[0],qy,sb[2],d[0],d[1],fsq); if(c._h>qh+4){ c.remove(); return; } quote.push({g:c,t:d[2]}); });
  } else {
    var box=el('g',{'class':'ig-ad-sovr'},gP), rb=el('rect',{x:r1(fb[0]+4),y:r1(fb[1]+5),height:44,rx:8,'class':'ig-m-sovr'},box), dS=tx(box,fb[0]+12,fb[1]+22,'ig-m-data','451'); dS.style.fontSize='17px';
    ora={solo:tx(box,fb[0]+12,fb[1]+40,'ig-ad-ora-t','nona ora')}; rb.setAttribute('width','118');
  }

  /* ---------- C. il recinto dei carri e il rogo di selle ---------- */
  var gC=el('g',{'class':'ig-atto'},svg), tv=[pad,pad,W-2*pad,H-2*pad];
  var cpC=el('clipPath',{id:'ig-ca-clipC'},defs); el('rect',{x:r1(tv[0]),y:r1(tv[1]),width:r1(tv[2]),height:r1(tv[3]),rx:14},cpC);
  var tav=el('g',{'clip-path':'url(#ig-ca-clipC)'},gC), oriz2=tv[2]/tv[3]>1.2, oz=tv[1]+tv[3]*(oriz2?.36:.3);
  el('rect',{x:r1(tv[0]),y:r1(tv[1]),width:r1(tv[2]),height:r1(tv[3]),fill:'url(#ig-ca-cielo)'},tav);
  var Rst=caso(451); for(i=0;i<40;i++) el('circle',{cx:r1(tv[0]+Rst()*tv[2]),cy:r1(tv[1]+Rst()*(oz-tv[1])),r:r1(.5+Rst()*1),'class':'ig-m-stella'},tav);
  el('rect',{x:r1(tv[0]),y:r1(oz),width:r1(tv[2]),height:r1(tv[1]+tv[3]-oz),fill:'url(#ig-ca-terra)'},tav);
  /* all'orizzonte, i campi di Goti e Romani */
  for(i=0;i<18;i++){ var hx=tv[0]+tv[2]*(.03+i*.055)+Rst()*10, hs=5+Rst()*6, tg=el('path',{d:'M'+r1(hx-hs)+' '+r1(oz)+' L'+r1(hx)+' '+r1(oz-hs*1.1)+' L'+r1(hx+hs)+' '+r1(oz)+' Z','class':'ig-ca-tenda'},tav);
    if(i%3===1){ var fc=el('circle',{cx:r1(hx+hs*1.6),cy:r1(oz-1.5),r:2.2,'class':'ig-ca-fuoco-lontano'},tav); fc.style.animationDelay=(-Rst()*2).toFixed(2)+'s'; } }
  var C=scenaRecinto(tav,defs,tv,oz,oriz2,false), brace=C.brace, sel=C.sel, attila=C.attila, arcieri=C.arcieri, tRogo=C.tRogo, corteo=C.corteo, cx=C.cx, cy=C.cy, rx=C.rx, ry=C.ry;      // il recinto, il rogo, Attila, gli arcieri, il corteo (scenaRecinto, più su)
  var trombe=[]; [[-.95,-.6],[.95,-.7]].forEach(function(q,ii){ var p=[cx+q[0]*rx,cy+q[1]*ry-10], g=el('g',{'class':'ig-ca-tromba',transform:'translate('+xy(p)+')'},tav);
    for(var k=0;k<3;k++){ var ar=el('path',{d:'M0 '+r1(-8-k*7)+' A'+r1(8+k*7)+' '+r1(8+k*7)+' 0 0 '+(q[0]<0?0:1)+' 0 '+r1(8+k*7),'class':'ig-ca-onda'},g); ar.style.animationDelay=(k*.35+ii*.2).toFixed(2)+'s'; ar.setAttribute('transform','scale('+(q[0]<0?-1:1)+',1)'); } trombe.push(g); });
  /* le parole di Giordane, in alto a sinistra (sul telefono in alto, su tutta la larghezza) */
  var gQ=el('g',null,gC), qx=tv[0]+18, qw=oriz2?Math.min(tv[2]*(stretto?.52:.38),360):tv[2]-36, fq=Math.max(15,oriz2?Math.min(22,qw/14):Math.min(18,qw/16));
  function scritta(y,q,chi,t){ var g=el('g',{'class':'ig-ca-scritta'},gQ), te=el('text',{x:r1(qx),y:r1(y),'class':'ig-ca-q'},g); te.style.fontSize=fq+'px'; var n=avvolgi(te,q,qw,fq*1.2);
    tx(g,qx,y+(n-1)*fq*1.2+fq*.95,'ig-ca-q-chi',chi); return {g:g,t:t}; }
  var SQ=[scritta(tv[1]+30,'«come un leone stretto dalle lance dei cacciatori, che si aggira davanti alla tana»','Giordane 212',T.c1+900),
    scritta(tv[1]+30,'«si racconta che avesse costruito un rogo di selle di cavallo»','Giordane 213 · equinis sellis construxisse pyram',T.c2+800),
    scritta(tv[1]+30,'«lo portarono via con i canti, sotto gli occhi dei nemici»','Giordane 214',T.c3+600)];

  /* ---------- D. i morti di Giordane ---------- */
  var gD=el('g',{'class':'ig-atto'},svg), nb, ab2;
  if(oriz&&!stretto){ nb=[pad+6,pad,Math.min(W*.46,460),H-2*pad]; ab2=[nb[0]+nb[2]+30,pad,W-(nb[0]+nb[2]+30)-pad,H-2*pad]; }
  else { nb=[pad+(stretto?6:0),pad,W-2*pad-(stretto?12:0),stretto?186:Math.min(H*.5,240)]; ab2=[pad,nb[1]+nb[3]+8,W-2*pad,H-(nb[1]+nb[3]+8)-pad]; }
  var yN=nb[1]+(oriz&&!stretto?Math.max(24,nb[3]*.16):22), fN=oriz&&!stretto?64:46;
  var tN0=tx(gD,nb[0],yN,'ig-m-testata','I MORTI, SECONDO GIORDANE'), cN=tx(gD,nb[0],yN+fN+4,'ig-ca-num','0'); cN.style.fontSize=fN+'px';
  var tN1=el('text',{x:r1(nb[0]),y:r1(yN+fN+30),'class':'ig-ad-conto-t ig-f'},gD); if(stretto) tN1.style.fontSize='15.5px'; var n1=avvolgi(tN1,'più 15.000 Franchi e Gepidi uccisi la notte prima',nb[2],stretto?17:20);
  var bollo=el('g',{'class':'ig-ca-bollo'},gD), yb=yN+fN+30+n1*(stretto?17:20)+(stretto?10:18), bt=tx(bollo,nb[0]+10,yb+17,'ig-ca-bollo-t','CIFRA DELLA FONTE · NON CREDIBILE COME CONTO');
  if(largo(bt)>nb[2]-20){ bt.textContent='CIFRA DELLA FONTE'; } var bw3=largo(bt)+20; el('rect',{x:r1(nb[0]),y:r1(yb),width:r1(bw3),height:26,rx:4,'class':'ig-ca-bollo-r'},bollo).parentNode.insertBefore(bollo.lastChild,bollo.firstChild);
  var tN2=el('text',{x:r1(nb[0]),y:r1(yb+50),'class':'ig-ad-conto-n ig-f'},gD); avvolgi(tN2,'«clxv milia caesa referuntur»: «si dice» che ne siano caduti 165.000. Giordane scrive verso il 551, un secolo dopo.',nb[2],stretto?16:18); if(stretto) tN2.style.fontSize='12.5px';
  /* la linea del tempo: chi scrive, e quando */
  var gL=el('g',{'class':'ig-ca-linea'},gD), lx0=ab2[0]+10, lx1=ab2[0]+ab2[2]-10, ly=ab2[1]+ab2[3]*(oriz&&!stretto?.56:.5), XL=function(a){ return lx0+(a-445)/(560-445)*(lx1-lx0); };
  el('line',{x1:r1(lx0),x2:r1(lx1),y1:r1(ly),y2:r1(ly),'class':'ig-ca-asse'},gL); [450,500,550].forEach(function(a){ el('line',{x1:r1(XL(a)),x2:r1(XL(a)),y1:r1(ly-4),y2:r1(ly+4),'class':'ig-ca-asse'},gL); tx(gL,XL(a),ly+20,'ig-asse',String(a),'middle'); });
  var arcoT=el('path',{d:'M'+r1(XL(455))+' '+r1(ly-8)+' Q'+r1((XL(455)+XL(551))/2)+' '+r1(ly-ab2[3]*.22)+' '+r1(XL(551))+' '+r1(ly-8),'class':'ig-ca-arco'},gL); scopri(arcoT);
  var tSec=tx(gL,(XL(455)+XL(551))/2,ly+44,'ig-ca-sec','un secolo','middle');
  function evento(a,nome,sotto,cl,su){ var g=el('g',{'class':'ig-ca-ev '+cl},gL), x=XL(a); el('circle',{cx:r1(x),cy:r1(ly),r:cl==='batt'?8:6},g);
    var an=a>520?'end':a<460?'start':'middle', xt=x+(an==='start'?-8:an==='end'?8:0), t2=el('text',{x:r1(xt),y:0,'class':'ig-ca-ev-t','text-anchor':an},g), n=avvolgi(t2,sotto,Math.min(220,ab2[2]*.62),15);
    var y1=su?ly-22-(n-1)*15-20:ly+42; t2.setAttribute('y',r1(y1+18)); [].forEach.call(t2.childNodes,function(c){ c.setAttribute('x',r1(xt)); }); tx(g,xt,y1,'ig-ca-ev-n',nome,an); return g; }
  var eB=evento(451,'451','la battaglia','batt',false), eP=evento(455,'Prospero','in quegli anni: nessun numero','pros',true), eG=evento(551,'Giordane','un secolo dopo: 165.000','gior',false);

  /* ---------- la regia ---------- */
  S.passo=function(t){
    /* A */
    cls(gA,'vis',t>=300&&t<T.b1-300);
    segui(r1a,E.io(fase(t,T.a1+200,T.a1+2000))); cls(reno,'vis',t>=T.a1+1600); segui(r1b,E.io(fase(t,T.a1+2000,T.a1+2700))); cls(sME,'vis',t>=T.a1+2700);
    segui(r2a,E.io(fase(t,T.a2,T.a2+1700))); segui(r2e,E.io(fase(t,T.a2+1500,T.a2+3300))); segui(r2t,E.io(fase(t,T.a2+1700,T.a2+3500))); cls(sOR,'vis',t>=T.a2+1500&&t<T.a3+600);
    segui(r3,E.io(fase(t,T.a3+200,T.a3+2000))); cls(zonaC,'vis',t>=T.a3+1800); cls(sCC,'vis',t>=T.a3+2400);
    [pME,pOR,pAR,pTO,pMZ].forEach(function(p){ cls(p,'vis',t>=400); }); cls(avvA,'vis',t>=T.a1+800);
    var ri=-1; REG.forEach(function(r,ii){ if(t>=r.t) ri=ii; });
    if(modo==='righe'){ righe.forEach(function(r,ii){ cls(r,'vis',ii<=ri); cls(r,'ora',ii===ri); }); cls(gChi,'vis',t>=T.a3+3200); }
    else if(sch){ cls(sch.g,'vis',ri>=0); if(sch.ri!==ri&&ri>=0){ sch.ri=ri; var r=REG[ri]; scrivi(sch.n,r.n); sch.s.textContent=''; var ns=avvolgi(sch.s,r.s,lb[2],16); sch.f.setAttribute('y',r1(+sch.s.getAttribute('y')+ns*16+2)); scrivi(sch.f,r.f); } }
    /* B */
    cls(gB,'vis',t>=T.b1-400&&t<T.c1-300);
    var avR=E.io(fase(t,T.b5,T.b5+2200)), avU=E.io(fase(t,T.b5+200,T.b5+2400)), vis6=E.io(fase(t,T.b6,T.b6+2400)), riU=E.io(fase(t,T.b6+600,T.b6+3200));
    R.forEach(function(b,ii){ var e=E.out(fase(t,T.b2+ii*70,T.b2+900+ii*70)), x=b.b[0]-(1-e)*6+avR*18+(b.n==='visigoti'?vis6*9:0), y=b.b[1]; fissa(b.g,'transform','translate('+xy(Fp(x,y))+')'); cls(b.g,'vis',e>0); cls(b.g,'scuro',t>=T.b6+2600&&b.n!=='visigoti'); });
    U.forEach(function(b,ii){ var e=E.out(fase(t,T.b3+ii*70,T.b3+900+ii*70)), x=b.b[0]+(1-e)*6-avU*17, y=b.b[1]; if(b.n==='unni'){ x=lerp(x,CR[0]-2,riU); y=lerp(y,CR[1]+(b.b[1]-31.5)*.6,riU); } else x+=riU*5;
      fissa(b.g,'transform','translate('+xy(Fp(x,y))+')'); cls(b.g,'vis',e>0&&!(b.n==='unni'&&riU>=1)); });
    cls(recAl,'vis',t>=T.b2+1500&&t<T.b5); fissa(recAl,'transform','');
    ['romani','alani','visigoti'].forEach(function(n){ cls(etG[n],'vis',t>=T.b2+600&&t<T.b4); }); ['gepidi','unni','ostrogoti'].forEach(function(n){ cls(etG[n],'vis',t>=T.b3+600&&t<T.b4); });
    cls(tCol,'vis',t>=T.b1+400&&t<T.b2); cls(tRec,'vis',t>=T.b1+800&&t<T.b2||t>=T.b6+1600&&t<T.c1); cls(cima,'vis',t>=T.b4);
    var pA=pista([[T.b3,82.5,31.5],[T.b6+600,82.5-avU*17+3,31.5],[T.b6+2600,CR[0],CR[1]]],t); if(t<T.b6+600) pA=[82.5-avU*17*.6,31.5]; fissa(kAt.g,'transform','translate('+xy(Fp(pA[0],pA[1]))+')'); cls(kAt.g,'vis',t>=T.b3+800);
    var pT=[23+avR*18,43]; fissa(kTe.g,'transform','translate('+xy(Fp(pT[0],pT[1]))+')'); cls(kTe.g,'vis',t>=T.b2+900&&t<T.b5+2200); fissa(croce,'transform','translate('+xy(Fp(pT[0],pT[1]))+')'); cls(croce,'vis',t>=T.b5+2200&&t<T.b6+3000); mischia.forEach(function(m,ii){ cls(m,'vis',t>=T.b5+1700+ii*200&&t<T.b6+1600); });
    var pTo=pista([[T.b4+200,27,37],[T.b4+2000,46,8.4],[T.b5,46,8.4],[T.b5+1600,40,30],[T.b6+2400,50,40],[T.b6+4400,CR[0]-4,CR[1]+8]],t); fissa(kTo.g,'transform','translate('+xy(Fp(pTo[0],pTo[1]))+')'); cls(kTo.g,'vis',t>=T.b4); scrivi(kTo.t,t>=T.b6+4200?'Torismondo, ferito':'Torismondo');
    var pEz=pista([[T.b4+200,24,22],[T.b4+2000,43,9.6],[T.b5,43,9.6],[T.b5+1600,38,20],[T.b6+2400,58,24],[T.b6+3600,46,30],[T.b6+5200,20,26]],t); fissa(kEz.g,'transform','translate('+xy(Fp(pEz[0],pEz[1]))+')'); cls(kEz.g,'vis',t>=T.b4); scrivi(kEz.t,t>=T.b6+4600?'Ezio, fra gli scudi':'Ezio');
    vetta.forEach(function(v,ii){ var p=pista([[T.b4+500,70,22+ii*2],[T.b4+2400,57+ii*1.6,9+ii*1.4],[T.b4+2700,57+ii*1.6,9+ii*1.4],[T.b4+4200,68,19+ii*2]],t), p2=pista([[T.b4+500,70,22+ii*2],[T.b4+2400,57+ii*1.6,9+ii*1.4],[T.b4+2700,57+ii*1.6,9+ii*1.4],[T.b4+4200,68,19+ii*2]],t-80);
      var an=Math.hypot(p[0]-p2[0],p[1]-p2[1])>.01?Math.atan2(p[1]-p2[1],p[0]-p2[0])*180/Math.PI:200; fissa(v,'transform','translate('+xy(Fp(p[0],p[1]))+') rotate('+r1(an)+')'); cls(v,'vis',t>=T.b4+400&&t<T.b4+4400); });
    cls(rivo,'sangue',t>=T.b5+2600); cls(tRivo,'vis',t>=T.b5+2800&&t<T.b6+600);
    fissa(notte,'opacity',r1(E.io(fase(t,T.b6+1800,T.b6+4400))*.55*100)/100);
    var fo=t<T.b6+1800?0:t<T.b6+4400?lerp(0,.5,E.io(fase(t,T.b6+1800,T.b6+4400))):lerp(.5,1,E.io(fase(t,T.b6+5000,T.b6+6800)));
    if(ora.set) ora.set(fo,fo>.3&&fo<.8); else scrivi(ora.solo,fo<.3?'nona ora':fo<.8?'notte':'il giorno dopo');
    quote.forEach(function(q,ii){ cls(q.g,'vis',t>=q.t&&(ii===quote.length-1||t<quote[ii+1].t)); });
    /* C */
    cls(gC,'vis',t>=T.c1-300&&t<T.d1-300);
    arcieri.forEach(function(a){ cls(a,'vis',t>=T.c1+600); }); trombe.forEach(function(a){ cls(a,'vis',t>=T.c1+300&&t<T.c3); });
    sel.forEach(function(s,ii){ cls(s,'vis',t>=T.c2+600+ii*170); }); cls(tRogo,'vis',t>=T.c2+3200); cls(attila,'vis',t>=T.c1+200);
    fissa(brace,'opacity',r1((.45+.35*E.io(fase(t,T.c2+1200,T.c2+3400)))*100)/100);      // una luce ferma: il rogo non è acceso (Giordane: lo aveva preparato)
    var pc=E.io(fase(t,T.c3+400,T.c3+5000)); fissa(corteo,'transform',pc>0?'translate('+r1(-pc*tv[2]*.22)+',0)':''); cls(corteo,'vis',t>=T.c3+200);
    SQ.forEach(function(q,ii){ cls(q.g,'vis',t>=q.t&&(ii===SQ.length-1||t<SQ[ii+1].t)); });
    /* D */
    cls(gD,'vis',t>=T.d1-300); var fn=E.out(fase(t,T.d1+400,T.d1+2600)); scrivi(cN,num(Math.round(165000*fn/1000)*1000));
    cls(tN1,'vis',t>=T.d1+2400); cls(bollo,'vis',t>=T.d1+3000); cls(tN2,'vis',t>=T.d1+3800);
    cls(eB,'vis',t>=T.d1+4400); cls(eP,'vis',t>=T.d1+5200); cls(eG,'vis',t>=T.d1+6000); traccia(arcoT,E.io(fase(t,T.d1+5400,T.d1+6800))); cls(tSec,'vis',t>=T.d1+6800); cls(gL,'vis',t>=T.d1+4000);
  };
  S.dura=T.fin;
  var bt=[T.a1,T.a2,T.a3,T.b1,T.b2,T.b3,T.b4,T.b5,T.b6,T.c1,T.c2,T.c3,T.d1];
  S.battute=CATALAUNICI.fasi.map(function(f,ii){ return {t:bt[ii],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   13. Capo Bon (468)
   Aggiunta il 23 novembre 2026. Quadri: la flotta e i tre fronti sulla carta della pagina; Mercurio e i cinque giorni; i brulotti; Giovanni; l'esito. Fonte letta: Procopio, Guerre III 6
   nella traduzione inglese di Dewing (LacusCurtius, pagina 3B). 6, 1: Leone raccoglie un esercito «they say… about one hundred thousand men» e una flotta «from the whole of the eastern
   Mediterranean»; 6, 2: «thirteen hundred centenaria were expended by him to no purpose» (nota 10 di Dewing: «130,000 Roman pounds»), comandante Basilisco, fratello della moglie Berina;
   6, 8: Marcelliano «bade him go to the island of Sardinia… he drove out the Vandals»; 6, 9: Eraclio «sent from Byzantium to Tripolis… leaving his ships there, led his army on foot toward
   Carthage»; 6, 10: Basilisco «put in at a town distant from Carthage no less than two hundred and eighty stades», Mercurio, dal tempio di Ermes; 6, 10-11: preso subito Cartagine, se non avesse
   esitato, «whether caused by cowardice or treachery»; 6, 11: la flotta «such as the Romans were said never to have had before»; 6, 12: Genserico riempie le navi, «but not all, for some he kept in
   readiness empty, and they were the ships which sailed most swiftly»; 6, 13-15: la tregua di cinque giorni, l'oro mandato di nascosto, il vento favorevole atteso; 6, 17-18: «taking in tow the boats…
   they set fire to the boats… when their sails were bellied by the wind, and let them go against the Roman fleet»; 6, 19-21: il fuoco che passa da una nave all'altra, «a great din that rivalled
   the noise caused by the wind and the roaring of the flames», le pertiche, i Vandali che speronano e affondano; 6, 22-24: Giovanni, Genzone, «that John would never come under the hands of dogs»;
   6, 25-26: Eraclio torna a casa, Marcelliano ucciso a tradimento, Basilisco supplice in Santa Sofia. Procopio non dà il numero delle navi. Schemi: le rotte (Procopio non le dice), la posizione
   delle navi, la direzione del vento, l'ordine in cui il fuoco passa da una nave all'altra. Che Mercurio sia presso Capo Bon è l'identificazione della carta della pagina (SCENE_CARTA[468]). */
var CAPOBON={ titolo:"Capo Bon", sotto:"468: la grande flotta contro i Vandali e i brulotti di Genserico, secondo Procopio",
  fasi:[["468","Per punire i Vandali, l'imperatore d'Oriente Leone raccoglie navi da tutto il Mediterraneo orientale. Secondo Procopio, si diceva che l'esercito contasse circa centomila uomini."],
    ["468","Si diceva anche che Leone avesse speso milletrecento «centenari», e invano. Sono cifre riferite da Procopio, che scrive circa ottant'anni dopo; quante fossero le navi, non lo dice."],
    ["468","La guerra ha tre fronti. Marcelliano toglie la Sardegna ai Vandali. Eraclio, partito da Costantinopoli, sbarca a Tripoli, batte i Vandali e marcia a piedi verso Cartagine. Basilisco, cognato di Leone, guida la flotta."],
    ["Mercurio","Basilisco getta l'ancora con tutta la flotta a Mercurio, un luogo che prende il nome da un antico tempio di Ermes, a non meno di 280 stadi da Cartagine."],
    ["Mercurio","Secondo Procopio, se fosse andato subito su Cartagine l'avrebbe presa al primo assalto: Genserico aveva paura. Ma Basilisco esita, per viltà o per tradimento."],
    ["Cinque giorni","Genserico arma i suoi e riempie le navi, ma ne tiene alcune vuote, le più veloci. Chiede a Basilisco cinque giorni di tregua. Si raccontava che gli avesse mandato anche molto oro, di nascosto."],
    ["Cinque giorni","Basilisco accetta e resta fermo. Genserico aspetta il vento favorevole, e il vento arriva."],
    ["Il fuoco","I Vandali spiegano le vele e rimorchiano le barche vuote. Arrivati vicino, le incendiano e le lasciano andare, con le vele gonfie di vento, contro la flotta romana."],
    ["Il fuoco","Le navi romane sono tante e vicine: il fuoco passa dall'una all'altra. Soldati e marinai gridano e respingono con le pertiche i brulotti e le loro stesse navi."],
    ["Il fuoco","Intanto arrivano i Vandali: speronano, affondano, catturano chi tenta di fuggire e ne prendono le armi."],
    ["Giovanni","Giovanni, un generale di Basilisco estraneo al tradimento, combatte sul ponte della sua nave. Quando sta per essere presa, si getta in mare con tutte le armi. Genzone, figlio di Genserico, gli promette salva la vita: Giovanni risponde che non cadrà mai «nelle mani dei cani»."],
    ["Dopo","Basilisco torna a Costantinopoli e si rifugia supplice in Santa Sofia. Eraclio torna a casa; Marcelliano è ucciso a tradimento da un altro ufficiale. L'Occidente perde l'ultima occasione di riprendere l'Africa."]],
  fonte:"Procopio, Guerre III 6, nella traduzione inglese di Dewing (LacusCurtius), con la sua nota sui centenari («130.000 libbre romane»). Procopio scrive a Costantinopoli verso il 550, circa ottant'anni dopo; l'esercito di centomila uomini e la spesa di milletrecento centenari sono cifre che riferisce come voci («si dice»), e il numero delle navi non lo dà. Non ci è giunto un racconto contemporaneo della sconfitta: Idazio registra soltanto la partenza della flotta. Le rotte sono uno schema: Procopio non dice la strada della flotta, di Eraclio e di Marcelliano. Che Mercurio sia presso Capo Bon è l'identificazione della carta di questa pagina. La disposizione delle navi, la direzione del vento e l'ordine in cui il fuoco passa da una nave all'altra sono disegni schematici." };
function disegnaCapobon(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G||!G.citta) return;
  var oriz=W/H>=1.15, stretto=oriz&&W<700, pad=oriz?20:12, defs=el('defs',null,svg), i, j;
  var T={a1:1400,a2:6800,a3:12000,b1:18400,b2:24000,b3:29600,b4:35600,c1:41000,c2:47000,c3:53000,d1:59000,d2:66000}; T.fin=T.d2+8000;
  var CO={roma:'#9A2F2A',vandali:'#6E5634',era:'#8A5A9E',marc:'#2F6E7A'};
  grad(defs,'ig-cb-mare',[[0,'#2C4F5E'],[1,'#1B3542']]); grad(defs,'ig-cb-alba',[[0,'#F3E2C4'],[.55,'#E9C99A'],[1,'#9DB8BE']]);
  grad(defs,'ig-cb-vampa',[[0,'#FFD27A',.85],[.45,'#F08A2E',.4],[1,'#F08A2E',0]],{cx:'50%',cy:'50%',r:'50%'});
  grad(defs,'ig-cb-onda',[[0,'#7FA6B3'],[1,'#4D7684']]);
  grad(defs,'ig-cb-cielo2',[[0,'#CBB89A'],[.6,'#E6D3B0'],[1,'#EFE2C6']]); grad(defs,'ig-cb-acqua',[[0,'#7E9EA6'],[.35,'#587B86'],[1,'#2F4F5A']]);      // la scena di Giovanni

  /* ---------- A. la flotta e i tre fronti ---------- */
  var gA=el('g',{'class':'ig-atto'},svg), V=[392,282,362,282], mb;
  if(oriz){ var mh=H-2*pad, mw=mh*V[2]/V[3]; if(mw>W*(stretto?.6:.58)){ mw=W*(stretto?.6:.58); mh=mw*V[3]/V[2]; } mb=[W-pad-mw,(H-mh)/2,mw,mh]; }
  else { var mw2=W-2*pad, mh2=Math.min(mw2*V[3]/V[2],H*.6); mw2=mh2*V[2]/V[3]; mb=[(W-mw2)/2,pad,mw2,mh2]; }
  var F=finestra(gA,defs,'ig-cb-clipA',V,mb,{stati:statiDi(468)}), sA=F.sopra, MP=F.M, Cq=F.C;
  var CP=Cq('costantinopoli'), CT=Cq('cartagine'), CB=Cq('capobon'), TR=Cq('tripoli'); if(!CP||!CT||!CB||!TR) return;
  var giro=['costantinopoli','marmara','propontide','gallipoli','lampsaco','ellesponto','abido','dardanelli','egeo','cicladi','cicladisud','malea','matapan','ionio','canale','capobon'].map(Cq).filter(function(q){ return q; });
  var rF=rotta(sA,defs,giro,{c:CO.roma,schema:true,nome:'Basilisco',dove:.62,dy:-10});
  var rM=rotta(sA,defs,[[537,318],[552,338],[572,365],[580,392],[562,425],[522,463],[498,473],[470,452],[452,432],[436,414],[428,406]].map(MP),{c:CO.marc,schema:true,nome:'Marcelliano',dove:.12,dx:9,an:'start'});
  var rE=rotta(sA,defs,[[697.9,448.9],[662,492],[610,512],[545,528],[500,540],[486,544]].map(MP),{c:CO.era,schema:true,nome:'Eraclio',dove:.5,dy:16});
  var rE2=rotta(sA,defs,[[484,545],[462,545],[440,535],[425,515],[430,490],[432,474]].map(MP),{c:CO.era,nome:'a piedi',dove:.5,dx:8,an:'start'});
  var pCP=luogo(sA,CP,'Costantinopoli',-6,17,'end'), pCT=luogo(sA,CT,'Cartagine',2,-10,'middle','grande'), pTR=luogo(sA,TR,'Tripoli',9,13,'start'), pSA=luogo(sA,MP([416.7,388.5]),'Sardegna',9,4,'start','tenue');
  var mCB=el('g',{'class':'ig-f'},sA); el('circle',{cx:r1(CB[0]),cy:r1(CB[1]),r:9,'class':'ig-m-onda vis'},mCB);
  var avvA=el('text',{x:r1(mb[0]+10),y:r1(mb[1]+18),'class':'ig-m-avverte su-carta'},gA); avvA.textContent='le rotte sono uno schema: Procopio non le dice'; if(largo(avvA)>mb[2]-20) avvA.textContent='rotte: uno schema';
  var lb=oriz?[pad+4,pad,mb[0]-pad-30,H-2*pad]:[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-4];
  var gR=el('g',null,gA), largoR=lb[2]>=300&&lb[3]>=280, blocchi=[];
  function blocco(y,num,et,nota,t){ var g=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(y)+')'},gR)), c=tx(g,lb[0],largoR?40:30,'ig-cb-num','0'); c.style.fontSize=(largoR?44:30)+'px';
    var sotto=lb[2]<260, dx=sotto?0:largoR?(num>9999?190:150):(num>9999?124:90), e=el('text',{x:r1(lb[0]+dx),y:sotto?52:largoR?20:12,'class':'ig-cb-num-t'},g), ne=avvolgi(e,et,lb[2]-dx,16); if(sotto) nota=null;
    if(nota){ var n=el('text',{x:r1(lb[0]+dx),y:r1((largoR?20:12)+ne*16+2),'class':'ig-cb-num-n'},g); avvolgi(n,nota,lb[2]-dx,14); } return {g:g,c:c,t:t}; }
  if(largoR){ var y0=lb[1]+Math.max(0,(lb[3]-330)/2); tx(gR,lb[0],y0+12,'ig-m-testata','LA FLOTTA DELLE DUE CORTI'); tx(gR,lb[0],y0+31,'ig-m-sotto','Procopio, Guerre III 6, verso il 550');
    blocchi.push(blocco(y0+52,100000,'uomini, «si diceva»','la cifra è una voce che Procopio riferisce',T.a1+400)); blocchi.push(blocco(y0+132,1300,'«centenari» spesi, e «invano»','130.000 libbre romane, secondo la nota di Dewing',T.a2+300));
    var gTre=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(y0+222)+')'},gR)); tx(gTre,lb[0],12,'ig-m-testata','TRE FRONTI');
    [['Basilisco','la flotta, verso Cartagine',CO.roma],['Marcelliano','la Sardegna',CO.marc],['Eraclio','da Tripoli, a piedi',CO.era]].forEach(function(q,ii){ var y=34+ii*22; el('circle',{cx:r1(lb[0]+6),cy:r1(y-4),r:5,style:'fill:'+q[2]},gTre); tx(gTre,lb[0]+18,y,'ig-cb-fr-n',q[0]); tx(gTre,lb[0]+128,y,'ig-cb-fr-t',q[1]); });
    blocchi.push({g:gTre,t:T.a3}); }
  else { blocchi.push(blocco(lb[1]+(oriz?4:0),100000,'uomini, «si diceva»',null,T.a1+400)); blocchi.push(blocco(lb[1]+(oriz?4:0)+(oriz?Math.min(lb[2]<260?96:110,lb[3]/2.6):54),1300,'«centenari» spesi, «invano»',oriz?'130.000 libbre romane (nota di Dewing)':null,T.a2+300)); }
  var navNota=tx(gR,lb[0],lb[1]+lb[3]-6,'ig-m-avverte','Quante fossero le navi, Procopio non lo dice.'); if(largo(navNota)>lb[2]) navNota.textContent='Le navi: Procopio non dice quante.';

  /* ---------- B. Mercurio e i cinque giorni ---------- */
  var gB=el('g',{'class':'ig-atto'},svg), VB=[420,434,46,34], bb;
  if(oriz){ var bh=H-2*pad, bw=bh*VB[2]/VB[3]; if(bw>W*(stretto?.5:.6)){ bw=W*(stretto?.5:.6); bh=bw*VB[3]/VB[2]; } bb=[W-pad-bw,(H-bh)/2,bw,bh]; }
  else { var bw2=W-2*pad, bh2=Math.min(bw2*VB[3]/VB[2],H*.56); bw2=bh2*VB[2]/VB[3]; bb=[(W-bw2)/2,pad,bw2,bh2]; }
  var FB=finestra(gB,defs,'ig-cb-clipB',VB,bb,{rilievo:false,stati:statiDi(468)}), sB=FB.sopra, MB=FB.M, kB=FB.k;
  var CTb=FB.C('cartagine'), CBb=FB.C('capobon');
  var pCTb=luogo(sB,CTb,'Cartagine',-9,-7,'end','grande'), tem=el('g',{'class':'ig-v-luogo vis',transform:'translate('+xy(MB([446.2,456.2]))+')'},sB);
  el('path',{d:'M-7 -1 L0 -7 L7 -1 Z M-6 0 H6 V7 H-6 Z','class':'ig-cb-tempio'},tem); var tMe=tx(tem,-10,-4,'ig-v-nome','Mercurio','end'), tTe=tx(tem,-10,10,'ig-cb-tempio-t','il tempio di Ermes','end');
  /* se i nomi del tempio arrivano su «Cartagine» (sul telefono), passano a destra del tempio */
  var TE=MB([446.2,456.2]), xCT=CTb[0]-9, yCT=CTb[1]-7; function tocca(t,y){ return TE[0]-10-largo(t)<xCT+4 && Math.abs(y-yCT)<18; }
  if(tocca(tMe,TE[1]-4)||tocca(tTe,TE[1]+10)) [tMe,tTe].forEach(function(t){ t.setAttribute('x',10); t.setAttribute('text-anchor','start'); });
  var dist=el('g',{'class':'ig-f'},sB), dA=MB([436,457.4]), dB=MB([445.6,456.8]); el('path',{d:'M'+xy(dA)+' Q'+xy([(dA[0]+dB[0])/2,(dA[1]+dB[1])/2+26])+' '+xy(dB),'class':'ig-cb-dist'},dist);
  var tDist=tx(dist,(dA[0]+dB[0])/2,(dA[1]+dB[1])/2+30,'ig-cb-dist-t','non meno di 280 stadi','middle');
  /* le navi romane all'ancora e quelle dei Vandali nel porto: solo dove la carta è mare */
  function inMare(c,rx,ry,n,seme){ var R=caso(seme), out=[], prove=0; while(out.length<n&&prove<4000){ prove++; var a=R()*Math.PI*2, d=Math.sqrt(R()), p=[c[0]+Math.cos(a)*rx*d,c[1]+Math.sin(a)*ry*d];
      if(FB.inTerra(p)||FB.inTerra([p[0]+.6,p[1]])||FB.inTerra([p[0]-.6,p[1]])) continue; var ok=true; for(var q=0;q<out.length;q++) if(Math.hypot(out[q][0]-p[0],out[q][1]-p[1])<.95) ok=false; if(ok) out.push(p); } return out; }
  var Lb=Math.max(9,kB*1.15), flottaB=inMare([453.5,446.5],7,5.5,46,468).map(function(p){ var o=el('g',{transform:'translate('+xy(MB(p))+') rotate(195)'},sB); return {g:naveAlto(o,Lb,'roma'),p:p}; });
  var vandB=inMare([437.5,450],3.2,2.4,12,439).map(function(p,ii){ var o=el('g',{transform:'translate('+xy(MB(p))+') rotate(15)'},sB); return naveAlto(o,Lb*(ii<4?.8:1),ii<4?'vuota':'vandali'); });
  var vento=el('g',{'class':'ig-cb-vento'},sB); for(i=0;i<9;i++){ var v0=MB([424+(i%3)*4,441+i*2.6]), lv=kB*11; var vl=el('path',{d:'M'+xy(v0)+' q'+r1(lv*.35)+' '+r1(-kB*1.2)+' '+r1(lv*.7)+' 0 t'+r1(lv*.3)+' 0','class':'ig-cb-vento-l scuro'},vento); vl.style.animationDelay=(-i*.37).toFixed(2)+'s'; }
  var tVento=tx(sB,MB([428,439])[0],MB([428,439])[1],'ig-cb-et','il vento, favorevole ai Vandali (direzione: schema)','start'); if(largo(tVento)>bb[2]*.8) tVento.textContent='il vento (schema)';
  var tFlB=tx(sB,MB([453.5,438.5])[0],MB([453.5,438.5])[1],'ig-cb-et','la flotta di Basilisco','middle'), tVaB=tx(sB,MB([436,447])[0],MB([436,447])[1],'ig-cb-et','i Vandali','middle');
  var sbB=oriz?[pad+4,pad,bb[0]-pad-30,H-2*pad]:[pad,bb[1]+bb[3]+12,W-2*pad,H-(bb[1]+bb[3]+12)-4];
  var gPB=el('g',null,gB), cal=[], gOro;
  var tM1=tx(gPB,sbB[0],sbB[1]+(oriz?26:20),'ig-m-data','MERCURIO'); tM1.style.fontSize=(oriz?26:19)+'px';
  var tM2=el('text',{x:r1(sbB[0]),y:r1(sbB[1]+(oriz?48:38)),'class':'ig-m-sotto'},gPB); var nm2=avvolgi(tM2,'«non meno di 280 stadi» da Cartagine',sbB[2],17);
  var yc=sbB[1]+(oriz?48:38)+nm2*17+(oriz?26:16), gCal=el('g',{'class':'ig-ad-num'},gPB), cw=Math.min(52,(sbB[2]-4*8)/5);
  var tTr=tx(gCal,sbB[0],yc,'ig-m-testata','LA TREGUA: CINQUE GIORNI'); if(largo(tTr)>sbB[2]) tTr.textContent='CINQUE GIORNI';
  for(i=0;i<5;i++){ var gx=sbB[0]+i*(cw+8), gq=el('g',{'class':'ig-cb-giorno'},gCal); el('rect',{x:r1(gx),y:r1(yc+10),width:r1(cw),height:r1(cw*.8),rx:6,'class':'ig-cb-giorno-r'},gq); tx(gq,gx+cw/2,yc+10+cw*.52,'ig-cb-giorno-n',['I','II','III','IV','V'][i],'middle'); cal.push(gq); }
  var yo=yc+10+cw*.8+(oriz?28:18); gOro=el('g',{'class':'ig-ad-num'},gPB); for(i=0;i<3;i++) el('ellipse',{cx:r1(sbB[0]+9+i*5),cy:r1(yo-4-i*3),rx:9,ry:3.4,'class':'ig-cb-moneta'},gOro);
  var tOro=el('text',{x:r1(sbB[0]+34),y:r1(yo-4),'class':'ig-cb-num-t'},gOro), nOro=avvolgi(tOro,'oro mandato di nascosto, «si diceva»',sbB[2]-34,15);
  var gVen=el('g',{'class':'ig-ad-num'},gPB), yv=yo+(oriz?32:24)+(nOro-1)*15; for(i=0;i<3;i++){ var wl=el('path',{d:'M'+r1(sbB[0])+' '+r1(yv-8+i*6)+' q8 -4 16 0 t16 0','class':'ig-cb-vento-l fermo'},gVen); }
  tx(gVen,sbB[0]+40,yv,'ig-cb-num-t','e il vento arriva');

  /* ---------- C. i brulotti (schema dall'alto) ---------- */
  var gC=el('g',{'class':'ig-atto'},svg), tv=[pad,pad,W-2*pad,H-2*pad], oc=tv[2]/tv[3]>1.1;
  var cpC=el('clipPath',{id:'ig-cb-clipC'},defs); el('rect',{x:r1(tv[0]),y:r1(tv[1]),width:r1(tv[2]),height:r1(tv[3]),rx:14},cpC);
  var mare=el('g',{'clip-path':'url(#ig-cb-clipC)'},gC); el('rect',{x:r1(tv[0]),y:r1(tv[1]),width:r1(tv[2]),height:r1(tv[3]),fill:'url(#ig-cb-mare)'},mare);
  var Ro=caso(46); for(i=0;i<70;i++){ var ox=tv[0]+Ro()*tv[2], oy=tv[1]+Ro()*tv[3], ol=8+Ro()*16; el('path',{d:'M'+r1(ox)+' '+r1(oy)+' q'+r1(ol/2)+' -2.5 '+r1(ol)+' 0','class':'ig-cb-onda'},mare); }
  var Ln=Math.max(18,Math.min(oc?tv[2]/22:tv[2]/11,40)), flotta=[], fx0=tv[0]+tv[2]*(oc?.46:.18), fx1=tv[0]+tv[2]*(oc?.96:.94), fy0=tv[1]+tv[3]*(oc?.14:.44), fy1=tv[1]+tv[3]*(oc?.9:.94);
  var Rf=caso(4680), colsF=Math.max(4,Math.floor((fx1-fx0)/(Ln*1.25))), rowsF=Math.max(4,Math.floor((fy1-fy0)/(Ln*.62)));
  for(i=0;i<colsF;i++) for(j=0;j<rowsF;j++){ var px=fx0+(i+.5)*(fx1-fx0)/colsF+(Rf()-.5)*Ln*.3+(j%2?Ln*.3:0), py=fy0+(j+.5)*(fy1-fy0)/rowsF+(Rf()-.5)*Ln*.12;
    var o=el('g',{transform:'translate('+r1(px)+','+r1(py)+')'},mare), n=naveAlto(el('g',{transform:'rotate('+r1(180+(Rf()-.5)*14)+')'},o),Ln,'roma vis'), fu=el('g',{'class':'ig-cb-fuoco'},o);      // il fuoco fuori dalla rotazione: le fiamme salgono
    el('circle',{r:r1(Ln*.55),fill:'url(#ig-cb-vampa)'},fu); el('path',{d:FIAMMA,transform:'scale('+r1(Ln/26*100)/100+')','class':'ig-ad-fiamma grande'},fu); el('path',{d:FIAMMA,transform:'translate(0,1) scale('+r1(Ln/48*100)/100+')','class':'ig-ad-fiamma cuore'},fu);
    for(var k=0;k<2;k++){ var fm=el('circle',{cx:0,cy:0,r:r1(Ln*.22),'class':'ig-cb-fumo'},fu); fm.style.animationDelay=(-(i*.4+j*.7+k*1.1)%2.6).toFixed(2)+'s'; }
    flotta.push({o:o,n:n,fu:fu,p:[px,py],t:Infinity,sink:false}); }
  /* i brulotti: barche rimorchiate dalle navi vandale, poi lasciate andare in fiamme */
  var nB=oc?5:4, brul=[], vand=[], frontX=fx0+Ln*.2;
  var davanti=flotta.slice().sort(function(a,b){ return a.p[0]-b.p[0]; }).slice(0,Math.max(nB*2,8));
  for(i=0;i<nB;i++){ var yy=fy0+(i+.5)*(fy1-fy0)/nB, tgt=davanti.reduce(function(b,f){ return Math.abs(f.p[1]-yy)<Math.abs(b.p[1]-yy)?f:b; },davanti[0]);
    var ov=el('g',null,mare), nv=naveAlto(ov,Ln*1.05,'vandali vis'), ob=el('g',null,mare), nbt=naveAlto(ob,Ln*.7,'vuota vis'), fb2=el('g',{'class':'ig-cb-fuoco'},ob); el('circle',{r:r1(Ln*.5),fill:'url(#ig-cb-vampa)'},fb2); el('path',{d:FIAMMA,transform:'scale('+r1(Ln/30*100)/100+')','class':'ig-ad-fiamma grande'},fb2);
    var cavo=el('line',{'class':'ig-cb-cavo'},mare); tgt.t=Math.min(tgt.t,T.c1+4600+i*180); brul.push({ov:ov,ob:ob,fb:fb2,cavo:cavo,y:yy,x1:tgt.p[0]-Ln*.55,tgt:tgt}); }
  /* il fuoco passa da una nave all'altra: chi è vicino prende fuoco dopo un poco (schema) */
  var Rp=caso(66), cambiato=true; while(cambiato){ cambiato=false; flotta.forEach(function(a){ if(a.t===Infinity) return; flotta.forEach(function(b){ var d=Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1]); if(d<Ln*1.35){ var tb=a.t+420+d/Ln*260+((a.p[0]*7+b.p[1]*3)%5)*70; if(tb<b.t){ b.t=tb; cambiato=true; } } }); }); }
  flotta.forEach(function(f){ if(f.t>T.c3+600) f.t=Infinity; });
  var rami=flotta.filter(function(f){ return f.t===Infinity; }).sort(function(a,b){ return a.p[1]-b.p[1]; }), assalti=[];
  for(i=0;i<Math.min(4,rami.length);i++){ var bersaglio=rami[Math.floor((i+.5)*rami.length/Math.min(4,rami.length))], ov2=el('g',null,mare); naveAlto(ov2,Ln*1.05,'vandali vis'); assalti.push({o:ov2,b:bersaglio,da:[tv[0]+tv[2]*(oc?.2:.05)+i*6,bersaglio.p[1]+(i%2?-1:1)*Ln*.6]}); }
  var pertiche=[]; davanti.slice(0,6).forEach(function(f,ii){ var l=el('line',{x1:r1(f.p[0]-Ln*.2),y1:r1(f.p[1]),x2:r1(f.p[0]-Ln*.95),y2:r1(f.p[1]+(ii%2?-1:1)*Ln*.25),'class':'ig-cb-pertica'},mare); l.style.animationDelay=(-ii*.23).toFixed(2)+'s'; pertiche.push(l); });
  var ventoC=el('g',{'class':'ig-cb-vento'},mare); for(i=0;i<10;i++){ var vy=tv[1]+tv[3]*(.08+i*.09), vx=tv[0]+tv[2]*(.03+(i%3)*.08); var vl2=el('path',{d:'M'+r1(vx)+' '+r1(vy)+' q'+r1(tv[2]*.05)+' -6 '+r1(tv[2]*.1)+' 0 t'+r1(tv[2]*.08)+' 0','class':'ig-cb-vento-l'},ventoC); vl2.style.animationDelay=(-i*.3).toFixed(2)+'s'; }
  var schC=tx(gC,tv[0]+tv[2]-12,tv[1]+tv[3]-10,'ig-m-schema chiaro','schema: navi e fuoco disegnati, non contati','end'); if(largo(schC)>tv[2]-24) schC.textContent='schema';
  var gQ=el('g',null,gC), qx=tv[0]+16, qw=oc?Math.min(tv[2]*.38,330):tv[2]-32, fqc=Math.max(15,Math.min(oc?21:18,qw/14));
  function scrittaC(q,chi,t){ var g=el('g',{'class':'ig-ca-scritta'},gQ), y=tv[1]+28, te=el('text',{x:r1(qx),y:r1(y),'class':'ig-ca-q'},g); te.style.fontSize=fqc+'px'; var n=avvolgi(te,q,qw,fqc*1.2);
    var bgh=(n-1)*fqc*1.2+fqc*.95+22; var bg=el('rect',{x:r1(qx-10),y:r1(y-fqc-6),width:r1(qw+20),height:r1(bgh+12),rx:10,'class':'ig-cb-q-fondo'},g); g.insertBefore(bg,te);
    tx(g,qx,y+(n-1)*fqc*1.2+fqc*.95,'ig-ca-q-chi',chi); return {g:g,t:t}; }
  var SQ=[scrittaC('«con le vele gonfie di vento, le lasciarono andare contro la flotta romana»','Procopio III 6, 18',T.c1+2600),scrittaC('«un grande frastuono, che gareggiava con il vento e il ruggito delle fiamme»','Procopio III 6, 20',T.c2+500),
    scrittaC('«i Vandali speronavano e affondavano le navi»','Procopio III 6, 21',T.c3+400)];

  /* ---------- D1. Giovanni ---------- */
  var gD=el('g',{'class':'ig-atto'},svg), dv=[pad,pad,W-2*pad,H-2*pad], aff=dv[2]/dv[3]>1.25, ib=aff?[dv[0],dv[1],dv[2]*.56,dv[3]]:[dv[0],dv[1],dv[2],dv[3]*.6];
  var D1=scenaGiovanni(gD,defs,ib), gio=D1.gio, gioI=D1.gioI, tGio=D1.tGio, tGen=D1.tGen, salto=D1.salto, saltoL=D1.saltoL, spruzzo=D1.spruzzo;      // le navi, Giovanni e Genzone (scenaGiovanni, più su)
  var tbx=aff?[ib[0]+ib[2]+28,dv[1],dv[2]-ib[2]-28,dv[3]]:[dv[0],ib[1]+ib[3]+16,dv[2],dv[3]-ib[3]-16], gTq=el('g',{'class':'ig-ca-scritta'},gD), fqd=aff?Math.min(30,tbx[2]/11):Math.min(22,W/16);
  var tqd=el('text',{x:r1(tbx[0]),y:r1(tbx[1]+(aff?tbx[3]*.3:fqd)),'class':'ig-cb-giov'},gTq); tqd.style.fontSize=r1(fqd)+'px'; var nqd=avvolgi(tqd,'«Giovanni non cadrà mai nelle mani dei cani»',tbx[2],fqd*1.15);
  var ytq=+tqd.getAttribute('y')+(nqd-1)*fqd*1.15; tx(gTq,tbx[0],ytq+fqd*.9,'ig-m-cita-chi','Procopio, Guerre III 6, 24');
  var tqn=el('text',{x:r1(tbx[0]),y:r1(ytq+fqd*.9+24),'class':'ig-cb-giov-n'},gTq); if(aff||tbx[3]>110) avvolgi(tqn,'Genzone, figlio di Genserico, gli aveva promesso salva la vita.',tbx[2],18);

  /* ---------- D2. come finisce ---------- */
  var gE=el('g',{'class':'ig-atto'},svg), eb=[pad+(oriz?10:0),pad,oriz?W*(stretto?.58:.46):W-2*pad,H-2*pad];
  var yE=eb[1]+(oriz&&!stretto?Math.max(26,eb[3]*.12):18), fE=oriz&&!stretto?24:stretto?16:19;
  tx(gE,eb[0],yE,'ig-m-testata','COME FINISCE');
  var ESITO=[['sofia','Basilisco','torna a Costantinopoli e si rifugia supplice in Santa Sofia'],['casa','Eraclio','torna a casa'],['croce','Marcelliano','è ucciso a tradimento da un altro ufficiale']], righeE=[], ye=yE+(oriz?20:14);
  ESITO.forEach(function(q){ var g=el('g',{'class':'ig-ad-num'},el('g',{transform:'translate(0,'+r1(ye)+')'},gE)), ic=el('g',{transform:'translate('+r1(eb[0]+14)+',20)','class':'ig-cb-ic'},g);
    if(q[0]==='sofia') el('path',{d:'M-11 8 V0 A11 9 0 0 1 11 0 V8 Z M-13 8 H13'},ic); else if(q[0]==='casa') el('path',{d:'M-10 8 V-1 L0 -9 L10 -1 V8 Z'},ic); else el('path',{d:'M0 -10 V10 M-6 -4 H6',fill:'none','stroke-width':2.6},ic);
    tx(g,eb[0]+38,16,'ig-cb-es-n',q[1]); var t=el('text',{x:r1(eb[0]+38),y:36,'class':'ig-cb-es-t'},g), n=avvolgi(t,q[2],eb[2]-40,17); righeE.push(g); ye+=36+n*17+(oriz&&!stretto?10:2); });
  var fin=el('g',{'class':'ig-ca-scritta'},gE), tF=el('text',{x:r1(eb[0]),y:r1(ye+fE+6),'class':'ig-cb-fine'},fin); tF.style.fontSize=fE+'px'; var nF=avvolgi(tF,"L'Occidente perde l'ultima occasione di riprendere l'Africa.",eb[2],fE*1.2);
  tx(fin,eb[0],ye+fE+6+(nF-1)*fE*1.2+22,'ig-m-cita-chi','dalla tappa del 468 di questa pagina');
  /* accanto (o sotto), la carta: l'Africa resta ai Vandali */
  var yFin=ye+fE+6+(nF-1)*fE*1.2+40, VE=[388,412,190,160], eb2=null;
  if(oriz){ var ew=W-pad-(eb[0]+eb[2]+24), eh=Math.min(H-2*pad,ew*VE[3]/VE[2]); ew=eh*VE[2]/VE[3]; eb2=[W-pad-ew,(H-eh)/2,ew,eh]; }
  else if(H-pad-yFin>120){ var eh2=H-pad-yFin, ew2=Math.min(W-2*pad,eh2*VE[2]/VE[3]); eh2=ew2*VE[3]/VE[2]; eb2=[(W-ew2)/2,H-pad-eh2,ew2,eh2]; }
  var gMap=null; if(eb2){ gMap=el('g',{'class':'ig-ca-scritta'},gE); var FE=finestra(gMap,defs,'ig-cb-clipE',VE,eb2,{stati:statiDi(468)}), cE=FE.C('cartagine');
    if(FE.reg.africa) cls(FE.reg.africa,'acceso',true); if(cE) luogo(FE.sopra,cE,'Cartagine',0,-9,'middle','grande').setAttribute('class','ig-v-luogo vis grande');
    var tAf=tx(FE.sopra,eb2[0]+eb2[2]/2,eb2[1]+eb2[3]-14,'ig-cb-et vis scuro',"l'Africa resta ai Vandali",'middle'); }

  /* ---------- la regia ---------- */
  S.passo=function(t){
    /* A */
    cls(gA,'vis',t>=300&&t<T.b1-300);
    segui(rF,E.io(fase(t,T.a1+300,T.a1+4400))); segui(rM,E.io(fase(t,T.a3+200,T.a3+2600))); segui(rE,E.io(fase(t,T.a3+800,T.a3+3000))); segui(rE2,E.io(fase(t,T.a3+3000,T.a3+4400)));
    if(F.reg.sardegna){ cls(F.reg.sardegna,'acceso',t>=T.a3+2600); fissa(F.reg.sardegna,'style','fill:'+(t>=T.a3+2600?COLORE_STATO.roma:COLORE_STATO['regno:vandali'])); }
    [pCP,pCT,pTR,pSA].forEach(function(p){ cls(p,'vis',t>=400); }); cls(mCB,'vis',t>=T.a1+4200); cls(avvA,'vis',t>=T.a1+800);
    blocchi.forEach(function(b,ii){ cls(b.g,'vis',t>=b.t); if(b.c){ var f=E.out(fase(t,b.t+200,b.t+2200)); scrivi(b.c,num(Math.round((ii?1300:100000)*f/(ii?10:1000))*(ii?10:1000))); } });
    cls(navNota,'vis',t>=T.a2+1600); if(!largoR) cls(navNota,'vis',t>=T.a2+1600&&lb[3]>110);
    /* B */
    cls(gB,'vis',t>=T.b1-400&&t<T.c1-300); cls(pCTb,'vis',true);
    flottaB.forEach(function(f,ii){ cls(f.g,'vis',t>=T.b1+300+ii*28); cls(f.g,'ferma',t>=T.b2); }); vandB.forEach(function(v,ii){ cls(v,'vis',t>=T.b3+400+ii*120); });
    cls(dist,'vis',t>=T.b1+1600); cls(tFlB,'vis',t>=T.b1+1400&&t<T.b4); cls(tVaB,'vis',t>=T.b3+800); cls(vento,'vis',t>=T.b4+1200); cls(tVento,'vis',t>=T.b4+1600);
    cls(gCal,'vis',t>=T.b3+200); cal.forEach(function(c,ii){ cls(c,'pieno',t>=T.b3+1200+ii*900); }); cls(gOro,'vis',t>=T.b3+3200); cls(gVen,'vis',t>=T.b4+1400);
    /* C */
    cls(gC,'vis',t>=T.c1-300&&t<T.d1-300);
    var vv=E.io(fase(t,T.c1+200,T.c1+2600)), lib=E.io(fase(t,T.c1+2600,T.c1+4600));
    brul.forEach(function(b,ii){ var xs=tv[0]-Ln*2+vv*(b.x1-Ln*2.2-(tv[0]-Ln*2)), yb=b.y, xb=lerp(xs+Ln*1.3,b.x1,lib), ret=E.io(fase(t,T.c1+3000,T.c1+5400));
      fissa(b.ov,'transform','translate('+r1(xs-ret*Ln*1.4)+','+r1(yb+ret*Ln*.4*(ii%2?1:-1))+')'+(ret>0?' rotate('+r1(ret*(ii%2?140:-140))+')':''));
      fissa(b.ob,'transform','translate('+r1(xb)+','+r1(yb)+')'); cls(b.fb,'vis',t>=T.c1+2600); cls(b.ob,'giu',t>=T.c1+6400);
      fissa(b.cavo,'x1',r1(xs+Ln*.5)); fissa(b.cavo,'y1',r1(yb)); fissa(b.cavo,'x2',r1(xb-Ln*.35)); fissa(b.cavo,'y2',r1(yb)); cls(b.cavo,'vis',t>=T.c1&&t<T.c1+2600); cls(b.ov,'giu',t<T.c1||t>=T.c1+6200); });
    flotta.forEach(function(f){ var a=t>=f.t, bru=t>=f.t+3200; cls(f.n,'arde',a&&!bru); cls(f.n,'bruciata',bru); cls(f.fu,'vis',a&&t<f.t+5200); cls(f.o,'giu',t>=f.t+5600||f.sink&&t>=f.sink); });
    assalti.forEach(function(a,ii){ var t0=T.c3+300+ii*400, e=E.io(fase(t,t0,t0+2200)), x=lerp(a.da[0],a.b.p[0]-Ln*.6,e), y=lerp(a.da[1],a.b.p[1],e); fissa(a.o,'transform','translate('+r1(x)+','+r1(y)+')'); cls(a.o,'giu',t<t0);
      a.b.sink=t0+2400; cls(a.b.n,'speronata',t>=t0+2200); });
    pertiche.forEach(function(p){ cls(p,'vis',t>=T.c2&&t<T.c3+1500); }); cls(ventoC,'vis',t>=T.c1);
    SQ.forEach(function(q,ii){ cls(q.g,'vis',t>=q.t&&(ii===SQ.length-1||t<SQ[ii+1].t)); });
    /* D1 */
    cls(gD,'vis',t>=T.d1-300&&t<T.d2-300);
    var sl=E.io(fase(t,T.d1+2600,T.d1+3800)), qs=sl>0?puntoA(salto,saltoL*sl):D1.pG;
    fissa(gio,'transform','translate('+xy(qs)+')'+(sl>0?' rotate('+r1(-sl*120)+')':''))
    fissa(gioI,'transform',sl>0?'':'scale('+(Math.sin(t/260)>0?1:-1)+',1)'); cls(gio,'giu',t>=T.d1+4000); cls(spruzzo,'vis',t>=T.d1+3700&&t<T.d1+5600);
    cls(tGio,'vis',t>=T.d1+300&&t<T.d1+2800); cls(tGen,'vis',t>=T.d1+1000); cls(gTq,'vis',t>=T.d1+4200);
    /* D2 */
    cls(gE,'vis',t>=T.d2-300); righeE.forEach(function(r,ii){ cls(r,'vis',t>=T.d2+400+ii*900); }); cls(fin,'vis',t>=T.d2+3400); if(gMap) cls(gMap,'vis',t>=T.d2+4200);
  };
  S.dura=T.fin;
  var bt=[T.a1,T.a2,T.a3,T.b1,T.b2,T.b3,T.b4,T.c1,T.c2,T.c3,T.d1,T.d2];
  S.battute=CAPOBON.fasi.map(function(f,ii){ return {t:bt[ii],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   14. L'altare della Vittoria (384)
   Aggiunta il 23 novembre 2026 (gruppo 3). La tavola è la pianta dell'aula del Senato: forma e proporzioni prese, come base visiva, dalla pianta della Curia Iulia del progetto
   «Senato Roma» dello stesso autore (gradini dei seggi lungo i due lati lunghi, tribuna in fondo, porte di bronzo sul lato corto, pavimento a intarsi di marmo) e ridisegnate qui;
   le misure (27 x 18 m) sono quelle del modello della Curia (js/monumenti.js, già usate in «La Curia nel tempo»). Fatti, tutti dalla pagina:
   - tappa del 357 (testo e voce di Simmaco, Relazione III, «Non tolse nulla ai privilegi delle vergini sacre… non negò le spese ai riti romani»), EVENTI visita357, scheda fori;
   - il commento delle fonti in testa a js/dati.js, 357: Ambrogio, Lettera 18, 32 («Constantius […] Jussit auferri, non jussit reponi»: chi rimise l'altare non si sa); traduzione nostra dal latino;
   - tappa del 384: tolto «intorno al 382» da Graziano, «rimesso al suo posto, probabilmente sotto Giuliano: le fonti non dicono quando», i fondi tagliati ai culti e alle Vestali,
     Magno Massimo che fa uccidere Graziano («l'anno seguente»), Valentiniano II che governa solo una parte dell'Occidente, Simmaco a nome di tutti i senatori, Ambrogio che obietta,
     la richiesta respinta; voce di Simmaco, Relazione III, 10; riquadro degli storici (Ambrogio: i cristiani maggioranza, «pochi pagani»; «Dalle loro parole non si può stabilire
     quanti senatori sostenessero ciascuna posizione»; Cameron 2011: meno di quanto si pensasse; i tagli restano in vigore); commento delle fonti, 384: Ambrogio, Lettera 17, 5
     («cum majore jam curia christianorum numero sit referta»: traduzione nostra);
   - tappa del 394 (testo e storici): il divieto dei sacrifici del 391, Eugenio cristiano che fa doni ai senatori dei culti tradizionali, Paolino di Milano che «menziona anche l'altare
     della Vittoria e i fondi per i riti», «le fonti divergono», Cameron che dubita di una rinascita pagana sotto Eugenio, la vittoria di Teodosio sul Frigido; protagonisti: Eugenio 392-394.
   Lasciato fuori perché la pagina non lo dice: la statua della Vittoria sopra l'altare (non è nominata in nessun testo della pagina: qui c'è solo l'altare), il punto dell'aula in cui
   stava l'altare, che cosa fece Teodosio dell'altare dopo il Frigido, la sorte dell'altare dopo il 394. Schemi, detti nel disegno: la pianta, la posizione dell'altare, le figure dei
   senatori (non contate) e le proporzioni fra pagani e cristiani (indicative: la pagina dice che non si possono stabilire). */
var ALTARE={ titolo:"L'altare della Vittoria", sotto:"Tolto, rimesso, tolto di nuovo: il Senato diviso, dal 357 al 394",
  fasi:[["La Curia","Nel Foro, l'aula dove si riunisce il Senato: la Curia, ricostruita da Diocleziano dopo l'incendio del 283. Qui c'è l'altare della dea Vittoria."],
    ["357","L'imperatore Costanzo II visita Roma per la prima volta e fa togliere l'altare della Vittoria dalla Curia."],
    ["357","Ma, secondo Simmaco, Costanzo rispetta i privilegi delle Vestali e non nega le spese per i riti. Ambrogio osserva che ordinò di togliere l'altare, non di rimetterlo."],
    ["dopo il 357","L'altare torna al suo posto, probabilmente sotto Giuliano. Le fonti non dicono quando."],
    ["verso il 382","L'imperatore Graziano lo fa togliere di nuovo. Taglia anche i fondi pubblici per i culti tradizionali e per le Vestali, le sacerdotesse di Vesta."],
    ["poco dopo","In Britannia le truppe proclamano imperatore Magno Massimo, che passa in Gallia e fa uccidere Graziano. Valentiniano II governa ormai solo una parte dell'Occidente."],
    ["384","Simmaco, prefetto di Roma, chiede a Valentiniano II che l'altare torni nella Curia e che lo Stato paghi di nuovo i culti. Dice di parlare a nome di tutti i senatori."],
    ["384","Ambrogio, vescovo di Milano, risponde che i senatori cristiani non sono d'accordo: sono già la maggioranza, e solo «pochi pagani» pretendono di parlare per tutti."],
    ["Quanti?","Chi ha ragione? Simmaco e Ambrogio vogliono entrambi convincere l'imperatore: dalle loro parole non si può stabilire quanti senatori stessero con l'uno o con l'altro."],
    ["384","Valentiniano II respinge la richiesta di Simmaco. I tagli ai fondi per i culti restano in vigore."],
    ["392-394","Con l'appoggio del generale Arbogaste, Eugenio diventa imperatore d'Occidente. È cristiano, ma fa doni ai senatori che difendono i culti tradizionali. Paolino di Milano nomina anche l'altare della Vittoria: le fonti divergono."],
    ["394","Nel 391 Teodosio aveva vietato i sacrifici. Ai primi di settembre del 394 sconfigge Eugenio sul fiume Frigido."],
    ["Dopo","Dopo il 394 l'altare della Vittoria non compare più nelle fonti di questa pagina."]],
  fonte:"Tappe del 357, del 384 e del 394 di questa pagina, con le voci di Simmaco (Relazione III, 8 e 10) e il riquadro degli storici; Ambrogio, Lettera 18, 32 e Lettera 17, 5, nel latino annotato fra le fonti della pagina (traduzioni nostre). Simmaco e Ambrogio scrivono entrambi per convincere l'imperatore: le loro parole non dicono quanti senatori stessero con l'uno o con l'altro, e le proporzioni dei colori nell'aula sono indicative. La pianta è uno schema dell'aula ricostruita da Diocleziano (27 per 18 metri): i gradini dei seggi, la tribuna e il pavimento sono disegnati, non misurati; le figure dei senatori non sono contate. Dove stesse l'altare nell'aula non è detto: la posizione è indicativa, e l'altare disegnato è un altare qualsiasi. Della statua della Vittoria e della sorte dell'altare dopo il 394 le fonti di questa pagina non parlano." };
function disegnaAltare(svg,S,W,H){
  var oriz=W/H>=1.15, piccolo=oriz&&W<700, pad=oriz?18:12, defs=el('defs',null,svg), fasi=ALTARE.fasi, i, j;
  var T=[1400,6600,11400,16600,21000,26200,30800,37000,43200,48800,53400,59600,64600], tFin=T[12]+6400;
  /* impaginazione: aula, colonna, nastro */
  /* il disegno va da -2 a 28 metri in lungo (porte comprese) e da -1 a 19 in largo; sotto, 20 punti per la legenda */
  var rib=piccolo?62:72, ab, cb, rb, s;
  if(oriz&&!piccolo){ var aw=Math.round(W*.58)-pad, ah=H-2*pad-22; s=Math.min(aw/30,ah/20); ab=[pad+(aw-30*s)/2+2*s,pad+(ah-20*s)/2+s,27*s,18*s];      /* la colonna a destra, col nastro in fondo */
    cb=[pad+aw+30,pad+4,W-(pad+aw+30)-pad,H-2*pad-rib-14]; rb=[cb[0]-8,H-pad-rib+4,cb[2]+8,rib-4]; }
  else if(oriz){ var aw3=Math.round(W*.64)-pad, ah3=H-2*pad-rib-22; s=Math.min(aw3/30,ah3/20); ab=[pad+(aw3-30*s)/2+2*s,pad+(ah3-20*s)/2+s,27*s,18*s];      /* telefono coricato: l'aula più grande possibile, il nastro sotto l'aula */
    cb=[pad+aw3+14,pad+2,W-(pad+aw3+14)-pad,H-2*pad-4]; rb=[pad,H-pad-rib+8,aw3,rib-8]; }
  else { s=(W-2*pad)/30; ab=[pad+2*s,pad+s,27*s,18*s]; rb=[pad,H-rib-2,W-2*pad,rib]; cb=[pad,ab[1]+19*s+30,W-2*pad,rb[1]-(ab[1]+19*s+30)-6]; }
  var M=function(x,y){ return [ab[0]+x*s,ab[1]+y*s]; };
  function R(p,x1,y1,x2,y2,cl,o){ var a=M(x1,y1), b=M(x2,y2), r=el('rect',{x:r1(a[0]),y:r1(a[1]),width:r1(b[0]-a[0]),height:r1(b[1]-a[1]),'class':cl},p); if(o) for(var k in o) r.setAttribute(k,o[k]); return r; }
  /* ---- l'aula ridisegnata: profondità con ombre e marmi, sullo stile della pianta della Curia di «Senato Roma» (filtro del marmo, ombre dei gradini, luce sulle figure) ---- */
  function ombraLin(id,x1,y1,x2,y2,a){ var g=el('linearGradient',{id:id,x1:x1,y1:y1,x2:x2,y2:y2},defs); el('stop',{offset:0,'stop-color':'#3A2614','stop-opacity':a},g); el('stop',{offset:1,'stop-color':'#3A2614','stop-opacity':0},g); }
  ombraLin('ig-al-sd',0,0,0,1,.34); ombraLin('ig-al-su',0,1,0,0,.34); ombraLin('ig-al-sl',1,0,0,0,.3);
  var mf=el('filter',{id:'ig-al-marmo',x:0,y:0,width:'100%',height:'100%','color-interpolation-filters':'sRGB'},defs);
  el('feTurbulence',{type:'turbulence',baseFrequency:'0.012 0.05',numOctaves:3,seed:11},mf); el('feColorMatrix',{type:'matrix',values:'0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .27  -2.2 0 0 0 .62'},mf);
  var hi=el('radialGradient',{id:'ig-al-hi',cx:'34%',cy:'28%',r:'70%'},defs); [[0,'#fff',.6],[.5,'#fff',.06],[1,'#000',.14]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},hi); });
  var lg=el('linearGradient',{id:'ig-al-legno',x1:0,y1:0,x2:0,y2:1},defs); [[0,'#B48A55'],[.5,'#946638'],[1,'#6E4822']].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1]},lg); });
  /* il pavimento a intarsi: mattonelle che entrano intere nel riquadro (prima la trama si tagliava sui bordi) */
  var pa=M(1.15,4.45), pz=M(22.95,13.55), wP=pz[0]-pa[0], hP=pz[1]-pa[1], nX=Math.max(6,Math.round(wP/Math.max(14,s*1.6)/2)*2), tw=wP/nX, nY=Math.max(2,Math.round(hP/tw/2)*2), th=hP/nY, ps=Math.min(tw,th);
  var pt=el('pattern',{id:'ig-al-os',width:r1(tw*2),height:r1(th*2),patternUnits:'userSpaceOnUse',x:r1(pa[0]),y:r1(pa[1])},defs);
  el('rect',{width:r1(tw*2),height:r1(th*2),fill:'#A8883E'},pt);
  [[0,0],[tw,th]].forEach(function(q){ var c=[q[0]+tw/2,q[1]+th/2]; el('rect',{x:r1(q[0]+.6),y:r1(q[1]+.6),width:r1(tw-1.2),height:r1(th-1.2),fill:'#DCBC74'},pt); el('circle',{cx:r1(c[0]),cy:r1(c[1]),r:r1(ps*.4),fill:'#3E6150'},pt);
    el('circle',{cx:r1(c[0]),cy:r1(c[1]),r:r1(ps*.34),fill:'#EFE6D8'},pt); el('circle',{cx:r1(c[0]),cy:r1(c[1]),r:r1(ps*.28),fill:'#7E2530'},pt); el('circle',{cx:r1(c[0]-ps*.08),cy:r1(c[1]-ps*.08),r:r1(ps*.11),fill:'#9A3A44',opacity:.4},pt); el('circle',{cx:r1(c[0]),cy:r1(c[1]),r:r1(ps*.06),fill:'#EFE6D8'},pt); });
  [[tw,0],[0,th]].forEach(function(q){ var c=[q[0]+tw/2,q[1]+th/2], r=ps*.44; el('rect',{x:r1(q[0]+.6),y:r1(q[1]+.6),width:r1(tw-1.2),height:r1(th-1.2),fill:'#D0AC62'},pt);
    [1,.72,.5].forEach(function(k,j){ el('path',{d:'M'+xy([c[0],c[1]-r*k])+' L'+xy([c[0]+r*k,c[1]])+' L'+xy([c[0],c[1]+r*k])+' L'+xy([c[0]-r*k,c[1]])+' Z',fill:['#3E6150','#D0AC62','#EFE6D8'][j]},pt); });
    el('circle',{cx:r1(c[0]),cy:r1(c[1]),r:r1(ps*.11),fill:'#7E2530'},pt); });
  var luce=el('radialGradient',{id:'ig-al-luce',cx:'42%',cy:'38%',r:'72%'},defs); [[0,'#FFF8E8',.38],[.55,'#FFF8E8',0],[1,'#3A2614',.26]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},luce); });
  var fia=el('radialGradient',{id:'ig-al-fiamma'},defs); [[0,'#FFF3D0',1],[.3,'#FFC85A',.9],[.7,'#E8622C',.35],[1,'#B8321A',0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},fia); });
  var brz=el('linearGradient',{id:'ig-al-bronzo',x1:0,y1:0,x2:1,y2:1},defs); [[0,'#8A6232'],[.5,'#5E3F1C'],[1,'#7A5528']].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1]},brz); });
  var tav=el('g',{'class':'ig-al-tavola'},svg);
  R(tav,-1,-1,28,19,'ig-al-muro');
  R(tav,0,0,27,18,'ig-al-fondo');
  /* gradini dei seggi lungo i lati lunghi (tre per lato): il più alto contro il muro; ogni gradino fa ombra su quello sotto */
  [0,1,2].forEach(function(k){ R(tav,0,k*1.1,24,(k+1)*1.1,'ig-al-gradino g'+k); R(tav,0,18-(k+1)*1.1,24,18-k*1.1,'ig-al-gradino g'+k); });
  R(tav,0,0,24,3.3,'ig-al-venature'); R(tav,0,14.7,24,18,'ig-al-venature');
  [1.1,2.2,3.3].forEach(function(y,k){ var hh=k<2?.42:.6; R(tav,0,y,24,y+hh,null,{fill:'url(#ig-al-sd)'}); R(tav,0,18-y-hh,24,18-y,null,{fill:'url(#ig-al-su)'}); });
  var spig=''; [1.1,2.2,3.3].forEach(function(y){ var a=M(0,y), b=M(24,y), c=M(0,18-y); spig+='M'+xy(a)+' H'+r1(b[0])+' M'+xy(c)+' H'+r1(b[0])+' '; }); el('path',{d:spig,'class':'ig-al-spigolo'},tav);
  /* la tribuna in fondo: due gradini e il piano, con i riquadri del marmo */
  R(tav,24,0,27,18,'ig-al-tribuna'); R(tav,24,0,24.5,18,'ig-al-gradino g2'); R(tav,24.5,0,25,18,'ig-al-gradino g1'); R(tav,24,0,27,18,'ig-al-venature');
  [[23.6,24],[24.15,24.5],[24.65,25]].forEach(function(q){ R(tav,q[0],0,q[1],18,null,{fill:'url(#ig-al-sl)'}); });
  R(tav,25.6,1.3,26.6,7.4,'ig-al-riquadro'); R(tav,25.6,10.6,26.6,16.7,'ig-al-riquadro');
  /* il pavimento con le sue fasce */
  R(tav,.5,3.8,23.6,14.2,'ig-al-fascia1'); R(tav,.8,4.1,23.3,13.9,'ig-al-fascia2'); R(tav,1,4.3,23.1,13.7,'ig-al-fascia3'); R(tav,1.15,4.45,22.95,13.55,null,{fill:'url(#ig-al-os)'});
  R(tav,.5,3.8,23.6,14.2,'ig-al-venature ig-al-v-pav');
  R(tav,0,0,27,18,null,{fill:'url(#ig-al-luce)','pointer-events':'none'});
  R(tav,0,0,27,.5,null,{fill:'url(#ig-al-sd)'}); R(tav,0,17.5,27,18,null,{fill:'url(#ig-al-su)'});      // l'ombra dei muri
  /* le porte di bronzo sul lato corto, con le formelle */
  R(tav,-1.05,6.9,0,11.1,'ig-al-soglia'); R(tav,-1.9,7,-1,11,null,{fill:'url(#ig-al-bronzo)'}); el('path',{d:'M'+xy(M(-1.9,9))+' H'+r1(M(-1,9)[0]),'class':'ig-al-porta-l'},tav);
  [[7.35,8.65],[9.35,10.65]].forEach(function(q){ R(tav,-1.72,q[0],-1.18,q[1],'ig-al-formella'); });
  /* i senatori: figure sedute viste dall'alto, rivolte verso il pavimento (non contate); ognuna un po' diversa: grandezza, piega, capelli, qualche seggio vuoto */
  var sen=[], Rs=caso(384), fila=[.55,1.65,2.75], CAPELLI=['#4E3320','#6B4A30','#86664A','#A89A88'];
  function seggio(x,y,dir){ var a=M(x-.62,y-dir*.48), b=M(x+.62,y-dir*.08); el('rect',{x:r1(Math.min(a[0],b[0])),y:r1(Math.min(a[1],b[1])),width:r1(Math.abs(b[0]-a[0])),height:r1(Math.abs(b[1]-a[1])),rx:1.2,'class':'ig-al-seggio'},tav); }
  [0,1].forEach(function(lato){ var dir=lato?-1:1; fila.forEach(function(fy,k){ for(var x=1.6;x<23.4;x+=1.52){ var xx=x+(k%2?.4:0), y=lato?18-fy:fy; seggio(xx,y,dir); if(Rs()<.1) continue;
      xx+=(Rs()-.5)*.22; var q=M(xx,y), sc=s*(.9+Rs()*.16), u=function(n){ return r1(n*sc); }, w=function(n){ return r1(n*sc*dir); };
      var g=el('g',{'class':'ig-al-sen',transform:'translate('+xy(q)+')'},tav);
      el('ellipse',{cx:u(.09),cy:u(.12),rx:u(.5),ry:u(.4),'class':'ig-al-sen-ombra'},g);      // l'ombra: la luce viene sempre da sinistra in alto
      var f=el('g',{transform:'rotate('+r1((Rs()-.5)*14)+')'},g), corpo='M'+u(-.42)+' '+w(-.1)+' C'+u(-.46)+' '+w(-.36)+' '+u(.46)+' '+w(-.36)+' '+u(.42)+' '+w(-.1)+' L'+u(.3)+' '+w(.3)+' Q0 '+w(.43)+' '+u(-.3)+' '+w(.3)+' Z';
      el('path',{d:corpo,'class':'ig-al-toga'},f); el('path',{d:corpo,fill:'url(#ig-al-hi)','class':'ig-al-lucefig'},f);
      var lp=Rs()<.5?1:-1; el('path',{d:'M'+u(-.33*lp)+' '+w(-.2)+' Q'+u(-.04*lp)+' '+w(.04)+' '+u(.2*lp)+' '+w(.3),'class':'ig-al-piega'},f);
      var te=el('circle',{cx:0,cy:w(-.17),r:u(.155),'class':'ig-al-capo'},f); te.style.fill=CAPELLI[Math.floor(Rs()*CAPELLI.length)];
      el('circle',{cx:u(-.05),cy:r1((-.17-.05)*sc*dir),r:u(.055),'class':'ig-al-capo-luce'},f);
      g.style.transitionDelay=(x/23*.9+k*.12).toFixed(2)+'s'; sen.push({g:g,cr:Rs()<.74,x:x}); } }); });
  /* l'altare (un altare qualsiasi; posizione indicativa) e la sua ombra quando manca */
  var AX=21.6, AY=9, ombra=el('g',{'class':'ig-al-ombra'},tav); R(ombra,AX-1.1,AY-.8,AX+1.1,AY+.8,'ig-al-ombra-r'); var qO=M(AX,AY), dubbio=tx(ombra,qO[0],qO[1]+5,'ig-al-dubbio','?','middle');
  var alt=el('g',{'class':'ig-al-altare'},tav), alC=el('g',null,alt), v=function(n){ return r1(n*s); };
  el('circle',{r:v(2.6),fill:'url(#ig-al-fiamma)','class':'ig-al-bagliore'},alC);
  el('rect',{x:v(-1.05),y:v(-.8),width:v(2.1),height:v(1.6),rx:2,'class':'ig-al-zoccolo'},alC);      // il gradino, con la sua ombra (CSS)
  el('rect',{x:v(-.85),y:v(-.6),width:v(1.7),height:v(1.2),rx:1.5,'class':'ig-al-blocco'},alC); el('rect',{x:v(-.85),y:v(-.6),width:v(1.7),height:v(1.2),rx:1.5,fill:'url(#ig-al-hi)'},alC);
  [-1,1].forEach(function(sx){ el('rect',{x:v(sx<0?-.85:.6),y:v(-.6),width:v(.25),height:v(1.2),rx:v(.12),'class':'ig-al-pulvino'},alC); [-1,1].forEach(function(sy){ el('circle',{cx:v(sx*.725),cy:v(sy*.5),r:r1(Math.max(1.2,s*.1)),'class':'ig-al-rosetta'},alC); }); });
  el('ellipse',{rx:v(.34),ry:v(.28),'class':'ig-al-focolare'},alC); [[-.12,.06],[.1,-.05],[.03,.12]].forEach(function(q){ el('circle',{cx:v(q[0]),cy:v(q[1]),r:r1(Math.max(1,s*.06)),'class':'ig-al-brace'},alC); });
  var fsc=Math.max(.6,s/13), fg=el('g',{'class':'ig-al-fuoco-a'},alC);
  el('path',{d:FIAMMA,transform:'scale('+r1(fsc*100)/100+')','class':'ig-al-fuoco'},fg);
  el('path',{d:FIAMMA,transform:'translate(0,'+r1(fsc*3.2)+') scale('+r1(fsc*62)/100+')','class':'ig-al-fuoco2'},fg);
  el('path',{d:FIAMMA,transform:'translate(0,'+r1(fsc*5.8)+') scale('+r1(fsc*32)/100+')','class':'ig-al-fuoco3'},fg);
  for(var sp=0;sp<3;sp++){ el('circle',{cx:r1((sp-1)*s*.28),cy:r1(-fsc*10),r:1.3,'class':'ig-al-scintilla'},alC).style.animationDelay=(sp*.47)+'s'; }
  var asse=M(AX,AY), uscita=M(-3.2,AY);
  /* i portatori, quando l'altare si muove */
  var port=el('g',{'class':'ig-al-port'},alt); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ el('circle',{cx:r1(q[0]*s*1.05),cy:r1(q[1]*s*.8),r:r1(Math.max(1.8,s*.24)),'class':'ig-al-testa'},port); });
  /* la scritta sopra la pianta e il bollo: piccolo, su due righe, accanto al posto vuoto dell'altare (prima copriva mezzo pavimento) */
  var sch=tx(svg,ab[0]+ab[2]+s,ab[1]+19*s+14,'ig-m-schema ig-f','pianta: uno schema','end');
  var fsB=piccolo||!oriz?11:14, bollo=el('g',{'class':'ig-ca-bollo ig-al-bollo'},svg), bF=el('rect',{rx:4,'class':'ig-al-bollo-r'},bollo), bR1=el('rect',{rx:4,'class':'ig-ca-bollo-r'},bollo), bR2=el('rect',{rx:2.5,'class':'ig-al-bollo-r2'},bollo);
  var bt1=tx(bollo,0,0,'ig-ca-bollo-t','RICHIESTA','middle'), bt2=tx(bollo,0,0,'ig-ca-bollo-t','RESPINTA','middle'); bt1.style.fontSize=bt2.style.fontSize=fsB+'px';
  var bwB=Math.max(largo(bt1),largo(bt2))+20, bhB=fsB*2.3+14, bx=Math.max(ab[0]+4*s,M(AX-1.5,AY)[0]-bwB), by=M(AX,AY)[1]-bhB/2;
  [[bF,0],[bR1,0],[bR2,3]].forEach(function(q){ q[0].setAttribute('x',r1(bx+q[1])); q[0].setAttribute('y',r1(by+q[1])); q[0].setAttribute('width',r1(bwB-2*q[1])); q[0].setAttribute('height',r1(bhB-2*q[1])); });
  [bt1,bt2].forEach(function(t,j){ t.setAttribute('x',r1(bx+bwB/2)); t.setAttribute('y',r1(by+7+fsB*(j?2.05:.95))); });
  /* i fumetti della pianta: frazioni del riquadro dell'aula */
  var ba=[ab[0],ab[1],ab[2],ab[3]], fq=function(x,y){ return [x/27,y/18]; };
  var FU={porte:[fumetto(svg,ba,'porte di bronzo','dx'),fq(-1.4,9)],seggi:[fumetto(svg,ba,'i gradini dei seggi','dx'),fq(7,1.65)],tribuna:[fumetto(svg,ba,'la tribuna','sx'),fq(25.6,15.5)],
    altare:[fumetto(svg,ba,piccolo||!oriz?'l\'altare (dove: indicativo)':'l\'altare: posizione indicativa','dx'),fq(AX,AY)]};
  /* la legenda dei colori dei senatori, sotto l'aula */
  var gLeg=el('g',{'class':'ig-al-leg'},svg), lx=ab[0]-2*s, ly=ab[1]+19*s+14, VOCI=[['pagano',oriz&&!piccolo?'culti tradizionali':'pagani'],['cristiano','cristiani'],['ignoto','non si sa']];
  VOCI.forEach(function(v){ var g=el('g',{'class':'ig-al-voce '+v[0]},gLeg); el('ellipse',{cx:r1(lx+6),cy:r1(ly-4),rx:6,ry:4.4,'class':'ig-al-toga'},g); var t=tx(g,lx+16,ly,'ig-al-voce-t',v[1]); lx+=largo(t)+34; });
  var avvLeg=tx(gLeg,lx-8,ly,'ig-al-voce-t nota','· proporzioni indicative'); if(lx+largo(avvLeg)>ab[0]+ab[2]+s-largo(sch)-12) avvLeg.textContent='';
  /* la colonna: anno, stato, voce o schede */
  var gC=el('g',{'class':'ig-p-col-d'},svg), fsA=oriz?Math.min(piccolo?34:56,cb[2]/4.6):Math.min(30,W/11), tA=tx(gC,cb[0],cb[1]+fsA*.82,'ig-p-anno',''), tSt=el('text',{x:r1(cb[0]),y:r1(cb[1]+fsA*1.08+(oriz?16:14)),'class':'ig-p-stato'},gC);
  var gQ=el('g',null,gC), yQ=cb[1]+fsA*1.08+(piccolo?52:oriz?40:34);
  var STATI=["L'AULA DEL SENATO","VIA L'ALTARE","MA I RITI RESTANO","L'ALTARE TORNA","VIA DI NUOVO","UN USURPATORE","LA RICHIESTA","LA RISPOSTA","QUANTI ERANO?","RESPINTA","EUGENIO","IL FRIGIDO","SILENZIO"];
  var COL={0:{r:[['l\'aula','27 × 18 m'],['la rifà','Diocleziano, dopo il 283']]},1:{r:[['chi','Costanzo II'],['durante','la sua visita a Roma']]},
    2:{q:['«Ordinò di toglierlo, non ordinò di rimetterlo.»','Ambrogio, Lettera 18, 32, su Costanzo II']},3:{r:[['quando','le fonti non lo dicono'],['sotto chi','probabilmente Giuliano']]},
    4:{r:[['chi','Graziano'],['e i fondi','tagliati: culti e Vestali']]},5:{r:[['Magno Massimo','fa uccidere Graziano'],['Valentiniano II','governa una parte dell\'Occidente']]},
    6:{q:['«Non si può arrivare per una sola strada a un mistero così grande.»','Simmaco, Relazione III, 10']},7:{q:['«La curia è ormai piena di un numero maggiore di cristiani.»','Ambrogio, Lettera 17, 5']},
    8:{r:[['Simmaco','parla per tutto il Senato'],['Ambrogio','solo «pochi pagani»'],['gli storici','non si può stabilire']]},9:{r:[['chi decide','Valentiniano II'],['i tagli','restano in vigore']]},
    10:{r:[['Eugenio','cristiano, fa doni ai senatori pagani'],['Paolino','nomina anche l\'altare'],['Alan Cameron','dubita di una rinascita pagana']]},
    11:{r:[['391','Teodosio vieta i sacrifici'],['394','vince Eugenio sul Frigido']]},12:{t:'Dopo il 394 l\'altare non compare più nelle fonti di questa pagina.'}};
  var stretta=cb[2]<250;
  var colCit=null;
  function scriviCol(ii){ gQ.textContent=''; colCit=null; var c=COL[ii]; if(!c) return; var hq=cb[1]+cb[3]-yQ; if(hq<34) return;
    if(c.q){ var fs=oriz?(piccolo?15:Math.min(19,cb[2]/18)):15.5, g=citazione(gQ,cb[0],yQ,cb[2],c.q[0],c.q[1],fs); if(g._h>hq){ gQ.textContent=''; } else colCit=g; return; }
    if(c.t){ var t0=el('text',{x:r1(cb[0]),y:r1(yQ+18),'class':'ig-al-fine'},gQ); t0.style.fontSize=(oriz&&!piccolo?21:16)+'px'; avvolgi(t0,c.t,cb[2],oriz&&!piccolo?27:21); return; }
    var rh=stretta?40:(oriz&&!piccolo?34:28), wk=stretta?0:(oriz&&!piccolo?128:112), y=yQ;
    c.r.forEach(function(r){ if(y+rh>cb[1]+cb[3]+2) return; var g=el('g',null,gQ); el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},g); tx(g,cb[0],y+(stretta?14:rh*.64),'ig-p-sch-k',r[0].toUpperCase());
      var v=tx(g,cb[0]+wk,y+(stretta?32:rh*.66),'ig-p-sch-v',r[1]), n=1; if(!oriz||piccolo) v.style.fontSize='15px'; var lim=cb[2]-wk; if(largo(v)>lim){ v.style.fontSize='13.5px'; }
      if(largo(v)>lim){ var s0=r[1]; v.textContent=''; n=avvolgi(v,s0,lim,15); if(!stretta) v.setAttribute('y',r1(y+rh*.5)); }
      var hh=stretta?Math.max(rh,24+n*15):Math.max(rh,rh*.5+n*15-4); if(y+hh>cb[1]+cb[3]+2){ g.remove(); y=1e9; return; } y+=hh; }); }
  /* il nastro: dove sta l'altare, dal 350 al 400 */
  var gR=el('g',{'class':'ig-p-nastro'},svg), n0=rb[0]+62, n1=rb[0]+rb[2]-4, A0=350, A1=400, X=function(a){ return n0+(a-A0)/(A1-A0)*(n1-n0); }, ny=rb[1]+18, nh=12;
  tx(gR,rb[0],ny+nh-2,'ig-p-n-et','L\'ALTARE');
  var cpN=el('clipPath',{id:'ig-al-cn'},defs), cpNr=el('rect',{x:r1(n0-2),y:r1(ny-4),width:0,height:nh+8},cpN), gB=el('g',{'clip-path':'url(#ig-al-cn)'},gR);
  var gF=el('linearGradient',{id:'ig-al-sfuma'},defs); [[0,'#E8D7A8'],[.5,'#F4EBD4'],[1,'#E8D7A8']].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1]},gF); });
  function banda(a,b,cl){ return el('rect',{x:r1(X(a)),y:r1(ny),width:r1(Math.max(2,X(b)-X(a)-1)),height:nh,rx:2,'class':'ig-al-b '+cl},gB); }
  banda(350,357,'dentro'); banda(357,382,'forse'); banda(382,392,'fuori'); banda(392,394,'forse'); banda(394,400,'muto');
  tx(gB,X(369.5),ny+nh-2.5,'ig-al-b-t',W<520?'?':'tolto, poi rimesso: quando?','middle'); tx(gB,X(393),ny+nh-2.5,'ig-al-b-t','?','middle');
  [[357,'357','middle'],[382,'382','end'],[384,'384','start'],[394,'394','middle']].forEach(function(q){ var x=X(q[0]); el('line',{x1:r1(x),x2:r1(x),y1:r1(ny+nh+1),y2:r1(ny+nh+5),'class':'ig-base'},gR); tx(gR,x,ny+nh+17,'ig-p-n-anno',q[1],q[2]); });
  var legN=[['dentro','nella Curia'],['fuori','tolto'],['forse','incerto'],['muto','nessuna notizia']], lnx=n0, gLN=el('g',null,gR);
  legN.forEach(function(v){ el('rect',{x:r1(lnx),y:r1(ny-13),width:12,height:7,rx:1.5,'class':'ig-al-b '+v[0]},gLN); var t=tx(gLN,lnx+16,ny-6,'ig-al-voce-t piccola',v[1]); lnx+=largo(t)+30; });
  if(lnx>n1+10) gLN.textContent='';
  var cur=el('g',{'class':'ig-p-cur'},gR); el('line',{x1:0,x2:0,y1:r1(ny-3),y2:r1(ny+nh+3),'class':'ig-p-cur-l'},cur); el('circle',{cx:0,cy:r1(ny-3),r:4,'class':'ig-p-cur-p'},cur);
  var visto=-1;
  S.passo=function(t){
    var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; }); var ii=Math.max(0,i);
    cls(tav,'vis',t>=T[0]-500); cls(sch,'vis',t>=T[0]+400&&!(i>=6&&i<=8));
    /* l'altare: fuori nel 357, di nuovo dentro, fuori dal 382; nel 392-394 solo l'ombra col punto di domanda */
    function corsa(a,b){ return E.io(fase(t,a,b)); }
    var via1=corsa(T[1]+600,T[1]+3600), torna=corsa(T[3]+400,T[3]+3200), via2=corsa(T[4]+400,T[4]+3400), pos;
    if(t<T[3]) pos=via1; else if(t<T[4]) pos=1-torna; else pos=via2;
    var q=[lerp(asse[0],uscita[0],pos),asse[1]]; fissa(alC,'transform','translate('+xy(q)+')'); fissa(port,'transform','translate('+xy(q)+')');
    var muove=(t>T[1]+500&&t<T[1]+3700)||(t>T[3]+300&&t<T[3]+3300)||(t>T[4]+300&&t<T[4]+3500);
    cls(port,'vis',muove); cls(alt,'vis',pos<.97); cls(alt,'forse',t>=T[3]&&t<T[4]);
    cls(ombra,'vis',pos>.05||i>=10); cls(ombra,'eugenio',i===10||i===11&&t<T[11]+800); cls(dubbio,'vis',i===3||i===10);
    /* i senatori */
    var col=i>=6&&i<8?(i===6?'pagano':null):null;
    sen.forEach(function(q){ var c=i===6?'pagano':i===7?(q.cr?'cristiano':'pagano'):i===8?'ignoto':i===9&&t<T[9]+600?'ignoto':''; ['pagano','cristiano','ignoto'].forEach(function(k){ cls(q.g,k,c===k); }); });
    cls(gLeg,'vis',i>=6&&i<=8); ['pagano','cristiano','ignoto'].forEach(function(k,kk){ cls(gLeg.childNodes[kk],'ora',(i===6&&k==='pagano')||(i===7&&k!=='ignoto')||(i===8&&k==='ignoto')); });
    cls(bollo,'vis',i===9&&t>=T[9]+700);
    /* i fumetti */
    function Fu(k,da,a){ var f=FU[k]; cls(f[0],'vis',t>=da&&t<a); f[0].metti(f[1]); }
    var uno=!oriz||piccolo; Fu('seggi',T[0]+700,uno?T[0]+1900:T[1]-300); Fu('porte',uno?T[0]+2000:T[0]+1300,uno?T[0]+3000:T[1]-300); Fu('tribuna',uno?T[0]+3100:T[0]+1900,uno?T[0]+4100:T[1]-300); Fu('altare',uno?T[0]+4200:T[0]+2600,T[1]+400);
    /* la colonna */
    cls(gC,'vis',t>=T[0]-300);
    if(i!==visto){ visto=i; scrivi(tA,i<0?'':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>18){ fa-=2; tA.style.fontSize=fa+'px'; } tSt.textContent=''; if(i>=0){ avvolgi(tSt,STATI[ii],cb[2],17); scriviCol(ii); } else gQ.textContent=''; }
    cls(gC,'cambia',i>=0&&t<T[ii]+120); if(colCit) cls(colCit,'vis',t>=T[ii]+250);
    /* il nastro */
    var anni=[350,357,357,362,382,383,384,384,384,384,392,394,400], a=i<0?350:lerp(anni[ii],anni[Math.min(12,ii+1)],E.io(fase(t,T[Math.min(12,ii+1)]-1000,T[Math.min(12,ii+1)])));
    if(i>=12) a=lerp(394,400,E.io(fase(t,T[12],T[12]+2000)));
    cls(gR,'vis',t>=T[0]+300); fissa(cur,'transform','translate('+r1(X(a))+',0)'); fissa(cpNr,'width',r1(Math.max(0,X(a)-n0+2)));
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,k){ return {t:T[k],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   15. I sacchi di Roma a confronto (410, 455, 546)
   Aggiunta il 23 novembre 2026 (gruppo 3). Tre schede affiancate (sul telefono in piedi, una sotto l'altra) con le stesse domande: chi e da dove, quanto durò, che cosa fu preso
   o distrutto; poi una linea del tempo delle fonti (dal sacco all'anno in cui la fonte scrive) e il finale. Fatti, tutti dalla pagina:
   - 410: tappa (terzo assedio in tre anni, Alarico, Orosio tre giorni, Marcellino Comes sei), EVENTI sacco410 (24 agosto, porta Salaria, casa di Sallustio e case vicino alla porta,
     la basilica Emilia «probabilmente», rifugio rispettato a San Pietro e San Paolo, con il commento su Procopio, Guerre III 2), «Il sacco del 410» (SACCO), voci di Girolamo
     (da Betlemme, fra il 410 e il 414, dove arrivano i profughi) e Agostino, riquadro della leggenda (Procopio scrive verso il 550, circa 140 anni dopo); tappa 394 (Orosio scrive
     intorno al 417); leggenda del 451 (Marcellino, cronista del VI secolo);
   - 455: tappa e EVENTI sacco455 (2-16 giugno, quattordici giorni, metà del tetto di bronzo dorato del tempio di Giove), voce e leggenda (Prospero scrive in quei mesi: le ultime righe
     della sua cronaca; papa Leone ottiene di evitare incendi, stragi e torture; migliaia di prigionieri scelti per età o mestiere; il bronzo del palazzo imperiale, secondo Procopio;
     «un saccheggio organizzato»), il commento delle fonti in testa a js/dati.js (Prospero 1375: «cum regina et filiabus eius Cartaginem abducta sunt»), EVENTI africa534 (i tesori
     del Tempio di Gerusalemme presi nel 455, secondo Procopio), il commento di vandali455 in js/scene-tappe.js (la strada verso Porto è uno schema);
   - 546: tappa, voce (Procopio VII 22: un terzo delle mura abbattuto, forse esagerato; la lettera di Belisario, rielaborata; la città «del tutto deserta») e storici («quaranta giorni
     o più», secondo chi proseguì la cronaca di Marcellino Comes; «È difficile che ogni abitante se ne fosse andato»), EVENTI totila546 (17 dicembre, di notte, porta Asinaria,
     incendi in Trastevere), il commento di totila546 in js/scene-tappe.js (Procopio VII 20: quattro Isauri della guardia aprono la porta).
   Schemi, detti nel disegno: le piante (mura, Tevere e porte del modello), la strada dal mare del 455, il campo dei Goti del 410 senza un luogo preciso; i quadratini dei giorni contano
   giorni, non danni; la linea delle fonti mette ogni fonte all'anno in cui scrive secondo la pagina («verso», «intorno», «VI secolo»: le date sono approssimate).
   Lasciato fuori perché la pagina non lo dice: l'anno in cui scrive il continuatore di Marcellino Comes (è sulla linea senza data), quanto durò il saccheggio del 546, i numeri dei morti. */
var SACCHI={ titolo:"I sacchi di Roma a confronto", sotto:"410, 455, 546: quanto durarono, che cosa fu preso, che cosa dicono le fonti",
  fasi:[["Tre sacchi","Roma è presa e saccheggiata nel 410, nel 455 e nel 546. Qui i tre sacchi, uno accanto all'altro, con le stesse domande."],
    ["410","24 agosto 410: dopo due assedi falliti, i Goti di Alarico entrano da porta Salaria."],
    ["455","Giugno 455: dopo l'assassinio di Valentiniano III, Genserico arriva dal mare con i Vandali. Papa Leone gli va incontro fuori dalle porte."],
    ["546","17 dicembre 546: di notte il re goto Totila entra da porta Asinaria. Secondo Procopio, gliela aprono quattro soldati isauri della guardia."],
    ["Quanto durò?","Per il 410 le fonti non concordano: tre giorni secondo Orosio, sei secondo Marcellino Comes."],
    ["Quanto durò?","Nel 455 i Vandali cercano le ricchezze della città per quattordici giorni, dal 2 al 16 giugno."],
    ["Quanto durò?","Del 546 colpisce un altro numero: secondo il cronista che continuò Marcellino Comes, Roma resta deserta per quaranta giorni o più."],
    ["Che cosa?","410: bruciano le case vicino alla porta e la casa di Sallustio, forse anche la basilica Emilia. Chi si rifugia a San Pietro e a San Paolo è rispettato."],
    ["Che cosa?","455: niente incendi, stragi o torture, lo ottiene papa Leone. Ma i Vandali portano via tutto: il bronzo del palazzo, metà del tetto dorato del tempio di Giove, migliaia di prigionieri."],
    ["Che cosa?","546: Totila abbatte tratti delle mura, brucia una parte di Trastevere e porta via gli abitanti. Voleva bruciare anche i monumenti: una lettera di Belisario lo ferma."],
    ["Le fonti","Chi lo racconta? Ogni linea va dal sacco all'anno in cui la fonte scrive: alcuni scrivono in quei mesi, altri più di un secolo dopo."],
    ["Le fonti","Prospero scrive nei mesi del sacco del 455. Procopio, consigliere di Belisario, conosce il 546 da vicino, ma rielabora la lettera che riporta e forse esagera."],
    ["Tre sacchi","Per il 410 le fonti divergono sulla durata. Il 455 è un saccheggio organizzato. Dopo il 546 la città è spopolata: è difficile però che ogni abitante se ne fosse andato."]],
  fonte:"Tappe del 410, del 455 e del 546 di questa pagina, con le voci, i riquadri degli storici e della leggenda e le didascalie della città: Orosio VII 39, Marcellino Comes e il suo continuatore, Procopio (Guerre III 2, III 5, IV 9, VII 20 e 22, nella traduzione inglese di Dewing), Prospero d'Aquitania (Cronaca, 1375), Girolamo. Le piante usano mura, Tevere e porte del modello della città: il campo dei Goti del 410 non ha un luogo preciso, la strada dal mare del 455 e i tratti di mura abbattuti nel 546 sono schemi. Le durate non si confrontano alla pari: per il 546 il numero è quello dei giorni in cui la città sarebbe rimasta deserta, non la durata del saccheggio. Sulla linea delle fonti gli anni in cui scrivono sono approssimati, come li dà la pagina; per il continuatore di Marcellino la pagina non dice quando scrive." };
function disegnaSacchi(svg,S,W,H){
  var TP=window.RM_TOPO; if(!TP||!TP.porte||!TP.mura) return;
  var oriz=W/H>=1.15, piccolo=oriz&&W<700, righe=!oriz, pad=oriz?16:10, gap=oriz?(piccolo?8:16):8, defs=el('defs',null,svg), fasi=SACCHI.fasi, i;
  var T=[1300,5600,10000,14800,20000,24400,28800,34200,39600,45400,51400,57600,63600], tFin=T[12]+7400;
  var C3=['#7A5617','#2F5864','#5A3F78'];      /* colori dei tre sacchi: oro scuro, blu del mare, viola: distinti anche per chi non distingue rosso e verde */
  var pt=el('pattern',{id:'ig-sc-trat',width:5,height:5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs); el('rect',{width:5,height:5,fill:'#F4E9D2'},pt); el('rect',{width:2,height:5,fill:'#B48A3C'},pt);
  var gfu=el('radialGradient',{id:'ig-sc-fuoco'},defs); [[0,'#FFF3D0',1],[.25,'#FFC85A',.95],[.6,'#E8622C',.45],[1,'#B8321A',0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1],'stop-opacity':q[2]},gfu); });
  /* le tre schede */
  var SC=[{a:'410',chi:'Alarico e i Goti',giorno:'24 agosto'},{a:'455',chi:'Genserico e i Vandali',giorno:'2-16 giugno'},{a:'546',chi:'Totila e i Goti',giorno:'17 dicembre, di notte'}];
  var PESO=[1,1,1.15], yB=pad, box=[0,1,2].map(function(k){ if(righe){ var hh=(H-2*pad-2*gap)*PESO[k]/3.15, b=[pad,yB,W-2*pad,hh]; yB+=hh+gap; return b; } var ww=(W-2*pad-2*gap)/3; return [pad+k*(ww+gap),pad,ww,H-2*pad]; });
  var gSch=el('g',{'class':'ig-sc-schede'},svg);
  SC.forEach(function(q,k){ var b=box[k], g=el('g',{'class':'ig-sc-scheda'},gSch); g.style.setProperty('--c',C3[k]); q.g=g; q.b=b;
    el('rect',{x:r1(b[0]),y:r1(b[1]),width:r1(b[2]),height:r1(b[3]),rx:12,'class':'ig-sc-fondo'},g); el('rect',{x:r1(b[0]),y:r1(b[1]),width:r1(righe?4:b[2]),height:r1(righe?b[3]:4),rx:2,'class':'ig-sc-filo'},g);
    var hw=righe?Math.min(118,b[2]*.33):b[2], fa=righe?30:piccolo?28:40, ta=tx(g,b[0]+(righe?14:12),b[1]+(righe?fa+6:fa+12),'ig-sc-anno',q.a); ta.style.fontSize=fa+'px';
    var tc=el('text',{x:r1(b[0]+(righe?14:12)),y:r1(b[1]+(righe?fa+26:fa+32)),'class':'ig-sc-chi'},g), nc=avvolgi(tc,q.chi,hw-(righe?18:24),15);
    var tg=el('text',{x:r1(b[0]+(righe?14:12)),y:r1(b[1]+(righe?fa+26:fa+32)+nc*15+2),'class':'ig-sc-giorno'},g); var ng=avvolgi(tg,q.giorno,hw-(righe?18:24),14);
    var top=righe?b[1]+8:b[1]+fa+32+nc*15+ng*14+8;
    q.corpo=righe?[b[0]+hw,b[1]+8,b[2]-hw-10,b[3]-16]:[b[0]+10,top,b[2]-20,b[1]+b[3]-top-10]; });
  /* la pianta di ciascuna scheda: in alto nel corpo (sul telefono in piedi tutto il corpo) */
  var EXT=[-272,-242,292,234];      /* mura e San Pietro; San Paolo resta fuori, segnato sul bordo */
  var P410={porta:TP.porte['Porta Salaria'],case:[100,-192],sall:[78,-165],emi:[7.2,-1],sp:[-259,-108]}, PORTESE=TP.porte['Porta Portese'], ASIN=TP.porte['Porta Asinaria'], GIOVE=[-29,0];
  function pianta(q,k){ var c=q.corpo, ph=righe?c[3]:Math.min(c[3]*(piccolo?.5:.56),c[2]*.92), w=EXT[2]-EXT[0], hh=EXT[3]-EXT[1], kk=Math.min(c[2]/w,ph/hh), ox=c[0]+(c[2]-w*kk)/2-EXT[0]*kk, oy=c[1]+(ph-hh*kk)/2-EXT[1]*kk;
    var cp=el('clipPath',{id:'ig-sc-cp'+k},defs); el('rect',{x:r1(q.b[0]+2),y:r1(q.b[1]+2),width:r1(q.b[2]-4),height:r1(q.b[3]-4),rx:10},cp);
    var B=function(p){ return [ox+p[0]*kk,oy+p[1]*kk]; }, g=el('g',{'class':'ig-sc-pianta','clip-path':'url(#ig-sc-cp'+k+')'},q.g); q.pianta={g:g,B:B,h:ph,k:kk};
    el('path',{d:'M'+TP.mura.map(B).map(xy).join('L')+'Z','class':'ig-sc-mura'},g);
    el('polyline',{points:TP.fiume.filter(function(p){ return p[1]>EXT[1]-40&&p[1]<EXT[3]+60; }).map(B).map(xy).join(' '),'class':'ig-sc-fiume'},g);
    var segni=el('g',{'class':'ig-sc-segni'},g); q.segni=segni; return {g:g,B:B,s:segni}; }
  function freccia(p,a,b,cl){ var g=el('g',{'class':'ig-sc-ingr '+(cl||'')},p), dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, u=[dx/L,dy/L], e=[b[0]-u[0]*6,b[1]-u[1]*6];
    var l=el('path',{d:'M'+xy(a)+' L'+xy(e),'class':'ig-sc-ingr-l'},g); scopri(l); el('path',{d:'M3 0 L-8 -5 L-5.5 0 L-8 5 Z',transform:'translate('+xy(e)+') rotate('+r1(Math.atan2(u[1],u[0])*180/Math.PI)+')','class':'ig-sc-ingr-p'},g); g._l=l; return g; }
  function fuoco(p,q,incerto){ var g=el('g',{'class':'ig-sc-fuoco',transform:'translate('+xy(q)+')'},p); el('circle',{r:13,fill:'url(#ig-sc-fuoco)','class':'ig-sc-vampa'},g); el('circle',{r:2.4,'class':'ig-brace'},g); if(incerto) el('circle',{r:9,'class':'ig-sc-incerto'},g); return g; }
  function croce(p,q){ var g=el('g',{'class':'ig-sc-rif',transform:'translate('+xy(q)+')'},p); el('circle',{r:9,'class':'ig-sc-rif-c'},g); el('path',{d:'M0 -5 V5 M-3.5 -1.5 H3.5','class':'ig-sc-croce'},g); return g; }
  function nome(p,q,s,dx,dy,an){ return tx(p,q[0]+dx,q[1]+dy,'ig-sc-nome',s,an||'start'); }
  var PI_=SC.map(pianta), mA=[], mC=[];
  /* 410 */
  (function(){ var P=PI_[0], B=P.B, po=B(P410.porta), ca=B([P410.porta[0]+14,P410.porta[1]-46]); var ing=freccia(P.s,[ca[0]+8,ca[1]-14],po);
    var campo=el('g',{'class':'ig-sc-campo',transform:'translate('+xy([ca[0]+8,ca[1]-18])+')'},P.s); [[-6,2],[0,-3],[6,2]].forEach(function(q){ el('path',{d:'M'+(q[0]-4)+' '+(q[1]+3)+' L'+q[0]+' '+(q[1]-4)+' L'+(q[0]+4)+' '+(q[1]+3)+' Z','class':'ig-tenda'},campo); });
    var nP=nome(P.s,po,'porta Salaria',-7,-6,'end'); mA.push({g:[ing,campo,nP],l:ing._l,k:0});
    var f1=fuoco(P.s,B(P410.case)), f2=fuoco(P.s,B(P410.sall)), f3=fuoco(P.s,B(P410.emi),true), r1_=croce(P.s,B(P410.sp)), nSP=nome(P.s,B(P410.sp),'San Pietro',0,-12,'middle'), spB=B([-70,EXT[3]-6]), r2=el('g',{'class':'ig-sc-rif'},P.s);
    el('path',{d:'M'+xy([spB[0],spB[1]-6])+' v8 l-4 -4 M'+xy([spB[0],spB[1]+2])+' l4 -4','class':'ig-sc-giu'},r2); tx(r2,spB[0]+8,spB[1]+2,'ig-sc-nome piccolo','San Paolo');
    mC.push({g:[f1,f2,f3,r1_,nSP,r2],k:0}); })();
  /* 455 */
  (function(){ var P=PI_[1], B=P.B, d=[-.838,.546], pp=B(PORTESE), da=B([PORTESE[0]+d[0]*120,PORTESE[1]+d[1]*120]); var ing=freccia(P.s,da,pp,'schema'); var nM=nome(P.s,da,'dal mare',0,14,'middle');
    mA.push({g:[ing,nM],l:ing._l,k:1});
    var gq=B(GIOVE), tet=el('g',{'class':'ig-sc-tetto',transform:'translate('+xy(gq)+')'},P.s); el('path',{d:'M-9 1 L0 -7 L9 1 Z','class':'ig-sc-tetto-a'},tet); el('path',{d:'M0 -7 L9 1 L0 1 Z','class':'ig-sc-tetto-b'},tet); el('rect',{x:-7,y:1,width:14,height:7,'class':'ig-sc-tetto-c'},tet);
    var ex=freccia(P.s,pp,da,'via'); mC.push({g:[tet,ex],l:ex._l,k:1}); })();
  /* 546 */
  (function(){ var P=PI_[2], B=P.B, aq=B(ASIN), da=[aq[0]+28,aq[1]+18]; var ing=freccia(P.s,da,aq,'notte'); var nA=nome(P.s,aq,'porta Asinaria',-4,18,'end'); mA.push({g:[ing,nA],l:ing._l,k:2});
    var f1=fuoco(P.s,B([-125,40])), f2=fuoco(P.s,B([-112,62])), nT=nome(P.s,B([-125,40]),'Trastevere',-14,-6,'end');
    var br=el('g',{'class':'ig-sc-brecce'},P.s); var n=TP.mura.length; [Math.floor(n*.12),Math.floor(n*.38),Math.floor(n*.63)].forEach(function(j){ var a=B(TP.mura[j]), b=B(TP.mura[(j+3)%n]); el('path',{d:'M'+xy(a)+' L'+xy(b),'class':'ig-sc-breccia'},br); });
    mC.push({g:[f1,f2,nT,br],k:2}); })();
  var avvB=null; if(PI_[2].h>70){ var b2=SC[2].corpo; avvB=tx(SC[2].g,b2[0]+b2[2],b2[1]+PI_[2].h+(righe?-2:10),'ig-m-schema ig-f','tratti abbattuti: dove, uno schema','end'); if(largo(avvB)>b2[2]) avvB.textContent='brecce: schema'; }
  /* quanto durò: i quadratini dei giorni, uno per giorno */
  function areaSotto(q){ var c=q.corpo; return righe?c:[c[0],c[1]+q.pianta.h+(oriz?14:8),c[2],c[3]-q.pianta.h-(oriz?14:8)]; }
  var DUR=[{n:6,piene:3,num:'3 o 6',et:'giorni',nota:'3 secondo Orosio, 6 secondo Marcellino Comes',corta:'Orosio 3, Marcellino Comes 6'},{n:14,piene:14,num:'14',et:'giorni',nota:'dal 2 al 16 giugno, secondo Prospero',corta:'dal 2 al 16 giugno'},{n:40,piene:0,num:'40',et:'giorni o più',nota:'la città deserta: non è la durata del saccheggio',corta:'città deserta: non la durata del sacco'}];
  var cw=Math.min.apply(null,SC.map(function(q){ return areaSotto(q)[2]; })), qd=clamp(Math.floor(cw/10)-3,9,righe?14:18), giorni=[];
  SC.forEach(function(q,k){ var a=areaSotto(q), g=el('g',{'class':'ig-sc-dur'},q.g), d=DUR[k], fn=righe?24:piccolo?24:34; q.dur=g;
    var tn=tx(g,a[0],a[1]+fn*.9,'ig-sc-num','0'); tn.style.fontSize=fn+'px'; var te=tx(g,a[0],a[1]+fn*.9,'ig-sc-num-t',d.et); q.tn=tn; q.te=te;
    var qk=qd; for(var rg=1;rg<=4;rg++){ var qp=Math.min(qd,Math.floor((a[2]+3)/Math.ceil(d.n/rg))-3); if(qp>=Math.min(qd,11)){ qk=qp; break; } }      /* le file di quadratini più corte possibile: sul telefono 14 giorni in una fila e 40 in tre, a 1280 40 in due */
    var y0=a[1]+fn*.9+10, cols=Math.max(1,Math.floor((a[2]+3)/(qk+3))), cel=[];
    for(var j=0;j<d.n;j++){ var cx=a[0]+(j%cols)*(qk+3), cy=y0+Math.floor(j/cols)*(qk+3), r=el('rect',{x:r1(cx),y:r1(cy),width:qk,height:qk,rx:2.5,'class':'ig-sc-g '+(k===2?'vuoto':j<d.piene?'pieno':'forse')},g); cel.push(r); }
    var yN=y0+Math.ceil(d.n/cols)*(qk+3)+14, tN=el('text',{x:r1(a[0]),y:r1(yN),'class':'ig-sc-nota'},g), nN=avvolgi(tN,d.nota,a[2],14);
    if(yN+(nN-1)*14>a[1]+a[3]+4){ tN.textContent=''; nN=avvolgi(tN,d.corta,a[2],13); if(yN+(nN-1)*13>a[1]+a[3]+6){ tN.textContent=''; tN.style.fontSize='11px'; nN=avvolgi(tN,d.corta,a[2],12); var su=Math.min(14,yN+(nN-1)*12-(a[1]+a[3]+2)); if(su>0) g.setAttribute('transform','translate(0,'+r1(-su)+')'); } }      /* nelle colonne strette (812) la nota non esce più a destra: corpo 11 e, se serve, il blocco sale un poco */
    giorni.push(cel); });
  /* che cosa: le voci con un segno */
  var COSE=[[['fuoco','case vicino alla porta e casa di Sallustio'],['croce','rifugio rispettato a San Pietro e San Paolo'],['forse','la basilica Emilia, probabilmente']],
    [['scudo','niente incendi, stragi e torture: lo ottiene papa Leone'],['bronzo','il bronzo del palazzo imperiale'],['tetto','metà del tetto dorato del tempio di Giove'],['gente','migliaia di prigionieri, con l\'imperatrice e le figlie'],['tesoro','i tesori del Tempio di Gerusalemme, secondo Procopio']],
    [['mura','tratti delle mura abbattuti: «circa un terzo», forse esagerato'],['fuoco','una parte di Trastevere bruciata'],['gente','gli abitanti portati via'],['lettera','i monumenti salvi, per una lettera di Belisario']]];
  function icona(p,tipo,x,y){ var g=el('g',{'class':'ig-sc-ic '+tipo,transform:'translate('+r1(x)+','+r1(y)+')'},p);
    if(tipo==='fuoco'||tipo==='forse') el('path',{d:FIAMMA,transform:'scale(.62)'},g); else if(tipo==='croce') el('path',{d:'M0 -6 V6 M-4 -2 H4'},g); else if(tipo==='scudo') el('path',{d:'M0 -7 L6 -4.5 V0 Q6 5 0 7 Q-6 5 -6 0 V-4.5 Z'},g);
    else if(tipo==='tetto') el('path',{d:'M-7 2 L0 -6 L7 2 Z M-5 3 H5 V6 H-5 Z'},g); else if(tipo==='bronzo') el('path',{d:'M-6 5 H6 L4 -3 H-4 Z M-2 -3 V-6 H2 V-3'},g);
    else if(tipo==='gente'){ [[-4,0],[3,1]].forEach(function(q){ el('circle',{cx:q[0],cy:q[1]-4.5,r:2.2},g); el('path',{d:'M'+(q[0]-3)+' '+(q[1]+6)+' Q'+q[0]+' '+(q[1]-3)+' '+(q[0]+3)+' '+(q[1]+6)+' Z'},g); }); }
    else if(tipo==='tesoro') el('path',{d:'M-6 -1 H6 V6 H-6 Z M-6 -1 Q0 -8 6 -1'},g); else if(tipo==='mura') el('path',{d:'M-7 6 V-2 H-4 V-5 H-1 V-2 H1 V-5 H4 V-2 H7 V1 L3 6 Z'},g);
    else if(tipo==='lettera') el('path',{d:'M-7 -5 H7 V5 H-7 Z M-7 -5 L0 1 L7 -5'},g); return g; }
  var maxV=righe?4:5;      /* le voci che non entrano nel riquadro si tolgono, più giù; il bronzo del palazzo viene subito dopo lo scudo, perché sul telefono non restasse fuori (24 novembre 2026) */
  SC.forEach(function(q,k){ var a=areaSotto(q), g=el('g',{'class':'ig-sc-cose'},q.g), y=a[1]+2, lh=righe?13.5:piccolo?12.5:15, fs=righe?11.5:piccolo?11:13; q.cose=[]; q.coseG=g;
    COSE[k].slice(0,maxV).forEach(function(c){ if(y+lh>a[1]+a[3]) return; var r=el('g',{'class':'ig-sc-cosa'},g); icona(r,c[0],a[0]+7,y+lh*.6); var t=el('text',{x:r1(a[0]+20),y:r1(y+lh*.88),'class':'ig-sc-cosa-t'},r); t.style.fontSize=fs+'px';
      var n=avvolgi(t,c[1],a[2]-22,lh); if(y+n*lh>a[1]+a[3]+2){ r.remove(); return; } q.cose.push(r); y+=n*lh+(righe?3:piccolo?3:6); }); });
  /* il finale: la frase della pagina per ciascun sacco */
  var FINE=[['le fonti divergono','sulla durata'],['un saccheggio','organizzato'],['una città','spopolata']];
  SC.forEach(function(q,k){ var a=areaSotto(q), g=el('g',{'class':'ig-sc-fine'},q.g), fs=righe?17:piccolo?16:22, t=el('text',{x:r1(a[0]),y:r1(a[1]+fs+(righe?2:6)),'class':'ig-sc-fine-t'},g); t.style.fontSize=fs+'px';
    avvolgi(t,'«'+FINE[k][0]+' '+FINE[k][1]+'»',a[2],fs*1.2); q.fine=g; });
  /* le fonti: dal sacco all'anno in cui la fonte scrive. Una riga per fonte: a sinistra chi e che cosa, a destra il tratto dal sacco all'anno in cui scrive */
  var gF=el('g',{'class':'ig-atto'},svg), fb=[pad+(oriz?10:2),pad,W-2*pad-(oriz?20:4),H-2*pad], A0=400, A1=600, cl=righe?112:piccolo?128:Math.min(200,fb[2]*.24), lx0=fb[0]+cl+10, lx1=fb[0]+fb[2]-(oriz?10:6);
  var X=function(a){ return lx0+(a-A0)/(A1-A0)*(lx1-lx0); }, top=fb[1]+(righe?40:44), bot=fb[1]+fb[3]-20;
  tx(gF,fb[0],fb[1]+14,'ig-m-testata','CHI LO RACCONTA, E QUANDO'); var sotF=tx(gF,fb[0],fb[1]+31,'ig-m-sotto','dal sacco all\'anno in cui la fonte scrive'); if(largo(sotF)>fb[2]) sotF.textContent='dal sacco all\'anno in cui scrive';
  [400,450,500,550,600].forEach(function(a){ el('line',{x1:r1(X(a)),x2:r1(X(a)),y1:r1(top),y2:r1(bot),'class':'ig-griglia'},gF); tx(gF,X(a),bot+15,'ig-asse',String(a),a===400?'start':a===600?'end':'middle'); });
  var FONTI=[[410,[['Girolamo',412,'da Betlemme, fra il 410 e il 414'],['Orosio',417,'intorno al 417: tre giorni'],['Marcellino Comes',500,'VI secolo: sei giorni','sec'],['Procopio',550,'verso il 550: la casa di Sallustio']]],
    [455,[['Prospero',455,'in quei mesi'],['Procopio',550,'verso il 550: il tetto, il bronzo']]],[546,[['Procopio',550,'consigliere di Belisario'],['il continuatore di Marcellino',null,'quando scrive: non detto']]]];
  var VERDETTI=['le fonti non concordano sulla durata','scritto in quei mesi','un testimone, ma forse esagera'];
  var nr=0; FONTI.forEach(function(f){ nr+=f[1].length; }); var rh3=Math.min(righe?30:34,(bot-top-6)/(nr+3*.95)), hh3=rh3*.95, yy=top+4, corsie=[];
  FONTI.forEach(function(f,k){ var g=el('g',{'class':'ig-sc-corsia'},gF), cr={g:g,archi:[],punti:[]}; g.style.setProperty('--c',C3[k]);
    var ta=tx(g,fb[0],yy+hh3*.78,'ig-sc-c-anno',String(f[0])); ta.style.fontSize=(righe?16:18)+'px';
    var v=el('g',{'class':'ig-sc-verd'},g), tv=tx(v,fb[0]+largo(ta)+10,yy+hh3*.72,'ig-sc-verd-t',VERDETTI[k]); if(fb[0]+largo(ta)+10+largo(tv)>lx1) tv.style.fontSize='10.5px'; cr.v=v;
    var xe=X(f[0]); yy+=hh3; var y0=yy;
    f[1].forEach(function(s2,j){ var pg=el('g',{'class':'ig-sc-fonte'},g), y=yy+rh3*.5; el('line',{x1:r1(fb[0]),x2:r1(lx1),y1:r1(yy+rh3),y2:r1(yy+rh3),'class':'ig-sc-c-riga'},pg);
      var fitto=rh3<27, tn=tx(pg,fb[0]+8,y-(fitto?2:1),'ig-sc-f-n',s2[0]), ts=tx(pg,fb[0]+8,y+(fitto?9:12),'ig-sc-f-s',s2[2]); if(fitto){ tn.style.fontSize='11px'; ts.style.fontSize='10.5px'; } if(largo(tn)>cl-6) tn.textContent=s2[0].replace('il continuatore di Marcellino','continuatore'); if(largo(ts)>cl-6){ var corto=s2[2].split(': ')[1]||s2[2]; ts.textContent=corto; if(largo(ts)>cl-6) ts.style.fontSize='11px'; }
      if(s2[1]==null){ var d0=el('path',{d:'M'+r1(xe)+' '+r1(y)+' H'+r1(Math.min(lx1,xe+(lx1-lx0)*.16)),'class':'ig-sc-f-ignoto'},pg); tx(pg,Math.min(lx1,xe+(lx1-lx0)*.16)+4,y+4,'ig-sc-f-q','?'); }
      else { var x1=X(s2[1]), ar=el('path',{d:'M'+r1(xe)+' '+r1(y)+' H'+r1(Math.max(xe+.5,x1)),'class':'ig-sc-f-arco'},pg); scopri(ar); cr.archi.push(ar);
        if(s2[3]==='sec') el('rect',{x:r1(X(500)),y:r1(y-5),width:r1(X(600)-X(500)),height:10,rx:5,'class':'ig-sc-f-sec'},pg); else el('circle',{cx:r1(x1),cy:r1(y),r:4.5,'class':'ig-sc-f-p'},pg); }
      el('circle',{cx:r1(xe),cy:r1(y),r:3.2,'class':'ig-sc-c-ev'},pg);
      cr.punti.push(pg); yy+=rh3; });
    el('line',{x1:r1(xe),x2:r1(xe),y1:r1(y0+2),y2:r1(yy-2),'class':'ig-sc-c-asse'},g);
    yy+=rh3*.0; corsie.push(cr); });
  S.passo=function(t){
    var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; });
    var fonti=i>=10&&i<12;
    cls(gSch,'vis',t>=T[0]-300); cls(gSch,'via',fonti);
    SC.forEach(function(q,k){ cls(q.g,'vis',t>=T[0]+k*350); cls(q.g,'ora',i===k+1||i===k+4||i===k+7); cls(q.g,'spenta',(i>=1&&i<=3&&i!==k+1)||(i>=4&&i<=6&&i!==k+4)||(i>=7&&i<=9&&i!==k+7));
      var pv=righe?(i>=0&&i<4):i<10||i>=12; cls(q.pianta.g,'vis',pv&&t>=T[0]+400); });
    mA.forEach(function(m){ var t0=T[m.k+1]+300, f=E.io(fase(t,t0,t0+1400)); traccia(m.l,f); m.g.forEach(function(e){ cls(e,'vis',t>=t0); }); });
    mC.forEach(function(m){ var t0=T[m.k+7]+300; m.g.forEach(function(e,j){ cls(e,'vis',t>=t0+j*250&&(righe?false:true)&&i<10||i>=12&&t>=t0); }); if(m.l) traccia(m.l,E.io(fase(t,t0+800,t0+2400))); });
    if(avvB) cls(avvB,'vis',!righe&&(i===9||i>=12));
    SC.forEach(function(q,k){ var on=i>=4&&i<7, d=DUR[k], t0=T[k+4]+300; cls(q.dur,'vis',on&&t>=T[4]-200);
      var f=E.out(fase(t,t0,t0+(k===2?2600:1600))), n=Math.round(d.n*f); giorni[k].forEach(function(r,j){ cls(r,'vis',j<n); });
      if(k===0&&f>=1){ if(!q.tn._tre){ q.tn._tre=1; q.tn._s=null; q.tn.textContent='3'; el('tspan',{'class':'ig-sc-num-o'},q.tn).textContent=' o '; q.tn.appendChild(document.createTextNode('6')); } }
      else { q.tn._tre=0; scrivi(q.tn,t<t0?'·':k===0?String(Math.max(1,Math.round(6*f))):String(Math.max(1,n))); } fissa(q.te,'x',r1(+q.tn.getAttribute('x')+largo(q.tn)+8));
      cls(q.coseG,'vis',i>=7&&i<10); q.cose.forEach(function(r,j){ cls(r,'vis',t>=T[k+7]+400+j*450); });
      cls(q.fine,'vis',i>=12&&t>=T[12]+500+k*700); });
    cls(gF,'vis',fonti); corsie.forEach(function(c,k){ cls(c.g,'vis',t>=T[10]+300+k*500);
      c.archi.forEach(function(a,j){ traccia(a,E.io(fase(t,T[10]+700+k*500+j*350,T[10]+1900+k*500+j*350))); });
      c.punti.forEach(function(p,j){ cls(p,'vis',t>=T[10]+900+k*500+j*350); }); cls(c.v,'vis',i>=11&&t>=T[11]+400+k*700); });
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,k){ return {t:T[k],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   16. Gli acquedotti tagliati (537)
   Aggiunta il 23 novembre 2026 (gruppo 3). La pianta di Roma è quella del modello: mura, Tevere e quote del terreno da RM_TOPO (il rilievo si ombreggia qui da RM_TOPO.quote), i cinque
   acquedotti con i punti di LINEE in js/mura.js (Claudia con gli archi neroniani, Marcia-Tepula-Giulia, Vergine, Traiana, Antoniniano: tracciati e quote sono una ricostruzione, come dice
   il commento là), i sette campi del 537 da CAMPI in js/eventi.js (davanti alle porte Flaminia, Pinciana, Salaria, Nomentana, Tiburtina, Prenestina e nel campo di Nerone: posizioni
   del modello), le terme, la Meta Sudans, i mulini e San Pietro dalle posizioni di js/monumenti.js. Fatti, tutti dalla pagina:
   - tappa del 537 (i Goti tagliano tutti gli acquedotti; senz'acqua le grandi terme non possono più funzionare; alcuni acquedotti tornano, le terme restano chiuse); EVENTI assedio537
     (marzo 537 - marzo 538, Vitige, un anno e nove giorni, sette accampamenti); intermezzo «La città» del 590 (i quattordici acquedotti, i mulini galleggianti di Belisario, le
     sepolture nelle terme abbandonate nel VI e VII secolo); commento delle fonti (Procopio V 19, 13: i quattordici acquedotti);
   - schede: acquedotti («Undici condotti rifornivano d'acqua le terme, le fontane e i mulini»; Prammatica Sanzione del 554, che «da sola non documenta» i lavori; Gregorio Magno,
     gennaio 602; Adriano I e i quattro acquedotti: la Sabbatina, l'antica Traiana, interrotta da vent'anni con cento arcate crollate, che riporta l'acqua a San Pietro e ai mulini
     del Gianicolo; la Iovia, «forse un ramo della Marcia»; la Claudia al Laterano; la Vergine per quasi tutta la città; il 776 circa è una stima), mulini (Procopio: coppie di barche
     subito a valle di un ponte, la ruota fra le due barche; probabilmente ponte Sisto; mulini di questo tipo fino al 1870), terme di Traiano, Caracalla («non riapriranno»), Diocleziano,
     Tito e Costantino (nel modello chiudono nel 537), metasudans (la fontana dipendeva dagli acquedotti; la data è dedotta), CERTEZZA dei mulini (numero, posizione e aspetto: ipotesi);
   - tappa del 493 (Teodorico vieta di deviare l'acqua degli acquedotti); voce del 780 (Liber Pontificalis, vita di Adriano I).
   Schemi, detti nel disegno: i tracciati degli acquedotti, i punti dei tagli (le fonti non dicono dove), le posizioni dei campi, i mulini galleggianti (numero e forma), l'acqua che si
   svuota e torna. Che la Iovia sia il ramo di Caracalla (l'Antoniniano) è l'ipotesi del modello: è detto. Lasciato fuori perché la pagina non lo dice: che cosa fecero i Romani agli
   sbocchi degli acquedotti, quali acquedotti funzionassero fra il 538 e il 776, i nomi degli altri condotti. Le cifre (undici, quattordici per Procopio, diciannove coi rami) vengono dalla scheda degli acquedotti, messa d'accordo il 23 novembre 2026. */
var ACQUEDOTTI={ titolo:"Gli acquedotti, tagliati e riparati", sotto:"537: i Goti fermano l'acqua di Roma. Verso il 776 papa Adriano I ne fa riparare quattro",      // titolo per le due tappe, 537 e 780 (24 novembre 2026)
  fasi:[["Prima","Gli acquedotti portano a Roma l'acqua per le terme, le fontane e i mulini. I grandi acquedotti sono undici; con i rami, un catalogo del IV secolo arriva a diciannove. Procopio ne conta quattordici."],
    ["493","Il re goto Teodorico, che governa l'Italia, vieta di deviare l'acqua degli acquedotti."],
    ["Marzo 537","Il re goto Vitige assedia Roma, difesa da Belisario. I Goti allestiscono sette accampamenti: sei davanti alle porte fra il nord e l'est, uno oltre il Tevere."],
    ["537","I Goti tagliano tutti gli acquedotti che riforniscono la città."],
    ["537","Senz'acqua, le grandi terme non possono più funzionare. Anche le fontane dipendono dagli acquedotti."],
    ["537","Si fermano i mulini del Gianicolo: era l'acqua dell'acquedotto a far girare le macine del grano."],
    ["Belisario","Per continuare a macinare, Belisario fa ormeggiare sul Tevere coppie di barche, subito a valle di un ponte. Fra le due barche, la corrente fa girare una ruota collegata alla macina."],
    ["Marzo 538","L'assedio dura un anno e nove giorni."],
    ["554","Con la Prammatica Sanzione, Giustiniano conferma i fondi per riparare gli acquedotti. La legge però non dice se i lavori furono fatti."],
    ["602","Nel gennaio 602 papa Gregorio Magno scrive che gli acquedotti sono così trascurati da rischiare di andare in rovina del tutto."],
    ["verso il 776","Papa Adriano I fa riparare quattro acquedotti. L'anno è una stima degli studiosi: la fonte non lo dice."],
    ["verso il 776","La Sabbatina, l'antica Traiana, era interrotta da vent'anni e aveva cento arcate crollate. Riparata, porta di nuovo l'acqua a San Pietro e ai mulini del Gianicolo."],
    ["verso il 776","La Claudia riporta l'acqua al Laterano. La Vergine torna a dissetare quasi tutta la città. Riprende anche la Iovia, forse un ramo della Marcia."],
    ["Dopo","Le grandi terme invece restano chiuse: nel VI e nel VII secolo, in alcune si seppelliscono i morti. I mulini sulle barche resteranno sul Tevere fino al 1870."]],
  fonte:"Tappe del 493, del 537 e del 780 e intermezzo «La città» di questa pagina; schede degli acquedotti, dei mulini, della Meta Sudans e delle terme; Procopio, Guerre V 19 (i quattordici acquedotti, i mulini sulle barche); Prammatica Sanzione, capitolo 25; Gregorio Magno, Registro XII, 6; Liber Pontificalis, vita di Adriano I. Quanti fossero gli acquedotti: undici i grandi; diciannove con i rami, in un catalogo del IV secolo; quattordici per Procopio, nel 537: il perché, le fonti lette non lo spiegano. La pianta è quella del modello della città: i tracciati degli acquedotti e le loro quote sono una ricostruzione, i punti in cui i Goti li tagliarono non sono noti (i tagli sono segnati fuori dalle mura come schema), e così le posizioni dei sette campi. Che la Iovia sia il ramo costruito da Caracalla per le sue terme è l'ipotesi seguita dal modello. I mulini sulle barche sono disegnati come li descrive Procopio: numero, forma e posizione precisa sono ipotesi. Gli anni dei restauri di Adriano I sono una stima." };
function disegnaAcquedotti(svg,S,W,H){
  var TP=window.RM_TOPO; if(!TP||!TP.mura||!TP.quote) return;
  var oriz=W/H>=1.15, piccolo=oriz&&W<700, pad=oriz?16:10, defs=el('defs',null,svg), fasi=ACQUEDOTTI.fasi, i;
  var T=[1300,6600,10400,15400,20400,25000,29800,37600,41600,46200,51000,55600,61400,67600], tFin=T[13]+6800;
  var EXT=piccolo||!oriz?[-330,-252,335,250]:[-445,-252,365,262], ew=EXT[2]-EXT[0], eh=EXT[3]-EXT[1], mb, cb;      /* sul telefono la pianta stringe sulla città: la Traiana entra dal bordo */
  if(oriz){ var mw=W*(piccolo?.64:.62)-pad, mh=H-2*pad; var kk=Math.min(mw/ew,mh/eh); mb=[pad+(mw-ew*kk)/2,pad+(mh-eh*kk)/2,ew*kk,eh*kk]; cb=[pad+mw+(piccolo?12:28),pad+2,W-(pad+mw+(piccolo?12:28))-pad,H-2*pad-4]; }
  else { var kk2=(W-2*pad)/ew; mb=[pad,pad,ew*kk2,eh*kk2]; cb=[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-6]; }
  var k=mb[2]/ew, B=function(p){ return [mb[0]+(p[0]-EXT[0])*k, mb[1]+(p[1]-EXT[1])*k]; };
  var cp=el('clipPath',{id:'ig-aq-clip'},defs); el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),rx:12},cp);
  var tav=el('g',{'class':'ig-aq-tavola'},svg), carta=el('g',{'clip-path':'url(#ig-aq-clip)'},tav);
  el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),'class':'ig-aq-fondo'},carta);
  /* il rilievo, ombreggiato dalle quote del modello (luce da nord-ovest) */
  try{ var Q=TP.quote, cw=Math.round(Math.min(560,mb[2])), ch=Math.round(cw*eh/ew), cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; var cx=cv.getContext('2d'), im=cx.createImageData(cw,ch);
    var quota=function(x,z){ var c=(x-Q.x0)/Q.dx, r=(Q.z0-z)/Q.dz; c=clamp(c,0,Q.colonne-1.001); r=clamp(r,0,Q.righe-1.001); var c0=Math.floor(c), r0=Math.floor(r), fc=c-c0, fr=r-r0, n=r0*Q.colonne+c0;
      return ((Q.q[n]*(1-fc)+Q.q[n+1]*fc)*(1-fr)+(Q.q[n+Q.colonne]*(1-fc)+Q.q[n+Q.colonne+1]*fc)*fr)/10; };
    var px=ew/cw;
    for(var yy=0;yy<ch;yy++) for(var xx=0;xx<cw;xx++){ var X0=EXT[0]+xx*px, Z0=EXT[1]+yy*px, e=quota(X0,Z0), gx=(quota(X0+px*2,Z0)-quota(X0-px*2,Z0))/(px*40), gz=(quota(X0,Z0+px*2)-quota(X0,Z0-px*2))/(px*40);
      var sh=clamp(.5-(gx*-1+gz*-1)*3.2,0,1), alto=clamp(e/45,0,1), o=(yy*cw+xx)*4;
      im.data[o]=Math.round(238+alto*10-(1-sh)*52); im.data[o+1]=Math.round(229+alto*6-(1-sh)*56); im.data[o+2]=Math.round(208-alto*10-(1-sh)*60); im.data[o+3]=255; }
    cx.putImageData(im,0,0); href(el('image',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),preserveAspectRatio:'none','class':'ig-aq-rilievo'},carta),cv.toDataURL('image/png')); }catch(err){}
  el('polyline',{points:TP.fiume.map(B).map(xy).join(' '),'class':'ig-aq-tevere-a'},carta); el('polyline',{points:TP.fiume.map(B).map(xy).join(' '),'class':'ig-aq-tevere'},carta);
  el('path',{d:'M'+TP.mura.map(B).map(xy).join('L')+'Z','class':'ig-aq-mura'},carta);
  /* gli acquedotti del modello (js/mura.js, LINEE): Claudia, Marcia, Vergine, Traiana, Antoniniano */
  /* i tracciati sono quelli della città in 3D (LINEE in js/mura.js, rifatti il 24 novembre 2026 su OpenStreetMap): la Claudia arriva a porta Maggiore e prosegue con gli archi
     neroniani sul Celio; la Marcia segue le mura fino a porta Tiburtina; la Vergine finisce al suo castello nel Campo Marzio */
  var LINEE=[{n:'Claudia',p:[[436,228.2],[423.5,210.9],[412.2,177.7],[397.1,139.7],[389.3,127.2],[376.9,101.4],[350.6,75],[336,70.6],[318,63.4],[302.1,56.8],[275.9,40.7],[264.9,29.7],[244.9,17.4],[241,16.6],[234.6,18.1],[226,22],[220,27],[208,36.3],[204.5,39.3],[196.2,45.7],[186,51.3],[176.9,54.4],[156.7,57.1],[120,70],[87.1,81.7],[82.16,76.83],[76.1,71.7],[71.1,66.9],[37,60.4],[32,59.4],[26,54]],r:4,taglio:[302.1,56.8]},
    {n:'Marcia',p:[[436,224],[423,207],[413.5,176.5],[398.5,138.5],[390.5,126],[378,100.2],[351.6,73.8],[337,69.4],[319,62.2],[303,55.6],[277,39.5],[262,21],[253.5,6.5],[247.55,2.85],[241.1,-12.3],[209.8,-50.8],[205.75,-59.46]],r:0,taglio:[351.6,73.8]},
    {n:'Vergine',p:[[-16,-121],[-13.2,-112.4],[-17,-93],[-32.7,-76.41],[-36.92,-75.17],[-49,-74.5]],r:6,taglio:[-14.6,-116.7]},
    {n:'Traiana',p:[[-382,40.2],[-356.4,40.6],[-348.3,38.3],[-327.1,38.4],[-305.4,39.4],[-288.4,40.1],[-266.4,38.4],[-251,44.2],[-242.7,50.7],[-236.7,56],[-229.9,57.6],[-222,55.1],[-206,51.5],[-195.3,48.7],[-183,38],[-160,33]],r:7,taglio:[-356.4,40.6]},
    {n:'Antoniniano',p:[[175.4,200.9],[133.7,208.1],[68,175],[53.5,165.7]],r:4,taglio:[154.5,204.5]}];
  var gL=el('g',null,carta);
  LINEE.forEach(function(l,j){ var pts=l.p.map(B), d='M'+pts.map(xy).join(' L');
    l.g=el('g',{'class':'ig-aq-linea'},gL); el('path',{d:d,'class':'ig-aq-condotto'},l.g);
    l.acqua=el('path',{d:d,'class':'ig-aq-acqua'},l.g); l.L=lungo(l.acqua); l.acqua.style.strokeDasharray=l.L+' '+l.L;
    l.luce=el('path',{d:d,'class':'ig-aq-scorre'},l.g);
    if(l.r){ var d2='M'+pts.slice(0,l.r).map(xy).join(' L'); l.torna=el('path',{d:d2,'class':'ig-aq-acqua torna'},l.g); scopri(l.torna); l.lt=el('path',{d:d2,'class':'ig-aq-scorre torna'},l.g); }
    var tq=B(l.taglio); l.x=el('g',{'class':'ig-aq-taglio',transform:'translate('+xy(tq)+')'},gL); el('circle',{r:8,'class':'ig-aq-taglio-c'},l.x); el('path',{d:'M-4 -4 L4 4 M4 -4 L-4 4','class':'ig-aq-taglio-x'},l.x); });
  /* i nomi degli acquedotti */
  var NOMI=[[0,[212,94],'Claudia','start'],[1,[166,-58],'Marcia','end'],[2,[-28,-150],'Vergine','end'],[3,[piccolo||!oriz?-282:-330,26],'Traiana','middle'],[4,[180,222],'Antoniniano','middle']];
  var gN=el('g',{'class':'ig-aq-nomi ig-nome-cima'},carta); NOMI.forEach(function(n){ var q=B(n[1]); var t=tx(gN,q[0],q[1],'ig-aq-nome',n[2],n[3]); LINEE[n[0]].nome=t; });
  /* le terme, la fontana, i mulini, San Pietro e il Laterano */
  function terme(p,nome){ var q=B(p), g=el('g',{'class':'ig-aq-terme',transform:'translate('+xy(q)+')'},carta); el('rect',{x:-6,y:-4,width:12,height:8,rx:1.5,'class':'ig-aq-terme-r'},g);
    var vap=el('g',{'class':'ig-aq-vapore'},g); [-3,1,5].forEach(function(x,j){ var v=el('path',{d:'M'+x+' -6 q-2 -3 0 -6 t0 -6','class':'ig-aq-vap'},vap); v.style.animationDelay=(-j*.5)+'s'; }); g.nome=nome; return g; }
  var TERME=[terme([97.4,3.7],'Traiano'),terme([68,10],'Tito'),terme([59,150],'Caracalla'),terme([101,-122],'Diocleziano'),terme([21.5,-65.9],'Costantino')];
  var meta=el('g',{'class':'ig-aq-fontana',transform:'translate('+xy(B([45.6,27.8]))+')'},carta); el('circle',{r:4.4,'class':'ig-aq-fontana-c'},meta); var zam=el('g',{'class':'ig-aq-zampillo'},meta); [-1,0,1].forEach(function(a){ el('path',{d:'M0 -3 Q'+(a*4)+' -10 '+(a*6)+' -3'},zam); });
  var mulG=el('g',{'class':'ig-aq-mulino',transform:'translate('+xy(B([-160,33]))+')'},carta), ruota=el('g',{'class':'ig-aq-ruota'},mulG); el('circle',{r:6,'class':'ig-aq-ruota-c'},ruota); for(i=0;i<4;i++) el('path',{d:'M0 0 L'+r1(Math.cos(i*Math.PI/4)*6)+' '+r1(Math.sin(i*Math.PI/4)*6)+' M0 0 L'+r1(-Math.cos(i*Math.PI/4)*6)+' '+r1(-Math.sin(i*Math.PI/4)*6),'class':'ig-aq-ruota-r'},ruota);
  var etMul=tx(carta,B([-160,33])[0],B([-160,33])[1]+18,'ig-aq-et','mulini del Gianicolo','middle');
  var pietro=el('g',{'class':'ig-aq-luogo',transform:'translate('+xy(B([-259,-108]))+')'},carta); el('path',{d:'M0 -5 V5 M-3.5 -1.5 H3.5','class':'ig-aq-croce'},pietro); tx(pietro,0,-9,'ig-aq-et','San Pietro','middle');
  var later=el('g',{'class':'ig-aq-luogo',transform:'translate('+xy(B([169,73]))+')'},carta); el('path',{d:'M0 -5 V5 M-3.5 -1.5 H3.5','class':'ig-aq-croce'},later); tx(later,-7,12,'ig-aq-et','Laterano','end');
  var barche=el('g',{'class':'ig-aq-barche',transform:'translate('+xy(B([-111.7,4.6]))+')'},carta); el('circle',{r:9,'class':'ig-m-onda vis acqua'},barche); el('circle',{r:3.5,'class':'ig-aq-barche-p'},barche);
  /* i sette campi dei Goti (posizioni del modello) */
  var CAMPI=[[-80,-252],[30,-226],[116,-242],[180,-215],[250,-72],[292,18],[-215,-170]], gCa=el('g',{'class':'ig-aq-campi'},carta);
  CAMPI.forEach(function(c){ var q=B([c[0],c[1]-(c[1]<-235?-8:0)]), g=el('g',{transform:'translate('+xy(q)+')'},gCa); [[-5,1],[0,-3],[5,1]].forEach(function(t){ el('path',{d:'M'+(t[0]-4)+' '+(t[1]+3)+' L'+t[0]+' '+(t[1]-4)+' L'+(t[0]+4)+' '+(t[1]+3)+' Z','class':'ig-aq-tenda'},g); }); });
  var schC=tx(carta,mb[0]+10,mb[1]+18,'ig-m-schema ig-f','campi e tagli: posizioni indicative','start'); if(largo(schC)>mb[2]-20) schC.textContent='posizioni indicative';
  var schA=tx(carta,mb[0]+10,mb[1]+18,'ig-m-schema ig-f','tracciati: ricostruzione del modello','start'); if(largo(schA)>mb[2]*.7) schA.textContent='tracciati: ricostruzione';
  el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),rx:12,'class':'ig-m-cornice'},tav);
  /* i mulini sulle barche: un riquadro ingrandito sopra la pianta */
  var vw=Math.min(oriz?mb[2]*.44:mb[2]*.62,250), vh=vw*.62, vb=[mb[0]+mb[2]-vw-12,mb[1]+mb[3]-vh-12,vw,vh];
  var gV=el('g',{'class':'ig-aq-vign'},svg), cpV=el('clipPath',{id:'ig-aq-cv'},defs); el('rect',{x:r1(vb[0]),y:r1(vb[1]),width:r1(vb[2]),height:r1(vb[3]),rx:10},cpV);
  var pB=B([-111.7,4.6]); el('path',{d:'M'+xy(pB)+' L'+xy([vb[0],vb[1]+vb[3]*.3]),'class':'ig-aq-guida'},gV);
  var vin=el('g',{'clip-path':'url(#ig-aq-cv)'},gV); el('rect',{x:r1(vb[0]),y:r1(vb[1]),width:r1(vb[2]),height:r1(vb[3]),'class':'ig-aq-v-acqua'},vin);
  for(i=0;i<9;i++){ var oy=vb[1]+vb[3]*(.1+i*.1), on=el('path',{d:'M'+r1(vb[0]-30)+' '+r1(oy)+' q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0','class':'ig-aq-v-onda'},vin); on.style.animationDelay=(-i*.35)+'s'; }
  el('rect',{x:r1(vb[0]),y:r1(vb[1]),width:r1(vb[2]),height:r1(vb[3]*.13),'class':'ig-aq-v-ponte'},vin); tx(vin,vb[0]+vb[2]/2,vb[1]+vb[3]*.1,'ig-aq-v-ponte-t','il ponte','middle');
  var bs=vb[2]/250, coppie=[]; [.24,.55,.84].forEach(function(fx,j){ var cx2=vb[0]+vb[2]*fx, cy2=vb[1]+vb[3]*(.56+(j%2)*.08), g=el('g',{transform:'translate('+r1(cx2)+','+r1(cy2)+') scale('+r1(bs*100)/100+')'},vin);
    [-1,1].forEach(function(sx){ el('path',{d:'M'+(sx*15-7)+' -30 Q'+(sx*15)+' -36 '+(sx*15+7)+' -30 L'+(sx*15+7)+' 26 Q'+(sx*15)+' 32 '+(sx*15-7)+' 26 Z','class':'ig-aq-v-barca'},g); el('rect',{x:sx*15-5,y:-14,width:10,height:12,rx:1.5,'class':'ig-aq-v-casa'},g); });
    var rv=el('g',{'class':'ig-aq-v-ruota'},g); el('rect',{x:-8,y:-11,width:16,height:22,rx:2,'class':'ig-aq-v-ruota-o'},rv); for(var q2=-9;q2<=9;q2+=4.5) el('line',{x1:-8,x2:8,y1:q2,y2:q2,'class':'ig-aq-v-pala'},rv); rv.style.animationDelay=(-j*.3)+'s';
    el('line',{x1:-8,x2:8,y1:0,y2:0,'class':'ig-aq-v-asse'},g); coppie.push(g); });
  var vt=tx(gV,vb[0]+10,vb[1]+vb[3]-10,'ig-aq-v-t','numero e forma: ipotesi'); el('rect',{x:r1(vb[0]),y:r1(vb[1]),width:r1(vb[2]),height:r1(vb[3]),rx:10,'class':'ig-aq-v-cornice'},gV);
  var vtit=tx(gV,vb[0]+10,vb[1]-8,'ig-aq-v-tit','I mulini sulle barche di Belisario');
  if(largo(vtit)>vb[2]+40) vtit.textContent='Mulini sulle barche';
  var sottoV=NOMI.map(function(n){ var t=LINEE[n[0]].nome, b; try{ b=t.getBBox(); }catch(e){ return false; } return b.x<vb[0]+vb[2]&&b.x+b.width>vb[0]&&b.y<vb[1]+vb[3]&&b.y+b.height>vb[1]-24; });      // i nomi degli acquedotti che il riquadro dei mulini coprirebbe: mentre c'è, si nascondono (24 novembre 2026)
  /* la colonna: anno, stato, quadro di ciò che funziona */
  var gC=el('g',{'class':'ig-p-col-d'},svg), fsA=oriz?Math.min(piccolo?30:52,cb[2]/4.6):Math.min(28,W/12), tA=tx(gC,cb[0],cb[1]+fsA*.82,'ig-p-anno',''), tSt=el('text',{x:r1(cb[0]),y:r1(cb[1]+fsA*1.08+(oriz?14:12)),'class':'ig-p-stato'},gC);
  var STATI=['L\'ACQUA DI ROMA','UN DIVIETO','L\'ASSEDIO','I TAGLI','LE TERME A SECCO','I MULINI FERMI','I MULINI SULLE BARCHE','FINE DELL\'ASSEDIO','UNA LEGGE','L\'INCURIA','I RESTAURI','LA SABBATINA','TRE CONDOTTI','CIÒ CHE RESTA'];
  var yQ=cb[1]+fsA*1.08+(oriz?(piccolo?46:40):32), RIG=[['terme','LE GRANDI TERME'],['citta','L\'ACQUA IN CITTÀ'],['gianicolo','I MULINI DEL GIANICOLO'],['barche','I MULINI SULLE BARCHE']];
  var rh=oriz?(piccolo?36:44):30, quadro=[], stretta=cb[2]<200;
  RIG.forEach(function(r,j){ var y=yQ+j*rh, g=el('g',{'class':'ig-aq-q'},gC); el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},g);
    el('circle',{cx:r1(cb[0]+6),cy:r1(y+(oriz?rh*.5:rh*.5)),r:5,'class':'ig-aq-q-luce'},g); var tk=tx(g,cb[0]+18,y+(oriz?(piccolo?14:17):rh*.66),'ig-p-sch-k',stretta?r[1].replace('I MULINI DEL ','').replace('I MULINI SULLE ','SULLE ').replace('LE GRANDI ','').replace('L\'ACQUA IN ','IN '):r[1]);
    var tv=tx(g,oriz?cb[0]+18:cb[0]+cb[2],y+(oriz?(piccolo?30:36):rh*.66),'ig-aq-q-v','',oriz?'start':'end'); if(!oriz) tk.setAttribute('class','ig-p-sch-k'); quadro.push({g:g,v:tv,k:r[0]}); });
  var yLP=yQ+RIG.length*rh+16, gLP=el('g',null,gC), cit=null;
  if(oriz&&!piccolo&&cb[1]+cb[3]-yLP>90){ cit=citazione(gLP,cb[0],yLP,cb[2],'«Fece scorrere l\'acqua in abbondanza, come in antico, nell\'atrio del beato Pietro e anche dentro la città, cioè al Gianicolo, dove giravano le mole.»','Liber Pontificalis, vita di Adriano I',Math.min(16,cb[2]/22)); if(cit._h>cb[1]+cb[3]-yLP){ cit.remove(); cit=null; } }
  /* le tre cifre della scheda degli acquedotti (messe d'accordo il 23 novembre 2026): il numero in alto, la sua etichetta sotto, mai sovrapposti (24 novembre 2026: prima l'etichetta
     si misurava prima di ingrandire il numero e finiva sotto le cifre) */
  var cit14=null; if(oriz&&!piccolo&&cb[1]+cb[3]-yLP>60){ var g14=el('g',{'class':'ig-ad-num'},gC), cw3=cb[2]/3, fsN=Math.min(36,cw3*.36), yE=yLP+fsN*.85+15, hMax=0, fondo=cb[1]+cb[3];
    [['11','grandi acquedotti'],['19','con i rami, catalogo del IV secolo'],['14','secondo Procopio, nel 537']].forEach(function(c,j){ var x=cb[0]+j*cw3, n=tx(g14,x,yLP+fsN*.85,'ig-aq-num',c[0]); n.style.fontSize=r1(fsN)+'px';
      var e=el('text',{x:r1(x),y:r1(yE),'class':'ig-aq-num-t'},g14); hMax=Math.max(hMax,avvolgi(e,c[1],cw3-12,13.5)); });
    var nota=el('text',{x:r1(cb[0]),y:r1(yE+(hMax-1)*13.5+22),'class':'ig-aq-num-n'},g14), nN=avvolgi(nota,'Perché Procopio ne conti quattordici, le fonti lette non lo spiegano.',cb[2],16);
    if(yE+(hMax-1)*13.5+22+(nN-1)*16+4>fondo) nota.remove();      // senza posto, la nota resta nelle avvertenze
    if(yE+(hMax-1)*13.5+4>fondo) g14.remove(); else cit14=g14; }
  function stato(ii,t){ var c=ii>=3&&!(ii===3&&t<T[3]+2400);
    return {terme:ii<4&&!(ii===3&&t>=T[3]+2400)?['su','in funzione']:ii>=13?['mai','chiuse per sempre']:['giu','senz\'acqua'],
      citta:!c?['su','in funzione']:ii>=12?['su','torna con la Vergine']:['giu','si ferma'],
      gianicolo:ii<5&&!c?['su','girano']:ii<5?['giu','senz\'acqua']:ii>=11?['su','girano di nuovo']:['giu','ferme'],
      barche:ii<6?['no','—']:ii>=13?['su','fino al 1870']:ii<8?['su','macinano']:['no','dopo: nessuna notizia']}; }
  var visto=-1;
  S.passo=function(t){
    var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; }); var ii=Math.max(0,i);
    cls(tav,'vis',t>=T[0]-500); cls(schA,'vis',t>=T[0]+600&&i<2); cls(schC,'vis',i>=2&&i<6);
    var tg=T[3]+500, dr=E.io(fase(t,tg+900,tg+5200)), torna=[E.io(fase(t,T[11]+300,T[11]+3000)),E.io(fase(t,T[12]+300,T[12]+2800))];
    LINEE.forEach(function(l,j){ var tj=tg+j*220; cls(l.x,'vis',t>=tj&&i<10); cls(l.x,'taglia',t>=tj&&t<tj+800);
      var d=E.io(fase(t,tj+400,tj+4200)); fissa(l.acqua,'stroke-dashoffset',r1(-l.L*d)); cls(l.luce,'via',t>=tj); cls(l.g,'secca',d>=1);
      if(l.torna){ var f=j===3?torna[0]:torna[1]; traccia(l.torna,f); cls(l.lt,'vis',f>=1); } });
    cls(gN,'vis',t>=T[0]+500); [0,1,2,3,4].forEach(function(j){ var n=LINEE[j].nome; cls(n,'acceso',(i===11&&j===3)||(i===12&&(j===0||j===2||j===4))); });
    if(i>=12) scrivi(LINEE[4].nome,'Iovia? (forse)'); else scrivi(LINEE[4].nome,'Antoniniano');
    if(i===11) scrivi(LINEE[3].nome,'Sabbatina (Traiana)'); else if(i<11) scrivi(LINEE[3].nome,'Traiana');
    var asciutte=t>=T[3]+2400;
    TERME.forEach(function(g,j){ cls(g,'vis',t>=T[0]+300); cls(g,'spente',asciutte); cls(g,'mai',i>=13); cls(g,'ora',i===4&&t<T[5]); });
    cls(meta,'vis',t>=T[0]+300); cls(meta,'spente',asciutte&&!(i>=12&&false)); cls(mulG,'vis',t>=T[0]+300); cls(mulG,'fermo',i>=5&&i<11||(i===3||i===4)&&asciutte); cls(etMul,'vis',i===0||i===5||i===11);
    cls(pietro,'vis',i===11||i===0); cls(later,'vis',i===12);
    cls(gCa,'vis',i>=2&&i<8);
    var vV=i===6||i===7&&t<T[7]+1500; cls(barche,'vis',i>=6&&i<8||i>=13); cls(gV,'vis',vV); NOMI.forEach(function(n,j){ cls(LINEE[n[0]].nome,'coperto',vV&&sottoV[j]); });
    /* la colonna */
    cls(gC,'vis',t>=T[0]-300);
    if(i!==visto){ visto=i; scrivi(tA,i<0?'':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>16){ fa-=2; tA.style.fontSize=fa+'px'; } tSt.textContent=''; if(i>=0) avvolgi(tSt,STATI[ii],cb[2],17); }
    var st=stato(ii,t); quadro.forEach(function(q){ var v=st[q.k]; scrivi(q.v,v[1]); ['su','giu','mai','no'].forEach(function(c){ cls(q.g,c,v[0]===c); }); cls(q.g,'vis',t>=T[0]+200+quadro.indexOf(q)*200); });
    if(cit) cls(cit,'vis',i===11&&t>=T[11]+1200); if(cit14) cls(cit14,'vis',i===0&&t>=T[0]+1800);
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,j){ return {t:T[j],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   17. I barbari (intermezzo del 439)
   Aggiunta il 23 novembre 2026 (gruppo 3). Quadri: da dove vengono (la carta della pagina nel 235, con i popoli di POPOLI al loro posto «fuori»); il Danubio del 376; il Reno del 406,
   al centro; perché passarono; la strada dei Vandali fino a Cartagine e a Roma; i destini dei regni (una riga per popolo); quanti erano; che patti avevano con Roma.
   Carta, stati e posizioni: RM_MAPPA (popoli, luoghi, città) e TAPPE[].regioni (statiDi) di questa pagina; le posizioni dei popoli sono quelle della carta, indicative. Fatti:
   - intermezzo «I barbari» del 439 (Vittore di Vita: 80.000; Procopio: ottanta compagnie, ogni capo «di mille»; Heather: 15.000-20.000 combattenti più le famiglie; altri, cifre
     inferiori; federati, laeti, chi entrava nell'esercito; terre ai Vandali in Africa; per i federati, secondo Goffart, una parte delle imposte); tappa 429 (80.000 «con le famiglie
     al seguito», cifra discussa; Gibilterra; Ippona); tappa 439 (Cartagine);
   - tappa 406 (31 dicembre 406, o un anno prima; Vandali, Alani e Svevi), voce di Girolamo (lettera 123, dal 409: l'elenco dei popoli, Magonza presa e distrutta; l'elenco «serve anche
     a rendere più drammatica la descrizione»), storici (nessun testimone dice che fuggissero dagli Unni; Ammiano: gli Unni «il seme e l'origine»; Heather: gli Unni spingono Radagaiso
     e poi Vandali, Alani e Svevi; Halsall, Goffart e Kulikowski: la debolezza delle difese sul Reno, molte truppe richiamate in Italia; sulla carta il grigio scuro degli Unni,
     ancora lontani dal Reno nel 406); tappa 409 (Vandali, Alani e Svevi passano i Pirenei); tappa 378 (376: il Danubio con il permesso di Valente);
   - i destini: tappa 418 (Visigoti in Aquitania, «federati»), 507 (Clodoveo, Soissons «di solito datato al 486», Vouillé), 711 (gli eserciti del califfato sconfiggono i Visigoti), 534
     (Gelimero si arrende), il commento ai CAMBI in js/dati.js (la Gallaecia sveva ai Visigoti nel 585), leggenda del 451 (Burgundi: 435-436, Sapaudia nel 443, con Ezio nel 451; Attila
     muore nel 453), tappa 451 (Franchi con Ezio), protagonisti del 493 (Teodorico in Italia dal 489), tappa 552 (la fine del regno dei Goti in Italia), tappa 409 e storici (Angli e
     Sassoni: la Cronaca gallica al 441 circa, anno discusso; Beda al 449), tappa 568 (i Longobardi), tappa 780 (Carlo Magno conquista il regno longobardo nel 774), tappe 800 e 843.
   Schemi, detti nel disegno: le posizioni dei popoli (della carta della pagina), le rotte (la strada dei Vandali è quella della carta: le fonti danno le tappe, non il percorso), i nomi
   dell'elenco di Girolamo sparsi sulla Gallia (Girolamo non dice dove), la freccia delle truppe richiamate in Italia, l'inizio incerto dei regni. Lasciato fuori perché la pagina non lo
   dice: la fine del regno dei Burgundi (la riga sfuma con un punto di domanda), i numeri degli altri popoli, i luoghi precisi dei passaggi del Reno e del Danubio. */
var BARBARI={ titolo:"I barbari", sotto:"Chi erano, da dove venivano, dove finirono: il Reno del 406 al centro",
  fasi:[["Fuori","Nel 235, sulla carta di questa pagina, Goti, Vandali, Franchi, Alamanni, Sassoni e altri popoli vivono fuori dai confini, oltre il Reno e il Danubio. Le posizioni sono indicative."],
    ["376","Con il permesso dell'imperatore Valente, un gruppo di Goti passa il Danubio. Da est arrivano gli Unni: per Ammiano sono «il seme e l'origine» della rovina."],
    ["31 dicembre 406","La notte del 31 dicembre 406 Vandali, Alani e Svevi passano il Reno. Alcuni studiosi collocano il passaggio un anno prima."],
    ["406","Girolamo, da Betlemme, elenca i popoli che devastano le Gallie e racconta che Magonza è stata presa e distrutta. Il lungo elenco serve anche a rendere più drammatico il racconto."],
    ["Perché?","Nessun testimone dell'epoca dice che fuggissero dagli Unni, che nel 406 erano ancora lontani dal Reno. Peter Heather pensa però che sia stata l'avanzata degli Unni a spingerli."],
    ["Perché?","Guy Halsall, Walter Goffart e Michael Kulikowski danno più peso alla debolezza delle difese sul Reno: molte truppe di frontiera erano state richiamate in Italia."],
    ["409-455","Nel 409 Vandali, Alani e Svevi passano i Pirenei. Nel 429 i Vandali di Genserico attraversano lo stretto di Gibilterra; nel 439 prendono Cartagine, e nel 455 saccheggiano Roma."],
    ["I regni","Dove finiscono? Molti di questi popoli fondano regni dentro l'antico impero: alcuni durano pochi decenni, altri secoli."],
    ["I regni","I Vandali cedono a Belisario nel 534, i Goti d'Italia nel 552. I Visigoti sono sconfitti dagli eserciti del califfato nel 711; il regno longobardo passa a Carlo Magno nel 774."],
    ["Quanti?","Quanti Vandali attraversarono il mare nel 429? Vittore di Vita parla di 80.000 persone, con le famiglie al seguito. La cifra è discussa."],
    ["Quanti?","Procopio offre una spiegazione: Genserico aveva diviso il suo popolo in ottanta compagnie e aveva dato a ogni capo il titolo di comandante «di mille», per far sembrare l'esercito più grande."],
    ["Quanti?","Lo storico Peter Heather stima fra 15.000 e 20.000 combattenti, più le famiglie. Altri storici propongono cifre più basse."],
    ["I patti","Anche gli accordi con Roma cambiavano da un gruppo all'altro: c'erano i federati, legati da un trattato, i laeti, che si stabilivano nell'impero e dovevano servire nell'esercito, e chi entrava direttamente nell'esercito romano."],
    ["I patti","Che cosa ricevevano? In Africa i Vandali ottennero terre. Per i federati Walter Goffart ipotizza invece una parte delle imposte riscosse nelle province: le fonti si prestano a più letture."]],
  fonte:"Intermezzo «I barbari» e tappe del 376-378, 406, 409, 418, 429, 439, 451, 455, 493, 507, 534, 552, 568, 711, 780 e 843 di questa pagina, con la voce di Girolamo (lettera 123) e i riquadri degli storici. La carta è quella della pagina: le posizioni dei popoli e le loro rotte sono indicative, i punti dei passaggi del Reno e del Danubio non sono noti, e la strada dei Vandali unisce le tappe date dalle fonti. I nomi dell'elenco di Girolamo sono sparsi sulla Gallia senza un luogo: Girolamo non dice dove fossero. La freccia delle truppe richiamate in Italia è uno schema. Nelle righe dei regni gli anni d'inizio sono spesso incerti (per gli Angli e i Sassoni la data è discussa); della fine del regno dei Burgundi questa pagina non parla. Le cifre dei Vandali non si confrontano alla pari: Vittore di Vita conta persone, Heather combattenti." };
function disegnaBarbari(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G||!G.popoli||!G.citta) return;
  var oriz=W/H>=1.15, piccolo=oriz&&W<700, pad=oriz?16:10, defs=el('defs',null,svg), fasi=BARBARI.fasi, i;
  var T=[1300,6600,12000,17400,23400,28600,34000,41000,47000,53000,58000,63600,69000,75000], tFin=T[13]+7200;
  var CP={goti:'#8054C3',vandali:'#967E56',svevi:'#AD6B0A',burgundi:'#C16BBC',franchi:'#405D83',alamanni:'#7A6A55',sassoni:'#848FB4',longobardi:'#725302',ostrogoti:'#5E7F58',unni:'#67664E'};
  /* impaginazione: la carta e la colonna */
  var mb, cb;
  if(oriz){ var mw=Math.round(W*(piccolo?.66:.64))-pad; mb=[pad,pad,mw,H-2*pad]; cb=[pad+mw+(piccolo?12:26),pad+2,W-(pad+mw+(piccolo?12:26))-pad,H-2*pad-4]; }
  else { var mh=Math.round(Math.min(H*.6,(W-2*pad)/1.25)); mb=[pad,pad,W-2*pad,mh]; cb=[pad,pad+mh+12,W-2*pad,H-(pad+mh+12)-6]; }
  function vista(c,w,h){ var r=mb[2]/mb[3]; if(w/h<r) w=h*r; else h=w/r; return [c[0]-w/2,c[1]-h/2,w,h]; }
  var nC=0; function carta(V,stati){ var g=el('g',{'class':'ig-atto'},svg), F=finestra(g,defs,'ig-bb-c'+(++nC),V,mb,{stati:stati}); F.atto=g;
    Object.keys(stati||{}).forEach(function(r){ if(stati[r]==='regno:unni'&&G.regioni[r]){ var p=el('path',{d:G.regioni[r].d,'class':'ig-fin-reg ig-bb-unni'},null); F.carta.insertBefore(p,F.carta.querySelector('image')); F.reg[r]=p; } });
    return F; }
  function punto(F,p,nome,cl,dx,dy,an){ var q=F.M(p), g=el('g',{'class':'ig-bb-pop '+(cl||''),transform:'translate('+xy(q)+')'},F.sopra); g.style.setProperty('--c',CP[cl]||'#3B2F26');
    el('circle',{r:9,'class':'ig-bb-pop-a'},g); el('circle',{r:4.6,'class':'ig-bb-pop-p'},g); if(nome) tx(g,dx||0,dy==null?-10:dy,'ig-bb-pop-n',nome,an||'middle'); return g; }
  function data(F,a,b){ var g=el('g',{'class':'ig-bb-data'},F.sopra), t1=tx(g,mb[0]+14,mb[1]+(piccolo||!oriz?26:34),'ig-bb-data-1',a); t1.style.fontSize=(piccolo||!oriz?19:26)+'px'; if(b) tx(g,mb[0]+14,mb[1]+(piccolo||!oriz?44:56),'ig-bb-data-2',b); return g; }
  /* A. da dove vengono (235) e il Danubio (376) */
  var VA=vista([608,178],piccolo||!oriz?440:500,piccolo||!oriz?190:180), FA=carta(VA,statiDi(235)), PA=[];
  var P235=[['franchi','Franchi',piccolo||!oriz?0:-8,piccolo||!oriz?16:4,piccolo||!oriz?'start':'end'],['sassoni','Sassoni',8,4,'start'],['longobardi','Longobardi',8,4,'start'],['burgundi','Burgundi',8,4,'start'],['alamanni','Alamanni',piccolo||!oriz?6:-8,piccolo||!oriz?15:12,piccolo||!oriz?'start':'end'],['svevi','Svevi',8,-4,'start'],['vandali','Vandali',0,-12,'middle'],['goti','Goti',0,-12,'middle'],['ostrogoti','Ostrogoti',0,-12,'middle']];
  P235.forEach(function(q,j){ var t=G.popoli[q[0]].t[0]; var g=punto(FA,[t[1],t[2]],q[1],q[0]==='ostrogoti'?'goti':q[0],q[2],q[3],q[4]); g._t=T[0]+400+j*260; PA.push(g); });
  var uP=G.popoli.unni.t, unniA=punto(FA,[uP[2][1],uP[2][2]],'Unni','unni',0,-12,'middle'), rGoti=rotta(FA.sopra,defs,[[699.8,222.7],[700,250],[699.5,285.4]].map(FA.M),{c:CP.goti,nome:'376',dove:.5,dx:-8,an:'end'});
  var rUnni=rotta(FA.sopra,defs,[[uP[0][1],uP[0][2]],[uP[1][1],uP[1][2]],[uP[2][1],uP[2][2]]].map(FA.M),{c:CP.unni,schema:true});
  var dA=data(FA,'235','la carta di questa pagina'), dA2=data(FA,'376','il Danubio');
  var avvA=tx(FA.sopra,mb[0]+mb[2]-10,mb[1]+mb[3]-10,'ig-m-avverte su-carta','posizioni indicative','end');
  /* B. il Reno, 406: di notte */
  var VB=vista([432,184],piccolo||!oriz?120:150,piccolo||!oriz?78:84), FB=carta(VB,statiDi(406)), notte=el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),rx:12,'class':'ig-bb-notte'},FB.zoom);
  FB.zoom.appendChild(FB.sopra);
  var rV=rotta(FB.sopra,defs,[[516.9,200.6],[490,200],[468.8,198.5],[438.8,181.2],[418,176.5]].map(FB.M),{c:CP.vandali,nome:'Vandali e Alani',dove:.55,dy:18}), rS=rotta(FB.sopra,defs,[[470,168],[440,177],[414,184]].map(FB.M),{c:CP.svevi,nome:'Svevi',dove:.4,dy:-12});
  var mag=luogo(FB.sopra,FB.C('magonza'),'Magonza',-9,4,'end','grande'), reno=tx(FB.sopra,FB.M([421,160])[0],FB.M([421,160])[1],'ig-bb-fiume','Reno','middle');
  var fMag=segnoCarta(FB.sopra,'fuoco',FB.M([415.9,175.6]),1.2), dB=data(FB,'31 dicembre 406','o un anno prima, secondo alcuni studiosi');
  var avvB=tx(FB.sopra,mb[0]+mb[2]-10,mb[1]+mb[3]-10,'ig-m-avverte su-carta chiaro','il punto del passaggio: uno schema','end'); if(largo(avvB)>mb[2]*.6) avvB.textContent='passaggio: schema';
  /* C. l'elenco di Girolamo sulle Gallie */
  var VC=vista([366,252],220,200), FC=carta(VC,statiDi(406));
  var LISTA=['Quadi','Vandali','Sarmati','Alani','Gepidi','Eruli','Sassoni','Burgundi','Alamanni'], POS=[[336,178],[392,196],[312,214],[364,226],[404,246],[322,256],[372,268],[344,296],[396,288]], tag=[];
  LISTA.forEach(function(n,j){ var q=FC.M(POS[j]), g=el('g',{'class':'ig-bb-tag',transform:'translate('+xy(q)+')'},FC.sopra), t=tx(g,0,4,'ig-bb-tag-t',n,'middle'), w=largo(t)+14;
    el('rect',{x:r1(-w/2),y:-9,width:r1(w),height:18,rx:9,'class':'ig-bb-tag-r'},g).parentNode.insertBefore(g.lastChild,t); g._t=T[3]+1400+j*330; tag.push(g); });
  var magC=luogo(FC.sopra,FC.C('magonza'),'Magonza',8,-6,'start','grande'), fMagC=segnoCarta(FC.sopra,'fuoco',FC.M([415.9,175.6]),1);
  var qw=Math.min(mb[2]-28,oriz?330:mb[2]-28), qy=mb[1]+mb[3]-(piccolo||!oriz?58:66), cit=citazione(FC.sopra,mb[0]+14,qy,qw,'«Che cosa si salva, se Roma perisce?»','Girolamo, lettera 123, da Betlemme, 409',piccolo||!oriz?15:18);
  var citF=el('rect',{x:r1(mb[0]+6),y:r1(qy-8),width:r1(qw+14),height:r1(cit._h+16),rx:10,'class':'ig-bb-cita-fondo'},null); cit.insertBefore(citF,cit.firstChild);
  var avvC=tx(FC.sopra,mb[0]+mb[2]-10,mb[1]+18,'ig-m-avverte su-carta','i nomi sono sparsi: Girolamo non dice dove','end'); if(largo(avvC)>mb[2]-20) avvC.textContent='nomi sparsi: senza un luogo';
  /* D. perché: gli Unni ancora lontani; le truppe richiamate in Italia */
  var VD=vista([548,232],piccolo||!oriz?400:470,piccolo||!oriz?240:250), FD=carta(VD,statiDi(406)), uD=G.popoli.unni.t[3];
  var unniD=punto(FD,[uD[1],uD[2]],'Unni','unni',0,-12,'middle'), renoD=luogo(FD.sopra,FD.C('magonza'),'il Reno',-9,4,'end');
  var qU=FD.M([uD[1],uD[2]]), qR=FD.M([418,178]), dist=el('g',{'class':'ig-bb-dist'},FD.sopra); el('path',{d:'M'+xy(qR)+' L'+xy(qU),'class':'ig-bb-dist-l'},dist);
  var tDist=tx(dist,(qR[0]+qU[0])/2,(qR[1]+qU[1])/2-8,'ig-bb-dist-t','ancora lontani dal Reno','middle');
  var rT=rotta(FD.sopra,defs,[[420,184],[432,215],[444,252]].map(FD.M),{c:'#9A2F2A',schema:true,nome:'truppe in Italia (schema)',dove:.5,dx:10,an:'start'});
  var legD=el('g',{'class':'ig-bb-leg'},FD.sopra), ly=mb[1]+mb[3]-14; [['ig-bb-unni','dominio degli Unni'],['roma','Occidente romano']].forEach(function(v,j){ var x=mb[0]+14+j*(piccolo||!oriz?118:150); el('rect',{x:r1(x),y:r1(ly-9),width:12,height:10,rx:2,'class':'ig-bb-leg-r '+v[0]},legD); tx(legD,x+17,ly,'ig-bb-leg-t',v[1]); });
  var dD=data(FD,'406','perché passarono il Reno?');
  /* E. la strada dei Vandali */
  var VE=vista([318,330],piccolo||!oriz?380:380,345), FE=carta(VE,statiDi(439));
  var STRADA=[[415.9,175.6],[355.6,187],[333.2,170.3],[322.1,212.3],[292.1,288.1],[258.7,308.6],[252.9,312.2],[219.4,315.7],[191.7,304.5],[176.9,303.3],[168,356.1],[162.2,378.5],[169.3,411.2],[160.8,441.9],[157.6,443.8],[156.9,459.1],[180.4,485],[229.7,480.3],[265.1,472.4],[295.6,459.2],[349.9,467.5],[391.4,455.7],[412.5,465.1],[433.2,465.9]];
  var rE=rotta(FE.sopra,defs,STRADA.map(FE.M),{c:CP.vandali}), rE2=rotta(FE.sopra,defs,[[436,460],[452,420],[466,382],[472,356]].map(FE.M),{c:CP.vandali,schema:true,nome:'455, dal mare',dove:.5,dx:8,an:'start'});
  var TAPPE_E=[[[415.9,175.6],'406','Reno',8,-4,'start'],[[252.9,312.2],'409','Pirenei',8,12,'start'],[[160.8,441.9],'429','Gibilterra',8,-8,'start'],[[433.2,465.9],'439','Cartagine',0,18,'middle'],[[473.2,351.3],'455','Roma',8,-6,'start']], pE=[];
  TAPPE_E.forEach(function(q,j){ var g=el('g',{'class':'ig-bb-tappa',transform:'translate('+xy(FE.M(q[0]))+')'},FE.sopra); el('circle',{r:5,'class':'ig-bb-tappa-p'},g); var t=tx(g,q[3],q[4],'ig-bb-tappa-a',q[1],q[5]); tx(g,q[3],q[4]+13,'ig-bb-tappa-n',q[2],q[5]); pE.push(g); });
  var avvE=tx(FE.sopra,mb[0]+mb[2]-10,mb[1]+mb[3]-10,'ig-m-avverte su-carta','le tappe sono delle fonti, la strada è uno schema','end'); if(largo(avvE)>mb[2]-20) avvE.textContent='la strada: uno schema';
  var dE=data(FE,'409-455','la strada dei Vandali');
  /* F. i destini: una riga per popolo */
  var gR=el('g',{'class':'ig-atto'},svg), fb=[pad+(oriz?6:0),pad,W-2*pad-(oriz?12:0),H-2*pad], cl=oriz?(piccolo?102:150):96, A0=350, A1=860, x0=fb[0]+cl, x1=fb[0]+fb[2]-28, X=function(a){ return x0+(a-A0)/(A1-A0)*(x1-x0); };
  var RIGHE=[['Goti (Visigoti)','goti',[[376,418,'mov'],[418,711,'regno']],[[376,'Danubio'],[418,'Aquitania'],[507,'Vouillé']],[711,'711']],
    ['Unni','unni',[[376,453,'mov']],[[451,'Campi Catalaunici']],[453,'453']],
    ['Vandali e Alani','vandali',[[406,439,'mov'],[439,534,'regno']],[[406,'Reno'],[429,'Africa']],[534,'534']],
    ['Svevi','svevi',[[406,409,'mov'],[409,585,'regno']],[[409,'Pirenei']],[585,'585']],
    ['Burgundi','burgundi',[[435,443,'mov'],[443,540,'sfuma']],[[443,'Sapaudia']],null],
    ['Franchi','franchi',[[451,486,'alleati'],[486,860,'regno']],[[486,'Soissons'],[800,'Carlo imperatore']],[843,'843']],
    ['Angli e Sassoni','sassoni',[[441,449,'forse'],[449,860,'regno']],[[441,'data discussa']],null],
    ['Ostrogoti','ostrogoti',[[489,493,'mov'],[493,552,'regno']],[[493,'Teodorico']],[552,'552']],
    ['Longobardi','longobardi',[[568,774,'regno']],[[568,'Italia']],[774,'774']]];
  var top=fb[1]+(oriz?44:40), bot=fb[1]+fb[3]-40, rhR=(bot-top)/RIGHE.length, righeR=[];
  tx(gR,fb[0],fb[1]+14,'ig-m-testata','DOVE FINISCONO'); var sotR=tx(gR,fb[0],fb[1]+31,'ig-m-sotto','i regni nati dentro l\'antico impero, dal 350 all\'860'); if(largo(sotR)>fb[2]) sotR.textContent='i regni dentro l\'antico impero';
  [400,500,600,700,800].forEach(function(a){ el('line',{x1:r1(X(a)),x2:r1(X(a)),y1:r1(top-4),y2:r1(bot),'class':'ig-griglia'},gR); tx(gR,X(a),bot+15,'ig-asse',String(a),'middle'); });
  var ptR=el('pattern',{id:'ig-bb-trat',width:5,height:5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs); el('rect',{width:5,height:5,fill:'#F4EBD8'},ptR); el('rect',{width:2,height:5,fill:'#9C8A6C'},ptR);
  var sfu=el('linearGradient',{id:'ig-bb-sfuma'},defs); [[0,1],[1,0]].forEach(function(q){ el('stop',{offset:q[0],'stop-color':CP.burgundi,'stop-opacity':q[1]},sfu); });
  RIGHE.forEach(function(r,j){ var y=top+j*rhR, cy=y+rhR*.52, g=el('g',{'class':'ig-bb-riga'},gR), bh=Math.min(12,rhR*.36); g.style.setProperty('--c',CP[r[1]]);
    var tn=tx(g,fb[0],cy+4,'ig-bb-r-n',r[0]); if(largo(tn)>cl-8) tn.style.fontSize='11px'; if(largo(tn)>cl-8) tn.textContent=r[0].replace(' (Visigoti)','').replace(' e Alani','').replace('Angli e ','');
    var clip=el('clipPath',{id:'ig-bb-rc'+j},defs), cr=el('rect',{x:r1(x0),y:r1(y),width:0,height:r1(rhR)},clip), gb=el('g',{'clip-path':'url(#ig-bb-rc'+j+')'},g);
    r[2].forEach(function(s){ var a=X(s[0]), b=X(s[1]), w=Math.max(2,b-a); if(s[2]==='mov') el('path',{d:'M'+r1(a)+' '+r1(cy)+' H'+r1(b),'class':'ig-bb-r-mov'},gb); else if(s[2]==='alleati'||s[2]==='forse') el('rect',{x:r1(a),y:r1(cy-bh/2),width:r1(w),height:r1(bh),rx:2,'class':'ig-bb-r-alle'},gb);
      else el('rect',{x:r1(a),y:r1(cy-bh/2),width:r1(w),height:r1(bh),rx:2,'class':'ig-bb-r-regno',fill:s[2]==='sfuma'?'url(#ig-bb-sfuma)':null},gb); });
    if(r[4]){ var xe=X(r[4][0]); el('path',{d:'M'+r1(xe)+' '+r1(cy-bh/2-3)+' V'+r1(cy+bh/2+3),'class':'ig-bb-r-fine'},gb); tx(gb,xe+4,cy+4,'ig-bb-r-anno',r[4][1]); }
    else if(r[1]==='burgundi') tx(gb,X(545),cy+4,'ig-bb-r-anno','?');
    else el('path',{d:'M'+r1(x1-8)+' '+r1(cy-5)+' L'+r1(x1)+' '+r1(cy)+' L'+r1(x1-8)+' '+r1(cy+5),'class':'ig-bb-r-oltre'},gb);
    var note=el('g',{'class':'ig-bb-r-note'},g), finora=-1e9; if(rhR>=24) r[3].forEach(function(n){ var xn=X(n[0]), t=tx(note,xn,cy-bh/2-4,'ig-bb-r-nota',n[1],'middle'), w=largo(t), a=xn-w/2; if(xn+w/2>x1){ t.setAttribute('text-anchor','end'); a=xn-w; } if(a<finora+6){ t.remove(); return; } finora=a+w; el('circle',{cx:r1(xn),cy:r1(cy),r:2.6,'class':'ig-bb-r-pt'},note); });
    righeR.push({g:g,cr:cr,note:note,end:X(860)-x0}); });
  var legR=el('g',{'class':'ig-bb-leg ig-bb-leg-r'},gR), lx=x0, VOCI=[['mov','in cammino'],['alle','alleati o data incerta'],['regno','regno']];
  VOCI.forEach(function(v){ var g=el('g',null,legR); if(v[0]==='mov') el('path',{d:'M'+r1(lx)+' '+r1(fb[1]+27)+' h14','class':'ig-bb-r-mov'},g); else el('rect',{x:r1(lx),y:r1(fb[1]+22),width:14,height:9,rx:2,'class':v[0]==='alle'?'ig-bb-r-alle':'ig-bb-r-regno'},g).style.setProperty('--c','#7A6A55');
    var t=tx(g,lx+19,fb[1]+31,'ig-bb-leg-t',v[1]); lx+=largo(t)+28; });
  legR.setAttribute('transform','translate('+r1(fb[0]-x0)+','+r1(fb[3]-33)+')');
  /* G. quanti erano */
  var gQ=el('g',{'class':'ig-atto'},svg), qb=[pad+(oriz?10:2),pad,W-2*pad-(oriz?20:4),H-2*pad];
  tx(gQ,qb[0],qb[1]+14,'ig-m-testata','QUANTI VANDALI NEL 429?');
  var fN=oriz?(piccolo?46:64):44, nV=tx(gQ,qb[0],qb[1]+30+fN*.9,'ig-bb-num','0'); nV.style.fontSize=fN+'px'; var tV=el('text',{x:r1(qb[0]),y:r1(qb[1]+30+fN*.9+20),'class':'ig-bb-num-t'},gQ); avvolgi(tV,'persone, con le famiglie, secondo Vittore di Vita: la cifra è discussa',oriz?Math.min(qb[2]*.45,330):qb[2],15);
  /* le ottanta compagnie: una griglia di 80 quadratini «di mille» */
  var gx0=oriz?qb[0]+Math.min(qb[2]*.5,360):qb[0], gy0=oriz?qb[1]+34:qb[1]+30+fN*.9+58, gw=oriz?qb[2]-(gx0-qb[0]):qb[2], cols=oriz?(piccolo?10:16):16, sq=Math.min(oriz?28:26,(gw-(cols-1)*4)/cols), comp=[], gC2=el('g',null,gQ);
  for(i=0;i<80;i++){ var r=el('rect',{x:r1(gx0+(i%cols)*(sq+4)),y:r1(gy0+Math.floor(i/cols)*(sq+4)),width:r1(sq),height:r1(sq),rx:3,'class':'ig-bb-comp'},gC2); comp.push(r); }
  var yC=gy0+Math.ceil(80/cols)*(sq+4)+16, tC=el('text',{x:r1(gx0),y:r1(yC),'class':'ig-bb-num-t'},gQ), nCt=avvolgi(tC,'ottanta compagnie, ogni capo comandante «di mille»: la spiegazione di Procopio',gw,15);
  /* la scala: 80.000 persone e 15.000-20.000 combattenti */
  var sy=oriz?Math.max(yC+nCt*15+22,qb[1]+30+fN*.9+80):yC+nCt*15+18, sx0=qb[0], sx1=qb[0]+qb[2]-10, SX=function(v){ return sx0+v/80000*(sx1-sx0); }, gS=el('g',{'class':'ig-bb-scala'},gQ);
  if(oriz&&!piccolo) sy=Math.max(sy,qb[1]+qb[3]-58); if(sy+46>qb[1]+qb[3]){ sy=qb[1]+qb[3]-46; }
  el('rect',{x:r1(SX(0)),y:r1(sy),width:r1(SX(80000)-SX(0)),height:10,rx:3,'class':'ig-bb-s-vit'},gS); var tsv=tx(gS,SX(80000),sy-5,'ig-bb-s-t','80.000 persone (Vittore di Vita)','end');
  var bH=el('rect',{x:r1(SX(15000)),y:r1(sy+16),width:r1(SX(20000)-SX(15000)),height:10,rx:3,'class':'ig-bb-s-hea'},gS); el('path',{d:'M'+r1(SX(0))+' '+r1(sy+21)+' H'+r1(SX(15000)),'class':'ig-bb-s-fam'},gS);
  var tsh=tx(gS,SX(20000)+8,sy+25,'ig-bb-s-t','15.000-20.000 combattenti, più le famiglie (Heather)'); if(SX(20000)+8+largo(tsh)>sx1){ tsh.textContent='15.000-20.000 combattenti (Heather)'; }
  var tsa=tx(gS,SX(0),sy+44,'ig-bb-s-n','altri storici: cifre più basse');
  /* H. i patti */
  var gP=el('g',{'class':'ig-atto'},svg), pb=[pad+(oriz?10:2),pad,W-2*pad-(oriz?20:4),H-2*pad], tre=oriz&&!piccolo;
  tx(gP,pb[0],pb[1]+14,'ig-m-testata','CHE PATTI AVEVANO CON ROMA?');
  var PATTI=[['federati','alleati legati a Roma da un trattato'],['laeti','potevano stabilirsi nell\'impero e dovevano servire nell\'esercito'],['nell\'esercito','altri entravano direttamente nell\'esercito romano']];
  var RIC=[['terre','In Africa i Vandali ottennero terre.'],['imposte','Per i federati, secondo l\'ipotesi di Walter Goffart, una parte delle imposte delle province.']];
  var cards=[], ch=tre?(pb[3]-40)/2-10:(pb[3]-40)/5-6;
  function card(x,y,w,hh,k,t,cl){ var g=el('g',{'class':'ig-bb-card '+(cl||'')},gP); el('rect',{x:r1(x),y:r1(y),width:r1(w),height:r1(hh),rx:10,'class':'ig-bb-card-r'},g); var tk=tx(g,x+12,y+(hh<60?18:24),'ig-bb-card-k',k.toUpperCase());
    var big=hh>=110&&w>=200, tt=el('text',{x:r1(x+12),y:r1(y+(hh<60?36:big?56:48)),'class':'ig-bb-card-t'},g); if(hh<60) tt.style.fontSize='12.5px'; else if(big) tt.style.fontSize='20px'; var n=avvolgi(tt,t,w-24,hh<60?14:big?25:17); cards.push(g); return g; }
  var y1=pb[1]+30;
  if(tre){ var cw3=(pb[2]-2*12)/3; PATTI.forEach(function(p,j){ card(pb[0]+j*(cw3+12),y1,cw3,ch,p[0],p[1]); }); var cw2=(pb[2]-12)/2; RIC.forEach(function(p,j){ card(pb[0]+j*(cw2+12),y1+ch+14,cw2,ch,'ricevevano '+p[0],p[1],'ric'); }); }
  else { var VOCI=PATTI.map(function(p){ return [p[0],p[1],'']; }).concat(RIC.map(function(p){ return ['ricevevano '+p[0],p[1],'ric']; })), fondoP=pb[1]+pb[3]-24;
    function cardV(y,k,t,cl,fs){ var g=el('g',{'class':'ig-bb-card '+cl},gP), r=el('rect',{x:r1(pb[0]),y:r1(y),width:r1(pb[2]),rx:10,'class':'ig-bb-card-r'},g), lh=Math.round(fs*1.2);
      tx(g,pb[0]+12,y+17,'ig-bb-card-k',k.toUpperCase()); var tt=el('text',{x:r1(pb[0]+12),y:r1(y+19+lh),'class':'ig-bb-card-t'},g); tt.style.fontSize=fs+'px';
      var hh=19+lh*avvolgi(tt,t,pb[2]-24,lh)+9; r.setAttribute('height',r1(hh)); cards.push(g); return hh; }
    [16,14.5,13].some(function(fs,f,L){ cards.forEach(function(c){ c.remove(); }); cards.length=0; var y=y1; VOCI.forEach(function(v){ y+=cardV(y,v[0],v[1],v[2],fs)+6; }); return y-6<=fondoP||f===L.length-1; }); }
  var tP=tx(gP,pb[0],pb[1]+pb[3]-2,'ig-m-avverte','Le fonti dell\'epoca sono brevi e si prestano a più letture.'); if(largo(tP)>pb[2]) tP.textContent='Le fonti si prestano a più letture.';
  /* la colonna accanto alle carte */
  var gK=el('g',{'class':'ig-p-col-d'},svg), fsA=oriz?Math.min(piccolo?26:44,cb[2]/5.2):Math.min(24,W/13), tA=tx(gK,cb[0],cb[1]+fsA*.82,'ig-p-anno',''), tSt=el('text',{x:r1(cb[0]),y:r1(cb[1]+fsA*1.08+(oriz?14:12)),'class':'ig-p-stato'},gK);
  var STATI=['DA DOVE VENGONO','IL DANUBIO','IL RENO','L\'ELENCO DI GIROLAMO','GLI UNNI?','LE DIFESE SGUARNITE','LA STRADA DEI VANDALI','I REGNI','I REGNI','QUANTI?','QUANTI?','QUANTI?','I PATTI','I PATTI'];
  var gKq=el('g',null,gK), yK=cb[1]+fsA*1.08+(piccolo?48:oriz?34:30), KR={0:[['oltre','il Reno e il Danubio'],['le posizioni','indicative']],1:[['chi','i Goti, col permesso di Valente'],['da est','gli Unni']],2:[['chi','Vandali, Alani e Svevi'],['quando','31 dicembre 406, o un anno prima']],
    3:[['Magonza','presa e distrutta'],['Girolamo','scrive da Betlemme, lontano']],4:[['Heather','gli Unni li spinsero'],['i testimoni','non lo dicono']],5:[['Halsall, Goffart, Kulikowski','difese deboli sul Reno'],['le truppe','richiamate in Italia']],6:[['409','i Pirenei'],['429','Gibilterra'],['439','Cartagine'],['455','Roma']]};
  function scriviK(ii){ gKq.textContent=''; var c=KR[ii]; if(!c) return; var rh=oriz?(piccolo?36:40):28, hq=cb[1]+cb[3]-yK, rr=c.slice(0,Math.max(0,Math.floor(hq/rh))), uno=oriz&&cb[2]<240;
    rr.forEach(function(r,j){ var y=yK+j*rh; el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},gKq); var kk=tx(gKq,cb[0],y+(oriz?14:rh*.64),'ig-p-sch-k',r[0].toUpperCase()); if(largo(kk)>cb[2]) kk.style.fontSize='9px';
      var v=tx(gKq,oriz?cb[0]:cb[0]+cb[2],y+(oriz?(piccolo?30:32):rh*.66),'ig-p-sch-v',r[1],oriz?'start':'end'); v.style.fontSize=(oriz&&!piccolo?16:14)+'px'; if(largo(v)>cb[2]) v.style.fontSize='12.5px'; }); }
  var visto=-1;
  S.passo=function(t){
    var i=-1; T.forEach(function(x,j){ if(t>=x) i=j; }); var ii=Math.max(0,i);
    /* A */
    cls(FA.atto,'vis',t>=T[0]-400&&t<T[2]-200); PA.forEach(function(g){ cls(g,'vis',t>=g._t); cls(g,'spento',i===1&&!g.classList.contains('goti')); });
    cls(dA,'vis',t>=T[0]&&i<1); cls(dA2,'vis',i===1); cls(avvA,'vis',t>=T[0]+800);
    segui(rGoti,E.io(fase(t,T[1]+400,T[1]+2600))); segui(rUnni,E.io(fase(t,T[1]+1800,T[1]+4200))); cls(unniA,'vis',t>=T[1]+3600);
    /* B */
    cls(FB.atto,'vis',t>=T[2]-300&&t<T[3]-200); segui(rV,E.io(fase(t,T[2]+800,T[2]+3600))); segui(rS,E.io(fase(t,T[2]+1400,T[2]+3800)));
    cls(mag,'vis',t>=T[2]+400); cls(fMag,'vis',t>=T[2]+3800); cls(dB,'vis',t>=T[2]+200); cls(avvB,'vis',t>=T[2]+1600); cls(notte,'vis',true);
    /* C */
    cls(FC.atto,'vis',t>=T[3]-300&&t<T[4]-200); tag.forEach(function(g){ cls(g,'vis',t>=g._t); }); cls(magC,'vis',true); cls(fMagC,'vis',true); cls(cit,'vis',t>=T[3]+600); cls(avvC,'vis',t>=T[3]+4400);
    /* D */
    cls(FD.atto,'vis',t>=T[4]-300&&t<T[6]-200); cls(unniD,'vis',t>=T[4]+400); cls(renoD,'vis',true); cls(dist,'vis',t>=T[4]+1400); cls(legD,'vis',t>=T[4]+600); cls(dD,'vis',true);
    Object.keys(FD.reg).forEach(function(r){ if(/ig-bb-unni/.test(FD.reg[r].getAttribute('class'))) cls(FD.reg[r],'acceso',i===4); });
    segui(rT,E.io(fase(t,T[5]+600,T[5]+3000)));
    /* E */
    cls(FE.atto,'vis',t>=T[6]-300&&t<T[7]-200); segui(rE,E.io(fase(t,T[6]+500,T[6]+5200))); segui(rE2,E.io(fase(t,T[6]+5200,T[6]+6400)));
    var stE=[T[6]+400,T[6]+1700,T[6]+3600,T[6]+5000,T[6]+6300]; pE.forEach(function(g,j){ cls(g,'vis',t>=stE[j]); }); cls(avvE,'vis',t>=T[6]+2000); cls(dE,'vis',true);
    /* F */
    cls(gR,'vis',t>=T[7]-300&&t<T[9]-200); righeR.forEach(function(r,j){ var f=E.io(fase(t,T[7]+400+j*260,T[7]+3400+j*260)); fissa(r.cr,'width',r1(r.end*f+30)); cls(r.note,'vis',f>=1); cls(r.g,'vis',t>=T[7]+300+j*260);
      cls(r.g,'evid',i===8&&[0,2,7,8].indexOf(j)>=0); });
    /* G */
    cls(gQ,'vis',t>=T[9]-300&&t<T[12]-200); var fv=E.out(fase(t,T[9]+400,T[9]+2400)); scrivi(nV,num(Math.round(80000*fv/1000)*1000));
    comp.forEach(function(r,j){ cls(r,'vis',t>=T[10]+300+j*30); cls(r,'capo',t>=T[10]+300+j*30&&t<T[11]); }); cls(tC,'vis',t>=T[10]+600);
    cls(gS,'vis',t>=T[11]+300); cls(bH,'vis',t>=T[11]+900);
    /* H */
    cls(gP,'vis',t>=T[12]-300); cards.forEach(function(c,j){ cls(c,'vis',j<3?t>=T[12]+500+j*700:t>=T[13]+400+(j-3)*900); }); cls(tP,'vis',t>=T[13]+2600);
    /* la colonna: solo accanto alle carte */
    cls(gK,'vis',t>=T[0]-300&&i<7);
    if(i!==visto){ visto=i; scrivi(tA,i<0?'':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>14){ fa-=2; tA.style.fontSize=fa+'px'; } tSt.textContent=''; if(i>=0) avvolgi(tSt,STATI[ii],cb[2],16); scriviK(ii); }
  };
  S.dura=tFin;
  S.battute=fasi.map(function(f,j){ return {t:T[j],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   Poitiers (732 o 733)
   Aggiunta il 24 novembre 2026, nella tappa del 711, accanto a «Le navi». Quattro quadri: la spedizione sulla carta della pagina; il campo, dai sette giorni all'alba delle
   tende vuote; ciò che non sappiamo; le due letture. Fonti lette il 24 novembre 2026:
   - Cronaca del 754, edizione Mommsen, Chronica minora II (MGH, Auctores antiquissimi XI), pp. 361-362, testo di archive.org «chronicaminorasa11momm», e la traduzione
     inglese pubblicata su aymennjawad.org/23270. Munnuza «ex Maurorum gente» fa pace con i Franchi e si ribella agli Arabi di Spagna; Eudo gli aveva dato la figlia «causa federis …
     ob persecutionem Arabum differendam»; Abd al-Rahman lo assedia «in Cerritanensem [oppidum]» (in margine «Cerritanie»); Munnuza si getta «ab alto pinnaculo»; la testa e la figlia
     di Eudo sono portate al re, che la manda «maria transvectans» al califfo. Poi «montana Vacceorum dissecans»; Eudo, «ultra fluvio nomine Garonna vel Dornoniam», fugge: «solus deus
     numerum morientium vel pereuntium recognoscat»; «Turniensem eclesiam … depredare desiderat»; «consulem Francie interioris Austrie nomine Carrulum, virum ab ineunte etate belligerum
     et rei militaris expertum ab Eudone premonitum»; «dum pene per septem dies utrique de pugne conflictu excruciant, sese postremo in aciem parant»; «gentes septentrionales in ictu oculi
     ut paries immobiles permanentes sicut et zona rigoris glacialiter manent adstricti. Arabes gladio enecant»; «gens Austrie mole membrorum prevalida et ferrea manu per ardua
     pectorabiliter ferientes regem inventum exanimant»; «statim nocte prelio dirimente … videntes castra Arabum innumerabilia ad pugnam sese reservant»; all'alba «prospiciunt Europenses
     Arabum temtoria ordinata … nescientes cuncta esse pervacua»; gli esploratori trovano che «omnes tacite pernoctando cuneo stricto diffugiunt repatriando»; i Franchi temono agguati
     «per semitas», non inseguono e «spolias tantum et manubias decenter divisas in suas se leti recipiunt patrias». La cronaca non dà l'anno della battaglia, il luogo né numeri.
   - Continuazione di Fredegario, Recueil des historiens des Gaules II (nuova edizione 1869), pp. 454-455, capitolo CVIII (nell'edizione di Krusch è il capitolo 13: non verificato
     sull'edizione), testo di archive.org: «Eudone Duce a jure foederis recedente», Carlo passa la Loira e lo mette in fuga; Eudo «cernens se superatum atque derisum, gentem perfidam
     Sarracenorum ad auxilium contra Carlum Principem et gentem Francorum excitavit»; «cum Rege suo, Abdirama nomine, Garonnam transeunt, Burdegalensem urbem pervenerunt, ecclesiis igne
     concrematis … usque Pictavis progressi sunt, ubi basilica sancti Hilarii igne concremata … ad domum beatissimi Martini evertendam destinant. Contra quos Carlus Princeps audacter aciem
     instruit … Christo auxiliante, tentoria eorum subvertit … interfectoque Rege eorum, Abdirama nomine». Nota (k) del Recueil: già il Pagi riteneva inventato l'invito di Eudo, scritto
     «in gratiam Caroli» dall'anonimo che aggiunse questa parte «jussu Childebrandi Comitis».
   - Cronaca di Moissac (arriva all'818), stesso volume: «per Pampelonam et montes Pireneos», l'assedio di Bordeaux, Eudo battuto «super Garonna fluvio», la battaglia «in suburbio
     Pictavensi», «Rex Abderaman cecidit». Il numero dell'anno, nella scansione, non si legge con sicurezza.
   - Un rifacimento più tardo delle storie dei re dei Franchi, dal manoscritto edito da Labbe (stesso volume, p. 574): «non longe a Pictavis» e «extunc omnes coeperunt eum cognominare
     Martellum; quia sicut martellus cunctum ferrum subigit, sic ipse, Domino adjuvante, cuncta praelia frangebat».
   - Edward Gibbon, Decline and Fall, capitolo 52 (edizione Bury, volume VI, archive.org «historyofdecl06gibb»): «Perhaps the interpretation of the Koran would now be taught in the
     schools of Oxford»; «From such calamities was Christendom delivered by the genius and fortune of one man»; i 375.000 morti contro 1.500 Franchi sono «this incredible tale», che
     secondo la sua nota riferiscono Paolo Diacono e il Liber Pontificalis (questi due testi non sono stati letti).
   Dalla pagina: gli stati della carta nel 732 (passo del 732 in PASSI_CARTA[711], js/dati.js) e la Settimania araba fino al 759 (revisione dei confini in testa a js/dati.js).
   Schemi, detti nel disegno e nelle avvertenze: le linee della marcia, il luogo e l'orientamento del campo, le distanze, le figure e i loro colori (quelli della carta), le tende, le
   frecce delle ondate. Fredegario dice che Carlo «rovesciò le tende»; la Cronaca del 754 le fa trovare in piedi e vuote all'alba: il campo segue la Cronaca. Narbona e la Cerdagna non
   sono fra i luoghi della carta: sono proiettate qui con la stessa proiezione (cono conforme di src/mappa/genera.mjs) e andrebbero aggiunte a CITTA. */
var POITIERS={ titolo:"Poitiers", sotto:"732 o 733: i Franchi di Carlo fermano Abd al-Rahman fra Tours e Poitiers, secondo la Cronaca del 754 e la fonte franca",
  fasi:[["Verso il 731","Eudo, duca d'Aquitania, ha dato la figlia in sposa a Munnuza, un capo berbero in rivolta, per tenere lontani gli Arabi. Abd al-Rahman, il governatore arabo della Spagna, lo assedia in Cerdagna. Munnuza si getta da una rupe; la figlia di Eudo è mandata al califfo, oltre il mare."],
    ["732 o 733","Abd al-Rahman passa i monti dei Vasconi, cioè i Pirenei, ed entra nelle terre dei Franchi. Una cronaca più tarda dice che passò per Pamplona."],
    ["732 o 733","Oltre la Garonna e la Dordogna sconfigge Eudo, che fugge. «Solo Dio conosce il numero dei morti», scrive la Cronaca del 754. Secondo la fonte franca, a Bordeaux bruciano le chiese."],
    ["732 o 733","Secondo la fonte franca, gli Arabi arrivano fino a Poitiers e bruciano la basilica di Sant'Ilario. La meta è Tours: vogliono saccheggiarne la chiesa, la casa di san Martino."],
    ["732 o 733","Gli si para davanti Carlo, capo dei Franchi dell'Austrasia, «guerriero fin da giovane». Secondo la Cronaca del 754 lo aveva avvertito Eudo. La fonte franca, scritta dalla parte di Carlo, dice il contrario: Eudo avrebbe chiamato gli Arabi contro di lui."],
    ["Sette giorni","Per quasi sette giorni i due eserciti si logorano a vicenda, senza schierarsi. Dove fossero di preciso, le fonti non lo dicono."],
    ["Il muro","Poi si schierano e combattono duramente. I popoli del nord, scrive la Cronaca, restano fermi «come un muro», stretti «come il ghiaccio». Gli Arabi cadono sotto le loro spade."],
    ["Il re","Gli uomini dell'Austrasia, «forti di membra e con la mano di ferro», trovano il re e lo uccidono. La fonte franca lo chiama Abdirama e dà la vittoria all'aiuto di Cristo."],
    ["La notte","La notte divide i combattenti. I Franchi vedono l'accampamento immenso e si tengono pronti per il giorno dopo. Ma nella notte gli Arabi se ne vanno, in silenzio, in file strette."],
    ["L'alba","All'alba le tende sono in fila, come prima. I Franchi pensano che dentro ci siano gli Arabi, pronti a combattere. Gli esploratori le trovano vuote. Temendo un'imboscata, i Franchi non inseguono: si dividono il bottino e tornano a casa."],
    ["Quel che non sappiamo","Le fonti più vicine non danno l'anno: 732 o 733. La Cronaca del 754 non nomina Poitiers. Nessuna fonte del tempo dà numeri: i 375.000 morti di cui si scrisse più tardi non sono credibili."],
    ["Due letture","Per Edward Gibbon, a fine Settecento, Carlo salvò la cristianità: senza di lui, forse a Oxford si insegnerebbe il Corano. Altri storici vedono una grande razzia respinta: gli Arabi si ritirano in ordine e tengono Narbona fino al 759."]],
  fonte:"Cronaca del 754, nel latino dell'edizione Mommsen (Chronica minora II, pp. 361-362) e in una traduzione inglese: l'autore è un cristiano della Spagna araba e scrive poco più di vent'anni dopo. Continuazione di Fredegario, nel Recueil des historiens des Gaules II, pp. 454-455: fu scritta per il conte Childebrando, dalla parte di Carlo. Cronaca di Moissac e un rifacimento più tardo delle storie dei re dei Franchi, nello stesso volume. Gibbon, capitolo 52, nell'edizione Bury. Le fonti più vicine non danno l'anno, il luogo esatto né i numeri. Le linee sulla carta sono uno schema; Narbona e la Cerdagna sono messe a mano. Il campo di battaglia è un disegno schematico: luogo, orientamento, distanze, figure e colori non sono nelle fonti. Fredegario dice che Carlo rovesciò le tende; la Cronaca del 754 le fa trovare in piedi, vuote: il disegno segue la Cronaca. La lettura della «razzia respinta» non viene da un'opera letta per questa infografica." };
function disegnaPoitiers(svg,S,W,H){
  var G=window.RM_MAPPA; if(!G||!G.citta) return;
  var oriz=W/H>=1.15, stretto=oriz&&W<700, pad=oriz?20:12, defs=el('defs',null,svg), i, k;
  var T={a1:1400,a2:7400,a3:12800,a4:18400,a5:24200,b1:30800,b2:39200,b3:46400,b4:53600,b5:60400,c1:70600,d1:79000}; T.fin=T.d1+10600;
  var CO={arabi:'#2F8A75',franchi:'#405D83',eudo:'#6C8FB8'};
  if(!COLORE_STATO.califfato) COLORE_STATO.califfato='#48A48C'; if(!COLORE_STATO['regno:asturie']) COLORE_STATO['regno:asturie']='#BF7A1E';      /* i colori della carta della pagina (css/stile.css, js/mappa.js) */
  var st={}, s7=statiDi(711); for(k in s7) st[k]=s7[k];
  [['hispania','califfato'],['spania','califfato'],['gallaecia','califfato'],['settimania','califfato'],['asturie','regno:asturie']].forEach(function(q){ st[q[0]]=q[1]; });      /* come il passo del 732 della carta */

  /* ---------- A. dai Pirenei a Tours ---------- */
  var gA=el('g',{'class':'ig-atto'},svg), V=[232,172,172,170], mb;
  if(oriz){ var mh=H-2*pad, mw=mh*V[2]/V[3]; if(mw>W*(stretto?.6:.56)){ mw=W*(stretto?.6:.56); mh=mw*V[3]/V[2]; } mb=[W-pad-mw,(H-mh)/2,mw,mh]; }
  else { var mw2=W-2*pad, mh2=Math.min(mw2*V[3]/V[2],H*.64); mw2=mh2*V[2]/V[3]; mb=[(W-mw2)/2,pad,mw2,mh2]; }
  var F=finestra(gA,defs,'ig-po-clipA',V,mb,{stati:st}), sA=F.sopra, MP=F.M, Cq=F.C, kk=F.k;
  var PA=Cq('pamplona'), BO=Cq('bordeaux'), PO=Cq('poitiers'), TU=Cq('tours'), ME=Cq('metz'), OR=Cq('orleans'), TO=Cq('tolosa'); if(!PA||!BO||!PO||!TU||!ME||!OR||!TO) return;
  var NA=MP([326,314.6]), CE=MP([308.2,328.5]);      /* Narbona (3,00 E; 43,18 N) e la Cerdagna (1,98 E; 42,43 N), proiettate come la carta */
  var tPir=tx(sA,MP([281,331])[0],MP([281,331])[1],'ig-ad-zona-t ig-f',kk>=2.1?'monti dei Vasconi':'Pirenei','middle');
  var sCE=segnoCarta(sA,'assedio',CE,.8);
  var rMun=rotta(sA,defs,[CE,MP([321,328]),MP([338,337])],{c:CO.arabi,schema:true,nome:kk>=2.1?'al califfo, oltre il mare':'al califfo',dove:.98,dx:-4,dy:-11,an:'end'});
  var rAb=rotta(sA,defs,[MP([244,339]),PA,MP([259,304]),MP([268,287]),BO],{c:CO.arabi,nome:'Abd al-Rahman',dove:.6,dx:9,dy:4,an:'start'}); if(rAb.et) nelRiquadro(rAb.et,mb,8);      // il nome a destra della linea: a sinistra usciva dalla carta (24 novembre 2026)
  var GA=MP([290,264]), zGa=el('g',{'class':'ig-f'},sA); el('ellipse',{cx:r1(GA[0]),cy:r1(GA[1]),rx:r1(8*kk),ry:r1(5*kk),'class':'ig-ad-zona'},zGa);
  tx(zGa,GA[0]+8*kk+5,GA[1]+5,'ig-ad-zona-t',kk>=2.1?'oltre la Garonna e la Dordogna':'Garonna e Dordogna','start');
  var sGa=segnoCarta(sA,'scontro',GA,.8), sBO=segnoCarta(sA,'fuoco',BO,.7);
  var rEu=rotta(sA,defs,[MP([292,260]),MP([304,247]),MP([317,233])],{c:CO.eudo,schema:true,nome:'Eudo fugge',dove:.85,dx:8,an:'start'});
  var rPo=rotta(sA,defs,[MP([279,268]),MP([285,254]),MP([293.6,241])],{c:CO.arabi});
  var sPO=segnoCarta(sA,'fuoco',PO,.72);
  var rTu=rotta(sA,defs,[MP([297.6,233]),MP([301.6,225.2])],{c:CO.arabi,schema:true,nome:'verso Tours',dove:.4,dx:-10,an:'end'});
  var rCa=rotta(sA,defs,[ME,MP([356,199]),OR,MP([306,225])],{c:CO.franchi,schema:true,nome:'Carlo',dove:.22,dy:-10});
  var BT=MP([299.5,229]), zBa=el('g',{'class':'ig-f'},sA); el('ellipse',{cx:r1(BT[0]),cy:r1(BT[1]),rx:r1(5.5*kk),ry:r1(11*kk),transform:'rotate(28 '+xy(BT)+')','class':'ig-ca-zona'},zBa);
  var tZ1=tx(zBa,BT[0]+6*kk+4,BT[1]+5*kk+4,'ig-ca-zona-n','fra Tours e Poitiers','start'), tZ2=tx(zBa,BT[0]+6*kk+4,BT[1]+5*kk+20,'ig-ad-zona-t','il punto esatto non è noto','start');
  var sBT=segnoCarta(sA,'scontro',BT,.8);
  var pPA=luogo(sA,PA,'Pamplona',0,17,'middle'), pBO=luogo(sA,BO,'Bordeaux',-9,4,'end'), pPO=luogo(sA,PO,'Poitiers',-9,12,'end'), pTU=luogo(sA,TU,'Tours',-9,-5,'end','grande'),
    pME=luogo(sA,ME,'Metz',-8,-7,'end','tenue'), pOR=luogo(sA,OR,'Orléans',4,-8,'start','tenue'), pTO=luogo(sA,TO,'Tolosa',8,4,'start','tenue'), pNA=luogo(sA,NA,'Narbona',8,4,'start','tenue'), pCE=luogo(sA,CE,'Cerdagna',-8,15,'end','tenue');
  var avvA=el('text',{x:r1(mb[0]+10),y:r1(mb[1]+18),'class':'ig-m-avverte su-carta'},gA); avvA.textContent='le linee sono uno schema: le strade non sono scritte'; if(largo(avvA)>mb[2]-20||kk<2) avvA.textContent='le linee sono uno schema';
  [tZ1,tZ2].forEach(function(t){ nelRiquadro(t,mb,8); });
  /* il registro accanto: i luoghi e chi li nomina; al quinto quadro, i due racconti */
  var lb=oriz?[pad+4,pad,mb[0]-pad-30,H-2*pad]:[pad,mb[1]+mb[3]+14,W-2*pad,H-(mb[1]+mb[3]+14)-4];
  var REG=[{n:'Cerdagna',s:'Munnuza assediato; la figlia di Eudo mandata al califfo',f:'Cronaca del 754',t:T.a1+700,ic:'assedio'},
    {n:'I monti dei Vasconi',s:'cioè i Pirenei: «per Pamplona», dice una cronaca più tarda',f:'Cronaca del 754; Cronaca di Moissac',t:T.a2+500,ic:'marcia'},
    {n:'Garonna e Dordogna',s:'Eudo sconfitto: «solo Dio conosce il numero dei morti»',f:'Cronaca del 754',t:T.a3+400,ic:'scontro'},
    {n:'Poitiers',s:'bruciata la basilica di Sant\'Ilario',f:'Continuazione di Fredegario',t:T.a4+1500,ic:'fuoco'},
    {n:'Tours',s:'la meta: la chiesa di san Martino',f:'Cronaca del 754; Fredegario',t:T.a4+3000,ic:'meta'},
    {n:'Due racconti',s:'Cronaca del 754: Eudo, sconfitto, avverte Carlo. Fonte franca: Eudo chiama gli Arabi contro Carlo.',f:'Cronaca del 754; Continuazione di Fredegario',t:T.a5+2400,ic:'meta'}];
  function icona(g,tipo,q){ var a;
    if(tipo==='marcia'){ a=el('g',{'class':'ig-sg vis',transform:'translate('+xy(q)+')'},g); el('path',{d:'M-9 5 Q-2 -6 7 -3','class':'ig-po-ico-l'},a); el('path',{d:'M10 -2 L2.5 -7 L4 -2 L2 3 Z','class':'ig-po-ico-p'},a); return a; }
    if(tipo==='meta'){ a=el('g',{'class':'ig-sg vis',transform:'translate('+xy(q)+')'},g); el('circle',{r:8.5,'class':'ig-po-ico-meta'},a); el('circle',{r:3.4,'class':'ig-po-ico-p'},a); return a; }
    a=segnoCarta(g,tipo,q,.85); a.setAttribute('class','ig-sg vis '+tipo); return a; }
  var gR=el('g',null,gA), righe=[], modo=lb[2]>=300&&lb[3]>=340?'righe':'scheda', sch=null, gDue=null;
  if(modo==='righe'){
    var y0=lb[1]+Math.max(0,(lb[3]-336)/2);
    var gTesta=el('g',{'class':'ig-po-testa'},gR); tx(gTesta,lb[0],y0+12,'ig-m-testata','DAI PIRENEI A TOURS'); tx(gTesta,lb[0],y0+31,'ig-m-sotto','i luoghi, e chi li nomina');
    REG.slice(0,5).forEach(function(r,ii){ var y=y0+50+ii*57, g=el('g',{'class':'ig-ad-riga'},el('g',{transform:'translate(0,'+r1(y)+')'},gR));
      icona(g,r.ic,[lb[0]+13,24]); tx(g,lb[0]+36,15,'ig-ad-rn',r.n); var s=el('text',{x:r1(lb[0]+36),y:33,'class':'ig-ad-rs'},g), ns=avvolgi(s,r.s,lb[2]-38,16);
      tx(g,lb[0]+36,33+ns*16+1,'ig-m-cita-chi',r.f); el('line',{x1:r1(lb[0]),x2:r1(lb[0]+lb[2]),y1:55,y2:55,'class':'ig-m-filo'},g); righe.push(g); });
    /* i due racconti, al posto delle righe */
    gDue=el('g',{'class':'ig-po-due'},gR); tx(gDue,lb[0],y0+12,'ig-m-testata','DUE RACCONTI'); tx(gDue,lb[0],y0+31,'ig-m-sotto','chi avvertì chi?');
    var yy=y0+58;
    [['Cronaca del 754',"un cristiano della Spagna araba, poco più di vent'anni dopo",'Eudo, sconfitto, avverte Carlo.','cronaca'],
     ['Continuazione di Fredegario','scritta per il conte Childebrando, dalla parte di Carlo','Eudo, battuto da Carlo, chiama gli Arabi contro di lui. Il Recueil ricorda che già il Pagi lo riteneva inventato.','franca']].forEach(function(q){
      var g=el('g',{'class':'ig-po-racc '+q[3]},gDue), bar=el('rect',{x:r1(lb[0]),y:r1(yy-14),width:4,height:10,rx:2,'class':'ig-po-racc-b'},g);
      tx(g,lb[0]+16,yy,'ig-ad-rn',q[0]); var c=el('text',{x:r1(lb[0]+16),y:r1(yy+18),'class':'ig-m-cita-chi'},g), nc=avvolgi(c,q[1],lb[2]-18,14);
      var tt=el('text',{x:r1(lb[0]+16),y:r1(yy+18+nc*14+8),'class':'ig-ad-rs'},g), nt=avvolgi(tt,q[2],lb[2]-18,18);
      var hh=18+nc*14+8+(nt-1)*18+10; bar.setAttribute('height',r1(hh+8)); yy+=hh+30; });
  } else {
    sch={g:el('g',{'class':'ig-ad-scheda'},gR)}; var sx=lb[0], sy=lb[1]+(oriz?8:2);
    sch.n=tx(sch.g,sx,sy+18,'ig-ad-rn',''); sch.s=el('text',{x:r1(sx),y:r1(sy+40),'class':'ig-ad-rs'},sch.g); sch.f=tx(sch.g,sx,sy+40,'ig-m-cita-chi','');
  }

  /* ---------- B. il campo (schema): di lato, i Franchi a sinistra, l'accampamento arabo a destra fino all'orizzonte ---------- */
  var gB=el('g',{'class':'ig-atto'},svg), X0=pad, Y0=pad, TW=W-2*pad, TH=H-2*pad, yb=Y0+TH, oz=Y0+TH*(oriz?.42:.4), hc=oz-Y0+2;
  var cpB=el('clipPath',{id:'ig-po-clipB'},defs); el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(TH),rx:14},cpB);
  var sc=el('g',{'clip-path':'url(#ig-po-clipB)'},gB);
  grad(defs,'ig-po-cg',[[0,'#A9BFCB'],[.75,'#E2E0D3'],[1,'#EFE7D2']]); grad(defs,'ig-po-cn',[[0,'#05080F'],[.65,'#111A30'],[1,'#252A3E']]);
  grad(defs,'ig-po-ca',[[0,'#3E4C70'],[.45,'#B98378'],[.8,'#EDB97E'],[1,'#F6DCA8']]); grad(defs,'ig-po-su',[[0,'#C6BB96'],[1,'#887A58']]);
  grad(defs,'ig-po-freddo',[[0,'#DDF2FF',.75],[.6,'#BFE0F2',.28],[1,'#BFE0F2',0]],{cx:'50%',cy:'50%',r:'50%'});
  el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(hc),fill:'url(#ig-po-cg)'},sc);
  var cA=el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(hc),fill:'url(#ig-po-ca)',opacity:0},sc), cN=el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(hc),fill:'url(#ig-po-cn)',opacity:0},sc);
  function profilo(seme,hm,cl){ var R=caso(seme), n=13, P=[], q; for(q=0;q<=n;q++) P.push([X0-10+q/n*(TW+20), oz-hm*(.25+.75*R())]);
    var d='M'+r1(X0-10)+' '+r1(oz+2)+' L'+xy(P[0]); for(q=1;q<P.length;q++){ var m=[(P[q-1][0]+P[q][0])/2,(P[q-1][1]+P[q][1])/2]; d+=' Q'+xy(P[q-1])+' '+xy(m); }
    return el('path',{d:d+' L'+xy(P[n])+' L'+r1(X0+TW+10)+' '+r1(oz+2)+' Z','class':cl},sc); }
  profilo(732,TH*.1,'ig-po-colle-l'); profilo(733,TH*.055,'ig-po-colle-v');
  el('rect',{x:r1(X0),y:r1(oz),width:r1(TW),height:r1(yb-oz),fill:'url(#ig-po-su)'},sc);
  for(i=1;i<10;i++){ var ys=oz+(yb-oz)*Math.pow(i/10,1.7); el('line',{x1:r1(X0),x2:r1(X0+TW),y1:r1(ys),y2:r1(ys),'class':'ig-po-solco'},sc); }
  var base=Math.min(TH*.2,TW*.1);
  function Q(u,d){ return [X0+u*TW, oz+(yb-oz)*d]; }
  function alto(d){ return base*(.32+.85*d); }
  var DR=[.34,.44,.54,.64,.74,.84,.94], uF=oriz?.38:.4;
  function uFronte(d){ return uF+(d-.64)*.06; }
  /* sul telefono in piedi il campo si guarda di fronte: il muro dei Franchi attraversa tutta la larghezza, gli Arabi scendono dall'accampamento verso chi guarda
     (24 novembre 2026, l'utente: di lato il muro sembrava una torre). u resta la distanza dall'accampamento, d diventa la corsia da sinistra a destra */
  var FR=!oriz;
  function profF(u){ return clamp(.08+(1-u)/(1-uF)*.74,.04,.99); }
  function QF(u,d){ return FR?[X0+TW*(.07+(d-.34)/.6*.86), oz+(yb-oz)*profF(u)]:Q(u,d); }
  function scalaF(u,d){ return FR?alto(profF(u))/alto(d):1; }
  /* il gelo dietro il muro (si accende col secondo quadro del campo) */
  var hM=alto(.94), cxM=FR?X0+TW/2:X0+uFronte(.64)*TW-hM*.45, cyM=FR?oz+(yb-oz)*.86-alto(.86)*.5:Q(0,.64)[1]-hM*.45;
  var alone=el('ellipse',{cx:r1(cxM),cy:r1(cyM),rx:r1(FR?TW*.62:hM*1.6),ry:r1(FR?alto(.9)*1.3:(yb-oz)*.7),fill:'url(#ig-po-freddo)','class':'ig-po-alone'},sc);
  /* l'accampamento: file di tende fino all'orizzonte («castra Arabum innumerabilia») */
  var gT=el('g',null,sc), tende=[], DT=[.012,.035,.065,.105,.155,.215], uT=oriz?.56:.6;
  function tenda(p,x,y,hT){ var g=el('g',{'class':'ig-po-tenda',transform:'translate('+r1(x)+','+r1(y)+')'},p), w=hT*.62;
    el('path',{d:'M'+r1(-w)+' 0 L'+r1(-w*.7)+' '+r1(-hT*.55)+' Q0 '+r1(-hT*1.04)+' '+r1(w*.7)+' '+r1(-hT*.55)+' L'+r1(w)+' 0 Z','class':'ig-po-telo'},g);
    el('path',{d:'M0 '+r1(-hT*.98)+' V'+r1(-hT*1.22),'class':'ig-po-palo'},g); el('path',{d:'M'+r1(-w*.24)+' 0 L0 '+r1(-hT*.52)+' L'+r1(w*.24)+' 0 Z','class':'ig-po-porta'},g); return g; }
  DT.forEach(function(d,ri){ var hT=alto(d)*.62, gap=hT*1.3, u=uT+d*.3+(ri%2?gap*.5/TW:0); for(;u<1.03;u+=gap/TW){ var q=Q(u,d); tende.push(tenda(gT,q[0],q[1],hT)); } });
  /* la fila che se ne va di notte, fra le tende */
  var fila=[], NF=30, A1=Q(oriz?.7:.73,.19), A2=Q(1.06,.03), hFila=Math.max(5,alto(.1)*.5);
  /* le fasce di profondità: in ognuna i Franchi del muro e gli altri, dal fondo verso chi guarda */
  var strati=DR.map(function(){ return el('g',null,sc); }), muro=[];
  if(!FR) DR.forEach(function(d,b){ var hh=alto(d); for(var rk=3;rk>=0;rk--){ var x=X0+uFronte(d)*TW-rk*hh*.3, y=Q(0,d)[1], g=el('g',{transform:'translate('+r1(x)+','+r1(y)+')'},strati[b]);
    guerriero(g,hh,{cl:'franco',mantello:true,scudo:true,lancia:true}); muro.push({x:x,y:y,h:hh}); } });
  function figura(b,h,o){ var g0=el('g',{'class':'ig-po-a'},strati[b]), gi=el('g',null,g0); guerriero(gi,h,o); return {g:g0,gi:gi}; }
  var Ra=caso(711), att=[];
  for(i=0;i<21;i++){ var b=1+Math.floor(Ra()*6), d=DR[b], f0=figura(b,alto(d)*.96,{verso:-1,cl:'arabo',mantello:true,scudo:Ra()<.4,braccio:'avanti'});
    att.push({g:f0.g,gi:f0.gi,d:d,w:i%3,uC:uFronte(d)+.024+Ra()*.025,uS:(oriz?.6:.64)+Ra()*.07,ph:Ra(),cade:Ra()<.3}); }
  att.forEach(function(a,ii){ a.tc=T.b2+400+a.w*800+2400*(1+ii%2)+1250; });
  var scar=[[4,-1,.6,.49],[2,-1,.64,.52],[5,1,0,.06],[3,1,0,.05]].map(function(q,ii){ var d=DR[q[0]], f0=figura(q[0],alto(d)*.96,{verso:q[1],cl:q[1]<0?'arabo':'franco',mantello:true,scudo:q[1]>0,lancia:q[1]>0,braccio:q[1]<0?'avanti':null});
    var u0=q[1]<0?q[2]:uFronte(d)+.012; return {g:f0.g,d:d,u0:u0,u1:q[1]<0?q[3]:u0+q[3],ph:ii*.31}; });
  var dK=DR[3], uK=oriz?.55:.59, qK=QF(uK,dK), sK=scalaF(uK,dK), hK=alto(dK)*1.02*sK, re=figura(3,alto(dK)*1.02,{verso:-1,cl:'arabo re',mantello:true,elmo:false,braccio:'avanti'}); fissa(re.g,'transform','translate('+xy(qK)+')'+(sK!==1?' scale('+r1(sK*100)/100+')':''));
  var cuneo=[]; for(i=0;i<5;i++){ var b2=3+(i%2), d2=DR[b2], f2=figura(b2,alto(d2),{cl:'franco',mantello:true,scudo:true,braccio:'avanti'}); cuneo.push({g:f2.g,d:d2,u0:uFronte(d2)+.006,u1:(oriz?.5:.54)-i*.011,k:i}); }
  var espl=[]; for(i=0;i<3;i++){ var d3=DR[1+i], f3=figura(1+i,alto(d3)*.9,{cl:'franco',mantello:true,lancia:true}); espl.push({g:f3.g,d:d3,u0:uFronte(d3)+.012,u1:(oriz?.58:.62)+i*.02}); }
  var bott=[]; for(i=0;i<4;i++){ var b4=2+i%3, d4=DR[b4], h4=alto(d4)*.92, f4=figura(b4,h4,{verso:-1,cl:'franco',mantello:true}); el('ellipse',{cx:r1(-h4*.04),cy:r1(-h4*1.02),rx:r1(h4*.2),ry:r1(h4*.12),'class':'ig-po-fagotto'},f4.gi);
    bott.push({g:f4.g,d:d4,u0:(oriz?.6:.64)+i*.012,u1:uFronte(d4)-.07-i*.015,k:i}); }
  /* di fronte (telefono in piedi): tre file serrate di fanti con lo scudo, da un bordo all'altro, davanti agli Arabi che arrivano; i portatori del bottino sopra */
  if(FR){ var gMuro=el('g',null,sc); [0,1,2].forEach(function(rk){ var u=uF-rk*.05, y=oz+(yb-oz)*profF(u), hh=alto(profF(u))*.95, sp=hh*.42, n=Math.ceil((TW+hh)/sp)+1;
      for(var c=0;c<n;c++){ var x=X0-hh*.25+c*sp+(rk%2?sp*.5:0), g=el('g',{transform:'translate('+r1(x)+','+r1(y)+')'},gMuro); guerriero(g,hh,{cl:'franco',mantello:true,scudo:true,lancia:true}); muro.push({x:x,y:y,h:hh}); } });
    var gBott=el('g',null,sc); bott.forEach(function(b){ gBott.appendChild(b.g); }); }
  /* il gelo sul muro: scintille («sicut et zona rigoris glacialiter») */
  var gGelo=el('g',{'class':'ig-po-gelo'},sc), Rg=caso(5); for(i=0;i<24;i++){ var m=muro[Math.floor(Rg()*muro.length)], sx=m.x+(Rg()-.4)*m.h*.4, sy=m.y-m.h*(.2+Rg()*.75), sz=1.6+Rg()*2.6;
    var sp=el('path',{d:'M'+r1(sx)+' '+r1(sy-sz*2)+' L'+r1(sx+sz*.4)+' '+r1(sy-sz*.4)+' L'+r1(sx+sz*2)+' '+r1(sy)+' L'+r1(sx+sz*.4)+' '+r1(sy+sz*.4)+' L'+r1(sx)+' '+r1(sy+sz*2)+' L'+r1(sx-sz*.4)+' '+r1(sy+sz*.4)+' L'+r1(sx-sz*2)+' '+r1(sy)+' L'+r1(sx-sz*.4)+' '+r1(sy-sz*.4)+' Z','class':'ig-po-scint'},gGelo); sp.style.animationDelay=(-Rg()*2.4).toFixed(2)+'s'; }
  /* la polvere dove le ondate urtano il muro */
  var polveri=[.44,.64,.84].map(function(d,ii){ var q=QF(uFronte(d)+.03,d); return el('ellipse',{cx:r1(q[0]),cy:r1(q[1]-alto(d)*.3),rx:r1(alto(d)*.9),ry:r1(alto(d)*.42),'class':'ig-po-polvere',opacity:0},sc); });
  var buio=el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(TH),'class':'ig-po-buio',opacity:0},sc);
  var gFila=el('g',null,sc); for(i=0;i<NF;i++) fila.push(omino(gFila,hFila,'ig-po-fug'));      /* sopra il buio, perché si vedano */
  var gSt=el('g',{opacity:0},sc), Rs=caso(732); for(i=0;i<46;i++) el('circle',{cx:r1(X0+Rs()*TW),cy:r1(Y0+Rs()*(oz-Y0-TH*.08)),r:r1(.5+Rs()*1.1),'class':'ig-m-stella'},gSt);
  /* le scritte del campo */
  var tFr=tx(sc,FR?X0+10:X0+uFronte(.34)*TW-alto(.34)*.5,FR?oz+(yb-oz)*profF(uF)-alto(profF(uF))*.95-8:Q(0,.34)[1]-alto(.34)*1.22-8,'ig-ad-et ig-ad-tag ig-po-et-fr','i Franchi di Carlo',FR?'start':'middle');
  var tAc=tx(sc,Q(oriz?.79:.81,0)[0],oz-alto(.012)*.9-10,'ig-ad-et ig-ad-tag ig-po-et-ar',"l'accampamento degli Arabi",'middle');
  var tMu=tx(sc,FR?X0+TW*.4:X0+uFronte(.94)*TW-hM*.55,yb-12,'ig-ad-et ig-ad-tag','«come un muro»','middle');
  var tRe=tx(sc,qK[0],qK[1]-hK*1.05-8,'ig-ad-et ig-ad-tag','il re','middle');
  var croce=el('g',{'class':'ig-ca-croce'},sc), rcr=Math.max(7,base*.11); el('circle',{r:r1(rcr),'class':'ig-po-croce-f'},croce); el('circle',{r:r1(rcr*.34),'class':'ig-po-ucciso'},croce);      // il segno della morte senza croce: Abd al-Rahman è musulmano (24 novembre 2026)
  var pCr=[qK[0]+hK*.5,qK[1]-hK*.32-rcr]; fissa(croce,'transform','translate('+xy(pCr)+')'); tx(croce,0,-rcr-6,'ig-ca-capo-t ig-po-verde','Abd al-Rahman, ucciso','middle');
  var tFu=tx(sc,lerp(A1[0],A2[0],.45),oriz?Math.min(A1[1],A2[1])-hFila-12:Math.max(A1[1],A2[1])+16,'ig-ad-tag notte','in silenzio, nella notte','middle');
  var tIm=tx(sc,oriz?Q(.7,.5)[0]:X0+TW-8,FR?oz+(yb-oz)*.28:Q(0,.5)[1]-alto(.5)*1.3-6,'ig-ad-et ig-ad-tag',oriz?"temono un'imboscata: non inseguono":"temono un agguato",oriz?'middle':'end');      // sopra gli esploratori; sul telefono contro il bordo destro, lontano dal muro dei Franchi
  var tBo=tx(sc,FR?X0+TW*.4:Q(.47,.97)[0],yb-12,'ig-ad-et ig-ad-tag','il bottino, diviso','middle');
  var cerchi=espl.slice(0,2).map(function(e){ var q=QF(e.u1,e.d), ha=alto(e.d)*scalaF(e.u1,e.d); return el('ellipse',{cx:r1(q[0]),cy:r1(q[1]-ha*.1),rx:r1(ha*.95),ry:r1(ha*.3),'class':'ig-po-cerca'},sc); });
  [tFr,tAc,tMu,tRe,tFu,tIm,tBo].forEach(function(t){ nelRiquadro(t,[X0,Y0,TW,TH],8); });
  /* i giorni */
  var gG=el('g',{'class':'ig-f'},sc), gx0=oriz?X0+TW-16:X0+16, gy0=oriz?Y0+30:oz-30, dots=[];
  el('rect',{x:r1(oriz?gx0-112:gx0-8),y:r1(gy0-18),width:120,height:44,rx:9,'class':'ig-po-chip'},gG);
  var tG=tx(gG,oriz?gx0:gx0,gy0,'ig-m-testata','GIORNO 1',oriz?'end':'start');
  for(i=0;i<7;i++) dots.push(el('circle',{cx:r1(oriz?gx0-96+i*15:gx0+5+i*15),cy:r1(gy0+13),r:4.6,'class':'ig-po-dot'},gG));
  /* le parole delle fonti, in alto a sinistra, su un cartiglio */
  var qx=X0+12, qy=Y0+12, qw=oriz?Math.min(TW*(stretto?.6:.46),430):TW-24, fq=oriz?(stretto?14:Math.min(18.5,Math.max(15,qw/23))):14, QS=[];
  [["«per quasi sette giorni si logorano a vicenda; alla fine si schierano»","Cronaca del 754 · pene per septem dies",T.b1+500],
   ["«i popoli del nord restano immobili come un muro, stretti come il ghiaccio»","Cronaca del 754 · ut paries immobiles… glacialiter",T.b2+1500],
   ["«la gente dell'Austrasia, forte di membra e con la mano di ferro, trova il re e lo uccide»","Cronaca del 754 · regem inventum exanimant",T.b3+700],
   ["«con l'aiuto di Cristo… ucciso il loro re, di nome Abdirama»","Continuazione di Fredegario · Christo auxiliante",T.b3+3800],
   ["«la notte divide i combattenti»","Cronaca del 754 · nocte prelio dirimente",T.b4+300],
   ["«nella notte se ne vanno tutti in silenzio, in file strette, verso casa»","Cronaca del 754 · tacite pernoctando cuneo stricto",T.b4+2800],
   ["«vedono le tende degli Arabi in fila… non sanno che sono tutte vuote»","Cronaca del 754 · nescientes cuncta esse pervacua",T.b5+1200],
   ["«si dividono il bottino e tornano, contenti, nelle loro terre»","Cronaca del 754 · in suas se leti recipiunt patrias",T.b5+5600]].forEach(function(q){
    var g=citazione(sc,qx+10,qy+9,qw-20,q[0],q[1],fq), r=el('rect',{x:r1(qx),y:r1(qy),width:r1(qw),height:r1(g._h+16),rx:10,'class':'ig-po-cart'}); g.insertBefore(r,g.firstChild); QS.push({g:g,t:q[2]}); });
  var gS=el('g',null,sc), tSch=tx(gS,X0+TW-14,yb-12,'ig-m-schema','schema: luogo, distanze, figure e colori non sono nelle fonti','end'); if(largo(tSch)>TW*.6) tSch.textContent='schema';
  var wS=largo(tSch); el('rect',{x:r1(X0+TW-14-wS-8),y:r1(yb-26),width:r1(wS+16),height:20,rx:6,'class':'ig-po-chip'},gS).parentNode.insertBefore(gS.lastChild,gS.firstChild);
  el('rect',{x:r1(X0),y:r1(Y0),width:r1(TW),height:r1(TH),rx:14,'class':'ig-m-cornice'},gB);

  /* ---------- C. quel che non sappiamo ---------- */
  var gC=el('g',{'class':'ig-atto'},svg), rC=[pad,pad,W-2*pad,H-2*pad], aff=rC[2]>=rC[3]*1.25, gp=oriz?14:10;
  var cw=aff?(rC[2]-2*gp)/3:rC[2], chh=aff?rC[3]:(rC[3]-2*gp)/3, schede=[];
  function scheda(ii,kick,big,righeT,cl){ var x=aff?rC[0]+ii*(cw+gp):rC[0], y=aff?rC[1]:rC[1]+ii*(chh+gp), g=el('g',{'class':'ig-po-card '+(cl||'')},gC), px=x+(aff?18:14), w=cw-(aff?36:28);
    el('rect',{x:r1(x),y:r1(y),width:r1(cw),height:r1(chh),rx:14,'class':'ig-po-card-r'},g);
    var yk=y+(aff?30:22); tx(g,px,yk,'ig-m-testata',kick);
    var fb=aff?clamp(cw/7,20,40):clamp(chh/5.2,20,28), tb=tx(g,px,yk+fb*1.15+(aff?6:2),'ig-po-big',big); tb.style.fontSize=fb+'px'; while(largo(tb)>w&&fb>14){ fb-=1; tb.style.fontSize=fb+'px'; }
    var y1=yk+fb*1.15+(aff?6:2), corpo=el('g',null,g), fs=aff?16:13.5, hMax=y+chh-(aff?18:10);
    function prova(){ corpo.textContent=''; var yy=y1+fs*1.25+(aff?12:6);
      righeT.forEach(function(q){ var cl2=q[1]||'ig-po-corpo', f2=cl2==='ig-po-corpo'?fs:Math.max(11,fs-2.5), t=el('text',{x:r1(px),y:r1(yy),'class':cl2},corpo); t.style.fontSize=f2+'px'; var n=avvolgi(t,q[0],w,f2*1.25); yy+=n*f2*1.25+(aff?6:3); });
      return yy-fs*1.25; }
    var fine=prova(); while(fine>hMax&&fs>11){ fs-=.5; fine=prova(); }
    var o={g:g,x:x,y:y,px:px,w:w,tb:tb,y1:y1,fb:fb}; schede.push(o); return o; }
  var K1=scheda(0,"L'ANNO",'732 o 733',[["Le fonti più vicine non lo dicono. La Cronaca del 754 racconta la battaglia fra i fatti del governo di Abd al-Rahman; la fonte franca non dà date."]]);
  var K2=scheda(1,'IL LUOGO','fra Tours e Poitiers',[['Il punto esatto non è noto.'],['· Cronaca del 754: non nomina Poitiers','ig-po-fonte'],['· Fredegario: gli Arabi arrivano «fino a Poitiers»','ig-po-fonte'],['· Cronaca di Moissac, del IX secolo: «nei sobborghi di Poitiers»','ig-po-fonte']]);
  var K3=scheda(2,'I NUMERI','375.000',[["Le fonti del tempo non danno numeri. Più tardi, in Italia, si scrisse di 375.000 Arabi uccisi contro 1.500 Franchi. Già Gibbon la chiamava «una storia incredibile»."]],'numeri');
  scrivi(K3.tb,'0');
  var tachi=el('line',{x1:r1(K3.px-4),x2:r1(K3.px-4),y1:r1(K3.y1-K3.fb*.35),y2:r1(K3.y1-K3.fb*.35),'class':'ig-po-barra'},K3.g);
  var bolloP=el('g',null,K3.g), bollo=el('g',{'class':'ig-ca-bollo'},bolloP), bt=tx(bollo,0,17,'ig-ca-bollo-t','NON CREDIBILE'), bw=largo(bt)+20; bt.setAttribute('x',10);
  el('rect',{x:0,y:0,width:r1(bw),height:26,rx:4,'class':'ig-ca-bollo-r'},bollo).parentNode.insertBefore(bollo.lastChild,bollo.firstChild);

  /* ---------- D. due letture ---------- */
  var gD=el('g',{'class':'ig-atto'},svg), rD=[pad,pad,W-2*pad,H-2*pad], affD=rD[2]>=rD[3]*1.2, gp2=oriz?16:10;
  var fh=affD?(rD[2]>=760?78:96):(rD[2]>=330?92:104), cwD=affD?(rD[2]-gp2)/2:rD[2], chD=affD?rD[3]-fh-gp2:(rD[3]-fh-2*gp2)/2;
  function cartaD(ii,cl){ var x=affD?rD[0]+ii*(cwD+gp2):rD[0], y=affD?rD[1]:rD[1]+ii*(chD+gp2), g=el('g',{'class':'ig-po-card '+cl},gD);
    el('rect',{x:r1(x),y:r1(y),width:r1(cwD),height:r1(chD),rx:14,'class':'ig-po-card-r'},g); return {g:g,x:x,y:y,px:x+(affD?22:14),w:cwD-(affD?44:28),h:chD}; }
  function scrittaIn(c,yy,s,cl,f,lh){ var t=el('text',{x:r1(c.px),y:r1(yy),'class':cl},c.g); t.style.fontSize=f+'px'; var n=avvolgi(t,s,c.w,f*(lh||1.22)); return {t:t,n:n,h:n*f*(lh||1.22)}; }
  function riempi(c,parti){ var f=affD?(c.w>=380?22:19):17, ok=false;
    while(!ok&&f>=12){ [].slice.call(c.g.querySelectorAll('.ig-po-dd')).forEach(function(e){ e.remove(); }); var yy=c.y+(affD?32:22), g=el('g',{'class':'ig-po-dd'},c.g);
      var cc={g:g,px:c.px,w:c.w}; tx(g,c.px,yy,'ig-m-testata',parti.k); yy+=(affD?16:10);
      parti.v.forEach(function(p,j){ var ff=p[2]?f*p[2]:f, r=scrittaIn(cc,yy+ff,p[0],p[1],ff); yy+=ff+r.h-ff*1.22+(j<parti.v.length-1?(affD?12:7):0); });
      ok=yy<=c.y+c.h-12; if(!ok) f-=1; } }
  var L1=cartaD(0,'scura'), L2=cartaD(1,'chiara');
  riempi(L1,{k:'PER GIBBON, UNA SVOLTA',v:[['«Forse oggi nelle scuole di Oxford si insegnerebbe a interpretare il Corano.»','ig-po-gq'],["Edward Gibbon, Storia della decadenza e caduta dell'Impero romano, capitolo 52, fine Settecento",'ig-po-gchi',.6],['«Da tali sciagure la cristianità fu liberata dal genio e dalla fortuna di un solo uomo.»','ig-po-gq2',.78]]});
  riempi(L2,{k:'PER ALTRI, UNA RAZZIA RESPINTA',v:[['Gli Arabi si ritirano in ordine, racconta la Cronaca del 754. La Settimania, con Narbona, resta loro fino al 759.','ig-po-lt'],['Più che una conquista fermata, una grande spedizione respinta.','ig-po-lt forte'],['altri storici; le date della Settimania sono quelle della carta della pagina','ig-po-gchi chiaro',.62]]});
  var yF=affD?rD[1]+rD[3]-fh:rD[1]+2*(chD+gp2), gF=el('g',{'class':'ig-po-card piede'},gD);
  el('rect',{x:r1(rD[0]),y:r1(yF),width:r1(rD[2]),height:r1(fh),rx:14,'class':'ig-po-card-r'},gF);
  var LF={g:gF,px:rD[0]+(affD?22:14),w:rD[2]-(affD?44:28)}; tx(gF,LF.px,yF+(affD?26:22),'ig-m-testata','IL SOPRANNOME');
  var fF=affD?16.5:13.5, rF; do{ [].slice.call(gF.querySelectorAll('.ig-po-sopr')).forEach(function(e){ e.remove(); }); rF=scrittaIn(LF,yF+(affD?26:22)+fF*1.35,'«Martello»: «come il martello doma ogni ferro, così lui, con l\'aiuto del Signore, spezzava ogni battaglia». Lo spiega un racconto franco più tardo.','ig-po-sopr',fF); fF-=.5; } while(yF+(affD?26:22)+fF*1.35+rF.h-fF>yF+fh-8&&fF>11);

  /* ---------- la regia ---------- */
  function notteF(t){ var n=0, c=(t-(T.b1+600))/1000; if(c>0&&c<6) n=Math.pow(Math.sin(Math.PI*c),2)*.9;
    if(t>=T.b4) n=E.io(fase(t,T.b4+200,T.b4+2200)); if(t>=T.b5) n=1-E.io(fase(t,T.b5,T.b5+2800)); return n; }
  function attU(a,t){ var t0=T.b2+400+a.w*800, P=2400, L=(t-t0)/P; if(L<0) return a.uS; var c=Math.floor(L), f=L-c, uB=lerp(a.uC,a.uS,.45), da=c===0?a.uS:uB;
    if(f<.5) return lerp(da,a.uC,E.io(f/.5)); if(f<.68) return a.uC+Math.sin((f-.5)*38+a.ph*6)*.004; return lerp(a.uC,uB,E.io((f-.68)/.32)); }
  function posa(g,u,d,rot){ var q=QF(u,d), k=scalaF(u,d); fissa(g,'transform','translate('+xy(q)+')'+(k!==1?' scale('+r1(k*100)/100+')':'')+(rot?' rotate('+r1(rot)+')':'')); }
  S.passo=function(t){
    /* A */
    cls(gA,'vis',t>=300&&t<T.b1-300);
    [pPA,pBO,pPO,pTU,pME,pOR,pTO,pNA,pCE].forEach(function(p){ cls(p,'vis',t>=400); }); cls(avvA,'vis',t>=T.a1+800);
    cls(sCE,'vis',t>=T.a1+700&&t<T.a3); segui(rMun,t<T.a3?E.io(fase(t,T.a1+2400,T.a1+4400)):0);
    cls(tPir,'vis',t>=T.a2+300); segui(rAb,E.io(fase(t,T.a2+200,T.a2+3000)));
    cls(zGa,'vis',t>=T.a3+300&&t<T.a5); cls(sGa,'vis',t>=T.a3+400); segui(rEu,t<T.a5?E.io(fase(t,T.a3+1800,T.a3+3600)):0); cls(sBO,'vis',t>=T.a3+2800);
    segui(rPo,E.io(fase(t,T.a4+200,T.a4+1700))); cls(sPO,'vis',t>=T.a4+1500); segui(rTu,E.io(fase(t,T.a4+2300,T.a4+3600))); cls(pTU,'ora',t>=T.a4+2900&&t<T.a5);
    segui(rCa,E.io(fase(t,T.a5+200,T.a5+3000))); cls(zBa,'vis',t>=T.a5+2600); cls(sBT,'vis',t>=T.a5+3200);
    var ri=-1; REG.forEach(function(r,ii){ if(t>=r.t) ri=ii; });
    if(modo==='righe'){ var due=t>=T.a5+1800; righe.forEach(function(r,ii){ cls(r,'vis',ii<=ri&&!due); cls(r,'ora',ii===ri); }); cls(gTesta,'via',due); cls(gDue,'vis',due); }
    else if(sch){ cls(sch.g,'vis',ri>=0); if(sch.ri!==ri&&ri>=0){ sch.ri=ri; var r=REG[ri]; scrivi(sch.n,r.n); sch.s.textContent=''; var ns=avvolgi(sch.s,r.s,lb[2],16); sch.f.setAttribute('y',r1(+sch.s.getAttribute('y')+ns*16+2)); scrivi(sch.f,r.f); } }
    /* B */
    cls(gB,'vis',t>=T.b1-400&&t<T.c1-300);
    var n=notteF(t), al=t<T.b5?0:fase(t,T.b5,T.b5+1400)*(1-E.io(fase(t,T.b5+3800,T.b5+6600)));
    fissa(cN,'opacity',r1(n*100)/100); fissa(cA,'opacity',r1(al*100)/100); fissa(buio,'opacity',r1(n*.58*100)/100); fissa(gSt,'opacity',r1(n*100)/100);
    var c0=(t-(T.b1+600))/1000, gi=t<T.b2?clamp(Math.round(c0)+1,1,7):7; scrivi(tG,'GIORNO '+gi); dots.forEach(function(dt,ii){ cls(dt,'on',ii<gi); }); cls(gG,'vis',t>=T.b1+300&&t<T.b2+600);
    var gel=t>=T.b2+2200&&t<T.b4; cls(sc,'ig-po-gelato',gel); cls(alone,'vis',gel); cls(gGelo,'vis',gel);
    att.forEach(function(a){ var u, rot=0, vis=t>=T.b2+100&&t<T.b4+600;
      if(a.cade&&t>=a.tc){ u=attU(a,a.tc); rot=80*E.out(fase(t,a.tc,a.tc+500)); vis=vis&&t<T.b4+400; }
      else if(t>=T.b3+4200){ u=lerp(attU(a,T.b3+4200),a.uS+.06,E.io(fase(t,T.b3+4200,T.b3+6200))); vis=vis&&t<T.b3+6400; }
      else u=attU(a,t);
      posa(a.g,u,a.d); fissa(a.gi,'transform',rot?'rotate('+r1(rot)+')':''); cls(a.g,'vis',vis); });
    scar.forEach(function(s){ var f=.5-.5*Math.cos(Math.PI*2*((t-T.b1)/1700+s.ph)); posa(s.g,lerp(s.u0,s.u1,f),s.d); cls(s.g,'vis',t>=T.b1+500&&t<T.b2+300); });
    var pv=t>=T.b2+1300&&t<T.b3+4400?.5+.3*Math.sin(t/260):t>=T.b1+900&&t<T.b2?.18+.14*Math.sin(t/300):0; polveri.forEach(function(p,ii){ fissa(p,'opacity',r1(Math.max(0,pv*(ii===1||t>=T.b2?1:0))*100)/100); });
    cls(re.g,'vis',t>=T.b3&&t<T.b4+1400); var kf=E.out(fase(t,T.b3+2400,T.b3+3000)); fissa(re.gi,'transform',kf>0?'rotate('+r1(80*kf)+')':'');
    cls(tRe,'vis',t>=T.b3+400&&t<T.b3+2600); cls(croce,'vis',t>=T.b3+3000&&t<T.b4+1600);
    cuneo.forEach(function(c){ var e=E.io(fase(t,T.b3+500+c.k*120,T.b3+2300+c.k*120)), r=E.io(fase(t,T.b3+4300,T.b3+5800)); posa(c.g,lerp(c.u0,c.u1,e*(1-r)),c.d); cls(c.g,'vis',t>=T.b3+300&&t<T.b3+6000); });
    fila.forEach(function(o,ii){ var t0=T.b4+2300+ii*105, e=fase(t,t0,t0+3400), q=[lerp(A1[0],A2[0],e),lerp(A1[1],A2[1],e)+(ii%2?1.6:-1.6)]; fissa(o,'transform','translate('+xy(q)+')'); cls(o,'vis',e>0&&e<1); });
    cls(tFu,'vis',t>=T.b4+2700&&t<T.b5+500);
    espl.forEach(function(e,ii){ var go=E.io(fase(t,T.b5+1000+ii*200,T.b5+3200+ii*200)), bk=E.io(fase(t,T.b5+5000,T.b5+6600)); posa(e.g,lerp(e.u0,e.u1,go*(1-bk)),e.d); cls(e.g,'vis',t>=T.b5+800&&t<T.b5+6800); });
    tende.forEach(function(g,ii){ cls(g,'vuota',t>=T.b5+3000+(tende.length-1-ii)*16); });
    scrivi(tAc,t>=T.b5+3300?'le tende sono vuote':"l'accampamento degli Arabi"); cls(tAc,'vis',t>=T.b1+400);
    cerchi.forEach(function(c){ cls(c,'vis',t>=T.b5+3600&&t<T.b5+5400); }); cls(tIm,'vis',t>=T.b5+4000&&t<T.b5+7000);
    bott.forEach(function(b){ var e=E.io(fase(t,T.b5+5800+b.k*250,T.b5+8600+b.k*250)); posa(b.g,lerp(b.u0,b.u1,e),b.d); cls(b.g,'vis',t>=T.b5+5600); }); cls(tBo,'vis',t>=T.b5+6400);
    cls(tFr,'vis',t>=T.b1+400&&t<T.b4); cls(tMu,'vis',t>=T.b2+1800&&t<T.b3); scrivi(tMu,t>=T.b2+3400?'«come il ghiaccio»':'«come un muro»');
    QS.forEach(function(q,ii){ cls(q.g,'vis',t>=q.t&&(ii===QS.length-1||t<QS[ii+1].t)); });
    /* C */
    cls(gC,'vis',t>=T.c1-300&&t<T.d1-300); schede.forEach(function(s,ii){ cls(s.g,'vis',t>=T.c1+300+ii*1800); });
    var fn=E.out(fase(t,T.c1+3900,T.c1+5600)); scrivi(K3.tb,num(Math.round(375000*fn/1000)*1000)); var wN=largo(K3.tb);
    fissa(tachi,'x2',r1(K3.px+4+wN*E.io(fase(t,T.c1+5900,T.c1+6500)))); cls(tachi,'vis',t>=T.c1+5900);
    fissa(bolloP,'transform','translate('+r1(Math.min(K3.px+wN+14,K3.x+cw-bw-12))+','+r1(K3.y1-K3.fb*.8-(K3.px+wN+14>K3.x+cw-bw-12?-K3.fb*.55:0))+')'); cls(bollo,'vis',t>=T.c1+6300);
    /* D */
    cls(gD,'vis',t>=T.d1-300); cls(L1.g,'vis',t>=T.d1+300); cls(L2.g,'vis',t>=T.d1+3600); cls(gF,'vis',t>=T.d1+6800);
  };
  S.dura=T.fin;
  var bt2=[T.a1,T.a2,T.a3,T.a4,T.a5,T.b1,T.b2,T.b3,T.b4,T.b5,T.c1,T.d1];
  S.battute=POITIERS.fasi.map(function(f,ii){ return {t:bt2[ii],anno:f[0],testo:f[1]}; });
}

/* ======================================================================
   Il Cristianesimo a Roma: da perseguitati a padroni di casa (303-852)
   Aggiunta il 24 novembre 2026 (l'utente: «Procedi come proposto»; «Manteniamo la fedeltà con i veri racconti»). Una pianta di Roma che si riempie di chiese mentre i templi
   chiudono, e un nastro del potere che cambia forma: culto perseguitato, culto libero, religione dell'Impero, il papa che governa. Tutto viene dalla pagina:
   - tappe del 312 (la persecuzione del 303: distruggere le chiese e bruciare i libri; Galerio nel 311; Milano nel 313, libertà «ai cristiani e a tutti»; il segno in Lattanzio e
     in Eusebio, con le loro voci; l'arco: «ispirazione della divinità»), 330 (le prime grandi basiliche), 384 (l'altare, Simmaco e Ambrogio), 394 (l'editto del 380, i divieti
     del 391 e del 392), 593 (Gregorio: il grano, le trattative, «Dov'è il Senato?»), 609 (il Pantheon), 630 (la Curia e le tegole del tempio di Roma), 756 (lo Stato della Chiesa,
     la lettera di Stefano II), 800 (l'incoronazione, gli Annali del regno dei Franchi), 852 (la città leonina, la vita di Leone IV);
   - schede del Laterano («voluta da Costantino»; l'anno dei lavori «resta incerto») e di San Pietro («sulla tomba dell'apostolo, fuori le mura»);
   - le chiese: anni e luoghi di CHIESE (js/dati.js) e di MONUMENTI, posizioni dei monumenti da js/monumenti.js, mura leonine da LEO in js/monumenti.js, mura e Tevere da RM_TOPO.
   Letto ora (24 novembre 2026), una sola fonte in più: Codice Teodosiano XVI 1, 2 (Tessalonica, 27 febbraio 380, «ad populum urbis Constantinopolitanae»), nel latino di
   droitromain.univ-grenoble-alpes.fr/Constitutiones/CTh16.html: «Cunctos populos, quos clementiae nostrae regit temperamentum, in tali volumus religione versari, quam divinum
   petrum apostolum tradidisse Romanis». Traduzione nostra.
   Schemi, detti nelle avvertenze in pagina: la pianta è quella del modello; i segni stanno sugli edifici attuali; per molte chiese minori l'anno è una scelta del modello dentro
   un secolo o una prima attestazione; i templi segnati sono quelli che il modello chiude nel 392, ma la fine del culto non ha una data; il nastro del potere è un riassunto
   delle tappe, non una periodizzazione delle fonti; il segno sullo scudo è disegnato dalla descrizione di Lattanzio. Nessun numero di cristiani: le fonti non lo danno. */
var CRISTIANESIMO={ titolo:"Il Cristianesimo a Roma", sotto:"Da culto perseguitato a religione dell'Impero, fino al papa che governa la città: 303-852",
  fasi:[["303","Sotto Diocleziano comincia la grande persecuzione dei cristiani. Le autorità ordinano di distruggere le chiese e bruciare i libri sacri."],
    ["312","Ponte Milvio, in due racconti. Per Lattanzio, verso il 315, Costantino sogna e fa tracciare sugli scudi il segno di Cristo. Per Eusebio, dopo il 337, prima vede in cielo una croce luminosa, poi un sogno gli spiega come usare quel segno. L'arco del Senato parla solo di «ispirazione della divinità»."],
    ["313","Nel 311 Galerio aveva riconosciuto ai cristiani il diritto di praticare la loro religione. Nel 313, a Milano, Costantino e Licinio garantiscono la libertà di culto «ai cristiani e a tutti»."],
    ["Verso il 330","Sorgono le prime grandi basiliche cristiane. Il Laterano, la cattedrale voluta da Costantino, sorge sul Celio. San Pietro sorge fuori le mura, sulla tomba dell'apostolo."],
    ["380","Un editto di Teodosio stabilisce che tutti seguano la fede del vescovo di Roma, Damaso, e di quello di Alessandria. Chi la rifiuta è considerato eretico."],
    ["384","Graziano ha fatto togliere dal Senato l'altare della Vittoria e ha tagliato i fondi ai culti. Simmaco chiede di rimetterlo, Ambrogio si oppone. Valentiniano II respinge la richiesta."],
    ["391-392","Teodosio vieta i sacrifici e l'ingresso nei templi per celebrarvi riti. Quando finì davvero il culto degli dèi non si sa: nella pianta i templi chiudono nel 392, per scelta del modello."],
    ["593","I Longobardi marciano su Roma. È papa Gregorio Magno a organizzare la distribuzione del grano e a trattare con gli assedianti."],
    ["609","L'imperatore Foca dona il Pantheon a papa Bonifacio IV. Il 13 maggio Bonifacio lo consacra come chiesa di Santa Maria ad Martyres. Il nuovo uso lo preserva."],
    ["630","Papa Onorio I fa della Curia, l'aula del Senato, la chiesa di Sant'Adriano. Con il permesso dell'imperatore Eraclio toglie le tegole di bronzo dal tempio di Roma per coprire San Pietro."],
    ["756","Pipino, re dei Franchi, consegna al papa i territori tolti ai Longobardi. Nasce lo Stato della Chiesa: i papi esercitano anche il potere politico."],
    ["800","Nella basilica di San Pietro papa Leone III incorona Carlo Magno imperatore. Roma è la sede dei papi e la meta dei pellegrini."],
    ["852","Leone IV fa costruire nuove mura attorno a San Pietro: nasce la «città leonina». È qui che Roma ha trovato un nuovo centro."]],
  fonte:"Tappe del 312, 330, 384, 394, 593, 609, 630, 756, 800 e 852 di questa pagina, con le loro voci (Lattanzio, Eusebio, Simmaco, Ambrogio, Gregorio Magno, Liber Pontificalis, Stefano II, Annali del regno dei Franchi); schede del Laterano e di San Pietro; Codice Teodosiano XVI 1, 2, del 27 febbraio 380 (traduzione nostra). Schema: la pianta è quella del modello della città, con le chiese nei luoghi degli edifici di oggi; per molte chiese minori l'anno in cui compaiono è una scelta del modello, dentro un secolo o alla prima notizia; i templi segnati sono quelli che il modello chiude nel 392, ma quando finì il culto degli dèi non si sa; il nastro del potere riassume le tappe e non è una divisione delle fonti; il segno sullo scudo è disegnato dalla descrizione di Lattanzio. Quanti fossero i cristiani, le fonti non lo dicono." };
/* le quote del modello (RM_TOPO.quote) come ombra leggera dei colli, luce da nord-ovest: lo stesso calcolo degli acquedotti */
function ombraColli(par,TP,EXT,mb){
  try{ var Q=TP.quote, ew=EXT[2]-EXT[0], eh=EXT[3]-EXT[1], cw=Math.round(Math.min(520,mb[2])), ch=Math.round(cw*eh/ew), cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; var cx=cv.getContext('2d'), im=cx.createImageData(cw,ch);
    var quota=function(x,z){ var c=(x-Q.x0)/Q.dx, r=(Q.z0-z)/Q.dz; c=clamp(c,0,Q.colonne-1.001); r=clamp(r,0,Q.righe-1.001); var c0=Math.floor(c), r0=Math.floor(r), fc=c-c0, fr=r-r0, n=r0*Q.colonne+c0;
      return ((Q.q[n]*(1-fc)+Q.q[n+1]*fc)*(1-fr)+(Q.q[n+Q.colonne]*(1-fc)+Q.q[n+Q.colonne+1]*fc)*fr)/10; }, px=ew/cw;
    for(var yy=0;yy<ch;yy++) for(var xx=0;xx<cw;xx++){ var X0=EXT[0]+xx*px, Z0=EXT[1]+yy*px, e=quota(X0,Z0), gx=(quota(X0+px*2,Z0)-quota(X0-px*2,Z0))/(px*40), gz=(quota(X0,Z0+px*2)-quota(X0,Z0-px*2))/(px*40);
      var sh=clamp(.5-(gx*-1+gz*-1)*3.2,0,1), alto=clamp(e/45,0,1), o=(yy*cw+xx)*4;
      im.data[o]=Math.round(238+alto*10-(1-sh)*52); im.data[o+1]=Math.round(229+alto*6-(1-sh)*56); im.data[o+2]=Math.round(208-alto*10-(1-sh)*60); im.data[o+3]=255; }
    cx.putImageData(im,0,0); href(el('image',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mb[2]),height:r1(mb[3]),preserveAspectRatio:'none','class':'ig-aq-rilievo'},par),cv.toDataURL('image/png')); }catch(err){} }
/* i segni della pianta: il tempio col frontone (chiuso: grigio e incrinato), la chiesa (le maggiori come piccole basiliche) */
function segnoTempio(par,p,s){ var g=el('g',{'class':'ig-cr-tempio',transform:'translate('+xy(p)+')'},par);
  el('path',{d:'M'+r1(-s*.62)+' '+r1(-s*.28)+' L0 '+r1(-s*.62)+' L'+r1(s*.62)+' '+r1(-s*.28)+' Z M'+r1(-s*.55)+' '+r1(s*.42)+' H'+r1(s*.55)+' V'+r1(s*.54)+' H'+r1(-s*.55)+' Z','class':'ig-cr-t-pieno'},g);
  [-.36,0,.36].forEach(function(x){ el('rect',{x:r1(s*x-s*.07),y:r1(-s*.24),width:r1(s*.14),height:r1(s*.66),'class':'ig-cr-t-pieno'},g); });
  el('path',{d:'M'+r1(-s*.1)+' '+r1(-s*.55)+' l'+r1(s*.12)+' '+r1(s*.3)+' l'+r1(-s*.14)+' '+r1(s*.22)+' l'+r1(s*.1)+' '+r1(s*.4),'class':'ig-cr-crepa'},g); return g; }
function segnoChiesa(par,p,s,grande){ var g=el('g',{'class':'ig-cr-chiesa '+(grande?'grande':'minore'),transform:'translate('+xy(p)+')'},par), q=el('g',{'class':'ig-cr-c-in'},g);
  if(grande){ el('path',{d:'M'+r1(-s*.7)+' '+r1(s*.45)+' V'+r1(-s*.1)+' L0 '+r1(-s*.5)+' L'+r1(s*.7)+' '+r1(-s*.1)+' V'+r1(s*.45)+' Z','class':'ig-cr-c-corpo'},q); el('path',{d:'M0 '+r1(-s*.5)+' V'+r1(-s*1.15)+' M'+r1(-s*.24)+' '+r1(-s*.9)+' H'+r1(s*.24),'class':'ig-cr-c-croce'},q); }
  else el('path',{d:'M0 '+r1(-s*.55)+' V'+r1(s*.55)+' M'+r1(-s*.36)+' '+r1(-s*.16)+' H'+r1(s*.36),'class':'ig-cr-c-croce'},q);
  return g; }
/* i piccoli disegni dei quadri, dalle descrizioni della pagina (schemi) */
function vignettaCr(par,tipo,x,y,s){ var g=el('g',{'class':'ig-cr-vign',transform:'translate('+r1(x)+','+r1(y)+') scale('+r1(s/60*100)/100+')'},par);
  el('rect',{x:0,y:0,width:60,height:60,rx:10,'class':'ig-cr-v-fondo'+(tipo==='libri'||tipo==='mura'?' scuro':'')},g);
  if(tipo==='libri'){ el('path',{d:'M14 44 L30 40 L46 44 V30 L30 26 L14 30 Z','class':'ig-cr-v-libro'},g); el('path',{d:'M30 26 V40','class':'ig-cr-v-riga'},g); el('path',{d:FIAMMA,transform:'translate(30 25) scale(1.25)','class':'ig-cr-v-fiamma'},g); }
  else if(tipo==='altare'){ el('path',{d:'M20 48 H40 V44 H37 V26 H40 V21 H20 V26 H23 V44 H20 Z','class':'ig-cr-v-altare'},g); el('path',{d:'M44 34 H54 M50 30 L54 34 L50 38','class':'ig-cr-v-via'},g); }
  else if(tipo==='grano'){ [[18,40],[31,38],[44,40],[24,28],[38,28]].forEach(function(q){ el('path',{d:'M'+(q[0]-7)+' '+(q[1]+8)+' Q'+(q[0]-8)+' '+(q[1]-4)+' '+(q[0]-3)+' '+(q[1]-7)+' H'+(q[0]+3)+' Q'+(q[0]+8)+' '+(q[1]-4)+' '+(q[0]+7)+' '+(q[1]+8)+' Z','class':'ig-cr-v-sacco'},g); }); }
  else if(tipo==='corona'){ el('path',{d:'M15 40 L17 22 L24 31 L30 18 L36 31 L43 22 L45 40 Z','class':'ig-cr-v-corona'},g); el('rect',{x:15,y:40,width:30,height:6,rx:1.5,'class':'ig-cr-v-corona'},g); }
  else if(tipo==='mura'){ el('path',{d:'M6 48 V30 H11 V26 H16 V30 H22 V26 H27 V30 H33 V26 H38 V30 H44 V26 H49 V30 H54 V48 Z','class':'ig-cr-v-mura'},g); el('path',{d:'M30 24 V12 M26 16 H34','class':'ig-cr-v-croce'},g); }
  else if(tipo==='scudo'){ el('ellipse',{cx:30,cy:31,rx:15,ry:19,'class':'ig-cr-scudo'},g); el('path',{d:'M23 25 L37 41 M37 25 L23 41 M30 33 V17 q6 -1 6 4 t-6 4','class':'ig-cr-segno'},g); }
  else if(tipo==='croce'){ el('rect',{x:0,y:0,width:60,height:60,rx:10,'class':'ig-cr-cielo'},g); el('path',{d:'M30 14 V46 M20 25 H40','class':'ig-cr-luce'},g); }
  else if(tipo==='basilica'){ el('path',{d:'M12 46 V30 L30 18 L48 30 V46 Z','class':'ig-cr-c-corpo'},g); el('path',{d:'M30 18 V8 M26 11.5 H34','class':'ig-cr-c-croce'},g); el('rect',{x:26,y:36,width:8,height:10,'class':'ig-cr-v-porta'},g); }
  return g; }
function disegnaCristianesimo(svg,S,W,H){
  var TP=window.RM_TOPO; if(!TP||!TP.mura||!TP.fiume) return;
  var oriz=W/H>=1.15, pad=oriz?16:10, defs=el('defs',null,svg), fasi=CRISTIANESIMO.fasi, i;
  var EXT=[-305,-236,320,236], ew=EXT[2]-EXT[0], eh=EXT[3]-EXT[1], pb, cb;      /* Sant'Agnese e San Paolo, più lontane, stanno sul bordo, con il nome che lo dice */
  if(oriz){ var ph=H-2*pad, pw=Math.min(ph*ew/eh,W*.58); ph=pw*eh/ew; pb=[pad,(H-ph)/2,pw,ph]; cb=[pad+pw+24,pad,W-(pad+pw+24)-pad,H-2*pad]; }
  else { var pw2=W-2*pad, ph2=Math.min(pw2*eh/ew,H*.46); pw2=ph2*ew/eh; pb=[(W-pw2)/2,pad,pw2,ph2]; cb=[pad,pb[1]+ph2+12,W-2*pad,H-(pb[1]+ph2+12)-6]; }
  var k=pb[2]/ew, B=function(p){ return [pb[0]+(clamp(p[0],EXT[0]+12,EXT[2]-12)-EXT[0])*k, pb[1]+(clamp(p[1],EXT[1]+12,EXT[3]-12)-EXT[1])*k]; }, Bl=function(p){ return [pb[0]+(p[0]-EXT[0])*k, pb[1]+(p[1]-EXT[1])*k]; },
    LL=function(lat,lon){ return B([(lon-12.4853)*8287,-(lat-41.8925)*11113.2]); };      // come RM.ll in js/base.js
  /* la pianta, protagonista: rilievo dei colli, Tevere, mura */
  var tav=el('g',{'class':'ig-cr-tavola'},svg), cp=el('clipPath',{id:'ig-cr-clip'},defs); el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),rx:14},cp);
  var carta=el('g',{'clip-path':'url(#ig-cr-clip)'},tav); el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),'class':'ig-aq-fondo'},carta); ombraColli(carta,TP,EXT,pb);
  el('polyline',{points:TP.fiume.map(Bl).map(xy).join(' '),'class':'ig-aq-tevere-a'},carta); el('polyline',{points:TP.fiume.map(Bl).map(xy).join(' '),'class':'ig-aq-tevere'},carta);
  el('path',{d:'M'+TP.mura.map(Bl).map(xy).join('L')+'Z','class':'ig-aq-mura'},carta);
  var LEO=[[-163,-120],[-233.3,-121],[-250,-124],[-272,-127],[-294,-124.5],[-300,-119],[-307,-111],[-313,-100.5],[-304,-96.5],[-285,-89],[-262,-87],[-240.2,-87.7],[-212,-86.5],[-196.5,-86.7],[-187,-84]];      // LEO in js/monumenti.js
  var leo=el('path',{d:'M'+LEO.map(Bl).map(xy).join(' L'),'class':'ig-cr-leonine'},carta); scopri(leo);
  var sT=clamp(k*30,11,19), cs=clamp(k*16,6.5,10);
  /* i templi che il modello chiude nel 392 (MONUMENTI) e la Curia */
  var TEMPLI=[{id:'giove',p:[-29,0]},{id:'pantheon',p:[-70,-68],chiesa:609},{id:'venere',p:[36.3,17.8]},{id:'apollo',p:[-47.8,.8],s:.7},{id:'bellona',p:[-44.8,1.15],s:.7},{id:'sole',p:[-30,-106],dal:274}];
  var gT=el('g',null,carta); TEMPLI.forEach(function(t){ t.g=segnoTempio(gT,B(t.p),sT*(t.s||1)); });
  var curia=el('g',{'class':'ig-cr-curia',transform:'translate('+xy(B([.8,-5.1]))+')'},gT); el('rect',{x:r1(-sT*.4),y:r1(-sT*.32),width:r1(sT*.8),height:r1(sT*.64),rx:1.5},curia);
  /* le chiese: le grandi (MONUMENTI, posizioni di js/monumenti.js) e le minori (CHIESE) */
  var GRANDI=[['San Giovanni in Laterano',[169,73],318],['San Paolo',[-63.4,376.8],324],['Santa Croce',[253.3,47.6],330],['San Pietro',[-259,-108],333],['San Lorenzo',[296,-104.4],335],["Sant'Agnese",[265.6,-340.3],350],
    ['Santa Sabina',[-46,89],432],['Santa Maria Maggiore',[109,-57],434],['Santo Stefano Rotondo',[94.5,88],475],['Santi Cosma e Damiano',[16.5,4],527],['Santa Maria ad Martyres',[-70,-68],609,'pantheon'],["Sant'Adriano",[.8,-5.1],630,'curia']];
  var gC=el('g',null,carta), chiese=[];
  ((D.CHIESE)||[]).forEach(function(c){ chiese.push({g:segnoChiesa(gC,LL(c[1],c[2]),cs,false),a:c[3],f:c[5]||1e4}); });
  GRANDI.forEach(function(c){ var g=segnoChiesa(gC,B(c[1]),sT*1.05,true); chiese.push({g:g,a:c[2],f:1e4,muta:c[3],grande:true}); if(c[3]){ var p=B(c[1]); c.alone=el('circle',{cx:r1(p[0]),cy:r1(p[1]),r:r1(sT*1.3),'class':'ig-cr-muta'},gC); } });
  var aloni=GRANDI.filter(function(c){ return c.alone; });
  /* l'arco delle tegole: dal tempio di Roma a San Pietro (630) */
  var pV=B([36.3,17.8]), pP=B([-259,-108]), teg=el('path',{d:'M'+xy(pV)+' Q'+r1((pV[0]+pP[0])/2)+' '+r1(Math.min(pV[1],pP[1])-pb[3]*.14)+' '+xy(pP),'class':'ig-cr-tegole'},carta); scopri(teg);
  /* i nomi: sopra i segni (nomiInCima); uno solo per quadro, dove serve */
  function nome(p,s,dx,dy,an){ var g=el('g',{'class':'ig-v-luogo ig-cr-luogo',transform:'translate('+xy(p)+')'},carta), t=tx(g,dx,dy,'ig-v-nome ig-cr-nome',s,an||'start'), b;
    try{ b=t.getBBox(); }catch(e){ b=null; }      // il nome sta tutto dentro la pianta: se esce da un lato, passa dall'altro (24 novembre 2026)
    if(b){ if(p[0]+b.x+b.width>pb[0]+pb[2]-5){ t.setAttribute('x',r1(-Math.abs(dx))); t.setAttribute('text-anchor','end'); } else if(p[0]+b.x<pb[0]+5){ t.setAttribute('x',r1(Math.abs(dx))); t.setAttribute('text-anchor','start'); } }
    return g; }
  var N={pietro:nome(pP,'San Pietro',-sT*.6,-sT-4,'start'),laterano:nome(B([169,73]),'Laterano',sT*.8,4,'start'),paolo:nome(B([-63.4,376.8]),'San Paolo, più a sud',sT*.8,-2,'start'),lorenzo:nome(B([296,-104.4]),'San Lorenzo',-sT*.8,-sT*.6,'end'),
    agnese:nome(B([265.6,-340.3]),"Sant'Agnese, più a nord",-sT*.8,sT*.5,'end'),maggiore:nome(B([109,-57]),'Santa Maria Maggiore',sT*.8,-sT*.5,'start'),pantheon:nome(B([-70,-68]),pb[2]<420?'Pantheon → chiesa':'Pantheon → Santa Maria ad Martyres',sT*.9,-sT*.7,'start'),
    giove:nome(B([-29,0]),'Giove Capitolino',-sT*.9,sT*.9,'end'),curia:nome(B([.8,-5.1]),"Curia → Sant'Adriano",sT*.8,-sT*.8,'start'),venere:nome(pV,'tempio di Roma',sT*.8,sT*.9,'start'),sole:nome(B([-30,-106]),'tempio del Sole',sT*.8,-sT*.4,'start'),
    leonine:nome(pP,'San Pietro e la città leonina',-sT*.6,-sT-5,'start')};
  tx(tav,pb[0]+12,pb[1]+pb[3]-12,'ig-m-schema ig-f','schema: pianta del modello','start');
  el('rect',{x:r1(pb[0]),y:r1(pb[1]),width:r1(pb[2]),height:r1(pb[3]),rx:14,'class':'ig-m-cornice'},tav);
  /* la colonna: l'anno, la fase (il nastro del potere), il contatore, il disegno, la voce */
  var FASCE=[[303,311,'perseguitati','pers'],[311,380,'culto libero','libero'],[380,756,"religione dell'Impero",'impero'],[756,853,'il papa governa','papa']];
  var gK=el('g',{'class':'ig-p-col-d'},svg), fsA=oriz?Math.min(64,cb[2]/4.2,H*.16):Math.min(36,W/10), tA=tx(gK,cb[0],cb[1]+fsA*.82,'ig-p-anno',''); tA.style.fontSize=fsA+'px';
  var yN=cb[1]+fsA*.82+14, hN=oriz?30:26, gN=el('g',{'class':'ig-cr-fasce'},gK), cwN=(cb[2]-9)/4, chip=FASCE.map(function(f,j){ var g=el('g',{'class':'ig-cr-fase '+f[3]},gN), x=cb[0]+j*(cwN+3);
    el('rect',{x:r1(x),y:r1(yN),width:r1(cwN),height:hN,rx:hN/2,'class':'ig-cr-fase-r'},g); var t=tx(g,x+cwN/2,yN+hN*.66,'ig-cr-fase-t',f[2],'middle'); var fs=oriz?12:10.5; t.style.fontSize=fs+'px'; while(largo(t)>cwN-8&&fs>8){ fs-=.5; t.style.fontSize=fs+'px'; }
    if(largo(t)>cwN-6){ t.textContent=''; var w=f[2].split(' '); var a1=el('tspan',{x:r1(x+cwN/2),dy:'-0.45em'},t), a2=el('tspan',{x:r1(x+cwN/2),dy:'1.05em'},t); a1.textContent=w.slice(0,Math.ceil(w.length/2)).join(' '); a2.textContent=w.slice(Math.ceil(w.length/2)).join(' '); }
    return g; });
  var yL=yN+hN+8, X=function(a){ return cb[0]+(a-303)/(852-303)*cb[2]; }, gL=el('g',{'class':'ig-cr-linea'},gK);
  el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(yL),y2:r1(yL),'class':'ig-cr-asse'},gL); [303,380,593,756,852].forEach(function(a,j){ tx(gL,X(a),yL+13,'ig-cr-anno-p',String(a),j?j===4?'end':'middle':'start'); });
  var curL=el('circle',{cx:r1(cb[0]),cy:r1(yL),r:4.5,'class':'ig-p-cur-p'},gL);
  /* il contatore: una croce per ogni chiesa nella pianta, un frontone per ogni tempio aperto (nessuna cifra) */
  var yC=yL+(oriz?34:28), gCo=el('g',{'class':'ig-cr-conta'},gK), passo=oriz?9:8, perRiga=Math.floor((cb[2]-100)/passo), cc=[], tt=[];
  tx(gCo,cb[0],yC+4,'ig-cr-conta-t','chiese'); chiese.forEach(function(c,j){ var x=cb[0]+100+(j%perRiga)*passo, y=yC+Math.floor(j/perRiga)*11; cc.push(el('path',{d:'M'+r1(x)+' '+r1(y-4)+' V'+r1(y+4)+' M'+r1(x-2.6)+' '+r1(y-1.2)+' H'+r1(x+2.6),'class':'ig-cr-conta-c'},gCo)); });
  var righeC=Math.ceil(chiese.length/perRiga), yT=yC+righeC*11+8; tx(gCo,cb[0],yT+4,'ig-cr-conta-t','templi aperti'); TEMPLI.forEach(function(t,j){ var x=cb[0]+100+j*(passo+5); var g=el('g',{transform:'translate('+r1(x)+','+r1(yT)+')'},gCo); el('path',{d:'M-4 -1 L0 -4.5 L4 -1 Z M-3.6 3.5 H3.6 V4.6 H-3.6 Z M-2.6 -1 V3.5 M0 -1 V3.5 M2.6 -1 V3.5','class':'ig-cr-conta-t2'},g); tt.push(g); });
  var yQ=yT+(oriz?22:18), hQ=cb[1]+cb[3]-yQ, gQ=el('g',{'class':'ig-cr-voce'},gK);
  var VOCI={1:[["Lattanzio, verso il 315","«Fu avvertito in sogno di segnare sugli scudi il segno celeste di Dio»"],["Eusebio, dopo il 337","«Un segno di vittoria a forma di croce luminosa, con la scritta “Con questo vinci”»"]],
    2:[["l'accordo di Milano, 313","la libertà di culto «ai cristiani e a tutti»"]],
    3:[["la scheda di San Pietro","«Basilica costantiniana sulla tomba dell'apostolo, fuori le mura»"]],
    4:[["Codice Teodosiano XVI 1, 2 · 27 febbraio 380","«Vogliamo che tutti i popoli governati dalla nostra clemenza vivano nella religione che il divino apostolo Pietro trasmise ai Romani»"]],
    5:[["Simmaco, Relazione III, 10","«Non si può arrivare per una sola strada a un mistero così grande»"],["Ambrogio, Lettera 18, 8","«Ciò che voi ignorate, noi l'abbiamo conosciuto dalla voce di Dio»"]],
    7:[["Gregorio Magno, Omelie su Ezechiele II, 6, 22","«Dov'è il Senato? Dov'è ormai il popolo?»"]],
    8:[["Liber Pontificalis, vita di Bonifacio IV","«Chiese all'imperatore Foca il tempio chiamato Pantheon, e ne fece la chiesa della beata Maria sempre vergine e di tutti i martiri»"]],
    9:[["Liber Pontificalis, vita di Onorio I","«Coprì tutta la chiesa con tegole di bronzo, che tolse dal tempio chiamato di Roma»"]],
    10:[["Stefano II ai Franchi, 756","«Io, Pietro apostolo […] correte e soccorrete»"]],
    11:[["Annali del regno dei Franchi","«A Carlo augusto, coronato da Dio, grande e pacifico imperatore dei Romani, vita e vittoria!»"]],
    12:[["Liber Pontificalis, vita di Leone IV","«Questa città, che da poco, con il tuo aiuto, abbiamo fondato, fa' che resti per sempre al sicuro dalla tua ira»"]]};
  var DIS={0:[['libri','i libri sacri bruciati']],1:[['scudo','Lattanzio: sugli scudi'],['croce','Eusebio: in cielo']],3:[['basilica','le prime basiliche']],5:[['altare','l\'altare tolto']],7:[['grano','il grano del papa']],8:[['basilica','il tempio diventa chiesa']],11:[['corona','la corona a San Pietro']],12:[['mura','le mura di Leone']]};
  function scriviVoci(j){ gQ.textContent=''; var y=yQ, w=cb[2], fin=j>=fasi.length;
    if(fin){ /* il finale: la Roma del 303 in piccolo, accanto alla grande dell'852 */
      var mh=Math.min(hQ-30,(w*.62)*eh/ew), mw=mh*ew/eh; if(mh<60) return; var mb=[cb[0],y+16,mw,mh], kk=mw/ew, Bm=function(p){ return [mb[0]+(clamp(p[0],EXT[0],EXT[2])-EXT[0])*kk, mb[1]+(clamp(p[1],EXT[1],EXT[3])-EXT[1])*kk]; };
      var g=el('g',{'class':'ig-cr-mini'},gQ), cpm=el('clipPath',{id:'ig-cr-cm'},defs); el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mw),height:r1(mh),rx:8},cpm); var gi=el('g',{'clip-path':'url(#ig-cr-cm)'},g);
      el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mw),height:r1(mh),'class':'ig-aq-fondo'},gi); el('polyline',{points:TP.fiume.map(Bm).map(xy).join(' '),'class':'ig-aq-tevere'},gi); el('path',{d:'M'+TP.mura.map(Bm).map(xy).join('L')+'Z','class':'ig-aq-mura'},gi);
      TEMPLI.forEach(function(t){ if(!t.dal) segnoTempio(gi,Bm(t.p),Math.max(7,sT*mw/pb[2]*1.4)).setAttribute('class','ig-cr-tempio vis'); });
      el('rect',{x:r1(mb[0]),y:r1(mb[1]),width:r1(mw),height:r1(mh),rx:8,'class':'ig-m-cornice'},g);
      tx(g,mb[0],y+10,'ig-cr-mini-t','303: i templi, nessuna basilica','start'); var t2=tx(g,mb[0]+mw+14,mb[1]+mh/2,'ig-cr-mini-t',oriz?'← 852: la pianta grande':'852: la pianta sopra','start'); if(largo(t2)>w-mw-16){ t2.textContent=oriz?'← 852':'852 ↑'; } return; }
    var d=DIS[j], x0=cb[0]; if(d&&hQ>110){ var sv=Math.min(64,hQ*.36); d.forEach(function(q,ii){ var x=cb[0]+ii*Math.max(sv+70,w/2); vignettaCr(gQ,q[0],x,y,sv); tx(gQ,x+sv+8,y+sv*.5+4,'ig-cr-segni-t',q[1]); }); tx(gQ,cb[0]+w,y+sv+14,'ig-m-schema ig-f','disegno: schema','end'); y+=sv+24; }
    else if(d&&hQ>56){ var sv2=Math.min(50,hQ-8); vignettaCr(gQ,d[0][0],cb[0],y,sv2); tx(gQ,cb[0]+sv2/2,y+sv2+11,'ig-m-schema ig-f','schema','middle'); x0=cb[0]+sv2+12; w-=sv2+12; }      // sul telefono il disegno sta a sinistra della voce (24 novembre 2026: la corona dell'800 non si vedeva)
    var vv=VOCI[j]; if(!vv) return; var fs=oriz&&cb[2]>300?17:14.5;
    vv.forEach(function(v){ if(y>cb[1]+cb[3]-40) return; var g=citazione(gQ,x0,y,w,v[1],v[0],fs); if(y+g._h>cb[1]+cb[3]){ g.remove(); y=1e9; return; } g.classList.add('vis'); y+=g._h+12; }); }
  /* la regia: il tempo scorre fra le tappe, le chiese compaiono nel loro anno; alla fine, prima e dopo */
  var ANNI=[303,312,313,330,380,384,392,593,609,630,756,800,852];
  var tm=Tempo(303,ANNI.map(function(a){ return {anno:a,sosta:4700}; }),{inizio:1500,vel:7,min:700}), tFine=tm.fine+300, tFin=tFine+6200, visto=-2;
  function faseDi(a){ for(var j=FASCE.length-1;j>=0;j--) if(a>=FASCE[j][0]) return j; return 0; }
  S.passo=function(t){
    var a=tm.anno(t), i2=-1; tm.arrivi.forEach(function(x,j){ if(t>=x) i2=j; }); var fin=t>=tFine, q=fin?fasi.length:i2;
    cls(tav,'vis',t>=200); cls(gK,'vis',t>=500);
    var aperti=0; TEMPLI.forEach(function(tt,j){ var aperto=a<392&&a>=(tt.dal||0), chiesa=tt.chiesa&&a>=tt.chiesa; cls(tt.g,'vis',a>=(tt.dal||0)&&!chiesa); cls(tt.g,'chiuso',!aperto); if(aperto) aperti++; cls(tTT(j),'on',aperto); });
    cls(curia,'vis',a<630);
    var n=0; chiese.forEach(function(c){ var v=a>=c.a&&a<c.f; if(v) n++; if(c.v!==v){ c.v=v; cls(c.g,'vis',v); if(v&&t>700&&!POCO){ c.g.classList.remove('nasce'); void c.g.getBoundingClientRect(); c.g.classList.add('nasce'); } } });
    cc.forEach(function(p,j){ cls(p,'on',j<n); });
    aloni.forEach(function(c){ var tA0=tm.arrivi[ANNI.indexOf(c[2])], f=fase(t,tA0-200,tA0+2600); cls(c.alone,'vis',f>0&&f<1); });
    var ii=Math.max(0,i2);
    function mostra(k2,s){ cls(N[k2],'vis',!!s); }
    mostra('pietro',i2===9||i2===11); mostra('laterano',a>=318&&(i2===3||i2===4)); mostra('paolo',i2===3); mostra('lorenzo',i2===3); mostra('agnese',i2===3); mostra('maggiore',i2===7);
    mostra('giove',i2>=0&&i2<=1||i2===6); mostra('pantheon',i2===8); mostra('curia',i2===9); mostra('venere',i2===9); mostra('sole',i2===6); mostra('leonine',i2===12||fin);
    traccia(teg,i2===9?E.io(fase(t,tm.arrivi[9]+900,tm.arrivi[9]+2600)):0); cls(teg,'vis',i2===9);
    traccia(leo,E.io(fase(t,tm.arrivi[12]+300,tm.arrivi[12]+2600)));
    var fz=faseDi(a); chip.forEach(function(g,j){ cls(g,'ora',j===fz&&t>=1200); cls(g,'passata',j<fz); });
    fissa(curL,'cx',r1(X(a)));
    if(q!==visto){ visto=q; setTimeout(sottoNomi,0); scrivi(tA,q<0?'':fin?'303 · 852':fasi[ii][0]); var fa=fsA; tA.style.fontSize=fa+'px'; while(largo(tA)>cb[2]&&fa>18){ fa-=2; tA.style.fontSize=fa+'px'; } scriviVoci(q); }
    cls(gK,'cambia',i2>=0&&t<tm.arrivi[ii]+140);
  };
  function tTT(j){ return tt[j]; }
  /* le croci minori che stanno sotto un nome acceso si velano, perché il nome si legga (le croci restano nella pianta) */
  function sottoNomi(){ var R=[]; for(var k2 in N){ if(!N[k2].classList.contains('vis')) continue; [].forEach.call(carta.querySelectorAll('.ig-cr-nome'),function(t){ if(t.closest('.ig-v-luogo')&&t.closest('.ig-v-luogo').classList.contains('vis')){ var r=t.getBoundingClientRect(); R.push(r); } }); break; }
    chiese.forEach(function(c){ var r=c.g.getBoundingClientRect(), sotto=R.some(function(q){ return r.left<q.right+2&&r.right>q.left-2&&r.top<q.bottom+2&&r.bottom>q.top-2; }); cls(c.g,'velata',sotto&&!c.grande); }); }      // le basiliche maggiori non si velano
  S.dura=tFin;
  S.battute=fasi.map(function(f,j){ return {t:tm.arrivi[j],anno:f[0],testo:f[1]}; }).concat([{t:tFine,anno:'303 e 852',testo:"Nella pianta grande la Roma dell'852; nel 303 c'erano i templi aperti e nessuna basilica. Le posizioni sono quelle del modello."}]);
}

var INFO={ roma:{d:ROMA, disegna:disegnaRoma, tappe:function(t){ return t.anno===590&&t.intermezzo || t.anno===852&&!t.intermezzo; }},
  moneta:{d:MONETA, disegna:disegnaMoneta, tappe:function(t){ return t.anno===284&&t.intermezzo; }},      // solo nell'intermezzo «La moneta» (23 novembre 2026, l'utente: «toglila dalla tappa del 274»)
  navi:{d:NAVI, disegna:disegnaNavi, tappe:function(t){ return t.anno===395&&t.intermezzo || t.anno===711&&!t.intermezzo; }},
  sacco:{d:SACCO, disegna:disegnaSacco, tappe:function(t){ return t.anno===410&&!t.intermezzo; }},
  governo:{d:GOVERNO, disegna:disegnaGoverno, tappe:function(t){ return !t.intermezzo && (t.anno===476||t.anno===568||t.anno===800); }},
  valeriano:{d:VALERIANO, disegna:disegnaValeriano, tappe:function(t){ return t.anno===260&&!t.intermezzo; }},
  curia:{d:CURIA, disegna:disegnaCuria, tappe:function(t){ return t.anno===630&&!t.intermezzo; }},
  pantheon:{d:PANTHEON, disegna:disegnaPantheon, tappe:function(t){ return !t.intermezzo && (t.anno===609||t.anno===663); }, da:function(t){ return t&&t.anno===663?'663':null; }},      // anche nella tappa di Costante II (24 novembre 2026, l'utente: «inserire»); aperta dal 663 parte dal suo quadro
  milvio:{d:MILVIO, disegna:disegnaMilvio, tappe:function(t){ return t.anno===312&&!t.intermezzo; }},
  adrianopoli:{d:ADRIANOPOLI, disegna:disegnaAdrianopoli, tappe:function(t){ return t.anno===378&&!t.intermezzo; }},
  catalaunici:{d:CATALAUNICI, disegna:disegnaCatalaunici, tappe:function(t){ return t.anno===451&&!t.intermezzo; }},
  capobon:{d:CAPOBON, disegna:disegnaCapobon, tappe:function(t){ return t.anno===468&&!t.intermezzo; }},
  altare:{d:ALTARE, disegna:disegnaAltare, tappe:function(t){ return t.anno===384&&!t.intermezzo; }},
  barbari:{d:BARBARI, disegna:disegnaBarbari, tappe:function(t){ return t.anno===439&&t.intermezzo; }},
  acquedotti:{d:ACQUEDOTTI, disegna:disegnaAcquedotti, tappe:function(t){ return !t.intermezzo && (t.anno===537||t.anno===780); }, da:function(t){ return t&&t.anno===780?'verso il 776':null; }},      // anche nel 780 (24 novembre 2026, l'utente: «inserire», non spostare); aperta dal 780 parte dai restauri di Adriano I
  sacchi:{d:SACCHI, disegna:disegnaSacchi, tappe:function(t){ return !t.intermezzo && (t.anno===455||t.anno===546); }},
  cristianesimo:{d:CRISTIANESIMO, disegna:disegnaCristianesimo, tappe:function(t){ return !t.intermezzo && (t.anno===330||t.anno===394||t.anno===756||t.anno===852); }, da:function(t){ return t&&t.anno===394?'380':t&&t.anno===756?'756':null; }},      // 24 novembre 2026; dal 394 parte dall'editto del 380, dal 756 dallo Stato della Chiesa
  terre:{d:TERRE, disegna:disegnaTerre, tappe:function(t){ return t.anno===476&&t.intermezzo&&/esercito/i.test(t.titolo); }} };      /* solo nell'intermezzo «L'esercito»: dalla tappa del 439 (Cartagine) l'utente l'ha fatta togliere il 24 novembre 2026 */
/* Poitiers: accesa il 24 novembre 2026 sulla tappa del 711, dopo le prove a 393, 1280 e 812x375 e con ?fermo=1 (prima era scritta ma spenta) */
INFO.poitiers={d:POITIERS, disegna:disegnaPoitiers, tappe:function(t){ return t.anno===711&&!t.intermezzo; }};
var ORDINE=['valeriano','moneta','milvio','cristianesimo','navi','adrianopoli','altare','sacco','terre','barbari','catalaunici','sacchi','capobon','governo','acquedotti','pantheon','curia','poitiers','roma'];      // in ordine di storia, secondo la prima tappa in cui compaiono (260, 284, 312, 330, 395, 410, 439, 476, 609, 630, 711; «Roma si svuota» resta in fondo, come chiesto); riordinate il 23 novembre 2026 su richiesta dell'utente, con le tre nuove (ponte Milvio, Pantheon, Curia) aggiunte lo stesso giorno
var ICO={ play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
  pausa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor"/></svg>',
  prima:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 6.5v11l-8.5-5.5z" fill="currentColor"/></svg>',
  dopo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 6.5v11l8.5-5.5z" fill="currentColor"/></svg>',
  rivedi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12a6.5 6.5 0 1 0 2-4.7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6.6 3.6v4.6h4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chiudi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' };
/* le icone degli inviti: una per infografica */
var GLIFI={ valeriano:'<path d="M7 12l2.2-5 2.6 3 2.2-4 2.2 4 2.6-3 2.2 5z"/><rect x="7" y="13" width="14" height="2.2" rx=".6"/><path d="M9 18.5h10" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/><circle cx="8" cy="18.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="18.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  roma:'<circle cx="9" cy="10" r="2.2"/><circle cx="15" cy="8" r="2.2"/><circle cx="20" cy="13" r="2.2"/><circle cx="12" cy="16" r="2.2"/><circle cx="18" cy="19" r="2.2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="20" r="2.2" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  terre:'<rect x="4" y="5" width="11" height="10" rx="1"/><rect x="16.5" y="5" width="7.5" height="5" rx="1" opacity=".55"/><rect x="16.5" y="11.5" width="7.5" height="3.5" rx="1"/><rect x="4" y="16.5" width="7" height="6.5" rx="1" opacity=".55"/><rect x="12.5" y="16.5" width="11.5" height="6.5" rx="1" opacity=".3"/>',
  moneta:'<circle cx="14" cy="14" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="14" cy="14" r="6.6" opacity=".55"/>',
  sacco:'<path d="M14 4c1 4 6 6 6 11.5a6 6 0 0 1-12 0c0-3 1.6-4.6 3-6 .3 2 1.2 3 2.2 3.2C12.6 10 13 7 14 4z"/>',
  navi:'<path d="M5 19q2 4 9 4t9-4z"/><path d="M13.5 5v13" stroke="currentColor" stroke-width="1.4"/><path d="M8 7h11q1 5 0 9H8q-1-4 0-9z" opacity=".8"/>',
  milvio:'<path d="M3 13.5h22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.5 13.5v-2.2a3.8 3.8 0 0 1 7.6 0v2.2M14.9 13.5v-2.2a3.8 3.8 0 0 1 7.6 0v2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 18.5q2.5-1.6 5 0t5 0 5 0 5 0M6 22.5q2.5-1.6 5 0t5 0 5 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7"/><path d="M14 2.5v7M11.2 5h5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  pantheon:'<path d="M5 12.5a9 7 0 0 1 18 0z"/><rect x="4" y="13.5" width="20" height="2" rx=".5"/><path d="M6.5 16.5v6M10 16.5v6M13.5 16.5v6M17 16.5v6M20.5 16.5v6" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="23" width="21" height="1.8" rx=".5"/><circle cx="14" cy="5.6" r="1.2" fill="none" stroke="currentColor" stroke-width="1"/>',
  curia:'<path d="M6 10.5L14 4l8 6.5z"/><rect x="6.5" y="11.5" width="15" height="12" rx=".6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.2 14.5v2.5M14 14.5v2.5M18.8 14.5v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="12" y="18.3" width="4" height="5.2" rx=".4"/><path d="M4.5 24.2h19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  adrianopoli:'<g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="14" cy="14" r="8.5" stroke-dasharray="3.2 1.6"/></g><path d="M3 21l5.5-3.2v6.4z"/><path d="M14 9.5l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" opacity=".85"/>',
  catalaunici:'<path d="M3 22c4-7 8-10 11-10s7 3 11 10z" opacity=".55"/><path d="M7 17.5l4-4M7 13.5l4 4M17 17.5l4-4M17 13.5l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 4.5l1.6 3.4 3.4.4-2.5 2.3.7 3.4-3.2-1.8-3.2 1.8.7-3.4-2.5-2.3 3.4-.4z"/>',
  capobon:'<path d="M4 18.5h20l-3.2 4.5H7.2z"/><path d="M14 4v13" stroke="currentColor" stroke-width="1.5"/><path d="M14.8 5.5c4 2 5.5 5.5 5.5 9.5h-5.5z" opacity=".8"/><path d="M9.5 7c1 3 3.6 4 3.6 7.6a3.6 3.6 0 0 1-7.2 0c0-2 1-3 1.9-3.9.3 1.2.8 1.9 1.4 2 0-2.4.3-4.2.3-5.7z"/>',
  altare:'<path d="M14 3.5c.9 3 4 4.2 4 7.6a4 4 0 0 1-8 0c0-2 1-3 2-4 .2 1.3.8 2 1.4 2.2-.1-2.2.1-4 .6-5.8z"/><rect x="8" y="15" width="12" height="2.4" rx=".6"/><rect x="9.5" y="17.4" width="9" height="5" rx=".4" opacity=".8"/><rect x="7.5" y="22.4" width="13" height="2.2" rx=".6"/>',
  sacchi:'<rect x="3" y="6" width="6" height="16" rx="1.2"/><rect x="11" y="6" width="6" height="16" rx="1.2" opacity=".75"/><rect x="19" y="6" width="6" height="16" rx="1.2" opacity=".5"/><path d="M6 4.5c.5 1.6 2 2.2 2 4a2 2 0 0 1-4 0c0-1 .5-1.5 1-2 .1.6.4 1 .7 1.1 0-1.1.1-2.1.3-3.1z" fill="#F1D99A"/>',
  barbari:'<path d="M3 7c3 1 4 4 3 7s0 6 3 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".55"/><path d="M9 10h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 10l-5-3.4v6.8z"/><path d="M9 16h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 16l-5-3.4v6.8z"/><path d="M9 22h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M25 22l-5-3.4v6.8z"/>',
  acquedotti:'<path d="M2 9h24v3H2z"/><path d="M4 12v11h3v-5a3 3 0 0 1 6 0v5h2v-5a3 3 0 0 1 6 0v5h3V12z" opacity=".8"/><path d="M2 7.2h24" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.5 2"/>',
  governo:'<path d="M4 8l6-3 8 3 6-3v15l-6 3-8-3-6 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 5v15M18 8v15" stroke="currentColor" stroke-width="1.2" opacity=".6"/>' };
GLIFI.cristianesimo='<path d="M14 3v22M8.5 9.5h11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M3 25h22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="4" y="18" width="5" height="7" rx=".6" opacity=".45"/><rect x="19" y="16" width="5" height="9" rx=".6" opacity=".45"/>';      /* la croce che sale fra due edifici */
GLIFI.poitiers='<path d="M4.5 5v8M10 5v8M15.5 5v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4.5" cy="15.5" r="3.4"/><circle cx="10" cy="15.5" r="3.4"/><circle cx="15.5" cy="15.5" r="3.4" opacity=".8"/><path d="M18.5 23.5l4.2-9 4.2 9z" opacity=".6"/><path d="M21.6 23.5l1.1-2.6 1.1 2.6z" fill="#fff" opacity=".7"/><path d="M2 23.8h24" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';      /* il muro di scudi e una tenda vuota */

/* ---------- la finestra ---------- */
var dlg=null, raf=0, sgancia=null, ctl=null;
function bottone(c,ico,et,p){ var b=h('button',c,null,p); b.type='button'; b.innerHTML=ico; b.setAttribute('aria-label',et); b.title=et; return b; }
function apri(chi,tp){
  var I=INFO[chi]; if(!I) return; chiudi();
  if(!tp&&window.RM_pagina&&RM_pagina.tappa) tp=(D.TAPPE||[])[RM_pagina.tappa()];      // la tappa da cui si apre: alcune infografiche partono da un altro punto (I.da)
  var ritorno=document.activeElement, n=ORDINE.indexOf(chi)+1;
  dlg=h('dialog','ig-finestra ig-'+chi+(I.d.notte?' ig-notte':'')+(POCO?' ig-fermo':''),null,document.body); dlg.setAttribute('aria-labelledby','igTitolo');
  var corpo=h('div','ig-corpo',null,dlg), testa=h('header','ig-testa',null,corpo), tt=h('div','ig-testa-t',null,testa);
  h('p','ig-occhiello','Infografica animata · '+n+' di '+ORDINE.length,tt); var ti=h('h2','ig-titolo',I.d.titolo,tt); ti.id='igTitolo';
  var bx=bottone('ig-chiudi',ICO.chiudi,'Chiudi l\'infografica',testa);
  var palco=h('div','ig-palco',null,corpo), svg=el('svg',{'class':'ig-grafico',role:'img','aria-label':I.d.titolo+'. '+I.d.sotto},palco);
  var cop=h('div','ig-copertina gira',null,palco); cop.setAttribute('aria-hidden','true');
  h('span','ig-cop-occh','Infografica '+n+' di '+ORDINE.length,cop); h('span','ig-cop-tit',I.d.titolo,cop); h('span','ig-cop-filo',null,cop); h('span','ig-cop-sotto',I.d.sotto,cop);
  var lato=h('div','ig-lato',null,corpo), frase=h('p','ig-frase',null,lato); frase.setAttribute('aria-live','polite');
  var fA=h('span','ig-frase-anno','',frase), fT=h('span','ig-frase-testo',I.d.sotto,frase);
  var comandi=h('div','ig-comandi',null,lato), bP=bottone('ig-b ig-b-play',ICO.pausa,'Pausa',comandi), bI=bottone('ig-b',ICO.prima,'Momento precedente',comandi);
  var sc=h('div','ig-scorri',null,comandi), rng=h('input',null,null,sc); rng.type='range'; rng.min=0; rng.max=1000; rng.step=1; rng.value=0; rng.setAttribute('aria-label','Punto dell\'animazione');
  var tac=h('div','ig-tacche',null,sc); tac.setAttribute('aria-hidden','true');
  var bA=bottone('ig-b',ICO.dopo,'Momento successivo',comandi), bR=bottone('ig-b',ICO.rivedi,'Rivedi dall\'inizio',comandi);
  var fonte=h('p','ig-fonte',null,lato); h('b',null,'Fonti e avvertenze. ',fonte); fonte.appendChild(document.createTextNode(I.d.fonte));
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
  var S=null, W=0, H=0, t=0, vivo=!POCO, prima=0, fraseOra=null;
  function costruisci(){
    svg.textContent=''; [].slice.call(dlg.querySelectorAll('.ig-strato,.ig-fuori')).forEach(function(x){ x.remove(); });
    var r=palco.getBoundingClientRect(); W=Math.max(200,Math.round(r.width)); H=Math.max(200,Math.round(r.height)); svg.setAttribute('viewBox','0 0 '+W+' '+H);
    S={battute:[],dura:1000,passo:function(){},ferma:function(){ if(vivo) ferma(); },strato:function(c,sotto){ var d=h('div','ig-strato '+c); palco.insertBefore(d,sotto?svg:cop); return d; },
      fuori:function(c){ var d=h('div','ig-fuori '+c); lato.insertBefore(d,comandi.nextSibling); return d; }};      // fuori dal palco, nella colonna del testo
    I.disegna(svg,S,W,H); nomiInCima(svg); scansaNomi(svg);
    tac.textContent=''; S.battute.forEach(function(b){ h('i',null,null,tac).style.left=(b.t/S.dura*100).toFixed(2)+'%'; });
  }
  function mostra(){
    S.passo(t); var cv=t>1150; if(cop._v!==cv){ if(!cv){ cop.classList.remove('gira'); void cop.offsetWidth; cop.classList.add('gira'); } cop._v=cv; } cls(cop,'via',cv);
    var b=null; S.battute.forEach(function(x){ if(t>=x.t) b=x; });
    var ch=b?b.anno+'|'+b.testo:'';
    if(ch!==fraseOra){ fraseOra=ch; fA.textContent=b?b.anno:''; fT.textContent=b?b.testo:I.d.sotto; frase.classList.remove('entra'); void frase.offsetWidth; frase.classList.add('entra'); }
    var p=S.dura?t/S.dura:0; rng.value=Math.round(p*1000); rng.style.setProperty('--p',(p*100).toFixed(2)+'%'); rng.setAttribute('aria-valuetext',b?b.anno+': '+b.testo:I.d.sotto);
  }
  function segna(){ var fine=t>=S.dura; bP.innerHTML=vivo?ICO.pausa:fine?ICO.rivedi:ICO.play; var et=vivo?'Pausa':fine?'Rivedi dall\'inizio':'Riprendi'; bP.setAttribute('aria-label',et); bP.title=et; cls(dlg,'in-pausa',!vivo&&!fine); }
  function va(ora){ raf=0; if(!vivo||!dlg) return; var dt=prima?Math.min(64,ora-prima):16; prima=ora; t=Math.min(S.dura,t+dt); mostra(); if(t>=S.dura){ vivo=false; segna(); return; } raf=requestAnimationFrame(va); }
  function parti(){ if(t>=S.dura){ t=0; fraseOra=null; } vivo=true; prima=0; segna(); if(!raf) raf=requestAnimationFrame(va); }
  function ferma(){ vivo=false; segna(); }
  function subito(f){ palco.classList.add('subito'); f(); void palco.offsetWidth; palco.classList.remove('subito'); }
  function salta(d){ var bs=S.battute, i=-1; bs.forEach(function(x,j){ if(t>=x.t-1) i=j; }); var j=d>0?i+1:(i>=0&&t-bs[i].t>1500?i:i-1);
    t=j<0?0:j>=bs.length?S.dura:bs[j].t; if(t>=S.dura){ vivo=false; } mostra(); segna(); if(vivo&&!raf){ prima=0; raf=requestAnimationFrame(va); } }
  bP.addEventListener('click',function(){ if(vivo) ferma(); else parti(); });
  bR.addEventListener('click',function(){ t=0; fraseOra=null; subito(mostra); parti(); });
  bI.addEventListener('click',function(){ salta(-1); }); bA.addEventListener('click',function(){ salta(1); });
  rng.addEventListener('input',function(){ t=rng.value/1000*S.dura; subito(mostra); if(t>=S.dura){ vivo=false; } segna(); });
  bx.addEventListener('click',chiudi); dlg.addEventListener('cancel',function(e){ e.preventDefault(); chiudi(); });
  dlg.addEventListener('click',function(e){ if(e.target===dlg) chiudi(); });
  dlg.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'||e.key==='ArrowLeft') e.stopPropagation();      // le frecce non devono cambiare anche la tappa della pagina, dietro la finestra
    if(e.target===rng||e.altKey||e.ctrlKey||e.metaKey) return;
    if(e.key==='ArrowRight'){ e.preventDefault(); salta(1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); salta(-1); }
    else if((e.key===' '||e.key==='k') && e.target.tagName!=='BUTTON'){ e.preventDefault(); if(vivo) ferma(); else parti(); } });
  var rt=0; function suMisura(){ clearTimeout(rt); rt=setTimeout(function(){ if(!dlg) return; var r=palco.getBoundingClientRect(); if(Math.abs(r.width-W)>6||Math.abs(r.height-H)>6) subito(function(){ costruisci(); mostra(); }); },160); }
  var ro=window.ResizeObserver?new ResizeObserver(suMisura):null; if(ro) ro.observe(palco); else window.addEventListener('resize',suMisura);      // anche quando cambia solo il palco (caratteri, barre del telefono)
  sgancia=function(){ if(ro) ro.disconnect(); else window.removeEventListener('resize',suMisura); clearTimeout(rt); try{ if(ritorno&&ritorno.focus) ritorno.focus(); }catch(e){} };
  ctl={vai:function(f){ ferma(); t=clamp(f,0,1)*S.dura; subito(mostra); segna(); }};
  costruisci();
  if(POCO){ t=S.dura; subito(mostra); comandi.hidden=true; var ul=h('ol','ig-elenco',null,lato); lato.insertBefore(ul,fonte);
    S.battute.forEach(function(b){ var li=h('li',null,null,ul); h('b',null,String(b.anno),li); li.appendChild(document.createTextNode(' '+b.testo)); });
    if(S.fermo) lato.insertBefore(S.fermo(lato),fonte); frase.hidden=true; bx.focus(); }
  else { var da=I.da&&I.da(tp), bd=da&&S.battute.filter(function(x){ return x.anno===da; })[0]; if(bd) t=Math.max(0,bd.t-300);
    mostra(); bP.focus(); raf=requestAnimationFrame(va); }
}
function chiudi(){ if(raf) cancelAnimationFrame(raf); raf=0; ctl=null; scattiTok++; if(dlg){ var d=dlg; dlg=null; try{ d.close(); }catch(e){} d.remove(); if(sgancia){ var s=sgancia; sgancia=null; s(); } } }

/* il bottone sotto il testo della tappa */
var posto=document.getElementById('tDaLeggere'), box=null;
if(posto){ box=document.createElement('div'); box.className='ig-inviti'; box.hidden=true; posto.parentNode.insertBefore(box,posto); }
function inviti(i,t){
  if(!box) return; box.textContent=''; var ci=Object.keys(INFO).filter(function(k){ return INFO[k].tappe(t); }); box.hidden=!ci.length;
  ci.forEach(function(k){ var b=h('button','ig-invito ig-inv-'+k,null,box); b.type='button';
    var ic=h('span','ig-inv-icona',null,b); ic.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true" fill="currentColor">'+GLIFI[k]+'</svg>';
    var s=h('span','ig-testi',null,b); h('span','ig-inv-occh','Infografica animata',s); h('b',null,INFO[k].d.titolo,s); h('span','ig-inv-sotto','Guarda in un minuto',s);
    h('span','ig-play',null,b).innerHTML=ICO.play; b.addEventListener('click',function(){ apri(k,t); }); });
}
if(window.RM_pagina && box){ RM_pagina.quando(inviti); var T0=(D.TAPPE||[])[RM_pagina.tappa()]; if(T0) inviti(RM_pagina.tappa(),T0); }      // anche la tappa aperta all'avvio
/* per le prove: vai(f) ferma l'animazione aperta e la porta alla frazione f (da 0 a 1); ?info=<roma|terre|moneta|sacco|navi|governo|valeriano|milvio|pantheon|curia|adrianopoli|catalaunici|capobon|altare|sacchi|acquedotti|barbari|poitiers>&infop=<0..1> la apre da sola */
window.RM_infografiche={apri:apri, chiudi:chiudi, vai:function(f){ if(ctl) ctl.vai(f); }};
(function(){ var q=/[?&]info=(\w+)/.exec(location.search), f=/[?&]infop=([\d.]+)/.exec(location.search); if(!q||!INFO[q[1]]) return;
  setTimeout(function(){ apri(q[1]); if(f) setTimeout(function(){ RM_infografiche.vai(+f[1]); },300); },900); })();
})();
