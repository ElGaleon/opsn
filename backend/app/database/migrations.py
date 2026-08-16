from uuid import uuid4

from sqlalchemy import Engine, inspect, text


def ensure_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            conn.execute(text("ALTER TYPE movementtype ADD VALUE IF NOT EXISTS 'transfer'"))
    add_movement_columns(engine, inspector)
    migrate_contract_tenants(engine, inspector)
    add_property_columns(engine, inspector)


def add_movement_columns(engine: Engine, inspector) -> None:
    if "movements" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("movements")}
    with engine.begin() as conn:
        if "payment_method" not in columns:
            conn.execute(text("ALTER TABLE movements ADD COLUMN payment_method VARCHAR(40)"))
        if "transfer_to_owner_id" not in columns:
            conn.execute(text("ALTER TABLE movements ADD COLUMN transfer_to_owner_id VARCHAR"))


def migrate_contract_tenants(engine: Engine, inspector) -> None:
    if "lease_contracts" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("lease_contracts")}
    with engine.begin() as conn:
        if "tenant_name" not in columns:
            conn.execute(text("ALTER TABLE lease_contracts ADD COLUMN tenant_name VARCHAR(180) DEFAULT ''"))
        if "tenant_id" not in columns:
            conn.execute(text("ALTER TABLE lease_contracts ADD COLUMN tenant_id VARCHAR"))
            if "tenant_name" in columns:
                names = conn.execute(
                    text(
                        "SELECT DISTINCT tenant_name FROM lease_contracts "
                        "WHERE tenant_name IS NOT NULL AND tenant_name != ''"
                    )
                ).all()
                for (name,) in names:
                    tenant_id = conn.execute(
                        text("SELECT id FROM tenants WHERE full_name = :name"),
                        {"name": name},
                    ).scalar()
                    if not tenant_id:
                        tenant_id = str(uuid4())
                        conn.execute(
                            text("INSERT INTO tenants (id, full_name) VALUES (:id, :name)"),
                            {"id": tenant_id, "name": name},
                        )
                    conn.execute(
                        text(
                            "UPDATE lease_contracts SET tenant_id = :tenant_id "
                            "WHERE tenant_name = :name"
                        ),
                        {"tenant_id": tenant_id, "name": name},
                    )


def add_property_columns(engine: Engine, inspector) -> None:
    if "properties" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("properties")}
    property_columns = {
        "street": "VARCHAR(160)",
        "street_number": "VARCHAR(32)",
        "city": "VARCHAR(120)",
        "postal_code": "VARCHAR(16)",
        "province": "VARCHAR(80)",
        "region": "VARCHAR(120)",
        "country": "VARCHAR(80)",
        "latitude": "NUMERIC(9, 6)",
        "longitude": "NUMERIC(9, 6)",
    }
    with engine.begin() as conn:
        for name, definition in property_columns.items():
            if name not in columns:
                conn.execute(text(f"ALTER TABLE properties ADD COLUMN {name} {definition}"))
