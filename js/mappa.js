/* Mappa dell'Impero, in bozza: una regione, un colore, secondo il rapporto con Roma.
   Niente frecce: gli spostamenti dei gruppi arriveranno come popolazioni che si muovono nel tempo. */
(function(){
'use strict';
var G=window.RM_MAPPA, ospite=document.getElementById('mappa'); if(!G||!ospite) return;
var NS='http://www.w3.org/2000/svg';
function el(tipo,attr,padre){ var e=document.createElementNS(NS,tipo); for(var k in attr) e.setAttribute(k,attr[k]); if(padre) padre.appendChild(e); return e; }

var STATI=[['roma','governo di Roma'],['usurpatore','impero separato'],['conteso','conteso'],['federati','federati, per trattato'],['regno:svevi',''],['regno:vandali',''],['regno:visigoti',''],['regno:burgundi',''],['regno:franchi',''],['regno:italia',''],['regno:longobardi',''],['regno:anglosassoni',''],['regno:asturie',''],['regno:britanni',''],['regno:turingi',''],['regno:gepidi',''],['regno:unni',''],['regno:avari',''],['regno:bulgari',''],['regno:moravi',''],['oriente','corte d\'Oriente'],['califfato','califfato'],['carolingio','impero dei Franchi'],['chiesa','terre della Chiesa'],['perso','fuori dall\'impero']];
/* i regni: colore e nome. I colori si ripetono solo fra regni che non sono mai sulla carta insieme. */
var REGNI={svevi:['#D08C60','regno degli Svevi'],vandali:['#7B5B3A','regno dei Vandali'],visigoti:['#6A4C93','regno dei Visigoti'],burgundi:['#C08A9E','regno dei Burgundi'],franchi:['#3E5F7A','regni dei Franchi'],
  italia:['#3D7A4F','regno d\'Italia'],longobardi:['#8A8F3A','regno e ducati dei Longobardi'],anglosassoni:['#7F95A3','regni anglosassoni'],asturie:['#D08C60','regno delle Asturie'],
  britanni:['#A99BD0','regni dei Britanni'],turingi:['#A7B37A','regno dei Turingi'],gepidi:['#A39B86','regno dei Gepidi'],unni:['#5B5348','dominio degli Unni'],avari:['#5B5348','khanato degli Avari'],
  bulgari:['#8B4F6B','khanato dei Bulgari'],moravi:['#A7B37A','principato di Moravia']};
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
/* ciò che i cartellini dei popoli non devono coprire: i nomi delle regioni e delle città, come [x del centro, y del centro, larghezza] */
var ostacoli=[];
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id]; if(!NOMI[id]) return;                                    // solo le regioni abbastanza grandi hanno il nome scritto sopra
  var yn=r.c[1]+(id==='italia_nord'?-14:id==='belgica'?-6:0);
  nomi[id]=el('text',{'class':'m-nome',x:r.c[0],y:yn},svg); nomi[id].textContent=NOMI[id];
  ostacoli.push([r.c[0],yn-4,NOMI[id].length*8.6+6]);
});
var annoCarta=document.createElement('p'); annoCarta.className='m-anno'; annoCarta.setAttribute('aria-hidden','true'); ospite.appendChild(annoCarta);
var verdun=el('g',{'class':'m-verdun via'},svg);
if(G.verdun){ G.verdun.linee.forEach(function(d){ el('path',{d:d},verdun); }); G.verdun.nomi.forEach(function(n){ el('text',{x:n[0],y:n[1]},verdun).textContent=n[2]; }); }      // 843: l'impero dei Franchi diviso fra i tre nipoti di Carlo Magno
var citta=el('g',{'class':'m-citta'},svg), scritte={};
if(G.citta.roma) el('circle',{'class':'m-battito',cx:G.citta.roma.x,cy:G.citta.roma.y,r:4},citta);      // Roma pulsa piano: è lì che guarda l'altra scena
['roma','ravenna','milano','treviri','cartagine','costantinopoli'].forEach(function(id){
  var c=G.citta[id]; el('circle',{cx:c.x,cy:c.y,r:3.2},citta);
  var sinistra=id==='ravenna'||id==='treviri';
  var yc=c.y+(id==='milano'?-7:id==='roma'?14:4), larga=c.nome.length*6.3+4;
  scritte[id]=el('text',{x:c.x+(sinistra?7:-7),y:yc,'text-anchor':sinistra?'start':'end'},citta); scritte[id].textContent=c.nome;
  ostacoli.push([c.x+(sinistra?1:-1)*(7+larga/2),yc-4,larga]);
});

