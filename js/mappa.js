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

var legenda=document.getElementById('legendaMappa');
STATI.forEach(function(s){
  var v=document.createElement('span'), i=document.createElement('i');
  i.style.background=s[0]==='conteso'?'repeating-linear-gradient(130deg,#9A2F2A 0 3px,#DCD0B8 3px 6px)':'var(--st-'+s[0]+')';
  if(s[0]==='oriente') i.style.opacity=.6;
  v.appendChild(i); v.appendChild(document.createTextNode(s[1])); legenda.appendChild(v);
});

window.RM_mappa={
  mostra:function(stati){
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
