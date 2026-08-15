import { ArrowRight, Home, Plus } from "lucide-react";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Unit } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { statsFor, unitTypeLabel } from "../utils/propertyUtils";

export function UnitList({
  data,
  units,
  onNew,
  onSelect,
}: {
  data: Data;
  units: Unit[];
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-emerald-950/10 bg-white/70">
        <div>
          <CardTitle>Unità</CardTitle>
          <p className="mt-1 text-sm text-stone-500">
            Vista raggruppata delle unità dell'immobile
          </p>
        </div>
        <Button className="ml-auto" onClick={onNew}>
          <Plus size={16} /> Unità
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => (
          <button
            key={unit.id}
            className="group flex min-h-32 w-full flex-col justify-between rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm shadow-stone-950/5 transition hover:-translate-y-0.5 hover:border-emerald-700/25 hover:shadow-md"
            onClick={() => onSelect(unit.id)}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-100 text-emerald-700">
                  <Home size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-stone-950">
                    {unit.name}
                  </span>
                  <span className="mt-1 block text-xs uppercase text-stone-500">
                    {unitTypeLabel(unit.unit_type)}
                  </span>
                </span>
              </span>
              <ArrowRight
                size={16}
                className="mt-2 shrink-0 text-emerald-700 opacity-0 transition group-hover:opacity-100"
              />
            </span>
            <span className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase text-stone-500">
                Netto
              </span>
              <Badge className="bg-stone-100 text-stone-800">
                {eur.format(
                  statsFor(
                    data.movements.filter(
                      (movement) => movement.unit_id === unit.id,
                    ),
                  ).net,
                )}
              </Badge>
            </span>
          </button>
        ))}
        {!units.length ? (
          <div className="rounded-lg border border-dashed border-emerald-950/15 bg-white/70 p-6 text-sm text-stone-500 sm:col-span-2 xl:col-span-3">
            Nessuna unità registrata.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
