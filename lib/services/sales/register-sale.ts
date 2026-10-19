import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";
import { Sale } from "@/lib/models/sale.model";
import { StockMovement } from "@/lib/models/stock-movement.model";

type RegisterSaleData = {
  productId: string;
  quantity: number;
  salePrice: number;
};

export async function registerSale(
  data: RegisterSaleData
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
      reason:
        "PRODUCT_NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  const session =
    await mongoose.startSession();

  try {
    let result:
      | {
          success: true;
          saleId: string;
        }
      | {
          success: false;
          reason:
            | "PRODUCT_NOT_FOUND"
            | "INSUFFICIENT_STOCK";
        }
      | undefined;

    await session.withTransaction(
      async () => {
        /*
         * Atomic stock decrement.
         *
         * The $gte condition prevents the
         * inventory from going below zero.
         */
        const product =
          await Product.findOneAndUpdate(
            {
              _id: data.productId,
              organizationId,
              isActive: true,

              stockQuantity: {
                $gte: data.quantity,
              },
            },
            {
              $inc: {
                stockQuantity:
                  -data.quantity,
              },

              $set: {
                updatedBy: userId,
              },
            },
            {
              /*
               * We want the product BEFORE
               * the stock update so we can
               * calculate stockBefore and
               * stockAfter reliably.
               */
              new: false,
              session,
            }
          );

        if (!product) {
          const existingProduct =
            await Product.findOne({
              _id: data.productId,
              organizationId,
              isActive: true,
            })
              .select(
                "_id stockQuantity"
              )
              .session(session);

          if (!existingProduct) {
            result = {
              success: false,
              reason:
                "PRODUCT_NOT_FOUND",
            };

            return;
          }

          result = {
            success: false,
            reason:
              "INSUFFICIENT_STOCK",
          };

          return;
        }

        const stockBefore =
          product.stockQuantity;

        const stockAfter =
          stockBefore -
          data.quantity;

        /*
         * Create the sale.
         */
        const sales =
          await Sale.create(
            [
              {
                organizationId,

                productId:
                  product._id,

                productName:
                  product.name,

                productSku:
                  product.sku,

                quantity:
                  data.quantity,

                purchasePriceAtSale:
                  product.purchasePrice,

                salePrice:
                  data.salePrice,

                status:
                  "COMPLETED",

                soldBy:
                  userId,
              },
            ],
            {
              session,
            }
          );

        const sale = sales[0];

        /*
         * Create inventory audit record
         * inside the SAME transaction.
         */
        await StockMovement.create(
          [
            {
              organizationId,

              productId:
                product._id,

              productName:
                product.name,

              productSku:
                product.sku,

              type: "SALE",

              quantityChange:
                -data.quantity,

              stockBefore,
              stockAfter,

              saleId:
                sale._id,

              performedBy:
                userId,

              note: "",
            },
          ],
          {
            session,
          }
        );

        result = {
          success: true,
          saleId:
            sale._id.toString(),
        };
      }
    );

    if (!result) {
      throw new Error(
        "Sale transaction completed without a result."
      );
    }

    return result;
  } finally {
    await session.endSession();
  }
}