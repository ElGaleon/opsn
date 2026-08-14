from datetime import date
from decimal import Decimal
from enum import Enum
from uuid import uuid4

from sqlalchemy import CheckConstraint, Date, Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


def new_id() -> str:
    return str(uuid4())


class UnitType(str, Enum):
    apartment = "apartment"
    garage = "garage"
    room = "room"
    commercial = "commercial"
    other = "other"


class MovementType(str, Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"


class MovementStatus(str, Enum):
    paid = "paid"
    partial = "partial"
    unpaid = "unpaid"


class AllocationMode(str, Enum):
    ownership = "ownership"
    owner = "owner"
    custom = "custom"


class Owner(Base):
    __tablename__ = "owners"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    first_name: Mapped[str] = mapped_column(String(120))
    last_name: Mapped[str] = mapped_column(String(120))
    tax_code: Mapped[str | None] = mapped_column(String(32))
    contacts: Mapped[str | None] = mapped_column(Text)

    shares: Mapped[list["OwnershipShare"]] = relationship(back_populates="owner")
    allocations: Mapped[list["MovementAllocation"]] = relationship(back_populates="owner")


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(180))
    tax_code: Mapped[str | None] = mapped_column(String(32))
    contacts: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)

    contracts: Mapped[list["LeaseContract"]] = relationship(back_populates="tenant")


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(160))
    address: Mapped[str] = mapped_column(String(240))
    street: Mapped[str | None] = mapped_column(String(160))
    street_number: Mapped[str | None] = mapped_column(String(32))
    city: Mapped[str | None] = mapped_column(String(120))
    postal_code: Mapped[str | None] = mapped_column(String(16))
    province: Mapped[str | None] = mapped_column(String(80))
    region: Mapped[str | None] = mapped_column(String(120))
    country: Mapped[str | None] = mapped_column(String(80), default="Italia")
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    purchase_value: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    mortgage: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    condo_fees: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text)

    units: Mapped[list["Unit"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    shares: Mapped[list["OwnershipShare"]] = relationship(back_populates="property")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(160))
    unit_type: Mapped[UnitType] = mapped_column(SAEnum(UnitType), default=UnitType.apartment)
    notes: Mapped[str | None] = mapped_column(Text)

    property: Mapped[Property] = relationship(back_populates="units")
    shares: Mapped[list["OwnershipShare"]] = relationship(back_populates="unit")
    contracts: Mapped[list["LeaseContract"]] = relationship(back_populates="unit")


class OwnershipShare(Base):
    __tablename__ = "ownership_shares"
    __table_args__ = (
        CheckConstraint("(property_id IS NOT NULL) <> (unit_id IS NOT NULL)", name="one_owned_target"),
        CheckConstraint("percentage > 0 AND percentage <= 100", name="valid_percentage"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(ForeignKey("owners.id", ondelete="CASCADE"))
    property_id: Mapped[str | None] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"))
    unit_id: Mapped[str | None] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    valid_from: Mapped[date] = mapped_column(Date)
    valid_to: Mapped[date | None] = mapped_column(Date)

    owner: Mapped[Owner] = relationship(back_populates="shares")
    property: Mapped[Property | None] = relationship(back_populates="shares")
    unit: Mapped[Unit | None] = relationship(back_populates="shares")


class LeaseContract(Base):
    __tablename__ = "lease_contracts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id", ondelete="RESTRICT"))
    starts_on: Mapped[date] = mapped_column(Date)
    ends_on: Mapped[date | None] = mapped_column(Date)
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    deposit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    due_day: Mapped[int] = mapped_column(default=5)
    istat_adjustment: Mapped[bool] = mapped_column(default=False)

    unit: Mapped[Unit] = relationship(back_populates="contracts")
    tenant: Mapped[Tenant] = relationship(back_populates="contracts")

    @property
    def tenant_name(self) -> str:
        return self.tenant.full_name if self.tenant else ""


class Movement(Base):
    __tablename__ = "movements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    property_id: Mapped[str | None] = mapped_column(ForeignKey("properties.id", ondelete="SET NULL"))
    unit_id: Mapped[str | None] = mapped_column(ForeignKey("units.id", ondelete="SET NULL"))
    contract_id: Mapped[str | None] = mapped_column(ForeignKey("lease_contracts.id", ondelete="SET NULL"))
    type: Mapped[MovementType] = mapped_column(SAEnum(MovementType))
    category: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(240))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    accrual_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date | None] = mapped_column(Date)
    payment_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[MovementStatus] = mapped_column(SAEnum(MovementStatus), default=MovementStatus.unpaid)
    allocation_mode: Mapped[AllocationMode] = mapped_column(SAEnum(AllocationMode), default=AllocationMode.ownership)
    paid_by_owner_id: Mapped[str | None] = mapped_column(ForeignKey("owners.id", ondelete="SET NULL"))
    transfer_to_owner_id: Mapped[str | None] = mapped_column(ForeignKey("owners.id", ondelete="SET NULL"))
    payment_method: Mapped[str | None] = mapped_column(String(40))

    allocations: Mapped[list["MovementAllocation"]] = relationship(
        back_populates="movement", cascade="all, delete-orphan"
    )


class MovementAllocation(Base):
    __tablename__ = "movement_allocations"
    __table_args__ = (CheckConstraint("percentage > 0 AND percentage <= 100", name="valid_allocation"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    movement_id: Mapped[str] = mapped_column(ForeignKey("movements.id", ondelete="CASCADE"))
    owner_id: Mapped[str] = mapped_column(ForeignKey("owners.id", ondelete="CASCADE"))
    percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    movement: Mapped[Movement] = relationship(back_populates="allocations")
    owner: Mapped[Owner] = relationship(back_populates="allocations")


class OwnerTransfer(Base):
    __tablename__ = "owner_transfers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    from_owner_id: Mapped[str] = mapped_column(ForeignKey("owners.id", ondelete="CASCADE"))
    to_owner_id: Mapped[str] = mapped_column(ForeignKey("owners.id", ondelete="CASCADE"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    transfer_date: Mapped[date] = mapped_column(Date)
    method: Mapped[str | None] = mapped_column(String(40))
    notes: Mapped[str | None] = mapped_column(Text)


class Deadline(Base):
    __tablename__ = "deadlines"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    title: Mapped[str] = mapped_column(String(180))
    due_date: Mapped[date] = mapped_column(Date)
    property_id: Mapped[str | None] = mapped_column(ForeignKey("properties.id", ondelete="SET NULL"))
    unit_id: Mapped[str | None] = mapped_column(ForeignKey("units.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(24), default="open")
