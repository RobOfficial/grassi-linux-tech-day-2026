# Prompt Ralph Loop — Grassi Tech Quest

Sei un agente di sviluppo senior. Devi implementare l'app **Grassi Tech Quest**, una web app Next.js per la gamification del Grassi Linux Tech Day 2026.

Lavora in modalità **Ralph Loop**:

1. Leggi sempre `progress.txt`.
2. Leggi sempre `backlog.json`.
3. Scegli il primo task `todo` secondo `implementation_order`.
4. Implementa solo quel task o un blocco minimo coerente.
5. Aggiorna `backlog.json` impostando il task completato a `done` solo se i criteri di accettazione sono soddisfatti.
6. Aggiorna `progress.txt` aggiungendo una nuova voce nella sezione “Log iterazioni Ralph Loop”.
7. Esegui i controlli disponibili: lint, typecheck, build, test o almeno controllo manuale ragionato.
8. Se qualcosa non passa, non segnare il task come done: documenta il problema in `progress.txt`.
9. Non cambiare scope senza motivo.
10. Non hardcodare gli stand della mappa: gli stand devono arrivare da CSV/admin panel.

## Requisiti principali

L'app serve solo per la **Tech Quest**.

Dominio previsto:

```txt
https://techday.itisgrassi.it/quest
```

L'app deve funzionare con base path:

```txt
/quest
```

## Stack obbligatorio

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Auth.js / NextAuth
- Google OAuth
- Prisma
- SQLite
- Docker Compose
- Route Handlers come API interne/BFF

## Utenti e ruoli

Ruoli:

- `STUDENT`
- `ADMIN`

Gli studenti:
- accedono con Google OAuth;
- devono avere email con dominio `@itisgrassi.edu.it`;
- alla prima registrazione inseriscono nome, cognome e classe;
- possono completare ogni stand al massimo una volta;
- vedono punteggio, badge, classifica e statistiche.

L'admin:
- è un solo account configurabile tramite `ADMIN_EMAIL` in `.env`;
- gestisce stand;
- importa stand da CSV;
- gestisce domande;
- importa domande da CSV;
- genera QR code;
- vede utenti;
- corregge nome/cognome/classe;
- resetta onboarding/profilo utenti;
- esporta risultati CSV.

Non esistono account Maker.

## Auth

Usa queste variabili:

```env
AUTH_SECRET=
AUTH_URL=https://techday.itisgrassi.it/quest
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ALLOWED_EMAIL_DOMAIN=itisgrassi.edu.it
ADMIN_EMAIL=
DATABASE_URL=file:./data/techquest.db
NEXT_PUBLIC_APP_URL=https://techday.itisgrassi.it/quest
NEXT_PUBLIC_BASE_PATH=/quest
```

Blocca ogni login fuori dal dominio `itisgrassi.edu.it`.

## Stand e QR code

Ogni stand:
- ha codice, area, stanza/aula, titolo, descrizione opzionale;
- ha punteggio base configurabile;
- ha token non indovinabile;
- ha un QR code fisso;
- il QR punta a `/quest/scan/{token}`.

L'admin può rigenerare il token: il vecchio QR deve smettere di funzionare.

Gli stand vengono importati massivamente via CSV. Non hardcodare l'elenco stand.

CSV stand:

```csv
code,area,room,title,description,basePoints,isActive
A01,A,I36,Linux Live,Demo Linux live,10,true
```

Colonne richieste: `code,area,room,title`.

## Quiz

Ogni stand può avere un numero variabile di domande, anche zero.

Ogni domanda:
- ha 4 opzioni;
- ha una sola opzione corretta;
- ha punti configurabili;
- appartiene a uno stand.

Per MVP, quando uno studente avvia uno stand, usa tutte le domande attive in ordine casuale.

Regole punteggio:

- risposta corretta al primo tentativo: 100% punti domanda;
- risposta sbagliata: mostra subito errore;
- dopo errore, lo studente può cliccare un'altra risposta;
- risposta corretta dopo uno o più errori: 20% punti domanda;
- non assegnare mai due volte punti per la stessa domanda;
- completato lo stand, non può rifarlo.

I punteggi devono essere calcolati lato server, mai dal client.

## Classifica e statistiche

La classifica è individuale, per singolo studente.

Mostra:
- posizione;
- nome;
- cognome;
- classe;
- punti totali;
- stand completati.

La dashboard monitor `/quest/monitor` mostra:
- classifica studenti;
- statistiche globali;
- classe con più punti.

Aggiornamento:
- polling ogni 30 secondi.

Statistiche globali:
- studenti registrati;
- completamenti stand;
- punti totali assegnati;
- stand più completato;
- media punti per studente;
- classe con più punti.

Statistiche per stand:
- completamenti;
- punteggio medio;
- domande più sbagliate.

## Badge

Implementa badge gamification.

Badge iniziali:
- Kernel Explorer: completa 1 stand;
- Debugger: completa 3 stand;
- Packet Hunter: completa 5 stand;
- Root Master: soglia punti;
- Tux Champion: soglia alta/top ranking.

I badge devono essere:
- seedati;
- assegnati automaticamente;
- mostrati allo studente;
- idempotenti, senza duplicati.

## Export

L'admin deve poter esportare CSV:

1. classifica studenti;
2. tentativi per stand;
3. risposte dettagliate.

Campi minimi:
- email;
- nome;
- cognome;
- classe;
- stand;
- punteggio;
- timestamp;
- domanda;
- opzione scelta;
- correttezza;
- punti assegnati.

## Privacy

Salva:
- email;
- nome;
- cognome;
- classe;
- punteggi;
- tentativi;
- timestamp;
- stand visitati.

Non salvare:
- IP;
- user-agent.

## Docker

Crea Dockerfile e docker-compose.yml.

Caddy è già installato fuori dal progetto, quindi non aggiungere un servizio Caddy obbligatorio.

SQLite deve persistere su volume o bind mount.

## Criteri generali

Ogni implementazione deve:
- essere tipizzata;
- avere validazione server-side;
- proteggere le route admin lato server;
- usare UI shadcn dove opportuno;
- essere mobile-first per il quiz studente;
- essere leggibile su monitor per `/quest/monitor`;
- grafica: deve avere uno stile "tech", "geek", "nerd" stile terminale linux.
- mantenere aggiornati `backlog.json` e `progress.txt`.

Inizia dal primo task `todo` in `implementation_order`.