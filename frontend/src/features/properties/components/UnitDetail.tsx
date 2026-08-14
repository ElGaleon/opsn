import { ArrowLeft, Pencil } from "lucide-react";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Property, Unit } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { OwnershipDonut } from "./OwnershipDonut";
import { ShareManager } from "./ShareManager";
import { PropertyStats } from "./PropertyStats";
import { statsFor } from "../utils/propertyUtils";

export function UnitDetail({
  data,
  unit,
  parent,
  reload,
  getToken,
  onBack,
  onEdit,
}: {
  data: Data;
  unit: Unit;
  parent?: Property;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
  onBack: () => void;
  onEdit: () => void;
}) {
  const movements = data.movements.filter((item) => item.unit_id === unit.id);
  const contracts = data.contracts.filter((item) => item.unit_id === unit.id);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Dettaglio unità · {parent?.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft size={16} /> Indietro
            </Button>
            <Button onClick={onEdit}>
              <Pencil size={16} /> Modifica
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PropertyStats stats={statsFor(movements)} />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-3 md:grid-cols-2">
              <ReadOnly label="Nome" value={unit.name} />
              <ReadOnly label="Tipologia" value={unit.unit_type} />
              <ReadOnly label="Immobile" value={parent?.name ?? ""} />
              <ReadOnly label="Note" value={unit.notes ?? ""} />
            </div>
            <div className="rounded-lg border border-emerald-950/10 bg-white/80 p-3">
              <p className="px-1 text-sm font-semibold text-stone-900">
                Divisione quote
              </p>
              <OwnershipDonut data={data} unitId={unit.id} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contratti unità</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="rounded-md border border-zinc-200 p-3 text-sm"
              >
                {contract.tenant_name} ·{" "}
                {eur.format(Number(contract.monthly_rent))} ·{" "}
                {contract.starts_on} / {contract.ends_on ?? "aperto"}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quote unità</CardTitle>
          </CardHeader>
          <CardContent>
            <ShareManager
              data={data}
              unitId={unit.id}
              reload={reload}
              getToken={getToken}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
