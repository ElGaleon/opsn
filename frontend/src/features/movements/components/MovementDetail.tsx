import { DetailHeader } from "@shared/components/DetailHeader";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Movement } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import {
  movementTypeLabel,
  ownerName,
  paidAmount,
  paymentStatusClass,
  paymentStatusLabel,
} from "../utils/movementUtils";

export function MovementDetail({
  data,
  movement,
  onBack,
  onEdit,
}: {
  data: Data;
  movement: Movement;
  onBack: () => void;
  onEdit: () => void;
}) {
  const property = data.properties.find(
    (item) => item.id === movement.property_id,
  );
  const unit = data.units.find((item) => item.id === movement.unit_id);
  return (
    <div className="space-y-4">
      <Card>
        <DetailHeader
          title="Dettaglio movimento"
          subtitle={movement.description}
          onBack={onBack}
          onEdit={onEdit}
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Stat
              label="Importo"
              value={eur.format(Number(movement.amount))}
              tone={movement.type === "expense" ? "bad" : "default"}
            />
            <Stat label="Allocazioni" value={movement.allocations.length} />
            <Stat
              label="Pagato"
              value={eur.format(paidAmount(movement))}
            />
            <Stat
              label="Scoperto"
              value={eur.format(Number(movement.amount) - paidAmount(movement))}
              tone={movement.status === "paid" ? "default" : "bad"}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ReadOnly label="Tipo" value={movementTypeLabel(movement.type)} />
            <ReadOnly
              label="Stato"
              value={
                <Badge className={paymentStatusClass(movement.status)}>
                  {paymentStatusLabel(movement.status)}
                </Badge>
              }
            />
            <ReadOnly label="Descrizione" value={movement.description} />
            <ReadOnly label="Categoria" value={movement.category} />
            <ReadOnly label="Immobile" value={property?.name ?? ""} />
            <ReadOnly label="Unità" value={unit?.name ?? ""} />
            <ReadOnly label="Competenza" value={formatDate(movement.accrual_date)} />
            <ReadOnly
              label="Ripartizione"
              value={
                movement.type === "transfer"
                  ? "Trasferimento proprietari"
                  : movement.allocation_mode
              }
            />
            <ReadOnly
              label={
                movement.type === "transfer"
                  ? "Da"
                  : movement.type === "income"
                    ? "Incassato da"
                    : "Pagato da"
              }
              value={ownerName(data, movement.paid_by_owner_id)}
            />
            <ReadOnly
              label={movement.type === "transfer" ? "A" : "Metodo"}
              value={
                movement.type === "transfer"
                  ? ownerName(data, movement.transfer_to_owner_id)
                  : (movement.payment_method ?? "")
              }
            />
          </div>
        </CardContent>
      </Card>
      {movement.type !== "transfer" ? (
        <AllocationCard data={data} movement={movement} />
      ) : null}
    </div>
  );
}

function AllocationCard({
  data,
  movement,
}: {
  data: Data;
  movement: Movement;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ripartizione economica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {movement.allocations.map((allocation) => {
          const owner = data.owners.find(
            (item) => item.id === allocation.owner_id,
          );
          return (
            <div
              key={allocation.id}
              className="flex justify-between rounded-md border border-zinc-200 p-3 text-sm"
            >
              <span>
                {owner
                  ? `${owner.first_name} ${owner.last_name}`
                  : "Proprietario"}{" "}
                · {allocation.percentage}%
              </span>
              <span>{eur.format(Number(allocation.amount))}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
