import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

type UpdateProductData = {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
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

  /*
   * STAFF may create products, but only
   * ADMIN may edit existing products.
   */
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

  const barcode = data.barcode.trim();

  /*
   * SKU must be unique inside the current
   * organization.
   */
  const existingSku =
    await Product.exists({
      _id: {
        $ne: data.productId,
      },
      organizationId,
      sku: data.sku,
    });

  if (existingSku) {
    return {
      success: false as const,
      reason: "SKU_EXISTS" as const,
    };
  }

  /*
   * Barcode is optional, but when present
   * it must be unique inside the tenant.
   */
  if (barcode) {
    const existingBarcode =
      await Product.exists({
        _id: {
          $ne: data.productId,
        },
        organizationId,
        barcode,
      });

    if (existingBarcode) {
      return {
        success: false as const,
        reason:
          "BARCODE_EXISTS" as const,
      };
    }
  }

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
            barcode,
            category: data.category,
            description:
              data.description,

            purchasePrice:
              data.purchasePrice,

            sellingPrice:
              data.sellingPrice,

            lowStockThreshold:
              data.lowStockThreshold,

            updatedBy: userId,
          },
        },
        {
          returnDocument: "after",
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
    /*
     * Unique MongoDB indexes remain the
     * final protection against race
     * conditions.
     */
    if (
      error instanceof Error &&
      "code" in error &&
      (
        error as Error & {
          code?: number;
          keyPattern?: Record<
            string,
            number
          >;
        }
      ).code === 11000
    ) {
      const duplicateError =
        error as Error & {
          code?: number;
          keyPattern?: Record<
            string,
            number
          >;
        };

      if (
        duplicateError.keyPattern
          ?.barcode
      ) {
        return {
          success: false as const,
          reason:
            "BARCODE_EXISTS" as const,
        };
      }

      if (
        duplicateError.keyPattern?.sku
      ) {
        return {
          success: false as const,
          reason: "SKU_EXISTS" as const,
        };
      }

      return {
        success: false as const,
        reason:
          "DUPLICATE_PRODUCT" as const,
      };
    }

    throw error;
  }
}