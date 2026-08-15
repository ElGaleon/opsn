# OPSN

OPSN e un gestionale fullstack per amministrare immobili familiari in affitto, con attenzione a competenza, cassa, quote proprietarie, morosita e saldi tra proprietari.

![Dashboard OPSN](docs/assets/screenshots/dashboard.png)

## Funzionalita principali

- Dashboard con KPI, andamento mensile, competenza, cassa e morosita.
- Anagrafica immobili con unita, valori, mutui, spese condominiali e quote.
- Gestione proprietari con saldi, crediti, debiti e trasferimenti interni.
- Contratti di locazione con canone, deposito, scadenze e stato.
- Inquilini con storico contratti, canoni, versato e morosita.
- Registro movimenti per entrate, uscite e trasferimenti.
- Autenticazione Clerk opzionale.
- Deploy Docker-friendly su VPS.

## Screenshot

| Sezione | Anteprima |
| --- | --- |
| Dashboard | ![Dashboard](docs/assets/screenshots/dashboard.png) |
| Immobili | ![Immobili](docs/assets/screenshots/properties.png) |
| Proprietari | ![Proprietari](docs/assets/screenshots/owners.png) |
| Contratti | ![Contratti](docs/assets/screenshots/contracts.png) |
| Inquilini | ![Inquilini](docs/assets/screenshots/tenants.png) |
| Movimenti | ![Movimenti](docs/assets/screenshots/movements.png) |

## Stack

- Frontend: React, Vite, TypeScript, shadcn-style components, Tailwind, Zod, React Hook Form.
- Backend: FastAPI, SQLAlchemy, Pydantic.
- Database: SQLite.
- Runtime: Docker Compose.
- Auth: Clerk, se configurato.

## Struttura

```text
backend/
  app/
    api/routes/       Router FastAPI
    core/             Configurazione e autenticazione
    database/         Sessione e schema database
    domain/           Modelli e schemi
    services/         Logica contabile
frontend/
  src/
    app/              Shell, routing di sezione, loading dati
    features/         Sezioni funzionali
    shared/           Componenti, API client, utils, validazioni
docs/
  frontend/           Documentazione delle sezioni frontend
  assets/screenshots/ Screenshot principali
```

## Avvio locale

```bash
docker compose up --build
```

URL:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

Il database locale viene salvato in:

```text
backend/data/opsn-2026.sqlite
```

## Configurazione

Copia l'esempio:

```bash
cp .env.example .env
```

Variabili principali:

```text
DATABASE_URL=sqlite:///./data/opsn.sqlite
CORS_ORIGINS=http://localhost:5173
VITE_API_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_JWKS_URL=
CLERK_ISSUER=
```

Se `VITE_CLERK_PUBLISHABLE_KEY` non e configurata, il frontend parte senza login Clerk. Se Clerk e configurato, il frontend richiede autenticazione e invia il token al backend.

## Documentazione frontend

- [Dashboard](docs/frontend/dashboard.md)
- [Immobili](docs/frontend/immobili.md)
- [Proprietari](docs/frontend/proprietari.md)
- [Contratti](docs/frontend/contratti.md)
- [Inquilini](docs/frontend/inquilini.md)
- [Movimenti](docs/frontend/movimenti.md)