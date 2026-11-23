/* Infografiche animate (23 novembre 2026; l'utente: «per le infografiche animate inizia dalla 1 e segui fino alla 6»; proposta in src/proposte/infografiche-animate.md).
   Rifatte lo stesso giorno («alza nettamente la qualità... voglio che dici WOW»): ognuna è una breve regia a fasi, non più una sola linea che avanza.
   Si apre da un bottone nelle tappe a cui appartiene, in una finestra (<dialog>): copertina, apertura d'effetto, soste sugli eventi con note accanto ai punti,
   numeri che contano verso il valore, un finale che riassume. Pausa, momento precedente e successivo, cursore, rivedi, chiudi (anche con Esc).
   Il disegno si fa in pixel veri: il viewBox è grande quanto il riquadro, così le scritte non rimpiccioliscono sul telefono; sotto i 600 punti e sui telefoni coricati
   l'impaginazione cambia (verticale o con la colonna di testo a destra). Con «Riduci movimento» il grafico è già completo e le frasi stanno in elenco; ?moto=1 forza l'animazione, ?fermo=1 la versione ferma.
   I dati vengono da js/dati.js (CURVE, TAPPE, CAMBI) e dalla carta (RM_mappa, RM_MAPPA, RM_TOPO): nessun numero nuovo. Le etichette brevi delle note (terzo elemento dei momenti)
   riassumono la frase accanto, senza aggiungere fatti. */
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
function largo(t){ try{ return t.getComputedTextLength(); }catch(e){ return (t.textContent||'').length*7; } }
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
   (la «banda»). I punti stanno dentro il tracciato delle mura di Aureliano del modello (RM_TOPO, da OpenStreetMap), che si disegnano nel 271; l'ordine in cui si spengono è
   casuale: dove si vivesse non è un dato di questo grafico. Accanto, la curva con la forchetta delle stime e le note sugli eventi delle tappe. */
var ROMA={ titolo:'Roma si svuota', sotto:'Gli abitanti di Roma dal 235 all\'852, secondo le stime',
  momenti:[[271,"Aureliano fa costruire le nuove mura: diciannove chilometri.","Le mura di Aureliano"],[410,"I Goti di Alarico saccheggiano Roma per tre giorni.","Il sacco dei Goti"],
    [419,"Le razioni di carne di maiale fanno stimare circa mezzo milione di abitanti.","Le razioni di carne"],
    [455,"I Vandali saccheggiano Roma per quattordici giorni.","Il sacco dei Vandali"],[476,"Deposto Romolo Augustolo, a Roma il Senato continua a riunirsi.","Deposto Romolo Augustolo"],
    [537,"I Goti tagliano tutti gli acquedotti: le terme non possono più funzionare.","Tagliati gli acquedotti"],
    [546,"Totila entra a Roma e la fa evacuare.","Totila fa evacuare Roma"],[590,"Peste e piena del Tevere: Gregorio Magno diventa papa.","Peste e piena del Tevere"],
    [663,"Costante II porta via il bronzo dei monumenti.","Via il bronzo dei monumenti"],
    [780,"Papa Adriano I fa riparare quattro acquedotti.","Riparati quattro acquedotti"],[846,"I Saraceni saccheggiano San Pietro, fuori dalle mura.","I Saraceni a San Pietro"]],
  fonte:"Stime: Krautheimer, Durliat, il Companion to Rome del 2026 e gli altri studi citati in fondo alla pagina. La linea è una media fra le stime; la fascia chiara va dalla più bassa alla più alta. Prima del VI secolo i numeri vengono soprattutto dalle razioni di cibo; dopo, quasi solo dall'archeologia. Nella città ogni punto pieno vale 10.000 abitanti della linea centrale, i cerchi vuoti arrivano alla stima più alta; dove cadano i punti non ha significato." };

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
  var sem=semina(muraP,fiume,120,11), rr=Math.max(2.4,Math.min(5.5,sem.d*0.31));
  var punti=sem.p.map(function(p){ return el('circle',{cx:r1(p[0]),cy:r1(p[1]),r:r1(rr),'class':'ig-ab'},gc); }), statoP=[];
  var lg=el('g',{'class':'ig-citta-leg'},gc), lx=oriz?cb[0]+12:cb[0]+s+6, ly=oriz?cb[1]+s-30:cb[1]+s-58;
  el('circle',{cx:lx+rr,cy:ly-4,r:rr,'class':'ig-ab pieno fisso'},lg); tx(lg,lx+rr*2+7,ly,'ig-leg','10.000 abitanti');
  el('circle',{cx:lx+rr,cy:ly+16,r:rr,'class':'ig-ab vuoto fisso'},lg);
  if(oriz) tx(lg,lx+rr*2+7,ly+20,'ig-leg','fino alla stima più alta'); else { tx(lg,lx+rr*2+7,ly+20,'ig-leg','fino alla stima'); tx(lg,lx+rr*2+7,ly+35,'ig-leg','più alta'); }

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
    for(var i=0;i<punti.length;i++){ var st=t<T0+150+i*9?'':i<nC?'pieno':i<nH?'vuoto':''; if(statoP[i]!==st){ statoP[i]=st; punti[i].setAttribute('class','ig-ab '+st); } }
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
   Il mosaico dell'Occidente: un tassello per ogni regione della carta di questa pagina, grande quanto la sua superficie (peso in RM_MAPPA), raggruppato per grandi aree
   e colorato come la carta, tappa per tappa dal 395 al 476 (CAMBI). Il numero è RM_mappa.territorio: federati e contesi a metà fino al 480. Sui tasselli l'anno della tappa
   in cui la regione esce dal governo di Roma. La tesi delle entrate perdute con le province è quella di «Perché cadde» (Wickham, Heather): qui non si aggiungono numeri sulle tasse. */
