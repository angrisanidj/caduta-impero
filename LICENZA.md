# Licenze

In questo progetto stanno insieme cose con licenze diverse. In breve: codice, dati e testi si possono riusare, alle condizioni scritte qui sotto.

## Codice: licenza MIT

Vale per `index.html`, `css/`, i programmi in `js/` (esclusi i dati generati elencati più sotto) e gli strumenti in `src/`.

Copyright (c) 2026 Daniele Angrisani

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Dati

- **Carta dell'Impero** (`js/mappa-dati.js`, generato da `src/mappa/genera.mjs`): Creative Commons Attribuzione - Condividi allo stesso modo 4.0 Internazionale (CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/deed.it). Le regioni derivano dai poligoni delle province del *Digital Atlas of the Roman Empire* di Johan Åhlfeldt (università di Lund e di Göteborg, https://dare.ht.lu.se), che ha la stessa licenza: chi riusa questi confini deve citare l'atlante e questo progetto, e distribuire ciò che ne ricava con la stessa licenza. Coste, fiumi e rilievo (`img/rilievo.jpg`) vengono da Natural Earth, di dominio pubblico.
- **Topografia di Roma** (`js/roma-topo.js`, generato da `src/roma/genera.mjs`): Tevere, mura, porte e strade sono © OpenStreetMap contributors, con licenza Open Database License 1.0 (https://opendatacommons.org/licenses/odbl/1-0/); le quote sono SRTM (NASA), di dominio pubblico.
- **Tabelle di `js/dati.js`** (stati delle regioni per anno, curve, storie dei monumenti): CC BY-SA 4.0. La curva dei commerci è ricavata dalla banca dati dei relitti dell'Oxford Roman Economy Project (J. Strauss, A. Wilson, M. Flohr, 2017).

## Testi e immagini: CC BY-SA 4.0

I testi delle tappe, delle schede dei monumenti e dei riquadri (in `js/dati.js` e in `index.html`), l'icona (`img/icona.svg`) e l'immagine `img/anteprima.jpg` sono di Daniele Angrisani e si possono riusare con la licenza Creative Commons Attribuzione - Condividi allo stesso modo 4.0 Internazionale (https://creativecommons.org/licenses/by-sa/4.0/deed.it): citando l'autore e la pagina («Come finisce un impero», https://angrisanidj.github.io/caduta-impero/) e distribuendo ciò che se ne ricava con la stessa licenza. Le citazioni dei testi antichi sono traduzioni fatte per questa pagina dalle edizioni indicate nei commenti di `js/dati.js`.

## Cose di altri usate dalla pagina

- Immagini dei protagonisti (`img/protagonisti/`, indice in `js/ritratti.js`): vengono da Wikimedia Commons, ciascuna con il suo autore e la sua licenza (pubblico dominio, CC0, CC BY o CC BY-SA nelle varie versioni), indicati accanto all'immagine insieme al collegamento alla pagina del file; chi le riusa segue la licenza di ciascuna, non quella di questo progetto. Le didascalie seguono le descrizioni dei file su Commons e non sono state riscontrate sulle schede dei musei.
- Foto del rilievo delle spoglie del Tempio nell'arco di Tito (`img/leggende/arco-di-tito-spoglie-del-tempio.jpg`, tappa del 534): di Gunnar Bach Pedersen (aprile 2007), rilasciata dall'autore nel pubblico dominio (https://commons.wikimedia.org/wiki/File:Fra-titusbuen.jpg); qui ritagliata ai bordi e ridotta.
- three.js r128 e OrbitControls: licenza MIT.
- Caratteri Cinzel ed EB Garamond: SIL Open Font License 1.1, serviti da Google Fonts.
