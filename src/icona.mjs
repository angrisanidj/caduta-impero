/* Icona della pagina, nella famiglia di quella del Senato: quadrato arrotondato color vino, filo d'oro e un segno dorato fatto di forme semplici.
   Tre proposte:
     occaso  — il sole che cala sull'orizzonte: «Occidente» viene da occidere, cadere, tramontare;
     mura    — Roma vista dall'alto, come nella scena 3D: il giro delle mura aureliane e l'ansa del Tevere (tracciati veri, da js/roma-topo.js);
     colonne — sei colonne, una per atto, alte quanto gli abitanti stimati di Roma all'inizio dell'atto (CURVE.popolazione in js/dati.js).
   Uso (dalla cartella del progetto):
     node src/icona.mjs            scrive img/icona.svg, img/icona-180.png e img/icona-48.png con la proposta scelta (SCELTA)
     node src/icona.mjs --prove    scrive anche prove/icone.png: le tre proposte a 180 punti e, sotto, a 48, 32 e 16
   I PNG si fanno con Edge senza finestra (resa a 512 punti) e Python con PIL (riduzione). */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const SCELTA = 'occaso';
const radice = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const f = n => (+n.toFixed(2)).toString();

/* ---- fondo e cornice comuni ---- */
function cornice(segno, pieno) {
  // pieno: per l'icona dei telefoni (180), che il sistema arrotonda da sé: il fondo riempie tutto il quadrato
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><radialGradient id="v" cx="18%" cy="0%" r="140%"><stop offset="0" stop-color="#7E2230"/><stop offset=".5" stop-color="#4A1119"/><stop offset="1" stop-color="#2A080D"/></radialGradient>
<linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0C4"/><stop offset=".55" stop-color="#E8C466"/><stop offset="1" stop-color="#C08F30"/></linearGradient></defs>
<rect width="64" height="64"${pieno ? '' : ' rx="13"'} fill="url(#v)"/>
<rect x="2.5" y="2.5" width="59" height="59" rx="10.5" fill="none" stroke="#C99A3A" stroke-width="1.6"/>
${segno}
</svg>
`;
}

/* ---- A. occaso ---- */
function occaso() {
  // il sole mezzo calato e, davanti, la fronte di un tempio in controluce (quattro colonne, timpano, gradini)
  const cx = 32, cy = 43, r = 19, buio = '#2E0A10';
  const col = [21.2, 27.6, 34, 40.4].map(x => `<rect x="${f(x - 1.6)}" y="33.6" width="3.2" height="6.4"/>`).join('');
  return `<g transform="translate(32 33.4) scale(1.12) translate(-32 -40.2)"><path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" fill="url(#o)"/>
<g fill="${buio}"><path d="M32 26.6L45.2 31.6H18.8Z"/><rect x="18.8" y="31.6" width="26.4" height="2.2"/>${col}<rect x="18" y="40" width="28" height="1.6"/><rect x="16.6" y="41.4" width="30.8" height="1.6"/></g>
<rect x="7" y="${cy}" width="50" height="2.8" rx="1.4" fill="#D4AE55"/>
<rect x="18" y="${cy + 6.2}" width="28" height="2.4" rx="1.2" fill="#D4AE55" opacity=".7"/>
<rect x="25" y="${cy + 11.4}" width="14" height="2.2" rx="1.1" fill="#D4AE55" opacity=".45"/></g>`;
}

/* ---- B. mura e Tevere ---- */
function semplifica(p, tol) {                         // Douglas-Peucker
  if (p.length < 3) return p;
  const [a, b] = [p[0], p[p.length - 1]];
  let imax = 0, dmax = 0;
  for (let i = 1; i < p.length - 1; i++) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const d = Math.abs(dy * p[i][0] - dx * p[i][1] + b[0] * a[1] - b[1] * a[0]) / L;
    if (d > dmax) { dmax = d; imax = i; }
  }
  if (dmax <= tol) return [a, b];
  return semplifica(p.slice(0, imax + 1), tol).slice(0, -1).concat(semplifica(p.slice(imax), tol));
}
function mura() {
  globalThis.window = {};
  eval(fs.readFileSync(path.join(radice, 'js/roma-topo.js'), 'utf8'));
  const T = globalThis.window.RM_TOPO;
  const xs = T.mura.map(p => p[0]), zs = T.mura.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const k = 42 / Math.max(x1 - x0, z1 - z0), ox = 32 - (x0 + x1) / 2 * k, oz = 32.5 - (z0 + z1) / 2 * k;
  const P = q => [ox + q[0] * k, oz + q[1] * k];
  // il giro delle mura, sfoltito e ammorbidito (due passate di Chaikin) perché a 16 punti resti una forma netta
  const liscia = (a, chiuso) => { let p = a; for (let n = 0; n < 2; n++) { const q = []; const m = chiuso ? p.length : p.length - 1;
    if (!chiuso) q.push(p[0]);
    for (let i = 0; i < m; i++) { const A = p[i], B = p[(i + 1) % p.length]; q.push([A[0] * .75 + B[0] * .25, A[1] * .75 + B[1] * .25], [A[0] * .25 + B[0] * .75, A[1] * .25 + B[1] * .75]); }
    if (!chiuso) q.push(p[p.length - 1]); p = q; } return p; };
  const giro = liscia(semplifica(T.mura.map(P), 1.6), true);
  // il fiume: solo il tratto che passa vicino alle mura, poco oltre il loro giro
  const fiume = liscia(semplifica(T.fiume.map(P).filter(q => q[1] > 8 && q[1] < 56 && q[0] > 6 && q[0] < 58), 1), false);
  const d = a => a.map((q, i) => (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1])).join('');
  return `<path d="${d(giro)}Z" fill="#5E1622" stroke="url(#o)" stroke-width="2.8" stroke-linejoin="round"/>
<path d="${d(fiume)}" fill="none" stroke="#A9CDD2" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* ---- C. sei colonne ---- */
function colonne() {
  // abitanti stimati all'inizio di ogni atto (235, 284, 395, 439, 476, 590), interpolati da CURVE.popolazione:
  // 900.000, 825.000, 750.000, 470.000, 250.000, 45.000
  const ab = [900, 825, 750, 470, 250, 45], H = 33, base = 50;
  let s = `<rect x="8" y="${base}" width="48" height="2.8" rx="1" fill="#D4AE55"/>`;
  ab.forEach((n, i) => {
    const cx = 13 + i * 7.6, h = Math.max(3, H * n / 900), y = base - h;
    s += `<rect x="${f(cx - 2.2)}" y="${f(y)}" width="4.4" height="${f(h)}" fill="url(#o)"/>`;
    if (h > 6) s += `<rect x="${f(cx - 3.3)}" y="${f(y - 1)}" width="6.6" height="2.2" rx=".6" fill="#F1D99A"/>`;
  });
  return s;
}

const PROPOSTE = { occaso, mura, colonne };

/* ---- resa in PNG ---- */
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
function rendi(svgFile, pngFile, lato) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'icona-'));
  execFileSync(edge, ['--headless=new', '--hide-scrollbars', `--screenshot=${pngFile}`, `--window-size=${lato},${lato}`,
    '--default-background-color=00000000', `--user-data-dir=${dir}`, 'file:///' + svgFile.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.rmSync(dir, { recursive: true, force: true });
}
function python(codice) { execFileSync('python', ['-c', codice], { stdio: 'inherit' }); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'icone-'));
const grandi = {};
for (const [nome, fn] of Object.entries(PROPOSTE)) {
  const segno = fn();
  for (const pieno of [false, true]) {
    const svg = path.join(tmp, `${nome}${pieno ? '-pieno' : ''}.svg`);
    fs.writeFileSync(svg, cornice(segno, pieno).replace('<svg ', '<svg width="512" height="512" '));
    rendi(svg, path.join(tmp, `${nome}${pieno ? '-pieno' : ''}.png`), 512);
  }
  grandi[nome] = path.join(tmp, `${nome}.png`);
  if (nome === SCELTA) {
    fs.writeFileSync(path.join(radice, 'img/icona.svg'), cornice(segno, false));
    python(`from PIL import Image
a=Image.open(r'${path.join(tmp, nome + '-pieno.png')}').convert('RGBA').resize((180,180),Image.LANCZOS); a.convert('RGB').save(r'${path.join(radice, 'img/icona-180.png')}',optimize=True)
b=Image.open(r'${grandi[nome]}').convert('RGBA').resize((48,48),Image.LANCZOS); b.save(r'${path.join(radice, 'img/icona-48.png')}',optimize=True)`);
    console.log('scelta:', nome, '→ img/icona.svg, img/icona-180.png, img/icona-48.png');
  }
}

