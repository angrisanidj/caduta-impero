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
el('rect',{'class':'m-mare',width:G.w,height:G.h},svg);
el('path',{'class':'m-terra',d:G.terra},svg);

var regioni={}, nomi={}, NOMI={britannia:'Britannia',gallia:'Gallie',belgica:'Belgica',aquitania:'Aquitania',hispania:'Hispania',italia_nord:'Italia',africa:'Africa',mauretania:'Mauretanie',pannonia:'Pannonia',balcani:'Grecia',tracia:'Tracia',anatolia:'Asia Minore',dacia:'Dacia',levante:'Siria',egitto:'Egitto'};
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id];
  regioni[id]=el('path',{'class':'m-regione perso',d:r.d},svg);
  el('title',{},regioni[id]).textContent=r.nome;
});
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id]; if(!NOMI[id]) return;                                    // solo le regioni abbastanza grandi hanno il nome scritto sopra
  nomi[id]=el('text',{'class':'m-nome',x:r.c[0],y:r.c[1]+(id==='italia_nord'?-14:id==='belgica'?-6:0)},svg); nomi[id].textContent=NOMI[id];
});
var verdun=el('g',{'class':'m-verdun via'},svg);
if(G.verdun){ G.verdun.linee.forEach(function(d){ el('path',{d:d},verdun); }); G.verdun.nomi.forEach(function(n){ el('text',{x:n[0],y:n[1]},verdun).textContent=n[2]; }); }      // 843: l'impero dei Franchi diviso fra i tre nipoti di Carlo Magno
var citta=el('g',{'class':'m-citta'},svg);
['roma','ravenna','milano','treviri','cartagine','costantinopoli'].forEach(function(id){
  var c=G.citta[id]; el('circle',{cx:c.x,cy:c.y,r:3.2},citta);
  var sinistra=id==='ravenna'||id==='treviri';
  el('text',{x:c.x+(sinistra?7:-7),y:c.y+(id==='milano'?-7:id==='roma'?14:4),'text-anchor':sinistra?'start':'end'},citta).textContent=c.nome;
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
  var messi=[], visti={}, id, i;
  /* su uno schermo stretto la carta rimpicciolisce: cartellini e punti si ingrandiscono per restare leggibili */
  var lw=svg.getBoundingClientRect().width, k=lw>0?Math.max(1,Math.min(1.8,.7/(lw/810))):1;
  if(k!==ingr){ ingr=k; svg.style.setProperty('--pf',(11.5*k).toFixed(1)+'px'); for(id in popoli){ popoli[id].larga=0; popoli[id].punto.setAttribute('r',(4*k).toFixed(1)); } }
  var H=15*k;
  for(id in popoli){
    var p=popoli[id], q=p.q, u=-1; for(i=0;i<q.t.length;i++) if(anno>=q.t[i][0]) u=i;
    var via=u<0||anno>q.fine, cl=via?'via':CLASSE[q.t[u][3]], v=q.t[Math.max(0,u)], nome=q.nome;
    for(i=0;i<q.poi.length;i++) if(anno>=q.poi[i][0]) nome=q.poi[i][1];
    if(cl==='regno' && REGNO[id]) nome=REGNO[id];
    p.g.setAttribute('class','m-popolo '+cl); p.g.style.transform='translate('+v[1]+'px,'+v[2]+'px)';
    if(p.nome!==nome){ p.nome=nome; p.t.textContent=nome; p.larga=0; }
    var d='', da=Math.max(0,u-1), tratti=0;      // solo l'ultimo tratto: il cammino che ha portato il gruppo dov'è ora
    if(!via && anno-q.t[u][0]<=(cl==='regno'?5:25)) for(i=da;i<=u;i++){ if(i<u && q.t[u][0]-q.t[i][0]>40) continue; if(i>da && q.t[i][1]===q.t[i-1][1] && q.t[i][2]===q.t[i-1][2]) continue; if(d){ tratti++; if(q.t[i][4]) for(var w=0;w<q.t[i][4].length;w++) d+='L'+q.t[i][4][w][0]+' '+q.t[i][4][w][1]; } d+=(d?'L':'M')+q.t[i][1]+' '+q.t[i][2]; }
    if(!tratti) d='';
    p.rotta.setAttribute('d',d||'M0 0'); p.sotto.setAttribute('d',d||'M0 0'); p.rotta.setAttribute('class','m-rotta '+(d?cl:'via')); p.sotto.setAttribute('class','m-rotta-f'+(d?'':' via'));
    if(via) continue;
    visti[cl]=1;
    if(!p.larga){ var w=0; try{ w=p.t.getComputedTextLength(); }catch(e){} p.larga=(w>4?w:nome.length*5.6*k)+12*k; }
    /* il cartellino sta sopra il punto; se lì ce n'è già un altro va sotto, o più in alto */
    var W=p.larga, cx=Math.max(97+W/2,Math.min(903-W/2,v[1])), prove=[-H-7*k,8*k,-2*H-9*k,H+10*k,-3*H-11*k], dy=prove[0], j, n, libero;
    for(j=0;j<prove.length;j++){ libero=true;
      for(n=0;n<messi.length;n++) if(Math.abs(messi[n][0]-cx)<(messi[n][2]+W)/2+2 && Math.abs(messi[n][1]-(v[2]+prove[j]+H/2))<H+1){ libero=false; break; }
      if(libero){ dy=prove[j]; break; } }
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
var attesa=0; window.addEventListener('resize',function(){ clearTimeout(attesa); attesa=setTimeout(function(){ spazioLegende(); if(ultimo&&ultimo[1]!=null) mostraPopoli(ultimo[1]); },200); });
spazioLegende();

window.RM_mappa={
  mostra:function(stati,anno){
    var visti=anno!=null?mostraPopoli(anno):null;
    if(anno!=null) verdun.setAttribute('class','m-verdun'+(anno>=843?'':' via'));
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
