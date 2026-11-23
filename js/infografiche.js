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

/* ---------- 3. La moneta perde l'argento ----------
   La curva dell'argento nella moneta (CURVE.argento, fonti nel commento in js/dati.js: Walker in Katsari 2002, RIC online, Burnett, Estiot; valori indicativi) e una moneta che passa dal colore
   dell'argento a quello del rame. I momenti vengono dai testi del 274 e dell'intermezzo della moneta (284). */
var MONETA={ titolo:"La moneta perde l'argento", sotto:"Quanto argento c'era nella moneta d'argento, dal 235 al 308",
  momenti:[[235,"Il denario contiene ancora quasi metà d'argento."],[260,"Sotto Gallieno l'argento scende a meno di un quinto."],[268,"Sotto Claudio II la moneta è ormai quasi tutta di rame: meno del 3%."],
    [274,"Aureliano stabilisce che la moneta contenga almeno il 5% d'argento."],[294,"Diocleziano introduce una moneta nuova, il nummo, con circa il 4%."],[301,"Diocleziano raddoppia per legge il valore delle monete e fissa più di 1.200 prezzi massimi."]],
  fonte:"Percentuali indicative: le analisi della superficie delle monete sovrastimano l'argento (Butcher e Ponting). Dati di Walker (in Katsari 2002), RIC online, Burnett ed Estiot; l'editto dei prezzi del 301 nell'edizione di Kropff (2016). Tra il 309 e il 312 compare il solido d'oro, stabile per secoli." };
function disegnaMoneta(svg,stato){
  var C=(D.CURVE||{}).argento; if(!C) return; var P=C.punti.concat([[308,4]]);
  var W=640, H=300, L=50, Rr=150, Tp=14, B=34, x=function(a){ return L+(a-235)/(308-235)*(W-L-Rr); }, y=function(v){ return Tp+(1-v/50)*(H-Tp-B); };
  [0,10,20,30,40,50].forEach(function(v){ el('line',{x1:L,x2:W-Rr,y1:y(v),y2:y(v),class:'ig-griglia'},svg); var t=el('text',{x:L-6,y:y(v)+4,class:'ig-asse','text-anchor':'end'},svg); t.textContent=v+'%'; });
  [235,250,268,284,301].forEach(function(a){ var t=el('text',{x:x(a),y:H-14,class:'ig-asse','text-anchor':'middle'},svg); t.textContent=a; });
  var d=P.map(function(p,i){ return (i?'L':'M')+x(p[0]).toFixed(1)+' '+y(p[1]).toFixed(1); }).join(' ');
  var linea=el('path',{d:d,class:'ig-linea'},svg), lung=linea.getTotalLength?linea.getTotalLength():1500;
  var segni=MONETA.momenti.map(function(m){ var v=valore(P,m[0]), g=el('g',{class:'ig-momento'},svg); el('circle',{cx:x(m[0]),cy:y(v),r:4.5},g); return {a:m[0],g:g,t:m[1]}; });
  var cx=W-75, cy=130, moneta=el('circle',{cx:cx,cy:cy,r:52,class:'ig-moneta'},svg); el('circle',{cx:cx,cy:cy,r:44,fill:'none',stroke:'rgba(0,0,0,.18)','stroke-width':1.5},svg);
  var perc=el('text',{x:cx,y:cy+8,class:'ig-moneta-num','text-anchor':'middle'},svg), sotto=el('text',{x:cx,y:cy+78,class:'ig-asse','text-anchor':'middle'},svg); sotto.textContent="d'argento";
  var cur=el('g',{class:'ig-cursore'},svg), lab=el('text',{x:0,y:0,class:'ig-valore','text-anchor':'middle'},cur);
  function colore(v){ var k=Math.max(0,Math.min(1,v/45)), a=[176,106,59], b=[205,208,213]; return 'rgb('+a.map(function(c,i){ return Math.round(c+(b[i]-c)*k); }).join(',')+')'; }      // dal rame all'argento
  stato.passo=function(k){ var anno=235+k*73, v=valore(P,anno); linea.style.strokeDasharray=lung; linea.style.strokeDashoffset=lung*(1-k);
    moneta.setAttribute('fill',colore(v)); perc.textContent=(v<10?v.toFixed(1).replace('.',','):Math.round(v))+'%';
    cur.setAttribute('transform','translate('+x(anno).toFixed(1)+','+(y(v)-12).toFixed(1)+')'); lab.textContent=Math.round(anno);
    var ultimo=null; segni.forEach(function(s){ var on=s.a<=anno; s.g.classList.toggle('acceso',on); if(on) ultimo=s; }); return ultimo?ultimo.a+' · '+ultimo.t:MONETA.sotto; };
  stato.tutti=segni.map(function(s){ return [s.a,s.t]; });
}

