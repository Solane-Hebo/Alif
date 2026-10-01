import Link from "next/link";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductActions } from "@/components/products/product-actions";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";

import { getProducts } from "@/lib/services/products/get-products";
import { formatMoney } from "@/lib/utils/money";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const search =
    typeof params.q === "string"
      ? params.q
      : "";

  const category =
    typeof params.category === "string"
      ? params.category
      : "";

  const stock =
    params.stock === "in-stock" ||
    params.stock === "low-stock" ||
    params.stock === "out-of-stock"
      ? params.stock
      : "all";

  const user = await requireUser();

  const products = await getProducts({
    search,
    category,
    stock,
  });

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    stock !== "all";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your products, prices and stock.
          </p>
        </div>

        {/* Add product */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add product
            </h2>

            <ProductForm />
          </CardContent>
        </Card>

        {/* Product list */}
        <section
          className="space-y-4"
          aria-labelledby="products-heading"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h2
                id="products-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Product list
              </h2>

              <p className="text-sm text-slate-500">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            {/* Search and filters */}
            <form
              action="/products"
              method="get"
              role="search"
              className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_160px_auto_auto]"
            >
              {/* Search */}
              <div>
                <label
                  htmlFor="product-search"
                  className="sr-only"
                >
                  Search products
                </label>

                <input
                  id="product-search"
                  name="q"
                  type="search"
                  defaultValue={search}
                  placeholder="Search name or SKU..."
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category-filter"
                  className="sr-only"
                >
                  Filter by category
                </label>

                <input
                  id="category-filter"
                  name="category"
                  type="text"
                  defaultValue={category}
                  placeholder="Category"
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              {/* Stock */}
              <div>
                <label
                  htmlFor="stock-filter"
                  className="sr-only"
                >
                  Filter by stock status
                </label>

                <select
                  id="stock-filter"
                  name="stock"
                  defaultValue={stock}
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="all">
                    All stock
                  </option>

                  <option value="in-stock">
                    In stock
                  </option>

                  <option value="low-stock">
                    Low stock
                  </option>

                  <option value="out-of-stock">
                    Out of stock
                  </option>
                </select>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Search
              </button>

              {/* Clear filters */}
              <Link
                href="/products"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Clear
              </Link>
            </form>
          </div>

          {/* Products table */}
          {/* Desktop products table */}
         <div className="hidden overflow-x-auto rounded-xl border bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold"
                  >
                    Product
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold"
                  >
                    SKU
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 font-semibold"
                  >
                    Category
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Purchase
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Selling
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Stock
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    {/* Product */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3 text-slate-600">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-slate-600">
                      {product.category || "—"}
                    </td>

                    {/* Purchase price */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatMoney(
                        product.purchasePrice
                      )}
                    </td>

                    {/* Selling price */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatMoney(
                        product.sellingPrice
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">
                          {product.stockQuantity}
                        </span>

                        {product.stockQuantity ===
                        0 ? (
                          <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Out of stock
                          </span>
                        ) : product.stockQuantity <=
                          product.lowStockThreshold ? (
                          <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Low stock
                          </span>
                        ) : (
                          <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            In stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                     {user.role === "ADMIN" ? (
  <ProductActions
    product={product}
  />
) : (
  <span className="text-xs text-slate-400">
    —
  </span>
)}
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {hasFilters
                        ? "No products match the selected filters."
                        : "No products yet. Add your first product above."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {/* Mobile product cards */}
<div className="grid gap-3 md:hidden">
  {products.map((product) => (
    <article
      key={product.id}
      className="rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            SKU: {product.sku}
          </p>
        </div>

        {product.stockQuantity === 0 ? (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            Out of stock
          </span>
        ) : product.stockQuantity <=
          product.lowStockThreshold ? (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            Low stock
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            In stock
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">
            Category
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {product.category || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">
            Stock
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {product.stockQuantity}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">
            Purchase
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {formatMoney(product.purchasePrice)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">
            Selling
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {formatMoney(product.sellingPrice)}
          </dd>
        </div>
      </dl>

      {user.role === "ADMIN" ? (
  <div className="mt-4 border-t pt-3">
    <ProductActions product={product} />
  </div>
) : null}
    </article>
  ))}

  {products.length === 0 ? (
    <div className="rounded-xl border bg-white px-4 py-10 text-center text-sm text-slate-500">
      {hasFilters
        ? "No products match the selected filters."
        : "No products yet. Add your first product above."}
    </div>
  ) : null}
</div>
        </section>
      </div>
    </DashboardLayout>
  );
}