/* I popoli: ciascuno è un punto dove stava il grosso del gruppo e un cartellino col nome; il colore dice il rapporto con Roma in quel momento
   (gli stessi colori delle regioni: verde per chi sta dentro per accordo, blu per chi ha un regno), la linea tratteggiata da dove veniva
   (l'ultimo tratto del cammino, con i suoi punti di passaggio via terra). Quando un gruppo ha un regno, il cartellino porta il nome del regno e la linea sparisce. */
var RAPPORTI=[['fuori','oltre il confine'],['accordo','dentro l\'impero, per accordo'],['armi','in armi dentro l\'impero'],['regno','con un regno proprio (colore in legenda)']];
var CLASSE={fuori:'fuori',accolti:'accordo',federati:'accordo',armi:'armi',regno:'regno'};
var REGNO={goti:'Regno dei Visigoti',ostrogoti:'Regno degli Ostrogoti',vandali:'Regno dei Vandali',svevi:'Regno degli Svevi',burgundi:'Regno dei Burgundi',franchi:'Regno dei Franchi',sassoni:'Regni anglosassoni',longobardi:'Regno dei Longobardi',avari:'Khanato degli Avari',bulgari:'Khanato dei Bulgari'};
var popoli={}, stratoRotte=el('g',{'class':'m-rotte'},svg), stratoPopoli=el('g',{'class':'m-popoli'},svg), ingr=0;
Object.keys(G.popoli||{}).forEach(function(id){
  var q=G.popoli[id], sotto=el('path',{'class':'m-rotta-f via'},stratoRotte), rotta=el('path',{'class':'m-rotta via'},stratoRotte), g=el('g',{'class':'m-popolo via'},stratoPopoli);
  var punto=el('circle',{'class':'m-punto',r:4},g), c=el('g',{'class':'m-cartello'},g), fondo=el('rect',{rx:3,ry:3},c), t=el('text',{},c);
  popoli[id]={g:g,c:c,fondo:fondo,t:t,punto:punto,q:q,rotta:rotta,sotto:sotto,nome:'',larga:0};
});
function mostraPopoli(anno){
  var messi=ostacoli.slice(), visti={}, id, i;
  /* su uno schermo stretto la carta rimpicciolisce: cartellini e punti si ingrandiscono per restare leggibili */
  /* a tutto schermo restano della stessa misura sullo schermo anche quando si ingrandisce la carta */
  var lw=svg.getBoundingClientRect().width, ppu=lw>0?lw/larghezzaVista():1, k=lw<=0?1:grandeSi?Math.max(.4,Math.min(1.8,Math.max(10,Math.min(14,Math.min(window.innerWidth,window.innerHeight)/40))/11.5/ppu)):Math.max(1,Math.min(1.8,.7/ppu));      // a tutto schermo: scritte di 10-14 pixel
  k=Math.round(k*20)/20;
  if(k!==ingr){ ingr=k; svg.style.setProperty('--pf',(11.5*k).toFixed(1)+'px'); for(id in popoli){ popoli[id].larga=0; popoli[id].punto.setAttribute('r',(4*k).toFixed(1)); } }
  var H=15*k;
  for(id in popoli){
    var p=popoli[id], q=p.q, u=-1; for(i=0;i<q.t.length;i++) if(anno>=q.t[i][0]) u=i;
    var via=u<0||anno>q.fine, cl=via?'via':CLASSE[q.t[u][3]], v=q.t[Math.max(0,u)], nome=q.nome;
    for(i=0;i<q.poi.length;i++) if(anno>=q.poi[i][0]) nome=q.poi[i][1];
    if(cl==='regno' && REGNO[id]) nome=id==='franchi'&&anno>=843?'Regni dei Franchi':id==='franchi'&&anno>=800?'Impero dei Franchi':REGNO[id];      // dopo il Natale dell'800 e dopo la divisione di Verdun il nome cambia
    p.g.setAttribute('class','m-popolo '+cl); p.g.style.transform='translate('+v[1]+'px,'+v[2]+'px)';
    if(p.nome!==nome){ p.nome=nome; p.t.textContent=nome; p.larga=0; }
    var d='', da=Math.max(0,u-1), tratti=0;      // solo l'ultimo tratto: il cammino che ha portato il gruppo dov'è ora
    if(!via && anno-q.t[u][0]<=(cl==='regno'?5:25)) for(i=da;i<=u;i++){ if(i<u && q.t[u][0]-q.t[i][0]>40) continue; if(i>da && q.t[i][1]===q.t[i-1][1] && q.t[i][2]===q.t[i-1][2]) continue; if(d){ tratti++; if(q.t[i][4]) for(var w=0;w<q.t[i][4].length;w++) d+='L'+q.t[i][4][w][0]+' '+q.t[i][4][w][1]; } d+=(d?'L':'M')+q.t[i][1]+' '+q.t[i][2]; }
    if(!tratti) d='';
    p.rotta.setAttribute('d',d||'M0 0'); p.sotto.setAttribute('d',d||'M0 0'); p.rotta.setAttribute('class','m-rotta '+(d?cl:'via')); p.sotto.setAttribute('class','m-rotta-f'+(d?'':' via'));
    if(via) continue;
    visti[cl]=1;
    if(!p.larga){ var w=0; try{ w=p.t.getComputedTextLength(); }catch(e){} p.larga=(w>4?w:nome.length*5.6*k)+12*k; }
    /* il cartellino sta sopra il punto; se lì copre un altro cartellino o un nome va sotto, di fianco, più in alto: vince il primo posto libero, o quello che copre di meno */
    var W=p.larga, lato=W/2+9*k, prove=[[0,-H-7*k],[0,8*k],[lato,-H/2],[-lato,-H/2],[0,-2*H-9*k],[0,H+10*k],[0,-3*H-11*k]], meglio=0, minimo=1e9, j, n, cx, cy, tocca, ox, oy;
    for(j=0;j<prove.length;j++){ cx=Math.max(97+W/2,Math.min(903-W/2,v[1]+prove[j][0])); cy=v[2]+prove[j][1]+H/2; tocca=0;
      for(n=0;n<messi.length;n++){ ox=(messi[n][2]+W)/2+2-Math.abs(messi[n][0]-cx); oy=H+1-Math.abs(messi[n][1]-cy); if(ox>0&&oy>0) tocca+=ox*oy; }
      if(tocca<minimo){ minimo=tocca; meglio=j; if(!tocca) break; } }
    cx=Math.max(97+W/2,Math.min(903-W/2,v[1]+prove[meglio][0])); var dy=prove[meglio][1];
    messi.push([cx,v[2]+dy+H/2,W]);
    p.fondo.setAttribute('x',(-W/2).toFixed(1)); p.fondo.setAttribute('width',W.toFixed(1)); p.fondo.setAttribute('height',H.toFixed(1)); p.t.setAttribute('y',(H*.72).toFixed(1));
    p.c.style.transform='translate('+(cx-v[1]).toFixed(1)+'px,'+dy.toFixed(1)+'px)';
  }
  return visti;
}

