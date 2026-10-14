import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function findProductByBarcode(
  barcodeInput: string
) {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  const barcode = barcodeInput.trim();

  if (!barcode || barcode.length > 64) {
    return null;
  }

  await connectToDatabase();

  const productFields =
    role === "ADMIN"
      ? "_id name sku barcode stockQuantity purchasePrice sellingPrice"
      : "_id name sku barcode stockQuantity sellingPrice";

  const product = await Product.findOne({
    organizationId,
    barcode,
    isActive: true,
  })
    .select(productFields)
    .lean();

  if (!product) {
    return null;
  }

  const baseProduct = {
    id: product._id.toString(),

    name: product.name,

    sku: product.sku,

    barcode:
      product.barcode ?? "",

    stockQuantity:
      product.stockQuantity,

    sellingPrice:
      product.sellingPrice,
  };

  if (role !== "ADMIN") {
    return {
      ...baseProduct,
      canViewFinancials: false as const,
    };
  }

  return {
    ...baseProduct,

    purchasePrice:
      product.purchasePrice!,

    canViewFinancials: true as const,
  };
}