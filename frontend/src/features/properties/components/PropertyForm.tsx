import { UseFormReturn } from "react-hook-form";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { PropertyFormValues } from "../types/propertyTypes";
import { composeAddress } from "../utils/propertyUtils";

export function PropertyForm({
  form,
  isEditing,
  onBack,
  onDelete,
  onSubmit,
}: {
  form: UseFormReturn<PropertyFormValues>;
  isEditing: boolean;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: PropertyFormValues) => void;
}) {
  const addressPreview = composeAddress(form.watch());

  return (
    <EntityForm
      title={isEditing ? "Dettaglio immobile" : "Nuovo immobile"}
      isEditing={isEditing}
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={form.handleSubmit(onSubmit, notifyInvalidSubmit)}
      isDirty={form.formState.isDirty}
    >
      <Field label="Nome" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} autoComplete="off" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Via" error={form.formState.errors.street?.message}>
          <Input {...form.register("street")} autoComplete="address-line1" />
        </Field>
        <Field
          label="Civico"
          error={form.formState.errors.street_number?.message}
        >
          <Input {...form.register("street_number")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[120px_1fr_120px]">
        <Field label="CAP" error={form.formState.errors.postal_code?.message}>
          <Input {...form.register("postal_code")} autoComplete="postal-code" />
        </Field>
        <Field label="Città" error={form.formState.errors.city?.message}>
          <Input {...form.register("city")} autoComplete="address-level2" />
        </Field>
        <Field
          label="Provincia"
          error={form.formState.errors.province?.message}
        >
          <Input {...form.register("province")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Regione" error={form.formState.errors.region?.message}>
          <Input {...form.register("region")} autoComplete="address-level1" />
        </Field>
        <Field label="Paese" error={form.formState.errors.country?.message}>
          <Input {...form.register("country")} autoComplete="country-name" />
        </Field>
      </div>
      <Field label="Indirizzo completo">
        <Input value={addressPreview} readOnly />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Valore acquisto"
          error={form.formState.errors.purchase_value?.message}
        >
          <Input
            type="number"
            step="0.01"
            {...form.register("purchase_value")}
          />
        </Field>
        <Field
          label="Mutuo residuo"
          error={form.formState.errors.mortgage?.message}
        >
          <Input type="number" step="0.01" {...form.register("mortgage")} />
        </Field>
        <Field
          label="Condominio mensile"
          error={form.formState.errors.condo_fees?.message}
        >
          <Input type="number" step="0.01" {...form.register("condo_fees")} />
        </Field>
      </div>
      <Field label="Note">
        <Textarea {...form.register("notes")} />
      </Field>
    </EntityForm>
  );
}
