/* Tessuto abitato: isolati disposti per quartieri, ciascuno con la sua griglia di strade.
   Ogni isolato ha una "tenuta": chi ce l'ha bassa viene abbandonato per primo.
   Abbandonato, l'isolato non scompare: resta in piedi qualche decennio e si guasta (intonaco, coppi, finestre, crepe, erba), perde il tetto e i piani alti,
   poi resta un guscio di muri che crolla a tratti, fra cumuli di macerie, e si copre di rovi, edera e alberelli (26 novembre 2026: si veda aggiorna e «case abbandonate»).
   Ogni isolato ha un destino (guscio alto, rudere basso, rudere molto basso con a volte un orto) e un'età contata dall'anno in cui è stato lasciato.
   Le rovine restano fino all'852, sempre più basse: le fonti parlano di case e chiese «in rovina», non di una città tornata campagna (l'utente, 26 novembre 2026).

   Tre specie di case (23 novembre 2026, l'utente: «distinguendo tra le insulae della Suburra e le ville dei ricchi»):
   - insulae, i caseggiati d'affitto a più piani con le botteghe al piano terra: «An insula… generally contained several separate houses, or at least separate apartments or shops,
     which were let to different families»; «the highest floors being usually inhabited by the poor»; Augusto «restricted the height of all new houses which were built by the side
     of the public roads to seventy feet» (Smith, Dictionary of Greek and Roman Antiquities, voce Domus; Strabone V 235). Settanta piedi sono 20,7 m: qui nessuna casa li supera
     (prima il modello arrivava a 30). Le più alte e fitte stanno nella Suburra, «the valley between the southern end of the Viminal and the western end of the Esquiline, or Oppius»,
     unita al Foro dall'Argileto e continuata a est dal clivus Suburanus fino alla porta Esquilina: quartiere «fervens», «clamosa», di botteghe e di mercanti (Platner e Ashby,
     Subura). Che lì le case fossero le più alte di Roma la voce non lo dice: è un'ipotesi del modello;
   - domus, le case dei ricchi: muri quasi ciechi («The Roman houses had few windows»), l'atrio con l'apertura nel tetto (compluvium) sopra la vasca (impluvium), il peristilio,
     «a court open to the sky in the middle… frequently decorated with flowers and shrubs», a volte due botteghe ai lati dell'ingresso (Smith, Domus). Stanno sui colli: fra le domus
     che Platner e Ashby elencano (voce Domus, letta dalla A alla H) ricorrono il Quirinale, poi il Celio e l'Aventino, e ancora Viminale ed Esquilino. Quante fossero e dove
     stesse ciascuna non si sa: la distribuzione è indicativa, e una domus qui occupa un isolato intero;
   - case basse, a uno o due piani, ai margini e fuori le mura.
   I balconi delle insulae e il limite di sessanta piedi di Traiano, che si leggono spesso, non stavano nelle fonti lette: non ci sono. */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PASSO=5.6, isolati=[];
/* Numeri a caso legati al posto (25 novembre 2026). Prima tutta la città usciva da una sola fila di numeri a caso (rnd), estratti uno dopo l'altro: posto, misura e
   orientamento di ogni casa dipendevano da quante estrazioni c'erano state prima, e bastava una strada o una zona nuova (cioè un candidato in più o in meno che passa
   libero()) per rimescolare tutta Roma. Ora ogni punto della griglia di un quartiere ha la sua fila, il cui seme viene dal centro del quartiere e dagli indici del punto
   (semePosto): un candidato scartato non consuma niente agli altri, e una via o una zona nuova toglie solo le case che tocca. Lo stesso per gli alberi (seme della casa,
   o del giardino) e per le rive (fila a sé). Ciò che resta legato all'insieme è il rango di abbandono (p1, p2: la posizione di una casa fra tutte), per forza:
   la quota di case lasciate segue la curva della popolazione; una casa in più o in meno lo sposta di una frazione minima. */
function semePosto(a,b,c,d){ var h=Math.imul((a|0)^0x2545F491,0x9E3779B1); h=Math.imul(h^(h>>>15)^((b|0)+0x3C6EF372),0x85EBCA77); h=Math.imul(h^(h>>>13)^((c|0)+0x7F4A7C15),0xC2B2AE3D);
  h=Math.imul(h^(h>>>16)^((d|0)+0x165667B1),0x27D4EB2F); h=Math.imul(h^(h>>>15),0x2C1B3C6D); return (h^(h>>>16))>>>0; }

/* ---------- dove sorgono gli isolati ---------- */
var QUARTIERI=[[-90,-70,.08],[-60,-150,.3],[40,-35,.6],[70,-90,.75],[150,-40,.35],[120,50,.1],[90,110,.5],[-25,110,.3],[-60,150,.05],[80,170,.75],
               [-125,40,.35],[-230,-105,0],[-40,25,.62],[-20,-190,.3],[150,-120,.6],[190,80,.9],[-70,-15,.3],[40,-110,.45],[220,10,.2],[210,60,.5],[-150,-20,.4]];
var NUCLEI=RM.NUCLEI;
function tenuta(x,z,rnd){
  var t=0;
  NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,n[2]*Math.exp(-(d*d)/(n[3]*n[3]))); });
  t+=.25*Math.exp(-RM.distFiume(x,z)/45);          // vicino al fiume c'è acqua anche senza acquedotti
  t-=.008*RM.h(x,z);                               // i colli si svuotano un po' prima
  return t+(rnd()-.5)*.08;
}
/* Tenuta nei secoli V-VII. Gli scavi mostrano un abitato sparso su tutta l'area dentro le mura, non ancora raccolto sul Tevere:
   qui conta soprattutto il caso, con un piccolo vantaggio per chi sta vicino al fiume o a una chiesa e uno svantaggio per i colli e i margini. */
function tenutaSparsa(x,z,rnd){
  var t=0;
  NUCLEI.forEach(function(n){ var d=Math.hypot(x-n[0],z-n[1]); t=Math.max(t,(n[3]>15?.22:.4)*n[2]*Math.exp(-(d*d)/(n[3]>15?70*70:13*13))); });
  t+=.2*Math.exp(-RM.distFiume(x,z)/45)-.02*RM.h(x,z)-.22*RM.sfuma(140,300,Math.hypot(x-5,z-5));
  return t+(rnd()-.5)*.8;
}
/* 0 = occupato; 1 = libero; un anno = libero fino a quell'anno, quando sul sito si apre il cantiere di un monumento e le case vengono demolite
   (per le terme di Diocleziano lo dice l'iscrizione dedicatoria: edifici comprati e abbattuti per far posto all'opera) */
function libero(x,z,margine){
  if(RM.distFiume(x,z)<9.5 || RM.distStrade(x,z)<2.5) return 0;
  var i, q, fino=1;
  for(i=0;i<RM.zone.length;i++){ q=RM.zone[i]; if(RM.dZona(q,x,z)<q.r+(q.a?q.t||0:0)+margine){ if(!(q.dal>0)) return 0; fino=fino>1?Math.min(fino,q.dal):q.dal; } }      // un rettangolo (RM.dZona, js/base.js) arriva fino al bordo della sua sfumatura, cioè al muro della piattaforma
  for(i=0;i<RM.HORTI.length;i++){ q=RM.HORTI[i]; if(Math.hypot(x-q[0],z-q[1])<q[2]+1) return 0; }
  for(i=0;i<RM.campateAcquedotti.length;i++){ q=RM.campateAcquedotti[i]; if(Math.abs(x-q.x)<6 && Math.hypot(x-q.x,z-q.z)<3.5+q.len*.25) return 0; }   // né sotto le arcate degli acquedotti
  return fino;
}
/* Le vie campionate ogni mezza unità, in una griglia: un isolato non deve toccare la strada. La prova sul solo centro (in libero) non basta,
   perché l'angolo di una casa può finire su una via che passa di sbieco. */
