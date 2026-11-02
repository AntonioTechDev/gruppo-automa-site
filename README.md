# Gruppo Automa

Sito statico italiano di Gruppo Automa S.r.l.s., online su
[gruppoautoma.it](https://gruppoautoma.it/). HTML, CSS e JavaScript, senza build.
Font, immagini e librerie di animazione sono locali. Google Calendar viene
caricato quando il visitatore apre la prenotazione.

## Pagine

- Home: presentazione, servizi in sintesi, CheAI, portfolio, team e contatore ROI.
- Servizi: consulenza AI, gestionali/CRM/web app, automazioni/API e siti/landing.
- Progetti: dieci progetti con immagini, descrizioni e attribuzioni.
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
- Pagine interne: cartelle `servizi`, `progetti`, `chi-siamo`, `contatti`.
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
