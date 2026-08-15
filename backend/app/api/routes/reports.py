from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.core.auth import current_user
from app.database.session import get_db
from app.domain import models

router = APIRouter(prefix="/reports", dependencies=[Depends(current_user)])


def enum_value(value):
    return getattr(value, "value", value)


def add_months(day: date, months: int) -> date:
    month = day.month - 1 + months
    year = day.year + month // 12
    return date(year, month % 12 + 1, 1)


def month_end(month_start: date) -> date:
    return add_months(month_start, 1) - timedelta(days=1)


def active_shares(db: Session, unit_id: str | None, property_id: str | None, day: date):
    filters = [
        models.OwnershipShare.valid_from <= day,
        or_(models.OwnershipShare.valid_to.is_(None), models.OwnershipShare.valid_to >= day),
    ]
    if unit_id:
        unit_shares = db.scalars(select(models.OwnershipShare).where(and_(*filters, models.OwnershipShare.unit_id == unit_id))).all()
        if unit_shares:
            return unit_shares
        property_id = db.scalar(select(models.Unit.property_id).where(models.Unit.id == unit_id))
    if property_id:
        return db.scalars(select(models.OwnershipShare).where(and_(*filters, models.OwnershipShare.property_id == property_id))).all()
    return []


def add_owner_amount(owners: dict[str, dict], owner_id: str, owner_name: str, key: str, amount: Decimal) -> None:
    row = owners.setdefault(owner_id, {"owner_id": owner_id, "owner": owner_name, "income_due": Decimal("0"), "expense_due": Decimal("0")})
    row[key] += amount


def is_contract_rent_duplicate(movement: models.Movement, contracts: list[models.LeaseContract]) -> bool:
    rent_categories = {"affitto", "canone", "locazione"}
    if enum_value(movement.type) != "income" or movement.category.strip().lower() not in rent_categories:
        return False
    return any(
        movement.unit_id == contract.unit_id
        or (movement.property_id and movement.property_id == contract.unit.property_id)
        for contract in contracts
    )


@router.get("/summary")
def report_summary(db: Session = Depends(get_db)):
    rows = db.execute(
        select(models.Movement.type, models.Movement.status, func.coalesce(func.sum(models.Movement.amount), 0)).group_by(
            models.Movement.type, models.Movement.status
        )
    ).all()
    income_accrual = sum(amount for kind, _status, amount in rows if enum_value(kind) == "income")
    expense_accrual = sum(amount for kind, _status, amount in rows if enum_value(kind) == "expense")
    income_cash = sum(amount for kind, status, amount in rows if enum_value(kind) == "income" and enum_value(status) == "paid")
    expense_cash = sum(amount for kind, status, amount in rows if enum_value(kind) == "expense" and enum_value(status) == "paid")
    arrears = sum(amount for kind, status, amount in rows if enum_value(kind) == "income" and enum_value(status) != "paid")
    return {
        "income_accrual": Decimal(income_accrual),
        "expense_accrual": Decimal(expense_accrual),
        "net_accrual": Decimal(income_accrual) - Decimal(expense_accrual),
        "income_cash": Decimal(income_cash),
        "expense_cash": Decimal(expense_cash),
        "cashflow": Decimal(income_cash) - Decimal(expense_cash),
        "arrears": Decimal(arrears),
        "property_count": db.scalar(select(func.count(models.Property.id))),
        "unit_count": db.scalar(select(func.count(models.Unit.id))),
        "contract_count": db.scalar(select(func.count(models.LeaseContract.id))),
    }


