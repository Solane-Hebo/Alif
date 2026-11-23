import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";

export async function getDashboardStats() {
  const { organizationId, role } =
    await getTenantContext();

  await connectToDatabase();

  const organizationObjectId =
    new mongoose.Types.ObjectId(organizationId);

  /*
   * STAFF can only view operational statistics.
   * Revenue, cost and profit are ADMIN-only.
   */
  if (role !== "ADMIN") {
    const result = await Sale.aggregate([
      {
        $match: {
          organizationId: organizationObjectId,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: 1,
          },
        },
      },
    ]);

    const stats = result[0] ?? {
      totalSales: 0,
    };

    return {
      totalSales: stats.totalSales,
      canViewFinancials: false as const,
    };
  }

  /*
   * ADMIN can view revenue, cost and profit.
   */
  const result = await Sale.aggregate([
    {
      $match: {
        organizationId: organizationObjectId,
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
    stats.totalRevenue - stats.totalCost;

  return {
    totalSales: stats.totalSales,
    totalRevenue: stats.totalRevenue,
    totalCost: stats.totalCost,
    totalProfit,
    canViewFinancials: true as const,
  };
}