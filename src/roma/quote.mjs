/* Scarica le quote del terreno (SRTM 30 m, via api.opentopodata.org) su una griglia attorno a Roma.
   Uso: node quote.mjs   → scrive grezzi/quote.json  {lat0, lon0, dLat, dLon, righe, colonne, q:[...]}  (riga 0 = sud) */
import fs from 'node:fs';
const LAT0=41.850, LAT1=41.936, LON0=12.432, LON1=12.538, COL=74, RIG=80;
const dLat=(LAT1-LAT0)/(RIG-1), dLon=(LON1-LON0)/(COL-1), punti=[];
for(let r=0;r<RIG;r++) for(let c=0;c<COL;c++) punti.push([LAT0+r*dLat, LON0+c*dLon]);
const q=new Array(punti.length).fill(null), attesa=ms=>new Promise(f=>setTimeout(f,ms));
for(let i=0;i<punti.length;i+=100){
  const lotto=punti.slice(i,i+100), url='https://api.opentopodata.org/v1/srtm30m?locations='+lotto.map(p=>p[0].toFixed(5)+','+p[1].toFixed(5)).join('|');
  for(let prova=0;prova<4;prova++){
    try{
      const r=await fetch(url,{headers:{'User-Agent':'caduta-impero-infografica/0.1'}}), j=await r.json();
      if(j.status!=='OK') throw new Error(j.error||j.status);
      j.results.forEach((e,k)=>{ q[i+k]=e.elevation; }); break;
    }catch(e){ console.error('lotto',i,'tentativo',prova,String(e)); await attesa(2500); }
  }
  await attesa(1100);
}
fs.writeFileSync(new URL('./grezzi/quote.json',import.meta.url),JSON.stringify({lat0:LAT0,lon0:LON0,dLat,dLon,righe:RIG,colonne:COL,q}));
console.log('punti',q.length,'mancanti',q.filter(v=>v==null).length,'min',Math.min(...q.filter(v=>v!=null)),'max',Math.max(...q.filter(v=>v!=null)));
