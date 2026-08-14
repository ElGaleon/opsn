from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import reports, resources
from app.core.config import settings
from app.database.session import Base, SessionLocal, engine, ensure_schema
from app.domain import models  # noqa: F401
from app.seed import seed

app = FastAPI(title="OPSN")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resources.router)
app.include_router(reports.router)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as db:
        seed(db)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
