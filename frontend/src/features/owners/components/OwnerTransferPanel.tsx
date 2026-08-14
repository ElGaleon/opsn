import { ArrowLeft, Plus } from "lucide-react";
import { ComponentProps } from "react";
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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Trasferimento tra proprietari</CardTitle>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Indietro
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_150px_170px_150px]">
            <Field label="Da">
              <OwnerSelect data={data} {...form.register("from_owner_id")} />
            </Field>
            <Field label="A">
              <OwnerSelect data={data} {...form.register("to_owner_id")} />
            </Field>
            <Field label="Importo">
              <Input type="number" step="0.01" {...form.register("amount")} />
            </Field>
            <Field label="Data">
              <Input type="date" {...form.register("transfer_date")} />
            </Field>
            <Field label="Metodo">
              <Select {...form.register("method")}>
                <option value="bonifico">Bonifico</option>
                <option value="contanti">Contanti</option>
                <option value="assegno">Assegno</option>
                <option value="altro">Altro</option>
              </Select>
            </Field>
          </div>
          <Field label="Note">
            <Input {...form.register("notes")} />
          </Field>
          <div className="flex justify-end">
            <Button>
              <Plus size={16} /> Registra
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
