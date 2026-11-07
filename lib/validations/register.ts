import { z } from "zod";

export const registerSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(1, "Company name is required.")
      .min(2, "Company name must be at least 2 characters.")
      .max(120, "Company name is too long."),

    name: z
      .string()
      .trim()
      .min(1, "Your name is required.")
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name is too long."),

    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address.")
      .toLowerCase(),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(3, "Please select a valid currency."),

    locale: z
      .string()
      .trim()
      .min(2, "Please select a regional format.")
      .max(35, "Regional format is too long."),

    timezone: z
      .string()
      .trim()
      .min(1, "Please select a timezone.")
      .max(100, "Timezone is too long."),

    calendar: z.enum(["gregory", "ethiopic"], {
      message: "Please select a valid calendar.",
    }),

    password: z
      .string()
      .min(1, "Password is required.")
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password is too long."),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;