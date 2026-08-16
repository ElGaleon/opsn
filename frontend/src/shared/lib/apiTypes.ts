export type Owner = {
  id: string;
  first_name: string;
  last_name: string;
  tax_code?: string | null;
  contacts?: string | null;
};

export type Tenant = {
  id: string;
  full_name: string;
  tax_code?: string | null;
  contacts?: string | null;
  notes?: string | null;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  street?: string | null;
  street_number?: string | null;
  city?: string | null;
  postal_code?: string | null;
  province?: string | null;
  region?: string | null;
  country?: string | null;
  purchase_value: string;
  mortgage: string;
  condo_fees: string;
  notes?: string | null;
};

export type Unit = {
  id: string;
  property_id: string;
  name: string;
  unit_type: string;
  notes?: string | null;
};

export type Share = {
  id: string;
  owner_id: string;
  property_id?: string | null;
  unit_id?: string | null;
  percentage: string;
  valid_from: string;
  valid_to?: string | null;
};

export type Contract = {
  id: string;
  unit_id: string;
  tenant_id: string;
  tenant_name: string;
  starts_on: string;
  ends_on?: string | null;
  monthly_rent: string;
  deposit: string;
  due_day: number;
  istat_adjustment: boolean;
};

export type Allocation = {
  id: string;
  owner_id: string;
  percentage: string;
  amount: string;
};

export type Movement = {
  id: string;
  property_id?: string | null;
  unit_id?: string | null;
  contract_id?: string | null;
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  amount: string;
  accrual_date: string;
  due_date?: string | null;
  payment_date?: string | null;
  status: "paid" | "partial" | "unpaid";
  allocation_mode: "ownership" | "owner" | "custom";
  paid_by_owner_id?: string | null;
  transfer_to_owner_id?: string | null;
  payment_method?: string | null;
  paid_amount?: string | null;
  allocations: Allocation[];
};

export type OwnerTransfer = {
  id: string;
  from_owner_id: string;
  to_owner_id: string;
  amount: string;
  transfer_date: string;
  method?: string | null;
  notes?: string | null;
};

export type Summary = {
  income_accrual: string;
  expense_accrual: string;
  net_accrual: string;
  income_cash: string;
  expense_cash: string;
  cashflow: string;
  arrears: string;
  property_count: number;
  unit_count: number;
  contract_count: number;
};

export type OwnerReport = {
  owner_id: string;
  owner: string;
  income: string;
  expenses: string;
  net: string;
  paid_directly: string;
  owner_balance: string;
};

export type Forecast = {
  months: {
    month: string;
    income_due: string;
    expense_due: string;
    net_due: string;
  }[];
  owners: {
    owner_id: string;
    owner: string;
    income_due: string;
    expense_due: string;
    net_due: string;
  }[];
};
