/* Mappa dell'Impero, in bozza: una regione, un colore, secondo il rapporto con Roma.
   Niente frecce: gli spostamenti dei gruppi arriveranno come popolazioni che si muovono nel tempo. */
(function(){
'use strict';
var G=window.RM_MAPPA, ospite=document.getElementById('mappa'); if(!G||!ospite) return;
var NS='http://www.w3.org/2000/svg';
function el(tipo,attr,padre){ var e=document.createElementNS(NS,tipo); for(var k in attr) e.setAttribute(k,attr[k]); if(padre) padre.appendChild(e); return e; }

var STATI=[['roma','governo di Roma'],['usurpatore','imperatore rivale'],['conteso','conteso'],['federati','alleati per trattato'],['regno:svevi',''],['regno:vandali',''],['regno:visigoti',''],['regno:burgundi',''],['regno:franchi',''],['regno:italia',''],['regno:longobardi',''],['regno:anglosassoni',''],['regno:asturie',''],['regno:britanni',''],['regno:turingi',''],['regno:gepidi',''],['regno:unni',''],['regno:avari',''],['regno:bulgari',''],['regno:moravi',''],['oriente','corte d\'Oriente'],['califfato','califfato'],['carolingio','impero dei Franchi'],['chiesa','terre della Chiesa'],['perso','fuori dall\'impero']];
/* i regni: colore e nome. I colori si ripetono solo fra regni che non sono mai sulla carta insieme. */
var REGNI={svevi:['#D08C60','regno degli Svevi'],vandali:['#7B5B3A','regno dei Vandali'],visigoti:['#6A4C93','regno dei Visigoti'],burgundi:['#D684A4','regno dei Burgundi'],franchi:['#3E5F7A','regni dei Franchi'],
  italia:['#3D7A4F','regno d\'Italia'],longobardi:['#8A8F3A','regno e ducati dei Longobardi'],anglosassoni:['#6E94B4','regni anglosassoni'],asturie:['#D08C60','regno delle Asturie'],
  britanni:['#A99BD0','regni dei Britanni'],turingi:['#8B4F6B','regno dei Turingi'],gepidi:['#5A9096','regno dei Gepidi'],unni:['#5B5348','dominio degli Unni'],avari:['#5B5348','regno degli Avari'],
  bulgari:['#8B4F6B','regno dei Bulgari'],moravi:['#A7B37A','principato di Moravia']};
var svg=el('svg',{viewBox:'95 55 810 518',   /* ritaglio sull'Occidente: stesso rapporto del riquadro */ role:'img','aria-label':'Mappa dell\'Impero romano','preserveAspectRatio':'xMidYMid slice'},ospite);
var defs=el('defs',{},svg), trama=el('pattern',{id:'trama-conteso',width:7,height:7,patternUnits:'userSpaceOnUse',patternTransform:'rotate(40)'},defs);
el('rect',{width:7,height:7,fill:'#DCD0B8'},trama); el('rect',{width:3.2,height:7,fill:'#9A2F2A'},trama);
/* il mare: più chiaro al centro, più fondo ai bordi; lungo le coste tre aloni chiari, come le linee d'acqua delle carte incise */
var gm=el('radialGradient',{id:'g-mare',cx:'52%',cy:'58%',r:'75%'},defs); [[0,'#DCE7E2'],[.55,'#C7D6D3'],[1,'#A9BFC0']].forEach(function(p){ el('stop',{offset:p[0],'stop-color':p[1]},gm); });
el('rect',{'class':'m-mare',width:G.w,height:G.h,fill:'url(#g-mare)'},svg);
[15,9,4].forEach(function(w,k){ el('path',{'class':'m-acque',d:G.terra,'stroke-width':w,'stroke-opacity':[.16,.22,.34][k]},svg); });
(G.mari||[]).forEach(function(m){ el('text',{'class':'m-nome-mare',x:m[0],y:m[1]},svg).textContent=m[2]; });
el('path',{'class':'m-terra',d:G.terra},svg);

var regioni={}, nomi={}, NOMI={britannia:'Britannia',gallia:'Gallie',belgica:'Belgica',aquitania:'Aquitania',hispania:'Hispania',italia_nord:'Italia',africa:'Africa',mauretania:'Mauretanie',pannonia:'Pannonia',balcani:'Grecia',tracia:'Tracia',anatolia:'Asia Minore',dacia:'Dacia',levante:'Siria',egitto:'Egitto'};
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id];
  regioni[id]=el('path',{'class':'m-regione perso',d:r.d},svg);
  el('title',{},regioni[id]).textContent=r.nome;
});
/* sopra i colori: la grana della carta, il rilievo, il filo delle coste e i fiumi */
(function(){
  try{                                                    // grana: un piccolo riquadro di rumore generato una volta sola e ripetuto
    var c=document.createElement('canvas'), n=96, x=c.getContext('2d'); c.width=c.height=n; var im=x.createImageData(n,n), s=7;
    for(var i=0;i<n*n;i++){ s=(s*16807+11)%2147483647; var v=150+(s%106); im.data[i*4]=v; im.data[i*4+1]=v-6; im.data[i*4+2]=v-18; im.data[i*4+3]=255; }
    x.putImageData(im,0,0);
    var pg=el('pattern',{id:'grana',width:n,height:n,patternUnits:'userSpaceOnUse'},defs); el('image',{href:c.toDataURL(),width:n,height:n},pg);
    el('rect',{'class':'m-grana',x:0,y:0,width:G.w,height:G.h,fill:'url(#grana)'},svg);
  }catch(e){}
  /* il rilievo vero: l'ombreggiatura di Natural Earth riproiettata sulla carta (src/mappa/rilievo.mjs e rilievo.py); grigio medio = piano, quindi sul mare non fa nulla */
  el('image',{'class':'m-rilievo',href:'img/rilievo.jpg',x:0,y:0,width:G.w,height:G.h,preserveAspectRatio:'none'},svg);
  el('path',{'class':'m-costa',d:G.terra},svg);
  var gf=el('g',{'class':'m-fiumi'},svg);
  (G.fiumi||[]).forEach(function(f){ el('path',{d:f.d,'class':f.forte?'forte':''},gf); });
})();
/* I nomi delle regioni e delle città, al loro posto di sempre. A ogni tappa un nome che finirebbe sotto un rombo, un segno della scena o una punta di freccia
   o sotto il cartellino di un popolo fermo al suo posto si sposta di poco (piazzaCitta, piazzaNomi); i cartellini dei luoghi li evitano tutti. */
var nomiPos=[];
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id]; if(!NOMI[id]) return;                                    // solo le regioni abbastanza grandi hanno il nome scritto sopra
  var yn=r.c[1]+(id==='italia_nord'?-14:id==='belgica'?-6:0);
  nomi[id]=el('text',{'class':'m-nome',x:r.c[0],y:yn},svg); nomi[id].textContent=NOMI[id];
  nomiPos.push({id:id,x:r.c[0],y:yn,w:NOMI[id].length*8.6+6,ox:0,oy:0});
});
/* Ingombri sulla carta, in unità del disegno: [x del centro, y del centro, larghezza, altezza], oppure un cerchio [x, y, diametro, diametro, 1].
   copre() dice quanto due ingombri si sovrappongono: 0 se restano staccati di almeno un'unità e mezza */
function copre(a,b){
  var g=1.5, dx=Math.abs(a[0]-b[0]), dy=Math.abs(a[1]-b[1]);
  if(!a[4]&&!b[4]){ var ox=(a[2]+b[2])/2+g-dx, oy=(a[3]+b[3])/2+g-dy; return ox>0&&oy>0?ox*oy:0; }
  var c=a[4]?a:b, q=a[4]?b:a, r=c[2]/2+g, d=q[4]?Math.hypot(dx,dy)-q[2]/2:Math.hypot(Math.max(0,dx-q[2]/2),Math.max(0,dy-q[3]/2));
  return d<r?(r-d)*Math.min(c[2],q[2],q[3]):0;
}
function ingombro(r,lista){ var s=0; for(var i=0;i<lista.length;i++) s+=copre(r,lista[i]); return s; }
function rettoNome(np,o){ return [np.x+o[0],np.y+o[1]-3.2,np.w,16]; }      // la scatola del testo: dalla linea di base 11 unità in su e 5 in giù
var annoCarta=document.createElement('p'); annoCarta.className='m-anno'; annoCarta.setAttribute('aria-hidden','true'); ospite.appendChild(annoCarta);
var verdun=el('g',{'class':'m-verdun via'},svg);
if(G.verdun){ G.verdun.linee.forEach(function(d){ el('path',{d:d},verdun); }); G.verdun.nomi.forEach(function(n){ el('text',{x:n[0],y:n[1]},verdun).textContent=n[2]; }); }      // 843: l'impero dei Franchi diviso fra i tre nipoti di Carlo Magno
/* 293-305: le aree di comando della tetrarchia, come Verdun. Le linee sono i bordi comuni delle regioni (src/mappa/genera.mjs, TETRARCHIA, con le fonti); quelle discusse sono a trattini */
var tetra=el('g',{'class':'m-tetra via'},svg), nomiTetra={}, areeTetra={}, fuocoT=null, notaT=null;
if(G.tetrarchia){
  G.tetrarchia.linee.forEach(function(l){ if(l.d) el('path',{d:l.d,'class':l.discussa?'discussa':''},tetra); });
  /* ogni nome è un bottone: toccato, lascia vive le sole regioni della sua area (1) e, più chiare, quelle che gli sono attribuite senza accordo fra gli studiosi (2).
     Il tocco lo riconosce il gestore dei clic della carta (nomeTetraA), perché a tutto schermo la carta cattura il puntatore per il trascinamento. */
  G.tetrarchia.nomi.forEach(function(n){ var t=el('text',{x:n[0],y:n[1]},tetra); t.textContent=n[2]; el('tspan',{x:n[0],dy:'.95em','class':'rango'},t).textContent=n[3];
    if(!n[4] || !G.tetrarchia.gruppi) return; var a={};
    (G.tetrarchia.gruppi[n[4]]||[]).forEach(function(id){ a[id]=1; }); (G.tetrarchia.gruppi[n[5]]||[]).forEach(function(id){ a[id]=2; });
    nomiTetra[n[4]]=t; areeTetra[n[4]]=a; t.setAttribute('role','button'); t.setAttribute('tabindex','0'); t.setAttribute('aria-pressed','false'); t.setAttribute('aria-label',n[2]+', '+n[3]+': mostra i territori che governa');
    t.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toccaTetra(n[4]); } });
  });
}
function toccaTetra(k){ fuocoT=fuocoT===k?null:k; fuoco=fuocoP=null; applicaFuoco(); }
function nomeTetraA(x,y){      // il nome di un tetrarca sotto il dito, con un margine: sul telefono le scritte sono piccole
  if(annoVisto==null || !tetrarchia(annoVisto)) return null;
  for(var k in nomiTetra){ var r=nomiTetra[k].getBoundingClientRect(); if(x>=r.left-10 && x<=r.right+10 && y>=r.top-8 && y<=r.bottom+8) return k; }
  return null;
}
/* la parte di ciascuno con le parole delle fonti lette (src/mappa/genera.mjs, TETRARCHIA): Aurelio Vittore 39, 30; la Hispania solo in Lattanzio 8, 3; la Britannia ripresa nel 296 (Eutropio IX 22) */
var PARTE={costanzo:'le Gallie al di là delle Alpi (Aurelio Vittore)', massimiano:'Italia e Africa (Aurelio Vittore); la Hispania, più chiara, gliela dà Lattanzio ma è discussa',
  galerio:'l’Illirico fino allo stretto del Ponto (Aurelio Vittore); la Tracia, più chiara, è discussa', diocleziano:'tutto il resto, cioè l’Oriente (Aurelio Vittore)'};
function britanniaDiCostanzo(){ return fuocoT==='costanzo' && annoVisto>=296; }
function scriviNotaTetra(){
  if(!notaT) return; var n=fuocoT && G.tetrarchia.nomi.filter(function(q){ return q[4]===fuocoT; })[0];
  notaT.textContent=n ? n[2]+', '+n[3]+': '+PARTE[fuocoT]+(fuocoT==='costanzo'?(britanniaDiCostanzo()?'; dal 296 anche la Britannia, ripresa agli usurpatori':'; la Britannia è in mano a un usurpatore'):'')+'. Tocca di nuovo il nome per rivedere tutta la carta.'
    : 'I puntini delimitano le zone affidate ai quattro imperatori. L\'impero resta unito e le stesse leggi valgono ovunque. I trattini indicano le regioni per cui si discute a chi spettasse il comando, come la penisola iberica e la Tracia. Tocca il nome di un imperatore per vedere la sua zona.';
}
function tetrarchia(anno){ return anno>=293 && anno<305; }      // la prima tetrarchia: dal 1° marzo 293 alle abdicazioni del 1° maggio 305
var citta=el('g',{'class':'m-citta'},svg), scritte={}, cittaPos=[], larghe={};
if(G.citta.roma) el('circle',{'class':'m-battito',cx:G.citta.roma.x,cy:G.citta.roma.y,r:4},citta);      // Roma pulsa piano: è lì che guarda l'altra scena
['roma','ravenna','milano','treviri','cartagine','costantinopoli'].forEach(function(id){
  var c=G.citta[id]; el('circle',{cx:c.x,cy:c.y,r:3.2},citta);
  var destra=id==='ravenna'||id==='treviri', dy=id==='milano'?-7:id==='roma'?14:4;
  scritte[id]=el('text',{x:c.x+(destra?7:-7),y:c.y+dy,'text-anchor':destra?'start':'end'},citta); scritte[id].textContent=c.nome;
  cittaPos.push({id:id,x:c.x,y:c.y,lato:destra?1:-1,dy:dy,v:null});
});
/* il nome di una città come ingombro: v=[lato (1 a destra del punto, -1 a sinistra, 0 centrato), linea di base rispetto al punto, distanza dal punto] */
function largaCitta(id){ var t=scritte[id], s=t.textContent, w=larghe[s]; if(!w){ try{ w=t.getComputedTextLength(); }catch(e){} if(w>4) larghe[s]=w; else w=s.length*6.3; } return w+4; }
function rettoCitta(cp,v,w){ return [cp.x+v[0]*(v[2]+w/2),cp.y+v[1]-4.7,w,16]; }

/* I popoli: ciascuno è un punto dove stava il grosso del gruppo e un cartellino col nome; il colore dice il rapporto con Roma in quel momento
   (gli stessi colori delle regioni: verde per chi sta dentro per accordo, blu per chi ha un regno), la linea tratteggiata da dove veniva
   (l'ultimo tratto del cammino, con i suoi punti di passaggio via terra). Quando un gruppo ha un regno, il cartellino porta il nome del regno e la linea sparisce. */
