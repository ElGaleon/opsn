import { z } from "zod";
import { movementSchema } from "@shared/schemas/forms";

export type MovementFormValues = z.infer<typeof movementSchema>;