var CELLA=8, grigliaVie={};
RM.STRADE.forEach(function(s,i){
  var lw=((window.RM_TOPO||{}).stradeLarghe||[])[i]||.6;
  for(var k=0;k<s.length-1;k++){ var a=s[k], b=s[k+1], n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5));
    for(var j=0;j<n;j++){ var px=a[0]+(b[0]-a[0])*j/n, pz=a[1]+(b[1]-a[1])*j/n, c=Math.floor(px/CELLA)+','+Math.floor(pz/CELLA); (grigliaVie[c]||(grigliaVie[c]=[])).push(px,pz,lw); } }
});
function sullaVia(b){
  var ca=Math.cos(b.ry), sa=Math.sin(b.ry), cx=Math.floor(b.x/CELLA), cz=Math.floor(b.z/CELLA), i, j, k, q, dx, dz;
  for(i=-1;i<=1;i++) for(j=-1;j<=1;j++){ q=grigliaVie[(cx+i)+','+(cz+j)]; if(!q) continue;
    for(k=0;k<q.length;k+=3){ dx=q[k]-b.x; dz=q[k+1]-b.z; if(Math.abs(dx*ca-dz*sa)<b.w/2+q[k+2]+.3 && Math.abs(dx*sa+dz*ca)<b.d/2+q[k+2]+.3) return true; } }
  return false;
}
function quartiereDi(x,z){ var m=1e9, k=0; for(var i=0;i<QUARTIERI.length;i++){ var d=Math.hypot(x-QUARTIERI[i][0],z-QUARTIERI[i][1]); if(d<m){ m=d; k=i; } } return k; }
QUARTIERI.forEach(function(Q,k){
  var ca=Math.cos(Q[2]), sa=Math.sin(Q[2]), R=30, qx=Math.round(Q[0]*10), qz=Math.round(Q[1]*10);
  for(var i=-R;i<=R;i++) for(var j=-R;j<=R;j++){
    var x=Q[0]+(i*ca+j*sa)*PASSO, z=Q[1]+(-i*sa+j*ca)*PASSO;
    if(x<-330||x>330||z<-380||z>420 || quartiereDi(x,z)!==k) continue;
    var seme=semePosto(qx,qz,i,j), rnd=RM.casuale(seme);      // la fila di numeri a caso di questo punto della griglia, e di nessun altro
    var dentro=RM.dentroMura(x,z), bordo=RM.distLinea(x,z,RM.MURA,true), centro=Math.hypot(x-5,z-5);
    var borgo=dentro?0:Math.exp(-((x+228)*(x+228)/(27*27)+(z+104)*(z+104)/(15*15)));               // il Borgo, fra San Pietro e il fiume: case che nasceranno dal V secolo, dentro quella che sarà la città leonina (a nord non oltre il Passetto)
    var dens=dentro ? .95-.28*RM.sfuma(150,290,centro) : Math.max(.36*Math.exp(-bordo/24),.8*borgo);
    var lib; if(bordo<3.5 || rnd()>dens || !(lib=libero(x,z,2.4)) || (lib>1&&borgo>.3)) continue;
    var e=1.9, y0=RM.h(x,z), y1=RM.h(x+e,z+e), y2=RM.h(x-e,z+e), y3=RM.h(x+e,z-e), y4=RM.h(x-e,z-e), yMin=Math.min(y0,y1,y2,y3,y4);
    if(Math.max(y0,y1,y2,y3,y4)-yMin>2.2) continue;        // rupi e scarpate restano nude
    var fitto=1-RM.sfuma(30,240,centro), alt=dentro ? Math.min(2.07,.85+1.25*fitto*(.5+.5*rnd())+.3*rnd()) : .55+.5*rnd(), s=rnd();
    var sub=dentro?Math.exp(-(Math.pow((x-56)/30,2)+Math.pow((z+34)/15,2))):0, caso=RM.grana(Math.round(x*7.3),Math.round(z*5.1)), caso2=RM.grana(Math.round(z*3.7)+17,Math.round(x*9.1)-5);      // sub: quanto si è dentro la Suburra; caso e caso2 vengono dal posto con RM.grana (scelta del 23 novembre, tenuta così il tipo delle case non cambia)
    var tp=!dentro?(s<.6?2:0):(s<.5-.15*fitto?2:s<.92-.14*fitto?0:1);
    if(dentro && caso2<(.3*RM.sfuma(4.8,6.4,RM.hGrezza(x,z))+.02)*(1-Math.min(1,sub*1.6))){ tp=3; alt=.55+.25*caso; }      // domus: sui pianori dei colli, quasi mai in valle, mai nella Suburra
    else if(sub>.45){ alt=Math.min(2.07,Math.max(alt,1.5+.57*caso)); if(tp===2) tp=caso<.6?1:0; }                          // Suburra: caseggiati alti, molti a corte
    else if(alt<1.05 && tp!==1) tp=tp===0?4:5;                                                                           // case basse
    var nuovo={x:x,z:z,y:yMin,ry:Q[2]+(rnd()-.5)*.05,w:3.85+rnd()*.9,d:3.85+rnd()*.9,alt:alt,
      tipo:tp,              // 0 insula a falde, 1 insula a corte, 2 insula a padiglione, 3 domus, 4 casa bassa a falde, 5 casa bassa a padiglione
      k:tenuta(x,z,rnd)+(dentro?0:-.35), k1:tenutaSparsa(x,z,rnd)+(dentro?0:-.6), rudere:.16+.3*rnd(), sorte:rnd(), tono:rnd(), sfasa:rnd(), dentro:dentro, via:lib>1?lib:0, a0:-1, q0:0, e0:-1, alb:0, nasce:borgo>.3?450+Math.round(330*rnd()*(1.15-borgo)):0, seme:seme};
    if(sullaVia(nuovo)){ nuovo.w=Math.max(3,nuovo.w*.78); nuovo.d=Math.max(3,nuovo.d*.78); if(sullaVia(nuovo)) continue; }      // sulla strada: l'isolato si stringe, e se non basta non c'è
    isolati.push(nuovo);
  }
});
isolati.forEach(function(b){ if(b.nasce){ b.k=9; b.k1=9; b.alt=.6+.5*b.tono; b.tipo=b.tipo===2||b.tipo===5?5:4; } });      // il Borgo non si svuota: è l'unico quartiere che cresce
isolati.slice().sort(function(a,b){ return a.k-b.k; }).forEach(function(o,i,tutti){ o.p2=i/(tutti.length-1); });     // rango dall'VIII secolo: nuclei sul Tevere e isole attorno alle chiese
isolati.slice().sort(function(a,b){ return a.k1-b.k1; }).forEach(function(o,i,tutti){ o.p1=i/(tutti.length-1); });   // rango fino al VII secolo: abitato sparso
/* fra il 640 e il 790 si passa da un ordine all'altro: la gente si raccoglie nel Campo Marzio e attorno alle chiese, e lì si torna a costruire */
function rango(b,anno){ return b.p1+(b.p2-b.p1)*RM.sfuma(640,790,anno); }
var N=RM.N_ISOLATI=isolati.length; RM.isolati=isolati;
/* anno in cui ciascun isolato viene lasciato, e che cosa ne resta alla fine */
(function(){
  var soglie=[], y; for(y=200;y<=852;y++) soglie.push(1-D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,y)));
  isolati.forEach(function(b){
    b.lasciato=9999; for(var k=0;k<soglie.length;k++) if(rango(b,200+k)<soglie[k]){ b.lasciato=200+k; break; }
    b.fato=b.dentro?(b.sorte<.34?0:b.sorte<.8?1:2):(b.sorte<.3?1:2);          // 0 guscio alto, 1 rudere basso, 2 rudere molto basso (fra i suoi monconi, a volte, un orto)
    b.hFin=b.fato===0?.5+.38*b.tono:b.fato===1?b.rudere+.06:.12+.1*b.tono;    // quanto resta in piedi, in quota dell'altezza (26 novembre 2026: rovine basse un po' più alte, perché restino leggibili)
    b.giro=(b.sorte*977)|0;                                                   // quarti di giro: quattro profili di rovina diversi
    b.orto=b.dentro?(b.fato===2 && b.tono<.6):b.fato===2;                    // orto o vigna fra i monconi, come ipotesi: dentro le mura circa un isolato su otto (prima uno su cinque, e dopo due-tre secoli quasi tutti i ruderi bassi)
    b.vigna=b.orto && RM.grana(Math.round(b.x*4.1)+3,Math.round(b.z*6.7)+11)<.4;
    /* Gli stadi dell'abbandono di una casa (26 novembre 2026; l'utente: «mostrare i danni anche alle case normali abbandonate. Le insulae e le ville»):
       1, abbandonata ma in piedi, fino a t1 (12-34 anni): cade l'intonaco, mancano coppi e si vedono le travi, finestre vuote e buie, crepe, erba al piede e sul tetto;
       2, fino a t2 (altri 22-52 anni): il tetto sfonda, i piani alti cadono a tronconi, i muri si spezzano; 3, la rovina (geoRudere), che si abbassa e si copre di verde.
       Negli orti tutto va più in fretta (si sgombra). I tempi sono una resa: nessuna fonte letta dice quanto resta in piedi una casa lasciata. */
    var fr=b.fato===2?.65:1; b.t1=(12+22*b.sfasa)*fr; b.t2=b.t1+(22+30*b.tono)*fr;
    b.bassa0=1-.42*RM.sfuma(470,720,b.lasciato+b.sfasa*12);                   // l'altezza della casa quando fu lasciata: le case a più piani lasciano il posto a case basse (si veda aggiorna)
    b.anello=!sullaVia({x:b.x,z:b.z,ry:b.ry,w:b.w*1.24,d:b.d*1.24});          // c'è posto per i rovi fuori dai muri senza toccare una strada
  });
  /* Orti e vigne attestati dentro le mura, accanto alle case abitate (src/testi/vita-roma-fonti.md, «Orti, vigne, pascoli e rovine dentro le mura»): dall'anno della fonte,
     su una parte dei lotti in rovina attorno al luogo. [x, z, raggio, anno, quota dei lotti, vigna]:
     presso le terme di Agrippa, Campo Marzio (Gregorio Magno, Registrum IX 138, maggio 599); davanti ai gradini di Santa Sabina, Aventino (indice del Registrum, 598-599);
     attorno a Santa Susanna, Quirinale: case con orto e «hortus vineatus» (carta di Sergio I, 687-701, edita da De Rossi). Quanti lotti e quali è una scelta del modello. */
  var SS=RM.ll(41.9042,12.4937);
  var ORTI_FONTI=[[-69,-49,13,599,.5,0],[-46,89,11,598,.5,0],[SS[0]!=null?SS[0]:SS.x,SS[1]!=null?SS[1]:SS.z,14,687,.55,1]];      // il quarto, l'orto del Borgo presso il portico di San Pietro (Leone IV), ha un posto suo: si veda più sotto, ortoBorgo
  RM.ORTI_FONTI=ORTI_FONTI;
  isolati.forEach(function(b){ ORTI_FONTI.forEach(function(o){ if(Math.hypot(b.x-o[0],b.z-o[1])<o[2] && RM.grana(Math.round(b.x*5.3)+29,Math.round(b.z*3.9)-13)<o[4]){ b.ortoDal=Math.min(b.ortoDal||9999,o[3]); if(o[5]) b.vigna=true; } }); });
  /* spoglio: vicino ai monumenti usati come cava (dove js/vita.js accende le calcare) anche i ruderi delle case finiscono nei forni da calce e si abbassano di più */
  var CAVE=[]; (RM.MONUMENTI||[]).forEach(function(m){ var st=(D.MONUMENTI||{})[m.id]||[]; st.forEach(function(q){ if(q[1]==='cava' && m.x!=null) CAVE.push([m.x,m.z,(m.raggio||6)+22,q[0]]); }); });
  isolati.forEach(function(b){ CAVE.forEach(function(c){ if(Math.hypot(b.x-c[0],b.z-c[1])<c[2]) b.cava=Math.min(b.cava||9999,c[3]); }); });
  /* incendi dei sacchi: attorno a ogni fuoco una parte degli isolati brucia e resta un guscio annerito per qualche decennio */
  (D.EVENTI||[]).forEach(function(ev){ if(!ev.bruciati) return; ev.fuochi.forEach(function(f){ isolati.forEach(function(b){
    var dd=Math.hypot(b.x-f[0],b.z-f[1])/(ev.bruciati*f[2]);
    if(dd<1 && b.fuoco==null && b.tono<1.05-dd){ b.fuoco=ev.da; b.fuocoFine=ev.da+(ev.ricostruzione?ev.ricostruzione*(.6+.8*b.sfasa):18+30*b.sfasa); }   // il Borgo dell'847 viene rifatto in pochi anni
  }); }); });
})();

/* ---------- trame ---------- */
var FIN=[], rf=RM.casuale(21);
(function(){ for(var r=0;r<4;r++) for(var c=0;c<6;c++) FIN.push([9+c*20,12+r*21,7,10,rf()<.4]); for(var t=0;t<4;t++) FIN.push([8+t*31,101,19,24,rf()<.5]); })();      // insula: quattro piani di finestre e, a terra, le botteghe
var texMuri=RM.tela(128,128,function(g,W,H){
  g.fillStyle='#f3eee4'; g.fillRect(0,0,W,H);
  for(var i=0;i<260;i++){ g.fillStyle='rgba(120,95,70,'+(.02+rf()*.05)+')'; g.fillRect(rf()*W,rf()*H,2+rf()*10,6+rf()*30); }
  g.fillStyle='rgba(110,85,60,.25)'; [29,50,71,92].forEach(function(y){ g.fillRect(0,y,W,1); });
  FIN.forEach(function(f){ g.fillStyle='#35281f'; g.fillRect(f[0],f[1],f[2],f[3]); });
  g.fillStyle='rgba(120,70,45,.5)'; g.fillRect(0,96,W,3);                                    // l'architrave di legno sopra le botteghe
});
/* casa bassa: una fila di finestre sopra porte e botteghe */
var FINB=[]; (function(){ for(var c=0;c<5;c++) FINB.push([10+c*24,26,9,16,rf()<.4]); FINB.push([10,78,22,44,rf()<.5],[54,74,16,50,false],[92,78,22,44,rf()<.5]); })();
var texBasse=RM.tela(128,128,function(g,W,H){
  g.fillStyle='#f1ebdd'; g.fillRect(0,0,W,H);
  for(var i=0;i<220;i++){ g.fillStyle='rgba(120,95,70,'+(.02+rf()*.05)+')'; g.fillRect(rf()*W,rf()*H,2+rf()*10,6+rf()*30); }
  g.fillStyle='rgba(110,85,60,.25)'; g.fillRect(0,62,W,1);
  FINB.forEach(function(f){ g.fillStyle='#35281f'; g.fillRect(f[0],f[1],f[2],f[3]); });
});
var texLumiB=RM.tela(128,128,function(g,W,H){ g.fillStyle='#000'; g.fillRect(0,0,W,H); FINB.forEach(function(f){ if(f[4]){ g.fillStyle='#ffc070'; g.fillRect(f[0],f[1],f[2],f[3]); } }); });
/* domus: muri quasi ciechi. A sinistra della trama la fronte (la porta fra due botteghe), a destra un fianco con poche finestrelle alte */
var texDomus=RM.tela(256,128,function(g,W,H){
  g.fillStyle='#efe7d6'; g.fillRect(0,0,W,H);
  for(var i=0;i<320;i++){ g.fillStyle='rgba(120,95,70,'+(.02+rf()*.05)+')'; g.fillRect(rf()*W,rf()*H,2+rf()*12,6+rf()*30); }
  g.fillStyle='rgba(95,75,55,.16)'; g.fillRect(0,100,W,28);                                  // lo zoccolo, più scuro
  g.fillStyle='#35281f'; g.fillRect(56,62,16,66); g.fillRect(14,78,26,50); g.fillRect(88,78,26,50);      // la porta e le due botteghe
  g.fillStyle='rgba(235,225,205,.9)'; g.fillRect(52,56,24,5);                                // la cornice sopra la porta
  g.fillStyle='#3f3127'; [150,190,230].forEach(function(x){ g.fillRect(x,34,6,8); }); [24,100].forEach(function(x){ g.fillRect(x,34,6,8); });
});
var texLumi=RM.tela(128,128,function(g,W,H){
  g.fillStyle='#000'; g.fillRect(0,0,W,H);
  FIN.forEach(function(f){ if(f[4]){ g.fillStyle='#ffc070'; g.fillRect(f[0],f[1],f[2],f[3]); } });
});
var texCoppi=RM.tela(64,64,function(g,W,H){
  g.fillStyle='#aa6243'; g.fillRect(0,0,W,H);
  for(var x=0;x<W;x+=4){ g.fillStyle=x%8?'#9a573e':'#be8263'; g.fillRect(x,0,2,H); }
  for(var i=0;i<140;i++){ g.fillStyle='rgba('+(rf()<.5?'70,40,25':'230,170,120')+','+(.05+rf()*.12)+')'; g.fillRect(rf()*W,rf()*H,3,5); }
  g.fillStyle='rgba(60,35,22,.22)'; for(var y=0;y<H;y+=8) g.fillRect(0,y,W,1);
}); texCoppi.repeat.set(2,1.5);
var texRudere=RM.tela(64,64,function(g,W,H){                     // muro scrostato: intonaco a chiazze sul mattone, finestre vuote
  g.fillStyle='#d9cfc0'; g.fillRect(0,0,W,H);
  for(var i=0;i<120;i++){ g.fillStyle=['rgba(160,100,70,.45)','rgba(95,82,66,.28)','rgba(240,232,215,.45)','rgba(110,120,80,.25)','rgba(150,95,65,.3)'][(rf()*5)|0]; g.fillRect(rf()*W,rf()*H,3+rf()*10,2+rf()*6); }
  for(var y=0;y<H;y+=4){ g.fillStyle='rgba(90,60,40,.07)'; g.fillRect(0,y,W,1); }
  g.fillStyle='#3a2d24'; [[12,8],[42,8],[12,36],[42,36]].forEach(function(f){ g.fillRect(f[0],f[1],9,12); });
  g.fillStyle='rgba(60,50,40,.35)'; g.fillRect(0,58,W,6);
});
var texIncolto=RM.tela(64,64,function(g,W,H){                    // il suolo fra le rovine (26 novembre 2026): terra e calcinacci grigio-bruni, sassi e cocci, erba secca e ciuffi verdi a chiazze; prima era un prato giallo-verde
  g.fillStyle='#9a9278'; g.fillRect(0,0,W,H);
  for(var i=0;i<260;i++){ g.fillStyle=['rgba(95,110,62,.4)','rgba(170,158,112,.4)','rgba(120,104,86,.5)','rgba(150,140,128,.5)','rgba(105,96,84,.45)','rgba(165,110,80,.35)'][(rf()*6)|0]; g.beginPath(); g.arc(rf()*W,rf()*H,1+rf()*4,0,6.3); g.fill(); }
});
var texOrto=RM.tela(64,64,function(g,W,H){
  g.fillStyle='#93956a'; g.fillRect(0,0,W,H);
  for(var y=0;y<H;y+=7){ g.fillStyle=y%14?'#7a8852':'#878f5e'; g.fillRect(0,y,W,3); }
  for(var i=0;i<60;i++){ g.fillStyle='rgba('+(rf()<.5?'150,130,80':'60,90,45')+',.3)'; g.fillRect(rf()*W,rf()*H,5,3); }
});
var texAlone=RM.tela(32,32,function(g){ var q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,190,110,1)'); q.addColorStop(.35,'rgba(255,160,70,.35)'); q.addColorStop(1,'rgba(255,140,50,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); },false);

