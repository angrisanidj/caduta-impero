/* Monumenti: restano della stessa grandezza per tutta la storia, cambia solo il loro stato.
   La storia di quelli in elenco (uso | chiuso | spogliato | assente) sta in dati.js; gli altri sono comparse.
   Ogni monumento è una sola maglia costruita in coordinate locali (fronte verso +z, salvo rotazione). */
(function(){
'use strict';
var RM=window.RM; if(!RM||RM.guasto) return;
var D=window.RM_DATI, P=RM.P, PI=Math.PI;
var TINTA={ uso:new THREE.Color(1,1,1), chiuso:RM.col(0xb5ad9e), spogliato:RM.col(0x8c7e70), bruciato:RM.col(0x6f655c), crollato:RM.col(0xa69d90), cava:RM.col(0xa39584), assente:new THREE.Color(1,1,1) };

/* ---------- elementi ricorrenti ---------- */
function arcato(B,w,h,d,x,y,z,col,livelli,n){            // corpo con file di arcate sui lati lunghi
  B.scatola(w,h,d,x,y,z,col);
  for(var l=0;l<livelli;l++){ var yy=y+h*(l+.14)/livelli, hh=h/livelli*.6;
    B.aperture(x-w/2,z+d/2,x+w/2,z+d/2,n,yy,hh).aperture(x+w/2,z-d/2,x-w/2,z-d/2,n,yy,hh); }
  return B;
}
function basilica(B,w,d,h,x,z,tetto){                    // basilica civile a due ordini, navata rialzata
  arcato(B,w,h,d,x,0,z,P.travertino,2,Math.round(w/1.1));
  B.scatola(w*.92,h*.4,d*.46,x,h,z,P.marmo).falde(w*.92,h*.24,d*.5,x,h*1.4,z,tetto||P.coppi);
}
function portico(B,w,d,x,y,z,h,suolo){                   // piazza porticata
  var nx=Math.max(3,Math.round(w/.95)), nz=Math.max(3,Math.round(d/.95)), m=.65, r=.09, a=y+.1;
  B.scatola(w,.1,d,x,y,z,suolo||P.selce);
  B.colonne(x-w/2+m,z-d/2+m,x+w/2-m,z-d/2+m,nx,h,r,a).colonne(x-w/2+m,z+d/2-m,x+w/2-m,z+d/2-m,nx,h,r,a)
   .colonne(x-w/2+m,z-d/2+m,x-w/2+m,z+d/2-m,nz,h,r,a).colonne(x+w/2-m,z-d/2+m,x+w/2-m,z+d/2-m,nz,h,r,a);
  B.scatola(w,.14,m+.4,x,a+h,z-d/2+m/2+.1,P.coppi).scatola(w,.14,m+.4,x,a+h,z+d/2-m/2-.1,P.coppi)
   .scatola(m+.4,.14,d-2*m,x-w/2+m/2+.1,a+h,z,P.coppi).scatola(m+.4,.14,d-2*m,x+w/2-m/2-.1,a+h,z,P.coppi);
  B.scatola(w,h+.35,.14,x,y,z-d/2,P.tufo).scatola(.14,h+.35,d,x-w/2,y,z,P.tufo).scatola(.14,h+.35,d,x+w/2,y,z,P.tufo);
}
function circo(B,L,W,h,spina){                           // circo o stadio: gradinate, fornici, pista
  var pr=function(w){ return RM.stadio(L-(W-w),w,26,14); }, est=pr(W), cima=pr(W-1.3), pista=pr(W*.62);
  var asse=pista.map(function(p){ return [Math.max(-L/2+4,Math.min(L/2-W/2,p[0])),0]; });
  B.striscia(est,0,est,h,P.travertino).striscia(est,h,cima,h,P.travertino).striscia(cima,h,cima,h-.3,P.travertino)
   .striscia(cima,h-.3,pista,.45,P.tufo).striscia(pista,.45,pista,.12,P.travertino).striscia(pista,.12,asse,.12,P.sabbia);
  B.fornici(est,.15,h*.36,.5,1,false).fornici(est,h*.56,h*.28,.4,1,false).aperture(-L/2,-W/2+1,-L/2,W/2-1,12,.15,h*.4);
  if(spina){
    B.scatola(L*.56,.4,.8,-1,.12,0,P.travertino).scatola(.5,.3,.5,-1,.52,0,P.marmo).cilindro(.17,2.4,-1,.82,0,P.sabbia,.1,4).cono(.1,.2,-1,3.22,0,P.oro,4);      // la spina con l'obelisco di Augusto (oggi in piazza del Popolo)
    [-1,1].forEach(function(s2){ B.colonne(-1+s2*L*.12-.4,0,-1+s2*L*.12+.4,0,2,.9,.05,.52).scatola(1,.08,.2,-1+s2*L*.12,1.42,0,P.marmo); B.cilindro(.5,.12,-1+s2*L*.2,.52,0,P.acqua,null,10); });      // i contagiri (le uova e i delfini) e le vasche
    [-1,1].forEach(function(s){ for(var k=0;k<3;k++) B.cono(.16,.8,-1+s*(L*.28+.6),.12,(k-1)*.36,P.oro,8); });
    B.scatola(4,h+1,1.6,-4,0,-W/2+.2,P.marmo).falde(4,.7,1.8,-4,h+1,-W/2+.2,P.coppi);          // pulvinar, lato del Palatino
  }
}
function teatro(B,r,h,tre){                              // cavea a semicerchio verso +z, scena a -z; tre: un terzo ordine di arcate in facciata
  var est=RM.ellisse(r,r,22,0,PI), int=RM.ellisse(r*.9,r*.9,22,0,PI), orc=RM.ellisse(r*.3,r*.3,22,0,PI), cen=orc.map(function(){ return [0,0]; });
  B.striscia(est,0,est,h,P.travertino,false).striscia(est,h,int,h,P.travertino,false).striscia(int,h,orc,.3,P.tufo,false).striscia(orc,.3,cen,.3,P.marmo,false);
  B.fornici(est,.15,h*.3,.5,1,false).fornici(est,h*.44,h*.26,.45,1,false);
  if(tre) B.fornici(est,h*.76,h*.17,.4,1,false);
  B.scatola(r*2,h*1.05,r*.24,0,0,-r*.12,P.travertino).aperture(-r*.9,0,r*.9,0,9,.4,h*.5).scatola(r*1.4,.35,r*.3,0,0,r*.15,P.marmo);
  [0,1].forEach(function(l){ B.colonne(-r*.66,.07,r*.66,.07,10,h*.36,.05,.35+l*h*.4).scatola(r*1.36,.07,.16,0,.35+l*h*.4+h*.36,.07,P.marmo); });      // la fronte della scena: due ordini di colonne
  B.aperture(r*.9,-r*.24,-r*.9,-r*.24,9,.2,h*.42);                                                                                                   // gli archi sul retro della scena
}
/* o (facoltativo): lc e pc, larghezza e profondità del corpo centrale; zc, dove sta il suo centro; rc, raggio del caldarium; recinto:false per le terme senza peribolo.
   Dal 23 novembre 2026 le grandi terme non escono più tutte dallo stesso stampo (fonti lette: Platner e Ashby, Thermae Diocletiani e Thermae Antoninianae):
   caldarium:'rettangolo' (Diocleziano: «the rectangular caldarium, which projected south-westwards»); tepidarium:'tondo' («the circular tepidarium»);
   rotonde:true (due sale circolari «at the west and south angles of the peribolus», una è San Bernardo); stadio:true (Caracalla: al centro del lato sud-ovest «rows of seats,
   with a curve at each end», e dietro, più in alto, le cisterne, «sixty-four vaulted chambers in two stories and in two rows»); esedreLati:true (Caracalla: «two huge exedrae»;
   Platner non dice su quali lati: qui stanno sui due fianchi, come nelle piante correnti). Raggi, altezze e numero dei gradini sono indicativi. */
function terme(B,L,Pd,o){                                 // recinto con giardini, corpo centrale a volte, caldarium a sud (+z)
  o=o||{}; var s=.7, a=1.5, zc=o.zc==null?-Pd*.05:o.zc, lc=o.lc||L*.64, cd=o.pc||Pd*.3, rc=o.rc||L*.085, zk=zc+cd/2+Pd*.05;
  if(o.recinto!==false){
  B.scatola(L-1,.08,Pd-1,0,0,0,P.prato);
  arcato(B,L,a,s,0,0,-Pd/2,P.mattone,1,Math.round(L/1.6));
  B.scatola(s,a,Pd,-L/2,0,0,P.mattone).scatola(s,a,Pd,L/2,0,0,P.mattone);
  if(o.stadio){                                                                                  // Caracalla: gradinata e cisterne al centro del lato di fondo
    var ws=L*.42, zf=Pd/2-Pd*.07-.2, gs;
    arcato(B,L,a,s,0,0,Pd/2,P.mattone,1,Math.round(L/1.6));
    B.scatola(ws,2.2,Pd*.07,0,0,Pd/2-Pd*.035-.2,P.mattone);                                      // le cisterne: due file di camere su due piani
    [.2,1.25].forEach(function(y){ B.aperture(ws/2,zf,-ws/2,zf,16,y,.75); });
    for(gs=0;gs<4;gs++) B.scatola(ws*.86,.9-.22*gs,.42,0,0,zf-.21-.42*gs,P.travertino);          // le file di sedili, verso il giardino
    [-1,1].forEach(function(k){ var cu=RM.ellisse(1.7,1.7,8,0,PI).map(function(q){ return [k*(ws*.43+q[1]*.8),zf-.84+q[0]*-.5]; });      // la curva a ciascun capo
      B.striscia(cu,0,cu,.5,P.travertino,false); });
  } else {
    arcato(B,L*.36,a,s,-L*.32,0,Pd/2,P.mattone,1,8); arcato(B,L*.36,a,s,L*.32,0,Pd/2,P.mattone,1,8);
    var es=RM.ellisse(L*.15,L*.12,16,0,PI).map(function(p){ return [p[0],p[1]+Pd/2]; });         // esedra del recinto
    B.striscia(es,0,es,a+.3,P.mattone,false).fornici(es,.2,.8,.5,1,false);
  }
  if(o.esedreLati) [-1,1].forEach(function(k){ var el=RM.ellisse(Pd*.17,L*.085,14,0,PI).map(function(q){ return [k*(L/2+q[1]),q[0]]; });
    B.striscia(el,0,el,a+.5,P.mattone,false).fornici(el,.2,.9,.5,1,false); });
  if(o.rotonde) [-1,1].forEach(function(k){ B.cilindro(1.15,1.7,k*(L/2-.6),0,Pd/2-.6,P.mattone,null,16).cupola(1.15,k*(L/2-.6),1.7,Pd/2-.6,P.intonaco,.55); });
  }
  arcato(B,lc,2.3,cd,0,0,zc,P.intonaco,2,Math.round(o.lc?lc*.78:L*.5));                                   // corpo centrale: i muri di mattoni erano coperti di intonaco
  B.scatola(L*.2,3.7,Pd*.17,0,0,zc,P.intonaco);                                                   // frigidarium, a tre crociere
  for(var i=-1;i<=1;i++) B.falde(Pd*.19,.8,L*.066,i*L*.066,3.7,zc,P.coppi,PI/2,P.intonaco);
  B.falde(L*.2,.7,Pd*.17,0,3.7,zc,P.coppi,0,P.intonaco);
  B.aperture(-L*.1,zc+Pd*.085,L*.1,zc+Pd*.085,3,2.5,1.05,L*.05).aperture(L*.1,zc-Pd*.085,-L*.1,zc-Pd*.085,3,2.5,1.05,L*.05);      // i finestroni termali, uno per crociera, sopra i tetti delle aule vicine
  [-1,1].forEach(function(k){
    B.scatola(L*.12,2.9,Pd*.26,k*L*.17,0,zc,P.intonaco).volta(Pd*.26,L*.06,k*L*.17,2.9,zc,P.intonaco,PI/2);  // aule laterali
    B.scatola(L*.13,.12,Pd*.2,k*L*.255,2.3,zc-Pd*.02,P.ombra);                                              // palestre a cielo aperto
    if(o.recinto!==false) B.scatola(L*.1,1.9,Pd*.1,k*L*.3,0,Pd*.3,P.mattone).falde(L*.1,.5,Pd*.1,k*L*.3,1.9,Pd*.3,P.coppi);       // biblioteche
  });
  B.scatola(L*.2,.14,Pd*.09,0,2.3,zc-Pd*.11,P.acqua);                                                       // natatio
  if(o.caldarium==='rettangolo'){ var wq=rc*2.5, dq=rc*1.7;                                                // caldarium rettangolare, che sporge dal corpo centrale
    B.scatola(wq,3.1,dq,0,0,zk,P.intonaco).falde(wq+.1,.8,dq+.1,0,3.1,zk,P.coppi,0,P.intonaco);
    B.aperture(-wq/2,zk+dq/2,wq/2,zk+dq/2,3,.5,1.3).aperture(-wq/2,zk+dq/2,wq/2,zk+dq/2,3,2.05,.85);
  } else {
  B.cilindro(rc,3.3,0,0,zk,P.intonaco).cupola(rc,0,3.3,zk,P.intonaco,.62);                                 // caldarium: rotonda a cupola, con le grandi finestre a sud per il sole del pomeriggio
  var cal=RM.ellisse(rc,rc,12,0,PI).map(function(p){ return [p[0],p[1]+zk]; });
  B.fornici(cal,.5,1.1,.5,1,false).fornici(cal,2,.9,.5,1,false);
  }
  if(o.tepidarium==='tondo'){ var zt=(zc+Pd*.085+zk-rc*.85)/2; B.cilindro(L*.045,2.75,0,0,zt,P.intonaco,null,14).cupola(L*.045,0,2.75,zt,P.intonaco,.55); }      // tepidarium circolare, fra l'aula centrale e il caldarium
  else B.scatola(L*.1,2.6,Pd*.08,0,0,zk-Pd*.08,P.intonaco);
}
/* opz (facoltativo): strette = navatelle larghe circa metà della navata, il rapporto delle basiliche a tre navate di Roma (senza opz restano larghe come prima);
   finestre = finestre per lato della navata; atrio:false = niente quadriportico */
function chiesa(B,L,W,transetto,opz){                     // basilica cristiana: navata lungo x, abside a -x, atrio a +x
  opz=opz||{}; var an=opz.strette?W*.2:W*.3, zn=opz.strette?W*.28:W*.33, nf=opz.finestre||Math.round(L/1.1);
  B.scatola(L,2.8,W*.36,0,0,0,P.mattone).falde(L,.9,W*.4,0,2.8,0,P.coppi,0,P.mattone);
  B.aperture(-L/2+.5,W*.18,L/2-.5,W*.18,nf,1.9,.55,.3).aperture(L/2-.5,-W*.18,-L/2+.5,-W*.18,nf,1.9,.55,.3);
  [-1,1].forEach(function(k){ B.scatola(L,1.5,an,0,0,k*zn,P.mattone).scatola(L+.1,.14,an+.02*W,0,1.5,k*zn,P.coppi); });
  B.cilindro(W*.17,2.3,-L/2,0,0,P.mattone,null,14).cono(W*.18,.7,-L/2,2.3,0,P.coppi,14);
  B.vano(L/2+.03,0,0,0,1,.55,1.1).vano(L/2+.03,0,zn,0,1,.36,.8).vano(L/2+.03,0,-zn,0,1,.36,.8).vano(L/2+.03,1.75,0,0,1,.5,.75);      // le tre porte e la finestra della facciata
  if(transetto) B.scatola(2.4,2.8,W*1.25,-L/2+1.6,0,0,P.mattone).falde(W*1.25,.8,2.6,-L/2+1.6,2.8,0,P.coppi,PI/2,P.mattone);
  if(opz.atrio!==false) portico(B,W*.8,W*.8,L/2+W*.4,0,0,1.1);
}
/* basilica a cinque navate (il Laterano, San Paolo): navata lungo x, abside a -x, atrio a +x; tetti a scalare come a San Pietro.
   o: nave e nav = larghezza della navata e di ciascuna navatella; hn, hi, he = altezze di navata, navatelle interne ed esterne; ra = raggio dell'abside;
   transetto = {prof, lung, alto} (navata trasversale continua, alta quanto la navata se alto è vero); ali = {prof, alto} (navatella trasversale bassa in fondo alle navate);
   atrio = {lato, prof} (quadriportico); finestre per lato */
function cinqueNavate(B,L,o){
  var nv=o.nave, a=o.nav, hn=o.hn||2.9, hi=o.hi||2, he=o.he||1.4, nf=o.finestre||Math.round(L/.9), x0=-L/2, zi=nv/2+a/2, ze=nv/2+a*1.5, Wt=nv+4*a;
  B.scatola(L,hn,nv,0,0,0,P.mattone).falde(L,.75,nv+.2,0,hn,0,P.coppi,0,P.mattone);
  B.aperture(x0+.4,nv/2,L/2-.4,nv/2,nf,hi+.25,Math.min(.6,hn-hi-.4),.28).aperture(L/2-.4,-nv/2,x0+.4,-nv/2,nf,hi+.25,Math.min(.6,hn-hi-.4),.28);     // il cleristorio
  [-1,1].forEach(function(k){
    B.scatola(L,hi,a,0,0,k*zi,P.mattone).scatola(L+.06,.12,a+.04,0,hi,k*zi,P.coppi);                      // navatelle interne
    B.scatola(L,he,a,0,0,k*ze,P.mattone).scatola(L+.06,.12,a+.06,0,he,k*ze,P.coppi);                      // navatelle esterne, più basse
    B.aperture(x0+.4,k*Wt/2,L/2-.4,k*Wt/2,nf,.6,.55,.24);
  });
  if(o.transetto){ var t=o.transetto, ht=t.alto?hn:hn*.85;
    B.scatola(t.prof,ht,t.lung,x0+t.prof/2,0,0,P.mattone).falde(t.lung,.7,t.prof+.2,x0+t.prof/2,ht,0,P.coppi,PI/2,P.mattone); }
  if(o.ali) B.scatola(o.ali.prof,o.ali.alto,Wt+.6,x0+o.ali.prof/2,0,0,P.mattone).scatola(o.ali.prof+.06,.12,Wt+.66,x0+o.ali.prof/2,o.ali.alto,0,P.coppi);
  B.cilindro(o.ra,hn*.8,x0,0,0,P.mattone,null,16).cono(o.ra+.05,.6,x0,hn*.8,0,P.coppi,16);
  B.vano(L/2+.03,0,0,0,1,.55,1.1,true); [-1,1].forEach(function(k){ B.vano(L/2+.03,0,k*zi,0,1,.36,.85,true).vano(L/2+.03,0,k*ze,0,1,.34,.8,true); });      // le cinque porte
  [hi+.2,hi+.8].forEach(function(y){ if(y+.5<hn) [-.6,0,.6].forEach(function(z){ B.vano(L/2+.03,y,z*nv/2.4,0,1,.36,.5); }); });                         // finestre in facciata
  if(o.atrio) portico(B,o.atrio.lato,o.atrio.prof,L/2+o.atrio.prof/2,0,0,1.1);
}

/* vani lungo un profilo curvo, sul lato che guarda il punto (cx,cz): servono alle facciate concave, dove C.fornici li metterebbe dietro il muro */
function vaniVerso(B,prof,cx,cz,y,h,quota,quadra){
  for(var i=0;i<prof.length-1;i++){ var a=prof[i], b=prof[i+1], mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz), nx=cx-mx, nz=cz-mz, m=Math.hypot(nx,nz)||1;
    B.vano(mx+nx/m*.07,y,mz+nz/m*.07,dx/L,dz/L,L*(quota||.5),h,quadra); }
}
/* stadio per le gare atletiche: facciata a due ordini di arcate con le loro cornici, due settori di gradinate divisi da un muro, pista senza spina; ingressi al centro dei lati lunghi, sulla curva e sulla testata */
function stadio(B,L,W,h){
  var pr=function(w){ return RM.stadio(L-(W-w),w,26,14); }, est=pr(W), fas=pr(W+.14), cima=pr(W-1.1), mez=pr(W-2.7), pod=pr(W*.52);
  var cen=pod.map(function(p){ return [Math.max(-L/2+3,Math.min(L/2-W/2,p[0])),0]; }), xm=-W/4;
  B.striscia(est,0,est,h,P.travertino).striscia(est,h,cima,h,P.travertino).striscia(cima,h,cima,h-.25,P.travertino)
   .striscia(cima,h-.25,mez,h*.55,P.tufo).striscia(mez,h*.55,mez,h*.55-.3,P.travertino)
   .striscia(mez,h*.55-.3,pod,.45,P.tufo).striscia(pod,.45,pod,.12,P.travertino).striscia(pod,.12,cen,.12,P.sabbia);
  [h*.46,h*.91].forEach(function(y){ B.striscia(fas,y,fas,y+.09,P.marmo).striscia(fas,y+.09,est,y+.09,P.marmo); });
  B.fornici(est,.12,h*.36,.55,1,false).fornici(est,h*.46+.14,h*.33,.5,1,false).aperture(-L/2,-W/2+1.2,-L/2,W/2-1.2,7,.12,h*.38);
  [-1,1].forEach(function(q){ var z=q*(W/2+.22);                                                    // gli avancorpi degli ingressi sui lati lunghi
    B.scatola(2,h*.5,.44,xm,0,z,P.travertino).scatola(2.1,.1,.54,xm,h*.5,z,P.marmo).vano(xm,0,z+q*.24,1,0,.8,h*.4).colonne(xm-.75,z+q*.3,xm+.75,z+q*.3,2,h*.46,.07,0); });
  B.scatola(.44,h*.5,2,L/2+.22,0,0,P.travertino).scatola(.54,.1,2.1,L/2+.22,h*.5,0,P.marmo).vano(L/2+.46,0,0,0,1,.8,h*.4).colonne(L/2+.52,-.75,L/2+.52,.75,2,h*.46,.07,0);      // l'ingresso sulla curva
}
/* San Pietro di Costantino: cinque navate con i tetti a scalare, transetto continuo più basso della navata, abside a ovest (-x), quadriportico con la fontana a est.
   Misure: circa 110 m dalla facciata all'abside, 64 di larghezza, transetto di 90, navata alta poco più di 30 (pianta di Alfarano e scavi; le altezze sono indicative). */
function sanPietro(B){
  var Ln=9.7, xn=.9, xf=5.78;
  B.scatola(Ln,3.3,2.4,xn,0,0,P.mattone).falde(Ln,.75,2.6,xn,3.3,0,P.coppi,0,P.mattone);
  B.aperture(xn-Ln/2+.3,1.2,xn+Ln/2-.3,1.2,11,2.4,.6,.3).aperture(xn+Ln/2-.3,-1.2,xn-Ln/2+.3,-1.2,11,2.4,.6,.3);          // undici finestre per lato sopra i tetti delle navatelle
  [-1,1].forEach(function(k){
    B.scatola(Ln,2.05,1,xn,0,k*1.7,P.mattone).scatola(Ln+.06,.12,1.04,xn,2.05,k*1.7,P.coppi);                            // navatelle interne
    B.scatola(Ln,1.4,1,xn,0,k*2.7,P.mattone).scatola(Ln+.06,.12,1.06,xn,1.4,k*2.7,P.coppi);                              // navatelle esterne, più basse
  });
  B.aperture(xn-Ln/2+.3,3.2,xn+Ln/2-.3,3.2,11,.65,.45,.26).aperture(xn+Ln/2-.3,-3.2,xn-Ln/2+.3,-3.2,11,.65,.45,.26);
  B.scatola(1.8,3,9,-4.85,0,0,P.mattone).falde(9,.7,2,-4.85,3,0,P.coppi,PI/2,P.mattone);                                  // il transetto
  B.aperture(-5.75,1.2,-5.75,4.2,3,1.9,.6,.3).aperture(-5.75,-4.2,-5.75,-1.2,3,1.9,.6,.3).aperture(-5.6,4.5,-4.1,4.5,2,1.9,.6,.3).aperture(-4.1,-4.5,-5.6,-4.5,2,1.9,.6,.3);
  B.cilindro(.9,2.4,-5.75,0,0,P.mattone,null,14).cono(.95,.6,-5.75,2.4,0,P.coppi,14);                                    // l'abside, sopra la tomba
  B.vano(xf,0,0,0,1,.5,1.05,true); [-1,1].forEach(function(k){ B.vano(xf,0,k*.8,0,1,.34,.85,true).vano(xf,0,k*2.2,0,1,.34,.8,true); });      // le cinque porte
  [1.75,2.55].forEach(function(y){ [-.75,0,.75].forEach(function(z){ B.vano(xf,y,z,0,1,.38,.55); }); });                // due file di tre finestre in facciata
  portico(B,5.28,6.2,8.39,0,0,1.1); B.scatola(5.28,1.45,.14,8.39,0,3.1,P.tufo);                                          // il quadriportico
  B.cilindro(.36,.16,8.39,.1,0,P.acqua,null,10).colonne(8.11,-.28,8.67,-.28,2,.7,.04,.1).colonne(8.11,.28,8.67,.28,2,.7,.04,.1).scatola(.78,.08,.78,8.39,.8,0,P.bronzo).cono(.5,.28,8.39,.88,0,P.bronzo,4);      // la fontana sotto il baldacchino di bronzo
  B.scatola(.7,1.7,3.4,11.35,0,0,P.mattone).scatola(.8,.12,3.5,11.35,1.7,0,P.coppi); [-1,0,1].forEach(function(z){ B.vano(11.73,0,z,0,1,.5,1); });      // l'ingresso a tre fornici
  for(var g=0;g<3;g++) B.scatola(.3,.3-.1*g,5.4,11.87+.3*g,0,0,P.travertino);                                            // la gradinata
}
/* Le tegole di bronzo di Onorio I (625-638): «cooperuit ecclesiam omnem ex tegulis aereis quas levavit de templo qui appellatur Romae» (Liber Pontificalis, Onorio I, Duchesne I p. 323).
   Uno strato sottile sopra i tetti di sanPietro, con le stesse misure: compare dal 630 come monumento a parte (tegolepietro). Hanno lo stesso colore dorato che avevano
   sul tempio di Venere e Roma: sono le stesse tegole (23 novembre 2026; prima erano verdi). */
function tegolePietro(B){
  var Ln=9.7, xn=.9, e=.025;
  B.falde(Ln+.04,.75,2.6+.04,xn,3.3+e,0,P.oro,0,P.mattone);
  [-1,1].forEach(function(k){ B.scatola(Ln+.08,.03,1.06,xn,2.17,k*1.7,P.oro).scatola(Ln+.08,.03,1.08,xn,1.52,k*2.7,P.oro); });
  B.falde(9+.04,.7,2+.04,-4.85,3+e,0,P.oro,PI/2,P.mattone).cono(.97,.6,-5.75,2.4+e,0,P.oro,14);
}

/* complessi su terreno in pendenza: ogni corpo poggia alla quota del suo punto */
function quota(x,z){ return Math.min(RM.h(x,z),RM.h(x+5,z),RM.h(x-5,z),RM.h(x,z+5),RM.h(x,z-5))-.1; }
function suTerreno(X,Z,ry){ var q=quota(X,Z), c=Math.cos(ry||0), s=Math.sin(ry||0); return function(lx,lz){ return RM.h(X+lx*c+lz*s,Z-lx*s+lz*c)-q; }; }
/* Statue a tutto tondo (23 novembre 2026; prima erano blocchi, e da vicino il Colosso sembrava un giocattolo). Un arto è un tronco di cono fra due punti qualsiasi, con una sfera
   al giunto d'arrivo; un uomo in piedi e un cavallo col muso verso +z si fanno con quelli. s=1 è la grandezza naturale (cavallo lungo 2,2 m, uomo alto 1,85). Le pose sono indicative. */
var SU=new THREE.Vector3(0,1,0);
function arto(B,a,b,r0,r1,col,lati,giunto){
  var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,lati||7,1);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(SU,d.normalize()))); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); B.geo(g,col);
  if(giunto!==false) B.geo(new THREE.SphereGeometry(r1*1.03,lati||7,5).translate(b[0],b[1],b[2]),col);
  return B;
}
/* Una pelle liscia tesa su una fila di anelli ovali [x, y, z, raggio di lato, raggio in profondità]: ogni anello sta di traverso alla linea che unisce i centri, così la stessa
   funzione fa un torso, una gamba o un braccio piegato. Le normali sono quelle dei vertici, quindi la superficie non mostra spigoli: serve per le statue grandi (il Colosso).
   opz.sudd: fra un anello e l'altro se ne mettono altri, su una curva morbida (Catmull-Rom); opz.muscoli: rigonfiamenti (o solchi, con h negativo) sulla pelle, ciascuno
   {t: dove lungo la fila, in numero d'anello (2.5 = a metà fra il terzo e il quarto); wt: quanto è lungo, in anelli; dir: verso che parte guarda, nel mondo; wa: quanto è largo, in
   radianti; h: di quanto alza la pelle, in frazione del raggio}; opz.forza moltiplica tutti i rilievi; opz.patina scurisce gli incavi e schiarisce le sporgenze, come il bronzo
   vecchio, lucido dove sporge e scuro nelle pieghe: senza, su una superficie di un colore solo, in ombra i muscoli non si leggono. */