@router.get("/owners")
def report_owners(db: Session = Depends(get_db)):
    owners = db.scalars(select(models.Owner).order_by(models.Owner.last_name)).all()
    output = []
    for owner in owners:
        allocations = db.execute(
            select(models.Movement.type, func.coalesce(func.sum(models.MovementAllocation.amount), 0))
            .join(models.MovementAllocation.movement)
            .where(models.MovementAllocation.owner_id == owner.id)
            .group_by(models.Movement.type)
        ).all()
        cash_rows = db.execute(
            select(models.Movement.type, func.coalesce(func.sum(models.Movement.amount), 0))
            .where(models.Movement.paid_by_owner_id == owner.id, models.Movement.status != "unpaid")
            .group_by(models.Movement.type)
        ).all()
        settled_allocations = db.execute(
            select(models.Movement.type, func.coalesce(func.sum(models.MovementAllocation.amount), 0))
            .join(models.MovementAllocation.movement)
            .where(models.MovementAllocation.owner_id == owner.id, models.Movement.status != "unpaid")
            .group_by(models.Movement.type)
        ).all()
        income = sum(amount for kind, amount in allocations if enum_value(kind) == "income")
        expenses = sum(amount for kind, amount in allocations if enum_value(kind) == "expense")
        settled_income = sum(amount for kind, amount in settled_allocations if enum_value(kind) == "income")
        settled_expenses = sum(amount for kind, amount in settled_allocations if enum_value(kind) == "expense")
        cash_income = sum(amount for kind, amount in cash_rows if enum_value(kind) == "income")
        cash_expenses = sum(amount for kind, amount in cash_rows if enum_value(kind) == "expense")
        transfers_in = db.scalar(select(func.coalesce(func.sum(models.OwnerTransfer.amount), 0)).where(models.OwnerTransfer.to_owner_id == owner.id))
        transfers_out = db.scalar(select(func.coalesce(func.sum(models.OwnerTransfer.amount), 0)).where(models.OwnerTransfer.from_owner_id == owner.id))
        movement_transfers_in = db.scalar(select(func.coalesce(func.sum(models.Movement.amount), 0)).where(models.Movement.type == "transfer", models.Movement.transfer_to_owner_id == owner.id))
        movement_transfers_out = db.scalar(select(func.coalesce(func.sum(models.Movement.amount), 0)).where(models.Movement.type == "transfer", models.Movement.paid_by_owner_id == owner.id))
        cash = cash_income - cash_expenses + transfers_in - transfers_out + movement_transfers_in - movement_transfers_out
        net = income - expenses
        settled_net = settled_income - settled_expenses
        output.append(
            {
                "owner_id": owner.id,
                "owner": f"{owner.first_name} {owner.last_name}",
                "income": income,
                "expenses": expenses,
                "net": net,
                "paid_directly": cash,
                "owner_balance": cash - settled_net,
            }
        )
    return output


@router.get("/forecast")
def report_forecast(months: int = 12, start_month: str | None = None, db: Session = Depends(get_db)):
    try:
        start = date.fromisoformat(f"{start_month}-01") if start_month else date.today().replace(day=1)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="start_month deve essere nel formato YYYY-MM") from exc
    owners = {owner.id: f"{owner.first_name} {owner.last_name}" for owner in db.scalars(select(models.Owner)).all()}
    month_rows = []
    owner_rows: dict[str, dict] = {}

    for index in range(months):
        month_start = add_months(start, index)
        month_stop = month_end(month_start)
        income_due = Decimal("0")
        expense_due = Decimal("0")

        contracts = db.scalars(
            select(models.LeaseContract).where(
                models.LeaseContract.starts_on <= month_stop,
                or_(models.LeaseContract.ends_on.is_(None), models.LeaseContract.ends_on >= month_start),
            )
        ).all()
        for contract in contracts:
            income_due += contract.monthly_rent
            for share in active_shares(db, contract.unit_id, None, month_start):
                add_owner_amount(owner_rows, share.owner_id, owners.get(share.owner_id, "Proprietario"), "income_due", contract.monthly_rent * share.percentage / 100)

        movements = db.scalars(
            select(models.Movement).where(
                models.Movement.accrual_date >= month_start,
                models.Movement.accrual_date <= month_stop,
                models.Movement.contract_id.is_(None),
            )
        ).all()
        for movement in movements:
            if enum_value(movement.type) == "transfer":
                continue
            if is_contract_rent_duplicate(movement, contracts):
                continue
            if enum_value(movement.type) == "income":
                income_due += movement.amount
                key = "income_due"
            else:
                expense_due += movement.amount
                key = "expense_due"
            allocations = movement.allocations or [
                models.MovementAllocation(owner_id=share.owner_id, percentage=share.percentage, amount=movement.amount * share.percentage / 100)
                for share in active_shares(db, movement.unit_id, movement.property_id, movement.accrual_date)
            ]
            for allocation in allocations:
                add_owner_amount(owner_rows, allocation.owner_id, owners.get(allocation.owner_id, "Proprietario"), key, allocation.amount)

        month_rows.append({"month": month_start.isoformat()[:7], "income_due": income_due, "expense_due": expense_due, "net_due": income_due - expense_due})

    owner_output = []
    for row in owner_rows.values():
        row["net_due"] = row["income_due"] - row["expense_due"]
        owner_output.append(row)

    return {"months": month_rows, "owners": owner_output}