var RAPPORTI=[['fuori','oltre il confine'],['accordo','insediati nell\'impero per accordo'],['armi','in armi dentro l\'impero'],['regno','con un proprio regno (vedi il colore nella legenda)']];
var CLASSE={fuori:'fuori',accolti:'accordo',federati:'accordo',armi:'armi',regno:'regno'};
var REGNO={goti:'Regno dei Visigoti',ostrogoti:'Regno degli Ostrogoti',vandali:'Regno dei Vandali',svevi:'Regno degli Svevi',burgundi:'Regno dei Burgundi',franchi:'Regno dei Franchi',sassoni:'Regni anglosassoni',longobardi:'Regno dei Longobardi',avari:'Regno degli Avari',bulgari:'Regno dei Bulgari'};
var popoli={}, stratoRotte=el('g',{'class':'m-rotte'},svg), stratoPopoli=el('g',{'class':'m-popoli'},svg), ingr=0;
Object.keys(G.popoli||{}).forEach(function(id){
  var q=G.popoli[id], sotto=el('path',{'class':'m-rotta-f via'},stratoRotte), rotta=el('path',{'class':'m-rotta via'},stratoRotte), g=el('g',{'class':'m-popolo via'},stratoPopoli);
  var punto=el('circle',{'class':'m-punto',r:4},g), c=el('g',{'class':'m-cartello'},g), fondo=el('rect',{rx:3,ry:3},c), t=el('text',{},c);
  popoli[id]={g:g,c:c,fondo:fondo,t:t,punto:punto,q:q,rotta:rotta,sotto:sotto,nome:'',larga:0};
});
/* I luoghi dell'evento della tappa: un rombo scuro che pulsa, col nome del luogo; che cosa vi accade lo dice la riga sotto la carta.
   Chi cade fuori dal disegno (Edessa, Palmira) sta sul bordo con una freccia. I cartellini dei popoli li evitano come evitano i nomi. */
var stratoLuoghi=el('g',{'class':'m-luoghi'},svg), luoghiOra=[], rigaLuoghi=document.createElement('p');
rigaLuoghi.className='legenda-luoghi'; rigaLuoghi.hidden=true; if(legendaPrima()) ospite.parentNode.insertBefore(rigaLuoghi,legendaPrima());
function legendaPrima(){ return document.getElementById('legendaMappa'); }
/* negli anni della tetrarchia la riga sotto la carta dice anche che cosa sono le linee tratteggiate (dopo i luoghi, se ce ne sono) */
function notaTetra(anno){
  notaT=null; if(!G.tetrarchia || !tetrarchia(anno)) return;
  var s=document.createElement('span'); s.className='tetra'; notaT=s; scriviNotaTetra();
  rigaLuoghi.appendChild(s); rigaLuoghi.hidden=false;
}
function scriviLuoghi(l){
  luoghiOra=l||[]; rigaLuoghi.textContent=''; rigaLuoghi.hidden=!luoghiOra.length;
  luoghiOra.forEach(function(q){ var p=(G.luoghi||{})[q[0]]||G.citta[q[0]]; if(!p) return; var s=document.createElement('span'), b=document.createElement('b'); b.textContent=p.nome; s.appendChild(b); s.appendChild(document.createTextNode(': '+q[1])); rigaLuoghi.appendChild(s); });
}
/* dove stanno i rombi dei luoghi in questa vista: chi cade fuori dal bordo ci resta sopra */
function posLuoghi(){
  var out=[];
  luoghiOra.forEach(function(q){
    var p=(G.luoghi||{})[q[0]]||G.citta[q[0]]; if(!p) return;
    var x=Math.max(bordo[0],Math.min(bordo[1],p.x)), y=Math.max(bordo[2],Math.min(bordo[3],p.y));
    out.push({q:q,p:p,x:x,y:y,fuori:x!==p.x||y!==p.y,citta:!!G.citta[q[0]]&&!!scritte[q[0]]});
  });
  return out;
}
/* ciò che occupa un punto della carta (un rombo, l'anello di un assedio): mezzo lato del rombo, raggio dell'anello. Lo scrive disegnaScena */
var nucleiOra={};
function chiave(x,y){ return Math.round(x)+','+Math.round(y); }
function nucleoDi(x,y){ var n=nucleiOra[chiave(x,y)]; return n?Math.max(n.c,n.r):0; }
/* per un punto che cade dentro o accanto a un rombo o a un anello (il punto di un popolo sopra il luogo che assedia): quanto stargli lontano per uscirne */
function nucleoIntorno(x,y,nu){
  var m=0, c, p, d, n; nu=nu||nucleiOra;
  for(c in nu){ n=nu[c]; p=c.split(','); d=Math.hypot(+p[0]-x,+p[1]-y); if(d<Math.max(n.c,n.r)+6) m=Math.max(m,Math.max(n.c,n.r)+d); }
  return m;
}
/* i nomi delle città restano dove sono, se lì non c'è niente; altrimenti vanno dall'altra parte, sopra o sotto il punto */
function piazzaCitta(k,fissi,messi){
  var ost=fissi.concat(nomiPos.map(function(np){ return rettoNome(np,[0,0]); }));
  cittaPos.forEach(function(cp){
    var w=largaCitta(cp.id), nc=nucleoDi(cp.x,cp.y), gx=Math.max(7,nc+1.5*k), l=cp.lato, a=Math.max(nc,4);
    var prove=[], meglio=0, minimo=1e9, j, t;
    [0,10,20].forEach(function(e){ prove.push([l,cp.dy,gx+e],[l,4,gx+e],[-l,cp.dy,gx+e],[-l,4,gx+e],[0,-a-6-e,0],[0,a+15+e,0]); });      // prima vicino al punto, poi un po' più in là
    for(j=0;j<prove.length;j++){ t=ingombro(rettoCitta(cp,prove[j],w),ost); if(t<minimo){ minimo=t; meglio=j; if(!t) break; } }
    var v=prove[meglio], r=rettoCitta(cp,v,w), s=scritte[cp.id];
    if(!cp.v||cp.v.join()!==v.join()){ cp.v=v; s.setAttribute('x',(cp.x+v[0]*v[2]).toFixed(1)); s.setAttribute('y',(cp.y+v[1]).toFixed(1)); s.setAttribute('text-anchor',v[0]>0?'start':v[0]<0?'end':'middle'); }
    ost.push(r); messi.push(r);
  });
}
/* i nomi delle regioni si scansano di poco, in su o in giù o di lato; se non trovano posto si fanno chiari */
function piazzaNomi(messi){
  var ost=messi.slice(), prove;
  nomiPos.forEach(function(np){
    var a=.3*np.w; prove=[[0,0],[0,-13],[0,13],[0,-25],[0,25],[-a,0],[a,0],[-a,-13],[a,-13],[-a,13],[a,13],[0,-37],[0,37]];
    var meglio=0, minimo=1e9, j, t;
    for(j=0;j<prove.length;j++){ t=ingombro(rettoNome(np,prove[j]),ost); if(t<minimo){ minimo=t; meglio=j; if(!t) break; } }
    var o=prove[meglio], n=nomi[np.id];
    if(o[0]!==np.ox||o[1]!==np.oy){ np.ox=o[0]; np.oy=o[1]; n.setAttribute('x',(np.x+o[0]).toFixed(1)); n.setAttribute('y',(np.y+o[1]).toFixed(1)); }
    n.style.opacity=minimo>0?'.3':'';
    messi.push(rettoNome(np,o));
  });
}
var larghiL={};      // larghezza dei nomi dei luoghi, per testo e ingrandimento: misurarli costa (la pianta dei cartellini li rifà per tutte le tappe)
function disegnaLuoghi(k,H,messi,pos){
  while(stratoLuoghi.firstChild) stratoLuoghi.removeChild(stratoLuoghi.firstChild);
  pos.forEach(function(l){
    var q=l.q, p=l.p, x=l.x, y=l.y, fuori=l.fuori, citta=l.citta, lato=3.9*k, nc=Math.max(nucleoDi(x,y),6.3*k);
    var g=el('g',{'class':'m-luogo',transform:'translate('+x+' '+y+')'},stratoLuoghi);
    el('circle',{'class':'m-battito',r:(4.5*k).toFixed(1),style:'stroke:#241E1A;stroke-width:'+(1.6*k).toFixed(1)},g);
    el('rect',{x:(-lato).toFixed(1),y:(-lato).toFixed(1),width:(2*lato).toFixed(1),height:(2*lato).toFixed(1),transform:'rotate(45)',fill:'#241E1A',stroke:'#FBF6EA','stroke-width':(1.5*k).toFixed(1)},g);
    if(citta) return;                                                      // le città hanno già il nome scritto accanto
    var testo=p.nome+(fuori?' →':''), c=el('g',{},g), fondo=el('rect',{rx:3,ry:3,fill:'rgba(36,30,26,.92)'},c), t=el('text',{'text-anchor':'middle',fill:'#FBF6EA','font-size':(11*k).toFixed(1),style:'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-weight:600'},c);
    t.textContent=testo; var w=larghiL[testo+'|'+k]||0; if(!w){ try{ w=t.getComputedTextLength(); }catch(e){} if(w>4) larghiL[testo+'|'+k]=w; } var W=(w>4?w:testo.length*6.2*k)+12*k;
    /* di fianco, sopra, sotto, poi negli angoli e più lontano: vince il primo posto libero, o quello che copre di meno. Le distanze tengono conto di ciò che occupa il punto (rombo o anello) */
    var s=nc+1.7*k, dx=W/2+s, su=-H-s, dd=W/2+2*k, prove=[[dx,-H/2],[-dx,-H/2],[0,su],[0,s],[dd,su],[-dd,su],[dd,s],[-dd,s],[0,su-H-2*k],[0,s+H+2*k],[dd,su-H-2*k],[-dd,su-H-2*k],[dd,s+H+2*k],[-dd,s+H+2*k]], meglio=0, minimo=1e9, j, cx, cy, tocca;
    for(j=0;j<prove.length;j++){ cx=Math.max(bordo[0]-6+W/2,Math.min(bordo[1]+6-W/2,x+prove[j][0])); cy=y+prove[j][1]+H/2; tocca=Math.abs(cx-(x+prove[j][0]))>1?W*4:0;      // un posto che va spinto dentro il bordo vale meno
      tocca+=ingombro([cx,cy,W,H],messi);
      if(tocca<minimo){ minimo=tocca; meglio=j; if(!tocca) break; } }
    cx=Math.max(bordo[0]-6+W/2,Math.min(bordo[1]+6-W/2,x+prove[meglio][0])); var dy=prove[meglio][1];
    fondo.setAttribute('x',(-W/2).toFixed(1)); fondo.setAttribute('width',W.toFixed(1)); fondo.setAttribute('height',H.toFixed(1)); t.setAttribute('y',(H*.72).toFixed(1));
    c.setAttribute('transform','translate('+(cx-x).toFixed(1)+' '+dy.toFixed(1)+')');
    messi.push([cx,y+dy+H/2,W,H]);
  });
}
/* La scena dell'evento: marce (frecce), rotte per mare (tratteggio), scontri (spade incrociate), assedi (anello) e sacchi (fiamma), disegnati sopra la carta mentre la regia la tiene vicina.
   I dati stanno in SCENE_CARTA (js/dati.js): partenza e arrivo vengono dai testi, il tracciato fra i due è schematico. A tutto schermo, e per chi ha chiesto meno animazioni, la scena resta ferma sulla carta. */
var bordo=[103,897,63,565];      // fuori dalla regia rombi e segni stanno dentro la vista normale; durante la regia la carta si può spingere fino al suo vero bordo (Edessa, Nisibi)
var stratoScena=el('g',{'class':'m-scena'},svg), COLORI_SCENA={roma:['#F1D99A','#241E1A'],usurpatore:['#C98A2B','#241E1A'],altri:['#241E1A','#FBF6EA'],franchi:['#A9CBE6','#1F3345']};
function puntoDi(k){ var p=(G.luoghi||{})[k]||G.citta[k]; return p?[p.x,p.y]:null; }
/* Si disegna prima dei cartellini e mette fra gli ingombri (fissi) i suoi segni e le punte delle frecce, così nomi e cartellini li evitano.
   Ordine: gli anelli degli assedi attorno ai luoghi; le frecce, che si fermano sul bordo del rombo o dell'anello e, se arrivano in più d'una nello stesso posto,
   si aprono a ventaglio; infine spade e fiamme, che si mettono accanto al luogo dalla parte libera (prima sopra, poi di lato, sotto, negli angoli).
   Il disegno dipende solo da scena, luoghi, bordo e ingrandimento: se non cambiano (a tutto schermo, trascinando la carta) si riusa quello di prima. */
/* Marce e rotte senza gomiti a zig-zag. I punti di passaggio servono a non tagliare il mare (o la terra, per le rotte): nel solo disegno
   un punto troppo vicino al precedente o al seguente (meno di 9 unità per k, cioè una decina di pixel) si salta, e ogni angolo si arrotonda con una curva,
   ma solo se la linea nuova resta sulla terra (sul mare, per le rotte). La prova è sulla costa della carta (G.terra, il tracciato m-costa): un tratto vicino
   a un punto di passaggio che già cade fuori (una città sulla riva) è tollerato per 3 unità. */
var costaPath=svg.querySelector('.m-costa'), puntoProva=svg.createSVGPoint();
function aTerra(x,y){ puntoProva.x=x; puntoProva.y=y; try{ return costaPath.isPointInFill(puntoProva); }catch(e){ return null; } }
function morbida(pp,k,terra){
  var p=pp.map(function(v){ return [v[0],v[1]]; }), dmin=9*k, i, j, l1, l2;
  function buono(x,y){ var t=aTerra(x,y); return t===null||t===terra; }
  function vicinoACattivo(x,y,ends){ for(var m=0;m<ends.length;m++) if(!buono(ends[m][0],ends[m][1]) && Math.hypot(x-ends[m][0],y-ends[m][1])<3) return true; return false; }
  function tuttiBuoni(cam,ends){ for(var m=0;m<cam.length;m++) if(!buono(cam[m][0],cam[m][1]) && !vicinoACattivo(cam[m][0],cam[m][1],ends)) return false; return true; }
  function tratto(a,b){ var l=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(2,Math.ceil(l/1.5)), out=[]; for(var m=1;m<n;m++) out.push([a[0]+(b[0]-a[0])*m/n,a[1]+(b[1]-a[1])*m/n]); return out; }
  function dist(a,b){ return Math.hypot(b[0]-a[0],b[1]-a[1]); }
  /* 1. si saltano i punti troppo vicini, dal più stretto in su, finché la scorciatoia resta dalla parte giusta della costa */
  for(;;){
    var cand=[];
    for(i=1;i<p.length-1;i++){ l1=dist(p[i-1],p[i]); l2=dist(p[i],p[i+1]); if(Math.min(l1,l2)<dmin) cand.push([Math.min(l1,l2),i]); }
    cand.sort(function(a,b){ return a[0]-b[0]; });
    for(j=0;j<cand.length;j++){ i=cand[j][1]; if(tuttiBuoni(tratto(p[i-1],p[i+1]),[p[i-1],p[i+1]])) break; }
    if(j>=cand.length) break;
    p.splice(i,1);
  }
  /* 2. ogni angolo diventa una curva (a metà del raggio se la curva intera uscirebbe dalla terra; altrimenti resta l'angolo) */
  var out=[p[0]];
  for(i=1;i<p.length-1;i++){
    var a=p[i-1], v=p[i], b=p[i+1]; l1=dist(a,v); l2=dist(v,b);
    var r=Math.min(.45*l1,.45*l2,14*k), fatto=false;
    for(var prova=0;prova<2 && r>1 && !fatto;prova++,r/=2){
      var p0=[v[0]+(a[0]-v[0])*r/l1,v[1]+(a[1]-v[1])*r/l1], p1=[v[0]+(b[0]-v[0])*r/l2,v[1]+(b[1]-v[1])*r/l2], cam=[];
      for(j=0;j<=6;j++){ var t=j/6, u=1-t; cam.push([u*u*p0[0]+2*u*t*v[0]+t*t*p1[0],u*u*p0[1]+2*u*t*v[1]+t*t*p1[1]]); }
      if(tuttiBuoni(cam,[v])){ Array.prototype.push.apply(out,cam); fatto=true; }
    }
    if(!fatto) out.push(v);
  }
  out.push(p[p.length-1]);
  return out;
}
/* scalaScena: durante lo zoom della regia la carta si ingrandisce di z volte; la scena (frecce, anelli, segni) si disegna più piccola (per z alla 0,35: 0,73 quando la carta cresce di 2,5 volte),
   così sullo schermo cresce un poco ma non diventa enorme rispetto alla carta. I rombi dei luoghi (kr) restano come sono */
