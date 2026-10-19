"use server";

import { revalidatePath } from "next/cache";

import { adjustStock } from "@/lib/services/inventory/adjust-stock";

import { findProductByBarcode } from "@/lib/services/inventory/find-product-by-barcode";
import { receiveStock } from "@/lib/services/inventory/receive-stock";
import {
  barcodeLookupSchema,
  receiveStockSchema, adjustStockSchema,
} from "@/lib/validations/inventory";

export type BarcodeLookupState = {
  success: boolean;
  message: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    stockQuantity: number;
  };
};

export type AdjustStockState = {
  success?: boolean;
  message?: string;
};

export async function adjustStockAction(
  _previousState: AdjustStockState,
  formData: FormData
): Promise<AdjustStockState> {
  const parsed =
    adjustStockSchema.safeParse({
      productId:
        formData.get("productId"),

      newStockQuantity:
        formData.get(
          "newStockQuantity"
        ),

      note:
        formData.get("note") ?? "",
    });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]
          ?.message ??
        "Please check the adjustment.",
    };
  }

  const result = await adjustStock(
    parsed.data
  );

  if (!result.success) {
    if (result.reason === "FORBIDDEN") {
      return {
        success: false,
        message:
          "Only administrators can adjust stock.",
      };
    }

    if (
      result.reason ===
      "PRODUCT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "Product could not be found.",
      };
    }

    if (
      result.reason ===
      "NO_STOCK_CHANGE"
    ) {
      return {
        success: false,
        message:
          "The new stock quantity is the same as the current stock.",
      };
    }

    if (
      result.reason ===
      "STOCK_CHANGED"
    ) {
      return {
        success: false,
        message:
          "Stock changed while you were making this adjustment. Please check the current stock and try again.",
      };
    }

    return {
      success: false,
      message:
        "Stock could not be adjusted.",
    };
  }

  revalidatePath("/inventory");
  revalidatePath("/products");
  revalidatePath("/sales");
  revalidatePath("/");

  return {
    success: true,
    message: `Stock adjusted successfully. New stock: ${result.stockAfter}.`,
  };
}

export type ReceiveStockState = {
  success: boolean;
  message: string;
};

export async function lookupBarcodeAction(
  _previousState: BarcodeLookupState,
  formData: FormData
): Promise<BarcodeLookupState> {
  const parsed = barcodeLookupSchema.safeParse({
    barcode: formData.get("barcode") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid barcode.",
    };
  }

  const product =
    await findProductByBarcode(
      parsed.data.barcode
    );

  if (!product) {
    return {
      success: false,
      message:
        "No active product was found with this barcode.",
    };
  }

  return {
    success: true,
    message: "Product found.",
    product: {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      stockQuantity:
        product.stockQuantity,
    },
  };
}

export async function receiveStockAction(
  _previousState: ReceiveStockState,
  formData: FormData
): Promise<ReceiveStockState> {
  const parsed = receiveStockSchema.safeParse({
    productId:
      formData.get("productId") ?? "",
    quantity:
      formData.get("quantity") ?? "",
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid stock receipt.",
    };
  }

  const result = await receiveStock(
    parsed.data
  );

  if (!result.success) {
    switch (result.reason) {
      case "PRODUCT_NOT_FOUND":
        return {
          success: false,
          message:
            "The product could not be found.",
        };

      case "INVALID_QUANTITY":
        return {
          success: false,
          message:
            "Quantity must be a positive whole number.",
        };

      case "INVALID_NOTE":
        return {
          success: false,
          message:
            "The note is invalid.",
        };
    }
  }

  revalidatePath("/inventory");
  revalidatePath("/products");
  revalidatePath("/sales");
  revalidatePath("/");

  return {
    success: true,
    message: `Stock received successfully. New stock: ${result.stockAfter}.`,
  };
}