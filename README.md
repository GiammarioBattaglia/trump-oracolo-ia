# Trump & la SUPREMA IA

Trump esprime un desiderio. La divinità fa a modo suo.

Gioco satirico HEF Focus, destinato al progetto Vercel esistente `trump-oracolo-ia-vignette-1` e al dominio https://trump-oracolo-ia.vercel.app/.

## Contenuti

- 22 vignette complete, ciascuna con desiderio, titolo, battuta e conseguenza. La produzione di ulteriori immagini è stata interrotta su richiesta dell’autore.
- Tutti i 62 esempi precedenti conservati: 84 esempi complessivi.
- Galleria con ricerca, categorie, avanzamento della collezione e pulsante per la vignetta successiva.
- Desideri liberi elaborati dalla funzione OpenAI già esistente, con sette trasformazioni classiche disponibili.
- Cronologia locale, suoni facoltativi, movimento ridotto e condivisione tramite link al desiderio.
- PWA: esempi disponibili offline; le nuove illustrazioni vengono conservate dopo la prima visualizzazione online.
- Titolo, sottotitolo, metadati, manifest e immagine social aggiornati.

## Configurazione e pubblicazione

I sorgenti sono conservati nel repository `GiammarioBattaglia/trump-oracolo-ia`. Il ramo `main` è destinato alla produzione del progetto Vercel esistente. Pubblicare nella stessa app per conservare dominio e variabili d’ambiente. Per gli aggiornamenti successivi usare il collegamento Git del progetto.

In alternativa, una copia locale collegata al progetto tramite `.vercel/project.json` può essere pubblicata con la CLI:

```sh
npx vercel deploy --prod --yes
```

Non creare un nuovo progetto, non cambiare il dominio e non sostituire le variabili d’ambiente. La chiave OpenAI non è inclusa in questo archivio: resta nella configurazione protetta del progetto Vercel. Il codice del provider, il modello, la validazione, i limiti e i timeout sono quelli della versione in produzione recuperata. È stato aggiornato soltanto il testo creativo del prompt di sistema per riflettere il nuovo nome e la premessa narrativa.

Framework: Other. Nessun comando di build. La cartella contiene sia i file statici sia `api/oracle.js`, la funzione serverless già presente.

## Anteprima e verifiche

Per un’anteprima statica locale:

```sh
python3 -m http.server 8765
```

I desideri preparati funzionano con il server statico; i desideri liberi richiedono la funzione Vercel. Non aprire `index.html` direttamente come file.

```sh
node --test tests/*.test.mjs
```

Lo stato delle verifiche e della pubblicazione è riportato in `VERIFICATION.md`.

## Installazione e privacy

Su Android/Chrome usare Installa. Su iPhone/iPad aprire in Safari e scegliere Condividi → Aggiungi alla schermata Home. L’installazione richiede HTTPS.

Cronologia, suoni e scene scoperte restano nel browser. I desideri liberi vengono inviati alla funzione del gioco e quindi a OpenAI. Gli esempi sono preparati e non richiedono una chiamata all’IA. Le illustrazioni non vengono generate durante il gioco. La condivisione è volontaria e inserisce il desiderio nel frammento del link.

I prompt delle illustrazioni sono in `ASSET-PROMPTS.md` e `ASSET-PROMPTS-22.md`. Le licenze dei font sono in `licenses/`.
