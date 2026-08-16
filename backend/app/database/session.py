from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings
from app.database.migrations import ensure_schema as run_migrations


is_sqlite = settings.database_url.startswith("sqlite")
if is_sqlite and settings.database_url != "sqlite:///:memory:":
    Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=not is_sqlite,
)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    if is_sqlite:
        dbapi_connection.execute("PRAGMA foreign_keys=ON")


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema() -> None:
    run_migrations(engine)
