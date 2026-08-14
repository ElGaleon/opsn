import { Plus } from "lucide-react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Table, Td, Th } from "@shared/components/ui/table";
import { Movement } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { ownerName } from "../utils/movementUtils";

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
  return (
    <SectionPanel
      title="Registro movimenti"
      actions={
        <Button onClick={onNew}>
          <Plus size={16} /> Movimento
        </Button>
      }
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Movimenti" value={movements.length} />
          <Stat
            label="Entrate"
            value={eur.format(
              movements
                .filter((movement) => movement.type === "income")
                .reduce((sum, movement) => sum + Number(movement.amount), 0),
            )}
            tone="good"
          />
          <Stat
            label="Uscite"
            value={eur.format(
              movements
                .filter((movement) => movement.type === "expense")
                .reduce((sum, movement) => sum + Number(movement.amount), 0),
            )}
            tone="bad"
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
              <Td>{movement.accrual_date}</Td>
              <Td>{movement.description}</Td>
              <Td>{movement.category}</Td>
              <Td>
                <Badge>
                  {movement.type === "transfer" ? "transfer" : movement.status}
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