function pelle(B,anelli,col,lati,opz){
  opz=opz||{}; var n=lati||12, sudd=opz.sudd||1, mus=(opz.muscoli||[]).map(function(q){ var d=new THREE.Vector3(q.dir[0],q.dir[1],q.dir[2]).normalize(); return {t:q.t,wt:q.wt,d:d,wa:q.wa,h:q.h*(opz.forza||1)}; }), pat=opz.patina||0, tin=[];
  var fini=[], i, j, k, m0=anelli.length;
  function cr(a,b,c,d,u){ return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u); }
  for(i=0;i<m0-1;i++) for(k=0;k<sudd;k++){ var u=k/sudd, A=anelli[Math.max(0,i-1)], Bq=anelli[i], Cq=anelli[i+1], D=anelli[Math.min(m0-1,i+2)], r=[];
    for(j=0;j<5;j++){ var f=function(q){ return q[j]==null?q[3]:q[j]; }; r.push(cr(f(A),f(Bq),f(Cq),f(D),u)); } r[3]=Math.max(.0005,r[3]); r[4]=Math.max(.0005,r[4]); r.push(i+u); fini.push(r); }
  var ult=anelli[m0-1]; fini.push([ult[0],ult[1],ult[2],ult[3],ult[4]==null?ult[3]:ult[4],m0-1]);
  var m=fini.length, pos=[], idx=[], T=new THREE.Vector3(), U=new THREE.Vector3(), V=new THREE.Vector3(), X=new THREE.Vector3(1,0,0), W=new THREE.Vector3();
  for(i=0;i<m;i++){ var p=fini[i], q0=fini[Math.max(0,i-1)], q1=fini[Math.min(m-1,i+1)];
    T.set(q1[0]-q0[0],q1[1]-q0[1],q1[2]-q0[2]).normalize(); U.copy(X).addScaledVector(T,-X.dot(T)).normalize(); V.crossVectors(T,U);
    for(j=0;j<n;j++){ var an=2*Math.PI*j/n, c=Math.cos(an), d=Math.sin(an), g=1;
      if(mus.length){ W.copy(U).multiplyScalar(c).addScaledVector(V,d);
        for(k=0;k<mus.length;k++){ var mq=mus[k], dt=(p[5]-mq.t)/mq.wt; if(dt>2.6||dt<-2.6) continue; var da=Math.acos(Math.max(-1,Math.min(1,W.dot(mq.d))))/mq.wa; if(da>2.6) continue; g+=mq.h*Math.exp(-dt*dt-da*da); } }
      if(pat){ var lu=Math.max(.42,Math.min(1.2,g>1?1+pat*.45*(g-1):1+pat*2.2*(g-1))); tin.push(col.r*lu,col.g*lu,col.b*lu); }      // gli incavi scuriscono molto più di quanto le sporgenze schiariscano
      c*=p[3]*g; d*=p[4]*g; pos.push(p[0]+U.x*c+V.x*d,p[1]+U.y*c+V.y*d,p[2]+U.z*c+V.z*d); } }
  for(i=0;i<m-1;i++) for(j=0;j<n;j++){ var a0=i*n+j, a1=i*n+(j+1)%n; idx.push(a0,a1,a0+n,a1,a1+n,a0+n); }
  [0,m-1].forEach(function(kk,fine){ var ce=pos.length/3; pos.push(fini[kk][0],fini[kk][1],fini[kk][2]);      // i due capi, chiusi
    if(pat) tin.push(col.r,col.g,col.b);
    for(j=0;j<n;j++){ var x=kk*n+j, y=kk*n+(j+1)%n; if(fine) idx.push(x,y,ce); else idx.push(y,x,ce); } });
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); if(pat) geo.setAttribute('color',new THREE.Float32BufferAttribute(tin,3));
  geo.setIndex(idx); geo.computeVertexNormals(); return B.geo(geo,col);
}
function palla(B,r,x,y,z,col,sx,sy,sz,lati){ return B.geo(new THREE.SphereGeometry(r,lati||8,6).scale(sx||1,sy||1,sz||1).translate(x,y,z),col); }
function cavallo(B,x,y,z,ry,s,col){ return B.dentro(x,y,z,ry,function(){
  var u=s*.01;                                                                                                   // un centimetro di statua
  palla(B,3.6*u,0,12.3*u,0,col,.95,1,2.25,10);                                                                   // tronco
  palla(B,3.2*u,0,12.9*u,-4.6*u,col,1,1.05,1.1); palla(B,3.1*u,0,12.6*u,4.6*u,col,1,1.05,1.1);                   // groppa e petto
  arto(B,[0,13.5*u,5.5*u],[0,19.4*u,8.6*u],3*u,1.9*u,col,7);                                                     // collo
  arto(B,[0,19.6*u,8.4*u],[0,16.6*u,13*u],2*u,1.15*u,col,6);                                                     // testa, il muso in avanti e in basso
  arto(B,[0,20.6*u,8*u],[0,21.6*u,7.6*u],.5*u,.2*u,col,4,false);                                                 // orecchie, accennate
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(q,n){ var zx=q[1]*5.2*u, xx=q[0]*2.1*u, gin=zx+(q[1]<0?-.9*u:.3*u);      // zampe: una anteriore sollevata
    if(n===0){ arto(B,[xx,11*u,zx],[xx,7*u,zx+2.6*u],1.5*u,1.05*u,col,6); arto(B,[xx,7*u,zx+2.6*u],[xx,3.4*u,zx+1.2*u],1*u,.8*u,col,6); }
    else { arto(B,[xx,11*u,zx],[xx,5.6*u,gin],1.6*u,1*u,col,6); arto(B,[xx,5.6*u,gin],[xx,.2*u,zx],.95*u,.85*u,col,6,false); } });
  arto(B,[0,13.4*u,-7.6*u],[0,6.5*u,-9.6*u],1.1*u,.5*u,col,5,false);                                             // coda
}); }
function uomo(B,x,y,z,s,col,ry){ return B.dentro(x,y,z,ry||0,function(){
  var u=s*.01;
  [-1,1].forEach(function(k){ arto(B,[k*1.5*u,0,0],[k*1.7*u,9.2*u,0],.95*u,1.45*u,col,6,false); });               // gambe
  arto(B,[0,8.6*u,0],[0,12.2*u,0],2.5*u,2.2*u,col,8,false); arto(B,[0,12.2*u,0],[0,15.2*u,0],2.2*u,2.85*u,col,8,false);      // bacino e vita, torace
  palla(B,3*u,0,15.1*u,0,col,1.05,.5,.72);                                                                       // spalle
  [-1,1].forEach(function(k){ arto(B,[k*3.1*u,15*u,0],[k*3.6*u,11.4*u,.3*u],.95*u,.8*u,col,6); arto(B,[k*3.6*u,11.4*u,.3*u],[k*3.4*u,8.4*u,1.2*u],.78*u,.65*u,col,6); });   // braccia lungo i fianchi
  arto(B,[0,15.4*u,0],[0,16.6*u,0],.85*u,.8*u,col,6,false); palla(B,1.25*u,0,17.5*u,.1*u,col,1,1.15,1.08);        // collo e testa
}); }
function casa(B,y,lx,lz,w,d,h,ry){ B.scatola(w,h+.3,d,lx,y-.3,lz,P.mattone,ry).falde(w+.2,.45,d+.2,lx,y+h,lz,P.coppi,ry,P.mattone); }

/* tracciato delle mura leonine (848-852): dal mausoleo di Adriano attorno al colle Vaticano, fino al Tevere. Coordinate relative a (-215,-92).
   Punti reali (OpenStreetMap): il lato nord è il Passetto fino a porta San Pellegrino; in cima al colle i due tratti superstiti nei giardini vaticani e la torre di San Giovanni,
   accanto a porta Pertusa; a sud porta Cavalleggeri e porta Santo Spirito. Fra un punto e l'altro il tracciato è interpolato. */
var LEO=(function(){ var L=[[-163,-120],[-233.3,-121],[-250,-124],[-272,-127],[-294,-124.5],[-300,-119],[-307,-111],[-313,-100.5],[-304,-96.5],[-285,-89],[-262,-87],[-240.2,-87.7],[-212,-86.5],[-196.5,-86.7],[-187,-84]], passi=[], zone=[];
  for(var i=0;i<L.length-1;i++){ var a=L[i], b=L[i+1], len=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(len/3.2));
    for(var k=0;k<n;k++){ var x=a[0]+(b[0]-a[0])*(k+.5)/n+215, z=a[1]+(b[1]-a[1])*(k+.5)/n+92; passi.push({x:x,z:z,len:len/n,ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}); if(k%2===0) zone.push([x,z,2.4]); } }
  return {passi:passi,zone:zone}; })();

/* dal mondo al riferimento locale del gruppo dei Fori (origine 3,-8; rotazione -.35): così gli edifici si scrivono con le loro coordinate di scena reali */
function LF(x,z){ var dx=x-3, dz=z+8, c=Math.cos(-.35), s=Math.sin(-.35); return [dx*c-dz*s, dx*s+dz*c]; }
function curiaAula(B,tetto,corpo){      // l'aula della Curia: corpo intonacato (o di mattoni, corpo), frontone, tre finestre, porta con i battenti di bronzo
  B.scatola(1.9,2.4,2.7,0,0,0,corpo||P.intonaco).falde(2.7,.6,2,0,2.4,0,tetto,PI/2,corpo||P.intonaco);
  B.vano(0,.25,1.37,1,0,.46,1.05,true).aperture(-.72,1.37,.72,1.37,3,1.55,.42,.2);
  B.scatola(.2,1.02,.03,-.11,.25,1.355,P.bronzo).scatola(.2,1.02,.03,.11,.25,1.355,P.bronzo);      // i due battenti, appena dentro il vano
}
function inForo(B,x,z,ry,fn){ var p=LF(x,z); return B.dentro(p[0],0,p[1],ry||0,fn); }
/* Monte Testaccio: contorno reale (OpenStreetMap, way 23921018), in coordinate relative al centro (-84,184). */
var TESTACCIO=[[-94.7,181.4],[-94.6,183.1],[-94.5,185],[-93.8,186.7],[-92.8,188.5],[-91.8,189.8],[-90.4,191.2],[-89.5,191.8],[-88.6,192],[-86,193.1],[-83.9,195.9],[-82.1,198.6],[-80.6,199.3],[-78.9,199.1],[-77.3,198.5],[-75.8,197.5],[-74.6,195.9],[-73,192.1],[-72.8,190.6],[-73.2,188],[-74,186.1],[-75.2,182.4],[-76.2,180.1],[-76.8,177.8],[-76.9,176.1],[-76.4,174.3],[-77,171.1],[-78,169.1],[-78.2,168.6],[-94.5,177.4],[-94.7,179.1]].map(function(p){ return [p[0]+84,p[1]-184]; });
/* ---------- aiuti per i monumenti dell'inventario del 22 novembre 2026 (quelli che mancavano) ---------- */
function piede(x,z,r){ r=r||.8; return Math.min(RM.h(x,z),RM.h(x+r,z),RM.h(x-r,z),RM.h(x,z+r),RM.h(x,z-r)); }
/* un pezzo di un gruppo che segue il pendio (PENDIO): (X,Z) è l'origine della voce, (x,z) il punto reale in coordinate di scena, r il raggio dell'impronta */
function luogo(B,X,Z,x,z,ry,r,fn){ return B.dentro(x-X,piede(x,z,r)-quota(X,Z)-.05,z-Z,ry||0,fn); }
/* obelisco a sezione quadrata: alto h con la cuspide (un decimo dell'altezza), lato alla base l (se manca, un decimo di h), su un basamento alto hb e largo lb */
function obelisco(B,h,l,hb,x,z,lb,cb){
  l=l||h*.1; var r=l/Math.SQRT2, hc=h*.1;
  if(hb>0) B.scatola(lb||l*1.5,hb,lb||l*1.5,x,0,z,cb||P.marmo);
  B.dentro(x,hb||0,z,PI/4,function(B){ B.cilindro(r,h-hc,0,0,0,P.granito,r*.68,4).cilindro(r*.68,hc,0,h-hc,0,P.granito,0,4); });
}
/* tempio piccolo (B.tempio aggiunge 5 m di podio per lato): podio w x d alto hp, colonne alte hc, nf sulla fronte; lati: periptero; fronte verso +z */
function tempietto(B,w,d,hp,hc,nf,x,z,ry,lati){
  var r=Math.min(.075,w/nf*.2), e=r*1.6, sp=(w-2*e)/(nf-1), nl=Math.max(2,Math.round((d-2*e)/sp)+1);
  return B.dentro(x,0,z,ry||0,function(B){
    B.scatola(w,hp,d,0,0,0,P.travertino).scatola(w*.7,hp*.8,.3,0,0,d/2+.15,P.travertino);                         // podio e scala sulla fronte
    B.scatola(w*(lati?.62:.86),hc,d*(lati?.62:.6),0,hp,-d*(lati?.06:.18),P.marmo);                                   // cella
    B.vano(0,hp,-d*(lati?.06:.18)+d*(lati?.31:.3)+.01,1,0,w*.18,hc*.7,true);                                       // la porta
    B.colonne(-w/2+e,d/2-e,w/2-e,d/2-e,nf,hc,r,hp);
    if(lati) B.colonne(-w/2+e,d/2-e,-w/2+e,-d/2+e,nl,hc,r,hp).colonne(w/2-e,d/2-e,w/2-e,-d/2+e,nl,hc,r,hp).colonne(-w/2+e,-d/2+e,w/2-e,-d/2+e,nf,hc,r,hp);
    else B.colonne(-w/2+e,d/2-e-sp,-w/2+e,d/2-e-sp,1,hc,r,hp).colonne(w/2-e,d/2-e-sp,w/2-e,d/2-e-sp,1,hc,r,hp);  // una colonna per lato nel pronao
    B.scatola(w,.12,d,0,hp+hc,0,P.marmo).falde(d,w*.2,w+.06,0,hp+hc+.12,0,P.coppi,PI/2,P.marmo);                // trabeazione e tetto
  });
}
/* arco a un fornice: largo w, profondo p, alto h; fornice largo f e alto hf (quadro: architrave piano); fronte verso +z */
/* Un muro attraversato da fornici veri (23 novembre 2026: prima gli archi erano toppe scure dipinte su un blocco pieno, e da vicino non ci si passava sotto con lo sguardo).
   Largo w, alto h, profondo p, la base a quota y; fornici: [[x del centro, larghezza, altezza, piatto]…], piatto = architrave dritto invece dell'arco. */
function muroForato(B,w,h,p,fornici,col,y){
  y=y||0; var N=8, P2=p/2, W2=w/2, ord=fornici.slice().sort(function(q,r){ return q[0]-r[0]; }), c=col||P.marmo;
  function arco(f){ var a=f[1]/2, hs=f[3]?f[2]:f[2]-a, l=[], k; if(f[3]) return [[f[0]-a,y+hs],[f[0]+a,y+hs]]; for(k=0;k<=N;k++){ var t=Math.PI*(1-k/N); l.push([f[0]+a*Math.cos(t),y+hs+a*Math.sin(t)]); } return l; }
  [1,-1].forEach(function(q){ var z=q*P2, xa=-W2;
    ord.forEach(function(f){ var l=arco(f), k; B.quad([xa,y,z],[l[0][0],y,z],[l[0][0],y+h,z],[xa,y+h,z],c);
      for(k=0;k<l.length-1;k++) B.quad([l[k][0],l[k][1],z],[l[k+1][0],l[k+1][1],z],[l[k+1][0],y+h,z],[l[k][0],y+h,z],c);
      xa=l[l.length-1][0]; });
    B.quad([xa,y,z],[W2,y,z],[W2,y+h,z],[xa,y+h,z],c); });
  ord.forEach(function(f){ var l=arco(f), a=f[1]/2, k; [f[0]-a,f[0]+a].forEach(function(x,j){ var yy=l[j?l.length-1:0][1]; B.quad([x,y,P2],[x,y,-P2],[x,yy,-P2],[x,yy,P2],c); });      // i piedritti
    for(k=0;k<l.length-1;k++) B.quad([l[k][0],l[k][1],P2],[l[k+1][0],l[k+1][1],P2],[l[k+1][0],l[k+1][1],-P2],[l[k][0],l[k][1],-P2],c); });                                      // l'intradosso
  B.quad([-W2,y,P2],[-W2,y,-P2],[-W2,y+h,-P2],[-W2,y+h,P2],c).quad([W2,y,-P2],[W2,y,P2],[W2,y+h,P2],[W2,y+h,-P2],c).quad([-W2,y+h,P2],[W2,y+h,P2],[W2,y+h,-P2],[-W2,y+h,-P2],c);
  return B;
}
/* una campata d'arcata lungo un muro curvo, fra due punti del profilo: i due piedritti, l'arco, l'intradosso profondo t verso l'interno */
function campata(B,P0,P1,y0,y1,aw,ah,t,col){
  var dx=P1[0]-P0[0], dz=P1[1]-P0[1], L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L, mx=(P0[0]+P1[0])/2, mz=(P0[1]+P1[1])/2, m=Math.hypot(mx,mz)||1, nx=mx/m, nz=mz/m, a=aw/2, hs=ah-a, N=6, k, sl=L/2-a;
  function pt(q,yy,d){ return [P0[0]+ux*q-nx*d,yy,P0[1]+uz*q-nz*d]; }
  B.quad(pt(0,y0,0),pt(sl,y0,0),pt(sl,y1,0),pt(0,y1,0),col).quad(pt(L-sl,y0,0),pt(L,y0,0),pt(L,y1,0),pt(L-sl,y1,0),col);
  B.quad(pt(sl,y0,0),pt(sl,y0,t),pt(sl,y0+hs,t),pt(sl,y0+hs,0),col).quad(pt(L-sl,y0,t),pt(L-sl,y0,0),pt(L-sl,y0+hs,0),pt(L-sl,y0+hs,t),col);
  for(k=0;k<N;k++){ var t0=Math.PI*(1-k/N), t1=Math.PI*(1-(k+1)/N), q0=L/2+a*Math.cos(t0), q1=L/2+a*Math.cos(t1), h0=y0+hs+a*Math.sin(t0), h1=y0+hs+a*Math.sin(t1);
    B.quad(pt(q0,h0,0),pt(q1,h1,0),pt(q1,y1,0),pt(q0,y1,0),col).quad(pt(q0,h0,0),pt(q0,h0,t),pt(q1,h1,t),pt(q1,h1,0),col); }
}
/* un disco in piedi (scudo, tondo a rilievo), la faccia verso +z locale */
function disco(B,r,sp,x,y,z,ry,col){ return B.dentro(x,y,z,ry||0,function(B){ B.geo(new THREE.CylinderGeometry(r,r,sp,12).rotateX(Math.PI/2),col); }); }
function arcoUno(B,w,p,h,f,hf,x,y,z,ry,col,quadro){
  return B.dentro(x,y,z,ry||0,function(B){ muroForato(B,w,h,p,[[0,f,hf,quadro]],col||P.marmo); });
}
/* Castra Praetoria: gli spigoli sono quelli delle mura del modello (js/roma-topo.js, da OpenStreetMap): nord-ovest, nord-est, sud-est; sud-ovest ricavato; SU è dove la cinta Aureliana
   lascia il lato sud. muri = lato ovest e metà ovest del lato sud (quelli che Aureliano non usa); camere = la fila di camere lungo l'interno dei quattro lati */
var CASTRA=(function(){ var C=[179,-156.5], NO=[153.6,-170.3], NE=[189.1,-183.2], SE=[204.4,-142.7], SO=[168.9,-129.8], SU=[181.1,-132.4], muri=[], camere=[], zone=[];
  function passi(a,b,dentro,lista){ var len=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(len/3)), mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, ix=C[0]-mx, iz=C[1]-mz, m=Math.hypot(ix,iz);
    for(var k=0;k<n;k++){ var t=(k+.5)/n, x=a[0]+(b[0]-a[0])*t+ix/m*dentro, z=a[1]+(b[1]-a[1])*t+iz/m*dentro;
      lista.push({x:x,z:z,len:len/n,ang:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}); if(k%2===0) zone.push([x-C[0],z-C[1],1.3]); } }
  passi(NO,SO,0,muri); passi(SO,SU,0,muri);
  [[NO,NE],[NE,SE],[SE,SO],[SO,NO]].forEach(function(l){ passi(l[0],l[1],.45,camere); });
  var t=19/Math.hypot(SO[0]-NO[0],SO[1]-NO[1]);                                                    // la porta ovest, a 190 m dal lato nord
  return {C:C, muri:muri, camere:camere, zone:zone, porta:[NO[0]+(SO[0]-NO[0])*t, NO[1]+(SO[1]-NO[1])*t], ang:Math.atan2(-(SO[1]-NO[1]),SO[0]-NO[0])}; })();
/* circo Variano: asse dai carceres verso nord-nord-est (vedi la voce sessoriano); zone lungo l'asse, relative all'anfiteatro Castrense */
var VARIANO={x:277.7, z:25.3, ry:1.065};

