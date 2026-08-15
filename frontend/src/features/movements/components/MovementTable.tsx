import { Movement } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";
import { Table, Td, Th } from "@shared/components/ui/table";
import {
  paymentStatusClass,
  paymentStatusLabel,
} from "../utils/movementUtils";

export function MovementTable({
  movements,
  onSelect,
}: {
  movements: Movement[];
  onSelect?: (movement: Movement) => void;
}) {
  return (
    <SectionPanel
      title="Registro movimenti"
      surface="plain"
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
    >
      <Table>
        <thead>
          <tr>
            <Th>Competenza</Th>
            <Th>Descrizione</Th>
            <Th>Categoria</Th>
            <Th>Stato</Th>
            <Th className="text-right">Importo</Th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr
              key={movement.id}
              className={
                onSelect ? "cursor-pointer hover:bg-emerald-50/70" : ""
              }
              onClick={() => onSelect?.(movement)}
            >
              <Td>{formatDate(movement.accrual_date)}</Td>
              <Td>{movement.description}</Td>
              <Td>{movement.category}</Td>
              <Td>
                <Badge className={paymentStatusClass(movement.status)}>
                  {paymentStatusLabel(movement.status)}
                </Badge>
              </Td>
              <Td
                className={`text-right font-medium ${movement.type === "income" ? "text-emerald-700" : "text-red-700"}`}
              >
                {movement.type === "income" ? "+" : "-"}{" "}
                {eur.format(Number(movement.amount))}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
