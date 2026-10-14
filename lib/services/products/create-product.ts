import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { getTenantContext } from "@/lib/auth/tenant";
import { Product } from "@/lib/models/product.model";
import { StockMovement } from "@/lib/models/stock-movement.model";

type CreateProductData = {
  name: string;
  sku: string;
  barcode: string;
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

  const barcode = data.barcode.trim();

  /*
   * These checks give the user a better error
   * message before starting the transaction.
   *
   * MongoDB unique indexes remain the final
   * protection against race conditions.
   */
  const existingSku = await Product.exists({
    organizationId,
    sku: data.sku,
  });

  if (existingSku) {
    return {
      success: false as const,
      reason: "SKU_EXISTS" as const,
    };
  }

  if (barcode) {
    const existingBarcode =
      await Product.exists({
        organizationId,
        barcode,
      });

    if (existingBarcode) {
      return {
        success: false as const,
        reason: "BARCODE_EXISTS" as const,
      };
    }
  }

  const session =
    await mongoose.startSession();

  try {
    let productId = "";

    await session.withTransaction(
      async () => {
        /*
         * Product.create() receives an array so
         * the MongoDB session can be supplied.
         */
        const [product] =
          await Product.create(
            [
              {
                organizationId,

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

                stockQuantity:
                  data.stockQuantity,

                lowStockThreshold:
                  data.lowStockThreshold,

                isActive: true,

                createdBy: userId,
                updatedBy: userId,
              },
            ],
            {
              session,
            }
          );

        productId =
          product._id.toString();

        /*
         * If the product starts with stock,
         * create the corresponding audit entry.
         *
         * We do not need a zero-value movement
         * when initial stock is 0.
         */
        if (data.stockQuantity > 0) {
          await StockMovement.create(
            [
              {
                organizationId,

                productId: product._id,

                productName:
                  product.name,

                productSku:
                  product.sku,

                productBarcode:
                  product.barcode ?? "",

                type: "INITIAL",

                quantityChange:
                  data.stockQuantity,

                stockBefore: 0,

                stockAfter:
                  data.stockQuantity,

                performedBy: userId,

                note:
                  "Initial stock when product was created.",
              },
            ],
            {
              session,
            }
          );
        }
      }
    );

    return {
      success: true as const,
      productId,
    };
  } catch (error) {
    /*
     * Unique indexes are the final protection
     * against simultaneous duplicate creation.
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
        duplicateError.keyPattern?.barcode
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
  } finally {
    await session.endSession();
  }
}