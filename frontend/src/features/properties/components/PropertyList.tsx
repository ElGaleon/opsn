import { Building2, Plus } from "lucide-react";
import { ListFilters } from "@shared/components/ListFilters";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Table, TableActions, Td, Th } from "@shared/components/ui/table";
import { Property } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";

export function PropertyList({
  data,
  properties,
  search,
  unitFilter,
  onSearch,
  onUnitFilter,
  onNew,
  onNewUnit,
  onSelect,
  onSelectUnits,
}: {
  data: Data;
  properties: Property[];
  search: string;
  unitFilter: string;
  onSearch: (value: string) => void;
  onUnitFilter: (value: string) => void;
  onNew: () => void;
  onNewUnit: () => void;
  onSelect: (id: string) => void;
  onSelectUnits: (propertyId: string) => void;
}) {
  const totalValue = properties.reduce(
    (sum, property) => sum + Number(property.purchase_value),
    0,
  );
  const unitsCount = properties.reduce(
    (sum, property) =>
      sum +
      data.units.filter((unit) => unit.property_id === property.id).length,
    0,
  );
  return (
    <SectionPanel
      title="Immobili"
      actions={
        <>
          <Button variant="outline" onClick={onNewUnit}>
            <Plus size={16} /> Unità
          </Button>
          <Button onClick={onNew}>
            <Plus size={16} /> Immobile
          </Button>
        </>
      }
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Immobili" value={properties.length} />
          <Stat label="Unità" value={unitsCount} />
          <Stat label="Valore" value={eur.format(totalValue)} />
        </div>
      }
      filters={
        <ListFilters
          search={search}
          onSearch={onSearch}
          filters={[
            {
              label: "Unità",
              value: unitFilter,
              onChange: onUnitFilter,
              options: [
                { value: "all", label: "Tutti" },
                { value: "with-units", label: "Con unità" },
                { value: "without-units", label: "Senza unità" },
              ],
            },
          ]}
        />
      }
    >
      <Table>
        <thead>
          <tr>
            <Th>Immobile</Th>
            <Th>Indirizzo</Th>
            <Th>Unità</Th>
            <Th>Quote</Th>
            <Th className="text-right">Valore</Th>
            <Th className="text-right">Azioni</Th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const propertyUnits = data.units.filter(
              (unit) => unit.property_id === property.id,
            );
            return (
              <tr
                key={property.id}
                className="group cursor-pointer hover:bg-stone-50"
                onClick={() => onSelect(property.id)}
              >
                <Td>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700">
                      <Building2 size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{property.name}</p>
                      <p className="truncate text-sm text-stone-500">
                        {propertyUnits.length} unità ·{" "}
                        {
                          data.shares.filter(
                            (share) => share.property_id === property.id,
                          ).length
                        }{" "}
                        quote
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>{property.address}</Td>
                <Td>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={!propertyUnits.length}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectUnits(property.id);
                    }}
                  >
                    {propertyUnits.length} unità
                  </Button>
                </Td>
                <Td>
                  <Badge>
                    {
                      data.shares.filter(
                        (share) => share.property_id === property.id,
                      ).length
                    }
                  </Badge>
                </Td>
                <Td className="text-right">
                  {eur.format(Number(property.purchase_value))}
                </Td>
                <TableActions label={`Azioni per ${property.name}`} />
              </tr>
            );
          })}
        </tbody>
      </Table>
    </SectionPanel>
  );
}