/* ---------- elenco ---------- */
var M=[
 {id:'colosseo', nome:'Colosseo', x:57,z:26, ry:-.3, zone:[[0,0,14.5]], et:1, fa:function(B){
    /* Rifatto il 23 novembre 2026 sulla voce Amphitheatrum Flavium di Platner e Ashby. Assi di 188 e 156 m, facciata alta 48,50; «eighty arches in the lower arcade», alti 7,05 m
       e larghi 4,20, poi 6,45 e 6,40 ai due ordini di sopra; semicolonne doriche, ioniche e corinzie (qui uguali: cambia solo il capitello, che a questa scala non si vede);
       l'attico con le lesene, una finestra «between every second pair of pilasters», gli scudi di bronzo (clipea) negli altri riquadri e tre mensole per riquadro con i fori per le
       antenne del velario; «in each of the second and third arcades was a statue». Dentro: arena di 86 x 54 m, il podio «about 4 metres above the arena», il maenianum primum
       («about twenty rows»), il secundum («about sixteen»), in cima un colonnato corinzio e il maenianum summum in ligneis, con i sedili di legno. Le arcate ora sono aperte: dietro
       c'è l'ambulacro, con il secondo anello in fondo. Le file dei sedili sono la metà di quelle vere; quote dei piani, altezza del colonnato e forma del suo tetto sono indicative. */
    var n=80, nc=40, ricco=!RM.piccolo, e=RM.ellisse(9.4,7.8,n), i=RM.ellisse(8.5,6.9,n), ce, k, j, PIANI=[[.06,1.28,.705],[1.4,2.48,.645],[2.6,3.7,.64]];
    function an(rx,quanti){ return RM.ellisse(rx,rx-1.6,quanti||nc); }
    /* facciata: tre ordini di arcate aperte, cornici, attico */
    for(k=0;k<n;k++) PIANI.forEach(function(q){ campata(B,e[k],e[(k+1)%n],q[0],q[1],.42,q[2],.24,P.travertino); });
    [1.28,2.48,3.7].forEach(function(y){ var c=RM.ellisse(9.5,7.9,n); B.striscia(c,y,c,y+.12,P.marmo).striscia(c,y+.12,e,y+.12,P.marmo).striscia(e,y,c,y,P.marmo); });      // cornici, con il loro aggetto
    B.striscia(e,3.82,e,4.85,P.travertino).striscia(e,4.85,i,4.85,P.travertino).striscia(i,4.85,i,3.75,P.travertino).fornici(e,4.02,.34,.26,2,true,true);                     // l'attico e le sue finestre, una ogni due riquadri
    { var c2=RM.ellisse(9.52,7.92,n); B.striscia(c2,4.78,c2,4.87,P.marmo).striscia(c2,4.87,e,4.87,P.marmo); }                                                                // il cornicione
    e.forEach(function(p,q){ var ang=Math.atan2(p[0],p[1]);
      PIANI.forEach(function(l){ B.dentro(p[0]*1.004,l[0],p[1]*1.004,ang,function(B){ B.geo(new THREE.CylinderGeometry(.05,.056,l[1]-l[0]-.1,5,1,true,-Math.PI/2,Math.PI).translate(0,(l[1]-l[0]-.1)/2,0),P.travertino).scatola(.15,.1,.09,0,l[1]-l[0]-.1,.02,P.travertino); }); });      // semicolonne
      B.scatola(.09,1.03,.07,p[0]*1.008,3.82,p[1]*1.008,P.travertino,ang);                                                                                                  // lesene dell'attico
      var d=e[(q+1)%n], mx=(p[0]+d[0])/2, mz=(p[1]+d[1])/2, am=Math.atan2(mx,mz);
      if(q%2) disco(B,.12,.03,mx*1.004,4.2,mz*1.004,am,P.bronzo);                                                                                                           // gli scudi di bronzo, dove non c'è la finestra
      [1.4,2.6].forEach(function(y){ B.scatola(.07,.2,.05,mx*.985,y,mz*.985,P.marmo,am).scatola(.045,.05,.045,mx*.985,y+.2,mz*.985,P.marmo,am); });                        // una statua in ogni arco del secondo e del terzo ordine
      (ricco?[.25,.5,.75]:[.5]).forEach(function(f){ var x=p[0]+(d[0]-p[0])*f, z=p[1]+(d[1]-p[1])*f;
        if(ricco) B.scatola(.05,.08,.07,x*1.006,4.5,z*1.006,P.travertino,am); B.scatola(.035,.85,.035,x*.999,4.58,z*.999,P.tronco,am); }); });                              // le mensole e le antenne del velario: tre per riquadro, duecentoquaranta in tutto
    /* l'ambulacro dietro le arcate: i piani, e il secondo anello, che oggi fa da facciata sul lato sud dove l'anello esterno è caduto */
    var w=RM.ellisse(8.7,7.2,n), wc=RM.ellisse(8.74,7.24,n);
    [1.3,2.5,3.72].forEach(function(y){ B.striscia(e,y,w,y,P.travertino); });
    B.striscia(w,0,w,3.72,P.travertino).fornici(w,.22,.9,.5).fornici(w,1.45,.88,.5);
    [1.28,2.48].forEach(function(y){ B.striscia(wc,y,wc,y+.1,P.marmo); });
    /* la cavea, a file di sedili */
    var arena=an(4.3), podio=an(4.62), ce=arena.map(function(){ return [0,0]; });
    B.striscia(arena,.12,ce,.12,P.sabbia).striscia(arena,.12,arena,.52,P.marmo).striscia(arena,.52,podio,.52,P.marmo);                                                        // arena, e il podio a quattro metri
    function gradinata(r0,r1,y0,y1,file,col){ for(j=0;j<file;j++){ var ra=r0+(r1-r0)*j/file, rb=r0+(r1-r0)*(j+1)/file, ya=y0+(y1-y0)*j/file, yb=y0+(y1-y0)*(j+1)/file; B.striscia(an(ra),ya,an(ra),yb,col).striscia(an(ra),yb,an(rb),yb,col); } }
    gradinata(4.62,6.1,.52,1.75,10,P.marmo);                                                                                                                                 // maenianum primum
    B.striscia(an(6.1),1.75,an(6.1),2.05,P.travertino); gradinata(6.1,7.5,2.05,3.35,8,P.travertino);                                                                         // il muro di cintura e il maenianum secundum
    B.striscia(an(7.5),3.35,an(7.5),3.75,P.travertino).striscia(an(7.5),3.75,i.filter(function(q,z){ return z%2===0; }),3.75,P.travertino);                                   // il muro e il ripiano del colonnato
    gradinata(7.75,8.4,3.78,4.2,3,P.tronco);                                                                                                                                 // maenianum summum in ligneis: i sedili di legno
    RM.ellisse(7.62,6.02,n).forEach(function(p){ B.cilindro(.045,.82,p[0],3.75,p[1],P.granito,.04,5); });                                                                     // il colonnato in cima
    B.striscia(RM.ellisse(7.56,5.96,n),4.57,i,4.8,P.coppi).striscia(RM.ellisse(7.56,5.96,n),4.5,RM.ellisse(7.56,5.96,n),4.57,P.travertino);                                   // il suo tetto (di tegole: ipotesi)
    B.scatola(.7,.5,.7,-11.7,0,-4.65,P.marmo);                                                                   // il basamento del Colosso: «7 metres square, of brick-faced concrete, and was originally covered with marble» (Platner e Ashby, Colossus Neronis); resta fino al 1936
 }},
 /* Il Colosso: statua di bronzo di circa 35 m, sul basamento reale (OpenStreetMap, way 709011412). La figura è indicativa: stante, corona di raggi, timone nella destra e globo
    nella sinistra come sulle monete; da che parte guardasse non si sa. */
 {id:'colosso', nome:'Colosso del Sole', x:47.2,z:18.1, ry:-.3, come:'colosseo', fa:function(B){
    /* Rifatto il 23 novembre 2026 (l'utente: «Rifai il colosso?», e poi «Ancora di più»): prima a blocchi, poi a pezzi tondi incastrati che sembravano un manichino. Ora è una figura
       sola dalla pelle liscia, scolpita: nudo stante, il peso sulla gamba destra e la sinistra flessa e arretrata, come nelle statue classiche; muscoli, mani con le dita, un volto,
       i capelli a riccioli. Guardando la statua di fronte la sua destra è a -x: lì sta il timone, a terra, e nella sinistra il globo. Alta 35 m (Svetonio, nella scheda) sopra il
       basamento. Posa, anatomia e volto sono di fantasia, sul tipo delle statue di Elio: delle fonti restano l'altezza, i raggi, il timone e il globo. Tutto dello stesso bronzo. */
    var S=P.statua, k, F=3.5/3.2, Y0=.5, FR=[0,0,1], DI=[0,0,-1];
    function fila(l){ return l.map(function(q){ return [q[0]*F,q[1]*F+Y0,q[2]*F,q[3]*F,(q[4]==null?q[3]:q[4])*F]; }); }
    function pt(x,y,z){ return [x*F,y*F+Y0,z*F]; }
    function pezzo(r,x,y,z,sx,sy,sz,lati){ return palla(B,r*F,x*F,y*F+Y0,z*F,S,sx,sy,sz,lati||10); }
    function largo(l,k,kz){ return l.map(function(q,i){ return i>0&&i<l.length-1?[q[0],q[1],q[2],q[3]*k,(q[4]==null?q[3]:q[4])*(kz||1)]:q; }); }
    function dito(l,r){ for(var q=0;q<l.length-1;q++) arto(B,pt(l[q][0],l[q][1],l[q][2]),pt(l[q+1][0],l[q+1][1],l[q+1][2]),r*F*(1-.12*q),r*F*(1-.12*(q+1)),S,6); }
    /* gambe: lato = -1 la destra (portante), +1 la sinistra (scarica, ginocchio in avanti, tallone alzato) */
    function gamba(anelli,lato){ pelle(B,fila(anelli),S,16,{sudd:3,muscoli:[
      {t:1,wt:.35,dir:[lato,0,0],wa:.5,h:.2},{t:1,wt:.35,dir:[-lato,0,.1],wa:.5,h:.16},                               // i malleoli
      {t:2.9,wt:.85,dir:[lato*.25,0,-1],wa:.75,h:.2},{t:2.6,wt:.9,dir:FR,wa:.45,h:-.07},                              // polpaccio, e la tibia, piatta
      {t:5,wt:.38,dir:[0,0,1],wa:.5,h:.1},{t:5.9,wt:.55,dir:[-lato*.75,0,.65],wa:.42,h:.12},                           // rotula, vasto mediale (la goccia sopra il ginocchio)
      {t:6.9,wt:1.1,dir:[lato*.7,0,.7],wa:.5,h:.09},{t:7.3,wt:1,dir:FR,wa:.4,h:.07},{t:6.9,wt:1.1,dir:DI,wa:.6,h:.08},  // vasto laterale, retto, bicipite femorale
      {t:6.6,wt:1.2,dir:[lato*.35,0,.93],wa:.1,h:-.04}],forza:1.5,patina:2.2}); }
    gamba([[-.15,.03,.0,.05],[-.15,.16,-.01,.056,.068],[-.15,.4,-.02,.076,.084],[-.155,.62,-.03,.095,.102],[-.16,.8,-.01,.083,.088],[-.16,.92,.01,.09,.096],[-.165,1.1,.015,.11,.118],[-.17,1.35,.01,.142,.152],[-.16,1.56,0,.158,.168],[-.12,1.7,0,.15,.16]],-1);
    gamba([[.27,.07,-.17,.05],[.265,.2,-.15,.056,.068],[.25,.44,-.09,.076,.084],[.235,.64,-.03,.094,.101],[.215,.82,.06,.083,.088],[.205,.93,.105,.09,.096],[.19,1.12,.09,.11,.118],[.17,1.36,.045,.142,.152],[.15,1.56,.01,.158,.168],[.11,1.7,0,.15,.16]],1);
    pelle(B,fila([[-.15,.02,-.075,.045,.032],[-.15,.048,-.01,.06,.05],[-.152,.042,.09,.066,.04],[-.155,.03,.165,.058,.03],[-.156,.024,.2,.04,.02]]),S,10,{sudd:2});      // piede destro
    pelle(B,fila([[.28,.1,-.245,.042,.032],[.275,.075,-.175,.058,.05],[.265,.042,-.085,.064,.04],[.26,.03,-.02,.056,.03],[.258,.024,.015,.04,.02]]),S,10,{sudd:2});      // piede sinistro
    /* tronco: bacino spostato sulla gamba portante, vita, costato, petto, spalle. I muscoli sono rigonfiamenti bassi sulla stessa pelle: non pezzi aggiunti */
    var MT=[{t:6.9,wt:.3,dir:FR,wa:.09,h:-.05},{t:5,wt:1.3,dir:FR,wa:.06,h:-.045},{t:5,wt:2.6,dir:DI,wa:.09,h:-.07},{t:3.25,wt:.7,dir:FR,wa:.5,h:.03},{t:10,wt:.5,dir:FR,wa:.3,h:-.06}];      // lo sterno, la linea alba, il solco della schiena, il basso ventre, la fossetta del collo
    [-1,1].forEach(function(q){ MT.push(
      {t:6.85,wt:.75,dir:[q*.52,0,.86],wa:.46,h:.115},{t:5.95,wt:.28,dir:[q*.5,0,.87],wa:.5,h:-.035},                 // pettorale, e il suo margine di sotto
      {t:5.55,wt:.2,dir:[q*.2,0,.98],wa:.16,h:.05},{t:5.05,wt:.2,dir:[q*.2,0,.98],wa:.16,h:.055},{t:4.5,wt:.22,dir:[q*.2,0,.98],wa:.16,h:.055},      // gli addominali, tre fasce
      {t:3.55,wt:.5,dir:[q*.82,0,.57],wa:.42,h:.07},{t:2.5,wt:.45,dir:[q*.6,0,.8],wa:.25,h:-.06},                      // la cresta del fianco e il solco dell'inguine
      {t:6,wt:1.1,dir:[q,0,-.25],wa:.45,h:.07},{t:7.3,wt:.7,dir:[q*.55,0,-.84],wa:.45,h:.07},{t:4,wt:1,dir:[q*.27,0,-.96],wa:.2,h:.05},      // gran dorsale, scapola, lombari
      {t:1.75,wt:.75,dir:[q*.5,0,-.87],wa:.5,h:.26},{t:9.3,wt:.5,dir:[q*.75,0,-.4],wa:.7,h:.16},                       // gluteo, trapezio
      {t:7.7,wt:.75,dir:[q*.9,0,.44],wa:.1,h:-.05},{t:8.75,wt:.16,dir:[q*.45,0,.9],wa:.5,h:-.035},{t:8.95,wt:.14,dir:[q*.45,0,.9],wa:.45,h:.04},      // il solco fra petto e spalla, la clavicola
      {t:5.3,wt:.07,dir:[q*.2,0,.98],wa:.2,h:-.03},{t:4.78,wt:.07,dir:[q*.2,0,.98],wa:.2,h:-.03},{t:5.4,wt:.9,dir:[q*.42,0,.9],wa:.07,h:-.03},      // le pieghe fra gli addominali e il loro margine di lato
      {t:1.2,wt:.25,dir:[q*.5,0,-.87],wa:.6,h:-.05}); });                                                                 // la piega sotto il gluteo
    pelle(B,fila(largo([[-.02,1.46,0,.12,.1],[-.025,1.56,0,.25,.175],[-.03,1.72,-.01,.272,.195],[-.03,1.87,-.005,.258,.185],[-.015,2.02,.005,.24,.17],[-.005,2.2,.012,.285,.192],[0,2.36,.022,.335,.218],[.002,2.48,.02,.365,.215],[.005,2.57,.005,.37,.185],[.005,2.64,-.005,.33,.155],[.005,2.71,-.01,.16,.125],[.005,2.83,0,.098,.1]],1.09,1.04)),S,28,{sudd:3,muscoli:MT,forza:1.7,patina:2.2});
    pezzo(.034,-.02,1.5,.158,.9,1.15,.9);                                                                                                                      // il sesso, appena accennato
    /* testa: mento, mascella, zigomi, fronte, calotta */
    var MF=[{t:3.95,wt:.28,dir:FR,wa:.75,h:.07},{t:.75,wt:.5,dir:FR,wa:.4,h:.16},{t:2.3,wt:.4,dir:FR,wa:.28,h:-.04}];                                         // arcata delle sopracciglia, mento, il solco sotto il naso
    [-1,1].forEach(function(q){ MF.push({t:3.45,wt:.25,dir:[q*.36,0,.93],wa:.2,h:-.1},{t:2.8,wt:.35,dir:[q*.62,0,.78],wa:.28,h:.07},{t:1.5,wt:.5,dir:[q*.92,0,.3],wa:.4,h:.07}); });      // orbite, zigomi, angoli della mascella
    pelle(B,fila([[.005,2.812,.045,.03,.035],[.005,2.85,.035,.082,.098],[.005,2.9,.025,.106,.126],[.005,2.96,.015,.122,.146],[.005,3.04,0,.132,.16],[.005,3.12,-.01,.118,.146],[.005,3.18,-.01,.076,.096],[.005,3.205,-.01,.02,.03]]),S,22,{sudd:3,muscoli:MF,forza:1.25,patina:2});
    pelle(B,fila([[.005,3.035,.128,.013,.012],[.005,2.99,.158,.017,.015],[.005,2.958,.178,.024,.02],[.005,2.942,.158,.02,.012]]),S,8,{sudd:2});                  // il naso
    pezzo(.03,.005,2.917,.146,1.3,.3,.5); pezzo(.027,.005,2.9,.144,1.15,.34,.5);                                                                               // le labbra
    [-1,1].forEach(function(q){ pezzo(.02,.005+q*.05,3.0,.116,1.25,.62,.6,8); pezzo(.03,.005+q*.134,2.985,.01,.4,1.2,.8,8); });                                // occhi, orecchie
    (function(){ var rn=RM.casuale(35), C0=[.005,3.045,-.005], RR=[.142,.172,.168];                                                                             // i riccioli: file di ciocche tonde sulla calotta, sopra la fronte, sulla nuca
      [[16,4],[38,9],[58,13],[78,15],[98,14],[116,11]].forEach(function(f,ri){ for(var q=0;q<f[1];q++){ var az=(q+(ri%2)*.5)/f[1]*6.2832, fi=f[0]*.01745, davanti=Math.cos(az);
        if(f[0]>50 && davanti>.42) continue; if(f[0]>100 && davanti>-.35) continue;                                                                             // il volto resta libero; sulla nuca solo dietro
        pezzo(.036+.012*rn(),C0[0]+Math.sin(fi)*Math.sin(az)*RR[0],C0[1]+Math.cos(fi)*RR[1],C0[2]+Math.sin(fi)*Math.cos(az)*RR[2],1,.8,1,6); } }); })();
    /* braccio destro (a -x): scende lungo il fianco, la mano stringe l'asta del timone */
    pelle(B,fila([[-.33,2.6,0,.1,.12],[-.425,2.54,0,.125,.138],[-.46,2.36,0,.112,.122],[-.47,2.13,-.01,.09,.096],[-.475,1.98,.03,.096,.1],[-.475,1.8,.09,.076,.08],[-.475,1.67,.14,.052,.058],[-.478,1.63,.155,.045,.05]]),S,14,{sudd:3,forza:1.5,patina:2.2,muscoli:[
      {t:1,wt:.75,dir:[-1,.2,0],wa:.95,h:.17},{t:2.2,wt:.6,dir:FR,wa:.6,h:.13},{t:2.3,wt:.7,dir:DI,wa:.6,h:.1},{t:4.1,wt:.6,dir:[-.6,0,.6],wa:.7,h:.13}]});      // deltoide, bicipite, tricipite, avambraccio
    pezzo(.05,-.508,1.585,.165,.5,1.15,.95); for(k=0;k<4;k++) dito([[-.522,1.632-k*.034,.185],[-.5,1.63-k*.034,.218],[-.462,1.628-k*.034,.214],[-.442,1.63-k*.034,.185]],.019);      // il dorso della mano e le quattro dita chiuse sull'asta
    dito([[-.5,1.655,.14],[-.47,1.668,.125],[-.445,1.662,.145]],.02);                                                                                           // il pollice
    arto(B,pt(-.5,0,.26),pt(-.466,1.9,.148),.022*F,.02*F,S,8,false); pezzo(.03,-.4655,1.91,.147,1,1,1,8);                                                       // il timone: l'asta e il pomo
    B.dentro(-.5*F,Y0,.26*F,.25,function(B){ B.scatola(.17*F,.5*F,.035*F,0,.06*F,0,S).scatola(.21*F,.07*F,.04*F,0,0,0,S).geo(new THREE.CylinderGeometry(.085*F,.085*F,.035*F,12,1,false,0,Math.PI).rotateX(Math.PI/2).translate(0,.56*F,0),S); });      // la pala, poggiata a terra
    /* braccio sinistro (a +x): gomito al fianco, avambraccio in avanti, il globo sul palmo aperto */
    pelle(B,fila([[.34,2.6,0,.1,.12],[.435,2.54,0,.125,.138],[.47,2.36,.01,.112,.122],[.475,2.13,.03,.09,.096],[.458,2.07,.17,.098,.092],[.432,2.1,.33,.078,.076],[.418,2.13,.44,.054,.056],[.415,2.135,.47,.05,.04]]),S,14,{sudd:3,forza:1.5,patina:2.2,muscoli:[
      {t:1,wt:.75,dir:[1,.2,0],wa:.95,h:.17},{t:2.15,wt:.55,dir:[0,.2,1],wa:.6,h:.19},{t:2.3,wt:.7,dir:DI,wa:.6,h:.1},{t:4.3,wt:.6,dir:[.6,.6,0],wa:.7,h:.13}]});
    var GC=[.41,2.31,.52], GR=.125;
    pezzo(.062,.412,2.152,.5,1.05,.36,1.2);                                                                                                                     // il palmo
    for(k=0;k<4;k++){ var lx=(k-1.5)*.03; dito([20,45,72,98].map(function(be){ var bq=be*.01745, e=GR+.014; return [GC[0]+lx,GC[1]-Math.cos(bq)*e,GC[2]+Math.sin(bq)*e]; }),.018); }      // le dita salgono sul davanti del globo
    dito([35,62,90].map(function(be){ var bq=be*.01745, e=GR+.014; return [GC[0]+Math.sin(bq)*e,GC[1]-Math.cos(bq)*e,GC[2]-.02]; }),.02);                         // il pollice, di lato
    pezzo(GR,GC[0],GC[1],GC[2],1,1,1,18);                                                                                                                       // il globo
    /* la corona: sette raggi a ventaglio attorno al capo, fra i riccioli */
    for(k=-3;k<=3;k++) B.geo(new THREE.ConeGeometry(.024*F,.42*F,6).translate(0,.21*F,0).rotateZ(-k*.4).translate(.005*F+Math.sin(k*.4)*.15*F,3.05*F+Y0+Math.cos(k*.4)*.15*F,-.01*F),P.oro);
 }},
 /* Meta Sudans: fontana conica flavia, con la vasca di 21 m rifatta nel IV secolo. Demolita nel 1936; la posizione è quella delle coordinate correnti (41°53'24" N, 12°29'27" E),
    a nord dell'arco di Costantino: vale entro una quindicina di metri. Altezza del cono (circa 17 m) dalle ricostruzioni correnti. */
 {id:'metasudans', nome:'Meta Sudans', x:45.6,z:27.8, ry:0, come:'colosseo', fa:function(B){
    /* Rifatta il 23 novembre 2026 (Platner e Ashby, Meta Sudans): «in shape it resembled a goal in the circus (meta) and sudans described the appearance of the jets of water»;
       il nucleo conico ha 5 m di diametro alla base; «the whole structure was originally covered with marble»; attribuita a Domiziano. La grande vasca di 21 m è «probably of the
       time of Constantine»: qui compare dal 315, con l'arco (metasudansvasca); prima c'è una vasca più piccola, di misura indicativa. Zoccolo, cornice a metà, pigna in cima e
       rivoli sono come sulle monete e nelle ricostruzioni correnti: indicativi. */
    B.cilindro(.66,.16,0,0,0,P.marmo,.66,24);                                                                                                  // la vasca di prima (l'acqua, che si muove, sta più sotto: «l'acqua della Meta Sudans»)
    B.cilindro(.4,.12,0,.12,0,P.marmo,.4,20).cilindro(.36,.34,0,.24,0,P.marmo,.34,18).cilindro(.38,.05,0,.58,0,P.marmo,.38,18);                // lo zoccolo e la sua cornice
    B.geo(new THREE.LatheGeometry([[.31,0],[.295,.25],[.262,.5],[.21,.75],[.14,.98],[.085,1.12],[.07,1.16]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),18).translate(0,.63,0),P.marmo);      // il cono
    B.cilindro(.115,.045,0,1.2,0,P.marmo,.115,12).geo(new THREE.SphereGeometry(.085,10,8).scale(1,1.25,1).translate(0,1.9,0),P.marmo).cilindro(.05,.1,0,1.79,0,P.marmo,.07,8);      // una cornice a metà, la pigna in cima
 }},
 {id:'metasudansvasca', x:45.6,z:27.8, ry:0, come:'colosseo', fa:function(B){                                                                 // la vasca di 21 m, dal 315
    var e1=RM.ellisse(1.05,1.05,28), e2=RM.ellisse(.97,.97,28), e3=RM.ellisse(.67,.67,28);
    B.striscia(e1,0,e1,.2,P.marmo).striscia(e1,.2,e2,.2,P.marmo).striscia(e2,.2,e2,.1,P.marmo).striscia(e2,.1,e3,.1,P.marmo);
 }},
 {id:'circo', nome:'Circo Massimo', x:0,z:71, ry:-.651, lunga:[62,10], et:1, fa:function(B){
    circo(B,62,14,2.5,true);
    /* l'arco di Tito al centro della curva orientale (81): «replaced by a triple arch, erected by the senate in honour of Titus» (Platner e Ashby, Circus Maximus; CIL VI.944, pianta marmorea fr. 38).
       Largo circa 17 m e profondo 15, tre fornici, colonne libere alte oltre 10 m, quadriga sull'attico (scavi del 2015, da it.wikipedia «Circo Massimo»). Le altezze qui sono ipotetiche. */
    B.scatola(1.5,1.55,1.7,28.95,0,0,P.marmo).scatola(1.6,.1,1.8,28.95,1.55,0,P.marmo).scatola(1.5,.35,1.7,28.95,1.65,0,P.marmo);      // corpo, cornice, attico
    B.vano(28.175,0,0,0,1,.55,1.15).vano(28.175,0,.55,0,1,.3,.75).vano(28.175,0,-.55,0,1,.3,.75);                                     // i tre fornici, sulla fronte verso l'arena
    [-.8,-.27,.27,.8].forEach(function(z){ B.scatola(.16,.4,.16,28.12,0,z,P.marmo); }); B.colonne(28.12,-.8,28.12,.8,4,1.1,.06,.4);     // le quattro colonne libere sui loro piedistalli
    B.scatola(.5,.25,.6,28.95,2,0,P.statua);                                                                                            // la quadriga
 }},
 /* Il secondo obelisco della spina, portato da Costanzo II: «obeliscus Romae in circo erectus est maximo» (Ammiano XVII 4.1), nel 357. Alto 32,50 m, di granito rosso
    (Platner e Ashby, Obeliscus Constantii). In cima una sfera di bronzo dorato, colpita subito da un fulmine e sostituita da una fiaccola di bronzo dorato (Ammiano XVII 4.15).
    Ammiano lo dice messo «in media», ma nel mezzo della spina stava già quello di Augusto: il punto, 35 m a est di quello, è una nostra scelta. Che fosse ancora in piedi nell'852 non si sa. */
 {id:'obelisco357', nome:'Obelisco di Costanzo II', x:2.78,z:73.12, ry:-.651, come:'circo', fa:function(B){
    B.scatola(.62,.36,.62,0,.52,0,P.marmo);                                                       // il basamento, con l'iscrizione di Costanzo sui quattro lati
    B.cilindro(.2,3.25,0,.88,0,P.sabbia,.13,4).cono(.13,.25,0,4.13,0,P.sabbia,4);                   // fusto e cuspide
    B.cilindro(.025,.2,0,4.38,0,P.oro,.05,6).cono(.06,.14,0,4.58,0,P.oro,6);                         // la fiaccola dorata
 }},
 /* Dopo le ultime corse (550) la valle non è più drenata: la pista diventa un velo di fango e pozze. Che il circo si interrasse è certo («gradually buried under waterlogged alluvial soil»,
    en.wikipedia «Circus Maximus»: oggi la pista sta circa 6 m sotto il suolo; nel 1587 gli obelischi erano a circa 7 m, Platner e Ashby). Quanto deposito ci fosse nell'852 non lo sappiamo:
    per questo il suolo non si alza, si bagna soltanto. Forma e posizione delle pozze sono di fantasia. */
 {id:'fangocirco', x:0,z:71, ry:-.651, come:'circo', fa:function(B){
    var FANGO=RM.col(0x8a7656), L=62, w=8.3, p=RM.stadio(L-(14-w),w,26,14), asse=p.map(function(q){ return [Math.max(-L/2+4,Math.min(L/2-7,q[0])),0]; }), rnd=RM.casuale(550), k;
    B.striscia(p,.135,asse,.135,FANGO);
    for(k=0;k<9;k++) B.cilindro(.5+.8*rnd(),.02,-25+48*rnd(),.14,(rnd()<.5?-1:1)*(1+1.8*rnd()),P.acqua,null,12);
 }},
 {id:'fori', nome:'Fori', x:3,z:-8, ry:-.35, zone:[[-1.2,2.5,10.5],[-11,-1.5,7],[9,6,6],[0,-13.2,9],[11.5,-19.5,8.5],[13,-6,9.5],[-1.3,-27.8,9.5],[-7.5,-36,9.5],[5,-33,6],[11.2,13.1,3.8]].map(function(q){ var p=LF(q[0],q[1]); return [p[0],p[1],q[2]]; }), et:1, fa:function(B){
    /* Posizioni reali: i centri dei resti rilevati in OpenStreetMap (src/roma/grezzi/osm-foro.json), scritti qui in coordinate di scena.
       Orientamenti: il Foro Romano lungo il suo asse, i fori imperiali sulla loro griglia comune, girata di circa 58° rispetto al Foro.
       Forme e misure restano schematiche; qualche edificio è accorciato di poco perché le vie vere gli passino accanto e non sopra. */
    var IMP=1.022;
    inForo(B,-1.2,1.6,0,function(B){ B.scatola(12.5,.1,5,0,0,0,P.selce); });                                                       // piazza del Foro
    inForo(B,-4.6,6,0,function(B){ basilica(B,9.6,4.9,1.9,0,0); });                                                               // Giulia (l'Emilia è un edificio a sé: brucia nel 410)
    /* la Curia è un edificio a sé (id 'curia', più sotto): fino al 630 aula del Senato, poi la chiesa di Sant'Adriano */
    inForo(B,-5.5,-1,0,function(B){ B.scatola(1.3,.32,2.4,0,0,0,P.marmo).scatola(.12,.12,2.4,.6,.32,0,P.marmo).aperture(.66,1.1,.66,-1.1,6,.06,.2,.12,true); });   // i Rostri: la tribuna degli oratori, sul lato ovest della piazza
    inForo(B,-9.1,-4.9,0,function(B){ B.scatola(2,1.7,4.4,-.6,.5,0,P.marmo).falde(4.4,.5,2.1,-.6,2.2,0,P.coppi,PI/2,P.marmo).scatola(2.2,.5,4.5,-.6,0,0,P.travertino); B.tempio(2.2,1.6,1.6,.9,0,PI/2,{fronte:6}); });   // Concordia: cella larga, messa di traverso, e pronao verso il Foro
    inForo(B,-11.4,-2.6,0,function(B){ B.tempio(1.7,3,1.6,0,0,PI/2,{fronte:6,podio:.6}); });                                       // Vespasiano e Tito
    inForo(B,11.2,13.1,0,function(B){ portico(B,6.8,3,0,0,0,1); B.scatola(6.8,1.1,.5,0,1.15,-1.5,P.mattone).scatola(.5,1.1,3,-3.4,1.15,0,P.mattone).scatola(.5,1.1,3,3.4,1.15,0,P.mattone); });   // casa delle Vestali: il lungo cortile porticato, a due piani
    inForo(B,-10.1,1.1,0,function(B){ B.tempio(2.2,4,1.7,0,0,PI/2,{fronte:6,podio:.85}); });                                      // Saturno, sul suo podio alto
    inForo(B,3,9.3,0,function(B){ B.tempio(2.9,4.6,2,0,0,PI,{fronte:8,lati:11,podio:.8}); });                                     // Castori: «octastyle and peripteral, with eleven columns on each side» (Platner e Ashby, Aedes Castoris)
    inForo(B,7.4,9,0,function(B){                                                                                                 // Vesta: tempio rotondo, colonne tutt'attorno, tetto conico con il foro per il fumo
      B.cilindro(1,.32,0,0,0,P.marmo,null,20).cilindro(.62,1.25,0,.32,0,P.marmo,null,16);
      for(var k=0;k<20;k++){ var a=k*PI/10; B.cilindro(.06,1.25,.86*Math.cos(a),.32,.86*Math.sin(a),P.marmo,.052,7); }      // «peripteral, with twenty columns» (Platner e Ashby, Vesta)
      B.cilindro(.98,.14,0,1.57,0,P.marmo,null,20).cilindro(.98,.5,0,1.71,0,P.bronzo,.16,20);
    });
    inForo(B,5.6,5.6,0,function(B){ B.tempio(2.4,2.8,1.4,0,0,-PI/2,{fronte:6}); });                                               // Divo Giulio
    inForo(B,11.6,3.7,0,function(B){ B.tempio(2.1,3.4,1.7,0,0,0,{fronte:6}); });                                                  // Antonino e Faustina
    inForo(B,-14.5,-5.2,PI/2,function(B){ B.scatola(7.4,1.1,2.4,0,0,0,P.tufo); arcato(B,7.2,1.9,2.2,0,1.1,0,P.tufo,2,11); });      // Tabularium: l'alto basamento di tufo e, sopra, la galleria ad arcate
    inForo(B,-4.6,-3.7,0,function(B){                                                                                             // arco di Settimio Severo: tre fornici, colonne su piedistalli, attico
      muroForato(B,2.3,1.45,1.1,[[0,.68,1.2],[-.78,.34,.76],[.78,.34,.76]],P.marmo); B.scatola(2.42,.13,1.22,0,1.45,0,P.marmo).scatola(2.3,.52,1.1,0,1.58,0,P.marmo);      // i fornici sono aperti (23 novembre 2026)
      [1,-1].forEach(function(q){ B.colonne(-1.06,q*.66,1.06,q*.66,4,1.2,.06,.25); [-1.06,-.353,.353,1.06].forEach(function(x){ B.scatola(.2,.25,.2,x,0,q*.66,P.marmo); }); });
    });
    inForo(B,0,-13.2,IMP,function(B){ portico(B,7,15,0,0,0,1.1); B.tempio(2.6,3.6,1.7,0,-5.2,0,{fronte:8}); });                   // foro di Cesare, Venere Genitrice a nord-ovest
    inForo(B,11.2,-19.5,IMP,function(B){                                                                                          // foro di Augusto: Marte Ultore contro il muro tagliafuoco verso la Suburra, le due esedre ai lati
      portico(B,10.5,9.5,0,0,0,1.2); B.tempio(3.4,4.6,2.3,2.3,0,-PI/2,{fronte:8,lati:8,podio:.7}).scatola(.5,3.3,10.5,5.5,0,0,P.tufo);
      [-1,1].forEach(function(q){ var es=RM.ellisse(2,2,10,q>0?0:PI,q>0?PI:2*PI).map(function(p){ return [p[0]+1.6,p[1]+q*4.75]; }), ce=es.map(function(){ return [1.6,q*4.75]; });
        B.striscia(es,0,es,1.7,P.tufo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });
    });
    inForo(B,10.7,-8.9,IMP,function(B){ portico(B,12,4.2,0,0,0,1.2); B.tempio(1.8,2.4,1.5,4.6,0,-PI/2,{fronte:6}); });            // foro di Nerva, Minerva: lo attraversa l'Argileto
    inForo(B,16.9,-2.6,IMP,function(B){                                                                                           // tempio della Pace: una piazza a giardino di circa 110 x 105 m (Fogagnolo e Rossi 2010); con le aule di fondo il complesso arriva a 125 m
      portico(B,11,10.5,0,0,-.9,1.2,P.prato);
      B.scatola(3.6,1.7,1.8,3.7,0,5.25,P.mattone).scatola(3.7,.12,1.9,3.7,1.7,5.25,P.coppi);                                         // le aule sul lato di fondo (sud-est); quella all'angolo sud è Santi Cosma e Damiano
      B.tempio(3.2,2.4,2.1,0,5.15,PI,{fronte:6,podio:.2});                                                                          // il tempio: un'aula dietro il portico, da cui sporge solo il pronao a sei colonne
      [-1,1].forEach(function(q){ for(var k=0;k<3;k++) B.scatola(.42,.14,6,q*(1.3+k*1.15),.1,-1.3,P.mattone).scatola(.3,.04,5.86,q*(1.3+k*1.15),.24,-1.3,P.acqua); });      // le sei lunghe vasche fra le aiuole
      B.scatola(.5,.3,.5,0,.1,2.3,P.marmo);                                                                                        // l'altare davanti al tempio
    });
    inForo(B,-1.3,-27.8,IMP,function(B){
      portico(B,11.5,9,0,0,0,1.3);                                                             // foro di Traiano
      B.scatola(.62,.34,.34,0,.1,0,P.marmo).scatola(.56,.2,.18,0,.72,0,P.statua).scatola(.12,.26,.13,.3,.86,0,P.statua).scatola(.12,.3,.13,-.02,.92,0,P.statua);      // la statua equestre di Traiano, al centro della piazza
      [[-.2,-.06],[-.2,.06],[.2,-.06],[.2,.06]].forEach(function(p){ B.scatola(.05,.28,.05,p[0],.44,p[1],P.statua); });
      [-1,1].forEach(function(q){ var es=RM.ellisse(2.3,2.3,10,q>0?-PI/2:PI/2,q>0?PI/2:3*PI/2).map(function(p){ return [p[0]+q*5.75,p[1]]; }), ce=es.map(function(){ return [q*5.75,0]; });
        B.striscia(es,0,es,1.7,P.marmo,false).striscia(es,1.7,ce,2.1,P.coppi,false); });        // le due grandi esedre ai lati della piazza
      basilica(B,17,5.6,2.4,0,-7.6,P.bronzo);                                                  // basilica Ulpia, con le absidi alle due testate
      [-1,1].forEach(function(q){ B.cilindro(2.5,2,q*8.5,0,-7.6,P.marmo,null,18).cilindro(2.5,.55,q*8.5,2,-7.6,P.bronzo,.3,18); });
      /* colonna Traiana: piedistallo «5.4 metres high»; base, fusto e capitello «3.70 metres in diameter … measure 100 Roman feet (29.77 metres)» (Platner e Ashby, Forum Traiani) */
      B.scatola(.56,.55,.56,0,0,-11.6,P.marmo).cilindro(.23,.1,0,.55,-11.6,P.marmo,.2,14).coclide(.185,.165,2.73,0,.65,-11.6,23,P.marmo);      // basamento, toro, fusto col fregio a spirale: ventitré giri è il numero corrente, non letto in Platner
      B.scatola(.45,.12,.45,0,3.38,-11.6,P.marmo).cilindro(.11,.1,0,3.5,-11.6,P.marmo,.1,10); uomo(B,0,3.6,-11.6,2.1,P.statua);  // capitello e statua dell'imperatore (indicativa)
      B.scatola(2,1.8,2.6,-2.8,0,-11.6,P.mattone).scatola(2,1.8,2.6,2.8,0,-11.6,P.mattone);     // biblioteche
      B.tempio(3.8,5.4,2.4,0,-16.4,PI,{fronte:8,lati:9,podio:.7});                              // tempio del Divo Traiano
      B.dentro(5.75,0,0,0,function(B){
        /* Mercati di Traiano. Il grande emiciclo gira attorno all'esedra del foro, oltre una strada, e guarda la piazza con tre livelli: le botteghe, le finestre ad arco, un piano arretrato.
           Su OpenStreetMap (relazione 13353038) la facciata ha un raggio di 22 m e il corpo è profondo 7; qui il raggio è di 29,5 m, perché l'esedra del modello è più larga del vero.
           Dietro, più in alto sul pendio del Quirinale, gli isolati lungo la via Biberatica e, a nord, la Grande Aula: posizioni dal contorno di OpenStreetMap, forme e altezze schematiche. */
        var arco=function(r,a,n){ return RM.ellisse(r,r,n||18,-a,a); }, f=arco(2.95,PI/2), t=arco(3.3,PI/2), o=arco(3.7,PI/2), cor=arco(2.9,PI/2), v=arco(3.7,PI*.36,12), u=arco(4.55,PI*.36,12);
        var th=IMP-.35, c0=Math.cos(th), s0=Math.sin(th), q0=quota(3,-8), su=function(lx,lz){ lx+=5.75; return Math.max(0,RM.h(-1.3+lx*c0+lz*s0,-27.8-lx*s0+lz*c0)-q0); };      // quanto sale il terreno rispetto al piano del foro
        B.striscia(f,0,f,1.3,P.mattone,false).striscia(f,1.3,t,1.3,P.selce,false).striscia(t,1.3,t,1.95,P.mattone,false).striscia(t,1.95,o,1.75,P.coppi,false).striscia(o,0,o,1.75,P.mattone,false);
        B.striscia(cor,.62,cor,.7,P.travertino,false).striscia(cor,.7,f,.7,P.travertino,false);                                  // la cornice sopra le botteghe
        vaniVerso(B,f,0,0,.04,.5,.5,true); vaniVerso(B,f,0,0,.78,.4,.42); vaniVerso(B,t,0,0,1.42,.3,.34,true);
        [-1,1].forEach(function(q){ B.scatola(.9,1.75,.75,.45,0,q*3.32,P.mattone).cilindro(.55,1.5,-.25,0,q*3.32,P.mattone,null,12).cupola(.55,-.25,1.5,q*3.32,P.mattone,.36); });      // le due aule di testata, a semicupola
        var hb=Math.max(1.75,su(4.1,0))+1.3;                                                                                      // gli isolati della via Biberatica
        B.striscia(v,1.75,v,hb,P.mattone,false).striscia(v,hb,u,hb-.2,P.coppi,false).striscia(u,0,u,hb-.2,P.mattone,false);
        [0,v.length-1].forEach(function(i){ B.quad([v[i][0],0,v[i][1]],[u[i][0],0,u[i][1]],[u[i][0],hb-.2,u[i][1]],[v[i][0],hb,v[i][1]],P.mattone); });
        vaniVerso(B,v,0,0,hb-.95,.4,.3); vaniVerso(B,v,0,0,hb-.42,.24,.3,true);
        var ya=su(6.2,-3.6), yc=su(4.9,-2.3);
        B.scatola(3.4,ya+2,2.6,6.2,0,-3.6,P.mattone).falde(3.4,.6,2.7,6.2,ya+2,-3.6,P.coppi,0,P.mattone);                       // la Grande Aula
        B.aperture(4.6,-2.3,7.8,-2.3,5,ya+.9,.6,.34).aperture(7.8,-4.9,4.6,-4.9,5,ya+.9,.6,.34);
        B.scatola(1.9,yc+1.5,1.8,4.9,0,-2.3,P.mattone).scatola(2,.12,1.9,4.9,yc+1.5,-2.3,P.coppi);                               // il corpo centrale
      });
    });
 }},
 {id:'emilia', nome:'Basilica Emilia', x:7.2,z:-1, ry:-.35, come:'fori', fa:function(B){ basilica(B,8,3.4,1.8,0,0); }},
 /* La Basilica Emilia dopo l'incendio, probabilmente del 410 (scheda): il tetto è crollato e non viene rifatto; sul pavimento restano le monete. Qui il pavimento di marmo, i pilastri
    delle arcate rotti ad altezze diverse, i monconi delle colonne della navata, qualche fusto caduto e le travi bruciate. Altezze e numero dei pezzi sono indicativi; il portico di
    facciata che alcuni studiosi vogliono rifatto nel V secolo non si disegna (è discusso). Prima del 23 novembre 2026 era il blocco intero annerito dallo shader («va resa meglio»). */
 {id:'emiliarovina', nome:'Basilica Emilia', x:7.2,z:-1, ry:-.35, come:'fori', note:{chiuso:'in rovina dopo l’incendio'}, fa:function(B){
    var r=RM.casuale(410), i, h, x, TR=P.travertino, CARB=RM.col(0x3a3129);
    B.scatola(8,.08,3.4,0,0,0,P.marmo);                                                                                      // il pavimento
    for(i=0;i<8;i++){ x=-3.5+i; h=.45+1.25*r(); if(r()>.15) B.scatola(.42,h,.34,x,0,1.55,TR); h=.6+1.1*r(); if(r()>.1) B.scatola(.42,h,.34,x,0,-1.55,TR); }      // pilastri delle arcate, verso il Foro e dietro
    [-1,1].forEach(function(k){ B.scatola(.3,.9+.8*r(),3.4,k*3.85,0,0,TR); });                                               // i lati corti
    for(i=0;i<12;i++){ x=-3.3+i*.6; [-.75,.75].forEach(function(z){ if(r()<.75) B.cilindro(.07,.15+.9*r(),x,.08,z,P.marmo,.065,8); }); }      // i monconi delle colonne della navata
    for(i=0;i<5;i++) B.scatola(.85,.12,.12,-3+6*r(),.08,-1+2*r(),P.marmo,r()*3.14);                                            // fusti caduti
    for(i=0;i<6;i++) B.scatola(1.4,.1,.1,-3+6*r(),.1,-1.2+2.4*r(),CARB,r()*3.14);                                               // travi del tetto bruciate
 }},
 {id:'giove', nome:'Tempio di Giove Capitolino', x:-29,z:0, ry:.5, zone:[[0,0,7.5]], fa:function(B){      // basamento di circa 54 x 62 m, la misura più citata (le stime pubblicate vanno da 50 a 74 m di lato: pianta discussa)
    B.scatola(5.4,.2,6.2,0,0,0,P.tufo).dentro(0,.2,0,0,function(B){ B.tempio(4.5,5.3,2.8,0,0,0,{fronte:6,lati:7,tetto:P.oro,podio:.3,r:.17}); });      // podio alto in tutto 5 m: «Its height was apparently from 4 to 5 metres» (Platner e Ashby, Aedes Iovis Capitolini)
 }},
 {id:'palatino', nome:'Palazzi del Palatino', x:13,z:47, ry:-.62, zone:[[-7,-1,13],[7,-1,13],[0,6,12]], fa:function(B){
    arcato(B,27,1.5,18,0,-.4,0,P.mattone,2,22);                                                // sostruzioni
    B.dentro(0,1.1,0,0,function(B){
      portico(B,8.5,8,-7,0,-1,1.2,P.prato);                                                    // Domus Flavia: peristilio
      B.scatola(4.6,3.4,5,-7,0,-7.6,P.intonaco).falde(5,.9,4.8,-7,3.4,-7.6,P.coppi,PI/2,P.intonaco);          // Aula Regia: la sala delle udienze, altissima, con la facciata a colonne verso l'area Palatina
      B.scatola(2.4,2.4,5,-10.8,0,-7.6,P.intonaco).scatola(2.4,2.4,5,-3.2,0,-7.6,P.intonaco);                 // basilica e larario, ai lati
      B.colonne(-11.8,-10.4,-2.2,-10.4,12,1.9,.09,0).scatola(10.2,.14,.7,-7,1.9,-10.3,P.marmo).vano(-7,0,-10.12,1,0,.7,1.5);
      B.aperture(-8.9,-10.12,-5.1,-10.12,3,2.2,.8,.5);
      B.scatola(5.4,2.6,3.6,-7,0,5,P.intonaco).falde(5.6,.7,3.8,-7,2.6,5,P.coppi,0,P.intonaco);               // triclinio, con i due ninfei ovali ai fianchi
      [-1,1].forEach(function(q){ B.cilindro(.9,.14,-7+q*3.6,0,5,P.marmo,null,14).cilindro(.75,.05,-7+q*3.6,.14,5,P.acqua,null,14); });
      arcato(B,9,2.7,13.5,2.6,0,-.5,P.mattone,2,7);                                            // Domus Augustana
      B.scatola(4,.12,4,2.6,2.7,-3.4,P.ombra).scatola(4,.12,4,2.6,2.7,2.6,P.ombra);
      var es=RM.ellisse(4.4,2.2,14,0,PI).map(function(p){ return [p[0]+2.6,p[1]+6.2]; }); B.striscia(es,-1.4,es,2.2,P.mattone,false).fornici(es,-1.1,.8,.5,1,false).fornici(es,.6,.8,.5,1,false);
      B.scatola(4.6,1.6,.3,9.4,0,-4.6,P.mattone).scatola(.3,1.6,14,7.2,0,2.4,P.mattone).scatola(.3,1.6,14,11.6,0,2.4,P.mattone).scatola(4,.1,13.6,9.4,0,2.4,P.prato);   // stadio palatino: giardino a forma di circo, col lato sud curvo
      var cs=RM.ellisse(2.2,1.4,8,0,PI).map(function(p){ return [p[0]+10.6,p[1]+6.8]; }); B.striscia(cs,0,cs,1.6,P.mattone,false);
      B.colonne(9,-6.6,9,6.4,14,.9,.05,.1).colonne(12.2,-6.6,12.2,6.4,14,.9,.05,.1).scatola(.5,.08,13.4,8.75,1,-.1,P.coppi).scatola(.5,.08,13.4,12.45,1,-.1,P.coppi);      // il portico attorno
      B.scatola(1.6,2.2,2.6,13.6,0,-.2,P.mattone).cupola(1.3,13.6,2.2,-.2,P.intonaco,.5);        // la tribuna imperiale, sul lato est
      B.tempio(2.4,3.6,1.8,-11.5,3.4,0,{fronte:6});                                            // tempio di Apollo
    });
    /* Settizodio (203): facciata scenografica a tre ordini di colonne libere, con tre grandi nicchie, verso chi arriva dalla via Appia. Demolito nel 1588-89; forma dai disegni del Cinquecento */
    B.scatola(9,2.9,.5,10.5,-.4,9.2,P.marmo);
    [0,1,2].forEach(function(l){ var yy=-.4+l*.97; B.colonne(6.3,9.95,14.7,9.95,12,.82,.055,yy).scatola(9,.13,.95,10.5,yy+.82,9.62,P.marmo); if(l<2) [-3,0,3].forEach(function(x){ B.vano(10.5+x,yy+.02,9.47,1,0,1.5,.78); }); });
 }},
 {id:'pantheon', nome:'Pantheon', x:-70,z:-68, ry:PI, zone:[[0,0,7],[0,7,6],[0,11.5,5],[0,-3.7,3.5]], et:1, fa:function(B){
    /* La rotonda: tamburo di 56 m di diametro (43,2 dentro e muri di 6,2: Platner), alto circa 31, diviso in tre fasce da cornici; sopra, sette gradoni, il primo
       ancora rivestito di marmo, gli altri e la calotta coperti di tegole di bronzo (dorato secondo Cinti, ripreso da it.wikipedia; il Liber Pontificalis dice solo
       «tegulis aereis»): le toglie Costante II nel 663, Gregorio III (731-741) rifà il tetto «chartis plumbeis» (LP XCII 12). Il cambio di copertura sta nel modulo in fondo. */
    B.cilindro(2.8,3.05,0,0,0,P.intonaco,null,44);
    [1.22,2.2,3.02].forEach(function(y){ B.cilindro(2.87,.09,0,y,0,P.marmo,null,44); });
    for(var gr=0;gr<7;gr++) B.cilindro(2.74-gr*.075,.09,0,3.05+gr*.08,0,gr?P.oro:P.marmo,null,40);                                // i sette gradoni
    B.cupola(2.24,0,3.6,0,P.oro,.44,.2);                                                                                            // calotta con l'occhio di 9 m
    /* Avancorpo: il blocco fra pronao e rotonda, col secondo frontone più alto di quello del pronao; la punta arriva poco sotto la cima del tamburo (forma dalle foto, a memoria). */
    B.scatola(3.44,2.45,1.25,0,0,3,P.intonaco).scatola(3.5,.1,1.3,0,2.35,3,P.marmo).falde(1.3,.55,3.5,0,2.45,3,P.bronzo,PI/2,P.marmo);
    /* Pronao, 34 x 13,6 m (Platner; 34,2 x 15,6 per Ziolkowski), rialzato di 1,3 m sulla piazza: otto colonne di granito grigio in fronte, quattro di granito rosa
       in ciascuna delle due file dietro (Platner), colonne alte 14,15 m con basi e capitelli (Ziolkowski). Nessuna cella: dietro le colonne c'è la porta di bronzo.
       Che le file interne stiano dietro la prima, la terza, la sesta e l'ottava colonna, formando tre navate, è detto a memoria. */
    var ROSA=RM.col(0xa98272), zf=5.1;
    B.scatola(3.42,.13,1.58,0,0,4.41,P.travertino);
    for(var gd=1;gd<=5;gd++) B.scatola(2.6,.13*(6-gd)/6,.06,0,0,5.2+gd*.06,P.travertino);                                          // i cinque gradini
    B.colonne(-1.64,zf,1.64,zf,8,1.415,.074,.13,P.granito);
    [zf-.48,zf-.96].forEach(function(z){ [-1.64,-.7,.7,1.64].forEach(function(x){ B.colonne(x,z,x,z,1,1.415,.074,.13,ROSA); }); });
    B.scatola(3.42,.2,1.6,0,1.545,4.4,P.marmo);                                                                                     // trabeazione; le iscrizioni del fregio e dell'architrave stanno in fondo al file
    B.falde(1.64,.68,3.5,0,1.745,4.42,P.bronzo,PI/2,P.marmo);                                                                       // frontone e tetto, retto da capriate di bronzo
    B.vano(0,.13,3.66,1,0,.62,1.15);                                                                                                // la grande porta di bronzo
    [-1.17,1.17].forEach(function(x){ B.vano(x,.25,3.66,1,0,.4,.85); });                                                           // le due nicchie in fondo alle navate laterali
 }},
 /* La piazza e l'aula a sud stanno in una maglia a parte, perché il cambio di copertura del Pantheon (663, 735) non tocchi i loro tetti di coppi */
 {id:'pantheonpiazza', x:-70,z:-68, ry:PI, come:'pantheon', fa:function(B){
    B.dentro(0,0,9.2,PI,function(B){ portico(B,7,6.2,0,0,0,.9,P.selce); });                                                         // piazza porticata su tre lati, chiusa sul lato nord
    /* A sud, addossata alla rotonda, l'aula detta basilica di Nettuno: 45 x 19 m, con un'abside di 9 m nel muro nord (Platner, Thermae Agrippae). Altezza e tetto sono ricostruiti. */
    B.scatola(4.5,2,1.9,0,0,-3.7,P.mattone).falde(4.6,.5,2,0,2,-3.7,P.coppi,0,P.mattone);
 }},
 {id:'domiziano', nome:'Stadio di Domiziano', x:-101,z:-74, ry:PI/2, lunga:[28,7.5], fa:function(B){ stadio(B,27.5,10.6,1.9); }},      // circa 275 x 106 m, la curva a nord: è piazza Navona. Ordini di arcate e altezza della facciata sono ricostruiti
 {id:'traiano', nome:'Terme di Traiano', x:97.4,z:3.7, ry:-.62, zone:[[0,0,23]], fa:function(B){ terme(B,31,32,{pc:21,zc:-3.8}); }},      /* posizione: il centro della relazione OpenStreetMap 13162787 «Thermae Traianae» (Nominatim, 23 novembre 2026); prima stava circa 95 m più a ovest */
 /* Terme di Tito: «just west of the later thermae Traianae on the edge of the slope overhanging the Colosseum, with the same orientation as the domus Aurea … about 105 by 120 metres.
    The façade and principal entrance were on the north side … a caldarium projecting out from the south side» (Platner e Ashby, Thermae Titi). Oggi quasi nulla resta (it.wikipedia: fra via Nicola Salvi,
    via delle Terme di Tito e viale del Monte Oppio). Centro e orientamento sono stimati da queste vie; corpo unico senza recinto, caldario verso il Colosseo. */
 {id:'tito', nome:'Terme di Tito', x:68,z:10, ry:0, zone:[[0,0,5]], fa:function(B){ terme(B,10.5,12,{recinto:false,lc:10.5,pc:8.5,zc:-.5,rc:.9}); }},      // corpo centrale di circa 190 x 212 m, verso il lato nord del recinto (it.wikipedia, da Caruso e Volpe); il caldarium tondo è schematico
 {id:'caracalla', nome:'Terme di Caracalla', x:59,z:150, ry:-.78, zone:[[0,0,25]], et:1, fa:function(B){ terme(B,33.7,32.8,{rc:1.75,stadio:true,esedreLati:true}); }},      // il caldarium rotondo, al centro del lato sud-ovest, ha una cupola di 35 m; sul fondo del recinto la gradinata e le cisterne, sui fianchi le due esedre (Platner)
 {id:'diocleziano', nome:'Terme di Diocleziano', x:101,z:-122, ry:-.78, zone:[[0,0,27.5]], et:1, fa:function(B){ terme(B,37.6,36,{lc:28,pc:16,caldarium:'rettangolo',tepidarium:'tondo',rotonde:true}); }},      // corpo centrale di 280 x 160 m, caldarium rettangolare che sporge a sud-ovest, tepidarium circolare, grande esedra al centro del lato sud-ovest, due sale rotonde agli angoli ovest e sud (Platner)
 {id:'massenzio', nome:'Basilica di Massenzio', x:25,z:7, ry:-.35, zone:[[0,0,7.5]], fa:function(B){
    B.scatola(8.2,3.5,2.6,0,0,0,P.mattone); for(var i=-1;i<=1;i++){ B.falde(2.7,.9,2.7,i*2.72,3.5,0,P.bronzo,PI/2,P.mattone);
      [-1,1].forEach(function(k){ B.scatola(2.6,2.4,2,i*2.72,0,k*2.3,P.mattone).volta(2,1.3,i*2.72,2.4,k*2.3,P.intonaco,PI/2); B.vano(i*2.72,.25,k*3.31,1,0,.5,.9).vano(i*2.72-.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72+.75,.25,k*3.31,1,0,.5,.9).vano(i*2.72,1.4,k*3.31,1,0,1.6,1.5); }); }      // ogni campata laterale: tre archi in basso e il grande finestrone sopra
    B.falde(8.2,.9,2.6,0,3.5,0,P.bronzo,0,P.mattone);
    B.aperture(-3.9,1.31,3.9,1.31,3,2.75,.7,1.5).aperture(3.9,-1.31,-3.9,-1.31,3,2.75,.7,1.5);                    // i finestroni della navata, sopra le volte laterali
    B.cilindro(1.25,3.2,-4.15,0,0,P.mattone,null,16).cupola(1.25,-4.15,3.2,0,P.intonaco,.6);                      // l'abside ovest, dove stava il colosso di Costantino
    /* Costantino aggiunge «a second entrance from the Sacra via in the middle of the south side» e, di fronte, «a second semicircular apse in the north wall», grande come quella ovest
       ma più bassa (Platner e Ashby, Basilica Constantini). Qui +z è il sud, verso la via Sacra. */
    B.colonne(-1,3.75,1,3.75,4,1.5,.09,0).scatola(2.6,.14,.8,0,1.5,3.7,P.marmo);                                  // il portico d'ingresso sul fianco sud
    B.cilindro(1,2.4,0,0,-3.3,P.mattone,null,16).cupola(1,0,2.4,-3.3,P.intonaco,.6);                               // l'abside nord, la sala del tribunale
 }},
 {id:'venere', nome:'Tempio di Venere e Roma', x:36.3,z:17.8, ry:-.42, zone:[[0,0,9.5]], fa:function(B){                            // tempio di Venere e Roma
    /* Posizione e orientamento dal contorno della piattaforma su OpenStreetMap (relazione 1841091, 23 novembre 2026): i lati lunghi corrono a circa 24° a sud dell'est, lungo la via Sacra,
       che passa libera fra il podio e il Palatino. Prima era girato di 7° di meno e copriva la strada a est dell'Arco di Tito.
       Podio di 145 x 100 m rivestito di travertino; tempio decastilo e pseudodiptero, con colonne di 1,8 m di diametro e due celle schiena contro schiena, ciascuna con quattro colonne fra le ante;
       sui lati lunghi del recinto, portici di colonne di granito grigio (Platner e Ashby). La cella di Roma guarda il Foro (-x), quella di Venere il Colosseo (+x).
       Non lette: il numero delle colonne sui fianchi (qui 22) e le altezze. Le tegole erano di bronzo dorato: le porta via papa Onorio I verso il 630. */
    B.scatola(14.5,.7,10,0,0,0,P.travertino);
    for(var g=0;g<3;g++){ var hg=.7*(3-g)/4; B.scatola(.26,hg,6,-7.38-g*.26,0,0,P.travertino); [-1,1].forEach(function(q){ B.scatola(.26,hg,1.7,7.38+g*.26,0,q*3.9,P.travertino); }); }      // la scalinata verso il Foro e le due rampe verso il Colosseo
    [-1,1].forEach(function(q){ B.colonne(-6.9,q*4.7,6.9,q*4.7,22,1.25,.09,.7,P.granito).scatola(14,.1,.5,0,1.95,q*4.7,P.coppi); });
    B.scatola(10.9,.3,5.2,0,.7,0,P.marmo);
    [-1,1].forEach(function(q){
      B.scatola(4.6,1.9,3.3,q*2.3,1,0,P.marmo).vano(q*4.63,1,0,0,1,.7,1.45,true);                                            // la cella e la sua porta
      B.colonne(q*5,-1,q*5,1,4,1.9,.09,1).colonne(q*5.3,-1.906,q*5.3,1.906,8,1.9,.09,1).colonne(-5.3,q*2.45,5.3,q*2.45,22,1.9,.09,1);
    });
    B.scatola(10.9,.32,5.2,0,2.9,0,P.marmo).falde(10.9,.72,5.3,0,3.22,0,P.oro,0,P.marmo);
 }},
 /* L'arco sta a nove metri dal centro del recinto di Venere e Roma, dentro la sua terrazza: con una terrazza propria, più bassa, restava sepolto. Ora poggia sullo stesso piano del tempio,
    che è il colmo della via Sacra fra il Foro e la valle del Colosseo; per questo la voce sta dopo quella del tempio. */
 {id:'arcotito', nome:'Arco di Tito', x:27.2,z:20.15, ry:1.14, come:'venere', fa:function(B){                                     // un solo fornice, a cavallo della via Sacra; posizione e orientamento dal contorno su OpenStreetMap (way 23913953): il fornice guarda a ovest-nord-ovest verso il Foro e a est-sud-est verso il Colosseo
    /* «13.50 metres wide, 15.40 high, and 4.75 deep. The archway is 8.30 metres high and 5.36 wide»; colonne scanalate su piedistalli; «an attic 4.40 metres in height, on which is
       the inscription» (Platner e Ashby, Arcus Titi). Il fornice ora è aperto (23 novembre 2026). Che cosa stesse in cima la voce non lo dice: niente. */
    muroForato(B,1.35,1,.475,[[0,.536,.83]],P.marmo);
    B.scatola(1.45,.1,.58,0,1,0,P.marmo).scatola(1.35,.44,.475,0,1.1,0,P.marmo);
    [1,-1].forEach(function(q){ [-.58,-.38,.38,.58].forEach(function(x){ B.scatola(.13,.2,.1,x,0,q*.27,P.marmo); }); B.colonne(-.58,q*.27,.58,q*.27,2,.8,.05,.2).colonne(-.38,q*.27,.38,q*.27,2,.8,.05,.2);
      B.scatola(.7,.28,.02,0,1.18,q*.24,P.travertino); });                                                                                        // i piedistalli, le colonne, la lastra dell'iscrizione
 }},
 {id:'adriano', nome:'Mausoleo di Adriano', x:-156.97,z:-118, ry:.064,      /* sull'asse di ponte Sant'Angelo (OpenStreetMap): il ponte arriva alla porta (24 novembre 2026; prima x -157, ry 0,1) */ zone:[[0,0,10]], et:1, fa:function(B){
    /* basamento quadrato di circa 84 m di lato e 10 di altezza, tamburo di 64 m di diametro e 21 di altezza, sopra un giardino (Platner) */
    B.scatola(8.4,1,8.4,0,0,0,P.marmo).scatola(8.55,.12,8.55,0,1,0,P.marmo).cilindro(3.2,2.1,0,1.12,0,P.travertino,null,40).cilindro(3.27,.1,0,3.12,0,P.marmo,null,40).cilindro(3,.3,0,3.22,0,P.prato,2.2,24).scatola(1.5,1.7,1.5,0,3.4,0,P.marmo).scatola(1.6,.1,1.6,0,5.1,0,P.marmo);
    B.vano(0,0,4.23,1,0,.7,.85);                                                                                 // l'ingresso, verso il ponte
    for(var st=0;st<20;st+=5) uomo(B,3.05*Math.cos(st*PI/10),3.22,3.05*Math.sin(st*PI/10),2.2,P.marmo);            // le poche statue sull'orlo che restano dopo il 537: le altre stanno in 'adrianostatue'
    for(var k=0;k<14;k++) B.cono(.22,1.2,2.5*Math.cos(k*.449),3.45,2.5*Math.sin(k*.449),P.chioma,6);
 }},
 /* Le statue del mausoleo, che nel 537 spariscono. Procopio (Guerre V 22, 13-14 e 22, nella traduzione di Dewing, riletto il 22 novembre 2026): la tomba è di marmo pario e in alto
    ci sono statue dello stesso marmo, «representing men and horses»; gli assediati fanno a pezzi la maggior parte delle statue, che erano molto grandi, e ne gettano le pietre sui Goti.
    Qui: sedici statue su venti sull'orlo del tamburo e i quattro gruppi di uomini e cavalli agli angoli del basamento (Platner e Ashby, «Mausoleum Hadriani»: agli angoli il muro
    si ispessisce per reggerli). Numero, misure e forma sono indicativi.
    La quadriga in cima: Platner e Ashby la riferiscono a Giovanni di Antiochia (una «colossal quadriga on the summit») e riportano il dubbio di Hülsen; è un'ipotesi, dichiarata nella scheda.
    Quando sia sparita non lo dice nessuna fonte letta: qui scompare con le statue, e anche questo è un'ipotesi. */
 {id:'adrianostatue', x:-156.97,z:-118, ry:.064, come:'adriano', fa:function(B){
    for(var st=0;st<20;st++) if(st%5) uomo(B,3.05*Math.cos(st*PI/10),3.22,3.05*Math.sin(st*PI/10),2.2,P.marmo);
    [-3.95,3.95].forEach(function(x){ [-3.95,3.95].forEach(function(z){ var ry=Math.atan2(x,z);      // ogni gruppo guarda in fuori, lungo la diagonale
      B.scatola(.62,.08,.62,x,1.12,z,P.marmo); cavallo(B,x,1.2,z,ry,2.2,P.marmo); uomo(B,x+.2*Math.cos(ry),1.2,z-.2*Math.sin(ry),2.2,P.marmo); }); });
    [-.33,-.11,.11,.33].forEach(function(x){ cavallo(B,x,5.2,.2,0,2.2,P.statua); });                               // i quattro cavalli, verso il ponte
    B.scatola(.5,.16,.26,0,5.2,-.36,P.statua).scatola(.5,.12,.04,0,5.36,-.25,P.statua); uomo(B,0,5.36,-.38,2.2,P.statua);      // il carro e chi lo guida
 }},
 {id:'augusto', x:-74,z:-151, ry:0, zone:[[0,0,7]], fa:function(B){                             // mausoleo di Augusto
    B.cilindro(4.4,1.2,0,0,0,P.travertino,null,40).cilindro(4,.3,0,1.2,0,P.prato,3.2,24).cilindro(2.6,1.1,0,1.4,0,P.travertino,null,30).cilindro(1,1.5,0,2.5,0,P.marmo,null,16).scatola(.3,.6,.3,0,4,0,P.bronzo);
    for(var k=0;k<18;k++) B.cono(.22,1.2,3.6*Math.cos(k*.349),1.45,3.6*Math.sin(k*.349),P.chioma,6);
    B.vano(0,0,4.42,1,0,.5,.85);                                                                                 // l'ingresso, a sud
    [-.9,.9].forEach(function(x){ B.scatola(.22,.2,.22,x,0,5.1,P.marmo).cilindro(.09,1.4,x,.2,5.1,P.sabbia,.06,4).cono(.065,.14,x,1.6,5.1,P.sabbia,4); });      // i due obelischi ai lati dell'ingresso
 }},
 {id:'pompeo', x:-94.3,z:-30.8, ry:-PI/2, zone:[[0,0,10],[0,-14,10]], fa:function(B){ teatro(B,8,2.6); B.tempio(2,2.6,1.4,0,6.6,PI,{fronte:6}); portico(B,13,18,0,0,-11.5,1.1,P.prato); }},   // teatro e portici di Pompeo
 {id:'marcello', nome:'Teatro di Marcello', x:-49.85,z:9, ry:PI*.8, zone:[[0,0,7.5]], fa:function(B){ teatro(B,6,2.9,true); }},      /* centro e raggio ricavati dal cerchio della facciata curva conservata (OpenStreetMap, via 86217821: raggio di circa 59 m); prima il teatro stava circa 45 m più a nord-est e copriva i due templi */
 /* I due templi a nord del teatro, sui contorni di OpenStreetMap (vie 182282759 e 998844739): Apollo «in circo», detto Sosiano (it.wikipedia) e quello che gli studi successivi a Platner e Ashby
    identificano con Bellona (per loro, nel 1929, il sito di Bellona «is not known with certainty»; it.wikipedia lo pone accanto al tempio di Apollo). Fronte verso nord, verso il circo Flaminio:
    orientamento e alzati sono indicativi. Chiusi come gli altri templi dopo le leggi di Teodosio. */
 {id:'apollo', nome:'Tempio di Apollo Sosiano', x:-47.8,z:.8, ry:PI, zone:[[0,0,2.3]], fa:function(B){ B.tempio(2,3.3,1.5,0,0,0,{fronte:6,lati:9,podio:.4}); }},
 {id:'bellona', nome:'Tempio di Bellona', x:-44.8,z:1.15, ry:PI, zone:[[0,0,2.4]], fa:function(B){ B.tempio(1.6,3.9,1.4,0,0,0,{fronte:6,podio:.4}); }},      // «built with three series of open arcades»: dorico, ionico e un terzo ordine a lesene corinzie, perduto (Platner)
 {id:'laterano', nome:'San Giovanni in Laterano', x:169,z:73, ry:.1, zone:[[0,0,8],[8,0,6],[-11.3,-3.5,2.6]], fa:function(B){
    /* cinque navate «fortemente digradanti in altezza» e in fondo «una navatella trasversale, il primitivo transetto» (it.wikipedia, Basilica di San Giovanni in Laterano); larghezze e altezze indicative */
    cinqueNavate(B,10,{nave:1.9,nav:.85,hn:2.9,hi:2,he:1.4,ra:.95,ali:{prof:1.4,alto:1.9},atrio:{lato:4.8,prof:4.8}});
    B.cilindro(1.2,1.6,-11.3,0,-3.5,P.mattone,null,8).cono(1.3,.7,-11.3,1.6,-3.5,P.coppi,8); }},      // il battistero ottagonale, dov'è oggi (OpenStreetMap): dietro l'abside, verso nord
 /* Il Patriarchio, la residenza del vescovo di Roma accanto alla basilica dal IV secolo (it.wikipedia, «Palazzo del Laterano», che riassume il Liber Pontificalis): verso la metà dell'VIII secolo
    papa Zaccaria vi costruisce un triclinio; Leone III (795-816) un altro, «di ampiezza impressionante», con un'abside a mosaico e altre dieci absidi. Demolito da Sisto V alla fine del Cinquecento.
    Stava a nord della basilica, dove oggi sono il palazzo del Laterano e la Scala Santa (OpenStreetMap: Scala Santa a 178,8, 59,2). Forma e misure sono uno schema: della pianta antica non sappiamo. */
 {id:'patriarchio', nome:'Patriarchio lateranense', x:176.5,z:63, ry:.1, zone:[[0,0,4.2]], fa:function(B){
    B.scatola(7,1.6,2,0,0,0,P.intonaco).falde(7.2,.5,2.2,0,1.6,0,P.coppi,0,P.intonaco);                       // il corpo lungo, verso la basilica
    B.scatola(2.2,1.9,3,-2.6,0,-2.2,P.intonaco).falde(2.4,.5,3.2,-2.6,1.9,-2.2,P.coppi,PI/2,P.intonaco);      // un'ala a nord
    B.scatola(1,3,1,3.1,0,-.6,P.mattone).falde(1.1,.4,1.1,3.1,3,-.6,P.coppi,0,P.mattone);                   // una torre
 }},
 {id:'triclinioleone', nome:'Triclinio di Leone III', x:183,z:61.5, ry:.1, come:'patriarchio', zone:[[0,0,2.4]], fa:function(B){
    B.scatola(3.4,1.8,1.5,0,0,0,P.intonaco).falde(3.5,.45,1.6,0,1.8,0,P.coppi,0,P.intonaco);
    B.cilindro(.62,1.5,1.7,0,0,P.intonaco,null,12).cono(.66,.35,1.7,1.5,0,P.coppi,12);                       // l'abside principale; le dieci absidi laterali non si disegnano
 }},
 /* La Curia (aula alta e stretta, 27 x 18 m, rifatta da Diocleziano dopo l'incendio del 283) e, dal 630 circa, la stessa aula come chiesa di Sant'Adriano (Liber Pontificalis, vita di Onorio I).
    Stessa posizione e orientamento che aveva dentro i Fori (inForo). Separate il 23 novembre 2026 perché si vedesse il cambio (l'utente: «la Curia falla più carina… non c'erano dei bronzi?»
    e, per la chiesa, «ricostruiscila più spoglia»). Della Curia: la facciata di mattoni rivestita di stucco a finti blocchi, con lo zoccolo di lastre di marmo, la cornice e il frontone,
    tre finestre e la porta con i battenti di bronzo, che dal 1660 stanno in San Giovanni in Laterano: quindi c'erano ancora nella chiesa. Il portichetto davanti è discusso; le statue
    di bronzo sul frontone sono come le mostrano le monete con la Curia di Augusto (un'immagine più antica: qui indicativa). La chiesa: le stesse mura, tetto di coppi, niente portico né statue. */
 /* Il Pantheon chiesa di Santa Maria ad Martyres (13 maggio 609): una croce in cima al frontone del pronao (23 novembre 2026, richiesta dell'utente). La croce è indicativa: che ci fosse
    e come fosse non è scritto nelle fonti lette. Stessa posizione e orientamento del Pantheon. */
 {id:'pantheonchiesa', x:-70,z:-68, ry:PI, come:'pantheon', zone:[], fa:function(B){
    B.scatola(.07,.5,.07,0,2.4,5.18,P.oro).scatola(.28,.07,.07,0,2.72,5.18,P.oro);
 }},
 /* La Curia prima dell'incendio del 283, al tempo di Carino (voce «Curia Julia» della Wikipedia inglese): la sua forma non è nota, qui è la stessa aula con un portichetto. Brucia nel 283 e,
    ancora bruciata, si vede nel 284; dal 285 al suo posto sale la Curia di Diocleziano (23 novembre 2026, l'utente: «se la Curia è bruciata e viene ricostruita da Diocleziano fallo vedere») */
 {id:'curiaantica', x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    curiaAula(B,P.bronzo); B.scatola(1.5,.25,.5,0,0,1.6,P.travertino);
 }},
 {id:'curia', x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    curiaAula(B,P.bronzo);
    B.scatola(1.96,.85,.04,0,0,1.36,P.marmo).scatola(2.0,.1,2.76,0,2.32,0,P.marmo);                                                  // zoccolo di marmo in facciata e cornice tutt'attorno
    B.scatola(.5,.12,.05,0,1.32,1.37,P.marmo);                                                                                       // architrave della porta
    B.scatola(1.5,.25,.5,0,0,1.6,P.travertino).colonne(-.62,1.72,.62,1.72,4,.95,.055,.25).scatola(1.6,.07,.62,0,1.2,1.6,P.coppi);          // gradini e portichetto davanti alla porta
    B.scatola(.12,.34,.12,0,3.0,1.25,P.bronzo).scatola(.1,.26,.1,-.88,2.4,1.25,P.bronzo).scatola(.1,.26,.1,.88,2.4,1.25,P.bronzo);      // statue di bronzo sul frontone
 }},
 {id:'santadriano', nome:"Sant'Adriano (la Curia)", etichetta:"Sant'Adriano", x:.8,z:-5.1, ry:-.35, come:'fori', zone:[], fa:function(B){
    /* 24 novembre 2026 (segnalato nelle prove delle infografiche: nel 700 era «una scatola bianca senza dettagli»). È la stessa aula della Curia: la facciata di mattoni, qui senza lo
       stucco a finti blocchi, che non si sa quanto restasse; la cornice, l'architrave della porta e i battenti di bronzo, che dal 1660 stanno in San Giovanni in Laterano e quindi
       c'erano ancora nella chiesa. Niente statue sul frontone e niente portichetto; tetto di coppi e la croce. Quanto stucco e quanto marmo restassero non è detto dalle fonti lette. */
    curiaAula(B,P.coppi,P.mattone);
    B.scatola(2.0,.1,2.76,0,2.32,0,P.travertino).scatola(.5,.12,.05,0,1.32,1.37,P.marmo);                                              // la cornice tutt'attorno e l'architrave della porta
    B.scatola(1.0,.18,.4,0,0,1.55,P.travertino);                                                                                    // i gradini davanti alla porta
    B.scatola(.07,.5,.07,0,2.95,1.3,P.oro).scatola(.28,.07,.07,0,3.27,1.3,P.oro);                                                    // la croce sul frontone
 }},
 {id:'pietro', nome:'San Pietro', x:-259,z:-108, ry:0, zone:[[0,0,9],[10,0,7]], et:1, fa:function(B){
    sanPietro(B);
    B.scatola(5.4,.07,7.2,13.7,0,0,P.selce).scatola(5.4,.1,.5,13.7,0,3.4,P.travertino).scatola(5.4,.1,.5,13.7,0,-3.4,P.travertino);      // il sagrato lastricato davanti all'atrio, dove si raccolgono i pellegrini
 }},
 {id:'tegolepietro', x:-259,z:-108, ry:0, come:'pietro', fa:function(B){ tegolePietro(B); }},      // dal 630: le tegole di bronzo di Onorio I sopra i tetti della basilica
 /* L'obelisco del circo di Nerone (Caligola, anno 40) resta in piedi accanto alla rotonda di Sant'Andrea (it.wikipedia, Obelisco Vaticano): c'è da prima della basilica.
    Posizione originale dalla targa in piazza dei Protomartiri Romani (OpenStreetMap, nodo 13308484173, «Original Obelisk Position»). */
 {id:'obeliscovaticano', nome:'Obelisco vaticano', x:-258.3,z:-101.1, ry:0, come:'pietro', zone:[[0,0,.8]], fa:function(B){
    B.scatola(.5,.3,.5,0,0,0,P.travertino).cilindro(.2,2.4,0,.3,0,P.sabbia,.12,4).cono(.13,.25,0,2.7,0,P.sabbia,4);
 }},
 /* ---- costruiti durante la storia, in ordine di data ---- */
 {id:'sole', nome:'Tempio del Sole', x:-30,z:-106, ry:.16, zone:[[0,0,9],[0,11.6,5]], fa:function(B){
    /* Dai disegni di Palladio, attribuiti al tempio da Hülsen (incerto): un cortile grande di 130 x 90 m con al centro una rotonda di 25 m circa, la cella di 10 e sedici colonne;
       sullo stesso asse una sala quadrata di 15 m e un primo cortile di 55 x 75 m con due emicicli (en.wikipedia, da Richardson). Che il cortile minore stia a sud è una nostra scelta; gli emicicli non sono disegnati. */
    portico(B,8,13,0,0,0,1.2); B.cilindro(1.25,.3,0,.1,0,P.travertino,null,24).cilindro(.5,1.7,0,.4,0,P.marmo,null,16).cilindro(1.2,.16,0,1.9,0,P.marmo,null,24).cupola(1.2,0,2.06,0,P.bronzo,.5);
    for(var k=0;k<16;k++) B.cilindro(.07,1.5,1.12*Math.cos(k*.3927),.4,1.12*Math.sin(k*.3927),P.marmo,.06,7);
    B.scatola(1.5,1.6,1.5,0,0,7.25,P.mattone).falde(1.6,.4,1.6,0,1.6,7.25,P.coppi,0,P.mattone);
    portico(B,5.5,7.5,0,0,11.75,1.2);
 }},
 {id:'arcocostantino', nome:'Arco di Costantino', x:44.5,z:30.4, ry:-.3, zone:[[0,0,3]], fa:function(B){
    /* Rifatto il 23 novembre 2026 (Platner e Ashby, Arcus Constantini): «21 metres high, 25.70 wide, and 7.40 deep; the central archway is 11.50 high and 6.50 wide, and the two
       lateral arches are 7.40 metres high and 3.36 wide»; «eight fluted Corinthian columns of giallo antico» su piedistalli; «eight statues of Dacians in pavonazzetto… standing on
       the cornice in front of the attic, each above one of the giallo antico columns»; nell'attico l'iscrizione e otto rilievi rettangolari; sopra i fornici laterali, quattro tondi
       per facciata. I fornici ora sono aperti. Dei rilievi si vede solo dove stanno; se in cima ci fosse una quadriga la voce non lo dice: non c'è. */
    muroForato(B,2.57,1.5,.74,[[0,.65,1.15],[-.8,.336,.74],[.8,.336,.74]],P.marmo);
    B.scatola(2.69,.14,.86,0,1.5,0,P.marmo).scatola(2.57,.46,.74,0,1.64,0,P.marmo).scatola(2.63,.05,.8,0,2.08,0,P.marmo);                          // cornice, attico, coronamento
    [1,-1].forEach(function(q){ var z=q*.375, ry=q>0?0:Math.PI;
      [-1.2,-.4,.4,1.2].forEach(function(x){ B.scatola(.2,.4,.2,x,0,q*.47,P.marmo).colonne(x,q*.47,x,q*.47,1,.98,.058,.4,P.sabbia).scatola(.22,.14,.22,x,1.5,q*.47,P.marmo);      // piedistallo, colonna di giallo antico, il suo tratto di trabeazione
        uomo(B,x,1.64,q*.49,1.55,P.marmo,ry); });                                                                                                  // i Daci
      B.scatola(.68,.36,.02,0,1.69,z,P.travertino); [-.98,-.62,.62,.98].forEach(function(x){ B.scatola(.3,.36,.02,x,1.69,z,P.travertino); });    // l'iscrizione e i rilievi dell'attico
      [-.9,-.7,.7,.9].forEach(function(x){ disco(B,.085,.02,x,.98,z,ry,P.travertino); });                                                         // i tondi
      B.scatola(.5,.1,.02,-.8,1.16,z,P.travertino).scatola(.5,.1,.02,.8,1.16,z,P.travertino); });                                                 // il fregio basso sopra i fornici laterali
 }},
 {id:'termecostantino', nome:'Terme di Costantino', x:21.5,z:-65.9, ry:-.2, sc:.45, zone:[[0,0,9]], fa:function(B){      // senza peribolo: il corpo occupa tutto lo spazio fra le strade, davanti si apre un'area chiusa a nord da una linea curva (Platner). Misure schematiche
    terme(B,33,32,{recinto:false,pc:14,zc:2});
    var cv=RM.ellisse(10,6,16,PI,2*PI).map(function(p){ return [p[0],p[1]-6]; });
    B.scatola(20,.08,6,0,0,-8,P.selce).striscia(cv,0,cv,1.2,P.mattone,false);
 }},
 {id:'croce', nome:'Santa Croce in Gerusalemme', x:253.3,z:47.6, ry:2.72, zone:[[0,0,4]], fa:function(B){
    var L=3.65, W=2.2, H=2.2;                                                                  // l'aula del palazzo Sessoriano: un vano solo di 36 x 22 m, alto quanto largo, non una basilica a navate
    B.scatola(L,H,W,0,0,0,P.mattone).falde(L,.42,W+.12,0,H,0,P.coppi,0,P.mattone);
    [1,-1].forEach(function(q){ var a=-q*(L/2-.15), b=q*(L/2-.15); B.aperture(a,q*W/2,b,q*W/2,5,.3,.8,.42).aperture(a,q*W/2,b,q*W/2,5,1.35,.62,.4); });      // due ordini di cinque finestre per lato
    B.cilindro(W*.34,1.75,-L/2,0,0,P.mattone,null,14).cono(W*.36,.45,-L/2,1.75,0,P.coppi,14);  // l'abside aggiunta quando l'aula diventa chiesa
    B.vano(L/2+.03,0,0,0,1,.45,.9).vano(L/2+.03,1.25,0,0,1,.5,.6);
 }},
 /* San Lorenzo: la basilica di Costantino è un'aula cimiteriale a forma di circo, 99 x 35 m, 98,60 x 35,50 m per Krautheimer, parallela alla basilica attuale e circa 28 m a sud del suo fianco; la facciata, a est, cade all'altezza dell'ingresso sud della chiesa di Pelagio e il corpo si allunga verso ovest (Corpus Basilicarum II, pp. 116-117);
    nel 580 Pelagio II costruisce sopra la tomba una chiesa più piccola, a gallerie, con l'abside a ovest: è il presbiterio della basilica attuale. */
 {id:'lorenzo', nome:'San Lorenzo, la basilica maggiore', x:296,z:-104.4, ry:.35+PI, zone:[[0,0,6]], fa:function(B){
    var L=9.9, W=3.55, Ln=L-(W-1.9), pr=function(w){ return RM.stadio(L-(W-w),w,8,10); }, est=pr(W), nav=pr(1.9), x1=Ln/2-.95;
    B.striscia(est,0,est,1,P.mattone).striscia(est,1,nav,1.35,P.coppi).striscia(nav,1.35,nav,2.1,P.mattone);                  // navatella che gira attorno all'abside, come nelle altre basiliche a circo
    B.falde(x1+Ln/2,.5,2,(x1-Ln/2)/2,2.1,0,P.coppi,0,P.mattone).cono(1,.5,x1,2.1,0,P.coppi,14);
    B.fornici(est,.35,.45,.4,1,false).fornici(nav,1.5,.42,.4,1,false);
    B.vano(-L/2-.03,0,0,0,-1,.5,.95);
 }},
 {id:'lorenzopelagio', nome:'San Lorenzo, la chiesa di Pelagio II', x:299.5,z:-111.6, ry:.35, zone:[[0,0,3]], fa:function(B){
    var L=3.2;
    B.scatola(L,1.95,.95,0,0,0,P.mattone).falde(L,.4,1.05,0,1.95,0,P.coppi,0,P.mattone);                                      // navata alta quasi venti metri
    [-1,1].forEach(function(q){ B.scatola(L,1.35,.58,0,0,q*.76,P.mattone).scatola(L+.06,.1,.62,0,1.35,q*.76,P.coppi); });      // navatelle a due piani: sopra, le gallerie
    [1,-1].forEach(function(q){ var a=-q*(L/2-.2), b=q*(L/2-.2); B.aperture(a,q*1.05,b,q*1.05,6,.85,.38,.24).aperture(a,q*.475,b,q*.475,6,1.5,.34,.22); });
    B.cilindro(.45,1.5,-L/2,0,0,P.mattone,null,12).cono(.48,.4,-L/2,1.5,0,P.coppi,12);
    B.vano(-.3,0,1.08,1,0,.44,.8);                                                                                            // l'ingresso sul fianco sud
 }},
 /* Sant'Agnese. La basilica di Costantina è un'aula cimiteriale a forma di circo: OpenStreetMap (way 23944398, «Basilica costantiniana di S. Agnese») ne dà il fianco nord-est, larghezza 41 m,
    asse a 40° e la curva dell'abside a nord-ovest; quel contorno si ferma dopo 79 m, ma il mausoleo, attaccato al fianco sud-ovest, sporge oltre, quindi l'aula era più lunga:
    la si porta a 98 m, misura ricordata da Krautheimer e qui non riletta (ipotesi). Abbandonata probabilmente nel VII secolo (it.wikipedia, Complesso monumentale di Sant'Agnese). */
 {id:'agnese', nome:"Sant'Agnese, la basilica di Costantina", x:265.6,z:-340.3, ry:2.449, zone:[[-3.2,0,2.4],[0,0,2.4],[3.2,0,2.4]], fa:function(B){
    var L=9.8, W=4.1, wn=2.2, Ln=L-(W-wn), pr=function(w){ return RM.stadio(L-(W-w),w,8,10); }, est=pr(W), nav=pr(wn), x1=Ln/2-wn/2;
    B.striscia(est,0,est,1,P.mattone).striscia(est,1,nav,1.35,P.coppi).striscia(nav,1.35,nav,2.1,P.mattone);                  // navatella che gira attorno all'abside, come a San Lorenzo
    B.falde(x1+Ln/2,.5,wn+.1,(x1-Ln/2)/2,2.1,0,P.coppi,0,P.mattone).cono(wn/2+.05,.5,x1,2.1,0,P.coppi,14);
    B.fornici(est,.35,.45,.4,1,false).fornici(nav,1.5,.42,.4,1,false);
    B.vano(-L/2-.03,0,0,0,-1,.5,.95);
 }},
 /* il mausoleo di Costantina, oggi Santa Costanza: posizione e diametro da OpenStreetMap (way 35306502) */
 {id:'costanza', nome:'Mausoleo di Costantina (Santa Costanza)', x:265.8,z:-334.9, ry:0, sc:.7, zone:[[0,0,2.2]], fa:function(B){
    B.cilindro(2.4,1,0,0,0,P.mattone,null,24).cono(2.5,.4,0,1,0,P.coppi,24).cilindro(1.5,2,0,0,0,P.mattone,null,20).cupola(1.5,0,2,0,P.coppi,.6);
 }},
 /* La chiesa di Onorio I sopra la tomba: «fecit ecclesiam beatae Agne martyris, via Numentana… a solo, ubi requiescit» (Liber Pontificalis, Onorio I, Duchesne I p. 323).
    Pianta da OpenStreetMap (way 205704488): circa 30 x 20 m, asse a 40°, abside a sud-est. Semisotterranea: si entrava dall'alto, sulle gallerie (it.wikipedia). Alzato indicativo. */
 {id:'agneseonorio', nome:"Sant'Agnese, la chiesa di Onorio I", x:278.25,z:-338.5, ry:2.449, zone:[[0,0,2]], fa:function(B){
    var L=3;
    B.scatola(L,1.7,.9,0,0,0,P.mattone).falde(L,.35,1,0,1.7,0,P.coppi,0,P.mattone);
    [-1,1].forEach(function(q){ B.scatola(L,1.2,.55,0,0,q*.72,P.mattone).scatola(L+.06,.1,.6,0,1.2,q*.72,P.coppi); });      // navatelle con le gallerie sopra
    [1,-1].forEach(function(q){ var a=-q*(L/2-.2), b=q*(L/2-.2); B.aperture(a,q*1,b,q*1,6,.75,.34,.22).aperture(a,q*.45,b,q*.45,6,1.3,.3,.2); });
    B.cilindro(.35,1.3,-L/2,0,0,P.mattone,null,12).cono(.38,.35,-L/2,1.3,0,P.coppi,12);
    B.vano(L/2+.03,.85,0,0,1,.4,.7);                                                                                          // l'ingresso in alto, all'altezza delle gallerie
 }},
 /* San Paolo dei tre imperatori: «un edificio a cinque navate, con 80 colonne e un quadriportico» (it.wikipedia), lunga 131 m e larga 65, alta 29,70; transetto alto quanto la navata. Larghezze delle navate indicative. */
 {id:'paolo', nome:'San Paolo fuori le mura', x:-70.1,z:375.7, ry:2.98, zone:[[0,0,10],[8,0,7]], et:1, fa:function(B){
    cinqueNavate(B,12,{nave:2.4,nav:1,hn:2.8,hi:2,he:1.4,ra:1.2,transetto:{prof:2.4,lung:7.2,alto:true},atrio:{lato:5.3,prof:5.3}});
 }},
 /* la prima chiesa, di Costantino: «fecit Augustus Constantinus basilicam beato Paulo apostolo» (Liber Pontificalis, Silvestro); «un piccolo edificio probabilmente a tre navate» con la tomba presso l'abside (it.wikipedia).
    Rivolta al contrario della basilica di Teodosio: abside a ovest, sulla tomba, ingresso dalla via Ostiense. Misure ipotetiche. */
 {id:'paolocostantino', nome:'San Paolo di Costantino', x:-63.4,z:376.8, ry:-.162, zone:[[0,0,2.6]], fa:function(B){ chiesa(B,4,2.2,false,{strette:true,atrio:false}); }},
 /* Santa Sabina: «tre navate, divise da dodici colonne doppie» e un nartece che era un braccio del quadriportico (it.wikipedia). Le navatelle larghe metà della navata sono il rapporto consueto, non una misura letta. */
 {id:'sabina', nome:'Santa Sabina', x:-46,z:89, ry:.785, sc:.62, zone:[[0,0,6]], fa:function(B){ chiesa(B,10,6,false,{strette:true}); }},
 /* Santa Maria Maggiore di Sisto III: «tre navate, divise da 21 colonne» per lato, con 21 finestre per lato nella navata (it.wikipedia). Navatelle: come a Santa Sabina, proporzione consueta. */
 {id:'mariamaggiore', nome:'Santa Maria Maggiore', x:109,z:-57, ry:-.5, sc:.82, zone:[[0,0,8]], fa:function(B){ chiesa(B,10,6,false,{strette:true,finestre:21}); }},
 {id:'stefano', nome:'Santo Stefano Rotondo', x:94.5,z:88, ry:0, zone:[[0,0,5.5]], fa:function(B){
    /* tre cerchi: tamburo (22 m di diametro e 22 di altezza), ambulacro (42 m), anello esterno (66 m). Nell'anello esterno quattro bracci più alti disegnano una croce:
       stanno sulle diagonali (quello di nord-est sopravvive, è la cappella dei Santi Primo e Feliciano); fra un braccio e l'altro, un corridoio basso lungo il muro e un cortile. */
    var e3=RM.ellisse(3.29,3.29,36), e3t=RM.ellisse(3.34,3.34,36), e2=RM.ellisse(2.78,2.78,36), k, a;
    B.striscia(e3,0,e3,.75,P.mattone).striscia(e3t,.75,e2,.98,P.coppi).striscia(e2,.98,e2,0,P.mattone);
    B.cilindro(2.1,1.2,0,0,0,P.mattone,null,32).cono(2.18,.45,0,1.2,0,P.coppi,32);
    for(k=0;k<4;k++){ a=PI/4+k*PI/2; B.scatola(1.35,1.25,1.1,2.66*Math.cos(a),0,2.66*Math.sin(a),P.mattone,-a).falde(1.4,.35,1.2,2.66*Math.cos(a),1.25,2.66*Math.sin(a),P.coppi,-a,P.mattone); }
    B.cilindro(1.125,2.2,0,0,0,P.mattone,null,22).cono(1.2,.5,0,2.2,0,P.coppi,22);
    for(k=0;k<22;k++) B.scatola(.12,.3,.06,1.145*Math.cos(k*.2856),1.75,1.145*Math.sin(k*.2856),P.ombra,-k*.2856+PI/2);
 }},
 {id:'cosma', nome:'Santi Cosma e Damiano', x:16.5,z:4, ry:-.35, come:'fori', fa:function(B){
    B.scatola(2.2,2,3.6,0,0,0,P.mattone).falde(3.6,.6,2.4,0,2,0,P.coppi,PI/2,P.mattone).cilindro(.9,1.4,0,0,2.6,P.mattone,null,16).cupola(.9,0,1.4,2.6,P.bronzo,.6);
 }},
 {id:'foca', nome:'Colonna dell\'imperatore Foca', x:-3.7,z:.6, ry:-.35, come:'fori', fa:function(B){
    B.scatola(1.1,.22,1.1,0,0,0,P.mattone).scatola(.7,.28,.7,0,.22,0,P.marmo).cilindro(.07,1.36,0,.5,0,P.marmo,.065,10).scatola(.2,.1,.2,0,1.86,0,P.marmo).scatola(.12,.3,.12,0,1.96,0,P.oro);   // colonna «1.39 metres in diameter and 13.60 high», con «the statue of Phocas in gilt bronze» (Platner e Ashby, Columna Phocae)
 }},
 /* ---- il quartiere di San Pietro: cresce mentre la città antica si svuota ---- */
 {id:'monasteripietro', nome:'Monastero dei Santi Giovanni e Paolo', x:-261,z:-108, ry:0, zone:[[0,0,14],[-15,4,5]], fa:function(B){
    var y=suTerreno(-261,-108,0);
    casa(B,y(-3,-9.5),-3,-9.5,4.6,2.8,1.5);                 // Santi Giovanni e Paolo, a nord del transetto (Leone I)
 }},
 {id:'monasteripietro2', nome:'Monasteri di San Martino e Santo Stefano Maggiore', x:-261,z:-108, ry:0, fa:function(B){
    var y=suTerreno(-261,-108,0);
    casa(B,y(-8,2.6),-8,2.6,2.6,3,1.4);                     // San Martino, addossato all'abside a sud-ovest: c'è nel 679-680 (Beda)
    casa(B,y(-15.5,4),-15.5,4,4,3,1.5);                     // Santo Stefano Maggiore, dietro l'abside: data di fondazione non letta, qui compare con San Martino
 }},
 /* Le due rotonde sul fianco sud, lungo la spina del circo di Nerone. Da ovest: il mausoleo di Onorio (poi Santa Petronilla), attaccato alla testata del transetto,
    e un mausoleo dell'età di Caracalla, che Simmaco (498-514) fa chiesa di Sant'Andrea (it.wikipedia, Antica basilica di San Pietro; Liber Pontificalis, Simmaco).
    Sant'Andrea sta subito a ovest del posto vero dell'obelisco; distanze fra le due rotonde e diametri sono indicativi (pianta di Alfarano, non riletta). */
 {id:'andreapietro', nome:"Rotonda di Sant'Andrea", x:-260.6,z:-101.4, ry:0, zone:[[0,0,1.6]], fa:function(B){
    var q=suTerreno(-260.6,-101.4,0)(0,0); B.cilindro(1.3,1.9,0,q-.3,0,P.mattone,null,18).cono(1.4,.5,0,q+1.6,0,P.coppi,18);
 }},
 {id:'petronilla', nome:'Mausoleo di Onorio (Santa Petronilla)', x:-263.2,z:-101.4, ry:0, zone:[[0,0,1.6]], fa:function(B){
    var q=suTerreno(-263.2,-101.4,0)(0,0); B.cilindro(1.3,1.9,0,q-.3,0,P.mattone,null,18).cono(1.4,.5,0,q+1.6,0,P.coppi,18);
 }},
 /* Il campanile di San Pietro: «fecit super basilicam beati Petri apostoli turrem, quam ex parte inauravit et ex parte argento investivit, in quo tribus posuit campanis» (Liber Pontificalis, Stefano II, 752-757;
    il passo è un'aggiunta di una parte dei manoscritti). Pochi anni dopo la stessa fonte nomina una «turrem sanctae Mariae ad Grada» all'ingresso dell'atrio: per questo sta lì, accanto ai tre fornici. Forma e misure sono ipotetiche. */
 {id:'campanilepietro', nome:'Campanile di San Pietro', x:-247.65,z:-105.5, ry:0, quota:quota(-259,-108)+.05, zone:[[0,0,1.2]], fa:function(B){
    B.scatola(.9,3.3,.9,0,0,0,P.mattone).scatola(1,.1,1,0,3.3,0,P.travertino).cono(.72,.55,0,3.4,0,P.oro);
    [1.2,2,2.75].forEach(function(y){ B.aperture(-.45,.45,.45,.45,2,y,.4,.2).aperture(.45,-.45,-.45,-.45,2,y,.4,.2).aperture(.45,.45,.45,-.45,2,y,.4,.2).aperture(-.45,-.45,-.45,.45,2,y,.4,.2); });      // tre ordini di bifore: le campane stanno nell'ultimo
 }},
 {id:'porticopietro', nome:'Portico dei pellegrini', x:-201.75,z:-108.1, ry:.0685, lunga:[90.5,2.2], fa:function(B){          // dalla testata di ponte Sant'Angelo (posizione da OpenStreetMap), sotto il mausoleo, ai gradini dell'atrio: circa 900 m
    var y=suTerreno(-201.75,-108.1,.0685), q;
    for(var k=0;k<12;k++){ var lx=(k-5.5)*7.54; q=y(lx,0);
      B.scatola(7.64,.12,1.5,lx,q+1.05,0,P.coppi).colonne(lx-3.65,-.6,lx+3.65,-.6,8,1.35,.06,q-.3).colonne(lx-3.65,.6,lx+3.65,.6,8,1.35,.06,q-.3); }
 }},
 /* «Item episcopia in eodem loco dextra levaque fecit» (Liber Pontificalis, Simmaco, 498-514): le due case stanno dove erano prima nel portico, ora con un'origine davanti all'atrio */
 {id:'episcopiapietro', nome:'Residenze di papa Simmaco', x:-248.11,z:-108.18, ry:.0685, fa:function(B){
    var y=suTerreno(-248.11,-108.18,.0685);
    [[0,-6.75],[0,6.75]].forEach(function(p){ casa(B,y(p[0],p[1]),p[0],p[1],2.6,3.4,1.3); });      // a destra e a sinistra dell'atrio
 }},
 /* Le scholae: quella dei Sassoni dal 727 (tradizione tarda su re Ine), le altre tre dal 799, quando le nomina per la prima volta il Liber Pontificalis (Leone III).
    La torre campanaria di Stefano II non sta qui: è campanilepietro (prima ce n'era una seconda copia, che compariva nel 727). */
 {id:'scholae', nome:'La comunità dei Sassoni (Schola dei Sassoni)', etichetta:'Comunità dei Sassoni', ex:-199.5,ez:-95.5, x:-233,z:-108, ry:0, zone:[[33.5,12.5,5]], fa:function(B){
    var y=suTerreno(-233,-108,0), q;
    [[33.5,12.5]].forEach(function(p){       // Sassoni, verso il fiume, sul sito di Santo Spirito in Sassia (OpenStreetMap)
      q=y(p[0],p[1]); casa(B,q,p[0]-1.2,p[1],3.6,2.4,1.2); casa(B,q,p[0]+1.4,p[1]+2,1.6,3,1,PI/2);
      B.scatola(1.3,1.8,2.6,p[0]+2.6,q-.3,p[1]-1.6,P.mattone).falde(2.6,.4,1.5,p[0]+2.6,q+1.5,p[1]-1.6,P.coppi,PI/2,P.mattone).cilindro(.5,1.4,p[0]+2.6,q-.3,p[1]-3,P.mattone,null,10);
    });
 }},
 {id:'scholae2', nome:'Le comunità dei Frisoni, dei Franchi e dei Longobardi (scholae)', etichetta:'Comunità di Frisoni, Franchi e Longobardi', ex:-245,ez:-91, x:-233,z:-108, ry:0, zone:[[14,9,5],[-8,17,5],[-12,-11,5],[-32,12.5,4]], fa:function(B){
    var y=suTerreno(-233,-108,0), q;
    [[14,9],[-8,17],[-12,-11]].forEach(function(p){       // Frisoni sul sito dei Santi Michele e Magno (OpenStreetMap), Franchi a sud dell'atrio, Longobardi a nord (posizione discussa)
      q=y(p[0],p[1]); casa(B,q,p[0]-1.2,p[1],3.6,2.4,1.2); casa(B,q,p[0]+1.4,p[1]+2,1.6,3,1,PI/2);
      B.scatola(1.3,1.8,2.6,p[0]+2.6,q-.3,p[1]-1.6,P.mattone).falde(2.6,.4,1.5,p[0]+2.6,q+1.5,p[1]-1.6,P.coppi,PI/2,P.mattone).cilindro(.5,1.4,p[0]+2.6,q-.3,p[1]-3,P.mattone,null,10);
    });
    casa(B,y(-32,12.5),-32,12.5,3.2,2.6,1.4);                                                 // Santo Stefano Minore, a sud presso le rotonde (seconda metà dell'VIII secolo)
 }},
 /* Procopio (Guerra gotica I 19): «Just below the bridge» legato alle mura, dove la corrente esce dall'arcata, due barche «side by side and two feet apart», con «two mills on either boat»
    e la ruota appesa in mezzo; sotto, altre coppie in fila «for a great distance». Qui cinque coppie, subito a valle di ponte Aurelio; misure delle barche e della ruota indicative. */
 {id:'mulini', nome:'Mulini sul Tevere', x:-111.7,z:4.6, ry:-.37, fa:function(B){
    [-6,-3,0,3,6].forEach(function(lx){ var y=.72;
      B.scatola(2,.26,.45,lx,y,-.26,P.tronco).scatola(2,.26,.45,lx,y,.26,P.tronco);
      B.geo(new THREE.CylinderGeometry(.3,.3,.06,10).rotateX(PI/2).translate(lx-.2,y+.25,0),P.tronco);
      [-.26,.26].forEach(function(z){ B.scatola(.8,.5,.4,lx+.5,y+.26,z,P.intonaco).falde(.9,.22,.48,lx+.5,y+.76,z,P.coppi,0,P.intonaco); });
    });
 }},
 {id:'casenerva', nome:'Case nel foro di Nerva', x:10.7,z:-8.9, ry:.672, come:'fori', fa:function(B){
    casa(B,.1,-2.2,.2,3.4,2.2,1.7); B.aperture(-3.6,1.33,-.8,1.33,4,.1,.75,.4);        // domus a due piani con portico ad arcate
    casa(B,.1,2.6,-.1,2.6,2,1.4);
 }},
 /* Teatro e Crypta di Balbo. Posizioni reali (OpenStreetMap): l'isolato del museo fra via Caetani, via delle Botteghe Oscure, via dei Polacchi e via dei Delfini è la crypta;
    la cavea (95 m di diametro) sta a ovest, sotto palazzo Mattei. Misure del portico e forma dell'esedra sono indicative. */
 {id:'balbo', nome:'Teatro e Crypta di Balbo', x:-57.7,z:-21.5, ry:-PI/2, zone:[[0,2.4,5.6],[0,-5.6,6.8]], et:1, fa:function(B){
    teatro(B,4.75,2);                                                                              // cavea verso ovest, scena lungo l'odierna via Caetani
    portico(B,9,8.4,0,0,-5.6,.9);                                                                  // la crypta: cortile porticato dietro la scena
    var es=RM.ellisse(1.1,1.1,12,PI,2*PI).map(function(p){ return [p[0],p[1]-9.8]; });             // l'esedra sul lato est: tombe nel VI secolo, scarico nel VII, calcara nell'VIII
    B.striscia(es,0,es,1.5,P.mattone,false).fornici(es,.2,.8,.5,1,false);
 }},
 /* Emporio. La Porticus Aemilia è posta sul muro superstite fra via Rubattino e via Florio (OpenStreetMap, relazione 17192321), che ne dà l'orientamento, e va da via Marmorata
    a via Franklin: 487 x 60 m, cinquanta navate a gradoni verso il fiume (ricostruzione di G. Gatti sulla Forma Urbis). Che il muro sia al centro dell'edificio è una nostra scelta.
    I magazzini di Galba (circa 200 x 155 m, tre cortili) sono dietro, verso il Testaccio: la posizione è indicativa, la pianta è schematica. Banchine lungo la riva reale. */
 {id:'emporio', nome:'Emporio e Porticus Aemilia', x:-89.6,z:133, ry:.764, lunga:[48.7,4.2], zone:[[-15,13,8.6],[-5,13,8.6]], et:1, fa:function(B){
    var n=50, w=48.7/n, r=w/2-.04, j, k, i;
    for(j=0;j<4;j++){ var z0=-3+j*1.5, hh=.62+j*.17, arco=[];
      for(i=0;i<=5;i++) arco.push([r*Math.cos(PI*i/5), hh+r*Math.sin(PI*i/5)]);
      B.scatola(48.7,hh,1.5,0,0,z0+.75,P.tufo);
      for(k=0;k<n;k++){ var cx=-24.35+(k+.5)*w;
        for(i=0;i<5;i++){
          B.quad([cx+arco[i][0],arco[i][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0+1.5],[cx+arco[i][0],arco[i][1],z0+1.5],P.intonaco);
          B.tri([cx,hh,z0],[cx+arco[i][0],arco[i][1],z0],[cx+arco[i+1][0],arco[i+1][1],z0],j?P.tufo:P.ombra);                              // testata della volta: aperta verso il fiume
          if(j===3) B.tri([cx,hh,z0+1.5],[cx+arco[i][0],arco[i][1],z0+1.5],[cx+arco[i+1][0],arco[i+1][1],z0+1.5],P.tufo);
        }
      }
    }
    B.aperture(24.35,-3,-24.35,-3,n,.05,.5);
    for(k=0;k<4;k++){ var ax=-19.1+k*6.07; B.scatola(1.8,.95,15.5,ax,0,13,P.mattone).falde(15.6,.4,1.9,ax,.95,13,P.coppi,PI/2,P.mattone); }     // magazzini di Galba: quattro ali di celle, tre cortili
    [-1,1].forEach(function(q){ B.scatola(20,.95,1.8,-10,0,13+q*6.85,P.mattone).falde(20.1,.4,1.9,-10,.95,13+q*6.85,P.coppi,0,P.mattone); });
    B.scatola(47,1.5,1,0,-1.75,-13.7,P.travertino);                                                                                         // muro di banchina
    for(k=-4;k<=4;k++) B.scatola(1.8,1.15,1.2,k*5.2,-1.75,-14.6,P.travertino);                                                             // scale e rampe verso l'acqua
 }},
 {id:'testaccio', nome:'Monte Testaccio', x:-84,z:184, ry:0, zone:[[4,-10,6],[0,-3,10.5],[1,5,11],[4,11,6]], et:1, fa:function(B){       // collina di cocci d'anfora: 35 m sul piano, qui 1,8 volte tanto come gli altri rilievi
    /* A terrazze, come dice la scheda («i cocci disposti a terrazze»): scarpate ripide e ripiani, sei gradoni (il numero è indicativo). Il contorno, quello di oggi, è arrotondato
       tagliando gli spigoli due volte: prima la collina era una tenda a spicchi (23 novembre 2026). */
    var H=6.3, k, sc=1, y=-.15, N=6, chiaro=P.cocci.clone().multiplyScalar(1.16), profilo=TESTACCIO;
    for(k=0;k<2;k++) profilo=profilo.map(function(p,i,L){ var q=L[(i+1)%L.length]; return [[p[0]*.75+q[0]*.25,p[1]*.75+q[1]*.25],[p[0]*.25+q[0]*.75,p[1]*.25+q[1]*.75]]; }).reduce(function(a,b){ return a.concat(b); },[]);
    function giro(s){ return profilo.map(function(p){ return [p[0]*s,p[1]*s]; }); }
    for(k=0;k<N;k++){ var y1=k===N-1?H:y+(H+.15)/N, s1=sc-.04, s2=sc-.092;
      B.striscia(giro(sc),y,giro(s1),y1,P.cocci); if(k<N-1) B.striscia(giro(s1),y1,giro(s2),y1+.03,chiaro); sc=k<N-1?s2:s1; y=y1+.03; }
    B.striscia(giro(sc),H,profilo.map(function(){ return [0,0]; }),H+.14,chiaro);
 }},
 /* ======== Inventario del 22 novembre 2026: i monumenti che mancavano, al loro posto antico. Fonti lette: Platner e Ashby (LacusCurtius), it.wikipedia, OpenStreetMap (Overpass,
    Nominatim, API), annotate voce per voce; ciò che è detto «indicativo» non viene da una fonte. Le misure in metri delle fonti stanno nei commenti; nel modello 1 unità = 10 m. ======== */
 /* Colonna di Marco Aurelio (176-193): «100 Roman feet (29.77 metres)» fra plinto, fusto e capitello; fusto di 26,50 m con 3,90 di diametro; plinto e toro alti 1,385; capitello dorico di 1,5
    (Platner e Ashby, Columna M. Aurelii Antonini). Posizione: OpenStreetMap, way 201735339. Il piedistallo antico, oggi in parte sotto il suolo e rifasciato da Sisto V, è indicativo (circa 10 m);
    del recinto con il tempio del Divo Marco, che Platner crede a ovest della colonna, non si conosce la pianta. */
 {id:'colonnamarco', nome:'Colonna di Marco Aurelio', x:-44,z:-92.8, ry:0, zone:[[0,0,2.2]], fa:function(B){
    B.scatola(.8,.95,.8,0,-.1,0,P.marmo).scatola(.9,.1,.9,0,.85,0,P.marmo);                        // piedistallo e cornice (indicativi)
    B.cilindro(.235,.1385,0,.95,0,P.marmo,.215,18);                                                  // plinto e toro
    B.coclide(.195,.18,2.65,0,1.0885,0,21,P.marmo);                                                  // il fusto col fregio a spirale (ventuno giri è il numero corrente, non letto in Platner): rastrema meno di quello di Traiano
    B.scatola(.44,.15,.44,0,3.7385,0,P.marmo).cilindro(.14,.12,0,3.8885,0,P.marmo,.12,12);           // capitello dorico e tamburo in cima
 }},
 /* Orologio di Augusto. L'obelisco di Psammetico II, portato da Augusto nel 10 a.C., è alto 21,79 m e fa da gnomone a una meridiana: un pavimento di marmo a nord, con le linee di bronzo dorato
    (Platner e Ashby, Obeliscus Augusti; Plinio NH XXXVI 72). In piedi nell'VIII secolo (Itinerario di Einsiedeln), caduto in data ignota. Stava sotto piazza del Parlamento, dove se ne trovarono i pezzi
    nel 1502 e la meridiana nel 1748 (it.wikipedia «Obelisco di Montecitorio»; Nominatim, way 28157922). In cima, la sfera di cui parla Plinio. Lunghezza della meridiana (circa 50 m, l'ombra di
    mezzogiorno d'inverno) dal calcolo di Thayer nella stessa pagina; larghezza del pavimento e altezza del basamento indicative.
    Ara Pacis (13-9 a.C.): stava dove poi sorse palazzo Fiano (it.wikipedia «Ara Pacis»; Nominatim, way 80220845). Recinto di circa 11,6 x 10,6 m alto circa 4,6, ingresso a ovest: misure a memoria, indicative.
    Colonna di Antonino Pio (161): monolite di granito rosso alto 14,75 m con 1,90 di diametro, su un piedistallo di marmo bianco, con la statua di Antonino in cima come sulle monete
    (Platner e Ashby, Columna Antonini Pii). Posizione da it.wikipedia (41,90155 N, 12,47742 E); altezza del piedistallo indicativa. */
 {id:'orologio', nome:'Orologio di Augusto', x:-56.68,z:-108.69, ry:0, zone:[[0,0,1.4],[0,-2.8,2.4],[6.13,-12,1.2],[-8.62,8.12,.7]], fa:function(B){
    var X=-56.68, Z=-108.69;
    luogo(B,X,Z,X,Z,0,.4,function(B){
      obelisco(B,2.18,.24,.3,0,0); B.geo(new THREE.SphereGeometry(.09,10,8).translate(0,2.57,0),P.oro);           // basamento, fusto e sfera
      B.scatola(1.6,.04,5.2,0,0,-2.85,P.marmo).scatola(.05,.045,5,0,0,-2.85,P.oro);                               // il pavimento della meridiana e la linea di bronzo dorato
    });
    luogo(B,X,Z,-50.55,-120.69,-PI/2,.7,function(B){                                                               // Ara Pacis: fronte (+z) verso ovest
      B.scatola(1.3,.1,1.2,0,0,0,P.travertino).scatola(.4,.1,.3,0,0,.75,P.travertino);                             // podio e scala davanti alla porta ovest
      B.scatola(1.165,.46,.06,0,.1,.531,P.marmo).scatola(1.165,.46,.06,0,.1,-.531,P.marmo).scatola(.06,.46,1.062,.5525,.1,0,P.marmo).scatola(.06,.46,1.062,-.5525,.1,0,P.marmo);
      B.vano(0,.1,.565,1,0,.36,.36,true).vano(0,.1,-.565,-1,0,.36,.36,true);                                       // le due porte
      B.scatola(.62,.2,.7,0,.1,-.05,P.marmo);                                                                       // l'altare
    });
    luogo(B,X,Z,-65.3,-100.57,0,.3,function(B){                                                                    // colonna di Antonino Pio
      B.scatola(.36,.25,.36,0,0,0,P.marmo).cilindro(.095,1.475,0,.25,0,P.granito,.085,14).scatola(.22,.06,.22,0,1.725,0,P.marmo).cilindro(.04,.16,0,1.785,0,P.statua,.04,6);
    });
 }},
 /* Obelisco degli Horti Sallustiani: copia romana, alta 13 m, dei geroglifici dell'obelisco di Ramesse II del Circo Massimo; in piedi nell'VIII secolo (Itinerario di Einsiedeln); nel XV secolo
    a terra in due pezzi. La base di granito, di 2,50 x 2,55 m, fu ritrovata nel 1843 fra via Sicilia, via Sardegna, via Toscana e via Abruzzi (Platner e Ashby, Obeliscus Hortorum Sallustianorum).
    Il punto è via Toscana (Nominatim, way 4951071): vale per il luogo del ritrovamento; dell'ippodromo degli horti, sulla cui spina it.wikipedia lo pone, non si conosce la pianta. Altezza della base indicativa. */
 {id:'obeliscosallustiano', nome:'Obelisco degli Horti Sallustiani', x:51.38,z:-182.26, ry:0, zone:[[0,0,1]], fa:function(B){ obelisco(B,1.3,.135,.25,0,0,.255,P.granito); }},
 /* Piramide di Gaio Cestio (18-12 a.C.): alta 36,40 m, base quadrata di 29,50 m (it.wikipedia «Piramide Cestia»; Platner e Ashby danno 27 e circa 22). Contorno e orientamento: OpenStreetMap,
    way 432946457. Dal 271-275 è murata nella cinta Aureliana. */
 {id:'piramide', nome:'Piramide Cestia', x:-36.84,z:178.38, ry:1.152, zone:[[0,0,2.4]], fa:function(B){ B.scatola(3.05,.08,3.05,0,-.03,0,P.travertino).cono(2.086,3.64,0,.05,0,P.marmo,4); }},
 /* Castra Praetoria (21-23): rettangolo di 440 x 380 m; mura alte 4,73 m; dentro, lungo le mura, una fila di camere alte 3 m con un camminamento sopra; porta ovest a 190 m dal lato nord
    (Platner e Ashby, Castra Praetoria). Aureliano fa entrare nella sua cinta il lato nord, quello est e metà del lato sud (in js/mura.js, da OpenStreetMap); qui c'è il resto, che Costantino
    smantella nel 312 quando scioglie i pretoriani (Zosimo II 17, citato da Platner). Spessore dei muri, larghezza delle camere e torri della porta indicativi. */
 {id:'castrapretorio', nome:'Castra Praetoria', x:179,z:-156.5, ry:0, zone:CASTRA.zone, fa:function(B){
    var X=CASTRA.C[0], Z=CASTRA.C[1];
    CASTRA.muri.forEach(function(p){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ B.scatola(p.len+.1,.52,.3,0,-.05,0,P.mattone).scatola(p.len+.1,.06,.36,0,.47,0,P.tufo); }); });
    CASTRA.camere.forEach(function(p){ luogo(B,X,Z,p.x,p.z,p.ang,.6,function(B){ B.scatola(p.len+.05,.33,.4,0,-.03,0,P.intonaco); }); });
    luogo(B,X,Z,CASTRA.porta[0],CASTRA.porta[1],CASTRA.ang,.6,function(B){
      [-1,1].forEach(function(s){ B.scatola(.5,.75,.6,s*.55,-.05,0,P.mattone); });
      B.scatola(.6,.62,.36,0,-.05,0,P.mattone).vano(0,-.05,.19,1,0,.36,.45).vano(0,-.05,-.19,-1,0,.36,.45);
    });
 }},
 /* Terme di Nerone (62 o 64), rifatte da Alessandro Severo nel 227 e da allora dette Alessandrine: «a rectangular area extending from the north-west corner of the Pantheon to the stadium
    of Domitian, an area of about 190 by 120 metres, and fronted north», con il caldarium che sporge dal centro del lato sud (Platner e Ashby, Thermae Neronianae). Il riquadro sta fra lo stadio
    del modello e il Pantheon, alla latitudine di palazzo Madama, dove ne restano muri (Nominatim, relazione 76432). La pianta interna è quella schematica delle altre terme. */
 {id:'termenerone', nome:'Terme di Nerone e di Alessandro', x:-85.8,z:-72, ry:0, zone:[[-5,0,6.2],[5,0,6.2]], fa:function(B){ terme(B,19.4,12,{recinto:false,lc:18,pc:9,zc:-.6,rc:1.4}); }},
 /* Terme di Agrippa (25-19 a.C.): orientate nord-sud sull'asse del Pantheon, circa 100-120 m da nord a sud e 80-100 da est a ovest; appena a nord del centro una sala rotonda di circa 25 m,
    di un rifacimento non anteriore ad Alessandro Severo, l'«arco della Ciambella» (Platner e Ashby, Thermae Agrippae). Centro: OpenStreetMap, relazione 6596512. Altezze indicative. */
 {id:'termeagrippa', nome:'Terme di Agrippa', x:-68.78,z:-49.23, ry:0, zone:[[0,-2.5,5],[0,2.5,5]], fa:function(B){
    B.scatola(9,1.3,11,0,0,0,P.intonaco).falde(11,.4,9.2,0,1.3,0,P.coppi,PI/2,P.intonaco);
    B.cilindro(1.25,1.9,0,0,-1,P.mattone,null,24).cupola(1.25,0,1.9,-1,P.intonaco,.55);
    B.aperture(-4.5,5.5,4.5,5.5,9,.15,.7).aperture(4.5,-5.5,-4.5,-5.5,9,.15,.7);
 }},
 /* Tempio del Divo Adriano (145): periptero ottastilo, tredici colonne sui fianchi; restano undici colonne del lato nord, alte 15 m con 1,44 di diametro, su un podio di peperino alto 4 m
    (Platner e Ashby, Hadrianeum; it.wikipedia «Tempio di Adriano»). Posizione e orientamento: l'edificio della Borsa che lo ingloba (Nominatim, way 130920782), con il fianco nord sul limite
    di piazza di Pietra. Fronte a est, verso la via Lata: a memoria. Larghezza e lunghezza (circa 28 x 47 m) vengono dal numero e dal diametro delle colonne con un interasse indicativo. */
 {id:'tempioadriano', nome:'Tempio di Adriano', x:-48.7,z:-80.9, ry:1.641, zone:[[0,0,3.2]], fa:function(B){ tempietto(B,2.8,4.7,.4,1.5,8,0,0,0,true); }},
 /* Tempio del Divo Claudio sul Celio (iniziato nel 54, rifatto da Vespasiano): piattaforma di 180 x 200 m su muri alti fino a 15 m; tempio esastilo, con tre colonne di profondità nel pronao,
    rivolto verso il Palatino (it.wikipedia «Tempio del Divo Claudio»). Centro da it.wikipedia; il lato est è parallelo a via Claudia (OpenStreetMap, way 129115593), dove resta la facciata a nicchie
    della mostra d'acqua. Le misure del tempio sono indicative. */
 {id:'tempioclaudio', nome:'Tempio di Claudio', x:64.72,z:50.57, ry:-1.21, zone:[[-6.5,-4.5,4.5],[0,-4.5,4.5],[6.5,-4.5,4.5],[-6.5,4.5,4.5],[0,4.5,4.5],[6.5,4.5,4.5]], fa:function(B){
    /* La piattaforma sale di 8,5 m sopra la spianata (23 novembre 2026): prima il suo piano era a filo del terreno, e a sud-est il pendio del Celio, più alto, ne copriva un angolo.
       Dal vero la terrazza dominava la valle del Colosseo con le sue sostruzioni e verso il colle arrivava alla quota della cima; l'altezza qui è indicativa. */
    B.scatola(20,3.45,18,0,-2.55,0,P.tufo).scatola(19.6,.06,17.6,0,.87,0,P.prato);                // la piattaforma, a giardino
    B.aperture(10,-9,-10,-9,14,-1.9,1.2,.7);                                                         // le nicchie sul lato di via Claudia
    B.dentro(0,.85,0,0,function(B){ tempietto(B,2.2,3.8,.35,1.4,6,0,0,0,false); });
 }},
 /* Arco di Dolabella e Silano (10 d.C.), in travertino, poi sotto gli archi neroniani dell'acqua Claudia (Platner e Ashby, arcus). Contorno e orientamento: OpenStreetMap, way 135618677.
    Altezza e larghezza del fornice indicative. */
 {id:'dolabella', x:81.86,z:76.56, ry:.89, zone:[[0,0,.7]], fa:function(B){ arcoUno(B,.81,.52,.65,.4,.5,0,0,0,0,P.travertino); }},
 /* Ludus Magnus, la caserma dei gladiatori accanto al Colosseo (Domiziano, rifatta sotto Traiano): celle su tre piani attorno a un cortile con un'arena ellittica e piccole gradinate
    (it.wikipedia «Ludus Magnus»). Orientamento e lunghezza (86 m) dalla parte scavata (OpenStreetMap, relazione 1894844), che è la metà nord; larghezza (circa 72 m) e arena (circa 62 x 45)
    a memoria, indicative. */
 {id:'ludusmagnus', nome:'Ludus Magnus', x:79.6,z:27.8, ry:-.296, zone:[[0,0,5]], fa:function(B){
    [-3,3].forEach(function(z){ B.scatola(8.6,.95,1.2,0,0,z,P.mattone).falde(8.6,.3,1.3,0,.95,z,P.coppi,0,P.mattone); });
    [-3.7,3.7].forEach(function(x){ B.scatola(1.2,.95,4.8,x,0,0,P.mattone).falde(4.8,.3,1.3,x,.95,0,P.coppi,PI/2,P.mattone); });
    B.aperture(-4.2,3.6,4.2,3.6,12,.15,.3).aperture(4.2,-3.6,-4.2,-3.6,12,.15,.3);
    var a=RM.ellisse(3.1,2.25,28), g=RM.ellisse(2.6,1.75,28), c=g.map(function(){ return [0,0]; });
    B.striscia(a,0,a,.35,P.travertino).striscia(a,.35,g,.12,P.tufo).striscia(g,.12,c,.12,P.sabbia);
 }},
 /* Meta Romuli: piramide fra il mausoleo di Adriano e il Vaticano, «larger than the pyramid of Cestius»; copriva l'incrocio di Borgo Nuovo con via di Porta Castello e Alessandro VI
    ne tolse la parte sud nel 1499 (Platner e Ashby, Meta Romuli). Il punto: via di Porta Castello prolungata (OpenStreetMap, way 202591024) fino a Borgo Nuovo, poco a nord del portico
    dei pellegrini: un'ipotesi. Misure: un decimo più della piramide Cestia, indicative. */
 {id:'metaromuli', nome:'Meta Romuli', x:-184,z:-111.9, ry:.0685, zone:[[0,0,2.3]], fa:function(B){ B.scatola(3.3,.08,3.3,0,-.03,0,P.travertino).cono(2.3,4,0,.05,0,P.marmo,4); }},
 /* Foro Boario. Posizioni e orientamenti da OpenStreetMap: tempio rotondo (way 251342364), di Portuno (way 251331418), arco di Giano (way 52924046), degli Argentari (way 123971358);
    lo sbocco della Cloaca da Nominatim (nodo 4754734734). Ercole Vincitore: venti colonne alte 10,6 m (it.wikipedia). Portuno: tetrastilo, pseudoperiptero, ionico (it.wikipedia), fronte
    a nord verso il fiume; podio e colonne di altezza indicativa. Arco di Giano: 12 m di lato e 16 di altezza, fornici di 10,60 x 5,70, quarantotto nicchie (Platner e Ashby, Ianus Quadrifrons);
    l'attico tolto nel 1827 non c'è. Arco degli Argentari (204): architrave su due piloni, alto 6,15 m, luce 3,30 (Platner e Ashby). Cloaca: arco di circa 4,5 m (a memoria). */
 {id:'foroboario', nome:'Foro Boario', x:-29,z:37, ry:0, zone:[[-8.57,4.76,1.2],[-7.45,-.89,1.3],[8.02,-2.06,1],[9.96,-3.56,.5],[-12.93,3.79,.5]], fa:function(B){
    var X=-29, Z=37;
    luogo(B,X,Z,-37.57,41.76,0,.9,function(B){
      B.cilindro(.92,.12,0,0,0,P.travertino,.88,24).cilindro(.42,1.06,0,.12,0,P.marmo,null,20);
      for(var k=0;k<20;k++){ var a=k*PI/10; B.colonne(.72*Math.cos(a),.72*Math.sin(a),.72*Math.cos(a),.72*Math.sin(a),1,1.06,.045,.12); }
      B.cilindro(.8,.08,0,1.18,0,P.marmo,null,24).cono(.82,.32,0,1.26,0,P.coppi,20);
    });
    luogo(B,X,Z,-36.45,36.11,-2.845,.9,function(B){ tempietto(B,1.06,1.95,.25,.88,4,0,0,0,false); });
    luogo(B,X,Z,-20.98,34.94,.314,.7,function(B){
      B.scatola(1.2,1.6,1.2,0,0,0,P.marmo);
      [[0,.61,1,0],[.61,0,0,-1],[0,-.61,-1,0],[-.61,0,0,1]].forEach(function(f){
        B.vano(f[0],0,f[1],f[2],f[3],.57,1.06);
        [-1,1].forEach(function(s){ [.3,.68].forEach(function(y){ [-.09,0,.09].forEach(function(q){ var o=s*.45+q; B.vano(f[0]+f[2]*o,y,f[1]+f[3]*o,f[2],f[3],.055,.16); }); }); });   // tre nicchie per pilone, su due file
      });
    });
    luogo(B,X,Z,-19.04,33.44,0,.4,function(B){ arcoUno(B,.63,.33,.615,.33,.45,0,0,0,0,P.marmo,true); });
    luogo(B,X,Z,-41.93,40.79,0,.5,function(B){ B.scatola(.3,.7,1.2,0,-.55,0,P.tufo).vano(-.16,-.55,0,0,1,.45,.5); });
 }},
 /* Portico d'Ottavia (dopo il 27 a.C., rifatto da Settimio Severo): «a rectangular area, 118 metres in width and somewhat more in length», con una doppia fila di colonne di granito,
    ventotto per fila sulla fronte (Platner e Ashby, Porticus Octaviae); la lunghezza (132 m) è indicativa. Il propileo, che resta come ingresso di Sant'Angelo in Pescheria (dal 755, a memoria),
    è il centro della fronte sud (OpenStreetMap, way 123530471, che dà anche l'orientamento). Dentro, i templi di Giunone Regina e di Giove Statore: misure e posti indicativi. */
 {id:'ottavia', nome:"Portico d'Ottavia", x:-52.9,z:-5.56, ry:-.488, zone:[[0,-3.3,5.2],[0,3.3,5.2],[0,6.3,1.4],[-4.6,-5.3,2.2],[4.6,-5.3,2.2],[-4.6,5.3,2.2],[4.6,5.3,2.2]], fa:function(B){
    portico(B,11.8,13.2,0,0,0,.85,P.prato); B.colonne(-5.3,5.4,5.3,5.4,28,.85,.06,.1,P.granito);
    tempietto(B,1.99,1.29,.12,.95,4,0,6,0,false);                                                     // il propileo
    B.tempio(1.5,2.6,1.1,-2.6,-.6,0,{fronte:6,lati:9,podio:.35}).tempio(1.5,2.6,1.1,2.6,-.6,0,{fronte:6,lati:9,podio:.35});
 }},
 /* Area sacra di largo Argentina: quattro templi repubblicani (III-II secolo a.C.) rivolti a est. Contorni da OpenStreetMap: A (sotto San Nicola de Calcarario, way 125566963), B rotondo
    (way 125566965), C (way 125566967), D (way 125566969); il podio di ciascuno ha la misura del contorno. Altezze di podi e colonne indicative. */
 {id:'argentina', nome:'Area sacra di largo Argentina', x:-70.3,z:-31, ry:0, zone:[[0,-2.5,4],[0,2.5,4]], fa:function(B){
    B.scatola(5,.04,10.4,-.3,0,0,P.selce);
    B.tempio(1.25,2.3,.9,.01,-4.01,1.658,{fronte:6,lati:9,podio:.3});                                 // A
    B.dentro(.37,0,-.97,1.658,function(B){                                                            // B, rotondo
      B.cilindro(.85,.3,0,0,0,P.travertino,null,24).cilindro(.45,.9,0,.3,0,P.marmo,null,18);
      for(var k=0;k<18;k++){ var a=k*PI/9; B.colonne(.72*Math.cos(a),.72*Math.sin(a),.72*Math.cos(a),.72*Math.sin(a),1,.9,.04,.3); }
      B.cilindro(.8,.08,0,1.2,0,P.marmo,null,24).cono(.82,.3,0,1.28,0,P.coppi,18).scatola(.6,.25,.4,0,0,1,P.travertino);
    });
    B.tempio(1.07,1.74,.85,-.37,1.59,1.658,{fronte:4,podio:.4}).tempio(1.4,3.62,1,-.37,4.01,1.658,{fronte:6,podio:.35});   // C e D
 }},
 /* Iseo Campense, il santuario di Iside e Serapide (Domiziano, poi i Severi), «between the Saepta and the temple of Minerva» (Platner e Ashby, Isis): qui il recinto va da piazza di San Macuto
    a Santo Stefano del Cacco (Nominatim) e ad est dell'abside della Minerva; l'ingombro, circa 95 x 210 m, è dato dai punti di ritrovamento ed è indicativo, come il muro. Gli obelischi stanno
    dove furono trovati (Platner e Ashby, Obelisci Isei Campensis; it.wikipedia): il Macuteo in piazza di San Macuto (nel 1373), quello della Minerva nel giardino del convento (1665),
    quello di Dogali sotto l'abside (1883); i punti presso la Minerva sono stimati. Altezze: 6 m, 5,47 m e 6,34 m. Quelli di Boboli e di Urbino, trovati davanti alla chiesa, non ci sono. */
 /* Corretto il 23 novembre 2026: l'Iseo stava 40 m troppo a ovest e copriva i Saepta, che gli studi di Gatti mettono fra il Pantheon e il santuario (it.wikipedia, «Saepta Iulia»:
    fra via del Seminario, via di Sant'Ignazio, via del Plebiscito, via dei Cestari e via della Minerva; «Iseo Campense»: lungo 240 m e largo 60, l'esedra sotto Santo Stefano del Cacco).
    Ora il recinto va dal confine dei Saepta (x -55) a via di Sant'Ignazio, largo 80 m; i punti degli obelischi della Minerva e di Dogali, presso l'abside della chiesa, restano stimati. */
 {id:'iseo', nome:'Iseo Campense', x:-51,z:-62.5, ry:0, zone:[[0,-7.5,4.6],[0,0,4.6],[0,7.5,4.6]], fa:function(B){
    var W=8, L=21;
    B.scatola(W,.5,.2,0,0,-L/2,P.mattone).scatola(W,.5,.2,0,0,L/2,P.mattone).scatola(.2,.5,L,-W/2,0,0,P.mattone).scatola(.2,.5,L,W/2,0,0,P.mattone).scatola(W-.4,.04,L-.4,0,0,0,P.selce);
    obelisco(B,.6,0,.12,1.61,-9.85); obelisco(B,.547,0,.12,-2.8,-1.5); obelisco(B,.634,0,.12,-1.6,1);      // il Macuteo resta in piazza di San Macuto (-49,4, -72,35)
 }},
 /* Saepta Iulia: il recinto delle votazioni finito da Agrippa nel 26 a.C., poi passeggio e mercato; un quadriportico con due grandi portici lunghi (it.wikipedia «Saepta Iulia», da Gatti).
    Posizione secondo Gatti: fra il Pantheon e le terme di Agrippa a ovest e l'Iseo a est, da via del Seminario verso sud (via del Plebiscito chiude l'isolato; lì, lungo il portico sud, il Diribitorium,
    che non si disegna). Platner e Ashby (1929) lo mettevano invece lungo la via Lata: la scheda lo dice. «No reference has been found to it in the Middle Ages»: dopo il V secolo non lo
    nominano più; qui chiude nel 450 (ipotesi). Misure dalle vie di oggi, alzati indicativi. */
 {id:'saepta', nome:'Saepta Iulia', x:-59.25,z:-58.5, ry:0, zone:[[0,-9,4.6],[0,0,4.6],[0,9,4.6]], fa:function(B){
    var W=9.5, L=29;
    B.scatola(W-.4,.04,L-.4,0,0,0,P.selce);                                                             // la grande piazza
    [-1,1].forEach(function(q){ var x=q*(W/2-.7);                                                      // i due portici lunghi, a ovest e a est
      B.scatola(.2,1.3,L,q*(W/2-.1),0,0,P.intonaco).colonne(x-q*.6,-L/2+.6,x-q*.6,L/2-.6,24,1.15,.07,0).falde(L,.32,1.4,x,1.15,0,P.coppi,PI/2,P.intonaco); });
    [-1,1].forEach(function(q){ B.scatola(W,1.3,.25,0,0,q*(L/2-.12),P.intonaco); });                  // i lati corti
 }},
 /* Esquilino. Arco di Gallieno: la porta Esquilina rifatta e dedicata a Gallieno nel 262 (Platner e Ashby, Porta Esquilina; OpenStreetMap, way 81741050); misure a memoria, indicative
    (alto circa 8,8 m). Trofei di Mario, la mostra d'acqua di piazza Vittorio (OpenStreetMap, way 345702226): i trofei di marmo vi restano fino al 1590 (Platner e Ashby, Tropaea Marii); massa
    e altezza (circa 20 m) indicative. Auditorium di Mecenate (OpenStreetMap, relazione 5886457): aula absidata in parte sotto il suolo, misure indicative. */
 {id:'esquilino', nome:'Arco di Gallieno e Trofei di Mario', x:140,z:-28, ry:0, zone:[[-6.93,-8.43,.8],[12.14,-2.42,1.9],[-7.21,11.14,1.5]], fa:function(B){
    var X=140, Z=-28;
    luogo(B,X,Z,133.07,-36.43,1.606,.6,function(B){ arcoUno(B,.73,.35,.88,.45,.66,0,0,0,0,P.travertino); });
    luogo(B,X,Z,152.14,-30.42,.052,1.5,function(B){
      B.scatola(2.4,.5,3.4,0,0,0,P.mattone).scatola(1.2,1.5,1.5,0,.5,0,P.mattone).vano(-.61,.5,0,0,1,.7,1.1);
      [-.95,.95].forEach(function(z){ B.scatola(.3,.9,.5,0,.5,z,P.mattone).scatola(.22,.35,.3,0,1.4,z,P.statua); });   // i due trofei, ai lati
    });
    luogo(B,X,Z,132.79,-16.86,2.548,1.2,function(B){ B.scatola(2.2,.55,1.06,-.12,-.25,0,P.mattone).cilindro(.53,.55,1,-.25,0,P.mattone,null,16).falde(2.3,.18,1.1,-.1,.3,0,P.coppi,0,P.mattone); });
 }},
 /* Tempio di Minerva Medica: aula decagona di mattoni, larga circa 24 m e alta 33, con nove nicchie oltre all'ingresso e dieci finestre ad arco sopra; la cupola cade in parte nel 1828
    (Platner e Ashby, Nymphaeum); «presumibilmente» dell'inizio del IV secolo (it.wikipedia): il 320 è una scelta. Le sale aggiunte attorno non ci sono. OpenStreetMap, relazione 13471829. */
 {id:'minervamedica', nome:'Tempio di Minerva Medica', x:220.27,z:-16.27, ry:.873, zone:[[0,0,2.2]], fa:function(B){
    B.cilindro(1.2,2.35,0,0,0,P.mattone,1.2,10).cupola(1.17,0,2.35,0,P.mattone,.8);
    for(var k=0;k<10;k++){ var t=(k+.5)*PI/5, s=Math.sin(t), c=Math.cos(t), ap=1.2*Math.cos(PI/10)+.01;
      B.vano(s*ap,1.45,c*ap,c,-s,.38,.6); if(k===0) B.vano(s*ap,0,c*ap,c,-s,.4,.9); }
 }},
 /* Sessoriano. Anfiteatro Castrense: ellisse di 88,5 x 78 m (Platner e Ashby, Amphitheatrum Castrense), murato nella cinta Aureliana; centro da OpenStreetMap (nodo 1791417716), asse lungo
    est-ovest come il tratto di mura che lo chiude a sud; altezza e arena indicative. Circo Variano: i carceres stanno dentro le mura (OpenStreetMap, way 261041472, che dà l'orientamento) e la pista
    corre verso nord-nord-est fuori dalla cinta, che la taglia; lunghezza (circa 565 m) a memoria, larghezza dai carceres (91 m), indicativa. L'obelisco di Antinoo vi fu portato da Elagabalo
    (it.wikipedia «Obelisco del Pincio») e fu ritrovato in tre pezzi fuori porta Maggiore: il posto a metà della spina è un'ipotesi. Alto 9,24 m. */
 {id:'sessoriano', nome:'Anfiteatro Castrense e circo Variano', x:246.79,z:53.9, ry:0, zone:[[0,0,4.8]].concat([-24,-16,-8,0,8,16,24].map(function(t){ return [VARIANO.x-246.79+.485*t, VARIANO.z-53.9-.875*t, 6.2]; })), fa:function(B){
    var X=246.79, Z=53.9;
    luogo(B,X,Z,X,Z,0,3,function(B){
      var e=RM.ellisse(4.43,3.9,40), i=RM.ellisse(3.7,3.2,40), a=RM.ellisse(2.4,1.9,40), c=a.map(function(){ return [0,0]; });
      B.striscia(e,-.3,e,1.6,P.mattone).striscia(e,1.6,i,1.6,P.mattone).striscia(i,1.6,a,.25,P.tufo).striscia(a,.25,c,.25,P.sabbia);
      B.fornici(e,.1,.7,.55).fornici(e,.95,.5,.5);
    });
    luogo(B,X,Z,VARIANO.x,VARIANO.z,VARIANO.ry,4,function(B){
      var L=56.5, o=RM.stadio(L,11.5,26,14), t=RM.stadio(L-2,9.5,26,14), asse=t.map(function(p){ return [Math.max(-L/2+4,Math.min(L/2-6,p[0])),0]; });
      B.striscia(o,-1,o,.7,P.mattone).striscia(o,.7,t,.25,P.tufo).striscia(t,.25,asse,.25,P.sabbia);
      B.scatola(30,.18,.5,-1,.2,0,P.travertino);                                                     // la spina
      B.dentro(-1,.38,0,0,function(B){ obelisco(B,.924,0,.1,0,0); });
    });
 }},
 /* Sepolcro di Eurisace, il fornaio (fine della repubblica): trapezio di 8,75, 6,85, 5,80 e 4,05 m, rivestito di travertino, nell'angolo fra Prenestina e Labicana; quando Onorio rifà le mura
    una delle torri di porta Maggiore lo chiude dentro di sé (Platner e Ashby, Sepulchrum Eurysacis): sparisce alla vista nel 402. OpenStreetMap, way 585473524. Altezza (circa 10 m) a memoria. */
 {id:'eurisace', x:248.73,z:11.94, ry:1.187, zone:[[0,0,.7]], fa:function(B){
    B.scatola(.8,.95,.6,0,0,0,P.travertino).scatola(.84,.18,.64,0,.72,0,P.marmo);                    // il fregio con le scene della panificazione
    [.2,.45].forEach(function(y){ B.aperture(-.4,.31,.4,.31,6,y,.14,.07).aperture(.4,-.31,-.4,-.31,6,y,.14,.07); });      // le file di bocche cilindriche
 }},
 /* Archi della via Lata. Arco di Claudio (51-52), sull'acqua Vergine dove passa la via Lata, «in ruins as early as the eighth century» (Platner e Ashby, Arcus Claudii); posizione da it.wikipedia
    (41,89932 N, 12,48110 E): l'acquedotto del modello, interpolato, passa una quarantina di metri più a nord. Arco di Portogallo, «close to the Ara Pacis», di età incerta, con rilievi di Adriano;
    demolito nel 1662 (Platner e Ashby, Arco di Portogallo); posizione da it.wikipedia (41,90310 N, 12,47960 E). Misure di entrambi indicative; i fornici guardano lungo la strada. */
 {id:'archivialata', nome:'Archi della via Lata', x:-41,z:-96.8, ry:0, zone:[[6.19,21.01,.9],[-7,-21,.8]], fa:function(B){
    var X=-41, Z=-96.8;
    luogo(B,X,Z,-34.81,-75.79,.285,.7,function(B){ arcoUno(B,1.4,.55,1.3,.6,.85,0,0,0,0,P.travertino); });
    luogo(B,X,Z,-48,-117.8,.285,.5,function(B){ arcoUno(B,1,.5,1.15,.45,.75,0,0,0,0,P.marmo); });      /* arco di Portogallo: 8 m più a ovest, sull'asse della via del Corso (24 novembre 2026). Il punto di it.wikipedia, per un arco demolito nel 1662, è meno sicuro del tracciato della strada, e che l'arco la scavalcasse è il dato della fonte */
 }},
 /* Arcus Novus sulla via Lata, per Diocleziano e Massimiano: «fu eretto nel 293» per i decennali e demolito nel 1491 (it.wikipedia «Arcus Novus», dove sta anche la posizione:
    41,89818 N, 12,48153 E). Misure indicative. */
 {id:'arcusnovus', nome:'Arcus Novus', x:-31.24,z:-63.12, ry:.285, zone:[[0,0,.8]], fa:function(B){ arcoUno(B,1.2,.5,1.3,.5,.8,0,0,0,0,P.marmo); }},
 /* Alle pendici del Campidoglio, posizioni da OpenStreetMap. Carcere Mamertino (relazione 1849827): ancora prigione nel 368 (Platner e Ashby, Carcer); il corpo fuori terra è indicativo.
    Portico degli Dei Consenti (nodo 1448531164): piccolo colonnato rivolto al Foro, misure indicative. Insula dell'Aracoeli: caseggiato del II secolo addossato al colle, misure indicative.
    Sepolcro di Bibulo (way 124808519): la fronte, larga 6,4 m, guarda la via Flaminia; profondità e altezza indicative. */
 {id:'campidoglio', x:-15,z:-14, ry:0, zone:[[9.08,6.86,.6],[2.01,13.61,.6],[-9.86,-3.78,1],[-2.39,-16.39,.5]], fa:function(B){
    var X=-15, Z=-14;
    luogo(B,X,Z,-5.92,-7.14,1.484,.5,function(B){ B.scatola(1.1,.5,.9,0,-.1,0,P.tufo).vano(0,0,.46,1,0,.22,.3,true); });
    luogo(B,X,Z,-12.99,-.39,1.22,.5,function(B){ B.scatola(1,.6,.35,0,0,-.2,P.tufo).colonne(-.42,.12,.42,.12,6,.5,.035,.05).scatola(1,.06,.3,0,.55,.05,P.marmo); });
    luogo(B,X,Z,-24.86,-17.78,0,.8,function(B){ B.scatola(1.4,1.5,1.1,0,-.2,0,P.mattone).falde(1.5,.25,1.2,0,1.3,0,P.coppi,0,P.mattone);
      [.2,.55,.9].forEach(function(y){ B.aperture(-.6,.56,.6,.56,5,y,.18,.12); }); });
    luogo(B,X,Z,-17.39,-30.39,2.566,.4,function(B){ B.scatola(.64,.6,.5,0,0,0,P.travertino).vano(0,.1,.26,1,0,.16,.3,true); });
 }},
 {id:'leonine', nome:'Mura leonine', x:-215,z:-92, ry:0, zone:LEO.zone, fa:function(B){
    var y=suTerreno(-215,-92,0);
    LEO.passi.forEach(function(p,j){ var q=y(p.x,p.z); B.scatola(p.len+.15,1.35,.45,p.x,q-.3,p.z,P.tufo,p.ang); if(j%4===0) B.scatola(1,2.1,1,p.x,q-.3,p.z,P.tufo,p.ang).scatola(1.15,.12,1.15,p.x,q+1.8,p.z,P.mattone,p.ang); });
 }}
];

