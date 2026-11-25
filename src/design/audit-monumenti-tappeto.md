# Controllo a tappeto: monumenti, ponti, isola Tiberina (25 novembre 2026)

Sola lettura: nessun file del progetto è stato cambiato. Restano solo questo rapporto e il banco di misura `src/prove/audit-tappeto.js`.

Richieste dell'utente da cui nasce il controllo: terrapieni diversi dal resto (il «Tempio di Claudio»); l'edificio davanti al Pantheon, che dopo il 609 potrebbe ostacolare l'ingresso; ponti (dove finiscono, in che stato sono epoca per epoca) e isola Tiberina.

## Come è stato misurato

- Il banco è Edge senza finestra, guidato da Node con il protocollo di DevTools. Lo script sta nella cartella di lavoro (`cdp.mjs`). Mentre scarica `js/monumenti.js` aggiunge `window.__M=M;` prima di `RM.MONUMENTI=…`, così l'elenco `M` si legge per intero. Il file su disco non cambia.
- Le misure si prendono nella pagina, con `src/prove/audit-tappeto.js`:
  - `AT.misura([300,450,610,800])`: per ogni monumento visibile in quell'anno (`o.g.visible`, dopo `RM_pagina.anno`) calcola:
    - il riquadro orientato della geometria;
    - la base, cioè la posizione della maglia;
    - il terreno disegnato sul contorno e su anelli a 20, 50 e 100 m dal bordo;
    - il terreno naturale (`RM.hGrezza`);
    - il fondo della geometria contro il terreno, cella per cella (0,5 unità);
    - la strada più vicina, presa da `RM.STRADE` con i nomi di `VIE` di `src/roma/genera.mjs`;
    - le strade che attraversano il riquadro;
    - le case di `RM.isolati` dentro il riquadro;
    - il contorno che cade nel fiume;
    - le compenetrazioni fra riquadri;
    - per 19 monumenti, l'ingresso: un corridoio di 30 m davanti alla fronte, letta nel codice (`tempio()` e `tempietto()` guardano verso +z; `chiesa()` e `cinqueNavate()` hanno l'atrio verso +x).
  - `AT.ponti()`: le testate dei ponti, ricostruite come in `js/mura.js`.
  - `AT.chiese()`: le chiese minori di `js/nuclei.js`.
  - `AT.stradeQuota()`: dove i nastri delle strade escono dal terreno.
  - `AT.foglio()`: i fogli di catture.
- Unità: in tabella sono metri della scena (1 unità = 10 m). Le quote sono già esagerate 1,8 volte (`ESAGERA` in `js/base.js`): per il dislivello reale si divide per 1,8.
- Prima scoperta, che ha cambiato il metodo (difetto 1 qui sotto): `RM.hSuolo` sbaglia lontano dal Foro. Le misure usano quindi `AT.terra`, la stessa funzione con l'inversione corretta, controllata col raggio sulla maglia (`AT.raggio`): coincidono al centimetro.

Dati grezzi nella cartella dei fogli: `misure3.json`, `ponti2.json`, `strade-quota.json`, `chiese.json`, `mura-fiume.json`, `raggio2.json`, `storie.json`.

## (d) Difetti, in ordine di gravità per chi guarda

### 1. Strade in aria o sotto terra oltre 1,5 km dal Foro, e così le rampe dei ponti lontani

- **Che cosa si vede.** Nastri di strada che salgono e scendono come muri o corde tese:
  - la Flaminia presso ponte Milvio;
  - la Salaria e la Nomentana fuori porta;
  - l'Appia, la Latina e la Portuense nella campagna.
  - Da sopra, in certi tratti la strada sparisce sotto terra (`f11-strade-lontane.jpg`).
- **Misura.** Campioni ogni 20 m. Conta quante volte il nastro sta più di 3 m sopra o sotto il terreno vero:

  | strada | sopra | sotto | scarto peggiore |
  |---|---|---|---|
  | Appia | 105 | 58 | |
  | Alta Semita e Nomentana | 74 | 48 | −39 m |
  | Flaminia | 51 | 33 | −105 m, a (−134, −399) |
  | Portuense | 52 | 0 | +33 m |
  | Latina | 46 | 3 | |
  | Salaria | 42 | 43 | −50 m |
  | Ostiense | 48 | 6 | |

  Nel centro lo scarto è zero.
- **Causa** (`js/base.js`, `RM.hSuolo`, funzione `inv`). Il codice è `for(k=0;k<8;k++) var t2=t*t, t6=t2*t2*t2; t-=(…)/(…);`. Il ciclo non ha le graffe, quindi il passo di Newton si fa una volta sola. Scarto della cella cercata, in unità:

  | distanza dal Foro | scarto |
  |---|---|
  | 1,5 km | 1,7 |
  | 2,6 km | 11 |
  | 3,8 km | 67 |

  Lo stesso errore sposta le rampe dei ponti lontani (`rampe` in `js/mura.js` usa `RM.hSuolo`: Elio, Milvio) e la camera di `AU.vista` del banco `audit-citta.js` (le catture lontane finivano sotto terra).
- **Correzione.** Mettere le graffe al ciclo: `for(k=0;k<8;k++){ var t2=t*t, t6=t2*t2*t2; t-=…; }`. Le strade si ricalcolano da sole al caricamento.
- **Fonti e ipotesi.** Nessuna fonte, nessuna ipotesi.

### 2. Ponte Aurelio (ponte Sisto): un tratto di mura attraversa il fiume e il ponte non porta a nessuna strada

- **Che cosa si vede** (`f08-ponti-a.jpg`):
  - un muro merlato con le torri corre sull'acqua da una riva all'altra e passa sotto il ponte;
  - le due testate finiscono su prati, contro gli spigoli delle mura;
  - nell'800 la testata di Trastevere finisce fra rovine basse.
- **Misura** (`mura-fiume.json`). Due tratti di `RM.MURA` hanno il punto medio nel Tevere:
  - n. 83, da (−127,2; 1,1) a (−113,2; 1,1), sotto ponte Aurelio;
  - n. 76, da (−78,3; 106,4) a (−108,6; 114,5), presso ponte di Probo.

  Testate di ponte Aurelio:
  - riva sinistra (Campo Marzio): la strada più vicina, la via Settimiana, è a 290 m; le mura sono a 15 m;
  - riva destra (Trastevere): via Settimiana a 121 m, Aurelia a 253 m.
- **Correzione.**
  - In `src/roma/genera.mjs`, oppure in `js/mura.js` alla posa dei `passi`: non chiudere l'anello delle mura attraverso il fiume, cioè saltare i passi col punto medio a meno di 5,6 unità dalla linea del Tevere. Il tracciato viene da OpenStreetMap, che chiude il poligono.
  - In `VIE` di `src/roma/genera.mjs`: una via dalla testata di Trastevere fino alla via Settimiana e alla porta Settimiana, e una dalla testata sinistra fino alla via Recta o alla via Lata.
- **Fonti e ipotesi.**
  - Platner e Ashby, *Pons Aurelius*: è «almost certainly» il ponte poi detto Antoninus, oggi ponte Sisto; rifatto da Valentiniano I nel 365-366; «partially destroyed in 772», da cui il nome *ruptus*. Non dice quali strade unisse.
  - Il tracciato delle due vie sarebbe un'ipotesi, l'erede moderno: via di Ponte Sisto e via dei Pettinari. Va dichiarata nella scheda delle mura o nel piede «Come abbiamo ricostruito».
  - Se dietro il tratto sul fiume ci fosse una notizia (una catena, una porta sul ponte), non l'ho trovata nelle fonti lette.

### 3. Pantheon: la piazza davanti è una scatola murata che chiude l'ingresso da nord, anche dopo il 609

- **Che cosa si vede** (`f07-pantheon.jpg`, `f12-dettagli.jpg` in basso a sinistra). Davanti al pronao c'è un recinto di 70 x 62 m con muri di tufo alti 11,7 m sui lati nord, est e ovest, porticato all'interno.
  - È staccato dal pronao: fra i gradini e i portici restano 6 m.
  - Il lato nord è un muro cieco. Chi arriva dalla via Recta, a 150 m dalla fronte, vede il muro e sopra la cupola. Al pronao si arriva solo dalle due strisce laterali di 6 m.
  - Dal 537 la piazza è «chiusa»: invecchia, ma resta in piedi fino all'852. Nel 610 e nell'800 la chiesa di Santa Maria ad Martyres ha l'ingresso dietro un muro in rovina.
- **Codice.** `pantheonpiazza` in `js/monumenti.js` chiama `portico(B,7,6.2,0,0,0,.9,…)` girato di π dentro `B.dentro(0,0,9.2,PI)`: il muro di fondo di `portico()` finisce a nord. La storia è in `js/dati.js`: `pantheonpiazza:[[0,'uso'],[537,'chiuso']]`.
- **Fonti lette.**
  - Platner e Ashby, *Pantheon*: «In front of it was an open space surrounded by colonnades». Nulla su un muro che la chiudesse, sulle misure, né sulla sua sorte. Del 609 dice solo che Bonifacio IV dedicò l'edificio come Santa Maria ad Martyres.
  - en.wikipedia, *Pantheon, Rome*: il pronao stava sette gradini (1,30 m) sopra il lastricato del piazzale; nel Medioevo il suolo si alzò; nel portico c'erano bancarelle, e muri e case si addossavano al lato est. Nulla su una demolizione nel 609.
  - Il Liber Pontificalis (vita di Bonifacio IV) non l'ho letto: la pagina dell'Oxford Cult of Saints risponde 403.
- **Risposta.** Nessuna fonte dice che il piazzale porticato fosse distrutto quando il Pantheon divenne chiesa; nessuna fonte, però, dice che fosse chiuso da un muro. L'ostacolo è una scelta del modello, non un fatto.
- **Correzione** (in `js/monumenti.js`, `pantheonpiazza`):
  - attaccare la piazza al pronao;
  - portici sui due lati lunghi (est e ovest), aperta a nord verso il Campo Marzio e senza il muro di fondo, oppure con un varco centrale (la «arch» al centro del piazzale è discussa negli studi: fonte da leggere);
  - lastricato 1,3 m sotto il pronao.

  Ipotesi da dichiarare nella scheda: quanto fosse lunga la piazza e che cosa ne restasse nel VII e nell'VIII secolo. Proposta: portici in rovina dal 537, area centrale libera e strada fino alla porta.
- **Inoltre.** In `MONUMENTI` del 609 la piazza resta «chiusa» (incuria) mentre il Pantheon accanto torna «uso»: sono vicini con stati che non si parlano.

### 4. I terrapieni: le terrazze finiscono con un pendio di terra di 70 m, non con muri di sostegno

- **Che cosa si vede.** Le piattaforme attestate sembrano scatole posate su un cumulo di terra nuda. Il pendio nasce da `RM.h` in `js/base.js`: ogni zona sfuma con `RM.sfuma(q.r,q.r+7,d)`, cioè 70 m.
  - **Tempio di Claudio** (`f01-claudio.jpg`, `f12-dettagli.jpg` in alto a destra). La terrazza spianata sta 11 m sopra il terreno naturale a 50 m dal bordo. Sopra c'è la scatola di tufo (200 x 180 m, muri alti 9 m sul piano spianato), con un prato e un tempietto piccolo. Le arcate (`B.aperture(10,-9,-10,-9,…)`) stanno sul lato −z locale, che con `ry:-1.21` è **est**; il lato ovest è un muro cieco.
  - **Venere e Roma** (`f02-venere.jpg`, `f12`). La terrazza sta 17 m sopra il naturale; il terreno sul contorno scende fino a 13 m sotto la base. Verso il Colosseo c'è un pendio di terra.
  - **Terme di Traiano** (`f03-oppio.jpg`). 19 m sopra il naturale; il contorno scende fino a 30 m sotto la base; il fondo è staccato da terra fino a 15 m presso lo spigolo sud-ovest (75,2; 7,5).
  - **Terme di Costantino** (`f04`). 17 m sopra il naturale, sul ciglio del Quirinale.
  - Giove Capitolino e il Palatino stanno sui colli ridisegnati (+43 e +47 m): lì è giusto.
- **Fonti lette.**
  - Platner e Ashby, *Templum Divi Claudii*:
    - il tempio «stood on a lofty and extensive podium»;
    - sostruzioni diverse per lato: a ovest «double rows of travertine arches with engaged columns and entablature», a nord «what seem to be reservoirs for water», a est «alternately square and semicircular recesses» (il ninfeo di Vespasiano);
    - il tempio «fronting towards the north»;
    - «The last mention of the temple is in the fourth century».
  - Platner e Ashby, *Templum Veneris et Romae*:
    - «an enormous podium of concrete faced with travertine, 145 metres long and 100 wide»;
    - verso il Colosseo, camere nel podio «for the storage of the machinery and apparatus of the amphitheatre», e il podio più alto a est per il pendio;
    - a ovest «a wide flight of steps», a est «only two small flights»;
    - un colonnato di granito grigio sui lati.
  - Per le terme di Traiano e di Costantino le voci di Platner non le ho lette.
- **Correzione.**
  1. In `js/base.js`, `RM.h`: un campo per zona con la larghezza della sfumatura (per esempio `q.t`, predefinito 7), da mettere a 0,5-1 per le piattaforme con muri.
  2. In `js/monumenti.js`, le zone (`zone:`) di quelle piattaforme vanno ristrette al bordo della scatola, e la scatola deve scendere fino al terreno naturale con i muri di sostegno:
     - Claudio: arcate a ovest, ninfeo a nicchie a est, muro con le cisterne a nord. Va spostato `B.aperture` sul lato +z locale e aggiunte le nicchie a −z.
     - Venere: muro alto con le camere a est, scalinata larga a ovest.
  3. Da risolvere con una seconda fonte: Platner dice che il tempio di Claudio guardava a **nord**; il modello lo fa guardare a ovest-nord-ovest (291°).

