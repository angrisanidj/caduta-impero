/* Pianta di controllo dei dati grezzi: scrive pianta.svg (mura per nome, Tevere, porte). Solo per verifica. */
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('./grezzi/osm1.json',import.meta.url),'utf8')).elements;
const X=lon=>(lon-12.4853)*8287, Z=lat=>-(lat-41.8925)*11113.2;
const COL={'Mura Aureliane':'#c0392b','(senza nome)':'#2980b9','Mura gianicolensi':'#27ae60','Mura Serviane':'#8e44ad'};
let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-420 -420 840 880" style="background:#f4ecdc">';
for(const e of d){
  if(!e.geometry) continue; const t=e.tags||{};
  const p=e.geometry.map(g=>X(g.lon).toFixed(1)+','+Z(g.lat).toFixed(1)).join(' ');
  if(t.waterway) s+=`<polyline points="${p}" fill="none" stroke="#5f8a8c" stroke-width="5"/>`;
  else if(t.historic!=='city_gate'){ const n=t.name||'(senza nome)'; s+=`<polyline points="${p}" fill="none" stroke="${t.historic==='castle_wall'?'#f39c12':(COL[n]||'#000')}" stroke-width="2.2"/>`; }
}
for(const e of d){ const t=e.tags||{}; if(t.historic!=='city_gate') continue;
  const lat=e.lat??(e.bounds.minlat+e.bounds.maxlat)/2, lon=e.lon??(e.bounds.minlon+e.bounds.maxlon)/2;
  s+=`<circle cx="${X(lon).toFixed(1)}" cy="${Z(lat).toFixed(1)}" r="3"/><text x="${(X(lon)+5).toFixed(1)}" y="${Z(lat).toFixed(1)}" font-size="9">${(t.name||'').replace('Porta ','P.')}</text>`; }
s+='<circle cx="0" cy="0" r="4" fill="red"/><text x="6" y="4" font-size="10" fill="red">Foro</text></svg>';
fs.writeFileSync(new URL('./pianta.svg',import.meta.url),s);
console.log('ok');
