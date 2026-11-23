# Infografiche animate degli eventi chiave · proposta

Scritta il 23 novembre 2026, su richiesta dell'utente («infografiche animate per gli eventi chiave con possibilità di creare anche immagini realistiche»). **Non è costruito nulla**: si costruisce solo ciò che l'utente sceglie.

## L'idea in breve

Brevi sequenze animate, da 20 a 40 secondi, che spiegano **un processo** meglio di quanto facciano un testo o la carta: numeri che crollano, una catena di cause, una giornata ora per ora. Si aprono da un bottone «▶ Guarda in un minuto» nella tappa giusta, e anche dalla scheda d'apertura dell'atto. Sono fatte in SVG e CSS dentro la pagina: niente video da scaricare, testo leggibile e tradotto in parole, accessibili con la tastiera. Con «Riduci movimento» si vedono come pannelli fermi uno sotto l'altro.

Ogni infografica ha in fondo le sue fonti e dice che cosa è stima. I dati vengono, dove si può, da quelli che la pagina ha già (curve di popolazione, argento e relitti; territorio misurato sulla carta; stati dei monumenti).

## Le candidate, in ordine di utilità

1. **Roma si svuota (235-852).** La curva degli abitanti con la forchetta delle stime si disegna nel tempo; a ogni sacco, assedio, piena ed epidemia un segno sulla linea e una frase. Accanto, gli acquedotti che si spengono nel 537 e i quattro rifatti da Adriano I nel 780. *Dati: già in `CURVE.popolazione` e negli stati degli acquedotti.* Tappa: «La città» (476) e l'epilogo.
2. **Senza soldi non c'è esercito (395-476).** Una barra del territorio dell'Occidente governato da Roma che si accorcia provincia dopo provincia, e sotto le entrate fiscali che si perdono con lei: l'Africa del 439 come colpo più grave. *Dati: territorio già misurato sulla carta; per le entrate solo ordini di grandezza da Wickham e Heather, dichiarati.* Tappa: «L'esercito».
3. **La moneta perde l'argento (235-294).** Una moneta che, tappa dopo tappa, diventa più chiara di rame; i prezzi dell'editto di Diocleziano del 301 come esempio. *Dati: `CURVE.argento` e l'editto dei prezzi (Kropff 2016, già nelle fonti).* Tappa: intermezzo della moneta (284).
4. **Il sacco del 410, tre giorni.** Una pianta schematica di Roma: porta Salaria di notte, gli incendi presso la porta e la casa di Sallustio, le basiliche degli apostoli come rifugio; un orologio dei tre giorni (Orosio) e dei sei (Marcellino Comes), con la divergenza detta. *Dati: Procopio III 2, Orosio VII 39, già letti.* Tappa: 410.
5. **Le navi scompaiono (I-VIII secolo).** I relitti datati nel Mediterraneo come punti che si accendono e si spengono secolo dopo secolo; la frase «contano le navi trovate, non le merci». *Dati: `CURVE.commerci` (banca dati di Oxford).* Tappa: intermezzo dei commerci (395).
6. **Chi governa l'Occidente nel 476, nel 568, nell'800.** Tre fotogrammi della carta con i regni che si passano le regioni; più semplice delle scene a passi, utile come riassunto d'atto. *Dati: `CAMBI`.* Scheda d'apertura degli atti IV-VI.

## E le immagini realistiche?

Si possono generare (come per i ritratti ricostruiti: Seedream 5 Pro su ElevenLabs, circa 0,15 $ a immagine), ma il criterio della pagina è il realismo storico: un'immagine inventata rischia di sembrare una testimonianza. Proposta: **al massimo una o due immagini per infografica**, solo come sfondo di un fotogramma (per esempio il Tevere in piena nel 589 o il fumo sopra porta Salaria), sempre con il cartellino «Ricostruzione: immagine immaginaria» e la scheda delle fonti usate per comporla, come per i volti. Per le infografiche 1, 2, 3 e 5 non servono: lì parlano i numeri.

## Costo e ordine consigliato

- Ognuna è il lavoro di una sessione breve (una o due ore), più la verifica dei dati dove servono numeri nuovi (2 e 4).
- Consiglio di partire dalla **1 (Roma si svuota)** e dalla **3 (la moneta)**: i dati ci sono già tutti e sono le più chiare sul telefono. Poi la 2, che è la tesi della pagina, se si accettano ordini di grandezza dichiarati.
- Le immagini realistiche, se le vuoi, dopo: prima vediamo come rendono le infografiche senza.
