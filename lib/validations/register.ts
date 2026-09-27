import { z } from "zod";

export const registerSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters.")
      .max(120, "Company name is too long."),

    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name is too long."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password is too long."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;