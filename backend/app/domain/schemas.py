from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class OwnerIn(BaseModel):
    first_name: str
    last_name: str
    tax_code: str | None = None
    contacts: str | None = None


class OwnerOut(OwnerIn):
    id: str

    class Config:
        from_attributes = True


class TenantIn(BaseModel):
    full_name: str
    tax_code: str | None = None
    contacts: str | None = None
    notes: str | None = None


class TenantOut(TenantIn):
    id: str

    class Config:
        from_attributes = True


class PropertyIn(BaseModel):
    name: str
    address: str
    street: str | None = None
    street_number: str | None = None
    city: str | None = None
    postal_code: str | None = None
    province: str | None = None
    region: str | None = None
    country: str | None = "Italia"
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    purchase_value: Decimal = 0
    mortgage: Decimal = 0
    condo_fees: Decimal = 0
    notes: str | None = None


class PropertyOut(PropertyIn):
    id: str

    class Config:
        from_attributes = True


class UnitIn(BaseModel):
    property_id: str
    name: str
    unit_type: str = "apartment"
    notes: str | None = None


class UnitOut(UnitIn):
    id: str

    class Config:
        from_attributes = True


class OwnershipShareIn(BaseModel):
    owner_id: str
    property_id: str | None = None
    unit_id: str | None = None
    percentage: Decimal = Field(gt=0, le=100)
    valid_from: date
    valid_to: date | None = None


class OwnershipShareSetItem(BaseModel):
    owner_id: str
    percentage: Decimal = Field(gt=0, le=100)


class OwnershipShareSetIn(BaseModel):
    property_id: str | None = None
    unit_id: str | None = None
    valid_from: date
    valid_to: date | None = None
    shares: list[OwnershipShareSetItem]


class OwnershipShareOut(OwnershipShareIn):
    id: str

    class Config:
        from_attributes = True


class ContractIn(BaseModel):
    unit_id: str
    tenant_id: str
    starts_on: date
    ends_on: date | None = None
    monthly_rent: Decimal
    deposit: Decimal = 0
    due_day: int = Field(default=5, ge=1, le=28)
    istat_adjustment: bool = False


class ContractOut(ContractIn):
    id: str
    tenant_name: str

    class Config:
        from_attributes = True


class AllocationIn(BaseModel):
    owner_id: str
    percentage: Decimal = Field(gt=0, le=100)


class MovementIn(BaseModel):
    property_id: str | None = None
    unit_id: str | None = None
    contract_id: str | None = None
    type: str
    category: str
    description: str
    amount: Decimal = Field(gt=0)
    accrual_date: date
    due_date: date | None = None
    payment_date: date | None = None
    status: str = "unpaid"
    allocation_mode: str = "ownership"
    paid_by_owner_id: str | None = None
    transfer_to_owner_id: str | None = None
    payment_method: str | None = None
    paid_amount: Decimal | None = None
    allocations: list[AllocationIn] = []


class MovementAllocationOut(BaseModel):
    id: str
    owner_id: str
    percentage: Decimal
    amount: Decimal

    class Config:
        from_attributes = True


class MovementOut(MovementIn):
    id: str
    allocations: list[MovementAllocationOut]

    class Config:
        from_attributes = True


class DeadlineIn(BaseModel):
    title: str
    due_date: date
    property_id: str | None = None
    unit_id: str | None = None
    status: str = "open"


class DeadlineOut(DeadlineIn):
    id: str

    class Config:
        from_attributes = True


class OwnerTransferIn(BaseModel):
    from_owner_id: str
    to_owner_id: str
    amount: Decimal = Field(gt=0)
    transfer_date: date
    method: str | None = None
    notes: str | None = None


class OwnerTransferOut(OwnerTransferIn):
    id: str

    class Config:
        from_attributes = True
