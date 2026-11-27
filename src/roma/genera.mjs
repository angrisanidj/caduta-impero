/* Topografia vera di Roma per la scena 3D.
   Ingressi (in grezzi/): osm1.json (Tevere, mura, porte) e osm-strade.json (vie moderne che ricalcano le antiche): © OpenStreetMap contributors, ODbL; quote.json (SRTM 30 m via opentopodata.org).
   Uscita: ../../js/roma-topo.js  →  window.RM_TOPO = { fiume, mura, porte, strade, quote }
   Coordinate della scena: 1 = 10 m, origine al Foro Romano (41.8925 N, 12.4853 E), x verso est, z verso sud. */
import fs from 'node:fs';
const qui=f=>new URL(f,import.meta.url);
const LAT0=41.8925, LON0=12.4853, X=lon=>(lon-LON0)*8287, Z=lat=>-(lat-LAT0)*11113.2;
const osm=JSON.parse(fs.readFileSync(qui('./grezzi/osm1.json'),'utf8')).elements;
const r1=v=>Math.round(v*10)/10;

/* semplificazione di Douglas-Peucker */
function semplifica(p,tol){
  if(p.length<3) return p;
  let m=0, k=0; const a=p[0], b=p[p.length-1], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1;
  for(let i=1;i<p.length-1;i++){ const d=Math.abs((p[i][0]-a[0])*dz-(p[i][1]-a[1])*dx)/L; if(d>m){ m=d; k=i; } }
  if(m<=tol) return [a,b];
  return semplifica(p.slice(0,k+1),tol).slice(0,-1).concat(semplifica(p.slice(k),tol));
}

/* ---------- Tevere: da nord a sud ---------- */
let fiume=osm.filter(e=>e.tags&&e.tags.waterway).sort((a,b)=>b.geometry.length-a.geometry.length)[0].geometry.map(g=>[X(g.lon),Z(g.lat)]);
if(fiume[0][1]>fiume[fiume.length-1][1]) fiume.reverse();
fiume=fiume.filter(p=>p[1]>-620&&p[1]<640);
const fiumeFitto=fiume.slice();
fiume=semplifica(fiume,1.2);
/* riva sinistra (quella del Foro): a sinistra di chi scende la corrente */
function riva(da,a,scosta){
  const o=[]; for(let i=1;i<fiumeFitto.length-1;i++){ const p=fiumeFitto[i]; if(p[1]<da||p[1]>a) continue;
    const t=[fiumeFitto[i+1][0]-fiumeFitto[i-1][0],fiumeFitto[i+1][1]-fiumeFitto[i-1][1]], L=Math.hypot(t[0],t[1])||1; o.push([p[0]+t[1]/L*scosta,p[1]-t[0]/L*scosta]); }
  return o;
}

/* ---------- porte ---------- */
const porte={};
for(const e of osm){ const t=e.tags||{}; if(t.historic!=='city_gate'||!t.name) continue;
  const lat=e.lat??(e.bounds.minlat+e.bounds.maxlat)/2, lon=e.lon??(e.bounds.minlon+e.bounds.maxlon)/2; porte[t.name]=[r1(X(lon)),r1(Z(lat))]; }

/* ---------- mura Aureliane ----------
   I tratti superstiti (riva sinistra) si ordinano per angolo attorno a un punto interno; i tratti perduti si ricostruiscono:
   - lungo il Tevere nel Campo Marzio e al Testaccio la cinta seguiva la riva;
   - in Trastevere saliva da porta Portuense a porta Aurelia (San Pancrazio) e ridiscendeva a porta Settimiana. */
const C=[40,5];
let superstiti=[];
for(const e of osm){ const t=e.tags||{}; if(!e.geometry||t.waterway||t.historic==='city_gate'||t.name!=='Mura Aureliane') continue;
  for(const g of e.geometry){ const p=[X(g.lon),Z(g.lat)]; if(p[0]>-112) superstiti.push(p); } }
