/* Topografia vera di Roma per la scena 3D.
   Ingressi (in grezzi/): osm1.json (Tevere, mura, porte: © OpenStreetMap contributors, ODbL), quote.json (SRTM 30 m via opentopodata.org).
   Uscita: ../../js/roma-topo.js  →  window.RM_TOPO = { fiume, mura, porte, quote }
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

const out={fiume:fiume.map(p=>[r1(p[0]),r1(p[1])]), mura, porte, quote};
fs.writeFileSync(qui('../../js/roma-topo.js'),'/* Generato da src/roma/genera.mjs: non modificare a mano.\n   Tevere, mura e porte: © OpenStreetMap contributors (ODbL). Quote: SRTM 30 m (NASA), via opentopodata.org. */\nwindow.RM_TOPO='+JSON.stringify(out)+';\n');

/* pianta di controllo */
let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-420 -420 840 880" style="background:#f4ecdc">';
s+=`<polygon points="${mura.map(p=>p.join(',')).join(' ')}" fill="rgba(192,57,43,.12)" stroke="#c0392b" stroke-width="2"/>`;
s+=`<polyline points="${out.fiume.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#5f8a8c" stroke-width="10" stroke-opacity=".7"/>`;
mura.forEach((p,i)=>{ if(i%5===0) s+=`<text x="${p[0]}" y="${p[1]}" font-size="7">${i}</text>`; });
for(const n in porte) s+=`<circle cx="${porte[n][0]}" cy="${porte[n][1]}" r="2.5"/>`;
s+='<circle cx="0" cy="0" r="4" fill="red"/></svg>';
fs.writeFileSync(qui('./pianta.svg'),s);
console.log('fiume',out.fiume.length,'mura',mura.length,'porte',Object.keys(porte).length,'quota max',Math.max(...quote.q));
