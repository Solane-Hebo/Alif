import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

const LOW_STOCK_LIMIT = 5;

export async function getLowStockProducts() {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const products = await Product.find({
    organizationId,
    isActive: true,

    $expr: {
      $lte: [
        "$stockQuantity",
        "$lowStockThreshold",
      ],
    },
  })
    .select(
      "_id name sku stockQuantity lowStockThreshold"
    )
    .sort({
      stockQuantity: 1,
      name: 1,
    })
    .limit(LOW_STOCK_LIMIT)
    .lean();

  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    stockQuantity:
      product.stockQuantity,
    lowStockThreshold:
      product.lowStockThreshold,
  }));
}