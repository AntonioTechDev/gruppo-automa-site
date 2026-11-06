# Gruppo Automa

Sito statico italiano di Gruppo Automa S.r.l.s., online su
[gruppoautoma.it](https://gruppoautoma.it/). HTML, CSS e JavaScript, senza build.
Font, immagini e librerie di animazione sono locali. Google Calendar viene
preparato in background dopo il caricamento della pagina e durante un periodo
inattivo, quando connessione e risparmio dati lo consentono; può quindi
collegarsi a Google prima del clic. Un’apertura anticipata lo carica subito.

## Pagine

- Home: presentazione, servizi in sintesi, CheAI, portfolio, team e contatore ROI.
- Servizi: consulenza AI, gestionali/CRM/web app, automazioni/API e siti/landing.
- Progetti: dieci progetti con immagini, descrizioni e attribuzioni.
- Blog: indice editoriale con il primo articolo sulle novità AI utili alle PMI.
- Chi siamo: i tre soci, competenze e metodo.
- Contatti: telefono, email, sede, calendario e preparazione di un'email.

Privacy e cookie policy sono collegate dal footer. CheAI rimane una sezione
nella Home con collegamento a cheai.io; il widget non è ancora integrato.
Il sito non pubblica un listino prezzi.

## Modifiche

La Home è il riferimento visivo. Nel repository sorgente, leggere `design.md`
e le istruzioni di progetto prima di aggiungere pagine.

- Stili comuni: `css/style.css` e `css/pages.css`.
- Menu, popup prenotazioni e modulo: `js/site.js`.
- Scene e interazioni della Home: `js/main.js`.
- Calendario pubblico: `bookingUrl` in `js/config.js`.
- Portfolio: `js/projects.js` e pagina Progetti. Tenere coerenti contenuti,
  le cinque copertine illustrative e le descrizioni dei progetti Automa.
- Pagine interne: cartelle `servizi`, `progetti`, `blog`, `chi-siamo`, `contatti`.
- SEO tecnica: metadati delle singole pagine e `robots.txt`; `sitemap.xml`, `llms.txt`
  e `llms-full.txt` sono generati dal deploy (vedi sotto).

Il modulo contatti apre una bozza nel programma di posta del visitatore:
non invia direttamente un messaggio e non salva richieste sul sito.

## Verifiche

Controllare navigazione e menu mobile, collegamenti e asset, telefono,
prenotazione, modulo, portfolio, ROI e movimento ridotto. Il collaudo visivo
si esegue a 1440 e 390 px e vicino ai breakpoint del menu. Per le prenotazioni,
verificare l'evento e le email effettivamente ricevute, poi cancellare le prove.

## Pubblicazione

La pubblicazione proviene dalla cartella `site/` del branch sorgente
`gruppo-automa`, attraverso `deploy-automa.sh`. Quel comando pubblica soltanto
il sito nel repository GitHub Pages. Non usare il comando di deploy Antipode.

## SEO e scoperta tramite ricerca AI

Le pagine pubbliche hanno canonical, title e description unici, anteprima Open
Graph/Twitter 1200×630 in `assets/og/` (o `assets/blog/` per gli articoli), logo
raster e favicon serviti da URL pubblici. I dati JSON-LD sono nell'HTML:
Organization + ProfessionalService condivisa (indirizzo, contatti, soci e profili
social ufficiali in `sameAs`), WebSite, tipo pagina, BreadcrumbList sulle pagine
interne, Service in Servizi, Person per i soci in Chi siamo, BlogPosting negli
articoli e FAQPage solo dove le domande sono visibili nel testo. Orari e
coordinate non sono pubblicati sul sito e quindi non sono nel markup. Aggiornare
testi e relativo JSON-LD insieme, senza prezzi, rating o risultati inventati.
Anche senza JavaScript restano disponibili contenuti e collegamenti.

File generati, da non modificare a mano: `sitemap.xml`, `llms.txt` e
`llms-full.txt`. Li produce `scripts/build_seo.py` (nel repository sorgente)
leggendo le pagine: sono pubbliche `index.html`, le pagine `*.html` in radice e
ogni `**/index.html` senza `noindex`. `lastmod` è la data
`article:modified_time`/`dateModified` della pagina, altrimenti la data
dell'ultimo commit del file. `llms.txt` (formato llmstxt.org) riassume chi è
Gruppo Automa, pagine, servizi, progetti, articoli e contatti; `llms-full.txt`
contiene il testo delle pagine. Lo script blocca la pubblicazione se una pagina
pubblica non ha title, description, canonical corretto, og:image o JSON-LD
valido, se title o description si ripetono o se un articolo non è collegato
dall'indice del Blog. Privacy e cookie restano noindex, fuori dalla sitemap ma
scansionabili.

`robots.txt` consente tutto a motori di ricerca (Googlebot, Bingbot), ricerca e
recupero AI (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
PerplexityBot, Perplexity-User) e crawler di addestramento (GPTBot, ClaudeBot,
Google-Extended, Applebot-Extended), per scelta del titolare del 6/11/2026. Un
crawler con un gruppo dedicato ignora `*`: un eventuale `Disallow` va ripetuto
in ogni gruppo.

IndexNow (Bing, Copilot e gli altri motori aderenti): la chiave pubblica è in
`indexnow-key.txt` e nello stesso file con nome `<chiave>.txt`; conservarli
entrambi. Dopo il push `scripts/indexnow.py` aspetta che GitHub Pages serva la
nuova sitemap e invia gli URL nuovi, modificati o rimossi rispetto all'ultima
sitemap notificata. Se non è cambiato nulla non invia niente; un errore di rete
non blocca la pubblicazione e il comando da ripetere compare nel log. Google
non ha un'API di notifica per pagine normali: legge la sitemap, già registrata
nella proprietà Search Console `https://gruppoautoma.it/` dell'account Google
Automa. Una ricevuta di invio non prova scansione, indicizzazione o citazione AI.

Le verifiche e gli esiti di invio sono nei ticket #6 e #14 del repository
sorgente. Le metriche di laboratorio e i dati reali degli utenti sono
valutazioni distinte.


## Pubblicare un articolo nel Blog

Il Blog è statico come il resto del sito: non richiede un CMS o servizi esterni.
L’indice è `blog/index.html`, sezione `#articoli`.

1. Scrivere l'articolo in `blog/<slug>/index.html` con il contenuto approvato,
   riutilizzando navigazione, footer, font e componenti del sito. Un H1, sezioni
   leggibili, autore reale e data di pubblicazione visibili.
2. Nella testata: title e description unici, canonical
   `https://gruppoautoma.it/blog/<slug>/`, anteprima social,
   `article:published_time`/`article:modified_time` e JSON-LD BlogPosting con
   gli stessi dati reali; FAQPage solo se l'articolo ha domande visibili. Niente
   prezzi, rating o date inventati.
3. Aggiungere l'articolo in cima all'elenco di `blog/index.html` (titolo/link,
   estratto, autore/data, immagine) e nel `blogPost` del JSON-LD Blog. L'elenco
   resta nell'HTML, senza dipendere da JavaScript.
4. Controllare link, asset, desktop e mobile, fare commit e lanciare
   `bash deploy-automa.sh`. Sitemap, `llms.txt`, `llms-full.txt` e la notifica
   IndexNow sono automatici; se il controllo trova un errore il deploy si
   ferma prima di pubblicare e dice cosa correggere.

Per correggere un articolo già pubblicato aggiornare `article:modified_time` e
`dateModified`: così cambia il `lastmod` e IndexNow riceve l'URL.

La pagina indice usa CollectionPage + Blog, non BlogPosting fittizi. La sua
anteprima è `assets/og/blog.jpg`.

Gli articoli usano `css/editorial.css`, condiviso con l’anteprima nell’indice: testo leggibile senza JS, indice con ancore, immagini con dimensioni e didascalia, autore aziendale e date reali. La rubrica sulle notizie distingue data di annuncio e rilascio, disponibilità italiana e prove proposte da risultati osservati. Fonti primarie vicino alle affermazioni; nessun risparmio inventato o disponibilità dedotta da un titolo. La ricerca e la revisione simulata sono conservate nel repository sorgente, fuori da `site/`. Una revisione simulata non è un test con lettori reali. La cadenza giornaliera resta da concordare dopo la valutazione del primo articolo.

Il calendario usa un unico iframe riutilizzato. `site.js` avvia il precaricamento dopo `load`, 2,5 secondi di margine e `requestIdleCallback` (con fallback dove assente), solo su pagine visibili e senza risparmio dati/reti 2G segnalati. Il popup mostra un indicatore accessibile finché il frame Google completa il caricamento, un messaggio dopo 15 secondi e un link esterno sempre disponibile. L’evento load non consente di verificare dall’HTML Automa i dati interni del servizio Google: controllare visivamente gli orari e non dichiarare una disponibilità solo perché il frame esiste. Privacy/cookie policy descrivono il collegamento anticipato.

### Sessione del calendario e touch (v16)

L’iframe ha `credentialless` e `referrerpolicy="no-referrer"`, impostati prima del src. I browser compatibili usano storage temporaneo isolato; gli altri ignorano credentialless e mantengono l’embed standard. Google resta il gestore di modulo, cookie temporanei, controlli e conferme; non filtrare i suoi errori o simulare le sue disponibilità. URL con hl=it e ctz=Europe/Rome. Menu, popup e feedback al tocco sono in pages.css, con riduzione del movimento e fallback statici.
