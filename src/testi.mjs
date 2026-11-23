/* Raccoglie in un solo file tutte le scritte della pagina, per la revisione dell'italiano: node src/testi.mjs  ->  src/testi/scritte.md
   Ogni scritta ha davanti la sua sigla fra parentesi quadre ([T03-260.testo], [scheda.colosseo.cosa]…): chi corregge cambia il testo e lascia la sigla,
   così le correzioni si riportano nei file d'origine confrontando il file corretto con quello generato (git diff).
   Le scritte dell'interfaccia sparse nel codice sono estratte in automatico (ultima sezione) e possono contenere qualche riga che non è una scritta. */
import fs from 'node:fs';
const radice=new URL('../',import.meta.url), leggi=p=>fs.readFileSync(new URL(p,radice),'utf8');
function carica(p,nome){ const w={}; new Function('window',leggi(p))(w); return w[nome]; }
const D=carica('js/dati.js','RM_DATI'), G=carica('js/mappa-dati.js','RM_MAPPA');
const out=[]; let conta=0;
const titolo=(n,t)=>out.push('', '#'.repeat(n)+' '+t, '');
const voce=(id,t)=>{ if(t==null||t==='') return; conta++; out.push('['+id+'] '+String(t).replace(/\s*\n\s*/g,' '), ''); };
const due=n=>String(n).padStart(2,'0');

out.push('# Come finisce un impero · tutte le scritte','',
 'Generato da `src/testi.mjs` il '+new Date().toLocaleString('it-IT')+'.','',
 '**Come correggere.** Ogni scritta sta su una riga e comincia con la sua sigla fra parentesi quadre. Cambia liberamente il testo dopo la sigla; non toccare la sigla e non unire due righe.',
 'Le citazioni («Voci di allora», citazioni degli storici) sono traduzioni da fonti lette: lì conviene ritoccare solo l\'italiano, non il contenuto.',
 'Se una riga va tolta del tutto, lascia la sigla e scrivi `TOGLIERE`. Per un dubbio o una domanda, aggiungi in fondo alla riga `<<nota: …>>`.','');

