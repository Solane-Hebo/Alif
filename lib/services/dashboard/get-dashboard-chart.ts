import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization } from "@/lib/models/organization.model";
import { Sale } from "@/lib/models/sale.model";

export async function getDashboardChart() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  await connectToDatabase();

  const organizationObjectId =
    new mongoose.Types.ObjectId(
      organizationId
    );

  const organization =
    await Organization.findOne({
      _id: organizationObjectId,
      isActive: true,
    })
      .select("timezone")
      .lean();

  const timezone =
    organization?.timezone ??
    "Europe/Stockholm";

  /*
   * STAFF chart:
   * Revenue only.
   *
   * purchasePriceAtSale is never referenced.
   */
  if (role !== "ADMIN") {
    const rows = await Sale.aggregate([
      {
        $match: {
          organizationId:
            organizationObjectId,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone,
            },
          },

          revenue: {
            $sum: {
              $multiply: [
                "$salePrice",
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
    ]);

    return rows.map((row) => ({
      date: row._id,
      revenue: row.revenue,
      canViewFinancials:
        false as const,
    }));
  }

  /*
   * ADMIN chart:
   * Revenue + Cost + Profit.
   */
  const rows = await Sale.aggregate([
    {
      $match: {
        organizationId:
          organizationObjectId,
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone,
          },
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
  ]);

  return rows.map((row) => ({
    date: row._id,
    revenue: row.revenue,
    cost: row.cost,
    profit:
      row.revenue - row.cost,
    canViewFinancials:
      true as const,
  }));
}