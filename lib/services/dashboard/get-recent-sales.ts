import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";
import { User } from "@/lib/models/user.model";

const RECENT_SALES_LIMIT = 5;

export async function getRecentSales() {
  const { organizationId, role } =
    await getTenantContext();

  await connectToDatabase();

  /*
   * ADMIN receives financial fields.
   * STAFF receives operational fields only.
   */
  const saleFields =
    role === "ADMIN"
      ? "_id productName productSku quantity salePrice purchasePriceAtSale status soldBy createdAt"
      : "_id productName productSku quantity status soldBy createdAt";

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
    const baseSale = {
      id: sale._id.toString(),

      productName: sale.productName,

      productSku: sale.productSku,

      quantity: sale.quantity,

      status: sale.status,

      soldByName:
        sellerMap.get(
          sale.soldBy.toString()
        ) ?? "Unknown user",

      createdAt:
        sale.createdAt.toISOString(),
    };

    /*
     * STAFF: no revenue, cost or profit.
     */
    if (role !== "ADMIN") {
      return {
        ...baseSale,
        canViewFinancials: false as const,
      };
    }

    /*
     * ADMIN: financial information.
     */
    const revenue =
      sale.salePrice! * sale.quantity;

    const cost =
      sale.purchasePriceAtSale! *
      sale.quantity;

    const profit = revenue - cost;

    return {
      ...baseSale,

      revenue,
      cost,
      profit,

      canViewFinancials: true as const,
    };
  });
}