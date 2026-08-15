# 🤖 AGENTS.md

**AGENTS.md** defines the working rules for contributors and coding agents on this project.

## 🧭 Working Rules

- 📖 **Read first:** inspect existing code before making changes and follow the patterns, naming, and style already in place.
- ⚛️ **React frontend:** use the `src/app`, `src/features`, `src/shared` structure.
- 🧩 **Feature layout:** views orchestrate pages; UI components, forms, tables, details, and calculations belong in the feature's `components`, `hooks`, `utils`, or in `shared` when reusable.
- 🧾 **Types:** every feature with its own types should have `types/`; keep only shared backend DTOs/API types in `shared/lib/api`.
- 🐍 **FastAPI backend:** keep `models`, `schemas`, `routers`, and `services` separate.
- ✂️ **File size:** no file should exceed 500 lines.
- ✅ **Forms:** use Zod to validate frontend forms.
- 🔐 **Auth:** use Clerk for authentication/authorization when configured.
- 🐳 **Runtime:** keep the app Docker-friendly; frontend, backend, and database must start with `docker compose`.
- 🎯 **Scope:** do not mix refactors with unrelated functional changes.
- 🔎 **Search:** use `rg` or `rg --files` for repository searches.
- 🪶 **Style:** prefer simple, localized, easy-to-read solutions.

## ✅ Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
python3 -m compileall backend/app
```
