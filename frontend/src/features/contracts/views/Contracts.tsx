import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { Select } from "@shared/components/ui/select";
import { Table, TableActions, Td, Th } from "@shared/components/ui/table";
import { api, Contract } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { contractSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import { ContractFormValues } from "../types/contractTypes";

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
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contractValues(selected),
  });

  useEffect(() => {
    form.reset(contractValues(selected));
  }, [selectedId, selected?.id]);

  async function save(values: ContractFormValues, id?: string) {
    if (!values.tenant_id) return;
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
    const token = getToken ? await getToken() : null;
    await api(`/contracts/${selected.id}`, token, { method: "DELETE" });
    setSelectedId(undefined);
    await reload();
  }

  if (selected && !editMode) {
    const unit = data.units.find((item) => item.id === selected.unit_id);
    const property = data.properties.find(
      (item) => item.id === unit?.property_id,
    );
    const movements = data.movements.filter(
      (movement) => movement.contract_id === selected.id,
    );
    const payments = movements
      .filter((movement) => movement.type === "income")
      .sort((a, b) =>
        (b.payment_date ?? b.due_date ?? b.accrual_date).localeCompare(
          a.payment_date ?? a.due_date ?? a.accrual_date,
        ),
      );
    const deadlines = data.deadlines
      .filter(
        (deadline) =>
          deadline.unit_id === selected.unit_id ||
          deadline.property_id === unit?.property_id,
      )
      .slice(0, 3);
    const due = payments.reduce(
      (sum, movement) => sum + Number(movement.amount),
      0,
    );
    const paid = payments
      .filter((movement) => movement.status !== "unpaid")
      .reduce(
        (sum, movement) =>
          sum + Number(movement.paid_amount ?? movement.amount),
        0,
      );
    const arrears = payments
      .filter((movement) => movement.status === "unpaid")
      .reduce((sum, movement) => sum + Number(movement.amount), 0);
    const active =
      !selected.ends_on ||
      selected.ends_on >= new Date().toISOString().slice(0, 10);
    return (
      <div className="min-w-0 rounded-2xl border border-emerald-950/10 bg-white/95 p-4 shadow-sm shadow-emerald-950/5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-stone-950">
              Dettaglio contratto
            </h2>
            <div className="mt-6 flex min-w-0 items-center gap-4 sm:mt-8">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800 sm:h-16 sm:w-16">
                {selected.tenant_name.slice(0, 1).toUpperCase()}
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${active ? "bg-emerald-500" : "bg-stone-300"}`}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-stone-950">
                  {selected.tenant_name}
                </p>
                <p className="break-words text-sm text-stone-500">
                  {unit?.name ?? "Unità non assegnata"}
                  {property ? ` · ${property.name}` : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:items-end">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 lg:justify-end">
              <span className="shrink-0 text-sm text-stone-600">
                Rent Details :
              </span>
              <span className="min-w-0 break-words text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
                {eur.format(Number(selected.monthly_rent))}/mese
              </span>
              <StatusBadge status={arrears > 0 ? "unpaid" : "paid"} />
            </div>
            <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-5">
            <DetailSection title="Personal Details">
              <DetailGrid
                rows={[
                  ["Inquilino", selected.tenant_name],
                  ["Immobile", property?.name ?? "—"],
                  ["Unità", unit?.name ?? "—"],
                  ["Indirizzo", property?.address ?? "—"],
                  ["Tipo unità", unit?.unit_type ?? "—"],
                  ["Stato contratto", active ? "Attivo" : "Terminato"],
                ]}
              />
            </DetailSection>

            <DetailSection title="Lease Agreement">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_1fr]">
                <DetailGrid
                  rows={[
                    ["Start Date", selected.starts_on],
                    ["End Date", selected.ends_on ?? "Aperto"],
                    ["Payment terms", `Mensile, giorno ${selected.due_day}`],
                  ]}
                />
                <div className="min-w-0">
                  <p className="mb-3 text-sm text-stone-600">
                    Lease document :
                  </p>
                  <div className="flex min-w-0 items-center gap-3 rounded-lg border border-emerald-950/10 bg-white p-3">
                    <div className="shrink-0 rounded-md bg-red-50 p-2 text-red-600">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        Contratto_{selected.tenant_name.replace(/\s+/g, "_")}
                        .pdf
                      </p>
                      <p className="text-xs text-stone-500">
                        Deposito {eur.format(Number(selected.deposit))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Additional Details">
              <DetailGrid
                rows={[
                  ["Canone mensile", eur.format(Number(selected.monthly_rent))],
                  ["Deposito", eur.format(Number(selected.deposit))],
                  ["Dovuto totale", eur.format(due)],
                  ["Incassato", eur.format(paid)],
                  ["Morosità", eur.format(arrears)],
                  [
                    "Adeguamento ISTAT",
                    selected.istat_adjustment ? "Sì" : "No",
                  ],
                ]}
              />
            </DetailSection>
          </div>

          <div className="space-y-5">
            <DetailSection title="Scadenze collegate" action="View All">
              <Table className="min-w-[520px]">
                <thead>
                  <tr>
                    <Th>Data</Th>
                    <Th>Descrizione</Th>
                    <Th>Stato</Th>
                    <Th>Azione</Th>
                  </tr>
                </thead>
                <tbody>
                  {deadlines.map((deadline) => (
                    <tr key={deadline.id}>
                      <Td>{deadline.due_date}</Td>
                      <Td className="max-w-[220px] break-words">
                        {deadline.title}
                      </Td>
                      <Td>
                        <StatusBadge status={deadline.status} />
                      </Td>
                      <Td>
                        <MessageSquare
                          size={17}
                          className="inline text-stone-500"
                        />{" "}
                        <ArrowRight
                          size={17}
                          className="ml-2 inline text-stone-500"
                        />
                      </Td>
                    </tr>
                  ))}
                  {!deadlines.length ? (
                    <tr>
                      <Td colSpan={4}>Nessuna scadenza collegata.</Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </DetailSection>

            <DetailSection title="Payment History" action="View All">
              <Table className="min-w-[500px]">
                <thead>
                  <tr>
                    <Th>Data</Th>
                    <Th>Importo</Th>
                    <Th>Metodo</Th>
                    <Th>Stato</Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((movement) => (
                    <tr key={movement.id}>
                      <Td>
                        {movement.payment_date ??
                          movement.due_date ??
                          movement.accrual_date}
                      </Td>
                      <Td>
                        {eur.format(
                          Number(movement.paid_amount ?? movement.amount),
                        )}
                      </Td>
                      <Td>{movement.payment_method ?? "—"}</Td>
                      <Td>
                        <StatusBadge status={movement.status} />
                      </Td>
                    </tr>
                  ))}
                  {!payments.length ? (
                    <tr>
                      <Td colSpan={4}>Nessun pagamento registrato.</Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </DetailSection>
          </div>
        </div>
      </div>
    );
  }

  if (selectedId !== undefined) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            {selected ? "Dettaglio contratto" : "Nuovo contratto"}
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
            <Field label="Unità">
              <Select {...form.register("unit_id")}>
                {data.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Inquilino">
              <Select {...form.register("tenant_id")}>
                <option value="">Seleziona</option>
                {data.tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Inizio">
                <Input type="date" {...form.register("starts_on")} />
              </Field>
              <Field label="Fine">
                <Input type="date" {...form.register("ends_on")} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Canone">
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("monthly_rent")}
                />
              </Field>
              <Field label="Deposito">
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("deposit")}
                />
              </Field>
            </div>
            <Field label="Giorno scadenza">
              <Input
                type="number"
                min="1"
                max="28"
                {...form.register("due_day")}
              />
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

  const today = new Date().toISOString().slice(0, 10);
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
              label: "Stato",
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
                  {contract.starts_on} · {contract.ends_on ?? "aperto"}
                </Td>
                <TableActions label={`Azioni per ${contract.tenant_name}`} />
              </tr>
            );
          })}
        </tbody>
      </Table>
    </SectionPanel>
  );
}

function DetailSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-semibold text-stone-950">
          {title}
        </h3>
        {action ? (
          <button className="text-sm font-medium text-blue-700">
            {action}
          </button>
        ) : null}
      </div>
      <div className="min-w-0 rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm shadow-emerald-950/5">
        {children}
      </div>
    </section>
  );
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="grid min-w-0 gap-x-8 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid min-w-0 gap-1 text-sm sm:grid-cols-[minmax(105px,130px)_minmax(0,1fr)] sm:gap-3"
        >
          <span className="text-stone-600">{label} :</span>
          <span className="min-w-0 break-words font-medium text-stone-950">
            {value || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const label =
    normalized === "paid"
      ? "Paid"
      : normalized === "partial"
        ? "Partial"
        : normalized === "unpaid"
          ? "Overdue"
          : normalized === "done"
            ? "Done"
            : "Pending";
  const tone =
    normalized === "paid" || normalized === "done"
      ? "bg-emerald-50 text-emerald-800"
      : normalized === "partial"
        ? "bg-blue-50 text-blue-800"
        : "bg-yellow-50 text-yellow-800";
  return <Badge className={`border-0 ${tone}`}>{label}</Badge>;
}
