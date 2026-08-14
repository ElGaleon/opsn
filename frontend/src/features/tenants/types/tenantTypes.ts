import { z } from "zod";
import { tenantSchema } from "@shared/schemas/forms";

export type TenantFormValues = z.infer<typeof tenantSchema>;
