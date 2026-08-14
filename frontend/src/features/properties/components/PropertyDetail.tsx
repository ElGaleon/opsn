import { ArrowLeft, Pencil } from "lucide-react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ReadOnly } from "@shared/components/ReadOnly";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  const movements = data.movements.filter(
    (item) => item.property_id === property.id,
  );
  const latitude = property.latitude ? Number(property.latitude) : null;
  const longitude = property.longitude ? Number(property.longitude) : null;
  const hasPosition = latitude !== null && longitude !== null;
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
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Dettaglio immobile</CardTitle>
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
            <div className="rounded-lg border border-emerald-950/10 bg-white/80 p-3">
              <p className="px-1 text-sm font-semibold text-stone-900">
                Divisione quote
              </p>
              <OwnershipDonut data={data} propertyId={property.id} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mappa immobile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] overflow-hidden rounded-lg border border-emerald-950/10 bg-emerald-50 sm:h-[420px]">
            {hasPosition ? (
              <Map
                initialViewState={{ latitude, longitude, zoom: 15 }}
                mapStyle="https://demotiles.maplibre.org/style.json"
                style={{ width: "100%", height: "100%" }}
              >
                <NavigationControl position="top-right" />
                <Marker
                  latitude={latitude}
                  longitude={longitude}
                  anchor="bottom"
                >
                  <div className="rounded-full bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950/30">
                    {property.name}
                  </div>
                </Marker>
              </Map>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="text-lg font-semibold text-stone-900">
                  Coordinate non inserite
                </p>
                <p className="mt-2 max-w-md text-sm text-stone-600">
                  Aggiungi latitudine e longitudine nella scheda immobile per
                  visualizzare la posizione sulla mappa.
                </p>
                <p className="mt-4 rounded-md bg-white px-3 py-2 text-sm text-emerald-800">
                  {property.address || "Indirizzo non disponibile"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <UnitList
          data={data}
          units={units}
          onNew={onNewUnit}
          onSelect={onSelectUnit}
        />
        <Card>
          <CardHeader>
            <CardTitle>Quote proprietà</CardTitle>
          </CardHeader>
          <CardContent>
            <ShareManager
              data={data}
              propertyId={property.id}
              reload={reload}
              getToken={getToken}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