/* ---------- forme (cubo unitario: base al suolo, lato 1, altezza 1) ---------- */
function Forma(){ this.g=[[],[],[],[],[],[]]; }               // gruppi: 0 muri, 1 tetto, 2 corte; per la domus anche 3 giardino, 4 acqua, 5 pietra
Forma.prototype.q=function(gr,a,b,c,d,piano){
  var u=piano?[[.01,.99],[.01,.99],[.01,.99],[.01,.99]]:[[0,0],[1,0],[1,1],[0,1]], v=[a,b,c,d];
  [[0,1,2],[0,2,3]].forEach(function(t){ t.forEach(function(k){ this.g[gr].push(v[k][0],v[k][1],v[k][2],u[k][0],u[k][1]); },this); },this); return this;
};
/* come q, ma con le coordinate della trama date punto per punto */
Forma.prototype.qu=function(gr,a,b,c,d,u){
  var v=[a,b,c,d]; [[0,1,2],[0,2,3]].forEach(function(t){ t.forEach(function(k){ this.g[gr].push(v[k][0],v[k][1],v[k][2],u[k][0],u[k][1]); },this); },this); return this;
};
Forma.prototype.t=function(gr,a,b,c){ [a,b,c].forEach(function(p){ this.g[gr].push(p[0],p[1],p[2],.01,.99); },this); return this; };
Forma.prototype.muri=function(h){
  var s=.5;
  return this.q(0,[-s,0,s],[s,0,s],[s,h,s],[-s,h,s]).q(0,[s,0,-s],[-s,0,-s],[-s,h,-s],[s,h,-s]).q(0,[s,0,s],[s,0,-s],[s,h,-s],[s,h,s]).q(0,[-s,0,-s],[-s,0,s],[-s,h,s],[-s,h,-s]);
};
Forma.prototype.fine=function(){
  var pos=[], uv=[], g=new THREE.BufferGeometry(), inizio=0;
  this.g.forEach(function(lista,k){
    for(var i=0;i<lista.length;i+=5){ pos.push(lista[i],lista[i+1],lista[i+2]); uv.push(lista[i+3],lista[i+4]); }
    if(lista.length){ g.addGroup(inizio,lista.length/5,k); inizio+=lista.length/5; }
  });
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals(); return g;
};
var s=.5, o=.54;
var FORME=[
  (function(){ var f=new Forma().muri(.78);                                            // a due falde
    f.t(0,[s,.78,s],[s,.78,-s],[s,1,0]).t(0,[-s,.78,-s],[-s,.78,s],[-s,1,0]);
    return f.q(1,[-o,.74,o],[o,.74,o],[o,1,0],[-o,1,0]).q(1,[o,.74,-o],[-o,.74,-o],[-o,1,0],[o,1,0]).fine(); })(),
  (function(){ var f=new Forma().muri(.9), c=.2, m=.35;                                // a corte
    f.q(0,[-c,.04,-c],[c,.04,-c],[c,.8,-c],[-c,.8,-c],1).q(0,[c,.04,c],[-c,.04,c],[-c,.8,c],[c,.8,c],1).q(0,[c,.04,-c],[c,.04,c],[c,.8,c],[c,.8,-c],1).q(0,[-c,.04,c],[-c,.04,-c],[-c,.8,-c],[-c,.8,c],1);
    [[1,1],[-1,1],[-1,-1],[1,-1]].forEach(function(e,i,E){ var n=E[(i+1)%4];           // falda esterna e interna, lato per lato
      f.q(1,[e[0]*o,.88,e[1]*o],[n[0]*o,.88,n[1]*o],[n[0]*m,1,n[1]*m],[e[0]*m,1,e[1]*m]).q(1,[e[0]*m,1,e[1]*m],[n[0]*m,1,n[1]*m],[n[0]*c,.8,n[1]*c],[e[0]*c,.8,e[1]*c]); });
    return f.q(2,[-c,.04,c],[c,.04,c],[c,.04,-c],[-c,.04,-c],1).fine(); })(),
  (function(){ var f=new Forma().muri(.72), r=.2;                                      // a padiglione
    f.q(1,[-o,.7,o],[o,.7,o],[r,1,0],[-r,1,0]).q(1,[o,.7,-o],[-o,.7,-o],[-r,1,0],[r,1,0]);
    return f.t(1,[o,.7,o],[o,.7,-o],[r,1,0]).t(1,[-o,.7,-o],[-o,.7,o],[-r,1,0]).fine(); })()
];
/* Domus (vedi in testa): i tetti scendono verso l'interno, come nelle case ad atrio. Davanti l'atrio, col foro del compluvio e sotto la vasca; dietro il peristilio, un giardino
   a cielo aperto col suo colonnato. Il pavimento sta a un terzo dell'altezza, per restare sopra il terreno anche in pendenza. Misure e numero delle colonne indicativi. */
var geoDomus=(function(){ var f=new Forma(), T=1, B=.8, y0=.3;
  f.qu(0,[-s,0,s],[s,0,s],[s,T,s],[-s,T,s],[[0,0],[.5,0],[.5,1],[0,1]]);                                                                   // la fronte
  [[[s,0,-s],[-s,0,-s]],[[s,0,s],[s,0,-s]],[[-s,0,-s],[-s,0,s]]].forEach(function(l){ f.qu(0,l[0],l[1],[l[1][0],T,l[1][2]],[l[0][0],T,l[0][2]],[[.5,0],[1,0],[1,1],[.5,1]]); });      // fianchi e retro
  function anello(x0,x1,z0,z1,a0,a1,c0,c1){                                                                                                 // tetto attorno a un'apertura: fuori alto, dentro basso
    f.q(1,[x0,T,z1],[x1,T,z1],[a1,B,c1],[a0,B,c1]).q(1,[x1,T,z0],[x0,T,z0],[a0,B,c0],[a1,B,c0]).q(1,[x1,T,z1],[x1,T,z0],[a1,B,c0],[a1,B,c1]).q(1,[x0,T,z0],[x0,T,z1],[a0,B,c1],[a0,B,c0]); }
  anello(-s,s,0,s,-.085,.085,.165,.335); anello(-s,s,-s,0,-.27,.27,-.39,-.07);
  f.q(2,[-s,y0,s],[s,y0,s],[s,y0,0],[-s,y0,0],1).q(4,[-.075,y0+.02,.325],[.075,y0+.02,.325],[.075,y0+.02,.175],[-.075,y0+.02,.175],1);       // il pavimento dell'atrio e la vasca
  f.q(2,[-s,y0,0],[s,y0,0],[s,y0,-s],[-s,y0,-s],1).q(3,[-.25,y0+.02,-.09],[.25,y0+.02,-.09],[.25,y0+.02,-.37],[-.25,y0+.02,-.37],1);          // il portico e il giardino
  [[-.27,-.39],[-.09,-.39],[.09,-.39],[.27,-.39],[-.27,-.07],[-.09,-.07],[.09,-.07],[.27,-.07],[-.27,-.23],[.27,-.23]].forEach(function(c){ var r=.016, x=c[0], z=c[1];      // le colonne del peristilio
    f.q(5,[x-r,y0,z+r],[x+r,y0,z+r],[x+r,B,z+r],[x-r,B,z+r],1).q(5,[x+r,y0,z-r],[x-r,y0,z-r],[x-r,B,z-r],[x+r,B,z-r],1).q(5,[x+r,y0,z+r],[x+r,y0,z-r],[x+r,B,z-r],[x+r,B,z+r],1).q(5,[x-r,y0,z-r],[x-r,y0,z+r],[x-r,B,z+r],[x-r,B,z-r],1); });
  return f.fine(); })();
FORME.push(geoDomus,FORME[0],FORME[2]);                                                   // 3 domus; 4 e 5 le case basse, con le stesse forme delle insulae a falde e a padiglione
/* guscio: muri perimetrali a creste rotte, due tramezzi. Alto 1: l'istanza lo abbassa man mano che crolla */
var geoRudere=(function(){ var f=new Forma(), n=4, lati=[[-s,s,s,s],[s,s,s,-s],[s,-s,-s,-s],[-s,-s,-s,s]],
    alt=[[[1,1],[.92,.7],[.7,.96],[.96,.82]],[[.82,.82],[.36,.3],[.3,.9],[1,1]],[[.66,.52],[.94,.94],[.94,.8],[.46,.2]],[[.9,.9],[.74,.6],[.2,.26],[.6,.88]]];
  lati.forEach(function(l,i){ for(var k=0;k<n;k++){ var x0=l[0]+(l[2]-l[0])*k/n, z0=l[1]+(l[3]-l[1])*k/n, x1=l[0]+(l[2]-l[0])*(k+1)/n, z1=l[1]+(l[3]-l[1])*(k+1)/n, h=alt[i][k];
    f.qu(0,[x0,0,z0],[x1,0,z1],[x1,h[1],z1],[x0,h[0],z0],[[k/2,0],[(k+1)/2,0],[(k+1)/2,h[1]],[k/2,h[0]]]); } });      /* prima ogni tratto prendeva la trama intera, alta o bassa che fosse: sui muri bassi le finestre si schiacciavano, sui tramezzi si stiravano (23 novembre 2026) */
  f.qu(0,[-.12,0,-s],[-.12,0,s],[-.12,.5,s],[-.12,.84,-s],[[0,0],[2,0],[2,.5],[0,.84]]).qu(0,[-.12,0,.1],[s,0,.1],[s,.34,.1],[-.12,.62,.1],[[0,0],[1.24,0],[1.24,.34],[0,.62]]);
  return f.fine(); })();
/* quel che resta del tetto subito dopo l'abbandono: una falda e mezza, sfondata */
var geoTettoRotto=(function(){ var f=new Forma();
  f.q(0,[-o,.74,o],[.12,.74,o],[-.05,1,0],[-o,1,0]).t(0,[.12,.74,o],[.34,.8,.3],[-.05,1,0]).q(0,[-.2,.74,-o],[-o,.74,-o],[-o,1,0],[-.3,1,0]);
  return f.fine(); })();
/* cumulo di macerie */
var geoMacerie=(function(){ var f=new Forma(), r=RM.casuale(99);                 // tre cumuli bassi e sformati, non un solo cono
  [[-.12,-.08,.38],[.2,.2,.26]].forEach(function(c){
    var n=5, est=[], int=[], k, j, alto=.5+.5*r();
    for(k=0;k<n;k++){ var a=k/n*6.283+r(), re=c[2]*(.8+.4*r()), ri=c[2]*(.35+.3*r()); est.push([c[0]+Math.cos(a)*re,0,c[1]+Math.sin(a)*re]); int.push([c[0]+Math.cos(a)*ri,alto*(.6+.4*r()),c[1]+Math.sin(a)*ri]); }
    for(k=0;k<n;k++){ j=(k+1)%n; f.t(0,est[k],int[k],est[j]).t(0,est[j],int[k],int[j]).t(0,int[k],[c[0],alto*.85,c[1]],int[j]); }
  });
  return f.fine(); })();
/* L'incolto fra le rovine (26 novembre 2026; l'utente: «più vegetazione incolta nella zona della città abbandonata… come realisticamente dovrebbe apparire»).
   Nessuna fonte antica elenca le piante delle rovine di Roma: dicono «erba», «arbusta», «dumi et vepres», cioè cespugli e rovi (vite di Adriano I e di Gregorio II nel Liber Pontificalis).
   Le specie vengono, come confronto dichiarato, dalla flora del Colosseo di Deakin (1855): rovo, lentisco, sambuco nano (erba alta a ombrelle bianche), valeriana rossa,
   e sui muri edera e cappero; fra gli alberi fichi e olmi, pochi (src/testi/vita-roma-fonti.md, «Le piante dell'incolto»). Niente ailanto, robinia, fico d'India, agave: arrivati dopo.
   Due macchie per isolato: dentro i muri (si vede quando il tetto è caduto) e un anello stretto fuori, contro i muri, solo dove non tocca una strada (b.anello).
   La pianta è a misura dell'isolato (x e z dell'istanza), l'altezza in unità vere (y dell'istanza: la crescita). Tre dettagli (RM.QUALITA.incolto): 0 nessuna macchia («bassa»),
   1 poche e più semplici («telefono»), 2 tutte. In quanto tempo crescano è un'ipotesi per analogia coi campi abbandonati (Bonet e Pausas 2004): erba nei primi anni,
   rovi e arbusti entro venti-trent'anni, alberelli dopo qualche decennio. */
RM.QUALITA.incolto=[0,2,2,2,1];      // bassa, media, alta, massima, telefono
var PIANTE={rovo:RM.col(0x47552f), lentisco:RM.col(0x3a4d2c), sambuco:RM.col(0x7c8650), fiori:RM.col(0xe6e2cc), valeriana:RM.col(0xa64a58), secco:RM.col(0x9b9361), edera:RM.col(0x2f4424)};
function macchiaGeo(fuori,det){ var B=new RM.Costruttore(), sg=det>1?[5,2]:[4,2], L;      // circa 170 triangoli per isolato col dettaglio 2 (i rovi di prima ne avevano 144), 60 col dettaglio 1
  if(det<1) return B.geo(new THREE.PlaneGeometry(.001,.001),PIANTE.secco).geometria();
  /* [x, z, raggio in pianta (frazione dell'isolato), altezza in unità, specie] */
  L=fuori?[[-.56,-.3,.06,.17,'rovo'],[.56,.18,.06,.15,'lentisco'],[.1,.56,.07,.16,'rovo'],[-.28,-.56,.05,.09,'sambuco'],[.42,-.56,.04,.07,'valeriana']]
         :[[-.36,-.36,.09,.2,'rovo'],[.36,.38,.08,.18,'lentisco'],[.36,-.34,.06,.1,'sambuco'],[-.38,.34,.07,.16,'rovo'],[.02,.36,.05,.07,'valeriana'],[.4,.02,.05,.14,'lentisco']];
  if(det<2) L=L.filter(function(p,i){ return i%2===0; });
  L.forEach(function(p,i){ var g=new THREE.SphereGeometry(1,sg[0],sg[1],0,6.283,0,1.75).scale(p[2],p[3],p[2]*(.8+.4*((i*7)%3)/2)).rotateY(i*1.3).translate(p[0],-.01,p[1]);
    B.geo(g,PIANTE[p[4]]);
    if(p[4]==='sambuco' && det>1) B.geo(new THREE.CircleGeometry(p[2]*.8,5).rotateX(-Math.PI/2).translate(p[0],p[3]*.92,p[1]),PIANTE.fiori); });      // le ombrelle bianche del sambuco nano
  return B.geometria(); }
