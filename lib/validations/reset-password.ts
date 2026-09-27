import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing."),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password is too long."),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );