import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";

export async function getDashboardStats() {
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
   * STAFF only needs operational sales
   * statistics.
   *
   * purchasePriceAtSale is not referenced
   * anywhere in the STAFF aggregation.
   */
  if (role !== "ADMIN") {
    const result = await Sale.aggregate([
      {
        $match: {
          organizationId:
            organizationObjectId,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,

          totalSales: {
            $sum: 1,
          },

          totalRevenue: {
            $sum: {
              $multiply: [
                "$salePrice",
                "$quantity",
              ],
            },
          },
        },
      },
    ]);

    const stats = result[0] ?? {
      totalSales: 0,
      totalRevenue: 0,
    };

    return {
      totalSales:
        stats.totalSales,

      totalRevenue:
        stats.totalRevenue,

      canViewFinancials:
        false as const,
    };
  }

  /*
   * ADMIN aggregation includes internal
   * purchase-cost information.
   */
  const result = await Sale.aggregate([
    {
      $match: {
        organizationId:
          organizationObjectId,
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: null,

        totalSales: {
          $sum: 1,
        },

        totalRevenue: {
          $sum: {
            $multiply: [
              "$salePrice",
              "$quantity",
            ],
          },
        },

        totalCost: {
          $sum: {
            $multiply: [
              "$purchasePriceAtSale",
              "$quantity",
            ],
          },
        },
      },
    },
  ]);

  const stats = result[0] ?? {
    totalSales: 0,
    totalRevenue: 0,
    totalCost: 0,
  };

  const totalProfit =
    stats.totalRevenue -
    stats.totalCost;

  return {
    totalSales:
      stats.totalSales,

    totalRevenue:
      stats.totalRevenue,

    totalCost:
      stats.totalCost,

    totalProfit,

    canViewFinancials:
      true as const,
  };
}