### 5. Ponti che finiscono nel nulla (oltre all'Aurelio)

Misure di `ponti2.json`; catture in `f09-ponti-b.jpg`.

- **Isola Tiberina, testata sinistra.** La strada più vicina, l'Aurelia, è a 153 m; sulla riva sinistra non arriva nessuna via, né verso il teatro di Marcello né verso il Foro Olitorio. La testata destra è sull'Aurelia: giusto.
- **Ponte Emilio, testata del Foro Boario.** Nessuna strada: la Portuense comincia a metà del ponte, in (−50, 36), e il vico Tusco finisce a (−17, 48), 300 m più in là. La testata di Trastevere è sulla Portuense, a 14 m.
- **Ponte di Probo.** L'Ostiense passa a 43 m dalla testata sinistra, la Portuense a 38 m dalla destra.
- **Elio e Milvio.** Sulle loro vie (via Recta e Flaminia): giusti.
- **Correzione** (`VIE` in `src/roma/genera.mjs`):
  - far cominciare la Portuense alla testata di Trastevere del ponte Emilio;
  - allungare il vico Tusco o il vico Iugario fino alla testata del Foro Boario;
  - aggiungere una via dalla testata sinistra del ponte dell'isola fino al vico Iugario o al teatro di Marcello;
  - due raccordi corti per il ponte di Probo.
- **Fonti e ipotesi.**
  - Platner e Ashby, *Pons Aemilius*: passava «from the Forum Boarium»; un viadotto sulla strada «leading from the bridge to the Janiculum».
  - *Pons Sublicius*: legato al vicus Iugarius.
  - *Pons Fabricius*: «between the left bank of the river and the island».
  - I tracciati sarebbero ipotesi (eredi moderni), da dichiarare.

### 6. Isola Tiberina: un solo ponte dritto di 150 m che le passa sopra, invece di due ponti che ci arrivano

- **Che cosa si vede** (`f09`, `f12`). Il ponte attraversa tutto il fiume in diagonale sull'isola. L'impalcato sta 3 m sopra il piano dell'isola: il ponte non scende sull'isola, la scavalca. Sull'isola non ci sono vie.
- **Fonti lette.**
  - Platner e Ashby: il ponte Fabricio «between the left bank of the river and the island»; il Cestio «the first stone bridge from the island to the right bank», rifatto da Valentiniano, Valente e Graziano, finito nel 369, dedicato nel 370 come *pons Gratiani*, «48 m long», arcata centrale di 23,65 m.
  - L'isola: 269 x 67 m, a forma di nave, con l'obelisco come albero (già nel modello); il tempio di Esculapio dopo il 292 a.C.; santuari di Iupiter, Faunus, Tiberinus e Semo Sancus, senza posizione.
- **Correzione** (`js/mura.js`): due ponti corti che posano sul piano dell'isola, con un tratto di strada fra le due teste. Le misure del Cestio sono da Platner; quelle del Fabricio non le ho lette.
- **Vicini che non si parlano.** Il tempio di Esculapio è nella maglia fissa dei ponti: resta «in uso» per sempre, mentre gli altri templi chiudono nel 392 (`src/testi/audit-anacronismi.md`). Va legato a una voce di `MONUMENTI`.
- **San Bartolomeo.** Platner non dà la data della chiesa. L'attribuzione corrente a Ottone III (intorno al 1000) è fuori dal periodo, ma non l'ho verificata su una fonte letta oggi. Nel modello non c'è chiesa: va bene così, salvo smentita.

### 7. Chiese minori che compenetrano edifici antichi o affondano

Misure di `chiese.json`, su 39 chiese di `CHIESE`.

- **Compenetrano un monumento.** La chiesetta schematica (`js/nuclei.js`) occupa parte dell'edificio disegnato:
  - Sant'Angelo in Pescheria (755): 750 m² dentro il Portico d'Ottavia;
  - Santa Maria Domine Rose (850): 1200 m² dentro il teatro e la Crypta di Balbo;
  - Sant'Eustachio (720): 850 m² dentro le terme di Nerone;
  - San Lorenzo in Lucina (370): 750 m² nell'area dell'Orologio.

  San Silvestro in Capite con gli archi della via Lata e San Giorgio al Velabro col Foro Boario sono probabilmente falsi allarmi: i riquadri di quei gruppi sono larghi.
- **Fuori quota.**
  - Sant'Anastasia (380) ha il centro 10,5 m sotto il terreno disegnato, sul pendio del Palatino: `c.y` viene da `RM.h`, ma la maglia larga 45 m lì passa più in alto.
  - Santi Giovanni e Paolo (398) è 4 m sopra.
- **Correzione** (`js/nuclei.js` e `CHIESE` in `js/dati.js`):
  - per le chiese insediate in un edificio antico, un campo che toglie la chiesetta e mette sull'edificio solo un segno (croce, campanile), come fa `pantheonchiesa`;
  - la quota presa dalla maglia disegnata, non da `RM.h`.
- **Fonti.** Per dire «insediata dentro» servono le fonti di ciascuna (Sant'Angelo nel propileo del Portico d'Ottavia, per esempio): non lette oggi.

### 8. Edifici troppo grandi per la loro terrazza: in parte sepolti, in parte sospesi

- **Terme di Tito.** Zona di raggio 5 per un edificio di 105 x 102 m. Sul contorno la terra sale fino a 23 m sopra la base (verso l'Oppio) e scende fino a 6 m sotto; un sesto del fondo è staccato da terra fino a 5 m (`f03`).
- **Ludus Magnus.** Terra sopra la base fino a 17 m sul lato del Celio. Nella cattura `f03` si vede il pendio alle spalle che lo sovrasta.
- **Venere e Roma.** Il fondo è staccato fino a 10 m allo spigolo nord-ovest (30,2; 11,8): la maglia larga 45 m non segue il bordo della zona.
- **Basilica di Massenzio.** Terra fino a 10 m sopra la base sul lato della Velia. Verosimile: la basilica fu tagliata nel colle. Ma non l'ho verificato su una fonte.
- **Correzione** (`js/monumenti.js`): allargare le `zone` di Tito e del Ludus a coprire il riquadro, oppure dare loro un basamento che scenda fino al terreno.

### 9. Ingressi lontani dalle strade o con qualcosa davanti

Corridoio di 30 m davanti alla fronte.

- **Pantheon**: la piazza murata (difetto 3); la via Recta a 150 m.
- **Tempio di Claudio**: la strada più vicina (clivo di Scauro) a 144 m dalla fronte; una casa nel corridoio; nessuna scala (Platner non ne parla).
- **Apollo Sosiano e Bellona**: la fronte a nord, la strada più vicina (vico Iugario) a 210 m. Il Circo Flaminio e le sue vie non sono disegnati.
- **Portico d'Ottavia**: il propileo a 240 m da una strada.
- **Santa Maria Maggiore**: la fronte a 173 m da una strada; una casa nel corridoio.
- **Santa Sabina**: una casa nel corridoio; strada a 128 m.
- **San Paolo**: la fronte guarda il fiume, la strada (Ostiense) è a 211 m.
- **Liberi e serviti**: Giove, Curia e Sant'Adriano, Santi Cosma e Damiano, mausoleo di Adriano (fronte sul ponte Elio), Laterano, San Pietro (il portico dei pellegrini arriva all'atrio), Venere e Roma (Colosseo davanti a est, via Sacra a ovest), tempio di Adriano.
- **Correzione.** Vie brevi in `VIE` (Campo Marzio sud; Esquilino davanti a Santa Maria Maggiore); a Santa Maria Maggiore e a Santa Sabina, togliere la casa davanti all'ingresso con una zona piccola di piazza in `js/monumenti.js`, che `libero()` di `js/citta.js` rispetta.

