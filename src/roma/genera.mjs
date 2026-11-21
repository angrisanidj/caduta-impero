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
const trastevere=[[X(12.4722),Z(41.8822)],porte['Porta Portese'],[X(12.4655),Z(41.8850)],[X(12.4614),Z(41.8884)],[X(12.4640),Z(41.8905)],porte['Porta Settimiana'],[ponteSisto[0]-7,ponteSisto[1]]];
const campoMarzio=riva(inizio[1]-8,ponteSisto[1],7).reverse();                                           // da ponte Sisto su per l'ansa fino all'altezza di porta del Popolo
let mura=superstiti.concat(testaccio,trastevere,[[ponteSisto[0]+7,ponteSisto[1]]],semplifica(campoMarzio,1.5));
mura=mura.map(p=>[r1(p[0]),r1(p[1])]).filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>1.5);

/* ---------- strade ----------
   Ogni via ha uno scheletro tracciato a mano fra punti noti (porte, ponti, piazze) e l'elenco delle vie moderne che la ricalcano.
   Dove la via moderna esiste se ne prende il tracciato (grezzi/osm-strade.json, query in grezzi/q2.txt); dove manca resta lo scheletro.
   I punti «fissi» sono porte antiche da cui la via moderna si è spostata (porta Nomentana, sostituita da porta Pia; porta Ostiense, che il traffico oggi aggira).
   Non è un rilievo delle strade antiche: è il loro erede moderno, che in città può scostarsi di qualche decina di metri. */
const VIE=[
  {nome:'via Lata e Flaminia', p:[[-22,-37],[-77,-211],[-110,-330],[-152,-478],[-165,-600]], vie:['Via del Corso','Via Flaminia','Ponte Milvio']},
  {nome:'Appia', p:[[35,61],[43,96],[126,172],[134,211],[200,330],[294,448],[420,560]], vie:['Via di San Gregorio','Via di Porta San Sebastiano','Via Appia Antica']},
  {nome:'Ostiense', p:[[-36,42],[-42,62],[-58,84],[-70,106],[-55,150],[-32,176],[-42,280],[-48,320],[-58,376],[-100,560]], vie:['Via Marmorata','Via Ostiense'], fissi:[[-32.1,176.1,12]]},
  {nome:'Aurelia', p:[[-50,36],[-110,45],[-198,46],[-300,40],[-458,28]], vie:['Via della Lungaretta','Via Aurelia Antica'], fissi:[[-198,45.5,12]]},
  {nome:'Argileto, clivo Suburano e Tiburtina', p:[[-1,-1],[3,-5],[21,-20],[39,-22],[132,-36],[210,-56],[282,-98],[619,-250]], vie:['Argiletum','Via della Madonna dei Monti','Via Leonina','Via in Selci','Via di San Vito','Via Tiburtina Antica','Via Tiburtina'], fissi:[[207.1,-55.3,10]]},
  {nome:'Labicana e Prenestina', p:[[72,22],[249,12],[400,30],[619,50]], vie:['Via Labicana','Via Prenestina']},
  {nome:'Alta Semita e Nomentana', p:[[24,-78],[80,-128],[139,-179],[270,-326],[420,-500]], vie:['Via del Quirinale','Via Venti Settembre','Via Nomentana'], fissi:[[139.5,-178.5,28]]},
  {nome:'via Recta, ponte Elio, verso San Pietro', p:[[-44,-94],[-100,-89],[-150,-90],[-157,-104],[-157,-111],[-166,-112],[-185,-112],[-215,-110],[-247,-108]], vie:['Via delle Coppelle','Via dei Coronari'], fino:108, fermo:true},
  {nome:'Vicus Longus', p:[[13,-20],[50,-60],[85,-88]], vie:[]},
  {nome:'Latina', p:[[126,172],[142,178],[370,361]], vie:['Via di Porta Latina','Via Latina'], innesto:1},
  {nome:'Portuense', p:[[-50,36],[-94,96],[-210,250],[-300,400]], vie:['Via Portuense']},
  {nome:'via Settimiana', p:[[-110,45],[-147,3],[-185,-50],[-196,-87]], vie:['Via della Lungara']},
  {nome:'Salaria', p:[[80,-128],[106,-203],[120,-330],[130,-500]], vie:['Via Salaria'], fissi:[[106.4,-203.3,10]]},
  {nome:'verso il Laterano e porta Asinaria', p:[[66,34],[120,60],[194,76],[330,170]], vie:['Via dei Santi Quattro']},
  /* vie del centro antico (strette): nel Foro e sul Palatino sono i basolati antichi rilevati da OSM con il loro nome; fuori, la via moderna che li ricalca */
  {nome:'via Sacra e clivo Capitolino', stretta:true, p:[[43,26],[31,22],[27,20],[17,9],[4,1],[-1,-1],[-7,-1],[-10,-2],[-12,1],[-17,6],[-19,5]], vie:['Via Sacra','Clivus Capitolinus']},
  {nome:'vico Patrizio', stretta:true, p:[[61,-25],[80,-52],[96,-77]], vie:['Via Urbana'], innesto:4},
  {nome:'vico Tusco', stretta:true, p:[[2,5],[-1,12],[-9,23],[-14,43],[-17,48]], vie:['Vicus Tuscus','Via di San Teodoro']},
  {nome:'vico Iugario', stretta:true, p:[[-7,-1],[-10,4],[-28,16],[-39,18]], vie:['Vicus Iugarius','Vico Jugario']},
  {nome:'clivo Argentario', stretta:true, p:[[-3,-4],[-6,-11],[-9,-18],[-22,-37]], vie:['Clivo Argentario']},
  {nome:'via Nova', stretta:true, p:[[25,22],[17,18],[12,16],[6,13]], vie:['Via Nova']},
  {nome:'clivo di Scauro e via Celimontana', stretta:true, tol:14, p:[[40,66],[59,69],[85,70],[125,68],[163,62]], vie:['Clivo di Scauro','Via di San Paolo della Croce','Via di Santo Stefano Rotondo']},
  {nome:"vico Capo d'Africa", stretta:true, p:[[70,38],[103,47]], vie:["Via Capo d'Africa"]}
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
