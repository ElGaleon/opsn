import { Home, Plus } from "lucide-react";
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
import { statsFor } from "../utils/propertyUtils";

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
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Unità</CardTitle>
        <Button className="ml-auto" onClick={onNew}>
          <Plus size={16} /> Unità
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {units.map((unit) => (
          <button
            key={unit.id}
            className="flex w-full items-center justify-between rounded-md border border-zinc-200 p-3 text-left hover:bg-zinc-50"
            onClick={() => onSelect(unit.id)}
          >
            <span>
              <Home className="mr-2 inline" size={16} />
              {unit.name}
            </span>
            <span className="flex items-center gap-2">
              <Badge>
                {eur.format(
                  statsFor(
                    data.movements.filter(
                      (movement) => movement.unit_id === unit.id,
                    ),
                  ).net,
                )}
              </Badge>
              <Badge>{unit.unit_type}</Badge>
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
