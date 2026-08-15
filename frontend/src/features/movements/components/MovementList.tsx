import { ArrowRight, Plus } from "lucide-react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Table, Td, Th } from "@shared/components/ui/table";
import { Movement } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import {
  movementTypeLabel,
  ownerName,
  paymentStatusClass,
  paymentStatusLabel,
} from "../utils/movementUtils";

export function MovementList({
  data,
  movements,
  search,
  typeFilter,
  statusFilter,
  onSearch,
  onTypeFilter,
  onStatusFilter,
  onNew,
  onSelect,
}: {
  data: Data;
  movements: Movement[];
  search: string;
  typeFilter: string;
  statusFilter: string;
  onSearch: (value: string) => void;
  onTypeFilter: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  const title =
    typeFilter === "income"
      ? "Entrate"
      : typeFilter === "expense"
        ? "Uscite"
        : typeFilter === "transfer"
          ? "Trasferimenti"
          : "Registro movimenti";
  return (
    <SectionPanel
      title={title}
      actions={
        <Button onClick={onNew}>
          <Plus size={16} /> Movimento
        </Button>
      }
      stats={
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          <MovementTypeCard
            label="Tutti"
            value={data.movements.length}
            active={typeFilter === "all"}
            onClick={() => {
              onTypeFilter("all");
              onStatusFilter("all");
            }}
          />
          <MovementTypeCard
            label="Entrate"
            value={eur.format(totalByType(data.movements, "income"))}
            tone="good"
            active={typeFilter === "income"}
            onClick={() => {
              onTypeFilter("income");
              onStatusFilter("all");
            }}
          />
          <MovementTypeCard
            label="Uscite"
            value={eur.format(totalByType(data.movements, "expense"))}
            tone="bad"
            active={typeFilter === "expense"}
            onClick={() => {
              onTypeFilter("expense");
              onStatusFilter("all");
            }}
          />
        </div>
      }
      filters={
        <ListFilters
          search={search}
          onSearch={onSearch}
          filters={[
            {
              label: "Tipo",
              value: typeFilter,
              onChange: onTypeFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "income", label: "Entrate" },
                { value: "expense", label: "Uscite" },
                { value: "transfer", label: "Trasferimenti" },
              ],
            },
            {
              label: "Stato",
              value: statusFilter,
              onChange: onStatusFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "paid", label: "Pagati" },
                { value: "partial", label: "Parziali" },
                { value: "unpaid", label: "Non pagati" },
              ],
            },
          ]}
        />
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Competenza</Th>
            <Th>Descrizione</Th>
            <Th>Categoria</Th>
            <Th>Stato</Th>
            <Th>Cassa</Th>
            <Th className="text-right">Importo</Th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr
              key={movement.id}
              className="cursor-pointer hover:bg-emerald-50/70"
              onClick={() => onSelect(movement.id)}
            >
              <Td>{formatDate(movement.accrual_date)}</Td>
              <Td>{movement.description}</Td>
              <Td>{movement.category}</Td>
              <Td>
                <Badge
                  className={paymentStatusClass(
                    movement.type === "transfer" ? null : movement.status,
                  )}
                >
                  {movement.type === "transfer"
                    ? movementTypeLabel(movement.type)
                    : paymentStatusLabel(movement.status)}
                </Badge>
              </Td>
              <Td>
                {movement.type === "transfer"
                  ? `${ownerName(data, movement.paid_by_owner_id)} -> ${ownerName(data, movement.transfer_to_owner_id)}`
                  : ownerName(data, movement.paid_by_owner_id)}
                {movement.payment_method ? ` · ${movement.payment_method}` : ""}
              </Td>
              <Td
                className={`text-right font-medium ${movement.type === "income" ? "text-emerald-700" : movement.type === "expense" ? "text-red-700" : ""}`}
              >
                {movement.type === "income"
                  ? "+"
                  : movement.type === "expense"
                    ? "-"
                    : ""}{" "}
                {eur.format(Number(movement.amount))}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}

function totalByType(movements: Movement[], type: Movement["type"]) {
  return movements
    .filter((movement) => movement.type === type)
    .reduce((sum, movement) => sum + Number(movement.amount), 0);
}

function MovementTypeCard({
  label,
  value,
  active,
  tone = "default",
  onClick,
}: {
  label: string;
  value: string | number;
  active: boolean;
  tone?: "default" | "good" | "bad";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`group rounded-lg border bg-white/95 p-3 text-left shadow-sm shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:p-4 ${
        active ? "border-emerald-500 ring-2 ring-emerald-100" : "border-emerald-950/10"
      }`}
      onClick={onClick}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase text-stone-500 sm:text-xs">
          {label}
        </span>
        <ArrowRight
          size={16}
          className="text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700"
        />
      </span>
      <span
        className={`mt-2 block truncate text-lg font-semibold leading-tight sm:text-xl ${
          tone === "good"
            ? "text-emerald-700"
            : tone === "bad"
              ? "text-amber-700"
              : "text-stone-950"
        }`}
      >
        {value}
      </span>
    </button>
  );
}
