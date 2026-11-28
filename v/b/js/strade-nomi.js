/* Nomi delle strade sulla scena di Roma (25 novembre 2026, chiesto dall'utente: «Puoi anche indicare il nome delle strade principali (Argileto, via Sacra etc) sulla mappa di Roma?»).
   Solo nomi antichi attestati, ciascuno con la voce letta che lo sostiene: Platner e Ashby, A Topographical Dictionary of Ancient Rome (1929), su LacusCurtius, letto il 25 novembre 2026
   (le citazioni sono nel commento accanto a ogni nome). Le strade del modello (RM_TOPO.strade, da src/roma/genera.mjs) sono le vie moderne eredi: il nome si scrive solo sul tratto
   che la voce descrive, fra due punti a e b; il programma prende la strada del modello più vicina a quei due punti e il pezzo che sta fra loro.
   Lasciati fuori: «via Recta» (per Platner e Ashby, voce Via Tecta, il nome «is due to a wrong reading» di Seneca; così anche Hülsen in src/testi/topografia-fonti.md), via Settimiana
   (nessuna voce antica), clivo Argentario («found only in mediaeval documents»), clivo di Scauro (nome attestato solo dopo l'antichità, «probably ancient»), vico di Capo d'Africa (la
   strada è dedotta dal nome), Labicana (si stacca dalla Prenestina dentro la porta, e il modello ne ha una sola), le vie corte dei ponti e degli ingressi (nomi moderni o descrizioni).
   Resa: corsivo, chiaro e quieto; il nome sta a metà del tratto visibile e lo segue senza capovolgersi; non copre i nomi dei monumenti (RM.etichetteMesse, js/monumenti.js) né gli altri.
   Le vie consolari si leggono da lontano; quelle del centro quando la camera è a meno di 450 unità dal punto guardato e il loro tratto sullo schermo è più lungo del nome. Si nascondono nei primi piani
   (camera a meno di 30 unità dal punto guardato), quando ci sono i cartellini dei protagonisti di una messa in scena (js/scene-tappe.js) e quando i nomi dei monumenti sono spenti.
   Interruttore «Nomi delle strade» nel menu Strumenti: acceso di norma; sul telefono i nomi si vedono solo a tutto schermo. La scelta vale per la visita (sessionStorage «rm-strade»). */
