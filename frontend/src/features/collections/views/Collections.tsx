import { CheckCircle2, Coins } from "lucide-react";
import { useMemo, useState } from "react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { Table, Td, Th } from "@shared/components/ui/table";
import { api, Movement } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { openAmount } from "@features/movements/utils/movementUtils";

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

export function Collections({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState("open");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        paid_by_owner_id: string;
        payment_method: string;
        payment_date: string;
        paid_amount: string;
      }
    >
  >({});

  const rentMovements = useMemo(
    () =>
      data.movements.filter(
        (movement) =>
          movement.type === "income" &&
          movement.category === "Affitto" &&
          Boolean(movement.contract_id) &&
          movement.accrual_date.slice(0, 7) === month,
      ),
    [data.movements, month],
  );

  const rows = rentMovements.filter((movement) => {
    const contract = data.contracts.find(
      (item) => item.id === movement.contract_id,
    );
    const unit = data.units.find((item) => item.id === movement.unit_id);
    const tenant = data.tenants.find((item) => item.id === contract?.tenant_id);
    const text =
      `${tenant?.full_name ?? contract?.tenant_name ?? ""} ${unit?.name ?? ""} ${movement.description}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (status === "all" ||
        (status === "open"
          ? movement.status !== "paid"
          : movement.status === status))
    );
  });

  const totals = rows.reduce(
    (sum, movement) => ({
      due: sum.due + Number(movement.amount),
      open: sum.open + openAmount(movement),
    }),
    { due: 0, open: 0 },
  );

  function draftFor(movement: Movement) {
    return (
      drafts[movement.id] ?? {
        paid_by_owner_id: movement.paid_by_owner_id ?? data.owners[0]?.id ?? "",
        payment_method: movement.payment_method ?? "bonifico",
        payment_date: movement.payment_date ?? today(),
        paid_amount: movement.amount,
      }
    );
  }

  function setDraft(id: string, values: Partial<ReturnType<typeof draftFor>>) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...values } as ReturnType<typeof draftFor>,
    }));
  }

  async function collect(movement: Movement, partial: boolean) {
    const draft = draftFor(movement);
    const token = getToken ? await getToken() : null;
    await api<Movement>(`/movements/${movement.id}`, token, {
      method: "PUT",
      body: JSON.stringify({
        ...movement,
        status: partial ? "partial" : "paid",
        payment_date: draft.payment_date,
        paid_by_owner_id: draft.paid_by_owner_id,
        payment_method: draft.payment_method,
        paid_amount: partial ? Number(draft.paid_amount) : null,
        allocations:
          movement.allocation_mode === "custom"
            ? movement.allocations.map((allocation) => ({
                owner_id: allocation.owner_id,
                percentage: allocation.percentage,
              }))
            : [],
      }),
    });
    setDrafts((current) => {
      const next = { ...current };
      delete next[movement.id];
      return next;
    });
    await reload();
  }

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Incasso canoni"
        surface="plain"
        actions={
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Mese
            <Input
              type="month"
              className="w-40"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
        }
        stats={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat label="Canoni filtrati" value={eur.format(totals.due)} />
            <Stat
              label="Da incassare"
              value={eur.format(totals.open)}
              tone={totals.open > 0 ? "bad" : "default"}
            />
            <Stat label="Rate" value={rows.length} />
          </div>
        }
        filters={
          <ListFilters
            search={search}
            onSearch={setSearch}
            placeholder="Cerca inquilino, unità o descrizione"
            filters={[
              {
                label: "Stato incasso",
                value: status,
                onChange: setStatus,
                options: [
                  { value: "open", label: "Da incassare" },
                  { value: "unpaid", label: "Non pagati" },
                  { value: "partial", label: "Parziali" },
                  { value: "paid", label: "Pagati" },
                  { value: "all", label: "Tutti" },
                ],
              },
            ]}
          />
        }
      >
        <Table className="min-w-[980px]">
          <thead>
            <tr>
              <Th>Canone</Th>
              <Th>Unità</Th>
              <Th>Scadenza</Th>
              <Th>Importo</Th>
              <Th>Incasso</Th>
              <Th>Metodo</Th>
              <Th>Data</Th>
              <Th className="text-right">Azioni</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((movement) => {
              const contract = data.contracts.find(
                (item) => item.id === movement.contract_id,
              );
              const unit = data.units.find(
                (item) => item.id === movement.unit_id,
              );
              const tenant = data.tenants.find(
                (item) => item.id === contract?.tenant_id,
              );
              const draft = draftFor(movement);
              const disabled =
                !draft.paid_by_owner_id ||
                !draft.payment_method ||
                !draft.payment_date;
              return (
                <tr key={movement.id}>
                  <Td>
                    <span className="font-semibold">
                      {tenant?.full_name ?? contract?.tenant_name}
                    </span>
                    <span className="block text-xs text-stone-500">
                      {movement.description}
                    </span>
                  </Td>
                  <Td>{unit?.name ?? "—"}</Td>
                  <Td>{formatDate(movement.due_date ?? movement.accrual_date)}</Td>
                  <Td>{eur.format(Number(movement.amount))}</Td>
                  <Td>
                    <Input
                      type="number"
                      min="0.01"
                      max={movement.amount}
                      step="0.01"
                      value={draft.paid_amount}
                      onChange={(event) =>
                        setDraft(movement.id, {
                          paid_amount: event.target.value,
                        })
                      }
                      disabled={movement.status === "paid"}
                    />
                  </Td>
                  <Td>
                    <Select
                      value={draft.payment_method}
                      onChange={(event) =>
                        setDraft(movement.id, {
                          payment_method: event.target.value,
                        })
                      }
                      disabled={movement.status === "paid"}
                    >
                      <option value="bonifico">Bonifico</option>
                      <option value="contanti">Contanti</option>
                      <option value="assegno">Assegno</option>
                      <option value="altro">Altro</option>
                    </Select>
                  </Td>
                  <Td>
                    <Input
                      type="date"
                      value={draft.payment_date}
                      onChange={(event) =>
                        setDraft(movement.id, {
                          payment_date: event.target.value,
                        })
                      }
                      disabled={movement.status === "paid"}
                    />
                  </Td>
                  <Td className="text-right">
                    {movement.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                        <CheckCircle2 size={16} /> Incassato
                      </span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <OwnerSelect
                          data={data}
                          value={draft.paid_by_owner_id}
                          onChange={(value) =>
                            setDraft(movement.id, { paid_by_owner_id: value })
                          }
                        />
                        <Button
                          className="h-8"
                          disabled={disabled}
                          onClick={() => collect(movement, false)}
                        >
                          <Coins size={15} /> Totale
                        </Button>
                        <Button
                          className="h-8"
                          variant="outline"
                          disabled={
                            disabled ||
                            Number(draft.paid_amount) <= 0 ||
                            Number(draft.paid_amount) >= Number(movement.amount)
                          }
                          onClick={() => collect(movement, true)}
                        >
                          Parziale
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <Td colSpan={8}>
                  Nessun canone trovato per i filtri selezionati.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </SectionPanel>
    </div>
  );
}

function OwnerSelect({
  data,
  value,
  onChange,
}: {
  data: Data;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      className="w-44"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Incassato da</option>
      {data.owners.map((owner) => (
        <option key={owner.id} value={owner.id}>
          {owner.first_name} {owner.last_name}
        </option>
      ))}
    </Select>
  );
}