/* Le legende mostrano solo ciò che c'è sulla carta in quella tappa, e le voci cambiano nome col tempo (l'impero «d'Occidente» esiste dal 395).
   Lo spazio resta quello della legenda al completo, così la pagina non salta da una tappa all'altra. */
function voceStato(s,anno){
  if(s.indexOf('regno:')===0){ var c=s.slice(6); return c==='italia'?(anno<493?'regno d\'Italia di Odoacre':'regno degli Ostrogoti'):c==='franchi'&&anno<511?'regno dei Franchi':REGNI[c][1]; }
  return s==='roma'?(anno<395?'impero romano':'impero d\'Occidente'):s==='usurpatore'?(anno<455?'impero separato, con un suo imperatore':'dominio romano che non obbedisce più a Ravenna'):s==='conteso'?'in guerra, contesa':
    s==='federati'?'barbari insediati per trattato':s==='regno'?'regno':s==='oriente'?'impero d\'Oriente':
    s==='califfato'?(anno<750?'califfato':'califfato ed emirati arabi'):s==='carolingio'?(anno<843?'impero dei Franchi':'regni dei Franchi, dopo la divisione dell\'843'):s==='chiesa'?'terre della Chiesa':(anno<395?'lasciata dall\'impero':'uscita dall\'impero');
}
var legenda=document.getElementById('legendaMappa'), legendaPopoli=document.getElementById('legendaPopoli'), vociStati={}, vociPopoli={};
STATI.forEach(function(s){
  var v=document.createElement('span'), i=document.createElement('i'), t=document.createTextNode(s[1]||voceStato(s[0],600));
  i.style.background=s[0]==='conteso'?'repeating-linear-gradient(130deg,#9A2F2A 0 3px,#DCD0B8 3px 6px)':s[0].indexOf('regno:')===0?REGNI[s[0].slice(6)][0]:'var(--st-'+s[0]+')';
  v.appendChild(i); v.appendChild(t); legenda.appendChild(v); vociStati[s[0]]={v:v,t:t};
});
if(legendaPopoli && G.popoli) RAPPORTI.forEach(function(r){ var v=document.createElement('span'), i=document.createElement('i'); i.className='p-'+r[0]; v.appendChild(i); v.appendChild(document.createTextNode(r[1])); legendaPopoli.appendChild(v); vociPopoli[r[0]]=v; });
var ultimo=null;
function spazioLegende(){                                 // l'altezza minima è quella della tappa con più voci: la pagina non salta da una tappa all'altra
  var prima=ultimo, T=(window.RM_DATI||{}).TAPPE||[], alta=0, r;
  if(legendaPopoli){ legendaPopoli.style.minHeight=''; for(r in vociPopoli) vociPopoli[r].hidden=false; if(legendaPopoli.offsetHeight) legendaPopoli.style.minHeight=legendaPopoli.offsetHeight+'px'; }
  legenda.style.minHeight='';
  T.forEach(function(t){ if(t.intermezzo||!t.regioni) return; aggiornaLegende(t.regioni,t.anno,null); alta=Math.max(alta,legenda.offsetHeight); });
  if(alta) legenda.style.minHeight=alta+'px';
  ultimo=prima; if(ultimo) aggiornaLegende(ultimo[0],ultimo[1],ultimo[2]);
}
function aggiornaLegende(stati,anno,visti){
  ultimo=[stati,anno,visti]; var ci={}, id, s;
  for(id in regioni) ci[stati[id]||'perso']=1;
  for(s in vociStati){ vociStati[s].v.hidden=!ci[s]; if(anno!=null){ var n=voceStato(s,anno); if(vociStati[s].t.nodeValue!==n) vociStati[s].t.nodeValue=n; } }
  if(visti) for(s in vociPopoli) vociPopoli[s].hidden=!visti[s];
}
var attesa=0; window.addEventListener('resize',function(){ adatta(); clearTimeout(attesa); attesa=setTimeout(function(){ spazioLegende(); if(ultimo&&ultimo[1]!=null) mostraPopoli(ultimo[1]); },200); });
spazioLegende();

