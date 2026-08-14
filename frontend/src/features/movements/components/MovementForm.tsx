import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { eur } from "@shared/lib/utils";
import { Data } from "@app/types/app";
import { MovementFormValues } from "../types/movementTypes";
import { activeShares } from "../utils/movementUtils";

export function MovementForm({
  data,
  form,
  isEditing,
  customAllocations,
  onCustomAllocations,
  onBack,
  onDelete,
  onSubmit,
}: {
  data: Data;
  form: UseFormReturn<MovementFormValues>;
  isEditing: boolean;
  customAllocations: Record<string, number>;
  onCustomAllocations: (values: Record<string, number>) => void;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: MovementFormValues) => void;
}) {
  const propertyId = form.watch("property_id");
  const unitId = form.watch("unit_id");
  const amount = Number(form.watch("amount") || 0);
  const allocationMode = form.watch("allocation_mode");
  const movementType = form.watch("type");
  const movementStatus = form.watch("status");
  const units = data.units.filter((unit) => unit.property_id === propertyId);
  const ownershipPreview = activeShares(data, propertyId, unitId).map(
    (share) => ({
      owner: data.owners.find((owner) => owner.id === share.owner_id),
      percentage: Number(share.percentage),
    }),
  );
  const customTotal = Object.values(customAllocations).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          {isEditing ? "Dettaglio movimento" : "Nuovo movimento"}
        </CardTitle>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Indietro
        </Button>
      </CardHeader>
      <CardContent>
        <form
          className="max-w-2xl space-y-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {movementType !== "transfer" ? (
            <Field label="Immobile">
              <Select {...form.register("property_id")}>
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          {movementType !== "transfer" ? (
            <Field label="Unità">
              <Select {...form.register("unit_id")}>
                <option value="">Immobile intero</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <Select {...form.register("type")}>
                <option value="income">Entrata</option>
                <option value="expense">Uscita</option>
                <option value="transfer">Trasferimento proprietari</option>
              </Select>
            </Field>
            {movementType !== "transfer" ? (
              <Field label="Stato">
                <Select {...form.register("status")}>
                  <option value="paid">Pagato</option>
                  <option value="partial">Parziale</option>
                  <option value="unpaid">Non pagato</option>
                </Select>
              </Field>
            ) : null}
          </div>
          <Field label="Categoria">
            <Input {...form.register("category")} />
          </Field>
          <Field label="Descrizione">
            <Input {...form.register("description")} />
          </Field>
          <Field label="Importo">
            <Input type="number" step="0.01" {...form.register("amount")} />
          </Field>
          {movementStatus === "partial" ? (
            <Field
              label={
                movementType === "income"
                  ? "Importo incassato"
                  : "Importo pagato"
              }
            >
              <Input
                type="number"
                step="0.01"
                max={amount}
                {...form.register("paid_amount")}
              />
            </Field>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Competenza">
              <Input type="date" {...form.register("accrual_date")} />
            </Field>
            <Field label="Scadenza">
              <Input type="date" {...form.register("due_date")} />
            </Field>
            <Field label="Pagamento">
              <Input type="date" {...form.register("payment_date")} />
            </Field>
          </div>
          {movementType === "transfer" ? (
            <TransferFields data={data} form={form} />
          ) : movementStatus !== "unpaid" ? (
            <CashFields data={data} form={form} movementType={movementType} />
          ) : null}
          {movementType === "transfer" ? <PaymentMethod form={form} /> : null}
          {movementType !== "transfer" ? (
            <Field label="Ripartizione">
              <Select {...form.register("allocation_mode")}>
                <option value="ownership">Secondo quote</option>
                <option value="owner">A carico di un proprietario</option>
                <option value="custom">Personalizzata</option>
              </Select>
            </Field>
          ) : null}
          {movementType !== "transfer" && allocationMode === "ownership" ? (
            <OwnershipPreview rows={ownershipPreview} amount={amount} />
          ) : null}
          {movementType !== "transfer" &&
          allocationMode === "owner" &&
          movementStatus === "unpaid" ? (
            <OwnerCharge data={data} form={form} />
          ) : null}
          {movementType !== "transfer" && allocationMode === "custom" ? (
            <CustomAllocations
              data={data}
              values={customAllocations}
              total={customTotal}
              onChange={onCustomAllocations}
            />
          ) : null}
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

function CashFields({
  data,
  form,
  movementType,
}: {
  data: Data;
  form: UseFormReturn<MovementFormValues>;
  movementType: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={movementType === "income" ? "Incassato da" : "Pagato da"}>
        <OwnerSelect data={data} {...form.register("paid_by_owner_id")} />
      </Field>
      <PaymentMethod form={form} />
    </div>
  );
}

function TransferFields({
  data,
  form,
}: {
  data: Data;
  form: UseFormReturn<MovementFormValues>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Da">
        <OwnerSelect data={data} {...form.register("paid_by_owner_id")} />
      </Field>
      <Field label="A">
        <OwnerSelect data={data} {...form.register("transfer_to_owner_id")} />
      </Field>
    </div>
  );
}

function OwnerCharge({
  data,
  form,
}: {
  data: Data;
  form: UseFormReturn<MovementFormValues>;
}) {
  return (
    <Field label="Proprietario a carico">
      <OwnerSelect data={data} {...form.register("paid_by_owner_id")} />
    </Field>
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

function PaymentMethod({ form }: { form: UseFormReturn<MovementFormValues> }) {
  return (
    <Field label="Metodo">
      <Select {...form.register("payment_method")}>
        <option value="">Seleziona</option>
        <option value="bonifico">Bonifico</option>
        <option value="contanti">Contanti</option>
        <option value="assegno">Assegno</option>
        <option value="altro">Altro</option>
      </Select>
    </Field>
  );
}

function OwnershipPreview({
  rows,
  amount,
}: {
  rows: {
    owner?: { id: string; first_name: string; last_name: string };
    percentage: number;
  }[];
  amount: number;
}) {
  return (
    <div className="rounded-md border border-zinc-200 p-3 text-sm">
      {rows.length ? (
        rows.map((row) => (
          <div key={row.owner?.id} className="flex justify-between">
            <span>
              {row.owner
                ? `${row.owner.first_name} ${row.owner.last_name}`
                : "Proprietario"}
            </span>
            <span>
              {row.percentage}% · {eur.format((amount * row.percentage) / 100)}
            </span>
          </div>
        ))
      ) : (
        <p className="text-zinc-500">
          Nessuna quota attiva trovata per questo bene.
        </p>
      )}
    </div>
  );
}

function CustomAllocations({
  data,
  values,
  total,
  onChange,
}: {
  data: Data;
  values: Record<string, number>;
  total: number;
  onChange: (values: Record<string, number>) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-zinc-200 p-3">
      {data.owners.map((owner) => (
        <div
          key={owner.id}
          className="grid grid-cols-[1fr_110px] items-center gap-3"
        >
          <span className="text-sm">
            {owner.first_name} {owner.last_name}
          </span>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={values[owner.id] ?? 0}
            onChange={(event) =>
              onChange({ ...values, [owner.id]: Number(event.target.value) })
            }
          />
        </div>
      ))}
      <p
        className={`text-right text-xs ${total === 100 ? "text-emerald-700" : "text-red-700"}`}
      >
        Totale {total}%
      </p>
    </div>
  );
}
