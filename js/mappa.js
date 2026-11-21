/* Mappa dell'Impero, in bozza: una regione, un colore, secondo il rapporto con Roma.
   Niente frecce: gli spostamenti dei gruppi arriveranno come popolazioni che si muovono nel tempo. */
(function(){
'use strict';
var G=window.RM_MAPPA, ospite=document.getElementById('mappa'); if(!G||!ospite) return;
var NS='http://www.w3.org/2000/svg';
function el(tipo,attr,padre){ var e=document.createElementNS(NS,tipo); for(var k in attr) e.setAttribute(k,attr[k]); if(padre) padre.appendChild(e); return e; }

var STATI=[['roma','governo di Roma'],['usurpatore','impero separato'],['conteso','conteso'],['federati','federati, per trattato'],['regno','regno autonomo'],['oriente','corte d\'Oriente'],['califfato','califfato'],['carolingio','impero dei Franchi'],['perso','fuori dall\'impero']];
var svg=el('svg',{viewBox:'95 55 810 518',   /* ritaglio sull'Occidente: stesso rapporto del riquadro */ role:'img','aria-label':'Mappa dell\'Impero romano','preserveAspectRatio':'xMidYMid slice'},ospite);
var defs=el('defs',{},svg), trama=el('pattern',{id:'trama-conteso',width:7,height:7,patternUnits:'userSpaceOnUse',patternTransform:'rotate(40)'},defs);
el('rect',{width:7,height:7,fill:'#DCD0B8'},trama); el('rect',{width:3.2,height:7,fill:'#9A2F2A'},trama);
el('rect',{'class':'m-mare',width:G.w,height:G.h},svg);
el('path',{'class':'m-terra',d:G.terra},svg);

var regioni={}, nomi={};
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id];
  regioni[id]=el('path',{'class':'m-regione perso',d:r.d},svg);
  el('title',{},regioni[id]).textContent=r.nome;
});
Object.keys(G.regioni).forEach(function(id){
  var r=G.regioni[id]; if(id==='isole'||id==='provenza'||id==='rezia') return;   // troppo piccole per un nome
  nomi[id]=el('text',{'class':'m-nome',x:r.c[0],y:r.c[1]},svg); nomi[id].textContent=r.nome;
});
var citta=el('g',{'class':'m-citta'},svg);
['roma','ravenna','milano','treviri','cartagine','costantinopoli'].forEach(function(id){
  var c=G.citta[id]; el('circle',{cx:c.x,cy:c.y,r:3.2},citta);
  var sinistra=id==='ravenna'||id==='treviri';
  el('text',{x:c.x+(sinistra?7:-7),y:c.y+(id==='milano'?-7:id==='roma'?14:4),'text-anchor':sinistra?'start':'end'},citta).textContent=c.nome;
});

/* I popoli: ciascuno è una nuvola di punti che sta dove stava il grosso del gruppo e ha il colore del suo rapporto con Roma in quel momento.
   Niente frecce: fra una tappa e l'altra la nuvola si sposta. */
var RAPPORTI=[['fuori','oltre il confine'],['accolti','ammessi nell\'impero'],['federati','alleati per trattato'],['armi','in armi dentro l\'impero'],['regno','un regno proprio']];
var popoli={}, stratoPopoli=el('g',{'class':'m-popoli'},svg);
Object.keys(G.popoli||{}).forEach(function(id,k){
  var q=G.popoli[id], g=el('g',{'class':'m-popolo fuori'},stratoPopoli), n=q.peso*3, i, s=k*97+13;
  function caso(){ s=(s*16807+7)%2147483647; return s/2147483647; }
  for(i=0;i<n;i++){ var a=caso()*6.283, r=Math.sqrt(caso())*(5+q.peso*1.5); el('circle',{cx:(Math.cos(a)*r).toFixed(1),cy:(Math.sin(a)*r*.72).toFixed(1),r:(1.5+caso()*1.2).toFixed(1)},g); }
  var t=el('text',{y:-(9+q.peso*1.3)},g); t.textContent=q.nome;
  popoli[id]={g:g,t:t,q:q};
});
function mostraPopoli(anno){
  for(var id in popoli){
    var p=popoli[id], q=p.q, k=-1, i; for(i=0;i<q.t.length;i++) if(anno>=q.t[i][0]) k=i;
    var c=k<0?'via':anno>q.fine?'via':q.t[k][3], v=q.t[Math.max(0,k)], nome=q.nome;
    for(i=0;i<q.poi.length;i++) if(anno>=q.poi[i][0]) nome=q.poi[i][1];
    p.g.setAttribute('class','m-popolo '+c); p.g.style.transform='translate('+v[1]+'px,'+v[2]+'px)';
    if(p.t.textContent!==nome) p.t.textContent=nome;
  }
}

var legenda=document.getElementById('legendaMappa');
STATI.forEach(function(s){
  var v=document.createElement('span'), i=document.createElement('i');
  i.style.background=s[0]==='conteso'?'repeating-linear-gradient(130deg,#9A2F2A 0 3px,#DCD0B8 3px 6px)':'var(--st-'+s[0]+')';
  if(s[0]==='oriente') i.style.opacity=.6;
  v.appendChild(i); v.appendChild(document.createTextNode(s[1])); legenda.appendChild(v);
});

var legendaPopoli=document.getElementById('legendaPopoli');
if(legendaPopoli && G.popoli) RAPPORTI.forEach(function(r){ var v=document.createElement('span'), i=document.createElement('i'); i.className='p-'+r[0]; v.appendChild(i); v.appendChild(document.createTextNode(r[1])); legendaPopoli.appendChild(v); });

window.RM_mappa={
  mostra:function(stati,anno){
    if(anno!=null) mostraPopoli(anno);
    for(var id in regioni){
      var s=stati[id]||'perso';
      regioni[id].setAttribute('class','m-regione '+s);
      if(nomi[id]) nomi[id].setAttribute('class','m-nome'+(s==='perso'||s==='conteso'?' chiaro':''));
    }
  },
  /* quota dell'Occidente governata da Roma, pesata per regione: federati e contesi valgono metà */
  territorio:function(stati){
    var tot=0, ok=0;
    for(var id in G.regioni){ var p=G.regioni[id].peso; tot+=p; ok+=p*(stati[id]==='roma'?1:(stati[id]==='federati'||stati[id]==='conteso')?.5:0); }
    return ok/tot*100;
  }
};
})();
