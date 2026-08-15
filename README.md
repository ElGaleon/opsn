# 🏠 OPSN

**OPSN** is a full-stack property management app for family-owned rental real estate. It brings accruals, cash flow, ownership shares, arrears, and owner balances into one operational dashboard.

![OPSN Dashboard](docs/assets/screenshots/dashboard.png)

## ✨ Highlights

- 📊 **Financial dashboard** with KPIs, monthly trends, accruals, cash flow, and arrears.
- 🏘️ **Properties and units** with values, mortgages, condominium costs, and ownership shares.
- 👥 **Owners** with balances, credits, debts, and internal transfers.
- 📄 **Lease contracts** with rent, deposits, due dates, and status tracking.
- 🔑 **Tenants** with contract history, rent totals, paid amounts, and arrears.
- 💸 **Movements** for income, expenses, and owner transfers.
- 🔐 **Optional Clerk auth** for authenticated access.
- 🐳 **Docker-ready** for local development and VPS deployment.

## 🖼️ Screenshots

| Dashboard | Properties |
| --- | --- |
| ![Dashboard](docs/assets/screenshots/dashboard.png) | ![Properties](docs/assets/screenshots/properties.png) |

| Owners | Contracts |
| --- | --- |
| ![Owners](docs/assets/screenshots/owners.png) | ![Contracts](docs/assets/screenshots/contracts.png) |

| Tenants | Movements |
| --- | --- |
| ![Tenants](docs/assets/screenshots/tenants.png) | ![Movements](docs/assets/screenshots/movements.png) |

## 🧱 Stack

- ⚛️ **Frontend:** React, Vite, TypeScript, Tailwind, shadcn-style components.
- 🐍 **Backend:** FastAPI, SQLAlchemy, Pydantic.
- 🗄️ **Database:** SQLite.
- ✅ **Forms:** Zod + React Hook Form.
- 🔐 **Auth:** Clerk, when configured.
- 🐳 **Runtime:** Docker Compose.

## 🚀 Local Development

```bash
docker compose up --build
```

Available services:

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:8000
- ❤️ Health check: http://localhost:8000/health

The local database is stored at:

```text
backend/data/opsn-2026.sqlite
```

## ⚙️ Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Main variables:

```text
DATABASE_URL=sqlite:///./data/opsn.sqlite
CORS_ORIGINS=http://localhost:5173
VITE_API_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_JWKS_URL=
CLERK_ISSUER=
```

If `VITE_CLERK_PUBLISHABLE_KEY` is not configured, the frontend runs without Clerk login. When Clerk is configured, the frontend requires authentication and sends the session token to the backend.

## 🗂️ Project Structure

```text
backend/
  app/
    api/routes/       FastAPI routers
    core/             Configuration and authentication
    database/         Session and database schema
    domain/           Models and schemas
    services/         Accounting logic
frontend/
  src/
    app/              Shell, section routing, data loading
    features/         Product features
    shared/           Components, API client, utilities, validation
docs/
  frontend/           Frontend section documentation
  assets/screenshots/ Main screenshots
```

## 📚 Frontend Docs

- [📊 Dashboard](docs/frontend/dashboard.md)
- [🏘️ Properties](docs/frontend/immobili.md)
- [👥 Owners](docs/frontend/proprietari.md)
- [📄 Contracts](docs/frontend/contratti.md)
- [🔑 Tenants](docs/frontend/inquilini.md)
- [💸 Movements](docs/frontend/movimenti.md)

## ✅ Release Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
python3 -m compileall backend/app
```