var TERRE={ titolo:"Senza soldi non c'è esercito", sotto:"La parte dell'Occidente governata da Roma, dal 395 al 476, misurata sulla carta",
  momenti:[[406,"Vandali, Alani e Svevi passano il Reno: la Gallia sfugge di mano."],[409,"La Britannia si difende da sola; i barbari entrano in Spagna."],[418,"I Visigoti si stabiliscono in Aquitania come alleati."],
    [429,"I Vandali passano in Africa."],[439,"Cartagine cade: per molti storici è la perdita di entrate più grave."],[455,"I Vandali saccheggiano Roma."],[468,"Fallisce l'ultima spedizione per riprendere l'Africa."],[476,"Odoacre depone Romolo Augustolo."]],
  fonte:"Percentuale misurata sulla carta di questa pagina: le regioni dei federati e quelle contese contano per metà. Ogni tassello è una regione della carta, grande quanto la sua superficie; i colori sono quelli della carta, l'anno è la tappa in cui la regione esce dal governo di Roma. Meno terre voleva dire meno tasse per pagare l'esercito: è la tesi di Wickham e di Heather, che trovi in «Perché cadde l'Occidente?»." };
var GRUPPI=[['Britannia',['britannia','galles']],['Gallie',['gallia','bretagna','belgica','soissons','aquitania','alvernia','provenza','settimania','burgundia','sapaudia']],
  ['Hispania',['hispania','baleari','gallaecia','asturie','marca','spania']],
  ['Italia e isole|Italia',['italia_nord','liguria','venezia','ravenna','bolognese','spoleto','pentapoli','roma','campania','napoli','benevento','salento','otranto','calabria','bruzio','sicilia','sardegna','corsica']],
  ['Alpi e Danubio|Danubio',['rezia','carantania','pannonia','dalmazia','decumati']],['Africa',['africa','numidia','mauri','mauretania']]];
