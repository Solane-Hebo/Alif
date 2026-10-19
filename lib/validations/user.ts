import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Email is too long."),

  password: z
    .string()
    .min(
      12,
      "Password must be at least 12 characters."
    )
    .max(128, "Password is too long."),

  role: z.enum(["ADMIN", "STAFF"]),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  role: z.enum(["ADMIN", "STAFF"]),
});

export const userIdSchema = z.object({
  userId: z.string().min(1),
});