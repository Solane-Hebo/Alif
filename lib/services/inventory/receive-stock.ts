import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";
import { StockMovement } from "@/lib/models/stock-movement.model";

type ReceiveStockData = {
  productId: string;
  quantity: number;
  note?: string;
};

export async function receiveStock(
  data: ReceiveStockData
) {
  const {
    organizationId,
    userId,
  } = await getTenantContext();

  if (
    !mongoose.Types.ObjectId.isValid(
      data.productId
    )
  ) {
    return {
      success: false as const,
      reason: "PRODUCT_NOT_FOUND" as const,
    };
  }

  if (
    !Number.isInteger(data.quantity) ||
    data.quantity <= 0
  ) {
    return {
      success: false as const,
      reason: "INVALID_QUANTITY" as const,
    };
  }

  const note = data.note?.trim() ?? "";

  if (note.length > 500) {
    return {
      success: false as const,
      reason: "INVALID_NOTE" as const,
    };
  }

  await connectToDatabase();

  const session =
    await mongoose.startSession();

  try {
    let updatedStock: number | null = null;

    await session.withTransaction(
      async () => {
        /*
         * findOneAndUpdate gives us an atomic
         * stock increase.
         *
         * returnDocument: "before" means the
         * returned product contains the stock
         * value immediately before this receipt.
         */
        const product =
          await Product.findOneAndUpdate(
            {
              _id: data.productId,
              organizationId,
              isActive: true,
            },
            {
              $inc: {
                stockQuantity: data.quantity,
              },
              $set: {
                updatedBy: userId,
              },
            },
            {
              returnDocument: "before",
              session,
              runValidators: true,
            }
          );

        if (!product) {
          throw new Error(
            "PRODUCT_NOT_FOUND"
          );
        }

        const stockBefore =
          product.stockQuantity;

        const stockAfter =
          stockBefore + data.quantity;

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

              type: "RECEIPT",

              quantityChange:
                data.quantity,

              stockBefore,
              stockAfter,

              saleId: null,

              performedBy: userId,

              note,
            },
          ],
          {
            session,
          }
        );

        updatedStock = stockAfter;
      }
    );

    return {
      success: true as const,
      stockAfter: updatedStock,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "PRODUCT_NOT_FOUND"
    ) {
      return {
        success: false as const,
        reason:
          "PRODUCT_NOT_FOUND" as const,
      };
    }

    throw error;
  } finally {
    await session.endSession();
  }
}