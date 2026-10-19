import { z } from "zod";

import { parseMoneyToMinorUnits } from "@/lib/utils/money";

export const registerSaleSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product is required."),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),

  salePrice: z
    .string()
    .trim()
    .min(1, "Sale price is required.")
    .transform((value, ctx) => {
      const amount =
        parseMoneyToMinorUnits(value);

      if (amount === null) {
        ctx.addIssue({
          code: "custom",
          message:
            "Enter a valid sale price.",
        });

        return z.NEVER;
      }

      return amount;
    }),
});

export const saleBarcodeLookupSchema = z.object({
  barcode: z
    .string()
    .trim()
    .min(1, "Enter or scan a barcode.")
    .max(64, "Barcode is too long."),
});

export type RegisterSaleInput =
  z.infer<typeof registerSaleSchema>;