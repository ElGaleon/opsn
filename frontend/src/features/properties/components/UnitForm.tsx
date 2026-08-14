import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Field } from "@shared/components/Field";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { Property } from "@shared/lib/api";
import { UnitFormValues } from "../types/propertyTypes";

export function UnitForm({
  form,
  properties,
  parentName,
  isEditing,
  onBack,
  onDelete,
  onSubmit,
}: {
  form: UseFormReturn<UnitFormValues>;
  properties: Property[];
  parentName?: string;
  isEditing: boolean;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: UnitFormValues) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          {isEditing ? "Dettaglio unità" : "Nuova unità"}
          {parentName ? ` · ${parentName}` : ""}
        </CardTitle>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Indietro
        </Button>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-2xl space-y-3"
        >
          <Field label="Immobile">
            <Select {...form.register("property_id")}>
              <option value="">Seleziona immobile</option>
              {properties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nome unità" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Tipologia">
            <Select {...form.register("unit_type")}>
              <option value="apartment">Appartamento</option>
              <option value="garage">Garage</option>
              <option value="room">Stanza</option>
              <option value="commercial">Locale commerciale</option>
              <option value="other">Altro</option>
            </Select>
          </Field>
          <Field label="Note">
            <Input {...form.register("notes")} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button>
              <Plus size={16} /> Salva
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onDelete}>
                <Trash2 size={16} /> Elimina
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