/* catena: si parte dal capo nord-ovest (il moncone verso il fiume a ovest di porta del Popolo) e si va sempre al punto più vicino non ancora preso */
const distFiume=p=>Math.min(...fiumeFitto.map(f=>Math.hypot(f[0]-p[0],f[1]-p[1])));
let capo=superstiti.filter(p=>p[1]<-100&&p[0]<0).sort((a,b)=>distFiume(a)-distFiume(b))[0];
const catena=[capo], resto=superstiti.filter(p=>p!==capo);
while(resto.length){
  let k=0, m=1e9; const u=catena[catena.length-1];
  for(let i=0;i<resto.length;i++){ const d=Math.hypot(resto[i][0]-u[0],resto[i][1]-u[1]); if(d<m){ m=d; k=i; } }
  if(m>70) break;
  catena.push(resto.splice(k,1)[0]);
}
console.log('mura superstiti: punti in catena',catena.length,'scartati',resto.length);
superstiti=semplifica(catena,1.4);
const fine=superstiti[superstiti.length-1], inizio=superstiti[0];
const ponteSublicio=[X(12.4752),Z(41.8838)], ponteSisto=[X(12.4708),Z(41.8924)];
const testaccio=riva(ponteSublicio[1],fine[1]+25,7).filter(p=>p[1]<fine[1]+12).reverse();              // dal capo sud delle mura su per la riva fino al ponte Sublicio
/* Al ponte Aurelio (ponte Sisto) le due cinte si attaccano al ponte: per Procopio (Guerra gotica I 19, 6-10, traduzione Loeb su LacusCurtius, letta il 25 novembre 2026) i Romani
   cinsero di mura il colle oltre il fiume e le unirono alla cinta con un ponte, che la nota dell'editore identifica col pons Aurelius; sulla riva sinistra il muro corre «along the river from near
   the porta Flaminia to the pons Aurelius» (Platner e Ashby, Muri Aureliani, stesso giorno). Fino al 25 novembre 2026 la cinta finiva 50 m a monte e 50 m a valle del ponte e un
   tratto merlato attraversava il fiume sotto l'impalcato. Ora i due capi stanno sul fianco a monte delle due testate del ponte del modello (7 unità dall'asse del fiume,
   una a monte dell'asse del ponte: js/mura.js lo calcola dalla curva del fiume); il lato che chiude il poligono passa sull'acqua e js/mura.js non lo disegna. */
const trastevere=[[X(12.4722),Z(41.8822)],porte['Porta Portese'],[X(12.4655),Z(41.8850)],[X(12.4614),Z(41.8884)],[X(12.4640),Z(41.8905)],porte['Porta Settimiana'],[-126.1,5.8]];
const campoMarzio=riva(inizio[1]-8,ponteSisto[1],7).reverse();                                           // da ponte Sisto su per l'ansa fino all'altezza di porta del Popolo
let mura=superstiti.concat(testaccio,trastevere,semplifica(campoMarzio,1.5));
mura=mura.map(p=>[r1(p[0]),r1(p[1])]).filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>1.5);
/* Angolo nord-ovest dei Castra Praetoria (27 novembre 2026): il tracciato di OpenStreetMap ha qui un punto (153,0, -172,3) 21 m a nord del lato nord del campo, e la cinta
   faceva un moncone che sporgeva dall'angolo (153,6, -170,3, lo spigolo dei Castra in js/monumenti.js). Il punto va sulla retta fra il vertice prima e lo spigolo, a una distanza
   scelta perché i due lati diano gli stessi passi di prima in js/mura.js (quattro e uno): così non cambia la numerazione dei passi, da cui dipendono danni e restauri presi dal posto. */
mura=mura.map(p=>Math.hypot(p[0]-153,p[1]+172.3)<.3?[151.1,-171.3]:p);

/* ---------- strade ----------
   Ogni via ha uno scheletro tracciato a mano fra punti noti (porte, ponti, piazze) e l'elenco delle vie moderne che la ricalcano.
   Dove la via moderna esiste se ne prende il tracciato (grezzi/osm-strade.json, query in grezzi/q2.txt); dove manca resta lo scheletro.
   I punti «fissi» sono porte antiche da cui la via moderna si è spostata (porta Nomentana, sostituita da porta Pia; porta Ostiense, che il traffico oggi aggira).
   Non è un rilievo delle strade antiche: è il loro erede moderno, che in città può scostarsi di qualche decina di metri. */
