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

## Rilascio su GitHub

Prima di rilasciare:

```bash
cd frontend
npm run build

cd ..
python3 -m compileall backend/app
```

Commit e push:

```bash
git status
git add .
git commit -m "Descrizione modifica"
git push origin main
```

Tag di release:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

Poi su GitHub: `Releases` -> `Draft a new release` -> scegli il tag -> `Publish release`.

## Deploy automatico su VPS

Il workflow e in:

```text
.github/workflows/deploy.yml
```

Parte a ogni push su `main` e sulla VPS esegue:

```bash
cd $VPS_PROJECT_PATH
git pull --ff-only origin main
docker compose up -d --build
```

### Secret GitHub

Nel repository GitHub vai in `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

Aggiungi:

```text
VPS_HOST=IP o dominio della VPS
VPS_USER=deploy
VPS_SSH_KEY=chiave privata SSH dedicata al deploy
VPS_PROJECT_PATH=/opt/opsn
```

La chiave pubblica corrispondente va sulla VPS in:

```text
/home/deploy/.ssh/authorized_keys
```

La chiave privata va nel secret GitHub `VPS_SSH_KEY`, includendo anche intestazione e chiusura:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## Utente deploy sulla VPS

Creazione consigliata:

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /opt/opsn
```

Dopo aver aggiunto `deploy` al gruppo Docker, apri una nuova sessione SSH.

## Note produzione

Il frontend oggi usa il server Vite anche in Docker. Va bene per MVP e test su VPS privata; per produzione pubblica conviene sostituirlo con una build statica servita da nginx o Caddy.
