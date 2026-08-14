# AGENTS.md

Indicazioni operative per lavorare su questo progetto.

- Leggere il codice esistente prima di modificare: seguire pattern, naming e stile gia presenti.
- Frontend React: struttura `src/app`, `src/features`, `src/shared`.
- Le view devono orchestrare la pagina; componenti UI, form, tabelle, dettagli e calcoli vanno in `components`, `hooks`, `utils` della feature o in `shared` se riusabili.
- Ogni feature con tipi propri deve avere `types/`; tenere in `shared/lib/api` solo i DTO/API comuni del backend.
- Backend Python/FastAPI: mantenere separati `models`, `schemas`, `routers`, `services`.
- Nessun file deve superare 500 righe.
- Usare Zod per validare i form frontend.
- Usare Clerk per autenticazione/autorizzazione quando configurato.
- Tenere l'app Docker-friendly: frontend, backend e database devono partire con `docker compose`.
- Non mescolare refactor e cambi funzionali non richiesti.
- Prima di concludere una modifica frontend eseguire `npm run build` in `frontend`.
- Prima di concludere una modifica backend eseguire `python3 -m compileall backend/app`.
- Per ricerche nel repo usare `rg` o `rg --files`.
- Preferire soluzioni semplici, localizzate e facili da leggere.
