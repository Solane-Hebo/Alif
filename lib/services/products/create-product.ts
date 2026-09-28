import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { getTenantContext } from "@/lib/auth/tenant";
import { Product } from "@/lib/models/product.model";

type CreateProductData = {
  name: string;
  sku: string;
  category: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

export async function createProduct(
  data: CreateProductData
) {
  const { organizationId, userId } =
    await getTenantContext();

  await connectToDatabase();

  const existingProduct = await Product.exists({
    organizationId,
    sku: data.sku,
  });

  if (existingProduct) {
    return {
      success: false as const,
      reason: "SKU_EXISTS" as const,
    };
  }

  try {
    const product = await Product.create({
      organizationId,

      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,

      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,

      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,

      isActive: true,

      createdBy: userId,
      updatedBy: userId,
    });

    return {
      success: true as const,
      productId: product._id.toString(),
    };
  } catch (error) {
    /*
     * MongoDB duplicate-key protection.
     * This also handles two simultaneous requests
     * attempting to create the same SKU.
     */
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Error & { code?: number }).code === 11000
    ) {
      return {
        success: false as const,
        reason: "SKU_EXISTS" as const,
      };
    }

    throw error;
  }
}