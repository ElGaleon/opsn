import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DetailHeader } from "@shared/components/DetailHeader";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";
import { Table, TableActions, Td, Th } from "@shared/components/ui/table";
import { api, Tenant } from "@shared/lib/api";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { eur, formatDate } from "@shared/lib/utils";
import { tenantSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { TenantFormValues } from "../types/tenantTypes";
import { isContractActive, isExpiredOnlyTenant } from "../utils/tenantUtils";

const tenantValues = (tenant?: Tenant): TenantFormValues => ({
  full_name: tenant?.full_name ?? "",
  tax_code: tenant?.tax_code ?? "",
  contacts: tenant?.contacts ?? "",
  notes: tenant?.notes ?? "",
});

export function Tenants({
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
  const [arrearsFilter, setArrearsFilter] = useState("all");
  const [tenantStatusFilter, setTenantStatusFilter] = useState("active");
  const selected = data.tenants.find((tenant) => tenant.id === selectedId);
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenantValues(selected),
  });

  const rows = useMemo(
    () =>
      data.tenants.map((tenant) => {
        const contracts = data.contracts.filter(
          (contract) => contract.tenant_id === tenant.id,
        );
        const contractIds = new Set(contracts.map((contract) => contract.id));
        const movements = data.movements.filter(
          (movement) =>
            movement.contract_id && contractIds.has(movement.contract_id),
        );
        const due = movements
          .filter((movement) => movement.type === "income")
          .reduce((sum, movement) => sum + Number(movement.amount), 0);
        const paid = movements
          .filter(
            (movement) =>
              movement.type === "income" && movement.status !== "unpaid",
          )
          .reduce(
            (sum, movement) =>
              sum + Number(movement.paid_amount ?? movement.amount),
            0,
          );
        const arrears = movements
          .filter(
            (movement) =>
              movement.type === "income" && movement.status !== "paid",
          )
          .reduce(
            (sum, movement) =>
              sum +
              (movement.status === "partial"
                ? Number(movement.amount) - Number(movement.paid_amount ?? 0)
                : Number(movement.amount)),
            0,
          );
        const monthlyRent = contracts.reduce(
          (sum, contract) => sum + Number(contract.monthly_rent),
          0,
        );
        const expiredOnly = isExpiredOnlyTenant(
          tenant.id,
          data.contracts,
          today,
        );
        return {
          tenant,
          contracts,
          due,
          paid,
          arrears,
          monthlyRent,
          expiredOnly,
        };
      }),
    [data.contracts, data.movements, data.tenants, today],
  );

  useEffect(() => {
    form.reset(tenantValues(selected));
  }, [selectedId, selected?.id]);

  async function save(values: TenantFormValues, id?: string) {
    const token = getToken ? await getToken() : null;
    const body = JSON.stringify({
      ...values,
      tax_code: values.tax_code || null,
      contacts: values.contacts || null,
      notes: values.notes || null,
    });
    const saved = await api<Tenant>(id ? `/tenants/${id}` : "/tenants", token, {
      method: id ? "PUT" : "POST",
      body,
    });
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
    await api(`/tenants/${id}`, token, { method: "DELETE" });
    await reload();
  }

  if (selected && !editMode) {
    const row = rows.find((item) => item.tenant.id === selected.id);
    return (
      <div className="space-y-4">
        <Card>
          <DetailHeader
            eyebrow="Dettaglio inquilino"
            title={selected.full_name}
            subtitle={selected.contacts ?? ""}
            onBack={() => setSelectedId(undefined)}
            onEdit={() => setEditMode(true)}
          />
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <Stat
                label="Canone mensile"
                value={eur.format(row?.monthlyRent ?? 0)}
              />
              <Stat label="Dovuto" value={eur.format(row?.due ?? 0)} />
              <Stat label="Totale versato" value={eur.format(row?.paid ?? 0)} />
              <Stat
                label="Morosità"
                value={eur.format(row?.arrears ?? 0)}
                tone={(row?.arrears ?? 0) > 0 ? "bad" : "good"}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contratti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Unità</Th>
                  <Th>Periodo</Th>
                  <Th>Canone</Th>
                  <Th>Deposito</Th>
                  <Th>Stato</Th>
                </tr>
              </thead>
              <tbody>
                {row?.contracts.map((contract) => {
                  const unit = data.units.find(
                    (item) => item.id === contract.unit_id,
                  );
                  return (
                    <tr key={contract.id}>
                      <Td>{unit?.name}</Td>
                      <Td>
                        {formatDate(contract.starts_on)} ·{" "}
                        {contract.ends_on
                          ? formatDate(contract.ends_on)
                          : "aperto"}
                      </Td>
                      <Td>{eur.format(Number(contract.monthly_rent))}</Td>
                      <Td>{eur.format(Number(contract.deposit))}</Td>
                      <Td>
                        <Badge>
                          {isContractActive(contract, today)
                            ? "attivo"
                            : "scaduto"}
                        </Badge>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedId !== undefined) {
    return (
      <EntityForm
        title={selected ? "Dettaglio inquilino" : "Nuovo inquilino"}
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
              <Field label="Nome completo" error={form.formState.errors.full_name?.message}>
                <Input {...form.register("full_name")} />
              </Field>
              <Field label="Codice fiscale / P.IVA" error={form.formState.errors.tax_code?.message}>
                <Input {...form.register("tax_code")} />
              </Field>
            </div>
            <Field label="Contatti" error={form.formState.errors.contacts?.message}>
              <Input {...form.register("contacts")} />
            </Field>
            <Field label="Note" error={form.formState.errors.notes?.message}>
              <Input {...form.register("notes")} />
            </Field>
      </EntityForm>
    );
  }

  const filteredRows = rows.filter((row) => {
    const text =
      `${row.tenant.full_name} ${row.tenant.tax_code ?? ""} ${row.tenant.contacts ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (tenantStatusFilter === "all" ||
        (tenantStatusFilter === "expired"
          ? row.expiredOnly
          : !row.expiredOnly)) &&
      (arrearsFilter === "all" ||
        (arrearsFilter === "arrears" ? row.arrears > 0 : row.arrears === 0))
    );
  });

  return (
    <SectionPanel
      title="Inquilini"
      surface="plain"
      actions={
        <Button
          onClick={() => {
            setSelectedId(null);
            setEditMode(true);
          }}
        >
          <Plus size={16} /> Inquilino
        </Button>
      }
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Inquilini" value={filteredRows.length} />
          <Stat
            label="Canoni mensili"
            value={eur.format(
              filteredRows.reduce((sum, row) => sum + row.monthlyRent, 0),
            )}
          />
          <Stat
            label="Morosità"
            value={eur.format(
              filteredRows.reduce((sum, row) => sum + row.arrears, 0),
            )}
            tone={filteredRows.some((row) => row.arrears > 0) ? "bad" : "good"}
          />
        </div>
      }
      filters={
        <ListFilters
          search={search}
          onSearch={setSearch}
          filters={[
            {
              label: "Stato inquilino",
              value: tenantStatusFilter,
              onChange: setTenantStatusFilter,
              options: [
                { value: "active", label: "Attivi" },
                { value: "all", label: "Tutti" },
                { value: "expired", label: "Scaduti" },
              ],
            },
            {
              label: "Filtro morosità",
              value: arrearsFilter,
              onChange: setArrearsFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "arrears", label: "Con morosità" },
                { value: "clean", label: "Senza morosità" },
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
            <Th>Contratti</Th>
            <Th>Canone mensile</Th>
            <Th>Dovuto</Th>
            <Th>Morosità</Th>
            <Th className="text-right">Azioni</Th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr
              key={row.tenant.id}
              className="group cursor-pointer hover:bg-stone-50"
              onClick={() => setSelectedId(row.tenant.id)}
            >
              <Td>
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 font-semibold text-stone-700">
                    {row.tenant.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {row.tenant.full_name}
                    </p>
                    <p className="truncate text-sm text-stone-500">
                      {row.tenant.contacts ?? "Nessun contatto"}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>{row.contracts.length}</Td>
              <Td>{eur.format(row.monthlyRent)}</Td>
              <Td>{eur.format(row.due)}</Td>
              <Td
                className={
                  row.arrears > 0 ? "text-red-700" : "text-emerald-700"
                }
              >
                {eur.format(row.arrears)}
              </Td>
              <TableActions
                label={`Azioni per ${row.tenant.full_name}`}
                onEdit={() => {
                  setSelectedId(row.tenant.id);
                  setEditMode(true);
                }}
                onDelete={() => removeById(row.tenant.id)}
              />
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
