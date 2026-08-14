import { z } from "zod";
import { ownerSchema, ownerTransferSchema } from "@shared/schemas/forms";

export type OwnerFormValues = z.infer<typeof ownerSchema>;
export type TransferFormValues = z.infer<typeof ownerTransferSchema>;
export type OwnerView =
  | { kind: "list" }
  | { kind: "balances" }
  | { kind: "transfer" }
  | { kind: "owner"; id?: string; mode?: "view" | "edit" };