### 10. Case dentro i recinti

`caseDentro` conta le case al centro del riquadro.

- **Castra Praetoria**: 33 insulae dentro il campo nel 300, quando era ancora una caserma.
- **Sessoriano**: 14 case nel 300, poi 10; la Labicana lo attraversa per 525 m.
- **Emporio e Porticus Aemilia**: 8 case; l'Ostiense passa dentro il riquadro per 145 m.
- **Fori**: 9 case, da guardare.
- **Correzione.** Zone che coprano il recinto (`CASTRA.zone`, `sessoriano`, `emporio`) e, per la caserma, file di baracche al posto delle insulae (ipotesi). Le fonti sui castra non le ho lette oggi.

### 11. Compenetrazioni fra monumenti

Area comune dei riquadri, in m²:

- Iseo Campense e Saepta Iulia: 1050 m², tutti gli anni;
- Fori e Basilica di Massenzio: 2100 m², dal 450 (da guardare: forse il riquadro del gruppo dei Fori);
- Teatro di Marcello e Portico d'Ottavia: 300 m²;
- Sole e archi della via Lata: 250 m²;
- nel Borgo, `scholae2` con San Pietro e il portico: falsi allarmi, il gruppo è sparso.

Santa Croce dentro il Sessoriano è giusto: la chiesa sta nel palazzo.

### 12. Sant'Adriano senza abside; Santa Martina assente

- Platner e Ashby, *Curia Iulia*: «The church of S. Adriano was founded in the curia by Honorius I (625‑638; LP LXXII.6), who added the apse».
- Dopo la conversione la chiesa si raggiungeva per gradini «descending into the church from the higher ground outside»; le sepolture stavano «on the pavement of the comitium».
- Santa Martina, «built in the ruins of the Secretarium Senatus», è nominata la prima volta sotto Adriano I (772-795).
- Nel modello `santadriano` è la stessa aula senza abside, e Santa Martina non c'è.
- **Correzione**: un'abside sul retro dell'aula dal 630 (`js/monumenti.js`, `santadriano`); Santa Martina in `CHIESE` dal 772-795, con la data dichiarata.

## (c) Il Pantheon e gli altri cambi d'uso