/* ---------- messa in scena ---------- */
var riquadro=document.getElementById('scena').parentNode;
var etichette=document.createElement('div'); etichette.className='etichette3d'; riquadro.appendChild(etichette);
function globale(o,lx,lz){ var c=Math.cos(o.ry||0), s=Math.sin(o.ry||0); return [o.x+lx*c+lz*s, o.z-lx*s+lz*c]; }
/* prima le zone: sotto ogni monumento il terreno si spiana alla quota del suo centro; poi si posa il suolo */
var PENDIO={campanilepietro:1,monasteripietro:1,porticopietro:1,scholae:1,leonine:1,mulini:1,monasteripietro2:1,andreapietro:1,petronilla:1,episcopiapietro:1,scholae2:1,obeliscovaticano:1};        // complessi che seguono il pendio: niente terrazza
['orologio','castrapretorio','foroboario','esquilino','sessoriano','archivialata','campidoglio'].forEach(function(k){ PENDIO[k]=1; });      // i gruppi dell'inventario del 22 novembre 2026: pezzi lontani, ognuno sul suo terreno
M.forEach(function(o){
  var h=PENDIO[o.id]?null:RM.hGrezza(o.x,o.z)-.05; o.quota=h;
  var st=D.MONUMENTI&&D.MONUMENTI[o.id], dal=st&&st[0][1]==='assente'&&st.length>1?(D.CANTIERI&&D.CANTIERI[o.id]?D.CANTIERI[o.id]-1:st[1][0]-8):0;      // monumento non ancora costruito: fino all'apertura del cantiere (otto anni prima) sul sito ci sono case (js/citta.js)
  (o.zone||[]).forEach(function(q){ var p=globale(o,q[0],q[1]); RM.zone.push({x:p[0],z:p[1],r:q[2],h:h,dal:dal}); });
  if(o.lunga){ var n=Math.ceil(o.lunga[0]/o.lunga[1]); for(var i=0;i<n;i++){ var p=globale(o,((i+.5)/n-.5)*o.lunga[0],0); RM.zone.push({x:p[0],z:p[1],r:o.lunga[1],h:h}); } }
});
/* dove una strada passa sotto un arco si stringe alla luce del fornice: [x, z, raggio, mezza larghezza] (24 novembre 2026: con strade larghe 16 m e fornici di 5 o 6, anche un arco
   ben centrato sembrava stare «accanto» alla strada) */
