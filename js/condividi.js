/* Pulsanti per condividere la pagina: collegamenti semplici ai moduli di condivisione dei social, senza tracciatori né script esterni.
   Si montano in ogni elemento con l'attributo data-condividi (la fascia sotto l'apertura e la colonna che sul desktop sta fissa sul bordo sinistro).
   «Copia il link» copia l'indirizzo pubblico con la tappa corrente (#tappa-22), che js/pagina.js tiene aggiornata in location.hash. */
(function(){
var INDIRIZZO='https://angrisanidj.github.io/caduta-impero/';
var TESTO='Come finisce un impero · L\'Occidente romano dal 235 all\'852 in 51 tappe, con una carta che mostra i cambiamenti dei confini e una ricostruzione di Roma in 3D.';
var u=encodeURIComponent(INDIRIZZO), t=encodeURIComponent(TESTO);
// icone: i segni dei marchi (Simple Icons, CC0) e, per il link, due anelli disegnati a tratto
var RETI=[
  {id:'x', nome:'X', href:'https://x.com/intent/post?text='+t+'&url='+u,
   d:'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'},
  {id:'threads', nome:'Threads', href:'https://www.threads.net/intent/post?text='+t+'%20'+u,
   d:'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z'},
  {id:'facebook', nome:'Facebook', href:'https://www.facebook.com/sharer/sharer.php?u='+u,
   d:'M13.6 22v-8.4h2.85l.45-3.3h-3.3V8.2c0-.95.27-1.6 1.64-1.6h1.75V3.65A23 23 0 0 0 14.44 3.5c-2.53 0-4.26 1.54-4.26 4.37v2.43H7.3v3.3h2.88V22z'},
  {id:'linkedin', nome:'LinkedIn', href:'https://www.linkedin.com/sharing/share-offsite/?url='+u,
   d:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z'},
  {id:'telegram', nome:'Telegram', href:'https://t.me/share/url?url='+u+'&text='+t,
   d:'M21.2 3.3 2.6 10.5c-1.27.5-1.26 1.2-.23 1.52l4.77 1.49 1.84 5.66c.22.62.11.87.77.87.5 0 .73-.23 1.01-.5l2.42-2.35 5.03 3.71c.93.51 1.6.25 1.83-.86l3.3-15.57c.34-1.36-.52-1.97-1.4-1.57zM8.9 13.2l9.4-5.93c.47-.28.9-.13.55.19l-8.05 7.27-.31 3.34z'},
  {id:'whatsapp', nome:'WhatsApp', href:'https://wa.me/?text='+t+'%20'+u,
   d:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'}
];
var ANELLI='<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';

function icona(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+d+'</svg>'; }
function indirizzoTappa(){ return INDIRIZZO+(/^#tappa-\d+$/.test(location.hash)?location.hash:''); }

function monta(ospite){
  var h='<p class="condividi-titolo" id="condividi-'+ospite.getAttribute('data-condividi')+'">Condividi</p><ul class="condividi-tasti" aria-labelledby="condividi-'+ospite.getAttribute('data-condividi')+'">';
  RETI.forEach(function(r){
    h+='<li><a class="tasto t-'+r.id+'" href="'+r.href+'" target="_blank" rel="noopener noreferrer" aria-label="Condividi su '+r.nome+'" title="'+r.nome+'">'+icona('<path d="'+r.d+'"/>')+'</a></li>';
  });
  h+='<li><button type="button" class="tasto t-link" aria-label="Copia il link a questa tappa" title="Copia il link">'+icona('<g class="tratto">'+ANELLI+'</g>')+'</button></li></ul>';
  h+='<span class="condividi-ok" role="status" aria-live="polite"></span>';
  ospite.innerHTML=h;
  var ok=ospite.querySelector('.condividi-ok'), tempo;
  function avvisa(msg){ ok.textContent=msg; ok.classList.add('su'); clearTimeout(tempo); tempo=setTimeout(function(){ ok.classList.remove('su'); },2000); }
  function vecchioModo(testo){
    var a=document.createElement('textarea'), riuscito=false; a.value=testo; a.setAttribute('readonly',''); a.style.position='fixed'; a.style.opacity='0';
    document.body.appendChild(a); a.select(); try{ riuscito=document.execCommand('copy'); }catch(e){} document.body.removeChild(a);
    avvisa(riuscito?'Link copiato':testo);
  }
  ospite.querySelector('.t-link').addEventListener('click',function(){
    var testo=indirizzoTappa();
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(testo).then(function(){ avvisa('Link copiato'); },function(){ vecchioModo(testo); });
    else vecchioModo(testo);
  });
}
[].forEach.call(document.querySelectorAll('[data-condividi]'),monta);
})();
