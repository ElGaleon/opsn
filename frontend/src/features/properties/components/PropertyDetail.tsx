import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { DetailHeader } from "@shared/components/DetailHeader";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@shared/components/ui/card";
import { Property } from "@shared/lib/api";
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { OwnershipDonut } from "./OwnershipDonut";
import { ShareManager } from "./ShareManager";
import { PropertyStats } from "./PropertyStats";
import { UnitList } from "./UnitList";
import { statsFor } from "../utils/propertyUtils";

export function PropertyDetail({
  data,
  property,
  reload,
  getToken,
  onBack,
  onEdit,
  onNewUnit,
  onSelectUnit,
}: {
  data: Data;
  property: Property;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
  onBack: () => void;
  onEdit: () => void;
  onNewUnit: () => void;
  onSelectUnit: (id: string) => void;
}) {
  const units = data.units.filter((item) => item.property_id === property.id);
  const [shareEditing, setShareEditing] = useState(false);
  const unitsRef = useRef<HTMLDivElement>(null);
  const movements = data.movements.filter(
    (item) => item.property_id === property.id,
  );
  const hasStructuredAddress = Boolean(
    property.street ||
      property.city ||
      property.province ||
      property.region ||
      property.country,
  );
  return (
    <div className="space-y-4">
      <Card>
        <DetailHeader
          eyebrow="Dettaglio immobile"
          title={property.name}
          subtitle={property.address || "Indirizzo non disponibile"}
          onBack={onBack}
          onEdit={onEdit}
        />
        <CardContent className="space-y-5 pt-4 sm:pt-5">
          <PropertyStats
            stats={statsFor(movements)}
            unitCount={units.length}
            onUnitsClick={() =>
              unitsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid content-start gap-3 md:grid-cols-2">
              <ReadOnly label="Nome" value={property.name} />
              {!hasStructuredAddress ? (
                <ReadOnly label="Indirizzo" value={property.address} />
              ) : null}
              <ReadOnly
                label="Via"
                value={[property.street, property.street_number]
                  .filter(Boolean)
                  .join(" ")}
              />
              <ReadOnly
                label="Città"
                value={[property.postal_code, property.city, property.province]
                  .filter(Boolean)
                  .join(" ")}
              />
              <ReadOnly label="Regione" value={property.region ?? ""} />
              <ReadOnly label="Paese" value={property.country ?? ""} />
              <ReadOnly
                label="Valore acquisto"
                value={eur.format(Number(property.purchase_value))}
              />
              <ReadOnly
                label="Mutuo residuo"
                value={eur.format(Number(property.mortgage))}
              />
              <ReadOnly
                label="Condominio mensile"
                value={eur.format(Number(property.condo_fees))}
              />
              <ReadOnly label="Note" value={property.notes ?? ""} />
            </div>
            <div className="rounded-lg border border-emerald-950/10 bg-white/95 p-4 shadow-sm shadow-emerald-950/5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-stone-950">
                    Divisione quote
                  </p>
                  <p className="text-sm text-stone-500">
                    Ripartizione corrente della proprietà
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
                  propertyId={property.id}
                  reload={reload}
                  getToken={getToken}
                  defaultEditing
                  onClose={() => setShareEditing(false)}
                />
              ) : (
                <OwnershipDonut
                  data={data}
                  propertyId={property.id}
                  onEdit={() => setShareEditing(true)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div ref={unitsRef} className="grid scroll-mt-24 gap-4">
        <UnitList
          data={data}
          units={units}
          onNew={onNewUnit}
          onSelect={onSelectUnit}
        />
      </div>
    </div>
  );
}