var detIncolto=RM.QUALITA.incolto[RM.q]||0;
/* Vigna: quattro filari bassi su pali (l'«hortus vineatus» della carta di Santa Susanna); misure indicative */
var geoVigna=(function(){ var B=new RM.Costruttore(), VITE=RM.col(0x5f7238), PALO=RM.col(0x6a5640);
  for(var k=0;k<4;k++){ var z=-.33+k*.22; B.geo(new THREE.BoxGeometry(.8,.05,.03).translate(0,.075,z),VITE); B.geo(new THREE.BoxGeometry(.012,.1,.012).translate(-.4,.05,z),PALO).geo(new THREE.BoxGeometry(.012,.1,.012).translate(.4,.05,z),PALO); }
  return B.geometria(); })();

/* ---------- maglie ---------- */
var matMuri=new THREE.MeshStandardMaterial({map:texMuri,roughness:.95,side:THREE.DoubleSide,emissive:new THREE.Color(0xffffff),emissiveMap:texLumi,emissiveIntensity:0});
var matTetti=new THREE.MeshStandardMaterial({map:texCoppi,roughness:.9,side:THREE.DoubleSide});
var matCorte=new THREE.MeshStandardMaterial({color:RM.col(0x8f7f6a),roughness:1});
/* ombra d'appoggio: le pareti si scuriscono verso il suolo, così le case sembrano posate e non incollate */
function appoggio(mat,mattoni){ var A=String.fromCharCode(10), f=function(sh){
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying float vAlto;').replace('#include <begin_vertex>','#include <begin_vertex>'+A+'vAlto=position.y;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying float vAlto;').replace('#include <color_fragment>','#include <color_fragment>'+A+'diffuseColor.rgb*=mix(0.6,1.0,smoothstep(0.0,0.5,vAlto));'); };
  mat.onBeforeCompile=mattoni&&RM.VESTE?function(sh){ f(sh); vesteMuri(sh); }:f; return mat; }      // due testi diversi: three riconosce i programmi dal testo di onBeforeCompile
/* Veste del PC (24 novembre 2026): una parte delle insulae ha la facciata di mattoni a vista, come a Ostia, dove le cortine laterizie dei caseggiati restavano per lo più senza intonaco;
   le altre sono intonacate nelle tinte di prima. Quante fossero a Roma, e dove, non si sa: qui circa due su cinque, a caso. Il tipo si sceglie dal posto dell'istanza, non da rnd. */
function hashIstanza(sh){ var A=String.fromCharCode(10);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+A+'varying float vHi; varying vec2 vUvR;').replace('#include <begin_vertex>',['#include <begin_vertex>','vUvR=uv; vHi=0.5;',
    '#ifdef USE_INSTANCING','vHi=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);','#endif'].join(A));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+A+'varying float vHi; varying vec2 vUvR; uniform float uVeste;');
  sh.uniforms.uVeste=RM.vesteU; }
function vesteMuri(sh){ hashIstanza(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
    'if(uVeste>0.5 && vHi<0.42){ float lm=dot(diffuseColor.rgb,vec3(0.3,0.59,0.11)); vec3 mt=vec3(0.62,0.33,0.2)*(0.82+0.36*fract(vHi*17.3));',      // cortina di mattoni: le finestre (scure) restano scure
    '  diffuseColor.rgb=mt*smoothstep(0.02,0.5,lm)*1.15; }'].join(String.fromCharCode(10))); }
/* tetti con la veste: il coppo meno arancione e più cotto; da un tetto all'altro tinte diverse (nuovo, bruno, sbiadito dal sole, ingrigito dai licheni) e la gronda più sporca */
function vesteTetti(mat){ if(!RM.VESTE) return mat; mat.onBeforeCompile=function(sh){ hashIstanza(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
    'if(uVeste>0.5){ vec3 c=diffuseColor.rgb; float l=dot(c,vec3(0.3,0.59,0.11)); c=mix(vec3(l),c,0.78); float h=vHi;',
    '  c*=h<0.38?vec3(1.0,0.9,0.86):h<0.62?vec3(0.78,0.68,0.62):h<0.84?vec3(1.04,0.97,0.93):vec3(0.86,0.83,0.8);',
    '  if(h>0.84) c=mix(c,vec3(dot(c,vec3(0.33))),0.38);',
    '  c*=(0.86+0.24*fract(h*13.7))*(1.0-0.16*smoothstep(0.35,0.0,vUvR.y));',
    '  diffuseColor.rgb=c; }'].join(String.fromCharCode(10))); }; return mat; }
vesteTetti(matTetti);
appoggio(matMuri,true);
var matBasse=appoggio(new THREE.MeshStandardMaterial({map:texBasse,roughness:.95,side:THREE.DoubleSide,emissive:new THREE.Color(0xffffff),emissiveMap:texLumiB,emissiveIntensity:0}));
var matDomus=appoggio(new THREE.MeshStandardMaterial({map:texDomus,roughness:.95,side:THREE.DoubleSide}));
var matGiardino=new THREE.MeshStandardMaterial({color:RM.col(0x7f9a56),roughness:1}), matVasca=new THREE.MeshStandardMaterial({color:RM.col(0x6d9aa0),roughness:.3}), matColonne=new THREE.MeshStandardMaterial({color:RM.col(0xece4d2),roughness:.9,side:THREE.DoubleSide});
function istanze(geo,mat,quante){ var m=new THREE.InstancedMesh(geo,mat,quante); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.castShadow=m.receiveShadow=true; m.frustumCulled=false; m.userData.gruppo='citta'; RM.scene.add(m); return m; }
/* Pacco di istanze compattato: le istanze a scala zero (case sparite, rovine non ancora nate) non vengono inviate alla scheda grafica.
   Si scrive per indice come su una InstancedMesh; stringi() ricopia in testa solo quelle vive e aggiorna il conteggio. */
function pacco(geo,mat,quante,conDeg){
  var m=istanze(geo,mat,quante), M=new Float32Array(quante*16), C=new Float32Array(quante*3), vivo=new Uint8Array(quante), G=conDeg?new Float32Array(quante*4):null, aG=null;
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(quante*3),3); m.instanceColor.setUsage(THREE.DynamicDrawUsage); m.count=0;
  if(G){ aG=new THREE.InstancedBufferAttribute(new Float32Array(quante*4),4); aG.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aDeg',aG); }      // il degrado di ogni istanza (si veda CASA_V): ogni geometria appartiene a un solo pacco
  return { maglia:m,
    setMatrixAt:function(i,mat){ var e=mat.elements, o=i*16; for(var j=0;j<16;j++) M[o+j]=e[j]; vivo[i]=(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])>1e-10?1:0; },
    setColorAt:function(i,c){ C[i*3]=c.r; C[i*3+1]=c.g; C[i*3+2]=c.b; },
    setDegAt:function(i,x,y,z,w){ G[i*4]=x; G[i*4+1]=y; G[i*4+2]=z; G[i*4+3]=w; },
    stringi:function(){ var k=0, a=m.instanceMatrix.array, ca=m.instanceColor.array, ga=aG?aG.array:null, i, j, o, t;
      for(i=0;i<quante;i++) if(vivo[i]){ o=i*16; t=k*16; for(j=0;j<16;j++) a[t+j]=M[o+j]; ca[k*3]=C[i*3]; ca[k*3+1]=C[i*3+1]; ca[k*3+2]=C[i*3+2]; if(ga){ for(j=0;j<4;j++) ga[k*4+j]=G[i*4+j]; } k++; }
      m.count=k; m.instanceMatrix.needsUpdate=true; m.instanceColor.needsUpdate=true; if(aG) aG.needsUpdate=true; } };
}
/* ---------- case abbandonate: il degrado per istanza (26 novembre 2026) ----------
   Le case sono centinaia di migliaia di triangoli in poche maglie a istanze: il degrado non può stare in materiali diversi. Ogni istanza porta quattro numeri (aDeg):
   x, lo stadio 1 (0-1: intonaco che cade, coppi che mancano, finestre buie, crepe, erba); y, lo stadio 2 (0-1: il tetto sfonda); z, la quota dove i muri sono spezzati,
   in frazioni dell'altezza della casa (1: interi); w, un numero del posto, perché due case vicine non si guastino uguali. Per una casa abitata x è zero e lo shader non fa nulla.
   Le idee vengono dallo shader dei monumenti (DEGRADO, orditura e taglio in js/costruttore.js): chiazze d'intonaco caduto con sotto il mattone, prese dalla trama delle macchie
   della veste (ferma da lontano); sotto i coppi caduti l'orditura di legno, listelli, travicelli e arcarecci, che regge più a lungo nel mezzo delle chiazze vecchie;
   il taglio dei muri «a tronconi», per piani interi (un rumore a tre gradini) con l'orlo frastagliato. Lo stesso taglio vale per l'ombra (CASA_OMBRA).
   In «bassa» e sul «telefono» (RM.QUALITA.degradoCase 0) restano colore, finestre buie, tetti bucati e muri spezzati: niente intonaco, crepe ed erba disegnati. */
RM.QUALITA.degradoCase=[0,1,1,1,0];      // bassa, media, alta, massima, telefono
var uDegC={value:RM.QUALITA.degradoCase[RM.q]||0}, NLc=String.fromCharCode(10), TEXC=!!RM.VESTE;
var CASA_RUM=['float cH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }',
  'vec2 cH2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }',
  'float cN(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(cH(i),cH(i+vec3(1.0,0.0,0.0)),f.x),mix(cH(i+vec3(0.0,1.0,0.0)),cH(i+vec3(1.0,1.0,0.0)),f.x),f.y),mix(mix(cH(i+vec3(0.0,0.0,1.0)),cH(i+vec3(1.0,0.0,1.0)),f.x),mix(cH(i+vec3(0.0,1.0,1.0)),cH(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z); }',
  'float cTaglio(){ float hT=vDeg.z; if(hT>0.999) return 9.0; float A=min(0.42,(1.0-hT)*1.2); float q1=floor(cN(vec3(vLC.xz*0.55+vDeg.w*17.0,1.0))*3.0)*0.5; float q2=cN(vec3(vLC.xz*2.6+vDeg.w*5.0,2.0)); return hT+A*(q1-0.5)+0.25*A*(q2-0.5); }',      // piani interi che cadono (tre gradini) e l'orlo spezzato
  'float cBuco(){ return vDeg.x*0.3+vDeg.y*1.9-(0.5+1.35*(0.6*cN(vec3(vLC.xz*1.1+vDeg.w*9.0,2.0))+0.4*cN(vec3(vLC.xz*4.3,2.5))-0.5)); }'].join(NLc);      // coppi caduti: positivo dentro la chiazza
var CASA_VD='attribute vec4 aDeg; varying vec4 vDeg; varying vec3 vLC; varying vec3 vNC; varying float vYC;';
var CASA_V=['vDeg=aDeg; vYC=position.y; vec3 scC=vec3(1.0);','#ifdef USE_INSTANCING','scC=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));','#endif',
  'vLC=position*scC; vNC=normal/max(scC,vec3(0.0001));'].join(NLc);      // in unità della scena, nell'orientamento della casa
