import { z } from "zod";
import { deadlineSchema } from "@shared/schemas/forms";

export type DeadlineFormValues = z.infer<typeof deadlineSchema>;
