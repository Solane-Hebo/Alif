import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function getInventory() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  await connectToDatabase();

  /*
   * STAFF must never receive purchase-price
   * information.
   *
   * ADMIN needs purchasePrice to calculate
   * inventory value.
   */
  const productFields =
    role === "ADMIN"
      ? "_id name sku barcode stockQuantity lowStockThreshold purchasePrice"
      : "_id name sku barcode stockQuantity lowStockThreshold";

  const products = await Product.find({
    organizationId,
    isActive: true,
  })
    .select(productFields)
    .sort({ name: 1 })
    .lean();

  return products.map((product) => {
    const baseProduct = {
      id: product._id.toString(),

      name: product.name,

      sku: product.sku,

      barcode:
        product.barcode ?? "",

      stockQuantity:
        product.stockQuantity,

      lowStockThreshold:
        product.lowStockThreshold,

      status:
        product.stockQuantity === 0
          ? ("OUT_OF_STOCK" as const)
          : product.stockQuantity <=
              product.lowStockThreshold
            ? ("LOW_STOCK" as const)
            : ("IN_STOCK" as const),
    };

    /*
     * STAFF receives operational inventory
     * information only.
     */
    if (role !== "ADMIN") {
      return {
        ...baseProduct,
        canViewFinancials: false as const,
      };
    }

    /*
     * ADMIN-only financial calculation.
     */
    const purchasePrice =
      product.purchasePrice!;

    const inventoryValue =
      purchasePrice *
      product.stockQuantity;

    return {
      ...baseProduct,

      canViewFinancials: true as const,

      inventoryValue,
    };
  });
}