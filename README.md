# OPSN

MVP fullstack per gestire immobili familiari in affitto, con distinzione tra competenza e cassa.

## Stack

- Frontend: React + Vite, componenti stile shadcn/ui, `zod` + `react-hook-form`, Clerk.
- Backend: FastAPI, SQLAlchemy, SQLite.
- Runtime: Docker Compose con container `frontend`, `backend`.

## Avvio

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API health: http://localhost:8000/health

Il database locale viene salvato in `backend/data/opsn.sqlite`.

In sviluppo locale l'autenticazione backend accetta un utente demo se `CLERK_JWKS_URL` non è configurato.
Per usare Clerk realmente, crea una app dal Clerk Dashboard e copia i valori in `.env` nella root del progetto:

```bash
cp .env.example .env
```

Esempio:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_JWKS_URL=https://your-clerk-frontend-api.clerk.accounts.dev/.well-known/jwks.json
CLERK_ISSUER=https://your-clerk-frontend-api.clerk.accounts.dev
```

Poi avvia:

```bash
docker compose up --build
```

Se avvii il frontend senza Docker da `frontend/`, usa anche `frontend/.env.local` con:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

Il frontend invia il session token Clerk al backend come bearer token; il backend lo verifica usando `CLERK_JWKS_URL` e `CLERK_ISSUER`.

## MVP incluso

- Dashboard: competenza netta, cash flow, morosità, movimenti recenti.
- Immobili: anagrafica proprietà e unità.
- Contratti: elenco contratti con canone, periodo, giorno scadenza.
- Movimenti: registro unico con data competenza, scadenza, pagamento e ripartizione.
- Scadenze: elenco operativo.
- Report: conto economico per immobile e saldo tra proprietari.

Il backend modella `Owner`, `Property`, `Unit`, `OwnershipShare`, `LeaseContract`, `Movement`, `MovementAllocation` e `Deadline`.
Le quote sono storicizzate con `valid_from` / `valid_to`; i movimenti possono essere ripartiti per quote, per proprietario o con split personalizzato via API.