const VIE=[
  {nome:'via Lata e Flaminia', p:[[-22,-37],[-77,-211],[-110,-330],[-152,-478],[-165,-600]], vie:['Via del Corso','Via Flaminia','Ponte Milvio']},
  {nome:'Appia', p:[[42,25.9],[42.25,29.7],[42.4,32.3],[43.87,35.04],[35,61],[43,96],[126,172],[134,211],[200,330],[294,448],[420,560]], vie:['Via di San Gregorio','Via di Porta San Sebastiano','Via Appia Antica'], fissi:[[42,25.9,.5],[42.25,29.7,1],[42.4,32.3,1]]},      /* dal 24 novembre 2026 comincia dalla valle del Colosseo (prima cominciava 320 m più a sud). Dal 27 novembre 2026 passa ACCANTO all'arco di Costantino, dal lato del Palatino, non sotto: Platner e Ashby, Arcus Constantini: l'arco «stands at the beginning of the road which traverses the valley between the Palatine and the Caelian from the Colosseum to the south-east end of the circus Maximus […] The road did not, however, run through it, and indeed lay at a somewhat lower level». Il lato (ovest) è una scelta: la fonte non lo dice; contorno dell'arco su OpenStreetMap, way 23590989 */
  {nome:'Ostiense', p:[[-31.4,40.4],[-35.1,53.5],[-42,62],[-58,84],[-70,106],[-55,150],[-32,176],[-42,280],[-48,320],[-58,376],[-100,560]], vie:['Via Marmorata','Via Ostiense'], fissi:[[-32.1,176.1,12],[-32.3,173.13,2],[-32.79,178.1,2],[-35.1,53.5,1.5]]},      // dal 25 novembre 2026 comincia sulla strada del Foro Boario (prima sul tempio rotondo) e passa dal piede del ponte Sublicio
  {nome:'Aurelia', p:[[-58.9,44.3],[-70.2,37.4],[-110,45],[-198,46],[-300,40],[-458,28]], vie:['Via della Lungaretta','Via Aurelia Antica'], fissi:[[-58.9,44.3,1.5],[-70.2,37.4,2],[-198,45.5,12],[-196.17,47.2,2],[-199.85,43.81,2]]},      /* parte dalla testa di Trastevere del ponte dell'isola: prima partiva a metà del ponte Emilio e correva per cento metri sull'acqua (24 novembre 2026).
     Dal 25 novembre 2026 comincia al piede della rampa del ponte Emilio e passa dal piede di quella del ponte Cestio (le due coordinate vengono da RM.ponti di js/mura.js): «For a
     viaduct on the road leading from the bridge to the Janiculum, cf. Via Aurelia» (Platner e Ashby, Pons Aemilius, letto il 25 novembre 2026). Il tratto fra i due ponti è un'ipotesi:
     oggi lo stesso giro fanno lungotevere e piazza in Piscinula, da dove parte via della Lungaretta. */
  {nome:'Argileto, clivo Suburano e Tiburtina', inizio:[16.64,-11.71], p:[[-1,-1],[3,-5],[21,-20],[39,-22],[132,-36],[210,-56],[282,-98],[619,-250]], vie:['Argiletum','Via della Madonna dei Monti','Via Leonina','Via in Selci','Via di San Vito','Via Tiburtina Antica','Via Tiburtina'], fissi:[[207.1,-55.3,10],[205.42,-54.24,2],[209.95,-56.36,2]]},
  {nome:'Labicana e Prenestina', p:[[72,22],[249,12],[400,30],[619,50]], vie:['Via Labicana','Via Prenestina']},
  {nome:'Alta Semita e Nomentana', p:[[24,-78],[80,-128],[139,-179],[270,-326],[420,-500]], vie:['Via del Quirinale','Via Venti Settembre','Via Nomentana'], fissi:[[139.5,-178.5,28],[137.34,-177.27,2],[141.68,-179.76,2]]},
  {nome:'via Recta, ponte Elio, verso San Pietro', p:[[-40.8,-94.5],[-46.5,-94.4],[-100,-89],[-150,-90],[-155.5,-95.4],[-156.1,-104.37],[-156.7,-113.3],[-161.84,-110.84],[-201.75,-108.1],[-246.64,-105.02]], vie:['Via delle Coppelle','Via dei Coronari'], fino:111, fermo:true},
  /* via Recta, 24 novembre 2026: comincia sull'asse della via Lata (prima restava staccata di 24 m) e passa a nord del piedistallo della colonna di Marco Aurelio; entra diritta sul ponte Elio
     lungo l'asse di ponte Sant'Angelo (OpenStreetMap, way 25752465: 3,65 gradi da nord verso ovest) e finisce davanti alla porta del mausoleo; da lì piega e segue l'asse del portico dei
     pellegrini, che era la strada coperta per San Pietro (prima girava a ovest 27 m prima dell'ingresso e attraversava la Meta Romuli). Il tracciato nel Borgo resta un'ipotesi. */
  {nome:'Vicus Longus', p:[[13,-20],[50,-60],[85,-88]], vie:[]},
  {nome:'Latina', p:[[126,172],[142,178],[370,361]], vie:['Via di Porta Latina','Via Latina'], innesto:1},
  {nome:'Portuense', p:[[-58.9,44.3],[-94,96],[-210,250],[-300,400]], vie:['Via Portuense'], fissi:[[-58.9,44.3,1.5]]},      /* dal 25 novembre 2026 comincia al piede della rampa del ponte Emilio, sulla riva di Trastevere (prima a metà del ponte, sull'acqua). Dentro le mura il tracciato è un'ipotesi: oggi via dei Vascellari e via di San Michele vanno dal ponte verso porta Portese */
  {nome:'via Settimiana', p:[[-110,45],[-147,3],[-185,-50],[-196,-87]], vie:['Via della Lungara'], fissi:[[-145.63,5.32,2],[-146.09,0.34,2]]},
  {nome:'Salaria', p:[[80,-128],[106,-203],[120,-330],[130,-500]], vie:['Via Salaria'], fissi:[[106.4,-203.3,10]]},
  {nome:'verso il Laterano e porta Asinaria', p:[[66,34],[120,60],[194,76],[330,170]], vie:['Via dei Santi Quattro'], fissi:[[193.42,73.99,2],[195.45,78.56,2]]},      /* le coppie di punti fissi a 25 m dentro e fuori di una porta (qui e nelle altre vie) fanno entrare la strada diritta nel fornice (24 novembre 2026) */
  /* vie del centro antico (strette): nel Foro e sul Palatino sono i basolati antichi rilevati da OSM con il loro nome; fuori, la via moderna che li ricalca */
  /* 27 novembre 2026 (notte): nel Foro la via segue Platner e Ashby, Sacra Via (letta per intero): «After the rebuilding of the regia in 36 B.C. and the building of the temple of Divus
     Iulius a few years later, it passed to the north of these structures, and then bent to the left to the temple of Castor»; fra la Regia e Antonino e Faustina («the street passes on the north
     the temple of Faustina … on the south the regia»); poi lungo il lato nord della basilica Giulia, a sud dell'arco di Tiberio («on the north side of the Sacra Via», Arcus Tiberii), e su per il
     clivo Capitolino fra l'arco e Saturno. Prima correva sul lato nord della piazza, fra l'arco di Settimio Severo e i Rostri: lì ora c'è la piazza. Il tratto dalla basilica al clivo, fra l'arco
     e Saturno, è ora di questa via (il vico Iugario comincia a sud dell'arco); tol 1: i punti della via Sacra moderna (che nel Foro corre a nord) non entrano più */
  /* 27 novembre 2026, notte: con Antonino e Faustina spostato sul resto vero (js/monumenti.js) la via passa libera fra la scala e la Regia (largo libero almeno 8,5 m, mezzeria a 2,5 m
     dall'anticamera della Regia). Provato a spostare il punto 10,5, 6 verso il tempio: cambiava anche il clivo Capitolino (le proiezioni delle vie di OpenStreetMap si spostano lungo
     tutto lo scheletro) e la via toccava di più Saturno; lasciato com'era */
  {nome:'via Sacra e clivo Capitolino', stretta:true, tol:1, p:[[43,26],[31,22],[27,20],[24.6,17.2],[21.9,12.3],[19.3,10.7],[12.5,7.5],[10.5,6],[8.9,4.6],[5.4,2.45],[4.5,2.7],[3.1,5.2],[1.9,5.45],[-6.9,1.98],[-7.75,1.75],[-7.8,.8],[-7.3,-.3],[-7.05,-1],[-8.6,-2.1],[-10,-1.2],[-12,1],[-17,6],[-19,5]], vie:['Via Sacra','Clivus Capitolinus'],
     fissi:[[28.3,20.65,1.5],[26.1,19.65,1.5],[24.6,17.2,2],[10.5,6,.4],[8.9,4.6,.4],[5.4,2.45,.4],[4.5,2.7,.3],[3.1,5.2,.4],[1.9,5.45,.4],[-6.9,1.98,.4],[-7.75,1.75,.3],[-7.8,.8,.4],[-7.3,-.3,.4],[-7.05,-1,.4],[-8.6,-2.15,.5],[-10,-1.2,.5],[-13,2.2,.8]]},      /* il passaggio sotto l'Arco di Tito, lungo il suo asse (contorno dell'arco su OpenStreetMap, way 23913953; 23 novembre 2026): la via moderna gira subito verso nord. Dal 27 novembre 2026 (sera) i punti da -3,6 a -8,9 tengono la via nel mezzo dello stretto fra l'arco di Settimio Severo e i Rostri (largo 3-4 m nel modello: la via, 4,5 m, li sfiora tutti e due; prima passava sotto lo spigolo sud dell'arco, che secondo Platner e Ashby non aveva strada sotto) e poi fra la Concordia e Saturno */
  {nome:'vico Patrizio', stretta:true, p:[[61,-25],[80,-52],[96,-77]], vie:['Via Urbana'], innesto:4},
  {nome:'vico Tusco', stretta:true, p:[[2,5],[-1,12],[-9,23],[-14,43],[-17,48]], vie:['Vicus Tuscus','Via di San Teodoro'], fissi:[[1.7,5.9,.5],[1,7,.5],[.25,9,.6]]},      // 27 novembre 2026 (sera): nel mezzo del passaggio fra la basilica Giulia e i Castori rimessi sui resti (prima sfiorava i Castori)
  {nome:'vico Iugario', stretta:true, p:[[-7.75,1.6],[-10,4],[-28,16],[-39,18]], vie:['Vicus Iugarius','Vico Jugario'], fissi:[[-7.75,1.6,.3],[-8.45,1.9,.5],[-9.1,3,.5],[-9.6,3.7,.4]]},      // 27 novembre 2026 (notte): comincia sulla via Sacra a sud-ovest dell'arco di Tiberio; il tratto fra l'arco e Saturno è della via Sacra (strada 14), perché due nastri sovrapposti non si contendano i pixel      // 27 novembre 2026 (sera): fra Saturno rimesso sui resti e l'arco di Tiberio, poi fra Saturno e la basilica Giulia (prima passava per 2 m sul podio di Saturno); accanto all'arco la via si stringe (RM.strozzature in js/monumenti.js)
  {nome:'clivo Argentario', stretta:true, p:[[-3,-4],[-6,-11],[-9,-18],[-22,-37]], vie:['Clivo Argentario']},
  {nome:'via Nova', stretta:true, p:[[26.4,20.2],[25,22],[17,18],[12,16],[6,13]], vie:['Via Nova'], fissi:[[26.4,20.2,.5]]},      /* parte dalla via Sacra, appena a ovest dell'Arco di Tito (23 novembre 2026: prima finiva nel vuoto con una piega) */
  {nome:'clivo di Scauro e via Celimontana', stretta:true, tol:14, p:[[40,66],[59,69],[85,70],[125,68],[163,62]], vie:['Clivo di Scauro','Via di San Paolo della Croce','Via di Santo Stefano Rotondo']},
  {nome:"vico Capo d'Africa", stretta:true, p:[[70,38],[103,47]], vie:["Via Capo d'Africa"]},
  /* Strade dei ponti (25 novembre 2026). Prima i ponti Aurelio, dell'isola (lato sinistro), Emilio (lato del Foro Boario) e di Probo finivano su un prato: ora ogni testata, al piede
     della rampa (le coordinate dei piedi vengono da RM.ponti di js/mura.js), ha la sua strada. Le fonti lette (Platner e Ashby, il 25 novembre 2026) dicono quali luoghi i ponti univano,
     non il tracciato: il pons Aemilius «crossed the river from the forum Boarium»; il vicus Tuscus era «the principal artery of communication between the forum and the forum Boarium»;
     per il vicus Iugarius, «part of the original trade route which led to the river», le vie da nord e da est «all reached the crossing over the Tiber just below the island».
     Dove la fonte tace (ponte Aurelio, ponte di Probo) il tracciato è quello della via moderna erede, presa da OpenStreetMap (grezzi/osm-ponti.json, query in grezzi/q13.txt),
     scostato dove passerebbe dentro un monumento del modello (teatro di Pompeo, Portico d'Ottavia, teatro di Marcello). Tutti i tracciati sono ipotesi. */
  {nome:'foro Boario, dal vico Tusco al ponte Emilio', stretta:true, p:[[-44.4,31.4],[-39.6,33.3],[-35,32.4],[-32.6,36.6],[-31.4,40.4],[-23.5,42.4],[-14.2,43]], vie:[]},      // oggi via di Ponte Rotto (a nord del tempio di Portuno), piazza della Bocca della Verità, via della Greca verso il Velabro
  {nome:'dal ponte Aurelio al ponte Fabricio e al vico Iugario', stretta:true, p:[[-111.5,-8.6],[-104.8,-13.8],[-95,-14.5],[-84,-13.5],[-79.5,-12.4],[-75.4,-10.4],[-69.9,-7.1],[-64.7,-4.5],[-62.3,4],[-61.2,13],[-59.7,17.9],[-55,19.8],[-50,19.6],[-44,18.7],[-39,18]], vie:[]},      // oggi via dei Pettinari, via dei Giubbonari (qui più a sud, fuori dal teatro di Pompeo), via di Santa Maria del Pianto, via del Portico d'Ottavia; poi lungo la riva fino al ponte Fabricio e, a sud del teatro di Marcello, fino alla porta Carmentale, dove finisce il vico Iugario
  {nome:'dal ponte Aurelio a porta Settimiana', stretta:true, p:[[-130.1,9.5],[-134.1,7.6],[-142.7,8.6]], vie:[]},      // oggi piazza Trilussa e via di Ponte Sisto; si innesta nella via Settimiana dentro la porta
  {nome:'ponte di Probo, riva sinistra', stretta:true, p:[[-75.1,106.05],[-70.2,106.5]], vie:[]},      // oggi piazza dell'Emporio, fino alla via Marmorata (Ostiense)
  {nome:'ponte di Probo, riva destra', stretta:true, p:[[-87.7,92.75],[-91.9,92.7]], vie:[]},      // oggi piazza di Porta Portese, fino alla via Portuense
  {nome:'ponte Sublicio, riva destra', stretta:true, p:[[-55.1,49.3],[-60,46]], vie:[]},      // fino alla Portuense; sulla riva sinistra il ponte arriva sulla via Ostiense
  /* Vie corte agli ingressi (25 novembre 2026, dopo il controllo src/design/audit-monumenti-tappeto.md). Tracciati dalle vie moderne di OpenStreetMap (grezzi/osm-vie-brevi.json, query
     in grezzi/q14.txt): sono le eredi, non strade antiche rilevate, e restano ipotesi; solo il capo nord della prima è un dato (src/testi/topografia-fonti.md, sezione 3). */
  {nome:'dalla via Recta alla piazza del Pantheon', stretta:true, p:[[-70.5,-85.4],[-71.5,-87.5],[-72.5,-89.5]], vie:[]},      // la piazza finiva a nord su una strada antica, vista nel 1873 all'angolo di via della Maddalena con via delle Coppelle (Lanciani, Notizie degli scavi 1881, pp. 269-271): qui la via Recta del modello passa 35 m a nord della piazza lunga 120 m, e questa via, sulla linea di via del Pantheon e via della Maddalena, unisce il lato aperto a quell'angolo
  {nome:'dal clivo Suburano a Santa Maria Maggiore', stretta:true, p:[[116.6,-52.9],[118.6,-52.2],[120.7,-50.6],[123.4,-48.8],[129.2,-44.6],[136.1,-39.4],[139.8,-36.7]], vie:[]},      // oggi via Carlo Alberto; il primo tratto attraversa la piazza fino all'atrio fino a via di San Vito, fuori dall'arco di Gallieno
  {nome:'dalla via Ostiense a Santa Sabina', stretta:true, p:[[-41.3,61.8],[-39.7,61.8],[-38.3,63.5],[-37.1,65.6],[-36.9,66.6],[-38.7,70.5],[-40.6,74.6],[-40.9,75.6],[-39.5,77],[-38.2,78.4],[-39.9,82.9],[-41.3,84.3]], vie:[]},      // oggi il clivo di Rocca Savella, dalla riva alla cima dell'Aventino; l'ultimo tratto, attraverso lo spiazzo fino all'atrio, è a mano
  {nome:'dal clivo di Scauro al tempio di Claudio', stretta:true, p:[[68.7,61.1],[73.1,72.95]], vie:[]},      // dalla via Celimontana alla rampa a gradini del lato sud della piattaforma (pianta marmorea), sull'asse nord-sud del recinto: nessuna via moderna la ricalca, il tracciato è un'ipotesi
  {nome:'ponte Milvio, riva sinistra', stretta:true, p:[[-149.35,-470],[-152.2,-470.4]], vie:[]},      // la Flaminia di OpenStreetMap arriva al piazzale di sbieco e passava 28 m a ovest della testata sud; spostarla avrebbe staccato le piste della scena del 312 (js/scene-tappe.js)
  /* L'Argileto nel foro di Nerva (27 novembre 2026, notte; l'utente: «verifica il tracciato così non è corretto»: la via correva in mezzo al foro e passava sul tempio di Minerva).
     Platner e Ashby, Argiletum: «the street between the Subura and the forum, which it entered between the Curia and the basilica Aemilia»; la parte bassa fu trasformata «by Domitian
     and Nerva into the forum Transitorium». Forum Nervae: «a transformation of the intervening Argiletum … into a magnificent avenue which had the form of a very narrow forum», «the main
     thoroughfare between the Subura and forum Romanum»; il tempio «stood in the centre of the north-east end»; il lato verso il Foro Romano «was pierced by two monumental archways»,
     l'altro capo ne aveva uno, «east of the temple». Quindi dentro il foro la via è la piazza stessa e non si disegna: la strada 4 comincia dall'arco a est del tempio, e il tratto
     fra il Foro Romano e il capo sud-ovest del foro di Nerva è questa via a parte, in coda all'elenco perché gli indici delle altre (TENUTE in js/base.js) non cambino. Il primo tratto
     è il sentiero «Argiletum» di OpenStreetMap fra la Curia e la basilica Emilia; l'ultimo pezzo, fino alla soglia del foro, è a mano */
  {nome:'Argileto, dal Foro al foro di Nerva', stretta:true, p:[[-.1,-1.2],[3.1,-5],[5.6,-5.1]], vie:['Argiletum']}
];
const osmStrade=JSON.parse(fs.readFileSync(qui('./grezzi/osm-strade.json'),'utf8')).elements.concat(JSON.parse(fs.readFileSync(qui('./grezzi/osm-vie.json'),'utf8')).elements.filter(w=>w.tags&&w.tags.name&&w.geometry));   // query in grezzi/q2.txt e q3.txt
/* ascissa lungo lo scheletro, scarto laterale con segno */
function proietta(p,sk){
  let m=1e9, s=0, sc=0, lungo=0, fuori=false;
  for(let i=0;i<sk.length-1;i++){ const a=sk[i], b=sk[i+1], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(L*L)));
    const d=Math.hypot(a[0]+t*dx-p[0],a[1]+t*dz-p[1]); if(d<m){ m=d; s=lungo+t*L; sc=((p[0]-a[0])*dz-(p[1]-a[1])*dx)/L; fuori=(i===0&&t===0)||(i===sk.length-2&&t===1); } lungo+=L; }
  return {s, d:m, sc, fuori};
}
const dentroMura=p=>{ let d=false; for(let i=0,j=mura.length-1;i<mura.length;j=i++){ if((mura[i][1]>p[1])!==(mura[j][1]>p[1]) && p[0]<(mura[j][0]-mura[i][0])*(p[1]-mura[i][1])/(mura[j][1]-mura[i][1])+mura[i][0]) d=!d; } return d; };
const mediana=v=>{ const o=v.slice().sort((a,b)=>a-b); return o[o.length>>1]; };
const strade=VIE.map(v=>{
  const sk=v.p, ST=!!v.stretta, TOL=v.tol||(ST?3:60), PASSO=ST?1.5:4, nube=[];
  for(const w of osmStrade){ if(!v.vie.includes(w.tags.name)) continue;
    const g=w.geometry.map(q=>[X(q.lon),Z(q.lat)]);
    for(let i=0;i<g.length-1;i++){ const L=Math.hypot(g[i+1][0]-g[i][0],g[i+1][1]-g[i][1]), n=Math.max(1,Math.ceil(L));        // un punto ogni 10 m
      for(let k=0;k<n;k++){ const p=[g[i][0]+(g[i+1][0]-g[i][0])*k/n, g[i][1]+(g[i+1][1]-g[i][1])*k/n], pr=proietta(p,sk); if(pr.d<TOL&&!pr.fuori&&(!v.fino||pr.s<v.fino)) nube.push({p,s:pr.s,sc:pr.sc}); } } }
  /* per tratti di 40 m: si tiene il fascio principale (scarto vicino alla mediana) e se ne fa la media, così le due carreggiate dei viali diventano un asse solo */
  const tratti=new Map(); for(const q of nube){ const k=Math.floor(q.s/PASSO); if(!tratti.has(k)) tratti.set(k,[]); tratti.get(k).push(q); }
  let punti=[];
  for(const [k,l] of tratti){ if(l.length<(ST?1:3)) continue; const m=mediana(l.map(q=>q.sc)), buoni=l.filter(q=>Math.abs(q.sc-m)<(ST?1.2:2.5));
    punti.push({sc:m, s:buoni.reduce((a,q)=>a+q.s,0)/buoni.length, p:[buoni.reduce((a,q)=>a+q.p[0],0)/buoni.length, buoni.reduce((a,q)=>a+q.p[1],0)/buoni.length], vero:true}); }
  (v.fissi||[]).forEach(f=>{ const pr=proietta(f,sk); punti=punti.filter(q=>Math.abs(q.s-pr.s)>f[2]); punti.push({s:pr.s,p:[f[0],f[1]],sc:0,fisso:true}); });
  /* i vertici dello scheletro restano dove la via moderna manca per più di 150 m */
  let lungo=0; const totale=sk.slice(1).reduce((a,p,i)=>a+Math.hypot(p[0]-sk[i][0],p[1]-sk[i][1]),0);
  const veri=punti.filter(q=>q.vero), fermi=punti.slice();
  sk.forEach((p,i)=>{ if(i) lungo+=Math.hypot(p[0]-sk[i-1][0],p[1]-sk[i-1][1]); const R1=ST?1.5:4, R2=ST?5:15; if(fermi.some(q=>Math.abs(q.s-lungo)<R1) || (fermi.some(q=>q.s>=lungo&&q.s-lungo<R2) && fermi.some(q=>q.s<=lungo&&lungo-q.s<R2))) return;
    /* fuori le mura lo scheletro è solo indicativo: lo si sposta di lato quanto la via vera più vicina, così i due tracciati si raccordano senza gomiti */
    if(i&&veri.length&&!v.fermo&&!dentroMura(p)){ const a=sk[Math.max(0,i-1)], b=sk[Math.min(sk.length-1,i+(i?0:1))], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), vicino=veri.reduce((m,q)=>Math.abs(q.s-lungo)<Math.abs(m.s-lungo)?q:m);
      p=[p[0]+dz/L*vicino.sc, p[1]-dx/L*vicino.sc]; }
    punti.push({s:lungo,p}); });
  punti.sort((a,b)=>a.s-b.s);
  const coperta=punti.filter(q=>q.vero).length*PASSO/totale;
  /* lisciatura leggera (solo dove la via vera è continua: i punti a mano e le porte non si toccano) e semplificazione */
  let linea=punti.map((q,i)=>(i&&i<punti.length-1&&q.vero&&punti[i-1].vero&&punti[i+1].vero)?[(punti[i-1].p[0]+2*q.p[0]+punti[i+1].p[0])/4,(punti[i-1].p[1]+2*q.p[1]+punti[i+1].p[1])/4]:q.p);
  linea=semplifica(linea,ST?.25:.6).map(p=>[r1(p[0]),r1(p[1])]);
  if(v.inizio){ const pr=proietta(v.inizio,linea); let acc=0, k=0; for(;k<linea.length-1;k++){ const l=Math.hypot(linea[k+1][0]-linea[k][0],linea[k+1][1]-linea[k][1]); if(acc+l>pr.s) break; acc+=l; } linea=[v.inizio].concat(linea.slice(k+1)); }      // inizio: la via comincia lì (l'Argileto all'arco a est del tempio di Minerva); il resto della linea resta quello di prima
  console.log('strada',v.nome.padEnd(42),'punti',String(linea.length).padStart(3),'da OSM',Math.round(Math.min(1,coperta)*100)+'%', process.argv.includes('-v')?linea.map(p=>p.map(Math.round).join(',')).join(' '):'');
  return {linea, v};
});
/* innesti: la Latina si stacca dall'Appia */
strade.forEach(o=>{ if(o.v.innesto==null) return; const su=strade[o.v.innesto].linea, a=o.linea[0]; let m=1e9, k=0; su.forEach((p,i)=>{ const d=Math.hypot(p[0]-a[0],p[1]-a[1]); if(d<m){ m=d; k=i; } }); o.linea[0]=su[k]; });