var scenaFatta=null, scalaScena=1, testoMin=0;      // testoMin: durante la regia, la misura dei nomi sulle frecce (unità per k), perché sullo schermo siano di 11,5 pixel a ogni ingrandimento e su ogni schermo
function disegnaScena(sc,kr,pos,fissi,k){
  k=k||kr;
  var kt=testoMin>0?testoMin:k, ch=[kr,k,kt.toFixed(3),bordo.join()].join('|'), quale=sc;
  if(scenaFatta && scenaFatta.sc===quale && scenaFatta.l===luoghiOra && scenaFatta.ch===ch){ nucleiOra=scenaFatta.nuclei; Array.prototype.push.apply(fissi,scenaFatta.fissi); return; }
  while(stratoScena.firstChild) stratoScena.removeChild(stratoScena.firstChild);
  var nuovi=[], nuclei={}, G5=.5*k;
  pos.forEach(function(l){ nuclei[chiave(l.x,l.y)]={c:6.3*kr,r:0}; });
  nucleiOra=nuclei;
  function dentro(p){ return [Math.max(bordo[0],Math.min(bordo[1],p[0])),Math.max(bordo[2],Math.min(bordo[3],p[1]))]; }
  /* le marce si tengono solo dentro il disegno: schiacciate sul bordo della vista normale (fuori dalla regia) la costa libica diventava una riga dritta sul mare */
  function dentroCarta(p){ return [Math.max(8,Math.min(G.w-8,p[0])),Math.max(8,Math.min(G.h-8,p[1]))]; }
  function metti(r){ fissi.push(r); nuovi.push(r); }
  sc=sc||[];
  /* una scena a passi (PASSI_CARTA): i segni di ogni passo stanno in un gruppo suo, che la regia accende, schiarisce o nasconde */
  var gp=[]; sc.forEach(function(e){ if(e.p!=null) while(gp.length<=e.p) gp.push(el('g',{'class':'passo','data-p':gp.length},stratoScena)); });
  function dove(e){ return e.p!=null?gp[e.p]:stratoScena; }
  sc.forEach(function(e){
    if(e[0]!=='assedio') return; var p=puntoDi(e[1]); if(!p) return; p=dentro(p);
    var g=el('g',{'class':'assedio',transform:'translate('+p[0]+' '+p[1]+')'},dove(e)), gi=el('g',{transform:'scale('+k+')'},g), n=chiave(p[0],p[1]);
    el('circle',{r:12,fill:'none',stroke:'#241E1A','stroke-width':2.2,'stroke-dasharray':'4 3'},gi); el('circle',{r:12,fill:'none',stroke:'#FBF6EA','stroke-width':.8,'stroke-dasharray':'4 3','stroke-dashoffset':3.5},gi);
    (nuclei[n]=nuclei[n]||{c:0,r:0}).r=13.1*k; metti([p[0],p[1],26.2*k,26.2*k,1]);
  });
  var frecce=[], gruppi={};
  sc.forEach(function(e){
    if(e[0]!=='marcia'&&e[0]!=='mare') return;
    var pp=[]; e[2].map(puntoDi).filter(Boolean).map(dentroCarta).forEach(function(p){ var u=pp[pp.length-1]; if(!u || Math.hypot(p[0]-u[0],p[1]-u[1])>.5) pp.push(p); });      // chi cade fuori dal bordo (Palmira, il Tigri, fuori dalla regia) sta sul bordo, come il suo rombo
    if(pp.length<2) return;
    var a=pp[pp.length-1], ctl=null, pts, da;
    if(pp.length===2){ var mx=(pp[0][0]+pp[1][0])/2, my=(pp[0][1]+pp[1][1])/2, nx=-(pp[1][1]-pp[0][1])*.12, ny=(pp[1][0]-pp[0][0])*.12; ctl=[mx+nx,my+ny]; da=ctl;
      pts=[]; for(var i=0;i<=16;i++){ var t=i/16, u1=1-t; pts.push([u1*u1*pp[0][0]+2*u1*t*ctl[0]+t*t*pp[1][0],u1*u1*pp[0][1]+2*u1*t*ctl[1]+t*t*pp[1][1]]); } }      // la curva, fatta a pezzetti
    else { pts=morbida(pp,k,e[0]==='marcia'); da=pts[pts.length-2]; }
    var f={e:e,pts:pts,a:a,f:Math.atan2(da[1]-a[1],da[0]-a[0]),n:nuclei[chiave(a[0],a[1])]}, c=chiave(a[0],a[1]); f.f0=f.f;
    frecce.push(f); (gruppi[c]=gruppi[c]||[]).push(f);
  });
  Object.keys(gruppi).forEach(function(c){      // frecce che arrivano nello stesso posto: almeno 60 gradi fra l'una e l'altra
    var gr=gruppi[c], it, i, u, v, d; if(gr.length<2) return; gr.sort(function(u,v){ return u.f-v.f; });
    for(it=0;it<12;it++) for(i=0;i<gr.length-1;i++){ u=gr[i]; v=gr[i+1]; d=v.f-u.f; if(d<Math.PI/3){ d=(Math.PI/3-d)/2; u.f-=d; v.f+=d; } }
  });
  /* il punto a distanza s dalla fine, camminando all'indietro lungo la spezzata: [x, y, indice dell'ultimo vertice che resta prima di lui] */
  function aRitroso(pts,s){
    for(var i=pts.length-1;i>0;i--){ var dx=pts[i][0]-pts[i-1][0], dy=pts[i][1]-pts[i-1][1], l=Math.hypot(dx,dy); if(s<=l){ var t=l?s/l:0; return [pts[i][0]-dx*t,pts[i][1]-dy*t,i-1]; } s-=l; }
    return [pts[0][0],pts[0][1],0];
  }
  /* frecce a ventaglio: l'ultimo tratto del cammino si piega piano attorno al luogo, finché arriva con l'angolo del ventaglio; l'ultimo pezzo, lungo r0, gira tutto */
  function piega(pts,a,delta,r0,r1){
    var out=[pts[pts.length-1]], sd=0, i, m, n;
    for(i=pts.length-1;i>0;i--){ var p=pts[i], q=pts[i-1], l=Math.hypot(p[0]-q[0],p[1]-q[1]); n=sd<r1?Math.max(1,Math.ceil(l/1.5)):1;
      for(m=1;m<=n;m++){ var t=m/n, x=p[0]+(q[0]-p[0])*t, y=p[1]+(q[1]-p[1])*t, dd=sd+l*t, w=dd<=r0?1:dd>=r1?0:(r1-dd)/(r1-r0); w=w*w*(3-2*w);
        var c=Math.cos(delta*w), sn=Math.sin(delta*w), dx=x-a[0], dy=y-a[1]; out.push([a[0]+dx*c-dy*sn,a[1]+dx*sn+dy*c]); }
      sd+=l; }
    return out.reverse();
  }
  /* La freccia: la linea finisce alla base della punta (mai oltre) e la punta prosegue l'ultimo tratto della linea, nella sua stessa direzione.
     Se la punta si ferma prima per non coprire un rombo o un anello, la linea si accorcia con lei. Punta lunga 8,5 e larga 9,2 unità per k; linea di 3,8 col bordo */
  frecce.forEach(function(f){
    var e=f.e, pts=f.pts, L=8.5*k, ux=Math.cos(f.f), uy=Math.sin(f.f), n=f.n, s=0, i, col=COLORI_SCENA[e[1]]||COLORI_SCENA.altri, cl=e[0]==='mare'?'mare':'marcia';
    var lungo=0, ventaglio=gruppi[chiave(f.a[0],f.a[1])].length>1;
    for(i=1;i<pts.length;i++) lungo+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
    if(lungo<12*k) return;      // un passaggio più corto della sua punta (lo stretto di Gibilterra) non si vede: lo dice già il rombo del luogo
    if(ventaglio && Math.abs(f.f-f.f0)>.01){ var r1=Math.min(lungo*.8,40*k); pts=piega(pts,f.a,f.f-f.f0,r1*.4,r1); }
    if(n&&n.r) s=n.r+1.2*k; else if(n&&n.c) s=n.c/Math.max(Math.abs(ux),Math.abs(uy))+1.2*k; else if(ventaglio) s=4*k;      // la punta si ferma sul bordo di ciò che sta nel punto
    /* b: la cima della punta; via: la linea, che finisce alla base */
    var b, via, ang, ingo;
    function prova(){
      var q=aRitroso(pts,s+L), j, pr; via=pts.slice(0,q[2]+1); via.push([q[0],q[1]]);
      for(j=via.length-2;j>0 && Math.hypot(via[j][0]-q[0],via[j][1]-q[1])<.6;j--);      // la direzione dell'ultimo tratto vero, non di un pezzetto di mezza unità
      pr=via[j]; ang=Math.atan2(q[1]-pr[1],q[0]-pr[0]);
      var ca=Math.cos(ang), sa=Math.sin(ang); b=[q[0]+ca*L,q[1]+sa*L];
      var xs=[0], ys=[0];      // ingombro della punta: i tre vertici del triangolo, ruotati, attorno alla cima
      [[-8.5,-4.6],[-8.5,4.6]].forEach(function(v){ xs.push((v[0]*ca-v[1]*sa)*k); ys.push((v[0]*sa+v[1]*ca)*k); });
      var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs), y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys);
      ingo=[b[0]+(x0+x1)/2,b[1]+(y0+y1)/2,x1-x0+1.3*k,y1-y0+1.3*k];
      return ingombro(ingo,fissi);
    }
    while(prova()>0 && s+L+4*k<lungo) s+=1.5*k;      // se tocca ancora un rombo, un anello o un'altra punta vicini, si ferma un po' prima
    /* anche la partenza non copre il rombo o l'anello del luogo da cui si muove: il tratto comincia sul loro bordo */
    var n0=nuclei[chiave(pts[0][0],pts[0][1])];
    if(n0 && via.length>1){ var vx=via[1][0]-via[0][0], vy=via[1][1]-via[0][1], vl=Math.hypot(vx,vy)||1, resta=n0.r?n0.r+1.2*k:n0.c/Math.max(Math.abs(vx/vl),Math.abs(vy/vl))+1.2*k;
      for(i=1;i<via.length-1||(i===via.length-1&&resta<Math.hypot(via[i][0]-via[i-1][0],via[i][1]-via[i-1][1])-3*k);i++){      // l'ultimo tratto deve restare lungo almeno un poco
        var l=Math.hypot(via[i][0]-via[i-1][0],via[i][1]-via[i-1][1]);
        if(resta<l){ via=[[via[i-1][0]+(via[i][0]-via[i-1][0])*resta/l,via[i-1][1]+(via[i][1]-via[i-1][1])*resta/l]].concat(via.slice(i)); break; }
        resta-=l; } }      // se il cammino è troppo corto resta com'è
    var d='M'+via.map(function(v){ return v[0].toFixed(1)+' '+v[1].toFixed(1); }).join('L'), pa=dove(e);
    el('path',{'class':cl+' sotto',d:d,pathLength:1,fill:'none',stroke:col[1],'stroke-width':(3.8*k).toFixed(2),'stroke-linecap':'round','stroke-linejoin':'round'},pa);
    el('path',{'class':cl,d:d,pathLength:1,fill:'none',stroke:col[0],'stroke-width':(2*k).toFixed(2),'stroke-linecap':'round','stroke-linejoin':'round'},pa);
    el('path',{'class':'punta',d:'M0 0L-8.5 -4.6L-8.5 4.6Z',transform:'translate('+b[0].toFixed(2)+' '+b[1].toFixed(2)+') rotate('+(ang*180/Math.PI).toFixed(1)+') scale('+k+')',fill:col[0],stroke:col[1],'stroke-width':1.2,'stroke-linejoin':'round'},pa);
    metti(ingo); f.via=via; f.col=col;
  });
  var ost=fissi.slice();      // spade e fiamme evitano anche i nomi, al loro posto di sempre
  nomiPos.forEach(function(np){ ost.push(rettoNome(np,[0,0])); });
  cittaPos.forEach(function(cp){ ost.push(rettoCitta(cp,[cp.lato,cp.dy,7],largaCitta(cp.id))); });
  /* Il nome sulla freccia (quarto elemento di una marcia: «Unni», «Ezio»): orizzontale, accanto alla linea (sopra, sotto o di lato), nel punto del cammino dove copre di meno
     le altre linee, i segni, i rombi e i nomi; si prova dal mezzo verso i capi. Diventa un ingombro anche lui, così spade e fiamme lo evitano */
  var linee=[], etichette=[];
  frecce.forEach(function(f){ if(!f.via) return; for(var i=1;i<f.via.length;i++){ var a=f.via[i-1], b2=f.via[i], l=Math.hypot(b2[0]-a[0],b2[1]-a[1]), n=Math.max(1,Math.ceil(l/(4*k)));
    for(var m=0;m<=n;m++) linee.push([a[0]+(b2[0]-a[0])*m/n,a[1]+(b2[1]-a[1])*m/n,4.4*k,4.4*k]); } });
  frecce.forEach(function(f){
    var nome=f.e[3]; if(!nome||!f.via||f.via.length<2) return;
    var t=el('text',{'class':'m-nome-freccia','text-anchor':'middle','font-size':(11*kt).toFixed(2),'stroke-width':(3.2*kt).toFixed(2),fill:f.col===COLORI_SCENA.franchi?'#1F3345':'#241E1A'},dove(f.e)); t.textContent=nome;
    var W=0; try{ W=t.getComputedTextLength(); }catch(x){} if(!(W>2)) W=nome.length*6.1*kt; W+=3*kt; var H=12.5*kt;
    var cum=[0], i; for(i=1;i<f.via.length;i++) cum.push(cum[i-1]+Math.hypot(f.via[i][0]-f.via[i-1][0],f.via[i][1]-f.via[i-1][1]));
    var L=cum[cum.length-1], meglio=null, minimo=1e12;
    [.5,.4,.6,.3,.7,.22,.78,.14].forEach(function(fr){
      var s=L*fr; for(i=1;i<cum.length-1&&cum[i]<s;i++); var u=(s-cum[i-1])/((cum[i]-cum[i-1])||1), x=f.via[i-1][0]+(f.via[i][0]-f.via[i-1][0])*u, y=f.via[i-1][1]+(f.via[i][1]-f.via[i-1][1])*u;
      [[0,-(H/2+3*k)],[0,H/2+3*k],[W/2+3.5*k,0],[-(W/2+3.5*k),0]].forEach(function(o,j){
        var r=[x+o[0],y+o[1],W,H], c=ingombro(r,ost)+ingombro(r,linee)+(r[0]-W/2<bordo[0]-4||r[0]+W/2>bordo[1]+4||r[1]-H/2<bordo[2]-4||r[1]+H/2>bordo[3]+4?400*k*k:0)+Math.abs(fr-.5)*4*k+j*.3*k;
        if(c<minimo){ minimo=c; meglio=r; } });
    });
    t.setAttribute('x',meglio[0].toFixed(1)); t.setAttribute('y',(meglio[1]+H*.34).toFixed(1)); metti(meglio); ost.push(meglio); etichette.push(meglio);
  });
  sc.forEach(function(e){
    var tipo=e[0]; if(tipo!=='scontro'&&tipo!=='fuoco'&&tipo!=='morte') return; var p=puntoDi(e[1]); if(!p) return; p=dentro(p);
    if(tipo==='morte'){      // una morte che conta nel racconto (Stilicone, Alarico): una croce in un tondo chiaro, accanto al luogo
      var mw=8.6*k, cm=Math.max(nucleoDi(p[0],p[1]),4*k)+G5, prm=[[0,-(cm+mw)],[cm+mw,0],[-(cm+mw),0],[0,cm+mw]], jm, rm, best=0, bm=1e9;
      for(jm=0;jm<prm.length;jm++){ rm=[p[0]+prm[jm][0],p[1]+prm[jm][1],2*mw,2*mw,1]; var tm=ingombro(rm,ost)+ingombro(rm,linee); if(tm<bm){ bm=tm; best=jm; if(!tm) break; } }
      rm=[p[0]+prm[best][0],p[1]+prm[best][1],2*mw,2*mw,1]; metti(rm); ost.push(rm);
      var gm=el('g',{'class':'morte',transform:'translate('+rm[0].toFixed(1)+' '+rm[1].toFixed(1)+')'},dove(e)), gmi=el('g',{transform:'scale('+k+')'},gm);
      gm._alt=altriPosti(p,cm+mw,cm+mw,[0,0]); gm._r=rm; gm._lc=[0,0];
      el('circle',{r:7.6,fill:'#FBF6EA',stroke:'#241E1A','stroke-width':1.4},gmi); el('path',{d:'M0 -4.8V5M-3.4 -1.6H3.4',fill:'none',stroke:'#241E1A','stroke-width':1.9,'stroke-linecap':'round'},gmi);
      return;
    }
    var scontro=tipo==='scontro', sw=(scontro?10.3:12.6)*k, sh=(scontro?10.3:13.1)*k, lc=scontro?[0,-15]:[1,-11.5], c=Math.max(nucleoDi(p[0],p[1]),4*k)+G5, ox=c+sw, oy=c+sh;
    var prove=[[0,-oy],[ox,0],[-ox,0],[0,oy],[ox,-oy],[-ox,-oy],[ox,oy],[-ox,oy]], meglio=0, minimo=1e9, j, r, t;
    for(j=0;j<prove.length;j++){ r=[p[0]+prove[j][0],p[1]+prove[j][1],2*sw,2*sh,scontro?1:0];
      t=ingombro(r,ost)+(r[0]-sw<bordo[0]-6||r[0]+sw>bordo[1]+6||r[1]-sh<bordo[2]-6||r[1]+sh>bordo[3]+6?500*k:0);      // fuori dal bordo vale meno
      if(t<minimo){ minimo=t; meglio=j; if(!t) break; } }
    r=[p[0]+prove[meglio][0],p[1]+prove[meglio][1],2*sw,2*sh,scontro?1:0]; metti(r); ost.push(r);
    var g=el('g',{'class':tipo,transform:'translate('+(r[0]-lc[0]*k).toFixed(1)+' '+(r[1]-lc[1]*k).toFixed(1)+')'},dove(e)), gi=el('g',{transform:'scale('+k+')'},g);
    g._alt=altriPosti(p,ox,oy,[lc[0]*k,lc[1]*k]); g._r=r; g._lc=[lc[0]*k,lc[1]*k];      // i posti di riserva, se poi una scritta finisce sotto (sistemaSegni)
    if(scontro){ el('circle',{r:9.5,cy:-15,fill:'#FBF6EA',stroke:'#8E2A2A','stroke-width':1.6},gi); el('path',{d:'M-5.2 -20.2L5.2 -9.8M5.2 -20.2L-5.2 -9.8M-5.9 -12.9L-2.3 -9.3M5.9 -12.9L2.3 -9.3',fill:'none',stroke:'#8E2A2A','stroke-width':1.9,'stroke-linecap':'round'},gi); }
    else el('path',{d:'M0 -24C5 -18 8 -14 6 -9C10 -11 9 -16 9 -16C13 -11 12 -4 6 -1C2 1 -3 1 -6 -1C-11 -4 -11 -11 -6 -15C-6 -11 -4 -10 -3 -11C-5 -16 -2 -20 0 -24Z',fill:'#E0672A',stroke:'#FBF6EA','stroke-width':1.1,'stroke-linejoin':'round'},gi);
  });
  scenaFatta={sc:quale,l:luoghiOra,ch:ch,fissi:nuovi,nuclei:nuclei,etichette:etichette};      // i nomi sulle frecce contano come scritte per sistemaSegni
  if(gp.length) classiPassi(passoInVista());      // ridisegnata durante la regia (cambia l'ingrandimento), la scena tiene il passo in corso
}
/* posti di riserva di un segno attorno al suo luogo p: le otto direzioni a una e a una volta e mezza la distanza; lc è lo scarto fra il centro del segno e il punto del suo disegno */
function altriPosti(p,ox,oy,lc){ var out=[]; [1,1.55].forEach(function(m){ [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]].forEach(function(d){ out.push([p[0]+d[0]*ox*m-lc[0],p[1]+d[1]*oy*m-lc[1]]); }); }); return out; }
/* Le battaglie, i fuochi e le croci non coprono le scritte (richiesta dell'utente, 23 novembre 2026). Si piazzano prima di nomi, città e cartellini, che poi li evitano;
   ma quando una scritta non trova un posto libero si mette dove copre di meno, anche sopra un segno. Allora, a scritte piazzate, è il segno che si sposta: nel primo dei suoi posti di riserva
   che non tocca scritte (né altri segni, rombi, punte), o in quello che ne tocca meno. Il conto si fa sulle posizioni d'arrivo, in unità della carta: sullo schermo i cartellini dei popoli
   scivolano per quasi un secondo e misurarli lì darebbe posti vecchi. Gli anelli degli assedi stanno sulla città e non si spostano: sono i cartellini a evitarli (migliorePop). */
