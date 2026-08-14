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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          {isEditing ? "Dettaglio immobile" : "Nuovo immobile"}
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
          <Field label="Nome" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Field label="Via" error={form.formState.errors.street?.message}>
              <Input {...form.register("street")} />
            </Field>
            <Field
              label="Civico"
              error={form.formState.errors.street_number?.message}
            >
              <Input {...form.register("street_number")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr_120px]">
            <Field
              label="CAP"
              error={form.formState.errors.postal_code?.message}
            >
              <Input {...form.register("postal_code")} />
            </Field>
            <Field label="Città" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
            <Field
              label="Provincia"
              error={form.formState.errors.province?.message}
            >
              <Input {...form.register("province")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Regione"
              error={form.formState.errors.region?.message}
            >
              <Input {...form.register("region")} />
            </Field>
            <Field label="Paese" error={form.formState.errors.country?.message}>
              <Input {...form.register("country")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Latitudine"
              error={form.formState.errors.latitude?.message}
            >
              <Input
                type="number"
                step="0.000001"
                {...form.register("latitude")}
              />
            </Field>
            <Field
              label="Longitudine"
              error={form.formState.errors.longitude?.message}
            >
              <Input
                type="number"
                step="0.000001"
                {...form.register("longitude")}
              />
            </Field>
          </div>
          <Field label="Indirizzo completo">
            <Input value={addressPreview} readOnly />
          </Field>
          <Field label="Valore acquisto">
            <Input
              type="number"
              step="0.01"
              {...form.register("purchase_value")}
            />
          </Field>
          <Field label="Mutuo residuo">
            <Input type="number" step="0.01" {...form.register("mortgage")} />
          </Field>
          <Field label="Condominio mensile">
            <Input type="number" step="0.01" {...form.register("condo_fees")} />
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
