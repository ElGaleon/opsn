from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.domain import models
from app.domain.schemas import MovementIn, OwnershipShareIn


def intervals_overlap(a_from: date, a_to: date | None, b_from: date, b_to: date | None) -> bool:
    return a_from <= (b_to or date.max) and b_from <= (a_to or date.max)


def validate_share_total(db: Session, new_share: OwnershipShareIn, existing_id: str | None = None) -> None:
    target = (
        models.OwnershipShare.property_id == new_share.property_id
        if new_share.property_id
        else models.OwnershipShare.unit_id == new_share.unit_id
    )
    rows = db.scalars(select(models.OwnershipShare).where(target)).all()
    checkpoints = {new_share.valid_from, new_share.valid_to or date.max}
    for row in rows:
        if row.id != existing_id and intervals_overlap(new_share.valid_from, new_share.valid_to, row.valid_from, row.valid_to):
            checkpoints.add(row.valid_from)
            checkpoints.add(row.valid_to or date.max)
    for day in checkpoints:
        total = new_share.percentage if new_share.valid_from <= day <= (new_share.valid_to or date.max) else Decimal("0")
        for row in rows:
            if row.id == existing_id:
                continue
            if row.valid_from <= day <= (row.valid_to or date.max):
                total += row.percentage
        if total != Decimal("100.00"):
            raise HTTPException(status_code=422, detail="Le quote devono sommare 100% in ogni intervallo valido")


def active_shares(db: Session, movement: MovementIn) -> list[models.OwnershipShare]:
    base_filters = [
        models.OwnershipShare.valid_from <= movement.accrual_date,
        or_(models.OwnershipShare.valid_to.is_(None), models.OwnershipShare.valid_to >= movement.accrual_date),
    ]
    if movement.unit_id:
        shares = db.scalars(
            select(models.OwnershipShare).where(
                and_(*base_filters, models.OwnershipShare.unit_id == movement.unit_id)
            )
        ).all()
        if shares:
            if sum((share.percentage for share in shares), Decimal("0")) != Decimal("100.00"):
                raise HTTPException(status_code=422, detail="Quote attive mancanti o non pari al 100%")
            return shares
        property_id = db.scalar(select(models.Unit.property_id).where(models.Unit.id == movement.unit_id))
        filters = [*base_filters, models.OwnershipShare.property_id == property_id]
    elif movement.property_id:
        filters = [*base_filters, models.OwnershipShare.property_id == movement.property_id]
    else:
        raise HTTPException(status_code=422, detail="Serve un immobile o una unità per ripartire secondo quote")
    shares = db.scalars(select(models.OwnershipShare).where(and_(*filters))).all()
    if sum((share.percentage for share in shares), Decimal("0")) != Decimal("100.00"):
        raise HTTPException(status_code=422, detail="Quote attive mancanti o non pari al 100%")
    return shares


def money(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def add_months(day: date, months: int) -> date:
    month = day.month - 1 + months
    year = day.year + month // 12
    return date(year, month % 12 + 1, 1)


def month_end(day: date) -> date:
    return add_months(day.replace(day=1), 1) - timedelta(days=1)


def rent_due_date(starts_on: date, due_day: int, month: date) -> date:
    due = date(month.year, month.month, min(due_day, month_end(month).day))
    return max(due, starts_on) if month == starts_on.replace(day=1) else due


def build_allocations(db: Session, movement: models.Movement, payload: MovementIn) -> None:
    if payload.type == "transfer":
        if not payload.paid_by_owner_id or not payload.transfer_to_owner_id or not payload.payment_method:
            raise HTTPException(status_code=422, detail="Per un trasferimento indica proprietario da, proprietario a e metodo")
        if payload.paid_by_owner_id == payload.transfer_to_owner_id:
            raise HTTPException(status_code=422, detail="I proprietari devono essere diversi")
        movement.allocations = []
        return
    if payload.status != "unpaid" and (not payload.paid_by_owner_id or not payload.payment_method):
        raise HTTPException(status_code=422, detail="Per movimenti pagati o parziali indica proprietario e metodo di pagamento")
    if payload.allocation_mode == "ownership":
        pieces = [(share.owner_id, share.percentage) for share in active_shares(db, payload)]
    elif payload.allocation_mode == "owner":
        if not payload.paid_by_owner_id:
            raise HTTPException(status_code=422, detail="Serve il proprietario per la ripartizione diretta")
        pieces = [(payload.paid_by_owner_id, Decimal("100"))]
    else:
        total = sum((item.percentage for item in payload.allocations), Decimal("0"))
        if total != Decimal("100"):
            raise HTTPException(status_code=422, detail="La ripartizione personalizzata deve sommare 100%")
        pieces = [(item.owner_id, item.percentage) for item in payload.allocations]

    movement.allocations = [
        models.MovementAllocation(owner_id=owner_id, percentage=percentage, amount=money(payload.amount * percentage / 100))
        for owner_id, percentage in pieces
    ]


def sync_contract_rent_movements(db: Session, contract: models.LeaseContract) -> None:
    unit = db.get(models.Unit, contract.unit_id)
    if not unit:
        return
    today = date.today()
    start = contract.starts_on.replace(day=1)
    stop = min(contract.ends_on or today, today).replace(day=1)
    existing = set(
        db.scalars(select(models.Movement.accrual_date).where(models.Movement.contract_id == contract.id)).all()
    )
    month = start
    while month <= stop:
        due = rent_due_date(contract.starts_on, contract.due_day, month)
        if month not in existing:
            payload = MovementIn(
                property_id=unit.property_id,
                unit_id=unit.id,
                contract_id=contract.id,
                type="income",
                category="Affitto",
                description=f"Canone {month:%Y-%m} - {contract.tenant_name}",
                amount=contract.monthly_rent,
                accrual_date=month,
                due_date=due,
                status="unpaid",
                allocation_mode="ownership",
            )
            movement = models.Movement(**payload.model_dump(exclude={"allocations", "paid_amount"}))
            try:
                build_allocations(db, movement, payload)
            except HTTPException:
                movement.allocations = []
            db.add(movement)
        else:
            db.query(models.Movement).filter(
                models.Movement.contract_id == contract.id,
                models.Movement.accrual_date == month,
                models.Movement.status == models.MovementStatus.unpaid,
            ).update({"due_date": due})
        month = add_months(month, 1)
