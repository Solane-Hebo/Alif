import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";
import { StockMovement } from "@/lib/models/stock-movement.model";

type AdjustStockData = {
  productId: string;
  newStockQuantity: number;
  note: string;
};

export async function adjustStock(
  data: AdjustStockData
) {
  const {
    organizationId,
    userId,
    role,
  } = await getTenantContext();

  /*
   * Manual inventory corrections are
   * restricted to ADMIN.
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
      reason:
        "PRODUCT_NOT_FOUND" as const,
    };
  }

  if (
    !Number.isInteger(
      data.newStockQuantity
    ) ||
    data.newStockQuantity < 0
  ) {
    return {
      success: false as const,
      reason:
        "INVALID_QUANTITY" as const,
    };
  }

  const note = data.note.trim();

  if (
    note.length < 3 ||
    note.length > 500
  ) {
    return {
      success: false as const,
      reason: "INVALID_NOTE" as const,
    };
  }

  await connectToDatabase();

  const session =
    await mongoose.startSession();

  try {
    let stockAfter: number | null = null;

    await session.withTransaction(
      async () => {
        /*
         * Read the product inside the same
         * transaction used for the update.
         */
        const product =
          await Product.findOne({
            _id: data.productId,
            organizationId,
            isActive: true,
          }).session(session);

        if (!product) {
          throw new Error(
            "PRODUCT_NOT_FOUND"
          );
        }

        const stockBefore =
          product.stockQuantity;

        const quantityChange =
          data.newStockQuantity -
          stockBefore;

        /*
         * A manual adjustment that does not
         * actually change stock should not
         * create an audit movement.
         */
        if (quantityChange === 0) {
          throw new Error(
            "NO_STOCK_CHANGE"
          );
        }

        /*
         * Protect against concurrent stock
         * changes between our read and update.
         *
         * The stockBefore condition means this
         * update only succeeds if stock still
         * has the value we just read.
         */
        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id: product._id,
              organizationId,
              isActive: true,
              stockQuantity: stockBefore,
            },
            {
              $set: {
                stockQuantity:
                  data.newStockQuantity,

                updatedBy: userId,
              },
            },
            {
              returnDocument: "after",
              session,
              runValidators: true,
            }
          );

        if (!updatedProduct) {
          throw new Error(
            "STOCK_CHANGED"
          );
        }

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

              type: "ADJUSTMENT",

              quantityChange,

              stockBefore,

              stockAfter:
                data.newStockQuantity,

              saleId: null,

              performedBy: userId,

              note,
            },
          ],
          {
            session,
          }
        );

        stockAfter =
          data.newStockQuantity;
      }
    );

    return {
      success: true as const,
      stockAfter,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "PRODUCT_NOT_FOUND"
      ) {
        return {
          success: false as const,
          reason:
            "PRODUCT_NOT_FOUND" as const,
        };
      }

      if (
        error.message ===
        "NO_STOCK_CHANGE"
      ) {
        return {
          success: false as const,
          reason:
            "NO_STOCK_CHANGE" as const,
        };
      }

      if (
        error.message ===
        "STOCK_CHANGED"
      ) {
        return {
          success: false as const,
          reason:
            "STOCK_CHANGED" as const,
        };
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
}