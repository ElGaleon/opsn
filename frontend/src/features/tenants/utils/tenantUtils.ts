import { Contract } from "@shared/lib/api";

export function isContractActive(contract: Contract, today: string) {
  return !contract.ends_on || contract.ends_on >= today;
}

export function isExpiredOnlyTenant(
  tenantId: string,
  contracts: Contract[],
  today: string,
) {
  const tenantContracts = contracts.filter(
    (contract) => contract.tenant_id === tenantId,
  );
  return (
    tenantContracts.length > 0 &&
    tenantContracts.every((contract) => !isContractActive(contract, today))
  );
}
