# Grassi Tech Quest

Applicazione web Next.js per la gamification del **Grassi Linux Tech Day 2026**.
Stile terminale Linux, mobile-first per il quiz, dashboard monitor leggibile da lontano.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (tema terminale verde/cyan)
- Auth.js (NextAuth v5) + Google OAuth
- Prisma + SQLite
- Docker / Docker Compose
- Caddy reverse-proxy esterno (non incluso nel compose)

## Variabili d'ambiente

Copia `.env.example` in `.env` e compila:

```env
AUTH_SECRET=                 # openssl rand -base64 32
AUTH_URL=https://techday.itisgrassi.it/quest
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ALLOWED_EMAIL_DOMAIN=itisgrassi.edu.it
ADMIN_EMAIL=admin@itisgrassi.edu.it
DATABASE_URL=file:./data/techquest.db
NEXT_PUBLIC_APP_URL=https://techday.itisgrassi.it/quest
NEXT_PUBLIC_BASE_PATH=/quest
```

## Sviluppo locale

```bash
npm install
npx prisma migrate dev
npm run db:seed   # crea admin (ADMIN_EMAIL) e badge
npm run dev
```

App esposta sotto `http://localhost:3000/quest`.

## Build & deploy

```bash
docker compose build
docker compose up -d
```

Il container:

- esegue `prisma migrate deploy` all'avvio (fallback `db push`)
- esegue il seed se `RUN_SEED=1`
- monta `/app/data` come volume Docker per persistere SQLite
- espone `127.0.0.1:3000`: configura Caddy come reverse proxy con `handle_path /quest/*`

## Scelte di design

- **Monitor pubblico**: `/quest/monitor` non richiede login (tutti possono vedere statistiche/classifica).
- **Stand con 0 domande**: completamento immediato con `basePoints` dello stand (visita "premiata").
- **Import CSV stand duplicati**: upsert su `code` con report.
- **Reset utenti**: con OAuth non c'è password locale; "reset" = reset onboarding (rifare profilo).
- **Punteggio retry**: prima risposta corretta = 100% punti domanda; corretta dopo errore = 20% (arrotondato).
- **Penalità non cumulativa**: una domanda è chiusa appena viene data la risposta corretta.

## CSV format

### stand
```csv
code,area,room,title,description,basePoints,isActive
A01,A,I36,Linux Live,Demo Linux live,10,true
```
Colonne richieste: `code,area,room,title`. Opzionali: `description,basePoints,isActive`.

### domande
```csv
standCode,question,option1,option2,option3,option4,correctOption,points,isActive
A01,Cos'è una distribuzione Linux?,Kernel,SO completo,Browser,Editor,2,10,true
```
`correctOption` deve essere 1..4.

## Scripts

- `npm run dev` — dev server
- `npm run build` — produzione (esegue `prisma generate`)
- `npm run start` — start produzione
- `npm run lint` / `typecheck` / `validate`
- `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio`

## Privacy

Salvati: email, nome, cognome, classe, punteggi, tentativi, timestamp.
**Non** salvati: IP, user-agent, audit anti-cheat.