/* ---------- quote: griglia lisciata, zero a 14 m s.l.m. (riva del Tevere) ---------- */
const g=JSON.parse(fs.readFileSync(qui('./grezzi/quote.json'),'utf8'));
let q=g.q.slice();
/* SRTM misura anche i tetti: nei quartieri fitti il suolo risulta 10-15 m troppo alto. Un filtro di minimo 3x3 (circa 360 m) riporta la quota verso il piano stradale. */
{ const n=q.slice(); for(let r=0;r<g.righe;r++) for(let c=0;c<g.colonne;c++){ let m=1e9;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ const rr=r+dr, cc=c+dc; if(rr<0||cc<0||rr>=g.righe||cc>=g.colonne) continue; m=Math.min(m,q[rr*g.colonne+cc]); }
    n[r*g.colonne+c]=m; } q=n; }
for(let giro=0;giro<2;giro++){ const n=q.slice();
  for(let r=0;r<g.righe;r++) for(let c=0;c<g.colonne;c++){ let s=0,k=0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ const rr=r+dr, cc=c+dc; if(rr<0||cc<0||rr>=g.righe||cc>=g.colonne) continue; const w=(dr||dc)?1:2; s+=q[rr*g.colonne+cc]*w; k+=w; }
    n[r*g.colonne+c]=s/k; }
  q=n; }