/* A tutto schermo la carta riempie la finestra e si può ingrandire e trascinare (rotella, due dita, i bottoni + e −). La finestra sulla carta (viewBox) prende
   il rapporto del riquadro, non esce mai dal disegno (G.w x G.h) e a ingrandimento 1 mostra almeno il ritaglio di sempre. Fuori dallo schermo intero la carta
   resta ferma, così sui telefoni la pagina scorre. */
var BASE=[95,55,810,518], vista={k:1,cx:500,cy:314,w:BASE[2],h:BASE[3]}, grandeSi=false, daRifare=0;
function larghezzaVista(){ return !grandeSi?BASE[2]:(vista.alto?BASE[2]:vista.w)/vista.k; }
function applicaVista(){
  if(!grandeSi){ svg.setAttribute('viewBox',BASE.join(' ')); return; }
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
  var legende=legenda.offsetHeight+(legendaPopoli?legendaPopoli.offsetHeight:0)+8;
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
  grandeSi=si; document.body.classList.toggle('impero-grande',si); if(!si) document.body.classList.remove('impero-largo');
  bGrande.textContent=si?'✕':'⤢'; bGrande.setAttribute('aria-pressed',si?'true':'false'); bGrande.title=si?'Chiudi':'Tutto schermo'; bGrande.setAttribute('aria-label',si?'Chiudi lo schermo intero':'Carta a tutto schermo');
  if(si){ vista.k=1; vista.cx=500; vista.cy=314; adatta(); if(vista.alto){ vista.k=Math.max(1,BASE[2]*vista.alto/(G.h*vista.aw)); vista.cx=470; vista.cy=330; applicaVista(); } }      // in verticale si parte con la carta che riempie il riquadro, sull'Italia: il bottone − la mostra intera
  else { vista.alto=0; ospite.style.width=ospite.style.height=''; applicaVista(); }
  ingr=0; window.dispatchEvent(new Event('resize'));                    // il gestore qui sopra rifà misure, legende e cartellini
}
function unita(){ return larghezzaVista()/(svg.getBoundingClientRect().width||1); }      // unità della carta per pixel
function zoomSu(f,px,py){
  var k0=vista.k, k1=Math.max(1,Math.min(6,k0*f)); if(k1===k0) return;
  if(px!=null){ var r=svg.getBoundingClientRect(), u=unita(); vista.cx+=(px-r.left-r.width/2)*u*(1-k0/k1); vista.cy+=(py-r.top-r.height/2)*u*(1-k0/k1); }      // resta fermo il punto sotto il cursore
  vista.k=k1; applicaVista();
}
var dita={}, presa=null;
function distanza(){ var id=Object.keys(dita), a=dita[id[0]], b=dita[id[1]]; return Math.hypot(a[0]-b[0],a[1]-b[1])||1; }
function prendi(){ var id=Object.keys(dita); presa=id.length===1?{x:dita[id[0]][0],y:dita[id[0]][1],cx:vista.cx,cy:vista.cy}:id.length===2?{d:distanza(),k:vista.k}:null; }
function lascia(e){ delete dita[e.pointerId]; prendi(); svg.style.cursor=''; }
svg.addEventListener('pointerdown',function(e){ if(!grandeSi) return; dita[e.pointerId]=[e.clientX,e.clientY]; try{ svg.setPointerCapture(e.pointerId); }catch(x){} prendi(); svg.style.cursor='grabbing'; });
svg.addEventListener('pointermove',function(e){
  if(!grandeSi||!dita[e.pointerId]||!presa) return; dita[e.pointerId]=[e.clientX,e.clientY];
  if(presa.d==null){ var u=unita(); vista.cx=presa.cx-(e.clientX-presa.x)*u; vista.cy=presa.cy-(e.clientY-presa.y)*u; }
  else vista.k=Math.max(1,Math.min(6,presa.k*distanza()/presa.d));
  applicaVista();
});
svg.addEventListener('pointerup',lascia); svg.addEventListener('pointercancel',lascia);
svg.addEventListener('wheel',function(e){ if(!grandeSi) return; e.preventDefault(); zoomSu(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY); },{passive:false});
bPiu.addEventListener('click',function(){ zoomSu(1.5); }); bMeno.addEventListener('click',function(){ zoomSu(1/1.5); });
bGrande.addEventListener('click',function(){ grande(!grandeSi); });
window.addEventListener('keydown',function(e){ if(e.key==='Escape'&&grandeSi) grande(false); });

