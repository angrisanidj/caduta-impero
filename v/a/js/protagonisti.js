/* Protagonisti della tappa con i loro ritratti (indice in js/ritratti.js, generato da src/immagini/scarica.mjs).
   Ogni riga: miniatura (un bottone che apre la vista grande), nome, date, una riga; sotto, in piccolo, che tipo d'immagine è
   e la riserva, quando c'è, sempre visibili. Chi non ha immagine resta una riga di testo, allineata alle altre.
   La vista grande è un <dialog>: didascalia completa, autore, licenza e pagina del file su Wikimedia Commons;
   si chiude con Esc, col bottone, toccando fuori o col tasto indietro. Se RM_RITRATTI manca, l'elenco è di solo testo. */
(function(){
  'use strict';
  var TIPI={      // parole brevi accanto alla miniatura e spiegazione nella vista grande
    coevo:{breve:'Ritratto del tempo',lungo:'Immagine fatta al suo tempo.'},
    posteriore:{breve:'Immagine più tarda',lungo:'Immagine fatta dopo il suo tempo: non lo ritrae dal vero.'},
    ricostruzione:{breve:'Ricostruzione',lungo:'Immagine generata oggi, a partire dalle fonti: abiti e oggetti seguono testimonianze del suo tempo, il volto è immaginario.'},
    oggetto:{breve:'Non è un ritratto',lungo:'Non ne mostra il volto: è un oggetto legato a lui (una moneta col suo nome, un sigillo, un’iscrizione, un’opera). Che cosa sia, e di quando, lo dice la didascalia.'}
  };
  var LARGA=84, ALTA=64;      // misure massime della miniatura sul PC; sul telefono le riduce css/ritratti.css

  function el(tag,cls,testo){ var e=document.createElement(tag); if(cls) e.className=cls; if(testo!=null) e.textContent=testo; return e; }
  function ritratto(anno,nome){ var R=window.RM_RITRATTI; var r=R && R[anno+'|'+nome]; return r && r.f ? r : null; }

  /* misure della miniatura: alta 64 e larga quanto chiede l'immagine, fino a 84; le immagini molto alte sono tagliate (dall'alto) a 48 */
  function misure(r){
    var q=(r.w||1)/(r.h||1), l=Math.max(48,Math.min(LARGA,Math.round(ALTA*q))), a=Math.min(ALTA,Math.round(l/q));
    return {l:l,a:a,taglia:q<.75};
  }

  /* la riga piccola sotto il testo: segno e tipo, poi la riserva */
  function nota(r,cls){
    var p=el('p',cls||'rit-nota'), t=TIPI[r.tipo]||TIPI.coevo, s=el('span','rit-tipo rit-'+(TIPI[r.tipo]?r.tipo:'coevo'));
    s.appendChild(el('i','rit-segno')).setAttribute('aria-hidden','true'); s.appendChild(document.createTextNode(t.breve)); p.appendChild(s);
    if(r.riserva){ var v=el('span','rit-riserva'); v.appendChild(el('i','rit-attento','!')).setAttribute('aria-hidden','true'); v.appendChild(el('span','sr','Con riserva: ')); v.appendChild(document.createTextNode(r.riserva)); p.appendChild(v); }
    return p;
  }

  function vuoto(){ var s=el('span','rit-vuoto','nessuna immagine'); return s; }

  /* ---------- l'elenco ---------- */
  function elenco(ul,chi,anno){
    ul.textContent='';
    var conImmagini=chi.some(function(p){ return ritratto(anno,p[0]); });
    ul.classList.toggle('con-ritratti',conImmagini);
    var nota0=document.getElementById('tChiNota'); if(nota0) nota0.hidden=!conImmagini;
    chi.forEach(function(p){
      var li=el('li','prot'), r=conImmagini && ritratto(anno,p[0]);
      if(conImmagini){
        var col=el('div','rit-col');
        if(r){
          var m=misure(r), b=el('button','rit-mini'+(m.taglia?' rit-taglia':'')), img=el('img');
          b.type='button'; b.setAttribute('aria-haspopup','dialog');
          img.src=r.f; img.width=m.l; img.height=m.a; img.loading='lazy'; img.decoding='async';
          img.alt=p[0]+': '+r.cosa; img.style.setProperty('--l',m.l); img.style.setProperty('--a',m.a);
          img.addEventListener('error',function(){ col.textContent=''; col.appendChild(vuoto()); var n=li.querySelector('.rit-nota'); if(n) n.remove(); });      // file mancante: la riga torna di solo testo
          b.appendChild(img); b.appendChild(el('span','sr',' (ingrandisci, con fonte e licenza)'));
          b.addEventListener('click',function(){ apri(p,r,b); });
          col.appendChild(b);
        } else col.appendChild(vuoto());
        li.appendChild(col);
      }
      var testo=el('div','prot-testo'), riga=el('p','prot-riga');
      riga.appendChild(el('b',null,p[0])); riga.appendChild(el('span','date',p[1]||''));      /* anche senza date: lo span porta lo stacco e il punto fra nome e riga */
      riga.appendChild(document.createTextNode(p[2]||'')); testo.appendChild(riga);
      if(r) testo.appendChild(nota(r));
      li.appendChild(testo); ul.appendChild(li);
    });
  }

  /* ---------- la vista grande ---------- */
  var vista=null, chiDa=null, inStoria=false;
  function costruisci(){
    vista=el('dialog','rit-vista'); vista.id='ritVista'; vista.setAttribute('aria-labelledby','ritVistaNome');
    vista.innerHTML='<button type="button" class="rit-chiudi" aria-label="Chiudi">✕</button>'+
      '<figure><div class="rit-grande"><img alt=""></div><figcaption>'+
      '<p class="rit-nome"><b id="ritVistaNome"></b><span class="date"></span></p>'+
      '<p class="rit-cosa"></p><div class="rit-dove"></div>'+
      '<p class="rit-credito"></p><p class="rit-link"></p></figcaption></figure>';
    document.body.appendChild(vista);
    vista.querySelector('.rit-chiudi').addEventListener('click',function(){ chiudi(); });
    vista.addEventListener('click',function(e){ if(e.target===vista) chiudi(); });      // tocco sul velo, fuori dal riquadro
    vista.addEventListener('cancel',function(e){ e.preventDefault(); chiudi(); });      // Esc
    vista.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Escape'){ e.preventDefault(); chiudi(); } });      // le frecce non cambiano tappa mentre la vista è aperta
    window.addEventListener('popstate',function(){ if(inStoria){ inStoria=false; if(vista.open) chiudi(true); } });
  }
  function apri(p,r,da){
    if(!vista) costruisci();
    if(typeof vista.showModal!=='function'){ window.open(r.pagina,'_blank','noopener'); return; }      // browser senza <dialog>: almeno la pagina di Commons
    chiDa=da;
    var img=vista.querySelector('.rit-grande img'); img.src=r.f; img.width=r.w; img.height=r.h; img.alt=p[0]+': '+r.cosa;
    vista.querySelector('#ritVistaNome').textContent=p[0]; vista.querySelector('.rit-nome .date').textContent=p[1]||'';
    vista.querySelector('.rit-cosa').textContent=r.cosa.charAt(0).toUpperCase()+r.cosa.slice(1)+'.';
    var dove=vista.querySelector('.rit-dove'); dove.textContent='';
    var n=nota(r,'rit-nota rit-nota-grande'), t=TIPI[r.tipo]||TIPI.coevo; n.querySelector('.rit-tipo').appendChild(el('span','rit-spiega',' · '+t.lungo));
    if(r.riserva){ var v=n.querySelector('.rit-riserva'); n.removeChild(v); dove.appendChild(n); v.className='rit-riserva riquadro-riserva'; dove.appendChild(v); }
    else dove.appendChild(n);
    vista.querySelector('.rit-credito').textContent=r.credito||'';
    var l=vista.querySelector('.rit-link'); l.textContent='';
    var a=el('a',null,r.tipo==='ricostruzione'?'Le fonti della ricostruzione':'Il file su Wikimedia Commons'); a.href=r.pagina; a.target='_blank'; a.rel='noopener'; l.appendChild(a);
    if(r.licenzaUrl){ l.appendChild(document.createTextNode(' · ')); var b=el('a',null,'Licenza '+r.licenza); b.href=r.licenzaUrl; b.target='_blank'; b.rel='noopener license'; l.appendChild(b); }
    vista.showModal(); vista.querySelector('.rit-chiudi').focus();
    try{ history.pushState({ritratto:1},''); inStoria=true; }catch(e){}      // il tasto indietro chiude la vista invece di lasciare la pagina
  }
  function chiudi(daStoria){
    if(!vista || !vista.open) return;
    vista.close();
    if(!daStoria && inStoria){ inStoria=false; try{ if(history.state && history.state.ritratto) history.back(); }catch(e){} }      // se intanto la riproduzione ha cambiato tappa (replaceState in js/pagina.js), non si torna indietro
    if(chiDa && document.contains(chiDa)) chiDa.focus();
    chiDa=null;
  }

  window.RM_protagonisti={elenco:elenco};
})();