RM.strozzature=[[-34.81,-75.79,2,.28],[-48,-117.8,2,.21],[-31.24,-63.12,2,.23],[133.07,-36.43,1.6,.21],[27.2,20.15,1.6,.25],[44.47,30.43,2.4,.3],[81.86,76.56,1.4,.19]];      // Claudio, Portogallo, Arcus Novus, Gallieno, Tito, Costantino, Dolabella
RM.posa();
var perId={};
M.forEach(function(o){
  var B=new RM.Costruttore(); o.fa(B); perId[o.id]=o;
  o.g=B.maglia(RM.matPietra()); if(o.sc) o.g.geometry.scale(o.sc,o.sc,o.sc); o.g.geometry.computeBoundingBox();
  var bb=o.g.geometry.boundingBox; o.raggio=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2; o.alto=bb.max.y;
  o.mat=o.g.material=RM.matRovina(o.g.geometry.boundingBox.max.y); o.g.customDepthMaterial=o.mat.userData.ombra;
  o.certezza=((D.CERTEZZA||{})[o.id]||['C'])[0]; o.mat.userData.u.uSapCol.value.copy(RM.sapere.COL[o.certezza]);      // «che cosa sappiamo davvero»
  o.g.position.set(o.x,o.quota!=null?o.quota-.05:quota(o.x,o.z),o.z); o.g.rotation.y=o.ry||0;
  if(o.come) o.g.position.y=perId[o.come].g.position.y;                       // poggia sullo stesso piano del complesso vicino
  RM.scene.add(o.g);
  if(o.nome){ o.div=document.createElement('span'); o.div.textContent=o.etichetta||o.nome;      /* etichetta: nome corto per la scena, dove quello della scheda è lungo (23 novembre 2026) */ etichette.appendChild(o.div); o.div.addEventListener('click',function(){ if(RM.apriScheda) RM.apriScheda(o.id); }); }
});
RM.MONUMENTI=M.filter(function(o){ return o.nome; }).concat([{id:'mura', nome:'Mura Aureliane', x:106,z:-203, raggio:28, alto:2}, {id:'acquedotti', nome:'Acquedotti', note:{chiuso:'tagliati nel 537'}, x:249,z:12, raggio:30, alto:3},
  {id:'antoniniano', nome:'Acquedotto Antoniniano', note:{chiuso:'tagliato nel 537'}, x:120,z:200, raggio:26, alto:2}]);