var ultimiTesti=[], ultimiFissi=[];
function sistemaSegni(testi,fissi){
  var segni=[].slice.call(stratoScena.querySelectorAll('.scontro,.fuoco,.morte')).filter(function(g){ if(!g._alt) return false; var pa=g.parentNode; return !(pa.classList&&pa.classList.contains('passo')&&!pa.classList.contains('viva')&&passoInVista()!=null); });
  if(!segni.length||!testi) return;
  function senza(lista,r){ return lista.filter(function(x){ return x!==r; }); }
  segni.forEach(function(g){
    var r=g._r; if(!ingombro(r,testi)) return;
    var altri=senza(fissi,r).concat(segni.filter(function(h){ return h!==g; }).map(function(h){ return h._r; })), meglio=null, minimo=10*ingombro(r,testi)+ingombro(r,altri);
    for(var j=0;j<g._alt.length && minimo>0;j++){ var q=[g._alt[j][0]+g._lc[0],g._alt[j][1]+g._lc[1],r[2],r[3],r[4]], c=10*ingombro(q,testi)+ingombro(q,altri)+(q[0]<bordo[0]-6||q[0]>bordo[1]+6||q[1]<bordo[2]-6||q[1]>bordo[3]+6?1e6:0); if(c<minimo){ minimo=c; meglio=j; } }
    if(meglio==null) return;
    var nr=[g._alt[meglio][0]+g._lc[0],g._alt[meglio][1]+g._lc[1],r[2],r[3],r[4]], i=fissi.indexOf(r); if(i>=0) fissi[i]=nr;
    g._r=nr; g.setAttribute('transform','translate('+g._alt[meglio][0].toFixed(1)+' '+g._alt[meglio][1].toFixed(1)+')');
  });
}
/* il passo che si vede quando la regia non c'è (a tutto schermo, o per chi ha chiesto meno animazioni): l'ultimo, con i precedenti più chiari */
function passoInVista(){ return passoOra!=null?passoOra:passiOra?passiOra.length-1:null; }
/* Regia: a ogni tappa la carta si avvicina ai luoghi dell'evento, li mostra per qualche secondo con una didascalia e torna alla vista intera.
   Anche a tutto schermo, se chi guarda non ha mosso la carta (dal 23 novembre 2026: «Perché non si vede lo zoom quando metto la mappa a piena pagina?»); mai per chi ha chiesto meno animazioni.
   Se i luoghi sono troppo lontani fra loro la carta resta intera. */
/* Scene a passi (PASSI_CARTA in js/dati.js): passoOra è il passo che la regia mostra (null: nessuno, si vedono tutti insieme). I passi già visti restano più chiari (classe prima),
   quello in corso si disegna (viva), i seguenti non si vedono. Un passo può ricolorare alcune regioni: la carta torna ai colori della tappa a regia finita. */
var passiOra=null, passoOra=null, luoghiRegia=null, statiTappa={}, ricolorata=false;
function classiPassi(i){
  var gs=stratoScena.querySelectorAll('.passo'); for(var j=0;j<gs.length;j++){ var p=+gs[j].getAttribute('data-p'); gs[j].setAttribute('class','passo'+(i==null?'':p<i?' prima':p===i?' viva':'')); }
}
function coloraRegioni(stati){
  for(var id in regioni){
    var s=stati[id]||'perso', chi=s.indexOf('regno:')===0?s.slice(6):''; if(chi) s='regno';
    regioni[id].setAttribute('class','m-regione '+s); regioni[id].style.color=chi&&REGNI[chi]?REGNI[chi][0]:'';
    if(nomi[id]) nomi[id].setAttribute('class','m-nome'+(s==='perso'||s==='conteso'?' chiaro':''));
  }
}
function statiPasso(i){ var q=passiOra&&passiOra[i], o={}, k; for(k in statiTappa) o[k]=statiTappa[k]; if(q&&q.regioni) for(k in q.regioni) o[k]=q.regioni[k]; return o; }
/* la barra dei passi, sotto la carta (a tutto schermo in alto a destra, sopra la carta): un bottone per passo (l'anno) e uno per ricominciare. Toccato, un passo fa ripartire la regia da lì */
var barraPassi=document.createElement('div'); barraPassi.className='m-passi'; barraPassi.hidden=true; barraPassi.setAttribute('role','group'); barraPassi.setAttribute('aria-label','La scena passo per passo'); ospite.parentNode.insertBefore(barraPassi,rigaLuoghi);      // sotto la carta, sopra la riga dei luoghi: sulla carta coprirebbe l'anno
function faiBarra(){
  barraPassi.textContent=''; barraPassi.hidden=!passiOra; if(!passiOra) return;
  var et=document.createElement('b'); et.textContent='Passo per passo'; barraPassi.appendChild(et);
  var b0=document.createElement('button'); b0.type='button'; b0.className='m-passo-via'; b0.textContent='▶'; b0.title='Rivedi la scena dall\'inizio'; b0.setAttribute('aria-label','Rivedi la scena dall\'inizio'); barraPassi.appendChild(b0);
  b0.addEventListener('click',function(){ suPasso(0,true); });
  passiOra.forEach(function(q,i){ var b=document.createElement('button'); b.type='button'; b.className='m-passo'; b.textContent=q.b||q.a; b.setAttribute('aria-label','Passo '+(i+1)+', '+q.a+': '+q.t); b.title=q.t; barraPassi.appendChild(b);
    b.addEventListener('click',function(){ suPasso(i); }); });
}
function segnaPasso(i){ var bs=barraPassi.querySelectorAll('.m-passo'); for(var j=0;j<bs.length;j++){ if(j===i) bs[j].setAttribute('aria-current','step'); else bs[j].removeAttribute('aria-current'); }
  if(bs[i] && barraPassi.scrollWidth>barraPassi.clientWidth) barraPassi.scrollLeft=bs[i].offsetLeft-barraPassi.clientWidth/2+bs[i].offsetWidth/2; }      // a tutto schermo la barra scorre: il passo acceso resta in vista
function suPasso(i,daCapo){
  if(!pocoMoto){ avviaRegia(luoghiRegia,scenaOra,i,true); return; }
  /* chi ha chiesto meno animazioni: il passo si mostra fermo, senza zoom; toccato di nuovo, si torna alla scena intera.
     ▶ (daCapo) fa tutto il giro anche qui (23 novembre 2026, l'utente: «quando clicchi su play dovrebbe fare tutto il giro»): un passo dopo l'altro, fermi, col tempo di leggere */
  if(daCapo){ giroFermo(0); return; }
  if(passoOra===i){ fermaRegia(); return; }
  mostraFermo(i);
}
function mostraFermo(i){
  fermaRegia(); passoOra=i; svg.classList.add('in-passi'); classiPassi(i); stratoScena.setAttribute('class','m-scena passi ferma'); coloraRegioni(statiPasso(i)); ricolorata=true; segnaPasso(i);
  scriviDidascalia({i:i}); didascalia.classList.add('viva');
}
var giro=0;
function giroFermo(i){ if(!passiOra || i>=passiOra.length){ fermaRegia(); return; } mostraFermo(i); giro=setTimeout(function(){ giroFermo(i+1); },Math.min(7500,2800+passiOra[i].t.length*22)); }
/* La didascalia della regia si può chiudere (23 novembre 2026, l'utente: «anche qui la scritta dovrebbe essere chiudibile»): la × la toglie per questa tappa, la regia continua;
   resta una «i» rotonda che la riporta. Alla tappa seguente ricompare. */
