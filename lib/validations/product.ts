import { z } from "zod";

import { parseMoneyToMinorUnits } from "@/lib/utils/money";

const moneySchema = z
  .string()
  .trim()
  .min(1, "Price is required.")
  .transform((value, ctx) => {
    const amount =
      parseMoneyToMinorUnits(value);

    if (amount === null) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid price.",
      });

      return z.NEVER;
    }

    return amount;
  });

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(150, "Product name is too long."),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(80, "SKU is too long.")
    .transform((value) => value.toUpperCase()),

  category: z
    .string()
    .trim()
    .max(100, "Category is too long."),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long."),

  purchasePrice: moneySchema,

  sellingPrice: moneySchema,

  stockQuantity: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),

  lowStockThreshold: z.coerce
    .number()
    .int("Low stock threshold must be a whole number.")
    .min(
      0,
      "Low stock threshold cannot be negative."
    ),
});

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;