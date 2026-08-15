import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { Table, TableActions, Td, Th } from "@shared/components/ui/table";
import { api, Contract } from "@shared/lib/api";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { eur, formatDate } from "@shared/lib/utils";
import { contractSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { ContractDetail } from "../components/ContractDetail";
import { ContractFormValues } from "../types/contractTypes";
import { isExpiredOnlyTenant } from "@features/tenants/utils/tenantUtils";

const contractValues = (contract?: Contract): ContractFormValues => ({
  unit_id: contract?.unit_id ?? "",
  tenant_id: contract?.tenant_id ?? "",
  starts_on: contract?.starts_on ?? new Date().toISOString().slice(0, 10),
  ends_on: contract?.ends_on ?? "",
  monthly_rent: Number(contract?.monthly_rent ?? 0),
  deposit: Number(contract?.deposit ?? 0),
  due_day: contract?.due_day ?? 5,
  istat_adjustment: contract?.istat_adjustment ?? false,
});

export function Contracts({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selected = data.contracts.find(
    (contract) => contract.id === selectedId,
  );
  const today = new Date().toISOString().slice(0, 10);
  const tenantOptions = data.tenants.filter(
    (tenant) =>
      tenant.id === selected?.tenant_id ||
      !isExpiredOnlyTenant(tenant.id, data.contracts, today),
  );
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contractValues(selected),
  });

  useEffect(() => {
    form.reset(contractValues(selected));
  }, [selectedId, selected?.id]);

  async function save(values: ContractFormValues, id?: string) {
    const token = getToken ? await getToken() : null;
    const body = JSON.stringify({ ...values, ends_on: values.ends_on || null });
    const saved = await api<Contract>(
      id ? `/contracts/${id}` : "/contracts",
      token,
      { method: id ? "PUT" : "POST", body },
    );
    setSelectedId(saved.id);
    setEditMode(false);
    await reload();
  }

  async function remove() {
    if (!selected) return;
    await removeById(selected.id);
    setSelectedId(undefined);
  }

  async function removeById(id: string) {
    const token = getToken ? await getToken() : null;
    await api(`/contracts/${id}`, token, { method: "DELETE" });
    await reload();
  }

  if (selected && !editMode) {
    return (
      <ContractDetail
        data={data}
        contract={selected}
        onBack={() => setSelectedId(undefined)}
        onEdit={() => setEditMode(true)}
      />
    );
  }

  if (selectedId !== undefined) {
    return (
      <EntityForm
        title={selected ? "Dettaglio contratto" : "Nuovo contratto"}
        isEditing={Boolean(selected)}
        onBack={() => {
          setSelectedId(undefined);
          setEditMode(false);
        }}
        onDelete={remove}
        onSubmit={form.handleSubmit(
          (values) => save(values, selected?.id),
          notifyInvalidSubmit,
        )}
        isDirty={form.formState.isDirty}
      >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Unità" error={form.formState.errors.unit_id?.message}>
                <Select {...form.register("unit_id")}>
                  <option value="">Seleziona</option>
                  {data.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Inquilino" error={form.formState.errors.tenant_id?.message}>
                <Select {...form.register("tenant_id")}>
                  <option value="">Seleziona</option>
                  {tenantOptions.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Inizio" error={form.formState.errors.starts_on?.message}>
                <Input type="date" {...form.register("starts_on")} />
              </Field>
              <Field label="Fine" error={form.formState.errors.ends_on?.message}>
                <Input type="date" {...form.register("ends_on")} />
              </Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
              <Field label="Canone" error={form.formState.errors.monthly_rent?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("monthly_rent")}
                />
              </Field>
              <Field label="Deposito" error={form.formState.errors.deposit?.message}>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("deposit")}
                />
              </Field>
              <Field label="Giorno scadenza" error={form.formState.errors.due_day?.message}>
                <Input
                  type="number"
                  min="1"
                  max="28"
                  {...form.register("due_day")}
                />
              </Field>
            </div>
      </EntityForm>
    );
  }

  const filteredContracts = data.contracts.filter((contract) => {
    const unit = data.units.find((item) => item.id === contract.unit_id);
    const active = !contract.ends_on || contract.ends_on >= today;
    const text = `${contract.tenant_name} ${unit?.name ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (statusFilter === "all" || (statusFilter === "active" ? active : !active))
    );
  });

  return (
    <SectionPanel
      title="Contratti"
      surface="plain"
      actions={
        <Button
          onClick={() => {
            setSelectedId(null);
            setEditMode(true);
          }}
        >
          <Plus size={16} /> Contratto
        </Button>
      }
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Contratti" value={filteredContracts.length} />
          <Stat
            label="Attivi"
            value={
              filteredContracts.filter(
                (contract) => !contract.ends_on || contract.ends_on >= today,
              ).length
            }
            tone="good"
          />
          <Stat
            label="Canoni mensili"
            value={eur.format(
              filteredContracts.reduce(
                (sum, contract) => sum + Number(contract.monthly_rent),
                0,
              ),
            )}
          />
        </div>
      }
      filters={
        <ListFilters
          search={search}
          onSearch={setSearch}
          filters={[
            {
              label: "Stato contratto",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "active", label: "Attivi" },
                { value: "ended", label: "Terminati" },
              ],
            },
          ]}
        />
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Inquilino</Th>
            <Th>Unità</Th>
            <Th>Canone</Th>
            <Th>Periodo</Th>
            <Th className="text-right">Azioni</Th>
          </tr>
        </thead>
        <tbody>
          {filteredContracts.map((contract) => {
            const unit = data.units.find(
              (item) => item.id === contract.unit_id,
            );
            return (
              <tr
                key={contract.id}
                className="group cursor-pointer hover:bg-stone-50"
                onClick={() => {
                  setSelectedId(contract.id);
                  setEditMode(false);
                }}
              >
                <Td>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 font-semibold text-stone-700">
                      {contract.tenant_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {contract.tenant_name}
                      </p>
                      <p className="truncate text-sm text-stone-500">
                        {unit?.name ?? "Unità non assegnata"}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>{unit?.name}</Td>
                <Td>{eur.format(Number(contract.monthly_rent))}</Td>
                <Td>
                  {formatDate(contract.starts_on)} ·{" "}
                  {contract.ends_on ? formatDate(contract.ends_on) : "aperto"}
                </Td>
                <TableActions
                  label={`Azioni per ${contract.tenant_name}`}
                  onEdit={() => {
                    setSelectedId(contract.id);
                    setEditMode(true);
                  }}
                  onDelete={() => removeById(contract.id)}
                />
              </tr>
            );
          })}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
