import { UseFormReturn } from "react-hook-form";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import { Property } from "@shared/lib/api";
import { notifyInvalidSubmit } from "@shared/lib/toast";
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
    <EntityForm
      title={isEditing ? "Dettaglio unità" : "Nuova unità"}
      eyebrow={parentName}
      isEditing={isEditing}
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={form.handleSubmit(onSubmit, notifyInvalidSubmit)}
      isDirty={form.formState.isDirty}
    >
      <Field label="Immobile" error={form.formState.errors.property_id?.message}>
        <Select {...form.register("property_id")}>
          <option value="">Seleziona immobile</option>
          {properties.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Field label="Nome unità" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} autoComplete="off" />
        </Field>
        <Field label="Tipologia" error={form.formState.errors.unit_type?.message}>
          <Select {...form.register("unit_type")}>
            <option value="apartment">Appartamento</option>
            <option value="garage">Garage</option>
            <option value="room">Stanza</option>
            <option value="commercial">Locale commerciale</option>
            <option value="other">Altro</option>
          </Select>
        </Field>
      </div>
      <Field label="Note">
        <Textarea {...form.register("notes")} />
      </Field>
    </EntityForm>
  );
}
