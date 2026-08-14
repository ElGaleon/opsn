import { z } from "zod";
import {
  propertySchema,
  shareSetSchema,
  unitSchema,
} from "@shared/schemas/forms";

export type PropertyFormValues = z.infer<typeof propertySchema>;
export type UnitFormValues = z.infer<typeof unitSchema>;
export type ShareFormValues = z.infer<typeof shareSetSchema>;
export type PropertyView =
  | { kind: "list" }
  | { kind: "property"; id?: string; mode?: "view" | "edit" }
  | { kind: "unit"; propertyId: string; id?: string; mode?: "view" | "edit" };
export type MoneyStats = {
  income: number;
  expenses: number;
  net: number;
  cashflow: number;
  arrears: number;
};
