import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function getProducts() {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const products = await Product.find({
    organizationId,
    isActive: true,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    category: product.category,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    stockQuantity: product.stockQuantity,
    lowStockThreshold:
      product.lowStockThreshold,
    description: product.description,  
  }));
}