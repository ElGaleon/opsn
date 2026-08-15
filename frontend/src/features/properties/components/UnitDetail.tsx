import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { DetailHeader } from "@shared/components/DetailHeader";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Property, Unit } from "@shared/lib/api";
import { eur, formatDate } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { OwnershipDonut } from "./OwnershipDonut";
import { ShareManager } from "./ShareManager";
import { PropertyStats } from "./PropertyStats";
import { statsFor, unitTypeLabel } from "../utils/propertyUtils";

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
  const [shareEditing, setShareEditing] = useState(false);
  const movements = data.movements.filter((item) => item.unit_id === unit.id);
  const contracts = data.contracts.filter((item) => item.unit_id === unit.id);
  return (
    <div className="space-y-4">
      <Card>
        <DetailHeader
          eyebrow="Dettaglio unità"
          title={unit.name}
          subtitle={parent?.name ?? "Immobile non assegnato"}
          onBack={onBack}
          onEdit={onEdit}
        />
        <CardContent className="space-y-5 pt-4 sm:pt-5">
          <PropertyStats stats={statsFor(movements)} />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid content-start gap-3 md:grid-cols-2">
              <ReadOnly label="Nome" value={unit.name} />
              <ReadOnly label="Tipologia" value={unitTypeLabel(unit.unit_type)} />
              <ReadOnly label="Immobile" value={parent?.name ?? ""} />
              <ReadOnly label="Note" value={unit.notes ?? ""} />
            </div>
            <div className="rounded-lg border border-emerald-950/10 bg-white/95 p-4 shadow-sm shadow-emerald-950/5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-stone-950">
                    Divisione quote
                  </p>
                  <p className="text-sm text-stone-500">
                    Ripartizione corrente dell'unità
                  </p>
                </div>
                {!shareEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShareEditing(true)}
                  >
                    <Plus size={16} /> Modifica quote
                  </Button>
                ) : null}
              </div>
              {shareEditing ? (
                <ShareManager
                  data={data}
                  unitId={unit.id}
                  reload={reload}
                  getToken={getToken}
                  defaultEditing
                  onClose={() => setShareEditing(false)}
                />
              ) : (
                <OwnershipDonut
                  data={data}
                  unitId={unit.id}
                  onEdit={() => setShareEditing(true)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card>
          <CardHeader className="border-b border-emerald-950/10 bg-white/70">
            <CardTitle>Contratti unità</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="rounded-lg border border-stone-200 bg-white p-4 text-sm shadow-sm shadow-stone-950/5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-emerald-700">
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-950">
                      {contract.tenant_name}
                    </p>
                    <p className="mt-1 text-stone-600">
                      {eur.format(Number(contract.monthly_rent))} / mese
                    </p>
                    <p className="mt-2 text-xs text-stone-500">
                      {formatDate(contract.starts_on)} /{" "}
                      {contract.ends_on ? formatDate(contract.ends_on) : "aperto"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {!contracts.length ? (
              <div className="rounded-lg border border-dashed border-emerald-950/15 bg-white/70 p-6 text-sm text-stone-500 sm:col-span-2 xl:col-span-3">
                Nessun contratto collegato.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
