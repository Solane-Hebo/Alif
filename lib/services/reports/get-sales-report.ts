import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";

type GetSalesReportOptions = {
  from: Date;
  to: Date;
  timezone: string;
};

export async function getSalesReport({
  from,
  to,
  timezone,
}: GetSalesReportOptions) {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  await connectToDatabase();

  const organizationObjectId =
    new mongoose.Types.ObjectId(
      organizationId
    );

  const [summaryRows, chartRows] =
    await Promise.all([
      Sale.aggregate([
        {
          $match: {
            organizationId:
              organizationObjectId,

            status: "COMPLETED",

            createdAt: {
              $gte: from,
              $lte: to,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: 1,
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

            cost: {
              $sum: {
                $multiply: [
                  "$purchasePriceAtSale",
                  "$quantity",
                ],
              },
            },
          },
        },
      ]),

      Sale.aggregate([
        {
          $match: {
            organizationId:
              organizationObjectId,

            status: "COMPLETED",

            createdAt: {
              $gte: from,
              $lte: to,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
  format: "%Y-%m-%d",
  date: "$createdAt",
  timezone,
}
            },

            revenue: {
              $sum: {
                $multiply: [
                  "$salePrice",
                  "$quantity",
                ],
              },
            },

            cost: {
              $sum: {
                $multiply: [
                  "$purchasePriceAtSale",
                  "$quantity",
                ],
              },
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

  const summary =
    summaryRows[0] ?? {
      totalSales: 0,
      unitsSold: 0,
      revenue: 0,
      cost: 0,
    };

  const profit =
    summary.revenue - summary.cost;

  const profitMargin =
    summary.revenue > 0
      ? (profit / summary.revenue) * 100
      : 0;

  return {
    success: true as const,

    summary: {
      totalSales:
        summary.totalSales,

      unitsSold:
        summary.unitsSold,

      revenue:
        summary.revenue,

      cost:
        summary.cost,

      profit,

      profitMargin,
    },

    chart: chartRows.map((row) => ({
      date: row._id,
      revenue: row.revenue,
      cost: row.cost,
      profit:
        row.revenue - row.cost,
    })),
  };
}