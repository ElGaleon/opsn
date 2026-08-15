import {
  Contract,
  Forecast,
  Movement,
  Owner,
  OwnerReport,
  Property,
  Share,
  Summary,
  Tenant,
  Unit,
} from "@shared/lib/api";

export type Section =
  | "dashboard"
  | "properties"
  | "owners"
  | "contracts"
  | "tenants"
  | "movements";

export type Data = {
  owners: Owner[];
  tenants: Tenant[];
  properties: Property[];
  units: Unit[];
  shares: Share[];
  contracts: Contract[];
  movements: Movement[];
  summary: Summary | null;
  ownerReports: OwnerReport[];
  forecast: Forecast | null;
};

export const emptyData: Data = {
  owners: [],
  tenants: [],
  properties: [],
  units: [],
  shares: [],
  contracts: [],
  movements: [],
  summary: null,
  ownerReports: [],
  forecast: null,
};
