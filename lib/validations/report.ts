import { z } from "zod";

export const reportDateSchema = z.object({
  from: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Invalid start date."
    ),

  to: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Invalid end date."
    ),
});