| cambio | che cosa c'era attaccato o davanti | che cosa dicono le fonti lette | nel modello | ingresso |
|---|---|---|---|---|
| Pantheon → Santa Maria ad Martyres, 609 | piazza porticata a nord, aula «di Nettuno» a sud | Platner: «open space surrounded by colonnades»; nulla sulla sua sorte. Wikipedia: pronao 7 gradini (1,30 m) sopra il piazzale; poi il suolo sale, bancarelle e muri sul lato est | piazza murata su tre lati, staccata di 6 m, in piedi e in rovina fino all'852 | **ostacolato** da nord (difetto 3) |
| Curia → Sant'Adriano, 630 | Comizio davanti; Secretarium Senatus accanto | Platner (citazioni sopra) | aula senza abside; Comizio nel gruppo dei Fori | libero: Argileto a meno di 10 m |
| Templum Pacis e «tempio di Romolo» → Santi Cosma e Damiano, 527 | via Sacra davanti | voce di Platner non letta oggi | rotonda verso la via Sacra | libero: via Sacra a 6 m |
| Venere e Roma → Santa Maria Nova, 850 | rovine del tempio | Platner: Leo IV «built the church of S. Maria Nova in its ruins» (847-853) | chiesa sul lato ovest della terrazza (non misurata: compare nell'850) | non misurato |
| Portico d'Ottavia → Sant'Angelo in Pescheria, 755 | propileo | non letta | chiesetta schematica dentro il portico | compenetrazione (difetto 7) |
| Teatro di Balbo → Santa Maria Domine Rose, 850 | Crypta Balbi | non letta | chiesetta dentro il teatro | compenetrazione |
| Palazzo Sessoriano → Santa Croce | palazzo | non letta | chiesa dentro il complesso | va bene |
| Santa Maria Antiqua (560-848) | edifici alle pendici del Palatino | non letta | chiesetta schematica in `CHIESE` | nessun conflitto misurato |

## (b) Ponti e isola

### Testate

`ponti2.json`. «Terreno» è il terreno vero alla fine dell'impalcato. L'impalcato sta a 6,5 m, tutti.

| ponte | riva | strada più vicina (dal bordo) | terreno | case | note |
|---|---|---|---|---|---|
| Elio | sinistra (porta) | via Recta, sopra | −4 m | 0 | entra nella porta delle mura: giusto |
| Elio | destra (mausoleo) | via Recta, sopra | −1 m | 0 | giusto |
| Aurelio | sinistra | via Settimiana, 290 m | −1,5 m | 0 | mura a 15 m; **muro sul fiume** |
| Aurelio | destra | via Settimiana, 121 m | −1 m | 0 | nel nulla |
| Isola | sinistra | Aurelia, 153 m | −4 m | 0 | **nessuna via** |
| Isola | destra | Aurelia, 0 m | −5 m | 0 | giusto |
| Emilio | Foro Boario | Portuense, 55 m (comincia sul ponte) | −3,5 m | 0 | **nessuna via** |
| Emilio | Trastevere | Portuense, 14 m | −6 m | 0 | quasi |
| Probo | sinistra | Ostiense, 43 m | −3,4 m | 0 | mura a 34 m; muro sul fiume poco a valle |
| Probo | destra | Portuense, 38 m | −5 m | 0 | quasi |
| Milvio | entrambe | Flaminia, sopra | −5 / −6 m | 0 | giusto, ma la Flaminia vicina vola (difetto 1) |
| Neroniano | — | — | — | 0 | solo pile dal 300 |

### Stati per epoca

| ponte | modello | 235-300 | 300-450 | 450-610 | 610-852 | fonti lette |
|---|---|---|---|---|---|---|
| Elio | intero | intero | intero | intero | intero | Platner, *Pons Aelius*: nessun fatto fra il 235 e l'852; nel Medioevo «Pons S. Petri». Il 546 (Isauri sul ponte verso San Pietro, Procopio VII) l'ho visto solo in una sintesi, non nel testo |
| Aurelio (ponte Sisto) | intero; dal 772 con un'arcata in meno | intero | rifatto 365-366 (non mostrato) | intero | «partially destroyed in 772» | Platner, *Pons Aurelius*; Liber Pontificalis, Adriano I 95 (piena del 791, già nel codice) |
| Fabricio | uno solo con il Cestio | intero | intero | intero | intero | Platner: «the best preserved bridge in Rome», la struttura originale |
| Cestio (pons Gratiani) | (vedi sopra) | intero | rifatto 369-370 (non mostrato) | intero | intero | Platner, *Pons Cestius* |
| Emilio | intero | intero | intero | intero | intero (VII secolo: Etico, «pontem Lepidi») | Platner: rotto nel 1557, metà portata via nel 1598 |
| Probo / Teodosio | dal 280 | dal 276-282 | rifatto 384-387 (non mostrato) | intero | intero | Platner: «partially destroyed in the eleventh century» |
| Milvio | intero (+ passerella del 312) | intero | intero | intero; nel 547 i Goti non riescono ad abbatterlo | intero | Procopio VII 24, 32: «One bridge, however, which bears the name of Mulvius, they were quite unable to destroy» |
| Neroniano | intero fino al 300, poi pile | intero | in rovina | pile | pile | Platner (citato nel codice): rovina «probably in the fourth» secolo |
| Sublicio | **non disegnato** | in piedi | in piedi fino al V secolo | ? | ? | Platner: «standing as late as the fifth century», «just below the later pons Aemilius» |
| Agrippa | non disegnato | ? | ? | ? | ? | solo un cippo (nel codice) |

- **Procopio VII 24, 31 (547).** Totila «having torn down practically all the bridges over the Tiber». Belisario teneva la città, quindi sono probabilmente i ponti fuori le mura; il testo non lo dice. Il modello non cambia nulla, ed è prudente; si può citare nella scheda.
- **Ponte Milvio.** La voce di Platner non l'ho trovata (le pagine *Pons_Mulvius* e *Pons Milvius* rispondono 404).

### Isola Tiberina nel modello

Nave di 269 x 67 m (Platner); tempio con 4 colonne in facciata sul lato lungo; due case; obelisco; piano a 3,5 m sopra lo zero, impalcato a 6,5 m. Non ci sono strade e nessuno stato cambia nelle epoche. Problemi: difetti 5 e 6.

## (e) Fogli di cattura

Cartella `C:\Users\angri\AppData\Local\Temp\claude\3cd5ea652e07b4f7\ec5502f3-27f3-4793-a7bc-eaa9ada8fc5e\scratchpad\T`:

| foglio | contenuto |
|---|---|
| `f01-claudio.jpg` | Tempio di Claudio: radente da ovest, da nord, da sud-est; dall'alto (300) |
| `f02-venere.jpg` | Venere e Roma (300). Il primo quadro è venuto dentro il Colosseo: rifatto in `f12` |
| `f03-oppio.jpg` | Terme di Traiano, di Tito, Ludus Magnus |
| `f04-costantino-quirinale.jpg` | Terme di Costantino |
| `f05-vaticano.jpg` | San Pietro e l'obelisco, 450 e 800. L'obelisco è a terra: il «sospeso» della prima misura veniva da `RM.hSuolo` |
| `f06-agnese.jpg` | Sant'Agnese, Santa Costanza, San Paolo |
| `f07-pantheon.jpg` | Pantheon e piazza, 300, 610, 800 |
| `f08-ponti-a.jpg` | Ponte Aurelio, 300 e 800: il muro sul fiume |
| `f09-ponti-b.jpg` | Isola, Emilio, Probo, Elio, Milvio |
| `f10-vari.jpg` | Santo Stefano Rotondo, Massenzio, Emporio, Sessoriano, Castra, Santa Maria Maggiore |
| `f11-strade-lontane.jpg` | Flaminia presso Milvio, Salaria, Nomentana: strade in aria |
| `f12-dettagli.jpg` | Venere spigolo nord-est, Claudio lato ovest, il muro nord della piazza del Pantheon a livello strada, isola da nord-est |

## Che cosa non ho verificato

- **Fonti non lette.**
  - Liber Pontificalis, vita di Bonifacio IV (403 sulla pagina dell'Oxford Cult of Saints; il testo di Duchesne su archive.org è troppo lungo per lo strumento).
  - Platner sul ponte Milvio (404).
  - Platner sulle terme di Traiano, di Costantino e di Tito, su Santi Cosma e Damiano, su Sant'Angelo in Pescheria e sui Castra.
  - La data di San Bartolomeo.
  - Il testo di Procopio sul 546 e il ponte di San Pietro.
- **Orientamento del tempio di Claudio.** Platner dice nord, il modello ovest-nord-ovest: serve una seconda fonte.
- **Misure.**
  - Le fronti di 19 monumenti sono lette nel codice; per gli altri l'ingresso non è misurato.
  - «Case nel riquadro» conta i centri delle case e la loro presenza per anno in modo approssimato (`nasce`, `via`).
  - Per i gruppi sparsi (`PENDIO`, Fori, archi della via Lata, `scholae2`) il riquadro è largo e dà falsi allarmi.
  - L'anno 852 non è stato misurato.

## (a) Tabella completa

Tutte le voci di `M` visibili in almeno uno degli anni 300, 450, 610, 800; 94 voci; i valori sono quelli del primo anno in cui la voce è visibile.

- Base e quote in metri della scena (×10 le unità, già esagerate 1,8 volte).
- «Rialzo sul naturale»: base meno terreno naturale a 50 m dal bordo.
- «Ingresso libero»: ciò che c'è nei 30 m davanti alla fronte; «[complesso]» è una parte dello stesso gruppo.

| monumento | anni | base (m) | attorno a 50 / 100 m (m) | dislivello a 100 m | rialzo sul naturale | piattaforma attestata | ingresso verso | strada più vicina (dal bordo, m) | ingresso libero | note |
|---|---|---|---|---|---|---|---|---|---|---|
| colosseo (Colosseo) | 300, 450, 610, 800 | 24 | 31 / 38 | -14 | -3 | no / non verificato | – | Appia, -5 | – | terra sopra la base sul contorno fino a 7 m |
| colosso (Colosso del Sole) | 300, 450 | 24 | 31 / 30 | -6 | -2 | no / non verificato | – | Appia, 77 | – | terra sopra la base sul contorno fino a 6 m |
| metasudans (Meta Sudans) | 300, 450, 610, 800 | 24 | 27 / 29 | -5 | 2 | no / non verificato | – | Appia, 5 | – | — |
| circo (Circo Massimo) | 300, 450, 610, 800 | 14 | 21 / 22 | -8 | 1 | no / non verificato | – | vico Tusco, 11 | – | terra sopra la base sul contorno fino a 18 m |
| fori (Fori) | 300, 450, 610, 800 | 8 | 25 / 27 | -19 | -15 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, -5 | – | terra sopra la base sul contorno fino a 51 m; strade dentro il riquadro: Argileto, clivo Suburano e Tiburtina, Vicus Longus, via Sacra e clivo Capitolino, vico Tusco, vico Iugario, clivo Argentario; case nel riquadro 300:9 450:9 610:9 800:9 |
| emilia (Basilica Emilia) | 300 | 8 | 8 / 9 | -1 | -1 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, -3 | – | — |
| giove (Tempio di Giove Capitolino) | 300, 450, 610, 800 | 58 | 43 / 14 | 45 | 43 | sì (podio, Platner) | sud-est (via Sacra e clivo Capitolino, 84 m) | via Sacra e clivo Capitolino, 68 | 300: libero; 450: libero; 610: libero; 800: libero | — |
| palatino (Palazzi del Palatino) | 300, 450, 610, 800 | 71 | 51 / 23 | 49 | 47 | sì (sostruzioni) | – | Appia, 90 | – | — |
| pantheon (Pantheon) | 300, 450, 610, 800 | 20 | 21 / 21 | -1 | -2 | no / non verificato | nord (via Recta, ponte Elio, verso San Pietro, 151 m) | via Recta, ponte Elio, verso San Pietro, 149 | 300: [complesso] pantheonpiazza; 450: [complesso] pantheonpiazza; 610: [complesso] pantheonpiazza; 800: [complesso] pantheonpiazza | — |
| pantheonpiazza | 300, 450, 610, 800 | 20 | 21 / 22 | -2 | -2 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 80 | – | — |
| domiziano (Stadio di Domiziano) | 300, 450, 610, 800 | 21 | 20 / 19 | 2 | 1 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -6 | – | — |
| traiano (Terme di Traiano) | 300, 450, 610, 800 | 71 | 60 / 52 | 19 | 19 | non verificato | – | Labicana e Prenestina, -4 | – | fondo staccato da terra fino a 15 m; terra sotto la base sul contorno fino a 30 m; strade dentro il riquadro: Labicana e Prenestina |
| tito (Terme di Tito) | 300, 450, 610, 800 | 33 | 44 / 43 | -10 | -1 | no / non verificato | – | Labicana e Prenestina, 76 | – | fondo staccato da terra fino a 5 m; terra sopra la base sul contorno fino a 23 m; terra sotto la base sul contorno fino a 6 m |
| caracalla (Terme di Caracalla) | 300, 450, 610, 800 | 23 | 25 / 29 | -6 | -5 | no / non verificato | – | Appia, 83 | – | — |
| venere (Tempio di Venere e Roma) | 300, 450, 610, 800 | 39 | 25 / 24 | 15 | 17 | sì (Platner: 145 x 100 m) | sud-est (Appia, 43 m); nord-ovest (via Sacra e clivo Capitolino, 41 m) | via Sacra e clivo Capitolino, -3 | 300: colosseo / libero; 450: colosseo / massenzio; 610: colosseo / massenzio; 800: colosseo / massenzio | fondo staccato da terra fino a 11 m; terra sotto la base sul contorno fino a 13 m |
| arcotito (Arco di Tito) | 300, 450, 610, 800 | 39 | 29 / 32 | 8 | 18 | — (sta sulla terrazza di Venere) | – | via Sacra e clivo Capitolino, -4 | – | — |
| adriano (Mausoleo di Adriano) | 300, 450, 610, 800 | -1 | -1 / -1 | -1 | 0 | — (basamento quadrato, non terrazza) | sud (via Recta, ponte Elio, verso San Pietro, -7 m) | via Recta, ponte Elio, verso San Pietro, -4 | 300: libero; 450: porticopietro; 610: porticopietro; 800: porticopietro | — |
| adrianostatue | 300, 450 | -1 | -1 / -1 | -1 | 0 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -3 | – | — |
| augusto | 300, 450, 610, 800 | 3 | 4 / 4 | -2 | -1 | no / non verificato | – | via Lata e Flaminia, 87 | – | — |
| pompeo (Teatro di Pompeo) | 300, 450, 610, 800 | 19 | 18 / 16 | 3 | 2 | no / non verificato | – | via Lata e Flaminia, 473 | – | — |
| marcello (Teatro di Marcello) | 300, 450, 610, 800 | -1 | 7 / 12 | -12 | -3 | no / non verificato | – | vico Iugario, 77 | – | — |
| apollo (Tempio di Apollo Sosiano) | 300, 450, 610, 800 | 2 | 3 / 13 | -12 | -2 | no / non verificato | nord (vico Iugario, 214 m) | vico Iugario, 165 | 300: ottavia; 450: ottavia; 610: ottavia; 800: ottavia | — |
| bellona (Tempio di Bellona) | 300, 450, 610, 800 | 2 | 10 / 15 | -13 | -2 | no / non verificato | nord (vico Iugario, 202 m) | vico Iugario, 147 | 300: libero; 450: libero; 610: libero; 800: libero | — |
| curia | 300, 450, 610 | 8 | 8 / 8 | -1 | -1 | no / non verificato | sud (Argileto, clivo Suburano e Tiburtina, -2 m) | Argileto, clivo Suburano e Tiburtina, -7 | 300: [complesso] fori; 450: [complesso] fori; 610: [complesso] fori | — |
| curiastatue | 300, 450 | 8 | 8 / 8 | -1 | -1 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, -3 | – | — |
| obeliscovaticano (Obelisco vaticano) | 300, 450, 610, 800 | 26 | 27 / 27 | -1 | 0 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 112 | – | — |
| sole (Tempio del Sole) | 300, 450, 610, 800 | 28 | 29 / 29 | -1 | -1 | no / non verificato | – | via Lata e Flaminia, 67 | – | — |
| andreapietro (Rotonda di Sant'Andrea) | 300, 450, 610, 800 | 26 | 27 / 28 | -2 | -2 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 120 | – | segue il pendio |
| balbo (Teatro e Crypta di Balbo) | 300, 450, 610, 800 | 12 | 13 / 15 | -2 | -2 | no / non verificato | – | via Lata e Flaminia, 261 | – | — |
| emporio (Emporio e Porticus Aemilia) | 300, 450, 610, 800 | 2 | 0 / 2 | 0 | 2 | no / non verificato | – | Ostiense, -5 | – | terra sopra la base sul contorno fino a 14 m; terra sotto la base sul contorno fino a 13 m; strade dentro il riquadro: Ostiense; case nel riquadro 300:8 450:8 610:8 800:8; contorno nel fiume: 16/48 punti |
| testaccio (Monte Testaccio) | 300, 450, 610, 800 | 2 | 3 / 3 | 0 | -1 | no / non verificato | – | Ostiense, 261 | – | — |
| colonnamarco (Colonna di Marco Aurelio) | 300, 450, 610, 800 | 26 | 27 / 27 | -1 | -1 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 4 | – | — |
| orologio (Orologio di Augusto) | 300, 450, 610, 800 | 23 | 23 / 22 | 1 | 0 | no / non verificato | – | via Lata e Flaminia, 1 | – | segue il pendio; case nel riquadro 300:8 450:7 610:7 800:7 |
| obeliscosallustiano (Obelisco degli Horti Sallustiani) | 300, 450, 610, 800 | 93 | 94 / 93 | -1 | -1 | no / non verificato | – | Salaria, 442 | – | — |
| piramide (Piramide Cestia) | 300, 450, 610, 800 | 4 | 4 / 5 | -1 | -1 | no / non verificato | – | Ostiense, 11 | – | — |
| castrapretorio (Castra Praetoria) | 300 | 78 | 82 / 82 | -4 | -4 | no / non verificato | – | Alta Semita e Nomentana, 86 | – | segue il pendio; terra sopra la base sul contorno fino a 12 m; terra sotto la base sul contorno fino a 5 m; case nel riquadro 300:33 |
| termenerone (Terme di Nerone e di Alessandro) | 300, 450, 610, 800 | 21 | 21 / 21 | 1 | 0 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 108 | – | — |
| termeagrippa (Terme di Agrippa) | 300, 450, 610, 800 | 17 | 20 / 20 | -3 | -2 | no / non verificato | – | via Lata e Flaminia, 335 | – | — |
| tempioadriano (Tempio di Adriano) | 300, 450, 610, 800 | 25 | 25 / 25 | 0 | -1 | no / non verificato | est (via Lata e Flaminia, 80 m) | via Lata e Flaminia, 79 | 300: archivialata; 450: archivialata; 610: archivialata; 800: archivialata | — |
| tempioclaudio (Tempio di Claudio) | 300, 450, 610, 800 | 52 | 41 / 35 | 16 | 11 | sì (Platner) | ovest (clivo di Scauro e via Celimontana, 144 m) | vico Capo d'Africa, 6 | 300: libero +1 case; 450: libero +1 case; 610: libero +1 case; 800: libero +1 case | terra sotto la base sul contorno fino a 13 m |
| dolabella | 300, 450, 610, 800 | 67 | 62 / 49 | 19 | 6 | no / non verificato | – | clivo di Scauro e via Celimontana, -4 | – | — |
| ludusmagnus (Ludus Magnus) | 300, 450, 610, 800 | 32 | 42 / 46 | -14 | -2 | no / non verificato | – | Labicana e Prenestina, -7 | – | fondo staccato da terra fino a 3 m; terra sopra la base sul contorno fino a 17 m |
| metaromuli (Meta Romuli) | 300, 450, 610, 800 | 6 | 6 / 5 | 0 | -1 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 2 | – | — |
| foroboario (Foro Boario) | 300, 450, 610, 800 | -1 | 3 / 5 | -7 | -2 | no / non verificato | – | Ostiense, -6 | – | segue il pendio; terra sopra la base sul contorno fino a 12 m; terra sotto la base sul contorno fino a 6 m; case nel riquadro 300:2 450:2 610:2 800:2; contorno nel fiume: 2/48 punti |
| ottavia (Portico d'Ottavia) | 300, 450, 610, 800 | 4 | 7 / 12 | -8 | -2 | no / non verificato | sud-ovest (vico Iugario, 240 m) | vico Iugario, 183 | 300: libero; 450: libero; 610: libero; 800: libero | — |
| argentina (Area sacra di largo Argentina) | 300, 450, 610, 800 | 16 | 17 / 17 | -1 | -1 | no / non verificato | – | via Lata e Flaminia, 424 | – | — |
| iseo (Iseo Campense) | 300, 450, 610, 800 | 22 | 23 / 23 | -1 | -1 | no / non verificato | – | via Lata e Flaminia, 115 | – | — |
| saepta (Saepta Iulia) | 300, 450, 610, 800 | 20 | 21 / 21 | -1 | -1 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 170 | – | — |
| esquilino (Arco di Gallieno e Trofei di Mario) | 300, 450, 610, 800 | 78 | 78 / 78 | 1 | 0 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, -6 | – | segue il pendio; strade dentro il riquadro: Argileto, clivo Suburano e Tiburtina; case nel riquadro 300:3 450:3 610:3 800:3 |
| sessoriano (Anfiteatro Castrense e circo Variano) | 300, 450, 610, 800 | 54 | 57 / 57 | -3 | -3 | no / non verificato | – | Labicana e Prenestina, -4 | – | segue il pendio; terra sopra la base sul contorno fino a 11 m; strade dentro il riquadro: Labicana e Prenestina; case nel riquadro 300:14 450:10 610:10 800:10 |
| eurisace | 300 | 56 | 57 / 57 | -1 | -1 | no / non verificato | – | Labicana e Prenestina, 8 | – | — |
| archivialata (Archi della via Lata) | 300, 450, 610, 800 | 26 | 27 / 26 | 0 | -1 | no / non verificato | – | via Lata e Flaminia, -4 | – | segue il pendio; strade dentro il riquadro: via Lata e Flaminia, via Recta, ponte Elio, verso San Pietro; case nel riquadro 300:5 450:5 610:5 800:4 |
| arcusnovus (Arcus Novus) | 300, 450, 610, 800 | 25 | 26 / 26 | -1 | -1 | no / non verificato | – | via Lata e Flaminia, -8 | – | — |
| campidoglio | 300, 450, 610, 800 | 7 | 20 / 18 | -10 | -13 | no / non verificato | – | clivo Argentario, -2 | – | segue il pendio; terra sopra la base sul contorno fino a 52 m; strade dentro il riquadro: via Sacra e clivo Capitolino, clivo Argentario; case nel riquadro 300:4 450:4 610:4 800:4 |
| metasudansvasca | 450, 610, 800 | 24 | 27 / 29 | -5 | 2 | no / non verificato | – | Appia, 0 | – | — |
| obelisco357 (Obelisco di Costanzo II) | 450, 610, 800 | 14 | 15 / 21 | -7 | -1 | no / non verificato | – | Appia, 311 | – | — |
| fiaccola357 | 450, 610 | 14 | 15 / 21 | -7 | -1 | no / non verificato | – | Appia, 314 | – | — |
| emiliarovina (Basilica Emilia) | 450, 610, 800 | 8 | 8 / 9 | -1 | -1 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, -3 | – | — |
| diocleziano (Terme di Diocleziano) | 450, 610, 800 | 86 | 86 / 86 | -1 | -2 | no / non verificato | – | Salaria, -1 | – | — |
| massenzio (Basilica di Massenzio) | 450, 610, 800 | 13 | 18 / 20 | -7 | -5 | no / non verificato | – | via Sacra e clivo Capitolino, 8 | – | terra sopra la base sul contorno fino a 10 m |
| laterano (San Giovanni in Laterano) | 450, 610, 800 | 48 | 51 / 52 | -4 | -3 | no / non verificato | est (verso il Laterano e porta Asinaria, 7 m) | verso il Laterano e porta Asinaria, -5 | 450: libero; 610: libero; 800: libero | strade dentro il riquadro: verso il Laterano e porta Asinaria |
| patriarchio (Patriarchio lateranense) | 450, 610, 800 | 50 | 51 / 51 | -1 | -1 | no / non verificato | – | verso il Laterano e porta Asinaria, 25 | – | — |
| pietro (San Pietro) | 450, 610, 800 | 26 | 25 / 25 | 1 | 2 | non verificato | est (via Recta, ponte Elio, verso San Pietro, 19 m) | via Recta, ponte Elio, verso San Pietro, -6 | 450: porticopietro; 610: porticopietro; 800: scholae2+porticopietro | strade dentro il riquadro: via Recta, ponte Elio, verso San Pietro |
| arcocostantino (Arco di Costantino) | 450, 610, 800 | 21 | 27 / 30 | -9 | -1 | no / non verificato | – | Appia, -7 | – | — |
| termecostantino (Terme di Costantino) | 450, 610, 800 | 78 | 70 / 50 | 28 | 17 | non verificato | – | Alta Semita e Nomentana, 113 | – | — |
| croce (Santa Croce in Gerusalemme) | 450, 610, 800 | 58 | 58 / 58 | 0 | 0 | no / non verificato | – | Labicana e Prenestina, 345 | – | — |
| lorenzo (San Lorenzo, la basilica maggiore) | 450, 610, 800 | 35 | 36 / 38 | -3 | -2 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, 89 | – | — |
| agnese (Sant'Agnese, la basilica di Costantina) | 450, 610, 800 | 41 | 43 / 44 | -3 | -2 | no / non verificato | – | Alta Semita e Nomentana, 98 | – | — |
| costanza (Mausoleo di Costantina (Santa Costanza)) | 450, 610, 800 | 42 | 43 / 45 | -3 | -1 | no / non verificato | – | Alta Semita e Nomentana, 87 | – | — |
| paolo (San Paolo fuori le mura) | 450, 610, 800 | -1 | 0 / 2 | -2 | -2 | no / non verificato | ovest (Ostiense, 211 m) | Ostiense, 20 | 450: libero; 610: libero; 800: libero | — |
| sabina (Santa Sabina) | 450, 610, 800 | 64 | 59 / 40 | 23 | 3 | no / non verificato | nord-est (Ostiense, 129 m) | Ostiense, 96 | 450: libero +1 case; 610: libero +1 case; 800: libero +1 case | — |
| mariamaggiore (Santa Maria Maggiore) | 450, 610, 800 | 76 | 78 / 77 | -1 | -2 | no / non verificato | sud-est (Argileto, clivo Suburano e Tiburtina, 173 m) | Argileto, clivo Suburano e Tiburtina, 160 | 450: libero +1 case; 610: libero +1 case; 800: libero +1 case | — |
| monasteripietro (Monastero dei Santi Giovanni e Paolo) | 450, 610, 800 | 26 | 30 / 31 | -5 | -5 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 178 | – | segue il pendio |
| petronilla (Mausoleo di Onorio (Santa Petronilla)) | 450, 610, 800 | 26 | 28 / 29 | -3 | -3 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 146 | – | segue il pendio |
| porticopietro (Portico dei pellegrini) | 450, 610, 800 | 9 | 10 / 10 | -1 | 0 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -7 | – | segue il pendio; terra sopra la base sul contorno fino a 18 m; terra sotto la base sul contorno fino a 11 m; strade dentro il riquadro: via Recta, ponte Elio, verso San Pietro |
| minervamedica (Tempio di Minerva Medica) | 450, 610, 800 | 75 | 74 / 72 | 3 | 2 | no / non verificato | – | Labicana e Prenestina, 297 | – | — |
| fangocirco | 610, 800 | 14 | 17 / 21 | -7 | 1 | no / non verificato | – | vico Tusco, 42 | – | terra sopra la base sul contorno fino a 6 m |
| pantheonchiesa | 610, 800 | 20 | 21 / 21 | -1 | -2 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 157 | – | — |
| lorenzopelagio (San Lorenzo, la chiesa di Pelagio II) | 610, 800 | 34 | 35 / 36 | -2 | -1 | no / non verificato | – | Argileto, clivo Suburano e Tiburtina, 111 | – | — |
| stefano (Santo Stefano Rotondo) | 610, 800 | 40 | 47 / 49 | -9 | -10 | no / non verificato | – | clivo di Scauro e via Celimontana, 44 | – | — |
| cosma (Santi Cosma e Damiano) | 610, 800 | 8 | 10 / 11 | -4 | -3 | no / non verificato | sud (via Sacra e clivo Capitolino, 6 m) | via Sacra e clivo Capitolino, 8 | 610: [complesso] fori; 800: [complesso] fori | — |
| foca (Colonna dell'imperatore Foca) | 610, 800 | 8 | 8 / 8 | -1 | -1 | no / non verificato | – | via Sacra e clivo Capitolino, 18 | – | — |
| focastatua | 610 | 8 | 8 / 8 | -1 | -1 | no / non verificato | – | via Sacra e clivo Capitolino, 23 | – | — |
| episcopiapietro (Residenze di papa Simmaco) | 610, 800 | 26 | 23 / 22 | 3 | 5 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -5 | – | segue il pendio |
| mulini (Mulini sul Tevere) | 610, 800 | -13 | -6 / -1 | -12 | -7 | no / non verificato | – | via Settimiana, 216 | – | segue il pendio; fondo staccato da terra fino a 4 m; terra sopra la base sul contorno fino a 8 m; contorno nel fiume: 47/48 punti |
| triclinioleone (Triclinio di Leone III) | 800 | 50 | 50 / 51 | 0 | -1 | no / non verificato | – | verso il Laterano e porta Asinaria, 70 | – | — |
| santadriano (Sant'Adriano (la Curia)) | 800 | 8 | 8 / 8 | -1 | -1 | no / non verificato | sud (Argileto, clivo Suburano e Tiburtina, -1 m) | Argileto, clivo Suburano e Tiburtina, -7 | 800: [complesso] fori | — |
| tegolepietro | 800 | 26 | 28 / 28 | -2 | -1 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 58 | – | — |
| agneseonorio (Sant'Agnese, la chiesa di Onorio I) | 800 | 47 | 47 / 48 | -1 | -1 | no / non verificato | – | Alta Semita e Nomentana, 21 | – | — |
| monasteripietro2 (Monasteri di San Martino e Santo Stefano Maggiore) | 800 | 26 | 33 / 34 | -8 | -9 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, 202 | – | segue il pendio; terra sopra la base sul contorno fino a 12 m |
| campanilepietro (Campanile di San Pietro) | 800 | 26 | 26 / 22 | 3 | 5 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -3 | – | segue il pendio |
| scholae (La comunità dei Sassoni (Schola dei Sassoni)) | 800 | 12 | 10 / 9 | 3 | 2 | no / non verificato | – | via Settimiana, 64 | – | segue il pendio |
| scholae2 (Le comunità dei Frisoni, dei Franchi e dei Longobardi (scholae)) | 800 | 12 | 23 / 24 | -12 | -11 | no / non verificato | – | via Recta, ponte Elio, verso San Pietro, -5 | – | segue il pendio; terra sopra la base sul contorno fino a 21 m; strade dentro il riquadro: via Recta, ponte Elio, verso San Pietro; case nel riquadro 800:8 |
