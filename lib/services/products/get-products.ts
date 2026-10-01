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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getProducts({
  search = "",
  category = "",
  stock = "all",
}: GetProductsOptions = {}) {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const trimmedSearch = search.trim();
  const trimmedCategory = category.trim();

  const query: Record<string, unknown> = {
    organizationId,
    isActive: true,
  };

  if (trimmedSearch) {
    const safeSearch =
      escapeRegex(trimmedSearch);

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
    ];
  }

  if (trimmedCategory) {
    query.category = trimmedCategory;
  }

  if (stock === "out-of-stock") {
    query.stockQuantity = 0;
  }

  if (stock === "in-stock") {
    query.stockQuantity = {
      $gt: 0,
    };
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const serializedProducts = products.map(
    (product) => ({
      id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold:
        product.lowStockThreshold,
    })
  );

  if (stock === "low-stock") {
    return serializedProducts.filter(
      (product) =>
        product.stockQuantity > 0 &&
        product.stockQuantity <=
          product.lowStockThreshold
    );
  }

  if (stock === "in-stock") {
    return serializedProducts.filter(
      (product) =>
        product.stockQuantity >
        product.lowStockThreshold
    );
  }

  return serializedProducts;
}