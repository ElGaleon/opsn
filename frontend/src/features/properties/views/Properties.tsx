import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PropertyDetail } from "../components/PropertyDetail";
import { PropertyForm } from "../components/PropertyForm";
import { PropertyList } from "../components/PropertyList";
import { PropertyStats } from "../components/PropertyStats";
import { UnitDetail } from "../components/UnitDetail";
import { UnitForm } from "../components/UnitForm";
import { UnitList } from "../components/UnitList";
import { api, Property, Unit } from "@shared/lib/api";
import { propertySchema, unitSchema } from "@shared/schemas/forms";
import { Data } from "@app/types/app";
import {
  composeAddress,
  propertyValues,
  statsFor,
  unitValues,
} from "../utils/propertyUtils";
import {
  PropertyFormValues,
  PropertyView,
  UnitFormValues,
} from "../types/propertyTypes";

export function Properties({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [view, setView] = useState<PropertyView>({ kind: "list" });
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const property =
    view.kind === "property"
      ? data.properties.find((item) => item.id === view.id)
      : undefined;
  const unit =
    view.kind === "unit"
      ? data.units.find((item) => item.id === view.id)
      : undefined;
  const propertyForm = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: propertyValues(),
  });
  const unitForm = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: unitValues(""),
  });

  useEffect(() => {
    if (view.kind === "property") propertyForm.reset(propertyValues(property));
  }, [view, property?.id]);

  useEffect(() => {
    if (view.kind === "unit") unitForm.reset(unitValues(view.propertyId, unit));
  }, [view, unit?.id]);

  async function saveProperty(values: PropertyFormValues) {
    const token = getToken ? await getToken() : null;
    const payload = {
      ...values,
      address: composeAddress(values),
    };
    const saved = await api<Property>(
      property ? `/properties/${property.id}` : "/properties",
      token,
      {
        method: property ? "PUT" : "POST",
        body: JSON.stringify(payload),
      },
    );
    setView({ kind: "property", id: saved.id });
    await reload();
  }

  async function saveUnit(values: UnitFormValues) {
    const token = getToken ? await getToken() : null;
    const saved = await api<Unit>(
      unit ? `/units/${unit.id}` : "/units",
      token,
      {
        method: unit ? "PUT" : "POST",
        body: JSON.stringify(values),
      },
    );
    setView({ kind: "unit", propertyId: saved.property_id, id: saved.id });
    await reload();
  }

  async function removeProperty() {
    if (!property) return;
    await removePropertyById(property.id);
    setView({ kind: "list" });
  }

  async function removePropertyById(propertyId: string) {
    const token = getToken ? await getToken() : null;
    await api(`/properties/${propertyId}`, token, { method: "DELETE" });
    await reload();
  }

  async function removeUnit() {
    if (!unit) return;
    const token = getToken ? await getToken() : null;
    await api(`/units/${unit.id}`, token, { method: "DELETE" });
    setView({ kind: "property", id: unit.property_id });
    await reload();
  }

  if (view.kind === "unit") {
    const parent = data.properties.find((item) => item.id === view.propertyId);
    if (unit && view.mode !== "edit") {
      return (
        <UnitDetail
          data={data}
          unit={unit}
          parent={parent}
          reload={reload}
          getToken={getToken}
          onBack={() =>
            setView({ kind: "property", id: view.propertyId, mode: "view" })
          }
          onEdit={() => setView({ ...view, mode: "edit" })}
        />
      );
    }
    return (
      <div className="space-y-4">
        <UnitForm
          form={unitForm}
          properties={data.properties}
          parentName={parent?.name}
          isEditing={Boolean(unit)}
          onBack={() =>
            view.propertyId
              ? setView({ kind: "property", id: view.propertyId })
              : setView({ kind: "list" })
          }
          onDelete={removeUnit}
          onSubmit={saveUnit}
        />
        {unit ? (
          <PropertyStats
            stats={statsFor(
              data.movements.filter((item) => item.unit_id === unit.id),
            )}
          />
        ) : null}
      </div>
    );
  }

  if (view.kind === "property") {
    if (property && view.mode !== "edit") {
      return (
        <PropertyDetail
          data={data}
          property={property}
          reload={reload}
          getToken={getToken}
          onBack={() => setView({ kind: "list" })}
          onEdit={() => setView({ ...view, mode: "edit" })}
          onNewUnit={() => setView({ kind: "unit", propertyId: property.id })}
          onSelectUnit={(id) =>
            setView({ kind: "unit", propertyId: property.id, id, mode: "view" })
          }
        />
      );
    }
    return (
      <div className="space-y-4">
        <PropertyForm
          form={propertyForm}
          isEditing={Boolean(property)}
          onBack={() => setView({ kind: "list" })}
          onDelete={removeProperty}
          onSubmit={saveProperty}
        />
        {property ? (
          <PropertyStats
            stats={statsFor(
              data.movements.filter((item) => item.property_id === property.id),
            )}
          />
        ) : null}
        {property ? (
          <UnitList
            data={data}
            units={data.units.filter(
              (item) => item.property_id === property.id,
            )}
            onNew={() => setView({ kind: "unit", propertyId: property.id })}
            onSelect={(id) =>
              setView({
                kind: "unit",
                propertyId: property.id,
                id,
                mode: "view",
              })
            }
          />
        ) : null}
      </div>
    );
  }

  const filteredProperties = data.properties.filter((item) => {
    const unitsCount = data.units.filter(
      (unit) => unit.property_id === item.id,
    ).length;
    const text = `${item.name} ${item.address}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (unitFilter === "all" ||
        (unitFilter === "with-units" ? unitsCount > 0 : unitsCount === 0))
    );
  });

  function selectPropertyUnits(propertyId: string) {
    const units = data.units.filter((item) => item.property_id === propertyId);
    if (units.length === 1) {
      setView({ kind: "unit", propertyId, id: units[0].id, mode: "view" });
      return;
    }
    setView({ kind: "property", id: propertyId, mode: "view" });
  }

  return (
    <PropertyList
      data={data}
      properties={filteredProperties}
      search={search}
      unitFilter={unitFilter}
      onSearch={setSearch}
      onUnitFilter={setUnitFilter}
      onNew={() => setView({ kind: "property" })}
      onNewUnit={() => setView({ kind: "unit", propertyId: "" })}
      onSelect={(id) => setView({ kind: "property", id, mode: "view" })}
      onSelectUnits={selectPropertyUnits}
      onEdit={(id) => setView({ kind: "property", id, mode: "edit" })}
      onDelete={removePropertyById}
    />
  );
}
