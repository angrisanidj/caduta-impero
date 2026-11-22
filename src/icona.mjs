// Icona: una corona d'alloro dorata su porpora; il ramo destro si dirada e perde foglie.
import fs from 'node:fs';
const cx=256, cy=266, R=162, r=Math.PI/180;
const f=n=>n.toFixed(1);
// foglia: parte dal ramo, punta in fuori; L lunghezza, W larghezza
const foglia=(x,y,ang,L,W,op=1)=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" opacity="${op}"><path d="M0 0Q${f(L*.45)} ${f(-W/2)} ${f(L)} 0Q${f(L*.45)} ${f(W/2)} 0 0Z" fill="url(#oro)"/><path d="M${f(L*.12)} 0L${f(L*.86)} 0" stroke="#9C7426" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>`;
let s='';
// lato: -1 sinistro, +1 destro; t in gradi dal basso
const punto=(lato,t)=>[cx+lato*R*Math.sin(t*r), cy+R*Math.cos(t*r)];
const tang=(lato,t)=>Math.atan2(-Math.sin(t*r), lato*Math.cos(t*r))/r;
const ramo=(lato,da,a)=>{ const p0=punto(lato,da), p1=punto(lato,a); return `<path d="M${f(p0[0])} ${f(p0[1])}A${R} ${R} 0 0 ${lato<0?1:0} ${f(p1[0])} ${f(p1[1])}" fill="none" stroke="#B88E34" stroke-width="10" stroke-linecap="round"/>`; };
s+=ramo(-1,10,164)+ramo(1,10,100);
for(let t=18;t<=164;t+=14.6){
  const k=1-Math.max(0,t-120)/120;                                  // le foglie in cima sono un poco più piccole
  for(const lato of [-1,1]){
    if(lato>0 && t>100) continue;                                   // il ramo destro finisce prima
    const salta=lato>0 && Math.abs(t-76.4)<1;
    const [x,y]=punto(lato,t), a=tang(lato,t);
    const fuori=lato<0?-1:1;                                        // verso di rotazione che porta all'esterno
    const kk=lato>0? k*(t>80?.85:1) : k;
    if(!(salta)) s+=foglia(x,y,a-fuori*36,74*kk,34*kk);             // foglia esterna
    if(!(lato>0 && t>80)) s+=foglia(x,y,a+fuori*32,60*kk,28*kk);    // foglia interna
  }
}
// le foglie cadute dal ramo destro
s+=foglia(338,108,58,62,28,1)+foglia(398,150,96,54,25,.95)+foglia(322,214,128,50,23,.9);
// il nodo in basso
s+=`<path d="M${cx-20} ${cy+R-4}Q${cx} ${cy+R+16} ${cx+20} ${cy+R-4}" fill="none" stroke="#F1D99A" stroke-width="11" stroke-linecap="round"/>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><radialGradient id="fondo" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#A03232"/><stop offset="1" stop-color="#7A2222"/></radialGradient>
<linearGradient id="oro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C99C3E"/><stop offset="1" stop-color="#F1D99A"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#fondo)"/>
${s}
</svg>
`;
fs.writeFileSync(process.argv[2],svg); console.log(svg.length);
