import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";
import { Sale } from "@/lib/models/sale.model";
import { StockMovement } from "@/lib/models/stock-movement.model";
import { registerSaleServiceSchema } from "@/lib/validations/sale";
type RegisterSaleData = {
  productId: string;
  quantity: number;
  salePrice: number;
};

type RegisterSaleResult =
  | {
      success: true;
      saleId: string;
    }
  | {
      success: false;
      reason:
        | "PRODUCT_NOT_FOUND"
        | "INSUFFICIENT_STOCK"
        | "INVALID_INPUT"
        | "FORBIDDEN";
    };

export async function registerSale(
  data: RegisterSaleData
): Promise<RegisterSaleResult> {
  const {
    organizationId,
    userId,
    role,
  } = await getTenantContext();

  /*
   * Only ADMIN and STAFF may
   * register sales.
   */
  if (
    role !== "ADMIN" &&
    role !== "STAFF"
  ) {
    return {
      success: false,
      reason: "FORBIDDEN",
    };
  }

  /*
   * Validate again at the service
   * boundary, not only in the action.
   */
  const parsed = registerSaleServiceSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      reason: "INVALID_INPUT",
    };
  }

  const {
    productId,
    quantity,
    salePrice,
  } = parsed.data;

  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    return {
      success: false,
      reason: "PRODUCT_NOT_FOUND",
    };
  }

  await connectToDatabase();

  const session =
    await mongoose.startSession();

  try {
    let result:
      | RegisterSaleResult
      | undefined;

    await session.withTransaction(
      async () => {
        /*
         * Atomic stock decrement.
         *
         * The $gte condition prevents
         * inventory from going below zero.
         */
        const product =
          await Product.findOneAndUpdate(
            {
              _id: productId,
              organizationId,
              isActive: true,

              stockQuantity: {
                $gte: quantity,
              },
            },
            {
              $inc: {
                stockQuantity: -quantity,
              },

              $set: {
                updatedBy: userId,
              },
            },
            {
              /*
               * Return product before
               * the stock update.
               */
              new: false,
              session,
            }
          );

        if (!product) {
          const existingProduct =
            await Product.findOne({
              _id: productId,
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
              reason: "PRODUCT_NOT_FOUND",
            };

            return;
          }

          result = {
            success: false,
            reason: "INSUFFICIENT_STOCK",
          };

          return;
        }

        const stockBefore =
          product.stockQuantity;

        const stockAfter =
          stockBefore - quantity;

        /*
         * Create sale.
         *
         * Purchase price is always
         * read from the product,
         * never from user input.
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

                quantity,

                purchasePriceAtSale:
                  product.purchasePrice,

                salePrice,

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
         * inside the same transaction.
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
                -quantity,

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