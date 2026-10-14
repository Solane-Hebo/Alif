import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function getInventoryStats() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  await connectToDatabase();

  const organizationObjectId =
    new mongoose.Types.ObjectId(
      organizationId
    );

  /*
   * STAFF only receives operational
   * inventory statistics.
   *
   * purchasePrice is not referenced.
   */
  if (role !== "ADMIN") {
    const result =
      await Product.aggregate([
        {
          $match: {
            organizationId:
              organizationObjectId,
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,

            totalProducts: {
              $sum: 1,
            },

            lowStockItems: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      "$stockQuantity",
                      "$lowStockThreshold",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const stats = result[0] ?? {
      totalProducts: 0,
      lowStockItems: 0,
    };

    return {
      totalProducts:
        stats.totalProducts,

      lowStockItems:
        stats.lowStockItems,

      canViewInventoryValue:
        false as const,
    };
  }

  /*
   * ADMIN may calculate inventory value
   * using the internal purchase price.
   */
  const result =
    await Product.aggregate([
      {
        $match: {
          organizationId:
            organizationObjectId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1,
          },

          lowStockItems: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    "$stockQuantity",
                    "$lowStockThreshold",
                  ],
                },
                1,
                0,
              ],
            },
          },

          inventoryValue: {
            $sum: {
              $multiply: [
                "$purchasePrice",
                "$stockQuantity",
              ],
            },
          },
        },
      },
    ]);

  const stats = result[0] ?? {
    totalProducts: 0,
    lowStockItems: 0,
    inventoryValue: 0,
  };

  return {
    totalProducts:
      stats.totalProducts,

    lowStockItems:
      stats.lowStockItems,

    inventoryValue:
      stats.inventoryValue,

    canViewInventoryValue:
      true as const,
  };
}