(function(){
'use strict';
var RM=window.RM; if(!RM || RM.guasto || !window.RM_TOPO || !RM.camera) return;
var S=RM_TOPO.strade;

/* n: nome; a, b: capi del tratto (coordinate di scena); g: via grande, si legge anche da lontano; dal/fino: anni del nome */
var NOMI=[
  {n:'via Sacra', a:[27,20], b:[4,1]},                       // Sacra Via: «from the top of the Velia to the entrance to the forum»
  {n:'via Nova', a:[25,22], b:[7,14]},                       // Nova Via: «ran along the north slope of the hill to its north-west corner»
  {n:'clivo Capitolino', a:[-10,-2], b:[-19,5]},             // Clivus Capitolinus: dall'arco di Tiberio, davanti al tempio di Saturno, su verso l'area Capitolina
  {n:'vico Tusco', a:[-1,12], b:[-14,43]},                   // Vicus Tuscus: «principal artery of communication» fra il Foro e il foro Boario
  {n:'vico Iugario', a:[-10,4], b:[-38,18]},                 // Vicus Iugarius: dal Foro alla porta Carmentale, «close to the southern edge of the Capitol»
  {n:'Argileto', a:[21,-20], b:[48,-25]},                    // Argiletum: dalla Suburra al Foro, «one of the great arteries»; il tratto basso diventa il foro di Nerva, perciò il nome sta sopra
  {n:'clivo Suburano', a:[62,-27], b:[118,-38]},             // cliva, Clivus Suburanus: «ascended between the Oppius and Cispius to the porta Esquilina»
  {n:'vico Longo', a:[13,-20], b:[85,-88]},                  // vici, Vicus Longus: «the street that traversed the valley between the Quirinal and the Viminal»
  {n:'vico Patrizio', a:[61,-25], b:[96,-77]},               // vici, Vicus Patricius: «ran north between the Cispius and the Viminal to the porta Viminalis»
  {n:'Alta Semita', a:[24,-78], b:[80,-128]},                // Alta Semita: «along the ridge of the Quirinal» fino alla porta Collina
  {n:'via Lata', a:[-22,-37], b:[-77,-211], g:1, dal:300},   // Via Flaminia: «The part within the Aurelian walls was known as the via Lata from the fourth century A.D. onwards»
  {n:'via Flaminia', a:[-22,-37], b:[-77,-211], g:1, fino:300},   // prima del IV secolo il tratto in città è ancora la Flaminia, che partiva da una porta delle mura serviane sotto il Campidoglio
  {n:'via Flaminia', a:[-80,-220], b:[-106,-606], g:1},      // fuori porta del Popolo, verso ponte Milvio
  {n:'via Salaria', a:[81,-131], b:[189,-496], g:1},        // Via Salaria: dalla porta Collina (dove il modello la stacca) alla porta Salaria e oltre
  {n:'via Nomentana', a:[84,-132], b:[436,-483], g:1},      // Via Nomentana: si stacca dalla Salaria fuori della porta Collina, «soon passed through the porta Nomentana»
  {n:'via Tiburtina', a:[212,-58], b:[619,-250], g:1},       // Via Tiburtina: dalla porta Esquilina; il nome si scrive fuori della porta Tiburtina
  {n:'via Prenestina', a:[256,13], b:[624,-9], g:1},         // Via Praenestina: dalla porta Esquilina, si separa dalla Labicana «just before the Porta Praenestina»
  {n:'via Appia', a:[43,96], b:[400,578], g:1},              // Via Appia: dalla porta Capena, fuori per la porta Appia delle mura aureliane
  {n:'via Latina', a:[142,178], b:[396,328], g:1},           // Via Latina: «branched off to the left» dall'Appia, fuori per la porta Latina
  {n:'via Ostiense', a:[-34,182], b:[-139,549], g:1},        // Via Ostiensis (src/testi/topografia-fonti.md): fuori porta San Paolo
  {n:'via Portuense', a:[-94,96], b:[-316,389], g:1},        // Via Portuensis (topografia-fonti.md): dal pons Aemilius per Trastevere alla porta Portuense
  {n:'via Aurelia', a:[-110,45], b:[-455,13], g:1},          // Via Aurelia (topografia-fonti.md): per Trastevere, su al Gianicolo, fuori per la porta Aurelia
  {n:'via Cornelia', a:[-162,-110.8], b:[-246,-105]}         // Via Cornelia: passava San Pietro ed era «later extended» a est fino al pons Aelius
];

/* il pezzo della strada più vicina ai due capi */
function piede(x,z,L){ var m=1e9, s=0, acc=0, k;
  for(k=0;k<L.length-1;k++){ var ax=L[k][0], az=L[k][1], dx=L[k+1][0]-ax, dz=L[k+1][1]-az, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)), d=Math.hypot(ax+dx*t-x,az+dz*t-z);
    if(d<m){ m=d; s=acc+t*Math.sqrt(l2); } acc+=Math.sqrt(l2); }
  return {d:m, s:s}; }
function punto(L,s){ var acc=0; for(var k=0;k<L.length-1;k++){ var l=Math.hypot(L[k+1][0]-L[k][0],L[k+1][1]-L[k][1]); if(acc+l>=s||k===L.length-2){ var t=l?Math.max(0,Math.min(1,(s-acc)/l)):0; return [L[k][0]+(L[k+1][0]-L[k][0])*t, L[k][1]+(L[k+1][1]-L[k][1])*t]; } acc+=l; } return L[0]; }
var pronti=false;
function prepara(){
  var h=RM.hSuolo||RM.h; if(!h) return false;
  NOMI.forEach(function(o){
    var meglio=null;
    S.forEach(function(L){ var pa=piede(o.a[0],o.a[1],L), pb=piede(o.b[0],o.b[1],L), d=pa.d+pb.d; if(!meglio||d<meglio.d) meglio={d:d,L:L,s0:pa.s,s1:pb.s}; });
    var lung=Math.abs(meglio.s1-meglio.s0), n=Math.max(4,Math.min(24,Math.round(lung/4)));
    o.pt=[]; for(var i=0;i<=n;i++){ var p=punto(meglio.L,meglio.s0+(meglio.s1-meglio.s0)*i/n); o.pt.push(new THREE.Vector3(p[0],h(p[0],p[1])+1.2,p[1])); }
    o.sx=new Float32Array(n+1); o.sy=new Float32Array(n+1); o.ok=new Uint8Array(n+1);
    if(meglio.d>30) console.warn('strade-nomi: tratto lontano dalla strada',o.n,meglio.d.toFixed(1));
  });
  return true; }

