import { z } from "zod";

const requiredText = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} obbligatorio`);

const requiredDate = (label: string) =>
  z.string().min(10, `${label} obbligatoria`);

const optionalNumber = () =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().optional(),
  );

export const propertySchema = z.object({
  name: requiredText("Nome", 2),
  address: z.string().optional(),
  street: z.string().optional(),
  street_number: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  purchase_value: z.coerce.number().min(0, "Valore acquisto non valido"),
  mortgage: z.coerce.number().min(0, "Mutuo residuo non valido"),
  condo_fees: z.coerce.number().min(0, "Condominio mensile non valido"),
  notes: z.string().optional(),
});

export const unitSchema = z.object({
  property_id: requiredText("Immobile"),
  name: requiredText("Nome unità", 2),
  unit_type: z.enum(["apartment", "garage", "room", "commercial", "other"]),
  notes: z.string().optional(),
});

export const movementSchema = z.object({
  property_id: z.string().optional(),
  unit_id: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  category: requiredText("Categoria", 2),
  description: requiredText("Descrizione", 3),
  amount: z.coerce.number().positive("Importo obbligatorio"),
  accrual_date: requiredDate("Data competenza"),
  due_date: z.string().optional(),
  payment_date: z.string().optional(),
  status: z.enum(["paid", "partial", "unpaid"]),
  allocation_mode: z.enum(["ownership", "owner", "custom"]),
  paid_by_owner_id: z.string().optional(),
  transfer_to_owner_id: z.string().optional(),
  payment_method: z.string().optional(),
  paid_amount: optionalNumber(),
}).superRefine((values, ctx) => {
  if (values.type === "transfer" && !values.paid_by_owner_id) {
    ctx.addIssue({ code: "custom", path: ["paid_by_owner_id"], message: "Proprietario di partenza obbligatorio" });
  }
  if (values.type === "transfer" && !values.transfer_to_owner_id) {
    ctx.addIssue({ code: "custom", path: ["transfer_to_owner_id"], message: "Proprietario destinatario obbligatorio" });
  }
  if (values.status === "partial" && (!values.paid_amount || values.paid_amount <= 0 || values.paid_amount >= values.amount)) {
    ctx.addIssue({ code: "custom", path: ["paid_amount"], message: "Indica un importo parziale valido" });
  }
});

export const ownerSchema = z.object({
  first_name: requiredText("Nome", 2),
  last_name: requiredText("Cognome", 2),
  tax_code: z.string().optional(),
  contacts: z.string().optional(),
});

export const tenantSchema = z.object({
  full_name: requiredText("Nome completo", 2),
  tax_code: z.string().optional(),
  contacts: z.string().optional(),
  notes: z.string().optional(),
});

export const ownerTransferSchema = z.object({
  from_owner_id: requiredText("Proprietario di partenza"),
  to_owner_id: requiredText("Proprietario destinatario"),
  amount: z.coerce.number().positive("Importo obbligatorio"),
  transfer_date: requiredDate("Data trasferimento"),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export const shareSetSchema = z.object({
  valid_from: requiredDate("Data inizio"),
  valid_to: z.string().optional(),
});

export const contractSchema = z.object({
  unit_id: requiredText("Unità"),
  tenant_id: requiredText("Inquilino"),
  starts_on: requiredDate("Data inizio"),
  ends_on: z.string().optional(),
  monthly_rent: z.coerce.number().positive("Canone obbligatorio"),
  deposit: z.coerce.number().min(0, "Deposito non valido"),
  due_day: z.coerce.number().min(1, "Giorno tra 1 e 28").max(28, "Giorno tra 1 e 28"),
  istat_adjustment: z.coerce.boolean(),
});
