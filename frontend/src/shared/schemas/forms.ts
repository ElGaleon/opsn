import { z } from "zod";

const optionalCoordinate = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    schema.optional(),
  );

export const propertySchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  street: z.string().optional(),
  street_number: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  latitude: optionalCoordinate(z.coerce.number().min(-90).max(90)),
  longitude: optionalCoordinate(z.coerce.number().min(-180).max(180)),
  purchase_value: z.coerce.number().min(0),
  mortgage: z.coerce.number().min(0),
  condo_fees: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export const unitSchema = z.object({
  property_id: z.string().min(1),
  name: z.string().min(2),
  unit_type: z.enum(["apartment", "garage", "room", "commercial", "other"]),
  notes: z.string().optional(),
});

export const movementSchema = z.object({
  property_id: z.string().optional(),
  unit_id: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(2),
  description: z.string().min(3),
  amount: z.coerce.number().positive(),
  accrual_date: z.string().min(10),
  due_date: z.string().optional(),
  payment_date: z.string().optional(),
  status: z.enum(["paid", "partial", "unpaid"]),
  allocation_mode: z.enum(["ownership", "owner", "custom"]),
  paid_by_owner_id: z.string().optional(),
  transfer_to_owner_id: z.string().optional(),
  payment_method: z.string().optional(),
  paid_amount: z.coerce.number().optional(),
});

export const ownerSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  tax_code: z.string().optional(),
  contacts: z.string().optional(),
});

export const tenantSchema = z.object({
  full_name: z.string().min(2),
  tax_code: z.string().optional(),
  contacts: z.string().optional(),
  notes: z.string().optional(),
});

export const ownerTransferSchema = z.object({
  from_owner_id: z.string().min(1),
  to_owner_id: z.string().min(1),
  amount: z.coerce.number().positive(),
  transfer_date: z.string().min(10),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export const shareSetSchema = z.object({
  valid_from: z.string().min(10),
  valid_to: z.string().optional(),
});

export const contractSchema = z.object({
  unit_id: z.string().min(1),
  tenant_id: z.string().min(1),
  starts_on: z.string().min(10),
  ends_on: z.string().optional(),
  monthly_rent: z.coerce.number().positive(),
  deposit: z.coerce.number().min(0),
  due_day: z.coerce.number().min(1).max(28),
  istat_adjustment: z.coerce.boolean(),
});

export const deadlineSchema = z.object({
  title: z.string().min(2),
  due_date: z.string().min(10),
  property_id: z.string().optional(),
  unit_id: z.string().optional(),
  status: z.string().min(2),
});
