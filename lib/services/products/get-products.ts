import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { getTenantContext } from "@/lib/auth/tenant";
import { Product } from "@/lib/models/product.model";

export type ProductStockFilter =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

type GetProductsOptions = {
  search?: string;
  category?: string;
  stock?: ProductStockFilter;
};

/**
 * Escape special regex characters so search input
 * is treated as literal text.
 */
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getProducts({
  search = "",
  category = "",
  stock = "all",
}: GetProductsOptions = {}) {
  // Always derive tenant and role from the authenticated user.
  const { organizationId, role } =
    await getTenantContext();

  await connectToDatabase();

  const trimmedSearch = search.trim();
  const trimmedCategory = category.trim();

  // Every query must be scoped to the current organization.
  const query: Record<string, unknown> = {
    organizationId,
    isActive: true,
  };

  // Search by name, SKU or barcode.
  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);

    query.$or = [
      {
        name: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        barcode: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  // Filter by category.
  if (trimmedCategory) {
    query.category = trimmedCategory;
  }

  // Stock status filters.
  if (stock === "out-of-stock") {
    query.stockQuantity = 0;
  }

  if (stock === "low-stock") {
    query.stockQuantity = { $gt: 0 };

    query.$expr = {
      $lte: [
        "$stockQuantity",
        "$lowStockThreshold",
      ],
    };
  }

  if (stock === "in-stock") {
    query.$expr = {
      $gt: [
        "$stockQuantity",
        "$lowStockThreshold",
      ],
    };
  }

  // STAFF must never receive purchase prices.
  const productFields =
    role === "ADMIN"
      ? "_id name sku barcode category description purchasePrice sellingPrice stockQuantity lowStockThreshold"
      : "_id name sku barcode category description sellingPrice stockQuantity lowStockThreshold";

  const products = await Product.find(query)
    .select(productFields)
    .sort({ createdAt: -1 })
    .lean();

  // Return plain serializable objects.
  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    barcode: product.barcode ?? "",
    category: product.category,
    description: product.description,
    sellingPrice: product.sellingPrice,
    stockQuantity: product.stockQuantity,
    lowStockThreshold:
      product.lowStockThreshold,

    ...(role === "ADMIN"
      ? {
          purchasePrice: product.purchasePrice,
        }
      : {}),
  }));
}