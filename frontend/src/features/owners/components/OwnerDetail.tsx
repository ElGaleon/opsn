import { DetailHeader } from "@shared/components/DetailHeader";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Stat } from "@shared/components/Stat";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Table, Td, Th } from "@shared/components/ui/table";
import { Owner } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { targetName } from "../utils/ownerUtils";

export function OwnerDetail({
  data,
  owner,
  onBack,
  onEdit,
}: {
  data: Data;
  owner: Owner;
  onBack: () => void;
  onEdit: () => void;
}) {
  const report = data.ownerReports.find((item) => item.owner_id === owner.id);
  const forecast = data.forecast?.owners.find(
    (item) => item.owner_id === owner.id,
  );
  const shares = data.shares.filter((share) => share.owner_id === owner.id);
  const allocations = data.movements.flatMap((movement) =>
    movement.allocations
      .filter((allocation) => allocation.owner_id === owner.id)
      .map((allocation) => ({ movement, allocation })),
  );
  return (
    <div className="space-y-4">
      <Card>
        <DetailHeader
          eyebrow="Dettaglio proprietario"
          title={`${owner.first_name} ${owner.last_name}`}
          subtitle={owner.contacts ?? ""}
          onBack={onBack}
          onEdit={onEdit}
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Stat
              label="Competenza netta"
              value={eur.format(Number(report?.net ?? 0))}
            />
            <Stat
              label="Cassa reale"
              value={eur.format(Number(report?.paid_directly ?? 0))}
            />
            <Stat
              label="Saldo"
              value={eur.format(Number(report?.owner_balance ?? 0))}
              tone={Number(report?.owner_balance ?? 0) >= 0 ? "good" : "bad"}
            />
            <Stat
              label="Previsione netta"
              value={eur.format(Number(forecast?.net_due ?? 0))}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ReadOnly label="Nome" value={owner.first_name} />
            <ReadOnly label="Cognome" value={owner.last_name} />
            <ReadOnly label="Codice fiscale" value={owner.tax_code ?? ""} />
            <ReadOnly label="Contatti" value={owner.contacts ?? ""} />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {shares.map((share) => (
              <div
                key={share.id}
                className="rounded-md border border-zinc-200 p-3 text-sm"
              >
                {targetName(data, share.property_id, share.unit_id)} ·{" "}
                {share.percentage}% · dal {share.valid_from}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocazioni movimenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Movimento</Th>
                  <Th>Quota</Th>
                  <Th>Importo</Th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(({ movement, allocation }) => (
                  <tr key={allocation.id}>
                    <Td>{movement.description}</Td>
                    <Td>{allocation.percentage}%</Td>
                    <Td>{eur.format(Number(allocation.amount))}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