function vertCasa(sh){ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>'+NLc+CASA_VD).replace('#include <begin_vertex>','#include <begin_vertex>'+NLc+CASA_V); }
var CASA_FD=['varying vec4 vDeg; varying vec3 vLC; varying vec3 vNC; varying float vYC; uniform float uDegC;',TEXC?'#define CASA_TEX'+NLc+'uniform sampler2D tMacC;':'',CASA_RUM].join(NLc);
var CASA_STR='float cStr(float x,float p,float w){ float f=max(fwidth(x),0.00001)/p; float y0=x/p+0.5*w/p-0.5*f; float y1=y0+f; float k=w/p; return clamp((floor(y1)*k+min(fract(y1),k)-floor(y0)*k-min(fract(y0),k))/f,0.0,1.0); }';
var CASA_TETTO=[
  '  float dC=cBuco(); float orC=1.0-smoothstep(0.0,0.03,-dC);',
  '  if(dC>0.0){ vec3 nT=normalize(vNC); vec3 rT=cross(nT,vec3(0.0,1.0,0.0)); float lT=length(rT); rT=lT>0.2?rT/lT:vec3(1.0,0.0,0.0); vec3 sT=normalize(cross(rT,nT));',      // rT lungo il colmo, sT lungo la pendenza
  '    float uT=dot(vLC,rT); float wT=dot(vLC,sT); float hR=cH(vec3(floor(uT/0.12),floor(wT/0.4),5.0)); float hA=cH(vec3(floor(wT/0.4),9.0,5.0));',
  '    float vL=step(dC,0.035); float vR=step(dC,0.08+0.14*hR); float vA=step(dC,0.16+0.2*hA); if(vL+vR+vA<0.5) discard;',      // listelli, travicelli, arcarecci; nel mezzo il vuoto
  '    float cLg=max(cStr(wT,0.4,0.05)*vA,max(cStr(uT,0.12,0.03)*vR,cStr(wT,0.045,0.016)*vL)); float kV=step(0.015,max(fwidth(uT),fwidth(wT))); if(kV<0.5 && cLg<0.5) discard;',
  '    cLeg=1.0; cLegC=mix(vec3(0.03,0.026,0.022),vec3(0.2,0.135,0.085)*(0.8+0.35*hR)*(1.0-0.3*s1),kV<0.5?1.0:cLg); }',
  '  diffuseColor.rgb*=1.0-0.3*orC; float lT2=dot(diffuseColor.rgb,vec3(0.3,0.59,0.11)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(lT2)*vec3(0.86,0.85,0.78),0.45*s1)*(1.0-0.18*s1);',      // coppi smossi sull'orlo; scoloriti e anneriti
  '  #ifdef CASA_TEX',
  '  if(uDegC>0.5){ vec4 mT=texture2D(tMacC,vLC.xz/0.7+vDeg.w*2.1); float gT=smoothstep(0.7,0.8,mT.r+0.08*s1+0.08*s2)*min(1.0,s1*2.0);',      // ciuffi d'erba sui coppi, piccoli e radi (chiazze larghe facevano la tuta mimetica)
  '    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.62,0.7,0.5),gT*0.7); }',
  '  #endif',
  '  if(cLeg>0.5) diffuseColor.rgb=cLegC;'].join(NLc);
var CASA_MURO=[
  '  vec3 nA=abs(normalize(vNC)); vec2 cA=nA.x>nA.z?vec2(vLC.z,vLC.y):vec2(vLC.x,vLC.y);',
  '  float lu=dot(diffuseColor.rgb,vec3(0.3,0.59,0.11)); float fin=(1.0-smoothstep(0.1,0.2,lu))*step(nA.y,0.5);',      // finestre, porte e botteghe: scure nella trama
  '  float intC=clamp(s1*0.8+s2*0.7,0.0,1.0);',
  '  diffuseColor.rgb*=mix(1.0,0.28,fin*min(1.0,s1*4.0))*(1.0-0.14*s1);',      // finestre vuote e buie (imposte e infissi portati via); sporco
  '  if(!gl_FrontFacing) diffuseColor.rgb=mix(diffuseColor.rgb*0.55,vec3(0.34,0.24,0.17),0.6*intC);',      // dentro: muri spogli, dove il tetto e i piani alti sono caduti
  '  #ifdef CASA_TEX',
  '  else if(uDegC>0.5){ vec4 mA=texture2D(tMacC,cA/2.4+vDeg.w*3.7); vec4 mB=texture2D(tMacC,cA/0.8+vDeg.w*1.3);',
  '    float fwA=max(fwidth(cA.x),fwidth(cA.y))+0.0001; float kF=1.0-smoothstep(0.006,0.025,fwA);',      // dettagli fini solo da vicino
  '    float nI=0.62*mA.g+0.38*mB.b; float eI=fwidth(nI)+0.006; float tI=0.86-0.52*intC;',
  '    float cI=smoothstep(tI-eI,tI+eI,nI)*(1.0-fin); float bI=(1.0-smoothstep(0.0,0.02+eI,tI-nI))*step(nI,tI)*(1.0-fin);',      // intonaco caduto e il suo orlo
  '    vec3 mI=mix(vec3(0.6,0.35,0.23),vec3(0.64,0.55,0.4),smoothstep(0.55,0.7,mA.r))*(0.74+0.3*mB.r);',      // mattone, a tratti tufo
  '    if(kF>0.0) mI*=1.0-0.2*kF*smoothstep(0.35,0.5,abs(fract(vLC.y*28.0)-0.5));',      // filari, da vicino
  '    diffuseColor.rgb=mix(diffuseColor.rgb,mI,cI*0.92*step(0.001,intC)); diffuseColor.rgb*=1.0-0.2*bI*smoothstep(0.0,0.2,intC);',
  '    float cU=smoothstep(0.55,0.75,texture2D(tMacC,vec2(cA.x/0.5,vLC.y/5.0)+0.53).b); diffuseColor.rgb*=1.0-0.3*cU*s1*smoothstep(0.3,1.0,vYC);',      // colature sotto la gronda
  '    if(kF>0.0 && s1>0.3){ vec2 pC=vec2(cA.x*2.2,cA.y*0.8)+vDeg.w*31.0; vec2 nC=floor(pC); vec2 fC=fract(pC); float d1=8.0; float d2=8.0;',      // crepe lunghe, quasi verticali
  '      for(int j=-1;j<=1;j++){ for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); float d=length(g+cH2(nC+g)-fC); if(d<d1){ d2=d1; d1=d; } else if(d<d2){ d2=d; } } }',
  '      float lC=(1.0-smoothstep(0.012,0.03,d2-d1))*smoothstep(0.5,0.7,mA.b)*kF; diffuseColor.rgb*=1.0-0.6*lC*min(1.0,(s1-0.3)*2.0); }',
  '    float gP=1.0-smoothstep(0.0,0.05,vLC.y-0.15-(0.05+0.12*mA.r)*s1); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.2,0.24,0.11)*(0.8+0.4*mB.g),gP*min(1.0,s1*2.0)*0.85); }',      // erba al piede dei muri (la base della casa sta 1,5 m sotto il suolo)
  '  #endif'].join(NLc);
var CASA_ALTRO={
  corte:'  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.3,0.32,0.17)*(0.75+0.45*cN(vec3(vLC.xz*3.0,4.0))),min(1.0,s1*1.5)*0.8);',      // cortili e pavimenti: erba e terra
  giardino:'  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.19,0.24,0.11)*(0.8+0.4*cN(vec3(vLC.xz*4.0,5.0))),min(1.0,s1*1.5));',      // il giardino del peristilio inselvatichito
  vasca:'  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.24,0.25,0.16),min(1.0,s1*3.0));',      // la vasca dell'atrio, asciutta e piena di foglie e terra
  colonna:'  diffuseColor.rgb*=1.0-0.25*s1;'};
function degradaCasa(mat,tipo){
  var prima=mat.onBeforeCompile, sua=mat.hasOwnProperty('onBeforeCompile');
  mat.onBeforeCompile=function(sh,r){ if(sua) prima.call(mat,sh,r);
    vertCasa(sh); sh.uniforms.uDegC=uDegC; if(TEXC) sh.uniforms.tMacC={value:RM.trameVeste().macchie};
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+NLc+CASA_FD+(tipo==='tetto'||tipo==='muro'?NLc+CASA_STR:''))
      .replace('#include <alphamap_fragment>',['float cLeg=0.0; vec3 cLegC=vec3(0.0);','if(vDeg.x>0.0){ float s1=vDeg.x; float s2=vDeg.y;','  if(vYC>cTaglio()) discard;',
        tipo==='tetto'?CASA_TETTO:tipo==='muro'?CASA_MURO:CASA_ALTRO[tipo],'}','#include <alphamap_fragment>'].join(NLc))
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>'+NLc+'totalEmissiveRadiance*=1.0-step(0.0005,vDeg.x);'); };      // nelle case lasciate niente lumi la notte
  mat.userData.chiaveCasa='casa|'+tipo+'|'+(sua?prima.toString():'');
  return mat; }
/* l'ombra: gli stessi tagli (muri spezzati, coppi caduti oltre le travi); nella maglia le falde si riconoscono dalla normale inclinata */
var CASA_OMBRA=['if(vDeg.x>0.0){ if(vYC>cTaglio()) discard; vec3 nT=normalize(vNC);',
  '  if(abs(nT.y)>0.25 && abs(nT.y)<0.97 && vYC>0.55){ float dC=cBuco(); if(dC>0.0){ vec3 rT=cross(nT,vec3(0.0,1.0,0.0)); float lT=length(rT); rT=lT>0.2?rT/lT:vec3(1.0,0.0,0.0); vec3 sT=normalize(cross(rT,nT));',
  '    float uT=dot(vLC,rT); float wT=dot(vLC,sT); float hR=cH(vec3(floor(uT/0.12),floor(wT/0.4),5.0)); float hA=cH(vec3(floor(wT/0.4),9.0,5.0));',
  '    float vL=step(dC,0.035); float vR=step(dC,0.08+0.14*hR); float vA=step(dC,0.16+0.2*hA);',
  '    if(abs(fract(wT/0.045+0.5)-0.5)*0.045>0.008*vL && abs(fract(uT/0.12+0.5)-0.5)*0.12>0.015*vR && abs(fract(wT/0.4+0.5)-0.5)*0.4>0.025*vA) discard; } } }'].join(NLc);
function ombraCasa(){ var m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){ vertCasa(sh); sh.uniforms.uDegC=uDegC; if(TEXC) sh.uniforms.tMacC={value:RM.trameVeste().macchie};
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+NLc+CASA_FD).replace('#include <clipping_planes_fragment>',CASA_OMBRA+NLc+'#include <clipping_planes_fragment>'); };
  return m; }
/* rovine: l'edera sale dal piede dei muri a lingue (x: quanta, w: il posto), e i muri anneriscono (y); macerie: rovi e erba sui cumuli, dove guardano in su (x) */
var RUDERE_F=['if(vDeg.x>0.0){ vec3 nA=abs(normalize(vNC)); vec2 cA=nA.x>nA.z?vec2(vLC.z,vLC.y):vec2(vLC.x,vLC.y);',
  '  float nE=cN(vec3(cA*1.3+vDeg.w*7.0,6.0))*0.7+0.3*cN(vec3(cA*4.0,6.5)); float hE=vDeg.x*(0.12+0.75*nE)+0.15;',
  '  float iv=(1.0-smoothstep(hE-0.05,hE,vLC.y))*smoothstep(0.38,0.5,nE+0.25*vDeg.x);',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.13,0.19,0.08)*(0.75+0.5*cN(vec3(cA*9.0,7.0))),iv*0.9)*(1.0-0.12*vDeg.y); }'].join(NLc);
var MACERIE_F=['if(vDeg.x>0.0){ vec3 nV=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))); float su=clamp((nV*mat3(viewMatrix)).y,0.0,1.0);',
  '  float nM=cN(vec3(vLC*1.6+vDeg.w*11.0)); float gM=smoothstep(0.48,0.64,nM+0.34*vDeg.x+0.12*su-0.3);',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(0.19,0.24,0.11),vec3(0.36,0.34,0.2),cN(vec3(vLC*5.0+3.0)))*(0.8+0.3*su),gM*0.9); }'].join(NLc);