/* ---------- interruttore ---------- */
var acceso=true; try{ acceso=sessionStorage.getItem('rm-strade')!=='0'; }catch(e){}
if(/[?&]strade=0/.test(location.search)) acceso=false;      // per le catture «prima»
var btn=document.getElementById('btnStrade');
function scriviBtn(){ if(btn) btn.setAttribute('aria-pressed',acceso?'true':'false'); }
scriviBtn();
if(btn) btn.addEventListener('click',function(){ acceso=!acceso; scriviBtn(); try{ sessionStorage.setItem('rm-strade',acceso?'1':'0'); }catch(e){} if(!acceso) spegni(); ultimo=''; });

/* ---------- strato ---------- */
var riquadro=document.getElementById('scena').parentNode, strato=document.createElement('div'); strato.className='strade3d'; strato.setAttribute('aria-hidden','true');
var etM=riquadro.querySelector('.etichette3d'); riquadro.insertBefore(strato,etM||null);
NOMI.forEach(function(o){ o.el=document.createElement('span'); o.el.textContent=o.n; strato.appendChild(o.el); });
var anno=300; RM.moduli.push(function(a){ anno=a; ultimo=''; });
function spegni(){ NOMI.forEach(function(o){ if(o.vis){ o.vis=false; o.el.style.visibility='hidden'; o.el.style.opacity=0; } }); }

