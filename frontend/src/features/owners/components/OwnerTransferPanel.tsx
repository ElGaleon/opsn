import { ComponentProps } from "react";
import { UseFormReturn } from "react-hook-form";
import { EntityForm } from "@shared/components/EntityForm";
import { Field } from "@shared/components/Field";
import { Input } from "@shared/components/ui/input";
import { Select } from "@shared/components/ui/select";
import { notifyInvalidSubmit } from "@shared/lib/toast";
import { Data } from "@app/types/app";
import { TransferFormValues } from "../types/ownerTypes";

export function OwnerTransferPanel({
  data,
  form,
  onBack,
  onSubmit,
}: {
  data: Data;
  form: UseFormReturn<TransferFormValues>;
  onBack: () => void;
  onSubmit: (values: TransferFormValues) => void;
}) {
  return (
    <EntityForm
      title="Trasferimento tra proprietari"
      isEditing={false}
      onBack={onBack}
      onSubmit={form.handleSubmit(onSubmit, notifyInvalidSubmit)}
      isDirty={form.formState.isDirty}
    >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_150px_170px_150px]">
            <Field label="Da" error={form.formState.errors.from_owner_id?.message}>
              <OwnerSelect data={data} {...form.register("from_owner_id")} />
            </Field>
            <Field label="A" error={form.formState.errors.to_owner_id?.message}>
              <OwnerSelect data={data} {...form.register("to_owner_id")} />
            </Field>
            <Field label="Importo" error={form.formState.errors.amount?.message}>
              <Input type="number" step="0.01" {...form.register("amount")} />
            </Field>
            <Field label="Data" error={form.formState.errors.transfer_date?.message}>
              <Input type="date" {...form.register("transfer_date")} />
            </Field>
            <Field label="Metodo" error={form.formState.errors.method?.message}>
              <Select {...form.register("method")}>
                <option value="bonifico">Bonifico</option>
                <option value="contanti">Contanti</option>
                <option value="assegno">Assegno</option>
                <option value="altro">Altro</option>
              </Select>
            </Field>
          </div>
          <Field label="Note" error={form.formState.errors.notes?.message}>
            <Input {...form.register("notes")} />
          </Field>
    </EntityForm>
  );
}

function OwnerSelect({
  data,
  ...props
}: ComponentProps<"select"> & { data: Data }) {
  return (
    <Select {...props}>
      <option value="">Seleziona</option>
      {data.owners.map((owner) => (
        <option key={owner.id} value={owner.id}>
          {owner.first_name} {owner.last_name}
        </option>
      ))}
    </Select>
  );
}