function verdeRovina(mat,corpo,nome){ var prima=mat.onBeforeCompile, sua=mat.hasOwnProperty('onBeforeCompile');
  mat.onBeforeCompile=function(sh,r){ if(sua) prima.call(mat,sh,r); vertCasa(sh); sh.uniforms.uDegC=uDegC; if(TEXC) sh.uniforms.tMacC={value:RM.trameVeste().macchie};
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>'+NLc+CASA_FD).replace('#include <alphamap_fragment>',corpo+NLc+'#include <alphamap_fragment>'); };
  mat.userData.chiaveCasa='rovina|'+nome+'|'+(sua?prima.toString():''); return mat; }
function chiaveCasa(mat){ var k=mat.customProgramCacheKey, sua=mat.hasOwnProperty('customProgramCacheKey'); mat.customProgramCacheKey=function(){ return mat.userData.chiaveCasa+'|'+(sua?k.call(mat):''); }; }
[[matMuri,'muro'],[matBasse,'muro'],[matDomus,'muro'],[matTetti,'tetto'],[matCorte,'corte'],[matGiardino,'giardino'],[matVasca,'vasca'],[matColonne,'colonna']].forEach(function(q){ degradaCasa(q[0],q[1]); });
[matMuri,matTetti,matBasse,matDomus].forEach(function(m){ RM.tingi(m,'C'); });      // «che cosa sappiamo davvero»: le case sono ipotesi
[matMuri,matTetti,matBasse,matDomus,matCorte,matGiardino,matVasca,matColonne].forEach(chiaveCasa);      // un programma per specie di materiale: three li riconosce dal testo di onBeforeCompile, che qui è lo stesso
var conta=[0,0,0,0,0,0]; isolati.forEach(function(b){ b.ti=conta[b.tipo]++; }); RM.contaCase=conta;
var MAT_INS=[matMuri,matTetti,matCorte], MAT_BAS=[matBasse,matTetti,matCorte], MATERIALI=[MAT_INS,MAT_INS,MAT_INS,[matDomus,matTetti,matCorte,matGiardino,matVasca,matColonne],MAT_BAS,MAT_BAS];
FORME[4]=FORME[0].clone(); FORME[5]=FORME[2].clone();      // le case basse prendono una copia delle forme delle insulae: l'attributo del degrado sta sulla geometria, una per pacco
var ombraC=ombraCasa(), vivi=FORME.map(function(g,k){ var p=pacco(g,MATERIALI[k],Math.max(1,conta[k]),true); p.maglia.customDepthMaterial=ombraC; return p; });
var matRuderi=verdeRovina(appoggio(new THREE.MeshStandardMaterial({map:texRudere,roughness:1,side:THREE.DoubleSide})),RUDERE_F,'muri'); RM.tingi(matRuderi,'C'); chiaveCasa(matRuderi);
var ruderi=pacco(geoRudere,matRuderi,N,true);
var tettiRotti=pacco(geoTettoRotto,RM.tingi(new THREE.MeshStandardMaterial({map:texCoppi,roughness:1,side:THREE.DoubleSide}),'C'),N);
var matMacerie=verdeRovina(new THREE.MeshStandardMaterial({roughness:1,side:THREE.DoubleSide,flatShading:true}),MACERIE_F,'macerie'); RM.tingi(matMacerie,'C'); chiaveCasa(matMacerie);
var macerie=pacco(geoMacerie,matMacerie,N,true);
var matMacchia=RM.matPietra(), macchiaD=pacco(macchiaGeo(false,detIncolto),matMacchia,N), macchiaF=pacco(macchiaGeo(true,detIncolto),matMacchia,N); macchiaD.maglia.castShadow=macchiaF.maglia.castShadow=false;
var vigne=pacco(geoVigna,RM.matPietra(),N); vigne.maglia.castShadow=false;
/* Strade nei quartieri vuoti (26 novembre 2026): le vie strette (larghe 9 m nel modello) diventano sentieri, erba ai lati e terra battuta nel mezzo; sulle vie larghe l'erba
   cresce solo ai margini, così il lastricato e le messe in scena restano libere. Un pezzo di nastro ogni 24 m, acceso quando le case attorno (entro 70 m) sono lasciate da
   qualche decennio; niente vicino ai monumenti. Quanto in fretta l'erba prenda le vie è un'ipotesi; che le vie si coprissero d'erba e di macerie non lo misura nessuna fonte letta. */
RM.QUALITA.vieErba=[0,1,1,1,1];      // bassa, media, alta, massima, telefono
var texSentiero=RM.tela(32,64,function(g,W,H){ g.fillStyle='#7f8553'; g.fillRect(0,0,W,H);
  for(var i=0;i<90;i++){ g.fillStyle=['rgba(60,80,40,.5)','rgba(160,150,100,.45)','rgba(95,105,60,.5)'][(rf()*3)|0]; g.fillRect(rf()*W,rf()*H,2+rf()*3,3+rf()*6); }
  for(var y=0;y<H;y+=2){ var c=16+4*Math.sin(y*.11), w=4+1.5*Math.sin(y*.37+1); g.fillStyle='#a1937a'; g.fillRect(c-w,y,2*w,2); }      // la traccia battuta, un po' storta
  for(i=0;i<25;i++){ g.fillStyle='rgba(130,120,95,.6)'; g.fillRect(10+rf()*12,rf()*H,1+rf()*2,1+rf()*2); } });
var texCiglio=RM.tela(32,64,function(g,W,H){ g.clearRect(0,0,W,H);
  for(var y=0;y<H;y+=2){ var a=4+2.5*Math.sin(y*.29)+1.5*Math.sin(y*.83+2), b2=4+2.5*Math.sin(y*.23+1)+1.5*Math.sin(y*.71); g.fillStyle='#7c8450'; g.fillRect(0,y,a,2); g.fillRect(W-b2,y,b2,2); }
  for(var i=0;i<60;i++){ g.fillStyle='rgba(55,75,38,.7)'; g.fillRect(rf()<.5?rf()*5:W-rf()*5,rf()*H,2,3); } });
var VIE_ERBA=[], vieMin=null, vieMag=null;
(function(){ var griglia={}, Q=8; isolati.forEach(function(b,i){ var k=Math.floor(b.x/Q)+','+Math.floor(b.z/Q); (griglia[k]||(griglia[k]=[])).push(i); });
  RM.STRADE.forEach(function(s,iv){ var lw=((window.RM_TOPO||{}).stradeLarghe||[])[iv]||.6, resto=0, passo=2.4;
    for(var k=0;k<s.length-1;k++){ var a=s[k], e=s[k+1], L=Math.hypot(e[0]-a[0],e[1]-a[1]), t; if(L<.01) continue; var dx=(e[0]-a[0])/L, dz=(e[1]-a[1])/L;
      for(t=resto;t<L;t+=passo){ var x=a[0]+dx*t, z=a[1]+dz*t, vic=[], gx=Math.floor(x/Q), gz=Math.floor(z/Q), i, j, n;
        for(i=-1;i<=1;i++) for(j=-1;j<=1;j++) (griglia[(gx+i)+','+(gz+j)]||[]).forEach(function(n){ var b=isolati[n]; if(!b.nasce && Math.hypot(b.x-x,b.z-z)<7) vic.push(n); });
        if(vic.length<2) continue;
        var vicino=false; for(n=0;n<RM.zone.length;n++){ var q=RM.zone[n]; if(!(q.dal>0) && RM.dZona(q,x,z)<q.r+(q.a?q.t||0:0)+1.5){ vicino=true; break; } }      // niente erba davanti agli ingressi dei monumenti
        if(vicino) continue;
        var hq=RM.hSuolo||RM.h, y=Math.max(hq(x-dz*lw,z+dx*lw),hq(x+dz*lw,z-dx*lw),hq(x,z))+.115;
        VIE_ERBA.push({x:x,z:z,y:y,ry:Math.atan2(dx,dz),lw:lw,minore:lw<.5,vic:vic,g:RM.grana(Math.round(x*3.3),Math.round(z*2.9)),q0:-1}); }
      resto=t-L; } });
  var geo=new THREE.PlaneGeometry(1,1); geo.rotateX(-Math.PI/2);
  function mat(tex){ return new THREE.MeshStandardMaterial({map:tex,roughness:1,alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}); }
  var nMin=VIE_ERBA.filter(function(p){ return p.minore; }).length;
  vieMin=pacco(geo,mat(texSentiero),Math.max(1,nMin)); vieMag=pacco(geo.clone(),mat(texCiglio),Math.max(1,VIE_ERBA.length-nMin)); vieMin.maglia.castShadow=vieMag.maglia.castShadow=false;
  var a1=0, a2=0; VIE_ERBA.forEach(function(p){ p.k=p.minore?a1++:a2++; });
})();
function aggiornaVie(){ var on=RM.QUALITA.vieErba[RM.q]?1:0, mosso=false;
  VIE_ERBA.forEach(function(p){ var g=0; p.vic.forEach(function(n){ g+=isolati[n].gv||0; }); g=on*g/p.vic.length; var acceso=g>(p.minore?.5:.4)+.15*p.g?1:0;
    if(acceso===p.q0) return; p.q0=acceso; mosso=true; var P=p.minore?vieMin:vieMag;
    d.position.set(p.x,p.y,p.z); d.rotation.set(0,p.ry,0); d.scale.set(acceso?p.lw*2.04:0,1,acceso?2.6:0); d.updateMatrix(); P.setMatrixAt(p.k,d.matrix); P.setColorAt(p.k,c.copy(bianco).multiplyScalar(.85+.3*p.g)); });
  if(mosso){ vieMin.stringi(); vieMag.stringi(); } }
if(RM.qualita) RM.qualita.quando(function(){ aggiornaVie(); });
/* L'atrio di San Paolo prima di Adriano I: «antea nimis desolatum existebat, ubi boves atque caballi ingrediebantur ad pabulandum propter herbam quae ibidem nascebatur»
   (Liber Pontificalis, vita di Adriano I, c. XLVII; Duchesne I, p. 499); il papa lo fa lastricare di marmo. Quando cominciasse l'abbandono la fonte non lo dice: qui dal 715
   (sotto Gregorio II i monasteri di San Paolo sono «ad solitudinem deducta», stessa raccolta) fino al 771, prima del pontificato di Adriano (772-795), perché l'anno
   del lastricato non si sa. Erba nel quadriportico, due buoi e due cavalli; forme indicative. L'atrio sta dove lo mette js/monumenti.js (basilica a +x, ry 2,98). */
(function(){ var cx=-70.1, cz=375.7, ry=2.98, lx=8.65, X=cx+lx*Math.cos(ry), Z=cz-lx*Math.sin(ry), B=new RM.Costruttore(), BUE=RM.col(0xc9c1b0), CAV=RM.col(0x6a4a33), ERBA=RM.col(0x6c7a40), SECCO=RM.col(0x8f8a58);
  B.geo(new THREE.PlaneGeometry(4.3,4.3,1,1).rotateX(-Math.PI/2).translate(0,.025,0),ERBA);
  [[-1.4,-1.2],[1.2,-1.5],[-1.6,1.3],[.4,1.7],[1.7,.6],[-.3,-.2]].forEach(function(p,i){ B.geo(new THREE.SphereGeometry(1,5,2,0,6.283,0,1.6).scale(.25+.08*(i%3),.05+.02*(i%2),.2).translate(p[0],.02,p[1]),i%2?SECCO:ERBA); });
  function bestia(x,z,a,col,cav){ var g=[], L=cav?.2:.22, H=cav?.15:.13;      // corpo, quattro zampe, collo e testa
    g.push(new THREE.BoxGeometry(L,.09,.08).translate(0,H,0));
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(q){ g.push(new THREE.BoxGeometry(.018,H-.03,.018).translate(q[0]*L*.4,(H-.03)/2,q[1]*.028)); });
    g.push(cav?new THREE.BoxGeometry(.05,.1,.04).rotateZ(-.6).translate(L*.55,H+.07,0):new THREE.BoxGeometry(.06,.05,.05).translate(L*.56,H-.01,0));
    g.push(new THREE.BoxGeometry(.07,.035,.035).rotateZ(cav?.9:.5).translate(L*(cav?.72:.66),cav?H+.07:H-.05,0));      // la testa: il bue la tiene bassa sull'erba
    g.forEach(function(q){ B.geo(q.rotateY(a).translate(x,.025,z),col); }); }
  bestia(-.8,.6,.4,BUE,false); bestia(-.3,1.0,.1,BUE,false); bestia(1.1,-.7,2.3,CAV,true); bestia(.6,-1.3,1.9,CAV,true);
  var m=new THREE.Mesh(B.geometria(),RM.matPietra()); m.position.set(X,RM.h(X,Z)+.05,Z); m.rotation.y=ry; m.castShadow=m.receiveShadow=true; m.visible=false; m.userData.gruppo='citta'; RM.scene.add(m);
  RM.moduli.push(function(anno){ m.visible=anno>=715 && anno<772; });
})();
/* L'orto della diaconia di Santa Maria «in capo de portico», nel Borgo, verso il Tevere (diploma di Leone IV, 847-855, citato da Duchesne): le case del Borgo non si
   lasciano, quindi l'orto ha un posto suo, libero, fra la testa del portico di San Pietro e il fiume; dal 847. Posto e misura sono una scelta del modello. */
(function(){ var best=null, k, x, z;
  for(k=0;k<400 && !best;k++){ var r=k*.08, a=k*2.4; x=-186+r*Math.cos(a); z=-99+r*Math.sin(a);
    if([[0,0],[2.6,1.8],[-2.6,1.8],[2.6,-1.8],[-2.6,-1.8]].every(function(p){ return libero(x+p[0],z+p[1],.8)===1; }) && isolati.every(function(b){ return Math.hypot(b.x-x,b.z-z)>6; })) best=[x,z]; }
  if(!best) return; RM.ortoBorgo=best;
  var g=new THREE.PlaneGeometry(5,3.4); g.rotateX(-Math.PI/2);
  var m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:texOrto,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.position.set(best[0],(RM.hSuolo||RM.h)(best[0],best[1])+.06,best[1]); m.receiveShadow=true; m.visible=false; m.userData.gruppo='citta'; RM.scene.add(m);
  RM.moduli.push(function(anno){ m.visible=anno>=847; });
})();
if(RM.qualita) RM.qualita.quando(function(g){ var d=RM.QUALITA.incolto[g]||0; uDegC.value=RM.QUALITA.degradoCase[g]||0; if(d===detIncolto) return; detIncolto=d;      // al cambio di gradino cambia solo la forma delle macchie
  [[macchiaD,false],[macchiaF,true]].forEach(function(q){ var v=q[0].maglia.geometry; q[0].maglia.geometry=macchiaGeo(q[1],d); v.dispose(); }); });
var geoPiano=new THREE.PlaneGeometry(1,1); geoPiano.rotateX(-Math.PI/2);
var incolti=pacco(geoPiano,new THREE.MeshStandardMaterial({map:texIncolto,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),N); incolti.maglia.castShadow=false;
/* Veste del PC: l'incolto non è più un quadrato col bordo netto (da lontano erano «macchie a spicchi»): sfuma nel suolo con un orlo irregolare, e prende il verde dell'erba nuova */
if(RM.VESTE){ var trasparenteIncolti=function(){ var si=RM.vesteU.value>.5, m=incolti.maglia.material; m.transparent=si; m.depthWrite=!si; };      // in «bassa» (veste spenta) resta opaco come prima
  trasparenteIncolti(); if(RM.qualita) RM.qualita.quando(trasparenteIncolti); incolti.maglia.material.onBeforeCompile=function(sh){ hashIstanza(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
    'if(uVeste>0.5){ vec2 bq=min(vUvR,1.0-vUvR); float orlo=min(bq.x,bq.y)+(texture2D(map,vUvR*0.37+vHi).g-0.5)*0.22;',
    '  diffuseColor.a*=smoothstep(0.0,0.2,orlo); diffuseColor.rgb*=vec3(0.95,0.96,0.9); }'].join(String.fromCharCode(10))); }; }