var regia=null, scenaOra=null, annoVisto=null, didChiusa=false, didascalia=document.createElement('div'); didascalia.className='m-didascalia'; ospite.appendChild(didascalia);
var didTesto=document.createElement('div'); didTesto.className='m-did-testo'; didTesto.setAttribute('aria-hidden','true'); didascalia.appendChild(didTesto);
var didX=document.createElement('button'); didX.type='button'; didX.className='m-did-chiudi'; didX.textContent='×'; didX.setAttribute('aria-label','Chiudi la didascalia'); didascalia.appendChild(didX);
var didI=document.createElement('button'); didI.type='button'; didI.className='m-did-riapri'; didI.textContent='i'; didI.title='Mostra la didascalia'; didI.setAttribute('aria-label','Mostra la didascalia'); didascalia.appendChild(didI);
function chiudiDid(si){ didChiusa=si; didascalia.classList.toggle('chiusa',si); }
didX.addEventListener('click',function(e){ e.stopPropagation(); chiudiDid(true); });
didI.addEventListener('click',function(e){ e.stopPropagation(); chiudiDid(false); });
var pocoMoto=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches && !/[?&]moto=1/.test(location.search);      // ?moto=1 forza l'animazione, per le prove
function fermaRegia(){
  var r=regia; if(r){ cancelAnimationFrame(r.rf); regia=null; }
  clearTimeout(giro); giro=0;      // anche il giro dei passi fermi
  passoOra=null; svg.classList.remove('in-passi'); classiPassi(passoInVista()); segnaPasso(-1); if(ricolorata){ ricolorata=false; coloraRegioni(statiTappa); }
  if(bordo[0]!==103){ bordo=[103,897,63,565]; scalaScena=1; testoMin=0; if(annoVisto!=null) mostraPopoli(annoVisto); }
  didascalia.classList.remove('viva'); document.body.classList.remove('carta-in-regia');
  stratoScena.setAttribute('class','m-scena'+(grandeSi||pocoMoto?' viva ferma':''));
  if(!grandeSi) svg.setAttribute('viewBox',BASE.join(' ')); else if(r) applicaVista();      // a tutto schermo si torna alla vista di chi guarda
}
function riquadroLuoghi(l,massimo,minimo){      // minimo: di quante volte al più si avvicina; con minimo (i passi) anche i margini sono più stretti
  var xs=[], ys=[]; l.forEach(function(q){ var p=(G.luoghi||{})[q[0]]||G.citta[q[0]]; if(p){ xs.push(Math.max(8,Math.min(G.w-8,p.x))); ys.push(Math.max(8,Math.min(G.h-8,p.y))); } });
  if(!xs.length) return null;
  var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs), y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys), rap=BASE[3]/BASE[2];
  var mx=minimo?160:230, my=minimo?130:170, w=Math.max(BASE[2]/(minimo||2.5),x1-x0+mx), h=w*rap; if(h<y1-y0+my){ h=y1-y0+my; w=h/rap; }
  if(w>BASE[2]*(massimo||.8)) return null;
  return [Math.max(0,Math.min(G.w-w,(x0+x1)/2-w/2)), Math.max(0,Math.min(G.h-h,(y0+y1)/2-h/2)), w, h];
}
function testoDi(a){ var w=svg.getBoundingClientRect().width; return w>0?11.5/11*a[2]/w:0; }      // 11,5 pixel sullo schermo con quell'inquadratura
function scalaDi(a){ return Math.min(1,Math.pow(a[2]/BASE[2],.35)); }
function fondoDi(l){ var y=-1e9; l.forEach(function(q){ var p=puntoDi(q[0]); if(p) y=Math.max(y,Math.min(G.h-8,p[1])); }); return y; }      // il punto più basso della scena
function capiDi(sc){ var capi=[]; sc.forEach(function(e){ if(e[0]==='marcia'||e[0]==='mare') e[2].forEach(function(q){ capi.push([q]); }); else capi.push([e[1]]); }); return capi; }
/* a tutto schermo il riquadro della carta ha un altro rapporto: la finestra della regia lo prende, restando dentro il disegno */
function suSchermo(a){
  if(!grandeSi) return a; var rc=svg.getBoundingClientRect(), q=rc.width/(rc.height||1); if(!(q>0)) return a;
  var w=a[2], h=a[3]; if(w/h>q) h=w/q; else w=h*q; if(w>G.w){ w=G.w; h=w/q; } if(h>G.h){ h=G.h; w=h*q; }
  var cx=a[0]+a[2]/2, cy=a[1]+a[3]/2; return [Math.max(0,Math.min(G.w-w,cx-w/2)),Math.max(0,Math.min(G.h-h,cy-h/2)),w,h];
}
function scriviDidascalia(f){
  didTesto.textContent='';
  if(f.i!=null){ var q=passiOra[f.i], s=document.createElement('span'), b=document.createElement('b'); b.textContent=q.a+' · '; s.appendChild(b); s.appendChild(document.createTextNode(q.t)); didTesto.appendChild(s); return; }
  var a=f.a; f.l.forEach(function(q){ var p=(G.luoghi||{})[q[0]]||G.citta[q[0]]; if(!p) return; var px=Math.max(8,Math.min(G.w-8,p.x)); if(px<a[0]-2||px>a[0]+a[2]+2||p.y<a[1]-2||p.y>a[1]+a[3]+2) return;      // nella didascalia solo i luoghi che lo zoom inquadra
    var s=document.createElement('span'), b=document.createElement('b'); b.textContent=p.nome; s.appendChild(b); s.appendChild(document.createTextNode(': '+q[1])); didTesto.appendChild(s); });
}
/* La regia è una fila di inquadrature: per una scena semplice una sola, per una scena a passi una per passo (da «da» in poi). Ognuna entra in 0,9 secondi dalla precedente e resta ferma
   il tempo di leggere la didascalia; alla fine la carta torna alla vista di partenza. A tutto schermo parte solo se chi guarda non ha mosso la carta (o se ha toccato un passo), e si ferma al primo tocco */
function avviaRegia(l,sc,da,forza){
  fermaRegia(); luoghiRegia=l;
  if(pocoMoto) return;
  if(grandeSi && (!forza && !vista.libera || Object.keys(dita).length)) return;
  var passi=passiOra, foto=[], i, a;
  if(passi){ for(i=da||0;i<passi.length;i++){ var cp=capiDi(passi[i].sc).concat((passi[i].vista||[]).map(function(k){ return [k]; })); foto.push({a:riquadroLuoghi(cp,.92,3.4)||BASE.slice(),i:i,y1:fondoDi(cp)}); } }      // vista: luoghi da tenere nell'inquadratura anche senza segni (un passo che racconta soltanto)      // un passo può stare stretto: la carta si avvicina fino a 3,4 volte
  else {
    if(!l || !l.length) return;
    a=null; if(sc && sc.length) a=riquadroLuoghi(capiDi(sc),.92);      // con una scena, lo zoom tiene dentro marce e rotte
    if(!a) a=riquadroLuoghi(l); if(!a){ l=l.slice(0,1); a=riquadroLuoghi(l); }      // luoghi troppo lontani fra loro: la carta si avvicina al primo, quello del titolo
    if(!a) return; foto.push({a:a,l:l,y1:fondoDi(sc&&sc.length?capiDi(sc):l)});
  }
  if(!foto.length) return;
  bordo=[8,G.w-8,8,G.h-8]; scalaScena=scalaDi(foto[0].a); testoMin=testoDi(foto[0].a);      // ogni inquadratura ha la sua misura della scena: un passo largo (la guerra persiana) non si disegna minuscolo
  if(passi){ passoOra=foto[0].i; stratoScena.setAttribute('class','m-scena passi'); }
  if(annoVisto!=null) mostraPopoli(annoVisto);      // con il bordo vero della carta si rifanno scena, nomi e cartellini
  foto.forEach(function(f){ f.a=suSchermo(f.a); f.ferma=f.i!=null?Math.min(7500,2800+passi[f.i].t.length*22):sc&&sc.length?4500:3200; });
  var vb=(svg.getAttribute('viewBox')||BASE.join(' ')).split(/[ ,]+/).map(Number), r=regia={t0:0,rf:0,n:-1,da:vb,foto:foto,fine:false}, ENTRA=900, ESCE=900;
  function inizia(n){
    var f=foto[n]; r.n=n; scriviDidascalia(f); didascalia.classList.add('viva'); document.body.classList.add('carta-in-regia');      // a tutto schermo, sulla carta larga, la riga dei luoghi in alto si nasconde
    /* la didascalia copre il fondo della carta: l'inquadratura scende di metà della sua altezza, così la scena sta nella parte libera (al più 55 unità: il margine del riquadro è di 65 unità per lato nei passi, 85 altrove) */
    var hs=svg.getBoundingClientRect().height, c=hs>0?Math.min(.45,(didascalia.offsetHeight+12)/hs):0; var sp=Math.min(55,c*f.a[3]/2), y0=Math.max(0,Math.min(G.h-f.a[3],f.a[1]+sp)), alto=c>0 && f.y1>y0+f.a[3]*(1-c)-30;      // anche così la scena finirebbe sotto la didascalia (la costa d'Africa), o ci starebbe a meno di 30 unità, che servono al nome sotto la freccia: la didascalia va in alto
    didascalia.classList.toggle('in-alto',alto); if(c>0) f.a=[f.a[0],alto?Math.max(0,Math.min(G.h-f.a[3],f.a[1]-sp)):y0,f.a[2],f.a[3]];
    var sn=scalaDi(f.a), tm=testoDi(f.a); if(Math.abs(sn-scalaScena)>.02 || Math.abs(tm-testoMin)>.02){ scalaScena=sn; testoMin=tm; if(annoVisto!=null) mostraPopoli(annoVisto); svg.getBoundingClientRect(); }      // ridisegnata col passo di prima: il nuovo poi si traccia
    if(f.i!=null){ svg.classList.add('in-passi'); passoOra=f.i; classiPassi(f.i); segnaPasso(f.i); coloraRegioni(statiPasso(f.i)); ricolorata=true; }
    sistemaSegni(ultimiTesti,ultimiFissi);      // con il passo nuovo acceso
  }
  function passo(ora){
    if(regia!==r) return; if(!r.t0) r.t0=ora;
    var t=ora-r.t0, acc=0, n, u, k, A, B;
    for(n=0;n<foto.length;n++){ if(t<acc+ENTRA+foto[n].ferma) break; acc+=ENTRA+foto[n].ferma; }
    if(n<foto.length){
      if(n!==r.n) inizia(n);
      u=t-acc; k=Math.min(1,u/ENTRA); A=n?foto[n-1].a:r.da; B=foto[n].a;
      if(!passi && u>ENTRA*.7 && !r.viva){ r.viva=true; stratoScena.setAttribute('class','m-scena viva'); }
    } else {
      if(!r.fine){ r.fine=true; didascalia.classList.remove('viva'); document.body.classList.remove('carta-in-regia'); passoOra=null; svg.classList.remove('in-passi'); classiPassi(passoInVista()); segnaPasso(-1); if(ricolorata){ ricolorata=false; coloraRegioni(statiTappa); }
        stratoScena.setAttribute('class','m-scena'+(grandeSi?' viva ferma':'')); }
      u=t-acc; k=Math.min(1,u/ESCE); A=foto[foto.length-1].a; B=r.da;
      if(u>=ESCE){ fermaRegia(); return; }
    }
    k=k*k*(3-2*k);
    svg.setAttribute('viewBox',[0,1,2,3].map(function(j){ return (A[j]+(B[j]-A[j])*k).toFixed(1); }).join(' '));
    r.rf=requestAnimationFrame(passo);
  }
  r.rf=requestAnimationFrame(passo);
}
/* Dove sta un popolo in un anno: visibile o no, colore (rapporto con Roma), punto [anno, x, y, …] e nome */
function statoPopolo(id,anno){
  var q=popoli[id].q, u=-1, i; for(i=0;i<q.t.length;i++) if(anno>=q.t[i][0]) u=i;
  var via=u<0||anno>q.fine, cl=via?'via':CLASSE[q.t[u][3]], v=q.t[Math.max(0,u)], nome=q.nome;
  for(i=0;i<q.poi.length;i++) if(anno>=q.poi[i][0]) nome=q.poi[i][1];
  if(cl==='regno' && REGNO[id]) nome=id==='franchi'&&anno>=843?'Regni dei Franchi':id==='franchi'&&anno>=800?'Impero dei Franchi':REGNO[id];      // dopo il Natale dell'800 e dopo la divisione di Verdun il nome cambia
  return {u:u,via:via,cl:cl,v:v,nome:nome};
}
/* la larghezza di un cartellino, misurata su un testo nascosto con le stesse misure (--pf) */
var misuraPop=el('text',{},el('g',{'class':'m-cartello',style:'visibility:hidden'},svg)), larghePop={};
function larghezzaPop(nome,k){
  var c=nome+'|'+k, w=larghePop[c]; if(w) return w;
  misuraPop.textContent=nome; w=0; try{ w=misuraPop.getComputedTextLength(); }catch(e){}
  if(w>4){ w+=12*k; larghePop[c]=w; return w; }
  return nome.length*5.6*k+12*k;
}
/* i posti che un cartellino prova, in ordine di preferenza: sopra il punto, sotto, di fianco, negli angoli, più lontano. nc: ciò che occupa il punto (rombo o anello), da cui il cartellino esce */
function postiPop(W,nc,k,H){
  var su=Math.max(7*k,nc+1.5*k), giu=Math.max(8*k,nc+1.5*k), lato=W/2+Math.max(9*k,nc+1.5*k), dd=W/2+3*k;
  return [[0,-H-su],[0,giu],[lato,-H/2],[-lato,-H/2],[dd,-H-su],[-dd,-H-su],[dd,giu],[-dd,giu],[0,-2*H-su-2*k],[0,H+giu+2*k],[dd,-2*H-su-2*k],[-dd,-2*H-su-2*k],[lato,-H-su],[-lato,-H-su],[lato,giu],[-lato,giu],[0,-3*H-su-4*k]];
}
/* per la pianta delle soste, dopo i posti vicini, qualche posto più lontano: meglio un cartellino un po' discosto ma fermo che uno che salta in una tappa
   (i Burgundi del 406 a tutto schermo sul telefono: lì la marcia e il rombo di Magonza occupano tutti i posti vicini). Si usano solo se i vicini costano eccezioni. */
function postiLontani(W,nc,k,H){
  var su=Math.max(7*k,nc+1.5*k), giu=Math.max(8*k,nc+1.5*k), lato=W/2+Math.max(9*k,nc+1.5*k)+W*.55, dd=W/2+3*k+W*.5;
  return [[0,-4*H-su-6*k],[0,2*H+giu+4*k],[lato,-H/2],[-lato,-H/2],[lato,-H-su],[-lato,-H-su],[lato,giu],[-lato,giu],[dd,-3*H-su-4*k],[-dd,-3*H-su-4*k],[dd,2*H+giu+4*k],[-dd,2*H+giu+4*k]];
}
function rettoPop(v,o,W,H){ return [Math.max(97+W/2,Math.min(903-W/2,v[1]+o[0])),v[2]+o[1]+H/2,W,H]; }
function migliorePop(v,prove,W,H,ost,segni){      // il primo posto libero, o quello che copre di meno; coprire un segno della scena (segni) costa venti volte tanto: battaglie e assedi non stanno sopra i nomi
  var meglio=0, minimo=1e9, j, t;
  for(j=0;j<prove.length;j++){ t=ingombro(rettoPop(v,prove[j],W,H),ost)+(segni?19*ingombro(rettoPop(v,prove[j],W,H),segni):0); if(t<minimo){ minimo=t; meglio=j; if(!t) break; } }
  return prove[meglio];
}
/* Cartellini fermi durante la sosta. Finché un popolo resta nello stesso punto con lo stesso nome in tappe consecutive (una «sosta»), il suo cartellino
   sta nello stesso posto in tutte quelle tappe: prima un popolo sembrava spostarsi solo perché in una tappa comparivano i rombi di Treviri e Milano.
   La pianta si fa per tutte le tappe insieme e per un ingrandimento k: per ogni tappa si rifanno in prova (fuori vista) rombi, scena, nomi e cartellini
   dei luoghi; poi, popolo per popolo e sosta per sosta, vince il posto che costringe a meno eccezioni e, fra questi, sommato su tutte le tappe della sosta
   copre di meno (nomi, cartellini dei luoghi); a parità il primo della lista, che è il più vicino. In una tappa in cui quel posto copre un rombo, un segno
   della scena o un altro cartellino si accetta l'eccezione: lì il cartellino cerca il suo posto da solo. Cambiando misure (telefono, tutto schermo, ingrandimento) la pianta si rifà. */
