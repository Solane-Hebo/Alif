import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";

const TOP_PRODUCTS_LIMIT = 5;

export async function getTopSellingProducts() {
  const { organizationId, role } =
    await getTenantContext();

  await connectToDatabase();

  const organizationObjectId =
    new mongoose.Types.ObjectId(organizationId);

  /*
   * STAFF:
   * Only operational sales statistics.
   * No revenue, cost or profit.
   */
  if (role !== "ADMIN") {
    const products = await Sale.aggregate([
      {
        $match: {
          organizationId: organizationObjectId,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: {
            productName: "$productName",
            productSku: "$productSku",
          },

          unitsSold: {
            $sum: "$quantity",
          },

          salesCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          unitsSold: -1,
          salesCount: -1,
        },
      },
      {
        $limit: TOP_PRODUCTS_LIMIT,
      },
    ]);

    return products.map((product, index) => ({
      rank: index + 1,

      productName: product._id.productName,
      productSku: product._id.productSku,

      unitsSold: product.unitsSold,
      salesCount: product.salesCount,

      canViewFinancials: false as const,
    }));
  }

  /*
   * ADMIN:
   * Operational statistics and revenue.
   */
  const products = await Sale.aggregate([
    {
      $match: {
        organizationId: organizationObjectId,
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          productName: "$productName",
          productSku: "$productSku",
        },

        unitsSold: {
          $sum: "$quantity",
        },

        revenue: {
          $sum: {
            $multiply: [
              "$salePrice",
              "$quantity",
            ],
          },
        },

        salesCount: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        unitsSold: -1,
        revenue: -1,
      },
    },
    {
      $limit: TOP_PRODUCTS_LIMIT,
    },
  ]);

  return products.map((product, index) => ({
    rank: index + 1,

    productName: product._id.productName,
    productSku: product._id.productSku,

    unitsSold: product.unitsSold,
    salesCount: product.salesCount,

    revenue: product.revenue,

    canViewFinancials: true as const,
  }));
}