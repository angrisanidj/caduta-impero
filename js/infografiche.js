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
  T.fin=T.d1+7200;
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
  var gC=el('g',{'class':'ig-atto'},svg), riga=W/3>=210, gap=12, pW=riga?(W-2*pad-2*gap)/3:W-2*pad, pH=riga?H-2*pad:(H-2*pad-2*gap)/3;
  function pannello(i,chi,rif,dida){
    var x=pad+(riga?i*(pW+gap):0), y=pad+(riga?0:i*(pH+gap)), g=el('g',{'class':'ig-m-pann'},gC), basso=pH<175;
    el('rect',{x:r1(x),y:r1(y),width:r1(pW),height:r1(pH),rx:12,'class':'ig-m-pann-fondo'},g);
    var tw=basso?Math.min(pW*0.42,190):pW-24, bx=basso?[x+tw+14,y+8,pW-tw-22,pH-16]:[x+12,y+52,pW-24,pH-52-(pH>300?64:52)];
    tx(g,x+12,y+(basso?22:24),'ig-m-c-tit dark',chi); var r=tx(g,x+12,y+(basso?38:41),'ig-m-c-sot dark',rif); if(largo(r)>tw-4){ r.textContent=''; avvolgi(r,rif,tw-4,13); }
    var dd=el('text',{x:r1(x+12),y:r1(basso?y+(r.childNodes.length>1?72:58):y+pH-(pH>300?42:32)),'class':'ig-m-pann-dida'},g); avvolgi(dd,dida,tw-4,basso?16:18);
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
  var P1=pannello(0,'LATTANZIO','La morte dei persecutori 44, 9','Il ponte alle spalle di Massenzio viene tagliato: nella fuga è «interrotto».');
  var P2=pannello(1,'EUSEBIO','Storia ecclesiastica IX 9','Un ponte di barche.');
  var P3=pannello(2,'ZOSIMO','libro II, 15-16','Travi in due metà, unite al centro da ferri da togliere: sotto i fuggiaschi cede.');
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
  if(oriz){ var aw=Math.min(W*(W<700?0.46:0.54),(H-2*pad)*1.25); ab=[pad+10,(H-aw/1.25)/2+6,aw,aw/1.25]; tb=[ab[0]+aw+34,pad,W-(ab[0]+aw+34)-pad,H-2*pad]; }
  else { var aw2=W-2*pad-10, ah2=Math.min(aw2/1.25,H*0.5); aw2=ah2*1.25; ab=[(W-aw2)/2,pad+6,aw2,ah2]; tb=[pad,ab[1]+ah2+18,W-2*pad,H-(ab[1]+ah2+18)-4]; }
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

  /* ---------- la regia ---------- */
  S.passo=function(t){
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
    if(P&&P.attivo){ P.tela.setSize(w,h); P.mat.uniforms.px.value.set(1/w,1/h); P.mat.uniforms.sfoca.value=0; Rd.setRenderTarget(P.tela); Rd.render(R.scene,C); Rd.setRenderTarget(null); Rd.render(P.scena,P.camera); }
    else Rd.render(R.scene,C);
    url=Rd.domElement.toDataURL('image/jpeg',.88);
    (punti||[]).forEach(function(q){ var v=new THREE.Vector3(q[1],q[2],q[3]).project(C); out[q[0]]=[(v.x+1)/2,(1-v.y)/2]; });
  }catch(e){ url=null; }
  try{ RM_pagina.anno(a0); }catch(e){}
  Rd.setPixelRatio(pr); Rd.setSize(sz.x,sz.y,false); C.aspect=asp; C.position.copy(cp); C.quaternion.copy(cq); K.target.copy(ct); if(vw) C.setViewOffset.apply(C,vw); C.updateProjectionMatrix();
  if(P){ var W2=Math.max(2,Math.floor(sz.x*pr)), H2=Math.max(2,Math.floor(sz.y*pr)); P.tela.setSize(W2,H2); P.mat.uniforms.px.value.set(1/W2,1/H2); if(sf!=null) P.mat.uniforms.sfoca.value=sf; }
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
  fonte:"Scheda del Pantheon, tappe del 609 e del 663 e voci del Liber Pontificalis (vite di Bonifacio IV, Vitaliano e Gregorio III: «tegulis aereis», «chartis plumbeis») in questa pagina; misure da Platner e Ashby, l'altezza delle colonne da Ziolkowski. Le fotografie sono fotogrammi della città in 3D di questa pagina negli anni indicati: una ricostruzione con le sue ipotesi (la chiusura nel 392 è una scelta del modello, la croce sul frontone è indicativa, che le tegole fossero dorate è un'ipotesi). La pianta e l'alzato sono schemi; la posizione delle file interne di colonne è indicativa." };
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
  var SCH=[[['costruito da','Adriano'],['completato','nel 126'],['ingresso','a nord']],[['rotonda','56 m, 43,2 dentro'],['occhio','9 m'],['portico','34 × 13,6 m'],['colonne','16, alte 14,15 m']],
    [['copertura','tegole di bronzo'],['dorate?',"un'ipotesi"]],[['ultima notizia','368 o 370'],['poi','nessuna fino al 609']],[['fine del culto','non si sa'],['nel modello','392']],null,null,null,[['oggi','si conserva per intero']]];
  function scriviCit(i){ gCit.textContent=''; var c=CIT[i]; if(stretta) return;
    if(!c && SCH[i]){ var rr=SCH[i], rh2=oriz?28:24, wl=oriz&&!stretta?112:96; if(rr.length*rh2+4>hCit) rr=rr.slice(0,Math.max(0,Math.floor((hCit-4)/rh2)));
      rr.forEach(function(r,j){ var y=yCit+j*rh2; el('line',{x1:r1(cb[0]),x2:r1(cb[0]+cb[2]),y1:r1(y),y2:r1(y),'class':'ig-p-sch-filo'},gCit); tx(gCit,cb[0],y+rh2*.66,'ig-p-sch-k',r[0].toUpperCase()); var v=tx(gCit,cb[0]+wl,y+rh2*.68,'ig-p-sch-v',r[1]); if(largo(v)>cb[2]-wl){ v.style.fontSize='14px'; } });
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
  var s=Math.min(fb[2]/34,(fb[3]-20)/32.5), x0=fb[0]+fb[2]/2, y0=fb[1]+fb[3]-14, M=function(x,y){ return [x0+x*s,y0-y*s]; };
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
  var dida=el('g',{'class':'ig-p-dida-f'},dentro), didaR=el('rect',{x:fb[0]+10,y:fb[1]+fb[3]-30,height:20,rx:10,'class':'ig-p-dida-fondo'},dida), didaT=tx(dida,fb[0]+20,fb[1]+fb[3]-16,'ig-p-dida-t','La città di questa pagina, anno 300');
  fissa(didaR,'width',r1(largo(didaT)+20));
  var fCuria=fumetto(dentro,fb,'la Curia','dx');
  fotogrammi('curia',[{a:300,posa:posaF,punti:[['curia',X0,hC+1.6,Z0]]},{a:384,posa:posaV,punti:[['curia',X0,hC+1.3,Z0]]},{a:700,posa:posaV}],null,Math.round(fb[2]),Math.round(fb[3]),[],function(i,r){ href(foto[i],r.url); fOk[i]=true; if(i===0&&r.p&&r.p.curia) pCuria=r.p.curia; if(i===1&&r.p&&r.p.curia) cW=clamp(r.p.curia[0],.3,.7); if(ultimoT!=null) S.passo(ultimoT); });
  /* i fumetti sulla facciata */
  function frac(x,y){ var p=M(x,y); return [(p[0]-fb[0])/fb[2],(p[1]-fb[1])/fb[3]]; }
  var F={zoccolo:[fumetto(svg,fb,'zoccolo di marmo','sx'),frac(-7,5)],stucco:[fumetto(svg,fb,'stucco a finti blocchi','sx'),frac(-7.5,20)],finestre:[fumetto(svg,fb,'tre finestre','dx'),frac(6.3,17)],
    porte:[fumetto(svg,fb,'porte di bronzo','dx'),frac(1.2,7)],portico:[fumetto(svg,fb,'portico: discusso','sx'),frac(-6.2,9)],statue:[fumetto(svg,fb,'statue: indicative','dx'),frac(9.6,26)],
    croce:[fumetto(svg,fb,'croce: indicativa','dx'),frac(0,32)],misura:[fumetto(svg,fb,'27 × 18 m','dx'),frac(8,-1.6)]};
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
  var ay=cb[1]+fsA*.82+(oriz?64:48), ah=Math.min(oriz?92:62,cb[3]-(ay-cb[1])-30), gA=el('g',{'class':'ig-c-altare-box'},gC), mostraA=ah>=40&&!stretta, ayQ=ay, inTav=false;
  if(!mostraA){ inTav=true; mostraA=true; ah=Math.min(54,fb[3]*0.2); ay=fb[1]+12; svg.appendChild(gA); el('rect',{x:r1(fb[0]+8),y:r1(ay-6),width:r1(Math.min(fb[2]-16,250)),height:r1(ah+12),rx:10,'class':'ig-c-altare-fondo'},gA); }
  var aw=ah*0.62, ax=inTav?fb[0]+16:cb[0]+8, alt=el('g',{'class':'ig-c-altare'},gA), alGhost=el('g',{'class':'ig-c-altare-ombra'},gA);
  function altare(p){ var P=function(x,y){ return xy([ax+x*aw,ay+y*ah]); };
    el('path',{d:'M'+P(.05,1)+' L'+P(.95,1)+' L'+P(.95,.9)+' L'+P(.85,.86)+' L'+P(.85,.32)+' L'+P(.95,.27)+' L'+P(.95,.18)+' L'+P(.05,.18)+' L'+P(.05,.27)+' L'+P(.15,.32)+' L'+P(.15,.86)+' L'+P(.05,.9)+' Z'},p);
    el('path',{d:'M'+P(.02,.18)+' Q'+P(.02,.06)+' '+P(.16,.08)+' L'+P(.84,.08)+' Q'+P(.98,.06)+' '+P(.98,.18)+' Z'},p); el('path',{d:'M'+P(.3,.45)+' Q'+P(.5,.38)+' '+P(.7,.45)+' L'+P(.7,.7)+' Q'+P(.5,.76)+' '+P(.3,.7)+' Z','class':'ig-c-altare-rilievo'},p); }
  altare(alt); altare(alGhost);
  var aT=tx(gA,ax+aw+14,ay+ah*0.38,'ig-c-alt-tit','l\'altare della Vittoria'), aS=tx(gA,ax+aw+14,ay+ah*0.38+19,'ig-c-alt-st','');
  if(ax+aw+14+largo(aT)>(inTav?fb[0]+Math.min(fb[2]-16,250):cb[0]+cb[2])){ aT.textContent='l\'altare'; }
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
    cls(velo,'vis',i===8); cls(quota,'vis',i===2&&t>=T[2]+1600); cls(etS,'vis',t>=T[2]);
    /* le fotografie della fine: prima e dopo */
    var vF=fin&&fOk[1]&&fOk[2]; cls(foto[2],'vis',vF); cls(foto[1],'vis',vF); var wp=fase(t,T[11]+1400,T[11]+5200), wx=fb[0]+fb[2]*(cW+0.2*Math.sin(wp*Math.PI*2)*(1-wp*0.4));
    fissa(cpWr,'width',r1(wx-fb[0])); fissa(lama,'transform','translate('+r1(wx)+',0)'); cls(lama,'vis',vF); cls(dW1,'vis',vF); cls(dW2,'vis',vF);
    /* i fumetti */
    function Fu(k,da,a){ var f=F[k]; cls(f[0],'vis',t>=da&&t<a); f[0].metti(f[1]); }
    var uno=fb[2]<520, seq=['stucco','zoccolo','finestre','porte','portico','statue'];      // sul telefono i cartellini della facciata vengono uno alla volta
    Fu('misura',T[2]+1800,T[3]-200); seq.forEach(function(k,j){ var da=T[3]+200+j*(uno?760:400); Fu(k,da,uno?da+740:T[4]-300); });
    Fu('croce',T[9]+1200,T[10]-200);
    /* l'altare */
    var st=i<4||i===4&&t<T[4]+1500?'c':i===4?'via':i===5?'forse':'via2';
    cls(gA,'vis',mostraA&&i>=4&&i<8&&!(inTav&&i===7&&t>=T[7]+400)); cls(alt,'via',st==='via'||st==='via2'); cls(alt,'forse',st==='forse'); cls(alGhost,'vis',st!=='c');
    scrivi(aS,st==='c'?'nella Curia':st==='via'?'tolto da Costanzo II':st==='forse'?'rimesso, probabilmente sotto Giuliano':i>=7?'la richiesta di Simmaco è respinta':'tolto da Graziano');
    if(largo(aS)>cb[0]+cb[2]-(ax+aw+14)) aS.style.fontSize='12px'; else aS.style.fontSize='';
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

var INFO={ roma:{d:ROMA, disegna:disegnaRoma, tappe:function(t){ return t.anno===590&&t.intermezzo || t.anno===852&&!t.intermezzo; }},
  moneta:{d:MONETA, disegna:disegnaMoneta, tappe:function(t){ return t.anno===284&&t.intermezzo; }},      // solo nell'intermezzo «La moneta» (23 novembre 2026, l'utente: «toglila dalla tappa del 274»)
  navi:{d:NAVI, disegna:disegnaNavi, tappe:function(t){ return t.anno===395&&t.intermezzo || t.anno===711&&!t.intermezzo; }},
  sacco:{d:SACCO, disegna:disegnaSacco, tappe:function(t){ return t.anno===410&&!t.intermezzo; }},
  governo:{d:GOVERNO, disegna:disegnaGoverno, tappe:function(t){ return !t.intermezzo && (t.anno===476||t.anno===568||t.anno===800); }},
  valeriano:{d:VALERIANO, disegna:disegnaValeriano, tappe:function(t){ return t.anno===260&&!t.intermezzo; }},
  curia:{d:CURIA, disegna:disegnaCuria, tappe:function(t){ return t.anno===630&&!t.intermezzo; }},
  pantheon:{d:PANTHEON, disegna:disegnaPantheon, tappe:function(t){ return t.anno===609&&!t.intermezzo; }},
  milvio:{d:MILVIO, disegna:disegnaMilvio, tappe:function(t){ return t.anno===312&&!t.intermezzo; }},
  terre:{d:TERRE, disegna:disegnaTerre, tappe:function(t){ return t.anno===476&&t.intermezzo&&/esercito/i.test(t.titolo) || t.anno===439&&!t.intermezzo; }} };
var ORDINE=['valeriano','moneta','milvio','navi','sacco','terre','governo','pantheon','curia','roma'];      // in ordine di storia, secondo la prima tappa in cui compaiono (260, 284, 312, 395, 410, 439, 476, 609, 630; «Roma si svuota» resta in fondo, come chiesto); riordinate il 23 novembre 2026 su richiesta dell'utente, con le tre nuove (ponte Milvio, Pantheon, Curia) aggiunte lo stesso giorno
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
  else { mostra(); bP.focus(); raf=requestAnimationFrame(va); }
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
    h('span','ig-play',null,b).innerHTML=ICO.play; b.addEventListener('click',function(){ apri(k); }); });
}
if(window.RM_pagina && box){ RM_pagina.quando(inviti); var T0=(D.TAPPE||[])[RM_pagina.tappa()]; if(T0) inviti(RM_pagina.tappa(),T0); }      // anche la tappa aperta all'avvio
/* per le prove: vai(f) ferma l'animazione aperta e la porta alla frazione f (da 0 a 1); ?info=<roma|terre|moneta|sacco|navi|governo|valeriano|milvio|pantheon|curia>&infop=<0..1> la apre da sola */
window.RM_infografiche={apri:apri, chiudi:chiudi, vai:function(f){ if(ctl) ctl.vai(f); }};
(function(){ var q=/[?&]info=(\w+)/.exec(location.search), f=/[?&]infop=([\d.]+)/.exec(location.search); if(!q||!INFO[q[1]]) return;
  setTimeout(function(){ apri(q[1]); if(f) setTimeout(function(){ RM_infografiche.vai(+f[1]); },300); },900); })();
})();