var piante={}, piantaDopo=0, piantaFatta=0, BORDO=[103,897,63,565];
function tappeCarta(){ return ((window.RM_DATI||{}).TAPPE||[]).filter(function(t){ return t.regioni; }); }      // anche gli intermezzi (284, 395, 439, 476): la carta li mostra
function chiaveTappa(anno,l,sc){ return anno+'|'+(l||[]).map(function(q){ return q[0]; }).join()+'|'+(sc?sc.length:0); }      // l'intermezzo del 395 e la tappa del 395 hanno lo stesso anno
function ingombriTappa(t,k,H){
  var salva=[luoghiOra,scenaFatta,stratoScena,stratoLuoghi,bordo,nucleiOra], bz=scritte.costantinopoli, nb=bz?bz.textContent:'';
  luoghiOra=t.luoghi||[]; scenaFatta=null; bordo=BORDO; stratoScena=el('g',{}); stratoLuoghi=el('g',{style:'visibility:hidden'},svg);
  if(bz) bz.textContent=t.anno<330?'Bisanzio':G.citta.costantinopoli.nome;
  var pos=posLuoghi(), fissi=pos.map(function(l){ return [l.x,l.y,12.6*k,12.6*k]; });
  disegnaScena(t.scena||null,k,pos,fissi);
  var messi=fissi.slice(); piazzaCitta(k,fissi,messi); piazzaNomi(messi); disegnaLuoghi(k,H,messi,pos);
  var out={fissi:fissi,messi:messi,nuclei:nucleiOra};
  svg.removeChild(stratoLuoghi); if(bz) bz.textContent=nb;
  luoghiOra=salva[0]; scenaFatta=salva[1]; stratoScena=salva[2]; stratoLuoghi=salva[3]; bordo=salva[4]; nucleiOra=salva[5];
  return out;
}
function faiPianta(k){
  var T=tappeCarta(), H=15*k, ob=T.map(function(t){ return ingombriTappa(t,k,H); }), posti=T.map(function(){ return []; }), out={}, soste=[], id, n=0;
  for(id in popoli){
    var st=T.map(function(t){ return statoPopolo(id,t.anno); }), i=0, f; out[id]={};
    while(i<T.length){
      if(st[i].via){ i++; continue; }
      var v=st[i].v; for(f=i;f+1<T.length && !st[f+1].via && st[f+1].v[1]===v[1] && st[f+1].v[2]===v[2] && st[f+1].nome===st[i].nome;) f++;
      soste.push({id:id,i:i,f:f,v:v,nome:st[i].nome,n:n++}); i=f+1;
    }
  }
  soste.sort(function(a,b){ return (b.f-b.i)-(a.f-a.i) || a.n-b.n; });      // scelgono prima le soste più lunghe: è lì che un cartellino che salta si nota di più
  soste.forEach(function(so){
    var v=so.v, a, j, W=larghezzaPop(so.nome,k), nc=0; for(a=so.i;a<=so.f;a++) nc=Math.max(nc,nucleoIntorno(v[1],v[2],ob[a].nuclei));
    var prove=postiPop(W,nc,k,H).concat(postiLontani(W,nc,k,H)), meglio=0, minimo=1e9, r, tot;
    for(j=0;j<prove.length;j++){ r=rettoPop(v,prove[j],W,H); tot=0;
      for(a=so.i;a<=so.f;a++) tot+=ingombro(r,ob[a].fissi)+ingombro(r,posti[a])>0?1e5:ingombro(r,ob[a].messi);      // ogni tappa in cui il posto copre qualcosa che non si sposta costa un'eccezione: prima le meno eccezioni, poi il meno ingombro
      if(tot<minimo){ minimo=tot; meglio=j; if(!tot) break; } }
    for(a=so.i;a<=so.f;a++){ var o=prove[meglio]; r=rettoPop(v,o,W,H);
      if(ingombro(r,ob[a].fissi)+ingombro(r,posti[a])>0){ o=migliorePop(v,prove,W,H,ob[a].messi.concat(posti[a]),ob[a].fissi); r=rettoPop(v,o,W,H); }      // l'eccezione
      out[so.id][chiaveTappa(T[a].anno,T[a].luoghi,T[a].scena)]={o:o}; posti[a].push(r); }
  });
  return {k:k,p:out};
}
/* la pianta per l'ingrandimento k; a tutto schermo, mentre si ingrandisce la carta, intanto vale quella più vicina (riscalata) e la nuova si fa a mano ferma */
function piantaPer(k){
  if(piante[k]) return piante[k];
  var ks=Object.keys(piante);
  if(!grandeSi || !ks.length || Date.now()-piantaFatta>600){ if(ks.length>8) piante={}; piante[k]=faiPianta(k); piantaFatta=Date.now(); return piante[k]; }      // si aspetta solo se l'ultima pianta è appena stata fatta: si sta ingrandendo
  clearTimeout(piantaDopo); piantaDopo=setTimeout(function(){ if(ingr===k && !piante[k]){ piante[k]=faiPianta(k); piantaFatta=Date.now(); if(annoVisto!=null) mostraPopoli(annoVisto); } },300);
  var vicina=ks.reduce(function(m,c){ return Math.abs(c-k)<Math.abs(m-k)?c:m; });
  return piante[vicina];
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ piante={}; larghePop={}; larghiL={}; larghe={}; if(annoVisto!=null) mostraPopoli(annoVisto); });      // con i caratteri veri le misure cambiano
function mostraPopoli(anno){
  var visti={}, id, i;
  /* su uno schermo stretto la carta rimpicciolisce: cartellini e punti si ingrandiscono per restare leggibili */
  /* a tutto schermo restano della stessa misura sullo schermo anche quando si ingrandisce la carta */
  var lw=svg.getBoundingClientRect().width, ppu=lw>0?lw/larghezzaVista():1, k=lw<=0?1:grandeSi?Math.max(.4,Math.min(1.8,Math.max(10,Math.min(14,Math.min(window.innerWidth,window.innerHeight)/40))/11.5/ppu)):Math.max(1,Math.min(1.8,.7/ppu));      // a tutto schermo: scritte di 10-14 pixel
  k=Math.round(k*20)/20;
  if(k!==ingr){ ingr=k; svg.style.setProperty('--pf',(11.5*k).toFixed(1)+'px'); for(id in popoli) popoli[id].punto.setAttribute('r',(4*k).toFixed(1)); }
  var pianta=piantaPer(k), sc=pianta?k/pianta.k:1;
  /* l'ordine conta: prima ciò che non si sposta (rombi), poi la scena (anelli, frecce, spade, fiamme), poi i cartellini dei popoli che hanno il posto della loro sosta,
     poi i nomi di città e regioni e i cartellini dei luoghi, che si scansano e li evitano; infine i cartellini dei popoli che il posto della sosta qui non l'hanno */
  var H=15*k, pos=posLuoghi(), fissi=pos.map(function(l){ return [l.x,l.y,12.6*k,12.6*k]; });
  disegnaScena(scenaOra,k,pos,fissi,k*scalaScena);
  var posti=[], qui={};
  for(id in popoli){
    var p=popoli[id], q=p.q, s=statoPopolo(id,anno), u=s.u, via=s.via, cl=s.cl, v=s.v, nome=s.nome;
    p.g.setAttribute('class','m-popolo '+cl); p.g.style.transform='translate('+v[1]+'px,'+v[2]+'px)';
    if(p.nome!==nome){ p.nome=nome; p.t.textContent=nome; }
    var d='', da=Math.max(0,u-1), tratti=0;      // solo l'ultimo tratto: il cammino che ha portato il gruppo dov'è ora
    if(!via && anno-q.t[u][0]<=(cl==='regno'?5:25)) for(i=da;i<=u;i++){ if(i<u && q.t[u][0]-q.t[i][0]>40) continue; if(i>da && q.t[i][1]===q.t[i-1][1] && q.t[i][2]===q.t[i-1][2]) continue; if(d){ tratti++; if(q.t[i][4]) for(var w=0;w<q.t[i][4].length;w++) d+='L'+q.t[i][4][w][0]+' '+q.t[i][4][w][1]; } d+=(d?'L':'M')+q.t[i][1]+' '+q.t[i][2]; }
    if(!tratti) d='';
    p.rotta.setAttribute('d',d||'M0 0'); p.sotto.setAttribute('d',d||'M0 0'); p.rotta.setAttribute('class','m-rotta '+(d?cl:'via')); p.sotto.setAttribute('class','m-rotta-f'+(d?'':' via'));
    if(via) continue;
    visti[cl]=1;
    /* il posto della sosta, dalla pianta; se qui copre un rombo, un segno della scena o un altro cartellino (durante lo zoom la scena cambia), il cartellino cercherà il suo posto da solo */
    var W=larghezzaPop(nome,k), x=pianta&&pianta.p[id]&&pianta.p[id][chiaveTappa(anno,luoghiOra,scenaOra)], o=x?[x.o[0]*sc,x.o[1]*sc]:null;
    if(o && ingombro(rettoPop(v,o,W,H),fissi)+ingombro(rettoPop(v,o,W,H),posti)>0) o=null;
    if(o) posti.push(rettoPop(v,o,W,H));
    qui[id]={v:v,W:W,o:o};
  }
  var fp=fissi.concat(posti), messi=fp.slice(); piazzaCitta(k,fp,messi); piazzaNomi(messi);
  disegnaLuoghi(k,H,messi,pos);
  for(id in qui){
    var c=qui[id], r; p=popoli[id]; v=c.v; W=c.W; o=c.o;
    if(!o){ o=migliorePop(v,postiPop(W,nucleoIntorno(v[1],v[2]),k,H),W,H,messi,fissi); messi.push(rettoPop(v,o,W,H)); }
    r=rettoPop(v,o,W,H);
    p.fondo.setAttribute('x',(-W/2).toFixed(1)); p.fondo.setAttribute('width',W.toFixed(1)); p.fondo.setAttribute('height',H.toFixed(1)); p.t.setAttribute('y',(H*.72).toFixed(1));
    p.c.style.transform='translate('+(r[0]-v[1]).toFixed(1)+'px,'+o[1].toFixed(1)+'px)';
  }
  ultimiTesti=posti.concat(messi.slice(fp.length),(scenaFatta&&scenaFatta.etichette)||[]); ultimiFissi=fissi; sistemaSegni(ultimiTesti,ultimiFissi);
  return visti;
}

/* Le legende mostrano solo ciò che c'è sulla carta in quella tappa, e le voci cambiano nome col tempo (l'impero «d'Occidente» esiste dal 395).
   Sul PC il riquadro della carta tiene l'altezza della tappa con più voci, così la pagina non salta da una tappa all'altra (spazioLegende). */
function voceStato(s,anno){
  if(s.indexOf('regno:')===0){ var c=s.slice(6); return c==='italia'?(anno<493?'regno d\'Italia di Odoacre':'regno degli Ostrogoti'):c==='franchi'&&anno<511?'regno dei Franchi':REGNI[c][1]; }
  return s==='roma'?(anno<395?'impero romano':'impero d\'Occidente'):s==='usurpatore'?(anno<455?'territorio con un imperatore rivale':'territorio romano che il governo di Ravenna non controlla più'):s==='conteso'?'regione contesa in guerra':
    s==='federati'?'popoli insediati per trattato':s==='regno'?'regno':s==='oriente'?'impero d\'Oriente':
    s==='califfato'?(anno<750?'califfato':'califfato ed emirati arabi'):s==='carolingio'?(anno<843?'impero dei Franchi':'regni franchi dopo la divisione dell\'843'):s==='chiesa'?'terre della Chiesa':(anno<395?'abbandonata da Roma':'fuori dal controllo romano');
}
var legenda=document.getElementById('legendaMappa'), legendaPopoli=document.getElementById('legendaPopoli'), vociStati={}, vociPopoli={};
/* La legenda risponde. Ogni voce è un bottone: toccata, lascia vive sulla carta le sole regioni di quel colore (o i soli popoli con quel rapporto) e attenua il resto;
   un secondo tocco rilascia. Toccare una regione fa comparire un cartellino con il suo nome e il suo stato in quell'anno, e segna la voce in legenda.
   Sui telefoni la legenda sta su due righe: se le voci sono di più, un bottone «+N» la apre per intero (css/carta.css). */
var fuoco=null, fuocoP=null, statoOra={}, inMisura=false;
function applicaFuoco(){
  if(fuoco && (!vociStati[fuoco] || vociStati[fuoco].v.hidden)) fuoco=null;      // la voce accesa non c'è più in questa tappa
  if(fuocoP && (!vociPopoli[fuocoP] || vociPopoli[fuocoP].hidden)) fuocoP=null;
  if(fuocoT && (!areeTetra[fuocoT] || annoVisto==null || !tetrarchia(annoVisto))) fuocoT=null;      // fuori dagli anni della tetrarchia il nome acceso si spegne
  var at=fuocoT?areeTetra[fuocoT]:null, k, q;
  svg.classList.toggle('m-fuoco',!!fuoco||!!at); if(fuocoP) svg.setAttribute('data-fuoco',fuocoP); else svg.removeAttribute('data-fuoco');
  for(k in regioni){ q=at?(at[k]||(k==='britannia'&&britanniaDiCostanzo()?1:0)):0; regioni[k].classList.toggle('acceso',at?!!q:(!!fuoco && (statoOra[k]||'perso')===fuoco)); regioni[k].classList.toggle('incerto',q===2); }
  for(k in nomiTetra) nomiTetra[k].setAttribute('aria-pressed',k===fuocoT?'true':'false');
  tetra.classList.toggle('con-fuoco',!!fuocoT); scriviNotaTetra();
  for(k in vociStati) vociStati[k].v.setAttribute('aria-pressed',k===fuoco?'true':'false');
  for(k in vociPopoli) vociPopoli[k].setAttribute('aria-pressed',k===fuocoP?'true':'false');
  legenda.classList.toggle('con-fuoco',!!fuoco); if(legendaPopoli) legendaPopoli.classList.toggle('con-fuoco',!!fuocoP);
}
function voceCliccabile(v,fa){
  v.setAttribute('role','button'); v.tabIndex=0; v.setAttribute('aria-pressed','false'); v.addEventListener('click',fa);
  v.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fa(); } });
}
function bottoneAltre(el){
  var b=document.createElement('button'); b.type='button'; b.className='leg-altre'; b.hidden=true; el.appendChild(b); el._altre=b;
  b.addEventListener('click',function(){ el.classList.toggle('aperta'); misuraLegende(); });
}
function misuraLegende(){
  [legenda,legendaPopoli].forEach(function(el){
    if(!el || !el._altre) return; var b=el._altre; el.classList.remove('tagliata'); el.style.maxHeight='';
    if(el.classList.contains('aperta')){ b.hidden=false; b.textContent='meno'; b.setAttribute('aria-label','Mostra meno voci della legenda'); return; }
    /* sul telefono la legenda chiusa si taglia sopra la prima riga che non entra intera (una voce lunga va su due righe e sposta le altre): niente voci che affiorano a metà */
    var lim=parseFloat(getComputedStyle(el).maxHeight);
    function taglia(){ el.style.maxHeight=''; if(!isFinite(lim)) return; var cs=getComputedStyle(el), sotto0=parseFloat(cs.paddingBottom)+parseFloat(cs.borderBottomWidth), t0=el.getBoundingClientRect().top, taglio=null;
      [].forEach.call(el.querySelectorAll('span'),function(v){ if(v.hidden) return; var r=v.getBoundingClientRect(); if(r.height && r.bottom-t0>lim-sotto0+.5 && (taglio===null||r.top<taglio)) taglio=r.top; });
      if(taglio!==null && taglio-t0<lim) el.style.maxHeight=Math.max(0,Math.round(taglio-t0))+'px'; }
    taglia();
    var sotto=function(){ var fondo=el.getBoundingClientRect().bottom-3, q=0; [].forEach.call(el.querySelectorAll('span'),function(v){ if(!v.hidden && v.getBoundingClientRect().top>=fondo) q++; }); return q; }, n=sotto();
    if(!n){ b.hidden=true; return; }
    el.classList.add('tagliata'); taglia(); n=sotto();      // fa posto al bottone (le righe cambiano: si ritaglia), poi riconta le voci rimaste sotto
    b.hidden=!n; b.textContent='+'+n; b.setAttribute('aria-label','Mostra le altre '+n+' voci della legenda'); if(!n) el.classList.remove('tagliata');
  });
}
STATI.forEach(function(s){
  var v=document.createElement('span'), i=document.createElement('i'), t=document.createTextNode(s[1]||voceStato(s[0],600));
  i.style.background=s[0]==='conteso'?'repeating-linear-gradient(130deg,#9A2F2A 0 3px,#DCD0B8 3px 6px)':s[0].indexOf('regno:')===0?REGNI[s[0].slice(6)][0]:'var(--st-'+s[0]+')';
  v.appendChild(i); v.appendChild(t); legenda.appendChild(v); vociStati[s[0]]={v:v,t:t};
  voceCliccabile(v,function(){ fuoco=fuoco===s[0]?null:s[0]; fuocoP=fuocoT=null; applicaFuoco(); });
});
bottoneAltre(legenda);
if(legendaPopoli && G.popoli) RAPPORTI.forEach(function(r){ var v=document.createElement('span'), i=document.createElement('i'); i.className='p-'+r[0]; v.appendChild(i); v.appendChild(document.createTextNode(r[1])); legendaPopoli.appendChild(v); vociPopoli[r[0]]=v;
  voceCliccabile(v,function(){ fuocoP=fuocoP===r[0]?null:r[0]; fuoco=fuocoT=null; applicaFuoco(); }); });
