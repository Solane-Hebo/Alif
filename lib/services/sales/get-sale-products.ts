import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function getSaleProducts() {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const products = await Product.find({
    organizationId,
    isActive: true,
    stockQuantity: { $gt: 0 },
  })
    .select(
      "_id name sku sellingPrice stockQuantity"
    )
    .sort({ name: 1 })
    .lean();

  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    sellingPrice: product.sellingPrice,
    stockQuantity: product.stockQuantity,
  }));
}