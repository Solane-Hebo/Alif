"use server";

import { revalidatePath } from "next/cache";

import { createProduct } from "@/lib/services/products/create-product";
import { createProductSchema } from "@/lib/validations/product";
import { getTenantContext } from "@/lib/auth/tenant";

export type CreateProductState = {
  success?: boolean;
  error?: string;
};

export async function createProductAction(
  _previousState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const { role } =
    await getTenantContext();

  /*
   * Never trust purchasePrice from the browser
   * for STAFF.
   *
   * Even if a STAFF user manually adds a
   * purchasePrice field to the request, it is
   * ignored and replaced with 0.
   */
  const purchasePrice =
    role === "ADMIN"
      ? formData.get("purchasePrice")
      : "0";

  const parsed =
    createProductSchema.safeParse({
      name: formData.get("name"),

      sku: formData.get("sku"),

      barcode:
        formData.get("barcode") ?? "",

      category:
        formData.get("category") ?? "",

      description:
        formData.get("description") ?? "",

      purchasePrice,

      sellingPrice:
        formData.get("sellingPrice"),

      stockQuantity:
        formData.get("stockQuantity"),

      lowStockThreshold:
        formData.get(
          "lowStockThreshold"
        ),
    });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the product information.",
    };
  }

  const result = await createProduct(
    parsed.data
  );

  if (!result.success) {
    if (result.reason === "SKU_EXISTS") {
      return {
        error:
          "A product with this SKU already exists.",
      };
    }

    if (
      result.reason === "BARCODE_EXISTS"
    ) {
      return {
        error:
          "A product with this barcode already exists.",
      };
    }

    if (
      result.reason ===
      "DUPLICATE_PRODUCT"
    ) {
      return {
        error:
          "A product with this SKU or barcode already exists.",
      };
    }

    return {
      error:
        "The product could not be created.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/sales");
  revalidatePath("/");

  return {
    success: true,
  };
}