if(legendaPopoli) bottoneAltre(legendaPopoli);
var ultimo=null, legendeMax=0;
/* Le legende sono alte quanto le loro voci: niente più fascia vuota fra gli stati e «I popoli» nelle tappe con poche voci. Perché la pagina non salti
   da una tappa all'altra, sul PC (carta in pagina, più larga di 700 punti) l'altezza della tappa con più voci la tiene il riquadro della carta,
   e lo spazio che avanza resta in fondo, sotto la nota. A tutto schermo la misura (legendeMax) serve ad adatta() per lasciare posto alle legende. */
function spazioLegende(){
  var prima=ultimo, T=(window.RM_DATI||{}).TAPPE||[], alta=0, r, riq=legenda.parentNode, largo=document.body.classList.contains('impero-largo'), fisso=false; inMisura=true;      // 23 novembre 2026: l'utente non vuole lo spazio vuoto sotto la nota; il riquadro finisce con le sue legende (la linea del tempo resta ferma in fondo)
  legenda.style.minHeight=''; riq.style.minHeight='';
  if(legendaPopoli){ legendaPopoli.style.minHeight=''; for(r in vociPopoli) vociPopoli[r].hidden=false; }
  if(largo) document.body.classList.remove('impero-largo');      // si misura con le legende sotto la carta
  legendeMax=0;
  T.forEach(function(t){ if(!t.regioni) return; aggiornaLegende(t.regioni,t.anno,null); legendeMax=Math.max(legendeMax,legenda.offsetHeight+(legendaPopoli?legendaPopoli.offsetHeight:0)); if(fisso) alta=Math.max(alta,riq.offsetHeight); });
  if(alta) riq.style.minHeight=alta+'px';
  if(largo) document.body.classList.add('impero-largo');
  inMisura=false; ultimo=prima; if(ultimo) aggiornaLegende(ultimo[0],ultimo[1],ultimo[2]); else misuraLegende();
  if(grandeSi) adatta();
}
function aggiornaLegende(stati,anno,visti){
  ultimo=[stati,anno,visti]; var ci={}, id, s;
  for(id in regioni) ci[stati[id]||'perso']=1;
  for(s in vociStati){ vociStati[s].v.hidden=!ci[s]; if(anno!=null){ var n=voceStato(s,anno); if(vociStati[s].t.nodeValue!==n) vociStati[s].t.nodeValue=n; } }
  if(visti) for(s in vociPopoli) vociPopoli[s].hidden=!visti[s];
  if(!inMisura) misuraLegende();
}
/* il cartellino di una regione toccata: nome e stato in quell'anno */
var chi=document.createElement('p'), chiOra=0, giu=null; chi.className='m-chi'; chi.hidden=true; chi.setAttribute('aria-live','polite'); ospite.appendChild(chi);
function nascondiChi(){ clearTimeout(chiOra); if(!chi.hidden){ chi.hidden=true; for(var k in vociStati) vociStati[k].v.classList.remove('indicata'); } }
function regioneA(cx,cy){
  var m=svg.getScreenCTM(); if(!m) return null; var pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy; pt=pt.matrixTransform(m.inverse());
  var ids=Object.keys(regioni); for(var i=ids.length-1;i>=0;i--){ try{ if(regioni[ids[i]].isPointInFill(pt)) return ids[i]; }catch(e){ return null; } }      // dall'ultima disegnata: è quella che si vede
  return null;
}
svg.addEventListener('pointerdown',function(e){ giu=[e.clientX,e.clientY]; nascondiChi(); });
svg.addEventListener('click',function(e){
  if(giu && Math.hypot(e.clientX-giu[0],e.clientY-giu[1])>6) return;      // era un trascinamento della carta
  var kt=nomeTetraA(e.clientX,e.clientY); if(kt){ toccaTetra(kt); return; }      // un nome della tetrarchia: accende la sua parte
  var id=regioneA(e.clientX,e.clientY); if(!id) return;
  var st=statoOra[id]||'perso', r=ospite.getBoundingClientRect(), b=document.createElement('b'), x=e.clientX-r.left, y=e.clientY-r.top;
  chi.textContent=''; b.textContent=G.regioni[id].nome; chi.appendChild(b); chi.appendChild(document.createTextNode(st==='fuori'?'mai appartenuta all\'impero':voceStato(st,annoVisto!=null?annoVisto:600)));
  chi.hidden=false; var w=chi.offsetWidth, sotto=y<chi.offsetHeight+18;
  chi.style.left=Math.max(w/2+6,Math.min(r.width-w/2-6,x))+'px'; chi.style.top=(sotto?y+16:y-12)+'px'; chi.classList.toggle('sotto',sotto);
  var v=vociStati[st]; if(v && !v.v.hidden){ v.v.classList.add('indicata'); if(v.v.getBoundingClientRect().top>=legenda.getBoundingClientRect().bottom-2){ legenda.classList.add('aperta'); misuraLegende(); } }      // la voce era fra quelle nascoste: la legenda si apre
  clearTimeout(chiOra); chiOra=setTimeout(nascondiChi,5000);
});
/* Su Safari per iPhone, scorrendo, la barra degli indirizzi entra ed esce e la finestra cambia di continuo la sola altezza: in pagina le legende non dipendono
   dall'altezza, quindi non si rimisurano (prima ogni volta si rifacevano tutte, una per tappa, e la pagina poteva dare scatti mentre si legge). A tutto schermo sì. */
var attesa=0, largPrima=window.innerWidth; window.addEventListener('resize',function(){ var w=window.innerWidth, soloAltezza=w===largPrima; largPrima=w; if(grandeSi && regia) fermaRegia(); adatta(); if(soloAltezza && !grandeSi) return; clearTimeout(attesa); attesa=setTimeout(function(){ spazioLegende(); if(ultimo&&ultimo[1]!=null) mostraPopoli(ultimo[1]); segnaFuori(); },200); });
spazioLegende();

/* A tutto schermo la carta riempie la finestra e si può ingrandire e trascinare (rotella, due dita, i bottoni + e −). La finestra sulla carta (viewBox) prende
   il rapporto del riquadro, non esce mai dal disegno (G.w x G.h) e a ingrandimento 1 mostra almeno il ritaglio di sempre. Fuori dallo schermo intero la carta
   resta ferma, così sui telefoni la pagina scorre. */
var BASE=[95,55,810,518], vista={k:1,cx:500,cy:314,w:BASE[2],h:BASE[3]}, grandeSi=false, daRifare=0;
function larghezzaVista(){ return !grandeSi?BASE[2]:(vista.alto?BASE[2]:vista.w)/vista.k; }
function applicaVista(){
  if(!grandeSi){ svg.setAttribute('viewBox',BASE.join(' ')); return; }
  if(vista.k<=1.001){ vista.k=1; vista.cx=500; vista.cy=314; }      // tornati all'ingrandimento 1 si rivede la carta intera, centrata come sempre: non resta spostata verso il punto che si stava guardando
  var w=vista.w/vista.k, h=vista.h/vista.k;
  if(vista.alto){ w=BASE[2]/vista.k; h=Math.min(G.h,w*vista.alto/vista.aw); ospite.style.height=Math.round(vista.aw*h/w)+'px'; }      // schermo alto e stretto: ingrandendo, il riquadro cresce in altezza finché c'è posto
  vista.cx=Math.max(w/2,Math.min(G.w-w/2,vista.cx)); vista.cy=Math.max(h/2,Math.min(G.h-h/2,vista.cy));
  svg.setAttribute('viewBox',(vista.cx-w/2).toFixed(1)+' '+(vista.cy-h/2).toFixed(1)+' '+w.toFixed(1)+' '+h.toFixed(1));
  if(!daRifare) daRifare=requestAnimationFrame(function(){ daRifare=0; if(ultimo&&ultimo[1]!=null) mostraPopoli(ultimo[1]); });
}
/* misura del riquadro della carta: tutta la finestra meno la linea del tempo, che non copre mai la carta */
function adatta(){
  if(!grandeSi) return;
  var tp=document.querySelector('.tempo'), H=window.innerHeight, ht=tp?tp.offsetHeight+(H<560?18:24):116, aw=window.innerWidth, ah=Math.max(120,H-ht);
  document.body.classList.remove('impero-largo');                       // le legende si misurano al loro posto, sotto la carta
  var legende=Math.max(legendeMax,legenda.offsetHeight+(legendaPopoli?legendaPopoli.offsetHeight:0))+8;      // lo spazio della tappa con più voci (spazioLegende)
  vista.alto=0; vista.aw=aw;
  if(aw/Math.max(1,ah-legende)<BASE[2]/G.h){        // telefono in verticale: la carta in alto, le legende sotto
    vista.alto=Math.max(120,ah-legende); ospite.style.width=aw+'px'; document.body.style.setProperty('--tempo',(tp?tp.offsetHeight:92)+'px'); applicaVista(); return;
  }
  var a=aw/ah, aa=Math.max(BASE[2]/G.h,Math.min(G.w/BASE[3],a)), mw=a>aa?ah*aa:aw, mh=a>aa?ah:aw/aa;
  ospite.style.width=Math.round(mw)+'px'; ospite.style.height=Math.round(mh)+'px';
  if(aa>=BASE[2]/BASE[3]){ vista.h=BASE[3]; vista.w=BASE[3]*aa; } else { vista.w=BASE[2]; vista.h=BASE[2]/aa; }
  document.body.classList.toggle('impero-largo',ah-mh<150);            // sotto la carta non c'è posto per le legende: vanno sopra la carta, sull'Oceano
  document.body.style.setProperty('--tempo',(tp?tp.offsetHeight:92)+'px');
  applicaVista();
}
var comandi=document.createElement('div'); comandi.className='comandi-scena comandi-mappa';
function bottone(t,et,cl){ var b=document.createElement('button'); b.type='button'; b.className=cl; b.textContent=t; b.setAttribute('aria-label',et); b.title=et; comandi.appendChild(b); return b; }
var bMeno=bottone('−','Allontana','zoom'), bPiu=bottone('+','Avvicina','zoom'), bGrande=bottone('⤢','Carta a tutto schermo','grande'); bGrande.setAttribute('aria-pressed','false');
ospite.appendChild(comandi);
function grande(si){
  fermaRegia(); grandeSi=si; legenda.parentNode.style.minHeight=''; setTimeout(function(){ stratoScena.setAttribute('class','m-scena'+(grandeSi||pocoMoto?' viva ferma':'')); },60);      // a tutto schermo la scena dell'evento resta ferma sulla carta (la ridisegna mostraPopoli, con le nuove misure)
  document.body.classList.toggle('impero-grande',si); if(!si) document.body.classList.remove('impero-largo');      // queste due istruzioni erano finite per sbaglio dentro il commento della riga sopra
  bGrande.textContent=si?'✕':'⤢'; bGrande.setAttribute('aria-pressed',si?'true':'false'); bGrande.title=si?'Chiudi':'Tutto schermo'; bGrande.setAttribute('aria-label',si?'Esci dallo schermo intero':'Carta a tutto schermo');
  dita={}; presa=null; vista.libera=si; setTimeout(segnaFuori,120);      // il bottone «Continua a…»: via a tutto schermo, di nuovo all'uscita (con le misure nuove)
  if(si) ospite.appendChild(barraPassi); else ospite.parentNode.insertBefore(barraPassi,rigaLuoghi);      // a tutto schermo la barra dei passi sta sulla carta, in basso al centro
  if(si){ vista.k=1; vista.cx=500; vista.cy=314; adatta(); if(vista.alto){ vista.k=Math.max(1,BASE[2]*vista.alto/(G.h*vista.aw)); vista.cx=470; vista.cy=330; applicaVista(); } }      // in verticale si parte con la carta che riempie il riquadro, sull'Italia: il bottone − la mostra intera
  else { vista.alto=0; ospite.style.width=ospite.style.height=''; applicaVista();
    /* Su un iPhone, appena usciti dallo schermo intero, la carta è rimasta ingrandita e più alta del riquadro (cattura dell'utente, 22 novembre 2026). In Chrome non si riproduce
       e il codice qui sopra rimette già il ritaglio di sempre: per prudenza lo si riscrive da capo al fotogramma dopo e ancora dopo un terzo di secondo, e nei CSS (css/carta.css)
       il disegno non può più allungare il riquadro. Da riprovare su un telefono vero. */
    var rimetti=function(){ if(grandeSi || regia) return; svg.removeAttribute('viewBox'); svg.setAttribute('viewBox',BASE.join(' ')); };
    requestAnimationFrame(rimetti); setTimeout(rimetti,320); }
  ingr=0; window.dispatchEvent(new Event('resize'));                    // il gestore qui sopra rifà misure, legende e cartellini
  if(si) setTimeout(function(){ if(grandeSi && vista.libera && annoVisto!=null && !regia) avviaRegia(luoghiRegia,scenaOra); },500);      // aperta la carta grande, la regia della tappa riparte lì
}
function unita(){ return larghezzaVista()/(svg.getBoundingClientRect().width||1); }      // unità della carta per pixel
function zoomSu(f,px,py){
  if(regia) fermaRegia(); vista.libera=false;
  var k0=vista.k, k1=Math.max(1,Math.min(6,k0*f)); if(k1===k0) return;
  if(px!=null){ var r=svg.getBoundingClientRect(), u=unita(); vista.cx+=(px-r.left-r.width/2)*u*(1-k0/k1); vista.cy+=(py-r.top-r.height/2)*u*(1-k0/k1); }      // resta fermo il punto sotto il cursore
  vista.k=k1; applicaVista();
}
var dita={}, presa=null;
function distanza(){ var id=Object.keys(dita), a=dita[id[0]], b=dita[id[1]]; return Math.hypot(a[0]-b[0],a[1]-b[1])||1; }
function prendi(){ var id=Object.keys(dita); presa=id.length===1?{x:dita[id[0]][0],y:dita[id[0]][1],cx:vista.cx,cy:vista.cy}:id.length===2?{d:distanza(),k:vista.k}:null; }
function lascia(e){ delete dita[e.pointerId]; prendi(); svg.style.cursor=''; }
svg.addEventListener('pointerdown',function(e){ if(!grandeSi) return; if(e.isPrimary) dita={};      // un tocco nuovo azzera i tocchi rimasti appesi: senza, un dito «fantasma» faceva leggere ogni trascinamento come un pizzico
  if(regia) fermaRegia(); vista.libera=false;      // il primo tocco ferma la regia: da qui la carta la muove chi guarda
  dita[e.pointerId]=[e.clientX,e.clientY]; try{ svg.setPointerCapture(e.pointerId); }catch(x){} prendi(); svg.style.cursor='grabbing'; });
