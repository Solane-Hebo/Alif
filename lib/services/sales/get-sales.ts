import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Sale } from "@/lib/models/sale.model";
import { User } from "@/lib/models/user.model";

export async function getSales() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  await connectToDatabase();

  /*
   * STAFF does not need access to the
   * purchase-price snapshot.
   *
   * We therefore do not even select it
   * from MongoDB for STAFF.
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
    .limit(100)
    .lean();

  const sellerIds = [
    ...new Set(
      sales.map((sale) =>
        sale.soldBy.toString()
      )
    ),
  ];

  const sellers = await User.find({
    _id: {
      $in: sellerIds,
    },
    organizationId,
  })
    .select("_id name")
    .lean();

  const sellerMap = new Map(
    sellers.map((seller) => [
      seller._id.toString(),
      seller.name,
    ])
  );

  return sales.map((sale) => {
    const revenue =
      sale.salePrice * sale.quantity;

    const baseSale = {
      id: sale._id.toString(),

      productName:
        sale.productName,

      productSku:
        sale.productSku,

      quantity:
        sale.quantity,

      salePrice:
        sale.salePrice,

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
     * STAFF receives operational sales
     * information only.
     */
    if (role !== "ADMIN") {
      return {
        ...baseSale,
        canViewFinancials: false as const,
      };
    }

    /*
     * This branch is ADMIN-only.
     *
     * purchasePriceAtSale was selected
     * above for ADMIN.
     */
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

      purchasePriceAtSale,

      cost,

      profit,
    };
  });
}