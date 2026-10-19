import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";
import { User } from "@/lib/models/user.model";

const RECENT_SALES_LIMIT = 5;

export async function getRecentSales() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  await connectToDatabase();

  /*
   * Financial purchase-cost data is
   * selected only for ADMIN.
   */
  const saleFields =
    role === "ADMIN"
      ? "_id productName productSku quantity salePrice purchasePriceAtSale status soldBy createdAt"
      : "_id productName productSku quantity salePrice status soldBy createdAt";

  const sales = await Sale.find({
    organizationId,
  })
    .select(saleFields)
    .sort({ createdAt: -1 })
    .limit(RECENT_SALES_LIMIT)
    .lean();

  const sellerIds = [
    ...new Set(
      sales.map((sale) =>
        sale.soldBy.toString()
      )
    ),
  ];

  const sellers =
    sellerIds.length > 0
      ? await User.find({
          _id: {
            $in: sellerIds,
          },
          organizationId,
        })
          .select("_id name")
          .lean()
      : [];

  const sellerMap = new Map(
    sellers.map((seller) => [
      seller._id.toString(),
      seller.name,
    ])
  );

  return sales.map((sale) => {
    const revenue =
      sale.salePrice *
      sale.quantity;

    const baseSale = {
      id: sale._id.toString(),

      productName:
        sale.productName,

      productSku:
        sale.productSku,

      quantity:
        sale.quantity,

      revenue,

      status:
        sale.status,

      soldByName:
        sellerMap.get(
          sale.soldBy.toString()
        ) ?? "Unknown user",

      createdAt:
        sale.createdAt.toISOString(),
    };

    /*
     * STAFF receives operational
     * information only.
     */
    if (role !== "ADMIN") {
      return {
        ...baseSale,
        canViewFinancials: false as const,
      };
    }

    const purchasePriceAtSale =
      sale.purchasePriceAtSale!;

    const cost =
      purchasePriceAtSale *
      sale.quantity;

    const profit =
      revenue - cost;

    return {
      ...baseSale,

      canViewFinancials: true as const,

      cost,
      profit,
    };
  });
}