/* ---- 1. la pagina ---- */
titolo(2,'1. Testata, riquadri fissi e piè di pagina (index.html)');
{ let h=leggi('index.html'); const t=/<title>(.*?)<\/title>/.exec(h), d=/<meta name="description" content="(.*?)"/.exec(h), a=/og:image:alt" content="(.*?)"/.exec(h);
  voce('pagina.titolo',t&&t[1]); voce('pagina.descrizione',d&&d[1]); voce('pagina.immagine',a&&a[1]);
  h=h.slice(h.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'');
  h=h.replace(/<(?:b|i|em|span|a|img)\b[^>]*>|<\/(?:b|i|em|span|a)>/g,'§').replace(/<[^>]+>/g,'\n').replace(/§+/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<');
  let k=0; h.split('\n').map(r=>r.replace(/\s+/g,' ').trim()).filter(r=>/[A-Za-zÀ-ú]{2}/.test(r)).forEach(r=>voce('pagina.'+due(++k),r)); }

/* ---- 2. atti e tappe ---- */
titolo(2,'2. Gli atti');
D.ATTI.forEach(a=>{ voce('atto.'+a.n+'.nome',a.nome); voce('atto.'+a.n+'.sommario',a.sommario); });
titolo(2,'3. Le tappe');
D.TAPPE.forEach((t,i)=>{
  const s='T'+due(i+1)+'-'+t.anno;
  titolo(3,(t.intermezzo?'Intermezzo · ':t.anno+' · ')+t.titolo);
  voce(s+'.titolo',t.titolo); voce(s+'.testo',t.testo);
  (t.protagonisti||[]).forEach((p,k)=>{ voce(s+'.chi'+(k+1)+'.nome',p[0]); voce(s+'.chi'+(k+1)+'.date',p[1]); voce(s+'.chi'+(k+1)+'.riga',p[2]); });
  (t.voci||[]).forEach((v,k)=>{ voce(s+'.voce'+(k+1)+'.testo',v.testo); voce(s+'.voce'+(k+1)+'.chi',v.chi); });
  voce(s+'.leggenda',t.leggenda); voce(s+'.storici',t.storici);
  (t.luoghi||[]).forEach((l,k)=>voce(s+'.luogo'+(k+1)+'.'+l[0],l[1]));
  (t.passi||[]).forEach((q,k)=>{ const p=s+'.passo'+(k+1); voce(p+'.anno',q.b||q.a); voce(p+'.testo',q.t); q.sc.forEach((e,j)=>{ if(e[3]) voce(p+'.freccia'+(j+1),e[3]); }); });      // la carta a passi (PASSI_CARTA)
});

/* ---- 3. cruscotto ed eventi ---- */
titolo(2,'4. Cruscotto');
Object.keys(D.CURVE).forEach(k=>{ const c=D.CURVE[k]; voce('curva.'+k+'.nome',c.nome); voce('curva.'+k+'.nota',c.nota); voce('curva.'+k+'.dopo',c.dopo); });
titolo(2,'5. Eventi sulla scena di Roma (didascalie)');
D.EVENTI.forEach(e=>voce('evento.'+e.id,e.testo));

/* ---- 4. monumenti ---- */
titolo(2,'6. Schede dei monumenti');
const mon=leggi('js/monumenti.js'), nomi={}, note={};
mon.split('\n').forEach(r=>{ const a=/\bid:'([A-Za-z0-9_]+)'/.exec(r), n=/\bnome:(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/.exec(r); if(a&&n) nomi[a[1]]=(n[1]!=null?n[1]:n[2]).replace(/\\'/g,"'");
  const q=/note:\{([^}]*)\}/.exec(r); if(a&&q) note[a[1]]=q[1]; });
const ids=[...new Set([...Object.keys(nomi),...Object.keys(D.SCHEDE),...Object.keys(D.CERTEZZA)])].filter(k=>k!=='provvisorio');
ids.forEach(id=>{
  const sc=D.SCHEDE[id]||{}, ce=D.CERTEZZA[id];
  titolo(3,nomi[id]||id);
  voce('scheda.'+id+'.nome',nomi[id]); voce('scheda.'+id+'.cosa',sc.cosa);
  (sc.date||[]).forEach((r,k)=>{ if(typeof r[0]!=='number') voce('scheda.'+id+'.data'+(k+1)+'.quando',r[0]); voce('scheda.'+id+'.data'+(k+1)+(typeof r[0]==='number'?'-'+r[0]:''),r[1]); });
  if(Array.isArray(ce)) voce('scheda.'+id+'.certezza-'+ce[0],ce[1]);
  if(note[id]) [...note[id].matchAll(/(\w+):(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g)].forEach(m=>voce('scheda.'+id+'.nota-'+m[1],m[2]!=null?m[2]:m[3]));
});
titolo(3,'Chiese minori (solo i nomi)');
voce('chiese.nomi',D.CHIESE.map(c=>c[0]).join(' · '));

/* ---- 5. itinerario ---- */
titolo(2,'7. Il percorso del pellegrino');
(function giro(o,id){ if(typeof o==='string'){ if(/[A-Za-zÀ-ú]{3}/.test(o)) voce(id,o); } else if(Array.isArray(o)) o.forEach((x,k)=>giro(x,id+'.'+(k+1))); else if(o&&typeof o==='object') Object.keys(o).forEach(k=>giro(o[k],id+'.'+k)); })(D.ITINERARIO,'itinerario');

/* ---- 6. perché cadde ---- */
titolo(2,'8. «Perché cadde l\'Occidente?» (js/cause.js)');
{ const c=leggi('js/cause.js'), da=c.indexOf('var TESI=['), a=c.indexOf('\n];',da), TESI=new Function('return '+c.slice(da+9,a+2))();
  TESI.forEach(t=>{ titolo(3,t.chi+' · '+t.titolo);
    Object.keys(t).forEach(k=>{ if(k==='id'||k==='fam') return; const v=t[k];
      if(typeof v==='string') voce('tesi.'+t.id+'.'+k,v);
      else if(Array.isArray(v)) v.forEach((x,j)=>{ if(Array.isArray(x)) x.forEach((y,q)=>{ if(typeof y==='string'&&y) voce('tesi.'+t.id+'.'+k+(j+1)+(typeof x[0]==='number'?'-'+x[0]:'')+(q>1?'.'+q:''),y); }); else if(typeof x==='string') voce('tesi.'+t.id+'.'+k+(j+1),x); }); }); }); }

/* ---- 7. carta ---- */
titolo(2,'9. Nomi sulla carta dell\'Impero (js/mappa-dati.js, da src/mappa/genera.mjs)');
voce('carta.regioni',Object.keys(G.regioni).map(k=>G.regioni[k].nome).join(' · '));
voce('carta.citta',Object.keys(G.citta||{}).map(k=>G.citta[k].nome).join(' · '));
voce('carta.luoghi',Object.keys(G.luoghi||{}).map(k=>G.luoghi[k].nome).join(' · '));
voce('carta.mari',(G.mari||[]).map(m=>m[2]).join(' · '));
voce('carta.popoli',Object.keys(G.popoli||{}).map(k=>[G.popoli[k].nome].concat((G.popoli[k].poi||[]).map(p=>p[1])).join(' / ')).join(' · '));
if(G.verdun) voce('carta.verdun',G.verdun.nomi.map(n=>n[2]).join(' · '));

/* ---- 8. interfaccia, dal codice ---- */
titolo(2,'10. Scritte dell\'interfaccia, estratte in automatico dal codice');
out.push('Bottoni, legende, etichette, messaggi. L\'estrazione è automatica: se una riga non è una scritta che si legge in pagina, ignorala.','');
['pagina','mappa','atti','cause','itinerario','confronto','condividi','eventi','base','vita','mura','nuclei'].forEach(f=>{
  let c; try{ c=leggi('js/'+f+'.js'); }catch(e){ return; }
  if(f==='cause'){ const da=c.indexOf('var TESI=['), a=c.indexOf('\n];',da); c=c.slice(0,da)+c.slice(a); }
  c=c.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/(^|[\s;{}),])\/\/[^\n]*/g,'$1');
  const visti=new Set(); let k=0, primo=true;
  c.split('\n').forEach((r,n)=>{
    [...r.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)].forEach(m=>{
      const s=(m[1]!=null?m[1]:m[2]).replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\u2019/g,'’').trim();
      if(s.length<6||visti.has(s)||/[<>{}=;\\\[\]#_$|^]|px\b|\brgba?\(|https?:|\.js\b|\.css\b/.test(s)) return;
      if(s==='use strict'||/^[.(]/.test(s)||/^xMid/.test(s)||(/^[a-z0-9 .:()-]+$/.test(s)&&/[-.]/.test(s)&&!/\d/.test(s))) return;      // direttive, selettori, elenchi di classi
      const lettere=(s.match(/[A-Za-zÀ-ú]/g)||[]).length, parole=(s.match(/[A-Za-zÀ-ú]{3,}/g)||[]).length;
      if(!/ /.test(s)||parole<2||lettere/s.replace(/\s/g,'').length<.72) return;
      if(/^[a-z-]+( [a-z-]+)+$/.test(s) && !/[àèéìòù]/.test(s) && s.split(' ').every(w=>w.length<9) && /\b(m|as|st|tesi|scheda|legenda|viva|ferma|via|sotto|chiudi|etichetta|spia|stima|riquadro|con|corto|aperto|aperta|scelto|scelta|mira|passata|futura|attivo|grande|zoom)-?\b/.test(s) && parole<4) return;      // elenchi di classi CSS
      visti.add(s); if(primo){ titolo(3,'js/'+f+'.js'); primo=false; } voce('ui.'+f+'.'+due(++k)+'-r'+(n+1),s);
    });
  });
});

fs.mkdirSync(new URL('src/testi/',radice),{recursive:true});
fs.writeFileSync(new URL('src/testi/scritte.md',radice),out.join('\n')+'\n');
console.log(conta+' scritte, '+out.join('\n').length+' caratteri -> src/testi/scritte.md');