/* stato in un dato anno: {s0, s1, t}, con t che sfuma nei sei anni prima del cambio. Le comparse decadono verso il 500. */
var COMPARSA=[[0,'uso'],[500,'chiuso']];
RM.statoMonumento=function(id,anno){
  var st=D.MONUMENTI[id]||COMPARSA, i=0, k;
  for(k=0;k<st.length;k++) if(anno>=st[k][0]) i=k;
  var s0=anno<st[0][0]?'assente':st[i][1], prossimo=st[i+1];
  var brusco=prossimo&&(prossimo[1]==='bruciato'||prossimo[1]==='spogliato'||prossimo[1]==='crollato'||(prossimo[1]==='assente'&&(id==='adrianostatue'||id==='colosso'||id==='castrapretorio'||id==='curiaantica')));      /* anche il Colosso sparisce di colpo: non si accorcia negli anni prima; i Castra Praetoria, smantellati dopo il 312, nel 312 sono ancora interi */      // le statue del mausoleo cadono in un giorno (537)
  var inizio=prossimo&&s0==='assente'&&D.CANTIERI&&D.CANTIERI[id];      // inizio dei lavori, dove la scheda lo dice (CANTIERI in js/dati.js)
  return {s0:s0, s1:prossimo?prossimo[1]:s0, t:prossimo?RM.sfuma(inizio||prossimo[0]-(brusco?.4:6),prossimo[0],anno):0};
};
/* Degrado in due tempi.
   c = incuria: dal 390 circa la manutenzione pubblica si dirada per tutti, e accelera dopo la chiusura. Si vede come crepe, colature, erba, coppi mancanti.
   r = crolli veri e propri: pochi, e solo decenni dopo la chiusura; alla fine del VI secolo i grandi edifici sono ancora in piedi.
   Fino al 23 novembre 2026 alla chiusura toglieva subito un poco di cima a ogni tratto: sul tetto di Giove Capitolino il colmo si spezzava a blocchi e il tempio sembrava spaccato (l'utente: «fai delle crepe, non che si spacchi a metà»).
   Le basiliche cristiane sono tenute in ordine; il mausoleo di Adriano, ormai fortezza, quasi. */
