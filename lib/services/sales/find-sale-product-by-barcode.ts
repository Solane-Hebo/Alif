import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function findSaleProductByBarcode(
  barcodeInput: string
) {
  const { organizationId } =
    await getTenantContext();

  const barcode = barcodeInput.trim();

  if (!barcode || barcode.length > 64) {
    return null;
  }

  await connectToDatabase();

  const product = await Product.findOne({
    organizationId,
    barcode,
    isActive: true,
  })
    .select(
      "_id name sku barcode stockQuantity sellingPrice"
    )
    .lean();

  if (!product) {
    return null;
  }

  return {
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    barcode: product.barcode ?? "",
    stockQuantity: product.stockQuantity,
    sellingPrice: product.sellingPrice,
  };
}