/* ---------- 5. Le navi scompaiono ----------
   I relitti datati nel Mediterraneo, con il I secolo uguale a 100 (CURVE.commerci: banca dati di Oxford, 2017; Robinson e Wilson 2011). Cento navicelle: restano accese quante ne dicono i dati.
   I momenti vengono dalle tappe (439, 534, la conquista araba nei passi del 711). */
var NAVI={ titolo:"Le navi scompaiono", sotto:"Relitti datati nel Mediterraneo: per ogni 100 del I secolo, quanti ne restano",
  momenti:[[235,"Nel III secolo i relitti sono già meno della metà di quelli del I secolo."],[439,"I Vandali prendono Cartagine, il grande porto del grano per Roma."],[534,"Belisario riprende l'Africa: il mare torna dell'impero, ma i traffici restano bassi."],
    [642,"Gli Arabi prendono Alessandria; nel 698 anche Cartagine."],[725,"Nell'VIII secolo i relitti sono pochissimi."]],
  fonte:"Banca dati dei relitti di Strauss, Wilson e Flohr (Oxford Roman Economy Project, 2017) e Robinson e Wilson (2011). Si contano le navi trovate e datate, non le merci: navi più grandi, o meno naufragi, cambierebbero il quadro." };
function disegnaNavi(svg,stato){
  var C=(D.CURVE||{}).commerci; if(!C) return; var P=C.punti, navi=[], i;
  for(i=0;i<100;i++){ var cx=40+(i%20)*28, cy=40+Math.floor(i/20)*34, g=el('g',{class:'ig-nave',transform:'translate('+cx+','+cy+')'},svg);
    el('path',{d:'M-10 0 L10 0 L6 6 L-6 6 Z'},g); el('path',{d:'M0 -12 L0 0 M0 -12 L8 -3 L0 -3',class:'ig-vela'},g); navi.push(g); }
  var base=el('line',{x1:40,x2:600,y1:238,y2:238,class:'ig-griglia'},svg), sx=function(a){ return 40+(a-235)/(852-235)*560; };
  [235,400,500,600,700,852].forEach(function(a){ var t=el('text',{x:sx(a),y:258,class:'ig-asse','text-anchor':'middle'},svg); t.textContent=a; });
  var barra=el('rect',{x:40,y:232,width:0,height:6,class:'ig-barra'},svg), num=el('text',{x:600,y:222,class:'ig-valore','text-anchor':'end'},svg);
  var segni=NAVI.momenti.map(function(m){ var g=el('g',{class:'ig-momento'},svg); el('circle',{cx:sx(m[0]),cy:238,r:4.5},g); return {a:m[0],g:g,t:m[1]}; });
  stato.passo=function(k){ var anno=235+k*617, v=Math.round(valore(P,anno)); navi.forEach(function(n,j){ n.classList.toggle('spenta',j>=v); });
    barra.setAttribute('width',(sx(anno)-40).toFixed(1)); num.textContent=Math.round(anno)+': '+v+' su 100';
    var ultimo=null; segni.forEach(function(s){ var on=s.a<=anno; s.g.classList.toggle('acceso',on); if(on) ultimo=s; }); return ultimo?ultimo.a+' · '+ultimo.t:NAVI.sotto; };
  stato.tutti=segni.map(function(s){ return [s.a,s.t]; });
}

/* ---------- 4. Il sacco del 410, in pochi giorni ----------
   Pianta schematica con le mura e il Tevere del modello (RM_TOPO, da OpenStreetMap). Le fasi e i luoghi sono quelli della didascalia della città (EVENTI sacco410: Procopio III 2,
   Orosio VII 39, Marcellino Comes); la basilica Emilia è detta «probabilmente» come lì. Dove i Goti siano passati dopo la porta non è scritto: nessuna freccia dentro la città. */
var SACCO={ titolo:"Il sacco del 410", sotto:"Che cosa dicono le fonti, giorno per giorno", vb:'0 0 640 420',
  fasi:[[.02,"24 agosto 410: i Goti di Alarico entrano da porta Salaria, dove erano accampati dall'inizio dell'assedio."],[.2,"Bruciano le case vicino alla porta e la casa di Sallustio, lo storico."],
    [.38,"Probabilmente risale a quei giorni anche l'incendio della basilica Emilia, nel Foro."],[.55,"Chi cerca rifugio nelle basiliche di San Pietro e di San Paolo è rispettato."],
    [.72,"Il saccheggio dura tre giorni, secondo Orosio."],[.86,"Sei giorni, secondo Marcellino Comes: le fonti non concordano."]],
  fonte:"Procopio, Guerre III 2 (porta Salaria, il campo di Alarico, la casa di Sallustio); Orosio VII 39 (tre giorni, il rispetto delle basiliche); Marcellino Comes (sei giorni). La pianta usa le mura e il Tevere del modello; i luoghi degli incendi sono quelli della scena della città." };
