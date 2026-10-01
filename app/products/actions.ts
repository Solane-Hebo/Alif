"use server";

import { revalidatePath } from "next/cache";

import { archiveProduct } from "@/lib/services/products/archive-product";
import { createProduct } from "@/lib/services/products/create-product";
import { updateProduct } from "@/lib/services/products/update-product";

import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product";

export type CreateProductState = {
  success?: boolean;
  error?: string;
};

export type UpdateProductState = {
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

  const result =
    await createProduct(parsed.data);

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

export async function updateProductAction(
  _previousState: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
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

  const result =
    await updateProduct(parsed.data);

  if (!result.success) {
    if (result.reason === "SKU_EXISTS") {
      return {
        error:
          "A product with this SKU already exists.",
      };
    }

    if (result.reason === "FORBIDDEN") {
      return {
        error:
          "You do not have permission to edit products.",
      };
    }

    return {
      error:
        "Product could not be found.",
    };
  }

  revalidatePath("/products");

  return {
    success: true,
  };
}

export async function archiveProductAction(
  formData: FormData
) {
  const productId =
    formData.get("productId");

  if (
    typeof productId !== "string" ||
    !productId
  ) {
    return;
  }

  await archiveProduct(productId);

  revalidatePath("/products");
}