var CURA={laterano:0, santadriano:0, curia:.5, curiaantica:.5, pantheonchiesa:0, patriarchio:0, triclinioleone:0, pietro:0, croce:0, lorenzo:0, lorenzopelagio:0, agnese:0, paolo:0, sabina:0, mariamaggiore:0, stefano:0, cosma:0, monasteripietro:0, campanilepietro:0, porticopietro:0, scholae:0, leonine:0, costanza:0, agneseonorio:0, paolocostantino:0, tegolepietro:0, obeliscovaticano:.2, andreapietro:0, petronilla:0, monasteripietro2:0, episcopiapietro:0, scholae2:0, mulini:0, casenerva:0, foca:.4, adriano:.35, arcocostantino:.5, arcotito:.5, testaccio:.5, colosso:0, obelisco357:.4, fangocirco:0};
RM.rovina=function(id,anno){
  var st=D.MONUMENTI[id]||COMPARSA, da=null, spoglio=0, fuoco=0, crollo=0, scavo=0, rinato=false, k, cura=CURA[id]==null?1:CURA[id], q, y;
  for(k=0;k<st.length;k++){
    q=st[k][1]; y=st[k][0];
    if(q==='uso'){ if(k>0 && st[k-1][1]!=='assente' && anno>=y){ da=null; spoglio=0; fuoco=0; crollo=0; scavo=0; rinato=true; } continue; }   // riaperto e restaurato (il Pantheon chiesa, gli acquedotti)
    if(anno>=y-3 && (q==='chiuso'||q==='spogliato'||q==='bruciato') && da==null) da=y;
    if(q==='spogliato'||q==='bruciato') spoglio=Math.max(spoglio,RM.sfuma(y-.4,y+.3,anno));
    if(q==='bruciato') fuoco=RM.sfuma(y-.4,y+.3,anno);       // un incendio porta via subito il tetto e parte dei muri
    if(q==='crollato') crollo=RM.sfuma(y-.4,y+.1,anno);      // terremoto: cede il tetto
    if(q==='cava'){ if(anno>=y-3 && da==null) da=y; scavo=RM.sfuma(y,y+200,anno); spoglio=Math.max(spoglio,.6*RM.sfuma(y,y+40,anno)); }   // smontato poco a poco, dall'alto: prima le coperture e i rivestimenti
  }
  var chiuso=da==null?0:RM.sfuma(0,70,anno-da), eta=da==null?0:anno-da;
  return {r:(da==null?0:.15*RM.sfuma(20,120,eta)+.04*RM.sfuma(120,320,eta))+.07*spoglio+.2*fuoco+.2*crollo+.1*scavo, s:spoglio,
          c:Math.min(1,Math.max(.45*crollo,cura*(rinato?.35:1)*(.62*RM.sfuma(390,570,anno)+.45*chiuso+.2*spoglio+.5*fuoco+.3*scavo)))};
};
RM.TINTA=TINTA;
/* Un edificio in costruzione non è l'edificio finito schiacciato: i muri salgono dal basso, a tratti (uCant nello shader, js/costruttore.js), dentro un ponteggio di legno.
   Che aspetto avesse ciascun cantiere non si sa: è uno schema, uguale per tutti. Restano fuori i monoliti alzati in un giorno e le cose che non si costruiscono (fango, tegole, mulini). */