const quote={ x0:r1(X(g.lon0)), dx:+(g.dLon*8287).toFixed(4), z0:r1(Z(g.lat0)), dz:+(g.dLat*11113.2).toFixed(4), colonne:g.colonne, righe:g.righe,   // riga 0 = sud (z0), le righe salgono verso nord
  q:q.map(v=>Math.round((v-14)))};                                                                                                                      // metri sopra la riva

const out={fiume:fiume.map(p=>[r1(p[0]),r1(p[1])]), mura, porte, strade:strade.map(o=>o.linea), stradeLarghe:strade.map((o,i)=>o.v.stretta?.45:i<8?.8:.6), quote};
fs.writeFileSync(qui('../../js/roma-topo.js'),'/* Generato da src/roma/genera.mjs: non modificare a mano.\n   Tevere, mura, porte e strade: © OpenStreetMap contributors (ODbL). Quote: SRTM 30 m (NASA), via opentopodata.org. */\nwindow.RM_TOPO='+JSON.stringify(out)+';\n');

/* pianta di controllo */
let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-640 -620 1280 1240" style="background:#f4ecdc">';
s+=`<polygon points="${mura.map(p=>p.join(',')).join(' ')}" fill="rgba(192,57,43,.12)" stroke="#c0392b" stroke-width="2"/>`;
s+=`<polyline points="${out.fiume.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#5f8a8c" stroke-width="10" stroke-opacity=".7"/>`;
mura.forEach((p,i)=>{ if(i%5===0) s+=`<text x="${p[0]}" y="${p[1]}" font-size="7">${i}</text>`; });
strade.forEach(o=>{ s+=`<polyline points="${o.v.p.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/><polyline points="${o.linea.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#333" stroke-width="1.6"/>`; });
for(const n in porte) s+=`<circle cx="${porte[n][0]}" cy="${porte[n][1]}" r="2.5"/>`;
s+='<circle cx="0" cy="0" r="4" fill="red"/></svg>';
fs.writeFileSync(qui('./pianta.svg'),s);
console.log('fiume',out.fiume.length,'mura',mura.length,'porte',Object.keys(porte).length,'quota max',Math.max(...quote.q));
