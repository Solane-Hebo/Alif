import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

type UpdateProductData = {
  productId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

export async function updateProduct(
  data: UpdateProductData
) {
  const {
    organizationId,
    userId,
    role,
  } = await getTenantContext();

  // Only ADMIN may edit products.
  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      data.productId
    )
  ) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  try {
    const product =
      await Product.findOneAndUpdate(
        {
          _id: data.productId,
          organizationId,
          isActive: true,
        },
        {
          $set: {
            name: data.name,
            sku: data.sku,
            category: data.category,
            description: data.description,
            purchasePrice:
              data.purchasePrice,
            sellingPrice:
              data.sellingPrice,
            stockQuantity:
              data.stockQuantity,
            lowStockThreshold:
              data.lowStockThreshold,
            updatedBy: userId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return {
        success: false as const,
        reason: "NOT_FOUND" as const,
      };
    }

    return {
      success: true as const,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (
        error as Error & {
          code?: number;
        }
      ).code === 11000
    ) {
      return {
        success: false as const,
        reason: "SKU_EXISTS" as const,
      };
    }

    throw error;
  }
}