var SENZA_CANTIERE={metasudansvasca:1,santadriano:1, curiaantica:1, pantheonchiesa:1, emiliarovina:1,obelisco357:1,fangocirco:1,tegolepietro:1,foca:1,mulini:1}, SENZA_PONTEGGI={casenerva:1,monasteripietro:1,monasteripietro2:1,scholae:1,scholae2:1,episcopiapietro:1,leonine:1};
function ponteggio(o,t){
  if(!t||SENZA_PONTEGGI[o.id]||o.raggio>22){ if(o.pont) o.pont.visible=false; return; }
  if(!o.pont){
    var bb=o.g.geometry.boundingBox, x0=bb.min.x-.2, x1=bb.max.x+.2, z0=bb.min.z-.2, z1=bb.max.z+.2, H=bb.max.y+.3, dx=x1-x0, dz=z1-z0, passo=Math.max(1.1,(dx+dz)/22), B=new RM.Costruttore(), i, n;
    n=Math.max(1,Math.round(dx/passo)); for(i=0;i<=n;i++){ B.scatola(.05,H,.05,x0+dx*i/n,0,z0,RM.P.tronco); B.scatola(.05,H,.05,x0+dx*i/n,0,z1,RM.P.tronco); }
    n=Math.max(1,Math.round(dz/passo)); for(i=1;i<n;i++){ B.scatola(.05,H,.05,x0,0,z0+dz*i/n,RM.P.tronco); B.scatola(.05,H,.05,x1,0,z0+dz*i/n,RM.P.tronco); }
    [.2,.4,.6,.8,1].forEach(function(f){ var y=H*f-.05; B.scatola(dx,.035,.1,(x0+x1)/2,y,z0,RM.P.tronco); B.scatola(dx,.035,.1,(x0+x1)/2,y,z1,RM.P.tronco); B.scatola(.1,.035,dz,x0,y,(z0+z1)/2,RM.P.tronco); B.scatola(.1,.035,dz,x1,y,(z0+z1)/2,RM.P.tronco); });
    o.pont=B.maglia(RM.matPietra()); o.pont.position.copy(o.g.position); o.pont.rotation.y=o.g.rotation.y; o.pont.receiveShadow=false; RM.scene.add(o.pont);
  }
  o.pont.visible=true; o.pont.scale.y=Math.min(1,t*.95+.12);      // il ponteggio sta sempre un poco più su dei muri
}
RM.moduli.push(function(anno){
  M.forEach(function(o){
    var q=RM.statoMonumento(o.id,anno), p=(q.s0==='assente'?0:1)*(1-q.t)+(q.s1==='assente'?0:1)*q.t;
    var cant=q.s0==='assente'&&q.s1!=='assente'&&q.t>0&&q.t<1&&!SENZA_CANTIERE[o.id];
    o.mat.color.copy(TINTA[q.s0]).lerp(TINTA[q.s1],q.t);
    o.presenza=p; o.g.visible=p>.01; o.g.scale.y=cant?1:Math.max(p,.001); o.mat.userData.u.uCant.value=cant?q.t:1; ponteggio(o,cant?q.t:0);
    var rv=RM.rovina(o.id,anno); o.mat.userData.u.uRovina.value=rv.r; o.mat.userData.u.uSpoglio.value=rv.s; o.mat.userData.u.uCrepe.value=rv.c;
    if(o.id==='pompeo' && anno>=493){ o.mat.userData.u.uCrepe.value*=.55; o.mat.userData.u.uRovina.value*=.5; }      // restaurato sotto Teodorico (Cassiodoro, Variae IV 51: «roboranda», a spese del re): crepe e crolli arretrano; di quanto è una resa
    if(o.id==='pantheon'){ o.mat.userData.u.uSpoglio.value=RM.sfuma(662.6,663.3,anno)*(1-RM.sfuma(734,736,anno)); o.mat.userData.u.uPiombo.value=RM.sfuma(734,736,anno); }   // la chiesa resta in uso: cambia solo il tetto. Bronzo tolto da Costante II (LP LXXVIII 3), piombo di Gregorio III (LP XCII 12)
    if(o.id==='colosseo'){ var us=o.mat.userData.u; us.uSudDir.value.set(-Math.sin(o.ry),Math.cos(o.ry)); us.uSudR.value.set(9.4,7.8);
      us.uSud.value=.2*RM.sfuma(523,800,anno)+.3*RM.sfuma(846.6,847,anno); us.uRovina.value*=.4; }      // il fronte sud: cava dal VI secolo; nell'847, secondo il Parco del Colosseo, cade quel che ne resta
  });
});

/* ---------- le iscrizioni e il timpano del Pantheon ----------
   24 novembre 2026, l'utente: «verifica se sul Pantheon deve esserci la scritta sul timpano». Platner e Ashby, «Pantheon» (letto quel giorno): l'iscrizione di Agrippa,
   «M. Agrippa L. f. cos. tertium fecit», sta sul fregio del pronao (CIL VI 896); sotto, sull'architrave, quella più piccola del restauro di Settimio Severo e Caracalla del 202;
   nel timpano «were bronze decorations», di forma non detta. Qui: la scritta di Agrippa sul fregio, in lettere scure, disegnata su una tela (una lastra di due triangoli,
   con le mipmap: da lontano sfuma invece di brulicare); le due righe dell'architrave sono solo un segno di scrittura minuta, non un testo; nel timpano un tondo di bronzo,
   che indica la decorazione di forma ignota (qui fino al 663, quando Costante II porta via «omnia quae erant in aere ad ornatum civitatis», Liber Pontificalis, vita di
   Vitaliano: che la decorazione fosse fra queste è un'ipotesi). Le lettere ci sono per tutto il periodo: se fossero di bronzo e quando sparirono non lo dice nessuna fonte letta. */
(function(){
  var o=M.filter(function(m){ return m.id==='pantheon'; })[0]; if(!o||!o.g||!document.createElement('canvas').getContext) return;
  var cv=document.createElement('canvas'); cv.width=2048; cv.height=256; var cx=cv.getContext('2d'); if(!cx) return;
  var LARGO=3.2, ALTO=.137, sx=(cv.width/LARGO)/(cv.height/ALTO);      // la tela è più schiacciata del vero: si scrive in un riferimento dove x e y hanno la stessa misura
  cx.fillStyle='rgb(58,44,28)'; cx.textBaseline='alphabetic';
  cx.setTransform(sx,0,0,1,0,0); cx.font='bold 150px Georgia, "Times New Roman", serif';
  var T='M·AGRIPPA·L·F·COS·TERTIVM·FECIT', W=cv.width/sx, usa=W*.84, w0=0, k;
  for(k=0;k<T.length;k++) w0+=cx.measureText(T[k]).width;
  var spazio=(usa-w0)/(T.length-1), xx=(W-usa)/2;
  for(k=0;k<T.length;k++){ cx.fillText(T[k],xx,150); xx+=cx.measureText(T[k]).width+spazio; }
  var r=RM.casuale(202); cx.fillStyle='rgba(58,44,28,.8)';      // l'architrave: due righe di segni minuti, che da vicino si leggono come scrittura e non come testo
  [205,240].forEach(function(y){ for(var x=W*.06;x<W*.94;){ var l=14+r()*22; if(r()<.12){ x+=30; continue; } cx.fillRect(x,y-22,l,22); x+=l+9; } });
  var tx=new THREE.CanvasTexture(cv); tx.anisotropy=Math.min(8,RM.renderer.capabilities.getMaxAnisotropy());
  var lastra=new THREE.Mesh(new THREE.PlaneGeometry(LARGO,ALTO),new THREE.MeshLambertMaterial({map:tx,transparent:true,alphaTest:.25,depthWrite:false}));
  lastra.position.set(0,1.553+ALTO/2,5.207); o.g.add(lastra);      // il fronte della trabeazione sta a z 5,2 nel riferimento del Pantheon; il pronao guarda +z
  var tondo=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.014,20),new THREE.MeshLambertMaterial({color:P.bronzo}));
  tondo.rotation.x=Math.PI/2; tondo.position.set(0,1.965,5.247); o.g.add(tondo);      // il timpano del pronao: triangolo a z 5,24, da quota 1,745 a 2,425
  RM.moduli.push(function(anno){ tondo.visible=anno<663; });
})();

/* ---------- l'acqua della Meta Sudans ----------
   «Sudans described the appearance of the jets of water» (Platner e Ashby): l'acqua esce in cima e scende lungo il cono, a rivoli, fino alla vasca. Qui è una pelle trasparente
   sopra il cono, con i rivoli che scorrono, e uno specchio d'acqua nella vasca, con i cerchi che si allargano. Quanti fossero i rivoli e come uscisse l'acqua non si sa: è uno
   schema. Dal 537, tagliati gli acquedotti, la fontana è asciutta. (23 novembre 2026, l'utente: «La Meta Sudans con l'acqua che scende?») */
(function(){
  var o=M.filter(function(m){ return m.id==='metasudans'; })[0]; if(!o||!o.g) return;
  var NL=String.fromCharCode(10), uF={value:1}, uG={value:0}, uN={value:0}, gr=new THREE.Group(); gr.position.copy(o.g.position); RM.scene.add(gr);
  var VS='varying vec2 vUv; varying vec2 vP; void main(){ vUv=uv; vP=position.xz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var matCono=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; varying vec2 vUv;',
    'float hh(float n){ return fract(sin(n*127.1)*43758.5453); }',
    'void main(){ float n=18.0; float c=floor(vUv.x*n); float f=fract(vUv.x*n); float giu=1.0-vUv.y;',                                                  // giu: 0 in cima, 1 al piede
    '  float larg=0.2+0.28*hh(c+3.0); float riv=smoothstep(larg,0.0,abs(f-0.5+0.12*sin(giu*9.0+hh(c)*6.28)));',                                       // ogni rivolo ha la sua larghezza e serpeggia un poco
    '  float vel=1.2+0.9*hh(c);',
    '  float onde=0.5+0.5*sin(giu*30.0-uTempo*vel*3.4+hh(c+7.0)*6.28);',                                                                              // le onde scendono
    '  float gocce=smoothstep(0.7,1.0,sin(giu*85.0-uTempo*vel*8.0+hh(c+1.0)*6.28));',
    '  float a=(0.05+riv*(0.3+0.34*onde+0.36*gocce))*uForza;',
    '  vec3 col=mix(vec3(0.60,0.80,0.86),vec3(0.96,0.99,1.0),riv*(0.35*onde+0.65*gocce));',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),a); }'].join(NL)});
  var matVasca=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTempo:RM.tempoAcqua,uForza:uF,uNotte:uN,uR0:{value:.4}},vertexShader:VS,fragmentShader:[
    'uniform float uTempo; uniform float uForza; uniform float uNotte; uniform float uR0; varying vec2 vP;',
    'void main(){ float r=length(vP); float an=atan(vP.y,vP.x);',
    '  float cerchi=0.5+0.5*sin(r*46.0-uTempo*3.2+0.6*sin(an*7.0));',                                                                                // i cerchi si allargano dal piede del cono
    '  float schiuma=smoothstep(uR0+0.12,uR0,r)*(0.55+0.45*sin(an*22.0+uTempo*7.0+r*80.0));',                                                         // dove l'acqua cade
    '  vec3 col=vec3(0.40,0.60,0.64)*(0.86+0.2*cerchi)+vec3(0.5,0.52,0.52)*schiuma;',
    '  gl_FragColor=vec4(col*(1.0-0.7*uNotte),0.93*uForza); }'].join(NL)});
  var cono=new THREE.Mesh(new THREE.LatheGeometry([[.318,0],[.303,.25],[.27,.5],[.218,.75],[.148,.98],[.093,1.12],[.078,1.16]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),36).translate(0,.63,0),matCono);
  var piede=new THREE.Mesh(new THREE.LatheGeometry([[.4,0],[.385,.34],[.39,.4],[.318,.42]].map(function(q){ return new THREE.Vector2(q[0],q[1]); }),36).translate(0,.2,0),matCono);      // il velo continua sullo zoccolo
  var matGrande=matVasca.clone(); matGrande.uniforms.uTempo=RM.tempoAcqua; matGrande.uniforms.uForza=uG; matGrande.uniforms.uNotte=uN; matGrande.uniforms.uR0={value:.7};
  var piccola=new THREE.Mesh(new THREE.RingGeometry(.4,.6,40).rotateX(-Math.PI/2).translate(0,.175,0),matVasca);
  var grande=new THREE.Mesh(new THREE.RingGeometry(.66,.97,48).rotateX(-Math.PI/2).translate(0,.165,0),matGrande);
  [cono,piede,piccola,grande].forEach(function(m){ m.renderOrder=3; gr.add(m); });
  var secca=((D.MONUMENTI.metasudans||[]).filter(function(q){ return q[1]==='chiuso'; })[0]||[537])[0];
  RM.moduli.push(function(anno){
    var f=1-RM.sfuma(secca-.3,secca+.2,anno), st=RM.statoMonumento('metasudansvasca',anno), g=(st.s0==='assente'?(st.s1==='assente'?0:st.t>.98?1:0):1)*f;
    uF.value=f; uG.value=g; uN.value=RM.notte||0; gr.visible=f>.01; grande.visible=g>.01;
  });
})();

/* ---------- travertini ai piedi del Colosseo ----------
   Dal VI secolo il fronte sud è un cantiere di smontaggio: pochi blocchi a terra in attesa d'essere portati via.
   Nell'847, se si segue il Parco del Colosseo, cade quel che ne restava: il cumulo che per secoli farà da cava (la «coxa Colisei» dei documenti medievali).
   Forma e quantità dei blocchi sono di fantasia. */
(function(){
  var o=M.filter(function(m){ return m.id==='colosseo'; })[0]; if(!o) return;
  var rnd=RM.casuale(847), N=90, sx=-Math.sin(o.ry), sz=Math.cos(o.ry), blocchi=[], d=new THREE.Object3D(), i;
  for(i=0;i<N;i++){
    var a=(rnd()-.5)*1.5, fuori=(i<14?1.03:.9)+.26*rnd()*rnd(), lx=Math.sin(a)*9.4*fuori, lz=Math.cos(a)*7.8*fuori;        // un arco attorno al punto più a sud, appena fuori dall'ellisse
    blocchi.push({x:o.x+lx*sz+lz*sx, z:o.z-lx*sx+lz*sz, w:.25+.4*rnd(), h:.18+.28*rnd(), p:.22+.3*rnd(), ry:rnd()*3.14, rx:(rnd()-.5)*.5, su:i>=14&&fuori<1.02?rnd()*.6:0, quando:i<14?0:1});
  }
  var m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),RM.tingi(new THREE.MeshStandardMaterial({color:RM.col(0xcbc1aa),roughness:.95}),'C'),N);
  m.castShadow=m.receiveShadow=true; m.frustumCulled=false; RM.scene.add(m);
  var ultimo=-1;
  RM.moduli.push(function(anno){
    var cava=RM.sfuma(523,560,anno), crollo=RM.sfuma(846.6,847.2,anno), chiave=cava+2*crollo; if(Math.abs(chiave-ultimo)<.004) return; ultimo=chiave;
    blocchi.forEach(function(b,j){
      var q=b.quando?crollo:Math.max(cava,crollo);
      d.position.set(b.x,RM.h(b.x,b.z)-.05+b.su*q,b.z); d.rotation.set(b.rx,b.ry,0); d.scale.set(b.w*q,b.h*q,b.p*q); d.updateMatrix(); m.setMatrixAt(j,d.matrix);
    });
    m.instanceMatrix.needsUpdate=true; m.visible=chiave>.01;
  });
})();

/* ---------- clic o tocco sulla scena: si apre la scheda del monumento colpito ----------
   Vale per tutti i monumenti che hanno un nome, non solo per quelli con l'etichetta; mura e acquedotti si registrano in RM.cliccabili (js/mura.js). */
(function(){
  var tela=RM.renderer.domElement, giu=null, raggio=new THREE.Raycaster(), punto=new THREE.Vector2();
  function colpito(ev){
    var r=tela.getBoundingClientRect(); punto.set((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height*2-1)); raggio.setFromCamera(punto,RM.camera);
    var bersagli=[], di=[];
    M.forEach(function(o){ if(o.nome && o.g.visible && o.presenza>.5){ bersagli.push(o.g); di.push(o.id); } });
    (RM.cliccabili||[]).forEach(function(c){ if(c.maglia.visible){ bersagli.push(c.maglia); di.push(c.id); } });
    var colpi=raggio.intersectObjects(bersagli,false); if(!colpi.length) return null;
    var id=di[bersagli.indexOf(colpi[0].object)]; return typeof id==='function'?id(colpi[0]):id;
  }
  tela.addEventListener('pointerdown',function(ev){ giu={x:ev.clientX,y:ev.clientY,t:performance.now()}; });
  tela.addEventListener('pointerup',function(ev){
    var fermo=giu && Math.hypot(ev.clientX-giu.x,ev.clientY-giu.y)<8 && performance.now()-giu.t<600; giu=null;
    if(!fermo) return;                                                       // era un trascinamento: si stava girando la scena
    if(RM.toccoApre && RM.toccoApre()) return;                               // sui telefoni, fuori dallo schermo intero, il tocco apre la scena (js/pagina.js)
    var id=colpito(ev); if(id && RM.apriScheda) RM.apriScheda(id);
  });
  var ultimoMov=0;
  tela.addEventListener('pointermove',function(ev){                         // col mouse, il cursore dice dove si può cliccare
    if(ev.pointerType!=='mouse' || ev.buttons || performance.now()-ultimoMov<120) return; ultimoMov=performance.now();
    tela.style.cursor=colpito(ev)?'pointer':'';
  });
})();

/* ---------- etichette proiettate ---------- */
var v=new THREE.Vector3();
RM.frame.push(function(){
  var w=riquadro.clientWidth, h=riquadro.clientHeight, messi=[];      // messi: i rettangoli delle etichette già visibili; una che ne coprirebbe un'altra si nasconde (23 novembre 2026: le due scholae si accavallavano)
  M.forEach(function(o){
    if(!o.div) return;
    var ex=o.ex!=null?o.ex:o.x, ez=o.ez!=null?o.ez:o.z;      // ex, ez: dove sta il nome, se non al centro del gruppo
    v.set(ex,o.g.position.y+7,ez).applyMatrix4(RM.camera.matrixWorldInverse); var davanti=v.z<-2;      // dietro la camera non si proietta
    v.set(ex,o.g.position.y+7,ez).project(RM.camera);
    var vis=o.presenza>.5 && davanti && v.z<1 && Math.abs(v.x)<.8 && v.y>-.9 && v.y<.88 && !(v.y>.3 && v.x<-.1) && (o.et || Math.hypot(RM.camera.position.x-o.x,RM.camera.position.y,RM.camera.position.z-o.z)<(o.raggio>6?150:95));   // non sui bordi né sopra il contatore; i monumenti minori hanno il nome solo da vicino
    var px=(v.x+1)*w/2, py=(1-v.y)*h/2;
    if(vis){ if(!o.lw){ o.lw=o.div.offsetWidth||o.div.textContent.length*7; o.lh=o.div.offsetHeight||16; }
      var r=[px-o.lw/2-4,py-o.lh-2,px+o.lw/2+4,py+2];
      for(var k=0;k<messi.length;k++){ var q=messi[k]; if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]){ vis=false; break; } }
      if(vis) messi.push(r); }
    o.div.style.opacity=vis?1:0; o.div.style.visibility=vis?'visible':'hidden';
    if(vis) o.div.style.transform='translate(-50%,-100%) translate('+px.toFixed(1)+'px,'+py.toFixed(1)+'px)';
  });
});
})();
