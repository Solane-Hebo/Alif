import { z } from "zod";

export const barcodeLookupSchema =
  z.object({
    barcode: z
      .string()
      .trim()
      .min(
        1,
        "Scan or enter a barcode."
      )
      .max(
        64,
        "Barcode is too long."
      ),
  });

export const receiveStockSchema =
  z.object({
    productId: z
      .string()
      .trim()
      .min(
        1,
        "Product is required."
      ),

    quantity: z.coerce
      .number()
      .int(
        "Quantity must be a whole number."
      )
      .min(
        1,
        "Quantity must be at least 1."
      ),

    note: z
      .string()
      .trim()
      .max(
        500,
        "Note is too long."
      )
      .default(""),
  });

  export const adjustStockSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product is required."),

  newStockQuantity: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),

  note: z
    .string()
    .trim()
    .min(
      3,
      "A reason for the adjustment is required."
    )
    .max(
      500,
      "Reason cannot exceed 500 characters."
    ),
});