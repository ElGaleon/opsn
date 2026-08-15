import { UseFormReturn } from "react-hook-form";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { OwnerFormValues } from "../types/ownerTypes";

export function OwnerForm({
  form,
  isEditing,
  onBack,
  onDelete,
  onSubmit,
}: {
  form: UseFormReturn<OwnerFormValues>;
  isEditing: boolean;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: OwnerFormValues) => void;
}) {
  return (
    <EntityForm
      title={isEditing ? "Dettaglio proprietario" : "Nuovo proprietario"}
      isEditing={isEditing}
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={form.handleSubmit(onSubmit, notifyInvalidSubmit)}
      isDirty={form.formState.isDirty}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" error={form.formState.errors.first_name?.message}>
          <Input {...form.register("first_name")} autoComplete="given-name" />
        </Field>
        <Field label="Cognome" error={form.formState.errors.last_name?.message}>
          <Input {...form.register("last_name")} autoComplete="family-name" />
        </Field>
      </div>
      <Field label="Codice fiscale">
        <Input {...form.register("tax_code")} autoComplete="off" />
      </Field>
      <Field label="Contatti">
        <Textarea {...form.register("contacts")} />
      </Field>
    </EntityForm>
  );
}
