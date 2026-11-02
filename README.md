# Gruppo Automa

Sito statico italiano di Gruppo Automa S.r.l.s., online su
[gruppoautoma.it](https://gruppoautoma.it/). HTML, CSS e JavaScript, senza build.
Font, immagini e librerie di animazione sono locali. Google Calendar viene
caricato quando il visitatore apre la prenotazione.

## Pagine

- Home: presentazione, servizi in sintesi, CheAI, portfolio, team e contatore ROI.
- Servizi: consulenza AI, gestionali/CRM/web app, automazioni/API e siti/landing.
- Progetti: dieci progetti con immagini, descrizioni e attribuzioni.
- Blog: indice editoriale degli articoli, con stato vuoto fino alla prima pubblicazione.
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
  screenshot e attribuzioni se la selezione cambia.
- Pagine interne: cartelle `servizi`, `progetti`, `blog`, `chi-siamo`, `contatti`.
- SEO tecnica: metadati delle singole pagine, `sitemap.xml` e `robots.txt`.

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

Le pagine principali hanno canonical, metadati unici, anteprima Open Graph/Twitter
1200×630 in `assets/og/`, logo raster e favicon serviti da URL pubblici. I dati
JSON-LD sono nell'HTML: Organization e WebSite condivisi, tipo pagina,
breadcrumb, servizi e FAQ coerenti con i testi visibili. Anche senza JavaScript
restano disponibili contenuti e collegamenti; il portfolio completo è statico
in Progetti. Aggiornare testi e relativo JSON-LD insieme, senza prezzi, rating o
risultati inventati. Le FAQ non garantiscono risultati avanzati su Google.

`robots.txt` consente ricerca/recupero di OpenAI e Claude, oltre ai crawler
ordinari. La regola generale preesistente resta permissiva anche per gli altri
bot: non è stata introdotta una nuova politica sui dati di addestramento.
Non sono necessari file speciali o markup riservato ai motori AI.

Search Console usa la proprietà `https://gruppoautoma.it/` nell'account Google
Automa. `sitemap.xml` contiene le sei pagine principali indicizzabili; aggiornare
`lastmod` quando il contenuto cambia realmente. Privacy e cookie restano noindex.
Per i motori che partecipano a IndexNow, il file pubblico `indexnow-key.txt`
consente la verifica dell'host; conservarlo dopo la pubblicazione. L'invio alle
API usa `keyLocation` alla radice e gli URL canonical delle pagine cambiate.
Una ricevuta di invio non prova scansione, indicizzazione o citazione AI.

Le verifiche e gli esiti di invio sono conservati nel ticket #6 del repository
sorgente e nel rapporto SEO/GEO del progetto. Le metriche di laboratorio e i
dati reali degli utenti sono valutazioni distinte.


## Pubblicare un articolo nel Blog

Il Blog è statico come il resto del sito: non richiede un nuovo CMS o servizi
esterni. L’indice è `blog/index.html`, sezione `#articoli`. Al momento non ci
sono articoli pubblicati: il messaggio di attesa è intenzionale.

1. Creare `blog/<slug>/index.html` con il contenuto approvato, riutilizzando
   navigazione, footer, font e componenti del sito. Un H1, sezioni leggibili,
   autore reale e data di pubblicazione visibili.
2. Aggiungere title, description, canonical, anteprima social e JSON-LD
   BlogPosting con gli stessi dati reali; niente prezzi, rating o date inventati.
3. Alla prima pubblicazione sostituire `.blog-empty` con l’elenco degli articoli
   reali: titolo/link, breve estratto, autore/data e immagine se disponibile.
   Ordinare dal più recente; mantenere l’elenco e i link nell’HTML, senza
   dipendere da JavaScript. Il Blog può riferire i post pubblicati con `blogPost`.
4. Inserire l’URL nella sitemap con lastmod reale, verificare link/asset e
   desktop/mobile, pubblicare con `deploy-automa.sh` e notificare IndexNow.

La pagina indice usa CollectionPage + Blog, non BlogPosting fittizi. La sua
anteprima è `assets/og/blog.jpg`.