var geoOrto=new THREE.PlaneGeometry(1,1); geoOrto.rotateX(-Math.PI/2);
var orti=pacco(geoOrto,new THREE.MeshStandardMaterial({map:texOrto,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),N); orti.maglia.castShadow=false;

/* Alberi. Rifatti il 24 novembre 2026 (l'utente: «L'erba inesistente… Puoi fare molto di meglio»): prima erano un cono e una palla schiacciata, due sole specie.
   Ora cinque specie della campagna e dei giardini di Roma antica, tutte già presenti allora (nessuna pianta venuta dopo, come il platano d'Oriente nei viali o le palme):
   il pino a ombrello (Pinus pinea) e il cipresso negli horti e attorno alle tombe; l'ulivo e il leccio negli orti e fra le rovine, dove crescono da sé; il pioppo bianco
   lungo il Tevere. Dal 25 novembre 2026 i numeri a caso degli alberi vengono dal seme della loro casa o del loro giardino (le rive hanno una fila a sé): una casa
   in più o in meno non sposta gli alberi delle altre. La specie si sceglie dal posto, con RM.grana.
   Ogni chioma è un profilo girato con il contorno mosso e il colore che scurisce verso il basso e cambia da un punto all'altro: da lontano legge come un volume d'ombra
   e di luce, non come una palla. Tre dettagli (RM.QUALITA.alberi): 0 i solidi di prima («bassa» e «telefono»), 1 circa cento triangoli per albero, 2 circa trecento
   (chiome a più ciuffi). Forme e proporzioni sono indicative. Dal 24 novembre 2026, sera, valgono anche sui telefoni che reggono «media» e oltre. */
RM.QUALITA.alberi=[0,2,2,2,0];      // bassa, media, alta, massima, telefono; i dettagli 1 e 2 costano uguale sulla Radeon integrata (misura del 24 novembre 2026): da «media» le chiome a ciuffi
var matAlbero=RM.matPietra();
var VERDI=[0x2f4a26,0x4a6330,0x7c8b5e,0x3d5631,0x6e8a4c,0x55743a,0x44602f].map(RM.col), CORTECCIA=RM.col(0x5e4e3e);
function chioma(B,prof,lati,col,seme,irr,x,y,z){                                                    // un profilo girato, col contorno mosso e il colore che scurisce in basso
  var g=new THREE.LatheGeometry(prof.map(function(q){ return new THREE.Vector2(q[0],q[1]); }),lati), p=g.attributes.position, n=p.count, i, y0=1e9, y1=-1e9, c=[];
  for(i=0;i<n;i++){ var px=p.getX(i), py=p.getY(i), pz=p.getZ(i), a=Math.atan2(pz,px), f=1+irr*(.13*Math.sin(a*3+seme)+.08*Math.sin(a*5+seme*2.3)+.06*Math.sin(py*9+seme)); p.setXYZ(i,px*f,py,pz*f); y0=Math.min(y0,py); y1=Math.max(y1,py); }
  g.computeVertexNormals();
  for(i=0;i<n;i++){ var t=(p.getY(i)-y0)/Math.max(.01,y1-y0), a2=Math.atan2(p.getZ(i),p.getX(i)), k=.6+.48*t+.07*Math.sin(a2*7+seme*3+p.getY(i)*13); c.push(col.r*k,col.g*k,col.b*k); }
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); g.translate(x||0,y||0,z||0); return B.geo(g,col);
}
function fusto(B,a,b,r0,r1,lati){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,lati||5,1,true);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); return B.geo(g,CORTECCIA); }
var SPECIE=['cipresso','pino','ulivo','leccio','pioppo','fico','olmo'];      // fico e olmo (26 novembre 2026): gli alberi che crescono da soli sulle rovine nella flora del Colosseo di Deakin (1855), confronto dichiarato
function alberoGeo(sp,det){
  var B=new RM.Costruttore(), V=VERDI[sp], L=det>1?11:8;
  if(det===0){                                                                                        // i solidi di prima
    if(sp===0) return B.cilindro(.06,.3,0,0,0,P.tronco,.06,5).geo(new THREE.ConeGeometry(.3,2.1,7).translate(0,1.3,0),P.chioma).geometria();
    return B.cilindro(.07,1.3,0,0,0,P.tronco,.05,5).geo(new THREE.SphereGeometry(.72,8,5).scale(1,.42,1).translate(0,1.5,0),P.chioma2).geometria(); }
  if(sp===0){ fusto(B,[0,0,0],[0,.3,0],.05,.04); chioma(B,[[0,.18],[.15,.3],[.24,.7],[.24,1.2],[.18,1.7],[.09,2.1],[0,2.36]],det>1?9:7,V,1.3,.45); }      // cipresso: una fiamma stretta
  else if(sp===1){ fusto(B,[0,0,0],[.1,1.38,.04],.065,.04); if(det>1) fusto(B,[.07,1.0,.03],[-.2,1.42,-.06],.03,.02);                                      // pino a ombrello: il fusto nudo e un po' storto, la chioma piatta in cima
    chioma(B,[[0,1.36],[.42,1.4],[.66,1.5],[.7,1.58],[.55,1.68],[.3,1.74],[0,1.77]],L,V,2.1,1,.1,0,.04);
    if(det>1){ chioma(B,[[0,1.34],[.25,1.38],[.33,1.46],[.24,1.55],[0,1.58]],7,V,4.4,1,-.34,0,-.1); chioma(B,[[0,1.4],[.22,1.44],[.3,1.52],[.2,1.6],[0,1.62]],7,V,5.2,1,.4,0,.32); } }
  else if(sp===2){ fusto(B,[0,0,0],[.06,.32,.02],.07,.05); fusto(B,[.06,.32,.02],[-.02,.55,.04],.05,.035);                                                  // ulivo: tronco basso e contorto, chioma grigioverde a ciuffi
    chioma(B,[[0,.42],[.24,.5],[.32,.64],[.26,.78],[0,.84]],7,V,.7,1.2,.1,0,0); chioma(B,[[0,.5],[.2,.56],[.26,.68],[.18,.8],[0,.86]],7,V,3.1,1.2,-.16,0,.08);
    if(det>1) chioma(B,[[0,.48],[.18,.53],[.22,.63],[.16,.72],[0,.76]],6,V,5.5,1.2,.02,0,-.2); }
  else if(sp===3){ fusto(B,[0,0,0],[.02,.6,0],.07,.05); chioma(B,[[0,.48],[.4,.6],[.56,.9],[.5,1.2],[.3,1.38],[0,1.42]],L,V,1.7,1.1);                       // leccio: chioma tonda e scura
    if(det>1){ chioma(B,[[0,.8],[.22,.86],[.3,1.0],[.22,1.14],[0,1.18]],7,V,6.1,1,.42,0,.12); } }
  else if(sp===4){ fusto(B,[0,0,0],[0,.55,0],.055,.04); chioma(B,[[0,.42],[.24,.7],[.33,1.2],[.28,1.7],[.15,2.0],[0,2.12]],L,V,2.7,.8); }                             // pioppo bianco: chioma alta e ovale, più chiara
  else if(sp===5){ fusto(B,[0,0,0],[.1,.34,.03],.055,.035); fusto(B,[0,0,0],[-.09,.3,-.06],.045,.03);                                                                 // fico: più fusti bassi da una ceppaia, chioma larga e bassa, verde chiaro
    chioma(B,[[0,.22],[.36,.28],[.5,.42],[.46,.6],[.26,.72],[0,.75]],L,V,.9,1.2); }
  else { fusto(B,[0,0,0],[.07,.5,.02],.06,.045); fusto(B,[.07,.5,.02],[-.03,.92,.04],.045,.03);                                                                     // olmo campestre: «the trunk mostly crooked» (Deakin), chioma ovale
    chioma(B,[[0,.62],[.3,.74],[.42,1.02],[.38,1.32],[.22,1.52],[0,1.58]],L,V,3.3,1); }
  return B.geometria();
}
var alberi=[[],[]];
isolati.forEach(function(b,i){ var rnd=RM.casuale(b.seme^0x5BD1E995); if(rnd()<(b.fato===2?.4:.24)) alberi[rnd()<(b.orto?.45:0)?0:1].push({x:b.x+(rnd()-.5)*3,z:b.z+(rnd()-.5)*3,s:.7+rnd()*.7,r:rnd()*6.283,b:i}); });   // negli orti, e selvatici fra le rovine
RM.HORTI.forEach(function(h){ var rnd=RM.casuale(semePosto(Math.round(h[0]*10),Math.round(h[1]*10),Math.round(h[2]*10),71)); for(var k=0;k<h[2]*h[2]/9;k++){ var a=rnd()*6.283, r=Math.sqrt(rnd())*h[2]; alberi[rnd()<.4?0:1].push({x:h[0]+r*Math.cos(a),z:h[1]+r*Math.sin(a),s:.8+rnd()*.7,r:rnd()*6.283,b:-1}); } });
(function(){ var rnd=RM.casuale(478); for(var f=0;f<260;f++){ var t=rnd(), pf=RM.curvaFiume.getPoint(.12+t*.76), lato=rnd()<.5?-1:1, tg=RM.curvaFiume.getTangent(.12+t*.76); alberi[1].push({x:pf.x-tg.z*lato*(9+rnd()*4),z:pf.z+tg.x*lato*(9+rnd()*4),s:.6+rnd()*.5,r:rnd()*6.283,b:-2}); } })();   // rive: una fila a sé, che dipende solo dal fiume
/* dalle due liste di prima alle sette specie, per posto: lungo il fiume pioppi; negli horti pini e lecci; negli orti ulivi, pini e lecci; fra le rovine fichi e olmi
   (fino al 25 novembre 2026 lecci e pini: ma sui muri di Roma gli alberi autoctoni come il leccio sono sempre stati scarsi, Celesti-Grapow e Ricotta 2021) */
alberi=(function(){ var L=[alberi[0],[],[],[],[],[],[]];
  alberi[1].forEach(function(a){ var g=RM.grana(Math.floor(a.x*3.1),Math.floor(a.z*2.7)), sp;
    if(a.b===-2) sp=4; else if(a.b===-1) sp=g<.62?1:3; else if(isolati[a.b].orto) sp=g<.5?2:g<.72?1:3; else sp=g<.55?5:6;
    L[sp].push(a); });
  return L; })();
var detAlberi=RM.QUALITA.alberi[RM.q]||0;
var magliaAlberi=alberi.map(function(l,k){ return istanze(alberoGeo(k,detAlberi),matAlbero,Math.max(1,l.length)); });
alberi.forEach(function(l){ l.forEach(function(a){ a.y=RM.h(a.x,a.z); a.q0=-1; }); });
if(RM.qualita) RM.qualita.quando(function(g){ var d=RM.QUALITA.alberi[g]||0; if(d===detAlberi) return; detAlberi=d;      // al cambio di gradino si cambia solo la forma: posizioni e scale restano
  magliaAlberi.forEach(function(m,k){ var vecchia=m.geometry; m.geometry=alberoGeo(k,d); vecchia.dispose(); }); });
magliaAlberi.forEach(function(m,k){ m.count=alberi[k].length; });      // una specie senza alberi non deve lasciare un'istanza nell'origine
/* Canneti lungo il Tevere (24 novembre 2026): ciuffi di canne (Arundo donax e cannuccia di palude) sulle due rive, ogni trenta metri circa, fuori dal tratto urbano
   sempre; dentro le mura, dove le rive erano banchine e approdi, crescono solo con l'abbandono, dal VI secolo (scelta del modello). Ogni ciuffo sono tre fusti conici
   di altezze diverse, giallo-verdi; da vicino, a duecento metri, si legge come una macchia di canne, non come singoli steli. Mancano in «bassa» e nel gradino «telefono». */
RM.QUALITA.canne=[0,1,1,1,0];      // bassa, media, alta, massima, telefono
var canne=null, listaCanne=[];
{      // dal 24 novembre 2026, sera, anche sui telefoni (spente finché il gradino non arriva a «media»)
  (function(){ var B=new RM.Costruttore(), CANNA=RM.col(0x9a9a5c), CANNA2=RM.col(0x7d8a4e);
    [[0,0,.26,.05,CANNA],[.05,.03,.2,.04,CANNA2],[-.04,.04,.17,.035,CANNA]].forEach(function(q){ B.geo(new THREE.ConeGeometry(q[3],q[2],5,1,true).translate(q[0],q[2]/2,q[1]),q[4]); });
    var L=RM.curvaFiume.getLength(), n=Math.round(L/3), k, s;
    for(k=0;k<n;k++) for(s=-1;s<=1;s+=2){ var u=(k+.5*(s+1)*.5)/n, p=RM.curvaFiume.getPointAt(u), tg=RM.curvaFiume.getTangentAt(u), g=RM.grana(k,s+7), off=5.6, hq=RM.hSuolo||RM.h;
      if(g<.25) continue;                                                                                                   // qualche tratto di riva nuda
      while(off<10 && hq(p.x-tg.z*s*off,p.z+tg.x*s*off)<-.42) off+=.3; off+=.2+.5*g;                                      // dove la riva esce dall'acqua (il letto è scavato nel terreno)
      var x=p.x-tg.z*s*off, z=p.z+tg.x*s*off; listaCanne.push({x:x,z:z,y:(RM.hSuolo||RM.h)(x,z)-.02,s:.8+.6*RM.grana(k+11,s),r:g*20,dentro:RM.dentroMura(x,z)}); }
    canne=istanze(B.geometria(),RM.matPietra(),Math.max(1,listaCanne.length)); canne.castShadow=false; canne.count=0; canne.visible=false; })();
  var annoCanne=235, aggCanne=function(anno){ annoCanne=anno;
    var q=RM.QUALITA.canne[RM.q]?1:0, cresce=RM.sfuma(500,650,anno), i=0;
    listaCanne.forEach(function(c){ var v=q*(c.dentro?cresce:1); if(v<.05) return; d.position.set(c.x,c.y,c.z); d.rotation.set(0,c.r,0); d.scale.set(c.s*v,c.s*v,c.s*v); d.updateMatrix(); canne.setMatrixAt(i++,d.matrix); });
    canne.count=i; canne.visible=i>0; canne.instanceMatrix.needsUpdate=true; };
  RM.moduli.push(aggCanne); if(RM.qualita) RM.qualita.quando(function(){ aggCanne(annoCanne); });
}

/* luci della notte */
var pPos=new Float32Array(N*3), pCol=new Float32Array(N*3);
isolati.forEach(function(b,i){ pPos[i*3]=b.x; pPos[i*3+1]=b.y+b.alt*.8; pPos[i*3+2]=b.z; });
var gLuci=new THREE.BufferGeometry();
gLuci.setAttribute('position',new THREE.BufferAttribute(pPos,3)); gLuci.setAttribute('color',new THREE.BufferAttribute(pCol,3));
var luci=new THREE.Points(gLuci,new THREE.PointsMaterial({size:11,map:texAlone,vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true,fog:false}));
luci.visible=false; luci.frustumCulled=false; RM.scene.add(luci);

