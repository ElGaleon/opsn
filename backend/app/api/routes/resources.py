from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import current_user
from app.database.session import get_db
from app.domain import models
from app.domain.schemas import (
    ContractIn,
    ContractOut,
    DeadlineIn,
    DeadlineOut,
    MovementIn,
    MovementOut,
    OwnerIn,
    OwnerOut,
    OwnerTransferIn,
    OwnerTransferOut,
    OwnershipShareIn,
    OwnershipShareOut,
    OwnershipShareSetIn,
    PropertyIn,
    PropertyOut,
    TenantIn,
    TenantOut,
    UnitIn,
    UnitOut,
)
from app.services.accounting import build_allocations, sync_contract_rent_movements, validate_share_total

router = APIRouter(dependencies=[Depends(current_user)])


def get_or_404(db: Session, model, row_id: str):
    row = db.get(model, row_id)
    if not row:
        raise HTTPException(status_code=404, detail="Oggetto non trovato")
    return row


def patch_row(db: Session, row, payload):
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_row(db: Session, model, row_id: str) -> dict[str, bool]:
    row = get_or_404(db, model, row_id)
    db.delete(row)
    db.commit()
    return {"ok": True}


def split_partial_payload(payload: MovementIn) -> tuple[MovementIn, MovementIn | None]:
    if payload.status != "partial" or payload.type == "transfer":
        return payload, None
    if not payload.paid_amount or payload.paid_amount <= 0 or payload.paid_amount >= payload.amount:
        raise HTTPException(status_code=422, detail="Per un parziale indica un importo incassato/pagato minore del totale")
    paid = payload.model_copy(update={"amount": payload.paid_amount, "status": "paid", "paid_amount": None})
    remaining = payload.model_copy(update={
        "amount": payload.amount - payload.paid_amount,
        "status": "unpaid",
        "payment_date": None,
        "paid_by_owner_id": None,
        "payment_method": None,
        "paid_amount": None,
        "description": f"Residuo {payload.description}",
    })
    return paid, remaining


def add_movement(db: Session, payload: MovementIn) -> models.Movement:
    row = models.Movement(**payload.model_dump(exclude={"allocations", "paid_amount"}))
    build_allocations(db, row, payload)
    db.add(row)
    return row


@router.get("/owners", response_model=list[OwnerOut])
def owners(db: Session = Depends(get_db)):
    return db.scalars(select(models.Owner).order_by(models.Owner.last_name)).all()


