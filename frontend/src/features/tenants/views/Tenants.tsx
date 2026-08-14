import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { eur } from "@shared/lib/utils";
import { tenantSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { TenantFormValues } from "../types/tenantTypes";

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
  const selected = data.tenants.find((tenant) => tenant.id === selectedId);
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
          .reduce((sum, movement) => sum + Number(movement.amount), 0);
        const arrears = movements
          .filter(
            (movement) =>
              movement.type === "income" && movement.status === "unpaid",
          )
          .reduce((sum, movement) => sum + Number(movement.amount), 0);
        const monthlyRent = contracts.reduce(
          (sum, contract) => sum + Number(contract.monthly_rent),
          0,
        );
        return { tenant, contracts, due, paid, arrears, monthlyRent };
      }),
    [data.contracts, data.movements, data.tenants],
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
    const token = getToken ? await getToken() : null;
    await api(`/tenants/${selected.id}`, token, { method: "DELETE" });
    setSelectedId(undefined);
    await reload();
  }

  if (selected && !editMode) {
    const row = rows.find((item) => item.tenant.id === selected.id);
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>
              <UserRound className="mr-2 inline" size={18} />
              {selected.full_name}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedId(undefined)}
              >
                <ArrowLeft size={16} /> Indietro
              </Button>
              <Button onClick={() => setEditMode(true)}>
                <Pencil size={16} /> Modifica
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <Stat
                label="Canone mensile"
                value={eur.format(row?.monthlyRent ?? 0)}
              />
              <Stat label="Dovuto" value={eur.format(row?.due ?? 0)} />
              <Stat label="Pagato" value={eur.format(row?.paid ?? 0)} />
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
                        {contract.starts_on} · {contract.ends_on ?? "aperto"}
                      </Td>
                      <Td>{eur.format(Number(contract.monthly_rent))}</Td>
                      <Td>{eur.format(Number(contract.deposit))}</Td>
                      <Td>
                        <Badge>
                          {contract.ends_on ? "con scadenza" : "attivo"}
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
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            {selected ? "Dettaglio inquilino" : "Nuovo inquilino"}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedId(undefined);
              setEditMode(false);
            }}
          >
            <ArrowLeft size={16} /> Indietro
          </Button>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-2xl space-y-3"
            onSubmit={form.handleSubmit((values) => save(values, selected?.id))}
          >
            <Field label="Nome completo">
              <Input {...form.register("full_name")} />
            </Field>
            <Field label="Codice fiscale / P.IVA">
              <Input {...form.register("tax_code")} />
            </Field>
            <Field label="Contatti">
              <Input {...form.register("contacts")} />
            </Field>
            <Field label="Note">
              <Input {...form.register("notes")} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button>
                <Plus size={16} /> Salva
              </Button>
              {selected ? (
                <Button type="button" variant="outline" onClick={remove}>
                  <Trash2 size={16} /> Elimina
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  const filteredRows = rows.filter((row) => {
    const text =
      `${row.tenant.full_name} ${row.tenant.tax_code ?? ""} ${row.tenant.contacts ?? ""}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (arrearsFilter === "all" ||
        (arrearsFilter === "arrears" ? row.arrears > 0 : row.arrears === 0))
    );
  });

  return (
    <SectionPanel
      title="Inquilini"
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
              label: "Morosità",
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
              <TableActions label={`Azioni per ${row.tenant.full_name}`} />
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
