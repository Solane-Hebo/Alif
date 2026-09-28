import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent } from "@/components/ui/card";

import { getProducts } from "@/lib/services/products/get-products";
import { formatMoney } from "@/lib/utils/money";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your products, prices and stock.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Add product
            </h2>

            <ProductForm />
          </CardContent>
        </Card>

        <section
          className="space-y-4"
          aria-labelledby="products-heading"
        >
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

          <div className="overflow-x-auto rounded-xl border bg-white">
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
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {product.sku}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {product.category || "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(
                        product.purchasePrice
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(
                        product.sellingPrice
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {product.stockQuantity}
                    </td>
                  </tr>
                ))}

                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No products yet. Add your first
                      product above.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}