svg.addEventListener('pointermove',function(e){
  if(!grandeSi||!dita[e.pointerId]||!presa) return; dita[e.pointerId]=[e.clientX,e.clientY];
  if(presa.d==null){ var u=unita(); vista.cx=presa.cx-(e.clientX-presa.x)*u; vista.cy=presa.cy-(e.clientY-presa.y)*u; }
  else vista.k=Math.max(1,Math.min(6,presa.k*distanza()/presa.d));
  applicaVista();
});
svg.addEventListener('pointerup',lascia); svg.addEventListener('pointercancel',lascia); svg.addEventListener('lostpointercapture',lascia);
svg.addEventListener('wheel',function(e){ if(!grandeSi) return; e.preventDefault(); zoomSu(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY); },{passive:false});
bPiu.addEventListener('click',function(){ zoomSu(1.5); }); bMeno.addEventListener('click',function(){ zoomSu(1/1.5); });
bGrande.addEventListener('click',function(){ grande(!grandeSi); });
window.addEventListener('keydown',function(e){ if(e.key==='Escape'&&grandeSi) grande(false); });

/* la nota in corsivo sotto le legende: sui telefoni sta su due righe e si apre con un tocco (css/carta.css) */
(function(){ var n=document.querySelector('.riquadro.impero .legenda-popoli:last-of-type'); if(!n||n.id) return; n.classList.add('legenda-nota'); n.addEventListener('click',function(){ n.classList.toggle('aperta'); }); })();
/* Carta piccola per le schede d'atto (js/atti.js): mare, terra, regioni colorate e Roma; niente popoli, nomi, rilievo. mostra(stati) la ricolora.
   La trama delle regioni contese è sua, perché quella della carta grande non si vede quando il suo riquadro è nascosto. */
function miniatura(){
  var s=document.createElementNS(NS,'svg'), pezzi={}, id;
  s.setAttribute('viewBox',BASE.join(' ')); s.setAttribute('class','m-mini'); s.setAttribute('aria-hidden','true'); s.setAttribute('preserveAspectRatio','xMidYMid slice');
  var pt=el('pattern',{id:'trama-mini',width:9,height:9,patternUnits:'userSpaceOnUse',patternTransform:'rotate(40)'},el('defs',{},s)); el('rect',{width:9,height:9,fill:'#DCD0B8'},pt); el('rect',{width:4.2,height:9,fill:'#9A2F2A'},pt);
  el('rect',{x:0,y:0,width:G.w,height:G.h,fill:'#C7D6D3'},s); el('path',{'class':'m-terra',d:G.terra},s);
  for(id in G.regioni) pezzi[id]=el('path',{'class':'m-regione perso',d:G.regioni[id].d},s);
  el('path',{'class':'m-costa',d:G.terra},s);
  /* i nomi, pochi e grandi (la carta è larga poco più di 300 punti): le regioni maggiori e tre città. Chiari sulle regioni colorate, scuri su quelle perse, come nella carta grande */
  var nomiMini={}, MINI=['britannia','gallia','hispania','italia_nord','africa','balcani','anatolia','egitto'], citta={}, stato={}, fuoco=null;
  MINI.forEach(function(id){ var r=G.regioni[id]; if(!r||!NOMI[id]) return; nomiMini[id]=el('text',{'class':'m-mini-nome',x:r.c[0],y:r.c[1]+(id==='italia_nord'?-14:0)},s); nomiMini[id].textContent=NOMI[id]; });
  ['costantinopoli','cartagine','roma'].forEach(function(k){ var c=G.citta[k]; if(!c) return;
    if(k!=='roma') el('circle',{'class':'m-mini-citta',cx:c.x,cy:c.y,r:4.5},s); else el('circle',{'class':'m-mini-roma',cx:c.x,cy:c.y,r:6.5},s);
    var sx=k==='roma'?9:-9, sy=k==='cartagine'?22:k==='costantinopoli'?-11:5;      // Bisanzio sopra a sinistra, lontano da «Asia Minore»
    citta[k]=el('text',{'class':'m-mini-citta-nome'+(k==='roma'?' roma':''),x:c.x+sx,y:c.y+sy,'text-anchor':k==='roma'?'start':'end'},s); citta[k].textContent=c.nome; });
  function accendi(){ for(var id in pezzi) pezzi[id].classList.toggle('spento',!!fuoco&&stato[id]!==fuoco); s.classList.toggle('m-fuoco',!!fuoco); }
  return {svg:s,
    mostra:function(stati,anno){
      for(var id in pezzi){ var st=stati[id]||'perso', chi=st.indexOf('regno:')===0?st.slice(6):''; stato[id]=st; if(chi) st='regno'; pezzi[id].setAttribute('class','m-regione '+st); pezzi[id].style.color=chi&&REGNI[chi]?REGNI[chi][0]:''; }
      for(var n in nomiMini){ var sn=stato[n]; nomiMini[n].setAttribute('class','m-mini-nome'+(sn==='perso'||sn==='conteso'||sn==='fuori'?' chiaro':'')); }
      if(citta.costantinopoli && anno!=null) citta.costantinopoli.textContent=anno<330?'Bisanzio':G.citta.costantinopoli.nome;
      accendi();
    },
    /* la voce di legenda toccata lascia accese le sole regioni di quello stato; null le riaccende tutte */
    fuoco:function(k){ fuoco=k||null; accendi(); }};
}
/* La scena che esce dalla carta (23 novembre 2026: la marcia di Giuliano del 363 si vedeva solo durante lo zoom; la carta d'insieme finisce ad Antiochia).
   Allargare la vista d'insieme per una sola tappa farebbe saltare i cartellini: sul bordo da cui la scena esce compare invece un bottone «Continua a est ▸»
   che fa partire lo zoom sulla scena intera; con meno animazioni la carta si avvicina ferma, e un secondo tocco la riporta alla vista intera. Non a tutto schermo, dove la carta si muove a mano. */
var bFuori=document.createElement('button'); bFuori.type='button'; bFuori.className='m-fuori'; bFuori.hidden=true; ospite.appendChild(bFuori);
var fuoriFermo=false, fuoriLato='est';
function visibile(){      // la parte del disegno che si vede davvero: sul telefono il riquadro è più alto e la carta si taglia ai lati (preserveAspectRatio slice)
  var rc=svg.getBoundingClientRect(), q=rc.width/(rc.height||1), b=BASE.slice(); if(!(q>0)) return b;
  if(q<b[2]/b[3]){ var w=b[3]*q; b[0]+=(b[2]-w)/2; b[2]=w; } else { var h=b[2]/q; b[1]+=(b[3]-h)/2; b[3]=h; }
  return b;
}
function segnaFuori(){
  bFuori.hidden=true; fuoriFermo=false; if(!scenaOra || !scenaOra.length || grandeSi) return;
  var v=visibile(), m=6, x0=v[0]+m, x1=v[0]+v[2]-m, y0=v[1]+m, y1=v[1]+v[3]-m, fuori=[];
  capiDi(scenaOra).forEach(function(c){ var p=puntoDi(c[0]); if(p && (p[0]<x0||p[0]>x1||p[1]<y0||p[1]>y1)) fuori.push(p); });
  if(!fuori.length) return;
  var mx=0, my=0; fuori.forEach(function(p){ mx+=p[0]/fuori.length; my+=p[1]/fuori.length; });
  fuoriLato=mx>x1?'est':mx<x0?'ovest':my<y0?'nord':'sud';
  bFuori.setAttribute('data-lato',fuoriLato); bFuori.style.top=bFuori.style.left='';
  if(fuoriLato==='est'||fuoriLato==='ovest') bFuori.style.top=Math.max(14,Math.min(80,(Math.max(y0,Math.min(y1,my))-v[1])/v[3]*100))+'%';
  else bFuori.style.left=Math.max(20,Math.min(80,(Math.max(x0,Math.min(x1,mx))-v[0])/v[2]*100))+'%';
  scriviFuori(); bFuori.hidden=false;
}
function scriviFuori(){
  var t=fuoriFermo?'Torna alla carta intera':'Continua a '+fuoriLato;
  var fr={est:' ▸',ovest:' ◂',nord:' ▴',sud:' ▾'}[fuoriLato]; bFuori.textContent=t+(fuoriFermo?'':fr);
  bFuori.setAttribute('aria-label',fuoriFermo?'Torna alla carta intera':'La scena continua fuori dalla carta, verso '+fuoriLato+': guardala tutta');
}
bFuori.addEventListener('click',function(){
  if(!pocoMoto){ avviaRegia(luoghiRegia,scenaOra,0,true); return; }
  if(fuoriFermo){ fermaRegia(); fuoriFermo=false; scriviFuori(); return; }
  var a=riquadroLuoghi(capiDi(scenaOra),.92); if(!a) return;
  bordo=[8,G.w-8,8,G.h-8]; scalaScena=scalaDi(a); testoMin=testoDi(a); if(annoVisto!=null) mostraPopoli(annoVisto);
  svg.setAttribute('viewBox',a.map(function(x){ return x.toFixed(1); }).join(' ')); fuoriFermo=true; scriviFuori();
});
window.RM_mappa={
  grande:grande,
  miniatura:miniatura,
  fermaRegia:fermaRegia,      // per le prove: riporta subito la carta alla vista intera, senza aspettare la fine dello zoom
  /* le voci di legenda presenti in una o più carte, con i nomi che valgono nell'anno dato: [colore o fondo, nome] */
  vociPresenti:function(elenco,anno){
    var ci={}, out=[]; elenco.forEach(function(stati){ for(var id in regioni) ci[stati[id]||'perso']=1; });
    STATI.forEach(function(s){ if(ci[s[0]]) out.push([s[0]==='conteso'?'repeating-linear-gradient(130deg,#9A2F2A 0 3px,#DCD0B8 3px 6px)':s[0].indexOf('regno:')===0?REGNI[s[0].slice(6)][0]:'var(--st-'+s[0]+')', voceStato(s[0],anno), s[0]]); });      // il terzo elemento è lo stato: serve alla legenda che risponde (js/atti.js)
    return out;
  },
  mostra:function(stati,anno,luoghi,scena,passi){
    if(anno!=null){ fermaRegia(); if(anno!==annoVisto) chiudiDid(false); /* tappa nuova: la didascalia chiusa ricompare */ annoVisto=anno; scriviLuoghi(luoghi); scenaOra=scena||null; passiOra=passi&&passi.length?passi:null; statiTappa=stati; faiBarra(); }      // la scena va saputa prima dei cartellini: mostraPopoli la disegna e la fa evitare
    if(anno!=null && scritte.costantinopoli){ var nc=anno<330?'Bisanzio':G.citta.costantinopoli.nome; if(scritte.costantinopoli.textContent!==nc) scritte.costantinopoli.textContent=nc; }      // prima di piazzare i nomi: Bisanzio è più corto
    var visti=anno!=null?mostraPopoli(anno):null;
    if(anno!=null) avviaRegia(luoghi,scenaOra);
    if(anno!=null){ tetra.setAttribute('class','m-tetra'+(tetrarchia(anno)?'':' via')); notaTetra(anno); }
    if(anno!=null){ verdun.setAttribute('class','m-verdun'+(anno>=843?'':' via')); var ta=String(Math.round(anno)); if(annoCarta.textContent!==ta) annoCarta.textContent=ta; }
    aggiornaLegende(stati,anno,visti);
    for(var id in regioni) statoOra[id]=stati[id]||'perso';
    if(!ricolorata) coloraRegioni(stati);      // durante un passo che ricolora (Arabi del 711) i colori restano quelli del passo
    applicaFuoco(); nascondiChi();      // la voce accesa in legenda resta accesa da una tappa all'altra, finché c'è
    if(anno!=null) segnaFuori();
  },
  /* quota dell'Occidente governata da Roma, pesata per regione: federati e contesi valgono metà, ma solo finché c'è un governo romano d'Occidente (fino al 480, quando muore Giulio Nepote
     in Dalmazia). Dopo, una regione contesa lo è fra altri (Goti e Costantinopoli, Visigoti e Arabi, Bizantini e Saraceni) e non conta: prima del 22 novembre 2026 la spia dava il 9% nel 711 */
  territorio:function(stati,anno){
    var tot=0, ok=0, meta=anno==null||anno<=480?.5:0;
    for(var id in G.regioni){ if(G.regioni[id].est||G.regioni[id].oltre) continue; var p=G.regioni[id].peso; tot+=p; ok+=p*(stati[id]==='roma'?1:(stati[id]==='federati'||stati[id]==='conteso')?meta:0); }
    return ok/tot*100;
  },
  /* superficie dell'Occidente intero sulla carta, in km²: la proiezione è conforme e fra Roma, Milano, Ravenna, Cartagine e Costantinopoli un'unità del disegno vale 5,20 km (misurato il 22 novembre 2026 sulle distanze reali
     fra le città: quattro coppie, da 5,199 a 5,203), cioè 27,06 km² per unità quadrata. Fa circa 2,75 milioni di km², Agri Decumates e Mauretanie interne compresi */
  kmqOvest:function(){ var tot=0; for(var id in G.regioni){ if(!G.regioni[id].est && !G.regioni[id].oltre) tot+=G.regioni[id].peso; } return tot*27.06; },
  /* territori governati dalla corte d'Oriente, fatto 100 l'Oriente del 395 (senza la Dacia, già perduta): con Giustiniano supera 100, perché riprende pezzi d'Occidente */
  territorioEst:function(stati){
    var base=0, ok=0, id, p, s;
    for(id in G.regioni){ if(G.regioni[id].oltre) continue; p=G.regioni[id].peso; s=stati[id]; if(G.regioni[id].est && id!=='dacia') base+=p; ok+=p*((s==='oriente'||(G.regioni[id].est&&s==='roma'))?1:(G.regioni[id].est&&s==='conteso')?.5:0); }
    return ok/base*100;
  }
};
})();
