"use server";

import { revalidatePath } from "next/cache";

import { registerSale } from "@/lib/services/sales/register-sale";
import { voidSale } from "@/lib/services/sales/void-sale";
import { findSaleProductByBarcode } from "@/lib/services/sales/find-sale-product-by-barcode";

import {
  registerSaleSchema,
  saleBarcodeLookupSchema,
} from "@/lib/validations/sale";

/* =====================================================
   REGISTER SALE
===================================================== */

export type RegisterSaleState = {
  success?: boolean;
  error?: string;
};

export async function registerSaleAction(
  _previousState: RegisterSaleState,
  formData: FormData
): Promise<RegisterSaleState> {
  const parsed = registerSaleSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    salePrice: formData.get("salePrice"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the sale information.",
    };
  }

  const result = await registerSale(parsed.data);

  if (!result.success) {
    switch (result.reason) {
      case "FORBIDDEN":
        return {
          error:
            "You do not have permission to register sales.",
        };

      case "INVALID_INPUT":
        return {
          error:
            "Please check the sale information.",
        };

      case "INSUFFICIENT_STOCK":
        return {
          error:
            "There is not enough stock for this sale.",
        };

      case "PRODUCT_NOT_FOUND":
        return {
          error:
            "The selected product could not be found.",
        };
    }
  }

  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/");

  return {
    success: true,
  };
}

/* =====================================================
   VOID SALE
===================================================== */

export type VoidSaleState = {
  success?: boolean;
  error?: string;
};

export async function voidSaleAction(
  _previousState: VoidSaleState,
  formData: FormData
): Promise<VoidSaleState> {
  const saleId = formData.get("saleId");

  if (
    typeof saleId !== "string" ||
    !saleId
  ) {
    return {
      error: "Invalid sale.",
    };
  }

  const result = await voidSale(saleId);

  if (!result.success) {
    if (result.reason === "FORBIDDEN") {
      return {
        error:
          "You do not have permission to void sales.",
      };
    }

    if (result.reason === "ALREADY_VOIDED") {
      return {
        error:
          "This sale has already been voided.",
      };
    }

    return {
      error:
        "Sale could not be found.",
    };
  }

  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/");

  return {
    success: true,
  };
}

/* =====================================================
   BARCODE LOOKUP
===================================================== */

export type SaleBarcodeLookupState = {
  success?: boolean;
  message?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    stockQuantity: number;
    sellingPrice: number;
  };
};

export async function lookupSaleBarcodeAction(
  _previousState: SaleBarcodeLookupState,
  formData: FormData
): Promise<SaleBarcodeLookupState> {
  const parsed =
    saleBarcodeLookupSchema.safeParse({
      barcode: formData.get("barcode"),
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
    await findSaleProductByBarcode(
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
    message: "",
    product,
  };
}