import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";
import { Sale } from "@/lib/models/sale.model";
import { StockMovement } from "@/lib/models/stock-movement.model";

export async function voidSale(
  saleId: string
) {
  const {
    organizationId,
    userId,
    role,
  } = await getTenantContext();

  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      saleId
    )
  ) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  const session =
    await mongoose.startSession();

  try {
    let result:
      | {
          success: true;
        }
      | {
          success: false;
          reason:
            | "NOT_FOUND"
            | "ALREADY_VOIDED";
        }
      | undefined;

    await session.withTransaction(
      async () => {
        /*
         * Claim the completed sale.
         *
         * A sale that is already VOIDED
         * cannot restore stock again.
         */
        const sale =
          await Sale.findOneAndUpdate(
            {
              _id: saleId,
              organizationId,
              status: "COMPLETED",
            },
            {
              $set: {
                status: "VOIDED",
                voidedBy: userId,
                voidedAt: new Date(),
              },
            },
            {
              new: false,
              session,
            }
          );

        if (!sale) {
          const existingSale =
            await Sale.findOne({
              _id: saleId,
              organizationId,
            })
              .select("_id status")
              .session(session);

          if (!existingSale) {
            result = {
              success: false,
              reason: "NOT_FOUND",
            };

            return;
          }

          result = {
            success: false,
            reason:
              "ALREADY_VOIDED",
          };

          return;
        }

        /*
         * Restore inventory.
         *
         * new:false returns the product
         * before the increment.
         */
        const product =
          await Product.findOneAndUpdate(
            {
              _id: sale.productId,
              organizationId,
            },
            {
              $inc: {
                stockQuantity:
                  sale.quantity,
              },

              $set: {
                updatedBy:
                  userId,
              },
            },
            {
              new: false,
              session,
              runValidators: true,
            }
          );

        if (!product) {
          /*
           * Throwing here aborts the entire
           * transaction, including changing
           * the Sale to VOIDED.
           */
          throw new Error(
            "Product for sale could not be found."
          );
        }

        const stockBefore =
          product.stockQuantity;

        const stockAfter =
          stockBefore +
          sale.quantity;

        /*
         * Audit the stock restoration in
         * the SAME transaction.
         */
        await StockMovement.create(
          [
            {
              organizationId,

              productId:
                product._id,

              productName:
                sale.productName,

              productSku:
                sale.productSku,

              type:
                "SALE_VOID",

              quantityChange:
                sale.quantity,

              stockBefore,
              stockAfter,

              saleId:
                sale._id,

              performedBy:
                userId,

              note:
                "Stock restored from voided sale.",
            },
          ],
          {
            session,
          }
        );

        result = {
          success: true,
        };
      }
    );

    if (!result) {
      throw new Error(
        "Void transaction completed without a result."
      );
    }

    return result;
  } finally {
    await session.endSession();
  }
}