var v=new THREE.Vector3(), ultimo='', conta=0, capi=false, MAX=20, ostacoli=[], firmaOst='';
/* i comandi e le scritte sopra la scena (menu, zoom, didascalia, scheda, contatore): i nomi non ci vanno sotto */
var SOPRA='.strumenti .apri, .strumenti .voci, .comandi-scena, .evento, .ev-i, .conta, .scheda, .riga-tempo, .legenda-sapere, .esplora';
function tocca(a,b){ return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]; }
RM.frame.push(function(){
  if(!acceso) return;
  var w=riquadro.clientWidth, hh=riquadro.clientHeight, grande=document.body.classList.contains('roma-grande');
  if((conta++)%6===0){ capi=false; var c=document.querySelector('.capi3d'); if(c){ for(var i=0;i<c.children.length;i++) if(c.children[i].style.display==='block'){ capi=true; break; } }
    if(acceso && w){ ostacoli=[]; var rq=riquadro.getBoundingClientRect(), el=riquadro.querySelectorAll(SOPRA);
      for(i=0;i<el.length;i++){ var b=el[i].getBoundingClientRect(); if(!b.width||!b.height) continue; var cs=getComputedStyle(el[i]); if(cs.visibility==='hidden'||+cs.opacity<.05) continue;
        ostacoli.push([b.left-rq.left-4,b.top-rq.top-4,b.right-rq.left+4,b.bottom-rq.top+4]); }
      firmaOst=ostacoli.map(function(r){ return r.map(Math.round).join(','); }).join(';'); } }
  var dT=RM.camera.position.distanceTo(RM.controlli.target);
  var via=!w || !hh || (window.innerWidth<=700 && !grande) || document.body.classList.contains('impero-grande') || capi || dT<30 || (etM && etM.style.display==='none');
  if(via){ if(ultimo!=='via'){ spegni(); ultimo='via'; } return; }
  /* si ricalcola solo se la camera o il riquadro sono cambiati */
  var e=RM.camera.matrixWorld.elements, firma=w+'|'+hh+'|'+e[12].toFixed(1)+'|'+e[13].toFixed(1)+'|'+e[14].toFixed(1)+'|'+e[8].toFixed(3)+'|'+e[9].toFixed(3)+'|'+e[10].toFixed(3)+'|'+(RM.etichetteMesse?RM.etichetteMesse.length:0)+'|'+firmaOst;
  if(firma===ultimo) return; ultimo=firma;
  if(!pronti){ pronti=prepara(); if(!pronti) return; }
  var inv=RM.camera.matrixWorldInverse, cand=[];
  NOMI.forEach(function(o){
    o.prossimo=null;
    if((o.dal!=null && anno<o.dal) || (o.fino!=null && anno>=o.fino)) return;
    if(!o.g && dT>450) return;      // le vie del centro solo avvicinandosi (la vista d'insieme è a 567)
    var n=o.pt.length, i, mig=-1, migL=0, inizio=-1, lungo=0;
    for(i=0;i<n;i++){ var p=o.pt[i]; v.copy(p).applyMatrix4(inv); var dav=v.z<-2 && -v.z<1600;
      v.copy(p).project(RM.camera); o.ok[i]=dav && v.z<1 && Math.abs(v.x)<.9 && v.y>-.88 && v.y<.86  ? 1:0;      // il contatore e i comandi sono fra gli ostacoli
      o.sx[i]=(v.x+1)*w/2; o.sy[i]=(1-v.y)*hh/2; }
    /* il tratto visibile più lungo sullo schermo */
    for(i=0;i<=n;i++){ if(i<n && o.ok[i]){ if(inizio<0){ inizio=i; lungo=0; } else lungo+=Math.hypot(o.sx[i]-o.sx[i-1],o.sy[i]-o.sy[i-1]); }
      else if(inizio>=0){ if(lungo>migL){ migL=lungo; mig=inizio; o.fineT=i-1; } inizio=-1; } }
    if(mig<0) return;
    if(!o.lw || o.lwG!==grande){ var ow=o.el.offsetWidth; o.lw=ow||o.n.length*6.5; o.lh=o.el.offsetHeight||15; o.lwG=ow?grande:null; }      // a tutto schermo il corpo cambia: si rimisura
    if(migL<o.lw*1.15) return;      // il tratto sullo schermo è più corto del nome: troppo lontano
    cand.push({o:o, da:mig, a:o.fineT, L:migL});
  });
  /* prima le più vicine al punto guardato */
  var t=RM.controlli.target;
  cand.forEach(function(c){ var m=c.o.pt[Math.round((c.da+c.a)/2)]; c.d=Math.hypot(m.x-t.x,m.z-t.z)-(c.o.g?0:40); });
  cand.sort(function(a,b){ return a.d-b.d; });
  var messi=(RM.etichetteMesse||[]).concat(ostacoli), quanti=0;
  cand.forEach(function(c){
    if(quanti>=MAX) return;
    var o=c.o, prove=[.5,.32,.68,.2,.8];
    for(var k=0;k<prove.length;k++){
      /* il punto a quella frazione della lunghezza sullo schermo */
      var obiettivo=c.L*prove[k], acc=0, j=c.da, px=o.sx[c.da], py=o.sy[c.da], dx=1, dy=0;
      for(j=c.da+1;j<=c.a;j++){ var l=Math.hypot(o.sx[j]-o.sx[j-1],o.sy[j]-o.sy[j-1]); if(acc+l>=obiettivo){ var f=l?(obiettivo-acc)/l:0; px=o.sx[j-1]+(o.sx[j]-o.sx[j-1])*f; py=o.sy[j-1]+(o.sy[j]-o.sy[j-1])*f; break; } acc+=l; }
      /* la direzione: da un capo all'altro del nome, lungo la strada */
      var j0=Math.max(c.da,j-2), j1=Math.min(c.a,j+1); dx=o.sx[j1]-o.sx[j0]; dy=o.sy[j1]-o.sy[j0];
      var ang=Math.atan2(dy,dx); if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
      var cs=Math.abs(Math.cos(ang)), sn=Math.abs(Math.sin(ang)), mw=(cs*o.lw+sn*o.lh)/2+3, mh=(sn*o.lw+cs*o.lh)/2+2, r=[px-mw,py-mh,px+mw,py+mh];
      if(r[0]<4||r[2]>w-4||r[1]<4||r[3]>hh-4) continue;
      var libero=true; for(var q=0;q<messi.length;q++) if(tocca(r,messi[q])){ libero=false; break; }
      if(!libero) continue;
      messi.push(r); quanti++; o.prossimo={x:px,y:py,a:ang*180/Math.PI}; break;
    }
  });
  NOMI.forEach(function(o){
    var p=o.prossimo;
    if(p){ o.el.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) translate(-50%,-50%) rotate('+p.a.toFixed(1)+'deg)';
      if(!o.vis){ o.vis=true; o.el.style.visibility='visible'; o.el.style.opacity=1; } }
    else if(o.vis){ o.vis=false; o.el.style.visibility='hidden'; o.el.style.opacity=0; }
  });
});
RM.nomiStrade={ nomi:NOMI, acceso:function(){ return acceso; } };      // per le prove
})();
