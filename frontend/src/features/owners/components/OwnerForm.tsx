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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          {isEditing ? "Dettaglio proprietario" : "Nuovo proprietario"}
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
          <Field label="Nome">
            <Input {...form.register("first_name")} />
          </Field>
          <Field label="Cognome">
            <Input {...form.register("last_name")} />
          </Field>
          <Field label="Codice fiscale">
            <Input {...form.register("tax_code")} />
          </Field>
          <Field label="Contatti">
            <Input {...form.register("contacts")} />
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