window.RM_mappa={
  grande:grande,
  mostra:function(stati,anno){
    var visti=anno!=null?mostraPopoli(anno):null;
    if(anno!=null && scritte.costantinopoli){ var nc=anno<330?'Bisanzio':G.citta.costantinopoli.nome; if(scritte.costantinopoli.textContent!==nc) scritte.costantinopoli.textContent=nc; }
    if(anno!=null){ verdun.setAttribute('class','m-verdun'+(anno>=843?'':' via')); var ta=String(Math.round(anno)); if(annoCarta.textContent!==ta) annoCarta.textContent=ta; }
    aggiornaLegende(stati,anno,visti);
    for(var id in regioni){
      var s=stati[id]||'perso', chi=s.indexOf('regno:')===0?s.slice(6):'';
      if(chi) s='regno';
      regioni[id].setAttribute('class','m-regione '+s); regioni[id].style.color=chi&&REGNI[chi]?REGNI[chi][0]:'';
      if(nomi[id]) nomi[id].setAttribute('class','m-nome'+(s==='perso'||s==='conteso'?' chiaro':''));
    }
  },
  /* quota dell'Occidente governata da Roma, pesata per regione: federati e contesi valgono metà */
  territorio:function(stati){
    var tot=0, ok=0;
    for(var id in G.regioni){ if(G.regioni[id].est||G.regioni[id].oltre) continue; var p=G.regioni[id].peso; tot+=p; ok+=p*(stati[id]==='roma'?1:(stati[id]==='federati'||stati[id]==='conteso')?.5:0); }
    return ok/tot*100;
  },
  /* territori governati dalla corte d'Oriente, fatto 100 l'Oriente del 395 (senza la Dacia, già perduta): con Giustiniano supera 100, perché riprende pezzi d'Occidente */
  territorioEst:function(stati){
    var base=0, ok=0, id, p, s;
    for(id in G.regioni){ if(G.regioni[id].oltre) continue; p=G.regioni[id].peso; s=stati[id]; if(G.regioni[id].est && id!=='dacia') base+=p; ok+=p*((s==='oriente'||(G.regioni[id].est&&s==='roma'))?1:(G.regioni[id].est&&s==='conteso')?.5:0); }
    return ok/base*100;
  }
};
})();