function disegnaTerre(svg,S,W,H){
  var M=window.RM_mappa, G=window.RM_MAPPA; if(!M||!M.territorio||!G) return;
  var T=(D.TAPPE||[]).filter(function(t){ return t.regioni && !t.intermezzo && t.anno>=395 && t.anno<=476; });
  var P=T.map(function(t){ return {anno:t.anno,stati:t.regioni,v:M.territorio(t.regioni,t.anno)}; }), ultimo=P.length-1;
  var colori={}; (M.vociPresenti?M.vociPresenti(P.map(function(p){ return p.stati; }),476):[]).forEach(function(v){ colori[v[2]]=v[0]; });
  var ovest=Object.keys(G.regioni).filter(function(id){ return !G.regioni[id].est && !G.regioni[id].oltre; }), messi={};
  var gruppi=GRUPPI.map(function(g){ var ids=g[1].filter(function(id){ return ovest.indexOf(id)>=0; }); ids.forEach(function(id){ messi[id]=1; }); return {nome:g[0],ids:ids}; });
  var altri=ovest.filter(function(id){ return !messi[id]; }); if(altri.length) gruppi.push({nome:'Altre',ids:altri});
  gruppi.forEach(function(g){ g.v=0; g.ids.forEach(function(id){ g.v+=G.regioni[id].peso; }); }); gruppi=gruppi.filter(function(g){ return g.v>0; }).sort(function(a,b){ return b.v-a.v; });
  var oriz=W/H>=1.15, pad=14, tb, kb, sb, lb, fsN;
  /* quanto spazio vuole la legenda, sotto il mosaico: si stima la tappa con più voci */
  function vociOvest(p){ var ci={}; ovest.forEach(function(id){ ci[p.stati[id]||'perso']=1; }); return (M.vociPresenti?M.vociPresenti([p.stati],p.anno):[]).filter(function(v){ return ci[v[2]]; }); }
  var legH=0, prova=S.strato('ig-legenda in-riga vis'); prova.style.cssText='left:0;top:0;visibility:hidden;width:'+(W-2*pad)+'px';      // si misura davvero la legenda più lunga
  P.forEach(function(p){ prova.textContent=''; vociOvest(p).forEach(function(v){ var c=h('span','ig-chip',null,prova); h('i',null,null,c); h('span',null,v[1],c); }); legH=Math.max(legH,prova.offsetHeight+10); }); prova.remove();
  if(oriz){ var tw=Math.round(W*(W>800?0.6:0.56)); tb=[pad,pad,tw-pad,H-2*pad-legH]; var x0=tw+24; kb=[x0,pad,W-x0-pad]; fsN=Math.min(66,kb[2]/3.4,H*0.17);
    var st=pad+20+fsN*.84+24+17+22; sb=[x0,st+8,W-x0-pad,Math.max(40,H-pad-legH-(st+8)-26)]; }
  else { fsN=Math.min(44,W/8); kb=[pad,6,W-2*pad]; sb=[W*0.56,6,W*0.44-pad,24]; tb=[pad,76,W-2*pad,H-76-legH-4]; }
  lb=[pad,H-legH+2,W-2*pad,legH-4];
  var defs=el('defs',null,svg), pt=el('pattern',{id:'ig-trama',width:7,height:7,patternUnits:'userSpaceOnUse',patternTransform:'rotate(40)'},defs);
  el('rect',{width:7,height:7,fill:'#DCD0B8'},pt); el('rect',{width:3.2,height:7,fill:'#9A2F2A'},pt);
  /* il mosaico */
  squarify(gruppi,tb[0],tb[1],tb[2],tb[3]);
  var gt=el('g',{'class':'ig-mosaico'},svg), gl=el('g',{'class':'ig-luci'},svg), gx=el('g',{'class':'ig-mosaico-testi'},svg), tessere=[], ord=0;
  gruppi.forEach(function(gr){
    var r=gr.r, x=r[0]+2, y=r[1]+2, w=r[2]-4, hh=r[3]-4;
    var voci=gr.ids.map(function(id){ return {id:id,v:G.regioni[id].peso}; }).sort(function(a,b){ return b.v-a.v; });
    squarify(voci,x,y,w,hh);
    var gn=null, gb2=null;
    if(w>56 && hh>26){ var nomi=gr.nome.split('|'); for(var z=0;z<nomi.length && !gn;z++){ gn=tx(gx,x+7,y+16,'ig-gr-nome',nomi[z].toUpperCase()); if(largo(gn)>w-12){ gn.remove(); gn=null; } } if(gn) gb2=[x,y,x+12+largo(gn),y+22]; }
    voci.forEach(function(it,j){ var q=it.r, at={x:r1(q[0]+.7),y:r1(q[1]+.7),width:r1(Math.max(0,q[2]-1.4)),height:r1(Math.max(0,q[3]-1.4))};
      var rect=el('rect',at,gt); rect.setAttribute('class','ig-tes'); rect.style.transitionDelay=(j*40)+'ms, '+(j*40)+'ms, 0ms, 0ms';
      at['class']='ig-tes-luce'; var luce=el('rect',at,gl);
      var j0=-1, cambi=[]; for(var p=1;p<P.length;p++){ var a=P[p-1].stati[it.id]||'perso', b=P[p].stati[it.id]||'perso'; if(a!==b) cambi.push(p); if(j0<0 && a==='roma' && b!=='roma') j0=p; }
      var nome=null, anno=null;
      if(q[2]>=(oriz?80:66) && q[3]>=30){ nome=tx(gx,q[0]+7,q[1]+q[3]-8,'ig-tes-nome',G.regioni[it.id].nome); if(largo(nome)>q[2]-14){ nome.remove(); nome=null; } }
      var sopraNome=gb2 && q[0]+q[2]-40<gb2[2] && q[1]<gb2[3];
      if(j0>0 && q[2]>=32 && q[3]>=19 && !sopraNome) anno=tx(gx,q[0]+q[2]-5,q[1]+14,'ig-tes-anno',String(P[j0].anno),'end');
      tessere.push({id:it.id,rect:rect,luce:luce,nome:nome,anno:anno,j0:j0,cambi:cambi,ord:ord++,st:null,vis:null}); });
  });
  /* il contatore */
  var gk=el('g',{'class':'ig-conta'},svg), tA, tN, tL;
  if(oriz){ tA=tx(gk,kb[0],kb[1]+14,'ig-k-anno',''); tN=tx(gk,kb[0],kb[1]+20+fsN*.84,'ig-k-num',''); tL=el('text',{x:kb[0],y:kb[1]+20+fsN*.84+24,'class':'ig-k-lab'},gk); }
  else { tA=tx(gk,kb[0],kb[1]+13,'ig-k-anno',''); tN=tx(gk,kb[0],kb[1]+16+fsN*.9,'ig-k-num',''); tL=el('text',{x:kb[0],y:kb[1]+16+fsN*.9+16,'class':'ig-k-lab'},gk); }
  tN.style.fontSize=fsN+'px';
  function etichetta(fine){ tL.textContent=''; var s=fine?"dell'Occidente nel 476 · era il "+Math.round(P[0].v)+'% nel 395':"dell'Occidente governato da Roma";
    if(!oriz){ var n=avvolgi(tL,fine?'nel 476 · era il '+Math.round(P[0].v)+'% nel 395':'governato da Roma',W-pad-(kb[0]+fsN*2.3+10),16); tL.setAttribute('y',r1(kb[1]+16+fsN*.9-4-(n-1)*16)); [].forEach.call(tL.childNodes,function(q){ q.setAttribute('x',tL.getAttribute('x')); }); return; }
    avvolgi(tL,s,kb[2],17); }
  if(!oriz) tL.setAttribute('x',r1(kb[0]+fsN*2.3+10));
  etichetta(false);
  /* la curva a gradini */
  var gs=el('g',{'class':'ig-spia'},svg), sx=function(a){ return sb[0]+(a-395)/(476-395)*sb[2]; }, sy=function(v){ return sb[1]+(1-v/100)*sb[3]; };
  (oriz?[0,50,100]:[0,100]).forEach(function(v){ el('line',{x1:sb[0],x2:sb[0]+sb[2],y1:r1(sy(v)),y2:r1(sy(v)),'class':v?'ig-griglia':'ig-base'},gs); if(oriz&&v) tx(gs,sb[0],sy(v)-4,'ig-asse',v+'%'); });
  if(oriz){ [395,439,476].forEach(function(a,i){ tx(gs,sx(a),sb[1]+sb[3]+15,'ig-asse',String(a),i?i===2?'end':'middle':'start'); }); }
  var d='M'+r1(sx(P[0].anno))+' '+r1(sy(P[0].v)); for(var i=1;i<P.length;i++) d+=' H'+r1(sx(P[i].anno))+' V'+r1(sy(P[i].v));
  var cid=el('clipPath',{id:'ig-rv2'},defs), cR=el('rect',{x:sb[0]-4,y:sb[1]-10,width:0,height:sb[3]+20},cid);
  var gsd=el('g',{'clip-path':'url(#ig-rv2)'},gs); el('path',{d:d+' V'+r1(sy(0))+' H'+r1(sx(395))+' Z','class':'ig-fascia'},gsd); el('path',{d:d,'class':'ig-linea sottile'},gsd);
  var cur=el('circle',{r:4.5,'class':'ig-cur-punto vis'},gs);
  /* la legenda, in HTML perché vada a capo */
  var leg=S.strato('ig-legenda in-riga'); leg.style.left=lb[0]+'px'; leg.style.top=lb[1]+'px'; leg.style.width=lb[2]+'px'; leg.style.maxHeight=lb[3]+'px';
  function legenda(j){ leg.textContent=''; vociOvest(P[j]).forEach(function(v){ var c=h('span','ig-chip',null,leg); h('i',null,null,c).style.background=v[0]; h('span',null,v[1],c); }); }
  /* la regia */
  var mom={}; TERRE.momenti.forEach(function(m){ mom[m[0]]=m[1]; });
  var T0=1250, tm=Tempo(395,P.slice(1).map(function(p){ return {anno:p.anno,sosta:mom[p.anno]?2300:520}; }),{inizio:2800,vel:20,min:450});
  function arrivo(j){ return j?tm.arrivi[j-1]:T0; }
  var tFin=tm.arrivi[ultimo-1]+2300, visto=-1, finVisto=null;
  S.passo=function(t){
    var j=0; for(var i=1;i<P.length;i++) if(t>=tm.arrivi[i-1]) j=i;
    var a=tm.anno(t), v=j?lerp(P[j-1].v,P[j].v,E.out(fase(t,arrivo(j),arrivo(j)+850))):P[0].v*E.out(fase(t,T0+100,T0+1500));
    cls(gk,'vis',t>=T0); scrivi(tA,'OCCIDENTE · '+Math.round(a)); scrivi(tN,Math.round(v)+'%');
    if(j!==visto){ visto=j; legenda(j); }
    var fine=t>=tFin; if(fine!==finVisto){ finVisto=fine; etichetta(fine); }
    tessere.forEach(function(q){ var st=P[j].stati[q.id]||'perso', base=st.indexOf('regno:')===0?'regno':st, vis=t>=T0+80+q.ord*16;
      if(q.st!==st||q.vis!==vis){ q.st=st; q.vis=vis; q.rect.setAttribute('class','ig-tes '+base+(vis?' vis':'')); q.rect.style.color=st.indexOf('regno:')===0&&colori[st]?colori[st]:''; }
      cls(q.luce,'vis',q.cambi.indexOf(j)>=0 && t<arrivo(j)+1900); if(q.anno) cls(q.anno,'vis',q.j0<=j && vis); if(q.nome) cls(q.nome,'vis',vis); });
    cls(gx,'vis',t>=T0+700); cls(gs,'vis',t>=T0+500); cls(leg,'vis',t>=T0+900);
    fissa(cR,'width',r1(Math.max(0,sx(a)-sb[0]+5))); fissa(cur,'cx',r1(sx(a))); fissa(cur,'cy',r1(sy(P[j].v)));
  };
  S.dura=tFin+4200;
  S.battute=TERRE.momenti.map(function(m){ var j=0; P.forEach(function(p,i){ if(p.anno===m[0]) j=i; }); return {t:arrivo(j),anno:m[0],testo:m[1]}; });
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
   Una flotta di cento navi da carico (schema di una nave con vela quadra e artemone) sul mare: restano quante ne dicono i relitti datati nel Mediterraneo, con il I secolo
   uguale a 100 (CURVE.commerci: banca dati di Oxford, 2017; Robinson e Wilson 2011). Le navi spente restano come ombre; l'ordine in cui si spengono è casuale.
   I momenti vengono dalle tappe (439, 534, la conquista araba nei passi del 711). */
var NAVI={ titolo:"Le navi scompaiono", sotto:"Relitti datati nel Mediterraneo: per ogni 100 del I secolo, quanti ne restano",
  momenti:[[235,"Nel III secolo i relitti sono già meno della metà di quelli del I secolo."],[439,"I Vandali prendono Cartagine, il grande porto del grano per Roma."],[534,"Belisario riprende l'Africa: il mare torna dell'impero, ma i traffici restano bassi."],
    [642,"Gli Arabi prendono Alessandria; nel 698 anche Cartagine."],[725,"Nell'VIII secolo i relitti sono pochissimi."]],
  fonte:"Banca dati dei relitti di Strauss, Wilson e Flohr (Oxford Roman Economy Project, 2017) e Robinson e Wilson (2011). Si contano le navi trovate e datate, non le merci: navi più grandi, o meno naufragi, cambierebbero il quadro. Ogni nave disegnata vale un relitto su cento; l'ordine in cui si spengono è casuale." };
function disegnaNavi(svg,S,W,H){
  var C=(D.CURVE||{}).commerci; if(!C) return; var P=C.punti;
  var oriz=W/H>=1.15, pad=16, mh=Math.round(H*(oriz?0.68:0.64)), fsN=oriz?Math.min(64,W/12):Math.min(46,W/7.5), kh=oriz?fsN+44:fsN+30;
  var defs=el('defs',null,svg);
  var gm=el('linearGradient',{id:'ig-mare',x1:0,y1:0,x2:0,y2:1},defs); [[0,'#5A8590'],[.45,'#3B6570'],[1,'#22424B']].forEach(function(q){ el('stop',{offset:q[0],'stop-color':q[1]},gm); });
  var gl=el('radialGradient',{id:'ig-mare-luce',cx:'70%',cy:'0%',r:'80%'},defs); el('stop',{offset:0,'stop-color':'#F6E7C6','stop-opacity':.32},gl); el('stop',{offset:1,'stop-color':'#F6E7C6','stop-opacity':0},gl);
  var nv=el('g',{id:'ig-nave'},defs);
  el('ellipse',{cx:0,cy:3.6,rx:17,ry:1.8,fill:'rgba(255,255,255,.14)'},nv);
  el('path',{d:'M-20 -6 Q-17 3 0 3 Q13 3 18 -5 L14 -5.2 Q0 -3.4 -16 -5.4 Z',fill:'#2A1C14'},nv);
  el('path',{d:'M-17 -5.2 Q-23 -12 -18 -16 Q-15 -17.5 -14.6 -14',fill:'none',stroke:'#2A1C14','stroke-width':1.7,'stroke-linecap':'round'},nv);
  el('path',{d:'M-1 -4 V-28 M13.5 -5 L21 -15',stroke:'#2A1C14','stroke-width':1.3,'stroke-linecap':'round'},nv);
  el('path',{d:'M-12 -26 L10 -26 Q12.5 -16 10 -8 L-12 -8 Q-14.5 -16 -12 -26 Z',fill:'#F3EBDC'},nv);
  el('path',{d:'M-12 -26 L10 -26 Q12.5 -16 10 -8 L-1 -8 L-1 -26 Z',fill:'#E2D6BF'},nv);
  el('path',{d:'M-13.5 -26.5 H11.5',stroke:'#2A1C14','stroke-width':1.2,'stroke-linecap':'round'},nv);
  el('path',{d:'M17.5 -14 L23.5 -12.6 L21.6 -7.6 L16.4 -8.6 Z',fill:'#EDE3CF'},nv);
  /* il mare */
  el('rect',{x:0,y:0,width:W,height:mh,fill:'url(#ig-mare)'},svg); el('rect',{x:0,y:0,width:W,height:mh,fill:'url(#ig-mare-luce)'},svg);
  var onde=el('g',{'class':'ig-onde'},svg), R=caso(5);
  for(var o=0;o<9;o++){ var yo=kh*0.6+o*(mh-kh*0.6)/9+R()*8, dd='M-10 '+r1(yo); for(var xo=-10;xo<W+40;xo+=40) dd+=' q10 -'+r1(2+R()*2)+' 20 0 t20 0'; el('path',{d:dd,'class':'ig-onda',style:'opacity:'+r1(.05+o*.012)},onde); }
  /* la flotta: file più piccole in fondo, più grandi davanti */
  var fx0=pad+6, fx1=W-pad-6, fy0=kh+14, fy1=mh-14, aw=fx1-fx0, ah=fy1-fy0, cols=Math.max(8,Math.round(Math.sqrt(100*aw/ah/1.25))), rows=Math.ceil(100/cols);
  while(cols*(rows-1)>=100) rows--;
  var flotta=el('g',{'class':'ig-flotta'},svg), navi=[], file=[], ordine=[], i;
  for(i=0;i<100;i++) ordine.push(i); var R2=caso(29); for(i=99;i>0;i--){ var j=Math.floor(R2()*(i+1)), tmp=ordine[i]; ordine[i]=ordine[j]; ordine[j]=tmp; }
  for(var rw=0;rw<rows;rw++){ var fila=el('g',{'class':'ig-fila'},flotta); fila.style.animationDelay=(-rw*0.47)+'s'; fila.style.animationDuration=(3.1+rw*0.23)+'s'; file.push(fila); }
  var cw=aw/cols, chh=ah/rows, base=Math.min(cw/46,chh/30)*1.0;
  for(i=0;i<100;i++){ var rr=Math.floor(i/cols), cc=i%cols, prof=rows>1?rr/(rows-1):1, sc=base*(0.74+0.34*prof);
    var x=fx0+(cc+.5+(rr%2?.25:-.25))*cw+(R()-.5)*cw*0.28, y=fy0+(rr+.78)*chh+(R()-.5)*chh*0.16;
    var g=el('g',{transform:'translate('+r1(x)+','+r1(y)+') scale('+r1(sc*1000)/1000+')'},file[rr]), u=el('use',{'class':'ig-n'},g); u.setAttribute('href','#ig-nave'); u.setAttributeNS(XL,'xlink:href','#ig-nave');
    var rank=ordine[i]; u.style.transitionDelay=(((rank*37)%23)*28)+'ms'; navi.push({u:u,rank:rank,st:null}); }
  /* il contatore, sul mare */
  var gk=el('g',{'class':'ig-conta chiaro'},svg), tA=tx(gk,pad,pad+12,'ig-k-anno',''), tN=tx(gk,pad,pad+14+fsN*.86,'ig-k-num',''), tS=el('text',{x:pad,y:pad+14+fsN*.86,'class':'ig-k-su'},gk), tL=tx(gk,pad,pad+14+fsN*.86+20,'ig-k-lab','relitti datati, per ogni 100 del I secolo');
  tN.style.fontSize=fsN+'px'; if(!oriz){ tL.setAttribute('y',pad+14+fsN*.86+18); }
  var tPrima=el('text',{x:W-pad,y:pad+12,'class':'ig-k-prima','text-anchor':'end'},gk);
  /* la striscia del tempo, sotto */
  var sb=[pad,mh+14,W-2*pad,H-mh-14-4], c=grafico(svg,sb,{x0:235,x1:852,y0:0,y1:100,tx:sb[2]>520?[235,400,500,600,700,852]:[235,534,852],ty:[0,100],sopra:2,fy:function(v){ return v?'I secolo = 100':''; }});
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
    for(var i=0;i<100;i++){ var q=navi[i], st=t<T0+200+q.rank*11?'':q.rank<(prima?100:Math.round(v))?'su':'via'; if(q.st!==st){ q.st=st; q.u.setAttribute('class','ig-n '+st); } }
    cls(gk,'vis',t>=T0+300); scrivi(tA,prima?'I SECOLO':'ANNO '+Math.round(a)); scrivi(tN,String(nn)); scrivi(tS,' su 100');
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
  fonte:"I colori sono quelli della carta di questa pagina nelle tappe del 395, 476, 568 e 800: confini e attribuzioni delle regioni sono approssimativi, come spiegato in fondo alla pagina. I nomi stanno sulla regione più grande di ciascun regno." };
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
  /* i nomi dei regni: sulla regione più grande, spostati se si toccano */
  var nomiF=FR.map(function(f,fi){
    var voci={}; (M.vociPresenti([f.stati],f.anno)||[]).forEach(function(v){ voci[v[2]]=v[1]; });
    var per={}; ids.forEach(function(id){ var st=f.stati[id]||'perso'; if(/^(perso|fuori|conteso|federati|usurpatore)$/.test(st)) return; var r=G.regioni[id], p=per[st]||(per[st]={tot:0,max:0,c:null}); p.tot+=r.peso; if(r.peso>p.max){ p.max=r.peso; p.c=r.c; } });
    var L=Object.keys(per).map(function(st){ return {st:st,nome:voci[st]||st,tot:per[st].tot,x:per[st].c[0],y:per[st].c[1]}; }).sort(function(a,b){ return b.tot-a.tot; }).slice(0,largo2?8:6);
    L.forEach(function(l){ l.w=l.nome.length*fs*0.55+fs*0.6; l.h=fs*1.35; });
    for(var it=0;it<40;it++){ var mosso=false; for(var i=0;i<L.length;i++) for(var j=0;j<i;j++){ var A=L[i], Bq=L[j], ox=(A.w+Bq.w)/2-Math.abs(A.x-Bq.x), oy=(A.h+Bq.h)/2-Math.abs(A.y-Bq.y);
      if(ox>0&&oy>0){ var sp=(oy+1)/2*(A.y>=Bq.y?1:-1); A.y+=sp; Bq.y-=sp; mosso=true; } }
      L.forEach(function(l){ l.x=clamp(l.x,VB[0]+l.w/2+4,VB[0]+VB[2]-l.w/2-4); l.y=clamp(l.y,VB[1]+l.h,VB[1]+VB[3]-l.h*0.75); }); if(!mosso) break; }
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
  function legenda(i){ pLeg.textContent=''; (M.vociPresenti([FR[i].stati],FR[i].anno)||[]).forEach(function(v){ if(v[2]==='perso') return; var c=h('span','ig-chip',null,pLeg); h('i',null,null,c).style.background=v[0]; h('span',null,v[1],c); }); }
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
  S.fermo=function(lato){ var l=h('div','ig-legenda fermo',null,lato); (M.vociPresenti(FR.map(function(f){ return f.stati; }),800)||[]).forEach(function(v){ if(v[2]==='perso') return; var c=h('span','ig-chip',null,l); h('i',null,null,c).style.background=v[0]; h('span',null,v[1],c); }); return l; };
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
  var pA=punto(AN,'Antiochia',-8,18,'end'), pE=punto(ED,'Edessa',-9,-9,'end'), pC=punto(CA,'Carre',13,-11,'start'), pN=NI?punto(NI,'Nisibi',8,-8,'start'):null;
  var est=B([V[0]+V[2]-4,CA[1]+18]);
  /* frecce: si tracciano con stroke-dashoffset */
  function freccia(pts,cl){ var g=el('g',{'class':'ig-v-freccia '+cl},sopra), q=pts.map(B), d='M'+q.map(xy).join(' L'), p=el('path',{d:d,'class':'ig-v-linea'},g), l=p.getTotalLength?p.getTotalLength():300;
    p.style.strokeDasharray=l+' '+l; p.setAttribute('stroke-dashoffset',l); var a=q[q.length-2], b=q[q.length-1], ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
    var pu=el('path',{d:'M0 0 L-11 -6 L-8 0 L-11 6 Z','class':'ig-v-punta',transform:'translate('+xy(b)+') rotate('+r1(ang)+')'},g); return {g:g,p:p,l:l,pu:pu}; }
  var fR=freccia([AN,[(AN[0]+ED[0])/2,AN[1]-14],[ED[0]-3,ED[1]+5]],'roma'), fP=freccia([[V[0]+V[2]-2,CA[1]-6],NI||CA,[CA[0]+5,CA[1]-2]],'persia');
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
  var rx=pad, ry=oriz?pad+112:mapB+14, rw=oriz?Math.max(160,mapL-pad-20):W-2*pad, rh=oriz?H-ry-pad-22:H-ry-pad-22; if(!oriz) rh=Math.min(rh,rw*.62);
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
  foto.addEventListener('load',function(){ schema.style.display='none'; lab.textContent='Il trionfo di Shapur a Naqsh-e Rostam · foto Carole Raddato, CC BY-SA 2.0, Wikimedia Commons'; });
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

var INFO={ roma:{d:ROMA, disegna:disegnaRoma, tappe:function(t){ return t.anno===590&&t.intermezzo || t.anno===852&&!t.intermezzo; }},
  moneta:{d:MONETA, disegna:disegnaMoneta, tappe:function(t){ return t.anno===284&&t.intermezzo || t.anno===274&&!t.intermezzo; }},
  navi:{d:NAVI, disegna:disegnaNavi, tappe:function(t){ return t.anno===395&&t.intermezzo || t.anno===711&&!t.intermezzo; }},
  sacco:{d:SACCO, disegna:disegnaSacco, tappe:function(t){ return t.anno===410&&!t.intermezzo; }},
  governo:{d:GOVERNO, disegna:disegnaGoverno, tappe:function(t){ return !t.intermezzo && (t.anno===476||t.anno===568||t.anno===800); }},
  valeriano:{d:VALERIANO, disegna:disegnaValeriano, tappe:function(t){ return t.anno===260&&!t.intermezzo; }},
  terre:{d:TERRE, disegna:disegnaTerre, tappe:function(t){ return t.anno===476&&t.intermezzo&&/esercito/i.test(t.titolo) || t.anno===439&&!t.intermezzo; }} };
var ORDINE=['valeriano','moneta','navi','sacco','terre','governo','roma'];      // in ordine di storia, secondo la prima tappa in cui compaiono (260, 274, 395, 410, 439, 476, 590); riordinate il 23 novembre 2026 su richiesta dell'utente
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
  governo:'<path d="M4 8l6-3 8 3 6-3v15l-6 3-8-3-6 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 5v15M18 8v15" stroke="currentColor" stroke-width="1.2" opacity=".6"/>' };

/* ---------- la finestra ---------- */
var dlg=null, raf=0, sgancia=null, ctl=null;
function bottone(c,ico,et,p){ var b=h('button',c,null,p); b.type='button'; b.innerHTML=ico; b.setAttribute('aria-label',et); b.title=et; return b; }
function apri(chi){
  var I=INFO[chi]; if(!I) return; chiudi();
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
    S={battute:[],dura:1000,passo:function(){},strato:function(c,sotto){ var d=h('div','ig-strato '+c); palco.insertBefore(d,sotto?svg:cop); return d; },
      fuori:function(c){ var d=h('div','ig-fuori '+c); lato.insertBefore(d,comandi.nextSibling); return d; }};      // fuori dal palco, nella colonna del testo
    I.disegna(svg,S,W,H);
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
  dlg.addEventListener('keydown',function(e){ if(e.target===rng||e.altKey||e.ctrlKey||e.metaKey) return;
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
  else { mostra(); bP.focus(); raf=requestAnimationFrame(va); }
}
function chiudi(){ if(raf) cancelAnimationFrame(raf); raf=0; ctl=null; if(dlg){ var d=dlg; dlg=null; try{ d.close(); }catch(e){} d.remove(); if(sgancia){ var s=sgancia; sgancia=null; s(); } } }

/* il bottone sotto il testo della tappa */
var posto=document.getElementById('tDaLeggere'), box=null;
if(posto){ box=document.createElement('div'); box.className='ig-inviti'; box.hidden=true; posto.parentNode.insertBefore(box,posto); }
function inviti(i,t){
  if(!box) return; box.textContent=''; var ci=Object.keys(INFO).filter(function(k){ return INFO[k].tappe(t); }); box.hidden=!ci.length;
  ci.forEach(function(k){ var b=h('button','ig-invito ig-inv-'+k,null,box); b.type='button';
    var ic=h('span','ig-inv-icona',null,b); ic.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true" fill="currentColor">'+GLIFI[k]+'</svg>';
    var s=h('span','ig-testi',null,b); h('span','ig-inv-occh','Infografica animata',s); h('b',null,INFO[k].d.titolo,s); h('span','ig-inv-sotto','Guarda in un minuto',s);
    h('span','ig-play',null,b).innerHTML=ICO.play; b.addEventListener('click',function(){ apri(k); }); });
}
if(window.RM_pagina && box){ RM_pagina.quando(inviti); var T0=(D.TAPPE||[])[RM_pagina.tappa()]; if(T0) inviti(RM_pagina.tappa(),T0); }      // anche la tappa aperta all'avvio
/* per le prove: vai(f) ferma l'animazione aperta e la porta alla frazione f (da 0 a 1); ?info=<roma|terre|moneta|sacco|navi|governo|valeriano>&infop=<0..1> la apre da sola */
window.RM_infografiche={apri:apri, chiudi:chiudi, vai:function(f){ if(ctl) ctl.vai(f); }};
(function(){ var q=/[?&]info=(\w+)/.exec(location.search), f=/[?&]infop=([\d.]+)/.exec(location.search); if(!q||!INFO[q[1]]) return;
  setTimeout(function(){ apri(q[1]); if(f) setTimeout(function(){ RM_infografiche.vai(+f[1]); },300); },900); })();
})();