@router.post("/owners", response_model=OwnerOut)
def create_owner(payload: OwnerIn, db: Session = Depends(get_db)):
    row = models.Owner(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/owners/{owner_id}", response_model=OwnerOut)
def owner_detail(owner_id: str, db: Session = Depends(get_db)):
    return get_or_404(db, models.Owner, owner_id)


@router.put("/owners/{owner_id}", response_model=OwnerOut)
def update_owner(owner_id: str, payload: OwnerIn, db: Session = Depends(get_db)):
    return patch_row(db, get_or_404(db, models.Owner, owner_id), payload)


@router.delete("/owners/{owner_id}")
def delete_owner(owner_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.Owner, owner_id)


@router.get("/tenants", response_model=list[TenantOut])
def tenants(db: Session = Depends(get_db)):
    return db.scalars(select(models.Tenant).order_by(models.Tenant.full_name)).all()


@router.post("/tenants", response_model=TenantOut)
def create_tenant(payload: TenantIn, db: Session = Depends(get_db)):
    row = models.Tenant(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/tenants/{tenant_id}", response_model=TenantOut)
def tenant_detail(tenant_id: str, db: Session = Depends(get_db)):
    return get_or_404(db, models.Tenant, tenant_id)


@router.put("/tenants/{tenant_id}", response_model=TenantOut)
def update_tenant(tenant_id: str, payload: TenantIn, db: Session = Depends(get_db)):
    return patch_row(db, get_or_404(db, models.Tenant, tenant_id), payload)


@router.delete("/tenants/{tenant_id}")
def delete_tenant(tenant_id: str, db: Session = Depends(get_db)):
    if db.scalar(select(models.LeaseContract.id).where(models.LeaseContract.tenant_id == tenant_id)):
        raise HTTPException(status_code=422, detail="Non puoi eliminare un inquilino con contratti collegati")
    return delete_row(db, models.Tenant, tenant_id)


@router.get("/properties", response_model=list[PropertyOut])
def properties(db: Session = Depends(get_db)):
    return db.scalars(select(models.Property).order_by(models.Property.name)).all()


@router.post("/properties", response_model=PropertyOut)
def create_property(payload: PropertyIn, db: Session = Depends(get_db)):
    row = models.Property(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/properties/{property_id}", response_model=PropertyOut)
def property_detail(property_id: str, db: Session = Depends(get_db)):
    return get_or_404(db, models.Property, property_id)


@router.put("/properties/{property_id}", response_model=PropertyOut)
def update_property(property_id: str, payload: PropertyIn, db: Session = Depends(get_db)):
    return patch_row(db, get_or_404(db, models.Property, property_id), payload)


@router.delete("/properties/{property_id}")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.Property, property_id)


@router.get("/units", response_model=list[UnitOut])
def units(property_id: str | None = None, db: Session = Depends(get_db)):
    stmt = select(models.Unit).order_by(models.Unit.name)
    if property_id:
        stmt = stmt.where(models.Unit.property_id == property_id)
    return db.scalars(stmt).all()


@router.post("/units", response_model=UnitOut)
def create_unit(payload: UnitIn, db: Session = Depends(get_db)):
    row = models.Unit(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/units/{unit_id}", response_model=UnitOut)
def unit_detail(unit_id: str, db: Session = Depends(get_db)):
    return get_or_404(db, models.Unit, unit_id)


@router.put("/units/{unit_id}", response_model=UnitOut)
def update_unit(unit_id: str, payload: UnitIn, db: Session = Depends(get_db)):
    return patch_row(db, get_or_404(db, models.Unit, unit_id), payload)


@router.delete("/units/{unit_id}")
def delete_unit(unit_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.Unit, unit_id)


@router.get("/ownership-shares", response_model=list[OwnershipShareOut])
def shares(db: Session = Depends(get_db)):
    return db.scalars(select(models.OwnershipShare).order_by(models.OwnershipShare.valid_from)).all()


@router.post("/ownership-shares", response_model=OwnershipShareOut)
def create_share(payload: OwnershipShareIn, db: Session = Depends(get_db)):
    if bool(payload.property_id) == bool(payload.unit_id):
        raise HTTPException(status_code=422, detail="Indica property_id oppure unit_id")
    validate_share_total(db, payload)
    row = models.OwnershipShare(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/ownership-shares/set", response_model=list[OwnershipShareOut])
def set_shares(payload: OwnershipShareSetIn, db: Session = Depends(get_db)):
    if bool(payload.property_id) == bool(payload.unit_id):
        raise HTTPException(status_code=422, detail="Indica property_id oppure unit_id")
    total = sum(item.percentage for item in payload.shares)
    if total != 100:
        raise HTTPException(status_code=422, detail="Le quote devono sommare 100%")
    target = (
        models.OwnershipShare.property_id == payload.property_id
        if payload.property_id
        else models.OwnershipShare.unit_id == payload.unit_id
    )
    existing = db.scalars(
        select(models.OwnershipShare).where(
            target,
            models.OwnershipShare.valid_from == payload.valid_from,
            models.OwnershipShare.valid_to == payload.valid_to,
        )
    ).all()
    for row in existing:
        db.delete(row)
    rows = [
        models.OwnershipShare(
            owner_id=item.owner_id,
            property_id=payload.property_id,
            unit_id=payload.unit_id,
            percentage=item.percentage,
            valid_from=payload.valid_from,
            valid_to=payload.valid_to,
        )
        for item in payload.shares
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


@router.put("/ownership-shares/{share_id}", response_model=OwnershipShareOut)
def update_share(share_id: str, payload: OwnershipShareIn, db: Session = Depends(get_db)):
    if bool(payload.property_id) == bool(payload.unit_id):
        raise HTTPException(status_code=422, detail="Indica property_id oppure unit_id")
    validate_share_total(db, payload, share_id)
    return patch_row(db, get_or_404(db, models.OwnershipShare, share_id), payload)


@router.delete("/ownership-shares/{share_id}")
def delete_share(share_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.OwnershipShare, share_id)


@router.get("/contracts", response_model=list[ContractOut])
def contracts(db: Session = Depends(get_db)):
    return db.scalars(
        select(models.LeaseContract)
        .options(selectinload(models.LeaseContract.tenant))
        .order_by(models.LeaseContract.starts_on.desc())
    ).all()


@router.post("/contracts", response_model=ContractOut)
def create_contract(payload: ContractIn, db: Session = Depends(get_db)):
    row = models.LeaseContract(**payload.model_dump())
    db.add(row)
    db.flush()
    sync_contract_rent_movements(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/contracts/{contract_id}", response_model=ContractOut)
def contract_detail(contract_id: str, db: Session = Depends(get_db)):
    return db.scalar(
        select(models.LeaseContract)
        .options(selectinload(models.LeaseContract.tenant))
        .where(models.LeaseContract.id == contract_id)
    ) or get_or_404(db, models.LeaseContract, contract_id)


@router.put("/contracts/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: str, payload: ContractIn, db: Session = Depends(get_db)):
    row = get_or_404(db, models.LeaseContract, contract_id)
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    sync_contract_rent_movements(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/contracts/{contract_id}")
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.LeaseContract, contract_id)


@router.get("/movements", response_model=list[MovementOut])
def movements(db: Session = Depends(get_db)):
    return db.scalars(
        select(models.Movement)
        .options(selectinload(models.Movement.allocations))
        .order_by(models.Movement.accrual_date.desc())
    ).all()


@router.post("/movements", response_model=MovementOut)
def create_movement(payload: MovementIn, db: Session = Depends(get_db)):
    paid, remaining = split_partial_payload(payload)
    row = add_movement(db, paid)
    if remaining:
        add_movement(db, remaining)
    db.commit()
    db.refresh(row)
    return row


@router.get("/movements/{movement_id}", response_model=MovementOut)
def movement_detail(movement_id: str, db: Session = Depends(get_db)):
    return db.scalar(
        select(models.Movement)
        .options(selectinload(models.Movement.allocations))
        .where(models.Movement.id == movement_id)
    ) or get_or_404(db, models.Movement, movement_id)


@router.put("/movements/{movement_id}", response_model=MovementOut)
def update_movement(movement_id: str, payload: MovementIn, db: Session = Depends(get_db)):
    paid, remaining = split_partial_payload(payload)
    row = get_or_404(db, models.Movement, movement_id)
    for key, value in paid.model_dump(exclude={"allocations", "paid_amount"}).items():
        setattr(row, key, value)
    build_allocations(db, row, paid)
    if remaining:
        add_movement(db, remaining)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/movements/{movement_id}")
def delete_movement(movement_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.Movement, movement_id)


@router.get("/owner-transfers", response_model=list[OwnerTransferOut])
def owner_transfers(db: Session = Depends(get_db)):
    return db.scalars(select(models.OwnerTransfer).order_by(models.OwnerTransfer.transfer_date.desc())).all()


@router.post("/owner-transfers", response_model=OwnerTransferOut)
def create_owner_transfer(payload: OwnerTransferIn, db: Session = Depends(get_db)):
    if payload.from_owner_id == payload.to_owner_id:
        raise HTTPException(status_code=422, detail="I proprietari devono essere diversi")
    row = models.OwnerTransfer(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/owner-transfers/{transfer_id}")
def delete_owner_transfer(transfer_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.OwnerTransfer, transfer_id)


@router.get("/deadlines", response_model=list[DeadlineOut])
def deadlines(db: Session = Depends(get_db)):
    return db.scalars(select(models.Deadline).order_by(models.Deadline.due_date)).all()


@router.post("/deadlines", response_model=DeadlineOut)
def create_deadline(payload: DeadlineIn, db: Session = Depends(get_db)):
    row = models.Deadline(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/deadlines/{deadline_id}", response_model=DeadlineOut)
def deadline_detail(deadline_id: str, db: Session = Depends(get_db)):
    return get_or_404(db, models.Deadline, deadline_id)


@router.put("/deadlines/{deadline_id}", response_model=DeadlineOut)
def update_deadline(deadline_id: str, payload: DeadlineIn, db: Session = Depends(get_db)):
    return patch_row(db, get_or_404(db, models.Deadline, deadline_id), payload)


@router.delete("/deadlines/{deadline_id}")
def delete_deadline(deadline_id: str, db: Session = Depends(get_db)):
    return delete_row(db, models.Deadline, deadline_id)
