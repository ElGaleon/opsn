import { z } from "zod";
import { contractSchema } from "@shared/schemas/forms";

export type ContractFormValues = z.infer<typeof contractSchema>;