function disegnaSacco(svg,stato){
  var TP=window.RM_TOPO; if(!TP) return; var X0=-330, Z0=-245, S=.64, ox=(640-610*S)/2, P=function(x,z){ return [(ox+(x-X0)*S).toFixed(1),(12+(z-Z0)*S).toFixed(1)]; };
  var riva=TP.fiume.filter(function(p){ return p[1]>-260&&p[1]<400; }).map(function(p){ return P(p[0],p[1]).join(','); }).join(' ');
  el('polyline',{points:riva,class:'ig-fiume'},svg);
  el('polygon',{points:TP.mura.map(function(p){ return P(p[0],p[1]).join(','); }).join(' '),class:'ig-mura'},svg);
  function punto(x,z,cl,nome,dx,dy){ var q=P(x,z), g=el('g',{class:'ig-luogo '+cl},svg); el('circle',{cx:q[0],cy:q[1],r:6},g); var t=el('text',{x:+q[0]+(dx||9),y:+q[1]+4+(dy||0),class:'ig-asse','text-anchor':dx<0?'end':'start'},g); t.textContent=nome; return g; }
  var G=TP.porte['Porta Salaria'], qg=P(G[0],G[1]), qf=P(G[0]+10,G[1]-40);
  var entra=el('g',{class:'ig-luogo goti'},svg); el('line',{x1:qf[0],y1:qf[1],x2:qg[0],y2:qg[1],class:'ig-freccia'},entra); el('circle',{cx:qg[0],cy:qg[1],r:7},entra); var tg=el('text',{x:+qg[0]+10,y:+qg[1]-4,class:'ig-asse'},entra); tg.textContent='porta Salaria';
  var fuochi=[punto(100,-192,'fuoco','case presso la porta',10,16),punto(78,-165,'fuoco','casa di Sallustio',-10)], emilia=punto(7.2,-1,'fuoco','basilica Emilia',10);
  var rifugi=[punto(-259,-108,'rifugio','San Pietro',-10),punto(-70,376,'rifugio','San Paolo',10)];
  var gq=el('text',{x:620,y:400,class:'ig-giorni','text-anchor':'end'},svg);
  var passi=[entra].concat([fuochi,emilia,rifugi]);
  stato.passo=function(k){ var f=null; SACCO.fasi.forEach(function(x){ if(k>=x[0]) f=x; });
    entra.classList.toggle('acceso',k>=.02); fuochi.forEach(function(g){ g.classList.toggle('acceso',k>=.2); }); emilia.classList.toggle('acceso',k>=.38); rifugi.forEach(function(g){ g.classList.toggle('acceso',k>=.55); });
    gq.textContent=k<.72?'':k<.86?'3 giorni (Orosio)':'6 giorni (Marcellino Comes)'; return f?f[1]:SACCO.sotto; };
  stato.tutti=SACCO.fasi.map(function(x){ return ['410',x[1]]; });
}

var INFO={ roma:{d:ROMA, disegna:disegnaRoma, dura:26000, tappe:function(t){ return t.anno===590&&t.intermezzo || t.anno===852&&!t.intermezzo; }},
  moneta:{d:MONETA, disegna:disegnaMoneta, dura:20000, tappe:function(t){ return t.anno===284&&t.intermezzo || t.anno===274&&!t.intermezzo; }},
  navi:{d:NAVI, disegna:disegnaNavi, dura:22000, tappe:function(t){ return t.anno===395&&t.intermezzo || t.anno===711&&!t.intermezzo; }},
  sacco:{d:SACCO, disegna:disegnaSacco, dura:24000, tappe:function(t){ return t.anno===410&&!t.intermezzo; }},
  terre:{d:TERRE, disegna:disegnaTerre, dura:22000, tappe:function(t){ return t.anno===476&&t.intermezzo&&/esercito/i.test(t.titolo) || t.anno===439&&!t.intermezzo; }} };

/* ---------- la finestra ---------- */
var dlg=null, raf=0;
function apri(chi){
  var I=INFO[chi]; if(!I) return; chiudi();
  dlg=h('dialog','ig-finestra',null,document.body); dlg.setAttribute('aria-label',I.d.titolo);
  var testa=h('div','ig-testa',null,dlg); h('h2','ig-titolo',I.d.titolo,testa); h('p','ig-sotto',I.d.sotto,testa);
  var x=h('button','ig-chiudi','×',testa); x.type='button'; x.setAttribute('aria-label','Chiudi');
  var svg=el('svg',{viewBox:I.d.vb||'0 0 640 300',class:'ig-grafico',role:'img','aria-label':I.d.titolo},dlg); dlg.appendChild(svg);
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