if (process.argv.includes('--prove')) {
  fs.mkdirSync(path.join(radice, 'prove'), { recursive: true });
  const elenco = Object.keys(PROPOSTE).map(n => `(r'${grandi[n]}','${n}')`).join(',');
  python(`from PIL import Image, ImageDraw, ImageFont
voci=[${elenco}]
W=3*260+40; H=420
foglio=Image.new('RGB',(W,H),(246,243,238)); d=ImageDraw.Draw(foglio)
try: fnt=ImageFont.truetype('segoeui.ttf',20); pic=ImageFont.truetype('segoeui.ttf',14)
except: fnt=pic=ImageFont.load_default()
for i,(p,n) in enumerate(voci):
    x=40+i*260; im=Image.open(p).convert('RGBA')
    foglio.paste(im.resize((180,180),Image.LANCZOS),(x,30),im.resize((180,180),Image.LANCZOS))
    d.text((x,222),('ABC'[i])+'. '+n,fill=(43,36,32),font=fnt)
    xx=x
    for s in (48,32,16):
        t=im.resize((s,s),Image.LANCZOS); foglio.paste(t,(xx,270+(48-s)),t); xx+=s+16
    # le stesse a 32 e 16 su fondo scuro, come in una scheda del browser in tema scuro
    d.rectangle((x-6,336,x+186,392),fill=(32,33,36))
    xx=x
    for s in (32,16):
        t=im.resize((s,s),Image.LANCZOS); foglio.paste(t,(xx,348+(32-s)),t); xx+=s+16
    d.text((x,398),'48 · 32 · 16, e su fondo scuro',fill=(101,91,81),font=pic)
foglio.save(r'${path.join(radice, 'prove/icone.png')}')`);
  console.log('foglio di confronto → prove/icone.png');
}
fs.rmSync(tmp, { recursive: true, force: true });
