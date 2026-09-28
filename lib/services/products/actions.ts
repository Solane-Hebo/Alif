"use server";

import { revalidatePath } from "next/cache";

import { createProduct } from "@/lib/services/products/create-product";
import { createProductSchema } from "@/lib/validations/product";

export type CreateProductState = {
  success?: boolean;
  error?: string;
};

export async function createProductAction(
  _previousState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category") ?? "",
    description:
      formData.get("description") ?? "",

    purchasePrice:
      formData.get("purchasePrice"),

    sellingPrice:
      formData.get("sellingPrice"),

    stockQuantity:
      formData.get("stockQuantity"),

    lowStockThreshold:
      formData.get("lowStockThreshold"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the product information.",
    };
  }

  const result = await createProduct(parsed.data);

  if (!result.success) {
    return {
      error:
        "A product with this SKU already exists.",
    };
  }

  revalidatePath("/products");

  return {
    success: true,
  };
}