var INTONACI=[0xf0dfb8,0xe6c79c,0xf2e9d2,0xe3b89c,0xf6efde,0xe8d2a6].map(RM.col), CAMPI=[0xf2f0e0,0xe6dcae,0xd3dcae,0xd6c896,0xc9c2a0].map(RM.col);
var MURO_VECCHIO=[0xa47e62,0x9a7a60,0x8e8470,0xa88a6c].map(RM.col), MACERIA=RM.col(0x8e7b68), MACERIA_VECCHIA=RM.col(0x7f786a), ERBE=[0xf2ebe0,0xe6dccb,0xdcd8c2,0xeadcc4].map(RM.col), COPPI_ROTTI=RM.col(0xb8a898);
var d=new THREE.Object3D(), c=new THREE.Color(), bianco=new THREE.Color(1,1,1);

/* ---------- aggiornamento: si riscrivono solo gli isolati che cambiano ---------- */
var ultimaBassa=-1;
/* quanto resta in piedi di una rovina (in frazioni dell'altezza della casa) dopo eta anni: i muri crollano nei primi decenni fino a b.hFin, poi nei secoli si abbassano
   ancora di un quarto (prima di due quinti); vicino alle cave dei monumenti, dove si cuoce la calce, anche i ruderi delle case vengono spogliati. Una resa, non una misura. */
function altezzaRovina(b,eta,anno){ var cr=b.fato===2?RM.sfuma(5,60,eta):RM.sfuma(8,95,eta), sp=b.cava&&anno>b.cava?RM.sfuma(b.cava,b.cava+120,anno):0;
  return (1-(1-b.hFin)*cr)*(1-.25*RM.sfuma(150,450,eta))*(1-.45*sp); }
/* l'altezza dei muri della rovina dalla base dell'istanza, che sta 1,5 m sotto il suolo (come le case): almeno un metro fuori terra. Fino al 25 novembre 2026 i ruderi bassi
   finivano quasi sotto terra (hm senza quel metro e mezzo): da lontano restava il prato */
function altezzaMuri(b,eta,anno){ return .15+Math.max(.1,b.alt*(b.nasce?1:b.bassa0)*altezzaRovina(b,eta,anno)); }
function aggiorna(anno){
  var fr=D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,anno)), soglia=1-fr, numVivi=0, toccati=false, i, b, a, q, eta, v, crollo, H, hm, m;
  var bassa=1-.42*RM.sfuma(470,720,anno), forza=Math.abs(bassa-ultimaBassa)>.01; if(forza) ultimaBassa=bassa;      // le case a più piani lasciano il posto a case basse, a uno o due piani
  for(i=0;i<N;i++){
    b=isolati[i];
    a=RM.sfuma(-.02,.02,rango(b,anno)-soglia);             // 1 abitato, 0 abbandonato
    var arso=0, da0=b.lasciato+b.sfasa*12;
    if(b.fuoco!=null && anno>b.fuoco-.4){
      if(anno<b.fuocoFine){ arso=RM.sfuma(b.fuoco-.4,b.fuoco,anno)*(1-RM.sfuma(b.fuocoFine-Math.min(5,(b.fuocoFine-b.fuoco)*.5),b.fuocoFine,anno)); a*=1-arso; }   // poi, se il quartiere è ancora vivo, si ricostruisce
      if(b.fuoco<da0) da0=b.fuoco;
    }
    var dm=b.via?RM.sfuma(b.via-3*b.sfasa-1,b.via-3*b.sfasa,anno):0; if(dm>0) a*=1-dm;       // demolita per far posto a un monumento: non restano rovine
    if(b.nasce) a=RM.sfuma(b.nasce-5,b.nasce,anno)*(1-arso); // casa del Borgo: prima della sua data non c'è nulla, nemmeno rovine
    if(a>.5) numVivi++;
    eta=a>.999?0:b.nasce?(arso>0?Math.max(0,anno-b.fuoco):0):Math.max(0,anno-da0);          // anni passati dall'abbandono (o dall'incendio)
    if(!(forza&&a>.01) && Math.abs(a-b.a0)<.002 && (a>.999 || Math.abs(eta-b.e0)<1.5 || (eta>430&&b.e0>430))) continue;
    b.a0=a; b.e0=eta; toccati=true; v=b.nasce?arso:(1-a)*(1-dm);
    var sventrata=b.fuoco!=null && anno>b.fuoco-.4 && b.fuoco<=da0+.01;                       // lasciata per un incendio: niente stadio in piedi, resta subito il guscio bruciato
    var inPiedi=!b.nasce && !sventrata && dm<.001 && v>.001 && eta<b.t2; b.gv=v*RM.sfuma(15,70,eta);      // gv: quanto l'erba prende le vie attorno (aggiornaVie)                     // stadi 1 e 2: la casa abbandonata, ancora in piedi (si veda in testa)
    crollo=b.fato===2?RM.sfuma(5,60,eta):RM.sfuma(8,95,eta); H=altezzaRovina(b,eta,anno);
    /* Orti e vigne (26 novembre 2026): come ipotesi solo sui lotti b.orto (circa uno su otto dentro le mura), fra i monconi che restano; attestati dall'anno della fonte (ORTI_FONTI).
       Fino al 25 novembre 2026 anche gran parte dei ruderi bassi diventava orto dopo due-tre secoli: nell'852 la città sembrava campagna (l'utente: «il resto della città era in rovina, non era scomparso»). */
    var qF=b.ortoDal && anno>=b.ortoDal && eta>15?1:0;
    q=Math.max(b.orto?RM.sfuma(50,120,eta):0,qF)*v; b.q0=q;
    b.alb=b.orto?q:Math.max(.8*qF*v,RM.sfuma(15,30,eta)*(.15+.85*RM.sfuma(20,300,eta))*v);   // negli orti alberi coltivati; altrove fichi e olmi nati da soli, più alti quanto più vecchio è l'abbandono (ipotesi)
    var Y=b.alt*(b.nasce?1:a>.5?bassa:b.bassa0)+.15, s1=0, s2=0, hT=1;
    if(inPiedi){ s1=RM.sfuma(0,b.t1,eta); s2=RM.sfuma(b.t1,b.t2,eta);
      var hFine=Math.min(1,altezzaMuri(b,b.t2,anno)*.85/Y);                                  // dove arrivano i muri spezzati alla fine: l'altezza della rovina che prende il suo posto
      hT=1-(1-hFine)*RM.sfuma(b.t1+.3*(b.t2-b.t1),b.t2,eta); }
    d.rotation.set(0,b.ry,0);
    d.position.set(b.x,b.y-.15,b.z); if(inPiedi) d.scale.set(b.w,Y,b.d); else if(a>.01) d.scale.set(b.w,b.alt*a*(b.nasce?1:bassa)+.15,b.d); else d.scale.set(0,0,0); d.updateMatrix();
    vivi[b.tipo].setMatrixAt(b.ti,d.matrix); vivi[b.tipo].setColorAt(b.ti,c.copy(INTONACI[(b.tono*INTONACI.length)|0]).multiplyScalar((.86+.28*b.sfasa)*(1-.1*s1)));
    vivi[b.tipo].setDegAt(b.ti,inPiedi?Math.max(s1,a<.5?.001:0):0,s2,hT,b.sfasa);
    /* rovina: dopo lo stadio 2 (o subito, se è bruciata); appena lasciata ha il colore dell'intonaco, poi resta il mattone */
    hm=inPiedi?0:v*altezzaMuri(b,eta,anno); if(q>0) hm=Math.min(hm,hm*(1-q)+q*(.27+.05*b.tono));      // attorno a un orto i monconi si abbassano a muretti (1-2 m fuori terra)
    d.rotation.set(0,b.ry+b.giro*Math.PI/2,0);
    d.scale.set(hm>.01?b.w:0,hm,hm>.01?b.d:0); d.updateMatrix(); ruderi.setMatrixAt(i,d.matrix);
    ruderi.setColorAt(i,c.copy(INTONACI[(b.tono*INTONACI.length)|0]).multiplyScalar(.9).lerp(MURO_VECCHIO[(b.sfasa*MURO_VECCHIO.length)|0],RM.sfuma(3,70,eta)).multiplyScalar((.82+.3*b.tono)*(1-.55*arso*(1-RM.sfuma(0,30,eta)))));    // annerito se è bruciato da poco
    ruderi.setDegAt(i,v*RM.sfuma(25,250,eta)*(b.tono>.2?1:.4),RM.sfuma(20,200,eta),1,b.sfasa);      // edera e sporco
    /* il tetto bruciato cede nei primi trent'anni (solo le case sventrate da un incendio: le altre perdono il tetto nello shader) */
    m=sventrata?v*(1-RM.sfuma(10,34,eta))*(1-arso):0; d.scale.set(m>.02?b.w:0,b.alt*(.35+.65*m),m>.02?b.d:0); d.updateMatrix(); tettiRotti.setMatrixAt(i,d.matrix);
    tettiRotti.setColorAt(i,c.copy(bianco).lerp(COPPI_ROTTI,RM.sfuma(0,25,eta)).multiplyScalar(.8+.25*b.tono));
    /* macerie: crescono mentre i muri scendono e restano (nessuno le porta via, se non per farci un orto), coperte via via da rovi ed erba */
    m=v*crollo*(1-.85*q)*(inPiedi?s2:1); d.rotation.set(0,b.ry+b.sfasa*6,0); d.position.y=b.y-.06; d.scale.set(m>.02?b.w*1.05:0,m*Math.min(.6,.24+.28*b.alt*(1-b.hFin)),m>.02?b.d*1.05:0); d.updateMatrix(); macerie.setMatrixAt(i,d.matrix);
    macerie.setColorAt(i,c.copy(MACERIA).lerp(MACERIA_VECCHIA,RM.sfuma(30,150,eta)).multiplyScalar(.8+.35*b.tono));
    macerie.setDegAt(i,v*RM.sfuma(15,170,eta),0,1,b.sfasa);
    /* rovi, lentisco, sambuco nano, valeriana: dentro i muri dopo il tetto, fuori contro i muri presto */
    d.rotation.set(0,b.ry,0); d.position.y=b.y-.02;
    m=v*RM.sfuma(b.t1,b.t1+45,eta)*(1-.85*q); d.scale.set(m>.02?b.w:0,.3+.7*m,m>.02?b.d:0); d.updateMatrix(); macchiaD.setMatrixAt(i,d.matrix); macchiaD.setColorAt(i,c.copy(bianco).multiplyScalar(.8+.3*b.sfasa));
    m=(b.anello?1:0)*v*RM.sfuma(5,40,eta)*(1-.6*q); d.scale.set(m>.02?b.w:0,.3+.7*m,m>.02?b.d:0); d.updateMatrix(); macchiaF.setMatrixAt(i,d.matrix); macchiaF.setColorAt(i,c.copy(bianco).multiplyScalar(.75+.35*b.tono));
    m=b.vigna?q:0; d.position.y=b.y+.02; d.scale.set(m>.02?b.w*.95:0,m,m>.02?b.d*.95:0); d.updateMatrix(); vigne.setMatrixAt(i,d.matrix); vigne.setColorAt(i,c.copy(bianco).multiplyScalar(.85+.25*b.tono));
    /* suolo: terra, calcinacci ed erba fra le rovine, poi (per alcuni) filari */
    m=v*RM.sfuma(10,55,eta); d.rotation.set(0,b.ry,0); d.position.y=b.y+.04; d.scale.set(PASSO*1.04*m,1,PASSO*1.04*m); d.updateMatrix(); incolti.setMatrixAt(i,d.matrix);
    incolti.setColorAt(i,c.copy(ERBE[(b.sfasa*ERBE.length)|0]).multiplyScalar(.8+.3*b.tono));
    d.position.y=b.y+.08; d.scale.set(PASSO*1.02*q,1,PASSO*1.02*q); d.updateMatrix(); orti.setMatrixAt(i,d.matrix);
    orti.setColorAt(i,c.copy(CAMPI[(b.sfasa*CAMPI.length)|0]).multiplyScalar(.8+.3*b.tono));
    var l=a*(.3+.7*b.sfasa); pCol[i*3]=l; pCol[i*3+1]=l*.88; pCol[i*3+2]=l*.66;
  }
  alberi.forEach(function(lista,k){
    var mosso=false;
    lista.forEach(function(al,j){
      var qa=al.b<0?1:isolati[al.b].alb; if(Math.abs(qa-al.q0)<.002) return;
      al.q0=qa; mosso=true; d.rotation.set(0,al.r,0); d.position.set(al.x,al.y-.05,al.z); d.scale.setScalar(al.s*qa*1.25); d.updateMatrix(); magliaAlberi[k].setMatrixAt(j,d.matrix);
    });
    if(mosso) magliaAlberi[k].instanceMatrix.needsUpdate=true;
  });
  if(toccati){
    vivi.concat([ruderi,tettiRotti,macerie,macchiaD,macchiaF,vigne,incolti,orti]).forEach(function(p){ p.stringi(); });
    gLuci.attributes.color.needsUpdate=true; aggiornaVie();
  }
  matMuri.emissiveIntensity=matBasse.emissiveIntensity=RM.notte*2.2; luci.material.opacity=RM.notte; luci.visible=RM.notte>.02;
  RM.quotaAbitati=numVivi/N;
  if(RM.erba) RM.erba.value=.6*(1-D.interp(D.ABITATI,D.interp(D.CURVE.popolazione.punti,anno-30)));   // l'erba arriva una trentina d'anni dopo; dal 26 novembre 2026 meno piena: fra le rovine il suolo è terra e calcinacci (gli isolati), non un prato
}
RM.moduli.push(aggiorna);
})();
